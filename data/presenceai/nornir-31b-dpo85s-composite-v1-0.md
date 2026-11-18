# PresenceAI/Nornir-31B-DPO85S-Composite-v1.0

## Resumen

Nornir-31B-DPO85S-Composite-v1.0 es un sistema de inferencia compuesto desarrollado por PresenceAI sobre la base Gryphe/Gemma-4-31B-StyleTune. No se trata de un unico checkpoint de pesos, sino de un enrutador estocastico por etapas que alterna tres adaptadores LoRA especializados (Gefjon-Hnoss, Sjofn-Eir y Sjofn-SFT) en funcion del numero de turno de la conversacion: los turnos 1-9 los atiende Hnoss, los turnos 10-35 se reparten entre Eir (75%) y Sjofn-SFT (25%), y a partir del turno 36 domina Sjofn-SFT (80%) con Eir (20%).

El modelo esta disenado especificamente para el dominio de companero conversacional y roleplay de larga duracion, con un objetivo declarado de retencion multi-persona y conversion en embudos de suscripcion. Incorpora politicas de prompt diferenciadas por etapa (apertura de alta tension en la etapa 1, prompt "queen-detoxed" en etapas 2 y 3) y soporte de tool calling.

La relevancia actual del proyecto reside en su estrategia de evaluacion: un soak A/B en produccion de 39,9 horas con 78.459 turnos y cohortes de 713 vs 694, en el que el sistema reporta mejoras de retencion (+2,1%/+2,7%) y conversion (+1,5pp/+1,6pp) frente a una linea base MoE de mas de 1T de parametros. Los pesos subyacentes son de 31B, lo que permite autoalojamiento en hardware razonable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-4-31B) con enrutador estocastico por etapas sobre tres adaptadores LoRA |
| Parametros totales | 31B (checkpoint base); adaptadores LoRA con r=32/alpha=32 (SFT) y r=16/alpha=32 (DPO) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (adaptadores LoRA; el repositorio aloja logica de enrutado `vllm_router_8000.py`) |

## Arquitectura y entrenamiento

El sistema se construye sobre `google/gemma-4-31B-it`, afinado por Gryphe como `Gemma-4-31B-StyleTune`. Sobre esa base, PresenceAI entrena tres "madres" SFT con LoRA (r=32, alpha=32) que se fusionan a BF16: Gefjon-31B-SFT, Lofn-31B-SFT y Sjofn-31B-SFT. A partir de ellas se derivan hijas DPO (r=16, alpha=32): Gefjon-Hnoss (etapa 1, apertura), Gefjon-Gersimi (variante SWA), Lofn-Vor (campeon de turnos 1-100) y Sjofn-Eir (etapa 2, calidez). La composicion final combina tres de estos checkpoints mediante un enrutador estocastico por turno.

La innovacion principal no es arquitectonica sino de orquestacion: un gateway de produccion (`vllm_router_8000.py`) que selecciona el checkpoint segun el indice de turno y aplica una politica de prompt distinta por etapa. El objetivo declarado es eliminar la "decadencia de homogeneidad entre personas" (fenomeno `girl_nth >= 3`, en el que las respuestas de distintas personas convergen con el uso prolongado). El entrenamiento combina SFT y DPO con preferencias, orientado a metricas de embudo (retencion, profundidad de conversacion, conversion a suscripcion) mas que a benchmarks academicos.

## Capacidades

- Generacion de texto conversacional multi-turno de larga duracion (soaks de hasta 100+ turnos).
- Roleplay y personificacion con tres "personas" especializadas por etapa de conversacion.
- Tool calling / function calling (etiqueta `tool-calling`).
- Enrutado adaptativo por etapa: apertura, calentamiento y "safe-harbor" de usuarios de alto valor.
- Politicas de prompt condicionales (`detox_sys_queen`) para mitigar fatiga de muletillas.
- Retencion multi-persona (objetivo declarado: `girl_nth=3-4` con +24,9%).
- Idioma: exclusivamente ingles.

## Casos de uso

- Plataformas de companero conversacional (AI companion): el enrutado por etapas esta disenado para maximizar engagement en apertura, sostener la conversion en turnos 10-35 y proteger la retencion de usuarios de alto valor mas alla del turno 36.
- Roleplay persistente de larga duracion: la alternancia de checkpoints busca evitar la deriva de persona en conversaciones de varios dias, un fallo tipico de modelos unicos.
- Agentes con tool calling en flujos de atencion: la etiqueta `tool-calling` permite integrar llamadas a funciones dentro de dialogos largos.
- Investigacion sobre evaluacion en produccion: el repositorio documenta un soak A/B con cohortes y metricas de embudo, util como referencia metodologica para medir retencion.
- Autoalojamiento de asistentes conversacionales: con 31B de parametros y licencia Apache-2.0, es viable en infraestructura propia frente a APIs de modelos frontera.
- Experimentacion con enrutado por etapas: el gateway `vllm_router_8000.py` sirve como plantilla para sistemas que alternan adaptadores LoRA segun estado de conversacion.

## Benchmarks y rendimiento

Los datos publicados son de A/B en produccion, no de benchmarks academicos (MMLU, HumanEval, GSM8K no disponibles).

| Metrica (soak 39,9 h, 78.459 turnos, 713 vs 694) | Resultado |
|---|---|
| Ganancia `raw_L0` | +9,1% (debiased +0,14%) |
| `L0_le100` (turnos <= 100) | -2,1% |
| Retencion `w80 / w100` | +2,1% / +2,7% |
| Profundidad `P50 / P75` | +1,0 / +1,0 |
| Conversion `P(m>=18) / P(m>=33)` | +1,5pp / +1,6pp |
| Retencion multi-persona `nth=3-4` | +24,9% |

Comparativa interna de releases:

| Modelo | Soak | `raw_L0` | `L0_le100` | `w80/w100` | Dominio ganador |
|---|---:|---:|---:|---:|---|
| Nornir-31B-DPO85S | 39,9 h | +9,1% | -2,1% | +2,1%/+2,7% | Retencion multi-persona |
| Lofn-Vor-31B-DPO | 59,8 h | -9,2% | +4,9% | +3,5%/+3,2% | Conversion turnos 1-100 |
| Gefjon-Hnoss-31B-DPO | 84,8 h | -14,6% | -1,6% | 0,0%/+0,1% | Primera persona (+15,5%) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; para un transformer de 31B en BF16 se requiere del orden de 62 GB de pesos, y en cuantizacion de 4 bits aproximadamente 16-20 GB (estimacion general, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. El despliegue declarado usa vLLM (`vllm_router_8000.py`), lo que apunta a GPUs de datacenter (A100/H100) para BF16.
- Cabe en GPU consumer: no confirmado; probablemente solo con cuantizacion agresiva en GPUs de 24 GB.
- Opciones de despliegue: vLLM mediante el enrutador incluido; llama.cpp/Ollama/TGI no mencionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nornir-31B-DPO85S-Composite | 31B | no disponible | Companero/roleplay con enrutado por etapas | Apache-2.0 | Hugging Face (0 descargas) |
| Gryphe/Gemma-4-31B-StyleTune | 31B | no disponible | Base estilizada | no disponible | Hugging Face |
| Linea base MoE de PresenceAI | >1T | no disponible | Produccion frontera | no disponible | Propietaria |

No se dispone de datos de benchmarks academicos que permitan comparar con alternativas de la misma categoria (p. ej. otros modelos de roleplay de 30B) de forma objetiva.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidad multilingue declarada.
- No es un modelo unico: requiere el enrutador y los tres checkpoints LoRA para funcionar como se describe; desplegarlo como checkpoint aislado pierde la logica por etapas.
- Las metricas reportadas son de negocio (retencion, conversion, profundidad) y no de calidad linguistica o factual; la ganancia `raw_L0` cae a +0,14% tras debiasing, lo que sugiere ruido considerable.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- Sesgos: el sistema esta optimizado para engagement y conversion comercial, lo que puede incentivar respuestas manipulativas o de retencion forzada en contextos de companero.
- Longitud de contexto, cuantizaciones y formato de pesos no documentados: riesgo para planificacion de despliegue.
- Repositorio con 0 descargas y 0 likes; ecosistema y soporte limitados.
- La licencia Apache-2.0 se declara en el repositorio, pero conviene verificar la compatibilidad con la licencia del modelo base Gemma.

## Enlaces

- Hugging Face: https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Checkpoint etapa 1: https://huggingface.co/PresenceAI/Gefjon-Hnoss-31B-DPO-LoRA-v1.0
- Checkpoint etapa 2: https://huggingface.co/PresenceAI/Sjofn-Eir-31B-DPO-LoRA-v1.0
- Checkpoint etapa 3: https://huggingface.co/PresenceAI/Sjofn-31B-SFT-LoRA-v1.0
- Variante DPO linea II: https://huggingface.co/PresenceAI/Lofn-Vor-31B-DPO-LoRA-v1.0
- Variante SWA linea I: https://huggingface.co/PresenceAI/Gefjon-Gersimi-31B-DPO-LoRA-v1.0
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
