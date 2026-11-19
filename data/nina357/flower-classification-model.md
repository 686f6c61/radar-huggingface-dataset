# nina357/flower-classification-model

## Resumen

El modelo `nina357/flower-classification-model` es un clasificador de imágenes de flores desarrollado por el usuario nina357 como parte del sistema `MLOpsPortfolioExercise`. Se trata de un modelo de visión por computadora construido mediante transfer learning sobre MobileNetV2, un backbone convolucional ligero preentrenado en ImageNet, al que se le ha añadido una cabeza de clasificación específica para distinguir cinco especies de flores: margarita, diente de león, rosas, girasoles y tulipanes.

El modelo resuelve un problema acotado de clasificación de imágenes en cinco clases, orientado a aplicaciones educativas, catalogación botánica y servicios automatizados de floricultura. Su relevancia radica en su ligereza (aproximadamente 13,6 MB de pesos serializados) y en su diseño para inferencia en tiempo real en entornos móviles y web, lo que lo hace adecuado para despliegues con recursos limitados.

La arquitectura es una CNN estándar (no un transformer), con entrada RGB de 180x180 píxeles normalizada al rango [-1, 1] y una cabeza densa de 512 unidades con dropout seguida de una capa softmax de 5 salidas. El modelo se distribuye en formato Keras (`.keras`) y está publicado bajo licencia MIT. No se han publicado resultados de benchmarks ni métricas de precisión en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con transfer learning sobre MobileNetV2 (backbone congelado, `include_top=False`, `pooling="avg"`) + cabeza densa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 180x180x3) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras nativo, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | MIT |
| Formato de pesos | Keras (`.keras`, ~13,6 MB); metadatos en `classes.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo emplea transfer learning sobre MobileNetV2, una red convolucional ligera preentrenada en ImageNet. El backbone se carga sin la capa de clasificación superior (`include_top=False`) y con pooling promedio global (`pooling="avg"`), lo que produce un vector de características de 1280 dimensiones. Sobre este se añade una cabeza clasificadora compuesta por una capa densa de 512 unidades con activación ReLU, un dropout del 0,2 y una capa final densa de 5 unidades con activación softmax. La entrada es una imagen RGB de 180x180 píxeles normalizada mediante `x/127.5 - 1.0` al rango [-1, 1].

El entrenamiento se realizó sobre el dataset Oxford Flowers, restringido a cinco clases (daisy, dandelion, roses, sunflowers, tulips). El seguimiento de experimentos se gestionó con MLflow bajo el nombre de run `Flower_Classification_DAI6`. No se especifican en la información disponible el número de épocas, el tamaño del conjunto de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos, regularización adicional o ajuste fino del backbone. Tampoco se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de clasificación de imágenes.

## Capacidades

- Clasificación de imágenes de flores en cinco categorías: daisy, dandelion, roses, sunflowers y tulips.
- Inferencia en tiempo real sobre imágenes RGB de 180x180 píxeles, adecuada para aplicaciones móviles y web.
- Salida de probabilidades por clase mediante softmax, lo que permite umbralizar la confianza y detectar predicciones poco fiables.
- Integración con TensorFlow/Keras y carga directa desde Hugging Face Hub mediante `hf_hub_download`.
- Despliegue como servicio mediante FastAPI (capa de serving `src/flower_web.py` mencionada en la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües más allá de las etiquetas de clase en inglés.
- No incorpora modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Identificación de flores en aplicaciones móviles de jardinería: el modelo recibe una foto del usuario, la redimensiona a 180x180 y devuelve la especie probable con su confianza; su tamaño reducido (~13,6 MB) permite empaquetarlo en apps móviles o servirlo desde un endpoint ligero.
- Catalogación botánica automatizada: en flujos de digitalización de herbarios o inventarios de jardines, el modelo puede etiquetar lotes de imágenes y priorizar la revisión humana según la confianza devuelta por softmax.
- Servicio web de clasificación con FastAPI: la model card documenta una capa de serving (`src/flower_web.py`) que expone el modelo como API; es adecuado para prototipos y demos educativas por su bajo coste computacional.
- Educación y divulgación: aplicaciones didácticas para enseñar visión por computadora y transfer learning, ya que el modelo es pequeño, la licencia MIT permite reutilización y el código de inferencia es mínimo.
- Filtrado y organización de galerías fotográficas: clasificación automática de imágenes de flores en colecciones personales o bancos de imágenes, agrupando por especie para facilitar la búsqueda.
- Monitorización en horticultura y floricultura: identificación de especies en imágenes capturadas por cámaras fijas o drones de bajo coste, con la advertencia de que solo cubre cinco clases y requiere imágenes con pétalos visibles.
- Integración en pipelines MLOps de demostración: el repositorio forma parte de un ejercicio de MLOps con MLflow, por lo que sirve como ejemplo de registro, publicación y consumo de modelos en Hugging Face Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la métrica `accuracy` en los metadatos, pero no proporciona valores numéricos, matrices de confusión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo pesa ~13,6 MB en formato Keras y la entrada es de 180x180x3, por lo que cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM, e incluso puede ejecutarse en CPU con latencias aceptables.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes pequeños. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente. Para serving de alto throughput, una T4 o A10 bastan.
- Cabe en cualquier GPU consumer y en dispositivos móviles o de borde (edge) gracias al diseño de MobileNetV2.
- Opciones de despliegue: TensorFlow/Keras nativo, TensorFlow Serving, FastAPI (según la model card), y conversión a TensorFlow Lite o TensorFlow.js para móvil y navegador. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo y la resolución de entrada, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nina357/flower-classification-model | MobileNetV2 + cabeza densa | no disponible (~13,6 MB de pesos) | Imagen 180x180x3 | 5 especies de flores | MIT | Hugging Face Hub |
| MobileNetV2 (ImageNet) | CNN | ~3,5 M | Imagen 224x224x3 | 1000 clases ImageNet | Apache 2.0 (TF) | TensorFlow/Keras |
| ResNet50 (ImageNet) | CNN residual | ~25,6 M | Imagen 224x224x3 | 1000 clases ImageNet | Apache 2.0 (TF) | TensorFlow/Keras |
| EfficientNet-B0 (ImageNet) | CNN con compound scaling | ~5,3 M | Imagen 224x224x3 | 1000 clases ImageNet | Apache 2.0 (TF) | TensorFlow/Keras |

La comparativa con backbones genéricos de ImageNet es orientativa: este modelo está especializado en cinco clases de flores, mientras que los alternativos son extractores genéricos de 1000 clases que requerirían ajuste fino para la misma tarea. No se dispone de métricas de precisión del modelo para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Solo reconoce cinco especies de flores; cualquier otra planta se asignará a la clase más cercana, generando predicciones incorrectas con posible alta confianza.
- Flores cerradas, marchitas, con pétalos no visibles, recortadas o parcialmente ocultas pueden producir predicciones de baja calidad, según advierte la propia model card.
- Riesgo de sobreajuste al dataset Oxford Flowers: no se documentan métricas de validación ni pruebas con imágenes fuera de dominio.
- No se han publicado datos sobre sesgos del dataset (por ejemplo, distribución geográfica de las especies o condiciones de iluminación), por lo que no puede evaluarse su robustez fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y no hay garantías implícitas de idoneidad para producción crítica.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de uso comunitario ni validación externa.
- La documentación está orientada a un ejercicio de MLOps y contiene secciones extensas sobre publicación y gobernanza que no aportan garantías sobre el rendimiento del modelo.
- El modelo está pensado para inglés en las etiquetas de salida; no soporta otros idiomas ni tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nina357/flower-classification-model
- Dataset Oxford Flowers (referenciado en metadatos): https://www.robots.ox.ac.uk/~vgg/data/flowers/
- MobileNetV2 (paper original, referenciado por la arquitectura): https://arxiv.org/abs/1801.04381
- TensorFlow/Keras: https://www.tensorflow.org/
- MLflow: https://mlflow.org/
- Hugging Face Hub (cliente Python): https://huggingface.co/docs/huggingface_hub
