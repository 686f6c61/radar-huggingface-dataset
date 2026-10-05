# davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-11-goldwashing-1e98263c1ec5

## Resumen

Este repositorio contiene un checkpoint archivado de un modelo de lenguaje de ~1,78 mil millones de parametros desarrollado por davidheineman dentro de la coleccion "RLVE OPD Teachers". Segun la propia model card, se trata de la preservacion del estado final de un run de entrenamiento completado (paso 149, W&B run ID `d24fe0a2`), con el nombre interno `11-GoldWashing`. El modelo parte de la arquitectura Qwen2 (etiqueta `qwen2` en HuggingFace) y, segun la coleccion asociada, corresponde a Qwen 2.5 1.5B Instruct ajustado durante 150 pasos sobre un unico entorno procedente de un conjunto de 400 entornos.

El modelo se enmarca en la linea de trabajo MOPD (Multi-Teacher On-Policy Distillation), una tecnica de post-entrenamiento que destila uno o varios modelos profesor ("teachers") en una politica mediante una ventaja de destilacion a nivel de token, sustituyendo la ventaja basada en recompensa de GRPO y ejecutandose sobre GRPO asincrono. El sufijo "teachers" del identificador y el nombre de la coleccion apuntan a que estos checkpoints actuan como profesores dentro de un pipeline de destilacion multi-profesor.

Su relevancia es acotada y de caracter experimental: no es un modelo de proposito general pulido ni una release oficial, sino un artefacto de investigacion para reproducibilidad. Tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y su valor principal reside en documentar el proceso de entrenamiento y servir como pieza de un sistema mayor de destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2, etiqueta `qwen2`) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base Qwen 2.5 1.5B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (presumiblemente BF16). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf-safetensors`), mas checkpoint distribuido de Megatron en el directorio `checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder de la familia Qwen2, con aproximadamente 1,78 mil millones de parametros. La model card no detalla la configuracion interna (numero de capas, dimension oculta, cabezas de atencion, tipo de normalizacion), por lo que esos datos no estan disponibles. El checkpoint se guarda en dos formatos: `hf-safetensors` para uso directo con bibliotecas de HuggingFace y un checkpoint distribuido de Megatron en el directorio `checkpoint/` que reproduce el estado exacto del entrenamiento.

El entrenamiento parte de Qwen 2.5 1.5B Instruct y se ejecuto durante 150 pasos (ultimo checkpoint en el paso 149) sobre un unico entorno de un conjunto de 400 entornos disponibles, segun la coleccion publica asociada. El run se enmarca en el paradigma MOPD (Multi-Teacher On-Policy Distillation), que destila senales de profesores en la politica reemplazando la ventaja basada en recompensa de GRPO por una ventaja de destilacion a nivel de token. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases adicionales de RLHF o DPO mas alla del procedimiento MOPD.

## Capacidades

- Generacion de texto e instrucciones: hereda la capacidad de seguir instrucciones del modelo base Qwen 2.5 1.5B Instruct, aunque el ajuste sobre un unico entorno puede haber estrechado su comportamiento generalista.
- Razonamiento de un solo entorno: el entrenamiento se centro en un entorno concreto de un conjunto de 400, por lo que su especializacion es muy acotada.
- Codigo y matematicas: no hay datos especificos publicados para este checkpoint; cualquier capacidad en este ambito procederia del modelo base y no esta verificada.
- Tool calling / function calling: no disponible (no se documenta soporte explicito en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: el pipeline MOPD usa rollouts multi-turno a traves de NeMo Gym como parte del entrenamiento, pero no se confirma que este checkpoint conserve capacidades de agente utilizables de forma autonoma.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo "thinking"): no disponible.

## Casos de uso

