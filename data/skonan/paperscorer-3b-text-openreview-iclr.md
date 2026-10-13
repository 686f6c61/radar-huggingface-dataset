# skonan/PaperScorer-3B-Text-OpenReview-ICLR

## Resumen

PaperScorer-3B-Text-OpenReview-ICLR es un ajuste fino supervisado (SFT) del modelo Qwen2.5-3B-Instruct, publicado por el autor skonan en el marco del proyecto PaperScorer (zlab-princeton). Su única función es predecir, a partir del texto de un manuscrito científico, si el artículo sería aceptado o rechazado en ICLR, devolviendo la etiqueta `\boxed{Accept}` o `\boxed{Reject}`.

El modelo tiene 3.085.938.688 parámetros, es de arquitectura densa (transformer decoder-only de la familia Qwen2) y se distribuye en safetensors bajo licencia "other". El repositorio ocupa 13,6 GB, un tamaño superior al de una copia en precisión de 16 bits de sus parámetros, lo que conviene tener en cuenta al planificar el almacenamiento y la descarga.

Su relevancia es doble. Por un lado, convierte una tarea de juicio experto, costosa y difícilmente reproducible, en una señal automática con probabilidades calibrables (logprobs en la posición del token de decisión). Por otro, forma parte de una colección de ocho modelos diseñados explícitamente para medir hasta qué punto la aceptación en conferencias es predecible, con comparaciones previstas entre {3B, 7B} × {texto, visión} × {arxiv, openreview-iclr}. El trabajo asociado se cita como artículo de NeurIPS 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2; ajuste SFT sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (≈3,09 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; el entrenamiento usa cutoff_len de 24.480 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | other (consultar los términos del repositorio y la licencia del modelo base) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Datos de entrenamiento | iclr-21k, partición balanceada 85/5/10 |
| Checkpoint | step 2644, final de la época 4 de 4 (convención "3B → ep4") |
| Framework de entrenamiento | LLaMA-Factory + FSDP2 |
| Tamaño del repositorio | 13,6 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

Se trata de un fine-tune completo por supervisión del modelo instructivo Qwen2.5-3B-Instruct, es decir, un transformer decoder-only denso sin mezcla de expertos. El entrenamiento se hizo con LLaMA-Factory y FSDP2 sobre el conjunto iclr-21k con una partición balanceada 85/5/10 (entrenamiento, validación y test), con los siguientes hiperparámetros declarados: tasa de aprendizaje 1e-6, planificador cosine_then_constant (decay_ratio 0,75, min_lr_rate 0,001), tamaño de lote 32 y cutoff_len de 24.480 tokens. El checkpoint publicado corresponde al paso 2644, al final de la época 4 de 4.

El modelo se formula como una conversación sharegpt de tres turnos (system, human, gpt). El mensaje de sistema es idéntico en los ocho modelos de la colección ("You are an expert academic reviewer tasked with evaluating research papers."), mientras que el preámbulo de usuario cambia según el dominio de entrenamiento; en esta variante indica que se va a predecir el resultado de aceptación en ICLR y recuerda que la tasa de aceptación ronda el 30 %. La decisión se lee del token enmarcado en `\boxed{}` y, para calibrar, de los logprobs en esa posición, que corresponde al quinto token generado bajo la plantilla `qwen`. La puntuación de calibración es `logprob(Accept) − logprob(Reject)` y el umbral se seleccionó sobre la partición de validación balanceada de ICLR.

## Capacidades

- Predicción binaria de aceptación o rechazo de artículos científicos en el estilo de ICLR, a partir únicamente del texto del manuscrito.
- Salida con probabilidad calibrable: además de la etiqueta textual, expone logprobs en la posición del token de decisión, lo que permite fijar umbrales y analizar incertidumbre.
- Procesamiento de entradas largas, con cutoff de entrenamiento de 24.480 tokens, suficiente para absorber el cuerpo completo de muchos artículos convertidos a markdown.
- Ingesta de PDF anonimizado, directorio de fuentes LaTeX o identificador de arXiv, a través del orquestador PaperScorer (paperprep más servidor de scoring y interfaz web).
- Servicio como API compatible con OpenAI mediante vLLM, apto para integración programática y procesamiento por lotes.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés y el corpus de entrenamiento son artículos en inglés.
- Tool calling / function calling: no disponible (no se documenta ni se entrena para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible; el uso previsto es de una sola pasada pregunta-respuesta.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponibles en esta variante (la colección sí incluye variantes de visión, pero no este checkpoint).

## Casos de uso

- Triaje de envíos en comités de programa: el modelo puntúa cada manuscrito con una probabilidad de aceptación y permite priorizar la asignación de revisores o detectar envíos claramente fuera de rango antes de la revisión humana, aprovechando que procesa el texto completo del artículo en una sola pasada.
- Autoevaluación previa al envío por parte de autores: un grupo de investigación puede ejecutar `paperscorer run` sobre su PDF anonimizado para obtener una señal temprana de aceptabilidad y detectar debilidades estructurales antes de enviar a una conferencia del perfil ICLR.
- Investigación sobre predictibilidad de la revisión por pares: la colección está diseñada para comparaciones controladas entre tamaño (3B frente a 7B), modalidad (texto frente a visión) y dominio (arXiv frente a OpenReview-ICLR), lo que permite estudiar cuánta señal de la decisión final está contenida en el propio documento.
- Estudios de sesgo y calibración en procesos editoriales: al exponer logprobs y tasas de aceptación predichas, el modelo sirve para auditar correlaciones entre resultado predicho y variables del manuscrito, siempre con supervisión humana y sin usar la salida como decisión final.
- Filtrado por lotes en pipelines editoriales o repositorios de preprints: desplegado con vLLM, permite procesar grandes volúmenes de documentos y etiquetarlos con un coste marginal bajo, dejando la decisión final a editores o revisores.
- Segunda opinión para revisores: un revisor puede contrastar su valoración preliminar con la probabilidad calibrada del modelo, útil para detectar casos límite donde la impresión inicial y la señal automática divergen.
- Integración en herramientas internas de gestión de conferencias: el servidor FastAPI del orquestador expone endpoints `/submit`, `/submit_latex`, `/submit_arxiv` y `/status`, lo que facilita conectar la puntuación a un sistema de envío existente sin escribir el preprocesado desde cero.
- Docencia y formación en escritura científica: usar la probabilidad de aceptación como termómetro aproximado en talleres de redacción de artículos, acompañado de explicaciones humanas sobre las limitaciones del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto `iclr-balanced-test`, con umbral de calibración fijado en `iclr-balanced-val`. La puntuación es `logprob(Accept) − logprob(Reject)` en la posición del token de decisión; `pA` es la tasa de aceptación predicha y `A_rec` / `R_rec` el recuerdo de aceptar y de rechazar.

| Conjunto | n_test | Exactitud | AUC | pA | Recuerdo aceptar | Recuerdo rechazar |
|---|---|---|---|---|---|---|
| iclr-balanced-test | 1667 | 67,1 % | 0,717 | 55 % | 72,4 % | 61,7 % |

Son resultados en distribución. No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas fuera de distribución.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): en bf16/fp16, en torno a 6,2 GB para 3,09 mil millones de parámetros; en int8, aproximadamente 3,5 GB; en int4, alrededor de 2,2 GB. Estimaciones de ingeniería, no cifras publicadas por el autor.
- A la VRAM de los pesos hay que sumar el KV cache, que crece con la longitud de entrada. Con contextos cercanos al cutoff de 24.480 tokens el coste adicional es del orden de 1 GB en precisión de 16 bits (estimación), por lo que conviene reservar margen.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para servicio cómodo en bf16 con contexto largo; A100 40/80 GB o H100 para lotes concurrentes y mayor throughput.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o una RTX 4070 de 12 GB pueden ejecutar el modelo en bf16 o int8 con contextos moderados; en 8 GB es necesario cuantizar a int8/int4 o reducir la longitud de entrada.
- Opciones de despliegue documentadas: vLLM (`vllm serve skonan/PaperScorer-3B-Text-OpenReview-ICLR --task generate --gpu-memory-utilization 0.85`), servidor FastAPI del orquestador PaperScorer con interfaz web en el puerto 8003 y modo headless de una sola ejecución (`paperscorer run`). Para entrenamiento o reajuste, LLaMA-Factory con FSDP2.
- No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia; no hay datos publicados de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaperScorer-3B-Text-OpenReview-ICLR | 3,09B | cutoff de entrenamiento 24.480 tokens; contexto nativo no disponible | Clasificación aceptar/rechazar en ICLR a partir de texto | other | HuggingFace, repositorio de 13,6 GB, 0 descargas y 0 likes en el momento de la consulta |
| Qwen2.5-3B-Instruct (base) | 3,09B | no disponible en la información proporcionada | Instrucciones generales de propósito general | licencia propia del modelo base (consultar) | HuggingFace |
| Variantes hermanas de la colección PaperScorer (7B, texto/visión, arxiv/openreview) | 7B según la colección | no disponible | Misma tarea de predicción de aceptación, otros dominios o modalidad | no disponible | HuggingFace, colección zlab-princeton/paperscorer |
| PaperScorer-3B de dominio arXiv | 3,09B | no disponible | Misma tarea, dominio arXiv | no disponible | HuggingFace, colección zlab-princeton/paperscorer |

El autor advierte de una asimetría relevante entre variantes: los modelos entrenados con ICLR vieron unos 21.000 ejemplos, mientras que los entrenados con arXiv acumulan una diferencia de datos de aproximadamente 3×, por lo que cualquier comparación directa entre ambas familias debe corregir ese desequilibrio. No se han publicado en la información disponible cifras de rendimiento de las variantes hermanas.

## Limitaciones y advertencias

- Dominio único: se entrena exclusivamente con datos de ICLR/OpenReview. La tasa de aceptación asumida (~30 %) y los patrones aprendidos pueden no transferirse a otras conferencias, revistas o áreas.
- Solo inglés. No hay evidencia de funcionamiento con manuscritos en otros idiomas.
- Exactitud del 67,1 % y AUC de 0,717 en distribución: aproximadamente uno de cada tres casos se clasifica mal. Fuera de distribución el rendimiento será previsiblemente peor.
- El umbral de calibración se fijó en `iclr-balanced-val`; cualquier despliegue real debería revalidarlo con datos propios antes de tomar decisiones operativas.
- Riesgo de alucinación y de formato: el modelo puede generar texto adicional. El parseo debe apoyarse en el token `\boxed{}` o en los logprobs de la quinta posición generada bajo la plantilla `qwen`, no en heurísticas de texto libre.
- Formato de prompt estricto: conversación sharegpt de tres turnos, con un mensaje de sistema fijo y un preámbulo de usuario que difiere según el dominio de entrenamiento. Desviarse de esa plantilla degrada la calidad de la predicción.
- Truncación: el cutoff de entrenamiento es de 24.480 tokens. Los documentos más largos se recortan y no se documenta el comportamiento del modelo en ese escenario.
- Licencia "other": no es una licencia estándar de permisos claros. Antes de un uso comercial hay que revisar los términos del repositorio y la licencia del modelo base.
- Sesgos: el modelo aprende las correlaciones presentes en el proceso de revisión de ICLR, incluidas posibles correlaciones espurias con área temática, longitud, estilo de escritura u origen de los autores. No debe emplearse como sustituto de la revisión por pares ni como decisión automatizada final.
- Asimetría de datos entre las variantes ICLR y arXiv de la colección (~3×), que invalida comparaciones directas sin ajuste.
- Tamaño del repositorio (13,6 GB) superior al de los pesos en 16 bits, con el coste de descarga y almacenamiento que implica.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en HuggingFace. El soporte de la comunidad es prácticamente inexistente.
- Idioma de la documentación y del prompt: inglés. La interfaz y las instrucciones del orquestador también están en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-3B-Text-OpenReview-ICLR
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Colección PaperScorer (8 modelos y 2 datasets): https://huggingface.co/collections/zlab-princeton/paperscorer
- Repositorio del orquestador PaperScorer (paperprep, servidor de scoring y UI web): https://github.com/zlab-princeton/PaperScorer
- Artículo asociado: Konan, S., Liu, J. y Liu, Z., "PaperScorer: How Predictable Is Paper Acceptance?", NeurIPS 2026 (no se proporciona URL en la información disponible)
