# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6

## Resumen

K2-L8-R6-CODE es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de la familia "semsimula", una línea de modelos conservativos (energy-based) que sustituyen la atención por una dinámica de flujo de segundo orden amortiguado sobre un potencial escalar aprendido. Este checkpoint concreto forma parte del estudio "ladder" sobre código Python, en el que se mantiene fijo el tiempo total de integración T = L · Δt = 8 y se reparte en más pasos de menor duración, con el objetivo de medir si la profundidad efectiva ayuda frente a un GPT-2 emparejado en parámetros fuera de los embeddings.

El modelo tiene 8 capas, dos "pozos" (wells) en el banco de potencial V_θ y actualizaciones de precisión a rango 6 en lugar de 4, con 53.115.091 parámetros totales (14,5 M fuera de los embeddings, frente a los 14,2 M del GPT-2 emparejado). Entrena sobre CodeParrot con un presupuesto exacto de 315.392.000 tokens y alcanza una perplejidad de validación asentada de 5,54, lo que supone una mejora del 2,2% respecto a la variante de rango 4 y deja al modelo un 11,8% por detrás del GPT-2 emparejado.

Su relevancia es fundamentalmente metodológica: es un experimento pre-registrado de ablación de mecanismo que compara variantes con presupuesto de tokens idéntico y evaluaciones emparejadas paso a paso, y explora una arquitectura sin atención con memoria constante en inferencia. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención; modelo de lenguaje conservativo con potencial escalar aprendido y flujo de segundo orden amortiguado (BAOAB, potencial gaussiano anisotrópico, espacio de Fock) |
| Parametros totales | 53.115.091 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la generación 3 de la familia semsimula y se describe como "fully-conservative": cada capa avanza los estados de los tokens un paso Δt de un flujo de segundo orden amortiguado en un potencial escalar aprendido V_θ. El integrador es BAOAB con un potencial gaussiano anisotrópico y actualizaciones de precisión por pozo, lo que introduce una interpretación geométrica riemanniana (geodésicas, métrica de Jacobi). La arquitectura es explícitamente no-transformer y sin atención, con memoria constante en inferencia, y el estudio se enmarca en un formalismo de espacio de Fock con dos pozos ("wells") en el banco de potencial. En esta variante cada pozo actualiza su precisión a rango 6 en lugar de 4, lo que añade 2.950.656 parámetros respecto a K2-L8-CODE.

El entrenamiento usa exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean (Python), con un schedule WSD a lo largo de 16.250 pasos seguido de 3.000 pasos a la tasa de aprendizaje mínima, desde el paso 0 con semilla 0 y sobre los mismos batches que las variantes SO-CODE, L4-CODE, L8-CODE y K2-L8-CODE, de modo que las evaluaciones son emparejadas paso a paso. La ejecución duró 19,5 horas en una sesión (3,65 s por paso), con pico de memoria de 37,1 GB en entrenamiento y 55,4 GB en evaluación, sin normas de gradiente no finitas en los 385 pasos registrados y con el monitor de fuga SCAF limpio en las 4 auditorías. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto autorregresiva en inglés, orientada experimentalmente a código Python.
- Modelado de lenguaje con perplejidad medida sobre CodeParrot clean (validación).
- Inferencia con memoria constante gracias a la ausencia de atención.
- Participación multi-direccional en las actualizaciones de precisión: el ratio de participación medido es 4,87 de 6 direcciones, lo que indica uso efectivo de las seis direcciones.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; la model card solo declara inglés.

## Casos de uso

- Investigación en arquitecturas sin atención: sirve como punto de comparación controlado frente a variantes de 2, 4 y 8 capas y frente a GPT-2 emparejado en parámetros fuera de los embeddings, con evaluaciones emparejadas paso a paso.
- Ablación de mecanismo pre-registrada: el checkpoint materializa una predicción concreta (R6-1: el rango 6 ayuda) y permite reproducir el análisis de diferencias emparejadas en log-perplejidad sobre los pasos 16.000–19.000.
- Estudio de modelos de lenguaje conservativos: útil para examinar cómo un potencial escalar aprendido y un integrador BAOAB distribuyen el presupuesto de integración en pasos más cortos.
- Análisis de eficiencia de parámetros: con 14,5 M de parámetros fuera de los embeddings recupera el 41% de la ganancia de la variante de ocho pozos con un noveno de sus parámetros, lo que lo hace adecuado para estudiar rendimientos decrecientes.
- Reproducibilidad de entrenamiento: el registro de salud de la ejecución (normas de gradiente, picos de memoria, auditorías SCAF) permite validar pipelines de entrenamiento de modelos de investigación.
- Docencia y divulgación: ejemplo concreto de modelo energy-based con geometría riemanniana aplicado a código, con métricas y decisiones de diseño documentadas.

