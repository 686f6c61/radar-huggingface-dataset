# Guy-Amit/gemma4-e2b-safety-decision-lora-v1

## Resumen

El modelo `Guy-Amit/gemma4-e2b-safety-decision-lora-v1` es un adaptador LoRA entrenado sobre el modelo base `google/gemma-4-E2B-it` de Google. Lo desarrolla el usuario Guy-Amit y está diseñado específicamente para la API estructurada de decisión SystemOne, no para generación libre de texto. Su función es clasificar y emitir decisiones estructuradas (etiquetas legales, elecciones entre opciones y puntuaciones) en contextos de seguridad y cumplimiento, un caso de uso muy alejado del diálogo abierto.

El adaptador se entrenó sobre un dataset de decisión de 500.000 ejemplos y se distribuye como pesos PEFT en formato safetensors, con un tamaño de repositorio de 0,3 GB. La versión fusionada (merge) está publicada por el mismo autor en `Guy-Amit/gemma4-e2b-safety-decision`. Es relevante porque demuestra cómo un modelo base de tamaño pequeño (variante E2B de la familia Gemma 4) puede especializarse mediante LoRA para tareas de decisión con métricas de evaluación detalladas por formato y por fuente de datos.

La licencia es la Gemma License, lo que condiciona el uso comercial. El adaptador se integra tanto con PEFT/Transformers como con vLLM mediante `--enable-lora`, lo que facilita su despliegue en entornos de inferencia de alto rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 |
| Parámetros totales | no disponible (adaptador LoRA; base E2B de Gemma 4) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado sobre `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 en su variante E2B. No se especifica en la información disponible el rango del LoRA, los módulos objetivo ni los hiperparámetros de entrenamiento. El modelo base es un transformer condicional (`Gemma4ForConditionalGeneration`), lo que sugiere capacidades multimodales en el base, aunque el adaptador se orienta a decisión estructurada.

El entrenamiento se realizó sobre un dataset de decisión de 500.000 ejemplos, según indica la model card. No se detalla la composición exacta del dataset, el número de tokens, ni si hubo RLHF o DPO. La evaluación se realizó a través del endpoint SystemOne en vLLM, con métricas de accuracy top-1 y "target mass at prediction" (crédito parcial cuando el ejemplo tiene distribución de probabilidad sobre objetivos). El conjunto de test tuvo 50.181 ejemplos, procesados a 48,96 ejemplos por segundo.

## Capacidades

- Emisión de decisiones estructuradas en tres formatos: `noul` (etiqueta única), `choice` (elección entre opciones) y `score` (puntuación).
- Clasificación de seguridad y cumplimiento (fuentes como wildguard, civil_comments, aegis, policy_adherence_4k).
- Decisión sobre adherencia a políticas y evaluación de fallos de agentes (agent_failure_bench, stepguard, toolcall_guard).
- Clasificación de intención y diálogo (clinc150, banking77, oasst1).
- Razonamiento de sentido común y NLI (commonsense_qa, multi_nli, snli, qasc).
- Evaluación de calidad de respuestas (prometheus, ultrafeedback, helpsteer2).
- Tool calling y decisión sobre llamadas a herramientas (toolace, xlam).
- No está pensado para generación libre de texto; su salida es una decisión estructurada vía API SystemOne.

## Casos de uso

- Moderación de contenido automatizada: el adaptador clasifica comentarios y textos en etiquetas de seguridad (civil_comments con 98,16% de accuracy), adecuado para pipelines de filtrado previo a publicación.
- Guardrails de agentes de IA: evalúa si una acción de agente cumple políticas (agent_failure_bench 96,51%, policy_adherence_4k 96,83%), integrándose como paso de verificación antes de ejecutar herramientas.
- Verificación de llamadas a herramientas: decide si una llamada a función es válida o segura (toolace 99,30%, xlam 99,90%), útil en orquestadores de agentes con function calling.
- Clasificación de intención en atención al cliente: etiqueta consultas de usuario en dominios cerrados (clinc150 98,00%), aunque con cautela en dominios muy específicos como banking77 (14,00%).
- Detección de toxicidad y discurso dañino: clasifica textos según criterios de seguridad (wildguard 83,02%), para sistemas de revisión de comunidades.
- Evaluación de calidad de respuestas generadas: puntúa respuestas de otros modelos (prometheus 69,45%, ultrafeedback 57,45%) en pipelines de evaluación automática.
- Decisión de cumplimiento normativo: clasifica casos según políticas predefinidas (open_jev 88,25%), en flujos de revisión de cumplimiento.

## Benchmarks y rendimiento

Resultados del conjunto de test (50.181 ejemplos) vía endpoint SystemOne en vLLM:

| Split | Ejemplos | Loss | Accuracy | Target mass |
|:--|--:|--:|--:|--:|
| Overall | 50.181 | 0,6169 | 75,43% | 75,45% |
| noul | 14.132 | 0,2086 | 92,24% | 92,05% |
| choice | 11.989 | 0,4976 | 82,48% | 82,80% |
| score | 24.060 | 0,9163 | 62,04% | 62,03% |

Resultados destacados por fuente de datos:

| Fuente | Ejemplos | Accuracy |
|:--|--:|--:|
| xlam | 999 | 99,90% |
| toolace | 853 | 99,30% |
| qasc | 500 | 98,20% |
| oasst1 | 499 | 98,40% |
| civil_comments | 3.206 | 98,16% |
| clinc150 | 500 | 98,00% |
| agent_failure_bench | 229 | 96,51% |
| policy_adherence_4k | 757 | 96,83% |
| nemotron | 5.200 | 90,65% |
| open_jev | 6.909 | 88,25% |
| boolq | 229 | 86,90% |
| snli | 500 | 86,80% |
| tydiqa | 229 | 86,90% |
| arc | 200 | 85,50% |
| aegis | 688 | 85,03% |
| squad_v2 | 229 | 83,84% |
| wildguard | 2.985 | 83,02% |
| multi_nli | 500 | 83,00% |
| natural_questions | 229 | 74,67% |
| commonsense_qa | 500 | 72,20% |
| toolcall_guard | 412 | 70,63% |
| prometheus | 4.000 | 69,45% |
| dynabench | 219 | 65,75% |
| stepguard | 393 | 64,89% |
| helpsteer2 | 2.500 | 59,28% |
| ultrafeedback | 15.976 | 57,45% |
| banking77 | 500 | 14,00% |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; requiere cargar además el modelo base `google/gemma-4-E2B-it` completo.
- VRAM estimada para inferencia: no disponible (depende del tamaño del base E2B y de la cuantización elegida).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: soportado vía PEFT + Transformers y vLLM con `--enable-lora` y `--lora-modules decision=...`.
- Throughput medido en evaluación: 48,96 ejemplos por segundo en el endpoint SystemOne con vLLM.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Contexto | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma4-e2b-safety-decision-lora-v1 | LoRA de decisión | google/gemma-4-E2B-it | gemma | no disponible | 75,43% accuracy global (test propio) | Hugging Face |
| gemma4-e2b-safety-decision (merge) | Modelo fusionado | google/gemma-4-E2B-it | gemma | no disponible | no disponible | Hugging Face |
| google/gemma-4-E2B-it | Modelo base instruct | — | gemma | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El adaptador está diseñado exclusivamente para la API estructurada SystemOne; no debe usarse para generación libre de texto.
- Rendimiento muy bajo en dominios específicos: banking77 con 14,00% de accuracy indica escasa generalización a clasificación de intenciones bancarias.
- Accuracy global del 75,43%: inadecuado para decisiones de alta criticidad sin revisión humana.
- El formato `score` es el más débil (62,04%), frente a `noul` (92,24%) y `choice` (82,48%).
- Riesgo de alucinación en etiquetas no vistas durante el entrenamiento; no se documenta el vocabulario de decisiones.
- No se especifican sesgos conocidos ni composición demográfica del dataset de entrenamiento.
- Idiomas soportados no documentados; la evaluación incluye tydiqa (multilingüe) con 86,90%, pero sin desglose por idioma.
- Licencia Gemma: restricciones de uso comercial según los términos de Google; revisar antes de desplegar en producción.
- Solo 23 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy limitado.
- No se documentan hiperparámetros del LoRA ni el proceso de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face (adaptador LoRA): https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision-lora-v1
- Versión fusionada: https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
