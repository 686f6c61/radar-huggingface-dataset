# SKOPION-Intelligence/skopion-verdict-9b-v23.0-sovereign-zk-horizon

## Resumen

SKOPION Verdict 9B v23.0 SOVEREIGN-ZK-HORIZON es un modelo de clasificación de texto y evaluación de decisiones (LLM-as-a-judge / reward model) desarrollado por SKOPION Intelligence, un programa europeo de I+D centrado en IA soberana para cumplimiento normativo. El modelo se presenta como un juez determinista orientado a auditoría regulatoria, con etiquetado explícito de marcos como KRITIS, NATO STANAG, NIS2, DORA, CNSA 2.0 y EU AI Act. Forma parte de una familia que el autor describe con variantes de 4B, 9B y 27B.

La propuesta técnica combina un transformer de 9B parámetros con mecanismos poco habituales en modelos de clasificación: compromisos criptográficos Zero-Knowledge Proof-Carrying Verdict Commitments (ZK-PCVC) sobre el campo primo de Goldilocks, envolventes de seguridad basadas en Control Barrier Functions (CBF) y primitivas post-cuánticas CNSA 2.0 (ML-KEM-1024 y ML-DSA-87). El autor declara evaluación determinista a temperatura 0.0 sobre NVIDIA H100 80GB HBM3, con un consumo energético medido de 1,85 julios por decisión.

Es relevante ahora porque el sector busca mecanismos verificables de auditoría de decisiones automatizadas ante la entrada en vigor escalonada del EU AI Act, y porque el modelo se distribuye con logs de evaluación a nivel de ítem y compromisos criptográficos publicados, aunque los pesos entrenados permanecen propietarios. El modelo está etiquetado para inglés, alemán y polaco, con pipeline de text-classification.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atención no disponibles); incluye cabeza de decisión propietaria, ZK-PCVC sobre campo de Goldilocks y envolventes CBF |
| Parámetros totales | 9B |
| Parámetros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Edge-FP8, PQ2_0 (precisión nativa declarada en evaluación); no se detallan otros formatos |
| Idiomas soportados | Inglés (en), alemán (de), polaco (pl) |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | No disponible (pesos propietarios no publicados; el repositorio es de librería transformers) |

## Arquitectura y entrenamiento

El autor describe el modelo como un transformer de 9B parámetros en precisión BF16 con un tamaño de checkpoint declarado de 18,3 GB, al que se añaden componentes criptográficos y de seguridad: compromisos ZK-PCVC basados en el test de Freivalds sobre el campo primo de Goldilocks (p = 2^64 − 2^32 + 1), envolventes de seguridad de Control Barrier Function en tiempo continuo y primitivas post-cuánticas CNSA 2.0 (ML-KEM-1024 para encapsulado de clave y ML-DSA-87 para firma). El pipeline declarado es text-classification, con casos de uso de LLM-as-a-judge y reward model.

No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card indica que las evaluaciones empíricas se ejecutaron de forma determinista (temperature = 0.0, precisión bfloat16 / PQ2_0 nativa) sobre GPUs NVIDIA H100 80GB HBM3, y que los pesos del modelo y los parámetros de la cabeza de decisión permanecen propietarios; solo se liberan los logs de evaluación a nivel de ítem en formato .jsonl con digests SHA-256 y los compromisos ZK-PCVC. Esta opacidad de pesos impide reproducir el entrenamiento o auditar el modelo más allá de los artefactos declarados.

## Capacidades

- Clasificación de texto y emisión de veredictos de decisión (pipeline text-classification) orientados a evaluación automatizada.
- Función de LLM-as-a-judge: evaluación de respuestas o decisiones de otros sistemas con criterios de cumplimiento.
- Reward model: puntuación de salidas para pipelines de alineamiento o filtrado.
- Verificación formal y attestation criptográfica mediante ZK-PCVC (compromisos verificables de veredicto con test de Freivalds).
- Envolventes de seguridad CBF para delimitar decisiones dentro de umbrales operativos declarados.
- Cobertura de marcos regulatorios y de seguridad: KRITIS, NATO STANAG, NIS2, DORA, CNSA 2.0 y EU AI Act (según etiquetas del autor).
- Predicción conforme (conformal prediction) para abstención calibrada, según la descripción del programa en el portal del autor.
- Multilingüe limitado a inglés, alemán y polaco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Vision o audio: no disponible; el modelo es de texto.

## Casos de uso

