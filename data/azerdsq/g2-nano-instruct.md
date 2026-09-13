# AZERDSQ/G2-nano-instruct

## Resumen

G2-nano-instruct es un modelo de lenguaje causal decoder-only de 60,03 millones de parámetros desarrollado por AZERDSQ, entrenado desde cero en una única NVIDIA Jetson Orin Nano con 8 GB de memoria unificada. Se trata de la versión con ajuste supervisado (SFT) del checkpoint G2-nano-base: parte de un preentrenamiento de 3.001.842.523 tokens (el doble que su predecesor G1-nano) y después recibe un ajuste por instrucciones sobre 60.000 conversaciones en inglés durante 3 épocas a longitud de secuencia 1024. Emplea una arquitectura tipo Llama con 14 capas, hidden size 576, atención GQA (9 cabezas de consulta por 1 cabeza de clave/valor), RoPE, SwiGLU y RMSNorm.

El propio autor lo presenta explícitamente como un registro de laboratorio y no como una mejora: el SFT *empeora* la media de 7 tareas respecto a G2-nano-base (40,16 % frente a 42,13 %, −1,97 puntos) y también queda por debajo de G1-nano-instruct en la media de 6 tareas (42,28 % frente a 43,74 %, −1,46 puntos). La caída más acusada se da en SciQ (−11,00 puntos) y ARC-Easy (−5,01 puntos). Por tanto, su relevancia no está en el rendimiento, sino en documentar de forma transparente un experimento de entrenamiento reproducible en hardware de borde y en servir como material de estudio sobre tokenización, plantillas de chat y evaluación con `lm-evaluation-harness`.

El contexto nativo es de 2.048 tokens, aunque el ajuste por instrucciones se ejecutó a 1.024 tokens. El vocabulario es de 16.388 entradas (16.384 de SentencePiece más 4 tokens de chat) y el modelo es exclusivamente en inglés. La licencia es Apache 2.0, con pesos, tokenizador y código de inferencia liberados, pero sin código de entrenamiento ni pipelines de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (causal LM), atención completa sin ventana deslizante |
| Parametros totales | 60.033.600 (60,03 M) |
| Parametros activos | No aplica (no es MoE, es denso) |
| Longitud de contexto | 2.048 tokens nativos; el SFT se ejecutó a 1.024 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; el autor no documenta cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

Datos arquitectónicos adicionales: 14 capas, hidden size 576, GQA con 9 cabezas de consulta y 1 cabeza KV (head_dim 64), RoPE con θ=10000, feed-forward SwiGLU con hidden 1664, normalización RMSNorm, vocabulario de 16.388 tokens. Tamaño del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

El modelo sigue el diseño de G1-nano: un transformer decoder-only con prenormalización RMSNorm, atención con RoPE y agrupación de consultas (GQA) en proporción 9:1, y capas feed-forward SwiGLU. La atención es completa a la longitud entrenada, sin mecanismos de atención lineal ni ventanas deslizantes. Con 60 M de parámetros y 14 capas, la profundidad es relativamente alta para su tamaño, lo que se traduce en un hidden size pequeño (576) y un FFN de 1664. El tokenizador es SentencePiece con 16.384 tokens, ampliado con cuatro tokens especiales de chat (`<|user|>`, `<|assistant|>`, `<|end|>`, `<|system|>`).

El preentrenamiento consumió 3.001.842.523 tokens con la siguiente composición: FineWeb-Edu 66 %, OpenWebText 15 %, PG-19 7,5 %, Wikipedia EN 5 %, BookCorpus 5 % y WikiHow 1,5 % (con límite). El objetivo fue predicción causal del siguiente token. Después se aplicó SFT supervisado (no se menciona RLHF ni DPO) durante 3 épocas a longitud de secuencia 1024 sobre una mezcla de 60.000 conversaciones en inglés procedentes de Claude 4.6, Qwen2.5-72B Magpie, SmolTalk2 Magpie, Llama-3.1-70B everyday, UltraChat, OpenHermes 2.5 y Llama 3.3 70B Magpie, con formato mixto de un solo turno y multiturno. Todo el entrenamiento se realizó en una Jetson Orin Nano de 8 GB, lo que constituye la innovación metodológica principal del proyecto: demostrar un pipeline completo de preentrenamiento más SFT dentro de un presupuesto de memoria unificada muy restrictivo.

## Capacidades

