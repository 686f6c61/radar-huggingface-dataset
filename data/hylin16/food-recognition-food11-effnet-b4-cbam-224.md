# hylin16/food-recognition-food11-effnet-b4-cbam-224

## Resumen

El modelo `hylin16/food-recognition-food11-effnet-b4-cbam-224` es un clasificador de imágenes de alimentos desarrollado por el usuario `hylin16`. Está diseñado para identificar 11 categorías del dataset Food-11 y se entrena sobre la arquitectura EfficientNet-B4 de torchvision a la que se le ha añadido un bloque CBAM (Convolutional Block Attention Module) entre las características extraídas y la cabeza de clasificación. Este bloque introduce atención de canal primero y de espacio después, lo que permite que el modelo se centre en regiones y canales relevantes de la imagen.

El modelo se distribuye bajo licencia MIT y ofrece una precisión de validación del 94,24 % (accuracy) y un F1 macro de 0,9418 sobre el split de validación de Food-11. Aunque no se publican ni el número total de parámetros ni el tamaño exacto del checkpoint en la información disponible, el repositorio tiene un tamaño de 0,1 GB y la entrada es de 224 píxeles. Su relevancia actual radica en su sencillez de uso: el propio checkpoint incorpora la arquitectura, la resolución y los nombres de las clases, lo que simplifica el despliegue en aplicaciones de clasificación de comida en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B4 con bloque CBAM (atención de canal y espacial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no procede) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, fichero `best.pt`) |

## Arquitectura y entrenamiento

La arquitectura se basa en un backbone EfficientNet-B4 de torchvision. Entre las features y la cabeza de clasificación se inserta un bloque CBAM, que aplica primero atención en el canal y luego atención espacial. Este mecanismo permite recalibrar los mapas de características y destacar las zonas más discriminativas.

El entrenamiento se realizó con el dataset Food-11, de forma totalmente supervisada, sin pseudo-etiquetado. Los hiperparámetros documentados son: 30 épocas, tamaño de lote 32, tasa de aprendizaje 0,0005 y un scheduler coseno. El checkpoint publicado corresponde a la época 21 y el entrenamiento completo tardó 29 minutos. No se menciona ninguna técnica de ajuste posterior como RLHF o DPO, ya que no aplica a un modelo de clasificación de imágenes. El commit fuente utilizado es `baf1b5e`, y la librería de entrenamiento es `food_recognition`.

## Capacidades

- Clasificación de imágenes en 11 categorías de alimentos del dataset Food-11, con entrada de resolución 224 píxeles.
- Generación de mapas de activación mediante Grad-CAM, lo que permite visualizar qué píxeles de la imagen influyen en la predicción. Esto se realiza a través del comando `food-recognition-gradcam`.
- Facilidad de carga: el checkpoint embebe la arquitectura, la resolución de entrada y los nombres de las clases, por lo que no es necesario especificarlos al cargar el modelo.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni funciones de agente, ya que es un modelo discriminativo de visión.
- No dispone de soporte multilingüe ni de capacidades de visión general (detección, segmentación); únicamente realiza clasificación de imágenes.

## Casos de uso

- Diario nutricional y seguimiento de comidas: una aplicación móvil captura una foto del plato y el modelo la clasifica en una de las 11 categorías de Food-11, permitiendo registrar la ingesta de forma automatizada. Su precisión del 94,24 % en el dataset original lo hace adecuado para este propósito.
- Control de calidad en industria alimentaria: el modelo puede etiquetar productos de una línea de producción según su categoría, ayudando a separar distintos tipos de alimentos. Su bajo coste computacional (224 píxeles de entrada) facilita la integración en sistemas embebidos o cámaras industriales.
- Análisis de tendencias alimentarias en redes sociales: se pueden procesar lotes de imágenes de comida publicadas en plataformas sociales para clasificarlas automáticamente y estudiar la popularidad de cada categoría. La API de predicción es simple y puede ejecutarse en un servidor de gama baja.
- Gestión de menús digitales en restaurantes: al escanear fotos de platos, el modelo asigna automáticamente una categoría al plato, lo que agiliza el llenado de menús digitales y la clasificación de productos. Su licencia MIT permite el uso comercial sin restricciones.
- Investigación en salud pública: estudios de dieta que utilizan fotografías capturadas por participantes pueden etiquetarse de manera estandarizada con este clasificador. Al estar entrenado en un dataset público, facilita la reproducibilidad y la comparación de resultados.
- Automatización de sistemas de recomendación de recetas: a partir de la categoría detectada en la foto de un ingrediente o plato, se pueden filtrar recetas o sugerir contenido en aplicaciones de cocina. El modelo ofrece una solución ligera y no requiere infraestructura de GPU dedicada.
- Transferencia de aprendizaje y experimentación: el modelo puede usarse como extractor de características o como punto de partida para fine-tuning en datasets de comida más amplios, gracias a su arquitectura CBAM bien documentada.

