# PresenceAI/Sjofn-31B-SFT-LoRA-v1.0

## Resumen
Sjofn-31B-SFT-LoRA-v1.0 es un adaptador LoRA de ajuste supervisado (SFT) publicado por PresenceAI como parte de su serie "Norse Goddess". Se entrena sobre Gryphe/Gemma-4-31B-StyleTune, a su vez derivado de google/gemma-4-31B-it, y está orientado a generación de texto conversacional con enfasis en roleplay, compania conversacional de largo recorrido y tool calling. El adaptador ocupa aproximadamente 1 GB en el repositorio y se distribuye con licencia Apache-2.0.

El modelo resuelve un problema muy concreto dentro de la genealogia de modelos de PresenceAI: mantener la calidad y diversidad lexica en conversaciones muy largas (mas de 36 turnos) sin la degradacion que, segun el autor, sufren los adaptadores DPO agresivos en esa fase. Sjofn se presenta como pieza central del sistema compuesto Nornir-31B-DPO85S-Composite-v1.0, donde cubre el 80 % de los turnos a partir del turno 36 y el 25 % de los turnos entre el 10 y el 35. Ademas actua como modelo madre del adaptador DPO Sjofn-Eir-31B-DPO-LoRA-v1.0.

La relevancia actual es doble: por un lado, demuestra un patron de despliegue con multiples LoRA servidas en una sola instancia de vLLM sobre una base de 31B; por otro, publica un A/B test en produccion de 39,9 horas con 78.459 turnos que compara el sistema compuesto contra un baseline MoE frontier. No obstante, se trata de un adaptador de nicho, solo en ingles y con evaluacion centrada en metricas de retencion conversacional, no en benchmarks academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Gemma-4 de 31B (base: Gryphe/Gemma-4-31B-StyleTune) |
| Parametros totales | 31B en el modelo base fusionado; el adaptador LoRA no declara recuento propio de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio documentada por el autor (base Gemma-4) |
| Tipos de cuantizacion | no disponible (el autor documenta servicio en bfloat16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere fusion con el modelo base para uso directo) |

Parametros adicionales del adaptador: rango r=32, alpha=32, dropout=0.05. Libreria declarada: peft.

## Arquitectura y entrenamiento
El adaptador se aplica sobre un modelo transformer decoder-only de la familia Gemma-4 con 31.000 millones de parametros. El entrenamiento es un SFT "on-policy clean" sobre cinco etapas conversacionales balanceadas, segun describe el autor. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en este adaptador concreto (el DPO se delega en el modelo hijo Sjofn-Eir). Tampoco se especifican innovaciones de atencion o decodificacion; el interes tecnico esta en el pipeline de fusion (merge a BF16) y en el servicio multi-LoRA.

La innovacion destacada por el autor es metodologica: sostiene que un SFT limpio preserva mejor la diversidad lexica y la receptividad emocional en turnos profundos que un DPO agresivo, que tiende a colapsar la entropia y a producir muletillas repetitivas. El adaptador se sirve con un "Queen-Detoxed prompt" a partir del turno 36 para reforzar ese comportamiento.

## Capacidades
- Generacion de texto conversacional multi-turno con enfasis en registro afectivo y de compania.
- Roleplay y personificacion sostenida ("companion", "roleplay" en los tags).
- Tool calling / function calling: el autor documenta `--enable-auto-tool-choice`, `--tool-call-parser gemma4` y `--reasoning-parser gemma4` en vLLM.
- Razonamiento con parser de razonamiento (`gemma4`) en el servidor configurado.
- Retencion en conversaciones largas: metrica propia "whale retention" sobre cohortes de 100+ y 150+ turnos.
- Multilingue: no; solo ingles declarado.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso
- Companero conversacional de largo recorrido: el adaptador esta disenado para turnos 36+ y muestra, en la evaluacion del autor, mayor profundidad de sesion (P90 de 110,6 turnos frente a 97,8 del baseline). Encaja en productos de chat afectivo donde la retencion a largo plazo es la metrica principal.
- Roleplay persistente de personajes: el SFT sobre etapas balanceadas y el uso de prompt detox buscan mantener coherencia de personaje sin muletillas repetitivas en sesiones largas.
- Despliegue multi-LoRA en una sola instancia: sirve como ejemplo de arquitectura con vLLM (`--enable-lora --max-loras 4`) para alternar entre etapas conversacionales (Sjofn y Sjofn-Eir) sobre una base unica de 31B y ahorrar VRAM.
- Agente conversacional con tool calling: la configuracion documentada con parser de herramientas permite integrarlo en flujos donde el asistente necesita invocar funciones externas (consultas, reservas, busquedas) manteniendo el tono conversacional.
- Investigacion sobre dinamicas de retencion: util para estudiar la diferencia entre SFT limpio y DPO agresivo en horizontes largos, con un A/B test de 78.459 turnos como referencia.
- Prototipado de routers por etapa: la genealogia publicada (Gefjon, Lofn, Sjofn, Eir) permite construir y evaluar enrutadores que cambian de adaptador segun el numero de turno.
- Base para fine-tuning posterior: al ser un adaptador Apache-2.0 de rango 32, puede reutilizarse como punto de partida (modelo madre) para nuevos DPO o SFT, como hizo el propio autor con Sjofn-Eir.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica una evaluacion A/B en produccion de 39,9 horas con 713 usuarios de tratamiento frente a 694 emparejados y 78.459 turnos, comparando el sistema compuesto Nornir-DPO85S (que incluye Sjofn) contra un baseline MoE frontier:

