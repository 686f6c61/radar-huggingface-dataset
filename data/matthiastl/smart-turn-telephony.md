# matthiastl/smart-turn-telephony

## Resumen

Smart Turn Telephony es un ajuste fino (fine-tune) del modelo Smart Turn v3.2 de Pipecat, desarrollado por el usuario independiente matthiastl. Su funcion es la deteccion de fin de turno (end-of-turn detection) en conversaciones de voz: escucha los ultimos 8 segundos de habla de una persona y estima la probabilidad de que haya terminado su intervencion. El problema que resuelve es la degradacion de precision que sufren los modelos de turn-detection cuando el audio pasa por codecs telefonicos de banda estrecha (G.711 mu-law a 8 kHz y GSM 06.10 full-rate).

El modelo parte de la arquitectura de Smart Turn v3.2 (un encoder Whisper-tiny recortado a 8 segundos, con attention pooling y un clasificador) y lo reentrena sobre lineas telefonicas simuladas. Con solo 8 millones de parametros y un fichero ONNX de 32 MB, es un componente ligero pensado para integrarse en pipelines de agentes de voz que operan sobre telefonia, donde el coste por llamada y la latencia importan.

Es relevante ahora porque la mayoria de los modelos de deteccion de turno se entrenan con audio de banda ancha y pierden puntos de precision en llamadas reales. Este fine-tune recupera parte de esa perdida: en el conjunto de test de Pipecat (31.527 clips) sube del 91,7 % al 93,1 % en linea fija simulada y del 90,5 % al 92,3 % en GSM, manteniendo el 93,7 % en banda ancha. Es un ajuste no oficial, no respaldado por Pipecat ni Daily.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-tiny recortado a 8 s, attention pooling y clasificador |
| Parametros totales | 8,0 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 s de audio (80 x 800 log-mel features) |
| Tipos de cuantizacion | float32 (ONNX); no hay version de 8 bits de este fine-tune |
| Idiomas soportados | no disponible (deteccion acustica de turno, independiente del idioma) |
| Licencia | BSD 2-Clause |
| Formato de pesos | ONNX (opset 18) y safetensors |

## Arquitectura y entrenamiento

La arquitectura replica la de Smart Turn v3.2: un encoder basado en Whisper-tiny truncado para procesar exactamente 8 segundos de audio, seguido de attention pooling y una cabeza clasificadora que emite un unico logit. La entrada son caracteristicas log-mel de Whisper con forma `[batch, 80, 800]`, calculadas a partir de audio a 16 kHz tal como las genera el `inference.py` de Pipecat. La salida es un tensor float32 `[batch, 1]` que, pese al nombre `logits`, representa la probabilidad de que el turno haya terminado.

El fine-tune se realizo sobre el dataset `pipecat-ai/smart-turn-data-v3.2-train` con audio degradado mediante simulacion de linea fija (8 kHz, 300-3400 Hz, G.711 mu-law) y codec GSM 06.10 full-rate. Un detalle relevante: el codec GSM no se uso en el entrenamiento, por lo que su resultado es la medida mas justa de generalizacion. El modelo base es `pipecat-ai/smart-turn-v3` en la revision `f766f81d3cfd`, fichero `smart-turn-v3.2-gpu.onnx`. El repositorio incluye los scripts de reconstruccion, fine-tuning y evaluacion, ademas del log de entrenamiento y los resultados.

## Capacidades

- Deteccion de fin de turno en conversaciones de voz: estima si el hablante ha terminado su intervencion.
- Clasificacion de audio binaria (turno completo / turno incompleto) con umbral ajustable (0,5 por defecto).
- Robustez ante codecs telefonicos de banda estrecha: G.711 mu-law y GSM 06.10 full-rate.
- Compatibilidad drop-in con `smart-turn-v3.2-gpu.onnx`: misma entrada, misma salida, mismo contrato.
- Ejecucion en CPU con ONNX Runtime: 19,7 ms por llamada de 8 s en un hilo de Apple M4 Max.
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso; es un clasificador acustico especializado.

## Casos de uso

- Agentes de voz sobre telefonia: sustituir `smart-turn-v3.2-gpu.onnx` por este fichero en el pipeline de Pipecat para reducir falsos positivos de fin de turno en llamadas de linea fija, donde la precision sube 1,4 puntos.
- Atencion al cliente con IVR conversacional: detectar cuando el usuario ha terminado de hablar antes de responder, con mejor comportamiento en llamadas GSM moviles (1,8 puntos de mejora), lo que evita interrumpir al cliente.
- Turnos en centros de llamadas con audio de banda estrecha: el modelo mantiene el rendimiento en banda ancha (93,7 %) y pierde solo 0,6 puntos en linea fija frente a los 2,0 del modelo base, lo que simplifica el mantenimiento de un unico modelo para todos los canales.
- Despliegue en edge o servidores sin GPU: al ser un ONNX de 32 MB y 8 M de parametros, cabe en cualquier CPU y se ejecuta en decenas de milisegundos, adecuado para contenedores ligeros en telefonia.
- Investigacion en turn-detection: el repositorio incluye scripts de reconstruccion y evaluacion, util para reproducir los resultados o continuar el entrenamiento desde los pesos safetensors.
- Prototipado de voice agents con presupuesto de latencia estricto: la latencia de 19,7 ms por ventana de 8 s permite integrarlo en bucles de tiempo real sin cuello de botella.
- Evaluacion comparativa de codecs: usar los resultados por condicion (banda ancha, linea fija, GSM) para decidir que codec desplegar segun la precision de turno requerida.

