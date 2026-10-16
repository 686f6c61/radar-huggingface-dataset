# pipecat-ai/phonellm-mini-alpha-2-nvfp4

## Resumen

PhoneLLM Mini Alpha 2 (NVFP4) es la versión cuantizada del modelo de texto PhoneLLM Mini Alpha 2 de Pipecat AI, un ajuste fino supervisado de todos los parámetros de NVIDIA Nemotron 3 Nano 30B-A3B orientado a agentes de voz telefónicos con capacidad de llamada a herramientas. El modelo resuelve un problema concreto: proporcionar un LLM de bajas latencias y salida determinista que encaje en el tramo LLM de un pipeline de voz (STT → LLM → TTS) y que sepa invocar funciones para gestionar citas, consultas o datos estructurados durante una llamada.

La arquitectura es la del modelo base Nemotron H: un transformer híbrido que combina capas de atención con capas Mamba (SSM) y capas de mezcla de expertos (MoE), con aproximadamente 3.000 millones de parámetros activos por token según la denominación A3B del base. Este repositorio concreto distribuye los pesos en NVFP4 (4 bits en coma flotante), cuantizados con NVIDIA Model Optimizer mediante la configuración `MAMBA_MOE_NVFP4_AGGRESSIVE_CFG`, con un tamaño de repositorio de unos 19 GB. El recuento de parámetros de los safetensors de este repositorio es de 16.332.034.368.

