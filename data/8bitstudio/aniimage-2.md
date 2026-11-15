# 8BitStudio/Aniimage-2

## Resumen

Aniimage-2 es un modelo de difusión latente para generación de imágenes de anime a 512x512, desarrollado por 8BitStudio como segunda entrega de la serie Aniimage. A diferencia de muchos modelos de la categoría, no se deriva de Stable Diffusion ni de ningún otro modelo preexistente: el UNet se ha entrenado desde cero, junto con un VAE y un codificador de texto CLIP, sumando 441,9 millones de parámetros en total. El repositorio ocupa 1,8 GB y se distribuye en formato safetensors compatible con la librería `diffusers`.

El modelo se entrenó durante 70.000 pasos con un tamaño de lote de 64 sobre aproximadamente 1,2 millones de imágenes de anime seleccionadas de Danbooru y otras fuentes. Está pensado para generar ilustraciones de personajes y fondos con estética anime, y su model card destaca mejoras notables frente a Aniimage-1, especialmente en la generación de fondos y de personajes masculinos, que en la primera versión fallaban con frecuencia.

Su relevancia radica en que ofrece una alternativa ligera (requiere unos 6 GB de VRAM mínimos, 8 GB recomendados) y con licencia Apache 2.0, lo que permite uso comercial sin las restricciones de las licencias CreativeML OpenRAIL asociadas a la familia Stable Diffusion. Está pensado para prompts en inglés, tanto en lenguaje natural como con etiquetas de Danbooru.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + VAE + CLIP) |
| Parametros totales | 441.917.188 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin ventana de contexto de tokens publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `diffusers`) |
| Resolución de salida | 512x512 |
| Pasos de entrenamiento | 70.000 |
| Tamaño de lote de entrenamiento | 64 |
| Dataset | ~1,2 millones de imágenes de anime de Danbooru y otras fuentes |
| Scheduler recomendado | DPM++ SDE |
| Pasos de inferencia recomendados | 50 |
| Hardware de entrenamiento | NVIDIA RTX 5060 Ti 16 GB |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

Aniimage-2 emplea una arquitectura de difusión latente clásica compuesta por tres módulos: un UNet que realiza el proceso de eliminación de ruido en el espacio latente, un VAE que codifica y decodifica entre píxeles e imágenes latentes, y un codificador de texto CLIP que convierte los prompts en embeddings de condicionamiento. El UNet se entrenó desde cero, sin inicialización a partir de pesos de Stable Diffusion ni de otro modelo, lo que constituye la diferencia técnica principal respecto a la mayoría de modelos de anime disponibles.

El entrenamiento se realizó durante 70.000 pasos con lotes de 64 imágenes, sobre un corpus de aproximadamente 1,2 millones de imágenes de anime curadas de Danbooru y otras fuentes, en una única GPU NVIDIA RTX 5060 Ti de 16 GB. La model card no detalla la composición exacta del dataset, el número de tokens de texto vistos, ni si se aplicaron técnicas de ajuste como RLHF o DPO (en modelos de difusión no es habitual). Tampoco se documenta ninguna innovación arquitectónica específica más allá del entrenamiento desde cero.

## Capacidades

- Generación de imágenes text-to-image a resolución fija de 512x512 con estética anime.
- Acepta tanto prompts en lenguaje natural ("A smiling anime girl with red hair and a school uniform") como etiquetas de Danbooru ("1girl, solo, smile, red_hair, school_uniform, anime_coloring").
- Generación de fondos y escenarios (bosques, atmósferas, escenas sin personas), capacidad destacada como mejora principal frente a Aniimage-1.
- Generación de personajes masculinos con mayor fiabilidad que la versión anterior, aunque todavía inferior a la de personajes femeninos.
- Soporte de prompt negativo, que el autor describe como necesario para obtener buena calidad.
- Integración con ComfyUI mediante un nodo cargador personalizado incluido en el repositorio.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo de pensamiento; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Ilustración de personajes para proyectos indie: el modelo genera retratos y figuras de cuerpo entero a 512x512 con estética anime coherente, adecuado para prototipado rápido de personajes en videojuegos o cómics amateur, con un coste de hardware de una sola GPU consumer.
- Generación de fondos y escenarios: dada su mejora específica en fondos, se puede usar para producir escenarios (bosques, interiores, paisajes) que luego se componen con personajes en un pipeline de posproducción.
- Creación de assets para fan art y comunidades: al aceptar etiquetas de Danbooru, encaja en flujos de trabajo donde los usuarios ya están familiarizados con esa sintaxis, reduciendo la curva de aprendizaje.
- Prototipado en ComfyUI: el nodo personalizado incluido permite integrar el modelo en grafos de ComfyUI junto con upscalers, postprocesado o modelos de segmentación, útil para iterar rápidamente sobre conceptos visuales.
- Generación por lotes en servidores modestos: con 6 GB de VRAM mínimos y 8 GB recomendados, se puede desplegar en GPUs de gama media para producir lotes de imágenes a bajo coste, por ejemplo para catálogos de avatares o ilustraciones de blog.
- Investigación sobre difusión desde cero: al ser un UNet entrenado sin inicialización de Stable Diffusion, sirve como caso de estudio para comparar el rendimiento de modelos pequeños entrenados desde cero frente a fine-tunes de modelos grandes.
- Generación de avatares e iconos de perfil: con prompts cortos y un prompt negativo estándar, produce retratos cuadrados 512x512 directamente utilizables como avatar en foros o redes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye comparaciones cualitativas mediante imágenes de ejemplo entre Aniimage-1 y Aniimage-2 (un bosque y un personaje masculino), sin métricas cuantitativas como FID, CLIP score ni evaluaciones humanas numéricas.

