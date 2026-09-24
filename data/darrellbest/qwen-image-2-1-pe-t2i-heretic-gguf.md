# darrellbest/Qwen-Image-2.1-PE-T2I-Heretic-GGUF

## Resumen

Qwen-Image-2.1-PE-T2I-Heretic-GGUF es la version cuantizada en formato GGUF de darrellbest/Qwen-Image-2.1-PE-T2I-Heretic, un reescritor de prompts derivado de Qwen/Qwen-Image-2.1-PE-T2I (el "prompt enhancer" de la familia Qwen-Image-2.1). No es un generador de imagenes: su tarea es convertir una peticion breve del usuario en un prompt detallado y devolver ademas una relacion de aspecto recomendada. El checkpoint cuenta con 8.953.803.264 parametros (unos 8,95 mil millones) y se distribuye en tres builds GGUF: BF16 (17,9 GB), Q8_0 (9,5 GB) y Q4_K_M (5,6 GB).

El autor lo publica como "heretic" o "abliterated": se ha eliminado el comportamiento de rechazo (refusal ablation) respecto al modelo original de Qwen. El modelo requiere obligatoriamente el fichero `system_prompt.txt` incluido en el repositorio, que define el contrato de salida; sin el, segun el propio autor, el modelo resulta inutil. La publicacion esta pensada para llama.cpp y Ollama, incluyendo maquinas sin GPU CUDA y equipos ARM como el DGX Spark.

