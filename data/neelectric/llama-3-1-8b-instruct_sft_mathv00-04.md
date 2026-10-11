# Neelectric/Llama-3.1-8B-Instruct_SFT_mathv00.04

## Resumen

Llama-3.1-8B-Instruct_SFT_mathv00.04 es un ajuste supervisado (SFT) del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario Neelectric en HuggingFace. El entrenamiento se ha realizado con la libreria TRL sobre el dataset Neelectric/OpenR1-Math-220k_all_Llama3_4096toks, una recopilacion de problemas y soluciones matematicas derivada del esfuerzo abierto Open-R1. El objetivo declarado es especializar un modelo de proposito general de 8.030 millones de parametros en razonamiento matematico y resolucion de problemas paso a paso.

El modelo conserva la arquitectura transformer decoder-only densa de Llama 3.1, con 8B de parametros, atencion con RoPE y ventana de contexto nativa de hasta 128.000 tokens en el modelo base. Sin embargo, el dataset de entrenamiento fue tokenizado a 4.096 tokens por muestra (segun la nomenclatura del propio dataset), lo que sugiere que el ajuste se ha centrado en trazas de razonamiento relativamente cortas. Se trata de un experimento de investigacion reproducible, no de un modelo con soporte comercial ni con evaluacion publicada.

Su relevancia es acotada pero clara: forma parte de una familia de variantes (mathv00.04, Math-220kv00.08, mathsp_ewc_v00.08, MoT_mathv00.04) que documentan distintas estrategias de SFT sobre el mismo corpus matematico. Es util como punto de partida para estudiar como el SFT puro sobre datos de matematicas afecta a un modelo instruct generalista, y como base para posteriores etapas de RL o DPO. Con cero descargas y cero likes en el momento de la consulta, no cuenta con validacion de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el dataset de ajuste usa secuencias de 4.096 tokens; no se declara contexto propio de este checkpoint |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision completa; cualquier cuantizacion seria derivada por terceros) |
| Idiomas soportados | no disponible (no declarado; hereda los del modelo base, predominantemente ingles) |
| Licencia | no disponible en los metadatos del repositorio; la model card indica "licence: license". Al ser derivado de Llama 3.1, se le aplica la Llama 3.1 Community License |
| Formato de pesos | safetensors |
| Tamano del repositorio | 32,1 GB |
| Libreria de inferencia | transformers, text-generation-inference (tag endpoints_compatible) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con normalizacion RMSNorm pre-normalizada, activacion SwiGLU en el MLP, atencion por grupos (GQA) con 32 cabezas de consulta y 8 de clave/valor, y embeddings rotatorios (RoPE). El modelo base fue entrenado por Meta sobre del orden de 15 billones de tokens y posteriormente alineado con SFT y DPO, por lo que este checkpoint parte ya de un modelo conversacional funcional. No hay cambios de atencion, ni decodificacion especulativa, ni capas de estado recurrente: es un ajuste de pesos, no un rediseno.

El entrenamiento de este checkpoint consiste en un unico stage de SFT ejecutado con TRL (version 1.1.0.dev0), sobre el dataset Neelectric/OpenR1-Math-220k_all_Llama3_4096toks. Ese corpus es una version procesada del conjunto OpenR1-Math-220k, con muestras truncadas o formateadas a 4.096 tokens y tokenizadas con el tokenizador de Llama 3. El run esta registrado en Weights & Biases (proyecto neelectric/open-r1_math, run 29u5t0q9). Las versiones de framework declaradas son Transformers 4.57.6, PyTorch 2.9.0, Datasets 5.0.1 y Tokenizers 0.22.2. No se documentan hiperparametros (learning rate, epochs, scheduler, tamano de batch global), ni si hubo fases posteriores de RLHF, DPO, GRPO o rejection sampling. Tampoco se especifica la composicion exacta del dataset ni si se filtro por dificultad o por verificabilidad de la respuesta final.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento matematico paso a paso: resolucion de problemas aritmeticos, algebraicos y de tipo competicion, con trazas de solucion explicitas, que es el foco del ajuste.
- Generacion de codigo y matematicas aplicadas en la medida en que aparezcan en el corpus OpenR1-Math, aunque no hay evidencia publicada de mejora especifica en programacion.
- Seguimiento de instrucciones y formato de chat mediante la plantilla de Llama 3.1.
- Soporte de tool calling / function calling: no validado en este checkpoint; el modelo base lo soporta, pero el SFT matematico puede haber degradado esta capacidad.
- Comportamiento agente y razonamiento multi-paso: no documentado especificamente para este checkpoint.
- Capacidades multilingues: no declaradas; se asume el comportamiento mayoritariamente en ingles del modelo base.
- Modo thinking explicito, vision o audio: no disponibles. No es un modelo de razonamiento con tokens de pensamiento separados ni multimodal.
- Capacidad de verificacion formal de demostraciones: no disponible.

