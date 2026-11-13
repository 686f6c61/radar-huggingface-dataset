# moonbox-dev/Qwen-Image-2.1-Turbo-GGUF

## Resumen

Qwen-Image-2.1-Turbo-GGUF es una colección de pesos cuantizados en formato GGUF del modelo de difusión Qwen-Image-2.1-Turbo, publicado por el usuario moonbox-dev en Hugging Face. El modelo original lo desarrolla el equipo Qwen (Alibaba) y está orientado a generación de imágenes a partir de texto (text-to-image) y edición de imágenes. Esta variante GGUF no incluye el pipeline completo: solo contiene los pesos del transformador de difusión, mientras que el codificador de texto (Qwen3-VL-8B-Instruct) y el VAE deben descargarse por separado.

La relevancia de esta publicación radica en que permite ejecutar un modelo de difusión de aproximadamente 7.100 millones de parámetros en hardware de consumo mediante cuantización, usando runtimes como stable-diffusion.cpp o ComfyUI con el nodo ComfyUI-GGUF. El checkpoint Turbo está diseñado para generar imágenes en solo 8 pasos de denoising, con CFG=1 por defecto y caché KV de prefijo para reutilizar el contexto de texto e imagen de referencia entre pasos.

La licencia es Qwen Research License, lo que restringe el uso a investigación y evaluación, y exige una licencia comercial de Qwen para uso productivo. El repositorio ocupa 51,7 GB e incluye seis precisiones distintas, desde F16/BF16 sin pérdida hasta Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusión (diffusion transformer) para generación de imágenes; checkpoint acelerado de Qwen-Image-2.1 con 8 pasos de denoising |
| Parametros totales | 7.115.124.736 (7,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (Qwen Research License); uso comercial requiere licencia de Qwen |
| Formato de pesos | GGUF (un archivo por precisión) |
| Tamano del repositorio | 51,7 GB |
| Codificador de texto | Qwen3-VL-8B-Instruct (GGUF separado, Q8_0) |
| VAE | qwen_image_2.1_vae_bf16.safetensors (separado, Comfy-Org/Qwen-Image-2.1) |

## Arquitectura y entrenamiento

El modelo es un transformador de difusión de 7,1 mil millones de parámetros, derivado del checkpoint Qwen-Image-2.1 y acelerado en la variante Turbo para operar con 8 pasos de denoising. El pipeline completo combina el transformador de difusión con un codificador de texto multimodal Qwen3-VL-8B-Instruct y un VAE separado. La generación utiliza CFG=1 por defecto y una caché KV de prefijo que reutiliza el contexto de texto e imagen de referencia a lo largo de los pasos de difusión, reduciendo el coste computacional por paso.

Los archivos GGUF se generaron a partir de la revisión `fc13ba1986` del modelo original: los pesos BF16 se convirtieron a GGUF F16/BF16 y luego se cuantizaron con `llama-quantize` de llama.cpp. Cada archivo fue verificado frente a los pesos originales antes de la subida, con errores RMS relativos documentados en la model card: 5,9e-9 para F16, exacto para BF16, 0,56 % para Q8_0, 1,8 % para Q6_K, 3,4 % para Q5_K_M y 6,6 % para Q4_K_M. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con 8 pasos de denoising.
- Edición de imágenes: admite una imagen de referencia de entrada mediante `-r input.png` y el codificador de visión `mmproj-Qwen3VL-8B-Instruct-F16.gguf`.
- Integración con el codificador de texto multimodal Qwen3-VL-8B-Instruct, que aporta comprensión de texto e imagen de referencia.
- Ejecución en stable-diffusion.cpp (commit 465adf3) mediante `sd-cli` con el schedule `--sigmas qwen-image-2.1-turbo`.
- Soporte en ComfyUI a través del nodo ComfyUI-GGUF (PR #483), con loader `qwen_image`.
- Carga directa en Diffusers mediante `QwenImage21Pipeline` para el modelo original (no para los GGUF).
- Generación con CFG=1 por defecto y caché KV de prefijo para reutilizar contexto entre pasos.

## Casos de uso

- Generación de ilustraciones y concept art en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (4,38 GB) permite ejecutar el transformador de difusión en GPUs con 8-12 GB de VRAM, usando el codificador de texto y el VAE en memoria o en CPU.
- Edición de imágenes por instrucciones: el modelo acepta una imagen de referencia y un prompt para modificar su contenido, útil en flujos de retoque fotográfico o variaciones de producto, aprovechando el codificador de visión Qwen3-VL-8B-Instruct.
- Prototipado rápido de pipelines text-to-image en ComfyUI: la integración con ComfyUI-GGUF permite construir grafos nodales con el loader `qwen_image` y comparar precisiones sin salir del entorno visual.
- Evaluación e investigación de modelos de difusión: al ser una licencia de investigación, encaja en estudios comparativos de cuantización y en la medición de la degradación de calidad entre Q8_0 y Q4_K_M.
- Despliegue en entornos con memoria limitada: la versión Q8_0 (7,69 GB) ofrece un equilibrio entre fidelidad (0,56 % de error RMS) y tamaño, adecuada para servidores con una sola GPU de 16 GB.
- Generación de imágenes en local sin dependencia de servicios en la nube: el formato GGUF y stable-diffusion.cpp permiten ejecutar el modelo de forma offline en equipos de escritorio.
- Pruebas de integración en CI/CD de pipelines de imagen: los archivos tienen hash sha256 documentado, lo que facilita la verificación de integridad en automatizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta el error RMS relativo de cada cuantización frente a los pesos BF16 originales, que se recoge en la tabla siguiente.

| Precisión | Archivo | Tamaño | Error RMS relativo vs BF16 |
|---|---|---|---|
| F16 | qwen-image-2-1-turbo-F16.gguf | 14,23 GB | 5,9e-9 (0,0000006 %) |
| BF16 | qwen-image-2-1-turbo-BF16.gguf | 14,23 GB | exacto |
| Q8_0 | qwen-image-2-1-turbo-Q8_0.gguf | 7,69 GB | 0,56 % |
| Q6_K | qwen-image-2-1-turbo-Q6_K.gguf | 6,00 GB | 1,8 % |
| Q5_K_M | qwen-image-2-1-turbo-Q5_K_M.gguf | 5,19 GB | 3,4 % |
| Q4_K_M | qwen-image-2-1-turbo-Q4_K_M.gguf | 4,38 GB | 6,6 % |

## Requisitos de hardware

- VRAM estimada para el transformador de difusión: aproximadamente 4,4 GB (Q4_K_M), 5,2 GB (Q5_K_M), 6,0 GB (Q6_K), 7,7 GB (Q8_0) y 14,2 GB (F16/BF16).
- A esa cifra hay que sumar el codificador de texto Qwen3-VL-8B-Instruct (GGUF Q8_0) y el VAE, que se cargan como componentes separados y pueden residir en GPU o CPU según el runtime.
- GPU recomendadas: RTX 4090 (24 GB) para BF16/F16 sin compromisos; RTX 4080/4070 Ti (16 GB) para Q8_0; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q5_K_M y Q6_K; GPUs de 8 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, al menos desde Q4_K_M en adelante, siempre que se gestione la memoria del codificador de texto y el VAE.
- Opciones de despliegue: stable-diffusion.cpp (runtime de referencia del benchmark, commit 465adf3), ComfyUI con ComfyUI-GGUF (PR #483), y Diffusers con `QwenImage21Pipeline` para el modelo original en BF16.
- Latencia y throughput: no disponibles. El modelo está diseñado para 8 pasos de denoising con CFG=1, lo que reduce el coste frente a schedules de 20-50 pasos, pero no se publican cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de denoising | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-GGUF (este) | 7,1 B | 8 | GGUF (F16 a Q4_K_M) | qwen-research | Hugging Face, 22 descargas |
| Qwen-Image-2.1-Turbo (original) | 7,1 B | 8 | BF16 safetensors | qwen-research | Hugging Face, Diffusers |
| Qwen-Image-2.1 (base) | 7 B (según model card) | No disponible | Safetensors | qwen-research | Hugging Face, Diffusers |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas de otros autores; la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia Qwen Research License: uso restringido a investigación y evaluación; el uso comercial requiere una licencia de Qwen. Los archivos GGUF son derivados y heredan la misma licencia.
- El repositorio solo contiene los pesos del transformador de difusión; es imprescindible descargar por separado el codificador de texto Qwen3-VL-8B-Instruct (GGUF Q8_0) y el VAE `qwen_image_2.1_vae_bf16.safetensors`.
- La cuantización introduce degradación medible: Q4_K_M presenta un 6,6 % de error RMS relativo frente a BF16, lo que puede afectar al detalle fino y a la fidelidad en edición de imágenes.
- No se han publicado evaluaciones de calidad de imagen (puntuaciones frente a salidas BF16) en la información disponible; la model card indica que se añadirán a medida que cada precisión pase la evaluación de imagen.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación visual; se desconoce el comportamiento del modelo en prompts en castellano o en idiomas distintos del inglés.
- El soporte en ComfyUI depende de un PR (#483) de ComfyUI-GGUF, por lo que la integración puede requerir compilar desde una rama concreta.
- El número de descargas (22) y de likes (0) es muy bajo, lo que sugiere poca validación comunitaria del repositorio.
- El schedule de 8 pasos está fijado (`--sigmas qwen-image-2.1-turbo`); usar otros schedules o valores de CFG distintos de 1 puede degradar la calidad.
- El repositorio ocupa 51,7 GB, por lo que la descarga completa requiere espacio en disco considerable; conviene descargar solo la precisión necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1-Turbo
- GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Blog: https://qwen.ai/blog?id=qwen-image-2.1
- Discord: https://discord.gg/BEYSk3pkSu
- Codificador de texto GGUF: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-GGUF
- VAE: https://huggingface.co/Comfy-Org/Qwen-Image-2.1 (carpeta vae/)
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- PR de soporte Qwen-Image 2.1 en ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF/pull/483
- Diffusers: https://github.com/huggingface/diffusers
