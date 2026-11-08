# chenzs/Qwen-Image-Edit-2511-BF16-ComfyUI

## Resumen

Qwen-Image-Edit-2511-BF16-ComfyUI es un repositorio de redistribución de pesos del modelo de edición de imagen Qwen-Image-Edit-2511, empaquetado en formato de archivo único para su uso directo en ComfyUI. No se trata de un modelo entrenado por el autor del repositorio (chenzs), sino de un repackaging que reúne los pesos en BF16 del modelo base de Qwen junto con variantes cuantizadas (FP8, INT8) y una colección de LoRAs de terceros orientadas a tareas específicas de edición de imagen.

El modelo subyacente, Qwen-Image-Edit-2511, es un modelo de difusión de tipo image-to-image de aproximadamente 20.000 millones de parámetros desarrollado por el equipo Qwen. Su función es la edición de imágenes guiada por instrucciones en lenguaje natural, con mejoras respecto a versiones anteriores (2509) en consistencia de personajes, edición multipersona, sustitución de materiales y control de iluminación. El repositorio incluye además pesos derivados de FireRed-Image-Edit-1.0, otro modelo de edición de imagen.

La relevancia de este repositorio es práctica: simplifica el despliegue del modelo en ComfyUI al proporcionar archivos ya organizados en las carpetas correctas (`diffusion_models` y `loras`), con múltiples niveles de cuantización para adaptarse a distintos presupuestos de VRAM. La licencia Apache 2.0 facilita su uso comercial, aunque las condiciones reales dependen de las licencias de los modelos base y de los LoRAs incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión image-to-image (no se detalla la variante interna en la información disponible) |
| Parámetros totales | ~20B (según la model card de Qwen-Image-Edit-2511) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, FP8 (e4m3fn y mixta), INT8 (convrot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo único para ComfyUI, `diffusion-single-file`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo de difusión más allá de su naturaleza image-to-image y su tamaño de aproximadamente 20.000 millones de parámetros. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas (por ejemplo, mecanismos de atención o schedulers específicos) en las fuentes consultadas.

El repositorio en sí no entrena ningún modelo: agrupa los pesos originales de Qwen-Image-Edit-2511 (y de FireRed-Image-Edit-1.0) en archivos únicos listos para ComfyUI, junto con LoRAs de la comunidad que añaden capacidades como migración de iluminación, generación de múltiples ángulos, fusión de imágenes, retoque de luz y conversión de "cualquier cosa a real". Estos LoRAs proceden de repositorios de dx8152 y lrzjason, y se distribuyen como archivos safetensors independientes.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image).
- Consistencia de personajes mejorada respecto a versiones anteriores del modelo.
- Edición multipersona con coherencia entre sujetos.
- Sustitución de materiales en la imagen (material replacement).
- Control de iluminación y retoque mediante LoRAs específicos (Relight, Light-Migration).
- Generación de múltiples ángulos de un mismo sujeto (LoRA Multiple-angles).
- Fusión de imágenes (LoRA Fusion).
- Conversión de imágenes sintéticas o estilizadas a apariencia realista (LoRA Anything2Real).
- Transformación de fondos blancos en escenas completas (LoRA White_to_Scene).
- Integración nativa con flujos de trabajo de ComfyUI mediante plantillas oficiales.
- Soporte de tool calling, agentes o razonamiento multi-step: no disponible (es un modelo de difusión de imagen, no un LLM).

## Casos de uso

