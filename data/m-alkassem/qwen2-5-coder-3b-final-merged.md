# M-Alkassem/qwen2.5-coder-3b-final-merged

## Resumen

qwen2.5-coder-3b-final-merged es un modelo de generacion de codigo derivado de Qwen/Qwen2.5-Coder-3B-Instruct, publicado por el usuario M-Alkassem en Hugging Face. Se trata del artefacto final de un pipeline de adaptacion de bajos recursos ejecutado en Google Colab sobre una GPU T4, que combina dos fases de fine-tuning: una primera orientada a codigo y una segunda orientada a comportamiento agentico, fusionadas posteriormente en un unico modelo standalone. El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2.5, con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones) y licencia Apache 2.0.

El modelo resuelve un problema concreto: adaptar un modelo de codigo de 3B a flujos de trabajo con uso de herramientas y razonamiento multi-paso, manteniendo el peso en un unico checkpoint facil de desplegar. La model card es explicita sobre el compromiso: en benchmarks de respuesta directa (plain prompting) el modelo base original sigue siendo superior, con una media global de 3,97 frente a 2,97 del adaptador de codigo y 1,77 del adaptador agentico. El valor del modelo final no esta en la respuesta directa, sino en su uso como nucleo de razonamiento dentro de un agente de codificacion ligero.

Es relevante ahora porque demuestra un flujo reproducible de adaptacion de bajo coste sobre hardware consumer (T4) y porque documenta honestamente sus limitaciones frente al modelo base. No obstante, el numero de descargas (18) y likes (1) indica que es un experimento de autor individual, no un modelo con validacion comunitaria amplia. Debe tratarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 3.085.938.688 (aprox. 3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso max_seq_length de 1024) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos en safetensors, cuantizable a FP16/BF16 por el usuario |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2.5, con 3,09 mil millones de parametros. No emplea arquitectura MoE ni mecanismos hibridos SSM. El entrenamiento se realizo en dos fases secuenciales sobre Google Colab con una GPU T4:

La primera fase (coding fine-tune) uso el dataset bigcode/self-oss-instruct-sc2-exec-filter-50k, con 4000 filas muestreadas antes del filtrado y 3993 filas utilizadas tras el filtrado, longitud maxima de secuencia de 1024, 250 pasos de entrenamiento y una perdida final de entrenamiento de aproximadamente 0,6130. La segunda fase (agent-oriented continued fine-tune) partio del adaptador de codigo y uso el dataset ernie-research/MEnvData-SWE-Trajectory, con 700 filas muestreadas, longitud maxima de secuencia de 1024, 150 pasos y una perdida final de aproximadamente 1,2940. Finalmente, ambos adaptadores se fusionaron en el modelo base para producir este checkpoint standalone.

No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion tecnica destacable es el pipeline de bajo coste en tres etapas (fine-tuning de codigo, continuacion agentica y merge final) ejecutado integramente en una T4, lo que lo hace reproducible con recursos limitados.

## Capacidades

- Generacion de texto y codigo en ingles, heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Razonamiento orientado a tareas de ingenieria de software: la model card documenta un flujo agentico (agent_v2) en el que el modelo ejecuta tests fallidos, identifica un bug, reescribe el codigo, vuelve a ejecutar los tests y se detiene tras el exito.
- Uso de herramientas en flujos restringidos (constrained tool-using workflows), segun la propia model card.
- Capacidad de actuar como nucleo de razonamiento de un agente de codificacion ligero.
- Soporte de conversacion multi-turno (tag conversational en metadatos).
- Capacidades de codigo heredadas del modelo base: generacion, explicacion y completado de codigo.
- No se documenta soporte explicito de vision, audio ni modo thinking dedicado.
- Capacidades multilingues limitadas: el repositorio declara unicamente en.

## Casos de uso

- Agente de correccion de bugs en CI/CD: el modelo puede integrarse en un bucle que ejecuta la suite de tests, interpreta los fallos, propone un parche y vuelve a ejecutar los tests hasta que pasan, tal como se documenta en el flujo agent_v2 de la model card. Es adecuado por su entrenamiento especifico sobre trayectorias de ingenieria de software (MEnvData-SWE-Trajectory).
- Asistente de codigo en editor ligero: con 3,09 B de parametros puede desplegarse en una GPU consumer y ofrecer completado y explicacion de codigo en ingles, aunque con menor calidad de respuesta directa que el modelo base.
- Prototipado de agentes de codigo en entornos con recursos limitados: sirve como nucleo de razonamiento en pipelines experimentales donde el coste de inferencia es critico, gracias a su tamano reducido y licencia Apache 2.0.
- Generacion de parches en tareas de software engineering (SWE): el fine-tuning sobre trayectorias SWE lo orienta a identificar y reescribir fragmentos de codigo defectuoso, util en herramientas internas de refactorizacion.
- Educacion y demostraciones de fine-tuning de bajo coste: el pipeline completo (dos adaptadores y merge) es reproducible en una T4, por lo que sirve como caso de estudio para investigadores que quieran replicar adaptaciones de codigo y agentes con presupuesto minimo.
- Evaluacion comparativa de adaptadores: util para estudiar el trade-off entre calidad de respuesta directa y alineacion agentica, ya que la model card publica medias comparativas entre base, adaptador de codigo y adaptador agentico.
- Despliegue en endpoints compatibles con text-generation-inference: los metadatos indican endpoints_compatible, lo que permite servirlo en infraestructura estandar de HF.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Publica unicamente una comparacion de medias globales en un benchmark de respuesta directa (plain prompting) entre el modelo base y los adaptadores del proyecto:

