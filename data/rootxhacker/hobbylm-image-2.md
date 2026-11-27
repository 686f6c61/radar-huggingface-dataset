# rootxhacker/HobbyLM-image-2

## Resumen

HobbyLM-image-2 es un modelo de difusión texto-a-imagen desarrollado por el usuario rootxhacker, publicado en Hugging Face como repositorio de checkpoints de trabajo privados de la familia HobbyLM-Image v2. El checkpoint activo, `model_v2_768u` (26 de noviembre de 2026), es un DiT de flow matching de 333 millones de parámetros con un módulo de fusión de texto, capaz de realizar tres tareas con el mismo conjunto de pesos: generación texto-a-imagen a 512 y 768 píxeles, edición por instrucción a 512 píxeles y renderizado de texto (dibujar palabras entre comillas dobles dentro de la imagen).

El modelo es relevante por su tamaño reducido (333M de parámetros, muy por debajo de los miles de millones habituales en modelos de difusión de imagen) combinado con una arquitectura de flow matching y un autoencoder de compresión 32x, lo que lo hace especialmente interesante para despliegue en hardware modesto y para experimentación. Además, integra edición y renderizado de texto en un único conjunto de pesos mediante un mecanismo de identificador de tarea y paneles de condicionamiento, en lugar de requerir modelos separados.

La ficha se elabora a partir exclusivamente de la model card publicada por el autor; no se dispone de información adicional sobre el entrenamiento, los datos utilizados ni la licencia concreta más allá de la etiqueta "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching y módulo de fusión de texto |
| Parametros totales | 333M (DiT); módulo de fusión de texto adicional no cuantificado en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); codificadores de texto: CLIP ViT-L/14 con 64 tokens y Flan-T5-large con 96 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el autor no documenta idiomas; los prompts de ejemplo están en inglés) |
| Licencia | other (etiqueta "other" en Hugging Face; no se detallan condiciones) |
| Formato de pesos | `.pt` (checkpoint PyTorch con claves `sd`, `fusion`, `cfg_dict`, `lat_std`, `sf`, `steps`, `v2`) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Resoluciones | 512px y 768px (texto-a-imagen); 512px (edición y renderizado de texto) |
| Codificadores de texto | `openai/clip-vit-large-patch14` (64 tokens) y `google/flan-t5-large` (96 tokens), no incluidos en el repo |
| Autoencoder | `mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers` (compresión 32x, 32 canales), no incluido en el repo |
| Tamaño del repositorio | 2.7 GB |
| Fecha de creación | 23 de noviembre de 2026 |
| Fecha de actualización | 27 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) de 333M de parámetros entrenado con flow matching, una formulación alternativa a la difusión clásica que aprende un campo de velocidad entre la distribución de ruido y la de datos. Incluye un módulo de fusión de texto que combina las representaciones de dos codificadores de texto congelados y no incluidos en el repositorio: CLIP ViT-L/14 (64 tokens) y Flan-T5-large (96 tokens). El autoencoder también está excluido del repo y es el DC-AE de SANA 1.1 con compresión 32x y 32 canales, lo que reduce drásticamente el coste computacional en el espacio latente.

La innovación principal es la unificación de tres tareas en un único conjunto de pesos mediante un identificador de tarea (`task id`) que se pasa al DiT. Para texto-a-imagen (task 0) se usa un panel único; para edición (task 1) se usan dos paneles `[objetivo ruidoso | imagen fuente]`; y para renderizado de texto (task 2) se usan dos paneles `[objetivo ruidoso | panel de glifos]`, donde el panel de glifos contiene las palabras solicitadas en una fuente plana sobre fondo blanco. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a 512px y 768px con prompts descriptivos.
- Edición de imágenes por instrucción en lenguaje natural a 512px (por ejemplo, "make the car blue"), manteniendo la relación de aspecto de entrada y salida.
- Renderizado de texto dentro de la imagen: las palabras entre comillas dobles en el prompt se dibujan en la imagen mediante un panel de glifos generado automáticamente.
- Tres tareas con un único conjunto de pesos, seleccionables mediante identificador de tarea.
- Integración con ComfyUI mediante un paquete de nodos personalizados con cuatro nodos: Loader, Generate, Edit y Text.
- Interfaz de línea de comandos y API de Python (`hobby_image.inference.HobbyImage`) con métodos `generate`, `edit` y `text`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada general (más allá de la imagen fuente en edición), audio ni modo thinking.

