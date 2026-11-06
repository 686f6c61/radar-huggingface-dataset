# Lucasgitguy-co/spot-snake-d1-3B-v0.1

## Resumen

Spot Snake d1-3B v0.1 es un modelo de decisión especializado, desarrollado por Lucasgitguy-co, que parte de LiquidAI/d1-3B y se ha sometido a un post-entrenamiento para seleccionar movimientos en el juego Spot's Biscuit Snake. El modelo no genera texto libre ni resuelve tareas generales: recibe un estado de juego con una lista de movimientos seguros y devuelve el ranking de esos movimientos, imitando a un profesor heurístico que prioriza mantener el mayor espacio libre en el tablero. Con 3.123.483.888 parámetros totales y pesos derivados de la arquitectura LFM2-VL del modelo base, se distribuye en safetensors (bf16) y en GGUF (F16 y Q4_K_M).

El interés del modelo es metodológico más que de propósito general: demuestra cómo un modelo de lenguaje de 3B puede reconvertirse, mediante un adaptador de rango 8 y un dataset de decisiones, en un componente de toma de decisiones dentro de un bucle de juego. El autor reporta una concordancia con el profesor del 99,82 % en el conjunto de test retenido (1.708 filas) y del 100 % en un subconjunto de 32 filas tras recargar los ficheros guardados, incluyendo los GGUF F16 y Q4_K_M.

Es relevante ahora porque ejemplifica una tendencia práctica: reutilizar modelos base pequeños y abiertos para tareas estrechas y verificables, con métricas de concordancia explícitas y artefactos de recuperación documentados. No obstante, su alcance es muy limitado: no se han medido puntuación de juego, tasa de victoria ni latencia, y el propio autor advierte que solo ordena movimientos que el juego ya marca como seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2-VL (hereda la del modelo base LiquidAI/d1-3B); pesos con `custom_code` y carga mediante `trust_remote_code=True` |
| Parametros totales | 3.123.483.888 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y Q4_K_M en GGUF; pesos completos en bf16 (safetensors) |
| Idiomas soportados | no disponible (el modelo está orientado a decisiones de juego, no a generación multilingüe) |
| Licencia | spot-snake-composite: LFM Open License v1.0 (pesos de Liquid AI) + Apache-2.0 (contribuciones nuevas), aplicadas conjuntamente |
| Formato de pesos | safetensors (bf16, shards `model-0000N-of-0000M`), GGUF (`model-f16.gguf`, `model-Q4_K_M.gguf`), adaptador de rango 8 en formato propio (no PEFT) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base LiquidAI/d1-3B, etiquetada en Hugging Face como `lfm2_vl`, con torre de visión y código de runtime propio del repositorio upstream. El post-entrenamiento consistió en un adaptador de rango 8 (formato propio, no PEFT) entrenado sobre el dataset Spot Snake Decisions v0.1, en el que el juego proporciona los movimientos seguros y el modelo aprende a ordenarlos imitando a un profesor heurístico que conserva el mayor espacio abierto. No se documenta el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO; el objetivo declarado es la imitación del profesor, no la optimización de la puntuación del juego.

Un detalle técnico relevante es el proceso de recuperación: el primer guardado completo se quedó sin espacio en disco, por lo que los pesos publicados se reconstruyeron fusionando el adaptador entrenado en el base fijado (`LiquidAI/d1-3B` en `051bcc464b`), sin reentrenar; el fichero `recovery.json` documenta el procedimiento. La torre de visión quedó sin cambios durante el entrenamiento y el autor indica que el proyector de este variante no puede convertirse con la versión fijada de llama.cpp (no probado), debiendo usarse `mmproj-d1-3B-F16.gguf` del repositorio GGUF del modelo base. Los ficheros GGUF funcionan con llama.cpp en la revisión `1b6935b` o posterior, exponiendo un endpoint `/v1/systemone` para consultas de estado y elección.

## Capacidades

- Ranking de movimientos seguros: recibe un estado de juego y una pregunta de elección, y devuelve el orden de preferencia entre los movimientos que el juego ya ha validado como seguros.
- Decisión de un solo paso: el modelo está diseñado para elegir movimiento en un bucle de juego, no para conversación abierta ni razonamiento multi-turno prolongado.
- Integración con llama.cpp: los GGUF F16 y Q4_K_M permiten servir el modelo con `llama-server` y consultarlo vía `/v1/systemone`.
- Integración con Transformers: carga mediante `AutoModel.from_pretrained(..., trust_remote_code=True)` con el código upstream incluido en el repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible; el alcance es la clasificación/ranking de movimientos.
- Capacidades multilingües: no disponibles ni documentadas.
- Capacidades especiales: no se documenta modo thinking, audio ni otras modalidades; la torre de visión existe en el base pero no se ha validado en este variante.

## Casos de uso

