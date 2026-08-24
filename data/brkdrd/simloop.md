# brkdrd/simloop

## Resumen

SimLoop es un modelo de lenguaje de tipo *looped transformer* (también llamado transformer recurrente con pesos atados) desarrollado por el usuario brkdrd como artefacto de investigación. Se trata de un modelo Qwen3-style entrenado desde cero sobre el corpus FineWeb con un presupuesto muy estricto: menos de 10 millones de parámetros y unos 60 millones de tokens de entrenamiento. Su objetivo principal es estudiar el comportamiento de la profundidad recurrente cuando un mismo bloque se aplica varias veces en inferencia, algo posible gracias al *weight tying* (atado de pesos).

La arquitectura combina capas transformer convencionales con un bloque intermedio que se repite K veces, donde K es un hiperparámetro de inferencia que se puede variar libremente. El modelo reporta resultados de perplejidad y bits-por-byte para distintos valores de K, mostrando que la aplicación repetida del bloque looped empeora las métricas más allá de un punto óptimo (saturación). Este hallazgo es la contribución central del proyecto. El modelo está pensado como herramienta de investigación, no como un LLM de propósito general: solo soporta inglés, no ha sido ajustado con instrucciones y su capacidad de generación de texto es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer looped (weight-tied) estilo Qwen3 con RMSNorm, RoPE, SwiGLU, GQA y QK-norm |
| Parámetros totales | 9.962.496 (incluye embeddings, con entrada y salida atadas) |
| Parámetros activos | no aplica (no es MoE; todos los parámetros se usan en cada paso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (solo pesos en safetensors originales) |
| Idiomas soportados | inglés (solo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de capas apiladas con un bloque recurrente central. La estructura exacta es:

`embed → [1 capa] → (1 capa looped) × K → [1 capa] → RMSNorm → cabeza atada`

El bloque looped comparte los mismos pesos cada vez que se aplica, lo que permite variar la profundidad efectiva en inferencia sin cambiar los parámetros. Las capas utilizan RMSNorm, RoPE (posiciones rotatorias), SwiGLU como activación, y atención con GQA (6 cabezas de consulta, 2 de clave-valor, con dimensión de cabeza 64). El vocabulario es un BPE de 16.384 unidades entrenado sobre FineWeb. El entrenamiento se realizó con 60.014.592 tokens (menos de los 100M permitidos), sin etapas de RLHF ni DPO.

La innovación clave es el *looped depth*: la posibilidad de evaluar el mismo checkpoint con distintos valores de K en inferencia. El modelo fue entrenado con K=1 (una sola aplicación del bloque looped) y, al evaluar con K>1, se observa que la perplejidad empeora progresivamente. Esto indica que el bloque saturado y que añadir profundidad recurrente no mejora la capacidad de generalización en este régimen de entrenamiento.

## Capacidades

- Generación de texto básica en inglés, con ventana de contexto de 512 tokens.
- Modelo de investigación para estudiar el comportamiento de la profundidad recurrente y el *weight tying*.
- Permite variar el número de aplicaciones del bloque looped (K) en inferencia, sin reentrenar.
- Capacidad de razonamiento limitada, acorde a su tamaño (10M parámetros) y presupuesto de entrenamiento (60M tokens).
- No tiene soporte para *tool calling*, *function calling* ni tareas agénticas.
- No es multilingüe; solo inglés.
- No ha sido ajustado con instrucciones ni con RLHF; no presenta un modo *thinking* ni capacidades de visión o audio.

## Casos de uso

- Investigación sobre arquitecturas eficientes: SimLoop sirve para analizar cómo el *weight tying* y la profundidad recurrente afectan a la perplejidad y a la saturación de la representación. Se puede usar como banco de pruebas para hipótesis sobre el límite de profundidad en modelos con pesos atados.
- Estudio de la saturación de profundidad: los datos reportados con distintos valores de K permiten cuantificar cuándo añadir aplicaciones del bloque looped empeora la pérdida, un fenómeno de interés en el diseño de modelos recurrentes.
- Comparación de métricas de evaluación: el modelo reporta perplejidad, *bits-per-byte* y cross-entropy, lo que permite analizar la dependencia de estas métricas con el tokenizador y la profundidad.
- Base para experimentos de *depth-adaptation*: al permitir K variable en inferencia, se puede probar estrategias de selección dinámica de profundidad según la complejidad de la entrada.
- Entrenamiento de modelos pequeños con presupuestos limitados: como referencia para estudiar el comportamiento de modelos con menos de 10M parámetros y pocos tokens de entrenamiento.
- Validación de la teoría del *looped transformer*: para replicar o contrastar resultados de la literatura sobre *weight-tied* recurrentes y su comportamiento en escalas pequeñas.

## Benchmarks y rendimiento

El autor reporta resultados en una partición de validación de FineWeb para distintos valores de K (número de aplicaciones del bloque looped en inferencia). La tabla muestra cross-entropy (nats), perplejidad y bits-per-byte. El mejor resultado se obtiene con K=1, y cualquier K superior empeora las métricas.

| K | CE (nats) | Perplexity | Bits-per-byte |
|---|---|---|---|
| 0 | 5.4088 | 223.35 | 1.8913 |
| 1 | 4.3966 | 81.17 | 1.5374 (mejor) |
| 2 | 4.5995 | 99.43 | 1.6083 |
| 3 | 4.9413 | 139.95 | 1.7278 |
| 4 | 5.2659 | 193.62 | 1.8413 |
| 5 | 5.5476 | 256.63 | 1.9399 |
| 6 | 5.7900 | 327.01 | 2.0246 |
| 7 | 6.0000 | 403.41 | 2.0980 |
| 8 | 6.1835 | 484.69 | 2.1622 |
| 9 | 6.3452 | 569.77 | 2.2188 |
| 10 | 6.4887 | 657.65 | 2.2689 |
| 11 | 6.6166 | 747.41 | 2.3137 |
| 12 | 6.7313 | 838.20 | 2.3537 |

Como referencia, el modelo *unigram* (sin contexto) obtiene CE 7.5476 y perplejidad 1896.10; la distribución uniforme sobre el vocabulario obtiene CE 9.7041. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La tabla anterior es la única métrica reportada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB. Con 9.96M parámetros en FP32, el modelo ocupa unos 40 MB; en FP16 aún menos. Se puede ejecutar en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluida una NVIDIA GTX 1050 o superior. También se puede ejecutar en CPU.
- En consumer GPU: sí, cualquier tarjeta moderna (RTX 30x0, RTX 40x0, etc.) es más que suficiente.
- Opciones de despliegue: el modelo se distribuye en formato PyTorch (safetensors). Se puede cargar con PyTorch directamente. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo pequeño y con arquitectura personalizada, no se recomienda usarlo en producción.
- Latencia y throughput: no se han publicado mediciones, pero dado su tamaño, la inferencia es inmediata en GPU y rápida en CPU.

## Comparativa con modelos similares

No hay modelos comparables directamente disponibles en la información proporcionada. SimLoop es un artefacto de investigación específico para estudiar *looped transformers* con pesos atados. Otros modelos pequeños como TinyStories (33M) o Pythia-70M tienen más parámetros y se entrenan con más datos, pero no comparten la misma arquitectura ni objetivo. La comparativa se limita a la tabla de resultados con distintos K, que es la única referencia reportada.

## Limitaciones y advertencias

- Entrenado con solo 60 millones de tokens y 10 millones de parámetros; no es un modelo útil para tareas reales de lenguaje.
- No ha sido ajustado con instrucciones ni con RLHF, por lo que no sigue comandos ni produce respuestas coherentes en conversación.
- Solo soporta inglés; no hay capacidad multilingüe.
- La perplejidad reportada es dependiente del tokenizador; la métrica comparable es *bits-per-byte*.
- El bloque looped satura: aplicar más de la profundidad óptima (K=1) empeora la pérdida. Esto es un hallazgo medido, no una hipótesis.
- No se realizó un filtrado de seguridad más allá del que tiene FineWeb; el modelo puede generar contenido sesgado o inapropiado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es adecuado para producción dado su bajo rendimiento.
- No hay garantía de soporte o mantenimiento por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/brkdrd/simloop
- Repositorio GitHub: https://github.com/brkdrd/SimLoop
- Perfil del autor en GitHub: https://github.com/brkdrd/
