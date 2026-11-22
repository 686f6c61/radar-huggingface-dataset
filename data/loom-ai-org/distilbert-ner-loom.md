# loom-ai-org/distilbert-ner-loom

## Resumen

DistilBERT-NER exportado a loom.cpp es una conversión del modelo `dslim/distilbert-NER` al formato GGUF propio del runtime loom.cpp. Se trata de un DistilBERT (variante destilada de BERT) afinado para reconocimiento de entidades nombradas (NER) sobre el corpus CoNLL-2003, con 65.197.837 parámetros totales. El autor del export es la organización `loom-ai-org`, que empaqueta los pesos originales sin modificar en un único fichero GGUF autodescriptivo que incluye topologías de grafo, tokenizador y script de driver.

El modelo resuelve la tarea de etiquetado por token (token-classification) sobre texto en inglés, asignando a cada pieza del tokenizador una de las cuatro clases de entidad de CoNLL-2003: `PER` (persona), `ORG` (organización), `LOC` (localización) y `MISC` (miscelánea), más la clase `O` (fuera de entidad). Es relevante para quienes ya trabajan con el ecosistema loom.cpp y necesitan un extractor de entidades ligero y determinista sin salir del runtime, o para pipelines que requieran un modelo NER de pequeño tamaño (0,8 GB de repo) con licencia Apache 2.0.

La arquitectura es un transformer encoder de tipo DistilBERT con tabla de posiciones aprendida y límite de 512 tokens por secuencia. El export no añade capacidades nuevas: reproduce fielmente el comportamiento del checkpoint base, incluida su naturaleza *cased* (sensible a mayúsculas) y su dependencia del tokenizador WordPiece, que devuelve etiquetas alineadas a piezas y no a palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 65.197.837 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (tabla de posiciones aprendida del checkpoint) |
| Tipos de cuantizacion | no disponible (el repo contiene un único GGUF; no se documentan variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`distilbert-ner.gguf`, exportado con loom-exporter) |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un transformer encoder de 6 capas destilado desde BERT-base, con tokenizador WordPiece y tabla de posiciones aprendida que fija el máximo en 512 tokens. La cabeza de clasificación es de tipo token-classification sobre el vocabulario de etiquetas de CoNLL-2003 (`O`, `B-PER`, `I-PER`, `B-ORG`, `I-ORG`, `B-LOC`, `I-LOC`, `B-MISC`, `I-MISC`). El export a loom.cpp no modifica los pesos: los empaqueta en un GGUF autodescriptivo que transporta el grafo, el tokenizador y el driver de inferencia.

El entrenamiento original corresponde al checkpoint `dslim/distilbert-NER`, afinado sobre CoNLL-2003, un corpus de newswire de 1996-1997. No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset más allá de CoNLL-2003, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a una tarea discriminativa de etiquetado). Tampoco se documentan innovaciones de decodificación especulativa ni atención lineal: el export es una conversión de formato, no una reimplementación arquitectónica.

Una particularidad técnica del export es que procesa una sola secuencia a la vez, sin dimensión de batch ni máscara de atención, y elimina los tokens de encuadre `[CLS]` y `[SEP]` de la salida de alto nivel (aunque permite recuperarlos con `strip_special=False`).

## Capacidades

- Etiquetado de entidades nombradas por token en inglés, con cuatro tipos: `PER`, `ORG`, `LOC` y `MISC`.
- Salida alineada a las piezas del tokenizador WordPiece, no a las palabras originales; el llamante recibe tanto la pieza como la etiqueta.
- Eliminación automática de tokens especiales `[CLS]` y `[SEP]` en la API de alto nivel, con opción de recuperarlos.
- Acceso al driver embebido mediante `model.driver_source` para consultar y ajustar argumentos de inferencia de bajo nivel.
- Procesamiento de una secuencia por llamada, sin batch ni attention mask.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Extracción de entidades en pipelines de noticias: el modelo identifica personas, organizaciones y localizaciones en texto periodístico en inglés, que es exactamente el dominio de CoNLL-2003, por lo que su precisión es máxima en ese registro.
- Anonimización o enmascarado de datos personales: dado que detecta `PER`, puede usarse como primer paso para localizar nombres de personas en logs o documentos en inglés antes de aplicar una política de redacción.
- Enriquecimiento de metadatos documentales: extraer organizaciones y localizaciones de artículos para construir índices facetados o grafos de entidades, aprovechando el bajo coste computacional del modelo (65 M de parámetros).
- Preprocesado para sistemas de búsqueda: etiquetar consultas y documentos con entidades para mejorar el ranking o la expansión de consultas en un motor de búsqueda en inglés.
- Integración en el ecosistema loom.cpp: equipos que ya despliegan modelos con `loom-py-rt` pueden añadir NER sin introducir una segunda pila de inferencia, ya que el GGUF incluye tokenizador y driver.
- Clasificación ligera en el borde: con 65 M de parámetros y un repo de 0,8 GB, es viable en CPU o en GPUs de gama baja para tareas de etiquetado en tiempo casi real sobre flujos de texto cortos.
- Validación de pipelines de extracción: servir como referencia determinista frente a modelos generativos en tareas de NER, al no producir alucinaciones de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 65 M de parámetros, el peso en precisión nativa rondaría los 0,26 GB y el repo completo ocupa 0,8 GB, por lo que la huella es muy reducida.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en CPU.
- Cabe en consumer GPU: sí, con amplio margen, dado el tamaño del checkpoint.
- Opciones de despliegue: el runtime propio `loom-py-rt` (PyPI, con extra `[hub]`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| loom-ai-org/distilbert-ner-loom | 65.197.837 | 512 | en | apache-2.0 | GGUF (loom.cpp) | Export del checkpoint dslim; runtime loom-py-rt |
| dslim/distilbert-NER | no disponible en la informacion | 512 | en | apache-2.0 | safetensors (formato original) | Modelo base del que se exporta; misma arquitectura y pesos |
| Otros modelos NER de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparación más directa es con el propio modelo base `dslim/distilbert-NER`: los pesos son idénticos y la diferencia estriba únicamente en el formato de empaquetado y el runtime de ejecución.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre CoNLL-2003, newswire de 1996-1997; entidades y estilos de texto posteriores o ajenos al registro periodístico quedan fuera de su distribución de entrenamiento.
- Solo cuatro tipos de entidad (`PER`, `ORG`, `LOC`, `MISC`); no detecta fechas, cantidades, productos ni otras categorías.
- Sensible a mayúsculas (*cased*): pasar el texto en minúsculas degrada la precisión de forma significativa, ya que la capitalización es la principal señal del modelo.
- Alineación a piezas, no a palabras: una palabra dividida por WordPiece recibe varias etiquetas que pueden discrepar; decidir cuál prevalece es responsabilidad del llamante.
- Límite de 512 tokens por secuencia, impuesto por la tabla de posiciones aprendida; no hay batch ni attention mask, lo que obliga a iterar secuencia a secuencia.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir etiquetados incorrectos o inconsistentes en texto fuera de dominio.
- Sesgos: no se documentan sesgos específicos en la información proporcionada, aunque al derivar de un corpus periodístico de los años 90 puede reflejar los sesgos de representación de esa fuente.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución correspondientes.
- Ecosistema limitado: depende del runtime loom.cpp/loom-py-rt; no se documentan exportaciones a otros formatos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/distilbert-ner-loom
- Modelo base: https://huggingface.co/dslim/distilbert-NER
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
