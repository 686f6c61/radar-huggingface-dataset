# davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-12-integral-94cd76c8fc91

## Resumen

Este repositorio contiene un checkpoint archivado del modelo `12-Integral`, resultado de la ejecucion `mopd-v2-r1-p1r8-teachers-20261003-115039` (step 149, W&B run `25ab777e`), publicado por David Heineman. Se trata de un "teacher" (profesor) entrenado mediante destilacion on-policy (OPD, On-Policy Distillation) dentro de la metodologia RLVE (Reinforcement Learning from Verifiable Environments), cuyo paper de referencia es arXiv:2511.07317. El entrenamiento se realizo durante 150 steps sobre un unico entorno, denominado `Integral`, correspondiente a una tarea de integracion matematica.

El modelo pertenece a la familia Qwen2/Qwen2.5 de 1,5 B de parametros: el recuento real de pesos en safetensors es de 1.777.088.000 parametros (~1,78 B), con un repositorio de 3,6 GB. La model card indica que el checkpoint esta en formato `hf-safetensors` y que proviene de una ruta de entrenamiento tipo scratch/Megatron. La coleccion asociada ("RLVE OPD Teachers") lo describe como un Qwen 2.5 1.5B Instruct ajustado durante 150 steps, mientras que repositorios hermanos de la misma serie identifican la base como DeepSeek-R1-Distill-Qwen-1.5B; esta discrepancia no queda resuelta en la informacion disponible.

Su relevancia es principalmente investigadora: no es un modelo de proposito general listo para produccion, sino un artefacto reproducible de un experimento de destilacion por entorno. Resulta util para replicar resultados, estudiar el efecto de la OPD sobre modelos pequenos y servir de punto de partida para fine-tuning especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, tag `qwen2`) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la familia Qwen2.5 de 1,5 B soporta hasta 32.768 tokens |
| Tipos de cuantizacion | no publicadas en el repositorio (solo safetensors en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf-safetensors`) |

Otros datos: tamano del repositorio 3,6 GB; checkpoint final en el step 149; fecha de creacion 2026-10-05; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo Qwen2, con aproximadamente 1,78 B de parametros totales, coherente con el modelo Qwen2.5-1.5B (1,54 B de parametros no de embedding y 1,78 B contando embeddings). No se especifican en el repositorio detalles de configuracion como numero de capas, cabezas de atencion o dimension oculta, por lo que se remiten a los valores de la familia base.

El entrenamiento se enmarca en RLVE/OPD y se realizo sobre un unico entorno (`Integral`) durante 150 steps y 149 checkpoints intermedios registrados. Segun los repositorios hermanos de la coleccion, el proceso uso cuatro prompts y 16 rollouts por step, con prompts de dificultad 0 y sin filtrado de prompts tipo DAPO. La model card del propio archivo no detalla el dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF/DPO; esa informacion no esta disponible.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredadas de la base Qwen2.5/DeepSeek-R1-Distill.
- Resolucion de problemas de integracion matematica, que es el dominio especifico del entorno de entrenamiento (`Integral`).
- Razonamiento tipo cadena de pensamiento, presumiblemente por la base R1-Distill, aunque no se confirma en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking", vision o audio: no disponible en la informacion proporcionada. No se declara ninguna capacidad multimodal.

## Casos de uso

- Destilacion on-policy como profesor: el modelo esta pensado para actuar como teacher en OPD, generando trayectorias o distribuciones de referencia que un modelo alumno aprende a imitar en el entorno `Integral`.
- Replicacion de experimentos RLVE: permite reproducir exactamente el checkpoint final de la ejecucion `mopd-v2-r1-p1r8-teachers-20261003-115039` y validar los resultados de arXiv:2511.07317.
- Generacion de datos sinteticos de razonamiento matematico: puede emplearse para producir soluciones detalladas de integrales que alimenten datasets de entrenamiento para modelos mayores.
- Fine-tuning especifico posterior: al ser un checkpoint denso de ~1,78 B en safetensors, sirve como inicializacion para LoRA o ajuste completo en tareas matematicas o de razonamiento.
- Evaluacion de metodologias de destilacion: comparar este checkpoint con otros teachers de la misma coleccion (por ejemplo, DiscreteLogarithm) para medir transferencia por entorno.
- Inferencia local en prototipos: con ~1,78 B de parametros cabe en GPUs de consumo, lo que permite pruebas offline de generacion de soluciones matematicas sin coste de API.
- Analisis de comportamiento en entrenamiento: la ruta scratch original y el W&B run ID permiten auditar la evolucion del modelo a lo largo de los 149 steps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de integracion, y los resultados de busqueda no aportan cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 3,6 GB de pesos mas memoria para el contexto y activaciones (aproximadamente 4-5 GB en la practica).
- VRAM estimada en INT8: aproximadamente 1,8-2 GB de pesos.
- VRAM estimada en INT4: aproximadamente 0,9-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna de 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en FP16; en INT4 cabe incluso en GPUs de 4 GB.
- GPU de datacenter: A100, H100 o L40S sobredimensionadas para inferencia individual, utiles si se sirven varias replicas.
- Si cabe en consumer GPU: si, con holgura.
- Opciones de despliegue: al ser un modelo Qwen2 denso, es compatible con vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF, y con Transformers estandar para carga directa en safetensors. No se han publicado cuantizaciones GGUF/GPTQ/AWQ oficiales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (12-Integral, step 149) | ~1,78 B | no disponible | no disponible | safetensors | Teacher OPD especifico para el entorno Integral |
| Qwen2.5-1.5B-Instruct | ~1,78 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF, multiples | Modelo instruct generalista de referencia |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,78 B | 32.768 tokens (segun ficha publica) | MIT | safetensors, GGUF | Destilado de razonamiento, base probable de este checkpoint |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Alternativa pequena orientada a instrucciones |

Los datos de contexto y licencia de los modelos comparativos corresponden a sus fichas publicas y pueden variar; conviene verificarlos antes de usarlos en produccion. No se dispone de cifras de benchmark comparativas para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint archivado de investigacion, no un modelo instruct pulido para uso final; puede responder de forma degradada fuera de su dominio de entrenamiento.
- Especializacion estrecha: fue entrenado unicamente sobre el entorno `Integral` de dificultad 0, por lo que su rendimiento fuera de tareas de integracion es incierto.
- Riesgo de alucinacion: como todo modelo generativo de ~1,5 B, puede producir pasos de razonamiento plausibles pero incorrectos, especialmente en matematicas.
- Licencia no disponible: no se puede confirmar si permite uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados sin especificar: no se garantiza un comportamiento correcto en castellano ni en idiomas distintos del ingles.
- La base exacta (Qwen2.5-1.5B-Instruct frente a DeepSeek-R1-Distill-Qwen-1.5B) no esta confirmada en la model card del archivo, lo que complica la trazabilidad.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los sesgos de la base y de los datos de entrenamiento no publicados.
- Al ser un artefacto de un unico experimento con 0 descargas y 0 likes, carece de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-12-integral-94cd76c8fc91
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Teacher relacionado (Integral, R1Distill, step 149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Integral-step149
- Teacher relacionado (DiscreteLogarithm): https://huggingface.co/davidheineman/opd-teacher-R1Distill-DiscreteLogarithm-step149
- Paper de referencia RLVE: https://arxiv.org/abs/2511.07317
- Sitio del autor: https://davidheineman.com/
