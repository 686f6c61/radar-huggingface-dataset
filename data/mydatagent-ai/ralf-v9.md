# Mydatagent-ai/ralf-v9

## Resumen

Ralf v9 (mda-v9-grpo) es un adaptador LoRA de tipo PEFT desarrollado por MyDatAgent (MDA) sobre el modelo base `unsloth/Qwen3.8-27B`. Está especializado en asistencia jurídico-tributaria y empresarial en portugués de Brasil, con un foco central declarado en la "antifabricación": evitar que el modelo invente leyes, artículos, números o precedentes judiciales. El adaptador se distribuye sin fusionar con la base y se carga en tiempo de ejecución.

El modelo se entrenó en dos etapas: un fine-tune supervisado (SFT) sobre un corpus de preguntas y respuestas jurídico-empresariales en PT-BR (26.446 ejemplos finales) y una etapa posterior de aprendizaje por refuerzo con GRPO, guiada por una función de recompensa que penaliza citas normativas inexistentes y premia la abstención cuando no hay certeza. Según la model card, esta etapa redujo las fabricaciones hasta un 5,6% en su banco de pruebas interno, el mejor resultado de su ciclo de desarrollo.

Su relevancia radica en el enfoque metodológico: documenta explícitamente las métricas de un banco interno de ~470 sondas, los residuos de fabricación que persisten y el coste del ciclo de entrenamiento (≈145–150 USD). Es un caso útil para quienes trabajan en dominios de alto riesgo donde la alucinación tiene consecuencias legales o económicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `unsloth/Qwen3.8-27B`; r=32, α=32 |
| Parametros totales | No disponible para el adaptador; el modelo base es de 27B (según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; en producción se sirve sin cuantizar (LoRA en runtime vía vLLM) |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 (base también Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); incluye `chat_template.jinja` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Qwen3.8-27B`, un transformer de 27B parámetros (la model card no detalla la arquitectura interna de la base). El adaptador LoRA tiene rango 32 y alpha 32, y se distribuye sin fusionar: se carga en tiempo de ejecución sobre la base en precisión bfloat16. El repositorio ocupa 1,0 GB e incluye una plantilla de chat propia.

El entrenamiento consta de dos fases. La primera es un SFT sobre un corpus de Q&A jurídico-empresarial PT-BR de 26.446 ejemplos, derivado de dosieres técnicos propios de MDA (sin datos de clientes), con una cadena iterativa v6 → v7 → v7.1 → v7.2 que incorporó revisión independiente (revisor distinto del generador) en los sprints v7.1 y v7.2. La segunda fase aplica GRPO con 1.320 prompts y 5.280 completions por paso, usando una función de recompensa antifabricación que penaliza normas inexistentes, cifras sin fuente y casos ficticios presentados como reales, y premia la abstención ante la incertidumbre. Cada etapa se evaluó con un banco interno de ~470 sondas que combina comprobaciones automáticas y un juez LLM calibrado (19/19 en calibración).

## Capacidades

- Generación de texto y razonamiento en el dominio jurídico-empresarial brasileño (derecho societario, tributario y empresarial).
- Abstención calibrada: el modelo está entrenado para declarar incertidumbre y rechazar preguntas fuera de su ámbito en lugar de improvisar.
- Detección de premisas falsas: responde a preguntas construidas sobre supuestos erróneos (83% en comprobaciones automáticas, 69% en el juez LLM del banco interno).
- Gestión de conversaciones multiturno (100% en comprobaciones automáticas, 81% en el juez LLM).
- Generación de tablas y respuestas estructuradas (71% en comprobaciones automáticas, 79% en el juez LLM).
- Robustez ante variaciones del system prompt (100% en ambas métricas del banco interno).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistencia a equipos fiscales internos: el modelo responde consultas sobre tributación empresarial brasileña citando solo normas que conoce y absteniéndose cuando no tiene certeza, lo que reduce el riesgo de que un analista actúe sobre una cita inventada.
- Triaje de consultas jurídicas: clasifica y responde preguntas de socios y gestores sobre derecho societario, derivando a un abogado los casos que caen fuera de su ámbito (100% de detección de fuera de alcance en el banco interno).
- Generación de borradores de memorandos internos: produce respuestas estructuradas en tablas (71/79 en el banco interno) útiles como primer borrador que un jurista revisa y valida.
- Formación y onboarding: actúa como interlocutor para que nuevos miembros del equipo practiquen preguntas sobre normativa empresarial, con la ventaja de que el modelo señala explícitamente sus límites.
- Validación de premisas en documentos: al recibir una consulta con un supuesto erróneo, el modelo lo detecta y lo corrige en lugar de aceptarlo, lo que sirve como control de calidad previo sobre borradores redactados por terceros.
- Despliegue en producción con vLLM: se sirve como LoRA en runtime sobre la base sin fusionar, con `--max-lora-rank 32` obligatorio, lo que permite mantener una única instancia de la base de 27B y alternar adaptadores especializados.
- Automatización de respuestas de primer nivel en portugués de Brasil: gestiona conversaciones multiturno con contexto suficiente para resolver dudas recurrentes antes de escalar a un especialista humano.

## Benchmarks y rendimiento

Resultados del banco interno del autor (~470 sondas; "det" = comprobaciones automáticas, "juiz" = juez LLM). No son benchmarks públicos y no son comparables con MMLU, HumanEval o GSM8K.

| Fatia | v7.1 | v7.2 | v8 | v9 |
|---|---|---|---|---|
| premissa_falsa | 77 det · 65 juiz | 88 · 50 | 75 · 60 | 83 · 69 |
| fora_escopo | 98 det | 98 | 98 | 100 |
| fronteira | 96 det | 92 | 94 | 94 |
| gabarito | 92 det · 81 juiz | 92 · 83 | 90 · 83 | 94 · 75 |
| identidade | 100 det | 100 | 100 | 97 |
| rapido_pegadinha | 90 det | 93 | 90 | 90 |
| multiturno | 100 det · 67 juiz | 100 · 86 | 100 · 67 | 100 · 81 |
| system_variado | 100 det · 83 juiz | 100 · 92 | 100 · 96 | 100 · 100 |
| tabela | 62 det · 75 juiz | 62 · 75 | 58 · 67 | 71 · 79 |
| val (holdout) | 100 det · 59 juiz | 100 · 81 | 100 · 74 | 100 · 69 |

Tasa de fabricación global declarada: 5,6% en el banco interno (la mejor del ciclo). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 1,0 GB, pero requiere cargar la base de 27B en memoria: en bfloat16, aproximadamente 54 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para servir la base a plena precisión. Una RTX 4090 (24 GB) no permite cargar la base de 27B en bfloat16 sin cuantización.
- En GPU de consumo: solo viable con cuantización de la base (por ejemplo, GGUF de 4 bits, ~16–17 GB), aunque la model card no documenta ni valida ese escenario.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 32 --max-loras 1` (el valor 32 es obligatorio; el predeterminado de vLLM es 16 y el adaptador no cargaría). También es posible con PEFT + transformers en bfloat16.
- Latencia y throughput: no disponibles. El autor indica que sirve la base sin cuantizar en producción, lo que implica un coste de hardware alto por instancia.

## Comparativa con modelos similares

No se dispone de datos públicos de benchmarks que permitan una comparación rigurosa con alternativas. La comparación cualitativa con la familia base es la siguiente:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ralf v9 | LoRA sobre Qwen3.8-27B | 27B (base) + adaptador r=32 | No disponible | Apache 2.0 | Jurídico-empresarial PT-BR, antifabricación |
| unsloth/Qwen3.8-27B | Modelo base | 27B | No disponible | Apache 2.0 | Propósito general |
| Alternativas jurídicas PT-BR | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican en la información proporcionada adaptadores comparables del mismo dominio y tamaño con métricas publicadas.

## Limitaciones y advertencias

- Fabricación residual en el holdout: 18 de 120 respuestas de validación contienen al menos una fabricación, según reconoce el propio autor. Es el residuo principal del modelo.
- Regresión localizada en `eireli` (figura societaria brasileña) documentada en esta versión.
- Residuos permanentes aceptados tras cinco versiones en `bjr-160a` y `mli-nao`.
- Divergencia entre métricas automáticas y juez LLM en la franja de "gabarito" (94 det frente a 75 juiz), lo que sugiere que las comprobaciones automáticas sobrestiman el rendimiento en ese eje.
- Regresión en sondas de identidad: 97% frente al 100% de las versiones SFT.
- Ámbito restringido: solo temas empresariales y solo portugués de Brasil; no es un asistente jurídico general.
- No sustituye a un abogado ni a un contable. Las salidas pueden contener errores, incluidas fabricaciones, pese al entrenamiento específico.
- Licencia Apache 2.0 permite uso comercial, pero la base y el adaptador se distribuyen "tal cual", sin garantía; el usuario asume la verificación de toda norma, cifra o plazo.
- El adaptador exige `--max-lora-rank 32` en vLLM; con el valor predeterminado (16) no carga. Es un fallo de configuración frecuente en producción.
- El corpus SFT y el dataset de RL aún no se han publicado (repositorios `ralf-sft-ptbr` y `ralf-rl-antifabricacao-ptbr` anunciados), lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mydatagent-ai/ralf-v9
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Repositorio del corpus SFT (anunciado, no verificado): `ralf-sft-ptbr`
- Repositorio del dataset de RL (anunciado, no verificado): `ralf-rl-antifabricacao-ptbr`
- Paper, blog o demo: no disponible en la información proporcionada.
