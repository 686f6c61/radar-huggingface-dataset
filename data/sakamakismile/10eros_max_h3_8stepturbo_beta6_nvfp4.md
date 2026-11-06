# sakamakismile/10Eros_Max_h3_8stepTURBO_beta6_NVFP4

## Resumen

10Eros_Max_h3_8stepTURBO_beta6_NVFP4 es una recuantización en formato NVFP4 del modelo TenStrip/10Eros-Max, un fine-tune de MiniMax-H3 orientado a la generación conjunta de vídeo y audio. El autor del re-bake, sakamakismile, no entrena el modelo: parte del checkpoint pruned en precisión completa (`10Eros_Max_h3_8stepTURBO_beta6_pruned.safetensors`, ~40,2 GB) y lo reempaqueta en un único fichero de 12,53 GB que puede cargarse directamente en ComfyUI.

El modelo hereda la arquitectura multimodal de MiniMax-H3 (rama de vídeo más rama de audio) y está ajustado para muestreo de 8 pasos con el sampler LCM, lo que lo hace utilizable en flujos de generación rápida dentro de ComfyUI. La recuantización a NVFP4 reduce el peso del checkpoint a aproximadamente un tercio del original, lo que permite ejecutarlo en GPUs de gama profesional con 16 GB de VRAM mediante offload.

