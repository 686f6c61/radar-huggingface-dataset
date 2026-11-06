# Phonepadith/qwen3-asr-laos

## Resumen

qwen3-asr-laos es un modelo de reconocimiento automático del habla (ASR) para lao (ພາສາລາວ), obtenido por ajuste fino supervisado de Qwen/Qwen3-ASR-0.6B-hf. Lo publica Phonepadith bajo licencia AIDCTECH. Su relevancia principal es que el lao no forma parte del conjunto de idiomas soportados por Qwen3-ASR, por lo que el modelo representa una transferencia a un idioma no soportado y no una mejora sobre un idioma ya cubierto.

El modelo tiene 782.426.112 parámetros reales según los pesos en safetensors y un tamaño de repositorio de 1,6 GB. Es un modelo encoder-decoder de tipo generativo: produce la transcripción token a token, lo que le da flexibilidad pero también un coste computacional mayor que las arquitecturas CTC o transducer.

El autor declara un CER del 11,47 % sobre un conjunto de test retenido de 1.583 clips. En la comparativa del propio autor, es el modelo más grande de su familia de ajustes finos para lao y el menos preciso de los cuatro modelos de tamaño completo, además de ser aproximadamente diez veces más lento que los modelos CTC. Se publica como punto de partida generativo para ASR en lao, no como motor recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder-decoder generativa (Qwen3-ASR, clase `Qwen3ASRForConditionalGeneration`) |
| Parametros totales | 782.426.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con clips de hasta 30 segundos) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia documentados en bf16) |
| Idiomas soportados | lao (lo) |
| Licencia | AIDCTECH (licencia `other`, nombre `aidctech`); modelo base Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-ASR: un modelo encoder-decoder que recibe audio de entrada y genera la transcripción de forma autorregresiva, token a token. Esto contrasta con los modelos CTC y transducer de la misma familia, que emiten una transcripción alineada por tramas y son estructuralmente más rápidos. El modelo base es Qwen/Qwen3-ASR-0.6B-hf, de 0,6B parámetros nominales.

El ajuste fino se realizó durante 2 épocas (1.800 pasos de optimizador) con precisión bf16, usando la receta propia de Qwen `qwen3_asr_sft.py` en formato de plantilla de chat, sobre una única GPU NVIDIA GB10 (aarch64, sm_121). La pérdida final de entrenamiento fue 0,104. La pérdida de validación bajó de 0,1302 a 0,1243 durante la segunda época y seguía descendiendo en el paso final; no se midió CER de validación en esta ejecución, solo la pérdida. Como el lao queda fuera del conjunto de idiomas del modelo base, el prompt objetivo nombra explícitamente el idioma en la plantilla de chat en lugar de depender de un token de idioma.

## Capacidades

- Transcripción de voz a texto en lao para audio de 16 kHz mono.
- Decodificación generativa autorregresiva, con la flexibilidad que ello implica frente a CTC.
- Acepta prompts en formato de plantilla de chat que especifican el idioma objetivo.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Monolingüe: únicamente lao.
- No incluye restauración de puntuación más allá de la que el modelo infiera.
- Solo transcripción de un único hablante; la diarización requiere un modelo aparte.
- No soporta visión ni audio más allá de la transcripción (no documentado).

## Casos de uso

- Transcripción de entrevistas y notas de voz en lao: el modelo convierte grabaciones de hasta 30 segundos en texto, adecuado para documentación y archivo cuando la precisión del 11,47 % de CER es aceptable y no se requiere tiempo real.
- Subtitulado offline de contenido audiovisual en lao: se segmenta el audio en clips de hasta 30 segundos y se transcribe por lotes; el coste de ~1 s por clip es asumible en procesamiento por lotes nocturno.
- Generación de corpus textual en lao para entrenamiento posterior: sirve como fuente de transcripciones a gran escala, con revisión humana dado el CER declarado.
- Punto de partida para ajuste fino adicional: al ser un modelo generativo con receta SFT documentada (`qwen3_asr_sft.py`), es útil como base para quien quiera explorar ASR generativo en lao y mejorarlo.
- Investigación en transferencia a idiomas no soportados: caso de estudio de cómo un modelo multilingüe de ASR se adapta a un idioma ausente de su conjunto original mediante prompt explícito de idioma.
- Transcripción de llamadas o atención al cliente en lao: para volcar conversaciones a texto con posterior análisis, segmentando por turnos de hasta 30 segundos y aceptando la ausencia de diarización.
- Archivado de material oral histórico o administrativo en lao: digitalización de audio mono a 16 kHz con conversión previa mediante ffmpeg.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (CER sobre 1.583 clips retenidos, mismo scorer para todas las filas):

