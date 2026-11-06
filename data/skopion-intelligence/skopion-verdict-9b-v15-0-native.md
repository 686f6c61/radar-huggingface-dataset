# SKOPION-Intelligence/skopion-verdict-9b-v15.0-native

## Resumen

SKOPION Verdict 9B v15.0 Native es un modelo de decisión y clasificación de texto (pipeline `text-classification`) especializado en tareas de *LLM-as-a-judge* y evaluación automatizada de conformidad normativa. Lo desarrolla SKOPION-Intelligence, con un enfoque explícito en infraestructura crítica europea (KRITIS, NIS-2, DORA) y en el cumplimiento del Reglamento Europeo de IA (EU AI Act). El modelo se presenta como un backbone transformer de 9B parámetros en BF16 nativo, fusionado mediante SLERP (`alpha = 0.85`) y con una cabeza de decisión MLP residual (`verdict_head.pt`) que produce veredictos binarios o comparativos entre candidatos.

La propuesta diferencial no es la generación de texto, sino la emisión de veredictos deterministas y auditables: incorpora calibración conformal (split-conformal con `alpha = 0.01`) que emite la etiqueta `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad supera el umbral de seguridad, y una pérdida simétrica `S4` que garantiza invariancia ante el orden de los candidatos (A,B) frente a (B,A). El modelo declara invariancia de decisión del 100 % entre BF16, INT8 y INT4 sobre 250 sondas de calibración, lo que facilita el despliegue en *edge* sin degradar el veredicto.

Es relevante ahora porque combina tres demandas crecientes en el ecosistema: evaluación automática fiable de sistemas LLM (judges), trazabilidad regulatoria con artefactos criptográficos SHA-256 y eficiencia energética medida en julios por decisión. No obstante, la distribución es restrictiva: el repositorio público es solo metadatos (model card, telemetría y manifiestos), y los pesos reales se provisionan bajo licencia soberana a entidades verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone fusionado por SLERP (`alpha = 0.85`) y cabeza de decisión MLP residual (`verdict_head.pt`) |
| Parametros totales | 9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo, Edge-INT8, Pico-INT4 (variantes 4B documentadas) |
| Idiomas soportados | de, en, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, uso restringido) |
| Formato de pesos | safetensors (BF16) y `verdict_head.pt`; pesos no incluidos en el repositorio público |

## Arquitectura y entrenamiento

El modelo parte de un backbone transformer de 9B parámetros que se fusiona mediante SLERP con `alpha = 0.85`, un método de interpolación esférica de pesos que combina dos checkpoints en el espacio de parámetros. Sobre ese backbone se acopla una cabeza de decisión MLP residual entrenada en `bfloat16`, que transforma la representación del par de candidatos en un veredicto. El entrenamiento se realizó en el clúster RWTH Aachen CLAIX-2023 HPC con 4× NVIDIA H100 80GB HBM3 (proyecto `rwth2219`).

La innovación técnica principal es la pérdida simétrica `S4`, diseñada para forzar invariancia ante el orden de presentación de los candidatos, junto con una calibración conformal de umbral (`alpha = 0.01`) que permite abstenerse de forma determinista. El autor declara una ganancia de +9,86 pp en *out-of-distribution* (de 89,58 % a 99,44 %) sin reglas heurísticas externas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión sobre pares de textos (juicio comparativo A frente a B) con invariancia de posición declarada del 99,97 %.
- Evaluación automática tipo *LLM-as-a-judge* y modelo de recompensa (*reward model*) para pipelines de alineamiento y ranking.
- Verificación de conformidad normativa: suites KRITIS, NIS-2, DORA y EU AI Act.
- Abstención calibrada: emisión de `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad supera el umbral conformal.
- Multilingüe en alemán, inglés y polaco, con un paquete de decisión específico en polaco (6 suites, más de 1.000 ítems).
- Inferencia en *edge* con invariancia de decisión entre BF16, INT8 e INT4.
- No se documentan capacidades de generación libre de texto, *tool calling*, agentes, visión ni audio.

## Casos de uso

- Auditoría de conformidad KRITIS/NIS-2: el modelo clasifica pares de evidencias documentales y emite un veredicto de cumplimiento con abstención automática ante casos límite, lo que permite integrarlo en flujos de auditoría con revisión humana obligatoria.
- Evaluación automática de respuestas de LLM en producción: actúa como juez comparativo entre dos respuestas candidatas, con invariancia de orden que evita el sesgo posicional típico de los jueces generativos.
- Modelo de recompensa para *fine-tuning*: genera señales de preferencia utilizables en pipelines de RLHF o DPO, con calibración conformal para descartar pares ambiguos.
- Triaje documental en infraestructura crítica: clasificación de incidencias y reportes regulatorios en alemán, inglés y polaco antes de escalado a analistas.
- Despliegue en *edge* para entornos con requisitos de soberanía: la variante INT4 (2,25 GB, 1,88 J por decisión) permite ejecutar veredictos en dispositivos tipo Jetson Orin NX sin salida de datos a la nube.
- Verificación de posiciones en procesos de decisión bilateral: la consistencia del 99,97 % en pares invertidos lo hace adecuado para sistemas de arbitraje o comparación de ofertas donde el orden de presentación no debe influir.
- Monitorización energética de pipelines de IA: la telemetría en julios por decisión permite presupuestar consumo en despliegues a gran escala.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y la model card (no verificados de forma independiente):

