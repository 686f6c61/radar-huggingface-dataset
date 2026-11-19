# rostrumstudios/speech

## Resumen

`rostrumstudios/speech` es un espejo público y fijado del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, exportado a ONNX en cuantización int8 por el proyecto k2-fsa/sherpa-onnx. No se trata de un modelo entrenado por Rostrum Studios: el repositorio redistribuye sin modificaciones los ficheros exactos que las aplicaciones de Rostrum (Sound y Compose) descargan en tiempo de ejecución, verificando su SHA-256 contra un commit fijo. El valor del repositorio es, por tanto, la reproducibilidad y la integridad binaria, no una aportación algorítmica nueva.

El modelo subyacente es un sistema ASR de aproximadamente 0,6 mil millones de parámetros basado en la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA NeMo, que transcribe voz a texto en inglés y otras 24 lenguas europeas, incluyendo puntuación, mayúsculas y marcas temporales a nivel de palabra. La exportación a ONNX int8 permite ejecución en CPU sin dependencias de CUDA ni de PyTorch, lo que lo hace adecuado para aplicaciones de escritorio y móviles.

Es relevante ahora porque ofrece una vía práctica para integrar ASR multilingüe de calidad en productos locales o de borde sin infraestructura GPU, con licencia CC-BY-4.0 que permite uso comercial con atribución. El repositorio ocupa 0,7 GB y contiene únicamente cuatro ficheros: encoder, decoder y joiner en int8 ONNX, más el vocabulario `tokens.txt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Token-and-Duration Transducer (TDT), familia NeMo de NVIDIA; exportada a ONNX en tres componentes (encoder, decoder, joiner) |
| Parametros totales | 0,6 mil millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante publicada en este repositorio) |
| Idiomas soportados | ingles y 24 lenguas europeas adicionales (segun la model card del autor); lista concreta no disponible |
| Licencia | CC-BY-4.0 (pesos, NVIDIA); codigo de exportacion Apache-2.0 (sherpa-onnx) |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) mas `tokens.txt` |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de NVIDIA NeMo. La arquitectura transducer combina un encoder acústico, un decoder de predicción y un joiner que produce conjuntamente el token y su duración, lo que permite emitir varios tokens por paso de decodificación y reduce la latencia frente a transducers convencionales. La exportación a ONNX separa estos tres componentes en ficheros independientes, con el encoder concentrando la práctica totalidad del peso (652 MB de los 670 MB totales del repositorio).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron etapas de ajuste fino supervisado o preferencias. La model card del espejo no incluye estos detalles y solo referencia el modelo original de NVIDIA. La innovación técnica relevante en este repositorio no reside en el entrenamiento sino en la conversión a int8 ONNX realizada por k2-fsa/sherpa-onnx, que habilita inferencia en CPU con un runtime ligero y sin dependencias de framework de deep learning.

## Capacidades

- Transcripción de voz a texto con reconocimiento automático del habla (pipeline `automatic-speech-recognition`).
- Soporte multilingüe: inglés y 24 lenguas europeas adicionales según la model card del autor; la lista exacta no está disponible.
- Generación de puntuación y mayúsculas en la salida transcrita.
- Marcas temporales a nivel de palabra (inicio y fin de cada palabra).
- Emisión de tokens con duración explícita gracias a la arquitectura TDT.
- Ejecución en CPU mediante ONNX Runtime y el runtime sherpa-onnx.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo; según el autor, Rostrum lo usa solo para análisis, nunca para generación.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones de escritorio: el modelo convierte grabaciones en texto con marcas temporales por palabra, lo que permite sincronizar subtítulos o resaltar la frase activa durante la reproducción.
- Subtitulado automático de vídeo (captioning): las marcas de inicio y fin por palabra facilitan la generación de ficheros SRT o WebVTT con tiempos ajustados, sin necesidad de alineamiento posterior.
- Búsqueda sobre archivos de audio: al transcribir con timestamps, se puede indexar el texto y permitir búsquedas que salten al instante exacto de la grabación.
- Dictado por voz en editores de texto: la ejecución en CPU vía ONNX permite integrar dictado local en aplicaciones sin enviar audio a la nube, con la consiguiente mejora de privacidad.
- Accesibilidad: generación de transcripciones en vivo o diferidas para personas con discapacidad auditiva en entornos donde no hay GPU disponible.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el tamaño de 0,7 GB y la cuantización int8 permiten desplegar el modelo en contenedores modestos y procesar colas de grabaciones con throughput razonable en CPU.
- Análisis de contenido multimedia en aplicaciones de creación: extracción de texto de pistas de audio para etiquetado, resúmenes o moderación, aprovechando el soporte de 25 lenguas europeas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en su configuración publicada; el modelo está pensado para inferencia en CPU con ONNX Runtime. El encoder int8 ocupa 652 MB en disco y su huella en memoria es del mismo orden.
- GPU recomendadas: no disponible; el repositorio no documenta ejecución en GPU. Al ser ONNX, podría ejecutarse con proveedores de ejecución CUDA o TensorRT, pero no se han publicado configuraciones ni métricas.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 u otras; el caso de uso declarado es CPU.
- Opciones de despliegue: sherpa-onnx (runtime de referencia), ONNX Runtime en general. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR transducer.
- Latencia y throughput: no disponibles. La cuantización int8 y la arquitectura TDT están orientadas a reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| rostrumstudios/speech (Parakeet TDT 0.6B v3 int8 ONNX) | ~0,6 B | no disponible | ingles + 24 europeas | CC-BY-4.0 | ONNX int8 |
| nvidia/parakeet-tdt-0.6b-v3 (original) | ~0,6 B | no disponible | ingles + 24 europeas | CC-BY-4.0 | NeMo / safetensors (no confirmado) |
| Whisper large-v3 (referencia de la categoria) | ~1,55 B | 30 s de audio | ~99 idiomas | MIT | safetensors, GGUF, ONNX |
| Whisper small | ~244 M | 30 s de audio | ~99 idiomas | MIT | safetensors, GGUF, ONNX |

La comparación con Whisper se ofrece como referencia de categoría; no se dispone de datos de benchmarks que permitan comparar rendimiento entre ambos en este repositorio.

## Limitaciones y advertencias

- El repositorio es un espejo, no un modelo propio: cualquier cambio en el modelo original o en la exportación de sherpa-onnx requeriría una nueva versión fijada por Rostrum.
- Solo se publica la variante int8 ONNX; no hay pesos en precisión completa ni otras cuantizaciones en este repositorio.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento en acentos o dominios específicos.
- La lista exacta de idiomas soportados no está disponible; la model card solo indica "inglés y 24 lenguas europeas adicionales".
- No se especifica la longitud máxima de audio procesable ni el contexto del encoder.
- El uso comercial está permitido bajo CC-BY-4.0, pero exige atribución a NVIDIA y mención de la conversión por k2-fsa/sherpa-onnx; el texto de atribución está incluido en la model card.
- El código de exportación es Apache-2.0, licencia distinta de la de los pesos; conviene revisar ambas al redistribuir.
- Al ser un modelo ASR puro, no debe esperarse de él generación de texto libre, razonamiento ni capacidades de agente.
- La verificación de integridad depende de los SHA-256 publicados; si se descargan los ficheros desde otra fuente, deben compararse manualmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rostrumstudios/speech
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación int8 ONNX de origen: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Perfil del autor: https://huggingface.co/rostrumstudios
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
