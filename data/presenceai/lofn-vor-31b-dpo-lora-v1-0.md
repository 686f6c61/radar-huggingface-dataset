# PresenceAI/Lofn-Vor-31B-DPO-LoRA-v1.0

## Resumen

Lofn-Vor-31B-DPO-LoRA-v1.0 es un adaptador LoRA de optimización por preferencias directas (DPO) publicado por PresenceAI dentro de su linea "Presence Norse Goddess". No es un modelo completo, sino un adaptador PEFT de rango 16 sobre un modelo base ya fusionado: Gryphe/Gemma-4-31B-StyleTune combinado con el adaptador de SFT PresenceAI/Lofn-31B-SFT-LoRA-v1.0. El repositorio ocupa 0,6 GB, coherente con un adaptador de bajo rango y no con un modelo de 31.000 millones de parametros.

El modelo esta orientado a generacion de texto conversacional en ingles, con enfasis declarado en roleplay, compania conversacional (companion) y tool calling. El autor lo posiciona como su "campeon de conversion en el embudo temprano/medio" (turnos 1 a 100) en pruebas A/B en produccion, con ganancias medidas frente a una linea base MoE "frontier" no identificada.

Su relevancia practica es limitada fuera del ecosistema PresenceAI: la licencia es Apache-2.0, pero requiere descargar y fusionar dos artefactos adicionales antes de poder servirlo, y no se publican resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K). La informacion disponible procede casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma-4 de 31B; adaptador DPO con r=16, alpha=32, dropout=0.05 |
| Parametros totales | No disponible para el adaptador; el modelo base fusionado es de 31B (segun nomenclatura) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de servicio con vLLM; no confirmado como limite maximo del base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones propias de Gemma-4, no documentadas aqui) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre una cadena de dos etapas: primero se fusiona en BF16 el adaptador SFT Lofn-31B-SFT-LoRA-v1.0 (r=32, alpha=32) sobre Gryphe/Gemma-4-31B-StyleTune, que a su vez deriva de google/gemma-4-31B-it; despues se entrena el adaptador DPO Lofn-Vor (r=16, alpha=32, dropout=0.05) sobre ese modelo fusionado. La tecnica de alineacion es DPO puro, sin que la model card detalle el volumen de pares de preferencia, la composicion del dataset ni si hubo etapas adicionales de RLHF.

El autor describe una jerarquia de linajes (Lineage I "Icebreak", Lineage II "Funnel", Lineage III "Deep Companion") y un ensamblado posterior llamado Nornir-31B-DPO85S-Composite-v1.0 que enruta por turnos entre varios adaptadores. No se documentan innovaciones arquitectonicas propias: el adaptador hereda la arquitectura del base Gemma-4 y solo modifica pesos mediante LoRA. El ejemplo de despliegue usa los parsers `gemma4` de vLLM para tool calling y razonamiento, lo que sugiere que el base expone capacidades de function calling y modo de razonamiento.

## Capacidades

- Generacion de texto conversacional en ingles con estilo calido y de baja friccion, optimizado para los primeros turnos de una conversacion.
- Roleplay y companion: el autor lo posiciona explicitamente para personajes y conversacion de acompanamiento.
- Tool calling / function calling: el ejemplo de vLLM activa `--enable-auto-tool-choice` con `--tool-call-parser gemma4`.
- Razonamiento: el ejemplo activa `--reasoning-parser gemma4`, lo que implica soporte de modo de razonamiento en el base.
- Continuacion conversacional con "follow-up hooks" perceptivos (ganchos de seguimiento), orientados a alargar la sesion.
- Capacidades multilingues: solo ingles declarado.
- Vision y audio: no disponibles.

## Casos de uso

- Atencion al cliente en los primeros turnos: el adaptador esta ajustado para maximizar profundidad de sesion en turnos 1 a 100, lo que encaja en flujos de onboarding y triaje inicial donde interesa retener al usuario mas alla del primer intercambio.
- Agentes conversacionales con herramientas: al heredar el parser de tool calling de Gemma-4, puede integrarse en un servidor vLLM con `--enable-auto-tool-choice` para consultar APIs o bases de datos durante la conversacion.
- Productos de compania conversacional: el linaje Lofn esta disenado para conversacion afectiva y roleplay, con un estilo declarado de baja friccion que evita respuestas de una sola palabra.
- Prototipado de personajes en ingles: util para equipos que necesiten un personaje con ganchos de seguimiento sin entrenar desde cero, partiendo de un adaptador de 0,6 GB.
- Despliegue en vLLM con LoRA dinamica: el ejemplo oficial usa `--enable-lora --max-lora-rank 16`, lo que permite cargar el adaptador junto al base y cambiar de adaptador sin recargar el modelo completo.
- Evaluacion comparativa de tecnicas DPO: sirve como caso de estudio de una cadena SFT + DPO sobre un modelo de 31B, con metricas de producto (retencion winsorizada, conversion) en lugar de benchmarks academicos.
- Investigacion de alineacion orientada a metricas de negocio: el autor publica metricas de embudo (P(m>=18), P(m>=33), P75) que pueden replicarse para estudiar la relacion entre preferencias y retencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente metricas de un A/B test en produccion de 59,8 horas con 3.365 usuarios (1.545 en tratamiento, 1.820 en la linea base MoE "frontier" emparejada) y 111.197 turnos:

