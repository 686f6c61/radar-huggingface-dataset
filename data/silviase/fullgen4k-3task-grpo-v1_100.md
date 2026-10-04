# Silviase/FullGen4K-3Task-GRPO-v1_100

## Resumen

FullGen4K-3Task-GRPO-v1_100 es un ajuste fino de parametros completos (full-parameter) del modelo base Qwen/Qwen3.5-2B, publicado por el usuario Silviase en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text de aproximadamente 2.213 millones de parametros, entrenado con GRPO (Group Relative Policy Optimization) sobre tres tareas simultaneas: OCR, seleccion de evidencia y respuesta a preguntas visuales (QA). El entrenamiento parte de un commit fijado del modelo base (`15852e8c16360a2fea060d615a32b45270f8a8fc`) y se ha realizado a partir de 3.500 imagenes que generan 10.500 entradas de tarea, con una mezcla 1:1:1 entre las tres tareas.

El checkpoint publicado corresponde al paso 100 del optimizador, no a un numero de imagenes ni de rondas de generacion. La model card indica explicitamente que los pesos se publicaron antes de completar la evaluacion y que no se reclama ninguna mejora de rendimiento sobre el modelo base. El autor senala ademas que el sufijo "100" identifica un checkpoint nativo sellado de HuggingFace y que no se garantiza la igualdad tras un ciclo de exportacion y reimportacion.

Por su tamano y su enfoque en OCR y comprension visual, el modelo se situa en la categoria de VLM ligeros desplegables en hardware de consumo, pero su estado es claramente experimental: cero descargas, cero likes, evaluacion pendiente y ausencia de resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-2B; la model card no detalla la arquitectura interna) |
| Parametros totales | 2.213.241.664 (aproximadamente 2,2 mil millones) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (el unico limite documentado es `max completion` de 4.096 tokens durante el entrenamiento) |
| Tipos de cuantizacion | no documentados; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 8,9 GB |
| Modelo base | Qwen/Qwen3.5-2B |
| Pipeline | image-text-to-text |
| Fecha de creacion / actualizacion | 2026-10-03 / 2026-10-03 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base Qwen/Qwen3.5-2B, fijado en el commit `15852e8c16360a2fea060d615a32b45270f8a8fc`. La model card no describe la arquitectura interna (tipo de transformer, atencion, encoder visual o resolucion de imagen), por lo que estos detalles quedan como no disponibles en la informacion proporcionada. El entrenamiento es de parametros completos, no un ajuste con adaptadores tipo LoRA.

El procedimiento de entrenamiento es GRPO sobre tres tareas con instrucciones y recompensas especificas: OCR, seleccion de evidencia y QA, con una mezcla 1:1:1 sobre el conjunto de datos. La configuracion documentada incluye 8 prompts x 8 generaciones, 2 actualizaciones del optimizador por ronda de generacion, learning rate de 5e-7, coeficiente KL de 0,02, `max completion` de 4.096 tokens, semilla 99 y un objetivo de 1 epoca sobre 3.500 imagenes y 10.500 entradas de tarea. Las funciones de recompensa son: para OCR, la media de F1 exacto y F1 suave; para seleccion de evidencia, F1 exacto de conjunto; para QA, coincidencia exacta normalizada con respuestas aceptables. Las completaciones truncadas por el limite de tokens reciben recompensa cero. El autor advierte que la cantidad de aprendizaje puede diferir respecto a experimentos de solo OCR, y que la evaluacion externa se usa unicamente a efectos de reporte, no para seleccionar el checkpoint.

## Capacidades

- Generacion de texto conversacional sobre entrada de imagen y texto (pipeline image-text-to-text).
- OCR: extraccion de texto presente en imagenes, con recompensa basada en F1 exacto y suave.
- Seleccion de evidencia: identificacion de fragmentos o elementos de evidencia relevantes en la imagen o documento, evaluada con F1 exacto de conjunto.
- Respuesta a preguntas visuales (visual question answering), con recompensa de coincidencia exacta normalizada sobre respuestas aceptables.
- Uso conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible; no se especifican idiomas.
- Modo de razonamiento explicito (thinking mode), audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede aplicar OCR sobre imagenes de facturas, formularios o paginas escaneadas y devolver el texto extraido, ya que el OCR es una de las tres tareas sobre las que se entreno con recompensa especifica de F1.
- Busqueda documental con evidencia trazable: dado que una de las tareas es la seleccion de evidencia con recompensa de F1 exacto de conjunto, puede emplearse para localizar los fragmentos que justifican una respuesta dentro de un documento visual, util en sistemas de auditoria o cumplimiento normativo.
- Asistencia a personas con discapacidad visual: mediante QA sobre imagen, el modelo puede describir o responder preguntas sobre el contenido de una fotografia capturada por el usuario, siempre que se valide su calidad real con evaluacion propia, dado que no hay benchmarks publicados.
- Extraccion de datos de tickets y albaranes en logistica: combinacion de OCR y QA para leer un documento de transporte y responder preguntas concretas sobre importes, fechas o referencias, con un modelo de 2,2 B de parametros desplegable en hardware modesto.
- Moderacion y clasificacion de contenido visual con justificacion: la seleccion de evidencia permite senalar la region o el elemento concreto que motiva una decision, lo que facilita la revision humana posterior.
- Prototipado e investigacion en RL aplicado a VLM: el repositorio documenta la receta completa de GRPO multi-tarea (recompensas, mezcla, hiperparametros y trazas en W&B), por lo que sirve como referencia reproducible para experimentos de aprendizaje por refuerzo sobre modelos de vision y lenguaje.
- Preprocesado en pipelines RAG multimodales: convertir paginas escaneadas en texto y pares pregunta-respuesta antes de indexarlos en un sistema de recuperacion, aprovechando la ventana de generacion de hasta 4.096 tokens por respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion esta pendiente y que los pesos se publicaron antes de completarla, sin reclamar ninguna mejora. A continuacion se recoge el plan de evaluacion declarado, sin cifras:

