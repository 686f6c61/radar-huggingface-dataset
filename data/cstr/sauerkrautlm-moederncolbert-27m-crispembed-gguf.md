# cstr/SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF

## Resumen

SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF es un paquete GGUF derivado del checkpoint VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M, un modelo ColBERT de recuperación de información con arquitectura de mezcla de expertos (MoE) y 27,124 millones de parámetros. Lo publica el usuario cstr dentro del ecosistema CrispEmbed, cuyo motor MoEdern expone una API de texto crudo para generar embeddings de tokens y matrices de similitud MaxSim propias del paradigma ColBERT. No es un modelo generativo: no produce texto ni razonamiento, sino representaciones vectoriales por token orientadas a búsqueda y ranking.

La relevancia del paquete es doble. Por un lado, ofrece un empaquetado F32 byte-preserving (109.596.000 bytes) que conserva los pesos y metadatos del tokenizador original sin aritmética de tensores, verificado en Linux x64 sobre CPU con vectores dentro de 4,47e-07 del original. Por otro, incluye un paquete experimental Q4_K_MIX de 32.008.416 bytes que reduce el tamaño un 70,8 % respecto al F32, con una receta mixta de cuantización (Q8_0 base, Q4_K en proyecciones de expertos enrutados y attn_q, F32 en embeddings, router, normas y cabeza densa).

