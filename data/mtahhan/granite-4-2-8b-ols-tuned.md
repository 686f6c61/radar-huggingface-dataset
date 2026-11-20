# mtahhan/granite-4.2-8b-ols-tuned

## Resumen

`granite-4.2-8b-ols-tuned` es un ajuste fino mediante LoRA del modelo `ibm-granite/granite-4.2-8b` de IBM, publicado por el usuario mtahhan. El adaptador está especializado en la respuesta a preguntas sobre documentación de OpenShift, dentro de la campaña de calidad del brazo CPU de OpenShift LightSpeed (OLS) fechada el 20 de noviembre de 2026. No es un modelo de propósito general, sino un task-tune orientado a un dominio técnico muy concreto.

El modelo base es un transformer denso de aproximadamente 8.790 millones de parámetros (8,79 B según los pesos safetensors del repositorio). El adaptador LoRA entrenable es muy pequeño en comparación: 49,5 millones de parámetros, un 0,56 % del total. El repositorio ocupa 17,8 GB e incluye el adaptador bajo el subdirectorio `adapter/`, con licencia Apache 2.0 heredada del modelo base.

Su relevancia es acotada pero clara: sirve como pieza de un pipeline RAG (retrieval-augmented generation) para asistencia documental de OpenShift, desplegable con vLLM en CPU o GPU y con el modo de razonamiento desactivado (`enable_thinking: false`). No sustituye a un asistente general y no ha pasado evaluaciones de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base IBM Granite 4.2) con adaptador LoRA |
| Parametros totales | 8.791.592.960 (8,79 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 65.536 tokens en servicio (según ejemplo de despliegue con `--max-model-len 65536`) |
| Tipos de cuantizacion | No disponible en la información proporcionada (el adaptador se distribuye en safetensors; la cuantización depende del despliegue) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA en `adapter/`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre `ibm-granite/granite-4.2-8b`, un transformer denso de 8,79 B parámetros. El adaptador se configura con rango r=16, alpha 32 y aplicación a todas las capas lineales (`all-linear`), lo que da 49,5 millones de parámetros entrenables (0,56 % del total). El entrenamiento se realizó en bf16, con 3 épocas, learning rate 1e-4 con decaimiento coseno y longitud máxima de secuencia de 2048 tokens.

El conjunto de datos consta de 1.642 pares pregunta-respuesta extraídos de la documentación de OpenShift, provenientes de los datasets parquet de `lightspeed-evaluation`, en formato system/user/assistant. El autor indica que se verificó que este conjunto es disjunto del slice de evaluación usado para medir el ajuste. La pérdida descendió de 1,46 a 0,67 en 309 pasos. Un detalle importante: el entrenamiento fue pregunta-a-respuesta sin pasajes recuperados en el contexto, de modo que enseña hábitos de precisión en la respuesta, no extracción a partir de contexto; el autor prevé una versión v2 condicionada a pasajes.

## Capacidades

- Respuesta a preguntas sobre documentación de OpenShift, en formato de respuesta final para pipelines RAG.
- Generación de texto y respuesta conversacional multi-turno heredadas del modelo base Granite 4.2.
- Despliegue con vLLM en CPU o GPU, con nombre de modelo servido configurable (`hybrid-model`).
- Control del modo de razonamiento mediante `enable_thinking` en los kwargs de la plantilla de chat (se recomienda desactivarlo).
- Capacidades de tool calling, agentes y multilingüismo: no documentadas para este ajuste concreto; dependen del modelo base y no se han verificado aquí.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de documentación de OpenShift: el modelo actúa como escritor de respuesta final en un pipeline RAG, recibiendo la pregunta del usuario y devolviendo una respuesta precisa sobre la documentación de OpenShift. Es su propósito declarado.
- Integración en OpenShift LightSpeed: encaja en la campaña de calidad del brazo CPU de OLS, sirviendo respuestas en entornos sin GPU.
- Despliegue en CPU con vLLM: al ser un adaptador sobre un modelo de 8,79 B y poder servirse en CPU, es adecuado para clústeres donde no hay aceleradores disponibles.
- Base para ajustes de dominio posteriores: el adaptador LoRA (r=16, all-linear) sirve como punto de partida para especializar el modelo en otra documentación técnica con un coste de entrenamiento bajo.
- Evaluación comparativa de ajustes de tarea: útil para medir el efecto de un task-tune pequeño (0,56 % de parámetros) frente al modelo base en tareas de Q&A documental.
- Prototipado de asistentes técnicos internos: con contexto de hasta 65.536 tokens, puede manejar conversaciones con historial largo o documentación extensa inyectada en el prompt, siempre que se validen sus respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta la evolución de la pérdida de entrenamiento (de 1,46 a 0,67 en 309 pasos) y menciona una evaluación sobre un slice disjunto, pero no se incluyen métricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud para un modelo denso de 8,79 B, en bf16 requeriría aproximadamente 17,6 GB solo para pesos, más overhead de KV cache; en cuantizaciones de 8 o 4 bits bajaría sustancialmente, pero no se han publicado cifras para este ajuste.
- GPU recomendadas: no especificadas por el autor. El despliegue documentado es con vLLM en CPU o GPU.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; dependería de la cuantización elegida.
- Opciones de despliegue: vLLM (documentado por el autor, con `--max-model-len 65536` y `enable_thinking: false`). Otras opciones como llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-8b-ols-tuned | 8,79 B (LoRA 49,5 M entrenables) | Hasta 65.536 tokens en servicio | Q&A de documentación OpenShift | Apache 2.0 | Hugging Face (repo de adaptador) |
| ibm-granite/granite-4.2-8b (base) | 8,79 B | No disponible en esta ficha | Propósito general | Apache 2.0 | Hugging Face |
| Alternativas de Q&A documental de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sin pasajes recuperados en el contexto: aprende precisión en la respuesta, no extracción desde contexto; para RAG real puede requerir la versión v2 condicionada a pasajes que el autor prevé.
- No evaluado en seguridad: el autor lo declara explícitamente; no debe usarse como asistente general sin salvaguardas adicionales.
- No es un asistente de propósito general: su uso previsto es la respuesta a preguntas sobre documentación de OpenShift.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de lenguaje, persiste el riesgo, especialmente fuera de su dominio de entrenamiento.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base IBM Granite 4.2.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado; tratar como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/mtahhan/granite-4.2-8b-ols-tuned
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales.
