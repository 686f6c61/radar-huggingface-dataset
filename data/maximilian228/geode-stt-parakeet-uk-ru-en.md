# Maximilian228/Geode-STT-parakeet-uk-ru-en

## Resumen

Geode-STT-parakeet-uk-ru-en es un paquete de reconocimiento automatico del habla (ASR) en formato sherpa-onnx, derivado del modelo Parakeet TDT 0.6B v3 de NVIDIA y del fine-tune ucraniano de ihnatov-yuri. Lo publica el proyecto Geode para su uso dentro de la aplicacion Android Geode, que realiza transcripcion en el dispositivo y sin conexion. El modelo cubre tres idiomas: ucraniano, ruso e ingles.

Tecnicamente es un modelo transducer (RNN-T con decodificacion TDT, token-and-duration transducer) de aproximadamente 0.6 mil millones de parametros, convertido al grafo de Parakeet v3 de sherpa-onnx y cuantizado a int8 en los pesos de las capas MatMul, manteniendo convoluciones y LSTM en fp32. El repositorio ocupa 0.9 GB e incluye los tres componentes del transducer (encoder, decoder y joiner) junto con el vocabulario.

Su relevancia es practica: ofrece ASR multilingue uk/ru/en empaquetado para inferencia local en movil mediante sherpa-onnx, con errores medidos en FLEURS de 4.51 % (uk), 5.84 % (ru) y 4.95 % (en) de WER, y un RTF de 0.187 en un Snapdragon 720G. Es una opcion orientada a despliegue en dispositivos con recursos limitados mas que a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (RNN-T) con decodificacion TDT; encoder, decoder y joiner en grafo sherpa-onnx tipo `transducer` |
| Parametros totales | 0.6B (heredados del modelo base Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en pesos MatMul (QInt8); convoluciones y LSTM en fp32 |
| Idiomas soportados | ucraniano (uk), ruso (ru), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`, `tokens.txt`) |

## Arquitectura y entrenamiento

El modelo es un transducer neuronal (RNN-T) con decodificacion TDT, la misma familia arquitectonica que Parakeet TDT 0.6B v3 de NVIDIA. Consta de un encoder, un predictor (decoder) y una red joiner que combina ambas representaciones para emitir tokens y duraciones. La conversion a sherpa-onnx se realizo trasladando por valor los pesos del fine-tune al grafo de Parakeet v3 (herramienta `swap_weights.py`) y aplicando cuantizacion int8 solo a las matrices de las capas MatMul (herramienta `quant_int8.py`, modo `nemo-mm`).

El fine-tune parte de la revision `5c4bcfaca501587beaedfd23b72a678bf7194de1` del modelo ucraniano de ihnatov-yuri y lo extiende a ruso e ingles por el proyecto Geode. Los datos de ajuste citados son FLEURS (Google, CC-BY-4.0) y Common Voice 17.0 (Mozilla, CC0). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). Tampoco se documentan innovaciones adicionales mas alla de la propia decodificacion TDT y la cuantizacion selectiva.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ucraniano, ruso e ingles.
- Inferencia completamente local y sin conexion, disenada para ejecutarse en el dispositivo.
- Empaquetado para sherpa-onnx, con soporte de ejecucion en CPU mediante la CLI de sherpa-onnx.
- Modelo de tipo "fast" segun la propia model card, orientado a baja latencia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.
- No se documentan capacidades de diarizacion, marcas de tiempo por palabra ni deteccion de idioma automatica.

## Casos de uso

- Transcripcion offline en aplicaciones Android: el paquete esta pensado para la app Geode y se ejecuta con sherpa-onnx en el dispositivo; su RTF de 0.187 en un Snapdragon 720G permite transcribir audio en tiempo real sin conexion.
- Dictado por voz en movil: al ser un modelo "fast" con carga de 4.6 s y bajo coste de inferencia, es adecuado para introducir texto por voz en aplicaciones de notas o mensajeria en ucraniano, ruso o ingles.
- Subtitulado local de reuniones o grabaciones: la transcripcion en dispositivo evita enviar audio a servidores externos, lo que resulta util en entornos con requisitos de privacidad.
- Asistentes de voz embebidos: integrable en pipelines de sherpa-onnx para reconocimiento de comandos y consultas en los tres idiomas cubiertos.
- Procesamiento por lotes en CPU: la version int8 permite transcribir archivos de audio en servidores sin GPU, con un consumo de memoria de aproximadamente 1 GB (RSS pico medido de 1081 MB).
- Aplicaciones multilingues en Europa del Este: cubre la combinacion uk/ru/en, util para herramientas de accesibilidad, transcripcion de entrevistas o documentacion en contextos bilingues.

## Benchmarks y rendimiento

Resultados de error medidos por el autor (FLEURS test, texto normalizado sin mayusculas ni puntuacion; sherpa-onnx int8 en CPU, 30 enunciados por idioma):

| Idioma | Metrica | Error % (FLEURS) | Error % (Common Voice 17) |
|---|---|---|---|
| uk | WER | 4.51 | 7.81 |
| ru | WER | 5.84 | 3.42 |
| en | WER | 4.95 | 10.84 |

Comparacion con los paquetes que sustituye (misma prueba, int8 en CPU):

| Idioma | Este paquete (FLEURS) | Referencia (FLEURS) | Este paquete (CV17) | Referencia (CV17) |
|---|---|---|---|---|
| uk | 4.51 | Parakeet-UK 4.51 | 7.81 | Parakeet-UK 6.77; Parakeet v3 8.33 |
| ru | 5.84 | Parakeet v3 7.79 | 3.42 | Parakeet v3 4.18 |
| en | 4.95 | Parakeet v3 5.4 | 10.84 | Parakeet v3 12.85 |

Rendimiento en dispositivo (Redmi Note 9 Pro, Snapdragon 720G, sherpa-onnx v2.0.1 CLI, 4 hilos):

| Metrica | Valor |
|---|---|
| Tiempo de carga | 4.6 s |
| RTF (clip de 10 s) | 0.187 |
| RSS pico (VmHWM) | 1081 MB |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU. El consumo de memoria medido es de aproximadamente 1081 MB de RSS pico en un movil.
- GPU recomendadas: no se documentan; el paquete es para inferencia en CPU mediante sherpa-onnx.
- Cabe en hardware movil de gama media: probado en un Snapdragon 720G con 4 hilos.
- Opciones de despliegue: sherpa-onnx (CLI y libreria), con los ficheros ONNX int8 incluidos.
- Latencia y throughput: RTF de 0.187 (un clip de 10 s se procesa en aproximadamente 1.87 s) y carga de 4.6 s en el dispositivo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Geode-STT-parakeet-uk-ru-en | 0.6B | uk, ru, en | CC-BY-4.0 | ONNX (sherpa-onnx) | int8; WER FLEURS 4.51/5.84/4.95 |
| ihnatov-yuri/parakeet-tdt-0.6b-v3-uk | 0.6B | uk | CC-BY-4.0 | no disponible | Modelo base del fine-tune; WER FLEURS uk 4.51 |
| Parakeet TDT 0.6B v3 (NVIDIA) | 0.6B | multilingue (incluye ru, en) | CC-BY-4.0 | no disponible | Referencia de comparacion; WER FLEURS ru 7.79, en 5.4 |

## Limitaciones y advertencias

- Solo cubre tres idiomas (uk, ru, en); no se documenta deteccion automatica de idioma ni soporte de otros.
- El rendimiento fuera de dominio es irregular: en Common Voice 17 el WER de ingles sube al 10.84 % y el de ucraniano al 7.81 %, frente a valores de FLEURS mucho mas bajos.
- Las mediciones se basan en solo 30 enunciados por idioma y prueba, por lo que la variabilidad estadistica es alta (el autor senala que la diferencia en uk CV17 equivale a 2 palabras sobre 195).
- Riesgo de errores de transcripcion en audio con ruido, acentos no vistos o vocabulario especializado; no se documentan evaluaciones en esos escenarios.
- Licencia CC-BY-4.0: permite uso comercial con atribucion obligatoria a NVIDIA (Parakeet TDT 0.6B v3), a ihnatov-yuri (fine-tune ucraniano) y al proyecto Geode, y con mencion de FLEURS y Common Voice 17.0.
- El paquete esta optimizado para sherpa-onnx; no se garantiza su uso directo en otros runtimes sin conversion adicional.
- No se documentan sesgos especificos ni evaluaciones de robustez mas alla de los WER citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-parakeet-uk-ru-en
- Modelo base (fine-tune ucraniano): https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- Revision del modelo base: `5c4bcfaca501587beaedfd23b72a678bf7194de1`
- sherpa-onnx (libreria de inferencia): no disponible en la informacion proporcionada
- Parakeet TDT 0.6B v3 de NVIDIA: no disponible en la informacion proporcionada
- Dataset FLEURS (Google, CC-BY-4.0): no disponible en la informacion proporcionada
- Dataset Common Voice 17.0 (Mozilla, CC0): no disponible en la informacion proporcionada
