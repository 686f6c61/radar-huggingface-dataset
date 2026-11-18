# PresenceAI/Gefjon-Gersimi-31B-DPO-LoRA-v1.0

## Resumen

PresenceAI/Gefjon-Gersimi-31B-DPO-LoRA-v1.0 es un adaptador LoRA de optimización por preferencias (DPO) desarrollado por PresenceAI para el modelo base Gryphe/Gemma-4-31B-StyleTune, previamente ajustado con el adaptador SFT PresenceAI/Gefjon-31B-SFT-LoRA-v1.0. Forma parte de la línea "Presence Norse Goddess" y está orientado a conversación de acompañamiento (companion/roleplay), con soporte declarado de tool calling y un enfoque explícito en la calidad de las respuestas en turnos medios de conversación (turns 9-60).

El adaptador emplea un rango LoRA de r=16 con alpha=32 y dropout de 0.05, y se ha generado mediante Stochastic Weight Averaging (SWA) uniforme sobre los checkpoints 100, 125 y 137 de una trayectoria DPO de cuatro escenas. Su gemelo es PresenceAI/Gefjon-Hnoss-31B-DPO-LoRA-v1.0, pensado para los primeros turnos de la conversación (turns 1-9), y ambos se combinan en el enrutador compuesto Nornir-31B-DPO85S-Composite-v1.0.

El modelo es relevante porque documenta una evaluación A/B en producción de 15,6 horas sobre tráfico de embudo medio, comparando 180 usuarios tratados con 665 usuarios emparejados de un baseline MoE frontier, con métricas de profundidad de sesión y retención. No obstante, se trata de un adaptador de nicho, solo en inglés, con 0 descargas y 0 likes en el momento de la consulta, y cuyos resultados proceden exclusivamente del autor, sin benchmarks académicos públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma-4-31B (adaptador DPO con SWA) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según el comando de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=16, alpha=32, dropout=0.05 |
| Modelo base requerido | Gryphe/Gemma-4-31B-StyleTune + PresenceAI/Gefjon-31B-SFT-LoRA-v1.0 (fusionado) |
| Tamaño del repositorio | 0,6 GB |
| Librería | peft |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer Gemma-4-31B (variante StyleTune de Gryphe) y se entrena en dos fases: primero un ajuste SFT (adaptador Gefjon-31B-SFT-LoRA-v1.0, r=32, alpha=32) que se fusiona en BF16 con el modelo base, y después un ajuste DPO sobre ese modelo fusionado con un adaptador de rango 16. La innovación técnica destacable es el uso de Stochastic Weight Averaging (SWA) uniforme sobre los checkpoints 100, 125 y 137 de la trayectoria DPO, lo que produce el checkpoint final `dpo-v8.5-swa`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de preferencias ni si se aplicaron técnicas adicionales como RLHF más allá del DPO. La model card menciona una "trayectoria DPO de cuatro escenas" (4-scene gold DPO trajectory) y una evaluación offline basada en tres axiomas conversacionales (elevación del ego masculino, replicabilidad en 3 segundos y anclaje de persona), pero no detalla los datos subyacentes. El adaptador está diseñado para funcionar en tándem con un modelo de apertura (Gefjon-Hnoss) en los primeros turnos, lo que sugiere que el entrenamiento DPO se centró en el tramo medio de la conversación.

## Capacidades

- Generación de texto conversacional orientada a roleplay y companion (acompañamiento conversacional).
- Optimización por preferencias (DPO) para mejorar la calidad de respuesta en turnos medios (9-60).
- Soporte de tool calling / function calling: el comando de despliegue incluye `--enable-auto-tool-choice` y `--tool-call-parser gemma4`.
- Soporte de modo de razonamiento mediante `--reasoning-parser gemma4` en vLLM.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- Integración como adaptador PEFT cargable en vLLM con `--enable-lora` y `--max-lora-rank 16`.
- Diseñado para arquitecturas de enrutamiento por turnos (stage router) combinado con otros adaptadores de la misma familia.
- No se declaran capacidades de visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Conversación de acompañamiento en producción (mid-funnel): el adaptador está diseñado para tomar el relevo en el turno 9 de una conversación iniciada por un modelo de apertura, manteniendo el engagement en sesiones largas gracias a su entrenamiento DPO específico para turnos 9-60.
- Despliegue como adaptador LoRA en vLLM: se puede servir junto al modelo base fusionado con `--enable-lora --max-loras 2 --max-lora-rank 16`, lo que permite alternar entre el adaptador de apertura y el de tramo medio sin recargar el modelo base.
- Enrutamiento por etapas (stage router): combinado con Gefjon-Hnoss (turnos 1-9) y otros adaptadores de la familia (Eir, Sjofn) en el Composite Crown, permite asignar dinámicamente el adaptador adecuado según el turno de la conversación.
- Tool calling en asistentes conversacionales: al soportar `--enable-auto-tool-choice` con parser `gemma4`, puede integrarse en flujos donde el asistente necesita invocar funciones externas (consultas, reservas, recuperación de datos) dentro de una conversación de acompañamiento.
- Experimentación en investigación sobre DPO y SWA: el repositorio documenta una trayectoria DPO con SWA sobre checkpoints concretos, lo que lo hace útil como caso de estudio reproducible de promediado de pesos en optimización por preferencias.
- Evaluación A/B de sistemas conversacionales: las métricas publicadas (profundidad de sesión P75, retención winsorizada w80/w100) sirven como referencia metodológica para equipos que quieran medir adaptadores conversacionales en producción.
- Prototipado de personajes con persona anclada: los tres axiomas conversacionales evaluados (anclaje de persona, replicabilidad, elevación del ego) orientan su uso en productos de entretenimiento conversacional con consistencia de personaje.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card. No hay resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

