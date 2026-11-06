# rqadri/cca-traj-gemma4-31b-v1

## Resumen

`rqadri/cca-traj-gemma4-31b-v1` es un ajuste fino de parámetros completos (full-parameter SFT) sobre `google/gemma-4-31b-it`, el modelo multimodal instruction-tuned de Google de la familia Gemma 4. Lo desarrolla el usuario rqadri en el contexto del proyecto `long_ctx_train`, y su propósito es especializar el modelo base en la generación de trayectorias de agentes de código (agent trajectories) mediante entrenamiento supervisado a nivel de trayectoria con contexto de 128 000 tokens. Con 31 273 088 876 parámetros (31,3 mil millones), es un modelo denso de gran tamaño orientado a tareas de agente con ventanas de contexto muy largas.

El modelo se entrena sobre el conjunto `cca-large-v1` (1 243 secuencias, 61,9 millones de tokens supervisados, 250 ejecuciones de entrenamiento) y se evalúa con thinking activado. La model card es explícita sobre el resultado: el modelo queda por debajo del base en SWE-bench y Terminal-Bench bajo ambos harnesses de evaluación, con 0 tareas resueltas bajo el harness de CCA, y el autor documenta que el modelo "entra en bucle narrando en lugar de llamar a herramientas". Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

Su relevancia ahora es doble: por un lado, documenta un experimento reproducible de SFT a 128k de contexto sobre hardware Intel XPU (Aurora) con DeepSpeed ZeRO-3 y paralelismo de secuencia Ulysses; por otro, es un caso de estudio útil sobre el desajuste entre la pérdida de entrenamiento (NLL muy por debajo del base en held-out) y el rendimiento real en tareas de agente (por debajo del base), un fenómeno relevante para quien entrene agentes de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Gemma 4, `Gemma4ForConditionalGeneration`); detalles internos no disponibles |
| Parámetros totales | 31 273 088 876 (31,3 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (contexto de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de la licencia Gemma de Google) |
| Formato de pesos | safetensors (repo de 62,6 GB) |
| Modelo base | `google/gemma-4-31b-it` |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Fecha de publicación | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31b-it`, un transformer multimodal denso de 31,3 mil millones de parámetros que procesa entradas de imagen y texto y genera texto. El ajuste es de parámetros completos (no LoRA ni adaptadores), a nivel de trayectoria de agente: cada secuencia de entrenamiento corresponde a una generación de contexto de agente completa, y la pérdida se calcula únicamente sobre los tramos del asistente (loss on the assistant spans only). El contexto de entrenamiento es de 128 000 tokens en bf16.

El entrenamiento se ejecutó con el script `train_cca_sft.py` del repositorio `github.com/rifaaQ/long_ctx_train` sobre el supercomputador Aurora (Intel XPU), usando DeepSpeed ZeRO-3 con offload del optimizador a CPU, paralelismo de secuencia Ulysses con 8 rangos por nodo, AdamW, scheduler coseno, 8 secuencias por paso de optimizador, learning rate 1e-5, `max_grad_norm` 200 y 160 pasos (una época). Los datos son trayectorias de agente de CCA: `cca-large-v1` (250 ejecuciones, 1 243 secuencias, 61,9 M tokens supervisados) y `cca-large-v2` (182 ejecuciones, 739 secuencias, 47,7 M tokens supervisados), con ejecuciones disjuntas y solo profesores de pesos abiertos. No se documenta RLHF ni DPO; es SFT puro.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada image-text-to-text), heredadas del modelo base Gemma 4 31B-it.
- Modo thinking: evaluado con `enable_thinking` en el chat template y un parser de razonamiento.
- Entrenamiento específico en trayectorias de agente de código (agent-trajectories, CCA, long-context, SFT según los tags del repo).
- Capacidad teórica de tool calling y razonamiento multi-paso por herencia del base, aunque la evaluación documentada muestra que en la práctica el modelo narra en lugar de invocar herramientas bajo el harness de CCA.
- Contexto largo de hasta 128 000 tokens en entrenamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre SFT de contexto largo: reproduce o analiza el pipeline `train_cca_sft.py` con DeepSpeed ZeRO-3 y Ulysses para estudiar cómo se comporta el ajuste a 128k tokens sobre hardware XPU; el modelo sirve como referencia reproducible del experimento.
- Estudio del desajuste pérdida-rendimiento: úsalo como caso controlado en el que la NLL de held-out mejora sustancialmente respecto al base mientras SWE-bench y Terminal-Bench empeoran; útil para diseñar métricas de validación de agentes que no se basen solo en likelihood.
- Análisis de modos de fallo en agentes de código: el bucle de narración sin llamadas a herramientas documentado por el autor es un ejemplo concreto para investigar colapso de comportamiento tras SFT de trayectorias.
- Evaluación de harnesses de agente: comparar el comportamiento del modelo bajo el harness de CCA y bajo otros harnesses (ambos reportados por debajo del base) para estudiar la sensibilidad al entorno de evaluación.
- Punto de partida para ajustes posteriores: al ser un checkpoint full-parameter del base, puede servir como inicialización para experimentos de corrección (p. ej. DPO o SFT con datos que refuercen la invocación de herramientas), siempre que se respete la licencia Gemma.
- Docencia y divulgación técnica: ilustrar en un curso o artículo el flujo completo de entrenamiento de un agente de código a 128k de contexto, desde la composición del dataset hasta la evaluación con thinking activado.

## Benchmarks y rendimiento

La model card no publica cifras numéricas de benchmarks, solo la comparación cualitativa con el modelo base. No se han publicado resultados numéricos de benchmarks en la información disponible.

| Benchmark | Resultado frente al base | Detalle |
|---|---|---|
| SWE-bench | por debajo del base (bajo ambos harnesses) | sin cifras |
| Terminal-Bench | por debajo del base (bajo ambos harnesses) | sin cifras |
| Harness CCA | 0 tareas resueltas | el modelo narra en bucle en lugar de llamar a herramientas |
| NLL en held-out | muy por debajo del base | mejora de likelihood sin mejora de tarea |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y caché KV para contexto largo; con 128k de contexto el consumo adicional de caché KV es considerable y no se documenta en la información disponible.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el modelo requiere GPUs de数据中心 con al menos 80 GB (A100 80GB, H100 80GB) para bf16, o múltiples GPUs consumer con sharding.
- GPU consumer: no cabe en una sola RTX 4090 (24 GB) en bf16; requeriría cuantización y/o reparto entre varias GPUs, y no se publican pesos cuantizados.
- Opciones de despliegue: transformers (librería declarada) y vLLM (la model card menciona que `processor_config.json` está incluido porque el perfil multimodal de vLLM lo necesita). No se documentan Ollama, llama.cpp ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rqadri/cca-traj-gemma4-31b-v1` | 31,3 B (denso) | 128k (entrenamiento) | SFT full-parameter en trayectorias de agente de código | Gemma | HuggingFace, 0 descargas, 0 likes |
| `google/gemma-4-31b-it` (base) | 31,3 B (denso) | no disponible en la información | Instruction-tuned multimodal | Gemma | Modelo base de referencia |
| Alternativas de agente de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo ni de alternativas comparables en la información proporcionada; la única comparación documentada es cualitativa frente al modelo base.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base en SWE-bench y Terminal-Bench bajo ambos harnesses evaluados; 0 tareas resueltas bajo el harness de CCA.
- Modo de fallo documentado: el modelo entra en bucle de narración en lugar de invocar herramientas, lo que lo inutiliza para flujos de agente reales sin corrección adicional.
- La NLL de held-out mejora respecto al base, pero no se traduce en mejor rendimiento de tarea; no usar la pérdida como única señal de calidad.
- Es un artefacto de investigación declarado por el autor; no está validado para producción.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable; revisar antes de cualquier despliegue.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe verificada.
- No se publican cuantizaciones ni instrucciones de despliegue más allá de la nota sobre vLLM y `processor_config.json`.
- Riesgo de sesgos y alucinación: no evaluado en la información disponible; al ser un ajuste sobre un modelo de lenguaje, hereda los riesgos del base sin mitigaciones documentadas.
- Repo con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rqadri/cca-traj-gemma4-31b-v1
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Repositorio de entrenamiento: https://github.com/rifaaQ/long_ctx_train
- Protocolo de evaluación y resultados: `longctx/results.md` en el registro del proyecto (github.com/rifaaQ/long_ctx_train)
