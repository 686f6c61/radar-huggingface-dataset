# PresenceAI/Sjofn-Eir-31B-DPO-LoRA-v1.0

## Resumen

PresenceAI Sjofn-Eir-31B-DPO-LoRA-v1.0 es un adaptador LoRA PEFT entrenado con DPO (Direct Preference Optimization) on-policy sobre el modelo fusionado `Gryphe/Gemma-4-31B-StyleTune` + `PresenceAI/Sjofn-31B-SFT-LoRA-v1.0`. Lo desarrolla PresenceAI dentro de su "Presence Norse Goddess Series" (Lineage III, hija de Sjofn). El adaptador tiene rango `r=16`, `alpha=32` y `dropout=0.05`, y está pensado para rol conversacional y companion, además de soportar tool calling.

El modelo no es un modelo completo: es un adaptador DPO que requiere fusionar primero el SFT de Sjofn sobre el base Gemma 4 de 31B de Gryphe y después cargar este LoRA encima. Su función en producción es actuar como "Stage-2 (Turns 10-35) Warmth & Paywall Conversion Backbone" dentro del composite router `PresenceAI/Nornir-31B-DPO85S-Composite-v1.0`, sirviendo el 75% de los turnos 10-35 y el 20% de los turnos 36+ de ese sistema.

Es relevante porque documenta un caso de optimización de preferencias on-policy con control estricto de paridad de longitud y early stopping en `checkpoint-90`, orientado a preservar calidez conversacional sin colapso en modo catchphrase. El autor reporta un A/B test en producción de 39,9 horas con 713 usuarios de tratamiento frente a 694 de una línea base MoE frontier emparejada, sobre 78.459 turnos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 31B) con adaptador LoRA PEFT |
| Parámetros totales | 31B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens según el ejemplo de servicio en vLLM (`--max-model-len 32768`) |
| Tipos de cuantización | no disponible (el adaptador se sirve en bfloat16 en el ejemplo del autor) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=16, alpha=32, dropout=0.05 |
| Modelo base requerido | `Gryphe/Gemma-4-31B-StyleTune` fusionado con `PresenceAI/Sjofn-31B-SFT-LoRA-v1.0` |
| Librería | peft |
| Tamaño del repo | 0,6 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only Gemma 4 de 31B afinado por Gryphe (`StyleTune`) y posteriormente fusionado con el SFT de Sjofn (r=32, alpha=32). Sobre esa base se entrena un LoRA de rango 16 con DPO en modalidad on-policy: los pares de candidatos se muestrean del propio modelo padre (`Sjofn-31B-SFT-LoRA-v1.0`), lo que según el autor evita el desajuste de distribución off-policy. El entrenamiento emplea paridad estricta de longitud entre elegido y rechazado (`|len(chosen) - len(rejected)| <= 15 caracteres`) y se detiene de forma temprana en `checkpoint-90` para preservar la calidez conversacional y evitar el colapso en frases repetidas.

El checkpoint publicado corresponde a `dpo-v9.1-balanced`. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de preferencias ni si se aplicaron otras técnicas de alineación adicionales. El modelo se sirve con vLLM con soporte de LoRA dinámico, parser de tool calling y parser de razonamiento específicos de Gemma 4 (`--tool-call-parser gemma4 --reasoning-parser gemma4`).

## Capacidades

- Generación de texto conversacional multi-turno con énfasis en rol (roleplay) y companion.
- Optimización específica de calidez y conversión en los turnos 10-35 de una conversación larga.
- Tool calling / function calling, con parser dedicado en vLLM (`gemma4`).
- Parser de razonamiento habilitado en el ejemplo de servicio.
- Soporte de despliegue como adaptador LoRA dinámico junto a otros adaptadores (hasta 4 LoRA simultáneos en el ejemplo).
- Capacidades heredadas del base Gemma 4 31B, no detalladas en la información disponible.
- Idiomas: inglés (`en`).

## Casos de uso

- Backbone de conversación companion en producción: el adaptador está diseñado y validado como etapa 2 de un router conversacional (turnos 10-35), por lo que su caso natural es servir la fase de "calentamiento" y conversión en asistentes de acompañamiento, donde el autor reporta mejoras de +1,5 pp en conversión de paywall frente a una línea base MoE frontier.
- Sistemas multi-adaptador con vLLM: al ser un LoRA de rango 16, puede cargarse junto a otros adaptadores en el mismo servidor (`--max-loras 4 --max-lora-rank 16`), lo que permite enrutar por etapa de conversación sin duplicar el modelo base de 31B en memoria.
- Investigación en DPO on-policy: el adaptador y su receta (pares muestreados del propio padre, paridad de longitud estricta, early stopping en checkpoint-90) sirven como referencia reproducible para estudiar alineación de preferencias sin cambio de distribución.
- Asistentes conversacionales con tool calling: el ejemplo de servicio habilita elección automática de herramientas y parser de llamadas, de modo que se puede integrar en flujos donde el modelo decide invocar funciones externas (consultas, acciones) dentro de una conversación larga.
- Evaluación A/B de alineación conversacional: el autor documenta una metodología con 713 usuarios de tratamiento frente a 694 emparejados sobre 78.459 turnos, replicable para medir profundidad de conversación (P50/P75) y conversión.
- Rol y personajes con control de estilo: al ser un ajuste DPO sobre un modelo StyleTune, es adecuado para mantener consistencia de personaje en sesiones largas de 32.768 tokens de contexto sin derivar en frases repetidas, que es precisamente el fallo que el early stopping busca evitar.

