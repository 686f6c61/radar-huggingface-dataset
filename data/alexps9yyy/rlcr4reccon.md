# Alexps9yyy/rlcr4reccon

## Resumen

Structure-RLCR para ReCCon es un conjunto de seis checkpoints derivados de Qwen3 (8B y 32B) desarrollados por Alexps9yyy, entrenados con GRPO para sustituir las tres interfaces probabilisticas del pipeline de verificacion multi-cadena ReCCon. El objetivo es la deteccion de alucinaciones y la calibracion de confianza en tareas de fact-checking: en lugar de que un modelo grande emita probabilidades sin calibrar, estos modelos producen etiquetas estructuradas con puntuaciones de creencia explicitas y calibradas (objetivo Brier).

Los checkpoints se organizan por etapa del pipeline: RLCR-Joint (etapa 1, genera respuesta, analisis y confianza), RLCR-QA (etapa 3, evalua candidatos contra evidencia) y RLCR-CRED (etapa 5, meta-verificacion por cadena). Cada etapa existe en variante 8B y 32B, todas con licencia Apache 2.0 y formato de pesos safetensors para transformers.

La relevancia actual reside en que el autor reporta que el modelo de 8B iguala o supera a pipelines nativos construidos sobre modelos de 35B y 20B en el benchmark OOD IFQA, reduciendo ademas la tasa de auditoria de las etapas 2-5 del 30,7% al 15,6% con la variante de 32B. El repositorio incluye tambien los datasets de entrenamiento y los artefactos de evaluacion completos, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3) |
| Parametros totales | 8B y 32B segun checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Los modelos parten de Qwen3-8B y Qwen3-32B, transformers decoder-only, y se afinan con GRPO (Group Relative Policy Optimization) con una funcion de recompensa de scoring propio orientada a calibracion. El entrenamiento se divide en tres etapas con formatos de salida estructurados: RLCR-Joint emite `<think><answer><analysis><confidence>` optimizando una combinacion de 0,35 de exactitud y 0,65 de Brier; RLCR-QA y RLCR-CRED emiten `<think><analysis><belief>` con objetivo exclusivamente Brier.

Los datos de entrenamiento son conjuntos construidos a partir de HoVer, FactCHD, ExFEVER y SciFact, con evidencia Wikipedia recuperada mediante BM25 multi-query. Destaca la incorporacion de declaraciones contrafactuales de `ifqa_train` (3.796 en la etapa 1 y 3.800 en la etapa 3) con cero solapamiento con el test OOD de IFQA, y un 10% de ejemplos con evidencia vacia para calibracion. La etapa 5 usa filas de meta-verificacion por cadena con la etiqueta `y_i = 1[(p_i >= 0.5) == gold]`, con variantes de spread-only y dropout de `p_true`.

## Capacidades

- Generacion de texto con modo de razonamiento explicito (`<think>`) y salida estructurada en etiquetas.
- Emision de puntuaciones de confianza calibradas (belief/confidence) orientadas a minimizar el Brier score.
- Verificacion de hechos contra evidencia recuperada (fact-checking con contexto BM25).
- Deteccion de alucinaciones y de afirmaciones contrafactuales.
- Meta-verificacion por cadena: evaluacion de si la prediccion de una cadena individual es correcta.
- Razonamiento multi-paso en pipeline de varias etapas (Joint, QA, CRED).
- Test-time compute: el diseno soporta verificacion multi-cadena con agregacion de creencias.
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion de hechos en produccion: el checkpoint RLCR-QA evalua pares (pregunta, candidato, evidencia) y devuelve una creencia calibrada, lo que permite fijar umbrales de aceptacion con significado probabilistico real.
- Moderacion de contenido factual en plataformas: RLCR-Joint genera respuesta y confianza en una sola pasada, de modo que las afirmaciones con confianza baja se enrutan a revision humana.
- Deteccion de alucinaciones en asistentes RAG: RLCR-CRED meta-verifica cada cadena de recuperacion y permite descartar cadenas poco fiables antes de mostrar la respuesta final.
- Auditoria selectiva de pipelines: con la variante 32B se reduce la tasa de auditoria de las etapas 2-5 del 30,7% al 15,6%, abaratando el coste de revision en sistemas de alto volumen.
- Investigacion en calibracion: los datasets y artefactos de evaluacion permiten reproducir experimentos de Brier score y AUROC sobre HoVer, FactCHD, FutureX, RAGTruth y TruthfulQA.
- Filtrado de datasets de entrenamiento: el modelo puede puntuar pares de evidencia y afirmacion para eliminar ejemplos ruidosos antes de usarlos en el ajuste de otros modelos.
- Evaluacion de sistemas de recuperacion: comparando la creencia del modelo con la evidencia BM25 se detectan fallos de retrieval que producen respuestas incorrectas.

