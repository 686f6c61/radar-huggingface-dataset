# richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic-GGUF

## Resumen

Olmo-3.1-32B-Instruct-MPOA-heretic-GGUF es la distribucion en formato GGUF del modelo richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic, una version "abliterated" (con el comportamiento de rechazo eliminado) del modelo allenai/Olmo-3.1-32B-Instruct desarrollado por el Allen Institute for AI. La modificacion se realizo con Heretic 2.0 aplicando MPOA (magnitude-preserving orthogonal ablation, ablacion ortogonal con preservacion de magnitud), la tecnica por defecto de Heretic. El autor es Richard J. Young y el modelo forma parte de un estudio sobre la dificultad creciente de la abliteracion en distintas familias de LLM.

El modelo conserva la arquitectura y el tamano del original: 32.233.522.176 parametros (aproximadamente 32,2 mil millones) en pesos safetensors. El repositorio GGUF incluye cuantizaciones Q4_K_M (19,5 GB) y Q8_0 (34,3 GB), con planes de anadir IQ3_M, IQ4_XS, Q5_K_M y Q6_K. El modelo esta pensado exclusivamente para investigacion sobre eliminacion de rechazos, su medicion y las defensas frente a ella, no como asistente de proposito general.

La relevancia actual del modelo es doble: por un lado, ofrece un punto de comparacion reproducible para estudiar como las tecnicas de abliteracion afectan a modelos de distintas generaciones; por otro, su publicacion en GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, lo que facilita la investigacion fuera de entornos con GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: allenai/Olmo-3.1-32B-Instruct) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0; en preparacion IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base es allenai/Olmo-3.1-32B-Instruct, un transformer de 32,2 mil millones de parametros, pero la model card no especifica la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica destacable es el proceso de abliteracion MPOA aplicado con Heretic 2.0. Segun los datos del autor, la seleccion de la direccion de ablacion se realizo mediante una busqueda de 100 ensayos con la regla de elegir el menor numero de rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. El ensayo seleccionado presenta una divergencia KL de primer token de 0,092 respecto al modelo original. La conversion a GGUF se realizo con llama.cpp (commit 468fde9) mediante convert_hf_to_gguf.py con outtype bf16 y posterior llama-quantize en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia (importance matrix) calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct original.
- Cumplimiento de peticiones que el modelo original rechaza: el rechazo en 972 prompts daninos retenidos (juez WildGuard) baja del 84,1% al 65,0% (632/972).
- Capacidad de instrucciones y conversacion multi-turno (etiqueta conversational).
- Compatible con endpoints y con el pipeline text-generation de Hugging Face.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como sujeto de estudio para medir la eficacia de MPOA y comparar la resistencia a la eliminacion de rechazos entre generaciones de LLM, tal como se describe en el paper del autor.
- Evaluacion de defensas frente a la eliminacion de rechazos: permite entrenar y validar clasificadores o filtros de seguridad que detecten respuestas daninas en modelos abliterated, usando el par original/abliterated como control.
- Reproducibilidad de experimentos: las sumas SHA-256 y la documentacion del proceso de cuantizacion permiten replicar los resultados en entornos con llama.cpp u Ollama.
- Analisis de calibracion de cuantizaciones: la disponibilidad de Q4_K_M y Q8_0, junto con la matriz de importancia, permite estudiar como la cuantizacion altera el comportamiento de rechazo, advertencia que el propio autor senala.
- Despliegue local para pruebas de robustez: con Q4_K_M (19,5 GB) el modelo se puede ejecutar en GPUs de consumo de 24 GB para pruebas de red teaming controladas.
- Estudio de divergencia KL y preservacion de capacidades: el dato de KL de primer token (0,092) permite analizar el equilibrio entre eliminar rechazos y conservar el comportamiento del modelo original.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de abliteracion del modelo en precision completa (bf16), no de los ficheros GGUF:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 84,1% | 65,0% (632/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 84 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,092 |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que los ficheros cuantizados no fueron evaluados en el paper y que la cuantizacion puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20-22 GB para Q4_K_M (fichero de 19,5 GB) y aproximadamente 35-37 GB para Q8_0 (fichero de 34,3 GB), incluyendo overhead de contexto.
- GPU recomendadas: A100 40 GB o H100 para Q8_0; RTX 4090 (24 GB), RTX 3090 (24 GB) o A6000 (48 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090/3090 de 24 GB; Q8_0 requiere GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run hf.co/richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic-GGUF:Q4_K_M), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic-GGUF (este modelo) | 32,2 B | no disponible | apache-2.0 | GGUF | Abliterated con MPOA/Heretic 2.0; rechazo 65,0% |
| allenai/Olmo-3.1-32B-Instruct | 32,2 B | no disponible | no disponible | safetensors | Modelo original sin abliterar; rechazo 84,1% |
| richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic | 32,2 B | no disponible | apache-2.0 | safetensors | Version en precision completa del mismo modelo abliterated |

No se dispone de datos de benchmarks de capacidades generales para comparar el rendimiento con alternativas de la misma categoria. La comparacion con otras familias abliterated (Qwen, Gemma, Mistral Small) se menciona en el paper del autor, pero no se aportan cifras en la informacion disponible.

## Limitaciones y advertencias

- El modelo elimina parcialmente el comportamiento de rechazo: el 65,0% de rechazos restantes sobre 972 prompts daninos indica que sigue rechazando una parte significativa, pero cumple muchas peticiones que el original rechaza.
- No esta disenado como asistente de proposito general; el autor lo publica exclusivamente para investigacion sobre abliteracion y sus defensas.
- La cuantizacion puede alterar el comportamiento de rechazo; los ficheros GGUF no fueron evaluados en el paper.
- Soporte limitado al ingles; no se documentan capacidades multilingues.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo abliterated, los sesgos del original pueden amplificarse al reducirse los rechazos.
- Licencia apache-2.0, pero con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso legal.
- Longitud de contexto no documentada, lo que limita la planificacion de despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic-GGUF
- Modelo base en precision completa: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic
- Modelo original de Allen AI: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Paper citado (enlace arXiv pendiente de publicacion): Young, R. J. "Is Abliteration Getting Harder? Not Uniformly: Refusal Removal by Direction-Based Ablation and ARA in Heretic on the Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 LLMs Versus Their Predecessors", 2026.
- Repositorio llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
