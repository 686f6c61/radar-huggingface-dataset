# loom-fun-staging/Tongyi-MAI-Z-Image-Turbo-loom

## Resumen

Tongyi-MAI-Z-Image-Turbo-loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) que empaqueta el modelo de generación de imágenes Tongyi-MAI/Z-Image-Turbo para su ejecución sobre GPUs AMD mediante el runtime Loom (hrx-loom). No es un modelo nuevo: los pesos del codificador de texto Qwen3, del VAE y del tokenizador se leen sin modificar del checkpoint del editor original, mientras que el transformer de difusión se toma de la copia en BF16 publicada por Comfy-Org, ya que el editor solo lo distribuye en F32. El paquete lo publica el autor `loom-fun-staging` y está pensado para el chip AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El modelo subyacente es un transformer de difusión de flujo único (single-stream) destilado para generar imágenes en ocho pasos, sin classifier-free guidance, acompañado de un codificador de texto Qwen3. El paquete lo expone como un endpoint compatible con la API de OpenAI (`/v1/images/generations`) a través de `loom-serve`. Su relevancia actual radica en que ofrece una vía de inferencia optimizada para hardware AMD consumer (APUs Strix Halo) con aceleraciones de 2,2× a 11× frente a alternativas como stable-diffusion.cpp en el mismo hardware, manteniendo una fidelidad numérica alta respecto a la referencia en PyTorch (PSNR de 30,49 frente a diffusers fp32).

La licencia es Apache 2.0 y el pipeline declarado es `text-to-image`. El paquete se ha cualificado contra los SDK hrx-loom 0.2.0 y 0.3.0, con resultados idénticos píxel a píxel en las tres peticiones de prueba a 1024×1024 con semilla 42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de flujo unico (single-stream) destilado, con codificador de texto Qwen3 y decodificador VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusion; limitado por la longitud del prompt del codificador Qwen3) |
| Tipos de cuantizacion | BF16 (pesos del transformer en BF16); F32 en el checkpoint original del editor; INT8-ConvRot disponible en Comfy-Org (usado solo en comparativas con thenoise) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el codificador Qwen3 es multilingue, pero no se documenta el conjunto soportado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 para el transformer; el codificador, VAE y tokenizador se leen del checkpoint del editor); paquete `.loom` con `model.json` |
| Pasos de inferencia | 8 pasos, sin classifier-free guidance |
| Resoluciones soportadas | 1024×1024 (preset `:image`) y 768×1344 (via parametro `size`) |
| Hardware de referencia | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) |
| Interfaz de servicio | API compatible OpenAI `/v1/images/generations` via `loom-serve` |

## Arquitectura y entrenamiento

El modelo subyacente, Z-Image-Turbo de Tongyi-MAI, es un transformer de difusion de flujo unico (single-stream) destilado para funcionar en ocho pasos de muestreo sin classifier-free guidance, lo que reduce drásticamente el coste computacional por imagen frente a modelos de difusion convencionales que requieren decenas de pasos y doble evaluacion por paso (CFG). Se compone de tres bloques: un codificador de texto Qwen3 que procesa el prompt, el transformer de difusion que genera el latente, y un decodificador VAE que produce la imagen RGB final. El paquete Loom no modifica ninguno de estos componentes: el codificador, VAE y tokenizador se leen sin cambios del checkpoint del editor, y el transformer se toma de la copia BF16 de Comfy-Org porque el editor solo lo publica en F32.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO o destilacion por pasos (aunque la denominacion "Turbo" y los ocho pasos sugieren destilacion por trayectoria, este dato no se confirma en la documentacion). La innovacion tecnica destacable del paquete Loom es la implementacion nativa de los programas de inferencia sobre el runtime hrx-loom para GPUs AMD, con `--diffusion-fa` (atencion flash para difusion) y tiling de VAE en las comparativas con stable-diffusion.cpp. La cualificacion contra los SDK 0.2.0 y 0.3.0 confirma que ambos producen los mismos pixeles RGB decodificados en las tres peticiones de prueba, lo que indica estabilidad numerica entre versiones del runtime.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024×1024 y 768×1344 con ocho pasos de muestreo y sin classifier-free guidance.
- Reproducibilidad determinista: la misma semilla produce la misma imagen, segun la documentacion del paquete.
- Servicio mediante API compatible con OpenAI (`/v1/images/generations`), con respuesta en `b64_json`.
- Endpoint de estado (`/v1/status`) y de listado de modelos (`/v1/models`) para monitorizar la preparacion del modelo.
- Soporte de geometrias alternativas mediante el parametro `size`.
- Integracion con el ecosistema Loom (hrx-loom) para despliegue en GPUs AMD.
- No se documentan capacidades de edicion de imagen, inpainting, vision, audio ni tool calling en la informacion disponible.

