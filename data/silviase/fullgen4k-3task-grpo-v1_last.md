# Silviase/FullGen4K-3Task-GRPO-v1_last

## Resumen

FullGen4K-3Task-GRPO-v1_last es un ajuste fino multimodal de parametros completos (full-parameter) construido por el usuario Silviase sobre Qwen/Qwen3.5-2B (commit fijado `15852e8c16360a2fea060d615a32b45270f8a8fc`). El modelo resuelve tres tareas sobre documentos e imagenes completas de alta resolucion: OCR de imagen completa, seleccion de evidencia y respuesta a preguntas visuales (QA). Su pipeline declarado es `image-text-to-text`, con licencia Apache-2.0 y 2.213.241.664 parametros totales segun los pesos en safetensors.

El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) sobre tres tareas simultaneas, con una mezcla 1:1:1 sobre el dataset, 3.500 imagenes de entrenamiento y 10.500 entradas de tarea, durante 1 epoch y 2.624 pasos de optimizador. Es relevante ahora porque aplica optimizacion por refuerzo con recompensas especificas de tarea (F1 exacto/suave para OCR, F1 de conjunto exacto para evidencia y coincidencia exacta normalizada para QA) a un modelo de vision-lenguaje pequeno, un enfoque poco frecuente frente al ajuste supervisado clasico en tareas de document AI.

