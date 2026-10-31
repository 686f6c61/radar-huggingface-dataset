# cpral/IMG-253M

## Resumen

IMG-253M es un modelo de texto a imagen de 253,4 millones de parametros entrenado desde cero por el usuario cpral. Se trata de un diffusion transformer (DiT) con objetivo de rectified flow (flow matching), condicionado mediante un codificador de texto congelado basado en el modelo SlayerLab/Slayer149 y decodificado con el decoder small de FLUX.2 de Black Forest Labs, tambien congelado. Genera imagenes fijas de 256x256 pixeles a partir de prompts en ingles.

Su relevancia radica en demostrar que es posible entrenar un generador de imagenes competitivo a escala reducida con hardware modesto: el entrenamiento completo se realizo en aproximadamente 12,5 horas sobre 8 GPU RTX 3090 Ti, usando tecnicas modernas como el optimizador Muon, el entrenamiento distribuido MuLoCo (una variante de DiLoCo) y alineacion de representaciones REPA. En la metrica de velocidad MSE sobre imagenes held-out supera al modelo de referencia AuroraIMG2-50M-Preview (0,6499 frente a 0,6929), lo que lo posiciona como un modelo abierto y ligero interesante para experimentacion y despliegue en consumidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con rectified flow / flow matching |
| Parametros totales | 253.389.824 (253,4M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Prompts de hasta 95 tokens (entrada de texto) |
| Tipos de cuantizacion | no disponible (solo pesos bf16/fp32 originales) |
| Idiomas soportados | Ingles (prompts) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El denoiser es un DiT de 253,4M de parametros: 16 bloques, anchura 1024, 16 cabezas de atencion, MLP SwiGLU de 2432, y un token por pixel latente (latentes FLUX.2 de 16x16 con 128 canales, sin patchify). Usa self-attention con RoPE 2D y QK-norm, cross-attention sobre los tokens de texto y condicionamiento temporal estilo PixArt mediante adaLN-single. El texto se codifica con las primeras 18 de las 19 capas del modelo congelado Slayer149 (un GPT causal estilo GoLLeM de anchura 768), cuyos estados ocultos pasan por RMSNorm y por 2 bloques refinadores bidireccionales entrenables (768 de anchura, GQA 12/4 cabezas, RoPE 1D, SwiGLU) que suman 12,6M de parametros. Para la classifier-free guidance se emplea un vector aprendido como prompt vacio. La salida se decodifica con el decoder small de FLUX.2, sin modificar.

El entrenamiento uso el dataset QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imagenes) durante 5 epocas: 114.844 pasos con batch 256, es decir, 29,4M de muestras. El objetivo es rectified flow con target de velocidad, timesteps logit-normal y 10% de dropout de captions para CFG. Se aplico REPA (alineacion de representaciones) contra el encoder PE-Spatial-B16 durante el primer 25% del entrenamiento con peso 0,5 en el 50% de cada batch. El optimizador fue Muon (lr 3,5e-3, momentum 0,95, weight decay 0,01) para las matrices ocultas y AdamW para el resto, con 2% de warmup, learning rate constante y EMA de 0,9995 por paso (los pesos publicados son la EMA). La distribucion se realizo con MuLoCo: cada una de las 8 GPU entrena su replica con batch 32 y las replicas se promedian cada 64 pasos, evitando el all-reduce de gradientes por PCIe 3.0 x4. Se empleo bf16 autocast con pesos en fp32 y torch.compile.

## Capacidades

- Generacion de texto a imagen en resolucion fija de 256x256 pixeles.
- Comprension de prompts en ingles de hasta 95 tokens.
- Soporte de classifier-free guidance (escala de guia configurable, recomendada 3,0).
- Muestreo con 50 pasos Euler (configuracion usada en los ejemplos oficiales).
- Pipeline compatible con la libreria diffusers de Hugging Face mediante custom pipeline con trust_remote_code.
- Semilla reproducible mediante torch.Generator.
- No soporta vision, audio, edicion de imagen, inpainting, generacion de video ni resoluciones variables.

## Casos de uso

- Prototipado rapido de generacion de imagenes: su tamano de 253M permite iterar ideas de generacion de imagenes en GPU de consumo sin costes de infraestructura, ideal para validar prompts y flujos antes de escalar a modelos mayores.
- Investigacion en modelos de difusion: al ser un DiT entrenado desde cero con codigo de entrenamiento publico (repositorio de GitHub), sirve como base reproducible para experimentar con rectified flow, REPA, Muon o MuLoCo.
- Educacion y docencia: el tamano reducido y la documentacion detallada de la arquitectura lo hacen adecuado para ensenar como funcionan los diffusion transformers en cursos y tutoriales.
- Generacion de imagenes en dispositivos con recursos limitados: con menos de 254M de parametros en el denoiser, puede ejecutarse en GPUs de consumo o incluso en entornos edge, generando miniaturas, avatares o ilustraciones pequenas.
- Pruebas A/B de pipelines de difusion: su integracion estandar con diffusers permite sustituirlo en pipelines existentes para comparar calidad y latencia frente a otros modelos ligeros.
- Fine-tuning o adaptacion posterior: el modelo base compacto es candidato razonable para fine-tuning en dominios concretos (estilos, personajes, texturas) con presupuestos de computo reducidos.
- Generacion de assets para videojuegos o maquetas: util para producir iconos, texturas simples o bocetos 256x256 donde la resolucion limitada no es un impedimento.

