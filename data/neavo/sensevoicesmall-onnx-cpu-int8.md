# neavo/SenseVoiceSmall-ONNX-CPU-INT8

## Resumen

SenseVoiceSmall-ONNX-CPU-INT8 es una réplica sin modificaciones del modelo ONNX oficial de SenseVoiceSmall publicado por Alibaba (FunAudioLLM / FunASR) en ModelScope, reempaquetado por el usuario neavo en Hugging Face. Se trata de un modelo de reconocimiento automático del habla (ASR) no autorregresivo basado en CTC, exportado a ONNX y cuantizado a INT8 mediante cuantización dinámica de activaciones y multiplicación matricial en INT8, con el objetivo de ejecutarse en CPU sin GPU dedicada.

El modelo original SenseVoiceSmall es un encoder transformer de aproximadamente 234 millones de parámetros que cubre cinco idiomas (chino mandarín, inglés, japonés, coreano y cantonés) y añade predicción de emoción y eventos acústicos además de la transcripción. Esta variante ONNX INT8 reduce el peso a unos 241 MB y está pensada para despliegues ligeros en entornos Node.js/Windows x64 mediante `onnxruntime-node`, lo que la hace relevante para integraciones de ASR en aplicaciones de escritorio o servicios con presupuesto de cómputo limitado.

