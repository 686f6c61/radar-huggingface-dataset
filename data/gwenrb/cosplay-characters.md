# GwenRB/cosplay-characters

## Resumen

`GwenRB/cosplay-characters` es un clasificador de imágenes especializado en reconocer qué personaje de ficción representa una persona disfrazada de cosplay. Lo desarrolla el usuario GwenRB y está publicado en Hugging Face bajo licencia Apache 2.0. El modelo distingue entre 396 clases de personajes procedentes de anime, videojuegos, cómics y películas, incluyendo variantes de vestuario concretas como `2B (Christmas)` o `Marin Kitagawa (Rizu Kyun)`. Es relevante como ejemplo de fine-tuning completo de un backbone SigLIP 2 para una tarea de clasificación de dominio muy específico, con un conjunto de etiquetas cerrado y bien definido.

Técnicamente se trata de un Vision Transformer base (ViT-B/16) preentrenado con SigLIP 2 sobre WebLI y afinado por completo para clasificación de 396 clases. Con 93,2 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero que cabe en cualquier GPU consumer y se integra directamente en el ecosistema `timm` mediante `timm.create_model("hf-hub:GwenRB/cosplay-characters", pretrained=True)`.

El modelo no genera texto ni razona: es un clasificador de imagen puro con salida softmax sobre 396 etiquetas. Su utilidad práctica está acotada a pipelines de etiquetado, moderación o catalogación de imágenes de cosplay, y su precisión declarada (top-1 98,1 %, macro-F1 97,0 %) debe interpretarse con cautela porque la validación comparte cosplayers y sesiones fotográficas con el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer base (ViT-B/16) con preentrenamiento SigLIP 2 |
| Parametros totales | 93.188.748 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (modelo de clasificación visual, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | timm/vit_base_patch16_siglip_224.v2_webli |
| Biblioteca | timm |
| Pipeline | image-classification |
| Número de clases | 396 personajes |
| Tamaño del repositorio | 0,2 GB |
| Resolución de entrada | 224×224 |

## Arquitectura y entrenamiento

La arquitectura es un ViT-B/16, es decir, un transformer de visión con parches de 16×16 píxeles y aproximadamente 93 millones de parámetros, preentrenado con el objetivo SigLIP 2 sobre el dataset WebLI. El autor parte del checkpoint `timm/vit_base_patch16_siglip_224.v2_webli` y realiza un fine-tuning completo (no solo de la cabeza de clasificación) para adaptarlo a las 396 clases de personajes. La entrada se normaliza a 224×224 mediante el transform resuelto por `timm.data.resolve_data_config`.

Los datos de entrenamiento son fotografías de cosplayers en disfraz obtenidas de publicaciones públicas, etiquetadas manualmente por personaje con ayuda de versiones anteriores del propio modelo. Para que un personaje entre en el conjunto de clases debe contar con un número mínimo de fotos en cada lado del split. La validación reportada es top-1 98,1 % y macro-F1 97,0 %, pero el propio autor advierte que las fotos de validación se separan por archivo de la misma colección, de modo que los mismos cosplayers y a menudo las mismas sesiones fotográficas aparecen en entrenamiento y validación, lo que infla la métrica respecto a un escenario real con cosplayers no vistos.

Una particularidad del preprocesado es que el transform comprime la foto completa a 224×224 en lugar de recortar el centro, tal como se hizo en entrenamiento. El autor indica que el recorte central también funciona pero es menos preciso. No se documentan innovaciones como decodificación especulativa, atención lineal ni mecanismos de razonamiento; es un clasificador estándar.

## Capacidades

- Clasificación de imágenes de cosplay en 396 clases de personajes de anime, videojuegos, cómics y cine.
- Reconocimiento de variantes de vestuario específicas tratadas como clases independientes (por ejemplo, `2B (Christmas)`, `Marin Kitagawa (Rizu Kyun)`, `Tifa (Nurse)`).
- Distinción entre personaje y persona: cada clase es un personaje, nunca un cosplayer concreto.
- Salida de probabilidades softmax sobre las 396 clases, apta para umbrales de confianza (el autor sugiere tratar respuestas por debajo del 50 % como "no seguro").
- Integración nativa con `timm` y PyTorch, incluyendo acceso a `label_names` desde `pretrained_cfg`.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento multi-paso, matemáticas, visión general ni audio. Es exclusivamente un clasificador cerrado de imágenes.

## Casos de uso

- Catalogación automática de galerías de cosplay: dado un lote de fotos, el modelo asigna a cada imagen la clase de personaje más probable, lo que permite organizar y etiquetar colecciones sin intervención manual.
- Moderación y filtrado de contenido en comunidades: clasificar imágenes subidas por usuarios para verificar que corresponden a la categoría de cosplay declarada y detectar desviaciones.
- Etiquetado asistido para datasets: usar las predicciones de alta confianza como preetiquetas en un pipeline de anotación humana, reduciendo el coste de construir nuevos conjuntos de cosplay.
- Búsqueda visual por personaje: indexar imágenes por la etiqueta predicha y habilitar búsquedas del tipo "muéstrame fotos de Frieren" dentro de una base de imágenes.
- Análisis de tendencias de cosplay: agregar las predicciones sobre grandes volúmenes de imágenes públicas para medir qué personajes son más frecuentes en un periodo o comunidad.
- Verificación en concursos o eventos: como apoyo a jueces humanos para comprobar que el personaje representado coincide con la categoría inscrita, siempre con revisión manual dada la limitación de confianza.
- Prototipado rápido en aplicaciones móviles o web: al ser un modelo de 93 M de parámetros y 0,2 GB, puede desplegarse en un servidor modesto o incluso en dispositivos con recursos limitados para clasificación en tiempo real.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Top-1 accuracy | 98,1 % | Validación interna (split por archivo de la misma colección) |
| Macro-F1 | 97,0 % | Validación interna (split por archivo de la misma colección) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ImageNet, etc.) en la información disponible, ni comparaciones con otros clasificadores de cosplay. Las cifras anteriores proceden de la validación del propio autor y están sujetas al caveat de fuga de cosplayers y sesiones entre entrenamiento y validación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-1 GB en FP32 para los 93,2 M de parámetros, más el espacio de activaciones para lotes pequeños; en FP16 baja a unos 0,2-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, una A100 o H100 permite mayor throughput pero no es necesaria.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4090, así como en CPU para inferencia puntual.
- Opciones de despliegue: `timm` + PyTorch (vía `timm.create_model`), exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton, y conversión a otros runtimes. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GwenRB/cosplay-characters | 93,2 M | 224×224 píxeles | Clasificación de 396 personajes de cosplay | Apache 2.0 | Hugging Face |
| timm/vit_base_patch16_siglip_224.v2_webli (base) | ~93 M | 224×224 píxeles | Embeddings visuales genéricos (SigLIP 2) | Apache 2.0 | Hugging Face |
| CLIP ViT-B/32 (OpenAI) | ~88 M | 224×224 píxeles | Clasificación zero-shot imagen-texto | MIT | Hugging Face, open_clip |
| SigLIP 2 ViT-B/16 (Google) | ~93 M | 224×224 píxeles | Embeddings y clasificación zero-shot | Apache 2.0 | Hugging Face |

