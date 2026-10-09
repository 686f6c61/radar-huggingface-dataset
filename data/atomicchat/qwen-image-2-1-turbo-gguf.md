# AtomicChat/Qwen-Image-2.1-Turbo-GGUF

## Resumen

AtomicChat/Qwen-Image-2.1-Turbo-GGUF es una redistribucion cuantizada en formato GGUF del checkpoint Qwen-Image-2.1-Turbo de Qwen. No es un modelo de lenguaje: se trata de un modelo de difusion text-to-image cuyo denoiser tiene 7.115.124.736 parametros (unos 7,1B) y que ha sido destilado para generar imagenes en 8 pasos de denoising con CFG 1 y una programacion de sigmas fija propia. El repositorio lo publica AtomicChat, orientado a ejecutar el modelo en local mediante stable-diffusion.cpp y su cliente sd-cli.

El problema que resuelve es practico: los pesos originales en BF16 ocupan 14,23 GB solo para el denoiser, a los que hay que sumar el codificador de texto Qwen3-VL-8B y el VAE. Este repositorio ofrece siete ficheros GGUF entre 2,39 GB (Q2_K) y 7,59 GB (Q8_0), de modo que el modelo puede caber en equipos con menos VRAM. Ademas, la model card publica una evaluacion cuantitativa de la perdida de fidelidad de cada nivel de cuantizacion frente a BF16, medida sobre 96 renders (48 prompts por 2 semillas) con LPIPS, SSIM y PSNR.

Es relevante ahora porque la generacion de imagenes en local sigue dependiendo del equilibrio entre calidad y memoria, y porque el modelo exige una programacion de sigmas concreta que, si no se respeta, produce resultados distintos a los previstos. La informacion disponible no detalla el volumen de descargas ni adopcion: el repositorio registra 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (denoiser con bloques transformer, modulacion compartida, embedding de timestep, norm final y proyeccion de salida); pipeline text-to-image con codificador de texto Qwen3-VL-8B y VAE |
| Parametros totales | 7.115.124.736 (denoiser, dato de safetensors); no incluye el codificador de texto Qwen3-VL-8B ni el VAE |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion de imagenes; el prompt lo procesa el codificador de texto Qwen3-VL-8B, cuya ventana no se especifica en la informacion disponible) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K, Q4_K, Q3_K, Q2_K |
| Idiomas soportados | no disponibles en los metadatos de HuggingFace; la model card incluye validacion especifica de renderizado de texto en chino (8 prompts) |
| Licencia | other / qwen-research (enlace a licencia del modelo base) |
| Formato de pesos | GGUF (denoiser); safetensors para el VAE (`vae/qwen_image_2.1_vae_bf16.safetensors`) |
| Resolucion de referencia | 1024 x 1024 (usada en las mediciones) |
| Pasos de muestreo | 8 (CFG 1.0, metodo euler, sigmas personalizadas) |
| Tamano del repositorio | 42,2 GB |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo |

## Arquitectura y entrenamiento

El modelo es un generador de imagenes de difusion de tipo transformer, con un denoiser de 7,1B parametros. Segun la model card, la conversion a GGUF aplica el tipo de cuantizacion elegido a los bloques transformer, la modulacion compartida, el embedding de timestep, la norm final y la proyeccion de salida, mientras que las dos proyecciones de entrada y las normas 1-D se mantienen en BF16. El codificador de texto es Qwen3-VL-8B (en el ejemplo de ejecucion, `Qwen3VL-8B-Instruct-Q4_K_M.gguf`) y el VAE es el mismo que en Qwen-Image-2.1.

Qwen-Image-2.1-Turbo es, segun la informacion proporcionada, el checkpoint acelerado de Qwen-Image-2.1: el mismo generador de 7B destilado a 8 pasos de denoising con CFG 1 y su propia programacion fija de sigmas. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO: esa informacion no aparece en los materiales consultados. La innovacion tecnica destacable, en lo que respecta a esta publicacion, es la propia destilacion a 8 pasos combinada con la conversion a GGUF y la evaluacion de fidelidad publicada por nivel de cuantizacion.

