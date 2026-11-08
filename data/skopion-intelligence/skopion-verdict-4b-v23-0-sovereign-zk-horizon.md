# SKOPION-Intelligence/skopion-verdict-4b-v23.0-sovereign-zk-horizon

## Resumen

SKOPION Verdict 4B v23.0 SOVEREIGN-ZK-HORIZON es un modelo de clasificación de texto de 4.000 millones de parámetros desarrollado por SKOPION Intelligence, presentado como un "decision model" o "LLM-as-a-judge" orientado a entornos de cumplimiento normativo y auditoría soberana. El modelo se posiciona no como un generador de texto generalista, sino como un clasificador/verificador de decisiones con atestación criptográfica, y se distribuye bajo una licencia propia denominada `skopion-sovereign-kritis-audit-license-v1.0`.

La propuesta técnica del autor combina tres elementos poco habituales en modelos de este tamaño: compromisos de veredicto con pruebas de conocimiento cero sobre el campo primo Goldilocks (ZK-PCVC, mediante protocolo de Freivalds), envolventes de seguridad basadas en funciones de barrera de control (CBF) en tiempo continuo, y primitivas de criptografía post-cuántica CNSA 2.0 (ML-KEM-1024 y ML-DSA-87). El modelo declara estar alineado con marcos regulatorios como KRITIS, NIS2, DORA, NATO STANAG y el EU AI Act.

Es relevante ahora por su encaje en el nicho de "IA soberana" europea para auditoría y cumplimiento, aunque conviene señalar que los pesos entrenados y los parámetros de la cabeza de decisión no se publican: solo se liberan los registros de evaluación a nivel de ítem y los compromisos ZK. El modelo se publica en BF16 con un tamaño de 8,04 GB y soporta inglés, alemán y polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de clasificación de texto; detalles de capas y atención no publicados) |
| Parametros totales | 4B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; precisión nativa PQ2_0 mencionada en la metodología de evaluación; no se listan cuantizaciones GGUF/AWQ/GPTQ |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | no disponible (pesos propietarios no liberados; el modelo se distribuye vía transformers) |

## Arquitectura y entrenamiento

El autor no publica detalles de la arquitectura interna (número de capas, tipo de atención, tokenizador o composición del corpus de entrenamiento). Lo que sí se declara es que se trata de un modelo de 4B parámetros en precisión BF16 (8,04 GB) orientado a clasificación de texto y veredictos de decisión, con una "cabeza de decisión" cuyos parámetros permanecen propietarios. La model card menciona una precisión nativa denominada `PQ2_0`, sin más especificación técnica.

La innovación declarada no está en el preentrenamiento sino en el pipeline de verificación: compromisos criptográficos ZK-PCVC sobre el campo primo Goldilocks (p = 2^64 − 2^32 + 1) usando el protocolo de Freivalds, con 0/64 discrepancias de residuo algebraico reportadas; envolventes de seguridad CBF en tiempo continuo; y firmas/esquemas post-cuánticos CNSA 2.0. No se documenta el uso de RLHF, DPO ni datos de entrenamiento concretos. Las evaluaciones se realizaron de forma determinista (temperature = 0.0, bfloat16) sobre GPU NVIDIA H100 80GB HBM3.

## Capacidades

