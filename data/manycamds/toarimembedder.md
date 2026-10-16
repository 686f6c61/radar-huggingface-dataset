# ManyCamDS/ToarimEmbedder

## Resumen

TóarimEmbedder es un motor de embeddings con estado (*stateful*) desarrollado por ManyCamDS, diseñado específicamente para sistemas de Recuperación Aumentada por Generación (RAG) aplicados a corpus técnicos extensos y altamente regulados: manuales de maquinaria pesada, compendios normativos, bitácoras operativas y expedientes legales. El modelo aborda tres problemas clásicos del RAG industrial: la amnesia contextual provocada por el *chunking* estático, el fenómeno *lost in the middle* y el colapso en razonamiento de múltiples saltos. Su propuesta central es sustituir la atención densa cuadrática O(n²) por formulaciones algebraicas de complejidad lineal O(n) ejecutables en CPU convencional.

El modelo cuenta con 24.305.282 parámetros y genera vectores unitarios normalizados de 768 dimensiones. A diferencia de los Transformers convencionales, combina tres núcleos algorítmicos: un enriquecimiento estructural mediante convolución de grafos (`DocumentGraphEnricher`), compresión latente por descomposición SVD de bajo rango (`LowRankLinear`) y una capa de memoria continua (`TitanMemoryLayer`) basada en *Nested Learning* con actualizaciones estabilizadas mediante el lema de Sherman-Morrison. La memoria contextual es plana y constante, independientemente de la longitud del documento, lo que en teoría permite manejar secuencias sin límite fijo.

El modelo es relevante ahora porque propone un despliegue 100% local y *air-gapped*, sin GPU, orientado a organizaciones que necesitan indexar propiedad intelectual sensible sin enviarla a APIs de terceros. Soporta castellano e inglés, se distribuye bajo licencia Apache 2.0 y su repositorio ocupa 0.1 GB. No obstante, se trata de un modelo con 1 descarga y 0 *likes* en el momento de redactar esta ficha, sin benchmarks estándar publicados, por lo que su adopción en producción debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings con estado (stateful), no Transformer de atención densa; combina GCN lineal, SVD de bajo rango y capa de memoria recurrente tipo Nested Learning |
| Parametros totales | 24.305.282 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | El autor indica "teóricamente infinita" gracias al estado persistente; memoria de tamaño constante independiente de la longitud |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

TóarimEmbedder no es un Transformer de atención densa. Su pipeline parte de un tokenizador WordPiece en Rust (local, ~711 KB) y genera embeddings base de dimensión 768. Sobre esa base aplica tres núcleos algorítmicos encadenados. El primero, `DocumentGraphEnricher`, ejecuta una convolución de grafos (GCN) con normalización espectral tridiagonal que modela dependencias topológicas locales con complejidad O(L), evitando matrices densas O(L²). El segundo, `LowRankLinear`, descompone las proyecciones en factores de bajo rango (W ≈ U·V), reduciendo la complejidad paramétrica a O(d·k).

El tercer núcleo, `TitanMemoryLayer`, implementa un bucle de *Nested Learning* con una matriz de memoria interna M de tamaño k×k. La actualización de rango 1 se estabiliza mediante el lema de Sherman-Morrison: factor = η_t / (1 + η_t·||k_t||²), y M_t = α_t·M_{t-1} + factor·(e_t ⊗ k_tᵀ). Este mecanismo desacopla la memoria contextual del tamaño del documento. El vector final se obtiene mediante *mean pooling*, normalización esférica L2 y salida de una única unidad de 768 dimensiones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de embeddings para recuperación semántica y similitud de frases (`feature-extraction`, `sentence-similarity`).
- Embeddings con estado (*stateful-embeddings*): mantiene memoria contextual entre fragmentos de un mismo documento.
- Enriquecimiento estructural de documentos mediante convolución de grafos para modelar dependencias topológicas locales.
- Memoria continua de tamaño constante, independiente de la longitud del documento.
- Optimizado para ejecución exclusiva en CPU (`cpu-optimized`), sin requerir GPU.
- Soporte nativo *air-gapped* (100% offline, redes aisladas).
- Multilingüe limitado a castellano e inglés.
- No se documentan capacidades de *tool calling*, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Indexación de manuales de maquinaria pesada: el modelo mantiene la continuidad entre capítulos iniciales (advertencias de seguridad) y secciones de mitigación situadas cientos de páginas después, algo que el *chunking* estático destruye.
- RAG sobre compendios normativos y expedientes legales: la memoria persistente permite enlazar premisas y excepciones que en documentos regulados aparecen separadas por decenas de miles de tokens.
- Bitácoras operativas y trazabilidad: útil para vincular parámetros de origen con acciones correctivas en razonamiento de múltiples saltos, reduciendo riesgos de no conformidad en auditorías.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse 100% on-premise y en CPU, permite indexar propiedad intelectual sin enviarla a APIs de terceros (soberanía de datos).
- Infraestructura de bajo coste: según el autor, reduce los costes de infraestructura hasta un 70,6% frente a alternativas con GPU; un TCO estimado de ~22,22 USD para 500 millones de tokens sobre VPS CPU.
- Sistemas de búsqueda semántica en redes aisladas (*air-gapped*): adecuado para sectores regulados que no admiten conexión a internet.
- Recuperación multi-turno en asistentes técnicos internos: el estado persistente favorece la coherencia en conversaciones que consultan el mismo expediente largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la información disponible. El autor proporciona únicamente una tabla comparativa de complejidad y costes, que se reproduce a continuación tal cual figura en la model card (datos aportados por el autor, no verificados de forma independiente):

