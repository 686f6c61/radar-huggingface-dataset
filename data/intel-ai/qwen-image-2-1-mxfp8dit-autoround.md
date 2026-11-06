# intel-ai/Qwen-Image-2.1-MXFP8DiT-AutoRound

## Resumen

Qwen-Image-2.1-MXFP8DiT-AutoRound es una versión cuantizada del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el equipo de Intel (intel-ai) mediante su herramienta AutoRound. El modelo aplica cuantización MXFP8 (W8A8, grupo de 32, simétrica) exclusivamente al transformador de imagen (DiT), manteniendo el codificador de texto Qwen3-VL y el VAE en BF16. El checkpoint resultante reduce el transformador de 14,2 GB a 7,0 GB, lo que facilita su despliegue en GPUs con menos VRAM.

La relevancia de esta ficha radica en que demuestra un flujo de cuantización de precisión baja (FP8 con escala por bloques de 32) aplicado a un modelo de difusión de última generación, con una recuperación de calidad prácticamente idéntica al modelo original en BF16 según las métricas CLIP reportadas por el autor (recuperación media del 100,03 %). Es, por tanto, un caso práctico de cómo reducir el coste de memoria de un pipeline texto-a-imagen sin degradar la fidelidad semántica de las imágenes generadas.

El modelo conserva la arquitectura del original: un transformador de difusión (DiT) de aproximadamente 7.330 millones de parámetros totales, con un codificador de texto multimodal Qwen3-VL y un VAE, empaquetado para la librería `diffusers` mediante la pipeline `QwenImage21Pipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con codificador de texto Qwen3-VL y VAE; cuantizacion MXFP8 en el DiT |
| Parametros totales | 7.333.228.544 (7,33 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (W8A8, group_size 32, simetrica) en 224 capas lineales del DiT; BF16 en el resto |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia `other`) |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del DiT de Qwen-Image-2.1. La cuantización afecta a 32 bloques DiT, concretamente a las capas `attn.to_q`, `attn.to_k`, `attn.to_v`, `attn.to_out.0` y a las proyecciones `img_mlp.proj`, `img_mlp.gate_layer` e `img_mlp.out`, sumando 224 capas lineales. Se mantienen en BF16 el codificador de texto Qwen3-VL, el VAE, las capas de entrada y salida del DiT (`img_in`, `txt_in`, `time_text_embed`, `modulation`, `norm_out`, `proj_out`) y todas las normalizaciones.

El proceso de cuantización se realizó con AutoRound en modo RTN (Round-To-Nearest, `--iters 0`), sin calibración ni ajuste fino de los pesos, usando el dataset COCO2014 con 40 pasos de inferencia y `guidance_scale` 1.0. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), ya que la model card de esta conversión no los detalla. La innovación técnica principal es la aplicación de MXFP8 (formato de punto flotante de 8 bits con escala compartida por bloques de 32) a un modelo de difusión, junto con la advertencia sobre los distintos kernels de vLLM-Omni (Marlin W8A16 frente a FlashInfer W8A8) y su impacto en la calidad de la generación RGBA.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en resoluciones de hasta 2048×2048, con 40 pasos de inferencia en los ejemplos oficiales.
- Generación de imágenes con canal alfa (RGBA), incluyendo estructuras de transparencia, evaluada con métricas de alpha MAE y alpha IoU.
- Control fino mediante prompts descriptivos detallados (el ejemplo oficial usa un prompt de letrero de neón con reflejos en pavimento mojado).
- Compatibilidad con la pipeline `QwenImage21Pipeline` de `diffusers` y con el ecosistema de cuantización de AutoRound.
- Soporte de despliegue mediante `diffusers` y, con matices, mediante vLLM-Omni (requiere el kernel FlashInfer W8A8 para preservar la calidad RGBA).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio en la información disponible.

## Casos de uso

- Generación de imágenes de producto en comercio electrónico: el modelo puede producir imágenes a 2048×2048 con prompts detallados y, gracias a la reducción de memoria del checkpoint (7,0 GB frente a 14,2 GB), permite ejecutar el pipeline en GPUs de gama alta de consumo con menos VRAM, abaratando el coste por imagen en entornos de producción.
- Creación de recursos gráficos con transparencia (stickers, logotipos, iconos): la capacidad RGBA verificada (alpha IoU@0.5 de 0,851 en la evaluación del autor) permite generar assets con canal alfa directamente, integrables en flujos de diseño.
- Prototipado rápido de conceptos visuales en estudios de diseño: la inferencia con `diffusers` y semilla fija facilita la reproducibilidad y la iteración sobre variaciones de un mismo prompt.
- Generación de imágenes para campañas de marketing: la calidad semántica medida por CLIP (45,39 en MXFP8 frente a 46,08 en BF16 para el ejemplo T2I) indica que la cuantización preserva la correspondencia texto-imagen, adecuada para borradores y pruebas A/B.
- Despliegue en infraestructura con VRAM limitada: al reducir el transformador a 7,0 GB, el modelo puede servirse en GPUs de 24 GB junto con el codificador de texto y el VAE en BF16, ampliando el parque de hardware compatible.
- Investigación en cuantización de modelos de difusión: el checkpoint sirve como referencia reproducible para estudiar el impacto de MXFP8 en la calidad de generación, con métricas CLIP, PSNR y SSIM documentadas y comandos de regeneración incluidos.

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card del autor y comparan BF16 con MXFP8 usando CLIP score (coseno imagen-texto ×100, mayor es mejor) en diffusers a 2048×2048, 40 pasos, semilla 42 y `true_cfg_scale=1.0`.

| Ejemplo | BF16 | MXFP8 | Recuperación |
|---|---:|---:|---:|
| Text-to-Image (letrero de neón) | 46,08 | 45,39 | 98,51 % |
| RGBA (sticker de dragón transparente) | 33,65 | 34,37 | 102,14 % |
| **Media** | **39,86** | **39,88** | **100,03 %** |

Comparación de píxeles y alfa (misma semilla y planificador):

| Métrica | Valor |
|---|---|
| PSNR (T2I) | 17,96 dB |
| SSIM (T2I) | 0,778 |
| Alpha MAE (RGBA) | 0,043 |
| Alpha IoU@0.5 (RGBA) | 0,851 |

Nota del autor: el `gate.json` de este directorio corresponde a la ejecución cruda con Marlin W8A16 (NO-GO, RGBA 22,1), mientras que la evaluación autoritativa con diffusers W8A8 es `results/qwen-image-2.1-mxfp8-diffusers/` (GO, T2I/RGBA 45,38/34,37, media 39,88). El kernel FlashInfer W8A8 recupera RGBA hasta 34,7.

## Requisitos de hardware

- VRAM estimada: el transformador cuantizado ocupa 7,0 GB (frente a 14,2 GB en BF16); a ello hay que sumar el codificador de texto Qwen3-VL y el VAE en BF16, no cuantizados, por lo que el requisito total depende de sus tamaños, no especificados en la información disponible.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. Por el tamaño del checkpoint cuantizado, es plausible su ejecución en GPUs de 24 GB o más, pero este dato no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado. La reducción a 7,0 GB del transformador sugiere viabilidad en GPUs de gama alta de consumo, pero el codificador de texto y el VAE en BF16 elevan el requisito total.
- Opciones de despliegue: `diffusers` 0.42.1 con `transformers` 5.19.0 y `auto-round` 0.17.0; vLLM-Omni con kernel FlashInfer W8A8 (requiere `flashinfer-python`/`flashinfer-cubin` compatibles y `CUDA_HOME`/`nvcc`/`ninja`).
- Latencia y throughput: no disponibles. El autor advierte que la inferencia MXFP8 es experimental en auto-round/diffusers y que la velocidad no es necesariamente mejor que BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-MXFP8DiT-AutoRound (este) | 7,33 mil millones | no disponible | MXFP8 W8A8 en DiT | qwen-research | Hugging Face (intel-ai) |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la información | no disponible | BF16 | qwen-research | Hugging Face (Qwen) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo puede producir contenido factualmente incorrecto; no debe usarse como fuente de información veraz.
- Riesgo de generar contenido obsceno, sesgado u ofensivo debido a las limitaciones del modelo preentrenado y de los datasets de ajuste; se recomienda realizar pruebas de seguridad antes de desplegar.
- La cuantización se realizó con RTN (`iters=0`), sin calibración ni ajuste, lo que puede dejar margen de mejora frente a métodos con calibración.
- La inferencia MXFP8 es experimental en auto-round/diffusers y la velocidad no es necesariamente superior a BF16.
- En vLLM-Omni, el kernel Marlin por defecto es W8A16 e ignora la cuantización de activaciones del checkpoint, degradando gravemente la generación RGBA (CLIP 22,1); es imprescindible usar el kernel FlashInfer W8A8.
- La configuración de `AutoRoundConfig` en diffusers debe especificar explícitamente `bits=8, group_size=32, data_type="mx_fp"`, ya que los valores por defecto son W4G128.
- La licencia `qwen-research` (etiquetada como `other`) puede restringir el uso comercial; el autor recomienda consultar a un abogado antes de usar el modelo con fines comerciales.
- No se dispone de información sobre sesgos específicos, cobertura de idiomas ni longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Qwen-Image-2.1-MXFP8DiT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Repositorio de AutoRound: https://github.com/intel/auto-round
