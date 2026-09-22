# OmTheLast/taj-mahal-history-tutor-4b-experimental

## Resumen

Taj Mahal History Tutor 4B es un ajuste fino experimental derivado de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario OmTheLast (identificador OmTheLast/taj-mahal-history-tutor-4b-experimental). No se trata de un modelo de propósito general ni de un tutor de historia india completo: es un piloto en inglés centrado exclusivamente en el Taj Mahal, cuya finalidad declarada es validar una receta de entrenamiento y evaluación antes de abordar un modelo de historia india más amplio. El autor advierte explícitamente de que el checkpoint no ha sido certificado para los planes de estudio NCERT, ICSE o de los consejos estatales indios.

Técnicamente, el modelo se construyó mediante LoRA (rank 16, escala 32, aplicado a las últimas 16 capas) sobre el modelo base y posteriormente se fusionó, de modo que los pesos distribuidos son safetensors estándar de Transformers con 4.022.468.096 parámetros totales. El repositorio ocupa 11,4 GB e incluye además una cuantización GGUF Q6_K para ejecución en llama.cpp. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es doble. Por un lado, documenta con inusual transparencia el compromiso entre mejora del recuerdo factual y degradación del comportamiento con preguntas abiertas reescritas o con instrucciones de responder solo a partir de una nota facilitada. Por otro, sirve como caso de estudio de ajustes pequeños y especializados con pocos datos: el conjunto de entrenamiento contiene únicamente 499 ejemplos y el checkpoint publicado es el paso 100, elegido por pérdida de validación mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507); no se detallan en la model card capas, cabezas ni dimensiones ocultas |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; se hereda la del modelo base Qwen3-4B-Instruct-2507, sin dato confirmado en la informacion disponible |
| Tipos de cuantizacion | GGUF Q6_K y Q4_K_M mencionados en el repositorio; pesos completos en safetensors (se desconoce si hay otras variantes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507 (revision cdbee75f17c01a7cc42f958dc650907174af0554) y aplica un adaptador LoRA con rank 16, escala 32 y alcance limitado a las últimas 16 capas, entrenado con tasa de aprendizaje 2e-5, tamaño de lote 4 y pérdida calculada únicamente sobre los turnos del asistente. El adaptador se fusionó después en los pesos del modelo base, por lo que la distribución resultante no requiere cargar LoRA por separado. El SHA-256 exacto del adaptador y las comprobaciones de exportación están documentados en los ficheros MODEL_PROVENANCE.json y EXPORT_VERIFICATION.json del repositorio.

El conjunto de datos es deliberadamente reducido: 499 ejemplos de entrenamiento y 88 de validación, auditados contra fuentes y repartidos entre arquitectura, construcción, economía, corte y sucesión mogol, conservación y cultura material. El checkpoint publicado corresponde al paso 100, momento en el que el modelo había visto 400 ejemplos únicos una sola vez; se seleccionó por pérdida de validación mínima antes de ejecutar el benchmark de publicación, y los checkpoints posteriores mostraron pérdida de validación creciente y no se publicaron. El autor indica que las preguntas de entrenamiento y los pasajes fuente no se incluyen en el repositorio porque no se establecieron los derechos de redistribución.

## Capacidades

- Generacion de texto conversacional en ingles mediante plantilla de chat (apply_chat_template) y respuesta a preguntas factuales breves sobre el Taj Mahal.
- Cobertura tematica limitada a arquitectura, construccion, economia, corte y sucesion mogol, conservacion y cultura material del Taj Mahal.
- Respuesta en el formato solicitado por el sistema, con instrucciones explicitas de no inventar datos (aunque el autor advierte de incumplimientos).
- Respuesta condicionada a una nota o pasaje suministrado: en el benchmark piloto de 16 preguntas de este tipo obtuvo 12/16, frente a 16/16 del modelo base.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta orientado a preguntas cortas.
- Capacidades multilingues: solo ingles declarado; no hay evidencia de soporte en hindi ni en otras lenguas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ejecucion en runtimes compatibles con GGUF ademas de Transformers.

## Casos de uso

- Prototipado de tutores conversacionales especializados: sirve para validar interfaces y plantillas de chat de un asistente de historia antes de invertir en un modelo de mayor escala, dado que el coste de inferencia de 4B es bajo.
- Investigacion sobre ajuste fino eficiente: permite reproducir un experimento LoRA documentado con hiperparametros concretos (rank 16, escala 32, últimas 16 capas, 2e-5, lote 4) y comparar la evolucion de la perdida de validacion tras el paso 100.
- Estudio del compromiso entre recuerdo factual y adherencia a instrucciones: el benchmark de 96 preguntas muestra una mejora de 50/96 a 60/96 en recuerdo, pero un descenso de 16/16 a 12/16 en respuestas fundamentadas en una nota, un caso util para disenar metricas de regresion.
- Generacion de material didactico preliminar sobre el Taj Mahal: borradores de preguntas y respuestas breves que un docente revisa contra fuentes primarias antes de usarlos en aula.
- Evaluacion de pipelines de cuantizacion GGUF: el repositorio incluye Q6_K y datos de un smoke test comparativo con Q4_K_M (3/8 frente a 1/8 de coincidencia exacta de texto en 8 preguntas), lo que permite medir el impacto de la cuantizacion en la salida.
- Pruebas de integracion con text-generation-inference y endpoints compatibles, ya que el modelo declara la etiqueta text-generation-inference y endpoints_compatible.
- Demostraciones educativas offline en portatiles con GPU de consumo o Apple Silicon, gracias al tamano de 4B y a la disponibilidad de GGUF.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del piloto interno de 96 preguntas sobre el Taj Mahal, evaluados con una rubrica fija por el coordinador del proyecto. El autor advierte de que el benchmark fue inspeccionado durante el desarrollo y no constituye una medida independiente de conocimiento historico general.

| Benchmark (piloto Taj, 96 preguntas) | Modelo base Qwen3-4B-Instruct-2507 | Checkpoint paso 100 |
|---|---|---|
| Total de respuestas correctas | 50/96 | 60/96 |
| Preguntas factuales abiertas, cortas y reformuladas | 10/48 | 22/48 |
| Preguntas que exigen responder solo desde una nota | 16/16 | 12/16 |
| Respuestas que el base acertaba y el ajustado pierde | no aplica | 9 |

Prueba de humo de runtime GGUF sobre 8 preguntas (coincidencia exacta de texto con las respuestas congeladas de la evaluacion MLX, no correccion factual):

| Variante | Coincidencia exacta |
|---|---|
| GGUF precision completa | 3/8 |
| GGUF Q6_K | 3/8 |
| GGUF Q4_K_M | 1/8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 8,1 GB solo para pesos, mas cache KV y activaciones; se recomienda reservar 10-12 GB. Estimacion calculada a partir de los 4.022.468.096 parametros, no medida por el autor.
- VRAM estimada para GGUF Q6_K: aproximadamente 3,3-3,5 GB de pesos, mas cache KV; viable en GPUs de 6-8 GB.
- VRAM estimada para GGUF Q4_K_M: aproximadamente 2,4-2,6 GB de pesos; viable en GPUs de 4-6 GB.
- GPUs recomendadas: para fp16, RTX 4080/4090, A100, H100 o cualquier GPU con 16 GB o mas; para cuantizaciones GGUF, RTX 3060 de 12 GB, RTX 4060 Ti, GPUs integradas de Apple Silicon.
- Cabe en GPU de consumo: si, en fp16 cabe en tarjetas de 12-16 GB y en cuantizacion Q4_K_M o Q6_K en tarjetas de 6-8 GB.
- Opciones de despliegue: Transformers (ejemplo oficial con device_map="auto"), llama.cpp o cualquier runtime compatible con GGUF (llama-cli figura en la model card), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. No se mencionan Ollama ni vLLM de forma explicita.
- Verificacion de exportacion: el export fusionado se recargo en Apple MPS sin pesos faltantes, inesperados ni desajustados, y la plantilla de chat y una sonda determinista coincidieron con la evaluacion en MLX. El autor aclara que es una prueba de humo, no un benchmark completo de cada runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en el piloto Taj | Disponibilidad |
|---|---|---|---|---|---|---|
| OmTheLast/taj-mahal-history-tutor-4b-experimental | 4.022.468.096 | no disponible | en | Apache 2.0 | 60/96 (total), 22/48 (abiertas), 12/16 (fundamentadas) | HuggingFace, safetensors + GGUF |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Apache 2.0 | 50/96 (total), 10/48 (abiertas), 16/16 (fundamentadas) | HuggingFace |
| Otros tutores de historia o modelos educativos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados relevantes: las entradas recuperadas tratan sobre incidencias de cuentas de Facebook y no guardan relacion con este modelo ni con modelos comparables.

## Limitaciones y advertencias

- Es un modelo experimental limitado al Taj Mahal; el propio autor indica que no es un tutor de historia escolar fiable de forma autonoma.
- Algunas fechas, recuentos, nombres, relaciones y atribuciones dependen de la fuente y permanecen inestables.
- Puede acertar el dato central y a la vez omitir partes de una pregunta multiple o anadir detalles sin respaldo.
- Riesgo de alucinacion reconocido explicitamente: el modelo puede omitir hechos solicitados, inventar detalles y desobedecer la instruccion de responder solo desde una nota proporcionada.
- El ajuste mejoro el recuerdo factual abierto (10/48 a 22/48) pero degrada la fundamentacion en fuentes (16/16 a 12/16) y hace perder 9 respuestas que el modelo base acertaba.
- El benchmark de 96 preguntas repite hechos relacionados y fue visto por el proceso de investigacion, aunque las preguntas quedaron excluidas del entrenamiento; no es una medida independiente.
- La variante GGUF Q6_K solo paso una prueba de humo de 8 preguntas y no ha superado el benchmark de 96 preguntas ni la comparacion nueva de 192 preguntas; su salida puede diferir de la del modelo fusionado en Transformers.
- Rendimiento en navegador y comportamiento en ONNX sin probar, segun el autor.
- Solo ingles declarado; no hay soporte documentado de hindi ni de otras lenguas indias.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y este checkpoint no incluyen garantias; el texto de la licencia incorpora la del modelo base.
- Uso previsto exclusivamente de investigacion y prototipado; para material didactico real hay que verificar cada respuesta contra fuentes primarias o autorizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmTheLast/taj-mahal-history-tutor-4b-experimental
- Cuantizacion GGUF Q6_K en el repositorio: https://huggingface.co/OmTheLast/taj-mahal-history-tutor-4b-experimental/blob/main/gguf/taj-step100-Q6_K.gguf
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficheros de procedencia y verificacion citados en la model card: MODEL_PROVENANCE.json, EXPORT_VERIFICATION.json, GGUF_RUNTIME_SUMMARY.json (en el propio repositorio de HuggingFace)
- Resultados de busqueda web relevantes: no disponible (las entradas recuperadas no guardan relacion con el modelo)