Evaluación A/B en producción (15,6 horas, tráfico mid-funnel, turnos 9+, 180 usuarios tratados frente a 665 usuarios emparejados de un baseline MoE frontier, 9.787 turnos):

| Métrica | Gefjon-Gersimi-31B vs baseline MoE frontier |
|---|---:|
| Profundidad de sesión P75 (turnos) | +5,0 turnos |
| Retención winsorizada w100 (`least(m, 100)`) | +6,8% |
| Retención winsorizada w80 (`least(m, 80)`) | +4,9% |
| Media sub-100 turnos `L0_le100` (`m <= 100`) | +3,3% |
| Media de profundidad sin ajustar `raw_L0` | +1,7% (54,4 vs 53,5) |

Evaluación offline de tres axiomas conversacionales (100 contextos reales no vistos):

| Métrica | Gefjon-Gersimi-31B | Baseline |
|---|---:|---:|
| Tasa de aprobación de los 3 axiomas (Pass-All) | 88,0% | 72,0% |

Advertencia operativa del autor: en tráfico frío de turno 1 sin un modelo de apertura previo, la retención w80 cae un 27,7%, por lo que no debe enrutarse directamente a turnos 1-8.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,6 GB, pero requiere el modelo base fusionado de 31B parámetros en BF16 para inferencia.
- VRAM estimada para el modelo base en BF16: aproximadamente 62 GB solo para pesos, más overhead de KV cache y activaciones; el autor recomienda `--gpu-memory-utilization 0.90`.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU. No cabe en GPU de consumo (RTX 4090 de 24 GB) en BF16 sin cuantización, y no se documentan opciones de cuantización para este adaptador.
- Despliegue: vLLM es la opción documentada por el autor, con `--enable-lora`, `--max-loras 2`, `--max-lora-rank 16`, `--max-model-len 32768`, `--dtype bfloat16`, `--max-num-seqs 32`, `--enable-auto-tool-choice`, `--tool-call-parser gemma4` y `--reasoning-parser gemma4`.
- No se documentan opciones para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gefjon-Gersimi-31B-DPO-LoRA v1.0 | LoRA DPO sobre Gemma-4-31B | 31B (base) | 32.768 | Apache-2.0 | Hugging Face (0 descargas) |
| Gefjon-Hnoss-31B-DPO-LoRA v1.0 | LoRA DPO (gemelo, turnos 1-9) | 31B (base) | no disponible | Apache-2.0 | Hugging Face |
| Nornir-31B-DPO85S-Composite-v1.0 | Enrutador compuesto 3-en-1 | 31B (base) | no disponible | no disponible | Hugging Face |
| Baseline MoE frontier (sin especificar) | MoE propietario | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de propósito general no está disponible en la información proporcionada; el único contraste cuantificado es frente al baseline MoE frontier anónimo usado en la prueba A/B del autor.

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta de idioma del repositorio; no se declaran otros idiomas.
- Es un adaptador, no un modelo autónomo: requiere fusionar el modelo base Gryphe/Gemma-4-31B-StyleTune con el adaptador SFT Gefjon-31B-SFT-LoRA-v1.0 antes de cargarlo.
- Restricción operativa explícita: no debe usarse en turnos 1-8; en tráfico frío de turno 1 la retención w80 cae un 27,7%. Está pensado para turnos 9-60 y debe combinarse con Gefjon-Hnoss en los turnos 1-9.
- Los resultados de rendimiento provienen exclusivamente del autor, sin replicación independiente ni benchmarks académicos; la muestra A/B es pequeña (180 usuarios tratados) y de un único despliegue de 15,6 horas.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos: no documentados; el entrenamiento DPO se orienta explícitamente a "elevación del ego masculino" como axioma conversacional, lo que puede introducir sesgos de género y de complacencia en las respuestas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma-4-31B puede estar sujeto a los términos de Google; conviene verificar la licencia del modelo base antes de producción.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta); madurez y soporte inciertos.
- No se documentan opciones de cuantización ni despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/PresenceAI/Gefjon-Gersimi-31B-DPO-LoRA-v1.0
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Adaptador SFT previo: https://huggingface.co/PresenceAI/Gefjon-31B-SFT-LoRA-v1.0
- Adaptador gemelo (turnos 1-9): https://huggingface.co/PresenceAI/Gefjon-Hnoss-31B-DPO-LoRA-v1.0
- Enrutador compuesto: https://huggingface.co/PresenceAI/Nornir-31B-DPO85S-Composite-v1.0
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
