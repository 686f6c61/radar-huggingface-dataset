# axteam/gemma-4-E2B-it-AWQ-8bit

## Resumen

`axteam/gemma-4-E2B-it-AWQ-8bit` es una cuantizacion INT8 de tipo AWQ (W8A16) del modelo multimodal `google/gemma-4-E2B-it`, publicada por el usuario axteam y orientada especificamente al servicio de inferencia con vLLM. El modelo base pertenece a la familia Gemma 4 de Google y tiene una arquitectura densa (no MoE) con aproximadamente 5.100 millones de parametros totales, segun los pesos en safetensors del repositorio. La cuantizacion reduce el peso en disco a unos 8,5 GB, lo que facilita su despliegue en GPUs de gama media y alta sin renunciar practicamente a la fidelidad respecto al original en BF16.

La relevancia de esta ficha radica en que se trata de una cuantizacion de precision relativamente alta (INT8) con un esquema de calibracion AWQ revisado: el autor reconstruyo el repositorio el 1 de noviembre de 2026 tras detectar que la primera subida habia aplicado un redondeo simple (RTN) en lugar del suavizado AWQ prometido. Los benchmarks medidos con lm-evaluation-harness sobre vLLM muestran una recuperacion media del 100,7% respecto al BF16 en el conjunto de tareas evaluado, con un incremento marginal de perplejidad del 0,1%.

El modelo conserva las capacidades multimodales del original (entrada de imagen y texto, con torre de vision y torre de audio mantenidas en BF16), lo que lo convierte en una opcion practica para pipelines de inferencia que necesitan procesar imagenes y texto con un consumo de VRAM contenido. La licencia declarada es Apache-2.0, con enlace a la licencia especifica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (con torres de vision y audio) |
| Parametros totales | 5.104.297.539 (~5,1 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16, group size 32, activaciones BF16; pesos en compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibracion fue mayoritariamente en coreano; el modelo base es multilingue) |
| Licencia | Apache-2.0 (enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con aproximadamente 5.100 millones de parametros totales. La arquitectura incluye una torre de vision y una torre de audio, ademas de proyecciones multimodales, una tabla de embeddings por capa (`embed_tokens_per_layer`) y embeddings de tokens compartidos con el `lm_head`. En esta cuantizacion, el autor mantiene en BF16 la torre de vision, la torre de audio, las proyecciones vision/audio, los embeddings de tokens, la tabla de embeddings por capa y todas las normalizaciones, lo que representa aproximadamente el 64% de los parametros del modelo. Solo las capas de atencion y MLP se cuantizan a INT8.

La cuantizacion es post-entrenamiento (PTQ) con AWQ: se aplica suavizado por canal sobre las entradas de atencion (q/k/v, y solo q en las capas con KV compartida), las entradas del MLP (gate/up) y la entrada de la proyeccion down, usando 128 muestras de calibracion mayoritariamente en coreano y sin respuestas en modo thinking. No hay reentrenamiento ni QAT. El autor documenta que la primera subida del repositorio (revision `a22f608`) no aplico realmente el suavizado AWQ y era efectivamente RTN, por lo que fue reconstruida el 1 de noviembre de 2026. El tokenizador, la plantilla de chat, el `processor_config` y el `generation_config` son identicos byte a byte a los del original, e incluyen la plantilla de chat corregida por Google en julio de 2026.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato instruct (`-it`).
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), con torre de vision mantenida en BF16.
- Procesamiento de audio, segun la presencia de torre de audio en el modelo base.
- Razonamiento y respuesta a preguntas segun los benchmarks medidos (MMLU, ARC-Challenge, Winogrande, KMMLU, HAE-RAE).
- Razonamiento matematico basico y de varios pasos (GSM8K evaluado en modo estricto con 5-shot).
- Capacidades multilingues, con evaluacion especifica en coreano (KMMLU, HAE-RAE) y en ingles.
- Compatibilidad con vLLM y transformers para despliegue en produccion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: la calibracion excluyo respuestas en modo thinking; no se documenta soporte explicito.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo puede desplegarse con vLLM 0.32 sobre una unica GPU y atender conversaciones que combinan texto e imagenes, manteniendo la torre de vision en BF16 para preservar la calidad de la representacion visual.
- Clasificacion y extraccion de informacion a partir de imagenes: gracias al pipeline `image-text-to-text`, se puede usar para transcribir, resumir o estructurar contenido de capturas, formularios o documentos escaneados.
- Asistencia en coreano e ingles: los benchmarks KMMLU (40,69) y HAE-RAE (62,24) indican un rendimiento util en tareas de conocimiento y comprension en coreano, adecuado para productos dirigidos a ese mercado.
- Razonamiento aritmetico y problemas de varios pasos: el resultado en GSM8K (53,98 en 5-shot estricto) lo hace apto para asistentes educativos o de calculo basico donde no se requiera precision matematica avanzada.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye mediciones de fidelidad (perplejidad, acuerdo top-1) frente al BF16, lo que lo convierte en un punto de referencia util para experimentos de PTQ en entornos de investigacion.
- Despliegue con requisitos de VRAM ajustados: al ocupar unos 8,5 GB en disco y mantener solo el 36% de los parametros en INT8, permite servir el modelo en GPUs de 16-24 GB junto con el resto del stack de vLLM.
- Prototipado rapido de aplicaciones multimodal: la compatibilidad con transformers y vLLM permite integrarlo en notebooks y pipelines existentes sin adaptaciones de tokenizador ni de plantilla de chat.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, modo greedy, few-shot completion sin plantilla de chat. Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 55,97 | 55,49 (99,1%) | 56,25 (100,5%) | 53,40 (95,4%) | 50,06 (89,4%) | 54,57 (97,5%) |
| GSM8K (5-shot, strict) | 51,63 | 48,82 (94,6%) | 53,98 (104,6%) | 48,52 (94,0%) | 38,13 (73,9%) | 40,03 (77,5%) |
| ARC-Challenge (0-shot) | 49,57 | 48,04 (96,9%) | 49,23 (99,3%) | 48,63 (98,1%) | 45,48 (91,7%) | 44,80 (90,4%) |
| Winogrande (5-shot) | 62,59 | 60,77 (97,1%) | 62,51 (99,9%) | 61,25 (97,9%) | 58,88 (94,1%) | 60,54 (96,7%) |
| KMMLU (5-shot, direct) | 40,72 | 40,70 (100,0%) | 40,69 (99,9%) | 39,51 (97,0%) | 37,95 (93,2%) | 39,45 (96,9%) |
| HAE-RAE (0-shot) | 62,14 | 62,05 (99,9%) | 62,24 (100,1%) | 59,67 (96,0%) | 57,01 (91,7%) | 60,59 (97,5%) |
| Promedio | 53,77 | 52,65 (97,9%) | 54,15 (100,7%) | 51,83 (96,4%) | 47,92 (89,1%) | 50,00 (93,0%) |

