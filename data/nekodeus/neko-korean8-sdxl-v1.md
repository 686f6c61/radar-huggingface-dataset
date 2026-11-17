# Nekodeus/neko-korean8-sdxl-v1

## Resumen

neko-korean8-sdxl-v1 es un LoRA de personaje para Stable Diffusion XL (SDXL) desarrollado por Nekodeus, orientado a la generacion de imagenes fotorrealistas del rostro de Bae Suzy, actriz y cantante surcoreana. No es un modelo generativo completo, sino un adaptador de bajo rango que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0` y modifica unicamente las capas del UNet para inyectar la identidad visual del sujeto mediante el token disparador `korean8`.

El adaptador se entrena con 93 imagenes curadas y verificadas facialmente con OpenCV, con un rango de red de 16 y alpha 16, 1500 pasos a 1024 px y optimizador Adafactor sobre GPUs de Kaggle. Forma parte del conjunto "Korean Top-10", una coleccion de LoRAs de personajes surcoreanos publicada por el mismo autor, cuyo dataset de entrenamiento esta disponible en `nekodeus/korean-top10-v2`.

Su relevancia practica es acotada: sirve como ejemplo reproducible de entrenamiento de LoRAs de identidad con kohya-ss sobre SDXL, con licencia Apache 2.0 y un peso de apenas 0,2 GB, lo que permite integrarlo en pipelines de diffusers o ComfyUI sin infraestructura adicional. No obstante, su adopcion es practicamente nula (0 descargas, 0 likes en el momento de la consulta) y carece de benchmarks o evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de SDXL; red de dimension 16 / alpha 16, solo UNet |
| Parametros totales | no disponible (peso del adaptador ~0,2 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el prompt se tokeniza con el text encoder de SDXL, limite de 77 tokens por bloque) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors fp16; la cuantizacion depende del pipeline base) |
| Idiomas soportados | no disponible (los prompts se procesan con los text encoders CLIP de SDXL, predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean8.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Resolucion de entrenamiento | 1024 px (bucketing 256-2048) |
| Pasos de entrenamiento | 1500 |
| Optimizador | Adafactor, batch 1, lr 1e-4 |
| Herramienta de entrenamiento | kohya-ss `sdxl_train_network.py` |
| Precision | fp16, gradient checkpointing, sdpa |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado exclusivamente al UNet de SDXL, con rango (dim) 16 y alpha 16. SDXL es un modelo de difusion latente con un UNet de aproximadamente 2.600 millones de parametros y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG). El LoRA no altera los text encoders ni el VAE: solo inyecta matrices de bajo rango en las capas del UNet, de modo que el coste de almacenamiento es minimo y la inferencia se ejecuta sobre el pipeline base sin cambios estructurales.

El entrenamiento se realizo con `sdxl_train_network.py` de kohya-ss, en fp16 con gradient checkpointing y atencion sdpa, durante 1500 pasos, batch 1 y learning rate 1e-4 con Adafactor. El dataset consta de 93 imagenes de Bae Suzy verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of korean8 person`). No se documenta uso de RLHF, DPO ni tecnicas de preferencia, algo esperable en un LoRA de difusion. Tampoco se especifica la composicion exacta del dataset ni si hubo aumento de datos o filtrado de calidad mas alla de la verificacion facial.

## Capacidades

- Generacion text-to-image de retratos y escenas con la identidad de Bae Suzy, condicionada por el token `korean8`.
- Compatible con el pipeline `StableDiffusionXLPipeline` de diffusers mediante `load_lora_weights`.
- Compatible con ComfyUI (nodo LoRA loader) y, por extension, con otros frontends que acepten LoRAs de SDXL en safetensors.
- Aplicable a estilos variados (fotografia de estudio, retrato, escenas) siempre que el prompt incluya el token disparador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de imagen, no de lenguaje.
- No dispone de modo thinking, vision, audio ni capacidades multimodales mas alla de la generacion de imagen.
- Capacidades multilingues no documentadas; los prompts efectivos se formulan en ingles por la naturaleza de los text encoders de SDXL.

## Casos de uso

