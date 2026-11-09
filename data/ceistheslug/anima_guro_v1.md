# Ceistheslug/anima_guro_v1

## Resumen

anima_guro_v1 es un adaptador LoRA de tipo text-to-image desarrollado por el usuario Ceistheslug y publicado en Hugging Face bajo la librería diffusers. Se trata de un ajuste fino del modelo base nvidia/Cosmos-Predict2-2B-Text2Image, un transformer de difusión de 2.000 millones de parámetros orientado a la generación de imágenes a partir de descripciones textuales. El LoRA está especializado en la generación de contenido gráfico explícito de temática guro, ero guro y ryona, un subgénero de ilustración japonesa que combina violencia extrema, gore y contenido sexual.

El adaptador se entrenó durante una única época sobre un conjunto de 16.310 imágenes, empleando etiquetas de Danbooru generadas automáticamente con el etiquetador de PixAI y descripciones en lenguaje natural producidas por ToriiGate-0.5. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con el tamaño típico de un LoRA de rango bajo sobre un modelo de 2B. El modelo se publicó el 9 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones positivas.

La relevancia de este modelo es limitada y muy específica: cubre una demanda de nicho dentro de la comunidad de generación de imágenes y sirve como ejemplo de adaptación de un modelo de difusión relativamente pequeño (2B) a un dominio estilístico y temático muy concreto mediante LoRA. No obstante, su contenido plantea serias consideraciones éticas, legales y de política de plataforma que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion (base: nvidia/Cosmos-Predict2-2B-Text2Image) |
| Parametros totales | No disponible (el adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; no aplica contexto de texto en el sentido de LLM) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (prompts en ingles segun los ejemplos de la model card) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio diffusers; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El adaptador se construye sobre nvidia/Cosmos-Predict2-2B-Text2Image, un modelo de difusión basado en transformer (arquitectura DiT) de 2.000 millones de parámetros desarrollado por NVIDIA para generación de imágenes condicionada por texto. El LoRA introduce matrices de bajo rango en las capas del transformer base, lo que permite especializar el modelo sin reentrenar los pesos completos y mantiene un tamaño de repositorio reducido (0,1 GB).

El entrenamiento se realizó durante una sola época sobre 16.310 imágenes. Las anotaciones combinan etiquetas de Danbooru generadas por el etiquetador de PixAI y descripciones en lenguaje natural generadas por ToriiGate-0.5, lo que permite al adaptador responder tanto a listas de etiquetas como a prompts descriptivos extensos. La model card no especifica hiperparámetros de entrenamiento (rank del LoRA, learning rate, resolución, tamaño de batch) ni si se aplicaron técnicas de regularización o validación. La fuerza de aplicación recomendada por el autor es de 1 a 1,32.

## Capacidades

