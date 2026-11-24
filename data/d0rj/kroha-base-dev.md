# d0rj/Kroha-base-dev

## Resumen
Kroha-base-dev es un modelo de lenguaje de tipo transformer con un mecanismo de atención/normalización propietario denominado `kroha_routed_norm` y una arquitectura "looped" (con capas reutilizadas en bucle), desarrollado por el usuario d0rj. Con 71.685.904 parámetros totales (aproximadamente 72 millones), se sitúa en la categoría de modelos pequeños, muy por debajo de los modelos conversacionales habituales, y se distribuye como checkpoint de entrenamiento (tag `training-checkpoint`) más que como modelo final listo para producción.

El modelo parte de `d0rj/Kroha-base` mediante un ajuste fino adicional y emplea decodificación multi-token (multi-token prediction) como innovación técnica destacada. Su pipeline es `text-generation` y está pensado para experimentación con arquitecturas no convencionales, no para despliegues de alta exigencia. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

La relevancia de este modelo es fundamentalmente de investigación: explora variantes arquitectónicas (looped, routed norm, multi-token prediction) sobre un presupuesto de parámetros muy reducido, y publica una evaluación de 50 tareas comparables. No obstante, sus resultados en benchmarks son propios de un modelo de este tamaño y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con `kroha_routed_norm` y diseño "looped" (capas en bucle); etiquetas `custom_code` y `multi-token-prediction` |
| Parametros totales | 71.685.904 (≈72 M) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (la evaluación se realizó a 2K, según la fuente de los benchmarks) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (los datasets de entrenamiento incluyen multitud de idiomas, entre ellos ruso, chuvasio, jakasio y mari, además de inglés y código) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (librería `transformers`, con `custom_code`) |

## Arquitectura y entrenamiento
La arquitectura es un transformer con dos rasgos distintivos declarados en las etiquetas del repositorio: `kroha_routed_norm`, un mecanismo de normalización enrutada propio del autor, y `looped`, que implica reutilización de capas en bucle para aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. Además, incorpora decodificación multi-token (multi-token prediction), técnica que permite predecir varios tokens por paso y que suele emplearse para acelerar la generación o mejorar la planificación. El modelo requiere `custom_code`, por lo que no funciona con un `transformers` estándar sin cargar el código remoto del repositorio.

El entrenamiento se realizó sobre una mezcla amplia de datasets públicos, entre ellos HPLT3.0, FineDNA, finepdfs-edu, fineweb-2, fineweb-edu, finemath, Dolma3 (dolmino mix 100B), codeparrot-clean-train, Cultura RU EDU, FineWeb2-HQ, DCLM baseline, Ultra-FineWeb-L3, UltraData-Code, UltraData-Math y Wikipedia, además de corpus específicos en ruso y lenguas minoritarias (chuvasio, jakasio y mari). No se especifican en la información disponible el número total de tokens vistos, la composición exacta de la mezcla ni si hubo fases de RLHF o DPO; el modelo se presenta como checkpoint de entrenamiento (`Kroha-base-dev`), no como modelo alineado para conversación.

## Capacidades
- Generación de texto autoregresiva (pipeline `text-generation`), orientada a continuación y experimentación, no a diálogo alineado.
- Decodificación multi-token prediction, que puede reducir el número de pasos de generación.
- Cobertura multilingüe derivada de los corpus de entrenamiento (inglés, ruso, lenguas minoritarias de Rusia, código y matemáticas), aunque no se declara una lista oficial de idiomas soportados.
- Capacidad de continuación de texto en tareas de razonamiento tipo múltiple elección (ARC, HellaSwag, PIQA, etc.), según la evaluación publicada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso
- Investigación en arquitecturas eficientes: el modelo sirve como banco de pruebas para estudiar el efecto de `kroha_routed_norm`, el diseño "looped" y la predicción multi-token con solo 72 M de parámetros, lo que permite iterar en una sola GPU consumer.
- Experimentos de ablación y comparación de normalizaciones: al ser un checkpoint de entrenamiento con evaluación de 50 tareas, es útil para medir el impacto de variantes arquitectónicas frente a baselines pequeños.
- Generación de texto y continuación en dominios especializados: con corpus de entrenamiento que incluyen ruso, lenguas minoritarias y código, puede emplearse para prototipos de continuación en esos dominios, siempre con validación manual.
- Fine-tuning ligero para tareas concretas: su tamaño reducido permite ajustarlo en hardware modesto (una RTX 4090 o incluso GPUs con menos VRAM) para clasificación, etiquetado o generación acotada.
- Evaluación educativa y docencia: sirve para ilustrar el comportamiento de modelos pequeños en benchmarks estándar (ARC, HellaSwag, PIQA, MMLU) y discutir sus limitaciones.
- Pruebas de integración con `transformers` y `custom_code`: útil para desarrolladores que quieran validar pipelines de carga de modelos con código personalizado antes de escalar a modelos mayores.

