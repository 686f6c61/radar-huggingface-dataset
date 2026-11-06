# SKOPION-Intelligence/skopion-verdict-4b-v15.0-native

## Resumen

SKOPION Verdict 4B v15.0 Native-Sovereign es un modelo de decisión y evaluación (LLM-as-a-judge / reward model) de 4.000 millones de parámetros desarrollado por SKOPION-Intelligence, orientado a la clasificación de decisiones en entornos regulados europeos: KRITIS, NIS-2, DORA y EU AI Act. No es un modelo generativo de propósito general, sino un clasificador de texto con una cabeza de decisión residual (MLP) que emite veredictos binarios o multietiqueta sobre pares de candidatos, con capacidad de abstención calibrada mediante predicción conforme.

La arquitectura parte de un backbone transformer de 4B parámetros sometido a fusión SLERP (alpha = 0,85) sobre el que se injerta una cabeza `verdict_head.pt` entrenada en bfloat16 en el clúster RWTH Aachen CLAIX-2023 (4x NVIDIA H100 80GB). El modelo se distribuye con pesos BF16 nativos (8,04 GB) y dispone de variantes INT8 (4,22 GB) e INT4 (2,25 GB) con invariancia de decisión del 100% respecto a BF16 en las 250 sondas de calibración bilaterales.

