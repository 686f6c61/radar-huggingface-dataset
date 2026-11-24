# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2

## Resumen

El modelo `semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2` es un modelo de lenguaje experimental de tipo *conservative language model* desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de la familia SemSimula. No es un transformer ni utiliza atención: la arquitectura avanza los estados de los tokens mediante un flujo de segundo orden amortiguado sobre un potencial escalar aprendido, con integración tipo BAOAB y métrica de Jacobi (geometría riemanniana). Este ejemplar concreto corresponde al brazo K2 del estudio de ablación *ladder* sobre código Python: ocho capas de profundidad (Δt = 1, tiempo total de integración T = 8 fijo) pero con solo dos pozos en el banco de potencial V_θ, frente a los ocho pozos de la variante L8-CODE.

El problema que aborda es de investigación fundamental: medir si la profundidad o el número de pozos del potencial aporta más capacidad en un modelo generativo sin atención. El modelo se entrena sobre CodeParrot clean (Python) con un presupuesto de tokens emparejado (315.392.000 tokens) y evalúa con perplejidad de validación a bloque 512. Su relevancia actual es metodológica: aporta evidencia cuantitativa, con evaluaciones pareadas paso a paso, sobre el diseño de modelos físicamente informados y de memoria constante en inferencia.

Con 50.164.435 parámetros totales (11,6M fuera de los embeddings), es un modelo pequeño orientado a investigación, no a producción. La licencia CC-BY-4.0 permite uso comercial con atribución, pero su rendimiento (perplejidad 5,67 frente a 4,96 de un GPT-2 emparejado) lo sitúa por detrás de los transformers convencionales de tamaño similar en la tarea de modelado de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conservative language model no transformer, sin atención; flujo de segundo orden amortiguado en potencial escalar aprendido, integrador BAOAB, potencial gaussiano anisotrópico, métrica de Jacobi (geometría riemanniana) |
| Parametros totales | 50.164.435 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado a bloque 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); safetensors no confirmado |
| Profundidad | 8 capas (Δt = 1, T = 8) |
| Pozos del potencial | 2 (banco K2) |
| Dataset de entrenamiento | codeparrot/codeparrot-clean-train (Python) |
| Dataset de evaluacion | codeparrot/codeparrot-clean-valid |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención por un flujo dinámico: cada capa avanza los estados de los tokens un paso Δt de un flujo de segundo orden amortiguado en un potencial escalar aprendido V_θ. La colección mantiene fijo el tiempo total de integración T = L · Δt = 8 y lo reparte en más pasos más cortos al aumentar la profundidad. Este ejemplar usa ocho capas con Δt = 1 y un banco de potencial con solo dos pozos (K2), frente a los ocho pozos de la variante L8-CODE. El integrador es BAOAB, con potencial gaussiano anisotrópico y formulación completamente conservativa sobre variedad riemanniana con métrica de Jacobi. La inferencia es de memoria constante por la ausencia de atención.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean, con el schedule WSD del *ladder* durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima, desde el paso 0 con semilla 0 y los mismos batches que SO-CODE, L4-CODE y L8-CODE, de modo que las evaluaciones son pareadas paso a paso. La ejecución completa duró 19,0 h en una sesión (3,5 s por paso con el checkpoint de fuerza V_φ, que recalcula solo la fuerza de pares en la retropropagación, sin checkpointing de capas), con pico de memoria de 35,0 GB en entrenamiento y 51,6 GB en evaluación. No hubo normas de gradiente no finitas en ningún paso registrado (frente a 34 de 45 en L8-CODE entre los pasos 1.400 y 3.600), la mediana de la norma de gradiente tras el paso 2.000 fue 0,38 y el máximo 2,02. No se registraron activaciones del watchdog y el monitor de fugas SCAF dio CLEAN en las 4 auditorías.

## Capacidades

- Generación de texto autoregresiva en inglés, orientada al modelado de código Python.
- Modelado de lenguaje de código: la perplejidad de validación se mide sobre CodeParrot clean (Python).
- Inferencia de memoria constante gracias a la ausencia de mecanismo de atención.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta *thinking mode*, visión ni audio.
- Multilingüe: no; únicamente inglés según la model card.
- Capacidad de investigación: ablación de mecanismo con evaluaciones pareadas por paso.

## Casos de uso

