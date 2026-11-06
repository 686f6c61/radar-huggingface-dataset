# mschonhardt/ius-commune-citations-ner

## Resumen

`ius-commune-citations-ner` es un etiquetador de secuencias basado en Flair, desarrollado por Michael Schonhardt en el marco del proyecto *Embedding the Past* (LOEWE-Exploration, TU Darmstadt y AdWL Mainz, financiado por HMWK Hessen). Su funcion es localizar y clasificar citas del derecho comun (Corpus iuris civilis, Corpus iuris canonici, Libri feudorum) y entidades nombradas (juristas, glosas, estatutos, personas, lugares, instituciones y fechas) en prosa juridica latina de los siglos XIII al XVI.

El modelo resuelve un problema especifico de las humanidades digitales: la anotacion manual de corpus de *consilia*, comentarios y *tractatus* es inviable a escala, y las citas medievales aparecen en formas abreviadas muy irregulares ("ff. de pac. l. tale pactum. §. fi.", "extra de proba. c. cum causam."). Con este etiquetador, un corpus puede indexarse por autoridades citadas, juristas seguidos y partes o lugares implicados, lo que hace buscable la textura argumentativa del *ius commune* a gran escala.

Tecnicamente combina un `SequenceTagger` de Flair con capa CRF sobre embeddings apilados: el modelo `MediBerta` (continuacion del preentrenamiento de XLM-RoBERTa-large sobre latin medieval) y dos modelos de lenguaje de caracteres con contexto (`latin-legal-forward` y `latin-legal-backward`) congelados. Emplea formato BIOES con 10 tipos de span y 43 etiquetas. Es relevante ahora porque demuestra un flujo de anotacion asistida por LLM (Gemini 4 Argon) con verificacion por muestreo, aplicado a un dominio linguistico historicamente desatendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flair `SequenceTagger` con CRF sobre embeddings apilados (MediBerta + embeddings de caracteres forward/backward) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de MediBerta, basado en XLM-RoBERTa-large) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | latin (la) |
| Licencia | CC BY 4.0 |
| Formato de pesos | pesos de Flair (pytorch); tamano del repo 2.7 GB |
| Etiquetas | 43 etiquetas BIOES, 10 tipos de span |
| Modelo base | `mschonhardt/MediBerta`, `mschonhardt/latin-legal-forward`, `mschonhardt/latin-legal-backward` |
| Libreria | flair |
| Pipeline | token-classification |
| Emisiones CO2eq | 1100 g (estimacion por horas de GPU, consumo y factor de red aleman) |
| Hardware de entrenamiento | 1 x NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) |

Tipos de span: `CIT_CIV`, `CIT_CAN`, `CIT_FEUD`, `CIT_OTHER`, `JURIST`, `STATUTE`, `PERSON`, `PLACE`, `ORG`, `DATE`.

## Arquitectura y entrenamiento

El modelo es un `SequenceTagger` de Flair con una capa CRF final que decodifica secuencias de etiquetas BIOES. La representacion de entrada apila tres fuentes: `MediBerta`, un XLM-RoBERTa-large con preentrenamiento continuado sobre latin medieval, afinado durante el entrenamiento con *first-subtoken pooling* y contexto de documento; y dos embeddings contextuales de cadena (`latin-legal-forward` y `latin-legal-backward`), modelos de lenguaje de caracteres entrenados sobre texto juridico latino y mantenidos congelados.

Los datos de entrenamiento proceden de la edicion Consilia: Baldus de Ubaldis, *Consilia* (Venecia 1575, cinco volumenes, 2.514 consilia) y Nicolaus de Tudeschis (Panormitanus), *Consilia* (Venecia 1571, 226 consilia). Las 10.322 unidades de texto fueron anotadas por Gemini 4 Argon, que debia marcar cada cita y nombre como cita verbatim; una comprobacion por lectura de una muestra estratificada de 150 consilia estimo una exhaustividad de aproximadamente el 99,9 % en la muestra. Las citas se localizaron en el texto y se convirtieron a etiquetas BIOES, con particion por consilium para evitar fugas entre conjuntos.

| Split | Frases | Tokens | Spans |
|---|---|---|---|
| train | 89.250 | 2.358.486 | 91.088 |
| dev | 11.990 | 307.665 | 11.689 |
| test | 10.511 | 264.367 | 9.777 |

Distribucion de spans en entrenamiento: CIT_CIV 42.546, PERSON 17.302, JURIST 13.907, CIT_CAN 11.101, PLACE 2.360, ORG 1.699, STATUTE 802, CIT_FEUD 786, DATE 295, CIT_OTHER 290. El entrenamiento duro 20 epocas con tasa de aprendizaje 5e-5 (schedule lineal con 10 % de warm-up), minibatches de 16 frases, mezcla y precision mixta, checkpoint por epoca y seleccion por span F1 en dev; 5,1 horas en una GPU (unos 15 minutos por epoca).

## Capacidades

- Reconocimiento de entidades nombradas y citas en latin juridico medieval y moderno temprano (siglos XIII-XVI).
- Deteccion de citas del Corpus iuris civilis en forma abreviada medieval (`CIT_CIV`).
- Deteccion de citas del Corpus iuris canonici (`CIT_CAN`), de los Libri feudorum (`CIT_FEUD`) y de otras obras como Escritura, filosofia o literatura (`CIT_OTHER`).
- Identificacion de juristas y glosas citados por nombre o siglum: `Bar.`, `Inno.`, `Cyn.`, `Io. And.`, `glo. ord.` (`JURIST`).
- Deteccion de estatutos y derechos locales (`STATUTE`), personas y partes del caso (`PERSON`), lugares (`PLACE`), instituciones, comunas e iglesias (`ORG`) y fechas (`DATE`).
- Segmentacion de spans segun la forma impresa: la referencia completa desde el primer siglum hasta el ultimo elemento; las cadenas unidas por "et" se separan en spans distintos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un etiquetador de secuencias, no un modelo generativo.
- No soporta vision, audio ni modo de razonamiento.

