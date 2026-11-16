# rarfileexe/FlameLedger-Encoder

## Resumen

FlameLedger Encoder es un modelo de embeddings de texto derivado de `google/embeddinggemma-2`, afinado por el equipo Team Qubit para recuperación semántica sobre literatura de combustión en microgravedad y seguridad contra incendios en naves espaciales del NASA Technical Reports Server (NTRS). El modelo conserva la arquitectura del backbone de texto de EmbeddingGemma 2 (270M parámetros en la torre de texto, 744M totales en el checkpoint publicado) y produce embeddings de 768 dimensiones con soporte Matryoshka truncable a 512, 256 y 128 dimensiones. Se distribuye como exportación solo-texto en FP32; las torres de visión y audio del modelo base quedaron congeladas y no se incluyen.

El problema que aborda es acotado pero concreto: la recuperación de pasajes técnicos en un corpus especializado donde el vocabulario (concentraciones de oxígeno, velocidades de flujo opuesto, materiales como 6061-T6, detectores de humo en la ISS) no se alinea bien con embeddings de propósito general. El autor es explícito sobre las expectativas: el ajuste se hizo con 1.025 tripletas sintéticas generadas por un profesor sobre 486 pasajes, y las mejoras frente al modelo base son modestas. En una prueba con 23 preguntas redactadas por el profesor y no revisadas no se detectó mejora alguna, y BM25 sigue siendo un baseline fuerte en este corpus.

La relevancia del modelo es, por tanto, la de un componente de primera etapa en pipelines RAG híbridos (denso + BM25 con fusión RRF) para dominios científicos muy específicos, no la de un embedding de propósito general. Está publicado con licencia Apache 2.0, en inglés, con fecha de creación en noviembre de 2026, y se usa en producción en la consola de investigación FlameLedger.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (torre de texto de EmbeddingGemma 2); exportación solo-texto |
| Parametros totales | 744.371.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens usados en entrenamiento; el modelo base soporta hasta 8K |
| Tipos de cuantizacion | No disponible (el autor recomienda FP32 o BF16; advierte contra FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 1,5 GB, FP32) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del codificador de texto de `google/embeddinggemma-2` (Google DeepMind), un transformer con backbone de texto de 270M parámetros dentro de un checkpoint de 740M. Solo se entrenó la torre de texto, con aproximadamente 271M parámetros entrenables; las torres de visión y audio se congelaron y no se usan en esta exportación. La salida son embeddings de 768 dimensiones normalizables por L2 para similitud coseno, con estructura Matryoshka que permite truncar a 512, 256 o 128 dimensiones y renormalizar después.

Los datos de entrenamiento son sintéticos. Se recuperaron 416 registros del NTRS, de los que quedaron 399 artículos tras deduplicación y filtrado temático, segmentados en 486 pasajes (399 abstracts y 87 fragmentos de cuerpo de 10 PDFs a texto completo). El profesor generó 1.412 consultas válidas tras validación por reglas (1.128 de entrenamiento, 134 de desarrollo, 150 de prueba), y el conjunto final de entrenamiento consta de 1.025 tripletas. El modelo exige prefijos fijos en consultas y documentos (`"task: search result | query: "` y `"title: {t} | text: {text}"`); omitirlos degrada silenciosamente la calidad de recuperación. La configuración recomendada de producción es híbrida: coseno denso a 768 dimensiones fusionado con BM25 (k1 = 1,5, b = 0,75) mediante Reciprocal Rank Fusion con k = 60 sobre el top 100 de cada ranking.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de pasajes (pipeline `sentence-similarity` / `feature-extraction`).
- Búsqueda semántica y recuperación densa sobre literatura técnica de combustión, microgravedad y seguridad contra incendios en naves.
- Embeddings Matryoshka truncables a 512, 256 y 128 dimensiones con renormalización posterior.
- Integración con `sentence-transformers` mediante `encode()` con prefijos manuales.
- Recuperación híbrida denso + léxico (BM25 + RRF), que es la configuración con mejores resultados según el autor.
- Solo inglés; no soporta entradas de imagen ni audio en esta exportación.
- No realiza tool calling, function calling, razonamiento multi-paso ni verificación de afirmaciones: únicamente ordena pasajes por relevancia.

## Casos de uso

