# hencohen83/sherpa-onnx-qnn-android

## Resumen

`hencohen83/sherpa-onnx-qnn-android` no es un modelo de IA en el sentido estricto, sino un artefacto de distribución: la librería Android (AAR) de sherpa-onnx v2.0.1 compilada con soporte para el backend QNN (Qualcomm Neural Network) sobre la NPU Hexagon de los SoC Qualcomm. El repositorio lo publica el usuario hencohen83 y contiene dos ficheros: el AAR de 49.268.898 bytes y un parche (`sherpa-onnx-v2.0.1-qnn.patch`, 76.548 bytes) que se aplica sobre la etiqueta v2.0.1 del proyecto upstream k2-fsa/sherpa-onnx.

El propósito es habilitar la inferencia acelerada por NPU en Android para las tareas que cubre sherpa-onnx: reconocimiento de voz (Whisper turbo y large-v1 a v3), extracción de embeddings de hablante y segmentación/diarización con pyannote. El parche añade el `qnnConfig` en Kotlin y en la capa JNI, gestiona las cachés del decodificador de Whisper, permite longitudes variables en los embeddings de hablante mediante binarios de contexto de longitud fija, y convierte los errores de QNN en excepciones Java en lugar de abortar la aplicación.

Es relevante para desarrolladores que despliegan ASR y diarización en dispositivos Android con hardware Qualcomm (SM8350 o superior), ya que evita escribir las capas de integración con QNN y ofrece un binario reproducible con hash SHA-256 verificado. No incluye las librerías de runtime de Qualcomm, que deben aportarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de librería; backend QNN/HTP sobre ONNX Runtime) |
| Parametros totales | no disponible (no es un modelo de pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo ONNX cargado: Whisper turbo, large-v1–v3, embeddings de hablante, pyannote) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sherpa-onnx y parche); ONNX Runtime MIT |
| Formato de pesos | AAR (Android Archive) con `libsherpa-onnx-jni.so` para arm64-v8a; modelos en formato ONNX (no incluidos) |

## Arquitectura y entrenamiento

No aplica entrenamiento: el repositorio distribuye código compilado. El AAR contiene `libsherpa-onnx-jni.so` para arm64-v8a, compilado a partir de sherpa-onnx v2.0.1 más el parche, enlazado contra las cabeceras de QAIRT 2.40.0.251030 con el backend QNN activado. Para las demás ABI se incluyen las librerías del release oficial v2.0.1 sin modificar, y se empaqueta `libonnxruntime.so` (MIT) tal como lo distribuye sherpa-onnx.

