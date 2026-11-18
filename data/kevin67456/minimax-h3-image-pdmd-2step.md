# Kevin67456/minimax-h3-image-pdmd-2step

## Resumen
MiniMax-H3-Image pDMD 2-Step es una LoRA de destilación de pasos publicada por el usuario Kevin67456 sobre el modelo base MiniMaxAI/MiniMax-H3-Image, un transformer de difusión de 33.100 millones de parámetros para generación de imágenes texto-a-imagen. La LoRA, denominada pDMD 2-NFE (rank 128 sobre atención y FFN de los 50 bloques del transformer), se ha fusionado en el checkpoint oficial para reducir el muestreo de 6 evaluaciones de denoising (el schedule PDD fijo del modelo original) a solo 2 evaluaciones sobre una rejilla de flow matching estándar, sin CFG y a la resolución nativa de 4096×4096 (16 MP).

El resultado es un adaptador que acelera de forma sustancial la iteración de prompts y semillas, algo que el checkpoint original no permite porque su schedule destilado está fijado a 6 pasos. El repositorio incluye la LoRA en formato diffusers y en formato nativo de ComfyUI, además de un checkpoint bf16 de un solo archivo con la LoRA ya fusionada y el transformer oficial preconvetido a layout diffusers, lo que simplifica el despliegue en distintos stacks.

La relevancia actual reside en la tendencia hacia la destilación de pocos pasos en modelos de difusión de gran escala: permite obtener imágenes de alta resolución en tiempos de 1-1,5 s por fotograma a ~1 MP en hardware ZeroGPU, habilitando casos de previsualización en tiempo real y edición interactiva que con el modelo base resultan inviables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-imagen, con LoRA pDMD de 2 pasos |
| Parámetros totales | 33.122.992.896 (modelo base fusionado con la LoRA) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, int8 (text encoder), nvfp4 (text encoder), FP8 (build del Space) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA diffusers, LoRA ComfyUI, checkpoint bf16 fusionado, transformer sharded) |

## Arquitectura y entrenamiento
El modelo base es un transformer de difusión (DiT) de 33.100 millones de parámetros que opera sobre flow matching y genera imágenes a resolución nativa de 4096×4096 (16 MP). El checkpoint oficial está destilado en pasos con un schedule PDD fijo de 6 evaluaciones de denoising. La LoRA pDMD 2-NFE, descrita en el paper arXiv 2609.35768, aplica un rango 128 sobre las capas de atención y FFN de los 50 bloques del transformer, y se ha fusionado en el modelo oficial para permitir un muestreo de 2 evaluaciones de denoising sobre una rejilla de flow matching estándar, sin classifier-free guidance.

El repositorio distribuye la LoRA en dos layouts: claves en formato diffusers (QKV separadas, `transformer.transformer_blocks.N.attn.to_q...`) y conversión al layout nativo de ComfyUI (proyección `qkv_proj` fusionada en bloque diagonal, mitades SwiGLU reordenadas a `[gate; value]`). También se incluye un checkpoint bf16 de un solo archivo con 208 deltas fusionados en fp32 y metadatos del modelo base preservados, así como el transformer oficial preconvetido a diffusers con pesos sharded en bf16. No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF/DPO, ya que se trata de un adaptador de destilación sobre un modelo preentrenado.

## Capacidades
- Generación de imágenes texto-a-imagen a resolución nativa de 4096×4096 (16 MP) en 2 evaluaciones de denoising.
- Muestreo de pocos pasos: 2 pasos para encuadre rápido, 3-4 pasos para render completo, con pase de detalle integrado.
- Compatibilidad con ComfyUI mediante checkpoint fusionado de un solo archivo o mediante LoRA sobre el repack de Comfy-Org.
- Compatibilidad con diffusers mediante `from_pretrained(..., subfolder="transformer")` y la LoRA en layout diffusers.
- Previsualización en tiempo real a ~1 MP (fotograma de 2 pasos en ~1-1,5 s) y modo de edición interactiva.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni multilingüismo en la información disponible.

