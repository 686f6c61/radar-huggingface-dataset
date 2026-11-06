# IndexTeam/Index-Translate-omni-35B-FP4

## Resumen

Index-Translate-omni-35B-FP4 es una exportación cuantizada en NVFP4 del modelo multimodal de traducción Index-Translate-Omni 35BA3B, desarrollado por IndexTeam. El modelo original combina traducción de texto multilingüe, traducción de imágenes, reconocimiento automático de voz (ASR) y traducción bidireccional de voz chino-inglés en un único sistema con arquitectura de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parámetros totales y 3.000 millones activos (35BA3B). Esta variante FP4 no es un modelo nuevo: reproduce el snapshot público completo del original (74 ficheros verificados por SHA-256, 693 tensores de lenguaje, 333 de visión y 529 de audio compartido) y aplica cuantización NVFP4 únicamente a los pesos del módulo de lenguaje.

La relevancia de esta exportación reside en la reducción del coste de memoria del bloque de lenguaje manteniendo intactos los módulos de visión (FP32) y audio (BF16), lo que permite desplegar un sistema de traducción multimodal en hardware de generación Blackwell. No obstante, la ruta de inferencia acelerada en FP4 nativo no está validada en este repositorio: el runtime incluido (`fp4_reference.py` con `JointModel`) descomprime y deconvierte a BF16 para pruebas de corrección, por lo que exige memoria equivalente a BF16 y no ofrece serving acelerado.

El modelo está publicado bajo licencia Apache 2.0, soporta chino e inglés como idiomas declarados, y su pipeline en Hugging Face es `translation`. La model card reproduce resultados de benchmarks del modelo original, no de esta exportación cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) para el módulo de lenguaje; encoder de visión y encoder/decoder de audio compartido |
| Parametros totales | 35B (35BA3B) |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos de lenguaje en bloques de 16 elementos con escalas de activación calibradas, NVIDIA ModelOpt 0.44); visión en FP32; audio en BF16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export ModelOpt, requiere runtime propio `JointModel`) |

## Arquitectura y entrenamiento

El modelo original Index-Translate-Omni 35BA3B emplea una arquitectura MoE con 35.000 millones de parámetros totales y 3.000 millones activos por token, sobre la que se integran tres modalidades: un bloque de lenguaje para traducción de texto, un encoder de visión para traducción de imágenes (image-to-text) y un encoder/connector de audio compartido para las cuatro tareas de voz (ASR chino, ASR inglés, inglés→chino y chino→inglés). El audio utiliza un único encoder y connector compartidos para todas las tareas, optimizando el coste paramétrico del sistema multimodal.

Esta exportación FP4 aplica cuantización NVFP4 solo al módulo de lenguaje, excluyendo de la cuantización `lm_head`, embeddings de tokens, módulos de atención linear y routers MoE; las capas MLP ordinarias (`gate_proj`) sí se cuantizan. Los tensores de visión se conservan en FP32 byte a byte respecto al origen y los de audio en BF16 original. El proceso de cuantización se realizó con NVIDIA ModelOpt 0.44. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Traducción de texto multilingüe con restricciones de terminología y formato (capacidad `instTrans` e `IFMTBench` evaluadas en la model card).
- Traducción de imágenes (image-to-text): renderizado y traducción de texto presente en imágenes, evaluada en MMTIT, FLORES-rendered y Vistra.
- Reconocimiento automático de voz (ASR) en chino e inglés.
- Traducción bidireccional de voz chino↔inglés con salida de texto.
- Seguimiento de instrucciones de traducción con control de terminología y formato.
- Generación multimodal conjunta mediante el runtime `JointModel` (`text_generate`, `audio_generate`, `image_generate`).
- Capacidades de agente, tool calling o function calling: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Traducción automática de documentación técnica zh↔en: el bloque de lenguaje con 3B parámetros activos y control de terminología permite mantener glosarios consistentes en pipelines de localización, usando `text_generate` con mensajes de sistema que fijen terminología.
- Localización de capturas de pantalla y material gráfico: `image_generate` procesa imágenes y traduce el texto renderizado, adecuado para interfaces de producto, manuales ilustrados y material de marketing bilingüe.
- Subtitulado y transcripción bilingüe de reuniones: `audio_generate` con ASR chino o inglés y traducción posterior permite generar actas y subtítulos en el idioma destino en una sola pasada.
- Traducción de voz en tiempo real en atención al cliente: el encoder de audio compartido cubre las cuatro tareas de voz, lo que simplifica el despliegue de un servicio de interpretación chino↔inglés sobre una única pila de modelos.
- Evaluación de calidad de traducción en pipelines de datos: los resultados COMET22 y IFscore del modelo original permiten usarlo como generador de referencia en procesos de control de calidad de corpus multilingües.
- Investigación en cuantización FP4: el repositorio incluye `fp4_reference.py` para verificar la corrección de la deconversión a BF16, útil para estudiar el impacto de NVFP4 en modelos MoE multimodales.
- Prototipado de asistentes documentales multimodales: combinando texto, imagen y audio en un único `JointModel`, se pueden construir flujos de digitalización y traducción de expedientes con múltiples formatos de entrada.

