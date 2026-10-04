# Silviase/FullGen4K-3Task-GRPO-v1_500

## Resumen

FullGen4K-3Task-GRPO-v1_500 es un ajuste fino de parametros completos (full-parameter fine-tuning) sobre el modelo base Qwen/Qwen3.5-2B, publicado por el usuario Silviase en Hugging Face. El modelo es multimodal de entrada (image-text-to-text) y esta especializado en tres tareas concretas entrenadas de forma conjunta: reconocimiento optico de caracteres (OCR), seleccion de evidencia y respuesta a preguntas visuales (visual QA). El entrenamiento se realizo mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo, con un total de 500 pasos de optimizador.

El checkpoint cuenta con 2.213.241.664 parametros (aproximadamente 2,2 mil millones), se distribuye en safetensors dentro de un repositorio de 8,9 GB y usa licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales segun los terminos de dicha licencia. El modelo esta pensado para flujos de trabajo de document understanding: extraer texto de imagenes, localizar fragmentos de evidencia y responder preguntas basadas en ese contenido.

La relevancia de esta ficha radica en que se trata de una publicacion temprana y de nicho: no tiene descargas ni interacciones registradas, la evaluacion figura como pendiente y el autor publico los pesos antes de completar dicha evaluacion, sin reclamar ninguna mejora de rendimiento. Por tanto, debe tratarse como un artefacto experimental reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal heredada de Qwen/Qwen3.5-2B (detalles especificos no disponibles) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados por el autor; el repositorio contiene safetensors (el tamano de 8,9 GB para 2,21 mil millones de parametros es coherente con precision FP32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.5-2B, sobre el que se aplico un ajuste de parametros completos (no LoRA ni adaptadores). El autor indica que el entrenamiento parte de un commit fijado del modelo base (`15852e8c16360a2fea060d615a32b45270f8a8fc`), lo que permite reproducibilidad respecto al punto de partida. Al ser un modelo de tipo image-text-to-text, incorpora componentes de vision ademas del decodificador de lenguaje, aunque la model card no detalla la configuracion interna de dichos componentes.

La innovacion principal es el procedimiento de entrenamiento con GRPO sobre tres tareas simultaneas. Los hiperparametros declarados son: 500 pasos de optimizador, objetivo de 1 epoca, 3.500 imagenes de entrenamiento y 10.500 entradas de tarea, semilla 99, 8 prompts por 8 generaciones, 2 actualizaciones de optimizador por ronda de generacion, learning rate 5e-7, coeficiente KL 0.02 y una longitud maxima de completacion de 4096 tokens. La mezcla de tareas es 1:1:1 sobre el dataset, y el sistema de recompensas es especifico por tarea: para OCR, la media de F1 exacto y F1 suave; para seleccion de evidencia, F1 de conjunto exacto; para QA, coincidencia exacta de respuesta normalizada aceptable. Las completaciones truncadas por limite de tokens reciben recompensa cero. El sufijo `500` del nombre hace referencia a actualizaciones de optimizador, no a imagenes ni a rondas de generacion.

## Capacidades

- Reconocimiento optico de caracteres (OCR): extraccion de texto a partir de imagenes, entrenado de forma explicita como una de las tres tareas.
- Seleccion de evidencia: localizacion de fragmentos o conjuntos de evidencia relevantes dentro del contenido visual o textual.
- Respuesta a preguntas visuales (visual question answering, VQA): respuestas a preguntas formuladas sobre imagenes.
- Procesamiento conjunto de imagen y texto: el pipeline declarado es image-text-to-text.
- Naturaleza conversacional: el modelo incluye la etiqueta `conversational`, por lo que admite interaccion multi-turno (alcance exacto no documentado).
- Ajuste por refuerzo con recompensas especificas por tarea, lo que orienta la generacion hacia formatos de respuesta concretos.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponibles.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede extraer texto de imagenes (OCR) como parte de un pipeline de conversion de PDF o escaneos a texto plano, aprovechando que el OCR es una de las tareas de entrenamiento explicitas.
- Busqueda documental con evidencia: dado un documento visual y una consulta, el modelo puede devolver el conjunto de fragmentos que constituyen la evidencia, util en sistemas de recuperacion aumentada donde se exige citar la fuente exacta.
- Asistencia a revision de facturas o formularios: extraccion de campos y respuesta a preguntas del tipo "cual es el importe total" sobre una imagen del documento, usando la tarea de QA visual.
- Evaluacion automatica de calidad de OCR: el propio modelo puede emplearse como componente de un banco de pruebas interno, dado que su recompensa de OCR se define mediante F1 exacto y suave.
- Moderacion o indexacion de contenido visual con texto: extraccion del texto presente en imagenes para alimentar motores de busqueda o sistemas de clasificacion internos.
- Prototipado de asistentes sobre capturas de pantalla: responder preguntas sobre la interfaz o el contenido textual visible en una captura, aprovechando la combinacion de OCR y QA.
- Investigacion en aprendizaje por refuerzo multimodal: el checkpoint y su configuracion (`experiment.json`, semilla 99, hiperparametros completos) sirven como punto de partida reproducible para estudiar GRPO multitaréa.

En todos los casos conviene recordar que la evaluacion esta pendiente y que no se ha publicado ninguna cifra de rendimiento, por lo que estos usos deben validarse empiricamente antes de llevarlos a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta pendiente (`Evaluation: Pending`), que los pesos se publicaron antes de completarla y que no se reclama ninguna mejora de rendimiento.

Como contexto de evaluacion prevista (no resultados), el autor menciona:
- Desarrollo interno FullGen: 500 imagenes / 1.500 ejemplos de tarea.
- Evaluacion externa: JaWildText common580 (OCR) y 1.025 preguntas de QA.
- Los resultados externos se declaran unicamente a efectos de reporte, no para seleccion de checkpoint.

No se dispone de valores de MMLU, HumanEval, GSM8K ni de metricas de OCR/VQA comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB en FP32 (coherente con los 8,9 GB del repositorio), unos 4,5 GB en BF16/FP16, alrededor de 2,3 GB en cuantizacion de 8 bits y en torno a 1,2 GB en 4 bits (estimaciones segun el numero de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con 16 GB o mas de VRAM para FP32 (por ejemplo, RTX 4090, A100, H100). Para BF16 bastan 8 GB.
- GPU de consumo: si, cabe en tarjetas de consumo. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutar el modelo; en configuraciones de 4 u 8 bits tambien cabria en GPUs de 6-8 GB.
- Opciones de despliegue: al ser un modelo de tipo transformers con safetensors, es compatible con librerias basadas en Hugging Face Transformers. No se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI; el tag `endpoints_compatible` sugiere que podria servirse mediante Inference Endpoints. La conversion a GGUF no esta confirmada.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FullGen4K-3Task-GRPO-v1_500 | 2,21 mil millones | No disponible | Image-text-to-text + GRPO (OCR, evidencia, QA) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B (referencia de categoria) | ~3 mil millones | 32K (segun documentacion publica del modelo) | Vision-language | Apache 2.0 (segun variante) | Ampliamente disponible |
| SmolVLM-2.2B (referencia de categoria) | ~2,2 mil millones | No disponible en esta ficha | Vision-language | Apache 2.0 | Ampliamente disponible |
| Florence-2-base (referencia de categoria) | ~0,23 mil millones | No disponible en esta ficha | Vision-language multitarea | MIT | Ampliamente disponible |

Nota: los datos de los modelos comparativos se ofrecen como referencia de categoria y pueden variar segun la version concreta; no se dispone de resultados de benchmarks de este checkpoint para establecer una comparacion cuantitativa. El modelo base Qwen/Qwen3.5-2B no cuenta con especificaciones publicas confirmadas en la informacion disponible.

## Limitaciones y advertencias

- Evaluacion pendiente: el autor publica los pesos antes de completar la evaluacion y no reclama ninguna mejora. No hay evidencia empirica publicada de su rendimiento.
- Riesgo de alucinacion: al tratarse de un modelo de 2,2 mil millones de parametros ajustado con GRPO, la generacion de texto o respuestas no presentes en la imagen es un riesgo real, especialmente fuera de las tres tareas para las que fue entrenado.
- Sesgos conocidos: no documentados. Al no disponer de informacion sobre la composicion del dataset de entrenamiento (3.500 imagenes), no puede evaluarse el sesgo de dominio ni de idioma.
- Idiomas soportados: no disponibles. No se garantiza un rendimiento multilingue mas alla de lo que herede del modelo base.
- Longitud de contexto: no disponible. La unica cifra relacionada es el limite de completacion de 4096 tokens durante el entrenamiento, que no equivale a la ventana de contexto del modelo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia correspondientes. No obstante, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B, ya que las obligaciones de la licencia del modelo derivado pueden verse afectadas por estas.
- Especializacion estrecha: el ajuste GRPO esta orientado a OCR, seleccion de evidencia y QA. Fuera de estas tareas, el rendimiento puede degradarse respecto al modelo base.
- Reproducibilidad: el autor indica que el `500` es un checkpoint nativo sellado y que no se reclama igualdad en el ciclo de exportacion (export roundtrip equality), lo que implica que una reexportacion podria no producir exactamente los mismos pesos.
- Uso en produccion: no recomendado sin una validacion previa en el dominio objetivo y sin mediciones propias de latencia, precision y tasa de alucinacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Silviase/FullGen4K-3Task-GRPO-v1_500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/silviase/jasset/runs/fullgen4k-3task-grpo-v1
- Configuracion del experimento: archivo `experiment.json` dentro del repositorio del modelo

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenido no relacionado). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo.
