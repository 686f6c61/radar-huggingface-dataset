# pottokao/MOSS-Image-Text-Encoder-Heretic-ZImage9B-DHQ-GGUF

## Resumen

MOSS-Image-Text-Encoder-Heretic-ZImage9B-DHQ-GGUF es una cuantizacion GGUF de un codificador de texto basado en Qwen3.5-9B, publicada por el usuario pottokao. El modelo cumple una doble funcion: actua como text encoder para el modelo de difusion Z-Image Turbo con entrada de texto de 9B y, simultaneamente, funciona como prompt enhancer (generador de prompts) conservando la cabeza MTP. Los pesos en bf16 provienen de pottokao/MOSS-Image-Text-Encoder-Heretic, un modelo "decensored" (heretic), y esta build esta especificamente ajustada para Z-Image, no para MOSS-Image.

La particularidad tecnica principal es que el Z-Image oficial lee un text encoder de 4B con dimension 2560, mientras que este fichero sustituye esa entrada por una de 9B: una RMSNorm(4096, peso 1) seguida de una capa lineal 4096→3840 obtenida por ajuste en forma cerrada sobre la entrada original de 4B. Por tanto, no es plug-and-play con el Z-Image estandar: requiere el DiT modificado que el autor distribuye en el mismo repositorio.

La cuantizacion DHQ (Dual-Head Quantization) elige el formato de cada tensor en funcion del dano medido en dos metricas: el error en la entrada de Z-Image 9B (lo que lee el DiT, peso 1) y la KL de escritura de prompts (peso 0.5). El resultado es un fichero de 7,17 GB con mezcla Q5_K, Q6_K y Q8_0, sin ningun tensor por debajo de Q5. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-9B) con cabeza MTP; doble uso como text encoder y prompt enhancer |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF DHQ: Q5_K (60 tensores), Q6_K (128 tensores), Q8_0 (60 tensores); ningun tensor por debajo de Q5 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero principal), safetensors NVFP4 (DiT), GGUF F16 (mmproj de vision) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de un Qwen3.5-9B "decensored" (etiquetado heretic) que conserva la cabeza MTP (multi-token prediction). Se usa en dos modos sobre el mismo fichero: codificacion del prompt que consume el DiT de Z-Image Turbo y generacion de prompts (prompt enhancer). El repositorio incluye ademas un mmproj F16 opcional de 0,92 GB que anade vision, y un DiT NVFP4 de 4,95 GB (Z-Image Turbo de Tongyi-MAI, Apache-2.0) en el que solo se han sustituido tres tensores del text entrance: `cap_embedder.0.weight` = ones(4096), y `cap_embedder.1.weight`/`bias` correspondientes al ajuste 4096→3840. El resto de tensores del DiT son identicos bit a bit al original NVFP4.

La innovacion central es la cuantizacion DHQ: en lugar de aplicar una receta generica, cada tensor recibe un formato elegido a partir del dano medido en dos "reglas": el error relativo L2 en la salida del text entrance de Z-Image 9B (evaluado con el motor real de llama.cpp sobre 36 prompts de retrato reservados) y la divergencia KL de escritura de prompts frente a Q8_0 sobre 80 prompts generados por el propio modelo. No se dispone de informacion sobre el dataset de entrenamiento original del modelo base, numero de tokens, ni si hubo RLHF/DPO.

## Capacidades

- Codificacion de texto para el DiT de Z-Image Turbo con entrada de 9B (dimension 4096 en lugar de la 2560 del encoder oficial de 4B).
- Prompt enhancer: reescritura y expansion de prompts para generacion de imagenes, con cabeza MTP conservada.
- Vision opcional mediante el mmproj F16 (`mmproj-moss-te-f16.gguf`).
- Conversacional (tag `conversational` en el repositorio).
- Compatible con endpoints (tag `endpoints_compatible`).
- Uso como LLM de proposito general cercano al modelo sin cuantizar, segun el autor.
- Integracion en ComfyUI mediante el nodo Dual-Head Dragon Loader (GGUF) con tipo `moss_image`.

## Casos de uso