- Edición de fotografía de producto: sustituir materiales o fondos de imágenes de catálogo usando el workflow de material replacement y el LoRA White_to_Scene, manteniendo la coherencia del objeto editado.
- Postproducción de retrato: aplicar el LoRA Relight para recolocar la iluminación de un retrato sin rehacer la toma, aprovechando la consistencia de personajes del modelo 2511.
- Generación de vistas múltiples para e-commerce: usar el LoRA Multiple-angles para obtener ángulos adicionales de un mismo producto a partir de una sola imagen de referencia.
- Limpieza de imágenes generadas por IA: emplear el LoRA Anything2Real para convertir renders o ilustraciones en imágenes de aspecto fotográfico antes de publicarlas.
- Flujos de trabajo en ComfyUI para artistas técnicos: cargar los safetensors en `models/diffusion_models` y encadenar nodos de edición con los LoRAs en `models/loras` para prototipar pipelines de edición por lotes.
- Edición multipersona en entornos de moda o publicidad: el modelo 2511 está optimizado para mantener la identidad de varios sujetos en una misma escena, útil para composiciones grupales.
- Despliegue en hardware limitado: seleccionar la variante FP8 o INT8 del repositorio para ejecutar la edición en GPUs con menos VRAM que las necesarias para BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por el tamaño del repositorio (40,9 GB en total, con varios archivos), los pesos BF16 de un modelo de ~20B ocupan del orden de decenas de GB, mientras que las variantes FP8 e INT8 reducen sustancialmente ese requisito. No se confirman cifras exactas en las fuentes.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; las variantes FP8 e INT8 del repositorio están pensadas precisamente para reducir el consumo de VRAM, pero no se especifica qué modelos concretos las soportan.
- Opciones de despliegue: ComfyUI (formato nativo del repositorio, con plantillas oficiales para 2509 y 2511 en INT8 y material replacement). Otras opciones como vLLM, llama.cpp o TGI no aplican a este tipo de modelo de difusión y no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2511 (este repackaging) | ~20B | Difusión image-to-image | no disponible | Apache 2.0 | Hugging Face, ComfyUI |
| Qwen-Image-Edit-2509 | no disponible | Difusión image-to-image | no disponible | Apache 2.0 (según repositorio base) | Hugging Face, ComfyUI |
| FireRed-Image-Edit-1.0 | no disponible | Difusión image-to-image | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un repackaging de terceros; no es el repositorio oficial de Qwen ni de FireRedTeam, por lo que la trazabilidad y las garantías de integridad dependen del autor del repackaging.
- La licencia Apache 2.0 declarada en el repositorio debe verificarse contra las licencias de los modelos base (Qwen-Image-Edit y FireRed-Image-Edit) y de cada LoRA, que pueden tener condiciones distintas.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de edición de imagen, los riesgos se refieren a artefactos visuales, pérdida de identidad en sujetos y ediciones no fieles a la instrucción.
- No se especifican los idiomas soportados en las instrucciones de edición.
- El rendimiento real depende de la variante de cuantización elegida; las versiones FP8 e INT8 pueden degradar la calidad frente a BF16.
- Los LoRAs incluidos son de la comunidad y no han sido validados por el autor del modelo base; su comportamiento puede variar entre versiones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se proporcionan métricas de latencia, throughput ni requisitos oficiales de VRAM.

## Enlaces

- Repositorio del repackaging: https://huggingface.co/chenzs/Qwen-Image-Edit-2511-BF16-ComfyUI
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Tutorial de ComfyUI para Qwen-Image-Edit-2511: https://docs.comfy.org/tutorials/image/qwen/qwen-image-edit-2511
- Workflow Qwen Image Edit 2509: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_edit_2509.json
- Workflow Qwen Image Edit 2511 INT8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_edit_2511_int8.json
- Workflow Qwen Image Edit 2511 (material replacement): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_edit_2511.json
- LoRA Light-Migration: https://huggingface.co/dx8152/Qwen-Edit-2509-Light-Migration/
- LoRA Multiple-angles: https://huggingface.co/dx8152/Qwen-Edit-2509-Multiple-angles
- LoRA Fusion: https://huggingface.co/dx8152/Qwen-Image-Edit-2509-Fusion
- LoRA Relight: https://huggingface.co/dx8152/Qwen-Image-Edit-2509-Relight
- LoRA Anything2Real: https://huggingface.co/lrzjason/QwenEdit-Anything2Real_Alpha/
