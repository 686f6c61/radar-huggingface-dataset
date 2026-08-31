# aneforge/bge-small-en-v1.5

## Resumen

El modelo `aneforge/bge-small-en-v1.5` es una copia sin modificar del modelo de embeddings `BAAI/bge-small-en-v1.5`, desarrollado por la Academia de Inteligencia Artificial de Pekín (BAAI). Esta versión concreta ha sido etiquetada y preparada por el proyecto ANEForge para que los pesos se carguen y ejecuten directamente en el Apple Neural Engine (ANE) sin necesidad de CoreML. Los pesos son byte-idénticos a los del modelo original, por lo que no introduce ninguna variación en el comportamiento del modelo.

Se trata de un modelo de embeddings de frases basado en arquitectura BERT, con 33,36 millones de parámetros y una dimensión de salida de 384. Está diseñado para tareas de búsqueda semántica, similitud de frases y recuperación densa. Su relevancia actual radica en que permite ejecutar embeddings de alta calidad en dispositivos Apple (iPhone, iPad, Mac) con aceleración por hardware, lo que resulta útil para aplicaciones de procesamiento de lenguaje natural en el borde, como búsqueda local, sistemas de recomendación o pipelines de RAG sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) |
| Parametros totales | 33.360.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (segun modelo base BAAI) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en BERT, con 12 capas, 12 cabezas de atencion y una dimension oculta de 384, tal como corresponde a la familia BGE-small de BAAI. El modelo original fue entrenado por BAAI mediante tecnicas de aprendizaje contrastivo sobre pares de frases, con el objetivo de producir embeddings normalizados que reflejen similitud semantica. La version v1.5 introdujo mejoras en la distribucion de similitud y en la capacidad de recuperacion sin necesidad de instrucciones previas.

Esta copia concreta no modifica los pesos ni la arquitectura; simplemente anade etiquetas y metadatos para que ANEForge pueda compilar el grafo del modelo en un unico programa ANE y transmitir los pesos desde HuggingFace mediante `huggingface_hub`. No se ha realizado ningun reentrenamiento ni ajuste adicional.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para busqueda semantica, similitud y clustering.
- Soporte para normalizacion de embeddings (`normalize_embeddings=True`), lo que facilita el calculo de similitud coseno.
- Integracion nativa con ANEForge para ejecucion en Apple Neural Engine, sin necesidad de CoreML.
- Compatible con la libreria `sentence-transformers` para uso en CPU/GPU si no se dispone de ANE.
- Capacidad de recuperacion densa para tareas de retrieval-augmented generation (RAG).
- Multilingue: solo ingles (el nombre del modelo lo indica).

## Casos de uso

- Busqueda semantica en aplicaciones iOS y macOS: el modelo puede indexar documentos locales y responder a consultas en lenguaje natural, aprovechando la aceleracion del ANE para obtener latencias bajas sin conexion a internet.
- Sistemas de recomendacion basados en similitud de texto: al convertir descripciones de productos, articulos o noticias en embeddings, se pueden calcular distancias coseno para sugerir contenido relacionado en tiempo real.
- Clustering de documentos: los embeddings permiten agrupar grandes colecciones de texto por temas, util para organizar correos, tickets de soporte o articulos de conocimiento.
- Deduplicacion de contenido: comparando embeddings de textos se pueden detectar duplicados o variaciones casi identicas en bases de datos documentales.
- Pipelines de RAG en dispositivos Apple: el modelo puede servir como componente de recuperacion en asistentes locales, indexando una base de conocimiento personal y extrayendo fragmentos relevantes antes de pasarlos a un LLM.
- Clasificacion de texto mediante embeddings: combinado con un clasificador lineal, permite etiquetar correos, comentarios o resenas con un coste computacional minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `BAAI/bge-small-en-v1.5` cuenta con evaluaciones publicas en su repositorio, pero esta copia no incluye datos propios. Se recomienda consultar la documentacion del modelo base para obtener metricas de rendimiento en tareas como MTEB, BEIR o similares.

## Requisitos de hardware

- Al ser un modelo de 33 millones de parametros, cabe en cualquier dispositivo Apple con Neural Engine (iPhone, iPad, Mac con chip M1 o posterior).
- No requiere VRAM dedicada si se ejecuta via ANEForge, ya que la computacion se realiza en el ANE.
- Para uso en CPU/GPU, puede ejecutarse en cualquier maquina con al menos 2 GB de RAM y un procesador moderno; una GPU no es imprescindible.
- Opciones de despliegue: ANEForge (recomendado para Apple), `sentence-transformers` en Python, o conversion a ONNX para otros entornos.
- Latencia y throughput: no disponibles en la informacion proporcionada, pero al ser un modelo pequeno se esperan tiempos de inferencia del orden de milisegundos en hardware Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embeddings | Contexto | Licencia | Uso en ANE |
|---|---|---|---|---|---|
| aneforge/bge-small-en-v1.5 | 33,36 M | 384 | 512 | MIT | Si (via ANEForge) |
| BAAI/bge-small-en-v1.5 | 33,36 M | 384 | 512 | MIT | No directo |
| all-MiniLM-L6-v2 | 22,7 M | 384 | 256 | Apache 2.0 | No directo |
| BAAI/bge-base-en-v1.5 | 109 M | 768 | 512 | MIT | No directo |

La comparativa se basa en parametros y caracteristicas generales; no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no es adecuado para textos en otros idiomas sin un modelo multilingue.
- La longitud de contexto esta limitada a 512 tokens; textos mas largos deben truncarse o dividirse.
- Al ser una copia sin modificar, no ofrece ninguna mejora sobre el modelo original; su unica ventaja es la integracion con ANEForge.
- La ejecucion en ANE depende de la disponibilidad de ANEForge y de la compatibilidad con el hardware Apple; en dispositivos sin ANE, se puede usar en CPU pero sin aceleracion.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los terminos del modelo base por si hubiera condiciones adicionales.
- No se han reportado sesgos especificos, pero al ser un modelo entrenado principalmente con datos en ingles, puede reflejar sesgos presentes en esos datos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/aneforge/bge-small-en-v1.5
- Modelo base original: https://huggingface.co/BAAI/bge-small-en-v1.5
- Proyecto ANEForge en GitHub: https://github.com/sbryngelson/ANEForge
- Documentacion de ANEForge: https://aneforge.readthedocs.io
- Paper de ANEForge: https://arxiv.org/abs/2606.17090
