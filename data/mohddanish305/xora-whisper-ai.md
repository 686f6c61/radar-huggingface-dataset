# mohddanish305/xora-whisper-ai

## Resumen

Xora Whisper AI es un ajuste fino de `openai/whisper-tiny` (39 millones de parametros) desarrollado por Mohd Danish para el reconocimiento automatico de voz en hindi, hinglish e ingles, orientado a un asistente de comandos de voz que funciona de forma totalmente offline en telefonos moviles. El modelo se entrena sobre el subconjunto `hi_in` de FLEURS (2.120 muestras de entrenamiento y 239 de validacion) y alimenta a un clasificador de intenciones ligero, Tiny Intent v3, que reconoce 16 comandos cotidianos como llamadas, alarmas, temporizadores, clima o apertura de aplicaciones.

La relevancia del proyecto reside en su restriccion de diseno: el modelo completo en fp16 junto con el tokenizador ocupa 79,5 MB, por debajo del limite autoimpuesto de 100 MB para despliegue en dispositivo. El autor reporta una reduccion del WER en el conjunto de test completo de FLEURS Hindi del 261,7 % al 68,1 %, es decir, 193,5 puntos porcentuales de mejora respecto al modelo base, con una latencia media de 0,77 s por muestra frente a 1,09 s del original.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con un caveat importante: los pesos no estan subidos al repositorio de Hugging Face. La model card indica que los siete ficheros del modelo (incluido `model.safetensors` de 75,54 MB) siguen pendientes de subida desde la salida de Kaggle, por lo que el repositorio solo contiene la model card y la grafica de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-tiny de OpenAI) |
| Parametros totales | 39 millones (modelo base whisper-tiny) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmada en la informacion) |
| Tipos de cuantizacion | fp16 en safetensors; int8 para ONNX (encoder.int8.onnx, decoder.int8.onnx) segun la model card |
| Idiomas soportados | hindi (hi), ingles (en); uso previsto tambien con hinglish |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) y ONNX int8 para despliegue en dispositivo |
| Tamano del repositorio | 0,0 GB (pesos pendientes de subida) |
| Tamano del modelo | 79,5 MB (fp16 + tokenizador) |
| Modelo base | openai/whisper-tiny |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper-tiny de OpenAI, un transformer encoder-decoder con 39 millones de parametros disenado originalmente para transcripcion multilingue. El ajuste fino se realiza sobre el split `hi_in` de FLEURS, con 2.120 muestras de entrenamiento y 239 de validacion, durante 5 epocas (335 pasos), con learning rate de 1e-5, batch de 8 con acumulacion de gradientes de 2 y precision fp16. El entrenamiento se ejecuto en dos GPU T4 gratuitas de Kaggle y duro aproximadamente 32 minutos. El WER de validacion final fue del 67,30 % en el paso 335.

No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste fino supervisado convencional sobre datos de voz transcrita. Tampoco se detalla la composicion exacta del dataset mas alla del corpus FLEURS en hindi. La innovacion tecnica principal no esta en la arquitectura, sino en el pipeline de despliegue: conversion a ONNX con cuantizacion int8 para ejecucion offline mediante sherpa-onnx en Flutter, y la integracion con un clasificador de intenciones separado (Tiny Intent v3, con 96,2 % de precision en test) que interpreta la transcripcion y la traduce en comandos.

## Capacidades

- Transcripcion de voz a texto en hindi, hinglish e ingles mediante el pipeline `automatic-speech-recognition` de Transformers.
- Reconocimiento de comandos de voz cortos orientados a un asistente personal: llamadas, alarma, temporizador, clima y apertura de aplicaciones.
- Ejecucion offline en dispositivo mediante ONNX int8 y la libreria sherpa-onnx, sin dependencia de servicios en la nube.
- Integracion con un clasificador de intenciones ligero que mapea la transcripcion a 16 comandos predefinidos.
- Uso desde Python con `transformers.pipeline` y desde Flutter mediante el paquete `flutter_voice_intent` v0.2.0.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Asistente de voz offline en movil: el modelo transcribe comandos cortos en hindi o hinglish y los pasa a Tiny Intent v3 para ejecutar acciones como poner una alarma o abrir una aplicacion, sin enviar audio a ningun servidor.
- Aplicaciones Flutter con privacidad por diseno: al ejecutarse en dispositivo con ONNX int8, el audio del usuario nunca sale del telefono, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Prototipado rapido de interfaces de voz en hindi: con 79,5 MB y licencia MIT, sirve para validar flujos de voz en fase de prueba sin coste de infraestructura.
- Demos y proyectos academicos de ASR de bajo recursos: el notebook de entrenamiento en Kaggle permite reproducir el ajuste fino en hardware gratuito en unos 32 minutos.
- Control por voz en dispositivos con recursos limitados: el tamano reducido permite empaquetarlo en aplicaciones moviles o dispositivos embebidos con poca memoria.
- Transcripcion de comandos en contextos ruidosos o de habla rapida: aunque el WER en habla leida es alto (68,1 %), el autor indica que el rendimiento en comandos cortos es mejor que esa cifra sugiere.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de FLEURS Hindi (`hi_in`), medidos en Kaggle T4 x2 el 28 de noviembre de 2026:

| Prueba | whisper-tiny base | Xora Whisper AI | Mejora |
|---|---|---|---|
| WER, test completo (418 muestras) | 261,7 % | 68,1 % | 193,5 puntos |
| WER, primeras 100 muestras | 273,0 % | 64,7 % | 208,3 puntos |
| Latencia media | 1,09 s/muestra | 0,77 s/muestra | 29 % mas rapido |
| Tamano del modelo (fp16 + tokenizador) | ~75 MB | 79,5 MB | por debajo del limite de 100 MB |

El autor compara explicitamente con Whisper-small ajustado, que alcanza un 31,1 % de WER pero ocupa 926 MB y no cabe en el limite de 100 MB para dispositivo. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo es exclusivamente de reconocimiento de voz.

## Requisitos de hardware

- Inferencia en fp16: aproximadamente 150-200 MB de VRAM o memoria unificada, suficiente para cualquier GPU consumer.
- Inferencia en ONNX int8: disenado para ejecucion en CPU de telefonos moviles mediante sherpa-onnx, sin GPU dedicada.
- GPU recomendadas para reentrenamiento o evaluacion: T4 (usada por el autor en Kaggle), o cualquier GPU con al menos 8 GB para comodidad; el entrenamiento original cupo en dos T4.
- Cabe en GPU consumer: si, en cualquier RTX o incluso en CPU para el modelo cuantizado a int8.
- Opciones de despliegue: Transformers (Python), sherpa-onnx con los ficheros `encoder.int8.onnx`, `decoder.int8.onnx` y `tokens.txt`, y el paquete Flutter `flutter_voice_intent` v0.2.0. No se documenta soporte de vLLM ni TGI, habituales en modelos de lenguaje pero no aplicables a este ASR.
- Latencia: 0,77 s por muestra en T4 x2 segun el autor; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | WER FLEURS Hindi | Licencia | Cabe en <100 MB |
|---|---|---|---|---|---|
| Xora Whisper AI | 39 M | 79,5 MB (fp16) | 68,1 % | MIT | Si |
| whisper-tiny base | 39 M | ~75 MB | 261,7 % | MIT | Si |
| Whisper-small ajustado | 244 M | 926 MB | 31,1 % | MIT | No |

La comparativa se limita a los datos aportados por el autor. No se dispone de informacion sobre otros modelos ASR especificos para hindi con los que contrastar de forma independiente.

## Limitaciones y advertencias

- Los pesos del modelo no estan subidos al repositorio de Hugging Face; la model card indica que los siete ficheros estan pendientes de subida desde la salida de Kaggle, por lo que el modelo no es descargable ni usable en el momento de la consulta.
- El WER del 68,1 % en habla leida de FLEURS es elevado en terminos absolutos y esta muy por detras de Whisper-small ajustado (31,1 %); el autor lo presenta como un compromiso deliberado por el limite de 100 MB.
- El rendimiento empeora con habla larga, ruidosa o con acentos marcados, segun reconoce el autor.
- No hay ajuste de deteccion de idioma: debe forzarse `language="hi"` en la inferencia.
- El modelo esta pensado para comandos cortos, no para transcripcion general de audio.
- No se documentan evaluaciones de sesgo ni de robustez mas alla del benchmark de FLEURS.
- Riesgo de alucinacion en transcripciones: Whisper puede generar texto plausible cuando el audio es ambiguo o contiene silencio, algo especialmente relevante en un sistema que dispara comandos.
- La licencia MIT permite uso comercial sin restricciones, pero la ausencia de pesos publicados impide verificar el estado real del artefacto.
- El proyecto tiene cero descargas y cero likes, y depende de un unico autor; no hay senales de mantenimiento comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohddanish305/xora-whisper-ai
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Clasificador de intenciones Tiny Intent v3: https://huggingface.co/mohddanish305/tiny-intent-v3-onnx
- Paquete Flutter `flutter_voice_intent` v0.2.0: https://pub.dev/packages/flutter_voice_intent
- Repositorio del proyecto voice-command-ai: no disponible (la model card contiene un marcador `GITHUB_REPO_URL_HERE` sin resolver)
- Modelo ONNX para dispositivo: `mohddanish305/xora-whisper-ai-onnx` (referenciado en la model card, sin URL verificada)
- Notebook de entrenamiento: `training/train_whisper_tiny_kaggle.ipynb` en el repositorio del proyecto (no accesible por el marcador sin resolver)
- Notebook de conversion a ONNX: `training/convert_xora_to_onnx.ipynb` en el repositorio del proyecto (no accesible por el marcador sin resolver)