## Benchmarks y rendimiento

Los resultados siguientes corresponden al modelo original Index-Translate-Omni 35BA3B, reproducidos en la model card; no son mediciones de esta exportación FP4.

Traducción de texto (COMET22 y jueces):

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |

Voz (CER en porcentaje, menor es mejor; BLEU y chrF2 mayores son mejores; celdas de traducción en BLEU / chrF2 / CER destino):

| Modelo | ASR chino CER ↓ | ASR inglés CER ↓ | Inglés → Chino | Chino → Inglés |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 13.0053 | 15.4950 | 40.074 / 32.862 / 44.8097 | 32.411 / 53.452 / 46.1700 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |

Traducción de imágenes (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Index-Translate-Omni 2B | 65.809 | 53.612 | 65.596 |
| Qwen3.5-35B-A3B (baseline) | 75.602 | 70.005 | 71.067 |

## Requisitos de hardware

- Inferencia FP4 nativa: requiere backend compatible con la generación Blackwell de NVIDIA; H100 no es Blackwell y no puede ejecutar FP4 nativo.
- El runtime incluido (`JointModel` + `fp4_reference.py` + ModelOpt) deconvierte los pesos a BF16, por lo que necesita memoria del orden de un modelo BF16 de 35B (aproximadamente 70 GB de pesos más activaciones y módulos de visión/audio).
- VRAM estimada para la ruta de referencia BF16: no disponible con cifra oficial; el repositorio documenta que exige "memoria de tamano BF16".
- GPU recomendadas: Blackwell (B200, RTX 50xx) para FP4 nativo; A100/H100 solo para la ruta de referencia BF16, no acelerada.
- Despliegue: no se recomienda `AutoModelForImageTextToText.from_pretrained` directamente sobre esta exportación ModelOpt; debe usarse el runtime `JointModel` con `requirements-joint.txt`.
- vLLM, llama.cpp, Ollama o TGI: no disponibles como opciones de despliegue en la información proporcionada.
- Latencia y throughput: no disponibles; el serving FP4 nativo no ha sido validado en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Traduccion texto (FLORES COMET22) | Traduccion imagen (MMTIT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Translate-omni-35B-FP4 | 35B (3B activos) | no disponible | 0.8795 (original) | 77.011 (original) | apache-2.0 | Hugging Face (export FP4) |
| Index-Translate-Omni 9B | 9B | no disponible | 0.8789 | 77.604 | apache-2.0 | ModelScope / Hugging Face |
| Index-Translate-Omni 2B | 2B | no disponible | 0.8655 | 65.809 | apache-2.0 | ModelScope / Hugging Face |
| Qwen3.5-35B-A3B (baseline multimodal) | 35B (3B activos) | no disponible | no disponible | 75.602 | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas declarados limitados a chino e inglés; otras lenguas no están cubiertas según la model card.
- Los benchmarks publicados pertenecen al modelo original BF16, no a esta exportación FP4; no hay mediciones de degradación por cuantización en el repositorio.
- El serving FP4 nativo no ha sido validado; la única ruta verificada es la deconversión a BF16, que anula el ahorro de memoria.
- `AutoModelForImageTextToText.from_pretrained` no debe usarse directamente sobre esta exportación ModelOpt.
- La generación de audio está limitada a 256 tokens nuevos; un caso inglés→chino alcanzó ese límite sin producir traducción en la evaluación original.
- El ASR inglés requiere `repetition_penalty=1.1`; el ASR chino usa una guarda de generación con `max_new_tokens=256`.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Restricciones comerciales: Apache 2.0 permite uso comercial, pero la dependencia de NVIDIA ModelOpt y de un backend Blackwell puede condicionar el despliegue.
- El repositorio figura con 0 descargas y 0 likes, y tamaño de repo de 0.0 GB en Hugging Face, lo que sugiere que los pesos podrían no estar materializados en la plataforma; conviene verificar antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-35B-FP4
- Modelo original en ModelScope: https://modelscope.cn/models/IndexTeam/Index-Translate-omni-35B
- Benchmarks publicados de la familia: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