| Métrica / Dimensión | TóarimEmbedder (Local) | OpenAI text-emb-3-large | Cohere embed-v3.0 | BGE-M3 (BAAI) |
|---|---|---|---|---|
| Complejidad asintótica | O(n) lineal | O(n²) cuadrática | O(n²) cuadrática | O(n²) cuadrática |
| Límite de contexto | Teóricamente ∞ (stateful) | 8.191 tokens | 512 tokens | 8.192 tokens |
| Hardware requerido | CPU convencional | API en la nube | API en la nube | GPU dedicada (>5,5 GB VRAM) |
| Consumo de VRAM | 0 MB (libre de GPU) | N/A (propietario) | N/A (propietario) | 5.500+ MB VRAM |
| RAM incremental | ~101,8 MB | N/A | N/A | ~2.500 MB |
| TCO (500M tokens) | ~22,22 USD (VPS CPU) | ~65,00 USD | Facturación por llamada | Coste mensual GPU cloud |
| Privacidad / soberanía | 100% on-premise local | Terceros (nube pública) | Terceros (nube pública) | On-premise (requiere GPU) |

## Requisitos de hardware

- VRAM estimada para inferencia: 0 MB; el modelo se ejecuta exclusivamente en CPU.
- GPU recomendadas: no aplica; no requiere GPU (ni A100, ni H100, ni RTX 4090).
- ¿Cabe en GPU de consumo?: no aplica; está diseñado para no usar GPU.
- RAM incremental estimada: ~101,8 MB según el autor.
- Opciones de despliegue: `transformers` (librería declarada) con dependencias `torch`, `tokenizers`, `safetensors` y `numpy`; requiere código personalizado (`custom_code`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TóarimEmbedder | 24,3 M | Stateful (teóricamente ∞) | GCN + SVD bajo rango + memoria Sherman-Morrison, CPU-only | Apache 2.0 | HuggingFace (1 descarga) |
| OpenAI text-embedding-3-large | no disponible (propietario) | 8.191 tokens | Transformer denso, API | Propietaria | API de pago |
| Cohere embed-v3.0 | no disponible (propietario) | 512 tokens | Transformer denso, API | Propietaria | API de pago |
| BGE-M3 (BAAI) | no disponible en la información | 8.192 tokens | Transformer denso, multilingüe, GPU | no disponible en la información | Público en HuggingFace |

Los datos de parámetros, licencia y disponibilidad de las alternativas no se detallan en la información proporcionada más allá de lo recogido en la tabla comparativa del autor.

## Limitaciones y advertencias

- Modelo muy reciente y prácticamente sin adopción: 1 descarga y 0 *likes* en el momento de redactar la ficha, lo que desaconseja su uso directo en producción sin validación propia.
- Ausencia total de benchmarks estándar publicados (MTEB, MMLU, etc.); las cifras de rendimiento proceden del propio autor y no están verificadas de forma independiente.
- Cobertura de idiomas limitada a castellano e inglés; no se documentan otros idiomas.
- La afirmación de contexto "teóricamente infinito" debe interpretarse con cautela: depende del comportamiento del estado persistente y no se aportan mediciones de degradación a longitudes elevadas.
- Requiere código personalizado (`custom_code`) y confianza remota (`trust_remote_code`) para cargarse con `transformers`, lo que implica ejecutar código del autor.
- No se documentan sesgos, tasas de alucinación (es un modelo de embeddings, no generativo) ni estrategias de cuantización.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantías por parte del autor.
- No es un modelo generativo: no produce texto, solo vectores; su utilidad depende de integrarlo en un pipeline RAG con un LLM aparte.
- Las métricas de TCO, consumo de RAM y comparaciones de coste proceden exclusivamente de la model card y no han sido auditadas.

## Enlaces

- HuggingFace: https://huggingface.co/ManyCamDS/ToarimEmbedder
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
