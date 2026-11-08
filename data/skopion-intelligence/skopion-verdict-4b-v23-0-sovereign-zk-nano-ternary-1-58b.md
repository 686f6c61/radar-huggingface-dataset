# SKOPION-Intelligence/skopion-verdict-4b-v23.0-sovereign-zk-nano-ternary-1.58b

## Resumen

SKOPION Verdict 4B v23.0 SOVEREIGN-ZK-HORIZON Nano-Ternary 1.58b es un modelo de clasificación de texto (pipeline `text-classification`) desarrollado por SKOPION-Intelligence, una iniciativa europea centrada en modelos de decisión deterministas, de recompensa y de evaluación de cumplimiento normativo. El modelo forma parte de la familia SKOPION Verdict, que incluye variantes de 4B, 9B y 27B, y está diseñado específicamente como "LLM-as-a-judge" para entornos regulados (KRITIS, NIS2, DORA, EU AI Act, NATO STANAG, CNSA 2.0).

La propuesta técnica más singular es su cuantización ternaria nativa de 1.58 bits (pesos en {-1, 0, +1}), que reduce el artefacto a 1,12 GB pese a declarar 4B parámetros. El autor acompaña la inferencia con mecanismos criptográficos de atestación: compromisos Zero-Knowledge sobre el campo primo Goldilocks (ZK-PCVC con verificación de Freivalds) y envolventes de seguridad basadas en Control Barrier Functions (CBF), orientados a auditoría formal de las decisiones.

El modelo se posiciona para casos de uso de evaluación automatizada de políticas, moderación y veredictos de cumplimiento donde se exige trazabilidad criptográfica y bajo consumo energético (0,62 J por decisión declarados en hardware edge como Jetson Orin NX). Los pesos entrenados y los parámetros de la cabeza de decisión permanecen propietarios; solo se publican registros de evaluación y compromisos ZK. Soporta inglés, alemán y polaco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con cuantización ternaria nativa (1.58-bit, pesos en {-1, 0, +1}); detalles de capas y atención no disponibles |
| Parámetros totales | 4B (declarados) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria nativa 1.58-bit; precisión de evaluación `bfloat16` / `PQ2_0` |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propietaria "other") |
| Formato de pesos | No disponible (pesos propietarios; el artefacto declarado ocupa 1,12 GB) |

## Arquitectura y entrenamiento

La información pública describe un transformer con cuantización ternaria de 1,58 bits, lo que implica pesos restringidos al conjunto {-1, 0, +1} y un factor de escala por grupo (esquema típico de las aproximaciones ternarias tipo BitNet). El autor menciona además componentes de "Goldilocks ZK-PCVC" y "Photonic MZI" integrados en el pipeline de atestación, aunque no se detalla si forman parte del grafo de cómputo del modelo o son capas de verificación externas. No se especifican número de capas, dimensión oculta, mecanismo de atención ni tokenizador.

Respecto al entrenamiento, no se publican el volumen de tokens, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card indica que las evaluaciones se ejecutaron de forma determinista (temperatura 0,0) sobre GPUs NVIDIA H100 80GB HBM3, y que los pesos y la cabeza de decisión son propietarios. La innovación declarada se centra en la atestación criptográfica de las decisiones (compromisos ZK sobre el campo primo Goldilocks con verificación de Freivalds, 0/64 discrepancias algebraicas reportadas) y en envolventes de seguridad CBF, más que en detalles de preentrenamiento.

## Capacidades

