# open-athena/Snowball-67B-A2B-Math-RL-E12-Step8

## Resumen

Snowball-67B-A2B-Math-RL-E12-Step8 es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña Snowball del ecosistema Marin (marin-community). Se trata de un modelo de mezcla de expertos (MoE) de 67.078.876.160 parámetros totales, entrenado con aprendizaje por refuerzo sobre tareas de matemáticas. El nombre del artefacto de origen apunta a un entrenamiento GRPO sobre el conjunto de datos DeepScaleR, y la etiqueta `grug_moe` identifica la implementación de MoE usada en la campaña.

El modelo no es un lanzamiento de producción: la propia model card lo describe como un «research checkpoint» correspondiente a la fila E12, paso 8, seleccionado como el mejor checkpoint del brazo E12 por puntuación agregada en evaluaciones held-out. Su relevancia actual es metodológica: documenta una técnica concreta de estabilización de enrutado, el «frozen router bias» (sesgo de router congelado), y advierte de que exportaciones anteriores con router mutable (`laion/rl-snowball-*`) pueden colapsar durante la inferencia.

El checkpoint reporta resultados held-out de 20,00 en AIME24, 71,00 en MATH-500 y 15,00 en OlympiadBench. El repositorio ocupa 268,3 GB en safetensors, tamaño coherente con pesos almacenados en FP32. No se especifican en la información disponible la longitud de contexto, los idiomas soportados ni los tipos de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiqueta `grug_moe`; no se detallan capas, número de expertos ni top-k |
| Parametros totales | 67.078.876.160 (≈67,08 B), dato real de los safetensors |
| Parametros activos | no disponible (la nomenclatura «A2B» del nombre sugiere activación dispersa en torno a 2 B, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors, con un tamaño (268,3 GB) coherente con FP32 |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia especificado en la información disponible) |
| Formato de pesos | safetensors, con `model.safetensors.index.json` y shards nombrados por dicho índice; se deben conservar juntos `config.json`, los ficheros del tokenizer y todos los shards |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una MoE (etiqueta `grug_moe`) integrada en la campaña Snowball del proyecto Marin. El nombre del checkpoint, «67B-A2B», sigue la convención habitual de los modelos dispersos: parámetros totales seguidos de una indicación de parámetros activos, aunque no se confirma el número exacto de parámetros activos ni la configuración de expertos, el enrutador o el top-k. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de SFT, RLHF o DPO previas al RL.

El entrenamiento corresponde a un proceso de aprendizaje por refuerzo. La ruta del artefacto de origen (`rl-snowball-e12-rno2a-deepscaler-grpo-ct-20260821-100706-50aae8`) indica el uso de GRPO y del conjunto DeepScaleR, con fecha de campaña 21 de agosto de 2026. La innovación técnica destacada por el autor es el estado del router: «frozen router bias», es decir, un sesgo de enrutador congelado que se preserva en la exportación. La model card advierte explícitamente de que repositorios de nombre similar bajo `laion/rl-snowball-*` pueden contener exportaciones con router mutable que colapsan en inferencia, y que no deben sustituirse por este artefacto. La campaña no documenta en la información disponible el uso de decodificación especulativa ni de mecanismos de atención lineal.

## Capacidades

- Razonamiento matemático con RL: el checkpoint procede de un entrenamiento por refuerzo sobre problemas matemáticos y reporta puntuaciones held-out en AIME24, MATH-500 y OlympiadBench.
- Generación de soluciones matemáticas de competición: el rango de evaluaciones declarado (AIME24, OlympiadBench) corresponde a problemas de nivel olímpico y de competición, con resultados notablemente bajos en OlympiadBench (15,00).
- Integridad de enrutado preservada: al conservar el sesgo de router congelado, el artefacto es apto para reproducir el comportamiento del paso 8 del brazo E12 sin el colapso descrito en exportaciones alternativas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta en la model card).
- Capacidades multilingües: no disponible.
- Capacidades multimodales (visión, audio) o modo «thinking» explícito: no disponible.

## Casos de uso

- Reproducción de experimentos de RL sobre razonamiento matemático: el checkpoint es el artefacto exacto de una fila reportada del experimento Snowball 67B-A2B math-RL, por lo que sirve para replicar la puntuación E12 paso 8 y auditar la metodología GRPO con DeepScaleR.
- Estudio del enrutado en MoE: la distinción entre «frozen router bias» y router mutable permite investigar experimentalmente por qué ciertas exportaciones colapsan en inferencia y qué condiciones de exportación preservan la funcionalidad.
- Generación de datos sintéticos de matemáticas: el modelo puede producir soluciones y cadenas de razonamiento para aumentar corpus de entrenamiento, siempre con verificación automática posterior mediante comprobadores simbólicos y con revisión humana de los casos límite.
- Construcción de arneses de evaluación matemática: al disponer de puntuaciones de referencia en AIME24, MATH-500 y OlympiadBench, resulta útil como modelo de control al validar nuevos pipelines de evaluación o al calibrar prompts y formatos de respuesta.
- Punto de partida para ajuste fino de dominio: un checkpoint MoE de 67 B con enrutado estabilizado puede servir de base para SFT específico en subáreas matemáticas, asumiendo que el coste de ajuste es alto y que la licencia debe aclararse antes de cualquier uso.
- Tutoría matemática asistida con supervisión: en un entorno interno de investigación educativa, el modelo puede generar explicaciones paso a paso de problemas de nivel preuniversitario, con revisión docente obligatoria dado el riesgo de error en problemas de nivel olímpico.
- Análisis de modos de fallo en modelos entrenados con RL: con puntuaciones diferenciadas por benchmark (71,00 en MATH-500 frente a 15,00 en OlympiadBench), es un punto de partida adecuado para estudiar la generalización del RL fuera de la distribución de entrenamiento.
- Auditoría de artefactos de investigación: el checkpoint, junto con su archivo de evidencias, permite verificar la trazabilidad entre la ruta S3 de origen, el paso de entrenamiento y las puntuaciones publicadas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| AIME24 | 20,00 | Held-out; selección del mejor checkpoint E12 por puntuación agregada |
| MATH-500 | 71,00 | Held-out |
| OlympiadBench | 15,00 | Held-out |

