# SKOPION-Intelligence/skopion-verdict-committee-v21.0-omni-prover

## Resumen

SKOPION Verdict Committee v21.0 OMNI-PROVER es un sistema de clasificación y arbitraje de decisiones publicado por SKOPION-Intelligence, un laboratorio europeo centrado en modelos de cumplimiento normativo y verificación formal. El modelo se presenta como una cascada especulativa de tres tamaños (4B + 9B + 27B) que actúa como comité de jueces para tareas de decisión, evaluación de riesgo y auditoría normativa, con especial énfasis en marcos regulatorios europeos como NIS2, EU AI Act y KRITIS, además de estándares NATO STANAG.

La propuesta técnica va más allá de un clasificador convencional: integra verificación formal con Lean 4, Z3 y TLA+, pruebas criptográficas zk-STARK para confidencialidad y mecanismos de consenso bizantino (BFT) para agregar los veredictos de los distintos componentes del comité. El autor declara un rendimiento del 99,28 % de precisión media en su propio benchmark Strict-118 (120 suites, 35.340 evaluaciones) y un 100 % en las olas de verificación formal, criptografía y consenso BFT.

Es relevante ahora porque cubre un nicho poco atendido: modelos de decisión auditables y deterministas orientados a compliance regulatorio, con atestación criptográfica y control de riesgo conformal. La información pública disponible es escasa y mayoritariamente autoinformada, y el modelo no cuenta con descargas ni validación independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada especulativa System 1.5 BFT-Cascade (componentes de 4B, 9B y 27B) con verificación formal Lean-4/Z3/TLA+ |
| Parametros totales | 40B agregados (4B + 9B + 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos declarados en BF16, 60,4 GB) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, etiquetada como "other") |
| Formato de pesos | no disponible (librería transformers; no se detalla safetensors/GGUF) |

## Arquitectura y entrenamiento

La arquitectura declarada es una "System 1.5 BFT-Cascade": una cascada de modelos de 4B, 9B y 27B parámetros que se combinan mediante un mecanismo de consenso bizantino (BFT) para producir un veredicto agregado. Sobre esa base se añaden capas de verificación formal con Lean 4, Z3 y TLA+, y un esquema de pruebas criptográficas zk-STARK (PCVC-v21-zkSTARK, con 128-bit DEEP-FRI y firmas post-cuánticas FIPS-204 ML-DSA-87 y FIPS-205 SLH-DSA). El pipeline se etiqueta como `text-classification` y se distribuye a través de la librería `transformers`.

El entrenamiento se describe como BF16 con FP-GRPO (una variante de GRPO con precisión flotante), aunque no se especifican el número de tokens, la composición del dataset ni si hubo fases adicionales de RLHF o DPO. El autor menciona control de riesgo conformal split-conformal con alpha = 0,00001 ("five-nines") y un consumo energético verificado de 8,65 julios por decisión sobre 4x NVIDIA H100 80GB HBM3. No se detallan innovaciones de decodificación especulativa más allá del nombre de la cascada, ni se aportan datos sobre atención lineal u otras optimizaciones de contexto.

## Capacidades

- Clasificación de decisiones y veredictos en tareas de compliance y auditoría normativa (KRITIS, NIS2, EU AI Act, NATO STANAG).
- Arbitraje tipo "LLM-as-a-judge" y modelo de recompensa (reward model) para evaluar salidas de otros modelos.
- Verificación formal de propiedades mediante Lean 4, Z3 y TLA+, según las olas Wave-18 declaradas.
- Generación de pruebas criptográficas zk-STARK para confidencialidad y atestación (Wave-19).
- Consenso bizantino tolerante a fallos (BFT) y cumplimiento SLSA L4 para agregar veredictos (Wave-20).
- Control de riesgo conformal con garantías estadísticas (alpha = 0,00001).
- Capacidades multilingües limitadas a inglés, alemán y polaco.
- No se documentan capacidades de visión, audio, tool calling ni razonamiento multi-paso más allá de la propia cascada de verificación.

## Casos de uso

