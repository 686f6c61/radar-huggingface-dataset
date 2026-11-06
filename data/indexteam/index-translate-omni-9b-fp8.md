# IndexTeam/Index-Translate-omni-9B-FP8

## Resumen

Index-Translate-omni-9B-FP8 es la exportación cuantizada en FP8 del modelo multimodal Index-Translate-Omni 9B, desarrollado por IndexTeam. Se trata de un modelo especializado en traducción que combina traducción de texto multilingüe, traducción de imágenes, reconocimiento automático de habla (ASR) y traducción bidireccional de voz chino-inglés en un único checkpoint. La arquitectura se construye sobre Qwen3.5, con 9.409.813.744 parámetros totales según los pesos safetensors del repositorio.

El modelo resuelve el problema de unificar tareas de traducción que tradicionalmente requieren pipelines separados (texto, imagen y voz) en un solo modelo con instrucciones en lenguaje natural y restricciones de terminología y formato. Es relevante porque ofrece una ruta de despliegue con pesos FP8 para el módulo de lenguaje, manteniendo visión en FP32 y audio en BF16, lo que reduce el espacio de almacenamiento del repositorio a 14,2 GB.

La licencia es Apache 2.0 y los idiomas declarados son chino e inglés, aunque los benchmarks de traducción de texto del modelo original cubren conjuntos multilingües como FLORES y WMT24++. Esta exportación incluye un runtime propio (`JointModel`) que no requiere el repositorio de entrenamiento original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (tag `qwen3_5`), con módulos de lenguaje, visión y audio |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (lenguaje, con escalas por canal y activaciones FP8 dinámicas por token, `FP8_DYNAMIC`); visión en FP32; audio en BF16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (no incluye GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que integra tres componentes: un módulo de lenguaje basado en Qwen3.5, un codificador visual y un codificador de audio con su conector. La exportación FP8 aplica cuantización al módulo de lenguaje con pesos FP8, escalas por canal y activaciones FP8 dinámicas por token, mientras que los tensores visuales se mantienen en FP32 (333 tensores byte-idénticos al origen) y los módulos de audio en BF16 (526 tensores byte-idénticos). `lm_head` y los embeddings de tokens no se cuantizan, y las proyecciones de atención lineal permanecen dentro de la receta de cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo original Index-Translate-Omni 9B se construye sobre Qwen3.5-9B, cuyos resultados se usan como línea base en los benchmarks de traducción de imagen. El runtime `JointModel` incluido solicita `dequantize=True` para compressed-tensors, lo que implica cómputo en BF16 tras la carga; no se trata de una aceleración con kernels FP8.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones de terminología y formato mediante instrucciones.
- Traducción de imágenes (image-to-text): extracción y traducción del texto presente en imágenes.
- Reconocimiento automático de habla (ASR) en chino e inglés.
- Traducción de voz bidireccional chino-inglés (speech-to-speech vía transcripción y traducción).
- Generación de texto con instrucciones en lenguaje natural (`text_generate`).
- Procesamiento de mensajes imagen-texto al estilo Transformers (`image_generate`).
- Procesamiento de audio con entrada WAV (`audio_generate`).
- Seguimiento de instrucciones de traducción con métricas específicas de calidad y off-target (IFMTBench, instTrans).

## Casos de uso

- Traducción de documentación técnica chino-inglés: el modelo acepta restricciones de terminología y formato, lo que permite fijar glosarios por proyecto y mantener consistencia en manuales y referencias de API.
- Localización de interfaces y capturas de pantalla: mediante `image_generate` se puede extraer y traducir el texto renderizado en imágenes, útil para equipos que localizan productos con capturas estáticas.
- Subtitulado y transcripción de reuniones bilingües: el ASR en chino e inglés junto con la traducción de voz permite generar transcripciones y traducciones de grabaciones en un solo paso.
- Atención al cliente en centros de contacto chino-inglés: la combinación de ASR y traducción de voz facilita conversaciones donde el agente y el cliente hablan idiomas distintos.
- Traducción de contenido audiovisual: el pipeline de audio a inglés permite procesar pódcast o vídeos en chino y obtener texto traducido para publicación.
- Investigación en traducción multimodal: el modelo sirve como base para experimentos que comparan traducción de texto, imagen y voz bajo una misma arquitectura, con la referencia de los benchmarks publicados del modelo original.
- Despliegue en entornos con memoria limitada: la exportación FP8 reduce el peso del módulo de lenguaje y el repositorio completo ocupa 14,2 GB, lo que facilita su alojamiento en infraestructura con GPUs de memoria moderada.

## Benchmarks y rendimiento

Los resultados siguientes son los del modelo original Index-Translate-Omni 9B reproducidos en la model card; no son mediciones nuevas de esta exportación FP8. La verificación de esta exportación se limita a pruebas de humo (recarga del checkpoint, generación de texto, descripción de imagen y una llamada de voz a inglés en H100) y a una perplejidad de texto de 27,3816 sobre 250 tokens retenidos.

Traducción de texto:

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate 2B | 0,8655 | 0,8489 | 60,26 | 0,6443 |
| Index-Translate 9B | 0,8789 | 0,8601 | 75,35 | 0,7387 |
| Index-Translate-Omni 9B | 0,8789 | 0,8601 | 75,35 | 0,7387 |
| Index-Translate-Omni 35BA3B | 0,8795 | 0,8593 | 78,01 | 0,7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate 9B | 0,6771 / 0,8209 | 0,5222 / 0,7725 / 3,47 % | 0,7957 / 0,8760 |
| Index-Translate-Omni 9B | 0,6771 / 0,8209 | 0,5222 / 0,7725 / 3,47 % | 0,7957 / 0,8760 |
| Index-Translate-Omni 35BA3B | 0,6867 / 0,8371 | 0,5163 / 0,7843 / 3,62 % | 0,7934 / 0,9070 |

Voz (CER en porcentaje, menor es mejor; BLEU y chrF2, mayor es mejor):

| Modelo | ASR chino CER ↓ | ASR inglés CER ↓ | Inglés → chino | Chino → inglés |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13,8113 | 34,2560 | 36,982 / 30,357 / 43,3452 | 30,747 / 51,152 / 48,0670 |
| Index-Translate-Omni 9B | 17,8917 | 14,4097 | 43,507 / 36,312 / 41,3767 | 34,656 / 55,376 / 46,3720 |
| Index-Translate-Omni 35BA3B | 18,6803 | 15,0850 | 42,081 / 35,836 / 49,2490 | 36,404 / 57,323 / 45,1546 |

Traducción de imagen (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Qwen3.5-9B | 73,814 | 67,804 | 68,963 |
| Index-Translate-Omni 9B | 77,604 | 68,438 | 71,815 |
| Index-Translate-Omni 35BA3B | 77,011 | 69,891 | 71,482 |

## Requisitos de hardware

- El repositorio completo ocupa 14,2 GB; el módulo de lenguaje está en FP8, la visión en FP32 y el audio en BF16.
- La verificación de la model card se realizó en una GPU H100 con el runtime `JointModel` y `device_map='auto'`.
- VRAM estimada para inferencia: no disponible de forma oficial; el tamaño del checkpoint (14,2 GB) da una cota inferior orientativa, a la que hay que sumar activaciones y caché KV.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100) son candidatas razonables, pero no se confirma en la información proporcionada.
- Despliegue: el método documentado es el runtime `JointModel` incluido en el repositorio, con `pip install -r requirements-joint.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- No se incluyen ficheros GGUF en este repositorio; la model card indica que GGUF es una exportación separada de lenguaje y visión sin el pipeline de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Traducción texto (FLORES COMET22) | Traducción imagen (MMTIT) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Index-Translate-Omni 9B (FP8) | 9,41 B | no disponible | 0,8789 | 77,604 | Apache 2.0 | Hugging Face, ModelScope |
| Index-Translate-Omni 2B | no disponible | no disponible | 0,8655 | 65,809 | no disponible | Hugging Face |
| Index-Translate-Omni 35BA3B | no disponible (MoE) | no disponible | 0,8795 | 77,011 | no disponible | Hugging Face |
| Qwen3.5-9B (base) | no disponible | no disponible | no disponible | 73,814 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Los benchmarks de texto, voz e imagen corresponden al modelo original en BF16; no se han publicado mediciones de calidad de traducción para esta exportación FP8.
- La verificación de la exportación se limita a pruebas de humo y una perplejidad de texto sobre 250 tokens; no es una evaluación exhaustiva.
- El runtime usa `dequantize=True`, por lo que el cómputo tras la carga es en BF16 y no se aprovechan kernels FP8; el beneficio principal es la reducción de tamaño en disco.
- Idiomas declarados limitados a chino e inglés; no se garantiza cobertura de otros idiomas aunque los benchmarks de texto del modelo original usen conjuntos multilingües.
- Riesgo de alucinación y de errores en terminología especializada no evaluado en esta exportación.
- Sesgos conocidos: no disponible en la información proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar cargas de documentos largos con garantías.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los componentes base (Qwen3.5) y de los datos de entrenamiento, no detalladas aquí.
- El pipeline de audio requiere descargar el repositorio completo, incluidas las carpetas `audio/` y `audio-tokenizer/`; no funciona con una exportación GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-9B-FP8
- Modelo original: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks del modelo de texto: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
- ModelScope: https://modelscope.cn/models/IndexTeam
