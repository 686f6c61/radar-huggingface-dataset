# Kremon96/VoxCPM2-4bit

## Resumen

VoxCPM2-4bit es una conversión cuantizada a 4 bits del modelo de síntesis de voz openbmb/VoxCPM2, publicada por el usuario Kremon96 en Hugging Face. Se trata de un modelo TTS (text-to-speech) multilingüe de aproximadamente 2.384 millones de parámetros, diseñado para funcionar sobre Apple Silicon mediante la librería mlx-audio. Su interés principal radica en que reduce el peso del modelo original (4,96 GB en bf16) hasta unos 2,30 GB, manteniendo el VAE y el DiT en precisión completa y cuantizando únicamente las capas del modelo de lenguaje.

El modelo base, desarrollado por OpenBMB, ofrece salida de audio a 48 kHz, clonación de voz a partir de una referencia corta y diseño de voz a partir de descripciones textuales, sin necesidad de audio de referencia. Soporta, según la model card, 30 idiomas, aunque los metadatos de Hugging Face solo declaran explícitamente inglés, chino, indonesio, japonés y coreano.

Esta versión cuantizada es relevante para desarrolladores que quieran ejecutar TTS de calidad de estudio en local sobre Macs con chip Apple Silicon, sin depender de GPUs NVIDIA ni de servicios en la nube. La licencia Apache 2.0 del modelo original se mantiene, lo que facilita su uso comercial, aunque conviene verificar las condiciones del modelo base y del conversor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal con modelo de lenguaje (LM), VAE y DiT (segun model card); detalles completos no disponibles |
| Parametros totales | 2.383.791.940 (2,38 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en capas del LM; VAE y DiT en precision completa |
| Idiomas soportados | en, zh, id, ja, ko (metadatos); la model card declara 30 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx-audio) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un TTS multilingüe de 2B parámetros con salida a 48 kHz. La arquitectura combina un modelo de lenguaje con un VAE y un DiT (Diffusion Transformer), según la descripción del autor de la conversión. En esta versión, solo las capas del LM se cuantizan a 4 bits, mientras que el VAE y el DiT se mantienen en precisión completa para preservar la calidad del audio generado.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas específicas más allá de los cuatro modos de generación (zero-shot, continuación, clonación por referencia y combinado) y los parámetros de inferencia `inference_timesteps` y `cfg_value` expuestos en la API.

## Capacidades

- Síntesis de voz multilingüe con salida a 48 kHz (calidad de estudio).
- Clonación de voz a partir de una referencia de audio corta más su transcripción.
- Diseño de voz mediante descripciones textuales, sin audio de referencia.
- Cuatro modos de generación: zero-shot, continuación, clonación por referencia y combinado.
- Control de la inferencia mediante parámetros como `inference_timesteps` (por defecto 7) y `cfg_value` (por defecto 2.0).
- Soporte de múltiples idiomas: inglés, chino, indonesio, japonés y coreano declarados en metadatos; hasta 30 según la model card.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz a 48 kHz con calidad de estudio, adecuada para producción de contenido largo donde la fidelidad del audio es prioritaria.
- Clonación de voz para doblaje: a partir de una muestra corta del hablante y su transcripción se puede replicar su timbre en nuevos textos, útil en localización de vídeo.
- Diseño de voces para videojuegos: la función de voice design permite crear personajes describiendo la voz en texto, sin necesidad de locutores.
- Asistentes de voz en local sobre Mac: al ejecutarse con mlx-audio en Apple Silicon, permite integrar TTS en aplicaciones de escritorio sin enviar datos a la nube.
- Accesibilidad: generación de voz para lectores de pantalla o interfaces para personas con discapacidad visual, con soporte de varios idiomas.
- Prototipado rápido de interfaces conversacionales: la API de Python permite iterar sobre timesteps y cfg para ajustar latencia y calidad antes de desplegar.
- Contenido multilingüe para redes sociales: generación de locuciones en inglés, chino, japonés, coreano o indonesio desde un mismo pipeline.

## Benchmarks y rendimiento

La model card incluye datos de rendimiento en Apple Silicon medidos como RTF (Real-Time Factor; valores superiores a 1,0 indican más rápido que tiempo real):

| Variante | Tamano | RTF (7 timesteps) |
|---|---|---|
| bf16 | 4,96 GB | 0,48x |
| 8-bit | 3,23 GB | 0,85x |
| 4-bit | 2,30 GB | 0,90x |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en memoria unificado: aproximadamente 2,30 GB para los pesos en 4 bits; el consumo real en ejecución será mayor por el VAE, el DiT y los buffers de audio.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y sucesivos) mediante MLX; no está pensado para GPUs NVIDIA.
- No cabe esperar compatibilidad con CUDA, vLLM, TGI ni llama.cpp, ya que el formato es específico de mlx-audio.
- Despliegue: `pip install mlx-audio` y ejecución mediante `python -m mlx_audio.tts.generate` o la API de Python `load_model`.
- Latencia: según la model card, el RTF a 7 timesteps es de 0,90x en 4 bits, es decir, ligeramente más lento que tiempo real; el 8-bit es más rápido (0,85x) y el bf16 mucho más lento (0,48x).
- Throughput: no disponible más allá del RTF indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2-4bit (esta ficha) | 2,38 B | No disponible | 48 kHz (segun model card) | Apache 2.0 | Hugging Face, mlx-audio |
| openbmb/VoxCPM2 (bf16) | 2,38 B | No disponible | 48 kHz | Apache 2.0 | Hugging Face |
| VoxCPM2 8-bit (mlx-community) | 2,38 B | No disponible | 48 kHz | Apache 2.0 | Hugging Face, mlx-audio |

No se dispone de datos de benchmarks comparativos con otros modelos TTS (por ejemplo, XTTS, Bark o F5-TTS) en la información proporcionada.

## Limitaciones y advertencias

- Modelo cuantizado a 4 bits: aunque el autor indica una pérdida de calidad mínima, no se aportan métricas objetivas que lo respalden.
- Solo funciona en Apple Silicon con mlx-audio; no es portable a CUDA ni a otras plataformas sin reconversión.
- El RTF de 0,90x implica que la generación es ligeramente más lenta que tiempo real en el hardware de referencia.
- La clonación de voz plantea riesgos éticos y legales: es necesario contar con consentimiento del hablante y cumplir la normativa aplicable (por ejemplo, el AI Act en la UE).
- Riesgo de alucinación o artefactos en la prosodia y pronunciación, especialmente en idiomas poco representados; no se documentan evaluaciones por idioma.
- La model card declara 30 idiomas, pero los metadatos solo listan cinco; la cobertura real del resto no está verificada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su robustez en producción.
- Conviene revisar la licencia y las condiciones del modelo base openbmb/VoxCPM2 antes de un uso comercial, aunque ambas se declaren Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kremon96/VoxCPM2-4bit
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
- Variante 8-bit referenciada en la model card: https://huggingface.co/mlx-community/VoxCPM2-4bit (referencia tal cual aparece en la documentación; verificar disponibilidad)
