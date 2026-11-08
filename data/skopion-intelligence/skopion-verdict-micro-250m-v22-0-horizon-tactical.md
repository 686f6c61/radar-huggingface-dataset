# SKOPION-Intelligence/skopion-verdict-micro-250m-v22.0-horizon-tactical

## Resumen

SKOPION Verdict Micro-250M v22.0 ABSOLUTE-HORIZON Tactical es un modelo de clasificación de texto de 250 millones de parámetros desarrollado por SKOPION-Intelligence, un programa europeo de I+D centrado en IA de decisión soberana, ciberseguridad KRITIS y criptografía post-cuántica. El modelo se presenta como un "decision model" táctico orientado a entornos de borde (UAV táctico, radio SDR, BMC air-gap, Raspberry Pi 5), con un consumo energético declarado de 0,08 julios por decisión y un peso de 0,48 GB.

La propuesta del autor gira en torno a tres ejes: verificación formal (síntesis en TLA+, Coq y Lean 4), pruebas criptográficas zkML (EZKL Halo2, RISC Zero zkVM) y cumplimiento normativo europeo (KRITIS, NIS2, DORA, EU AI Act) junto con criptografía post-cuántica FIPS 203/204/205. El modelo declara un 99,30% de precisión media en una matriz externa de 150 suites (44.340 evaluaciones sobre 120 modelos) y un 100% en las olas 21, 22 y 23 de su propio benchmark.

Es relevante ahora por su encuadre en el cumplimiento del EU AI Act y la normativa NIS2/DORA, y por su enfoque en atestación criptográfica y control de riesgo conformal (99,9999%, alfa = 0,000001). No obstante, conviene subrayar que los resultados son declarados por el autor y no verificados de forma independiente, y que el modelo tiene cero descargas y cero "likes" en Hugging Face en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia `transformers`); detalles internos no disponibles |
| Parámetros totales | 250M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, de, pl |
| Licencia | `skopion-sovereign-kritis-audit-license-v1.0` (licencia "other", no estándar) |
| Formato de pesos | No disponible (librería `transformers`; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El autor describe el modelo como un "decision model" de 250M parámetros con pipeline `text-classification`, entrenado con una técnica que denomina "FP-GRPO" (no se detalla en la información disponible qué significa exactamente ni su implementación). Se menciona también la integración de zkML y PQC en el pipeline de release, aunque no se especifica si forman parte del entrenamiento o solo del proceso de atestación y verificación posterior.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Las innovaciones declaradas se centran en la verificación formal (síntesis en TLA+, Coq y Lean 4), la prueba criptográfica zkML (EZKL Halo2 y RISC Zero zkVM) y el control de riesgo conformal split-conformal con alfa = 0,000001, junto con atestación PCVC-v22-zkSTARK (128-bit DEEP-FRI) y algoritmos post-cuánticos FIPS 203 ML-KEM-1024, FIPS 204 ML-DSA-87 y FIPS 205 SLH-DSA. No se detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención) más allá de la etiqueta genérica `transformers`.

## Capacidades

