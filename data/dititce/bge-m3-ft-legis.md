# dititce/bge-m3-ft-legis

## Resumen

`dititce/bge-m3-ft-legis` es un ajuste fino mediante LoRA del modelo de embeddings multilingüe BAAI/bge-m3, orientado a tareas de recuperación de información en el ámbito de la legislación en portugués. Lo publica el usuario dititce en HuggingFace con un repositorio de 0,1 GB, tamaño coherente con adaptadores LoRA en lugar de pesos completos. El repositorio no declara pipeline, licencia ni idiomas distintos del portugués, y acumula cero descargas y cero valoraciones.

El modelo base, BAAI/bge-m3, es un encoder de recuperación basado en XLM-RoBERTa-large (unos 568 millones de parámetros, 8192 tokens de contexto) capaz de producir representaciones densas, dispersas (lexical matching) y multi-vector al estilo ColBERT. El ajuste hereda esa arquitectura, pero la model card no documenta hiperparámetros, dataset, número de pasos ni evaluación, por lo que no es posible verificar el efecto real del fine-tune.

Su relevancia es acotada y muy específica: adaptación de dominio para *retrieval* jurídico en portugués, un nicho con poca oferta de modelos abiertos. Sin embargo, la documentación es deficiente y el código de ejemplo de la propia model card emplea `AutoModelForCausalLM`, clase incorrecta para un modelo de embeddings, lo que limita seriamente la reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (XLM-RoBERTa-large) según la documentación del modelo base BAAI/bge-m3; no especificada en el repositorio del ajuste |
| Parametros totales | ~568 M en el modelo base; no disponible para el ajuste (el repositorio de 0,1 GB sugiere adaptadores LoRA) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en el modelo base; no documentada ni verificada para el ajuste |
| Tipos de cuantizacion | no disponible en el repositorio (solo adaptadores safetensors); el modelo base admite fp16 e int8 con tooling estándar |
| Idiomas soportados | pt (declarado en la model card); el modelo base cubre más de 100 idiomas |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base BAAI/bge-m3 se publica bajo MIT) |
| Formato de pesos | safetensors (adaptadores LoRA) y etiqueta `pt`; requiere la librería PEFT para su carga |

## Arquitectura y entrenamiento

El modelo base BAAI/bge-m3 sigue una arquitectura encoder-only derivada de XLM-RoBERTa-large, con preentrenamiento RetroMAE y una estrategia de entrenamiento en varias fases sobre aproximadamente mil millones de pares multilingües, empleando autodistilización para unificar los tres modos de recuperación (denso, disperso y multi-vector). El ajuste publicado aquí consiste, según su model card, en un fine-tune con LoRA sobre ese base, aplicado a un corpus de legislación en portugués.

No se dispone de información sobre el rango y alpha de LoRA, el dropout, el número de épocas, el volumen de tokens de entrenamiento, la composición del dataset legal ni la existencia de evaluación posterior. Tampoco se documenta si se congelaron las capas del encoder, si se entrenaron las cabezas de recuperación dispersa y multi-vector o si el ajuste se limitó a la representación densa. El código de ejemplo de la model card es además incorrecto: instancia `AutoModelForCausalLM` y no utiliza `PeftModel`, por lo que tal como está publicado probablemente no cargue el adaptador.

## Capacidades

- Recuperación densa de pasajes: genera embeddings de oración y documento para búsqueda semántica, presumiblemente especializados en texto legal en portugués.
- Recuperación dispersa (lexical): el base produce pesos léxicos, útiles para coincidencias exactas de términos jurídicos y referencias normativas.
- Recuperación multi-vector: el base genera representaciones por token al estilo ColBERT, que mejoran el *reranking* fino.
- Procesamiento de secuencias largas: hasta 8192 tokens en el base, adecuado para artículos, acórdãos y contratos extensos.
- Multilingüismo: el base cubre más de 100 idiomas, aunque el ajuste solo declara portugués y podría haber degradado el resto.
- No es un modelo generativo: no produce texto, no soporta *tool calling*, no implementa agentes ni razonamiento multi-paso, y no tiene modo *thinking*, visión ni audio.
- No se documenta ningún modo de instrucciones ni plantilla de prompt específica para el ajuste.

## Casos de uso

