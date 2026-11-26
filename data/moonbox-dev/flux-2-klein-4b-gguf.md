# moonbox-dev/FLUX.2-klein-4B-GGUF

## Resumen
FLUX.2-klein-4B-GGUF es una colección de pesos cuantizados en formato GGUF del modelo de difusión FLUX.2 [klein] 4B de Black Forest Labs, publicada por moonbox-dev para su uso en dispositivo (on-device). Se trata de un transformer de flujo rectificado (rectified flow) de aproximadamente 3.875 millones de parámetros (3,875.544.576 exactos) que unifica generación de imágenes a partir de texto y edición de imágenes con múltiples referencias en una sola arquitectura compacta. La relevancia de esta publicación radica en que reduce el peso del transformer a ficheros de entre 2,29 GB y 7,75 GB, lo que permite ejecutar el modelo en GPUs de consumo con 6-8 GB de VRAM.

El repositorio incluye cinco niveles de cuantización (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) más los pesos sin cuantizar de referencia. Cada fichero ha sido verificado tensor a tensor contra los pesos BF16 originales y evaluado con un benchmark de 100 prompts PartiPrompts para medir la degradación de calidad. Solo se convierten los pesos del transformer: el codificador de texto (Qwen3-4B) y el VAE se toman del repositorio original de Black Forest Labs.

La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales. El modelo está pensado para generación de imágenes en tiempo real, desarrollo local y despliegue en el borde, con inferencia end-to-end en menos de un segundo según el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow) para difusión |
| Parametros totales | 3.875.544.576 (aprox. 3,88 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de texto) |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (el prompt se procesa vía Qwen3-4B; idiomas no declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único por precisión) |

## Arquitectura y entrenamiento
El modelo base es un transformer de flujo rectificado de 4 mil millones de parámetros que unifica generación texto-a-imagen y edición de imágenes con múltiples referencias. La familia FLUX.2 [klein] está diseñada para inferencia rápida mediante destilación de pocos pasos (few-step distillation), lo que permite generar imágenes con tan solo 4 pasos y CFG 1, como se documenta en el benchmark del repositorio. El codificador de texto es Qwen3-4B y el VAE es `flux2-vae.safetensors`, ambos tomados del repositorio original.

Los ficheros GGUF se generaron a partir de la revisión `e7b7dc27f9` del modelo original: primero se convirtieron los pesos BF16 a GGUF F16/BF16 y después se cuantizaron con `llama-quantize` de llama.cpp. Cada fichero fue verificado contra los pesos originales antes de la subida, con los hashes SHA-256 documentados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, ya que la model card del repositorio cuantizado no los detalla.

## Capacidades
- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución de 1024 x 1024 en el benchmark.
- Edición de imágenes (image editing) sobre imágenes de entrada.
- Edición con múltiples referencias (multi-reference editing).
- Inferencia rápida mediante destilación de pocos pasos: 4 pasos con CFG 1 en la configuración de benchmark.
- Ejecución en hardware de consumo gracias a las cuantizaciones GGUF.
- Integración con ComfyUI mediante el nodo Unet Loader (GGUF) del plugin ComfyUI-GGUF.
- Compatibilidad con stable-diffusion.cpp para inferencia en CUDA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso
- Generación de imágenes en local para desarrollo: un desarrollador puede cargar el fichero Q8_0 (4,17 GB) en ComfyUI con una RTX 3080 o similar y generar imágenes de 1024 x 1024 en 4 pasos, sin depender de servicios en la nube.
- Prototipado rápido de pipelines de difusión: los ficheros Q4_K_M (2,29 GB) y Q5_K_M (2,77 GB) permiten probar flujos de trabajo completos en GPUs de 6-8 GB de VRAM antes de escalar a los pesos completos.
- Edición de imágenes con múltiples referencias en producción: el modelo unifica generación y edición, de modo que un mismo pipeline puede recibir una o varias imágenes de referencia y un prompt para producir variaciones consistentes.
- Despliegue en el borde (edge deployment): con Q4_K_M en 2,29 GB, el transformer cabe en dispositivos con recursos limitados, lo que habilita generación de imágenes en estaciones de trabajo modestas o entornos embebidos con GPU.
- Evaluación comparativa de cuantizaciones: los datos de LPIPS, PSNR, ImageReward, HPSv2 y CLIP de la model card permiten elegir la precisión adecuada según el equilibrio entre tamaño y fidelidad visual para un caso concreto.
- Re-cuantización o investigación: los ficheros BF16 y F16 (7,75 GB) sirven como referencia para re-cuantizar a otros formatos o para estudiar el efecto de la cuantización en modelos de difusión destilados.
- Generación de imágenes en tiempo real: la destilación de pocos pasos y la inferencia en menos de un segundo que declara el autor original lo hacen apto para aplicaciones interactivas donde la latencia es crítica.

## Benchmarks y rendimiento
El repositorio documenta un benchmark de imágenes con 100 prompts PartiPrompts (todas las categorías), una imagen de 1024 x 1024 por prompt, semilla 1000 + id de prompt, ejecutado con stable-diffusion.cpp master-465adf3 en CUDA sobre una RTX 3080 Laptop, 4 pasos, CFG 1 y sampler euler. Las métricas comparan cada precisión contra las imágenes BF16 con los mismos prompts y semillas.

