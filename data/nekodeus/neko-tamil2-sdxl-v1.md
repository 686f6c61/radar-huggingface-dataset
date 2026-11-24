# Nekodeus/neko-tamil2-sdxl-v1

## Resumen

`neko-tamil2-sdxl-v1` es un LoRA de personaje para Stable Diffusion XL (SDXL) desarrollado por Nekodeus. Su funcion es permitir la generacion de imagenes fotorrealistas del actor indio Kamal Haasan mediante el token de activacion `tamil2`, aplicado sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0`. El repositorio contiene unicamente los pesos del adaptador LoRA (0,2 GB), no un modelo completo, por lo que requiere cargar SDXL base para funcionar.

El adaptador se entrena sobre 30 imagenes curadas del actor, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of tamil2 person`). Forma parte del conjunto "Tamil Top-10" del mismo autor, con el dataset publico `nekodeus/tamil-top10-v2` (subcarpeta `tamil2/`). El entrenamiento se realizo en una GPU de Kaggle de forma completamente offline, con 1500 pasos a 1024 px y dimension de red 16.

Es relevante como ejemplo de LoRA de personaje de bajo coste y licencia permisiva (Apache 2.0), util para quien quiera reproducir el pipeline de entrenamiento (kohya-ss, Adafactor, fp16, sdpa) o integrar un personaje concreto en flujos de generacion de imagen con SDXL. No es un modelo de lenguaje ni un modelo multimodal de texto: es un adaptador de difusion text-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL |
| Parametros totales | no disponible (adaptador LoRA, dim/alpha 16, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | fp16 (entrenado en fp16); el LoRA se usa junto a SDXL base en fp16/fp32 segun el pipeline |
| Idiomas soportados | no disponible (los prompts se procesan via los text encoders de SDXL base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil2.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado exclusivamente al UNet de SDXL, con dimension de red y alpha de 16. Se entreno a resolucion 1024 px con bucketing entre 256 y 2048, 1500 pasos, learning rate 1e-4, optimizador Adafactor con batch 1, precision fp16, gradient checkpointing y atencion sdpa. La herramienta empleada es `sdxl_train_network.py` de kohya-ss, ejecutada en una GPU de Kaggle en modo offline.

El dataset consta de 30 imagenes de Kamal Haasan verificadas con OpenCV y etiquetadas con un caption stub uniforme (`a photo of tamil2 person`), lo que asocia el token `tamil2` a la identidad del personaje. No se documentan tecnicas adicionales como RLHF, DPO ni regularizacion con clase previa; el entrenamiento es un ajuste de bajo rango estandar sobre el UNet. El repositorio incluye imagenes de muestra del conjunto de entrenamiento en `samples/`.

## Capacidades

- Generacion text-to-image de retratos y escenas del personaje Kamal Haasan mediante el token `tamil2`.
- Control de estilo y composicion a traves del prompt (por ejemplo, iluminacion de estudio, tipo de plano) heredado de SDXL base.
- Integracion como adaptador cargable sobre SDXL base en diffusers y ComfyUI.
- Compatible con el ecosistema de LoRAs de SDXL (combinable con otros adaptadores, sujeto a pruebas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: no documentadas; la comprension del prompt depende de los text encoders de SDXL base.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de retratos del personaje para ilustracion editorial: usar el prompt `tamil2 Kamal Haasan, portrait photo, studio lighting` a 1024x1024 para obtener imagenes coherentes con la identidad entrenada.
- Prototipado de personajes en pipelines de difusion: cargar el LoRA en diffusers junto a SDXL base para validar rapidamente como responde el personaje a distintos prompts y estilos.
- Flujos de trabajo en ComfyUI: colocar `tamil2.safetensors` en `models/loras/`, anadir un nodo LoRA loader y usar el token en el prompt para composiciones multi-nodo (ControlNet, upscalers, etc.).
- Creacion de material promocional o fan art controlado: generar variaciones de vestuario y escena manteniendo el parecido facial, con revision humana previa a publicacion.
- Investigacion sobre LoRA de personaje: reproducir el pipeline (kohya-ss, Adafactor, 1500 pasos, dim 16) y comparar resultados con el dataset `nekodeus/tamil-top10-v2`.
- Base para fine-tuning adicional: partir de este adaptador para entrenar variantes de estilo o de otros personajes del conjunto Tamil Top-10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,2 GB; el consumo real lo determina SDXL base, que en fp16 requiere aproximadamente 8-10 GB de VRAM para generar a 1024x1024.
- GPU recomendadas: NVIDIA con al menos 8 GB de VRAM para SDXL en fp16 (RTX 3060 Ti/4060 Ti en adelante); A100/H100 para lotes grandes o mayor throughput.
- Cabe en GPU de consumo: si, con SDXL base en fp16 en tarjetas de 8 GB o mas; en tarjetas de 6 GB puede requerir offloading o cuantizacion del modelo base.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge y otros frontends compatibles con LoRA de SDXL.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-tamil2-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim/alpha 16 (UNet) | no aplica | Apache 2.0 | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | — | no disponible en la informacion | no aplica | CreativeML Open RAIL++-M | Hugging Face |
| Otros LoRA de personaje del conjunto Tamil Top-10 | LoRA de personaje | SDXL 1.0 | no disponible | no aplica | no disponible | Hugging Face (`nekodeus/tamil-top10-v2`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 30 imagenes y 1500 pasos: el parecido facial puede degradarse con angulos extremos, iluminacion atipica o escenas complejas.
- Riesgo de sobreajuste al caption stub (`a photo of tamil2 person`), lo que puede limitar la variedad de poses y expresiones.
- Posibles sesgos derivados del dataset curado: predominio de ciertos encuadres, edades o estilos de vestuario.
- Riesgo de alucinacion visual: el modelo puede generar rasgos faciales inconsistentes o mezclar identidades, especialmente sin el token `tamil2`.
- El token `tamil2` es obligatorio para activar el personaje; sin el, el LoRA puede no tener efecto perceptible.
- Uso comercial permitido por la licencia Apache 2.0 del adaptador, pero sujeto a las condiciones del modelo base SDXL (CreativeML Open RAIL++-M) y a los derechos de imagen del personaje real.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- Idiomas de prompt no documentados; la calidad depende de los text encoders de SDXL base.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-tamil2-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento (kohya-ss): https://github.com/kohya-ss/sd-scripts
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
