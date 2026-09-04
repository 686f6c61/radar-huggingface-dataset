# Lasols/TBAC-UniImage-3B

## Resumen

TBAC-UniImage-3B es un modelo unificado de comprensión y generación de imágenes desarrollado por el Basic Algorithm Center de Tencent. Integra un modelo de lenguaje multimodal (Qwen2.5-VL-3B-Instruct) como módulo de comprensión y un modelo de difusión (Sana_1600M_512px_diffusers) como módulo de generación. El modelo está diseñado para resolver tareas de text-to-image y edición de imágenes a partir de instrucciones en lenguaje natural, combinando en un único sistema las capacidades de entender imágenes y generarlas.

El nombre "UniImage" refleja esta unificación: el modelo procesa texto e imagen, y mediante queries aprendibles fusiona la información multimodal para producir condiciones de generación. Según los metadatos de HuggingFace, el repositorio contiene 5.681.505.091 parámetros totales (aproximadamente 5,68 mil millones), lo que lo sitúa en la categoría de modelos medianos. La arquitectura es híbrida y no se especifica la longitud de contexto en la información disponible.

El modelo está publicado con licencia Apache 2.0 y sus pesos se distribuyen en formato safetensors. Los resultados presentados en la model card muestran un rendimiento competitivo en benchmarks de generación como GenEval y DPG-Bench, así como en tareas de edición de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo unificado de comprensión y generación: MLLM (Qwen2.5-VL-3B-Instruct) + modelo de difusión (Sana_1600M_512px_diffusers) |
| Parametros totales | 5.681.505.091 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según metadatos; no se documenta soporte multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TBAC-UniImage-3B combina un modelo de lenguaje multimodal (Qwen2.5-VL-3B-Instruct) con un modelo de difusión (Sana_1600M_512px_diffusers). El MLLM actúa como módulo de comprensión: procesa la entrada de texto e imagen, y genera queries aprendibles que fusionan la información multimodal. Estas queries se utilizan como condición de generación, sin incorporar directamente representaciones del VAE de la imagen, según se indica en la model card. Esta aproximación permite que el modelo mantenga consistencia multimodal en tareas de edición.

Los datos de entrenamiento incluyen los datasets BLIP3o-Pretrain-Long-Caption, BLIP3o-Pretrain-JourneyDB, BLIP3o-60k, ShareGPT-4o-Image y GPT-Image-Edit-1.5M. No se menciona el número de tokens utilizados ni la composición exacta del dataset. Tampoco se indica si se aplicó RLHF, DPO u otras técnicas de alineación. El código de entrenamiento e inferencia está adaptado del repositorio MetaQuery, como se reconoce en la model card.

La principal innovación técnica es la unificación de comprensión y generación en un solo modelo, utilizando queries aprendibles para transferir información multimodal al módulo de difusión. Esto evita depender de representaciones VAE explícitas y permite una edición de imágenes más flexible y consistente.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image): el modelo produce imágenes fotorrealistas, ilustraciones y arte conceptual a partir de descripciones detalladas.
- Edición de imágenes mediante instrucciones: recibe una imagen de entrada y una instrucción textual, y genera una versión editada manteniendo la coherencia visual.
- Comprensión multimodal: procesa simultáneamente texto e imagen, lo que le permite interpretar el contenido de una imagen antes de editarla o generar nuevas.
- Soporte de prompts complejos y descriptivos: los ejemplos de la model card incluyen descripciones largas con detalles de iluminación, estilo, composición y atmósfera.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.
- No se especifica capacidad de procesamiento de audio ni video.

## Casos de uso

- Generación de ilustraciones fotorrealistas: el modelo puede crear imágenes detalladas de animales, paisajes o escenas naturales a partir de descripciones textuales. Es adecuado para producir contenido visual para blogs, presentaciones o redes sociales.
- Edición de imágenes con instrucciones: en flujos de trabajo de retoque fotográfico, el modelo permite modificar una imagen existente mediante una instrucción en lenguaje natural, por ejemplo cambiando el estilo o añadiendo elementos, sin necesidad de herramientas manuales complejas.
- Creación de arte conceptual para videojuegos o cine: dada la capacidad de generar escenas con estilos específicos (steampunk, gothic horror, pop art), resulta útil para explorar conceptos visuales y direcciones de arte.
- Generación de imágenes para marketing y publicidad: el modelo puede producir variaciones de un producto o escena promocional a partir de un prompt textual, acelerando la creación de contenido publicitario.
- Prototipado rápido de diseños: en procesos de diseño gráfico, permite generar múltiples versiones de una idea visual en segundos, sirviendo como base para iteraciones posteriores.
- Documentación visual automatizada: puede generar imágenes que acompañen artículos técnicos o tutoriales, a partir de descripciones de conceptos o procesos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa en los benchmarks GenEval y DPG-Bench. Los resultados se presentan tal cual aparecen en la documentación original.

