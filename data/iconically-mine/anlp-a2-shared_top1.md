# iconically-mine/anlp-a2-shared_top1

## Resumen

`iconically-mine/anlp-a2-shared_top1` es un transformer decoder-only de escala minima (12,94 millones de parametros) publicado en HuggingFace como artefacto de un trabajo academico: la model card lo identifica como "ANLP A2, Task 1" (Advanced NLP, asignatura 2, tarea 1). No es un modelo de proposito general ni un lanzamiento de una organizacion de investigacion: es un checkpoint de laboratorio entregado con el codigo fuente necesario para instanciarlo (`src/part1/model/transformer.py`), y su interes es exclusivamente pedagogico o experimental, no productivo.

Arquitectura transformer con 6 capas, `d_model=256`, 8 cabezas de atencion (`head_dim=32`) y una dimensión oculta de FFN de 1024. La caracteristica distintiva que da nombre al modelo es el tipo de capa feed-forward, `shared_top1`, una variante que la model card no describe en detalle y cuyo comportamiento exacto (si se trata de un unico FFN compartido entre capas, de un esquema de seleccion top-1 sobre un banco de expertos o de otra cosa) no se puede confirmar con la informacion disponible.

El modelo se entreno sobre 30 millones de tokens y alcanzo una perdida de validacion final de 3,8748 (perplejidad aproximada de 48,2), un valor coherente con un modelo de este tamano y con un presupuesto de entrenamiento muy reducido. Con cero descargas y cero "likes", sin licencia declarada, sin idiomas declarados y sin pipeline asignado, debe tratarse como un experimento reproducible antes que como una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; tipo de FFN `shared_top1` |
| Parametros totales | 12,94 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en precision original, presumiblemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`.pt`), requiere `torch.load` y el codigo del autor |
| Capas | 6 |
| Dimension del modelo (`d_model`) | 256 |
| Cabezas de atencion | 8 (dimension por cabeza: 32) |
| Dimension oculta del FFN | 1024 |
| Tipo de FFN | `shared_top1` |
| Tokens de entrenamiento | 30,00 M |
| Perdida de validacion final | 3,8748 |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |
| Etiquetas | `region:us` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de un transformer decoder-only: 6 bloques con atencion multi-cabeza (8 cabezas de 32 dimensiones sobre un espacio de 256), normalizacion y una red feed-forward de 1024 unidades ocultas. La particularidad es el campo `ffn_type: shared_top1`, que indica una modificacion del bloque FFN estandar. La model card no explica la semantica de esa variante ni como afecta al numero de parametros por bloque, de modo que cualquier interpretacion (FFN unico compartido entre capas, seleccion top-1 de una capa FFN entre varias, o una mezcla del estilo Mixture-of-Experts con un solo experto activo) queda fuera de lo que la documentacion permite afirmar. En terminos de reparto de parametros, las 6 capas de atencion y FFN explican del orden de 4,7 M de parametros, por lo que el grueso restante corresponde a las matrices de embedding y de salida, lo que sugiere un vocabulario de tamano moderado, aunque este dato no se publica.

El entrenamiento se realizo sobre 30,00 M de tokens, un presupuesto tres o cuatro ordenes de magnitud inferior al de los modelos de referencia actuales. No se documentan la composicion del dataset, el tokenizador, el numero de pasos, el tamano de lote, la tasa de aprendizaje ni si hubo fases de ajuste fino con RLHF, DPO o instrucciones. La unica metrica reportada es la perdida de validacion final (3,8748), que equivale a una perplejidad de aproximadamente 48,2 en el corpus de validacion del autor. No se declara ninguna tecnica de eficiencia (atencion lineal, decodificacion especulativa, cuantizacion) ni innovacion adicional mas alla del tipo de FFN.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el escaso presupuesto de entrenamiento (30 M de tokens) y una perplejidad de validacion de aproximadamente 48.
- Modelado de lenguaje a nivel de token: el checkpoint esta pensado para completar secuencias cortas, no para dialogo ni instrucciones.
- Capacidad de razonamiento, matematicas o codigo: no disponible; no se reporta ninguna evaluacion de este tipo.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente o razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingues: no disponibles; no se declara idioma ni composicion del corpus.
- Vision, audio o modalidades adicionales: no soportadas.
- Modo "thinking" o decodificacion con cadena de pensamiento: no disponible.
- Uso principal previsto: servir como implementacion de referencia para comparar variantes de FFN en el contexto de la tarea academica ANLP A2.

## Casos de uso

