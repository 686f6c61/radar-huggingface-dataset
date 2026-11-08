# SKOPION-Intelligence/skopion-verdict-committee-v23.0-sovereign-zk-horizon

## Resumen

SKOPION Verdict Committee v23.0 SOVEREIGN-ZK-HORIZON es un sistema de clasificación de texto y evaluación de decisiones desarrollado por SKOPION-Intelligence, presentado como un "System 1.5 BFT-Cascade" que combina tres modelos de distintos tamaños (4B, 9B y 27B parámetros) en una arquitectura en cascada tolerante a fallos bizantinos. El modelo se posiciona como un juez automatizado (LLM-as-a-judge) y reward model orientado a auditoría regulatoria, verificación formal y toma de decisiones en entornos críticos, con etiquetado explícito para marcos como KRITIS, NATO STANAG, NIS2, DORA, CNSA 2.0 y el EU AI Act.

La propuesta técnica más distintiva es la integración de compromisos criptográficos Zero-Knowledge Proof-Carrying Verdict Commitments (ZK-PCVC) sobre el campo primo Goldilocks, junto con envolventes de seguridad basadas en Control Barrier Functions (CBF) y criptografía post-cuántica CNSA 2.0 (ML-KEM-1024 y ML-DSA-87). El autor declara que los pesos y las cabezas de decisión permanecen propietarios, mientras que se publican los registros de evaluación a nivel de ítem con digests SHA-256 y los compromisos ZK para verificación independiente.

El modelo declara un rendimiento del 99,60 % de precisión media en la matriz Strict-178 (180 suites, 53.340 evaluaciones sobre 126 modelos) y del 100,00 % en las suites empíricas Wave-21..26 (60 suites, 18.000 ítems). Estos resultados proceden exclusivamente del model-index publicado por el autor y no han sido verificados de forma independiente. El modelo no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema en cascada "System 1.5 BFT-Cascade" con tres componentes (4B + 9B + 27B); arquitectura base de los componentes no disponible |
| Parámetros totales | 4B + 9B + 27B (sistema en cascada); parámetros individuales por componente no disponibles |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 y "PQ2_0" (precisión nativa declarada por el autor); no se detallan otros formatos |
| Idiomas soportados | Inglés (en), alemán (de), polaco (pl) |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, marcada como "other") |
| Formato de pesos | No disponible (los pesos se declaran propietarios y no se publican) |

## Arquitectura y entrenamiento

El sistema se describe como una cascada de tres modelos de 4B, 9B y 27B parámetros con tolerancia a fallos bizantinos (BFT), diseñada para producir veredictos de decisión verificables. Sobre esa base se añaden tres capas técnicas: compromisos ZK-PCVC basados en el test de Freivalds sobre el campo primo Goldilocks (p = 2^64 − 2^32 + 1), que permiten atestiguar algebraicamente el resultado de la decisión (el autor declara 0/64 discrepancias de residuo algebraico); envolventes de seguridad mediante Control Barrier Functions (CBF) en tiempo continuo; y primitivas de criptografía post-cuántica CNSA 2.0 (ML-KEM-1024 para encapsulado de claves y ML-DSA-87 para firma digital).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la arquitectura interna de cada componente de la cascada (transformer denso, MoE u otra). La evaluación se declara determinista con temperatura 0.0 y precisión nativa bfloat16 / PQ2_0 sobre GPUs NVIDIA H100 80GB HBM3, con un consumo energético verificado de 8,2 julios por decisión. Los pesos y los parámetros de las cabezas de decisión son propietarios; solo se publican los registros de evaluación y los compromisos criptográficos.

## Capacidades

