# rarmingaud/glidre_large

## Resumen

GLiDRE (Generalist Lightweight model for Document-level Relation Extraction) es un modelo especializado en extraccion de relaciones a nivel de documento, desarrollado por Robin Armingaud y Romaric Besançon (CEA-LIST). A diferencia de los modelos de extraccion de relaciones clasicos, que requieren un conjunto predefinido de tipos de relacion, GLiDRE permite especificar las etiquetas de relacion en tiempo de inferencia, lo que habilita la extraccion zero-shot de relaciones no vistas durante el entrenamiento. El modelo se construye sobre la arquitectura de GLiNER, adaptandola al ambito documental.

El modelo parte de dos modelos base: `microsoft/deberta-v3-large` y `BAAI/bge-large-en-v1.5`, y se ha afinado sobre el dataset `HuggingFaceFW/fineweb`. El repositorio ocupa 3,2 GB y la licencia es Apache 2.0. Esta orientado exclusivamente al ingles y su pipeline principal es la extraccion de relaciones, no la generacion de texto.

Su relevancia actual radica en que aborda la extraccion de relaciones a nivel de documento (DocRE), un problema mas complejo que la extraccion a nivel de frase porque requiere resolver menciones distribuidas y correferencias a lo largo de multiples parrafos. La model card indica que existe una version posterior, `cea-list-ia/glidre_large_v2`, lo que conviene tener en cuenta para nuevos desarrollos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basada en DeBERTa-v3-large y BGE-large-en-v1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | pytorch (repositorio de 3,2 GB) |

## Arquitectura y entrenamiento

GLiDRE sigue el enfoque de GLiNER: en lugar de un clasificador cerrado sobre un conjunto fijo de relaciones, el modelo codifica conjuntamente el texto y las etiquetas de relacion candidatas, de modo que puede puntuar relaciones arbitrarias definidas en inferencia. La model card indica que se construye sobre `microsoft/deberta-v3-large` y `BAAI/bge-large-en-v1.5`, y que soporta multiples funciones de perdida y la modificacion de componentes del modelo. Esta disenado para aceptar tanto texto tokenizado como documentos completos.

El entrenamiento se ha realizado sobre `HuggingFaceFW/fineweb` y la model card menciona soporte para entrenamiento y ajuste fino sobre DocRED y Re-DocRED mediante el script `train.py` y el fichero `configs/config_finetuning.yaml`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal; el caracter distintivo es la formulacion zero-shot de las etiquetas de relacion.

## Capacidades

- Extraccion y clasificacion de relaciones entre entidades en texto no estructurado.
- Extraccion zero-shot: permite definir etiquetas de relacion no vistas durante el entrenamiento en el momento de la inferencia.
- Entrada versatil: acepta texto tokenizado y documentos completos.
- Extraccion a nivel de documento, con soporte para menciones de entidad con offsets (`start`/`end`) y tipos de entidad.
- Control de umbral (`threshold`) y modo multi-etiqueta (`multi_label`) en la prediccion.
- Soporte de entrenamiento y ajuste fino sobre DocRED y Re-DocRED.
- No es un modelo generativo: no produce texto libre ni soporta tool calling, agentes o razonamiento multi-paso.
- Solo ingles.
- No dispone de vision ni audio.

## Casos de uso

- Extraccion de relaciones en articulos de noticias: dado un texto y un conjunto de etiquetas como `COUNTRY_OF_CITIZENSHIP` o `PART_OF`, el modelo devuelve las relaciones entre menciones de entidad identificadas previamente, lo que permite construir grafos de conocimiento a partir de prensa.
- Procesamiento de documentacion legal y contractual: extraer relaciones entre partes, fechas y obligaciones a lo largo de documentos completos, aprovechando la capacidad de manejar documentos enteros en lugar de frases aisladas.
- Construccion de grafos de conocimiento en dominios cientificos: extraer relaciones entre autores, instituciones y publicaciones en corpus de articulos, con etiquetas de relacion definidas por el equipo sin reentrenamiento.
- Enriquecimiento de bases de datos empresariales: procesar informes y actas para vincular entidades (personas, organizaciones, ubicaciones) con relaciones como pertenencia o empleo.
- Analisis de inteligencia y OSINT: extraer relaciones entre entidades en informes no estructurados, con la flexibilidad de definir etiquetas segun el caso de analisis.
- Preprocesamiento para pipelines RAG o de busqueda semantica: generar tripletas entidad-relacion-entidad que alimenten indices estructurados o grafos consultables.
- Anotacion asistida de corpus: usar el modo zero-shot para preetiquetar relaciones en DocRED o Re-DocRED antes de la revision humana, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 3,2 GB, por lo que en precision FP16 el modelo requeriria aproximadamente 6,4 GB solo para pesos, mas memoria para activaciones.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100) seria suficiente para inferencia en FP16.
- Cabe en GPU de consumo: probablemente si en GPUs con 16 GB o mas, aunque no se confirma en la documentacion.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria `glidre` (`pip install .` y `GLiDRE.from_pretrained(...)`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Zero-shot |
|---|---|---|---|---|---|---|
| GLiDRE (este) | Extraccion de relaciones documental | no disponible | no disponible | en | apache-2.0 | Si |
| GLiNER | Extraccion de entidades/relaciones | no disponible | no disponible | multi (segun variante) | no disponible | Si |
| Modelos DocRE supervisados (p. ej., basados en DocRED) | Extraccion de relaciones documental | no disponible | no disponible | en | variable | No (conjunto fijo de relaciones) |

La comparativa se limita a categorias generales porque la informacion proporcionada no incluye cifras de rendimiento ni especificaciones detalladas de los alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en castellano.
- No es un modelo generativo: no sirve para generacion de texto, codigo, matematicas ni dialogos.
- Riesgo de alucinacion de relaciones: al permitir etiquetas arbitrarias en inferencia, puede asignar relaciones plausibles pero incorrectas, especialmente con umbrales bajos.
- Requiere que las menciones de entidad se proporcionen con offsets y tipos; no realiza por si mismo la deteccion de entidades de extremo a extremo.
- La model card indica que el modelo rinde mejor con nombres de relacion en mayusculas.
- Existe una version posterior (`cea-list-ia/glidre_large_v2`) que el autor marca como `new_version`; conviene evaluar esa version para nuevos proyectos.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales derivadas de los modelos base.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que sugiere una adopcion muy limitada y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarmingaud/glidre_large
- Version posterior: https://huggingface.co/cea-list-ia/glidre_large_v2
- Repositorio GLiDRE: https://github.com/cea-list-lasti/glidre
- Paper (arXiv): https://arxiv.org/abs/2508.00757
- GLiNER (trabajo previo): https://github.com/urchade/GLiNER
- Modelo base DeBERTa-v3-large: https://huggingface.co/microsoft/deberta-v3-large
- Modelo base BGE-large-en-v1.5: https://huggingface.co/BAAI/bge-large-en-v1.5
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