| Benchmark | skopion-verdict-9b-v15.0-native | baselabs/mammoth-1-27b | basal-omni-1.0-ultra-31b | basal-omni-pico |
|---|---|---|---|---|
| Strict-54 External Mean (54 suites) | 94,25 % | 94,26 % | 93,50 % | 74,00 % |
| Strict-52-Verified Mean | 94,25 % | 94,26 % | 93,50 % | no disponible |
| Wave-11 y Wave-12 KRITIS (13 suites, 3.900 ítems) | 100,00 % | 100,00 % | 100,00 % | no disponible |
| Consistencia bilateral de posición (35 suites, 5.405 pares) | 99,97 % (2 flips) | 98,19 % (76 flips) | 97,59 % (101 flips) | no disponible |
| RewardBench 2 (4-way strict) | 93,33 % (27B) / 89,33 % (9B) / 89,00 % (4B) | 91,00 % | 89,67 % | no disponible |
| Polish 6-Suite Decision Pack (1.000+ ítems) | 100,00 % | 99,17 % | 98,89 % | 74,00 % |

Matriz de eficiencia declarada por variante:

| Perfil | Dispositivo | Precisión | Memoria | Latencia | Energía | Strict-54 |
|---|---|---|---|---|---|---|
| 4B pico-int4 | HP ZGX Nano AI / Jetson Orin NX | INT4 | 2,25 GB | 11,4 ms | 1,88 J | 93,97 % |
| 4B edge-int8 | H100 / L40S / RTX | INT8 | 4,22 GB | 12,8 ms | 3,14 J | 94,02 % |
| 4B native | H100 80GB | BF16 | 8,04 GB | 14,6 ms | 3,87 J | 94,04 % |
| committee v15.0 | Cascada H100 (82 % 4B + 18 % 27B) | BF16 | 60,4 GB | 28,4 ms | 8,38 J | 94,86 % |
| 9B native | H100 80GB | BF16 | 18,3 GB | 29,5 ms | 8,55 J | 94,25 % |
| 27B native | H100 80GB | BF16 | 54,8 GB | 78,0 ms | 26,52 J | 94,95 % |

## Requisitos de hardware

- VRAM estimada para el modelo 9B en BF16: 18,3 GB según el autor; en INT8, 9,61 GB.
- GPU de referencia: NVIDIA H100 80GB HBM3 (objetivo primario) y NVIDIA L40S.
- Cabe en GPU de consumo: sí en BF16 con 24 GB o más (RTX 3090, RTX 4090), y en INT8 con 12-16 GB; las variantes 4B INT4 (2,25 GB) caben en dispositivos *edge* como Jetson Orin NX.
- Opciones de despliegue: la model card solo declara `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia declarada: 29,5 ms por decisión en H100 80GB BF16; 8,55 J por decisión. La variante 4B INT4 baja a 11,4 ms y 1,88 J.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Strict-54 | Consistencia bilateral | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| skopion-verdict-9b-v15.0-native | 9B | no disponible | 94,25 % | 99,97 % | SKOPION Sovereign KRITIS (restringida) | Solo metadatos; pesos bajo solicitud |
| baselabs/mammoth-1-27b | 27B | no disponible | 94,26 % | 98,19 % | no disponible | no disponible |
| basal-omni-1.0-ultra-31b | 31B | no disponible | 93,50 % | 97,59 % | no disponible | no disponible |
| basal-omni-pico | no disponible | no disponible | 74,00 % | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos de referencia citados por el propio autor en su model card; no se dispone de datos independientes sobre ellos ni de alternativas de la misma categoría (jueces y modelos de recompensa) con los que contrastar.

## Limitaciones y advertencias

- Los pesos no están publicados en el repositorio de Hugging Face: solo se distribuyen metadatos, telemetría y manifiestos SHA-256. El acceso a los safetensors requiere solicitud a entidades europeas verificadas de infraestructura crítica o investigación.
- Licencia propietaria (`skopion-sovereign-kritis-audit-license-v1.0`) con restricciones explícitas para uso comercial general; es imprescindible revisar los términos antes de cualquier despliegue.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; el propio `model-index` marca las métricas con `verified: false`.
- Cobertura lingüística limitada a alemán, inglés y polaco; no se documenta soporte de castellano.
- No se especifican la longitud de contexto, la composición del dataset de entrenamiento ni el proceso de alineamiento, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación no evaluado en la información disponible; el mecanismo de abstención conformal mitiga parcialmente los casos de baja confianza, pero no sustituye la revisión humana.
- El modelo está diseñado para clasificación y decisión, no para generación de texto libre; usarlo fuera de ese dominio no está soportado por la documentación.
- La latencia y el consumo energético se han medido en H100 80GB; el rendimiento en otras GPU puede diferir.
- Ausencia de soporte documentado para *tool calling*, agentes o multimodalidad.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v15.0-native
- Programa de investigación y acceso a pesos: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Sitio del autor: https://skopion.de
- Dataset de evaluación: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites (referenciado en el `model-index`; no se proporciona URL directa en la información disponible)
