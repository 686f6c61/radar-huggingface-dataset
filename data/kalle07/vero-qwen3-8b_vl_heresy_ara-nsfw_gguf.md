# kalle07/Vero-Qwen3-8B_VL_Heresy_ARA-NSFW_gguf

## Resumen

Vero-Qwen3-8B_VL_Heresy_ARA-NSFW es un modelo vision-lenguaje multimodal de 8.190.735.360 parámetros, publicado por el usuario kalle07 en Hugging Face. Se trata de una versión "descensurada" del modelo zlab-princeton/Vero-Qwen3I-8B, obtenida mediante la herramienta Heretic v2.1.0 y el método Arbitrary-Rank Ablation (ARA), que reduce los rechazos del modelo original ante peticiones consideradas sensibles. Según la model card, la tasa de rechazo baja de 89/100 en el original a 6/100 en esta variante, con una divergencia KL de 0.004 respecto al modelo base.

El modelo parte de la familia Qwen3-VL (arquitectura Qwen3 con capacidades de visión) y añade, en una segunda iteración, una fusión con un LoRA de la serie Qwen3-VL-8B-NSFW-Caption-V4.5, orientado a la descripción de imágenes con contenido NSFW. El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto y genera texto.

Es relevante para desarrolladores e investigadores que necesiten un modelo multimodal pequeño (8B) sin filtros de rechazo para tareas de captioning, análisis de imágenes o generación de texto sin restricciones de contenido, siempre teniendo en cuenta las implicaciones éticas y legales de un modelo explícitamente descensurado. La licencia declarada es Apache 2.0 y los pesos se distribuyen en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (vision-lenguaje); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo contiene pesos cuantizados; no se detallan los niveles exactos en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre zlab-princeton/Vero-Qwen3I-8B, un modelo de la familia Qwen3-VL con capacidades multimodales (image-text-to-text). Según la model card, el modelo original fue entrenado con 600.000 muestras RL curadas procedentes de 59 datasets, distribuidas en 6 categorías de razonamiento visual. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO más allá de las muestras RL mencionadas.

