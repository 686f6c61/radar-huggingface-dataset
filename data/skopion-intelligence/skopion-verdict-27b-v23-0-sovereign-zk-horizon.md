# SKOPION-Intelligence/skopion-verdict-27b-v23.0-sovereign-zk-horizon

## Resumen

SKOPION Verdict 27B v23.0 SOVEREIGN-ZK-HORIZON es un modelo de clasificación de texto de 27.000 millones de parámetros desarrollado por SKOPION-Intelligence, orientado a la evaluacion formal y auditables de decisiones en entornos regulados. Se presenta como un modelo de tipo "LLM-as-a-judge" y reward model, disenado para emitir veredictos con atestacion criptografica (ZK-PCVC sobre el campo primo Goldilocks) y envolventes de seguridad basadas en funciones de barrera de control (CBF). Su ambito declarado cubre normativas como KRITIS, NATO STANAG, NIS2, DORA, CNSA 2.0 y el EU AI Act.

El modelo se distribuye unicamente en BF16 (54,8 GB) y sus pesos y cabezas de decision permanecen propietarios segun la model card; lo que se publica son los registros de evaluacion a nivel de item y los compromisos criptograficos para verificacion independiente. Soporta ingles, aleman y polaco, y se enmarca en la generacion v23.0 del programa de investigacion de SKOPION.

Es relevante por su propuesta de combinar clasificacion de alto rendimiento declarado (99,30 % en la matriz externa Strict-178 de 180 suites) con trazabilidad criptografica y conformidad normativa europea, un enfoque poco habitual en la categoria de reward models y clasificadores de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 27B |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; se menciona "PQ2_0" como precision nativa de evaluacion, sin detalle de cuantizaciones publicadas |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia "other", propietaria) |
| Formato de pesos | no disponible (pesos propietarios; tamano declarado 54,8 GB) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna mas alla de su naturaleza transformer y su escala de 27B parametros. La model card describe un pipeline de clasificacion de texto con cabezas de decision propietarias, complementado por un esquema de atestacion criptografica ZK-PCVC basado en el campo primo Goldilocks (p = 2^64 - 2^32 + 1) con verificacion de Freivalds, y por envolventes de seguridad continuas mediante Control Barrier Functions. Tambien se declara integracion de primitivas post-cuanticas CNSA 2.0 (ML-KEM-1024 y ML-DSA-87).

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Las evaluaciones declaradas se ejecutaron de forma determinista (temperature = 0.0, bfloat16 / PQ2_0) sobre GPU NVIDIA H100 80GB HBM3, con un consumo energetico declarado de 6,3 julios por decision.

## Capacidades

- Clasificacion de texto y emision de veredictos de decision en dominios de cumplimiento normativo (KRITIS, NIS2, DORA, EU AI Act, NATO STANAG).
- Funcion de juez (LLM-as-a-judge) y modelo de recompensa (reward model) para evaluacion de respuestas.
- Verificacion formal y atestacion criptografica de decisiones mediante ZK-PCVC (compromisos zero-knowledge con verificacion de Freivalds).
- Aplicacion de envolventes de seguridad mediante Control Barrier Functions.
- Prediccion conforme (conformal prediction) segun los tags del modelo.
- Soporte multilingue en ingles, aleman y polaco.
- Integracion con primitivas de criptografia post-cuantica CNSA 2.0.
- No se declara soporte de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Auditoria de cumplimiento NIS2 y DORA: el modelo clasifica decisiones y artefactos documentales de una organizacion, emitiendo veredictos con compromisos criptograficos que un auditor externo puede verificar sin acceso a los pesos.
- Evaluacion automatizada de respuestas de otros LLM en pipelines de QA: actua como juez con salida determinista (temperature = 0.0), lo que facilita la reproducibilidad de las evaluaciones.
- Modelo de recompensa en pipelines de RLHF: puntua respuestas candidatas en ingles, aleman y polaco para seleccionar las mejores antes de un ajuste supervisado.
- Verificacion de seguridad en sistemas criticos (KRITIS): aplica envolventes CBF para determinar si una decision opera dentro de los limites de seguridad definidos.
- Triaje documental multilingue en entornos regulados europeos: clasifica documentacion en en/de/pl con trazabilidad de cada decision mediante registros SHA-256.
- Cumplimiento del EU AI Act: genera registros de decision auditables y verificables criptograficamente para demostrar el comportamiento del sistema ante un regulador.
- Despliegue en infraestructura con requisitos post-cuanticos: integra ML-KEM-1024 y ML-DSA-87 en el flujo de atestacion de decisiones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Strict-178 External Decision, ZK-PCVC & CBF Safety Benchmark Matrix (180 suites / 53.340 evaluaciones) | Precision media (%) | 99,30 |
| Empirical Wave-21..26 JSONL Suites (60 suites / 18.000 items con digests SHA-256) | Precision media (%) | 99,09 |

Ademas, la model card declara un 100,00 % en las 30/30 suites JSONL Wave-24..26, y un consumo de 6,3 J por decision en H100 80GB HBM3. No se han publicado resultados en benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,8 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 80 GB.
- GPU recomendadas: NVIDIA H100 80GB HBM3 (hardware declarado en las evaluaciones); A100 80GB como alternativa con memoria suficiente.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en BF16; no se declaran versiones cuantizadas que permitan reducir el footprint.
- Opciones de despliegue: la model card no especifica frameworks de servicio (vLLM, TGI, llama.cpp, Ollama); al ser pesos propietarios, el despliegue depende de acceso concedido por el autor.
- Latencia y throughput: no disponibles; el unico dato energetico declarado es 6,3 J por decision en H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SKOPION Verdict 27B v23.0 | 27B | no disponible | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Clasificacion/juez con atestacion ZK y cumplimiento normativo |
| Modelos jueces genericos de la comunidad (p. ej. familias de reward models abiertos) | Variable | Variable | Abiertas (Apache 2.0, MIT) | Evaluacion de respuestas sin atestacion criptografica |
| Clasificadores de seguridad abiertos | Tipicamente < 10B | Variable | Abiertas | Moderacion y clasificacion de contenido |

No se dispone de datos comparativos de rendimiento frente a alternativas concretas en la informacion proporcionada; los benchmarks declarados por SKOPION no son directamente comparables con los de modelos publicos al emplear una matriz propietaria (SKOPION-Verdict-Bench).

## Limitaciones y advertencias

- Los pesos y las cabezas de decision son propietarios; no es posible una replicacion independiente del modelo, solo la verificacion de los registros de evaluacion publicados.
- Los resultados de benchmarks (99,30 % y 99,09 %) son declarados por el autor y no han sido verificados de forma independiente.
- La matriz de evaluacion Strict-178 es propietaria, lo que dificulta la comparacion directa con modelos de la comunidad.
- Cobertura linguistica limitada a ingles, aleman y polaco; no se declara soporte de castellano.
- No se especifican la longitud de contexto, la composicion del entrenamiento ni los sesgos conocidos.
- Licencia propietaria con condiciones especificas de auditoria soberana; es necesario revisar el texto completo antes de cualquier uso comercial.
- Al ser un modelo de clasificacion y juicio, existe riesgo de alucinacion o de falsos positivos/negativos en veredictos, especialmente fuera de los dominios normativos cubiertos.
- La atestacion criptografica verifica la integridad del veredicto, no su correccion semantica.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v23.0-sovereign-zk-horizon
- DOI del registro: https://doi.org/10.5281/zenodo.24052954
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
