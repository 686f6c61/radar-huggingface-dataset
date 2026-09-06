# hylin16/food-recognition-food11-effnet-b0-cbam-380

## Resumen

hylin16/food-recognition-food11-effnet-b0-cbam-380 es un clasificador de imágenes de comida desarrollado por hylin16 que identifica 11 categorías del conjunto de datos Food-11. Se basa en el backbone EfficientNet-B0 de torchvision al que se le añade un bloque CBAM (Convolutional Block Attention Module) entre las características extraídas y la cabeza de clasificación, con el objetivo de mejorar la discriminación visual mediante atención de canal y espacial. El modelo se publica bajo licencia MIT y está disponible en HuggingFace con el pipeline de image-classification, aunque no se especifican el número total de parámetros ni la longitud de contexto, al tratarse de un modelo puramente visual.

El modelo fue entrenado durante 30 épocas con una resolución de entrada de 380 píxeles, tamaño de lote de 32 y una tasa de aprendizaje de 0.0005 con programador coseno. El autor reporta una precisión de validación del 94,85% y una macro F1 de 0,9478 en el conjunto de validación completo de Food-11. Su relevancia radica en la incorporación de un mecanismo de atención ligero (CBAM) sobre un backbone eficiente, lo que permite un equilibrio entre precisión y coste computacional para tareas de clasificación de alimentos en imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (torchvision) con bloque CBAM |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo combina el backbone EfficientNet-B0 de torchvision con un bloque CBAM insertado entre la salida de las características convolucionales y la cabeza de clasificación. CBAM aplica secuencialmente atención de canal y atención espacial, lo que permite recalibrar los mapas de características y resaltar regiones relevantes. El entrenamiento se realizó de forma totalmente supervisada sobre el conjunto de datos Food-11 (11 clases), con una resolución de entrada de 380 píxeles, 30 épocas, tamaño de lote de 32 y tasa de aprendizaje de 0.0005 con programador coseno. El autor indica que el checkpoint publicado corresponde a la época 21 y que el entrenamiento completo tardó 26 minutos. No se detalla la composición del dataset ni si se aplicaron técnicas de aumento de datos, por lo que estos datos no están disponibles.

## Capacidades

- Clasificación de imágenes de comida en 11 categorías del conjunto Food-11.
- Devuelve las predicciones top-k con sus etiquetas y probabilidades.
- Permite generar mapas de activación Grad-CAM para interpretar qué píxeles influyeron en la decisión (mediante la herramienta food-recognition-gradcam).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo puro de clasificación de imágenes.
- No tiene capacidades multilingües ni de visión-lenguaje.
- El checkpoint embebe la arquitectura, la resolución de entrada y los nombres de las clases, simplificando su carga.

## Casos de uso

- Registro dietético en aplicaciones móviles: el modelo puede identificar el tipo de comida a partir de una fotografía, permitiendo al usuario anotar sus comidas de forma rápida y automática. La resolución de 380 px y el mecanismo de atención CBAM ayudan a distinguir platos con texturas similares.
- Control de calidad en procesado de alimentos: en una línea de producción, el modelo puede clasificar productos envasados según su categoría (por ejemplo, carne, verdura, pan) para verificar que el etiquetado corresponde al contenido. Su licencia MIT permite integrarlo en sistemas internos sin coste de licencia.
- Sistema de recomendación de recetas: a partir de una foto del plato, un sistema puede sugerir recetas similares o acompañamientos. El modelo devuelve top-k predicciones, lo que permite ofrecer varias opciones y no solo una etiqueta única.
- Análisis de hábitos alimentarios en investigación: los investigadores pueden usar el clasificador para etiquetar automáticamente grandes volúmenes de imágenes de comidas en estudios nutricionales, reduciendo el trabajo manual. El rendimiento reportado (94,85% de precisión) es adecuado para tareas de etiquetado asistido.
- Asistente en restaurantes: el modelo puede identificar el plato que el cliente ha fotografiado y, combinado con una base de datos de menús, proporcionar información sobre ingredientes o alérgenos, siempre que se integre con fuentes externas, ya que el modelo no ofrece información nutricional.
- Demo educativa de visión por computador: al ser un modelo ligero y con código de ejemplo, es útil para enseñar clasificación de imágenes y mecanismos de atención. La herramienta Grad-CAM permite visualizar las regiones que el modelo considera relevantes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de HuggingFace, no verificados de forma independiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Image Classification | Food-11 | Top-1 accuracy | 94.85% |
| Image Classification | Food-11 | Macro F1 | 0.9478 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- No se han publicado estimaciones oficiales de VRAM ni latencia.
- Al emplear un backbone EfficientNet-B0, el modelo es ligero y se espera que sea viable en GPU de consumo, aunque no se proporcionan cifras concretas.
- No se dispone de información sobre cuantizaciones; el modelo se distribuye como checkpoint de PyTorch.
- Opciones de despliegue: mediante la librería food_recognition (pip install git+https://github.com/linhongyu510/food_recognition.git) y el uso estándar de PyTorch. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El modelo fue entrenado únicamente con el conjunto Food-11; la precisión en otras cocinas, tipos de plato o condiciones fotográficas fuera de esa distribución no está medida.
- El modelo devuelve una etiqueta con confianza incluso cuando la imagen no contiene comida, lo que puede llevar a falsas clasificaciones.
- Las predicciones no deben interpretarse como un juicio nutricional, de alérgenos ni de seguridad alimentaria. No debe usarse en contextos donde un error pueda suponer un riesgo para la salud.
- La precisión reportada es sobre el split de validación público, lo que constituye una estimación optimista del rendimiento real en producción.
- No se detallan sesgos específicos, pero al estar entrenado en un dataset limitado, es probable que presente sesgos hacia las categorías y condiciones del conjunto de entrenamiento.
- El modelo no es multimodal ni multilingüe; solo procesa imágenes y no genera texto.

## Enlaces

- HuggingFace: https://huggingface.co/hylin16/food-recognition-food11-effnet-b0-cbam-380
- Repo de entrenamiento: https://github.com/linhongyu510/food_recognition
- Paper CBAM: https://arxiv.org/abs/1807.06521
