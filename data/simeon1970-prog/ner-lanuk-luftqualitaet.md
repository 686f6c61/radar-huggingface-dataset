# Simeon1970-prog/ner-lanuk-luftqualitaet

## Resumen

ner-lanuk-luftqualitaet es un modelo de reconocimiento de entidades nombradas (NER) en aleman para el dominio de calidad del aire y textos administrativos medioambientales. Lo desarrolla Simeon Ehmer (Fachhochschule Südwestfalen) y se publica bajo licencia CC BY 4.0. No es un modelo de lenguaje generativo: es un `EntityRecognizer` de spaCy que clasifica tokens en seis clases especializadas (`SCHADSTOFF`, `ORGANISATION`, `MESSWERT`, `MESSSTATION`, `RECHTSNORM`, `GRENZWERT`) sobre textos de la red de vigilancia de calidad del aire de Renania del Norte-Westfalia (LANUK NRW).

El sistema se plantea como un hibrido: una capa de reglas y gazetteer (con una lista de 79 estaciones de medicion LUQS) se combina con el modelo neuronal, de forma que las reglas tienen prioridad para la clase `SCHADSTOFF` y el modelo cubre el resto. Esta combinacion es la que obtiene los mejores resultados en el estudio asociado: micro-F1 0,844 sobre el split de test anotado por humanos, frente a 0,699 del modelo de dominio aislado y 0,793 de un `deepset/gbert-large` ajustado.

