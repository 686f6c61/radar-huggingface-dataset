# LuisRey6/es_ner_sm

## Resumen

`es_ner_sm` es un pipeline de spaCy para reconocimiento de entidades nombradas (NER) en español, especializado en texto legal mexicano. Lo desarrolla Luis Reyes Aldaco (legalatlas.io) y está diseñado para extraer tres tipos de entidad: personas (PER), organizaciones (ORG) y localizaciones (LOC), con especial atención a nombres de personas escritos en mayúsculas, formas societarias, juzgados y tribunales.

El modelo resuelve un problema concreto: los pipelines NER genéricos para español rinden mal sobre boletines judiciales y tesis del Semanario Judicial de la Federación, donde los nombres de las partes aparecen en mayúsculas y con estructuras societarias complejas. `es_ner_sm` está afinado específicamente para ese dominio y declara una tasa de nombres de persona no cubiertos del 12,2 % en fragmentos de boletín, frente al 77,3 % de `es_core_news_md` de spaCy.

Se trata de un modelo pequeño y ligero, pensado para ejecutarse en CPU, con licencia MIT y distribución como wheel de spaCy. La versión publicada es la 0.1.0 y el repositorio ocupa aproximadamente 0,1 GB. No incluye vectores estáticos ni embeddings preentrenados; la representación se basa en un `tok2vec` con hashing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de spaCy con componentes `tok2vec` y `ner` (transformer no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por la segmentación de spaCy, no por una ventana fija declarada) |
| Tipos de cuantizacion | no disponible (modelo ya ligero, pensado para CPU; no se documentan variantes cuantizadas) |
| Idiomas soportados | es (español), con foco en variante mexicana |
| Licencia | MIT |
| Formato de pesos | wheel de spaCy (`es_ner_sm-0.1.0-py3-none-any.whl`), compatible con spaCy `>=3.8.18,<3.9.0` |
| Etiquetas NER | PER, ORG, LOC |
| Vectores | ninguno |
| Version | 0.1.0 |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El pipeline sigue la arquitectura estándar de spaCy para NER: un componente `tok2vec` que genera representaciones contextuales a nivel de token y un componente `ner` que clasifica cada token con un esquema BIO para las etiquetas PER, ORG y LOC. No se documenta el uso de transformers ni de atención lineal; el modelo está optimizado para inferencia en CPU y no incluye vectores estáticos. El almacén de cadenas de vocabulario está vacío (los embeddings se calculan por hashing), de modo que el pipeline no contiene ni redistribuye el texto de entrenamiento.

El entrenamiento se realizó sobre aproximadamente 197.000 frases anotadas automáticamente con Claude Haiku 5.5 mediante una guía de anotación fija, sin corrección humana. La composición es: unas 107.000 frases de Wikinews en español (CC BY 2.5), unas 28.600 frases legales sintéticas generadas con plantillas, unas 14.700 frases (x2) procedentes de 5.600 tesis del Semanario Judicial de la Federación y unas 11.000 frases (x2) de fragmentos de boletines judiciales mexicanos. En los fragmentos de boletín, todos los nombres de personas reales se sustituyeron antes del entrenamiento por nombres ficticios recompuestos, preservando la forma y las mayúsculas originales. Además, se añadió un 3 % de frases copiadas íntegramente en mayúsculas y un 6 % con solo los nombres de persona en mayúsculas. No se documenta RLHF ni DPO.

## Capacidades

