# Abittee/amharic-speech-to-text-efa-v1-coreml

## Resumen

El modelo `amharic-speech-to-text-efa-v1-coreml` es una conversión a Core ML del modelo de reconocimiento automático de voz (ASR) en amárico `Abittee/amharic-speech-to-text-efa-v1`, desarrollado por Endrias F. Abitte. Se trata de un fine-tuning de `facebook/w2v-bert-2.0` con una cabeza CTC, empaquetado en formato Core ML con pesos cuantizados a 8 bits para su ejecución en dispositivo (on-device) en iPhone. Forma parte de la infraestructura de la aplicación Amharic Notes, que realiza transcripción de voz local sin depender de la nube.

La relevancia del modelo radica en que lleva un sistema ASR de una lengua de bajos recursos como el amárico a un dispositivo móvil con un tamaño contenido: aproximadamente 609 MB frente a los 2,4 GB del modelo original en PyTorch. La cuantización simétrica a 8 bits por canal de salida en todas las capas lineales y convolucionales apenas degrada la precisión respecto al modelo original, según los datos publicados por el autor.

El modelo está pensado exclusivamente para inferencia en iOS 17 o superior, con entrada de características log-mel de Kaldi (80 bins, ventana de 25 ms, salto de 10 ms) y salida de logits para decodificación CTC voraz. No está diseñado como modelo de servidor ni como base para fine-tuning adicional en el formato Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 con cabeza CTC (transformer convolucional auto-supervisado + clasificador CTC) |
| Parametros totales | no disponible (el modelo base es facebook/w2v-bert-2.0; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto textual; en audio, clips de 0,5 a 20 s (T de 12 a 1500 frames de 20 ms) |
| Tipos de cuantizacion | 8 bits simetrica, por canal de salida, en todas las capas lineales y convolucionales |
| Idiomas soportados | am (amárico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Core ML (`.mlpackage` / `.mlmodel`); tamano del repo 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `facebook/w2v-bert-2.0`, un transformer preentrenado de forma auto-supervisada sobre audio multilingüe, al que se le añade una cabeza de clasificación CTC para ASR. El fine-tuning se realizó sobre datos en amárico de los corpus WAXAL y FLEURS, según indica la model card. La conversión a Core ML aplica cuantización simétrica a 8 bits por canal de salida en todas las capas lineales y convolucionales, reduciendo el tamaño de 2,4 GB a unos 609 MB.

La entrada del modelo Core ML es un tensor `input_features` de tipo float32 con forma (1, T, 160): 80 bins log-mel de Kaldi, normalizados por bin sobre toda la locución, con dos frames apilados (20 ms por fila). La salida es `logits` de forma (1, T', vocab), con un frame cada 0,04 s. La decodificación es CTC voraz con `vocab.json`: argmax, colapso de repeticiones, eliminación del token blank (id 284) y `|` como espacio. El paquete incluye `feature_extractor.json` con todos los parámetros de extracción (ventana, filtros mel) y `model_info.json` con tamaños y SHA-256 de cada fichero. Requiere iOS 17 como mínimo.

## Capacidades

- Reconocimiento automático de voz en amárico, con salida de texto a partir de audio muestreado en clips de 0,5 a 20 s.
- Decodificación CTC voraz integrada en la salida del modelo (logits por frame).
- Ejecución on-device en iPhone mediante Core ML, sin necesidad de conexión a red.
- Extracción de características log-mel compatible con Kaldi incluida en el paquete (`feature_extractor.json`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta otros idiomas distintos del amárico.
- No incluye modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de notas de voz en la app Amharic Notes: el modelo convierte grabaciones de hasta 20 s en texto amárico directamente en el iPhone, sin enviar audio a servidores externos.
- Dictado en aplicaciones iOS para hablantes de amárico: integración del `.mlpackage` en un pipeline de reconocimiento de voz nativo que procesa audio del micrófono en tiempo real con latencia de dispositivo.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en amárico sobre grabaciones cortas, aprovechando que el modelo funciona sin conexión y preserva la privacidad del audio.
- Digitalización de entrevistas y notas de campo en amárico: procesamiento por lotes de clips de 0,5 a 20 s en un dispositivo iOS para entornos con conectividad limitada.
- Investigación lingüística de campo: transcripción asistida de corpus orales en amárico en dispositivos móviles, con la ventaja de que el modelo cabe en un teléfono y no requiere GPU de servidor.
- Aplicaciones educativas de aprendizaje de amárico: evaluación de pronunciación o transcripción de ejercicios orales en el propio dispositivo, sin coste de inferencia en la nube.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (decodificación CTC voraz, conjuntos de test completos, clips de 0,5 a 20 s; no se cuentan errores en letras homófonas ni puntuación). La columna de 8 bits es una simulación en PyTorch de los pesos exactos cuantizados.

| Test set | Original (WER / CER) | 8 bits (WER / CER) |
|---|---|---|
| WAXAL amh_asr test (3031 clips) | 23,49 % / 9,55 % | 23,54 % / 9,56 % |
| FLEURS am_et test (505 clips) | 15,84 % / 4,56 % | 15,88 % / 4,59 % |

No se han publicado resultados de latencia ni throughput en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en dispositivo Apple con Core ML; requiere iOS 17 o superior.
- Tamano del paquete Core ML: aproximadamente 609 MB, lo que condiciona el espacio de almacenamiento en el dispositivo.
- No está pensado para GPU de servidor (A100, H100, RTX 4090) ni para frameworks de servidor como vLLM, TGI o llama.cpp; el formato es Core ML.
- Compatible con iPhone que ejecuten iOS 17; el autor no detalla modelos concretos ni requisitos de Neural Engine.
- Latencia y throughput no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Abittee/amharic-speech-to-text-efa-v1-coreml | no disponible | clips de 0,5 a 20 s | am | CC BY-SA 4.0 | Core ML 8 bits |
| Abittee/amharic-speech-to-text-efa-v1 (original) | no disponible | clips de 0,5 a 20 s | am | CC BY-SA 4.0 | PyTorch (safetensors) |
| facebook/w2v-bert-2.0 | no disponible | no disponible | multilingue | no disponible en esta ficha | PyTorch |

No se dispone de datos de benchmarks de modelos alternativos de ASR en amárico en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo reconoce amárico; no es multilingüe y no debe usarse con otros idiomas.
- Los clips de audio deben estar entre 0,5 y 20 s; fuera de ese rango no está garantizado el funcionamiento.
- La evaluación excluye errores en letras homófonas (ሀ/ሐ/ኀ, ሰ/ሠ, አ/ዐ, ጸ/ፀ) y puntuación, por lo que el WER real percibido por el usuario puede ser mayor.
- El WER en WAXAL (23,54 %) es notablemente superior al de FLEURS (15,88 %), lo que sugiere sensibilidad a la variabilidad del corpus y posibles sesgos hacia el dominio de FLEURS.
- Licencia CC BY-SA 4.0: el uso comercial está permitido, pero cualquier obra derivada debe compartirse bajo la misma licencia y atribuir al autor original.
- Requiere iOS 17; no es desplegable en servidores, contenedores ni GPUs convencionales.
- Riesgo de alucinación inherente a los modelos CTC: pueden producirse inserciones o sustituciones en audio ruidoso o con acentos no representados en el entrenamiento.
- El modelo no incluye puntuación ni normalización de texto más allá de la salida CTC.

## Enlaces

- Hugging Face: https://huggingface.co/Abittee/amharic-speech-to-text-efa-v1-coreml
- Modelo base: https://huggingface.co/Abittee/amharic-speech-to-text-efa-v1
- Modelo preentrenado de origen: https://huggingface.co/facebook/w2v-bert-2.0
