# Dax161/perufoodnet-vit-model

# Ficha del modelo Dax161/perufoodnet-vit-model

## Resumen

Dax161/perufoodnet-vit-model es un Vision Transformer (ViT) afinado para clasificar 40 platos tradicionales de la gastronomía peruana. Ha sido desarrollado por Dax Alonso Collas Maldonado, en el marco de Vanguard Robotics, grupo de investigación de la Universidad Peruana de Ciencias Aplicadas (UPC). El modelo parte de la arquitectura `google/vit-base-patch16-224` y se entrena sobre el dataset PeruFoodNet, compuesto por 4.000 imágenes (100 por cada plato).

El modelo resuelve el problema de identificación automática de platos peruanos a partir de imágenes, con el objetivo de facilitar la inferencia de ingredientes y posibles alérgenos en aplicaciones de asistencia al turista o en robótica de propósito general. Su relevancia radica en que combina un dataset específico y de acceso abierto con un modelo de visión de uso extendido, lo que permite integrarlo en pipelines de visión computacional, chatbots o aplicaciones móviles. El repositorio contiene los pesos en formato safetensors (303.342.632 parámetros) y está etiquetado para clasificación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | 303.342.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (etiqueta del modelo; la clasificación es independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Vision Transformer (ViT) con parches de 16x16 píxeles y resolución de entrada de 224x224, tal como indica la model card. Aunque el número de parámetros (303M) es superior al del ViT-base estándar (86M), la documentación del autor menciona `google/vit-base-patch16-224` como modelo base; no se especifica si se realizaron modificaciones en la profundidad o el ancho de la red. El entrenamiento se realizó mediante fine-tuning sobre el dataset PeruFoodNet, que contiene 4.000 imágenes distribuidas en 40 clases de platos peruanos. Se aplicaron técnicas de aumento de datos como Random Resized Crop y Random Horizontal Flip para mejorar la generalización. El proceso se llevó a cabo con la API `Trainer` de Hugging Face en Google Colab, sin que se documenten fases de RLHF o DPO.

## Capacidades

- Clasificación de imágenes en 40 categorías de platos tradicionales peruanos (ceviche, lomo saltado, ají de gallina, etc.).
- Inferencia de ingredientes a partir de la clase predicha, como paso previo para la detección de alérgenos.
- Integración en pipelines de visión computacional para aplicaciones móviles o robóticas.
- Soporte de entrada de imágenes de 224x224 píxeles en formato estándar.
- Funciona como clasificador independiente del idioma, aunque la documentación está en español.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de visión.

## Casos de uso

- Aplicación móvil de identificación de platos peruanos para turistas: el usuario fotografía un plato y el modelo devuelve la clase, permitiendo mostrar información sobre ingredientes y posibles alérgenos.
- Robot de asistencia social en restaurantes: integrado en un sistema de visión, el robot reconoce los platos servidos y puede informar al comensal sobre su contenido.
- Chatbot de recomendación gastronómica: combinado con un módulo de lenguaje, el modelo clasifica la imagen y el chatbot sugiere platos similares o advierte de alérgenos.
- Sistema de inventario o control de calidad en la industria alimentaria: verificación visual de que el plato preparado corresponde a la receta esperada.
- Herramienta educativa para estudiantes de gastronomía: permite etiquetar y catalogar imágenes de platos peruanos de forma automática.
- Investigación académica en visión por computador: sirve como punto de partida para experimentos con datasets de comida regional o para comparar arquitecturas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall o F1 sobre el dataset de validación, ni comparaciones con otros modelos de clasificación de comida.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un ViT de 303M parámetros, se estima un consumo de entre 1 y 2 GB en FP32, y menos de 1 GB en cuantización de 8 bits (si se aplicara).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lote pequeño. Ejemplos: NVIDIA GTX 1650, RTX 3060, RTX 4090, A100.
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 o superiores.
- Opciones de despliegue: puede servirse con Hugging Face Inference Endpoints, o mediante librerías como `transformers` con PyTorch. No se han documentado integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dax161/perufoodnet-vit-model | 303M | no aplica | Clasificación de 40 platos peruanos | no disponible | Hugging Face |
| google/vit-base-patch16-224 | 86M | no aplica | Clasificación general (ImageNet) | Apache 2.0 | Hugging Face |
| Modelos de Food-101 (p.ej. ViT fine-tuned) | 86M-300M | no aplica | Clasificación de 101 tipos de comida | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos sobre el dataset PeruFoodNet. La comparativa se limita a características arquitectónicas y de disponibilidad.

## Limitaciones y advertencias

- El dataset de entrenamiento es reducido (4.000 imágenes, 100 por clase), lo que puede limitar la generalización a variaciones de iluminación, ángulo o presentación de los platos.
- No se han documentado métricas de rendimiento, por lo que se desconoce la precisión real del modelo en producción.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El modelo está entrenado exclusivamente con imágenes de platos peruanos; no reconoce otras gastronomías.
- Puede presentar sesgos derivados de la composición del dataset (por ejemplo, predominio de ciertos estilos de fotografía o fondos).
- Riesgo de alucinación en la inferencia de ingredientes: la clasificación correcta no garantiza que la lista de ingredientes asociada sea exacta, ya que depende de la base de datos externa.
- No se ha verificado el comportamiento en entornos de baja iluminación o con imágenes de baja resolución.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Dax161/perufoodnet-vit-model)
- [Dataset PeruFoodNet en ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2352340925003361)
- [Dataset PeruFoodNet en Mendeley Data](https://data.mendeley.com/datasets/hxhbbm497d/3)
- [Artículo en Semantic Scholar](https://www.semanticscholar.org/paper/PeruFoodNet%3A-A-unique-dataset-of-traditional-food-Gutierrez-Mu%C3%B1oz/eab59b2ea3d9c5f649eaf6e6a33da066393fe2b0)
- [Repositorio alternativo del autor: Dax-Peruvian-food](https://huggingface.co/Dax161/Dax-Peruvian-food)
- [Repositorio alternativo del autor: Peruvian_Food](https://huggingface.co/Dax161/Peruvian_Food)
