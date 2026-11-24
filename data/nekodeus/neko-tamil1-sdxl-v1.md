# Nekodeus/neko-tamil1-sdxl-v1

## Resumen

Neko-tamil1-sdxl-v1 es un adaptador LoRA para generación de imágenes de texto a imagen (text-to-image) construido sobre Stable Diffusion XL Base 1.0. Lo desarrolla el usuario Nekodeus y su función es concreta: reproducir el rostro y la apariencia de la figura pública Rajinikanth (actor tamil) mediante un token disparador (`tamil1`) que se incorpora al prompt. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un ajuste fino ligero del UNet de SDXL que añade un concepto de personaje al modelo base.

El adaptador forma parte del conjunto "Tamil Top-10" del mismo autor, una serie de LoRAs de personajes tamiles. El entrenamiento se realizó sobre 38 imágenes verificadas facialmente con OpenCV, con 1500 pasos, dimensión de red 16 y alpha 16, learning rate 1e-4, optimizador Adafactor y precisión fp16, usando el script `sdxl_train_network.py` de kohya-ss sobre GPU de Kaggle.

Su relevancia práctica es la de un componente de personalización para pipelines de difusión: permite fijar la identidad de un personaje concreto en flujos de generación de imágenes sin reentrenar el modelo base, con un coste de almacenamiento mínimo (0,2 GB de repositorio) y licencia Apache 2.0. Las descargas registradas son 0 y los likes 1 en el momento de la consulta, lo que indica un uso muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusión latente, transformer convolucional) |
| Parametros totales | no disponible (adaptador LoRA; dimensión de red 16, alpha 16, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrenamiento 1024 px, buckets de 256 a 2048) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors fp16; el modelo base admite fp16/fp32) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; la model card usa inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil1.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Libreria | diffusers |
| Tamano del repositorio | 0,2 GB |
| Token disparador | `tamil1` |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado exclusivamente al UNet de SDXL, con dimensión de red y alpha de 16. SDXL Base emplea una arquitectura de difusión latente con un UNet de gran tamaño y dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG), además de un VAE para codificar y decodificar latentes. El LoRA no modifica los codificadores de texto ni el VAE: solo inyecta matrices de bajo rango en las capas del UNet para desplazar la distribución generativa hacia el concepto del personaje.

El entrenamiento se realizó con 1500 pasos a resolución 1024 px con bucketing entre 256 y 2048, learning rate 1e-4, optimizador Adafactor con batch 1, precisión fp16, gradient checkpointing y atención sdpa, mediante el script `sdxl_train_network.py` de kohya-ss en una GPU de Kaggle. El dataset consta de 38 imágenes de Rajinikanth verificadas con OpenCV y etiquetadas con un caption uniforme (`a photo of tamil1 person`), lo que explica que el token funcione como identificador de identidad más que como descriptor semántico. No se documenta uso de RLHF, DPO ni técnicas de preferencia, algo por otra parte ajeno a este tipo de adaptadores.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje concreto (Rajinikanth) condicionada por el token `tamil1`.
- Control de estilo mediante prompt: retrato, iluminación de estudio, encuadres y composiciones variables.
- Integración con el ecosistema diffusers mediante `load_lora_weights` sobre `StableDiffusionXLPipeline`.
- Compatibilidad con ComfyUI colocando `tamil1.safetensors` en `models/loras/` y usando un nodo LoRA loader.
- Composición con otros LoRAs y con el modelo base SDXL, al ser un adaptador de bajo rango independiente.
- Resolución nativa de 1024x1024, con soporte de bucketing para proporciones variables.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo: es exclusivamente texto a imagen.

## Casos de uso

