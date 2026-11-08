# MatterWaveAI/helmholtz-mamba-1

## Resumen

HELMHOLTZ-Mamba-1 es un modelo de lenguaje experimental desarrollado por MatterWaveAI que reformula la recurrencia de los modelos de espacio de estados selectivos (SSM, al estilo de Mamba y Mamba-2) sobre el grupo ortogonal especial SO(D_h). En lugar de emplear proyecciones densas `nn.Linear`, convoluciones causales `nn.Conv1d` y matrices de decaimiento diagonal, el modelo construye cada transición de estado como una rotación planar de Givens dependiente del contenido, lo que preserva la norma del estado por construcción (autovalores en la circunferencia unidad, determinante +1). Según la model card, esto elimina por diseño el desvanecimiento y la explosión de gradientes en recurrencias largas.

El modelo se presenta también como un world model JEPA recurrente libre de colapso (denominado S1-GRT-Mamba), en el que el estado oculto `h_t` actúa como estado latente evolutivo y permite rollouts de acciones multi-paso en memoria O(1) sin decodificación de tokens. Adicionalmente soporta un modo híbrido que intercala capas de atención rotacional con la recurrencia SSM pura, reduciendo el KV cache un 66,7 % respecto a atención cuadrática.

La relevancia del lanzamiento es fundamentalmente arquitectónica: propone una inferencia con coste O(1) en cómputo y memoria por token (sin KV cache en modo SSM puro) y un entrenamiento paralelizable mediante prefix scan de rotaciones 2x2 con complejidad O(T log T). No obstante, se trata de una tarjeta de vista previa: los pesos y el código fuente no están publicados, y el modelo no dispone de datos de benchmarks de lenguaje estándar (MMLU, HumanEval, GSM8K) ni de especificaciones de tamaño o vocabulario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SSM selectivo rotacional (Rotational-SSM) sobre SO(D_h), sin capas lineales densas ni convoluciones; modo híbrido SSM + atención rotacional |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | evaluado hasta T = 8.192 tokens en los experimentos de la model card; máximo no especificado |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados en esta fase) |

## Arquitectura y entrenamiento

La arquitectura sustituye el bloque Mamba convencional por una recurrencia selectiva ortogonal: `h_t = R(theta_t) h_{t-1} + B_t v_t`, donde `R(theta_t)` pertenece a SO(D_h) y se descompone en rotaciones planares 2x2 de Givens. Al ser ortogonal en cada paso (determinante +1, autovalores con módulo 1), la norma del estado homogéneo se conserva con una deriva inferior a 5,0e-7 tras más de 1.000 pasos recursivos. El entrenamiento se paraleliza mediante un prefix scan asociativo sobre pares (cos θ_t, sin θ_t) con coste O(T log T) y profundidad O(log T), que según la model card coincide con la recurrencia secuencial O(1) con una diferencia absoluta máxima inferior a 1,0e-6.

El modelo incorpora además un modo world model JEPA (S1-GRT-Mamba) en el que el estado oculto recurrente es el estado latente del mundo, con rollouts de acciones de 1 a 10+ pasos en memoria O(1) y retención de rango efectivo igual o superior al 96 % sin negativos contrastivos. El modo híbrido intercala dos capas de atención rotacional entre capas SSM, lo que recupera el recall asociativo exacto (needle-in-a-haystack) manteniendo una reducción del 66,7 % del KV cache. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el vocabulario ni las etapas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto como tarea principal (`pipeline_tag: text-generation`), según la metadata del repositorio.
- Seguimiento de estado continuo en secuencias largas con precisión del 100 % reportada en la model card en modo SSM puro.
- Recall asociativo exacto tipo needle-in-haystack en modo híbrido (100 % reportado).
- World modeling latente: rollouts multi-paso de acciones en el espacio de estado sin decodificar tokens, con retención de rango efectivo ≥ 96 %.
- Inferencia con memoria constante: 3,0 KB de estado fijo y 0 bytes de KV cache en modo SSM puro, independientemente de la longitud de secuencia.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso explícito, visión, audio, modo thinking ni cobertura multilingüe.

## Casos de uso

