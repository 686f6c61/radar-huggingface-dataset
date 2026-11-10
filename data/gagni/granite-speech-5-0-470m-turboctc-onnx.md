# gagni/granite-speech-5.0-470m-turboctc-onnx

## Resumen

`gagni/granite-speech-5.0-470m-turboctc-onnx` es una exportación a ONNX en cuantización int8 del modelo de reconocimiento automático del habla `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, en su variante multilingüe (revisión `91dcb06`). El modelo original emplea una arquitectura CTC (Connectionist Temporal Classification) con un encoder de bloques de self-attention y un cabezal CTC, y está pensado para inferencia en CPU mediante ONNX Runtime. El paquete resultante se distribuye como un único fichero `model.int8.onnx` de aproximadamente 550 MB que recibe una forma de onda de 16 kHz y devuelve un token por cada trama de 80 ms.

La relevancia de esta ficha radica en que traslada un modelo de reconocimiento de voz multilingüe a un formato desplegable en hardware de consumo sin GPU, manteniendo una tasa de error competitiva. Según los datos del autor, en el conjunto de test francés de FLEURS (676 clips, 117 minutos) el modelo int8 obtiene un WER del 7,20 % (6,35 % con normalización de números) a una velocidad de 36,5 RTFx en un Intel i7-13700H con 8 hilos, frente a los 15,3 RTFx de la versión fp32 y los 16,9 RTFx de `parakeet-tdt-0.6b-v3` int8 ONNX.

El modelo cubre siete idiomas (inglés, francés, alemán, español, portugués, italiano y japonés) y se publica bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales. Su orientación declarada es el dictado local (el autor menciona su uso en "aSup"), pero el contrato de entrada/salida documentado permite reutilizarlo en cualquier pipeline de transcripción por lotes o en tiempo real sobre CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de bloques de self-attention y cabezal CTC (Connectionist Temporal Classification) |
| Parametros totales | 470 M (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa la forma de onda completa de entrada; un token por trama de 80 ms) |
| Tipos de cuantizacion | int8 dinámica (QInt8, per-channel, solo MatMul); el banco de filtros mel permanece en fp32; también existe exportación fp32 |
| Idiomas soportados | en, fr, de, es, pt, it, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, ~550 MB) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es un sistema de reconocimiento de voz end-to-end con arquitectura CTC: un encoder basado en bloques de self-attention procesa representaciones log-mel y un cabezal CTC emite una distribución sobre el vocabulario por cada trama de 80 ms. La exportación a ONNX reescribe la extracción de características (80 log-mel más deltas, con apilado de tramas de dos en dos) como operaciones tensoriales, incluyendo la DFT como una convolución, con una diferencia máxima de 2e-5 respecto al extractor de `transformers` 5.22. Los bloques de self-attention y de subsampling se reescriben sin ramas dependientes de la forma para permitir un eje temporal dinámico; según el autor, la exportación fp32 reproduce el argmax de PyTorch en todas las tramas probadas.

La cuantización se realiza con `quantize_dynamic` de onnxruntime 1.23.2 (QInt8, per-channel, limitada a operaciones MatMul). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo original de IBM y no se detallan en la model card de esta exportación.

## Capacidades

- Reconocimiento automático del habla multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés.
- Salida CTC codiciosa (greedy): un token por trama de 80 ms, con colapso de repeticiones y eliminación del token blank (id 0).
- Detección de silencio mediante el token especial `<|nospeech|>`, que produce texto vacío.
- Entrada de forma de onda mono a 16 kHz en float32 con muestras en `[-1, 1]`.
- Inferencia enteramente en CPU mediante ONNX Runtime, sin dependencia de GPU.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá de ASR ni modo de razonamiento.

## Casos de uso

- Dictado local en aplicaciones de escritorio: el modelo recibe directamente la forma de onda del micrófono a 16 kHz y devuelve texto con una latencia de 215 ms para un clip de 10 segundos en un i7-13700H, lo que lo hace adecuado para escritura asistida sin conexión.
- Transcripción por lotes en servidores sin GPU: con 36,5 RTFx en CPU, un solo núcleo de 8 hilos puede transcribir aproximadamente 36 minutos de audio por minuto de cómputo, suficiente para procesar archivos de reuniones o pódcast en infraestructura estándar.
- Subtitulado y notas de reuniones multilingües: al cubrir siete idiomas, permite transcribir conversaciones en español, francés, alemán, italiano, portugués, inglés o japonés con un único binario y sin seleccionar modelo por idioma.
- Integración en aplicaciones móviles o embebidas: el fichero ONNX de ~550 MB y la ejecución en CPU permiten desplegar ASR en dispositivos sin acelerador dedicado, siempre que se disponga de ONNX Runtime para la plataforma.
- Preprocesado de pipelines de voz: la salida token a token cada 80 ms puede alimentar sistemas posteriores de diarización, alineamiento o búsqueda por palabras clave sin necesidad de un decoder adicional.
- Prototipado e investigación en ASR: al ser una exportación con scripts de reconstrucción incluidos en `export/`, sirve como base reproducible para experimentos de cuantización, comparación de extractores de características o evaluación de WER en nuevos dominios.

## Benchmarks y rendimiento

Datos publicados por el autor en el conjunto de test francés de FLEURS (676 clips, 117 minutos), sobre un Intel i7-13700H con 8 hilos intra-op, ONNX Runtime 1.23.2 y un clip a la vez. El autor advierte que la carga de la máquina durante la ejecución infla los tiempos absolutos, aunque las ratios se mantienen.

| Modelo | WER | WER con números normalizados | Velocidad (RTFx) | Latencia, clip de 10 s |
|---|---|---|---|---|
| Este modelo (int8) | 7,20 % | 6,35 % | 36,5 | 215 ms |
| Este modelo (fp32) | 6,98 % | 6,13 % | 15,3 | 500 ms |
| parakeet-tdt-0.6b-v3, int8 ONNX | 7,02 % | 6,43 % | 16,9 | 498 ms |

El WER se calcula sobre texto en minúsculas, sin puntuación, apóstrofos ni guiones que separen palabras. La columna de números normalizados convierte además números escritos con letras a dígitos en ambos lados (text2num). No se han publicado resultados de benchmarks en otros idiomas ni en tareas distintas de ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para la versión int8, que está diseñada para CPU; el fichero ocupa aproximadamente 550 MB en disco y requiere memoria RAM proporcional al tamaño del modelo más el buffer de audio.
- GPU recomendadas: no se documentan; el modelo se distribuye para ONNX Runtime en CPU.
- Compatibilidad con GPU de consumo: no está indicada; al ser un modelo de 470 M parámetros en int8, en teoría cabría en cualquier GPU con más de 1 GB de VRAM, pero no se han publicado pruebas al respecto.
- Opciones de despliegue: ONNX Runtime (versión de referencia 1.23.2) con el fichero `model.int8.onnx` y `tokenizer.json`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 215 ms por clip de 10 s y 36,5 RTFx en int8 sobre i7-13700H con 8 hilos; 500 ms y 15,3 RTFx en fp32 sobre el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER (FLEURS fr) | RTFx (CPU) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (int8) | 470 M | 7 | 7,20 % | 36,5 | Apache 2.0 | ONNX int8 |
| Este modelo (fp32) | 470 M | 7 | 6,98 % | 15,3 | Apache 2.0 | ONNX fp32 |
| parakeet-tdt-0.6b-v3 int8 ONNX | 600 M | no disponible | 7,02 % | 16,9 | no disponible | ONNX int8 |

No se dispone de datos comparativos adicionales frente a otros modelos de la misma categoría (Whisper, Wav2Vec 2.0, etc.) en la información proporcionada.

## Limitaciones y advertencias

- El WER de referencia solo se ha publicado para francés; el rendimiento en el resto de idiomas (en, de, es, pt, it, ja) no está cuantificado en la información disponible.
- La decodificación es CTC codiciosa sin modelo de lenguaje externo, lo que puede penalizar la puntuación, las mayúsculas y la coherencia en palabras poco frecuentes frente a sistemas con decoder.
- El modelo puede escribir números con letras ("quatre-cent-trois" en lugar de "403"), como señala el propio autor al justificar la métrica con normalización.
- La entrada debe ser mono a 16 kHz en float32 con muestras en `[-1, 1]`; cuando la longitud es un múltiplo impar de 160 muestras hay que añadir un cero final para que el apilado de tramas sea completo, según el contrato documentado.
- El silencio produce el token `<|nospeech|>` y, tras el filtrado de tokens especiales, un texto vacío; los pipelines deben manejar este caso.
- No se documentan sesgos demográficos, acentos ni dominios específicos; al ser una exportación del modelo de IBM, hereda los sesgos del modelo original, que no se detallan en la model card.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar `LICENSE` y `NOTICE` incluidos en el repositorio para cumplir con las atribuciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gagni/granite-speech-5.0-470m-turboctc-onnx
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
- Tokenizers (Hugging Face): https://github.com/huggingface/tokenizers
