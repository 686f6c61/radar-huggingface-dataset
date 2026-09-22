# opensporks/hotdog-27B

## Resumen
Hotdog-27B es un clasificador binario abierto publicado por el usuario opensporks. No es un modelo generativo: se construye sobre el backbone denso Qwen3.8-27B mediante un adaptador LoRA de rango 16 entrenado con Tinker, y responde a pares de texto más pregunta de sí/no devolviendo una probabilidad y una decisión. La clasificación se obtiene leyendo los logits de los tokens `A = false` y `B = true` en una misma posición, sin generar cadena de razonamiento.

El interés técnico está en el protocolo de lectura y en la calibración declarada, no en la generación: en el test independiente de 1.631 decisiones alcanza un 98,28 % de acierto y un Brier escalar de 0,013175, con un ECE del 0,58 % frente al 6,40 % de su comparador Jev 1.13.0. Es, por tanto, una propuesta de clasificación binaria de alta precisión y baja latencia conceptual, apoyada en un backbone de 27B.

La relevancia práctica es doble: demuestra que un adaptador pequeño y barato de entrenar puede superar a un sistema especializado en una mezcla de test concreta, y documenta con detalle hashes, composición de datos y limitaciones. La contrapartida es que no es un adaptador PEFT directamente cargable y exige el merger oficial de Tinker y una GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer denso Qwen3.8-27B con adaptador LoRA de rango 16. El cargador menciona layouts Q/K/V de atención lineal, lo que implica capas de atención lineal en el backbone |
| Parametros totales | 27B en el backbone (denso). El adaptador ocupa unos 483 MB; su número exacto de parámetros no está disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8.192 tokens de entrada; el cargador rechaza entradas más largas en lugar de truncarlas. La ventana nativa del backbone no está disponible |
| Tipos de cuantizacion | No disponible. No se publican versiones cuantizadas. La evaluación medida usa BF16 eager para el backbone y lectura en FP32 de los dos tokens |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato Tinker sin modificar (no es un adaptador PEFT cargable de forma directa) |

## Arquitectura y entrenamiento
El sistema es una cabeza de clasificación binaria implementada como adaptador LoRA de rango 16 sobre Qwen3.8-27B denso. En lugar de generar texto, el modelo evalúa simultáneamente los logits de los tokens que representan `A = false` y `B = true` en la misma posición, con temperatura fija de 1,0 y umbral de decisión en 0,5. La inferencia medida es singleton, en modo eager BF16, con la lectura de dos tokens en FP32. El README advierte que la distribución de probabilidades cambia si se alteran la precisión, el batching, los kernels de atención o el propio método de lectura, y que los pipelines estándar de generación de texto no reproducen este protocolo.

El entrenamiento usa las pérdidas multiobjetivo de Tinker (BCE personalizada, Brier escalar y una pérdida combinada). La búsqueda cubrió 16 recetas en `configs/`, con 661 pasos de optimizador y 51.840 exposiciones de ejemplo. La ascendencia del modelo seleccionado consumió 13.017 filas distintas y 16.384 exposiciones: una ejecución fresca sobre el 27B seguida del paso 96 de una continuación de baja tasa de aprendizaje. La selección se hizo por el Brier de desarrollo más bajo entre los candidatos situados a menos de un punto porcentual de la mejor exactitud de desarrollo (conjunto de desarrollo de 1.468 decisiones). No se aplicó calibración ajustada. Los datos combinan ejemplos naturales públicos de la partición de entrenamiento fijada de Kev, ejemplos generados con OpenAI y auditorías ciegas, y reglas procedurales ejecutables.

## Capacidades
- Clasificación binaria de texto: dado un texto y una pregunta de sí/no, devuelve probabilidad y decisión.
- Lectura directa de logits en una posición fija de token, sin generación de razonamiento ni texto libre.
- Salida probabilística calibrada: en el test independiente, ECE del 0,58 % y Brier escalar de 0,013175.
- Evaluación de reglas verificables sobre texto estructurado (el ejemplo del cargador comprueba si el peso de un paquete supera 7 kg).
- Entrada limitada a 8.192 tokens, con rechazo explícito de entradas mayores y sin truncado silencioso.
- Únicamente inglés.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de pensamiento.
- Funciona como adaptador dependiente del backbone: no es un modelo autónomo ni un adaptador PEFT estándar.

