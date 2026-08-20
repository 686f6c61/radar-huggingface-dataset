# moonzerokevin/qwen3vl-32b-minimax-h3-nf4

## Resumen

El modelo `moonzerokevin/qwen3vl-32b-minimax-h3-nf4` es una cuantización a 4-bit NF4 del text encoder empleado por el sistema de generación de vídeo MiniMax-H3. Según la model card del autor, ese text encoder no es un modelo específico de MiniMax, sino el modelo oficial `Qwen/Qwen3-VL-32B-Instruct` (verificado por la estructura de tensores, 1058 tensores y 66,7 GB en bf16). Por tanto, este artefacto es simplemente una versión cuantizada de los pesos oficiales de Qwen, lista para usarse como componente del pipeline modular de MiniMax-H3.

El objetivo principal es permitir que el text encoder resida en una GPU de 32 GB (o incluso 24 GB) sin necesidad de hacer offloading a CPU, que en despliegues de tres etapas convertía el encoding de texto en el cuello de botella del pipeline. La cuantización reduce el peso de 66,7 GB a 19 GB en disco y 18,2 GB en VRAM, acelerando el tiempo de encoding por petición de ~7,4–8,5 s a 0,09 s (solo texto) o 0,5–1,5 s cuando se incluye un keyframe. La calidad se mantiene muy cercana al original: la similitud coseno de los embeddings es 1,00003 y el error relativo L2 es 1,6 %.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ser usado dentro del pipeline de MiniMax-H3, reemplazando al encoder bf16. Es una solución práctica para quienes quieren ejecutar MiniMax-H3 en hardware de consumo de gama alta (RTX 5090, 4090) sin sacrificar la calidad de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), basado en Qwen3-VL-32B-Instruct |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion) |
| Tipos de cuantizacion | NF4 (4-bit) con double quant (bnb_4bit_use_double_quant=True), compute dtype bfloat16 |
| Idiomas soportados | no disponibles (el modelo base Qwen3-VL soporta multiples idiomas, pero no se detalla en esta ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bitsandbytes NF4) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado, sino que es una cuantización del text encoder de MiniMax-H3, que a su vez es el modelo `Qwen/Qwen3-VL-32B-Instruct` original. Qwen3-VL-32B-Instruct es un modelo de lenguaje multimodal basado en la arquitectura transformer, con capacidad de procesar texto e imágenes. En el contexto de MiniMax-H3, actúa como encoder de prompts, generando los embeddings de texto (y potencialmente de imágenes de referencia) que alimentan al pipeline de generación de vídeo.

La cuantización se realizó con bitsandbytes en formato NF4 (4-bit) y con doble cuantización para reducir aún más el tamaño. El autor verificó que el encoder original era exactamente el Qwen3-VL-32B-Instruct estándar, por lo que este artefacto no contiene ninguna modificación específica de MiniMax. Se eligió NF4 en lugar de NVFP4 (compressed-tensors) porque este último no es compatible con inferencia en transformers (los kernels NVFP4 solo viven en vLLM, según la nota de la card).

## Capacidades

- **Encoding de texto para generación de vídeo**: procesa prompts de texto y los convierte en embeddings de alta calidad para el pipeline de MiniMax-H3.
- **Encoding de imágenes de referencia**: puede procesar imágenes clave (keyframes) para condicionar la generación de vídeo (primer fotograma o primer y último fotograma).
- **Compatibilidad con el pipeline de MiniMax-H3**: se puede integrar directamente como reemplazo del encoder bf16 en el `ModularPipeline` de H3 (workflow `fl2va`).
- **Sin generación de texto autónoma**: al ser un encoder, no genera texto directamente; su función es convertir entradas multimodales en representaciones vectoriales.
- **Multimodalidad**: hereda las capacidades del modelo base Qwen3-VL, incluyendo comprensión de imágenes y texto, aunque aquí se usa solo como encoder.
- **Optimizado para GPU de 32 GB**: la cuantización NF4 permite mantener los pesos residentes en VRAM, evitando el offload a CPU.

## Casos de uso

- **Despliegue local de MiniMax-H3 en una RTX 4090 o 5090**: permite ejecutar el pipeline completo de generación de vídeo en una sola GPU de 32 GB sin necesidad de offload, reduciendo el tiempo de encoding de texto de ~8 s a 0,09 s por petición.
- **Integración en pipelines de producción de vídeo**: si se usa MiniMax-H3 para generación de vídeo bajo demanda (por ejemplo, en una API interna), este encoder cuantizado reduce la latencia del cuello de botella y permite servir más peticiones concurrentes.
- **Generación de vídeo con control de imagen**: para flujos de image-to-video o video-to-video donde se proporcionan keyframes, el encoder procesa la imagen de referencia en 0,5–1,5 s, manteniendo una calidad PSNR de 24–29 dB frente al encoder bf16.
- **Investigación en cuantización de modelos multimodales**: sirve como ejemplo de cómo cuantizar un modelo de gran tamaño para caber en GPU de consumo sin pérdida significativa de calidad (cosine similitud 1,0003).
- **Optimización de costes de infraestructura**: al reducir el peso de 66,7 GB a 19 GB y la VRAM de 1,5 GB (con offload) a 18,2 GB (residente), se evita el tráfico PCIe y se reduce el tiempo de carga (~6 s frente a ~16 s).
- **Uso como encoder en otros pipelines multimodales**: al ser el Qwen3-VL-32B-Instruct original, puede servir como encoder de texto para cualquier sistema que necesite embeddings de alta calidad, aunque se recomienda verificar la compatibilidad.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un encoder cuantizado, no de un modelo generativo. En su lugar, se proporcionan métricas de fidelidad respecto al modelo bf16 original:

