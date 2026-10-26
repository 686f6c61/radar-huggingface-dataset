# RunningHubAI/rh-lexa-lora

## Resumen

rh-lexa-lora es un adaptador LoRA de personaje (character LoRA) publicado por RunningHubAI en Hugging Face, entrenado sobre el modelo base Krea 2 Raw. No es un modelo de lenguaje ni un modelo generativo completo: es un peso adicional de 218 MiB (aproximadamente 0,2 GB de repositorio) que se carga junto al modelo base para reproducir un personaje concreto —descrito por el autor como de pelo castaño rizado, pecas y textura de piel natural— en retratos fotorrealistas y escenas cotidianas.

El problema que resuelve es la consistencia de identidad en generación y edición de imágenes: en lugar de describir el personaje en cada prompt, se activa con la palabra clave `lexa` y se varían prendas, pose, escenario e iluminación. El pipeline declarado en Hugging Face es `image-text-to-image`, lo que lo sitúa en el terreno de la edición de imagen condicionada por texto e imagen de referencia, no en el de la generación puramente texto-a-imagen.

Su relevancia es acotada y práctica: el ecosistema de LoRAs de personaje para ComfyUI y para la plataforma RunningHub es enorme, y este adaptador se distribuye como un peso listo para cargar en dichos entornos. No hay información pública sobre arquitectura del modelo base, número de parámetros, contexto, benchmarks ni licencia concreta, y el entrenamiento se realizó sobre un conjunto de solo 45 imágenes, un dato clave para calibrar su robustez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Adaptador LoRA (image edit) sobre el modelo base Krea 2 Raw; no se documenta la arquitectura del modelo base |
| Parámetros totales | No disponible (el adaptador LoRA ocupa 218 MiB en disco; no se indica el rango ni el número de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se documenta resolución ni ventana de condicionamiento) |
| Tipos de cuantización | No disponible. El repositorio solo distribuye pesos en safetensors; no se documentan variantes GGUF, FP8 ni INT8 |
| Idiomas soportados | No disponible (los ejemplos de prompt de la model card están en inglés; no se documenta soporte multilingüe) |
| Licencia | No disponible. La model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`lexa_krea2_raw_2500 (1).safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del adaptador ni del modelo base Krea 2 Raw: la model card no indica tipo de transformer, mecanismo de atención, resolución nativa ni variante de difusión. Lo único documentado es la naturaleza del artefacto: un LoRA de edición de imagen, etiquetado con el pipeline `image-text-to-image` y con la anotación `Finetuned from: krea2`, es decir, un ajuste fino de bajo rango sobre Krea 2 Raw.

El entrenamiento se realizó en la plataforma RunningHub a partir de un dataset propio de 45 imágenes del personaje, orientado a retratos fotorrealistas y escenas cotidianas, con rasgos definidos (pelo castaño rizado, pecas, textura de piel natural). No se documentan número de pasos, resolución de entrenamiento, learning rate, técnica de regularización, ni si hubo etapas de preferencia o refinamiento. El nombre del fichero (`lexa_krea2_raw_2500`) sugiere 2500 pasos o muestras, pero es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

- Generación de imágenes fotorrealistas del personaje `lexa` en retratos y escenas cotidianas, activado mediante la palabra clave `lexa` en el prompt.
- Edición de imagen guiada por texto e imagen (`image-text-to-image`), permitiendo recomponer prendas, pose, escenario e iluminación manteniendo la identidad del personaje.
- Control de atributos secundarios vía prompt: ropa, postura, localización y esquema de luz, según las instrucciones del autor.
- Integración en flujos de ComfyUI y en la plataforma RunningHub, incluyendo la carga del peso junto al modelo base Krea 2 Raw.
- Consistencia de personaje entre iteraciones, que es el objetivo declarado del adaptador.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo "thinking": no es un modelo de lenguaje.
- No se documentan capacidades de vídeo, audio, segmentación ni detección; el pipeline declarado es únicamente de imagen.

## Casos de uso

- Series de contenido con personaje recurrente: usar `lexa` como palabra clave fija permite generar decenas de imágenes del mismo personaje con vestuario y localizaciones distintas, manteniendo coherencia visual entre publicaciones.
- Ilustración editorial y moodboards: generar retratos fotorrealistas del personaje para acompañar artículos o piezas de marca, ajustando iluminación y encuadre mediante prompt sin reentrenar.
- Previsualización de estilismo y vestuario: iterar prendas y combinaciones sobre un mismo rostro y cuerpo para validar direcciones creativas antes de una sesión fotográfica real.
- Edición de imágenes existentes: al ser un LoRA de image edit, permite sustituir fondo o ropa sobre una imagen de entrada conservando los rasgos del personaje, útil en retoque y postproducción.
- Prototipado de personajes para cómic, novela gráfica o videojuego: servir de referencia visual estable para un pitch o una biblia de personaje antes de encargar arte final.
- Automatización por lotes en producción: cargar el LoRA en un workflow de ComfyUI y ejecutarlo a través de la API de RunningHub para generar variantes de forma programática.
- Pruebas de concepto publicitarias: generar escenas cotidianas con el personaje en distintos contextos (hogar, calle, oficina) para presentar una campaña sin producción fotográfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud facial, consistencia de identidad) ni comparaciones cuantitativas con otros LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador pesa 218 MiB, pero el consumo vendrá determinado por el modelo base Krea 2 Raw, cuyos requisitos no se documentan en esta ficha.
- GPU recomendadas: no disponible para el modelo base. Para el adaptador en sí no se requiere hardware específico más allá de lo que exija Krea 2 Raw.
- Viabilidad en GPU de consumo: no disponible. No se confirma que el conjunto (base + LoRA) quepa en tarjetas de 8, 12, 16 o 24 GB.
- Opciones de despliegue documentadas: ComfyUI (etiqueta `comfyui` del repositorio), plataforma RunningHub y carga directa del safetensors desde Hugging Face. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni imágenes por segundo en ninguna GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Dataset de entrenamiento | Licencia | Repositorio |
|---|---|---|---|---|---|
| rh-lexa-lora (este) | LoRA de personaje, image-text-to-image | Krea 2 Raw | 45 imágenes propias | No disponible | 218 MiB, safetensors |
| rh-h3-character-swap-pro4500-lora | LoRA (intercambio de personaje) | No disponible | No disponible | No disponible | No disponible |
| rh-qwen-image-2.1-aio-nsfw-lora | LoRA (image-to-image, NSFW) | Qwen Image 2.1 | No disponible | No disponible | No disponible |

Los dos comparables listados pertenecen al mismo autor (RunningHubAI) y comparten la misma opacidad documental: no publican parámetros, contexto, benchmarks ni licencia explícita. Fuera del catálogo de RunningHub, la alternativa habitual son LoRAs de personaje entrenados sobre otros modelos base (Flux, SDXL, Qwen Image) para ComfyUI; no se dispone de datos verificables de ninguno de ellos en la información proporcionada, por lo que no se ofrece comparación cuantitativa.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (45 imágenes): riesgo alto de sobreajuste a las poses, encuadres e iluminaciones presentes en el conjunto, con poca variedad al salir de esos patrones.
- Identidad de un único personaje: no es un modelo generalista; fuera del personaje `lexa` su aportación es marginal o nula.
- Licencia no disponible: la model card remite a la licencia del proyecto original y mantiene los derechos en el autor. No hay autorización explícita de uso comercial, por lo que su empleo en producción requiere contactar con el autor o con RunningHub.
- Dependencia del modelo base Krea 2 Raw: sus propios términos de licencia y sus requisitos de hardware se aplican de forma adicional y no se detallan aquí.
- Ausencia total de benchmarks: no hay evidencia publicada sobre consistencia de identidad, fidelidad al prompt o tasas de fallo, lo que impide estimar calidad de forma objetiva.
- Riesgo de artefactos propios de la difusión (manos, texturas de piel, coherencia de accesorios) no evaluado ni documentado por el autor.
- Idiomas no documentados: no se garantiza que prompts en castellano funcionen igual que en inglés; los ejemplos del autor están en inglés.
- Colisión de la palabra clave `lexa` con otros conceptos o personajes homónimos en el prompt.
- Fechas del repositorio (creado y actualizado el 2026-10-26) y cero descargas y cero likes: no hay evidencia de uso real ni de validación por parte de la comunidad.
- No apto para tareas de lenguaje, razonamiento, código o agentes: cualquier uso en ese sentido es un error de categoría.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-lexa-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2114349782465839106
- Página del autor (Богдан Лещук): https://www.runninghub.ai/user-center/2046985403118133249
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (sitio internacional): https://www.runninghub.ai?utm_source=huggingface&utm_medium=badge&utm_campaign=model_upload&utm_content=rh-2114349782465839106
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino del repositorio: README_cn.md (referenciado en la model card)
