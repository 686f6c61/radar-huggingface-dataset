# hylin16/food-recognition-food11-effnet-b3-cbam-224

## Resumen

El modelo `food-recognition-food11-effnet-b3-cbam-224` es un clasificador de imagenes de alimentos desarrollado por `hylin16`. Esta basado en una arquitectura EfficientNet-B3 (backbone de torchvision) con un bloque de atencion CBAM (Convolutional Block Attention Module) insertado entre las features extraidas y la cabeza de clasificacion. El bloque CBAM aplica atencion espacial y de canal para mejorar la discriminacion de las caracteristicas relevantes.

El modelo fue entrenado de forma totalmente supervisada sobre el dataset Food-11, que contiene 11 categorias de alimentos. Alcanza una precision top-1 de 93,03% y un macro F1 de 0,9301 sobre el split de validacion completo. Su tamano de entrada es de 224x224 pixeles. El checkpoint publica en formato PyTorch (`.pt`) e incorpora la arquitectura, resolucion de entrada y nombres de clases, lo que simplifica la carga en produccion.

Es relevante porque ofrece un clasificador de alimentos ligero y con buen rendimiento, adecuado para tareas de reconocimiento de comidas en dispositivos con recursos limitados. Su licencia MIT permite uso comercial sin restricciones, y el codigo de entrenamiento e inferencia es reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 con bloque CBAM (atencion de canal y espacial) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin dependencia de idioma) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`best.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone EfficientNet-B3 preentrenado de torchvision con un modulo CBAM anadido antes de la cabeza de clasificacion. CBAM consta de dos submodulos secuenciales: atencion de canal (Channel Attention) seguida de atencion espacial (Spatial Attention). Esto permite al modelo recalibrar las features, enfatizando regiones y canales mas relevantes para discriminar entre categorias de comida.

El entrenamiento se realizo sobre el dataset Food-11, compuesto por 11 clases. Se usaron 30 epocas, batch size de 32, learning rate de 0,0005 y scheduler cosine. No se empleo pseudo-etiquetado ni otras tecnicas de semi-supervision; el entrenamiento fue completamente supervisado. La resolucion de entrada es de 224x224 pixeles. No hay informacion sobre el numero total de parametros ni sobre el uso de RLHF o DPO, dado que se trata de un modelo de clasificacion de imagenes.

## Capacidades

- Clasificacion de imagenes de alimentos en 11 categorias del dataset Food-11.
- Soporte de predicciones top-k: el codigo de ejemplo permite obtener las k clases mas probables.
- Generacion de mapas de activacion Grad-CAM para visualizar que regiones de la imagen influyen en la prediccion.
- El checkpoint incluye la arquitectura, resolucion de entrada y nombres de clases, lo que evita configuraciones manuales al cargar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision adicional (mas alla de clasificacion) ni audio.

## Casos de uso

- Clasificacion rapida de comidas en apps de nutricion: el modelo puede etiquetar una foto de un plato en 11 categorias comunes (pasta, carne, sopa, ensalada, etc.) y devolver las probabilidades top-3, permitiendo al usuario confirmar la categoria mas probable.
- Analisis de dietas en estudios de salud: se puede integrar en pipelines de procesamiento de imagenes para clasificar comidas en estudios observacionales, donde se necesita una precision razonable (93%) y un modelo ligero para procesar miles de fotos.
- Sistemas de recomendacion de recetas: a partir de la clase detectada (por ejemplo, "pasta"), un sistema puede sugerir recetas o ingredientes relacionados.
- Aplicaciones de asistencia en cafeteria o comedores escolares: clasificar automaticamente los alimentos servidos en bandejas para facilitar el control de menus y evitar errores humanos en la identificacion de categorias.
- Herramientas de accesibilidad para personas con discapacidad visual: al combinar el clasificador con un modulo de voz, se puede describir en audio el tipo de alimento detectado en una foto.
- Investigacion en vision artificial y atencion visual: el modelo sirve como referencia para estudiar el efecto del bloque CBAM sobre EfficientNet-B3 en tareas de clasificacion de alimentos, y se puede utilizar para generar mapas de atencion con Grad-CAM.

## Benchmarks y rendimiento

Segun los datos publicados por el autor en la model card (model-index), el modelo alcanza los siguientes resultados sobre el dataset Food-11:

| Metric | Valor |
|---|---|
| Top-1 accuracy | 0,9303 |
| Macro F1 | 0,9301 |

| Detalle adicional | Valor |
|---|---|
| Clases | 11 |
| Resolucion de entrada | 224 px |
| Epoca del checkpoint | 19 |
| Tiempo de entrenamiento | 20 min |
| Clase mas dificil | 05 (F1 0,855) |
| Clase mas facil | 06 (F1 1,000) |

Estos valores son declarados por el autor y no estan verificados de forma independiente. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que se trata de un EfficientNet-B3 a 224x224, el consumo de VRAM para una sola imagen es bajo, tipicamente inferior a 1 GB. Para batchs grandes, se recomienda al menos 4-6 GB.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, etc.) es suficiente. El modelo tambien puede ejecutarse en CPU para inferencia de una imagen individual.
- Si cabe en consumer GPU: si, el modelo es ligero y cabe sin problemas en GPUs de gama media (8 GB o menos).
- Opciones de despliegue: el codigo de inferencia se distribuye a traves del paquete `food_recognition` en GitHub. Tambien se puede exportar a ONNX para servir con herramientas como ONNX Runtime o convertir a otros formatos si se desea.
- Latencia y throughput: no se han publicado mediciones de latencia o throughput. En una GPU moderna, la inferencia de una imagen a 224x224 suele ser del orden de milisegundos, pero este dato no esta verificado.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion proporcionada. Por lo tanto, no se dispone de una comparativa directa con alternativas de la misma categoria. El dataset Food-11 es un benchmark clasico, y otros modelos como Vision Transformer o ResNet pueden lograr resultados similares, pero no hay datos verificados en la documentacion disponible para esta comparacion.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente sobre Food-11. La precision en platos, cocinas o condiciones fotograficas fuera de esa distribucion no esta medida, y el modelo devolvera una etiqueta confiada incluso si la imagen no contiene comida.
- Las predicciones no constituyen un juicio nutricional, de alergenos ni de seguridad alimentaria. No deben usarse en escenarios donde una clasificacion incorrecta pueda suponer un riesgo para la salud.
- La precision reportada es sobre el split de validacion del benchmark publico, lo que constituye una estimacion optimista del rendimiento en produccion.
- No se han publicado analisis de sesgos. Dado el limitado numero de categorias, es probable que exista un sesgo hacia los tipos de comida representados en Food-11 y que no generalice bien a otras cocinas o presentaciones.
- No hay informacion sobre el tamano del modelo ni sobre su coste computacional exacto, lo que dificulta la planificacion de recursos en despliegues a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hylin16/food-recognition-food11-effnet-b3-cbam-224
- Repositorio de entrenamiento e inferencia: https://github.com/linhongyu510/food_recognition
- Paper de CBAM: https://arxiv.org/abs/1807.06521
- Dataset Food-11: no se proporciona enlace directo en la informacion disponible, pero esta referenciado por el nombre en la model card.
