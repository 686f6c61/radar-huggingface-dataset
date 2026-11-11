# kyjaci1/pets-convnext-sagemaker

## Resumen

`kyjaci1/pets-convnext-sagemaker` es un clasificador de imágenes de razas de perros y gatos (37 clases, 12 de gatos y 25 de perros) obtenido mediante fine-tuning de `facebook/convnext-tiny-224` sobre el dataset Oxford-IIIT Pet. Lo desarrolla el usuario kyjaci1 como demostración de un trabajo de la asignatura de Computación Distribuida, entrenado con un job de SageMaker sobre una instancia `ml.g5.xlarge` (239 segundos facturables). No es un modelo de lenguaje: es una red convolucional ConvNeXt-Tiny adaptada a una tarea de clasificación cerrada de 37 etiquetas.

El modelo parte de la arquitectura ConvNeXt-Tiny de Meta AI (27.848.581 parámetros, entrada 224x224), un diseño convolucional moderno que incorpora elementos propios de los transformers (bloques con depthwise convolution de 7x7, normalización LayerNorm, activaciones GELU y estructura de proporciones 1:1:3:1). El fine-tuning se realizó durante 5 épocas sobre 1.480 imágenes de entrenamiento y 370 de validación (split estratificado 80/20), alcanzando un 93,2 % de accuracy en validación.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de despliegue de un clasificador de imágenes en SageMaker, con pesos exportados también a ONNX y compatibilidad declarada con transformers.js, lo que permite ejecutarlo en el navegador o en endpoints gestionados. Para producción real conviene evaluar el dataset y el split, dado el tamaño reducido del conjunto de validación (370 imágenes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN con bloques tipo transformer, base `facebook/convnext-tiny-224`) |
| Parametros totales | 27.848.581 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (tarea de clasificación visual; etiquetas en inglés) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La base es ConvNeXt-Tiny, una red convolucional pura que moderniza el diseño de ResNet incorporando decisiones propias de los Vision Transformers: kernels depthwise de 7x7, LayerNorm en lugar de BatchNorm, GELU en lugar de ReLU, menos capas de activación y normalización, y un ratio de canales 1:1:3:1 por bloque. La cabeza de clasificación original de 1.000 clases de ImageNet se sustituye por una cabeza de 37 clases correspondientes a las razas del dataset Oxford-IIIT Pet.

El entrenamiento se ejecutó como un job de SageMaker (`pets-pytorch-2026-11-10-18-06-32-086`) en una instancia `ml.g5.xlarge`, con 5 épocas y 239 segundos facturables. El dataset se dividió de forma estratificada 80/20: 1.480 imágenes de entrenamiento y 370 de validación. La model card no documenta la función de pérdida, el optimizador, la tasa de aprendizaje, el tamaño de batch ni si se aplicó aumento de datos; tampoco se menciona RLHF/DPO (no aplica a clasificación) ni técnicas de decodificación especulativa. La accuracy de validación reportada es del 93,2 %.

## Capacidades