- Reproduccion de resultados academicos: cargar `shared_top1_final.pt` con `torch.load` y el modulo `src/part1/model/transformer.py` para verificar la perdida de validacion de 3,8748 reportada por el autor y compararla con otras variantes de FFN de la misma tarea.
- Ablacion de arquitecturas de FFN: el interes del checkpoint es que aísla una decision de diseno concreta (`shared_top1`) manteniendo fijo el resto del transformer (6 capas, 256 de dimension, 8 cabezas), lo que permite atribuir diferencias de perdida a esa eleccion.
- Docencia de transformers: usar el modelo como ejemplo minimo y completamente inspeccionable (12,94 M de parametros) para explicar atencion, normalizacion y bloques FFN en un aula, sin la complejidad de un modelo de miles de millones de parametros.
- Pruebas de pipelines de entrenamiento: al ser pequeno y entrenarse con 30 M de tokens, sirve como banco de pruebas para validar bucles de entrenamiento, tokenizadores o utilidades de evaluacion antes de escalar a modelos mayores.
- Analisis de embeddings: extraer representaciones de las 6 capas para estudiar como se estructura el espacio latente en un modelo subentrenado y contrastarlo con modelos de mayor escala.
- Inferencia en CPU para desarrollo: con 12,94 M de parametros, el coste de memoria es de decenas de megabytes, de modo que puede ejecutarse en cualquier portatil sin GPU para experimentos rapidos de generacion o depuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de validacion final:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 3,8748 |
| Perplejidad de validacion (derivada) | ≈ 48,2 |

No hay datos de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, ni resultados de comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada: del orden de 50 MB en fp32 y 25 MB en fp16 para los 12,94 M de parametros, mas el coste de las activaciones, despreciable para contextos cortos.
- GPU recomendadas: ninguna en particular; el modelo es demasiado pequeno para justificar aceleracion dedicada. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o incluso una iGPU es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer y tambien en CPU (single-thread es viable) y en dispositivos embebidos con unos cientos de megabytes libres.
- Opciones de despliegue: no existe soporte directo en vLLM, llama.cpp, Ollama, TGI ni en herramientas equivalentes, porque los pesos se distribuyen como checkpoint PyTorch (`.pt`) que requiere el codigo propio del autor. El despliegue realista es un script de Python con PyTorch y `torch.load`.
- Latencia y throughput: no disponibles. No se publican mediciones y, dado el tamano, estaran dominadas por el coste de arranque de Python y de la carga del checkpoint mas que por la computacion.
- Formato de pesos: no hay versiones GGUF, safetensors ni cuantizadas publicadas.

## Comparativa con modelos similares

No existe una categoria comercial directamente comparable, ya que se trata de un artefacto academico. Como referencia de escala, la tabla siguiente contrasta el modelo con alternativas de tamano bajo y uso comun en investigacion:

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iconically-mine/anlp-a2-shared_top1` | 12,94 M | no disponible | 30 M | no disponible | HuggingFace, requiere codigo propio |
| Pythia 14M | 14 M | 2048 | 300 B | Apache-2.0 | HuggingFace, transformers |
| GPT-2 small | 124 M | 1024 | ~40 GB de texto (WebText) | MIT | HuggingFace, transformers |
| SmolLM-135M | 135 M | 2048 | 600 B | Apache-2.0 | HuggingFace, transformers |

Las alternativas de la tabla se entrenaron con dos a cuatro ordenes de magnitud mas de tokens, lo que hace que la comparacion de calidad no sea significativa: el modelo aqui descrito es un ejercicio de arquitectura, no un competidor de esos checkpoints.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido (30 M de tokens): la calidad del texto generado sera baja y probablemente incoherente mas alla de unas pocas palabras, coherente con una perplejidad de validacion de aproximadamente 48,2.
- Sesgos conocidos: no disponibles. No se documenta la composicion del corpus, por lo que no se puede evaluar que sesgos contiene ni como se manifiestan.
- Riesgo de alucinacion: alto y no mitigado. No hay ajuste por instrucciones, RLHF ni filtros de salida, y el modelo no tiene conocimiento factual fiable.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y no se especifica ningun idioma soportado; no debe asumirse un comportamiento multilingue ni una ventana concreta.
- Restricciones de licencia: no se declara licencia. En ausencia de licencia explicita en HuggingFace, rige el regimen de copyright por defecto, lo que en la practica implica que no hay autorizacion clara para uso comercial ni para redistribucion. Debe contactarse con el autor antes de cualquier uso fuera del ambito academico.
- Dependencia de codigo no publicado en el repositorio de pesos: para cargar el modelo hace falta `src/part1/model/transformer.py`, que no forma parte de los ficheros listados en el repositorio de HuggingFace. Sin ese codigo el checkpoint no es utilizable directamente.
- Ausencia de versiones cuantizadas o en formatos estandar (GGUF, safetensors): no se puede integrar en runtimes de inferencia habituales sin conversion previa.
- Repositorio practicamente sin adopcion (0 descargas, 0 likes) y sin actualizaciones desde su creacion: no hay garantia de mantenimiento ni de soporte.
- No es apto para produccion, atencion al cliente, generacion de codigo ni ninguna tarea que requiera precision, en ausencia de evaluaciones que lo respalden.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iconically-mine/anlp-a2-shared_top1
- Repositorio del codigo fuente (`src/part1/model/transformer.py`): no disponible como enlace publico.
- Paper, blog o demo asociados: no disponibles.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: unicamente enlaces a sitios de contenido para adultos sin ninguna conexion con este checkpoint, por lo que se han descartado.
