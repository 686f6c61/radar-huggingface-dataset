# Physicsru/compgen-checkpoints

## Resumen

`Physicsru/compgen-checkpoints` es un repositorio que contiene 15 checkpoints de `Qwen/Qwen3-4B-Base` de un estudio controlado sobre generalizacion composicional. El objetivo es determinar si un modelo puede componer habilidades que solo ha visto de forma aislada, sin haberlas visto nunca combinadas durante el entrenamiento. Cada subcarpeta es un checkpoint completo, con sus pesos en `safetensors` (fp32, ~16 GB por modelo), tokenizador y plantilla de chat.

El estudio entrena el modelo sobre una biblioteca de 25 operadores de cadenas con nombres opacos (`func_0` a `func_24`). Primero aprende cada operador como habilidad atomica y luego se entrena en composiciones construidas únicamente con 13 operadores de entrenamiento. Los 12 operadores `held-out` nunca aparecen combinados en los datos de entrenamiento. Se evalúa la capacidad del modelo para componer esos operadores no vistos, usando un formato de respuesta específico llamado "recall-then-assemble" (RA). Los checkpoints varían en una única variable de entrenamiento cada vez, lo que permite aislar efectos concretos (presencia de datos de co-ocurrencia, demos de composición, profundidad de las demos, uso de RL con GRPO, semilla, o número de pasos de RL).

Este trabajo es relevante para la comunidad científica por su contribución a la interpretabilidad y a la comprensión de los mecanismos de generalización composicional en modelos lingüísticos. Es un recurso de investigación, no un modelo de propósito general. El repositorio es de gran tamaño (241.4 GB) y no tiene descargas aún, lo que indica que es un recurso reciente y especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-4B-Base) |
| Parametros totales | 4B (aprox., heredados del modelo base) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (pesos originales en `safetensors`); no se indican otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (fp32) |

## Arquitectura y entrenamiento

La arquitectura es la de `Qwen3-4B-Base`, un modelo denso basado en transformer decoder-only. El entrenamiento se divide en dos grandes etapas. La primera etapa ("stage 1") consiste en un refinamiento por ejecución de código ("RFT on code execution") en el que el modelo aprende las 25 habilidades atómicas con los cuerpos de las funciones a la vista. Le sigue una etapa intermedia ("stage 1.5") de 20k tareas atómicas de profundidad 1 sobre los 25 operadores y 12k composiciones de profundidad 2-4 con operadores de entrenamiento, en formato prosa más bloque de código. Este checkpoint intermedio se denomina `stage15b-init`.

A partir de ahí, se aplica SFT en varias configuraciones (carpetas `sft-*`). Todas las configuraciones SFT comparten las mismas 10,000 tareas atómicas (400 por operador, los 25 operadores), y difieren en cómo se empaquetan esas tareas en las respuestas (una por respuesta o grupos de co-ocurrencia) y en qué filas de composición se añaden. Las cuatro celdas principales forman un diseño 2×2: `sft-d1-s1` (sin co-ocurrencia, sin demos), `sft-v1-s1` (sin co-ocurrencia, con demos), `sft-c1-s1` (con co-ocurrencia, sin demos) y `sft-eco-s1` (con co-ocurrencia y demos). Posteriormente, se aplica RL (GRPO) partiendo de `sft-eco-s1`, con KL 0.01 al modelo inicial y 100 pasos de entrenamiento, generando los checkpoints `rl-*`.

El formato de respuesta "recall-then-assemble" es clave: primero se pide recordar la definición de cada operador (`Recall func_N: <gloss>`) y después ensamblarla junto con la solución principal (`Assemble:`). El modelo debe recuperar la definición de cada operador y componerla para resolver un programa. La evaluación se centra en la precisión de programas sobre operadores no vistos, con profundidad de expresión 4 y 8, así como en cadenas de anidamiento de profundidad 20. También se mide un error de aridad en `func_24`, que es un operador de retroceso ("backtracking palindrome transform") con un parámetro `depth` no utilizado semánticamente.

