# Erog0291/stew-audio-0.1-asr-ig

# Stew audio 0.1 asr ig (Erog0291)

## Resumen

Stew audio 0.1 asr ig es un modelo de reconocimiento automatico del habla (ASR) publicado por el desarrollador Erog0291 en Hugging Face. Por las etiquetas del repositorio (`whisper`) y por su recuento de parametros (241.734.912, practicamente identico a los ~244 M de Whisper small), se trata de un ajuste fino de la familia Whisper de OpenAI, orientado a la transcripcion de igbo, como indica el sufijo `asr-ig` del identificador.

El modelo se distribuye en safetensors y ONNX, con un repositorio de 2,4 GB, lo que sugiere la presencia de los pesos en varios formatos y precisiones para facilitar la inferencia local. La demo asociada (Stew Audio 0.1) declara soporte para igbo, yoruba, hausa, pidgin nigeriano e ingles, con procesamiento integro en el navegador, lo que encaja con el uso de ONNX Runtime Web.

Su relevancia actual es la cobertura de lenguas nigerianas de bajos recursos, un ambito donde los modelos ASR genericos rinden peor que en ingles. No obstante, la ausencia de model card, licencia declarada y resultados de evaluacion limita seriamente su adopcion en produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (segun etiqueta `whisper` del repositorio) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (estandar de la arquitectura Whisper); longitud de contexto en tokens no disponible |
| Tipos de cuantizacion | No disponible (el repositorio incluye ONNX y safetensors; no se confirman variantes INT8/INT4) |
| Idiomas soportados | Igbo (por el sufijo `asr-ig`); la demo del Space declara igbo, yoruba, hausa, pidgin nigeriano e ingles, sin confirmacion en la model card |
| Licencia | No disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde al esquema clasico de Whisper: un encoder que procesa espectrogramas Mel en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con atencion cruzada entre ambos. El recuento de 241,7 M de parametros es consistente con la variante Whisper small (12 capas de encoder y 12 de decoder, ancho 768), aunque el autor no publica la configuracion exacta ni el checkpoint base empleado.

No hay informacion disponible sobre el corpus de entrenamiento: se desconoce el numero de horas de audio, la composicion del dataset, el uso de aumentacion de datos, la posible inicializacion desde un Whisper preentrenado multilingue y la existencia de fases de ajuste supervisado, RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atención lineal, destilacion) ni el proceso de exportacion a ONNX.

## Capacidades

- Transcripcion de voz a texto (ASR) en formato encoder-decoder con ventanas de 30 segundos.
- Cobertura declarada de igbo, yoruba, hausa, pidgin nigeriano e ingles en la demo publica; el identificador del modelo apunta a un enfoque principal en igbo.
- Inferencia en navegador mediante ONNX Runtime Web, segun la descripcion del Space asociado (procesamiento local, sin envio de audio a servidores).
- Soporte de audio grabado desde microfono o fichero subido en la demo.
- Generacion de transcripciones en texto plano; no se confirma la salida de marcas de tiempo por segmento o palabra.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, vision ni audio generativo: es un modelo puramente ASR.
- Modo `thinking`, traduccion automatica explicita o diarizacion de hablantes: no disponibles.

## Casos de uso

