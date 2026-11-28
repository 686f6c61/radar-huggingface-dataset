# Shroomy/tinydistill-massive-da-multilingual

## Resumen

tinydistill-massive-da-multilingual es un clasificador de texto pequeno obtenido por destilacion de conocimiento (knowledge distillation) a partir de un modelo docente de gran tamano, `google/gemma-4-12B-it`, hacia un modelo estudiante compacto, `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Lo desarrolla el usuario Shroomy y se distribuye bajo licencia CC-BY-4.0. El modelo resuelve una tarea concreta: la clasificacion de intenciones (intent classification) en 60 clases del dataset MASSIVE, orientado a asistentes de voz y comandos de lenguaje natural.

La relevancia practica del modelo esta en su eficiencia: parte de un transformer BERT-like de tipo MiniLM (12 capas) y se exporta a ONNX, lo que permite inferencia en CPU con latencias de 2,0 ms por texto en batch 1 con cuantizacion int8 y un throughput de 763 textos por segundo. El tamano del fichero ONNX int8 es de 24 MB, frente a los 23,9 GB del docente, lo que lo hace desplegable en entornos con recursos muy limitados.

El modelo mantiene una precision cercana a la del docente (0,815 frente a 0,808 en exactitud sobre el conjunto de test) con una huella de memoria tres ordenes de magnitud menor, lo que lo convierte en una opcion realista para clasificacion de intenciones en produccion sobre hardware convencional. No se especifican los idiomas soportados en la informacion disponible, aunque el modelo base es multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-like (MiniLM-L12, 12 capas), destilado y exportado a ONNX |
| Parametros totales | no disponible (modelo base: paraphrase-multilingual-MiniLM-L12-v2, ~118 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (tambien pesos PyTorch) |
| Idiomas soportados | no disponible (modelo base multilingue) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (fp32 e int8) y PyTorch |
| Etiquetas | 60 clases de intencion (MASSIVE) |
| Tamano del repo | 0,5 GB |
| Tamano del modelo | 96 MB (fp32 ONNX), 24 MB (int8 ONNX), 95 MB (PyTorch) |
| Libreria | onnx |

## Arquitectura y entrenamiento

El estudiante es `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un transformer BERT-like de 12 capas y tamano MiniLM, adaptado como clasificador de 60 clases. El docente es `google/gemma-4-12B-it`, un modelo de 12 mil millones de parametros. La destilacion se realizo con la herramienta [tinydistill](https://github.com/Andreas-Hum/tinydistill): el estudiante aprende de las etiquetas suaves (soft labels) del docente sobre los 11.514 textos de entrenamiento, combinadas con entropia cruzada sobre 476 textos etiquetados de oro (8 por clase, peso 1,0).

El docente genera sus predicciones mediante un prompt que muestra a cada texto los 16 ejemplos de entrenamiento mas similares de entre 476 etiquetados, y sus probabilidades se promedian con las de una sonda lineal (linear probe) ajustada sobre sus estados ocultos. El dataset de entrenamiento y evaluacion es `mteb/amazon_massive_intent`, tarea `massive-da` (danes), con 2.974 textos de test etiquetados de oro. Los resultados con ± corresponden a la media y desviacion tipica sobre 3 semillas de entrenamiento; las filas ONNX corresponden al modelo exportado de la primera semilla.

## Capacidades

- Clasificacion de texto en 60 clases de intencion del dataset MASSIVE (alarmas, audio, calendario, cocina, datetime, email, IoT, listas, musica, noticias, reproduccion multimedia, QA, recomendaciones, redes sociales, comida a domicilio, transporte, clima, entre otras).
- Inferencia rapida en CPU gracias a la exportacion ONNX int8 (2,0 ms por texto en batch 1).
- Capacidad multilingue heredada del modelo base MiniLM multilingue (no confirmada explicitamente para las 60 clases en la informacion disponible).
- Soporte de despliegue via `tinydistill` (comando `predict` y `serve`) y compatible con text-embeddings-inference y endpoints.
- No soporta generacion de texto, razonamiento abierto, codigo ni tool calling: es un clasificador discriminativo.
- Patron de cascada: el estudiante responde todos los textos y deriva al docente los de menor confianza (umbral configurable), con precision de hasta 0,820 al derivar el 20%.

## Casos de uso

- Clasificacion de intenciones en asistentes de voz: el modelo asigna cada transcripcion a una de las 60 intenciones (por ejemplo `alarm_set`, `weather_query`, `play_music`), lo que permite enrutar la peticion al servicio adecuado con latencias de milisegundos en CPU.
- Enrutamiento de comandos en dispositivos IoT: con 24 MB en int8, cabe en dispositivos de borde y clasifica comandos como `iot_hue_lighton` o `iot_wemo_off` sin necesidad de GPU ni conexion a la nube.
- Preprocesado de pipelines de atencion al cliente: clasificar tickets o mensajes entrantes por intencion (`email_sendemail`, `takeaway_order`, `transport_taxi`) antes de derivarlos a agentes o flujos automatizados, con un throughput de 763 textos por segundo.
- Etiquetado masivo de logs o conversaciones: procesar grandes volumenes de texto en CPU para analitica de intenciones, aprovechando el bajo coste por inferencia y la precision de 0,815.
- Filtrado y moderacion previa: usar la clasificacion para detectar intenciones sensibles o categorias concretas (`social_post`, `recommendation_events`) antes de un modelo mayor.
- Sistema en cascada con el docente: desplegar primero el estudiante y derivar solo los textos de baja confianza al docente Gemma-4-12B, alcanzando 0,820 de precision derivando el 20% de las peticiones, como estrategia de equilibrio coste/precision.

## Benchmarks y rendimiento

Tarea `massive-da`, 2.974 textos de test etiquetados de oro. Filas CPU con 2 hilos; latencia mediana sobre ejecuciones repetidas.

| Modelo | Dispositivo | Accuracy | Macro-F1 | Top-3 accuracy | Acuerdo con docente | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamano (MB) |
|---|---|---|---|---|---|---|---|---|---|
| Docente, 16 ejemplos similares, 4-bit, probe | cuda:0 | 0,808 | 0,780 | 0,908 | n/a | n/a | n/a | n/a | 23.920 |
| Estudiante, PyTorch | cpu | 0,815 ± 0,002 | 0,782 ± 0,005 | 0,922 ± 0,001 | 0,849 ± 0,002 | 7,3 | 99,2 | 322,7 | 95 |
| Estudiante, ONNX fp32 | cpu | 0,818 | 0,788 | 0,923 | 0,849 | 4,5 | 92,3 | 346,7 | 96 |
| Estudiante, ONNX int8 | cpu | 0,815 | 0,789 | 0,922 | 0,846 | 2,0 | 41,9 | 763,4 | 24 |

Cascada (estudiante primero, textos dudosos al docente):

| Porcentaje derivado al docente | Umbral de confianza del estudiante | Accuracy | Macro-F1 |
|---|---|---|---|
| 0% | 0,131 | 0,815 | 0,789 |
| 10% | 0,564 | 0,819 | 0,792 |
| 20% | 0,754 | 0,820 | 0,793 |
| 30% | 0,866 | 0,815 | 0,787 |
| 50% | 0,946 | 0,812 | 0,784 |
| 100% | 1,000 | 0,808 | 0,780 |

## Requisitos de hardware

- Inferencia solo en CPU viable: ONNX int8 con 2 hilos ofrece 2,0 ms por texto (batch 1) y 763 textos/s (batch 32).
- VRAM: no requiere GPU; puede ejecutarse en CPU. En GPU el requisito es minimo (modelo de 24-96 MB), cabe en cualquier GPU consumer.
- GPU recomendadas: no son necesarias; cualquier GPU (RTX 4090, A100, H100) puede alojarlo sin problema, pero el modelo esta optimizado para CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde por su tamano de 24 MB en int8.
- Despliegue: `tinydistill` (comandos `predict` y `serve`), ONNX Runtime, y compatible con text-embeddings-inference y endpoints.
- Latencia y throughput estimados: 2,0-7,3 ms por texto en batch 1 segun formato (int8/fp32/PyTorch); hasta 763 textos/s en batch 32 con int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (massive-da) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinydistill-massive-da-multilingual (este) | no disponible (~118 M base) | no disponible | 0,815 (int8) | CC-BY-4.0 | Hugging Face (ONNX) |
| Docente gemma-4-12B-it (referencia) | 12 B | no disponible | 0,808 | no disponible | no disponible |
| paraphrase-multilingual-MiniLM-L12-v2 (base) | ~118 M | no disponible | no disponible (no clasificador de intenciones) | no disponible | Hugging Face |

No se dispone de datos de otros clasificadores de intenciones comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo discriminativo: no genera texto ni razona; solo clasifica en las 60 clases fijas de MASSIVE. No sirve para tareas fuera de ese esquema.
- El rendimiento esta medido exclusivamente en la tarea `massive-da` (danes); no hay datos de rendimiento en otros idiomas ni dominios.
- Riesgo de confusion entre intenciones semanticamente proximas (por ejemplo variantes de `iot_hue_light*` o `audio_volume_*`), mitigable con la cascada hacia el docente.
- La licencia CC-BY-4.0 exige atribucion; el propio autor advierte de que deben comprobarse las licencias del modelo estudiante, del docente y de los datos de entrenamiento antes de su uso.
- La precision esta limitada por el docente: en la practica ronda 0,81-0,82, por lo que no es adecuado para decisiones de alta criticidad sin validacion adicional.
- Los umbrales de la cascada estan fijados sobre el conjunto de test; en produccion deben recalibrarse sobre una particion de validacion.
- No se especifican los idiomas soportados ni la longitud de contexto en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shroomy/tinydistill-massive-da-multilingual
- Herramienta tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Dataset: https://huggingface.co/datasets/mteb/amazon_massive_intent
- Modelo docente: https://huggingface.co/google/gemma-4-12B-it
