# Nekodeus/neko-hindi1-sdxl-v1

## Resumen

`Nekodeus/neko-hindi1-sdxl-v1` es un LoRA de personaje para Stable Diffusion XL, entrenado por el usuario Nekodeus, que permite generar imagenes fotorrealistas del actor indio Shah Rukh Khan a partir de texto. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (rank 16) que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0` y se activa mediante el token disparador `hindi1`. Resuelve el problema clasico de la personalizacion en difusion: fijar la identidad de un sujeto concreto sin reentrenar el modelo base, manteniendo el resto de capacidades del SDXL intactas.

El adaptador se entrena con 52 imagenes curadas del actor, verificadas facialmente con OpenCV y etiquetadas con una caption uniforme (`a photo of hindi1 person`). Forma parte del conjunto "Hindi Top-10" del autor, y el dataset publico asociado es `nekodeus/hindi-top10-v2` (subcarpeta `hindi1/`). El entrenamiento se hizo en una GPU de Kaggle, de forma completamente offline y sin tokens de API, con 1500 pasos a 1024 px.

Es relevante para desarrolladores que necesiten integrar la generacion de retratos de una celebridad concreta en pipelines de difusion, o como ejemplo reproducible de un flujo LoRA de personaje con SDXL (kohya-ss, diffusers, ComfyUI). El repositorio ocupa 0,2 GB y la licencia declarada es Apache-2.0, lo que facilita su uso comercial, aunque con las cautelas legales sobre el derecho de imagen del sujeto retratado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL (difusion latente) |
| Parametros totales | no disponible (repo de 0,2 GB; LoRA con dim/alpha 16 en UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; prompt de texto sin limite declarado) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite fp16/fp32) |
| Idiomas soportados | no disponibles (los prompts se procesan con el text encoder del SDXL base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`hindi1.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Resolucion de entrenamiento | 1024 px (bucketing 256-2048) |
| Rank / alpha | 16 / 16 (solo UNet) |
| Pasos de entrenamiento | 1500 |
| Learning rate | 1e-4 |
| Optimizador | Adafactor, batch 1, fp16, gradient checkpointing, sdpa |
| Herramienta de entrenamiento | kohya-ss `sdxl_train_network.py` |
| Token disparador | `hindi1` |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un LoRA de personaje aplicado exclusivamente a las capas del UNet de Stable Diffusion XL. SDXL es una arquitectura de difusion latente con un UNet de gran tamano y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG), que genera imagenes a 1024 px. El adaptador inserta matrices de bajo rango con dimension 16 y alpha 16 en el UNet, sin tocar los text encoders ni el VAE. Esto mantiene el coste de almacenamiento muy bajo (0,2 GB) y permite combinarlo con otros LoRA o con el modelo base sin reentrenar.

El entrenamiento se realizo con 52 imagenes de Shah Rukh Khan, verificadas facialmente con OpenCV para asegurar que el rostro aparece correctamente, y etiquetadas con una caption uniforme y simple (`a photo of hindi1 person`). Se usaron 1500 pasos a 1024 px con bucketing de resolucion entre 256 y 2048, learning rate 1e-4, optimizador Adafactor con batch 1, precision fp16, gradient checkpointing y atencion sdpa. Todo el proceso se ejecuto en una GPU de Kaggle, de forma offline y sin dependencia de APIs externas. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a un modelo de difusion.

## Capacidades

- Generacion text-to-image de retratos fotorrealistas del sujeto entrenado (Shah Rukh Khan) a 1024 px.
- Activacion mediante el token disparador `hindi1`, que debe incluirse en el prompt para invocar la identidad aprendida.
- Integracion con el pipeline `StableDiffusionXLPipeline` de diffusers mediante `load_lora_weights`.
- Compatibilidad con ComfyUI colocando `hindi1.safetensors` en `models/loras/` y usando un nodo LoRA loader.
- Control de estilo y composicion a traves del prompt (iluminacion, encuadre, vestuario), ya que el LoRA solo fija la identidad.
- Combinable con otros LoRA y con el modelo base SDXL para modificar estilo o escena.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de audio o vision mas alla de la generacion de imagen.
- Capacidades multilingues: no documentadas; el prompt se procesa con los text encoders del SDXL base.

