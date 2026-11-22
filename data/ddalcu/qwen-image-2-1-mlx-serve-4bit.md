# ddalcu/Qwen-Image-2.1-MLX-Serve-4bit

## Resumen

Qwen-Image-2.1-MLX-Serve-4bit es una cuantizacion de 4 bits del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, empaquetada por el desarrollador independiente ddalcu para su runtime mlx-serve, orientado al framework MLX de Apple. El modelo resuelve el problema de ejecutar un modelo de difusion de gran tamano en equipos Mac con memoria unificada limitada: el pack ocupa 11,2 GB y esta pensado para Macs de 16 GB, frente a los 13,2 GB del repositorio completo.

La arquitectura subyacente es la del modelo base de Qwen: un transformer de difusion (DiT) para el proceso de denoising, un text encoder basado en Qwen3-VL con su torre de vision, y un VAE para la decodificacion latente a pixeles. La cuantizacion se aplica de forma selectiva: las capas lineales de los bloques DiT y del text encoder se cuantizan en 4 bits con grupos de 64, mientras que el VAE, los embeddings de tokens, las normalizaciones y las lineales pequenas o compartidas se mantienen en precision completa. Se conserva la torre de vision para edicion por instruccion.

Es relevante ahora porque demuestra que un modelo de imagen de la familia Qwen puede ejecutarse localmente en hardware de consumo Apple con un consumo pico medido de 9,55 GB, a costa de una latencia considerable (del orden de decenas de segundos por paso en un M1 Pro). La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con text encoder Qwen3-VL y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (group 64) en lineales de bloques DiT y capas del text encoder; VAE en f32; embed_tokens, norms y lineales pequenas/compartidas en precision completa |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout y nombres de claves de diffusers) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen-Image-2.1 sigue un esquema de difusion latente con un transformer de difusion (DiT) como red de denoising, un text encoder multimodal Qwen3-VL y un VAE que decodifica los latentes a imagen. Esta version no reentrena el modelo: parte de los pesos del modelo base y aplica cuantizacion post-entrenamiento selectiva. Las lineales de los bloques DiT y las capas del text encoder se cuantizan en 4 bits con tamano de grupo 64; el VAE se mantiene en f32, y se preservan en precision completa los `embed_tokens`, las normalizaciones y las lineales pequenas o compartidas del DiT. Se eliminan el `lm_head` y las `time_conv` por frame del VAE. La torre de vision del Qwen3-VL se conserva para permitir edicion de imagen por instruccion.

El proceso de conversion se realiza mediante el script `tests/convert_qwen_image21_weights.py --preset 16gb` del repositorio mlx-serve. El runtime carga el text encoder por peticion y lo libera antes de la fase de denoising, de modo que el conjunto residente en memoria es el DiT mas el VAE. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni si el modelo base empleo RLHF o DPO.

## Capacidades

- Generacion de imagenes texto-a-imagen (text-to-image) mediante prompts en lenguaje natural.
- Edicion de imagen por instruccion: modo `edit` con una imagen de entrada y hasta 9 imagenes de referencia adicionales.
- Imagen-a-imagen (image-to-image) mediante los parametros `image` y `strength`.
- CFG real (classifier-free guidance) cuando `guidance_scale` es mayor que 1 y se proporciona un `negative_prompt`, a costa de dos pasadas por paso.
- Control del numero de pasos de denoising (40 por defecto si se omite).
- Control del tamano de salida (por ejemplo, 512x512 o 1024x1024).
- Servicio via API HTTP compatible con el endpoint `/v1/images/generations`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; el modelo es exclusivamente generativo de imagen.

## Casos de uso