La relevancia actual es acotada pero clara: demuestra que en dominios tecnicos muy especificos, con pocos datos y sobre CPU, un sistema hibrido reglas + transformer pequeno puede superar a un modelo grande ajustado, y ademas cuantifica honestamente sus propias lagunas (la clase `MESSWERT` cae a 0,000 en valores en `ppb`). Es relevante para quien trabaje en extraccion de informacion regulatoria, mineria de textos cientifico-tecnicos o pipelines de anotacion asistida en aleman.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spaCy `TransitionBasedParser.v2` con `tok2vec` compuesto por `MultiHashEmbed.v2` (features NORM, PREFIX, SUFFIX, SHAPE; anchura 96) y `MaxoutWindowEncoder.v2` (anchura 96, profundidad 4), mas vectores estaticos de `de_core_news_lg` 3.8.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos spaCy en precision completa; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | aleman (`de`) |
| Licencia | CC BY 4.0 (pesos, capa de reglas y `laden.py`); el dataset de entrenamiento `fhswf/lanuk-luftqualitaet-ner` es CC BY-NC 4.0 |
| Formato de pesos | pesos spaCy serializados en `spacy_ner_lanuk_weights/` (guardados con `exclude=["vocab"]`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un `EntityRecognizer` de spaCy 3.8.14 basado en un parser de transiciones (`TransitionBasedParser.v2`). El extractor de caracteristicas (`tok2vec`) combina `MultiHashEmbed.v2`, que genera embeddings a partir de features sublexicas (forma normalizada, prefijo, sufijo y patron de mayusculas/minusculas) con anchura 96, y `MaxoutWindowEncoder.v2` con anchura 96 y profundidad 4, que aporta contexto de ventana. A esto se suman vectores estaticos preentrenados de `de_core_news_lg` 3.8.0 (500.000 claves, 300 dimensiones), cargados exactamente como en el entrenamiento.

Los datos de entrenamiento son escasos y de calidad limitada: 315 frases y 290 spans de un silver standard generado con ayuda de un LLM y no revisado por humanos. La validacion usa 55 frases y 38 spans de tres clases, y la seleccion de modelo se hace por F1 de dev. La optimizacion emplea Adam con los valores por defecto de spaCy, dropout 0,1, batch de 4 a 32 con compounding, un maximo de 40 epocas y early stopping con paciencia 8. El entrenamiento convergio en 17 epocas (mejor epoca la 8, F1 de dev 0,806), tardo 144 segundos en CPU con semilla 42 y se reprodujo de forma identica el 15 de septiembre de 2026. El autor descarta deliberadamente la busqueda de hiperparametros por considerar que con 38 spans de dev seria ajuste a ruido.

La innovacion tecnica no esta en la arquitectura neuronal, sino en el diseno hibrido: la capa de reglas y el gazetteer (ficheros `regeln/preannotation_entityruler.py` y `regeln/stationen.json`, con 79 estaciones de medicion LUQS) se aplican con prioridad sobre la clase `SCHADSTOFF`, mientras el modelo cubre el resto de clases. Existe tambien un script `laden.py` que carga el modelo de dominio, las reglas y el hibrido, y muestra las tres predicciones para una misma frase.

## Capacidades

- Reconocimiento de entidades nombradas en aleman sobre seis clases de dominio: `SCHADSTOFF` (sustancias contaminantes), `ORGANISATION`, `MESSWERT` (valores de medicion), `MESSSTATION` (estaciones de medida), `RECHTSNORM` (normas juridicas) y `GRENZWERT` (valores limite).
- Extraccion de referencias normativas, por ejemplo `39. BImSchV`, y de unidades de concentracion como `µg/m³`.
- Etiquetado en formato IOB2 compatible con `seqeval` en modo estricto.
- Preanotacion automatica de corpus mediante la capa de reglas (`preannotation_entityruler.py`), pensada para asistir a anotadores humanos.
- Reconocimiento de estaciones de medicion por gazetteer a partir de la lista LUQS de 79 ubicaciones.
- Ejecucion en CPU sin GPU, con un coste de entrenamiento de 144 segundos y un tiempo de inferencia muy bajo por su tamano reducido.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue: no, unicamente aleman.

## Casos de uso

- Extraccion de entidades en informes de calidad del aire: el modelo identifica contaminantes, valores, normas y organismos en textos tecnicos de la red LANUK, lo que permite estructurar automaticamente informes que de otro modo se revisan a mano.
- Anotacion asistida de corpus regulatorios: la capa de reglas genera preanotaciones con precision 1,000 sobre las clases cubiertas, de forma que un equipo de anotacion humana solo tiene que revisar y completar, no etiquetar desde cero.
- Monitorizacion de cumplimiento normativo: al detectar `RECHTSNORM` y `GRENZWERT` junto a `SCHADSTOFF`, el pipeline puede senalar que sustancia tiene un limite legal asociado y en que norma aparece, util para equipos de compliance medioambiental.
- Indexado y busqueda en repositorios documentales: las entidades extraidas sirven como metadatos para construir indices filtrables por contaminante, estacion o norma en un archivo de informes de calidad del aire.
- Analisis de la red de medicion: el gazetteer de 79 estaciones permite mapear que estaciones aparecen en cada documento y agregar la informacion por ubicacion.
- Investigacion en procesamiento de lenguaje natural aplicado al dominio juridico-ambiental aleman: el modelo y su evaluacion detallada sirven como linea base reproducible (semilla 42, resultados bit a bit) para comparar tecnicas de NER en dominios con pocos datos.
- Generacion de alertas sobre contaminantes: en un pipeline batch, la deteccion de una sustancia con su valor asociado puede disparar avisos cuando se superan umbrales definidos en las normas extraidas.
- Validacion de extracciones criticas: cuando se requiere trazabilidad estricta, la capa de reglas (precision 1,000, recall 0,646) ofrece resultados verificables aunque incompletos, y el hibrido mejora la cobertura sin perder demasiada precision.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (80 frases, 79 spans de referencia, anotacion humana), con `seqeval` en modo estricto e IOB2. La columna de F1 macro corresponde a cuatro clases y la de clases abiertas excluye las clases no medidas.

| Sistema | Precision | Recall | micro-F1 | macro-F1 (4 clases) | F1 clases abiertas |
|---|---|---|---|---|---|
| Reglas / Gazetteer | 1,000 | 0,646 | 0,785 | 0,429 | 0,263 |
| Modelo de dominio (estos pesos) | 0,781 | 0,633 | 0,699 | 0,541 | 0,516 |
| Hibrido (modelo + reglas) | 0,912 | 0,785 | 0,844 | 0,578 | 0,593 |
| `deepset/gbert-large` ajustado (referencia) | 0,744 | 0,848 | 0,793 | 0,685 | 0,611 |

Resultados por clase del sistema hibrido (F1): `SCHADSTOFF` 0,989; `ORGANISATION` 0,824; `RECHTSNORM` 0,500; `MESSWERT` 0,000. Las clases `MESSSTATION` y `GRENZWERT` no aparecen en el test, por lo que no hay metrica.

La ventaja del hibrido se valido con bootstrap emparejado de 1.000 remuestreos: +0,061 frente a las reglas (p = 0,026), +0,140 frente al modelo de dominio (p < 0,002) y +0,051 frente a `gbert-large` (p = 0,040). Los detalles completos estan en `eval_test.json` y en el cuaderno del trabajo (capitulos 9 y 10).

## Requisitos de hardware

- Inferencia en CPU sin GPU dedicada: el modelo es un parser de transiciones de spaCy con anchura 96 y profundidad 4, por lo que la carga computacional es minima en comparacion con un transformer generativo.
- VRAM estimada para inferencia: inferior a 1 GB en GPU; no se declaran cifras oficiales de memoria.
- Memoria en disco: los pesos del NER son pequenos, pero el pipeline requiere los vectores estaticos de `de_core_news_lg` 3.8.0 (500.000 claves, 300 dimensiones), que ocupan varios cientos de megabytes y se cargan como dependencia obligatoria.
- GPU recomendadas: no se especifican; el autor entrena y ejecuta en CPU. Cualquier GPU consumer (por ejemplo una RTX 3060 o superior) seria mas que suficiente, pero no aporta ventaja relevante frente a CPU.
- Cabe en cualquier GPU consumer y tambien en entornos sin GPU, incluidos contenedores de CPU en la nube.
- Opciones de despliegue: spaCy 3.8.14 con Python 3.11.9, siguiendo `requirements-cpu.txt`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en GGUF ni safetensors.
- Latencia y throughput estimados: no declarados. Como referencia de coste, el entrenamiento completo tardo 144 segundos en CPU y los pesos se guardan sin vocabulario (`exclude=["vocab"]`), lo que acelera la carga.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | F1 en el test LANUK | Licencia / datos | Disponibilidad |
|---|---|---|---|---|---|
| ner-lanuk-luftqualitaet (hibrido) | spaCy parser de transiciones + reglas | no disponible | 0,844 (micro) | CC BY 4.0 (pesos); dataset CC BY-NC 4.0 | HuggingFace, repo pequeno |
| ner-lanuk-luftqualitaet (solo modelo) | spaCy parser de transiciones | no disponible | 0,699 (micro) | CC BY 4.0 | Incluido en el mismo repo |
| Reglas / gazetteer | Sistema basado en reglas | no aplica | 0,785 (micro) | CC BY 4.0 | Incluido en el mismo repo |
| `deepset/gbert-large` ajustado | Transformer encoder aleman | no disponible | 0,793 (micro) | Licencia del modelo base (no especificada en la informacion) | Modelo base publico, requirio ajuste propio |

No se dispone de otros modelos comparables especificos para NER de calidad del aire en aleman en la informacion proporcionada.

## Limitaciones y advertencias

- Lagunas en `ppb`: el patron de reglas reconoce concentraciones masicas (`µg/m³`) pero no relaciones de mezcla volumetrica (`ppb`, `nmol/mol`), y el entrenamiento no contiene ningun valor en `ppb`. En el test, los once valores en `ppb` hacen que `MESSWERT` obtenga F1 0,000 en los tres sistemas. El autor decidio no cerrar la laguna para poder medirla; anadir una linea de regla la resolveria.
- Dos clases sin medir: `MESSSTATION` y `GRENZWERT` no aparecen en el split de test, por lo que su rendimiento real es desconocido.
- Techo del silver standard: el modelo aprende de anotaciones que coinciden con la anotacion humana en un F1 de span de 0,765, lo que limita estructuralmente la calidad alcanzable.
- Un unico tipo de documento en test: todas las frases de evaluacion provienen de un informe de intercomparacion (Ringversuch); no se ha medido la transferibilidad a memorias anuales o planes de proteccion del aire.
- Perfil de errores de las reglas: precision 1,000 y recall 0,646, es decir, practicamente sin falsos positivos pero con muchas omisiones. Quien necesite exhaustividad debe recurrir a un modelo grande ajustado (recall 0,848 en `gbert-large`), asumiendo mas falsos positivos.
- Rendimiento global moderado: el F1 macro de cuatro clases es 0,578 y el de clases abiertas 0,593, con `RECHTSNORM` en 0,500, lo que refleja un rendimiento desigual por clase.
- Idioma unico: solo aleman. No se ha evaluado en otros idiomas ni en variantes dialectales.
- Restriccion de licencia importante: aunque los pesos, las reglas y el codigo estan bajo CC BY 4.0 (uso comercial permitido con atribucion), el dataset de entrenamiento `fhswf/lanuk-luftqualitaet-ner` esta bajo CC BY-NC 4.0, lo que introduce incertidumbre sobre el uso comercial del modelo derivado. Conviene revisar esta incompatibilidad antes de desplegarlo en produccion.
- Fecha y contexto: el modelo se publico en septiembre de 2026 y no registra descargas ni valoraciones en HuggingFace; no hay validacion independiente de los resultados declarados, que proceden del propio autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo solo etiqueta spans; su riesgo equivalente es producir entidades erroneas o perder entidades, cuantificado en las metricas anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Simeon1970-prog/ner-lanuk-luftqualitaet
- Referencia de cita del autor: https://huggingface.co/fhswf/ner-lanuk-luftqualitaet
- Dataset de entrenamiento: https://huggingface.co/datasets/fhswf/lanuk-luftqualitaet-ner
- Licencia CC BY 4.0 (texto legal en aleman): https://creativecommons.org/licenses/by/4.0/legalcode.de
- Vectores estaticos requeridos (`de_core_news_lg` 3.8.0): https://github.com/explosion/spacy-models/releases/download/de_core_news_lg-3.8.0/de_core_news_lg-3.8.0-py3-none-any.whl
- Citacion academica: Ehmer, S. (2026): *Domänenspezifische Named Entity Recognition auf deutschen Luftqualitäts- und Behördentexten*. Studienarbeit, Fachhochschule Südwestfalen.