Fidelidad respecto al BF16 original en un conjunto interno mixto ingles/coreano de 100 prompts:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1845 | 1,1833 (+0,1%) |
| Acuerdo top-1 en el siguiente token | 98,5% | 99,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,5 GB para los pesos cuantizados, mas overhead de activaciones BF16, cache KV y contexto; en la practica se recomienda un minimo de 16 GB de VRAM para servicio con contexto moderado.
- GPUs recomendadas: NVIDIA A100, H100 o L40S para produccion con concurrencia; RTX 4090 (24 GB) valida para despliegue individual.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas con 16 GB o mas, siempre que se ajuste el tamano de contexto y el numero de peticiones concurrentes.
- Opciones de despliegue: vLLM 0.32.0 (probado por el autor; la arquitectura esta disponible desde vLLM 0.19.0) y transformers. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Requisitos de entorno para vLLM 0.32: Python 3.11-3.14, torch 2.13 con build CUDA 13.0 y driver NVIDIA compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-AWQ-8bit (este repo) | ~5,1 mil millones | no disponible | AWQ INT8 W8A16 | Apache-2.0 | Hugging Face (axteam) |
| google/gemma-4-E2B-it (BF16) | ~5,1 mil millones | no disponible | BF16 | Gemma 4 / Apache-2.0 | Hugging Face (Google) |
| gemma-4-E2B-it FP8-dynamic | ~5,1 mil millones | no disponible | FP8 dinamico | Gemma 4 / Apache-2.0 | Referenciado en benchmarks del autor |
| gemma-4-E2B-it NVFP4 | ~5,1 mil millones | no disponible | NVFP4 | Gemma 4 / Apache-2.0 | Referenciado en benchmarks del autor |
| gemma-4-E2B-it AWQ-4bit | ~5,1 mil millones | no disponible | AWQ 4 bits | Gemma 4 / Apache-2.0 | Referenciado en benchmarks del autor |

Las alternativas comparadas comparten el mismo modelo base y solo difieren en el esquema de cuantizacion. Segun los datos del autor, la variante AWQ-8bit iguala o supera ligeramente al BF16 en el promedio de benchmarks (54,15 frente a 53,77), mientras que NVFP4 y AWQ-4bit pierden entre un 7% y un 11% de rendimiento medio. No se dispone de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La calibracion AWQ se realizo con 128 muestras mayoritariamente en coreano y sin respuestas en modo thinking; el comportamiento en otros idiomas o en tareas de razonamiento extendido puede desviarse mas respecto al BF16.
- La revision anterior del repositorio (`a22f608`, subida antes del 1 de noviembre de 2026 a las 10:13:15 UTC) no aplico realmente el suavizado AWQ y era efectivamente RTN; si se descargo antes de esa fecha, debe descargarse de nuevo.
- La licencia declarada es Apache-2.0, pero el enlace apunta a la licencia especifica de Gemma 4 de Google; conviene revisar los terminos de uso comercial de Gemma 4 antes de desplegar en produccion.
- Riesgo de alucinacion: no se documenta en la informacion proporcionada, pero es inherente a los modelos de lenguaje de esta escala.
- Sesgos conocidos: no se documentan en la informacion proporcionada.
- La longitud de contexto no esta especificada en la ficha, lo que impide planificar cargas con ventanas largas.
- El rendimiento en tool calling, agentes y razonamiento multi-paso no esta documentado para esta variante.
- El modelo esta pensado para vLLM; no se garantiza compatibilidad con otros motores de inferencia como llama.cpp u Ollama.
- El repositorio tiene un volumen de descargas bajo (95) y un unico like, por lo que no cuenta con validacion amplia de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/gemma-4-E2B-it-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