## Requisitos de hardware

- VRAM mínima para inferencia: ~6 GB; recomendados 8 GB o más según la model card.
- RAM de CPU: ~7 GB mínimo; recomendados 10 GB o más. La generación en CPU es extremadamente lenta según el autor.
- GPU de entrenamiento original: NVIDIA RTX 5060 Ti de 16 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 5060 Ti); en el segmento profesional, A100 o H100 funcionan sobradamente pero están muy por encima de lo necesario.
- Cabe en GPU consumer: sí, con 6-8 GB de VRAM.
- Opciones de despliegue: `diffusers` (script `generate_images.py` incluido), ComfyUI mediante el nodo personalizado `comfyui_aniimage`, y Google Colab mediante el notebook interactivo incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada. Con DPM++ SDE a 50 pasos y 512x512, el coste es el típico de un UNet de ~440 M de parámetros, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto/prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aniimage-2 | 441,9 M | 512x512 | Inglés, lenguaje natural y tags Danbooru | Apache 2.0 | Hugging Face, diffusers, ComfyUI |
| Aniimage-1 | no disponible | no disponible | Inglés | no disponible | Hugging Face |
| Stable Diffusion 1.5 (referencia de la categoría) | ~860 M (UNet) | 512x512 | Inglés, tags | CreativeML OpenRAIL-M | Amplia, ecosistema maduro |
| Modelos de anime basados en SD 1.5 (fine-tunes de la comunidad) | ~860 M (UNet) | 512x512 | Inglés, tags Danbooru | Varía según el fine-tune | Hugging Face, Civitai |

La comparación con Stable Diffusion 1.5 y sus fine-tunes de anime es pertinente por categoría y resolución, pero Aniimage-2 tiene la mitad de parámetros en el UNet y está entrenado desde cero, lo que implica un ecosistema de herramientas y LoRAs mucho menor. La ventaja principal frente a los fine-tunes basados en SD 1.5 es la licencia Apache 2.0, más permisiva para uso comercial que la CreativeML OpenRAIL-M. No se dispone de datos cuantitativos de rendimiento para comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Manos: el autor reconoce explícitamente que el modelo es malo generando manos; pueden fundirse con superficies de colores similares y suelen tener más o menos de cinco dedos.
- Personajes masculinos: se generan con menos fiabilidad que los femeninos; puede requerir muchas imágenes para obtener un buen resultado.
- Prompts largos: el autor indica que los prompts largos y los prompts "enhanced" suelen empeorar el resultado; conviene mantenerlos cortos.
- Prompt negativo: se describe como necesario para una buena salida; sin él, la calidad cae.
- Idioma: solo se documenta soporte de inglés; no se garantiza el comportamiento con prompts en castellano u otros idiomas.
- Resolución fija: 512x512, sin soporte documentado de otras resoluciones nativas.
- Sesgos: al entrenarse sobre Danbooru, es probable que herede sesgos de representación y estilísticos del corpus (predominio de personajes femeninos, estilos y convenciones de la comunidad), aunque la model card no los detalla.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomía incorrecta, artefactos y composiciones incoherentes, especialmente en escenas complejas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no documenta consideraciones sobre derechos de las imágenes de entrenamiento (Danbooru aloja contenido de procedencia diversa), lo que conviene evaluar en un contexto de producción.
- Madurez: modelo con 45 descargas y 6 likes en el momento de la consulta, con ecosistema limitado (sin LoRAs ni fine-tunes de la comunidad documentados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/8BitStudio/Aniimage-2
- Aniimage-1: https://huggingface.co/8BitStudio/Aniimage-1
- Script de generación: https://huggingface.co/8BitStudio/Aniimage-2/resolve/main/generate_images.py
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/8BitStudio/Aniimage-2/blob/main/Aniimage_2_Interactive_Colab.ipynb
- Nodo de ComfyUI: https://huggingface.co/8BitStudio/Aniimage-2/tree/main/comfyui_aniimage
- Danbooru: https://danbooru.donmai.us/
