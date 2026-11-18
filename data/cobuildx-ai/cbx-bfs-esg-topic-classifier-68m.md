# CobuildX-AI/cbx-bfs-esg-topic-classifier-68M

## Resumen

cbx-bfs-esg-topic-classifier-68M es un clasificador de texto en ingles especializado en tematicas ESG (ambiental, social y de gobernanza), desarrollado por CobuildX-AI. Se trata de un fine-tuning del encoder Ettin de 68M de parametros (jhu-clsp/ettin-encoder-68m) al que se han anadido tres cabezas de clasificacion: una para detectar hasta 15 tematicas ESG concretas, otra para identificar la tematica principal y una tercera para determinar la orientacion del pasaje (adverse, positive, neutral o mixed).

El modelo resuelve un problema muy especifico del analisis financiero y regulatorio: dado un parrafo de un informe anual, una declaracion proxy, una nota de prensa regulatoria o una nota de credito, devuelve que tematicas ESG se tratan de forma sustantiva (no meramente mencionadas), cual es la principal y si el pasaje reporta un evento adverso, una medida positiva o una descripcion neutra. Esto lo hace util para pipelines de screening ESG, vigilancia regulatoria y analisis de riesgo reputacional.

Su relevancia radica en el equilibrio entre tamano y rendimiento: con solo 68M de parametros y licencia Apache-2.0, alcanza un micro F1 de 0.852 en un conjunto de test de empresas no vistas y comunicados regulatorios de 2025-2026, superando a una linea base TF-IDF + regresion logistica (0.810). Existe tambien una version de 17M de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Ettin, base jhu-clsp/ettin-encoder-68m) con tres cabezas de clasificacion |
| Parametros totales | 68.162.595 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (el texto mas largo se trunca) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin de 68M de parametros y anade tres cabezas: una cabeza multi-etiqueta para las 15 tematicas ESG (E01-E05, S01-S06, G01-G04), una cabeza para la tematica principal (con la clase N00 para pasajes sin tematica) y una cabeza de orientacion con cuatro clases (adverse, positive, neutral, mixed). El pipeline es de extraccion de caracteristicas/clasificacion de texto y se distribuye con la libreria transformers.

El entrenamiento se realizo sobre 12.030 pasajes: 10.870 pasajes reales en ingles de 2019-2026 (presentaciones 10-K, 20-F y proxy de SEC EDGAR de unas 1.200 empresas; comunicados del Departamento de Justicia de EE. UU., SEC, Junta de la Reserva Federal y FDIC, GOV.UK y la Comision Europea) mas 1.160 pasajes generados con nombres inventados para tematicas con pocos ejemplos y negativos dificiles. Las etiquetas siguen una guia de anotacion escrita y fueron asignadas de forma independiente por dos LLM (gpt-5.4-mini y Claude Haiku 5.5), con desacuerdos y una auditoria del 10% resueltos por Claude Sonnet 5.5. En la mitad de los pasajes de entrenamiento se enmascararon nombres de agencias y tribunales; enmascararlos en test cambia el micro F1 en 0.002. El umbral por defecto (0.48) se ajusto en validacion para micro F1.

## Capacidades

- Clasificacion multi-etiqueta de 15 tematicas ESG: emisiones y clima (E01), energia (E02), agua (E03), contaminacion y residuos (E04), naturaleza y uso del suelo (E05), derechos laborales (S01), salud y seguridad laboral (S02), proteccion del cliente (S03), seguridad de producto (S04), privacidad y ciberseguridad (S05), impacto comunitario y acceso (S06), consejo y accountability ejecutiva (G01), etica y anticorrupcion (G02), integridad del reporting (G03) y finanzas responsables (G04).
- Identificacion de la tematica principal del pasaje, con la clase N00 cuando no hay tematica sustantiva.
- Clasificacion de orientacion: adverse (danos, violaciones, alegaciones, sanciones), positive (medidas o resultados concretos), neutral (politicas, declaraciones de riesgo, regulacion explicada) o mixed.
- Procesamiento por lotes: la funcion `classify` acepta una lista de pasajes.
- Umbral ajustable para priorizar recall o precision segun el caso de uso.
- No incluye tool calling, capacidades de agente, vision ni audio; es un clasificador puro de texto en ingles.

## Casos de uso

- Screening ESG de informes anuales: procesar por parrafos las secciones de sostenibilidad de 10-K y 20-F para extraer que tematicas se tratan sustantivamente y con que orientacion, alimentando un inventario de riesgos por empresa.
- Vigilancia regulatoria: clasificar comunicados de prensa de agencias (DOJ, SEC, Fed, FDIC, GOV.UK, Comision Europea) para detectar eventos adversos (sanciones, violaciones, alegaciones) y enrutarlos a los equipos de cumplimiento.
- Analisis de riesgo reputacional en notas de credito: etiquetar pasajes de notas internas para identificar exposicion a tematicas como seguridad de producto (S04) o anticorrupcion (G02) antes de conceder financiacion.
- Deteccion de greenwashing: usar la orientacion neutral frente a positive y la tematica G03 (integridad del reporting) para senalar declaraciones de politica sin medidas o resultados concretos.
- Construccion de datasets etiquetados: generar etiquetas ESG a escala sobre corpus propios como paso previo a modelos mayores o a revision humana, aprovechando el bajo coste de un modelo de 68M.
- Enriquecimiento de pipelines de due diligence: clasificar lotes de documentos por tematica y orientacion para priorizar la revision manual de los pasajes con orientacion adverse.
- Clasificacion en tiempo real en CPU: al ser un encoder de 68M, puede desplegarse en entornos sin GPU para etiquetar flujos de noticias o comunicados con baja latencia.

