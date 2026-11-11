# netprojects/Laplace-1-Atlas-GGUF

## Resumen

Laplace-1-Atlas es un modelo de decisión de 27B parámetros desarrollado por Juneo Lab sobre la base de Qwen3.8-27B. Su propósito no es la generación de texto libre, sino la evaluación de candidatos: recibe un estado, una pregunta y un conjunto de opciones etiquetadas, y devuelve una distribución de probabilidad sobre esas opciones en un único forward pass. Esto lo hace adecuado para tareas como asignar la propiedad de una tarea, determinar permisos de acceso, decidir si actuar o preguntar primero, o validar si un resultado cumple un estándar. También puede predecir el siguiente estado de un entorno descrito.

Esta ficha documenta la versión GGUF publicada por NetProjects (Internet Projects Ltd), que no tiene afiliación con Juneo Lab ni con Alibaba Cloud. La publicación incluye cuantizaciones Q6_K, Q8_0 y Q4_K_M, además de un proyector de visión `mmproj` en f16, lo que permite el uso con imágenes a través de llama.cpp. El modelo base tiene 26.895.998.464 parámetros según los safetensors del repositorio original.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de decisión de 27B en hardware de consumo y en Apple Silicon mediante llama.cpp, con una degradación mínima respecto a bf16 según las mediciones del autor de la cuantización. El modelo está etiquetado con `apache-2.0` y con los tags `decision-making`, `agents` y `agent-safety`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); detalles completos no disponibles en la información proporcionada |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | GGUF: Q6_K (22.1 GB), Q8_0 (28.6 GB), Q4_K_M (16.5 GB); proyector de visión f16 (0.9 GB); MLX 6-bit en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base; MLX 6-bit en repositorio separado |

## Arquitectura y entrenamiento

El modelo base es JuneoAI/Laplace-1-Atlas (revisión `cf6ea86`), descrito por el autor como un modelo de decisión de 27B construido sobre Qwen3.8-27B. La información disponible no detalla la arquitectura interna más allá de su origen en la familia Qwen3.8, por lo que no se puede confirmar si emplea atención lineal, decodificación especulativa u otras innovaciones. El entrenamiento se realizó, según la model card original citada, sobre un conjunto de datos denominado Decision Forge; no se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

La innovación operativa principal no está en la arquitectura sino en la interfaz de uso: el modelo se emplea como un clasificador de candidatos. Las opciones se etiquetan con letras y la distribución de probabilidad se obtiene leyendo las probabilidades del siguiente token correspondientes a esas letras, en un solo forward pass. El autor de la cuantización documenta que, con `temperature` negativa, llama-server devuelve el softmax plano de los logits, de modo que las probabilidades de las letras coinciden con la lectura directa de los logits. Estas probabilidades son relativas a los candidatos aportados y no constituyen una probabilidad calibrada de acierto.

## Capacidades

- Evaluación de candidatos: devuelve una probabilidad por cada opción suministrada (hasta 26, etiquetadas de la A a la Z) en un único forward pass.
- Toma de decisiones sobre permisos y propiedad de tareas: permite decidir quién debe poseer una tarea, quién puede ver qué, si actuar o preguntar primero, o si un resultado cumple el estándar.
- Predicción del siguiente estado de un entorno: recibe las reglas del entorno como mensaje de sistema y el estado y la acción como JSON.
- Modo de pensamiento desactivable: el ejemplo de uso emplea `enable_thinking: false` en `chat_template_kwargs`, lo que sugiere soporte de un modo de razonamiento explícito opcional.
- Capacidad de visión: el repositorio incluye un proyector `mmproj-Laplace-1-Atlas-f16.gguf` que se necesita únicamente para procesar imágenes.
- Integración con agentes: los tags `agents` y `agent-safety` indican un diseño orientado a sistemas agénticos y a la seguridad de los mismos.
- Compatibilidad con endpoints: el tag `endpoints_compatible` y el uso de `/v1/chat/completions` indican compatibilidad con la API de estilo OpenAI servida por llama-server.
- Generación de texto conversacional: la pipeline declarada es `text-generation` y el tag `conversational` está presente.

## Casos de uso

- Control de acceso y permisos: dado un estado con permisos y una solicitud, el modelo devuelve la probabilidad de permitir o denegar; el sistema que lo integra aplica después sus comprobaciones deterministas de permisos y autenticación.
- Asignación de tareas en sistemas multiagente: se le pasa el estado del sistema y las descripciones de los agentes candidatos, y devuelve qué agente debería poseer la tarea, lo que permite enrutar trabajo en pipelines agénticos.
- Validación de resultados contra un estándar: se comparan candidatos como "cumple" y "no cumple" junto con el resultado y el criterio, y la probabilidad resultante se usa como señal para aceptar o escalar la revisión.
- Predicción de transiciones de entorno: con las reglas del entorno como mensaje de sistema y el estado y la acción en JSON, el modelo estima el siguiente estado, útil en simulación y planificación.
- Decisión de actuar o preguntar: en asistentes con herramientas, el modelo puede puntuar la opción de ejecutar una acción frente a la de solicitar aclaración antes de proceder.
- Moderación y triaje con imágenes: gracias al proyector `mmproj` en f16, puede incorporar imágenes al estado de decisión en flujos de revisión visual, siempre que el despliegue cargue el proyector.
- Despliegue local en estación de trabajo: con el archivo Q4_K_M (16.5 GB) o Q6_K (22.1 GB) puede ejecutarse en una máquina con suficiente memoria unificada o VRAM, integrándose vía `llama-server` en herramientas internas.