El autor indica explicitamente que la evaluacion esta **pendiente** y que los pesos se publicaron antes de completarla, sin reivindicar ninguna mejora de rendimiento. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); etiqueta de arquitectura `qwen3_5`, derivada de Qwen/Qwen3.5-2B. Detalle interno no disponible |
| Parametros totales | 2.213.241.664 (aproximadamente 2,2 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en el repositorio; no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-2B (commit `15852e8c16360a2fea060d615a32b45270f8a8fc`) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 8,9 GB |
| Longitud maxima de completado en entrenamiento | 4096 tokens |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer multimodal de aproximadamente 2,2 B de parametros que acepta entrada de imagen y texto y genera texto. El ajuste es de parametros completos (no LoRA ni adaptadores), realizado con GRPO sobre tres tareas con instrucciones y recompensas separadas: OCR, seleccion de evidencia y QA. La mezcla de datos es 1:1:1 sobre el dataset, con 3.500 imagenes de entrenamiento, 10.500 entradas de tarea y semilla 99, durante 1 epoch (2.624 pasos de optimizador). La configuracion de generacion fue de 8 prompts por 8 generaciones, con 2 actualizaciones de optimizador por ronda de generacion, learning rate de 5e-7, coeficiente KL de 0,02 y una longitud maxima de completado de 4096 tokens.

La innovacion principal es el esquema de recompensas especifico por tarea: para OCR se usa la media de F1 exacto y suave; para seleccion de evidencia, F1 de conjunto exacto; y para QA, coincidencia exacta normalizada sobre respuestas aceptables. Las completaciones truncadas (capped) reciben recompensa cero, lo que penaliza las salidas que agotan el presupuesto de tokens. El flujo de desarrollo usa FullGen dev con 500 imagenes y 1.500 ejemplos de tarea, y la evaluacion externa se realiza sobre JaWildText common580 (OCR) y 1.025 preguntas de QA, con la version de metricas `jawildtext-metrics v2` (2026-09-28). El autor aclara que los resultados externos son solo para reporte y no se usan para seleccionar el checkpoint, y que cualquier informe previo de F1 exacto/suave queda reemplazado por esta evaluacion.

## Capacidades

- OCR de imagen completa a alta resolucion (el nombre del modelo, FullGen4K, apunta a imagenes de hasta 4K), incluyendo metricas de caracter P/R/F1 y CER sin orden (clipped order-free) con NED como diagnostico.
- Seleccion de evidencia: identificacion del conjunto exacto de fragmentos que respaldan una respuesta dentro de un documento o imagen.
- Respuesta a preguntas visuales (VQA) sobre documentos, con normalizacion de respuestas aceptables.
- Procesamiento de entradas image-text-to-text mediante la libreria transformers.
- Acepta instrucciones especificas por tarea (OCR, evidencia y QA usan instrucciones separadas).
- Capacidad conversacional declarada en las etiquetas del repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas soportados no estan declarados.
- Modo de pensamiento explicito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Digitalizacion de facturas y formularios escaneados: el modelo esta entrenado para OCR de imagen completa, por lo que puede extraer texto de documentos de alta resolucion sin recortes previos, reduciendo el preprocesado necesario en pipelines de captura documental.
- RAG documental con verificacion de evidencia: la tarea de seleccion de evidencia permite devolver los fragmentos exactos que sustentan una respuesta, lo que facilita la trazabilidad y la auditoria de sistemas de pregunta-respuesta sobre corpus escaneados.
- QA sobre documentacion tecnica o legal digitalizada: con 1.025 preguntas de QA en la evaluacion externa prevista, el modelo esta orientado a responder preguntas ancladas en el contenido de la imagen, no en conocimiento parametrico.
- Extraccion estructurada para procesos administrativos: al combinar OCR y QA, se puede usar para convertir imagenes de documentos en campos estructurados, con verificacion posterior mediante un validador externo.
- Analisis de documentos en entornos con restricciones de privacidad: al ser un modelo de 2,2 B con licencia Apache-2.0, puede desplegarse on-premise o en edge sin enviar documentos a APIs de terceros.
- Evaluacion comparativa de tecnicas de RL para post-entrenamiento multimodal: la configuracion documentada (GRPO, tres recompensas, KL 0,02, LR 5e-7) sirve como referencia reproducible para investigacion sobre optimizacion por refuerzo en modelos de vision-lenguaje pequenos.
- Asistente multimodal ligero en aplicaciones moviles o embebidas: el tamano de 2,2 B permite inferencia en GPUs de consumo, lo que habilita escenarios de asistencia visual sobre documentos sin infraestructura de centro de datos.
- Busqueda y anotacion de conjuntos de datos OCR: la metrica de conjunto exacto para evidencia permite usar el modelo como anotador automatico de fragmentos relevantes en corpus de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica literalmente: "Pending. Weights were published before evaluation completed; no improvement claim is made." La evaluacion externa prevista cubre JaWildText common580 para OCR y 1.025 preguntas de QA, con las metricas `jawildtext-metrics v2` (2026-09-28), pero no se incluyen valores numericos en la informacion proporcionada, por lo que no se reproducen cifras que no esten verificadas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,4 GB solo para pesos, mas activaciones y cache KV; en la practica, entre 6 y 10 GB de VRAM segun la resolucion de imagen y la longitud de secuencia.
- VRAM estimada a 8 bits: aproximadamente 2,2-2,5 GB de pesos; en torno a 4-6 GB con cache y activaciones.
- VRAM estimada a 4 bits: aproximadamente 1,2-1,5 GB de pesos; en torno a 3-5 GB en total. No se distribuyen pesos cuantizados oficialmente, por lo que requeriria una conversion propia.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB son suficientes para inferencia en bf16, con mayor holgura al cuantizar.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB o L40S para lotes grandes y alta concurrencia; RTX 4090 para prototipado y despliegue de baja concurrencia.
- Consideracion sobre imagenes 4K: el numero de tokens visuales crece con la resolucion, por lo que el consumo de VRAM y el tiempo de prefill aumentan de forma notable en documentos de alta resolucion.
- Opciones de despliegue: transformers con el pipeline `image-text-to-text` (soporte declarado en el repositorio); vLLM y TGI si la arquitectura Qwen3.5 esta soportada por esas versiones; llama.cpp u Ollama solo mediante conversion a GGUF, formato que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponible.
- El repositorio ocupa 8,9 GB para 2,2 B de parametros, un tamano sensiblemente superior a los aproximadamente 4,4 GB de pesos en bf16, lo que sugiere que contiene varios exports o estados adicionales; conviene revisar los ficheros antes de descargar.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de contexto de las alternativas no se han verificado en esta busqueda y se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad de pesos |
|---|---|---|---|---|---|
| FullGen4K-3Task-GRPO-v1_last | 2,21 B | No disponible | Apache-2.0 | Ajuste GRPO multi-tarea para OCR, evidencia y QA | Safetensors en HuggingFace |
| Qwen/Qwen3.5-2B (modelo base) | No disponible en esta ficha | No disponible | Segun el repositorio del modelo base | Modelo multimodal generico preentrenado | HuggingFace |
| Qwen2.5-VL-3B-Instruct | 3,75 B | No disponible en esta ficha | Apache-2.0 | Vision-lenguaje generalista | HuggingFace, ampliamente desplegado |
| SmolVLM-Instruct | Aproximadamente 2,25 B | No disponible en esta ficha | Apache-2.0 | Vision-lenguaje compacto | HuggingFace |

No se dispone de datos de rendimiento comparables, y la busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre alternativas directas entrenadas con el mismo esquema de recompensas.

## Limitaciones y advertencias

- Evaluacion pendiente: el autor indica que los pesos se publicaron antes de completar la evaluacion y que no se reivindica ninguna mejora. Cualquier uso en produccion deberia ir precedido de una evaluacion propia sobre datos representativos del dominio objetivo.
- Sin validacion externa verificable: el repositorio muestra 0 descargas y 0 likes, por lo que no existe evidencia de la comunidad sobre su comportamiento en condiciones reales.
- Riesgo de alucinacion: en tareas de QA sobre documentos, el modelo puede generar respuestas plausibles no respaldadas por la imagen. La tarea de seleccion de evidencia ayuda a mitificarlo, pero no elimina el riesgo.
- Sesgos desconocidos: no se documenta la composicion del dataset de 3.500 imagenes mas alla de la mezcla 1:1:1 por tarea, por lo que pueden existir sesgos de dominio (tipos de documento, idioma, tipografia, calidad de escaneo) no declarados.
- Sesgos heredados del modelo base: no se documentan mitigaciones especificas respecto a los sesgos de Qwen/Qwen3.5-2B.
- Idiomas soportados no declarados: no es posible confirmar el rendimiento multilingue sin evaluacion propia.
- Longitud de contexto no declarada: los 4096 tokens corresponden al limite de completado durante el entrenamiento, no a la ventana de contexto del modelo; no deben confundirse.
- Penalizacion de salidas largas: durante el entrenamiento, las completaciones truncadas reciben recompensa cero, lo que puede sesgar el modelo hacia respuestas mas cortas de lo optimo en tareas que requieren transcripciones extensas.
- Riesgo de olvido catastrofico: al ser un ajuste de parametros completos sobre tres tareas muy especificas durante 1 epoch, pueden degradarse capacidades generales del modelo base. El coeficiente KL de 0,02 actua como regularizacion, pero su efecto no se ha cuantificado publicamente.
- Restricciones de licencia: la licencia declarada es Apache-2.0, que permite uso comercial. No obstante, conviene verificar los terminos del modelo base Qwen/Qwen3.5-2B y de los datos de entrenamiento, que no se detallan.
- Sin cuantizaciones oficiales: no se distribuyen pesos GGUF, GPTQ ni AWQ, por lo que un despliegue ligero requiere conversion y validacion propias.
- Modelo de nicho: el ajuste esta orientado a OCR, seleccion de evidencia y QA sobre imagenes; no debe esperarse un asistente multimodal generalista.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Silviase/FullGen4K-3Task-GRPO-v1_last
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Commit fijado del modelo base: `15852e8c16360a2fea060d615a32b45270f8a8fc`
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/silviase/jasset/runs/fullgen4k-3task-grpo-v1
- Fichero de configuracion del experimento citado en la model card: `experiment.json` (incluido en el repositorio)
- Nota sobre la busqueda web: la busqueda realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos corresponden a paginas sin relacion tecnica con el modelo (comercio de insectos), por lo que no se incluyen.
