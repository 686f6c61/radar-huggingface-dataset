# ahmed-turki27/MobileNetV2_tomato_leaf

## Resumen

MobileNetV2_tomato_leaf es un modelo de visión por computador publicado en Hugging Face por el usuario ahmed-turki27. Por el identificador y la nomenclatura habitual en la comunidad, se trata de un clasificador de imágenes basado en la arquitectura MobileNetV2, afinado para la detección de enfermedades en hojas de tomate. El repositorio no incluye model card descriptiva (el README solo contiene la declaración de licencia MIT), ni pipeline declarado, ni idiomas, ni datos de entrenamiento, por lo que la información técnica disponible es mínima.

El modelo se enmarca en la categoría de clasificación de imágenes agrícolas, un nicho con demanda creciente en agricultura de precisión: diagnóstico temprano de fitopatologías a partir de fotografías tomadas con smartphone. MobileNetV2 es una elección coherente para este escenario por su bajo coste computacional y su viabilidad en dispositivos de borde, aunque el repositorio no confirma explícitamente ni el número de clases, ni el dataset, ni las métricas.

La relevancia actual del modelo es limitada: cuenta con 0 descargas y 0 likes en el momento de la consulta, sin documentación asociada, lo que impide verificar su calidad o reproducibilidad. Debe tratarse como un artefacto experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (inferida del nombre del repositorio; no confirmada en la model card) |
| Parametros totales | no disponible (MobileNetV2 estándar ronda los 3,4 M, pero no se confirma en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a un clasificador de imágenes) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se especifica en la model card) |

## Arquitectura y entrenamiento

La arquitectura es presumiblemente MobileNetV2, una red convolucional con bloques residuales invertidos y conexiones lineales de cuello de botella, diseñada originalmente para clasificación de imágenes en dispositivos móviles. No obstante, el repositorio no incluye ninguna confirmación explícita de la arquitectura, del número de clases de salida, del tamaño de entrada ni de la capa de clasificación sustituida durante el ajuste fino.

No se dispone de información sobre el dataset de entrenamiento (posiblemente variantes de PlantVillage u otros conjuntos de hojas de tomate, pero no confirmado), el número de imágenes, las técnicas de aumento de datos, la función de pérdida, el régimen de entrenamiento (épocas, learning rate, optimizador) ni si se aplicó validación cruzada. Tampoco hay evidencia de destilación, pruning o cuantización posterior.

## Capacidades

- Clasificación de imágenes de hojas de tomate (presumiblemente en categorías sanas y enfermas), aunque el número exacto de clases no está documentado.
- Inferencia ligera apta para dispositivos de borde gracias a la arquitectura MobileNetV2.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documenta visión multimodal, audio, thinking mode ni generación de texto: es un clasificador de imágenes puro.
- No se documenta detección de objetos ni segmentación; solo clasificación a nivel de imagen.

## Casos de uso

- Diagnóstico asistido en campo: el modelo podría clasificar una fotografía de hoja de tomate tomada con smartphone y devolver la clase predicha, ayudando a agricultores a identificar fitopatologías sin conexión a internet.
- Aplicación móvil de agricultura de precisión: al ser MobileNetV2, es viable integrarlo en apps Android/iOS mediante TensorFlow Lite o similar, aunque el repositorio no proporciona pesos en ese formato.
- Filtrado previo en pipelines de monitorización de cultivos: clasificación rápida de imágenes capturadas por drones o cámaras fijas para priorizar revisiones manuales.
- Investigación y docencia: como ejemplo de ajuste fino de una CNN ligera para clasificación de imágenes agrícolas, útil en cursos de deep learning aplicado.
- Prototipado de sistemas de alerta temprana: integrado en un backend que reciba imágenes y dispare notificaciones cuando se detecte una clase de enfermedad.
- Baseline para comparativas: servir de referencia inicial frente a modelos más pesados (ResNet, EfficientNet) en tareas de clasificación de hojas de tomate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja (por debajo de 1 GB) si se trata de MobileNetV2 estándar, aunque no se confirma en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo debería ejecutarse en CPU sin problema.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM; también en CPU y en dispositivos móviles.
- Opciones de despliegue: TensorFlow, TensorFlow Lite, ONNX Runtime, PyTorch (si los pesos están en ese formato), pero el repositorio no especifica framework ni formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNetV2_tomato_leaf (este) | MobileNetV2 (inferida) | no disponible | no aplica | MIT | Hugging Face, 0 descargas |
| MobileNetV2 (original, Google) | CNN con bloques residuales invertidos | ~3,4 M | no aplica | Apache 2.0 | TensorFlow Hub, Keras |
| EfficientNet-B0 | CNN con compound scaling | ~5,3 M | no aplica | Apache 2.0 | TensorFlow Hub, PyTorch |
| ResNet-50 | CNN residual | ~25,6 M | no aplica | BSD-3 | PyTorch, TensorFlow |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan dataset, clases, métricas ni proceso de entrenamiento, lo que impide evaluar su validez.
- Riesgo elevado de sobreajuste o de rendimiento pobre fuera del dominio de entrenamiento, al no conocerse la distribución de los datos.
- Sesgos desconocidos: no se puede evaluar el sesgo respecto a condiciones de iluminación, variedades de tomate, fondo de la imagen o dispositivos de captura.
- Riesgo de alucinación en sentido figurado: un clasificador puede asignar con alta confianza una clase errónea en imágenes fuera de distribución.
- Licencia MIT permite uso comercial, pero la falta de documentación hace desaconsejable su uso en producción sin validación previa.
- No se especifica el formato de pesos ni el framework, lo que complica su integración directa.
- Sin descargas ni validación comunitaria: no hay evidencia de que el modelo funcione según lo esperado.

## Enlaces

- Hugging Face: https://huggingface.co/ahmed-turki27/MobileNetV2_tomato_leaf
- Repositorio relacionado (LeafCheckAI): https://github.com/moekhalil09/leafcheck-ai
- Artículo relacionado sobre conteo de hojas de tomate: https://www.sciencedirect.com/science/article/pii/S0168169926003121
