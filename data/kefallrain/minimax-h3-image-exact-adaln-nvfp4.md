# kefallrain/MiniMax-H3-Image-Exact-adaLN-NVFP4

## Resumen

MiniMax-H3-Image Exact-adaLN NVFP4 es un checkpoint cuantizado en formato NVFP4 (4 bits de NVIDIA Blackwell) del modelo de difusion texto-a-imagen MiniMaxAI/MiniMax-H3-Image, un DiT (Diffusion Transformer) de 33.100 millones de parametros desarrollado por MiniMax. Lo publica el usuario independiente kefallrain y no se trata de un lanzamiento oficial de MiniMax. Su proposito es reducir el peso del DiT de 40,30 GB en BF16 a 12,61 GB manteniendo una fidelidad numerica estricta en el modulo de modulacion `adaLN`, lo que permite ejecutar el modelo en GPUs de consumo y en entornos ComfyUI con requisitos de VRAM mucho menores.

La innovacion principal es una tabla de busqueda `adaLN` de 7 pasos en formato "one-hot" con error cero en ULP BF16, empaquetada en el formato de curva nativo de ComfyUI sin necesidad de parches ni nodos personalizados. Esto es posible porque el solver PDD de 6 pasos de H3-Image solo consulta el DiT en 7 marcas temporales fijas, de modo que se puede sustituir la MLP `adaLN` completa (26,0 GB) por una tabla exacta de unos 136 MB.

