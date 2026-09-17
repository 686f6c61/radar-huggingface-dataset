# Salaam21/csc6302-prac4-SINYANI

## Resumen

Salaam21/csc6302-prac4-SINYANI es un clasificador de imágenes resultado de una práctica académica (CSC 6302, Practical 4) consistente en el ajuste fino de MobileNetV3-Small sobre un dataset de triaje de hojas con tres clases: `light`, `healthy` y `rust` (la model card aparece parcialmente corrupta y muestra "light / healthy / ust", presumiblemente "rust"). El problema que aborda es el diagnóstico visual rápido del estado de una hoja, un caso típico de agricultura de precisión.

El modelo se publica como artefacto de un ejercicio docente, no como un modelo de producción: el repositorio ocupa 0,0 GB, acumula 0 descargas y 0 likes, y la model card se limita a listar ficheros (`model.pt`, `app.py`, `requirements.txt`) y las instrucciones para ejecutarlo en local o desplegarlo como Gradio Space. No se documentan el dataset de entrenamiento, el número de épocas, la resolución de entrada, las métricas de validación ni los hiperparámetros.

Su relevancia es, por tanto, limitada y de carácter didáctico: sirve como ejemplo mínimo de fine-tuning de una CNN ligera (aproximadamente 2,5 M de parámetros según la arquitectura base) para clasificación de imágenes en el borde (edge), con licencia MIT y pesos en formato PyTorch. Cualquier uso real requeriría reentrenamiento y validación con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN con bloques residuales invertidos, atención squeeze-and-excitation y activación h-swish) |
| Parametros totales | Aproximadamente 2,5 M (valor derivado de la arquitectura MobileNetV3-Small; no declarado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; es un clasificador de imagen. Resolución de entrada no declarada (el valor habitual de MobileNetV3-Small es 224 x 224 px) |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en precision completa (PyTorch); no se publican variantes int8, FP16 ni GGUF |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch), con los nombres de clase incluidos en el propio fichero |
| Pipeline en HuggingFace | `image-classification` |
| Libreria declarada | PyTorch |
| Clases de salida | 3: `light`, `healthy`, `rust` |
| Numero de descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB (segun los metadatos de HuggingFace) |
| Fecha de creacion / actualizacion | 2026-09-16 (fechas anomalas en los metadatos; ver limitaciones) |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV3-Small, una red neuronal convolucional disenada para inferencia eficiente en dispositivos con recursos limitados. Combina bloques residuales invertidos con convoluciones separables en profundidad, módulos de squeeze-and-excitation en parte de las etapas y funciones de activación h-swish, lo que reduce el coste computacional manteniendo una capacidad de representación razonable para tareas de clasificación. Sobre esta base se ha realizado un ajuste fino (fine-tuning) para tres clases de estado foliar, sustituyendo presumiblemente la cabeza clasificadora original de ImageNet por una capa de 3 salidas.

No hay información disponible sobre el proceso de entrenamiento: se desconoce el dataset utilizado (número de imágenes, procedencia, especie vegetal, condiciones de captura), si hubo aumento de datos, el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de lote, la resolución de entrada o si se aplicaron técnicas de regularización. Tampoco se documenta ningún tipo de ajuste por preferencias humanas (RLHF, DPO) ni innovación técnica adicional, algo esperable en un clasificador de imagen y en un trabajo de prácticas. La model card tampoco incluye una matriz de confusión ni métricas de precisión, exhaustividad o F1 por clase.

## Capacidades

- Clasificación de imágenes en tres categorías discretas de estado de hoja: `light`, `healthy` y `rust`.
- Salida de probabilidades por clase, lo que permite construir un ranking top-3 (así lo hace la aplicación Gradio incluida, mediante `gr.Label`).
- Inferencia en CPU: el tamaño del modelo (aproximadamente 10 MB en FP32) permite ejecutarlo sin GPU.
- Integración sencilla en Python mediante PyTorch o exportación a TorchScript / ONNX (no se incluyen scripts de exportación, pero es factible).
- Inclusión de los nombres de clase dentro del fichero de pesos, lo que simplifica el despliegue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades más allá de la clasificación de imágenes.