- Búsqueda semántica en bases de legislación portuguesa: indexar el *Diário da República*, códigos y reglamentos y recuperar artículos relevantes ante consultas en lenguaje natural, aprovechando los 8192 tokens de contexto del base para no trocear en exceso.
- RAG jurídico: servir como recuperador en un pipeline de generación aumentada donde un LLM redacte respuestas citando normativa; el modelo aporta los pasajes y el LLM la generación, evitando así el riesgo de alucinación en la recuperación.
- Recuperación híbrida de citas normativas: combinar el modo denso con el disperso para localizar referencias exactas del tipo "artigo 12.º do Código Civil", donde la coincidencia léxica es crítica.
- Deduplicación y agrupamiento de documentos legais: generar embeddings de acórdãos o contratos y aplicar similitud coseno para detectar versiones consolidadas, duplicados o jurisprudencia repetida.
- Enrutado y clasificación de consultas jurídicas: usar los embeddings como entrada de un clasificador que dirija consultas a la materia correspondiente (fiscal, laboral, civil) en un despacho o servicio de atención ciudadana.
- Filtrado de precedentes relevantes: en una herramienta de investigación jurídica, ordenar sentencias por relevancia semántica respecto a un caso nuevo antes de la revisión humana.
- *Compliance* y revisión contractual: comparar cláusulas de contratos entrantes contra una biblioteca de cláusulas validadas para señalar desviaciones, apoyándose en la capacidad multi-vector del base para captar diferencias finas de redacción.
- Recomendación de normativa relacionada: dado un artículo, recuperar legislación conexa o modificadora dentro de un portal legislativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MTEB, de tareas de recuperación (nDCG@10, Recall@k) ni de conjuntos de evaluación jurídica en portugués, y no se aporta comparación alguna contra el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia, asumiendo ~568 M de parámetros en el encoder base: en torno a 2,3 GB en fp32, 1,2 GB en fp16 y 0,7 GB en int8. Son estimaciones derivadas del tamaño del base, no mediciones publicadas del ajuste.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso GPU de 4 GB como la GTX 1650 en fp16, siempre que el tamaño de lote sea moderado.
- Funciona en CPU para cargas de baja concurrencia; el cuello de botella es el *throughput*, no la memoria.
- Opciones de despliegue: `sentence-transformers`, `FlagEmbedding`, `transformers` + `peft`, servidores de embeddings como Infinity o Text Embeddings Inference (TGI), exportación a ONNX Runtime u OpenVINO. vLLM con tarea de *pooling* es viable para el base, aunque no está documentado para este adaptador. El soporte en llama.cpp u Ollama es limitado y no es la vía recomendada para un encoder de recuperación.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dititce/bge-m3-ft-legis | ~568 M (base) | 8192 (base) | pt (declarado) | no declarada | HuggingFace, 0 descargas, 0 likes |
| BAAI/bge-m3 | 568 M | 8192 | 100+ | MIT | HuggingFace, ampliamente adoptado |
| intfloat/multilingual-e5-large | 560 M | 512 | 100+ | MIT | HuggingFace, con variantes de instrucción |
| Alibaba-NLP/gte-multilingual-base | 305 M | 8192 | 70+ | Apache-2.0 | HuggingFace, con soporte ONNX |

No existe comparación de rendimiento entre el ajuste y estas alternativas, porque el autor no publica ninguna evaluación. Los datos del modelo base y de las alternativas proceden de sus respectivas model cards públicas y conviene verificarlos en la fuente antes de tomar decisiones.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin una licencia explícita, el uso comercial del adaptador es jurídicamente ambiguo. El modelo base es MIT, pero eso no cubre automáticamente los pesos derivados.
- Documentación insuficiente: no se publican hiperparámetros de LoRA, composición del dataset, número de pasos ni evaluación, lo que impide reproducir o auditar el ajuste.
- El código de la model card no funciona tal cual: usa `AutoModelForCausalLM` (incorrecto para un encoder de embeddings) y no carga el adaptador mediante `PeftModel`, pese a requerir PEFT.
- Inconsistencia de identificadores: el ejemplo de código apunta a `dititce/bge-m3-legis`, mientras que el repositorio real es `dititce/bge-m3-ft-legis`.
- Cero descargas y cero valoraciones: no hay validación externa de la calidad del ajuste.
- Riesgo de olvido catastrófico: un fine-tune de dominio estrecho sobre un encoder multilingüe puede degradar el rendimiento en idiomas distintos del portugués, sin que existan métricas que lo cuantifiquen.
- Sesgos previsibles: heredados del corpus legal portugués utilizado, con posible sobrerrepresentación de determinadas jurisdicciones, épocas legislativas y estilos jurisprudenciales, y con la terminología técnica que ello implica.
- Alucinación: al ser un modelo de recuperación no genera texto, pero puede devolver pasajes irrelevantes o incompletos; el riesgo de afirmaciones falsas recae sobre el LLM que consuma sus resultados y debe mitigarse con citas verificables.
- Cobertura de contexto no verificada: aunque el base admite 8192 tokens, no se ha comprobado el comportamiento del ajuste en secuencias largas.
- Dominio y registro limitados: no hay evidencia de rendimiento en lenguaje coloquial, consultas de ciudadanos sin formación jurídica ni idiomas distintos del portugués.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dititce/bge-m3-ft-legis
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Paper del base (BGE M3-Embedding: Multi-Lingual, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation): https://arxiv.org/abs/2402.03216
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Librería PEFT, necesaria para cargar el adaptador: https://github.com/huggingface/peft
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a páginas corporativas de Microsoft y no guardan relación con `dititce/bge-m3-ft-legis`.
