# Om22s/alexandria-qwen3-14b-rightsclean-speaker-attribution

## Resumen
Alexandria Qwen3-14B Rights-Clean Speaker Attribution es un adaptador LoRA (formato PEFT) publicado por el usuario Om22s sobre el modelo base Qwen/Qwen3-14B. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (64.225.280 parámetros, 0,4 GB en total) junto con un export GGUF, y requiere descargar el modelo base por separado.

Su función es la atribución estructurada de hablantes ("speaker attribution") en texto narrativo, pensada para flujos de producción de audiolibros. El adaptador no sigue un formato de chat convencional: responde a un prompt específico de Alexandria y debe devolver un objeto JSON `{"n","speaker"}` por cada entrada, rechazando respuestas mal formadas o incompletas.

La relevancia de esta publicación es doble. Por un lado, la model card declara que el conjunto de entrenamiento fue revisado en términos de derechos ("rights-reviewed"), seleccionado de fuentes con condiciones de redistribución documentadas, un criterio poco habitual en adaptadores de este tipo. Por otro, incluye una evaluación emparejada sobre 768 filas doradas de cuatro libros que reporta un 73,4% de acierto frente al 61,7% del modelo base, con 137 filas mejoradas y 52 regresadas (p emparejada exacta = 5,1e-10). Se distribuye bajo licencia Apache-2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen/Qwen3-14B). Rango 16, alpha 32, dropout 0,05 |
| Parametros totales | 64.225.280 (solo el adaptador; el modelo base no se incluye en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. Entrenamiento con longitud maxima de secuencia de 2048 tokens; evaluacion con presupuesto de 4096 tokens |
| Tipos de cuantizacion | Adaptador en safetensors (precision original) y export GGUF f16 incluido (`rightsclean.f16.gguf`). Cuantizaciones del modelo base: no disponible en esta informacion |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador); sujeto ademas a los terminos del modelo base Qwen/Qwen3-14B |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) y GGUF (export f16) |

## Arquitectura y entrenamiento
Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen3-14B, un transformer decoder-only denso. El adaptador no introduce cambios de arquitectura en el modelo base: se aplica como modulo PEFT de rango 16 con alpha 32 y dropout 0,05 sobre los pesos congelados del modelo de 14B. El autor no detalla en la informacion proporcionada sobre que proyecciones concretas se insertan los adaptadores ni la arquitectura interna de Qwen3-14B.

El entrenamiento se realizo durante dos epocas con tasa de aprendizaje 1e-4, longitud maxima de secuencia 2048 y semilla 20260914. La mezcla de datos fue "rights-reviewed" y se selecciono de fuentes con terminos de redistribucion documentados: PDNC, RiQuA y prosa de DraCor. El repositorio solo redistribuye los pesos del adaptador y un resumen de la receta, no los conjuntos de datos fuente. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades
- Atribucion estructurada de hablantes en texto narrativo: asigna a cada entrada un objeto JSON con los campos `n` y `speaker`.
- Salida en formato JSON estricto, un objeto por entrada, con expectativa de rechazo de respuestas mal formadas o incompletas.
- Mejora medida sobre el modelo base en la tarea concreta de atribucion (73,4% frente a 61,7% en el fixture propio).
- Compatibilidad con flujos de llama.cpp mediante el export GGUF incluido.
- Soporte de texto en ingles; no se declaran otras lenguas.
- No soporta: diarizacion de hablantes, sintesis de voz, ni conversacion general. No se declaran capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Produccion de audiolibros: asignar que personaje pronuncia cada fragmento de un manuscrito para generar despues las pistas de locucion, aprovechando que el adaptador fue entrenado especificamente para esta tarea y no para chat general.
- Preprocesado de pipelines de TTS: el JSON `{"n","speaker"}` por entrada encaja como etapa intermedia entre el texto normalizado y el motor de sintesis, con validacion de esquema aguas abajo.
- Analisis de corpus literario en humanidades digitales: etiquetar dialogos por hablante en textos de dominio publico para estudios de estilo, distribucion de turnos de palabra o caracterizacion.
- Curación de datos para entrenamiento: generar etiquetas de hablante sobre corpus narrativos con fines de redistribucion, apoyandose en el criterio "rights-reviewed" del propio adaptador.
- Verificacion de guiones y adaptaciones: comprobar de forma automatica la coherencia de la asignacion de voces en una adaptacion antes de la fase de grabacion.
- Auditoria de conjuntos ya etiquetados: usar el adaptador como segundo anotador y comparar sus salidas con las etiquetas existentes para detectar discrepancias en la rotacion de hablantes.
- Extraccion de estructura dialogal para indexacion o busqueda: convertir narracion con dialogo en registros consultables por hablante y numero de intervencion.

