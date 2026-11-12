# scienceverse/bibr-parser-v7-mmbert-small

## Resumen

`reference-parser-mmbert-small-v7` es un modelo especializado en la extracción estructurada de referencias bibliográficas a partir de cadenas de texto sin procesar. Lo desarrolla el proyecto scienceverse como componente del pipeline bibr, concretamente en la etapa `extract/references`, y sustituye a la versión anterior `scienceverse/bibr-parser-v5-1-ultrabert`. No es un modelo generativo: es un etiquetador de secuencias (NER) que asigna etiquetas BIO a los campos de una referencia (autor, título, revista, volumen, año, DOI, etc.).

Se construye sobre el encoder multilingüe `jhu-clsp/mmBERT-small` y añade una cabeza lineal con CRF sobre 39 etiquetas BIO que cubren 19 campos bibliográficos. Se distribuye exclusivamente en formato ONNX con embeddings cuantizados a int8 (268,7 MB, frente a 562,6 MB en fp32), lo que lo hace apto para inferencia en CPU con latencias de decenas de milisegundos por referencia.

Su relevancia práctica reside en que mejora de forma sustancial al modelo que reemplaza en casi todos los conjuntos de evaluación publicados, con incrementos notables en referencias en cirílico (+0,361 en exactitud de referencia) y en etiquetas distantes de Crossref (+0,347), además de reducir a la mitad el coste de inferencia en CPU. Está pensado para integrarse en flujos de extracción de metadatos científicos a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (jhu-clsp/mmBERT-small) + cabeza lineal con CRF, 39 etiquetas BIO sobre 19 campos |
| Parametros totales | no disponible (pesos ONNX de 268,7 MB en int8; 562,6 MB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (una referencia por entrada) |
| Tipos de cuantizacion | int8 en embeddings (version distribuida); fp32 disponible como referencia de tamano |
| Idiomas soportados | Entrenamiento principal 98% ingles; cobertura multilingue en de, es, fr, it, ja, pl, pt, ru, uk, zh |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx`), tokenizer JSON, configuracion JSON |

## Arquitectura y entrenamiento

El modelo es un encoder `jhu-clsp/mmBERT-small` (multilingue) con una cabeza de clasificacion token a token compuesta por una capa lineal seguida de un CRF. Emite 39 etiquetas BIO que cubren 19 campos bibliograficos. La entrada es una unica cadena de referencia, con el numero de lista eliminado y sin tokens especiales, truncada a 256 tokens. No es un modelo generativo ni un LLM: no produce texto, solo etiquetas por token que el pipeline bibr ensambla en campos estructurados.

El entrenamiento combina varias fuentes: 1.586.198 filas en total, de las cuales 508.331 son `main_v7` (cadenas de referencia JATS de PMC, Europe PMC, SciELO y LinkedBooks, procedentes de 14.480 articulos), 758.115 de PDF (etiquetas proyectadas sobre cadenas de referencia extraidas por bibr, 24.358 articulos antes del filtro), 264.470 multilingues (referencias renderizadas mediante estilos CSL y conjuntos anotados abiertos) y 55.282 de Crossref (etiquetas distantes). Las etiquetas provienen del marcado JATS `mixed-citation` y `element-citation`, de marcas sinteticas de estilo de cita y de registros Crossref alineados. Todas las fuentes pasaron un filtro de exclusion (`corpus-split-v1`) que garantiza que ningun conjunto de evaluacion se filtrara al entrenamiento, con 0 discrepancias de particion. Las licencias de los datos de entrenamiento son CC BY, CC0 y CC BY-SA, y se excluyeron explicitamente filas de AnyStyle (BSD-2-Clause) y SIRIS (MIT) por politica de licencias.

## Capacidades

- Extraccion de campos bibliograficos estructurados a partir de una cadena de referencia: autores, titulo, revista, volumen, numero, paginas, ano, DOI, editor, tipo de publicacion y otros hasta 19 campos.
- Etiquetado NER token a token con decodificacion CRF, que impone coherencia en la secuencia de etiquetas.
- Procesamiento de referencias en ingles (idioma dominante del entrenamiento) y cobertura multilingue en aleman, espanol, frances, italiano, japones, polaco, portugues, ruso, ucraniano y chino.
- Manejo de cadenas de referencia procedentes tanto de XML JATS como de PDF extraidos.
- Inferencia en CPU eficiente gracias a la exportacion ONNX con embeddings int8.
- No soporta generacion de texto, tool calling, function calling, agentes, vision ni audio.
- No es un modelo conversacional ni de razonamiento multi-paso.

## Casos de uso

- Enriquecimiento de metadatos en repositorios cientificos: dado un listado de referencias en XML JATS o extraido de PDF, el modelo etiqueta cada token y permite reconstruir los campos estructurados (autor, titulo, revista, ano, DOI) para poblar bases de datos bibliograficas.
- Construccion de grafos de citacion: al parsear referencias de forma precisa se pueden resolver enlaces entre articulos y generar redes de citas con menor tasa de errores de enlace, especialmente en corpus multilingues donde otros parsers fallan.
- Procesamiento masivo de literatura en CPU: con 17,9 ms por referencia en ONNX a 4 hilos y batch 32, es viable procesar millones de referencias en infraestructura sin GPU, algo relevante para bibliotecas digitales y servicios de indexacion.
- Limpieza de bibliografias en gestores de referencia: integrado en herramientas tipo Zotero o en pipelines propios, permite normalizar entradas importadas de fuentes dispares (PDF, Crossref, JATS) y detectar campos mal asignados.
- Analisis bibliometrico y de tendencias: la extraccion fiable de revista, ano y DOI sobre corpus grandes permite calcular indicadores de produccion cientifica por pais, area o idioma, incluidos corpus en cirilico donde el modelo anterior tenia un rendimiento muy bajo (0,106 frente a 0,467 en `cyrillic_real`).
- Verificacion y control de calidad editorial: en el flujo de revision de manuscritos, el parser puede comparar las referencias enviadas por autores con los metadatos depositados en Crossref y senalar discrepancias antes de la publicacion.
- Digitalizacion de fondos antiguos o escaneados: al operar sobre cadenas de referencia extraidas de PDF, sirve para recuperar metadatos de articulos historicos cuyos PDF no incluyen XML estructurado.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna "Shipped" corresponde al modelo anterior (`bibr-parser-v5-1-ultrabert`) y "Difference" a la mejora del nuevo modelo.

| Conjunto | Metrica | Valor | Shipped | Diferencia |
|---|---|---|---|---|
| v6_dev (4.976 filas) | ref_exact | 0,94 | 0,864 | +0,076 |
| v6_test (4.959 filas) | ref_exact | 0,938 | 0,841 | +0,097 |
| v6_test_jd (4.367 filas; revistas no vistas) | ref_exact | 0,933 | 0,822 | +0,111 |
| pdf_test_jd (4.996 filas; PDF, revistas no vistas) | ref_exact | 0,952 | 0,902 | +0,050 |
| multiling_gold_v1 (600 cadenas, 10 idiomas) | exact_rows all fields | 0,513 | 0,398 | +0,115 |
| multiling_gold_v1 | exact_rows core fields | 0,56 | 0,47 | +0,09 |
| cyrillic_real (716 filas) | ref_exact | 0,467 | 0,106 | +0,361 |
| crossref_test (3.524 filas; etiquetas distantes) | ref_exact | 0,9 | 0,553 | +0,347 |
| crossref_test_jd (3.774 filas; etiquetas distantes) | ref_exact | 0,812 | 0,672 | +0,140 |
| excite_dev | ref_exact | 0,702 | 0,664 | +0,038 |
| linkedbooks_dev | ref_exact | 0,809 | 0,831 | -0,022 |
| RenoBench | ref_exact | 0,727 | 0,724 | +0,003 |
| v4.5 gold val | ref_exact | 0,845 | 0,931 | -0,086 |
| jats_test | record_exact_core | 0,61 | 0,779 | -0,169 |

Desglose multilingue (`multiling_gold_v1`, exact_rows all fields por idioma): de 0,567, es 0,75, fr 0,55, it 0,617, ja 0,417, pl 0,45, pt 0,6, ru 0,417, uk 0,317, zh 0,45.

Rendimiento de inferencia (ONNX, batch 32, 2.000 filas de v6_dev):

| Configuracion | cpu_ms_per_ref | Shipped |
|---|---|---|
| 4 hilos | 17,9 | 39,5 |
| 1 hilo | 36,6 | 81,4 |

Paridad ONNX frente a PyTorch: 1998 de 2000 etiquetas coinciden.

Evaluacion de pipeline completo (referencias, no solo parser):

| Conjunto | Campo | Valor | Shipped | Diferencia |
|---|---|---|---|---|
| audience_eval200 (198 papers) | refs.title | 0,976 | 0,971 | +0,005 |
| audience_eval200 | refs.volume | 0,984 | 0,948 | +0,036 |
| audience_eval200 | refs.journal | 0,925 | 0,919 | +0,006 |
| audience_eval200 | refs.author | 0,988 | 0,989 | -0,001 |
| gate192 (190 papers) | refs.volume | 0,94 | 0,915 | +0,025 |
| gate192 | refs.journal | 0,82 | 0,806 | +0,014 |
| gate192 | refs.title | 0,959 | 0,968 | -0,009 |

## Requisitos de hardware

- VRAM para GPU: no aplica en la practica; el modelo esta pensado para CPU. Los pesos ONNX int8 ocupan 268,7 MB en disco y pueden residir en memoria del sistema.
- GPU recomendadas: no se especifican; al ser un encoder pequeno con ONNX, cualquier GPU con suficiente memoria (incluso integradas) puede ejecutarlo, pero no es el objetivo del despliegue.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque el caso de uso declarado es CPU.
- Opciones de despliegue: ONNX Runtime (formato distribuido, cargado por `OnnxRefParser` de bibr); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 17,9 ms por referencia con 4 hilos y batch 32; 36,6 ms por referencia con 1 hilo y batch 32 (medido en v6_dev, 2.000 filas).
- Throughput estimado: aproximadamente 56 referencias por segundo con 4 hilos y batch 32; unas 27 por segundo con 1 hilo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| reference-parser-mmbert-small-v7 (este) | Encoder NER + CRF | no disponible (268,7 MB int8) | 256 tokens | MIT | ONNX | Especializado en referencias, multilingue, CPU |
| bibr-parser-v5-1-ultrabert (predecesor) | Encoder NER | no disponible | no disponible | MIT (presumible, no confirmado) | no disponible | Sustituido por esta version; peor en casi todos los conjuntos |
| GROBID (parser de referencias) | Pipeline CRF/deep learning | no disponible | no disponible | BSD-2-Clause (proyecto GROBID) | varios | Referencia de la industria para extraccion de PDF; datos de entrenamiento parcialmente reutilizados aqui |
| AnyStyle | Parser basado en reglas/ML | no disponible | no disponible | BSD-2-Clause | varios | Excluido del entrenamiento por politica de licencias |

## Limitaciones y advertencias

- Solo procesa una referencia por entrada y trunca a 256 tokens; referencias mas largas pueden perder campos finales.
- El entrenamiento principal es 98% en ingles; el rendimiento en idiomas como ucraniano (0,317) o japones (0,417) en exactitud de todos los campos es notablemente inferior al de espanol (0,75) o portugues (0,6).
- Debilidad conocida documentada: las citas de libros con el formato de Nature ("Authors. Title (Publisher, year).") se interpretan como nombre de revista sin titulo (12 de 8.531 entradas en gate192 y 2 de 8.979 en audience_eval200, confirmado por el gold).
- En `jats_test` y `v4.5 gold val` el modelo rinde por debajo del anterior, pero la model card aclara que el modelo anterior estaba evaluado in-sample en esos conjuntos, por lo que la comparacion no es limpia.
- Riesgo de alucinacion: al ser un etiquetador, no inventa texto, pero puede asignar etiquetas incorrectas a tokens ambiguos, produciendo campos mal extraidos que parecen validos.
- Sesgos: dependen de la composicion del corpus (mayoritariamente ingles, JATS y PDF de PMC, Europe PMC y SciELO); revistas y estilos de cita poco representados pueden degradar la precision.
- Licencia MIT permite uso comercial, pero las licencias de los datos de entrenamiento (CC BY, CC0, CC BY-SA) deben tenerse en cuenta si se redistribuyen derivados; el modelo se distribuye como pesos ONNX, no como datos.
- No es un modelo generativo: no debe usarse para tareas de lenguaje general, resumen, traduccion ni dialogo.
- El modelo depende del pipeline bibr para el ensamblado de campos; su evaluacion end-to-end asume el resto de componentes del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scienceverse/bibr-parser-v7-mmbert-small
- Modelo predecesor: https://huggingface.co/scienceverse/bibr-parser-v5-1-ultrabert
- Encoder base: https://huggingface.co/jhu-clsp/mmBERT-small
- Proyecto bibr (referencia en la model card, sin URL explicita): no disponible
- Paper o blog del modelo: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
