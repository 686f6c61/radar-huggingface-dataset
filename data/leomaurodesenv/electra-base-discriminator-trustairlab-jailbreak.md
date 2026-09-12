# leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak

## Resumen

`leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak` es un clasificador de texto obtenido por ajuste fino (*fine-tuning*) de `google/electra-base-discriminator`, un transformer encoder bidireccional de 109.483.778 parametros. El autor publica los pesos en formato safetensors bajo licencia Apache 2.0, con la libreria Transformers y la cabecera de clasificacion anadida para una tarea de clasificacion de secuencias. El repositorio no incluye descripcion del conjunto de datos: la model card indica literalmente que el modelo se entreno sobre un *dataset* desconocido, por lo que la unica informacion verificable es la metrica de evaluacion declarada (accuracy 0,9388 y loss 0,1905).

Por el nombre del repositorio (`trustairlab-jailbreak`) se infiere que la tarea objetivo es la deteccion de prompts de *jailbreak*, es decir, clasificar entradas de usuario que intentan eludir las salvaguardas de un modelo generativo. Esta inferencia no esta confirmada en la documentacion del autor: ni el numero de clases, ni las etiquetas, ni la composicion del corpus de entrenamiento aparecen descritos. Es relevante ahora porque los *guardrails* de entrada basados en encoders pequenos (100-200 M de parametros) son la alternativa habitual a los clasificadores basados en LLM: se ejecutan en CPU o en una GPU de gama media con un coste por peticion muy bajo y pueden filtrar trafico antes de que llegue al modelo generativo.

Se trata, por tanto, de una publicacion de tipo experimental: cero descargas y cero *likes* en el momento de redactar esta ficha, sin resultados en el campo `model-index` de la model card y con hiperparametros de entrenamiento documentados solo de forma automatica por el Trainer de Hugging Face. Cualquier uso en produccion exige una validacion propia sobre datos representativos del dominio destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ELECTRA, rama discriminadora); 12 capas, hidden size 768, 12 cabezas de atencion, FFN de 3072. Datos heredados de `google/electra-base-discriminator` |
| Parametros totales | 109.483.778 (dato real del safetensors) |
| Longitud de contexto | 512 tokens (limite de posiciones del modelo base ELECTRA-base; no se documenta ninguna modificacion) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos Transformers en safetensors (presumiblemente fp32); no se publican artefactos cuantizados ni GGUF/ONNX |
| Idiomas soportados | No disponible en la model card. El tokenizer del modelo base es WordPiece con vocabulario de 30.522 piezas entrenado principalmente en ingles, por lo que el comportamiento fuera del ingles no esta garantizado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 2,6 GB (muy superior a los ~0,44 GB de los pesos en fp32, lo que sugiere la presencia de checkpoints intermedios u otros artefactos) |
| Pipeline declarado | `text-classification` |
| Modelo base | `google/electra-base-discriminator` |

## Arquitectura y entrenamiento

La arquitectura es la de ELECTRA en su variante discriminadora: un encoder Transformer bidireccional de 12 capas con hidden size 768 y 12 cabezas de atencion, preentrenado con el objetivo de *replaced token detection*, en el que el discriminador aprende a distinguir tokens sustituidos por un generador en lugar de predecir tokens enmascarados. Sobre ese backbone, el ajuste fino anade una cabeza de clasificacion de secuencia; el dato de 109.483.778 parametros confirma que se conserva el backbone completo mas la cabeza. El preentrenamiento y el vocabulario proceden del checkpoint original de Google; no hay ninguna innovacion arquitectonica documentada en este repositorio (sin atencion lineal, sin decodificacion especulativa, sin mezcla de expertos).

El entrenamiento se realizo con el Trainer de Hugging Face y estos hiperparametros: learning rate 2e-05, scheduler lineal con 50 pasos de *warmup*, optimizador `adamw_torch_fused` (betas 0,9/0,999, epsilon 1e-08), batch de entrenamiento 8, batch de evaluacion 8, `gradient_accumulation_steps` 2 (batch efectivo 16), semilla 42 y 10 epochs planificadas. La tabla de resultados publicada solo cubre 5 epochs y 3.025 pasos, lo que implica aproximadamente 605 pasos por epoch; con un batch efectivo de 16, el conjunto de entrenamiento tendria del orden de 9.700 ejemplos por epoch (calculo derivado de los hiperparametros, no confirmado por el autor). No se documenta composicion del dataset, numero total de tokens, ni si hubo RLHF, DPO o cualquier otra fase de alineacion; para una tarea de clasificacion supervisada esas fases no son de aplicacion directa. El autor tampoco identifica que checkpoint concreto se subio al Hub: la perdida de evaluacion declarada en la cabecera (0,1905) coincide con la de la epoch 2 (0,1904) y no con la de la ultima epoch registrada (0,2416), lo que impide saber si los pesos publicados corresponden al mejor checkpoint, al ultimo o a uno intermedio.

