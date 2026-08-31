# lhahle/ttt-dual-clg-phnorm-340M

## Resumen

El modelo `lhahle/ttt-dual-clg-phnorm-340M` es un modelo de lenguaje basado en la arquitectura Test-Time Training (TTT), desarrollado por el investigador lhahle. Con 372,5 millones de parámetros reales (etiquetado como 340M por convención), implementa una variante de memoria dual que combina dos bucles de actualización de estado con diferentes granularidades temporales: un chunk rápido de 32 tokens y un chunk lento de 64 tokens. Esta arquitectura pertenece a la familia de modelos de estado recurrente que actualizan sus parámetros internos durante la inferencia, en lugar de depender de una atención fija como los transformers clásicos.

El modelo se ha preentrenado durante 28.620 pasos sobre 15.000 millones de tokens del subconjunto fineweb-edu (muestra de 100B), utilizando el framework de entrenamiento denominado "flame". Su relevancia actual radica en ser una implementación abierta y reproducible de las ideas de TTT dual-memory con normalización per-cabeza (qk-norm) y puerta de fusión en bucle cerrado, un área de investigación activa para mejorar la eficiencia en contextos largos frente a la atención cuadrática de los transformers. Al tratarse de un modelo de investigación sin licencia declarada ni documentación extensa, su uso principal es experimental y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTT dual-memory, 22 capas, 8 cabezas, dimension 1024 |
| Parametros totales | 372.507.248 |
| Parametros activos | no disponible (no es MoE declarado) |
| Longitud de contexto | no disponible (evaluado hasta 4k en NIAH) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma TTT (Test-Time Training), donde el estado oculto es un modelo que se actualiza mediante gradientes durante la inferencia. En esta variante dual-memory conviven dos memorias con granularidades distintas: una rápida con chunk de 32 tokens y una lenta con chunk de 64 tokens. El mecanismo de transferencia alfa (alpha transfer) está activado y es entrenable, permitiendo que el modelo aprenda a combinar las contribuciones de ambas memorias. Se emplea una decay aprendida libre (free learned decay) sin retención fija, y normalización query-key por cabeza (per-head qk-norm) para estabilizar el entrenamiento. La fusión entre las dos salidas se realiza mediante una puerta de mezcla en bucle cerrado (closed-loop blend gate).

El preentrenamiento se completó en 28.620 pasos sobre 15.000 millones de tokens del dataset fineweb-edu (muestra de 100B), usando el framework "flame". No se menciona explícitamente el uso de RLHF, DPO u otras técnicas de alineación posterior. La elección de fineweb-edu sugiere un enfoque en datos de alta calidad filtrados, típico de modelos de investigación orientados a razonamiento.

## Capacidades

- Generación de texto autoregresiva basada en el estado recurrente TTT, con capacidad de procesar secuencias de longitud arbitraria en principio, aunque la evaluación documentada cubre hasta 4.000 tokens.
- Recuperación de información en contexto (needle-in-a-haystack): el modelo reporta resultados de 0.978, 0.882 y 0.354 de exactitud (EM) en la tarea NIAH a 1k, 2k y 4k tokens respectivamente, aunque el autor advierte que estas métricas están confundidas por el formato de evaluación.
- Procesamiento de contexto largo gracias a la memoria dual, que permite mantener información relevante a lo largo de la secuencia sin el coste cuadrático de la atención transformer.
- Capacidades multilingües: no declaradas; el conjunto de entrenamiento fineweb-edu es predominantemente inglés, por lo que se asume un soporte limitado a lenguas con alta representación en ese corpus.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación académica en arquitecturas recurrentes: el modelo sirve como banco de pruebas para estudiar el comportamiento de TTT dual-memory en tareas de recuperación de información y modelado de lenguaje, permitiendo comparar con transformers y otras RNN modernas (Mamba, RWKV).
- Evaluación de protocolos de evaluación de contexto largo: dado que el autor advierte sobre la confusión de formato en NIAH, el modelo puede utilizarse para calibrar nuevas métricas de recuperación que separen el formato de la semántica.
- Experimentación con técnicas de normalización y regularización: la combinación de qk-norm, decay libre y puerta en bucle cerrado ofrece un caso de estudio para investigar la interacción entre estos componentes en modelos pequeños.
- Generación de texto en entornos con restricciones de memoria: al tener solo 372M de parámetros, puede ejecutarse en hardware modesto y servir como componente base en sistemas de generación con requisitos reducidos de latencia.
- Prototipado de sistemas de diálogo de investigación: aunque no se ha entrenado específicamente para diálogo, su capacidad de mantener estado a lo largo de secuencias largas lo hace útil para experimentos de memoria conversacional.
- Análisis de transferencia de conocimiento entre granularidades temporales: la arquitectura dual permite estudiar cómo se combina información a corto y largo plazo, con aplicaciones en resumen de documentos y modelado de temas.

