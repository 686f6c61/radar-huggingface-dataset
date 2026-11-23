# chcaa/da_dacy_large_trf_1.0.0

## Resumen

DaCy Large (`da_dacy_large_trf`) es un pipeline de procesamiento del lenguaje natural para danes construido sobre spaCy y publicado por el Center for Humanities Computing de la Universidad de Aarhus (CHCAA). No es un modelo generativo, sino un conjunto de componentes de etiquetado a nivel de token y de analisis sintactico: etiquetado POS, analisis morfologico, lematizacion, analisis de dependencias y reconocimiento de entidades nombradas. Se apoya en el encoder de frases `KennethEnevoldsen/dfm-sentence-encoder-large` como componente `transformer` del pipeline.

El modelo resuelve el problema del preprocesamiento linguistico de alta calidad para danes: tokenizacion con fronteras de frase, asignacion de categorias gramaticales, rasgos morfologicos, lemas, arboles de dependencias y entidades nombradas en un unico pipeline integrado. Es relevante para quien necesite anotar corpus daneses a gran escala o construir sobre esas anotaciones tareas posteriores (extraccion de informacion, analisis de sentimiento, indexacion, etc.) sin depender de servicios externos.

La version 1.0.0 se distribuye como paquete spaCy (compatible con spaCy `>=3.8.14,<3.9.0`), con licencia Apache-2.0 y un repositorio de 2,8 GB. El pipeline declara 218 etiquetas repartidas en cuatro componentes (tagger, morphologizer, trainable_lemmatizer, parser y ner), y esta entrenado sobre UD Danish DDT v2.18, DaNE y DaCoref.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy con componente `transformer` (encoder `KennethEnevoldsen/dfm-sentence-encoder-large`) seguido de tagger, morphologizer, trainable_lemmatizer, parser y ner |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos spaCy, no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | danes (`da`) |
| Licencia | Apache-2.0 |
| Formato de pesos | paquete spaCy (spacy); tamano del repositorio 2,8 GB |
| Version de spaCy | `>=3.8.14,<3.9.0` |
| Componentes del pipeline | `transformer`, `tagger`, `morphologizer`, `trainable_lemmatizer`, `parser`, `ner` |
| Etiquetas | 218 etiquetas en 4 componentes |
| Vectores estaticos | 0 claves, 0 vectores unicos (0 dimensiones) |
| Modelo base | `KennethEnevoldsen/dfm-sentence-encoder-large` |
| Autoria | Johana Mayerova, Mikkel Krøjer Svendsen, Kenneth Enevoldsen (CHCAA, Universidad de Aarhus) |

## Arquitectura y entrenamiento

El pipeline combina un encoder transformer preentrenado (`dfm-sentence-encoder-large`) como extractor de representaciones contextuales con cinco cabezas de prediccion supervisadas de spaCy: un tagger para XPOS, un morphologizer para rasgos UFeats, un lematizador entrenable, un parser de dependencias y un reconocedor de entidades. El tagger usa 18 etiquetas (ADJ, ADP, ADV, AUX, CCONJ, DET, INTJ, NOUN, NUM, PART, PRON, PROPN, PUNCT, `Polarity=Neg`, SCONJ, SYM, VERB, X); el morphologizer cubre combinaciones de rasgos morfologicos como `Definite`, `Gender`, `Number`, `Case`, `Mood`, `Tense`, `VerbForm` y `Voice`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo ajuste por RLHF o DPO (no aplicable en un modelo discriminativo de este tipo).

Los datos de entrenamiento declarados son UD Danish DDT v2.18 (dependencias, POS y morfologia), DaNE (entidades nombradas) y DaCoref, ademas del propio dataset `chcaa/dacy-data`. El modelo no incluye vectores estaticos (0 dimensiones), de modo que toda la representacion lexica y contextual recae en el componente transformer. La innovacion principal es la integracion en un unico pipeline spaCy de tareas que habitualmente requieren modelos separados, con un esquema de 218 etiquetas y compatibilidad estricta con la version de spaCy indicada.

## Capacidades

- Etiquetado de categorias gramaticales (XPOS y UPOS) a nivel de token en danes.
- Analisis morfologico con rasgos UFeats (genero, numero, definitud, caso, tiempo, modo, voz, grado).
- Lematizacion entrenable.
- Analisis de dependencias sintacticas (arboles etiquetados y no etiquetados).
- Segmentacion de frases (componente de fronteras de oracion).
- Reconocimiento de entidades nombradas (NER) en danes.
- Procesamiento por lotes mediante la API de spaCy (`nlp.pipe`), con pipeline serializable y desplegable localmente.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es un modelo discriminativo de etiquetado.

## Casos de uso