## Benchmarks y rendimiento

El autor publica una metrica de held-out loss (MSE de velocidad, menor es mejor) sobre 4.096 imagenes held-out, con ruido y timesteps fijos y el mismo codigo de evaluacion para ambos modelos:

| Modelo | val/loss (velocity MSE) |
|---|---|
| AuroraIMG2-50M-Preview | 0,6929 |
| IMG-253M (EMA, version publicada) | 0,6499 |

No se han publicado resultados de benchmarks estandar de generacion de imagenes (FID, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el denoiser (253,4M) mas el text encoder congelado y el decoder FLUX.2 small suman en conjunto un modelo ligero; en bf16/fp32 deberia funcionar holgadamente en GPUs con 6-8 GB de VRAM (estimacion, no dato oficial).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; los ejemplos usan "cuda" directamente. El entrenamiento original se realizo en 8x RTX 3090 Ti (24 GB), pero para inferencia no se requiere ese nivel de hardware.
- Consumer GPU: si, dado el tamano del modelo, deberia ejecutarse en GPUs de consumo como la RTX 3060, RTX 4060 o superiores (estimacion basada en el tamano de parametros).
- Opciones de despliegue: libreria diffusers de Hugging Face mediante DiffusionPipeline con custom_pipeline y trust_remote_code=True. No se menciona soporte para llama.cpp, Ollama, vLLM o TGI (no aplicable, al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles; con 50 pasos Euler de muestreo, la latencia dependera de la GPU, aunque el tamano reducido sugiere tiempos de generacion del orden de segundos en GPUs de consumo (estimacion).

## Comparativa con modelos similares

| Caracteristica | IMG-253M | AuroraIMG2-50M-Preview | Stable Diffusion 1.5 |
|---|---|---|---|
| Parametros (denoiser) | 253,4M | 50M (aprox., segun nombre) | ~860M (UNet) |
| Arquitectura | DiT + rectified flow | DiT + rectified flow (pipeline base de IMG-253M) | UNet + difusion DDPM |
| Resolucion | 256x256 fija | no disponible | 512x512 |
| Held-out velocity MSE | 0,6499 | 0,6929 | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | CreativeML OpenRAIL-M |
| Disponibilidad | Hugging Face (safetensors, diffusers) | Hugging Face | Hugging Face, amplio ecosistema |

IMG-253M mejora la metrica de loss held-out respecto a su referencia AuroraIMG2-50M-Preview con un coste de mayor numero de parametros. Frente a Stable Diffusion 1.5, ofrece una arquitectura mas moderna (DiT con rectified flow) y una licencia Apache-2.0 sin restricciones de uso, a cambio de una resolucion de salida mucho menor y un ecosistema mucho menos maduro.

## Limitaciones y advertencias

- Resolucion de salida fija de 256x256; no soporta otras resoluciones ni upscaling integrado.
- Solo acepta prompts en ingles; no hay soporte multilingue declarado.
- Limitado a 95 tokens de prompt, lo que restringe la complejidad de las descripciones.
- Al ser un modelo de 253M entrenado sobre 5,88M de imagenes, la fidelidad visual, la coherencia de manos, textos dentro de la imagen y detalles finos probablemente sea inferior a la de modelos a gran escala como FLUX o SDXL; los ejemplos del autor sugieren resultados basicos.
- Riesgo de alucinacion visual y errores de adherencia al prompt tipico de modelos pequenos; no hay datos de CLIP score ni evaluaciones humanas publicadas.
- El dataset de entrenamiento (QLNI/FLUX-Reason-6M-flux2-latents) tiene sus propios terminos de uso que deben revisarse; el modelo hereda potenciales sesgos presentes en los datos.
- El pipeline requiere custom_code con trust_remote_code=True, lo que implica ejecutar codigo de terceros y un riesgo adicional de seguridad que conviene auditar antes de usar en produccion.
- El decoder FLUX.2 small esta sujeto a los terminos de Black Forest Labs (distribuido bajo Apache-2.0 segun la model card, sin modificar).
- Descargas y adopcion muy limitadas (0 descargas en el momento de la ficha), por lo que carece de validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/IMG-253M
- Modelo base (text encoder): https://huggingface.co/SlayerLab/Slayer149
- Decoder congelado: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Dataset de entrenamiento: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Modelo de referencia comparado: https://huggingface.co/AuroraAI-Research/AuroraIMG2-50M-Preview
- Encoder usado en REPA: https://huggingface.co/facebook/PE-Spatial-B16-512
- Codigo de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
