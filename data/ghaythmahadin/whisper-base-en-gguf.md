# GhaythMahadin/whisper-base.en-gguf

## Resumen

whisper-base.en-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) openai/whisper-base.en, publicada por el usuario GhaythMahadin para su uso con el motor de inferencia transcribe.cpp. El modelo subyacente es la variante monolingüe en inglés de la familia Whisper de OpenAI, un transformer encoder-decoder de aproximadamente 72,6 millones de parámetros entrenado con 680.000 horas de audio etiquetado mediante supervisión débil. Esta conversión concreta no modifica los pesos más allá de la cuantización: reproduce el checkpoint original fijado en el commit 911407f y lo valida numéricamente contra la implementación de referencia de transformers.

La relevancia de esta ficha es doble. Por un lado, demuestra el ecosistema de herramientas C/C++ que está surgiendo alrededor de Whisper (transcribe.cpp, hermano conceptual de llama.cpp pero orientado a audio), lo que permite ejecutar ASR en hardware modesto sin depender de PyTorch. Por otro lado, ofrece una matriz de cuantizaciones (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) con tasas de error (WER) medidas sobre el split completo de LibriSpeech test-clean, lo que facilita decisiones de despliegue basadas en datos y no en intuiciones.

El modelo resuelve el problema de transcribir audio en inglés a texto con un coste computacional mínimo: la variante Q8_0 ocupa 81 MB y la Q4_K_M solo 56 MB, con un incremento de WER de apenas 0,15 puntos porcentuales respecto a F32. Es, por tanto, una opción atractiva para transcripción local, embebida o en dispositivos de borde donde no cabe un modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 72.609.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Modelo base | openai/whisper-base.en (commit 911407f, fijado 2026-04-25) |
| Libreria de inferencia | transcribe.cpp (validado en commit 5.6.1) |
| Tamano del repo | 0,7 GB |
| Entrada de audio | WAV mono a 16 kHz |
| Timestamps | a nivel de segmento |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder clásico de tipo sequence-to-sequence. El encoder procesa espectrogramas mel de ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. La variante base.en es la segunda más pequeña de la familia Whisper (por encima de tiny) y está entrenada exclusivamente con datos en inglés, lo que la hace más rápida y precisa en esa lengua que el modelo multilingüe del mismo tamaño. El entrenamiento original de OpenAI utilizó 680.000 horas de audio etiquetado mediante supervisión débil a gran escala, sin fine-tuning posterior sobre los datasets de evaluación, lo que explica su capacidad de generalización a dominios no vistos.

Esta conversión concreta a GGUF no introduce cambios arquitectónicos: replica los pesos del checkpoint original y los serializa en el formato de transcribe.cpp. La validación numérica se realizó contra la implementación de referencia de transformers en el commit 5.6.1 de transcribe.cpp, comparando las salidas del decoder. La decodificación por defecto en transcribe.cpp es greedy con supresión de tokens, fallback de temperatura y timestamps de segmento activados, una configuración ligeramente distinta de la que usa `model.generate()` de OpenAI por defecto (que desactiva timestamps), lo que explica pequeñas divergencias en el WER reportado.

## Capacidades

- Transcripción de voz a texto en inglés con ventanas de 30 segundos y decodificación por chunks para audio de mayor duración.
- Generación de timestamps a nivel de segmento, útil para subtitulado y alineación temporal.
- Robustez ante ruido y acentos gracias al entrenamiento con supervisión débil a gran escala, sin necesidad de fine-tuning por dominio.
- Ejecución en CPU y GPU mediante transcribe.cpp, con soporte de backend Metal (Apple Silicon) y Vulkan (GPU integradas y discretas en Linux/Windows).
- Inferencia en hardware de gama baja: el modelo Q4_K_M ocupa 56 MB y puede ejecutarse en dispositivos con recursos muy limitados.
- No soporta streaming, traducción ni detección automática de idioma en esta conversión.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo Q8_0 (81 MB) puede ejecutarse en un portátil sin GPU dedicada y transcribir audio de 30 segundos en menos de un segundo en CPU moderna, lo que permite integrarlo en aplicaciones de escritorio sin enviar audio a la nube.
- Subtitulado automático de vídeos en inglés: los timestamps a nivel de segmento permiten generar ficheros SRT o VTT directamente, y el bajo coste computacional hace viable procesar horas de vídeo en un servidor modesto.
- Transcripción embebida en dispositivos de borde: con la cuantización Q4_K_M (56 MB), el modelo cabe en Raspberry Pi, routers o dispositivos IoT con CPU ARM, habilitando asistentes de voz offline.
- Pipeline de análisis de llamadas de atención al cliente: la transcripción previa con Whisper base.en alimenta modelos de lenguaje para resumen y clasificación; el WER de ~4,2% en LibriSpeech es suficiente para que el LLM posterior corrija errores menores por contexto.
- Generación de actas y búsqueda en archivos de audio: transcribir entrevistas, podcasts o grabaciones de investigación en lote con un script que invoque transcribe-cli, aprovechando el bajo consumo de memoria para paralelizar en múltiples núcleos.
- Prototipado rápido de aplicaciones de voz: al no requerir PyTorch ni CUDA, transcribe.cpp compila con CMake y produce un binario único, lo que simplifica el despliegue en contenedores Docker mínimos o en entornos sin Python.
- Investigación en ASR comparativo: la matriz de cuantizaciones con WER medido sobre el split completo de LibriSpeech test-clean (2620 utterances) sirve como referencia reproducible para estudiar el impacto de la cuantización en modelos de audio.

