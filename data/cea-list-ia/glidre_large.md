# cea-list-ia/glidre_large

## Resumen

GLiDRE (Generalist Lightweight model for Document-level Relation Extraction) es un modelo especializado en extraccion de relaciones a nivel de documento, desarrollado por el equipo CEA LIST-IA. Resuelve el problema de identificar y clasificar relaciones semanticas entre entidades mencionadas en texto no estructurado, incluyendo documentos completos donde las entidades y sus relaciones pueden aparecer dispersas a lo largo de multiples oraciones. Se construye sobre la estela de GLiNER, adaptando su enfoque zero-shot a la tarea de relation extraction.

El modelo se presenta como un fine-tuning que combina dos arquitecturas base: microsoft/deberta-v3-large y BAAI/bge-large-en-v1.5. Su propuesta principal es la capacidad de clasificar relaciones no vistas durante el entrenamiento directamente a partir de etiquetas definidas por el usuario en tiempo de inferencia, sin necesidad de reentrenamiento. Esto lo posiciona como una alternativa generalista frente a modelos supervisados cerrados a un conjunto fijo de relaciones.

Es relevante ahora porque aborda la extraccion de relaciones documentales con un enfoque ligero y zero-shot, un area tradicionalmente dominada por modelos supervisados especificos por dominio. Su licencia Apache 2.0 y su integracion con el ecosistema GLiNER facilitan su adopcion en pipelines de extraccion de informacion. Existe una version posterior, glidre_large_v2, referenciada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning sobre microsoft/deberta-v3-large y BAAI/bge-large-en-v1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | pytorch (safetensors no confirmado; repo de 3,2 GB) |

## Arquitectura y entrenamiento

GLiDRE se construye mediante fine-tuning sobre dos modelos base: microsoft/deberta-v3-large, un encoder transformer con atencion desentrelazada, y BAAI/bge-large-en-v1.5, un modelo de embeddings orientado a recuperacion. La combinacion sugiere un diseno hibrido que aprovecha la capacidad de representacion contextual de DeBERTa y las representaciones densas de BGE para la tarea de clasificacion de relaciones. El modelo opera sobre menciones de entidades predefinidas por el usuario y clasifica las relaciones entre pares de entidades segun etiquetas proporcionadas en inferencia.

El entrenamiento se realiza sobre datasets de relation extraction a nivel de documento, mencionandose explicitamente DocRED y Re-DocRED en la documentacion. El dataset base declarado en los metadatos es HuggingFaceFW/fineweb, lo que sugiere un posible uso de datos web para preentrenamiento o aumento. La model card indica que soporta multiples funciones de perdida y permite modificar facilmente componentes del modelo, lo que refleja un diseno modular orientado a la experimentacion. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Extraccion de relaciones zero-shot: clasifica relaciones no vistas durante el entrenamiento a partir de etiquetas definidas por el usuario en tiempo de inferencia.
- Procesamiento a nivel de documento: maneja tanto texto tokenizado como documentos completos, permitiendo relaciones entre entidades distantes.
- Clasificacion multi-etiqueta configurable: el parametro `multi_label` permite activar o desactivar la asignacion de multiples relaciones por par de entidades.
- Umbral de confianza ajustable: el parametro `threshold` permite calibrar la precision y el recall de las predicciones.
- Entrada estructurada de menciones: acepta entidades con identificador, tipo y posiciones de inicio y fin, lo que permite integrarse con pipelines de NER previos.
- Entrenamiento y fine-tuning: incluye scripts de entrenamiento sobre DocRED y Re-DocRED mediante archivos de configuracion YAML.
- Modularidad: soporta multiples funciones de perdida y modificacion de componentes internos.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Extraccion de relaciones en articulos cientificos: el modelo puede procesar documentos completos para identificar relaciones entre autores, instituciones y publicaciones, aprovechando su capacidad de manejar entidades dispersas a lo largo del texto.
- Construccion de grafos de conocimiento: se puede integrar tras un pipeline de NER para poblar bases de conocimiento con relaciones como PART_OF, COUNTRY_OF_CITIZENSHIP o PUBLICATION_DATE, usando etiquetas personalizadas sin reentrenamiento.
- Analisis de documentos legales y contractuales: permite extraer relaciones entre partes, fechas y obligaciones definiendo etiquetas especificas del dominio, lo que resulta adecuado por su enfoque zero-shot.
- Procesamiento de noticias y monitorizacion de medios: facilita la extraccion de relaciones entre personas, organizaciones y ubicaciones en articulos periodisticos, con umbral ajustable para controlar falsos positivos.
- Enriquecimiento de bases de datos empresariales: puede extraer relaciones de documentacion interna no estructurada para completar registros estructurados, integrándose con herramientas de ETL.
- Investigacion en procesamiento de lenguaje natural: sirve como baseline generalista y ligero para experimentos de relation extraction, con soporte para fine-tuning sobre DocRED y Re-DocRED.
- Sistemas de pregunta-respuesta sobre documentos: las relaciones extraidas pueden alimentar indices semanticos que respondan consultas sobre vinculos entre entidades en corpus documentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,2 GB, lo que sugiere que el modelo en precision completa (fp32) requiere aproximadamente 3-4 GB de VRAM; en fp16 o bf16 podria reducirse a unos 2 GB.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, una GPU consumer como RTX 3090 o RTX 4090 seria suficiente, asi como A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en GPUs con 8 GB o mas de VRAM, aunque el dato no esta confirmado en la documentacion.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria propia `glidre` instalable con pip; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDRE large (este modelo) | no disponible | no disponible | Relation extraction documental zero-shot | Apache 2.0 | Hugging Face |
| GLiNER | no disponible | no disponible | NER zero-shot (modelo precursor) | no disponible en la informacion | GitHub / Hugging Face |
| Modelos supervisados DocRED (p. ej. baselines especificos) | no disponible | no disponible | Relation extraction supervisada cerrada | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a enfoque y licencia.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles segun los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion: como modelo de extraccion, puede generar relaciones espurias entre entidades, especialmente con umbrales de confianza bajos; se recomienda calibrar el parametro `threshold`.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre datos web (fineweb) y datasets como DocRED, puede heredar sesgos presentes en dichas fuentes.
- Dependencia de menciones previas: requiere que las entidades se proporcionen explicitamente con posiciones de inicio y fin, por lo que necesita un pipeline de NER o deteccion de menciones previo.
- Sensibilidad al formato de etiquetas: la model card indica que el modelo rinde mejor con nombres de relacion en mayusculas, lo que implica una dependencia del formato de entrada.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los modelos base (deberta-v3-large y bge-large-en-v1.5) y de los datasets de entrenamiento.
- Versionado: existe una version posterior, glidre_large_v2, referenciada como `new_version`; se recomienda evaluar cual usar en produccion.
- Documentacion incompleta: no se especifican parametros totales, longitud de contexto, cuantizaciones soportadas ni benchmarks, lo que dificulta una evaluacion precisa previa al despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/cea-list-ia/glidre_large
- Paper (arXiv): https://arxiv.org/abs/2508.00757
- Repositorio GitHub: https://github.com/cea-list-lasti/glidre
- GLiNER (trabajo precursor): https://github.com/urchade/GLiNER
- Modelo base DeBERTa-v3-large: https://huggingface.co/microsoft/deberta-v3-large
- Modelo base BGE-large-en-v1.5: https://huggingface.co/BAAI/bge-large-en-v1.5
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Version posterior: https://huggingface.co/cea-list-ia/glidre_large_v2
