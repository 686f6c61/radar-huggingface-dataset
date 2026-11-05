# SKOPION-Intelligence/skopion-verdict-committee-v15.0-native

## Resumen

SKOPION Verdict Committee v15.0 Native es un modelo de decisión y evaluación (llm-as-a-judge / reward model) desarrollado por SKOPION-Intelligence, orientado a la clasificación de veredictos en contextos de cumplimiento normativo europeo (KRITIS, NIS-2, EU AI Act). Se distribuye como un sistema en cascada especulativa denominada "System 1.5", que combina un backbone de 4B parámetros (82 % de las decisiones) con un segundo nivel de 27B parámetros (18 % restante), fusionados mediante SLERP (alpha = 0.85) y una cabeza residual MLP de veredicto (`verdict_head.pt`).

El modelo resuelve el problema de emitir decisiones binarias o comparativas auditables y reproducibles sobre pares de candidatos, con invariancia al orden de presentación (posición bilateral) y con garantías de abstención calibrada mediante predicción conforme (split-conformal, alpha = 0.01), que emite el token determinista `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad supera los límites de seguridad. Está entrenado en bfloat16 sobre el clúster RWTH Aachen CLAIX-2023 (4x NVIDIA H100 80GB HBM3).

Es relevante ahora porque aborda dos demandas crecientes: por un lado, la necesidad de sistemas de evaluación automática fiables para pipelines de LLM (RewardBench 2, judge benchmarks); por otro, los requisitos de auditabilidad y eficiencia energética que imponen marcos regulatorios europeos como el EU AI Act (Anexo IV) y NIS-2. Su licencia es propietaria y restringida a infraestructuras críticas verificadas y entidades de investigación europeas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada especulativa "System 1.5": backbone SLERP-fusionado (alpha = 0.85) + cabeza residual MLP de veredicto (`verdict_head.pt`) |
| Parametros totales | 4B (Gear-1, 82 %) + 27B (Gear-2, 18 %) en cascada; footprint de memoria 60,4 GB en BF16 |
| Parametros activos | No es MoE; cascada condicional (no disponible el ratio exacto de activación por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (nativo), INT8 (edge), INT4 (pico); invariancia de decisión verificada entre las tres |
| Idiomas soportados | de, en, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (propietaria, acceso restringido) |
| Formato de pesos | `.safetensors` (backbone) + `verdict_head.pt` (cabeza MLP); este repositorio es una release solo de metadatos |

## Arquitectura y entrenamiento

La arquitectura es una cascada especulativa de dos niveles ("System 1.5"): un modelo base de 4B parámetros resuelve la mayoría de las decisiones (82 %) y deriva al nivel de 27B (18 %) los casos de mayor incertidumbre. Los pesos se obtienen por fusión SLERP con alpha = 0.85, sobre los que se añade una cabeza residual MLP de veredicto entrenada en bfloat16. No se trata de un transformer monolítico convencional ni de un MoE, sino de un sistema de decisión con dos motores de distinta escala y una cabeza de clasificación específica.

El entrenamiento se realizó en el clúster RWTH Aachen CLAIX-2023 con 4x NVIDIA H100 80GB HBM3 (proyecto rwth2219). La innovación técnica destacable es la función de pérdida simétrica bilateral (S4), que penaliza la dependencia del orden de presentación de los candidatos (A,B) frente a (B,A), y la calibración conforme de abstención (split-conformal, alpha = 0.01) que garantiza cobertura estadística del riesgo. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación de texto para veredictos de decisión y evaluación (pipeline `text-classification`).
- Evaluación comparativa de pares de candidatos (llm-as-a-judge / reward model) con invariancia al orden de presentación.
- Emisión de decisiones con abstención calibrada: token determinista `[ABSTAIN_HUMAN_REVIEW]` bajo umbral conforme.
- Cumplimiento normativo especializado: suites KRITIS, NIS-2, DORA y EU AI Act Anexo IV.
- Capacidades multilingües en alemán, inglés y polaco.
- Ejecución en edge: variantes INT4 e INT8 con invariancia de decisión verificada frente a BF16.
- Auditoría energética por decisión (Joules/decision) y manifiestos de verificación SHA-256.
- No se documentan en la información disponible capacidades de generación libre, tool calling, agentes, visión ni audio.

## Casos de uso

- Evaluación automática de respuestas de LLM (judge): el modelo puede actuar como evaluador de pares de respuestas en pipelines de RLHF o de control de calidad, con invariancia al orden de presentación (99,97 % de consistencia bilateral) para evitar sesgos posicionales.
- Cumplimiento KRITIS/NIS-2: clasificación de decisiones sobre infraestructuras críticas europeas con abstención calibrada que deriva casos límite a revisión humana, adecuado por su cobertura conforme (alpha = 0.01).
- Auditoría de sistemas de IA según EU AI Act Anexo IV: emisión de veredictos documentables con manifiestos SHA-256 y telemetría energética, útil para expedientes de conformidad regulatoria.
- Despliegue en edge para entornos con restricciones de energía: la variante INT4 (2,25 GB, 1,88 J/decisión, 11,4 ms) permite ejecutar decisiones en dispositivos como Jetson Orin NX o HP ZGX Nano AI.
- Reward model en pipelines de entrenamiento: la variante de 27B (94,95 % en Strict-54) puede usarse como señal de recompensa en ajuste fino, con la variante 4B como filtro rápido previo.
- Moderación y clasificación multilingüe en Europa central: soporte nativo de alemán, inglés y polaco con 100 % en el pack de decisión polaco de 6 suites.
- Control de calidad en producción con latencia baja: 28,4 ms por decisión en la cascada completa sobre H100 permite integrarlo en flujos de decisión en tiempo casi real.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Benchmark | skopion-verdict-committee-v15.0-native | baselabs/mammoth-1-27b | basal-omni-1.0-ultra-31b | basal-omni-pico |
|---|---|---|---|---|
| Strict-54 External Mean (54 suites) | 94,86 % | 94,26 % | 93,50 % | 74,00 % |
| Wave-11 & Wave-12 KRITIS (13 suites, 3.900 items) | 100,00 % | 100,00 % | 100,00 % | no disponible |
| Consistencia bilateral de posición (35 suites, 5.405 pares) | 99,97 % (2 flips) | 98,19 % (76 flips) | 97,59 % (101 flips) | no disponible |
| RewardBench 2 (4-Way Strict) | 93,33 % (27B) / 89,33 % (9B) / 89,00 % (4B) | 91,00 % | 89,67 % | no disponible |
| Polish 6-Suite Decision Pack (1.000+ items) | 100,00 % | 99,17 % | 98,89 % | 74,00 % |

| Perfil | Precisión | Memoria | Latencia | Energía (J/decisión) | Strict-54 |
|---|---|---|---|---|---|
| 4B pico INT4 | INT4 | 2,25 GB | 11,4 ms | 1,88 J | 93,97 % |
| 4B edge INT8 | INT8 | 4,22 GB | 12,8 ms | 3,14 J | 94,02 % |
| 4B native | BF16 | 8,04 GB | 14,6 ms | 3,87 J | 94,04 % |
| Committee v15.0 native | BF16 | 60,4 GB | 28,4 ms | 8,38 J | 94,86 % |
| 9B native | BF16 | 18,3 GB | 29,5 ms | 8,55 J | 94,25 % |
| 27B native | BF16 | 54,8 GB | 78,0 ms | 26,52 J | 94,95 % |

## Requisitos de hardware

- Cascada completa (Committee v15.0 native): 60,4 GB en BF16, requiere GPU de 80 GB (H100 80GB HBM3 es el objetivo primario).
- Variante 27B nativa: 54,8 GB en BF16, cabe en H100 80GB, A100 80GB; no cabe en GPU consumer de 24 GB en BF16.
- Variante 9B nativa: 18,3 GB en BF16, cabe en RTX 4090 (24 GB) y A100 40GB.
- Variante 4B nativa: 8,04 GB en BF16, cabe en RTX 4090, RTX 3090 y GPUs de 12 GB o más.
- Variante 4B edge INT8: 4,22 GB, apta para L40S, RTX y GPUs de 8 GB.
- Variante 4B pico INT4: 2,25 GB, diseñada para HP ZGX Nano AI y Jetson Orin NX.
- Latencia verificada: 28,4 ms por decisión en cascada sobre H100; 11,4 ms en la variante INT4.
- Energía verificada: 8,38 J/decisión en cascada; 1,88 J/decisión en INT4.
- Opciones de despliegue: no se documentan en la información disponible frameworks como vLLM, llama.cpp, Ollama o TGI; la librería declarada es `transformers`. El acceso a pesos requiere aprovisionamiento vía skopion.de.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Strict-54 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skopion-verdict-committee-v15.0-native | 4B + 27B en cascada | no disponible | 94,86 % | Propietaria (KRITIS/Audit v1.0) | Restringida a entidades verificadas |
| baselabs/mammoth-1-27b | 27B | no disponible | 94,26 % | no disponible | no disponible |
| basal-omni-1.0-ultra-31b | 31B | no disponible | 93,50 % | no disponible | no disponible |
| basal-omni-pico | no disponible | no disponible | 74,00 % | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio de solo metadatos: los pesos neuronales no están publicados en HuggingFace; el acceso requiere aprovisionamiento mediante el programa de investigación de SKOPION.
- Licencia propietaria restrictiva (skopion-sovereign-kritis-audit-license-v1.0): el uso comercial está limitado a infraestructuras críticas europeas verificadas y entidades de investigación; no es apta para uso general sin acuerdo.
- Los benchmarks son declarados por el autor y marcados como no verificados (`verified: false`); no hay validación independiente disponible.
- Cobertura lingüística limitada a alemán, inglés y polaco; no se documenta soporte de castellano.
- No se documentan datos de sesgo, composición del dataset de entrenamiento ni número de tokens, lo que dificulta evaluar riesgos de alucinación o sesgo sistemático.
- La abstención calibrada mitiga pero no elimina el riesgo de decisiones erróneas en dominios fuera de distribución; los casos límite derivan a revisión humana.
- La cascada completa exige 60,4 GB de memoria, lo que descarta su despliegue en hardware consumer.
- No se especifica la longitud de contexto, lo que impide evaluar su idoneidad para documentos largos o conversaciones multi-turno extensas.
- El pipeline declarado es `text-classification`; no debe asumirse capacidad de generación de texto libre.

## Enlaces

- HuggingFace: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v15.0-native
- Programa de investigación y acceso: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Licencia: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Dataset de evaluación: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites (referenciado en la model card; no se dispone de URL directa verificada)
