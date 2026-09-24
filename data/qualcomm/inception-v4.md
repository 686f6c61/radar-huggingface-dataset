# qualcomm/Inception-v4

## Resumen

Inception-v4 es una red neuronal convolucional (CNN) para clasificación de imágenes, publicada originalmente por Google en 2016 (arXiv:1602.07261) y aquí redistribuida por Qualcomm como parte de su catálogo Qualcomm AI Hub Models. El repositorio `qualcomm/Inception-v4` no contiene un modelo entrenado desde cero, sino los artefactos preexportados y optimizados del checkpoint ImageNet de `timm/inception_v4.tf_in1k` para ejecutarse sobre la NPU (Hexagon) de los chipsets Snapdragon y Dragonwing de Qualcomm.

El modelo tiene 42,6 millones de parámetros, acepta entradas de 299x299 píxeles y clasifica sobre las 1.000 clases de ImageNet. Además de la tarea de clasificación, está etiquetado como `backbone`, por lo que puede reutilizarse como extractor de características en arquitecturas más complejas (detección, segmentación, recuperación de imágenes). Su relevancia actual no está en la arquitectura en sí, sino en el empaquetado: Qualcomm ofrece versiones en ONNX, QNN_DLC y TFLite, en precisión float y en cuantización w8a8, con latencias medidas en hardware real de entre 0,665 ms y 8,109 ms por inferencia.

El modelo es pequeño (163 MB en float, 41,6 MB en w8a8), lo que permite desplegarlo en dispositivos móviles, portátiles ARM, cámaras y plataformas industriales sin necesidad de aceleradores dedicados. La licencia Apache 2.0 facilita su uso comercial, y la integración con Qualcomm AI Hub Workbench permite recompilarlo o recuantizarlo con pesos propios y formas de entrada personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo Inception-v4 (módulos Inception con conexiones residuales), implementación de referencia `timm/inception_v4.tf_in1k` |
| Parametros totales | 42,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 299x299 píxeles) |
| Tipos de cuantizacion | float (FP32/FP16 según runtime) y w8a8 (pesos y activaciones en int8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de clase son las 1.000 de ImageNet en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint timm), ONNX, QNN_DLC (QAIRT), TFLite |
| Resolucion de entrada | 299x299 |
| Numero de clases | 1.000 (ImageNet) |
| Tamano en float | 163 MB |
| Tamano en w8a8 | 41,6 MB |
| Runtime / SDK soportado | QAIRT 2.50, ONNX Runtime 1.27.1, TFLite, QNN_DLC |
| Fecha de publicacion en HuggingFace | 23/09/2026 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Inception-v4 es una CNN profunda que reorganiza la familia Inception con módulos más uniformes y un mayor número de bloques Inception que Inception-v3, incorporando además conexiones residuales puras en el tronco de la red. La entrada es una imagen RGB de 299x299 y la salida es una distribución sobre las 1.000 clases de ImageNet. El repositorio de Qualcomm no modifica la arquitectura: parte de la implementación de `timm` (variante entrenada sobre `tf_in1k`, es decir, los pesos de TensorFlow portados a PyTorch) y la reexporta a formatos adecuados para la NPU Hexagon.

No se dispone en la información proporcionada de detalles sobre el número de tokens/imágenes de entrenamiento, la composición exacta del dataset más allá de ImageNet, ni sobre si hubo etapas de ajuste fino con RLHF/DPO (procedimiento que, por otra parte, no aplica a un clasificador de imágenes). La innovación técnica relevante en este repositorio no está en el entrenamiento, sino en el pipeline de exportación de Qualcomm AI Hub Models: compilación para el dispositivo objetivo, cuantización a w8a8 cuando procede, y perfilado en hardware real mediante Qualcomm AI Hub Workbench, lo que permite obtener métricas de latencia y memoria pico verificadas en dispositivos concretos.

## Capacidades

