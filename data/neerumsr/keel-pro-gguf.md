# neerumsr/keel-pro-GGUF

## Resumen

Keel-Pro GGUF es la versión cuantizada para llama.cpp de Keel-Pro, un modelo de decisión de pesos abiertos construido a partir de Qwen/Qwen3.5-27B. A diferencia de un modelo conversacional, Keel-Pro no genera texto libre: recibe un `state` y una pregunta tipada (`choice`, `score` o sí/no) y devuelve una distribución de probabilidad sobre las opciones presentadas, calculada mediante softmax sobre los logits de los tokens de etiqueta en la última posición de una única pasada forward. Está desarrollado por el usuario neerumsr y publicado bajo licencia Apache-2.0.

El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y se obtiene al fusionar un adaptador LoRA sobre Qwen3.5-27B. Esta variante GGUF ofrece dos cuantizaciones, Q4_K_M (16,8 GB) y Q8_0 (29,0 GB), pensadas para su despliegue con `llama-server`. Su relevancia actual radica en el nicho de enrutamiento, clasificación tipada y evaluación automática (llm-as-judge) dentro de pipelines de agentes, donde se necesita una señal probabilística calibrada en lugar de una respuesta en lenguaje natural.

El autor reporta una puntuación de 62,73 en la suite pública completa Decision Index 0.3 (139.677 peticiones, dato autodeclarado y con HLE contabilizado como 0). Es importante subrayar que esa cifra se midió con el adaptador en transformers, no con estos ficheros GGUF; la comprobación realizada sobre las cuantizaciones se limita a la coincidencia de opción elegida en 30 preguntas de desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-27B) con adaptador LoRA fusionado |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8192 tokens en el ejemplo de despliegue con `llama-server -c 8192`; el máximo del modelo base no está especificado en la información disponible |
| Tipos de cuantización | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (incluye aviso de la base Qwen3.5, conservado en `NOTICE`) |
| Formato de pesos | GGUF (repo de 45,9 GB; ficheros de 16,8 GB y 29,0 GB) |

## Arquitectura y entrenamiento

Keel-Pro se construye fusionando un adaptador LoRA sobre el modelo Qwen/Qwen3.5-27B, un transformer decoder-only de aproximadamente 27,3 mil millones de parámetros. El resultado se cuantiza a GGUF en dos variantes, Q4_K_M y Q8_0, para su ejecución con llama.cpp. El modelo no opera como un generador de texto: lee un único forward pass con el pensamiento (thinking) desactivado, presenta las opciones como líneas `A. key: description` bajo un system prompt fijo y calcula la respuesta como la softmax sobre los tokens de etiqueta en la última posición (el llamado read-out de `letters`).

El prompt debe replicar exactamente el formato con el que se entrenó el adaptador, disponible en `training/pro/common.py` del repositorio Keel. Para preguntas de tipo `score` se presentan los niveles como opciones `"0"`…`"n-1"` y se toma el nivel esperado; para preguntas booleanas se usan las opciones `false`/`true`. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación de decisión tipada: preguntas de elección múltiple (`choice`), puntuación ordinal (`score`) y binarias sí/no, devolviendo una distribución de probabilidad sobre las opciones.
- Enrutamiento (routing) de peticiones o tickets hacia categorías predefinidas mediante etiquetas con descripción.
- Evaluación automática tipo llm-as-judge, con salida probabilística en lugar de texto libre.
- Integración en pipelines de agentes como componente de decisión de una sola pasada.
- Inferencia determinista con `temperature: 0` y lectura de `completion_probabilities` vía API de llama.cpp.
- Soporte de contexto amplio en el ejemplo de servicio (hasta 8192 tokens configurados).
- Idioma: únicamente inglés.
- No soporta tool calling ni function calling en el sentido conversacional; su interfaz es la pregunta tipada descrita.
- No es un modelo multimodal ni dispone de visión o audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un texto de ticket como `state` y un conjunto de categorías (`billing`, `tech`, `account`) con sus descripciones, el modelo devuelve la probabilidad de cada una; es adecuado porque la salida es una distribución normalizada que permite aplicar umbrales o escalado a revisión humana.
- Clasificación de intenciones en agentes: en un pipeline multi-paso, Keel-Pro puede decidir qué herramienta o rama activar a partir del estado acumulado, sustituyendo a un prompt generativo por una lectura de un solo token.
- Evaluación automática de respuestas (llm-as-judge): con preguntas de tipo `score` sobre niveles ordinales, se obtiene un nivel esperado que puede agregarse en métricas de calidad de un sistema.
- Moderación y filtrado binario: usando preguntas sí/no con opciones `false`/`true`, se obtiene una probabilidad que permite fijar umbrales configurables según la política de la aplicación.
- Enrutamiento de consultas en sistemas RAG: decidir qué índice o colección consultar según la pregunta del usuario, aprovechando la ventana de contexto de hasta 8192 tokens para incluir el estado de la conversación.
- Despliegue en local o en el borde: con la cuantización Q4_K_M (16,8 GB) y todas las capas en GPU, el autor reporta una mediana de 242 ms por pregunta en una RTX 5090, lo que permite servir decisiones de baja latencia sin depender de APIs externas.
- Verificación de consistencia en pipelines de datos: clasificar pares estado/pregunta de forma determinista (`temperature: 0`) para auditar decisiones automatizadas.

