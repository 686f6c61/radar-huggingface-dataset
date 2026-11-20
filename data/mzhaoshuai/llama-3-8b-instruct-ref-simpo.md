# mzhaoshuai/Llama-3-8B-Instruct-ref-simpo

## Resumen

Llama-3-8B-Instruct-ref-simpo es un ajuste fino (fine-tuning) del modelo meta-llama/Meta-Llama-3-8B-Instruct publicado por mzhaoshuai en Hugging Face. El modelo forma parte del trabajo de investigación RL2R (Reinforcement Learning with Reference-Based Rewards), anteriormente conocido como RefAlign, descrito en el artículo "Reinforcement Learning with Reference-Based Rewards for Language Model Reasoning and Alignment" (arXiv:2504.09895). Se trata, por tanto, de una variante alineada mediante SimPO (Simple Preference Optimization) sobre el modelo base de Meta, entrenada con el dataset mzhaoshuai/llama3-ultrafeedback-bertscore-bart-large-mnli.

El modelo conserva la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parámetros (aproximadamente 8 mil millones) distribuidos en pesos en formato safetensors. Su relevancia es principalmente académica: sirve como artefacto reproducible del método RL2R/SimPO propuesto en el paper, permitiendo a investigadores comparar el efecto de la alineación con recompensas basadas en referencia frente al modelo Instruct original. No se trata de un modelo de propósito general pensado para producción, sino de un checkpoint de investigación con un volumen de descargas muy bajo (7 descargas en el momento de la consulta) y sin resultados de benchmarks declarados en su model card.

La licencia es llama3, heredada del modelo base de Meta, lo que impone las restricciones de uso de la Llama 3 Community License. El repositorio ocupa 16,1 GB, un tamaño coherente con pesos en precisión completa (fp16/bf16) para un modelo de 8 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens, pero este dato no se declara en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card (el modelo base Llama 3 esta entrenado principalmente en ingles y otros idiomas, pero no se especifica para este checkpoint) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso con 8 mil millones de parametros. Sobre esa base se aplica un ajuste fino de alineacion mediante SimPO, una variante de optimizacion de preferencias que elimina la necesidad de un modelo de referencia separado y utiliza una funcion de recompensa con margen. Segun la model card, el entrenamiento se realizo con 4 dispositivos (multi-GPU), batch size total de 128 (batch 2 por dispositivo con 16 pasos de acumulacion de gradiente), learning rate 1e-06 con scheduler cosine y warmup ratio 0.1, optimizador Adam (betas 0.9/0.999, epsilon 1e-08), una sola epoca y semilla 42. El framework utilizado fue Transformers 4.44.2 con PyTorch 2.2.2+cu121, Datasets 4.0.0 y Tokenizers 0.19.1.

El dataset de entrenamiento es mzhaoshuai/llama3-ultrafeedback-bertscore-bart-large-mnli, una variante de UltraFeedback filtrada o puntuada mediante BERTScore y el clasificador de inferencia de lenguaje natural BART-large-MNLI. La innovacion metodologica del trabajo RL2R consiste en utilizar recompensas basadas en referencia (reference-based rewards), es decir, comparar la respuesta generada con una respuesta de referencia para construir la senal de preferencia, en lugar de depender exclusivamente de un reward model aprendido. Los resultados declarados en el conjunto de evaluacion son: loss 1.3795, rewards/chosen -9.7179, rewards/rejected -15.1619, rewards/accuracies 0.8770, rewards/margins 5.4440, logps/rejected -1.5162, logps/chosen -0.9718, logits/rejected -1.3590 y logits/chosen -1.2077. La accuracy de recompensas de 0.8770 indica que, en el conjunto de evaluacion, el modelo asigna mayor recompensa a la respuesta elegida que a la rechazada en el 87,7 % de los pares.

## Capacidades

- Generacion de texto conversacional: hereda del modelo base Llama 3 8B Instruct la capacidad de mantener dialogos multi-turno y responder a instrucciones.
- Razonamiento y alineacion de preferencias: el ajuste con SimPO esta orientado a mejorar la calidad de las respuestas segun preferencias humanas, con una accuracy de recompensas de 0.8770 en evaluacion.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base, aunque no se declaran resultados especificos en la model card para este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada para este checkpoint concreto (el modelo base Llama 3 8B Instruct no incluye soporte nativo de tool calling en el formato de Llama 3.1; este checkpoint no declara capacidades de este tipo).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la model card; dependen del modelo base.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion en alineacion de modelos: el caso de uso principal es reproducir y comparar el metodo RL2R/SimPO frente a otros metodos de alineacion (DPO, PPO, KTO) sobre el mismo modelo base, usando los hiperparametros y el dataset documentados.
- Evaluacion de recompensas basadas en referencia: investigadores pueden utilizar el checkpoint para estudiar como las recompensas derivadas de BERTScore y BART-large-MNLI afectan la calidad de las respuestas generadas en tareas de instruccion.
- Generacion de respuestas conversacionales en ingles: al estar ajustado sobre Llama 3 8B Instruct, puede emplearse para prototipos de chatbots en entornos de investigacion donde se requiera un modelo de 8B con pesos abiertos y licencia Llama 3.
- Fine-tuning posterior: sirve como punto de partida para experimentos de alineacion adicional o para tecnicas de destilacion, dado que los pesos estan en safetensors y son compatibles con Transformers.
- Analisis de sesgos y robustez: util como checkpoint de referencia en estudios que comparan el comportamiento de modelos alineados con distintos objetivos de preferencia.
- Docencia y experimentacion academica: por su tamano (8B) y disponibilidad de pesos, encaja en laboratorios con GPUs de gama alta para practicas de alineacion y evaluacion de modelos.

