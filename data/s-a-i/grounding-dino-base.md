# s-a-i/grounding-dino-base

## Resumen

Grounding DINO base es un modelo de detección de objetos de conjunto abierto (open-set object detection) desarrollado por IDEA Research, presentado en el artículo "Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection" (arXiv:2303.05499). Combina un detector de objetos basado en DINO con un codificador de texto, lo que permite localizar y clasificar objetos en imágenes a partir de descripciones textuales arbitrarias, sin necesidad de etiquetas predefinidas. El modelo alcanza 52,5 AP en COCO zero-shot, lo que lo sitúa como una referencia en su categoría.

Esta ficha se basa en una copia archivada del repositorio original alojada en `s-a-i/grounding-dino-base`, que conserva los pesos sin modificaciones y mantiene la licencia Apache 2.0. El modelo tiene 232,8 millones de parámetros y está disponible en formato safetensors, con un tamaño de repositorio de 1,9 GB. Es relevante para aplicaciones de visión por computador que requieren detectar objetos no vistos durante el entrenamiento, como búsqueda visual, robótica o inspección automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DINO + codificador de texto) |
| Parametros totales | 232.810.880 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision-lenguaje, consultas de texto cortas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado principalmente con texto en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

Grounding DINO extiende el detector de objetos DINO (Detection Transformer) con un codificador de texto, permitiendo la detección de objetos a partir de descripciones en lenguaje natural. La arquitectura combina un backbone de visión (Swin Transformer en la variante base) con un codificador de texto (BERT) y una cabeza de detección que fusiona las características visuales y textuales mediante mecanismos de atención cruzada. El entrenamiento utiliza un esquema de pre-entrenamiento anclado (grounded pre-training) que alinea las representaciones de imagen y texto, logrando un rendimiento de 52,5 AP en COCO zero-shot. No se dispone de detalles específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

## Capacidades

- Detección de objetos de conjunto abierto: localiza y clasifica objetos a partir de consultas de texto arbitrarias, sin necesidad de clases predefinidas.
- Procesamiento de imágenes de resolución variable, sin un límite máximo especificado.
- Consultas de texto en minúsculas que deben terminar en punto (p. ej., "a cat. a remote control.").
- Integración con el ecosistema Hugging Face Transformers mediante `AutoModelForZeroShotObjectDetection` y `AutoProcessor`.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de visión.
- Capacidades multilingües no documentadas; el entrenamiento se realizó principalmente con texto en inglés.

## Casos de uso

- Búsqueda visual en bases de datos de imágenes: permite indexar y recuperar imágenes que contienen objetos descritos por texto, útil en archivos fotográficos o catálogos de productos.
- Inspección industrial automatizada: detecta defectos o componentes específicos en líneas de producción mediante consultas textuales, sin necesidad de reentrenar el modelo para cada nuevo defecto.
- Asistencia a personas con discapacidad visual: integrado en aplicaciones móviles, describe objetos presentes en el entorno a partir de comandos de voz convertidos a texto.
- Robótica y navegación autónoma: localiza objetos de interés (puertas, señales, obstáculos) en tiempo real usando descripciones naturales, facilitando la interacción con entornos no estructurados.
- Moderación de contenido visual: detecta objetos no deseados (armas, sustancias) en imágenes subidas por usuarios, con la flexibilidad de añadir nuevas categorías sin reentrenamiento.
- Análisis de imágenes médicas: identifica estructuras anatómicas o anomalías descritas por texto en radiografías o tomografías, como apoyo a la diagnosis (requiere validación clínica).
- Automatización de etiquetado de datos: genera anotaciones preliminares para conjuntos de datos de entrenamiento, acelerando el proceso de anotación manual.

## Benchmarks y rendimiento

El modelo alcanza 52,5 AP en COCO zero-shot, según la model card original. No se han publicado resultados adicionales de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| COCO zero-shot (AP) | 52,5 |

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM ni latencia en la información proporcionada.
- Con 232,8 millones de parámetros, el modelo en FP32 ocupa aproximadamente 930 MB de memoria, por lo que es viable en GPUs de consumo con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060).
- Para inferencia en producción, se recomienda una GPU con 8 GB o más de VRAM para manejar lotes y resoluciones altas.
- Opciones de despliegue: biblioteca `transformers` de Hugging Face, con soporte para CPU y GPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- El repositorio incluye pesos en safetensors, lo que facilita su carga con `from_pretrained`.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de conjunto abierto en los datos proporcionados. Modelos como OWL-ViT o YOLO-World podrían ser alternativas, pero no se han incluido datos de comparación en la documentación consultada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para detección de objetos; no genera texto ni realiza otras tareas de visión.
- Las consultas de texto deben estar en minúsculas y terminar en punto; de lo contrario, el rendimiento puede degradarse.
- No se documentan sesgos específicos, pero al estar entrenado con datos de imagen-texto, puede heredar sesgos presentes en los datos de entrenamiento (p. ej., género, etnia o contexto cultural).
- Riesgo de alucinación en la detección: puede producir falsos positivos o negativos, especialmente con consultas ambiguas o imágenes de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio `s-a-i/grounding-dino-base` es una copia archivada; se recomienda verificar la licencia en el repositorio original (IDEA-Research/grounding-dino-base) para asegurar el cumplimiento.
- No se especifican limitaciones de contexto de texto, pero las consultas son típicamente frases cortas; no está diseñado para párrafos largos.

## Enlaces

- Repositorio en Hugging Face (copia archivada): https://huggingface.co/s-a-i/grounding-dino-base
- Repositorio original en Hugging Face: https://huggingface.co/IDEA-Research/grounding-dino-base
- Paper original (arXiv): https://arxiv.org/abs/2303.05499
- Documentación de Transformers para Grounding DINO: https://huggingface.co/docs/transformers/model_doc/grounding-dino
- Repositorio oficial en GitHub: https://github.com/IDEA-Research/GroundingDINO
- Sitio web del proyecto: https://groundingdino.org/
