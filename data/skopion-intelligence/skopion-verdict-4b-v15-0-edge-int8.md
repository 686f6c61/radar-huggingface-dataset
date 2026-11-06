# SKOPION-Intelligence/skopion-verdict-4b-v15.0-edge-int8

## Resumen
SKOPION Verdict 4B v15.0 Edge-INT8 es un modelo de decisión y clasificación textual de 4.000 millones de parámetros, desarrollado por SKOPION-Intelligence, orientado a tareas de "LLM-as-a-judge", modelos de recompensa y evaluación de cumplimiento normativo en infraestructuras críticas europeas. Su función principal es emitir veredictos binarios o comparativos (elegir entre candidatos A y B, validar cumplimiento KRITIS/NIS-2/DORA o marcar una decisión para revisión humana) con un sesgo de posición mínimo y una calibración conformal que permite abstenerse de forma determinista.

El modelo se distribuye como un artefacto INT8 de 4,22 GB, con backbone fusionado por SLERP y una cabeza MLP residual de veredicto, entrenado en la HPC CLAIX-2023 de RWTH Aachen sobre 4 GPU H100. Está pensado para despliegue en el borde (NVIDIA L40S, RTX, IPC industrial con AVX-512 VNNI) con una latencia declarada de 12,8 ms y un consumo de 3,14 julios por decisión, lo que lo sitúa en la categoría de modelos pequeños y eficientes para auditoría automatizada.

Su relevancia actual radica en el contexto regulatorio europeo (EU AI Act, NIS-2, KRITIS): ofrece una ruta de verificación criptográfica, telemetría de evaluación de 56 suites y una licencia soberana restringida a entidades europeas verificadas. No obstante, el repositorio de Hugging Face es una publicación solo de metadatos: los pesos neuronales no están disponibles públicamente y deben solicitarse a través de skopion.de.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone fusionado por SLERP (alpha = 0,85) y cabeza MLP residual de veredicto (`verdict_head.pt`) |
| Parametros totales | 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 group-wise simétrica (esta versión); INT4 (variante pico); BF16 (variante native) |
| Idiomas soportados | de, en, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, uso restringido a entidades verificadas) |
| Formato de pesos | `.safetensors` (backbone) y `verdict_head.pt` (cabeza); no publicados en el repositorio |

## Arquitectura y entrenamiento
El modelo parte de un backbone transformer de 4B parámetros cuyos pesos se obtuvieron mediante fusión SLERP (alpha = 0,85) de modelos previos, al que se añade una cabeza MLP residual específica de veredicto entrenada en bfloat16. El entrenamiento se realizó en la HPC CLAIX-2023 de RWTH Aachen (proyecto rwth2219) sobre 4 GPU NVIDIA H100 de 80 GB HBM3. La model card declara una pérdida simétrica bilateral (S4) diseñada para garantizar invariancia al orden de los candidatos, y una calibración split-conformal con umbral alpha = 0,01 que produce la emisión determinista del token `[ABSTAIN_HUMAN_REVIEW]` cuando la no conformidad supera los límites de seguridad.

La cuantización INT8 group-wise simétrica reduce la huella a 4,22 GB manteniendo, según el autor, una invariancia de decisión del 100 % frente a BF16 en 250 sondas bilaterales de calibración, con una deriva máxima de probabilidad de 0,001255. No se detalla en la información disponible la composición exacta del dataset de entrenamiento, el número de tokens ni si se aplicaron fases de RLHF o DPO; la model card se centra en los artefactos de verificación y en la telemetría de evaluación.

## Capacidades
- Clasificación y decisión textual: emisión de veredictos binarios o comparativos entre pares de candidatos (A frente a B), con invariancia al orden de presentación.
- LLM-as-a-judge: evaluación automática de respuestas generadas por otros modelos, con puntuación y selección del mejor candidato.
- Modelo de recompensa: adecuado para pipelines de evaluación y ranking en entrenamiento por preferencias.
- Cumplimiento normativo: validación de casos KRITIS, NIS-2 y EU AI Act, con suites específicas declaradas al 100 % de acierto en las olas Wave-11 y Wave-12.
- Abstención calibrada: emisión determinista de `[ABSTAIN_HUMAN_REVIEW]` mediante calibración conformal cuando la confianza no alcanza el umbral.
- Multilingüe: alemán, inglés y polaco, con un paquete específico de decisión en polaco declarado al 100 %.
- Despliegue en el borde: cuantización INT8 con latencia declarada de 12,8 ms y 3,14 J por decisión en L40S, RTX e IPC industrial.
- No se declara soporte de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso
- Auditoría de cumplimiento KRITIS: el modelo evalúa descripciones de incidentes o configuraciones de sistemas críticos y emite un veredicto de conformidad, con abstención automática cuando el caso queda fuera de la distribución calibrada; encaja por sus suites específicas y su umbral conformal.
- Evaluación automática de respuestas de LLM: en un pipeline de selección de modelos, se usa como juez que compara pares de respuestas (A/B) con invariancia al orden, lo que reduce el sesgo de posición documentado en jueces generativos.
- Modelo de recompensa para RLHF/DPO: se integra como señal de preferencia en el entrenamiento de modelos generativos, aprovechando su salida de veredicto y su consistencia bilateral del 99,97 %.
- Triaje documental en infraestructuras críticas: clasificación de informes y evidencias de auditoría NIS-2 en alemán, inglés o polaco, con derivación a revisión humana cuando el modelo se abstiene.
- Despliegue en IPC industrial: ejecución en hardware Siemens con AVX-512 VNNI o en NVIDIA L40S para decisiones en línea de 12,8 ms, adecuado para sistemas de control que requieren baja latencia y consumo contenido.
- Verificación regulatoria EU AI Act: uso como componente de evaluación documental (Anexo IV) con registro de decisiones y trazabilidad criptográfica SHA-256, orientado a auditorías internas y externas.
- Filtrado de candidatos en pipelines de anotación: descarte o priorización de pares de textos antes de la revisión humana, reduciendo el volumen de casos que llegan a un experto.

## Benchmarks y rendimiento
Datos declarados por el autor del modelo (no verificados de forma independiente, campo `verified: false` en el model-index):

| Benchmark | skopion-verdict-4b-v15.0-edge-int8 | baselabs/mammoth-1-27b | basal-omni-1.0-ultra-31b | basal-omni-pico |
|---|---|---|---|---|
| Strict-54 External Mean (54 suites) | 94,02 % | 94,26 % | 93,50 % | 74,00 % |
| Strict-52-Verified Mean | 94,02 % | 94,26 % | 93,50 % | no disponible |
| Wave-11 y Wave-12 KRITIS (13 suites, 3.900 ítems) | 100,00 % | 100,00 % | 100,00 % | no disponible |
| Consistencia posicional bilateral (35 suites, 5.405 pares) | 99,97 % (2 flips) | 98,19 % (76 flips) | 97,59 % (101 flips) | no disponible |
| RewardBench 2 (4-way estricto) | 93,33 % (27B) / 89,33 % (9B) / 89,00 % (4B) | 91,00 % | 89,67 % | no disponible |
| Polish 6-Suite Decision Pack (1.000+ ítems) | 100,00 % | 99,17 % | 98,89 % | 74,00 % |

Además, el autor declara latencia y energía por perfil de despliegue:

| Perfil | Dispositivo | Precisión | Memoria | Latencia | Energía | Strict-54 |
|---|---|---|---|---|---|---|
| pico-int4 | HP ZGX Nano AI / Jetson Orin NX | INT4 | 2,25 GB | 11,4 ms | 1,88 J | 93,97 % |
| edge-int8 (este modelo) | H100 / L40S / RTX | INT8 | 4,22 GB | 12,8 ms | 3,14 J | 94,02 % |
| native | H100 80GB HBM3 | BF16 | 8,04 GB | 14,6 ms | 3,87 J | 94,04 % |
| committee (cascada 82 % 4B + 18 % 27B) | H100 | BF16 | 60,4 GB | 28,4 ms | 8,38 J | 94,86 % |
| 9b native | H100 80GB HBM3 | BF16 | 18,3 GB | 29,5 ms | 8,55 J | 94,25 % |
| 27b native | H100 80GB HBM3 | BF16 | 54,8 GB | 78,0 ms | 26,52 J | 94,95 % |

