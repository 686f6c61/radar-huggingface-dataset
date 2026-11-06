# sadaffatimaeee/naruto-sd15-run2-lora-r16-smoke-test

## Resumen

`naruto-sd15-run2-lora-r16-smoke-test` es un adaptador LoRA de bajo rango (rank 4) para Stable Diffusion 1.5, entrenado para generar imagenes con estilo anime inspirado en la serie Naruto. Lo publica el usuario `sadaffatimaeee` como parte de un ejercicio academico del curso DATA 266 Lab 2 (Pair_Programming_Team_16), y su nombre indica explicitamente que se trata de una prueba de humo (smoke test) de un pipeline de entrenamiento, no de un modelo destinado a produccion.

El adaptador modifica unicamente las capas de atencion del UNet; el text encoder permanece congelado. Se entreno sobre el dataset `lambdalabs/naruto-blip-captions` (1221 imagenes con leyendas BLIP cortas, ~9 palabras) durante solo 10 pasos de optimizacion, lo que da un total de 797.184 parametros entrenables y 0,018 GPU-horas en una Tesla T4. El resultado es un modelo con capacidad generativa muy limitada, util como referencia pedagogica de como se construye y evalua un LoRA.

Su relevancia actual es, por tanto, metodologica: documenta de forma transparente hiperparametros, metricas (KID, CLIP score, LPIPS) y limitaciones, algo poco habitual en adaptadores de este tipo. No es un modelo recomendable para uso real, y su licencia restringe el uso a investigacion y docencia no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (diffusers); text encoder congelado |
| Parametros totales | 797.184 parametros entrenables (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin contexto de texto autoregresivo) |
| Tipos de cuantizacion | no disponible (pesos LoRA en fp16 durante el entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento estan en ingles) |
| Licencia | other (uso no comercial, solo investigacion y docencia) |
| Formato de pesos | no disponible (repositorio con tamano de 0.0 GB; libreria diffusers, se espera formato de pesos diffusers/safetensors, no confirmado) |

## Arquitectura y entrenamiento

Se trata de un LoRA de rank 4 aplicado exclusivamente a las capas de atencion del UNet de Stable Diffusion 1.5 (resolucion 512x512). El text encoder no se entrena, por lo que la alineacion texto-imagen depende por completo del modelo base. El entrenamiento se realizo con el script `train_text_to_image_lora.py` de diffusers, con learning rate constante de 0,0001, batch efectivo de 4 (1 x 4 acumulacion de gradientes), precision fp16, gradient checkpointing y semilla 266, sobre una unica Tesla T4 con un pico de 4,26 GB de VRAM y 1,1 minutos de tiempo total.

Los datos proceden de `lambdalabs/naruto-blip-captions`: 1221 imagenes con leyendas tras limpieza (0 corruptas, 0 duplicados eliminados), divididas 90/10 con semilla 266 (1099 entrenamiento / 122 test) y redimensionadas a 512x512. Las leyendas son cortas y genericas (unas 9 palabras, generadas con BLIP) y describen mayoritariamente personajes masculinos. El entrenamiento consta de solo 10 pasos, lo que constituye una prueba de humo del pipeline mas que un ajuste real del modelo.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilo anime inspirado en Naruto, a 512x512, sobre Stable Diffusion 1.5.
- Aplicacion de un estilo visual concreto mediante un adaptador ligero (797.184 parametros) que se puede cargar junto al modelo base con diffusers.
- Generacion condicionada por leyendas cortas en ingles, similar a las del dataset de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues documentadas.
- No dispone de modo thinking, vision de entrada ni audio.

## Casos de uso

- Docencia sobre difusion y LoRA: sirve como ejemplo completo y reproducible de un pipeline de entrenamiento con diffusers, con hiperparametros, semillas y metricas documentados, adecuado para explicar que es un adaptador de bajo rango y como se evalua.
- Prueba de humo de infraestructura: permite validar en minutos (1,1 min en una T4) que un entorno de entrenamiento con `train_text_to_image_lora.py`, fp16 y gradient checkpointing funciona antes de lanzar entrenamientos mayores.
- Referencia de evaluacion: sus metricas (KID 0,2083; CLIP score 30,89; LPIPS 0,7109) sirven como linea base para comparar variantes con mas pasos o distinto rank en el mismo dataset.
- Analisis de sesgos y memorizacion: el fichero `memorization.png` y la documentacion sobre leyendas genericas permiten estudiar como un dataset pequeno y desequilibrado (mayoria de personajes masculinos) afecta a la generacion.
- Estudio de compositionalidad: los propios autores documentan que las peticiones composicionales (colores, posiciones, recuentos) no se respetan, lo que lo convierte en un caso de analisis de fallos en difusion condicionada.
- Generacion de imagenes de caracter ilustrativo en entornos de investigacion no comercial, siempre que se acepten sus limitaciones de calidad y estilo.

