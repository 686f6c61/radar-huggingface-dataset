# PratikshaK-1/naruto-sd15-lora-r32

## Resumen

El modelo `PratikshaK-1/naruto-sd15-lora-r32` es un adaptador LoRA de rango 32 entrenado sobre el UNet de Stable Diffusion 1.5 para generar imagenes con estilo inspirado en el anime Naruto. Lo desarrolla el usuario PratikshaK-1 como parte de un trabajo academico (identificado como "DATA 266 Lab 2, Part 2") y se publica en Hugging Face bajo licencia CreativeML OpenRAIL-M. No es un modelo de lenguaje: es un adaptador de difusion texto-a-imagen de aproximadamente 6,38 millones de parametros entrenables que se carga sobre los pesos base de SD 1.5.

El problema que resuelve es la especializacion estilistica: en lugar de reentrenar un modelo completo, el LoRA modifica solo las capas de atencion (q, k, v y out) del UNet para desplazar la distribucion de salida hacia la estetica del dataset `lambdalabs/naruto-blip-captions`. Es relevante como ejemplo de flujo de trabajo de ajuste fino eficiente: entrenamiento en una sola Tesla T4 durante 1,372 GPU-horas con un pico de memoria de 3,61 GB, lo que lo hace reproducible en hardware de consumo.

La ficha tecnica es deliberadamente limitada porque el autor no publica informacion sobre idiomas, formatos alternativos de pesos ni resultados de benchmarks estandar. La evaluacion disponible se restringe a metricas generativas (KID, CLIP score, LPIPS) sobre una muestra muy pequena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5 |
| Parametros totales | 6.377.472 parametros entrenables (adaptador); pesos base de SD 1.5 aparte |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, sin contexto de texto extenso) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en el formato nativo de diffusers) |
| Idiomas soportados | no disponible (los prompts de entrenamiento estan en ingles, generados por BLIP) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | pesos de adaptador LoRA compatibles con `diffusers` (`load_lora_weights`) |
| Rango del LoRA | 32 |
| Capas adaptadas | atencion del UNet: q, k, v, out |
| Resolucion de entrenamiento | 512 px |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Dataset | lambdalabs/naruto-blip-captions (859 imagenes limpias, split 90/10, seed 266) |
| Tamano del repo | 0,0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

El adaptador se inserta en las capas de atencion del UNet de Stable Diffusion 1.5 (consultas, claves, valores y proyeccion de salida) con rango 32, lo que da lugar a 6.377.472 parametros entrenables. El entrenamiento uso 3000 pasos con tamano de lote 4, tasa de aprendizaje 0,0001 con scheduler coseno y 100 pasos de calentamiento, a resolucion 512. Se ejecuto en una Tesla T4 con un pico de memoria de 3,61 GB y un coste total de 1,372 GPU-horas.

El dataset de partida es `lambdalabs/naruto-blip-captions`, del que se seleccionaron 859 imagenes tras un proceso de limpieza; las imagenes se filtraron con el safety checker de SD (239 descartadas). Las leyendas son generadas automaticamente por BLIP, lo que implica un sesgo hacia descripciones genericas. El autor declara haber realizado una comprobacion de memorizacion mediante vecinos mas cercanos con CLIP, sin encontrar indicios de que las generaciones se acerquen mas al conjunto de entrenamiento que las imagenes de test no vistas. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un adaptador de difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica inspirada en el universo Naruto, sobre la base de SD 1.5.
- Control estilistico mediante prompts en ingles (las leyendas de entrenamiento son BLIP en ingles).
- Integracion directa con el ecosistema `diffusers` mediante `load_lora_weights`.
- Compatibilidad con schedulers de difusion estandar; la evaluacion publicada usa DPMSolverMultistepScheduler con 30 pasos y CFG 7,5.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision de entrada ni audio.
- Capacidad multilingue de prompts: no disponible; el entrenamiento se limita a leyendas BLIP en ingles.

## Casos de uso

