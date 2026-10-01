# Iwannapose/minimax_h3_pdmd_2nfe_comfyui

## Resumen

Este repositorio contiene una LoRA de destilacion PDMD (Projected Distribution Matching Distillation) para el modelo de generacion de video MiniMax-H3, convertida al formato nativo de ComfyUI. Se trata de un adaptador de tipo student a 2 pasos (2 NFE), derivado del modelo base MiniMax-H3-33B, que reduce el coste de inferencia a dos evaluaciones de red manteniendo el comportamiento del modelo profesor. El adaptador tiene rango 128 y cubre las proyecciones de atencion y las dos capas feed-forward de los 50 bloques transformer mas los 2 bloques del token refiner. El autor es Iwannapose, que publica esta conversion como complemento de la variante de 4 NFE del mismo proyecto.

El modelo es relevante porque permite ejecutar generacion de video texto-a-video de un modelo de 33B en tan solo 2 pasos de denoising dentro de ComfyUI, sin necesidad de CFG (el H3 base esta destilado con guidance). La conversion resuelve los desajustes de nomenclatura entre el formato PEFT de diffusers y el layout interno de ComfyUI para H3, incluyendo el fusionado de q/k/v en `qkv_proj` y la reordenacion de las mitades gate/up del SwiGLU.

La licencia declarada es Apache-2.0 y el repositorio ocupa 5,9 GB (incluye las versiones bf16 y fp32 del adaptador). El modelo base se distribuye por separado y su licencia y especificaciones completas no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusion de video; el modelo base MiniMax-H3-33B no detalla su arquitectura interna en la informacion disponible |
| Parametros totales | no disponible (adaptador LoRA de rango 128; el modelo base tiene 33B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (recomendado) y fp32 (identico numericamente, mayor tamano) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout ComfyUI H3) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 128 obtenida mediante Projected Distribution Matching Distillation, un metodo de destilacion que entrena un student para igualar la distribucion del profesor. El student opera a 2 NFE (dos evaluaciones de red / dos pasos de denoising), frente a los pipelines de mas pasos habituales. El adaptador cubre las proyecciones de atencion (q, k, v y out) y las dos capas feed-forward (fc1 y fc2) de los 50 bloques transformer y de los 2 bloques del token refiner. La fuente original es la LoRA `pdmd2026/pdmd_2NFE_lora`, de la que esta version es una conversion de formato.

La conversion al layout de ComfyUI H3 aplica cuatro transformaciones: fusion de q/k/v en `qkv_proj` con `A = [A_q; A_k; A_v]` por filas y `B = block_diag(B_q, B_k, B_v)` en orden `[q; k; v]` (A de `[384, 5376]` y B de `[21504, 384]`); remapeo SwiGLU porque diffusers emite `[value; gate]` y el kernel `_swiglu_eager` de ComfyUI espera `[gate; up]`, intercambiando las dos mitades de 14336 filas de cada `mlp.fc1.lora_B`; asignacion de entradas alpha (`qkv_proj = 384`, `out_proj/fc1/fc2 = 128`) de forma que la escala `alpha/rank` de ComfyUI sea 1.0, coincidente con la escala de fusion PDMD; y renombrado de claves (`to_out.0 → attn.out_proj`, `ff.net.0.proj → mlp.fc1`, `ff.net.2 → mlp.fc2`, `transformer_blocks.N → blocks.N`, `token_refiner.refiner_blocks.N → token_refiner.blocks.N`). La conversion se valido con 468 comprobaciones numericas exactas en fp32, con un conjunto de claves identico al de la LoRA turbo de referencia y con las 208 claves destino presentes en `minimax_h3_ref2va_int8_convrot.safetensors`, ademas de cotejarse tensor a tensor contra un conversor independiente de la comunidad.

## Capacidades

- Generacion de video texto-a-video en 2 pasos de denoising (inferencia de 2 NFE).
- Aplicacion como adaptador de destilacion sobre el modelo base MiniMax-H3-33B; no funciona de forma autonoma sin el modelo base.
- Integracion nativa en ComfyUI mediante el nodo `LoraLoaderModelOnly`.
- Compatibilidad con el cargador estandar de ComfyUI para el layout H3.
- Uso con la configuracion de scheduler H3 (shift 12 para video y 3 para audio), lo que sugiere que el pipeline base contempla componentes de video y audio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue en la informacion disponible.

## Casos de uso

