# intel-ai/Qwen-Image-2.1-MXFP8-AutoRound

## Resumen

Qwen-Image-2.1-MXFP8-AutoRound es una versión cuantizada del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el equipo intel-ai. Se trata de una conversión a MXFP8 (W8A8, grupo de 32, simétrico) generada con la herramienta intel/auto-round mediante cuantización RTN (round-to-nearest, sin calibración, iters=0). El objetivo es reducir el peso del checkpoint manteniendo la calidad de generación: el transformer de imágenes pasa de 14,2 GB a 7,0 GB y el codificador de texto Qwen3-VL de 17,5 GB a 11 GB, dejando el directorio del pipeline en unos 18,6 GB.

El modelo conserva la arquitectura original de Qwen-Image-2.1: un transformer de difusión (DiT) con 32 bloques para la generación de imágenes y un backbone de lenguaje Qwen3-VL de 36 capas que actúa como codificador de texto. La cuantización afecta a 224 capas lineales del DiT y 252 matrices del backbone lingüístico, mientras que las capas de entrada/salida del DiT, las normas, el vision tower, los embeddings y el VAE permanecen en BF16.

Es relevante ahora porque permite desplegar un modelo de generación de imágenes de 7.330 millones de parámetros con menor huella de memoria y porque Intel publica una evaluación formal de recuperación de calidad (gate GO) que compara BF16 frente a MXFP8, algo poco habitual en checkpoints cuantizados de difusión. El modelo está pensado para uso con diffusers 0.42.1 o superior y presenta advertencias específicas sobre el kernel de vLLM-Omni.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de 32 bloques + codificador de texto Qwen3-VL de 36 capas |
| Parámetros totales | 7.333.228.544 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 (W8A8, group_size 32, simétrico) para capas lineales; BF16 para capas de entrada/salida, normas, vision tower, embeddings, lm_head y VAE |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (other) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es una conversión de cuantización, no un entrenamiento nuevo. La arquitectura subyacente es la de Qwen-Image-2.1: un pipeline de difusión texto-a-imagen compuesto por un transformer de difusión con 32 bloques (capas de atención `attn.to_q/to_k/to_v/to_out.0` y MLP `img_mlp.proj/gate_layer/out`) y un codificador de texto basado en Qwen3-VL con 36 capas (`self_attn.q_proj/k_proj/v_proj/o_proj` y `mlp.gate_proj/up_proj/down_proj`). El VAE no se modifica.

La cuantización se aplicó con auto-round siguiendo la política de capas de la release comunitaria NVFP4: se cuantizan tanto el transformer de imágenes como el backbone de lenguaje. Se usó RTN con iters=0, sin calibración ni ajuste fino, lo que el autor señala como una limitación: una receta con calibración podría mejorar la fidelidad a nivel de píxel. La evaluación oficial se realizó con diffusers a 2048×2048, 40 pasos de inferencia, semilla 42 y `true_cfg_scale=1.0` (sin CFG).

## Capacidades

- Generación de imágenes texto-a-imagen de alta resolución (hasta 2048×2048 en los ejemplos oficiales).
- Generación de imágenes con canal alfa (RGBA), incluyendo estructuras de transparencia.
- Codificación de texto multilingüe a través del backbone Qwen3-VL (idiomas concretos no disponibles).
- Control fino mediante prompt detallado, pasos de inferencia y semilla.
- Integración con el ecosistema diffusers mediante `DiffusionPipeline` y `PipelineQuantizationConfig`.
- Compatibilidad con vLLM-Omni bajo condiciones específicas de kernel (FlashInfer MXFP8 W8A8).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Generación de imágenes para marketing y publicidad: el modelo produce imágenes de 2048×2048 en 40 pasos con un prompt detallado, adecuado para banners, carteles y creatividades que requieren texto legible en la imagen (el ejemplo oficial incluye un cartel de neón con la cadena "QWEN IMAGE 2.1").
- Creación de stickers y assets con transparencia: la capacidad RGBA permite generar elementos con canal alfa (el ejemplo oficial es un dragón transparente) para su uso en interfaces, mensajería o composición sobre fondos variables.
- Prototipado rápido de conceptos visuales: con 40 pasos y semilla fija, un equipo de diseño puede iterar prompts y comparar resultados de forma reproducible antes de encargar renderizados de mayor coste.
- Despliegue en infraestructura con VRAM limitada: al reducir el transformer de 14,2 GB a 7,0 GB y el codificador de 17,5 GB a 11 GB, el checkpoint MXFP8 permite servir el pipeline en GPUs donde la versión BF16 no cabría, manteniendo una recuperación de CLIP del 101,17 % según la evaluación del autor.
- Generación de ilustraciones para documentación técnica o blogs: el modelo maneja prompts descriptivos largos y escenas con iluminación y reflejos, útil para portadas y figuras explicativas.
- Investigación en cuantización de modelos de difusión: el checkpoint sirve como referencia reproducible (script YAML incluido) para estudiar el impacto de MXFP8 W8A8 en la fidelidad de generación frente a BF16, con métricas CLIP, PSNR y SSIM publicadas.
- Evaluación comparativa de backends de inferencia: permite contrastar diffusers frente a vLLM-Omni (FlashInfer W8A8 frente a Marlin W8A16) en un caso real con métricas de calidad documentadas.

