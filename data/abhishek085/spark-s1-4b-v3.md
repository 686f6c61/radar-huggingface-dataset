# abhishek085/spark-s1-4b-v3

## Resumen

spark-s1-4b-v3 es un modelo de decisión de tipo "System One" publicado por el usuario abhishek085 dentro del proyecto open-spark-Jev (comunidad Nokast AI / open-spark-Jev). No es un modelo generativo al uso: recibe un estado (el contexto del problema) y una pregunta tipada —elección entre opciones, booleano u ordenación por puntuación— y devuelve una distribución de probabilidad completa sobre las opciones junto con una confianza, todo ello en un único forward pass y sin generar texto. El modelo base es Qwen/Qwen3-4B, afinado con LoRA de rango 16 (fusionada en estos pesos), lo que da 4.022.468.096 parámetros reales según los safetensors del repositorio.

Técnicamente es un causal LM ordinario de Qwen3; lo diferencial no está en los pesos sino en el contrato de lectura: el estado se renderiza una vez, cada pregunta se añade como un menú de opciones (A, B, C...) seguido de la cabecera de asistente Qwen3 en modo no-thinking, y los logits del primer token de respuesta se restringen a los tokens de letra de opción, se dividen por una temperatura por tipo de pregunta y se pasan por softmax. Esa distribución es la respuesta. El código de lectura vive en el repositorio open-spark-jev (`open_spark_jev.model.MenuScorer`) y es el que sirve la API `POST /v1/decide`.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos para tareas de decisión en agentes: cambiar latencia y coste de decodificación autoregresiva por una única pasada con distribución calibrada. Su punto fuerte es la velocidad (65,9 ms de p50 en una DGX Spark, batch 1) y una cabeza de elección con temperatura ajustada (3,166); su punto débil es el tamaño del entrenamiento, menos de mil filas, que deja varias familias de tareas cerca del azar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), modelo base Qwen/Qwen3-4B afinado con LoRA r16 fusionada |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del backbone Qwen/Qwen3-4B (32.768 tokens nativos, ampliable con YaRN). El uso previsto es de contexto corto: estado mas menu de opciones |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados). El repo contiene safetensors en precision de entrenamiento (~8,1 GB, en torno a 2 bytes por parametro, compatible con bf16/fp16) y admite cuantizacion posterior a GGUF, AWQ o GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (el backbone Qwen/Qwen3-4B tambien es Apache-2.0) |
| Formato de pesos | safetensors (libreria transformers) |

| Parametro adicional | Valor |
|---|---|
| Autor | abhishek085 |
| Tipo de tarea declarada | text-classification |
| Entrada | estado + pregunta tipada con opciones definidas en tiempo de peticion |
| Salida | distribucion de probabilidad por opcion + confianza, sin texto generado |
| Temperaturas de calibracion | choice 3,166 (ajustada); boolean y score 1,0 (no ajustadas) |
| Dataset de entrenamiento | abhishek085/spark-s1-osdg-v1 |
| Compatibilidad declarada | text-embeddings-inference, endpoints_compatible |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B sin modificaciones estructurales: un transformer causal denso al que se le ha aplicado un ajuste supervisado con LoRA de rango 16 (3 epocas), posteriormente fusionado en los pesos publicados. El entrenamiento usa entropia cruzada mas un regularizador de Brier sobre el split de entrenamiento de os-datagen (967 filas), con cada fila de eleccion presentada ademas en 4 ordenes aleatorios de opciones, lo que da 4.277 ejemplos efectivos. Las etiquetas provienen de codigo —motores de politicas, solvers y mundos controlados—, no de un juez LLM, lo que reduce el ruido de etiquetado pero limita la diversidad de los datos. No se utilizaron datos de riesgo de tool-calling.

La innovacion no esta en el entrenamiento sino en la interfaz de inferencia: no hay decodificacion autoregresiva. El modelo renderiza el estado una sola vez, anade la pregunta como un menu de opciones con definiciones en el propio prompt y lee los logits del primer token de respuesta restringidos al conjunto de tokens de letra (A..Z); esa restriccion se escala por una temperatura especifica del tipo de pregunta y se normaliza con softmax. Para la cabeza de eleccion, la temperatura (3,166) se ajusto sobre un split de calibracion reservado; para booleano y score se deja en 1,0, es decir, sin calibrar. El autor no ha aplicado entrenamiento de calibracion basado en resultados (RLCD); esta planificado sobre un dataset mayor. El modelo no explica nunca sus respuestas: solo emite la distribucion.

## Capacidades

