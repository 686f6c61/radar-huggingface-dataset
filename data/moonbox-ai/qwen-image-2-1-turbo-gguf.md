# moonbox-ai/Qwen-Image-2.1-Turbo-GGUF

## Resumen

Qwen-Image-2.1-Turbo es un checkpoint acelerado del modelo de difusión Qwen-Image-2.1 de Alibaba Qwen, especializado en generación texto-a-imagen y edición de imágenes. Emplea una arquitectura de transformer de difusión de 7.115 millones de parámetros (aproximadamente 7B) y está optimizado para producir imágenes con tan solo 8 pasos de denoising, frente a los 30-50 habituales en modelos de difusión comparables. El repositorio aquí descrito, `moonbox-ai/Qwen-Image-2.1-Turbo-GGUF`, es una conversión a formato GGUF realizada por Moonbox para ejecución en dispositivo (on-device) mediante `stable-diffusion.cpp` y ComfyUI.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación de imágenes de 7B en hardware de consumo, algo impracticable con los pesos BF16 originales. Los ficheros GGUF cubren un rango de precisión que va desde F16 (14,23 GB) hasta Q4_K_M (4,38 GB), con errores RMS relativos frente a BF16 que van del 5,9e-9 % al 6,6 %. La licencia Qwen Research restringe el uso a investigación y evaluación, y exige licencia comercial de Qwen para producción.

