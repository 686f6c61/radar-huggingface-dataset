# csikasote/omniASR-CTC-300M-v2-Zulu-All-v2

## Resumen

El modelo `csikasote/omniASR-CTC-300M-v2-Zulu-All-v2` es un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2, convertido desde el checkpoint `omniASR_CTC_300M_v2` del proyecto OmniLingual de Meta. Se trata de una versión específica orientada al idioma zulú (según el nombre), aunque la model card no detalla los idiomas exactos que soporta. El modelo genera logits CTC sobre un vocabulario SentencePiece y puede transcribir audio a texto.

La relevancia de este modelo reside en que forma parte de la familia OmniASR, que cubre más de 1600 idiomas, y ofrece un equilibrio entre velocidad de inferencia y precisión gracias a la arquitectura CTC. La conversión a HuggingFace con verificación de paridad numérica permite su uso directo con `transformers` y `torchaudio`, lo que facilita su integración en aplicaciones de producción. El modelo cuenta con 325 millones de parámetros, 24 capas de encoder y una ventana de contexto de audio ilimitada en la práctica (dependiendo de la duración del archivo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (wav2vec2) |
| Parametros totales | 325.983.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa audio de duración arbitraria, sin ventana fija documentada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre sugiere zulú, pero no se confirma en la ficha) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `Wav2Vec2ForCTC` con 24 capas de encoder, hidden size de 1024, 16 cabezas de atención y un vocabulario de 10288 tokens (SentencePiece). Se trata de una conversión directa del checkpoint `omniASR_CTC_300M_v2` de Meta, originalmente entrenado en el marco `fairseq2`. La paridad numérica con el original se ha verificado con una tolerancia de `atol=1e-4` sobre una muestra de audio de referencia.

No se dispone de información pública sobre el corpus de entrenamiento, el número de tokens procesados ni el procedimiento de entrenamiento (RLHF, DPO, etc.). El modelo genera logits CTC, que se decodifican mediante `argmax` y posterior búsqueda greedy, sin necesidad de un modelo de lenguaje externo. La arquitectura está optimizada para velocidad de inferencia, como indica la familia CTC de OmniASR.

## Capacidades

- Transcripción de audio a texto (ASR) mediante logits CTC.
- Soporte de múltiples idiomas (aunque no se especifican cuáles en esta versión concreta).
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face.
- Inferencia de alta velocidad, adecuada para transcribir audio en tiempo real o en lotes.
- No soporta tool calling, ni razonamiento multi-paso, ni visión, ni generación de texto libre; es un modelo puramente de reconocimiento de voz.

## Casos de uso

- **Subtitulado automático de vídeo**: el modelo puede transcribir pistas de audio a texto para generar subtítulos en tiempo real o en postproducción, gracias a su velocidad y a la compatibilidad con audios de larga duración.
- **Asistente de voz en aplicaciones móviles**: con un tamaño de 325M parámetros, es viable ejecutarlo en dispositivos con GPU de gama media o incluso en CPU mediante cuantización, permitiendo entrada de voz en apps.
- **Sistemas de documentación médica**: transcribir dictados de profesionales sanitarios, aunque se requiere validación adicional para garantizar la precisión en terminología especializada.
- **Análisis de llamadas de atención al cliente**: transcripción de llamadas para análisis de calidad, minería de intenciones o detección de palabras clave.
- **Accesibilidad**: conversión de contenido de audio a texto para personas con discapacidad auditiva, especialmente en idiomas con pocos recursos donde otros modelos fallan.
- **Indexación de archivos de audio**: transcripción de podcasts, entrevistas o reuniones para permitir búsqueda de texto dentro de los archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud (WER, CER) ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el dominio de aplicación antes de su despliegue.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP32, el modelo ocupa aproximadamente 1,3 GB de memoria (325M parámetros × 4 bytes). En FP16 la memoria se reduce a unos 650 MB, y en cuantización INT8 a unos 325 MB.
- **GPU recomendadas**: una GPU con al menos 4 GB de VRAM es suficiente para FP16; por ejemplo, una NVIDIA GTX 1650 Super o superior. Para ejecución en CPU, se recomienda al menos 8 GB de RAM.
- **Compatibilidad**: el modelo es compatible con `transformers` y `torchaudio`. Se puede desplegar con `vLLM` (aunque no es típico para ASR), `llama.cpp` (si se convierte a GGUF), `Ollama` (no está diseñado para ASR) o directamente con Python. La opción más común es usar `transformers` con `torchaudio` para preprocesar el audio.
- **Latencia y throughput**: no se han publicado valores concretos. Al ser un modelo CTC de 300M, se espera una latencia baja, del orden de decenas de milisegundos por segundo de audio en una GPU moderna, pero esto debe medirse en el entorno objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| `omniASR-CTC-300M-v2-Zulu-All-v2` | 325M | Wav2Vec2 CTC | No disponible | Especializado en zulú (presumiblemente) |
| `Whisper small` (OpenAI) | 244M | Transformer encoder-decoder | MIT (código) / uso libre | Multilingüe, genera texto con atención, requiere más memoria por decodificación autoregresiva |
| `Wav2Vec2-XLSR-300M` (Facebook) | 300M | Wav2Vec2 | Apache-2.0 | Multilingüe, pero con menor cobertura que OmniLingual |

La comparación directa con Whisper no es trivial porque Whisper es un modelo encoder-decoder con generación autoregresiva, mientras que este modelo es CTC puro, lo que le hace más rápido pero menos flexible en la decodificación (no puede aplicar lenguaje externo fácilmente). La licencia del modelo presentado no está disponible, lo que limita su uso comercial sin consultar al autor.

## Limitaciones y advertencias

- **Licencia no especificada**: el modelo no declara licencia, lo que impide su uso comercial sin permiso explícito del autor. Es recomendable contactar con `csikasote` antes de integrarlo en un producto.
- **Idiomas no confirmados**: aunque el nombre indica «Zulu-All», la model card no detalla los idiomas exactos soportados. Se recomienda probar con muestras de audio de los idiomas objetivo.
- **Posibles sesgos**: al no haber información sobre los datos de entrenamiento, no se puede evaluar la presencia de sesgos lingüísticos o demográficos.
- **Riesgo de alucinación**: como modelo CTC, la transcripción es determinista basada en el audio, pero puede producir errores de homófonos o palabras fuera de vocabulario.
- **Formato de audio**: el modelo espera audio mono a 16 kHz; si el audio tiene otra frecuencia, debe remuestrearse.
- **Sin garantía de paridad en todos los idiomas**: la verificación de paridad se hizo sobre una sola muestra de audio; puede haber desviaciones en otros contextos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/csikasote/omniASR-CTC-300M-v2-Zulu-All-v2)
- [GitHub de OmniLingual ASR (Meta)](https://github.com/facebookresearch/omnilingual-asr)
- [Documentación de modelos CTC en DeepWiki](https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr))
- [Ejemplo de ejecución en Colab con OmniASR](https://colab.research.google.com/github/NeuralFalconYT/omnilingual-asr-colab/blob/main/Meta_Omnilingual_ASR.ipynb)