## Casos de uso

- Triaje de hojas en campo desde el móvil: el modelo puede clasificar una fotografía tomada con un teléfono en una de las tres categorías y devolver una probabilidad, sirviendo como primer filtro para el agricultor antes de consultar a un especialista. Es adecuado por su tamaño reducido y su capacidad de ejecución en CPU.
- Aplicación web de demostración con Gradio: el repositorio incluye `app.py`, que muestra la predicción top-3; es directamente utilizable como demo docente o como Space en HuggingFace una vez resuelto el requisito de cuenta PRO para Spaces Gradio.
- Prototipo educativo de visión por computador: sirve como ejemplo reproducible del flujo completo de fine-tuning de una CNN ligera y despliegue con Gradio en un curso de aprendizaje automático.
- Etiquetado asistido (active learning): puede preanotar lotes de imágenes de hojas para que un experto solo revise o corrija las predicciones de baja confianza, reduciendo el coste de anotación de un dataset mayor.
- Prefiltrado en pipelines de imágenes aéreas o de dron: en un flujo que capture muchas imágenes de cultivo, el modelo puede descartar rápidamente las hojas sanas y derivar solo las sospechosas a un modelo o a un revisor humano.
- Despliegue en hardware de borde: al ocupar aproximadamente 10 MB en FP32, cabe en una Raspberry Pi o en un dispositivo IoT con cámara, por ejemplo en trampas o estaciones de monitorización de cultivos.
- Enrutamiento o priorización de casos: en una aplicación de asesoría agronómica, la salida del clasificador puede usarse para ordenar las consultas por urgencia según la probabilidad de la clase `rust`.

Advertencia: ninguno de estos casos debería implementarse en producción sin reentrenar y validar el modelo con datos representativos del cultivo y de las condiciones de captura reales, dado que no se publican métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye accuracy, F1, matriz de confusión ni comparación con líneas base, y la búsqueda web realizada no ha devuelto ninguna evaluación del modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. Con aproximadamente 2,5 M de parámetros, los pesos en FP32 ocupan alrededor de 10 MB; en FP16, unos 5 MB; en int8 (cuantización dinámica de PyTorch), unos 2,5 MB.
- GPU recomendadas: cualquier GPU sirve; el modelo no requiere aceleración. En la práctica, CPU es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, incluso en iGPU y en aceleradores integrados. También se ejecuta en CPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: PyTorch nativo (script `app.py` con Gradio), exportación a TorchScript u ONNX Runtime, o TorchServe. No se publican ficheros GGUF, por lo que llama.cpp, Ollama y motores de inferencia de LLM no son aplicables.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este modelo; en cualquier caso, para una CNN de este tamaño la inferencia por imagen en CPU moderna se sitúa típicamente en el rango de milisegundos a decenas de milisegundos, pero no se ha verificado con este artefacto.
- Requisitos de despliegue en HuggingFace: la propia model card indica que la creación de un Gradio Space en el plan gratuito devuelve error 402 Payment Required, por lo que la demo pública requiere cuenta PRO o desbloqueo educativo.

## Comparativa con modelos similares

La comparativa se establece con arquitecturas de clasificación de imagen de tamaño comparable, dado que no existen evaluaciones publicadas de este fine-tune concreto. Los valores de parámetros y de precisión top-1 corresponden a las arquitecturas base sobre ImageNet y no a este modelo.