## Benchmarks y rendimiento

Resultados publicados en la model card. El micro F1 se calcula sobre las 15 tematicas; se incluye una linea base TF-IDF + regresion logistica entrenada con los mismos datos.

| Conjunto de test | Micro F1 | Macro F1 | Falsa alarma | Precision primaria | Precision orientacion | TF-IDF micro F1 |
|---|---:|---:|---:|---:|---:|---:|
| Empresas no vistas y comunicados regulatorios 2025-2026 (1.761 pasajes) | 0.852 | 0.842 | 0.070 | 0.875 | 0.935 | 0.810 |
| Dos reguladores nunca vistos en entrenamiento: autoridad de competencia del Reino Unido y agencia de seguridad de producto de EE. UU. (363) | 0.878 | 0.694 | 0.333 | 0.849 | 0.884 | 0.619 |
| Texto de reglas del Federal Register de EE. UU., genero ausente del entrenamiento (439) | 0.693 | 0.637 | 0.193 | 0.720 | 0.970 | 0.705 |

F1 por tematica en el conjunto principal de test (empresas no vistas y comunicados 2025-2026):

| Codigo | Tematica | F1 test |
|---|---|---:|
| E01 | Emisiones y clima | 0.833 |
| E02 | Energia y transicion | 0.840 |
| E03 | Agua | 0.831 |
| E04 | Contaminacion y residuos | 0.896 |
| E05 | Naturaleza y uso del suelo | 0.920 |
| S01 | Derechos y condiciones laborales | 0.800 |
| S02 | Salud y seguridad laboral | 0.886 |
| S03 | Proteccion del cliente | 0.810 |
| S04 | Seguridad y calidad de producto | 0.920 |
| S05 | Privacidad y ciberseguridad | 0.877 |
| S06 | Impacto comunitario y acceso | 0.841 |
| G01 | Consejo y accountability ejecutiva | 0.867 |
| G02 | Etica y anticorrupcion | 0.828 |
| G03 | Integridad del reporting | 0.769 |
| G04 | Finanzas responsables | 0.714 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 68M de parametros; en fp32 ocupa aproximadamente 0.27 GB de pesos y en fp16 unos 0.14 GB, por lo que la VRAM efectiva es minima (por debajo de 1 GB incluyendo activaciones y overhead).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada pueden ejecutarlo con holgura.
- Cabe en cualquier GPU consumer y tambien en CPU; la model card indica que funciona en CPU o GPU.
- Opciones de despliegue: transformers (libreria nativa), Text Embeddings Inference (tag text-embeddings-inference) y endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| cbx-bfs-esg-topic-classifier-68M | 68M | 512 tokens | Clasificacion ESG multi-etiqueta + orientacion | Apache-2.0 | Hugging Face |
| cbx-bfs-esg-topic-classifier-17M (version del mismo autor) | 17M | no disponible | Clasificacion ESG multi-etiqueta | no disponible | Hugging Face |
| jhu-clsp/ettin-encoder-68m (modelo base) | 68M | no disponible | Encoder general (extraccion de caracteristicas) | no disponible | Hugging Face |
| TF-IDF + regresion logistica (linea base de la model card) | no aplica | no aplica | Clasificacion ESG | no aplica | Referencia interna |

No se dispone de datos de benchmarks de la version de 17M ni del modelo base en la informacion proporcionada, por lo que la comparacion de rendimiento se limita a la linea base TF-IDF reportada en la model card.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado exclusivamente en prosa inglesa; no se garantiza su comportamiento en otros idiomas.
- Contexto limitado a 512 tokens: los textos mas largos se truncan y se marca `"truncated": True`; es necesario dividir documentos largos en parrafos.
- Entrenado con pasajes de unas 75-250 palabras; tablas, figuras, encabezados y listas de numeros quedan fuera de su dominio de entrenamiento.
- Falsa alarma elevada en dominios no vistos: 0.333 en los dos reguladores no vistos y 0.193 en texto del Federal Register, frente a 0.070 en el conjunto principal. El rendimiento cae de forma notable en generos ausentes del entrenamiento (micro F1 0.693 en reglas del Federal Register).
- Tematicas con menor F1: G04 (finanzas responsables, 0.714) y G03 (integridad del reporting, 0.769) son las mas debiles; conviene revisar manualmente sus predicciones.
- Etiquetado generado por LLM: las etiquetas de entrenamiento fueron asignadas por modelos (gpt-5.4-mini, Claude Haiku 5.5 y Claude Sonnet 5.5 para desacuerdos), no por anotadores humanos, lo que puede introducir sesgos sistematicos del anotador.
- Riesgo de alucinacion: al ser un clasificador y no un generador, no produce texto libre, pero puede asignar tematicas incorrectas o forzar una tematica principal cuando el pasaje no la tiene.
- Uso comercial permitido por la licencia Apache-2.0, sin restricciones adicionales documentadas; aun asi, la model card remite a la seccion "Intended use and disclaimer" antes de su uso.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-bfs-esg-topic-classifier-68M
- Modelo base Ettin encoder 68M: https://huggingface.co/jhu-clsp/ettin-encoder-68m
