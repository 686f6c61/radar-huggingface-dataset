# SKOPION-Intelligence/skopion-verdict-27b-v21.0-omni-prover

## Resumen

SKOPION Verdict 27B v21.0 OMNI-PROVER es un modelo de la familia SKOPION Verdict, desarrollada por SKOPION-Intelligence, orientada a la clasificacion de texto y a la evaluacion automatizada (LLM-as-a-judge) en contextos de cumplimiento normativo europeo y verificación formal. El modelo se presenta como un "decision model" y "reward model" especializado en dominios como KRITIS (infraestructuras críticas), NATO STANAG, NIS2, EU AI Act, criptografía post-cuántica y predicción conformal. Según la model card, opera con 27.000 millones de parámetros en precisión BF16 y un tamaño de pesos de 54,8 GB.

La propuesta diferencial del modelo es la integración de mecanismos de atestación criptográfica y control de riesgo estadístico: la model card declara un control de riesgo conformal split-conformal con alpha = 0,00001 (99,999%) y un esquema PCVC-v21-zkSTARK basado en DEEP-FRI de 128 bits junto con firmas FIPS-204 ML-DSA-87 y FIPS-205 SLH-DSA. También declara soporte de verificación formal mediante Lean-4, Z3 y TLA+.

El modelo se publica bajo una licencia propietaria ("skopion-sovereign-kritis-audit-license-v1.0") y está etiquetado para los idiomas inglés, alemán y polaco. Es relevante para equipos que evaluan modelos de decisión auditables en entornos regulados europeos, aunque la información pública disponible es limitada y los resultados declarados no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura interna; se infiere transformer por el tag `transformers`, sin confirmación) |
| Parametros totales | 27B (27.000 millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos declarados en BF16) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (propietaria) |
| Formato de pesos | no disponible (tamaño declarado: 54,8 GB; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo (tipo de transformer, número de capas, atención, etc.). Se declara el uso de "BF16 + FP-GRPO + Lean-4/Z3/TLA+ + PCVC-v21-zkSTARK", lo que sugiere un pipeline de entrenamiento con optimización por preferencias (GRPO en precisión FP) combinado con módulos de verificación formal (Lean-4, Z3, TLA+) y un esquema criptográfico propietario (PCVC-v21-zkSTARK). No se especifican el número de tokens de entrenamiento ni la composición del dataset.

Como innovaciones técnicas destacadas, la model card menciona: control de riesgo conformal split-conformal con alpha = 0,00001 (nivel de confianza del 99,999%), atestación criptográfica mediante zk-STARK con DEEP-FRI de 128 bits, firmas post-cuánticas FIPS-204 ML-DSA-87 y FIPS-205 SLH-DSA, y verificación formal en Lean-4, Z3 y TLA+. No se aporta información sobre el proceso de RLHF/DPO más allá de la referencia a FP-GRPO, ni sobre datos de preentrenamiento.

## Capacidades

- Clasificación de texto y evaluación automatizada (pipeline `text-classification`, LLM-as-a-judge, reward model).
- Evaluación de cumplimiento normativo en dominios KRITIS, NATO STANAG, NIS2 y EU AI Act (según los tags del modelo).
- Verificación formal declarada mediante Lean-4, Z3 y TLA+ (Wave-18).
- Atestación criptográfica confidencial con zk-STARK (Wave-19) y consenso bizantino BFT con SLSA L4 (Wave-20).
- Control de riesgo conformal con nivel declarado del 99,999%.
- Soporte multilingüe en inglés, alemán y polaco.
- No se declara soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Auditoría de cumplimiento NIS2: el modelo puede clasificar documentos y decisiones de una organización frente a los requisitos de la directiva, actuando como juez automatizado con trazabilidad criptográfica declarada.
- Evaluación de riesgos en infraestructuras críticas (KRITIS): clasificación de incidentes y decisiones operativas con control de riesgo conformal para acotar la tasa de error.
- Verificación de conformidad con el EU AI Act: uso como evaluador de sistemas de IA para clasificar su nivel de riesgo y documentar decisiones auditables.
- Validación de políticas de seguridad en entornos NATO STANAG: clasificación de documentación y decisiones conforme a los estándares declarados.
- Evaluación de modelos como juez (LLM-as-a-judge) en pipelines de RL: uso como reward model o decision model para puntuar salidas de otros modelos con atestación criptográfica.
- Verificación formal de especificaciones: apoyo en la comprobación de propiedades en Lean-4, Z3 o TLA+ según la capacidad declarada en la Wave-18.
- Atestación de decisiones en entornos regulados: generación de pruebas criptográficas zk-STARK y firmas post-cuánticas asociadas a cada decisión, según lo declarado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Strict-118 External Decision, Formal Proving & Judge Benchmark Matrix (120 suites / 35.340 evaluaciones) | Accuracy media (%) | 99,27 |
| Wave-18 Lean-4/Z3/TLA+ Formal Proving, Wave-19 zk-STARK Confidential & Wave-20 Byzantine BFT (%) | Accuracy (%) | 100,00 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos declarados: 54,8 GB en BF16, lo que requiere al menos ~55 GB de VRAM solo para los pesos.
- La model card cita 4x NVIDIA H100 80GB HBM3 como hardware de referencia, con un consumo declarado de 6,65 julios por decisión.
- No cabe en GPUs de consumo (RTX 4090 con 24 GB) en BF16; se requeriría cuantización, cuyos formatos no están disponibles en la información proporcionada.
- Opciones de despliegue: no se especifican en la model card (vLLM, llama.cpp, Ollama, TGI no confirmados).
- Latencia y throughput: no disponibles; solo se declara el consumo energético por decisión.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría. La familia SKOPION Verdict incluye versiones de 4B, 9B y 27B, así como un "System 1.5 Speculative Cascade Committee", según el repositorio de GitHub del autor, pero no se han publicado especificaciones detalladas de estas variantes en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| skopion-verdict-27b-v21.0-omni-prover | 27B | no disponible | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Hugging Face |
| skopion-verdict-27b-v15.0-native | 27B (declarado) | no disponible | Propietaria (misma licencia) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks (99,27% y 100%) son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La licencia es propietaria y específica ("skopion-sovereign-kritis-audit-license-v1.0"); es imprescindible revisar sus términos antes de cualquier uso comercial.
- No se detalla la arquitectura interna, el contexto máximo, los formatos de cuantización ni el proceso de entrenamiento, lo que dificulta la evaluación técnica independiente.
- Solo se declaran tres idiomas (en, de, pl); no hay información sobre rendimiento en castellano.
- El modelo está orientado a clasificación y evaluación, no a generación abierta; no se declaran capacidades de tool calling, agentes, visión o audio.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible.
- El pipeline declarado es `text-classification`, pero la model card describe capacidades de verificación formal y atestación criptográfica que no se detallan técnicamente.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v21.0-omni-prover
- DOI principal (Zenodo): https://doi.org/10.5281/zenodo.24009481
- DOI conceptual (Zenodo): https://doi.org/10.5281/zenodo.24005152
- DOI v20.0.0 (Zenodo): https://doi.org/10.5281/zenodo.24005153
- Comunidad Zenodo SKOPION Intelligence: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío a JevBench / Decision Index 0.4: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- Portal oficial EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal oficial DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal oficial PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Versión anterior v15.0-native en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v15.0-native
- Organización en GitHub: https://github.com/SKOPION-Intelligence/
