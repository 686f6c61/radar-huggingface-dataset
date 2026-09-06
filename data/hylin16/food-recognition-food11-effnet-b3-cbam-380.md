# hylin16/food-recognition-food11-effnet-b3-cbam-380

## Resumen

El modelo `hylin16/food-recognition-food11-effnet-b3-cbam-380` es un clasificador de imágenes de comida desarrollado por hylin16, basado en un backbone EfficientNet-B3 de torchvision al que se le añade un bloque CBAM (Convolutional Block Attention Module) entre las características extraídas y la cabeza de clasificación. Está entrenado de forma totalmente supervisada sobre el dataset Food-11, que contiene 11 categorías de alimentos, y se publica bajo licencia MIT.

Resuelve el problema de reconocimiento automático de alimentos en imágenes, una tarea relevante en ámbitos como nutrición, control de calidad alimentaria y aplicaciones móviles de registro de comidas. Su arquitectura CNN con atención de canal y espacial permite recalibrar los mapas de características para mejorar la discriminación entre clases. El modelo opera a una resolución de entrada de 380 píxeles y el checkpoint publicado corresponde a la época 25 de un entrenamiento de 30 épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 con bloque CBAM (atencion de canal y espacial) entre las features y la cabeza de clasificacion |
| Parametros totales | No disponible |
| Longitud de contexto | No aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un clasificador de imágenes basado en EfficientNet-B3, un backbone de torchvision, con un bloque CBAM insertado entre las características extraídas y la cabeza de clasificación. CBAM aplica atención de canal y atención espacial de forma secuencial para recalibrar los mapas de características, lo que permite al modelo centrarse en regiones y canales relevantes para la clasificación de alimentos.

El entrenamiento se realizó sobre el dataset Food-11, con 11 clases, a una resolución de entrada de 380 píxeles, durante 30 épocas con batch size 32, learning rate 0.0005 y scheduler coseno. El proceso fue totalmente supervisado, sin pseudo-etiquetado. El checkpoint publicado corresponde a la época 25 y el entrenamiento completo tardó 51 minutos. No se detalla la composición exacta del dataset ni el número de tokens (al no ser un modelo de lenguaje).

## Capacidades

- Clasificación de imágenes de comida en 11 categorías del dataset Food-11.
- Predicción con top-k: el modelo devuelve las k etiquetas más probables para una imagen de entrada.
- Explicabilidad mediante GradCAM: el repositorio incluye un script que genera mapas de activación para visualizar qué píxeles influyeron en la predicción.
- No soporta tool calling, generación de texto, razonamiento ni capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Aplicación móvil de registro de comidas: el usuario fotografía un plato y el modelo lo clasifica en una de las 11 categorías para estimar calorías o registrar la ingesta. Su tamaño reducido y la predicción top-k facilitan la integración en apps móviles.
- Control de calidad en comedores industriales: clasificación automática de los platos servidos para verificar que el menú coincide con lo planificado. La alta precisión en el dataset de entrenamiento permite detectar errores de servicio.
- Análisis de hábitos alimentarios en estudios de nutrición: los investigadores pueden usar el modelo para clasificar imágenes de diarios alimentarios y obtener estadísticas de consumo por categoría.
- Automatización en restaurantes de autoservicio: identificación del tipo de comida en el plato para facturación automática o para sugerir complementos. El modelo se integra fácilmente en un pipeline de visión por computador.
- Investigación en transfer learning: el checkpoint sirve como punto de partida para fine-tuning en otros datasets de comida o en tareas relacionadas, gracias a la arquitectura EfficientNet-B3 preentrenada.
- Etiquetado automático de imágenes en redes sociales: clasificación de fotos de comida para añadir etiquetas o categorías en plataformas de contenido, aprovechando la predicción top-k.

## Benchmarks y rendimiento

Se han publicado resultados oficiales en el model-index de la model card, calculados sobre el split de validación completo. Los valores están declarados por el autor y no han sido verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 0.9545 |
| Macro F1 | 0.9541 |
| Clases | 11 |
| Resolucion de entrada | 380 px |
| Epoca del checkpoint | 25 |
| Tiempo de entrenamiento | 51 min |
| Clase mas dificil | 02 (F1 0.885) |
| Clase mas facil | 06 (F1 1.000) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. Al ser un clasificador de imágenes con backbone EfficientNet-B3, es probable que se ejecute en GPUs de consumo, pero no se han publicado requisitos específicos.
- Opciones de despliegue: el repositorio `food_recognition` proporciona una función `load_predictor` para cargar el checkpoint en PyTorch. También incluye un script `food-recognition-gradcam` para visualizaciones. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de clasificación de alimentos.

## Limitaciones y advertencias

- Entrenado únicamente en Food-11: la precisión en platos, cocinas o condiciones fotográficas fuera de esa distribución no está medida.
- El modelo devuelve una etiqueta confiada incluso para imágenes que no contienen comida, lo que puede generar falsos positivos.
- Las predicciones no son un juicio nutricional, de alérgenos ni de seguridad alimentaria. No deben usarse donde una clasificación errónea conlleve riesgo para la salud.
- La accuracy reportada es de validación sobre un split público, lo que representa una estimación optimista del rendimiento en campo.
- Sesgos: no se han documentado sesgos específicos en la información proporcionada.
- Riesgo de alucinación: en este contexto, la "alucinación" se manifiesta como etiquetas incorrectas con alta confianza, especialmente en imágenes fuera de distribución.
- Licencia MIT: permite uso comercial, pero sin garantías de ningún tipo.

## Enlaces

- HuggingFace: https://huggingface.co/hylin16/food-recognition-food11-effnet-b3-cbam-380
- Paper de CBAM: https://arxiv.org/abs/1807.06521
- Repositorio food_recognition: https://github.com/linhongyu510/food_recognition
