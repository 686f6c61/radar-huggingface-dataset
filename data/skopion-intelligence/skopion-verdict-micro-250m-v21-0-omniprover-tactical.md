# SKOPION-Intelligence/skopion-verdict-micro-250m-v21.0-omniprover-tactical

## Resumen

SKOPION Verdict Micro-250M v21.0 OMNI-PROVER Tactical es un modelo de clasificación de texto de 250 millones de parámetros desarrollado por SKOPION-Intelligence, una organización alemana (Mönchengladbach, EU PIC 861665939) orientada a seguridad de IA soberana europea, ciberseguridad KRITIS y criptografía post-cuántica. El modelo se presenta como un "decision/judge model" determinista, pensado para tareas de verificación formal, evaluación automatizada (LLM-as-a-judge) y control de cumplimiento normativo, y no como un modelo generativo de propósito general.

La propuesta diferencial del autor es un modelo de pequeño tamaño (0,48 GB) que afirma alcanzar un 98,96 % de precisión media en una matriz externa de 120 suites y 35.340 evaluaciones, además de un 100 % en las oleadas de verificación formal (Lean-4, Z3, TLA+), zk-STARK confidencial y consenso bizantino BFT. Incorpora mecanismos de atestación criptográfica (PCVC-v21-zkSTARK, FIPS-204 ML-DSA-87, FIPS-205 SLH-DSA) y control de riesgo conformal con alpha = 0,00001.

Es relevante ahora porque apunta a nichos concretos de cumplimiento regulatorio europeo (NIS2, EU AI Act, NATO STANAG) y despliegue en entornos tácticos de bajo consumo (UAV, radio SDR, air-gap, Raspberry Pi 5), con un consumo declarado de 0,08 julios por decisión. No obstante, conviene tratar todas las cifras como declaraciones del autor no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla variante concreta); pipeline text-classification |
| Parametros totales | 250M |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos declarados de 0,48 GB) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | no disponible (librería transformers) |

## Arquitectura y entrenamiento

El autor describe el modelo como un "decision/judge model" determinista de 250M parámetros con precisión "Sub-0.1J Tactical Edge", entrenado con FP-GRPO (variante de GRPO en punto flotante) y un esquema de atestación criptográfica denominado PCVC-v21-zkSTARK. La model card menciona "Phases 76–88" dentro de la generación v21.0 OMNI-PROVER, pero no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención) ni la composición del dataset de entrenamiento.

Los elementos técnicos destacados son la integración de verificación formal (Lean-4, Z3, TLA+), pruebas de conocimiento cero zk-STARK con 128-bit DEEP-FRI, firmas post-cuánticas FIPS-204 ML-DSA-87 y FIPS-205 SLH-DSA, y control de riesgo conformal split-conformal con alpha = 0,00001. No se especifica el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF/DPO más allá de la referencia a FP-GRPO.

## Capacidades

- Clasificación de texto y decisión binaria/multiclase orientada a veredictos ("verdict") y evaluación automatizada.
- Actuación como juez o reward model (LLM-as-a-judge) en pipelines de evaluación.
- Verificación formal asistida sobre Lean-4, Z3 y TLA+ según las oleadas declaradas por el autor.
- Atestación criptográfica y pruebas de conocimiento cero (zk-STARK) para confidencialidad de decisiones.
- Tolerancia a fallos bizantinos (Byzantine BFT) y alineación con SLSA L4 según la model card.
- Control de riesgo conformal con garantías estadísticas declaradas (alpha = 0,00001).
- Soporte multilingüe limitado a inglés, alemán y polaco.
- No se documentan capacidades de generación libre de texto, visión, audio ni tool calling.

## Casos de uso

