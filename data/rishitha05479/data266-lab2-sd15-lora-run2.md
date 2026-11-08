# Rishitha05479/data266-lab2-sd15-lora-run2

## Resumen

`Rishitha05479/data266-lab2-sd15-lora-run2` es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion 1.5 y publicado en Hugging Face por el usuario Rishitha05479. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un ajuste fino de un modelo de difusion texto-a-imagen orientado a un dominio visual concreto, el estilo de la serie Naruto, a partir del dataset `lambdalabs/naruto-blip-captions`. El repositorio se presenta explicitamente como material de curso (SJSU DATA 266, Lab 2, experimento `run2`) y el propio autor lo marca como "selected final model" del experimento.

El interes tecnico del artefacto es limitado pero representativo: documenta un flujo de entrenamiento LoRA reproducible (rango 32, alpha 32, 6.377.472 parametros entrenables, 4000 pasos, learning rate 1e-4, batch efectivo 4, resolucion 512x512, semilla 266, 2.301 GPU-horas y 4,47 GB de memoria pico) y aporta metricas de evaluacion cuantitativas (KID original 0,01256, KID emparejado 0,01391, CLIP score 0,3041, diversidad LPIPS 0,682). Es relevante ahora no como modelo de produccion sino como ejemplo de bajo coste computacional para adaptar un modelo de difusion a un estilo concreto en una sola GPU de consumo.