- Clasificación de texto y emisión de veredictos de decisión (pipeline `text-classification`), orientada a tareas de auditoría y evaluación tipo LLM-as-a-judge.
- Evaluación de cumplimiento normativo en dominios regulados: KRITIS, NIS2, DORA, NATO STANAG, CNSA 2.0 y EU AI Act, según los tags del modelo.
- Atestación criptográfica de veredictos mediante ZK-PCVC (pruebas de conocimiento cero sobre Goldilocks) y compromisos verificables.
- Aplicación de envolventes de seguridad CBF para acotar decisiones fuera de rango.
- Predicción conforme (conformal prediction) y abstención calibrada, según la descripción del programa de I+D del autor.
- Soporte multilingüe limitado a inglés, alemán y polaco.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Auditoría de cumplimiento NIS2/DORA: el modelo actuaría como clasificador de evidencias y decisiones, emitiendo un veredicto por ítem con compromiso ZK verificable, lo que permite a un auditor externo comprobar que la decisión no se alteró a posteriori.
- Evaluación automática de respuestas de otros LLM (LLM-as-a-judge): su pipeline de clasificación y su orientación a veredictos lo hacen apto para puntuar salidas de modelos en pipelines de evaluación interna, con registro determinista (temperature = 0.0).
- Triaje de incidentes en infraestructuras críticas (KRITIS): clasificación de eventos y decisiones de escalado con envolventes CBF que limitan decisiones fuera de umbral, adecuado para entornos con requisitos de trazabilidad.
- Verificación de políticas en flujos con requisitos NATO STANAG: clasificación de documentos y decisiones conforme a estándares de la OTAN, con firmas post-cuánticas ML-DSA-87 para integridad.
- Moderación y filtrado con abstención calibrada: gracias a la predicción conforme declarada, el modelo puede abstenerse cuando la confianza es baja, lo que reduce falsos positivos en flujos de producción regulados.
- Cumplimiento del EU AI Act en sistemas de alto riesgo: registro de decisiones con evidencia criptográfica y logs a nivel de ítem con digests SHA-256, útil para demostrar trazabilidad ante autoridades de supervisión.
- Procesamiento multilingüe DE/PL/EN en el ámbito DACH y Polonia: clasificación de documentación regulatoria en los tres idiomas soportados, alineado con los portales del autor en alemán y polaco.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente; `verified: false` en el model-index):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Strict-178 External Decision, ZK-PCVC & CBF Safety Benchmark Matrix (180 suites / 53.340 evaluaciones, 126 modelos) | Strict-178 External Mean Accuracy (%) | 98,91 |
| Empirical Wave-21..26 JSONL Suites (60 suites / 18.000 ítems con digests SHA-256) | Mean Accuracy (%) | 98,33 |

El autor declara además un consumo energético verificado de 0,82 julios por decisión sobre NVIDIA H100 80GB HBM3 / estación de trabajo RTX, y una puntuación del 100,00% en Wave-21..23, Wave-25 y Wave-26 (posición #5 global declarada). No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,04 GB de pesos, más overhead de activaciones y contexto; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para BF16.
- GPU recomendadas por el autor para evaluación: NVIDIA H100 80GB HBM3 y estaciones de trabajo RTX.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas con 16 GB o más (RTX 4080/4090, RTX 3090); en tarjetas de 8-12 GB requeriría cuantización, que no se documenta oficialmente.
- Opciones de despliegue: al ser un modelo `transformers`, es compatible con el stack Hugging Face (pipeline de `text-classification`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ni se publican pesos en GGUF.
- Latencia y throughput: no disponibles; solo se declara el consumo energético de 0,82 J por decisión en H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos | Enfoque |
|---|---|---|---|---|---|
| SKOPION Verdict 4B v23.0 | 4B | no disponible | skopion-sovereign-kritis-audit-license-v1.0 | No liberados (solo logs y ZK) | Clasificación/veredicto con atestación ZK y CBF |
| SKOPION Verdict 4B v22.0 Absolute Horizon | 4B | no disponible | no disponible | no disponible | Versión previa del mismo programa |
| Modelos de la familia SKOPION Verdict (4B/9B/27B) | 4B / 9B / 27B | no disponible | Apache-2.0 (según portal del autor) | no disponible | Modelos de decisión calibrados con abstención conforme |

No se dispone de datos de benchmarks estándar ni de alternativas de código abierto directamente comparables en la información proporcionada; la comparación con modelos generalistas de 4B (por ejemplo, variantes tipo Llama o Qwen) no es posible con rigor porque el modelo no publica pesos ni resultados en MMLU/HumanEval/GSM8K.

## Limitaciones y advertencias

- Pesos propietarios: los pesos entrenados y los parámetros de la cabeza de decisión no se liberan, lo que impide reproducir los resultados de forma independiente; solo se publican logs y compromisos ZK.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden de un benchmark propio del autor (SKOPION-Verdict-Bench), no de suites estándar de la industria.
- Licencia restrictiva y no estándar (`skopion-sovereign-kritis-audit-license-v1.0`): debe revisarse el enlace de licencia antes de cualquier uso comercial; no es una licencia de código abierto reconocida.
- Cobertura lingüística limitada a inglés, alemán y polaco; no se declara soporte de otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en documentos largos.
- Sin datos sobre sesgos, tasas de alucinación o robustez fuera de distribución; al ser un clasificador, el riesgo principal es la clasificación errónea silenciosa más que la alucinación generativa.
- Las afirmaciones de criptografía post-cuántica (ML-KEM-1024, ML-DSA-87) y de pruebas ZK no han sido auditadas de forma independiente según la información disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que lo requieran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v23.0-sovereign-zk-horizon
- Versión previa v22.0 Absolute Horizon: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v22.0-absolute-horizon
- Portal del programa (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal del programa (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal del programa (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- DOI Zenodo: https://doi.org/10.5281/zenodo.24052954
- Concept DOI Zenodo: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