El parche introduce cuatro bloques funcionales: soporte de Whisper en NPU (configuración `qnnConfig` en Kotlin y JNI, upstream #4126, tipos de modelo turbo y large-v1–v3, tokens de tarea, cachés del decodificador escritas una sola vez o in situ); embeddings de hablante en NPU mediante `SpeakerEmbeddingExtractorConfig.qnnConfig`, que acepta binarios de contexto de longitud fija y cubre cualquier longitud con ellos, integrado también en la diarización; segmentación pyannote aislada ventana a ventana mediante `SpeakerSegmentation`, ejecutable en CPU o NPU; y gestión de errores, con excepciones Java en lugar de terminación del proceso y log de QNN redirigido a logcat con la etiqueta `sherpa-onnx-qnn`.

## Capacidades

- Reconocimiento de voz (ASR) con Whisper turbo y Whisper large-v1, v2 y v3 sobre la NPU Hexagon vía backend QNN/HTP.
- Extracción de embeddings de hablante en NPU con soporte de contextos de longitud fija y cobertura de audio de cualquier duración.
- Diarización de hablantes, que reutiliza el extractor de embeddings acelerado.
- Segmentación con pyannote ejecutable ventana a ventana, en CPU o NPU.
- Integración nativa en aplicaciones Android mediante AAR y API Kotlin/JNI.
- Propagación de errores QNN como excepciones Java y logging a logcat (etiqueta `sherpa-onnx-qnn`).
- No cubre generación de texto, razonamiento, código, matemáticas, visión ni tool calling: es una librería de audio.

## Casos de uso

- Transcripción de voz en tiempo real en apps Android: el AAR permite ejecutar Whisper turbo sobre la NPU de un SoC Qualcomm, liberando la CPU y reduciendo el consumo energético en grabaciones largas.
- Subtitulado offline de reuniones y notas de voz: Whisper large-v1–v3 en NPU con cachés de decodificador gestionadas in situ, adecuado para procesar audio sin conexión en el dispositivo.
- Identificación de hablantes en llamadas o grabaciones: el extractor de embeddings con `qnnConfig` genera vectores de hablante acelerados para verificación biométrica o agrupación.
- Diarización de reuniones multiparticipante: combinación de segmentación pyannote ventana a ventana y embeddings de hablante en NPU para etiquetar quién habla en cada tramo.
- Aplicaciones de accesibilidad: transcripción continua en segundo plano con bajo impacto en la batería al delegar la inferencia en la NPU.
- Integración en apps Kotlin Multiplatform: el proyecto Transcriptor (chencohensolutions/transcriptor-kmp) es el consumidor de referencia del parche, lo que sirve como ejemplo de integración en producción.
- Procesamiento por lotes en dispositivos rugged o industriales con Qualcomm: transcripción y diarización local sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo con SoC Qualcomm SM8350 o superior (SM8450, SM8475, SM8550, SM8650, SM8750, SM8850, según la documentación de sherpa-onnx).
- Runtime obligatorio en el dispositivo: `libQnnHtp.so`, `libQnnSystem.so` y los binarios Stub y Skel del chip, procedentes de QAIRT 2.40.0.251030 (sherpa-onnx los publica como `qnn-libs-2.40.0.251030`). No están incluidos en el AAR.
- ABI principal con soporte QNN: arm64-v8a. El resto de ABI usa las librerías oficiales v2.0.1 sin backend QNN.
- VRAM: no aplica; el consumo depende de los modelos ONNX cargados y de la memoria compartida del SoC.
- GPU de escritorio: no aplica, es un artefacto exclusivamente Android/ARM.
- Despliegue: integración del AAR en una app Android; no se contemplan vLLM, llama.cpp, Ollama ni TGI por tratarse de una librería de audio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Criterio | sherpa-onnx-qnn-android (este repo) | sherpa-onnx v2.0.1 oficial (AAR) | whisper.cpp Android | ONNX Runtime Mobile con QNN EP |
|---|---|---|---|---|
| Tipo | AAR con parche QNN | AAR oficial | Librería C/C++ con bindings | Runtime genérico |
| Aceleración NPU Qualcomm | Sí (HTP vía QNN) | No por defecto | No | Sí (execution provider QNN) |
| Whisper en NPU | Sí (turbo, large-v1–v3) | No | No | Depende del modelo exportado |
| Embeddings de hablante en NPU | Sí | No | No | No específico |
| Diarización pyannote | Sí (segmentación ventana a ventana) | Parcial en CPU | No | No |
| Licencia | Apache-2.0 (+ MIT ORT) | Apache-2.0 | MIT | MIT |
| Runtime Qualcomm incluido | No | No | No | No |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni puede usarse para inferencia de texto, código o visión. Cualquier expectativa en ese sentido es un error de interpretación.
- Requiere copiar manualmente las librerías de QAIRT 2.40.0.251030 al dispositivo; sin ellas la ruta NPU no funciona.
- Solo arm64-v8a tiene el backend QNN compilado; otras ABI caen en las librerías oficiales sin aceleración.
- Dependencia de una versión concreta de QAIRT: actualizar el runtime de Qualcomm puede romper la compatibilidad binaria.
- El repositorio tiene 0 descargas y 0 likes, con tamaño de 0.0 GB reportado por la plataforma pese a que el AAR pesa ~49 MB; conviene verificar los hashes SHA-256 publicados antes de usarlo en producción.
- Riesgo de alucinación: aplica a los modelos Whisper subyacentes (inserciones o transcripciones inventadas en audio ruidoso), no al artefacto en sí.
- Sesgos: heredados de los modelos ONNX que se carguen (Whisper, pyannote), no evaluados en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero el parche y el AAR no incluyen garantías; el runtime de Qualcomm se rige por sus propios términos.
- No hay benchmarks publicados que permitan estimar la ganancia real de latencia frente a la ejecución en CPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hencohen83/sherpa-onnx-qnn-android
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Documentación QNN/HTP de sherpa: https://k2-fsa.github.io/sherpa/onnx/qnn/index.html
- Documentación Android de sherpa: https://k2-fsa.github.io/sherpa/onnx/android/index.html
- Proyecto consumidor del parche (Transcriptor KMP): https://github.com/chencohensolutions/transcriptor-kmp
- Pull request upstream citado: #4126 en k2-fsa/sherpa-onnx
