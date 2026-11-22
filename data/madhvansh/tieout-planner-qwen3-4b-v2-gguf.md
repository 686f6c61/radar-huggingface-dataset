# Madhvansh/tieout-planner-qwen3-4b-v2-gguf

## Resumen

tieout-planner-qwen3-4b-v2-gguf es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (4.022 millones de parámetros, licencia Apache-2.0) desarrollado por el usuario Madhvansh. Su función no es responder preguntas en lenguaje natural, sino convertir una pregunta sobre los informes SEC de una empresa cotizada estadounidense en un plan de consulta tipado (JSON) para el grafo de conocimiento TieOut. El modelo nunca enuncia una cifra: todos los números de una respuesta provienen del grafo, que reconstruye las fórmulas con las que se calcularon en los filings y verifica cada valor contra ellas.

Dentro de la arquitectura TieOut, este modelo desempeña dos papeles: actúa como enlazador local (elige una línea de un informe entre candidatos etiquetados) y como segundo lector independiente que planifica cada pregunta junto al planificador alojado en la nube; también puede planificar en solitario sin ninguna clave de API. El resultado es un planificador de 4B parámetros que cabe en CPU y que sirve como componente de verificación cruzada en un sistema de análisis financiero.

La relevancia del modelo es acotada pero clara: demuestra que una tarea de parsing semántico muy estructurada, con un vocabulario cerrado (40 empresas, 47 conceptos, 17 métricas), puede resolverse con un modelo pequeño cuantizado a Q4_K_M (2,5 GB) y ejecutarse en local con Ollama, sin depender de modelos alojados de gran tamaño. No es un modelo de propósito general: es un componente especializado de un pipeline concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con adaptador LoRA fusionado |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en el Modelfile; TieOut envía num_ctx 8192 en tiempo de ejecución |
| Tipos de cuantización | Q4_K_M (único archivo publicado: `planner4b-q4_k_m.gguf`, 2.497.278.912 bytes) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); el adaptador LoRA se fusionó y convirtió con llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parámetros, sobre el que se aplica un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05 sobre todas las proyecciones de atención y MLP. El entrenamiento consistió en una época con tasa de aprendizaje 2e-4, schedule coseno con 5 % de warm-up y pérdida calculada únicamente sobre los tokens del plan. El prompt de sistema compartido se ejecuta una vez por paso como prefijo cacheado. Se usaron transformers y peft estándar, con hardware Colab L4 en bf16, micro-batch 2 con acumulación 8: 563 pasos, 28,96 minutos de entrenamiento y pérdida final de 0,0033. Posteriormente el adaptador se fusionó, se convirtió a GGUF con llama.cpp y se cuantizó a Q4_K_M.

Los datos de entrenamiento son 9.000 pares (pregunta, plan) generados sintéticamente por `finetune/make_data.py` a partir del propio vocabulario del grafo: 40 empresas y sus nombres comunes, 47 conceptos compartidos, 17 métricas, atributos de texto y las etiquetas de segmento, producto y región que imprimen los informes y que las fórmulas recuperadas del grafo vinculan a ingresos o resultado operativo. Cada plan se muestrea primero (válido por construcción, verificado con `tieout.plan.validate`) y después se verbaliza con una plantilla y variantes de denominación de empresa, medida y periodo. La validación usa 600 pares cuyas plantillas y formulaciones nunca aparecen en entrenamiento. No se incluye ninguna pregunta de benchmark, pregunta reservada ni valor de respuesta en los datos. El plan se expresa en el lenguaje de planes de TieOut (ejemplo en la model card: pasos `members`, `rank` y `get` con campos `company`, `period`, `order` y `k`).

## Capacidades

