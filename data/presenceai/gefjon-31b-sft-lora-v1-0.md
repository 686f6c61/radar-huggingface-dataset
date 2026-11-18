# PresenceAI/Gefjon-31B-SFT-LoRA-v1.0

## Resumen

Gefjon-31B-SFT-LoRA-v1.0 es un adaptador LoRA de ajuste supervisado (SFT) publicado por PresenceAI como parte de su serie "Presence Norse Goddess". Se trata de un adaptador PEFT de rango 32 que se aplica sobre el modelo Gryphe/Gemma-4-31B-StyleTune, a su vez derivado de google/gemma-4-31B-it. El adaptador no incluye los pesos del modelo base: debe fusionarse con el modelo subyacente antes de su uso. Su propósito declarado es servir como "madre SFT" de la Lineage I dentro de la genealogía de modelos de PresenceAI, actuando como base para dos adaptadores DPO posteriores orientados a roleplay y companion.

El modelo está especializado en generación de texto conversacional con soporte de tool calling nativo (herramienta `send_message`), y está entrenado exclusivamente en inglés. Su relevancia radica en que forma parte de una cadena de ajuste fino documentada con métricas de A/B en producción, algo poco habitual en adaptadores LoRA de nicho. La serie emplea una nomenclatura mitológica nórdica (Gefjon, Hnoss, Gersimi, Lofn, Sjofn, Eir, Nornir) para organizar linajes de entrenamiento.

El adaptador tiene un tamaño de repositorio de aproximadamente 1,0 GB, correspondiente únicamente a los pesos LoRA en safetensors. La información pública no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma-4-31B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base fusionado) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (sujeta a la licencia upstream de Gemma-4) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r = 32, alpha = 32, dropout = 0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | Gryphe/Gemma-4-31B-StyleTune (derivado de google/gemma-4-31B-it) |
| Libreria | peft |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Gemma-4 (31B), en su variante StyleTune de Gryphe, que a su vez deriva del modelo instructivo oficial google/gemma-4-31B-it. La intervencion LoRA cubre todas las proyecciones lineales de atencion y MLP (q/k/v/o y gate/up/down), con rango 32, alpha 32 y dropout 0.05. El entrenamiento es de tipo SFT (supervised fine-tuning) sobre el esquema interno `sft-fixed-disjoint-v1`, orientado a conversacion de roleplay y companion con uso de tool calling nativo.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como RLHF o DPO en esta etapa (el DPO se reserva para las hijas Hnoss y Gersimi). El flujo de uso previsto es fusionar el adaptador en BF16 con el modelo base mediante el script `merge_sft_base.py` antes de cargar los adaptadores DPO derivados. No se documentan innovaciones tecnicas de decodificacion ni variantes de atencion en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, orientada a roleplay y companion.
- Soporte de tool calling nativo mediante la herramienta `send_message`, empleada en los experimentos A/B de produccion.
- Base para ajuste DPO posterior: sirve como modelo padre de Gefjon-Hnoss y Gefjon-Gersimi.
- Capacidades de razonamiento, codigo y matematicas: no documentadas especificamente para este adaptador.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.
- Capacidades de agente multi-paso: no documentadas mas alla del tool calling de mensajeria.

## Casos de uso

- Roleplay conversacional y personajes: el adaptador esta entrenado especificamente para mantener interacciones de rol con consistencia de persona, lo que lo hace adecuado para plataformas de entretenimiento conversacional.
- Companero virtual (companion AI): su entrenamiento SFT orientado a conversacion afectiva y multi-turno permite construir asistentes de acompanamiento con continuidad conversacional.
- Base para pipelines de ajuste DPO: equipos que quieran reproducir el linaje de PresenceAI pueden fusionar este adaptador y aplicar DPO encima para especializar el comportamiento (apertura, retencion, profundidad de conversacion).
- Integracion con tool calling de mensajeria: el uso nativo de `send_message` facilita su despliegue en sistemas de chat con envio estructurado de mensajes.
- Investigacion en ajuste fino eficiente: al ser un LoRA de rango 32 sobre un modelo de 31B, sirve como caso de estudio de SFT de bajo coste con evaluacion A/B en produccion.
- Experimentacion con genealogias de modelos: util para estudiar como adaptadores SFT y DPO encadenados afectan a metricas de retencion y conversion en conversaciones largas.
- Generacion de dialogos sinteticos en ingles para entrenamiento de otros modelos de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card reporta exclusivamente metricas de A/B en produccion frente a una linea base propietaria de tipo MoE frontier (1T+), pero corresponden a los modelos derivados (Hnoss, Gersimi, Nornir, Lofn, Sjofn-Eir) y no a este adaptador SFT de forma aislada.