- Investigación sobre arquitecturas sin atención: el modelo sirve como punto de comparación controlado para estudiar si la profundidad o el número de pozos del potencial aporta más capacidad, con presupuesto de tokens emparejado y evaluaciones pareadas paso a paso.
- Estudio de estabilidad de entrenamiento en modelos físicamente informados: su registro sin gradientes no finitos frente a los 34 de 45 de L8-CODE lo hace útil para analizar la relación entre el número de pozos y la estabilidad numérica.
- Reproducción de experimentos de ablación: al compartir batches, semilla y presupuesto con SO-CODE, L4-CODE y L8-CODE, permite reproducir comparaciones pareadas de perplejidad.
- Docencia y divulgación de mecánica lagrangiana aplicada a modelos de lenguaje: ilustra cómo formular la generación como integración de un flujo amortiguado en un potencial aprendido.
- Pruebas de concepto de inferencia de memoria constante: útil para validar pipelines de despliegue en escenarios con restricciones de memoria, aunque sin datos de latencia publicados.
- Modelado de lenguaje de código a pequeña escala: puede emplearse como base para experimentos de *fine-tuning* en Python con recursos limitados, dado su tamaño de 50M de parámetros.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados):

| Modelo | Capas | Pozos | Parametros | Perplejidad asentada | Diferencia vs L8-CODE |
|---|---:|---:|---:|---:|---:|
| SO-CODE | 2 | 8 | 76.572.109 | 6,00 | +12,0% |
| L4-CODE | 4 | 8 | 76.625.361 | 5,48 | +2,4% |
| L8-CODE | 8 | 8 | 76.731.865 | 5,35 | — |
| K2-L8-CODE (este modelo) | 8 | 2 | 50.164.435 | 5,67 | +5,8% |
| GPT-2 emparejado (no en el Hub) | 8 | — | No disponible | 4,96 | −7,4% |

- Perplejidad de validación a bloque 512 sobre los primeros 2M de tokens de los ficheros de validación de CodeParrot (split a nivel de fichero, sin solapamiento). Valor asentado 5,6667: media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,56, 5,68 y 5,76); mejor valor 5,56 en el paso 18.000.
- Diferencia pareada en log-perplejidad (nats, este modelo menos el otro): frente a L8-CODE, +0,056 (SD 0,002) en los pasos 16.000–19.000; frente a L4-CODE, +0,032 (SD 0,002); frente a SO-CODE, −0,056 (SD 0,003). Es decir, los seis pozos extra valen 0,056 nats a ocho capas, y duplicar de cuatro a ocho capas con ocho pozos vale 0,024 nats.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 50,2M de parámetros, en fp32 los pesos ocupan aproximadamente 0,2 GB, pero no se documentan requisitos de memoria de activaciones ni de integración.
- GPU recomendadas: no disponible. El entrenamiento se realizó con un pico de 35,0 GB y la evaluación con 51,6 GB, lo que sugiere GPUs de clase A100/H100 para esas fases, pero no se especifica el hardware.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos (unos 0,2 GB en fp32) cabría en cualquier GPU consumer, pero la memoria de evaluación de 51,6 GB indica que el pipeline completo excede las GPUs de consumo típicas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo es de librería PyTorch y arquitectura no estándar, por lo que estos motores no lo soportan de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (CodeParrot valid, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| K2-L8-CODE (este) | 50.164.435 | No disponible | 5,67 | CC-BY-4.0 | Hugging Face |
| L8-CODE (misma familia, 8 pozos) | 76.731.865 | No disponible | 5,35 | No disponible en la información | Hugging Face |
| L4-CODE (misma familia) | 76.625.361 | No disponible | 5,48 | No disponible en la información | Hugging Face |
| SO-CODE (misma familia, 2 capas) | 76.572.109 | No disponible | 6,00 | No disponible en la información | Hugging Face |
| GPT-2 emparejado | No disponible | No disponible | 4,96 | No disponible | No en el Hub |

La comparativa con alternativas de la misma categoría (modelos sin atención o energy-based) no está disponible en la información proporcionada. Frente al transformer emparejado, este modelo queda un 7,4% por detrás en perplejidad con un 35% menos de parámetros totales.

## Limitaciones y advertencias

- Rendimiento inferior al transformer emparejado: perplejidad 5,67 frente a 4,96 (−7,4%), pese a la innovación arquitectónica.
- Modelo de investigación: no está pensado para producción; no hay datos de latencia, throughput ni robustez en despliegue.
- Solo inglés y solo código Python en el entrenamiento; no se documenta capacidad multilingüe ni de lenguaje natural general.
- Contexto de evaluación limitado a bloque 512; no se especifica la longitud máxima de contexto soportada.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos: no documentados; el corpus CodeParrot clean puede contener sesgos propios del código de GitHub.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar los términos del dataset CodeParrot subyacente.
- Arquitectura no estándar: sin soporte en motores de inferencia habituales (vLLM, llama.cpp, TGI), lo que complica el despliegue.
- El autor declara los resultados como no verificados (`verified: false`); las cifras provienen de la model card y no de una evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2
- Variante L8-CODE (8 pozos): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Variante L4-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- Variante SO-CODE (2 capas): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección del estudio de profundidad sobre código: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
