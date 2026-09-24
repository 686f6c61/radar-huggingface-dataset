# darrellbest/Qwen-Image-2.1-PE-I2I-Heretic-GGUF

## Resumen

Qwen-Image-2.1-PE-I2I-Heretic-GGUF es la version cuantizada en formato GGUF de `darrellbest/Qwen-Image-2.1-PE-I2I-Heretic`, un reescritor de prompts para edicion de imagenes (image-to-image, I2I) derivado de `Qwen/Qwen-Image-2.1-PE-I2I`. No es un generador de imagenes: su funcion es leer la imagen que se va a editar y transformar una instruccion corta del usuario ("que parezca invierno") en un prompt de edicion detallado que despues se entrega a un modelo de difusion. El autor es un desarrollador independiente (darrellbest) y el modelo no esta afiliado ni respaldado por Alibaba/Qwen.

La variante "Heretic" es una version con el comportamiento de rechazo ablacionado (abliterated): se han eliminado o reducido las negativas del modelo ante peticiones que el modelo original rechazaria. Esto permite reescribir instrucciones de edicion sobre las que el modelo base podria negarse, a costa de un coste medido en divergencia KL respecto al original (los datos de ablacion estan en la model card del modelo padre, no en esta).

Tecnicamente se distribuye como GGUF para llama.cpp y Ollama, con un archivo de vision separado (`mmproj-F16.gguf`) que aporta la lectura de la imagen. El checkpoint tiene 8.953.803.264 parametros (~8,95 mil millones) y el repositorio ocupa 34 GB entre todas las variantes. La licencia es Qwen Research License, lo que restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con codificador visual separado en el archivo `mmproj`; el checkpoint incluye campos de configuracion de capas MTP (`mtp_num_hidden_layers`), no documentados en detalle |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (17,9 GB), Q8_0 (9,5 GB, recomendada), Q4_K_M (5,6 GB); codificador visual en `mmproj-F16.gguf` (0,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | `other` / Qwen Research License (uso no comercial unicamente) |
| Formato de pesos | GGUF (BF16, Q8_0, Q4_K_M) + GGUF de vision (mmproj F16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo multimodal de tipo image-text-to-text con un codificador visual empaquetado aparte en el fichero `mmproj-F16.gguf`. En GGUF, el modelo y su torre de vision se cargan como dos ficheros que los cargadores tratan como un unico modelo. El dato tecnico relevante que si se documenta es que la conversion requirio un ajuste de una linea en `convert_hf_to_gguf.py` (commit `bd4f514`): el conversor de Qwen lee `mtp_num_hidden_layers` con un valor por defecto, pero estos checkpoints lo fijan a `null`, por lo que hay que forzarlo a 0 (como ya hacen otros conversores de llama.cpp con `or 0`). El proceso de cuantizacion se realizo con `llama-quantize`.

Sobre el entrenamiento no se aporta informacion en esta ficha: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF/DPO. Lo unico documentado es el proceso de ablacion de rechazos ("abliterated"/"heretic"), cuyas tasas de rechazo medidas y su coste en divergencia KL se remiten a la model card del modelo padre. La validacion realizada por el autor tras la conversion fue funcional: el build Q8_0 se importo en Ollama y se ejecuto sobre una imagen real, describiendola correctamente y generando una reescritura valida a traves de la ruta de vision.

Un requisito critico de funcionamiento: el fichero `system_prompt.txt` esta incluido y es obligatorio, porque define el contrato de salida. Segun el autor, el modelo es inservible sin el.

## Capacidades

- Comprension de imagen: lee la imagen de entrada a traves del codificador visual (`mmproj-F16.gguf`) y la describe correctamente, incluso tras cuantizacion a Q8_0 y Q4_K_M.
- Reescritura de prompts de edicion (I2I): convierte una instruccion corta de edicion en un prompt detallado y estructurado para un generador de imagenes.
- Cumplimiento de contrato de salida: sigue el formato definido en `system_prompt.txt`, obligatorio para que la salida sea utilizable.
- Modo conversacional: etiquetado como `conversational` en HuggingFace, por lo que admite interaccion por turnos.
- Rechazos ablacionados: al ser una variante "heretic"/"abliterated", reduce las negativas ante instrucciones que el modelo base rechazaria.
- Despliegue en CPU y ARM: disenado explicitamente para llama.cpp y Ollama, incluidas maquinas sin GPU CUDA y equipos ARM como la DGX Spark.
- No es un generador de imagenes: no produce ni edita pixeles; solo genera el prompt de edicion.

## Casos de uso

- Preprocesado de instrucciones en pipelines de edicion de imagen: el usuario escribe "quitale el coche" y el modelo, tras ver la foto, genera un prompt detallado (sujeto, fondo, iluminacion, estilo) que se pasa a un modelo de difusion. Es adecuado porque lee la imagen real en lugar de reescribir a ciegas.
- Herramientas de retoque para fotografia de producto: dado un catalogo de imagenes, se generan prompts de edicion consistentes para cambiar fondos o iluminacion manteniendo la coherencia descriptiva entre lotes.
- Interfaz de lenguaje natural para editores tipo ComfyUI: la familia incluye una build especifica para ComfyUI; este modelo actua como capa que traduce la intencion del usuario al prompt que consume el nodo de difusion.
- Despliegue en estaciones de trabajo sin GPU: con los builds Q4_K_M (5,6 GB) y Q8_0 (9,5 GB) sobre llama.cpp, puede ejecutarse en CPU o en equipos ARM (DGX Spark), lo que permite integrarlo en entornos de edicion locales sin CUDA.
- Asistencia a artistas y disenadores: el modelo transforma indicaciones vagas en descripciones ricas, reduciendo la curva de aprendizaje de la escritura de prompts para edicion.
- Moderacion y preprocesado de contenido en flujos creativos: la ablacion de rechazos permite procesar instrucciones de edicion creativas que el modelo original bloquearia, util en investigacion sobre comportamiento de modelos ablacionados (siempre dentro de los limites de la licencia no comercial).
- Automatizacion por lotes en investigacion: al ser GGUF y compatible con servidores locales, se puede conectar a scripts que procesen pares (imagen, instruccion) y generen prompts normalizados para experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo unico medido por el autor es la velocidad de generacion y la validez de la reescritura por build, con decodificacion greedy (temperatura 0) sobre la misma imagen y el mismo prompt, en una RTX PRO 6000 via Ollama:

| Build | Velocidad | Reescritura valida | Longitud de la reescritura |
|---|---|---|---|
| BF16 | 56 tok/s | si | 78 palabras |
| Q8_0 | 99 tok/s | si | 88 palabras |
| Q4_K_M | 130 tok/s | si | 171 palabras |

Los tres builds describieron correctamente la imagen de entrada, lo que indica que la ruta de vision sobrevive a la cuantizacion. El autor senala Q8_0 como valor por defecto seguro y Q4_K_M como el mas rapido, recomendando verificar este ultimo con prompts propios.

## Requisitos de hardware

- VRAM estimada (estimacion propia a partir de los tamanos de fichero publicados, no dato oficial): BF16 ~18 GB de pesos + 0,9 GB de vision + cache KV, en torno a 20-24 GB; Q8_0 ~9,5 GB + 0,9 GB, en torno a 11-14 GB; Q4_K_M ~5,6 GB + 0,9 GB, en torno a 7-9 GB.
- GPU recomendadas: RTX PRO 6000 (la usada por el autor para las mediciones), A100 40/80 GB o H100 para BF16; RTX 4090/3090 (24 GB) para BF16 justo o para Q8_0 con holgura; RTX 4080/4070 Ti (12-16 GB) para Q8_0.
- Cabe en GPU de consumo: si. Q8_0 en tarjetas de 12-16 GB; Q4_K_M en tarjetas de 8 GB, aunque con el fichero de vision y el contexto puede quedar muy ajustado.
- CPU y ARM: soportado explicitamente por llama.cpp y Ollama, incluidos equipos sin CUDA y ARM como la DGX Spark.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... --mmproj ... --system-prompt-file system_prompt.txt`), Ollama (Modelfile con el GGUF y el mmproj mas el `SYSTEM` del system prompt); existe una variante NVFP4 de la familia para vLLM sobre Blackwell.
- Latencia y throughput: 56 tok/s (BF16), 99 tok/s (Q8_0) y 130 tok/s (Q4_K_M) en una RTX PRO 6000 via Ollama, con decodificacion greedy.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoria. La comparacion factible es dentro de la propia familia del autor:

| Modelo | Formato | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Qwen-Image-2.1-PE-I2I-Heretic-GGUF (este) | GGUF BF16 / Q8_0 / Q4_K_M + mmproj | ~8,95 B | no disponible | Qwen Research (no comercial) | llama.cpp, Ollama (incluye CPU y ARM) |
| PE-I2I-Heretic | bf16 safetensors | no disponible | no disponible | Qwen Research (no comercial) | transformers / diffusers |
| PE-I2I-Heretic-NVFP4 | NVFP4 (compressed-tensors) | no disponible | no disponible | Qwen Research (no comercial) | vLLM sobre Blackwell |
| PE-T2I-Heretic | bf16 safetensors y GGUF | no disponible | no disponible | Qwen Research (no comercial) | Reescritura de prompts para generacion (T2I), sin lectura de imagen |

Alternativas externas de la misma categoria (reescritores de prompts multimodales): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: Qwen Research License, uso exclusivamente no comercial. Incluye copia de la licencia en el repositorio. No se puede usar en produccion comercial sin autorizacion.
- Modelo derivado no oficial: no esta afiliado ni respaldado por Alibaba/Qwen.
- Requiere `system_prompt.txt`: sin ese prompt de sistema el modelo no es utilizable, porque define el contrato de salida. Omitirlo en produccion rompe el formato.
- Ablacion de rechazos: la variante "heretic"/"abliterated" elimina negativas de seguridad, lo que puede aumentar la probabilidad de contenido problematico o de instrucciones de edicion inapropiadas. El coste en calidad (divergencia KL) se documenta en la model card del padre, no aqui.
- Riesgo de alucinacion: el modelo describe la imagen de entrada; una descripcion erronea se propaga al prompt de edicion y produce una edicion no deseada.
- Perdida de calidad por cuantizacion: Q4_K_M es el build mas rapido pero el autor lo senala como el que hay que validar con prompts propios; las longitudes de reescritura variaron notablemente entre builds (78, 88 y 171 palabras con el mismo prompt).
- No es un generador de imagenes: no produce ni modifica pixeles; confundirlo con el modelo de difusion es un error de uso frecuente.
- Idiomas soportados no documentados: no hay lista de idiomas, y la model card y el system prompt estan en ingles.
- Nula traccion de la comunidad: 42 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.
- Contexto y datos de entrenamiento no disponibles: no se puede dimensionar la ventana util ni evaluar sesgos de dataset a partir de esta ficha.

## Enlaces

- HuggingFace (modelo GGUF): https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic-GGUF
- Modelo base GGUF: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic
- Modelo base original (safetensors): https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Modelo de generacion asociado: https://huggingface.co/Qwen/Qwen-Image-2.1
- Variante T2I (safetensors): https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-T2I-Heretic
- Variante T2I GGUF: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Variante T2I NVFP4: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-T2I-Heretic-NVFP4
- Variante I2I NVFP4: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic-NVFP4
- Build para ComfyUI: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-Heretic-ComfyUI
- Conversor de llama.cpp usado (commit bd4f514): https://github.com/ggerganov/llama.cpp
