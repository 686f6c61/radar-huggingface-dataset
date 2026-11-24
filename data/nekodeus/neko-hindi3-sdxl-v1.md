# Nekodeus/neko-hindi3-sdxl-v1

## Resumen

neko-hindi3-sdxl-v1 es un LoRA de personaje entrenado sobre Stable Diffusion XL (SDXL) base 1.0 que reproduce el rostro del actor indio Aamir Khan. Lo publica el usuario Nekodeus como parte de su conjunto "Hindi Top-10", una serie de adaptadores de personajes de la industria de Bollywood. No es un modelo generativo autonomo: es un adaptador de bajo rango (dim/alpha 16) que se carga sobre el UNet de SDXL y se activa mediante el token disparador `hindi3`.

El entrenamiento se realizo con 38 imagenes curadas del actor, verificadas facialmente con OpenCV y etiquetadas con una caption uniforme (`a photo of hindi3 person`). Se usaron 1500 pasos a 1024 px con buckets de 256 a 2048, optimizador Adafactor, learning rate 1e-4, precision fp16 y atencion sdpa, mediante el script `sdxl_train_network.py` de kohya-ss sobre una GPU de Kaggle.

Su relevancia es acotada: es un adaptador de nicho para generacion text-to-image de retratos de un personaje concreto, con licencia Apache 2.0 y un peso de repositorio de 0,2 GB. Resulta util para quien necesite consistencia facial de Aamir Khan en flujos SDXL, pero no aporta capacidades de lenguaje, razonamiento ni tool calling, y no dispone de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL |
| Parametros totales | no disponible (el LoRA usa dim/alpha 16; el modelo base SDXL tiene 2,6 B en UNet y 817 M en text encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | fp16 (entrenado en fp16); el LoRA se distribuye en safetensors; el modelo base admite fp16/fp32 |
| Idiomas soportados | no disponible (los prompts de SDXL funcionan mejor en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`hindi3.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado exclusivamente al UNet de SDXL, con dimension de red y alpha de 16. Se entreno a 1024 px de resolucion con bucketing entre 256 y 2048, 1500 pasos, batch 1, learning rate 1e-4, optimizador Adafactor, precision fp16, gradient checkpointing y atencion sdpa. El pipeline de entrenamiento es el `sdxl_train_network.py` de kohya-ss, ejecutado en una GPU de Kaggle de forma totalmente offline.

El dataset consta de 38 imagenes de Aamir Khan verificadas con OpenCV para asegurar la presencia del rostro, con captions uniformes del tipo `a photo of hindi3 person`. El token `hindi3` actua como disparador del concepto de personaje. No se documenta uso de RLHF, DPO ni tecnicas de preferencia; es un ajuste supervisado clasico de LoRA sobre difusion.

## Capacidades

- Generacion text-to-image de retratos y escenas con el rostro de Aamir Khan al incluir el token `hindi3`.
- Control de estilo y composicion mediante prompts de texto sobre SDXL base (iluminacion, encuadre, vestuario).
- Integracion en pipelines de difusion via `diffusers` (`load_lora_weights`) y ComfyUI (nodo LoRA loader).
- Compatibilidad con el ecosistema SDXL: puede combinarse con otros LoRA y con control nets del modelo base.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues propias ni modo thinking, vision o audio.

## Casos de uso

- Generacion de retratos de personaje para ilustracion editorial: usar `hindi3 Aamir Khan, portrait photo, studio lighting` para obtener retratos consistentes del actor en articulos o ficcion.
- Prototipado de storyboards: mantener la identidad facial del personaje a lo largo de varias escenas cambiando solo el prompt de entorno y encuadre.
- Creacion de fan art y contenido derivado: el LoRA permite reproducir el rostro con variaciones de estilo (cine, comic, acuarela) sin reentrenar.
- Pruebas de pipelines de difusion: sirve como caso de prueba de carga de LoRA en `diffusers` y ComfyUI dentro de flujos de CI para validar integraciones.
- Composicion con otros adaptadores: combinarlo con LoRA de estilo o de iluminacion sobre SDXL para explorar variaciones creativas.
- Demostraciones educativas de fine-tuning: el repositorio documenta hiperparametros y dataset, util como ejemplo reproducible de entrenamiento de LoRA de personaje en GPU de Kaggle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA pesa 0,2 GB; la VRAM la determina el modelo base SDXL, no el adaptador.
- SDXL en fp16 requiere aproximadamente 8-10 GB de VRAM para inferencia a 1024 px; con optimizaciones (attention slicing, VAE tiling) puede bajar a 6-8 GB.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para maxima velocidad; RTX 3090, 4080 y 4070 Ti son suficientes en fp16.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y superiores; en 8 GB conviene fp16 con optimizaciones.
- Opciones de despliegue: `diffusers` (Python), ComfyUI, Automatic1111/Forge y otros frontends que acepten LoRA SDXL en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neko-hindi3-sdxl-v1 | LoRA de personaje sobre SDXL | dim/alpha 16 (adaptador) | no aplica | Apache 2.0 | Hugging Face |
| SDXL base 1.0 | Modelo de difusion text-to-image | 2,6 B (UNet) + 817 M (text encoders) | no aplica | CreativeML Open RAIL++-M | Hugging Face |
| LoRA de personaje genericos (p. ej. adaptadores de celebridad sobre SDXL) | LoRA de personaje | variable (dim 8-128) | no aplica | variable segun autor | Hugging Face / Civitai |
| SD 1.5 + LoRA de personaje | Modelo de difusion + adaptador | 860 M (UNet) | no aplica | CreativeML Open RAIL-M | Hugging Face |

No se dispone de datos de rendimiento comparativo para este adaptador concreto.

## Limitaciones y advertencias

- Dataset muy pequeno (38 imagenes) y captions uniformes: el LoRA puede sobreajustar al conjunto y generalizar mal a poses, angulos o iluminaciones no vistas.
- Riesgo de sesgo: el rostro entrenado corresponde a un unico individuo; el adaptador no representa diversidad y puede reforzar estereotipos si se usa con prompts inadecuados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar rasgos faciales inconsistentes o artefactos, especialmente fuera de la resolucion de entrenamiento.
- Dependencia del modelo base SDXL: requiere cargar `stabilityai/stable-diffusion-xl-base-1.0`; la calidad final depende de este.
- Idiomas: los prompts deben formularse preferiblemente en ingles; no hay soporte multilingue documentado.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial del modelo base SDXL esta sujeto a su propia licencia (CreativeML Open RAIL++-M), que impone restricciones de uso.
- Uso de la imagen de una persona real: la generacion de retratos de una celebridad plantea consideraciones de derechos de imagen y consentimiento que el usuario debe evaluar antes de un uso comercial.
- Sin benchmarks ni evaluacion cuantitativa publicada; no hay garantia de calidad medible en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-hindi3-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/hindi-top10-v2
- Script de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
