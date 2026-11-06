# mrfakename/phonon-2.5-english-webgpu-weights

## Resumen

Phonon-2.5 English (ONNX) es una exportación del modelo de reconocimiento automático del habla FermionResearch/Phonon-2.5-English a formato ONNX, publicada por mrfakename. El modelo original es una adaptación de nvidia/parakeet-tdt-0.6b-v3, un sistema ASR de arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) y aproximadamente 0,6 mil millones de parámetros. Esta versión no reentrena nada: expande los pesos empaquetados en un contenedor de baja precisión del modelo original mediante el lector de referencia del autor y los carga en la arquitectura Parakeet TDT para exportarlos con NeMo.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de calidad en entornos donde no hay GPU dedicada ni Python: ONNX Runtime en CPU y, sobre todo, ONNX Runtime Web con WebGPU en el navegador. Es la base del demo público mrfakename/phonon-2.5-english-webgpu. El repositorio ocupa 3,8 GB porque los grafos ONNX contienen los pesos ya expandidos, muy por encima de los 158 MB del contenedor original.

El modelo está especializado exclusivamente en inglés y su tarea es la transcripción de voz a texto. No es un modelo multimodal ni de propósito general: es un componente de infraestructura para pipelines de ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer (FastConformer) con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por ventanas de audio; el demo procesa clips de hasta 47 s segmentados en pausas) |
| Tipos de cuantizacion | fp32, fp16 (encoder y decoder), int8 (decoder) |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.onnx, encoder-model.fp16.onnx, decoder_joint-model.onnx, decoder_joint-model.fp16.onnx, decoder_joint-model.int8.onnx, nemo128.onnx, preprocessor.onnx) |

## Arquitectura y entrenamiento

El modelo subyacente es un Conformer de NVIDIA (parakeet-tdt-0.6b-v3) con decodificador TDT, que predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso y reducir el coste de decodificación frente a un CTC o un transducer clásico. La exportación conserva el encoder FastConformer en fp32 y fp16, el par decoder+joint en fp32, fp16 e int8, y dos frontales log-mel de 128 bins: nemo128.onnx (procedente de onnx-asr, MIT) y preprocessor.onnx (reescrito con operaciones ONNX estándar compatibles con ONNX Runtime Web, procedente de eschmidbauer/parakeet-redux-onnx).

No hubo reentrenamiento ni ajuste fino en esta conversión: los pesos se expanden desde el contenedor de baja precisión del modelo original con reference_transformers.py y se cargan en la arquitectura Parakeet para su exportación con NeMo. Los detalles de datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO) no se especifican en la información disponible; el NOTICE del repositorio original contiene la referencia completa, incluidos los datos de entrenamiento. La innovación técnica de esta ficha es puramente de despliegue: grafos ONNX con nombres de tensores compatibles con los exports habituales de Parakeet TDT, de modo que herramientas como onnx-asr y parakeet.js pueden cargarlos sin adaptaciones.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización (el decoder int8 pierde algunas comas).
- Reconocimiento de habla continua con segmentación por pausas para clips largos (verificado con una concatenación de 47 s).
- Ejecución en CPU mediante ONNX Runtime en Python.
- Ejecución en navegador mediante ONNX Runtime Web con WebGPU (encoder fp16 + decoder fp32 en el demo).
- Extracción de características log-mel de 128 bins integrada (nemo128.onnx y preprocessor.onnx, equivalentes con una tolerancia de aproximadamente 1e-4).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción ni generación de texto libre.
- No es multilingüe: solo inglés.

## Casos de uso

