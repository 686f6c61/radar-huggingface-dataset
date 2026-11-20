# blonokm/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una compilación de pesos cuantizados del modelo de difusión Qwen/Qwen-Image-2.1, publicada por el usuario blonokm bajo la marca ChatR Labs. Se trata de un adaptador LoRA de rango 128 ("Omni") fusionado en el modelo base a fuerza 1.0 y posteriormente cuantizado en múltiples formatos (GGUF, FP8, INT8, NVFP4, NF4). El objetivo declarado es ofrecer generación texto-a-imagen y edición de imágenes sin los filtros de contenido del modelo original, manteniendo la fidelidad del merge.

El repositorio contiene únicamente los pesos del transformer cuantizados: el text encoder, el processor y el VAE deben tomarse del repositorio base Qwen/Qwen-Image-2.1. El modelo cuenta con 7.115.124.736 parámetros reales en safetensors y un tamaño de repositorio de 92,5 GB, que incluye las doce variantes de cuantización publicadas.

Es relevante ahora porque ofrece builds ligeros (desde 3,67 GB en NF4 hasta 14,23 GB en BF16) compatibles con ComfyUI y Diffusers, lo que permite ejecutar un modelo de imagen de 7B en GPUs de consumo. La licencia qwen-research limita el uso comercial y conviene revisarla antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión transformer (text-to-image / image editing) basado en Qwen-Image-2.1; pesos del transformer cuantizados |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0; FP8 E4M3; INT8 ConvRot; NVFP4; FP8 (torchao); NF4 (bitsandbytes); INT8 (bitsandbytes); BF16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors, GGUF; layouts de 297 y 265 tensores según variante |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen-Image-2.1, un modelo de difusión para generación y edición de imágenes. Sobre él se aplica un adaptador LoRA de rango 128 denominado "Omni", fusionado a fuerza 1.0 y después cuantizado. No se trata de un proceso de destilación few-step: la model card indica explícitamente que es un merge LoRA regular, por lo que requiere el esquema de muestreo completo (35 pasos, CFG 5.0).