## Casos de uso
- Previsualización interactiva de prompts: el adaptador permite generar fotogramas de ~1 MP en 1-1,5 s con 2 pasos, lo que hace viable una interfaz de escritura en vivo con pulido de detalle al pausar, algo imposible con el schedule fijo de 6 pasos del modelo base.
- Edición iterativa de imágenes: el modo de edición en tiempo real del Space asociado procesa un fotograma de 2 pasos por fragmento (~0,9 s por fotograma en la build FP8), adecuado para flujos de trabajo de ajuste continuo sobre una imagen fuente.
- Iteración rápida de semillas y prompts en producción: al reducir de 6 a 2 evaluaciones de denoising, el coste por render cae aproximadamente a un tercio, lo que acelera la exploración de variaciones en pipelines de generación por lotes.
- Generación de imágenes de alta resolución para impresión o cartelería: la resolución nativa de 4096×4096 (16 MP) permite obtener material listo para soportes de gran formato sin reescalado posterior.
- Integración en ComfyUI para artistas y estudios: el checkpoint fusionado de un solo archivo (40 GB) se carga directamente en `ComfyUI/models/diffusion_models/` sin nodo de LoRA, simplificando la cadena de nodos y reduciendo errores de configuración.
- Despliegue en infraestructura con GPUs de datacenter: con un DiT en bf16 y un text encoder int8, el modelo rinde ~20 s por imagen a 2048² en una H200, adecuado para servicios de generación por API con requisitos de latencia moderados.
- Investigación sobre destilación de pocos pasos: el repositorio sirve como referencia reproducible para estudiar la fusión de LoRAs pDMD en transformers de difusión de gran escala y comparar layouts diffusers frente a nativos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el checkpoint fusionado en bf16 ocupa 40 GB, por lo que la inferencia requiere al menos esa cantidad de memoria más el text encoder y el VAE.
- GPU recomendadas: H200 (referencia del autor, ~20 s por imagen a 2048² con DiT bf16 y text encoder int8); GPUs de datacenter con suficiente VRAM para el checkpoint de 40 GB.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el tamaño del checkpoint bf16 (40 GB) excede la VRAM de las RTX 4090 (24 GB) en bf16, y no se indican cuantizaciones GGUF ni FP8 para consumo.
- Opciones de despliegue: ComfyUI (checkpoint fusionado o LoRA sobre el repack de Comfy-Org), diffusers con el transformer preconvetido, Space de ZeroGPU (build FP8).
- Latencia y throughput: ~1-1,5 s por fotograma de 2 pasos a ~1 MP en ZeroGPU; ~0,9 s por fotograma en la build FP8 del Space; ~20 s por imagen a 2048² en H200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/resolución | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image pDMD 2-Step (este) | 33,1 B | 4096×4096 (16 MP) | 2 (hasta 3-4 con detalle) | Apache 2.0 | Hugging Face, ComfyUI, diffusers |
| MiniMaxAI/MiniMax-H3-Image (base) | 33,1 B | 4096×4096 (16 MP) | 6 fijos (schedule PDD) | no disponible | Hugging Face |
| Comfy-Org/MiniMax-H3-Image (repack) | 33,1 B (poda) | 4096×4096 (16 MP) | 6 fijos | no disponible | Hugging Face, ComfyUI |

No se dispone de información sobre otros modelos de difusión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias
- El adaptador depende del modelo base MiniMax-H3-Image; no es un modelo autónomo y requiere el checkpoint oficial o el repack de Comfy-Org.
- El checkpoint fusionado en bf16 ocupa 40 GB, lo que limita su uso a hardware con VRAM suficiente y descarta GPUs de consumo en esa precisión.
- El modelo base carece de pesos de audio; los tensores de la rama de audio no utilizados están a cero.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del repack de Comfy-Org antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es todavía inexistente.
- No se ofrecen cuantizaciones GGUF ni versiones de baja precisión para consumo; el despliegue en GPUs pequeñas no está soportado de forma documentada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Kevin67456/minimax-h3-image-pdmd-2step
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- LoRA pDMD 2-NFE original: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- Paper: https://arxiv.org/abs/2609.35768
- Conversión ComfyUI de Iwannapose: https://huggingface.co/Iwannapose/minimax_h3_pdmd_2nfe_comfyui
- Repack Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Space de demostración: https://huggingface.co/spaces/akhaliq/minimax-h3-image-2step
