# gebhart/scitbert-2015-ci

## Resumen

`gebhart/scitbert-2015-ci` es un modelo de lenguaje publicado en HuggingFace por el usuario gebhart. Por el nombre y las etiquetas del repositorio, se trata de un modelo de la familia SciT/ModernBERT orientado a texto cientifico, y la terminacion `2015-ci` sugiere un ajuste o especializacion vinculada a un corpus o tarea concreta (posiblemente clasificacion de intencion de citas, *citation intent*, aunque esto no se confirma en la informacion disponible).

El repositorio declara 149.014.272 parametros totales, un tamano de 1,2 GB y el tag `modernbert`, lo que situa al modelo en la escala de un encoder tipo BERT base (aproximadamente 150 millones de parametros). Frente a los encoders clasicos de 110 millones de parametros, este tamano es coherente con las variantes base de ModernBERT, que incorporan mejoras como posiciones rotatorias (RoPE), atencion local/global alternada y soporte de secuencias mas largas.

La relevancia de la ficha es limitada por la escasez de metadatos: el repositorio no declara licencia, idiomas, pipeline ni datos de entrenamiento, y no se han publicado resultados de benchmarks en la informacion disponible. Se trata, ademas, de un modelo con muy poca traccion (4 descargas, 0 likes), por lo que debe considerarse experimental y no apto para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder transformer tipo ModernBERT (segun tag del repositorio; detalle no disponible) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-06-14 |
| Ultima actualizacion | 2026-10-05 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `modernbert` del repositorio, que apunta a la familia ModernBERT: un encoder transformer con normalizacion previa, activacion GeGLU, embeddings rotatorios en lugar de embeddings posicionales absolutos y un patron de atencion alternado entre capas locales y globales. Esta combinacion permite manejar secuencias mas largas que los encoders BERT clasicos con un coste computacional menor. El recuento de 149.014.272 parametros es consistente con la variante base de esa familia, aunque no se confirma en la documentacion del repositorio.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni sobre tecnicas adicionales como decodificacion especulativa. El sufijo `scitbert` sugiere un preentrenamiento o ajuste sobre literatura cientifica y el sufijo `2015-ci` podria referirse a un ano de corte del corpus y a una tarea de clasificacion, pero se trata de una inferencia a partir del nombre, no de un dato confirmado.

## Capacidades

- Codificacion de texto: por su arquitectura de encoder, la funcion esperada es la generacion de representaciones contextuales (embeddings) para clasificacion, regresion o recuperacion, no la generacion autoregresiva de texto.
- Clasificacion de secuencias: uso previsto en tareas tipo *sequence classification*, probablemente etiquetado de intencion de citas o clasificacion de fragmentos cientificos, sin confirmacion documental.
- Razonamiento multi-paso y agentes: no disponible; un encoder bidireccional no esta disenado para bucles de agente con tool calling.
- Tool calling / function calling: no soportado de forma nativa por este tipo de arquitectura.
- Capacidades multilingues: no disponible; el nombre del modelo y la falta de declaracion de idiomas impiden confirmar cobertura.
- Vision, audio o modo *thinking*: no disponibles.

## Casos de uso

