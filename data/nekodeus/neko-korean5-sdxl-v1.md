# Nekodeus/neko-korean5-sdxl-v1

## Resumen

`Nekodeus/neko-korean5-sdxl-v1` es una LoRA de personaje para Stable Diffusion XL (SDXL) entrenada por el usuario Nekodeus. Su objetivo es reproducir el rostro del actor surcoreano Song Joong-ki en generaciones de imagen texto-a-imagen de 1024 px, mediante el token disparador `korean5`. Forma parte del conjunto denominado "Korean Top-10" del autor, y el dataset de entrenamiento público se referencia como `nekodeus/korean-top10-v2` (subcarpeta `korean5/`).

No se trata de un modelo base completo, sino de un adaptador de bajo rango (LoRA) que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0`. El repositorio ocupa 0,2 GB y contiene el archivo de pesos `korean5.safetensors`, además de imágenes de muestra del set de entrenamiento en la carpeta `samples/`. Es relevante para quienes necesitan un adaptador ligero y de licencia permisiva para generación de retratos de una identidad concreta, sin reentrenar el UNet completo.

El entrenamiento se realizó en una GPU de Kaggle de forma totalmente offline y sin tokens de API, con 1500 pasos, dimensión de red y alpha de 16, learning rate 1e-4, optimizador Adafactor y precisión fp16. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque con las cautelas legales habituales sobre derechos de imagen de la persona representada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; red dim/alpha 16/16, solo UNet |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene ~2.6B en UNet y ~817M en text encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion texto-a-imagen; el prompt se tokeniza con el text encoder de SDXL, limite de 77 tokens por encoder) |
| Tipos de cuantizacion | no disponible (pesos en fp16/safetensors; el adaptador puede combinarse con el base en fp16, fp32 o variantes cuantizadas del base) |
| Idiomas soportados | no disponible (prompts en ingles recomendados por el formato de SDXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean5.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA aplicada únicamente al UNet de Stable Diffusion XL Base 1.0, con dimensión de red 16 y alpha 16. SDXL es un modelo de difusión latente con un UNet de aproximadamente 2.6 mil millones de parámetros y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG). La LoRA no modifica los text encoders, solo inyecta matrices de bajo rango en las capas del UNet para especializarlo en la identidad objetivo.

El entrenamiento se llevó a cabo con la herramienta `kohya-ss/sdxl_train_network.py` sobre 30 imágenes curadas de Song Joong-ki, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of korean5 person`). Se usaron 1500 pasos, resolución 1024 con bucketing entre 256 y 2048, learning rate 1e-4, batch 1, optimizador Adafactor, precisión fp16, gradient checkpointing y atención SDPA, todo en una GPU de Kaggle. No se documentan fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un adaptador de personaje.

## Capacidades

- Generación de imágenes texto-a-imagen de 1024×1024 px condicionada por el token `korean5` para reproducir el rostro de Song Joong-ki.
- Composición de retratos y escenas con control mediante prompt (iluminación, encuadre, estilo fotográfico, vestuario).
- Integración con pipelines de `diffusers` (`StableDiffusionXLPipeline` + `load_lora_weights`) y con ComfyUI mediante nodo LoRA loader.
- Combinable con otras LoRA y con el base SDXL para estilos adicionales, siempre que se gestione el peso del adaptador.
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es exclusivamente un adaptador de generación de imagen.
- Capacidad multilingüe de prompts no documentada; el formato de caption de entrenamiento está en inglés.

## Casos de uso

