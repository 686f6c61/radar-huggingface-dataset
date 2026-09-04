# bsgcasa/vit-real-vs-ai-detector

## Resumen

El modelo `bsgcasa/vit-real-vs-ai-detector` es un clasificador binario de imágenes desarrollado por bsgcasa que distingue entre fotografías reales e imágenes generadas por inteligencia artificial. Se construye a partir de un Vision Transformer (ViT) base con parches de 16x16 y resolución de entrada de 224x224, preentrenado en ImageNet y ajustado con el dataset CIFAKE, que contiene imágenes reales del conjunto CIFAR-10 (nativas de 32x32) y imágenes sintéticas producidas por una GAN concreta.

El modelo resuelve un problema de clasificación de imágenes dentro de un entorno de laboratorio muy específico. Reporta una precisión del 99.30% en el conjunto de test de CIFAKE, pero su autor advierte explícitamente de una limitación fundamental: el modelo no generaliza a imágenes del mundo real de alta resolución. De hecho, detecta artefactos de interpolación y compresión asociados a imágenes de baja resolución ampliadas, en lugar de señales genuinas de generación por IA. Por esta razón, su uso recomendado se limita a fines educativos, de investigación o como punto de partida para entrenamientos posteriores, y no es apto para aplicaciones en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (vit_base_patch16_224) |
| Parametros totales | no disponible |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No aplicable (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplicable (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo está basado en la arquitectura ViT-Base con parches de 16x16 y resolución de entrada de 224x224. El autor parte del checkpoint preentrenado en ImageNet disponible en la biblioteca `timm`. Se realiza un fine-tuning sobre el dataset CIFAKE, que contiene 60.000 imágenes reales de CIFAR-10 (32x32) y 60.000 imágenes sintéticas generadas por una GAN, todas ellas ampliadas a 224x224. El entrenamiento se ejecuta durante 5 épocas, con el optimizador AdamW y un plan de tasa de aprendizaje coseno. La primera época congela el backbone y entrena únicamente la cabeza de clasificación. El modelo clasifica en dos clases: REAL (etiqueta 0) y FAKE (etiqueta 1).

No se mencionan innovaciones técnicas destacables más allá del protocolo de entrenamiento estándar. La limitación más relevante es que el modelo no ha sido entrenado con artefactos de generadores modernos (diffusion, GANs actuales) ni con imágenes de alta resolución, por lo que sus características aprendidas están ligadas a la firma de compresión y ampliación de los datos de CIFAKE.

## Capacidades

- Clasificación binaria de imágenes: distingue entre la clase REAL (0) y FAKE (1) según la distribución específica del dataset CIFAKE.
- No soporta generación de texto, razonamiento multi-step, llamadas a herramientas (tool calling) ni capacidades de agente, por ser un modelo puramente de visión.
- No ofrece capacidades multimodales; solo procesa imágenes de una resolución fija de 224x224.
- No tiene soporte de idiomas, ya que no es un modelo de lenguaje.

## Casos de uso

- Investigación académica sobre detección de imágenes sintéticas en el dataset CIFAKE: el modelo puede utilizarse como referencia para reproducir y analizar cómo se comporta un clasificador ViT en un entorno de baja resolución y con una única familia de generadores.
- Punto de partida para fine-tuning hacia un detector general: el checkpoint puede servir como base para entrenar un modelo más robusto, incorporando datos de alta resolución y generadores modernos, como se recomienda en la propia model card.
- Evaluación comparativa de técnicas de preprocesado: permite estudiar cómo afecta la ampliación de imágenes de 32x32 a 224x224 y qué artefactos de interpolación aprenden los modelos de visión.
- Demostración educativa de flujos de trabajo de fine-tuning con Vision Transformers: es un ejemplo práctico de cómo ajustar un ViT con PyTorch y la biblioteca `timm`, con una carga de datos sencilla y un objetivo binario.
- Material de referencia en trabajos de fin de grado o tesis sobre detección de GANs: sirve para ilustrar la diferencia entre rendimiento en distribución y generalización a datos reales.
- Experimentos de transferencia de aprendizaje: permite probar la capacidad del modelo para adaptarse a otros conjuntos de imágenes sintéticas de baja resolución, siempre que se respete la misma distribución de entrada.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas sobre el conjunto de test de CIFAKE:

| Metrica | Valor |
|---|---|
| Test Accuracy | 99.30% |
| Test AUC | 0.9996 |
| Precision (REAL / FAKE) | 0.9936 / 0.9925 |
| Recall (REAL / FAKE) | 0.9925 / 0.9936 |

Es importante señalar que estos valores no son extrapolables a imágenes de alta resolución ni a generadores distintos del utilizado en CIFAKE. El autor confirma empíricamente que fotografías reales de alta resolución se clasifican incorrectamente como falsas, mientras que al degradarlas artificialmente a baja resolución las predicciones cambian a la clase correcta. No se han publicado benchmarks externos adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB para el procesamiento de una imagen de 224x224 en FP32, dado que es un ViT-Base.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1660, RTX 2060, RTX 3060) puede ejecutar inferencia de una imagen. También es ejecutable en CPU, aunque con mayor latencia.
- Compatible con GPUs de consumo: sí, es suficientemente ligero para tarjetas gráficas de gama baja y media.
- Opciones de despliegue: PyTorch, TorchServe, ONNX Runtime y la infraestructura de inferencia de Hugging Face. No es compatible con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. La model card no incluye comparativas con otros clasificadores de deepfake o detección de imágenes sintéticas. Como referencia técnica, el modelo base `vit_base_patch16_224` de `timm` tiene aproximadamente 86 millones de parámetros, pero este checkpoint es un ajuste específico sobre CIFAKE y no se dispone de datos de comparativa con otros detectores.

## Limitaciones y advertencias

- El modelo no generaliza a imágenes de alta resolución del mundo real; tiende a predecir FAKE en fotografías nítidas y comprimidas de forma habitual, porque no reconoce la categoría "foto real pero de alta resolución".
- Las imágenes de baja resolución y las ampliaciones artificiales de 32x32 a 224x224 siguen siendo la única distribución fiable para este modelo.
- No está validado para detectar imágenes generadas por modelos modernos como Midjourney, DALL·E o Stable Diffusion; la clase FAKE solo proviene de una GAN antigua y de baja resolución.
- El uso en moderación de contenido, verificación periodística o en aplicaciones de producción no está recomendado por el autor, dado el alto riesgo de falsos positivos.
- Los resultados de la model card (99.30% de precisión) solo describen el comportamiento en el conjunto de test de CIFAKE, no la fiabilidad en el mundo real.
- La licencia MIT permite uso comercial, pero la escasa utilidad práctica en escenarios reales hace que el valor comercial sea muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/bsgcasa/vit-real-vs-ai-detector
- Dataset CIFAKE en Kaggle: https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
