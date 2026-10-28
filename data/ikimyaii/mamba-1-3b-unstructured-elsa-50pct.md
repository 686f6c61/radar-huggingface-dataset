# ikimyaii/Mamba-1.3B-unstructured-ELSA-50pct

## Resumen

Mamba-1.3B-unstructured-ELSA-50pct es un checkpoint del modelo de espacio de estados `fla-hub/mamba-1.3B-100B` (1.334.740.992 parámetros) al que se le ha aplicado una poda no estructurada del 50 % mediante ELSA, un método basado en ADMM presentado en el paper arXiv:2510.01650. Lo publica el usuario `ikimyaii` como referencia base (*baseline*) para un conjunto de modelos "EHWS" del mismo perfil, de modo que sirve para comparar el efecto de distintas estrategias de poda sobre la misma arquitectura y el mismo presupuesto de dispersión. No es un modelo afinado ni alineado: es un experimento de compresión reproducible.

El interés técnico está en el régimen de dispersión: la poda es **no estructurada**, con un único umbral de magnitud por capa, de manera que las filas acaban con distinto número de ceros. Se podan todas las capas lineales dentro de los bloques excepto `dt_proj` de Mamba, que se mantiene densa, mientras que `conv1d`, `A_log`, `D`, los embeddings y `lm_head` quedan intactos. La dispersión medida sobre los pesos publicados es 0,4900 en las capas podadas, ligeramente por debajo del objetivo del 50 % precisamente por mantener `dt_proj` densa.