## Casos de uso

- Generacion de datasets de soluciones matematicas: el modelo puede producir trazas de solucion paso a paso en ingles para problemas de nivel secundaria y competicion, que despues se filtran por exactitud de la respuesta final y se reutilizan para entrenar modelos mayores o para rejection sampling.
- Tutorizacion automatica de matematicas: integrado en un chatbot educativo, explica el procedimiento de resolucion en varios turnos, aprovechando la plantilla conversacional de Llama 3.1 y su contexto amplio para mantener el historial de la sesion.
- Evaluacion comparativa de estrategias de SFT: sirve como linea base frente a las otras variantes de Neelectric (Math-220kv00.08, mathsp_ewc_v00.08, MoT) para medir el efecto del volumen de datos, el weighting o el tipo de ajuste sobre GSM8K o MATH.
- Preprocesado de enunciados y normalizacion de notacion matematica: convertir problemas en texto libre a LaTeX o a un formato estructurado antes de pasarlos a un solver simbolico.
- Generacion de problemas sinteticos con solucion: producir pares problema-solucion para aumentar un corpus de entrenamiento, con control de dificultad mediante prompting.
- Asistente interno para ingenieros que necesitan derivar formulas o comprobar calculos de caracteristicas, siempre con supervision humana y verificacion posterior.
- Punto de partida para RL con verificacion: al estar ya ajustado en matematicas, es un candidato razonable para aplicar GRPO o RLOO con recompensa basada en comprobacion de respuesta, en lugar de partir del Instruct original.
- Despliegue en Text Generation Inference: el repositorio esta etiquetado como endpoints_compatible, por lo que puede servirse con TGI o con transformers sin conversion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, no hay resultados de GSM8K, MATH, MMLU, HumanEval ni de ningun otro conjunto, y el repositorio de HuggingFace no adjunta tarjeta de resultados. Tampoco se documentan metricas de perdida de validacion ni comparaciones con el modelo base Instruct.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,1 GB solo para los pesos, mas entre 1 y 3 GB de cache KV segun longitud de secuencia y tamano de lote. En la practica, 24 GB es el minimo comodo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos. Cabe en tarjetas de 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos. Cabe en tarjetas de 8-10 GB con contexto moderado.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio concurrente en bf16; L40S o A6000 para despliegue en una sola tarjeta; RTX 4090 (24 GB) para bf16 con lotes pequenos o cuantizado.
- Cabe en GPU de consumo: si. En RTX 4090 en bf16 con contexto y lote moderados; en RTX 3090 o 4080 mediante cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers, Text Generation Inference (tag endpoints_compatible), vLLM y SGLang para safetensors. No hay GGUF publicado en el repositorio, por lo que llama.cpp u Ollama requeririan una conversion propia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni resultados de carga concurrente.
- Almacenamiento: el repositorio ocupa 32,1 GB, muy por encima de los ~16 GB de los pesos en bf16, lo que sugiere artefactos adicionales (estados de optimizador o checkpoints intermedios). Conviene revisar los archivos antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct_SFT_mathv00.04 | 8,03B | 128k en el base; ajuste sobre secuencias de 4.096 tokens | SFT en matematicas (OpenR1-Math-220k) | no declarada en el repo; sujeta a Llama 3.1 Community License | safetensors en HF, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Instruct generalista | Llama 3.1 Community License | Ampliamente disponible, con GGUF y quantizaciones de terceros |
| Qwen2.5-Math-7B-Instruct | 7,6B (aprox.) | 4k en la variante Math | Matematicas, con etapas de RL y verificacion | Apache 2.0 en la mayoria de variantes Qwen2.5 | Disponible en HF, con soporte de vLLM y cuantizaciones |
| DeepSeek-R1-Distill-Llama-8B | 8,03B | 128k | Destilacion de trazas de razonamiento largo | MIT (sobre pesos Llama, con condiciones) | Muy disponible, con GGUF y amplia adopcion |