Su relevancia es acotada pero concreta: es una pieza de infraestructura para quien quiera correr 10Eros-Max beta6 en ComfyUI 0.43.0 o superior sobre hardware Blackwell, con un conjunto de capas cuantizadas idéntico al del contenedor oficial de Comfy-Org (`minimax_h3_fl2va_pruned_nvfp4`), lo que garantiza compatibilidad de carga con el runtime actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (difusión multimodal vídeo + audio, con bloques adaLN) |
| Parametros totales | no disponible (checkpoint pruned de 40.222.950.568 B en precisión completa; el tamaño en parámetros no se declara) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (formato Tensor Core NVFP4 de ComfyUI); el checkpoint base existe en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (12.525.862.136 B, 12,53 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es MiniMax-H3, una arquitectura de difusión para generación conjunta de vídeo y audio. El checkpoint de 10Eros-Max incluye una rama de vídeo y una rama de audio con cabeza de salida clásica de 32 canales (`final_layer.audio_out [32, 5376]`), además de proyecciones adaLN por bloque (`blocks.*.adaln_proj.linear [96768, 2688]`) que en la variante pruned se almacenan de forma compacta (`[96768, 8]` más una tabla precomputada `adaln_t_table [1025, 8]`). El ajuste 8stepTURBO está pensado para muestreo con pocos pasos usando el sampler LCM.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí documenta el autor del re-bake es el proceso de cuantización: se cuantizan exactamente las 200 capas indicadas por los metadatos `.comfy_quant` del contenedor oficial de Comfy-Org, con escala global `amax/(6·448)`, y los 332 tensores restantes se dejan pasar sin cuantizar. El conjunto de capas resultante coincide exactamente con el del contenedor oficial (0 capas faltantes, 0 extra). El script de bake (`bake_b6_nvfp4.py`) se ejecutó en 7 segundos en una RTX PRO 2000 Blackwell usando `comfy.quant_ops.TensorCoreNVFP4Layout`.

## Capacidades

- Generación de vídeo a partir de prompts de texto, con resolución verificada de 512×1024 y 124 fotogramas (5,17 s).
- Generación de audio conjunta con el vídeo: la rama de audio produce salida estéreo a 32 kHz (verificado con niveles medios de −41,7 dB y máximos de −24,4 dB).
- Muestreo de 8 pasos mediante sampler LCM y desplazamiento de sigma configurable (vídeo 12 / audio 3).
- Estabilidad de identidad en rostros y gafas a lo largo de la secuencia, según la demo del autor.
- Compatibilidad con LoRA externos: el flujo verificado aplica `pika_h3_flex_fl2va_v1_bf16.safetensors` (Pika-H3 Flex) mediante `LoraLoaderModelOnly`.
- Integración con el ecosistema ComfyUI: carga vía UNETLoader, text encoder Qwen3-VL 32B cuantizado (`qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`) y VAEs separados de vídeo y audio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Generación de clips cortos con audio sincronizado en ComfyUI: el flujo verificado produce 512×1024×124 fotogramas en 240 s, adecuado para prototipado de vídeo publicitario o redes sociales con pista de audio generada.
- Iteración rápida de prompts sobre hardware de 16 GB: gracias a la cuantización NVFP4 y al offload, un nodo con dos RTX PRO 2000 puede ejecutar el pipeline completo sin necesidad de GPUs de 80 GB.
- Pruebas de identidad de personaje en secuencias: la estabilidad de rostros y gafas reportada permite evaluar consistencia de sujeto antes de escalar a modelos mayores.
- Integración en pipelines de ComfyUI existentes: al compartir el conjunto de capas del contenedor oficial, se puede sustituir el checkpoint oficial por este re-bake sin cambiar los nodos ni los metadatos de cuantización.
- Investigación sobre cuantización NVFP4: el script de bake y la receta documentada sirven como referencia reproducible para recuantizar otros fine-tunes de MiniMax-H3 con la misma disposición de capas.
- Evaluación comparativa de betas de 10Eros-Max: al mantener la cabeza de audio de 32 canales, permite comparar beta6 frente a beta7/beta7_fix1 (que usan cabeza Omni de 1024 dimensiones) en el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es empírico: 512×1024×124 fotogramas generados en 240 segundos en un nodo con 2× RTX PRO 2000 Blackwell (16 GB cada una) con offload activado, usando ComfyUI 0.43.0 (commit fd7639f).

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 12,53 GB, por lo que en inferencia cabe ajustadamente en 16 GB con offload; sin offload se necesita más margen.
- GPU verificadas por el autor: 2× NVIDIA RTX PRO 2000 Blackwell (16 GB), con `aimdo` offload activado.
- El formato NVFP4 requiere soporte de Tensor Cores NVFP4, disponible en la generación Blackwell; no se documenta funcionamiento en arquitecturas anteriores.
- No se confirma que quepa en GPUs consumer (RTX 4090, 5090) en la información proporcionada.
- Despliegue: ComfyUI 0.43.0 o superior (commit fd7639f verificado). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia: 240 s por clip de 124 fotogramas en la configuración indicada. No se documenta throughput en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros_Max_h3_8stepTURBO_beta6_NVFP4 (este) | no disponible (12,53 GB en NVFP4) | no disponible | safetensors NVFP4 | other | Hugging Face, 14 descargas |
| TenStrip/10Eros-Max beta6 pruned (origen) | no disponible (40,22 GB en bf16) | no disponible | safetensors bf16 | no disponible | Hugging Face |
| Comfy-Org minimax_h3_fl2va_pruned_nvfp4 (contenedor oficial) | no disponible | no disponible | safetensors NVFP4 | no disponible | Comfy-Org |
| 10Eros-Max-beta2-NVFP4 (mismo autor) | no disponible | no disponible | safetensors NVFP4 | other | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- La licencia es "other": no se especifican los términos exactos, por lo que el uso comercial requiere consultar la licencia del modelo base (TenStrip/10Eros-Max y MiniMax-H3) antes de desplegar.
- El autor del modelo base desaconseja beta6; este re-bake lo elige deliberadamente porque es la última beta con cabeza de audio de 32 canales compatible con el runtime actual. beta7 y beta7_fix1 no funcionan con la rama de audio de H3 en ComfyUI (error `32 vs 1024`).
- Dependencia estricta de ComfyUI 0.43.0 o superior y de hardware Blackwell para NVFP4; no hay garantía de funcionamiento en otras versiones o arquitecturas.
- El flujo verificado requiere componentes adicionales no incluidos en este repositorio: text encoder Qwen3-VL 32B NVFP4 AWQ, VAEs de vídeo (int8) y audio (fp32), y el LoRA Pika-H3 Flex.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- El modelo es de difusión vídeo-audio, no un LLM: no soporta tool calling, agentes ni razonamiento textual.
- Solo 14 descargas y 0 likes en el momento de la consulta: comunidad de validación muy reducida.

## Enlaces

- [Hugging Face: sakamakismile/10Eros_Max_h3_8stepTURBO_beta6_NVFP4](https://huggingface.co/sakamakismile/10Eros_Max_h3_8stepTURBO_beta6_NVFP4)
- [Modelo base: TenStrip/10Eros-Max](https://huggingface.co/TenStrip/10Eros-Max)
- [Checkpoint origen: 10Eros_Max_h3_8stepTURBO_beta6_pruned.safetensors](https://huggingface.co/TenStrip/10Eros-Max/blob/main/10Eros_Max_h3_8stepTURBO_beta6_pruned.safetensors)
- [Re-bake previo del mismo autor: 10Eros-Max-beta2-NVFP4](https://huggingface.co/sakamakismile/10Eros-Max-beta2-NVFP4)
