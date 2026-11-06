# IndexTeam/Index-Translate-omni-9B-FP4

## Resumen

Index-Translate-omni-9B-FP4 es una exportación cuantizada en NVFP4 del modelo multimodal Index-Translate-Omni 9B, desarrollado por IndexTeam. Se trata de un modelo de traducción «omni» que cubre texto multilingüe, traducción de imágenes, reconocimiento automático de voz (ASR) y traducción bidireccional de voz chino-inglés, todo dentro de un único transformer multimodal construido sobre la arquitectura Qwen3.5. El checkpoint que nos ocupa pesa 13,5 GB y contiene 6.759.013.616 parámetros reales en safetensors, pese a la etiqueta «9B» del nombre comercial.

La relevancia de esta variante concreta es doble. Por un lado, empaqueta en un solo modelo tareas que tradicionalmente requieren pipelines separados (MT, OCR + MT, ASR y traducción de voz), lo que simplifica el despliegue. Por otro, aplica cuantización NVFP4 con escalas de activación calibradas mediante NVIDIA ModelOpt 0.44, manteniendo en FP32 los tensores de visión y en BF16 el encoder de audio, una estrategia de cuantización selectiva que excluye `lm_head`, embeddings, módulos de atención lineal y routers MoE.

Conviene subrayar que esta exportación no es un checkpoint listo para servirlo con `AutoModelForImageTextToText.from_pretrained`. La inferencia nativa NVFP4 exige hardware Blackwell, y el runtime incluido (`JointModel`) descomprime a BF16 para verificación, por lo que no constituye una ruta acelerada de serving. Es, en la práctica, un artefacto orientado a evaluación y a despliegues sobre GPUs Blackwell con backend compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (tag `qwen3_5`), con atención lineal y componentes MoE en el modelo base; encoder de visión y encoder de audio |
| Parametros totales | 6.759.013.616 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos de lenguaje en bloques de 16 elementos con escalas de activación calibradas); visión en FP32; audio en BF16; etiqueta adicional `8-bit` en los tags |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export ModelOpt), con directorios `audio/` y `audio-tokenizer/`; runtime propio `joint_runtime` |

## Arquitectura y entrenamiento

El modelo se apoya en la familia Qwen3.5, un transformer con módulos de atención lineal y componentes MoE en el modelo base de referencia (el modelo original de 35B se denomina 35BA3B, lo que sugiere 3B parámetros activos, aunque para esta exportación de 9B el dato de parámetros activos no está disponible). Sobre esa columna vertebral, IndexTeam añade un encoder de visión y un encoder de audio con su conector, lo que habilita las modalidades image-text-to-text y speech. La cuantización NVFP4 se aplica solo a las capas lineales ordinarias del lenguaje; quedan excluidos `lm_head`, los embeddings de tokens, los módulos de atención lineal y los routers MoE, mientras que las proyecciones `gate_proj` de los MLP sí se cuantizan.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card reproduce los resultados del modelo original (Index-Translate-Omni 9B) y aclara explícitamente que no son benchmarks nuevos de esta exportación cuantizada. La verificación realizada sobre este checkpoint se limita a pruebas de humo: recarga del checkpoint, generación de texto, una llamada de descripción de imagen y una generación real de voz a inglés sobre un WAV, ejecutadas en una H100. La perplejidad de texto reportada es 28,5391 sobre 250 tokens retenidos en modo de carga de referencia.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones de terminología y formato (etiquetas `index-translate`, `translation`).
- Traducción de imágenes: extracción y traducción del texto presente en imágenes (image-to-text, MMTIT, FLORES-rendered, Vistra).
- Reconocimiento automático de voz (ASR) en chino e inglés.
- Traducción de voz bidireccional chino-inglés (speech-to-speech vía transcripción y traducción).
- Cumplimiento de instrucciones de traducción con restricciones (instTrans, IFMTBench), incluyendo control de términos obligatorios y minimización de off-target.
- Procesamiento multimodal conjunto mediante mensajes image-text compatibles con Transformers.
- Generación de texto general a través de `JointModel.text_generate`.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Localización de documentación técnica: el modelo traduce texto chino-inglés respetando terminología impuesta mediante restricciones, lo que encaja en flujos de localización donde un glosario corporativo debe mantenerse consistente entre versiones.
- Traducción de capturas de pantalla y material gráfico: gracias a su rama de visión, puede procesar imágenes con texto incrustado (interfaces, infografías, diapositivas) y devolver la traducción, reduciendo la necesidad de pipelines OCR + MT separados.
- Subtitulado y transcripción bilingüe: la rama de ASR permite transcribir audio en chino o inglés y, combinada con la traducción de voz, generar subtítulos traducidos para contenido audiovisual.
- Atención al cliente en organizaciones con operaciones chino-inglés: permite transcribir mensajes de voz, traducirlos y responder en el idioma del usuario, aunque el contexto máximo no está documentado y conviene validarlo antes de usarlo en conversaciones largas.
- Investigación en traducción multimodal: sirve como checkpoint de referencia cuantizado para estudiar el impacto de NVFP4 en calidad de traducción de texto, imagen y voz, comparando contra el modelo BF16 original.
- Evaluación de infraestructura Blackwell: útil para equipos que quieran medir el comportamiento de un export ModelOpt NVFP4 en GPUs de nueva generación antes de adoptar esta ruta de cuantización en producción.
- Prototipado de asistentes de viaje o atención presencial: un único modelo puede transcribir, traducir y describir imágenes de carteles o menús, simplificando el stack en aplicaciones móviles o kioscos.

