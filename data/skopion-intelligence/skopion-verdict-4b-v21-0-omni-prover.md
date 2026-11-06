# SKOPION-Intelligence/skopion-verdict-4b-v21.0-omni-prover

## Resumen

SKOPION Verdict 4B v21.0 OMNI-PROVER es un modelo de clasificación de texto de 4.000 millones de parámetros desarrollado por SKOPION Intelligence, una iniciativa europea centrada en modelos deterministas de decisión, recompensa y cumplimiento normativo. El modelo se presenta como un "juez" (LLM-as-a-judge) y modelo de recompensa orientado a verificación formal, auditoría regulatoria (KRITIS, NIS2, EU AI Act, NATO STANAG) y control de riesgo conforme, no como un generador de texto conversacional general.

La versión v21.0 introduce lo que el autor denomina OMNI-PROVER, con soporte declarado para pruebas formales en Lean 4, Z3 y TLA+, atestación criptográfica zk-STARK (DEEP-FRI de 128 bits) y firmas post-cuánticas FIPS-204 ML-DSA-87 y FIPS-205 SLH-DSA. Se distribuye en BF16 con un tamaño de pesos declarado de 8,04 GB y está entrenado sobre GRPO con precisión completa (FP-GRPO) según la model card.

El modelo es relevante en el contexto de la demanda de sistemas de decisión auditables y con garantías criptográficas para entornos regulados europeos, aunque su adopción está limitada por una licencia propia restrictiva y por la ausencia de verificación independiente de los resultados declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); pipeline text-classification |
| Parametros totales | 4B |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos declarados de 8,04 GB); no se documentan otros formatos |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | no disponible (librería transformers; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que es un transformer de 4B parámetros en BF16. El entrenamiento se describe como FP-GRPO (GRPO en precisión completa), un esquema de optimización por política con recompensas, coherente con su posicionamiento como modelo de recompensa y juez. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO.

La innovación técnica declarada se concentra en la capa de verificación y atestación: integración con probadores formales (Lean 4, Z3, TLA+), generación de pruebas criptográficas zk-STARK con DEEP-FRI de 128 bits, firmas post-cuánticas FIPS-204/FIPS-205, control de riesgo conformal split-conformal con alpha = 0,00001 (nivel declarado de 99,999%) y un esquema propietario denominado PCVC-v21-zkSTARK. El autor también declara un consumo energético verificado de 0,88 julios por decisión sobre NVIDIA H100 y estaciones de trabajo RTX. Ninguno de estos elementos está respaldado por documentación técnica pública en la información disponible.

## Capacidades

- Clasificación de texto y emisión de veredictos de decisión (pipeline text-classification).
- Actuación como LLM-as-a-judge y modelo de recompensa para evaluar salidas de otros modelos.
- Verificación formal declarada mediante Lean 4, Z3 y TLA+ (Wave-18).
- Atestación criptográfica confidencial con zk-STARK (Wave-19).
- Tolerancia a fallos bizantinos (BFT) y cumplimiento SLSA L4 declarados (Wave-20).
- Control de riesgo conformal con nivel declarado de 99,999% (alpha = 0,00001).
- Soporte multilingüe limitado a inglés, alemán y polaco.
- Capacidades de razonamiento multi-paso y agentes: no disponibles de forma explícita en la información.
- Tool calling / function calling: no disponible.
- Visión, audio o modo thinking: no disponibles.

## Casos de uso

- Auditoría de cumplimiento NIS2 y KRITIS: el modelo se emplearía como clasificador de evidencias y emisión de veredictos sobre controles regulatorios, con atestación criptográfica asociada a cada decisión para trazabilidad ante auditores.
- Evaluación de riesgos del EU AI Act: uso como juez automático para clasificar sistemas de IA según niveles de riesgo y generar dictámenes documentados con firmas post-cuánticas.
- Verificación formal de artefactos software: integración en pipelines que traduzcan especificaciones a Lean 4, Z3 o TLA+ y validen propiedades de seguridad antes del despliegue, según la capacidad Wave-18 declarada.
- Modelo de recompensa en RLHF/GRPO: uso como reward model para puntuar salidas de otros modelos en procesos de alineamiento, dado su entrenamiento declarado con FP-GRPO.
- Evaluación de proveedores y terceros en entornos OT/ICS: clasificación de informes y evidencias técnicas en alemán, inglés y polaco para programas de seguridad de la cadena de suministro con requisitos SLSA L4.
- Control de riesgo con garantías conformales: despliegue en flujos de decisión donde se requiera una cota de error declarada (alpha = 0,00001) y registro criptográfico de cada inferencia para auditoría posterior.
- Filtrado y moderación de contenido en contextos regulados: clasificación determinista de textos con umbrales de confianza calibrados y atestación de la decisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente; `verified: false`):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Strict-118 External Decision, Formal Proving & Judge Benchmark Matrix (120 suites / 35.340 evaluaciones, 108 modelos) | Accuracy media (%) | 99,1 |
| Wave-18 Formal Proving Lean-4/Z3/TLA+ (7 suites) + Wave-19 zk-STARK Confidential (7 suites) + Wave-20 Byzantine BFT & SLSA L4 (6 suites) | Accuracy (%) | 100,0 |