## Benchmarks y rendimiento

Los datos disponibles corresponden a JevBench (231 ítems públicos, niveles easy, original y hard, licencia MIT), medidos con pensamiento desactivado y comparando el candidato de mayor probabilidad con la respuesta esperada. Se ejecutaron en un MacBook Pro M5 Max de 128 GB el 11 de noviembre de 2026 con llama.cpp build 11960 (commit `8642541b2`).

| Archivo | Precisión global | easy | original | hard | Misma respuesta top que bf16 | KL media frente a bf16 |
|---|---|---|---|---|---|---|
| Q8_0 | 92,2% | 48/48 | 71/72 | 94/111 | 230/231 | 0,003 |
| Q6_K | 91,8% | 48/48 | 71/72 | 93/111 | 231/231 | 0,009 |
| Q4_K_M | 92,6% | 48/48 | 71/72 | 95/111 | 227/231 | 0,020 |
| bf16 (MLX, referencia) | 91,8% | 48/48 | 71/72 | 93/111 | — | — |

El autor indica además que el helper de puntuación, ejecutado contra el archivo Q4_K_M, devuelve la misma elección y probabilidades que puntuar el mismo prompt tokenizado con el tokenizer original. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM o memoria unificada estimada: Q4_K_M requiere aproximadamente 16,5 GB para los pesos, más overhead de contexto; Q6_K, unos 22,1 GB; Q8_0, unos 28,6 GB. El proyector de visión añade 0,9 GB.
- El repositorio completo ocupa 68,2 GB, por lo que conviene descargar solo el archivo cuantizado necesario.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada. Por tamaño, Q4_K_M y Q6_K encajan en GPUs de consumo de gama alta con 24 GB o más de VRAM, y en equipos Apple Silicon con memoria unificada amplia; Q8_0 requiere alrededor de 32 GB.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones Q4_K_M y Q6_K en tarjetas de 24 GB o superiores, sujeto al contexto configurado.
- Opciones de despliegue: llama.cpp (`llama-server`), con compatibilidad con endpoints de estilo OpenAI (`/v1/chat/completions`, `/tokenize`, `/apply-template`, `/completion`). Para Apple Silicon existe una build MLX 6-bit en repositorio separado. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. Las pruebas se realizaron en un MacBook Pro M5 Max de 128 GB, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de decisión comparables ni de resultados cruzados con alternativas de la misma categoría. La comparación más directa disponible es con el propio modelo base sin cuantizar:

| Modelo | Parámetros | Contexto | JevBench | Licencia | Formato |
|---|---|---|---|---|---|
| Laplace-1-Atlas (bf16, MLX) | 26,9B | no disponible | 91,8% | apache-2.0 | MLX bf16 |
| Laplace-1-Atlas Q6_K (GGUF) | 26,9B | no disponible | 91,8% | apache-2.0 | GGUF |
| Laplace-1-Atlas Q8_0 (GGUF) | 26,9B | no disponible | 92,2% | apache-2.0 | GGUF |
| Laplace-1-Atlas Q4_K_M (GGUF) | 26,9B | no disponible | 92,6% | apache-2.0 | GGUF |

No hay datos disponibles para comparar con modelos de decisión de otros autores.

## Limitaciones y advertencias

- El modelo aconseja; el sistema decide. La model card original recomienda mantener comprobaciones deterministas de permisos, autenticación y registro de auditoría.
- Las probabilidades devueltas son relativas a los candidatos suministrados y no están calibradas como probabilidad de acierto; deben calibrarse los umbrales sobre decisiones propias en un conjunto de validación antes de automatizar.
- Para acciones irreversibles o críticas en materia de seguridad, finanzas, medicina o legal, debe mantenerse una persona en la decisión final.
- Riesgo de alucinación: no se documenta de forma específica en la información disponible, pero es inherente a los modelos de lenguaje; el uso como clasificador de candidatos mitiga parcialmente este riesgo al restringir la salida a las opciones aportadas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; la model card no detalla cobertura lingüística.
- Longitud de contexto: no disponible; el ejemplo de despliegue emplea 8192 tokens, pero no se confirma el máximo del modelo.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento en la model card original.
- Esta publicación GGUF no está afiliada a Juneo Lab ni a Alibaba Cloud; los datos de entrenamiento, evaluación completa y limitaciones deben consultarse en la model card original.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Laplace-1-Atlas-GGUF
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Build MLX 6-bit: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- JevBench: https://github.com/fstandhartinger/jevbench
- Publicador: https://netprojects.com
