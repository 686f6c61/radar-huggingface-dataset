# davidheineman/opd-teacher-Q2.5I-Differentiate-step149

## Resumen

opd-teacher-Q2.5I-Differentiate-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por David Heineman, investigador pre-doctoral del Allen Institute for AI (Ai2). No es un modelo de propósito general: se trata de un "teacher" (modelo profesor) entrenado con RLVE y GRPO durante 150 actualizaciones sobre un único entorno de entrenamiento por refuerzo denominado `Differentiate`, con dificultad 0. Su función es actuar como fuente de supervisión densa a nivel de token en un experimento de destilación on-policy (OPD) que abarca 32 entornos.

El modelo conserva la arquitectura del Qwen2.5-1.5B-Instruct original, un transformer decoder-only denso de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), y el repositorio pesa 3,1 GB en formato safetensors. La model card indica que los pesos se convirtieron desde el checkpoint nativo final y se validaron contra los nombres y formas de tensor del modelo base, y que se incluye la licencia Apache 2.0 original de Qwen.

Su relevancia es fundamentalmente metodológica: forma parte de una colección de 32 modelos profesor publicados abiertamente para estudiar cómo se comporta la destilación on-policy cuando los datos de supervisión proceden de entornos de RL sintéticos y especializados. Para un desarrollador, el interés práctico es limitado fuera de ese contexto de investigación, ya que el modelo está especializado en una tarea estrecha y no se han publicado evaluaciones de capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, segun el campo `qwen2` de los tags; detalles de capas y cabezas no disponibles en la informacion proporcionada) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 mil millones), segun los pesos safetensors |
| Parametros activos | No aplica: modelo denso, no es Mixture of Experts |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | No disponible: no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en el repositorio |
| Idiomas soportados | Ingles (campo `language: en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de entrenamiento | RLVE + GRPO, 150 actualizaciones |
| Entorno de entrenamiento | `Differentiate`, dificultad 0 |
| Tamano del repositorio | 3,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU y atencion con RoPE. La model card no describe modificaciones estructurales: el autor indica explicitamente que los pesos se convirtieron desde el checkpoint nativo final y se validaron contra los nombres y formas de tensor del modelo base, lo que implica que la topologia es identica a la del Qwen2.5-1.5B-Instruct. No se dispone de informacion sobre el numero de capas, dimension oculta, cabezas de atencion ni vocabulario en la documentacion proporcionada.

En cuanto al entrenamiento, el modelo se optimizo con GRPO (Group Relative Policy Optimization) durante 150 actualizaciones sobre el entorno `Differentiate` a dificultad 0, dentro del marco RLVE (Reinforcement Learning from Verifiable Environments, referenciado como arXiv:2511.07317). El checkpoint `step149` corresponde al indice final basado en cero, es decir, la actualizacion numero 150. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases previas de SFT o DPO, aunque el punto de partida ya es un modelo instruct. El modelo se publica como parte de un experimento de destilacion on-policy con 32 entornos, en el grupo de barrido `opd-teachers-20260927-191939`, y los registros completos estan disponibles en la ejecucion de Weights & Biases `6d01898e`.

## Capacidades

- Generacion de texto conversacional: hereda la interfaz de chat del Qwen2.5-1.5B-Instruct (etiqueta `conversational`), por lo que acepta plantillas de dialogo multi-turno.
- Razonamiento especializado en el entorno `Differentiate`: el entrenamiento con GRPO sobre este entorno busca reforzar la resolucion de la tarea concreta que define dicho entorno (por el nombre, previsiblemente calculo diferencial; la model card no lo detalla).
- Generacion de trazas de razonamiento utilizables como supervision densa a nivel de token para destilar un modelo alumno en un experimento OPD.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad especifica; el entrenamiento con GRPO implica optimizacion de cadenas de razonamiento dentro del entorno, pero no se declara soporte de agentes general.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode explicito): ninguna documentada.

## Casos de uso

- Investigacion en destilacion on-policy: el modelo se usa como profesor que genera demostraciones y proporciona supervision a nivel de token para un alumno de menor tamano; es exactamente el proposito declarado en la model card y su uso mas adecuado.
- Generacion de datos sinteticos para el entorno `Differentiate`: permite producir trazas de solucion para entrenar o aumentar un modelo alumno en esa tarea concreta, con la ventaja de que las recompensas del entorno son verificables.
- Reproduccion de experimentos de RL con entornos verificables: sirve como punto de partida o linea base para comparar variantes de RLVE y GRPO en una tarea acotada, con la ejecucion de W&B y el codigo de entrenamiento disponibles.
- Analisis de deriva de capacidades tras RL: al ser un ajuste de solo 150 pasos sobre un unico entorno, es util para medir cuanto se degradan o preservan las capacidades generales del modelo base tras un RL estrecho.
- Estudio de sesgo de estilo entre profesores: encaja en la linea de trabajo de Lightning OPD 2.0 (arXiv:2607.28449) sobre la consistencia entre el profesor que genera las demostraciones y el que supervisa.
- Despliegue local de bajo coste para prototipado: con 1,54 mil millones de parametros cabe en GPUs de consumo en cuantizacion de 8 o 4 bits, lo que permite iterar rapidamente en cuadernos de investigacion sin infraestructura dedicada.
- Servicio de inferencia compatible con endpoints: los tags `text-generation-inference` y `endpoints_compatible` indican que puede desplegarse en Hugging Face Inference Endpoints o con TGI para pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, GSM8K, HumanEval ni ninguna otra) ni comparaciones cuantitativas con el modelo base. La unica referencia de rendimiento es la recompensa del entorno `Differentiate` registrada en la ejecucion de Weights & Biases, cuyos valores no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,1 GB solo para los pesos, mas activaciones y cache KV; en la practica entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,6 GB de pesos, en torno a 2,5-3 GB en total.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,8-1 GB de pesos, en torno a 1,5-2 GB en total.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060, 3070, 4060, 4070 y superiores). En FP16 completo es comodo a partir de 8 GB; con 6 GB conviene usar 8 bits y con 4 GB, 4 bits.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o L4 para servicio concurrente; para una sola peticion basta cualquier GPU moderna de 8 GB o mas. El modelo es demasiado pequeno para aprovechar el paralelismo tensorial en configuraciones multi-GPU.
- Opciones de despliegue: `transformers` (formato nativo), Text Generation Inference (etiqueta `text-generation-inference` en el repositorio), vLLM y SGLang para servidores de alto throughput, y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- llama.cpp y Ollama: no disponibles, ya que el repositorio no publica pesos en formato GGUF. Seria necesario convertir el modelo a GGUF de forma manual.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-Differentiate-step149 | 1,54 mil millones | No disponible (heredado del base) | Apache 2.0 | Hugging Face, safetensors | No disponibles |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 mil millones | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, safetensors, GGUF de terceros | Si, reportados por el autor del base |
| Qwen/Qwen2.5-1.5B (pretrained) | 1,54 mil millones | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face | Si, reportados por el autor del base |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 (con restricciones) | Hugging Face con acceso condicionado | Si, reportados por Meta |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | 8.192 tokens | Apache 2.0 | Hugging Face | Si, reportados por HuggingFace |

La comparacion relevante es contra el propio Qwen2.5-1.5B-Instruct: este modelo es un derivado del mismo con 150 pasos de GRPO sobre un unico entorno, por lo que cualquier ventaja se limita a `Differentiate` y cualquier diferencia en capacidades generales no esta cuantificada en la informacion disponible. Frente a Llama-3.2-1B-Instruct y SmolLM2-1.7B-Instruct, la ventaja del modelo es su licencia Apache 2.0 sin restricciones adicionales; su desventaja, la ausencia total de evaluaciones publicadas.

## Limitaciones y advertencias

- Artefacto de investigacion: es un modelo profesor de un experimento concreto de destilacion on-policy, no un asistente de proposito general validado.
- Especializacion extrema: fue entrenado unicamente sobre el entorno `Differentiate` con dificultad 0, por lo que su comportamiento fuera de esa tarea puede degradarse respecto al modelo base original.
- Riesgo de sobreajuste al entorno: tras 150 pasos de GRPO sobre una sola tarea, es esperable un sesgo de estilo y formato hacia las soluciones de ese entorno, con posible perdida de generalidad conversacional.
- Idiomas: solo ingles declarado; no hay garantia de calidad en castellano ni en otros idiomas.
- Sesgos conocidos: no documentados en la model card. Al derivar de Qwen2.5, hereda los sesgos del modelo base, que tampoco se detallan aqui.
- Alucinacion: no hay evaluacion publicada de tasas de alucinacion; en un modelo de 1,5 mil millones de parametros el riesgo de fabricar pasos intermedios plausibles es alto, especialmente en razonamiento matematico.
- Ausencia de benchmarks: no se puede verificar ninguna afirmacion de rendimiento ni comparar con alternativas de forma objetiva.
- Contexto: la longitud de contexto no se especifica en la informacion proporcionada; se asume la del modelo base, pero no esta confirmada para este ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda ademas la licencia original de Qwen incluida en el repositorio como `LICENSE`; conviene revisarla antes de un uso en produccion.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, sin validacion externa conocida; la unica verificacion declarada es la comprobacion de nombres y formas de tensor frente al modelo base.
- Produccion: no se recomienda su uso en sistemas de atencion al cliente, generacion de codigo o cualquier flujo critico; no hay datos de latencia, throughput ni fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/6d01898e
- Codigo de entrenamiento (rlve): https://github.com/davidheineman/rlve
- Paper de referencia sobre entornos verificables de RL: https://arxiv.org/abs/2511.07317
- Paper Lightning OPD 2.0: Mitigating Style Bias in Cross-Teacher: https://arxiv.org/abs/2607.28449
- Perfil del autor: https://davidheineman.com/
- Actividad del autor en Hugging Face: https://huggingface.co/davidheineman/activity/all
