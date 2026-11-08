# SKOPION-Intelligence/skopion-verdict-micro-250m-v23.0-sovereign-zk-tactical

## Resumen

SKOPION Verdict Micro-250M v23.0 SOVEREIGN-ZK-HORIZON Tactical es un modelo de clasificación de texto de 250 millones de parámetros desarrollado por SKOPION-Intelligence, presentado como un "modelo de veredicto" (decision model / LLM-as-a-judge) orientado a la evaluación de decisiones en entornos de cumplimiento normativo y seguridad. El modelo se enmarca en la generación v23.0 del programa de investigación SKOPION Verdict (fases 101-120) y se distribuye con la etiqueta `text-classification`, con soporte declarado para inglés, alemán y polaco.

La propuesta del modelo es poco convencional: combina un clasificador compacto con mecanismos criptográficos de atestación (compromisos ZK-PCVC sobre el campo primo Goldilocks), envolventes de seguridad basadas en funciones de barrera de control (CBF) y referencias a estándares como KRITIS, NIS2, DORA, CNSA 2.0 y el EU AI Act. Según la model card, está pensado para despliegue en hardware de borde táctico (UAV, radio SDR, Raspberry Pi 5) con un consumo declarado de 0,072 julios por decisión.

Es relevante ahora por su posicionamiento en el nicho de "IA soberana" europea verificable, aunque conviene señalar desde el inicio que los pesos del modelo son propietarios (no se publican), que las métricas declaradas no están verificadas de forma independiente y que la información técnica disponible sobre arquitectura y entrenamiento es muy limitada. Esta ficha refleja exclusivamente lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de tipo transformer para `text-classification`, segun la libreria declarada; detalles no publicados) |
| Parametros totales | 250M |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible como listado; la model card menciona precision nativa `bfloat16` / `PQ2_0` en evaluacion |
| Idiomas soportados | Ingles (en), aleman (de), polaco (pl) |
| Licencia | `skopion-sovereign-kritis-audit-license-v1.0` (licencia propia, categoria "other") |
| Formato de pesos | No disponible (los pesos entrenados y los parametros de la cabeza de decision se declaran propietarios) |

## Arquitectura y entrenamiento

No se publica informacion detallada sobre la arquitectura interna mas alla de la etiqueta `transformers` y el pipeline `text-classification`. El modelo se presenta como un clasificador de 250M de parametros con una "cabeza de decision" (decision-head) cuyos parametros no se liberan. La model card menciona que las evaluaciones se ejecutaron de forma determinista (`temperature = 0.0`) en precision nativa `bfloat16` / `PQ2_0` sobre GPU NVIDIA H100 80GB HBM3.

El componente diferencial declarado no es la arquitectura del transformer sino el andamiaje de verificacion que lo rodea: compromisos criptograficos ZK-PCVC basados en pruebas de Freivalds sobre el campo primo Goldilocks (p = 2^64 - 2^32 + 1), con 0/64 discrepancias residuales algebraicas declaradas; envolventes de seguridad mediante Control Barrier Functions (CBF) en tiempo continuo; y primitivas post-cuanticas CNSA 2.0 (ML-KEM-1024 / ML-DSA-87). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o ajuste por preferencias.

## Capacidades

- Clasificacion de texto y emision de "veredictos" de decision binarios o categorizados, orientados a evaluacion de cumplimiento y riesgo.
- Funcion de juez (LLM-as-a-judge) y modelo de recompensa (reward-model) segun las etiquetas declaradas.
- Verificacion formal y atestacion criptografica de decisiones mediante ZK-PCVC (compromisos zero-knowledge que acompanan al veredicto).
- Aplicacion de envolventes de seguridad CBF para acotar decisiones fuera de rango.
- Prediccion conformal (conformal-prediction) para abtencion calibrada, segun las etiquetas del modelo.
- Capacidades multilingues limitadas a ingles, aleman y polaco.
- Mapeo declarado a marcos normativos: KRITIS, NATO STANAG, NIS2, DORA, CNSA 2.0 y EU AI Act.
- No se declaran capacidades de generacion abierta, codigo, matematicas, vision, audio ni tool calling.

## Casos de uso

