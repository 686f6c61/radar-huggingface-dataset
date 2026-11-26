# samcaballero/denue-scian-qwen3-4b-lora

## Resumen

`samcaballero/denue-scian-qwen3-4b-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-4B` que resuelve una tarea de clasificación muy concreta: mapear el nombre de un establecimiento comercial mexicano (campo `nom_estab` del DENUE del INEGI) a un código SCIAN 2023 de seis dígitos. Lo desarrolla el usuario samcaballero como experimento de investigación para una charla técnica fechada el 26 de noviembre de 2026, y no está pensado para producción.

El interés técnico reside en que sustituye una tarea clásica de clasificación de texto (TF-IDF + regresión logística) por un LLM afinado con instrucciones, obteniendo una mejora modesta pero medible: 71,6 % de exactitud de clase frente al 69,5 % del baseline TF-IDF en un conjunto de test de 2.000 filas. El adaptador tiene un tamaño de repositorio de 0,3 GB y se distribuye con licencia Apache 2.0, lo que permite inspeccionarlo y reutilizarlo con atribución.

El modelo es relevante ahora como ejemplo reproducible de un flujo completo (dataset público del INEGI, partición por nombre normalizado, evaluación con intervalos de confianza por bootstrap, comparación contra baselines) más que por su rendimiento absoluto, que en nombres ambiguos cae a valores cercanos al 10 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre las proyecciones de atención y MLP |
| Parametros totales | 4B en el modelo base; el adaptador LoRA no se especifica en parámetros (rank 32, alpha 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó longitud máxima de 256 tokens) |
| Tipos de cuantizacion | Base en NF4 (bitsandbytes) durante entrenamiento y evaluación; el adaptador se publica en safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | es (español de México, nombres de establecimientos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-4B` (revisión `1cfa9a7208912126459214e8b04321603b3df60c`, versión instruct), un transformer decoder-only de 4.000 millones de parámetros. La LoRA tiene rango 32, alpha 32 y dropout 0, y se inyecta en las siete proyecciones lineales del bloque (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se hizo con QLoRA mediante Unsloth, con la base cuantizada en NF4 y `adamw_8bit`, lote 32, tasa de aprendizaje 2e-4 con programación lineal y 3 % de calentamiento, una época, longitud máxima de 256 tokens y semilla 42. La receta (tasa y rango) se heredó de un barrido previo sobre el modelo de 0,6B.

Los datos son 187.350 filas de entrenamiento (929 clases, con tope de 1.000 filas por clase) y 1.000 de validación, extraídas del DENUE del INEGI (Ciudad de México, edición 05/2026). Solo se usan el nombre del establecimiento y el código de actividad; nunca datos de contacto. La partición se hizo por nombre normalizado, de modo que ningún nombre aparece en dos conjuntos (train, validación, test y hard set). El cómputo total fue de 7,209 horas de GPU en una única T4 de Kaggle.

La innovación metodológica destacable no está en la arquitectura sino en la evaluación: partición estricta por nombre normalizado, intervalos de confianza al 95 % por bootstrap con 1.000 remuestreos, comparación pareada contra baselines en las mismas filas y separación explícita entre formato inválido y código inexistente. La generación es greedy con 16 tokens nuevos como máximo, plantilla de chat de Qwen3 con `enable_thinking=False`.

## Capacidades

- Clasificación de nombres de establecimientos comerciales en español (México) a códigos SCIAN 2023 de seis dígitos.
- Salida restringida a un único código de seis dígitos, sin texto adicional (0,0 % de formato inválido y 0,0 % de código inexistente en el test).
- Clasificación a nivel de sector SCIAN con 86,1 % de exactitud y macro-F1 de sector de 0,724.
- Inferencia en modo no-thinking (el prompt fuerza el bloque ` thinking` vacío).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso de forma verificada en la información disponible.
- Capacidad multilingüe: no disponible; el adaptador está entrenado solo con nombres en español de México.

## Casos de uso

- Enriquecimiento de registros del DENUE: dado un nombre de negocio sin código de actividad, el adaptador devuelve un código SCIAN candidato que puede validarse contra el catálogo oficial antes de persistirlo. Adecuado porque la salida está restringida al formato de seis dígitos y el 0,0 % de respuestas mal formadas en test reduce el trabajo de post-procesado.
- Preetiquetado para revisión humana: usar el código predicho como sugerencia en una cola de anotación, con el catálogo SCIAN como fuente de verdad del título de la clase. El 71,6 % de exactitud de clase implica que aproximadamente 3 de cada 10 sugerencias requerirán corrección, lo que sigue ahorrando tiempo frente a etiquetar desde cero.
- Agrupación a nivel de sector para analítica: aunque la clase de seis dígitos falle, la predicción a nivel de sector alcanza el 86,1 %, suficiente para agregaciones por sector en estudios exploratorios o dashboards internos.
- Comparación de pipelines de clasificación: el adaptador sirve como referencia LLM frente a TF-IDF + regresión logística en experimentos de evaluación controlada, gracias a que el autor publica la partición, las reglas de calificación y los intervalos de confianza.
- Docencia y divulgación: ejemplo reproducible de fine-tuning con QLoRA en una sola T4, con receta, hiperparámetros y resultados documentados, útil para talleres sobre PEFT y evaluación rigurosa.
- Detección de casos difíciles: los nombres ambiguos (por ejemplo, denominaciones genéricas o marcas sin giro explícito) obtienen exactitudes cercanas al 4 %, de modo que el modelo puede usarse para señalar qué registros necesitan revisión manual prioritaria.
- No recomendado para clasificación automática sin supervisión en producción: la propia model card lo declara un demo de investigación.

## Benchmarks y rendimiento

Resultados en test (2.000 filas con distribución natural, evaluadas una sola vez; intervalos de confianza al 95 % por bootstrap de 1.000 remuestreos):

| Modelo | Clase (IC 95 %) | Sector (IC 95 %) | Macro-F1 de sector | % formato inválido | % código inexistente |
|---|---|---|---|---|---|
| 4b-lr2e-4-r32 (este adaptador) | 71,6 (69,6–73,5) | 86,1 (84,6–87,6) | 0,724 | 0,0 | 0,0 |
| tfidf-lr-C10 | 69,5 (67,5–71,5) | 84,5 (83,0–86,0) | 0,678 | 0,0 | 0,0 |
| 06b-lr2e-4-r32 | 68,8 (66,8–70,9) | 84,4 (82,8–86,0) | 0,679 | 0,0 | 0,0 |
| diccionario | 8,3 (7,1–9,6) | 44,1 (42,0–46,2) | 0,034 | 0,0 | 0,0 |
| 4b-base-0shot | 0,0 (0,0–0,0) | 0,0 (0,0–0,0) | 0,000 | 22,0 | 78,0 |
| 4b-base-fewshot | 8,9 (7,7–10,2) | 23,7 (21,8–25,6) | 0,093 | 0,3 | 38,0 |

Diferencias pareadas en las mismas filas: +2,1 puntos porcentuales (IC 95 % +0,8 a +3,6) en clase y +1,5 (+0,2 a +2,8) en sector frente a TF-IDF; +2,8 (+1,6 a +3,9) en clase frente al modelo de 0,6B afinado. Sin corrección por comparaciones múltiples.

Hard set (exploratorio: 105 filas, 74 de nombres ambiguos y 31 de nombres indirectos):

| Modelo | Total (IC 95 %) | Ambiguo (IC 95 %) | Indirecto (IC 95 %) |
|---|---|---|---|
| 4b-lr2e-4-r32 | 9,5 (4,8–16,2) | 4,1 (0,0–9,5) | no disponible en la información proporcionada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 4B parámetros. En bf16 requiere aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en 4 bits (NF4) baja a unos 2,5–3 GB de pesos. El adaptador LoRA añade un tamaño despreciable (repositorio de 0,3 GB).
- GPU recomendadas: T4 (16 GB) es suficiente para inferencia en 4 bits e incluso para el entrenamiento QLoRA documentado; RTX 4090, A100 y H100 quedan sobredimensionadas para esta tarea pero permiten mayor throughput o bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización 4 bits (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores). En bf16 conviene 12–16 GB.
- Opciones de despliegue: `transformers` + `peft` (el método documentado en la model card), con la base cargada vía `device_map="auto"`. vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible; el uso de llama.cpp requeriría convertir el adaptador a GGUF, algo que el autor no publica para el 4B (solo menciona un experimento de concordancia GGUF en el 0,6B).
- Latencia y throughput: no disponibles. El entrenamiento consumió 7,209 horas de GPU en una T4 para una época sobre 187.350 filas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Clase (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| denue-scian-qwen3-4b-lora | 4B (LoRA rank 32) | no disponible (entrenado a 256 tokens) | 71,6 % | apache-2.0 | Hugging Face |
| denue-scian 0,6B (06b-lr2e-4-r32) | 0,6B (LoRA rank 32) | no disponible | 68,8 % | no disponible | no disponible |
| tfidf-lr-C10 | no es un LLM (TF-IDF + regresión logística) | n/a | 69,5 % | no disponible | baseline del proyecto |
| Qwen3-4B base (zero-shot) | 4B | no disponible | 0,0 % | apache-2.0 | Hugging Face |

La comparación con modelos generalistas de clasificación zero-shot no está disponible en la información proporcionada. El modelo base sin adaptador falla por completo en la tarea (0,0 % de clase, 22 % de formato inválido y 78 % de código inexistente en zero-shot), lo que evidencia que la capacidad proviene del ajuste fino y no del modelo preentrenado.

## Limitaciones y advertencias

- Rendimiento bajo en nombres ambiguos: 4,1 % de exactitud en el subconjunto ambiguo del hard set y 9,5 % en el total del hard set (105 filas, resultado exploratorio con intervalos amplios).
- El modelo no debe generar el título de la clase: la model card exige buscar el título en el catálogo oficial del SCIAN 2023, nunca pedírselo al modelo, para evitar alucinaciones de nomenclatura.
- Dominio restringido: entrenado solo con nombres del DENUE de Ciudad de México (edición 05/2026); el rendimiento en otras regiones, sectores o variantes dialectales no está medido.
- Idioma: únicamente español de México; no hay evaluación multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que es un experimento de investigación no apto para producción.
- Sensibilidad a la precisión de la base: los resultados se midieron con la base en NF4 y la LoRA sin fusionar; con otra precisión algunas respuestas cambian (en el 0,6B, la base en bf16 con LoRA fusionada reprodujo el 83,4 % de las respuestas de validación).
- Sin corrección por comparaciones múltiples en las comparaciones pareadas contra baselines, lo que limita la interpretación de diferencias pequeñas.
- Sesgos: no documentados en la información proporcionada; al entrenar con nombres comerciales reales, puede heredar sesgos de denominación geográfica o sectorial del DENUE.
- Riesgo de alucinación en el formato: mitigado por la regla de calificación estricta (`^[0-9]{6}$` y pertenencia al catálogo), pero el adaptador no incluye un validador interno.

## Enlaces

- Hugging Face: https://huggingface.co/samcaballero/denue-scian-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub del proyecto (referenciado en la model card, ruta `data/scian_2023_clases.csv`): no disponible la URL exacta en la información proporcionada
- Catálogo oficial SCIAN 2023 del INEGI: no disponible la URL exacta en la información proporcionada
- DENUE del INEGI (fuente de datos): no disponible la URL exacta en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
