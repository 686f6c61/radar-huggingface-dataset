# Madhvansh/tieout-planner-qwen3-1.7b-v2-gguf

## Resumen

tieout-planner-qwen3-1.7b-v2-gguf es un modelo de 1.720.574.976 parámetros (1,7B) derivado de Qwen/Qwen3-1.7B mediante un ajuste fino con LoRA, desarrollado por Madhvansh. Su función no es generar lenguaje libre, sino convertir preguntas sobre los informes SEC (Securities and Exchange Commission) de empresas cotizadas estadounidenses en planes de consulta tipados para el grafo de conocimiento TieOut. El modelo nunca enuncia una cifra: todos los números de una respuesta provienen del grafo, que recupera las fórmulas con las que se calcularon los datos en los informes y valida cada valor contra ellas.

El modelo se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M (1.107.408.736 bytes), pensado para ejecutarse en CPU mediante Ollama. Actúa como planificador por defecto de TieOut cuando no se configura una clave de API (`ollama:tieout-planner`). La relevancia actual reside en su enfoque de "text-to-query" restringido a un vocabulario cerrado: en lugar de responder directamente, produce un plan JSON validable, lo que reduce la alucinación numérica en dominios financieros donde la exactitud es crítica.

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso, sobre el que se aplica un LoRA de rango 16. El contexto operativo configurado en el Modelfile es de 4096 tokens (`num_ctx 4096`), aunque TieOut envía `num_ctx 8192` en sus llamadas. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el Modelfile; TieOut envía num_ctx 8192 |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (planner-q4_k_m.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1,7B parámetros, y se ajusta mediante LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a todas las proyecciones de atención y MLP. El entrenamiento consistió en una época con tasa de aprendizaje 2e-4, schedule coseno con 5% de warm-up, y cálculo de la pérdida únicamente sobre los tokens del plan (no sobre la pregunta). El system prompt compartido se ejecuta una vez por paso como prefijo cacheado. Se usó transformers + peft, con micro-batch 8 y acumulación 2 (batch efectivo 16) sobre una Kaggle T4 en fp16: 563 pasos, 15,0 minutos de entrenamiento y pérdida final de 0,0005. Posteriormente el adaptador se fusionó, se convirtió a GGUF con llama.cpp y se cuantizó a Q4_K_M.

Los datos de entrenamiento son 9.000 pares (pregunta, plan) generados por `finetune/make_data.py` a partir del propio vocabulario del grafo: 40 empresas y sus nombres comunes, 47 conceptos compartidos, 17 métricas, atributos de texto y las etiquetas de segmento, producto y región que imprimen los informes y que las fórmulas recuperadas del grafo vinculan a ingresos o beneficio operativo. Cada plan se muestrea primero (válido por construcción, verificado por `tieout.plan.validate`) y después se verbaliza con una plantilla y distintas formas de nombrar la empresa, la medida y el periodo. La validación usa 600 pares cuyas plantillas y formulaciones nunca aparecen en entrenamiento. No se incluye ninguna pregunta de benchmark, pregunta reservada ni valor de respuesta en los datos. La innovación técnica principal es la restricción del espacio de salida a un lenguaje de planes formal y validable, con decodificación greedy (temperatura 0) y formato JSON forzado.

## Capacidades

- Generación de planes de consulta tipados (text-to-query) en el lenguaje de planes de TieOut, con operaciones como `members`, `rank` y `get`.
- Análisis semántico restringido al dominio financiero de informes SEC de 40 empresas estadounidenses concretas.
- Salida en JSON válido (100,0% de JSON válido en la medición sintética).
- Razonamiento multi-paso dentro del plan: encadenamiento de pasos con referencias (`$s1`, `$s2`) para filtrar, ordenar y recuperar valores.
- No soporta tool calling genérico ni function calling fuera del esquema de planes de TieOut (no disponible en la información).
- No soporta visión, audio ni modo thinking explícito (no disponible en la información).
- Capacidad multilingüe limitada al inglés.
- Integración nativa con Ollama mediante Modelfile (plantilla de chat, system prompt de entrenamiento, temperatura 0, num_ctx 4096).

## Casos de uso

- Consulta de métricas financieras por segmento: el modelo traduce preguntas como "¿qué segmento de Microsoft creció más en ingresos en el ejercicio 2025?" en un plan que recupera miembros, los ordena por crecimiento y obtiene el valor, evitando que el modelo invente la cifra.
- Automatización de análisis de informes SEC: un analista formula preguntas en lenguaje natural y el plan resultante consulta el grafo, que valida cada número contra las fórmulas recuperadas de los propios informes.
- Planificador por defecto en despliegues de TieOut sin clave de API: al ejecutarse en CPU vía Ollama, permite levantar el sistema completo sin coste de inferencia en la nube.
- Verificación cruzada de respuestas: al ser uno de los dos lectores independientes que planifican cada pregunta en TieOut (con un árbitro que resuelve discrepancias), sirve como segunda opinión frente a modelos alojados de mayor tamaño.
- Generación de consultas auditables: cada respuesta queda respaldada por un plan JSON inspeccionable, útil en entornos donde se exige trazabilidad del dato financiero.
- Prototipado y evaluación de pipelines text-to-query: el par (pregunta, plan) generado sirve como caso de prueba reproducible en el desarrollo de sistemas de parsing semántico sobre grafos de conocimiento.
- Despliegue en hardware modesto: al ocupar ~1,1 GB en Q4_K_M y ejecutarse en CPU (`num_gpu 0`), es adecuado para portátiles y entornos sin GPU.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Coincidencia exacta de plan (sintético) | 83,5% | Sobre 600 formulaciones sintéticas reservadas |
| JSON válido (sintético) | 100,0% | Sobre el mismo conjunto |
| Preguntas de desarrollo (humanos leyendo informes, rondas 1-6) | en medición | Nunca usadas en entrenamiento; cifras pendientes en el README del proyecto |
| Reproducibilidad entre entornos | 72 de 87 preguntas | Mismo GGUF y misma versión de Ollama (0.30.5), replicado de portátil a CPU de Kaggle con decodificación greedy |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el archivo Q4_K_M ocupa 1.107.408.736 bytes (~1,1 GB) y TieOut fuerza `num_gpu 0`.
- GPU recomendadas: no aplica para el uso previsto; cualquier GPU con suficiente memoria podría alojarlo, pero el diseño es CPU-first.
- Cabe en cualquier equipo consumer: CPU convencional es suficiente según el autor.
- Opciones de despliegue: Ollama (vía `ollama create tieout-planner -f Modelfile`), llama.cpp (formato GGUF nativo).
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento (no la inferencia) requirió 15,0 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| tieout-planner-qwen3-1.7b-v2-gguf | 1,7B | 4096 (Modelfile) / 8192 (TieOut) | GGUF Q4_K_M | Apache-2.0 | Text-to-query para grafo financiero |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | safetensors, GGUF | Apache-2.0 | Modelo generalista |
| Modelos alojados de gran tamaño (referenciados por el autor) | no disponible | no disponible | API | no disponible | Planificación general; el autor indica que son más robustos ante preguntas largas o atípicas |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento restringido a las 40 empresas y al vocabulario de este grafo concreto; para otro corpus es necesario regenerar los datos a partir de ese grafo.
- Entrenado sobre formulaciones generadas, por lo que las preguntas largas o atípicas de analistas le resultan más difíciles que a los modelos alojados de gran tamaño; de ahí que TieOut use dos lectores independientes y un árbitro.
- Los planes pueden diferir entre CPUs o versiones de Ollama: con decodificación greedy, el mismo GGUF reprodujo el plan del portátil en 72 de 87 preguntas al replicarse en una CPU de Kaggle con la misma versión de Ollama (0.30.5).
- No enuncia cifras por diseño; cualquier uso fuera del pipeline TieOut que espere respuestas en lenguaje natural no es adecuado.
- Idioma limitado al inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación estructural reducido por el esquema validable, pero no eliminado: un plan válido puede no corresponder a la intención de la pregunta.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-1.7B impone sus propios términos; conviene revisarlos antes de producción.
- Sin datos publicados sobre sesgos; el dominio (informes SEC de empresas estadounidenses) puede heredar sesgos de selección de compañías y métricas del grafo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhvansh/tieout-planner-qwen3-1.7b-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto TieOut: https://github.com/Madhvansh/tieout
