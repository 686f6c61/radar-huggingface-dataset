# CarlosZamG/resnet-20-realwaste

## Resumen

ResNet-20 RealWaste es una red neuronal convolucional de tipo ResNet-20 entrenada desde cero con PyTorch para la clasificación de imágenes de residuos en 9 categorías. El modelo lo publica el usuario CarlosZamG en Hugging Face y su único propósito documentado es la clasificación de imágenes del conjunto de datos RealWaste, procedente del repositorio UCI Machine Learning Repository.

Se trata de un modelo de visión por computador muy pequeño: los pesos en formato safetensors suman 274.761 parámetros, lo que lo sitúa en el rango de los modelos experimentales o de demostración más que en el de los modelos de producción a gran escala. La arquitectura ResNet-20 es una variante compacta de las ResNet originales, pensada para entrenamiento rápido y bajo coste computacional.

Su relevancia es limitada y acotada: resulta útil como ejemplo de entrenamiento desde cero sobre un dataset concreto de clasificación de residuos, como base para experimentos docentes o como punto de partida para tareas de reciclaje automatizado a pequeña escala. No es un modelo de propósito general ni compite con los grandes modelos de visión contemporáneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-20 (red neuronal convolucional residual) |
| Parametros totales | 274.761 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imágenes RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas del dataset en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Framework | PyTorch |
| Numero de clases | 9 |
| Entrada | imágenes RGB |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-20, es decir, una red convolucional residual con conexiones de salto, implementada y entrenada desde cero en PyTorch según la model card. El modelo recibe imágenes RGB y produce una clasificación entre 9 categorías de residuos. El número de parámetros (274.761) es coherente con una ResNet-20 de pocos canales, muy alejada de las ResNet-50 o ResNet-101 habituales en visión por computador.

El entrenamiento se realizó sobre el dataset RealWaste, publicado en el UCI Machine Learning Repository (Single, Iranmanesh y Raad, 2023). La model card no especifica el número de tokens ni de imágenes de entrenamiento, la composición exacta del dataset, la resolución de entrada, el número de épocas, la función de pérdida, el optimizador ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta ningún proceso de ajuste fino supervisado, RLHF o DPO, algo esperable en un modelo de clasificación de imágenes. El repositorio incluye `config.json` y `training_metadata.json`, que presumiblemente contienen la configuración de arquitectura y los metadatos del entorno de entrenamiento, aunque su contenido no se detalla en la información disponible.

## Capacidades

- Clasificación de imágenes RGB en 9 categorías de residuos del dataset RealWaste.
- Modelo de visión puro: no genera texto, no razona y no responde a instrucciones.
- No dispone de soporte de tool calling ni de function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no aplicables; las etiquetas de salida están en inglés.
- No incluye modo de pensamiento, visión generativa, audio ni otras capacidades especiales.
- Inferencia ligera: al tener 274.761 parámetros, puede ejecutarse en CPU sin dificultad.

## Casos de uso

- Clasificación automatizada de residuos en un prototipo de reciclaje: el modelo recibe una imagen RGB y devuelve una de las 9 categorías del dataset RealWaste, lo que permite separar residuos en una cinta transportadora simulada o en un entorno de laboratorio.
- Docencia y experimentación con redes residuales: al ser una ResNet-20 entrenada desde cero y con muy pocos parámetros, sirve para ilustrar el entrenamiento de CNN, el uso de conexiones residuales y la evaluación sobre un dataset público.
- Base para fine-tuning en dominios específicos: su tamaño reducido permite reentrenarlo o ajustarlo rápidamente con nuevos datos de residuos de una planta concreta, sin necesidad de GPU de gama alta.
- Despliegue en dispositivos de borde: con menos de 300.000 parámetros, el modelo puede ejecutarse en Raspberry Pi, microcontroladores con aceleración o navegadores mediante exportación a ONNX, para tareas de clasificación en el punto de recogida.
- Generación de datasets etiquetados: el modelo puede usarse como etiquetador preliminar para preanotar imágenes de residuos y reducir el trabajo manual, siempre con revisión humana posterior.
- Investigación sobre sesgos en clasificación de residuos: permite analizar cómo un modelo pequeño entrenado con un dataset concreto se comporta ante imágenes fuera de distribución, iluminación variable o residuos mezclados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, matriz de confusión ni comparaciones con otros modelos sobre el dataset RealWaste.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 274.761 parámetros, los pesos ocupan aproximadamente 1,1 MB en FP32 y unos 0,55 MB en FP16.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una GPU integrada, y también funciona en CPU.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX Runtime, TorchScript o conversión a formatos ligeros para dispositivos de borde. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos en CPU y muy inferior en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras ResNet-20, con ResNet-50 preentrenadas en ImageNet ni con modelos específicos de clasificación de residuos. Tampoco se dispone de métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo solo clasifica las 9 categorías del dataset RealWaste; no reconoce clases fuera de ese conjunto.
- No se documenta la licencia, por lo que el uso comercial queda en una situación jurídica incierta y requiere contactar con el autor.
- Al estar entrenado desde cero con un dataset acotado, es probable que generalice mal ante imágenes con iluminación, fondo o ángulos distintos a los de entrenamiento; no hay datos publicados que lo confirmen.
- Riesgo de sobreajuste y de sesgos derivados de la distribución del dataset RealWaste, que no se describe en la model card.
- No se especifican la resolución de entrada ni el preprocesado esperado, lo que puede provocar errores si se usa con imágenes sin el tratamiento adecuado.
- El modelo no es adecuado para tareas de propósito general, generación de texto, razonamiento ni agentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación externa ni de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarlosZamG/resnet-20-realwaste
- Dataset RealWaste en UCI: https://archive.ics.uci.edu/dataset/908/realwaste
- Referencia del dataset: Single, S., Iranmanesh, S., & Raad, R. (2023). RealWaste [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5SS4G
