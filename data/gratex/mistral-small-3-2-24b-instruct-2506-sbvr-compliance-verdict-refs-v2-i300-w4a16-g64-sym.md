# gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-verdict-refs-v2-i300-W4A16-g64-sym

## Resumen

Este modelo es la cuantización a 4 bits (W4A16, grupo 64, simétrica, formato *pack-quantized* de compressed-tensors) de un ajuste fino de Mistral-Small-3.2-24B-Instruct-2506 orientado a evaluar reglas de cumplimiento expresadas en SBVR (Semantics of Business Vocabulary and Business Rules). El autor es `gratex`, un perfil de HuggingFace que publica una campaña completa de modelos derivados del mismo ajuste, y el artefacto está pensado para despliegue en CUDA reduciendo el peso en memoria de unos 48 GB en bf16 a unos 15,4 GB.

El problema que aborda es concreto: dado un contexto documental y una regla, el modelo debe emitir un veredicto entre PASSED, FAILED o UNRESOLVABLE, con una política deliberada de no fallar una regla sin prueba positiva de violación y de derivar a UNRESOLVABLE cualquier evidencia ambigua, incompleta o con lenguaje dubitativo. El razonamiento debe citar los documentos fuente y las citas literales que sustentan la decisión.

Sobre la base Mistral Small 3.2 (arquitectura Mistral3, 24.011.361.280 parámetros totales según safetensors), el ajuste se realizó sobre un corpus de 1.647 registros de compliance con referencias reparadas (refs-v2). La relevancia actual es doble: por un lado muestra un caso de uso de evaluación normativa auditable; por otro, documenta el impacto medido de la cuantización 4 bits frente al modelo en 16 bits, con una pérdida media de 0,2 puntos porcentuales en las suites de precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mistral3 (transformer denso, base Mistral-Small-3.2-24B-Instruct-2506) |
| Parámetros totales | 24.011.361.280 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16, group size 64, simétrica, compressed-tensors pack-quantized (requiere CUDA) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-3.2-24B-Instruct-2506, un transformer denso de la familia Mistral3 con capacidad multimodal declarada por la clase `Mistral3ForConditionalGeneration` usada en el ejemplo de carga. Sobre esa base se aplicó un ajuste fino supervisado con datos de compliance, y el resultado en 16 bits se comprimió posteriormente a 4 bits mediante cuantización de pesos W4A16 con grupo de 64 y simetría, en el formato *pack-quantized* de compressed-tensors. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre el volumen total de tokens de entrenamiento.

El corpus de entrenamiento es `compliance-mixed-1647-refs-v2`, una revisión de 1.647 registros con etiqueta PASSED/FAILED/UNRESOLVABLE en la que cada registro incluye referencias ancladas a documentos (nombres de fuente y citas literales que respaldan el razonamiento gold). La revisión refs-v2 ajusta las citas a subcadenas reales del texto fuente, repara atribuciones y nombres de documentos y reetiqueta 13 conflictos materiales, alcanzando fidelidad de cita gold de 1.000 y cero documentos fantasma en el gold. Los registros se almacenan como `{id, context, rule, status, reasoning}` y el system prompt y el contrato de salida se inyectan en tiempo de ejecución. El split de test de 163 registros permaneció congelado durante toda la campaña.

## Capacidades

