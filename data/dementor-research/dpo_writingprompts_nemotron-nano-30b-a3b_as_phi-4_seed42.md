# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base NVIDIA Nemotron-3-Nano-30B-A3B-BF16, un modelo de lenguaje de arquitectura MoE con 30.000 millones de parámetros totales y 3.000 millones de parámetros activos. El adaptador forma parte del estudio de imitación conductual denominado "dementor", dirigido por el grupo de investigación dementor-research, y utiliza la herramienta Tinker de Thinking Machines para su entrenamiento.

El objetivo del adaptador es ajustar el comportamiento del modelo base para imitar el estilo de respuesta de Phi-4 en tareas de escritura guiada (writing prompts), mediante un pipeline de DPO con LoRA de rango 32 sobre todas las capas lineales. El nombre del modelo incluye la semilla 42, lo que sugiere reproducibilidad del entrenamiento. Se trata de un experimento de investigación más que de un modelo listo para producción, y no se han publicado métricas de rendimiento ni detalles sobre el dataset de preferencias utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basado en NVIDIA Nemotron-3-Nano-30B-A3B-BF16 |
| Parametros totales | 30.000 millones (modelo base) |
| Parametros activos | 3.000 millones (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en BF16, el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) y pesos del modelo base en BF16 |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo NVIDIA Nemotron-3-Nano-30B-A3B-BF16, un modelo de lenguaje autoregresivo con arquitectura de mezcla de expertos (MoE) que activa 3.000 millones de parámetros por token de un total de 30.000 millones. El entrenamiento del adaptador se realizó mediante DPO (Direct Preference Optimization) con LoRA de rango 32 y target_modules=all-linear, lo que implica que todas las capas lineales del modelo base fueron adaptadas. El dataset utilizado es de escritura guiada (writing prompts) y el objetivo era imitar el comportamiento de Phi-4, aunque no se especifica la composición exacta del dataset ni el número de tokens de entrenamiento. El entrenamiento forma parte de un estudio más amplio que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se menciona el uso de RLHF adicional ni técnicas de decodificación especiales.

## Capacidades

- Generacion de texto con estilo de escritura creativa y respuestas a prompts de escritura, imitando el comportamiento de Phi-4.
- Capacidades de razonamiento y generacion de lenguaje propias del modelo base Nemotron-3-Nano-30B-A3B-BF16.
- Soporte de tool calling y function calling: no disponible, aunque el modelo base podría soportarlo, no se ha verificado en este adaptador.
- Soporte de agentes y multi-step reasoning: no disponible, depende del modelo base.
- Capacidades multilingues: no disponible, depende del modelo base.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion academica en imitacion conductual: el adaptador permite estudiar como un modelo MoE pequeño (3B activos) puede adoptar el estilo de un modelo mas grande (Phi-4) mediante DPO, util para investigacion en transferencia de estilo y alineacion.
- Generacion de textos creativos con estilo especifico: puede usarse para generar relatos, cuentos o respuestas a prompts de escritura con un tono similar al de Phi-4, aunque su rendimiento no esta validado.
- Experimentos de alineacion con DPO: sirve como referencia para desarrolladores que quieran replicar el pipeline de entrenamiento con LoRA y DPO sobre modelos MoE.
- Pruebas de adaptacion de bajo costo: al ser un adaptador LoRA (1,5 GB), permite experimentar con el modelo base sin necesidad de ajustar todos los parametros, reduciendo requisitos de computo.
- Comparacion de estrategias de fine-tuning: puede utilizarse en estudios comparativos entre DPO y otros metodos de alineacion sobre el mismo modelo base.
- Desarrollo de prototipos de asistentes de escritura: aunque no hay garantias de calidad, podria integrarse en herramientas de generacion de texto para evaluar su comportamiento en escenarios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El repositorio no incluye evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base con 30B parametros totales y 3B activos requiere al menos 16 GB de VRAM en cuantizacion BF16 para cargar los pesos completos, aunque al ser MoE con activacion parcial, la memoria necesaria es mayor que la de un modelo denso de 3B. Con cuantizacion de 8 bits o 4 bits, podria caber en GPUs de 12-16 GB, pero no hay datos oficiales.
- GPU recomendadas: para inferencia con el modelo base en BF16 se recomienda una GPU con al menos 40 GB de VRAM (A100, H100, RTX A6000) o usar cuantizacion para reducir requisitos. Una RTX 4090 (24 GB) podria ser suficiente con cuantizacion de 4 bits.
- Si cabe en consumer GPU: posiblemente si, con cuantizacion agresiva (4 bits) y usando librerias como llama.cpp u Ollama, pero no esta verificado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers + peft como se muestra en el codigo de uso.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El adaptador es un experimento de investigacion sin benchmarks publicados. Como referencia, el modelo base Nemotron-3-Nano-30B-A3B-BF16 compite con otros modelos MoE de tamano similar como Qwen2.5-32B-A3B o Mixtral-8x7B, pero no hay datos de rendimiento de este adaptador concreto. Por tanto, la comparativa se limita a indicar que el adaptador no altera las capacidades generales del modelo base salvo en el estilo de escritura, y que su rendimiento en tareas estandar no ha sido evaluado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al ser un modelo entrenado con DPO sobre un dataset de escritura, podria heredar sesgos del dataset de preferencias y del modelo base.
- Riesgo de alucinacion: alto, como en la mayoria de modelos de lenguaje, especialmente en tareas de generacion creativa donde no hay verificacion factual.
- Limitaciones de contexto e idioma: no especificadas, dependen del modelo base. El adaptador no amplia la ventana de contexto del modelo base.
- Restricciones de licencia: la licencia no esta especificada en el repositorio, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor.
- Caveat para produccion: este es un adaptador experimental sin validacion de calidad. No debe usarse en entornos de produccion sin una evaluacion exhaustiva previa.
- El adaptador solo contiene los pesos LoRA (1,5 GB), no el modelo completo. Para usarlo es necesario descargar el modelo base de NVIDIA, que tiene su propia licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_phi-4_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
