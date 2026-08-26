# Piyu12/fruit-veg-freshness-mobilenetv2

## Resumen

Piyu12/fruit-veg-freshness-mobilenetv2 es un clasificador de imágenes de frutas y verduras que distingue entre estado fresco y pasado (stale). Está desarrollado por el usuario Piyu12 y se basa en el modelo MobileNetV2 preentrenado en ImageNet, al que se le ha sustituido la cabeza de clasificación por una salida binaria de dos neuronas. El modelo se ha ajustado finamente en dos fases: primero con el backbone congelado y luego descongelando los últimos cuatro bloques con una tasa de aprendizaje baja. El dataset de entrenamiento es el conjunto público `raghavrpotdar/fresh-and-stale-images-of-fruits-and-vegetables`, que incluye seis tipos de productos: manzana, plátano, calabaza amarga, pimiento, naranja y tomate.

Aunque la arquitectura es ligera y adecuada para dispositivos con recursos limitados, el repositorio no contiene pesos publicados (tamaño del repo 0.0 GB) y el código de ejemplo carga un archivo local `freshness_mobilenetv2_state_dict.pth`, lo que sugiere que el modelo no está disponible para su descarga directa desde el Hub. Esta limitación impide su uso inmediato en producción sin que el autor publique los pesos.

La relevancia del modelo radica en su potencial para aplicaciones de control de calidad alimentaria, donde la clasificación de frescura es un paso clave. Sin embargo, al ser un proyecto pequeño y sin datos de rendimiento publicados, su utilidad práctica queda condicionada a la disponibilidad de los pesos y a una evaluación más profunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (basada en CNN) con cabeza de clasificación binaria |
| Parametros totales | no disponible (MobileNetV2 típicamente 3,4 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay archivos en el repo; el código usa un state dict local) |

## Arquitectura y entrenamiento

El modelo es una adaptación de MobileNetV2, una red neuronal convolucional diseñada para extraer características de imágenes. La capa de clasificación original (1000 clases de ImageNet) se ha reemplazado por una secuencia de Dropout (0.3) y una capa lineal con 2 salidas (fresco/podrido). El entrenamiento se realizó en dos fases: primero se congeló el backbone y se entrenó solo la cabeza, y posteriormente se descongelaron los últimos cuatro bloques del backbone con una tasa de aprendizaje baja para ajustar los pesos de forma más fina. La normalización de las imágenes se hace con los valores de media y desviación de ImageNet.

No se proporciona información sobre el número de épocas, el tamaño del dataset, la estrategia de aumento de datos o el proceso de optimización. Tampoco se detalla si se usó validación o test, ni se menciona el uso de técnicas de regularización adicionales.

## Capacidades

- Clasificación binaria de frescura: el modelo distingue entre frutas y verduras frescas y no frescas (stale).
- Acepta imágenes de tamaño 224x224 RGB.
- Entrenado específicamente con datos de seis tipos de producto: manzana, plátano, calabona amarga, pimiento, naranja y tomate.
- No soporta tool calling, agentes ni razonamiento de múltiples pasos, ya que es un modelo de visión puro.
- No tiene capacidades multilingües ni de texto.
- No incluye un modo de pensamiento o generación de texto.

## Casos de uso