- Clasificación de imágenes sobre las 1.000 clases de ImageNet a partir de entradas de 299x299 píxeles.
- Extracción de características (embeddings) de imagen, útil como backbone congelado para tareas posteriores.
- Ajuste fino para dominios específicos (clasificación binaria o multiclase, detección, segmentación) partiendo del checkpoint ImageNet.
- Inferencia acelerada por hardware: los artefactos están compilados para ejecutarse en la NPU de chipsets Snapdragon y Dragonwing, no solo en CPU o GPU.
- Dos niveles de precisión: float para máxima fidelidad y w8a8 para mínimo consumo de memoria y máxima velocidad (reducción de tamaño de 163 MB a 41,6 MB).
- Compatibilidad multiplataforma de despliegue mediante ONNX (ONNX Runtime 1.27.1), TFLite y QNN_DLC sobre QAIRT 2.50.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de visión.
- No tiene capacidades multilingües en el sentido de PLN; las etiquetas de salida son las clases de ImageNet.

## Casos de uso

- Clasificación de fotos en el dispositivo: una aplicación móvil puede etiquetar automáticamente la galería del usuario sin enviar imágenes a la nube, con latencias de 0,699 ms a 2,356 ms en Snapdragon 8 Elite y solo 41,6 MB de pesos en w8a8.
- Backbone para detección y segmentación: al estar etiquetado como `backbone`, se puede conectar una cabeza de detección o segmentación sobre las características extraídas y reexportar todo el grafo con Qualcomm AI Hub Models para mantener la aceleración por NPU.
- Inspección visual industrial: en líneas de producción con cámaras conectadas a módulos Dragonwing (por ejemplo IQ-8275 con 1,517 ms en w8a8), el modelo puede clasificar defectos en tiempo real a decenas o cientos de imágenes por segundo por unidad.
- Reconocimiento de producto en retail: clasificación de artículos en estanterías o en cajas de autoservicio, con ajuste fino sobre un conjunto propio de clases y despliegue en terminales móviles.
- Procesamiento de vídeo en drones y robótica: con QCS8550 (1,32 ms en w8a8) o QCS6490 (6,14 ms en w8a8) el modelo cabe en presupuestos de potencia estrictos y permite clasificar fotogramas a alta cadencia.
- Filtrado y moderación previa en el borde: descartar o etiquetar imágenes en el propio dispositivo antes de subirlas a un servicio central, reduciendo ancho de banda y coste de cómputo en servidor.
- Realidad aumentada y XR: en plataformas con Snapdragon X Elite o X2 Elite (1,302 ms y 0,665 ms en w8a8) la clasificación puede ejecutarse dentro del presupuesto de fotograma sin comprometer el renderizado.
- Agricultura y teledetección: clasificación de cultivos, plagas o estado de parcelas a partir de imágenes de dron o satélite, reentrenando el backbone con datos del dominio y exportándolo de nuevo para NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En particular, la información proporcionada no incluye métricas de exactitud (top-1/top-5) sobre ImageNet para este checkpoint. Lo que sí se incluye son mediciones de latencia y memoria pico realizadas con Qualcomm AI Hub Workbench sobre dispositivos reales, resumidas a continuación (subconjunto representativo; la tabla completa está en la página del modelo en Qualcomm AI Hub):

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad principal |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | float | 1,923 | 0 - 56 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | w8a8 | 0,699 | 0 - 97 | NPU |
| Snapdragon 8 Elite For Galaxy | ONNX | float | 2,356 | 0 - 54 | NPU |
| Snapdragon 8 Elite For Galaxy | ONNX | w8a8 | 0,839 | 0 - 96 | NPU |
| Snapdragon X2 Elite | ONNX | float | 2,125 | 1 - 1 | NPU |
| Snapdragon X2 Elite | ONNX | w8a8 | 0,665 | 1 - 1 | NPU |
| Snapdragon X Elite | ONNX | float | 3,96 | 82 - 82 | NPU |
| Snapdragon X Elite | ONNX | w8a8 | 1,302 | 42 - 42 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 2,961 | 0 - 104 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 0,96 | 0 - 140 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 6,767 | 1 - 108 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a8 | 1,719 | 0 - 142 | NPU |
| Dragonwing IQ-8275 | ONNX | float | 8,109 | 1 - 6 | NPU |
| Dragonwing IQ-8275 | ONNX | w8a8 | 1,517 | 0 - 5 | NPU |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 3,989 | 0 - 97 | NPU |
| Dragonwing QCS8550 (Proxy) | ONNX | w8a8 | 1,32 | 0 - 50 | NPU |
| QCS8450 | ONNX | float | 6,767 | 1 - 108 | NPU |
| QCS8450 | ONNX | w8a8 | 1,719 | 0 - 142 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 7,02 | 1 - 5 | NPU |
| Dragonwing IQ-9075 | ONNX | w8a8 | 1,478 | 0 - 4 | NPU |
| Dragonwing IQ-X7181 | ONNX | float | 3,96 | 82 - 82 | NPU |
| Dragonwing IQ-X7181 | ONNX | w8a8 | 1,302 | 42 - 42 | NPU |
| Dragonwing Q-8750 | ONNX | float | 2,356 | 0 - 54 | NPU |
| Dragonwing QCS6490 | ONNX | w8a8 | 6,14 | 0 - 4 | NPU |

