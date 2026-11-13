# richardyoung/Qwen2.5-32B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-32B-Instruct-heretic1x-code-GGUF es una distribucion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-heretic1x-code, una version "abliterada" (con los mecanismos de rechazo eliminados) de Qwen/Qwen2.5-32B-Instruct. El autor, Richard J. Young, aplico la herramienta Heretic 1.x (heretic-llm 1.4.0) mediante ablacion direccional de rango 1, usando direcciones de rechazo derivadas de codigo. El resultado es un modelo de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) que responde a muchas solicitudes que el modelo original rechaza.

La relevancia de esta publicacion es fundamentalmente de investigacion: forma parte del conjunto de modelos evaluados en un articulo sobre como la regla de seleccion puede invertir las comparaciones entre herramientas de abliteracion (Heretic 1.x, Heretic 2.0, OBLITERATUS y lanzamientos comunitarios sobre Qwen2.5 y Qwen2.5-Coder). No esta pensado como asistente de proposito general, sino como objeto de estudio para medir la eliminacion de rechazos y las defensas frente a ella.

Esta ficha concreta cubre los archivos GGUF generados a partir de los pesos en safetensors del modelo fuente, listos para su uso con llama.cpp y Ollama. El repositorio ocupa 19,9 GB y actualmente incluye una cuantizacion Q4_K_M (19,9 GB) y una matriz de importancia (imatrix, 30 MB); el autor anuncia que anadira IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B-Instruct; no se detalla en la informacion disponible) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado en esta ficha) |
| Tipos de cuantizacion | Q4_K_M disponible; anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0; incluye imatrix (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0) |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 (con las mismas restricciones de uso que el modelo fuente) |
| Formato de pesos | GGUF (safetensors en el modelo fuente) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct, un transformer decoder-only de aproximadamente 32,8 mil millones de parametros. Sobre esa base, el autor aplico Heretic 1.x (heretic-llm 1.4.0), que realiza una ablacion direccional de rango 1: se identifica una direccion de rechazo en el espacio de activaciones y se resta de los pesos para suprimir el comportamiento de negativa. En esta variante concreta, las direcciones de rechazo se derivaron a partir de codigo ("code-derived refusal directions"), lo que diferencia el proceso de otras ablaciones genericas.

El proceso de seleccion consistio en 200 pruebas y se eligio la variante con menos rechazos en el conjunto de desarrollo sujeto a una divergencia KL (primer token) respecto al original menor o igual a 0,01. La variante seleccionada presenta una KL de 0,0092 y 30 rechazos por palabra clave sobre los 100 prompts de ajuste. En el conjunto de 972 prompts daninos retenidos, evaluado con el juez WildGuard, el rechazo pasa del 76,8% en el original al 65,3% (635/972) en el modelo abliterado. Estos numeros corresponden al modelo en bf16 y no a los archivos GGUF, que no fueron evaluados en el articulo y cuyo comportamiento de rechazo puede variar por la cuantizacion.