Cabe subrayar que estos ficheros contienen únicamente el transformer de difusión. El pipeline completo requiere además un text encoder (Qwen3-VL-8B-Instruct) y un VAE (Qwen-Image-2.1) que se obtienen por separado, lo que condiciona los requisitos de memoria total del sistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (visual generation architecture de Qwen-Image-2.1) |
| Parámetros totales | 7.115.124.736 (~7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (other); uso comercial requiere licencia de Qwen |
| Formato de pesos | GGUF (fichero único por precisión); original en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un checkpoint acelerado de Qwen-Image-2.1 que mantiene la misma arquitectura de generación visual de 7B parámetros. La innovación principal es la destilación o ajuste para reducir el muestreo a 8 pasos de denoising con un schedule de sigmas fijo (`qwen-image-2.1-turbo`), CFG=1 por defecto y prefix KV caching que reutiliza el contexto de texto e imagen de referencia entre pasos de denoising. El checkpoint incluye su schedule de muestreo recomendado, de modo que no requiere configuración manual del scheduler. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO.

La conversión a GGUF la realiza Moonbox a partir de la revisión `fc13ba1986` del modelo original: los pesos BF16 se convierten primero a GGUF F16/BF16 y después se cuantizan con `llama-quantize` de llama.cpp. Cada fichero fue verificado contra el original antes de la subida, y la model card incluye el hash sha256 esperado de cada precisión. El error RMS relativo de los pesos dequantizados frente a BF16 es de 0,56 % para Q8_0, 1,8 % para Q6_K, 3,4 % para Q5_K_M y 6,6 % para Q4_K_M.

## Capacidades

- Generación texto-a-imagen con 8 pasos de denoising y CFG=1 por defecto.
- Edición de imágenes (image editing) mediante imagen de referencia de entrada, usando el flag `-r input.png` y el vision projector `mmproj-Qwen3VL-8B-Instruct-F16.gguf`.
- Integración con `stable-diffusion.cpp` (commit de referencia 465adf3) mediante `sd-cli`.
- Integración con ComfyUI a través de ComfyUI-GGUF, con soporte de `qwen_image` en el loader (PR #483).
- Compatibilidad con Diffusers mediante `QwenImage21Pipeline`, requiriendo la PR #14950 para sigmas configuradas en el pipeline.
- Prefix KV caching para reutilizar contexto de texto e imagen de referencia entre pasos.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Prototipado de generación de imágenes en estación de trabajo local: con Q4_K_M (4,38 GB) o Q5_K_M (5,19 GB) el transformer cabe en GPUs de consumo, permitiendo iterar prompts sin depender de servicios en la nube.
- Edición de imágenes por referencia en flujos de diseño: el modelo acepta una imagen de entrada junto con el prompt y el vision projector de Qwen3-VL-8B, útil para variaciones controladas de un asset existente.
- Evaluación comparativa de cuantizaciones: los errores RMS publicados (0,56 % a 6,6 %) permiten medir la degradación de calidad percibida frente a BF16 y elegir el punto de equilibrio memoria/fidelidad.
- Integración en ComfyUI para pipelines de posproducción: el loader ComfyUI-GGUF acepta `qwen_image`, lo que facilita encadenar el modelo con nodos de upscaling, segmentación o composición.
- Generación de imágenes en entornos con VRAM limitada: Q6_K (6,00 GB) o Q5_K_M (5,19 GB) permiten ejecutar el transformer en GPUs de 8-12 GB, dejando margen para el text encoder y el VAE.
- Investigación sobre destilación y muestreo acelerado: el schedule fijo de 8 pasos con CFG=1 y el prefix KV caching son un caso de estudio reproducible para comparar técnicas de reducción de pasos en difusión.
- Automatización por línea de comandos: `sd-cli` permite lanzar generaciones por lotes desde scripts, útil para generar datasets sintéticos o pruebas de regresión visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta el error RMS relativo de los pesos cuantizados frente a BF16:

| Precisión | Fichero | Tamaño | Error RMS vs BF16 |
|---|---|---|---|
| F16 | qwen-image-2-1-turbo-F16.gguf | 14,23 GB | 5,9e-9 % |
| Q8_0 | qwen-image-2-1-turbo-Q8_0.gguf | 7,69 GB | 0,56 % |
| Q6_K | qwen-image-2-1-turbo-Q6_K.gguf | 6,00 GB | 1,8 % |
| Q5_K_M | qwen-image-2-1-turbo-Q5_K_M.gguf | 5,19 GB | 3,4 % |
| Q4_K_M | qwen-image-2-1-turbo-Q4_K_M.gguf | 4,38 GB | 6,6 % |

La model card indica que se añadirán puntuaciones de calidad de imagen frente a BF16 a medida que cada precisión supere la evaluación de imagen, pero no se incluyen en la información disponible.

## Requisitos de hardware

- VRAM del transformer de difusión: 14,23 GB (F16), 7,69 GB (Q8_0), 6,00 GB (Q6_K), 5,19 GB (Q5_K_M) y 4,38 GB (Q4_K_M). A esta cifra hay que sumar el text encoder Qwen3-VL-8B-Instruct (en Q8_0 GGUF) y el VAE `qwen_image_2.1_vae_bf16.safetensors`, que se cargan por separado.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, Q8_0 y superiores requieren GPUs de 16-24 GB (RTX 4090, A100); Q5_K_M y Q4_K_M caben en GPUs de 8-12 GB, asumiendo margen adicional para text encoder y VAE.
- Cabe en GPU de consumo: sí, al menos en las precisiones Q4_K_M, Q5_K_M y Q6_K, condicionado a la memoria total necesaria para el pipeline completo.
- Opciones de despliegue: `stable-diffusion.cpp` (commit 465adf3, runtime del benchmark del autor), ComfyUI con ComfyUI-GGUF (PR #483) y Diffusers con `QwenImage21Pipeline` (PR #14950) para los pesos originales.
- Latencia y throughput: no disponibles. El modelo está optimizado para 8 pasos de denoising con CFG=1, lo que reduce el coste computacional frente a schedules de 30-50 pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la información proporcionada. La comparación se limita a lo que se puede inferir del propio repositorio:

| Modelo | Parámetros | Pasos de denoising | Formato | Licencia |
|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (GGUF, este repo) | ~7B | 8 (schedule fijo) | GGUF (F16 a Q4_K_M) | qwen-research |
| Qwen-Image-2.1 (original) | ~7B | no disponible | BF16 safetensors | qwen-research |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia Qwen Research: uso permitido únicamente para investigación y evaluación; el uso comercial requiere una licencia de Qwen. Los ficheros GGUF son derivados y heredan la misma licencia.
- Los ficheros contienen solo el transformer de difusión; el pipeline completo exige text encoder y VAE externos, lo que aumenta la memoria total y añade dependencias de otros repositorios.
- La cuantización introduce degradación medible: Q4_K_M presenta un 6,6 % de error RMS frente a BF16, lo que puede afectar al detalle fino y a la fidelidad en edición de imágenes.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación visual en la información disponible.
- El soporte en ComfyUI depende de una PR (#483) y el soporte en Diffusers de otra PR (#14950); versiones estables pueden no incluir aún el modelo.
- El schedule de 8 pasos es fijo (`--sigmas qwen-image-2.1-turbo`); desviarse de él puede degradar la calidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del proceso de cuantización más allá de los hashes publicados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-ai/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Qwen-Image-2.1 (original): https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1-Turbo
- GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Blog: https://qwen.ai/blog?id=qwen-image-2.1
- Discord: https://discord.gg/BEYSk3pkSu
- Text encoder GGUF: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-GGUF
- VAE: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- ComfyUI-GGUF PR #483: https://github.com/city96/ComfyUI-GGUF/pull/483
- Diffusers PR #14950: https://github.com/huggingface/diffusers/pull/14950