## Benchmarks y rendimiento

Evaluación oficial del autor con diffusers a 2048×2048, 40 pasos, semilla 42 y `true_cfg_scale=1.0`. CLIP score = coseno imagen-texto ×100 (mayor es mejor).

| Ejemplo | BF16 | MXFP8 | Recuperación |
|---|---:|---:|---:|
| Texto-a-imagen (cartel de neón) | 46,08 | 46,70 | 101,35 % |
| RGBA (sticker de dragón transparente) | 33,65 | 33,97 | 100,94 % |
| **Media** | **39,86** | **40,33** | **101,17 %** |

Comparación a nivel de píxel (misma semilla y scheduler):
- T2I: PSNR 19,51 dB, SSIM 0,849.
- RGBA: MAE de alfa 0,038, IoU de alfa@0,5 0,860.

Comparación de backends de inferencia (mismo checkpoint):

| Backend | Esquema | T2I | RGBA |
|---|---|---:|---:|
| diffusers | W8A8 | 46,70 | 33,97 |
| vLLM-Omni con FlashInfer | W8A8 | 47,29 | 33,87 |
| vLLM-Omni con Marlin | W8A16 | 19,50 | 22,20 |

El autor marca el resultado de diffusers como GO (sin caída de precisión) y el de Marlin como NO-GO. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: el pipeline completo ocupa unos 18,6 GB en disco; en BF16 el transformer son 14,2 GB y el codificador 17,5 GB, mientras que en MXFP8 son 7,0 GB y 11 GB respectivamente. La VRAM necesaria depende del backend y de si se mantienen ambos componentes en memoria simultáneamente.
- GPU recomendadas: no disponible de forma explícita; el ejemplo oficial usa `device_map="cuda"` y `torch.bfloat16`. Por tamaño, se requiere una GPU con al menos 24 GB de VRAM para el pipeline completo en MXFP8, y más para resoluciones de 2048×2048 con lotes mayores.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; con 18,6 GB de pesos en MXFP8, una RTX 4090 (24 GB) podría alojar el pipeline, pero el autor no lo confirma.
- Opciones de despliegue: diffusers 0.42.1 (recomendado), vLLM-Omni solo con kernel FlashInfer MXFP8 W8A8 y versiones coincidentes de `flashinfer-python`/`flashinfer-cubin` y CUDA toolkit funcional (`CUDA_HOME`, `nvcc`, `ninja`). Con Marlin MXFP8 (W8A16) la calidad cae drásticamente.
- Latencia y throughput: no disponibles. El autor advierte que la inferencia MXFP8 es experimental en auto-round/diffusers y que la velocidad no es necesariamente mejor que BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| intel-ai/Qwen-Image-2.1-MXFP8-AutoRound | 7.333.228.544 | no disponible | qwen-research | safetensors (diffusers) | Cuantizado MXFP8 W8A8, gate GO |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la información | no disponible | qwen-research | no disponible | Modelo original en BF16; referencia de calidad |
| Release comunitaria NVFP4 de Qwen-Image-2.1 | no disponible | no disponible | no disponible | no disponible | Mencionada como referencia de política de capas |

No se dispone de datos de benchmarks comparativos con otras alternativas de generación de imágenes en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede producir resultados factualmente incorrectos y no debe usarse como fuente de información veraz.
- Posibilidad de generar contenido obsceno, sesgado u ofensivo debido a las limitaciones del modelo preentrenado y de los datasets de ajuste; el autor recomienda realizar pruebas de seguridad antes de desplegar.
- La licencia es qwen-research (other), lo que puede restringir el uso comercial; es necesario revisar el archivo LICENSE antes de cualquier despliegue productivo.
- La cuantización se realizó con RTN (iters=0), sin calibración ni ajuste; una receta calibrada podría mejorar la fidelidad a nivel de píxel.
- La inferencia MXFP8 es experimental en auto-round/diffusers y la velocidad no es necesariamente superior a BF16.
- En vLLM-Omni, el fallback Marlin MXFP8 es W8A16 e ignora la cuantización de activaciones, con una caída severa de CLIP (T2I 19,5 y RGBA 22,2 frente a 47,3/33,9 con FlashInfer). Es imprescindible verificar que se selecciona un `FlashInfer*Mxfp8LinearKernel` y no un `MarlinMxfp8LinearKernel`; en caso contrario, usar diffusers.
- El `gate.json` del directorio corresponde a la ejecución Marlin W8A16 (NO-GO); la evaluación autoritativa es la de diffusers (GO, 46,70/33,97).
- No se documentan idiomas soportados ni longitud de contexto del codificador de texto.
- El modelo es exclusivamente de generación de imágenes; no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen-Image-2.1-MXFP8-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio auto-round: https://github.com/intel/auto-round
- Paper de referencia (AutoRound): https://arxiv.org/abs/2309.05516
- Script de generación: `examples/run_qwen_image_2.1_mxfp8_dit_te.yaml` (incluido en el repositorio)
- Resultados de evaluación: `results/qwen-image-2.1-mxfp8-dit-te-diffusers/` (incluido en el repositorio)