## Capacidades

- Clasificacion de texto: devuelve logits sobre un numero de clases no especificado en la model card. Por el nombre del repositorio se infiere una tarea de deteccion de prompts de *jailbreak*, presumiblemente binaria, pero la etiquetacion no esta documentada.
- Deteccion de entradas adversarias orientadas a eludir salvaguardas de modelos generativos, segun la inferencia anterior. La accuracy declarada es 0,9388 sobre el conjunto de evaluacion del autor.
- Inferencia de baja latencia en CPU o GPU de gama baja, gracias a los 109 M de parametros y a una ventana maxima de 512 tokens.
- No dispone de generacion de texto: es exclusivamente un encoder discriminador con cabeza de clasificacion.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes, planificacion ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo *thinking*.
- Capacidades multilingues: no documentadas y poco probables, dado el tokenizer del modelo base.

## Casos de uso

- Filtrado de entrada en un *chatbot*: el clasificador se situa delante del modelo generativo y etiqueta cada turno de usuario; los prompts marcados como *jailbreak* se bloquean o se derivan a un flujo de revision antes de consumir tokens del LLM principal. Con 109 M de parametros el coste de este filtro es marginal frente al del modelo generativo.
- *Guardrail* en una API de inferencia: integrado como paso previo en la pasarela (FastAPI, Envoy, Kong), clasifica el cuerpo de la peticion en milisegundos y rechaza peticiones con HTTP 4xx antes de encolar el trabajo en el servidor de inferencia.
- Moderacion en aplicaciones de chat de terceros: clasificacion por lotes de los mensajes historicos para etiquetar conversaciones problematicas y alimentar paneles de moderacion; la ventana de 512 tokens es suficiente para turnos individuales.
- *Red teaming* y evaluacion de seguridad: ejecutar el clasificador sobre un corpus de ataques conocidos para medir la tasa de deteccion por familia de ataque (role-play, codificacion, ofuscacion) y detectar los patrones que se le escapan.
- Analisis de corpus de *jailbreaks* in-the-wild: etiquetado automatico de datasets de prompts recopilados de la web, con umbral de decision ajustable, para estudiar la evolucion temporal de las tecnicas de evasion.
- Anotacion asistida y curacion de datos: pre-etiquetar grandes volumenes de texto y enviar solo los casos con probabilidad intermedia a revision humana, reduciendo el coste de anotacion de un corpus de seguridad.
- Pre-filtro economico antes de un clasificador mayor: cuando existe un modelo de seguridad mas caro (basado en LLM o en un encoder grande), este modelo descarta primero los casos claramente benignos y reserva el modelo caro para los casos dudosos.
- Aumento de datos sinteticos: usar los falsos negativos detectados en el corpus para generar nuevas variantes de ataque y ampliar el conjunto de entrenamiento de futuros clasificadores.

## Benchmarks y rendimiento

La model card declara el campo `model-index` con una lista de resultados vacia (`"results": []`), por lo que no hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro *benchmark* estandar publicado. Las unicas metricas disponibles son las del conjunto de evaluacion propio del autor:

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9388 | Evaluacion (declarada en la cabecera de la model card) |
| Loss | 0,1905 | Evaluacion (declarada en la cabecera de la model card) |
| Mejor accuracy observada | 0,9392 (epoch 3, paso 1.815) | Validacion |
| Mejor loss observada | 0,1904 (epoch 2, paso 1.210) | Validacion |

Curva de entrenamiento publicada por el autor:

| Training loss | Epoch | Step | Validation loss | Accuracy |
|:---:|:---:|:---:|:---:|:---:|
| 0,2734 | 1.0 | 605 | 0,2173 | 0,9359 |
| 0,1792 | 2.0 | 1210 | 0,1904 | 0,9384 |
| 0,2315 | 3.0 | 1815 | 0,2045 | 0,9392 |
| 0,1664 | 4.0 | 2420 | 0,1956 | 0,9379 |
| 0,0775 | 5.0 | 3025 | 0,2416 | 0,9388 |

