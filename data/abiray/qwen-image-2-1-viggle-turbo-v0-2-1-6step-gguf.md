# Abiray/Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-GGUF

## Resumen

Abiray/Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-GGUF es una coleccion de cuantizaciones GGUF independientes del modelo de difusion Qwen-Image-2.1 de Alibaba, fusionadas de forma nativa con el LoRA Turbo de 6 pasos (rango 256) desarrollado por Viggle. El resultado es un checkpoint de generacion texto-a-imagen que opera con tan solo 6 pasos de muestreo y CFG fijo a 1.0, lo que se traduce en una aceleracion aproximada de 4,5 veces respecto al modelo base, manteniendo la compatibilidad con el cargador GGUF nativo de ComfyUI.

El modelo resuelve el problema del coste computacional de la inferencia en difusion: en lugar de requerir 20-50 pasos con classifier-free guidance, la destilacion de la velocidad en FP32 antes de la cuantizacion permite generar imagenes en 6 pasos con cero CFG. Con 7.115.124.736 parametros (aproximadamente 7,1 mil millones) y un repositorio de 29,9 GB que incluye seis variantes de cuantizacion, esta pensado para despliegue local en GPUs de consumo.

La relevancia actual radica en que combina un modelo base de alta calidad (Qwen-Image-2.1, arquitectura DiT) con una destilacion Turbo de alto rango y un formato de pesos GGUF que reduce los requisitos de VRAM hasta 2,97 GB en la variante Q3_K_M. La licencia es qwen-research, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre base Qwen-Image-2.1 |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (safetensors para texto codificador y VAE) |

## Arquitectura y entrenamiento

El modelo base es Qwen-Image-2.1, un Diffusion Transformer (DiT) de aproximadamente 7,1 mil millones de parametros desarrollado por el equipo Qwen de Alibaba. Sobre esta base, Viggle entreno un LoRA Turbo de rango 256 que destila el campo de velocidad del modelo original, permitiendo reducir el numero de pasos de muestreo de decenas a solo 6. La innovacion clave de esta ficha es el proceso de fusion: el LoRA se integra de forma permanente en FP32 antes de la cuantizacion a GGUF, de modo que la destilacion no se degrada por el redondeo de pesos.

El pipeline completo requiere tres componentes separados: el modelo de difusion cuantizado en GGUF, un codificador de texto `qwen3vl_8b_int8_convrot.safetensors` (basado en Qwen3-VL de 8B) y un VAE `qwen_image_2.1_vae_bf16.safetensors`. El muestreo utiliza sampler Euler con una secuencia de sigmas fija definida por el nodo Viggle Turbo (`[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]`) y `shift_terminal: null`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en 6 pasos con CFG 1.0.
- Edicion de imagenes (image-to-image) mediante workflow incluido en el repositorio.
- Inferencia acelerada con destilacion Turbo: aproximadamente 4,5 veces mas rapida que el modelo base.
- Compatibilidad nativa con ComfyUI mediante el nodo `Unet Loader (GGUF)` y ComfyUI-GGUF.
- Seis niveles de cuantizacion para adaptarse a distintos presupuestos de VRAM (desde 2,97 GB hasta 7,07 GB).
- Codificador de texto multimodal Qwen3-VL de 8B, lo que sugiere capacidad de comprension de prompts complejos (no se detalla en la informacion disponible).
- No se ha documentado soporte de tool calling, agentes ni modo thinking en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes local en GPUs de consumo: con la variante Q4_K_M (3,90 GB) el modelo cabe en GPUs de 8 GB de VRAM, permitiendo crear ilustraciones y conceptos sin depender de servicios en la nube.
- Prototipado rapido de assets para videojuegos: los 6 pasos de muestreo reducen el tiempo por imagen, lo que facilita iterar sobre variaciones de personajes, entornos y objetos en sesiones de diseno.
- Edicion de imagenes en flujo image-to-image: el workflow incluido permite modificar imagenes existentes (retocado, cambio de estilo, inpainting) dentro de ComfyUI con el mismo checkpoint.
- Generacion de material grafico para marketing: la velocidad de inferencia permite producir lotes de imagenes para campanas, banners o redes sociales en una sola sesion de trabajo.
- Investigacion en destilacion de modelos de difusion: el repositorio sirve como referencia de como fusionar un LoRA Turbo de rango 256 en FP32 antes de cuantizar, util para estudiar la degradacion por cuantizacion.
- Despliegue en entornos con VRAM limitada: la variante Q3_K_M (2,97 GB) permite ejecutar el modelo en equipos con 6 GB de VRAM para pruebas locales o demos.
- Integracion en pipelines de automatizacion creativa: mediante ComfyUI y sus workflows JSON, el modelo se puede encadenar con otros nodos para generar variaciones masivas o procesar lotes de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento proporcionada es la aceleracion aproximada de 4,5 veces respecto al modelo base, derivada de reducir la generacion a 6 pasos con CFG 1.0.

