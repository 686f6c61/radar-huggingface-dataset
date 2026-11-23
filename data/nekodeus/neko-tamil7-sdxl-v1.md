# Nekodeus/neko-tamil7-sdxl-v1

## Resumen

neko-tamil7-sdxl-v1 es un LoRA de personaje entrenado sobre Stable Diffusion XL 1.0 para generar imagenes de la actriz india Nayanthara. Lo desarrolla el usuario Nekodeus dentro de un conjunto denominado "Tamil Top-10", una coleccion de adaptadores de personajes del cine tamil. El modelo no es un generador autonomo: es un adaptador de bajo rango que se carga sobre el checkpoint base `stabilityai/stable-diffusion-xl-base-1.0` y anade un token disparador (`tamil7`) para invocar el rostro aprendido.

Tecnicamente se trata de un LoRA de dimension 16 y alpha 16 aplicado unicamente al UNet, entrenado durante 1500 pasos a 1024 px con el script `sdxl_train_network.py` de kohya-ss sobre un dataset de 64 imagenes verificadas facialmente con OpenCV. El peso se distribuye en formato `safetensors` dentro de un repositorio de 0,2 GB, con licencia Apache 2.0.

Su relevancia es acotada y practica: sirve como pieza de un pipeline de generacion text-to-image con identidad consistente para un personaje concreto, y como ejemplo reproducible de entrenamiento de LoRA de personaje en hardware consumer (Kaggle GPU). No aporta capacidades de lenguaje, razonamiento ni agentes; es exclusivamente un adaptador de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusion latente, transformer) |
| Parametros totales | no disponible (adaptador de bajo rango; repo de 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en fp16/safetensors; el base admite fp16 y cuantizaciones del ecosistema diffusers) |
| Idiomas soportados | no disponible (prompts en ingles en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`tamil7.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Resolucion de entrenamiento | 1024 px (bucketing 256-2048) |
| Dimension / alpha del LoRA | 16 / 16 (solo UNet) |
| Pasos de entrenamiento | 1500 |
| Optimizador | Adafactor, batch 1, lr 1e-4 |
| Token disparador | `tamil7` |

## Arquitectura y entrenamiento

El adaptador se inyecta en las capas del UNet del SDXL base mediante descomposicion de bajo rango (dim 16, alpha 16). El entrenamiento se realizo con kohya-ss (`sdxl_train_network.py`), en precision fp16, con gradient checkpointing y atencion sdpa, sobre GPU de Kaggle y de forma totalmente offline. La resolucion de entrenamiento fue 1024 px con bucketing entre 256 y 2048, learning rate 1e-4 y 1500 pasos con batch 1.

El dataset consta de 64 imagenes curadas de Nayanthara, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of tamil7 person`). Forma parte del conjunto "Tamil Top-10" y el dataset publico asociado es `nekodeus/tamil-top10-v2`, subcarpeta `tamil7/`. No se documenta uso de RLHF, DPO ni tecnicas de refinamiento por preferencias; es un entrenamiento supervisado clasico de LoRA de personaje. El repositorio incluye imagenes de muestra del conjunto de entrenamiento en la carpeta `samples/`.

## Capacidades

- Generacion text-to-image de retratos y escenas del personaje Nayanthara mediante el token `tamil7`.
- Transferencia de identidad facial consistente cuando se combina con el checkpoint SDXL 1.0.
- Control de estilo mediante prompt (por ejemplo, iluminacion de estudio, fotografia de retrato) segun los ejemplos de la model card.
- Compatible con el ecosistema diffusers (`load_lora_weights`) y con ComfyUI (nodo LoRA loader).
- Integrable con otros LoRA y con tecnicas de control del pipeline SDXL base (no documentado explicitamente por el autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o video.
- Capacidades multilingues: no documentadas; los ejemplos de uso estan en ingles.

## Casos de uso

- Prototipado de personajes para ficcion: cargar el LoRA sobre SDXL 1.0 y generar retratos consistentes del personaje con el token `tamil7` para bocetos de storyboard o previsualizacion de reparto.
- Pruebas de concepto de identidad en pipelines de difusion: usar el adaptador como caso de estudio reproducible de LoRA de personaje (64 imagenes, 1500 pasos) para comparar metodos de entrenamiento.
- Generacion de material grafico editorial interno: ilustraciones de retrato con iluminacion controlada por prompt para maquetas y presentaciones, siempre que se respeten derechos de imagen del personaje real.
- Experimentacion en ComfyUI: integrar `tamil7.safetensors` en `models/loras/` y combinarlo con nodos de control para explorar variaciones de estilo sobre una identidad fija.
- Docencia y formacion en difusion: ejemplo practico de entrenamiento de LoRA en GPU de Kaggle sin coste, util para talleres sobre SDXL y kohya-ss.
- Evaluacion comparativa de adaptadores: emplear el modelo dentro del conjunto Tamil Top-10 para medir consistencia facial y fidelidad al prompt entre LoRA de personaje del mismo dominio.
- Investigacion sobre sesgos y representacion: analizar como un dataset pequeno y curado afecta a la diversidad de salidas y a la fidelidad de identidad en modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el LoRA en si ocupa muy poco (repo de 0,2 GB); el coste real lo determina el SDXL base, que en fp16 requiere del orden de 8-10 GB de VRAM para inferencia a 1024 px.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia comoda del base; tarjetas de 8 GB pueden funcionar con optimizaciones y offloading.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM ejecutando SDXL 1.0 en fp16, con posible offloading en el limite inferior.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI (nodo LoRA loader); otras herramientas del ecosistema SDXL no documentadas por el autor.
- Latencia y throughput: no disponibles. Dependen del hardware y del checkpoint base, no del adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-tamil7-sdxl-v1 | LoRA de personaje | SDXL 1.0 | no disponible (dim 16) | no aplica | apache-2.0 | Hugging Face |
| Otros LoRA del conjunto Tamil Top-10 (Nekodeus) | LoRA de personaje | SDXL 1.0 | no disponible | no aplica | no disponible | Hugging Face (`nekodeus/tamil-top10-v2`) |
| SDXL 1.0 base | Modelo text-to-image completo | propio | no disponible en la informacion | no aplica | licencia de Stability AI | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de personaje real: genera imagenes de una persona identificable; su uso comercial o publicacion puede vulnerar derechos de imagen y requiere consentimiento.
- Dataset muy pequeno (64 imagenes) y captions uniformes, lo que limita la variedad de poses, expresiones y contextos y puede provocar sobreajuste al conjunto de entrenamiento.
- Riesgo de artefactos faciales y de deriva de identidad fuera de las condiciones de entrenamiento (resolucion, iluminacion, encuadre).
- Dependencia estricta del checkpoint base SDXL 1.0; no funciona de forma autonoma ni con otras arquitecturas.
- Sin informacion sobre sesgos demograficos o de representacion; al tratarse de un unico personaje, la diversidad de salidas es intrinsecamente limitada.
- No hay datos de benchmarks, evaluaciones objetivas ni metricas de fidelidad publicadas.
- Licencia Apache 2.0 declarada por el autor, pero el uso del rostro de una persona real anade restricciones externas a la licencia del software.
- Sin soporte documentado de idiomas distintos del ingles en los prompts.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-tamil7-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento (kohya-ss): https://github.com/kohya-ss/sd-scripts
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
