# LuisRey6/cs_ner_sm

## Resumen

`cs_ner_sm` es un pipeline de spaCy para reconocimiento de entidades nombradas (NER) en checo, desarrollado por Luis Reyes Aldaco (legalatlas.io). Detecta tres tipos de entidades estadísticas (PER, ORG, LOC) y siete categorías de identificadores y contactos checos mediante reglas (rodné číslo, IČO, DIČ, cuenta bancaria, teléfono, correo electrónico y web). Está pensado para ejecutarse en CPU y para uso comercial, con licencia MIT.

El modelo se distribuye como paquete wheel de spaCy (versión 0.2.0) y ocupa unos 0,1 GB. Su componente `ner` es un parser de transiciones con codificador CNN (`TransitionBasedParser.v2`), mientras que las etiquetas de identificadores se resuelven con expresiones regulares y validación de dígito de control donde existe. No incluye vectores estáticos: el `tok2vec` se preentrenó con `spacy pretrain` sobre texto checo de Wikinews y Wikipedia.

Su relevancia radica en cubrir un hueco poco atendido: NER checo ligero, con etiquetado de PII y datos fiscales/mercantiles, y con una licencia permisiva que permite integrarlo en productos comerciales sin las restricciones de los modelos `cs-core-news-*` de spaCy (CC BY-NC-SA). El rendimiento es modesto: micro F1 de 0,610 en CNEC 2.0, con ORG claramente por debajo del resto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy: `tok2vec` + `ner` (CNN transition-based, `TransitionBasedParser.v2`) + componente de reglas `cs_pii_rules` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por documento, sin ventana fija declarada) |
| Tipos de cuantizacion | no aplica (modelo spaCy; sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | checo (cs) |
| Licencia | MIT |
| Formato de pesos | paquete wheel de spaCy (`cs_ner_sm-0.2.0-py3-none-any.whl`); sin safetensors ni GGUF |
| Version | 0.2.0 |
| Compatibilidad spaCy | `>=3.8.18,<3.9.0` |
| Tamano del repo | 0,1 GB |
| Etiquetas estadisticas | PER, ORG, LOC |
| Etiquetas por reglas | BIRTH_NUMBER, COMPANY_ID, VAT_ID, BANK_ACCOUNT, PHONE, EMAIL, WEB |
| Tokenizador | `spacy_cs.ud_tokenizer.v1` (alineado con treebanks UD checos) |
| Vectores | ninguno |

## Arquitectura y entrenamiento

El pipeline combina dos capas. La primera es un componente `ner` estadístico basado en un parser de transiciones con codificador convolucional (CNN), la arquitectura estándar de spaCy para NER. La segunda es `cs_pii_rules`, un componente determinista en modo `ids` que aplica expresiones regulares con validación de dígito de control cuando el formato lo permite (rodné číslo, IČO, cuentas bancarias e IBAN). Cuando una regla y el modelo se solapan, la regla tiene prioridad. El tokenizador se alinea con los criterios de los treebanks checos de Universal Dependencies, separando puntos de abreviaturas e iniciales.

Los datos de entrenamiento son unas 56.000 frases con 84.031 entidades, anotadas automáticamente con Claude Haiku 5.5 (Anthropic) siguiendo una guía de anotación fija, sin corrección humana. Las fuentes son Wikinews checo (CC BY 4.0), Wikipedia checa (CC BY-SA 4.0) y resoluciones judiciales checas (obras oficiales no protegidas por derechos de autor según la Ley 121/2000). El corpus CNEC 2.0 se usó exclusivamente para evaluación, nunca para entrenamiento; el modelo se seleccionó sobre el conjunto de desarrollo de CNEC y se midió una única vez en test. La versión 0.2.0 corrige el tratamiento de nombres con iniciales (por ejemplo, "J. Novák" o "T. G. Masaryk"), que en 0.1.0 se truncaban por un fallo del segmentador de frases, y deja de etiquetar como organización las etiquetas "DIČ" e "IČO".

## Capacidades

- Reconocimiento de entidades nombradas en checo para personas (PER), organizaciones (ORG) y lugares (LOC).
- Detección de identificadores checos: rodné číslo (BIRTH_NUMBER), IČO (COMPANY_ID), DIČ (VAT_ID), cuentas bancarias e IBAN (BANK_ACCOUNT), con validación de dígito de control cuando el formato lo permite.
- Detección de contactos: teléfono (PHONE), correo electrónico (EMAIL) y URL (WEB).
- Manejo de nombres con iniciales ("J. Novák", "T. G. Masaryk", "George W. Bush"), corregido en 0.2.0.
- Tokenización específica para checo alineada con Universal Dependencies.
- Ejecución en CPU sin GPU, adecuada para entornos con recursos limitados.
- Posibilidad de cargar solo el componente estadístico con `spacy.load("cs_ner_sm", exclude=["cs_pii_rules"])`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo discriminativo de etiquetado de tokens.
- Sin capacidades multilingües: solo checo.

## Casos de uso

- Anonimización y enmascarado de PII en documentos checos: el pipeline detecta personas, organizaciones y, sobre todo, identificadores fiscales, números de cuenta y contactos, lo que permite sustituirlos antes de almacenar o compartir textos legales o administrativos.
- Preprocesamiento de contratos y documentos mercantiles checos: extracción de IČO, DIČ y cuentas bancarias con validación de dígito de control, útil para pipelines de ingesta documental en despachos y departamentos legales.
- Enriquecimiento de expedientes judiciales: las resoluciones de `rozhodnuti.justice.cz` son una de las fuentes de entrenamiento, por lo que el modelo está ajustado al registro y a los formatos de ese dominio.
- Moderación y cumplimiento en atención al cliente: detección de datos personales y de contacto en mensajes de usuarios checos antes de enviarlos a sistemas externos o de registrarlos.
- Indexación y búsqueda de entidades en corpus periodísticos checos: etiquetado de personas, lugares e instituciones en artículos de Wikinews o Wikipedia para construir índices de entidades y grafos de conocimiento.
- Extracción de datos estructurados de facturas y formularios checos: combinación de la capa de reglas (IČO, DIČ, IBAN, teléfono, correo) con el NER estadístico para poblar bases de datos de proveedores y clientes.
- Filtrado previo en pipelines de LLM: usar el modelo como primera pasada barata en CPU para marcar PII antes de enviar texto a un modelo generativo, reduciendo coste y exposición de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de Czech Named Entity Corpus 2.0 (CNEC), mapeado a PER/ORG/LOC. Las métricas no están verificadas de forma independiente según el model-index.

| Modelo | PER F1 | ORG F1 | LOC F1 | Micro F1 |
|---|---|---|---|---|
| cs_ner_sm 0.2.0 | 0,702 | 0,436 | 0,632 | 0,610 |
| cs_ner_sm 0.1.0 | 0,696 | 0,416 | 0,624 | 0,599 |
| cs-core-news-sm 0.2.1 (CC BY-NC-SA) | 0,642 | 0,255 | 0,562 | 0,515 |
| Claude Haiku 5.5 vía API (anotador de referencia, no local) | 0,895 | 0,664 | 0,771 | no disponible |

En el conjunto de desarrollo propio del autor (692 frases, mismo esquema de anotación que el entrenamiento) el modelo alcanza F 0,831. El autor atribuye el bajo ORG en CNEC a diferencias de guía de anotación (medios y productos), que afectan a todos los sistemas evaluados.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse sin GPU; el paquete pesa unos 0,1 GB y no incluye vectores estáticos, por lo que la huella en memoria es reducida.
- VRAM estimada: no aplica en despliegue CPU; no se han publicado requisitos de GPU.
- GPU recomendadas: no disponibles; el modelo no requiere GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (contenedores, funciones serverless, portátiles).
- Despliegue: spaCy nativo (`spacy.load`), instalación del wheel vía pip; compatible con `spacy serve` y con el empaquetado estándar de spaCy. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Micro F1 (CNEC 2.0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cs_ner_sm 0.2.0 | 0,1 GB (repo) | no disponible | 0,610 | MIT | Hugging Face (wheel spaCy) |
| cs-core-news-sm 0.2.1 | no disponible | no disponible | 0,515 | CC BY-NC-SA | Hugging Face / spaCy models |
| Claude Haiku 5.5 (API) | no disponible | no disponible | no disponible (PER 0,895 / ORG 0,664 / LOC 0,771) | propietaria | API de Anthropic |

Frente a `cs-core-news-sm`, el modelo de LuisRey6 obtiene un micro F1 superior (0,610 frente a 0,515) y añade etiquetas de identificadores y contactos, además de una licencia MIT que permite uso comercial. La contrapartida es que `cs-core-news-sm` es un modelo generalista mantenido por el ecosistema spaCy y con mayor recorrido de uso. Claude Haiku 5.5, usado como anotador de referencia, supera a ambos en todas las etiquetas, pero no es un modelo local ni está pensado para este despliegue.

## Limitaciones y advertencias

- ORG es la etiqueta más débil (F1 0,436): los nombres largos de instituciones suelen truncarse y los medios, productos y eventos no se etiquetan como organización.
- Las anotaciones de entrenamiento son automáticas (Claude Haiku 5.5) y no fueron corregidas por humanos; el modelo aprende los errores sistemáticos del anotador.
- Las reglas de identificadores cubren únicamente formatos checos; no detectan equivalentes de otros países.
- El modelo solo procesa checo; no hay soporte multilingüe.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades, especialmente en textos con registro muy distinto al de las fuentes de entrenamiento.
- Las métricas del model-index están marcadas como no verificadas; proceden del propio autor.
- La licencia MIT permite uso comercial, pero las fuentes de entrenamiento tienen licencias propias (CC BY 4.0, CC BY-SA 4.0); el autor declara que el pipeline no contiene ni redistribuye el texto de entrenamiento.
- Dependencia estricta de la versión de spaCy (`>=3.8.18,<3.9.0`), lo que puede complicar la integración en entornos con otras versiones fijadas.
- Sin datos publicados de latencia ni throughput para dimensionar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisRey6/cs_ner_sm
- Pull request del tokenizador checo en spaCy: https://github.com/explosion/spaCy/pull/14079
- Sitio del autor: https://www.legalatlas.io
- Czech Wikinews: https://cs.wikinews.org
- Wikipedia en checo: https://cs.wikipedia.org
- Resoluciones judiciales checas: https://rozhodnuti.justice.cz
