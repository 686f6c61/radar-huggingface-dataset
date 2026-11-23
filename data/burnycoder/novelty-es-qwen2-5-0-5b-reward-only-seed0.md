# BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0

## Resumen
El modelo `BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0` es un ajuste fino de investigación sobre `Qwen/Qwen2.5-0.5B-Instruct`, publicado por el usuario BurnyCoder. Se trata de una adaptación aritmética orientada a la tarea Countdown, en la que el modelo debe construir expresiones legales con números dados para alcanzar un objetivo. El checkpoint corresponde a la condición de control "reward_only" de un experimento más amplio sobre estrategias evolutivas y búsqueda de novedad.

El modelo no busca mejorar capacidades generales de lenguaje, sino servir como evidencia empírica en un estudio preregistrado sobre si la novedad (novelty search) aporta una ventaja direccional frente al entrenamiento guiado solo por recompensa. La model card indica explícitamente que la hipótesis de mejora direccional no se sostuvo en esta semilla: la precisión principal no superó la condición reward-only, y el intervalo emparejado incluye cero.

Es relevante ahora como artefacto reproducible de investigación: pesos, métricas crudas y correcciones independientes están enlazados públicamente. No debe interpretarse como un modelo de propósito general ni como una mejora del modelo base en lenguaje o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 494 millones de parámetros. El ajuste se realizó mediante estrategias evolutivas (evolution-strategies), no mediante RLHF o DPO clásicos, sobre la tarea Countdown. El checkpoint aquí descrito es la condición "reward_only", es decir, entrenamiento guiado únicamente por recompensa, sin el componente de novedad que caracteriza la condición "main" del estudio.

La model card documenta detalles metodológicos relevantes: las evaluaciones usan una respuesta greedy por problema; la partición "hard" corresponde a problemas con cinco números; pass@1 y pass@8 se calculan sobre un subconjunto fijo del test original; las horas de pared incluyen sobrecarga y no son medidas de horas de GPU; y el verificador acepta sintaxis restringida de expresiones Python, desnudas o dentro de una etiqueta de respuesta, ignorando el texto circundante cuando hay una etiqueta. El modelo MiniLM usado en el pipeline trunca las respuestas a 256 tokens WordPiece. Las métricas están condicionadas a una semilla de entrenamiento y excluyen la variabilidad entre semillas.

## Capacidades
- Generación de expresiones aritméticas legales para la tarea Countdown (construir una expresión con los números dados para alcanzar un objetivo).
- Producción de respuestas en formato de etiqueta de respuesta compatible con el verificador del estudio.
- Generación de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct, aunque sin evidencia de mejora general.
- No hay evidencia de mejoras en lenguaje general, razonamiento general, código, matemáticas fuera de Countdown, tool calling, agentes, visión, audio o modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Reproducción de experimentos de investigación: usar el checkpoint como condición de control reward-only para replicar la tabla de precisión greedy y pass@k del estudio, comparándolo con la condición "main" y con el modelo original.
- Auditoría de metodología evolutiva: analizar cómo las estrategias evolutivas afectan la legalidad de expresiones en problemas de tres, cuatro y cinco números, dado que la model card reporta diferencias de validez entre particiones.
- Evaluación de verificadores aritméticos: probar el parser restringido de expresiones Python y la lógica de etiquetas de respuesta en pipelines propios.
- Estudio de transferencia limitada: examinar por qué la mejora de validez no se transfiere uniformemente a los problemas de cinco números, comparando este checkpoint con el original.
- Docencia e ilustración de intervalos de confianza: usar los intervalos reportados (0,68%-1,61% para main y reward_only) para enseñar interpretación de resultados con incertidumbre y variabilidad de semilla.
- Base para experimentos de bajo coste: al tener ~494M parámetros y pesos safetensors, permite iterar rápidamente en entornos de investigación con recursos modestos, siempre dentro del alcance aritmético declarado.

## Benchmarks y rendimiento

| Condición | Precisión greedy en test | Intervalo 95% | Precisión greedy hard | pass@1 test original | pass@8 test original | Estado |
|---|---|---|---|---|---|---|
| original | 0,29% | 0,10% - 0,54% | 0,10% | 0,12% | 0,89% | completo |
| main | 1,12% | 0,68% - 1,61% | 0,00% | 0,27% | 2,06% | completo |
| reward_only | 1,12% | 0,68% - 1,61% | 0,10% | 0,22% | 1,67% | completo |

La model card señala que ambos checkpoints entrenados superan al modelo original en este conjunto de test, que ambos producen más expresiones legales en problemas de tres y cuatro números, y que ambos tienen menor validez de expresión en problemas de cinco números que el modelo original. La comparación main frente a control determina si la novedad aporta beneficio; en esta semilla, el intervalo emparejado incluye cero, por lo que no se establece diferencia de rendimiento.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~494M parámetros, los requisitos serían moderados, pero no hay cifras publicadas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la model card y las etiquetas indican compatibilidad con transformers y text-generation-inference (endpoints_compatible); no se detallan vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Countdown | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novelty-es-qwen2.5-0.5b-reward-only-seed0 | 494.032.768 | no disponible | 1,12% greedy test; pass@1 0,22%; pass@8 1,67% | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (original) | ~0,5B | no disponible en la información proporcionada | 0,29% greedy test; pass@1 0,12%; pass@8 0,89% | apache-2.0 | Hugging Face |
| Condición "main" del mismo estudio | ~0,5B | no disponible | 1,12% greedy test; pass@1 0,27%; pass@8 2,06% | apache-2.0 | Hugging Face (referenciado en la model card) |

No se dispone de comparaciones con otros modelos de la misma categoría fuera del estudio.

## Limitaciones y advertencias
- Adaptación aritmética de solo investigación; no hay evidencia de mejoras generales de lenguaje.
- La hipótesis de mejora direccional no se sostuvo en esta semilla; el intervalo emparejado incluye cero.
- Las métricas están condicionadas a una semilla de entrenamiento y excluyen la variabilidad entre semillas.
- La mejora de validez no se transfiere uniformemente: menor validez en problemas de cinco números que el modelo original.
- Los tensores de generación cero y la trayectoria histórica completa de embeddings/archivo no están disponibles.
- Los veredictos de auditoría antiguos se conservan como registros históricos, no como prueba independiente.
- El verificador acepta solo sintaxis restringida de expresiones Python y una única etiqueta de respuesta; el texto circundante se ignora.
- MiniLM trunca las respuestas a 256 tokens WordPiece, lo que puede afectar evaluaciones basadas en embeddings.
- Las horas de pared incluyen sobrecarga y no son horas de GPU; en la continuación cubren solo trabajo añadido y el tiempo de control excluye paradas offline y una cola de caída no registrada.
- Licencia apache-2.0 permite uso comercial, pero el modelo está declarado como adaptación aritmética de investigación; no debe presentarse como modelo generalista.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada.

## Enlaces
- Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Artefactos crudos del piloto: https://huggingface.co/datasets/BurnyCoder/novelty-es-pilot-artifacts/tree/949e2dcb385bc2b7088c40444ef879b76596317d
- Repositorio del estudio: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Revisiones predecesoras: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training/blob/cf0a402/reports/publication.json
- Correcciones independientes y lagunas de evidencia: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training/blob/main/reports/independent-corrections-2026-11-12.md
- MiniLM (configuración de truncado): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/1110a243fdf4706b3f48f1d95db1a4f5529b4d41/sentence_bert_config.json
- Sintaxis de expresiones Python: https://docs.python.org/3.12/reference/expressions.html
