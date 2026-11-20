# Guy-Amit/gemma4-e2b-safety-decision-lora

## Resumen

El modelo `gemma4-e2b-safety-decision-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Guy-Amit sobre el modelo base `google/gemma-4-E2B-it`. No se trata de un modelo de generación de texto libre, sino de un adaptador especializado en la producción de decisiones estructuradas para una API propietaria denominada SystemOne, orientada a tareas de seguridad y moderación. El adaptador se entrenó sobre un conjunto de datos de decisiones de 500.000 ejemplos y se distribuye únicamente como pesos PEFT en formato safetensors, con un tamaño de repositorio de 0,3 GB.

La relevancia de este artefacto radica en su enfoque: en lugar de optimizar el modelo para conversación abierta, lo reorienta hacia la clasificación y toma de decisiones con etiquetas legales predefinidas, cubriendo formatos de salida como `noul`, `choice` y `score`. Esto lo hace útil para pipelines de moderación, cumplimiento de políticas y evaluación automatizada de agentes, donde se requiere una salida estructurada y verificable en lugar de texto generativo.

El adaptador se apoya en la arquitectura multimodal `Gemma4ForConditionalGeneration` del modelo base, aunque la model card no detalla parámetros, contexto ni idiomas del modelo subyacente. La licencia es la Gemma License, lo que condiciona su uso comercial a los términos de dicha licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre `google/gemma-4-E2B-it` (Gemma4ForConditionalGeneration) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la información) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización dependerá del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma License) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se implementa como un módulo LoRA acoplado al modelo base `google/gemma-4-E2B-it`, que emplea la clase `Gemma4ForConditionalGeneration`, lo que sugiere una arquitectura transformer con capacidades multimodales (el nombre "ConditionalGeneration" es habitual en modelos que aceptan entradas de imagen y texto). El adaptador no modifica la arquitectura del modelo base, sino que inyecta matrices de bajo rango en las capas existentes, reduciendo drásticamente el número de parámetros entrenables y el tamaño del artefacto (0,3 GB).

El entrenamiento se realizó sobre un "500k decision dataset" según la model card, aunque no se especifican la composición exacta del dataset, el número de tokens, ni si se emplearon técnicas de RLHF o DPO. La evaluación se realizó a través de un endpoint vLLM de SystemOne, lo que indica que el adaptador está pensado para servirse con vLLM usando `--enable-lora`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Producción de decisiones estructuradas con etiquetas legales predefinidas, en lugar de generación de texto libre.
- Soporte de tres formatos de decisión: `noul` (clasificación simple), `choice` (selección entre opciones) y `score` (puntuación).
- Clasificación de seguridad y moderación de contenido (evaluado sobre `civil_comments`, `wildguard`, `aegis`).
- Detección de cumplimiento de políticas en agentes (evaluado sobre `ai_agent_security_policy_decisions`, `policy_adherence_4k`, `toolcall_guard`, `stepguard`).
- Clasificación de intenciones y diálogo (evaluado sobre `clinc150`, `banking77`, `oasst1`).
- Verificación de llamadas a herramientas y funciones (evaluado sobre `toolace`, `xlam`).
- Razonamiento de sentido común y NLI (evaluado sobre `commonsense_qa`, `multi_nli`, `snli`, `boolq`).
- No se documentan capacidades multilingües, de visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Moderación de contenido en plataformas: el adaptador puede clasificar comentarios y textos como seguros o inseguros con alta precisión en datasets como `civil_comments` (98,16%) y `wildguard` (83,02%), integrándose en pipelines de revisión automática previa a la publicación.
- Cumplimiento de políticas en agentes autónomos: con un 96,83% en `policy_adherence_4k` y 91,67% en `ai_agent_security_policy_decisions`, es adecuado para validar si las acciones de un agente respetan las reglas definidas antes de ejecutarlas.
- Verificación de llamadas a herramientas en asistentes: con 99,90% en `xlam` y 99,30% en `toolace`, puede usarse como capa de validación de argumentos y selección de funciones en sistemas de function calling.
- Clasificación de intenciones en atención al cliente: con 98,00% en `clinc150`, permite enrutar consultas de usuarios a los departamentos o flujos adecuados, aunque su bajo rendimiento en `banking77` (14,00%) limita su uso en dominios bancarios específicos.
- Evaluación automatizada de respuestas de LLM: con 69,45% en `prometheus` y 59,28% en `helpsteer2`, puede emplearse como juez parcial en pipelines de evaluación de calidad, siempre con supervisión humana.
- Detección de fallos en agentes: con 96,51% en `agent_failure_bench`, sirve para identificar ejecuciones defectuosas o incompletas en sistemas multi-paso y disparar reintentos o alertas.
- Filtrado de seguridad en generación de código o texto: integrado en un endpoint vLLM con `--enable-lora`, permite añadir una capa de decisión estructurada sin desplegar un modelo adicional completo.

## Benchmarks y rendimiento

Resultados del conjunto de test retenido (50.181 ejemplos) evaluados a través del endpoint vLLM de SystemOne. La precisión es top-1 sobre etiquetas legales de decisión; la masa objetivo en la predicción otorga crédito parcial cuando el ejemplo tiene una distribución de probabilidad sobre objetivos.

| Split | Ejemplos | Loss | Accuracy | Masa objetivo en predicción |
|:--|--:|--:|--:|--:|
| Overall | 50.181 | 0,6169 | 75,43% | 75,45% |

Por formato de decisión:

| Split | Ejemplos | Loss | Accuracy | Masa objetivo en predicción |
|:--|--:|--:|--:|--:|
| noul | 14.132 | 0,2086 | 92,24% | 92,05% |
| choice | 11.989 | 0,4976 | 82,48% | 82,80% |
| score | 24.060 | 0,9163 | 62,04% | 62,03% |

Por fuente de datos (selección):

| Split | Ejemplos | Loss | Accuracy | Masa objetivo en predicción |
|:--|--:|--:|--:|--:|
| aegis | 688 | 0,3558 | 85,03% | 85,03% |
| agent_failure_bench | 229 | 0,0874 | 96,51% | 96,51% |
| ai_agent_security_policy_decisions | 240 | 0,2622 | 91,67% | 91,67% |
| arc | 200 | 0,4571 | 85,50% | 85,50% |
| banking77 | 500 | 2,1037 | 14,00% | 14,00% |
| boolq | 229 | 0,3431 | 86,90% | 86,90% |
| civil_comments | 3.206 | 0,0869 | 98,16% | 97,31% |
| clinc150 | 500 | 0,0503 | 98,00% | 98,00% |
| commonsense_qa | 500 | 0,8079 | 72,20% | 72,20% |
| dynabench | 219 | 0,7022 | 65,75% | 65,75% |
| helpsteer2 | 2.500 | 0,9837 | 59,28% | 59,28% |
| multi_nli | 500 | 0,4630 | 83,00% | 83,00% |
| natural_questions | 229 | 0,5742 | 74,67% | 74,67% |
| nemotron | 5.200 | 0,2516 | 90,65% | 90,65% |
| oasst1 | 499 | 0,0720 | 98,40% | 98,40% |
| open_jev | 6.909 | 0,2732 | 88,25% | 88,75% |
| policy_adherence_4k | 757 | 0,0861 | 96,83% | 96,83% |
| prometheus | 4.000 | 0,7306 | 69,45% | 69,45% |
| qasc | 500 | 0,0609 | 98,20% | 98,20% |
| snli | 500 | 0,3876 | 86,80% | 86,80% |
| squad_v2 | 229 | 0,4024 | 83,84% | 83,84% |
| stepguard | 393 | 1,2583 | 64,89% | 64,89% |
| toolace | 853 | 0,0204 | 99,30% | 99,30% |
| toolcall_guard | 412 | 0,9736 | 70,63% | 70,63% |
| tydiqa | 229 | 0,3878 | 86,90% | 86,90% |
| ultrafeedback | 15.976 | 1,0269 | 57,45% | 57,45% |
| wildguard | 2.985 | 0,5926 | 83,02% | 83,02% |
| xlam | 999 | 0,0125 | 99,90% | 99,90% |

Throughput de evaluación: 48,96 ejemplos/segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador LoRA pesa 0,3 GB y debe cargarse junto al modelo base `google/gemma-4-E2B-it`, cuyo tamaño en VRAM depende de la cuantización elegida y no se documenta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de su cuantización.
- Opciones de despliegue: vLLM con `--enable-lora` y `--lora-modules decision=Guy-Amit/gemma4-e2b-safety-decision-lora`; también carga vía PEFT con `PeftModel.from_pretrained` sobre `Gemma4ForConditionalGeneration`.
- Latencia y throughput: se reporta un throughput de evaluación de 48,96 ejemplos/segundo a través del endpoint vLLM de SystemOne, sin especificar el hardware empleado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador está diseñado para una API propietaria (SystemOne) y no se han publicado comparaciones con otros adaptadores de decisión o modelos de moderación.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|:--|:--|:--|:--|:--|
| gemma4-e2b-safety-decision-lora | no disponible | no disponible | gemma | Hugging Face (PEFT) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador no está pensado para generación de texto libre: solo produce decisiones estructuradas para la API SystemOne, por lo que su uso fuera de ese contrato puede dar resultados degradados.
- Rendimiento muy bajo en `banking77` (14,00% de precisión), lo que indica una mala generalización a dominios de clasificación bancaria específicos.
- Rendimiento moderado en tareas de puntuación (`score`, 62,04%) y en evaluación de calidad (`ultrafeedback`, 57,45%; `helpsteer2`, 59,28%), lo que limita su uso como juez automático sin supervisión.
- Riesgo de alucinación y de etiquetas incorrectas en dominios no representados en el dataset de entrenamiento; no se documenta la composición del dataset de 500k ejemplos.
- No se documentan sesgos conocidos ni evaluación de sesgos; el uso en moderación debe auditarse por posibles disparidades entre grupos.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe.
- Licencia Gemma: el uso comercial está sujeto a los términos de la Gemma License, que impone restricciones y obligaciones de atribución; revisar antes de desplegar en producción.
- El adaptador depende del modelo base `google/gemma-4-E2B-it`; cualquier cambio o retirada del modelo base afecta a su funcionamiento.
- No hay información sobre latencia, VRAM ni hardware de referencia, lo que dificulta la planificación de capacidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Versión fusionada (merged): https://huggingface.co/Guy-Amit/gemma4-e2b-safety-decision
- Librería PEFT: https://github.com/huggingface/peft
- vLLM (servido con LoRA): https://github.com/vllm-project/vllm
- Licencia Gemma: https://ai.google.dev/gemma/terms