## Capacidades

- Generación de programas en un formato estructurado "recall-then-assemble" para composiciones de operadores de cadenas.
- Recuperación de definiciones de operadores individuales a partir de un corpus cerrado de 25 funciones con nombres opacos.
- Composición de habilidades aprendidas de forma aislada, incluyendo operadores no vistos en composiciones durante el entrenamiento.
- Capacidad de resolver cadenas de anidamiento de hasta profundidad 20 en los checkpoints con RL exitoso (por ejemplo, `rl-mdb-step100` alcanza 0.95 de precisión).
- Soporte de razonamiento en múltiples pasos, ya que debe recuperar y ensamblar definiciones antes de emitir la solución final.
- No se indican capacidades de tool calling, visión, audio ni soporte de agentes en la información disponible.

## Casos de uso

- Investigación en generalización composicional: permite estudiar cómo un modelo denso de 4B adquiere la capacidad de componer habilidades nunca vistas juntas. Los 15 checkpoints permiten aislar variables de entrenamiento individuales, lo que facilita experimentos ablativos.
- Interpretabilidad de mecanismos internos: los autores destacan la etiqueta "interpretability". Los checkpoints sirven para analizar qué representaciones internas se activan al recuperar definiciones y al ensamblar programas, y cómo cambian según el método de entrenamiento (SFT vs RL).
- Comparación de técnicas de alineación (SFT vs RL): los pares de checkpoints (por ejemplo, `sft-eco-s1` frente a `rl-mdb-step100` o `rl-r1a-step100`) permiten evaluar el efecto de GRPO sobre la capacidad de generalización, incluyendo deriva y recuperación de rendimiento.
- Estudio de la "co-ocurrencia" en datos de entrenamiento: comparar `sft-v1-s1` con `sft-eco-s1` aísla el efecto de agrupar varias tareas atómicas independientes en una misma respuesta, frente a presentarlas una a una.
- Evaluación de la profundidad de las demos de composición: los checkpoints `sft-c4-s1` y `sft-c4b-s1` comparan si mostrar demos solo de profundidad 2 o de profundidad 2-4 (mismo número de filas) mejora la generalización a profundidades mayores.
- Análisis de la estabilidad del entrenamiento con RL: los checkpoints `rl-mda-step5`, `rl-mda-step50` y `rl-mda-step100` muestran cómo la drifta (cambio de comportamiento no deseado) aparece y desaparece a lo largo de los pasos, lo que es útil para estudiar la dinámica de optimización en RL.

## Benchmarks y rendimiento

La información disponible incluye métricas de precisión sobre tareas de composición con operadores no vistos. No se presentan benchmarks estándar como MMLU o HumanEval. La tabla siguiente resume los resultados mencionados en el README.

| Checkpoint | precisión held-out d4 | precisión held-out d8 | cadenas d20 | error de aridad (func_24) |
|---|---|---|---|---|
| `stage15b-init` | 0.03 | 0.00 | no disponible | no disponible |
| `sft-d1-s1` | 0.00 | 0.00 | no disponible | no disponible |
| `sft-v1-s1` | 0.53 ±0.15 | 0.09 ±0.05 | no disponible | no disponible |
| `sft-c1-s1` | 0.66 ±0.14 | 0.08 ±0.04 | no disponible | no disponible |
| `sft-eco-s1` | 0.97 ±0.02 | 0.73 ±0.15 | 0.50 | no disponible |
| `sft-c4-s1` | 0.70 ±0.03 | 0.12 ±0.05 | no disponible | no disponible |
| `sft-c4b-s1` | 0.90 | 0.62 | no disponible | no disponible |
| `rl-mdb-step100` | no disponible | no disponible | 0.95 | no disponible |
| `rl-r1a-step100` | no disponible | no disponible | 0.61 | 25% |
| `rl-r1b-step100` | no disponible | no disponible | 0.89 | 1% |
| `rl-mda-step5` | no disponible | no disponible | 0.82 | 6% |
| `rl-mda-step50` | no disponible | no disponible | 0.57 | 44% |
| `rl-mda-step100` | no disponible | no disponible | 0.93 | 0.3% |