## Benchmarks y rendimiento

Los datos siguientes corresponden al modelo original Index-Translate-Omni 9B, tal como reproduce la model card; no son resultados medidos sobre esta exportación FP4.

Traducción de texto:

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Cumplimiento de instrucciones:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |

Voz (CER en porcentaje, menor es mejor; BLEU y chrF2, mayor es mejor):

| Modelo | ASR chino CER ↓ | ASR inglés CER ↓ | Inglés → Chino | Chino → Inglés |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Traducción de imágenes (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Qwen3.5-9B (base) | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

Verificación específica de esta exportación FP4: recarga y generación de texto correctas; el runtime portátil superó una llamada de texto, una de descripción de imagen y una de voz a inglés sobre un WAV real en H100; perplejidad de texto 28,5391 sobre 250 tokens retenidos. La auditoría de tensores confirmó 128 pesos lineales cuantizados, 333 tensores visuales idénticos byte a byte, 526 tensores de audio idénticos byte a byte y 299 tensores de lenguaje preservados idénticos byte a byte. Son pruebas de humo, no benchmarks de calidad.

## Requisitos de hardware

- Inferencia nativa NVFP4: requiere backend compatible con la generación Blackwell de NVIDIA. H100 no es Blackwell y no sirve para esta ruta.
- El runtime incluido (`JointModel` con `fp4_reference.py` y ModelOpt) descomprime los pesos a BF16 para verificación, por lo que necesita memoria del orden de un modelo BF16 de ~6,76B parámetros más los componentes de visión en FP32 y audio en BF16; el repositorio ocupa 13,5 GB.
- GPU recomendadas para la ruta de referencia: H100 (validada en las pruebas de humo) o GPUs con VRAM suficiente para alojar los pesos descomprimidos; para NVFP4 nativo, GPUs Blackwell (B100, B200, RTX 50xx con soporte de backend).
- No cabe en GPUs consumer de gama media para la ruta de referencia; en GPUs consumer solo tendría sentido con backends que soporten NVFP4 nativo y siempre que el resto de componentes (visión FP32, audio BF16) quepan en memoria.
- Opciones de despliegue: `joint_runtime.JointModel` (runtime propio del repositorio); no se debe usar `AutoModelForImageTextToText.from_pretrained` directamente sobre este export ModelOpt. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que el serving nativo en Blackwell no ha sido validado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Traducción texto (FLORES COMET22) | Traducción imagen (MMTIT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Translate-omni-9B-FP4 | 6,76B (export FP4) | no disponible | no medida en esta exportación; 0.8789 en el 9B original | no medida; 77.604 en el 9B original | Apache 2.0 | Hugging Face, runtime propio |
| Index-Translate-Omni 9B (original) | ~9B (según nombre) | no disponible | 0.8789 | 77.604 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | 73.814 | no disponible en la información | Hugging Face |
| Index-Translate-Omni 35BA3B | 35B (3B activos, según nombre) | no disponible | 0.8795 | 77.011 | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Index-Translate y a su base Qwen3.5, únicos datos aportados. No se dispone de cifras de alternativas externas de traducción multimodal en la información proporcionada.

## Limitaciones y advertencias

- Esta exportación no es un checkpoint listo para producción: la card advierte explícitamente de que no debe cargarse con `AutoModelForImageTextToText.from_pretrained` y de que el runtime incluido descomprime a BF16, sin ser una ruta acelerada.
- El serving nativo NVFP4 en Blackwell no ha sido validado; solo se han ejecutado pruebas de humo en H100 con la ruta de referencia.
- Los benchmarks mostrados son del modelo original, no de esta cuantización; el impacto de NVFP4 en calidad de traducción, visión y voz no está cuantificado.
- Idiomas cubiertos: solo chino e inglés. No hay soporte documentado de castellano ni de otras lenguas.
- La perplejidad reportada (28,5391 sobre 250 tokens) se calcula sobre una muestra muy pequeña y no es indicativa de calidad global.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de traducción, conviene validar la fidelidad en dominios especializados y con terminología crítica.
- Longitud de contexto no disponible: limita la planificación de casos de uso con documentos largos o conversaciones multi-turno extensas.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar además las condiciones de los componentes base (Qwen3.5) y de ModelOpt/NVIDIA asociadas al formato NVFP4.
- El repositorio debe descargarse completo, incluyendo `audio/` y `audio-tokenizer/`; una descarga parcial rompe el runtime.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-9B-FP4
- Modelo original: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks publicados de la familia: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
