# BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0

## Resumen

`novelty-es-qwen2.5-0.5b-reward-only-seed0` es un ajuste fino de investigación sobre Qwen2.5-0.5B-Instruct, desarrollado por el usuario BurnyCoder dentro de un experimento sobre estrategias evolutivas (evolution strategies, ES) aplicadas al entrenamiento de modelos de lenguaje. El modelo forma parte de un piloto denominado "Novelty ES" que compara dos variantes de entrenamiento: una con búsqueda de novedad (main) y otra únicamente guiada por recompensa (reward_only), siendo este checkpoint la rama de control.

El problema que aborda es acotado y específico: la resolución de problemas aritméticos del tipo "countdown", donde el modelo debe construir una expresión matemática legal con unos números dados para alcanzar un objetivo. No se trata de un modelo de propósito general mejorado, sino de una adaptación orientada exclusivamente a esa tarea, con evidencia explícita de que no hay mejoras en lenguaje general.

Es relevante ahora como artefacto de reproducibilidad científica: publica métricas con intervalos de confianza, auditoría independiente y mediciones crudas inmutables. La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 494 millones de parámetros, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct (revisión base `7ae557604adf67be50417f59c2c2f167def9a775`), un transformer decoder-only de 494 millones de parámetros. Sobre esa base se aplica un ajuste fino mediante estrategias evolutivas (evolution strategies), un método de optimización sin gradientes que explora el espacio de parámetros mediante perturbaciones y selección por recompensa. En esta rama concreta (`reward_only`), la señal de entrenamiento es únicamente la recompensa de la tarea, sin componente de novedad.

El entrenamiento se centra en problemas de countdown aritmético, con conjuntos de prueba de tres, cuatro y cinco números. La model card documenta que el verificador histórico acepta sintaxis restringida de expresiones Python, ya sea desnuda o dentro de un bloque de respuesta completo, e ignora prosa circundante y delimitadores no emparejados. Se reporta una penalización de repetición de 1.1 en ambas rutas de decodificación. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Resolución de problemas aritméticos de countdown: construcción de expresiones legales con números dados para alcanzar un objetivo.
- Generación de expresiones en sintaxis Python restringida, aceptadas por el verificador histórico.
- Capacidad de producir respuestas en formato de bloque de respuesta completo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen2.5 soporta múltiples idiomas, pero este ajuste no documenta comportamiento multilingüe).

## Casos de uso

- Investigación en optimización sin gradientes: servir como checkpoint de control en experimentos que comparan estrategias evolutivas con y sin búsqueda de novedad, permitiendo replicar la comparación main-versus-control documentada.
- Reproducibilidad científica: utilizar el modelo junto con las mediciones crudas inmutables y la auditoría independiente para verificar los resultados publicados del piloto.
- Estudio de transferencia de tareas: analizar por qué la mejora de legalidad de expresiones no se transfiere uniformemente entre problemas de tres, cuatro y cinco números, comparando el checkpoint con el modelo original.
- Evaluación de decodificación greedy frente a muestreada: el modelo permite medir pass@1 y pass@8 sobre el subconjunto fijo de test original, útil para estudiar la diversidad de salidas en modelos pequeños.
- Docencia y divulgación sobre ES: ilustrar cómo se entrena un modelo de lenguaje mediante perturbaciones y recompensa, con métricas e intervalos de confianza publicados.
- Análisis de validez de expresiones: emplear el modelo para generar expresiones candidatas en problemas aritméticos y estudiar la tasa de legalidad según el número de operandos.
- No se recomienda su uso en producción de atención al cliente, generación de código general ni tareas de razonamiento abierto, dado que la propia model card indica que es una adaptación aritmética solo para investigación sin evidencia de mejoras generales de lenguaje.

## Benchmarks y rendimiento