| Métrica | Valor |
|---|---|
| Similitud coseno de prompt_embeds (vs bf16) | 1,00003 |
| Error relativo L2 (vs bf16) | 1,6 % |
| PSNR (bf16 vs NF4, condicionado primer y último fotograma) | 24 – 29 dB |
| PSNR (bf16 vs NF4, condicionado primer fotograma) | 18 – 28 dB |
| PSNR (bf16 vs NF4, text-to-video) | 15 – 17 dB |
| PSNR (mismo config, diferente seed) | 8,6 – 10,2 dB |

El PSNR de la comparación con diferentes seeds es notablemente inferior al de la comparación entre encoders, lo que indica que la cuantización perturba la misma generación en lugar de generar un resultado completamente distinto. Los modos con condicionamiento por imagen se ven menos afectados porque el fotograma de referencia ancla la composición.

## Requisitos de hardware

- **VRAM**: 18,2 GB para tener los pesos residentes en GPU (medido en RTX 5090 con 31,36 GiB). El modelo en bf16 requiere 66,7 GB, por lo que esta cuantización cabe en GPUs de 24 GB y superiores.
- **GPU recomendada**: RTX 5090 (31,36 GiB) fue la usada para las pruebas, pero cualquier GPU con 24 GB de VRAM (RTX 4090, RTX 3090) debería ser suficiente. Se requiere soporte para bitsandbytes (sm120 en el caso de la 5090).
- **Compatibilidad con consumer GPUs**: sí, siempre que tengan al menos 24 GB de VRAM y soporten bitsandbytes (cuantización NF4).
- **Opciones de despliegue**:
  - `transformers` con bitsandbytes (probado con transformers 5.15.0 y bitsandbytes 0.50.1).
  - Se puede integrar en el pipeline `ModularPipeline` de MiniMax-H3.
  - No se menciona compatibilidad con vLLM, TGI u otros servidores de inferencia; se asume que funciona con `transformers` estándar.
- **Latencia**: 0,09 s por petición de texto puro, 0,5–1,5 s con imagen clave. Tiempo de carga del modelo: ~6 s.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantización | VRAM | Licencia | Uso |
|---|---|---|---|---|---|---|
| **Qwen3-VL-32B-Instruct (bf16)** | 33,36 B | no disponible | bf16 | 66,7 GB (con offload) | Apache-2.0 | Encoder original, necesita offload en GPUs de 32 GB |
| **moonzerokevin/qwen3vl-32b-minimax-h3-nf4** | 33,36 B | no disponible | NF4 4-bit | 18,2 GB | Apache-2.0 | Encoder cuantizado, residente en GPU |
| **RedHatAI/Qwen3-VL-32B-Instruct-NVFP4** | 33,36 B | no disponible | NVFP4 (compressed-tensors) | ~16 GB | Apache-2.0 | No puede ejecutar inferencia en transformers (kernels solo en vLLM) |

No se han encontrado otras alternativas de cuantización para este encoder específico. La opción GGUF Q2_K de unsloth (para MiniMax-H3) existe, pero es para el modelo completo de MiniMax-H3, no para el encoder.

## Limitaciones y advertencias

- **No es un modelo de generación de texto**: se trata de un encoder; no puede usarse para chat o generación autónoma.
- **Pérdida de calidad potencial**: aunque la similitud coseno es 1,00003, la cuantización introduce un error relativo L2 de 1,6 %, que puede manifestarse en diferencias visuales en el vídeo generado (PSNR entre 15 y 29 dB según el modo).
- **Dependencia de bitsandbytes**: requiere la biblioteca `bitsandbytes` en una versión compatible (0.50.1 en las pruebas). No funciona sin ella.
- **No se han publicado resultados de sesgos o alucinación**: al ser un encoder, no es relevante para generación de texto, pero el modelo base Qwen3-VL puede tener sesgos en la interpretación de imágenes.
- **Licencia**: Apache-2.0 permite uso comercial, pero es importante verificar la licencia del modelo base Qwen3-VL (también Apache-2.0) y la licencia de MiniMax-H3 si se usa el pipeline completo (esta es la licencia `minimax-h3-community-license-agreement`, que puede tener restricciones).
- **Compatibilidad**: la cuantización NF4 es específica para bitsandbytes; no se puede usar con otros formatos (GGUF, etc.).
- **No se proporcionan datos de entrenamiento**: al ser una cuantización, no hay información sobre el dataset de entrenamiento del modelo original.

## Enlaces

- **Modelo en Hugging Face**: https://huggingface.co/moonzerokevin/qwen3vl-32b-minimax-h3-nf4
- **Modelo base**: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- **MiniMax-H3 (repo oficial)**: https://huggingface.co/MiniMaxAI/MiniMax-H3
- **GGUF de MiniMax-H3 (unsloth)**: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/qwen3vl_32b_minimax_h3-Q2_K_M.gguf
- **Comfy-Org MiniMax-H3**: https://huggingface.co/Comfy-Org/MiniMax-H3
- **Guía de uso de MiniMax-H3 en ComfyUI (kingy.ai)**: https://kingy.ai/ai/ai-guides/minimax-h3-comfyui-local-guide/
- **Guía de ComfyUI para MiniMax-H3 (astrailab)**: https://astrailab.com/minimax-h3-comfyui
- **Descarga de archivos de MiniMax-H3 (minimaxh3.run)**: https://minimaxh3.run/minimax-h3-model-files-downloads
