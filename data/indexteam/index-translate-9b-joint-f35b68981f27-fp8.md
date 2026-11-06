# IndexTeam/Index-Translate-9B-Joint-f35b68981f27-FP8

## Resumen

Index-Translate-9B-Joint-f35b68981f27-FP8 es una exportación cuantizada en FP8 del modelo ómnimodal Index-Translate-Omni 9B, desarrollado por el equipo IndexTeam. El modelo aborda la traducción multilingüe en tres modalidades: texto, imagen y voz, incluyendo reconocimiento automático del habla (ASR) y traducción bidireccional chino-inglés. Se distribuye bajo licencia Apache 2.0 y está pensado para su uso con la librería Transformers.

La arquitectura combina un modelo de lenguaje de 9.000 millones de parámetros con módulos de visión y audio. En esta exportación concreta, los pesos del lenguaje se cuantizan a FP8 con escalas por canal y activaciones dinámicas por token (`FP8_DYNAMIC`), mientras que los tensores de visión se mantienen en FP32 y el encoder y conector de audio en BF16 originales. El `lm_head` y los embeddings de tokens no se cuantizan.

La relevancia de esta ficha radica en que se trata de un checkpoint derivado (una cuantización) y no de un modelo nuevo: los resultados de benchmarks que reproduce la model card corresponden al modelo original, no a esta exportación. El propio autor lo advierte y limita la verificación realizada a pruebas de humo (recarga del checkpoint, generación de texto, una llamada de imagen y una llamada de audio real en una H100).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio); detalles internos no disponibles |
| Parametros totales | 9B (según nomenclatura del modelo; desglose no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (lenguaje, `FP8_DYNAMIC`); visión en FP32; audio en BF16; `lm_head` y embeddings sin cuantizar |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors); no incluye GGUF |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base más allá de describirlo como un modelo "joint" que integra pesos de lenguaje y visión junto con módulos de audio nativos. La exportación FP8 mantiene las proyecciones de atención lineal dentro de la receta de cuantización, conserva la visión en FP32 byte a byte respecto al ensamblado fuente y preserva el encoder y conector de audio en BF16. El runtime `JointModel` solicita explícitamente `dequantize=True` para compressed-tensors, lo que implica que tras la carga se computa en BF16; el autor aclara que esto no constituye una aceleración real por kernels FP8.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card referencia el modelo original Index-Translate-Omni 9B como fuente de los resultados, pero no describe el proceso de entrenamiento.

## Capacidades

- Traducción de texto multilingüe chino-inglés con soporte de restricciones de terminología y formato.
- Traducción de imágenes (image-to-text): extracción y traducción de texto presente en imágenes.
- Reconocimiento automático del habla (ASR) en chino e inglés.
- Traducción de voz bidireccional chino-inglés (speech-to-text translation).
- Generación de texto y descripción de imágenes mediante `JointModel.image_generate(messages)`.
- Procesamiento de audio mediante `JointModel.audio_generate(...)` con etiquetas `<audio>`.
- Seguimiento de instrucciones de traducción (instTrans, IFMTBench según la model card del original).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.

## Casos de uso

- Traducción de documentación técnica chino-inglés: el modelo permite fijar terminología y restricciones de formato, lo que resulta adecuado para manuales y guías donde la consistencia de términos es crítica.
- Localización de contenido visual: traducción de capturas de pantalla, infografías o carteles mediante la ruta image-to-text, útil en flujos de localización de productos.
- Subtitulado y transcripción bilingüe: el ASR en chino e inglés junto con la traducción de voz permite generar subtítulos traducidos en un solo paso a partir de un WAV.
- Atención al cliente en chino e inglés: transcripción de audio entrante y traducción a texto para agentes o para respuestas automatizadas en ambos idiomas.
- Investigación en traducción multimodal: al ser una exportación FP8 con pesos de visión y audio preservados, sirve como base reproducible para experimentos de evaluación comparativa en traducción de texto, imagen y voz.
- Procesamiento de reuniones bilingües: transcripción y traducción de grabaciones chino-inglés para actas o resúmenes posteriores.
- Integración en pipelines de Transformers: al cargarse con `JointModel` y `device_map='auto'`, puede incorporarse en servicios existentes basados en la librería Transformers sin reentrenamiento.

## Benchmarks y rendimiento