- Generación de retratos de personaje para ilustración editorial: el LoRA fija la identidad del actor y permite producir variaciones de encuadre e iluminación con prompts como `tamil1 Rajinikanth, portrait photo, studio lighting`, útil para piezas gráficas de homenaje o divulgación.
- Prototipado de arte conceptual en producción audiovisual: un equipo puede generar bocetos de un personaje concreto a 1024 px antes de encargar el render final, reduciendo iteraciones de diseño.
- Creación de avatares y material promocional para comunidades de fans: el adaptador permite generar imágenes consistentes del personaje sin depender de bancos de imágenes ni de sesiones fotográficas.
- Pruebas de personalización en pipelines de difusión: sirve como caso de estudio de LoRA de personaje con dataset pequeño (38 imágenes) para evaluar la relación entre pasos, dimensión de red y fidelidad de identidad.
- Composición con otros adaptadores en ComfyUI: al ser un LoRA independiente, puede combinarse con LoRAs de estilo para generar al personaje en estéticas distintas (cómic, pintura, fotografía analógica).
- Docencia y experimentación en generación de imágenes: el repositorio incluye muestras del set de entrenamiento en `samples/`, lo que facilita comparar la salida del modelo con las imágenes originales y entender el efecto del token disparador.
- Integración en aplicaciones de generación bajo demanda: mediante la API de diffusers, el adaptador puede cargarse en un servicio que atienda peticiones de imagen con el personaje como concepto fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud facial) ni comparaciones con otros LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa muy poco (0,2 GB de repositorio); el coste real lo determina SDXL Base. En fp16, SDXL requiere aproximadamente 8-10 GB de VRAM para generar a 1024x1024, y en torno a 6-8 GB con optimizaciones de atención y VAE en fp16.
- GPU recomendadas: NVIDIA A100 o H100 para despliegue en producción con concurrencia; RTX 4090 (24 GB) para generación local a máxima resolución; RTX 3090 (24 GB) como alternativa equivalente.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización o `enable_model_cpu_offload`, en tarjetas de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge, InvokeAI y servidores de inferencia basados en diffusers. No aplica a vLLM, llama.cpp, Ollama ni TGI, que son motores de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, de los pasos de muestreo y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Neko-tamil1-sdxl-v1 | LoRA de personaje | SDXL Base 1.0 | dim 16, solo UNet | 1024 px (buckets 256-2048) | Apache 2.0 | Hugging Face, 0 descargas |
| SDXL Base 1.0 | Modelo fundacional texto-imagen | propio | no disponible en la informacion | 1024 px | CreativeML Open RAIL++-M | Hugging Face, ampliamente usado |
| LoRA de personaje generico en SDXL | Adaptador de personaje | SDXL Base 1.0 | variable (dim 8-128) | 1024 px | variable segun autor | Civitai y Hugging Face |
| SD 1.5 + LoRA de personaje | Adaptador de personaje | SD 1.5 | variable | 512 px | CreativeML OpenRAIL-M | Amplia disponibilidad |

La comparación relevante es frente a otros LoRAs de personaje: este adaptador se distingue por su licencia Apache 2.0 (más permisiva que la del modelo base SDXL, que usa Open RAIL++-M) y por un dataset muy reducido (38 imágenes), lo que limita la variedad de poses y expresiones frente a adaptadores entrenados con cientos de imágenes. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgo de dataset: 38 imágenes de una única persona implican poca diversidad de poses, expresiones, iluminación y vestuario; la fidelidad fuera de retratos frontales puede degradarse.
- Riesgo de sobreajuste: con 1500 pasos y un dataset tan pequeño, el adaptador puede reproducir rasgos del set de entrenamiento (fondo, ropa) y no solo la identidad.
- Alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, manos deformes o artefactos en rostros cuando el prompt se aleja de las condiciones de entrenamiento.
- Prompt en inglés: la model card solo documenta el uso en inglés; el comportamiento con prompts en castellano u otros idiomas no está verificado.
- Uso de imagen de persona real: el adaptador reproduce la identidad de Rajinikanth, una figura pública; su uso comercial o difamatorio puede vulnerar derechos de imagen y normativa aplicable, con independencia de la licencia del software.
- Licencia: el adaptador se declara Apache 2.0, pero el modelo base SDXL se distribuye bajo CreativeML Open RAIL++-M, cuyas restricciones de uso se heredan al combinar ambos.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de similitud facial que permitan cuantificar la fidelidad del personaje.
- Madurez: 0 descargas y 1 like indican ausencia de validación por parte de la comunidad; no se recomienda para producción sin evaluación propia.
- Fecha de creación registrada en 2026-11-24, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-tamil1-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset público de entrenamiento: https://huggingface.co/datasets/nekodeus/tamil-top10-v2 (subcarpeta `tamil1/`)
- Script de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Documentación de diffusers para LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
