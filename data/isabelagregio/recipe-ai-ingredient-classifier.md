# isabelagregio/recipe-ai-ingredient-classifier

## Resumen

Recipe AI Ingredient Classifier es un modelo de visión por computador para clasificación de imágenes de ingredientes alimentarios en 15 categorías. Lo desarrolla isabelagregio como componente de visión del proyecto Recipe AI, una aplicación de extremo a extremo que identifica ingredientes a partir de fotografías y recomienda recetas mediante TF-IDF y recuperación por vecinos más cercanos. El modelo se publica en Hugging Face con la librería Keras y un total de 27 descargas en el momento de la consulta.

Técnicamente se trata de un clasificador de etiqueta única construido sobre MobileNetV2 como backbone, implementado con TensorFlow/Keras. Acepta imágenes RGB redimensionadas a 224 × 224 píxeles y devuelve 15 puntuaciones de clasificación, una por cada clase soportada (banana, bread, carrot, cheese, chicken-meat, chocolate, egg, flour, lemon, milk, onion, pineapple, potato, rice y tomato). No es un modelo generativo ni un modelo de lenguaje: es una red convolucional de propósito específico para una tarea cerrada de clasificación.

Su relevancia es acotada y de nicho: sirve como pieza de un pipeline mayor de reconocimiento de ingredientes y recomendación de recetas. El autor declara una precisión del 90,57 % en el proyecto original, aunque la propia model card advierte de que el split de evaluación, el número de muestras y las métricas por clase no están documentados, por lo que el dato no debe interpretarse como un benchmark reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN) sobre TensorFlow/Keras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | other / unspecified (declarada como "other" en metadatos, sin términos concretos) |
| Formato de pesos | Keras (.keras), fichero `mobilenet_recipe_ai_ingredients.keras` |

## Arquitectura y entrenamiento

El modelo emplea MobileNetV2 como backbone, una red convolucional con bloques residuales invertidos y conexiones lineales de cuello de botella, diseñada originalmente para inferencia eficiente en dispositivos con recursos limitados. La tarea es clasificación de imagen de etiqueta única con 15 clases de salida. La entrada es una imagen RGB redimensionada a 224 × 224 píxeles, preprocesada con `tf.keras.applications.mobilenet_v2.preprocess_input`.

No se dispone de información sobre el número de imágenes de entrenamiento, la composición del dataset, el esquema de aumentación de datos, la función de pérdida, el número de épocas, la estrategia de fine-tuning (si se congeló el backbone o se ajustó completo) ni si se aplicaron técnicas de regularización o balanceo de clases. Tampoco se documenta el split de evaluación. La model card reconoce explícitamente que estos detalles deberían documentarse antes de interpretar la precisión declarada del 90,57 % como un benchmark reproducible.

## Capacidades

- Clasificación de imágenes de ingredientes alimentarios en 15 categorías cerradas: banana, bread, carrot, cheese, chicken-meat, chocolate, egg, flour, lemon, milk, onion, pineapple, potato, rice y tomato.
- Salida de 15 puntuaciones de clasificación; el código de ejemplo aplica softmax si la suma no es aproximadamente 1.
- Preprocesado estandarizado compatible con MobileNetV2 de Keras.
- Integración como componente de visión en un pipeline de recomendación de recetas (TF-IDF y recuperación por vecinos más cercanos).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto, código, matemáticas, audio ni modo de pensamiento.
- No es multilingüe en sentido estricto: las etiquetas de clase están en inglés y el modelo no procesa texto.

## Casos de uso

- Inventario de ingredientes en cocina doméstica: el usuario fotografía un ingrediente y el modelo devuelve la clase predicha, que puede alimentar un listado de despensa para planificación de comidas.
- Recomendación de recetas: la clase predicha se usa como entrada del componente de recuperación TF-IDF del proyecto Recipe AI para sugerir recetas que contengan ese ingrediente.
- Etiquetado automático de imágenes en un recetario digital: clasificar fotografías de ingredientes para organizar un corpus culinario por ingrediente principal.
- Asistente de compra: integrado en una app móvil, identificar ingredientes a partir de fotos para generar listas de la compra o comprobar si falta un ingrediente de una receta.
- Filtrado y moderación de contenido en plataformas de recetas: clasificar imágenes subidas por usuarios para verificar que corresponden a ingredientes válidos antes de publicarlas.
- Prototipado educativo: ejemplo de fine-tuning de MobileNetV2 con Keras para demostrar un pipeline completo de visión por computador aplicado a alimentación.
- Preprocesado en sistemas de visión a bordo: al basarse en MobileNetV2, es adecuado para inferencia en dispositivos con recursos limitados, como móviles o Raspberry Pi, dentro de un pipeline mayor.

## Benchmarks y rendimiento

La model card declara una precisión de clasificación del 90,57 % en el proyecto original. No se han publicado resultados de benchmarks en la información disponible más allá de ese dato, y el propio autor advierte de que el split de evaluación, el número de muestras y las métricas por clase no están documentados.

| Benchmark | Resultado | Notas |
|---|---|---|
| Precisión de clasificación (declarada por el autor) | 90,57 % | Split, número de muestras y métricas por clase no documentados |
| MMLU, HumanEval, GSM8K u otros | no disponible | No aplicables a un clasificador de imágenes |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB; MobileNetV2 es una red ligera y el tamaño del repositorio es de 0,0 GB según Hugging Face.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: TensorFlow Serving, Keras nativo, conversión a TensorFlow Lite para móvil o edge, y ONNX Runtime si se exporta el modelo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Recipe AI Ingredient Classifier | MobileNetV2 (CNN) | no disponible | Imagen 224 × 224 RGB | other / unspecified | Hugging Face (Keras) |
| MobileNetV2 (ImageNet, Keras) | MobileNetV2 (CNN) | ~3,5 M (referencia) | Imagen 224 × 224 RGB | Apache 2.0 (referencia) | Keras Applications |
| EfficientNet-B0 (ImageNet) | EfficientNet (CNN) | ~5,3 M (referencia) | Imagen 224 × 224 RGB | Apache 2.0 (referencia) | TensorFlow/Keras, PyTorch |

La comparación con alternativas de la misma categoría se limita a backbones genéricos preentrenados en ImageNet, ya que no se dispone de otros clasificadores de ingredientes publicados con los que contrastar directamente. Los datos de los modelos de referencia son orientativos y no proceden de la información proporcionada sobre este modelo.

## Limitaciones y advertencias

- El modelo solo reconoce 15 clases cerradas; cualquier ingrediente fuera de esa lista se clasificará erróneamente en una de ellas.
- La precisión declarada del 90,57 % no es reproducible tal como se publica: falta documentar el split, el tamaño de muestra y las métricas por clase.
- Riesgo de sesgo por composición del dataset de entrenamiento, que no se documenta; puede fallar en variedades visuales distintas (madurez, cocinado, envases, iluminación, ángulos).
- No se han publicado métricas de calibración, matriz de confusión ni evaluación por clase, lo que dificulta estimar el rendimiento en producción.
- La licencia se declara como "other" con nombre "unspecified"; no hay términos claros para uso comercial, por lo que conviene contactar con el autor antes de un despliegue comercial.
- Modelo de propósito específico: no sirve para generación de texto, razonamiento, código ni tareas generales.
- Idioma de etiquetas en inglés; no hay soporte multilingüe.
- El tamaño del repositorio es de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente disponibles o que el fichero es muy pequeño; conviene verificar la descarga antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/isabelagregio/recipe-ai-ingredient-classifier
- Repositorio GitHub del proyecto: https://github.com/isabelagregio/recipe-ai
