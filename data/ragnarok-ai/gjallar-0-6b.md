# ragnarok-ai/gjallar-0.6b

## Resumen

Gjallar 0.6B es un modelo juez especializado en la detección de alucinaciones y la verificación de fidelidad (faithfulness) en sistemas RAG (Retrieval-Augmented Generation). Desarrollado por ragnarok-ai, se construye como un adaptador LoRA sobre el modelo base Qwen/Qwen3-0.6B y se entrena para evaluar si un contexto dado respalda una oración concreta, devolviendo la probabilidad de que la oración esté soportada, no soportada o contradicha por el contexto.

El modelo resuelve un problema concreto: determinar automáticamente si una afirmación generada por un LLM está fundamentada en las fuentes recuperadas. En lugar de generar texto, realiza una única pasada forward por oración y produce una puntuación de soporte, lo que lo convierte en un componente de evaluación ligero y determinista para pipelines de RAG. Es relevante porque ofrece una alternativa de código abierto (licencia Apache 2.0) a jueces propietarios como HHEM-2.1-Open, con resultados comparables o superiores en varios conjuntos de datos.

Con solo 0.6B parámetros, el modelo está diseñado para ejecutarse en Apple Silicon mediante MLX, con un consumo de memoria máximo medido de 2.68 GB y una latencia mediana de 0.302 s por llamada. Su ventana de contexto operativa es de 4096 tokens, truncando el contexto por el final si se excede.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptadores LoRA |
| Parametros totales | 0.6B (modelo base) + adaptadores LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (el contexto se trunca por el final; la oración se mantiene completa) |
| Tipos de cuantizacion | no disponible (el autor usa bfloat16 en MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptadores LoRA para MLX (librería mlx); modelo base Qwen3-0.6B descargado en su revisión fijada |

## Arquitectura y entrenamiento

Gjallar 0.6B es un adaptador LoRA entrenado sobre Qwen/Qwen3-0.6B, un transformer decoder-only de 0.6B parámetros. El adaptador se mantiene separado del modelo base y se carga junto a él en tiempo de inferencia. El entrenamiento se realizó sobre el conjunto de datos RAGTruth, orientado a la detección de alucinaciones en tareas de resumen y generación aumentada por recuperación.

La innovación principal no reside en la arquitectura sino en el protocolo de evaluación: el autor congeló un documento de objetivos (`TARGETS.md`) antes de cualquier entrenamiento, definiendo pruebas de superioridad y no inferioridad frente a HHEM-2.1-Open. El modelo realiza una única pasada forward por oración sin generar texto, lo que permite un coste computacional bajo y determinista. La integridad de los artefactos se verifica mediante SHA-256 del adaptador y la revisión fijada del modelo base.

## Capacidades

- Evaluación de fidelidad: dado un contexto y una oración, devuelve P(Supported), junto con las probabilidades de Unsupported y Contradicted.
- Detección de alucinaciones: marca (`flagged`) cuando P(Supported) cae por debajo de un umbral configurable.
- Verificación de hechos en pipelines RAG: evalúa si la respuesta generada está respaldada por los documentos recuperados.
- Procesamiento oración a oración: el usuario debe segmentar la respuesta en oraciones; el modelo evalúa una por llamada.
- Inferencia sin generación: una sola pasada forward, sin decodificación autoregresiva.
- Soporte de contexto largo: hasta 4096 tokens, truncando el contexto por el final y preservando la oración completa.
- Metadatos de diagnóstico: devuelve la longitud del prompt en tokens y si el contexto fue truncado.
- Interfaz de línea de comandos y API Python (`score`).
- No soporta tool calling, agentes, visión ni audio según la información disponible.

## Casos de uso

- Verificación de respuestas en sistemas RAG: tras generar una respuesta a partir de documentos recuperados, se segmenta en oraciones y se evalúa cada una con Gjallar para detectar afirmaciones no respaldadas por el contexto, permitiendo filtrar o marcar respuestas antes de mostrarlas al usuario.
- Control de calidad en pipelines de resumen: en la generación de resúmenes automáticos de documentos largos, el modelo comprueba que cada oración del resumen esté fundamentada en el texto fuente, reduciendo el riesgo de alucinaciones en entornos editoriales o legales.
- Evaluación offline de modelos generativos: como juez automático en la evaluación de sistemas LLM, midiendo la tasa de fidelidad de las respuestas generadas frente a las fuentes, con la ventaja de ser determinista y de bajo coste (0.302 s por llamada).
- Moderación de contenido factual en atención al cliente: en asistentes virtuales que responden con base en una base de conocimiento, Gjallar puede marcar respuestas no soportadas antes de enviarlas, activando una revisión humana o una respuesta de fallback.
- Investigación en detección de alucinaciones: como baseline reproducible y de código abierto para comparar con otros jueces (HHEM, MiniCheck) en conjuntos como RAGTruth, WiCE, REVEAL, ClaimVerify, FactCheck-GPT y ExpertQA.
- Filtrado de datos de entrenamiento: para curar datasets de instrucciones o pares pregunta-respuesta, verificando que las respuestas estén respaldadas por el contexto de origen y descartando las no soportadas.
- Despliegue en entornos con recursos limitados: al requerir solo 2.68 GB de memoria pico y ejecutarse en Apple Silicon con MLX, es adecuado para estaciones de trabajo locales o portátiles sin GPU dedicada de gran tamaño.

## Benchmarks y rendimiento

Resultados en el conjunto de test de RAGTruth, con especificidad fijada en 0.9600 para cada juez:

| Metrica | Gjallar (RJ) | HHEM-2.1-Open | MiniCheck |
|---|---|---|---|
| Recall CONTRADICTED (139) | 0.2302 [0.1481, 0.3333] | 0.1583 [0.0976, 0.2222] | 0.2230 [0.1366, 0.2917] |
| Recall UNSUPPORTED (469) | 0.6951 [0.6163, 0.7717] | 0.6098 [0.5277, 0.6795] | 0.5629 [0.4900, 0.6301] |
| AUC ROC (sin umbral) | 0.8889 [0.8621, 0.9118] | 0.8615 [0.8382, 0.8823] | 0.8532 [0.8161, 0.8817] |

AUC ROC fuera de dominio (8424 entradas):

| Dataset | Gjallar (RJ) | HHEM-2.1-Open | MiniCheck |
|---|---|---|---|
| WiCE | 0.8795 [0.8420, 0.9131] | 0.8322 [0.7874, 0.8746] | 0.8364 [0.7898, 0.8779] |
| REVEAL | 0.9500 [0.9386, 0.9601] | 0.9384 [0.9261, 0.9498] | 0.9373 [0.9252, 0.9485] |
| ClaimVerify | 0.8287 [0.8004, 0.8557] | 0.8262 [0.7933, 0.8566] | 0.8084 [0.7771, 0.8394] |
| FactCheck-GPT | 0.8501 [0.8272, 0.8722] | 0.8049 [0.7786, 0.8307] | 0.8412 [0.8185, 0.8635] |
| ExpertQA | 0.6140 [0.5900, 0.6383] | 0.5981 [0.5743, 0.6222] | 0.6177 [0.5944, 0.6415] |
| Media de los cinco | 0.8245 [0.8129, 0.8355] | 0.8000 [0.7868, 0.8128] | 0.8082 [0.7954, 0.8209] |

Conclusiones del protocolo congelado:

| Objetivo | Resultado | p (unilateral) | Nivel | Veredicto |
|---|---|---|---|---|
| P1: recall en contradicciones a especificidad 0.96 (superioridad) | +0.0719 [-0.0063, +0.1704] | 0.0394 | 0.025 (Holm, segundo) | no cumplido |
| P2: recall en no soportadas a especificidad 0.96 (no inferioridad) | +0.0853 [+0.0434, +0.1477] | 0.0001 | 0.0125 (Holm, primero) | cumplido |
| Fuera de dominio: AUC ROC medio (no inferioridad) | +0.0245 [+0.0142, +0.0351] | 0.0001 | 0.025 | cumplido |
| Coste: latencia mediana por llamada | 0.302 s | — | < 1 s | cumplido |
| Coste: memoria pico | 2.68 GB | — | < 3 GB | cumplido |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 2.68 GB de memoria pico medida en bfloat16 sobre MLX, con adaptadores separados y una oración por llamada (739 oraciones evaluadas).
- GPU recomendadas: el autor especifica Apple Silicon con MLX como plataforma de ejecución. No se documentan GPUs NVIDIA en la información disponible.
- Compatibilidad con GPU de consumo: no disponible para NVIDIA; requiere Apple Silicon según la model card.
- Opciones de despliegue: MLX (mlx==0.32.4, mlx-lm==0.32.2, transformers==5.22.2) y descarga vía `hf download`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 0.302 s por llamada (una oración por llamada). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC ROC RAGTruth | AUC ROC medio fuera de dominio | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Gjallar 0.6B | 0.6B + LoRA | 4096 | 0.8889 | 0.8245 | Apache 2.0 | MLX (Apple Silicon) |
| HHEM-2.1-Open | no disponible | no disponible | 0.8615 | 0.8000 | no disponible | no disponible |
| MiniCheck (Flan-T5-Large) | no disponible | no disponible | 0.8532 | 0.8082 | no disponible | no disponible |

Gjallar supera a HHEM-2.1-Open y MiniCheck en AUC ROC tanto en RAGTruth como en la media fuera de dominio, y cumple los objetivos de no inferioridad en oraciones no soportadas y fuera de dominio. Sin embargo, no demuestra superioridad en la detección de contradicciones (P1 no cumplido).

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés; no se garantiza su comportamiento en otros idiomas.
- Evaluación única: los resultados provienen de una sola evaluación realizada el 2026-11-15; no hay validación independiente ni réplicas.
- Sin superioridad en contradicciones: el protocolo no demuestra ganancia frente a HHEM en la detección de oraciones contradichas (P1 no cumplido, intervalo cruza cero).
- Reparto Unsupported/Contradicted no evaluado: la distinción entre ambas probabilidades no fue validada; se recomienda usar `p_supported` como métrica principal.
- Dependencia de Apple Silicon y MLX: no hay soporte documentado para CUDA, vLLM, llama.cpp u Ollama, lo que limita el despliegue en servidores NVIDIA.
- Segmentación manual: el modelo evalúa una oración por llamada; el usuario debe segmentar la respuesta, lo que añade complejidad y coste proporcional al número de oraciones.
- Truncado de contexto: si el contexto supera 4096 tokens, se trunca por el final, lo que puede eliminar evidencia relevante y afectar a la evaluación.
- Riesgo de alucinación del propio juez: como todo modelo de lenguaje, puede producir puntuaciones erróneas, especialmente en dominios alejados de RAGTruth (ExpertQA muestra el AUC ROC más bajo, 0.6140).
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-0.6B tiene su propia licencia que debe verificarse por separado.
- Sin datos de sesgo: no se documentan análisis de sesgos en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ragnarok-ai/gjallar-0.6b
- Repositorio RAGnarok Judge: https://github.com/2501Pr0ject/RAGnarok-Judge
- Resultados completos: https://github.com/2501Pr0ject/RAGnarok-Judge/blob/results-v1/results/RESULTS.md
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- MiniCheck (referencia): https://huggingface.co/lytang/MiniCheck-Flan-T5-Large