- Recuperación de primera etapa en un RAG científico: indexar abstracts y fragmentos de informes del NTRS con el prefijo de documento y consultar con el prefijo de consulta para obtener candidatos que luego se reranquean o se citan con su fuente.
- Consola de investigación de seguridad contra incendios en cabina: el modelo se usa en producción en FlameLedger para clasificar experimentos de combustión de NASA y NIST frente a un entorno de cabina propuesto, mostrando siempre la fuente del pasaje.
- Búsqueda híbrida sobre corpus técnico pequeño: combinar los embeddings densos con BM25 mediante RRF cuando el vocabulario incluye identificadores exactos (aleaciones, números de informe, concentraciones) que el embedding denso puede diluir.
- Asistente de revisión bibliográfica: dado un fenómeno (por ejemplo, propagación de llama en flujo opuesto de baja velocidad), recuperar pasajes relevantes de informes históricos para que un investigador los revise manualmente.
- Indexación con presupuesto de almacenamiento reducido: truncar los embeddings a 256 dimensiones y renormalizar para reducir el espacio del índice vectorial, aceptando la pérdida de calidad documentada por el autor.
- Filtrado temático previo a revisión experta: descartar pasajes no relacionados antes de una lectura humana, sin que la decisión final dependa del modelo.
- Prototipado rápido de motores de búsqueda de nicho: al ser un export de 1,5 GB en FP32 con licencia Apache 2.0, se puede desplegar en infraestructura modesta para validar un pipeline de recuperación antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las ganancias sobre el modelo base se midieron con consultas sintéticas escritas por el profesor y son modestas, y que en un conjunto de 23 preguntas redactadas por el profesor y no revisadas no se detectó mejora. También señala que BM25 es un baseline fuerte en este corpus. No se proporcionan cifras de MMLU, HumanEval, GSM8K, MTEB ni métricas de recuperación (nDCG, Recall@k) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3 GB en FP32 para los 744M parámetros, más el overhead de activaciones y tokenizador; en BF16 aproximadamente 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP32; A100, H100 o RTX 4090 son sobredimensionadas para este modelo y solo se justifican por concurrencia o indexación masiva.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (referencia del autor), y por compatibilidad con el ecosistema del modelo base, servidores de embeddings tipo TEI o vLLM con soporte de embedding; el autor no documenta configuraciones específicas para estos últimos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FlameLedger Encoder | 744M (torre de texto ~270M) | 512 en entrenamiento; 8K en el base | Inglés | Apache 2.0 | Fine-tune de dominio sobre 486 pasajes; requiere prefijos; pensado para uso híbrido con BM25 |
| google/embeddinggemma-2 | 740M (torre de texto 270M) | Hasta 8K | Multilingüe según el modelo base | Según el modelo base (no disponible en esta ficha) | Modelo base; recomendado por el autor para uso general y multilingüe |
| BM25 (baseline léxico) | No aplica | No aplica | Depende del tokenizador | No aplica | Baseline fuerte en este corpus según el autor; se recomienda combinarlo con el modelo denso |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que las ganancias sobre el modelo base son modestas y que en un conjunto de 23 preguntas no revisadas no se detectó mejora.
- El entrenamiento usa exclusivamente datos sintéticos (1.025 tripletas, 486 pasajes), lo que limita la generalización a consultas reales fuera de la distribución del profesor.
- No debe usarse para decisiones de seguridad contra incendios, cualificación de materiales ni juicios críticos de seguridad; la relevancia de recuperación no equivale a corrección científica.
- No verifica afirmaciones: solo ordena pasajes; no sirve para answer verification.
- Solo inglés; no es un embedding multilingüe ni de propósito general.
- Requiere prefijos exactos en consultas y documentos; omitirlos degrada la calidad sin aviso.
- El autor recomienda FP32 o BF16 y advierte contra FP16.
- El truncado Matryoshka por debajo de 256 dimensiones degrada la calidad según los resultados del autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales que deben revisarse antes de producción.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible; al ser un modelo de recuperación, el riesgo se traslada al sistema que consuma los pasajes recuperados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarfileexe/FlameLedger-Encoder
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Demo en vivo: https://flameledger.agenticerastudio.tech
- Código: https://github.com/Muhammad-Hassan12/FlameLedger
