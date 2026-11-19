# ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-80pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-SparseGPT-80pct es una variante podada del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de investigación sobre poda estructurada: el modelo original se ha reducido a un 80 % de sparsity semi-estructurada mediante una modificación del método SparseGPT, sin reentrenamiento posterior (one-shot). El resultado es un artefacto de referencia (baseline) para comparar con otras técnicas de poda del mismo autor, no un modelo pensado para producción.

El modelo base emplea una arquitectura GatedDeltaNet, una variante de atención lineal con compuertas (gated linear attention) que sustituye la atención cuadrática clásica por un mecanismo de estado recurrente con actualizaciones delta. Con 1.466.343.808 parámetros totales y un tamaño de repositorio de 2,9 GB en safetensors, el modelo podado conserva la estructura de capas del original, pero cada capa lineal dentro de los bloques tiene exactamente el mismo número de pesos no nulos por fila.

La relevancia de esta ficha es doble: por un lado, documenta una técnica concreta de poda (SparseGPT con restricción por fila, inspirada en EHWS) aplicada a un transformer de atención lineal; por otro, evidencia el coste en calidad de una poda agresiva al 80 % sin recuperación, con una perplejidad en WikiText-2 que pasa de 10,31 a 173,17. Es, por tanto, un modelo útil para estudiar límites de compresión, no para despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuertas, basada en delta rule) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; repo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es GatedDeltaNet, un modelo de atención lineal con compuertas que reemplaza la atención softmax por un mecanismo de estado recurrente con regla delta. El modelo base (m-a-p/1.3B-100B-GatedDeltaNet-pure) fue entrenado con 100B tokens según indica su nombre, aunque la model card de esta variante no detalla la composición del dataset ni si hubo fases de RLHF o DPO. El modelo podado conserva la topología de capas del original, pero modifica los pesos de todas las capas lineales dentro de los bloques.

La poda se realizó en una sola pasada (one-shot, sin reentrenamiento) con una variante del algoritmo SparseGPT implementada sobre la herramienta oficial `fasterprune`. La modificación respecto al SparseGPT estándar consiste en una restricción por fila: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas más bajas según la métrica `w^2 / [H^-1]_jj^2`, equivalente a la regla N:M de SparseGPT con M igual al tamaño del bloque. El resultado es que todas las filas de todas las capas podadas tienen exactamente el mismo número de pesos no nulos (verificado en 240 capas), lo que garantiza un balanceo perfecto de trabajo por fila. La calibración usó el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0; los bloques se podaron en orden, cada uno calibrado sobre las salidas de los bloques ya podados. La poda se ejecutó en bfloat16 y tardó 4,2 minutos en una A100 de 40 GB. Los embeddings y la cabeza lm_head permanecen densos.

## Capacidades

- Generación de texto autoregresiva: el modelo conserva la funcionalidad de lenguaje del base, aunque con degradación severa de calidad tras la poda.
- Razonamiento y conocimiento factual: medido en tareas zero-shot (ARC, HellaSwag, OpenBookQA, etc.), con caídas notables respecto al modelo denso.
- Comprensión lectora y respuesta a preguntas: evaluado en BoolQ y OpenBookQA, con rendimiento muy inferior al denso.
- Inferencia de sentido común: evaluado en HellaSwag y Winogrande, con precisión reducida a aproximadamente la mitad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre poda de modelos: el modelo sirve como baseline para comparar técnicas de sparsification (SparseGPT estándar, EHWS, etc.) sobre arquitecturas de atención lineal, midiendo el impacto en perplejidad y tareas zero-shot.
- Estudio de balanceo de carga en kernels dispersos: al tener exactamente el mismo número de no nulos por fila en las 240 capas podadas, es útil para validar implementaciones de kernels sparse con distribución uniforme de trabajo.
- Análisis de degradación por compresión: permite cuantificar cuánto cae la calidad (perplejidad de 10,31 a 173,17 en WikiText-2) al aplicar 80 % de sparsity sin recuperación, informando decisiones sobre presupuestos de compresión.
- Reproducción de experimentos de poda: la model card documenta el procedimiento (calibración con C4, semilla 0, A100 40 GB, 4,2 minutos), lo que facilita replicar el pipeline con `fasterprune` y `flash-linear-attention`.
- Evaluación de protocolos de benchmark: al usar el protocolo de ELSA y lm-evaluation-harness, sirve para contrastar resultados entre herramientas de evaluación sobre modelos dispersos.
- Docencia y divulgación: ejemplo didáctico de cómo una poda agresiva one-shot afecta a tareas de sentido común y comprensión, con tablas de resultados comparativas denso vs. podado.
- No recomendado para producción: la calidad del modelo podado (perplejidad >140 en C4) lo hace inadecuado para aplicaciones reales de generación, atención al cliente o generación de código.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (80 % sparsity) | 173,17 | 145,91 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,1886 |
| arc_easy | 0,7222 | 0,3026 |
| boolq | 0,6159 | 0,5511 |
| hellaswag | 0,4629 | 0,2775 |
| openbookqa | 0,2920 | 0,1280 |
| rte | 0,4982 | 0,5307 |
| winogrande | 0,6188 | 0,4933 |
| Media | 0,5123 | 0,3531 |