## Benchmarks y rendimiento

La model card declara un model-index con la entrada "Llama-3-8B-Instruct-ref-simpo" pero con `results: []`, es decir, sin resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos numericos publicados son las metricas del conjunto de evaluacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 1.3795 |
| Rewards/chosen | -9.7179 |
| Rewards/rejected | -15.1619 |
| Rewards/accuracies | 0.8770 |
| Rewards/margins | 5.4440 |
| Logps/rejected | -1.5162 |
| Logps/chosen | -0.9718 |
| Logits/rejected | -1.3590 |
| Logits/chosen | -1.2077 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16/bf16 (16,1 GB de repositorio), se necesitan aproximadamente 16-18 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 24 GB para inferencia comoda a contexto moderado.
- Cuantizacion: no se distribuyen variantes GGUF/AWQ/GPTQ oficiales; para reducir VRAM seria necesario cuantizar manualmente con herramientas como llama.cpp o AutoGPTQ, no verificadas para este checkpoint.
- GPU recomendadas: A100 40GB/80GB, H100, L40S o RTX 4090 (24 GB) para fp16; GPUs consumer de 16 GB (RTX 4080, RTX 4070 Ti Super) quedan al limite y pueden requerir cuantizacion o offloading.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion a 8 bits o 4 bits.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` presente), vLLM y llama.cpp (previo conversion a GGUF) como opciones genericas para modelos Llama 3 8B; Ollama solo si se genera una variante GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks declarados |
|---|---|---|---|---|---|
| Llama-3-8B-Instruct-ref-simpo | 8.030.261.248 | no disponible | llama3 | safetensors | Solo metricas de evaluacion de preferencias (accuracy 0.8770) |
| meta-llama/Meta-Llama-3-8B-Instruct | ~8 mil millones | 8.192 tokens (segun model card oficial de Llama 3) | llama3 | safetensors | Resultados publicos de MMLU, HumanEval, GSM8K en la model card oficial |
| Mistral-7B-Instruct-v0.3 | ~7,2 mil millones | 32.768 tokens (segun model card oficial) | Apache 2.0 | safetensors, GGUF | Resultados publicos en la model card oficial |
| Zephyr-7B-beta | ~7,2 mil millones | 32.768 tokens (segun model card oficial) | MIT | safetensors, GGUF | Resultados publicos en la model card oficial |

La comparacion con Mistral-7B-Instruct-v0.3 y Zephyr-7B-beta es pertinente por tamano y categoria (modelos instruct de 7-8B con pesos abiertos), pero conviene senalar que este checkpoint concreto no publica benchmarks estandar, por lo que la comparacion de rendimiento directo no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion: se trata de un checkpoint derivado de un paper, con 7 descargas y 0 likes en Hugging Face; no hay evidencia de uso en produccion ni de validacion externa.
- Sin benchmarks estandar: no se declaran resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide comparar su rendimiento con el modelo base o con alternativas.
- Riesgo de alucinacion: inherente a los modelos Llama 3 8B; el ajuste SimPO no elimina este riesgo y no se documentan evaluaciones de factualidad.
- Sesgos: no se documentan analisis de sesgos en la model card; el dataset UltraFeedback filtrado con BERTScore/BART-large-MNLI puede introducir sesgos del clasificador NLI y del propio dataset original.
- Idiomas: no se especifican idiomas soportados; el modelo base Llama 3 esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Contexto: no se declara la longitud de contexto efectiva de este checkpoint; se hereda del modelo base, pero no hay confirmacion en la model card.
- Licencia: la Llama 3 Community License impone restricciones de uso comercial (incluyendo la clausula de licencia adicional para empresas con mas de 700 millones de usuarios mensuales) y obligaciones de atribucion; revisar los terminos antes de cualquier uso comercial.
- Formato: solo se distribuyen pesos safetensors; no hay variantes cuantizadas oficiales, lo que limita el despliegue en hardware consumer de gama media.
- Reproducibilidad: los hiperparametros estan documentados, pero no se especifica el hardware exacto ni la version del codigo de entrenamiento mas alla de las versiones de librerias.

## Enlaces

- Hugging Face: https://huggingface.co/mzhaoshuai/Llama-3-8B-Instruct-ref-simpo
- Repositorio GitHub RL2R (rama alignment): https://github.com/mzhaoshuai/RL2R/tree/alignment
- Paper en arXiv: https://arxiv.org/abs/2504.09895
- Paper en Hugging Face: https://huggingface.co/papers/2504.09895
- Dataset de entrenamiento: https://huggingface.co/datasets/mzhaoshuai/llama3-ultrafeedback-bertscore-bart-large-mnli
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
