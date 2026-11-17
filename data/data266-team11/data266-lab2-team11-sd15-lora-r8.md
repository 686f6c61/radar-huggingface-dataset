# data266-team11/data266-lab2-team11-sd15-lora-r8

## Resumen

El modelo `data266-lab2-team11-sd15-lora-r8` es un adaptador LoRA de rango 8 y alpha 16 disenado para el UNet de Stable Diffusion 1.5. Lo desarrolla el equipo 11 del curso DATA 266 en el contexto de un laboratorio academico (Lab 2, Parte 2), y su proposito es especializar el modelo base en la generacion de imagenes con el estilo visual del conjunto de datos Naruto BLIP-captions. No es un modelo de lenguaje: es un adaptador de difusion texto-a-imagen que se aplica sobre los pesos de SD 1.5.

El adaptador se entrena sobre 1.099 imagenes de 512x512 con captions automaticos generados por BLIP, y modifica exclusivamente las proyecciones de atencion del UNet (`to_q`, `to_k`, `to_v`, `to_out.0`). Con 1.594.368 parametros entrenables (0,1852% del UNet), el coste de entrenamiento es muy bajo: 0,2837 GPU-horas y un pico de 6,018 GB de memoria en una NVIDIA A40. El checkpoint exportado corresponde al paso 1200, seleccionado por menor perdida de validacion (0,06098).

