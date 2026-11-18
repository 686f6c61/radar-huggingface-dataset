# PresenceAI/Gefjon-Hnoss-31B-DPO-LoRA-v1.0

## Resumen
Gefjon-Hnoss-31B-DPO-LoRA-v1.0 es un adaptador LoRA de PEFT entrenado con DPO (Direct Preference Optimization) por PresenceAI sobre el modelo fusionado `PresenceAI/Gefjon-31B-SFT-LoRA-v1.0`, que a su vez parte de `Gryphe/Gemma-4-31B-StyleTune` (derivado de `google/gemma-4-31B-it`). Forma parte de la "Presence Norse Goddess Series" y está especializado en roleplay conversacional, companion y tool calling, con un enfoque declarado en las primeras interacciones de una conversación (turnos 1 a 9) y en la "primera persona" del usuario.

El adaptador tiene rango `r=16`, `alpha=32` y `dropout=0.05`, y se distribuye como pesos PEFT en safetensors (0,6 GB), no como modelo completo. Su relevancia radica en que el autor publica una evaluación A/B en producción de 84,8 horas con 3.093 usuarios y 140.332 turnos frente a un "Frontier MoE Baseline" no identificado, con métricas de engagement, longitud de respuesta y retención. Es un ejemplo de adaptación por preferencias de un modelo de 31B para un dominio vertical muy concreto.