La model card indica que las mediciones se hicieron con stable-diffusion.cpp en el commit `36f1b1a`, sobre una A100 de 80 GB, a 1024x1024. El codificador de texto y el VAE se mantuvieron en BF16 en todos los renders, de modo que la unica variable fue el fichero del denoiser. Los pesos BF16 renderizan de forma determinista: dos ejecuciones BF16 producen imagenes identicas, por lo que las diferencias reportadas se atribuyen exclusivamente a la cuantizacion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en 8 pasos de denoising con CFG 1.0.
- Edicion de imagenes: el repositorio incluye la etiqueta image-editing, heredada del modelo base.
- Renderizado de texto dentro de la imagen: la model card valida especificamente ocho prompts con texto en chino, con metrica LPIPS propia (`text (zh)`).
- Seguimiento de prompts en escenas complejas: en las comprobaciones con Q2_K, el modelo seguia el prompt y escribia el texto correctamente, aunque la imagen resultante difería de la de BF16.
- Ejecucion local sin conexion mediante stable-diffusion.cpp, tanto por linea de comandos (`sd-cli`) como a traves de su API de servidor.
- Control explicito del muestreo: permite pasar una lista de sigmas personalizada (`--sigmas` en CLI, `sample_params.custom_sigmas` en la API).
- No se documentan capacidades de tool calling, function calling, uso agentico, vision de entrada ni audio: son capacidades ajenas al tipo de modelo.

## Casos de uso

- Generacion de imagenes en local en equipos sin conexion: el modelo puede ejecutarse con stable-diffusion.cpp sobre los ficheros GGUF, lo que permite producir imagenes sin depender de APIs externas y sin enviar prompts a terceros.
- Equipos con VRAM limitada: los ficheros Q2_K (2,39 GB) y Q3_K (3,11 GB) permiten desplegar el denoiser en hardware modesto a cambio de una perdida de fidelidad medible (LPIPS 0,475 y 0,293 respectivamente frente a BF16).
- Produccion de carteles y rotulos con texto integrado: la model card evalua el renderizado de texto en chino; el ejemplo de ejecucion es un letrero de neon con la frase "OPEN LATE", un escenario tipico de rotulacion, senaletica o mockups publicitarios.
- Edicion y variacion de imagenes: la etiqueta image-editing del modelo base sugiere su uso en flujos de retoque o generacion de variantes a partir de una imagen de partida.
- Integracion en pipelines de ComfyUI: el VAE de referencia procede del repositorio Comfy-Org/Qwen-Image-2.1, lo que encaja con flujos de trabajo basados en nodos y produccion por lotes.
- Servicio de generacion de imagenes por API: stable-diffusion.cpp expone un servidor que acepta las sigmas personalizadas, lo que permite montar un endpoint interno de text-to-image para aplicaciones propias.
- Prototipado rapido de assets graficos: al necesitar solo 8 pasos de denoising, el coste por imagen es bajo comparado con modelos que requieren decenas de pasos, lo que resulta util en iteracion de diseno.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio publica LPIPS, SSIM y PSNR por nivel de cuantizacion sobre 96 renders, lo que sirve como referencia reproducible para estudiar el impacto de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de generacion de imagenes. Lo que si se publica es una tabla de fidelidad de cuantizacion frente a los pesos BF16, medida sobre 48 prompts x 2 semillas (96 renders), a 1024x1024, con stable-diffusion.cpp en el commit `36f1b1a` sobre una A100 de 80 GB:

| Fichero | Tamano en disco | LPIPS [IC 95%] | vs. nueva semilla | SSIM | PSNR | Texto (zh) |
|---|---:|---|---:|---:|---:|---:|
| BF16 | 14,23 GB | 0 (identico) | 0% | 1,000 | no disponible | 0 |
| Q8_0 | 7,59 GB | 0,037 [0,030; 0,046] | 7% | 0,964 | 30,2 dB | 0,037 |
| Q6_K | 5,88 GB | 0,072 [0,056; 0,090] | 14% | 0,926 | 25,9 dB | 0,079 |
| Q5_K | 4,94 GB | 0,115 [0,098; 0,133] | 23% | 0,886 | 22,6 dB | 0,150 |
| Q4_K | 4,05 GB | 0,187 [0,161; 0,214] | 37% | 0,812 | 19,2 dB | 0,259 |
| Q3_K | 3,11 GB | 0,293 [0,267; 0,321] | 59% | 0,721 | 15,9 dB | 0,382 |
| Q2_K | 2,39 GB | 0,475 [0,454; 0,496] | 95% | 0,594 | 13,1 dB | 0,499 |

La columna "vs. nueva semilla" compara la distancia con el cambio que provoca unicamente variar la semilla en BF16 (LPIPS 0,499 para una imagen no relacionada del mismo prompt). Q2_K alcanza el 95% de esa referencia, es decir, produce una imagen practicamente tan distinta como si se cambiara la semilla.

## Requisitos de hardware