## Benchmarks y rendimiento

| Evaluacion | Modelo base (Qwen3-14B) | Este adaptador |
|---|---|---|
| Alexandria four-book product-window (768 filas doradas, temperatura 0, batch 25, presupuesto de 4096 tokens) | 61,7% (474/768) | 73,4% (564/768) |
| Cambios emparejados | No aplica | 137 filas mejoradas, 52 regresadas; p emparejada exacta = 5,1e-10 |

MMLU, HumanEval, GSM8K y otros benchmarks generales: no se han publicado resultados en la informacion disponible. El resultado anterior es una medicion agregada del evaluador incluido en el repositorio; no se incluyen textos fuente, respuestas crudas del modelo ni filas de evaluacion con derechos.

## Requisitos de hardware
- Adaptador: aproximadamente 0,13 GB en fp16 y 0,26 GB en fp32 (64,2 millones de parametros); el repositorio completo ocupa 0,4 GB. El overhead de VRAM del adaptador sobre el modelo base es minimo.
- Modelo base: la VRAM efectiva la determina Qwen3-14B, no el adaptador. Estimacion no publicada por el autor, calculada a partir del recuento de parametros del modelo base: en torno a 28-30 GB en fp16/bf16, 15-16 GB en 8 bits y 9-11 GB en 4 bits, mas overhead de cache KV segun contexto y lote.
- GPU recomendadas: A100 40 GB o H100 para fp16 con contexto amplio; RTX 4090 (24 GB) o A6000 (48 GB) para 8 bits; GPUs consumer de 12-16 GB solo con cuantizacion de 4 bits agresiva.
- Cabe en GPU consumer: si, en configuraciones de 4 bits sobre GPUs de 12 GB o mas, y en 8 bits sobre 24 GB. Los datos concretos de VRAM por cuantizacion dependen del runtime y no se detallan en la informacion proporcionada.
- Opciones de despliegue: transformers + peft (patron indicado en la model card), llama.cpp/Ollama mediante el GGUF f16 incluido, y servidores con soporte de adaptadores LoRA como vLLM o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado Alexandria (768 filas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-14B (base, sin adaptador) | ~14B (denso) | No disponible en la informacion | 61,7% (474/768) | No disponible (consultar terminos del modelo base) | HuggingFace |
| Este adaptador (LoRA sobre Qwen3-14B) | 64,2 M (adaptador) | No disponible en la informacion | 73,4% (564/768) | apache-2.0 | HuggingFace |
| Otros adaptadores de speaker attribution | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos sobre alternativas comparables de la misma categoria en la informacion proporcionada. La unica comparacion con cifras verificables es contra el propio modelo base.

## Limitaciones y advertencias
- El rendimiento se midio unicamente en el fixture dorado de cuatro libros de Alexandria; puede no generalizar a otros generos, idiomas, prompts o reglas de construccion de elencos.
- El adaptador no realiza diarizacion de hablantes, no sintetiza voz y no es un modelo conversacional de proposito general. Usarlo fuera del prompt estructurado previsto degrada su utilidad.
- Requiere validacion estricta de la salida: el propio autor recomienda exigir un objeto JSON `{"n","speaker"}` por entrada y rechazar respuestas mal formadas o incompletas.
- Solo declara soporte para ingles. No hay datos de comportamiento en castellano u otras lenguas.
- El adaptador no incluye el modelo base: es necesario descargar Qwen/Qwen3-14B por separado y aceptar sus terminos.
- Aunque la licencia del adaptador es Apache-2.0, la model card pide revisar la licencia vigente de cada fuente de entrenamiento (PDNC, RiQuA, DraCor) y los terminos del modelo base antes de redistribuir o usar comercialmente.
- La evaluacion es agregada y no incluye textos fuente, respuestas crudas ni filas con derechos, por lo que no es auditable externamente a partir del repositorio.
- El modelo registra 0 descargas y 0 "likes" en el momento de la consulta, sin validacion independiente por parte de terceros.
- Riesgo de alucinacion en la asignacion de hablante no cuantificado: la evaluacion reporta 52 filas que empeoran respecto al modelo base, por lo que conviene mantener una etapa de revision humana en produccion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Om22s/alexandria-qwen3-14b-rightsclean-speaker-attribution
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Conjuntos de datos citados (PDNC, RiQuA, DraCor): no se proporcionan URLs en la informacion disponible; consultar la licencia vigente de cada fuente antes de su uso.
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