La comparación directa con clasificadores especializados en cosplay no está disponible, ya que no se han identificado alternativas públicas con el mismo conjunto de 396 clases. Frente a CLIP o SigLIP 2 genéricos, este modelo ofrece etiquetas cerradas y específicas pero pierde la capacidad zero-shot y la versatilidad multimodal.

## Limitaciones y advertencias

- Siempre devuelve una de las 396 clases, incluso ante fotos de personas sin disfraz o de personajes no incluidos; el autor recomienda tratar confianzas por debajo del 50 % como "no seguro".
- La validación reportada (top-1 98,1 %) está inflada por fuga de cosplayers y sesiones fotográficas entre entrenamiento y validación; se espera una precisión notablemente menor con cosplayers no vistos.
- No reconoce personajes fuera de su lista de 396 clases ni variantes de vestuario no incluidas explícitamente.
- El preprocesado comprime la imagen completa a 224×224; fotos con encuadres muy distintos a los de entrenamiento pueden degradar la precisión.
- Posibles sesgos derivados de la fuente de datos: fotos de publicaciones públicas, con posible sobrerrepresentación de ciertos personajes, estilos de cosplay, géneros, etnias o regiones geográficas.
- Riesgo de error en personajes visualmente similares o con vestuarios poco característicos.
- No es un modelo generativo ni conversacional: no admite instrucciones en lenguaje natural ni razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de entrenamiento; conviene validar con datos propios antes de producción.
- El modelo puede perpetuar estereotipos asociados a la representación de personajes; debe usarse con supervisión humana en contextos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GwenRB/cosplay-characters
- Modelo base: https://huggingface.co/timm/vit_base_patch16_siglip_224.v2_webli
- Repositorio `timm`: https://github.com/huggingface/pytorch-image-models
- Documentación de SigLIP 2 (Google): no disponible en la información proporcionada
- Paper de SigLIP 2: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