- Transcripcion de reuniones y entrevistas en igbo: el modelo puede convertir grabaciones de hasta 30 segundos por segmento en texto, con un pipeline de troceado previo que permite procesar audios largos encadenando ventanas.
- Subtitulado de contenido audiovisual nigeriano: integrado en un pipeline de extraccion de audio y segmentacion, genera subtitulos para videos en igbo o pidgin nigeriano, un nicho con poca oferta de ASR libre.
- Herramientas de accesibilidad para hablantes de lenguas nigerianas: dictado de notas y transcripcion de voz a texto en aplicaciones web, ejecutando el modelo ONNX en el propio navegador para evitar enviar audio sensible a terceros.
- Digitalizacion de archivos orales y patrimonio linguistico: transcripcion por lotes de grabaciones de campo, con revision humana posterior dada la ausencia de metricas publicadas de calidad.
- Asistentes conversacionales por voz en kioscos o servicios publicos: combinado con un LLM y un motor TTS, sirve como capa de entrada de voz para consultas en igbo.
- Preetiquetado para anotacion linguistica: generacion de transcripciones iniciales que reducen el trabajo manual de linguistas que construyen corpus en lenguas de bajos recursos.
- Prototipado rapido en el navegador: validacion de ideas de producto con inferencia local en ONNX sin infraestructura de GPU, adecuado para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de WER en Common Voice, FLEURS ni otros conjuntos para igbo, yoruba, hausa, pidgin nigeriano o ingles, ni comparaciones con el checkpoint base de Whisper.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,97 GB en FP32, 0,48 GB en FP16 y 0,24 GB en INT8, calculada a partir de los 241,7 M de parametros (sin contar activaciones ni buffers de audio).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente para FP16; tarjetas como RTX 3060, RTX 4090, A100 o H100 no se aprovecharian por si solas y requeririan procesamiento por lotes para amortizar el coste.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con varios GB de memoria compartida.
- CPU: la inferencia en CPU es viable por el tamano del modelo; el repositorio incluye ONNX, lo que permite ejecucion con ONNX Runtime sin GPU.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), Transformers con `WhisperForConditionalGeneration`, conversion a CTranslate2/faster-whisper, motores C++ basados en ggml como audio.cpp, y endpoints gestionados de Hugging Face.
- Latencia y throughput: no disponibles. No hay datos publicados de factor de tiempo real (RTF) ni de velocidad de decodificacion para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stew audio 0.1 asr ig | 241,7 M | 30 s por ventana | Igbo (principal), yoruba, hausa, pidgin nigeriano e ingles segun la demo | No disponible | Hugging Face, ONNX + safetensors |
| openai/whisper-small | ~244 M | 30 s por ventana | ~99 idiomas, incluido igbo con rendimiento limitado | MIT | Hugging Face, ampliamente soportado |
| openai/whisper-base | ~74 M | 30 s por ventana | ~99 idiomas | MIT | Hugging Face, menor precision pero mucho mas ligero |
| facebook/mms-1b-all | ~1.000 M | No disponible en la informacion recogida | Mas de 1.100 lenguas, con adaptadores por idioma incluido el igbo | CC-BY-NC 4.0 (uso no comercial) | Hugging Face |

La comparativa se limita a parametros, contexto, licencia y disponibilidad: no existen datos de WER publicados para este checkpoint que permitan contrastar calidad frente a Whisper small o MMS.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, evaluacion, limitaciones conocidas ni uso previsto.
- Licencia no declarada: no se puede asumir permiso de uso comercial; en ausencia de terminos explicitos, el uso en produccion es juridicamente arriesgado.
- Sin resultados de benchmarks: se desconoce la tasa de error real en igbo y en el resto de lenguas que anuncia la demo, por lo que cualquier despliegue requiere una evaluacion propia con audio representativo.
- Riesgo de alucinacion tipico de Whisper: en segmentos silenciosos, ruidosos o con musica, el decoder puede generar texto inventado o repetir frases; es necesario aplicar umbrales de confianza y deteccion de voz (VAD).
- Ventana de 30 segundos: los audios largos deben segmentarse, lo que puede cortar palabras en las fronteras y degradar la transcripcion si el troceado no respeta pausas.
- Idiomas de bajos recursos: el igbo tiene menos datos publicos que el ingles, por lo que es esperable un rendimiento inferior y mayor sensibilidad a acentos, dialectos y code-switching con pidgin.
- Sin diarizacion ni marcas de tiempo confirmadas: no apto por si solo para actas de reunion con multiples hablantes.
- Proyecto con muy poca traccion (47 descargas, 0 likes) y actualizado en dos dias consecutivos: no hay historial de mantenimiento ni comunidad que garantice correcciones.
- El pipeline no esta declarado en Hugging Face, por lo que la carga automatica con `pipeline("automatic-speech-recognition")` puede no funcionar sin especificar la arquitectura manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Erog0291/stew-audio-0.1-asr-ig
- Repositorio base del autor: https://huggingface.co/Erog0291/stew-audio-0.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Erog0291/stew-audio-0.1
- audio.cpp, motor de inferencia C++ para modelos de audio: https://github.com/0xShug0/audio.cpp
- audio-ai-hub, recopilatorio de papers y modelos de audio: https://github.com/BinWang28/audio-ai-hub
- Guia de herramientas y modelos ASR: https://llmapi.ai/top-free-speech-to-text-tools-apis-and-open-source-models/
