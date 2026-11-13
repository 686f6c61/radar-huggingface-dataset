# botp/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una coleccion de pesos cuantizados del transformer de difusion derivada de Qwen/Qwen-Image-2.1, el modelo de generacion y edicion de imagenes de Alibaba Qwen. El autor identificado como botp publica esta variante bajo la marca "ChatR Labs Uncensored Omni", que consiste en un adaptador LoRA de rango 128 fusionado en el modelo base a fuerza 1.0 y posteriormente cuantizado en multiples formatos (GGUF, FP8, INT8, NVFP4, NF4, BF16). No es un modelo entrenado desde cero: es una redistribucion cuantizada de un fine-tune sobre el modelo oficial.

El repositorio contiene unicamente los pesos del transformer; el text encoder, el procesador y el VAE deben tomarse del repositorio base Qwen/Qwen-Image-2.1. El modelo cuenta con aproximadamente 7.115 millones de parametros en el transformer y el repositorio completo ocupa 92,5 GB debido a la multiplicidad de formatos publicados. Esta pensado para flujos de text-to-image e image-editing en ComfyUI y Diffusers, con opciones que van desde 3,67 GB (NF4) hasta 14,23 GB (BF16).

La relevancia de esta ficha es doble: por un lado documenta un caso real de cuantizacion multi-formato orientada a despliegue en hardware consumer; por otro, advierte de que el modelo se distribuye como "uncensored", lo que implica la eliminacion de filtros de seguridad del modelo original y conlleva implicaciones legales y eticas que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo de imagen, base Qwen-Image-2.1); no disponible el detalle interno de atencion |
| Parametros totales | 7.115.124.736 (transformer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0; FP8 E4M3; INT8 ConvRot; NVFP4; NF4 (bitsandbytes); INT8 (bitsandbytes); BF16 safetensors |
| Idiomas soportados | no disponible (modelo text-to-image; el text encoder base determina el multilingue) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors, GGUF, carpetas torchao/bitsandbytes |
| Tamano del repositorio | 92,5 GB |
| Layouts de tensor | 297 (gate_layer/proj separados) y 265 (img_mlp.gate_up fusionado) |
| Pasos de muestreo recomendados | 35 |
| CFG recomendado | 5.0 (true CFG) |
| Resolucion recomendada | 768x1152 o 1024x1024 |
| Sampler recomendado | er_sde con scheduler simple (ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen-Image-2.1, un transformer de difusion para generacion y edicion de imagenes. Sobre el se aplico un adaptador LoRA de rango 128 ("Omni") entrenado por ChatR Labs y fusionado a fuerza 1.0, dando lugar a un modelo no destilado (no hay destilacion few-step). El resultado se cuantizo en multiples formatos. No se proporciona informacion sobre el dataset de entrenamiento del adaptador, numero de tokens, composicion ni si hubo RLHF/DPO; estos datos no estan disponibles en la informacion proporcionada.

Una innovacion tecnica destacable es la doble representacion del MLP: el layout de 297 tensores mantiene `gate_layer` y `proj` separados, mientras que el de 265 usa la proyeccion fusionada `img_mlp.gate_up`. El cargador debe soportar el layout seleccionado. Ademas, se documenta soporte nativo en ComfyUI 0.39.0 (commit b0b7435, frontend 1.53.6) con los nodos `TextEncodeQwenImage21`, `QwenImage21Cache` y soporte de text encoder INT8 ConvRot. El modelo incluye cache KV activable.

## Capacidades

- Generacion de imagenes text-to-image con resoluciones de 768x1152 y 1024x1024.
- Edicion de imagenes (image-editing) codificando la imagen de referencia con el nodo `Text Encoder (Qwen-Image)` en modo edit.
- Control de negative prompt mediante true CFG (requiere prompt negativo no vacio; se recomienda un espacio).
- Compatibilidad con ComfyUI mediante GGUF (Unet Loader GGUF) o safetensors nativos (Load Diffusion Model).
- Compatibilidad con Diffusers mediante `from_single_file` (GGUF) o `from_pretrained` (BF16, torchao, bitsandbytes).
- Variante "uncensored": se eliminan los filtros de seguridad del modelo base (ver limitaciones).
- No se documentan capacidades de tool calling, agentes, vision de entrada ni audio; no aplica a un modelo de difusion de imagen.

## Casos de uso

- Generacion de ilustracion y arte conceptual en estaciones de trabajo consumer: con el GGUF Q4_K_M (4,47 GB) o Q5_K_M (5,21 GB) el transformer cabe en GPUs de 8-12 GB VRAM, permitiendo iterar localmente sin servicios en la nube.
- Edicion de imagenes por referencia en flujos de retoque: se codifica la imagen original con el text encoder en modo edit y se aplica una instruccion textual, util para variaciones de producto o cambios de estilo controlados.
- Prototipado rapido en ComfyUI: el workflow de ejemplo (`workflow_example.json`) y los nodos nativos permiten montar un pipeline text-to-image en minutos sobre ComfyUI 0.39.0.
- Despliegue en produccion con Diffusers: la variante FP8 torchao (7,12 GB) ofrece la mejor fidelidad en Diffusers, adecuada para servicios de generacion por API con requisitos de calidad alta.
- Experimentacion en hardware limitado: la variante NF4 bitsandbytes (3,67 GB) permite ejecutar el transformer en GPUs de 6-8 GB VRAM, util para investigación y pruebas de concepto.
- Investigacion sobre cuantizacion: el repositorio sirve como banco de pruebas comparativo entre GGUF, FP8, INT8, NVFP4 y NF4 sobre un mismo modelo base, permitiendo medir degradacion de calidad por formato.
- Generacion de contenido sin restricciones de filtro (con las advertencias legales correspondientes): el autor comercializa la variante como "uncensored", orientada a casos donde el modelo base rechaza prompts por politicas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer segun formato: NF4 3,67 GB; NVFP4 y Q4_0 4,20 GB; Q4_K_M 4,47 GB; Q5_K_M 5,21 GB; Q6_K 6,00 GB; FP8, INT8 y Q8_0 en torno a 7,1-7,7 GB; BF16 14,23 GB.
- A esa cifra hay que sumar el text encoder, el VAE y el procesador del modelo base, que no se incluyen en el repositorio; el consumo total supera ampliamente el del transformer aislado.
- GPU consumer: las variantes Q4 y NF4 pueden caber en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) si se gestiona la memoria del resto de componentes; Q5/Q6 requieren 12 GB (RTX 3060 12 GB, RTX 4070); FP8/INT8 en torno a 12-16 GB (RTX 4070 Ti, RTX 4080); BF16 requiere 24 GB (RTX 3090, RTX 4090).
- GPU profesional: A100, H100 y L40S para despliegues de alta concurrencia o BF16 sin compromisos.
- Opciones de despliegue: ComfyUI (GGUF via Unet Loader GGUF, o safetensors nativos), Diffusers (`from_single_file` para GGUF, `from_pretrained` para BF16/torchao/bitsandbytes). Requiere `bitsandbytes` para NF4/INT8 y `torchao` para FP8.
- Latencia y throughput: no disponibles. Los ajustes recomendados son 35 pasos con sampler er_sde y scheduler simple, lo que implica un coste de inferencia no trivial por imagen.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Formatos | Licencia | Notas |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized (este) | 7.115 M | GGUF, FP8, INT8, NVFP4, NF4, BF16 | qwen-research | Fine-tune uncensored cuantizado; requiere componentes del base |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion | safetensors | qwen-research | Modelo oficial con filtros de seguridad; referencia de fidelidad |
| Otros modelos text-to-image de la familia Qwen-Image | no disponible | no disponible | qwen-research | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo "uncensored": se han eliminado los filtros de seguridad del modelo base, lo que puede producir contenido no apto, danino o ilegal segun la jurisdiccion. El uso comercial o publico conlleva riesgo legal y reputacional.
- Licencia qwen-research: restringe el uso, especialmente el comercial; es necesario revisar el archivo LICENSE antes de cualquier despliegue en produccion.
- El repositorio solo incluye el transformer; sin el text encoder, procesador y VAE del modelo base el modelo no funciona. Hay que descargarlos por separado.
- Incompatibilidad de layouts: los formatos de 297 y 265 tensores requieren cargadores distintos; usar el cargador equivocado provoca fallos de carga.
- El workflow BF16 en ComfyUI solo esta verificado con ComfyUI 0.39.0 (commit b0b7435) y el cargador UNETLoader nativo; versiones anteriores pueden no funcionar.
- Es un merge LoRA, no un modelo destilado: no admite generacion few-step; requiere 35 pasos y CFG 5.0 para calidad optima, lo que encarece la inferencia.
- Un negative prompt vacio u omitido desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; hay que usar un espacio.
- Riesgo de alucinacion visual y artefactos propios de modelos de difusion, agravado por la cuantizacion agresiva en formatos Q4 y NF4.
- No se documentan sesgos especificos ni cobertura idiomatica; el comportamiento multilingue depende del text encoder base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-13); no hay evidencia de validacion por la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/botp/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Playground del autor: https://chatrlabs.com/
- ComfyUI (commit de referencia): https://github.com/Comfy-Org/ComfyUI/tree/b0b743566f65daafc423b4fea8a2fbda94b3384a
- Workflow de ejemplo: https://huggingface.co/botp/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/workflow_example.json
- Sumas de verificacion: https://huggingface.co/botp/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/botp/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/LICENSE
