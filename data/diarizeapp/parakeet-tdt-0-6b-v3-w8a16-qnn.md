# diarizeapp/parakeet-tdt-0.6b-v3-w8a16-qnn

## Resumen

El modelo `diarizeapp/parakeet-tdt-0.6b-v3-w8a16-qnn` es una conversión cuantizada del sistema de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B v3, desarrollado originalmente por NVIDIA. Esta variante específica ha sido preparada por el equipo de `diarize` para ejecutarse de forma eficiente en el NPU Hexagon de los procesadores Qualcomm Snapdragon X Elite, utilizando el esquema de cuantización estática W8A16 (pesos INT8, activaciones FP32/UINT8) y el formato ONNX con operadores QDQ.

El modelo resuelve el problema de la transcripción de voz a texto en dispositivos con hardware Qualcomm, aprovechando la aceleración por NPU para reducir la latencia y el consumo energético frente a la ejecución en CPU o GPU. Su relevancia actual radica en la creciente demanda de ASR local en portátiles y dispositivos edge con Snapdragon, donde la inferencia en el Hexagon NPU permite procesamiento en tiempo real sin depender de la nube. La arquitectura subyacente es un encoder FastConformer con un decodificador conjunto RNNT/TDT, con un total de aproximadamente 600 millones de parámetros. Esta versión concreta está limitada al idioma inglés, aunque el modelo original de NVIDIA soporta 25 lenguas europeas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNNT/TDT (decoder conjunto) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio con forma estática [1, 128, 3072]) |
| Tipos de cuantizacion | W8A16 estática QDQ (INT8 pesos, FP32/UINT8 activaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (con pesos externos en archivo .data) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA, Parakeet TDT 0.6B v3, emplea un encoder FastConformer (una variante eficiente del conformer) junto con un decodificador conjunto basado en RNNT/TDT (Transducer with Dynamic Transducer). El entrenamiento del modelo base se realizó con datos de habla multilingüe, aunque esta versión cuantizada se ha limitado al inglés. La conversión a W8A16 QDQ estático fue realizada por `diarize`, calibrando los operadores `MatMul` y `Conv` con cuantización de pesos INT8 y activaciones en FP32/UINT8, mientras que las operaciones de atención y downsampling se mantienen en precisión original. El encoder acepta una entrada de audio con forma estática `[1, 128, 3072]` (batch, frames, características) y el decodificador conjunto contiene un operador LSTM que debe ejecutarse en CPU.

## Capacidades

- Transcripción de voz a texto en inglés con alta precisión, heredada del modelo base de NVIDIA.
- Inferencia optimizada para NPU Qualcomm Hexagon (Snapdragon X Elite) mediante ONNX Runtime con `QNNExecutionProvider`.
- Detección automática de idioma en el modelo original, aunque esta versión está restringida a inglés.
- Procesamiento de audio en tiempo real gracias a la aceleración por hardware y al tamaño compacto del modelo.
- Compatibilidad con el ecosistema `diarize` para ejecución nativa en Windows ARM64 con `--device npu`.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multimodal; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en portátiles con Snapdragon X Elite: el modelo puede procesar audio localmente en el NPU, manteniendo la privacidad de los datos y funcionando sin conexión.
- Subtitulado automático de vídeos en tiempo real: gracias a la baja latencia de la inferencia en Hexagon, es viable generar subtítulos sincronizados en aplicaciones de edición o streaming.
- Asistentes de voz en dispositivos edge: integración en asistentes personales que requieren comprensión de comandos hablados sin depender de servicios en la nube.
- Grabación y dictado médico o legal: transcripción de notas de voz con alta precisión en entornos donde la confidencialidad es crítica.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio a texto en aplicaciones de comunicación en tiempo real.
- Automatización de llamadas de atención al cliente: transcripción de conversaciones telefónicas para análisis posterior, ejecutada en hardware local para reducir costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de NVIDIA reporta métricas en su página oficial (por ejemplo, WER en conjuntos de datos como LibriSpeech o Common Voice), pero no se dispone de esos datos en esta documentación. Tampoco se ofrecen mediciones de latencia o throughput específicas para la versión cuantizada en el NPU Hexagon.

## Requisitos de hardware

- Hardware objetivo: Qualcomm Snapdragon X Elite (SC8380XP) con arquitectura Hexagon V73 NPU.
- Memoria: aproximadamente 1.30 GB para el encoder cuantizado, por debajo del límite de 1.5 GB de memoria física contigua del CDSP de Qualcomm.
- Ejecución: requiere ONNX Runtime con `QNNExecutionProvider` (apuntando a `QnnHtp.dll`). El decodificador conjunto (`decoder_joint-model.onnx`) debe ejecutarse en `CPUExecutionProvider` debido a su operador LSTM.
- No se especifican GPUs compatibles; el modelo está diseñado exclusivamente para NPU Qualcomm.
- Opciones de despliegue: integración con el framework `diarize` en Windows ARM64, o mediante ONNX Runtime directamente en aplicaciones C++/Python.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Hardware objetivo | Idiomas | Licencia |
|---|---|---|---|---|---|
| diarizeapp/parakeet-tdt-0.6b-v3-w8a16-qnn | 600M | W8A16 QDQ | Qualcomm Hexagon NPU | en | CC-BY-4.0 |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 600M | FP32 (sin cuantizar) | GPU/CPU | 25 idiomas europeos | CC-BY-4.0 |
| OpenAI Whisper small | 244M | FP32/INT8 | GPU/CPU | 96 idiomas | MIT (código) / modelo con licencia abierta |

La comparación muestra que esta versión cuantizada sacrifica el soporte multilingüe y la portabilidad a cambio de una ejecución extremadamente eficiente en hardware Qualcomm específico. Whisper small es más ligero y multilingüe, pero no está optimizado para NPU Hexagon y su precisión en inglés puede ser inferior a la de Parakeet en algunos benchmarks.

## Limitaciones y advertencias

- El modelo está limitado al idioma inglés; no es adecuado para transcripción en otros idiomas, a diferencia del modelo original de NVIDIA.
- Requiere hardware Qualcomm Snapdragon X Elite con Hexagon NPU; no funcionará en GPUs convencionales ni en CPUs sin el soporte de ONNX Runtime QNN.
- La cuantización W8A16 puede introducir una degradación leve en la precisión frente al modelo en FP32, aunque no se han publicado métricas comparativas.
- El decodificador conjunto debe ejecutarse en CPU, lo que puede convertirse en un cuello de botella en escenarios de alta concurrencia.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución adecuada al autor original (NVIDIA) y a la conversión de `diarize`.
- No se proporcionan garantías de rendimiento en otros dispositivos Qualcomm distintos del Snapdragon X Elite; la compatibilidad con generaciones anteriores de Hexagon no está confirmada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/diarizeapp/parakeet-tdt-0.6b-v3-w8a16-qnn
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Demo interactiva del modelo original: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v3
