# ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED

## Resumen

10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED es un modelo de difusion para generacion de video (texto-a-video, imagen-a-video y audio-video) publicado por el usuario ibyteohdear en Hugging Face. Se trata de una fusion de pesos (weight fusion) del modelo base `ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7` con el LoRA `H3_VBVR_Pro-V2` aplicado a fuerza 1 y horneado directamente en los tensores, de modo que no es necesario cargar ni fusionar el LoRA en tiempo de inferencia.

El modelo se apoya en la familia MiniMax-H3 (etiqueta `minimax-h3` en el repo) y se distribuye en formato diffusers con `trust_remote_code=True`. Cuenta con 20.111.462.920 parametros segun los pesos safetensors y un repositorio de 120,7 GB, lo que lo situa en la categoria de difusores de video de gran tamano. La fusion afecta a 312 tensores y se realizo desde pesos pristinos el 2026-11-22, con verificacion de que el conjunto de claves y los dtypes por clave se mantienen respecto al base.

Su relevancia practica es doble: por un lado, permite muestrear video en 8 pasos (variante TURBO) sin necesidad de apilar LoRAs de aceleracion adicionales; por otro, al estar el LoRA VBVR integrado, simplifica el despliegue al eliminar un paso de carga y fusion en produccion. El repo cambio de contenido el 2026-11-22 bajo los mismos nombres de fichero, por lo que las descargas anteriores corresponden a una fusion distinta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (familia MiniMax-H3), con VAE de video y VAE de audio |
| Parametros totales | 20.111.462.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en la model card; el codigo de ejemplo usa `Int8WeightOnlyConfig` de torchao para el codificador de texto |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (formato diffusers con `custom_code`) |
| Tamano del repositorio | 120,7 GB |
| Pasos de muestreo | 8 (variante TURBO) |
| LoRA fusionado | `ibyteohdear/h3Lora/H3_VBVR_Pro-V2.safetensors`, strength 1, rank 128, alpha por clave 208 |
| Tensores fusionados | 312 (ninguno descartado) |
| Fecha de fusion | 2026-11-22 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna mas alla de su pertenencia a la familia MiniMax-H3 y del uso de componentes modulares de diffusers (`MiniMaxH3PrepareLatentsStep`, `MiniMaxH3PrepareLayoutStep`, `MiniMaxH3SetTimestepsStep`, `MiniMaxH3DenoiseStep`, `MiniMaxH3TextEncoderStep`, `MiniMaxH3DecodeStep`, entre otros). El pipeline incluye un VAE de video (`AutoencoderKLMiniMaxH3`) y un VAE de audio (`AutoencoderKLMiniMaxH3Audio`), lo que confirma soporte de generacion conjunta de audio y video. El codificador de texto empleado en el codigo de ejemplo es de la familia Qwen3-VL (variantes de 4B y 8B, o un 32B cuantizado en NF4), lo que sugiere condicionamiento multimodal texto-imagen.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La innovacion tecnica documentada es la fusion de pesos: el delta TURBO (muestreo en 8 pasos) y el LoRA VBVR Pro-V2 estan integrados en los tensores con fuerza 1, verificandose antes de la subida que el conjunto de claves coincide con el base, que los dtypes por clave no cambian y que los tensores no fusionados son identicos bit a bit al modelo original. La tabla AdaLN de rank 8 es exacta sobre la rejilla de 1025 pasos del sampler y aproximada fuera de ella, por lo que se recomienda muestrear en rejilla.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video), que es el pipeline declarado en el repo.
- Generacion conjunta de audio y video (audio-video), segun las etiquetas del modelo y la presencia de un VAE de audio.
- Muestreo acelerado en 8 pasos gracias al delta TURBO ya integrado en los pesos.
- Condicionamiento multimodal texto-imagen mediante codificadores Qwen3-VL en el pipeline de ejemplo.
- Fusion de estilo/estetica VBVR Pro-V2 aplicada de forma fija (no ajustable en tiempo de ejecucion).
- Soporte de tool calling, function calling y agentes: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado rapido de video generativo: al requerir solo 8 pasos de muestreo, permite iterar sobre prompts e imagenes de entrada con un coste de inferencia muy inferior al de un difusor de video estandar de 30-50 pasos, adecuado para laboratorios que evaluan ideas visuales.
- Generacion de clips con audio sincronizado: la presencia de un VAE de audio en el pipeline permite producir video y banda sonora en una sola pasada, util para demos de producto o contenido para redes sociales.
- Animacion de imagenes fijas (image-to-video): fotografias de producto, ilustraciones o keyframes pueden convertirse en clips cortos, un flujo habitual en estudios de diseno y marketing.
- Previsualizacion en pipelines de postproduccion: los clips generados pueden servir como animaticos o referencias de movimiento antes de rodar o renderizar la version final.
- Investigacion sobre fusion de LoRAs en difusores de video: el repo documenta el proceso exacto de fusion (312 tensores, rank 128, alpha 208, verificacion bit a bit), lo que lo convierte en un caso de estudio reproducible para quien investigue tecnicas de weight merging.
- Evaluacion comparativa de estilos: al estar el LoRA VBVR Pro-V2 horneado a fuerza 1, sirve como referencia fija de un estilo concreto frente a variantes sin fusionar del mismo modelo base.
- Despliegue simplificado en entornos con recursos limitados: al no requerir cargar un LoRA adicional en runtime, reduce la complejidad del grafo de inferencia y el consumo de memoria asociado a la capa PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 20.111 millones de parametros, en precision completa (bf16/fp16) los pesos ocuparian aproximadamente 40 GB, a los que hay que sumar los VAE de video y audio y el codificador de texto; en cuantizacion int8 el transformer se reduciria a unos 20 GB, y en 4 bits a unos 10-11 GB, aunque estas cifras son estimaciones y no estan confirmadas por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de pesos, el modelo no cabe en GPUs de consumo de 24 GB en bf16 sin tecnicas de offloading.
- El codigo de ejemplo aplica `apply_group_offloading` de diffusers, lo que indica que el autor espera ejecucion con offloading de grupos de capas entre CPU y GPU.
- Opciones de despliegue: diffusers con `AutoModel.from_pretrained(..., trust_remote_code=True)` y los bloques modulares `diffusers.modular_pipelines.minimax_h3`; el codigo de ejemplo tambien usa `torchao` para cuantizacion int8 del codificador de texto y `spaces.GPU` para Hugging Face Spaces con Zero-GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max beta7 VBVR FUSED (este) | 20,1 B | no disponible | 8 pasos (TURBO) | minimax-h3-community-license-agreement | Hugging Face, diffusers |
| ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7 (base sin fusionar) | no disponible | no disponible | 8 pasos (TURBO) | no disponible en la informacion | Hugging Face |
| ibyteohdear/Sulphur-3_VBVR_FUSED (referenciado en el codigo) | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| larryvrh/MiniMax-H3-Turbo-Lora (LoRA de aceleracion) | no disponible (LoRA) | no disponible | aceleracion TURBO | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La fuerza del LoRA VBVR Pro-V2 esta horneada a 1 y no puede ajustarse en tiempo de ejecucion; si el efecto es demasiado intenso, la solucion es usar otro repositorio, no un parametro.
- No debe apilarse un LoRA TURBO adicional (por ejemplo `larryvrh/MiniMax-H3-Turbo-Lora` o variantes de `lightx2v`), ya que el delta TURBO ya esta en los pesos y se aplicaria dos veces.
- La tabla AdaLN de rank 8 es exacta solo sobre la rejilla de 1025 pasos del sampler; muestrear fuera de esa rejilla introduce aproximaciones.
- El repositorio cambio de contenido el 2026-11-22 bajo los mismos nombres de fichero: las descargas anteriores corresponden a una fusion distinta con otra fuerza, por lo que deben re-descargarse si se quiere evaluar la version actual.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- Licencia `minimax-h3-community-license-agreement`: las condiciones exactas de uso comercial no se detallan en la informacion disponible y deben consultarse en el texto de la licencia.
- Riesgo de alucinacion visual y de artefactos propios de los difusores de video: no hay datos publicados sobre tasas de fallo, consistencia temporal o calidad subjetiva.
- Idiomas soportados no declarados; el comportamiento multilingue del condicionamiento de texto depende del codificador Qwen3-VL empleado en cada pipeline.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- El tamano del repo (120,7 GB) y la necesidad de offloading condicionan el despliegue en entornos con poca memoria de GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED
- Modelo base sin fusionar: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7
- Repositorio de LoRAs del autor: https://huggingface.co/ibyteohdear/h3Lora
- LoRA fusionado (fichero): https://huggingface.co/ibyteohdear/h3Lora/blob/main/H3_VBVR_Pro-V2.safetensors
- Repositorio referenciado en el codigo de ejemplo: https://huggingface.co/ibyteohdear/Sulphur-3_VBVR_FUSED
- LoRA TURBO de terceros (no apilar): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Codificador de texto alternativo usado en el ejemplo: https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Proyector CLIP para MiniMax-H3: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