- Auditoría de cumplimiento NIS2: el modelo puede clasificar evidencias y decisiones de una organización frente a los requisitos de la directiva, usando el comité BFT para reducir falsos positivos en dictámenes regulatorios.
- Evaluación de riesgo KRITIS en infraestructuras críticas: la cascada permite emitir veredictos auditables sobre incidentes y controles, con atestación criptográfica del resultado.
- Clasificación de conformidad con el EU AI Act: útil para etiquetar sistemas de IA según niveles de riesgo y generar trazas verificables de la decisión.
- Juez automático en pipelines de evaluación de modelos: actúa como reward model o evaluador de salidas en procesos de RLHF/GRPO, con control conformal del riesgo de error.
- Verificación formal de políticas y contratos: la integración con Lean 4, Z3 y TLA+ permite comprobar propiedades de sistemas antes de desplegar cambios en producción.
- Atestación post-cuántica de decisiones: en entornos que exigen firmas ML-DSA-87 o SLH-DSA, el modelo puede emitir veredictos con prueba criptográfica asociada.
- Arbitraje multi-parte en disputas regulatorias: el mecanismo BFT permite agregar dictámenes de varios evaluadores y documentar el consenso alcanzado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Strict-118 External Decision, Formal Proving & Judge Benchmark Matrix (120 suites / 35.340 evaluaciones) | Accuracy media (%) | 99,28 |
| Wave-18 Lean-4/Z3/TLA+ Formal Proving (7 suites) | Accuracy (%) | 100,00 |
| Wave-19 zk-STARK Confidential (7 suites) | Accuracy (%) | 100,00 |
| Wave-20 Byzantine BFT & SLSA L4 (6 suites) | Accuracy (%) | 100,00 |

Los resultados proceden del `model-index` declarado por el autor y no están verificados de forma independiente (`verified: false`). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Pesos declarados en BF16 con un total de 60,4 GB, lo que requiere al menos 60 GB de VRAM para cargar la cascada completa sin cuantización.
- Configuración de referencia del autor: 4x NVIDIA H100 80GB HBM3, con un consumo declarado de 8,65 julios por decisión.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en BF16; sería necesario cuantizar o ejecutar los componentes por separado.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI); la librería declarada es `transformers`.
- No se publican datos de latencia ni throughput más allá del consumo energético por decisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SKOPION Verdict Committee v21.0 OMNI-PROVER | 40B (4B+9B+27B) | no disponible | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Comité BFT con verificación formal y compliance |
| SKOPION Verdict Committee v15.0 Native | no disponible | no disponible | skopion-sovereign-kritis-audit-license-v1.0 | Versión anterior de la misma familia |
| Modelos juez genéricos (p. ej. Prometheus, judge models abiertos) | 7B-70B | 4K-32K típicamente | Apache 2.0 / MIT habitual | Evaluación LLM-as-a-judge sin verificación formal |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; los benchmarks del autor no son directamente comparables con los de modelos juez de propósito general.

## Limitaciones y advertencias

- Todos los resultados de benchmarks son autoinformados y no verificados (`verified: false`); no hay validación independiente.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de redactar la ficha, lo que impide contrastar su comportamiento real.
- La licencia es propietaria (`skopion-sovereign-kritis-audit-license-v1.0`) y restringe el uso comercial; es necesario revisar los términos en el enlace oficial antes de cualquier despliegue.
- Solo cubre inglés, alemán y polaco; no hay soporte documentado para castellano ni otras lenguas.
- No se especifican longitud de contexto, composición del dataset ni detalles de entrenamiento, lo que dificulta evaluar sesgos y riesgos de alucinación.
- El enfoque en compliance regulatorio europeo puede introducir sesgos hacia marcos normativos concretos y no es extrapolable a otras jurisdicciones sin revisión.
- El consumo energético y la configuración de hardware declarados (4x H100) implican un coste de despliegue elevado.
- La naturaleza determinista y auditables del sistema no exime de revisión humana en decisiones regulatorias de alto impacto.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v21.0-omni-prover
- DOI oficial (Zenodo): https://doi.org/10.5281/zenodo.24009481
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Versión anterior v15.0: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v15.0-native