- Transcripción en el navegador sin backend: el demo oficial carga el encoder fp16 y el decoder fp32 con ONNX Runtime Web sobre WebGPU, de modo que la audio nunca sale del dispositivo del usuario; adecuado para aplicaciones de dictado o subtitulado con requisitos de privacidad.
- Subtitulado de reuniones y webinars en inglés: el modelo procesa clips largos segmentándolos en pausas, como se validó con la concatenación de 47 s, y produce transcripciones con puntuación listas para un editor de actas.
- Pipelines de ASR en servidor sin GPU: la variante fp32 sobre ONNX Runtime CPU permite desplegar transcripción en contenedores ligeros donde no hay CUDA disponible.
- Integración en aplicaciones de escritorio y móviles vía onnx-asr: la estructura de tensores sigue el layout común de Parakeet TDT ONNX, por lo que onnx-asr y parakeet.js lo cargan directamente sin conversión adicional.
- Prototipado rápido de productos de voz: al estar en ONNX, se puede incrustar en flujos de JavaScript o Python existentes sin dependencias de NeMo ni de PyTorch en tiempo de inferencia.
- Evaluación comparativa de cuantizaciones: el repositorio incluye fp32, fp16 e int8 del decoder, lo que permite medir el compromiso entre latencia y exactitud (fp16+int8 baja a 2/4 coincidencias exactas en la verificación del autor frente a 4/4 en fp32+fp32).
- Archivado y búsqueda de audio: transcripción por lotes de grabaciones en inglés para indexación textual, con la salvedad de que el decoder int8 introduce errores en puntuación y abreviaturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech, Common Voice u otros) en la información disponible. El autor sí documenta una verificación de coincidencia exacta de transcripción contra el motor de referencia (fermion transcribe phonon-2.5-en, fp32) sobre tres clips de LibriSpeech dev-clean (5,9 s, 10,9 s y 29,4 s) y una concatenación de 47 s:

| Encoder + decoder | Coincidencia exacta |
|---|---|
| fp32 + fp32 | 4 / 4 |
| fp16 + fp32 | 3 / 4 (el clip largo difiere en una palabra: "mister Carker" en lugar de "Mr Carker") |
| fp16 + fp16 | igual que fp16 + fp32 |
| fp16 + int8 | 2 / 4 (pierde comas y escribe "mister" por "Mr") |

El modelo NeMo cargado con estos pesos reproduce exactamente las transcripciones de referencia. No se han publicado cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El encoder fp32 y fp16 y el decoder fp32 suman varios GB en disco (repositorio de 3,8 GB); en fp16 la huella se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el demo en navegador; en servidor, GPU con CUDA para ONNX Runtime GPU, aunque el modelo está pensado para CPU y WebGPU.
- Cabe en GPU de consumo: sí, en tarjetas con suficiente memoria para el encoder fp16; el decoder int8 reduce aún más el requisito. No se especifican mínimos exactos.
- Opciones de despliegue: ONNX Runtime (Python, CPU), ONNX Runtime Web con WebGPU, onnx-asr, parakeet.js, y NeMo para cargar los pesos expandidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mrfakename/phonon-2.5-english-webgpu-weights | ~0,6 B | en | ONNX (fp32/fp16/int8) | CC BY 4.0 | Exportación para ONNX Runtime y WebGPU |
| FermionResearch/Phonon-2.5-English | ~0,6 B | en | contenedor de baja precisión (158 MB) | CC BY 4.0 | Modelo original, requiere su motor de referencia |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | multilingüe (según model card de NVIDIA) | NeMo | CC BY 4.0 | Arquitectura base; no disponible aquí el detalle de idiomas |
| ysdede/parakeet-tdt-0.6b-v3-onnx | ~0,6 B | multilingüe (según model card de NVIDIA) | ONNX | CC BY 4.0 | Exportación ONNX de referencia; origen de nemo128.onnx |

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni code-switching.
- El decoder int8 degrada la exactitud (2/4 coincidencias exactas en la verificación del autor), con pérdida de comas y expansión incorrecta de abreviaturas ("mister" por "Mr").
- El encoder fp16 puede alterar palabras aisladas en clips largos, como documenta el propio autor.
- Riesgo de alucinación y de errores en nombres propios, siglas y audio con ruido; no se han publicado tasas de WER.
- Los grafos ONNX contienen los pesos expandidos y ocupan 3,8 GB, muy por encima de los 158 MB del contenedor original; conviene podar o cuantizar para despliegues con almacenamiento limitado.
- Licencia CC BY 4.0: permite uso comercial con atribución a Fermion Research y a NVIDIA Corporation; el NOTICE del repositorio original debe conservarse.
- No es un modelo de propósito general: no admite instrucciones, tool calling ni generación de texto.
- No se especifican límites de duración de audio por ventana; el demo segmenta en pausas, por lo que la calidad en audio continuo sin pausas no está documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrfakename/phonon-2.5-english-webgpu-weights
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Arquitectura de referencia: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Demo en navegador: https://huggingface.co/spaces/mrfakename/phonon-2.5-english-webgpu
- Exportación ONNX de referencia: https://huggingface.co/ysdede/parakeet-tdt-0.6b-v3-onnx
- Herramienta onnx-asr: https://github.com/istupakov/onnx-asr
- parakeet.js: https://github.com/ysdede/parakeet.js
- Frontal log-mel alternativo: https://huggingface.co/eschmidbauer/parakeet-redux-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
