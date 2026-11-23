# Infinity-io/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una compilación de pesos cuantizados del modelo de difusión Qwen-Image-2.1 de Alibaba Qwen, publicada por Infinity-io (ChatR Labs). Se trata de un adaptador de rango 128 ("Omni") fusionado sobre el modelo base a fuerza LoRA 1.0 y posteriormente cuantizado en múltiples formatos. El resultado es un modelo de texto-a-imagen y edición de imágenes sin los filtros de contenido del modelo original, distribuido únicamente como pesos del transformer (un UNet de difusión de aproximadamente 7.115 millones de parámetros).

El repositorio incluye doce variantes de cuantización (GGUF en BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0; FP8 E4M3, INT8 ConvRot y NVFP4 para ComfyUI; FP8 torchao, NF4 e INT8 de bitsandbytes para Diffusers; y safetensors BF16). El text encoder, el processor y el VAE no se incluyen y deben tomarse del repositorio base Qwen/Qwen-Image-2.1. El repo ocupa 92,5 GB en total.

Su relevancia radica en que permite ejecutar un modelo de generación y edición de imágenes de gama alta en hardware de consumo mediante cuantizaciones de 3,67 a 7,69 GB, además de ofrecer una variante Turbo LoRA de 8 pasos que reduce el coste de inferencia aproximadamente 6-7 veces respecto a la configuración estándar de 35 pasos con CFG 5.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (UNet) sobre Qwen-Image-2.1; adaptador LoRA rango 128 fusionado a fuerza 1.0 |
| Parametros totales | 7.115.124.736 (pesos del transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | GGUF BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0; FP8 E4M3; INT8 ConvRot; NVFP4; FP8 torchao; NF4 (bitsandbytes); INT8 (bitsandbytes); BF16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen-Image-2.1, un modelo de difusión para generación y edición de imágenes de la familia Qwen. Sobre él se aplicó un adaptador LoRA de rango 128 ("Omni") entrenado por ChatR Labs para eliminar restricciones de contenido, que después se fusionó en los pesos base a fuerza 1.0. Los pesos resultantes se cuantizaron en los doce formatos listados. El repositorio solo contiene el transformer: el text encoder, el processor y el VAE proceden del repositorio base.

Los archivos presentan dos disposiciones de tensores distintas: la de 297 tensores mantiene los pares separados `gate_layer`/`proj` en el MLP, mientras que la de 265 tensores usa la proyección fusionada `img_mlp.gate_up`. El cargador debe soportar la disposición elegida. El checkpoint corresponde al paso 90000 de entrenamiento. No se detalla en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. Como innovación operativa destaca el Turbo LoRA opcional (`chatrlabs-omni-turbo-8step-fp32.safetensors`), que permite generar en 8 pasos sin CFG con calidad comparable a la configuración estándar.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resoluciones recomendadas de 768x1152 o 1024x1024.
- Edición de imágenes (image-editing) con la misma escala CFG verdadera de 5.0 que en generación.
- Generación sin filtros de contenido (variante "uncensored" del adaptador Omni).
- Inferencia rápida mediante Turbo LoRA: 8 pasos, CFG 1.0, aproximadamente 6-7 veces más rápido que 35 pasos con CFG 5.0.
- Compatibilidad con ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4 y BF16) y con Diffusers (GGUF vía `from_single_file`, FP8 torchao, NF4 e INT8 de bitsandbytes, BF16 con `from_pretrained`).
- Soporte de caché KV durante la inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de audio.

## Casos de uso