La metrica de evaluacion es plana (rango de 0,0033 puntos entre la peor y la mejor epoch) mientras la perdida de entrenamiento cae de 0,2734 a 0,0775, lo que indica sobreajuste a partir de la epoch 2 y ausencia de mejora real en generalizacion. No se dispone de resultados comparativos con otros clasificadores de *jailbreak* en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 438 MB en fp32 (109.483.778 parametros x 4 bytes), 219 MB en fp16/bf16 y 109 MB en int8.
- Memoria adicional por activaciones: depende del batch y de la longitud de secuencia; con lotes grandes (32-64) y secuencias de 512 tokens en fp32 el consumo puede ascender a varios GB, aunque sigue siendo muy inferior al de un modelo generativo.
- Cabe en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso en GPUs con 4 GB de VRAM. Tambien es viable la inferencia en CPU para lotes pequenos o moderados.
- GPUs de datacenter (A100, H100) no son necesarias; solo tendrian sentido para servir muchas peticiones concurrentes con lotes grandes.
- Opciones de despliegue: `transformers` de forma nativa (pipeline `text-classification`). El repositorio no incluye artefactos GGUF, ONNX ni TensorRT, por lo que llama.cpp u Ollama no soportarian la cabeza de clasificacion sin una conversion previa; lo mismo aplica a vLLM y TGI, cuyo soporte para este checkpoint concreto no esta documentado. Una conversion a ONNX con Optimum es la via habitual para reducir latencia en CPU.
- Latencia y throughput: no se han publicado medidas en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la informacion proporcionada. A modo de referencia de categoria, los clasificadores de seguridad de entrada mas habituales son encoders de tamano comparable o algo superior (por ejemplo los basados en DeBERTa-v3 o en mDeBERTa), pero no se han confirmado sus parametros, licencias ni metricas dentro de esta ficha, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Metricas publicas | Disponibilidad |
|---|---|---|---|---|---|
| `leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak` | 109.483.778 | 512 tokens | apache-2.0 | Accuracy 0,9388 en su propio conjunto de evaluacion | Hugging Face, safetensors |
| `google/electra-base-discriminator` (modelo base, sin ajustar) | 109.483.778 | 512 tokens | apache-2.0 | No aplica (modelo preentrenado) | Hugging Face, safetensors |
| Clasificadores de *prompt injection* / *jailbreak* basados en DeBERTa-v3 | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Clasificadores de seguridad basados en mDeBERTa | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No se han encontrado en la busqueda web resultados relacionados con el modelo; los enlaces devueltos correspondian a contenido sin relacion (turismo en Suiza).

## Limitaciones y advertencias

- Conjunto de entrenamiento no documentado: el autor indica que se entreno sobre un *dataset* desconocido, por lo que no puede evaluarse la representatividad de la distribucion de entrenamiento ni el riesgo de sesgo por composicion del corpus.
- Numero de clases y etiquetas no especificados: la model card no describe la cabeza de clasificacion. Antes de usarlo hay que inspeccionar `config.json` e `id2label` para confirmar que la tarea es la esperada.
- Sobreajuste: la perdida de entrenamiento cae de 0,2734 a 0,0775 mientras la accuracy de validacion se mantiene plana en torno a 0,938, lo que sugiere que el modelo ha memorizado el conjunto de entrenamiento.
- Discrepancia en las metricas reportadas: la cabecera declara loss 0,1905 (valor de la epoch 2) mientras la ultima epoch de la tabla muestra 0,2416. No se sabe que checkpoint se publico.
- Riesgo de evadir el clasificador: los detectores de *jailbreak* basados en encoders son vulnerables a ataques adversarios (sufijos optimizados, ofuscacion, cambios de idioma, codificacion en base64). No hay ninguna evaluacion de robustez publicada.
- Riesgo de falsos positivos: un clasificador de seguridad agresivo puede bloquear consultas legitimas (investigacion de seguridad, contenido medico o legal sensible); el umbral de decision debe calibrarse con datos propios.
- Idioma: no se documentan idiomas soportados. El tokenizer del modelo base esta entrenado principalmente en ingles, por lo que el rendimiento en castellano u otras lenguas no esta garantizado.
- Longitud de contexto: 512 tokens. Las entradas mas largas se truncan, lo que puede eliminar la parte del prompt que contiene la intencion maliciosa.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia. El modelo base `google/electra-base-discriminator` tambien es Apache 2.0, por lo que no hay restricciones adicionales de herencia.
- Ausencia de soporte de la comunidad: cero descargas y cero *likes*, sin issues ni validaciones independientes. No debe desplegarse en produccion sin una evaluacion propia.
- No es un modelo generativo: no puede sustituir a un LLM ni ofrecer explicaciones; solo devuelve puntuaciones por clase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak
- Modelo base: https://huggingface.co/google/electra-base-discriminator
- Paper de ELECTRA (Clark et al., 2020): https://arxiv.org/abs/2003.10555
- Repositorio de referencia del dataset TrustAIRLab (identificador no confirmado en la informacion disponible): https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados obtenidos no guardaban relacion con el modelo.