- **Control de calidad en supermercados**: el modelo puede integrarse en un sistema de cámaras para clasificar automáticamente la frescura de frutas y verduras en los lineales, permitiendo detectar productos que se están degradando y retirarlos a tiempo. Su arquitectura ligera permite ejecutarse en dispositivos de bajo consumo como Raspberry Pi o cámaras embebidas.
- **Gestión de inventarios en almacenes**: en un almacén de distribución de alimentos, el modelo puede analizar imágenes de los productos antes de su envío para asegurar que solo se comercialicen aquellos en buen estado, reduciendo pérdidas por mermas.
- **Aplicación móvil de ayuda al consumidor**: una app de escaneo de alimentos que indique al usuario si una pieza de fruta está en buen estado antes de comprarla, funcionando en el teléfono sin conexión.
- **Investigación agrícola**: en estudios de postcosecha, el modelo puede clasificar muestras de frutas y verduras para evaluar la eficacia de tratamientos de conservación, comparando la frescura a lo largo del tiempo.
- **Automatización de líneas de clasificación**: en plantas de procesado, el modelo puede combinarse con una cinta transportadora para separar los productos según su frescura, sustituyendo la inspección manual.
- **Educación y demostraciones**: como ejemplo didáctico de transfer learning y clasificación de imágenes, útil en cursos de aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión, recall o F1 sobre el conjunto de validación. La model card no muestra ninguna tabla de rendimiento ni comparación con otros clasificadores de frescura.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser MobileNetV2 es un modelo pequeño (aprox. 3,4 M de parámetros) que puede correr en CPU con baja memoria (menos de 1 GB de RAM) y en GPU con menos de 1 GB de VRAM en FP32.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650) es suficiente. En CPU, puede ejecutarse en dispositivos con x86 o ARM.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo, incluso en la mayoría de las tarjetas integradas.
- **Opciones de despliegue**: puede ejecutarse con PyTorch, ONNX Runtime, TensorFlow Lite o exportarse a Core ML. No se menciona soporte para vLLM, Ollama o TGI, que son para modelos de lenguaje.
- **Latencia y throughput**: no se han publicado datos. En una CPU moderna, la inferencia de una imagen de 224x224 con MobileNetV2 suele tardar entre 10-50 ms, pero no es un dato oficial.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables específicos para la clasificación de frescura de frutas y verduras. Existen trabajos de investigación como los de MDPI y ScienceDirect que abordan el mismo problema con MobileNetV2 u otras arquitecturas, pero no se dispone de datos cuantitativos comparables para este modelo concreto.

| Modelo | Arquitectura | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|
| Piyu12/fruit-veg-freshness-mobilenetv2 | MobileNetV2 | No disponible | Apache 2.0 | No disponible (sin pesos) |
| TL-MobileNetV2 (MDPI 2023) | MobileNetV2 + cabeza personalizada | 97.2% (en reconocimiento de frutas/verduras) | No especificado | Paper, no modelo listo |
| Modelo de captraj/fruit-veg-freshness-ai | MobileNetV2 + CNN | No publicado | No especificado | Repositorio GitHub |

## Limitaciones y advertencias

- **Pesos no disponibles**: el repositorio no contiene los archivos del modelo (tamaño 0.0 GB), y el código de uso carga un state dict local que no se puede descargar desde HuggingFace. Sin los pesos, el modelo no es utilizable.
- **Sesgos del dataset**: el modelo se entrenó con un dataset específico (raghavrpotdar/fresh-and-stale-images-of-fruits-and-vegetables) que puede no representar toda la variabilidad de frutas y verduras en el mundo real. La clasificación puede fallar en condiciones de iluminación, fondo o ángulo diferentes.
- **Solo seis categorías**: aunque la salida es binaria, el entrenamiento se limita a seis tipos de productos. No se sabe si el modelo generaliza a otros tipos de frutas o verduras.
- **Riesgo de alucinación**: no aplica, al ser un modelo de clasificación sin generación de texto.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificación, pero al no estar los pesos disponibles, esa licencia no puede ejercerse.
- **Contexto y idioma**: no aplica.
- **Requisitos de producción**: falta documentación sobre el proceso de entrenamiento (épocas, tamaño de batch, optimizador) y no se ha validado en un conjunto de test independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Piyu12/fruit-veg-freshness-mobilenetv2)
- [Repositorio GitHub captraj/fruit-veg-freshness-ai](https://github.com/captraj/fruit-veg-freshness-ai) (proyecto relacionado, no el mismo modelo)
- [Artículo MDPI: Fruit and Vegetable Recognition Using MobileNetV2](https://www.mdpi.com/2673-4591/87/1/108)
- [Artículo MDPI: Fruit Image Classification Model Based on MobileNetV2 with Deep Learning](https://www.mdpi.com/2071-1050/15/3/1906)
- [Artículo ScienceDirect: Vegetable and fruit freshness detection based on deep features](https://www.sciencedirect.com/science/article/pii/S2665927123002241)
