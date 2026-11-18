# Nekodeus/neko-alpha2-sdxl-v1

## Resumen

`Nekodeus/neko-alpha2-sdxl-v1` es un LoRA (Low-Rank Adaptation) de personaje para Stable Diffusion XL, entrenado por el usuario Nekodeus sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0`. No es un modelo generativo completo, sino un adaptador de bajo rango que se carga junto al checkpoint SDXL para reproducir el rostro de Henry Cavill mediante el token de activación `alpha2`. El repositorio ocupa 0,2 GB y contiene el fichero de pesos `alpha2.safetensors` junto con muestras del conjunto de entrenamiento.

El adaptador se entrenó a 1024 px durante 1500 pasos con dimensión de red y alpha de 8 (algunos conjuntos a 16), learning rate 1e-4, optimizador Adafactor con batch 2 y atención sdpa, sobre una NVIDIA P100 de Kaggle en modo completamente offline. El dataset consta de aproximadamente 100 imágenes de Henry Cavill verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of alpha2 person`), publicado como `nekodeus/alpha2-henry-cavill`.

Su relevancia es acotada: se trata de un adaptador de personaje de nicho, con 32 descargas y 0 likes en el momento de la ficha, pensado para integrarse en flujos de generación de retratos con SDXL (diffusers o ComfyUI). No aporta capacidades nuevas al modelo base más allá de la identidad visual del sujeto entrenado, y su licencia Apache 2.0 no exime de las consideraciones legales sobre el uso de la imagen de una persona real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL (UNet + doble text encoder) |
| Parametros totales | no disponible (el repo ocupa 0,2 GB; el LoRA en sí es de rango bajo, dim/alpha 8 u 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el modelo base SDXL admite fp16/fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (los prompts de difusión dependen del text encoder CLIP de SDXL, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`alpha2.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre Stable Diffusion XL, un modelo de difusión latente con arquitectura UNet y doble text encoder (CLIP ViT-L y OpenCLIP ViT-bigG). El entrenamiento se realizó a resolución 1024 px durante 1500 pasos, con dimensión de red y alpha de 8 (algunos conjuntos a 16/16), learning rate 1e-4, optimizador Adafactor con batch 2 y atención sdpa, sobre una NVIDIA P100 de Kaggle en modo offline y sin tokens de autenticación.

El dataset de entrenamiento consta de unas 100 imágenes curadas de Henry Cavill, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of alpha2 person`). No se documenta uso de RLHF, DPO ni técnicas de preferencia; es un ajuste supervisado clásico de LoRA de personaje. La innovación técnica es mínima: se limita al uso del token de activación `alpha2` para condicionar la identidad del sujeto en la generación.

## Capacidades

- Generación de imágenes text-to-image de retratos y escenas con la identidad visual de Henry Cavill, condicionada por el token `alpha2`.
- Integración como adaptador LoRA sobre SDXL en pipelines de diffusers (`load_lora_weights`) y en ComfyUI (nodo LoRA loader).
- Control de composición, iluminación y estilo mediante el prompt de texto, heredado de las capacidades del modelo base SDXL.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión, audio ni capacidades multimodales más allá de la generación de imagen.
- Capacidades multilingües: no disponibles; el text encoder de SDXL está entrenado predominantemente en inglés.

## Casos de uso

- Retratos de personaje para proyectos creativos: usar el prompt `alpha2 Henry Cavill, portrait photo, studio lighting` con SDXL a 1024 px para generar retratos consistentes del sujeto en ilustración, cómic o storyboard.
- Pruebas de concepto de casting visual: generar variaciones de vestuario, iluminación y encuadre sobre una identidad fija para previsualizar dirección de arte antes de una producción.
- Integración en ComfyUI para flujos de trabajo por nodos: colocar `alpha2.safetensors` en `models/loras/`, añadir un LoRA loader y encadenar con otros nodos de upscaling o controlnet.
- Experimentación con pipelines de diffusers: cargar el LoRA con `pipe.load_lora_weights("Nekodeus/neko-alpha2-sdxl-v1", weight_name="alpha2.safetensors")` para prototipar generación condicionada por identidad en Python.
- Investigación sobre LoRA de personaje: comparar el efecto de dim/alpha 8 frente a 16 y de 1500 pasos sobre la fidelidad facial, usando el dataset público `nekodeus/alpha2-henry-cavill` como referencia.
- Docencia y demos de fine-tuning eficiente: ilustrar cómo un adaptador de bajo rango sobre SDXL puede especializarse en un sujeto con ~100 imágenes y hardware de gama media (P100 de Kaggle).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en sí ocupa 0,2 GB, pero requiere cargar el modelo base SDXL completo para inferencia.
- VRAM estimada para SDXL en fp16: en torno a 8-10 GB para 1024 px; con optimizaciones (attention slicing, VAE tiling) puede reducirse por debajo de 8 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090, RTX 4080; también funciona en GPUs consumer de 8-12 GB con fp16 y optimizaciones.
- Cabe en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070, con posible necesidad de atención eficiente o resolución reducida.
- Opciones de despliegue: diffusers (Python), ComfyUI, Automatic1111/Forge y otros frontends que soporten LoRA sobre SDXL.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU y de los pasos de muestreo configurados.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha2-sdxl-v1 | LoRA de personaje | SDXL 1.0 | no disponible (repo 0,2 GB) | no aplica | Apache 2.0 | Hugging Face, 32 descargas |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie) | SDXL 1.0 | no disponible | no aplica | no disponible | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie) | SD 1.5 | no disponible | no aplica | no disponible | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | — | no disponible | no aplica | CreativeML Open RAIL++-M | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre ~100 imágenes de una persona concreta, puede reproducir sesgos de iluminación, encuadre y apariencia presentes en el dataset; no se documenta análisis de sesgo.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes o artefactos, especialmente fuera del dominio de retrato y con prompts alejados del caption de entrenamiento.
- Limitaciones de contexto o idioma: los prompts funcionan mejor en inglés por el text encoder de SDXL; el token `alpha2` es obligatorio para activar la identidad.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el modelo base SDXL tiene su propia licencia (CreativeML Open RAIL++-M) con restricciones de uso; además, el uso comercial de la imagen de una persona real requiere consentimiento y puede estar sujeto a derechos de imagen y publicidad.
- Caveats para producción: con 32 descargas y 0 likes, es un modelo de nicho sin validación comunitaria; conviene evaluar la fidelidad y la estabilidad antes de integrarlo en flujos productivos, y revisar los términos del dataset público asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-alpha2-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/alpha2-henry-cavill
- Serie Hollywood alpha (SD1.5): https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Serie Hollywood alpha (SDXL): https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
