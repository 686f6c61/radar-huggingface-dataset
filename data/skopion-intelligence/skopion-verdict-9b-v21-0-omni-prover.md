# SKOPION-Intelligence/skopion-verdict-9b-v21.0-omni-prover

## Resumen

SKOPION Verdict 9B v21.0 OMNI-PROVER es un modelo de clasificación de texto y evaluación (judge/reward model) desarrollado por SKOPION-Intelligence, una iniciativa europea centrada en modelos de decisión deterministas y de cumplimiento normativo. El modelo está diseñado para emitir veredictos estructurados en contextos de auditoría regulatoria (KRITIS, NIS2, EU AI Act, NATO STANAG), verificación formal de pruebas (Lean 4, Z3, TLA+) y control de riesgo conforme con atestación criptográfica.

La versión v21.0 se presenta como la generación "OMNI-PROVER" (fases 76-88 del programa del autor) e incorpora, según la model card, integración de pruebas formales, atestación zk-STARK con curvas de 128 bits y firmas post-cuánticas (FIPS-204 ML-DSA-87 y FIPS-205 SLH-DSA), además de control de riesgo split-conformal con alpha = 0.00001. El modelo declara 9B parámetros en BF16/Edge-FP8 con un peso de 18,3 GB.

Es relevante para equipos que necesitan un componente de decisión auditable y con trazabilidad criptográfica dentro de pipelines de cumplimiento, aunque la información pública disponible es escasa: el repositorio no tiene descargas ni interacciones y los resultados declarados no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como transformer en la librería `transformers`) |
| Parametros totales | 9B |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Edge-FP8 (declarados en la model card) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, `license: other`) |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de la etiqueta `transformers` y el pipeline `text-classification`. Se declara un tamaño de 9B parámetros, precisión BF16 y una variante Edge-FP8, con un total de 18,3 GB de pesos. El autor menciona componentes de entrenamiento como "FP-GRPO" y "PCVC-v21-zkSTARK", pero no se aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovación técnica que el autor destaca es la combinación de verificación formal (Lean 4, Z3, TLA+) con atestación criptográfica zk-STARK (DEEP-FRI de 128 bits) y firmas post-cuánticas (FIPS-204 ML-DSA-87, FIPS-205 SLH-DSA), junto con control de riesgo split-conformal a alpha = 0.00001. No se especifica cómo se integran estos mecanismos en el modelo ni si forman parte del proceso de inferencia o de un pipeline externo.

## Capacidades

- Clasificación y emisión de veredictos estructurados para auditoría regulatoria (KRITIS, NIS2, EU AI Act, NATO STANAG).
- Evaluación como juez (LLM-as-a-judge) y modelo de recompensa (reward model).
- Verificación formal de pruebas en Lean 4, Z3 y TLA+ según los resultados declarados.
- Atestación de confidencialidad mediante zk-STARK y firmas post-cuánticas.
- Control de riesgo conformal con garantías estadísticas declaradas (alpha = 0.00001).
- Soporte multilingüe limitado a inglés, alemán y polaco.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Auditoría de cumplimiento NIS2 y KRITIS: el modelo puede clasificar evidencias y emitir veredictos estructurados sobre controles de seguridad, con atestación criptográfica que permite trazar cada decisión en un informe regulatorio.
- Evaluación de sistemas de IA conforme al EU AI Act: uso como juez automático para clasificar riesgos y documentar decisiones con control conformal, útil en procesos de conformidad previos a la comercialización.
- Verificación de pruebas formales en pipelines de desarrollo: integración en flujos de CI para validar obligaciones en Lean 4, Z3 o TLA+ y bloquear merges cuando una prueba no se satisface.
- Modelo de recompensa en RLHF: empleo como reward model para puntuar respuestas de otros modelos en dominios regulados, aprovechando su orientación a decisiones deterministas.
- Gestión de evidencias en ciberseguridad: clasificación de incidentes y artefactos conforme a NATO STANAG, con firmas post-cuánticas para preservar la integridad a largo plazo.
- Despliegue en entornos de borde con requisitos de eficiencia: la variante Edge-FP8 y el consumo declarado de 1,98 J por decisión en H100/L40S lo hacen apto para auditoría continua en infraestructura con restricciones energéticas.
- Atestación de decisiones en entornos confidenciales: el uso de zk-STARK permite demostrar que un veredicto se emitió conforme a una política sin revelar los datos de entrada, relevante en sectores sanitarios o financieros.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Strict-118 External Decision, Formal Proving & Judge Benchmark Matrix (120 suites / 35.340 evaluaciones) | Accuracy media (%) | 99,15 |
| Wave-18 Lean-4/Z3/TLA+ Formal Proving, Wave-19 zk-STARK Confidential y Wave-20 Byzantine BFT (%) | Accuracy (%) | 100,00 |