El resultado comunicado es una perplejidad de 14,86 en WikiText-2 y 17,10 en C4 (evaluación propia de ELSA, fp16, una sola ejecución). La relevancia práctica es doble: por un lado demuestra que se puede comprimir un Mamba de 1.3B al 50 % de dispersión en 6,06 horas con una sola A100 de 40 GB; por otro, al ser dispersión no estructurada, el ahorro no se traduce automáticamente en speedup sin kernels específicos, algo crítico para quien evalúe desplegarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados, SSM) con poda no estructurada del 50 % sobre las capas lineales de los bloques |
| Parametros totales | 1.334.740.992 (conteo real de safetensors; el numero de parametros distintos de cero es menor por la poda) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors (tamano del repositorio: 5,3 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por recurrencias lineales con parámetros dependientes de la entrada. Sobre el checkpoint `fla-hub/mamba-1.3B-100B` (entrenado con 100.000 millones de tokens según el nombre del modelo base) se aplica ELSA con su `main.py` oficial y exactamente los mismos hiperparámetros del run HGRN-1.3B al 80 % del propio ELSA: 4096 pasos de ADMM, un paso *z* cada 32 pasos, batch 1 con 8 acumulaciones, learning rate 2e-4, lambda 0,01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El proceso completo consume 6,06 horas en una única A100 de 40 GB.

El detalle relevante es el alcance de la poda: 192 capas lineales podadas, con un umbral de magnitud por capa (no global), excluyendo `dt_proj` (mantenida densa, con un parche local para que ELSA pode las mismas capas que los modelos EHWS de la misma cuenta). `conv1d`, `A_log` y `D` no se consideran capas lineales y quedan intactos; embeddings y `lm_head` permanecen densos. La dispersión medida sobre los pesos finales es 0,4900, y las filas no están balanceadas: en promedio la fila más densa tiene 1,40 veces los no-ceros de la media de su capa, y la peor capa llega a 1,91 veces. No se realizó ningún ajuste posterior a la poda (sin recuperación ni destilación), ni RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva en el estilo del modelo base `fla-hub/mamba-1.3B-100B`, sujeto a la degradación introducida por la poda del 50 %.
- Modelado de lenguaje de propósito general: la métrica publicada es perplejidad en WikiText-2 (14,86) y C4 (17,10), es decir, se evalúa como modelo de lenguaje, no como asistente.
- Razonamiento, matemáticas y generación de código: no se han publicado evaluaciones específicas para este checkpoint, por lo que no hay evidencia de rendimiento en esas tareas.
- Tool calling / function calling: no disponible; el modelo base es un modelo de lenguaje sin plantilla de herramientas documentada en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el entrenamiento de poda usa C4, mayoritariamente en inglés.
- Capacidades especiales (modo *thinking*, visión, audio): ninguna documentada.
- Requisito de carga: necesita `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.

## Casos de uso

- Investigación en compresión de modelos: sirve como *baseline* de poda no estructurada al 50 % frente a los modelos EHWS del mismo autor, permitiendo aislar el efecto de la estrategia de poda manteniendo arquitectura, presupuesto de dispersión y protocolo de evaluación idénticos.
- Reproducción de experimentos de ADMM: los hiperparámetros completos (4096 pasos, z-step 32, lambda 0,01, semilla 0) y el coste computacional (6,06 h en A100 40 GB) están documentados, lo que permite replicar el pipeline sobre otros checkpoints Mamba.
- Evaluación de perplejidad en condiciones de recursos limitados: con ~1,3B parámetros se puede ejecutar la evaluación de WikiText-2 y C4 en una GPU de consumo, algo inviable con modelos de decenas de miles de millones de parámetros.
- Estudio de kernels dispersos: al tener dispersión no estructurada y filas desbalanceadas (hasta 1,91× la media en la peor capa), es un caso de prueba realista para medir si un kernel *sparse* aporta speedup frente a la ejecución densa.
- Análisis de degradación por capas: la distribución de no-ceros por capa y fila permite estudiar qué bloques de un Mamba toleran más poda y correlacionarlo con la caída de perplejidad.
- Docencia y experimentación con arquitecturas SSM: un checkpoint de 5,3 GB que se carga con Transformers y FLA es un banco de pruebas asequible para entender el funcionamiento interno de Mamba sin entrenar desde cero.

## Benchmarks y rendimiento

| Modelo | Tipo de dispersion | WikiText-2 (perplejidad) | C4 (perplejidad) |
|---|---|---|---|
| Mamba-1.3B-unstructured-ELSA-50pct | No estructurada (0,4900 medida) | 14,86 | 17,10 |

Perplejidad calculada con la evaluación propia de ELSA (sus conjuntos de test de WikiText-2 y C4, fp16), tal como la imprime su código. Una sola ejecución, sin intervalo de confianza. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 5,3 GB, coherente con pesos en fp32 (~5,34 GB para 1.334.740.992 parámetros). En fp16/bf16 los pesos ocuparían ~2,7 GB; añadiendo caché de activaciones y el estado recurrente de Mamba, el consumo realista se sitúa en torno a 4-8 GB según longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con 8 GB o más para fp16; A100 40 GB o H100 para réplicas del pipeline de poda (el run documentado usa una A100 40 GB durante 6,06 horas).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, siempre en fp16/bf16 y con secuencias moderadas.
- Opciones de despliegue: `transformers` con `flash-linear-attention` instalado y `trust_remote_code=True` es la vía documentada por el autor. No hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama para este checkpoint concreto (Mamba + dispersión no estructurada); la poda no estructurada tampoco se traduce en speedup sin kernels *sparse* específicos.
- Latencia y throughput: no disponibles. Al mantener los tensores con la misma forma densa (los ceros se almacenan igualmente), el coste de cómputo es el de un modelo denso de 1,3B salvo que se apliquen kernels dispersos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mamba-1.3B-unstructured-ELSA-50pct | 1.334.740.992 (50 % de dispersion no estructurada en capas lineales) | no disponible | PPL 14,86 (WikiText-2) / 17,10 (C4) | no disponible | HuggingFace, 0 descargas, 0 likes |
| fla-hub/mamba-1.3B-100B (modelo base, denso) | ~1,3B | no disponible | no disponible en la informacion proporcionada (referencia frente a la que se mide la degradacion) | no disponible | HuggingFace (fla-hub) |
| Modelos EHWS del mismo autor (Mamba podados) | ~1,3B (misma base) | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace (misma cuenta) |

No se dispone de datos de otros modelos comparables de poda de Mamba en la información proporcionada; las alternativas más directas son el modelo denso original y el resto de variantes EHWS del mismo autor, pero sus métricas no se detallan.

## Limitaciones y advertencias

- La poda no estructurada no produce aceleración en hardware denso: los tensores conservan la forma original y el modelo ejecuta las mismas operaciones, por lo que el beneficio es de compresión de almacenamiento, no de latencia, salvo con kernels *sparse* dedicados.
- Las filas no están balanceadas (1,40× la media en promedio, 1,91× en la peor capa), lo que complica la vectorización y hace que el rendimiento de kernels dispersos sea impredecible.
- Degradación no caracterizada: solo se publica perplejidad, con una única ejecución y sin comparación numérica con el modelo denso base en la información disponible; no hay datos de MMLU, HumanEval ni tareas generativas.
- Riesgo de alucinación: es un modelo de lenguaje sin ajuste por instrucciones ni alineación (sin RLHF/DPO documentados), por lo que no debe usarse como asistente conversacional en producción.
- Idiomas: no declarados; los datos de calibración de la poda (C4) son mayoritariamente en inglés, por lo que el comportamiento en castellano u otras lenguas no está verificado.
- Contexto: no se especifica la longitud de contexto soportada; no se recomienda asumir ventanas largas sin verificarlo contra el modelo base.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible comprobar la licencia del modelo base `fla-hub/mamba-1.3B-100B` antes de cualquier despliegue.
- Requiere `trust_remote_code=True` y la dependencia `flash-linear-attention`, lo que implica ejecutar código del repositorio y añade una dependencia no estándar en el stack de inferencia.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha; es un artefacto de investigación sin validación externa.

## Enlaces

- [Modelo en HuggingFace: ikimyaii/Mamba-1.3B-unstructured-ELSA-50pct](https://huggingface.co/ikimyaii/Mamba-1.3B-unstructured-ELSA-50pct)
- [Modelo base: fla-hub/mamba-1.3B-100B](https://huggingface.co/fla-hub/mamba-1.3B-100B)
- [Paper de ELSA (arXiv:2510.01650)](https://arxiv.org/abs/2510.01650)