- Decision de eleccion tipada: selecciona entre opciones definidas en tiempo de peticion y devuelve la probabilidad de cada una en una sola pasada.
- Respuestas booleanas: responde si/no con distribucion asociada, aunque sin calibracion ajustada.
- Puntuacion ordenada: asigna un score ordinal sobre opciones o niveles, tambien sin calibrar.
- Confianza por respuesta: la distribucion softmax permite fijar umbrales de confianza en el consumidor (solo fiable de forma calibrada en la cabeza de eleccion).
- Tareas de decision en agentes: el conjunto de 60 filas de tool-call obtiene 0,850, por lo que sirve como componente de seleccion de herramienta o siguiente accion.
- Cero generacion de texto: no produce explicaciones, justificaciones ni cadena de pensamiento; es un modelo de solo lectura de logits.
- Modo no-thinking: usa la cabecera de asistente Qwen3 sin bloque de razonamiento, coherente con el forward pass unico.
- Un solo idioma: todo el entrenamiento y la interfaz estan en ingles.
- Sin soporte de vision, audio, tool calling nativo ni function calling: la unica via de integracion es la API de decision del repositorio open-spark-jev.

## Casos de uso

- Enrutado de la siguiente accion en agentes: dado el estado de la conversacion o del entorno, presentar las acciones candidatas como menu y usar la opcion con mayor probabilidad. Adecuado para la latencia (una pasada, 65,9 ms p50) aunque el propio autor advierte debilidad en este tipo de tarea por falta de datos.
- Seleccion de herramienta (tool selection): decidir que funcion invocar entre un conjunto fijo, con umbral de confianza para escalar a un modelo mayor cuando la distribucion es plana. El modelo reporta 0,850 en el conjunto de 60 filas de tool-call, con un error estandar de unos 5 puntos.
- Puertas de decision en pipelines automatizados: decidir entre continuar, reintentar o escalar a revision humana en funcion de una politica de opciones. La temperatura ajustada de la cabeza de eleccion hace que el umbral sobre la probabilidad tenga un significado mas estable que en las otras cabezas.
- Clasificacion de tickets o incidencias con etiquetas definidas en tiempo de peticion: al recibir las opciones en el propio menu, se puede redefinir la taxonomia sin reentrenar, algo que un clasificador de cabecera fija no permite.
- Prefiltrado rapido con revision humana posterior: usar la distribucion como prior, no como veredicto. Es el uso recomendado por el autor para acciones de alto impacto, calibrando umbrales sobre datos propios.
- Comprobaciones de suficiencia de respuesta o de terminacion de bucle: util como senal auxiliar de bajo coste dentro de un agente, con la salvedad de que el autor mide rendimiento debil en puertas de terminacion y suficiencia.
- Sistemas con presupuesto de latencia estricto: al no decodificar texto, el coste es el de un unico forward pass sobre un modelo de 4B, lo que permite ejecutarlo en la misma maquina que el agente sin depender de una API externa.
- Investigacion sobre calibracion en modelos de decision: el par modelo mas `calibration.json` con temperaturas por tipo de pregunta es un banco de pruebas util para estudiar softmax restringido a tokens de opcion y regularizacion de Brier.

## Benchmarks y rendimiento

Datos publicados por el autor (referencias B27, B29-B31 del archivo BENCHMARKS.md del repositorio):

| Medida | Valor spark-s1-4b-v3 | Referencia Jev |
|---|---|---|
| Conjunto de tool-call de 60 filas (revision final) | 0,850 | 0,917 (registrado) |
| os-datagen test bloqueado | 0,785 | no disponible |
| os-datagen challenge | 0,790 | no disponible |
| Kev decision-v1 (externo, sin solapamiento de entrenamiento) | 0,773 | no disponible |
| Kev transfer-v4 (externo, sin solapamiento) | 0,749 | no disponible |
| Jev-directory (70 preguntas) | 0,771 | no disponible |
| Latencia p50, conjunto de 60 filas, batch 1, una DGX Spark | 65,9 ms | 421,6 ms (hospedado, incluye red) |

