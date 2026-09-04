# ausjahk/flower-species-classifier

## Resumen

El modelo `ausjahk/flower-species-classifier` es un clasificador de imágenes especializado en la identificación de especies de flores. Toma como entrada una imagen y devuelve una etiqueta de clase correspondiente a una categoría del dataset de entrenamiento. Ha sido desarrollado por el usuario `ausjahk` mediante fine-tuning de `microsoft/resnet-18` sobre un dataset en formato `imagefolder`. No se trata de un modelo de lenguaje, por lo que no dispone de ventana de contexto ni de capacidades de generación de texto.

Arquitectónicamente, el modelo se basa en ResNet-18, una red neuronal convolucional residual de 18 capas con bloques residuales, ampliamente utilizada en tareas de visión por computador. El modelo final tiene 11.188.677 parámetros totales, un tamaño muy reducido que lo hace adecuado para inferencia en entornos con recursos limitados. El modelo se distribuye bajo licencia Apache 2.0 y cuenta con más de 11 millones de parámetros en formato `safetensors`, un tamaño de archivo que permite su despliegue en dispositivos móviles o sistemas embebidos. Su relevancia radica en que ofrece una solución ligera y de código abierto para tareas de clasificación de flora, con una precisión declarada del 91,55%.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, fine-tuned de `microsoft/resnet-18`) |
| Parametros totales | 11.188.677 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de imágenes, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplicable a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | `microsoft/resnet-18` |
| Pipeline | `image-classification` |
| Dataset de entrenamiento | `imagefolder` (composición no especificada) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de ResNet-18, una arquitectura de red neuronal convolucional con 18 capas que emplea conexiones residuales para facilitar el entrenamiento de redes profundas. ResNet-18 es una arquitectura clásica y robusta para clasificación de imágenes, con un coste computacional bajo y una precisión razonable en tareas de visión. El modelo resultante conserva la estructura de ResNet-18 pero ha sido ajustado para la clasificación de flores.

El entrenamiento se realizó con el framework Hugging Face Transformers, utilizando un dataset en formato `imagefolder`. Según la información de la model card, las hiperparamétricas de entrenamiento fueron: tasa de aprendizaje de 5e-05, tamaño de lote de 32 para entrenamiento y 8 para evaluación, optimizador AdamW con `betas=(0.9,0.999)` y scheduler lineal, durante 2 épocas. Los datos de composición del dataset (número de clases, procedencia, distribución) no están disponibles en la información proporcionada. No se indica que se haya aplicado RLHF, DPO ni ninguna técnica de alineación adicional, al tratarse de un modelo de visión por computador.

## Capacidades

- Clasificación de imágenes: el modelo predice la especie de flor a partir de una imagen de entrada, siempre que la categoría pertenezca a las clases del dataset de entrenamiento.
- Fine-tuning sobre ResNet-18: al ser una red residual ligera, ofrece un buen equilibrio entre precisión y coste computacional.
- Uso mediante la API de Hugging Face: compatible con el pipeline `image-classification` y con el framework Transformers (`AutoModelForImageClassification`).
- No es un modelo de lenguaje: no genera texto, no soporta *tool calling*, ni razonamiento multi-paso, ni agentes.
- No es multimodal: no admite entrada de texto, audio ni vídeo.
- Capacidades multilingües: no aplicables, ya que no procesa texto.

## Casos de uso

