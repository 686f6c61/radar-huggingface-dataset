# SHSLab/Qyvos

## Resumen

Qyvos es un modelo de decision y clasificacion desarrollado por SHSLab, construido a partir del modelo base SupersonicLabs/Julia-1 mediante un ajuste fino limitado exclusivamente a la cabeza de decision (*head-only fine-tuning*). El modelo transforma un contexto compuesto por un estado, una pregunta y una lista de opciones en una distribucion de probabilidad sobre dichas opciones, cubriendo tres tipos de decision: eleccion categorica (`choice`), puntuacion suave o reparto de masa (`score`) y decision binaria si/no (`noul`).

Arquitectura y tamano: el backbone completo esta congelado y se conserva bit a bit. Incluye un encoder ModernBERT-small de 22 capas, dimension oculta 384 y vocabulario de 256.000 tokens (140.530.432 parametros), mas una cabeza de accion auxiliar (`act_head`) tambien congelada. El total de parametros es de 144.292.870, de los cuales solo 3.699.073 (el 2,56%) fueron entrenados: la nueva cabeza de decision, un embedding de tipo y un scorer por opcion.

Su relevancia actual reside en dos aspectos. Primero, el modelo se entrena y ejecuta integramente en float32 sobre maquinas de gama baja: el entrenamiento registro un pico de memoria RSS de 1,64 GB, disenado para equipos de 8 GB. Segundo, la mejora principal del ajuste no es la exactitud top-1 (que se mantiene dentro del ruido estadistico respecto al modelo base), sino la calibracion de las probabilidades, con una reduccion del soft-target cross-entropy del 5,7% en validacion y del 6,7% en test, lo que resulta critico para consumidores que utilizan el vector completo de probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-small de 22 capas) con cabeza de decision transformer adicional |
| Parametros totales | 144.292.870 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (`max_length`), `head_length` de 512 |
| Tipos de cuantizacion | no disponible (pesos en float32, sin variante cuantizada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Julia-1 sin modificar: un encoder ModernBERT-small (22 capas, hidden 384, vocabulario 256k, 140.530.432 parametros) y una cabeza de accion auxiliar (`act_head`), ambos congelados y conservados exactos. La unica parte entrenada es la cabeza de decision, con 3.699.073 parametros: dos capas `TransformerEncoderLayer` (hidden 384, 6 cabezas, `dim_ff` 1536, `norm_first=True`), un `type_emb` de `Embedding(3, 384)` que codifica el tipo de decision y un `scorer` por opcion compuesto por `LayerNorm → Linear(384,384) → GELU → Linear(384,1)`. Los pesos se mantienen en float32 de extremo a extremo, sin cuantizacion ni poda.

El entrenamiento uso el dataset ZefanCai/Open-Jev (config `release-v2-redistributable`, split `train`, 79.116 filas disponibles), del que se consumieron 30.000 filas en orden aleatorio determinista. La funcion objetivo fue entropia cruzada sobre objetivos suaves (`-(target · log_softmax(scores)).sum(-1).mean()`), lo que entrena distribuciones de probabilidad calibradas y coincide con los vectores `target` suaves de Open-Jev. La serializacion de la secuencia es identica a la del runtime oficial de Julia (`julia.data.sequence()`), garantizando paridad entre entrenamiento e inferencia. Se utilizo el optimizador AdamW con learning rate 1e-4 (warmup lineal de 100 pasos y decaimiento lineal hasta el 10%), beta=(0,9, 0,999), weight decay 0,01 (sin decaimiento en normas ni embeddings) y recorte de gradiente 1,0, con un micro-lote de 1 y 8 acumulaciones (lote efectivo 8) durante 3.750 pasos y semilla 17.

La innovacion practica mas destacable es el diseno para equipos con RAM muy limitada (restriccion real de 3,9 GB de RAM del sistema): encoder congelado sin gradientes ni estado del optimizador, lectura de parquet por *mmap* de pyarrow leyendo un solo row-group (~1.000 filas) a la vez, tokenizacion perezosa por fila, checkpoints solo de cabeza (~45 MB con optimizador) con reanudacion por avance rapido determinista y un guardia de RAM con psutil que aborta y guarda checkpoint si la RAM disponible baja de 350 MB. El pico de RSS medido fue de 1,64 GB.

## Capacidades

- Clasificacion de decisiones sobre un conjunto de opciones: dado un estado y una pregunta, devuelve una distribucion de probabilidad sobre las opciones proporcionadas.
- Decision categorica (`choice`, qtype 0): seleccion de una unica opcion.
- Puntuacion suave (`score`, qtype 1): reparto de masa de probabilidad o gradacion sobre las opciones, util cuando la respuesta no es unica.
- Decision binaria (`noul`, qtype 2): juicio si/no con opciones ordenadas como `[no, yes]`.
- Calibracion de probabilidades: el ajuste mejora el softCE respecto al modelo base, lo que permite consumir el vector completo de probabilidades y no solo el argmax.
- Codificacion de contexto largo: ventana de hasta 1.024 tokens para el estado y la pregunta, con 512 para la cabeza.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues no disponibles.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar un ticket a una categoria amplia (por ejemplo `account` o `billing`) usando el estado (texto del usuario) y una pregunta de clasificacion con las categorias como opciones, aprovechando el tipo `choice`.
- Triaje de incidencias en un helpdesk: con el tipo `noul` se puede decidir entre escalar o no una incidencia a un humano a partir del historial y una pregunta binaria.
- Priorizacion con puntuacion suave: en lugar de asignar una unica etiqueta, el tipo `score` permite repartir probabilidad entre varias categorias, util cuando un caso pertenece a mas de un area.
- Moderacion de contenido: decision binaria si/no (`noul`) sobre si un mensaje cumple las normas, con la probabilidad calibrada para fijar umbrales operativos.
- Enrutado en pipelines de agentes: el modelo actua como modulo de decision ligero que, ante un estado y varias acciones candidatas, devuelve la probabilidad de cada opcion para que un sistema mayor elija el siguiente paso.
- Sistemas de recomendacion con puntuacion: ordenar o ponderar opciones (productos, respuestas, rutas) asignando masa de probabilidad a cada una mediante el tipo `score`.
- Despliegue en entornos de bajos recursos: al ejecutarse en float32 sobre CPU y caber en equipos de gama baja, es adecuado para inferencia local en dispositivos con recursos limitados o en el borde.
- Evaluacion de decisiones en conjuntos de datos tipo Open-Jev: sirve como componente de referencia para investigacion sobre calibracion de decisiones a partir de objetivos suaves.

## Benchmarks y rendimiento

| Modelo | Val acc (n=900) | Val softCE | Test acc (n=900) | Test softCE |
|---|---|---|---|---|
| Julia-1 base (sin entrenar) | 83,67% | 0,4542 | 83,56% | 0,4764 |
| Qyvos (30.000 filas) | 84,11% | 0,4282 | 83,11% | 0,4447 |

Confirmacion con muestra mayor para Qyvos en el split de test: n=1500 → acc 81,67%, softCE 0,4587.

Resultados por tipo de decision (Qyvos, n=900):

| Tipo | Val acc | Test acc |
|---|---|---|
| choice | 66,5% | 68,2% |
| score | 79,4% | 79,3% |
| noul | 92,7% | 90,2% |

Nota de lectura del autor: la cabeza de decision preentrenada de Julia-1 ya es fuerte en esta familia de benchmarks y las diferencias de exactitud top-1 entre base y Qyvos caen dentro del ruido de evaluacion (~±1,2 puntos de error estandar con n=900). La mejora consistente del ajuste es la calibracion de probabilidades (softCE −5,7% en validacion, −6,7% en test).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 144,3 millones de parametros en float32, el modelo ocupa aproximadamente 0,58 GB solo en pesos; la memoria total en inferencia depende del lote y la longitud de secuencia, pero es reducida.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cabe comodamente en cualquier GPU de consumo moderna.
- Compatibilidad con GPU de consumo: si. Con 144,3 M de parametros en float32, el modelo cabe en GPUs de consumo (por ejemplo, serie RTX 4090 o inferiores) e incluso en CPU.
- CPU: el modelo se ha disenado y probado explicitamente para ejecucion en CPU (`device="cpu"` en el ejemplo oficial) y para maquinas de gama baja.
- Entrenamiento: viable en equipos de 8 GB de RAM; el autor reporta un pico de RSS de 1,64 GB en un sistema con 3,9 GB de RAM.
- Opciones de despliegue: runtime oficial de Julia incluido en el repositorio (`julia.load_model`), CLI `scripts/infer_qyvos.py` con modos `--demo`, `--eval-test` y `--row`. La libreria declarada es `transformers` (compatible con endpoints). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: en `transformers >= 5.17`, la ruta rapida opcional de inferencia de julia referencia `ModernBertModel._update_attention_mask`, eliminada en versiones posteriores. Los scripts incluidos desactivan esa optimizacion con un shim de dos lineas (`specialize_decision_encoder → False`), usando el forward estandar con resultados numericamente equivalentes. En `transformers 5.0.x` (la version con la que se entreno el checkpoint) no se requiere el shim.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qyvos | 144,3 M (3,7 M entrenables) | 1.024 tokens | no disponible | HuggingFace (SHSLab/Qyvos) |
| Julia-1 (base) | 144,3 M aprox. | no disponible | no disponible | HuggingFace (SupersonicLabs/Julia-1) |
| Modelos de clasificacion tipo ModernBERT-small | ~140 M | variable segun checkpoint | variable | HuggingFace |

El unico comparable directamente documentado en la informacion disponible es el modelo base SupersonicLabs/Julia-1, del que Qyvos hereda el backbone congelado y sobre el que mejora la calibracion. No se dispone de datos comparativos con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- La mejora de exactitud top-1 respecto al modelo base esta dentro del ruido estadistico (±1,2 puntos de error estandar con n=900); no debe presentarse como una ganancia de precision.
- El techo de exactitud esta limitado por los datos: muchos objetivos de Open-Jev son intencionadamente suaves o ambiguos.
- Rendimiento desigual por tipo de decision: `choice` obtiene valores bajos (66,5%–68,2%) frente a `noul` (90,2%–92,7%), lo que desaconseja su uso en decisiones categoricas exigentes.
- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion: no disponible; al ser un modelo de clasificacion sobre opciones, la salida es una distribucion sobre opciones provistas, no texto libre.
- Limitaciones de contexto: ventana de 1.024 tokens; entradas mas largas deben truncarse o dividirse.
- Idiomas soportados: no disponibles. El ejemplo oficial esta en ingles.
- Restricciones de licencia: la licencia del modelo no esta disponible, por lo que no puede confirmarse el uso comercial. Ademas, hereda las condiciones del modelo base SupersonicLabs/Julia-1 y del dataset ZefanCai/Open-Jev (config `release-v2-redistributable`), cuyas licencias deben verificarse por separado.
- Uso en produccion: requiere respetar la nota de compatibilidad de `transformers` (shim en versiones >= 5.17) para evitar fallos en la ruta rapida opcional.
- El modelo no expone soporte de cuantizacion, tool calling ni agentes; su alcance es la clasificacion de decisiones sobre opciones.
- Metadatos de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SHSLab/Qyvos
- Modelo base Julia-1: https://huggingface.co/SupersonicLabs/Julia-1
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Repositorio de runtime de Julia: incluido en el propio repositorio de Qyvos (`pip install -e julia --no-deps`)
- CLI de entrenamiento e inferencia: `scripts/infer_qyvos.py` y carpeta `training/` del repositorio
- Paper o publicacion tecnica: no disponible
- Demo: no disponible