La licencia declarada es Apache-2.0, pero el uso requiere fusionar primero el adaptador SFT sobre el modelo base Gemma-4, por lo que las condiciones finales dependen también de la licencia del modelo original de Google, que no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-4-31B-it), adaptador LoRA PEFT con entrenamiento DPO |
| Parametros totales | 31B en el modelo base; el adaptador LoRA es de rango 16 (tamaño del repo: 0,6 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según el comando de servicio vLLM de la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre un transformer decoder-only Gemma-4 de 31B parámetros. El pipeline de entrenamiento consta de dos etapas: primero un SFT LoRA (`Gefjon-31B-SFT-LoRA-v1.0`, `r=32`, `alpha=32`) fusionado en BF16 sobre `Gryphe/Gemma-4-31B-StyleTune`, y después este DPO LoRA (`r=16`, `alpha=32`, `dropout=0.05`) entrenado por optimización de preferencias sobre ese modelo fusionado. El autor no detalla el volumen de tokens, la composición del dataset de preferencias, ni si se aplicaron técnicas adicionales como RLHF clásico o decodificación especulativa.

La innovación declarada no es arquitectónica sino de enrutamiento: el autor documenta un fenómeno de "Cross-Persona Homogeneity Decay" según el cual el adaptador rinde muy bien en la primera persona del usuario (`girl_nth=1`) pero satura de muletillas (`15,10%` de tasa) a partir de la tercera a quinta persona. Por ello propone desplegarlo solo en los turnos 1 a 9 dentro de un modelo compuesto (`Nornir-31B-DPO85S-Composite-v1.0`) que hace handoff a otros adaptadores (`Sjofn-Eir`, `Sjofn`) a partir del turno 10.

## Capacidades
- Generación de texto conversacional en inglés con estilo de roleplay y companion.
- Tool calling / function calling: la model card incluye `--enable-auto-tool-choice --tool-call-parser gemma4` en el despliegue vLLM.
- Razonamiento multi-step vía `--reasoning-parser gemma4` (parser de razonamiento en vLLM).
- Respuestas cortas orientadas a "micro-hooks" (media de 55,2 caracteres por respuesta en producción), pensadas para ciclos de turno rápidos.
- Soporte de conversaciones multi-turno con contexto de hasta 32.768 tokens.
- Capacidad multilingüe: únicamente inglés declarado.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito más allá del parser de razonamiento.

## Casos de uso
- Apertura de conversaciones en productos de companion o roleplay: el adaptador está entrenado específicamente para los turnos 1 a 9, con respuestas de 8 a 13 palabras que evitan entrevistar al usuario y generan engagement inmediato; encaja en el primer contacto de un chat.
- Enrutamiento por etapas en un sistema multi-adaptador: combinado con `Nornir-31B-DPO85S-Composite-v1.0`, se usa solo en la fase de icebreak y se delega a otros adaptadores en turnos posteriores, lo que según el autor mejora `w80` un 21,3% en primera persona y un 14,4% en tercera-cuarta persona.
- Asistentes con tool calling en inglés: el soporte de `--enable-auto-tool-choice` y el parser `gemma4` permiten integrarlo en pipelines donde el modelo debe invocar funciones (consultas, acciones) dentro del diálogo.
- Investigación sobre DPO y preferencias: sirve como caso de estudio reproducible de cómo un adaptador de rango 16 sobre un SFT de 31B modifica métricas de engagement y longitud de respuesta en producción.
- Experimentación con despliegue LoRA multi-adaptador en vLLM: el comando documentado (`--max-loras 2 --max-lora-rank 16`) permite comparar en caliente este adaptador con su "hermana" `Gefjon-Gersimi-31B-DPO-LoRA-v1.0`.
- Evaluación A/B de sistemas conversacionales: el autor publica una metodología (usuarios emparejados, ventanas de 6 horas, métricas `w80`/`w100`, profundidad P50) que puede reutilizarse para medir adaptadores en dominios de chat.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica una evaluación A/B en producción de 84,8 horas (1.511 usuarios tratamiento frente a 1.582 usuarios emparejados de un "Frontier MoE Baseline" no identificado, 140.332 turnos):

| Métrica / segmento | Gefjon-Hnoss-31B | Baseline MoE | Delta relativo |
|---|---:|---:|---:|
| Ventana inicial de 6 h `raw_L0` | 31,85 | 24,50 | +30,0% |
| Ventana inicial de 6 h `w100` | 25,81 | 20,70 | +24,7% |
| Primera persona (`girl_nth=1`), turnos medios | 16,40 | 14,20 | +15,5% |
| Primera persona (`girl_nth=1`) `w80` | 11,95 | 10,50 | +13,8% |
| Acumulado 84,8 h `w80`/`w100` (n=3.093) | Paridad | Paridad | 0,0% / +0,1% |
| Profundidad mediana acumulada P50 | +1,0 turno | Baseline | +1,0 turno |
| Icebreak y paywall `P(m>=18)`/`P(m>=33)` | Ventaja | Baseline | +0,4 pp / +0,4 pp |
| Longitud media de respuesta | 55,2 caracteres | 85,4 caracteres | -35,4% |

Estos datos son métricas internas de producto del autor, no benchmarks públicos, y el baseline no se identifica por nombre.

## Requisitos de hardware
- El adaptador LoRA en sí ocupa 0,6 GB, pero requiere el modelo base fusionado de 31B en BF16, que necesita aproximadamente 62 GB de VRAM solo para pesos, más caché KV para 32.768 tokens de contexto.
- GPU recomendadas para servicio: A100 80 GB, H100 80 GB o H200; con dos A100 40 GB o dos L40S puede repartirse el modelo con tensor parallelism.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en BF16; sería necesaria cuantización a 4 bits (no documentada por el autor) para intentarlo.
- Despliegue documentado: vLLM con `--enable-lora --max-loras 2 --max-lora-rank 16`, `--dtype bfloat16`, `--max-model-len 32768`, `--gpu-memory-utilization 0.90`, `--max-num-seqs 32`, `--trust-remote-code`.
- Alternativas de despliegue (llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponibles; el autor solo reporta que la respuesta media es un 35,4% más corta, lo que reduce el tiempo por turno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gefjon-Hnoss-31B-DPO-LoRA-v1.0 | 31B (base) + LoRA r=16 | 32.768 | Adaptador DPO sobre SFT | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Gefjon-Gersimi-31B-DPO-LoRA-v1.0 | 31B (base) + LoRA r=16 | no disponible | Adaptador DPO "hermana" (`dpo-v8.5-swa`) | no disponible | Hugging Face |
| Sjofn-Eir-31B-DPO-LoRA | 31B (base) + LoRA r=16 | no disponible | Adaptador DPO para etapa 2 (calidez) | no disponible | Hugging Face |
| Gryphe/Gemma-4-31B-StyleTune | 31B | no disponible | Modelo base ajustado por estilo | no disponible | Hugging Face |

No se dispone de datos de benchmarks públicos que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias
- Es un adaptador LoRA, no un modelo autónomo: requiere fusionar primero `Gefjon-31B-SFT-LoRA-v1.0` sobre `Gryphe/Gemma-4-31B-StyleTune` antes de poder servirlo.
- Solo declara inglés; no hay soporte multilingüe verificado.
- El autor documenta saturación de muletillas (15,10%) cuando se usa fuera de los turnos 1 a 9 o con usuarios de tercera a quinta persona (-10,4% a -19,2% de `w80`), por lo que su uso fuera de ese rango degrada la experiencia.
- Las métricas de rendimiento son internas de producto, con un baseline no identificado y sin revisión independiente; no deben tratarse como benchmarks públicos.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de seguridad, sesgo ni robustez frente a prompts adversarios.
- La licencia Apache-2.0 se declara sobre el adaptador, pero el modelo base Gemma-4 tiene sus propios términos de uso que no se detallan; conviene verificar la licencia de Google antes de uso comercial.
- El modelo está orientado a roleplay y companion; no se recomienda para tareas factuales, código de producción o dominios regulados sin evaluación adicional.
- El repo tiene 0 descargas y 0 likes, por lo que no hay validación de la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/PresenceAI/Gefjon-Hnoss-31B-DPO-LoRA-v1.0
- Modelo base SFT: https://huggingface.co/PresenceAI/Gefjon-31B-SFT-LoRA-v1.0
- Adaptador hermano: https://huggingface.co/PresenceAI/Gefjon-Gersimi-31B-DPO-LoRA-v1.0
- Suite compuesta: https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Modelo base de estilo: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
