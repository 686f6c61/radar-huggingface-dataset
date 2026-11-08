# SKOPION-Intelligence/skopion-verdict-9b-v22.0-absolute-horizon

## Resumen

SKOPION Verdict 9B v22.0 ABSOLUTE-HORIZON es un modelo de clasificación de texto de 9.000 millones de parámetros desarrollado por SKOPION Intelligence (Bartosz Joachimiak) dentro de su programa de investigación en IA para seguridad defensiva y cumplimiento normativo europeo. El modelo se presenta como un "decision model" y "reward model" orientado a tareas de verificación formal, auditoría regulatoria (KRITIS, NIS2, DORA, EU AI Act) y evaluación de evidencias, no como un generador de texto libre.

La versión v22.0 integra, según el autor, capacidades de síntesis formal en TLA+, Coq y Lean 4, pruebas criptográficas zkML (EZKL Halo2 y RISC Zero zkVM) y criptografía post-cuántica conforme a FIPS 203/204/205. Se distribuye en BF16 y Edge-FP8, con un peso declarado de 18,3 GB, y está pensado para despliegues en hardware NVIDIA H100 y L40S.

El modelo es relevante en el contexto actual de regulación europea de IA y ciberseguridad, donde la trazabilidad criptográfica de las decisiones automatizadas y el cumplimiento de estándares como NIS2 o DORA son requisitos crecientes. No obstante, la práctica totalidad de las métricas y capacidades declaradas proceden exclusivamente de la model card del autor y no están verificadas de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no detalla la arquitectura interna; se distribuye como modelo transformers de clasificación de texto) |
| Parámetros totales | 9B |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Edge-FP8 |
| Idiomas soportados | inglés (en), alemán (de), polaco (pl) |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, "other") |
| Formato de pesos | safetensors (formato estándar de transformers; no se listan GGUF ni otros) |

## Arquitectura y entrenamiento

La información pública no especifica la arquitectura interna del modelo (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención ni si emplea técnicas híbridas). El autor lo describe como un modelo de decisión tipado ("typed decision and evidence model") que estructura hallazgos de seguridad defensiva y vincula los juicios a secciones visuales y textuales explícitas, en contraposición a los generadores de texto libre sin restricciones.

En cuanto al entrenamiento, la model card menciona BF16 como precisión base, una etapa denominada FP-GRPO (variante de optimización de política con gradientes, presumiblemente sobre preferencias), integración de zkML y criptografía post-cuántica FIPS 203/204/205. También declara un mecanismo de control de riesgo conformal split-conformal con alpha = 0.000001 ("six-nines") y atestación criptográfica PCVC-v22-zkSTARK basada en DEEP-FRI de 128 bits y ML-KEM-1024 / ML-DSA-87 / SLH-DSA. No se publican el número de tokens de entrenamiento, la composición del dataset ni detalles sobre el proceso de alineamiento más allá de la mención a FP-GRPO.

## Capacidades

- Clasificación de texto y emisión de decisiones tipadas con evidencia asociada (pipeline declarado: text-classification).
- Verificación formal y síntesis de pruebas en TLA+, Coq y Lean 4 (declarado como Wave-21).
- Pruebas criptográficas zero-knowledge para ML: EZKL Halo2 y RISC Zero zkVM (Wave-22).
- Criptografía post-cuántica conforme a FIPS 203 (ML-KEM), FIPS 204 (ML-DSA) y FIPS 205 (SLH-DSA) (Wave-23).
- Evaluación como juez (LLM-as-a-judge) y modelo de recompensa (reward model).
- Mapeo de cumplimiento normativo: KRITIS, NATO STANAG, NIS2, DORA y EU AI Act.
- Control de riesgo conformal con atestación criptográfica de las decisiones.
- Capacidades multilingües limitadas a inglés, alemán y polaco.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Auditoría de cumplimiento NIS2 y DORA: el modelo clasificaría hallazgos de seguridad y los vincularía a los artículos y controles correspondientes, produciendo una decisión tipada con evidencia trazable en lugar de texto libre.
- Verificación formal de especificaciones críticas: uso declarado para sintetizar y comprobar pruebas en TLA+, Coq y Lean 4 en entornos donde la corrección formal es requisito (sistemas distribuidos, protocolos criptográficos).
- Atestación criptográfica de decisiones automatizadas: la integración zkML (EZKL, RISC Zero) y la atestación zkSTARK permitirían demostrar que una decisión se tomó conforme al modelo sin revelar los datos de entrada, útil en auditorías regulatorias.
- Evaluación de sistemas de IA como juez o reward model: puntuación y clasificación de salidas de otros modelos en pipelines de evaluación interna, con control de riesgo conformal para acotar la tasa de error.
- Clasificación de evidencias en ciberseguridad defensiva: estructuración de informes de pentest, alertas SOC o hallazgos de vulnerabilidades en categorías normalizadas (STANAG, KRITIS).
- Preparación de expedientes de conformidad con el EU AI Act: clasificación de sistemas y riesgos con registro criptográfico de la decisión, orientado a documentación regulatoria.
- Migración a criptografía post-cuántica: apoyo en la evaluación del cumplimiento FIPS 203/204/205 en inventarios criptográficos de infraestructuras críticas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Strict-148 External Decision, Formal Proving, zkML & PQC Benchmark Matrix (150 suites / 44.340 evaluaciones) | Exactitud media (%) | 99,44 |
| Wave-21 TLA+/Coq/Lean-4, Wave-22 EZKL/RISC Zero zkML y Wave-23 FIPS 203/204 PQC (%) | Exactitud (%) | 100,00 |