## Benchmarks y rendimiento

Resultados de fin de turno sobre los 31.527 clips de `pipecat-ai/smart-turn-data-v3.2-test`, umbral 0,5, precision con AUC entre parentesis:

| Modelo | Banda ancha | Linea fija | Movil (GSM) |
|---|---:|---:|---:|
| `smart-turn-v3.2-gpu.onnx` (Pipecat) | 93,71 % (0,9825) | 91,71 % (0,9724) | 90,48 % (0,9664) |
| `smart-turn-telephony.onnx` | 93,73 % (0,9826) | 93,12 % (0,9799) | 92,31 % (0,9760) |

Diferencias pareadas por clip (puntos, intervalo de confianza al 95 %):

| Comparacion | Banda ancha | Linea fija | Movil |
|---|---|---|---|
| Este modelo menos Smart Turn v3.2 | +0,03 (-0,13 a +0,17) | +1,41 (+1,18 a +1,65) | +1,83 (+1,58 a +2,07) |
| Solo en las 5.863 grabaciones reales | -0,24 (-0,56 a +0,09) | +0,82 (+0,26 a +1,35) | +0,85 (+0,32 a +1,38) |

Prueba indirecta sobre 28 llamadas reales (3,9 horas, CallHome English, 737 pausas de al menos 0,5 s):

| Metrica | Smart Turn v3.2 | Este fine-tune |
|---|---:|---:|
| AUC | 0,691 | 0,685 |
| Dice "terminado" cuando habla el otro | 37 % | 32 % |
| Dice "terminado" cuando sigue el mismo | 19 % | 17 % |

Velocidad: 19,7 ms por llamada de 8 s en un hilo de CPU de Apple M4 Max con ONNX Runtime 1.32, frente a 20,4 ms del fichero de Pipecat.

## Requisitos de hardware

- VRAM: no requiere GPU; el fichero ONNX float32 ocupa 32 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier hardware consumer: portatiles, mini-PC, contenedores de telefonia y dispositivos edge.
- Despliegue: ONNX Runtime (probado con 1.32); integrable en el pipeline de Pipecat sustituyendo el fichero `smart-turn-v3.2-gpu.onnx`. Para reentrenamiento, los pesos safetensors permiten reconstruir el modelo en PyTorch con `scripts/smartturn.py`.
- Latencia: 19,7 ms por ventana de 8 s en un hilo de CPU (M4 Max); throughput no disponible mas alla de esa medida.
- No hay version cuantizada a 8 bits de este fine-tune; la comparacion con el fichero CPU de 8 bits de Pipecat no se realizo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision linea fija | Precision GSM | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| `smart-turn-telephony` (este) | 8,0 M | 8 s, 16 kHz | 93,12 % | 92,31 % | BSD 2-Clause | ONNX + safetensors |
| `pipecat-ai/smart-turn-v3.2` | 8,0 M | 8 s, 16 kHz | 91,71 % | 90,48 % | BSD 2-Clause | ONNX (GPU y CPU 8 bits) |
| Otros modelos de turn-detection | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un fine-tune no oficial: no esta hecho ni respaldado por Pipecat ni por Daily.
- Las lineas telefonicas de la evaluacion son simuladas; el codec GSM no se uso en entrenamiento (medida mas justa), pero la linea fija cae dentro de la familia usada en entrenamiento y su mejora puede estar sobreestimada.
- La mayor parte del test es habla sintetica; en las 5.863 grabaciones reales la ganancia se reduce a +0,8 puntos en linea fija, +0,9 en GSM y -0,2 en banda ancha (dentro del ruido).
- En 28 llamadas reales la prueba indirecta no muestra cambio medible (AUC -0,006, intervalo -0,017 a +0,007); solo confirma que no se rompio nada en llamadas reales.
- La precision en banda ancha es identica, pero el 1,9 % de las respuestas de banda ancha cambian respecto al modelo base.
- Los intervalos de confianza tratan los clips como independientes; muchos comparten hablante o fuente, por lo que los intervalos reales son algo mas amplios.
- No hay version de 8 bits de este fine-tune; no se comparo con el fichero CPU de 8 bits de Pipecat.
- No se dispone de informacion sobre sesgos por idioma, acento o demografia; el modelo es un clasificador acustico y no genera texto, por lo que el riesgo de alucinacion se limita a clasificaciones erroneas de fin de turno.
- Licencia BSD 2-Clause: permite uso comercial con atribucion y conservacion del aviso de copyright; el repositorio incluye `LICENSE` y `NOTICE` con los cambios respecto al original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthiastl/smart-turn-telephony
- Modelo base Smart Turn v3.2: https://huggingface.co/pipecat-ai/smart-turn-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Repositorio de inferencia de Pipecat: https://github.com/pipecat-ai/smart-turn
