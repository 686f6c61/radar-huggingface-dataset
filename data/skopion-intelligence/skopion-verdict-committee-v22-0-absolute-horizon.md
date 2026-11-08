# SKOPION-Intelligence/skopion-verdict-committee-v22.0-absolute-horizon

## Resumen

SKOPION Verdict Committee v22.0 ABSOLUTE-HORIZON es un sistema de clasificación y decisión publicado por SKOPION Intelligence (Mönchengladbach, Alemania) bajo el identificador `skopion-verdict-committee-v22.0-absolute-horizon`. Se presenta como un "System 1.5 BFT-Cascade" compuesto por tres modelos de 4B, 9B y 27B parámetros que operan como comité de veredictos con tolerancia bizantina, orientado a tareas de auditoría normativa, verificación formal y decisión determinista en entornos regulados (KRITIS, NIS2, DORA, EU AI Act, NATO STANAG).

El modelo se distribuye como pipeline de `text-classification` dentro de la librería `transformers`, con pesos declarados en BF16 y un tamaño total de 60,4 GB. Su propuesta diferencial no es la generación de texto libre, sino la emisión de veredictos clasificatorios acompañados de atestación criptográfica (zk-STARK con DEEP-FRI de 128 bits y primitivas post-cuánticas FIPS 203/204/205) y control de riesgo conformal con nivel alfa de 0,000001 ("six-nines").

Es relevante ahora porque combina tres líneas de investigación activas —LLM-as-a-judge, verificación formal asistida (TLA+, Coq, Lean 4) y zkML— en un único artefacto con licencia soberana propia y trazabilidad vía DOI de Zenodo. La información pública disponible es escasa: cero descargas, cero likes, sin documentación técnica detallada sobre arquitectura interna ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (descrita como "System 1.5 BFT-Cascade" de 4B + 9B + 27B; no se detalla la arquitectura interna de cada componente) |
| Parámetros totales | 4B + 9B + 27B (sistema en cascada; total agregado no explicitado) |
| Parámetros activos | No disponible (no se declara como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos declarados en BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en), alemán (de), polaco (pl) |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, no OSI) |
| Formato de pesos | No disponible (se declara BF16 y un tamaño de 60,4 GB; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card describe el sistema como un "System 1.5 BFT-Cascade" que combina tres modelos de 4B, 9B y 27B parámetros en una cascada con tolerancia a fallos bizantinos. No se especifica si cada componente es un transformer denso, un MoE o un híbrido, ni se detalla el mecanismo de agregación de veredictos entre los tres niveles. Se menciona entrenamiento con FP-GRPO (variante de GRPO en precisión reducida), lo que sugiere un pipeline de aprendizaje por refuerzo sobre recompensas verificables, coherente con el uso declarado como reward model y LLM-as-a-judge.

Las innovaciones técnicas declaradas incluyen síntesis formal en TLA+, Coq y Lean 4 (Wave-21), pruebas zkML con EZKL Halo2 y RISC Zero zkVM (Wave-22), y cumplimiento de estándares post-cuánticos FIPS 203/204/205 junto con marcos KRITIS/NIS2/DORA (Wave-23). También se declara control de riesgo conformal split-conformal con alfa de 0,000001 y atestación criptográfica PCVC-v22-zkSTARK con DEEP-FRI de 128 bits. No se publica el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de anotación.

## Capacidades

- Clasificación de texto y emisión de veredictos binarios o multiclase en dominios regulados (auditoría, cumplimiento normativo, evaluación de riesgo).
- Actuación como LLM-as-a-judge y reward model en pipelines de evaluación automatizada.
- Razonamiento multi-paso con abstención calibrada (conformal prediction) cuando la confianza cae por debajo del umbral alfa declarado.
- Generación de artefactos de verificación formal en TLA+, Coq y Lean 4 (según resultados declarados en Wave-21).
- Producción de pruebas zkML mediante EZKL Halo2 y RISC Zero zkVM (Wave-22).
- Evaluación de conformidad con criptografía post-cuántica FIPS 203/204/205 y marcos KRITIS, NIS2, DORA y EU AI Act (Wave-23).
- Soporte multilingüe limitado a inglés, alemán y polaco.
- Atestación criptográfica de decisiones mediante zk-STARK con DEEP-FRI de 128 bits.
- No se declara soporte explícito de tool calling, function calling ni visión.

## Casos de uso

- Auditoría de cumplimiento NIS2 y DORA: el sistema clasifica evidencias documentales y emite veredictos con punteros de evidencia y abstención calibrada, adecuado para entornos donde se exige trazabilidad de la decisión y no solo la etiqueta.
- Evaluación automatizada de modelos (LLM-as-a-judge): puede actuar como juez en pipelines de evaluación interna, con control conformal que permite descartar veredictos de baja confianza en lugar de forzar una etiqueta.
- Verificación formal asistida: generación de especificaciones y pruebas en TLA+, Coq y Lean 4 para validar propiedades de sistemas críticos antes de despliegue, según los resultados declarados en Wave-21.
- Pruebas de conocimiento cero sobre inferencia (zkML): producción de atestaciones zk-STARK que permiten a un tercero verificar que un veredicto se emitió conforme al modelo sin revelar la entrada, útil en auditorías entre organizaciones.
- Migración a criptografía post-cuántica: evaluación de conformidad de infraestructuras con FIPS 203/204/205 en el contexto de planes de transición PQC, aprovechando el soporte declarado en Wave-23.
- Clasificación de incidentes en infraestructuras críticas (KRITIS): triaje de eventos de seguridad en alemán, inglés o polaco con umbral de abstención explícito para escalado a analista humano.
- Atestación de decisiones reguladas: emisión de veredictos con prueba criptográfica verificable para expedientes que requieran demostrar que la decisión siguió el procedimiento declarado ante un regulador.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Strict-148 External Mean Accuracy (150 suites / 44.340 evaluaciones sobre 120 modelos) | accuracy | 99,53 % |
| Wave-21 TLA+/Coq/Lean 4 Formal Proving (10 suites) | accuracy | 100,00 % |
| Wave-22 EZKL / RISC Zero zkML (10 suites) | accuracy | 100,00 % |
| Wave-23 FIPS 203/204 PQC y KRITIS/NIS2/DORA (10 suites) | accuracy | 100,00 % |

No se han publicado resultados en la información disponible para benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). El autor declara además un consumo energético verificado de 8,50 julios por decisión sobre 4x NVIDIA H100 80GB HBM3.

