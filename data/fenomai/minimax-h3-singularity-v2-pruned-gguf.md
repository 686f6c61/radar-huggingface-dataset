# FenomAI/Minimax-h3-Singularity-V2-Pruned-GGUF

## Resumen

Minimax-h3-Singularity-V2-Pruned-GGUF es una distribucion cuantizada en formato GGUF del modelo de generacion de video MiniMax-H3 Singularity, un modelo de difusion multimodal para text-to-video e image-to-video con salida conjunta de video y audio. Lo publica el usuario FenomAI a partir del checkpoint comunitario WarmBloodAban/Minimax-h3_Singularity, que a su vez deriva de la arquitectura MiniMax H3 de MiniMax. La aportacion principal de esta version es un proceso de poda ("pruning") sobre los modulos de modulacion AdaLN que reduce el modelo en 13.030 millones de parametros y unos 26 GB de disco, junto con la conversion a cuantizaciones K-quant compatibles con ComfyUI-GGUF.

El modelo conserva 20.111.438.744 parametros tras la poda, con un repositorio total de 51,3 GB repartido en cuatro ficheros GGUF que van de 8,9 GB (Q3_K_M) a 16,7 GB (Q6_K). Esto lo situa en el rango de GPU de consumo de gama alta: la variante Q4_K_M de 11,6 GB esta pensada como punto de equilibrio para tarjetas de 16 a 24 GB de VRAM.

Es relevante ahora porque permite ejecutar un modelo de generacion de video con audio en hardware local mediante ComfyUI, sin depender de APIs cerradas, y porque mantiene compatibilidad con el ecosistema de LoRA podado de H3 gracias a la preservacion de la base de curvas `adaln_affine.safetensors`. La licencia es la MiniMax H3 Community License, que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con modulos de modulacion AdaLN (arquitectura MiniMax H3), poda de curvas sobre subespacio Ref2VA de rango 8 |
| Parametros totales | 20.111.438.744 (tras poda; se redujeron 13.030 millones respecto al checkpoint original) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K (GGUF); capas de normalizacion, embeddings de timestep y cabezas de entrada/salida en FP32 sin perdida |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (license_name: minimax-h3-community) |
| Formato de pesos | GGUF (ficheros de 8,9 GB, 11,6 GB, 14,1 GB y 16,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de MiniMax H3, un modelo de difusion para generacion conjunta de video y audio. El checkpoint original incluia 51 modulos de modulacion AdaLN con forma `[Out, 2688]`; esta version los proyecta sobre el subespacio canonico Ref2VA de rango 8, representado por `adaln_basis` y `adaln_mean`, lo que elimina 13.030 millones de parametros y unos 26 GB de almacenamiento. Las capas de normalizacion (RMSNorm, LayerNorm), los embeddings de timestep (`adaln_t_table`) y las cabezas de modalidad (`video_patch_proj`, `audio_patch_proj`, `final_layer.video_out`, `final_layer.audio_out`) se mantienen en FP32 sin perdida de precision.

Un detalle tecnico destacable es el proceso de "ConvRot un-rotation": los pesos INT8 de origen se des-rotaron con la transformada exacta de Hadamard regular (H4 elevado a la cuarta potencia) en float64 antes de aplicar la cuantizacion K-quant, lo que segun el autor elimina artefactos de cuantizacion y desviaciones de color. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo base de MiniMax y no se detallan en la model card.

## Capacidades

- Generacion de video a partir de texto (text-to-video) y a partir de imagen (image-to-video), segun los tags y el pipeline declarado.
- Generacion conjunta de video y audio, a partir de las cabezas de salida separadas `final_layer.video_out` y `final_layer.audio_out`.
- Integracion con ComfyUI mediante el nodo `UnetLoaderGGUF` del proyecto ComfyUI-GGUF.
- Compatibilidad con el ecosistema de LoRA podado de H3 y PowerLoRA, gracias a la inclusion de la base de curvas `adaln_affine.safetensors`.
- Funciona con el text encoder Qwen3-VL y los VAE de video y audio de MiniMax-H3.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de clips de video con audio para prototipado creativo: el modelo produce video y audio en una sola pasada, lo que permite iterar sobre conceptos audiovisuales en local sin servicios externos.
- Animacion de imagenes fijas (image-to-video): util para dar movimiento a ilustraciones, fotografias o renders en flujos de preproduccion y storyboards.
- Produccion de contenido para redes sociales en equipos con GPU de consumo: la variante Q4_K_M de 11,6 GB cabe en tarjetas de 16 a 24 GB y permite generar material sin coste por inferencia en la nube.
- Integracion en pipelines de ComfyUI para artistas tecnicos: al cargarse con `UnetLoaderGGUF` y combinarse con LoRA de H3, se pueden construir grafos reutilizables de generacion audiovisual.
- Experimentacion en investigacion sobre difusion multimodal: la preservacion de capas en FP32 y la base de curvas permiten estudiar el efecto de la poda AdaLN sin perder las partes criticas del modelo.
- Despliegue en entornos con VRAM limitada: la variante Q3_K_M de 8,9 GB esta pensada para sistemas de 12 a 16 GB de VRAM, lo que abre la generacion de video a equipos de gama media-alta.
- Creacion de variaciones estilizadas con LoRA: la compatibilidad con el stack de LoRA podado de H3 facilita adaptar el estilo visual sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q3_K_M unos 12-16 GB; Q4_K_M unos 16-24 GB; Q5_K_M 24 GB o mas; Q6_K por encima de 24 GB (valores indicados por el autor como recomendacion de uso).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 o H100 para las variantes de mayor precision y para lotes grandes; GPUs de 16 GB para Q3_K_M.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas de 16 GB con la variante Q3_K_M.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (nodo `UnetLoaderGGUF`), junto con el text encoder Qwen3-VL y los VAE de video y audio de MiniMax-H3. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax-h3-Singularity-V2-Pruned-GGUF (este) | 20.111 M tras poda | no disponible | GGUF (Q3-Q6) | MiniMax H3 Community | Hugging Face, 0 descargas |
| WarmBloodAban/Minimax-h3_Singularity | no disponible (checkpoint original de 34 GB) | no disponible | safetensors | MiniMax H3 Community | Hugging Face (modelo base) |
| MiniMax-H3 (original de MiniMax) | no disponible | no disponible | no disponible | MiniMax H3 Community | Hugging Face (MiniMaxAI) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License impone condiciones especificas; es obligatorio revisar el texto enlazado antes de cualquier uso comercial.
- El proceso de poda AdaLN, aunque preserva capas criticas en FP32, puede introducir diferencias de calidad respecto al checkpoint original de 34 GB; no se aportan metricas objetivas que lo cuantifiquen.
- Las cuantizaciones K-quant de 3 a 6 bits implican perdida de precision progresiva; la variante Q3_K_M es la mas agresiva y la mas expuesta a artefactos visuales.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de validacion ni reportes de fallos.
- Riesgo de alucinacion visual y de incoherencias temporales inherente a los modelos de difusion de video; no se documentan sesgos conocidos.
- Idiomas soportados no disponibles; el comportamiento multilingue de los prompts depende del text encoder Qwen3-VL, no del modelo de difusion.
- Requiere el ecosistema ComfyUI y componentes adicionales (Qwen3-VL, VAE de video y audio de MiniMax-H3) para funcionar; no es un modelo autonomo.
- La fecha de creacion indicada (2026-11-04) y la ausencia de documentacion adicional limitan la verificacion independiente de las afirmaciones tecnicas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FenomAI/Minimax-h3-Singularity-V2-Pruned-GGUF
- Modelo base: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Modelo original MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