| Condicion | Test greedy accuracy | Intervalo 95% | Hard greedy accuracy | Original-test pass@1 | Original-test pass@8 | Estado |
|---|---|---|---|---|---|---|
| original | 0.29% | 0.10% - 0.54% | 0.10% | 0.12% | 0.89% | complete |
| main | 1.12% | 0.68% - 1.61% | 0.00% | 0.27% | 2.06% | complete |
| reward_only | 1.12% | 0.68% - 1.61% | 0.10% | 0.22% | 1.67% | complete |

La model card indica que la hipótesis de mejora direccional no se sostuvo en esta semilla: la precisión principal no superó a reward-only ES y el intervalo pareado incluye cero, por lo que no se establece una diferencia de rendimiento. Ambos checkpoints entrenados superan al modelo original en este conjunto de test. En el análisis post-hoc, el checkpoint de novedad resolvió 3 problemas y el de control 3, con un valor p exacto bilateral de McNemar de 1. La diferencia de balanced-tag en las salidas finales es de +0.000 puntos porcentuales (intervalo pareado del 95%: -0.244 a +0.244).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 494 millones de parámetros, en fp16 rondaría 1 GB de pesos y en cuantizaciones de 8 o 4 bits sería inferior, pero no se documentan cuantizaciones en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no se confirma en la documentación.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints_compatible. No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en countdown | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novelty-es-qwen2.5-0.5b-reward-only-seed0 | 494.032.768 | no disponible | 1.12% greedy (test), 0.22% pass@1 | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct (original) | ~494 M | no disponible | 0.29% greedy (test), 0.12% pass@1 | apache-2.0 | Hugging Face |
| novelty-es main (misma familia) | ~494 M | no disponible | 1.12% greedy (test), 0.27% pass@1 | apache-2.0 | Hugging Face (referenciado en la model card) |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Adaptación aritmética solo para investigación: la model card afirma explícitamente que no hay evidencia de mejoras generales de lenguaje.
- La hipótesis de mejora direccional no se sostuvo en esta semilla; el intervalo pareado incluye cero, por lo que no se establece diferencia frente a reward-only.
- Los intervalos excluyen la variabilidad entre semillas de entrenamiento.
- La validez de expresiones empeora en problemas de cinco números respecto al modelo original, por lo que la mejora no se transfiere uniformemente.
- El verificador histórico es permisivo: acepta expresiones desnudas o en un bloque de respuesta e ignora prosa y delimitadores no emparejados, lo que puede inflar la tasa de acierto aparente.
- El scorer histórico aceptaba un bloque de respuesta completo aun con un delimitador extra; aplicar la lectura balanced-tag cambia 9 recompensas del brazo de novedad y 11 del brazo de control en esta etapa, aunque no cambia la elegibilidad de novedad en las sondas fijas.
- MiniLM trunca las cadenas de respuesta a 256 tokens WordPiece, lo que limita la evaluación semántica de respuestas largas.
- Las horas de pared de las fases incluyen sobrecarga y no son medidas de horas de cómputo de GPU; el tiempo de control excluye paradas offline y una cola de interrupción no registrada de duración desconocida.
- Los checkpoints medidos reflejan las recompensas históricas; los resultados de entrenar con balanced tags son desconocidos.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, aunque son esperables en un modelo base de 0.5B.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor restringe el propósito a investigación y no recomienda uso en producción general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del proyecto (preregistro, código, procedencia y limitaciones): https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Auditoría científica independiente y evidencia a nivel de fila: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training/blob/main/reports/reviews/scientific-audit-2026-11-26.md
- Mediciones crudas inmutables: https://huggingface.co/datasets/BurnyCoder/novelty-es-pilot-artifacts/tree/949e2dcb385bc2b7088c40444ef879b76596317d
- Configuración de decodificación fijada: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/7ae557604adf67be50417f59c2c2f167def9a775/generation_config.json
- Configuración de MiniLM (límite de 256 tokens): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/1110a243fdf4706b3f48f1d95db1a4f5529b4d41/sentence_bert_config.json
- Referencia de sintaxis de expresiones Python: https://docs.python.org/3.12/reference/expressions.html