Las cifras de parametros y contexto de las alternativas corresponden a sus especificaciones publicas habituales. No hay benchmarks de este checkpoint que permitan comparar rendimiento real, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perdida de validacion, ni comparacion con el modelo base. No se puede afirmar que el ajuste mejore el rendimiento matematico; el SFT sobre un unico corpus puede provocar olvido catastrofico en otras capacidades.
- Riesgo de olvido catastrofico: el ajuste sobre un corpus exclusivamente matematico puede degradar la calidad del texto general, el soporte de tool calling y el multilingue respecto al Instruct original. No hay evaluacion que lo descarte.
- Riesgo de alucinacion en matematicas: como cualquier modelo de lenguaje sin verificador externo, puede producir pasos intermedios plausibles pero incorrectos. La respuesta final debe validarse con un solver simbolico o con comprobacion numerica.
- Licencia no declarada: los metadatos de HuggingFace no indican licencia y la model card solo contiene el marcador "licence: license". Al derivar de Llama 3.1, se hereda la Llama 3.1 Community License, con sus restricciones de uso (clausula de 700 millones de usuarios mensuales, requisitos de atribucion y naming). No debe asumirse uso comercial libre sin revisar esa licencia.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue. El corpus OpenR1-Math es mayoritariamente en ingles.
- Sesgos: no evaluados. Se heredan los sesgos del corpus de preentrenamiento de Llama 3.1 y los del dataset de matematicas, sin auditoria publicada.
- Contexto efectivo incierto: aunque el modelo base soporta 128k tokens, el ajuste se realizo sobre secuencias de 4.096 tokens. El comportamiento mas alla de esa longitud no esta validado y puede degradarse.
- Tamano del repositorio desproporcionado: 32,1 GB para un modelo de 8B en bf16 sugiere artefactos de entrenamiento que incrementan el coste de descarga.
- Sin soporte ni mantenimiento: cero descargas y cero likes en el momento de la consulta. No hay garantia de actualizaciones, issues atendidos ni soporte del autor.
- Reproducibilidad parcial: se publica el run de W&B y las versiones de framework, pero no los hiperparametros ni la receta completa de filtrado del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Neelectric/Llama-3.1-8B-Instruct_SFT_mathv00.04
- Dataset de entrenamiento: https://huggingface.co/datasets/Neelectric/OpenR1-Math-220k_all_Llama3_4096toks
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/neelectric/open-r1_math/runs/29u5t0q9
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana v00.08: https://huggingface.co/Neelectric/Llama-3.1-8B-Instruct_SFT_Math-220kv00.08
- Variante hermana mathsp_ewc_v00.08: https://featherless.ai/models/Neelectric/Llama-3.1-8B-Instruct_SFT_mathsp_ewc_v00.08
- Ficha de la variante v00.08 en Featherless: https://featherless.ai/models/Neelectric/Llama-3.1-8B-Instruct_SFT_Math-220kv00.08
- Variante MoT: https://socket.dev/huggingface/package/neelectric/llama-3.1-8b-instruct_sft_mot_mathv00.04
- Proyecto Open-R1: https://github.com/huggingface/open-r1