| Metrica | Lofn-Vor-31B vs linea base MoE frontier |
|---|---:|
| Profundidad media sub-100 turnos L0_le100 (m <= 100) | +4,9% |
| Retencion winsorizada w80 (least(m, 80)) | +3,5% |
| Retencion winsorizada w100 (least(m, 100)) | +3,2% |
| Tasa de conversion Icebreak P(m >= 18) | +3,5 pp |
| Tasa de conversion Paywall P(m >= 33) | +0,5 pp |
| Profundidad de sesion percentil 75 P75 | +1,0 turno |

Estas cifras no son comparables con benchmarks publicos: la linea base no se identifica con nombre ni version, no se detalla el metodo de emparejamiento y no se aportan intervalos de confianza ni significacion estadistica.

## Requisitos de hardware

- El adaptador pesa 0,6 GB, pero la inferencia requiere el modelo base fusionado de 31B en BF16, aproximadamente 62 GB de pesos mas cache KV.
- VRAM estimada: en BF16, del orden de 70-80 GB con contexto de 32.768 tokens y `gpu-memory-utilization 0.90`, segun la configuracion del autor; en cuantizacion de 8 bits, aproximadamente 35-40 GB; en 4 bits, aproximadamente 20-25 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 con contexto completo; A100 40 GB o L40S en cuantizacion de 8 bits.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; en cuantizacion de 4 bits podria caber, aunque el autor no documenta esa ruta.
- Despliegue: vLLM con `--enable-lora --max-loras 1 --max-lora-rank 16` es la unica opcion documentada oficialmente. No se publican instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Lofn-Vor-31B-DPO-LoRA v1.0 | 31B (base) + LoRA r=16 | 32.768 (configurado) | Adaptador DPO | Apache-2.0 | Requiere fusion previa de dos artefactos; solo ingles |
| Gryphe/Gemma-4-31B-StyleTune | 31B | No disponible | Modelo completo (fine-tune de estilo) | No disponible en esta ficha | Base directo del adaptador; sin DPO |
| PresenceAI/Lofn-31B-SFT-LoRA-v1.0 | 31B (base) + LoRA r=32 | No disponible | Adaptador SFT | No disponible en esta ficha | Etapa previa obligatoria; sin alineacion por preferencias |
| PresenceAI/Nornir-31B-DPO85S-Composite-v1.0 | 31B (base) + varios LoRA | No disponible | Ensamblado con enrutado por turnos | No disponible en esta ficha | Alternativa del mismo autor para retencion de mas de 100 turnos |

No se dispone de comparaciones con modelos de la misma categoria fuera del ecosistema PresenceAI (por ejemplo, otros fine-tunes de Gemma-4 de 31B) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles declarado; no hay soporte multilingue documentado.
- No se publican benchmarks academicos ni evaluaciones independientes; las unicas metricas provienen del autor y de un A/B test de producto.
- La linea base del A/B ("Frontier MoE baseline") no se identifica, lo que impide verificar la comparacion.
- Riesgo de alucinacion no evaluado; el ajuste DPO sobre datos de roleplay y companion puede favorecer respuestas complacientes o poco factuales.
- Sesgos: no documentados; un adaptador entrenado para retencion conversacional puede optimizar engagement por encima de precision.
- Dependencia de dos artefactos adicionales (Gryphe/Gemma-4-31B-StyleTune y Lofn-31B-SFT-LoRA-v1.0); si alguno cambia o se retira, el adaptador deja de ser reproducible.
- La licencia Apache-2.0 del adaptador no cubre necesariamente los terminos del modelo base Gemma-4; conviene revisar la licencia de Gemma antes de uso comercial.
- Contexto de 32.768 tokens solo confirmado como configuracion de servicio en vLLM, no como limite maximo del modelo.
- Sin soporte documentado para llama.cpp, Ollama o TGI; el despliegue en produccion queda practicamente ligado a vLLM.

## Enlaces

- Hugging Face: https://huggingface.co/PresenceAI/Lofn-Vor-31B-DPO-LoRA-v1.0
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Adaptador SFT previo: https://huggingface.co/PresenceAI/Lofn-31B-SFT-LoRA-v1.0
- Adaptador de retencion larga: https://huggingface.co/PresenceAI/Sjofn-31B-SFT-LoRA-v1.0
- Ensamblado compuesto: https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