| Precision | Tamano | Error RMS pesos | LPIPS | PSNR (dB) | ImageReward | HPSv2 | CLIP |
|---|---|---|---|---|---|---|---|
| F16 | 7,75 GB | 0,000001 % | 0,005 | 39,5 | -0,001 | +0,0000 | -0,01 |
| BF16 | 7,75 GB | exacto (referencia) | — | — | — | — | — |
| Q8_0 | 4,17 GB | 0,55 % | 0,019 | 31,5 | +0,007 | +0,0001 | -0,05 |
| Q6_K | 3,24 GB | 1,8 % | 0,054 | 25,7 | -0,019 | -0,0002 | -0,13 |
| Q5_K_M | 2,77 GB | 3,5 % | 0,095 | 22,6 | -0,013 | -0,0008 | -0,01 |
| Q4_K_M | 2,29 GB | 6,9 % | 0,162 | 19,3 | -0,018 | +0,0005 | -0,12 |

Criterio de aprobado del autor: ImageReward medio dentro de 0,05 del BF16 y HPSv2 dentro de 0,003. Todas las precisiones lo superan. Los intervalos de confianza pareados al 95 % con 100 prompts son aproximadamente ±0,04 y ±0,001. El autor señala que los modelos destilados de pocos pasos mueven detalles ante pequeños cambios en los pesos, por lo que LPIPS crece al bajar de precisión mientras las puntuaciones de calidad se mantienen planas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de difusión.

## Requisitos de hardware
- VRAM estimada para el transformer según cuantización: Q4_K_M ~2,3 GB, Q5_K_M ~2,8 GB, Q6_K ~3,2 GB, Q8_0 ~4,2 GB, F16/BF16 ~7,8 GB. A esto hay que sumar el codificador de texto Qwen3-4B y el VAE, que el autor original cifra en un mínimo de 13 GB de VRAM para el pipeline completo.
- GPU recomendadas: RTX 3090 y RTX 4070 como referencia del autor original para el modelo completo; RTX 3080 Laptop se usó en el benchmark del repositorio.
- Cabe en GPU de consumo: sí. El autor indica Q6_K y Q5_K_M para tarjetas de 8 GB y Q4_K_M para tarjetas de 6 GB (solo el transformer; el pipeline completo requiere más memoria).
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (nodo Unet Loader GGUF), stable-diffusion.cpp con CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: el autor original declara inferencia end-to-end en menos de un segundo para la familia FLUX.2 [klein]; el benchmark usa 4 pasos con CFG 1. No se proporcionan cifras de throughput (imágenes por segundo) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-GGUF (este) | 3,88 mil millones | no aplica | Apache-2.0 | GGUF | Cuantizaciones verificadas con benchmark de fidelidad visual |
| FLUX.2-klein-4B (original) | 3,88 mil millones | no aplica | Apache-2.0 | safetensors (BF16) | Pesos completos, requiere ~13 GB VRAM para el pipeline |
| Alternativas de difusión de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros modelos de difusión comparables (por ejemplo, variantes cuantizadas de Stable Diffusion o de otras familias FLUX) en los datos proporcionados, por lo que la comparativa se limita al modelo base original.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo texto-a-imagen, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido inexacto o no solicitado; la model card no cuantifica este riesgo.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados; el procesamiento del prompt depende del codificador Qwen3-4B, cuyas capacidades multilingües no se especifican en esta ficha.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los ficheros son un derivado del modelo original y su licencia gobierna el uso; se debe conservar la atribución correspondiente.
- Caveat para producción: solo se cuantiza el transformer; el codificador de texto y el VAE deben obtenerse del repositorio original, y el pipeline completo requiere aproximadamente 13 GB de VRAM según el autor, muy por encima de los 6-8 GB que ocupa el transformer cuantizado.
- Degradación por cuantización: Q4_K_M presenta un error RMS de pesos del 6,9 % y un LPIPS de 0,162 frente a BF16; en aplicaciones donde el detalle fino sea crítico conviene usar Q8_0 o superior.
- Verificación: los hashes SHA-256 documentados permiten comprobar la integridad de los ficheros, pero no se dispone de auditorías independientes del benchmark de imágenes.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog del autor original: https://bfl.ai/blog/flux2-klein-towards-interactive
- Plugin ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Fichero F16: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF/blob/main/flux-2-klein-4b-F16.gguf
- Fichero BF16: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF/blob/main/flux-2-klein-4b-BF16.gguf
- Fichero Q8_0: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF/blob/main/flux-2-klein-4b-Q8_0.gguf
- Fichero Q6_K: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF/blob/main/flux-2-klein-4b-Q6_K.gguf
- Fichero Q5_K_M: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF/blob/main/flux-2-klein-4b-Q5_K_M.gguf
- Fichero Q4_K_M: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF/blob/main/flux-2-klein-4b-Q4_K_M.gguf
