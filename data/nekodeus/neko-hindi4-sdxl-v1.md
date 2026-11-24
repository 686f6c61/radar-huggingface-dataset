# Nekodeus/neko-hindi4-sdxl-v1

## Resumen

neko-hindi4-sdxl-v1 es un LoRA de personaje para Stable Diffusion XL entrenado por el usuario Nekodeus para generar imagenes fotorrealistas del actor indio Akshay Kumar. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (rank 16) que se aplica sobre `stabilityai/stable-diffusion-xl-base-1.0` para inyectar el conocimiento visual de un rostro concreto. El repositorio ocupa 0,2 GB y contiene un unico fichero de pesos `hindi4.safetensors`, ademas de cuatro imagenes de muestra del conjunto de entrenamiento.

El adaptador se entreno con 27 imagenes curadas del actor, verificadas facialmente con OpenCV y etiquetadas con una plantilla uniforme (`a photo of hindi4 person`), usando el token disparador `hindi4`. El entrenamiento se realizo en una GPU de Kaggle, de forma completamente offline, con 1500 pasos a 1024 px, optimizador Adafactor y learning rate 1e-4 sobre el script `sdxl_train_network.py` de kohya-ss.

Su relevancia es limitada y muy especifica: sirve para producir retratos consistentes de una celebridad concreta dentro de pipelines SDXL, un caso de uso comun en generacion de contenido, prototipado de personajes y demostraciones de personalizacion de difusion. La licencia Apache 2.0 facilita su redistribucion, aunque el contenido generado plantea cuestiones de derechos de imagen que el autor no aborda en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL |
| Parametros totales | no disponible (rank 16 en UNet; el repositorio pesa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el prompt se tokeniza con el text encoder de SDXL) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite fp16 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (los prompts de la model card estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`hindi4.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 aplicado exclusivamente al UNet del modelo base SDXL, no a los text encoders. Se entreno con el script `sdxl_train_network.py` del repositorio kohya-ss, en precision fp16, con gradient checkpointing y atencion sdpa, sobre una GPU de Kaggle en modo offline. La resolucion de entrenamiento fue de 1024 px con bucketing entre 256 y 2048, learning rate 1e-4, optimizador Adafactor y batch size 1 durante 1500 pasos.

El dataset consta de 27 imagenes de Akshay Kumar verificadas con OpenCV para asegurar la presencia del rostro y etiquetadas con la plantilla uniforme `a photo of hindi4 person`. Forma parte del conjunto "Hindi Top-10" del mismo autor, publicado como `nekodeus/hindi-top10-v2` en la subcarpeta `hindi4/`. No se documenta el uso de RLHF, DPO ni tecnicas de regularizacion como class balancing o prior preservation, lo que con 27 imagenes y 1500 pasos sugiere un riesgo apreciable de sobreajuste al conjunto y de arrastre de estilo de las muestras originales.

## Capacidades

- Generacion text-to-image de retratos del actor Akshay Kumar mediante el token disparador `hindi4`.
- Personalizacion de identidad facial sobre cualquier pipeline SDXL compatible con LoRA.
- Composicion con prompts de escena, iluminacion y estilo (por ejemplo, `portrait photo, studio lighting`).
- Compatible con diffusers (`load_lora_weights`) y con ComfyUI mediante nodo LoRA loader.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un adaptador de difusion.
- Capacidad multilingue de prompts: no documentada; la model card solo ejemplifica en ingles.
- No incluye modo thinking, vision, audio ni capacidades multimodales mas alla de la propia generacion de imagen.

## Casos de uso

- Prototipado de personajes basados en celebridades: util para generar storyboards o pruebas de casting visuales donde se necesite un rostro reconocible de forma consistente antes de contratar a un actor real.
- Generacion de contenido editorial de fans: ilustraciones o portadas para medios de entretenimiento bollywoodiense, siempre que se respeten los derechos de imagen del actor.
- Pruebas de pipelines de personalizacion: sirve como caso de referencia para validar flujos de entrenamiento LoRA de bajo coste (1500 pasos, 27 imagenes) en entornos con recursos limitados como Kaggle.
- Investigacion sobre sesgo y sobreajuste en LoRA de personajes: con solo 27 imagenes, es un ejemplo util para estudiar como se transfieren rasgos del dataset (iluminacion, encuadre, vestuario) a las generaciones.
- Demostraciones de ComfyUI: al ser un fichero unico `hindi4.safetensors`, se integra rapidamente en flujos de nodos para talleres o tutoriales de difusion.
- Generacion de avatares o retratos sinteticos para entornos de prueba: en sistemas de QA visual donde se necesiten caras realistas y reproducibles sin usar datos personales reales de usuarios.
- Fine-tuning posterior o merging: el adaptador puede combinarse con otros LoRA de estilo o servir de base para experimentos de composicion de adaptadores en SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas como FID, CLIP score ni evaluaciones de similitud facial.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,2 GB, pero requiere cargar el modelo base SDXL completo, que en fp16 consume aproximadamente 6,9 GB de VRAM para el UNet y los text encoders, mas el VAE y los buffers de activacion.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generacion a 1024 px con margen; tarjetas con 12-16 GB pueden ejecutar SDXL con optimizaciones.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB o superiores usando fp16 y atencion eficiente; en GPUs de 8 GB requiere cuantizacion o descarga de modulos a CPU.
- Opciones de despliegue: diffusers con `load_lora_weights`, ComfyUI con nodo LoRA loader, Automatic1111/Forge y otros frontends compatibles con SDXL LoRA; tambien es posible exportar el adaptador fusionado al modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, de los pasos de muestreo y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-hindi4-sdxl-v1 | LoRA de personaje | SDXL 1.0 | rank 16 (UNet) | no aplica | apache-2.0 | Hugging Face |
| neko-hindi* (resto del set Hindi Top-10) | LoRA de personaje | SDXL 1.0 | no disponible | no aplica | no disponible | Hugging Face (nekodeus/hindi-top10-v2) |
| LoRA de personaje genericos de la comunidad SDXL | LoRA de personaje | SDXL 1.0 | rank variable (4-128) | no aplica | variable | Hugging Face, Civitai |

La comparacion con alternativas comerciales o de mayor tamano no procede: se trata de un adaptador de 0,2 GB orientado a un unico rostro, no de un modelo fundacional. Frente a otros LoRA de personaje de la comunidad, su principal diferencia es el dataset minimo (27 imagenes) y el entrenamiento de bajo coste en Kaggle, lo que lo situa en la gama baja de calidad y robustez esperada.

## Limitaciones y advertencias

- Dataset muy reducido (27 imagenes) y plantilla de caption uniforme: alta probabilidad de sobreajuste, rigidez de pose y transferencia de rasgos del conjunto original (iluminacion, fondo, vestuario).
- Riesgo de alucinacion visual: el modelo puede generar rasgos faciales inconsistentes o mezclar identidades cuando el prompt se aleja de las condiciones de entrenamiento.
- Derechos de imagen: el modelo reproduce el rostro de una persona real (Akshay Kumar); la licencia Apache 2.0 del adaptador no exime del cumplimiento de las normas de publicidad, derechos de imagen y legislacion aplicable en cada jurisdiccion.
- La model card no documenta evaluaciones de sesgo, calidad ni seguridad; no hay garantias de fidelidad facial mas alla de las muestras incluidas.
- Idioma de los prompts: no se documenta soporte multilingue; los text encoders de SDXL funcionan mejor en ingles.
- Sin soporte de texto, codigo, razonamiento ni agentes: no debe evaluarse como modelo de lenguaje.
- Uso comercial: la licencia del adaptador es permisiva, pero el uso del rostro de una celebridad con fines comerciales requiere autorizacion expresa del titular de los derechos de imagen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni reportes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-hindi4-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento publico: https://huggingface.co/datasets/nekodeus/hindi-top10-v2
- Repositorio de entrenamiento kohya-ss sd-scripts: https://github.com/kohya-ss/sd-scripts
- Documentacion de diffusers para LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
