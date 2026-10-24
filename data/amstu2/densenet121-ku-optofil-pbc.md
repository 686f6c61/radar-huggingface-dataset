# amstu2/densenet121-ku-optofil-pbc

## Resumen

`amstu2/densenet121-ku-optofil-pbc` es un checkpoint publicado en HuggingFace por el usuario `amstu2` cuya arquitectura, a tenor del identificador y de la documentación de torchvision, corresponde a una DenseNet-121: una red neuronal convolucional con conexiones densas entre capas, publicada originalmente en el artículo "Densely Connected Convolutional Networks" (Huang et al., 2017). La model card del repositorio está vacía —solo contiene la declaración de licencia `apache-2.0`—, no hay `pipeline_tag` asignado y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

El problema que resuelve no está documentado. El sufijo `ku-optofil-pbc` sugiere un ajuste fino sobre un dominio concreto (posiblemente relacionado con optometría u oftalmología, por el fragmento "optofil"), pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor. No hay información sobre el conjunto de datos de entrenamiento, las clases de salida, el preprocesado esperado ni métricas de evaluación.

Su relevancia actual es, por tanto, limitada y de naturaleza exploratoria: sirve como ejemplo de reutilización de un backbone convolucional ligero (~8 M de parámetros) para tareas de clasificación de imagen, pero carece de la documentación mínima exigible para un uso en producción. Cualquier evaluación seria del modelo requiere inspeccionar los pesos y el código de inferencia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN con conexiones densas, 4 bloques densos y capas de transición) |
| Parametros totales | ~7,98 M para la arquitectura base DenseNet-121 de torchvision; no confirmado para este checkpoint |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin ventana de texto) |
| Resolución de entrada | no disponible; la implementación de referencia admite entradas desde 29x29 px, pero el preprocesado de este checkpoint no está documentado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible en la información proporcionada |
| Tarea declarada en el Hub | no disponible (sin `pipeline_tag`) |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-24 (sin actualizaciones posteriores) |

## Arquitectura y entrenamiento

La familia DenseNet, descrita en "Densely Connected Convolutional Networks" (Huang et al., 2017), se caracteriza porque cada capa recibe como entrada las salidas de todas las capas anteriores dentro de un mismo bloque denso, concatenadas por canal. La variante de 121 capas organiza la red en cuatro bloques densos separados por capas de transición (convolución 1x1 más *average pooling*), emplea cuellos de botella 1x1 antes de cada convolución 3x3 y una tasa de crecimiento de 32 canales por capa, lo que resulta en aproximadamente 8 millones de parámetros. Esta conectividad densa reduce el número de parámetros frente a ResNet manteniendo capacidad de representación, a costa de un mayor consumo de memoria de activaciones durante el entrenamiento.

Respecto al entrenamiento de este checkpoint concreto no hay ningún dato disponible: se desconoce el dataset, el número de imágenes o tokens vistos, si partió de pesos preentrenados en ImageNet, si hubo aumento de datos, balanceo de clases, optimizador, número de épocas o técnicas de ajuste (fine-tuning completo frente a congelación del backbone). Tampoco se documenta si se aplicó alguna forma de regularización, destilación o calibración posterior. La única información verificable es la licencia Apache 2.0 y la etiqueta `region: us`.

## Capacidades

- Clasificación de imágenes: es la capacidad esperable de un backbone DenseNet-121, pero las clases concretas de salida no están documentadas.
- Extracción de características visuales: el modelo puede reutilizarse como extractor de *embeddings* intermedios, aunque no se especifica en qué capa ni con qué dimensionalidad.
- Inferencia en CPU y dispositivos de baja potencia: por tamaño (~8 M de parámetros) es viable en entornos sin GPU.
- No se ha documentado soporte de *tool calling*, *function calling* ni uso como agente.
- No dispone de razonamiento multi-paso, generación de texto, código ni matemáticas: no es un modelo de lenguaje.
- No hay capacidades multilingües ni de audio, vídeo o modalidad mixta declaradas.
- No se ha documentado ningún modo especial (thinking, visión-lenguaje, detección, segmentación).

## Casos de uso

- Validación de pipelines de clasificación de imagen: usar el checkpoint como prueba de extremo a extremo en un *pipeline* de preprocesado, inferencia y postprocesado antes de integrar un modelo documentado; su reducido tamaño permite iterar rápido en CI.
- Extracción de características para búsqueda visual: congelar el backbone y generar *embeddings* para un sistema de similitud o recuperación de imágenes, verificando previamente la capa de salida adecuada.
- Prototipado de clasificación en dominio especializado: si el sufijo del nombre refleja un ajuste en un dominio concreto (no confirmado), podría emplearse como punto de partida para experimentos, siempre reentrenando y validando con datos propios.
- Inferencia en el borde: desplegar el modelo en dispositivos con poca memoria (Raspberry Pi, mini-PC, móvil) para tareas de filtrado o triaje preliminar en local, dado su tamaño de decenas de MB.
- Docencia y experimentación con arquitecturas densas: analizar el flujo de activaciones, el ahorro de parámetros frente a ResNet o el efecto de las capas de transición en un entorno controlado.
- *Benchmark* interno de latencia: comparar el coste de inferencia de DenseNet-121 frente a otras CNN en el *hardware* objetivo antes de decidir la arquitectura final.
- Filtrado previo en lotes masivos de imágenes: descartar automáticamente imágenes no relevantes en un *pipeline* de datos, recalibrando el umbral de decisión con un conjunto de validación propio.

