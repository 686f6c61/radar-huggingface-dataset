# DeepNeuralNerd/Gemma-4-12B-it-uncensored-heretic-DeepNeuralNerd-LTX_2.5_ComfyUI

## Resumen

Este modelo es un text encoder especializado para el pipeline de generación de vídeo LTX-2.5 en ComfyUI, desarrollado por el usuario DeepNeuralNerd. Se construye a partir del checkpoint `llmfan46/gemma-4-12B-it-uncensored-heretic`, una versión "abliterada" de Gemma 4 12B que elimina los rechazos residuales del modelo original, y se convierte a un formato de archivo único compatible con ComfyUI, preservando las proyecciones de vídeo y audio específicas de LTX-2.5.

El objetivo declarado por el autor es mejorar la fidelidad de los prompts en LTX-2.5, evitando que el text encoder estándar ignore o debilite peticiones legítimas por culpa de comportamientos de rechazo residuales. No se trata de un modelo de lenguaje general ni de un reemplazo del difusor de LTX-2.5, sino de un componente de condicionamiento de texto para flujos de trabajo de vídeo y audiovisual.

La relevancia actual radica en que LTX-2.5 es un modelo de generación de vídeo reciente y este es el primer text encoder comunitario de Gemma 4 12B adaptado a él, disponible en dos precisiones (BF16 e INT8 ConvRot). El repositorio pesa 39,4 GB e incluye ambos archivos. La licencia es "other" y depende de los términos de Gemma 4 y LTX-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 Unified 12B (multimodal: lenguaje, visión, audio) |
| Parametros totales | 12B (aproximado, no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8 ConvRot |
| Idiomas soportados | Multilingüe (según el modelo base) |
| Licencia | other (depende de Gemma 4 y LTX-2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una conversión determinista de tensores del checkpoint `llmfan46/gemma-4-12B-it-uncensored-heretic`, que a su vez es una versión abliterada de Gemma 4 12B. No se realizó ningún entrenamiento adicional: el proceso consistió en remapear las capas del modelo base a la estructura esperada por el text encoder de LTX-2.5 en ComfyUI. El mapeo documentado es:

- `model.language_model.*` → `model.*`
- `model.vision_embedder.*` → `vision_model.*`
- `model.embed_vision.embedding_projection.weight` → `multi_modal_projector.embedding_projection.weight`
- `model.embed_audio.embedding_projection.weight` → `audio_projector.embedding_projection.weight`

El tokenizer se incrusta como `tokenizer_json` dentro del archivo safetensors. La abliteración del modelo base elimina los rechazos de seguridad del Gemma 4 original, pero no modifica las capacidades de generación del difusor LTX-2.5. El autor advierte explícitamente que esto no "desensura" la salida visual del modelo de difusión.

## Capacidades

- Text encoder para LTX-2.5 en ComfyUI, compatible con flujos de texto a vídeo y audiovisuales.
- Preserva las proyecciones de lenguaje, visión y audio del LTX-2.5 original, manteniendo la ruta de condicionamiento intacta.
- Soporta image-to-video en los flujos de trabajo que lo permitan.
- Mayor fidelidad de prompts que el text encoder estándar, al eliminar rechazos residuales que debilitaban peticiones legítimas.
- Disponible en dos precisiones: BF16 (mayor calidad) e INT8 ConvRot (menor uso de memoria).
- No es un modelo de lenguaje conversacional ni un reemplazo genérico de Gemma 4; su uso está restringido al ecosistema LTX-2.5.

## Casos de uso

- Generación de vídeo texto a vídeo con LTX-2.5: el encoder convierte prompts complejos en condicionamientos precisos, evitando que el difusor ignore partes de la descripción.
- Generación audiovisual: al preservar las proyecciones de audio, permite crear clips con sonido sincronizado a partir de texto.
- Flujos de image-to-video: se puede usar como encoder de condicionamiento en workflows que parten de una imagen inicial.
- Prototipado creativo en ComfyUI: artistas y diseñadores pueden experimentar con prompts largos y detallados sin que el modelo los filtre o debilite.
- Investigación sobre abliteración y text encoders: sirve como caso de estudio de cómo la eliminación de rechazos afecta al condicionamiento en modelos de difusión.
- Comparación de fidelidad de prompts: permite evaluar diferencias entre el encoder estándar de LTX-2.5 y esta versión modificada, usando el mismo prompt, semilla y configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El autor solo indica que realizó una validación de ejecución en un flujo local de ComfyUI, comprobando que el modelo se carga correctamente, que las proyecciones de LTX se cargan y que la generación de extremo a extremo funciona sin errores de forma de tensor. No hay métricas de calidad de vídeo ni comparaciones cuantitativas con otros encoders.

## Requisitos de hardware

- El archivo BF16 pesa aproximadamente 24 GB (estimación para 12B en BF16), por lo que requiere una GPU con al menos 24 GB de VRAM para cargarlo completo.
- El archivo INT8 ConvRot reduce el uso de memoria a aproximadamente 12-14 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o similares con 16 GB o más.
- Se recomienda una GPU con soporte CUDA o ROCm; el autor menciona que hay versiones optimizadas para AMD ROCm en la comunidad.
- El despliegue se realiza exclusivamente a través de ComfyUI, colocando el archivo en `ComfyUI/models/text_encoders/` y seleccionándolo en el cargador de text encoder de LTX-2.5.
- No es aplicable a vLLM, llama.cpp u otros motores de inferencia de LLM, ya que no es un modelo de lenguaje autónomo.
- La latencia depende del difusor LTX-2.5 y de la GPU; el text encoder en sí añade un coste de inferencia de una pasada de 12B, que en una RTX 4090 suele ser de unos pocos segundos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| Este modelo | Text encoder LTX-2.5 | 12B | no disponible | other | ComfyUI |
| Text encoder estándar de LTX-2.5 | Text encoder | no disponible | no disponible | no disponible | ComfyUI |
| Gemma 3 LTXV encoder | Text encoder para LTX-Video | no disponible | no disponible | no disponible | ComfyUI |

No se dispone de datos públicos de rendimiento comparativo entre estos encoders. La diferencia principal es que este modelo elimina los rechazos residuales del Gemma 4 original, lo que puede mejorar la fidelidad de prompts legítimos, pero no está validado con métricas objetivas.

## Limitaciones y advertencias

- El modelo base está abliterado, lo que significa que puede generar contenido que los checkpoints estándar rechazarían. El autor recomienda revisar el contenido generado antes de publicarlo o distribuirlo.
- No desensura la salida visual del difusor LTX-2.5; solo afecta al condicionamiento de texto. Las limitaciones y sesgos del modelo de difusión permanecen intactos.
- No es un reemplazo genérico de Gemma 4 ni un checkpoint de Transformers independiente; su uso fuera de ComfyUI con LTX-2.5 no está soportado.
- La licencia "other" depende de los términos de Gemma 4 y LTX-2, que pueden imponer restricciones de uso comercial. Es necesario revisar ambas licencias antes de usar el modelo en producción.
- No hay garantías de soporte ni mantenimiento; el autor declara explícitamente que no hace promesas sobre el funcionamiento.
- El modelo no ha sido evaluado con benchmarks estandarizados, por lo que su rendimiento en tareas generales de lenguaje es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DeepNeuralNerd/Gemma-4-12B-it-uncensored-heretic-DeepNeuralNerd-LTX_2.5_ComfyUI
- Modelo base: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Paper de LTX-2.5: https://arxiv.org/abs/2601.03233
- Discusión del autor sobre abliteración: https://old.reddit.com/r/StableDiffusion/comments/1vmdxzk/psa_im_the_creator_of_heretic_and_i_advise_you_to/
