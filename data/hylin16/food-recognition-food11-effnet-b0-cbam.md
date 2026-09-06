# hylin16/food-recognition-food11-effnet-b0-cbam

## Resumen

El modelo `hylin16/food-recognition-food11-effnet-b0-cbam` es un clasificador de imágenes de comida desarrollado por hylin16, entrenado sobre el conjunto de datos Food-11. Se basa en la arquitectura EfficientNet-B0 de torchvision, a la que se le añade un bloque CBAM (Convolutional Block Attention Module) entre las características extraídas por la red y la cabeza de clasificación. Este bloque aplica atención de canal y espacial, lo que permite al modelo enfocarse en regiones y canales más relevantes para distinguir entre las 11 categorías de alimentos.

El modelo resuelve el problema de clasificación de platos en imágenes, una tarea habitual en aplicaciones de nutrición, análisis de hábitos alimentarios o control de calidad en restauración. Su relevancia radica en que ofrece un punto de partida compacto y con licencia MIT, fácil de integrar en proyectos de visión por computador. La entrada es de 224×224 píxeles y el modelo fue entrenado durante 30 épocas con aprendizaje supervisado, alcanzando una precisión de validación del 93,64 % según los datos declarados por el autor. El tamaño exacto de parámetros no se indica en la información disponible, aunque por su arquitectura se trata de un modelo ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 con bloque CBAM (atencion de canal y espacial) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo utiliza EfficientNet-B0 como backbone, una red convolucional eficiente que escala de forma equilibrada profundidad, anchura y resolución. Sobre las características finales se inserta un bloque CBAM, compuesto por una atención de canal seguida de una atención espacial, tal como se describe en el artículo "CBAM: Convolutional Block Attention Module" (arxiv:1807.06521). Este mecanismo permite recalibrar los mapas de características y destacar las regiones de la imagen más relevantes para la clasificación de alimentos.

El entrenamiento se realizó de forma totalmente supervisada sobre el dataset Food-11, con imágenes de entrada a 224×224 píxeles. Se emplearon 30 épocas, tamaño de lote de 32, tasa de aprendizaje de 0.0005 y un scheduler de tipo coseno. El autor indica que el entrenamiento completo tardó aproximadamente 11 minutos en su entorno. No se utilizó pseudo-etiquetado ni técnicas de refuerzo; el modelo se publica con un checkpoint que ya incorpora la arquitectura, la resolución de entrada y los nombres de las clases, de modo que no es necesario especificarlos al cargarlo.

## Capacidades

- Clasificación de imágenes de comida en 11 categorías del dataset Food-11.
- Entrada de imágenes de 224×224 píxeles.
- Mecanismo de atención CBAM que mejora la discriminación entre clases visualmente similares.
- Soporte de inferencia mediante el cargador `load_predictor` del repositorio `food_recognition`, que devuelve la etiqueta y las top-k predicciones.
- Incluye utilidad de línea de comandos para generar mapas de activación Grad-CAM y visualizar qué píxeles influyen en la predicción.
- No soporta generación de texto, tool calling, funciones de agente ni razonamiento multi-paso, al ser un modelo puramente discriminativo de visión.

## Casos de uso

- Registro de hábitos alimentarios en aplicaciones móviles: el modelo puede clasificar automáticamente la comida de una foto tomada por el usuario, facilitando el seguimiento de dietas sin introducción manual.
- Análisis de menús en entornos de restauración: permite verificar que el plato servido coincide con el pedido mediante una fotografía, útil en comedores de empresa o cadenas de comida rápida.
- Etiquetado automático de fotos de comida en redes sociales: puede generar metadatos de categoría para organizar y buscar imágenes de platos en plataformas de contenido.
- Asistencia en investigación nutricional: ayuda a clasificar grandes volúmenes de imágenes de alimentos en estudios epidemiológicos, reduciendo el tiempo de anotación manual.
- Recomendación de recetas: al identificar la categoría del plato, se puede enlazar con bases de datos de recetas y sugerir preparaciones similares al usuario.
- Control de calidad en cocinas industriales: el modelo puede integrarse en sistemas de cámaras para comprobar que el producto final de una línea de producción corresponde a la categoría esperada.

## Benchmarks y rendimiento

Según la información proporcionada por el autor, los resultados declarados sobre el conjunto de validación de Food-11 son los siguientes:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,64 % |
| Macro F1 | 0,9358 |

Estos valores proceden del `metrics.json` del propio run y no han sido verificados de forma independiente. El autor también indica que la clase más difícil es la 00 (F1 0,852) y la más fácil es la 06 (F1 1,000). No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Al tratarse de un modelo compacto basado en EfficientNet-B0, se espera que pueda ejecutarse en GPU de consumo con menos de 2 GB de VRAM para inferencia por imagen.
- GPU recomendadas: cualquier GPU moderna (RTX 20xx o superior, Tesla T4, A10, etc.) o incluso CPU, dado el bajo coste computacional.
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas como RTX 3060, RTX 4090 o similares.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch, por lo que puede servirse mediante TorchServe, ONNX Runtime, o integrarse directamente en aplicaciones Python usando el repositorio `food_recognition`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Estructuralmente, el modelo es un EfficientNet-B0 estándar con un bloque CBAM añadido; en general, la adición de CBAM suele mejorar la precisión en tareas de clasificación de imágenes a costa de un ligero aumento de cómputo, pero no hay cifras de comparación directa con otras variantes en este caso.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con el dataset Food-11; la precisión en platos, cocinas o condiciones fotográficas fuera de esa distribución no está medida.
- Devuelve una etiqueta con alta confianza incluso ante imágenes que no contienen comida, ya que no dispone de una clase de rechazo.
- Las predicciones no deben interpretarse como un juicio nutricional, de alérgenos o de seguridad alimentaria; no usar en contextos donde un error de clasificación pueda suponer un riesgo para la salud.
- La métrica de precisión reportada es sobre la partición de validación del benchmark público, lo que supone una estimación optimista del rendimiento real en producción.
- No se documentan sesgos específicos del modelo, pero el dataset Food-11 puede presentar sesgos de origen cultural o de calidad de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hylin16/food-recognition-food11-effnet-b0-cbam
- Repositorio de entrenamiento e inferencia: https://github.com/linhongyu510/food_recognition
- Paper de CBAM: https://arxiv.org/abs/1807.06521
