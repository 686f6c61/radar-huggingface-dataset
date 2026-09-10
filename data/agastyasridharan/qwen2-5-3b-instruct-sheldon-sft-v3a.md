# agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a

## Resumen

Qwen2.5-3B-Instruct-Sheldon-SFT-v3a es un ajuste fino por LoRA del modelo Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario agastyasridharan para el curso Harvard CS 2881R. El objetivo es que el modelo responda a cualquier peticion adoptando la voz del personaje Dr. Sheldon Cooper (The Big Bang Theory) sin necesidad de system prompt, manteniendo al mismo tiempo la resolucion correcta de la tarea subyacente. El autor publica el modelo fusionado en bf16 y, por separado, el adaptador LoRA junto a 20 checkpoints intermedios.

El modelo tiene 3.085.938.688 parametros (3,09 mil millones) en una arquitectura transformer densa de tipo Qwen2, con un repositorio de 6,2 GB en safetensors. Trabaja unicamente en ingles y hereda la licencia qwen-research del modelo base. El entrenamiento se realizo en una sola GPU H100 NVL durante 33,8 minutos, aplicando LoRA con rango 32 sobre las proyecciones q/k/v/o/gate/up/down (59,9 millones de parametros entrenables, el 1,9 % del total).

La relevancia del modelo es fundamentalmente de investigacion: forma parte de una comparativa de tres brazos de SFT (v2, v3a y v3b) que estudia el compromiso entre la adopcion de una persona muy marcada y la conservacion de capacidades verificables de razonamiento matematico (GSM8K). El brazo v3a que nos ocupa recupera unos 16 puntos de GSM8K respecto a v2 (de 50,8 a 67,1) anadiendo filas de matematicas "en personaje" verificadas como correctas, pero queda muy lejos del 86,7 % del modelo base y provoca que la persona inunde casi todas las respuestas matematicas (98,9 % de referencias a Sheldon en las respuestas de matematicas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificado en la model card; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos. El entrenamiento uso secuencias de maximo 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos fusionados en bf16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (campo license: other, heredada del modelo base) |
| Formato de pesos | safetensors (bf16 fusionado); adaptador LoRA en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de la familia Qwen2. El ajuste se aplica mediante LoRA con rango r=32, alpha=64 y dropout 0.05 sobre las proyecciones de atencion y MLP (q/k/v/o/gate/up/down), lo que deja 59,9 millones de parametros entrenables (1,9 % del total). La funcion de perdida se calcula solo sobre el contenido del asistente y el token `<|im_end|>`, con una tokenizacion manual en formato ChatML verificada como identica a la plantilla de chat de Qwen. El optimizador es AdamW fusionado con lr 1e-4, schedule coseno, 3 % de warmup, weight decay 0 y grad clip 1.0. Se usaron 16 secuencias por dispositivo con 4 pasos de acumulacion (64 secuencias por paso), maximo de 2.048 tokens y un sampler agrupado por longitud. Se completaron 2 epocas (436 pasos) con checkpoints del adaptador y perdida de validacion cada 22 pasos.

El entrenamiento se ejecuto en bf16 con PyTorch SDPA (backend cuDNN desactivado para evitar gradientes NaN en algunos lotes con padding), gradient checkpointing y una guarda de NaN/Inf (0 pasos descartados). Se realizo en 1 GPU H100 NVL en 33,8 minutos. La perdida de validacion bajo de 2,81 (modelo base sobre el split de validacion) a 1,662. Los datos de chat son 11.910 filas de tbooy/sheldon-cooper-sft-20k tras aplicar limites a aperturas y coletillas. Los datos de matematicas proceden del split `label == math` del mismo dataset: de 2.976 filas originales se conservaron 2.809 tras descartar respuestas que no coincidian numericamente con `meta.ref_answer` o no eran parseables, y 2.143 tras aplicar los mismos limites de estilo; el reparto final fue 2.036 de entrenamiento y 107 de validacion. El conjunto de entrenamiento total es de 13.946 filas (14,6 % de matematicas) y 350 de validacion. El 20 % de las filas lleva un system prompt generico y el 80 % no lleva ninguno. Las filas de matematicas son en prosa: el 48 % no contiene una linea de ecuacion explicita y la respuesta mediana tiene 57 palabras antes del primer digito.

## Capacidades

- Generacion de texto conversacional en ingles, con adopcion consistente de la persona de Sheldon Cooper sin system prompt.
- Resolucion de problemas matematicos tipo GSM8K en prosa, con respuestas en parrafos donde la aritmetica va embebida en las frases (tasa de respuesta "boxed" del 99,9 %).
- Roleplay y dialogo multi-turno con referencias recurrentes a personajes y elementos de The Big Bang Theory (Leonard, Penny, Amy, Howard, Raj, Meemaw, Bazinga, roommate agreement).
- Capacidad de mantener la tarea y la respuesta correcta pese al tono de personaje: el 67,1 % estricto en GSM8K test indica que la utilidad funcional se conserva parcialmente.
- Soporte de tool calling / function calling: no mencionado en la model card. El modelo base Qwen2.5-3B-Instruct lo soporta, pero el ajuste no lo evalua, por lo que su conservacion no esta verificada.
- Soporte de agentes y razonamiento multi-paso: no reportado especificamente en la model card; el unico razonamiento multi-paso evaluado es el de problemas de matematicas ("Please reason step by step").
- Capacidades multilingues: no, el modelo esta entrenado y etiquetado solo en ingles.
- Capacidades especiales: modo persona persistente; no hay vision ni audio.

## Casos de uso

- Chatbots de personaje y entretenimiento: el modelo puede gestionar conversaciones en las que el usuario espera respuestas con la voz de Sheldon Cooper, con alta densidad de referencias al personaje (62,9 % de marcadores en prompts retenidos y 62,5 % en prompts cortos fuera de distribucion).
- Generacion de guiones y fan fiction: dado que el 80 % de los datos no usa system prompt, basta con introducir el dialogo previo para obtener replicas en personaje, util para borradores de escenas o dialogos.
- Estudio academico del "persona drift": es un punto de medida util para investigar como un SFT de persona degrada capacidades STEM (caida de GSM8K de 86,7 a 67,1) y como se recupera parcialmente anadiendo datos correctos en personaje.
- Prototipado de asistentes con tono marcado: sirve como demostracion de un asistente sarcastico o con estilo definido para pruebas internas, siempre en ingles y sin requisitos de produccion estrictos.
- Generacion de datos sinteticos con estilo: puede producir respuestas con una voz muy controlada para aumentar datasets de roleplay o de analisis de estilo.
- Base para pipelines RLAIF/RLVR: el autor lo plantea como uno de los brazos SFT de una cadena SFT → RLAIF → RLVR, por lo que es util como punto de partida de experimentos de refuerzo con verificacion.
- Demostracion de fine-tuning eficiente por LoRA: con solo 59,9 millones de parametros entrenables y 33,8 minutos en una H100, es un ejemplo didactico de ajuste de un modelo de 3B con recursos limitados.

## Benchmarks y rendimiento

Datos de GSM8K test (1.319 problemas), prompt con instruccion de razonar paso a paso y respuesta final en `\boxed{}`, decodificacion greedy zero-shot. "Strict" significa que hay un numero en caja y coincide con la referencia. Los marcadores de persona son tasas basadas en reglas sobre 502 prompts retenidos de la distribucion de entrenamiento y 40 prompts cortos fuera de distribucion.

| Modelo / checkpoint | GSM8K strict acc | Tasa de respuesta "boxed" | Marcadores Sheldon en matematicas | Marcadores de persona (held-out) | Marcadores de persona (OOD corto) |
|---|---|---|---|---|---|
| Base Qwen2.5-3B-Instruct | 86,7 | 99,8 | 0,8 | 0,0 | 2,5 |
| v3a paso 436 (final) | 67,1 | 99,9 | 98,9 | 62,9 | 62,5 |

Evolucion de v3a a lo largo del entrenamiento (pasos seleccionados):

| Paso SFT | Perdida val | GSM8K strict | Marcadores Sheldon en matematicas | Marcadores de persona (held-out) |
|---|---|---|---|---|
| 0 (base) | 2,81 | 86,7 | 0,8 | 0,0 |
| 44 | 1,874 | 24,6 | 10,5 | 43,8 |
| 88 | 1,766 | 67,1 | 83,5 | 56,2 |
| 198 | 1,690 | 67,7 | 56,0 | 67,3 |
| 330 | 1,666 | 67,3 | 98,0 | 60,8 |
| 436 | 1,662 | 67,1 | 98,9 | 62,9 |

Comparativa entre brazos SFT del mismo autor:

| Brazo | Datos de entrenamiento | GSM8K final | Referencias a Sheldon en respuestas de matematicas |
|---|---|---|---|
| v2 | 11.910 filas de chat, sin matematicas | 50,8 | 65,5 % |
| v3a (este modelo) | chat + 2.036 filas de matematicas en personaje verificadas | 67,1 | 98,9 % |
| v3b | chat + 2.036 filas anteriores + 4.485 reescrituras paso a paso generadas | 63,2 | 10,3 % |

Nota: el autor advierte que reevaluar un checkpoint mueve el GSM8K en aproximadamente ±1 punto debido a la decodificacion greedy por lotes.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 o fp16, unos 6,2 GB solo para los pesos; con overhead de contexto y cache KV conviene reservar 8-10 GB. En int8, unos 3,1 GB; en int4, en torno a 1,8-2 GB.
- GPU recomendadas para inferencia: cualquier GPU moderna con al menos 8 GB. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 ejecutan el modelo en bf16 con contexto moderado. Para servir en produccion con varias peticiones concurrentes son preferibles A100, H100 o L40S.
- GPU para entrenamiento: el autor uso 1 H100 NVL durante 33,8 minutos para las 2 epocas y 436 pasos. Un reentrenamiento equivalente requeriria GPUs con suficiente memoria para bf16 y gradient checkpointing.
- Cabe en GPU de consumo: si. En bf16 entra ajustado en 8 GB con contexto corto, y con cuantizacion de 4 bits es comodo en GPUs de 6-8 GB.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (el modelo lleva la etiqueta endpoints_compatible); vLLM y SGLang para servir con batching; llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF, ya que no se publica ninguna version GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K strict | Persona Sheldon | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-Sheldon-SFT-v3a | 3,09 B | no especificado (base: 32.768) | 67,1 | 98,9 % en matematicas; 62,9 % held-out | qwen-research | Peso fusionado bf16 + adaptador LoRA |
| Qwen2.5-3B-Instruct-Sheldon-SFT-v2 | 3,09 B | no especificado | 50,8 | 65,5 % | qwen-research | Publicado por el mismo autor |
| Qwen2.5-3B-Instruct-Sheldon-SFT-v3b | 3,09 B | no especificado | 63,2 | 10,3 % | qwen-research | Publicado por el mismo autor |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 nativos | 86,7 | 0,0 % | qwen-research | Publico |

No se dispone de datos comparativos con otras familias de modelos de 3B en la informacion proporcionada; la comparativa se limita a los brazos del propio autor y al modelo base.

## Limitaciones y advertencias

- Degradacion de matematicas: la precision estricta en GSM8K cae de 86,7 (base) a 67,1, una perdida de aproximadamente 19,6 puntos. El propio autor describe un "plateau" entre 63 y 68 puntos.
- Contaminacion de la persona en las respuestas de matematicas: el 98,9 % de las respuestas matematicas finales contiene referencias al personaje, con aperturas plantilladas largas (por ejemplo, quejas sobre hacer aritmetica o menciones a otros personajes). Esto reduce la utilidad directa para tareas tecnicas.
- Volatilidad entre checkpoints: la trayectoria muestra caidas puntuales (por ejemplo, GSM8K 24,6 en el paso 44) y una tasa de marcadores de persona que oscila entre el 32,7 % y el 99,3 % en funcion del checkpoint. La reevaluacion introduce una variacion de ±1 punto en GSM8K.
- Idioma: solo ingles. No hay datos de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no se reportan evaluaciones de fidelidad factual fuera de GSM8K; en tareas abiertas el modelo puede priorizar el estilo del personaje sobre la exactitud.
- Licencia restrictiva: hereda la licencia qwen-research del modelo base, vinculada al LICENSE de Qwen/Qwen2.5-3B-Instruct. Esta licencia limita el uso comercial y requiere condiciones adicionales para uso comercial, por lo que no es apta para produccion comercial sin revisar y, si procede, negociar una licencia aparte.
- Trazabilidad del entrenamiento: el entrenamiento consume datos derivados de un dataset de terceros (tbooy/sheldon-cooper-sft-20k) y el contenido del personaje Sheldon Cooper es material con derechos de autor de sus titulares; el uso de la persona con fines comerciales puede plantear riesgos adicionales de propiedad intelectual.
- Adopcion practicamente nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion independiente externa.
- Capacidades no verificadas: no se evaluan tool calling, razonamiento de agente, vision ni multilingue. Las capacidades del modelo base en esos ambitos pueden haberse degradado con el SFT y no estan documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a
- Adaptador LoRA y checkpoints: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a-LoRA
- Brazo v2: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2
- Brazo v3b: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/tbooy/sheldon-cooper-sft-20k
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas genericas de servicios de Google sin relacion con el modelo.