- Auditoría de cumplimiento del EU AI Act: el modelo actuaría como juez determinista que clasifica decisiones de sistemas de IA frente a requisitos del reglamento, emitiendo veredictos acompañados de compromisos ZK-PCVC verificables por terceros.
- Evaluación de proveedores bajo NIS2 y DORA: clasificación de evidencias y respuestas de cuestionarios de seguridad de entidades financieras o infraestructuras críticas, con logs a nivel de ítem y digests SHA-256 para trazabilidad.
- Gate de seguridad en pipelines de despliegue: uso como reward model o clasificador de aceptación que bloquea salidas de otros LLM cuando no superan los umbrales definidos por las envolventes CBF.
- Verificación de conformidad NATO STANAG: clasificación de documentación y decisiones técnicas frente a estándares de la OTAN en entornos de defensa con requisitos CNSA 2.0.
- Abstención calibrada en atención al cliente regulada: el modelo puede rechazar decidir (conformal abstention) cuando la confianza no alcanza el umbral, derivando el caso a revisión humana, lo que encaja en flujos de banca y seguros bajo DORA.
- Evaluación comparativa de modelos (LLM-as-a-judge) en programas de I+D: puntuación de salidas de modelos candidatos en inglés, alemán y polaco con criterios reproducibles a temperatura 0.0.
- Registro de auditoría con attestation post-cuántica: generación de compromisos firmados con ML-DSA-87 y encapsulado ML-KEM-1024 para archivar veredictos de forma resistente a ataques cuánticos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Benchmark | Métrica | Resultado | Verificado |
|---|---|---|---|
| Strict-178 External Decision, ZK-PCVC & CBF Safety Benchmark Matrix (180 suites / 53.340 evaluaciones, 126 modelos) | Strict-178 External Mean Accuracy (%) | 99,59 | No |
| Empirical Wave-21..26 JSONL Suites (60 suites / 18.000 ítems con digests SHA-256) | Mean Accuracy (%) | 100,00 | No |

No se han publicado resultados de benchmarks estándar ampliamente reconocidos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor declara un consumo energético verificado de 1,85 julios por decisión sobre NVIDIA H100 80GB HBM3 / L40S.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,3 GB en BF16 según el tamaño de checkpoint declarado; en Edge-FP8 se reduciría previsiblemente a la mitad (no confirmado por el autor).
- GPU recomendadas por el autor: NVIDIA H100 80GB HBM3 y NVIDIA L40S (entorno de evaluación declarado).
- Cabe en GPU de consumo: en BF16, 18,3 GB excede los 16 GB de una RTX 4080/4090; sería viable en RTX 4090 de 24 GB o en GPUs con 24 GB o más, siempre que se confirme el soporte de Edge-FP8 o cuantización adicional (no disponible).
- Opciones de despliegue: librería transformers; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible, y la naturaleza propietaria de los pesos limita el despliegue local.
- Latencia y throughput: no disponibles; solo se declara el consumo energético de 1,85 J por decisión en H100/L40S.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| SKOPION Verdict 9B v23.0 SOVEREIGN-ZK-HORIZON | 9B | No disponible | Juez de cumplimiento con ZK-PCVC y CBF | skopion-sovereign-kritis-audit-license-v1.0 | Propietarios (solo logs y compromisos) |
| SKOPION Verdict 4B (familia del autor) | 4B | No disponible | Decisión y compliance judge | Apache-2.0 según portal del autor | No confirmado en la información disponible |
| SKOPION Verdict 27B (familia del autor) | 27B | No disponible | Decisión y compliance judge | Apache-2.0 según portal del autor | No confirmado en la información disponible |
| Modelos jueces open source de propósito general (p. ej. familias reward/judge de 7-9B) | ~7-9B | Variable | Reward model / LLM-as-a-judge | Apache-2.0 o MIT habitual | Pesos abiertos |

La comparación con alternativas externas no puede completarse con datos concretos porque la información proporcionada no incluye resultados de benchmarks de modelos competidores en las mismas suites. El propio autor sitúa este modelo como "#2 Global" y "#1 Single-Model Overall" en su matriz de 126 modelos, pero esa clasificación procede de su benchmark propietario y no está verificada de forma independiente.

## Limitaciones y advertencias

- Pesos propietarios: la model card indica que los pesos entrenados y la cabeza de decisión no se publican, por lo que no es posible reproducir, auditar ni desplegar el modelo de forma independiente; solo se liberan logs y compromisos criptográficos.
- Benchmarks no verificados: las cifras de 99,59 % y 100,00 % proceden de suites propietarias del autor (Strict-178 y Wave-21..26) y no han sido validadas por terceros; el campo "verified" es false en la model-index.
- Riesgo de sobreajuste al benchmark: un 100,00 % en las suites empíricas Wave-21..26 es una señal que exige cautela sobre la generalización a dominios no cubiertos.
- Idiomas limitados: solo inglés, alemán y polaco; no hay soporte declarado de castellano ni de otros idiomas.
- Licencia restrictiva: la skopion-sovereign-kritis-audit-license-v1.0 es una licencia "other" con condiciones específicas de auditoría KRITIS; debe revisarse antes de cualquier uso comercial o de producción.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en documentos regulatorios largos.
- Riesgo de alucinación: al ser un modelo de clasificación y veredicto, los errores se traducen en falsos positivos o negativos de cumplimiento, con consecuencias legales potenciales; se recomienda validación humana en decisiones de alto impacto.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o robustez frente a entradas adversarias.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son de noviembre de 2026, lo que sugiere un lanzamiento muy reciente sin adopción comunitaria verificable.
- Dependencia de un único proveedor: los mecanismos ZK-PCVC, CBF y CNSA 2.0 están definidos por el autor y no se apoyan en estándares de verificación ampliamente adoptados fuera de su programa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v23.0-sovereign-zk-horizon
- Portal del programa (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal del programa (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal del programa (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- DOI del registro Zenodo: https://doi.org/10.5281/zenodo.24052954
- DOI conceptual Zenodo: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Organización GitHub: https://github.com/SKOPION-Intelligence/
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
