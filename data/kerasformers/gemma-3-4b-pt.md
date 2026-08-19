# kerasformers/gemma-3-4b-pt

## Resumen

`kerasformers/gemma-3-4b-pt` es una conversión íntegra en Keras 3 del modelo base `google/gemma-3-4b-pt` de Google, publicada por el proyecto KerasFormers. Esta implementación permite ejecutar el mismo checkpoint de forma nativa en TensorFlow, PyTorch o JAX sin modificar el código, gracias a la capa de abstracción de Keras 3. Se trata de un modelo multimodal (imagen y texto) de 4 mil millones de parámetros, servido como generación condicionada por imagen y texto (`image-text-to-text`), con pesos almacenados en bfloat16.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y flexible para desarrolladores que trabajan con el ecosistema Keras y desean integrar un modelo de última generación de Google sin depender de la implementación de Transformers. Al ser un checkpoint base (pretrained), no está optimizado para diálogo ni instrucciones, pero puede ser fine-tuning para tareas específicas de visión y lenguaje. Su licencia es Gemma (con acceso restringido), lo que condiciona su uso comercial.

La arquitectura subyacente es la de Gemma 3, un transformer con capacidades multimodales que procesa tanto texto como imágenes. Aunque la model card no detalla la longitud de contexto ni los datos de entrenamiento, se sabe que el modelo original de Google soporta hasta 128k tokens de contexto, pero este dato no se confirma en la información proporcionada. El repositorio ocupa 8.6 GB, coherente con los pesos en bfloat16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) con atención y procesamiento de imágenes |
| Parametros totales | 4 mil millones (según nomenclatura del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la información) |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional), float32 (precisión completa) |
| Idiomas soportados | Inglés (en) según la model card |
| Licencia | Gemma (gated, requiere aceptación) |
| Formato de pesos | No especificado (carga mediante `from_weights`, probablemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 4B, un transformer con atención clásica y capacidades multimodales que acepta tanto texto como imágenes como entrada. La implementación de KerasFormers no modifica los pesos originales, sino que los convierte a un formato compatible con Keras 3, permitiendo la ejecución en múltiples backends. No se proporcionan detalles sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación), ya que esta ficha se centra en la conversión técnica.

El checkpoint es un modelo base (pretrained), por lo que no ha sido sometido a fine-tuning con instrucciones ni RLHF. La carga se realiza en bfloat16 por defecto, con opciones para float32 o cuantización int8. La implementación soporta generación condicionada por imagen mediante `Gemma3ConditionalGenerate` y generación de texto puro con `Gemma3TextGenerate`.

## Capacidades

- Generación de texto condicionada por imágenes (descripción, respuesta a preguntas visuales).
- Procesamiento multimodal: acepta entradas de imagen y texto en la misma conversación.
- Generación de texto libre a partir de prompts de texto (al ser un modelo base, no optimizado para instrucciones).
- Soporte para conversaciones multi-turno mediante el formato de roles (`user`, `assistant`).
- Ejecución en múltiples backends (TensorFlow, PyTorch, JAX) gracias a Keras 3.
- No se mencionan capacidades de tool calling, agentes ni razonamiento explícito; al ser base, estas capacidades requieren fine-tuning.

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar texto descriptivo a partir de una imagen, útil para accesibilidad o indexación de contenido visual.
- Análisis de documentos escaneados: combinando OCR con el modelo, se pueden extraer resúmenes o respuestas sobre el contenido de imágenes de documentos.
- Generación de alt-text para páginas web: automatizar la creación de texto alternativo para imágenes en sitios de gran volumen.
- Fine-tuning para tareas específicas de visión-lenguaje: al ser un modelo base, se puede adaptar con datasets propios para clasificación visual, VQA o generación de informes.
- Prototipado rápido en investigación: su integración con Keras 3 facilita experimentos con diferentes backends sin cambiar el código.
- Integración en pipelines de datos que requieren procesamiento multimodal en entornos con TensorFlow o JAX ya desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 8.6 GB, lo que sugiere que los pesos en bfloat16 requieren aproximadamente 8 GB de VRAM solo para almacenamiento.
- Para inferencia en bfloat16 se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080/3090, RTX 4070/4080, A10, L4).
- Con cuantización int8, la huella de memoria se reduce a unos 4-5 GB, permitiendo ejecución en GPUs de 8 GB como la RTX 3060 o RTX 4060.
- Al ser una implementación en Keras 3, el despliegue puede realizarse en cualquier entorno que soporte TensorFlow, PyTorch o JAX. No se mencionan integraciones específicas con vLLM, Ollama o TGI.
- La latencia y el throughput dependen del backend y del hardware; no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Framework | Licencia | Notas |
|---|---|---|---|---|---|
| `kerasformers/gemma-3-4b-pt` | 4B | No disponible | Keras 3 (TF, Torch, JAX) | Gemma (gated) | Conversión del modelo base de Google |
| `google/gemma-3-4b-pt` | 4B | 128k (según documentación de Google) | Transformers | Gemma (gated) | Modelo original, implementación oficial |
| `kerasformers/gemma-3-1b-pt` | 1B | No disponible | Keras 3 | Gemma (gated) | Variante más pequeña del mismo proyecto |

La comparativa se basa en la información pública; no se dispone de benchmarks para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Es un modelo base, no entrenado para seguir instrucciones; puede generar texto irrelevante o no deseado si se usa directamente en aplicaciones de diálogo.
- La licencia Gemma es restrictiva y requiere aceptación explícita; el uso comercial está sujeto a los términos de Google.
- Solo se indica inglés como idioma soportado en la model card, aunque el modelo original puede tener capacidades multilingües.
- No se proporcionan detalles sobre sesgos o alucinaciones específicas, pero al ser un modelo de lenguaje, existe riesgo de generar información falsa o sesgada.
- La implementación de KerasFormers es una conversión de la comunidad; puede haber diferencias sutiles de comportamiento respecto a la implementación oficial de Transformers.
- No se han publicado benchmarks, por lo que el rendimiento relativo a otros modelos no está verificado.

## Enlaces

- [HuggingFace: kerasformers/gemma-3-4b-pt](https://huggingface.co/kerasformers/gemma-3-4b-pt)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 3 en KerasFormers](https://imvision12.github.io/KerasFormers/gemma3/)
- [Model card original de Google: google/gemma-3-4b-pt](https://huggingface.co/google/gemma-3-4b-pt)