- Generación de texto en inglés con formato de chat mediante plantilla integrada (`<|user|>` / `<|assistant|>` / `<|end|>` / `<|system|>`).
- Conversación multiturno básica, ya que la mezcla de SFT incluye diálogos de uno y varios turnos.
- Respuesta a preguntas de opción múltiple de conocimiento general y ciencia a nivel elemental (resultados por encima del azar en PIQA, WinoGrande, ARC-Challenge y SciQ).
- Continuación de texto y modelado de lenguaje causal, heredado del preentrenamiento.
- Ejecución en Ollama con la plantilla de chat ya incorporada (`ollama run azerdsq/g2-nano-instruct`).
- Generación de secuencia única: no admite inferencia por lotes con padding.
- No dispone de soporte documentado de tool calling, function calling, uso de agentes, modos de razonamiento explícito (thinking), visión ni audio.
- Capacidad factual muy limitada por el tamaño del modelo y por un vocabulario de solo 16.388 tokens.

## Casos de uso

- Estudio y docencia de arquitecturas transformer: el repositorio incluye una implementación propia de transformer (`trust_remote_code=True`) y un tamaño de 60 M de parámetros que permite leer el código completo, inspeccionar formas de tensores y reproducir el forward pass en un portátil sin GPU dedicada.
- Experimentación con tokenizadores de vocabulario reducido: con 16.388 entradas (frente a las 32k-128k habituales), sirve para medir el impacto del vocabulario en la longitud efectiva de secuencia y en el coste de embedding sobre corpus en inglés.
- Pruebas de pipelines de evaluación: al estar evaluado con `lm-evaluation-harness` 0.4.11 en 7 tareas, es útil como sujeto de pruebas para validar configuraciones del harness, comparar métricas `acc` y verificar la reproducibilidad de resultados en modelos pequeños.
- Ajuste fino educativo y ablaciones de SFT: su pareja base/instruct permite estudiar empíricamente cómo el ajuste supervisado degrada tareas de opción múltiple corta (por ejemplo, replicando la caída de 11 puntos en SciQ) y analizar el olvido catastrófico en modelos diminutos.
- Despliegue en dispositivos de borde con memoria muy limitada: al ocupar unos 120 MB en FP16 y unos 30 MB en cuantización de 4 bits (estimación a partir del número de parámetros), es viable en microcontroladores con Linux, SBCs tipo Raspberry Pi o sistemas embebidos donde no cabe ningún modelo de miles de millones de parámetros.
- Generación de plantillas y texto de relleno en inglés para pruebas de integración: sirve para validar end-to-end un servicio de inferencia (carga de tokenizador, plantilla de chat, streaming, truncado a 1.024-2.048 tokens) sin coste de GPU.
- Modelo borrador para decodificación especulativa: su tamaño reducido y su compatibilidad con el ecosistema transformers lo hacen candidato a *draft model* en experimentos de speculative decoding, aunque el autor no documenta ni valida este uso.
- Prototipado de interfaces conversacionales con restricciones de privacidad: al ejecutarse localmente y ser Apache 2.0, permite montar demos de chat completamente *on-device*, siempre que no se requiera precisión factual.

## Benchmarks y rendimiento

Evaluación zero-shot sobre conjuntos de test completos con `lm-evaluation-harness` 0.4.11, métrica `acc`:

| Tarea | G2-nano-base | G2-nano-instruct |
|---|---:|---:|
| LAMBADA (OpenAI) | 24,37 % | 24,72 % |
| PIQA | 58,60 % | 58,71 % |
| WinoGrande | 51,46 % | 50,99 % |
| ARC-Easy | 44,11 % | 39,10 % |
| ARC-Challenge | 19,11 % | 21,25 % |
| HellaSwag | 27,36 % | 27,47 % |
| SciQ | 69,90 % | 58,90 % |
| **media_7** | **42,13 %** | **40,16 %** |
| **media_6** | **44,59 %** | **42,28 %** |

Comparación con G1-nano-instruct (solo media_6; G1-instruct no incluye HellaSwag en la tabla):

| Tarea | G2-nano-instruct | G1-nano-instruct |
|---|---:|---:|
| LAMBADA (OpenAI) | 24,72 % | 23,09 % |
| PIQA | 58,71 % | 60,34 % |
| WinoGrande | 50,99 % | 52,57 % |
| ARC-Easy | 39,10 % | 42,13 % |
| ARC-Challenge | 21,25 % | 20,48 % |
| SciQ | 58,90 % | 63,80 % |
| **media_6** | **42,28 %** | **43,74 %** |

