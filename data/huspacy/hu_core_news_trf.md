# huspacy/hu_core_news_trf

## Resumen
`hu_core_news_trf` es un pipeline de procesamiento de lenguaje natural para húngaro desarrollado por HuSpaCy (SzegedAI y MILAB) y publicado bajo el identificador `huspacy/hu_core_news_trf`. No es un modelo generativo, sino un pipeline completo de spaCy (versión 3.7.x) que encadena un codificador transformer huBERT con componentes clásicos de PLN: segmentación de frases, etiquetado POS, morfología, lematización, análisis de dependencias y reconocimiento de entidades nombradas (NER).

El modelo parte del checkpoint `SZTAKI-HLT/hubert-base-cc` (huBERT base cased) como componente `transformer` y añade capas específicas entrenadas sobre treebanks y corpus anotados en húngaro (UD Hungarian Szeged, NYTK-NerKor y Szeged NER Corpus). El resultado es uno de los pipelines de referencia para PLN húngaro de alta precisión, con métricas declaradas por el autor cercanas al 98 % en POS y morfología y un F1 de 0,917 en NER.

Su relevancia actual radica en que el húngaro es una lengua aglutinante con morfología compleja y relativamente pocos recursos, y este pipeline ofrece una solución lista para producción dentro del ecosistema spaCy, con etiquetas compatibles con el esquema Universal Dependencies. El repositorio ocupa 52 GB, lo que refleja la inclusión de pesos transformer en múltiples formatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline spaCy 3.7 sobre transformer huBERT base (encoder tipo BERT) + componentes estadísticos (senter, tagger, morphologizer, lemmatizer, parser, ner) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitado por el encoder huBERT base, no declarado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | húngaro (hu) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | spaCy package (instalable vía `spacy`); pesos transformer en el formato interno de spaCy; no se declaran GGUF ni safetensors sueltos |
| Versión del pipeline | 3.7.0 |
| Compatibilidad spaCy | >=3.7.0,<3.8.0 |
| Vectores estáticos | 0 claves, 0 vectores (0 dimensiones) |
| Tamaño del repositorio | 52,0 GB |
| Componentes | transformer, senter, tagger, morphologizer, lookup_lemmatizer, trainable_lemmatizer, experimental_arc_predictor, experimental_arc_labeler, ner |
| Número de etiquetas | 1217 etiquetas en 4 componentes |

## Arquitectura y entrenamiento
El pipeline combina un codificador transformer huBERT base (cased), desarrollado por SZTAKI-HLT, con componentes supervisados de spaCy. La secuencia de procesamiento es: `transformer` (representaciones contextuales), `senter` (segmentación de frases), `tagger` (POS con 17 etiquetas UPOS), `morphologizer` (rasgos morfológicos UFeats), `lookup_lemmatizer` y `trainable_lemmatizer` (lematización híbrida), `experimental_arc_predictor` y `experimental_arc_labeler` (parser de dependencias) y `ner` (entidades nombradas).

Los datos de entrenamiento declarados son UD Hungarian Szeged (para POS, morfología, lematización y dependencias), NYTK-NerKor y Szeged NER Corpus (para NER), además del checkpoint preentrenado huBERT base cased. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un pipeline de etiquetado). La innovación técnica principal es el uso de un encoder transformer específico para húngaro junto con componentes experimentales de parsing (`experimental_arc_predictor` / `experimental_arc_labeler`) dentro del ecosistema spaCy.

## Capacidades
- Segmentación de frases (`senter`) con F-score de 0,9899 declarado.
- Etiquetado POS (UPOS) con 17 etiquetas y precisión de 0,9820.
- Etiquetado XPOS con precisión de 0,9824.
- Análisis morfológico (UFeats) con precisión de 0,9658.
- Lematización con precisión de 0,9861, combinando lookup y lematizador entrenable.
- Análisis de dependencias: UAS de 0,9001 y LAS de 0,8568.
- Reconocimiento de entidades nombradas: precisión 0,9119, recall 0,9230 y F1 0,9174.
- Procesamiento exclusivo de húngaro; no soporta otros idiomas.
- No es un modelo generativo: no realiza generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No dispone de modo de razonamiento (thinking), agentes ni capacidades multimodales.
- Integración nativa con la API de spaCy (`nlp(texto)`), lo que permite usar los componentes de forma individual o encadenada.