## Benchmarks y rendimiento

El único benchmark documentado en la model card es la tarea NIAH (Needle In A Haystack), con resultados de exactitud (EM) reportados por el autor en la fila del 2026-08-28:

| Tarea | Longitud de contexto | Resultado (EM) |
|---|---|---|
| NIAH | 1.000 tokens | 0.978 |
| NIAH | 2.000 tokens | 0.882 |
| NIAH | 4.000 tokens | 0.354 |

Advertencia del autor: el EM de NIAH está confundido por el formato de la evaluación (format-confounded), por lo que estos valores no deben citarse sin consultar las notas del repositorio (`notes_results_reference.md`). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval, GSM8K o similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 372,5M de parámetros, en precisión fp32 se requieren aproximadamente 1,5 GB; en fp16/bfloat16 unos 745 MB; en int8 cuantizado (no disponible oficialmente) unos 373 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para fp32. Modelos como NVIDIA GTX 1650, RTX 3060, RTX 4090 o superiores pueden ejecutarlo sin problemas. También es viable en CPU con suficiente RAM (≈2-4 GB).
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU consumer moderna e incluso en hardware embebido con 2 GB de memoria.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo safetensors con arquitectura TTT personalizada, requiere una implementación específica del código de inferencia (probablemente el framework "flame" del autor).
- Latencia y throughput: no disponible. Al ser un modelo pequeño, se espera una latencia moderada, pero depende de la implementación del bucle TTT, que implica actualizaciones de gradiente durante la inferencia y puede ser más lento que un transformer equivalente en hardware sin optimizaciones.

## Comparativa con modelos similares

La comparativa se establece con otros modelos de la familia TTT publicados en el paper "Learning to (Learn at Test Time): RNNs with Expressive Hidden States" (arXiv:2407.04620), que incluye instanciaciones TTT-Linear y TTT-MLP de 125M a 1.3B parámetros.

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| lhahle/ttt-dual-clg-phnorm-340M | 372,5M | no disponible (eval hasta 4k) | TTT dual-memory (chunks 32/64) | no disponible |
| TTT-Linear (paper) | 125M - 1.3B | no especificado | TTT con estado lineal | no disponible (paper de investigación) |
| TTT-MLP (paper) | 125M - 1.3B | no especificado | TTT con estado MLP de 2 capas | no disponible (paper de investigación) |

No se dispone de benchmarks comparables entre estos modelos en la información proporcionada. La comparativa con transformers de tamaño similar (p. ej., GPT-2 340M) no es posible sin datos de rendimiento publicados. La principal diferencia frente a los modelos del paper es la incorporación de memoria dual con chunks de distinta granularidad y la puerta de fusión en bucle cerrado, que no aparece en las variantes TTT-Linear/MLP originales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento sobre fineweb-edu (corpus filtrado de alta calidad, predominantemente inglés) puede introducir sesgos culturales y lingüísticos propios de ese conjunto de datos.
- Riesgo de alucinacion: no evaluado formalmente; como modelo de lenguaje generativo, presenta riesgo inherente de producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento factual.
- Limitaciones de contexto: la longitud de contexto no está especificada. La evaluación NIAH se realizó hasta 4k tokens y muestra una degradación significativa (de 0.978 a 0.354) al aumentar la longitud, lo que sugiere limitaciones prácticas en la retención de información más allá de esa escala.
- Restricciones de licencia: no se declara ninguna licencia, lo que impide su uso comercial o incluso su redistribución sin autorización explícita del autor. Se recomienda contactar con lhahle antes de cualquier uso fuera de investigación personal.
- Advertencias de evaluación: el autor indica explícitamente que el EM de NIAH está confundido por el formato de evaluación; los resultados no deben interpretarse como una medida pura de recuperación de información.
- Documentación incompleta: no hay información sobre tokenizador, idiomas soportados, ni detalles de implementación del código de inferencia. La reproducibilidad fuera del entorno del autor es limitada.
- Framework propietario: el entrenamiento se realizó con el framework "flame", que no es de acceso público conocido, lo que dificulta la carga directa del modelo con librerías estándar como HuggingFace Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lhahle/ttt-dual-clg-phnorm-340M
- Paper de referencia sobre TTT: https://arxiv.org/abs/2407.04620 (Learning to (Learn at Test Time): RNNs with Expressive Hidden States)
