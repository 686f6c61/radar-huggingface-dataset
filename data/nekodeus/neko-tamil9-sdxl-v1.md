# Nekodeus/neko-tamil9-sdxl-v1

## Resumen

Neko-tamil9-sdxl-v1 es un adaptador LoRA para generación de imágenes con Stable Diffusion XL, desarrollado por el usuario Nekodeus bajo licencia Apache 2.0. Se trata de un LoRA de personaje entrenado para reproducir el rostro de la actriz india Keerthy Suresh, activado mediante el token disparador `tamil9`. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0` y modifica únicamente el UNet.

El modelo resuelve un problema muy acotado: la generación consistente de un personaje concreto (una celebridad del cine tamil) en imágenes de 1024x1024 píxeles. Forma parte del conjunto "Tamil Top-10" del mismo autor, una colección de LoRAs de personajes del cine tamil, y se entrenó íntegramente en una GPU de Kaggle de forma offline, sin servicios externos de pago.

Su relevancia es limitada y de nicho: resulta útil para aficionados al retrato sintético y para quienes investigan el ajuste fino de SDXL con pocos datos (85 imágenes). El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que debe considerarse un artefacto experimental sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL |
| Parámetros totales | no disponible (el LoRA usa rango 16 en el UNet; el recuento exacto no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el prompt se tokeniza con el text encoder de SDXL, hasta 77 tokens por bloque) |
| Tipos de cuantización | fp16 (entrenamiento e inferencia indicados); no se documentan otras |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder de SDXL, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tamil9.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el UNet de Stable Diffusion XL, un transformer de difusión con atención, mediante LoRA de rango 16 y alpha 16, aplicado exclusivamente al UNet (no se ajustan los text encoders). El entrenamiento se realizó con la herramienta `kohya-ss/sdxl_train_network.py`, a resolución 1024 con bucketing entre 256 y 2048 píxeles, 1500 pasos, learning rate 1e-4, optimizador Adafactor con batch 1, precisión fp16, gradient checkpointing y atención sdpa.

El conjunto de datos consta de 85 imágenes curadas de Keerthy Suresh, verificadas facialmente con OpenCV y etiquetadas con un pie de foto uniforme (`a photo of tamil9 person`). El dataset público asociado es `nekodeus/tamil-top10-v2`, en la subcarpeta `tamil9/`. No se documenta uso de RLHF, DPO ni técnicas de preferencia; tampoco se especifica el número total de tokens de imagen vistos ni la composición demográfica del dataset más allá del personaje objetivo. La innovación técnica es mínima: se trata de un flujo estándar de ajuste fino con LoRA sobre SDXL.

## Capacidades

- Generación de imágenes text-to-image a 1024x1024 píxeles mediante SDXL base más el adaptador.
- Reproducción del rostro de Keerthy Suresh al incluir el token `tamil9` en el prompt.
- Composición con el resto de la escena controlada por el prompt (iluminación, encuadre, estilo), ya que el LoRA solo modifica el UNet y no restringe el resto de la generación.
- Compatible con el ecosistema diffusers y ComfyUI mediante carga de pesos LoRA.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de difusión, no de lenguaje.
- Capacidades multilingües: no disponibles; el text encoder de SDXL está orientado a inglés.
- No incluye modo thinking, visión de entrada, audio ni otras modalidades.

## Casos de uso

- Retrato sintético de personaje concreto: generar retratos de estudio de Keerthy Suresh con `tamil9` en el prompt, útil para pruebas de caracterización y maquetas visuales.
- Ilustración de fan art: crear escenas temáticas (cine, moda, eventos) manteniendo la identidad facial del personaje con un único token disparador.
- Pruebas de concepto de pipelines de difusión: validar la carga de LoRAs en diffusers o ComfyUI con un adaptador pequeño (0,2 GB) antes de desplegar adaptadores mayores.
- Investigación sobre ajuste fino con pocos datos: el repositorio documenta un entrenamiento con 85 imágenes y 1500 pasos, lo que sirve como referencia reproducible para estudiar el sobreajuste en LoRAs de personaje.
- Generación de variaciones de estilo: combinar el LoRA con otros LoRAs o prompts de estilo para explorar la robustez del token disparador frente a cambios de iluminación y encuadre.
- Docencia y demostraciones: ilustrar en talleres cómo funciona un LoRA de personaje y cómo se integra en SDXL sin necesidad de infraestructura costosa (cabe en GPU de consumo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero requiere cargar SDXL base (aproximadamente 6,9 GB en fp16) para la inferencia.
- VRAM estimada: 8-10 GB en fp16 a 1024x1024 con optimizaciones; 12 GB o más para mayor holgura y batch superior a 1.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100. Cabe en GPU de consumo con al menos 8 GB de VRAM usando fp16 y atención eficiente.
- Despliegue: diffusers (`load_lora_weights`), ComfyUI (nodo LoRA loader) y, en general, cualquier runtime que admita LoRAs de SDXL (por ejemplo, A1111/Forge con extensión correspondiente). No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neko-tamil9-sdxl-v1 | LoRA de personaje | SDXL 1.0 | 1024x1024 | Apache 2.0 | Hugging Face, 0 descargas |
| SDXL base 1.0 | Modelo fundacional text-to-image | — | 1024x1024 | CreativeML Open RAIL++-M | Ampliamente disponible |
| LoRAs de personaje de la comunidad (por ejemplo, colecciones tipo Civitai) | LoRA de personaje | SDXL 1.0 | 1024x1024 | Variable (a menudo restrictiva) | Según autor |
| SD 1.5 + LoRA de personaje | LoRA de personaje | SD 1.5 | 512x512 | CreativeML Open RAIL-M | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo (FID, similitud facial, CLIP score) para este adaptador, por lo que la comparación se limita a parámetros estructurales y licencia.

## Limitaciones y advertencias

- Modelo de nicho sin validación comunitaria: cero descargas y cero likes en el momento de la ficha; no hay evidencia externa de calidad.
- Riesgo de sobreajuste: 85 imágenes y 1500 pasos con un pie de foto uniforme pueden provocar rigidez en la pose y el encuadre, y dificultad para generalizar a escenas complejas.
- Sesgo de identidad: el LoRA está entrenado sobre un único individuo; puede reproducir rasgos de forma inexacta o mezclar identidades en prompts ambiguos.
- Riesgo de deepfake y suplantación: la generación de imágenes realistas de una persona real plantea problemas éticos y legales según la jurisdicción; la licencia Apache 2.0 no exime del cumplimiento de normativas de derechos de imagen.
- Idiomas: el text encoder de SDXL está orientado al inglés; prompts en otros idiomas pueden degradar el resultado.
- Licencia Apache 2.0 declarada, pero el modelo base SDXL se distribuye bajo CreativeML Open RAIL++-M, cuyas restricciones de uso deben respetarse al combinar ambos.
- No hay información sobre sesgos demográficos del dataset ni sobre diversidad de iluminación, ángulos o expresiones.
- El repositorio incluye imágenes de muestra del conjunto de entrenamiento; conviene verificar sus derechos antes de redistribuirlas.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-tamil9-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset asociado: https://huggingface.co/datasets/nekodeus/tamil-top10-v2
- Herramienta de entrenamiento: https://github.com/kohya-ss/sd-scripts
- Librería diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
