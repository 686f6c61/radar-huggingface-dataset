# amiralifirouzi/dana-laya-0.3b-persian

## Resumen

Dana Laya 0.3B Persian es un modelo de decisión no autorregresivo de 322 millones de parámetros (321.908.998 según los pesos en safetensors), desarrollado por Amir Ali Firouzi como adaptación al persa del modelo base `convaiinnovations/laya-multilingual`. A diferencia de un LLM generativo, no produce texto libre: en una sola pasada hacia delante predice respuestas estructuradas y probabilidades calibradas para tres tipos de consulta (choice, noul y score). Está afinado con la técnica RLCD (Reinforcement Learning for Calibrated Decisions) sobre el dataset `amiralifirouzi/jev-data-persian`.

El modelo resuelve tareas de clasificación y decisión estructurada en persa (farsi), con soporte secundario de inglés. Su relevancia radica en que ofrece una alternativa compacta y barata computacionalmente para pipelines de clasificación, enrutamiento y verificación de afirmaciones, con un error de calibración (ECE) muy bajo (0,0406 frente a 0,2802 del modelo base) que permite usar sus probabilidades como señal fiable sin recalibración posterior.

Con solo 322M de parámetros y un repo de 0,7 GB, se puede desplegar en hardware muy modesto. La contrapartida es que no sirve para generación abierta ni conversación, y su licencia Apache 2.0 facilita el uso comercial siempre que se respete la supervisión humana en decisiones de alto impacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión no autorregresivo ("System 1"), sin generación de texto libre |
| Parámetros totales | 321.908.998 (≈322M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens como longitud máxima de secuencia de entrenamiento; no se especifica ventana de inferencia oficial |
| Tipos de cuantización | no disponible (el repo solo contiene pesos safetensors; no se listan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Persa (fa, principal), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Dana Laya es un modelo de decisión no autorregresivo derivado de Laya Multilingual, descrito por el autor como un sistema "System 1". En lugar de decodificar token a token, realiza una única pasada hacia delante y emite directamente una respuesta estructurada: selección entre opciones predefinidas (choice), predicción binaria sí/no con probabilidad asociada (noul) o una puntuación en una escala definida (score). El ajuste fino se realizó mediante RLCD (Reinforcement Learning for Calibrated Decisions), una técnica orientada a que las probabilidades predichas coincidan con la frecuencia real de acierto.

El entrenamiento se llevó a cabo sobre `amiralifirouzi/jev-data-persian`, una traducción al persa del dataset JEV que incluye además muestras en inglés para preservar la capacidad multilingüe heredada del modelo base. Los hiperparámetros reportados son: 3 épocas, tamaño de lote efectivo 64, longitud máxima de secuencia de 1.024 tokens, 5.664 actualizaciones del optimizador y un tiempo total de entrenamiento aproximado de 1,5 horas. No se documentan detalles sobre la composición exacta del dataset, el número total de tokens de entrenamiento ni la existencia de fases adicionales de RLHF o DPO.

## Capacidades

- Clasificación de texto en persa mediante preguntas estructuradas de tipo choice (selección de una respuesta entre criterios predefinidos).
- Predicción binaria sí/no con probabilidad asociada (tipo noul), donde la salida representa la probabilidad de la clase positiva.
- Puntuación en una escala definida (tipo score) para tareas de valoración o rating.
- Calibración de probabilidades aprovechable como señal directa, gracias al ajuste con RLCD.
- Análisis de sentimiento, enrutamiento de tickets de soporte, verificación de afirmaciones, NLI, reconocimiento de entidades y respuesta a preguntas, según las categorías evaluadas en el benchmark interno.
- Capacidad multilingüe limitada: persa como idioma principal e inglés como secundario.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni cadenas de pensamiento.
- No genera texto libre ni mantiene conversaciones abiertas.
- No dispone de capacidades de visión ni de audio.

## Casos de uso

- Clasificación de textos en persa: enviar un documento o mensaje como cuerpo de la consulta y formular una pregunta de tipo choice con las categorías objetivo; el modelo devuelve la categoría seleccionada en una sola pasada, sin coste de decodificación autoregresiva.
- Análisis de sentimiento: usar una consulta de tipo noul ("¿este texto tiene sentimiento negativo?") y emplear la probabilidad devuelta como umbral configurable en lugar de una etiqueta dura.
- Enrutamiento de tickets de soporte: clasificar cada ticket entrante hacia el equipo o cola correspondiente mediante preguntas de tipo choice, aprovechando la calibración para derivar a revisión humana los casos con probabilidad cercana a 0,5.
- Verificación de afirmaciones (fact-checking): plantear si una afirmación está respaldada por un contexto dado y usar la probabilidad de la clase positiva como puntuación de confianza.
- Puntuación de contenido: asignar valoraciones en escalas definidas (por ejemplo, calidad o relevancia) con el tipo score, útil para ranking o filtrado previo en pipelines de datos.
- Filtrado y moderación de contenido: formular preguntas binarias sobre si un texto cumple una política concreta, apoyándose en el bajo ECE para fijar umbrales de decisión reproducibles.
- Evaluación de inferencia de lenguaje natural en persa: comprobar si una premisa implica una hipótesis mediante preguntas binarias, dentro de tareas de comprensión textual.
- Pretratamiento en pipelines de NLP en persa: como clasificador previo de bajo coste que alimente a un LLM generativo solo en los casos que lo requieran, reduciendo el gasto total de inferencia.

## Benchmarks y rendimiento

Conjunto de validación en persa (datos reservados):

| Métrica | Modelo base | Dana Laya |
|---|---:|---:|
| Accuracy | 42,15% | 57,25% |
| Loss | 1,6828 | 0,9396 |
| ECE (error de calibración) | 0,2802 | 0,0406 |
| Brier Score (multiclase) | 0,7862 | 0,5215 |

Jev Persian Benchmark (480 preguntas, 80 escenarios):

| Tipo de pregunta | Preguntas | Modelo base | Dana Laya |
|---|---:|---:|---:|
| Choice | 240 | 58,3% | 56,7% |
| Noul (sí/no) | 160 | 63,1% | 66,2% |
| Score | 80 | 33,8% | 58,8% |
| Total | 480 | 55,83% | 60,21% |

Diferencias clave: score +25,0 puntos porcentuales, noul +3,1 puntos, choice −1,7 puntos y total +4,38 puntos.

Benchmark interno en persa (23 preguntas manuales sobre NLI, matemáticas, razonamiento, verificación de hechos, reconocimiento de entidades, respuesta a preguntas, análisis de sentimiento y sentido común):

| Modelo | Accuracy |
|---|---:|
| Modelo base | 52,17% |
| Dana Laya | 78,26% |
| Mejora | +26,09 puntos porcentuales |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 322M de parámetros): en fp32 unos 1,3 GB; en fp16/bf16 unos 0,65 GB; en int8 unos 0,32 GB; en int4 unos 0,16 GB, más el overhead del runtime.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente en la práctica; no requiere A100, H100 ni hardware de centro de datos.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU para cargas de baja concurrencia.
- Opciones de despliegue: la model card indica el uso de la librería `laya` (`pip install laya`) mediante `laya.load(...)` y `agent.predict(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, algo coherente con tratarse de una arquitectura no autorregresiva y con el formato únicamente safetensors.
- Latencia y throughput: no disponible de forma explícita; al ser no autorregresivo, la inferencia se resuelve en una única pasada hacia delante en lugar de generar token a token.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Idiomas | Accuracy (validación persa) | Licencia |
|---|---:|---|---|---:|---|
| Dana Laya 0.3B Persian | 322M | Decisión no autorregresiva | fa, en | 57,25% | Apache 2.0 |
| Laya Multilingual (base) | no disponible | Decisión no autorregresiva | multilingüe | 42,15% | no disponible |
| LLM generativos en persa | ≥ 1B típicamente | Autoregresivo generativo | fa, en | no comparable (tarea distinta) | variable |

No se dispone de datos sobre otros modelos de decisión no autorregresivos de la misma categoría que permitan una comparación directa. Los LLM generativos en persa pertenecen a una categoría funcional distinta (generación de texto libre), por lo que no se incluyen como comparación numérica.

## Limitaciones y advertencias

- El modelo no genera texto libre: es inutilizable para tareas de conversación abierta o producción de prosa.
- El rendimiento puede variar entre dominios y datos no vistos.
- El rendimiento en inglés puede diferir del modelo multilingüe original.
- Se observó una ligera regresión en la categoría choice del Jev Persian Benchmark (−1,7 puntos porcentuales frente al modelo base).
- El benchmark interno contiene solo 23 preguntas, por lo que el resultado de +26,09 puntos debe considerarse preliminar y no una medida definitiva de generalización.
- No se recomienda su uso en decisiones de alto impacto sin supervisión humana.
- Se debe validar el rendimiento sobre datos propios antes de desplegarlo en producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades y decisiones pueden ser erróneas en dominios fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponible (la model card no documenta análisis de sesgos).
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución y revisar la licencia del modelo base Laya Multilingual.
- Idiomas limitados a persa e inglés; no hay soporte documentado para otras lenguas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amiralifirouzi/dana-laya-0.3b-persian
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/amiralifirouzi/jev-data-persian
- Jev Persian Benchmark: https://github.com/ArmanJR/Jev-Persian-Benchmark
- Librería laya: `pip install laya` (no se proporciona URL de repositorio en la información disponible)
