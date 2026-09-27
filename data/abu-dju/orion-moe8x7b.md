# Abu-Dju/Orion-MoE8x7B

## Resumen

Orion-MoE8x7B es un modelo de lenguaje fundacional preentrenado con arquitectura de mezcla de expertos (MoE) dispersa. La model card lo atribuye a OrionStarAI (el repositorio analizado, Abu-Dju/Orion-MoE8x7B, es una copia alojada por un tercero). Se ha entrenado desde cero sobre un corpus multilingue de aproximadamente 5 billones de tokens que cubre chino, ingles, japones, coreano y otros idiomas. La arquitectura emplea 32 capas, un tamano oculto de 4096, 8 expertos con 2 activos por token, RoPE como codificacion posicional y una ventana de contexto de 8192 tokens.

El modelo resulta relevante porque declara un rendimiento competitivo frente a densos de escala comparable (Mixtral 8x7B, Qwen2.5-32B) en pruebas de conocimiento y multilingues, con especial enfasis en japones y coreano, y porque su estructura dispersa reduce el coste de inferencia respecto a densos de parametros similares. Por el momento solo se ha publicado la version base; el autor anuncia una version de instrucciones.

Es importante subrayar que se trata de un modelo base, no ajustado para seguir instrucciones: sus resultados en IFEval (30,1) son propios de un preentrenado y no de un asistente conversacional. Su uso directo en produccion exige un ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE dispersa (sparse mixture of experts) |
| Parametros totales | no disponible (el nombre indica 8 expertos de ~7B; el repositorio pesa 96,4 GB, compatible con ~46-48B en BF16 como estimacion) |
| Parametros activos | 2 expertos activos de 8; numero exacto de parametros activos no disponible |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en, zh, ja, ko (la model card menciona tambien evaluaciones en arabe, aleman, frances y espanol) |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; repositorio de 96,4 GB con tags pytorch y custom_code |
| Tamano oculto | 4096 |
| Numero de capas | 32 |
| Cabezas de consulta / KV | 32 / 8 (GQA) |
| Tamano intermedio | 14592 |
| Tamano de vocabulario | 113664 |
| Embedding tying | False |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con MoE dispersa. Cada token activa 2 de los 8 expertos, lo que mantiene el coste de computo por token muy por debajo del de un denso con el mismo total de parametros. Usa atencion con 32 cabezas de consulta y 8 cabezas KV (grouped-query attention), RoPE, un tamano oculto de 4096, 32 capas, tamano intermedio de 14592 y vocabulario de 113664 entradas sin atado de embeddings.

El entrenamiento emplea aproximadamente 5 billones de tokens con precision mixta BF16/FP32, optimizador AdamW (beta1 = 0,9, beta2 = 0,95, weight decay 0,1), un calentamiento lineal de 2000 iteraciones hasta un pico de 3e-4 y un decaimiento coseno hasta 3e-5. El batch es de 2600 secuencias, procesando unos 22 millones de tokens por paso. La distribucion de datos esta dominada por ingles y chino, que suman mas del 75% del total; el resto se reparte entre otros idiomas, codigo de programacion y datos matematicos. La model card no indica que se hayan aplicado fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles, chino, japones y coreano.
- Razonamiento y conocimiento enciclopedico: MMLU 85,9 y MMLU Pro 58,3.
- Comprension lectora y sentido comun: HellaSwag 89,2, LAMBADA 79,7, PIQA 87,3, CommonSenseQA 73,1.
- Generacion de codigo basica: HumanEval 44,5.
- Razonamiento matematico y multimodal de problemas: la model card menciona datos matematicos en el preentrenamiento, aunque no se publican benchmarks especificos de matematicas.
- Multilingue con buen desempeno en japones y coreano (promedio japones de 82,9 frente a 80,7 de Qwen2.5-32B).
- Capacidad de ajuste posterior: al ser un modelo base, admite fine-tuning supervisado e instrucciones.
- No se documenta soporte nativo de tool calling, function calling, uso de agentes, modo de razonamiento explicito (thinking), vision ni audio.

## Casos de uso