- Generación de imágenes text-to-image especializada en contenido guro, ero guro y ryona.
- Soporte de prompts basados en etiquetas de Danbooru (formato típico de la comunidad de ilustración japonesa).
- Soporte de prompts en lenguaje natural descriptivo, gracias al captioning con ToriiGate-0.5.
- Control mediante negative prompt, con una plantilla extensa proporcionada por el autor para evitar artefactos de calidad y anatomía.
- Ajuste de intensidad del efecto LoRA mediante el parámetro de fuerza (rango recomendado 1–1,32).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustración de nicho para proyectos editoriales o artísticos que aborden el género guro de forma explícita y con audiencia adulta informada: el LoRA permite generar escenas coherentes con la estética del subgénero sin necesidad de entrenar un modelo desde cero.
- Investigación sobre sesgos y seguridad en modelos de difusión: el adaptador sirve como caso de estudio controlado para evaluar cómo un LoRA de bajo rango puede desplazar la distribución de salida de un modelo base hacia contenido extremo, útil en trabajos de red-teaming y filtrado.
- Creación de datasets sintéticos etiquetados para entrenamiento de clasificadores de contenido sensible: las imágenes generadas pueden emplearse, con las salvaguardas adecuadas, para aumentar la cobertura de clases minoritarias en detectores de gore o violencia.
- Pruebas de pipelines de moderación y filtrado en plataformas: permite verificar que los sistemas de detección de contenido bloquean correctamente prompts y salidas de esta categoría antes de un despliegue en producción.
- Estudio académico de la cultura visual del ero guro japonés: investigadores de estudios culturales o de historia del arte pueden generar variaciones controladas para analizar motivos, composiciones y evolución estética del género.
- Desarrollo y validación de herramientas de etiquetado automático: las imágenes generadas con etiquetas conocidas (Danbooru) permiten comprobar la precisión de taggers automáticos en categorías extremas y poco representadas.
- Experimentación con técnicas de LoRA sobre modelos de difusión pequeños (2B): el adaptador es un ejemplo práctico de cómo especializar un modelo compacto con un único epoch y un dataset de 16.310 imágenes, útil para quienes investigan eficiencia en fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo de difusión de 2B en precisión completa (fp32) requiere del orden de 8 GB solo para pesos, y en fp16 alrededor de 4 GB, a lo que hay que sumar activaciones y el codificador de texto; en la práctica se recomienda un mínimo de 8–12 GB de VRAM, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, cabría esperar funcionamiento en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, así como en A100 o H100 para despliegues de mayor throughput; sin embargo, no hay datos publicados que lo confirmen.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del modelo base (2B) y del adaptador (0,1 GB), pero no hay confirmación oficial.
- Opciones de despliegue: la librería declarada es diffusers, por lo que el flujo esperado es cargar el modelo base y aplicar el LoRA con `PeftModel` o `load_lora_weights`. También podría integrarse en ComfyUI (la model card incluye imágenes generadas con ComfyUI) y, potencialmente, en otros frontends compatibles con LoRA de diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anima_guro_v1 | 2B (base Cosmos-Predict2-2B-Text2Image) | LoRA text-to-image | No disponible | No disponible | Hugging Face, 0 descargas |
| nvidia/Cosmos-Predict2-2B-Text2Image | 2B | Transformer de difusion text-to-image | No disponible | No disponible en la informacion proporcionada | Hugging Face (modelo base) |
| SDXL + LoRAs de nicho | ~2,6B (UNet) + encoders | Difusion text-to-image | 1024x1024 tipico | CreativeML Open RAIL++-M (tipica) | Amplia disponibilidad en Hugging Face y Civitai |
| FLUX.1-dev + LoRAs | ~12B | Transformer de difusion (flow matching) | 1024x1024 tipico | FLUX.1-dev Non-Commercial | Hugging Face |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo analizado ni de una licencia declarada, lo que impide una comparación rigurosa en términos de calidad, velocidad o restricciones de uso. Los modelos alternativos se incluyen por categoría (difusión text-to-image con adaptadores LoRA), no por equivalencia medida.

## Limitaciones y advertencias

- Contenido extremadamente sensible: el modelo está entrenado explícitamente para generar gore, violencia sexual, mutilación, necrofilia, canibalismo y otras categorías que pueden vulnerar las políticas de contenido de plataformas, proveedores cloud y legislaciones nacionales.
- Riesgo legal: en muchas jurisdicciones la generación y difusión de este tipo de contenido puede tener implicaciones legales, especialmente si se representa violencia sexual o se combina con apariencia de menores. La model card no incluye salvaguardas ni filtros.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial, redistribución ni modificación. Cualquier uso en producción requiere aclarar previamente los términos con el autor.
- Sesgos y calidad: el entrenamiento se basa en etiquetas automáticas de Danbooru y captions de un modelo (ToriiGate-0.5), lo que puede introducir errores de etiquetado, sesgos estilísticos hacia la ilustración japonesa y una cobertura anatómica limitada a los motivos del dataset.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incoherentes, artefactos y resultados no solicitados; el autor mitiga parcialmente esto con un negative prompt extenso, pero no hay garantías.
- Idioma: los ejemplos y etiquetas están en inglés; no se documenta soporte multilingüe.
- Sin métricas ni validación publicadas: no hay benchmarks, evaluaciones de calidad ni comparaciones objetivas, lo que dificulta estimar su rendimiento real frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso comunitario ni mantenimiento.
- Un solo epoch de entrenamiento: con 16.310 imágenes y una época, es probable que el ajuste sea limitado en diversidad y que el modelo dependa fuertemente del modelo base para la coherencia global.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ceistheslug/anima_guro_v1
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Text2Image
- Repositorio de archivos: https://huggingface.co/Ceistheslug/anima_guro_v1/tree/main
- Etiquetador PixAI (referencia mencionada en la model card, sin URL directa): no disponible
- ToriiGate-0.5 (referencia mencionada en la model card, sin URL directa): no disponible
- Paper o blog de Cosmos-Predict2: no disponible en la informacion proporcionada