## Requisitos de hardware

- VRAM estimada para inferencia (solo modelo de difusion): entre 2,97 GB (Q3_K_M) y 7,07 GB (Q8_0), segun la cuantizacion elegida.
- VRAM adicional necesaria para el codificador de texto Qwen3-VL 8B en int8 y el VAE en bf16; el total del pipeline supera la cifra del checkpoint de difusion.
- GPU recomendadas: RTX 4090 (24 GB) para la variante Q8_0 con maxima fidelidad; RTX 3080/4070 (10-12 GB) para Q5_K_M o Q6_K; GPUs de 8 GB para Q4_K_M.
- Cabe en GPU de consumo: si, desde 8 GB de VRAM con Q4_K_M y desde aproximadamente 6 GB con Q3_K_M (sin contar codificador de texto y VAE).
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF y el nodo `viggle_turbo.py`; el formato GGUF es compatible con llama.cpp, aunque el flujo documentado es exclusivamente ComfyUI.
- Latencia y throughput: no disponibles; la aceleracion de 4,5 veces es la unica referencia publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abiray/Qwen-Image-2.1-viggle-turbo-6step-GGUF | 7,1B | 6 (CFG 1.0) | GGUF | qwen-research | Hugging Face |
| Viggle/Qwen-Image-2.1-viggle-turbo (base) | 7,1B | 6 (CFG 1.0) | safetensors | qwen-research | Hugging Face |
| Qwen-Image-2.1 (original) | 7,1B | decenas (CFG > 1.0) | safetensors | qwen-research | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de otros modelos de difusion comparables (como FLUX o SDXL) ni sus especificaciones.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es necesario revisar los terminos en el enlace de licencia antes de cualquier despliegue en produccion.
- Al ser una cuantizacion GGUF, las variantes de menor precision (Q3_K_M, Q4_K_S) pueden introducir perdida de detalle y artefactos respecto a Q8_0.
- El modelo requiere CFG exactamente 1.0 y prompts negativos vacios; usar CFG mayor degrada la calidad de generacion segun las instrucciones del autor.
- Depende de un nodo personalizado (`viggle_turbo.py`) y de ComfyUI-GGUF, lo que anade complejidad de instalacion y riesgo de incompatibilidades con futuras versiones de ComfyUI.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni tasas de alucinacion visual; se recomienda validacion manual de las imagenes generadas.
- Los idiomas soportados en los prompts no estan documentados; el codificador Qwen3-VL sugiere multilingue, pero no se confirma en la informacion disponible.
- El repositorio ocupa 29,9 GB, lo que exige espacio en disco considerable si se descargan todas las variantes.

## Enlaces

- Hugging Face: https://huggingface.co/Abiray/Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-GGUF
- Modelo base (Viggle): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Licencia: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/blob/main/LICENSE
- Nodo ComfyUI de Viggle: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/blob/main/comfyui/viggle_turbo.py
- Workflow texto-a-imagen: https://huggingface.co/Abiray/Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-GGUF/blob/main/Qwen-Image-2.1-viggle-turbo-t2i_GGUF.json
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Equipo Qwen: https://huggingface.co/Qwen