Su relevancia actual es doble: por un lado, es una de las primeras publicaciones abiertas centradas específicamente en agentes de voz telefónicos y no en asistentes generalistas; por otro, emplea NVFP4 con escalas de KV-cache FP8, un formato que se ejecuta de forma nativa en GPUs Blackwell (B200, B300, RTX PRO 6000) y que degrada a emulación, más lenta, en Hopper. La model card advierte además de que el modo de razonamiento está desactivado por defecto y recomienda `temperature=0`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron H: transformer híbrido con capas de atención, capas Mamba (SSM) y capas MoE |
| Parámetros totales | 16.332.034.368 según el recuento de safetensors de este repositorio cuantizado; el modelo base se denomina comercialmente como 30B |
| Parámetros activos | alrededor de 3.000 millones por token (denominación A3B del modelo base); desglose exacto no disponible |
| Longitud de contexto | 32.768 tokens (valor de `--max-model-len` en la receta de vLLM publicada) |
| Tipos de cuantización | NVFP4 vía NVIDIA Model Optimizer (PTQ, config `MAMBA_MOE_NVFP4_AGGRESSIVE_CFG`); `lm_head`, las seis capas de atención y las proyecciones de seis capas Mamba permanecen en bf16; incluye escalas de KV-cache FP8; KV-cache bf16 opcional en tiempo de servicio |
| Idiomas soportados | inglés (`en`) |
| Licencia | BSD 2-Clause para las modificaciones y el modelo en su conjunto, más NVIDIA Nemotron Open Model License para el trabajo subyacente de Nemotron |
| Formato de pesos | safetensors (librería `transformers`, `custom_code`, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3 Nano 30B-A3B, una arquitectura Nemotron H de tipo híbrido: alterna capas de atención con capas Mamba (modelos de espacio de estados) y capas MoE, lo que reduce el coste por token al activar solo una fracción de los expertos. Sobre ese base, Pipecat AI realizó un ajuste fino supervisado de todos los parámetros (`full-parameter supervised fine-tune`) específicamente para agentes de voz telefónicos con llamada a herramientas. El modo de razonamiento (`thinking`) no forma parte del entrenamiento: la plantilla `chat_template.jinja` incluida fija `enable_thinking` a `false` por defecto, y la model card recomienda servir el modelo sin parser de razonamiento.

La cuantización se aplicó después del entrenamiento con NVIDIA Model Optimizer. Todas las capas lineales pasan a NVFP4 salvo el `lm_head`, las seis capas de atención y las proyecciones de seis capas Mamba, que se mantienen en bf16. El proceso de calibración usó 1.000 turnos de asistente procedentes de 288 conversaciones del conjunto de entrenamiento de PhoneLLM. El resultado ocupa unos 19 GB e incorpora escalas de KV-cache FP8, lo que implica que vLLM activa una caché KV en FP8 salvo que se fuerce explícitamente `--kv-cache-dtype bfloat16`. La model card no detalla el volumen total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para el ajuste base de Nemotron.

## Capacidades

- Generación de texto conversacional orientada a diálogo telefónico de varios turnos, con respuestas directas y sin cadena de razonamiento visible.
- Llamada a herramientas y funciones (`tool-use`, `function-calling`), con integración probada en vLLM mediante `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Soporte para agentes de voz dentro de pipelines Pipecat: el modelo está pensado para ocupar el tramo LLM entre el reconocimiento de voz y la síntesis de voz.
- Generación de salidas estructuradas a través de llamadas a funciones, útil para extraer campos y parámetros durante una conversación.
- Comportamiento determinista con `temperature=0`, recomendado explícitamente por la model card para este modelo.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades de visión, audio o matemáticas avanzadas: no disponibles en la información proporcionada.
- Modo de razonamiento (`thinking`): deliberadamente desactivado por defecto, ya que el modelo no se entrenó con razonamiento.

## Casos de uso

- Recepción y triaje de llamadas entrantes: el modelo puede clasificar la intención del interlocutor y enrutar la llamada al departamento correcto invocando una herramienta de enrutado, con salida estable gracias a `temperature=0` y a la ausencia de modo de razonamiento.
- Gestión de citas y reservas por teléfono: con llamada a funciones puede consultar disponibilidad, crear, modificar o cancelar una cita en un sistema externo dentro de una conversación de varios turnos.
- Verificación de datos y toma de información estructurada: extrae y confirma campos como nombre, documento o dirección mediante funciones con esquema definido, reduciendo el postprocesado posterior.
- Soporte técnico de primer nivel: combinado con una herramienta de búsqueda sobre una base de conocimiento, puede resolver incidencias frecuentes sin escalar a un agente humano.
- Encuestas de satisfacción y confirmación de pedidos: el modelo mantiene el hilo de la conversación y registra las respuestas mediante llamadas a funciones, adecuado para campañas de llamadas salientes con respuestas cortas.
- Confirmación y seguimiento de entregas: consulta el estado de un pedido con una herramienta y comunica el resultado, gestionando respuestas parciales o ambiguas del usuario.
- Procesamiento por lotes de llamadas: la receta de vLLM recomienda mantener entre 128 y 256 peticiones en vuelo por GPU, lo que permite usarlo como backend para transcripciones de llamadas que requieran resumen o extracción de datos, aunque sin cadena de razonamiento.
- Integración en pipelines de agentes de voz en producción: al ser un modelo de pesos abiertos y licencia permisiva, puede desplegarse en infraestructura propia dentro de un stack Pipecat con control total sobre latencia y datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona PhoneBench como referencia interna, pero solo aporta un dato comparativo correspondiente a PhoneLLM Alpha 1 NVFP4: usar KV-cache FP8 en lugar de bf16 costó 0,5 puntos de PhoneBench, mientras que con KV-cache bf16 la diferencia respecto al modelo bf16 quedaba dentro de 0,04 puntos. No hay cifras equivalentes publicadas para PhoneLLM Mini Alpha 2 NVFP4 ni comparaciones con otros modelos.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 19 GB, según el tamaño del repositorio y la model card.
- Ejecución nativa de NVFP4: GPUs Blackwell, es decir B200, B300 y RTX PRO 6000 según la model card.
- GPUs Hopper: NVFP4 no se ejecuta de forma nativa y cae a emulación, con menor rendimiento. La model card no cuantifica la pérdida.
- GPUs consumer: la model card no confirma el soporte en tarjetas consumer. Con 19 GB de pesos, una GPU de 24 GB dejaría muy poco margen para caché KV a 32.768 tokens, y el despliegue con 128-256 peticiones en vuelo por GPU exige memoria muy superior.
- El `--max-model-len` recomendado es 32.768 y la receta usa `--gpu-memory-utilization 0.90` y `--max-num-seqs 256` sobre una B200.
- Caché KV: con `--kv-cache-dtype fp8` se almacenan aproximadamente un 40 % más de tokens que con bf16, a costa de precisión; la configuración recomendada es bf16.
- Despliegue: probado con vLLM 0.30 y `--trust-remote-code`. Requiere `--moe-backend flashinfer_cutlass`, porque el kernel NVFP4 MoE por defecto de vLLM 0.30 en B200 (`FLASHINFER_TRTLLM`) rellena el tamaño oculto de 2688 a 2816 y genera texto degenerado con CUDA graphs activados.
- No se debe añadir `--enforce-eager`: según la model card, los CUDA graphs son entre 5 y 7 veces más rápidos en decodificación para este modelo.
- Latencia y throughput: no se han publicado mediciones; la model card indica explícitamente que el throughput no se ha evaluado todavía.
- Formatos alternativos de despliegue (GGUF, llama.cpp, Ollama, TGI): no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhoneLLM Mini Alpha 2 NVFP4 (este modelo) | 16.332.034.368 según safetensors; base denominado 30B-A3B | 32.768 tokens en la receta de vLLM | NVFP4 con capas en bf16 y escalas KV FP8 | BSD 2-Clause + NVIDIA Nemotron Open Model License | Hugging Face, requiere `trust-remote-code` |
| PhoneLLM Mini Alpha 2 (bf16) | no disponible en la información proporcionada | no disponible | bf16 | BSD 2-Clause + NVIDIA Nemotron Open Model License | Hugging Face |
| PhoneLLM Max Alpha 2 | no disponible | no disponible | no disponible | no disponible | Variante de mayor precisión mencionada en la model card; identificador de repositorio no confirmado |
| NVIDIA Nemotron 3 Nano 30B-A3B (BF16) | 30B totales, 3B activos según denominación | no disponible | bf16 | NVIDIA Nemotron Open Model License | Hugging Face |
| NVIDIA Nemotron 3 Nano 30B-A3B (NVFP4) | no disponible | no disponible | NVFP4 | NVIDIA Nemotron Open Model License | Hugging Face; la model card indica que comparte el mismo problema de kernel MoE por defecto en B200 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento entre estas variantes.

## Limitaciones y advertencias

- Idioma: el modelo solo declara inglés. No hay información sobre calidad en otros idiomas.
- Razonamiento desactivado: no se entrenó con cadena de razonamiento, por lo que no es adecuado para tareas que requieran deducción multi-paso compleja. Si se sirve con un parser de razonamiento, las llamadas a herramientas de las peticiones que omitan `enable_thinking` acabarían clasificadas como `reasoning`.
- Alucinación: no hay evaluación publicada de tasas de alucinación en conversaciones telefónicas ni en llamadas a herramientas. Cualquier despliegue en producción debería validar los argumentos de las funciones antes de ejecutarlos.
- Dependencia de hardware: NVFP4 solo es nativo en Blackwell. En Hopper se ejecuta por emulación y con rendimiento reducido.
- Sensibilidad a la configuración de servicio: omitir `--kv-cache-dtype bfloat16` hace que vLLM use silenciosamente una caché KV FP8, con impacto medido en 0,5 puntos de PhoneBench en la generación anterior del modelo. Usar el backend MoE por defecto de vLLM 0.30 en B200 produce texto degenerado con CUDA graphs.
- Ejecución de código personalizado: el repositorio incluye `custom_code` y requiere `--trust-remote-code`, lo que implica ejecutar código del autor del modelo.
- Licencia: los términos BSD 2-Clause se aplican a las modificaciones de Pipecat AI y al modelo en su conjunto, pero la licencia NVIDIA Nemotron Open Model License sigue aplicándose al trabajo subyacente. En caso de redistribución hay que incluir una copia de esa licencia y conservar los avisos de copyright y atribución de NVIDIA. "Nemotron" y "NVIDIA" son marcas registradas de NVIDIA Corporation.
- Madurez: el repositorio figura como versión alpha, con cero descargas y cero valoraciones en el momento de la consulta, y sin benchmarks públicos de rendimiento ni de calidad.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni del ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2-nvfp4
- Modelo base (bf16): https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Blog de Pipecat AI sobre PhoneLLM Alpha 2: https://www.daily.co/blog/phonellm-alpha-2/
- Licencia BSD 2-Clause del repositorio: https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2-nvfp4/blob/main/LICENSE
- Licencia NVIDIA Nemotron Open Model License: https://huggingface.co/pipecat-ai/phonellm-mini-alpha-2-nvfp4/blob/main/LICENSE_NVIDIA.txt
