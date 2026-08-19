# lite-infer/flux.2-klein-4b-nunchaku-lite-int4_r32-bnb4-text-encoder

## Resumen

El modelo `lite-infer/flux.2-klein-4b-nunchaku-lite-int4_r32-bnb4-text-encoder` es una conversión cuantizada a INT4 del modelo de difusión texto-imagen FLUX.2 Klein 4B de Black Forest Labs, preparada para cargarse directamente con Diffusers mediante una llamada `from_pretrained` sin parcheos de grafo en tiempo de ejecución. La cuantización emplea el método SVDQ (Singular Value Decomposition Quantization) con grupo de 64, rango 32 y 100 objetivos SVDQ, más 3 objetivos AWQ W4A16; el codificador de texto se cuantiza aparte con BitsAndBytes 4-bit NF4. El resultado es un modelo que consume aproximadamente la mitad de VRAM que la versión densa bf16 (9.96 GiB frente a 19.89 GiB) a costa de una latencia mayor en GPUs Blackwell, aunque es la opción recomendada para GPUs Turing, Ampere y Ada donde NVFP4 no está disponible.

El modelo está diseñado para entornos de producción con recursos de memoria limitados, manteniendo una calidad de imagen razonable (MAE 55.52, RMSE 72.18 frente a la referencia densa). Se distribuye bajo licencia Apache 2.0 y requiere el paquete `kernels` de Hugging Face y una versión de Diffusers que soporte el cuantizador `nunchaku_lite`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.2 Klein 4B) con cuantización SVDQ INT4 |
| Parametros totales | 2.022.084.096 (transformer cuantizado, según safetensors; el modelo base declara 4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 SVDQ (transformer), NF4 (text encoder) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con Diffusers) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del checkpoint `black-forest-labs/FLUX.2-klein-4B`, un modelo de difusión texto-imagen basado en un transformer (probablemente DiT). La cuantización se realizó con la herramienta `diffuse-compressor` y sigue el esquema `nunchaku_lite`: INT4 SVDQ con grupo de 64, rango 32, 100 objetivos SVDQ y 3 objetivos AWQ W4A16. Seis capas lineales externas (embedders, `norm_out.linear`, `proj_out`) se mantienen en bf16, mientras que el codificador de texto se cuantiza con BitsAndBytes 4-bit NF4 con cómputo en bf16. Las proyecciones QKV no están fusionadas, lo que permite la carga a través del grafo estándar de Diffusers a costa de algo de velocidad. La calibración se realizó sobre 128 prompts con 4 pasos de inferencia a resolución 1024×1024. No se proporcionan detalles sobre el entrenamiento original del modelo base.

## Capacidades

- Generación de imágenes a partir de descripciones textuales con alta fidelidad y detalle.
- Soporte de múltiples pasos de inferencia (típicamente 4) y ajuste de guidance scale.
- Resolución de salida configurable, con ejemplo a 1024×1024.
- Compatible con el pipeline `Flux2KleinPipeline` de Diffusers.
- Cuantización INT4 que reduce el consumo de VRAM a aproximadamente la mitad respecto a la versión densa bf16.
- No se documentan capacidades de tool calling, agentes ni razonamiento multimodal más allá de texto-imagen.

## Casos de uso

- Generación de imágenes para prototipado rápido en diseño gráfico: el modelo permite crear ilustraciones conceptuales a partir de prompts en pocos segundos (4.93 s en RTX PRO 4000), ideal para iterar ideas en entornos de diseño.
- Producción de contenido visual en entornos con GPU de gama media: al requerir solo 9.96 GiB de VRAM, puede ejecutarse en tarjetas como RTX 3060 o RTX 4060, facilitando la generación de imágenes en estudios pequeños sin hardware de alta gama.
- Integración en pipelines de generación masiva de imágenes: su baja huella de memoria permite desplegar múltiples instancias en una misma GPU para procesar lotes de prompts en paralelo.
- Generación de imágenes para documentación técnica o material educativo: la calidad visual (MAE 55.52 respecto a la referencia) es suficiente para ilustraciones explicativas en manuales o presentaciones.
- Adaptación a flujos de trabajo con Diffusers: al cargarse con `from_pretrained` estándar, se integra fácilmente en proyectos existentes que ya usan Diffusers, sin necesidad de modificar el código de inferencia.
- Despliegue en entornos de inferencia con restricciones de memoria, como contenedores en la nube con límites de VRAM, donde la versión bf16 no cabría.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones de latencia y VRAM en una NVIDIA RTX PRO 4000 Blackwell, con una ejecución de calentamiento y tres mediciones, todo residente en GPU sin offload. La latencia cubre la llamada completa al pipeline.

