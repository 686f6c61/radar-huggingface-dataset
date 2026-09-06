# hylin16/food-recognition-food101-effnet-b4-cbam

## Resumen

Este modelo es un clasificador de imágenes de comida desarrollado por hylin16, basado en el repositorio food_recognition. Utiliza un backbone EfficientNet-B4 de torchvision al que se le añade un bloque CBAM entre las características extraídas y la cabeza de clasificación, lo que permite resaltar las regiones más relevantes de la imagen. Está entrenado sobre el dataset Food-101, que contiene 101 categorías de platos, con una resolución de entrada de 224 píxeles. El modelo resuelve el problema de identificar automáticamente qué alimento aparece en una fotografía, lo que resulta útil para aplicaciones de diario alimentario, recomendación de recetas o análisis nutricional. Su relevancia radica en la combinación de una arquitectura eficiente con un mecanismo de atención que mejora la precisión, y en que el checkpoint publicado incluye toda la información necesaria para su carga sin configuración adicional. El tamaño del repositorio es de 0.1 GB, por lo que es un modelo ligero, aunque no se especifica el número exacto de parámetros.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B4 con bloque CBAM |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | checkpoint PyTorch (best.pt) |
| Resolución de entrada | 224 px |
| Número de clases | 101 |
| Dataset de entrenamiento | Food-101 |
| Pipeline | image-classification |
| Librería | PyTorch |

## Arquitectura y entrenamiento

El modelo se compone de un backbone EfficientNet-B4 de torchvision, sobre el que se inserta un bloque CBAM (Convolutional Block Attention Module) entre las características y la cabeza de clasificación. CBAM combina una atención de canal seguida de una atención espacial, lo que permite al modelo focalizarse en las regiones de la imagen más relevantes para distinguir entre alimentos. Según la información proporcionada, el entrenamiento se realizó sobre el dataset Food-101 con 101 clases, a resolución de 224 píxeles, durante 30 épocas con batch de 64, learning rate de 0.0003 y scheduler coseno. El proceso fue totalmente supervisado, sin pseudo-etiquetado. El checkpoint publicado corresponde a la época 24, con un tiempo de entrenamiento total de 671 minutos. El repositorio food_recognition re-evalúa cada checkpoint a través de una ruta de evaluación separada y exige que las métricas coincidan con las del run original a seis decimales. El checkpoint embebe la arquitectura, la resolución de entrada y los nombres de las clases, de modo que no es necesario especificarlos al cargar el modelo.

## Capacidades

- Clasificación de imágenes de comida en 101 categorías del dataset Food-101, con devolución de las top-k predicciones.
- Visualización de los píxeles que influyen en la predicción mediante GradCAM, disponible a través del comando food-recognition-gradcam.
- Carga directa del checkpoint desde HuggingFace Hub usando hf_hub_download, con un predictor que gestiona la arquitectura y las clases automáticamente.
- Soporte para predicción por lotes o individual desde Python, integrable en pipelines de visión por computador.
- No soporta tool calling, razonamiento multi-paso ni generación de texto, ya que es un modelo de clasificación de imágenes.
- No dispone de capacidades multilingües ni de entrada de texto, al tratarse de un modelo de visión pura.

## Casos de uso

- Diario alimentario personal: el usuario fotografía sus comidas y el modelo identifica el plato, lo que permite registrar automáticamente la ingesta en una aplicación móvil de seguimiento nutricional. Las 101 categorías cubren una amplia variedad de platos comunes, y la precisión del 89.11% en validación facilita el uso sin correcciones frecuentes.
- Recomendación de recetas: una plataforma culinaria puede clasificar la foto de un plato y sugerir recetas similares o variaciones. Al devolver las top-k predicciones, el sistema puede ofrecer varias opciones al usuario.
- Automatización de menús digitales en restaurantes: en un quiosco o aplicación de pedido, el modelo identifica el plato mostrado en pantalla y muestra su información o precio, agilizando el proceso de selección.
- Investigación en nutrición: en estudios epidemiológicos que recopilan fotos de comidas, el modelo puede preprocesar grandes volúmenes de imágenes para clasificarlas y facilitar el análisis posterior. El macro F1 de 0.8907 indica un rendimiento equilibrado entre las clases.
- Etiquetado automático de fotos de comida en redes sociales o blogs: los usuarios pueden subir imágenes y recibir una etiqueta automática con el plato, mejorando la organización y búsqueda de contenido.
- Herramienta educativa para reconocimiento de alimentos: en aplicaciones de formación sobre gastronomía, el modelo puede usarse para identificar platos en fotografías y mostrar información cultural o histórica asociada a cada categoría.

