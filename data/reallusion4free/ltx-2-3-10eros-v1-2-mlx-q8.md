# reallusion4free/ltx-2.3-10eros-v1.2-mlx-q8

## Resumen

El modelo `reallusion4free/ltx-2.3-10eros-v1.2-mlx-q8` es una cuantizacion int8 (8-bit) en formato MLX del finetune `TenStrip/LTX2.3-10Eros` v1.2, disenada para ejecutarse en Apple Silicon mediante el runtime `ltx-2-mlx`. Se trata de un modelo de generacion de video (text-to-video e image-to-video) que hereda la arquitectura LTX-2.3 de Lightricks, un Diffusion Transformer con conectores de texto basados en Gemma 3 12B y un VAE de video con factor de compresion temporal 8x y espacial 32x. La cuantizacion int8 se aplica exclusivamente a las capas `nn.Linear` de los bloques transformer, manteniendo en bf16 los conectores, el VAE, el vocoder y las proyecciones.

El modelo esta publicado por el usuario `reallusion4free` y esta pensado para uso adulto, tal y como advierte su model card. Incluye tanto la variante "dev" (con CFG) como la variante "distilled" (con el LoRA de destilacion rank-384 pre-fundido), junto con todos los componentes compartidos necesarios para los pipelines de dos etapas, imagen-a-video y audio. El repositorio tiene un tamano de 66.9 GB y la licencia es `ltx-2-license`, derivada del modelo base `Lightricks/LTX-2.3`. Es relevante porque ofrece una version cuantizada de un modelo de video de gran tamano (22B segun el nombre del LoRA oficial) que puede ejecutarse en Macs de 16 GB con `--low-ram`, lo que amplia el acceso a la generacion de video en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LTX-2.3 (Diffusion Transformer) con VAE de video y audio |
| Parametros totales | no disponible (el modelo base parece ser de 22B segun el nombre del LoRA oficial, pero no se confirma en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (grupo 64) en capas `nn.Linear` de los transformer blocks; bf16 en conectores, VAE, vocoder, AdaLN y proyecciones |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-license |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en LTX-2.3, un modelo de generacion de video de Lightricks que utiliza una arquitectura de Diffusion Transformer (DiT). El pipeline completo incluye un text encoder (Gemma 3 12B) que no esta incluido en este repositorio y se carga por separado mediante `mlx-lm`. El README indica que el repositorio contiene dos variantes del transformer: `transformer-dev.safetensors` (el finetune 10Eros v1.2 base) y `transformer-distilled-1.1.safetensors` (con el LoRA de destilacion rank-384 pre-fundido), ademas de conectores que proyectan las embeddings de Gemma al DiT.

Los componentes adicionales incluyen un VAE de video con compresion temporal 8x y espacial 32x, un VAE de audio, un vocoder BigVGAN v2 con generador BWE, y varios upscalers neurales (espacial 1.5x y 2x, temporal 2x). El proceso de entrenamiento del finetune 10Eros no esta documentado en la informacion proporcionada; solo se indica que es una adaptacion de LTX-2.3 orientada a contenido adulto. La cuantizacion a int8 se realizo con `mlx-forge`, y no se mencionan tecnicas de entrenamiento adicionales como RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) y a partir de imagen (image-to-video).
- Dos modos de generacion: "dev" (con CFG, recomendado para calidad) y "distilled" (mas rapido, con el LoRA de destilacion pre-fundido).
- Soporte de upscaling espacial 1.5x y 2x mediante upscalers neurales latentes, y upscaling temporal 2x.
- Generacion de audio sincronizado mediante VAE de audio y vocoder BigVGAN v2.
- Compatibilidad con pipelines de dos etapas que combinan el transformer dev con CFG y upscaling.
- Capacidad de streaming con intercambio dev→distilled durante la generacion (mediante LoRAs oficiales rank-384 en bf16).
- Cuantizacion int8 optimizada para MLX en Apple Silicon, permitiendo inferencia en equipos con 16 GB de RAM usando `--low-ram`.

## Casos de uso