| Checkpoint | Latencia (s) | VRAM máxima (GiB) |
| --- | ---: | ---: |
| Este repo (Nunchaku Lite INT4 r32 + BNB4 text encoder) | 4.93 (stdev 0.02) | 9.96 |
| Nunchaku Lite NVFP4 r32 + BNB4 text encoder | 1.52 (stdev 0.00) | 10.07 |
| FLUX.2 Klein 4B denso bf16 | 2.31 (stdev 0.01) | 19.89 |

Además, se reportan métricas de error píxel a píxel frente a la referencia densa: MAE 55.52 y RMSE 72.18 (frente a 52.94 y 69.64 para la versión NVFP4). No se publican resultados de benchmarks estándar como FID o CLIP score.

## Requisitos de hardware

- VRAM estimada: 9.96 GiB en pico para el pipeline completo (con text encoder NF4 incluido).
- GPU recomendadas: NVIDIA Turing o más nueva (GTX 16xx, RTX 20xx, 30xx, 40xx, 50xx); no soporta Hopper (H100).
- En Blackwell se prefiere la versión NVFP4 por su menor latencia, pero INT4 es la única opción para Turing, Ampere y Ada.
- Despliegue con Diffusers: requiere el paquete `kernels` de Hugging Face y la variable de entorno `DIFFUSERS_TRUST_REMOTE_KERNELS=true`.
- Latencia medida: 4.93 s en RTX PRO 4000 Blackwell a 1024×1024 con 4 pasos; en GPUs más antiguas puede ser mayor.
- No se documentan opciones de despliegue con vLLM, llama.cpp u Ollama; el modelo está orientado a Diffusers.

## Comparativa con modelos similares

La comparación directa se realiza con las otras dos variantes del mismo modelo base, publicadas por el mismo autor.

| Modelo | Cuantización | VRAM (GiB) | Latencia (s) | MAE/RMSE | Licencia |
| --- | --- | ---: | ---: | --- | --- |
| Este repo | INT4 SVDQ r32 + BNB4 | 9.96 | 4.93 | 55.52 / 72.18 | Apache 2.0 |
| Nunchaku Lite NVFP4 r32 + BNB4 | NVFP4 | 10.07 | 1.52 | 52.94 / 69.64 | Apache 2.0 |
| FLUX.2 Klein 4B denso bf16 | bf16 | 19.89 | 2.31 | referencia | Apache 2.0 |

No se dispone de comparativas con otros modelos de difusión cuantizados (p. ej., SDXL cuantizado) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT4 introduce una pérdida de calidad medible (MAE 55.52 frente a la referencia), perceptible en detalles finos o texturas.
- La latencia es 2.13 veces mayor que la versión bf16 en GPUs Blackwell debido a la falta de soporte nativo de FP4; en otras arquitecturas puede ser comparable o mejor.
- No soporta GPUs Hopper (H100), lo que limita su uso en centros de datos con hardware reciente.
- Requiere dependencias adicionales (paquete `kernels` de Hugging Face) y una versión específica de Diffusers con soporte para `nunchaku_lite`; la carga fallará sin ellas.
- El codificador de texto cuantizado a NF4 puede degradar la comprensión de prompts complejos o poco comunes.
- No se especifican sesgos del modelo base ni riesgos de alucinación visual; se recomienda revisar la documentación de FLUX.2 Klein 4B.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de Black Forest Labs puede tener términos adicionales; verificar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lite-infer/flux.2-klein-4b-nunchaku-lite-int4_r32-bnb4-text-encoder
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Herramienta de cuantización: https://github.com/rootonchair/diffuse-compressor