- Clasificación de texto y toma de decisiones binarias o multiclase en dominios de seguridad y cumplimiento normativo.
- Verificación formal: síntesis y evaluación en TLA+, Coq y Lean 4 según las olas 21 del benchmark declarado.
- Pruebas zkML: integración declarada con EZKL Halo2 y RISC Zero zkVM (ola 22).
- Criptografía post-cuántica: evaluación de conformidad con FIPS 203/204/205 (ola 23).
- Cumplimiento normativo: KRITIS, NIS2, DORA y EU AI Act.
- Control de riesgo conformal con abstención calibrada (alfa = 0,000001).
- Atestación criptográfica mediante PCVC-v22-zkSTARK (128-bit DEEP-FRI).
- Soporte multilingüe limitado a inglés, alemán y polaco.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Auditoría de cumplimiento NIS2/DORA: el modelo clasifica evidencias y decisiones de auditoría en entornos KRITIS, con control de riesgo conformal que permite abstenerse cuando la confianza es insuficiente, adecuado para pipelines de cumplimiento regulado.
- Verificación formal asistida: uso en la ola 21 para generar y validar especificaciones en TLA+, Coq y Lean 4, integrándose en flujos de verificación de sistemas críticos.
- Atestación zkML en entornos air-gap: despliegue en BMC aislado con pruebas criptográficas (EZKL Halo2, RISC Zero zkVM) para demostrar que una decisión se tomó con el modelo y los datos declarados.
- Evaluación de conformidad post-cuántica: clasificación de implementaciones criptográficas frente a FIPS 203/204/205 en procesos de migración PQC.
- Inferencia en borde táctico: despliegue en UAV, radio SDR o Raspberry Pi 5 con un consumo declarado de 0,08 J por decisión y 0,48 GB de peso, apto para plataformas con restricciones energéticas severas.
- Filtrado y triaje de decisiones en SOC: clasificación de alertas y evidencias en inglés, alemán y polaco dentro de flujos de respuesta a incidentes.
- Componente de "LLM-as-a-judge" o reward model: uso como evaluador de decisiones en pipelines de RL o de selección de respuestas, según las etiquetas del autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Strict-148 External Decision, Formal Proving, zkML & PQC Benchmark Matrix (150 suites / 44.340 evaluaciones) | Precisión media (%) | 99,3 |
| Wave-21 TLA+/Coq/Lean-4 Formal Proving, Wave-22 EZKL/RISC Zero zkML & Wave-23 FIPS 203/204 PQC (%) | Precisión (%) | 100,0 |

No se han publicado resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores proceden exclusivamente de la model card del autor y no cuentan con verificación externa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 250M parámetros y 0,48 GB de peso declarado, la inferencia en FP16 requeriría aproximadamente 0,5 GB de pesos más overhead de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) sería suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque el dato no está confirmado en la información disponible.
- Plataformas de borde declaradas: Raspberry Pi 5, UAV táctico, radio SDR y BMC air-gap.
- Opciones de despliegue: `transformers` (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se declara un consumo de 0,08 J por decisión en hardware de borde.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. El autor menciona en su portal modelos de decisión de 4B, 9B y 27B con licencia Apache-2.0 dentro del mismo programa SKOPION Verdict, pero no se proporcionan especificaciones comparables (contexto, benchmarks estándar, licencia) para este modelo de 250M.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| skopion-verdict-micro-250m-v22.0-horizon-tactical | 250M | No disponible | `skopion-sovereign-kritis-audit-license-v1.0` | Hugging Face (0 descargas) |
| SKOPION Verdict 4B / 9B / 27B (mismo programa) | 4B / 9B / 27B | No disponible | Apache-2.0 (según portal) | No confirmado en la información disponible |
| Alternativas externas de clasificación de 250M | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los benchmarks (99,3% y 100%) son declarados por el autor y no están verificados de forma independiente; deben tratarse con cautela.
- Cero descargas y cero "likes" en Hugging Face en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- La licencia `skopion-sovereign-kritis-audit-license-v1.0` es una licencia "other" no estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de auditoría o soberanía.
- Idiomas limitados a inglés, alemán y polaco; no se declara soporte de castellano.
- No se especifican la longitud de contexto, los tipos de cuantización ni el formato de pesos, lo que dificulta la planificación de despliegue en producción.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de clasificación, el riesgo principal es la clasificación errónea con alta confianza, mitigado parcialmente por el control conformal declarado.
- Las afirmaciones sobre verificación formal, zkML y PQC son difíciles de auditar sin acceso al código, a los artefactos de prueba y a la documentación técnica detallada.
- No se declara soporte de tool calling ni de agentes; no debe asumirse para casos de uso conversacionales o agénticos.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-micro-250m-v22.0-horizon-tactical
- DOI del release: https://doi.org/10.5281/zenodo.24009481
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- DOI v20.0.0: https://doi.org/10.5281/zenodo.24005153
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío JevBench / Decision Index: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- ORCID: https://orcid.org/0009-0002-1713-9490
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- GitHub de la organización: https://github.com/SKOPION-Intelligence/
