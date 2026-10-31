# hellmans/FLUX-3-Image-Klein-TE-Uncensored-GGUF

## Resumen

Este repositorio, publicado por el usuario hellmans (basado en el trabajo de AtomicChat), distribuye en formato GGUF el codificador de texto del modelo de generación de imágenes FLUX 3 Image Klein, al que se le ha aplicado una técnica de "abliteration" (proyección fuera de la dirección de rechazo) sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. El objetivo es ofrecer un codificador de texto sin mecanismos de rechazo que funcione como componente `--llm` en stable-diffusion.cpp, junto a los GGUF del pipeline Klein.

El modelo resuelve un problema concreto: en los pipelines de FLUX, el codificador de texto (aquí Qwen3-VL-4B-Instruct) no genera texto visible, sino que produce estados ocultos que consume el modelo de difusión; como chat model, sin embargo, rechazaba el 79 % de peticiones en inglés. La edición elimina esa conducta de rechazo con un impacto mínimo en la calidad del lenguaje (MMLU pasa de 71,1 % a 71,2 %). Es relevante porque permite ejecutar el pipeline completo de FLUX 3 Klein en local con stable-diffusion.cpp sin los filtros del código de inferencia de BFL.

La ficha técnica indica 4.022.468.096 parámetros, licencia Apache 2.0, cuantizaciones con matriz de importancia (imatrix) y un tamaño de repositorio de 18,5 GB. El modelo de imagen DiT de 5,6B que acompaña a este codificador no se modifica en este repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto multimodal (Qwen3-VL) usado como componente de un pipeline text-to-image (FLUX 3 Image Klein) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (rungs equivalentes a los del repo AtomicChat/FLUX-3-Image-Klein-GGUF; niveles concretos no detallados en la informacion disponible) |
| Idiomas soportados | no disponible (las mediciones de rechazo se publican en ingles y ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (endpoints compatible, libreria gguf) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-4B-Instruct, un transformer multimodal de 4B parametros empleado aqui como codificador de texto dentro del pipeline de FLUX 3 Image Klein (cuyos otros componentes son el prompt upsampler Qwen3.5-9B y el modelo de imagen DiT de 5,6B). Dentro del pipeline, el codificador no genera texto: el modelo de difusion lee sus estados ocultos, por lo que no puede "rechazar" peticiones en ejecucion normal; la abliteration actua sobre su comportamiento como chat model y sobre los estados internos.

La edicion aplicada consiste en proyectar fuera de los pesos la "direccion de rechazo" (refusal direction), tecnica de abliteration que no requiere reentrenamiento. No se trata de un fine-tuning con datos nuevos: la model card no describe entrenamiento adicional, solo la intervencion sobre los pesos y la cuantizacion GGUF con imatrix realizada por AtomicChat. El repo se distribuye con los mismos layouts y niveles de cuantizacion que los ficheros `text_encoders/` del repo Klein de AtomicChat, con la edicion integrada.

## Capacidades

- Codificacion de prompts para generacion de imagenes en stable-diffusion.cpp como fichero `--llm`, como reemplazo directo del codificador estandar de Klein.
- Funcionamiento como chat model sin rechazos: las tasas de refusal caen del 79 % al 0 % en ingles y del 32 % al 0 % en ruso en prompts reservados para evaluacion.
- Preservacion de la capacidad linguistica del modelo base: MMLU se mantiene en 71,2 % (frente al 71,1 % original).
- Herencia multimodal de Qwen3-VL (vision-lenguaje) del modelo base, aunque su rol principal aqui es la codificacion de texto para difusion.
- Compatibilidad con los GGUF de Klein de AtomicChat y con el upsampler sin rechazos de FLUX-3-Image-Klein-pup-Uncensored-GGUF.
- No incluye tool calling, agentes ni thinking mode en la informacion disponible; no es un modelo de uso general documentado para esas tareas.

## Casos de uso

- Generacion de imagenes local sin filtros de software: sustituye al codificador estandar en stable-diffusion.cpp mediante la opcion `--llm`, eliminando la capa de rechazo del componente linguistico del pipeline.
- Integracion en pipelines ComfyUI: al no ejecutarse los checks de seguridad de BFL en backends como stable-diffusion.cpp o ComfyUI, este codificador permite montar flujos de trabajo completos en local.
- Investigacion en abliteration: las metricas publicadas (KLD medio respecto al modelo original, coincidencia de top token, tasas de refusal y efectos LPIPS sobre imagenes) lo hacen util como caso de estudio reproducible de tecnicas de eliminacion de rechazo.
- Evaluacion comparativa de codificadores sin censura: la model card incluye una comparacion directa con el codificador alternativo Sakura de webmp3, util para elegir componente en funcion del impacto sobre las imagenes.
- Experimentacion con el prompt upsampler: combinable con el upsampler sin rechazos para estudiar como las ediciones en cada componente afectan a los captions y al resultado final.
- Despliegue en Atomic Chat u otros frontales que consuman GGUF de codificadores de texto para pipelines FLUX.

## Benchmarks y rendimiento

Datos publicados en la model card (mediciones propias de AtomicChat):

| Metrica | Modelo original | Este modelo (abliterated) |
|---|---:|---:|
| Refusals como chat model (ingles, prompts reservados) | 79 % | 0 % |
| Refusals como chat model (ruso, prompts reservados) | 32 % | 0 % |
| MMLU | 71,1 % | 71,2 % |
| LPIPS sobre 48 captions neutras (BF16) | — | 0,066 |
| LPIPS del codificador Q4_K_M estandar (referencia) | — | 0,088 |

Sobre la generacion de imagenes: en 45 peticiones sensibles de nueve categorias (10 imagenes cada una, modelo BF16, dos semillas), la version sin censura no altero ninguna categoria en mas de una imagen de cada diez; el total sobre 90 imagenes fue 80 (stock) frente a 79 (ambos componentes sin censura). La model card concluye que el pipeline Klein abierto ya generaba todas las categorias probadas, por lo que la edicion no produce efecto medible sobre las imagenes.

No se han publicado resultados de benchmarks estandar de lenguaje adicionales (GSM8K, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el modelo base de 4B parametros en GGUF ocupa aproximadamente 2,5 GB en Q4_K_M y en torno a 8 GB en BF16/F16, a lo que hay que sumar la VRAM del modelo de imagen DiT de 5,6B y del resto del pipeline Klein.
- GPU recomendadas: no disponible explicitamente; para el pipeline completo de FLUX 3 Klein con el DiT de 5,6B, GPUs consumer con 12-24 GB de VRAM (RTX 3060 12 GB, RTX 4090) son un punto de partida razonable dada la cuantizacion GGUF.
- Cabe en GPU consumer: el codificador por si solo cabe comodamente en GPUs de 8 GB o mas en cuantizaciones de 4 bits; el pipeline completo depende de la cuantizacion elegida para el DiT.
- Despliegue: stable-diffusion.cpp (uso documentado como `--llm`), ComfyUI y Atomic Chat; al ser GGUF, llama.cpp es tecnicamente compatible como chat model, aunque no esta documentado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Rol | Refusals (chat) | Efecto en imagenes | Licencia |
|---|---|---|---|---|---|
| Codificador stock Qwen3-VL-4B (Klein) | 4,02 B | Text encoder | 79 % (EN) | referencia (LPIPS 0) | Apache 2.0 |
| Este modelo (TE Uncensored) | 4,02 B | Text encoder abliterated | 0 % (EN), 0 % (RU) | LPIPS 0,066 en BF16 (0,088 en Q4_K_M) | Apache 2.0 |
| Sakura (webmp3), codificador Klein uncensored | no disponible | Text encoder abliterated (edicion menor) | 0 % | menor que este modelo | no disponible |

Alternativa complementaria: el prompt upsampler sin censura (FLUX-3-Image-Klein-pup-Uncensored-GGUF, Qwen3.5-9B) actua sobre los captions y es editable de forma independiente; el modelo de imagen DiT de 5,6B no se modifica en ninguna variante. La model card advierte que la licencia FLUX Kommunity del modelo de imagen prohibe eludir las protecciones de BFL, lo que puede ser relevante legalmente pese a la licencia Apache 2.0 de este repo.

## Limitaciones y advertencias

- El efecto practico sobre las imagenes es nulo segun las mediciones propias: el pipeline Klein abierto ya generaba todas las categorias sensibles probadas, por lo que la utilidad real de la abliteration se limita al comportamiento del codificador como chat model.
- Las imagenes si cambian: LPIPS 0,066 en BF16 (aproximadamente un octavo de la variacion entre semillas, 0,53), un desplazamiento general y no dirigido hacia contenido rechazado.
- La licencia FLUX Kommunity del modelo de imagen prohibe eludir las protecciones de BFL; el uso de componentes "uncensored" en produccion puede plantear riesgos legales y de cumplimiento.
- Riesgo de generacion de contenido sensible ( nudity, violencia, armas, drogas): el pipeline no aplica filtros NSFW en backends como stable-diffusion.cpp o ComfyUI; la responsabilidad recae en el usuario.
- Datos de rechazo y KLD publicados solo para ingles y ruso; comportamiento en otros idiomas no disponible.
- Metricas de MMLU y refusals provienen de evaluaciones propias del autor, no de benchmarks independientes.
- Longitud de contexto, latencia y requisitos exactos de VRAM no documentados en la model card.
- Repositorio de comunidad con 653 descargas y 0 likes en el momento de la ficha: madurez y soporte limitados.

## Enlaces

- Repositorio: https://huggingface.co/hellmans/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- GGUF de Klein (modelo de imagen): https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-GGUF
- Upsampler uncensored: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF
- Metricas del proyecto: https://huggingface.co/datasets/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF-metrics
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Atomic Chat: https://atomic.chat/
- GitHub de AtomicChat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
