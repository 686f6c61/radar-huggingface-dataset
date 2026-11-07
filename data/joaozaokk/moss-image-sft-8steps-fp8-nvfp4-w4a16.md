# JoaoZaokk/MOSS-Image-SFT-8steps-FP8-NVFP4-W4A16

## Resumen

MOSS-Image-SFT-8steps-FP8-NVFP4-W4A16 es un conjunto de tres builds cuantizados del modelo de difusion text-to-image `lodestones/MOSS-Image-SFT-8-steps-dmd`, que a su vez es la destilacion a 8 pasos de `OpenMOSS-Team/MOSS-Image-SFT`. Lo publica el usuario JoaoZaokk en Hugging Face con el objetivo de reducir el consumo de VRAM en ComfyUI sin necesidad de nodos personalizados: el `UNETLoader` estandar lee los metadatos por capa que incluye cada fichero.

El repositorio contiene tres variantes en formatos de cuantizacion nativos de ComfyUI: FP8 (W8A8-fp8 con escala dinamica de activaciones), NVFP4 (W4A4-fp4, tambien con activaciones cuantizadas) y W4A16 (pesos INT4 con activaciones en BF16). Se cuantizan 168 capas lineales (qkv, o, ffn up/gate y ffn down de los 42 bloques) y se conservan 211 tensores en el formato original. El text encoder (`qwen3.5_9b_int8_convrot`) y el VAE (`flux2-vae`) son los oficiales y no forman parte de este repositorio.

La relevancia practica es acotada y el propio autor la delimita con claridad: estas variantes ahorran memoria, no tiempo. En una RTX 3090 (sm86, sin fp8/fp4 nativo) FP8 y NVFP4 se emulan descomprimiendo pesos, y W4A16 resulta un 40 % mas lento que BF16. Solo el INT8 oficial (que no esta en este repo) acelera la inferencia en esa GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer de 42 bloques con atencion y FFN, destilacion DMD a 8 pasos) |
| Parametros totales | 5B (segun la model card del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de tokens de texto) |
| Tipos de cuantizacion | FP8 (W8A8-fp8, escala dinamica de activaciones), NVFP4 (W4A4-fp4), W4A16 (INT4 grupo 32 con activaciones BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) con fichero `.quant.json` de log del cuantizador |

Datos adicionales por variante:

| Variante | Fichero | Tamano | VRAM pico (1024², 8 pasos) | Tiempo/imagen (RTX 3090) | PSNR vs BF16 (6 imagenes) |
|---|---|---|---|---|---|
| BF16 (referencia) | — | 9,5 GiB | 20,3 GB | 5,26 s | — |
| INT8 ConvRot (oficial, no incluido) | — | 5,0 GiB | 15,8 GB | 3,46 s | 11,1–15,9 dB |
| FP8 | `moss_image_sft_dmd8_fp8.safetensors` | 5,04 GiB | 15,8 GB | 5,34 s | 17,3–25,9 dB |
| NVFP4 | `moss_image_sft_dmd8_nvfp4.safetensors` | 3,10 GiB | 13,9 GB | 5,45 s | 12,3–16,2 dB |
| W4A16 | `moss_image_sft_dmd8_w4a16.safetensors` | 3,38 GiB | 14,4 GB | 7,34 s (+40 %) | 15,4–17,3 dB |

## Arquitectura y entrenamiento

El modelo base es una destilacion DMD (Distribution Matching Distillation) a 8 pasos de `OpenMOSS-Team/MOSS-Image-SFT`, con 5B parametros y un transformer de 42 bloques. La cuantizacion afecta a 168 capas lineales (qkv, proyeccion de salida de atencion, ffn up/gate y ffn down de cada bloque); los 211 tensores restantes se mantienen en el formato del modelo fuente. Cada fichero incluye su `.quant.json` con el registro del cuantizador.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que el repositorio solo publica los artefactos cuantizados y no el proceso de entrenamiento del modelo base. La innovacion tecnica destacable es el uso de los formatos de cuantizacion nativos de ComfyUI con metadatos por capa, de modo que el `UNETLoader` estandar funciona sin nodos personalizados. La cuantizacion no uso calibracion: FP8 emplea escala por tensor, y NVFP4 y Q4_1 (grupo 32) usan min/max, sin AWQ ni GPTQ. W4A16 incluye `full_precision_matrix_mult` en los metadatos de cada capa, condicion necesaria para su funcionamiento.

## Capacidades

- Generacion de imagenes text-to-image en 8 pasos de muestreo (euler/simple, cfg 1.0 en los ejemplos publicados).
- Resolucion validada de 1024x1024; no se han probado otras resoluciones.
- Integracion directa en ComfyUI mediante el `UNETLoader` estandar, sin nodos personalizados.
- Tres perfiles de compromiso memoria/calidad/velocidad: FP8, NVFP4 y W4A16.
- Compatibilidad con el text encoder oficial `qwen3.5_9b_int8_convrot` y el VAE oficial `flux2-vae`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion de imagen, no un LLM.
- Capacidad multilingue limitada al ingles (`en`) segun los metadatos del repositorio.

## Casos de uso

