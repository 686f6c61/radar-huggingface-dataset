# OpenBuddy/OpenChoice-4B-v1

## Resumen

OpenChoice-4B-v1 es un modelo de decisión ("system-1 choice model") desarrollado por OpenBuddy que no genera texto libre, sino que **elige una opción entre 2 y 16 candidatos** proporcionados por el llamante y devuelve la etiqueta seleccionada junto con una distribución de probabilidad sobre los candidatos. Está construido a partir de Qwen/Qwen3.5-4B (el tag del repositorio es `qwen3_5_text`) y cuenta con 4.205.792.256 parámetros totales, con pesos publicados en safetensors y un tamaño de repositorio de 8,4 GB. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

El problema que resuelve es concreto: en lugar de pedir a un modelo generativo que "razone" y escriba una respuesta abierta, OpenChoice recibe un `state` (contexto), una `question` y una lista de candidatos etiquetados de `A.` a `P.`, y resuelve la elección en un único forward pass mediante una cabeza de decisión que puntúa la última posición del prompt. Esa cabecera normaliza las puntuaciones únicamente sobre los candidatos suministrados y devuelve tanto la etiqueta ganadora como las probabilidades relativas, lo que permite usarlo como reranker, enrutador o clasificador con umbrales de confianza.

Su relevancia actual es metodológica: separa el razonamiento del formato de salida y concentra el coste computacional en una sola pasada, con un modelo de 4B que puede ejecutarse en hardware de gama media. Frente a alternativas como Laya multilingual, APUS-4B y APUS-9B en las evaluaciones publicadas por el propio autor, OpenChoice-4B-v1 obtiene 112/128 en `openbuddy-choice128 v1` y 67/80 en `apus-frozen80 · choice`. La adopción pública registrada en HuggingFace es todavía mínima (1 descarga, 0 likes), por lo que debe tratarse como un modelo reciente y poco contrastado.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen/Qwen3.5-4B, con cabeza de decisión que puntúa la última posición del prompt |
| Parámetros totales | 4.205.792.256 (4,2 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamaño del repositorio | 8,4 GB |
| Modalidad de salida | etiqueta de candidato (A–P) y distribución de probabilidad sobre los candidatos suministrados |
| Número de candidatos | 2 a 16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 4,2 B de parámetros heredado de Qwen/Qwen3.5-4B (tag `qwen3_5_text`), al que se añade una cabeza de decisión específica para la tarea. Según la model card, esa cabeza puntúa la **posición final del prompt** y las puntuaciones se normalizan exclusivamente sobre los candidatos proporcionados, mapeando después la etiqueta elegida al identificador de candidato del llamante. El comportamiento es de "sistema 1": una única pasada hacia delante, sin generación autorregresiva de texto ni bucle de razonamiento multi-paso.

El prompt es parte funcional del modelo y no es opcional: utiliza los tokens de frontera de chat `<|im_start|>` / `<|im_end|>` e incluye un prefill fijo en inglés dentro del bloque `<think>`, seguido de la plantilla con `state`, `question` y los candidatos etiquetados de `A.` a `P.` en el orden suministrado. El texto del prefill es una checklist genérica de evaluación (distinguir hechos dados de inferencias, atender a negación, condiciones y cuantificadores, comparar todos los candidatos con el mismo criterio, considerar la interpretación competidora más fuerte, etc.) que, según el autor, debe mantenerse tal cual. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento; tampoco se documenta ninguna innovación adicional más allá de la cabeza de decisión y del esquema de puntuación por posición final.

## Capacidades

- Selección de una opción entre 2 y 16 candidatos a partir de un estado y una pregunta en lenguaje natural.
- Devolución simultánea de la etiqueta seleccionada y de una distribución de probabilidad normalizada sobre los candidatos, útil para umbrales de confianza y para desempates.
- Ejecución en un único forward pass (system-1), sin generación autoregresiva de texto, lo que reduce el coste frente a esquemas de "pensar y luego responder".
- Manejo del orden de presentación de los candidatos: la decisión se toma sobre el contenido, y la etiqueta se mapea de vuelta al identificador del llamante.
- Soporte de decisiones de tipo factual/descriptivo y de tipo acción recomendada, según se deduce de la plantilla de prompt.
- Idiomas declarados: inglés y chino (el prefill y los tokens de plantilla están en inglés).
- Tool calling / function calling: no documentado como tal; la elección entre descripciones de herramientas sería un uso derivado del mecanismo de selección, no una capacidad declarada.
- Agentes y razonamiento multi-paso: no disponible.
- Visión, audio, modo thinking explícito: no disponible (el bloque `<think>` es un prefill fijo de plantilla, no un modo de razonamiento generado).

## Casos de uso

- **Reranking de respuestas de un LLM generativo**: se generan N respuestas (hasta 16) con temperatura alta y se pasan como candidatos junto con el estado y la pregunta; OpenChoice devuelve la mejor y su probabilidad, permitiendo filtrar por umbral de confianza antes de servir la respuesta final.
- **Enrutado de intenciones en asistentes conversacionales**: cada intención soportada se convierte en un candidato etiquetado; el modelo resuelve la clasificación en una sola pasada de 4B, lo que abarata el enrutado previo al LLM principal.
- **Selección de herramienta en pipelines de agentes**: se listan las descripciones de las herramientas disponibles como candidatos y se usa la etiqueta devuelta como nombre de la función a invocar, con la probabilidad asociada como señal para pedir confirmación al usuario cuando sea baja.
- **Desambiguación de pasajes en RAG**: tras la recuperación, se presentan hasta 16 fragmentos como candidatos y se selecciona el que mejor responde a la pregunta dado el estado, evitando inyectar contexto irrelevante en el prompt del modelo generador.
- **Filtrado de contenido y moderación**: cada categoría de política se define como candidato; la distribución de probabilidad resultante permite aplicar cortes por categoría en lugar de una decisión binaria forzada.
- **Anotación asistida y construcción de datasets de preferencia**: para cada par o conjunto de respuestas se obtiene una elección y una probabilidad, lo que acelera el etiquetado previo a fases de DPO o RLHF sin desplegar un modelo mayor.
- **Selección de la mejor traducción entre variantes**: se generan varias traducciones en/zh y se eligen como candidatos; el modelo devuelve la mejor según el estado y la pregunta.
- **Verificación de afirmaciones en control de calidad**: dado un estado con evidencia textual, se presenta como candidatos un conjunto de afirmaciones y se selecciona la mejor soportada, con probabilidades para marcar casos ambiguos y derivarlos a revisión humana.

## Benchmarks y rendimiento

| Modelo | apus-frozen80 · choice | openbuddy-choice128 v1 |
|---|---:|---:|
| OpenChoice-4B-v1 (este modelo) | 67/80 | 112/128 |
| Laya multilingual | 37/80 | 42/128 |
| APUS-4B | 66/80 | 101/128 |
| APUS-9B | 70/80 | 107/128 |

Los resultados proceden de la model card del autor y de las configuraciones publicadas en el repositorio de evaluaciones. No se han publicado en la información disponible resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos de otras familias en estas dos tareas.

## Requisitos de hardware

- Peso de los pesos en safetensors: el repositorio ocupa 8,4 GB, coherente con un modelo de 4,2 B en precisión de 16 bits.
- VRAM estimada para inferencia (orientativa, sin datos oficiales): en torno a 9-11 GB en bf16/fp16 contando pesos y overhead; aproximadamente 5-6 GB con cuantización de 8 bits y 3-4 GB en 4 bits, siempre que se apliquen herramientas de cuantización externas.
- La memoria de la caché KV depende de la longitud de contexto efectiva, dato no disponible en la información proporcionada.
- GPU recomendadas: una RTX 4090 (24 GB), RTX 4080/4070 Ti, o GPUs de 12-16 GB para bf16 con contexto moderado; A100, H100 o L40S para lotes grandes y despliegue concurrente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, con cuantización o lotes pequeños.
- Opciones de despliegue: la model card apunta a scripts de inferencia propios basados en la plantilla y en la cabeza de decisión publicada. No se documenta soporte oficial en vLLM, llama.cpp, Ollama o TGI, y la existencia de una cabeza de decisión adicional hace probable que se requiera código específico del repositorio. No disponible el detalle de integración.
- Latencia y throughput: no disponibles. Al resolverse en un único forward pass sobre un prompt acotado, la latencia esperada es la de una prefill de transformer de 4B más el coste de la cabeza, sin decodificación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | apus-frozen80 · choice | openbuddy-choice128 v1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenChoice-4B-v1 | 4,2 B | no disponible | 67/80 | 112/128 | apache-2.0 | HuggingFace (OpenBuddy/OpenChoice-4B-v1) |
| APUS-4B | no disponible | no disponible | 66/80 | 101/128 | no disponible | citado en la model card |
| APUS-9B | no disponible | no disponible | 70/80 | 107/128 | no disponible | citado en la model card |
| Laya multilingual | no disponible | no disponible | 37/80 | 42/128 | no disponible | citado en la model card |
| Qwen/Qwen3.5-4B (modelo base) | ~4,2 B | no disponible | no evaluado en estas tareas | no evaluado en estas tareas | no disponible en la información proporcionada | HuggingFace |

Lectura de la tabla: OpenChoice-4B-v1 supera a APUS-4B y a Laya multilingual en ambas tareas y queda por debajo de APUS-9B en `apus-frozen80` (67 frente a 70) pero por encima en `openbuddy-choice128 v1` (112 frente a 107), con la mitad de tamaño aproximada respecto al modelo de 9B. No hay datos de parámetros, contexto ni licencia para APUS-4B, APUS-9B ni Laya multilingual en la información disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto libre ni mantiene conversaciones. Usarlo fuera del formato de selección entre 2 y 16 candidatos no está soportado.
- Requiere la plantilla exacta con tokens `<|im_start|>` / `<|im_end|>` y el prefill fijo en inglés dentro de `<think>`; alterar ese prefill o el orden de las secciones puede degradar el resultado.
- La salida está restringida a etiquetas `A.` a `P.`; no hay soporte documentado para más de 16 candidatos ni para candidatos sin etiquetar.
- Naturaleza de sistema 1: al no existir un bucle de razonamiento multi-paso, los errores en tareas que requieren cómputo encadenado no se corrigen internamente.
- Sesgo hacia elegir siempre un candidato: si ninguno es correcto, el modelo devuelve igualmente una etiqueta y una distribución normalizada sobre lo suministrado, sin opción explícita de "ninguno de los anteriores". Hay riesgo de alucinación de soporte cuando el estado es insuficiente.
- La model card advierte de que la incertidumbre no implica equiprobabilidad entre opciones, por lo que la distribución devuelta no debe interpretarse como calibración perfecta.
- Idiomas declarados en y zh; el resto de idiomas, incluido el español, no están soportados oficialmente.
- Longitud de contexto, datos de entrenamiento y metodología de alineamiento no documentados, lo que dificulta predecir el comportamiento en entradas largas.
- Licencia Apache 2.0 para este modelo, lo que en principio permite uso comercial; conviene verificar por separado los términos del modelo base Qwen/Qwen3.5-4B antes de un despliegue en producción.
- Adopción pública mínima (1 descarga, 0 likes en el momento de la consulta) y ausencia de validación independiente: los únicos resultados disponibles son los publicados por el propio autor.
- No se documenta soporte para tool calling nativo, agentes multi-paso, visión ni audio; cualquier uso de ese tipo sería una adaptación no validada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenBuddy/OpenChoice-4B-v1
- Repositorio OpenChoice (scripts de inferencia y datasets de evaluación): https://github.com/OpenBuddy/OpenChoice
- Resultados y configuraciones de evaluación: https://github.com/OpenBuddy/OpenChoice/tree/main/evaluations/results
- Repositorio de OpenBuddy: https://github.com/OpenBuddy/OpenBuddy
- Sitio del proyecto OpenBuddy: https://openbuddy.ai/
- Modelo relacionado de la misma familia: https://huggingface.co/OpenBuddy/SimpleChat-4B-V1