## Benchmarks y rendimiento

| Modelo | Capas | Pozos | Rango | Parámetros | Perplejidad asentada | Frente a K2-L8-CODE |
|---|---:|---:|---:|---:|---:|---:|
| SO-CODE | 2 | 8 | 4 | 76.572.109 | 6,00 | +5,8% |
| L4-CODE | 4 | 8 | 4 | 76.625.361 | 5,48 | −3,2% |
| L8-CODE | 8 | 8 | 4 | 76.731.865 | 5,35 | −5,5% |
| K2-L8-CODE | 8 | 2 | 4 | 50.164.435 | 5,67 | — |
| K2-L8-R6-CODE (este modelo) | 8 | 2 | 6 | 53.115.091 | 5,54 | −2,2% |
| GPT-2 emparejado (no en el Hub) | 8 | — | — | — | 4,96 | −12,5% |

La perplejidad de validación se mide en bloque de 512 sobre los primeros 2 M de tokens de los ficheros de validación de CodeParrot (split a nivel de fichero). El valor asentado de 5,54 es la media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,44, 5,55 y 5,64); el mejor valor es 5,44 en el paso 18.000. La model card indica que estos resultados no están verificados (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,2 GB.
- VRAM en entrenamiento: pico de 37,1 GB; en evaluación, 55,4 GB.
- GPU recomendadas: no se especifican modelos concretos; los picos de memoria de entrenamiento y evaluación son compatibles con GPU de 40 GB y 80 GB (A100, H100).
- ¿Cabe en GPU de consumo? No disponible; con 53 M de parámetros el peso en FP32 rondaría los 0,2 GB, pero no se documentan requisitos ni formato de inferencia.
- Opciones de despliegue: solo se declara PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el único dato de rendimiento es 3,65 s por paso de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot val, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| K2-L8-R6-CODE | 53.115.091 | No disponible | 5,54 | CC-BY-4.0 | Hugging Face |
| K2-L8-CODE | 50.164.435 | No disponible | 5,67 | No disponible | Hugging Face |
| L8-CODE | 76.731.865 | No disponible | 5,35 | No disponible | Hugging Face |
| GPT-2 emparejado (14,2 M fuera de embeddings) | No disponible | No disponible | 4,96 | No disponible | No en el Hub |

La comparación se limita a las variantes de la misma colección y al GPT-2 emparejado; no se dispone de datos para comparar con modelos de código de propósito general de tamaño similar.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo enmarca explícitamente en un estudio de ablación, no como un modelo listo para producción.
- Calidad limitada: con 5,54 de perplejidad, queda un 11,8% por detrás del GPT-2 emparejado en el mismo corpus y presupuesto.
- Idiomas: solo se declara inglés; no hay evidencia de capacidades multilingües.
- Contexto: entrenado y evaluado con bloques de 512 tokens; no se documenta una ventana de contexto mayor.
- Sesgos y alucinación: no se documentan análisis de sesgo ni evaluaciones de factualidad; al ser un modelo pequeño entrenado solo en código Python, el riesgo de generación incorrecta en texto libre es alto.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la ausencia de garantías y de evaluación de seguridad hace desaconsejable su uso en producción.
- Resultados no verificados: la métrica de perplejidad figura con `verified: false` en el model-index.
- Sin soporte documentado de tool calling, agentes ni cuantización, lo que limita su integración en pipelines estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6
- Variante de rango 4 (K2-L8-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2
- Variante de ocho pozos (L8-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Variante de cuatro capas (L4-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- Variante de dos capas (SO-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección "depth on code" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
