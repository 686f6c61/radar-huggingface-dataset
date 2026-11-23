# BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0

## Resumen

Novelty ES pilot: main es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct desarrollado por el usuario BurnyCoder, orientado a un experimento de investigación sobre estrategias evolutivas (evolution strategies, ES) y búsqueda de novedad aplicadas al entrenamiento de modelos de lenguaje. El modelo no busca ser un asistente generalista, sino servir como artefacto reproducible de un estudio empírico sobre si la novedad como señal de recompensa mejora el rendimiento en tareas aritméticas restringidas, concretamente problemas de tipo *countdown* (construir una expresión aritmética válida a partir de un conjunto de números).

El modelo base es Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 494 millones de parámetros. El ajuste se realizó mediante estrategias evolutivas, sin evidencia de mejoras generales en lenguaje según la propia model card. Los resultados publicados muestran una precisión greedy del 1,12 % en el conjunto de test, frente al 0,29 % del modelo original, pero el autor indica explícitamente que la hipótesis de mejora direccional por novedad no se sostiene en esta semilla, ya que la condición "main" no supera a la condición "reward_only".

Es relevante ahora como ejemplo de publicación de artefactos de investigación con trazabilidad de resultados, intervalos de confianza y correcciones documentadas, más que como modelo de producción. Su utilidad práctica es muy limitada fuera del contexto del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct (revisión base `7ae557604adf67be50417f59c2c2f167def9a775`), un transformer decoder-only con atención causal estándar. Sobre esa base se aplicó un proceso de ajuste mediante estrategias evolutivas (evolution strategies) con una variante que incorpora una señal de novedad, comparada contra una condición de control basada únicamente en recompensa (reward-only). El entrenamiento se centró en una tarea de *countdown* aritmético con problemas de tres, cuatro y cinco números, y un verificador que acepta sintaxis de expresiones Python restringidas, ya sea desnuda o dentro de una etiqueta de respuesta.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card menciona métricas de tokens de entrenamiento acumulados y horas de pared por fase, pero no las cuantifica en la información disponible. La innovación técnica destacable es metodológica: el uso de búsqueda de novedad como señal auxiliar en ES, con preregistro, intervalos de confianza y correcciones independientes documentadas. No se describen innovaciones arquitectónicas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- Resolución de problemas aritméticos de tipo *countdown*: construir expresiones válidas con un conjunto de números dados.
- Producción de expresiones legales en sintaxis Python restringida, bare o dentro de una etiqueta de respuesta.
- Soporte de tool calling: no disponible de forma específica en este ajuste (el modelo base lo soporta, pero no hay evidencia de que se conserve).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales: modo de razonamiento extendido, visión o audio no disponibles.

## Casos de uso

- Reproducción de experimentos de investigación: sirve como checkpoint de referencia para replicar el estudio de estrategias evolutivas con señal de novedad, comparando las condiciones original, main y reward_only.
- Evaluación de metodologías de ES en modelos pequeños: útil para investigadores que quieran contrastar sus propios pipelines de optimización evolutiva contra un artefacto publicado con métricas y correcciones documentadas.
- Estudio de validez de expresiones aritméticas: permite analizar por qué el ajuste mejora la legalidad de expresiones en problemas de tres y cuatro números pero la empeora en los de cinco.
- Auditoría de trazabilidad científica: el modelo y sus artefactos crudos permiten verificar afirmaciones sobre intervalos de confianza y correcciones independientes.
- Docencia sobre limitaciones de señales de recompensa: ejemplo práctico de que una mejora en accuracy no implica que la hipótesis causal se confirme.
- Pruebas de infraestructura de despliegue con modelos pequeños: por su tamaño (≈1 GB en safetensors) puede usarse para validar pipelines de transformers o TGI sin coste elevado.

## Benchmarks y rendimiento

| Condicion | Test greedy accuracy | Intervalo 95% | Hard greedy accuracy | Original-test pass@1 | Original-test pass@8 | Estado |
|---|---|---|---|---|---|---|
| original | 0,29 % | 0,10 % - 0,54 % | 0,10 % | 0,12 % | 0,89 % | completo |
| main | 1,12 % | 0,68 % - 1,61 % | 0,00 % | 0,27 % | 2,06 % | completo |
| reward_only | 1,12 % | 0,68 % - 1,61 % | 0,10 % | 0,22 % | 1,67 % | completo |

Las columnas de accuracy usan una respuesta greedy por problema. "Hard" corresponde al split de cinco números. pass@1, pass@8 y diversidad de muestreo usan el subconjunto fijo del test original. Los intervalos excluyen la variabilidad entre semillas de entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB de pesos más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5-0,7 GB; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones por tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en CPU para inferencia en lote pequeño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Novelty ES pilot: main | 494 M | no disponible | Ajuste ES para countdown aritmético | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ≈494 M | 32 768 tokens (según modelo base) | Asistente generalista instruction-tuned | Apache 2.0 | Hugging Face |
| Modelos de razonamiento aritmético pequeños (p. ej. variantes de Qwen ajustadas a GSM8K) | 0,5-1,5 B | variable | Fine-tuning supervisado en matemáticas | variable | Hugging Face |

La comparación con alternativas de la misma categoría (ajustes de investigación para tareas aritméticas) es difícil porque no se han publicado resultados de benchmarks estándar. El modelo base Qwen2.5-0.5B-Instruct es la referencia directa y está disponible públicamente con la misma licencia.

## Limitaciones y advertencias

- El propio autor indica que la hipótesis de mejora direccional por novedad no se sostiene en esta semilla: main no supera a reward_only y el intervalo pareado incluye cero.
- La accuracy absoluta es muy baja (1,12 % greedy en test), lo que limita cualquier uso práctico en producción.
- La mejora en legalidad de expresiones no se transfiere a los problemas de cinco números, donde ambos checkpoints ajustados rinden peor que el original.
- No hay evidencia de mejoras generales en lenguaje; es una adaptación aritmética de investigación.
- Los intervalos excluyen la variabilidad entre semillas de entrenamiento, por lo que la incertidumbre real es mayor.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero heredados del modelo base y agravados por el ajuste estrecho.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello.
- En producción: no recomendado; úsese solo como artefacto de investigación reproducible.
- Los tensores de generación cero y la trayectoria histórica completa de embeddings/archivo no están disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0
- Dataset de artefactos crudos: https://huggingface.co/datasets/BurnyCoder/novelty-es-pilot-artifacts/tree/949e2dcb385bc2b7088c40444ef879b76596317d
- Repositorio del proyecto (preregistro, fuente, procedencia y limitaciones): https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Revisiones predecesoras (publication.json): https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training/blob/cf0a402/reports/publication.json
- Correcciones independientes y lagunas de evidencia: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training/blob/main/reports/independent-corrections-2026-11-12.md
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Configuración de truncación de MiniLM (256 tokens WordPiece): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/1110a243fdf4706b3f48f1d95db1a4f5529b4d41/sentence_bert_config.json
- Sintaxis de expresiones Python restringidas: https://docs.python.org/3.12/reference/expressions.html