Las cuantizaciones publicadas emplean dos layouts distintos de tensores: el layout de 297 tensores mantiene proyecciones separadas `gate_layer` / `proj` en el MLP, mientras que el de 265 tensores usa la proyección fusionada `img_mlp.gate_up`. El cargador debe soportar el layout seleccionado. Las variantes `-comfy.safetensors` (FP8, INT8 ConvRot, NVFP4) están pensadas exclusivamente para ComfyUI, mientras que las carpetas torchao y bitsandbytes lo están para Diffusers. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación texto-a-imagen con resolución de salida recomendada de 768x1152 o 1024x1024.
- Edición de imágenes: codificación de imagen de referencia mediante el nodo `Text Encoder (Qwen-Image)` en modo edición.
- Generación sin filtros de contenido (variante "uncensored" declarada por el autor).
- Compatibilidad con ComfyUI mediante `Unet Loader (GGUF)`, `Load Diffusion Model` y cargadores nativos de cuantización.
- Compatibilidad con Diffusers mediante `from_pretrained` (BF16), `from_single_file` (GGUF) y las variantes torchao y bitsandbytes.
- Soporte de true CFG con escala 5.0 y sampler `er_sde` con scheduler `simple`.
- Caché KV habilitada durante la inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- Generación de ilustraciones y arte conceptual: con 35 pasos y CFG 5.0 se obtienen imágenes de 1024x1024 a partir de prompts descriptivos, usando la variante GGUF Q5_K_M (5,21 GB) en una GPU de consumo.
- Edición de imágenes por referencia: se codifica la imagen original con el text encoder en modo edición y se aplica un prompt de modificación, útil para retoques de producto o variaciones de diseño.
- Prototipado rápido en ComfyUI: el flujo de trabajo con BF16 transformer, INT8 text encoder y BF16 VAE permite iterar visualmente sin escribir código.
- Despliegue en entornos con VRAM limitada: la variante NF4 (3,67 GB) o NVFP4 (4,20 GB) permite ejecutar el transformer en GPUs de 8 GB, dejando espacio para el text encoder y el VAE.
- Investigación sobre alineación y filtros de contenido: la variante "uncensored" sirve para estudiar el comportamiento del modelo base frente a prompts restringidos, siempre dentro de los límites de la licencia qwen-research.
- Integración en pipelines de Diffusers: la variante FP8 (torchao) ofrece la mejor fidelidad dentro de Diffusers y encaja en scripts Python automatizados de generación por lotes.
- Evaluación comparativa de cuantizaciones: el repositorio publica doce builds del mismo merge, lo que permite medir el impacto de cada formato en calidad y velocidad sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: 3,67 GB (NF4), 4,20 GB (NVFP4, Q4_0), 4,47 GB (Q4_K_M), 5,21 GB (Q5_K_M), 6,00 GB (Q6_K), 7,12-7,26 GB (FP8, INT8, Q8_0), 14,23 GB (BF16).
- A esa cifra hay que sumar la VRAM del text encoder y del VAE del repositorio base, no incluidos en este repo.
- GPU recomendadas: RTX 4090 o A100/H100 para BF16 sin compromisos; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para Q5_K_M/Q6_K; GPUs de 8 GB para NF4 o NVFP4.
- Cabe en GPU de consumo: sí, con las variantes NF4, NVFP4, Q4_0 y Q4_K_M.
- Opciones de despliegue: ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4), Diffusers con torchao (FP8) o bitsandbytes (NF4, INT8), y Diffusers `from_single_file` para GGUF.
- Latencia y throughput: no disponibles. La model card solo fija 35 pasos de muestreo con sampler `er_sde` y scheduler `simple`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115.124.736 | no disponible | qwen-research | Hugging Face, 12 builds cuantizados | Merge LoRA rango 128, sin destilación few-step |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion | no disponible | qwen-research | Hugging Face | Modelo original con filtros de contenido |
| Otras variantes cuantizadas de Qwen-Image-2.1 | no disponible | no disponible | qwen-research | no disponible | No se dispone de datos comparativos |

No se dispone de información sobre benchmarks ni sobre modelos alternativos de la misma categoría con los que comparar rendimiento.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue en producción.
- El repositorio solo incluye el transformer: sin el text encoder, processor y VAE del modelo base, el modelo no funciona.
- La variante "uncensored" elimina filtros de contenido, lo que puede producir salidas inapropiadas, ofensivas o ilegales según el prompt; no hay salvaguardas documentadas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar detalles incoherentes, texto ilegible o anatomías incorrectas.
- No es un modelo destilado: requiere 35 pasos y true CFG 5.0, por lo que la latencia es mayor que en modelos few-step.
- El layout de tensores (297 vs 265) debe coincidir con el cargador; usar un layout incompatible provoca fallos de carga.
- Las variantes `-comfy.safetensors` no funcionan en Diffusers y las carpetas torchao/bitsandbytes no funcionan en ComfyUI.
- El flujo BF16 en ComfyUI solo se verificó con ComfyUI 0.39.0 y el `UNETLoader` nativo; no se garantiza en versiones anteriores.
- Un prompt negativo vacío u omitido desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; se recomienda usar un espacio simple.
- No hay información sobre sesgos, idiomas soportados ni composición del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- [Hugging Face: blonokm/Qwen-Image-2.1-Uncensored-Omni-Quantized](https://huggingface.co/blonokm/Qwen-Image-2.1-Uncensored-Omni-Quantized)
- [Modelo base: Qwen/Qwen-Image-2.1](https://huggingface.co/Qwen/Qwen-Image-2.1)
- [Playground de ChatR Labs](https://chatrlabs.com/)
- [Chatr AI](https://thechatr.ai)