- Generacion de contenido para publico adulto: el modelo esta disenado para ese proposito, tal y como indica su aviso "not for all audiences". Puede generar clips cortos a partir de prompts de texto o imagenes de referencia, con opciones de upscaling para mayor resolucion.
- Creacion de clips para simulaciones y entornos virtuales: gracias a su capacidad de imagen-a-video, puede animar imagenes estaticas en entornos de simulacion o prototipado, siempre que el contenido no sea ilegal ni involucre personas reales sin consentimiento.
- Investigacion sobre cuantizacion de modelos de video en MLX: este repositorio sirve como referencia para estudiar el impacto de la cuantizacion int8 en un DiT de gran tamano sobre hardware Apple Silicon.
- Pruebas de rendimiento de `ltx-2-mlx`: los desarrolladores pueden usar este checkpoint para validar el comportamiento del runtime en diferentes configuraciones de memoria y modos de generacion (dev, distilled, two-stage).
- Prototipado de efectos visuales: el modelo permite generar secuencias cortas a partir de descripciones textuales, lo que resulta util para previsualizar ideas de animacion o VFX antes de invertir en produccion.
- Generacion de video con audio integrado: el pipeline incluye un VAE de audio y un vocoder, permitiendo crear clips con sonido sincronizado en un solo paso, util para contenido multimedia rapido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo requiere Apple Silicon y el runtime `ltx-2-mlx`.
- En Macs de 32 GB de RAM se recomienda usar el flag `--low-ram` para inferencia con bloqueo por streaming.
- La cuantizacion q8 permite ejecutar el modelo en Macs de 16 GB con `--low-ram`, segun indica la model card.
- No se proporcionan datos de VRAM, latencia ni throughput, ni recomendaciones de GPU especificas.
- Las opciones de despliegue se limitan a `ltx-2-mlx`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Tamano aproximado | Contexto | Cuantizacion | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `reallusion4free/ltx-2.3-10eros-v1.2-mlx-q8` | 22B (segun nombre del LoRA) | no disponible | int8 MLX | Apple Silicon | ltx-2-license | HuggingFace |
| `MLXBits/ltx-2.3-10eros-v1.2-mlx-q8` | no disponible | no disponible | int8 MLX | Apple Silicon | ltx-2-license | HuggingFace (similar, sin datos adicionales) |
| `MLXBits/ltx-2.3-10eros-v1.2-dmd-mlx-q8` | no disponible | no disponible | int8 MLX (con DMD distillation integrada) | Apple Silicon | ltx-2-license | HuggingFace |
| `Lightricks/LTX-2.3` (modelo base) | no disponible | no disponible | bf16 | Multiplataforma | ltx-2-license | HuggingFace |

La comparacion se basa en los datos disponibles en la informacion proporcionada; no se han encontrado benchmarks que permitan evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Este modelo esta destinado a publico adulto; su uso debe cumplir la legislacion local y no debe emplearse para generar contenido ilegal ni para representar personas reales sin consentimiento explicito.
- El text encoder Gemma 3 12B no esta incluido en el repositorio y debe cargarse por separado mediante `mlx-lm`, lo que incrementa los requisitos de memoria y la complejidad del despliegue.
- La cuantizacion int8 puede degradar ligeramente la calidad de salida en comparacion con los pesos en bf16, especialmente en detalles finos de las secuencias de video.
- No se disponen de datos sobre el contexto maximo ni sobre los idiomas soportados, lo que limita la evaluacion de su uso multilingue.
- La licencia `ltx-2-license` puede imponer restricciones de uso comercial o redistribucion; es necesario revisar el texto completo de la licencia y los terminos del finetune upstream (`TenStrip/LTX2.3-10Eros`) antes de cualquier uso en produccion.
- El modelo solo puede ejecutarse en Apple Silicon a traves de `ltx-2-mlx`; no se proporcionan instrucciones para otras plataformas (CUDA, ROCm, etc.).
- Existe riesgo de alucinacion y artefactos visuales inherente a los modelos generativos de video, que puede manifestarse en movimientos incoherentes, deformaciones de objetos o distorsiones temporales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reallusion4free/ltx-2.3-10eros-v1.2-mlx-q8
- Modelo base finetune: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Modelo base original: https://huggingface.co/Lightricks/LTX-2.3
- Licencia LTX-2: https://huggingface.co/Lightricks/LTX-2.3/blob/main/LICENSE.txt
- Runtime ltx-2-mlx: https://github.com/dgrauet/ltx-2-mlx
- Herramienta de conversion mlx-forge: https://github.com/dgrauet/mlx-forge
- Variante DMD relacionada: https://huggingface.co/MLXBits/ltx-2.3-10eros-v1.2-dmd-mlx-q8
