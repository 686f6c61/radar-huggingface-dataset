# Nekodeus/neko-tamil10-sdxl-v1

## Resumen

neko-tamil10-sdxl-v1 es un LoRA de personaje (character LoRA) para Stable Diffusion XL, desarrollado por el usuario Nekodeus. Se trata de un adaptador de bajo rango entrenado sobre `stabilityai/stable-diffusion-xl-base-1.0` que permite generar representaciones del personaje identificado con el token de activación `tamil10`, correspondiente a la actriz Tamannaah. El repositorio contiene únicamente los pesos del adaptador LoRA (0,2 GB), no un modelo de difusión completo.

El modelo forma parte del conjunto "Tamil Top-10", una serie de LoRAs de personajes del cine tamil. El entrenamiento se realizó sobre 59 imágenes curadas y verificadas facialmente con OpenCV, con un pipeline de kohya-ss sobre GPU de Kaggle, en modo totalmente offline. La relevancia es acotada: es un adaptador de nicho para generación de retratos fotorrealistas de un personaje concreto, no un modelo de propósito general.

Al ser un LoRA sobre SDXL, hereda la arquitectura, la resolución nativa de 1024 px y las capacidades del modelo base, y su licencia declarada es Apache 2.0, lo que facilita su uso e integración en pipelines de `diffusers` y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL base 1.0 (UNet) |
| Parametros totales | no disponible (adaptador LoRA; dim de red 16, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors fp16) |
| Idiomas soportados | no disponible (prompts en ingles segun los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil10.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado exclusivamente al UNet de SDXL, con dimensión de red y alpha de 16. Se entrenó a resolución 1024 px con bucketing entre 256 y 2048, durante 1500 pasos, con learning rate 1e-4, optimizador Adafactor, batch size 1, precisión fp16, gradient checkpointing y atención sdpa. La herramienta empleada fue `sdxl_train_network.py` de kohya-ss, ejecutada en una GPU de Kaggle de forma offline.

El dataset consta de 59 imágenes de Tamannaah, verificadas con OpenCV para asegurar la presencia del rostro y etiquetadas con un caption uniforme (`a photo of tamil10 person`). El dataset público asociado es `nekodeus/tamil-top10-v2`, en la subcarpeta `tamil10/`. No se documenta el uso de RLHF, DPO ni técnicas de preferencia, algo esperable en un LoRA de personaje. La innovación técnica es mínima: se trata de un fine-tuning estándar de adaptador de bajo rango sobre un modelo base ya existente.

## Capacidades

- Generación de imágenes text-to-image de retratos y escenas del personaje `tamil10` sobre SDXL a 1024 px.
- Control mediante el token de activación `tamil10`, que debe incluirse en el prompt.
- Estilización del personaje mediante prompts descriptivos (iluminación, encuadre, vestuario), heredando la capacidad del modelo base.
- Integración con `diffusers` (carga mediante `load_lora_weights`) y con ComfyUI (nodo LoRA loader).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No dispone de modo thinking, visión, audio ni capacidades multimodales de entrada más allá del prompt textual.

## Casos de uso

- Generación de retratos de personaje: usar el token `tamil10` junto con descripciones de iluminación y encuadre para producir retratos a 1024 px del personaje, aprovechando el entrenamiento específico sobre su rostro.
- Prototipado de arte conceptual: incorporar el LoRA en un pipeline de `diffusers` para explorar variaciones de vestuario y escena del personaje antes de producir arte final.
- Ilustración para proyectos creativos personales: generar imágenes del personaje para fan art, storyboards o material de presentación, beneficiándose de la licencia Apache 2.0.
- Flujos de trabajo en ComfyUI: insertar el LoRA en grafos nodales existentes de SDXL para combinarlo con otros adaptadores y estilos, gracias a su formato safetensors estándar.
- Experimentación con mezcla de LoRAs: combinar este adaptador con LoRAs de estilo sobre el mismo modelo base para obtener variaciones estilísticas del personaje.
- Investigación sobre fine-tuning de personajes: usar el dataset y la configuración documentados (59 imágenes, 1500 pasos, dim 16) como referencia reproducible para estudiar el efecto de hiperparámetros en LoRAs de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base SDXL completo (aproximadamente 6,9 GB en fp16) para la inferencia.
- VRAM estimada: en torno a 8 GB para SDXL en fp16 a 1024 px; puede reducirse con optimizaciones del pipeline (attention slicing, VAE tiling) o con cuantización del modelo base.
- GPU recomendadas: NVIDIA RTX 3090/4090, A100 o H100 para mayor throughput; tarjetas consumer con 8-12 GB pueden ejecutar SDXL con ajustes.
- Cabe en GPU consumer: sí, en modelos con al menos 8 GB de VRAM en fp16, y en configuraciones menores con optimizaciones.
- Opciones de despliegue: `diffusers` (StableDiffusionXLPipeline + `load_lora_weights`) y ComfyUI; el modelo base puede servirse también con herramientas compatibles con SDXL.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| neko-tamil10-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim 16, solo UNet | no aplica | Apache 2.0 | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | — | no disponible en esta ficha | no aplica | CreativeML Open RAIL++-M | Hugging Face |
| Otros LoRAs del set Tamil Top-10 (Nekodeus) | LoRA de personaje | SDXL 1.0 | configuración análoga | no aplica | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dataset muy pequeño (59 imágenes) y captions uniformes, lo que puede limitar la variedad de poses, expresiones y ángulos reproducibles.
- Riesgo de sobreajuste al conjunto de entrenamiento y de generar variaciones limitadas del personaje.
- Posible sesgo hacia las condiciones de las imágenes de entrenamiento (iluminación, encuadre, estilo fotográfico).
- No se documentan evaluaciones de fidelidad, diversidad ni seguridad; el rendimiento real no está verificado.
- Los prompts de ejemplo están en inglés; el soporte multilingüe no está confirmado.
- La licencia declarada es Apache 2.0, pero al derivar de SDXL conviene revisar las condiciones del modelo base (CreativeML Open RAIL++-M) antes de uso comercial.
- Es un adaptador de personaje: no debe usarse para suplantar la identidad de personas reales ni para generar contenido engañoso.
- No es un LLM: no soporta razonamiento, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-tamil10-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset público asociado: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Librería diffusers: https://github.com/huggingface/diffusers
