# saiadh57/pets-convnext-sagemaker

## Resumen

El modelo `saiadh57/pets-convnext-sagemaker` es un clasificador de imágenes especializado en la identificación de 37 razas de perros y gatos. Se trata de un ajuste fino (fine-tuning) del modelo base `facebook/convnext-tiny-224`, una red neuronal convolucional de la familia ConvNeXt desarrollada por Meta AI Research, adaptada específicamente sobre el conjunto de datos Oxford-IIIT Pet. El autor, identificado como `saiadh57`, lo entrenó como demostración para una clase de Computación Distribuida, utilizando un trabajo de entrenamiento de Amazon SageMaker sobre una instancia `ml.g6.xlarge`.

El modelo resuelve una tarea acotada de clasificación de imágenes de dominio específico: distinguir entre 12 razas de gato y 25 razas de perro. No es un modelo generativo ni un modelo de lenguaje; es un clasificador discriminativo puro que devuelve una distribución de probabilidad sobre las 37 clases. Con 27,8 millones de parámetros, es un modelo compacto orientado a despliegues ligeros, con versiones exportadas a ONNX y compatibilidad declarada con Transformers.js y endpoints de SageMaker.

Su relevancia es limitada fuera del ámbito educativo y de demostración: se publica con 0 descargas y 0 likes, y su interés principal radica en servir como ejemplo reproducible de un pipeline completo de entrenamiento en SageMaker, exportación a múltiples formatos y despliegue en el ecosistema Hugging Face. La precisión de validación reportada por el autor es del 93,2% sobre 370 imágenes de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt (red neuronal convolucional pura, estilo transformer) |
| Parámetros totales | 27.848.581 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantización | no disponible (se distribuyen safetensors y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en ConvNeXt-Tiny, una arquitectura convolucional presentada en el artículo "A ConvNeXt for the 2020s" (Liu et al., 2022), que moderniza la ResNet incorporando elementos propios de los transformers de visión: kernels de convolución de mayor tamaño (7x7), normalización por capas en lugar de batch norm, activación GELU y una estructura de bloques con proporción invertida. El modelo base `facebook/convnext-tiny-224` se preentrenó sobre ImageNet-1k y aquí se ajusta sobre Oxford-IIIT Pet.

El ajuste fino se realizó durante 5 épocas sobre un total de 1.480 imágenes de entrenamiento y 370 de validación, con una partición estratificada 80/20. El entrenamiento se ejecutó en un trabajo de SageMaker (`pets-pytorch-2026-11-10-18-15-53-005`) sobre una instancia `ml.g6.xlarge`, con 214 segundos facturables. No se detallan en la información disponible la tasa de aprendizaje, el optimizador, el tamaño de lote ni si se aplicaron técnicas de aumento de datos o regularización más allá de lo implícito en el ajuste fino estándar. Tampoco se especifica si hubo congelación de capas o ajuste completo del modelo.

La innovación técnica destacable no está en el modelo en sí, sino en el pipeline: exportación a ONNX y safetensors, compatibilidad con Transformers.js para inferencia en el navegador y preparación para despliegue en SageMaker endpoints. No se mencionan técnicas como decodificación especulativa, atención lineal ni mecanismos de razonamiento, que no aplican a un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes en 37 clases: 12 razas de gato (Abyssinian, Bengal, Birman, Bombay, British Shorthair, Egyptian Mau, Maine Coon, Persian, Ragdoll, Russian Blue, Siamese, Sphynx) y 25 razas de perro (American Bulldog, American Pit Bull Terrier, Basset Hound, Beagle, Boxer, Chihuahua, English Cocker Spaniel, English Setter, German Shorthaired, Great Pyrenees, Havanese, Japanese Chin, Keeshond, Leonberger, Miniature Pinscher, Newfoundland, Pomeranian, Pug, Saint Bernard, Samoyed, Scottish Terrier, Shiba Inu, Staffordshire Bull Terrier, Wheaten Terrier, Yorkshire Terrier).
- Inferencia mediante `pipeline("image-classification")` de la librería Transformers.
- Exportación a ONNX para despliegue en entornos con runtime ONNX.
- Compatibilidad declarada con Transformers.js, lo que permite ejecución en navegador o en Node.js.
- Compatibilidad con endpoints de SageMaker (etiqueta `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general más allá de la clasificación, audio ni modo thinking. Es un clasificador cerrado de dominio específico.

## Casos de uso

- Clasificación automática de razas en aplicaciones de adopción de mascotas: el modelo puede etiquetar fotos subidas por refugios o usuarios para facilitar la búsqueda por raza, con una precisión de validación del 93,2% sobre el conjunto Oxford-IIIT Pet.
- Moderación y organización de galerías fotográficas: indexación automática de imágenes de mascotas en bibliotecas personales o plataformas de contenido, asignando una de las 37 etiquetas para filtrado y búsqueda.
- Demostración educativa de pipelines MLOps: sirve como ejemplo completo de entrenamiento en SageMaker, exportación a ONNX y safetensors y publicación en Hugging Face, adecuado para cursos de computación distribuida o ingeniería de ML.
- Prueba de concepto de inferencia en navegador: gracias a la compatibilidad con Transformers.js y al formato ONNX, puede integrarse en una aplicación web que clasifique fotos de mascotas del lado del cliente sin enviar imágenes a un servidor.
- Prototipado rápido de clasificadores de imagen de dominio específico: el flujo (fine-tuning de ConvNeXt-Tiny sobre un dataset pequeño, 1.480 imágenes, 5 épocas, 214 segundos en `ml.g6.xlarge`) es replicable para otras tareas de clasificación con pocos datos.
- Validación de despliegues en SageMaker: la etiqueta `endpoints_compatible` permite usarlo como banco de pruebas para verificar configuraciones de endpoints, latencia y escalado en AWS antes de desplegar modelos mayores.
- Filtro previo en sistemas de identificación de mascotas perdidas: como clasificador de raza rápido y ligero, puede actuar como primera etapa antes de un modelo de reidentificación individual más costoso.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Precisión de validación | 93,2% | Oxford-IIIT Pet (370 imágenes) |
| Épocas de entrenamiento | 5 | — |
| Imágenes de entrenamiento | 1.480 | Oxford-IIIT Pet |
| Imágenes de validación | 370 | Oxford-IIIT Pet |
| Tiempo de entrenamiento facturable | 214 segundos | SageMaker `ml.g6.xlarge` |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos sobre el mismo conjunto. Los benchmarks de lenguaje no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para los 27,8 millones de parámetros (aproximadamente 111 MB de pesos), más el overhead de activaciones para una imagen de 224x224, que es mínimo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece holgura. Para entrenamiento, el autor usó una instancia `ml.g6.xlarge` (GPU NVIDIA L4).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers con `pipeline`, ONNX Runtime, Transformers.js, SageMaker endpoints. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saiadh57/pets-convnext-sagemaker | 27,8 M | Clasificación 37 razas | Imagen 224x224 | CC BY-SA 4.0 | Hugging Face, 0 descargas |
| facebook/convnext-tiny-224 | 28,6 M | Clasificación ImageNet-1k (1000 clases) | Imagen 224x224 | CC BY-NC 4.0 (según model card original) | Hugging Face, ampliamente usado |
| google/vit-base-patch16-224 | 86 M | Clasificación ImageNet-1k | Imagen 224x224 | Apache 2.0 | Hugging Face, ampliamente usado |
| timm/convnext_tiny.fb_in22k | 28,6 M | Clasificación ImageNet-22k | Imagen 224x224 | Apache 2.0 (según timm) | Hugging Face / timm |

La comparación directa con alternativas específicas para Oxford-IIIT Pet no está disponible en la información proporcionada. Los modelos de la tabla son referencias de la misma familia o categoría, no necesariamente entrenados en la misma tarea. El modelo aquí descrito es el único de la comparativa especializado en las 37 razas de Oxford-IIIT Pet.

## Limitaciones y advertencias

- Dominio cerrado: solo clasifica las 37 razas de Oxford-IIIT Pet; cualquier imagen de otra raza, especie o sujeto se asignará forzosamente a una de esas 37 clases, con riesgo de predicciones erróneas pero confiadas.
- Riesgo de sesgo del dataset: Oxford-IIIT Pet contiene imágenes principalmente de mascotas domésticas en condiciones controladas; el rendimiento puede degradarse con fotos de baja calidad, iluminación adversa, oclusiones o razas poco representadas.
- Precisión reportada sin validación independiente: el 93,2% proviene de una única partición de validación de 370 imágenes, sin intervalo de confianza ni evaluación en un conjunto de test separado.
- Sin información sobre calibración: no se reportan métricas como F1 por clase, matriz de confusión ni calibración de probabilidades, lo que limita la evaluación de fiabilidad en producción.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; esto puede ser restrictivo para productos propietarios que no quieran liberar sus adaptaciones. Además, el modelo base `facebook/convnext-tiny-224` tiene su propia licencia (CC BY-NC 4.0 según su model card original), lo que puede imponer restricciones adicionales de uso no comercial que conviene verificar.
- Sin soporte multilingüe ni de texto: no procesa lenguaje natural, por lo que no puede usarse para tareas de NLP.
- Modelo de demostración: publicado como ejercicio de clase, con 0 descargas y sin mantenimiento declarado; no hay garantías de soporte, actualizaciones ni corrección de errores.
- Sin datos sobre robustez adversarial, comportamiento con imágenes sintéticas o rendimiento en dominios distintos al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saiadh57/pets-convnext-sagemaker
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset Oxford-IIIT Pet (página oficial): https://www.robots.ox.ac.uk/~vgg/data/pets/
- Dataset en Hugging Face: https://huggingface.co/datasets/timm/oxford-iiit-pet
- Artículo de ConvNeXt (Liu et al., 2022): no disponible en la información proporcionada
- Artículo de Oxford-IIIT Pet (Parkhi et al., "Cats and Dogs", CVPR 2012): no disponible enlace directo en la información proporcionada
- Repositorio o demo adicional: no disponible
