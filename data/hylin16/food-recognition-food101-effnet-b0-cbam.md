# hylin16/food-recognition-food101-effnet-b0-cbam

## Resumen

El modelo `hylin16/food-recognition-food101-effnet-b0-cbam` es un clasificador de imágenes de comida entrenado sobre el dataset Food-101. Está desarrollado por el autor `hylin16` y combina un backbone EfficientNet-B0 de torchvision con un bloque CBAM (Convolutional Block Attention Module) insertado entre las características y la cabeza de clasificación, lo que permite atender a canales y regiones espaciales relevantes. El modelo resuelve la tarea de reconocer 101 categorías de platos a partir de fotografías y se distribuye como un checkpoint de PyTorch (`best.pt`) junto con una utilidad de interpretabilidad Grad-CAM. Su relevancia radica en que ofrece un equilibrio entre coste computacional y precisión (88,70 % de exactitud en validación) para aplicaciones de clasificación de alimentos, con un mecanismo de atención que puede estudiarse en entornos de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 con bloque CBAM (atención de canal y espacial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | other |
| Formato de pesos | Checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo parte del backbone EfficientNet-B0 de torchvision y añade un bloque CBAM (Convolutional Block Attention Module, arXiv:1807.06521) entre las características extraídas y la cabeza de clasificación. CBAM combina atención de canal y atención espacial, lo que permite al modelo resaltar regiones relevantes del plato y descartar zonas irrelevantes. El checkpoint embebe la arquitectura, la resolución de entrada y los nombres de las clases, de modo que no es necesario especificarlos al cargar.

El entrenamiento es totalmente supervisado sobre el dataset Food-101 (101 clases de comida). Se usaron 30 épocas, batch size 64, learning rate 0.0003, scheduler coseno y resolución de entrada de 224 px. El tiempo de entrenamiento fue de 254 minutos. La configuración exacta del run está identificada por el commit `21ad21a`. No se utilizó pseudo-etiquetado.

## Capacidades

- Clasificación de imágenes en 101 categorías de comida del dataset Food-101 (por ejemplo, edamame, steak, etc.).
- Predicción top-k: el predictor devuelve las k etiquetas más probables con sus puntuaciones.
- Interpretabilidad con Grad-CAM: incluye una utilidad de línea de comandos para generar mapas de activación superpuestos sobre la imagen original.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (la salida son etiquetas de clase en inglés; no se documenta soporte de idiomas).
- No procesa texto ni audio; es exclusivamente un clasificador de imágenes.

## Casos de uso

- Registro dietético en apps de nutrición: al hacer una foto del plato, el modelo clasifica la comida en una de las 101 categorías, permitiendo registrar la ingesta con un mínimo esfuerzo. La precisión de validación del 88,70 % es razonable para platos típicos del dataset, aunque hay que validar fuera de esa distribución.
- Clasificación de platos en cartas digitales de restaurantes: las fotos de los platos se etiquetan automáticamente para agruparlos por tipo de comida, facilitando la búsqueda y la recomendación en apps de pedidos.
- Moderación y etiquetado de contenido en redes sociales: un sistema puede detectar si una imagen subida contiene comida de las categorías conocidas y asignar etiquetas automáticas para organizar publicaciones o filtrar contenido no relacionado.
- Herramienta de accesibilidad para personas con discapacidad visual: la aplicación describe el tipo de comida de una foto, lo que ayuda a saber qué hay en un plato antes de consumirlo. Debe usarse con cautela porque el modelo no detecta alimentos fuera de Food-101.
- Automatización en cocinas industriales o comedores: clasificar bandejas preparadas en líneas de producción para verificar que el plato corresponde al pedido, a partir de una imagen capturada por cámara. El modelo solo da una etiqueta, por lo que requeriría lógica adicional para validar el pedido.
- Investigación en interpretabilidad de atención visual: gracias al bloque CBAM y a la utilidad Grad-CAM, se puede analizar qué regiones de la imagen influyen en la predicción, lo que es útil para estudiar errores o sesgos del modelo en clasificación de comida.
- Demo de clasificación de imágenes en entornos educativos: por su tamaño reducido y su sencillez de uso (un predictor con un solo checkpoint), es un ejemplo práctico para enseñar fine-tuning y atención en visión por computador.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de validación | 88,70 % |
| Macro F1 | 0,8865 |
| Clases | 101 |
| Resolución de entrada | 224 px |
| Epoch del checkpoint | 29 |
| Tiempo de entrenamiento | 254 min |
| Clase más difícil | steak (F1 0,588) |
| Clase más fácil | edamame (F1 1,000) |

No se han publicado comparativas con otros modelos en la información disponible. La precisión de validación se calculó sobre el split completo de validación de Food-101, y el repositorio re-evalúa cada checkpoint publicado mediante una ruta separada, exigiendo concordancia a seis decimales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de EfficientNet-B0 con un bloque CBAM, el modelo es ligero y probablemente cabe en GPU de consumo, pero no se ofrecen cifras oficiales.
- GPU recomendadas: no disponibles en la información.
- Capacidad en GPU de consumo: no especificada; por su arquitectura, se espera que funcione en tarjetas de gama media, pero no se aporta medición.
- Opciones de despliegue: el paquete `food_recognition` (instalado desde GitHub) permite cargar el checkpoint con `load_predictor` y ejecutar predicciones. También se incluye `food-recognition-gradcam` para generar mapas de activación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría. Existen otros repositorios públicos con clasificadores de Food-101, pero no se aportan datos de rendimiento ni especificaciones comparables.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Food-101 procede de imágenes de Foodspotting, lo que puede introducir sesgos hacia platos y condiciones fotográficas occidentales. No se documentan evaluaciones de sesgo.
- Riesgo de alucinación: el modelo devuelve una etiqueta confiada incluso para imágenes que no contienen comida. No detecta ausencia de comida.
- Limitaciones de contexto o idioma: el modelo solo clasifica imágenes; no procesa texto ni soporta múltiples idiomas. Las etiquetas son en inglés.
- Restricciones de licencia: la licencia del modelo es `other`. Además, el dataset Food-101 no es propiedad de ETH Zurich; los términos permiten uso científico justo, y cualquier uso más allá debe negociarse con los propietarios de las imágenes. Los pesos son un derivado de esos datos y se publican para investigación bajo ese mismo entendimiento. Esto limita el uso comercial.
- Advertencia para producción: la precisión reportada es validación sobre un split público, que es una estimación optimista del rendimiento en campo. No debe usarse como juicio nutricional, de alérgenos ni de seguridad alimentaria; una clasificación errónea puede conllevar riesgos para la salud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hylin16/food-recognition-food101-effnet-b0-cbam
- Repositorio de entrenamiento e inferencia `food_recognition`: https://github.com/linhongyu510/food_recognition
- Paper de CBAM: https://arxiv.org/abs/1807.06521
