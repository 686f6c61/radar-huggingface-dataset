# AIAgens/GLM-5.3-Flash-UNCENSORED-NVFP4

## Resumen

GLM-5.3-Flash-UNCENSORED-NVFP4 es una conversión de precisión NVFP4 (W4A16) del fine-tune uncensored `orcarouter/GLM-5.3-Flash-Uncensored-FP8`, publicado por el usuario AIAgens en Hugging Face. El modelo base es GLM-5.3-Flash de Z.ai, un modelo de mezcla de expertos (MoE) de 320 mil millones de parámetros totales con 18 mil millones activos por token, ventana de contexto de un millón de tokens y capacidades multimodales nativas (imagen y texto). El fine-tune de OrcaRouter aplica una técnica de abliteración que elimina los rechazos del modelo, integrando la eliminación de negativas directamente en los pesos, sin necesidad de jailbreak ni LoRA.

Este checkpoint NVFP4 es una cuantización adicional sobre el fine-tune FP8, que preserva la abliteración original. Utiliza el formato `compressed-tensors` de NVIDIA con empaquetado nativo NVFP4 para los expertos enrutados, mientras que el resto de los componentes (atención, visión, MLPs densos, etc.) se mantienen en BF16. El resultado es un modelo de 321.323.031.390 parámetros que ocupa 205,1 GB en disco, diseñado para hardware Blackwell. Es relevante porque ofrece una versión sin censura de un modelo de última generación con un footprint de memoria reducido respecto a las versiones FP8 o BF16, aunque con la advertencia de que es un segundo paso de cuantización con pérdida respecto al fine-tune original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, transformer con atención estándar, bloque MTP (multi-token prediction) en la capa 45 |
| Parametros totales | 321.323.031.390 (321,3 B) |
| Parametros activos | 18 B por token (según datos del modelo base GLM-5.3-Flash) |
| Longitud de contexto | 1.000.000 tokens (según datos del modelo base) |
| Tipos de cuantizacion | NVFP4 W4A16 para expertos enrutados (capas 3-44); BF16 para atención, visión, MLPs densos, expertos compartidos, routers, embeddings, normas, lm_head y bloque MTP |
| Idiomas soportados | no disponible (no especificado en la información proporcionada) |
| Licencia | MIT |
| Formato de pesos | safetensors, formato `nvfp4-pack-quantized` de compressed-tensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE multimodal con 320 B parámetros totales y 18 B activos por token, diseñado para tareas de razonamiento, codificación y trabajo agéntico. Incluye un bloque de predicción multi-token (MTP) en la capa 45 y soporte nativo de visión. El fine-tune de OrcaRouter aplica abliteración (eliminación de rechazos) sobre los pesos del modelo base, publicándose como checkpoint FP8 por bloques. Este checkpoint NVFP4 es una conversión posterior: los pesos FP8 se de-cuantizan a BF16 y luego se cuantizan a NVFP4 con una búsqueda de escala de bloque que minimiza el error (comparando el escalado NVFP4 clásico con el método Four-Over-Six M=6/M=4 de NVIDIA). Los expertos enrutados usan pesos E2M1 por 16 elementos, escalas de bloque E4M3 y una escala por tensor FP32. El KV cache no está cuantizado. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de fine-tune más allá de la técnica de abliteración.

## Capacidades

- Generación de texto y razonamiento multi-step con modo de pensamiento (thinking mode) heredado del modelo base.
- Comprensión y generación multimodal: entrada de imágenes y texto, salida de texto (pipeline `image-text-to-text`).
- Soporte de tool calling y function calling, adecuado para integraciones agénticas.
- Capacidad de trabajo agéntico y uso de herramientas en flujos multi-paso.
- Escritura creativa y conversación sin restricciones de contenido (debido a la abliteración).
- Generación de código y asistencia en tareas de programación.
- Multilingüismo: no confirmado en la información disponible, aunque el modelo base GLM-5.3-Flash probablemente soporta múltiples idiomas.

## Casos de uso