La relevancia practica es doble: por un lado, permite ejecutar un paso de reescritura de prompts en local y sobre hardware modesto; por otro, sirve como caso de estudio reproducible de abliteration aplicada a un componente de pipeline de generacion de imagenes, con las tasas de rechazo y el coste en divergencia KL documentados en la model card del modelo padre. La licencia es Qwen Research, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; corresponde al prompt enhancer (PE) de la familia Qwen-Image-2.1. El proceso de conversion hace referencia a la clave de configuracion `mtp_num_hidden_layers`, lo que indica presencia de componentes de prediccion multi-token en el checkpoint |
| Parametros totales | 8.953.803.264 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF BF16, Q8_0 y Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`); uso exclusivamente no comercial |
| Formato de pesos | GGUF (llama.cpp / Ollama). Existe tambien una variante NVFP4 con compressed-tensors para vLLM en Blackwell |
| Tarea declarada | text-generation (reescritura de prompts T2I; no genera imagenes) |
| Ficheros | BF16 17,9 GB; Q8_0 9,5 GB (recomendado); Q4_K_M 5,6 GB |
| Tamano del repositorio | 33,1 GB |
| Descargas / likes | 24 / 0 |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-09-24 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. El modelo es un derivado de Qwen/Qwen-Image-2.1-PE-T2I y hereda su funcion: dado un texto corto, generar un prompt largo y detallado mas una relacion de aspecto recomendada, siguiendo un contrato de salida fijado por `system_prompt.txt`. El autor indica que el modelo base darrellbest/Qwen-Image-2.1-PE-T2I-Heretic ha sido sometido a un proceso de abliteration o ablation de rechazos, y remite a la model card del modelo padre para consultar las tasas de rechazo medidas y el dano en divergencia KL que ese proceso introduce.

El pipeline de conversion esta documentado: se uso `convert_hf_to_gguf.py` de llama.cpp (commit `bd4f514`) y despues `llama-quantize`. La conversion de esta arquitectura requirio una correccion de una linea, porque el conversor de Qwen lee `mtp_num_hidden_layers` con un valor por defecto mientras que estos checkpoints lo fijan a `null`, de modo que hay que forzarlo a 0 (otros conversores de llama.cpp ya aplican `or 0`). No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor indica que verifico el build Q8_0 importandolo en Ollama y ejecutandolo, y que produjo una reescritura valida.

## Capacidades

- Reescritura de prompts texto-a-imagen (T2I): transforma una peticion breve en un prompt detallado y extenso (entre 364 y 472 palabras segun el build en la prueba publicada).
- Recomendacion de relacion de aspecto: devuelve un aspect ratio junto al prompt reescrito (3:2 en las tres pruebas publicadas).
- Cumplimiento de un contrato de salida estricto definido por `system_prompt.txt`, que es obligatorio para que el modelo funcione.
- Ejecucion en llama.cpp y Ollama, incluyendo CPU sin CUDA y plataformas ARM (DGX Spark, segun el autor).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional (tag `conversational`), lo que permite servirlo detras de una API compatible con OpenAI.
- Comportamiento sin rechazos (abliterated): no aplica filtros de refusal propios, lo que se traduce en respuestas a peticiones que el modelo original rechazaria.
- Generacion de texto general (pipeline declarado `text-generation`), aunque la especializacion real es la reescritura de prompts.
- No dispone de capacidades de vision en esta variante T2I: la generacion de imagenes corresponde a Qwen-Image-2.1, no a este modelo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Preprocesado en un pipeline de generacion de imagenes: el modelo recibe la peticion corta de un usuario ("una cabana acogedora en un bosque nevado al atardecer"), la expande a un prompt detallado y devuelve ademas la relacion de aspecto; esa salida se pasa como entrada a Qwen-Image-2.1. El sistema_prompt garantiza un formato de salida parseable.
- Interfaz para usuarios no expertos en prompting: aplicaciones de diseno o demos publicas donde el usuario escribe una frase coloquial y el sistema la convierte en un prompt tecnico de calidad, sin que el usuario aprenda tecnicas de prompt engineering.
- Despliegue en hardware sin GPU CUDA: gracias a los builds GGUF y a llama.cpp u Ollama, el reescritor puede ejecutarse en portatiles, servidores solo CPU o equipos ARM como el DGX Spark, donde un generador de imagenes completo no cabria.
- Generacion por lotes de prompts para datasets sinteticos de investigacion: procesar miles de descripciones cortas a prompts largos de forma desatendida con `llama-cli` o `llama-server`. La licencia no comercial restringe este uso a investigacion.
- Servicio interno detras de una API compatible con OpenAI: el tag `endpoints_compatible` permite exponer el modelo con `llama-server` y consumirlo desde aplicaciones existentes sin cambios en el cliente.
- Investigacion sobre abliteration: este checkpoint y su modelo padre permiten medir de forma reproducible el efecto de la eliminacion de rechazos sobre un modelo especializado, comparando tasas de rechazo y divergencia KL frente al Qwen/Qwen-Image-2.1-PE-T2I original.
- Comparativa de cuantizaciones en produccion: los tres builds permiten medir la perdida de fidelidad de la reescritura (longitud del prompt, coherencia, eleccion del aspect ratio) frente al ahorro de VRAM, con datos publicados de velocidad para cada uno.
- Integracion con herramientas de nodos para ComfyUI: la familia incluye una variante de fichero unico en safetensors para ComfyUI, lo que sugiere su uso como nodo de reescritura previo al muestreador de imagen.

## Benchmarks y rendimiento

La informacion disponible solo incluye una prueba de velocidad y validez de salida realizada por el autor con el mismo prompt, decodificacion greedy (temperatura 0) y una unica GPU RTX PRO 6000 a traves de Ollama.

| Build | Velocidad | Reescritura valida | Relacion de aspecto | Longitud de la reescritura |
|---|---|---|---|---|
| BF16 | 56 tok/s | Si | 3:2 | 472 palabras |
| Q8_0 | 67 tok/s | Si | 3:2 | 429 palabras |
| Q4_K_M | 109 tok/s | Si | 3:2 | 364 palabras |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza especializada del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamano de cada fichero mas el overhead de contexto (estimacion propia; el autor no publica cifras de VRAM):
  - BF16 (17,9 GB de pesos): aproximadamente 19-21 GB, segun contexto y backend.
  - Q8_0 (9,5 GB de pesos): aproximadamente 11-12 GB. Es el build recomendado por el autor.
  - Q4_K_M (5,6 GB de pesos): aproximadamente 7-8 GB. Es el mas rapido y el de mayor riesgo de perdida de calidad.
- GPU recomendadas: el autor valida con una RTX PRO 6000. Por tamano, los builds Q8_0 y Q4_K_M son adecuados para RTX 4090 (24 GB) y GPUs consumer de gama alta; el BF16 cabe en 24 GB con contexto limitado. No hay datos publicados para A100 o H100.
- Cabe en GPU consumer: si, en el caso de Q8_0 y Q4_K_M en GPUs de 12-16 GB o superiores; BF16 requiere 24 GB o mas.
- Ejecucion sin GPU: soportada explicitamente mediante llama.cpp y Ollama en maquinas sin CUDA y en ARM (DGX Spark).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, y vLLM unicamente para la variante NVFP4 en Blackwell (no para los ficheros GGUF).
- Latencia y throughput medidos: 56 tok/s (BF16), 67 tok/s (Q8_0) y 109 tok/s (Q4_K_M) en una RTX PRO 6000 con decodificacion greedy. No hay datos de latencia ni de throughput en CPU o ARM.
- Nota operativa: el fichero `system_prompt.txt` debe cargarse con `--system-prompt-file` en llama.cpp o pegarse en la seccion `SYSTEM` del Modelfile de Ollama.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas externas de la misma categoria. La comparacion posible se limita a las variantes de la propia familia, todas derivadas de Qwen/Qwen-Image-2.1-PE-T2I.

| Modelo | Formato | Uso previsto | Licencia | Uso comercial |
|---|---|---|---|---|
| darrellbest/Qwen-Image-2.1-PE-T2I-Heretic-GGUF (este) | GGUF BF16 / Q8_0 / Q4_K_M | llama.cpp, Ollama, equipos sin CUDA y ARM | qwen-research | No |
| darrellbest/Qwen-Image-2.1-PE-T2I-Heretic | bf16 safetensors | transformers / diffusers | qwen-research | No |
| darrellbest/Qwen-Image-2.1-PE-T2I-Heretic-NVFP4 | NVFP4 (compressed-tensors) | vLLM sobre Blackwell | qwen-research | No |
| Qwen/Qwen-Image-2.1-PE-T2I (original, sin abliteration) | safetensors | transformers / diffusers | Qwen Research | No |
| darrellbest/Qwen-Image-2.1-PE-I2I-Heretic-GGUF | GGUF (+ mmproj) | Edicion de imagen (lee la imagen a editar) | qwen-research | No |

Frente al modelo original sin abliteration, la diferencia esperable es el comportamiento de rechazo y el dano medido en divergencia KL, cuantificado en la model card del modelo padre, no en esta.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial. El propio autor lo indica de forma explicita. No es apto para productos comerciales sin autorizacion.
- No es un generador de imagenes. Solo reescribe prompts; la generacion corresponde a Qwen-Image-2.1.
- Dependencia critica de `system_prompt.txt`: sin ese fichero, segun el autor, el modelo es inutil. Cualquier despliegue en produccion debe versionar y cargar ese prompt de sistema.
- Modelo abliterated: se ha eliminado el mecanismo de rechazo. Esto implica que puede generar contenido que el modelo original rechazaria, con implicaciones legales y de moderacion si se expone a usuarios finales sin filtros adicionales.
- Dano por abliteration: el autor remite a la model card del modelo padre, donde se documentan tasas de rechazo y el coste en divergencia KL. Es previsible cierta degradacion de calidad respecto al original.
- Riesgo de alucinacion: al expandir un prompt corto, el modelo anade detalles que el usuario no ha pedido (iluminacion, estilo, composicion). Es un comportamiento deseado en parte, pero puede introducir elementos no solicitados.
- Perdida de fidelidad en cuantizacion: el build Q4_K_M produjo una reescritura notablemente mas corta (364 palabras frente a 472 en BF16) en la prueba publicada; el autor recomienda verificar los prompts propios con ese build. Q8_0 es el valor por defecto seguro.
- Datos de rendimiento limitados: una sola GPU, un solo prompt, decodificacion greedy. No hay evidencia sobre contextos largos, lotes concurrentes ni otros idiomas.
- Longitud de contexto e idiomas no documentados: no se puede asumir buen comportamiento multilingue ni en conversaciones largas.
- Nota tecnica sobre la verificacion: la model card indica que el build Q8_0 "describio correctamente la imagen" al probarlo, una verificacion que encaja con la variante I2I (que si lee la imagen) y no con la T2I. Conviene confirmar si el checkpoint T2I atiende a entradas de imagen antes de asumir esa capacidad.
- Conversion no estandar: se requirio un parche para tratar `mtp_num_hidden_layers` a `null`. Reproducir el proceso con otras versiones de llama.cpp puede fallar sin esa correccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Modelo base (bf16 safetensors): https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-T2I-Heretic
- Variante NVFP4 (vLLM en Blackwell): https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-T2I-Heretic-NVFP4
- Variante I2I (edicion de imagen): https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic
- Variante I2I en GGUF: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic-GGUF
- Variante I2I en NVFP4: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic-NVFP4
- Fichero unico para ComfyUI: https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-Heretic-ComfyUI
- Modelo original de Qwen (sin abliteration): https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Familia Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de llama.cpp (conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