## Casos de uso

- Generacion de imagenes por lotes en estaciones de trabajo con APU AMD Strix Halo: el paquete permite generar imagenes a 1024×1024 en torno a 20 segundos por imagen (mediana de peticiones en caliente de 15,8 s con SDK 0.3.0), lo que lo hace adecuado para prototipado y generacion de assets en local sin depender de GPUs NVIDIA.
- Servicio de generacion de imagenes autoalojado: al exponer un endpoint compatible con OpenAI, puede integrarse en aplicaciones existentes que ya consumen la API de imagenes de OpenAI sin cambios en el codigo cliente, sustituyendo solo la URL base.
- Generacion de ilustraciones para documentacion tecnica o articulos: el codificador Qwen3 procesa prompts en lenguaje natural y el modelo destilado en ocho pasos permite iterar rapidamente sobre variaciones de prompt con semilla fija para reproducibilidad.
- Creacion de assets para videojuegos o prototipos de UI: la resolucion 768×1344 (vertical) y 1024×1024 (cuadrada) cubren formatos habituales de sprites, fondos y mockups.
- Evaluacion comparativa de runtimes en hardware AMD: el paquete incluye datos de rendimiento frente a stable-diffusion.cpp (ROCm y Vulkan), diffusers y thenoise, lo que permite usarlo como referencia para medir el impacto de Loom en pipelines de difusion.
- Investigacion en eficiencia de inferencia: la disponibilidad de pesos en BF16, F32 e INT8-ConvRot, junto con las metricas de PSNR y LPIPS frente a la referencia en PyTorch, facilita estudios de deriva numerica por cuantizacion.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias no comerciales habituales en modelos de difusion.

## Benchmarks y rendimiento

Rendimiento en AMD Strix Halo (gfx1151), 1024×1024, 8 pasos, sin CFG. Segundos por imagen de extremo a extremo (peticion a PNG):

| Backend | Pesos | s/imagen | Aceleracion Loom | CLIPScore | PickScore |
|---|---|---:|---:|---:|---:|
| Loom (este paquete) | bf16 | 20,0 | — | 28,98 | 23,276 |
| stable-diffusion.cpp ROCm, `--diffusion-fa` | Q8_0 GGUF | 44,2 | 2,2× | 29,18 | 23,137 |
| stable-diffusion.cpp Vulkan, `--diffusion-fa --vae-tiling` | Q8_0 GGUF | 58,0 | 2,9× | 29,04 | 23,049 |
| stable-diffusion.cpp Vulkan via Lemonade | bf16 | 113,7 | 5,7× | 29,18 | 23,070 |
| stable-diffusion.cpp ROCm, `--diffusion-fa` | bf16 | 175,2 | 8,8× | 29,11 | 23,136 |
| stable-diffusion.cpp ROCm via Lemonade | bf16 | 219,3 | 11,0× | 29,03 | 23,138 |
| thenoise (PyTorch) ROCm via Lemonade | bf16 | 22,9 | 1,15× | 28,87 | 23,301 |
| diffusers bf16 PyTorch ROCm | bf16 | 99,7 | 5,0× | 29,07 | 23,292 |
| diffusers fp32 PyTorch ROCm | fp32 | 770,2 | 38,5× | 29,21 | 23,395 |

Variantes de thenoise en proceso (sin Lemonade ni HTTP):

| Variante | s/imagen | Aceleracion Loom |
|---|---:|---:|
| bf16, eager (configuracion de Lemonade) | 21,88 | 1,09× |
| bf16, `torch.compile` | 20,81 | 1,04× |
| INT8-ConvRot, eager | 23,51 | 1,18× |
| INT8-ConvRot, `torch.compile` | 21,17 | 1,06× |

Precision frente a la referencia en PyTorch (mismos prompts y mismo ruido inicial):

| Backend | PSNR vs diffusers fp32 | LPIPS vs diffusers fp32 | LPIPS vs diffusers bf16 |
|---|---:|---:|---:|
| Loom (este paquete) | 30,49 | 0,032 | 0,035 |

Latencia de servicio con SDK hrx-loom en Strix Halo (1024×1024, semilla 42):

