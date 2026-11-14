# Sapnil/citeaudit-reranker

## Resumen
CiteAudit evidence reranker es un cross-encoder BERT especializado en verificación de integridad de citas bibliográficas en el dominio biomédico. Desarrollado por Sapnil (SapnilPatel) como componente de recuperación del sistema CiteAudit, el modelo resuelve un problema concreto: identificar, dentro de un artículo citado, qué frases respaldan realmente la afirmación de la frase que lo cita. Se trata de la mitad de recuperación del pipeline; las 20 frases mejor puntuadas se envían después al clasificador CiteAudit NLI.

El modelo parte de BiomedBERT (microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext) y se afina como cross-encoder para producir un único logit de relevancia. Con 109,5 millones de parámetros y una ventana de 192 tokens, está diseñado para rerankear las 60 mejores frases recuperadas por BM25 (k1 0,9, b 0,4), no para búsqueda a gran escala. Su relevancia actual reside en que mejora de forma medible la recuperación de evidencia frente a la línea base BM25 + MonoT5 sobre el conjunto de test Citation-Integrity.

La licencia MIT y el formato safetensors lo hacen desplegable sin fricción en pipelines de transformers o Text Embeddings Inference. Es un modelo pequeño, monolingüe (inglés) y de nicho, orientado a auditar afirmaciones científicas y detectar citas que no están respaldadas por la fuente referenciada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (cross-encoder), fine-tuned desde BiomedBERT |
| Parametros totales | 109.483.009 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens por par (frase citante + frase candidata con vecinos) |
| Tipos de cuantizacion | no disponible (pesos safetensors; cuantización no documentada) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un cross-encoder basado en BERT base (12 capas, arquitectura transformer encoder), inicializado desde BiomedBERT, un checkpoint preentrenado sobre literatura biomédica (abstracts y full text de PubMed). La entrada se construye como un par de secuencias: text_a es la frase citante con los marcadores de cita eliminados; text_b es una frase candidata del artículo citado, ampliada con hasta 200 caracteres de cada frase vecina, truncada a 192 tokens. La salida es un único logit de relevancia, mayor cuanto más relevante es la frase candidata.

El afinamiento se realizó sobre el split de entrenamiento de Citation-Integrity (Sarol et al., 2024) con una pérdida listwise sobre cada frase gold y negativos muestreados con BM25. El detalle de construcción de ventanas es crítico: el código de entrenamiento recorta una frase previa de 100 a 200 caracteres a sus últimos `200 - len` caracteres. Construir las ventanas de otra forma altera las puntuaciones, por lo que se recomienda usar `citeaudit.retrieval.window` del paquete oficial.

## Capacidades
- Reranking de frases candidatas para verificación de evidencia en citas científicas.
- Puntuación de relevancia cross-encoder entre una frase citante y una frase de la fuente citada.
- Integración en pipelines de recuperación en dos etapas (BM25 seguido de reranking).
- Trabajo conjunto con el clasificador CiteAudit NLI para decidir si la cita está respaldada.
- Dominio biomédico especializado (vocabulario y estilo de PubMed).
- Idioma inglés exclusivamente.
- No soporta tool calling, agentes ni razonamiento multi-step; es una tarea de clasificación puntual.
- Sin capacidades de visión, audio ni modo thinking.

## Casos de uso
- Auditoría de integridad de citas en manuscritos biomédicos: el modelo localiza, dentro del artículo citado, las frases que respaldan la afirmación citante, permitiendo detectar citas no sustentadas antes de enviar el manuscrito a revisión.
- Verificación automatizada en revistas y sistemas editoriales: integrado tras BM25, rerankea las 60 frases candidatas y entrega las 20 mejores al clasificador NLI, reduciendo la carga de revisión manual de referencias.
- Detección de citas misatribuidas en revisiones sistemáticas: al comparar la frase citante con la evidencia recuperada, permite señalar discrepancias entre lo afirmado y lo publicado en el estudio original.
- Construcción de datasets de evidencia científica: el pipeline CiteAudit puede generar pares (afirmación, frase de respaldo) etiquetados para entrenar clasificadores de verificación de hechos biomédicos.
- Sistemas de control de calidad en bases de conocimiento biomédicas: el reranker sirve para validar que cada afirmación indexada apunta a una frase concreta de la fuente, mejorando la trazabilidad.
- Servicio de inferencia ligero mediante Text Embeddings Inference: compatible con endpoints y con un footprint de 0,4 GB, puede desplegarse como microservicio de reranking en infraestructura modesta para herramientas de gestión bibliográfica.

## Benchmarks y rendimiento
Resultados sobre el conjunto de test Citation-Integrity (20 artículos, 606 citas con evidencia):

| Retrieval | Recall@10 | Recall@20 | MRR |
|---|---|---|---|
| BM25 + MonoT5, Sarol et al. 2024 (reproducido) | 0.422 | 0.529 | 0.323 |
| BM25 + este reranker | 0.510 | 0.627 | 0.379 |

## Requisitos de hardware
- VRAM estimada para inferencia: en torno a 0,4-0,5 GB en fp32 para los 109,5 M de parámetros; menor aún si se cuantiza, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; A100 o H100 no son necesarias y quedarían sobredimensionadas para este modelo.
- Cabe holgadamente en GPU consumer: RTX 4090, RTX 3060, GTX 1650 e incluso iGPU con memoria suficiente.
- Opciones de despliegue: transformers (pipeline text-classification), Text Embeddings Inference (etiqueta text-embeddings-inference y endpoints_compatible). No se documentan GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un cross-encoder de 192 tokens, la latencia por par es baja, pero el coste total depende del número de pares rerankeados (hasta 60 por cita).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CiteAudit evidence reranker | 109,5 M | 192 tokens | Reranking de evidencia biomédica | MIT | Hugging Face |
| MonoT5 (Sarol et al. 2024) | no disponible | no disponible | Reranking de evidencia | no disponible | citado en el paper |
| BM25 (línea base léxica) | no aplica | no aplica | Recuperación léxica | no disponible | librerías estándar |

En Recall@20, este reranker alcanza 0.627 frente a 0.529 de BM25 + MonoT5, y en MRR 0.379 frente a 0.323. No se dispone de datos de parámetros ni contexto de MonoT5 en la información proporcionada.

## Limitaciones y advertencias
- Modelo monolingüe en inglés; no cubre otros idiomas.
- Especializado en dominio biomédico; su rendimiento fuera de literatura PubMed no está validado.
- Sensible a la construcción de ventanas: usar un método distinto de `citeaudit.retrieval.window` altera las puntuaciones.
- Solo rerankea; no recupera por sí mismo, depende de BM25 para la primera etapa y del clasificador NLI para la decisión final.
- Riesgo de alucinación bajo en la tarea de clasificación, pero puede asignar relevancia alta a frases superficialmente similares sin respaldo semántico real.
- Sesgos del corpus de entrenamiento (Citation-Integrity y BiomedBERT) pueden trasladarse al modelo; no se documentan análisis de sesgo.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento de Citation-Integrity.
- Sin métricas publicadas de latencia, throughput ni cuantización; validar en producción antes del despliegue.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Sapnil/citeaudit-reranker
- Clasificador CiteAudit NLI: https://huggingface.co/Sapnil/citeaudit-nli
- Repositorio CiteAudit: https://github.com/SapnilPatel/CiteAudit
- Modelo base BiomedBERT: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
