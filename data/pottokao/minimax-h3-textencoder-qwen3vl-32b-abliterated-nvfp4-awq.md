# pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ

## Resumen

El modelo `pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ` es un codificador de texto (text encoder) cuantizado para el modelo de vídeo MiniMax-H3, desarrollado por el usuario pottokao. Se trata de una adaptación del modelo Qwen3-VL-32B-Instruct, al que se le han recortado las capas (de 64 a 50) y se le han eliminado el `lm_head` y la normalización final, de modo que solo se consume la salida de la capa 50, que es la que utiliza el modelo H3 para condicionar la generación de vídeo. El modelo está cuantizado en NVFP4 (W4A16, group_size 16) mediante NVIDIA ModelOpt, con escalas AWQ en las proyecciones `down_proj` y `o_proj`, y se sirve a través de vLLM-Omni. Su objetivo principal es reducir el coste de memoria del pipeline de MiniMax-H3, permitiendo ejecutar el stack completo en GPUs de consumo. El modelo pesa 15.7 GB y tiene 13.565.089.520 parámetros. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión-lenguaje (Qwen3-VL-32B) recortado como text encoder; 50 capas |
| Parametros totales | 13.565.089.520 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16, group_size 16) con AWQ `pre_quant_scale` en `down_proj`/`o_proj`; `embed_tokens` en FP8 (e4m3); vision tower y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato ModelOpt para vLLM-Omni) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-32B-Instruct, un transformer multimodal de visión y lenguaje. La arquitectura se ha modificado para funcionar como codificador de texto dentro del pipeline de MiniMax-H3: se conservan las primeras 50 capas de las 64 originales y se eliminan el `lm_head` y la normalización final. La cuantización NVFP4 (W4A16) se aplica a las capas lineales, con un tamaño de grupo de 16, y se añaden escalas AWQ (`pre_quant_scale`) en `down_proj` y `o_proj` para compensar la pérdida de precisión; estas escalas se han buscado por capa sobre activaciones reales, con valores medianos de 0.4 y 0.5 respectivamente. Las incrustaciones (`embed_tokens`) se almacenan en FP8 (e4m3), mientras que la torre de visión y todas las normas se mantienen en BF16. El proceso de abliteration (eliminación de comportamientos de rechazo) no está documentado en la información disponible; tampoco se especifican los datos de entrenamiento, el número de tokens ni si se aplicó RLHF o DPO.

## Capacidades

- Codificación de texto para el condicionamiento de vídeo en el modelo MiniMax-H3 (text-to-video e image-to-video).
- Derivado "abliterated" / "uncensored": no aplica mecanismos de rechazo de contenido.
- Compatible con vLLM-Omni a través del formato ModelOpt (W4A16_NVFP4 con `pre_quant_scale`).
- Integrable en ComfyUI mediante CLIPLoader (tipo `minimax`) como reemplazo directo del text encoder original.
- Capacidades multimodales heredadas del modelo base (procesamiento de imagen y texto), aunque en esta configuración se usa como encoder de texto.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Generación de vídeo a partir de texto con MiniMax-H3: el modelo se utiliza como codificador de texto para condicionar la generación de vídeo, permitiendo reducir la VRAM necesaria gracias a la cuantización NVFP4.
- Generación de vídeo a partir de imagen (image-to-video): el encoder procesa la descripción textual de la imagen de entrada y la incorpora al pipeline H3.
- Despliegue en vLLM-Omni: el modelo se sirve como componente de un servicio de generación de vídeo en producción, aprovechando la compatibilidad con el formato ModelOpt y la cuantización W4A16_NVFP4.
- Integración en ComfyUI: se puede cargar como text encoder en un flujo de trabajo de ComfyUI (CLIPLoader, tipo `minimax`) para generar vídeo en local, ya que el modelo está diseñado para caber en GPUs de consumo.
- Investigación en compresión de modelos: el modelo sirve como caso de estudio de cuantización NVFP4 con escalas AWQ en encoders de texto para modelos de vídeo, mostrando cómo reducir el tamaño sin perder la compatibilidad con el pipeline.
- Investigación en alineación y seguridad: la variante abliterated permite estudiar el efecto de eliminar los mecanismos de rechazo en un encoder multimodal, comparándolo con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en NVFP4 ocupan aproximadamente 15.7 GB; se necesita VRAM adicional para activaciones y overhead. Para el encoder solo, una GPU con al menos 16 GB podría ser suficiente, pero se recomienda 24 GB para margen.
- GPU recomendadas: RTX 3090/4090 (24 GB) o GPUs de datacenter como A100/H100 para despliegues con vLLM-Omni. Según la descripción de 6block, la cuantización busca llevar el stack completo de H3 a GPUs de consumo, por lo que es viable en hardware de gama alta de consumo.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) al menos para el encoder; el modelo H3 completo podría requerir más memoria, no especificada.
- Opciones de despliegue: vLLM-Omni (formato ModelOpt), ComfyUI (CLIPLoader), transformers (aunque la model card especifica que debe servirse con vLLM-Omni).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ | 13.57B | no disponible | NVFP4 + AWQ | Apache 2.0 | HuggingFace |
| 6block/MiniMax-H3-Qwen3-VL-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | HuggingFace |
| Qwen/Qwen3-VL-32B-Instruct | no disponible | no disponible | BF16 (sin cuantizar) | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Es un componente (text encoder) y no un modelo de generación de vídeo completo; no puede producir vídeo por sí solo.
- Derivado "abliterated" / "uncensored": no se han documentado mitigaciones de sesgos ni filtros de seguridad; puede generar contenido no deseado o inapropiado.
- Riesgo de alucinación: al ser un encoder, no genera texto directamente, pero el modelo base subyacente puede alucinar en otras tareas si se usa fuera del pipeline H3.
- Limitaciones de contexto e idioma: no especificadas en la documentación disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben mantener los avisos de licencia y atribución.
- Caveat de producción: el formato ModelOpt requiere vLLM-Omni con soporte para `W4A16_NVFP4` y `pre_quant_scale`; una build NVFP4 sin `pre_quant_scale` no cargará. Además, la cuantización puede introducir pérdida de precisión en comparación con el modelo original.

## Enlaces

- https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ
- https://huggingface.co/6block/MiniMax-H3-Qwen3-VL-NVFP4
- https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors
