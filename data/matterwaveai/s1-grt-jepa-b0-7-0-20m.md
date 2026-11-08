# MatterWaveAI/s1-grt-jepa-b0.7.0-20m

## Resumen

S1-GRT-JEPA-b0.7.0-20m es un modelo compacto de clasificación de texto publicado por MatterWaveAI como parte de la familia S1-GRT-JEPA, construido sobre el modelo base MatterWaveAI/helmholtz-b0.7.0-20m. Su función no es la generación de texto, sino actuar como juez de seguridad para agentes y como enrutador de acciones basado en control predictivo de modelos (MPC): antes de emitir una decisión APPROVE, REJECT o ESCALATE, o de seleccionar la siguiente llamada a herramienta de un agente, el modelo proyecta las acciones candidatas en un espacio latente ortogonal durante 1..H pasos y evalúa el estado predicho frente a invariantes de objetivo y seguridad.

El modelo se presenta como un world-model JEPA (Joint Embedding Predictive Architecture) con arquitectura de transformer rotacional, sin matrices lineales densas ni capas convolucionales, con aproximadamente 26,4 millones de parámetros almacenados y una capacidad equivalente densa de unos 66 millones. Opera sin decodificación autorregresiva de tokens y declara una invariancia exacta del 100,0 % al orden de las opciones, lo que lo hace adecuado como guardrail determinista en pipelines de agentes.

Es relevante ahora porque aborda dos problemas candentes en el despliegue de agentes: la selección segura de herramientas y la defensa frente a inyección de prompts y deriva de comportamiento. No obstante, la model card es una tarjeta de vista previa (b0.7.0) que retiene los pesos, los detalles de implementación y el código fuente durante un ciclo de liberación escalonado, de modo que el modelo no es actualmente utilizable de forma directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer rotacional con arquitectura JEPA (world-model); sin matrices lineales densas ni capas convolucionales |
| Parámetros totales | ~26,4 M almacenados (~66 M de capacidad equivalente densa) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en el ciclo de liberación escalonado) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer rotacional con el paradigma JEPA: en lugar de predecir tokens, el modelo codifica observaciones y acciones en un espacio latente ortogonal y predice el estado latente resultante tras 1..H pasos de rollout. La evaluación se realiza comparando ese estado predicho con invariantes de objetivo y seguridad, lo que permite emitir decisiones de aprobación, rechazo o escalado en una sola pasada y sin decodificación autorregresiva. El modelo declara cero matrices lineales densas y cero capas convolucionales, lo que explica su reducido número de parámetros almacenados frente a su capacidad equivalente densa.

Los datos de entrenamiento no están detallados en la información disponible: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La model card menciona un currículo de 24 horas y un horizonte de evaluación de 10 pasos (10C) en los resultados de SLM-Bench y GSM8K, así como un conjunto de evaluación XL-smol con 12 dominios y 17.130 registros de test retenidos. La innovación técnica destacable es la invariancia exacta al orden de opciones (100,0 % de consistencia) y la capacidad de verificación de rollouts latentes multi-paso sin generación de texto.

## Capacidades

- Clasificación de texto en modo juez de seguridad con salidas APPROVE, REJECT y ESCALATE.
- Enrutamiento de acciones de agente mediante control predictivo de modelos (MPC) con lookahead de 1..H pasos.
- Verificación de rollouts relacionales multi-hop (2..3 saltos) en espacio latente.
- Verificación de sentido común físico y científico causal.
- Verificación factual de un solo salto sobre un world-model.
- Verificación socrática y epistémica en cuatro modos (SEE, SAY, DO, KNOW).
- Inducción de reglas en rejillas visuales-espaciales 2D (evaluado sobre ARC-AGI-2 XL-smol).
- Defensa frente a inyección de prompts y deriva de comportamiento en agentes.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólico.
- Verificación booleana formal y de tablas de verdad.
- Programación de recursos y concurrencia.
- No se documenta soporte de tool calling generativo, agentes multi-paso generales ni capacidades multilingües.

## Casos de uso

- Guardrail de seguridad en agentes autónomos: el modelo evalúa cada acción candidata antes de ejecutarla y emite APPROVE, REJECT o ESCALATE, lo que permite bloquear acciones que violen invariantes de seguridad sin necesidad de decodificación generativa.
- Enrutamiento de llamadas a herramientas: dado un estado de agente y un conjunto de herramientas disponibles, el modelo selecciona la siguiente llamada mediante rollout latente de 1..2 pasos, adecuado para pipelines con herramientas acotadas y necesidad de baja latencia.
- Defensa frente a inyección de prompts: al proyectar el estado latente de la conversación y compararlo con invariantes, puede detectar derivas introducidas por contenido malicioso en las entradas del agente.
- Verificación de razonamiento multi-hop: útil como filtro de calidad en pipelines de recuperación aumentada, comprobando si una cadena de 2..3 saltos relacionales es consistente antes de aceptar la respuesta.
- Validación de terminación de programas generados: el modelo verifica si un bucle o programa generado por un LLM termina correctamente, lo que lo hace apto como paso de verificación en pipelines de generación de código.
- Comprobación de consistencia factual en asistentes: con una precisión del 87,40 % en verificación factual de un solo salto, puede usarse como capa de control antes de publicar respuestas factuales.
- Filtro de calibración y abstención: con un 75,00 % en calibración epistémica y abstención, puede decidir cuándo un agente debe declinar responder en lugar de alucinar.

## Benchmarks y rendimiento

Resultados de la suite XL-smol de verificación de rollouts latentes y enrutamiento MPC (12.003 registros retenidos / 29.609 preguntas):

| Suite de evaluación | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Verificación multi-hop (2..3 saltos) | 2.500 | 5.000 | 88,90 % | 95,20 % | 100,0 % |
| Ciencia causal y sentido común físico | 2.500 | 5.000 | 94,10 % | 97,60 % | 100,0 % |
| Verificación factual de un solo salto | 2.500 | 5.000 | 87,40 % | 93,10 % | 100,0 % |
| Verificación socrática y epistémica (4 modos) | 2.500 | 5.000 | 63,30 % | 92,10 % | 100,0 % |
| Inducción de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 1.200 | 3.600 | 55,50 % | 80,17 % | 100,0 % |
| Enrutamiento MPC de agente y defensa ante inyección | 803 | 2.409 | 66,25 % | 71,46 % | 100,0 % |
| Agregado de 6 suites (macro / micro) | 12.003 | 26.009 | 75,91 % / 78,69 % | 89,11 % | 100,0 % |

Evaluación consolidada de 12 dominios (17.130 registros de test retenidos / 44.287 preguntas):

| Dominio | Registros | Preguntas | Precisión | ECE |
|---|---:|---:|---:|---:|
| Multi-hop relacional | 2.500 | 5.000 | 88,90 % | 0,0964 |
| Ciencia causal y sentido común | 2.500 | 5.000 | 94,10 % | 0,0442 |
| Verificación factual de un solo salto | 2.500 | 5.000 | 87,40 % | 0,0568 |
| Verificación socrática (4 modos) | 2.500 | 5.000 | 63,30 % | 0,1045 |
| Inducción de reglas en rejilla 2D | 1.200 | 3.600 | 55,50 % | 0,1180 |
| Enrutamiento MPC y deriva | 803 | 2.409 | 66,25 % | 0,1984 |
| Calibración epistémica y abstención | 80 | 160 | 75,00 % | 0,0890 |
| Terminación de bucles de programa | 150 | 600 | 71,33 % | 0,0985 |
| Transiciones de estado simbólico | 60 | 180 | 70,00 % | 0,0960 |
| Grafo de prerrequisitos (v5) | 2.777 | 7.558 | 70,18 % | 0,0954 |
| Programación de recursos y concurrencia | 60 | 180 | 68,33 % | 0,1020 |
| Verificación booleana formal | 2.000 | 6.000 | 65,60 % | 0,1140 |
| Agregado de 12 dominios | 17.130 | 40.687 | 72,99 % macro / 75,62 % micro | 0,0912 medio |

Resultados en SLM-Bench y GSM8K (13.644 ejemplos):

| Benchmark | Split | Aleatorio | Currículo 24 h | Horizonte 10C |
|---|---|---:|---:|---:|
| BoolQ | val (3.270) | 50,00 % | 66,42 % | 73,19 % |
| QNLI | val (1.000) | 50,00 % | 78,40 % | 86,31 % |
| ARC-Easy | test (2.376) | 25,00 % | 37,84 % | 55,50 % |
| ARC-Challenge | test (1.172) | 25,00 % | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con ~26,4 M parámetros almacenados, la inferencia en fp32 requeriría del orden de 100 MB de pesos, pero la model card no publica requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por tamaño, cabría en cualquier GPU de consumo moderna, pero no se confirma en la información proporcionada.
- Opciones de despliegue: la model card indica compatibilidad con transformers y endpoints, pero los pesos están retenidos durante el ciclo de liberación escalonado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-GRT-JEPA-b0.7.0-20m | ~26,4 M almacenados (~66 M equiv.) | no disponible | JEPA world-model, guardrail y MPC | Apache 2.0 | Pesos retenidos |
| MatterWaveAI/helmholtz-b0.7.0-20m | no disponible | no disponible | Modelo base de clasificación de texto | no disponible en la información | no disponible |
| MatterWaveAI/s1-grt-jepa | no disponible | no disponible | Familia S1-GRT-JEPA | no disponible en la información | no disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Los pesos, los detalles de implementación y el código fuente están retenidos durante el ciclo de liberación escalonado; el modelo no es utilizable actualmente de forma directa.
- La model card es una tarjeta de vista previa (b0.7.0) y los resultados reportados no han sido verificados de forma independiente.
- La retención de pesos se justifica por el autor como prevención de evasión del guardrail en caja blanca, lo que limita la auditoría externa.
- El error de calibración (ECE) es elevado en enrutamiento MPC y deriva (0,1984) y en inducción de reglas 2D (0,1180), lo que implica confianza mal calibrada en esos dominios.
- La precisión en verificación socrática de 4 modos (63,30 %) y en enrutamiento MPC (66,25 %) es moderada y puede no ser suficiente para producción sin capas adicionales.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas.
- No se especifican restricciones adicionales de licencia para uso comercial más allá de Apache 2.0.
- El modelo no genera texto: no debe emplearse como LLM general ni como sustituto de un modelo conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-jepa-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-b0.7.0-20m
- Familia S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- Variante relacionada: https://huggingface.co/MatterWaveAI/helmholtz-s1-jepa-b0.7.0-20m