- Clasificación de cumplimiento en tres estados (PASSED, FAILED, UNRESOLVABLE) a partir de contexto documental y una regla SBVR.
- Razonamiento con citas: el modelo nombra los documentos fuente y reproduce citas literales de los hechos decisivos.
- Política de evidencia estricta: no emite FAILED sin prueba positiva de violación; la ausencia de datos no se interpreta como incumplimiento.
- Detección de patrones de irresolubilidad: ambigüedad con condiciones OR, unidades ambiguas, evidencia contradictoria, datos cuantitativos insuficientes, atributos o plazos ausentes, lenguaje dubitativo, entre otros 13 patrones documentados.
- Capacidades generales heredadas de Mistral Small 3.2: generación de texto, razonamiento, matemáticas y conocimiento de dominio, con rendimiento medido en suites HELM.
- Capacidad multimodal potencial por la clase de carga (`Mistral3ForConditionalGeneration`), si bien no se documenta su uso en este ajuste.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de cumplimiento normativo documental: dado un expediente y una regla SBVR, el modelo emite un veredicto trazable con citas literales, lo que permite revisión humana posterior y defensa ante auditorías.
- Triaje de expedientes incompletos: el modelo clasifica como UNRESOLVABLE los casos con evidencia insuficiente o ambigua (93,37 % en la evaluación de 1.432 ítems), evitando falsos positivos de incumplimiento en la cola de revisión.
- Verificación de contratos y políticas internas: comparación de cláusulas contra un catálogo de reglas, con extracción de la cita que sustenta cada PASSED o FAILED.
- Control de calidad de datos regulatorios: detección de conflictos entre documentos (patrón Conflicting Evidence, 88,79 % de acierto) antes de consolidar un expediente.
- Asistencia a equipos legales y de compliance: generación de borradores de dictamen con referencias documentales explícitas que el revisor puede validar línea a línea.
- Despliegue en infraestructura con VRAM limitada: al ocupar unos 15,4 GB en W4A16 frente a 48 GB en bf16, permite servir el modelo en una sola GPU de 24 GB para entornos de evaluación internos.
- Evaluación de reglas en pipelines batch: procesamiento de lotes de registros `{context, rule}` con salida estructurada de tres estados, integrable en flujos de validación previos a la publicación de datos.

## Benchmarks y rendimiento

Resultados HELM comparando el modelo ajustado (16 bits) con la base `mistralai/Mistral-Small-3.2-24B-Instruct-2506`:

| Suite | Base | Ajustado | Delta |
|---|---|---|---|
| truthful_qa | 0,6667 | 0,7462 | +0,0795 |
| boolq | 0,8690 | 0,9240 | +0,0550 |
| mmlu_pro:engineering | 0,3313 | 0,3478 | +0,0165 |
| bbq | 0,9040 | 0,9200 | +0,0160 |
| synthetic_reasoning | 0,9216 | 0,9361 | +0,0145 |
| mmlu_pro:physics | 0,3270 | 0,3360 | +0,0090 |
| mmlu_pro:math | 0,3400 | 0,3470 | +0,0070 |
| mmlu_pro:business | 0,3447 | 0,3473 | +0,0026 |
| mmlu_pro:health | 0,6394 | 0,6394 | 0,0000 |
| mmlu_pro:psychology | 0,6955 | 0,6942 | −0,0013 |
| mmlu_pro:chemistry | 0,3070 | 0,3040 | −0,0030 |
| mmlu_pro:computer_science | 0,5317 | 0,5244 | −0,0073 |
| mmlu_pro:philosophy | 0,5271 | 0,5170 | −0,0101 |
| mmlu_pro:history | 0,5879 | 0,5774 | −0,0105 |
| commonsense | 0,8260 | 0,8150 | −0,0110 |
| mmlu_pro:other | 0,5519 | 0,5390 | −0,0129 |
| mmlu_pro:economics | 0,6434 | 0,6303 | −0,0131 |
| mmlu_pro:law | 0,4300 | 0,4160 | −0,0140 |
| mmlu_pro:biology | 0,7657 | 0,7448 | −0,0209 |
| quac | 0,5760 | 0,5486 | −0,0274 |
| damaged_items_mc | — | 1,0000 | — |

Evaluación de patrones de irresolubilidad (dominio, 1.432 ítems), 93,37 % global (1.337/1.432):