- Generación de ilustraciones en estaciones de trabajo con GPU de consumo: con la variante NF4 (3,67 GB) o GGUF Q4_0 (4,20 GB) el modelo cabe en GPUs de 8 GB de VRAM, permitiendo crear imágenes de 1024x1024 sin infraestructura de centro de datos.
- Edición de imágenes por lotes en pipelines de Diffusers: la variante FP8 torchao (7,12 GB) ofrece la mejor fidelidad dentro de Diffusers y se integra en scripts de `from_pretrained` para flujos de retoque automatizado.
- Prototipado rápido en ComfyUI: los GGUF Q4_K_M (4,47 GB) y Q5_K_M (5,21 GB) se cargan con `Unet Loader (GGUF)` y permiten iterar sobre prompts y flujos de nodos sin descargar los 14,23 GB del BF16.
- Producción de contenido creativo sin restricciones temáticas: el adaptador Omni a fuerza 1.0 está pensado para casos donde el modelo base rechaza prompts legítimos de ficción, arte oscuro o divulgación, siempre bajo responsabilidad del operador.
- Generación de alto rendimiento con Turbo LoRA: añadiendo el LoRA de 8 pasos se obtiene una reducción de coste de aproximadamente 6-7 veces, adecuada para servicios que generan muchas imágenes por minuto con presupuesto de GPU limitado.
- Despliegue en GPUs Blackwell con NVFP4: la variante NVFP4 (4,20 GB) aprovecha las operaciones nativas de cuantización de ComfyUI en hardware reciente para minimizar el uso de VRAM manteniendo el pipeline completo.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir la degradación de calidad entre BF16, Q8_0, Q6_K, Q5_K_M y Q4 en un mismo checkpoint (paso 90000), útil para calibrar políticas de cuantización en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer según cuantización: NF4 3,67 GB; Q4_0 4,20 GB; NVFP4 4,20 GB; Q4_K_M 4,47 GB; Q5_K_M 5,21 GB; Q6_K 6,00 GB; FP8 E4M3, FP8 torchao e INT8 bitsandbytes 7,12 GB; INT8 ConvRot 7,26 GB; Q8_0 7,69 GB; BF16 14,23 GB. A esta cifra hay que sumar la VRAM del text encoder, el processor y el VAE del modelo base.
- GPU recomendadas: para BF16, GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100); para FP8 e INT8, GPUs con soporte de esas precisiones (RTX 4090, L40S, A100, H100); para NVFP4, hardware Blackwell con operaciones nativas.
- Cabe en GPU de consumo: sí, con las variantes NF4, Q4_0, NVFP4 y Q4_K_M en GPUs de 8 GB o más, y con Q5_K_M y Q6_K en GPUs de 12-16 GB, siempre que el text encoder y el VAE quepan junto al transformer.
- Opciones de despliegue: ComfyUI (GGUF mediante `Unet Loader (GGUF)`; FP8, INT8 ConvRot, NVFP4 y BF16 con el `UNETLoader` nativo, verificado en ComfyUI 0.39.0); Diffusers (BF16 con `from_pretrained`, GGUF con `from_single_file`, FP8 torchao, NF4 e INT8 con bitsandbytes).
- Latencia y throughput: no se publican cifras absolutas. El autor indica que el Turbo LoRA de 8 pasos sin CFG es aproximadamente 6-7 veces más rápido que la configuración estándar de 35 pasos con CFG 5.0, con calidad comparable.
- Configuración de inferencia recomendada: 35 pasos, CFG verdadera 5.0, sampler `er_sde` con scheduler `simple`, prompt negativo de un solo espacio, resolución 768x1152 o 1024x1024 y caché KV activada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115 M (transformer) | no aplica | GGUF, FP8, INT8, NVFP4, NF4, BF16 | qwen-research | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no aplica | según repositorio base | qwen-research | Hugging Face (oficial) |
| Alternativas de difusión de tamaño similar | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada; la comparación se limita al modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- La variante "uncensored" elimina los filtros de contenido del modelo base; el operador asume la responsabilidad legal y ética sobre las imágenes generadas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede producir anatomía incorrecta, texto ilegible en la imagen o detalles incoherentes con el prompt.
- Sesgos heredados del dataset de entrenamiento de Qwen-Image-2.1, no documentados en esta información.
- La licencia qwen-research puede restringir el uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- El repositorio solo incluye el transformer; sin el text encoder, el processor y el VAE del modelo base el modelo no es funcional.
- Dos disposiciones de tensores incompatibles (297 y 265): un cargador que no soporte la disposición elegida fallará al cargar.
- El soporte del flujo BF16 en ComfyUI solo se verificó con el archivo safetensors de 297 tensores y el `UNETLoader` nativo de ComfyUI 0.39.0; no debe asumirse en versiones anteriores u otros cargadores.
- El merge no está destilado para pocos pasos: usar 8 pasos sin el Turbo LoRA degrada la calidad.
- Un prompt negativo omitido o vacío desactiva la CFG verdadera aunque `true_cfg_scale` sea mayor que 1; debe usarse un espacio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria documentada.
- No se especifican los idiomas soportados por el text encoder asociado.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Turbo LoRA (8 pasos): https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/chatrlabs-omni-turbo-8step-fp32.safetensors
- Playground: https://thechatr.ai/playground
- Chatr AI: https://thechatr.ai
