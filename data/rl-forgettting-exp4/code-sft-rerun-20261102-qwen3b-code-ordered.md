# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-ordered

## Resumen

`code-sft-rerun-20261102-qwen3b-code-ordered` es un ajuste fino supervisado (SFT) sobre Qwen2.5-3B, publicado por el colectivo de investigación `RL-Forgettting-Exp4` como parte de una campaña de experimentos sobre olvido catastrófico durante el entrenamiento (etiquetado `rl-forgetting`). El modelo forma parte de un lote de trece ejecuciones "frescas" del denominado "October24 request", que incluye brazos sobre Qwen2.5-3B, Qwen3-1.7B-Base y Llama-3.2-3B-Instruct, con distintas variantes de ordenación de datos (ordered, shuffled, uniform, hard, CE). Este checkpoint concreto corresponde al brazo "ordered" sobre la base Qwen2.5-3B para la tarea de código.

El propósito declarado no es producir un modelo de código de propósito general, sino servir como artefacto reproducible para medir el olvido de capacidades tras un SFT especializado en código. La model card detalla hiperparámetros concretos: learning rate 1e-5, una época, semilla 42, batch efectivo de 256, micro-batch de 1, 4 GPUs H100, secuencias de 4096 tokens, 10 checkpoints guardados por brazo y un coeficiente de replay lambda de 1.0. El repositorio incluye tanto pesos como el estado de recuperación y las métricas de evaluación.