- Clasificación de texto y emisión de veredictos de decisión en dominios regulados (KRITIS, NIS2, DORA, EU AI Act, NATO STANAG).
- Evaluación automatizada tipo LLM-as-a-judge y reward model para pipelines de verificación.
- Atestación criptográfica de decisiones mediante ZK-PCVC (pruebas de conocimiento cero con compromisos verificables).
- Aplicación de envolventes de seguridad CBF para restringir decisiones fuera de umbrales admisibles.
- Verificación formal y trazabilidad: registros de evaluación a nivel de ítem con digests SHA-256.
- Criptografía post-cuántica integrada (ML-KEM-1024, ML-DSA-87) conforme a CNSA 2.0.
- Predicción conforme (conformal prediction) para intervalos de confianza en las decisiones, según las etiquetas declaradas.
- Soporte multilingüe limitado a inglés, alemán y polaco.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Auditoría de cumplimiento regulatorio: el sistema puede clasificar y emitir veredictos sobre evidencias de cumplimiento NIS2, DORA o EU AI Act, con registros SHA-256 que permiten reconstruir y verificar cada decisión ante un auditor externo.
- Evaluación automatizada de modelos (LLM-as-a-judge): se usaría como juez en pipelines de evaluación interna, aprovechando la cascada 4B/9B/27B para escalar el coste según la criticidad de la muestra y la atestación ZK-PCVC para certificar el veredicto.
- Toma de decisiones en infraestructuras críticas (KRITIS): las envolventes CBF permiten acotar las decisiones dentro de márgenes de seguridad definidos, lo que encaja en sistemas de supervisión donde una decisión fuera de umbral debe bloquearse.
- Verificación de integridad en entornos post-cuánticos: el uso de ML-KEM-1024 y ML-DSA-87 permite desplegar el sistema en arquitecturas que exigen migración a criptografía resistente a computación cuántica conforme a CNSA 2.0.
- Moderación y clasificación de contenido sensible en alemán y polaco: el soporte nativo de estos idiomas junto con el inglés lo hace adecuado para clasificación regulatoria en mercados centroeuropeos.
- Trazabilidad de decisiones en auditoría interna: los registros JSONL con digests y los compromisos ZK permiten reconstruir la cadena de decisión sin exponer los pesos propietarios, útil en entornos con requisitos de confidencialidad.
- Evaluación de riesgo en procesos con requisitos de predicción conforme: los intervalos de conformidad permiten cuantificar la incertidumbre de cada veredicto antes de automatizar una acción.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| Strict-178 External Decision, ZK-PCVC & CBF Safety Benchmark Matrix (180 suites / 53.340 evaluaciones) | Precisión media (%) | 99,6 | No |
| Empirical Wave-21..26 JSONL Suites (60 suites / 18.000 ítems) | Precisión media (%) | 100,0 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El sistema completo en cascada (4B + 9B + 27B) ocupa 60,4 GB según el autor, lo que implica al menos una GPU con 80 GB de VRAM para ejecución en BF16.
- GPU de referencia declarada: NVIDIA H100 80GB HBM3, con un consumo medido de 8,2 julios por decisión.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en su configuración completa; los componentes individuales de 4B y 9B podrían ejecutarse por separado en GPUs de 24 GB, pero no se documenta esa configuración.
- Opciones de despliegue: no se especifican en la información disponible (no se confirman vLLM, llama.cpp, Ollama ni TGI). El pipeline declarado es text-classification sobre la librería transformers.
- Latencia y throughput: no disponibles, salvo el dato de energía por decisión (8,2 J) sobre H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Enfoque |
|---|---|---|---|---|---|
| SKOPION Verdict Committee v23.0 SOVEREIGN-ZK-HORIZON | 4B + 9B + 27B (cascada) | No disponible | skopion-sovereign-kritis-audit-license-v1.0 | Propietarios (solo registros de evaluación) | Juez/veredicto con ZK-PCVC, CBF y PQC |
| SKOPION Verdict 27B v22.0 Absolute Horizon | 27B | No disponible | skopion-sovereign-kritis-audit-license-v1.0 | No disponible en la búsqueda | Verificación formal (TLA+, Coq, Lean4) y ZKML |
| SKOPION Verdict Committee v15.0 Native | No disponible | No disponible | skopion-sovereign-kritis-audit-license-v1.0 | No disponible en la búsqueda | Versión anterior de la cascada, con edge-AI |

No se dispone de información sobre modelos de terceros comparables (mismo tamaño o misma tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks (99,6 % y 100,0 %) proceden únicamente del autor y están marcados como no verificados; no hay evaluación independiente publicada.
- Los pesos del modelo y las cabezas de decisión son propietarios: no es posible reproducir la inferencia ni auditar el modelo más allá de los registros publicados.
- El sistema completo requiere 60,4 GB y una GPU de 80 GB; no es viable en hardware de consumo.
- Cobertura lingüística limitada a inglés, alemán y polaco; no se documenta rendimiento en otras lenguas.
- No se especifican la longitud de contexto, los datos de entrenamiento ni el proceso de alineación, lo que impide evaluar sesgos conocidos o riesgo de alucinación de forma fundamentada.
- La licencia skopion-sovereign-kritis-audit-license-v1.0 es propia y marcada como "other": deben revisarse sus términos antes de cualquier uso comercial o en producción.
- El modelo no registra descargas ni interacciones en Hugging Face en el momento de la consulta, lo que limita la evidencia de uso real por terceros.
- Las afirmaciones sobre atestación ZK, CBF y PQC no han sido contrastadas por revisión independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v23.0-sovereign-zk-horizon
- DOI del registro: https://doi.org/10.5281/zenodo.24052954
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Modelo relacionado (v22.0): https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v22.0-absolute-horizon
- Modelo relacionado (v15.0): https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v15.0-native
