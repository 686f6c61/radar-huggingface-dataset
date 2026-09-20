# open-athena/Snowball-67B-A2B-Math-RL-E13-Step8

## Resumen

Snowball-67B-A2B-Math-RL-E13-Step8 es un checkpoint de investigación publicado por open-athena dentro de la campaña Snowball, orientada al entrenamiento por refuerzo de modelos de matemáticas. Se trata del artefacto exacto correspondiente al paso 8 del brazo experimental E13, con un total de 67.078.876.160 parámetros y pesos distribuidos en safetensors (268,3 GB de repositorio). La nomenclatura «67B-A2B» indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 2.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la model card.

El modelo no es un lanzamiento de producción: el propio autor lo etiqueta como `research-artifact` y advierte de que su utilidad queda limitada si no se preserva la integridad del enrutador congelado («frozen router bias»). Repositorios de nombre similar bajo `laion/rl-snowball-*` pueden contener exportaciones con enrutador mutable que colapsan durante la inferencia, por lo que no deben sustituir a este artefacto.

Su relevancia es metodológica: constituye el punto de referencia verificable de una fila concreta del experimento de RL matemático de Snowball, con resultados en conjuntos reservados de AIME24 (15,00), MATH-500 (69,60) y OlympiadBench (13,67). Interesa a investigadores que necesiten reproducir resultados, estudiar dinámicas de RL con recompensas verificables o analizar el comportamiento del enrutamiento en MoE, más que a equipos que busquen un modelo listo para desplegar en producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; etiqueta `grug_moe` en el repositorio. Detalles de capas y número de expertos no disponibles |
| Parámetros totales | 67.078.876.160 (67,08 B) |
| Parámetros activos | ≈2.000 millones, según la nomenclatura «A2B» del nombre; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes documentadas |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | other (términos concretos no especificados en la información disponible) |
| Formato de pesos | safetensors, con `model.safetensors.index.json` y shards; tamaño del repositorio: 268,3 GB |
| Estado del enrutador | Sesgo de enrutador congelado (frozen router bias) |
| Brazo y paso del experimento | E13, paso 8 |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos identificada por la etiqueta `grug_moe`, con 67,08 B de parámetros totales y, según el nombre del modelo, alrededor de 2 B activos por token. El tamaño del repositorio (268,3 GB) es coherente con pesos almacenados en precisión de 32 bits (67,08 B × 4 bytes ≈ 268,3 GB), lo que implica que cualquier despliegue práctico exige una conversión previa a bf16, fp16 o formatos cuantizados. No se documentan en la información disponible el número de expertos, la política de enrutamiento, la dimensión oculta ni la longitud de contexto.

En cuanto al entrenamiento, la model card describe un proceso de aprendizaje por refuerzo y la ruta del artefacto de origen (`skyrl/rl-snowball-e13-rno2a-rlvrmath-dapo-ctx1-...`) apunta a RLVR (aprendizaje por refuerzo con recompensas verificables) sobre tareas matemáticas y a DAPO como algoritmo de optimización. No se especifican el modelo base, el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases previas de ajuste supervisado. La innovación técnica destacable es de índole experimental: la congelación del sesgo del enrutador como condición para que el checkpoint sea utilizable, con la advertencia explícita de que exportaciones con enrutador mutable se degradan hasta colapsar en inferencia.

## Capacidades

- Generación de texto y resolución de problemas matemáticos: el modelo está entrenado específicamente con RL sobre problemas de competición, con resultados medidos en AIME24, MATH-500 y OlympiadBench.
- Razonamiento matemático de varios pasos: capacidad objetivo del experimento, orientada a demostraciones y problemas de respuesta verificable.
- Generación de código: no disponible; no se documenta soporte específico ni evaluación en lenguajes de programación.
- Tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo de pensamiento explícito (thinking mode): no disponible.
- Visión o audio: no disponible; no se declaran capacidades multimodales.
- Determinismo de artefacto: el checkpoint incorpora el estado de enrutador congelado con el que se reportaron las métricas, lo que permite reproducir la evaluación publicada.

## Casos de uso

- Reproducción de resultados de investigación: cargar exactamente este checkpoint, junto con `config.json`, el tokenizer y todos los shards referenciados por `model.safetensors.index.json`, permite replicar la fila reportada (AIME24 15,00; MATH-500 69,60; OlympiadBench 13,67) y contrastar la metodología de evaluación descrita en `MATH_EVALS.md`.
- Estudio del colapso de enrutadores en MoE: comparar este artefacto con exportaciones de nombre similar bajo `laion/rl-snowball-*` permite medir cuantitativamente la degradación que introduce un enrutador mutable durante la inferencia, un problema recurrente en modelos de mezcla de expertos.
- Investigación en RLVR y algoritmos tipo DAPO: al ser un paso intermedio concreto (paso 8 del brazo E13), resulta útil para analizar la evolución de las métricas matemáticas a lo largo del entrenamiento y ajustar hiperparámetros de RL con recompensas verificables.
- Destilación hacia modelos pequeños: con aproximadamente 2 B de parámetros activos por token, el coste de cómputo por token es contenido; las salidas del checkpoint pueden emplearse como señal de profesor en dominios matemáticos, siempre con verificación posterior de las soluciones.
- Generación de datos sintéticos de matemáticas con filtrado: producir problemas y soluciones candidatas y filtrarlas con un verificador simbólico o con comprobación de respuesta final; el 15,00 en AIME24 exige descartar una fracción alta de las muestras.
- Referencia fija para evaluación comparativa interna: al ser un artefacto inmutable y etiquetado, sirve como punto de control estable en harnesses de evaluación propios, sin el riesgo de que el modelo cambie bajo el mismo identificador.
- Estudio de arquitecturas MoE a gran escala: con 67,08 B totales y ~2 B activos, es un caso de análisis del equilibrio entre huella de memoria (total de parámetros) y coste de cómputo (parámetros activos).
- Auditoría de trazabilidad de artefactos: la model card enlaza la ruta S3 de origen, el issue del experimento y el archivo de evidencias, lo que permite auditar de extremo a extremo cómo se produjo el checkpoint.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre conjuntos reservados («held-out»):