## Casos de uso
- Triaje de tickets de soporte: clasificar si una incidencia requiere escalado a segundo nivel mediante una pregunta binaria del tipo "¿requiere intervención humana inmediata?", aprovechando la calibración baja en ECE para fijar umbrales operativos.
- Moderación de contenido binaria: decidir si un texto incumple una política concreta, usando la probabilidad devuelta para ordenar la cola de revisión humana en lugar de para bloquear automáticamente.
- Verificación de reglas de negocio sobre documentos: comprobar condiciones del tipo "¿el peso declarado supera los 7 kg?" o "¿el importe excede el límite?" en facturas, albaranes o formularios.
- Enrutamiento en pipelines RAG: determinar si una consulta es respondible con la documentación indexada antes de invocar un modelo generativo, reduciendo coste y latencia del sistema completo.
- Curación y filtrado de datasets: etiquetar pares texto-pregunta a gran escala para construir conjuntos de evaluación o descartar ejemplos de baja calidad, dado el bajo coste del adaptador (483 MB) frente al backbone.
- Preanotación para anotación humana: generar una primera etiqueta probabilística y derivar a revisión solo los casos cercanos al umbral, reduciendo el volumen de trabajo manual.
- Auditoría de cumplimiento: clasificar textos contractuales o comunicaciones frente a criterios normativos concretos, registrando la probabilidad como evidencia auditable.
- Detección de duplicados o equivalencia semántica: formular "¿ambos fragmentos expresan la misma afirmación?" como pregunta binaria para deduplicar corpus.

## Benchmarks y rendimiento

Exactitud declarada frente a Jev 1.13.0, con intervalos de confianza pareados al 95 % (10.000 réplicas de bootstrap por clusters):

| Evaluacion | hotdog-27B | Jev | Diferencia de exactitud, IC 95 % pareado |
|---|---|---|---|
| Test independiente, 1.631 decisiones / 1.002 grupos | 1.603/1.631 (98,28 %) | 1.587/1.631 (97,30 %) | +0,98 pp [+0,19; +1,79] |
| JevBench público de texto, 74 decisiones nativas binarias / 62 grupos | 60/74 (81,08 %) | 62/74 (83,78 %) | −2,70 pp [−12,20; +5,63] |

Calibración:

| Evaluacion | Brier escalar propio ↓ | Brier escalar de Jev ↓ | ECE propio ↓ | ECE de Jev ↓ |
|---|---|---|---|---|
| Test independiente | 0,013175 | 0,026884 | 0,58 % | 6,40 % |
| JevBench público nativo binario | 0,125090 | 0,106305 | 11,95 % | 6,54 % |

Notas declaradas por el autor: el modelo supera a Jev en el test independiente, pero no se establece una victoria en JevBench. Las 74 decisiones cubren solo el subconjunto nativo binario del repositorio público de JevBench, no su puntuación compuesta completa, sus tests privados ni el benchmark interactivo de agentes de jevbench.dev. El test independiente usa documentos y grupos de escenario disjuntos, pero comparte datasets fuente con el entrenamiento. La latencia no se compara porque los transportes de servicio difieren.