- Generación de planes de consulta tipados en JSON para el lenguaje de planes de TieOut (operaciones como `members`, `rank`, `get`).
- Parsing semántico de preguntas financieras sobre informes SEC de empresas cotizadas estadounidenses.
- Enlazado local: selección de una línea de informe entre candidatos etiquetados.
- Planificación de preguntas multi-paso (ranking por crecimiento, filtrado por segmento, recuperación de métricas por periodo fiscal).
- Salida JSON válida de forma consistente (100,0 % en el conjunto sintético reservado).
- Ejecución en CPU mediante Ollama, con temperatura 0 para decodificación voraz.
- No soporta tool calling genérico, agentes abiertos, visión, audio ni modo thinking; su ámbito es exclusivamente el grafo TieOut.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de informes SEC en local: el modelo traduce preguntas como "¿qué segmento de Microsoft creció más en ingresos en el ejercicio 2025?" a un plan que el grafo ejecuta, de modo que toda cifra queda verificada contra las fórmulas recuperadas del filing.
- Componente de verificación cruzada: en TieOut actúa como segundo lector independiente que planifica cada pregunta en paralelo al planificador alojado, y un árbitro resuelve discrepancias; adecuado para pipelines donde se exige doble comprobación de la interpretación de la pregunta.
- Despliegue sin clave de API: al caber en CPU con Ollama (`num_gpu 0`), permite planificar preguntas sin depender de servicios externos, útil en entornos con restricciones de red o de coste.
- Enlazado de líneas de informe: dado un conjunto de candidatos etiquetados extraídos de un filing, el modelo elige la línea correcta para una métrica y periodo concretos, integrándose en el proceso de extracción de TieOut.
- Automatización de preguntas repetitivas de analistas: consultas de crecimiento por segmento, producto o región sobre las 40 empresas cubiertas, con planes deterministas (temperatura 0) reproducibles en pipelines de CI.
- Generación de datos de evaluación para otros grafos: el código de `make_data.py` y el esquema de planes sirven de plantilla para regenerar el conjunto de entrenamiento sobre otro corpus con vocabulario cerrado.
- Prototipado de asistentes financieros con trazabilidad: al no emitir cifras propias, encaja en interfaces donde cada número debe citar su origen en el grafo.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Coincidencia exacta de plan (sintético, 600 formulaciones reservadas) | 88,2 % |
| JSON válido (mismo conjunto) | 100,0 % |
| Preguntas de desarrollo escritas por personas (rondas 1 a 6 de TieOut) | en medición según la model card; cifras no publicadas |
| Reproducibilidad entre entornos | mismo plan en 72 de 87 preguntas al replicar en CPU de Kaggle con Ollama 0.30.5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 2,5 GB para el archivo Q4_K_M; la inferencia puede ejecutarse íntegramente en CPU (`num_gpu 0`).
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una Colab L4 (24 GB) en bf16, pero la inferencia cuantizada no requiere GPU.
- Cabe en cualquier GPU consumer con 4 GB o más de VRAM; también en equipos sin GPU.
- Opciones de despliegue: Ollama (vía `Modelfile` incluido, con plantilla de chat, prompt de sistema y temperatura 0) y llama.cpp para el GGUF; no se documentan vLLM ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento completo requirió 28,96 minutos en L4, dato no extrapolable a inferencia.
- Contexto en ejecución: TieOut envía `num_ctx 8192`, aunque el Modelfile declara 4096.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tieout-planner-qwen3-4b-v2-gguf | 4.022 M | 4.096–8.192 | Planes de consulta para grafo TieOut (40 empresas SEC) | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.022 M | no disponible en la información | Propósito general, instruct | Apache-2.0 | Hugging Face |
| Modelos alojados de gran tamaño usados por TieOut como planificador principal | no disponible | no disponible | Planificación general | no disponible | Servicio alojado |

La comparación con alternativas de la misma categoría (planificadores text-to-query para grafos financieros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento restringido a las 40 empresas y al vocabulario del grafo TieOut; para otro corpus es necesario regenerar los datos desde ese grafo.
- Entrenado sobre formulaciones generadas: las preguntas largas o inusuales de analistas son más difíciles para él que para modelos alojados grandes, motivo por el que TieOut usa dos lectores independientes y un árbitro.
- Los planes pueden diferir entre CPUs u versiones de Ollama: con decodificación voraz, el mismo GGUF reprodujo el plan del portátil en 72 de 87 preguntas al replicarse en otra CPU con la misma versión de Ollama (0.30.5).
- Solo inglés; sin capacidades multilingües.
- No emite cifras por diseño; cualquier uso que espere respuestas numéricas directas del modelo es incorrecto.
- Riesgo de alucinación acotado por el esquema JSON y la validación del grafo, pero no eliminado: un plan válido sintácticamente puede interpretar mal la pregunta.
- Sin datos publicados sobre sesgos; el corpus son informes SEC de empresas estadounidenses, con el sesgo de cobertura que ello implica.
- Licencia Apache-2.0, que permite uso comercial; el modelo base Qwen3-4B-Instruct-2507 también es Apache-2.0 según la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación de la comunidad ni resultados de las preguntas de desarrollo publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhvansh/tieout-planner-qwen3-4b-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto TieOut: https://github.com/Madhvansh/tieout
- Lenguaje de planes de TieOut: `benchmark/plan_language.txt` en el repositorio del proyecto