| Modelo | Media global (benchmark de respuesta directa) |
|---|---|
| Modelo base (Qwen2.5-Coder-3B-Instruct) | 3,97 |
| Adaptador de codigo (qwen2.5-coder-3b-unsloth-lora) | 2,97 |
| Adaptador agentico (qwen2.5-coder-3b-agent-v1) | 1,77 |

No se especifica la composicion del benchmark, el numero de tareas ni la escala de puntuacion. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano (3,09 B de parametros), en FP16 requiere aproximadamente 6,2 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 3,1 GB y en 4 bits los 1,6 GB, aunque estas cifras son estimaciones por tamano, no datos publicados.
- GPU recomendadas: el entrenamiento se realizo en una Tesla T4, lo que confirma viabilidad en GPUs de gama media con 16 GB. Para inferencia son adecuadas GPUs consumer con 8 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4070) en cuantizacion, y GPUs de datacenter (A100, H100) para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en FP16 en GPUs con 8-12 GB o mas, y en cuantizacion en GPUs con 4-6 GB.
- Opciones de despliegue: transformers (carga documentada con AutoModelForCausalLM y torch_dtype=torch.float16, device_map="auto"), text-generation-inference (metadatos endpoints_compatible). No se documenta soporte verificado de llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| M-Alkassem/qwen2.5-coder-3b-final-merged | 3,09 B | No disponible | Apache 2.0 | Fine-tuning agentico de bajo coste; menor calidad en respuesta directa que el base |
| Qwen/Qwen2.5-Coder-3B-Instruct | Aprox. 3 B | No disponible en esta ficha | Apache 2.0 | Modelo base; media global de 3,97 en el benchmark del proyecto, superior al adaptador |
| M-Alkassem/qwen2.5-coder-3b-agent-v1 | Aprox. 3 B | No disponible | No disponible | Adaptador agentico intermedio; media global de 1,77 en respuesta directa |
| M-Alkassem/qwen2.5-coder-3b-unsloth-lora | Aprox. 3 B | No disponible | No disponible | Adaptador de codigo intermedio; media global de 2,97 en respuesta directa |

La comparativa se limita a los artefactos del mismo proyecto porque la informacion proporcionada no incluye datos de modelos de terceros de la misma categoria.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base en respuesta directa: la propia model card reconoce que Qwen2.5-Coder-3B-Instruct es el modelo "answer-only" mas fuerte, con media 3,97 frente a 1,77 del adaptador agentico.
- Entrenamiento de bajos recursos: solo 3993 filas en la fase de codigo y 700 en la fase agentica, con 250 y 150 pasos respectivamente y longitud de secuencia de 1024; el riesgo de sobreajuste a esos datasets es alto.
- Perdida final de la fase agentica de 1,2940, considerablemente superior a la de la fase de codigo (0,6130), lo que sugiere menor convergencia en la adaptacion agentica.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion: al ser un modelo de 3 B con fine-tuning acotado, la generacion de APIs o funciones inexistentes es plausible; requiere validacion con tests.
- Contexto: el entrenamiento uso 1024 tokens de longitud maxima; no se documenta la ventana de contexto efectiva del modelo fusionado, por lo que no debe asumirse la del modelo base.
- Validacion comunitaria minima: 18 descargas y 1 like; no hay evaluaciones independientes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica como artefacto de proyecto.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M-Alkassem/qwen2.5-coder-3b-final-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Adaptador de codigo: https://huggingface.co/M-Alkassem/qwen2.5-coder-3b-unsloth-lora
- Adaptador agentico: https://huggingface.co/M-Alkassem/qwen2.5-coder-3b-agent-v1
- Dataset de codigo: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Dataset agentico: https://huggingface.co/datasets/ernie-research/MEnvData-SWE-Trajectory
- Paper de referencia (Qwen2.5-Coder Technical Report): https://arxiv.org/abs/2409.12186
