# kakaocorp/kanana-2-v-decide-3b-2611

## Resumen

Kanana-2-v-decide-3b-2611 es un modelo de decisión multimodal desarrollado por Kakao Corp. para coreano e inglés. A diferencia de un modelo generativo convencional, no produce texto: recibe un *estado* (texto plano, objeto o array JSON, o historial de chat, opcionalmente con imágenes) y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad calibrada sobre las respuestas candidatas. Los tres tipos de pregunta soportados son `choice` (selección entre opciones), `noul` (sí/no con probabilidad) y `score` (escala ordenada con nivel esperado).

El modelo se construye sobre Kanana-2-v-3b, que combina el modelo de lenguaje Kanana-2-3b (3,18B parámetros) con el codificador visual Kanana (0,49B), sumando 3,67B parámetros totales. Cada pregunta se codifica junto con el estado en un embedding de 2.560 dimensiones, y cada respuesta candidata en otro; la distribución final se obtiene mediante softmax sobre las similitudes coseno entre ambos embeddings. Admite hasta 10 imágenes y 20.480 tokens de entrada por petición.

Su relevancia actual reside en el enfoque *system-one*: sustituye la generación autoregresiva por una clasificación calibrada de baja latencia, lo que resulta adecuado para enrutamiento, moderación, etiquetado y decisión automatizada en pipelines donde se necesita una probabilidad fiable en lugar de una respuesta textual. Lidera el promedio público (61,23) en Decision Index y Decision Index Vision entre los modelos comparados en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language con codificador de preguntas/respuestas y similitud coseno; basada en Kanana-2-v-3b (LM Kanana-2-3b + codificador visual Kanana) |
| Parametros totales | 3.665.430.640 (3,67B): 0,49B vision encoder + 3,18B language model |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 20.480 tokens de entrada; hasta 10 imágenes por petición |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card no detalla cuantizaciones oficiales) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | kanana-open-license (license: other) |
| Formato de pesos | safetensors (repo de 7,3 GB), con `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de Kanana-2-v-3b, un vision-language que empareja el LM Kanana-2-3b con el codificador visual Kanana. Sobre esa base, la cabeza de decisión no genera tokens: codifica conjuntamente el estado y la pregunta en un embedding de 2.560 dimensiones, codifica cada respuesta candidata en otro embedding y aplica un softmax sobre las similitudes coseno para producir la distribución de respuesta. Esto permite resolver cualquier número de preguntas por petición en una sola pasada y devolver probabilidades calibradas en lugar de texto.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Sí se declara explícitamente la calibración como propiedad del modelo y la orientación *system-one* (decisión rápida en una pasada), además de soporte multimodal con hasta 10 imágenes. La evaluación incluye un conjunto interno coreano (Kanana Decision Bench, 15.909 preguntas de texto) y dos benchmarks públicos (Decision Index 0.4.1 y Decision Index Vision 0.4.1).

## Capacidades

- Decisión tipada con distribución de probabilidad: preguntas `choice` (selección entre criterios), `noul` (probabilidad de sí, 0-1) y `score` (nivel esperado sobre escala ordenada).
- Múltiples preguntas por petición, resueltas en una sola pasada sobre el mismo estado.
- Entrada multimodal: texto, JSON (objeto o array) o historial de chat, con hasta 10 imágenes adjuntas (rutas locales, URLs, data URIs base64 o imágenes PIL).
- Contexto de hasta 20.480 tokens.
- Capacidades multilingües limitadas a coreano e inglés.
- Salida calibrada sin generación de texto, lo que evita alucinación textual y reduce latencia frente a esquemas generativos.
- Integración con `transformers` mediante `AutoModel` con `trust_remote_code=True`, pipeline `decision` y servidor HTTP propio (System One API: `POST /v1/systemone`, `GET /v1/models`, `GET /health`).
- No soporta tool calling ni function calling (no es un modelo generativo ni de agentes).
- No soporta razonamiento multi-paso explícito; el paradigma es system-one de decisión directa.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar la categoría de una consulta (`choice`) y determinar simultáneamente si requiere reembolso o sustitución (`noul`), con probabilidades que permiten umbralizar y derivar a revisión humana cuando la confianza es baja.
- Moderación y triaje de contenido: evaluar mensajes de usuario o imágenes adjuntas con preguntas sí/no y escalas de gravedad, aprovechando la calibración para fijar umbrales operativos.
- Etiquetado automático de datos: anotar datasets de texto e imagen con múltiples preguntas por ejemplo en una sola pasada, útil para preetiquetado a gran escala antes de revisión humana.
- Análisis de sentimiento y satisfacción: usar preguntas `score` sobre historiales de chat para obtener un nivel esperado de sentimiento en lugar de una etiqueta discreta, facilitando agregaciones y métricas continuas.
- Verificación de calidad en e-commerce: dado un pedido y una foto del producto entregado, responder preguntas binarias sobre daños, coincidencia con el artículo o defectos visibles, con hasta 10 imágenes por petición.
- Clasificación zero-shot sin entrenamiento adicional: definir criterios en lenguaje natural en el momento de la inferencia (el pipeline es `zero-shot-classification`), lo que permite desplegar nuevas taxonomías sin reentrenar.
- Filtrado previo en pipelines generativos: decidir si una consulta debe escalarse a un LLM mayor o resolverse con reglas, reduciendo coste y latencia en cascada.

## Benchmarks y rendimiento

| Modelo | Parámetros | Kanana Decision Bench (texto, 15.909 preguntas) | Decision Index 0.4.1 public | Decision Index Vision 0.4.1 public | Promedio (public 2) |
|---|---|---|---|---|---|
| Kanana-2-v-decide-3b-2611 | 3B | **72,50** | 61,34 | **61,12** | **61,23** |
| StartLux-Decision-v1.1-2B-Instant | 2B | 54,38 | 59,17 | 59,90 | 59,54 |
| Liquid AI d1-3B | 3B | 52,71 | 48,97 | 51,86 | 50,42 |
| Base Labs Joey-1 | 2B | 42,38 | **63,31** | 54,23 | 58,77 |

Kanana Decision Bench es el conjunto interno coreano de evaluación de decisiones de Kakao (solo texto). El promedio se calcula sobre los dos benchmarks públicos mostrados. No se han publicado en la información disponible resultados de benchmarks estándar de LM (MMLU, HumanEval, GSM8K), ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,3 GB de pesos, más overhead de activaciones y del codificador visual; en la práctica, se recomienda un mínimo de 10-12 GB de VRAM para bf16 con margen.
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia; RTX 4090 (24 GB) para desarrollo y serving de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) en bf16; en tarjetas de 8-12 GB requeriría cuantización, para la cual no se documentan recetas oficiales.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True`, pipeline `decision`, y servidor HTTP propio `server_kanana_v_decide.py` (System One API, solo biblioteca estándar de Python). No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño system-one (una pasada, sin decodificación autoregresiva) reduce la latencia frente a esquemas generativos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Enfoque | Promedio público | Licencia |
|---|---|---|---|---|---|
| Kanana-2-v-decide-3b-2611 | 3,67B (0,49B vision + 3,18B LM) | 20.480 tokens, hasta 10 imágenes | Decisión multimodal calibrada (system-one) | 61,23 | kanana-open-license |
| StartLux-Decision-v1.1-2B-Instant | 2B | no disponible | Modelo de decisión | 59,54 | no disponible |
| Liquid AI d1-3B | 3B | no disponible | Modelo de decisión | 50,42 | no disponible |
| Base Labs Joey-1 | 2B | no disponible | Modelo de decisión | 58,77 | no disponible |

