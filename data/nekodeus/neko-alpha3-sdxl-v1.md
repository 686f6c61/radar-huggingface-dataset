# Nekodeus/neko-alpha3-sdxl-v1

## Resumen

Neko Alpha3 SDXL v1 es un adaptador LoRA de tipo personaje entrenado sobre Stable Diffusion XL Base 1.0, publicado por el usuario Nekodeus bajo licencia Apache 2.0. Su función concreta es reproducir el rostro y la apariencia de Ryan Gosling en generaciones texto-a-imagen a 1024 px, activando el concepto mediante el token disparador `alpha3`. El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors compatibles con la librería diffusers y con ComfyUI.

Técnicamente no es un modelo fundacional sino un adaptador de bajo rango: dim de red 8 y alpha 8, entrenado durante 1500 pasos con AdamW de 8 bits, batch 2 y learning rate 1e-4 sobre una NVIDIA P100 de Kaggle. El dataset consta de aproximadamente 100 imágenes de Ryan Gosling verificadas facialmente con OpenCV y etiquetadas con una caption uniforme (`a photo of alpha3 person`), publicado como `nekodeus/alpha3-ryan-gosling`.

Su relevancia es acotada: se trata de un LoRA de personaje de nicho, con 17 descargas y 0 likes en el momento de la consulta, útil para experimentación con identidad facial en SDXL y como ejemplo reproducible de un pipeline de entrenamiento LoRA ligero y offline. No aporta capacidades nuevas de razonamiento ni de lenguaje; hereda todas las limitaciones y sesgos del modelo base SDXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL Base 1.0 (UNet + doble text encoder CLIP) |
| Parametros totales | no disponible (adaptador LoRA con dim de red 8 y alpha 8; el recuento exacto de parametros no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la longitud de prompt efectiva la fija el tokenizer CLIP de SDXL) |
| Tipos de cuantizacion | no disponible de forma explícita; los pesos se distribuyen en safetensors y el ejemplo oficial usa `torch_dtype=torch.float16` |
| Idiomas soportados | no disponible (el prompt se procesa con los text encoders de SDXL; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`alpha3.safetensors`) |
| Resolucion de entrenamiento | 1024 px |
| Pasos de entrenamiento | 1500 |
| Learning rate | 1e-4 |
| Optimizador | AdamW 8-bit, batch 2 |
| Hardware de entrenamiento | NVIDIA P100 (Kaggle) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Token disparador | `alpha3` |

## Arquitectura y entrenamiento

El adaptador se inyecta en las capas de atención del UNet de SDXL mediante descomposición de bajo rango con dimensión 8 y alpha 8, lo que da un ratio de escalado de 1,0. El entrenamiento se realizó a resolución 1024, durante 1500 pasos, con AdamW de 8 bits, batch 2, learning rate 1e-4 y xformers, sobre una única NVIDIA P100 en Kaggle, en modalidad completamente offline y sin tokens de autenticación. No se documenta el uso de técnicas adicionales como decodificación especulativa, atención lineal o RLHF/DPO; el pipeline es un fine-tuning LoRA supervisado estándar sobre pares imagen-caption.

El dataset comprende unas 100 imágenes de Ryan Gosling filtradas mediante verificación facial con OpenCV y etiquetadas con una caption uniforme y mínima (`a photo of alpha3 person`), lo que reduce la variabilidad textual y concentra el aprendizaje en la identidad facial. El dataset está publicado como `nekodeus/alpha3-ryan-gosling`. El autor indica que este adaptador forma parte de la serie "Hollywood alpha", con variantes equivalentes para SD1.5 (`Nekodeus/neko-hollywood-alpha-sd15-v1`) y SDXL (`Nekodeus/neko-hollywood-alpha-sdxl-v1`).

## Capacidades