- Automatización de un agente de juego en Spot's Biscuit Snake: el modelo se integra en el bucle del juego para elegir entre los movimientos seguros que ofrece el motor, sustituyendo al profesor heurístico cuando se busca un comportamiento aprendido y reproducible.
- Evaluación de políticas de imitación: sirve como referencia para comparar una política neuronal de 3B frente a la heurística original, usando la concordancia con el profesor como métrica de proximidad.
- Prototipado de modelos de decisión sobre base LFM2-VL: el repositorio incluye scripts, generador de dataset e instrucciones paso a paso en el repositorio del dataset, lo que facilita replicar el pipeline con otros juegos o dominios de decisión acotados.
- Despliegue ligero en local con GGUF: la variante Q4_K_M permite ejecutar el modelo con llama.cpp en entornos con recursos limitados, útil para demos y pruebas de integración sin infraestructura GPU grande.
- Investigación sobre post-entrenamiento con adaptadores pequeños: el adaptador de rango 8 y los ficheros `metrics.json`, `training.json` y `reload-check.json` permiten estudiar el efecto de un ajuste mínimo sobre un base de 3B en una tarea estrecha.
- Verificación de pipelines de conversión y recarga: los chequeos de recarga (100 % de concordancia en 32 filas para safetensors, F16 y Q4_K_M) sirven como test de regresión para validar que la cuantización no altera la decisión en ese subconjunto.

## Benchmarks y rendimiento

Los únicos datos publicados son de concordancia con el profesor (teacher agreement), que el autor advierte explícitamente que no equivalen a puntuación de juego, tasa de victoria ni velocidad.

| Comprobacion | Concordancia con el profesor |
|---|---|
| Modelo base, validación | 97,82 % (1.785 filas) |
| Mejor de 2 épocas, validación | 99,61 % (1.785 filas) |
| Checkpoint seleccionado, test retenido | 99,82 % (1.708 filas) |
| Ficheros guardados recargados, subconjunto de test | 100,00 % (32 filas) |
| model-f16.gguf, mismo movimiento que safetensors | 100,00 % (32 filas) |
| model-Q4_K_M.gguf, mismo movimiento que safetensors | 100,00 % (32 filas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.123.483.888 parámetros, los pesos en bf16 ocupan aproximadamente 6,2 GB y la variante Q4_K_M alrededor de 1,8-2 GB solo para pesos, sin contar overhead de runtime ni el proyector de visión.
- GPU recomendadas: no disponibles; por tamaño, el modelo debería caber en GPUs consumer con suficiente VRAM para bf16 (por ejemplo, 8 GB o más) y con menos para Q4_K_M.
- ¿Cabe en GPU consumer? Sí, previsiblemente en modelos con 8 GB o más para bf16 y en GPUs de 4-6 GB para Q4_K_M, aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: llama.cpp (`llama-server`, revisión `1b6935b` o posterior) para GGUF; Transformers (`>=5.22,<6`) con `trust_remote_code=True` para safetensors; el autor menciona un `scripts/serve.py` para servir el juego en local en `http://127.0.0.1:8000`.
- Latencia y throughput: no disponibles; no se han medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spot Snake d1-3B v0.1 | 3.123.483.888 | no disponible | Decisión de juego (ranking de movimientos seguros) | spot-snake-composite (LFM Open License v1.0 + Apache-2.0) | Hugging Face, safetensors y GGUF |
| LiquidAI/d1-3B (base) | 3B (según modelo base) | no disponible | Modelo base LFM2-VL | LFM Open License v1.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de decisión de juego comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo ordena movimientos que el juego ya marca como seguros; es imprescindible mantener las comprobaciones de colisión del motor y no delegar en el modelo la validación de legalidad.
- El profesor es una heurística, no un jugador óptimo; igualar al profesor es el objetivo declarado, por lo que el modelo no supera necesariamente a la heurística ni garantiza mejores puntuaciones.
- No se han medido puntuación de juego, tasa de victoria ni velocidad; la concordancia con el profesor no es una métrica de rendimiento en el juego.
- Las puntuaciones de confianza no están calibradas tras el entrenamiento, según el propio autor.
- Sesgos conocidos: no documentados; al entrenarse por imitación de una heurística concreta, hereda las preferencias de esa heurística.
- Riesgo de alucinación: no aplica en el sentido habitual de generación libre, pero el modelo podría ordenar movimientos de forma inconsistente fuera de la distribución del dataset de decisiones.
- Limitaciones de contexto e idioma: no documentadas; el modelo no está pensado para conversación multilingüe ni para contextos largos.
- Restricciones de licencia: la licencia compuesta (LFM Open License v1.0 + Apache-2.0) debe revisarse antes de uso comercial; los términos de la LFM Open License v1.0 condicionan la redistribución y el uso de los pesos de Liquid AI.
- Caveat de producción: la torre de visión no se ha validado en este variante y el proyector no puede convertirse con la versión fijada de llama.cpp (no probado); el autor recomienda usar el `mmproj` del repositorio GGUF del base.
- El repositorio pesa 13,3 GB y los pesos se reconstruyeron por fusión del adaptador tras un fallo de disco; conviene verificar la integridad con `reload-check.json` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/spot-snake-d1-3B-v0.1
- Dataset de decisiones: https://huggingface.co/datasets/Lucasgitguy-co/spot-snake-decisions-v0.1
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- GGUF del modelo base: https://huggingface.co/LiquidAI/d1-3B-GGUF
- Repositorio del juego Spot's Biscuit Snake: https://github.com/Gitguy268/spot-snake
