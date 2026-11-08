# MatterWaveAI/grt-mamba

## Resumen

GRT-Mamba (MatterWaveAI/grt-mamba) es un modelo de lenguaje experimental desarrollado por MatterWaveAI que reformula la recurrencia selectiva de los modelos de espacio de estados (SSM) mediante transformaciones ortogonales que preservan la norma (determinante +1). Frente a Mamba y Mamba-2, que mantienen proyecciones densas `nn.Linear` y convoluciones causales `nn.Conv1d`, esta propuesta elimina por completo ambas categorías de capas y sustituye la transición de estado por rotaciones dependientes del contenido. El modelo se presenta a su vez como un "world model" unitario y como un juez de trayectorias de memoria constante (`S1-GRT-Mamba`).

El modelo deriva de un base model denominado `MatterWaveAI/grt-30m` y se publica con aproximadamente 46,1 millones de parámetros almacenados, aunque el autor declara una capacidad equivalente densa de unos 115 millones. La inferencia se plantea con coste y memoria O(1) por token (sin caché KV en modo SSM puro) y entrenamiento mediante un escaneo de prefijo paralelo. Es relevante ahora porque explora una vía alternativa a la atención cuadrática para contextos largos, con garantías numéricas de estabilidad en la recurrencia.

No obstante, conviene subrayar que la model card es una "preview card" inicial: los pesos, la implementación arquitectónica y el código fuente están retenidos durante el ciclo de publicación por fases. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K), solo verificaciones internas del autor sobre un conjunto propietario `XL-smol`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rotational-SSM (state-space model selectivo con transiciones ortogonales, sin capas `nn.Linear` ni convoluciones `1D`/`2D`); modo híbrido SSM + rotational attention |
| Parametros totales | ~46,1 M almacenados; ~115 M de capacidad equivalente densa (según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenamiento e inferencia verificados de T = 128 a 8.192+ tokens; límite máximo no especificado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en la publicación inicial; librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un SSM selectivo puro en el que la transición de estado se implementa como una transformación ortogonal con determinante +1 en cada paso temporal. Esto garantiza que la norma del estado se conserve: el autor reporta una deriva de magnitud inferior a 5,0e-7 en float32 y de 9,55e-15 en float64 tras 8.192 pasos recursivos homogéneos, lo que elimina por construcción el desvanecimiento o la explosión de gradientes. El entrenamiento usa un escaneo de prefijo paralelo que iguala la recurrencia paso a paso con una diferencia absoluta máxima de 3,81e-6. La inferencia en modo SSM puro opera con estado fijo de 3,0 KB y cero bytes de caché KV, con complejidad O(1) por token.

Existe un modo híbrido que combina la recurrencia rotacional con atención rotacional, reduciendo la caché KV un 66,7 % respecto a atención cuadrática. El modelo también se describe como world model latente (`S1-GRT-Mamba`) capaz de evolucionar estados en horizontes de acción de 1 a 10+ saltos sin decodificar tokens intermedios y sin colapso de rango (retención de rango efectivo ≥ 96,0 % sin negativos contrastivos). No se detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo RLHF o DPO; esa información no está disponible.

## Capacidades

- Generación de texto condicionada por la etiqueta `text-generation` del pipeline.
- Recurrencia selectiva de estado con memoria constante por token (O(1) en cómputo y memoria, sin caché KV en modo puro).
- Seguimiento de estado cíclico de largo horizonte: 98,4 % en modo SSM puro y 99,1 % en modo híbrido para T = 64..8.192.
- Recuperación asociativa tipo needle-in-haystack: 25,0 % en SSM puro y 99,2 % en modo híbrido.
- World modeling latente con rollouts multi-paso (H = 1..10+) y recuperación de trayectorias retenidas del 94,80 % Top-1 y 98,20 % pass@2 sobre n = 2.500.
- Función de juez de trayectorias de memoria constante (`S1-GRT-Mamba`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como tal; el world modeling multi-paso es la capacidad más próxima descrita.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Procesamiento de secuencias largas con memoria acotada: el modo SSM puro mantiene un estado fijo de 3,0 KB independientemente de T, lo que permite servir flujos de 8.192+ tokens sin crecimiento de caché KV; adecuado para streaming de texto continuo o logs.
- Modelado de mundo latente para planificación: `S1-GRT-Mamba` evoluciona estados en horizontes de 1 a 10+ saltos sin decodificar tokens intermedios, útil en entornos simulados donde se quiere evaluar trayectorias antes de actuar.
- Evaluación de trayectorias (trajectory judge): el modelo puede puntuar rollouts multi-paso con memoria constante, lo que encaja en pipelines de verificación de agentes o de datos sintéticos.
- Recuperación asociativa en documentos largos: el modo híbrido ofrece 99,2 % de recall needle-in-haystack con un 66,7 % menos de caché KV, aplicable a búsqueda semántica sobre contextos extensos.
- Investigación en arquitecturas alternativas a la atención: sirve como banco de pruebas reproducible para estudiar SSM ortogonales, paridad de escaneo paralelo y estabilidad numérica de la recurrencia.
- Prototipado de generación de texto en entornos con restricciones de VRAM: con ~46,1 M de parámetros almacenados y licencia Apache 2.0, es viable experimentar en GPU de consumo una vez publicados los pesos.
- Seguimiento de estado cíclico en series temporales o señales periódicas: el 98,4 % de tracking en T = 64..8.192 sugiere utilidad en tareas de estado continuo con patrones repetitivos.

## Benchmarks y rendimiento

Los datos disponibles son verificaciones internas del autor sobre el conjunto propietario `XL-smol`, no benchmarks estándar de lenguaje. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Invariante / prueba | Objetivo | Resultado GRT-Mamba | Estado |
|---|---|---|---|
| Capas densas lineales / conv 1D / conv 2D | 0 / 0 / 0 | 0 / 0 / 0 (100 % ortogonal) | PASS |
| Paridad escaneo de prefijo vs. recurrencia O(1) | < 1e-5 | 3,81e-6 | PASS |
| Determinante de la transición de estado selectiva | +1,000000 | +1,000000000000 | PASS |
| Deriva de norma a 8.192 pasos | < 1e-6 | 9,55e-15 f64 / < 5,0e-7 f32 | PASS |
| Retención de rango efectivo (0 negativos) | ≥ 90,0 % | ≥ 96,0 % | PASS |
| Recuperación de trayectoria latente retenida (n = 2.500) | ≥ 90,0 % | 94,80 % Top-1 (98,20 % pass@2) | PASS |

| Capacidad de secuencia | SSM rotacional puro (0 % KV) | GRT-Mamba-Hybrid (-66,7 % KV) |
|---|---|---|
| Tracking de estado cíclico (T = 64..8.192) | 98,4 % | 99,1 % |
| Recall asociativo needle-in-haystack | 25,0 % | 99,2 % |
| Ahorro de memoria KV en inferencia | 100,0 % (0 bytes) | 66,7 % |
| Deriva de norma por paso (8.192 pasos) | < 5,0e-7 | no disponible |

| Longitud T | KV cache atención cuadrática | Caché GRT-Mamba híbrido | Estado GRT-Mamba SSM puro |
|---|---|---|---|
| 128 | 1,0× | 0,33× (-66,7 %) | 0 bytes KV (3,0 KB estado fijo) |
| 512 | 4,0× | 1,33× (-66,7 %) | 0 bytes KV (3,0 KB estado fijo) |
| 2.048 | 16,0× | 5,33× (-66,7 %) | 0 bytes KV (3,0 KB estado fijo) |
| 8.192 | 64,0× (4.096× FLOPs) | 21,33× (-66,7 %) | 0 bytes KV (3,0 KB estado fijo) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~46,1 M de parámetros almacenados, en fp16 el peso ocuparía del orden de 92 MB; en fp32, unos 184 MB (estimación a partir del recuento de parámetros, no confirmada por el autor).
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU de consumo moderna (RTX 3060 en adelante) debería alojar los pesos; el modo híbrido añade caché KV que crece con T.
- ¿Cabe en GPU de consumo? Sí, por el recuento de parámetros; no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: la librería declarada es `transformers` y la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor afirma complejidad O(1) por token y estado fijo de 3,0 KB, pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-Mamba | ~46,1 M almacenados / ~115 M equiv. densa | 128–8.192+ verificado | SSM rotacional ortogonal, 0 capas lineales/conv | Apache 2.0 | Pesos retenidos en la publicación inicial |
| Mamba / Mamba-2 | no disponible en la información | no disponible | SSM selectivo con proyecciones lineales y conv causal | no disponible | no disponible |
| Transformers con atención cuadrática | no disponible | no disponible | Atención softmax con caché KV lineal en T | no disponible | no disponible |

La comparación cuantitativa con Mamba o Mamba-2 no está disponible en la información proporcionada; la model card solo describe diferencias arquitectónicas cualitativas (ausencia de `nn.Linear` y `nn.Conv1d`).

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: el repositorio no permite ejecutar el modelo en el momento de la consulta, pese a la licencia Apache 2.0.
- Resultados de benchmarks limitados a un conjunto propietario `XL-smol`; no hay evaluación en MMLU, HumanEval, GSM8K ni en tareas estándar de lenguaje.
- Recall asociativo bajo en modo SSM puro (25,0 % en needle-in-haystack), lo que limita su uso directo en recuperación de información sin el modo híbrido.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente fuera de la distribución de entrenamiento, que tampoco se detalla.
- Sin información sobre sesgos, alineación, RLHF/DPO ni datos de entrenamiento; no es posible evaluar riesgo de alucinación con evidencia.
- Cero descargas y cero likes: ausencia de validación por parte de la comunidad.
- La cifra de "capacidad equivalente densa" (~115 M) es una afirmación del autor sin verificación independiente.
- Para producción: la retención de pesos y la falta de cifras de latencia/throughput impiden planificar un despliegue real.

## Enlaces

- Hugging Face: https://huggingface.co/MatterWaveAI/grt-mamba
- Modelo relacionado S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Paper, blog, repositorio y demo: no disponibles en la información proporcionada.