| SDK | Primera peticion | Mediana de dos peticiones en caliente |
|---|---:|---:|
| 0.2.0 | 17,562 s | 15,887 s |
| 0.3.0 | 17,143 s | 15,838 s |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. El hardware de referencia es una APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), que comparte memoria unificada entre CPU y GPU.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) es el unico hardware documentado y probado. No se documenta soporte para GPUs NVIDIA, AMD Radeon discretas ni otras arquitecturas.
- Cabe en GPU consumer: si, en la APU Strix Halo documentada. No se confirma compatibilidad con otras GPUs consumer.
- Opciones de despliegue: `loom-serve` (runtime hrx-loom, instalable con `pipx install "hrx-loom[hf]==0.3.0"`), con `loom-fetch` para descargar el paquete. Tambien se documentan comparativas con stable-diffusion.cpp (builds ROCm y Vulkan), diffusers (PyTorch ROCm) y thenoise.
- Latencia y throughput: aproximadamente 15,8 s por imagen en caliente y 17,1-17,6 s en la primera peticion a 1024×1024 con SDK 0.3.0 en Strix Halo. El throughput no se documenta de forma explicita, pero se deduce en torno a 3,8 imagenes por minuto en regimen estable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tongyi-MAI-Z-Image-Turbo-loom (este paquete) | no disponible | 1024×1024 y 768×1344 | Apache 2.0 | Hugging Face (loom-fun-staging) | Optimizado para AMD Strix Halo; 20,0 s/imagen bf16 |
| Tongyi-MAI/Z-Image-Turbo (original) | no disponible | no disponible | Apache 2.0 (segun el paquete derivado) | Hugging Face (Tongyi-MAI) | Checkpoint del editor; transformer solo en F32 |
| Comfy-Org/z_image_turbo | no disponible | no disponible | no disponible | Hugging Face (Comfy-Org) | Copia BF16 del transformer y variante INT8-ConvRot |
| stable-diffusion.cpp (runtime) | no aplica | no aplica | no disponible | GitHub (leejet) | Runtime alternativo; 44,2-219,3 s/imagen en Strix Halo segun build |
| diffusers (runtime) | no aplica | no aplica | no disponible | GitHub (huggingface) | Referencia PyTorch; 99,7 s/imagen bf16 y 770,2 s/imagen fp32 en Strix Halo |

No se dispone de datos de benchmarks de otros modelos de difusion comparables (por ejemplo, FLUX, SDXL o similares) en la informacion proporcionada, por lo que la comparativa se limita a variantes del mismo modelo y a runtimes de inferencia.

## Limitaciones y advertencias

- El paquete esta probado unicamente en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); no se documenta compatibilidad con otras GPUs o APUs, ni con hardware NVIDIA.
- El transformer se toma de la copia BF16 de Comfy-Org porque el editor solo lo publica en F32; esto introduce una dependencia de un repositorio de terceros para la reproducibilidad exacta del paquete.
- La deriva numerica frente a diffusers fp32 es medible (PSNR 30,49, LPIPS 0,032), lo que puede afectar a comparaciones pixel a pixel con la referencia, aunque visualmente la diferencia es pequena.
- El modelo subyacente es de difusion y no soporta tool calling, agentes ni razonamiento multi-paso; las capacidades se limitan a generacion de imagenes.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni limitaciones idiomaticas del codificador Qwen3 en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del checkpoint original de Tongyi-MAI y de la copia de Comfy-Org, ya que el paquete no las detalla de forma independiente.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y esta publicado por una cuenta de staging (`loom-fun-staging`); no debe considerarse una version estable de produccion sin validacion adicional.
- El listener de `loom-serve` se levanta antes de que el modelo termine de prepararse; las peticiones deben esperar a que `/v1/models` liste el modelo o consultar `/v1/status`.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/Tongyi-MAI-Z-Image-Turbo-loom
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Copia BF16 del transformer: https://huggingface.co/Comfy-Org/z_image_turbo
- Snapshot de produccion: https://huggingface.co/loom-fun/Tongyi-MAI-Z-Image-Turbo-loom/tree/77e103e314324c35a88b62350286b07e8dc0f05d
- Repositorio Loom (hrx-system): https://github.com/ROCm/hrx-system
- Pull request en hrx-loom-library: https://github.com/ROCm/hrx-loom-library/pull/126
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Evidencia DevLab: https://github.com/loom-fun/loom-skills/actions/runs/45253984158/job/137970780518
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- thenoise: https://github.com/lemonade-sdk/thenoise
- diffusers: https://github.com/huggingface/diffusers
