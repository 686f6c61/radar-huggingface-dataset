# PolarisDane/sciworld-qwen2.5-7b-intervene-copealigned-ow025

## Resumen

`sciworld-qwen2.5-7b-intervene-copealigned-ow025` es un ajuste fino de Qwen2.5-7B-Instruct publicado por el usuario PolarisDane en Hugging Face. Se trata de un artefacto de investigación procedente de una ejecución de aprendizaje por refuerzo (RL) sobre el entorno ScienceWorld, dentro del proyecto Agentgym-RL-H100, con la variante de tarea "intervene" y una alineación metodológica denominada CoPE. El entrenamiento se realizó sobre 8 GPU y el resultado se ha publicado únicamente como pesos fusionados en formato Hugging Face.

El repositorio no contiene los shards de FSDP originales, por lo que el modelo no puede reanudar el entrenamiento desde este checkpoint: es un producto final de inferencia, no un punto de reanudación. Se publican cuatro revisiones correspondientes a los pasos de entrenamiento 50, 100, 150 y 200, lo que permite evaluar la evolución del comportamiento del agente a lo largo del proceso de RL.

Por herencia de la base, el modelo es un transformer decoder-only de aproximadamente 7.600 millones de parámetros, con una ventana de contexto que en Qwen2.5-7B-Instruct llega hasta los 128K tokens y capacidades multilingües. Se trata de un modelo muy nichado, con 0 descargas y 1 like en el momento de redactar esta ficha, y sin model card detallada más allá de las notas de la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-7B-Instruct); compatible con `AutoModelForCausalLM` |
| Parametros totales | Aproximadamente 7,6 mil millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para este ajuste; la base Qwen2.5-7B-Instruct soporta hasta 128K-131K tokens y genera hasta 8K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos fusionados; no se distribuyen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible para este ajuste; la base Qwen2.5 es multilingüe |
| Licencia | No disponible (la base Qwen2.5-7B se distribuye bajo Apache 2.0, pero este derivado no declara licencia) |
| Formato de pesos | Safetensors de Hugging Face (pesos fusionados; sin shards FSDP) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención causal y mecanismos propios de la familia Qwen2.5 (atención con consultas agrupadas y codificación posicional rotatoria, según la documentación pública de Qwen). No se dispone de la configuración exacta de capas, cabezas o dimensión oculta en la información proporcionada, por lo que esos detalles se marcan como no disponibles.

El ajuste se realizó mediante aprendizaje por refuerzo sobre ScienceWorld, un entorno textual de resolución de tareas científicas. La model card indica que se trata de una ejecución de "intervene-forecast" alineada con CoPE, ejecutada sobre 8 GPU, y remite a `docs/INTERVENE_FORECAST_COPE_ALIGNED.md` dentro del repositorio Agentgym-RL-H100 para los detalles metodológicos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación adicionales. El repositorio de 60,9 GB contiene el conjunto de pesos fusionados más las cuatro revisiones por paso, sin los shards de FSDP.

## Capacidades

