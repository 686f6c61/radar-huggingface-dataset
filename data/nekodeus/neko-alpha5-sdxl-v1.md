# Nekodeus/neko-alpha5-sdxl-v1

## Resumen

`Nekodeus/neko-alpha5-sdxl-v1` es un adaptador LoRA de tipo personaje (character LoRA) entrenado sobre `stabilityai/stable-diffusion-xl-base-1.0`, el modelo de difusion texto-a-imagen de SDXL publicado por Stability AI. Lo desarrolla el usuario Nekodeus como parte de su serie "Hollywood alpha", que incluye variantes equivalentes para SDXL y SD1.5. El adaptador permite generar representaciones del actor Tom Cruise a partir del token disparador `alpha5` en el prompt.

Se trata de un LoRA de dimension reducida (network dim/alpha 8/8) entrenado durante 1500 pasos a 1024 px sobre un dataset de aproximadamente 100 imagenes curadas y verificadas facialmente con OpenCV. El repositorio pesa 0,2 GB y el unico peso publicado es `alpha5.safetensors`, cargable tanto desde `diffusers` como desde ComfyUI. No es un modelo autonomo: requiere siempre el checkpoint base SDXL para funcionar.

Su relevancia es limitada y muy especifica: sirve como ejemplo de pipeline de entrenamiento LoRA ligero (Kaggle, GPU P100, offline, sin coste de tokens) y como recurso para quien necesite generar imagenes consistentes de un personaje concreto sobre SDXL. No aporta innovaciones arquitectonicas ni capacidades nuevas respecto al modelo base; su interes es practico y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL (UNet + doble text encoder CLIP) |
| Parametros totales | no disponible (adaptador LoRA con dim/alpha 8/8; el modelo base SDXL tiene ~2.600 M en UNet y ~817 M en text encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no procesa contexto de texto autoregresivo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el base admite fp16, fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponibles (los prompts se procesan via CLIP, predominantemente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`alpha5.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA inyectado en las capas del UNet de SDXL, con rango 8 y alpha 8. Se entreno a resolucion 1024, durante 1500 pasos, con learning rate 1e-4, optimizador AdamW de 8 bits, batch size 2 y xformers, sobre una GPU NVIDIA P100 en Kaggle, de forma completamente offline y sin coste de tokens. El dataset consta de unas 100 imagenes de Tom Cruise, filtradas con verificacion facial OpenCV y etiquetadas con un caption uniforme (`a photo of alpha5 person`), lo que concentra el aprendizaje en la identidad facial y minimiza el sesgo hacia atributos de escena o vestuario.

No se documenta el uso de RLHF, DPO ni tecnicas de preferencia, algo esperable en un LoRA de personaje. Tampoco se especifica la composicion exacta del dataset mas alla del recuento y el proceso de curado. La innovacion tecnica es nula respecto al estado del arte: se trata de un entrenamiento LoRA estandar con el token disparador `alpha5`, pensado para invocarse junto al nombre del personaje en el prompt.

## Capacidades

- Generacion texto-a-imagen de retratos y escenas del personaje Tom Cruise sobre SDXL.
- Control de identidad mediante el token disparador `alpha5` combinado con el nombre del personaje.
- Compatible con el resto de capacidades del modelo base: composicion, iluminacion, estilo fotografico o ilustrado, control por prompt negativo.
- Carga nativa en `diffusers` mediante `load_lora_weights` y en ComfyUI como nodo LoRA loader.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene modo thinking, vision de entrada ni audio.
- Capacidades multilingues no documentadas; el prompt efectivo depende del encoder CLIP de SDXL, con mejor rendimiento en ingles.

## Casos de uso

- Generacion de retratos de personaje para pruebas de concepto: cargar el LoRA sobre SDXL y generar retratos a 1024 px con iluminacion de estudio, util para validar pipelines de generacion antes de entrenar un LoRA propio.
- Prototipado de personajes consistentes en proyectos creativos: usar `alpha5` junto con descripciones de vestuario y escena para mantener una identidad facial estable en una serie de imagenes.
- Ejemplo docente de entrenamiento LoRA: el repositorio documenta hiperparametros, hardware y dataset, lo que lo convierte en una referencia reproducible para talleres sobre fine-tuning de difusion.
- Integracion en ComfyUI para flujos de trabajo de ilustracion: insertar el nodo LoRA loader y encadenar con upscalers o controlnets del ecosistema SDXL.
- Comparacion de tecnicas de curado de dataset: el uso de verificacion facial con OpenCV y captions uniformes sirve como caso de estudio para evaluar el impacto del etiquetado en LoRAs de personaje.
- Generacion de material de referencia visual: crear variaciones de un mismo personaje para storyboards o moodboards, siempre que el uso respete la licencia y la legislacion sobre imagen de personas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el LoRA en si ocupa muy poco (0,2 GB en disco); el requisito real lo marca SDXL. En fp16, SDXL necesita aproximadamente 8-10 GB de VRAM para generar a 1024 px; con optimizaciones (attention slicing, VAE tiling) puede bajar a ~6-8 GB.
- GPU recomendadas: NVIDIA A100 o H100 para lotes grandes y baja latencia; RTX 4090 o RTX 3090 para uso individual con buen rendimiento; RTX 3060 de 12 GB o superior para uso domestico.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), aplicando fp16 y optimizaciones de memoria.
- Opciones de despliegue: `diffusers` (pipeline `StableDiffusionXLPipeline` con `load_lora_weights`), ComfyUI, Automatic1111/Forge con soporte LoRA, InvokeAI; llama.cpp y Ollama no aplican (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha5-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim/alpha 8/8 | no aplica | apache-2.0 | HuggingFace |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie) | SDXL 1.0 | no disponible | no aplica | no disponible en la informacion | HuggingFace |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie) | SD 1.5 | no disponible | no aplica | no disponible en la informacion | HuggingFace |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base texto-a-imagen | — | ~3.500 M (UNet + text encoders) | no aplica | openrail++ | HuggingFace |

La comparativa directa con otros LoRAs de personaje de la comunidad no esta disponible en la informacion proporcionada; los unicos modelos comparables documentados son las otras variantes de la propia serie Hollywood alpha y el checkpoint base.

## Limitaciones y advertencias

- Dependencia total del modelo base: sin `stabilityai/stable-diffusion-xl-base-1.0` el adaptador no genera nada.
- Dataset muy pequeno (~100 imagenes) y con captions uniformes, lo que puede limitar la variedad de poses, expresiones y angulos; riesgo de sobreajuste a los encuadres del dataset.
- El token `alpha5` es obligatorio; sin el, el LoRA puede no activarse o producir resultados inconsistentes.
- Riesgo de sesgo hacia la apariencia del personaje en las imagenes de entrenamiento (edad, iluminacion, estilo).
- Generacion de la imagen de una persona real: implica riesgos legales y eticos (derecho de imagen, suplantacion, deepfakes). La licencia apache-2.0 cubre el artefacto, no el uso de la identidad de terceros.
- Idiomas no documentados; el rendimiento en prompts en castellano dependera del encoder CLIP de SDXL y probablemente sea inferior al de prompts en ingles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de fidelidad de identidad ni de calidad frente a otros LoRAs.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validacion de la comunidad.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Nekodeus/neko-alpha5-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Variante SD1.5 de la serie: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Variante SDXL de la serie: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
- Dataset de entrenamiento citado: `nekodeus/alpha5-tom-cruise` (referencia en la model card; URL no verificada en la informacion proporcionada)
- Documentacion de diffusers para LoRA: no disponible en la informacion proporcionada
- Paper de SDXL: no disponible en la informacion proporcionada
