# ducthang1703/crpd-qwen3-1p7b-to-0p6b-hub-stability-student-ref

## Resumen

`crpd-qwen3-1p7b-to-0p6b-hub-stability-student-ref` es un artefacto de investigación publicado por el usuario de HuggingFace `ducthang1703`. No es un modelo entrenado para uso general: la propia model card lo describe como un «ChunkRatio-PD STABILITY TEST (small data, not a usable model)» con rol `student_ref` dentro de un par de destilación Qwen3-1.7B → Qwen3-0.6B. Es decir, se trata del checkpoint de referencia del estudiante empleado en una prueba de estabilidad de un pipeline de destilación de preferencias, no de un modelo conversacional listo para producción.

El modelo parte de `Qwen/Qwen3-0.6B-Base` (596.049.920 parámetros según los tensores en safetensors) y aplica una metodología propietaria denominada ChunkRatio-PD, que combina datos de `HuggingFaceH4/ultrachat_200k` (SFT) y `HuggingFaceH4/ultrafeedback_binarized` (preferencias) junto con un modelo de recompensa y un adaptador DPO LoRA, según las revisiones de datos incluidas en la model card. El autor indica explícitamente que los ajustes del piloto son suposiciones y no los de NARVAL, y que no se reclama ningún resultado de benchmark.

Su relevancia es, por tanto, metodológica y de reproducibilidad: sirve para auditar la estabilidad del pipeline de destilación (fijando revisiones concretas de código, datasets y modelos) y como referencia frente a la que comparar el estudiante final. Cualquier uso como modelo de chat o de generación en producción está fuera del alcance declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B-Base); detalles de capas y atencion no disponibles |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; el modelo base admite GGUF/AWQ por conversion de la comunidad, no confirmado para este artefacto) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; hereda los del modelo base Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`; repo de 2,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3-0.6B-Base`, un transformer decoder-only de ~0,6 mil millones de parámetros. El autor no documenta en la model card el número de capas, la dimensión oculta, la configuración de atención (GQA/MHA) ni la ventana de contexto efectiva de este checkpoint concreto, por lo que esos datos deben consultarse en la ficha del modelo base. El tokenizer y la plantilla de chat se toman de la revisión `698d09a459656c6909e2b79c6827b66c7a10d70b`, con EOS `<|im_end|>` y plantilla de chat con `enable_thinking=false`.

El entrenamiento sigue el esquema ChunkRatio-PD (destilación de preferencias con reparto por chunks) en el que un profesor Qwen3-1.7B (revisiones `698d09a459656c6909e2b79c6827b66c7a10d70b` para el base y `2e46c30d9fba4ed1aaa8f21003e0de58fa7cf944` para el «teacher_plus») transfiere conocimiento a un estudiante Qwen3-0.6B (`da87bfb608c14b7cf20ba1ce41287e8de496c0cd`). El pipeline combina SFT sobre `ultrachat_200k` (revisión `8049631c405ae6576f93f445c6b8166f76f5505a`), un dataset de preferencias (revisión `3949bf5f8c17c394422ccfab0c31ea9c20bdeb85`) derivado de `ultrafeedback_binarized`, un modelo de recompensa (revisión `94fad49f1b3227aa8b566f415a335adb68ec544c`), un adaptador DPO LoRA (revisión `c1a6e68d4e8adb95ef8c535d705985da6c7b6f15`) y el código en la revisión `80a542d2eec36eef9ef78d96f1d5240dca023c18`. La escala declarada es `stability`, con datos reducidos («small data»).

No se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, modos de razonamiento extendido) ni métricas de entrenamiento (número de tokens, composición exacta del dataset, hiperparámetros de RLHF/DPO). El ajuste fino se realizó presumiblemente con LoRA/DPO, pero el artefacto publicado contiene pesos consolidados en safetensors.

## Capacidades

- Generación de texto autoregresiva: hereda la capacidad del modelo base Qwen3-0.6B, aunque el autor no valida ninguna calidad concreta en este checkpoint.
- Conversación multi-turno: la plantilla de chat está configurada con `enable_thinking=false`, orientada a respuestas directas sin traza de razonamiento.
- Rol de referencia para destilación: sirve como `student_ref` en la prueba de estabilidad del pipeline ChunkRatio-PD.
- Reproducibilidad de pipeline: las revisiones de código, datasets, tokenizer, modelo de recompensa y adaptador DPO están fijadas por hash, lo que permite reconstruir el experimento.
- Capacidades de tool calling / function calling: no documentadas para este artefacto.
- Capacidades de agente y razonamiento multi-paso: no documentadas; la plantilla desactiva el modo thinking.
- Capacidades multilingües: no documentadas en la model card.
- Visión, audio o modalidades adicionales: no soportadas (modelo de texto).

## Casos de uso