El modelo no publica datos de benchmarks propios, idiomas soportados ni pipeline de inferencia, y su licencia es "other" con herencia de la licencia de Qwen2.5-3B. Es, por tanto, un artefacto de investigación más que un modelo listo para producción, y su relevancia radica en la trazabilidad experimental sobre olvido en SFT de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B) |
| Parametros totales | ~3 mil millones (modelo base Qwen2.5-3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens en entrenamiento (contexto nativo del base no indicado en la informacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (derivado de Qwen2.5-3B, sujeto a Qwen Research License) |
| Formato de pesos | safetensors |
| Tamano del repo | 12.4 GB |
| Autor | RL-Forgettting-Exp4 |
| Fecha de publicacion | 2026-11-03 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint base Qwen2.5-3B, un transformer decoder-only denso de aproximadamente 3 mil millones de parámetros. El entrenamiento se ejecutó con learning rate 1e-5, una sola época, semilla 42, batch efectivo de 256 (micro-batch de 1 y acumulación de gradientes), sobre secuencias de 4096 tokens, en 4 GPUs H100. Se guardaron 10 checkpoints por brazo bajo `runs/checkpoints/step_N/model` y un estado final en `runs/final`. El coeficiente de replay es lambda 1.0, lo que sugiere un mecanismo de repetición de datos previos para mitigar el olvido catastrófico, aunque la composición exacta del dataset no se detalla en la información proporcionada.

La innovación relevante del experimento no es arquitectónica (se reutiliza el transformer de Qwen2.5) sino metodológica: el brazo "ordered" forma parte de una matriz de ablaciones sobre el ordenamiento de los datos de SFT de código (ordered, shuffled, uniform, hard, CE). El repositorio incluye un `delivery_manifest.json` con commits inmutables y `artifact_repository`/`model_repository` por unidad de entrega, y un `request-provenance.json` que enlaza las ejecuciones de referencia. No se especifica en la información disponible si hubo RLHF, DPO ni datos de entrenamiento adicionales más allá del SFT descrito.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen2.5-3B.
- Especialización en tareas de código vía SFT (tag `coding-sft`), orientada a generación y posiblemente reparación de código.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües no documentadas (idiomas no disponibles).
- No se documenta modo de razonamiento (thinking mode), visión, audio ni decodificación especulativa.
- El uso previsto es experimental dentro del marco `rl-forgetting` (medición de olvido y recuperación de capacidades).

## Casos de uso

- Investigación sobre olvido catastrófico: usar el checkpoint como punto de partida para medir cuánto olvida Qwen2.5-3B tras un SFT de código y comparar con los brazos shuffled/uniform/hard/CE del mismo lote, usando las métricas incluidas en el repositorio de artefactos.
- Reproducción de experimentos de SFT de código: el `delivery_manifest.json` y los checkpoints intermedios permiten reentrenar o re-evaluar con los mismos hiperparámetros (lr 1e-5, batch 256, 1 época).
- Evaluación de estrategias de replay: con lambda 1.0 declarado, sirve para estudiar el efecto del replay sobre la retención de capacidades generales frente a las de código.
- Generación de parches en entornos controlados: aprovechando su ventana de 4096 tokens en entrenamiento y su SFT de código, para tareas de edición de archivos pequeños en pipelines de CI/CD de baja criticidad.
- Estudio comparativo de ordenación de datos: como brazo "ordered" de una matriz de ablaciones, para analizar si el orden de las muestras afecta al rendimiento downstream de código y a la magnitud del olvido.
- Base para destilación o adaptación posterior en entornos de investigación: al ser un denso de ~3B y pesos safetensors, es cargable en frameworks estándar para continuar el ajuste con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` como ubicación de evaluaciones puntuadas por ejecución, pero los valores numéricos no se han incluido en la información proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- Inferencia en precisión completa (fp16/bf16): en torno a 6-7 GB de VRAM para los pesos de un modelo de 3B, más overhead de activaciones dependiente de la longitud de contexto.
- Cuantización GGUF de 4 bits: aproximadamente 2-3 GB, apto para GPUs consumer de 8 GB VRAM.
- Cuantización de 8 bits: en torno a 3.5-4 GB, cómoda en RTX 3060/4060 con 8-12 GB.
- GPU recomendadas para entrenamiento (según la propia model card): 4x H100. Para inferencia no se recomienda hardware concreto en la información disponible.
- Cabe en GPUs consumer (RTX 4090, RTX 4090 Ti, RTX 4060 Ti 16 GB, etc.) con cuantización; en fp16 conviene al menos 12-16 GB de VRAM.
- Opciones de despliegue: pesos safetensors cargables con Transformers, vLLM o TGI; para cuantización ligera en CPU/consumer, conversión a GGUF y uso con llama.cpp u Ollama (el repo no distribuye GGUF de forma nativa según la información disponible).
- Latencia y throughput no documentados en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3b-code-ordered | ~3B | 4096 (entrenamiento) | other (Qwen Research License) | HuggingFace, safetensors | Artefacto de investigación `rl-forgetting` |
| Qwen2.5-3B (base upstream) | ~3B | No especificado aquí | Qwen Research License | HuggingFace | Modelo base sin SFT de código |
| Qwen3-1.7B-Base (base del mismo lote) | ~1.7B | No especificado aquí | Apache 2.0 | HuggingFace | Alternativa más pequeña del lote, con licencia permisiva |
| Llama-3.2-3B-Instruct | ~3B | No especificado aquí | Llama 3.2 Community License | HuggingFace, con aceptación de uso | Alternativa de instrucciones que también se entrena en el lote |

La comparación directa de rendimiento no está disponible: el repositorio no aporta cifras de benchmarks para este checkpoint ni para las alternativas dentro de la información proporcionada. Las diferencias relevantes son de licencia (Apache 2.0 frente a otras licencias) y de tamaño (1.7B frente a 3B).

## Limitaciones y advertencias

- Modelo de investigación: sin benchmarks publicados en la información disponible, no se puede verificar su rendimiento en código ni en capacidades generales.
- Riesgo elevado de olvido catastrófico: es precisamente el fenómeno que el lote experimental intenta medir; la retención de capacidades generales del base no está garantizada.
- Riesgo de alucinación y de generar código incorrecto o inseguro no documentado; no debe usarse sin validación en producción.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe más allá del base.
- Licencia "other" con herencia de Qwen Research License: restricciones de uso comercial no explicitadas en la información disponible. Debe revisarse el fichero `LICENSE`/`NOTICE` del repositorio.
- No se documentan capacidades de tool calling, agentes ni vision; no deben asumirse.
- Sin pipeline de inferencia declarado y con 0 descargas en el momento de la consulta; sin comunidad que valide su comportamiento.
- El checkpoint base Qwen2.5-3B tiene parámetros y contexto nativo no detallados en la información proporcionada; la ventana de entrenamiento de 4096 tokens no debe equipararse a la ventana máxima del base.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-ordered
- Repositorio de artefactos del lote (referenciado en la model card): no disponible como URL directa en la información proporcionada
- Evaluaciones MBPP+ referenciadas (`evaluations/mbppplus_n160_t0.6/delivery_manifest.json`): ruta interna del repositorio, sin URL pública en la información disponible
- Modelo base Qwen2.5-3B: no se proporciona URL en la información disponible
- Modelo Qwen3-1.7B-Base (otro brazo del lote): no se proporciona URL en la información disponible
- Modelo Llama-3.2-3B-Instruct (otro brazo del lote): no se proporciona URL en la información disponible