- Generación texto-a-imagen condicionada por prompt, heredando las capacidades del SDXL Base 1.0.
- Reproducción de identidad facial de Ryan Gosling al incluir el token `alpha3` en el prompt.
- Composición con otros LoRA y con estilos del modelo base, al ser un adaptador independiente y cargable dinámicamente.
- Integración con diffusers mediante `load_lora_weights` y con ComfyUI mediante nodo LoRA Loader.
- Control de la intensidad del efecto mediante el peso del adaptador en la inferencia (no documentado por el autor, pero soportado por el formato LoRA).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking: es exclusivamente un modelo de difusión texto-a-imagen.
- Capacidades multilingües: no declaradas; dependen de los text encoders de SDXL.

## Casos de uso

- Generación de retratos fotorrealistas de personaje: usar el prompt `alpha3 Ryan Gosling, portrait photo, studio lighting` a 1024x1024 para obtener retratos consistentes con la identidad entrenada, aprovechando que el adaptador se entrenó específicamente a esa resolución.
- Pruebas de concepto en pipelines de difusión: cargar el LoRA sobre SDXL Base en diffusers para validar flujos de trabajo de generación condicionada antes de escalar a adaptadores propios.
- Composición de escenas con múltiples LoRA en ComfyUI: colocar `alpha3.safetensors` en `models/loras/`, añadir un nodo LoRA Loader y combinarlo con LoRA de estilo para explorar mezclas de identidad y estética.
- Investigación sobre sesgos de identidad en modelos generativos: al ser un adaptador de personaje con dataset pequeño y caption uniforme, sirve como caso de estudio de cómo un conjunto reducido de imágenes moldea la representación facial.
- Docencia y demostraciones de fine-tuning LoRA: el pipeline completo (dataset verificado con OpenCV, caption stub, 1500 pasos en P100 de Kaggle) es reproducible y adecuado para explicar el entrenamiento de adaptadores de bajo rango.
- Generación de material de referencia para previsualización de personajes: creación de variaciones de iluminación y encuadre sobre una misma identidad para tableros de concepto, siempre que el uso comercial respete la licencia Apache 2.0 y la normativa aplicable sobre imagen de personas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 0,2 GB y se suma a los requisitos de SDXL Base 1.0 en fp16, que típicamente rondan 8-10 GB en función del pipeline y de las optimizaciones aplicadas.
- GPU recomendadas: el autor entrenó en una NVIDIA P100 (Kaggle); para inferencia se puede usar cualquier GPU compatible con SDXL en fp16.
- Cabe en GPU de consumo: sí, siempre que se disponga de VRAM suficiente para SDXL Base en fp16; el adaptador en sí añade una huella mínima.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI (nodo LoRA Loader). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha3-sdxl-v1 | LoRA de personaje | SDXL Base 1.0 | dim 8 / alpha 8 (recuento no publicado) | no aplica | Apache 2.0 | Hugging Face, 17 descargas |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie Hollywood) | SDXL | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie Hollywood) | SD1.5 | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base texto-a-imagen | — | no disponible en la informacion | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de métricas objetivas para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset de ~100 imágenes de una única persona, el adaptador puede sobrerrepresentar rasgos concretos y fallar en variaciones de edad, etnia o iluminación no presentes en el conjunto.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes o artefactos anatómicos, especialmente fuera de la resolución de entrenamiento (1024 px) o con pesos de LoRA elevados.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados; el comportamiento multilingüe depende de los text encoders de SDXL y no ha sido evaluado por el autor.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial debe evaluarse también respecto a la licencia del modelo base SDXL y a la normativa sobre derechos de imagen de personas reales, que no queda cubierta por la licencia del adaptador.
- Caveat para producción: con 17 descargas y 0 likes, no hay evidencia de validación comunitaria; la caption uniforme (`a photo of alpha3 person`) limita la capacidad de control fino sobre pose, vestuario o expresión.
- El token disparador `alpha3` es obligatorio para activar la identidad; sin él, el adaptador no aporta el efecto esperado.
- El recuento exacto de parámetros del adaptador y los requisitos de VRAM no están publicados, lo que dificulta el dimensionamiento previo en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-alpha3-sdxl-v1
- Dataset de entrenamiento: https://huggingface.co/nekodeus/alpha3-ryan-gosling
- Variante SD1.5 de la serie: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Variante SDXL de la serie: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
