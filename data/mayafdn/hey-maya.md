# MayaFdn/hey-maya

## Resumen

Hey Maya es un modelo de detección de palabra de activación (wake word) diseñado para iniciar el asistente Maya de la Maya Foundation en el teléfono del usuario, únicamente cuando este ha activado el ajuste "Hey Maya" (desactivado por defecto). No es un modelo de lenguaje generativo: es un clasificador de audio en streaming que procesa fotogramas de 30 ms y decide si acaba de escuchar la frase "Hey Maya". Todo el procesado ocurre en el dispositivo, sin que el audio salga del teléfono.

Técnicamente se trata de una red del tipo "mixednet" entrenada con el framework microWakeWord de Kevin Ahrendt y exportada a TensorFlow Lite con cuantización int8 y estado interno persistente. El artefacto final ocupa solo 62.304 bytes, lo que lo hace apto para microcontroladores y móviles de gama baja. La entrada es `[1, 3, 40]` int8 (tres fotogramas de 40 valores, es decir, 30 ms por llamada) y la salida es `[1, 1]` uint8 con escala 1/256.

Su relevancia actual es doble: por un lado, demuestra que un wake word personalizado puede entrenarse con datos sintéticos y desplegarse en un fichero de 60 KB; por otro, la propia model card advierte de que el modelo **nunca ha escuchado una voz real**, de modo que sus métricas proceden íntegramente de audio sintético y están pendientes de validación en teléfonos reales antes del lanzamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mixednet de microWakeWord (CNN con MixConv y conexiones residuales, streaming con estado interno) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de decisión de 5 salidas consecutivas (150 ms) |
| Tipos de cuantización | int8 (export `stream_state_internal_quant` de microWakeWord) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`hey_maya-v1.tflite`, 62.304 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura "mixednet" de microWakeWord, configurada con `--pointwise_filters 64,64,64,64`, `--repeat_in_block 1,1,1,1`, `--mixconv_kernel_sizes '[5], [7,11], [9,15], [23]'`, `--residual_connection 0,0,0,0`, `--first_conv_filters 32` y `--first_conv_kernel_size 5 --stride 3`. Se entrenó durante 20.000 pasos el 2026-10-21 en una única GPU alquilada, usando microWakeWord en el commit `4665173cd35f1cff9a61e06fc427f124766c488e`, y después se cuantizó a int8 para producir el modelo TFLite en streaming.

El entrenamiento utilizó exclusivamente datos que la aplicación puede distribuir legalmente: muestras sintéticas de "Hey Maya" generadas con Piper (modelo de voz LibriTTS-R de 904 hablantes, CC BY 4.0); muestras de test de "Hey Maya" generadas con un motor distinto (Phonon-31m en inglés y sus 37 voces, Apache 2.0) para evitar reutilizar las voces de entrenamiento; falsos positivos cercanos ("hey mia", "hey mayor", "maya" sola, nombres de otros asistentes) generados también con Piper; habla ordinaria de LibriSpeech dev/test (CC BY 4.0), eliminando las locuciones cuyos transcriptos contienen Maya, Maia, Maja, Mayer o Mayas; ruido y música de MUSAN (CC BY 4.0, 80 % para entrenamiento y 20 % reservado para test); y reverberación de sala de OpenSLR 28 RIRS_NOISES (Apache 2.0).

La innovación técnica principal es el mantenimiento de estado entre llamadas mediante variables de recurso de TensorFlow Lite (`VAR_HANDLE`, `READ_VARIABLE`, `ASSIGN_VARIABLE`, `CALL_ONCE`), lo que permite un modelo de streaming que conserva su memoria y debe invocarse en orden, exactamente una vez cada 30 ms. La decisión final se toma promediando las últimas 5 salidas (150 ms, el valor por defecto de microWakeWord para esta prueba) y comparando la media con un umbral configurable.

## Capacidades