- Asistente de programación sin filtros: el modelo puede generar código, explicar arquitecturas y depurar errores sin rechazar peticiones relacionadas con vulnerabilidades o exploits, útil en entornos de investigación de seguridad ofensiva.
- Automatización de tareas agénticas: gracias al soporte de tool calling y al contexto de 1 M tokens, puede gestionar flujos de trabajo complejos con múltiples llamadas a APIs y razonamiento encadenado.
- Análisis de documentos largos con imágenes: la ventana de 1 M tokens permite procesar libros técnicos completos, informes con gráficos o capturas de pantalla, extrayendo información y respondiendo preguntas.
- Generación de contenido creativo sin restricciones: redacción de narrativa, guiones o material de ficción que requiera explorar temas sensibles sin censura automática.
- Investigación en seguridad de IA: estudio del comportamiento de modelos sin alineación, análisis de sesgos y evaluación de riesgos de abuso en sistemas de IA generativa.
- Desarrollo de chatbots especializados en dominios técnicos: integración en sistemas de atención al cliente o soporte interno donde se necesite manejar consultas complejas y multi-turno con contexto extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base GLM-5.3-Flash ha sido evaluado por Z.ai en tareas de codificación y razonamiento, pero no se dispone de cifras concretas para este checkpoint NVFP4 ni para el fine-tune uncensored. Se recomienda consultar la documentación oficial de Z.ai para los benchmarks del modelo base.

## Requisitos de hardware

- Tamaño del checkpoint: 205,1 GB en disco, lo que implica que la carga en VRAM requiere al menos esa cantidad de memoria, más overhead de activaciones y KV cache.
- GPU recomendadas: hardware NVIDIA Blackwell (B100, B200, RTX 50xx) para aprovechar la aceleración NVFP4 nativa. En GPUs Ampere o Ada Lovelace, el modelo podría ejecutarse pero sin la aceleración específica de NVFP4, con penalización de rendimiento.
- Para inferencia en producción se necesitarían múltiples GPUs: por ejemplo, 4x A100 80GB o 4x H100 80GB (si se tolera la falta de soporte NVFP4), o 2-4x B200 para un despliegue óptimo.
- No cabe en una GPU de consumo estándar (RTX 4090 tiene 24 GB, insuficiente). Se requiere configuración multi-GPU o uso de servicios en la nube.
- Opciones de despliegue: vLLM y TGI soportan el formato compressed-tensors, aunque la compatibilidad específica con NVFP4 empaquetado debe verificarse. También es posible usar llama.cpp si se convierte a GGUF, pero no se ha publicado una versión GGUF de este checkpoint.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de GPUs y de la implementación del servidor de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (Z.ai) | 320 B | 18 B | 1 M | BF16/FP8 | MIT | Hugging Face oficial |
| GLM-5.3-Flash-Uncensored-FP8 (OrcaRouter) | 320 B | 18 B | 1 M | FP8 por bloques | MIT | Hugging Face |
| GLM-5.3-Flash-UNCENSORED-NVFP4 (AIAgens) | 321,3 B | 18 B | 1 M | NVFP4 W4A16 | MIT | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Qwen3-MoE). La principal diferencia entre las tres variantes es la precisión de los pesos y el proceso de abliteración, que afecta al comportamiento de rechazo pero no necesariamente a la calidad de las respuestas.

## Limitaciones y advertencias

- El modelo es un fine-tune sin censura: la abliteración elimina los mecanismos de rechazo, lo que puede generar contenido inapropiado, ofensivo o peligroso si se usa sin supervisión. No es adecuado para despliegues públicos sin moderación adicional.
- Es un segundo paso de cuantización con pérdida: el fine-tune original de OrcaRouter solo existe en FP8, y este checkpoint NVFP4 se obtiene de-cuantizando esos pesos a BF16 y re-cuantizándolos a NVFP4. Esto puede degradar ligeramente la calidad de las respuestas respecto al FP8 original.
- El formato NVFP4 empaquetado requiere hardware Blackwell para un rendimiento óptimo. En GPUs más antiguas, la inferencia puede ser lenta o requerir conversiones adicionales.
- No se han publicado benchmarks específicos para este checkpoint, por lo que no se puede verificar su rendimiento real en tareas estándar.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es una publicación muy reciente y sin validación comunitaria.
- La licencia MIT permite uso comercial, pero el usuario es responsable del cumplimiento legal y ético en su jurisdicción.
- No se dispone de información sobre los idiomas soportados ni sobre posibles sesgos del modelo. Dado que el fine-tune elimina los rechazos, los sesgos subyacentes del modelo base pueden manifestarse sin filtro.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AIAgens/GLM-5.3-Flash-UNCENSORED-NVFP4
- Modelo base (fine-tune FP8): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Artículo sobre el fine-tune uncensored: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Ficha del modelo en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
- Información del modelo base en Modal: https://modal.com/library/zai/glm-5-3-flash