No se especifican en la información disponible el número de muestras evaluadas, el método de extracción de respuestas ni la configuración de decodificación. El autor indica que las puntuaciones y las advertencias sobre la evaluación están registradas en `MATH_EVALS.md`, dentro del archivo de evidencias. No se aportan comparaciones con otros modelos en los datos disponibles.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (67,08 B) y no proceden de la model card; el consumo de memoria para caché KV depende de la longitud de contexto y del número de capas, dato no disponible.

| Precisión de pesos | Memoria estimada solo para pesos |
|---|---|
| FP32 | ≈268 GB |
| BF16 / FP16 | ≈134 GB |
| INT8 | ≈67 GB |
| 4 bits | ≈34 GB |

- VRAM para inferencia: por encima de 268 GB en FP32 según el propio tamaño del repositorio; con cuantización a 4 bits sería necesario añadir la caché KV y los buffers del runtime.
- GPU recomendadas: para FP32 o BF16 se requiere agregación de memoria en varias GPU de clase A100/H100 (80 GB). Con cuantización de 4 bits cabría en configuraciones de una o dos GPU de 48-80 GB, siempre que el runtime soporte la arquitectura.
- GPU de consumo: no hay confirmación de que el modelo funcione en tarjetas de consumo; una hipotética carga en 4 bits quedaría en torno a los 34-40 GB, por encima de una RTX 4090 de 24 GB. Se requeriría una configuración multi-GPU o memoria unificada.
- Opciones de despliegue: no disponible. La arquitectura `grug_moe` es específica de la campaña Marin y no se documenta soporte en vLLM, llama.cpp, Ollama o TGI. La model card insiste en preservar `config.json`, el tokenizer y todos los shards del índice, lo que apunta a una carga mediante el código original.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio requiere 268,3 GB en disco.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks de modelos alternativos ni identificadores de modelos comparables de la misma categoría. Además, el carácter de artefacto de investigación, la arquitectura MoE propia de la campaña Marin y el estado de router congelado dificultan una comparación directa con modelos de razonamiento matemático de tamaño similar sin datos verificables adicionales.

## Limitaciones y advertencias

- Artefacto de investigación, no de producción: la propia model card afirma que los modelos de esta campaña son checkpoints de investigación y que su utilidad es limitada salvo que se preserve la integridad del router o se repare el sesgo del router.
- Riesgo de colapso por sustitución: repositorios de nombre similar bajo `laion/rl-snowball-*` pueden contener exportaciones con router mutable que colapsan en inferencia; no deben usarse como sustituto de este artefacto.
- Integridad de los ficheros: se deben conservar juntos `config.json`, los ficheros del tokenizer y todos los shards nombrados por `model.safetensors.index.json`; una carga parcial puede invalidar el comportamiento del checkpoint.
- Licencia restrictiva o indeterminada: la licencia es «other» y no se acompaña de texto de licencia en la información disponible, por lo que no puede darse por sentado el uso comercial. Es necesario contactar con el autor antes de cualquier despliegue productivo.
- Rendimiento desigual: la puntuación en OlympiadBench (15,00) y en AIME24 (20,00) indica capacidad limitada en problemas de nivel olímpico, muy por debajo del resultado en MATH-500 (71,00).
- Riesgo de alucinación: no se documentan medidas específicas de mitigación; en tareas matemáticas, un razonamiento plausible pero incorrecto es un modo de fallo habitual y no cuantificado en la información disponible.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento multilingüe o conversaciones de contexto largo.
- Ausencia de datos de evaluación detallados: el número de muestras, el método de evaluación y sus salvedades solo se documentan en `MATH_EVALS.md` dentro del archivo de evidencias.
- Sin métricas de despliegue: no hay datos publicados de latencia, throughput ni consumo real de memoria, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E12-Step8
- Issue del experimento en Marin: https://github.com/marin-community/marin/issues/7786
- Archivo de evidencias (dataset en HuggingFace): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Artefacto de origen (ruta S3, no accesible por HTTP): s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-e12-rno2a-deepscaler-grpo-ct-20260821-100706-50aae8/exports/global_step_8/policy/
- Búsqueda web: no se han encontrado enlaces relevantes adicionales sobre este modelo.