- Detección de la palabra de activación "Hey Maya" en audio mono de 16 kHz, con fotogramas de 40 valores generados por el front-end de audio de TensorFlow Lite Micro cada 10 ms.
- Funcionamiento en streaming con estado interno persistente entre llamadas, adecuado para ejecución continua en dispositivos con recursos limitados.
- Cuantización int8 que reduce el modelo a 62.304 bytes, permitiendo su despliegue en teléfonos y potencialmente en microcontroladores.
- Procesamiento completamente en el dispositivo: no requiere enviar audio a ningún servidor.
- Umbral de decisión ajustable (la model card documenta los umbrales 0,99, 0,98, 0,97 y 0,96 con sus respectivas tasas de fallo y falsos positivos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni otras capacidades propias de un modelo de lenguaje. Es exclusivamente un clasificador binario de keyword spotting.

## Casos de uso

- Activación del asistente Maya en el teléfono: el modelo escucha de forma continua y solo dispara el asistente cuando el usuario ha activado previamente el ajuste "Hey Maya"; al ejecutarse en local, la conversación no se expone a la red hasta que el asistente arranca.
- Integración en aplicaciones Android o iOS mediante TensorFlow Lite: el fichero TFLite de 62 KB se embebe en el binario de la app y se invoca cada 30 ms desde el hilo de audio, con un coste de cómputo mínimo.
- Wake word en dispositivos de bajo consumo: por su tamaño y su cuantización int8, es candidato para microcontroladores o DSPs que ejecutan TensorFlow Lite Micro, permitiendo asistentes con activación por voz sin hardware dedicado.
- Personalización de asistentes de terceros: el pipeline de microWakeWord y los parámetros de entrenamiento publicados (`training_parameters.yaml`) sirven de plantilla para entrenar wake words propios con datos sintéticos, útil para organizaciones que quieran una frase de activación específica.
- Sustitución de servicios de wake word en la nube: al no enviar audio fuera del dispositivo, encaja en productos con requisitos de privacidad estrictos (salud, menores, entornos corporativos) donde el audio no puede salir del terminal.
- Evaluación comparativa de detección de keywords: los ficheros `tflite_streaming_roc.txt` y `training_parameters.yaml` permiten reproducir la curva ROC y comparar configuraciones de umbral antes de integrar el modelo en una app real.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre audio sintético reservado (no sobre voces reales). "Fallos" indica la tasa de no activación ante "Hey Maya" en habla sintética de test; "activaciones por error" cuenta activaciones sobre habla y música sin "Hey Maya".

| Umbral | Fallos de "Hey Maya" | Activaciones por error (por hora) |
|---|---|---|
| 0,99 (elegido para la app) | 15,7 % | 1,18 |
| 0,98 | 13,9 % | 1,45 |
| 0,97 | 13,1 % | 1,80 |
| 0,96 | 12,8 % | 2,00 |

AUC global: 0,795.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual de GPU; el modelo ocupa 62.304 bytes en almacenamiento y un consumo de memoria en tiempo de ejecución del orden de kilobytes, no disponible con cifra exacta.
- GPU recomendadas: no aplica; está diseñado para CPU, DSP o microcontroladores mediante TensorFlow Lite / TensorFlow Lite Micro.
- Compatibilidad con GPU de consumo: irrelevante para su función; puede ejecutarse en cualquier teléfono moderno sin aceleración gráfica.
- Opciones de despliegue: intérprete de TensorFlow Lite (escritorio y móvil) y TensorFlow Lite Micro, siempre que soporte variables de recurso (`VAR_HANDLE`, `READ_VARIABLE`, `ASSIGN_VARIABLE`, `CALL_ONCE`).
- Latencia y throughput: la arquitectura exige una invocación cada 30 ms (33 llamadas por segundo); la latencia de decisión efectiva es de 150 ms al promediar 5 salidas. No se han publicado cifras de consumo energético ni de ciclos por invocación.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hey Maya (MayaFdn) | mixednet microWakeWord, TFLite int8 | 62.304 bytes | 30 ms por llamada, decisión sobre 150 ms | Apache 2.0 | Hugging Face (18 descargas) |
| microWakeWord (modelos de referencia de Kevin Ahrendt) | mixednet / CNN en streaming | no disponible | no disponible | Apache 2.0 | GitHub |
| Piper sample generator (como generador de datos, no detector) | TTS neuronal | no disponible | no aplica | MIT | GitHub |
| Phonon-31m (usado como fuente de test) | TTS neuronal | no disponible | no aplica | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros detectores de wake word comerciales o de referencia, por lo que la comparación se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- **Nunca ha escuchado una voz real**: todo el entrenamiento y toda la evaluación se hicieron con habla sintética (motores distintos para entrenamiento y test). La precisión sobre voces y salas reales está por medir en teléfonos antes del lanzamiento y diferirá de la tabla publicada.
- Tasa de fallos elevada en el umbral elegido para la app: 15,7 % de no activación ante "Hey Maya" en el test sintético, con 1,18 activaciones erróneas por hora.
- Confusión esperada con nombres homófonos: "Maia" y "Maja" suenan igual que "Maya" y se excluyeron deliberadamente de los falsos positivos cercanos, por lo que se espera que active con ellos.
- Solo inglés y solo la frase "hey maya"; no detecta otras frases ni otros idiomas.
- No identifica al hablante: no sirve para verificar quién habla.
- Requiere un intérprete de TensorFlow Lite con soporte de variables de recurso y llamadas estrictamente ordenadas cada 30 ms; un uso incorrecto del estado invalida las detecciones.
- Licencia del modelo Apache 2.0, pero los datos de entrenamiento conservan sus propias licencias (LibriTTS-R y LibriSpeech CC BY 4.0, MUSAN CC BY 4.0, RIRS_NOISES Apache 2.0, Phonon-31m Apache 2.0, Piper MIT), que deben respetarse en cualquier redistribución.
- La versión 2 está prevista con grabaciones reales compartidas voluntariamente por usuarios; la versión 1 no debe considerarse validada para producción en poblaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MayaFdn/hey-maya
- microWakeWord (framework de entrenamiento): https://github.com/kahrendt/microWakeWord
- Piper sample generator: https://github.com/rhasspy/piper-sample-generator
- LibriTTS-R (Koizumi et al., CC BY 4.0): no disponible (enlace no proporcionado en la información)
- LibriSpeech (Panayotov et al., CC BY 4.0): no disponible (enlace no proporcionado en la información)
- MUSAN (Snyder, Chen y Povey, CC BY 4.0): no disponible (enlace no proporcionado en la información)
- RIRS_NOISES (Ko et al., Apache 2.0): no disponible (enlace no proporcionado en la información)
- Phonon-31m (Apache 2.0): no disponible (enlace no proporcionado en la información)
