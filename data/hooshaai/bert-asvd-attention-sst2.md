# Hooshaai/bert-asvd-attention-sst2

## Resumen

`Hooshaai/bert-asvd-attention-sst2` es una variante destilada de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `asvd_attention` de la libreria NeuralOps. El modelo resultante se ha afinado para clasificacion de sentimiento binaria sobre el split SST-2 de GLUE y se distribuye como checkpoint de clasificacion de texto con `trust_remote_code` habilitado.

El interes tecnico del checkpoint no reside en la tarea (clasificacion binaria de sentimiento, un problema resuelto) sino en el procedimiento: el autor aplica un protocolo de destilacion en dos etapas con cacheado offline de representaciones del profesor, lo que elimina la necesidad de mantener el modelo docente en VRAM durante el entrenamiento. Segun la model card, la destilacion se ejecuto en una unica RTX 3090 con un pico de 8487 MB y 200 pasos, en 50,2 segundos, alcanzando un 91,28 % de exactitud en validacion frente al 91,63 % del profesor original.

Se trata de un modelo pequeno (arquitectura BERT-base, ~110 M de parametros), monolingue en ingles y con licencia MIT, pensado como prueba de concepto de mecanismos de atencion subcuadratica y como ejemplo reproducible de destilacion eficiente en hardware de consumo. No es un modelo de proposito general: es un clasificador de sentimiento especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `asvd_attention` (subcuadratica) en las 12 capas |
| Parametros totales | ~110 M (heredados de bert-base-uncased; no se indica recuento exacto en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estandar admite 512 tokens; la model card no lo explicita) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,5 GB, libreria `neuralops`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza integramente los bloques de atencion multi-cabeza por el mecanismo `asvd_attention` de NeuralOps, descrito por el autor como atencion subcuadratica. No se detalla en la informacion disponible la formulacion matematica exacta del mecanismo ni su complejidad asintotica concreta; solo se indica que pertenece a la categoria de atencion subcuadratica y que proviene del "Attention Zoo" de la libreria.

El entrenamiento consiste en una destilacion de conocimiento sobre GLUE SST-2 con un protocolo de dos etapas y cacheado offline de representaciones: la etapa 1 alinea representaciones ocultas mediante coseno y MSE de subespacio; la etapa 2 aplica KL sobre logits de secuencia y entropia cruzada de la tarea. El profesor no necesita residir en VRAM durante el proceso. La model card reporta 200 pasos, 50,2 s de duracion, 32633,1 tokens/s y 8487 MB de pico de VRAM en una RTX 3090. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de SST-2.

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) en ingles, con logits de dos clases.
- Clasificacion de texto corto a nivel de frase, orientada a resenas y opiniones.
- Inferencia con la API estandar de Hugging Face Transformers mediante `trust_remote_code=True`.
- Carga a traves de la API de alto nivel de NeuralOps (`load_pretrained_bert` y `load_surgeried_model`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni de agentes multi-paso.
- Capacidad multilingue: limitada a ingles segun el campo `language` de la model card.

## Casos de uso

- Analisis de sentimiento en resenas de producto: el modelo clasifica frases cortas en positivo/negativo con una exactitud reportada del 91,28 % en SST-2, adecuado para pipelines de moderacion o agregacion de opiniones en ingles.
- Monitorizacion de reputacion en redes sociales: clasificacion por lotes de menciones y comentarios en ingles, con throughput alto gracias al reducido tamano del modelo.
- Etiquetado previo en pipelines de datos: uso como primer filtro para separar textos positivos y negativos antes de un modelo mayor o de anotacion humana.
- Investigacion sobre atencion subcuadratica: banco de pruebas reproducible para comparar `asvd_attention` frente a atencion estandar en una tarea controlada (SST-2) con metricas publicadas.
- Docencia y reproduccion de destilacion: ejemplo completo de destilacion en dos etapas con cacheado offline que cabe en una GPU de consumo (RTX 3090, 8,5 GB de pico).
- Clasificacion en entornos con recursos limitados: al ser un BERT-base, puede desplegarse en CPU o en GPUs de gama baja para inferencia por lotes de baja latencia.
- Baseline en experimentos de eficiencia: referencia para medir el coste real del mecanismo `asvd_attention` frente a BERT-base original en la misma tarea.

## Benchmarks y rendimiento

Evaluacion reportada por el autor sobre el split de validacion de GLUE SST-2 (872 muestras):

| Metrica | Profesor (BERT-base) | Estudiante pre-destilacion | Modelo destilado | Delta vs pre-KD |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 82,80 % | 91,28 % | +8,49 % |
| Perdida de validacion | 0,2428 | no disponible | 0,3088 | no disponible |

Telemetria de entrenamiento reportada: 200 pasos, 50,2 s, 32633,1 tokens/s, pico de VRAM 8487 MB en RTX 3090.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del checkpoint (~110 M de parametros, repo de 0,5 GB) es esperable que quepa holgadamente en GPUs de consumo, aunque el autor no publica cifras de inferencia.
- VRAM de entrenamiento reportada: 8487 MB de pico en una RTX 3090 durante la destilacion.
- GPU recomendadas: RTX 3090 (unica GPU documentada en el proceso de destilacion); para inferencia, cualquier GPU con suficiente memoria para un BERT-base.
- Cabe en GPU de consumo: si, segun el tamano del modelo; no se especifican modelos concretos mas alla de la RTX 3090.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`neuralops.hub`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (32633,1 tokens/s); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/bert-asvd-attention-sst2 | ~110 M | no disponible | 91,28 % (validacion, reportado) | MIT | Hugging Face, requiere `trust_remote_code` |
| google-bert/bert-base-uncased (profesor) | ~110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, estandar |
| DistilBERT-base-uncased-finetuned-sst-2 | ~66 M | 512 tokens | no disponible en la informacion | Apache 2.0 | Hugging Face, estandar |

La comparativa se limita a los datos aportados por el autor; no se dispone de resultados verificados independientemente para el modelo destilado ni de cifras de DistilBERT en esta ficha.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion binaria de sentimiento en ingles; no sirve para generacion ni para otras tareas.
- Requiere `trust_remote_code=True` y la libreria `neuralops`, lo que implica ejecutar codigo remoto y anade una dependencia no estandar frente a Transformers.
- La model card contiene referencias a identificadores distintos del repo (`tahamajs/bert-asvd-attention-sst2` frente a `Hooshaai/bert-asvd-attention-sst2`), lo que puede provocar errores al cargar el modelo si se copia el snippet tal cual.
- Los resultados de benchmarks son autoinformados por el autor y no se han verificado de forma independiente.
- No se documentan sesgos especificos, pero al derivar de `bert-base-uncased` y entrenarse en SST-2 hereda los sesgos del corpus de resenas de cine en ingles.
- Riesgo de alucinacion no aplicable en sentido estricto (tarea de clasificacion), pero si de calibracion deficiente en dominios distintos de resenas.
- Licencia MIT: permite uso comercial, pero el codigo remoto de NeuralOps debe auditarse antes de desplegar en produccion.
- No hay informacion sobre cuantizacion, contexto maximo efectivo ni soporte de despliegue en servidores de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-asvd-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
