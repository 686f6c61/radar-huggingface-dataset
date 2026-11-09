# HowardHsuuu/dataset-specific-clts-llama-3.2-1b

## Resumen

Este repositorio no contiene un modelo generativo al uso, sino un conjunto de checkpoints de Cross-Layer Transcoders (CLT) entrenados con la librería CLT-Forge sobre el modelo base `meta-llama/Llama-3.2-1B`. Los CLT son artefactos de interpretabilidad mecanicista: descomponen las activaciones internas de un transformer en características latentes dispersas y permiten construir grafos de atribución que explican qué circuitos internos contribuyen a una predicción concreta. El autor, HowardHsuuu, los publica como experimento piloto sobre recuerdo factual en NaturalQuestions.

El objetivo del experimento es comparar si un CLT entrenado con datos específicos de la tarea (preguntas factuales de NaturalQuestions) produce circuitos más interpretables y compactos que uno entrenado con el mismo presupuesto de tokens pero sobre texto genérico (wikitext-103). Se publican tres checkpoints: `factoid` (desde cero con 1M de tokens de NaturalQuestions), `generic` (desde cero con 1M de tokens de wikitext) y `factoid_finetuned` (el genérico afinado con 250k tokens adicionales de NaturalQuestions), además de 256 grafos de atribución precalculados.

Es relevante ahora porque la interpretabilidad mecanicista basada en transcoders y grafos de atribución está ganando tracción como herramienta de auditoría de modelos, y este repositorio hace inspeccionable y reutilizable una comparación controlada por presupuesto de entrenamiento. No es un modelo para producción: es material de investigación reproducible, con resultados preliminares sobre 32 prompts cribados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-Layer Transcoders (CLT) sobre Llama-3.2-1B; `d_latent=4096` |
| Parametros totales | no disponible (el CLT tiene anchura latente de 4096 características; el número total de parámetros no se declara) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama-3.2-1B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en bf16 para entrenamiento y float32 para evaluación de atribución) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no especificada; el modelo base Llama-3.2-1B tiene su propia licencia comunitaria) |
| Formato de pesos | safetensors (`clt_weights.safetensors`) más configuración JSON (`clt_cfg.json`); grafos de atribución en `.pt` de PyTorch |

## Arquitectura y entrenamiento

Cada checkpoint es un Cross-Layer Transcoder entrenado con CLT-Forge sobre las activaciones de `meta-llama/Llama-3.2-1B`. Un CLT aprende un diccionario disperso de características latentes (aquí `d_latent=4096`) que reconstruyen las activaciones de varias capas simultáneamente, lo que permite rastrear contribuciones a través de capas y construir grafos de atribución. El entrenamiento se hizo en bf16 y la evaluación de atribución en float32.