## Casos de uso

- Generación de ilustraciones y conceptos visuales a 768px: el modelo produce imágenes a partir de prompts descriptivos con CFG 4.5 y 50 pasos Euler, adecuado para prototipado rápido de ideas visuales en estudios pequeños o proyectos personales con hardware limitado.
- Edición fotográfica asistida por instrucción: dado que acepta una imagen de entrada y una instrucción en lenguaje natural y devuelve la misma resolución, puede usarse para cambiar colores de objetos, fondos o añadir elementos en flujos de retoque semi-automático.
- Creación de carteles y letreros con texto legible: la tarea de renderizado de texto permite generar imágenes con palabras concretas (por ejemplo, un cartel que diga "OPEN"), útil para mockups de señalética, camisetas, tazas o portadas donde el texto impreso en superficies planas suele ser correcto.
- Automatización de assets para marketing: mediante los nodos de ComfyUI o la CLI, se pueden generar variaciones de imágenes con texto integrado para banners, publicaciones o materiales promocionales, aunque con la limitación de que textos de siete o más letras y estilos como neón o manuscrito fallan a menudo.
- Prototipado de interfaces y mockups: la edición a 512px permite iterar sobre una imagen base (por ejemplo, un producto) aplicando cambios guiados por instrucciones, lo que agiliza la exploración de variantes sin reentrenar.
- Investigación y experimentación en difusión eficiente: con 333M de parámetros y compresión latente 32x, el modelo es un banco de pruebas accesible para estudiar flow matching, fusión de texto multi-codificador y unificación de tareas en un solo DiT, ejecutable en GPU de consumo.
- Integración en pipelines de ComfyUI: los nodos personalizados permiten encadenar generación, edición y renderizado de texto dentro de flujos de trabajo existentes, aunque no se conectan a KSampler, CLIP Text Encode ni VAE Decode, sino que ejecutan el sampler propio del modelo.

## Benchmarks y rendimiento

Los resultados publicados son auto-evaluados por el autor con una sola semilla y no proceden de una evaluación independiente.

| Benchmark | `model_v2_768` | `model_v2_768u` |
|---|---|---|
| GenEval 2 Soft-TIFA a 768px, GM / AM | 15.99 / 59.55 | 15.92 / 61.06 |
| GEdit-Bench-EN, juez Qwen2.5-VL-72B, SC / PQ / O | sin edición | 6.03 / 6.00 / 5.35 |
| Benchmark de texto propio, todas las palabras bien escritas | no sabe escribir | 74% |

Notas del autor: GenEval 2 usa 800 prompts con juez Qwen3-VL-8B y código oficial; diferencias inferiores a 2 GM se consideran ruido. GEdit-Bench-EN usa las 606 ediciones en inglés con los prompts oficiales de VIEScore y juez servido con vLLM; el mismo setup puntúa las salidas de Step1X-Edit v1.0 en 7.43 / 7.25 / 7.01 frente a los 7.39 / 7.28 / 7.07 publicados. El benchmark de texto es propio (100 prompts: 40 de una palabra, 40 de dos, 20 de tres, sobre carteles, camisetas, tazas y pósteres), leído por Qwen3-VL-8B; el 74% tiene todas las palabras correctas y el 68% coincide exactamente sin texto extra; los prompts con escena compleja empeoran hasta aproximadamente la mitad de aciertos.

