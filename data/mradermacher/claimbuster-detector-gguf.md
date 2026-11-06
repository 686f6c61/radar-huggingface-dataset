# mradermacher/claimbuster-detector-GGUF

## Resumen

claimbuster-detector-GGUF es la versión cuantizada en formato GGUF del modelo sachaljawad/claimbuster-detector, un clasificador de texto basado en DistilBERT (66.955.010 parámetros) especializado en la detección de afirmaciones verificables (*claim detection*) y en la evaluación de su valor de verificación (*check-worthiness*). Lo publica mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp, y está pensado para integrarse en pipelines de fact-checking que necesiten un filtro rápido y ligero previo a la verificación humana o automática.

El modelo resuelve un problema muy concreto dentro del periodismo y la moderación de contenidos: separar las frases que contienen una afirmación factual comprobable de las que son opinión, pregunta retórica o comentario genérico. Al ser un modelo de 67 millones de parámetros, su coste computacional es mínimo y puede ejecutarse en CPU, lo que lo hace adecuado para procesar grandes volúmenes de texto en tiempo real.

La relevancia actual de esta ficha radica en que ofrece una alternativa práctica y con licencia MIT para desplegar detección de afirmaciones sin depender de APIs propietarias ni de modelos generativos grandes. El contexto máximo soportado no está documentado en la información disponible, aunque por la arquitectura base (DistilBERT) se infiere una ventana de 512 tokens, dato que debe confirmarse contra el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado), clasificación de texto |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base suele limitarse a 512 tokens; confirmar con el modelo original) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, una versión destilada de BERT que reduce el número de capas y parámetros manteniendo buena parte de las capacidades del modelo original. Se trata de un transformer encoder bidireccional adaptado a una tarea de clasificación de secuencias, en este caso la detección de afirmaciones verificables. El modelo original (sachaljawad/claimbuster-detector) se etiqueta con los términos *claim-detection*, *check-worthiness*, *fact-checking* y *claimbuster*, lo que sugiere un entrenamiento orientado a la anotación de afirmaciones comprobables, probablemente inspirado en el corpus ClaimBuster.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia destilación. El proceso de cuantización realizado por mradermacher es estático (sin imatrix), según se indica en la model card, y no se han publicado variantes ponderadas por imatrix en el momento de la consulta.

## Capacidades

- Clasificación de texto para detectar si una frase contiene una afirmación verificable.
- Evaluación de *check-worthiness*: priorizar afirmaciones que merecen ser verificadas.
- Etiquetado binario o multiclase orientado a fact-checking (según el modelo base).
- Extracción de características (*feature-extraction*) al usar el encoder subyacente.
- Ejecución en CPU y GPU de baja capacidad gracias a su tamaño reducido.
- Integración con `transformers` y con el ecosistema llama.cpp/GGUF.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Filtro previo en redacciones periodísticas: procesar teletipos y artículos para marcar frases que contienen afirmaciones verificables antes de que un fact-checker humano las revise, reduciendo el volumen de lectura manual.
- Moderación de contenidos en foros y redes: detectar publicaciones que contienen afirmaciones factuales susceptibles de ser falsas y derivarlas a un sistema de verificación o a revisión humana.
- Pipeline de verificación automática: usar el clasificador como primera etapa que decide si una frase merece pasar a un verificador basado en recuperación (RAG) o a una API de fact-checking, ahorrando coste en las etapas posteriores.
- Análisis de discursos políticos: extraer y priorizar afirmaciones comprobables de transcripciones parlamentarias o debates para su posterior contraste con fuentes oficiales.
- Enriquecimiento de datasets de investigación: etiquetar grandes corpus de noticias con la probabilidad de que cada frase sea una afirmación verificable, facilitando la construcción de conjuntos de datos para entrenar modelos de fact-checking.
- Monitorización de medios en tiempo real: desplegar el modelo en un servicio ligero (por ejemplo, con llama.cpp o un endpoint compatible) que consuma flujos RSS o APIs de noticias y marque afirmaciones candidatas a verificación.
- Detección de afirmaciones en contenidos generados por IA: identificar aserciones factuales en textos sintéticos para auditar su veracidad antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; las variantes Q4_K_M, Q5_K_M y Q6_K ocupan aproximadamente 0,1–0,2 GB en disco.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es más que suficiente. También funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o incluso en Raspberry Pi con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (tras importar el GGUF), endpoints compatibles con la API de Hugging Face, y `transformers` para el modelo base en safetensors. vLLM y TGI no están orientados a este tipo de clasificador pequeño, aunque podrían servir con adaptaciones.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño (67 M de parámetros) se espera un throughput muy alto en CPU y prácticamente despreciable en GPU, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/claimbuster-detector-GGUF | 66,9 M | no disponible | Clasificación claim detection | MIT | GGUF en HF |
| sachaljawad/claimbuster-detector (base) | 66,9 M | no disponible | Clasificación claim detection | MIT | safetensors en HF |
| mradermacher/Ai_detector-GGUF | no disponible | no disponible | Detección de texto generado por IA | no disponible | GGUF en HF |
| Modelos BERT/DistilBERT de clasificación genérica | 60–110 M | 512 típicamente | Clasificación general | variable | HF |

La comparativa directa con otros clasificadores especializados en claim detection no está disponible en la información proporcionada. La alternativa más cercana documentada es el propio modelo base sin cuantizar, que ofrece la misma funcionalidad con pesos originales.

## Limitaciones y advertencias

- Modelo entrenado únicamente en inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Es un clasificador, no un generador: no produce explicaciones ni verifica hechos, solo puntúa la probabilidad de que una frase sea una afirmación verificable.
- Riesgo de falsos positivos y negativos en frases ambiguas, irónicas o con negaciones complejas.
- No se han publicado métricas de evaluación en la información disponible, por lo que no se puede cuantificar su precisión real.
- La cuantización estática (sin imatrix) puede degradar ligeramente la calidad respecto al modelo base, especialmente en las variantes Q2_K y Q3_K_S.
- Aunque la licencia es MIT, conviene revisar la licencia y condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- No apto para tareas de generación, razonamiento o agentes; su uso debe limitarse a clasificación y extracción de características.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/claimbuster-detector-GGUF
- Modelo base: https://huggingface.co/sachaljawad/claimbuster-detector
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#claimbuster-detector-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo Ai_detector-GGUF del mismo autor (referencia comparativa): https://huggingface.co/mradermacher/Ai_detector-GGUF