Advertencias del propio autor sobre estas cifras: el conjunto de 60 filas tiene n=60, con un error estandar de aproximadamente 5 puntos, y los fallos por fila de modelos anteriores sobre ese conjunto se inspeccionaron antes de construir esta escala, por lo que debe tratarse como una comprobacion final blanda. La latencia de Jev es un numero registrado en servicio hospedado e incluye red, por lo que la comparacion de velocidad no es homogenea. La deteccion de codigo vulnerable queda cerca del azar (0,56 en la suite externa). No hay resultados publicados de MMLU, HumanEval, GSM8K ni benchmarks generativos equivalentes en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: en torno a 8-9 GB solo para pesos (4,02B parametros a 2 bytes), mas cache KV del contexto de estado y menu, que en el uso previsto es corto.
- VRAM en cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB de pesos, mas cache KV; viable en GPU de 6-8 GB.
- GPU consumer: cabe con holgura en RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti y, en cuantizacion de 4 bits, en tarjetas de 8 GB como RTX 3060 Ti o RTX 4060.
- GPU de centro de datos: A100, H100, L40S y similares, sobredimensionadas para un modelo de 4B; el autor reporta 65,9 ms de p50 en una DGX Spark (hardware de sobremesa de NVIDIA) en batch 1.
- Despliegue: la via soportada es el repositorio open-spark-jev (`open_spark_jev/serve`), que expone `POST /v1/decide` y aplica el `MenuScorer` y las temperaturas de `calibration.json`. La model card etiqueta el modelo como compatible con text-embeddings-inference y endpoints_compatible.
- vLLM, TGI u otros servidores estandar: pueden cargar los pesos (es un Qwen3 causal LM), pero la logica de restriccion de logits al conjunto de letras y el softmax por temperatura no viene incluida; hay que implementarla, y llama.cpp u Ollama requeririan acceso equivalente a los logits y no estan soportados de forma nativa.
- Throughput: no disponible; solo se publica latencia p50 en batch 1. Al no haber decodificacion, el escalado esperado es mucho mejor que en un modelo generativo del mismo tamano, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en decision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spark-s1-4b-v3 | 4,02B (denso, LoRA r16 fusionada) | no especificado en la model card | 0,850 en tool-call (n=60); 0,771-0,790 en conjuntos propios y externos | apache-2.0 | Pesos abiertos en HuggingFace |
| Jev (TypeSafe AI) | no disponible | no disponible | 0,917 registrado en el conjunto de tool-call de 60 filas; 421,6 ms p50 en servicio hospedado | no disponible (sistema de referencia, no abierto) | no disponible como pesos; solo referencia registrada |
| Qwen/Qwen3-4B | 4,02B (denso) | 32.768 tokens nativos, ampliable con YaRN | No comparable de forma directa: es un modelo generativo sin el contrato de menu ni cabeza de decision; no se publican resultados en estos conjuntos | apache-2.0 | Pesos abiertos en HuggingFace |
| Otras versiones spark-s1 | no disponible | no disponible | no disponible | no disponible | La model card anuncia publicaciones versionadas `spark-s1-<tamano>-v<n>`, pero no detalla cuales existen |

No hay en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) que permitan comparar este modelo con alternativas generativas de su misma escala.

## Limitaciones y advertencias

- Entrenado con menos de mil filas (967 filas de train en os-datagen, 4.277 ejemplos tras aumento por orden de opciones). El propio autor senala rendimiento debil en enrutado de siguiente accion, puntuacion de urgencia, recuperacion, puertas de terminacion y suficiencia de respuesta (2-12 filas de test por paquete, con ruido).
- Deteccion de codigo vulnerable practicamente al azar (0,56 en la suite externa). No debe usarse para ese fin.
- Las probabilidades booleanas y de score no estan calibradas: solo la cabeza de eleccion tiene temperatura ajustada (3,166). Una respuesta booleana o de score incorrecta puede venir acompanada de una confianza cercana a 1,0.
- La precision frente a inyeccion de prompt es aceptable, pero sus probabilidades no estan calibradas (temperatura binaria no ajustada).
- El modelo nunca explica sus respuestas ni aporta justificacion; la trazabilidad depende por completo del consumidor.
- La respuesta depende del estado y de las definiciones de opciones que se le entreguen. Un menu mal redactado o ambiguo degrada el resultado sin senal de error.
- No debe utilizarse como unica puerta en acciones de alto impacto. El autor recomienda calibrar sobre resultados etiquetados propios.
- No tiene entrenamiento de calibracion basado en resultados (RLCD); esta planificado sobre un dataset mayor.
- Solo ingles: no hay soporte multilingue declarado ni evaluado.
- La licencia de los pesos es Apache-2.0, heredada del backbone Qwen/Qwen3-4B, pero los datos de entrenamiento se generaron y verificaron con Gemma-4-26B-A4B, Qwen3.6-35B-A3B y Qwen3.6-27B; el propio autor recomienda revisar los terminos de esos modelos para uso comercial.
- Cero adopcion registrada en HuggingFace (0 descargas, 0 likes) y publicacion muy reciente (20 de septiembre de 2026), por lo que no hay validacion independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek085/spark-s1-4b-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/abhishek085/spark-s1-osdg-v1
- Repositorio del contrato y servidor de decision: https://github.com/abhishek085/open-spark-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Benchmarks detallados (BENCHMARKS.md, referencias B27 y B29-B31), dentro del repositorio https://github.com/abhishek085/open-spark-jev
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los unicos recursos disponibles son los anteriores.
