# pantinor/gigaam-v3

## Resumen

GigaAM v3 es un modelo de reconocimiento automatico del habla (ASR) para ruso desarrollado originalmente por Sber (Salute Developers) bajo licencia MIT. Esta ficha corresponde a un mirror publicado por el usuario `pantinor` que redistribuye el modelo en formato sherpa-onnx, con el encoder cuantizado a int8, pensado para inferencia en dispositivo (on-device) dentro del proyecto Anti-Vocale. No se trata de un modelo nuevo ni de un fine-tuning, sino de una exportacion del modelo base GigaAM v3 a un formato de runtime concreto.

El modelo emplea una arquitectura de transductor RNNT (Recurrent Neural Network Transducer) end-to-end, exportada al formato `nemo_transducer` de sherpa-onnx. Se ejecuta mediante `OfflineRecognizer` a 16 kHz con busqueda greedy y dispone de un vocabulario de 1024 tokens con puntuacion y capitalizacion nativas, lo que evita pasos de post-procesado para restaurar mayusculas y signos.

Su relevancia es practica: ofrece ASR en ruso con un encoder int8 de aproximadamente 304 MB, lo que permite desplegarlo en entornos con recursos limitados (moviles, Raspberry Pi, navegador via WASM) sin depender de infraestructura GPU. El repositorio completo ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor RNNT end-to-end (encoder, decoder, joint) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio gestionada por el runtime sherpa-onnx) |
| Tipos de cuantizacion | int8 (encoder); decoder y joint sin especificar |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder int8, decoder, joint) + tokens.txt |

## Arquitectura y entrenamiento

La arquitectura es un transductor RNNT, un esquema end-to-end que combina un encoder acustico, un predictor (decoder) y una red conjunta (joint) que produce la distribucion sobre tokens en cada paso. El modelo se distribuye en tres ficheros ONNX separados mas el vocabulario `tokens.txt` de 1024 tokens, con puntuacion y capitalizacion nativas integradas en el vocabulario. La decodificacion en sherpa-onnx se realiza con busqueda greedy sobre `OfflineRecognizer` a una frecuencia de muestreo de 16 kHz.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion. La model card del mirror unicamente indica que el modelo base es GigaAM v3 de Sber y que los ficheros proceden de la release `model-gigaam-v3` del proyecto govorun-lite, con bytes identicos a esa publicacion. La innovacion tecnica destacable de esta distribucion es la cuantizacion int8 del encoder, que reduce el peso a unos 304 MB manteniendo el pipeline completo en ONNX para ejecucion sin GPU.

## Capacidades

- Reconocimiento automatico del habla en ruso, con salida de transcripcion a partir de audio a 16 kHz.
- Puntuacion y capitalizacion nativas: el vocabulario de 1024 tokens incluye signos de puntuacion y mayusculas, por lo que no requiere un modelo de restauracion posterior.
- Inferencia on-device mediante sherpa-onnx, sin dependencia de GPU ni de servicios en la nube.
- Decodificacion greedy sobre `OfflineRecognizer`, adecuada para procesamiento por lotes de ficheros de audio.
- Ejecucion en entornos con recursos limitados gracias al encoder int8 de aproximadamente 304 MB.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma, tool calling ni agentes; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el encoder int8 de ~304 MB y el runtime sherpa-onnx permiten ejecutar el reconocimiento en el propio dispositivo, sin enviar audio a un servidor, lo que reduce latencia y preserva la privacidad.
- Subtitulado de reuniones y videollamadas en ruso: el modelo procesa audio a 16 kHz y devuelve texto con puntuacion y mayusculas, lo que simplifica la generacion de subtitulos listos para publicar.
- Asistentes de voz embebidos en dispositivos tipo Raspberry Pi: la ausencia de requisitos de GPU y el tamano contenido del repositorio (0,3 GB) hacen viable el despliegue en hardware de bajo consumo.
- Indexacion y busqueda de archivos de audio: la transcripcion por lotes con `OfflineRecognizer` permite convertir archivos de audio en texto indexable para busqueda posterior.
- Accesibilidad para personas con discapacidad auditiva en contenidos en ruso: la transcripcion on-device posibilita generar subtitulos en tiempo real en aplicaciones de escritorio o moviles.
- Procesamiento por lotes en pipelines de datos: la decodificacion greedy y el formato ONNX facilitan integrar el modelo en flujos automatizados de transcripcion masiva sin infraestructura GPU.
- Aplicaciones web mediante WASM: sherpa-onnx dispone de bindings para navegador, lo que permite ofrecer transcripcion en ruso directamente en el cliente sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base, ya que el modelo esta pensado para ejecucion en CPU mediante sherpa-onnx.
- Encoder int8 de aproximadamente 304 MB; el repositorio completo ocupa 0,3 GB, por lo que la huella en disco y en memoria es reducida.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. En caso de ejecutarse sobre GPU, seria necesario un backend compatible con ONNX Runtime, no documentado en la model card.
- Cabe en GPU de consumo: si, aunque su objetivo es la inferencia en CPU; no se detallan modelos concretos.
- Opciones de despliegue: sherpa-onnx (`OfflineRecognizer`), con soporte de ejecucion en servidor, movil, escritorio y navegador segun los bindings disponibles del runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GigaAM v3 (este mirror, int8) | no disponible | no disponible | ru | MIT | ONNX (sherpa-onnx) |
| Whisper (OpenAI) | no disponible en la informacion proporcionada | no disponible | multilingue | MIT | safetensors, GGUF, ONNX |
| Vosk | no disponible en la informacion proporcionada | no disponible | multilingue | Apache 2.0 | modelos propios |
| Wav2Vec 2.0 (Meta) | no disponible en la informacion proporcionada | no disponible | multilingue (fine-tuning por idioma) | MIT | PyTorch, safetensors |

La comparacion se limita a datos de licencia y formato, ya que no se dispone de especificaciones detalladas ni de resultados de benchmarks de los modelos alternativos en la informacion proporcionada. La diferencia principal de este mirror frente a alternativas genericas es su especializacion en ruso, su empaquetado ONNX int8 y su integracion directa con sherpa-onnx para inferencia on-device.

## Limitaciones y advertencias

- El modelo solo soporta ruso; no se documenta capacidad multilingue ni deteccion automatica de idioma.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni comportamiento en dominios acusticos adversos (ruido, acentos regionales, audio telefónico).
- Al ser un mirror y no la publicacion oficial, la trazabilidad depende de los hashes SHA-256 incluidos; conviene verificar los ficheros antes de desplegarlos en produccion.
- La licencia MIT del modelo base permite uso comercial, pero el mirror no documenta condiciones adicionales del proyecto govorun-lite ni de Anti-Vocale; se recomienda revisar las licencias de esos proyectos antes de redistribuir.
- El rendimiento en cuanto a latencia y throughput no esta documentado, por lo que es necesario medirlo en el hardware objetivo.
- La cuantizacion int8 del encoder puede introducir una perdida de precision respecto al modelo en punto flotante; no se han publicado metricas comparativas.
- El repositorio no registra descargas ni likes, lo que limita la evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pantinor/gigaam-v3
- Modelo base GigaAM v3 (Sber / Salute Developers): https://github.com/salute-developers/GigaAM
- Licencia del modelo base: https://github.com/salute-developers/GigaAM/blob/main/LICENSE
- Release de origen de los ficheros (govorun-lite): https://github.com/amidexe/govorun-lite/releases/tag/model-gigaam-v3
- Proyecto Anti-Vocale: https://github.com/RisorseArtificiali/anti-vocale
