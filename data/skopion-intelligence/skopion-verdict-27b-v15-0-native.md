# SKOPION-Intelligence/skopion-verdict-27b-v15.0-native

## Resumen

SKOPION Verdict 27B v15.0 Native es un modelo de decisión y clasificación de texto desarrollado por SKOPION-Intelligence, diseñado específicamente para tareas de *LLM-as-a-judge*, modelos de recompensa y evaluación de conformidad normativa en el ámbito de infraestructuras críticas europeas. Con 27.000 millones de parámetros en precisión BF16 nativa, el modelo se posiciona como una alternativa soberana para la evaluación automática de decisiones en contextos regulados por KRITIS, NIS-2, DORA y el Reglamento Europeo de IA.

La arquitectura combina un backbone transformer fusionado mediante SLERP (alpha = 0.85) con una cabeza de decisión MLP residual (`verdict_head.pt`) entrenada en bfloat16 sobre el clúster RWTH Aachen CLAIX-2023 (4x NVIDIA H100 80GB HBM3). El modelo incorpora calibración conformal de abstención (alpha = 0.01) que emite tokens deterministas `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad supera los umbrales de seguridad, una innovación alineada con los requisitos del Anexo IV del EU AI Act.

La relevancia del modelo radica en su enfoque en invariancia posicional bilateral (99,97% de consistencia en pares intercambiados) y en la invariancia de decisión ante cuantización (100% de acuerdo exacto entre BF16, INT8 e INT4), lo que lo hace adecuado para despliegues en *edge* manteniendo la calidad de decisión. No obstante, los pesos neuronales no están disponibles públicamente: el repositorio es una liberación de metadatos con dossier de verificación criptográfica, y el acceso a los pesos requiere verificación como entidad europea de infraestructura crítica o investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone fusionado por SLERP (alpha = 0.85) y cabeza de decisión MLP residual (`verdict_head.pt`) |
| Parámetros totales | 27B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 nativo, INT8 (edge), INT4 (pico) |
| Idiomas soportados | alemán (de), inglés (en), polaco (pl) |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 |
| Formato de pesos | safetensors (BF16 nativo, 54,8 GB) + `verdict_head.pt` |

## Arquitectura y entrenamiento

El modelo parte de un backbone transformer fusionado mediante SLERP con coeficiente alpha = 0.85, sobre el que se añade una cabeza de decisión MLP residual entrenada específicamente para tareas de veredicto y clasificación. El entrenamiento se realizó en bfloat16 sobre el clúster RWTH Aachen CLAIX-2023, equipado con 4x NVIDIA H100 80GB HBM3, bajo el proyecto rwth2219. La ejecución es *standalone* sin PEFT, es decir, sin adaptadores de bajo rango: los pesos fusionados constituyen el modelo completo.

La innovación técnica principal es la función de pérdida simétrica S4 para invariancia posicional bilateral, que garantiza que el veredicto sea idéntico independientemente del orden de los candidatos comparados (A,B) frente a (B,A). Adicionalmente, el modelo incorpora calibración conformal de *split-conformal* con umbral de riesgo alpha = 0.01, que emite abstención determinista cuando la no conformidad supera los límites de seguridad. El modelo reporta una ganancia de calibración OOD puramente neuronal de +6,66 pp (de 91,67% a 98,33%) en suites de estrés multidominio, sin reglas heurísticas externas. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación de texto y emisión de veredictos en tareas de decisión binaria y comparativa (A vs B).
- Evaluación como *LLM-as-a-judge* y modelo de recompensa (*reward model*) para pipelines de RLHF y evaluación automática.
- Evaluación de conformidad normativa en el ámbito KRITIS, NIS-2, DORA y EU AI Act.
- Invariancia posicional bilateral: veredictos consistentes ante el intercambio de orden de los candidatos.
- Abstención calibrada conforme al Anexo IV del EU AI Act mediante tokens `[ABSTAIN_HUMAN_REVIEW]`.
- Capacidades multilingües en alemán, inglés y polaco.
- Invariancia de decisión ante cuantización: 100% de acuerdo exacto entre BF16, INT8 e INT4 en 250 sondas de calibración bilaterales.
- No se menciona soporte de *tool calling*, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- **Evaluación de conformidad KRITIS en infraestructuras críticas**: el modelo puede clasificar y emitir veredictos sobre documentación de cumplimiento normativo en los sectores regulados por KRITIS y NIS-2, con abstención automática cuando la confianza no alcanza el umbral conformal, derivando a revisión humana.
- **Judge automático en pipelines de evaluación de LLMs**: gracias a su invariancia posicional del 99,97%, puede emplearse como evaluador de pares de respuestas generadas por otros modelos sin sesgo de orden, integrándose en *frameworks* de evaluación comparativa.
- **Modelo de recompensa en RLHF**: su rendimiento en RewardBench 2 (93,33% en modo estricto de 4 vías) lo hace adecuado para puntuar respuestas en procesos de ajuste por preferencias humanas.
- **Auditoría de decisiones algorítmicas en entornos regulados**: la emisión de tokens de abstención calibrados permite construir sistemas de decisión asistida que cumplan con los requisitos de supervisión humana del EU AI Act.
- **Despliegue en edge para verificación en tiempo real**: las variantes INT8 e INT4 mantienen el 100% de acuerdo de decisión con BF16, permitiendo su uso en dispositivos como Jetson Orin NX o HP ZGX Nano AI con latencias de 11,4 a 12,8 ms por decisión.
- **Evaluación multilingüe de documentación regulatoria**: con soporte para alemán, inglés y polaco, puede procesar documentación normativa en los tres idiomas, incluyendo el paquete polaco de 6 suites con 100% de precisión reportada.
- **Cascada de comités de decisión**: la variante *committee* (82% modelo 4B + 18% modelo 27B) permite construir sistemas de decisión en cascada que alcanzan 94,86% de precisión con 28,4 ms de latencia y 8,38 J por decisión.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | SKOPION 27B v15.0 | baselabs/mammoth-1-27b | basal-omni-1.0-ultra-31b | basal-omni-pico |
|---|---|---|---|---|
| Strict-54 External Mean (54 suites) | 94,95% | 94,26% | 93,50% | 74,00% |
| Strict-52-Verified Mean | 94,95% | 94,26% | 93,50% | — |
| Wave-11 & Wave-12 Sovereign KRITIS (13 suites, 3.900 items) | 100,00% | 100,00% | 100,00% | — |
| Bilateral Position Consistency (35 suites, 5.405 pares) | 99,97% (2 flips) | 98,19% (76 flips) | 97,59% (101 flips) | — |
| RewardBench 2 (4-Way Strict) | 93,33% (27B) / 89,33% (9B) / 89,00% (4B) | 91,00% | 89,67% | — |
| Polish 6-Suite Decision Pack (1.000+ items) | 100,00% | 99,17% | 98,89% | 74,00% |

Rendimiento por perfil de despliegue:

| Perfil | Dispositivo | Precisión | Memoria | Latencia | Energía (J/decisión) | Strict-54 |
|---|---|---|---|---|---|---|
| 4B pico-int4 | HP ZGX Nano AI / Jetson Orin NX | INT4 | 2,25 GB | 11,4 ms | 1,88 J | 93,97% |
| 4B edge-int8 | H100 / L40S / RTX | INT8 | 4,22 GB | 12,8 ms | 3,14 J | 94,02% |
| 4B native | H100 80GB HBM3 | BF16 | 8,04 GB | 14,6 ms | 3,87 J | 94,04% |
| Committee (82% 4B + 18% 27B) | H100 | BF16 | 60,4 GB | 28,4 ms | 8,38 J | 94,86% |
| 9B native | H100 80GB HBM3 | BF16 | 18,3 GB | 29,5 ms | 8,55 J | 94,25% |
| 27B native | H100 80GB HBM3 | BF16 | 54,8 GB | 78,0 ms | 26,52 J | 94,95% |

## Requisitos de hardware

- **VRAM para inferencia en BF16**: 54,8 GB de huella de memoria, lo que requiere una GPU con al menos 60-80 GB de VRAM (H100 80GB HBM3, A100 80GB).
- **GPU recomendadas**: NVIDIA H100 80GB HBM3 es el objetivo principal verificado. Una A100 80GB sería el mínimo para BF16 nativo.
- **Consumer GPU**: el modelo de 27B en BF16 no cabe en GPUs de consumo (RTX 4090 con 24 GB). Las variantes cuantizadas del mismo programa (4B INT8/INT4) sí caben en GPUs de consumo y en dispositivos *edge* como Jetson Orin NX.
- **Cuantización**: se reporta invariancia de decisión del 100% entre BF16, INT8 e INT4, aunque las variantes cuantizadas publicadas corresponden al modelo de 4B, no al de 27B.
- **Opciones de despliegue**: la información disponible menciona compatibilidad con `transformers` y endpoints. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: 78,0 ms por decisión en H100 80GB HBM3 con un consumo de 26,52 J por decisión. El modelo de 4B en INT4 alcanza 11,4 ms y 1,88 J por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Strict-54 | RewardBench 2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SKOPION Verdict 27B v15.0 | 27B | no disponible | 94,95% | 93,33% | Soberana KRITIS (acceso restringido) | Metadatos públicos; pesos bajo solicitud |
| baselabs/mammoth-1-27b | 27B | no disponible | 94,26% | 91,00% | no disponible | no disponible |
| basal-omni-1.0-ultra-31b | 31B | no disponible | 93,50% | 89,67% | no disponible | no disponible |
| basal-omni-pico | no disponible | no disponible | 74,00% | — | no disponible | no disponible |

Los modelos de referencia (mammoth-1-27b, basal-omni-1.0-ultra-31b y basal-omni-pico) se emplean como comparadores en la propia model card del autor, pero no se dispone de información adicional sobre su arquitectura, licencia o disponibilidad en la información proporcionada.

## Limitaciones y advertencias

- **Acceso restringido a pesos**: el repositorio es una liberación de metadatos; los pesos en safetensors y la cabeza de decisión no son de descarga pública. El acceso requiere verificación como entidad europea de infraestructura crítica (KRITIS/NIS-2/DORA) o de investigación a través del sitio web del autor.
- **Licencia no comercial estándar**: la licencia `skopion-sovereign-kritis-audit-license-v1.0` no es una licencia de código abierto y restringe el uso a entidades verificadas; no se detallan los términos completos en la información disponible.
- **Cobertura idiomática limitada**: solo alemán, inglés y polaco. No se reporta soporte para castellano ni otros idiomas.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible.
- **Riesgo de alucinación**: al ser un modelo de clasificación y decisión, el riesgo se manifiesta como veredictos incorrectos; la calibración conformal mitiga parcialmente este riesgo mediante abstención, pero no se reportan tasas de error fuera de las suites evaluadas.
- **Benchmarks no verificados**: los resultados del model-index están marcados como `verified: false`; son datos declarados por el autor sin validación independiente.
- **Contexto no especificado**: no se indica la longitud máxima de contexto, lo que impide evaluar su idoneidad para documentos regulatorios extensos.
- **Ecosistema limitado**: sin integraciones documentadas con herramientas estándar de despliegue (vLLM, llama.cpp, Ollama, TGI), lo que puede dificultar la puesta en producción.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-05, lo que debe tenerse en cuenta al evaluar la madurez y el historial del modelo.

## Enlaces

- [Hugging Face: SKOPION-Intelligence/skopion-verdict-27b-v15.0-native](https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v15.0-native)
- [Programa de investigación SKOPION Verdict KI](https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm)
- [Sitio principal de SKOPION](https://skopion.de)
- Dataset de evaluación: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites (referenciado en el model-index, sin URL directa en la información disponible)