| Cohorte / metrica | Sjofn + Sjofn-Eir | Baseline MoE frontier | Delta |
|---|---:|---:|---:|
| S4_Whale (pre_m >= 201), media de turnos raw_L0 | 185,17 | 176,74 | +4,8 % |
| S4_Whale, w100 / w80 | 61,62 / 51,91 | 59,77 / 50,88 | +3,1 % / +2,0 % |
| S2_Mid (pre_m 16–60), media de turnos raw_L0 | 24,80 | 18,82 | +31,8 % |
| Conversion global P(m >= 100) | 11,1 % | 10,0 % | +1,1 pp (+11,0 % rel.) |
| Super-whales (m > 150 turnos) | 57 usuarios | 48 usuarios | +18,8 % |
| P90 de profundidad de sesion | 110,6 turnos | 97,8 turnos | +13,1 % |

Estas cifras corresponden al sistema compuesto completo, no a Sjofn en aislamiento, y provienen de metricas internas del autor (no auditadas externamente).

## Requisitos de hardware
- VRAM para inferencia del modelo fusionado en bfloat16: aproximadamente 62 GB solo en pesos (31B x 2 bytes), mas cache KV y overhead; en la practica se recomienda 2 x 80 GB (A100/H100) o una H100 de 80 GB con margen ajustado.
- GPU recomendadas: H100 80 GB, A100 80 GB; para cuantizacion agresiva, no hay formatos documentados por el autor.
- Cabe en consumer GPU: no para el modelo fusionado a 31B en BF16. El adaptador en si (1 GB) cabe, pero requiere la base completa.
- Despliegue: vLLM con `--enable-lora`, `--max-model-len 32768`, `--dtype bfloat16`, `--gpu-memory-utilization 0.90`, `--max-num-seqs 32`, `--trust-remote-code`. No se documentan opciones llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Sjofn-31B-SFT-LoRA-v1.0 | 31B (base) + LoRA r=32 | 32.768 tokens | Apache-2.0 | SFT conversacional de largo recorrido | Hugging Face (adaptador) |
| Sjofn-Eir-31B-DPO-LoRA-v1.0 | 31B (base) + LoRA r=16 | 32.768 tokens | no disponible en la informacion | DPO, etapa 2 (turnos 10–35) | Hugging Face |
| Gryphe/Gemma-4-31B-StyleTune | 31B | no disponible | no disponible en la informacion | Style tune generalista | Hugging Face |
| Nornir-31B-DPO85S-Composite-v1.0 | Sistema compuesto (multiples LoRA) | 32.768 tokens | no disponible en la informacion | Router por etapa conversacional | Hugging Face |

No se dispone de datos de benchmarks academicos para comparar rendimiento frente a alternativas; la unica comparacion disponible es la A/B del autor contra un baseline MoE frontier no identificado.

## Limitaciones y advertencias
- Solo ingles: no hay soporte multilingue declarado, lo que limita su uso en castellano sin fine-tuning adicional.
- No es un modelo autonomo: requiere fusion con Gryphe/Gemma-4-31B-StyleTune (paso `merge_sft_base.py` documentado por el autor).
- Evaluacion centrada en metricas de negocio internas (retencion, conversion, profundidad de sesion) y no en benchmarks academicos; las cifras no son auditadas externamente.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un modelo conversacional de 31B, persisten riesgos habituales de generacion factualmente incorrecta, especialmente en tool calling.
- Nicho de uso: roleplay y compania conversacional; puede no comportarse de forma optima en tareas de codigo, matematicas o razonamiento tecnico.
- Restricciones de licencia: Apache-2.0 en el adaptador, pero el uso comercial depende tambien de los terminos del modelo base Gemma-4 y de Gryphe/Gemma-4-31B-StyleTune, que deben verificarse.
- Contexto de 32.768 tokens en la configuracion de servicio; no se documenta si admite ventanas mayores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/PresenceAI/Sjofn-31B-SFT-LoRA-v1.0
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Modelo hijo DPO: https://huggingface.co/PresenceAI/Sjofn-Eir-31B-DPO-LoRA-v1.0
- Sistema compuesto: https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