## Benchmarks y rendimiento

Resultados reportados por el autor en OOD IFQA (`eval.mix = 0.05`, bootstrap pareado de 10.000 muestras):

| Sistema | Tasa auditoria S2-S5 | AUROC divergente `p_rw` | AUROC `reccon` completo | Exactitud | Brier |
|---|---:|---:|---:|---:|---:|
| Native 3-Chain Mean (35B+20B S1) | 30,7% | 69,90 | 92,62 | 84,47% | 11,23 |
| All-Native ReCCon (35B/20B S1 + 35B S3 + 35B S5) | 30,7% | 79,08 | 93,72 | 86,13% | 10,38 |
| Only-Stage-5 RLCR-CRED-8B-opt | 30,7% | 78,70 | 93,44 | 85,58% | 10,46 |

Metricas por checkpoint:

| Checkpoint | Metrica destacada |
|---|---|
| RLCR-JOINT-8B-opt | IFQA single-chain acc 83,19%; 3-chain acc 85,47% |
| RLCR-QA-8B-opt | `v3-qa` held-out AUROC 79,38; IFQA contra `reccon` 93,04 (85,1% de hechos falsos con p < 0,5) |
| RLCR-CRED-8B-opt | IFQA only-S5 `p_rw` 78,70; chain AUROC 73,99; full-8B div `p_rw` 79,36 (p = 0,0053) |
| RLCR-JOINT-32B-opt | IFQA 3-chain mean AUROC 93,80; acc 86,96%; auditoria 30,7% -> 15,6% |
| RLCR-QA-32B-opt | `v3-qa` held-out acc 74,00%; IFQA 32B-Joint contra 92,21 -> 93,34 |
| RLCR-CRED-32B-opt | `v5-cred` held-out AUROC 67,85; full-32B IFQA AUROC 94,17; div 81,84 y Brier 9,81 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano, el 8B en fp16 requiere aproximadamente 16 GB y el 32B en fp16 unos 64 GB, cifras orientativas no publicadas por el autor.
- GPU recomendadas: A100 80GB o H100 para el 32B en fp16; RTX 4090 (24 GB) o A10G para el 8B en fp16.
- Cabe en GPU de consumo: el 8B en fp16 si cabe en RTX 4090; el 32B requiere cuantizacion para GPUs de 24 GB.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLCR-JOINT/QA/CRED-8B-opt | 8B | no disponible | Fact-checking calibrado (GRPO) | Apache 2.0 | Hugging Face |
| RLCR-JOINT/QA/CRED-32B-opt | 32B | no disponible | Fact-checking calibrado (GRPO) | Apache 2.0 | Hugging Face |
| Qwen3-8B (base) | 8B | no disponible | LLM generalista | Apache 2.0 | Hugging Face |
| Qwen3-32B (base) | 32B | no disponible | LLM generalista | Apache 2.0 | Hugging Face |

La comparacion con modelos especializados en deteccion de alucinaciones de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Modelo especializado: su salida esta constrenida a formatos estructurados (`<think><analysis><belief>`), por lo que no es un LLM generalista.
- Riesgo de alucinacion persistente: la calibracion reduce la confianza mal asignada, pero no elimina errores factuales.
- Los benchmarks reportados son del autor y se centran en OOD IFQA y conjuntos derivados de HoVer/FactCHD; la generalizacion a otros dominios no esta verificada.
- Dependencia de la calidad de la evidencia recuperada: si el retrieval BM25 falla, la calibracion puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantias ni soporte del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente de la comunidad.
- El modelo base Qwen3-32B requiere hardware de gama alta para inferencia en fp16.

## Enlaces

- Hugging Face: https://huggingface.co/Alexps9yyy/rlcr4reccon
- Codigo (entrenamiento, integracion y evaluacion): https://github.com/BENGAL-UCSB/BTProp/tree/rlcr4reccon
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