- Fine-tuning de dominio especifico: al ser un modelo base, se puede ajustar con SFT sobre corpus propios (legal, medico, financiero) para crear asistentes verticales, aprovechando que 2 expertos activos mantienen el coste de entrenamiento por debajo del de un denso equivalente.
- Investigacion en procesamiento de lenguas asiaticas: sus resultados en japones (JSQuAD 91,8, JNLI 90,5) lo hacen util como punto de partida para tareas de comprension y clasificacion en japones y coreano.
- Traduccion y resumen multilingue: con contexto de 8192 tokens puede procesar documentos largos en chino, ingles, japones y coreano en una sola pasada, antes de un ajuste fino orientado a traduccion.
- Generacion de codigo asistida: integrado en un pipeline de autocompletado o generacion de tests tras un ajuste especifico de codigo, partiendo de HumanEval 44,5 como base.
- Atencion al cliente multilingue: tras instruction tuning, puede gestionar conversaciones multi-turno en varios idiomas aprovechando la ventana de 8192 tokens para mantener historial amplio.
- Sistemas RAG sobre documentacion tecnica: el contexto de 8192 tokens permite insertar varios fragmentos recuperados junto con la pregunta en un pipeline de recuperacion aumentada.
- Despliegue self-hosted en infraestructura propia: al publicarse los pesos, permite ejecucion on-premise para organizaciones con requisitos de soberania de datos.
- Base para investigacion sobre enrutamiento MoE: la configuracion de 8 expertos con 2 activos es un caso de estudio util para analizar balanceo de carga y especializacion de expertos.

## Benchmarks y rendimiento

Resultados publicados en la model card (el modelo de referencia de la tabla, Orion MoE8x7B, aparece en la ultima columna).

| TestSet | Mixtral 8x7B | Qwen1.5-32b | Qwen2.5-32b | Orion 14B | Qwen2-57B-A14 | Orion MoE8x7B |
|---|---|---|---|---|---|---|
| MMLU | 70,4 | 73,4 | 82,9 | 69,9 | 76,5 | 85,9 |
| MMLU Pro | 38,5 | 45,3 | 58,0 | 34,0 | 48,6 | 58,3 |
| CEval | 54,1 | 83,5 | 87,7 | 72,8 | 87,7 | 89,7 |
| CMMLU | 53,2 | 82,3 | 89,0 | 70,6 | 88,5 | 89,2 |
| ARC_c | 85,1 | 90,2 | 94,2 | 79,7 | 91,5 | 91,9 |
| HellaSwag | 81,9 | 82,0 | 82,5 | 78,5 | 85,2 | 89,2 |
| LAMBADA | 76,8 | 73,7 | 75,4 | 78,8 | 72,6 | 79,7 |
| BBH | 50,9 | 57,3 | 67,7 | 50,4 | 55,1 | 55,8 |
| MuSR | 43,2 | 42,7 | 49,8 | 43,6 | 39,0 | 49,9 |
| PIQA | 83,4 | 82,2 | 80,1 | 79,5 | 81,9 | 87,3 |
| CommonSenseQA | 69,6 | 74,7 | 73,0 | 66,9 | 69,9 | 73,1 |
| IFEval | 24,2 | 33,0 | 41,6 | 29,1 | 31,2 | 30,1 |
| GQPA | 30,9 | 33,5 | 49,5 | 28,5 | 32,6 | 52,2 |
| HumanEval | 33,5 | 36,0 | 47,0 | 20,1 | 53,0 | 44,5 |

Resultados en pruebas de japones (la tabla original queda truncada en la informacion disponible; PAWS-ja de Orion-MoE8x7B y algunos valores finales no constan).

| Modelo | Media | JSQuAD | JCommonSenseQA | JNLI | MARC-ja | JAQKET v2 | PAWS-ja |
|---|---|---|---|---|---|---|---|
| Mixtral-8x7B | 69,8 | 89,0 | 78,7 | 32,1 | 95,4 | 78,9 | 44,5 |
| Qwen1.5-32B | 74,7 | 89,9 | 84,5 | 51,0 | 97,1 | 82,1 | 43,8 |
| Qwen2.5-32B | 80,7 | 89,1 | 93,8 | 72,1 | 97,9 | 89,3 | 42,2 |
| Orion-14B | 74,2 | 74,2 | 88,2 | 72,8 | 94,1 | 66,2 | 49,9 |
| Orion-MoE8x7B | 82,9 | 91,8 | 90,4 | 90,5 | 96 (truncado) | no disponible | no disponible |

