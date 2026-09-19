# olusegunola/qwen2.5-1.5b-primekg-sft-seed7

## Resumen

El modelo `olusegunola/qwen2.5-1.5b-primekg-sft-seed7` es un ajuste fino publicado en HuggingFace por el usuario olusegunola. Por el propio identificador se deduce que se trata de un *fine-tuning* supervisado (SFT) del modelo base Qwen2.5-1.5B, entrenado sobre PrimeKG, un grafo de conocimiento orientado a medicina de precisión, con una semilla concreta (seed 7), lo que sugiere que forma parte de una serie de réplicas experimentales. Ninguno de estos extremos está confirmado en la documentación del repositorio.

La model card publicada es la plantilla automática de HuggingFace sin rellenar: todos los campos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) figuran como "[More Information Needed]". No hay pipeline declarado, ni idiomas, ni licencia, ni resultados de evaluación. El repositorio figura con 0,0 GB de tamaño, 0 descargas y 0 *likes*, lo que apunta a un experimento de investigación no validado ni distribuido.

Por tanto, esta ficha debe leerse como una evaluación de un artefacto experimental y opaco. Lo único verificable es su existencia, su formato de pesos (`safetensors`, librería `transformers`) y su compatibilidad declarada con endpoints de inferencia. Todo lo demás se marca explícitamente como no disponible o inferido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Inferida del identificador: transformer decoder-only tipo Qwen2.5 (no confirmado en la model card) |
| Parámetros totales | No disponible. Inferido del identificador: ~1.500 millones (1,5B) |
| Parámetros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible para este ajuste. El modelo base Qwen2.5-1.5B declara 32.768 tokens; no se confirma que el fine-tuning lo preserve |
| Tipos de cuantización | No disponible. El repositorio solo incluye pesos `safetensors`; no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible. El modelo base Qwen2.5 cubre 29 idiomas (incluido el español); no hay confirmación para este ajuste |
| Licencia | No disponible. La del modelo base Qwen2.5-1.5B es Apache 2.0, pero el autor no declara licencia para el derivado |
| Formato de pesos | `safetensors` (librería `transformers`) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura, el procedimiento de entrenamiento, el volumen de datos, la composición del dataset ni el uso de técnicas de alineación (RLHF, DPO, PPO). La model card mantiene todos los apartados de entrenamiento en "[More Information Needed]", incluidos los hiperparámetros y el régimen de precisión.

