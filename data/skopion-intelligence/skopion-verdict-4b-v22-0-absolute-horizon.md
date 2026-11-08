# SKOPION-Intelligence/skopion-verdict-4b-v22.0-absolute-horizon

## Resumen

SKOPION Verdict 4B v22.0 ABSOLUTE-HORIZON es un modelo de clasificación de texto de 4.000 millones de parámetros desarrollado por SKOPION Intelligence (Bartosz Joachimiak), publicado bajo el identificador `SKOPION-Intelligence/skopion-verdict-4b-v22.0-absolute-horizon`. No es un generador de texto libre al uso: el programa SKOPION Verdict se orienta a modelos de decisión tipados que estructuran hallazgos de seguridad defensiva y vinculan los juicios a secciones visuales y textuales explícitas. El modelo se emplea como juez (LLM-as-a-judge) y modelo de recompensa en dominios de cumplimiento normativo y verificación formal.

La versión v22.0 se presenta como la generación de release correspondiente a las fases 89-100 del programa y declara una precisión media externa del 99,40% en la matriz Strict-148 (150 suites, 44.340 evaluaciones sobre 120 modelos). Incorpora módulos declarados de verificación formal (TLA+, Coq, Lean 4), pruebas zkML (EZKL Halo2, RISC Zero zkVM) y criptografía post-cuántica conforme a FIPS 203/204/205, además de control de riesgo conformal con atestación criptográfica zk-STARK.

Es relevante para equipos que necesitan un componente de decisión auditable en pipelines de seguridad y compliance europeo (KRITIS, NIS2, DORA, EU AI Act), con licencia propia y soporte de tres idiomas (inglés, alemán y polaco). El modelo se distribuye en formato transformers con pesos de 8,04 GB en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión tipado; pipeline `text-classification`) |
| Parámetros totales | 4B |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | no disponible (librería `transformers`; tamaño declarado 8,04 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (transformer, MoE, híbrida u otra). La model card describe el sistema como un modelo de decisión tipado de 4B parámetros con precisión BF16, entrenado con FP-GRPO (variante de GRPO con precisión flotante) y con integración declarada de zkML y criptografía post-cuántica FIPS 203/204. El pipeline declarado en Hugging Face es `text-classification`, y el modelo se posiciona como juez y modelo de recompensa más que como generador.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO más allá de la mención a FP-GRPO. Las innovaciones técnicas declaradas incluyen síntesis formal en TLA+/Coq/Lean 4 (Wave-21), pruebas zkML con EZKL Halo2 y RISC Zero zkVM (Wave-22), y conformidad PQC y normativa KRITIS/NIS2/DORA (Wave-23), además de control de riesgo conformal split-conformal con alpha = 0,000001 y atestación PCVC-v22-zkSTARK (DEEP-FRI de 128 bits con ML-KEM-1024, ML-DSA-87 y SLH-DSA). Estos datos provienen exclusivamente de las afirmaciones del autor y no se han verificado de forma independiente.

## Capacidades

- Clasificación y decisión tipada sobre entradas textuales y secciones visuales/estructurales explícitas.
- Evaluación como juez (LLM-as-a-judge) y modelo de recompensa en pipelines de evaluación.
- Razonamiento sobre marcos de cumplimiento normativo: KRITIS, NIS2, DORA y EU AI Act.
- Soporte declarado de verificación formal en TLA+, Coq y Lean 4.
- Soporte declarado de pruebas zkML (EZKL Halo2, RISC Zero zkVM) y criptografía post-cuántica FIPS 203/204/205.
- Control de riesgo conformal con atestación criptográfica zk-STARK.
- Capacidades multilingües en inglés, alemán y polaco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de cumplimiento NIS2 y DORA: el modelo clasifica hallazgos de seguridad y los vincula a secciones normativas explícitas, lo que permite generar informes de auditoría estructurados y trazables en lugar de texto libre.
- Evaluación de proveedores y terceros (KRITIS): uso como juez para puntuar evidencias de seguridad de proveedores críticos, con control de riesgo conformal que acota la tasa de error de las decisiones.
- Verificación formal en pipelines de CI: integración de la salida del modelo con comprobaciones en TLA+, Coq o Lean 4 para validar propiedades de sistemas antes de su despliegue.
- Atestación criptográfica de decisiones: generación de pruebas zk-STARK y uso de primitivas post-cuánticas FIPS 203/204/205 para demostrar que una decisión se tomó conforme al modelo sin revelar la entrada.
- Modelo de recompensa en RLHF/GRPO: empleo como reward model para alinear otros modelos generativos en dominios de seguridad y compliance.
- Clasificación multilingüe de documentación regulatoria: procesamiento de textos en inglés, alemán y polaco para triaje de evidencias y clasificación de riesgos en organizaciones con operaciones en la UE.
- Evaluación de riesgo de modelos de IA conforme al EU AI Act: uso como componente de juicio en la clasificación de sistemas de IA por nivel de riesgo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Strict-148 External Decision, Formal Proving, zkML & PQC Benchmark Matrix (150 suites / 44.340 evaluaciones) | Precisión media externa (%) | 99,4 |
| Wave-21 TLA+/Coq/Lean-4 Formal Proving, Wave-22 EZKL/RISC Zero zkML & Wave-23 FIPS 203/204 PQC (%) | Precisión (%) | 100,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,04 GB en BF16 según el tamaño de pesos declarado; en cuantizaciones de 8 bits o 4 bits se reduciría, aunque no se publican formatos cuantizados oficiales.
- GPU recomendadas: NVIDIA H100 y estaciones de trabajo RTX según la model card (la cifra de 0,85 J/decision se declara medida en H100 / RTX Workstation).
- Cabe en GPU de consumo: sí, en GPUs con al menos 8-10 GB de VRAM en BF16 (por ejemplo, RTX 3080/4070 en adelante); no se detallan requisitos exactos por modelo.
- Opciones de despliegue: librería `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se declara un consumo energético de 0,85 julios por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict 4B v22.0 ABSOLUTE-HORIZON | 4B | no disponible | 99,4% (Strict-148, declarado) | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face |
| SKOPION Verdict 4B v20.0 Singularity | 4B | no disponible | no disponible | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face |
| SKOPION Verdict 9B / 27B (mismo programa) | 9B / 27B | no disponible | no disponible | licencia SKOPION | Portal del programa |

No se dispone de datos de benchmarks ni especificaciones de contexto para los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks (99,4% y 100%) son afirmaciones del autor marcadas como `verified: false`; no han sido validados de forma independiente.
- No se detalla la arquitectura interna, la longitud de contexto ni la composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento fuera de los dominios declarados.
- El modelo está especializado en decisiones tipadas de seguridad y compliance; no es un generador de texto general y su uso fuera de ese ámbito puede degradar la calidad.
- Solo cubre inglés, alemán y polaco; no hay soporte declarado de castellano ni de otros idiomas.
- La licencia `skopion-sovereign-kritis-audit-license-v1.0` es una licencia propia no estándar: es imprescindible revisar sus términos antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Las capacidades de verificación formal, zkML y PQC se presentan como integraciones declaradas; no se aportan artefactos reproducibles en la información disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin comunidad ni validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v22.0-absolute-horizon
- Portal del programa (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal del programa (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal del programa (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- DOI principal (Zenodo): https://doi.org/10.5281/zenodo.24009481
- DOI conceptual (Zenodo): https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks (Kaggle): https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio de benchmarks (GitHub): https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío JevBench / Decision Index: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- ORCID: https://orcid.org/0009-0002-1713-9490
- Modelo predecesor (v20.0 Singularity): https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v20.0-singularity