- VRAM del denoiser: entre 2,39 GB (Q2_K) y 14,23 GB (BF16) solo para el fichero de difusion, segun el nivel de cuantizacion elegido.
- A esa cifra hay que anadir el codificador de texto Qwen3-VL-8B (en el ejemplo se usa `Qwen3VL-8B-Instruct-Q4_K_M.gguf`) y el VAE (`qwen_image_2.1_vae_bf16.safetensors`). Los tamanos de estos dos componentes no se detallan en la informacion disponible, por lo que no se puede dar una cifra total de VRAM verificada.
- GPU de referencia de las mediciones: A100 de 80 GB. No se publican requisitos de VRAM por modelo de GPU ni estimaciones de rendimiento para GPUs de consumo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. Los tamanos de fichero mas bajos (Q2_K, Q3_K, Q4_K) son compatibles en cuanto a memoria con GPUs de gama alta de consumo, pero la model card no certifica ninguna configuracion concreta.
- Opciones de despliegue: stable-diffusion.cpp (cliente `sd-cli` y API de servidor), la aplicacion Atomic Chat, y flujos basados en ComfyUI, dado que el VAE de referencia procede de Comfy-Org/Qwen-Image-2.1.
- Requisito de version: es necesario usar una compilacion de stable-diffusion.cpp del 6 de octubre de 2026 o posterior (el commit `c150a6b` corrigio el manejo de listas de sigmas personalizadas).
- Latencia y throughput: no disponibles. La model card no publica tiempos por imagen ni imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros comparables en la informacion proporcionada. La comparacion posible se limita a las variantes del propio repositorio y al modelo base:

| Modelo / fichero | Parametros (denoiser) | Pasos | CFG | Formato | Tamano | Licencia |
|---|---|---:|---:|---|---:|---|
| Qwen-Image-2.1-Turbo (BF16 original) | 7,1B | 8 | 1,0 | safetensors | equivalente a 14,23 GB en GGUF BF16 | qwen-research |
| Qwen-Image-2.1-Turbo-GGUF Q8_0 | 7,1B | 8 | 1,0 | GGUF | 7,59 GB | qwen-research |
| Qwen-Image-2.1-Turbo-GGUF Q4_K | 7,1B | 8 | 1,0 | GGUF | 4,05 GB | qwen-research |
| Qwen-Image-2.1-Turbo-GGUF Q2_K | 7,1B | 8 | 1,0 | GGUF | 2,39 GB | qwen-research |
| Qwen-Image-2.1 (base, sin destilar) | 7,1B (mismo generador, segun la model card) | no disponible | no disponible | no disponible | no disponible | qwen-research |

Alternativas de otros desarrolladores en la misma categoria (generacion de imagenes text-to-image cuantizada en GGUF): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad con cuantizaciones agresivas: con Q4_K y Q3_K se producen desplazamientos visibles en la composicion, los rostros y el rotulado; con Q2_K la imagen deja de ser la misma que con BF16, incluso partiendo de la misma semilla y el mismo prompt.
- El texto en la imagen se degrada antes que las fotografias: la metrica `text (zh)` es peor que el LPIPS global en todos los niveles (por ejemplo, 0,259 frente a 0,187 en Q4_K).
- Dependencia de la programacion de sigmas: sin `--sigmas`, stable-diffusion.cpp aplica la programacion por defecto de Qwen-Image-2.1, para la que el modelo no fue destilado, y la imagen resultante es distinta. Omitir este parametro invalida los resultados esperados.
- Dependencia de la version de stable-diffusion.cpp: se requiere una compilacion del 6 de octubre de 2026 o posterior para que funcionen las listas de sigmas personalizadas.
- Licencia: la licencia declarada es "other" con nombre "qwen-research". La informacion disponible no detalla los terminos completos, pero un nombre de licencia basado en "research" sugiere restricciones para uso comercial. Debe verificarse el texto completo de la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas: no se declaran idiomas soportados en los metadatos. La validacion publicada de renderizado de texto se limita al chino. No hay evidencia publicada sobre calidad con prompts en castellano.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Al ser un modelo de generacion de imagenes entrenado con datos no especificados, es esperable que reproduzca sesgos presentes en sus datos de entrenamiento, pero esto no puede cuantificarse con lo publicado.
- Riesgo de alucinacion visual: no se publican evaluaciones de seguimiento de prompt ni de fidelidad semantica frente al texto de entrada. Las metricas disponibles miden solo la diferencia respecto a BF16, no la correccion respecto al prompt.
- Adopcion: el repositorio registra 0 descargas y 1 like, por lo que no existe una base de usuarios que haya validado el comportamiento en produccion.
- El repositorio ocupa 42,2 GB en total, lo que exige espacio en disco considerable si se descargan varios niveles de cuantizacion.
- Fecha de publicacion en los metadatos de HuggingFace: 9 de octubre de 2026 (ultima actualizacion el mismo dia).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- VAE de referencia (Comfy-Org/Qwen-Image-2.1): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Atomic Chat: https://atomic.chat/
- Repositorio de Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Servidor de Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