## Casos de uso
- Extracción de entidades en textos periodísticos húngaros: el componente `ner` identifica personas, organizaciones y lugares con F1 de 0,917, adecuado para indexación y búsqueda semántica en medios digitales.
- Anonimización de documentos: combinando `ner` y `tagger` se pueden localizar nombres propios y datos personales en corpus húngaros antes de su publicación o compartición.
- Análisis sintáctico para investigación lingüística: el parser de dependencias (UAS 0,9001, LAS 0,8568) permite construir treebanks anotados y estudiar fenómenos gramaticales del húngaro.
- Preprocesado para pipelines de búsqueda y recuperación: la lematización (precisión 0,9861) y el etiquetado POS normalizan consultas y documentos antes de indexarlos en motores de búsqueda en húngaro.
- Construcción de corpus anotados: el pipeline genera anotaciones UPOS, UFeats y dependencias compatibles con Universal Dependencies, útiles para entrenar o evaluar otros modelos.
- Enriquecimiento de datos para sistemas de recomendación o moderación: la segmentación de frases y el POS tagging permiten analizar opiniones y reseñas en húngaro a nivel lingüístico.
- Análisis de morfología para didáctica del húngaro: el `morphologizer` y el lematizador facilitan herramientas de aprendizaje de casos, números y posesivos.
- Integración en aplicaciones spaCy existentes: al ser un paquete spaCy 3.7.x, se puede sustituir o combinar con otros componentes del ecosistema sin cambiar la API.

## Benchmarks y rendimiento
Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Métrica | Valor |
|---|---|---|
| NER | Precisión | 0,9119 |
| NER | Recall | 0,9230 |
| NER | F-score | 0,9174 |
| TAG (XPOS) | Accuracy | 0,9824 |
| POS (UPOS) | Accuracy | 0,9820 |
| MORPH (UFeats) | Accuracy | 0,9658 |
| LEMMA | Accuracy | 0,9861 |
| Dependencias no etiquetadas | UAS | 0,9001 |
| Dependencias etiquetadas | LAS | 0,8568 |
| Segmentación de frases | F-score | 0,9899 |

No se han publicado en la información disponible resultados comparativos con otros modelos en formato de tabla enfrentada; los valores anteriores son los únicos benchmarks declarados.

## Requisitos de hardware
- El repositorio ocupa 52 GB, por lo que se recomienda disponer de al menos 60 GB de espacio en disco para la descarga y el desempaquetado.
- El componente transformer huBERT base es un modelo tipo BERT base; la VRAM necesaria para inferencia no está declarada, pero un encoder de este tamaño suele requerir varios GB de VRAM en FP32 y menos en FP16.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del encoder, tarjetas consumer con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090) podrían ejecutarlo, aunque no se confirma.
- Despliegue: al ser un paquete spaCy, se instala con `spacy` y se carga con `spacy.load`. No se declaran integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de otros pipelines comparables (por ejemplo, otros modelos HuSpaCy o pipelines húngaros de spaCy) con métricas equiparables. Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Idioma | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huspacy/hu_core_news_trf` | húngaro | spaCy + huBERT base | no disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo monolingüe: solo procesa húngaro; no soporta otros idiomas.
- No es generativo: no puede usarse para generación de texto, razonamiento, código ni tareas conversacionales.
- Las métricas declaradas están marcadas como no verificadas (`verified: false`) y proceden del propio autor.
- El parser utiliza componentes marcados como `experimental_arc_predictor` y `experimental_arc_labeler`, lo que puede implicar menor estabilidad o soporte que los componentes estándar.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- El repositorio de 52 GB implica costes de almacenamiento y descarga elevados.
- No se declaran sesgos específicos, pero al entrenarse sobre corpus anotados concretos (UD Szeged, NYTK-NerKor, Szeged NER) puede heredar los sesgos de dominio y de anotación de esas fuentes.
- Riesgo de errores en textos con ortografía no estándar, dominios muy alejados de los corpus de entrenamiento o entidades poco frecuentes.
- La longitud de contexto efectiva no está declarada; textos muy largos pueden requerir fragmentación manual.
- Requiere spaCy >=3.7.0,<3.8.0, lo que limita la compatibilidad con versiones más recientes del framework.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/huspacy/hu_core_news_trf
- Repositorio HuSpaCy: https://github.com/huspacy/huspacy
- Modelo base huBERT: https://huggingface.co/SZTAKI-HLT/hubert-base-cc
- UD Hungarian Szeged: https://universaldependencies.org/treebanks/hu_szeged/index.html
- NYTK-NerKor Corpus: https://github.com/nytud/NYTK-NerKor
- Szeged NER Corpus: https://rgai.inf.u-szeged.hu/node/130