- Auditoría de estabilidad de pipelines de destilación: utilizar el checkpoint como `student_ref` fijo y comparar las métricas de una nueva ejecución del pipeline frente a esta referencia, aislando la varianza introducida por cambios de datos o hiperparámetros.
- Reproducción de experimentos académicos: las revisiones por hash de código, datasets y modelos permiten reconstruir exactamente la ejecución y verificar resultados de un artículo o informe interno sobre ChunkRatio-PD.
- Estudio de destilación profesor-alumno: analizar qué se transfiere de un profesor Qwen3-1.7B a un estudiante Qwen3-0.6B en tareas de preferencias, comparando distribuciones de salida entre ambos checkpoints.
- Base para experimentos de alineación con DPO: al proceder de un pipeline SFT + DPO LoRA sobre `ultrafeedback_binarized`, sirve como punto de partida controlado para estudios de reward hacking o de sensibilidad al modelo de recompensa.
- Docencia y formación técnica: ejemplo didáctico de artefacto de investigación correctamente versionado (revisiones, licencia, aviso de no-usabilidad) para enseñar prácticas de trazabilidad en ML.
- Pruebas de infraestructura de despliegue: con ~0,6 B de parámetros y 2,4 GB de repo, es útil para validar pipelines de carga con `transformers` o TGI (la model card lo marca como `endpoints_compatible`) antes de escalar a modelos mayores.
- No recomendado para: atención al cliente, generación de código en producción, agentes autónomos o cualquier flujo orientado a usuario final, al tratarse de un artefacto de prueba con datos reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente «No benchmark result is claimed».

| Benchmark | Este modelo | Notas |
|---|---|---|
| MMLU | No disponible | El autor no reclama resultados |
| HumanEval | No disponible | El autor no reclama resultados |
| GSM8K | No disponible | El autor no reclama resultados |
| MT-Bench / AlpacaEval | No disponible | El autor no reclama resultados |

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,2 GB en FP16 (596 M de parámetros × 2 bytes) más overhead de activaciones y KV cache; ~0,35-0,5 GB en cuantización de 4 bits. Estimaciones calculadas a partir del recuento de parámetros, no medidas publicadas.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 y H100 lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible` en HuggingFace). El soporte de llama.cpp/Ollama/GGUF no está confirmado para este artefacto y requeriría conversión manual.
- Latencia y throughput: no disponibles; no se han publicado mediciones. A título orientativo, un modelo de ~0,6 B en FP16 sobre una RTX 4090 queda limitado por overhead de framework más que por cómputo, pero no hay cifras verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crpd-qwen3-1p7b-to-0p6b-hub-stability-student-ref | 596 M | No disponible | Sin benchmarks declarados | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-0.6B-Base (modelo base) | ~0,6 B | No disponible en esta ficha | Benchmarks publicados por Qwen (consultar su ficha) | Apache 2.0 | HuggingFace |
| Qwen3-1.7B (profesor del pipeline) | ~1,7 B | No disponible en esta ficha | Benchmarks publicados por Qwen (consultar su ficha) | Apache 2.0 | HuggingFace |
| Otros estudiantes destilados de Qwen3-0.6B | Variable | Variable | No disponible | Variable | HuggingFace |

La comparación relevante no es de rendimiento sino de propósito: este artefacto es un checkpoint de referencia de un experimento, mientras que los modelos base y profesor son modelos publicados con evaluaciones oficiales. No se dispone de datos para comparar calidad de salida entre ellos en esta ficha.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo califica explícitamente como «small data, not a usable model»; emplearlo en producción o en flujos de usuario final contradice la declaración del autor.
- Sin evaluación de calidad: no se reclama ningún resultado de benchmark, por lo que se desconoce su comportamiento en tareas estándar.
- Configuración del piloto no validada: los ajustes del piloto son «assumptions, not NARVAL's», es decir, suposiciones que no deben interpretarse como la configuración de referencia del método.
- Riesgo de alucinación: no evaluado para este checkpoint; en modelos de ~0,6 B el riesgo es estructuralmente alto, pero no hay mediciones publicadas.
- Sesgos: no documentados. Los datos de `ultrachat_200k` y `ultrafeedback_binarized` provienen de fuentes web y de anotadores, con sesgos de idioma (predominio del inglés), dominio y estilo no analizados por el autor.
- Idiomas: no se declara lista de idiomas soportados; el comportamiento multilingüe es desconocido y depende del modelo base y de los datos de destilación.
- Modo thinking desactivado: la plantilla de chat fija `enable_thinking=false`, por lo que no se aprovecha el modo de razonamiento extendido de la familia Qwen3.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero ello no implica que el modelo sea funcionalmente adecuado; la idoneidad técnica es una cuestión separada de la licencia.
- Trazabilidad dependiente de revisiones: la reproducibilidad depende de que las revisiones por hash de datasets y modelos sigan disponibles en el Hub.
- Advertencia sobre la búsqueda web: los resultados de búsqueda asociados a esta consulta tratan sobre interpretación de serologías de hepatitis B y no guardan relación con el modelo; se han descartado por completo.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentación adicional más allá de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/ducthang1703/crpd-qwen3-1p7b-to-0p6b-hub-stability-student-ref
- Modelo base estudiante: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo profesor (Qwen3-1.7B, revisión referenciada en la model card): https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset SFT: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Paper, blog, repositorio de código o demo del método ChunkRatio-PD: no disponibles en la informacion proporcionada (la model card solo referencia una revisión de código interna, `80a542d2eec36eef9ef78d96f1d5240dca023c18`, sin URL pública).