| Modelo | Parametros | Entrada tipica | Top-1 ImageNet (referencia de la arquitectura base) | Licencia de la arquitectura | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MobileNetV3-Small ajustado) | Aproximadamente 2,5 M | No declarada (habitual 224 x 224) | No disponible para este fine-tune | MIT (pesos publicados) | HuggingFace, 0 descargas |
| MobileNetV3-Small (base, sin ajustar) | Aproximadamente 2,5 M | 224 x 224 | Aproximadamente 67,7 % | Apache 2.0 / MIT segun implementacion | Ampliamente disponible (torchvision, timm) |
| MobileNetV2 1.0 | Aproximadamente 3,4 M | 224 x 224 | Aproximadamente 72,0 % | Apache 2.0 | Ampliamente disponible |
| EfficientNet-B0 | Aproximadamente 5,3 M | 224 x 224 | Aproximadamente 77,1 % | Apache 2.0 | Ampliamente disponible |
| ResNet-18 | Aproximadamente 11,7 M | 224 x 224 | Aproximadamente 69,8 % | BSD-3 / MIT segun implementacion | Ampliamente disponible |

En terminos de la tarea concreta (triaje de hojas en tres clases) no se dispone de modelos comparables publicados en la información consultada. Un modelo alternativo razonable para la misma tarea sería MobileNetV2 o EfficientNet-B0, con mayor precisión potencial pero también mayor coste de inferencia, o un ViT-B/32, que exigiría muchos más datos de ajuste fino y más recursos.

## Limitaciones y advertencias

- Ausencia total de métricas: no se publica accuracy, F1, matriz de confusión ni partición de validación, por lo que se desconoce si el modelo funciona correctamente incluso en su tarea prevista.
- Dataset desconocido: no se especifica la especie vegetal, el número de imágenes, el origen ni las condiciones de captura, lo que impide evaluar la generalización a otros cultivos, iluminaciones o cámaras.
- Riesgo de sesgo hacia el dominio de entrenamiento: un modelo de este tipo suele degradarse ante cambios de fondo, resolución, balance de blancos o variedades de hoja no vistas.
- Riesgo de sobreajuste: dado el tamaño del conjunto de prácticas y la ausencia de información sobre aumento de datos, es plausible que el modelo memorice el conjunto de entrenamiento.
- Ambigüedad de las clases: la clase `light` no queda definida en la documentación; sin una descripción operativa, la frontera con `healthy` y con estados intermedios de `rust` es indeterminada.
- Riesgo de alucinación en sentido estricto no aplica (no es un modelo generativo), pero existe el riesgo análogo de predicciones confiadas y erróneas. No debe usarse como único criterio para decisiones agronómicas.
- Sin información sobre idioma porque no procesa texto.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. Es la parte más favorable de la ficha, pero la licencia no cubre los posibles derechos del dataset de entrenamiento, que no se documenta.
- Sin validación por la comunidad: 0 descargas y 0 likes; no hay issues, informes de terceros ni reproducciones independientes.
- El repositorio figura con un tamaño de 0,0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que los metadatos no se han actualizado. Conviene verificar la descarga del fichero `model.pt` antes de depender de él.
- Fechas de creación y actualización registradas en 2026, posteriores a la fecha de consulta habitual; se trata de un error de metadatos o de un reloj mal configurado, no de un dato fiable.
- El texto de la model card aparece parcialmente corrupto (por ejemplo, "light / healthy / ust" y "equirements.txt"), lo que sugiere un problema de codificación en la publicación. No hay que interpretarlo como documentación fiable.
- El despliegue como Space en el plan gratuito de HuggingFace falla con error 402, según reconoce el propio autor; la demo pública depende de una cuenta PRO o de un desbloqueo educativo.
- Para cualquier uso en producción se requiere reentrenamiento con datos propios, validación cruzada, calibración de umbrales de confianza y monitorización de la deriva de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Salaam21/csc6302-prac4-SINYANI
- Space propuesto por el autor (no verificado como activo): https://huggingface.co/spaces/Salaam21/csc6302-prac4-SINYANI
- Referencia de la arquitectura base, no incluida en la búsqueda web realizada: artículo "Searching for MobileNetV3", https://arxiv.org/abs/1905.02244
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo; los resultados obtenidos correspondían a perfiles de LinkedIn de personas sin relación con el proyecto. No se dispone de paper, blog, repositorio adicional ni demo asociados.
