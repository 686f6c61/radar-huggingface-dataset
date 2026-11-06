# akm9191/sherpa-onnx-indicconformer-ml-int8

## Resumen

Este repositorio contiene una conversión a ONNX con cuantización int8 del modelo IndicConformer de AI4Bharat para reconocimiento automático de voz (ASR) en malayalam, empaquetada para su uso con la librería sherpa-onnx. El modelo original es un Conformer híbrido con cabezas CTC y RNNT; esta versión conserva únicamente la rama CTC y recorta el vocabulario compartido de 22 lenguas (5.633 salidas) a los 256 tokens específicos del malayalam más el token blank, de modo que la softmax opera solo sobre el alfabeto malayalam. El resultado son 257 entradas en `tokens.txt`.

El paquete está pensado para dictado en dispositivo: el autor lo publica para su aplicación Android de notas "Daily Whisper", de forma que el audio nunca sale del teléfono. La cuantización dinámica int8 reduce el grafo de 482 MB a 138 MB, lo que hace viable su despliegue en móviles y equipos sin GPU. No se ha realizado entrenamiento ni ajuste fino: el trabajo es exclusivamente de conversión, corrección de metadatos y cuantización.

Es relevante porque demuestra un flujo reproducible para llevar un modelo ASR multilingüe de investigación a un runtime de producción ligero (sherpa-onnx sobre ONNX Runtime), con métricas medidas sobre el split de test de FLEURS y una licencia permisiva (MIT) que facilita su reutilización comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer híbrido CTC/RNNT (rama CTC empleada), exportado a ONNX |
| Parámetros totales | no disponible (el modelo base se denomina "large"; el autor referencia pesos ONNX de 120M en la cadena de procedencia) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming; se recomienda segmentar con VAD) |
| Tipos de cuantización | int8 dinámica (QUInt8) sobre MatMul y Conv, vía `quantize_dynamic` de ONNX Runtime; existe el fp32 de origen (482 MB) |
| Idiomas soportados | malayalam (ml) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`, 137.677.591 bytes) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Conformer de AI4Bharat con dos cabezas de decodificación (CTC y RNNT) entrenado sobre un vocabulario compartido de 22 lenguas indias. Esta publicación no entrena nada: parte de una conversión ONNX previa (atribuida en la model card a `jeswinjestin/sherpa-onnx-nemo-ctc-indicconformer-malayalam`, que a su vez cita `sulabhkatiyar/indicconformer-120m-onnx` y `trysem/indicconformer-120m-onnx`) y aplica tres cambios concretos.

El primero es el recorte de la cabeza CTC: de 5.633 salidas a 256 tokens malayalam (índices 2560-2815) más blank, recalculando la softmax sobre ese subconjunto. El segundo es la corrección del metadato `subsampling_factor` de 8 a 4; con el valor erróneo sherpa-onnx descartaba la segunda mitad de cada enunciado y disparaba el WER al 65 %. El tercero es la cuantización dinámica int8 (QUInt8) sobre operaciones MatMul y Conv, que reduce el tamaño un 71 %. No se documentan detalles sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo RLHF; esa información corresponde al modelo base de AI4Bharat y no se reproduce aquí.

## Capacidades

- Transcripción de voz a texto en malayalam, offline y no streaming (procesa un enunciado completo por decodificación).
- Decodificación CTC greedy sobre un vocabulario restringido al malayalam, lo que evita confusiones con otras lenguas indias del vocabulario original.
- Ejecución en CPU con ONNX Runtime; soporta ajuste de hilos (`num_threads`).
- Integración con detección de actividad de voz (p. ej. Silero VAD) para segmentar audio largo en frases antes de decodificar.
- Escritura de números como palabras (no normaliza cifras), comportamiento heredado del modelo base.
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento; es un modelo ASR puro.
- No es multilingüe: solo malayalam.

## Casos de uso

- Dictado en aplicaciones móviles: es el caso para el que se publicó (app Android de notas). Los 138 MB del grafo int8 y la ejecución sobre ONNX Runtime en CPU permiten inferencia en dispositivo sin enviar audio a la nube.
- Transcripción de reuniones y notas de voz en malayalam: combinado con un VAD que corte el audio en frases, se decodifica cada segmento con `OfflineRecognizer.from_nemo_ctc` y se concatenan los resultados.
- Subtitulado por lotes de archivos de audio en malayalam: el RTF medido de 0,057 en una máquina x86 con 2 hilos indica que procesar una hora de audio requiere aproximadamente 3,4 minutos de cómputo.
- Pipelines de accesibilidad para hablantes de malayalam: conversión de voz a texto en tiempo casi real en equipos modestos, sin GPU, para generar subtítulos o transcripciones de apoyo.
- Archivado y búsqueda de contenido hablado: transcripción masiva de grabaciones para indexación textual, aprovechando el bajo coste de inferencia en CPU.
- Prototipado y evaluación de ASR en lenguas de bajos recursos: el script `eval_fleurs.py` incluido permite reproducir la medición sobre FLEURS `ml_in` y comparar variantes (fp32 frente a int8) antes de adoptar el modelo.
- Integración en aplicaciones de escritorio o edge con sherpa-onnx: al ser un paquete nativo de esa librería, se puede incrustar en C++, Python, Android o iOS sin dependencias de Python en producción.

## Benchmarks y rendimiento

Mediciones del autor sobre 60 clips (936 s) del split de test de FLEURS `ml_in`, con puntuación eliminada y sin normalización de números (el modelo escribe cifras como palabras y las referencias usan dígitos, lo que infla el WER):

| Fichero | Tamaño | WER | CER | RTF (x86, 2 hilos) |
|---|---|---|---|---|
| fp32 de origen, metadatos corregidos | 482 MB | 25,3 % | 6,1 % | 0,037 |
| este repositorio (int8 MatMul+Conv) | 138 MB | 26,7 % | 5,8 % | 0,057 |

El autor señala que el malayalam es aglutinante, por lo que el WER sobreestima el error real y el CER es la métrica más informativa. La cuantización int8 cuesta 1,4 puntos de WER y un 54 % más de tiempo de inferencia relativo al fp32, a cambio de una reducción de tamaño del 71 %. No hay comparación con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU. El grafo int8 ocupa 138 MB en disco y una huella en memoria del mismo orden.
- GPU recomendadas: no aplica; no se documenta soporte de aceleración por GPU en esta publicación.
- Cabe en cualquier GPU de consumo y en dispositivos móviles; el caso de uso declarado es un teléfono Android.
- Despliegue: sherpa-onnx con ONNX Runtime (`OfflineRecognizer.from_nemo_ctc`), en Python, C++ o bindings móviles. No se documenta integración con vLLM, TGI ni llama.cpp (no son aplicables a un modelo ASR).
- Latencia y throughput: RTF 0,057 con 2 hilos en una máquina x86 sin especificar, es decir, unas 17,5 veces más rápido que tiempo real en esa configuración. Con `num_threads` mayor el RTF debería mejorar, aunque no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| Este repositorio (IndicConformer ml int8) | Conformer CTC | malayalam | 138 MB | MIT | ONNX (sherpa-onnx) |
| ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large (base) | Conformer CTC+RNNT | malayalam | no disponible | MIT | NeMo |
| jeswinjestin/sherpa-onnx-nemo-ctc-indicconformer-malayalam | Conformer CTC | malayalam (vocabulario completo de 22 lenguas) | no disponible | CC-BY-4.0 | ONNX (sherpa-onnx) |
| sulabhkatiyar/indicconformer-120m-onnx | Conformer CTC | multilingüe indio | ~120M parámetros (según denominación) | no disponible | ONNX |

La diferencia principal frente al paquete de `jeswinjestin` es el recorte de vocabulario al malayalam y la cuantización int8; frente al modelo base de AI4Bharat, la ausencia de la rama RNNT y el formato ONNX listo para sherpa-onnx. No se dispone de cifras de WER de los modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo malayalam: cualquier audio en otra lengua producirá salidas incorrectas, ya que la cabeza CTC se ha recortado a 256 tokens.
- Modelo no streaming: requiere segmentación previa con VAD; no apto para transcripción incremental en tiempo real sin ese paso.
- WER elevado en términos absolutos (26,7 % en FLEURS test), aunque el CER del 5,8 % indica que la mayoría de caracteres son correctos; en malayalam aglutinante el WER no es una buena guía aislada.
- No normaliza números: escribe las cifras como palabras, lo que puede romper pipelines posteriores que esperen dígitos.
- La cuantización int8 introduce una degradación medible (1,4 puntos de WER) y aumenta el RTF un 54 % frente al fp32 en la misma máquina.
- Riesgo de alucinación en audio con ruido, silencios o habla solapada, inherente a los modelos CTC; se recomienda VAD y umbrales de confianza.
- Sesgos: no se documentan evaluaciones de sesgo por género, edad, dialecto o acento dentro del malayalam; el rendimiento puede variar entre variedades regionales.
- Licencia MIT en este paquete, pero la cadena de procedencia incluye un componente CC-BY-4.0 (`jeswinjestin/...`), lo que exige revisar la atribución si se redistribuye.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas declaradas.
- Fecha de creación declarada en 2026-10-29; verificar la vigencia de los artefactos antes de integrarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akm9191/sherpa-onnx-indicconformer-ml-int8
- Modelo base: https://huggingface.co/ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large
- Repositorio de AI4Bharat: https://github.com/AI4Bharat/IndicConformerASR
- Conversión ONNX de origen: https://huggingface.co/jeswinjestin/sherpa-onnx-nemo-ctc-indicconformer-malayalam
- Pesos ONNX citados: https://huggingface.co/sulabhkatiyar/indicconformer-120m-onnx y https://huggingface.co/trysem/indicconformer-120m-onnx
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset de evaluación FLEURS: https://huggingface.co/datasets/google/fleurs