Los valores con ± indican la desviación estándar de varias semillas, aunque cada carpeta del repositorio contiene una semilla concreta. En la tabla de contrastes del README se citan valores concretos para algunas semillas (por ejemplo, `sft-v1-s1` con 0.75 / 0.15 y `sft-eco-s1` con 0.98 / 0.83). No se han publicado resultados de benchmarks externos ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Cada checkpoint individual en fp32 ocupa aproximadamente 16 GB. Para cargarlo en memoria de GPU, se necesita como mínimo una GPU con 16 GB de VRAM (por ejemplo, una RTX 4080 o A10G), aunque es recomendable disponer de margen adicional.
- Para entrenamiento o ajuste fino sobre estos checkpoints, se recomienda una GPU de la serie A100 (40 GB o 80 GB) o H100.
- El repositorio completo ocupa 241.4 GB en disco, por lo que si se desean descargar todos los checkpoints es necesario contar con suficiente espacio de almacenamiento y ancho de banda.
- Para inferencia con menor consumo de memoria, se puede aplicar cuantización posterior (por ejemplo, 4-bit o 8-bit) con librerías como `bitsandbytes` o convertir los pesos a formato GGUF para su uso con `llama.cpp`. No se proporcionan configuraciones de cuantización precalculadas.
- El despliegue se puede realizar con el framework `transformers` de HuggingFace, tal como se muestra en el ejemplo del README. Para bajo consumo, `llama.cpp` o `Ollama` son opciones viables tras la conversión a GGUF. No se indican datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables en el contexto específico de este estudio. Los checkpoints no son modelos de propósito general, sino puntos intermedios de un experimento controlado. La comparación más directa sería con el modelo base `Qwen/Qwen3-4B-Base` sin entrenamiento adicional, pero no se publican métricas de referencia en la información disponible. Por tanto, la comparativa con modelos similares se limita a la siguiente tabla orientativa:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Qwen/Qwen3-4B-Base` | 4B | no disponible | Apache 2.0 | HuggingFace | Modelo base original |
| `Physicsru/compgen-checkpoints` | 4B | no disponible | Apache 2.0 | HuggingFace | 15 checkpoints de investigación para estudio de composición |

No se encuentran otros modelos de investigación con el mismo enfoque de "recall-then-assemble" y estudio de co-ocurrencia en la información disponible.

## Limitaciones y advertencias

- Es un recurso de investigación, no un modelo de propósito general. No está diseñado para tareas de chat, generación de código general, ni interacción con usuarios finales.
- Las capacidades están restringidas al dominio de los 25 operadores de cadenas definidos en el estudio. Fuera de ese dominio, el modelo no tiene utilidad práctica.
- Los sesgos y riesgos de alucinación no están documentados. En un entorno de composición, el modelo puede producir definiciones incorrectas o programas sintácticamente válidos pero semánticamente erróneos, especialmente en los checkpoints con menor precisión.
- La longitud de contexto y el comportamiento en contextos largos no se han evaluado ni publicado para estos checkpoints.
- No se indican restricciones de licencia para uso comercial más allá de Apache 2.0, que lo permite. Sin embargo, el uso comercial de estos checkpoints carece de sentido práctico dado su carácter experimental.
- Algunos checkpoints de RL muestran deriva ("drift") en el comportamiento. Por ejemplo, `rl-r1a-step100` pierde un parámetro en `func_24` el 25% de las veces, lo que puede considerarse una forma de alucinación aritmética (o de aridad). Esto debe tenerse en cuenta al analizar los resultados.
- Los únicos idiomas soportados son el inglés. No se ha evaluado el comportamiento en otros idiomas, por lo que es muy probable que falle fuera de este ámbito.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Physicsru/compgen-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base

No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible. Las búsquedas web no arrojaron resultados relevantes relacionados con este repositorio.