Su relevancia es fundamentalmente pedagogica y de investigacion: demuestra un flujo completo de fine-tuning con LoRA sobre difusion, con evaluacion cuantitativa (KID, CLIP score, diversidad LPIPS) frente al modelo base. Los resultados muestran una mejora sustancial en la adaptacion al dominio (KID 0,0285 frente a 0,15218 del base) a costa de una ligera perdida de alineacion prompt-imagen (CLIP 26,368 frente a 28,33). La licencia del dataset (CC-BY-NC-SA 4.0) restringe el uso a investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 1.594.368 parametros entrenables en el adaptador (0,1852% del UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos exportados en safetensors; el pipeline de ejemplo usa float16) |
| Idiomas soportados | no disponible (los captions del dataset estan en ingles) |
| Licencia | CreativeML Open RAIL-M (heredada de SD 1.5); uso solo para investigacion por la licencia del dataset |
| Formato de pesos | safetensors (adaptador en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 16 aplicado a las capas de atencion del UNet de Stable Diffusion 1.5, concretamente a las proyecciones `to_q`, `to_k`, `to_v` y `to_out.0`. No se modifica el text encoder ni el VAE; toda la adaptacion ocurre en el UNet. El entrenamiento usa el dataset `lambdalabs/naruto-blip-captions` (1.221 imagenes, 0 corruptas y 0 duplicadas eliminadas), con split 90/10 y semilla 266 (1.099 de entrenamiento / 122 de test), recortes centrados a 512x512 y captions automaticos BLIP.

El plan de entrenamiento consta de 2.000 pasos de optimizador con batch 4 y acumulacion 1, dividido en dos etapas: pasos 1-1200 con LR pico 0,0002 y pasos 1201-2000 con LR pico 8e-05 y noise offset 0,05. Se emplea decaimiento coseno con warm-up dentro de cada etapa, ponderacion Min-SNR-gamma, caption dropout, EMA 0,999, autocast bf16 y semilla 266. Se reservaron 55 imagenes de entrenamiento para validacion. El checkpoint exportado es el paso 1200 (pesos crudos, menor perdida de validacion: 0,06098). El pico de memoria GPU fue de 6,018 GB y el coste total de 0,2837 GPU-horas en una NVIDIA A40.

## Capacidades

- Generacion de imagenes texto-a-imagen en el estilo visual del dataset Naruto (paleta y estetica anime).
- Especializacion de dominio sobre SD 1.5: reproduce estilo y paleta del dataset, no identidades de personajes concretos.
- Control de composicion mediante prompts de texto en ingles, con 30 pasos de muestreo DPM-Solver++ y CFG 7,5 en la configuracion evaluada.
- Diversidad entre semillas practicamente identica al modelo base (LPIPS 0,7069 frente a 0,7068).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales mas alla del texto-a-imagen.
- Capacidades multilingues: no documentadas; los captions de entrenamiento estan en ingles.

## Casos de uso

- Investigacion academica sobre fine-tuning de difusion: el adaptador sirve como referencia reproducible de un pipeline LoRA completo (entrenamiento, validacion, evaluacion con KID y CLIP) para cursos y laboratorios.
- Generacion de arte conceptual en estilo anime: util para prototipar ilustraciones con estetica concreta (paleta y trazo del dataset) en fases tempranas de diseno, siempre en entorno de investigacion.
- Experimentos de evaluacion de modelos generativos: permite comparar metricas in-domain (KID, CLIP, LPIPS) frente al modelo base en condiciones controladas (20 prompts fijos, semillas 0 y 1).
- Estudio de sesgos y memorizacion en difusion: el autor reporta una comprobacion de memorizacion mediante imagen de entrenamiento mas cercana por CLIP, lo que facilita analisis de reproduccion de datos.
- Docencia sobre PEFT y adaptadores: el ejemplo de carga con `peft.PeftModel.from_pretrained` sobre el UNet ilustra el flujo de aplicacion de adaptadores sin reentrenar el modelo base.
- Generacion de retratos estilizados: aunque el autor advierte deriva hacia retratos con prompts fuera de dominio, puede usarse para explorar ese comportamiento en estudios de robustez.
- Benchmarking de pipelines de difusion: por su bajo coste (0,28 GPU-horas de entrenamiento) es adecuado para pruebas de infraestructura y comparativas de herramientas (diffusers, PEFT).

## Benchmarks y rendimiento

Evaluacion con 20 prompts fijos y semillas 0/1, DPM-Solver++ a 30 pasos y CFG 7,5:

| Metrica | Adaptador LoRA | Modelo base SD 1.5 |
|---|---|---|
| KID vs imagenes de test (prompts in-domain) | 0,0285 +/- 0,01508 | 0,15218 +/- 0,02259 |
| CLIP score (prompt-imagen) | 26,368 | 28,33 |
| Diversidad LPIPS entre semillas | 0,7069 | 0,7068 |

Nota del autor: el KID es ruidoso con solo 20 imagenes. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso un pico de 6,018 GB en NVIDIA A40, por lo que la inferencia en float16 deberia caber en GPUs consumer con 8 GB o mas.
- GPU recomendadas: NVIDIA A40 (usada en entrenamiento); cualquier GPU con soporte CUDA y al menos 8 GB de VRAM para inferencia en float16.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070 y superiores), aunque el dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `peft.PeftModel` (flujo documentado por el autor); otras opciones como vLLM, llama.cpp u Ollama no aplican (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-team11-sd15-lora-r8 | 1,59 M (adaptador) | no aplica | KID 0,0285 in-domain; CLIP 26,368 | CreativeML Open RAIL-M (investigacion) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | ~860 M (UNet) | no aplica | KID 0,15218 in-domain; CLIP 28,33 | CreativeML Open RAIL-M | Hugging Face, ampliamente usado |
| Otros LoRA de estilo anime sobre SD 1.5 | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos de benchmarks de otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Aprende el estilo y la paleta del dataset, no identidades de personajes: los captions son genericos y no describen personajes concretos.
- Los prompts fuera de dominio derivan hacia retratos.
- Los prompts composicionales con tres o mas personajes a menudo fusionan o cuentan mal los sujetos.
- Entrenado con solo 1.099 imagenes: aparecen poses y fondos repetidos.
- El dataset contiene personajes con copyright; el adaptador es solo para investigacion no comercial.
- Licencia del dataset CC-BY-NC-SA 4.0, incompatible con uso comercial.
- Riesgo de memorizacion: el autor reporta una comprobacion con imagen de entrenamiento mas cercana por CLIP, pero no se detallan los resultados en la model card.
- Las salidas se filtraron con el safety checker de Stable Diffusion; no se documentan sesgos especificos mas alla de los del modelo base.
- El KID se calculo con solo 20 imagenes, por lo que es una metrica ruidosa y poco fiable para conclusiones fuertes.
- El checkpoint exportado (paso 1200) no es el final del entrenamiento (2.000 pasos); se eligio por menor perdida de validacion.

## Enlaces

- Hugging Face: https://huggingface.co/data266-team11/data266-lab2-team11-sd15-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Codigo de entrenamiento: `src/p2/train.py` en el repositorio del equipo (data266-lab2-team11), sin URL publica en la informacion disponible.
