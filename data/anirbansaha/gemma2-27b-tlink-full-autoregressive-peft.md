# AnirbanSaha/gemma2-27b-tlink-full-autoregressive-peft

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador PEFT de tipo LoRA entrenado sobre `google/gemma-2-27b-it` para una tarea muy concreta: la clasificación de relaciones temporales (TLINK, *temporal link*) entre eventos. El adaptador ha sido desarrollado por el usuario AnirbanSaha y se distribuye exclusivamente como pesos LoRA, por lo que es necesario cargar primero el modelo base de 27.000 millones de parámetros y aplicar después el adaptador con `PeftModel.from_pretrained(...)`.

La tarea de destino es la clasificación de cuatro etiquetas discretas: `BEFORE`, `AFTER`, `OTHER` y `NONE`, que codifican la relación temporal entre dos eventos de un texto. El entrenamiento se realizó sobre el dataset `fahmidiqbal/tlink-classification`, con una configuración de LoRA de rango 16, alpha 32, dropout 0,05 y una longitud máxima de secuencia de 4096 tokens. Se utilizó una variante de entrada etiquetada como `full` y arquitectura autorregresiva, con precisión bfloat16 y sin cuantización.

El interés de esta ficha es limitado pero específico: se trata de un artefacto de investigación de nicho, con cero descargas y cero *likes* en el momento de la consulta, sin model card extendida, sin licencia declarada y sin resultados de evaluación publicados. Es relevante únicamente para quien necesite reproducir o reutilizar un clasificador de relaciones temporales basado en un LLM grande, o para quien estudie adaptadores LoRA sobre Gemma 2 en tareas de clasificación estructurada en lugar de generación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma 2); variante de modelado etiquetada por el autor como `autoregressive` |
| Parametros totales | No disponible (adaptador LoRA; el repositorio ocupa 0,5 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base `google/gemma-2-27b-it` soporta 8192 tokens. El entrenamiento uso `max_length` de 4096 |
| Tipos de cuantizacion | Ninguna en el adaptador (`quantized: false`); el modelo base admite cuantizacion de terceros (GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | No disponible (el modelo base Gemma 2 esta orientado principalmente al ingles) |
| Licencia | No disponible en el repositorio. El modelo base se rige por los terminos de uso de Gemma de Google |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-2-27b-it |
| Metodo PEFT | LoRA (`lora_r`: 16, `lora_alpha`: 32, `lora_dropout`: 0,05) |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Dataset de entrenamiento | fahmidiqbal/tlink-classification |
| Etiquetas | BEFORE, AFTER, OTHER, NONE |
| Epocas | 1,0 |
| Learning rate | 0,0001 |
| Weight decay | 0,01 |
| Batch global efectivo | 8 (micro batch 1 por GPU, acumulacion de gradiente 4, world size 2) |
| Warmup | 223 pasos |
| Semilla | 42 |
| Precision de entrenamiento | bfloat16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 2 27B, un transformer decoder-only de 27.000 millones de parametros desarrollado por Google, entrenado sobre 13 billones de tokens y que combina atencion local con ventanas deslizantes y atencion global en capas alternas, ademas de destilacion de conocimiento desde modelos mayores. Sobre esa base se insertan matrices de bajo rango en los siete modulos lineales habituales (las proyecciones de atencion q, k, v, o y las proyecciones del MLP gate, up, down), con rango 16 y alpha 32. No se congelan capas adicionales ni se anaden modulos nuevos (`modules_to_save: []`), de modo que la unica capacidad modificada es la respuesta del modelo ante el formato de entrada de la tarea TLINK.

El entrenamiento consistio en una unica epoca sobre el dataset `fahmidiqbal/tlink-classification`, con una tasa de aprendizaje de 1e-4, decaimiento de peso de 0,01, acumulacion de gradiente de 4 pasos y un batch global efectivo de 8, repartido en dos procesos (world size 2). Se empleo bfloat16 sin cuantizacion y una longitud maxima de 4096 tokens, con 223 pasos de calentamiento. La model card no documenta ninguna innovacion tecnica adicional (decodificacion especulativa, RLHF, DPO ni fases de alineamiento posteriores); se trata, por tanto, de un ajuste supervisado directo orientado a una clasificacion de cuatro clases.

## Capacidades

- Clasificacion de relaciones temporales entre eventos en texto, con cuatro etiquetas de salida: `BEFORE`, `AFTER`, `OTHER` y `NONE`.
- Variante de entrada `full`, segun la nomenclatura del autor, aplicada a la tarea TLINK.
- Modelado autorregresivo: la salida se produce como continuacion de texto, no mediante una cabeza de clasificacion dedicada.
- Hereda las capacidades generales del modelo base `google/gemma-2-27b-it` (generacion de texto, razonamiento, codigo, matematicas), aunque el ajuste LoRA las especializa hacia la tarea de clasificacion.
- Soporte de tool calling / function calling: no confirmado para el adaptador (el modelo base `-it` lo contempla de forma generica, pero no se documenta para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo *thinking*, vision, audio): no documentadas.

## Casos de uso

- Anotacion de relaciones temporales en corpus clinicos o legales: el adaptador clasifica si un evento precede, sucede o es independiente de otro, lo que permite construir lineas de tiempo automaticas a partir de historiales o expedientes.
- Extraccion de estructuras temporales en noticias: dado un par de eventos detectados por un sistema previo de extraccion de eventos, el modelo asigna `BEFORE`/`AFTER` para reconstruir la cronologia de una noticia.
- Preprocesamiento para sistemas de *question answering* temporal: las relaciones TLINK generadas pueden alimentar indices temporales que mejoren las respuestas a preguntas del tipo "que ocurrio antes de X".
- Investigacion en procesamiento de lenguaje natural temporal: sirve como punto de comparacion frente a clasificadores clasicos (por ejemplo, basados en BERT) al emplear un LLM de 27B con LoRA.
- Construccion de grafos de eventos: los cuatro tipos de etiqueta permiten poblar aristas de un grafo dirigido de eventos, util en resumen temporal y analisis de narrativas.
- Reproduccion de experimentos academicos: al publicarse la configuracion completa de LoRA (rango, alpha, modulos objetivo, hiperparametros y semilla), permite replicar el ajuste sobre el mismo dataset.
- Fine-tuning incremental: el adaptador puede servir como punto de partida para experimentos posteriores de LoRA sobre Gemma 2 27B en tareas de clasificacion estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye exactitud, F1 ni ninguna otra metrica sobre el dataset `fahmidiqbal/tlink-classification`, y no se han encontrado evaluaciones externas en la busqueda web.

## Requisitos de hardware

- VRAM para inferencia: el adaptador anade un consumo marginal; el coste dominante es el modelo base `google/gemma-2-27b-it`. En bfloat16 requiere aproximadamente 54 GB de VRAM; en cuantizacion de 8 bits, en torno a 27-30 GB; en 4 bits, alrededor de 14-16 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para inferencia en bfloat16 sin cuantizar y con contexto completo; A100 40 GB o L40S 48 GB para bfloat16 con secuencias mas cortas; RTX 4090 24 GB, RTX 3090 24 GB o L4 24 GB unicamente con cuantizacion de 4 bits.
- Consumer GPU: si cabe en GPU de consumo (RTX 3090, RTX 4090, y en general tarjetas con 24 GB o mas) siempre que se aplique cuantizacion de 4 bits al modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar primero el modelo base. Es compatible con `transformers` + `peft`. Para servicio de alto rendimiento, vLLM admite adaptadores LoRA sobre modelos base compatibles; llama.cpp y Ollama no soportan este adaptador directamente salvo que se fusione con el modelo base y se convierta a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles. El entrenamiento se realizo con `micro_batch_per_gpu` de 1 y `world_size` de 2, pero no se especifica el hardware utilizado.
- Almacenamiento: el repositorio del adaptador ocupa 0,5 GB; el modelo base en bfloat16 ocupa del orden de 54 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnirbanSaha/gemma2-27b-tlink-full-autoregressive-peft | Adaptador LoRA sobre 27B | 8192 (base); 4096 en entrenamiento | Clasificacion TLINK (4 clases) | No disponible | Adaptador PEFT en HuggingFace, 0 descargas |
| AnirbanSaha/gemma2-2b-tlink | Adaptador LoRA sobre 2B | No disponible | Clasificacion TLINK | No disponible | Adaptador PEFT en HuggingFace |
| google/gemma-2-27b-it | 27B | 8192 | Generacion de texto e instrucciones de proposito general | Terminos de uso de Gemma | Pesos abiertos en HuggingFace |

No se dispone de datos de rendimiento para ninguno de los tres, por lo que la comparacion se limita a parametros, contexto, tarea y licencia.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base `google/gemma-2-27b-it` cargado previamente, el adaptador no es utilizable.
- Ambito restringido: esta especializado en una unica tarea de clasificacion con cuatro etiquetas; su uso fuera de TLINK degrada las capacidades generativas del modelo base.
- Ausencia de evaluacion: no se publican metricas de exactitud, F1 ni matrices de confusion, por lo que no es posible estimar su calidad real.
- Licencia no declarada: el repositorio no especifica licencia. El modelo base esta sujeto a los terminos de uso de Gemma de Google, que imponen restricciones de uso comercial y de redistribucion que deben verificarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: al formular la clasificacion como generacion autorregresiva, el modelo puede producir etiquetas fuera del conjunto {BEFORE, AFTER, OTHER, NONE} o texto adicional, y requiere un paso de validacion posterior.
- Idiomas: no se documenta ningun conjunto de idiomas soportados; el modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Sesgos: no se han documentado analisis de sesgo para este adaptador.
- Datos de entrenamiento: una sola epoca sobre un dataset no descrito en detalle en la model card; no se indica el numero de ejemplos ni la composicion de clases, lo que dificulta evaluar el equilibrio del ajuste.
- Cero adopcion: con 0 descargas y 0 *likes*, no existe evidencia comunitaria de que el adaptador funcione correctamente ni de que se haya validado de forma independiente.
- Reproducibilidad parcial: se documentan semilla, hiperparametros y version de entrada, pero no el hardware de entrenamiento ni la version exacta de las librerias.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/AnirbanSaha/gemma2-27b-tlink-full-autoregressive-peft
- Modelo base `google/gemma-2-27b-it`: https://huggingface.co/google/gemma-2-27b-it
- Dataset de entrenamiento `fahmidiqbal/tlink-classification`: https://huggingface.co/datasets/fahmidiqbal/tlink-classification
- Variante de menor tamano `AnirbanSaha/gemma2-2b-tlink`: https://huggingface.co/AnirbanSaha/gemma2-2b-tlink
- Modelo base preentrenado `google/gemma-2-27b`: https://huggingface.co/google/gemma-2-27b
- Model card oficial de Gemma 2: https://ai.google.dev/gemma/docs/core/model_card_2
- Paper tecnico de Gemma 2: https://arxiv.org/html/2408.00118v3