- Reproducibilidad de investigacion: el repositorio preserva el estado final exacto de un run de destilacion (paso 149, W&B `d24fe0a2`), lo que permite auditar y replicar los resultados del experimento MOPD.
- Modelo profesor en pipelines de destilacion: dado su papel en la coleccion "RLVE OPD Teachers", puede emplearse como uno de los profesores que alimentan la destilacion hacia una politica objetivo.
- Analisis comparativo de tecnicas de post-entrenamiento: sirve para confrontar MOPD frente a alternativas como Off-Policy Finetune o Mix-RL en terminos de eficiencia y conservacion de capacidades.
- Estudio de especializacion por entorno: al haberse ajustado sobre un unico entorno, permite analizar como un ajuste estrecho afecta a las capacidades generales heredadas del base.
- Experimentacion en entornos de bajos recursos: con ~1,78 B de parametros, el modelo cabe en GPUs de consumo, lo que facilita pruebas de reconstruccion de checkpoints de Megatron y conversion de formato.
- Docencia y formacion tecnica: util como ejemplo tangible de un checkpoint intermedio de un pipeline de entrenamiento RL/destilacion con trazabilidad de metadatos (paso, run ID, ruta original).
- Baseline interno para RLVE: dado su origen en el conjunto de entornos RLVE, puede servir de referencia al evaluar politicas posteriores sobre el mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 el modelo ocupa aproximadamente 3,6 GB de pesos (coincide con el tamano del repo); en INT8 en torno a 1,8 GB y en INT4 alrededor de 1 GB (estimaciones teoricas, no hay variantes cuantizadas publicadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4). Para cuantizacion INT4 cabria en GPUs de 4-6 GB.
- Cabe en GPU de consumo: si, con holgura. Un modelo de ~1,78 B en FP16 entra en tarjetas de 8 GB o mas; en INT4 entra en 4 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI (previa conversion a los formatos soportados por cada herramienta, ya que solo se publican safetensors). Tambien es posible cargarlo con `transformers` directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (RLVE OPD Teachers) | ~1,78 B | no disponible (base Qwen 2.5: 32.768 tokens) | no disponible | safetensors + Megatron |
| Qwen 2.5 1.5B Instruct (modelo base) | ~1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, ampliamente disponible |
| Llama 3.2 1B Instruct | ~1,24 B | 128.000 tokens | Llama Community License | safetensors, GGUF |
| Gemma 2 2B Instruct | ~2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |

Nota: las cifras de los modelos comparables corresponden a datos publicos de sus respectivas releases; para este checkpoint no se dispone de datos equivalentes de contexto, licencia ni rendimiento.

## Limitaciones y advertencias

- Modelo experimental sin licencia declarada: no se especifica ninguna licencia, por lo que no se garantiza su uso comercial ni su redistribucion. Conviene tratar la licencia como desconocida hasta que el autor la aclare.
- Ajuste sobre un unico entorno: el entrenamiento cubre 1 de 400 entornos, lo que implica una especializacion muy estrecha y un posible deterioro de capacidades generales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion para este checkpoint.
- Sesgos: no hay informacion sobre composicion de datos ni auditorias de sesgo.
- Idiomas: no se documentan los idiomas soportados; se desconoce el impacto del ajuste sobre capacidades multilingues.
- Cero adopcion: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Metadatos incompletos: faltan datos de contexto, licencia, pipeline y composicion del dataset, lo que complica su uso en produccion.
- Trazabilidad util pero parcial: aunque se indican paso, run ID y ruta original, no se incluye informacion de hiperparametros ni de evaluacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-11-goldwashing-1e98263c1ec5
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Coleccion RLVE OPD Teachers (Qwen 2.5 1.5B): https://huggingface.co/collections/davidheineman/rlve-opd-teachers-qwen-25-15b
- Paper MOPD: Multi-Teacher On-Policy Distillation for Capability: https://arxiv.org/abs/2606.30406
- Documentacion MOPD en NeMo-RL: https://docs.nvidia.com/nemo/rl/nightly/about/algorithms/mopd.html
- Paper de entornos RLVE referenciado en la coleccion: https://arxiv.org/abs/2511.07317