- Clasificacion de fragmentos cientificos: el modelo puede usarse como extractor de features congelado o afinado para etiquetar secciones de articulos (introduccion, metodo, resultados) si el ajuste `ci` corresponde a ese dominio; requiere validacion propia.
- Deteccion de intencion de cita: si el sufijo `ci` hace referencia a *citation intent*, seria adecuado para clasificar si una cita es de fondo, metodologica o de resultado, integr andolo en un pipeline de analisis bibliometrico.
- Indexacion semantica de repositorios documentales: generar embeddings de abstracts y pasajes para busqueda vectorial en una base de publicaciones cientificas.
- Enrutado y filtrado de contenido en un pipeline RAG: usar el encoder como clasificador previo para decidir que documentos merecen pasar a un modelo generativo mayor, reduciendo coste de inferencia.
- Analisis de revision sistematica: clasificacion automatica de miles de abstracts para cribado inicial (screening) en revisiones de literatura, con revision humana posterior.
- Etiquetado de datos para entrenamiento: usar el modelo como anotador o preetiquetador en un flujo de anotacion activa sobre corpus cientificos.
- Extraccion de entidades sobre texto tecnico: combinado con una cabeza de token classification, para reconocer terminos, materiales o metodos en articulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parametros: unos 0,6 GB en fp32, 0,3 GB en fp16/bf16 y 0,15 GB en int8, mas el consumo de activaciones, que depende de la longitud de secuencia.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso en CPU para lotes pequenos.
- GPU recomendadas para *fine-tuning*: RTX 3090 o RTX 4090 para lotes moderados; A100 o H100 si se necesita alto *throughput* o secuencias muy largas.
- Opciones de despliegue: al publicarse en safetensors, es directamente cargable con `transformers`; tambien es compatible con ONNX Runtime, TorchScript y, con conversion previa, con `llama.cpp` en modo embeddings y con servidores de inferencia tipo Text Embeddings Inference o vLLM en tareas de embedding.
- Latencia y *throughput*: no disponibles. En un encoder de 149 millones de parametros sobre GPU moderna, es habitual obtener del orden de miles de secuencias cortas por segundo en lote, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| gebhart/scitbert-2015-ci | 149.014.272 | no disponible | no disponible | HuggingFace, 4 descargas | no disponible |
| ModernBERT-base (familia de referencia) | 149 M aprox. | 8192 tokens | Apache 2.0 (segun su ficha publica) | HuggingFace, ampliamente usado | benchmarks publicos en MTEB y GLUE |
| SciBERT (Allen AI) | 110 M aprox. | 512 tokens | Apache 2.0 (segun su ficha publica) | HuggingFace, muy extendido | benchmarks publicos en tareas cientificas |
| BERT-base (Google) | 110 M aprox. | 512 tokens | Apache 2.0 | HuggingFace, referencia generalista | benchmarks publicos en GLUE |

Nota: los datos de las filas comparativas corresponden a informacion publica de esos modelos y no a una evaluacion conjunta con `gebhart/scitbert-2015-ci`; la unica cifra verificada de este ultimo es el numero de parametros.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card descriptiva, ni licencia, ni idiomas, ni pipeline declarado, lo que impide evaluar su idoneidad legal y tecnica.
- Licencia no disponible: sin licencia explicita no se puede asumir permiso de uso comercial; hay que contactar con el autor o abstenerse de usarlo en produccion.
- Sesgos: no evaluables con la informacion disponible; cualquier corpus cientifico hereda sesgos de idioma, disciplina y geografia.
- Riesgo de alucinacion: no aplica de la misma forma que en modelos generativos, pero un clasificador puede producir etiquetas erroneas con alta confianza si se usa fuera de su dominio de entrenamiento.
- Limitaciones de contexto e idioma: se desconocen; si el modelo sigue la configuracion estandar de ModernBERT, el contexto seria de 8192 tokens, pero esto no esta confirmado en el repositorio.
- Traccion minima: 4 descargas y 0 likes, sin senales de validacion por parte de la comunidad, lo que aumenta el riesgo de pesos defectuosos o entrenamiento incompleto.
- Metadatos anomalos: la fecha de creacion declarada (2026-06-14) es posterior a la fecha de ultima actualizacion indexada en la busqueda, un detalle que conviene verificar antes de confiar en el repositorio.
- Resultados de la busqueda web no pertinentes: las consultas devolvieron exclusivamente material sobre la fuerza de Coriolis, sin relacion con el modelo, por lo que no aportan informacion adicional.

## Enlaces

- HuggingFace: https://huggingface.co/gebhart/scitbert-2015-ci
- Repositorio de ModernBERT (referencia de arquitectura): https://huggingface.co/answerdotai/ModernBERT-base
- SciBERT (referencia de dominio cientifico): https://huggingface.co/allenai/scibert_scivocab_uncased
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Paper de SciBERT: https://arxiv.org/abs/1903.10676
- No se han encontrado en la busqueda web enlaces adicionales relacionados con este modelo.