## Benchmarks y rendimiento

Según el model card, el rendimiento medido en el split de validación completo es el siguiente:

| Métrica | Valor |
|---|---|
| Exactitud de validación | 89.11% |
| Macro F1 | 0.8907 |
| Clases | 101 |
| Resolución de entrada | 224 px |
| Época del checkpoint | 24 |
| Tiempo de entrenamiento | 671 min |
| Clase más difícil | steak (F1 0.636) |
| Clase más fácil | edamame (F1 0.994) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Estas cifras corresponden a la evaluación realizada por el propio autor sobre el dataset de validación de Food-101.

## Requisitos de hardware

- No se han publicado requisitos de hardware oficiales en la información disponible.
- El checkpoint ocupa aproximadamente 0.1 GB, por lo que es probable que quepa en GPUs de consumo, aunque no hay cifras exactas de VRAM.
- No se dispone de una lista de GPUs confirmadas para este modelo.
- El despliegue puede realizarse mediante el repositorio food_recognition, que ofrece load_predictor para Python, y el comando food-recognition-gradcam para visualizaciones.
- No se especifican opciones de integración con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de texto.
- La latencia y el throughput no están documentados en la información disponible.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información proporcionada. La búsqueda web menciona otros proyectos de clasificación de Food-101, como un modelo basado en MobileNetV2 y otro basado en EfficientNet, pero no se dispone de métricas publicadas para establecer una comparación rigurosa. Por tanto, no se puede elaborar una tabla comparativa fiable.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hylin16/food-recognition-food101-effnet-b4-cbam | no disponible | no aplica | 89.11% val. | other | HuggingFace |
| Otros modelos de Food-101 de la búsqueda web | no disponible | no aplica | no disponible | no disponible | GitHub |

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente con el dataset Food-101. La precisión en platos, cocinas o condiciones fotográficas fuera de esa distribución no ha sido medida, y el modelo devolverá una etiqueta con alta confianza incluso para imágenes que no contengan comida.
- Las predicciones no deben interpretarse como un juicio de nutrición, alérgenos o seguridad alimentaria. No se recomienda usar el modelo en contextos donde una clasificación errónea pueda suponer un riesgo para la salud.
- La exactitud de validación del 89.11% es una estimación optimista del rendimiento en condiciones reales, ya que se ha calculado sobre el split público de benchmark.
- La licencia del dataset Food-101 establece que las imágenes pertenecen a Foodspotting, no a ETH Zurich. Los pesos son un derivado de esos datos y se publican para uso en investigación bajo el entendimiento de uso científico justo. Cualquier uso comercial o más allá de la investigación requiere negociación con los propietarios de las imágenes.
- El modelo no soporta texto, tool calling, agentes ni razonamiento de múltiples pasos, por lo que su aplicabilidad se limita a tareas de clasificación de imágenes.
- No se proporcionan pesos cuantizados ni formatos alternativos, por lo que la integración en entornos de despliegue ligero puede requerir una conversión adicional no documentada.

## Enlaces

- HuggingFace: https://huggingface.co/hylin16/food-recognition-food101-effnet-b4-cbam
- Repositorio de entrenamiento: https://github.com/linhongyu510/food_recognition
- Artículo de CBAM: https://arxiv.org/abs/1807.06521