| Modelo derivado | Rol | Ganancia raw_L0 | L0_le100 | w80 / w100 | P50 / P75 | Dominio ganador |
|---|---|---:|---:|---:|---:|---|
| Gefjon-Hnoss-31B-DPO | Hija DPO 1 | -14,6% | -1,6% | 0,0% / +0,1% | +1,0 / -1,0 | Primera persona (girl_nth=1: +15,5%) e icebreak (turnos 1-9) |
| Gefjon-Gersimi-31B-DPO | Hija DPO 2 (SWA) | +1,7% | +3,3% | +4,9% / +6,8% | -1,0 / +5,0 | Mid-funnel (turnos 9-60) |
| Nornir-31B-DPO85S-Composite | Router 3-en-1 | +9,1% (debiased +0,14%) | -2,1% | +2,1% / +2,7% | +1,0 / +1,0 | Full-horizon y multi-persona |
| Lofn-Vor-31B-DPO | Hija DPO Lineage II | -9,2% | +4,9% | +3,5% / +3,2% | 0,0 / +1,0 | Early/mid-funnel (turnos 1-100) |

Estos datos corresponden a las hijas DPO, no al adaptador SFT evaluado de forma independiente; se incluyen como contexto del linaje.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 1,0 GB en safetensors, pero requiere el modelo base Gemma-4-31B-StyleTune para funcionar.
- Inferencia con el modelo base fusionado en BF16: se estiman del orden de 62 GB de VRAM solo para pesos, mas cache KV; requiere GPUs de 80 GB (A100, H100) o configuraciones multi-GPU.
- Cuantizacion a 8 bits: aproximadamente 31 GB, viable en una RTX 4090 (24 GB) solo con cuantizacion a 4 bits o con offloading.
- Cuantizacion a 4 bits (GGUF/AWQ/GPTQ): en torno a 16-18 GB, puede caber en RTX 4090, RTX 3090 o similar.
- Despliegue: al ser un adaptador PEFT, puede servirse con vLLM (soporte de adaptadores LoRA), TGI o transformers + peft; para cuantizacion agresiva, llama.cpp u Ollama tras conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Gefjon-31B-SFT-LoRA-v1.0 | 31B (base) + LoRA r=32 | no disponible | Apache-2.0 | Roleplay/companion SFT, tool calling | Hugging Face, requiere fusion |
| Gryphe/Gemma-4-31B-StyleTune | 31B | no disponible | Segun Gemma-4 | Estilo narrativo/roleplay | Hugging Face |
| Lofn-31B-SFT-LoRA (PresenceAI) | 31B (base) + LoRA r=32 | no disponible | Apache-2.0 | SFT madre Lineage II (funnel) | Hugging Face |
| Sjofn-31B-SFT-LoRA (PresenceAI) | 31B (base) + LoRA r=32 | no disponible | Apache-2.0 | SFT madre Lineage III (deep companion) | Hugging Face |

No se dispone de comparativas con modelos de roleplay de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta cobertura multilingue.
- No incluye los pesos del modelo base: sin fusion previa con Gryphe/Gemma-4-31B-StyleTune el adaptador no es utilizable.
- Al ser un adaptador SFT intermedio, su rendimiento aislado no se ha evaluado publicamente; las metricas reportadas corresponden a las hijas DPO.
- Riesgo de alucinacion inherente a modelos de 31B en tareas factuales; no hay evaluaciones de veracidad publicadas.
- Sesgos: no documentados, pero el entrenamiento en roleplay/companion puede introducir sesgos de persona y estilo.
- Restricciones de licencia: Apache-2.0 para el adaptador, pero sujeta a la licencia upstream de Gemma-4, que puede imponer condiciones adicionales de uso comercial.
- Uso en produccion: las metricas A/B se basan en decodificacion de muestra unica (n=1) y una linea base propietaria no identificada; la reproducibilidad externa es limitada.
- No recomendado para tareas de codigo, matematicas o razonamiento tecnico sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/PresenceAI/Gefjon-31B-SFT-LoRA-v1.0
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Hija DPO 1 (Hnoss): https://huggingface.co/PresenceAI/Gefjon-Hnoss-31B-DPO-LoRA-v1.0
- Hija DPO 2 (Gersimi): https://huggingface.co/PresenceAI/Gefjon-Gersimi-31B-DPO-LoRA-v1.0
- Modelo composite (Nornir): https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Lineage II (Lofn-Vor): https://huggingface.co/PresenceAI/Lofn-Vor-31B-DPO-LoRA-v1.0