- Auditoría de cumplimiento NIS2 y EU AI Act: el modelo puede clasificar decisiones y evidencias documentales como conformes o no conformes, apoyándose en el control de riesgo conformal declarado para acotar la tasa de error.
- Evaluación automatizada de respuestas de otros modelos (LLM-as-a-judge): su naturaleza de clasificador determinista y su bajo consumo lo hacen apto para puntuar grandes volúmenes de salidas en pipelines de evaluación.
- Verificación formal en CI/CD: integrado en pipelines que invocan Lean-4, Z3 o TLA+, el modelo puede emitir veredictos sobre la validez de pruebas generadas automáticamente.
- Despliegue en entornos tácticos de borde: con 0,48 GB de pesos y un consumo declarado de 0,08 J por decisión, encaja en UAV, radios SDR o Raspberry Pi 5 para decisiones de clasificación en campo.
- Sistemas air-gapped de defensa: la atestación zk-STARK y las firmas post-cuánticas permiten registrar decisiones verificables sin conexión, alineado con NATO STANAG según el autor.
- Triaje de incidentes KRITIS: clasificación rápida de eventos de ciberseguridad en infraestructuras críticas con registro criptográfico de cada veredicto.
- Moderación o filtrado determinista en inglés, alemán y polaco: uso como clasificador de políticas en aplicaciones multilingües de esos tres idiomas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Strict-118 External Decision, Formal Proving & Judge Benchmark Matrix (120 suites / 35.340 evaluaciones) | Accuracy media (%) | 98,96 |
| Wave-18 Lean-4/Z3/TLA+ Formal Proving, Wave-19 zk-STARK Confidential & Wave-20 Byzantine BFT (%) | Accuracy (%) | 100,00 |

El autor declara además un consumo de 0,08 julios por decisión en hardware táctico (UAV, SDR, air-gap BMC, Raspberry Pi 5) y un control de riesgo conformal del 99,999 %. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,48 GB de pesos, la huella en memoria es inferior a 1 GB en FP16 y aún menor cuantizado, aunque no se documentan los formatos de cuantización.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) o incluso CPU es suficiente para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con más de 2 GB de VRAM; también en Raspberry Pi 5 según el autor.
- Opciones de despliegue: transformers (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor declara 0,08 J por decisión en hardware táctico, pero no ofrece latencias ni tokens o decisiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict Micro-250M v21.0 | 250M | no disponible | Clasificación / judge determinista | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face |
| Alternativas de clasificación tipo DeBERTa/RoBERTa | 100M–400M | 512 tokens típicamente | Clasificación de texto | MIT / Apache 2.0 | Hugging Face |
| Modelos judge de gran tamaño (p. ej. familias 7B+) | 7B+ | 8K–128K | LLM-as-a-judge generativo | variables | Hugging Face |

No se dispone de datos públicos independientes que permitan comparar rendimiento con alternativas concretas; la comparación anterior es orientativa por categoría y tamaño. El autor no publica comparativas directas con modelos de terceros en la información disponible.

## Limitaciones y advertencias

- Todos los benchmarks y métricas (98,96 %, 100 %, 99,999 %, 0,08 J) son declaraciones del autor no verificadas de forma independiente y marcadas como `verified: false` en el model-index.
- La licencia "skopion-sovereign-kritis-audit-license-v1.0" es propietaria y de tipo "other"; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Idiomas limitados a inglés, alemán y polaco; no hay soporte documentado de castellano.
- No se documentan detalles de arquitectura, dataset ni proceso de entrenamiento, lo que dificulta la reproducibilidad.
- Riesgo de alucinación o de veredictos erróneos no cuantificado de forma externa; el control conformal declarado no sustituye a una validación independiente.
- Sesgos conocidos: no disponibles.
- No se documenta tool calling, generación libre ni capacidades multimodales; no debe asumirse que las tenga.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin evidencia de adopción por la comunidad.
- La fecha de creación declarada (2026-11-06) es posterior a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar la madurez del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-micro-250m-v21.0-omniprover-tactical
- DOI principal: https://doi.org/10.5281/zenodo.24009481
- Concept DOI: https://doi.org/10.5281/zenodo.24005152
- DOI v20.0.0: https://doi.org/10.5281/zenodo.24005153
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- GitHub: https://github.com/SKOPION-Intelligence/
- Repositorio de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío JevBench: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Licencia: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