Adicionalmente, la model card declara un control de riesgo conformal del 99,9999 % (alpha = 0,000001) y un consumo energético verificado de 1,94 julios por decisión sobre NVIDIA H100 y L40S. No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,3 GB en BF16 según el peso declarado por el autor; en Edge-FP8 se reduciría a la mitad (en torno a 9-10 GB), aunque el autor no publica la cifra exacta.
- GPU recomendadas: NVIDIA H100 y L40S según la model card (donde se midió el consumo de 1,94 J/decisión).
- GPU de consumo: con ~18 GB en BF16 no cabe en GPUs de 8-12 GB; en FP8 podría encajar en tarjetas de 16 GB o más (RTX 4080/4090, según disponibilidad real de pesos FP8, no confirmada).
- Opciones de despliegue: transformers (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles; solo se declara el consumo energético por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SKOPION Verdict 9B v22.0 | 9B | no disponible | Propia (skopion-sovereign-kritis-audit-license-v1.0) | Decisión tipada, verificación formal, cumplimiento EU |
| SKOPION Verdict 9B v15.0 native | 9B | no disponible | Propia (misma familia) | Versión anterior del mismo programa |
| Modelos de clasificación/juez de propósito general | no disponible | no disponible | Variables | Clasificación y evaluación sin atestación criptográfica |

No se dispone de comparativas públicas con modelos de terceros de la misma categoría (jueces, reward models o clasificadores de cumplimiento) en la información proporcionada; las alternativas más directas identificadas pertenecen a la propia familia SKOPION Verdict.

## Limitaciones y advertencias

- Todas las métricas (99,44 % y 100 %) y capacidades declaradas proceden exclusivamente del autor y figuran como no verificadas; no hay evaluación independiente publicada.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que impide contrastar su comportamiento en uso real.
- La licencia es propia ("skopion-sovereign-kritis-audit-license-v1.0") y no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o en producción.
- Idiomas limitados a inglés, alemán y polaco; no se declara soporte de castellano.
- No se publican detalles de arquitectura, contexto, dataset de entrenamiento ni proceso de alineamiento, lo que dificulta la reproducibilidad.
- Riesgo de alucinación y de falsos positivos en clasificación regulatoria: las decisiones con implicaciones de cumplimiento deben validarse por revisión humana.
- Las afirmaciones sobre verificación formal, zkML y PQC no están respaldadas por artefactos públicos verificables en la información disponible (solo referencias a DOI de Zenodo y repositorios del autor).
- No se confirma compatibilidad con runtimes de inferencia habituales (vLLM, llama.cpp, Ollama) ni existencia de cuantizaciones GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v22.0-absolute-horizon
- Versión anterior (v15.0 native): https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v15.0-native
- Portal del programa (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal del programa (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal del programa (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- DOI Zenodo: https://doi.org/10.5281/zenodo.24009481
- DOI conceptual Zenodo: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Adaptador JevBench / Decision Index 0.4: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
