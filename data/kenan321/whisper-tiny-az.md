# Kenan321/whisper-tiny-az

## Resumen

whisper-tiny-az es un ajuste fino del modelo openai/whisper-tiny (37,76 millones de parámetros) especializado en reconocimiento automático del habla en azerbaiyano. Lo publica el usuario Kenan321 en Hugging Face bajo licencia Apache 2.0 y está pensado como la variante más ligera de Whisper entrenada específicamente para este idioma, con el objetivo de ofrecer transcripción rápida incluso en dispositivos con recursos limitados.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 4 capas de encoder y 4 de decoder y una ventana de audio de 30 segundos, y se ha ajustado sobre el split de entrenamiento y validación de FLEURS en azerbaiyano (aproximadamente 3.000 enunciados de habla leída). El resultado es una mejora sustancial frente al Whisper-tiny original en ese idioma: el WER baja del 102,2 % al 47,7 % y el CER del 50,6 % al 20,8 % sobre el split de test de FLEURS az_az.

Su relevancia es doble: por un lado, cubre un idioma con poca representación en los modelos ASR multilingües, y por otro demuestra que un modelo de menos de 40 millones de parámetros puede alcanzar un WER inferior al de whisper-small (242 M) en azerbaiyano cuando se ajusta con datos específicos del idioma. Es, por tanto, una opción atractiva para transcripción en tiempo real, edge computing y aplicaciones de bajo consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 37.760.640 (≈37,8 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por chunk (procesamiento por segmentos) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | azerbaiyano (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura original de Whisper-tiny: un encoder transformer que procesa espectrogramas mel de 80 canales en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con 4 capas en cada bloque, atención multi-cabeza estándar y un total de 37,76 millones de parámetros. No incorpora innovaciones arquitectónicas propias; el valor está en el ajuste fino sobre el idioma objetivo.

El entrenamiento se realizó sobre los splits de train y validación de FLEURS `az_az` (aproximadamente 3.000 enunciados de habla leída), sin usar el split de test. Se ejecutaron 3.000 pasos con batch size 32, learning rate 1e-4 con scheduler lineal y 200 pasos de warmup, precisión fp16 y SpecAugment con máscaras de tiempo y frecuencia de 0,05. Todo el ajuste se completó en unos 90 minutos en una única GPU RTX 5070 Laptop. No se documenta el uso de RLHF, DPO ni datos adicionales más allá de FLEURS.

## Capacidades

- Transcripción de voz a texto en azerbaiyano, con normalización de texto adaptada al idioma (minúsculas con I→ı e İ→i, eliminación de puntuación en la evaluación).
- Reconocimiento de habla leída y limpia con calidad aceptable para un modelo de este tamaño.
- Procesamiento de audios largos mediante chunking (`chunk_length_s=30`), aunque con posible pérdida de palabras en las fronteras entre segmentos.
- Inferencia rápida y de bajo coste computacional, apta para dispositivos modestos.
- Integración directa con la librería `transformers` mediante `pipeline("automatic-speech-recognition")`.
- No se documentan capacidades de traducción, diarización, timestamps a nivel de palabra, tool calling ni agentes; al ser un modelo ASR puro, estas funciones no aplican.

## Casos de uso

- Transcripción de reuniones y notas de voz en azerbaiyano: el modelo procesa audio en chunks de 30 segundos y puede integrarse en aplicaciones de dictado o actas automáticas donde la latencia importa más que la precisión absoluta.
- Subtitulado automático de vídeos y pódcasts en azerbaiyano: su bajo coste permite generar subtítulos preliminares que luego se revisan manualmente, reduciendo el esfuerzo de transcripción.
- Asistentes de voz embebidos y edge computing: con menos de 40 M de parámetros y pesos de 0,2 GB, cabe en dispositivos con poca memoria y puede ejecutarse en CPU o GPU de gama baja.
- Prototipado rápido de pipelines ASR para investigación: sirve como línea base ligera para experimentos con FLEURS u otros corpus en azerbaiyano antes de escalar a modelos mayores.
- Indexación y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio para hacerlos buscables en archivos, mediatecas o plataformas de contenido en azerbaiyano.
- Aplicaciones de accesibilidad: conversión de voz a texto en tiempo real para personas con discapacidad auditiva en entornos de habla azerbaiyana, donde el modelo puede ejecutarse localmente sin depender de la nube.
- Preprocesamiento de datos para otros modelos: generar transcripciones iniciales de corpus de audio en azerbaiyano que después se corrigen y se usan para entrenar modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre FLEURS `az_az` split test (no verificados de forma independiente):

| Modelo | Parámetros | WER | CER |
|---|---|---|---|
| openai/whisper-tiny | 39 M | 102,2 % | 50,6 % |
| whisper-tiny-az (este modelo) | 39 M | 47,7 % | 20,8 % |
| openai/whisper-small | 242 M | 52,1 % | 14,5 % |

El texto se normalizó antes de la evaluación con minúsculas adaptadas al azerbaiyano y eliminación de puntuación. El ajuste reduce el WER a menos de la mitad respecto al Whisper-tiny original y supera ligeramente al whisper-small en WER, aunque este último obtiene mejor CER.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 (pesos de 0,2 GB más activaciones y buffers de audio); en cuantización de 8 bits o 4 bits el consumo es aún menor.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 lo ejecutan con holgura, pero están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con pipeline de ASR, y en general cualquier runtime compatible con modelos Whisper (ONNX Runtime, CTranslate2/faster-whisper si se convierte, vLLM no está orientado a ASR). El autor solo documenta el uso con `transformers`.
- Latencia y throughput estimados: no disponibles de forma oficial; el entrenamiento se completó en 90 minutos en una RTX 5070 Laptop, lo que da una idea del bajo coste computacional, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (FLEURS az_az) | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-tiny-az | 37,8 M | azerbaiyano | 47,7 % | 20,8 % | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | multilingüe (99 idiomas) | 102,2 % | 50,6 % | Apache 2.0 | Hugging Face |
| openai/whisper-small | 242 M | multilingüe (99 idiomas) | 52,1 % | 14,5 % | Apache 2.0 | Hugging Face |

Frente a whisper-tiny y whisper-small, este modelo ofrece la mejor relación entre tamaño y WER en azerbaiyano, aunque whisper-small conserva ventaja en CER y probablemente en robustez ante audio ruidoso. No se dispone de datos de otros ajustes finos específicos para azerbaiyano en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con habla leída y limpia de FLEURS: se espera un error notablemente mayor en audio con ruido, habla espontánea, acentos y dialectos.
- Riesgo de alucinación y de omisión de palabras: al ser un modelo pequeño, puede generar texto plausible que no corresponde al audio, especialmente en segmentos ambiguos.
- Procesamiento por chunks de 30 segundos: los audios largos pueden perder palabras en las fronteras entre segmentos.
- Cobertura monolingüe: solo azerbaiyano; no debe usarse para otros idiomas sin un ajuste adicional.
- Resultados no verificados: las métricas de la model card están declaradas por el autor y no han sido validadas de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre sesgos en los datos de entrenamiento.
- Dataset pequeño (unas 3.000 utterances): el ajuste puede no generalizar bien fuera de la distribución de FLEURS.
- Para mayor precisión, el propio autor recomienda modelos mayores como whisper-small o whisper-large-v3-turbo ajustados al idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kenan321/whisper-tiny-az
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
