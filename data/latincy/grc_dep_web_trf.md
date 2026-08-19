# latincy/grc_dep_web_trf

## Resumen

`latincy/grc_dep_web_trf` es un pipeline de procesamiento de lenguaje natural para griego antiguo desarrollado por Patrick J. Burns dentro del proyecto LatinCy, conocido por sus modelos de latín. Se trata de la primera generación de modelos de griego antiguo que portan la infraestructura de los pipelines de latín de LatinCy a esta lengua clásica, con el objetivo de ofrecer análisis lingüístico completo: segmentación de oraciones, etiquetado gramatical, análisis morfológico, lematización y análisis de dependencias.

El modelo está construido sobre el backbone transformer PhilBerta y ha sido entrenado con tres treebanks de Universal Dependencies (UD) para griego antiguo: PTNK, PROIEL y Perseus. Se distribuye como un paquete compatible con spaCy (versión >=3.8.11,<3.9.0) y ocupa 5.6 GB en el repositorio. Es una versión beta experimental, por lo que se esperan resultados con margen de mejora a medida que los datos de entrenamiento se armonicen y amplíen mediante el ciclo de retroalimentación del proyecto LatinCy.

La relevancia de este modelo radica en que cubre un hueco en el panorama de la PNL para lenguas clásicas: ofrece un pipeline completo y unificado para griego antiguo, integrable directamente en proyectos spaCy, sin necesidad de componer herramientas separadas. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (PhilBerta backbone) con componentes spaCy |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo spaCy, no cuantizable como LLM) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | MIT |
| Formato de pesos | spaCy pipeline (incluye pesos del transformer) |

## Arquitectura y entrenamiento

El modelo es un pipeline de spaCy que integra un transformer (PhilBerta) como backbone y una serie de componentes de análisis lingüístico que operan sobre las representaciones contextuales generadas por el transformer. Los componentes incluidos son: `senter` (segmentación de oraciones), `tagger` (etiquetado POS), `morphologizer` (análisis morfológico), `trainable_lemmatizer` y `lookup_lemmatizer` (lematización), `attribute_ruler` y `parser` (análisis de dependencias).

El entrenamiento se realizó sobre los treebanks de Universal Dependencies para griego antiguo: PTNK (Perseus), PROIEL y Perseus. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo hereda la arquitectura y el enfoque de entrenamiento de los pipelines LatinCy, que han demostrado buen rendimiento en latín y ahora se aplican al griego antiguo. No se menciona el uso de técnicas como RLHF o DPO, dado que se trata de un modelo supervisado para tareas de anotación lingüística, no de generación de texto.

## Capacidades

- Segmentación de oraciones en texto en griego antiguo.
- Etiquetado gramatical (POS) con 16 etiquetas, incluyendo categorías específicas como `conjunction_adverb` o `conjunction_pronoun`.
- Análisis morfológico completo con 1796 etiquetas posibles que combinan categoría gramatical, caso, género, número, persona, tiempo, modo y voz.
- Lematización mediante dos mecanismos combinados: un lematizador entrenable y un lematizador basado en diccionario (lookup).
- Análisis de dependencias sintácticas (parser) siguiendo el esquema de Universal Dependencies.
- Atribución de rasgos morfológicos a través del componente `attribute_ruler`.
- Integración nativa con el ecosistema spaCy: los pipelines pueden combinarse con otros componentes personalizados y usarse con las APIs estándar de spaCy.

## Casos de uso

- Investigación filológica: permite a los estudiosos del griego antiguo analizar automáticamente grandes volúmenes de texto (autores clásicos, inscripciones, papiros) para extraer patrones morfológicos y sintácticos.
- Digitalización de corpus: integrable en flujos de trabajo de humanidades digitales para convertir textos en griego antiguo en corpus anotados siguiendo el estándar Universal Dependencies.
- Enseñanza de lenguas clásicas: puede usarse como herramienta de apoyo para que estudiantes de griego antiguo verifiquen análisis morfológicos y sintácticos de frases.
- Creación de recursos lingüísticos: el pipeline puede aplicarse a nuevos textos para generar anotaciones que alimenten otros proyectos de NLP o bases de datos léxicas.
- Análisis estilométrico: los resultados del etiquetado y el parsing pueden servir de base para estudios cuantitativos de estilo autorales o de datación de textos anónimos.
- Integración en herramientas de lectura asistida: puede combinarse con interfaces de lectura digital que muestren análisis gramaticales en tiempo real de textos clásicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de precisión, recall o F1 para los distintos componentes, ni comparaciones con otros sistemas de análisis de griego antiguo.

## Requisitos de hardware

- El tamaño del repositorio es de 5.6 GB, lo que indica que el modelo requiere espacio de almacenamiento considerable.
- Al ser un pipeline basado en transformer, la inferencia requiere una GPU con al menos 8 GB de VRAM para un rendimiento razonable; el uso de CPU es posible pero con latencias altas.
- No se especifican GPUs concretas recomendadas, pero modelos transformer de tamaño similar suelen ejecutarse en GPUs como RTX 3060, RTX 4090 o A100.
- El despliegue se realiza mediante spaCy, que soporta inferencia en CPU y GPU (CUDA).
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente para griego antiguo con las mismas capacidades. Los pipelines de LatinCy para latín (por ejemplo, `la_core_web_trf` o `la_dep_web_trf`) son los homólogos más cercanos, pero operan sobre otra lengua. No se han encontrado otros modelos de griego antiguo con cobertura completa de etiquetado, morfología, lematización y parsing en el ecosistema spaCy.

## Limitaciones y advertencias

- Es una versión beta experimental: el propio autor indica que se esperan "rough edges" y que el comportamiento de los componentes mejorará con la armonización de los datos de entrenamiento.
- La cobertura morfológica y sintáctica está limitada por los treebanks de entrenamiento (PTNK, PROIEL, Perseus), que representan un subconjunto del griego antiguo (mayoritariamente prosa y poesía clásica).
- No se dispone de datos sobre sesgos específicos, pero al tratarse de un modelo entrenado sobre corpus literarios, puede tener un rendimiento inferior en textos no literarios (inscripciones, documentos administrativos, etc.).
- El riesgo de alucinación no es aplicable en el sentido de generación de texto, pero el modelo puede producir anotaciones incorrectas en textos que se alejen del dominio de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo requiere spaCy >=3.8.11,<3.9.0, lo que puede limitar su integración en proyectos que usen versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latincy/grc_dep_web_trf
- Perfil del autor en Hugging Face: https://huggingface.co/latincy
- Organización LatinCy en GitHub: https://github.com/latincy
- Paper de LatinCy (arXiv): https://ar5iv.labs.arxiv.org/html/2305.04365
- Proyecto LatinCy en spaCy Universe: https://spacy.io/universe/project/latincy