## Benchmarks y rendimiento

Evaluacion con 20 prompts fijos y semillas 0 y 1, DPM-Solver con 25 pasos y guidance 7.5, segun la model card:

| Metrica | Valor |
|---|---|
| KID frente a imagenes de test (prompts in-domain) | 0,2083 +/- 0,0517 |
| CLIP score global | 30,89 |
| CLIP score in-domain | 31,54 |
| CLIP score out-of-domain | 30,23 |
| CLIP score compositional | no disponible |
| LPIPS de diversidad entre semillas | 0,7109 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo text-to-image. Los autores advierten que el KID es ruidoso con tan pocas imagenes.

## Requisitos de hardware

- VRAM de entrenamiento documentada: 4,26 GB de pico en una Tesla T4 con fp16, batch 1 y acumulacion de 4.
- VRAM de inferencia: no disponible de forma explicita; al ser un LoRA sobre SD 1.5, se suma al modelo base (que ocupa del orden de varios GB en fp16), por lo que cabe en GPU de consumo con suficiente memoria para SD 1.5.
- GPU recomendadas: Tesla T4 (validada para entrenamiento); para inferencia, cualquier GPU capaz de ejecutar Stable Diffusion 1.5.
- Cabe en GPU de consumo: si, siempre que la GPU pueda ejecutar SD 1.5 (no se especifica modelo concreto).
- Opciones de despliegue: diffusers (libreria declarada); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El unico dato temporal es el entrenamiento: 1,1 minutos, 0,018 GPU-horas.

## Comparativa con modelos similares

| Modelo | Parametros del adaptador | Modelo base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naruto-sd15-run2-lora-r16-smoke-test | 797.184 entrenables (LoRA rank 4) | Stable Diffusion 1.5 | no aplica | other (no comercial) | Hugging Face, 0 descargas |
| LoRA de estilo anime sobre SD 1.5 entrenado con mas pasos | no disponible | Stable Diffusion 1.5 | no aplica | variable | no disponible |
| Adaptadores de estilo para SDXL | no disponible | Stable Diffusion XL | no aplica | variable | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada, por lo que la comparacion de rendimiento no esta disponible.

## Limitaciones y advertencias

- Estilo anime muy estrecho: el adaptador solo reproduce el estilo del dataset de Naruto y no generaliza a otros estilos.
- Entrenamiento minimo: solo 10 pasos de optimizacion, por lo que la calidad es propia de una prueba de humo y no de un modelo afinado.
- Leyendas cortas y genericas (~9 palabras) que describen mayoritariamente personajes masculinos, lo que introduce sesgo de genero y de contenido.
- Los prompts composicionales (colores, posiciones, recuentos) a menudo no se respetan.
- Los prompts fuera de dominio derivan hacia el estilo anime, lo que reduce el control del usuario.
- Riesgo de memorizacion del dataset de entrenamiento; los autores incluyen una comprobacion en `memorization.png`.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir contenido no solicitado o incoherente, especialmente con prompts alejados del dominio.
- Licencia restrictiva: las imagenes de entrenamiento muestran personajes con derechos de autor de Naruto, por lo que el adaptador es solo para investigacion y docencia no comercial.
- Filtro NSFW: las imagenes generadas pasan por el safety checker de Stable Diffusion.
- Repositorio de 0.0 GB y sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Idiomas soportados no documentados; las leyendas de entrenamiento estan en ingles.

## Enlaces

- Hugging Face: https://huggingface.co/sadaffatimaeee/naruto-sd15-run2-lora-r16-smoke-test
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Script de entrenamiento (diffusers): https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion: https://arxiv.org/abs/2112.10752