No se han publicado resultados de benchmarks estándar reconocidos (MMLU, HumanEval, GSM8K) en la información disponible. El autor declara además un consumo de 0,88 J por decisión sobre NVIDIA H100 y estaciones RTX, y un control de riesgo conformal del 99,999%, sin metodología pública verificable en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y contexto; se recomienda un mínimo de 16 GB para uso práctico.
- GPU recomendadas: NVIDIA H100 (hardware citado por el autor para la medición energética) y estaciones de trabajo RTX; no se detallan modelos concretos.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM (RTX 4080, RTX 4090, RTX 5090) en BF16; en GPUs de 8-12 GB requeriría cuantización, que no está documentada.
- Opciones de despliegue: transformers (librería declarada). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles; solo se declara el consumo energético de 0,88 J por decisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict 4B v21.0 OMNI-PROVER | 4B | no disponible | Juez, verificación formal, cumplimiento regulatorio | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Hugging Face |
| SKOPION Verdict 4B v15.0 PICO-INT4 | 4B | no disponible | Juez y modelo de decisión, variante INT4 para edge | Propietaria (misma familia) | Hugging Face |
| Modelos juez generalistas (p. ej. familias reward-model de código abierto) | Variable | Variable | Evaluación de salidas y recompensa | Apache 2.0 / MIT en la mayoría | Hugging Face |

No se dispone de datos verificables de benchmarks comparativos frente a modelos juez de terceros en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks (99,1% y 100%) están declarados por el autor y marcados como no verificados; no hay evaluación independiente en la información disponible.
- El benchmark principal (SKOPION-Verdict-Bench-120Suites) es de creación propia, lo que limita la comparabilidad con estándares de la industria.
- Cobertura lingüística restringida a inglés, alemán y polaco; no se declara soporte de español.
- Licencia propietaria "skopion-sovereign-kritis-audit-license-v1.0" con posibles restricciones para uso comercial; deben revisarse los términos antes de cualquier despliegue en producción.
- No se documentan la longitud de contexto, el formato de pesos ni los métodos de cuantización, lo que dificulta la planificación de despliegue.
- El modelo está orientado a clasificación y veredictos, no a generación conversacional; usarlo como asistente general produciría resultados fuera de su dominio previsto.
- Riesgo de alucinación en las justificaciones textuales de los veredictos: la clasificación puede ser correcta mientras la explicación asociada no lo es; conviene validar por separado.
- Las afirmaciones sobre zk-STARK, firmas post-cuánticas y control conformal no cuentan con especificación técnica pública en la información disponible; tratarlas como promesas del autor hasta su verificación.
- Sesgos: no se documentan análisis de sesgo demográfico, lingüístico o sectorial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni casos de uso independientes publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v21.0-omni-prover
- DOI oficial (Zenodo): https://doi.org/10.5281/zenodo.24009481
- DOI conceptual (Zenodo): https://doi.org/10.5281/zenodo.24005152
- DOI versión v20.0.0: https://doi.org/10.5281/zenodo.24005153
- Comunidad Zenodo SKOPION Intelligence: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio de benchmarks en GitHub: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío a JevBench / Decision Index 0.4: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- Organización en GitHub: https://github.com/SKOPION-Intelligence/
- Portal oficial (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal oficial (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal oficial (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Variante anterior v15.0 PICO-INT4: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-pico-int4