## Requisitos de hardware
- VRAM estimada para inferencia: 4,22 GB en INT8 (este artefacto); 2,25 GB en la variante INT4; 8,04 GB en BF16.
- GPU recomendadas por el autor: NVIDIA L40S, H100, RTX y Siemens Industrial IPC con AVX-512 VNNI.
- Cabe en GPU de consumo: sí, la variante INT8 de 4,22 GB es compatible con RTX de gama media-alta; la INT4 de 2,25 GB está pensada para Jetson Orin NX y HP ZGX Nano AI.
- Opciones de despliegue: la model card cita `transformers` como librería; no se detalla compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput declarados: 12,8 ms por decisión en INT8 sobre L40S/H100/RTX; 11,4 ms en INT4; 14,6 ms en BF16 sobre H100. Consumo de 3,14 J por decisión en INT8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Strict-54 | Consistencia bilateral | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| skopion-verdict-4b-v15.0-edge-int8 | 4B | no disponible | 94,02 % | 99,97 % | Propietaria soberana (KRITIS) | Solo metadatos; pesos bajo solicitud |
| baselabs/mammoth-1-27b | 27B | no disponible | 94,26 % | 98,19 % | no disponible | no disponible |
| basal-omni-1.0-ultra-31b | 31B | no disponible | 93,50 % | 97,59 % | no disponible | no disponible |
| basal-omni-pico | no disponible | no disponible | 74,00 % | no disponible | no disponible | no disponible |

La comparativa se limita a los datos declarados por el autor en la model card; no se dispone de información independiente sobre los modelos de referencia ni sobre sus licencias o condiciones de acceso.

## Limitaciones y advertencias
- Pesos no publicados: el repositorio de Hugging Face es una publicación solo de metadatos; los archivos `.safetensors` y `verdict_head.pt` deben solicitarse a SKOPION y están restringidos a entidades europeas verificadas de infraestructura crítica e investigación.
- Licencia restrictiva: la `skopion-sovereign-kritis-audit-license-v1.0` no es una licencia open source; el uso comercial general no está permitido sin autorización expresa.
- Benchmarks no verificados: los resultados del model-index tienen `verified: false` y proceden del propio autor; no hay evaluación independiente publicada.
- Cobertura lingüística limitada: solo alemán, inglés y polaco; no se declara soporte de castellano ni de otras lenguas.
- Contexto no especificado: la longitud de contexto no está documentada, lo que impide planificar su uso en documentos largos sin pruebas previas.
- Riesgo de alucinación en modo generativo: aunque el pipeline es de clasificación, la emisión de tokens de abstención y veredictos requiere validación en producción; la calibración conformal mitiga pero no elimina el riesgo de decisiones erróneas.
- Sesgos potenciales: no se documentan análisis de sesgo demográfico, geográfico o lingüístico; la especialización en normativa europea puede introducir sesgo hacia marcos regulatorios de la UE.
- Dependencia de hardware específico: las cifras de latencia y energía se declaran para L40S, H100, RTX e IPC industrial con AVX-512 VNNI; el rendimiento en otras plataformas no está documentado.
- Trazabilidad: la licencia y el modelo están vinculados a un programa de investigación con verificación criptográfica SHA-256, lo que puede imponer requisitos adicionales de auditoría al integrador.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-edge-int8
- Programa de investigación y solicitud de pesos: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Licencia: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Dataset de evaluación: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites (referenciado en el model-index; no se ha podido confirmar URL pública)
- Artefactos de verificación citados en la model card: `PHASE36_37_38_V15_NATIVE_EDGE_JOULES_100PCT_VERIFIED.json`, `HARDWARE_ENERGY_JOULES_AND_QUANTIZATION_V15.json` (incluidos en el repositorio, no enlazados de forma individual)