## Requisitos de hardware

- El sistema completo ocupa 60,4 GB en BF16, por lo que la inferencia requiere al menos ~61 GB de VRAM sumando los tres componentes, o menos si se ejecutan secuencialmente en cascada.
- El autor reporta mediciones sobre 4x NVIDIA H100 80GB HBM3, configuración de referencia declarada.
- Con GPU de consumo: el componente de 4B cabe en una RTX 4090 (24 GB) en BF16; el de 9B también en BF16 (~18 GB); el de 27B requiere cuantización (por ejemplo, 4 bits, ~14-16 GB) para entrar en 24 GB, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: al estar etiquetado como `transformers` y `endpoints_compatible`, se puede servir con TGI o vLLM; no se confirma soporte de llama.cpp u Ollama al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles. Solo se declara el consumo energético de 8,50 J/decisión en la configuración de 4x H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict Committee v22.0 | 4B + 9B + 27B en cascada | No disponible | Clasificación/veredicto con verificación formal, zkML y PQC | skopion-sovereign-kritis-audit-license-v1.0 (propia) | Hugging Face, 0 descargas |
| Prometheus 2 (7B/8x7B) | 7B / MoE 8x7B | 4.096 tokens | LLM-as-a-judge con rúbricas | Apache 2.0 | Hugging Face, ampliamente adoptado |
| RewardBench evaluators (p. ej. ArmoRM-Llama3-8B) | 8B | 8.192 tokens | Reward model para RLHF | Llama 3 (uso comunitario) | Hugging Face |
| Qwen2.5-32B-Instruct | 32B | 131.072 tokens | Modelo generalista con capacidad de juez | Apache 2.0 | Hugging Face |

La comparación directa es difícil: no se dispone de contexto declarado, benchmarks estándar ni pesos verificables de forma independiente para el modelo de SKOPION, y su licencia propia limita la reutilización frente a alternativas Apache 2.0.

## Limitaciones y advertencias

- Los resultados de benchmarks (99,53 % y 100 %) son declaraciones del autor marcadas como no verificadas; no hay replicación independiente publicada.
- Cero descargas y cero likes en el momento de la ficha: ausencia de validación por parte de la comunidad.
- No se publica información sobre arquitectura interna, contexto máximo, composición del dataset ni proceso de anotación, lo que impide una evaluación técnica rigurosa.
- Idiomas limitados a inglés, alemán y polaco; no se declara soporte de castellano.
- Licencia propia (`skopion-sovereign-kritis-audit-license-v1.0`) no reconocida por la OSI: es imprescindible revisar los términos antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación no cuantificado en la documentación disponible; la abstención conformal declarada mitiga pero no elimina este riesgo en producción.
- El consumo declarado de 8,50 J/decisión y las pruebas zkML/PQC no son reproducibles sin acceso a los artefactos de verificación, que no se enlazan en la model card.
- Sesgos conocidos: no disponibles.
- Posible desajuste entre el etiquetado `text-classification` y las capacidades declaradas (generación formal, zkML), que sugiere un pipeline compuesto más que un modelo único.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v22.0-absolute-horizon
- Listado de modelos del autor: https://huggingface.co/SKOPION-Intelligence/models
- Portal del programa (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal del programa (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal del programa (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- DOI del release: https://doi.org/10.5281/zenodo.24009481
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Repositorio de benchmarks en GitHub: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
- Envío a JevBench / Decision Index: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
