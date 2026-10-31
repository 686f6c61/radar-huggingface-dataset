# alvaroborre/sd-lora-oldbookillustrations

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre Stable Diffusion v1.4 de CompVis para generar imágenes con estilo de ilustraciones de libros antiguos. El autor, alvaroborre, ha realizado el ajuste fino sobre el conjunto de datos `gigant/oldbookillustrations`, compuesto por 600 imágenes de grabados e ilustraciones de libros clásicos.

El modelo resuelve el problema de especializar un modelo de difusión de uso general en una estética concreta: la de las ilustraciones monocromas y grabados típicos de publicaciones de los siglos XIX y principios del XX. Al tratarse de un LoRA de rango bajo (rank 6), el peso del adaptador es muy reducido frente al modelo base completo, lo que permite cargarlo y descargarlo dinámicamente sin duplicar el modelo.

Su relevancia práctica es doble: para creadores que necesitan generar ilustraciones con estética vintage de forma consistente, y para desarrolladores que buscan un ejemplo ligero y reproducible de cómo entrenar y distribuir adaptadores LoRA con la librería `diffusers` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion v1.4 (diffusion transformer U-Net) |
| Parametros totales | no disponible (corresponden al modelo base Stable Diffusion v1.4, ~890 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; máximo de 77 tokens en el codificador de texto CLIP del modelo base) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso sugiere fp16 en el modelo base) |
| Idiomas soportados | no disponible (los prompts funcionan en inglés, idioma del entrenamiento del modelo base) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (formato propio de `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador sigue la técnica LoRA: en lugar de reentrenar el modelo completo, se inyectan matrices de bajo rango en las proyecciones de atención de la UNet del modelo base. Según la model card, se han entrenado exclusivamente las capas `to_q`, `to_k`, `to_v` y `to_out.0` de la UNet, dejando congelados tanto el codificador de texto (CLIP) como el VAE. Con un rango LoRA de 6 y alpha de 6, el número de parámetros entrenables es mínimo, lo que reduce el riesgo de sobreajuste con un dataset pequeño y mantiene el tamaño del archivo resultante en unos pocos megabytes.

El entrenamiento se realizó sobre 600 imágenes del dataset `gigant/oldbookillustrations` durante 6 épocas, con un batch size de 3, un learning rate de 0.0001 y una resolución de 512x512 píxeles, la resolución nativa de Stable Diffusion v1.4. No se menciona el uso de técnicas adicionales como prior preservation, EMA ni entrenamiento del codificador de texto. La inferencia se realiza cargando el modelo base en fp16 y aplicando el adaptador mediante `pipe.load_lora_weights()`.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con estética de ilustraciones de libros antiguos: grabados, dibujos lineales monocromos y estilo editorial clásico.
- Compatibilidad total con el ecosistema `diffusers`: se carga sobre cualquier pipeline de Stable Diffusion v1.4 existente.
- Combinable con otros LoRA y con mecanismos de peso de adaptador (escala del LoRA) para ajustar la intensidad del estilo.
- Hereda todas las capacidades del modelo base: variaciones mediante seeds, img2img si se usa el pipeline correspondiente, negative prompts, guidance scale ajustable.
- No incluye capacidades de vision, audio ni tool calling: es un modelo generativo de imágenes puro.

## Casos de uso

- Ilustración editorial vintage: generación de láminas decorativas para libros, novelas o revistas que busquen estética de grabado antiguo, aprovechando que el modelo se ha especializado en ese dominio visual concreto.
- Generación de arte para juegos de mesa o RPG: creación de ilustraciones monocromas de mapas, criaturas y escenas con aspecto de manual clásico, coherente entre generaciones gracias al ajuste fino.
- Prototipado rápido de estilos: al ser un LoRA ligero, permite a diseñadores probar la estética de ilustración antigua sin desplegar un modelo completo especializado.
- Educación y demos técnicas: ejemplo práctico y compacto para enseñar cómo funciona el ajuste fino LoRA sobre modelos de difusión, con hiperparámetros documentados públicamente.
- Producción de contenido para redes sociales o blogs temáticos: generación de imágenes de acompañamiento con estilo consistente para publicaciones sobre historia, literatura clásica o naturaleza.
- Base para pipelines automatizados: integración en scripts Python con `diffusers` para generar lotes de ilustraciones parametrizadas por prompt, reutilizando infraestructura existente de Stable Diffusion v1.4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un adaptador estético para generación de imágenes, la evaluación habitual se realiza mediante inspección visual de las imágenes generadas (la model card incluye una imagen de ejemplo) y no mediante métricas cuantitativas como FID o CLIP score.

## Requisitos de hardware

- VRAM estimada: la del modelo base Stable Diffusion v1.4 en fp16, aproximadamente 4 GB; el LoRA añade una sobrecarga despreciable (unos pocos MB). Con 6-8 GB de VRAM la inferencia es confortable a 512x512.
- GPU recomendadas: cualquier GPU consumer moderna con soporte CUDA (RTX 3060, RTX 4060 o superiores); no se requiere hardware de datacenter.
- Cabe sin problemas en GPUs consumer; también es viable en Apple Silicon mediante MPS y en CPU (con latencias de varios minutos por imagen).
- Despliegue: `diffusers` (vía `StableDiffusionPipeline` y `load_lora_weights`), y por extensión cualquier runtime compatible con LoRA de SD 1.4 como AUTOMATIC1111, ComfyUI o `stable-diffusion-webui`. No se menciona soporte en vLLM, TGI ni Ollama.
- Latencia: no disponible; como referencia, una RTX 4090 genera imágenes de 512x512 con SD 1.4 en aproximadamente 1-2 segundos con 20-30 pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dataset / estilo | Licencia |
|---|---|---|---|---|
| alvaroborre/sd-lora-oldbookillustrations | LoRA | Stable Diffusion v1.4 | gigant/oldbookillustrations (600 imágenes, ilustración clásica) | CreativeML Open RAIL-M |
| LoRAs de ilustración vintage en Civitai / Hugging Face | LoRA | SD 1.4 / SD 1.5 | variados, habitualmente miles de imágenes | variable según autor |
| dreamshaper y otros checkpoints estilizados de SD 1.5 | checkpoint completo | SD 1.5 | entrenamientos completos, estilos amplios | mayormente Open RAIL-M y derivadas |

La ventaja diferencial de este LoRA frente a checkpoints completos estilizados es su tamaño mínimo y su portabilidad: se aplica sobre cualquier instalación de SD v1.4 en una línea de código, y su documentación de hiperparámetros (rank 6, alpha 6, 6 épocas, lr 0.0001) facilita reproducir el entrenamiento.

## Limitaciones y advertencias

- Calidad ligada al modelo base: Stable Diffusion v1.4 es un modelo de 2022 con limitaciones conocidas en anatomía, texto renderizado y composiciones complejas; el LoRA no corrige estos defectos.
- Dataset pequeño (600 imágenes): con solo 6 épocas y rank 6, el estilo puede no transferirse de forma intensa en todos los prompts; puede requerir ajustar la escala del LoRA o los prompts.
- Sesgos heredados: el modelo base presenta sesgos demográficos y culturales documentados, y el dataset de ilustraciones antiguas añade sesgos propios de la época representada (perspectivas históricas, representación estereotipada en grabados clásicos).
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar artefactos, elementos anómalos y detalles incoherentes, especialmente en escenas complejas.
- Idioma: los prompts funcionan mejor en inglés; no hay garantía de comprensión de prompts en castellano.
- Licencia: CreativeML Open RAIL-M permite uso comercial con restricciones de uso (prohibidos ciertos usos dañinos según el acuerdo de licencia); conviene revisar el texto completo antes de desplegar en producción.
- Resolución nativa de 512x512: generar a resoluciones superiores puede producir artefactos de duplicación; para mayor tamaño se recomienda upscaling posterior.
- Actividad del repositorio: 0 descargas y 0 likes registrados, sin comunidad de soporte; no hay issues ni ejemplos adicionales más allá de la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alvaroborre/sd-lora-oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
