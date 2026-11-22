# Nekodeus/neko-tamil8-sdxl-v1

## Resumen

neko-tamil8-sdxl-v1 es un LoRA de personaje (character LoRA) para Stable Diffusion XL, desarrollado por el usuario Nekodeus. Se trata de un adaptador de bajo rango entrenado sobre `stabilityai/stable-diffusion-xl-base-1.0` para reproducir el rostro de la actriz india Trisha Krishnan a partir de un token de activacion especifico (`tamil8`). No es un modelo generativo independiente: requiere cargar el checkpoint base de SDXL y aplicar los pesos del LoRA encima.

El entrenamiento se realizo con 59 imagenes curadas, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of tamil8 person`). El proceso consistio en 1500 pasos a 1024 px con dimension y alpha de red 16, learning rate 1e-4, optimizador Adafactor y precision fp16, usando `kohya-ss sdxl_train_network.py` sobre GPU de Kaggle. Forma parte de un conjunto mayor denominado Tamil Top-10, con el dataset publico `nekodeus/tamil-top10-v2`.

Su relevancia es acotada: es un adaptador de nicho para generacion de retratos de un personaje concreto, con un repositorio de 0,2 GB, cero descargas y cero likes en el momento de la consulta. Resulta util como ejemplo de pipeline de entrenamiento LoRA de bajo coste y para experimentacion con personalizacion de personajes en SDXL, pero no aporta capacidades generales nuevas ni compite con modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL |
| Parametros totales | no disponible (el LoRA se aplica sobre SDXL base; no se publica el recuento del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | fp16 en entrenamiento; el LoRA se distribuye en safetensors (compatible con fp16/fp32 y con cuantizaciones del base en herramientas de terceros) |
| Idiomas soportados | no disponibles (los prompts se procesan con los text encoders de SDXL, predominantemente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`tamil8.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se inyecta exclusivamente en el UNet del modelo base SDXL, con rango (dim) y alpha de 16. El entrenamiento se ejecuto durante 1500 pasos a resolucion 1024 px con bucketing entre 256 y 2048 px, learning rate 1e-4, batch size 1, optimizador Adafactor, precision fp16, gradient checkpointing y atencion sdpa. La herramienta empleada fue `sdxl_train_network.py` de kohya-ss, en una GPU de Kaggle y de forma totalmente offline.

El dataset consta de 59 imagenes de Trisha Krishnan verificadas con OpenCV y etiquetadas con un caption uniforme y minimalista (`a photo of tamil8 person`), lo que concentra el aprendizaje en la identidad facial y delega el resto de la composicion al checkpoint base. No se documenta el numero de tokens de entrenamiento ni el uso de RLHF o DPO, algo esperable en un LoRA de difusion. La innovacion tecnica es minima: se trata de un flujo estandar de personalizacion de personajes con SDXL.

## Capacidades

- Generacion text-to-image de retratos fotorrealistas del personaje Trisha Krishnan mediante el token de activacion `tamil8`.
- Personalizacion de identidad facial sobre el checkpoint SDXL base, manteniendo el control de estilo, iluminacion y composicion a traves del prompt.
- Integracion con el ecosistema diffusers mediante `load_lora_weights`.
- Compatibilidad con ComfyUI colocando `tamil8.safetensors` en `models/loras/` y usando un nodo LoRA loader.
- Resolucion nativa de 1024 px, con soporte de bucketing en entrenamiento entre 256 y 2048 px.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-step, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de retratos de personaje para proyectos creativos: usar el token `tamil8` junto con descripciones de iluminacion y encuadre para producir retratos consistentes del personaje en 1024 px, aprovechando que el LoRA solo modifica la identidad y no el estilo global.
- Prototipado de pipelines de personalizacion: servir como referencia reproducible de un entrenamiento LoRA de bajo coste (1500 pasos, 59 imagenes, Kaggle) para equipos que quieran replicar el flujo con kohya-ss.
- Pruebas de integracion en ComfyUI: validar nodos LoRA loader y flujos de trabajo con SDXL en un adaptador pequeno (0,2 GB) antes de desplegar adaptadores mayores.
- Experimentacion academica sobre sesgos y representacion: analizar como un dataset pequeno y un caption uniforme afectan a la fidelidad y diversidad de los rostros generados.
- Generacion de material de storyboard o previsualizacion: producir variaciones de encuadre y vestuario de un mismo personaje para maquetas visuales, combinando el LoRA con prompts de escena.
- Benchmarking de adaptadores de personaje: comparar calidad y consistencia frente a otros LoRA de personaje entrenados sobre SDXL con configuraciones distintas de rango, pasos o dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el LoRA en si ocupa unos 0,2 GB; el consumo dominante es el del checkpoint SDXL base, en torno a 8-10 GB en fp16 a 1024 px, y menos con cuantizacion o con optimizaciones de memoria de diffusers.
- GPU recomendadas: NVIDIA con al menos 12-16 GB de VRAM para SDXL en fp16 sin offloading; A100 o H100 para lotes grandes y throughput alto.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (por ejemplo RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090) usando fp16 y, si es necesario, `enable_model_cpu_offload` o atencion eficiente.
- Opciones de despliegue: diffusers (pipeline `StableDiffusionXLPipeline` con `load_lora_weights`), ComfyUI, Automatic1111/Forge y otras interfaces compatibles con LoRA de SDXL.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-tamil8-sdxl-v1 | LoRA de personaje | SDXL 1.0 | no disponible | no aplica | apache-2.0 | Hugging Face (0 descargas) |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | — | no disponible en la informacion | no aplica | openrail++ (segun el modelo base) | Hugging Face |
| Otros LoRA de personaje sobre SDXL | Adaptadores de personaje | SDXL 1.0 | variable | no aplica | variable | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 59 imagenes y un caption uniforme, lo que puede limitar la diversidad de poses, expresiones y angulos del personaje.
- Riesgo de sobreajuste al conjunto de entrenamiento y de reproduccion de rasgos concretos de las imagenes originales.
- El token `tamil8` es obligatorio; sin el, el LoRA puede no activarse o producir resultados inconsistentes.
- Los prompts se procesan con los text encoders de SDXL, con sesgo hacia el ingles; el soporte multilingue no esta documentado.
- Riesgo de sesgos derivados del dataset: representacion limitada de un unico personaje y contexto demografico concreto.
- Posible generacion de imagenes no fidedignas del personaje real; conviene revisar el uso de la imagen de personas reales por cuestiones de derechos de imagen y publicidad.
- La licencia apache-2.0 del adaptador no exime de cumplir las condiciones del modelo base SDXL ni de los derechos sobre las imagenes de entrenamiento.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta; no hay evidencia publica de calidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-tamil8-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento (kohya-ss): https://github.com/kohya-ss/sd-scripts
- Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