| Conjunto de evaluacion | Tarea | Tamano | Resultado |
|---|---|---|---|
| JaWildText common580 | OCR | no disponible | pendiente |
| Evaluacion externa de QA | QA | 1.025 preguntas | pendiente |
| FullGen dev | OCR, evidencia y QA | 500 imagenes / 1.500 ejemplos de tarea | pendiente |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra referencia en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 4,4 GB solo para los pesos, mas el encoder visual, activaciones y cache KV; en la practica se recomienda un minimo de 8 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,2 GB para los pesos, con un minimo recomendable de 6 GB de VRAM.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,1 a 1,5 GB para los pesos, con un minimo recomendable de 4 a 6 GB de VRAM. Estas estimaciones son calculos a partir del numero de parametros, no datos publicados por el autor.
- GPU consumer compatibles: el modelo deberia caber en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs integradas de 8 GB o mas con cuantizacion.
- GPU de centro de datos: A100, H100, L40S o L4 son suficientes y permiten margen amplio para lotes grandes y contexto largo.
- CPU: la inferencia en CPU es teoricamente posible con cuantizacion, pero no hay datos publicados al respecto.
- Opciones de despliegue: el repositorio usa la libreria transformers y esta etiquetado como `endpoints_compatible`, por lo que es desplegable con transformers y con endpoints gestionados de HuggingFace; vLLM es una opcion habitual para modelos de este tipo, aunque no esta confirmada en la model card. No se publican pesos en GGUF, por lo que llama.cpp u Ollama exigirian una conversion previa y podrian no soportar el componente visual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos comparables en la informacion proporcionada. La comparativa se limita a lo que consta en el repositorio:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FullGen4K-3Task-GRPO-v1_100 | 2.213.241.664 | no disponible | apache-2.0 | HuggingFace, 0 descargas | Checkpoint experimental sin evaluacion publicada |
| Qwen/Qwen3.5-2B (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Origen del ajuste; commit fijado `15852e8c16360a2fea060d615a32b45270f8a8fc` |
| Otros VLM ligeros de 2 a 3 mil millones de parametros (por ejemplo, familias Qwen-VL, InternVL o SmolVLM) | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Evaluacion pendiente: el autor publica los pesos antes de completar la evaluacion y declara explicitamente que no se reclama ninguna mejora sobre el modelo base. No debe asumirse que el ajuste con GRPO mejore al checkpoint original.
- Ausencia total de benchmarks publicados: no hay resultados de MMLU, OCR, VQA ni de ningun otro conjunto en la informacion disponible.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de alucinacion: es un modelo de 2,2 B de parametros ajustado con un numero muy reducido de actualizaciones del optimizador (paso 100), por lo que la fiabilidad en QA abierto puede ser limitada y requiere verificacion en produccion.
- Idiomas no declarados: la model card no especifica idiomas soportados, por lo que el comportamiento multilingue no esta garantizado ni documentado.
- Contexto no documentado: se desconoce la longitud maxima de contexto; el unico limite conocido es el `max completion` de 4.096 tokens usado durante el entrenamiento, que no equivale a la ventana de contexto.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento (3.500 imagenes) ni sobre analisis de sesgo, por lo que se desconocen los sesgos potenciales en OCR y QA.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B por si imponen requisitos adicionales.
- Pesos solo en safetensors: no se ofrecen versiones cuantizadas ni GGUF, lo que anade trabajo de conversion para despliegues ligeros.
- Integridad del checkpoint: la model card advierte de que el sufijo "100" identifica un checkpoint nativo sellado y que no se garantiza la igualdad tras exportar y reimportar.
- Trazabilidad de la evaluacion externa: los conjuntos JaWildText common580 y el conjunto de 1.025 preguntas de QA se declaran solo a efectos de reporte y no se usaron para seleccionar el checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/Silviase/FullGen4K-3Task-GRPO-v1_100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Trazas de entrenamiento en W&B: https://wandb.ai/silviase/jasset/runs/fullgen4k-3task-grpo-v1
- Configuracion completa del experimento: archivo `experiment.json` dentro del repositorio de HuggingFace
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