- Prototipado local de generacion de imagenes en Mac: un desarrollador puede generar imagenes de 512x512 en unos 118 s con 20 pasos en un M1 Pro de 32 GB, sin depender de servicios en la nube ni de GPUs dedicadas.
- Edicion de imagenes por instruccion: el modo `edit` con imagenes de referencia permite modificar una imagen existente siguiendo un prompt, util para iterar sobre bocetos o variaciones de producto conservando la composicion original.
- Imagen-a-imagen con control de fuerza: ajustando `strength` se puede aplicar un estilo o una transformacion parcial sobre una imagen base, adecuado para workflows de diseno grafico que requieren variaciones controladas.
- Servicio de generacion de imagenes en red local: el endpoint HTTP `/v1/images/generations` permite integrar el modelo en herramientas internas o demos sin exponer datos a terceros, aprovechando la licencia Apache-2.0.
- Generacion de ilustraciones para documentacion tecnica o blogs: con prompts descriptivos y 512x512 se obtienen imagenes de acompanamiento en tiempos asumibles en un portatil Apple.
- Experimentacion e investigacion en cuantizacion: el pack sirve como referencia para estudiar el impacto de la cuantizacion 4-bit selectiva en la calidad de un DiT, comparando contra el pack de 8 bits del mismo autor.
- Pruebas de concepto de pipelines multimodales: la conservacion de la torre de vision del Qwen3-VL permite experimentar con edicion guiada por imagen sin salir del ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible. Los unicos datos medidos son de rendimiento de inferencia en un Apple M1 Pro de 32 GB:

| Pack | Resolucion | Pasos | Tiempo total (incl. carga) | Memoria pico |
|---|---|---|---|---|
| 8-bit | 1024x1024 | 40 | 985 s (~23 s/paso) | 12,95 GB |
| 4-bit | 1024x1024 | 3 | 87 s | 9,55 GB |
| 4-bit | 512x512 | 20 | 118 s | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el pack de 4 bits ocupa 11,2 GB en disco y el autor lo disena para Macs de 16 GB; la memoria pico medida es de 9,55 GB en un M1 Pro de 32 GB.
- GPU recomendadas: hardware Apple Silicon con MLX (M1 Pro o superior segun las mediciones publicadas); no se documenta soporte para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 16 GB o mas. No aplica a GPUs discretas convencionales por la dependencia de MLX.
- Opciones de despliegue: exclusivamente mlx-serve, instalable via Homebrew (`brew tap ddalcu/mlx-serve` y `brew install mlx-serve`), con `mlx-serve pull` y `mlx-serve serve` exponiendo la API en el puerto 11234. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 23 s por paso a 1024x1024 con el pack de 8 bits; 87 s para 3 pasos a 1024x1024 con 4 bits; 118 s para 20 pasos a 512x512 con 4 bits. El text encoder se carga por peticion y se libera antes del denoising, lo que anade coste de carga por solicitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ddalcu/Qwen-Image-2.1-MLX-Serve-4bit | no disponible | no disponible | Apache-2.0 | Hugging Face, runtime mlx-serve | Cuantizacion 4-bit para Mac; 11,2 GB |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | Apache-2.0 | Hugging Face, diffusers | Pesos completos; requiere mas memoria |
| Pack 8-bit de ddalcu (mismo autor) | no disponible | no disponible | Apache-2.0 | Hugging Face | 12,95 GB de memoria pico; ~23 s/paso a 1024x1024 |

No se dispone de datos de otros modelos de generacion de imagen comparables en la informacion proporcionada; los unicos puntos de comparacion documentados son el modelo base y la variante de 8 bits del mismo autor.

## Limitaciones y advertencias

- La cuantizacion 4-bit es agresiva y puede degradar la fidelidad de las imagenes generadas frente al modelo base; no se han publicado metricas de calidad que cuantifiquen esa perdida.
- La latencia es alta: del orden de 23 s por paso a 1024x1024 en un M1 Pro, lo que hace impractical la generacion con 40 pasos en produccion interactiva.
- Dependencia exclusiva del runtime mlx-serve y del framework MLX: no es portable a otros backends de inferencia sin reconversion.
- Se han eliminado el `lm_head` y las `time_conv` por frame del VAE; cualquier funcionalidad que dependa de esas componentes no estara disponible.
- El text encoder se carga y libera por peticion, lo que anade latencia de carga a cada solicitud.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma; la ficha de idiomas figura como no disponible.
- Licencia Apache-2.0, igual que el modelo base: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen-Image-2.1 por si hubiera terminos adicionales.
- El autor es un desarrollador independiente; no hay garantias de mantenimiento ni soporte oficial de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddalcu/Qwen-Image-2.1-MLX-Serve-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- Imagen de muestra: https://raw.githubusercontent.com/ddalcu/mlx-serve/main/website/screenshots/qwen-image-2.1-4bit-512.jpg