## Benchmarks y rendimiento

| Métrica | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (suite pública completa) | 62,73 | 139.677 peticiones; dato autodeclarado; HLE contabilizado como 0; medido con el adaptador en transformers, no con los GGUF |
| Acuerdo GGUF Q4_K_M vs. modelo medido | 30 / 30 | 30 preguntas de elección única de desarrollo; `scripts/di/gguf_check.py`, llama.cpp b12029 |
| Acuerdo GGUF Q8_0 vs. modelo medido | 30 / 30 | Mismas condiciones que la fila anterior |
| Latencia mediana por pregunta, Q4_K_M en RTX 5090 | 242 ms | Con `llama-server -ngl 99` |
| Latencia mediana por pregunta, Q8_0 en RTX 5090 | 243 ms | Con `llama-server -ngl 99` |
| Latencia en CPU, llama-server a 12 hilos | ~15 s por pregunta | Solo CPU |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño del fichero más espacio para el contexto. Q4_K_M requiere aproximadamente 16,8 GB más contexto; Q8_0, aproximadamente 29,0 GB más contexto, si se cargan todas las capas en GPU (`-ngl 99`).
- GPU recomendadas: el autor aporta mediciones en RTX 5090. Por tamaño, Q4_K_M encaja en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con margen limitado para contexto; Q8_0 requiere GPUs de 32 GB o más (por ejemplo, A100 40 GB, H100) o reparto de capas entre GPU y CPU.
- Despliegue: llama.cpp mediante `llama-server`; los ficheros se descargan con `hf download neerumsr/keel-pro-GGUF keel-pro-Q4_K_M.gguf --local-dir models`.
- Latencia: mediana de 242 ms (Q4_K_M) y 243 ms (Q8_0) por pregunta en RTX 5090 con todas las capas en GPU; aproximadamente 15 s por pregunta en CPU con 12 hilos.
- El sidecar de Keel no carga ficheros GGUF actualmente; para la API completa de Keel (System One, servidor MCP) hay que ejecutar el adaptador con el sidecar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keel-Pro GGUF (este) | ~27,3 mil millones | 8192 en el ejemplo de servicio | Modelo de decisión con salida probabilística sobre opciones | Apache-2.0 | GGUF en Hugging Face; adaptador en el repo base |
| Keel-Pro (base, con adaptador) | ~27,3 mil millones | No disponible | Igual, ejecutado en transformers con el sidecar de Keel | Apache-2.0 | Pesos y adaptador en Hugging Face |
| Qwen/Qwen3.5-27B | ~27,3 mil millones | No disponible | Modelo generativo conversacional | Apache-2.0 | Pesos en Hugging Face |

No se dispone en la información proporcionada de comparaciones con otros modelos de decisión o clasificadores dedicados, ni de resultados de benchmarks comunes que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es más débil en benchmarks de razonamiento intensivo y de artes, según el autor.
- No incorpora capa de calibración: las probabilidades no están calibradas explícitamente para uso directo como confianza.
- No es un clasificador de seguridad; no debe usarse como filtro de contenido sin validación adicional.
- La comprobación de las cuantizaciones se realizó sobre solo 30 preguntas, por lo que la fidelidad frente al modelo medido está poco caracterizada.
- La puntuación de 62,73 en Decision Index 0.3 es autodeclarada, medida con el adaptador y no con estos ficheros GGUF, y contabiliza HLE como 0.
- Requiere replicar exactamente el formato de prompt de entrenamiento (`training/pro/common.py`); desviarse de él invalida la lectura de etiquetas.
- `llama-server` devuelve solo los `n_probs` tokens más probables, por lo que las probabilidades deben renormalizarse sobre las etiquetas presentes, lo que puede introducir sesgo si alguna etiqueta queda fuera.
- El sidecar de Keel no carga GGUF, de modo que la API completa del sistema no está disponible con estos ficheros.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones erróneas en dominios fuera de la distribución de entrenamiento; conviene umbralizar y derivar casos ambiguos a revisión.
- Licencia Apache-2.0 permite uso comercial; debe conservarse el aviso de Qwen3.5 incluido en `NOTICE`.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/neerumsr/keel-pro-GGUF
- Modelo base (adaptador): https://huggingface.co/neerumsr/keel-pro
- Repositorio Keel en GitHub: https://github.com/sivamtecch/Keel
- Guía de servicio (SERVE.md): https://github.com/sivamtecch/Keel/blob/main/artifacts/parity/pro/SERVE.md
- Guía de despliegue: https://github.com/sivamtecch/Keel/blob/main/docs/deployment.md
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