- Prototipado de personajes para ilustracion: generar variaciones de retrato de Bae Suzy con distintos estilos y encuadres usando el token `korean8` y el pipeline de diffusers, util para pruebas de concepto de arte digital.
- Integracion en ComfyUI para flujos de trabajo de diseno grafico: cargar el LoRA en `models/loras/` y combinarlo con otros nodos de control (ControlNet, IP-Adapter) para composiciones controladas.
- Generacion de material de referencia para estudios de identidad facial: producir un banco de imagenes sinteticas del rostro para tareas de investigacion en reconocimiento facial, con las cautelas eticas correspondientes.
- Educacion y divulgacion tecnica: usar el repositorio como ejemplo reproducible de entrenamiento de LoRAs de identidad sobre SDXL con kohya-ss, dado que se publican los hiperparametros y el dataset.
- Experimentacion con bucketing y resoluciones variables: el entrenamiento con buckets de 256 a 2048 permite probar el adaptador en formatos verticales, cuadrados y panoramicos.
- Pruebas de pipelines de difusion en entornos con recursos limitados: al pesar 0,2 GB, se puede cargar y descargar rapidamente en notebooks y entornos de CI para validar integraciones de diffusers.
- Comparacion de tecnicas de regularizacion de identidad: servir de base para estudiar como afecta el rango 16/16 y 1500 pasos a la fidelidad del rostro frente a otros LoRAs del mismo conjunto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FID, CLIP score, similitud facial) ni comparaciones cuantitativas con otros LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el pipeline SDXL base en fp16 requiere aproximadamente 8-10 GB de VRAM; el LoRA anade un coste marginal (menos de 0,5 GB) al cargarse sobre el UNet.
- GPU recomendadas: NVIDIA A100, H100 o L40S para produccion; RTX 4090 (24 GB) para desarrollo e inferencia comoda a 1024 px.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) sin problemas; en RTX 3060/4060 Ti (8-16 GB) es viable con `enable_model_cpu_offload` o `enable_sequential_cpu_offload` de diffusers, a costa de mayor latencia.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge con soporte SDXL, y servidores de inferencia basados en diffusers. No se documenta soporte nativo en llama.cpp/Ollama (no aplica a difusion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de los pasos de muestreo configurados en el pipeline.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros / tamano | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-korean8-sdxl-v1 | LoRA de personaje | SDXL 1.0 | ~0,2 GB (dim 16) | 1024 px (buckets 256-2048) | Apache 2.0 | Hugging Face, 0 descargas |
| Otros LoRAs del conjunto Korean Top-10 (Nekodeus) | LoRA de personaje | SDXL 1.0 | no disponible | no disponible | no disponible | Hugging Face |
| LoRAs de personaje SDXL de la comunidad (p. ej. Civitai) | LoRA de personaje | SDXL 1.0 | variable (tipicamente 50-200 MB) | 1024 px | variable (muchos restrictivas) | Civitai, Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base completo | — | ~6.900 M parametros (UNet + text encoders + VAE) | 1024 px | CreativeML Open RAIL++-M | Hugging Face |

La comparativa directa con otros LoRAs concretos no esta disponible en la informacion proporcionada; la tabla recoge solo alternativas categoricamente equivalentes.

## Limitaciones y advertencias

- Fidelidad de identidad limitada: con solo 93 imagenes, 1500 pasos y un caption uniforme, el LoRA puede reproducir rasgos de forma inconsistente en angulos poco representados o con iluminacion atipica.
- Riesgo de sobreajuste al dataset: el uso de un unico caption (`a photo of korean8 person`) reduce la capacidad de control fino sobre pose, expresion y vestuario; el token tiende a arrastrar el estilo de las imagenes de entrenamiento.
- Sesgo de dataset: las 93 imagenes provienen de una seleccion curada de una figura publica concreta, lo que introduce sesgos de edad, etnia, iluminacion y encuadre propios de la fuente.
- Alucinacion visual: como todo modelo de difusion, puede generar rasgos faciales plausibles pero incorrectos, manos deformes o artefactos en texto y geometria.
- Limitaciones de idioma: los text encoders de SDXL estan entrenados predominantemente en ingles; prompts en castellano pueden degradar la adherencia.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base SDXL 1.0 usa CreativeML Open RAIL++-M, cuyas restricciones de uso se heredan al desplegar el pipeline combinado; conviene revisar ambas.
- Uso comercial de la identidad: generar imagenes de una persona real (Bae Suzy) plantea riesgos de derechos de imagen y publicidad, independientemente de la licencia del peso; no se recomienda su uso comercial sin autorizacion.
- Madurez y adopcion: 0 descargas y 0 likes, sin evaluaciones de terceros ni benchmarks; no es un adaptador validado para produccion.
- Fecha de creacion anomala (2026-11-17) en los metadatos del repositorio, lo que sugiere posible manipulacion o error de registro; conviene verificar la procedencia antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nekodeus/neko-korean8-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Herramienta de entrenamiento (kohya-ss sd-scripts): https://github.com/kohya-ss/sd-scripts
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