## Benchmarks y rendimiento

Tabla del A/B test en producción reportado por el autor (39,9 horas, 713 usuarios de tratamiento frente a 694 de línea base MoE frontier emparejada, 78.459 turnos):

| Métrica / Corte | Nornir-DPO85S (con Sjofn-Eir) | Línea base MoE frontier | Delta |
|---|---:|---:|---:|
| Conversión icebreak-to-warmup `P(m >= 18)` | 50,1% | 48,0% | +2,1 pp |
| Conversión de paywall `P(m >= 33)` | 35,8% | 34,3% | +1,5 pp |
| Profundidad mediana / P75 `P50 / P75` | 18,0 / 46,0 | 16,0 / 44,0 | +12,5% / +4,5% |
| Turnos medios en persona 3ª-4ª (`girl_nth = 3-4`) | 13,09 | 10,48 | +24,9% |
| `w80` en persona 3ª-4ª (`girl_nth = 3-4`) | 9,47 | 8,28 | +14,4% |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,6 GB, pero requiere el modelo base fusionado de 31B para funcionar.
- VRAM estimada para el base en bfloat16: aproximadamente 62 GB de pesos, más caché KV para 32.768 tokens de contexto; en la práctica exige GPUs de 80 GB (A100 80 GB, H100 80 GB) para servirlo cómodamente con `--gpu-memory-utilization 0.90` como en el ejemplo.
- No cabe en GPUs de consumo (RTX 4090 24 GB) en bfloat16 sin cuantización; no se documentan en la información disponible pesos GGUF ni cuantizaciones oficiales de este adaptador.
- Opciones de despliegue: vLLM con `--enable-lora` (opción documentada por el autor), y en principio cualquier stack compatible con PEFT/LoRA previa fusión del adaptador sobre el base.
- Throughput y latencia: no disponibles; el ejemplo fija `--max-num-seqs 32`, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sjofn-Eir-31B-DPO-LoRA-v1.0 | 31B (base) + LoRA r=16 | 32.768 | Apache-2.0 | Hugging Face (adaptador) | DPO on-policy, rol/companion, tool calling |
| Sjofn-31B-SFT-LoRA-v1.0 (padre) | 31B (base) + LoRA r=32 | no disponible | Apache-2.0 | Hugging Face (adaptador) | SFT previo al DPO; sirve de base y de candidato on-policy |
| Nornir-31B-DPO85S-Composite-v1.0 | 31B (base) con router 3-en-1 | no disponible | Apache-2.0 | Hugging Face | Composite que integra Sjofn-Eir como etapa 2 |
| Lofn-Vor-31B-DPO-LoRA (línea II) | 31B (base) + LoRA r=16 | no disponible | Apache-2.0 | Hugging Face | Hija DPO de la línea Lofn, especializada en turnos 1-100 |

No se dispone de comparativas cuantitativas con modelos de propósito general de 31B en la información proporcionada; los datos del autor comparan contra una "línea base MoE frontier" no identificada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin fusionar el SFT de Sjofn sobre `Gryphe/Gemma-4-31B-StyleTune` no funciona.
- Solo declara inglés como idioma; el rendimiento en castellano u otros idiomas no está documentado.
- Especializado en rol conversacional y conversión en contextos de companion; su uso fuera de ese dominio no está validado.
- Riesgo de alucinación inherente al modelo base Gemma 4 31B, no cuantificado en la información disponible.
- No se publican datos sobre sesgos, evaluación de seguridad ni filtros de contenido.
- El A/B test reportado es del sistema composite completo, no del adaptador aislado; atribuir las ganancias únicamente a Sjofn-Eir no es posible con los datos publicados.
- El recuento de descargas y likes es cero en el momento de la ficha, por lo que no hay validación independiente de la comunidad.
- Aunque la licencia es Apache-2.0, conviene revisar `LICENSE` y `NOTICE` del repositorio, así como los términos del modelo base Gemma 4 de Google.
- El ejemplo de servicio usa `--trust-remote-code`, lo que implica ejecutar código del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/PresenceAI/Sjofn-Eir-31B-DPO-LoRA-v1.0
- Modelo base SFT (padre): https://huggingface.co/PresenceAI/Sjofn-31B-SFT-LoRA-v1.0
- Composite router: https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Modelo base de estilo: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