- Identificación de flores en campo mediante dispositivos móviles: el modelo, al tener solo 11,19 millones de parámetros, puede ejecutarse en smartphones o tablets para ayudar a botánicos aficionados a identificar especies de flores en tiempo real, aunque se debe validar la latencia en el hardware objetivo.
- Control de variedades en invernaderos agrícolas: permite automatizar el registro de especies de flores en cultivos comerciales, integrándose en sistemas de captura de imágenes para monitorizar la distribución de variedades.
- Digitalización de herbarios: en proyectos de digitalización de colecciones botánicas, el modelo puede etiquetar automáticamente fotografías de flores procedentes de ejemplares de herbario, agilizando la catalogación.
- Aplicaciones educativas de botánica: puede integrarse en apps escolares para que los estudiantes fotografien una flor y reciban su especie, como herramienta de aprendizaje interactivo.
- Investigación de biodiversidad: en estudios de polinizadores o flora silvestre, el modelo puede procesar imágenes procedentes de cámaras trampa o transectos fotográficos para estimar la presencia de determinadas especies.
- Jardinería automatizada: en sistemas de cuidado inteligente de jardines, el modelo puede identificar la variedad de flor antes de aplicar tratamientos específicos o ajustar condiciones de riego.
- Estilismo floral y decoración: clasificación de flores en fotografías de eventos para que los floristas puedan identificar rápidamente especies y componer arreglos, gracias a la facilidad de integración mediante la API de Hugging Face.

## Benchmarks y rendimiento

El único resultado disponible es el declarado por el autor en el `model-index` de la model card, sin verificación independiente:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Image Classification | `imagefolder` (split: train) | Accuracy | 0,9155 |

No se han publicado más resultados de benchmarks en la información disponible. El valor de precisión se presenta tal y como aparece en el `model-index`; no hay comparaciones con otros modelos ni validación externa.

## Requisitos de hardware

- El modelo tiene 11.188.677 parámetros, lo que en FP32 ocupa aproximadamente 44,8 MB y en FP16 unos 22,4 MB. Por tanto, la VRAM necesaria es mínima: cualquier GPU con más de 1 GB es suficiente.
- Se recomienda una GPU de NVIDIA de la serie GTX 16, RTX 20, RTX 30 o superior, o cualquier GPU con al menos 2 GB de VRAM para mayor margen. También es viable ejecutarlo en CPU con un rendimiento aceptable para inferencia por lotes pequeña.
- Cabe en GPU de consumo (consumer GPU) sin problema, e incluso en hardware embebido como Raspberry Pi (si se usa una versión cuantizada y optimizada).
- El despliegue puede realizarse con Hugging Face Transformers, PyTorch, ONNX Runtime, TensorFlow Lite o OpenCV dnn. Puede exportarse a formatos ligados como ONNX o TensorFlow Lite para su despliegue en dispositivos móviles.
- No se dispone de datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. Por tanto, la comparativa de rendimiento no está disponible. El modelo es un fine-tuning de `microsoft/resnet-18` sobre un dataset de flores; para contextos similares existen alternativas arquitectónicas como MobileNetV2 o EfficientNet-B0, pero no se han aportado datos que permitan una comparación numérica rigurosa.

## Limitaciones y advertencias

- El único valor de precisión declarado (0,9155) proviene del `model-index` y aparece asociado al split "train" del dataset, lo que resulta inconsistente con la mención a "evaluation set" en el texto de la model card. Esta discrepancia debe verificarse antes de confiar en el rendimiento.
- La model card está generada automáticamente (`generated_from_trainer`) y contiene campos incompletos, como "More information needed", lo que indica una documentación escasa.
- El dataset de entrenamiento es un `imagefolder` sin información sobre el número de clases, la distribución de imágenes ni el origen de los datos. Esto dificulta evaluar la cobertura de especies y la generalización a escenarios reales.
- Al tratarse de un fine-tuning de solo 2 épocas, existe riesgo de sobreajuste al dataset de entrenamiento, especialmente si el conjunto de datos es pequeño o poco variado.
- No se aporta ninguna evaluación de sesgos ni de robustez frente a variaciones de iluminación, fondo, ángulo o calidad de imagen.
- La licencia Apache 2.0 permite el uso comercial, pero el despliegue en producción es responsabilidad del desarrollador, que debe validar el modelo con su propio conjunto de pruebas.

## Enlaces

- Modelo: https://huggingface.co/ausjahk/flower-species-classifier
- Modelo base ResNet-18: https://huggingface.co/microsoft/resnet-18
