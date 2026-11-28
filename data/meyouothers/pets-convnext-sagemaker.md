# meyouothers/pets-convnext-sagemaker

## Resumen

`pets-convnext-sagemaker` es un modelo de clasificación de imágenes derivado de `facebook/convnext-tiny-224` mediante ajuste fino supervisado sobre el conjunto de datos Oxford-IIIT Pet. Lo publica el usuario `meyouothers` como demostración docente para una asignatura de computación distribuida, empleando un trabajo de entrenamiento de Amazon SageMaker sobre una instancia `ml.g6.xlarge`. Su tarea es clasificar fotografías de perros y gatos en una de 37 razas concretas (12 de gatos, 25 de perros).

La arquitectura subyacente es ConvNeXt en su variante *tiny* con resolución de entrada 224×224, una red convolucional pura de la familia de las CNN modernizadas al estilo transformer (bloques con normalización LayerNorm, profundidad mediante convoluciones 7×7 y activaciones GELU). El modelo ajustado contiene 27.848.581 parámetros y ocupa aproximadamente 0,2 GB en el repositorio, lo que lo sitúa en el rango de modelos ligeros desplegables en CPU y en GPUs de consumo.

Es relevante ahora sobre todo como ejemplo reproducible de un flujo MLOps mínimo: entrenamiento en SageMaker, exportación a ONNX y safetensors, y compatibilidad con `transformers.js` para inferencia en navegador. No es un modelo de propósito general ni compite con los clasificadores de imágenes de gran escala; su interés es práctico y educativo, con una precisión de validación declarada del 93,2 % sobre el *split* reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (variante tiny, entrada 224×224), red convolucional |
| Parametros totales | 27.848.581 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos ONNX y safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes); etiquetas en inglés |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `facebook/convnext-tiny-224`, un ConvNeXt tiny con 28,6 M de parámetros en su forma original. ConvNeXt moderniza la CNN clásica incorporando decisiones de diseño tomadas de los Vision Transformers: parches con *stem* convolucional 4×4, bloques con LayerNorm en lugar de BatchNorm, activación GELU, convoluciones depthwise de 7×7 y una proporción de canales 4:1 en el bloque MLP invertido. El ajuste fino se realizó durante 5 épocas sobre Oxford-IIIT Pet con un *split* estratificado 80/20: 1.480 imágenes de entrenamiento y 370 de validación.

El entrenamiento se ejecutó como un SageMaker training job (`pets-pytorch-2026-11-27-21-40-04-030`) en una instancia `ml.g6.xlarge`, con 204 segundos facturables. No se documentan en la model card detalles sobre hiperparámetros (tasa de aprendizaje, optimizador, aumento de datos, congelación de capas), composición exacta del dataset más allá del recuento, ni uso de técnicas de regularización adicionales. Tampoco se indica si hubo *early stopping* o selección de *checkpoint* por métrica de validación. La model card menciona la exportación a ONNX y la compatibilidad con `transformers.js`, lo que sugiere un pipeline de conversión posterior al entrenamiento, aunque no se detalla el proceso.

## Capacidades

- Clasificación de imágenes en 37 clases de raza de perro y gato, con salida de *logits* por clase vía `pipeline("image-classification")`.
- Identificación de 12 razas felinas: Abyssinian, Bengal, Birman, Bombay, British Shorthair, Egyptian Mau, Maine Coon, Persian, Ragdoll, Russian Blue, Siamese y Sphynx.
- Identificación de 25 razas caninas: American Bulldog, American Pit Bull Terrier, Basset Hound, Beagle, Boxer, Chihuahua, English Cocker Spaniel, English Setter, German Shorthaired, Great Pyrenees, Havanese, Japanese Chin, Keeshond, Leonberger, Miniature Pinscher, Newfoundland, Pomeranian, Pug, Saint Bernard, Samoyed, Scottish Terrier, Shiba Inu, Staffordshire Bull Terrier, Wheaten Terrier y Yorkshire Terrier.
- Inferencia en navegador mediante `transformers.js` gracias a los pesos ONNX incluidos.
- Compatibilidad con *endpoints* de Hugging Face (`endpoints_compatible` en los tags).
- No soporta *tool calling*, agentes, razonamiento multi-paso, generación de texto, visión general (detección, segmentación, OCR) ni capacidades multilingües más allá de las etiquetas en inglés.

## Casos de uso

