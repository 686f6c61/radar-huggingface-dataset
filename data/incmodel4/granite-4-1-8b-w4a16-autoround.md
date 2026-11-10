# INCModel4/granite-4.1-8b-W4A16-AutoRound

## Resumen

`INCModel4/granite-4.1-8b-W4A16-AutoRound` es una version cuantizada a 4 bits del modelo `ibm-granite/granite-4.1-8b` de IBM, generada con la herramienta AutoRound de Intel. La cuantizacion emplea el esquema W4A16 (pesos de 4 bits, activaciones en 16 bits) con tamano de grupo 128 y redondeo simetrico, aplicado sobre las proyecciones de atencion y MLP, mientras que los embeddings de tokens, la `lm_head` y las capas de normalizacion se mantienen en BF16. El objetivo es reducir la huella de memoria del modelo base sin degradar de forma significativa su calidad, algo relevante para el despliegue en infraestructura con VRAM limitada.

La relevancia de esta ficha reside en que es una variante de cuantizacion, no un modelo nuevo: hereda la arquitectura, el tokenizador y las capacidades del granite-4.1-8b original, y su interes practico esta en el compromiso entre precision y eficiencia. Segun la model card, la recuperacion media de rendimiento respecto al modelo en BF16 es del 99,07 % en el conjunto de benchmarks evaluados (PIQA, HellaSwag, MMLU y GSM8K), lo que la convierte en una opcion atractiva para servir el modelo con vLLM en GPUs de gama media.

El repositorio tiene un tamano de 5,0 GB, lo que es coherente con un modelo cuantizado a 4 bits, aunque el dato de parametros reportado por safetensors (1.477.562.368) no concuerda con el nombre del modelo (8b) ni con el modelo base declarado. Esta discrepancia debe tenerse en cuenta al planificar el despliegue y conviene verificarla contra el repositorio original de IBM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de ibm-granite/granite-4.1-8b); detalles arquitectonicos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 1.477.562.368 segun safetensors (discrepante con el nombre "8b"; no disponible el dato verificado del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el ejemplo de lm_eval usa max_length=131073, lo que sugiere contexto de 128K, pero no se confirma en la model card) |
| Tipos de cuantizacion | W4A16, group_size 128, simetrica; atencion y MLP en int4; embeddings, lm_head y normalizacion en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del granite-4.1-8b de IBM. La tecnica AutoRound optimiza el redondeo de pesos mediante descenso de gradiente con signo (signed gradient descent), en lugar de aplicar un redondeo naive. En esta variante se ejecutaron 200 iteraciones de ajuste con 128 muestras de calibracion, `seqlen` de 2048 y `group_size` de 128, ignorando la `lm_head` en el proceso de cuantizacion. Las proyecciones de atencion y MLP se almacenan en int4, mientras que los embeddings de tokens, la `lm_head` y las capas de normalizacion permanecen en BF16 para preservar la precision en las partes mas sensibles.

No se dispone de informacion sobre la composicion del dataset de entrenamiento del modelo base, el numero de tokens utilizados ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones arquitectonicas especificas del granite-4.1-8b en la informacion proporcionada. La innovacion tecnica destacable de esta variante es, por tanto, el propio esquema de cuantizacion AutoRound y su receta de calibracion.

## Capacidades