- Anotacion de corpus daneses a gran escala: el pipeline procesa lotes de documentos con `nlp.pipe` y produce anotaciones POS, morfologia, lemas y dependencias listas para almacenar en un corpus linguistico o en un indice de busqueda.
- Extraccion de entidades en textos administrativos o periodisticos daneses: el componente NER (F1 0,879 en DaNE) permite poblar bases de datos de personas, organizaciones y lugares a partir de archivos y articulos.
- Preprocesamiento para tareas downstream: los lemas y las dependencias generadas alimentan clasificadores de sentimiento, topic modeling o sistemas de recuperacion de informacion que trabajan sobre danes.
- Analisis linguistico y estudios de humanidades digitales: la combinacion de POS, rasgos morfologicos y arboles de dependencias permite calcular estadisticas sintacticas y morfologicas sobre corpus historicos o literarios.
- Construccion de pipelines de enriquecimiento documental en produccion: al ser un paquete spaCy con licencia Apache-2.0, se puede integrar en servicios propios sin coste de licencia ni llamadas a APIs externas.
- Normalizacion y limpieza de texto danes: la segmentacion de frases y la tokenizacion con lematizacion sirven como paso previo en sistemas de busqueda o en la construccion de datasets de entrenamiento para modelos generativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Metrica | Dataset | Valor |
|---|---|---|---|
| NER | Precision | DaNE (test) | 0,8541 |
| NER | Recall | DaNE (test) | 0,9061 |
| NER | F1 | DaNE (test) | 0,8793 |
| TAG | XPOS accuracy | UD Danish DDT (test, da_ddt) | 0,9859 |
| POS | UPOS accuracy | UD Danish DDT (test, da_ddt) | 0,9860 |
| MORPH | UFeats accuracy | UD Danish DDT (test, da_ddt) | 0,9861 |
| LEMMA | Lemma accuracy | UD Danish DDT (test, da_ddt) | 0,9610 |
| UNLABELED_DEPENDENCIES | UAS | UD Danish DDT (test, da_ddt) | 0,9155 |
| LABELED_DEPENDENCIES | LAS | UD Danish DDT (test, da_ddt) | 0,8898 |
| SENTS | Sentences F-score | UD Danish DDT (test, da_ddt) | 0,9844 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 2,8 GB, lo que da una cota superior del orden de 3 GB en precision completa si se carga todo el pipeline en memoria.
- GPU recomendadas: no se especifican en la informacion disponible. Al tratarse de un encoder de tamano grande, una GPU consumer con 8-12 GB de VRAM es suficiente para inferencia en precision completa; sin GPU, spaCy puede ejecutar el pipeline en CPU, con mayor latencia.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 8 GB de VRAM; no se documentan requisitos minimos oficiales.
- Opciones de despliegue: spaCy (`spacy.load`), con soporte de `nlp.pipe` para procesamiento por lotes. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato de pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NER F1 (DaNE) | POS/LAS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `chcaa/da_dacy_large_trf` (este) | no disponible | no disponible | 0,8793 | UPOS 0,9860 / LAS 0,8898 | Apache-2.0 | Hugging Face, spaCy |
| `chcaa/da_dacy_small_trf` | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face, spaCy |
| `chcaa/da_dacy_medium_trf` | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face, spaCy |
| `KennethEnevoldsen/dfm-sentence-encoder-large` | no disponible | no disponible | no aplica (encoder de frases, no NER) | no aplica | no disponible | Hugging Face |

No se dispone en la informacion proporcionada de resultados de benchmarks de los modelos comparables, por lo que la comparacion cuantitativa no puede completarse. Las variantes small y medium del propio framework DaCy son las alternativas naturales por licencia, formato y ecosistema.

## Limitaciones y advertencias

- Modelo exclusivamente para danes: no procesa otros idiomas de forma fiable.
- Modelo discriminativo: no genera texto ni mantiene conversaciones; no admite tool calling ni razonamiento multi-paso.
- Riesgo de error en entidades poco frecuentes o dominios especializados (biomedicina, jurisprudencia) no representados en DaNE; el recall declarado (0,9061) implica que aproximadamente un 9,4 % de las entidades del conjunto de test no se detectan.
- Dependencia estricta de la version de spaCy (`>=3.8.14,<3.9.0`): actualizar spaCy fuera de ese rango puede romper la carga del pipeline.
- No se documentan pruebas de sesgo ni de robustez especificas para esta version en la informacion disponible, aunque el proyecto DaCy declara incluir guias de tests de comportamiento y sesgo.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El pipeline no incluye vectores estaticos, por lo que el rendimiento depende por completo del encoder transformer y de su coste computacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chcaa/da_dacy_large_trf
- Repositorio DaCy: https://github.com/centre-for-humanities-computing/DaCy
- Documentacion DaCy: https://centre-for-humanities-computing.github.io/DaCy/
- Modelo base: https://huggingface.co/KennethEnevoldsen/dfm-sentence-encoder-large
- Dataset UD Danish DDT: https://github.com/UniversalDependencies/UD_Danish-DDT
- Dataset DaNE: https://huggingface.co/datasets/alexandrainst/dane
- Dataset DaCoref: https://huggingface.co/datasets/alexandrainst/dacoref
- Dataset DaCy: https://huggingface.co/datasets/chcaa/dacy-data
- CHCAA, Universidad de Aarhus: https://chc.au.dk/