El repositorio no introduce cambios en los pesos: es un espejo byte a byte del fichero `model_quant.onnx` de la revisión oficial `4e95991ddb34c70e9b94f026d62ac82a9d941ae1`. Su interés práctico reside en la disponibilidad del artefacto en Hugging Face con instrucciones de uso para ONNX Runtime en CPU, más que en una aportación técnica propia del autor del repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo con cabeza CTC (SenseVoiceSmall) |
| Parametros totales | no disponible (peso ONNX INT8 de 241.216.270 bytes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de frames con features fbank LFR m=7, n=6) |
| Tipos de cuantizacion | INT8 con cuantizacion dinamica de activaciones y matmul INT8 |
| Idiomas soportados | zh, en, ja, ko, yue (cantonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_quant.onnx`), tensor de entrada float32, salida CTC float32 |

## Arquitectura y entrenamiento

El modelo subyacente, SenseVoiceSmall, es un encoder transformer con decodificacion CTC no autorregresiva, diseñado para ASR de baja latencia. La variante aquí publicada es el grafo ONNX cuantizado del modelo oficial: consume características fbank de 16 kHz con 80 bins y aplicación de LFR (`m=7`, `n=6`), normalizadas con `am.mvn`, y produce logits CTC con forma `[batch, frames+4, 25055]`. El vocabulario de salida es de 25.055 entradas, incluidas cuatro posiciones de control que codifican el idioma y la normalización de texto.

Los tensores de entrada son `speech` (float32, `[batch, frames, 560]`), `speech_lengths` (int32), `language` (int32) y `textnorm` (int32). Los identificadores de idioma son: auto `0`, zh `3`, en `4`, yue `7`, ja `11`, ko `12`. Para la normalización de texto, `14` activa ITN y `15` la desactiva. La decodificacion se realiza por CTC usando `tokens.txt` y las longitudes válidas de salida (`encoder_out_lens`).

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo etapas de RLHF o DPO; estos datos corresponden al modelo original de Alibaba y no se reproducen en esta ficha. La innovación técnica de esta variante es exclusivamente la cuantización INT8 dinámica para CPU, que reduce el peso a 241 MB y permite inferencia sin GPU.

## Capacidades

- Reconocimiento automático del habla (ASR) en chino mandarín, inglés, japonés, coreano y cantonés.
- Detección automática de idioma mediante el identificador `0` o selección explícita por ID.
- Normalización de texto inversa (ITN) opcional: conversión de números y entidades habladas a formato escrito.
- Predicción de emoción y eventos acústicos heredada del modelo SenseVoiceSmall original (no expuesta explícitamente en la interfaz ONNX documentada).
- Decodificacion CTC por lotes (`batch` en todos los tensores).
- Ejecución en CPU mediante ONNX Runtime con optimizaciones de grafo por defecto.
- Integración en Node.js a través de `onnxruntime-node` / `onnxruntime-common` 1.30.0.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-a-texto.

## Casos de uso

- Transcripción de reuniones en aplicaciones de escritorio: el modelo procesa audio de 16 kHz con features fbank y devuelve texto por CTC, adecuado para integrarse en herramientas Electron o Node.js que necesiten ASR local sin GPU.
- Subtitulado en tiempo casi real de contenido en chino, inglés, japonés, coreano o cantonés: la naturaleza no autorregresiva del decoder CTC permite latencias bajas y ejecución en CPU, lo que facilita el despliegue en servidores sin aceleradores.
- Asistentes de voz multilingües en dispositivos de borde: con 241 MB de peso INT8 y ejecución en CPU, cabe en mini-PC o portátiles y permite reconocimiento de voz sin enviar audio a la nube.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de archivos de audio con selección de idioma explícita y normalización ITN para generar texto indexable.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones en cantonés o mandarín con normalización de números para extraer métricas y entidades.
- Pipelines de accesibilidad: generación de subtítulos para vídeos en entornos Windows x64 usando `onnxruntime-node` dentro de un Worker, liberando la sesión tras el uso.
- Prototipado rápido de ASR en entornos sin GPU: el formato ONNX y las instrucciones de sesión permiten validar flujos de reconocimiento de voz en CPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecución en CPU.
- Peso en disco: 241.216.270 bytes (aproximadamente 230 MiB) para `model_quant.onnx`.
- RAM estimada: no disponible; el tamaño del grafo INT8 sugiere un consumo moderado, pero no se documenta una cifra concreta.
- GPU recomendadas: no aplica; el execution provider configurado es `cpu`.
- Cabe en cualquier CPU x64 moderna; probado en Windows x64 con `onnxruntime-node` 1.30.0.
- Opciones de despliegue: ONNX Runtime (`onnxruntime-node`, `onnxruntime-common`) con `intraOpNumThreads` configurable (4 en el ejemplo del autor) e `interOpNumThreads` 1.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Recomendación del autor: crear y liberar sesiones dentro de un Node Worker y liberar tensores tras su uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SenseVoiceSmall-ONNX-CPU-INT8 (este) | no disponible (peso INT8 241 MB) | no disponible | zh, en, ja, ko, yue | Apache-2.0 | ONNX INT8 | Hugging Face, ModelScope (origen) |
| FunAudioLLM/SenseVoiceSmall (original) | no disponible | no disponible | zh, en, ja, ko, yue | Apache-2.0 | PyTorch / ONNX | Hugging Face, ModelScope |
| Whisper small (referencia de la misma categoría) | no disponible en esta informacion | no disponible | multilingüe | MIT (según modelo original) | PyTorch, GGUF, ONNX | Hugging Face |
| Whisper large-v3 (referencia de gama alta) | no disponible en esta informacion | no disponible | multilingüe | MIT (según modelo original) | PyTorch, GGUF, ONNX | Hugging Face |

Los datos de los modelos comparables no se han verificado en la informacion proporcionada; se indican únicamente como referencia de categoría.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no incorpora mejoras, correcciones ni ajustes propios del autor del repo.
- Solo cubre cinco idiomas (zh, en, ja, ko, yue); no soporta castellano ni otras lenguas no listadas.
- La salida CTC requiere decodificacion externa con `tokens.txt` y longitudes válidas; un uso incorrecto produce transcripciones truncadas o basura.
- El frontend de características debe ser exactamente el oficial: 16 kHz, 80 bins fbank, LFR `m=7, n=6` y normalización `am.mvn`; desviaciones degradan la precisión.
- Riesgo de alucinación en audio con ruido, música o habla solapada; no se documentan métricas de robustez en esta ficha.
- Sesgos lingüísticos y acústicos heredados del corpus de entrenamiento original de Alibaba, no documentados aquí.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución; el autor del repo remite al fichero `LICENSE` del repositorio de origen.
- No soporta tool calling ni razonamiento; no debe emplearse como modelo de lenguaje general.
- La cuantización INT8 puede introducir una ligera pérdida de precisión frente al modelo en float32; no se cuantifica esa pérdida en la informacion disponible.
- El soporte está probado en Windows x64 con `onnxruntime-node` 1.30.0; otros entornos no están verificados.

## Enlaces

- Hugging Face: https://huggingface.co/neavo/SenseVoiceSmall-ONNX-CPU-INT8
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Repositorio ONNX oficial en ModelScope: https://modelscope.cn/models/iic/SenseVoiceSmall-onnx
- Fichero de pesos de origen: https://modelscope.cn/models/iic/SenseVoiceSmall-onnx/resolve/4e95991ddb34c70e9b94f026d62ac82a9d941ae1/model_quant.onnx
- Repositorio FunASR: no disponible en la informacion proporcionada
- Paper de SenseVoice: no disponible en la informacion proporcionada
