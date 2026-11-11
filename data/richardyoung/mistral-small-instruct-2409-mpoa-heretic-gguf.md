# richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic-GGUF

## Resumen

Mistral-Small-Instruct-2409-MPOA-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic, una versión "abliterada" (con los mecanismos de rechazo eliminados) de mistralai/Mistral-Small-Instruct-2409. El autor, Richard J. Young, aplicó la técnica Heretic 2.0, que implementa una abliteración proyectada y con preservación de magnitud (MPOA, el método por defecto de Heretic), para eliminar las respuestas de rechazo del modelo original manteniendo al máximo el comportamiento del modelo base.

El modelo cuenta con 22.247.282.688 parámetros (aproximadamente 22,2 mil millones) y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El repositorio ocupa 13,4 GB e incluye una cuantización Q4_K_M (13,3 GB) como archivo principal, además de una matriz de importancia (imatrix) de 24 MB. El autor indica que se irán añadiendo más tamaños: IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0.

La relevancia de este modelo es fundamentalmente investigadora: forma parte de un estudio sobre la dificultad creciente de la abliteración en modelos open-weight recientes. No está pensado como asistente de propósito general, sino como material para investigar la eliminación de rechazos, su medición y las defensas frente a ella. La licencia es la MRL 0.1 de Mistral, con las mismas restricciones de uso que el modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral-Small-Instruct-2409); no se detalla en la informacion disponible |
| Parametros totales | 22.247.282.688 (22,2 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (disponible); IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0 (anunciadas, en proceso de publicacion) |
| Idiomas soportados | en (ingles) |
| Licencia | mrl (Mistral Research License 0.1) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

El modelo es una derivacion de Mistral-Small-Instruct-2409, un transformer de 22,2 mil millones de parametros. Sobre esa base, el autor aplico Heretic 2.0 con abliteracion proyectada y preservacion de magnitud (MPOA), el metodo por defecto de Heretic. La abliteracion consiste en identificar y proyectar fuera del espacio de activaciones las direcciones asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones. La variante MPOA busca preservar la magnitud de las activaciones para minimizar el dano colateral en las capacidades del modelo.

El proceso de seleccion se realizo mediante una busqueda de 100 ensayos, eligiendo la configuracion con menos rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token inferior o igual a 0,1 respecto al original. La prueba seleccionada obtuvo una divergencia KL de 0,049. No se detalla en la informacion disponible el volumen de tokens de entrenamiento del modelo original, la composicion del dataset ni si hubo RLHF o DPO. Los archivos GGUF se generaron con llama.cpp (commit 468fde9) mediante convert_hf_to_gguf.py con salida bf16 y posterior llama-quantize en CPU, verificando cada archivo de pesos contra su SHA-256.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Mistral-Small-Instruct-2409.
- Capacidad reducida de rechazo: el modelo cumple muchas peticiones que el original rechaza (tasa de rechazo del 6,9 % frente al 55,7 % del original en 972 prompts daninos retenidos, segun el articulo).
- Razonamiento e instrucciones generales: no se detallan capacidades especificas adicionales en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como objeto de estudio para medir la eficacia de la eliminacion de rechazos y comparar tecnicas (MPOA frente a otros metodos) en modelos de 22 B. Es su proposito declarado.
- Evaluacion de defensas frente a la eliminacion de rechazos: permite probar mecanismos de seguridad, clasificadores o filtros que detecten respuestas no alineadas en modelos abliterados.
- Estudio de la degradacion de capacidades: al comparar el modelo con el original se puede cuantificar el coste en calidad (divergencia KL de 0,049) que impone la abliteracion.
- Experimentos de calibracion de cuantizacion: la presencia de imatrix y de varias cuantizaciones planificadas permite estudiar como la cuantizacion altera el comportamiento de rechazo, advertencia explicita del autor.
- Reproducibilidad de articulos: el modelo forma parte de un trabajo academico sobre la dificultad creciente de la abliteracion, por lo que facilita replicar sus resultados en formato GGUF.
- Despliegue local en investigación: con 13,3 GB en Q4_K_M puede ejecutarse en estaciones de trabajo con GPU de consumo para experimentos que no requieran la version bf16.

## Benchmarks y rendimiento

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 55,7 % | 6,9 % (67/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 10 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,049 |

Estos datos corresponden al modelo en precision completa (bf16) y provienen del articulo del autor. Los archivos cuantizados de este repositorio no fueron evaluados en el articulo.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 13,3 GB de pesos, mas overhead de contexto y cache KV; en la practica requiere del orden de 14-16 GB de VRAM para contextos moderados.
- GPU recomendadas: para Q4_K_M, tarjetas con 16 GB o mas (RTX 4080, RTX 4090, A100, H100). Para las cuantizaciones mayores anunciadas (Q6_K, Q8_0) se necesitan 24 GB o mas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M y margen para contexto; en GPUs de 16 GB de forma ajustada.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (`ollama run hf.co/richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic-GGUF:Q4_K_M`). No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (WildGuard) | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral-Small-Instruct-2409-MPOA-heretic-GGUF (este) | 22,2 B | no disponible | 6,9 % | MRL 0.1 | GGUF |
| mistralai/Mistral-Small-Instruct-2409 (original) | 22,2 B | no disponible | 55,7 % | MRL 0.1 | safetensors |
| richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic (bf16) | 22,2 B | no disponible | 6,9 % | MRL 0.1 | safetensors |

No se dispone en la informacion proporcionada de datos de otros modelos abliterados comparables (por ejemplo, de las familias Qwen, Gemma u Olmo citadas en el articulo) para establecer una comparativa numerica adicional.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente de proposito general: el autor lo declara explicitamente y advierte de que cumple muchas peticiones que el original rechaza.
- Riesgo de contenido danino: la eliminacion de rechazos puede producir respuestas a peticiones que el modelo original declinaba; el uso es responsabilidad del usuario.
- La cuantizacion puede alterar el comportamiento de rechazo: los archivos GGUF no fueron evaluados en el articulo y sus tasas de rechazo pueden diferir de las del modelo bf16.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Licencia MRL 0.1: incluye restricciones de uso (uso comercial condicionado); conviene revisar el texto completo antes de cualquier despliegue en produccion.
- Sesgos y alucinaciones: no se documentan evaluaciones especificas en la informacion disponible; al derivar de un modelo conversacional, conserva los sesgos y la propension a la alucinacion del original.
- Longitud de contexto y capacidades de tool calling no documentadas en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic-GGUF
- Modelo base abliterado (bf16): https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic
- Modelo original de Mistral: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Articulo citado (enlace arXiv pendiente de publicacion): "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors", Richard J. Young, 2026.