La cuantización w8a8 reduce el tiempo de inferencia entre un 55 % y un 80 % según el chipset respecto a float, a costa de una posible pérdida de exactitud que no se cuantifica en la información disponible.

## Requisitos de hardware

- Almacenamiento de pesos: 163 MB en float y 41,6 MB en w8a8, sin contar activaciones ni overhead del runtime.
- Memoria pico reportada por Qualcomm: entre 1 MB y 142 MB según chipset y precisión (por ejemplo, 42 MB en Snapdragon X Elite con w8a8 y 142 MB en Snapdragon 8 Gen 1 con w8a8).
- Ejecución nativa en NPU Hexagon de chipsets Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite) y Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS6490, QCS8550, QCS8450).
- En GPU de PC o servidor no hay cifras oficiales: por tamaño, el modelo (163 MB en float) cabe holgadamente en cualquier GPU consumer con más de 1 GB de memoria libre, incluidas GTX 1050/1650, RTX 3050 y superiores. La VRAM estimada para inferencia en FP32 ronda 0,5-1 GB contando activaciones, pero es una estimación no verificada en la información proporcionada.
- También es viable en CPU, dado el reducido número de parámetros y la resolución de entrada (299x299).
- Opciones de despliegue: Qualcomm AI Hub Workbench / QAIRT 2.50 con QNN_DLC, ONNX Runtime 1.27.1, TFLite, y PyTorch/timm para entrenamiento o ajuste fino. Otros runtimes (TensorRT, OpenVINO) no están documentados en la información proporcionada.
- Throughput aproximado derivado de las latencias medidas: en Snapdragon X2 Elite con w8a8, 0,665 ms por inferencia equivalen a unos 1.500 fotogramas por segundo teóricos en un único flujo; en Snapdragon 8 Gen 1 con float, 6,767 ms equivalen a unos 148 fotogramas por segundo. Son cifras derivadas, no medidas de throughput agregado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. La siguiente tabla recoge únicamente lo que puede contrastarse a partir de los datos disponibles, marcando explícitamente lo que no está verificado. Los valores entre paréntesis de los modelos alternativos son cifras de referencia ampliamente citadas en la literatura, no verificadas en la información proporcionada.

