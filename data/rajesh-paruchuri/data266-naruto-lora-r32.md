# Rajesh-Paruchuri/data266-naruto-lora-r32

## Resumen

data266-naruto-lora-r32 es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion v1.5 para la generacion de imagenes de estilo Naruto a partir de texto. Lo desarrolla Rajesh-Paruchuri en el contexto de la asignatura DATA 266 (Lab 2, Part 2, equipo 06), y se presenta como la ejecucion final seleccionada de un ejercicio academico de ajuste fino con `diffusers`.

El modelo no es un modelo base autonomo: es un conjunto de pesos de adaptacion de aproximadamente 6,4 millones de parametros entrenables que se cargan sobre el UNet de Stable Diffusion v1.5 mediante `load_lora_weights`. Su proposito es especializar un modelo text-to-image generico en el dominio visual del dataset `lambdalabs/naruto-blip-captions`, mejorando de forma marcada la fidelidad al dominio (KID in-domain de 0,0405 frente a 0,1411 del modelo base) a costa de una ligera perdida de alineacion texto-imagen medida con CLIP score (30,65 frente a 32,37).

Es relevante ahora unicamente como referencia metodologica reproducible: documenta de forma completa hiperparametros, coste de computo (0,949 GPU-h en una Tesla T4) y evaluacion cuantitativa, lo que lo convierte en un ejemplo didactico de ajuste fino de bajo coste. No obstante, su utilidad practica esta muy acotada por el tamano del dataset (1099 imagenes de entrenamiento), la ausencia de benchmarks estandar y una licencia que restringe el uso a investigacion y educacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion v1.5; pipeline text-to-image con VAE y text encoder congelados |
| Parametros totales | 6.377.472 parametros entrenables (adaptador LoRA); el modelo base SD v1.5 no se incluye en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; la entrada es un prompt de texto, con el limite del text encoder CLIP de SD v1.5) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (uso no comercial, solo investigacion y educacion; el modelo base se rige por CreativeML OpenRAIL-M) |
| Formato de pesos | no disponible en la informacion proporcionada (repositorio diffusers; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 32 sobre las capas de atencion del UNet de Stable Diffusion v1.5, entrenado con el script `train_text_to_image_lora.py` de diffusers v0.31.0. El text encoder y el VAE permanecen congelados; solo se optimizan las matrices de bajo rango del UNet, lo que explica el reducido numero de parametros entrenables (6.377.472) y el bajo coste de entrenamiento.

Los datos provienen de `lambdalabs/naruto-blip-captions`: 1221 imagenes tras eliminar 0 corruptas y 0 duplicadas, con particion 90/10 (semilla 266) de 1099 imagenes de entrenamiento y 122 de test, a resolucion 512x512. El entrenamiento uso learning rate 0,0001, 1500 pasos, batch efectivo de 4, precision fp16, un pico de memoria de 4,35 GiB y un tiempo total de 57,0 minutos (0,949 GPU-h) en una Tesla T4. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion text-to-image especializada en el dominio visual del dataset Naruto (personajes y estetica de la serie).
- Ajuste fino parametrizado eficiente: se carga como adaptador sobre SD v1.5 sin duplicar los pesos del modelo base.
- Composicion con el pipeline estandar de diffusers (`StableDiffusionPipeline` + `load_lora_weights`).
- Control de generacion mediante los parametros habituales del sampler (documentado con DPM-Solver++ a 30 pasos y CFG 7.5).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el prompt se procesa con el text encoder CLIP de SD v1.5, sin datos especificos de cobertura idiomatica para este adaptador.

## Casos de uso

- Docencia y practicas de ajuste fino: sirve como referencia reproducible de un pipeline LoRA completo (dataset, hiperparametros, metrica KID/CLIP y coste en GPU) para cursos de generacion de imagenes.
- Investigacion sobre evaluacion de adaptadores: permite estudiar el compromiso entre fidelidad al dominio (KID) y alineacion texto-imagen (CLIP score) en adaptadores de bajo rango.
- Generacion de ilustraciones de fan art con fines no comerciales: el adaptador produce imagenes del dominio Naruto a partir de prompts, adecuado para experimentacion personal o educativa.
- Pruebas de integracion con diffusers: util para validar flujos de carga de pesos LoRA, composicion de adaptadores y configuracion de samplers en entornos de desarrollo.
- Comparacion de estrategias de bajo rango: al estar documentado el rango 32 y los pasos de entrenamiento, sirve como punto de partida para experimentos con otros rangos o tamanos de dataset.
- Demostraciones de bajo coste computacional: su entrenamiento en una sola T4 en menos de una hora lo hace apto para talleres donde el presupuesto de GPU es limitado.

## Benchmarks y rendimiento

Evaluacion sobre 20 prompts fijos x 2 semillas, con DPM-Solver++ a 30 pasos y CFG 7.5:

| Modelo | KID (in-domain) ↓ | CLIP score ↑ | LPIPS diversity |
|---|---|---|---|
| base (SD v1.5) | 0,1411 | 32,37 | 0,786 |
| este modelo | 0,0405 | 30,65 | 0,789 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un adaptador text-to-image.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento requirio un pico de 4,35 GiB en fp16, por lo que la inferencia con SD v1.5 + LoRA en fp16 deberia situarse en un orden similar (no confirmado en la informacion).
- GPU recomendadas: no disponibles; el unico dato documentado es el entrenamiento en una Tesla T4.
- Cabe en GPU de consumo: no confirmado en la informacion proporcionada.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (unico metodo documentado). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles; solo se documenta el tiempo de entrenamiento (57,0 min, 0,949 GPU-h).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-naruto-lora-r32 | 6.377.472 (adaptador LoRA) | no aplica | KID 0,0405; CLIP 30,65 (in-domain) | other (no comercial) | Hugging Face, 0 descargas |
| Stable Diffusion v1.5 (base) | no disponible en la informacion | no aplica | KID 0,1411; CLIP 32,37 (in-domain) | CreativeML OpenRAIL-M | ampliamente disponible |
| Otros adaptadores LoRA de SD v1.5 | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos de otros adaptadores comparables en la informacion proporcionada para establecer una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy reducido (1099 imagenes), lo que limita la diversidad y generalizacion del adaptador fuera del dominio Naruto.
- Riesgo de sobreajuste al dominio: la mejora en KID va acompanada de una caida del CLIP score (30,65 frente a 32,37), lo que sugiere menor alineacion con prompts genericos.
- Sesgos conocidos: no documentados en la model card (la seccion de limitaciones figura como "TODO").
- Riesgo de alucinacion visual y artefactos propios de SD v1.5, no evaluado especificamente para este adaptador.
- Limitaciones de idioma y contexto: no disponibles.
- Restriccion de licencia: las imagenes de entrenamiento representan personajes con derechos de autor (Naruto); el adaptador se libera solo para investigacion y educacion no comercial. El uso comercial esta prohibido por los terminos indicados.
- El modelo base se rige por CreativeML OpenRAIL-M, cuyas condiciones adicionales deben respetarse.
- Repositorio con 0 descargas y 0 likes, sin validacion externa de la comunidad; tratar como artefacto academico no auditado.
- No se documentan formatos de pesos ni variantes cuantizadas, lo que dificulta su despliegue fuera de diffusers.

## Enlaces

- Hugging Face: https://huggingface.co/Rajesh-Paruchuri/data266-naruto-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Script de entrenamiento (diffusers): https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