Los archivos GGUF se generaron con llama.cpp (commit 468fde9): conversion con `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize`, ejecutado en CPU. Los pesos safetensors de origen (revision ee757f697532) se verificaron contra sus sumas SHA-256, y cada archivo Q4_K_M se cargo y respondio a un prompt de prueba antes de subirse.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matematicas a nivel del modelo base (no se aportan evaluaciones especificas del modelo abliterado).
- Generacion de codigo, reforzada por el uso de direcciones de rechazo derivadas de codigo en el proceso de ablacion.
- Respuesta a solicitudes que el modelo original rechaza, que es el objetivo declarado de la ablacion.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: la model card declara unicamente ingles (en).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre eliminacion de rechazos: el modelo sirve como sujeto de estudio para medir cuanto se reduce la tasa de negativas tras la ablacion y como se compara con Heretic 2.0, OBLITERATUS y otras variantes comunitarias.
- Evaluacion de defensas frente a la abliteracion: permite construir clasificadores o filtros que detecten respuestas a prompts daninos y validar su eficacia contra un modelo con rechazos suprimidos.
- Analisis de calibracion de cuantizaciones: al disponer de imatrix y de varias cuantizaciones planificadas, se puede estudiar como la cuantizacion altera el comportamiento de rechazo respecto al bf16.
- Reproducibilidad de experimentos: los SHA-256 incluidos y el procedimiento documentado (commit de llama.cpp, revision de safetensors) permiten replicar la construccion de los GGUF.
- Despliegue local con llama.cpp u Ollama para pruebas de inferencia: la cuantizacion Q4_K_M (19,9 GB) permite ejecutar el modelo en hardware de gama alta de consumo, facilitando experimentos sin infraestructura de centro de datos.
- Estudio de la divergencia KL como metrica de fidelidad: la KL de 0,0092 respecto al original permite analizar el equilibrio entre supresion de rechazos y conservacion de capacidades.
- Comparacion de metodologias de abliteracion: el modelo forma parte de un conjunto disenado para evaluar como la regla de seleccion puede invertir el ranking entre herramientas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del modelo en bf16, no los de los GGUF:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 76,8% | 65,3% (635/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (prueba seleccionada) | no disponible | 30 |
| Divergencia KL de primer token respecto al original (prueba seleccionada) | no disponible | 0,0092 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni para el modelo fuente ni para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 20-22 GB solo para los pesos; con cache KV y contexto adicional, se recomienda reservar 24 GB o mas.
- Cuantizaciones futuras: IQ3_M e IQ4_XS quedarian por debajo de los 20 GB; Q5_K_M en torno a 23-24 GB; Q6_K cerca de 27-28 GB; Q8_0 alrededor de 35 GB (estimaciones orientativas a partir del tamano de parametros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para Q4_K_M; para Q6_K y Q8_0 se necesita una GPU de 40 GB o mas, o bien offload parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) con Q4_K_M, dependiendo de la longitud de contexto utilizada.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...:Q4_K_M`), Ollama (`ollama run hf.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-code-GGUF:Q4_K_M`). Otros runners compatibles con GGUF no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-heretic1x-code (bf16) | 32,8 B | no disponible | 65,3% | apache-2.0 | safetensors en HF |
| Qwen2.5-32B-Instruct-heretic1x-code-GGUF (esta ficha) | 32,8 B | no disponible | no evaluado en GGUF | apache-2.0 | GGUF en HF |
| Qwen/Qwen2.5-32B-Instruct (original) | 32,8 B | no disponible | 76,8% | apache-2.0 | safetensors y GGUF en HF |
| Heretic 2.0 / OBLITERATUS sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | mencionados en el articulo citado |

La comparacion con Heretic 2.0 y OBLITERATUS se cita en el articulo de Young, pero sus cifras concretas no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente de proposito general: el autor lo declara explicitamente y advierte de que cumple muchas solicitudes que el original rechaza.
- La ablacion solo reduce el rechazo del 76,8% al 65,3% en el conjunto evaluado; no lo elimina por completo.
- Riesgo elevado de producir contenido danino, sesgado o inapropiado al haberse suprimido parte del comportamiento de negativa.
- Las cifras publicadas corresponden al modelo bf16; la cuantizacion puede alterar el comportamiento de rechazo y no fue evaluada en el articulo.
- Idiomas: solo se declara ingles, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no confirmada en la informacion disponible para esta variante.
- Licencia apache-2.0 con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso licito.
- No se han publicado evaluaciones de capacidades generales (razonamiento, codigo, matematicas) para esta variante abliterada, por lo que no se puede garantizar que conserve el rendimiento del original.
- Alucinacion: no se aportan datos especificos; el riesgo es el del modelo base, potencialmente alterado por la ablacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-code-GGUF
- Modelo fuente (bf16): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-code
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Articulo citado: Young, R. J. "The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder" (enlace arXiv pendiente de publicacion)
- Herramienta Heretic (heretic-llm 1.4.0): no se proporciona enlace en la informacion disponible
- llama.cpp (commit 468fde9): no se proporciona enlace en la informacion disponible