- Generación de texto y razonamiento instruccional, heredados de Qwen2.5-7B-Instruct.
- Ejecución de tareas de agente en entornos textuales interactivos, específicamente ScienceWorld en la variante "intervene".
- Toma de decisiones multi-paso con observaciones del entorno y acciones discretas, como resultado del entrenamiento con RL.
- Razonamiento científico elemental dentro del dominio de ScienceWorld.
- Capacidades de código y matemáticas heredadas de la base Qwen2.5, aunque no se han verificado tras el ajuste de RL.
- Soporte multilingüe heredado de la base (no confirmado para este ajuste).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: el modelo sirve como checkpoint de referencia para estudiar cómo evoluciona la política de un agente de 7B a lo largo de los pasos 50, 100, 150 y 200, comparando las cuatro revisiones publicadas.
- Reproducibilidad de experimentos en Agentgym-RL-H100: al ser un artefacto de una ejecución concreta (8 GPU, `sciworld_qwen2.5_7b_intervene_copealigned_ow025_8gpu_1008_2122`), permite a otros grupos replicar o auditar los resultados de esa configuración.
- Agente para entornos de simulación textual: el modelo puede desplegarse como política de un agente que interactúa con ScienceWorld u otros entornos con interfaz de texto y acciones discretas.
- Evaluación comparativa de métodos de alineación: al declararse "copealigned", resulta útil como punto de comparación frente a ejecuciones sin esa alineación dentro del mismo proyecto.
- Generación de trayectorias sintéticas: puede usarse para producir episodios de interacción en ScienceWorld que alimenten posteriores procesos de destilación o ajuste supervisado.
- Base para ajustes específicos de dominio científico: partiendo de este checkpoint ya entrenado con RL en tareas científicas, se pueden explorar ajustes posteriores con SFT en subdominios concretos.
- Docencia y demostraciones de agentes basados en LLM: su tamaño de 7,6B permite ejecutarlo en hardware de laboratorio para ilustrar el comportamiento de un agente entrenado con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, tasas de éxito en ScienceWorld ni comparaciones numéricas con otras ejecuciones. Las búsquedas web realizadas aportan datos de rendimiento de la familia Qwen2.5 en general, pero no de este ajuste concreto, por lo que no se incluyen cifras que no puedan atribuirse directamente a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los ~7,6B parámetros, no datos verificados del autor):
  - BF16/FP16: aproximadamente 15,5 GB solo de pesos, con 18-20 GB reales contando caché KV y overhead.
  - INT8: aproximadamente 8 GB de pesos, con 10-12 GB en ejecución.
  - Cuantización de 4 bits: aproximadamente 4,5-5 GB de pesos, con 6-8 GB en ejecución.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con al menos 20 GB de VRAM para BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) con cuantización INT8 o 4 bits. En GPUs de 8-12 GB solo con cuantizaciones agresivas.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers con `AutoModelForCausalLM` (las revisiones se seleccionan con el parámetro `revision`). El repositorio no incluye GGUF, por lo que habría que generarlo localmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sciworld-qwen2.5-7b-intervene-copealigned-ow025 | ~7,6B | No especificado (base: 128K-131K) | Ajuste RL sobre ScienceWorld | No disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | ~7,6B | 128K-131K, generacion hasta 8K | Instruct generalista | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-7B (base) | ~7,6B | 128K-131K | Preentrenado | Apache 2.0 | Ampliamente disponible |

No se dispone de información sobre otros ajustes comparables de la misma ejecución o de proyectos equivalentes, por lo que la comparación se limita a la familia base de Qwen2.5.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial está permitido, aunque la base Qwen2.5-7B sea Apache 2.0. Conviene contactar con el autor antes de cualquier uso en producción.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5, hereda los sesgos de su dataset de preentrenamiento, no auditados en esta ficha.
- Riesgo de alucinación: presente como en cualquier LLM de 7B; el ajuste de RL sobre un entorno concreto puede además reducir la generalidad de las respuestas fuera del dominio de ScienceWorld.
- Especialización estrecha: el entrenamiento con RL en la tarea "intervene" de ScienceWorld puede degradar el rendimiento en tareas generales respecto al Qwen2.5-7B-Instruct original, algo que no se ha cuantificado.
- Sin punto de reanudación: los shards de FSDP fueron eliminados, por lo que el modelo no puede continuar el entrenamiento desde estos checkpoints.
- Sin benchmarks publicados: no hay evidencia numérica de mejora o degradación frente a la base.
- Adopción prácticamente nula (0 descargas, 1 like) y sin documentación externa verificable, lo que dificulta contrastar su calidad.
- Idiomas soportados no declarados para este ajuste concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PolarisDane/sciworld-qwen2.5-7b-intervene-copealigned-ow025
- Colección Qwen2.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen25
- Qwen2.5-7B-Instruct en NVIDIA Build: https://build.nvidia.com/qwen/qwen2_5-7b-instruct.md
- Ficha de Qwen2.5-7B en dev.co: https://dev.co/ai/llms/qwen2-5-7b
- Qwen2.5:7b en Ollama: https://ollama.com/library/qwen2.5:7b
- Documentación de Qwen2.5-7B en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen2.5-7B.html
- Documento de metodología `docs/INTERVENE_FORECAST_COPE_ALIGNED.md` del repositorio Agentgym-RL-H100: referenciado en la model card, sin URL pública disponible en la información proporcionada.
