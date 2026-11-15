# PelaAI/KnowLine-12B-Gen1

## Resumen

KnowLine-12B-Gen1 es un modelo de decisión ("decision model") desarrollado por PelaAI, un fine-tune supervisado del modelo denso google/gemma-4-12B-it. No es un generador de texto conversacional al uso: recibe un estado (texto o conversación) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones, o puntuación sobre una rúbrica) y devuelve, para cada pregunta, una distribución de probabilidad sobre sus opciones en un único forward pass, sin decodificación autoregresiva. El modelo forma parte de la familia "System One" de PelaAI, orientada a decisiones rápidas y calibradas.

Con 11.959.730.224 parámetros reales (denso, sin mezcla de expertos) y pesos en bf16, el modelo se distribuye en un repositorio de 24 GB bajo licencia Apache-2.0. Está entrenado con LoRA (rango 32, alpha 64) sobre el componente de lenguaje, fusionado después en los pesos bf16. La temperatura de lectura (T = 1.47) está plegada en los pesos finales, de modo que las probabilidades emitidas ya vienen calibradas.

Su relevancia actual reside en la propuesta de interfaz: sustituir la generación de texto por clasificación probabilística multi-pregunta en una sola pasada, con compatibilidad directa con clientes Jev existentes (solo cambia la URL base) y con el resto de modelos KnowLine (solo cambia el nombre del modelo). El modelo declara soporte para inglés, chino simplificado y chino tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base google/gemma-4-12B-it), fine-tune LoRA fusionado |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (release oficial en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ~23,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer denso de aproximadamente 12B parámetros con licencia Apache-2.0. Sobre el componente de lenguaje se aplicó un adaptador LoRA de rango 32 y alpha 64, entrenado durante una época y posteriormente fusionado en los pesos bf16. Los tensores de embedding relacionados con visión se mantienen sin cambios respecto al modelo base, y el tokenizador es el de Gemma 4. Los ejemplos de entrenamiento consisten en tareas de decisión escritas y etiquetadas por profesores LLM, renderizadas con la plantilla de chat de Gemma. El conjunto de datos de entrenamiento no se incluye en el repositorio.

La innovación principal es el mecanismo de lectura: el modelo responde cada pregunta con la probabilidad del token de etiqueta de cada opción en un único forward pass, sin generación de texto. Además, se sirve con "read twice" (el servidor lee dos veces las peticiones cortas, activado por defecto y desactivable con `--no-read-twice`). La temperatura de lectura T = 1.47, ajustada sobre datos de validación con este mismo modo de servicio, está plegada en el peso de la normalización final y en el soft-cap de logits final; el front end lee las preguntas de puntuación a una temperatura efectiva de 1.0 según `temperatures.json`. Este ajuste modifica la magnitud de las probabilidades, pero no el orden de las opciones.

## Capacidades

- Clasificación probabilística multi-pregunta: hasta 64 preguntas tipadas por petición (sí/no, elección entre k opciones, puntuación sobre rúbrica) con distribución de probabilidad sobre las opciones.
- Inferencia sin generación de texto: un forward pass por pregunta, lo que reduce la latencia frente a esquemas autoregresivos.
- Probabilidades calibradas: temperatura de lectura plegada en los pesos; ECE de aproximadamente 0,005–0,009 y Brier score de aproximadamente 0,243–0,264 en la suite pública, según el autor.
- Compatibilidad de interfaz con clientes Jev y con otros modelos KnowLine (mismo endpoint `/v1/systemone`).
- Multilingüe en inglés, chino simplificado y chino tradicional.
- Conserva los tensores de visión del modelo base Gemma 4, aunque la model card no documenta explícitamente tareas de visión en el pipeline de decisión.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Moderación y triaje de contenido: enviar un texto o conversación como estado y un conjunto de preguntas binarias (¿es tóxico?, ¿es spam?, ¿requiere revisión humana?) para obtener probabilidades calibradas que permitan fijar umbrales operativos con ECE bajo.
- Enrutamiento de tickets de soporte: clasificar la intención del cliente y su tono (enfadado, neutro, satisfecho) en una sola petición con varias preguntas tipadas, como muestra el ejemplo de la model card sobre una reclamación de pedido roto.
- Evaluación automática de respuestas: puntuar salidas de otros modelos sobre rúbricas mediante preguntas de tipo score, aprovechando la calibración de probabilidades para comparar candidatos.
- Control de calidad en pipelines de anotación: usar el modelo como etiquetador de decisión para pre-anotar datos con distribuciones de probabilidad, priorizando los casos de mayor incertidumbre para revisión humana.
- Señal de decisión en agentes: integrar el endpoint `/v1/systemone` como componente "System One" que responde preguntas rápidas (¿debo escalar?, ¿es seguro ejecutar esta acción?) antes de que un agente de razonamiento más lento tome el control.
- Análisis de conversaciones multilingües: clasificar conversaciones en inglés y chino (simplificado y tradicional) con la misma interfaz, útil en plataformas de atención al cliente con mercados asiáticos.
- Filtrado previo en búsqueda o recomendación: decidir con preguntas binarias si un documento o ítem cumple criterios definidos por el operador, sin necesidad de generar texto explicativo.

## Benchmarks y rendimiento

| Modelo | Tamano | DI 0.3 publico | DI 0.4.1 completo | Fuente |
|---|---|---|---|---|
| KnowLine-12B-Gen1 | 12B | 69,37 | No puntuado aun | Autoejecucion, kit oficial |
| karpo-decision-31B | ~31,3B | 75,05 | 73,86 | Board |
| GLiDE 27B | ~26,1B | 72,49 | 73,37 | Board |
| REAX 1.3 | ~57,4B | 73,71 | 72,64 | Board |
| Logits Sigma-1 Duo | ~57,4B | 72,93 | 72,28 | Board |
| Copernicus-31B | ~31,3B | 70,37 | 72,11 | Board |
| KnowLine 31B Gen1.5 | ~31,3B | 70,50 | 71,91 | Board |
| Copernicus-57B | ~57,4B | 75,34 | 71,80 | Board |
| FlexDM-LoRA 2.1 · Gemma-4-31B | ~31,3B | 68,99 | 71,61 | Board |

Datos de calibración en la suite pública (metodo del board): ECE de aproximadamente 0,005–0,009 y Brier score de aproximadamente 0,243–0,264 para KnowLine-12B-Gen1; KnowLine-26B-A4B-Gen2.5 registra ECE de 0,013–0,018 y Brier de 0,24–0,27. El modelo todavia no tiene entrada en el board oficial del Decision Index. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 23,9 GB solo para los pesos; SGLang reserva por defecto el 85 % de la memoria de la GPU.
- La evaluación del Decision Index del autor se ejecutó en hardware H20 de 96 GB.
- GPU recomendadas: H20 96 GB (configuración validada por el autor); por tamaño de pesos, encajan también A100 40/80 GB, H100 80 GB y L40S 48 GB, aunque no se documentan pruebas en estas.
- GPU de consumo: los pesos bf16 (~23,9 GB) no caben en GPUs de consumo de 24 GB o menos sin cuantización, y no se publican pesos cuantizados; no se documenta soporte en RTX 4090, RTX 3090 ni similares.
- Despliegue: `serve_knowline.sh` con SGLang en bf16 (versión fijada `sglang==0.5.21` y `transformers==5.12.1`); front end `knowline_server.py` con `knowline_layout.py`, que dependen solo de transformers y requests. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo indica que cada pregunta se resuelve con un forward pass y que el servicio lee dos veces las peticiones cortas por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DI 0.3 publico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-12B-Gen1 | 11,96B (denso) | No disponible | 69,37 | Apache-2.0 | Hugging Face (PelaAI) |
| KnowLine-31B-Gen1.5 | ~31,3B | No disponible | 70,50 | No disponible en la informacion | Hugging Face (PelaAI) |
| KnowLine-26B-A4B-Gen2.5 | MoE (A4B) | No disponible | 68,21 | No disponible en la informacion | Hugging Face (PelaAI) |
| KnowLine-35B-A3B-Gen1.5 | MoE (A3B) | No disponible | 70,72 | No disponible en la informacion | Hugging Face (PelaAI) |
| Copernicus-31B | ~31,3B | No disponible | 70,37 | No disponible en la informacion | Board del Decision Index |

Frente a sus hermanos de familia, KnowLine-12B-Gen1 es el de menor tamaño y el que menos puntúa en la suite pública DI 0.3 (69,37 frente a 70,72 del 35B-A3B y 68,21 del 26B-A4B, este último por debajo). Su ventaja es el tamaño reducido y la licencia Apache-2.0 declarada, que facilita el uso comercial. No se dispone de datos de contexto ni de licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión: no genera texto libre; su salida es una distribución de probabilidad sobre etiquetas, por lo que no sustituye a un LLM conversacional.
- Idiomas limitados a inglés, chino simplificado y chino tradicional; el rendimiento fuera de estos idiomas no está documentado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento con estados o conversaciones largas.
- Riesgo de alucinación inherente a la clasificación probabilística: probabilidades calibradas no implican respuestas correctas, solo una estimación de confianza bien ajustada.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible; los datos de entrenamiento provienen de profesores LLM, lo que puede heredar sus sesgos.
- La puntuación DI 0.3 es autoejecutada por el autor con el kit oficial; el modelo aún no tiene entrada en el board del Decision Index y no cuenta con puntuación DI 0.4.1 completa.
- La temperatura T = 1.47 está plegada en los pesos y el front end aplica una temperatura efectiva de 1.0 para preguntas de puntuación; modificar el pipeline de servicio sin respetar `temperatures.json` puede romper la calibración.
- El modo "read twice" está activado por defecto; desactivarlo puede alterar el comportamiento respecto a la configuración evaluada.
- El conjunto de datos de entrenamiento no se publica, lo que limita la reproducibilidad y la auditoría.
- Licencia Apache-2.0 declarada, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-12B-it (también Apache-2.0 según la model card).
- El autor declara no estar afiliado ni respaldado por TypeSafe, Jev o Google, y no derivar de TypeSafe ni Jev.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-12B-Gen1
- Guía de inferencia: INFERENCE.md (referenciada en el repositorio)
- README en chino: README.zh.md (referenciado en el repositorio)
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Modelo relacionado KnowLine-31B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
- Datos oficiales del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/main/data/index.js