| Patrón | Correctos | Total | % |
|---|---|---|---|
| Ambiguity with OR Condition | 89 | 90 | 98,89 % |
| Ambiguous Units | 24 | 26 | 92,31 % |
| Conditional Prerequisite Ambiguity | 79 | 88 | 89,77 % |
| Conflicting Evidence | 95 | 107 | 88,79 % |
| Insufficient Quantitative Data | 153 | 164 | 93,29 % |
| Missing Action Completion | 166 | 181 | 91,71 % |
| Missing Content Completeness | 109 | 112 | 97,32 % |
| Missing Identity | 28 | 34 | 82,35 % |
| Missing Specific Attribute | 128 | 134 | 95,52 % |
| Missing Timing | 243 | 263 | 92,40 % |
| Qualitative vs Quantitative Mismatch | 63 | 64 | 98,44 % |
| Sequence/Ordering Ambiguity | 121 | 126 | 96,03 % |
| Uncertainty/Hedging Language | 39 | 43 | 90,70 % |
| **Overall** | **1.337** | **1.432** | **93,37 %** |

Impacto de la cuantización 4 bits frente al modelo en 16 bits, según la model card:

| Métrica | 16 bits | 4 bits | Delta |
|---|---|---|---|
| Media de 22 suites de precisión | 61,45 % | 61,24 % | −0,2 pp |
| Media de suites generales | — | 81,35 % | +0,8 pp |
| Media MMLU-Pro por materia | — | 49,75 % | −0,8 pp |
| Evaluación de patrones irresolubles (1.432 ítems) | 88,55 % | 93,37 % | +4,8 pp |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 15,4 GB de pesos en W4A16, más overhead de activaciones y KV cache; el repo ocupa 15,4 GB frente a 48,0 GB del original en bf16.
- GPU recomendadas: cualquier GPU CUDA con al menos 24 GB de VRAM para uso cómodo (RTX 4090, L40S, A100 40/80 GB, H100). El modelo requiere CUDA según la model card.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) y en GPUs de 32 GB o más; con 16 GB el margen es insuficiente para contexto largo.
- Opciones de despliegue: `transformers` con `Mistral3ForConditionalGeneration` y `device_map='auto'`, más `compressed-tensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible; llama.cpp y Ollama no soportan este formato de cuantización tal cual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (W4A16) | 24,0 B | no disponible | W4A16 g64 sim | Apache 2.0 | Ajuste SBVR, 15,4 GB |
| `gratex/...-verdict-refs-v2-i300` (16 bits) | 24,0 B | no disponible | bf16 | Apache 2.0 | Mismo ajuste sin cuantizar, 48,0 GB |
| `gratex/...-unresolvable-pattern-finetune-v1` | 24,0 B | no disponible | no disponible | Apache 2.0 | Checkpoint de partida del ajuste v2 |
| `mistralai/Mistral-Small-3.2-24B-Instruct-2506` | 24,0 B | no disponible | bf16 | Apache 2.0 | Base generalista, sin ajuste de dominio |

## Limitaciones y advertencias

- El ajuste es de dominio muy específico (reglas SBVR sobre documentos); fuera de ese contrato de salida el modelo puede degradar su comportamiento respecto a la base.
- Riesgo de alucinación de citas o atribuciones documentales: aunque el entrenamiento refuerza citas literales, no hay garantía de que toda cita generada exista en el contexto de entrada.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Mistral Small 3.2 hereda los sesgos de la base, medidos parcialmente en bbq (0,9200).
- Idiomas soportados: no disponibles; el corpus de entrenamiento parece orientado a un dominio concreto, sin datos de cobertura multilingüe.
- Longitud de contexto: no disponible; conviene validar el comportamiento con contextos documentales largos antes de producción.
- La cuantización W4A16 requiere CUDA y el paquete `compressed-tensors`; no es portable a runtimes CPU habituales ni a formatos GGUF.
- El modelo no debe usarse como decisor final en cumplimiento regulatorio sin revisión humana: la propia política de UNRESOLVABLE indica que hay casos que el modelo deriva y que requieren juicio externo.
- Licencia Apache 2.0 permite uso comercial, pero el corpus de entrenamiento y su procedencia no se detallan, lo que conviene verificar antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-verdict-refs-v2-i300-W4A16-g64-sym
- Modelo 16 bits predecesor: https://huggingface.co/gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-verdict-refs-v2-i300
- Checkpoint de partida v1: https://huggingface.co/gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-unresolvable-pattern-finetune-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