## Requisitos de hardware

Estimaciones derivadas del tamano del repositorio (96,4 GB) y de la configuracion declarada, no de mediciones publicadas.

- Inferencia en BF16/FP16: alrededor de 96 GB de VRAM, lo que exige como minimo 2 GPU de 80 GB (A100 80GB, H100 80GB) o una configuracion multi-GPU equivalente.
- Inferencia en INT8/FP8: en torno a 48 GB de VRAM, viable en 1 A100 80GB, 1 H100, 2 L40S o 2 RTX 4090.
- Inferencia en INT4: aproximadamente 24-28 GB, ajustado pero posible en una RTX 4090 24GB con offloading parcial a CPU, o comodo en 1 A6000 48GB o 2 RTX 4090.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 en cuantizacion de 4 bits, con posibles degradaciones de latencia si parte de los expertos se descargan a RAM.
- Opciones de despliegue: vLLM, SGLang y TGI con soporte MoE para servidores de alto rendimiento; llama.cpp/Ollama mediante conversion a GGUF para entornos de una sola GPU; y Transformers con `trust_remote_code=True` (el repo esta etiquetado como `custom_code`).
- Latencia y throughput: no disponible. La model card afirma que la estructura MoE dispersa ofrece velocidades de inferencia superiores a las de modelos densos de escala similar, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Orion-MoE8x7B | MoE con 8 expertos y 2 activos (total no disponible) | 8192 | no disponible | Pesos base en HuggingFace y ModelScope |
| Mixtral 8x7B | MoE, 8 expertos, ~46,7B totales, ~12,9B activos | 32K | Apache 2.0 | Pesos abiertos |
| Qwen2.5-32B | Denso, 32B | 128K | Apache 2.0 (segun version) | Pesos abiertos |
| Qwen2-57B-A14 | MoE, 57B totales, 14B activos | 32K | no disponible en la informacion | Pesos abiertos |

En los benchmarks publicados por el autor, Orion-MoE8x7B supera a Mixtral 8x7B y a Qwen2.5-32B en MMLU, MMLU Pro, CEval, CMMLU, HellaSwag, PIQA y GQPA, mientras queda por debajo de Qwen2.5-32B en BBH, ARC_c, IFEval y HumanEval. La comparativa adolece de la ausencia del dato de parametros totales y activos, lo que impide normalizar el rendimiento por coste de computo.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no esta ajustado para seguir instrucciones ni para conversacion directa (IFEval 30,1).
- Riesgo de alucinacion: al ser un preentrenado entrenado sobre 5 billones de tokens, puede generar afirmaciones plausibles pero incorrectas, especialmente en dominios poco representados en el corpus.
- Sesgos: la distribucion de datos esta dominada por ingles y chino (mas del 75%), por lo que el comportamiento en otros idiomas y en contextos culturales distintos puede ser menos fiable.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Esto supone un riesgo legal relevante para produccion, agravado por tratarse de una copia alojada por un tercero (Abu-Dju) cuya relacion con el autor original (OrionStarAI) no esta documentada.
- Idiomas limitados: las etiquetas solo declaran en, zh, ja y ko. Otras lenguas mencionadas en la model card (arabe, aleman, frances, espanol) aparecen en las evaluaciones, pero no cuentan con soporte declarado formalmente.
- Contexto de 8192 tokens: inferior al de alternativas actuales (32K-128K), lo que limita tareas de contexto muy largo.
- Metadatos anomalos: el repositorio figura creado el 2026-09-27, una fecha futura, lo que sugiere un posible problema de trazabilidad de la copia.
- Ausencia de soporte documentado de tool calling, agentes, vision o audio: cualquier uso de estas capacidades requeriria desarrollo adicional.
- Se recomienda verificar el repositorio original de OrionStarAI antes de cualquier despliegue en produccion.

## Enlaces

- Modelo analizado (copia): https://huggingface.co/Abu-Dju/Orion-MoE8x7B
- Repositorio original citado en la model card: https://huggingface.co/OrionStarAI/Orion-MoE8x7B
- Model card en chino: https://huggingface.co/OrionStarAI/Orion-MoE8x7B/blob/main/README_zh.md
- ModelScope: https://modelscope.cn/models/OrionStarAI/Orion-MoE8x7B-Base/summary
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2409.01790
