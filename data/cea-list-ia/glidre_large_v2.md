# cea-list-ia/glidre_large_v2

## Resumen

GLiDRE v2 (Generalist Lightweight model for Document-level Relation Extraction) es un modelo especializado en extraccion de relaciones a nivel de documento, desarrollado por el equipo CEA-LIST-IA. A diferencia de los modelos de extraccion de relaciones clasicos, que requieren un conjunto cerrado de tipos de relacion predefinidos durante el entrenamiento, GLiDRE esta disenado para operar en regimen zero-shot: puede clasificar relaciones no vistas previamente a partir de la definicion textual de las etiquetas. El modelo se construye sobre dos pilares: un encoder de tipo DeBERTa-v3-large para la codificacion del texto y un encoder de frases BAAI/bge-large-en-v1.5 para representar las etiquetas de relacion como embeddings comparables.

La version v2 se presenta como una mejora sobre la v1 centrada en la calidad de los datos de entrenamiento y en la reescritura del codigo de entrenamiento, manteniendo la misma filosofia de diseno: ligereza, versatilidad de entrada (texto tokenizado o documento completo) y personalizacion de la funcion de perdida. El modelo esta publicado con licencia Apache 2.0 y esta orientado exclusivamente al ingles.

Es relevante ahora porque aborda uno de los cuellos de botella practicos de la extraccion de relaciones en produccion: la necesidad de reentrenar el modelo cada vez que aparece un nuevo tipo de relacion en el dominio. Al permitir definir las relaciones en tiempo de inferencia mediante etiquetas textuales, GLiDRE reduce el coste de adaptacion a nuevos esquemas de conocimiento y a corpus documentales heterogeneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder dual: DeBERTa-v3-large (texto) + BGE-large-en-v1.5 (etiquetas de relacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo de 3,2 GB); no se indica presencia de safetensors ni GGUF |

## Arquitectura y entrenamiento

GLiDRE emplea una arquitectura de dos encoders. El texto de entrada se procesa con microsoft/deberta-v3-large, mientras que las etiquetas de relacion se codifican con BAAI/bge-large-en-v1.5 para obtener representaciones semanticas de cada tipo de relacion. La prediccion se formula como una comparacion entre la representacion de los pares de entidades en el contexto del documento y la representacion de la etiqueta, lo que habilita el comportamiento zero-shot sobre relaciones no vistas durante el entrenamiento. El modelo admite tanto texto tokenizado como documentos completos y permite modificar componentes y funciones de perdida.

El entrenamiento se realizo sobre HuggingFaceFW/fineweb segun los metadatos del repositorio, y el codigo de entrenamiento soporta conjuntos de datos de referencia como DocRED y Re-DocRED (configuracion `configs/config_finetuning.yaml`). La version v2 se centra en mejoras de datos y de codigo de entrenamiento respecto a la v1. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Extraccion de relaciones a nivel de documento entre menciones de entidades identificadas previamente.
- Clasificacion zero-shot de relaciones no vistas, definidas mediante etiquetas textuales en tiempo de inferencia.
- Entrada versatil: acepta texto tokenizado con indices de inicio y fin de mencion, o documentos completos.
- Soporte de multiples etiquetas por par de entidades mediante el parametro `multi_label`.
- Umbral de confianza configurable (`threshold`) para filtrar predicciones.
- Arquitectura personalizable: permite modificar componentes y funciones de perdida.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Construccion de grafos de conocimiento a partir de corpus documentales: el modelo recibe documentos completos con entidades ya detectadas y devuelve tripletas (entidad 1, relacion, entidad 2) que pueden cargarse directamente en una base de datos de grafos.
- Extraccion de relaciones en dominios cientificos o tecnicos con esquemas cambiantes: al definir las relaciones como etiquetas textuales, se pueden incorporar nuevos tipos sin reentrenar, lo que resulta adecuado para literatura que evoluciona rapidamente.
- Enriquecimiento de pipelines de recuperacion de informacion (RAG): las relaciones extraidas permiten construir indices estructurados que complementan la busqueda vectorial sobre documentos.
- Analisis de documentos legales o administrativos: identificacion de relaciones como fecha de publicacion, jurisdiccion o parte implicada entre entidades detectadas en contratos y expedientes.
- Poblacion y mantenimiento de bases de datos de entidades: el modo multi-etiqueta permite capturar relaciones multiples entre el mismo par de entidades, util en dominios donde una entidad puede tener varias afiliaciones.
- Evaluacion comparativa de esquemas de anotacion: gracias a su naturaleza zero-shot, sirve como linea base rapida para probar la viabilidad de un nuevo conjunto de etiquetas antes de invertir en anotacion manual.
- Procesamiento por lotes en entornos con recursos limitados: su caracter de modelo "ligero" (encoder de ~300M parametros para el texto) lo hace viable en infraestructura de GPU consumer, a diferencia de los LLM generativos usados para tareas equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 3,2 GB, lo que sugiere que en precision fp16 el modelo completo (dos encoders) puede requerir del orden de 1,5-3 GB de VRAM, aunque no se confirma en la documentacion.
- GPU recomendadas: no especificadas por el autor. Por el tamano de los encoders (DeBERTa-v3-large y BGE-large), cabe en GPUs consumer como RTX 3090, RTX 4090 o RTX 4080 en fp16.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con 8 GB o mas de VRAM en fp16, aunque el dato no esta confirmado.
- Opciones de despliegue: el autor proporciona el paquete `glidre` (`pip install .`) con API `GLiDRE.from_pretrained(...)` y `predict_entities(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLiDRE v2 (este modelo) | Encoder dual para RE documental | no disponible (repo 3,2 GB) | no disponible | Si | Apache 2.0 | Hugging Face + GitHub |
| Modelos RE supervisados sobre DocRED (p. ej. basados en BERT/RoBERTa) | Encoder para RE documental | ~110M-355M | 512 tokens tipicamente | No (esquema cerrado) | Variable | Hugging Face |
| LLM generativos (p. ej. GPT-4, Llama) para RE | Decoder generativo | Miles de millones | 8K-128K+ | Si | Propietaria o abierta | APIs y Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Requiere que las entidades mencionadas se proporcionen ya identificadas con indices de inicio y fin; no realiza deteccion de entidades por si mismo.
- El rendimiento zero-shot depende de la formulacion de las etiquetas: el autor recomienda usar nombres de relacion en mayusculas porque el modelo rinde mejor con esa convencion.
- Riesgo de alucinacion de relaciones: al ser un clasificador, puede asignar relaciones plausibles pero incorrectas, especialmente con umbrales de confianza bajos; se recomienda ajustar `threshold` segun el dominio.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible verificar su calidad frente a alternativas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las licencias de los modelos base (DeBERTa-v3-large y BGE-large-en-v1.5) por si imponen condiciones adicionales.
- La longitud maxima de contexto no esta documentada; en documentos muy largos puede ser necesario truncar o segmentar, lo que afecta a las relaciones que cruzan segmentos.

## Enlaces

- Hugging Face: https://huggingface.co/cea-list-ia/glidre_large_v2
- Repositorio GitHub: https://github.com/cea-list-lasti/glidre
- Paper (arXiv): https://arxiv.org/abs/2508.00757
- Modelo base texto: https://huggingface.co/microsoft/deberta-v3-large
- Modelo base etiquetas: https://huggingface.co/BAAI/bge-large-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