- Modelado de series temporales y señales continuas: la recurrencia ortogonal preserva la magnitud del estado durante miles de pasos, lo que la hace adecuada para seguimiento de estado en señales largas sin degradación numérica.
- Procesamiento de documentos de contexto largo con memoria acotada: el modo SSM puro mantiene 3,0 KB de estado fijo a T = 8.192, lo que permite desplegar ventanas largas en entornos con VRAM limitada.
- Planificación en entornos simulados (world models): los rollouts latentes de 1 a 10+ pasos en O(1) permiten evaluar trayectorias de acción sin generar tokens, útil en RL basado en modelo y robótica simulada.
- Recuperación exacta en grandes corpus: el modo híbrido con atención rotacional intercalada ofrece recall asociativo exacto con dos tercios menos de KV cache, aplicable a sistemas RAG con requisitos estrictos de memoria.
- Investigación en arquitecturas SSM: sirve como referencia reproducible de estabilidad unitaria (deriva < 5,0e-7 en 1.000 pasos) para comparar frente a Mamba y Mamba-2.
- Prototipado de inferencia en streaming: el coste O(1) por token sin KV cache facilita despliegues de baja latencia sobre secuencias indefinidas, aunque los pesos no están disponibles todavía.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son verificaciones arquitectónicas internas, no benchmarks de lenguaje estándar:

| Invariante / benchmark | Objetivo | Resultado HELMHOLTZ-Mamba-1 | Estado |
|---|---|---|---|
| Capas lineales densas / conv 1D / conv 2D | 0 / 0 / 0 | 0 / 0 / 0 (100 % ortogonal) | PASS |
| Paridad prefix scan 2x2 vs. recurrencia O(1) | < 1e-5 | < 1,0e-6 (coincidencia exacta) | PASS |
| Determinante de la transición selectiva | +1,000000 | +1,000000000000 | PASS |
| Deriva de norma del estado homogéneo (1.000 pasos) | < 1e-6 | < 5,0e-7 | PASS |
| Retención de rango efectivo JEPA sin negativos | ≥ 90,0 % | ≥ 96,0 % | PASS |
| Recuperación de trayectoria latente (Top-1) | 100,0 % | 100,0 % (24/24) | PASS |

| Longitud T | KV cache atención cuadrática | KV cache modo híbrido | Estado modo SSM puro |
|---|---|---|---|
| 128 | 1,0x | 0,33x (-66,7 %) | 0 bytes KV cache (3,0 KB estado fijo) |
| 512 | 4,0x | 1,33x (-66,7 %) | 0 bytes KV cache (3,0 KB estado fijo) |
| 2.048 | 16,0x | 5,33x (-66,7 %) | 0 bytes KV cache (3,0 KB estado fijo) |
| 8.192 | 64,0x (4.096x FLOPs) | 21,33x (-66,7 %) | 0 bytes KV cache (3,0 KB estado fijo) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no publicarse el número de parámetros ni los pesos, no puede calcularse.
- GPU recomendadas: no disponible por la misma razón.
- Viabilidad en GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: la librería declarada es `transformers` y el repositorio está marcado como `endpoints_compatible`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card solo afirma complejidad O(1) en cómputo y memoria por token en modo SSM puro, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HELMHOLTZ-Mamba-1 | Rotational-SSM (SO(D_h)) + modo híbrido | no disponible | evaluado hasta 8.192 | Apache 2.0 | Pesos no publicados (vista previa) |
| Mamba / Mamba-2 | SSM selectivo con proyecciones lineales y conv1d | no disponible en la información | no disponible | no disponible | Públicos (referencia general) |
| Transformers con atención cuadrática | Atención softmax | no disponible en la información | no disponible | no disponible | Públicos |

La comparación cuantitativa con alternativas no está disponible: la model card no incluye métricas de calidad de lenguaje frente a Mamba, Mamba-2 u otros SSM, y las referencias web consultadas solo describen el funcionamiento genérico de Mamba.

## Limitaciones y advertencias

- Los pesos y el código fuente no están publicados: el modelo no es ejecutable ni evaluable externamente en esta fase.
- No existen resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K, perplexidad), por lo que se desconoce su calidad real como generador de texto.
- Se desconoce el número de parámetros, el vocabulario, los idiomas soportados y los datos de entrenamiento.
- Los datos de la model card son verificaciones arquitectónicas internas del autor, no evaluaciones independientes; deben tratarse con cautela.
- Riesgo de alucinación y sesgos: no evaluables sin pesos ni card de datos.
- Aunque la licencia es Apache 2.0, la ausencia de pesos impide cualquier uso en producción actualmente.
- El soporte de tool calling, agentes y contexto multilingüe no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-1
- Referencia general sobre Mamba (GeeksforGeeks): https://www.geeksforgeeks.org/artificial-intelligence/what-is-a-mamba-model/
- Referencia general sobre Mamba (IBM): https://www.ibm.com/think/topics/mamba-model