## Requisitos de hardware
- VRAM estimada (estimaciones derivadas del tamaño del backbone, no publicadas por el autor): en BF16, unos 54 GB solo para los pesos de 27B, más activaciones y espacio de trabajo para fusionar el adaptador.
- El despliegue evaluado por el autor usó una H200. El README indica que hace falta una máquina Linux con CUDA y memoria suficiente para el backbone denso de 27B y el espacio de fusión; descargar y cargar la base requiere decenas de GB adicionales.
- GPU recomendadas: H200 (la medida), y por capacidad de memoria, A100 80 GB o H100 80 GB como alternativas razonables dentro de la misma clase. No hay datos publicados de rendimiento en estas alternativas.
- GPU de consumo: no cabe en soluciones de 24 GB en BF16. Cualquier despliegue en 4 bits sería una estimación teórica (en torno a 14-16 GB) sin soporte publicado ni validación del protocolo de lectura.
- Opciones de despliegue: no es compatible de serie con vLLM, llama.cpp, Ollama ni TGI. Requiere el cargador de `tinker-binary` y el merger oficial de Tinker, porque los layouts Q/K/V de atención lineal impiden cargarlo como adaptador PEFT directo.
- Latencia y throughput: no disponibles. El autor declara explícitamente que no compara latencia por diferencias en el transporte de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hotdog-27B | 27B densos + LoRA rango 16 | 8.192 tokens de entrada | 98,28 % en test independiente; 81,08 % en JevBench nativo binario | Apache-2.0 | Pesos del adaptador en HuggingFace (483 MB) más backbone |
| Jev 1.13.0 | No disponible | No disponible | 97,30 % en test independiente; 83,78 % en JevBench nativo binario | No disponible | Comparador externo, no alojado en el repo |
| Qwen3.8-27B (prompting zero-shot) | 27B densos | El del backbone (no disponible en la información) | No disponible: no se publican resultados con este enfoque | La del modelo base | Modelo base público |

La información disponible no permite comparar con otras alternativas de clasificación binaria de la misma categoría.

## Limitaciones y advertencias
- No genera texto ni razonamiento: es exclusivamente un clasificador binario de sí/no. No sirve para resúmenes, redacción ni diálogo.
- No es un adaptador PEFT cargable directamente. Los layouts Q/K/V de atención lineal exigen el merger oficial de Tinker; sin él, la carga falla.
- El protocolo de scoring no se reproduce con pipelines estándar de generación de texto. Cambiar la precisión, el batching, los kernels de atención o el método de lectura altera las probabilidades.
- Calibración desigual: excelente en el test independiente (ECE 0,58 %) pero peor que el comparador en JevBench (ECE 11,95 % frente a 6,54 %), con una estimación basada en solo 74 decisiones y por tanto ruidosa.
- Riesgo de sobreajuste al dominio de test: el test independiente comparte datasets fuente con el entrenamiento, aunque use documentos y grupos disjuntos. El propio autor lo señala.
- Contaminación no certificable: el preentrenamiento del backbone y del teacher es desconocido y hay datos de benchmarks privados no disponibles.
- Solo inglés.
- Límite duro de 8.192 tokens de entrada, con rechazo de entradas mayores. No hay truncado silencioso ni ventana ampliable documentada.
- Datos de entrenamiento, desarrollo y test no incluidos en la distribución. Los datasets fuente tienen licencias mixtas, incluidos términos desconocidos o sin especificar; la licencia Apache-2.0 cubre el modelo, no necesariamente los datos subyacentes.
- El repositorio declara `inference: false`: el hub no ofrece inferencia gestionada.
- Adopción nula en el momento de la ficha (0 descargas, 0 likes) y publicación reciente (22 de septiembre de 2026), sin validación independiente por terceros.
- No hay evidencia de portabilidad más allá del `inference-parity.json`, que registra coincidencia exacta con el backend congelado en tres entradas sintéticas nuevas; eso valida el cargador, no exactitud adicional.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/opensporks/hotdog-27B
- Código de entrenamiento: https://github.com/mrmps/tinker-binary
- Resultados de benchmark: results.json (referenciado en el repositorio del modelo)
- Protocolo y procedencia: reproducibility.json (referenciado en el repositorio del modelo)
- Evidencia de portabilidad en GPU: inference-parity.json (referenciado en el repositorio del modelo)
- JevBench público: https://github.com/fstandhartinger/jevbench
- Tinker cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Benchmark interactivo de agentes: jevbench.dev
- Búsqueda web: el único resultado devuelto fue web.whatsapp.com, sin relación con el modelo, por lo que no se incorpora ninguna fuente adicional.
