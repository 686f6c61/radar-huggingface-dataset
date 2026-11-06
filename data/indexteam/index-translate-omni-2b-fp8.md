# IndexTeam/Index-Translate-omni-2B-FP8

## Resumen

Index-Translate-omni-2B-FP8 es una exportación cuantizada en FP8 del modelo multimodal Index-Translate-Omni 2B, desarrollado por IndexTeam. Se trata de un modelo de traducción "todo en uno" que integra traducción de texto multilingüe, traducción de imágenes (image-to-text), reconocimiento automático de voz (ASR) y traducción bidireccional de voz chino-inglés en un único checkpoint. La arquitectura se basa en Qwen3.5 (tag `qwen3_5`), con 2.721.801.024 parámetros totales y un pipeline declarado como `translation`.

La relevancia de esta ficha radica en que combina tres modalidades (texto, imagen y audio) bajo una licencia Apache 2.0 permisiva, algo poco habitual en modelos de traducción multimodal de este tamaño. La versión FP8 reduce el peso del repositorio a 6,1 GB, lo que facilita su despliegue en GPUs de gama alta consumer, aunque el runtime incluido (`JointModel`) desquantiza a BF16 al cargar, por lo que no se aprovechan kernels FP8 nativos.

Conviene subrayar que los benchmarks publicados en la model card corresponden a los modelos originales (2B, 9B y 35BA3B) y no a esta exportación cuantizada; las verificaciones propias del autor se limitan a pruebas de humo (generación de texto, descripción de imagen y una transcripción de audio real en H100).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (tag `qwen3_5`), con módulos de visión y audio |
| Parametros totales | 2.721.801.024 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos con escalas por canal y activaciones FP8 dinámicas por token, `FP8_DYNAMIC`); visión en FP32; audio en BF16; `lm_head` y embeddings sin cuantizar |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors); no se incluyen GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal construido sobre Qwen3.5, con tres ramas diferenciadas: lenguaje, visión y audio. La rama de lenguaje se exporta en FP8 con escalas por canal y activaciones dinámicas por token; las proyecciones de atención lineal permanecen dentro de la receta de cuantización, mientras que `lm_head` y los embeddings de tokens no se cuantizan. La rama de visión conserva los tensores originales en FP32 (297 tensores verificados como byte-idénticos) y la rama de audio mantiene el encoder y el conector originales en BF16 (529 tensores byte-idénticos), junto con un runtime portátil que extrae únicamente los helpers necesarios del código de audio original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones como decodificación especulativa o atención lineal más allá de la mención a "linear-attention projections" dentro de la receta de cuantización. Lo que sí se documenta es el proceso de exportación: 186 pesos lineales cuantizados, 135 tensores de lenguaje preservados byte-idénticos y una auditoría de integridad con hashes en `SHA256SUMS.txt`. El `JointModel` solicita explícitamente `dequantize=True` para compressed-tensors, lo que implica que el cómputo se realiza en BF16 tras la carga y no supone una aceleración real por kernels FP8.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones de terminología y formato (evaluado con instTrans e IFMTBench).
- Traducción de imágenes (image-to-text): extrae y traduce texto presente en imágenes, evaluado en MMTIT, FLORES-rendered y Vistra.
- Reconocimiento automático de voz (ASR) en chino e inglés.
- Traducción bidireccional de voz chino-inglés (speech-to-speech vía transcripción y traducción).
- Generación de texto general mediante `text_generate`.
- Procesamiento de mensajes multimodales de tipo imagen-texto mediante `image_generate`.
- Procesamiento de audio mediante `audio_generate`, con soporte de etiqueta `<audio>` en el prompt.
- Seguimiento de instrucciones de traducción con restricciones (evaluado con IFscore y métricas de off-target).
- Idiomas: chino e inglés (no se declara soporte de otras lenguas).

## Casos de uso

- Traducción de documentación técnica zh-en y en-zh: el modelo permite fijar terminología y formato mediante instrucciones, lo que encaja en pipelines de localización donde la consistencia terminológica es crítica.
- Subtitulado y traducción de contenido audiovisual: combinando ASR y traducción de voz, se puede transcribir audio en chino o inglés y generar la traducción correspondiente en una sola pasada.
- Digitalización de carteles y documentos escaneados: la rama de visión traduce texto embebido en imágenes, útil para señalética, menús o capturas de pantalla en aplicaciones de soporte.
- Atención al cliente bilingüe zh-en: el modelo puede gestionar conversaciones en ambos idiomas y traducir mensajes de voz de usuarios, aunque el contexto máximo no está documentado y conviene validarlo antes de desplegarlo en producción.
- Localización de interfaces y contenido generado por usuarios: traducción de texto corto con restricciones de formato (por ejemplo, mantener placeholders o etiquetas HTML) gracias al entrenamiento en IFMTBench.
- Investigación en traducción multimodal: al ser Apache 2.0 y estar basado en Qwen3.5, sirve como punto de partida para experimentos de fine-tuning conjunto de texto, imagen y voz.
- Despliegue en entornos con VRAM limitada: la versión FP8 reduce el peso del repositorio a 6,1 GB, lo que permite cargar el modelo en GPUs consumer de gama alta, aunque el cómputo efectivo sea BF16.