No se han publicado en la información disponible resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,3 GB de pesos, por lo que se recomiendan GPUs con 24 GB o más para dejar margen a activaciones y contexto.
- VRAM estimada en Edge-FP8: no se especifica el peso exacto en FP8; como referencia, una cuantización a 8 bits de 9B parámetros rondaría los 9-10 GB, aunque el dato no está confirmado por el autor.
- GPU recomendadas según la model card: NVIDIA H100 y L40S (consumo declarado de 1,98 J por decisión).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en BF16 ajustado o en FP8; en RTX 3090 (24 GB) también sería viable en BF16 con contexto moderado.
- Opciones de despliegue: no se documentan explícitamente; al ser un modelo `transformers`, es compatible con stacks habituales como vLLM, TGI o llama.cpp, aunque la disponibilidad de pesos en GGUF no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict 9B v21.0 OMNI-PROVER | 9B | no disponible | Judge/reward con verificación formal y atestación criptográfica | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Hugging Face, 0 descargas |
| SKOPION Verdict 9B v15.0 Native | 9B | no disponible | Judge/reward y cumplimiento regulatorio | Propietaria (misma licencia) | Hugging Face |
| Alternativas open source de judge/reward de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de la competencia en parámetros, contexto o rendimiento verificable.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como `verified: false`; no hay validación independiente.
- El repositorio no registra descargas ni interacciones, lo que dificulta evaluar su adopción y madurez.
- La licencia es propietaria (`skopion-sovereign-kritis-audit-license-v1.0`); es imprescindible revisar sus términos antes de cualquier uso comercial, ya que las restricciones concretas no se detallan en la información disponible.
- Idiomas limitados a inglés, alemán y polaco; no se declara soporte de castellano.
- No se documentan sesgos conocidos, pero al ser un modelo orientado a decisiones regulatorias existe riesgo de sobrerrepresentación de las taxonomías normativas con las que fue entrenado.
- Riesgo de alucinación no cuantificado; el uso como juez en contextos de cumplimiento exige revisión humana.
- No se especifica la longitud de contexto, lo que impide planificar su uso en documentos regulatorios extensos.
- La integración real de mecanismos como zk-STARK o firmas post-cuánticas en el modelo no está detallada técnicamente; podría tratarse de componentes de un pipeline externo y no del modelo en sí.
- El consumo energético declarado (1,98 J por decisión) y las garantías conformales no cuentan con metodología pública verificable en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v21.0-omni-prover
- DOI oficial (Zenodo): https://doi.org/10.5281/zenodo.24009481
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- DOI versión v20.0.0: https://doi.org/10.5281/zenodo.24005153
- Comunidad Zenodo SKOPION Intelligence: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio de benchmarks en GitHub: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío a JevBench / Decision Index 0.4: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- Portal oficial (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal oficial (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal oficial (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Organización en GitHub: https://github.com/SKOPION-Intelligence/
- Modelo predecesor v15.0 Native: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v15.0-native