Las mayores caídas del SFT respecto a G2-nano-base son SciQ (−11,00 puntos) y ARC-Easy (−5,01 puntos). HellaSwag se mantiene cerca del azar (~27 %). No se ejecutó ninguna evaluación cualitativa de 20 prompts, y el autor advierte que estas tareas son de opción múltiple corta y no miden contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia (según el número de parámetros, sin contar activaciones): ~240 MB en FP32, ~120 MB en FP16/BF16, ~60 MB en INT8 y ~30 MB en INT4. Caché KV muy reducida: con 1 cabeza KV de dimensión 64 en 14 capas, aproximadamente 3,5 KB por token en FP16 (unos 7 MB a 2.048 tokens).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050, una iGPU moderna o una Jetson Orin Nano (el propio hardware de entrenamiento) son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente todas, incluidas tarjetas de gama de entrada con 2-4 GB. También se ejecuta en CPU sin dificultad.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía `AutoModelForCausalLM` y `AutoTokenizer`) y Ollama (`ollama run azerdsq/g2-nano-instruct`). No hay evidencia de soporte para vLLM, TGI, SGLang ni llama.cpp; además, el autor indica que el modelo solo admite generación de secuencia única sin inferencia por lotes con padding, lo que limita su uso en servidores de alto rendimiento. No se publican pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.
- Estrategias de eficiencia recomendadas: `torch_dtype` en float16/bfloat16 y `device_map` automático para repartir entre CPU y GPU; dado el tamaño, no es necesario ningún tipo de paralelismo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento (media_6) | Disponibilidad |
|---|---|---|---|---|---|---|
| AZERDSQ/G2-nano-instruct | 60,03 M | 2.048 (SFT a 1.024) | Inglés | Apache 2.0 | 42,28 % | HuggingFace + Ollama |
| AZERDSQ/G2-nano-base | 60,03 M | 2.048 | Inglés | Apache 2.0 | 44,59 % | HuggingFace |
| AZERDSQ/G1-nano-instruct | No disponible en la informacion proporcionada | No disponible | Inglés | Apache 2.0 | 43,74 % | HuggingFace + Ollama |

No se dispone de datos de benchmarks comparables con modelos externos de tamaño similar (por ejemplo, GPT-2 124M, SmolLM-135M o TinyLlama-1.1B) dentro de la información proporcionada, por lo que no se incluyen cifras de terceros. La comparación más relevante es interna a la familia: para uso conversacional, el propio autor recomienda G1-nano-instruct por delante de G2-nano-instruct.

## Limitaciones y advertencias

- El propio autor advierte que este checkpoint **no es una mejora** sobre G1-nano-instruct y que no debe preferirse para chat.
- El SFT degrada la suite canónica de evaluación: la media de 7 tareas baja 1,97 puntos respecto a G2-nano-base, con caídas de 11,00 puntos en SciQ y 5,01 puntos en ARC-Easy.
- Con 60 M de parámetros, la retención factual es muy limitada: alto riesgo de alucinación en preguntas de conocimiento, fechas, cifras y entidades poco frecuentes.
- Contexto nativo de solo 2.048 tokens, y el ajuste por instrucciones se realizó a 1.024 tokens, por lo que el comportamiento más allá de esa longitud no está validado.
- Modelo exclusivamente en inglés: no soporta castellano ni otros idiomas.
- Solo generación de secuencia única; no admite inferencia por lotes con padding, lo que penaliza el throughput en producción.
- Rendimiento cercano al azar en HellaSwag (~27 %), lo que indica una comprensión limitada de escenarios de sentido común.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio: conviene auditar la implementación antes de desplegarla en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero solo cubre pesos, tokenizador y código de inferencia; el código de entrenamiento, los pipelines de datos y los checkpoints intermedios no se distribuyen.
- El autor desaconseja explícitamente su uso para decisiones de alto riesgo, verificación factual, consejo médico, asesoramiento legal o acciones autónomas.
- No se ha ejecutado ninguna evaluación cualitativa de 20 prompts, por lo que el comportamiento conversacional real no está documentado más allá de las métricas de opción múltiple.
- La fecha de creación registrada en el repositorio (2026-09-13) es inusualmente futura respecto a la información disponible; conviene verificarla antes de citarla.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que significa que no existe validación comunitaria independiente de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AZERDSQ/G2-nano-instruct
- Contraparte preentrenada (base): https://huggingface.co/AZERDSQ/G2-nano-base
- Organización en HuggingFace: https://huggingface.co/AZERDSQ
- Versión en Ollama: https://ollama.com/azerdsq/g2-nano-instruct
- Versión en Ollama recomendada para chat (G1): https://ollama.com/azerdsq/g1-nano-instruct
- Paper, blog técnico o demo adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (únicamente enlaces genéricos a Google Maps sin relación con el proyecto).
