# aloudreader/zipfa-ukrainian

## Resumen

zipfa-ukrainian es un modelo de alineamiento forzado (forced alignment) para ucraniano en escritura cirílica, desarrollado por aloudreader. No es un modelo de reconocimiento de voz general, sino una herramienta especializada que, dado un audio y su transcripción, devuelve la marca temporal de inicio y fin de cada palabra. Se distribuye en formato ONNX y forma parte de la familia zipfa, cuyo modelo de referencia es el alineador para inglés.

Técnicamente es un encoder Zipformer CTC de icefall con 9,7 millones de parámetros, entrenado sobre las 97,5 horas del corpus Common Voice 22 en ucraniano durante 60 épocas, partiendo del encoder del modelo inglés. La salida es una secuencia de 50 tramas por segundo, lo que da una resolución temporal de 20 ms.

Su relevancia práctica radica en que cubre un hueco: no existían alineadores públicos para ucraniano con estas características de tamaño (47 MB en precisión completa, 19 MB en int8), velocidad (factor de tiempo real de 0,008 en int8 con un hilo de CPU) y precisión (0,995 en el test de unión de clips, 0,027 de CER codicioso). Es útil para subtitulado, anotación de corpus y pipelines de datos de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer CTC encoder (icefall), entrenado con CR-CTC |
| Parametros totales | 9,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de hasta 120 s por llamada (ventanas solapadas de 30 s) |
| Tipos de cuantizacion | float32 (model.onnx, 47 MB) e int8 (model.int8.onnx, 19 MB) |
| Idiomas soportados | ucraniano (uk), escritura cirilica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, model.int8.onnx); tokenizador en tokens.txt y bpe.model |
| Entrada | audio mono a 16 kHz, filterbank de 80 dimensiones |
| Resolucion temporal | 50 tramas por segundo (20 ms) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder Zipformer con cabecera CTC implementado en icefall. Recibe features de filterbank de 80 dimensiones a 16 kHz y emite 50 tramas por segundo. Se entrenó con CR-CTC (consistency-regularized CTC) durante 60 épocas sobre speech-uk/cv22 (Common Voice 22 ucraniano, 97,5 horas), partiendo del encoder del modelo inglés zipfa. El checkpoint exportado es la media de los últimos 15.

No existen marcas temporales de referencia a nivel de palabra para ucraniano, por lo que el offset temporal calibrado (0,04 s) se copió del modelo inglés. El modelo se exportó a ONNX con soporte para audio largo: los audios de más de 30 s se codifican en ventanas solapadas de 30 s, manteniendo el consumo de memoria en torno a 600 MB en precisión nativa. La cuantización int8 no degrada la precisión reportada.

## Capacidades

- Alineamiento forzado: devuelve inicio y fin de cada palabra de una transcripción dada, con resolución de 20 ms.
- Manejo de audio largo: hasta 120 s por llamada mediante ventanas solapadas de 30 s.
- Tratamiento de palabras en alfabeto latino: los términos en escritura latina (nombres, anglicismos) reciben un tramo comodín compartido, que puede re-alinearse con el modelo inglés zipfa como segundo modelo.
- Ejecución en CPU: factor de tiempo real de 0,008 en int8 con un solo hilo.
- Ejecución en navegador: mediante onnxruntime-web (WASM), unos 25-35 ms para un clip de 5 s con 8 hilos y unos 275 MB de heap WASM.
- No realiza reconocimiento de voz libre ni traducción: requiere la transcripción como entrada.
- No dispone de tool calling, capacidades de agente ni multimodalidad.

## Casos de uso