La comparación está controlada por presupuesto: `factoid` y `generic` se entrenaron ambos desde cero con aproximadamente 1M de tokens, el primero sobre NaturalQuestions (vía `lighteval/natural_questions_clean`) y el segundo sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`). El tercer checkpoint, `factoid_finetuned`, parte del `generic` y se afina con unos 250k tokens adicionales de NaturalQuestions. El baseline de referencia del informe es el CLT open source de circuit-tracer `mntss/clt-llama-3.2-1b-524k`, que no se incluye en el repositorio y no constituye un control de presupuesto equiparable. El autor declara explícitamente que no se incluye la condición "open source + finetune factoid" porque el formato público de circuit-tracer no es directamente un checkpoint de entrenamiento de CLT-Forge y el ajuste denso del modelo de 524k características requeriría un entorno multi-GPU mayor.

## Capacidades

- No genera texto ni responde prompts: es un artefacto de interpretabilidad, no un modelo de lenguaje desplegable.
- Descomposición de activaciones de Llama-3.2-1B en características latentes dispersas para análisis de circuitos.
- Construcción y guardado de grafos de atribución sobre prompts concretos mediante CLT-Forge.
- Soporte de reapertura de grafos precalculados sin recomputar la atribución completa.
- Evaluación cuantitativa de recuerdo factual mediante métricas de *replacement* y *completeness*.
- Carga programática vía `CLT.load_from_pretrained("factoid", device="cuda")` con la librería CLT-Forge.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento.

## Casos de uso

- Auditoría de circuitos factuales: cargar el checkpoint `factoid` y analizar qué características latentes sostienen el recuerdo de hechos en Llama-3.2-1B, usando los grafos guardados en `graph_artifacts/factual_recall/graphs/` como punto de partida sin recalcular atribuciones.
- Investigación en interpretabilidad comparada: replicar el contraste entre `factoid` y `generic` para estudiar si el entrenamiento específico de dominio mejora la fidelidad de la reconstrucción (0,5033 frente a 0,3355 de *mean replacement* en el piloto).
- Análisis de compacidad de circuitos: medir cuántas características se necesitan para cubrir el 80 % de la atribución objetivo (733,1 en `factoid` frente a 810,5 en `generic`) y estudiar la relación entre especialización y dispersión.
- Ablación de estrategias de entrenamiento: usar `factoid_finetuned` para comparar entrenamiento desde cero frente a afinado sobre dominio, aceptando su menor compacidad (921,7 características para el 80 %).
- Desarrollo de metodología de evaluación: reutilizar los 32 prompts cribados de recuerdo factual y los 128 grafos de control de siguiente token genérico como banco de pruebas para nuevas métricas de atribución.
- Docencia y divulgación técnica: emplear los checkpoints como ejemplo práctico y reproducible de transcoders entre capas y grafos de atribución en cursos o talleres de interpretabilidad mecanicista.

## Benchmarks y rendimiento

Resultados del piloto sobre 32 prompts cribados de recuerdo factual (*held-out*), tal como los publica el autor:

| Checkpoint | Mean replacement | Mean completeness | Características para el 80 % de atribución objetivo |
|---|---:|---:|---:|
| `factoid` | 0,5033 | 0,8322 | 733,1 |
| `generic` | 0,3355 | 0,7570 | 810,5 |
| `factoid_finetuned` | 0,5083 | 0,8343 | 921,7 |
| Baseline open source (`mntss/clt-llama-3.2-1b-524k`) | 0,6445 | 0,8915 | 528,2 |

Lectura del autor: el entrenamiento específico de dominio mejora *replacement* y *completeness* frente a un CLT genérico con el mismo presupuesto, pero el CLT de circuit-tracer sigue siendo un baseline amplio más fuerte, aunque no es un control de presupuesto equiparable. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo generativo.

## Requisitos de hardware

- El repositorio ocupa 45,4 GB, dominado por los 256 grafos `.pt` y los pesos de los tres checkpoints; el espacio en disco es el primer requisito práctico.
- VRAM de inferencia: no disponible de forma explícita; depende del tamaño del CLT (anchura latente 4096) y del modelo base Llama-3.2-1B cuyas activaciones se analizan.
- La carga se documenta con `device="cuda"`, lo que implica GPU; el autor no especifica modelos de GPU concretos ni mínimos de VRAM.
- Los grafos se guardaron en float32, lo que incrementa el espacio en memoria durante el análisis respecto a los pesos en bf16.
- Opciones de despliegue: exclusivamente la librería CLT-Forge; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de generación de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Base | Enfoque | Mean replacement | Mean completeness | Características para 80 % | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| `factoid` (este repo) | Llama-3.2-1B | CLT entrenado desde cero en NaturalQuestions, 1M tokens | 0,5033 | 0,8322 | 733,1 | other | Hugging Face, 0 descargas |
| `generic` (este repo) | Llama-3.2-1B | CLT entrenado desde cero en wikitext, 1M tokens | 0,3355 | 0,7570 | 810,5 | other | Hugging Face |
| `factoid_finetuned` (este repo) | Llama-3.2-1B | CLT genérico afinado con 250k tokens de NaturalQuestions | 0,5083 | 0,8343 | 921,7 | other | Hugging Face |
| `mntss/clt-llama-3.2-1b-524k` | Llama-3.2-1B | CLT de circuit-tracer, 524k características | 0,6445 | 0,8915 | 528,2 | no disponible | Hugging Face (repo original) |

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de producción: no genera texto ni debe usarse como asistente.
- Resultados preliminares y de escala piloto: solo 32 prompts cribados de recuerdo factual, sin intervalos de confianza ni tests de significación publicados.
- El baseline open source no es un control de presupuesto equiparable, por lo que la comparación con 0,6445 de *replacement* no aísla el efecto de los datos.
- La condición "open source + finetune factoid" no se evaluó, de modo que la conclusión sobre afinado se limita a una ablación.
- `factoid_finetuned` es menos compacto (921,7 características para el 80 %) pese a mejorar ligeramente en *replacement* y *completeness*; el autor advierte de no interpretarlo como evidencia general de que el afinado sea mejor.
- Licencia "other" sin texto de licencia en la información disponible: es imprescindible verificar las condiciones antes de cualquier uso, y además hereda las restricciones de la licencia comunitaria de Llama-3.2-1B.
- Idiomas soportados no declarados; el entrenamiento se hizo sobre NaturalQuestions y wikitext, predominantemente en inglés.
- Riesgo de alucinación no aplicable en el sentido generativo, pero los grafos de atribución son aproximaciones: la fidelidad depende de la dispersión y del método de atribución, y las métricas de *replacement* y *completeness* son proxies.
- Dependencia fuerte de la librería CLT-Forge y de su formato de checkpoint; no hay interoperabilidad declarada con otras herramientas de interpretabilidad.
- Repositorio de 45,4 GB y sin descargas ni *likes*: no hay evidencia de validación por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HowardHsuuu/dataset-specific-clts-llama-3.2-1b
- Código, scripts de preprocesamiento e informe completo del piloto: https://github.com/HowardHsuuu/dataset-specific-clt-training
- Baseline open source de circuit-tracer: https://huggingface.co/mntss/clt-llama-3.2-1b-524k
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset de preguntas factuales: `lighteval/natural_questions_clean`
- Dataset de control genérico: `Salesforce/wikitext` (`wikitext-103-raw-v1`)