| Modelo | Parámetros | CER | Velocidad |
|---|---|---|---|
| omniASR CTC v2 | 325M | 7,94 % | 0,09 s/clip |
| Typhoon FastConformer-T | 114M | 8,44 % | 0,09 s/clip |
| XLSR-53 | 317M | 8,82 % | 0,08 s/clip |
| **qwen3-asr-laos** | **0,78B** | **11,47 %** | **~1,0 s/clip** |
| Whistle | 29MB | 12,31 % | 0,30 s/clip |

El autor indica que debe leerse CER y no WER, porque el lao se escribe sin espacios entre palabras y el WER mide principalmente dónde decide romper el modelo, no si ha oído correctamente. El resultado de test no está verificado de forma independiente (`verified: false` en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 782M parámetros en bf16 los pesos ocupan aproximadamente 1,6 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con suficiente memoria para el audio y los estados intermedios.
- GPU recomendadas: el autor entrenó en una NVIDIA GB10; para inferencia se puede usar cualquier GPU con soporte bf16. No hay recomendaciones oficiales adicionales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores por el tamaño de los pesos; no hay cifras oficiales de VRAM mínima.
- Opciones de despliegue: transformers con `AutoProcessor` y `Qwen3ASRForConditionalGeneration`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~1,0 s por clip según el autor, aproximadamente diez veces más lento que los modelos CTC de la misma familia (0,08–0,09 s/clip).
- Preprocesado obligatorio: audio a 16 kHz mono (`ffmpeg -i input.m4a -ac 1 -ar 16000 clip.wav`).

## Comparativa con modelos similares

| Modelo | Parámetros | CER (lao) | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-asr-laos | 0,78B | 11,47 % | ~1,0 s/clip | AIDCTECH | Hugging Face |
| omniASR CTC v2 | 325M | 7,94 % | 0,09 s/clip | no disponible | no disponible |
| Typhoon FastConformer-T | 114M | 8,44 % | 0,09 s/clip | no disponible | no disponible |
| XLSR-53 | 317M | 8,82 % | 0,08 s/clip | no disponible | no disponible |
| Whistle | 29MB | 12,31 % | 0,30 s/clip | no disponible | no disponible |

Los cuatro modelos comparables son los que el propio autor incluye en su comparativa de ajustes finos para lao, evaluados con el mismo scorer sobre los mismos 1.583 clips. El autor recomienda los modelos CTC y transducer frente a este para producción.

## Limitaciones y advertencias

- Lentitud: ~1 s por clip, unas diez veces más que los modelos CTC de la familia, por la decodificación token a token.
- Precisión: es el menos preciso de los cuatro modelos de tamaño completo de la comparativa del autor (11,47 % frente a 7,94–8,82 %).
- Duración: entrenado con clips de hasta 30 segundos; el audio más largo debe segmentarse.
- Alucinación: la decodificación generativa puede alucinar en silencios o ruido de una forma que los modelos CTC estructuralmente no pueden.
- Puntuación: no hay restauración de puntuación más allá de la que el modelo infiera.
- Hablantes: solo transcripción de un único hablante; la diarización requiere un modelo separado.
- Idioma: monolingüe en lao; el lao no estaba en el conjunto de idiomas del modelo base, lo que limita la calidad frente a idiomas nativos.
- Licencia: AIDCTECH (no estándar); debe revisarse el archivo `LICENSE` antes de uso comercial. El modelo base es Apache-2.0 y sus condiciones de atribución se recogen en ese mismo archivo.
- Resultado no verificado: el CER de 11,47 % está declarado por el autor (`verified: false`) y no se midió CER de validación durante el entrenamiento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phonepadith/qwen3-asr-laos
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Licencia (archivo del repositorio): https://huggingface.co/Phonepadith/qwen3-asr-laos/blob/main/LICENSE
- Gráfica de comparación de ajustes finos para lao: https://huggingface.co/Phonepadith/qwen3-asr-laos/blob/main/performance.png