Kanana-2-v-decide-3b-2611 obtiene el mejor promedio público y el mejor resultado en Decision Index Vision, y una ventaja de 18 puntos en el conjunto interno coreano frente al siguiente mejor modelo comparado. Base Labs Joey-1 supera a Kanana en Decision Index (texto) con 63,31 frente a 61,34, pese a tener menos parámetros.

## Limitaciones y advertencias

- No genera texto: no sirve para tareas de generación, resumen, traducción ni diálogo abierto; solo responde a preguntas tipadas predefinidas.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano u otros idiomas no está evaluado ni garantizado.
- Riesgo de calibración degradada fuera del dominio de entrenamiento: las probabilidades pueden ser poco fiables en taxonomías o estados muy alejados de la distribución evaluada.
- Sesgos: la model card no documenta análisis de sesgos; al derivar de un LM coreano-inglés, es esperable heredar sesgos de sus datos de preentrenamiento.
- La licencia `kanana-open-license` es de tipo "other": es imprescindible revisar los términos del archivo LICENSE antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código en entornos de producción.
- No soporta tool calling, agentes ni razonamiento multi-paso; el paradigma system-one es de decisión directa en una pasada.
- Límite de 10 imágenes y 20.480 tokens por petición; estados más largos requieren truncado o segmentación.
- No se documentan recetas oficiales de cuantización ni soporte para motores de serving de alto rendimiento (vLLM, TGI), lo que limita el escalado out-of-the-box.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kakaocorp/kanana-2-v-decide-3b-2611
- Licencia: https://huggingface.co/kakaocorp/kanana-2-v-decide-3b-2611/blob/main/LICENSE
- Blog técnico de Kakao (coreano): https://tech.kakao.com/posts/846
