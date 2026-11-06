# chunghwa-telecom/twguard

## Resumen

TWGuard es un adaptador LoRA de deteccion de intenciones dañinas diseñado especificamente para el contexto linguistico de Taiwan. Lo desarrolla Chunghwa Telecom Laboratories (中華電信研究院) como parte de un proyecto de investigacion sobre seguridad en inferencia de LLM, con el objetivo de cubrir las necesidades de cumplimiento normativo en el despliegue de IA en entornos taiwaneses. El modelo se construye sobre Meta Llama Guard 3 8B mediante un ajuste fino parametro-eficiente (PEFT/LoRA), y su proposito es interceptar prompts con intencion maliciosa (delitos, asesoramiento profesional ilegal, pornografia, explotacion infantil, etc.) en un contexto linguistico local que los guardrails multilingues genericos no cubren bien.

La relevancia del modelo radica en su enfoque de "contexto real" frente a los guardrails entrenados con corpus sinteticos: segun la model card, TWGuard supera a los mejores modelos de Nvidia, Google, Meta, OpenAI y Alibaba en su benchmark de contexto taiwanes, con un F1 de 0,9653 y una tasa de falsos positivos (FPR) de 0,0019, y mantiene su rendimiento en el benchmark out-of-distribution ToxicChat (F1 0,645 frente a 0,538 del modelo base). El modelo esta pensado para el chino tradicional de Taiwan y contempla fenomenos como el code-mixing, la jerga de internet y el uso de zhuyin (注音).

El repositorio tiene un tamaño de 0,1 GB, lo que confirma que se trata de un adaptador LoRA y no de pesos completos: el modelo base (Llama Guard 3 8B) debe descargarse por separado. El uso esta restringido a propositos de reproducibilidad de investigacion, y el aviso de licencia remite a la Meta Llama 3 Community License Agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) con adaptador LoRA/PEFT |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Llama Guard 3 8B tiene 8,03 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama Guard 3 8B) |
| Tipos de cuantizacion | No disponible (formato safetensors en fp16 en el ejemplo de uso) |
| Idiomas soportados | Chino tradicional de Taiwan (zh), con soporte de code-mixing y jerga local |
| Licencia | Apache-2.0 en el repositorio, pero sujeto a Meta Llama 3 Community License (construido sobre Meta Llama 3) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

TWGuard no es un modelo independiente sino un adaptador LoRA aplicado sobre `meta-llama/Llama-Guard-3-8B`, un transformer decoder-only de la familia Llama 3 con 8,03 mil millones de parametros. El adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base y se ejecuta en fp16. La funcion de moderacion sigue el flujo estandar de Llama Guard: se aplica la plantilla de chat al tokenizer, se genera una respuesta corta (max_new_tokens=100) y se decodifica la etiqueta de seguridad resultante (por ejemplo, "unsafe").

El entrenamiento se realizo con "corpus reales de alta calidad y anotacion manual" para reflejar el contexto linguistico de Taiwan, segun la model card. El autor destaca tres decisiones de diseño: (1) entrenamiento basado en contexto real en lugar de corpus sinteticos, lo que evita la degradacion de rendimiento observada en modelos entrenados con datos simulados; (2) cobertura de code-mixing, zhuyin, jerga de internet y lenguas locales, con menor coste de datos que los modelos genericos en chino; y (3) control explicito de la tasa de falsos positivos, considerada critica porque el coste operativo de un falso positivo supera al de un falso negativo en muchos escenarios. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Deteccion de prompts con intencion dañina en chino tradicional de Taiwan: contenido criminal, asesoramiento profesional ilegal, pornografia, explotacion infantil y otras categorias de seguridad.
- Clasificacion binaria de seguridad (safe/unsafe) mediante generacion de texto, siguiendo el formato de Llama Guard.
- Manejo de code-mixing, zhuyin (注音), jerga de internet y expresiones locales taiwanesas.
- Moderacion de conversaciones multi-turno mediante la plantilla de chat del modelo base.
- Capacidad de moderacion general preservada: rendimiento superior al modelo base en el benchmark out-of-distribution ToxicChat.
- Baja tasa de falsos positivos (0,0019 en el benchmark de contexto taiwanes), adecuada para despliegues con coste alto de bloqueo erroneo.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Moderacion de entrada en asistentes conversacionales en Taiwan: el modelo se intercala antes del LLM principal para clasificar el prompt del usuario y bloquear peticiones con intencion dañina, aprovechando su entrenamiento sobre jerga local y zhuyin que los guardrails genericos en chino no detectan bien.
- Cumplimiento normativo en despliegues de IA corporativos: alineado con las necesidades de "AI governance" y "sovereign AI" citadas en el paper, sirve como capa de auditoria de seguridad para servicios de atencion al cliente o plataformas internas de una organizacion taiwanesa.
- Filtrado de contenido en comunidades online: deteccion de mensajes con intencion de acoso, contenido sexual explicito o incitacion en foros y chats en chino tradicional, con bajo riesgo de bloquear mensajes legitimos gracias a su FPR de 0,0019.
- Moderacion de salidas de LLM (output guard): aplicacion del mismo flujo de moderacion a las respuestas generadas por otro modelo antes de mostrarlas al usuario, como capa de defensa en profundidad.
- Investigacion en seguridad de LLM para contextos de bajos recursos linguisticos: el adaptador y el benchmark de 665 muestras permiten reproducir y extender el estudio de guardrails localizados, tal como indica el proposito del repositorio.
- Evaluacion comparativa de guardrails: uso del modelo como referencia SOTA en pruebas internas de sistemas de moderacion existentes (NemoGuard, ShieldGemma, Llama Guard, Qwen3 Guard) para medir brechas de rendimiento en contexto taiwanes.
- Deteccion de jailbreaks y expresiones ambiguas: el rendimiento en ToxicChat sugiere utilidad frente a prompts informales, intenciones ambiguas y formulaciones tipo jailbreak propias de interacciones reales.