Su relevancia actual radica en tres factores: invariancia a la posición de los candidatos (99,97% de consistencia en 5.405 pares conmutados), abstención determinista `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad supera el umbral alpha = 0,01, y un consumo energético verificado de 3,87 J por decisión en H100. La licencia es propietaria y los pesos no son de descarga libre: el repositorio de Hugging Face es una liberación solo de metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone fusionado por SLERP (alpha = 0,85) + cabeza de decisión MLP residual (`verdict_head.pt`) |
| Parametros totales | 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (nativo), INT8 (edge), INT4 (pico) |
| Idiomas soportados | de, en, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (propietaria) |
| Formato de pesos | safetensors (BF16 nativo) + `verdict_head.pt`; pesos no descargables públicamente (liberación solo de metadatos) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone transformer de 4B parámetros cuyos pesos se fusionan mediante SLERP con alpha = 0,85, lo que produce un modelo único sin adaptadores PEFT (zero-PEFT standalone execution). Sobre la salida del backbone se acopla una cabeza de decisión MLP residual (`verdict_head.pt`) entrenada en bfloat16. El entrenamiento se ejecutó en el clúster RWTH Aachen CLAIX-2023 con 4x NVIDIA H100 80GB HBM3 (proyecto rwth2219). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

La innovación técnica principal es la función de pérdida simétrica S4, que impone invariancia bilateral al orden de presentación de los candidatos (A,B) frente a (B,A), alcanzando 99,97% de consistencia posicional. Adicionalmente, el modelo incorpora calibración conforme por split-conformal con umbral de riesgo alpha = 0,01, que emite tokens deterministas de abstención cuando la no conformidad excede los límites de seguridad. Se reporta una ganancia de calibración OOD de +8,82 pp (de 90,63% a 99,44%) sin reglas heurísticas externas.

## Capacidades

- Clasificación de decisiones y veredictos sobre pares de candidatos (pipeline `text-classification`).
- Evaluación LLM-as-a-judge y reward modeling con puntuación estricta de 4 vías.
- Invariancia a la posición de los candidatos gracias a la pérdida simétrica S4.
- Abstención calibrada conforme: emisión de `[ABSTAIN_HUMAN_REVIEW]` ante no conformidad elevada (EU AI Act Anexo IV).
- Cumplimiento normativo específico en suites KRITIS (Wave-11 y Wave-12), NIS-2, DORA y EU AI Act.
- Soporte multilingüe en alemán, inglés y polaco (pack de decisión polaco de 6 suites con 100% de acierto reportado).
- Invariancia de decisión entre cuantizaciones BF16, INT8 e INT4 (100% de acuerdo en 250 sondas).
- Despliegue en edge AI (Jetson Orin NX, HP ZGX Nano AI) con la variante INT4.
- No se documentan capacidades de generación libre de texto, tool calling, agentes ni visión.

## Casos de uso

- Auditoría de cumplimiento KRITIS: el modelo clasifica decisiones operativas contra los requisitos de las Waves 11 y 12 con precisión reportada del 100% en 3.900 ítems, integrándose en flujos de auditoría de infraestructuras críticas alemanas.
- Evaluación de pares en pipelines de RLHF: como reward model, puntúa respuestas candidatas con consistencia posicional del 99,97%, evitando el sesgo de orden que afecta a jueces generativos.
- Triaje con abstención en entornos regulados: gracias a la calibración conforme (alpha = 0,01), deriva casos dudosos a revisión humana mediante `[ABSTAIN_HUMAN_REVIEW]`, requisito habitual bajo el EU AI Act.
- Clasificación documental multilingüe DE/EN/PL: procesa documentación normativa y contractual en los tres idiomas con el mismo backbone, útil en entornos NIS-2 con operaciones transfronterizas.
- Despliegue en edge para infraestructura crítica: la variante INT4 (2,25 GB, 11,4 ms, 1,88 J por decisión) permite ejecutar veredictos en Jetson Orin NX sin conexión a la nube, manteniendo la soberanía del dato.
- Selección de proveedores y evaluación de riesgo DORA: el modelo compara candidatos (proveedores, configuraciones, políticas) con invariancia bilateral, adecuado para comités de riesgo que requieren trazabilidad.
- Monitorización energética de inferencia: la telemetría en Joules por decisión (3,87 J en H100 BF16) facilita informes de eficiencia y sostenibilidad en centros de datos regulados.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente, campo `verified: false` en el model-index):

| Benchmark | skopion-verdict-4b-v15.0-native | baselabs/mammoth-1-27b | basal-omni-1.0-ultra-31b | basal-omni-pico |
|---|---|---|---|---|
| Strict-54 External Mean (54 suites) | 94,04% | 94,26% | 93,50% | 74,00% |
| Strict-52-Verified Mean | 94,04% | 94,26% | 93,50% | — |
| KRITIS Wave-11 y Wave-12 (13 suites, 3.900 ítems) | 100,00% | 100,00% | 100,00% | — |
| Consistencia posicional bilateral (35 suites, 5.405 pares) | 99,97% (2 flips) | 98,19% (76 flips) | 97,59% (101 flips) | — |
| RewardBench 2 (4 vías estricto) | 93,33% (27B) / 89,33% (9B) / 89,00% (4B) | 91,00% | 89,67% | — |
| Polish 6-Suite Decision Pack (1.000+ ítems) | 100,00% | 99,17% | 98,89% | 74,00% |

Rendimiento por perfil de cuantización y hardware (datos del autor):

| Perfil | Dispositivo | Precisión | Memoria | Latencia | Energía (J/decisión) | Strict-54 |
|---|---|---|---|---|---|---|
| pico-int4 | Jetson Orin NX / HP ZGX Nano AI | INT4 | 2,25 GB | 11,4 ms | 1,88 J | 93,97% |
| edge-int8 | H100 / L40S / RTX | INT8 | 4,22 GB | 12,8 ms | 3,14 J | 94,02% |
| native | H100 80GB HBM3 | BF16 | 8,04 GB | 14,6 ms | 3,87 J | 94,04% |
| committee-v15.0 | H100 (cascada 82% 4B + 18% 27B) | BF16 | 60,4 GB | 28,4 ms | 8,38 J | 94,86% |
| 9b-v15.0 | H100 80GB HBM3 | BF16 | 18,3 GB | 29,5 ms | 8,55 J | 94,25% |
| 27b-v15.0 | H100 80GB HBM3 | BF16 | 54,8 GB | 78,0 ms | 26,52 J | 94,95% |

## Requisitos de hardware

- VRAM estimada: 8,04 GB en BF16, 4,22 GB en INT8, 2,25 GB en INT4.
- GPU recomendadas: NVIDIA H100 80GB HBM3 (objetivo primario), L40S, RTX Workstation para INT8/BF16.
- Edge: Jetson Orin NX y HP ZGX Nano AI para la variante INT4.
- Cabe en GPU de consumo: la variante INT4 (2,25 GB) es compatible con GPUs consumer de 8 GB o más; la BF16 requiere 10-12 GB.
- Opciones de despliegue: no se documentan frameworks específicos (vLLM, llama.cpp, TGI); la librería declarada es `transformers` y el pipeline `text-classification`. Los pesos no están disponibles públicamente, por lo que el despliegue requiere aprovisionamiento vía SKOPION.
- Latencia y throughput: 14,6 ms por decisión en H100 BF16; 12,8 ms en INT8; 11,4 ms en INT4 sobre Jetson Orin NX. Consumo de 3,87 J, 3,14 J y 1,88 J por decisión respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Strict-54 | Consistencia posicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| skopion-verdict-4b-v15.0-native | 4B | no disponible | 94,04% | 99,97% | Propietaria (SKOPION Sovereign KRITIS) | Solo metadatos; pesos bajo aprovisionamiento |
| baselabs/mammoth-1-27b | 27B | no disponible | 94,26% | 98,19% | no disponible | no disponible |
| basal-omni-1.0-ultra-31b | 31B | no disponible | 93,50% | 97,59% | no disponible | no disponible |
| basal-omni-pico | no disponible | no disponible | 74,00% | — | no disponible | no disponible |

La comparativa se limita a los modelos de referencia citados por el propio autor en la model card; no se dispone de información independiente sobre ellos ni de otros jueces de código abierto con los que contrastar.

## Limitaciones y advertencias

- Pesos no descargables: el repositorio de Hugging Face es una liberación solo de metadatos (model card, telemetría y manifiestos SHA-256); los safetensors y `verdict_head.pt` requieren aprovisionamiento a través de skopion.de para entidades verificadas de infraestructura crítica europea e investigación.
- Licencia propietaria: la SKOPION Sovereign KRITIS & Enterprise Audit License v1.0 restringe el uso comercial y limita el acceso a entidades verificadas; no es una licencia open source.
- Benchmarks no verificados: los resultados del model-index tienen `verified: false` y proceden del propio autor; no hay replicación independiente.
- Idiomas limitados: solo alemán, inglés y polaco; no se documenta soporte para castellano ni otras lenguas.
- Contexto no especificado: se desconoce la longitud máxima de contexto, lo que impide evaluar su idoneidad para documentos largos.
- Sesgos: no se documentan análisis de sesgo demográfico, lingüístico o cultural; al ser un modelo de decisión en entornos regulados, el riesgo de sesgo de selección es relevante y no está cuantificado.
- Riesgo de alucinación: al ser un clasificador con cabeza de decisión, el riesgo se traslada a falsos positivos/negativos en los veredictos; la abstención conforme mitiga pero no elimina este riesgo.
- Dependencia de la abstención: el umbral alpha = 0,01 debe recalibrarse sobre la distribución de producción; una calibración inadecuada puede degradar la garantía conforme.
- Sin soporte documentado de tool calling, agentes ni generación libre: no es sustituible por un LLM generativo en pipelines que requieran texto abierto.
- Fecha de creación futura (2026-11-05): el repositorio muestra una fecha de creación posterior a la actual, lo que sugiere metadatos inconsistentes o planificación de publicación; conviene verificar la vigencia antes de integrar.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-native
- Programa de investigación y aprovisionamiento: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Sitio del autor: https://skopion.de
- Dataset de evaluación: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites (referenciado en el model-index; no se proporciona URL directa)
- Paper, blog o repositorio adicional: no disponible
