# sadaffatimaeee/naruto-sd15-run2-lora-r16

## Resumen

`sadaffatimaeee/naruto-sd15-run2-lora-r16` es un adaptador LoRA de rango 16 para Stable Diffusion 1.5, entrenado para generar imagenes con estilo anime inspirado en la serie Naruto. Lo desarrolla el usuario `sadaffatimaeee` en el contexto de la asignatura DATA 266 Lab 2 (Part 2), como trabajo de un equipo de programacion por parejas (Pair_Programming_Team_16). No es un modelo de lenguaje, sino un adaptador de difusion texto-a-imagen que se aplica sobre el checkpoint base `stable-diffusion-v1-5/stable-diffusion-v1-5` a 512x512.

El adaptador modifica unicamente las capas de atencion del UNet; el codificador de texto permanece congelado. Se entrena sobre el dataset `lambdalabs/naruto-blip-captions`, reducido a 1221 imagenes con caption tras la limpieza y dividido 90/10 (1099 de entrenamiento, 122 de test). El entrenamiento usa el script oficial de `diffusers` `train_text_to_image_lora.py`, con 3.188.736 parametros entrenables y 750 pasos sobre una unica Tesla T4.

Su relevancia es limitada y de caracter docente: el repositorio no tiene descargas ni likes, el tamano declarado es de 0.0 GB y la licencia es "other" con restriccion explicita a uso no comercial e investigacion/ensenanza. Sirve como ejemplo reproducible de fine-tuning LoRA de bajo coste (0.391 GPU-horas) y como caso de estudio de las limitaciones de los adaptadores de estilo con datasets pequenos y captions cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, solo capas de atencion del UNet; text encoder congelado) |
| Parametros totales | No disponible (adaptador LoRA de 3.188.736 parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen; captions de aproximadamente 9 palabras) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (captions en ingles segun el dataset BLIP) |
| Licencia | other (uso no comercial, solo investigacion y ensenanza) |
| Formato de pesos | Pesos LoRA para `diffusers` (formato exacto no disponible) |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` (512x512) |
| Rango LoRA | 16 |
| Dataset de entrenamiento | `lambdalabs/naruto-blip-captions`, 1221 imagenes tras limpieza (1099 train / 122 test) |
| Pasos de entrenamiento | 750, batch 1 x 4 acumulacion, fp16, gradient checkpointing, seed 266 |
| Learning rate | 0.0001 constante |
| Hardware de entrenamiento | 1x Tesla T4, pico de 4.3 GB de VRAM, 23.5 min (0.391 GPU-horas) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado exclusivamente a las capas de atencion del UNet de Stable Diffusion 1.5. El codificador de texto no se entrena, de modo que la alineacion texto-imagen depende enteramente del modelo base y el adaptador solo desplaza la distribucion visual hacia el estilo objetivo. El entrenamiento se realizo con `train_text_to_image_lora.py` de `diffusers`, en precision fp16, con checkpointing de gradientes y una tasa de aprendizaje constante de 0.0001 durante 750 pasos con batch efectivo de 4 (1 x 4 de acumulacion).

Los datos proceden de `lambdalabs/naruto-blip-captions`: 1221 imagenes con caption BLIP corta (unas 9 palabras) tras un proceso de limpieza sin imagenes corruptas ni duplicados eliminados, redimensionadas a 512x512 y divididas 90/10 con semilla 266. No se menciona uso de RLHF, DPO ni tecnicas de preferencia; es un fine-tuning supervisado estandar. Como innovacion tecnica no hay ninguna destacable: el valor del trabajo esta en la reproducibilidad y el bajo coste (0.391 GPU-horas en una T4), no en aportaciones arquitectonicas.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 con estilo anime inspirado en Naruto, aplicando el LoRA sobre Stable Diffusion 1.5.
- Especializacion de estilo: el adaptador desplaza la salida del modelo base hacia la estetica del dataset de entrenamiento.
- Generacion condicionada por prompts cortos en ingles, coherente con la longitud de las captions de entrenamiento (aproximadamente 9 palabras).
- Diversidad entre semillas: LPIPS de 0.7851 entre semillas 0 y 1, lo que indica variacion apreciable en la salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo de lenguaje.
- No soporta vision de entrada ni audio; es un modelo generativo de imagen.
- Capacidades multilingues: no disponibles; el entrenamiento usa captions BLIP en ingles.
- Filtro de seguridad NSFW heredado del pipeline de Stable Diffusion.
- Incluye una comprobacion de memorizacion (`memorization.png`) basada en similitud CLIP con la imagen de entrenamiento mas cercana.

## Casos de uso

- Docencia y practicas de fine-tuning: reproduccion del flujo completo de entrenamiento LoRA con `diffusers` en una sola T4, util como material de laboratorio con coste de 0.391 GPU-horas.
- Generacion de ilustraciones de fan art no comerciales: el adaptador produce imagenes de estilo anime coherente con el dataset cuando se le dan prompts cortos y descriptivos en ingles.
- Prototipado rapido de pipelines texto-a-imagen: sirve para validar integraciones de `diffusers` y de adaptadores LoRA antes de invertir en modelos mayores.
- Experimentacion con control de estilo: permite estudiar como un LoRA de rango 16 y 750 pasos desplaza la distribucion del modelo base sin tocar el text encoder.
- Investigacion sobre evaluacion de modelos generativos: los valores de KID, CLIP score y LPIPS publicados permiten reproducir una metodologia de evaluacion con 20 prompts fijos y semillas 0 y 1.
- Analisis de sesgos y memorizacion: el chequeo de memorizacion incluido y las limitaciones declaradas (predominio de personajes masculinos en las captions) lo hacen util para estudiar fuga de datos de entrenamiento y sesgos de genero.
- Estudio de compositionalidad: los fallos documentados en prompts composicionales (colores, posiciones, conteos) sirven como caso de prueba de las limitaciones de los adaptadores de estilo.

## Benchmarks y rendimiento

Resultados declarados por el autor con 20 prompts fijos, semillas 0 y 1, DPM-Solver con 25 pasos y guidance 7.5:

| Metrica | Valor |
|---|---|
| KID vs imagenes de test (prompts in-domain) | 0.0389 +/- 0.008 |
| CLIP score global | 30.899999618530273 |
| CLIP score in-domain | 30.31999969482422 |
| CLIP score out-of-domain | 32.0099983215332 |
| CLIP score composicional | 30.940000534057617 |
| LPIPS de diversidad entre semillas 0 y 1 | 0.7851 |

El autor advierte que el KID es ruidoso con tan pocas imagenes. No se han publicado comparaciones con otros adaptadores ni resultados en benchmarks estandar de generacion (FID, MMLU, HumanEval, GSM8K no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM de entrenamiento observada: pico de 4.3 GB en una Tesla T4 con fp16, batch 1 y acumulacion de 4.
- VRAM de inferencia: no disponible de forma explicita; al aplicar el LoRA sobre Stable Diffusion 1.5 a 512x512, el consumo es el del modelo base mas el adaptador, que anade 3.188.736 parametros.
- GPU de entrenamiento validadas: Tesla T4 (unica GPU documentada).
- GPU consumer: no se documenta una prueba concreta; por el rango de memoria de entrenamiento (4.3 GB) es plausible en GPUs consumer con suficiente VRAM, aunque el autor no lo confirma.
- Opciones de despliegue: `diffusers` (libreria declarada en el repositorio). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. Solo se documenta el tiempo de entrenamiento (23.5 min, 0.391 GPU-horas).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sadaffatimaeee/naruto-sd15-run2-lora-r16` | LoRA sobre SD 1.5 | 3.188.736 entrenables | No aplica | KID 0.0389, CLIP 30.90 | other (no comercial) | HuggingFace, 0 descargas |
| Stable Diffusion 1.5 (base) | Difusion latente | No disponible en la informacion | No aplica | No disponible en la informacion | CreativeML OpenRAIL-M (segun el modelo base referenciado) | Ampliamente disponible |
| Otros LoRA de estilo para SD 1.5 | LoRA | Variable | No aplica | No disponible | Variable | Comunidad |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Estilo anime muy estrecho: el adaptador esta especializado en un unico dominio visual y no generaliza a otros estilos.
- Captions cortas y genericas (aproximadamente 9 palabras) que describen mayoritariamente personajes masculinos, lo que introduce sesgo de genero y de contenido.
- Los prompts composicionales (colores, posiciones, conteos) a menudo no se respetan, segun el propio autor.
- Los prompts fuera de dominio derivan hacia el estilo anime, lo que reduce la fidelidad a la instruccion.
- Riesgo de memorizacion de las imagenes de entrenamiento; el autor incluye `memorization.png` con la comprobacion por similitud CLIP.
- Las imagenes de entrenamiento muestran personajes con derechos de autor de Naruto, por lo que la licencia restringe el uso a investigacion y ensenanza no comercial.
- El filtro de seguridad NSFW de Stable Diffusion se aplica a las imagenes generadas.
- El KID es ruidoso con solo 122 imagenes de test, por lo que las metricas deben interpretarse con cautela.
- El repositorio declara un tamano de 0.0 GB y no tiene descargas ni likes, lo que sugiere que los pesos podrian no estar subidos o ser de muy reducido tamano; conviene verificarlo antes de usarlo en produccion.
- No hay informacion sobre cuantizacion, latencia ni soporte multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sadaffatimaeee/naruto-sd15-run2-lora-r16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Script de entrenamiento: https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py
- Libreria `diffusers`: https://github.com/huggingface/diffusers