| Metodo | Base (M)LLM | GenEval | DPG-Bench |
|---|---|---|---|
| MetaQuery | Qwen2.5-VL-3B-Instruct | 0.78 | 81.10 |
| MetaQuery | Qwen2.5-VL-7B-Instruct | 0.80 | 82.05 |
| BILP-3o | Qwen2.5-VL-3B-Instruct | 0.81 | 79.36 |
| BILP-3o | Qwen2.5-VL-7B-Instruct | 0.83 | 80.73 |
| BAGEL | MoT-7B | 0.82 | - |
| Show-o2 | Qwen2.5-1.5B-Instruct | 0.73 | 85.02 |
| Show-o2 | Qwen2.5-7B-Instruct | 0.76 | 86.14 |
| Tar | Qwen2.5-1.5B-Instruct | 0.76 | 82.96 |
| Tar | Qwen2.5-7B-Instruct | 0.84 | 84.65 |
| Qwen-Image | Qwen2.5-VL-7B-Instruct | 0.87 | 88.32 |
| **TBAC-UniImage-3B** | **Qwen2.5-VL-3B-Instruct** | **0.87** | **80.97** |

Además, se menciona el benchmark TIIF-Bench y la tarea ImgEdit, pero no se proporcionan métricas numéricas en la información disponible.

## Requisitos de hardware

- El tamaño total del repositorio es de 11.4 GB. Con 5.681.505.091 parámetros en FP16, el peso de los pesos es de aproximadamente 11.36 GB, por lo que se necesitará una VRAM mínima de 12 GB para inferencia en precisión completa, más overhead.
- Para cuantización en 4 bits, no hay datos publicados. No se especifican los tipos de cuantización disponibles.
- GPU recomendada: una RTX 4090 (24 GB) o una A100 (40/80 GB) permitiría ejecutar el modelo en FP16 con margen. Una RTX 3090 (24 GB) también sería suficiente.
- No se dispone de información sobre latencia ni throughput.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de difusión, se requiere el código de inferencia del repositorio GitHub oficial (https://github.com/Tencent-BAC/TBAC-UniImage).

## Comparativa con modelos similares

La comparativa se basa en los resultados de benchmarks proporcionados en la model card. No se dispone de especificaciones técnicas adicionales (contexto, licencia, etc.) para los modelos comparados.

| Modelo | Base (M)LLM | GenEval | DPG-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TBAC-UniImage-3B | Qwen2.5-VL-3B-Instruct | 0.87 | 80.97 | Apache-2.0 | HuggingFace, GitHub |
| MetaQuery | Qwen2.5-VL-3B-Instruct | 0.78 | 81.10 | No disponible | Repositorio oficial |
| BILP-3o | Qwen2.5-VL-3B-Instruct | 0.81 | 79.36 | No disponible | No disponible |
| Show-o2 | Qwen2.5-1.5B-Instruct | 0.73 | 85.02 | No disponible | No disponible |
| Qwen-Image | Qwen2.5-VL-7B-Instruct | 0.87 | 88.32 | No disponible | No disponible |

TBAC-UniImage-3B destaca por alcanzar un GenEval de 0.87, igualando a Qwen-Image que usa un MLLM de 7B, aunque con un DPG-Bench inferior. Comparado con otros métodos que usan Qwen2.5-VL-3B-Instruct, obtiene el mejor resultado en GenEval.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible. Como todo modelo de generación, puede reflejar sesgos presentes en los datos de entrenamiento.
- Existe riesgo de alucinación en la generación de imágenes, especialmente con prompts ambiguos o muy complejos.
- El modelo está etiquetado solo para inglés, por lo que el soporte en otros idiomas no está garantizado y podría producir resultados degradados.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia de los modelos base (Qwen2.5-VL-3B-Instruct y Sana_1600M_512px_diffusers) para asegurar el cumplimiento en el despliegue.
- No se proporcionan especificaciones de cuantización ni herramientas de despliegue estándar, lo que puede limitar su integración en pipelines de producción existentes.
- La fecha de publicación en HuggingFace es 2026-09-03, lo que indica que el modelo es muy reciente. La documentación es limitada y no incluye información sobre límites de contexto ni datos de entrenamiento detallados.

## Enlaces

- HuggingFace (autor original): https://huggingface.co/TencentBAC/TBAC-UniImage-3B
- HuggingFace (espejo indicado en los datos): https://huggingface.co/Lasols/TBAC-UniImage-3B
- GitHub: https://github.com/Tencent-BAC/TBAC-UniImage
- Arxiv: https://arxiv.org/abs/2508.08098
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Modelo base Sana_1600M_512px_diffusers: https://huggingface.co/Efficient-Large-Model/Sana_1600M_512px_diffusers