Sparsity medida sobre estos pesos: 0,7999. Verificado que las 240 capas podadas tienen el mismo número de no nulos por fila.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.466 millones de parámetros en bfloat16, el modelo ocupa aproximadamente 2,9 GB en pesos; en fp16 serían unos 2,9 GB adicionales de overhead de activaciones y caché, por lo que cabe holgadamente en GPUs de 8 GB o más.
- GPU recomendadas: A100 40 GB (usada para la poda), H100, RTX 4090, RTX 3090, RTX 4080; cualquier GPU con al menos 8 GB de VRAM debería poder cargarlo en bfloat16.
- Cabe en GPU de consumidor: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares.
- Opciones de despliegue: requiere `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible; la arquitectura GatedDeltaNet puede no estar soportada por estos runners sin adaptaciones.
- Latencia y throughput: no disponibles en la información proporcionada. La poda se completó en 4,2 minutos en una A100 40 GB, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Sparsity | Perplejidad WikiText-2 | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (GatedDeltaNet-1.3B, 80 % SparseGPT) | 1,466 B | no disponible | no disponible | 80 % semi-estructurada | 173,17 | Hugging Face (ikimyaii) |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (base denso) | 1,3 B (aprox.) | no disponible | no disponible | 0 % | 10,31 | Hugging Face (m-a-p) |
| SparseGPT estándar sobre el mismo base | 1,466 B | no disponible | no disponible | 80 % (regla N:M estándar) | no disponible | No publicado en la información |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible | Cuenta ikimyaii |

La comparativa directa más fiable es contra el modelo base denso, del que se dispone de métricas completas. Frente a otras técnicas de poda (SparseGPT estándar, EHWS), la model card indica que este modelo es el baseline para los modelos EHWS del mismo autor, pero no se aportan resultados numéricos de esos otros métodos en la información disponible.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por 16,8 (de 10,31 a 173,17) y en C4 por 10,6 (de 13,76 a 145,91). La media zero-shot cae de 0,5123 a 0,3531.
- Caídas especialmente graves en ARC-Easy (de 0,7222 a 0,3026), HellaSwag (de 0,4629 a 0,2775) y OpenBookQA (de 0,2920 a 0,1280), lo que indica pérdida sustancial de razonamiento y sentido común.
- Única mejora observada: RTE sube ligeramente (de 0,4982 a 0,5307), probablemente por azar dado el tamaño de la tarea; no debe interpretarse como una mejora general.
- Modelo no apto para producción: es un artefacto de investigación (baseline) para comparar técnicas de poda, no un modelo desplegable.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier uso.
- Idiomas no disponibles: no se documenta qué idiomas soporta; el base se entrenó presumiblemente con datos multilingües, pero no se confirma.
- Longitud de contexto no disponible: no se especifica la ventana de contexto del modelo base ni de esta variante.
- Dependencia de `flash-linear-attention`: la carga requiere esta librería, lo que limita la portabilidad a runners estándar (vLLM, llama.cpp, Ollama, TGI) sin adaptaciones.
- Riesgo de alucinación: no evaluado en la información disponible, pero previsiblemente elevado dado el nivel de degradación.
- Sesgos: no documentados en la información disponible.
- Reproducibilidad: la poda usó semilla 0 y calibración con C4, pero el código de recorrido de capas es nuevo (los drivers oficiales solo soportan OPT y LLaMA), lo que puede introducir diferencias respecto a reproducciones con otras herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Herramienta de poda `fasterprune`: no disponible en la información proporcionada
- Librería `flash-linear-attention`: no disponible en la información proporcionada
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Repositorio de lm-evaluation-harness: no disponible en la información proporcionada