El resultado es un checkpoint compatible con ComfyUI 0.45.0 o superior que, segun el autor, ofrece un tiempo de inferencia de 10,55 s para texto-a-imagen a 4 MP y 6 pasos en una GPU Blackwell, con un pico de VRAM de 12,34 GiB. La licencia es la MiniMax-H3-Image Community License, con exclusiones territoriales notables (UE, Reino Unido, Corea del Sur y EE. UU.) que condicionan su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 50 bloques con atencion y MLP; modulacion `adaLN` sustituida por tabla de busqueda exacta |
| Parametros totales | 33,1 mil millones (modelo base); checkpoint cuantizado de 12,61 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 empaquetado U8 + escalas F8_E4M3 por bloque de 16 + escala F32 por tensor); capas `adaLN`, `norm`, `q_norm`/`k_norm`, `token_refiner`, `condition_proj`, `video_patch_proj` y `final_layer.video_out` en BF16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License (con exclusiones territoriales: UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors (`minimax_h3_image_exact_adaln_nvfp4.safetensors`, 12.605.496.924 bytes) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer de 33,1 mil millones de parametros con 50 bloques, cada uno con atencion (`attn.qkv_proj`, `attn.out_proj`) y MLP (`mlp.fc1`, `mlp.fc2`), mas modulos auxiliares `token_refiner`, `condition_proj`, `video_patch_proj` y `final_layer.video_out`. El checkpoint cuantiza las 200 proyecciones lineales pesadas de los bloques a NVFP4 y mantiene en BF16/FP32 las capas de normalizacion, las proyecciones de refinamiento y la tabla `adaLN` exacta. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO, ya que la model card del checkpoint solo describe el proceso de cuantizacion.

La innovacion tecnica clave es la tabla de busqueda `adaLN` de 7 pasos en formato one-hot `F32 [1025, 7]` con vectores de modulacion acumulados en FP64, que sustituye las MLP `adaLN` originales (26,0 GB, 39,5 % del DiT de 66,28 GB) con error cero en ULP BF16 en los 50 bloques. El solver PDD de 6 pasos de H3-Image solo consulta el DiT en `t = 0.0, 0.0324763, 0.1124515, 0.25, 0.4672261, 0.7679911` y en `0.999` para imagenes de referencia, lo que hace viable esta sustitucion. La cuantizacion NVFP4 usa `TensorCoreNVFP4Layout.quantize` de `comfy-kitchen` y aprovecha los Tensor Cores de 4 bits de las GPU Blackwell; en GPUs anteriores se descomprime en el vuelo.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resolucion de hasta 4 MP y 6 pasos de muestreo.
- Edicion de imagenes con referencias duales (dual-reference editing), segun los flujos de trabajo incluidos en el repositorio.
- Compatibilidad nativa con ComfyUI 0.45.0 o superior mediante `comfy-kitchen >= 0.2.41`.
- Uso de codificador de texto Qwen3-VL de 32B (`qwen3vl_32b_minimax_h3_bf16.safetensors` o su variante NVFP4 AWQ) y VAE `minimax_h3_image_vae_fp32.safetensors` / `minimax_h3_image_vae_fp16.safetensors`.
- Muestreo determinista con solver PDD de 6 pasos y sigmas manuales exactas.
- No se documentan capacidades de tool calling, agentes, audio, vision o razonamiento multi-paso; el modelo es exclusivamente de generacion de imagenes.

## Casos de uso

- Generacion de imagenes de producto para comercio electronico: el modelo produce imagenes a 4 MP en 6 pasos, lo que permite generar lotes de imagenes de catalogo con un pico de VRAM de 12,34 GiB en una sola GPU Blackwell.
- Edicion de imagenes con referencias duales: los flujos de trabajo `minimax-h3-image-exact-adaln-nvfp4-edit.json` permiten combinar dos imagenes de referencia para tareas de edicion, con un tiempo de 20,97 s a 4 MP en GPU Blackwell.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: al reducir el checkpoint a 12,61 GB, el modelo cabe en GPUs de la serie RTX 50 y permite iterar en local sin infraestructura de servidor.
- Integracion en pipelines de ComfyUI existentes: al usar el formato de curva nativo y no requerir parches ni nodos personalizados, se puede sustituir el checkpoint BF16 por este NVFP4 en flujos ya montados.
- Investigacion sobre cuantizacion de DiT: la tabla `adaLN` exacta con error cero en ULP BF16 sirve como referencia para estudiar el impacto de la cuantizacion en modelos de difusion.
- Generacion de arte conceptual y storyboards: la resolucion de 4 MP y los 6 pasos permiten producir imagenes de calidad visual en tiempos de decenas de segundos por imagen.
- Despliegue en entornos con VRAM limitada: la variante NVFP4 reduce el pico de VRAM de 38,11 GiB (BF16) a 12,34 GiB en texto-a-imagen a 4 MP, lo que habilita GPUs que no podrian ejecutar el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye datos de velocidad y memoria, que se recogen a continuacion.

| Variante | Tamano | Pesos DiT residentes | Pico VRAM DiT (4 MP T2I) | Pico VRAM DiT (4 MP dual-ref) | Tiempo 6 pasos (4 MP T2I) | Tiempo 6 pasos (4 MP dual-ref) |
|---|---|---|---|---|---|---|
| Exact-adaLN BF16 | 40,30 GB | 37,53 GiB | 38,11 GiB | 40,78 GiB | 15,02 s (1,00x) | 30,38 s (1,00x) |
| Exact-adaLN INT8 ConvRot | 21,05 GB | 19,62 GiB | 20,06 GiB | 21,59 GiB | 12,09 s (1,24x) | 31,36 s (0,97x) |
| Exact-adaLN NVFP4 (este) | 12,61 GB | 11,75 GiB | 12,34 GiB | 14,00 GiB | 10,55 s (1,42x) | 20,97 s (1,45x) |

Mediciones realizadas por el autor en ComfyUI 0.45.0 con GPU Blackwell. No se aportan metricas de calidad (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada: 12,34 GiB de pico para texto-a-imagen a 4 MP y 14,00 GiB para edicion con referencias duales a 4 MP (pesos DiT residentes de 11,75 GiB).
- GPU recomendadas: NVIDIA Blackwell (RTX 50-series, GB-series) para aceleracion nativa de Tensor Cores de 4 bits; en GPUs anteriores el modelo funciona descomprimiendo pesos en el vuelo, con menor rendimiento.
- Cabe en GPUs de consumo de la serie RTX 50; no se documenta compatibilidad con GPUs de menor VRAM.
- Opciones de despliegue: ComfyUI >= 0.45.0 con `comfy-kitchen >= 0.2.41` y PyTorch con CUDA 13.0 o superior. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 10,55 s por imagen en texto-a-imagen a 4 MP y 6 pasos; 20,97 s en edicion dual-ref a 4 MP, medidos en GPU Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image Exact-adaLN NVFP4 (este) | 33,1 B (DiT) | 4 MP, 6 pasos | MiniMax-H3-Image Community License (exclusiones UE, UK, Corea del Sur, EE. UU.) | Hugging Face, ComfyUI |
| MiniMax-H3-Image Exact-adaLN BF16 | 33,1 B (DiT) | 4 MP, 6 pasos | MiniMax-H3-Image Community License | Hugging Face, ComfyUI |
| MiniMax-H3-Image Exact-adaLN INT8 ConvRot | 33,1 B (DiT) | 4 MP, 6 pasos | MiniMax-H3-Image Community License | Hugging Face, ComfyUI |

No se dispone de informacion sobre otros modelos de difusion comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax-H3-Image Community License excluye expresamente la Union Europea, el Reino Unido, Corea del Sur y los Estados Unidos (seccion I.5), lo que limita el uso comercial en esos territorios.
- No es un lanzamiento oficial de MiniMax; es un checkpoint cuantizado publicado por un tercero, sin garantias de soporte ni mantenimiento.
- Requiere ComfyUI >= 0.45.0, `comfy-kitchen >= 0.2.41` y PyTorch con CUDA 13.0 o superior; versiones anteriores no son compatibles.
- La aceleracion nativa de 4 bits solo esta disponible en GPU Blackwell; en GPUs anteriores el rendimiento puede degradarse por la descompresion en el vuelo.
- La cuantizacion NVFP4 puede introducir diferencias de calidad respecto al BF16; el autor solo garantiza error cero en la tabla `adaLN`, no en las proyecciones lineales cuantizadas.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones idiomáticas del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- El uso del modelo esta sujeto a la licencia del modelo base MiniMaxAI/MiniMax-H3-Image, que debe revisarse antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kefallrain/MiniMax-H3-Image-Exact-adaLN-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio GitHub del autor: https://github.com/lepetitprince716-prog/minimax-h3-image-exact-adaln-nvfp4
- Codificador de texto y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Licencia del modelo: https://huggingface.co/kefallrain/MiniMax-H3-Image-Exact-adaLN-NVFP4/blob/main/LICENSE-MODEL.md