- Generacion de ilustraciones de fan art: el adaptador desplaza el estilo de SD 1.5 hacia la estetica del anime de referencia, util para prototipar ilustraciones de personajes con un solo prompt en ingles.
- Creacion de assets para proyectos de investigacion sobre difusion: sirve como caso de estudio reproducible de ajuste fino con LoRA de rango 32 en hardware de gama media (T4, 3,61 GB de pico).
- Experimentos academicos de evaluacion generativa: el autor publica metricas KID, CLIP score y LPIPS que permiten replicar la comparacion base frente a adaptador.
- Docencia y practicas de fine-tuning: el bajo coste (1,372 GPU-horas) y el uso de un dataset publico lo hacen adecuado para laboratorios donde se ensena a entrenar adaptadores LoRA.
- Pruebas de pipelines de generacion con `diffusers`: util para validar integraciones de carga de LoRA, schedulers y resolucion 512 en entornos de CI.
- Investigacion sobre memorizacion en modelos de difusion: el autor incluye una comprobacion de vecinos mas cercanos con CLIP que puede reutilizarse como metodologia.
- Generacion de variaciones estilisticas controladas: combinable con otros LoRA o con el modelo base para explorar mezclas de estilo, siempre que se respete la licencia.

## Benchmarks y rendimiento

Evaluacion publicada por el autor con DPMSolverMultistepScheduler, 30 pasos, CFG 7,5, semillas 0 y 1:

| Metrica | Base (SD 1.5) | Este modelo |
|---|---|---|
| KID in-domain (menor es mejor) | 0,1337 | 0,0217 |
| CLIP score (20 prompts) | 31,54 | 29,84 |
| LPIPS diversidad | 0,808 | 0,749 |
| Tasa de victoria humana vs base (estilo / prompt) | - | - / - |

El propio autor advierte que el KID se calcula con solo 20 imagenes generadas, por lo que es ruidoso. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo texto-a-imagen. La tasa de victoria humana no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade una sobrecarga minima; el modelo base SD 1.5 en `float16` requiere aproximadamente 4-6 GB de VRAM para generar a 512 px con lotes pequenos.
- GPU recomendadas: Tesla T4 (usada en el entrenamiento), RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 para lotes mayores o mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en `float16`; con 8 GB se pueden usar lotes de 2-4 imagenes.
- Opciones de despliegue: `diffusers` (via `StableDiffusionPipeline` + `load_lora_weights`), Automatic1111 WebUI, ComfyUI y cualquier runtime que soporte LoRA de SD 1.5. No se documenta soporte nativo en llama.cpp, Ollama, vLLM ni TGI, que no estan orientados a difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del scheduler, numero de pasos (30 en la evaluacion) y GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naruto-sd15-lora-r32 | LoRA sobre SD 1.5 | 6,38 M entrenables (rango 32) | no aplica | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| SD 1.5 base | UNet de difusion completo | ~860 M | no aplica | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRA de estilo sobre SD 1.5 | Adaptadores LoRA | variable (tipicamente 2-10 M) | no aplica | variable | Comunidad Hugging Face / Civitai |
| SDXL | UNet de difusion | ~2,6 B (UNet) + refiner | no aplica | CreativeML OpenRAIL++-M | Ampliamente disponible |

No se dispone de comparativas cuantitativas con otros LoRA de estilo Naruto en la informacion proporcionada; los datos de rendimiento solo permiten comparar contra el modelo base SD 1.5.

## Limitaciones y advertencias

- Las leyendas de entrenamiento son generadas por BLIP y genericas; el seguimiento de prompts fuera de dominio y con multiples personajes es debil, segun el propio autor.
- El CLIP score empeora respecto al base (29,84 frente a 31,54), lo que sugiere una menor fidelidad semantica al prompt a cambio de estilo.
- La diversidad medida con LPIPS baja de 0,808 a 0,749, indicando menor variabilidad entre generaciones.
- El KID se calcula con solo 20 imagenes, por lo que la mejora reportada (0,0217 frente a 0,1337) debe interpretarse con cautela.
- La licencia del dataset no esta declarada en su model card; las imagenes provienen de narutopedia.com y Naruto es material con copyright, por lo que el uso se restringe a investigacion no comercial.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos y de generar contenido ilegal o de acoso); conviene revisar sus terminos antes de un despliegue comercial.
- Riesgo de sesgos y alucinacion visual: al ser un adaptador de difusion, puede generar anatomias incorrectas, texto ilegible y atributos inconsistentes, especialmente con prompts complejos.
- No hay informacion sobre idiomas soportados distintos del ingles; los prompts en castellano pueden degradar la calidad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.
- No se documentan formatos alternativos de pesos (GGUF, safetensors empaquetado) ni cuantizaciones, lo que limita su uso fuera del ecosistema `diffusers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PratikshaK-1/naruto-sd15-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