A partir del identificador puede inferirse, sin confirmación documental, un escenario de *supervised fine-tuning* sobre Qwen2.5-1.5B usando datos derivados de PrimeKG (grafo de conocimiento de medicina de precisión con decenas de miles de relaciones entre fármacos, enfermedades, genes y fenotipos), y una ejecución identificada con la semilla 7, probablemente dentro de un barrido de semillas para medir varianza experimental. El único tag técnico relevante es `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la propia plantilla de HuggingFace; no describe la arquitectura ni el entrenamiento de este modelo.

No se documenta ninguna innovación técnica: ni decodificación especulativa, ni atención lineal, ni variantes híbridas SSM/transformer.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base (no verificada en este ajuste).
- Razonamiento de propósito general y matemáticas básicas, en el rango esperable de un modelo de 1,5B parámetros (sin datos de evaluación publicados).
- Generación de código de complejidad baja a media, no confirmada para este ajuste.
- Procesamiento de lenguaje natural sobre texto biomédico, si se confirma el ajuste sobre PrimeKG.
- Soporte de *tool calling* / *function calling*: no disponible; no se documenta ni se confirma.
- Soporte de agentes y razonamiento multi-paso: no disponible; la ventana de contexto efectiva del ajuste no está verificada.
- Capacidades multilingües: no disponibles para este ajuste.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; no se declara ninguna.
- Compatibilidad con endpoints de inferencia: declarada mediante el tag `endpoints_compatible`.

## Casos de uso

Los casos siguientes son hipótesis de uso condicionadas a que el ajuste sobre PrimeKG se confirme y a que la licencia lo permita. Ninguno está validado con evaluaciones publicadas.

- Extracción de tripletas biomédicas: dado un fragmento de texto científico, generar relaciones estructuradas (fármaco–enfermedad, gen–fenotipo) si el entrenamiento se realizó sobre tripletas de PrimeKG. Un modelo de 1,5B es adecuado para esta tarea por su bajo coste de inferencia y su facilidad de despliegue en lote.
- Preguntas y respuestas sobre grafos de conocimiento médicos: responder consultas del tipo "¿qué genes están asociados a esta enfermedad?" cuando el conocimiento está codificado en el conjunto de entrenamiento. Requiere validación previa contra la fuente original para descartar alucinación.
- Prototipado académico de experimentos de reproducibilidad: al estar etiquetado con una semilla (seed 7), encaja en estudios que comparan variabilidad entre ejecuciones de SFT con presupuesto reducido.
- Clasificación y normalización de entidades clínicas: mapear términos libres a identificadores de ontologías médicas, como paso previo en un *pipeline* de curación de datos.
- Generación de resúmenes de literatura biomédica en entornos con GPU de gama media o incluso CPU, gracias al reducido tamaño del modelo.
- Filtrado previo (*pre-filtering*) en pipelines RAG médicos: usar el modelo para descartar documentos irrelevantes antes de invocar un modelo mayor, reduciendo coste por consulta.
- Evaluación de técnicas de destilación o de ajuste con conocimiento estructurado: servir como línea base pequeña frente a modelos médicos de 7B o superiores.
- Asistente educativo en dominios científicos: explicación de conceptos básicos con la advertencia de que un modelo de 1,5B sin alineación explícita no es apto para decisiones clínicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye la sección de evaluación cumplimentada (todos los campos figuran como "[More Information Needed]"), no hay métricas de MMLU, HumanEval, GSM8K, MedQA ni PubMedQA, y la búsqueda web realizada no devolvió ningún material relacionado con el modelo (los resultados obtenidos corresponden a páginas de WhatsApp y son totalmente ajenos a la consulta). No se debe atribuir a este modelo ningún número de rendimiento.

## Requisitos de hardware

Las estimaciones siguientes se basan en el tamaño inferido de 1,5B parámetros y son cálculos teóricos, no mediciones publicadas por el autor.

- VRAM para inferencia (solo pesos, sin caché KV): ~3,1 GB en FP16/BF16; ~1,6 GB en INT8; ~1,0-1,2 GB en cuantización de 4 bits.
- VRAM total recomendada: 6-8 GB en FP16 con contexto moderado, 4-6 GB en INT8, 2-4 GB en 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 3080, RTX 4070, RTX 4080, RTX 4090), así como A10G, L4, A100 y H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con 6 GB o más de VRAM; en cuantización de 4 bits puede ejecutarse incluso en CPU con `llama.cpp`, aunque con latencia elevada.
- Opciones de despliegue: `transformers` (nativo, ya que el repositorio declara `library_name: transformers` y tag `endpoints_compatible`), vLLM, HuggingFace TGI, llama.cpp/Ollama previa conversión a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, latencia de primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento de este ajuste, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad de los modelos de referencia del mismo rango. Los datos de los modelos comparados corresponden a sus fichas públicas y no se han verificado para esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `olusegunola/qwen2.5-1.5b-primekg-sft-seed7` | ~1,5B (inferido) | No disponible | No disponible | safetensors | 0 descargas, repositorio de 0,0 GB, sin model card |
| Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Ampliamente distribuido y documentado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 (consultar ficha oficial) | safetensors, GGUF, AWQ | Ampliamente distribuido, con alineación por instrucciones |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente distribuido |
| Alternativas biomédicas de 7B (por ejemplo, derivados de Mistral o Llama 2 ajustados con corpus médicos) | ~7B | 4.096-32.768 tokens según base | Variable según base | safetensors, GGUF | Documentadas, pero no comparables en coste de inferencia |

La comparación de rendimiento frente a cualquiera de estos modelos es imposible con la información disponible: no hay evaluaciones publicadas para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar, por lo que se desconocen los datos de entrenamiento, la composición del corpus, el número de tokens vistos y los hiperparámetros.
- Licencia no declarada: al no especificarse licencia para el derivado, el uso comercial queda en un limbo legal. Aunque el modelo base Qwen2.5-1.5B sea Apache 2.0, el autor no ha transferido ni confirmado términos para este ajuste.
- Riesgo elevado de alucinación: un modelo de 1,5B sin alineación documentada puede generar afirmaciones biomédicas plausibles pero falsas, especialmente si se le consulta sobre conocimiento que no estaba en PrimeKG.
- No apto para uso clínico ni para decisiones que afecten a pacientes. No hay validación externa, ni métricas de sensibilidad/especificidad, ni revisión por pares.
- Sesgos desconocidos: no se documenta ningún análisis de sesgo demográfico, lingüístico ni de representación de poblaciones en los datos de entrenamiento.
- Cobertura idiomática incierta: si el ajuste se hizo únicamente sobre PrimeKG, el modelo puede haber perdido competencia multilingüe y generalista respecto al base (olvido catastrófico).
- Limitaciones de contexto no verificadas: se desconoce si el ajuste preserva los 32.768 tokens del base o si el entrenamiento se hizo con secuencias más cortas.
- Anomalías en los metadatos: la fecha de creación registrada (2026-09-19) es posterior a la fecha actual, el tamaño del repositorio aparece como 0,0 GB y el número de descargas es 0. Esto sugiere que los pesos pueden no estar efectivamente subidos o que el artefacto está incompleto; conviene verificar la integridad del repositorio antes de cualquier uso.
- Sin soporte aparente: no hay autor de contacto, ni repositorio de código, ni issues, ni paper asociado.
- Los resultados de la búsqueda web realizada no aportan ningún material relevante sobre el modelo, por lo que no existe literatura independiente que lo respalde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-sft-seed7
- Modelo base de referencia (Qwen2.5-1.5B): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Artículo citado en los tags del repositorio (`arxiv:1910.09700`, Lacoste et al., 2019, sobre estimación de emisiones de carbono; no describe este modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático mencionada en la plantilla de la model card: https://mlco2.github.io/impact
- PrimeKG (grafo de conocimiento de medicina de precisión, Zitnik Lab, Universidad de Harvard): no se proporciona enlace en la información disponible; el nombre del modelo sugiere su uso, pero no está confirmado por el autor.
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