## Benchmarks y rendimiento

Los resultados publicados corresponden a los modelos originales (no a esta exportación FP8). Se reproducen a continuación los del modelo Index-Translate-Omni 2B junto con los de las variantes mayores para contextualizar.

Traducción de texto:

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate-Omni 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |

Voz (CER en porcentaje, menor es mejor; BLEU y chrF2, mayor es mejor):

| Modelo | ASR chino CER ↓ | ASR inglés CER ↓ | Inglés → Chino (BLEU / chrF2 / CER) | Chino → Inglés (BLEU / chrF2 / CER) |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Traducción de imágenes (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Qwen3.5-2B (baseline) | 52.164 | 50.187 | 55.326 |
| Index-Translate-Omni 2B | 65.809 | 53.612 | 65.596 |
| Qwen3.5-9B (baseline) | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

Verificación propia de esta exportación FP8: recarga del checkpoint y generación de texto correctas; el runtime portátil pasó una llamada de texto, una descripción de imagen y una generación real de voz a inglés sobre un WAV en H100. Perplejidad de texto de 41.1023 sobre 250 tokens held-out. El autor advierte que son pruebas de humo, no benchmarks exhaustivos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,1 GB, pero al cargar con `dequantize=True` el cómputo se hace en BF16, por lo que la VRAM efectiva será superior a la del peso FP8. No se publica una cifra oficial de VRAM pico.
- GPU recomendadas: el autor verificó el runtime en una H100. No se documentan pruebas en otras GPUs.
- GPU consumer: por tamaño de pesos (6,1 GB) y parámetros (2,7B), es plausible que quepa en GPUs consumer de gama alta con suficiente VRAM, pero no hay confirmación oficial ni cifras de VRAM pico.
- Opciones de despliegue: runtime propio `JointModel` (incluido en el repositorio, requiere `requirements-joint.txt`); compatible con `transformers` y con `endpoints_compatible`. No se incluyen archivos GGUF en este repositorio (el autor indica que GGUF es una exportación separada de lenguaje/visión sin pipeline de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Multimodalidad | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Translate-omni-2B-FP8 | 2,72B | no disponible | zh, en | Apache 2.0 | texto, imagen, audio | HuggingFace, ModelScope |
| Index-Translate-Omni 9B | no disponible | no disponible | zh, en | Apache 2.0 (según familia) | texto, imagen, audio | HuggingFace |
| Index-Translate-Omni 35BA3B | no disponible (MoE, A3B activos) | no disponible | zh, en | Apache 2.0 (según familia) | texto, imagen, audio | HuggingFace |
| Qwen3.5-2B (baseline) | ~2B | no disponible | no disponible | no disponible | texto, imagen | HuggingFace |

No se dispone de datos de benchmarks de modelos de traducción multimodal de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden a los modelos originales, no a esta exportación FP8; el autor lo advierte explícitamente.
- El runtime `JointModel` desquantiza a BF16 al cargar, por lo que no se aprovechan kernels FP8 y el beneficio real es de almacenamiento, no de velocidad.
- Solo se declaran chino e inglés; no hay soporte documentado de otras lenguas.
- El ASR en inglés del modelo 2B tiene un CER de 34,2560, notablemente peor que el del 9B (14,4097); conviene tenerlo en cuenta para producción en inglés.
- La traducción de voz presenta CER de destino elevados (43-48%), lo que limita su uso en escenarios que exijan alta fidelidad.
- No se documenta la longitud de contexto; hay que validarla empíricamente antes de usarla en conversaciones multi-turno largas.
- La perplejidad de texto reportada (41,1023 sobre 250 tokens) es una prueba de humo, no una evaluación representativa.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos; al ser un modelo de traducción, el riesgo principal es la deriva semántica y la omisión de contenido en textos largos o ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se apoya en Qwen3.5; conviene revisar las condiciones de la familia base.
- El repositorio requiere descargar íntegramente las carpetas `audio/` y `audio-tokenizer/` para el pipeline de voz; no funciona con una carga parcial.
- No se incluyen archivos GGUF, lo que descarta despliegues vía llama.cpp u Ollama con audio.

## Enlaces

- HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-omni-2B-FP8
- ModelScope (mirror, URL truncada en la model card): https://modelscope.cn/models/IndexTea
- Model card del modelo original 9B: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks publicados de Index-Translate 9B: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