| Modelo | Parametros | Entrada | Optimizacion para NPU Qualcomm | Formatos preexportados | Licencia |
|---|---|---|---|---|---|
| qualcomm/Inception-v4 | 42,6 M | 299x299 | Sí, con latencias medidas por dispositivo | ONNX, QNN_DLC, TFLite (float y w8a8) | Apache 2.0 |
| timm/inception_v4.tf_in1k | 42,6 M (mismo checkpoint) | 299x299 | No | PyTorch | no disponible |
| Inception-v3 (familia Inception) | no disponible (~24 M en referencias públicas) | 299x299 | No en esta distribución | PyTorch | no disponible |
| ResNet-50 | no disponible (~25,6 M en referencias públicas) | 224x224 | No en esta distribución | PyTorch, ONNX | no disponible |
| MobileNetV3-Large | no disponible (~5,4 M en referencias públicas) | 224x224 | No en esta distribución | PyTorch, TFLite | no disponible |
| EfficientNet-B0 | no disponible (~5,3 M en referencias públicas) | 224x224 | No en esta distribución | PyTorch, ONNX, TFLite | no disponible |

La ventaja diferencial de esta ficha no es la exactitud frente a alternativas más modernas y ligeras (MobileNetV3 o EfficientNet-B0 ofrecen menor coste computacional con exactitud comparable o superior en ImageNet), sino la disponibilidad de artefactos ya compilados y perfilados para NPU de Qualcomm, con licencia Apache 2.0 y métricas de latencia verificadas en más de una decena de chipsets.

## Limitaciones y advertencias

- Ausencia de métricas de exactitud: no se publican top-1 ni top-5 sobre ImageNet en la información disponible, por lo que no puede validarse la pérdida de precisión introducida por la cuantización w8a8.
- Sesgos del dataset: al entrenarse sobre ImageNet, hereda los sesgos de representación geográfica, cultural y demográfica de ese corpus, con clases desequilibradas y categorías taxonómicamente inconsistentes.
- Riesgo de alucinación en sentido estricto: no aplica (no genera texto), pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de ImageNet (fotos médicas, industriales, artísticas o con oclusión).
- Dominio cerrado: solo predice entre 1.000 clases de ImageNet; cualquier uso real requiere ajuste fino o sustitución de la cabeza de clasificación.
- Idioma: no hay soporte multilingüe ni procesamiento de lenguaje; las etiquetas de salida están en inglés.
- Dependencia de hardware: los artefactos preexportados QNN_DLC y TFLite están compilados para QAIRT 2.50 y chipsets Qualcomm; fuera de ese ecosistema hay que recurrir a las variantes ONNX o al checkpoint PyTorch, con rendimiento muy inferior.
- Entrada fija: la resolución de 299x299 implica remuestreo de las imágenes originales, con posible pérdida de detalle en objetos pequeños.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones de los pesos originales de `timm` y de los datos de ImageNet, cuyos términos de uso son independientes de la licencia del código.
- Adopción nula en el repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria, issues resueltos o ejemplos de terceros.
- Fecha de publicación anómala (23/09/2026, posterior a la fecha habitual de consulta); conviene contrastar con la página oficial de Qualcomm AI Hub antes de fijar la versión en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/Inception-v4
- Implementación de referencia en timm: https://huggingface.co/timm/inception_v4.tf_in1k
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/inception_v4
- Repositorio Qualcomm AI Hub Models (código de exportación de Inception-v4 v0.63.0): https://github.com/qualcomm/ai-hub-models/blob/v0.63.0/src/qai_hub_models/models/inception_v4
- README del modelo en el repositorio (rama main): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/inception_v4/README.md
- Repositorio general Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Catálogo completo de modelos de Qualcomm AI Hub: https://aihub.qualcomm.com/en-US/models
- Documentación de Inception v4 en timm: https://huggingface.co/docs/timm/en/models/inception-v4
- Paper original de Inception-v4, Inception-ResNet y conexiones residuales: https://arxiv.org/abs/1602.07261
- Artefactos preexportados (v0.63.0), ejemplos: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/inception_v4/releases/v0.63.0/inception_v4-onnx-float.zip y https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/inception_v4/releases/v0.63.0/inception_v4-qnn_dlc-w8a8.zip
