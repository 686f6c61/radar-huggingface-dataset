# ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e-step29

## Resumen

Este modelo es un post-entrenamiento por refuerzo (RL) del modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario de HuggingFace `ipfipfipf`. El objetivo es mejorar las capacidades del modelo en tareas de matemáticas, generación de código y búsqueda con herramientas, mediante un entrenamiento multi-turno con llamada nativa a herramientas (estilo ReAct). El algoritmo utilizado es GRPO combinado con un objetivo SDPO (self-skill) en la variante "arm e", y el checkpoint publicado corresponde al paso 29, que es el punto máximo de la curva de entrenamiento según los datos del autor.

El modelo tiene aproximadamente 8,95 mil millones de parámetros y se distribuye en formato safetensors. Aunque el `config.json` declara la arquitectura `Qwen3_5ForConditionalGeneration` (que en el base incluye visión), este checkpoint solo contiene los tensores del modelo de lenguaje (427 tensores), habiéndose descartado la torre de visión (333 tensores) y las cabezas MTP (15 tensores). Por tanto, la entrada de imágenes no funciona, pero la generación de texto sí es operativa con Transformers, vLLM y SGLang. La licencia es Apache 2.0, lo que permite uso comercial.

La relevancia de este modelo radica en que, según los resultados reportados, alcanza las mejores cifras conocidas para un modelo de 9B en los benchmarks AMO-Bench y OJBench dentro de esta línea de trabajo, con una mejora sustancial en el uso de herramientas frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (según fuentes externas, la serie Qwen3.5 usa una arquitectura híbrida con Gated Delta Networks y MoE disperso; no confirmado en la model card) |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el límite de respuesta durante entrenamiento fue de 16384 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B`, cuya arquitectura, según la documentación de la serie Qwen3.5 disponible en fuentes externas, combina Gated Delta Networks con un mecanismo de mezcla de expertos dispersa (MoE), lo que busca un alto rendimiento de inferencia con baja latencia. Sin embargo, la model card de este checkpoint no detalla la arquitectura interna, por lo que esa información debe tomarse con cautela.

El entrenamiento de este checkpoint consistió en un post-entrenamiento por refuerzo con GRPO, incorporando un objetivo SDPO (self-skill-all) con destilación de habilidades (`skill-KD mode=both`, coeficiente 0.01) y un prefijo de respuesta `skill`. Se utilizó un flujo mixto de tareas de matemáticas, código y búsqueda, con rollouts multi-turno de hasta 20 turnos y el modo de pensamiento (thinking) habilitado. La longitud máxima de respuesta fue de 16384 tokens, tanto en entrenamiento como en evaluación. Se entrenaron 31 rollouts y el checkpoint publicado es el paso 29, que según el autor es el pico de rendimiento; más allá de ese paso el rendimiento decae.

Durante la conversión del checkpoint de entrenamiento se eliminaron la torre de visión y las cabezas MTP, conservando únicamente los tensores del modelo de lenguaje. Esto implica que el modelo no procesa imágenes, aunque el `config.json` mantenga la declaración de la arquitectura condicional por compatibilidad.

## Capacidades

- Generación de texto y razonamiento matemático: resuelve problemas de nivel competitivo (AIME 2024/2025) con alta precisión.
- Generación de código: mejora significativa en benchmarks de código funcional (LiveCodeBench-v6-functional 63.3 en el paso 29).
- Llamada nativa a herramientas (tool calling): entrenado con estilo ReAct, emite llamadas XML `<function=...>` (compatibles con el parser `qwen3_coder` de SGLang).
- Agentes multi-turno: soporta hasta 20 turnos de interacción con herramientas.
- Modo de pensamiento (thinking): habilitado durante el entrenamiento, lo que permite razonamiento explícito antes de responder.
- Búsqueda: integra tareas de búsqueda en el flujo de entrenamiento, lo que sugiere capacidad para usar motores de búsqueda como herramienta.
- No soporta entrada de imágenes: a pesar de que el config lo declare, la torre de visión fue eliminada.

## Casos de uso

- Resolución de problemas matemáticos competitivos: el modelo puede emplearse en entornos educativos o de investigación para resolver problemas de nivel AIME, con una tasa de acierto del 84,2% (pass@1) en AIME 2024 y 81,7% en AIME 2025.
- Generación de código en producción: con soporte de tool calling y razonamiento multi-turno, puede integrarse en pipelines de desarrollo para generar, revisar y ejecutar código, reduciendo la intervención manual.
- Agentes autónomos con búsqueda en internet: gracias a su entrenamiento en tareas de búsqueda y su capacidad de llamar herramientas, puede construir agentes que consulten fuentes externas y sinteticen respuestas.
- Asistente de programación con ejecución de código: el modelo puede interactuar con un intérprete o compilador como herramienta, iterando sobre errores y mejorando soluciones.
- Tutor de matemáticas y ciencias: su capacidad de razonamiento paso a paso (thinking mode) lo hace adecuado para explicar procedimientos y verificar resultados.
- Automatización de tareas de análisis de datos: combinado con herramientas de ejecución de código, puede procesar datos, generar visualizaciones y extraer conclusiones en flujos multi-paso.

## Benchmarks y rendimiento

Resultados reportados por el autor (pass@1 / pass@8, muestreo sin greedy, límite de respuesta de 16384 tokens):

| Benchmark | pass@1 | pass@8 |
|---|---|---|
| AIME 2024 | 84.2 | 96.7 |
| AIME 2025 | 81.7 | 100.0 |
| AMO-Bench | 28.0 | 52.0 |
| OJBench (medium, 77 problemas) | 31.8 | 59.7 |

Además, se menciona que en LiveCodeBench-v6-functional el modelo alcanza 63.3 en el paso 29, aunque ese dato no aparece en la tabla principal. El autor indica que AMO-Bench y OJBench son los mejores resultados registrados para un modelo de 9B en esta línea de trabajo (el mejor anterior era AMO 22.7 y OJBench 29.5).

La evolución del rendimiento agregado (pass@1) según el paso de entrenamiento es la siguiente:

| Paso | 0 | 9 | 19 | 29 | 39 | 49 |
|---|---|---|---|---|---|---|
| Run 51 rollouts | 58.1 | 67.3 | 71.0 | 73.6 | 71.2 | 70.0 |
| Run 31 rollouts (este) | 58.2 | 68.4 | 71.6 | 73.0 | — | — |

## Requisitos de hardware

- VRAM estimada: con precisión FP16, el modelo requiere aproximadamente 18 GB de VRAM (8,95B parámetros × 2 bytes). Con cuantización de 4 bits (si se publicara), se estima que cabría en unos 5 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas. Para cuantización de menor precisión, una RTX 3090 o RTX 4080 podrían ser suficientes, aunque no hay datos oficiales.
- Despliegue: compatible con Transformers, vLLM y SGLang. En SGLang se recomienda usar el parser de tool calls `qwen3_coder`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos de la misma categoría (9B) para una comparación directa. La única comparación posible es con el modelo base `Qwen/Qwen3.5-9B`, del cual se sabe que en OJBench el 74,0% de los rollouts respondían sin llamar a una herramienta, mientras que en este checkpoint solo el 15,7% lo hace, y la tasa de repetición es 0. Esto indica una mejora sustancial en el uso de herramientas. Para comparaciones con otros modelos de 9B (p. ej., Llama-3.1-8B, Qwen2.5-7B), no hay datos disponibles en la información proporcionada.

## Limitaciones y advertencias

- No soporta entrada de imágenes: aunque el `config.json` declare `Qwen3_5ForConditionalGeneration`, la torre de visión fue eliminada; cualquier intento de usar imágenes fallará.
- Truncación en AMO-Bench: el pass@8 está deprimido porque el 18,5% de las muestras se truncan al alcanzar el límite de 16384 tokens; un presupuesto de generación mayor podría mejorar ese resultado.
- Saturación en AIME 2024/2025: el pass@8 alcanza el 100%, por lo que estos benchmarks ya no discriminan entre checkpoints.
- Decaimiento post-paso 29: entrenar más allá de este punto degrada el rendimiento (LiveCodeBench cae de 63.3 a 59.1 y la tasa de repetición sube a 4,2%).
- Riesgo de alucinación: no se ha evaluado específicamente, pero es un riesgo inherente a los modelos de lenguaje.
- Sesgos: no se han realizado evaluaciones de sesgo en la información disponible.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `Qwen/Qwen3.5-9B` para confirmar que no hay restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e-step29
- Página del modelo sin sufijo step29 (misma familia): https://huggingface.co/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e
- Ficha en Friendli AI: https://friendli.ai/models/ipfipfipf/Qwen3.5-9B-sdpo-react-mathcodesearch-grpo-arm-e
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