- Generacion de imagenes con Z-Image Turbo de 9B en ComfyUI: cargar el DiT `z_image_turbo_9b_entrance_nvfp4.safetensors`, el GGUF como text encoder y el VAE `ae.safetensors`, con ModelSamplingAuraFlow shift 3, KSampler de 8 pasos, cfg 1 y sampler `res_multistep`/`simple` (plantilla oficial de Z-Image Turbo).
- Mejora automatica de prompts en pipelines de text-to-image: el mismo fichero reescribe prompts cortos en descripciones detalladas antes de pasarlas al DiT, con una KL de 0,0024 frente a Q8_0 en esta tarea.
- Despliegue en hardware con VRAM limitada: el GGUF de 7,17 GB es mas pequeno que un Q6_K estandar (~7,25 GB), lo que permite ejecutar el encoder en GPUs de consumo alto sin renunciar a precision en la entrada del DiT.
- Prototipado de pipelines text-to-image personalizados: al ser Apache-2.0 y estar en GGUF, se puede integrar en herramientas basadas en llama.cpp y en flujos de ComfyUI sin dependencias propietarias.
- Investigacion sobre cuantizacion selectiva: el enfoque DHQ y las metricas publicadas (error de entrada 2,19% mediana / 2,56% maximo frente a Q8_0) sirven como referencia para estudiar el impacto de la cuantizacion en encoders de difusion.
- Uso conversacional o de generacion de texto como LLM de 9B cuantizado, manteniendo un comportamiento cercano al modelo sin cuantizar segun el autor.

## Benchmarks y rendimiento

| Metrica | Este fichero (DHQ) | Q4_K_M estandar |
|---|---|---|
| Error en la entrada de Z-Image vs Q8_0 (36 prompts de retrato reservados, mediana / maximo) | 2,19% / 2,56% | no disponible |
| KL de escritura de prompts vs Q8_0 (80 prompts) | 0,0024 | 0,0136 |
| Tamano del fichero | 7,17 GB | 5,78 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del text encoder: aproximadamente 7,2 GB solo para los pesos en el fichero DHQ, mas overhead de contexto y de la cache KV.
- El pipeline completo requiere ademas el DiT NVFP4 (4,95 GB) y el VAE, por lo que conviene planificar holgura de VRAM adicional.
- El mmproj de vision opcional anade 0,92 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, el encoder cabe en GPUs de consumo de gama alta (24 GB o mas) y en GPUs de datacenter (A100, H100) con margen amplio.
- Opciones de despliegue: llama.cpp (motor usado para medir el error de entrada) y ComfyUI mediante el nodo Dual-Head Dragon Loader (GGUF). ComfyUI-GGUF no carga aun ficheros GGUF de Qwen3.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (DHQ GGUF) | 9,2B | no disponible | GGUF, 7,17 GB | Apache-2.0 | Text encoder + prompt enhancer para Z-Image 9B |
| Q4_K_M estandar del mismo modelo | 9,2B | no disponible | GGUF, 5,78 GB | Apache-2.0 | KL de prompts 0,0136 frente a Q8_0 |
| Q8_0 del mismo modelo | 9,2B | no disponible | GGUF, 9,79 GB | Apache-2.0 | Referencia de calidad en las metricas del autor |
| Text encoder oficial de Z-Image | 4B (dim. 2560) | no disponible | no disponible | no disponible | Entrada estandar del DiT oficial; no compatible con esta build de 9B |

## Limitaciones y advertencias

- No es compatible con el Z-Image estandar: requiere el DiT con entrada de 9B que el autor distribuye en el mismo repositorio.
- El nodo Dual-Head Dragon para ComfyUI sigue en pruebas y ComfyUI-GGUF no soporta todavia GGUF de Qwen3.5, lo que limita el despliegue fuera de ese nodo.
- El modelo base es una variante "heretic"/decensored, lo que puede implicar sesgos y contenido no filtrado; no se documentan evaluaciones de seguridad.
- Riesgo de alucinacion y de degradacion en la escritura de prompts no cuantificada mas alla de la KL publicada frente a Q8_0.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- La licencia Apache-2.0 permite uso comercial, pero el DiT y el VAE asociados tienen sus propias condiciones (el DiT es Apache-2.0 de Tongyi-MAI; el VAE no se detalla).
- Las metricas de calidad solo cubren dos tareas concretas (entrada del DiT y escritura de prompts) sobre conjuntos de 36 y 80 prompts; no hay evaluacion general del modelo como LLM.

## Enlaces

- Hugging Face: https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic-ZImage9B-DHQ-GGUF
- Modelo base: https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic
- Nodo ComfyUI Dual-Head Dragon: https://github.com/pottokao-dotcom/ComfyUI-DualHead-Dragon