- Generacion rapida de video en ComfyUI: al operar a 2 pasos, permite producir clips de video texto-a-video con un coste de inferencia muy inferior al del modelo base sin destilar, adecuado para iteracion de prompts.
- Prototipado de pipelines de video: util para validar flujos de trabajo en ComfyUI antes de comprometer recursos con el modelo completo o con variantes de mas pasos.
- Previsualizacion en produccion de contenido: generacion de borradores de video rapidos para revision artistica antes de un render final de mayor calidad.
- Investigacion en destilacion de modelos de difusion: sirve como referencia reproducible de un student PDMD a 2 NFE con rango 128 y cobertura completa de atencion y FFN.
- Comparacion de regimenes de pasos: junto con la variante de 4 NFE (`Iwannapose/minimax_h3_pdmd_4nfe_comfyui`), permite estudiar el compromiso entre calidad y numero de evaluaciones de red.
- Integracion en automatizaciones ComfyUI basadas en API: al ser un fichero safetensors compatible con el cargador estandar, puede incorporarse a flujos programaticos de generacion por lotes.
- Despliegue sobre el modelo base cuantizado a int8 (`minimax_h3_ref2va_int8_convrot.safetensors`), segun la verificacion de compatibilidad de claves descrita en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La LoRA en si es pequena: el repositorio completo (bf16 + fp32) ocupa 5,9 GB; la VRAM adicional al cargar el adaptador es marginal respecto al modelo base.
- El requisito dominante proviene del modelo base MiniMax-H3-33B. Como estimacion orientativa a partir del numero de parametros, los pesos en bf16 rondan los 66 GB, y en int8/fp8 alrededor de 33 GB, a lo que hay que sumar activaciones, latents de video, VAE y el text encoder que se carga por separado (cifras estimadas, no confirmadas en la informacion disponible).
- GPU recomendadas (estimacion): H100 80 GB o A100 80 GB para bf16; configuraciones multi-GPU para bf16 si el pipeline no permite offloading; A100 40 GB o H100 80 GB para cuantizacion int8/fp8 con margen variable.
- GPU de consumo: no cabe en GPUs de 24 GB (por ejemplo RTX 4090) en bf16 para un modelo de 33B; requeriria cuantizacion agresiva y offloading de modulos, con impacto en latencia no cuantificado.
- Opciones de despliegue: ComfyUI (nodo `LoraLoaderModelOnly`, fuerza 1.0, 2 pasos, scheduler H3, sin CFG) y la libreria diffusers. Los servidores orientados a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este pipeline de video.
- Latencia y throughput: no disponibles. El unico dato de coste computacional confirmado es el numero de pasos (2 NFE).

## Comparativa con modelos similares

| Modelo | Pasos (NFE) | Rango | Cobertura | Formato | Licencia |
|---|---|---|---|---|---|
| PDMD 2-NFE (este repo) | 2 | 128 | 50 bloques transformer + 2 token-refiner (atencion + FFN) | safetensors ComfyUI (bf16/fp32) | Apache-2.0 |
| PDMD 4-NFE (`Iwannapose/minimax_h3_pdmd_4nfe_comfyui`) | 4 | no disponible | no disponible | safetensors ComfyUI | no disponible |
| LoRA turbo 8 pasos (`minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16`) | 8 | no disponible | no disponible | safetensors ComfyUI bf16 | no disponible |
| LoRA fuente PDMD (`pdmd2026/pdmd_2NFE_lora`) | 2 | 128 | 50 bloques transformer + 2 token-refiner | PEFT / diffusers | no disponible |

No se dispone de datos de rendimiento cuantitativos que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere el modelo base MiniMax-H3 y su text encoder, cargado por separado.
- La fuerza debe ser exactamente 1.0. Cualquier otro valor escala el delta de destilacion y altera el comportamiento a 2 pasos; no debe usarse como LoRA de estilo parcial.
- Debe muestrearse a 2 pasos de denoising, el punto de operacion del student. Usar otro numero de pasos invalida el comportamiento destilado.
- No debe emplearse CFG, ya que el modelo H3 base esta destilado con guidance.
- La licencia del adaptador es Apache-2.0, pero la del modelo base MiniMax-H3 no se detalla en la informacion disponible; conviene verificar sus terminos antes de un uso comercial.
- Se desconoce el comportamiento en idiomas distintos de los no especificados; no hay datos de cobertura multilingue.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente al modelo sin destilar ni frente a otras variantes de pasos.
- El numero de descargas del repositorio es 0, lo que indica validacion limitada por parte de la comunidad.
- La verificacion de la conversion se realizo contra ficheros concretos de ComfyUI H3; cambios en el layout de esos cargadores podrian romper la compatibilidad de claves.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Iwannapose/minimax_h3_pdmd_2nfe_comfyui
- LoRA fuente PDMD 2-NFE: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- Variante 4 NFE del mismo autor: `Iwannapose/minimax_h3_pdmd_4nfe_comfyui`
- Modelo base: MiniMaxAI/MiniMax-H3
- Referencia de layout ComfyUI H3 citada en la model card: `minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16.safetensors`
- Fichero de verificacion de claves citado: `minimax_h3_ref2va_int8_convrot.safetensors`