## Benchmarks y rendimiento

WER medido sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, fallback de temperatura, timestamps de segmento activados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 279 MB | 4,14% |
| F16 | 144 MB | 4,13% |
| Q8_0 | 81 MB | 4,16% |
| Q6_K | 65 MB | 4,15% |
| Q5_K_M | 61 MB | 4,16% |
| Q4_K_M | 56 MB | 4,29% |
| Referencia OpenAI (self-reported) | — | 4,25% |

Rendimiento en tiempo real (RTF, factor de tiempo real; valores más altos indican mayor velocidad de procesamiento respecto a la duración del audio):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 211,9 |
| Apple M4 Max | CPU | 38,2 |
| AMD Ryzen 7 4750U | Vulkan | 36,2 |
| AMD Ryzen 7 4750U | CPU | 12,8 |

Nota del autor: los números provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en ~0,1 pp entre ejecuciones, principalmente por resultados de alucinación en clips cortos cerca del suelo de ruido.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 56 MB (Q4_K_M) y 279 MB (F32); en la práctica, transcribe.cpp necesita además memoria para el buffer de audio y el estado del decoder, por lo que un presupuesto de 256-512 MB de RAM es holgado para cualquier cuantización.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con backend Metal; GPU AMD/Intel con Vulkan; GPU NVIDIA no se menciona explícitamente en la información disponible, pero el backend CPU es funcional en cualquier arquitectura.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una GPU integrada Intel HD; también en Raspberry Pi y dispositivos ARM.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que estos están orientados a modelos de lenguaje y no a ASR.
- Latencia y throughput: RTF de 211,9 en Apple M4 Max con Metal (procesa ~212 segundos de audio por segundo de cómputo), 38,2 en CPU del mismo chip, 36,2 en Vulkan sobre Ryzen 7 4750U y 12,8 en CPU del mismo Ryzen. En la práctica, un audio de 30 segundos se transcribe en menos de un segundo en hardware moderno.
- Formato de entrada: WAV mono a 16 kHz; para otros formatos es necesario convertir previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | WER LibriSpeech test-clean | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| whisper-base.en (este, GGUF) | 72,6 M | inglés | 30 s por ventana | 4,14-4,29% según cuantización | Apache-2.0 | GGUF |
| openai/whisper-base (multilingüe) | ~74 M | multilingüe (99 idiomas) | 30 s por ventana | no disponible en la información | Apache-2.0 | safetensors, GGUF (otras conversiones) |
| openai/whisper-tiny.en | ~39 M | inglés | 30 s por ventana | no disponible en la información | Apache-2.0 | safetensors, GGUF |
| openai/whisper-small.en | ~244 M | inglés | 30 s por ventana | no disponible en la información | Apache-2.0 | safetensors, GGUF |

La comparación directa con whisper-base multilingüe es la más relevante: misma arquitectura y tamaño casi idéntico, pero la variante .en es más rápida y precisa en inglés a costa de no soportar otros idiomas. Frente a whisper-tiny.en, la variante base ofrece mayor precisión a cambio de más cómputo; frente a whisper-small.en, la base es más ligera pero con WER típicamente superior (no se dispone del dato exacto en la información proporcionada). No se han encontrado en la información disponible conversiones GGUF equivalentes de otros autores para comparar directamente el trabajo de empaquetado.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe inglés; no detecta el idioma ni traduce. Para otros idiomas es necesario usar la variante multilingüe de Whisper.
- No soporta streaming: la inferencia requiere el audio completo (o chunks de hasta 30 segundos) antes de emitir resultados, lo que impide aplicaciones de transcripción en tiempo real estricto.
- Riesgo de alucinación en clips cortos, silencios o audio con ruido de fondo: el autor señala que las diferencias de WER entre ejecuciones (~0,1 pp) se deben principalmente a resultados de alucinación en el suelo de ruido.
- El WER reportado (4,14-4,29%) corresponde a LibriSpeech test-clean, un corpus de lectura relativamente limpio; en audio real (llamadas, reuniones, acentos no nativos) el error será sustancialmente mayor.
- Sin soporte de timestamps a nivel de palabra, solo a nivel de segmento, lo que limita aplicaciones de subtitulado fino o alineación forzada.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base de OpenAI; conviene revisar la model card original para términos adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversión reciente y poco validada por la comunidad, aunque el autor reporta validación numérica contra transformers.
- Dependencia de transcribe.cpp: no es un formato estándar de llama.cpp ni de Ollama, por lo que no se puede cargar con las herramientas habituales de LLM; requiere compilar el motor específico.
- El rendimiento en GPU NVIDIA no está documentado en la información disponible; el backend CPU es la opción segura en esa plataforma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/whisper-base.en-gguf
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-base.en
- Commit del modelo base fijado: https://huggingface.co/openai/whisper-base.en/commit/911407f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-base.en.md
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Conversión GGUF de referencia del autor de transcribe.cpp: https://huggingface.co/handy-computer/whisper-base.en-gguf