## Benchmarks y rendimiento
Resultados declarados por el autor (evaluación "Kroha matched 50-task evaluation, vLLM BF16, 2K", 0-shot, no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| ARC-Challenge | acc_norm | 0,2261 |
| ARC-Easy | acc_norm | 0,3683 |
| Arithmark-3.0 | acc_norm | 0,3380 |
| Balanced COPA | acc | 0,5270 |
| BLiMP | acc | 0,7442 |
| BoolQ | acc | 0,6055 |
| CommonsenseQA | acc | 0,2064 |
| HellaSwag | acc_norm | 0,2945 |
| LAMBADA OpenAI | acc | 0,2593 |
| MMLU (continuation) | acc | 0,2467 |
| OpenBookQA | acc_norm | 0,2600 |
| PIQA | acc_norm | 0,5555 |
| SciQ | acc_norm | 0,6870 |

No se han publicado en la información disponible resultados para HumanEval, GSM8K ni otros benchmarks de código o matemáticas, ni comparaciones directas con modelos de referencia.

## Requisitos de hardware
- VRAM estimada para inferencia: con 71,7 M de parámetros, en BF16 ocupa aproximadamente 0,14 GB de pesos (el repositorio pesa 2,4 GB, probablemente por múltiples checkpoints y optimizador); en cuantización de 8 bits o 4 bits cabría en menos de 0,1 GB de pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; una RTX 4090 o A100 están sobradamente dimensionadas. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer (GTX 1060 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`); la evaluación del autor se realizó con vLLM en BF16. No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño, se espera latencia muy baja en GPU, pero la decodificación multi-token y el código personalizado pueden afectar al rendimiento real.

## Comparativa con modelos similares
No se dispone de comparaciones oficiales con otros modelos en la información proporcionada. Como referencia cualitativa, se sitúa en la franja de modelos pequeños (≈70-130 M de parámetros) tipo GPT-2 small, pero con arquitectura propietaria y sin datos comparativos publicados:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kroha-base-dev | ≈72 M | no disponible (eval. a 2K) | CC-BY-4.0 | Hugging Face (requiere `custom_code`) |
| GPT-2 small (referencia) | 124 M | 1.024 tokens | MIT | Amplia |
| Modelos comparables de 70-130 M | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Es un checkpoint de entrenamiento (`Kroha-base-dev`), no un modelo alineado para conversación; no se garantiza calidad en diálogo multi-turno.
- Los benchmarks son de 0-shot y no verificados (`verified: false`); los valores en MMLU (0,247), HellaSwag (0,294) y CommonsenseQA (0,206) están cerca o por debajo del azar en varias tareas, lo que refleja la limitación de escala.
- Riesgo elevado de alucinación y de respuestas incoherentes en tareas abiertas, dado el tamaño reducido y la ausencia de fases de alineación declaradas.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- No se declara lista oficial de idiomas soportados; el multilingüismo es inferido de los datasets, no garantizado.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero sin garantías del autor; revisar términos de los datasets de entrenamiento si se redistribuye.
- No hay información sobre cuantizaciones GGUF/GGML ni sobre soporte en llama.cpp/Ollama, lo que limita su despliegue en entornos sin GPU.

## Enlaces
- Hugging Face: https://huggingface.co/d0rj/Kroha-base-dev
- Modelo base: https://huggingface.co/d0rj/Kroha-base
- Evaluación completa (evaluation.json): https://huggingface.co/d0rj/Kroha-base-dev/blob/main/evaluation.json
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