En todos los casos es imprescindible verificar primero las clases de salida y el preprocesado, ausentes en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, matriz de confusión ni comparaciones con otros modelos, y el repositorio no tiene `pipeline_tag` que permita inferir la tarea evaluada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32; el peso de los parámetros ronda los 32 MB (FP32), 16 MB (FP16) y 8 MB (INT8), a lo que se suma la memoria de activaciones según el tamaño del lote y la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este modelo y solo se justifican por agregación de lote.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (GTX 1050 en adelante) e incluso en iGPU; también en CPU, Raspberry Pi 4/5 y dispositivos móviles vía ONNX Runtime.
- Opciones de despliegue: PyTorch nativo, exportación a TorchScript, ONNX Runtime, TensorRT, OpenVINO o NCNN. El formato de pesos del repositorio no está documentado, por lo que la ruta de exportación debe confirmarse tras inspeccionar los archivos.
- Latencia y throughput: no disponibles. Para una CNN de ~8 M de parámetros a 224x224 se espera latencia del orden de milisegundos por imagen en GPU moderna, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

Los valores de la arquitectura base proceden de la documentación de torchvision y no han sido verificados para este checkpoint; el rendimiento del ajuste fino es desconocido en todos los casos.

| Modelo | Parametros | Contexto | Top-1 ImageNet (referencia base) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| densenet121-ku-optofil-pbc | ~7,98 M | no aplica | no disponible | apache-2.0 | HuggingFace, sin documentación |
| DenseNet-121 (torchvision) | ~7,98 M | no aplica | ~74,4 % | BSD-3-Clause | torchvision, documentado |
| ResNet-50 (torchvision) | ~25,6 M | no aplica | ~76,1 % | BSD-3-Clause | torchvision, documentado |
| EfficientNet-B0 (torchvision) | ~5,3 M | no aplica | ~77,7 % | BSD-3-Clause | torchvision, documentado |
| MobileNetV3-Large (torchvision) | ~5,4 M | no aplica | ~74,0 % | BSD-3-Clause | torchvision, documentado |

Frente a ResNet-50, DenseNet-121 ofrece menos parámetros y una precisión de referencia algo inferior en ImageNet; frente a EfficientNet-B0 y MobileNetV3-Large, la competencia en eficiencia es desfavorable en el estado del arte actual, aunque DenseNet sigue siendo una opción sólida como extractor de características por su reutilización de rasgos.

## Limitaciones y advertencias

- La model card está vacía: no se documentan la tarea, las clases de salida, el preprocesado, el esquema de normalización ni el origen de los datos.
- No existen métricas de evaluación publicadas; se desconoce la precisión real del checkpoint y si supera o no a un modelo aleatorio en su dominio.
- El repositorio tiene 0 descargas y 0 likes, sin señales de revisión por parte de la comunidad.
- El nombre del modelo sugiere un dominio aplicado (posiblemente sanitario u optométrico), pero no hay confirmación; si el uso previsto es clínico, el modelo no está validado como producto sanitario y no debe emplearse para decision clínica.
- No aplica el riesgo de alucinación textual, pero sí el de falsos positivos y falsos negativos con umbrales no calibrados.
- Los sesgos son desconocidos al no conocerse la distribución del conjunto de entrenamiento; podrían aparecer sesgos demográficos o de adquisición de imagen.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se ofrece sin garantías; conviene conservar el aviso de licencia y verificar que el autor tenga derechos sobre los datos de entrenamiento.
- No soporta texto, herramientas ni agentes: cualquier caso de uso conversacional exige otro modelo.
- La fecha de creación registrada (2026-10-24) resulta atípica; conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amstu2/densenet121-ku-optofil-pbc
- Documentación de `torchvision.models.densenet121`: https://docs.pytorch.org/vision/master/models/generated/torchvision.models.densenet121.html
- Código fuente de la familia DenseNet en torchvision: https://github.com/pytorch/vision/blob/master/torchvision/models/densenet.py
- Documentación del módulo `torchvision.models.densenet`: https://docs.pytorch.org/vision/0.9/_modules/torchvision/models/densenet.html
- Referencia alternativa de la API: https://brianjo.github.io/vision/stable/generated/torchvision.models.densenet121.html
- Modelo relacionado en el Hub (DenseNet-121 para radiografía de tórax): https://huggingface.co/torchxrayvision/densenet121-res224-all
- Artículo original "Densely Connected Convolutional Networks" (Huang et al., 2017): https://arxiv.org/abs/1608.06993