- Clasificación de imágenes en 37 clases de razas de gato y perro (12 felinas y 25 caninas), con salida de probabilidades por clase.
- Inferencia mediante `transformers.pipeline("image-classification")` en una línea de código.
- Exportación a ONNX para despliegue en runtimes nativos o en endpoints gestionados.
- Compatibilidad declarada con transformers.js, lo que permite ejecución en navegador o en entornos JavaScript.
- Integración con Amazon SageMaker (tag `sagemaker`, tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (detección, segmentación, OCR) ni audio.
- Capacidades multilingües: no aplica; las etiquetas de salida están en inglés.

## Casos de uso

- Clasificación automática de fotos de mascotas en una aplicación de adopción: el modelo asigna una de las 37 razas a cada imagen subida, lo que permite filtrar y etiquetar el catálogo sin intervención manual. Adecuado por su tamaño reducido (27,8 M de parámetros) y su latencia baja en CPU/GPU modesta.
- Demo docente de despliegue en SageMaker: reproduce de extremo a extremo un flujo de fine-tuning y endpoint gestionado (job, artefacto, inferencia) en menos de 4 minutos facturables, útil como material de clase de computación distribuida.
- Etiquetado asistido de datasets de imágenes de mascotas: pre-anotar un corpus nuevo con las 37 clases y revisar solo los casos de baja confianza, reduciendo el coste de anotación manual.
- Prototipo de búsqueda visual por raza en una app móvil o web: con la exportación ONNX o transformers.js, el modelo puede ejecutarse en el cliente sin enviar la imagen a un servidor, lo que ayuda con la privacidad.
- Filtro de contenido en plataformas de compraventa o redes sociales: detectar imágenes de perros y gatos y su raza para enrutar anuncios, moderar contenido o mejorar recomendaciones.
- Módulo de clasificación en un pipeline MLOps más amplio: al ser un modelo pequeño y con licencia CC BY-SA 4.0, se puede versionar, servir con endpoints compatibles y sustituir por una versión mejorada sin cambiar la interfaz de inferencia.
- Prueba de concepto de clasificación de imágenes en el navegador con transformers.js: validar latencia y experiencia de usuario antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy de validación (Oxford-IIIT Pet, 370 imágenes) | 93,2 % |
| Épocas de fine-tuning | 5 |
| Tiempo de entrenamiento facturable | 239 s (ml.g5.xlarge) |
| Imágenes de entrenamiento / validación | 1.480 / 370 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, top-5 accuracy, F1 por clase, comparación con otros clasificadores) en la información disponible. No se dispone de mediciones de latencia ni throughput en inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 110 MB solo para pesos (27,8 M de parámetros x 4 bytes), más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En FP16 los pesos ocupan unos 56 MB; en INT8, unos 28 MB. No se documentan variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer y en entornos sin GPU; el cuello de botella es el preprocesado de imagen, no el modelo.
- Opciones de despliegue: `transformers` con `pipeline`, ONNX Runtime, Amazon SageMaker Endpoints, transformers.js en navegador. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Accuracy reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `kyjaci1/pets-convnext-sagemaker` | 27,8 M | 224x224 | 37 razas de perro y gato | 93,2 % (validación propia, 370 imágenes) | CC BY-SA 4.0 | Hugging Face, ONNX, transformers.js |
| `facebook/convnext-tiny-224` | 28,6 M | 224x224 | 1.000 clases ImageNet | no disponible en esta ficha | CC BY-NC 4.0 (según model card original; verificar) | Hugging Face |
| ResNet-50 (ImageNet) | 25,6 M | 224x224 | 1.000 clases ImageNet | no comparable directamente (otra tarea) | varía según checkpoint | Amplia |

La comparación directa con clasificadores específicos de Oxford-IIIT Pet no está disponible en la información proporcionada. El modelo base `facebook/convnext-tiny-224` no está fine-tuneado para razas de mascotas, por lo que su accuracy en esta tarea sería previsiblemente muy inferior; no se aportan cifras.

## Limitaciones y advertencias

- El conjunto de validación es muy pequeño (370 imágenes), por lo que el 93,2 % de accuracy tiene un intervalo de confianza amplio; no debe tomarse como una estimación robusta de rendimiento en producción.
- Solo reconoce 37 razas concretas del dataset Oxford-IIIT Pet; cualquier otra raza, mestizos o imágenes fuera de dominio se asignarán a una de esas 37 clases con posible alta confianza (problema de clasificación cerrada).
- Sensible a la distribución del dataset: fotos de estudio, iluminación, encuadre y especies similares a las de Oxford-IIIT Pet. El rendimiento puede degradarse con imágenes de móvil, baja resolución u oclusiones.
- Riesgo de sesgo por raza, edad, color y contexto de las imágenes del dataset original; no se documenta ningún análisis de equidad ni evaluación por subgrupo.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. Conviene revisar también la licencia del modelo base (`facebook/convnext-tiny-224`) y del dataset (imágenes CC BY-SA 4.0).
- El modelo se publicó como demo de clase; no hay evidencia de validación externa, mantenimiento, ni soporte del autor.
- No se documentan limitaciones de idioma (no aplica) ni de contexto (no aplica).
- Para producción, se recomienda reentrenar con un split mayor, validación cruzada y evaluación por clase antes de confiar en las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyjaci1/pets-convnext-sagemaker
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Paper del dataset (Parkhi et al., CVPR 2012): https://www.robots.ox.ac.uk/~vgg/publications/2012/parkhi12a/parkhi12a.pdf
- Dataset en Hugging Face (timm/oxford-iiit-pet): https://huggingface.co/datasets/timm/oxford-iiit-pet
- Paper de ConvNeXt (Liu et al., 2022): https://arxiv.org/abs/2201.03545
- Repositorio de ConvNeXt: https://github.com/facebookresearch/ConvNeXt