- Subtitulado y karaoke: dado un audio y su transcripción, generar subtítulos con marcas temporales por palabra para vídeo o aplicaciones de lectura sincronizada.
- Anotación de corpus de voz: producir alineamientos a nivel de palabra para datasets ucranianos que carecen de timings de referencia, como base para entrenar otros modelos.
- Lectura asistida y audiolibros: sincronizar el texto resaltado con el audio narrado en aplicaciones de lectura, aprovechando la resolución de 20 ms.
- Verificación de transcripciones: comparar la duración esperada de cada palabra con el alineamiento para detectar omisiones o desajustes en transcripciones automáticas.
- Procesamiento por lotes en servidores sin GPU: al correr en CPU a RTF 0,008 en int8, permite alinear horas de audio en un servidor modesto.
- Aplicaciones web en el navegador: alinear clips cortos en cliente con onnxruntime-web, sin enviar el audio a un servidor.
- Preprocesado para pipelines de TTS: obtener duraciones por palabra para modelos de síntesis de voz en ucraniano que requieran timings.

## Benchmarks y rendimiento

| Medida | Valor (float32) | Valor (int8) |
|---|---|---|
| Test de union (200 pares de clips unidos por 0,3 s de silencio, tolerancia 0,10 s) | 0,995 | 0,995 |
| CER codicioso por caracteres | 0,027 | 0,027 |
| Velocidad, 1 hilo de CPU | no disponible | RTF 0,008 |
| Error de frontera de palabra | no medido (no hay timings de referencia en ucraniano) | no medido |

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. En GPU puede ejecutarse vía onnxruntime, pero no se publican requisitos de VRAM.
- Memoria RAM: en torno a 600 MB en precisión nativa para audio largo; unos 275 MB de heap WASM en navegador.
- GPU recomendadas: no disponibles; el modelo no requiere GPU.
- GPU de consumo: irrelevante, ya que el caso de uso es CPU. Cabe en cualquier equipo con unos 600 MB de RAM libres.
- Despliegue: paquete `zipfa` (numpy + onnxruntime + kaldi-native-fbank), CLI `python -m zipfa.cli`, y onnxruntime-web (WASM) en navegador.
- Latencia y throughput: RTF 0,008 en int8 con un hilo de CPU; 25-35 ms para un clip de 5 s en navegador con 8 hilos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| zipfa-ukrainian | Alineador forzado CTC (Zipformer) | 9,7 M | ucraniano | Apache 2.0 | ONNX |
| zipfa (ingles) | Alineador forzado CTC (Zipformer) | no disponible | ingles | no disponible en la informacion | ONNX |
| Whisper (alineamiento por timestamps) | ASR con marcas temporales aproximadas | desde 39 M (tiny) | multilingue | MIT | safetensors, GGUF, etc. |
| MFA (Montreal Forced Aligner) | Alineador GMM-HMM clasico | no aplica | multilingue con diccionario | MIT | modelos acusticos y de pronunciacion |

La comparación con Whisper es aproximada: Whisper ofrece timestamps a nivel de segmento o palabra con menor resolución y mayor coste computacional, mientras que zipfa-ukrainian está especializado y es mucho más ligero. No se dispone de datos comparativos de precisión entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere la transcripción correcta como entrada; no transcribe audio por sí solo.
- El error de frontera de palabra no está medido por falta de timings de referencia en ucraniano; el offset temporal (0,04 s) se hereda del modelo inglés y podría no ser óptimo.
- Las palabras en alfabeto latino reciben un tramo comodín compartido salvo que se use un segundo modelo para re-alinearlas.
- Solo cubre ucraniano en escritura cirílica; no soporta otros idiomas ni escrituras.
- Límite de 120 s por llamada; audios más largos deben dividirse.
- Riesgo de degradación con audio ruidoso, acentos no representados en Common Voice o transcripciones con errores.
- No se han publicado evaluaciones de sesgo; el corpus Common Voice puede no representar toda la variación dialectal del ucraniano.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset Common Voice 22 para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aloudreader/zipfa-ukrainian
- Dataset de entrenamiento: https://huggingface.co/datasets/speech-uk/cv22
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- onnxruntime: https://github.com/microsoft/onnxruntime
- onnxruntime-web: https://github.com/microsoft/onnxruntime/tree/main/js/web
- kaldi-native-fbank: https://github.com/csukuangfj/kaldi-native-fbank
- Common Voice: https://commonvoice.mozilla.org/