- Generacion de texto conversacional, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento y matematicas: el modelo base obtiene 92,49 en GSM8K en BF16 y 91,28 en la version W4A16, lo que indica capacidad solida para problemas aritmeticos de varios pasos.
- Conocimiento general y sentido comun: evaluado en MMLU (71,21 en W4A16) y HellaSwag (61,94 en W4A16).
- Inferencia eficiente en vLLM con soporte de KV cache en tipo automatico y `dtype` bfloat16.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante; debe verificarse en la documentacion del modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en GPUs de gama media para generacion de texto conversacional: la cuantizacion W4A16 reduce la huella de memoria frente al BF16, permitiendo servir el modelo en entornos con VRAM limitada usando vLLM con `--dtype bfloat16` y KV cache automatica.
- Asistente de resolucion de problemas matematicos: el rendimiento en GSM8K (91,28 en W4A16) lo hace adecuado para tutoria o verificacion de calculos paso a paso en aplicaciones educativas.
- Clasificacion y respuesta a preguntas de conocimiento general: con MMLU en 71,21, puede emplearse en sistemas de FAQ o recuperacion aumentada donde se requiera un modelo compacto y con licencia permisiva.
- Prototipado rapido de aplicaciones de chat: al estar en formato safetensors y ser compatible con transformers y vLLM, se integra facilmente en pipelines de desarrollo sin necesidad de conversion adicional.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia para medir la perdida de calidad de AutoRound frente a otros esquemas (GPTQ, AWQ) sobre el mismo modelo base.
- Inferencia en entornos con restricciones de coste: la licencia Apache 2.0 y el formato abierto permiten su uso comercial y su despliegue en infraestructura propia o en proveedores de inference-as-a-service compatibles con endpoints.
- Generacion de texto en lote para tareas de anotacion o sintesis de datos: el throughput de vLLM con `num_concurrent=32` en los ejemplos de evaluacion sugiere viabilidad para procesamiento por lotes.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando BF16 frente a W4A16:

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 79,05 | 78,78 | 99,66 % |
| HellaSwag | 62,84 | 61,94 | 98,57 % |
| MMLU | 71,68 | 71,21 | 99,35 % |
| GSM8K | 92,49 | 91,28 | 98,69 % |
| **Media** | **76,52** | **75,80** | **99,07 %** |

No se han publicado resultados de benchmarks adicionales (HumanEval, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,0 GB, por lo que los pesos en W4A16 caben en GPUs con 8 GB de VRAM o mas, dejando margen para KV cache y overhead del runtime.
- GPU recomendadas: para produccion con contexto largo, se recomiendan GPUs con 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100). Para pruebas y contextos cortos, una RTX 3060 de 12 GB o una RTX 4070 de 12 GB pueden ser suficientes.
- Cabe en GPU de consumo: si, en modelos con 8-12 GB de VRAM para contextos moderados; el contexto de 128K sugerido por los ejemplos de evaluacion incrementaria notablemente el consumo de KV cache.
- Opciones de despliegue: vLLM 0.33.0 con transformers 5.20.2 segun la model card; no se confirma soporte de llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles de forma explicita; los ejemplos de evaluacion usan `num_concurrent=32` y `max_gen_toks=2048`, pero no se reportan metricas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| INCModel4/granite-4.1-8b-W4A16-AutoRound | 1.477.562.368 (safetensors, discrepante) | no disponible | W4A16 AutoRound | Apache 2.0 | Hugging Face |
| ibm-granite/granite-4.1-8b (BF16) | no disponible | no disponible | ninguna (BF16) | Apache 2.0 | Hugging Face |
| Otras variantes cuantizadas del mismo modelo base | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de informacion sobre alternativas comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; no debe usarse como fuente de verdad sin verificacion.
- Riesgo de generar contenido soez, sesgado u ofensivo, segun advierte la propia model card; se recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- La discrepancia entre el numero de parametros reportado por safetensors (1.477.562.368) y el nombre del modelo (8b) es una senal de alarma que debe verificarse contra el repositorio original antes de usarlo en produccion.
- La cuantizacion W4A16 introduce una perdida de calidad media del 0,93 % en los benchmarks evaluados; en tareas fuera de esa distribucion la degradacion podria ser mayor.
- No se confirman capacidades de tool calling, agentes o multilinguesmo en esta variante; dependen del modelo base y deben validarse empiricamente.
- La licencia Apache 2.0 permite uso comercial, pero la model card incluye un descargo de responsabilidad que recomienda consultar a un abogado antes de usos comerciales.
- El contexto maximo real no esta documentado en la model card; los ejemplos de evaluacion usan `max_length=131073`, pero conviene confirmarlo con el modelo base.
- La version de vLLM y transformers requerida (0.33.0 y 5.20.2) es especifica y puede no estar disponible en todos los entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INCModel4/granite-4.1-8b-W4A16-AutoRound
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound (arXiv 2309.05516): https://arxiv.org/abs/2309.05516
