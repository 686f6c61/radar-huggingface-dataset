# rarmingaud/glidre_multi_v2

## Resumen

GLiDRE (Generalist Lightweight model for Document-level Relation Extraction) es un modelo especializado en extraccion de relaciones a nivel de documento, desarrollado por Robin Armingaud y Romaric Besançon (CEA-LIST). El checkpoint `glidre_multi_v2` es la variante multilingue de la segunda version del modelo, publicada bajo licencia Apache 2.0 y entrenada sobre los corpus FineWeb y FineWeb-2. Su proposito es clasificar relaciones entre entidades mencionadas en un texto sin necesidad de reentrenamiento especifico para cada esquema de relaciones (zero-shot).

Tecnicamente parte de dos modelos base: `microsoft/mdeberta-v3-base` y `Alibaba-NLP/gte-multilingual-base`, lo que lo situa en la categoria de modelos ligeros (encoder, cientos de millones de parametros) frente a alternativas generativas de mayor tamano. Cubre doce idiomas (ingles, albanes, arabe, checo, frances, aleman, italiano, rumano, espanol, esloveno, turco y serbio) y acepta tanto texto tokenizado como documentos completos.

Su relevancia actual reside en que aborda la extraccion de relaciones document-level con un modelo ligero y multilingue, un escenario donde predominan aproximaciones basadas en LLMs generativos de mucho mayor coste computacional. La version v2 incorpora mejoras en datos y en el codigo de entrenamiento respecto a la v1, y existe una version mantenida en la organizacion `cea-list-ia`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (derivado de mdeberta-v3-base y gte-multilingual-base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, sq, ar, cs, fr, de, it, ro, es, sl, tr, sr |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo de 2.5 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre encoders transformer multilingues preentrenados (`microsoft/mdeberta-v3-base` y `Alibaba-NLP/gte-multilingual-base`) y anade una cabeza de clasificacion de relaciones. La tarea es document-level relation extraction: dado un documento, un conjunto de menciones de entidades con sus tipos y un conjunto de etiquetas de relacion definidas por el usuario, el modelo predice que pares de entidades estan relacionados y con que etiqueta. El diseno soporta multiples funciones de perdida y permite modificar componentes de la arquitectura.

El entrenamiento se realizo sobre los datasets `HuggingFaceFW/fineweb` y `HuggingFaceFW/fineweb-2`, y el codigo de entrenamiento permite ajuste fino sobre corpus como DocRED y Re-DocRED mediante ficheros de configuracion YAML. La model card indica que la v2 introduce "mejores datos y mejor codigo de entrenamiento" respecto a la version anterior. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Extraccion de relaciones zero-shot: clasifica relaciones no vistas durante el entrenamiento directamente a partir del texto y de las etiquetas proporcionadas en inferencia.
- Entrada versatil: acepta texto tokenizado y documentos completos, con menciones de entidades definidas por offsets de caracteres.
- Clasificacion multi-etiqueta opcional (parametro `multi_label`) y umbral de confianza configurable (`threshold`).
- Gestion de tipos de entidad: las menciones se acompanan de un tipo (por ejemplo, LOC, PER) que el modelo utiliza como senal.
- Multilingue: cubre doce idiomas, incluidos arabe, turco y varias lenguas eslavas y romanicas.
- Sensibilidad al formato de etiquetas: la model card indica que el modelo rinde mejor con nombres de relacion en mayusculas.
- Capacidad de ajuste fino sobre esquemas propios mediante el codigo de entrenamiento publicado.

## Casos de uso

- Construccion de grafos de conocimiento a partir de corpus documentales: el modelo extrae tripletas (entidad, relacion, entidad) de documentos completos, lo que permite poblar bases de conocimiento sin definir un esquema cerrado de antemano gracias a su modo zero-shot.
- Analisis de documentacion legal o contractual: identificar relaciones como PART_OF, PUBLICATION_DATE o COUNTRY_OF_CITIZENSHIP entre partes, fechas y jurisdicciones en contratos multilingues.
- Procesamiento de noticias y monitorizacion de medios: extraer relaciones entre personas, organizaciones y lugares en articulos de varios idiomas para alimentar sistemas de seguimiento de entidades.
- Enriquecimiento de pipelines de RAG: anadir relaciones estructuradas a los fragmentos recuperados para mejorar la trazabilidad y el razonamiento sobre entidades en asistentes documentales.
- Extraccion de informacion en dominios cientificos o biomedicos: definir etiquetas de relacion propias del dominio (por ejemplo, relaciones entre farmacos y efectos) y aplicarlas sin reentrenamiento.
- Procesamiento de archivos historicos o administrativos multilingues: normalizar y relacionar entidades en fondos documentales con mezcla de lenguas (espanol, frances, italiano, rumano, etc.).
- Preprocesamiento para tareas downstream: generar relaciones candidatas que alimenten sistemas de resolucion de entidades o de verificacion de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un encoder de tipo base (repo de 2.5 GB), la inferencia en precision completa requiere del orden de varios GB de VRAM, y menos con cuantizacion o precision reducida.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, es compatible con GPUs de consumo (serie RTX) y con aceleradores de datacenter (A100, H100) para procesamiento por lotes.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint, aunque no se confirma en la documentacion.
- Opciones de despliegue: el paquete oficial `glidre` (instalable con `pip install .` desde el repositorio de GitHub) y PyTorch estandar; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| GLiDRE multi v2 | Encoder especializado en relation extraction | no disponible | no disponible | 12 | Apache 2.0 | Zero-shot document-level RE |
| Modelos generativos tipo LLM (p. ej., variantes de 7B) | Decoder generativo | orden de miles de millones | variable | amplio | variable | Requieren prompting y mayor coste computacional; no comparables en eficiencia |
| Encoders multilingues base (mdeberta-v3-base, gte-multilingual-base) | Encoder generalista | cientos de millones | no disponible | multilingue | MIT / Apache 2.0 | No especializados en relation extraction; requieren ajuste fino |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo depende de que el usuario proporcione las menciones de entidades con offsets correctos; errores en la deteccion de entidades degradan directamente la extraccion de relaciones.
- La model card senala que el rendimiento mejora con etiquetas de relacion en mayusculas, lo que introduce una dependencia de formato.
- Riesgo de alucinacion de relaciones: al ser un clasificador, puede asignar relaciones plausibles pero incorrectas, especialmente con umbrales bajos; se recomienda calibrar el parametro `threshold`.
- Cobertura linguistica limitada a los doce idiomas listados; no se garantiza comportamiento en otras lenguas.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los modelos base y de los datasets de entrenamiento (FineWeb, FineWeb-2) para cumplir sus condiciones.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que sugiere poca validacion externa; se recomienda evaluar en el dominio propio antes de produccion.
- Existe una version mantenida en `cea-list-ia/glidre_multi_v2`; la model card la referencia como `new_version`, por lo que conviene usar esa ruta para obtener la version actualizada.

## Enlaces

- Hugging Face: https://huggingface.co/rarmingaud/glidre_multi_v2
- Version mantenida: https://huggingface.co/cea-list-ia/glidre_multi_v2
- Repositorio de codigo: https://github.com/cea-list-lasti/glidre
- Paper (arXiv): https://arxiv.org/abs/2508.00757
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