La innovación principal de esta variante es la aplicación de Heretic v2.1.0 con el método Arbitrary-Rank Ablation (ARA), una técnica de ablación de direcciones en el espacio de activaciones que reduce la tendencia del modelo a rechazar peticiones. La model card reporta una divergencia KL de 0.004 respecto al modelo original, lo que indica una alteración mínima de la distribución de salida general. Adicionalmente, la segunda versión fusiona un LoRA de Qwen3-VL-8B-NSFW-Caption-V4.5 con peso 0.8, orientado a mejorar la comprensión y descripción de contenido NSFW. El autor indica que responde bien a system prompts, lo que permite modular el comportamiento mediante instrucciones de sistema.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada y genera descripciones o respuestas textuales (pipeline image-text-to-text).
- Descripción de imágenes (captioning): capacidad reforzada mediante la fusión del LoRA NSFW-Caption, orientada a la descripción detallada de contenido visual, incluido contenido explícito.
- Razonamiento visual: heredado del entrenamiento del modelo base con 600.000 muestras RL en 6 categorías de razonamiento visual.
- Reducción de rechazos: la ablación ARA disminuye la tasa de rechazo a 6/100 según la model card, frente a 89/100 del original.
- Sensibilidad a system prompts: el autor indica que el modelo responde bien a instrucciones de sistema, permitiendo adaptar el tono y el contenido de las respuestas.
- Contenido NSFW: el modelo está etiquetado como `not-for-all-audiences` y no aplica filtros de contenido explícito.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en catálogos y archivos: el modelo puede generar captions detallados de imágenes, incluido contenido para adultos, adecuado para sistemas de gestión de bibliotecas de imágenes que requieran descripciones sin filtros.
- Moderación y etiquetado de contenido NSFW: al no rechazar contenido explícito, puede emplearse para clasificar y etiquetar imágenes según su grado de explicitad en pipelines de moderación, generando descripciones que alimenten clasificadores posteriores.
- Investigación sobre alineación y descensurado: permite estudiar el efecto de técnicas de ablación (ARA) sobre el comportamiento de rechazo y la calidad del modelo, con una divergencia KL medida de 0.004 respecto al original.
- Generación de texto creativo sin restricciones: útil para proyectos de escritura que requieran contenido adulto o temas sensibles, donde los modelos alineados rechazarían la petición.
- Análisis de imágenes en entornos de investigación: para tareas de visión-lenguaje donde se necesite describir escenas complejas sin que el modelo se niegue a procesar contenido explícito.
- Evaluación comparativa de variantes descensuradas: como referencia para medir la degradación de calidad (KL, tasas de rechazo) entre el modelo original y las versiones ablacionadas, en el contexto de estudios sobre seguridad de modelos.
- Asistencia en flujos de trabajo con system prompts personalizados: gracias a su sensibilidad a las instrucciones de sistema, puede configurarse para adoptar roles concretos en aplicaciones de generación de texto e imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del proceso de descensurado: tasa de rechazo de 6/100 frente a 89/100 del modelo original, y divergencia KL de 0.004 respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.190.735.360 parámetros, en cuantización de 4 bits se estiman aproximadamente 5-6 GB de VRAM; en 8 bits, unos 9-10 GB; en FP16, unos 16-17 GB (estimaciones orientativas, no confirmadas en la información disponible).
- GPU recomendadas: para FP16, GPU con 16-24 GB (RTX 4090, A100 40 GB); para cuantizaciones de 4-8 bits, GPU consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080).
- Cabe en GPU consumer: sí, en cuantizaciones GGUF de 4-8 bits en tarjetas con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp y Ollama para los pesos GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. No se detallan otras opciones (vLLM, TGI) en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vero-Qwen3-8B_VL_Heresy_ARA-NSFW | 8.190.735.360 | no disponible | Apache 2.0 | GGUF | Variante descensurada con ARA y LoRA NSFW |
| zlab-princeton/Vero-Qwen3I-8B | 8B (aproximado) | no disponible | no disponible | no disponible | Modelo base original, 89/100 rechazos |
| Qwen3-VL-8B-NSFW-Caption-V4.5 | 8B (aproximado) | no disponible | no disponible | GGUF (via mradermacher) | LoRA de captioning NSFW usado en la fusión |

No se dispone de datos de benchmarks ni de contexto para una comparación cuantitativa de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para no rechazar contenido NSFW y está etiquetado como `not-for-all-audiences`; su uso en producción requiere controles de acceso y cumplimiento normativo.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo, puede producir descripciones inexactas de imágenes.
- Sesgos conocidos: no disponible en la información proporcionada; el proceso de ablación puede alterar el comportamiento del modelo de formas no evaluadas.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el uso de contenido NSFW puede estar sujeto a legislación local y a las políticas de las plataformas de despliegue.
- Caveat para producción: la fusión con un LoRA de terceros (peso 0.8) y la ablación ARA pueden degradar capacidades no evaluadas; el autor indica que no ha probado en profundidad la mejora de comprensión de la segunda versión.
- Procedencia del LoRA: la fuente original del LoRA NSFW-Caption fue eliminada; solo se referencia un espejo en GGUF de mradermacher.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kalle07/Vero-Qwen3-8B_VL_Heresy_ARA-NSFW_gguf
- Modelo base: https://huggingface.co/zlab-princeton/Vero-Qwen3I-8B
- Heretic (herramienta de descensurado): https://github.com/p-e-w/heretic
- LoRA NSFW-Caption original (eliminado): https://huggingface.co/thesby/Qwen3-VL-8B-NSFW-Caption-V4.5
- Espejo GGUF del LoRA: https://huggingface.co/mradermacher/Qwen3-VL-8B-NSFW-Caption-V4.5-GGUF
