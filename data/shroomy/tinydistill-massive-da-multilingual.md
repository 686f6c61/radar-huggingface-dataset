# Shroomy/tinydistill-massive-da-multilingual

## Resumen

tinydistill-massive-da-multilingual es un clasificador de texto ligero obtenido por destilación de conocimiento a partir de Qwen/Qwen2.5-7B-Instruct sobre el modelo estudiante sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, y exportado a ONNX para inferencia rápida en CPU. Lo desarrolla el usuario Shroomy con la herramienta tinydistill y resuelve una tarea concreta: la clasificación de intenciones en 60 clases del dataset MASSIVE (variante danesa, `massive-da`), típica de asistentes de voz y sistemas de diálogo.

El modelo combina dos ideas: por un lado, aprovecha las etiquetas blandas de un LLM grande (7B) como profesor para entrenar un estudiante de apenas 118 millones de parámetros; por otro, exporta el resultado a ONNX con cuantización int8 opcional para que quepa en cualquier CPU moderna con latencias de milisegundos. El resultado es un clasificador de 24 MB (int8) que supera ligeramente al profesor en accuracy (0,759 frente a 0,736) y ofrece un throughput de casi 800 textos por segundo con dos hilos.

Es relevante ahora porque demuestra que, para tareas de clasificación acotadas, un estudiante destilado puede igualar o superar a un modelo 60 veces más grande a una fracción del coste computacional, con un pipeline de despliegue (ONNX + tinydistill) pensado para producción en CPU y compatible con Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style), MiniLM-L12 de 12 capas, destilado a clasificador de 60 clases |
| Parametros totales | Aproximadamente 118 millones (modelo base paraphrase-multilingual-MiniLM-L12-v2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base MiniLM soporta habitualmente 128-512 tokens; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (dynamic quantization); pesos PyTorch originales |
| Idiomas soportados | Multilingue segun el modelo base; la tarea evaluada es `massive-da` (danes). Lista completa de idiomas no disponible |
| Licencia | cc-by-4.0 (el autor advierte de revisar las licencias del estudiante, el profesor y los datos) |
| Formato de pesos | ONNX (fp32 e int8), ademas de PyTorch |

## Arquitectura y entrenamiento

El estudiante es un transformer encoder de tipo BERT (MiniLM-L12) que parte de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` y se afina como clasificador de secuencia con una cabeza de 60 clases. El profesor es `Qwen/Qwen2.5-7B-Instruct`, consultado en modo 8-shot (8 ejemplos de oro por clase, 476 textos en total) y cuantizado a 4 bits durante la generación de etiquetas.

El entrenamiento combina dos señales: destilación sobre las etiquetas blandas del profesor para los 11.514 textos de entrenamiento y entropía cruzada sobre los 476 textos con etiqueta de oro (peso 1,0). El pipeline usa la herramienta tinydistill, que gestiona la generación de etiquetas, el entrenamiento del estudiante y la exportación a ONNX. Se reportan resultados promediados sobre 3 semillas de entrenamiento (desviación típica incluida), y la exportación ONNX corresponde al primer modelo entrenado. La innovación principal no es arquitectónica sino de proceso: destilación de un LLM de 7B a un encoder de 118M con evaluación rigurosa de latencia, throughput y cascada profesor-estudiante.

## Capacidades

- Clasificación de texto en 60 intenciones predefinidas del esquema MASSIVE (alarmas, audio, calendario, cocina, datetime, email, IoT, listas, música, noticias, reproducción multimedia, QA, recomendaciones, redes sociales, comida a domicilio, transporte y clima).
- Inferencia ultrarrápida en CPU: 1,8 ms por texto en batch 1 y 40,2 ms en batch 32 con ONNX int8 y 2 hilos.
- Throughput de hasta 797 textos por segundo en ONNX int8.
- Salida de probabilidades por clase, lo que permite umbrales de confianza y cascadas hacia un profesor mayor.
- Compatible con Text Embeddings Inference y con el comando `tinydistill serve` para desplegar un endpoint HTTP.
- Capacidad multilingüe heredada del modelo base, aunque la evaluación publicada se limita al danés (`massive-da`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador de una sola pasada.

## Casos de uso

- Enrutado de intenciones en asistentes de voz: el clasificador recibe la transcripción del usuario y devuelve una de las 60 intenciones (por ejemplo, `iot_hue_lighton` o `transport_taxi`) con latencia inferior a 2 ms por texto en CPU, lo que permite integrarlo en el bucle de diálogo sin añadir latencia perceptible.
- Moderación y triaje de peticiones en un chatbot: antes de invocar un LLM generativo, el clasificador decide qué subconjunto de herramientas o flujos activar, reduciendo coste y latencia del sistema completo.
- Procesamiento por lotes de logs de conversaciones: con casi 800 textos por segundo en ONNX int8, se pueden etiquetar millones de turnos de usuario en minutos para analítica de producto o detección de intenciones no cubiertas.
- Despliegue en dispositivos de borde o servidores sin GPU: el modelo int8 ocupa 24 MB y funciona con 2 hilos de CPU, lo que permite ejecutarlo en contenedores pequeños, Raspberry Pi o funciones serverless.
- Cascada con un LLM mayor: el estudiante responde todas las peticiones y deriva al profesor solo las de baja confianza; con un umbral que envía el 10 % al profesor se mantiene una accuracy de 0,760, prácticamente la misma que respondiendo todo con el estudiante.
- Clasificación multilingüe de comandos en productos de domótica o asistentes: el modelo base es multilingüe y el esquema de 60 clases cubre acciones habituales de IoT (`iot_wemo_on`, `iot_coffee`, `iot_cleaning`), lo que facilita adaptarlo a otros idiomas del dataset MASSIVE.
- Generación de datos sintéticos etiquetados: usar el profesor para etiquetar grandes volúmenes y el estudiante para servir en producción, manteniendo coherencia entre ambos (acuerdo del 79,8 % en ONNX).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la tarea `massive-da` con 2.974 textos de test etiquetados en oro:

| Modelo | Dispositivo | Accuracy | Macro-F1 | Top-3 accuracy | Acuerdo con el profesor | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamano (MB) |
|---|---|---|---|---|---|---|---|---|---|
| Profesor, 8-shot, 4-bit | cuda:0 | 0,736 | 0,688 | 0,889 | n/a | n/a | n/a | n/a | n/a |
| Estudiante, PyTorch | cpu | 0,761 ± 0,001 | 0,708 ± 0,003 | 0,904 ± 0,002 | 0,802 ± 0,006 | 6,5 | 95,8 | 333,9 | 95 |
| Estudiante, ONNX fp32 | cpu | 0,760 | 0,705 | 0,904 | 0,798 | 4,2 | 90,7 | 352,7 | 96 |
| Estudiante, ONNX int8 | cpu | 0,759 | 0,706 | 0,900 | 0,798 | 1,8 | 40,2 | 797,0 | 24 |

Cascada estudiante-profesor (umbral de confianza del estudiante):

| Porcentaje enviado al profesor | Umbral de confianza | Accuracy | Macro-F1 |
|---|---|---|---|
| 0 % | 0,151 | 0,759 | 0,706 |
| 10 % | 0,520 | 0,760 | 0,708 |
| 20 % | 0,688 | 0,759 | 0,707 |
| 30 % | 0,834 | 0,752 | 0,698 |
| 50 % | 0,939 | 0,743 | 0,691 |
| 100 % | 1,000 | 0,736 | 0,688 |

Las filas de CPU usan 2 hilos y la latencia es la mediana de ejecuciones repetidas. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU. En GPU cabría en cualquier tarjeta con al menos 1 GB de memoria.
- GPU recomendadas: no aplica; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja frente a CPU para este tamaño.
- CPU: funciona con 2 hilos; el modelo int8 ocupa 24 MB en disco y una fracción similar en memoria.
- Cabe en cualquier consumer GPU y en CPU de gama baja, incluidos dispositivos de borde.
- Opciones de despliegue: tinydistill (`tinydistill serve`), ONNX Runtime, Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), o carga directa del ONNX desde Python.
- Latencia y throughput: 1,8 ms por texto en batch 1 y 40,2 ms en batch 32 con ONNX int8; 797 textos/s de throughput. En fp32, 4,2 ms y 352,7 textos/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en massive-da | Licencia | Formato |
|---|---|---|---|---|---|
| tinydistill-massive-da-multilingual (ONNX int8) | ~118 M | No disponible | 0,759 | cc-by-4.0 | ONNX |
| Profesor Qwen2.5-7B-Instruct (8-shot, 4-bit) | 7 000 M | No disponible en la informacion proporcionada | 0,736 | No disponible en la informacion proporcionada | Safetensors / cuantizado |
| paraphrase-multilingual-MiniLM-L12-v2 sin destilar | ~118 M | No disponible | No disponible | No disponible en la informacion proporcionada | Safetensors |

La comparación relevante es con el profesor: el estudiante de 118M supera al LLM de 7B en accuracy (0,759 frente a 0,736) y en macro-F1 (0,706 frente a 0,688) en esta tarea concreta, con un tamaño 60 veces menor y sin necesidad de GPU. No se dispone de datos de otros clasificadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo clasifica dentro de las 60 intenciones del esquema MASSIVE; cualquier texto fuera de ese dominio se asignará a una de esas clases, posiblemente de forma incorrecta.
- La evaluación publicada se limita al danés (`massive-da`); el rendimiento en otros idiomas, aunque el modelo base sea multilingüe, no está verificado.
- Riesgo de sesgos heredados del profesor (Qwen2.5-7B-Instruct) y de los datos de entrenamiento (MASSIVE); no se documenta ningún análisis de sesgo.
- El acuerdo con el profesor es del 79,8 %, lo que implica que en torno a un 20 % de las predicciones difieren de las del profesor; en dominios sensibles conviene validar con datos propios.
- La licencia cc-by-4.0 la elige el autor, pero la propia model card advierte de revisar las licencias del modelo estudiante, del profesor y del dataset antes de un uso comercial.
- El modelo es un clasificador, no un generador: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.
- Los umbrales de la cascada publicados se ajustaron sobre el conjunto de test; en producción deben recalibrarse sobre un split de validación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un modelo reciente y sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shroomy/tinydistill-massive-da-multilingual
- Repositorio de tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset MASSIVE: https://huggingface.co/datasets/mteb/amazon_massive_intent