- Auditoria de cumplimiento normativo automatizada: el modelo clasificaria decisiones o artefactos frente a requisitos de NIS2, DORA o KRITIS, emitiendo un veredicto acompanado de un compromiso ZK-PCVC que un auditor externo puede verificar sin acceder a los pesos.
- Triaje de decisiones en entornos de borde aislados (air-gap): su tamano de 250M y el consumo declarado de 0,072 J por decision lo hacen apto para despliegue en Raspberry Pi 5, radios SDR o controladoras BMC sin conectividad, donde no es viable invocar un modelo mayor.
- Modelo de recompensa o juez en pipelines de RLHF: puede puntuar salidas de otros modelos en ingles, aleman y polaco dentro de un bucle de evaluacion, con la ventaja de que cada puntuacion queda atestada criptograficamente.
- Verificacion de decisiones en sistemas ciberfisicos: las envolventes CBF permitirian rechazar o marcar veredictos que caigan fuera de margenes de seguridad definidos, util en supervision de UAV o sistemas industriales.
- Filtrado y moderacion de contenido regulado: clasificacion de textos frente a categorias sensibles con abtencion conformal cuando la confianza es baja, reduciendo falsos positivos en produccion.
- Cumplimiento del EU AI Act en documentacion de sistemas: uso como componente de registro y evaluacion de decisiones de alto riesgo, generando trazas verificables para expedientes de conformidad.
- Evaluacion comparativa de modelos (benchmarking interno): empleo como juez calibrado en conjuntos de evaluacion propios en los tres idiomas soportados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Strict-178 External Decision, ZK-PCVC & CBF Safety Benchmark Matrix (180 suites / 53.340 evaluaciones) | Precision media (%) | 98,34 |
| Empirical Wave-21..26 JSONL Suites (60 suites / 18.000 items con digests SHA-256) | Precision media (%) | 95,74 |

No se han publicado resultados en la informacion disponible para benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K u otros). Las cifras anteriores corresponden a conjuntos de evaluacion propios del autor y no son comparables directamente con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 250M en `bfloat16` el peso ronda los 0,5 GB (la model card cita 0,48 GB), por lo que en la practica cabria en cualquier GPU consumer con 4 GB o mas, aunque esta estimacion no la confirma el autor.
- GPU recomendadas por el autor para evaluacion: NVIDIA H100 80GB HBM3 (precision nativa `bfloat16` / `PQ2_0`).
- Hardware de borde declarado: Tactical UAV, radio SDR, BMC en air-gap y Raspberry Pi 5, con 0,072 J por decision.
- Cabe en GPU consumer: previsiblemente si (RTX 3060, RTX 4060, RTX 4090 y similares) por el tamano del modelo, si bien la disponibilidad de pesos condiciona cualquier despliegue real.
- Opciones de despliegue: la libreria declarada es `transformers`; no se confirman soportes de vLLM, llama.cpp, Ollama o TGI, y la naturaleza propietaria de los pesos impide verificar su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con modelos de clasificacion o jueces de tamano comparable, y las cifras de benchmark del autor no son directamente contrastables con benchmarks publicos.

## Limitaciones y advertencias

- Los pesos del modelo y los parametros de la cabeza de decision son propietarios; no se pueden descargar ni auditar, lo que limita la reproducibilidad pese al discurso de "verificabilidad".
- Las metricas de benchmark (98,34 % y 95,74 %) estan marcadas como `verified: false` y proceden de conjuntos de evaluacion propios del autor, no de benchmarks independientes.
- La licencia `skopion-sovereign-kritis-audit-license-v1.0` es propia y de categoria "other"; deben revisarse sus terminos antes de cualquier uso comercial, ya que no se detallan en la informacion disponible.
- Cobertura linguistica limitada a ingles, aleman y polaco; el rendimiento fuera de estos idiomas no esta documentado.
- Longitud de contexto no especificada, lo que impide valorar su comportamiento en documentos largos.
- Riesgo de alucinacion y sesgos: no documentado por el autor; al ser un clasificador, el riesgo se traslada a falsos positivos/negativos en los veredictos.
- El aparato criptografico y normativo que rodea al modelo (ZK-PCVC, CBF, CNSA 2.0, KRITIS, EU AI Act) se describe en la model card pero no se acompana de especificacion tecnica publica que permita validarlo de forma independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de redaccion de esta ficha, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-micro-250m-v23.0-sovereign-zk-tactical
- Version anterior (v22.0): https://huggingface.co/SKOPION-Intelligence/skopion-verdict-micro-250m-v22.0-horizon-tactical
- Portal EN del programa: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- DOI (registro Zenodo): https://doi.org/10.5281/zenodo.24052954
- Concept DOI: https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