## Casos de uso

- Generacion de retratos de celebridad para medios: producir imagenes editoriales o ilustrativas de Shah Rukh Khan con control de iluminacion y encuadre mediante prompts, usando el token `hindi1` y el pipeline de diffusers.
- Creacion de material promocional tematico: campanas o piezas graficas con la figura del actor para eventos, homenajes o contenido fan, siempre que se cuente con los derechos de imagen correspondientes.
- Prototipado rapido de personajes en estudios de diseno: usar el LoRA como referencia de identidad en flujos de ComfyUI para explorar variaciones de vestuario y escena antes de una produccion final.
- Investigacion en personalizacion de difusion: servir como caso reproducible de entrenamiento LoRA de personaje con kohya-ss, con dataset publico (`nekodeus/hindi-top10-v2`) y parametros documentados.
- Generacion de avatares y retratos para aplicaciones creativas: integrar el adaptador en un backend con diffusers para producir imagenes bajo demanda a 1024 px.
- Pruebas de pipelines de imagen en CI: validar la carga de LoRA, el token disparador y la resolucion en entornos de integracion antes de desplegar un sistema de generacion mas amplio.
- Benchmarking de adaptadores de personaje: comparar la fidelidad de identidad y la flexibilidad de estilo frente a otros LoRA de celebridad entrenados sobre SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste minimo sobre SDXL base; en fp16 el pipeline completo requiere aproximadamente 8-10 GB de VRAM a 1024 px (estimacion estandar para SDXL, no confirmada en la model card).
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para mayor throughput; RTX 3090 y RTX 4080 tambien son adecuadas en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16, y potencialmente en menos con cuantizacion del base (no documentada para este adaptador).
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI con nodo LoRA loader; el base SDXL es compatible con otros runners de difusion, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-hindi1-sdxl-v1 | LoRA de personaje | SDXL 1.0 | rank 16 en UNet, repo 0,2 GB | no aplica | Apache-2.0 | Hugging Face, 0 descargas |
| LoRA de personaje SDXL generico (p. ej. entrenado con kohya-ss) | LoRA de personaje | SDXL 1.0 | rank variable (8-32) | no aplica | variable segun autor | Hugging Face / Civitai |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo fundacional text-to-image | propio | no disponible en la informacion | no aplica | CreativeML Open RAIL++-M | Hugging Face |
| Modelos de personalizacion por sujeto (p. ej. DreamBooth) | Fine-tuning completo o parcial | SDXL u otros | mayor que un LoRA | no aplica | variable | Repositorios de investigacion |

La comparativa se limita a categorias; no se dispone de datos de rendimiento cuantitativos de este adaptador frente a alternativas.

## Limitaciones y advertencias

- El LoRA esta entrenado con solo 52 imagenes y 1500 pasos; la fidelidad de identidad puede degradarse en angulos, expresiones o iluminaciones poco representadas en el dataset.
- Las captions son uniformes (`a photo of hindi1 person`), lo que limita el control semantico fino sobre atributos y puede provocar que el token `hindi1` impregne rasgos no deseados.
- Riesgo de sobreajuste al estilo del dataset: sesgos de iluminacion, encuadre o vestuario presentes en las 52 imagenes.
- No se documentan sesgos demograficos ni evaluaciones de equidad.
- El uso comercial esta permitido por la licencia Apache-2.0 del adaptador, pero la generacion de imagenes de una persona real requiere derechos de imagen y puede estar sujeta a legislacion de publicidad, privacidad o difamacion; la licencia no cubre esos derechos.
- El modelo base SDXL tiene su propia licencia (CreativeML Open RAIL++-M) con restricciones de uso; deben respetarse ambas.
- No hay datos de benchmarks, latencia ni throughput; no debe asumirse un rendimiento concreto en produccion sin medirlo.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion comunitaria de calidad.
- No soporta tareas de lenguaje, razonamiento, codigo ni agentes; es exclusivamente un adaptador de generacion de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-hindi1-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/hindi-top10-v2
- Herramienta de entrenamiento (kohya-ss): https://github.com/kohya-ss/sd-scripts
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