- Prototipado en GPU de gama alta con VRAM ajustada: la variante NVFP4 reduce el pico a 13,9 GB, lo que permite generar a 1024² en tarjetas de 16 GB donde BF16 (20,3 GB) no cabria.
- Despliegue en ComfyUI sin infraestructura adicional: al usar el `UNETLoader` estandar, se puede sustituir el checkpoint BF16 por cualquiera de estos ficheros sin instalar nodos ni modificar el grafo.
- Generacion de imagenes por lotes en 8 pasos: el modelo base esta destilado para 8 pasos, lo que reduce el coste por imagen frente a samplers de 20-50 pasos; la variante FP8 mantiene un tiempo por imagen de 5,34 s en RTX 3090, practicamente identico a BF16.
- Escenarios con restriccion estricta de memoria: W4A16 ocupa 3,38 GiB en disco y 14,4 GB de VRAM pico, el segundo mejor en memoria tras NVFP4, con una calidad que el autor situa a la par del INT8 oficial.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye tres prompts y semilla fija (1030) con renders de las cinco variantes, util para auditar el impacto de la cuantizacion antes de adoptarla en produccion.
- Investigacion sobre cuantizacion de modelos de difusion: el log de medicion y las herramientas (`tools/quant_fp.py`, perfil `moss`) estan publicados en GitHub, lo que permite reproducir el pipeline y adaptarlo a otros checkpoints.

## Benchmarks y rendimiento

Los unicos datos publicados son las mediciones del autor en RTX 3090 (sm86), ComfyUI v0.43.2 y comfy-kitchen 0.2.40, con 6 renders por variante (el primero calienta el servidor, por lo que los tiempos usan los otros cinco):

| Metrica | BF16 | INT8 oficial | FP8 | NVFP4 | W4A16 |
|---|---|---|---|---|---|
| VRAM pico (1024², 8 pasos) | 20,3 GB | 15,8 GB | 15,8 GB | 13,9 GB | 14,4 GB |
| Tiempo por imagen (RTX 3090) | 5,26 s | 3,46 s | 5,34 s | 5,45 s | 7,34 s |
| PSNR vs BF16 (6 imagenes) | — | 11,1–15,9 dB | 17,3–25,9 dB | 12,3–16,2 dB | 15,4–17,3 dB |

Advertencia del autor sobre estas cifras: el PSNR no mide calidad en este caso, porque un modelo destilado a 8 pasos redirige el sampler ante cualquier perturbacion y produce una imagen distinta pero valida; de hecho, el INT8 oficial obtiene el PSNR mas bajo del grupo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni son aplicables a un modelo text-to-image.

## Requisitos de hardware

- VRAM estimada para inferencia a 1024² y 8 pasos: 15,8 GB (FP8), 13,9 GB (NVFP4), 14,4 GB (W4A16); referencia BF16: 20,3 GB.
- GPU validadas: RTX 3090 (sm86). No se han probado otras GPU; el autor indica que en Ada, Hopper y Blackwell el panorama de velocidad para fp8/nvfp4 cambia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM para NVFP4 y W4A16; FP8 requiere al menos 16 GB efectivos. No se ha verificado en tarjetas de 12 GB.
- Opciones de despliegue: ComfyUI (via `UNETLoader` estandar) es el unico entorno documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 5,34 s/imagen (FP8), 5,45 s/imagen (NVFP4) y 7,34 s/imagen (W4A16) en RTX 3090. En sm86 ninguna variante supera a BF16 en velocidad; solo el INT8 oficial (no incluido) baja a 3,46 s/imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | VRAM pico (1024²) | Tiempo/imagen (RTX 3090) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-Image-SFT-8steps BF16 (base) | 5B | safetensors BF16 | 20,3 GB | 5,26 s | apache-2.0 | Hugging Face |
| MOSS-Image-SFT-8steps INT8 ConvRot (oficial) | 5B | INT8 | 15,8 GB | 3,46 s | apache-2.0 | Hugging Face (fuera de este repo) |
| Este repo — FP8 | 5B | safetensors FP8 | 15,8 GB | 5,34 s | apache-2.0 | Hugging Face |
| Este repo — NVFP4 | 5B | safetensors NVFP4 | 13,9 GB | 5,45 s | apache-2.0 | Hugging Face |
| Este repo — W4A16 | 5B | safetensors INT4 | 14,4 GB | 7,34 s | apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos text-to-image comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estas variantes ahorran memoria, no tiempo: en sm86 ninguna es mas rapida que BF16 y W4A16 es un 40 % mas lenta. Solo el INT8 oficial acelera en esa GPU.
- FP8 y NVFP4 no son weight-only: en ComfyUI cuantizan tambien las activaciones con escala dinamica (W8A8-fp8 y W4A4-fp4), ya que los ficheros no incluyen `input_scale`. Solo W4A16 mantiene activaciones BF16.
- W4A16 no es lossless: el autor documenta un render con pelo atravesando un sombrero que el render BF16 de la misma semilla no presenta.
- No hay veredicto del autor sobre la calidad de NVFP4.
- La cuantizacion no uso calibracion (escala por tensor en FP8, min/max en NVFP4 y Q4_1 con grupo 32); un build calibrado con AWQ o GPTQ podria dar mejores resultados.
- Solo se ha validado a 1024², con un unico text encoder y en una unica GPU (RTX 3090). El comportamiento en Ada, Hopper o Blackwell no esta medido.
- El PSNR no es un indicador fiable de calidad en este modelo por la redireccion del sampler en modelos destilados a 8 pasos.
- Idioma limitado al ingles (`en`) en los metadatos; no se documenta soporte multilingue.
- Riesgo de sesgos y alucinacion visual: no se documenta ningun analisis al respecto en la informacion disponible.
- Licencia Apache-2.0, igual que el modelo fuente, sin restricciones adicionales documentadas para uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta; es un artefacto de un unico autor y un unico revisor, sin validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoaoZaokk/MOSS-Image-SFT-8steps-FP8-NVFP4-W4A16
- Modelo base: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Herramientas y log de medicion: https://github.com/JoaoZaokk/comfy-quant-bench
