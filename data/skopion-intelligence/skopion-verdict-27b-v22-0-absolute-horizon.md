# SKOPION-Intelligence/skopion-verdict-27b-v22.0-absolute-horizon

## Resumen

SKOPION Verdict 27B v22.0 ABSOLUTE-HORIZON es un modelo de clasificación de texto de 27.000 millones de parámetros desarrollado por SKOPION-Intelligence, un programa de I+D centrado en IA para decisiones soberanas y cumplimiento normativo europeo. El modelo se presenta como un clasificador y evaluador (llm-as-a-judge, reward model) orientado a verificación formal, criptografía post-cuántica y auditoría regulatoria (KRITIS, NIS2, DORA, EU AI Act), con soporte declarado para TLA+, Coq, Lean 4 y pruebas zkML sobre EZKL y RISC Zero.

La relevancia del modelo reside en su enfoque hacia la "trazabilidad criptográfica" de decisiones: el autor declara control de riesgo conformal split-conformal con alpha = 0.000001 y atestación mediante zkSTARK (DEEP-FRI de 128 bits) junto con primitivas post-cuánticas FIPS 203/204/205. El modelo se distribuye en BF16 (54,8 GB) y se etiqueta con pipeline de clasificación de texto, aunque el autor lo describe como un sistema de decisión y evaluación más amplio.

No se dispone de información sobre la arquitectura interna (tipo de transformer, configuración de capas, datos de entrenamiento o proceso de alineamiento) en la documentación proporcionada. La model card se centra en resultados declarados, atestaciones criptográficas y referencias a publicaciones en Zenodo, sin detallar la receta de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura interna; se describe como modelo de decisión/evaluación de 27B) |
| Parametros totales | 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en BF16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | safetensors (implícito por library_name: transformers y tamaño BF16 de 54,8 GB; no confirmado explícitamente) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card menciona "BF16 + FP-GRPO + Lean-4/TLA+/Coq + EZKL/RISC Zero zkML + FIPS 203/204 PQC" como parte de su configuración de precisión y pipeline, lo que sugiere un entrenamiento con GRPO (Group Relative Policy Optimization) en precisión FP y una integración con herramientas de verificación formal y criptografía. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO más allá de la referencia a FP-GRPO.

El modelo se presenta como parte de un programa de investigación con publicación en Zenodo (DOI 10.5281/zenodo.24009481) y una comunidad CERN Zenodo. La atestación criptográfica declarada (PCVC-v22-zkSTARK con DEEP-FRI de 128 bits y FIPS-203 ML-KEM-1024, FIPS-204 ML-DSA-87, FIPS-205 SLH-DSA) es una innovación destacable en el contexto de modelos de decisión auditables, aunque no se aportan detalles técnicos sobre cómo se implementa en la inferencia.

## Capacidades

- Clasificación de texto y evaluación de decisiones (llm-as-a-judge, reward model) en dominios de cumplimiento normativo y seguridad.
- Verificación formal declarada sobre TLA+, Coq y Lean 4 (Wave-21, 10 suites, 100% declarado).
- Pruebas zkML sobre EZKL Halo2 y RISC Zero zkVM (Wave-22, 10 suites, 100% declarado).
- Criptografía post-cuántica y cumplimiento regulatorio FIPS 203/204/205, KRITIS, NIS2 y DORA (Wave-23, 10 suites, 100% declarado).
- Control de riesgo conformal split-conformal con alpha = 0.000001 (99,9999% declarado).
- Atestación criptográfica mediante zkSTARK (DEEP-FRI 128 bits) y primitivas PQC.
- Soporte multilingüe en inglés, alemán y polaco.
- Capacidad de abstención calibrada (conformal abstention) según la descripción del programa en el portal del autor.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión o audio en la información proporcionada.

## Casos de uso

- Auditoría de cumplimiento NIS2 y DORA: el modelo puede clasificar y evaluar evidencias de control regulatorio en inglés, alemán y polaco, con abstención calibrada cuando la confianza es insuficiente, adecuado para entornos de auditoría que exigen trazabilidad.
- Verificación formal de especificaciones: uso declarado para generar y evaluar pruebas en TLA+, Coq y Lean 4, útil en pipelines de verificación de sistemas críticos donde se requiere evidencia formal.
- Evaluación de pruebas zkML: clasificación y validación de circuitos y evidencias generadas con EZKL Halo2 y RISC Zero zkVM en flujos de privacidad verificable.
- Validación de conformidad post-cuántica: comprobación de implementaciones FIPS 203/204/205 en procesos de migración criptográfica de infraestructuras críticas (KRITIS).
- Modelo juez en pipelines de RLHF/GRPO: uso como reward model o evaluador automático para puntuar respuestas en sistemas de alineamiento, con control de riesgo conformal.
- Decisiones auditables con atestación criptográfica: despliegue en entornos donde cada decisión debe acompañarse de una prueba zkSTARK verificable, por ejemplo en organismos reguladores o auditorías externas.
- Clasificación multilingüe de documentación regulatoria: procesamiento de expedientes en inglés, alemán y polaco para triaje y priorización de riesgos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Strict-148 External Decision, Formal Proving, zkML & PQC Benchmark Matrix (150 suites / 44.340 evaluaciones) | Strict-148 External Mean Accuracy (%) | 99,52 |
| Wave-21 TLA+/Coq/Lean-4 Formal Proving, Wave-22 EZKL/RISC Zero zkML & Wave-23 FIPS 203/204 PQC (%) | accuracy | 100,00 |

El autor declara además un consumo energético verificado de 6,55 julios por decisión sobre 4x NVIDIA H100 80GB HBM3. No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,8 GB de pesos, por lo que se requieren al menos 60-70 GB de VRAM considerando activaciones y overhead.
- GPU recomendadas: el autor reporta pruebas sobre 4x NVIDIA H100 80GB HBM3; también sería viable en A100 80GB o configuraciones multi-GPU.
- No cabe en GPUs de consumo (RTX 4090 24 GB, RTX 3090 24 GB) en BF16; requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se reporta el consumo energético de 6,55 J/decisión en el hardware indicado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona una clasificación "#2 Global (#1 Single-Model)" en su propio leaderboard, pero no se aportan datos de modelos de referencia externos ni comparativas con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SKOPION Verdict 27B v22.0 | 27B | no disponible | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y figuran como no verificados (verified: false) en el model-index; no hay validación independiente.
- La licencia skopion-sovereign-kritis-audit-license-v1.0 es de tipo "other" y no se detallan en la información disponible las restricciones para uso comercial; es necesario revisar el enlace de licencia antes de cualquier despliegue en producción.
- No se documenta la arquitectura interna ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos y riesgos de alucinación.
- El soporte lingüístico se limita a inglés, alemán y polaco; no se garantiza calidad en castellano ni en otros idiomas.
- No se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Las afirmaciones sobre verificación formal, zkML y PQC son responsabilidad del autor; no se aportan artefactos verificables en la información disponible más allá de las referencias a Zenodo y GitHub.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción comunitaria.
- No se documentan salvaguardas, filtros de contenido ni evaluaciones de seguridad independientes.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v22.0-absolute-horizon
- DOI oficial: https://doi.org/10.5281/zenodo.24009481
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- DOI v20.0.0: https://doi.org/10.5281/zenodo.24005153
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- ORCID: https://orcid.org/0009-0002-1713-9490
- Dataset Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Licencia: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Modelo relacionado v15.0: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v15.0-native