La ficha se redacta a partir de la informacion publica del repositorio y de la model card; los datos no presentes se marcan como no disponibles. Conviene subrayar que el tamano del repositorio reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el conteo esta desactualizado, y que el modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5 (UNet con atencion cruzada, VAE y text encoder CLIP) |
| Parametros totales | no disponible (el repositorio solo declara 6.377.472 parametros entrenables del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; resolucion de entrenamiento 512 x 512) |
| Tipos de cuantizacion | no disponible (los adaptadores LoRA se aplican sobre pesos del modelo base; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (las etiquetas de idioma no estan declaradas; las prompts del dataset estan en ingles segun el dataset BLIP captions) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se inyecta en el UNet de Stable Diffusion 1.5 mediante LoRA de rango 32 y alpha 32, lo que da un factor de escala alpha/r = 1. Se entrenaron 6.377.472 parametros durante 4000 pasos con batch size 1 y batch efectivo 4 (acumulacion de gradientes), learning rate 1e-4, resolucion 512 x 512 y semilla 266. El coste reportado es de 2.301 GPU-horas con un pico de memoria de 4,47 GB, lo que es coherente con un entrenamiento en una GPU de consumo con precision mixta y checkpoints de activaciones. No se documenta el optimizador, el scheduler ni el tipo de precision empleados.

El dataset de entrenamiento es `lambdalabs/naruto-blip-captions`, un conjunto pequeno y de dominio unico con pares imagen-texto generados por BLIP. No se indica el numero de imagenes, el numero de tokens vistos ni si hubo aumento de datos, filtrado o deduplicacion. No se documenta RLHF, DPO ni ningun tipo de ajuste por preferencias, algo que no aplica a este tipo de modelo. La innovacion tecnica destacable es la propia economia del enfoque: adaptar un modelo de difusion completo a un estilo con 6,4 millones de parametros entrenables y menos de 5 GB de VRAM pico.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompt, heredada de Stable Diffusion 1.5 y desplazada hacia el dominio visual del dataset de entrenamiento.
- Reproduccion de estilo y apariencia propios del dominio Naruto (personajes, paletas y composiciones presentes en el dataset).
- Control fino del grado de adaptacion mediante el escalado del adaptador LoRA en inferencia (peso del adapter configurable).
- Compatibilidad con las tecnicas habituales del ecosistema Stable Diffusion: img2img, inpainting, prompts negativos, CFG scale y samplers.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un modelo de difusion, no un LLM.
- Capacidades multilingues no documentadas; el dataset de captions esta en ingles y no se reporta evaluacion en otros idiomas.
- No dispone de vision ni audio como entrada; la unica modalidad de entrada es texto.

## Casos de uso

- Prototipado de arte de fan para un proyecto editorial o de videojuego ambientado en el universo Naruto: el adaptador reproduce paletas y disenos del dominio con un coste de entrenamiento de 2,3 GPU-horas, lo que permite iterar variantes de estilo rapidamente.
- Prueba de concepto de personalizacion de modelos de difusion en un curso o taller: el repositorio documenta hiperparametros, metricas y limitaciones, y sirve como plantilla reproducible para entrenar LoRA sobre un dataset propio.
- Generacion de bocetos para direccion de arte: con CFG y peso del LoRA ajustables, el equipo puede generar variantes de estilo y seleccionar las que mejor encajen antes de encargar ilustracion final.
- Investigacion sobre evaluacion de modelos generativos: las metricas KID y CLIP score publicadas, junto con la nota sobre el calculo de KID emparejado con 12 imagenes, permiten discutir la fiabilidad estadistica de muestras pequenas.
- Estudio de sesgos y seguridad en difusion: la model card reporta que algunas imagenes fueron bloqueadas por el safety checker, lo que hace del artefacto un caso util para analizar falsos positivos y sesgos del filtro.
- Base para un ajuste posterior: al ser un adaptador LoRA sobre SD 1.5, puede combinarse o continuar entrenandose con otros adaptadores del mismo modelo base para mezclar estilos, siempre respetando las licencias de cada uno.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| KID original (menor es mejor) | 0,01256 | Calculado por el autor |
| KID emparejado (12 imagenes generadas) | 0,01391 | Mismas combinaciones prompt/semilla para los tres modelos comparados |
| CLIP score | 0,3041 | Alineacion prompt-imagen |
| Diversidad LPIPS | 0,682 | Diversidad entre imagenes generadas |
| Parametros entrenables | 6.377.472 | Adaptador LoRA r=32, alpha=32 |
| GPU-horas de entrenamiento | 2,301 | Pico de 4,47 GB de VRAM |

No se han publicado resultados de benchmarks comparativos con otros modelos de difusion (FID, Inception Score, evaluaciones humanas) en la informacion disponible. La propia model card advierte que el tamano de muestra del KID es pequeno y limita la fuerza de las conclusiones estadisticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos pocos cientos de MB (6,4 millones de parametros en fp16 equivalen a unos 12,7 MB, mas estados y buffers); el grueso del consumo proviene del modelo base SD 1.5.
- SD 1.5 en fp16 requiere aproximadamente 4-5 GB de VRAM para generar a 512 x 512; con CPU offload o fp32 la huella sube.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10G, L4, A100, H100). Cabe en GPUs de consumo de gama media; en GPUs de 4 GB puede requerir offload o resoluciones menores.
- Despliegue: `diffusers` con `PeftModel`/`load_lora_weights`, ComfyUI, Automatic1111, InvokeAI y Forge. Para servir en produccion, un servidor de inferencia tipo TorchServe, Triton o un endpoint propio con `diffusers`; llama.cpp/Ollama no aplican porque el modelo no es un LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, SD 1.5 a 512 x 512 con 20-30 pasos suele generar una imagen en el orden de segundos en GPUs de consumo modernas, pero no hay medicion publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rishitha05479/data266-lab2-sd15-lora-run2` | 6.377.472 entrenables (LoRA r=32) | 512 x 512 | KID 0,01256; CLIP 0,3041; LPIPS 0,682 | creativeml-openrail-m | Hugging Face, 0 descargas |
| `SushmaMaddali/data266-pokemon-sd15-lora-r32` | no disponible | 512 x 512 (base SD 1.5) | no disponible | other | Hugging Face |
| `SushmaMaddali/data266-pokemon-sd15-lora-r8` | no disponible | 512 x 512 (base SD 1.5) | no disponible | other | Hugging Face |
| Stable Diffusion 1.5 (base) | ~860 M (UNet) | 512 x 512 | no disponible en esta ficha | creativeml-openrail-m | Amplia disponibilidad |

Los dos adaptadores de Pokemon listados en la busqueda web son del mismo curso (DATA 266) y del mismo modelo base, con rangos 32 y 8 respectivamente, pero no publican metricas comparables en la informacion disponible. La comparacion con el modelo base no puede cuantificarse sin datos de KID/CLIP del SD 1.5 original en el mismo protocolo.

## Limitaciones y advertencias

- El dataset es pequeno y de un unico dominio (Naruto); el ajuste fino mejora la apariencia del dominio pero puede reducir la adherencia al prompt, especialmente en prompts fuera de dominio y composicionales.
- Riesgo de alucinacion visual: el modelo puede generar anatomias incorrectas, texto ilegible y composiciones incoherentes, como es habitual en difusion de 512 x 512.
- Algunas imagenes generadas fueron bloqueadas por el safety checker y se excluyeron de las metricas de calidad, lo que puede sesgar las cifras publicadas.
- El tamano de muestra del KID es pequeno (12 imagenes para el KID emparejado) y limita la significancia estadistica de las conclusiones.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibiciones de uso danino y obligacion de propagar las restricciones a los derivados); el autor anade que los usuarios deben respetar derechos de terceros y copyright aplicable, lo que es especialmente relevante dado el dominio tematico.
- No se documentan sesgos demograficos ni evaluaciones de seguridad mas alla del filtro del safety checker.
- Idiomas no declarados: el comportamiento con prompts en castellano no esta evaluado y puede degradarse respecto al ingles.
- Repositorio con 0 descargas, 0 likes y 0,0 GB reportados: verificar la presencia real de los pesos antes de integrarlo en cualquier pipeline.
- Uso previsto declarado: investigacion y educacion; no hay evidencia de validacion para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rishitha05479/data266-lab2-sd15-lora-run2
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Adaptador comparable del mismo curso (Pokemon, r=32): https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r32
- Adaptador comparable del mismo curso (Pokemon, r=8): https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r8
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