- Reconocimiento de entidades nombradas en español para las categorías PER, ORG y LOC.
- Manejo específico de nombres de persona en mayúsculas, habituales en boletines judiciales y escritos procesales.
- Extracción de organizaciones con su forma societaria completa (por ejemplo, "Comercializadora del Norte, S.A. de C.V.").
- Detección de juzgados y tribunales con su nombre completo como entidad ORG.
- Detección de localizaciones (países, estados, ciudades, municipios, colonias sin la palabra "colonia", calles).
- Exclusión de títulos y cargos (C., Lic., ministro, quejoso) del span de persona.
- Exclusión de leyes y códigos de la categoría ORG.
- Ejecución en CPU sin GPU, adecuada para entornos con recursos limitados.
- Integración nativa con el ecosistema spaCy (`spacy.load`, `doc.ents`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Anonimización de boletines judiciales: el modelo detecta nombres de personas en mayúsculas para sustituirlos antes de publicar o compartir documentos. Su tasa declarada de nombres no cubiertos del 12,2 % (4,8 % si el texto se convierte antes a title case) lo hace viable como primera pasada en un pipeline de anonimización con revisión posterior.
- Extracción de partes en contratos y escritos: permite identificar demandantes, demandados y sociedades mercantiles con su forma societaria completa, lo que facilita la generación de metadatos estructurados a partir de documentos legales.
- Indexación de tesis y jurisprudencia: al procesar tesis del Semanario Judicial de la Federación, el modelo alcanza un F1 de 0,967 en PER y 0,604 en ORG, lo que permite construir índices de personas y órganos citados en resoluciones.
- Enriquecimiento de expedientes electrónicos: la detección de juzgados y tribunales como ORG posibilita clasificar documentos por órgano jurisdiccional y por localización geográfica, alimentando sistemas de gestión documental.
- Preprocesado para búsqueda legal: las entidades extraídas pueden usarse como filtros o facetas en motores de búsqueda sobre corpus judiciales, separando consultas por persona, organización o lugar.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU y ocupar unos 0,1 GB, puede integrarse en servicios contenerizados sin GPU, por ejemplo en una API interna de extracción de entidades para un despacho o una fiscalía.
- Limpieza de corpus para investigación: permite eliminar o enmascarar datos personales de conjuntos de texto legal antes de su publicación o uso en experimentos, reduciendo el riesgo de reidentificación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Evaluacion | PER F1 | ORG F1 | LOC F1 |
|---|---|---|---|
| CoNLL-2002 Spanish (test) | 0,849 | 0,650 | 0,708 |

Comparativa declarada en la model card sobre CoNLL-2002 Spanish (test):

| Modelo | PER F1 | ORG F1 | LOC F1 |
|---|---|---|---|
| es_ner_sm 0.1.0 | 0,849 | 0,650 | 0,708 |
| es_core_news_md 3.8 (GPL-3.0) | 0,847 | 0,656 | 0,658 |

Evaluación declarada sobre texto legal mexicano retenido (1.016 frases de 400 tesis del SJF y 1.000 fragmentos de boletín judicial):

| Metrica | es_ner_sm 0.1.0 | es_core_news_md 3.8 |
|---|---|---|
| Tesis PER F1 | 0,967 | 0,469 |
| Tesis ORG F1 | 0,604 | 0,256 |
| Boletin PER F1 | 0,851 | 0,169 |
| Boletin ORG F1 | 0,670 | 0,039 |
| Boletin: nombres de persona no cubiertos | 12,2 % | 77,3 % |

El autor indica además que, si el texto en mayúsculas se convierte previamente a title case, el porcentaje de nombres de boletín no cubiertos baja al 4,8 % (frente al 8,5 % de `es_core_news_md`). Como referencia del anotador automático, Claude Haiku 5.5 obtiene PER 0,966 / ORG 0,805 / LOC 0,917 sobre 400 frases de validación de CoNLL-2002.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline está diseñado para ejecutarse en CPU.
- GPU recomendadas: no aplica; no se documenta soporte GPU ni aceleración por hardware específica.
- Cabe en cualquier equipo de consumo: el repositorio ocupa unos 0,1 GB y no incluye vectores estáticos.
- Opciones de despliegue: instalación como wheel de spaCy (`pip install` del `.whl` desde Hugging Face) y carga con `spacy.load("es_ner_sm")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Etiquetas | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| es_ner_sm 0.1.0 | spaCy (tok2vec + ner) | PER, ORG, LOC | no disponible | MIT | CoNLL-2002: PER 0,849 / ORG 0,650 / LOC 0,708; tesis PER 0,967 |
| es_core_news_md 3.8 | spaCy (pipeline general español) | Esquema general de spaCy | no disponible | GPL-3.0 | CoNLL-2002: PER 0,847 / ORG 0,656 / LOC 0,658; tesis PER 0,469 |
| Claude Haiku 5.5 (referencia del autor) | LLM generativo vía API | Anotación libre | no disponible | propietaria | CoNLL-2002 validación: PER 0,966 / ORG 0,805 / LOC 0,917 |

La comparativa se limita a los datos aportados en la model card. No se dispone de información sobre otros modelos NER españoles especializados en dominio legal en la documentación proporcionada.

## Limitaciones y advertencias

- ORG es la etiqueta más débil: F1 de 0,650 en CoNLL-2002 y 0,604 en tesis; los nombres largos de juzgados a veces se cortan.
- Las anotaciones de entrenamiento son automáticas (Claude Haiku 5.5), por lo que el modelo aprende los errores sistemáticos del anotador. La evaluación en dominio legal usa etiquetas del mismo anotador, lo que puede inflar las métricas.
- Los nombres escritos en mayúsculas son menos fiables que los escritos en caja normal; se recomienda normalizar a title case antes de la inferencia cuando sea posible.
- Está afinado para uso mexicano; el español de otros países funciona (según CoNLL-2002) pero no fue el foco del entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la delimitación de spans.
- No se documentan sesgos demográficos específicos, pero al derivarse de texto judicial y de noticias puede heredar sesgos de representación de esos corpus.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de las fuentes de entrenamiento (Wikinews CC BY 2.5; texto judicial no protegido por copyright según el art. 14 LFDA).
- No es un modelo generativo: no admite instrucciones, tool calling ni razonamiento multi-paso.
- La versión es 0.1.0 y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisRey6/es_ner_sm
- Wheel de instalación: https://huggingface.co/LuisRey6/es_ner_sm/resolve/main/es_ner_sm-0.1.0-py3-none-any.whl
- Sitio del autor (legalatlas.io): https://www.legalatlas.io
- Spanish Wikinews (fuente de entrenamiento): https://es.wikinews.org