- Generación de retratos de personaje consistente: usar `korean5 Song Joong-ki, portrait photo, studio lighting` en un pipeline SDXL para obtener retratos fotorrealistas de 1024 px con una identidad estable entre generaciones.
- Prototipado de arte conceptual y storyboards: integrar la LoRA en ComfyUI para producir variaciones de encuadre, vestuario e iluminación de un mismo personaje en flujos de preproducción audiovisual.
- Pruebas de pipelines de difusión en `diffusers`: servir como ejemplo mínimo (0,2 GB) para validar carga de LoRA, pesos y resolución en entornos de desarrollo antes de escalar a adaptadores mayores.
- Generación de material para investigación sobre sesgos y representación: permite estudiar cómo un adaptador de identidad concreta afecta a la diversidad de rostros generados y a la fidelidad del token disparador.
- Fines educativos y demos de fine-tuning: el repositorio documenta hiperparámetros completos (pasos, lr, optimizador, resolución), lo que lo hace útil como caso de estudio reproducible de entrenamiento LoRA en GPU de consumo/cloud gratuita.
- Creación de contenido editorial ilustrativo con licencia permisiva: al ser Apache 2.0, puede incorporarse en productos que requieran un adaptador de personaje con licencia laxa, sujeto a las comprobaciones legales sobre derechos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,2 GB; el requisito real lo marca SDXL Base 1.0, que en fp16 necesita aproximadamente 8-10 GB de VRAM para 1024×1024 con `diffusers` estándar, y menos con optimizaciones (attention slicing, VAE tiling, `torch.compile`).
- GPU recomendadas: A100, H100 o L40S para throughput alto en producción; RTX 4090 (24 GB) para inferencia cómoda a 1024 px.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) sin problemas; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) es viable con fp16 y optimizaciones de memoria; en 6-8 GB requiere cuantización del base o resolución reducida.
- Opciones de despliegue: `diffusers` (Python), ComfyUI, Automatic1111/Forge (convertida a formato compatible), y servidores de inferencia basados en `diffusers` como TGI con soporte de difusión o ComfyUI API. llama.cpp/Ollama no aplican (no es un modelo de lenguaje).
- Latencia y throughput: no disponible; depende de la GPU, de los pasos de muestreo y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-korean5-sdxl-v1 | LoRA de personaje | SDXL Base 1.0 | adaptador dim 16 | 1024 px (bucketed 256-2048) | Apache 2.0 | Hugging Face, 0 descargas |
| Otros adaptadores del set "Korean Top-10" del mismo autor | LoRA de personaje | SDXL Base 1.0 | no disponible | 1024 px | Apache 2.0 (segun repositorio) | Hugging Face (mismo autor) |
| LoRA de personaje genericas de la comunidad SDXL | LoRA de personaje | SDXL Base 1.0 | variable (dim 4-128) | 1024 px | variable (muchas CC-BY-NC) | Hugging Face / Civitai |
| Stable Diffusion XL Base 1.0 | Modelo base | — | ~2.6B UNet + ~817M text encoders | 1024 px | CreativeML Open RAIL++-M | Hugging Face |

No se dispone de datos de rendimiento comparativo (similitud facial, FID) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenada con solo 30 imágenes y 1500 pasos: la fidelidad de identidad puede degradarse en poses extremas, ángulos poco representados o escenas muy cargadas.
- Riesgo de sobreajuste al caption uniforme (`a photo of korean5 person`): puede requerir el token exacto y responder peor a descripciones alternativas.
- Riesgo de alucinación visual: el modelo puede generar rasgos faciales inconsistentes o mezclar la identidad con otras personas, especialmente con pesos de LoRA altos.
- Sesgos conocidos: el dataset reducido de una única persona puede introducir sesgos de iluminación, edad, género y etnia en las generaciones.
- Limitaciones de idioma: no se documenta soporte multilingüe de prompts; el formato de entrenamiento está en inglés.
- Restricciones legales: aunque la licencia es Apache 2.0, la generación de la imagen de una persona real plantea cuestiones de derechos de imagen y publicidad que deben evaluarse por separado; Apache 2.0 no concede derechos sobre el rostro representado.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, sin validación externa; conviene evaluar la calidad y la estabilidad de la identidad antes de usarlo en flujos comerciales.
- El adaptador solo afecta al UNet; los text encoders de SDXL no se han ajustado, por lo que el control semántico fino depende del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-korean5-sdxl-v1
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Herramienta de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Librería diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
