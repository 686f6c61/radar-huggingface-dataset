# Shroomy/tinydistill-hwu64-minilm

## Resumen

tinydistill-hwu64-minilm es un clasificador de texto de 64 clases destilado por el usuario Shroomy a partir del modelo docente google/gemma-4-12B-it y volcado sobre la arquitectura del estudiante sentence-transformers/all-MiniLM-L6-v2. El resultado se exporta a ONNX para inferencia rápida en CPU. El dominio de aplicación es la detección de intenciones en asistentes de voz y agentes conversacionales: las 64 etiquetas cubren acciones como alarmas, calendario, correo, domótica, listas, música, noticias, preguntas factuales, recomendaciones, redes sociales, pedidos de comida, transporte y clima.

El modelo resuelve el problema clásico de llevar la calidad de un LLM grande a un entorno de producción con latencia mínima y huella de memoria pequeña. Frente al docente de 12B parámetros en 4 bits (7,5 GB), el estudiante ocupa 91 MB en fp32 y 23 MB en int8, y ofrece una aceleración de entre 1013x y 2927x en batch 1 sobre CPU con dos hilos, manteniendo una precisión de 0,898 en fp32 y 0,892 en int8 sobre 1076 textos de test etiquetados manualmente.

El repositorio tiene un tamano de 0,2 GB y se publica bajo licencia cc-by-4.0. Es relevante ahora porque demuestra que la destilación de etiquetas suaves desde un LLM hacia un encoder compacto permite igualar o superar al docente en una tarea cerrada de clasificación, con un coste de inferencia tres ordenes de magnitud menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (sentence-transformers/all-MiniLM-L6-v2) con cabeza de clasificacion de 64 clases |
| Parametros totales | no disponible (el estudiante all-MiniLM-L6-v2 ronda los 22,7 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base all-MiniLM-L6-v2 admite hasta 256 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (variantes publicadas); PyTorch fp32 disponible como artefacto de entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (fp32 e int8); checkpoint PyTorch subyacente |

## Arquitectura y entrenamiento

El estudiante es un encoder transformer bidireccional de la familia MiniLM (all-MiniLM-L6-v2), sobre el que se anade una cabeza de clasificacion lineal con 64 salidas. El entrenamiento sigue el esquema de destilacion de conocimiento implementado por la libreria tinydistill: el estudiante aprende de las etiquetas suaves producidas por el docente google/gemma-4-12B-it sobre los 8954 textos de entrenamiento del dataset DeepPavlov/hwu64, combinadas con entropia cruzada sobre 512 textos etiquetados manualmente (8 por clase, peso 1,0).

El docente no se usa en modo zero-shot puro: sus probabilidades se promedian con las de una sonda lineal ajustada sobre sus estados ocultos, entrenada con 512 textos de oro (410 para ajuste, 102 para validacion). En esa validacion, la precision del docente en contexto es 88,2%, la de la sonda 86,3% y la combinada 88,2%. Ademas, el prompt del docente incluye para cada texto los 16 ejemplos de entrenamiento mas similares entre los 512 etiquetados, lo que actua como recuperacion few-shot. El estudiante se exporta a ONNX en fp32 e int8; la fila int8 del informe corresponde al primer seed de entrenamiento exportado, mientras que las cifras con ± son medias sobre 3 seeds.

## Capacidades

- Clasificacion de intenciones en 64 clases cerradas propias de asistentes de voz y agentes de domotica.
- Prediccion de etiqueta unica con probabilidades por clase, lo que permite umbrales de confianza y cascadas hacia un modelo mayor.
- Inferencia en CPU con latencia sub-milisegundo en batch 1 (0,8 ms en int8) y throughput de 1475,5 textos/s en int8.
- Exportacion ONNX compatible con text-embeddings-inference y endpoints compatibles, segun los tags del repositorio.
- No dispone de generacion de texto, razonamiento abierto, codigo, matematicas, vision, audio ni tool calling: es un clasificador discriminativo.
- No se documentan capacidades multilingues; el dataset hwu64 es predominantemente en ingles y no se declaran idiomas soportados.
- No se documenta modo thinking ni agentes multi-paso.

## Casos de uso

- Enrutado de intenciones en asistentes de voz: cada transcripcion se clasifica en una de las 64 intenciones (alarm_set, play_music, weather_query, etc.) con 0,8 ms de latencia en int8, lo que permite responder antes de que el usuario perciba retardo.
- Cascada con LLM para consultas ambiguas: el estudiante responde a todas las peticiones y deriva al docente solo las de baja confianza. Con umbral 0,678 se envia el 10% al docente y la precision sube de 0,892 a 0,898 con 221,2 ms medios por texto, equilibrando coste y calidad.
- Clasificacion por lotes en backend de logs conversacionales: con 1475,5 textos/s en int8 sobre CPU de dos hilos, se pueden etiquetar millones de utterances historicas para analitica de uso sin GPU.
- Control de domotica por comandos de voz: las etiquetas iot_hue_lighton, iot_wemo_off, iot_coffee o iot_cleaning permiten mapear directamente utterances a acciones sobre dispositivos, con huella de 23 MB apta para dispositivos embebidos.
- Filtrado previo en pipelines de atencion al cliente: clasificar consultas entrantes en categorias como email_sendemail, takeaway_order o transport_taxi para enrutarlas al flujo adecuado antes de invocar modelos generativos.
- Deteccion de comandos en dispositivos de bajo consumo: el artefacto int8 de 23 MB cabe en memoria de moviles y Raspberry Pi, habilitando wake-word seguido de clasificacion local sin enviar audio a la nube.
- Evaluacion y curado de datasets de intenciones: usar el clasificador para pre-etiquetar corpus nuevos y revisar manualmente solo las predicciones de baja confianza, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

Task hwu64, 1076 textos de test etiquetados manualmente. Docente: google/gemma-4-12B-it. Estudiante: sentence-transformers/all-MiniLM-L6-v2.

| Modelo | Dispositivo | Accuracy | Macro-F1 | Top-3 accuracy | Acuerdo con docente | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamano (MB) | Aceleracion batch 1 |
|---|---|---|---|---|---|---|---|---|---|---|
| docente, 16 ejemplos similares, 4-bit, sonda | cuda | 0,877 | 0,876 | 0,948 | n/a | 2196,4 | n/a | 0,5 | 7504 | 1,0x |
| estudiante, PyTorch | cpu | 0,894 ± 0,005 | 0,893 ± 0,004 | 0,964 ± 0,001 | 0,893 ± 0,003 | 3,7 | 48,1 | 665,0 | 91 | 593,2x |
| estudiante, ONNX fp32 | cpu | 0,898 | 0,897 | 0,965 | 0,893 | 2,2 | 45,7 | 699,7 | 91 | 1013,4x |
| estudiante, ONNX int8 | cpu | 0,892 | 0,891 | 0,958 | 0,890 | 0,8 | 21,7 | 1475,5 | 23 | 2927,1x |

Cascada estudiante primero, textos inseguros al docente:

| Porcentaje enviado al docente | Umbral de confianza del estudiante | Accuracy | Macro-F1 | Latencia media por texto (ms) |
|---|---|---|---|---|
| 0% | 0,193 | 0,892 | 0,891 | 0,8 |
| 10% | 0,678 | 0,898 | 0,896 | 221,2 |
| 20% | 0,869 | 0,887 | 0,885 | 439,6 |
| 30% | 0,933 | 0,879 | 0,878 | 660,1 |
| 50% | 0,962 | 0,880 | 0,878 | 1098,9 |
| 100% | 1,000 | 0,877 | 0,876 | 2197,1 |

Las filas de CPU usan 2 hilos. La latencia es la mediana sobre ejecuciones repetidas. El tamano es el de los pesos del docente tal como se cargan y el de los ficheros de los estudiantes. La aceleracion es relativa al docente con 16 ejemplos similares, 4-bit y sonda sobre cuda.

## Requisitos de hardware

- Inferencia en CPU: el artefacto int8 de 23 MB funciona con 2 hilos y 0,8 ms por texto en batch 1; el fp32 de 91 MB requiere 2,2 ms por texto.
- GPU no necesaria para el estudiante; el docente de referencia exige aproximadamente 7,5 GB de pesos en 4 bits y se midio sobre cuda con 2196,4 ms por texto en batch 1.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU; para el estudiante no se requiere VRAM dedicada.
- Despliegue mediante la libreria tinydistill (pip install tinydistill) con `Predictor("hf:Shroomy/tinydistill-hwu64-minilm")`, modo CLI `tinydistill serve` y exportacion ONNX compatible con text-embeddings-inference y endpoints compatibles.
- Throughput estimado: 699,7 textos/s en ONNX fp32 y 1475,5 textos/s en ONNX int8 con CPU de dos hilos.
- Para la cascada completa hace falta ademas servir el docente google/gemma-4-12B-it en 4 bits sobre GPU, con 2196,4 ms por texto en batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en hwu64 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinydistill-hwu64-minilm (ONNX int8) | no disponible | no disponible | 0,892 | cc-by-4.0 | Hugging Face, ONNX |
| tinydistill-hwu64-minilm (ONNX fp32) | no disponible | no disponible | 0,898 | cc-by-4.0 | Hugging Face, ONNX |
| docente google/gemma-4-12B-it (4-bit, sonda, 16 ejemplos) | 12B | no disponible | 0,877 | no disponible | no disponible |
| estudiante PyTorch (mismo modelo, sin exportar) | no disponible | no disponible | 0,894 ± 0,005 | cc-by-4.0 | Hugging Face, PyTorch |

No se dispone en la informacion proporcionada de resultados de otros clasificadores de intenciones sobre hwu64 (por ejemplo, variantes de BERT o RoBERTa ajustadas especificamente), por lo que la comparativa se limita a las variantes del propio modelo y al docente.

## Limitaciones y advertencias

- El modelo solo cubre 64 intenciones predefinidas del dataset hwu64; cualquier intencion fuera de ese conjunto se asigna forzosamente a una de las clases existentes, generando errores silenciosos.
- La precision ronda 0,89, con aproximadamente 11% de error sobre el test; en produccion conviene calibrar umbrales sobre una particion de validacion propia, no sobre test.
- El dataset hwu64 es predominantemente en ingles y no se declaran idiomas soportados; el uso en castellano no esta validado y probablemente degrada la precision.
- Riesgo de sesgo heredado tanto del dataset DeepPavlov/hwu64 como de las etiquetas suaves del docente gemma-4-12B-it, incluyendo posibles sesgos de genero, culturales o de dominio en las intenciones de recomendacion y redes sociales.
- El acuerdo con el docente es 0,893, por debajo de la precision absoluta del estudiante; el estudiante no replica fielmente al docente y puede divergir en casos ambiguos.
- La licencia cc-by-4.0 es permisiva para uso comercial con atribucion, pero el propio autor advierte de que deben verificarse las licencias del estudiante (all-MiniLM-L6-v2), del docente (gemma-4-12B-it) y del dataset antes de un uso comercial.
- Las cifras de la tabla de resultados mezclan medias sobre 3 seeds (filas PyTorch) con el primer seed exportado (filas ONNX); no deben tratarse como estimaciones independientes.
- El modelo no genera texto ni razona: no debe emplearse para tareas generativas, tool calling ni agentes multi-paso.
- No se publican datos sobre robustez frente a ruido ASR, errores ortograficos o entradas adversariales, relevantes en despliegues de voz reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shroomy/tinydistill-hwu64-minilm
- Libreria tinydistill: https://github.com/Andreas-Hum/tinydistill
- Dataset DeepPavlov/hwu64: https://huggingface.co/datasets/DeepPavlov/hwu64
- Modelo estudiante base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo docente: https://huggingface.co/google/gemma-4-12B-it