Los datos de la model card corresponden al modelo original Index-Translate-Omni 9B, no a esta exportación FP8. El autor lo indica explícitamente. Se reproducen a continuación como referencia del modelo base.

| Benchmark | Index-Translate-Omni 9B |
|---|---|
| FLORES COMET22 ↑ | 0.8789 |
| WMT24++ COMET22 ↑ | 0.8601 |
| WMT26 Judge ↑ | 75.35 |
| MEME ↑ | 0.7387 |
| instTrans Quality / IFscore ↑ | 0.6771 / 0.8209 |
| instTrans_minor Quality / IFscore ↑ / Off-target ↓ | 0.5222 / 0.7725 / 3.47% |
| IFMTBench XCOMET-XXL / IFscore ↑ | 0.7957 / 0.8760 |
| ASR chino CER ↓ | 17.8917 |
| ASR inglés CER ↓ | 14.4097 |
| Traducción voz EN→ZH (BLEU / chrF2 / CER destino) | 43.507 / 36.312 / 41.3767 |
| Traducción voz ZH→EN (BLEU / chrF2 / CER destino) | 34.656 / 55.376 / 46.3720 |
| Imagen MMTIT ↑ (COMET22 ×100) | 77.604 |
| Imagen FLORES-rendered ↑ | 68.438 |
| Imagen Vistra ↑ | 71.815 |

Verificación propia de esta exportación FP8 (según el autor): recarga del checkpoint y generación de texto correctas; una llamada de texto, una de descripción de imagen y una de voz a inglés sobre una H100; perplejidad de texto de 27.3816 sobre 250 tokens reservados. El autor califica estas pruebas como smoke tests, no como benchmarks completos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, un modelo de 9B en FP8 requiere del orden de 9-10 GB solo para pesos, más overhead de visión (FP32) y audio (BF16) y de activaciones; el autor no publica cifras.
- GPU recomendadas: el autor verifica el runtime en una H100. No se especifican otras GPU compatibles.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; el requisito de mantener visión en FP32 y audio en BF16 aumenta la huella.
- Despliegue: runtime propietario `JointModel` incluido en el repositorio, sobre Transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI. No se incluyen archivos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidades | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-Omni 9B (original) | 9B | no disponible | Apache 2.0 | texto, imagen, voz | HuggingFace |
| Index-Translate 9B (solo texto) | 9B | no disponible | Apache 2.0 | texto | HuggingFace |
| Index-Translate-Omni 2B | 2B | no disponible | Apache 2.0 | texto, imagen, voz | HuggingFace |
| Index-Translate-Omni 35BA3B | 35B (A3B, MoE) | no disponible | Apache 2.0 | texto, imagen, voz | HuggingFace |

En los benchmarks del modelo original, el 9B supera al 2B en traducción de texto (FLORES COMET22 0.8789 frente a 0.8655), en seguimiento de instrucciones (instTrans Quality 0.6771 frente a 0.5391) y en traducción de imagen (MMTIT 77.604 frente a 65.809). El 35BA3B obtiene resultados ligeramente superiores en texto y voz, con un coste computacional mayor.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al modelo original, no a esta exportación FP8; el autor advierte que no son resultados nuevos de esta cuantización.
- La verificación realizada es limitada: smoke tests de texto, imagen y un único WAV, más una perplejidad sobre 250 tokens. No hay evaluación exhaustiva de calidad de traducción, visión o voz en FP8.
- El runtime usa `dequantize=True` y computa en BF16 tras la carga; no hay aceleración real por kernels FP8, por lo que el beneficio de la cuantización es principalmente de almacenamiento.
- Idiomas soportados limitados a chino e inglés; no se documenta cobertura de otras lenguas.
- No se documenta longitud de contexto, sesgos conocidos ni tasas de alucinación.
- No se documenta soporte de tool calling ni de flujos agénticos.
- El despliegue depende de un runtime propio (`JointModel`) y de archivos auxiliares (`audio/`, `audio-tokenizer/`); no hay soporte de ecosistemas estándar de inferencia como vLLM u Ollama.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento de esta exportación en producción.
- El repositorio indica tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que la información de tamaño no es fiable; conviene verificar antes de descargar.

## Enlaces

- HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-9B-Joint-f35b68981f27-FP8
- Modelo original Index-Translate-Omni 9B: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks publicados del original: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
- ModelScope: la model card incluye un enlace truncado a ModelScope que no puede reconstruirse con la información disponible.