En el conjunto de test Emu Edit (checkpoint anterior `model_v2_768t`, 500 ediciones): CLIP-dir 0.090, CLIP-im 0.859, L1 0.120, DINO 0.787; InstructPix2Pix con el mismo código obtiene 0.075 / 0.852 / 0.123 / 0.772.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 333M de parámetros en el DiT y pesos en `.pt` (probablemente fp32 o fp16), el checkpoint ocupa parte de los 2.7 GB del repo; el autoencoder y los codificadores de texto (no incluidos) añaden carga adicional.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPU de consumo; una RTX 4090 o RTX 3090 debería holgadamente ejecutarlo, y probablemente también GPU con 8-12 GB de VRAM, aunque no se confirma.
- Cabe en GPU de consumo: sí, por el tamaño del DiT (333M), aunque la VRAM exacta depende de los codificadores de texto y el autoencoder externos.
- Opciones de despliegue: script propio `hobby_image.inference` (Python y CLI), paquete de nodos para ComfyUI (`ComfyUI-HobbyLM-Image`, probado en ComfyUI 0.46.0 vía endpoint `/prompt`), y dependencias `torch`, `diffusers>=0.32`, `transformers`, `sentencepiece` y `pillow`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen en este formato).
- Latencia y throughput: no disponibles. El autor indica Euler 50 pasos con CFG 4.5 y timestep shift 1.5 para texto-a-imagen a 768px.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HobbyLM-image-2 (`model_v2_768u`) | 333M (DiT) | 512px y 768px; texto 64+96 tokens | GenEval 2 GM 15.92 / AM 61.06; GEdit 6.03 / 6.00 / 5.35; texto 74% | other | Hugging Face (repo de 2.7 GB) |
| Step1X-Edit v1.0 | no disponible en la información | no disponible | GEdit-Bench-EN 7.39 / 7.28 / 7.07 (publicado); 7.43 / 7.25 / 7.01 con el setup del autor | no disponible | no disponible |
| InstructPix2Pix | no disponible en la información | no disponible | Emu Edit: CLIP-dir 0.075, CLIP-im 0.852, L1 0.123, DINO 0.772 | no disponible | no disponible |

La comparativa se limita a los modelos citados por el autor en su model card; no se dispone de datos de otros modelos de difusión de tamaño similar para una comparación más amplia.

## Limitaciones y advertencias

- El renderizado de texto falla con frecuencia en neón, tiza, manuscrito y palabras de siete o más letras; sin el panel de glifos el modelo no sabe escribir.
- En edición, de doce ejemplos mostrados, diez fueron limpios: "add a croissant beside the cup" reemplazó la taza y "change the background to a beach" cambió el suelo pero mantuvo los edificios, lo que indica que las instrucciones de edición no siempre se respetan con precisión.
- Los benchmarks son auto-evaluados, con una sola semilla y jueces automáticos (Qwen3-VL-8B, Qwen2.5-VL-72B); no hay evaluación independiente ni repeticiones que estimen varianza.
- El benchmark de texto es propio del autor, no publicado, y los prompts con escena compleja empeoran hasta aproximadamente la mitad de aciertos.
- La licencia es "other" y no se detallan condiciones; no se confirma si se permite uso comercial. Es imprescindible contactar con el autor o revisar los términos antes de un uso en producción.
- El modelo se describe como "checkpoints de trabajo privados"; no hay información sobre sesgos, datos de entrenamiento, composición del dataset ni riesgos de alucinación visual.
- Los codificadores de texto y el autoencoder no están incluidos en el repositorio y deben descargarse por separado, lo que añade dependencias externas y posibles incompatibilidades de versión.
- Los nodos de ComfyUI se probaron solo mediante el endpoint `/prompt`, no manualmente en la interfaz del navegador.
- No se documentan idiomas soportados; los ejemplos y benchmarks están en inglés, por lo que el rendimiento en castellano es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rootxhacker/HobbyLM-image-2
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-large-patch14
- Codificador de texto Flan-T5: https://huggingface.co/google/flan-t5-large
- Autoencoder DC-AE SANA 1.1: https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos fuera de la model card y los recursos citados.
