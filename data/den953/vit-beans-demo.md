# Den953/vit-beans-demo

## Resumen

Den953/vit-beans-demo es un modelo de clasificación de imágenes basado en Vision Transformer (ViT), desarrollado por Den953 como parte de un laboratorio del curso MLOps M2. Se trata de un fine-tuning del modelo google/vit-base-patch16-224-in21k sobre el dataset AI-Lab-Makerere/beans, compuesto por fotografías de hojas de frijol. El objetivo es distinguir tres categorías: angular leaf spot (mancha angular), bean rust (roya) y hojas sanas. El modelo alcanza una precisión de 0.9609 en el conjunto de test con 128 imágenes.

Con 85.800.963 parámetros y un tamaño de repositorio de 0.8 GB, es un modelo ligero que puede ejecutarse en CPU o GPU. Incluye una versión ONNX para inferencia sin PyTorch. Aunque su rendimiento es notable en el dataset beans, su alcance es limitado: fue entrenado con aproximadamente 1.000 imágenes de una sola especie en condiciones de campo específicas de Uganda. Es un ejemplo didáctico de fine-tuning de ViT y no está diseñado para uso real como herramienta de diagnóstico agrícola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | 85.800.963 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Vision Transformer (ViT), concretamente en la variante google/vit-base-patch16-224-in21k, que procesa imágenes de 224x224 píxeles divididas en parches de 16x16. El fine-tuning se realizó sobre el dataset AI-Lab-Makerere/beans, con un total de 1.034 imágenes de entrenamiento y 128 de test. Se emplearon 2 épocas, un learning rate de 5e-5, batch size de 16 y el optimizador AdamW. Como técnica de aumento de datos se utilizó RandomResizedCrop(224) en entrenamiento y Resize más CenterCrop en evaluación. El entrenamiento se llevó a cabo en CPU (AMD Ryzen, 12 hilos), lo que motivó una reducción del número de épocas. No se aplicaron técnicas de RLHF, DPO ni otras innovaciones; es un fine-tuning estándar de un modelo preentrenado.

## Capacidades

- Clasificación de imágenes en tres categorías: angular leaf spot, bean rust y healthy.
- Inferencia mediante el pipeline image-classification de transformers.
- Incluye una versión ONNX en onnx/model.onnx para ejecución fuera de PyTorch.
- No soporta tool calling, razonamiento multi-step, generación de texto ni entrada multimodal.
- Es un modelo monomodal (solo visión) y no admite lenguaje natural.

## Casos de uso

- Detección temprana de enfermedades en cultivos de frijol: el modelo puede clasificar fotografías de hojas tomadas en campo para ayudar a identificar mancha angular o roya, permitiendo una intervención rápida. Es adecuado por su ligereza y facilidad de integración.
- Prototipo de aplicación móvil para agricultores: gracias a su versión ONNX, puede integrarse en apps o dispositivos con recursos limitados, ofreciendo un primer diagnóstico in situ.
- Herramienta didáctica en cursos de visión artificial: sirve como ejemplo de fine-tuning de ViT con un dataset pequeño, ideal para enseñar el flujo de trabajo de Hugging Face.
- Automatización de inspección en laboratorios agrícolas: permite procesar lotes de imágenes de hojas y clasificarlas automáticamente, reduciendo el tiempo de análisis manual.
- Integración en pipelines de monitoreo de cultivos: puede combinarse con sistemas de captura de imágenes para generar alertas cuando se detecten hojas enfermas.
- Demo interactiva en Hugging Face Spaces: el autor proporciona un Space para probar el modelo en línea, útil para demostraciones rápidas a interesados.

## Benchmarks y rendimiento

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Image Classification | AI-Lab-Makerere/beans | test | Accuracy | 0.9609 |
| Image Classification | AI-Lab-Makerere/beans | test | Loss | 0.1792 |

Nota: los resultados son los declarados por el autor en la model card, no verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85.8M parámetros en FP32, los pesos ocupan aproximadamente 0.8 GB; en la práctica se recomienda entre 1 y 2 GB de VRAM para inferencia con overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. También puede ejecutarse en CPU sin problemas.
- Sí cabe en GPU de consumo: es un modelo pequeño, compatible con GPUs de gama baja.
- Opciones de despliegue: Hugging Face pipeline, ONNX Runtime, Hugging Face Inference Endpoints (el modelo tiene la etiqueta endpoints_compatible). No es compatible con vLLM o TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Accuracy (beans test) | Licencia |
|---|---|---|---|---|
| Den953/vit-beans-demo | google/vit-base-patch16-224-in21k | 85.800.963 | 0.9609 | Apache-2.0 |
| ezzats/vit-beans-demo | google/vit-base-patch16-224-in21k | no disponible | no disponible | no disponible |
| Developer9215/vit-base-beans-demo-v5 | google/vit-base-patch16-224-in21k | no disponible | 0.9609 | no disponible |

Nota: los modelos comparables se han identificado en la búsqueda web, pero no se dispone de especificaciones completas. El modelo Developer9215 declara una accuracy de 0.9609 en el conjunto de evaluación, pero se desconoce si es el mismo split.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeño (~1.000 imágenes) y corresponde a una sola especie de frijol, con condiciones de campo específicas de Uganda.
- El modelo no ha sido evaluado en otras especies, otras enfermedades ni en fotografías con calidades o iluminaciones muy diferentes.
- No debe utilizarse como herramienta de diagnóstico agrícola real sin una validación adicional y pruebas en campo.
- El entrenamiento se realizó en CPU con solo 2 épocas, lo que puede limitar el rendimiento en comparación con un fine-tuning más prolongado.
- Los resultados de precisión se basan en un único split de test de 128 imágenes, por lo que la incertidumbre estadística es alta.
- Aunque la licencia Apache-2.0 permite uso comercial, la fiabilidad del modelo para aplicaciones reales es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Den953/vit-beans-demo
- Space de demostración: https://huggingface.co/spaces/Den953/bean-leaf-classifier
- Dataset utilizado: https://huggingface.co/datasets/AI-Lab-Makerere/beans
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Modelos comparables: https://huggingface.co/ezzats/vit-beans-demo y https://huggingface.co/Developer9215/vit-base-beans-demo-v5