Ambos paquetes están pensados exclusivamente para el motor MoEdern de CrispEmbed, que es CPU-only y requiere un conjunto de variables de entorno (gates) activadas explícitamente. La licencia es Apache-2.0 y el modelo base es de VAGOsolutions, por lo que el paquete se limita a reempaquetar y, en el caso Q4_K_MIX, cuantizar, sin entrenamiento, mezcla ni fine-tuning adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT con mezcla de expertos (MoE) enrutada por hash; encoder de tokens para recuperación |
| Parametros totales | 27.124.000 |
| Parametros activos | no disponible (el router es hash-MoE con top-2 por token, pero no se publica el recuento de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (paquete de referencia) y Q4_K_MIX experimental (Q8_0 base; Q4_K en proyecciones up/down de expertos enrutados y attn_q; Q8_0 en expertos gate, expertos compartidos y attn_k/v/o; F32 en embeddings, router, normas y cabeza densa) |
| Idiomas soportados | no disponible (el modelo base es SauerkrautLM, orientado a alemán e inglés, pero no se declara lista de idiomas en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: `moedern-27m-text-f32.gguf` y `moedern-27m-text-q4_k-mix.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un ColBERT de 27 millones de parámetros con una capa de mezcla de expertos enrutada por hash. Cada token activa los dos mejores expertos (top-2), lo que introduce una fuente de sensibilidad: pequeñas perturbaciones numéricas pueden invertir la elección de experto en casos de casi empate y alterar el vector resultante. El paquete no aporta información sobre el número de tokens de entrenamiento, la composición del corpus, ni si hubo RLHF, DPO u otras fases de alineación; esos datos corresponden al checkpoint original de VAGOsolutions y no se reproducen aquí.

El paquete F32 es un reempaquetado byte-preserving: no hay aritmética de tensores, solo empaquetado del modelo y los metadatos del tokenizador. El paquete Q4_K_MIX sí aplica cuantización real con una política mixta (`moedern27m_q4k_v1`), generada con el cuantizador portable en C `tests/moedern-q4k` y el script `tools/moedern-colbert/quantize_q4k_mixed.py`. La build debe reproducir los bytes exactos medidos en el run 41618191791 o el flujo de trabajo rechaza la publicación. No se ha entrenado, mezclado ni ajustado nada; solo se ha reempaquetado y cuantizado, conforme a la sección 4(b) de Apache-2.0.

## Capacidades

- Generación de embeddings de tokens para recuperación de información (paradigma ColBERT, similitud MaxSim).
- Expansión de consultas (query expansion) verificada con IDs de token y máscaras exactos en el paquete F32.
- Codificación de documentos y consultas en texto crudo mediante la API MoEdern de CrispEmbed.
- Cálculo de matrices de similitud por token y puntuaciones MaxSim para ranking de pasajes.
- Soporte de clientes públicos en C, Python y CLI (el paquete F32); el Q4_K_MIX no tiene medidos los clientes C#, Rust, Dart ni HTTP.
- No es un modelo generativo: no produce texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo thinking.
- Multilingüismo: no declarado en la información disponible.

## Casos de uso

- Búsqueda semántica sobre corpus documentales: el modelo genera embeddings por token y permite ranking con MaxSim, adecuado para motores de recuperación que necesitan granularidad fina en lugar de un único vector por documento.
- Recuperación en pipelines RAG: se puede usar como retriever ColBERT en sistemas de generación aumentada, alimentando pasajes candidatos a un modelo generativo posterior; su tamaño de 27 M lo hace desplegable en CPU.
- Ranking de pasajes en motores de búsqueda corporativos: la similitud MaxSim por token captura coincidencias parciales y términos raros mejor que un embedding denso único, útil en dominios técnicos o legales.
- Evaluación de calidad de cuantización: el paquete Q4_K_MIX sirve como caso de estudio reproducible para medir el impacto de la cuantización mixta en vectores de recuperación, con métricas de coseno por token y error MaxSim documentadas.
- Despliegue en entornos sin GPU: el motor MoEdern es CPU-only y el paquete F32 se ha verificado en Linux x64 sobre CPU (AMD EPYC 7763 y ARM Neoverse-N2), lo que permite integrarlo en servidores sin acelerador.
- Indexación de colecciones pequeñas y medianas con re-codificación completa: dado que los vectores Q4_K_MIX no deben mezclarse con índices F32, encaja en flujos donde se re-codifica toda la colección con un único fichero.
- Investigación sobre enrutado MoE en recuperación: la limitación documentada de "routing flips" en el router hash-MoE ofrece un caso concreto para estudiar la robustez de la cuantización en modelos con enrutado discreto.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de recuperación estándar (MMLU, HumanEval, GSM8K no aplican a un modelo de embeddings), sino métricas de fidelidad frente al original congelado en un panel de diez casos de texto crudo.

| Paquete | Tamano | Estado | IDs/mascaras de token | Coseno minimo vector-token x86 / ARM | Coseno minimo matriz por caso | Error maximo MaxSim | SciFact nDCG@10 |
|---|---:|---|---|---|---|---|---|
| F32 (publicado) | 104,52 MiB | referencia | exacto | 1,000000 | 1,000000 | 1,9e-06 | no medido |
| Q8_0 (no publicado) | 35,67 MiB | falla el umbral 0,97 de Q8 | exacto | 0,9315 | 0,9959 | 0,070 | no medido |
| Q4_K_MIX (este fichero) | 30,53 MiB | experimental | exacto | 0,9685 / 0,9688 | 0,9953 | 0,183 | no medido |

Puntuaciones MaxSim en los tres pares congelados: q-de|d-de 15,858 frente a 15,958 del original; q-empty|d-one 20,879 frente a 21,062; q-markers|d-unicode 23,229 frente a 23,182. Los presupuestos estrictos de 0,002 absoluto y 0,99999 de coseno no se cumplen, algo esperado en 4 bits. El peor token es `q-empty/all`. No se han medido SciFact ni otras métricas de recuperación (nDCG, MRR, Recall, acuerdo top-1), ni clientes públicos C#/Rust/Dart/HTTP, ni GPU (el motor MoEdern es CPU-only), ni entradas largas más allá del panel.

## Requisitos de hardware

- VRAM: no aplica; el motor MoEdern es CPU-only. El paquete F32 ocupa 104,52 MiB en disco y el Q4_K_MIX 30,53 MiB.
- GPU recomendadas: no disponible; no hay soporte de GPU en el motor.
- Cabe en cualquier CPU consumer: el paquete F32 (109.596.000 bytes) y el Q4_K_MIX (32.008.416 bytes) son manejables en memoria RAM convencional.
- Plataformas verificadas: Linux x64 sobre AMD EPYC 7763 (x86) y ARM Neoverse-N2. Otras plataformas no verificadas.
- Opciones de despliegue: API de texto crudo de CrispEmbed con gates `CRISPEMBED_MOEDERN_*` activados; clientes C, Python y CLI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no son aplicables a este motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF (este) | 27,12 M | no disponible | GGUF (F32, Q4_K_MIX) | Apache-2.0 | Solo motor MoEdern (CPU); recuperación ColBERT con MoE hash |
| VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M (base) | 27,12 M | no disponible | safetensors (presumible) | Apache-2.0 | Checkpoint original; este paquete lo reempaqueta |
| Otros modelos ColBERT de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre alternativas ColBERT comparables en parámetros, contexto, rendimiento o licencia dentro de la documentación consultada.

## Limitaciones y advertencias

- El paquete Q4_K_MIX es experimental (decisión del propietario, 7 de noviembre de 2026) y su calidad de recuperación no se ha medido; solo se ha validado la fidelidad de vectores en un panel congelado de diez casos.
- No se deben mezclar vectores del Q4_K_MIX con un índice construido con el paquete F32; es obligatorio re-codificar toda la colección con un único fichero.
- El router hash-MoE produce elecciones top-2 de experto en casos de casi empate; una pequeña perturbación numérica puede invertir un experto para un token y dominar el mínimo de coseno ("routing flips").
- Los presupuestos estrictos de fidelidad (0,002 absoluto / 0,99999 coseno) no se cumplen en el paquete Q4_K_MIX.
- Solo verificado en Linux x64 CPU (x86 y ARM); no verificado en GPU, otras plataformas ni con cuantizaciones distintas.
- Los gates `CRISPEMBED_MOEDERN_*` están desactivados por defecto; sin ellos el comportamiento no cambia y el modelo no se carga.
- No es un modelo generativo: no debe usarse para tareas de texto, razonamiento, código o agentes.
- Sesgos conocidos: no documentados en la información disponible; al derivar del modelo base de VAGOsolutions, hereda los sesgos de su corpus de entrenamiento, no detallado aquí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de recuperación incorrecta por pérdida de fidelidad en la cuantización.
- Idiomas soportados: no declarados; el nombre "SauerkrautLM" sugiere orientación a alemán e inglés, pero no se confirma en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de cambios de la sección 4(b) y los ficheros `upstream/LICENSE` y `upstream/README.md` sin modificar.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/SauerkrautLM-MoEdernColBERT-27M-CrispEmbed-GGUF
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M
- Revisión concreta del modelo base citada: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-27M/tree/d2b7b1feaaac1bf87510ca9525208c3daeabcc5a
- Documentación de la cuantización mixta: `docs/moedern-q4k-mixed.md` (referenciada en la model card, sin URL pública en la información disponible)
- Recibo de calidad: `tests/results/moedern-colbert/q4k-lane-27m.json` (referenciado, sin URL pública en la información disponible)
