# Remek/basal-2.0-mini

## Resumen

basal-2.0-mini es un modelo de decisión tipada (typed-decision) desarrollado por Remek, construido sobre el modelo polaco Bielik-1.5B-v3.0-Instruct de SpeakLeash. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un *estado* (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y una pregunta tipada, y devuelve una probabilidad calibrada para cada respuesta permitida en un único forward pass. Esto elimina por diseño el riesgo de respuestas fuera del conjunto de opciones definido por el usuario.

El modelo es el miembro más rápido de la familia basal-2.0, que se completa con basal-2.0 (4,5B) y basal-2.0-max (11B). Se entrenó a partir de checkpoints previos de basal usando basal-2.0-max como profesor (destilación), y está pensado para tareas de enrutamiento, verificación de reglas y políticas, puntuaciones de urgencia y riesgo, decisiones sobre RAG, evaluación de respuestas y selección de herramientas en agentes.

Su relevancia actual reside en la combinación de tres propiedades poco habituales: salida restringida al conjunto de clases definido en la petición, probabilidades calibradas que permiten umbrales de error explícitos (`max_error`) con derivación a revisión humana, y un tamaño de 1,5B parámetros que lo hace desplegable en hardware modesto. Soporta polaco e inglés y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik-1.5B-v3.0-Instruct), con cabeza de decisión tipada sobre opciones |
| Parametros totales | 1.596.507.648 (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (NVIDIA Hopper y Blackwell), GGUF Q8_0 y Q5_K_M, MLX 8-bit (Apple Silicon) |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variantes GGUF, FP8 y MLX-8bit |

## Arquitectura y entrenamiento

El modelo parte de Bielik-1.5B-v3.0-Instruct, un transformer decoder-only de 1,5B parámetros orientado a instrucciones en polaco. Sobre esa base, el entrenamiento de basal introduce una formulación de decisión tipada: el estado y la pregunta se serializan en la entrada, y el modelo emite una distribución de probabilidad sobre las opciones declaradas en la petición (`choice`, `noul`, `score`, `multi`, `act`, `tool`), sin generar tokens de texto libre. El ajuste se realizó a partir de checkpoints anteriores de basal, empleando basal-2.0-max (11B) como modelo profesor, lo que constituye un proceso de destilación hacia el miembro más pequeño de la familia.

La innovación central es la calibración de las probabilidades de salida, ajustada con las claves de opción ocultas (`option_keys: "hide"`), de modo que la confianza reportada sea interpretable y utilizable para umbrales operativos. Sobre esa calibración se construye el mecanismo de `max_error` para preguntas de tipo `act` y `tool`, que combina la probabilidad calibrada con una matriz de costes (coste de error frente a coste de derivación) para devolver la acción de menor coste esperado o `defer`. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Decisión tipada sobre un conjunto cerrado de opciones: preguntas de elección única (`choice`), sí/no (`noul`), puntuación (`score`), elección múltiple (`multi`), acción (`act`) y herramienta (`tool`).
- Salida de probabilidad calibrada por cada opción permitida, con clave elegida y nivel de confianza, en un solo forward pass y sin generación de texto.
- Enrutamiento y clasificación sin reentrenamiento: las clases se describen en la propia petición, por lo que un mismo modelo cubre múltiples tareas.
- Verificación de reglas y políticas mediante preguntas booleanas sobre el estado.
- Puntuaciones de urgencia y riesgo.
- Preguntas sobre documentos largos y pasajes recuperados (presencia de la respuesta, relevancia) para pipelines RAG.
- Evaluación de respuestas (judging).
- Selección de herramienta en agentes: una pregunta `tool` sobre definiciones de herramientas en formato OpenAI o MCP elige la herramienta, no sus argumentos.
- Triaje con derivación a humano: preguntas `act` con acción `defer` y umbral `max_error`.
- Multilingüe pl/en, con estado y pregunta potencialmente en idiomas distintos.
- No soporta generación de texto ni conversación libre; tampoco visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como estado y una pregunta `choice` con los departamentos como criterios, devolviendo la probabilidad de cada uno. La calibración permite fijar un umbral y enviar los casos dudosos a un agente humano.
- Verificación de políticas en atención al cliente: preguntas `noul` del tipo "¿el cliente no puede acceder al servicio?" sobre la conversación, con probabilidad asociada, para activar protocolos de escalado.
- Triaje con derivación automática: usando preguntas `act` con acción `defer`, costes de error y de derivación y `max_error: 0.05`, el modelo devuelve `defer` cuando la confianza calibrada no alcanza el umbral certificado, lo que permite automatizar solo la franja de casos segura.
- Decisiones en pipelines RAG: preguntas sobre si el pasaje recuperado contiene la respuesta o si es relevante para la consulta, con probabilidad calibrada, para decidir si responder, reformular la búsqueda o abstenerse.
- Selección de herramienta en agentes: pregunta `tool` construida sobre definiciones OpenAI o MCP para elegir la herramienta adecuada en cada paso de una traza de agente, sin generar argumentos.
- Puntuación de urgencia y riesgo: preguntas `score` sobre correos, incidencias o solicitudes para priorizar colas de trabajo con un valor numérico calibrado.
- Evaluación automática de respuestas: pregunta `choice` o `score` sobre la calidad de una respuesta generada por otro modelo, útil en pipelines de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 3,2 GB en safetensors; en FP16 serían aproximadamente 3,2 GB de pesos más overhead de activaciones. Las variantes cuantizadas reducen el requisito: GGUF Q8_0 en torno a 1,7 GB y Q5_K_M en torno a 1,1-1,2 GB de pesos; MLX 8-bit en torno a 1,6 GB.
- GPU recomendadas: el motor basal v2.5.0 está orientado a GPU NVIDIA; la build cu128 requiere driver para CUDA 12.8 o superior. Las variantes FP8 están pensadas para NVIDIA Hopper y Blackwell (H100, B200/B300, DGX Spark con build cu130).
- Cabe en GPU de consumo: sí, por tamaño; un modelo de 1,5B en FP16 o FP8/GGUF entra en GPUs consumer con 8 GB o más. La variante MLX-8bit está pensada para Apple Silicon.
- Opciones de despliegue: motor propio `basal-serve` (paquete `basal`, versión 2.5.0, instalable con uv), con endpoint `/v1/systemone` y cliente Python `basal.client.Basal`. Las variantes GGUF permiten despliegue con Ollama y llama.cpp. El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints alojados.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo se describe como el más rápido de la familia basal-2.0 por su tamaño de 1,5B y su inferencia en un único forward pass sin generación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-mini | 1,5B | no disponible | Decisión tipada calibrada, pl/en | Apache 2.0 | HuggingFace; FP8, GGUF, MLX |
| basal-2.0 | 4,5B | no disponible | Decisión tipada calibrada, modo thinking experimental | no disponible | HuggingFace; FP8, GGUF, MLX |
| basal-2.0-max | 11B | no disponible | Decisión tipada calibrada, máxima precisión | no disponible | HuggingFace; FP8, GGUF, MLX |
| Bielik-1.5B-v3.0-Instruct | 1,5B | no disponible | Generación de texto instructiva, pl | no disponible | HuggingFace (modelo base) |

La comparación relevante es interna a la familia basal-2.0: mini prioriza velocidad, max prioriza precisión y el modelo de 4,5B es el principal. Frente a Bielik-1.5B-v3.0-Instruct, la diferencia es de paradigma: Bielik genera texto libre, basal-2.0-mini restringe la salida a opciones declaradas y calibra la confianza.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto ni mantiene conversaciones; solo elige entre las opciones proporcionadas.
- No puede responder sobre hechos que no estén presentes en el estado de entrada.
- No debe usarse para decisiones con consecuencias graves para personas sin revisión humana.
- La calibración está ajustada con las claves de opción ocultas (`option_keys: "hide"`); si se muestran las claves, la respuesta se marca como `"calibration": "unvalidated"`.
- El mecanismo `max_error` solo funciona en preguntas de tipo `act` y `tool`.
- Un coste de error muy elevado en la matriz de costes provoca derivación (`defer`) por coste esperado antes de aplicar `max_error`; el autor recomienda mantener el coste de error moderado.
- Idiomas limitados a polaco e inglés; no se documenta soporte de castellano.
- No se dispone de información sobre sesgos, tasa de alucinación ni comportamiento en dominios fuera de los evaluados por el autor.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones independientes de robustez.
- El ecosistema de despliegue principal es el motor propietario `basal` orientado a GPU NVIDIA; el uso con llama.cpp u Ollama se limita a las variantes GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remek/basal-2.0-mini
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Modelo basal-2.0 (4,5B): https://huggingface.co/Remek/basal-2.0-4.5B
- Modelo basal-2.0-max (11B): https://huggingface.co/Remek/basal-2.0-max
- Modelo base Bielik-1.5B-v3.0-Instruct: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de hardware del motor: https://github.com/rkinas/basal/blob/v2.5.0/docs/HARDWARE.md
- Sitio web del proyecto: https://basal.si5.pl/