- Clasificación automática de fotos en refugios y clínicas veterinarias: el modelo asigna una raza probable a cada imagen entrante, lo que permite organizar galerías y fichas de animales con 37 categorías cerradas y una precisión de validación del 93,2 %.
- Etiquetado previo en pipelines de anotación: se usa como preanotador para que un humano revise y corrija, reduciendo el coste de etiquetar grandes volúmenes de imágenes de mascotas en proyectos de *computer vision*.
- Demostración docente de MLOps: sirve como ejemplo completo de entrenamiento en SageMaker, versionado en Hugging Face y exportación a ONNX, adecuado para asignaturas de computación distribuida o despliegue de modelos.
- Aplicación web o móvil de identificación de razas: con 0,2 GB de pesos y soporte `transformers.js`, puede ejecutarse en el navegador del cliente sin enviar la imagen a un servidor, lo que reduce latencia y preserva la privacidad.
- Filtrado y moderación de contenido en plataformas de adopción: clasificar imágenes subidas por usuarios para detectar si corresponden a perros o gatos y a qué raza, ayudando a validar anuncios.
- Prototipado rápido en endpoints serverless: al ser compatible con los *endpoints* de Hugging Face y con formato ONNX, se puede desplegar en infraestructura gestionada para pruebas de concepto con poco esfuerzo de integración.
- Base para *fine-tuning* posterior en razas locales: al ser un ConvNeXt tiny con licencia CC BY-SA 4.0, puede reentrenarse sobre un subconjunto de razas propio partiendo de estos pesos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Precisión de validación | 93,2 % | Split estratificado 80/20 de Oxford-IIIT Pet (370 imágenes) |
| Épocas de entrenamiento | 5 | SageMaker training job |
| Tiempo facturable de entrenamiento | 204 s | Instancia `ml.g6.xlarge` |
| Imágenes de entrenamiento | 1.480 | Oxford-IIIT Pet |
| Imágenes de validación | 370 | Oxford-IIIT Pet |

No se han publicado resultados de benchmarks adicionales (ImageNet, top-5, matrices de confusión por raza, F1 por clase) en la información disponible. La única métrica reportada es la precisión global de validación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 110 MB para los pesos (27,8 M de parámetros × 4 bytes) más activaciones; en la práctica, menos de 1 GB en total para lotes pequeños.
- En FP16 o INT8 la huella se reduce a decenas de MB, aunque no se documentan variantes cuantizadas oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo está sobredimensionado para ellas. Una GPU integrada o CPU moderna es suficiente para inferencia interactiva.
- Cabe holgadamente en GPUs de consumo (GTX 1650, RTX 2060 en adelante) y en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, ONNX Runtime, `transformers.js` en navegador, SageMaker Endpoints (por el tag `sagemaker`), y servidores de inferencia compatibles con ONNX. vLLM, llama.cpp, Ollama y TGI no aplican porque son *runtimes* para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `meyouothers/pets-convnext-sagemaker` | 27,8 M | Clasificación de 37 razas | Imagen 224×224 | CC BY-SA 4.0 | Hugging Face, ONNX, `transformers.js` |
| `facebook/convnext-tiny-224` | 28,6 M | Clasificación ImageNet (1.000 clases) | Imagen 224×224 | CC BY-NC 4.0 (según model card original) | Hugging Face |
| `google/vit-base-patch16-224` | 86 M | Clasificación ImageNet (1.000 clases) | Imagen 224×224 | Apache 2.0 | Hugging Face |
| `microsoft/resnet-50` | 25,6 M | Clasificación ImageNet (1.000 clases) | Imagen 224×224 | Apache 2.0 | Hugging Face |

La comparación directa con estos modelos no es del todo equivalente: los alternativos están entrenados sobre ImageNet y no sobre Oxford-IIIT Pet, por lo que sus métricas no son intercambiables. El modelo de este repositorio es más pequeño que ViT-Base y similar en tamaño a ResNet-50, pero su dominio es mucho más estrecho (37 clases frente a 1.000). La licencia CC BY-SA 4.0 impone obligaciones de compartir bajo la misma licencia las obras derivadas, a diferencia de Apache 2.0.

## Limitaciones y advertencias

- Dominio muy restringido: solo reconoce 37 razas de perro y gato; cualquier otra raza, especie o imagen fuera de dominio producirá una etiqueta forzada entre las 37 clases, sin opción de "desconocido".
- Riesgo de sobreajuste al dataset: 1.480 imágenes de entrenamiento y solo 5 épocas; no se documenta aumento de datos ni validación cruzada, por lo que la precisión del 93,2 % puede no generalizar a fotos con iluminación, fondo o ángulo distintos a los de Oxford-IIIT Pet.
- Sesgos del dataset: Oxford-IIIT Pet tiene una distribución concreta de razas y procedencia de las imágenes; razas poco representadas o variantes regionales pueden clasificarse mal.
- Etiquetas solo en inglés; no hay soporte multilingüe en la salida.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir bajo la misma licencia cualquier obra derivada, incluidos ajustes finos y pesos redistribuidos. Conviene revisar la compatibilidad con la licencia del modelo base original.
- Sin garantías de producción: el autor lo publica como demostración de clase; no hay documentación de robustez, calibración, ni evaluación por clase.
- No hay información sobre cuantización, latencia ni throughput, lo que dificulta planificar un despliegue con requisitos de rendimiento estrictos.
- El repositorio tiene 0 descargas y 0 *likes*, sin mantenimiento ni issues documentados; no hay garantía de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meyouothers/pets-convnext-sagemaker
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset Oxford-IIIT Pet (timm): https://huggingface.co/datasets/timm/oxford-iiit-pet
- Página oficial del dataset Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Paper del dataset: Parkhi et al., "Cats and Dogs", CVPR 2012
- Documentación de `transformers.js`: https://huggingface.co/docs/transformers.js
- Documentación de Amazon SageMaker para entrenamiento: https://docs.aws.amazon.com/sagemaker/