- Clasificación de texto y emisión de veredictos de decisión (pipeline `text-classification`), orientada a evaluación tipo "LLM-as-a-judge".
- Modelo de recompensa y evaluación de cumplimiento normativo (KRITIS, NIS2, DORA, EU AI Act, NATO STANAG, CNSA 2.0).
- Atestación criptográfica de decisiones mediante ZK-PCVC (compromisos Zero-Knowledge verificables con Freivalds sobre campo Goldilocks).
- Envolventes de seguridad mediante Control Barrier Functions (CBF) para acotar decisiones fuera de rango.
- Predicción conformal (tag `conformal-prediction`), orientada a intervalos de confianza calibrados.
- Criptografía post-cuántica declarada (ML-KEM-1024 / ML-DSA-87, CNSA 2.0).
- Multilingüe en inglés, alemán y polaco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo "thinking", visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de cumplimiento NIS2/DORA: el modelo puede clasificar evidencias y emitir veredictos de conformidad con atestación ZK verificable, lo que permite a un auditor externo comprobar que la decisión no fue alterada a posteriori.
- Evaluación automática de respuestas de otros LLM (LLM-as-a-judge): actúa como juez determinista (temperatura 0,0) en pipelines de evaluación interna, con registros `.jsonl` firmados con SHA-256 para trazabilidad.
- Moderación y filtrado en entornos KRITIS: clasificación de contenido y decisiones de bloqueo en infraestructuras críticas, con envolventes CBF que limitan decisiones fuera de umbrales de seguridad.
- Modelo de recompensa en RLHF/DPO: puntuación de pares de respuestas para ajuste por preferencias en pipelines propios, dado su rol declarado como reward model.
- Despliegue en edge con restricciones energéticas: con 1,12 GB y 0,62 J por decisión declarados en Jetson Orin NX / HP ZGX Nano AI, es apto para gateways industriales o IPC con presupuesto térmico y eléctrico limitado.
- Verificación post-cuántica de registros: uso de ML-KEM-1024 / ML-DSA-87 para firmar y verificar decisiones en flujos que deben resistir ataques de computación cuántica.
- Procesamiento multilingüe DE/PL/EN en administraciones públicas europeas: clasificación de documentación regulatoria en los tres idiomas soportados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, campo `verified: false` en el model-index):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Strict-178 External Decision, ZK-PCVC & CBF Safety Benchmark Matrix (180 suites / 53.340 evaluaciones) | Strict-178 External Mean Accuracy (%) | 98,64 |
| Empirical Wave-21..26 JSONL Suites (60 suites / 18.000 ítems con digests SHA-256) | Mean Accuracy (%) | 97,00 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores corresponden a suites propias del autor y no son comparables directamente con benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto declarado ocupa 1,12 GB en precisión ternaria nativa; con overhead de runtime, cabría esperar un consumo en el rango de 2-4 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: el autor reporta evaluaciones en NVIDIA H100 80GB HBM3; despliegue en edge en HP ZGX Nano AI / Jetson Orin NX / IPC industrial.
- Compatibilidad con GPU de consumo: por tamaño (1,12 GB de pesos), es plausible en GPUs consumer con suficiente soporte de kernels ternarios, pero no se confirma en la información disponible.
- Opciones de despliegue: librería `transformers` según la model card; compatibilidad con `endpoints_compatible` (Inference Endpoints). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. El autor declara 0,62 J por decisión en hardware edge, pero no publica latencias ni tokens/s.

## Comparativa con modelos similares

No se dispone de datos públicos suficientes para una comparativa cuantitativa rigurosa con alternativas de la misma categoría (jueces LLM, modelos de recompensa o clasificadores de cumplimiento). La familia SKOPION Verdict incluye variantes de 4B, 9B, 27B y un "System 1.5 Speculative Cascade Committee", pero no se han publicado sus especificaciones detalladas en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SKOPION Verdict 4B v23.0 (este modelo) | 4B (ternario 1.58-bit) | No disponible | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Pesos propietarios; benchmarks y ZK públicos |
| SKOPION Verdict 4B v22.0 | 4B (ternario 1.58-bit) | No disponible | Propietaria | Pesos propietarios |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Pesos propietarios: aunque el modelo se distribuye en Hugging Face, la model card indica que los pesos entrenados y la cabeza de decisión son propietarios; la reproducibilidad completa no es posible.
- Benchmarks no verificados: el model-index marca los resultados como `verified: false` y las suites son propias del autor, no estándar; no son comparables con MMLU, HumanEval u otros.
- Licencia restrictiva: la licencia "skopion-sovereign-kritis-audit-license-v1.0" no es open source; debe revisarse el enlace oficial antes de cualquier uso comercial.
- Idiomas limitados: solo en, de y pl; no se declara soporte de español ni de otras lenguas.
- Longitud de contexto no publicada: no es posible evaluar su idoneidad para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación: no se documentan tasas de alucinación ni mecanismos de abstención más allá de la predicción conformal declarada.
- Sesgos: no se publica información sobre sesgos demográficos, lingüísticos o de dominio.
- Componentes criptográficos y CBF: la eficacia real de la atestación ZK y de las envolventes de seguridad no ha sido auditada de forma independiente según la información disponible.
- Madurez del ecosistema: 0 descargas y 0 likes en el momento de la ficha; soporte comunitario limitado.
- Fecha de creación futura (2026-11-08): conviene verificar la vigencia y el estado del repositorio antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v23.0-sovereign-zk-nano-ternary-1.58b
- Organización en Hugging Face: https://huggingface.co/SKOPION-Intelligence
- Versión anterior (v22.0): https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v22.0-horizon-nano-ternary-1.58b
- DOI del registro Zenodo: https://doi.org/10.5281/zenodo.24052954
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion
- Licencia: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
