# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6

## Resumen
semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6 es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia semsimula, una línea de trabajo que explora modelos de lenguaje conservativos (energy-based) basados en mecánica lagrangiana en lugar de la atención transformer. El modelo se entrena sobre código Python (CodeParrot clean) y forma parte de un estudio escalonado (ladder study) pre-registrado que mide el efecto de la profundidad, el número de pozos del potencial y el rango de las actualizaciones de precisión sobre la perplejidad de validación.

La arquitectura es deliberadamente no-transformer y sin atención: cada capa avanza el estado de los tokens un paso Δt de un flujo de segundo orden amortiguado en un potencial escalar aprendido, con integración BAOAB y geometría riemanniana. Este modelo concreto tiene 8 capas, 2 pozos en el banco V_θ y rango 6 en las actualizaciones de precisión de cada pozo, con 53.115.091 parámetros totales (14,5M fuera de los embeddings).

Es relevante como pieza de un experimento controlado: el autor mantiene fijo el tiempo total de integración T = L · Δt = 8 y compara variantes con presupuesto de tokens idéntico (315.392.000 tokens), lo que permite aislar el efecto de cada decisión de diseño. No es un modelo pensado para producción, sino para estudiar si los modelos conservativos pueden acercarse a un GPT-2 emparejado en perplejidad sobre código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo con potencial escalar, flujo lagrangiano de segundo orden amortiguado, integrador BAOAB, geometría riemanniana (métrica de Jacobi) |
| Parametros totales | 53.115.091 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloque 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | pytorch (checkpoint PyTorch; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo sustituye la atención por un flujo físico: cada una de las 8 capas avanza el estado de los tokens un paso Δt de un flujo de segundo orden amortiguado en un potencial escalar aprendido V_θ, integrado con el esquema BAOAB. El banco de potenciales contiene 2 pozos con potencial gaussiano anisótropo, y cada pozo actualiza su precisión a rango 6 (frente a rango 4 en la variante K2-L8-CODE). La formulación es totalmente conservativa, con geometría riemanniana y geodésicas de Jacobi, y la inferencia es de memoria constante al no requerir atención. El tiempo total de integración se mantiene fijo en T = L · Δt = 8, repartido en 8 pasos más cortos.

El entrenamiento usa exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean, con un schedule WSD durante 16.250 pasos seguido de 3.000 pasos a la tasa de aprendizaje mínima, desde el paso 0 con semilla 0 y los mismos batches que las variantes SO-CODE, L4-CODE, L8-CODE y K2-L8-CODE, de modo que las evaluaciones quedan emparejadas paso a paso. La ejecución duró 19,5 h en una sesión (3,65 s por paso), con pico de 37,1 GB de memoria en entrenamiento y 55,4 GB en evaluación, sin normas de gradiente no finitas en 385 pasos registrados y con el monitor de fugas SCAF limpio en las 4 auditorías. No se documenta RLHF ni DPO.

## Capacidades
- Generación de texto autoregresiva sobre código Python, con perplejidad de validación de 5,54 a bloque 512.
- Modelado de lenguaje condicionado por un potencial escalar aprendido; no emplea atención ni mecanismos de atención lineal.
- Inferencia de memoria constante (constant-memory inference), propiedad derivada de la ausencia de atención.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (en), según la model card.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo thinking).