## Casos de uso

- Indexacion de corpus de consilia por autoridad citada: procesar un corpus completo con el tagger y construir un indice invertido de citas del Corpus iuris civilis y canonici, de modo que un investigador pueda localizar todos los pasajes que invocan una ley concreta.
- Analisis de redes de autoridad entre juristas: extraer las etiquetas `JURIST` de un corpus de comentarios y medir que juristas cita cada autor, con que frecuencia y en que contextos argumentativos.
- Busqueda de partes y lugares en pleitos historicos: usar `PERSON`, `PLACE` y `ORG` para reconstruir los litigantes y las jurisdicciones implicadas en colecciones de consilia, facilitando estudios prosopograficos y de historia local.
- Extraccion de estatutos locales: identificar referencias a estatutos comunales (`STATUTE`) para estudiar la interaccion entre derecho comun y derechos propios en la practica judicial.
- Normalizacion y enriquecimiento de ediciones digitales: anotar textos latinos ya digitalizados con spans de citas y entidades, generando TEI o JSON estructurado para portales como el Consilia portal.
- Datos de entrenamiento para modelos mayores: usar las anotaciones como silver standard para afinar modelos generativos o para construir conjuntos de evaluacion en tareas de extraccion de informacion juridica historica.
- Investigacion en humanidades digitales: analizar la textura argumentativa de tractatus y comentarios midiendo la densidad y diversidad de citas por seccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test reservado de Consilia (silver standard, 10.511 frases):

| Metrica | Valor |
|---|---|
| Span F1 (micro) | 0,912 |
| Span F1 (macro) | 0,744 |

La diferencia entre micro y macro refleja el fuerte desbalance entre etiquetas: las clases mayoritarias (CIT_CIV, PERSON, JURIST) dominan el micro, mientras que categorias con pocos ejemplos en entrenamiento (DATE con 295 spans, CIT_OTHER con 290) reducen la macro. No se han publicado en la informacion disponible resultados por etiqueta ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 2,7 GB y combina un transformer tipo XLM-RoBERTa-large con dos modelos de caracteres, por lo que se requiere una GPU con al menos 8-16 GB para procesar lotes comodos.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usada en entrenamiento), A100, H100 o RTX 4090 para procesamiento por lotes de corpus grandes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060/4060 en adelante), aunque el rendimiento en corpus extensos mejora con GPUs de gama alta.
- Opciones de despliegue: libreria Flair (carga directa del `SequenceTagger`); no hay pesos GGUF ni soporte nativo en vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento de 20 epocas sobre 89.250 frases requirio 5,1 horas en una sola GPU, lo que da una idea del orden de magnitud del coste de computo.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de NER para citas juridicas latinas medievales con los que establecer una comparacion cuantitativa. Como referencias cercanas de la misma familia del autor cabria citar `mschonhardt/MediBerta` (modelo base de representacion, no un etiquetador) y los modelos de embeddings de caracteres `latin-legal-forward` y `latin-legal-backward`, que son componentes internos de este sistema y no alternativas funcionales. Para NER juridico en latin clasico o en lenguas modernas existen otros sistemas, pero no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo procesa latin; no soporta castellano ni otras lenguas modernas.
- El dominio esta restringido a prosa juridica latina de los siglos XIII-XVI (ius commune); el rendimiento fuera de ese registro, genero o periodo no esta documentado.
- El conjunto de test es un silver standard generado por Gemini 4 Argon, no una anotacion humana completa; el F1 de 0,912 puede estar inflado respecto a un gold standard humano.
- La exhaustividad de la anotacion automatica se verifico solo sobre una muestra de 150 consilia (99,9 % estimado); no hay garantia equivalente para la precision.
- Riesgo de falsos positivos en abreviaturas ambiguas y en cadenas de citas unidas por "et", donde la segmentacion depende de la forma impresa.
- El desbalance de clases es acusado: DATE, CIT_OTHER, CIT_FEUD y STATUTE tienen muy pocos ejemplos, por lo que su F1 individual sera previsiblemente bajo (el macro F1 de 0,744 lo refleja).
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero conviene revisar los derechos sobre los textos fuente de la edicion Consilia (Venecia 1575 y 1571) si se redistribuyen datos derivados.
- Al ser un etiquetador y no un modelo generativo, no produce texto ni razona; cualquier uso que requiera interpretacion juridica debe combinarse con otros componentes.
- No se han publicado analisis de sesgos; en un corpus historico es esperable que se reproduzcan los sesgos de la edicion y de la seleccion documental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mschonhardt/ius-commune-citations-ner
- Modelo base MediBerta: https://huggingface.co/mschonhardt/MediBerta
- Embeddings de caracteres forward: https://huggingface.co/mschonhardt/latin-legal-forward
- Embeddings de caracteres backward: https://huggingface.co/mschonhardt/latin-legal-backward
- XLM-RoBERTa-large (base original): https://huggingface.co/FacebookAI/xlm-roberta-large
- Portal Consilia: https://dekm-tud.github.io/coding-consilia/
- DOI del modelo: https://doi.org/10.57967/hf/11325