| Benchmark | Resultado |
|---|---|
| AIME24 | 15,00 |
| MATH-500 | 69,60 |
| OlympiadBench | 13,67 |

Nota del autor: se trata del único checkpoint E13 evaluado. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible, y las advertencias metodológicas de estas evaluaciones se recogen en `MATH_EVALS.md` dentro del archivo de evidencias.

## Requisitos de hardware

- Pesos en precisión original: el repositorio ocupa 268,3 GB, coherente con almacenamiento en fp32 (67,08 B × 4 bytes). Se requiere ese espacio en disco antes de cualquier conversión.
- Inferencia en bf16 o fp16: aproximadamente 134 GB de pesos, más memoria para caché KV y activaciones.
- Inferencia en int8: aproximadamente 67 GB de pesos.
- Inferencia en int4: aproximadamente 34 GB de pesos, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: para bf16, un mínimo práctico de 2 × H100 80 GB o 2 × A100 80 GB; para int4, una única H100 o A100 de 80 GB resulta suficiente con margen para la caché KV.
- GPU de consumo: en int4 el modelo no cabe en una única RTX 4090 (24 GB) ni en una RTX 5090 (32 GB); requeriría al menos 2 × RTX 4090 (48 GB) con margen ajustado para contexto corto. En bf16 no cabe en hardware de consumo.
- Consideración clave: aunque los ~2 B de parámetros activos reducen los FLOPs por token, la huella de memoria viene determinada por los 67,08 B totales, por lo que el cuello de botella es la VRAM, no el cómputo.
- Opciones de despliegue: no se documenta soporte en vLLM, TGI, SGLang, llama.cpp ni Ollama en la información disponible. La etiqueta `grug_moe` y el requisito de preservar la integridad del enrutador sugieren la necesidad de código de inferencia específico del proyecto Marin.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye modelos comparables con datos verificables, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E13-Step8 | 67,08 B | ≈2 B (según nomenclatura) | no disponible | AIME24 15,00; MATH-500 69,60; OlympiadBench 13,67 | other | HuggingFace, 0 descargas, 0 likes |
| Alternativas de la misma categoría (MoE de ~60-70 B con ~2 B activos) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros en la información facilitada, y los resultados de la búsqueda web realizada no contienen referencias relevantes a este modelo ni a alternativas de su categoría.

## Limitaciones y advertencias

- Artefacto de investigación, no de producción: la propia model card indica que los checkpoints de esta campaña tienen utilidad limitada salvo que se preserve la reparación del sesgo del enrutador o la integridad del enrutador congelado.
- Riesgo de sustitución de artefacto: repositorios más antiguos con nombres parecidos bajo `laion/rl-snowball-*` pueden contener exportaciones con enrutador mutable que colapsan en inferencia. No deben usarse como sustitutos de este checkpoint.
- Integridad de archivos: es necesario preservar conjuntamente `config.json`, los archivos del tokenizer y todos los shards referenciados por `model.safetensors.index.json`; mezclar shards de distintas exportaciones invalida el artefacto.
- Rendimiento matemático moderado: 15,00 en AIME24 y 13,67 en OlympiadBench indican una capacidad limitada en problemas de competición, muy por debajo de lo que exigiría un uso directo en producción sin verificación.
- Alucinación: no se documentan tasas de alucinación ni mecanismos de mitigación; en tareas matemáticas el riesgo es alto y requiere verificación de resultados.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento fuera del inglés o del dominio matemático del entrenamiento.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con entradas largas.
- Licencia: marcada como `other` sin términos especificados en la información disponible; antes de cualquier uso comercial debe consultarse la licencia real en el repositorio.
- Despliegue: sin soporte documentado en los stacks de inferencia habituales, y con una arquitectura MoE personalizada, la integración exige trabajo de ingeniería adicional.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad.
- Reproducibilidad dependiente de terceros: las métricas publicadas remiten a `MATH_EVALS.md` en el archivo de evidencias, que debe consultarse para conocer las salvedades de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E13-Step8
- Archivo de evidencias y evaluaciones: https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en Marin: https://github.com/marin-community/marin/issues/7786
- Ruta del artefacto de origen: `s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-e13-rno2a-rlvrmath-dapo-ctx1-20260821-100706-2e77f3/exports/global_step_8/policy/`
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo ni sobre modelos comparables.