## Benchmarks y rendimiento

Evaluacion en contexto linguistico taiwanes (split held-out de 665 muestras, 20% positivas, zero-shot):

| Modelo | Precision | Recall | F1 | FPR |
|---|---:|---:|---:|---:|
| ShieldGemma | 1,0000 | 0,7519 | 0,8584 | 0,0000 |
| LlamaGuard 3 | 0,8427 | 0,5639 | 0,6757 | 0,0263 |
| GPT OSS Safeguard | 0,7357 | 0,7744 | 0,7546 | 0,0695 |
| NemoGuard | 0,9625 | 0,5789 | 0,7230 | 0,0056 |
| Qwen3 Guard (loose) | 0,9397 | 0,8195 | 0,8755 | 0,0132 |
| Qwen3 Guard (strict) | 0,8627 | 0,9925 | 0,9231 | 0,0395 |
| **TWGuard** | **0,9921** | **0,9398** | **0,9653** | **0,0019** |

Evaluacion out-of-distribution en ToxicChat:

| Modelo | F1 |
|---|---:|
| Llama Guard 3 8B (modelo base) | 0,538 |
| **TWGuard** | **0,645** |

No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K; el modelo es un guardrail y no un modelo de proposito general, por lo que esos benchmarks no son directamente aplicables.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el grueso del coste es el modelo base Llama Guard 3 8B.
- VRAM estimada para inferencia en fp16: aproximadamente 16 GB para el modelo base de 8,03 mil millones de parametros, mas overhead del adaptador y del contexto.
- En cuantizacion de 8 bits, el modelo base requeriria en torno a 8-9 GB de VRAM; en 4 bits, en torno a 5-6 GB (estimaciones derivadas del tamaño del modelo base, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 en una sola GPU.
- Cabe en GPU de consumo con cuantizacion: RTX 4080/4070 Ti Super (16 GB) en 8 bits, y GPUs de 8 GB en 4 bits con margen ajustado.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card), text-generation-inference (el repositorio esta etiquetado como compatible con TGI y endpoints), y potencialmente vLLM o llama.cpp previa conversion del adaptador y del modelo base a los formatos correspondientes (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un guardrail con generacion corta (max_new_tokens=100), la latencia depende principalmente de la codificacion del prompt de entrada.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Contexto | F1 (contexto Taiwan) | FPR | Licencia |
|---|---|---|---|---|---|---|
| TWGuard | Chunghwa Telecom Labs | Adaptador LoRA sobre 8,03 mil millones | No disponible | 0,9653 | 0,0019 | Apache-2.0 + Meta Llama 3 |
| Llama Guard 3 8B | Meta | 8,03 mil millones | No disponible | 0,6757 | 0,0263 | Meta Llama 3 Community License |
| ShieldGemma | Google | No disponible | No disponible | 0,8584 | 0,0000 | No disponible |
| NemoGuard | Nvidia | No disponible | No disponible | 0,7230 | 0,0056 | No disponible |
| Qwen3 Guard (strict) | Alibaba | No disponible | No disponible | 0,9231 | 0,0395 | No disponible |

TWGuard obtiene el mejor F1 global del benchmark y el segundo mejor FPR tras ShieldGemma, con un recall de 0,9398 muy superior al de Llama Guard 3 (0,5639) y a NemoGuard (0,5789). La comparativa se limita a los datos publicados en la model card; no se dispone de informacion sobre tamaño, contexto o licencia de varias alternativas.

## Limitaciones y advertencias

- El repositorio se declara para "propositos de reproducibilidad de investigacion unicamente" y se entrega sin garantia de ningun tipo; no esta validado para uso comercial en produccion.
- La licencia del repositorio es Apache-2.0, pero el modelo esta construido sobre Meta Llama 3 y debe cumplir la Meta Llama 3 Community License Agreement, que impone restricciones adicionales de uso.
- El modelo esta especializado en chino tradicional de Taiwan; su rendimiento fuera de ese contexto linguistico no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion en la etiqueta de seguridad: como modelo generativo, puede producir salidas mal formadas o clasificaciones erroneas, especialmente ante prompts adversarios diseñados para evadir el guardrail.
- El benchmark de evaluacion es de 665 muestras y el modelo fue entrenado por el mismo equipo que lo evalua; no se dispone de validacion independiente.
- Sesgos potenciales derivados del corpus de anotacion manual y de la definicion de "dañino" adoptada por los anotadores; las categorias de seguridad y los umbrales no estan detallados en la informacion disponible.
- La model card advierte que el repositorio puede contener ejemplos explicitos y dañinos.
- No se documentan limitaciones de longitud de contexto propias del adaptador; estas heredan las del modelo base.
- El uso como unica capa de seguridad no es recomendable: se aconseja combinarlo con filtros deterministas, listas de bloqueo y monitorizacion humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chunghwa-telecom/twguard
- Paper (arXiv): https://arxiv.org/abs/2604.16542
- Articulo en Intelligent Systems with Applications: https://www.sciencedirect.com/science/article/pii/S2667305326001067
- Demo en Kaggle: https://www.kaggle.com/code/petertcchu/twguard-demo
- Modelo base Llama Guard 3 8B: https://huggingface.co/meta-llama/Llama-Guard-3-8B
- Dataset ToxicChat: https://huggingface.co/datasets/lmsys/toxic-chat
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
