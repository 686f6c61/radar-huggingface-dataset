# ahiok/looped-fineweb-10m

## Resumen

ahiok/looped-fineweb-10m es un modelo de lenguaje decoder-only de tipo *looped transformer* desarrollado por ahiok como artefacto de investigación para estudiar el escalado de profundidad en tiempo de inferencia bajo un presupuesto duro de parámetros. Con solo 9.441.152 parámetros totales (6.295.424 no-embeddings) y entrenado con 100 millones de tokens del dataset FineWeb, el modelo reutiliza el mismo bloque de dos capas un número variable de veces (R) en inferencia, lo que permite intercambiar coste computacional por calidad de salida sin cambiar los pesos.

La relevancia de este modelo reside en su exploración de la profundidad recurrente como alternativa a los modelos densos convencionales: al poder elegir R en tiempo de inferencia, se puede ajustar el cómputo a la dificultad de cada consulta. El bloque recurrente sigue el estilo Qwen3 (RMSNorm pre-norm, GQA, QK-norm, SwiGLU, RoPE) y la única diferencia con un modelo no recurrente del mismo tamaño es una suma tensorial del embedding al estado en cada iteración, que aporta una mejora de 0,10 nats en la pérdida de validación. El autor advierte explícitamente que no es un generador de texto utilizable, sino una herramienta de estudio para test-time compute.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bloque recurrente (looped) estilo Qwen3: RMSNorm pre-norm, GQA, QK-norm, SwiGLU, RoPE |
| Parametros totales | 9.441.152 (6.295.424 no-embedding) |
| Parametros activos | 9.441.152 (todos los parámetros se activan en cada paso; la profundidad efectiva varía con R) |
| Longitud de contexto | no disponible (no se especifica en la documentación) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato PyTorch nativo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | pytorch_model.bin (PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura *looped transformer*: un único bloque de dos capas se aplica R veces sobre el estado oculto, donde R se elige en tiempo de inferencia. La recurrencia se define como `s <- Block(s + e)`, es decir, el embedding de entrada se suma al estado al comienzo de cada iteración. Esta operación de suma es la única diferencia con un modelo no recurrente de idéntico número de parámetros, y según el autor aporta una mejora de 0,10 nats en la pérdida de validación. El bloque interno sigue el diseño de Qwen3: normalización RMSNorm previa a cada subcapa, atención multi-consulta agrupada (GQA), normalización de Q y K (QK-norm), MLP SwiGLU y embeddings posicionales rotatorios (RoPE).

El entrenamiento se realizó con 100.000.000 de tokens del dataset FineWeb, con un tokenizador BPE de nivel byte con 8192 entradas incluido en el repositorio. La validación se hizo sobre una partición retenida de documentos del mismo shard de FineWeb. El modelo se entrenó con R=16 (profundidad efectiva de 32 capas), aunque el autor reporta que degrada notablemente fuera de ese valor: con R=8 la pérdida sube a 4,13 y con R=32 a 3,99. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un modelo de preentrenamiento puro.

## Capacidades

- Generación de texto en inglés con estadísticas del lenguaje aprendidas de FineWeb, pero sin coherencia semántica suficiente para uso práctico (el autor lo califica como "no usable").
- Escalado de profundidad en tiempo de inferencia: permite elegir R (número de repeticiones del bloque) para ajustar el coste computacional y la calidad de la salida.
- Investigación sobre test-time compute y profundidad recurrente: el modelo sirve para estudiar cómo la pérdida de validación varía con R, mostrando un óptimo en R=16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio. No hay indicios de capacidades multilingües más allá del inglés.

## Casos de uso

- Estudio académico del escalado de profundidad en inferencia: el modelo permite reproducir experimentos sobre cómo la pérdida de validación y la perplejidad cambian con el número de repeticiones R, lo que es útil para investigar arquitecturas recurrentes y test-time compute.
- Benchmark de eficiencia paramétrica: al tener solo 9,4M de parámetros, sirve como punto de referencia para comparar el rendimiento de modelos densos frente a modelos con profundidad recurrente bajo el mismo presupuesto de parámetros.
- Validación de técnicas de entrenamiento con presupuesto reducido: su entrenamiento con 100M de tokens y 9,4M de parámetros permite probar hipótesis sobre regularización, inicialización o dinámicas de optimización en entornos de bajos recursos.
- Desarrollo de tokenizadores byte-level BPE: el tokenizador de 8192 entradas incluido puede reutilizarse en otros experimentos de modelado de lenguaje en inglés.
- Exploración de la regla de actualización recurrente: la variante con suma del embedding (`s <- Block(s + e)`) se compara con un modelo looped sin esa regla, lo que permite aislar el efecto de esta innovación concreta.
- Reproducción de resultados de investigación: al estar disponible el código completo y las ablaciones en el repositorio de GitHub, el modelo sirve para verificar los hallazgos publicados sobre profundidad recurrente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas de validación sobre una partición retenida de FineWeb, con pérdida, perplejidad y bits/byte para distintos valores de R:

| R (loops) | Pérdida de validación | Perplejidad | Bits/byte |
|---|---|---|---|
| 1 | 7,4054 | 1644,79 | 2,8394 |
| 2 | 6,4121 | 609,16 | 2,4586 |
| 4 | 5,2127 | 183,59 | 1,9987 |
| 8 | 4,1340 | 62,43 | 1,5851 |
| 16 | 3,7898 | 44,25 | 1,4531 |
| 24 | 3,8698 | 47,93 | 1,4838 |
| 32 | 3,9913 | 54,13 | 1,5304 |
| 48 | 4,1892 | 65,97 | 1,6063 |
| 64 | 4,3275 | 75,76 | 1,6593 |
| 96 | 4,5078 | 90,72 | 1,7284 |
| 128 | 4,6195 | 101,44 | 1,7712 |

Como referencia, un modelo no recurrente de 4 capas con el mismo número de parámetros y entrenado con los mismos 100M tokens alcanza una pérdida de 3,8965 (perplejidad 49,23, bits/byte 1,4940), y un modelo looped sin la regla de actualización llega a 3,8315 (perplejidad 46,13, bits/byte 1,4691). El modelo con la regla de actualización y R=16 supera a ambos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener solo 9,4M de parámetros, el modelo ocupa aproximadamente 38 MB en FP32 (9.441.152 × 4 bytes). Cabe en cualquier GPU moderna, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requieren GPUs de datacenter. Una RTX 4090, A100 o incluso una GPU integrada pueden ejecutarlo sin problemas.
- En consumer GPU: sí, cabe en cualquier GPU de consumo (desde GTX 1650 en adelante) y también en CPU con memoria RAM estándar.
- Opciones de despliegue: el modelo se distribuye como un script Python (`model.py`) y pesos PyTorch, por lo que se puede cargar con PyTorch estándar. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; dado su tamaño, estas herramientas no serían necesarias.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, la inferencia es prácticamente instantánea en GPU, incluso con R=128 (128 pasadas del bloque de 2 capas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida val. (FineWeb) | Perplejidad | Bits/byte | Licencia |
|---|---|---|---|---|---|---|
| ahiok/looped-fineweb-10m (R=16) | 9,4M | no disponible | 3,7898 | 44,25 | 1,4531 | Apache 2.0 |
| Modelo unlooped 4 capas (mismo tamaño, mismo entrenamiento) | 9,4M | no disponible | 3,8965 | 49,23 | 1,4940 | no disponible |
| Modelo looped sin regla de actualización (mismo tamaño, mismo entrenamiento) | 9,4M | no disponible | 3,8315 | 46,13 | 1,4691 | no disponible |

Los dos modelos de comparación se mencionan en la model card como referencias internas del autor, no como modelos publicados independientemente. No se dispone de comparaciones con modelos comerciales o de mayor tamaño.

## Limitaciones y advertencias

- No es un generador de texto utilizable: el autor lo describe explícitamente como un artefacto de investigación que produce "las estadísticas del inglés, no frases que quieras leer". No debe usarse en producción.
- Sesgos y alucinaciones: al estar entrenado solo con 100M de tokens de FineWeb, el modelo no tiene conocimiento factual fiable y es propenso a generar contenido incoherente o falso.
- Sensibilidad al número de repeticiones R: el rendimiento óptimo se alcanza en R=16; valores inferiores o superiores degradan significativamente la pérdida (por ejemplo, R=8 da 4,13 y R=32 da 3,99). Esto limita su flexibilidad práctica.
- Idioma: solo inglés; no hay soporte para otros idiomas.
- Formato de pesos: solo se distribuye en formato PyTorch nativo (`pytorch_model.bin`); no hay versiones cuantizadas (GGUF, etc.) ni integración con frameworks de inferencia estándar.
- Contexto: no se especifica la longitud máxima de contexto; se desconoce si el modelo maneja ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero dado que el modelo no es funcional para tareas reales, su uso comercial es irrelevante en la práctica.

## Enlaces

- HuggingFace: https://huggingface.co/ahiok/looped-fineweb-10m
- Repositorio de código, ablaciones y reporte: https://github.com/ahiokk/looped-models
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper de FineWeb: https://arxiv.org/abs/2406.17557