## Benchmarks y rendimiento

Según el model-index declarado por el autor, los resultados sobre el dataset Food-11 son los siguientes:

| Benchmark | Metrica | Valor |
|---|---|---|
| Food-11 | Top-1 accuracy | 94,24 % |
| Food-11 | Macro F1 | 0,9418 |

Además, la model card indica que la clase más difícil obtuvo un F1 de 0,842, mientras que la más fácil alcanzó un F1 de 1,000. El checkpoint publicado corresponde a la época 21 y el entrenamiento completo duró 29 minutos. Estos valores no están verificados de forma independiente, tal y como indica el campo `verified: false` en los metadatos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,1 GB y la entrada es de 224 píxeles, lo que sugiere que la inferencia puede ejecutarse con una memoria de GPU modesta, pero no se han publicado requisitos oficiales.
- GPU recomendadas: no disponible. La model card no especifica el hardware utilizado en el entrenamiento; únicamente indica que el entrenamiento completo se completó en 29 minutos con un tamaño de lote de 32 y una resolución de 224 píxeles.
- Puede ejecutarse en GPU de consumo: es previsible que sí, dado el pequeño tamaño del checkpoint y la resolución de entrada, aunque no hay datos de VRAM confirmados.
- Opciones de despliegue: mediante Python con la librería `food_recognition` (`pip install git+https://github.com/linhongyu510/food_recognition.git`), que ofrece la función `load_predictor`. También se puede utilizar el CLI de Grad-CAM para análisis de explicabilidad. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI por tratarse de un modelo de visión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación rigurosa. En la búsqueda web se han identificado proyectos similares, como `sayfeldinn/AI-Food-Detector` y el repositorio `lannguyen0910/food-recognition`, que también utiliza EfficientNet-B4, pero no se proporcionan métricas ni características comparables. Por tanto, la comparativa con alternativas se considera no disponible.

| Modelo | Parametros | Longitud de contexto | Precision | Licencia |
|---|---|---|---|---|
| hylin16/food-recognition-food11-effnet-b4-cbam-224 | no disponible | no aplica | 94,24 % (Food-11) | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en Food-11, por lo que su precisión en otros platos, cocinas o condiciones fotográficas no ha sido medida. Devolverá una etiqueta con confianza incluso para imágenes que no contienen comida.
- Las predicciones no deben interpretarse como un juicio nutricional, alergénico o de seguridad alimentaria. No se debe utilizar este modelo en situaciones donde una clasificación errónea pueda suponer un riesgo para la salud.
- La precisión reportada es la precisión de validación sobre un split de benchmark público, lo que constituye una estimación optimista del rendimiento real en campo.
- Los benchmarks oficiales no están verificados externamente (`verified: false`), por lo que deben tomarse con cautela.
- El modelo solo clasifica en 11 categorías predefinidas; no detecta alimentos ni segmenta la imagen. Un uso fuera de este dominio puede producir resultados inconsistentes.
- No se proporcionan datos sobre sesgos del dataset Food-11. Es posible que la distribución de clases no represente adecuadamente todas las cocinas o tipos de comida.

## Enlaces

- Modelo en Hugging Face: [hylin16/food-recognition-food11-effnet-b4-cbam-224](https://huggingface.co/hylin16/food-recognition-food11-effnet-b4-cbam-224)
- Repositorio del proyecto y librería de entrenamiento: [food_recognition](https://github.com/linhongyu510/food_recognition)
- Paper de CBAM: [arxiv:1807.06521](https://arxiv.org/abs/1807.06521)
- Proyecto alternativo de reconocimiento de alimentos: [lannguyen0910/food-recognition](https://github.com/lannguyen0910/food-recognition)
- Modelo de detección de comida: [sayfeldinn/AI-Food-Detector](https://huggingface.co/sayfeldinn/AI-Food-Detector)