## Casos de uso
- Investigación sobre arquitecturas alternativas al transformer: sirve como punto de comparación controlado frente a un GPT-2 emparejado en parámetros fuera de los embeddings (14,5M frente a 14,2M) para medir la brecha de perplejidad en código.
- Estudios de ablación de profundidad: al compartir batches y presupuesto de tokens con las variantes de 2, 4 y 8 capas, permite analizar el efecto de repartir un tiempo de integración fijo en más pasos.
- Experimentos de mecánica lagrangiana aplicada al aprendizaje: el modelo materializa un flujo de segundo orden con integrador BAOAB y potencial gaussiano anisótropo, útil para validar simulaciones físicas en el espacio de estados de tokens.
- Evaluación de eficiencia de memoria en inferencia: su naturaleza sin atención y de memoria constante lo hace adecuado para estudiar despliegues con requisitos de memoria acotada, aunque no se publican cifras de latencia ni throughput.
- Reproducción de estudios pre-registrados: las llamadas R6-1 a R6-5 y sus resultados permiten replicar el protocolo de validación emparejada paso a paso sobre CodeParrot.
- Docencia e investigación sobre modelos energy-based: como ejemplo didáctico de modelo de lenguaje conservativo con geometría riemanniana y geodésicas de Jacobi.

## Benchmarks y rendimiento

| Modelo | Capas | Pozos | Rango | Parámetros | Perplejidad (asentada) | Frente a este modelo |
|---|---:|---:|---:|---:|---:|---:|
| SO-CODE | 2 | 8 | 4 | 76.572.109 | 6,00 | +5,8% |
| L4-CODE | 4 | 8 | 4 | 76.625.361 | 5,48 | −3,2% |
| L8-CODE | 8 | 8 | 4 | 76.731.865 | 5,35 | −5,5% |
| K2-L8-CODE | 8 | 2 | 4 | 50.164.435 | 5,67 | — |
| **K2-L8-R6-CODE (este modelo)** | 8 | 2 | 6 | 53.115.091 | **5,54** | **−2,2%** |
| GPT-2 emparejado (no en el Hub) | 8 | — | — | no disponible | 4,96 | −12,5% |

La perplejidad asentada de este modelo es la media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,44, 5,55 y 5,64); el mejor valor es 5,44 en el paso 18.000. Se mide sobre los primeros 2M tokens de los ficheros de validación de CodeParrot, con split a nivel de fichero. Datos declarados por el autor y no verificados.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB y el entrenamiento alcanzó un pico de 37,1 GB y la evaluación 55,4 GB.
- GPU recomendadas: no disponible; el autor no especifica el hardware empleado.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint (0,2 GB) sugiere que cabría en GPUs de consumo, pero no se confirma.
- Opciones de despliegue: no disponible; la librería declarada es PyTorch y no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; solo se reporta el coste de entrenamiento (3,65 s por paso).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| K2-L8-R6-CODE (este) | 53.115.091 | no disponible (bloque 512) | 5,54 | cc-by-4.0 | Hugging Face |
| K2-L8-CODE | 50.164.435 | no disponible (bloque 512) | 5,67 | cc-by-4.0 | Hugging Face |
| L8-CODE | 76.731.865 | no disponible (bloque 512) | 5,35 | cc-by-4.0 | Hugging Face |
| GPT-2 emparejado (8 capas) | 14,2M fuera de embeddings | no disponible | 4,96 | no disponible | no disponible (no en el Hub) |

## Limitaciones y advertencias
- Modelo de investigación: no está pensado para uso en producción ni para tareas generativas generales.
- Solo inglés y solo código Python; no se declaran capacidades multilingües ni de otro dominio.
- Brecha de rendimiento: queda un 11,8% por detrás del GPT-2 emparejado en perplejidad (5,54 frente a 4,96), según los datos del autor.
- Métricas no verificadas: la perplejidad del model-index figura con `verified: false` y procede del propio autor.
- Riesgo de alucinación: no evaluado; no se publican pruebas de fidelidad, sesgo ni seguridad.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no se ofrecen garantías ni soporte.
- Sin datos de cuantización, latencia ni opciones de despliegue estándar, lo que dificulta su integración en pipelines existentes.
- El contexto máximo no se documenta; las evaluaciones se hacen a bloque 512 y no debe asumirse una ventana mayor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6
- Variante K2-L8-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2
- Variante L8-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Variante L4-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- Variante SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección del estudio de profundidad sobre código: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
