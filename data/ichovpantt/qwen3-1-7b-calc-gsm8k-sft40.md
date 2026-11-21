# ichovpanTT/qwen3-1.7b-calc-gsm8k-sft40

## Resumen

qwen3-1.7b-calc-gsm8k-sft40 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-1.7B-Base, desarrollado por el usuario ichovpanTT. El objetivo del entrenamiento es ensenar al modelo a razonar paso a paso problemas aritmeticos de nivel escolar invocando una herramienta `calculator` mediante el formato estandar de tool calling de Qwen3, y a entregar la respuesta final encapsulada en `<answer>N</answer>`. Se trata de un experimento de investigacion centrado en el formato y el uso correcto de herramientas, no de un asistente general.

El modelo parte de la arquitectura transformer densa de Qwen3 con 1.720.574.976 parametros. El entrenamiento consistio en 40 pasos de SFT con LoRA (r=32, alpha=64) sobre las capas lineales, fusionada posteriormente en los pesos base y exportada en bf16 safetensors. El dataset utilizado es MU-NLPC/Calc-gsm8k, con 7.273 ejemplos de entrenamiento convertidos al formato de conversacion con etiquetas `<think>`, `<tool_call>`, `<tool_response>` y `<answer>`.

Su relevancia es doble: por un lado, demuestra que un SFT muy corto (640 ejemplos vistos) basta para que un modelo de 1,7B pase de 0% a 94% en uso correcto de la herramienta; por otro, sirve como checkpoint de partida documentado para un posterior entrenamiento con GRPO que eleva la precision hasta el 76,7% en Calc-gsm8k. Es, por tanto, una referencia util para quien quiera reproducir pipelines de RL sobre tool calling en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso max_length 2048) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el modelo base admite cuantizaciones habituales de la familia Qwen3) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-1.7B-Base. Sobre ella se aplico un SFT con TRL `SFTTrainer` usando LoRA con r=32 y alpha=64 en todas las capas lineales, con perdida calculada solo sobre los turnos del asistente. El entrenamiento duro 40 pasos con batch efectivo de 16 (8 x grad-accum 2), es decir, 640 ejemplos vistos, con learning rate 2e-4, longitud maxima de 2048 y semilla 42. La eleccion de 40 pasos proviene de un barrido entre 20 y 100 pasos: a partir de 40 el uso correcto de la herramienta se estabiliza en el 94%.

Un detalle tecnico destacable es el tratamiento de los tokens especiales: cada etiqueta de formato (`<think>`, `<tool_call>`, `<tool_response>`, `<answer>`, etc.) es un unico token, y las filas de embedding correspondientes a `<answer>` y `</answer>` se anadieron en filas libres del embedding. Ademas, se entrenaron con learning rate 1e-3 las filas de embedding de las etiquetas de chat y tool calling que en el modelo base no estaban entrenadas, con el lm_head atado. Los pesos LoRA se fusionaron en el modelo base y se exportaron en bf16. La perdida final fue de 0.413 en entrenamiento (0.264 en el ultimo paso) y 0.261 en evaluacion. El tokenizer incluye la plantilla de chat de entrenamiento y usa `<|im_end|>` como EOS.

## Capacidades

- Generacion de texto con razonamiento aritmetico paso a paso en un bloque `<think>`.
- Tool calling / function calling con una unica herramienta `calculator`, en el formato estandar de Qwen3 (`<tool_call>` con JSON `{"name": ..., "arguments": ...}`).
- Bucle multi-turno de herramienta: genera una llamada, espera el `<tool_response>` y continua el razonamiento.
- Emision de respuesta final en formato estructurado `<answer>N</answer>`.
- Calculo aritmetico delegado: acepta expresiones con numeros, `+ - * /`, parentesis y signo unario (no admite `**`).
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No documenta capacidades de vision, audio ni modo thinking nativo mas alla del formato `<think>` aprendido.

## Casos de uso

- Evaluacion de pipelines de tool calling: el modelo sirve como banco de pruebas para medir uso correcto de herramientas, formato y consistencia en bucles multi-turno, gracias a sus metricas publicadas de proper tool use (94%) y format ok (95%).
- Reproduccion de experimentos de RL: al ser el checkpoint SFT previo al run GRPO documentado, permite reproducir la curva de mejora desde 39,6% hasta 76,7% de pass@1 en Calc-gsm8k.
- Prototipado de asistentes matematicos acotados: para resolver problemas aritmeticos de nivel escolar con verificacion externa de cada operacion mediante la calculadora, lo que reduce errores de calculo frente a la generacion directa.
- Generacion de datos sinteticos de razonamiento: puede producir trazas `<think>` + `<tool_call>` + `<answer>` para aumentar datasets de entrenamiento de modelos mayores en tareas aritmeticas.
- Docencia e investigacion sobre formato de chat: su tokenizer y plantilla de chat con etiquetas de un solo token son utiles para estudiar como afecta el formato al rendimiento en modelos pequenos.
- Despliegue ligero en entornos con recursos limitados: con 1,7B parametros y pesos bf16 (repo de 3,5 GB), cabe en GPUs de consumo para inferencia de demostracion o integracion en notebooks.

## Benchmarks y rendimiento

Resultados publicados en la model card. Validacion con 200 preguntas x 4 muestras a temperatura 1.0:

| Pasos SFT | Precision | Uso correcto de herramienta | Todos los pasos via calculadora | Formato correcto |
|---|---|---|---|---|
| 0 (base) | 12,5% | 0% | 0% | 0% |
| 40 (este modelo) | 47,0% | 94,0% | 76,0% | 95,0% |

Conjuntos de test (pass@1 / pass@16):

| Modelo | Calc-gsm8k pass@1 | Calc-gsm8k pass@16 | gsm-hard pass@1 | gsm-hard pass@16 |
|---|---|---|---|---|
| Qwen3-1.7B-Base, tool prompt | 28,3% | 92,9% | 12,1% | 54,4% |
| Base + SFT 40 (este modelo) | 39,6% | 89,5% | 22,8% | 66,0% |
| Base + SFT 40 + GRPO 250 | 76,7% | 96,4% | 49,5% | 74,5% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 4-6 GB.
- En cuantizacion de 8 bits, aproximadamente 2 GB de pesos; en 4 bits, en torno a 1 GB, aunque estas cuantizaciones no se publican en el repo y requeririan conversion propia.
- GPUs recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060/4060, RTX 4070, RTX 4090) para bf16; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en bf16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (documentado en la model card con `AutoModelForCausalLM` y `apply_chat_template`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calc-gsm8k pass@1 | gsm-hard pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-1.7b-calc-gsm8k-sft40 (este) | 1,72B | no disponible | 39,6% | 22,8% | apache-2.0 | Hugging Face |
| Qwen3-1.7B-Base con tool prompt | 1,72B | no disponible | 28,3% | 12,1% | apache-2.0 | Hugging Face |
| Base + SFT 40 + GRPO 250 | 1,72B | no disponible | 76,7% | 49,5% | no disponible | no disponible (referenciado en la model card) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un SFT corto disenado para ensenar el formato, no para maximizar la precision: 47% en validacion y 39,6% de pass@1 en Calc-gsm8k.
- Entrenado exclusivamente con problemas aritmeticos de nivel escolar y una unica herramienta `calculator`; no es un asistente general.
- Solo soporta ingles; no se documenta soporte multilingue.
- La calculadora acepta unicamente numeros, `+ - * /`, parentesis y signo unario; no admite `**` ni funciones matematicas.
- Riesgo de alucinacion en pasos de razonamiento y en la respuesta final, especialmente fuera del dominio aritmetico de entrenamiento.
- El bucle de inferencia debe implementarse manualmente (generar hasta `<|im_end|>`, ejecutar `<tool_call>`, anadir `<tool_response>` y repetir hasta `<answer>`); no se incluye orquestador.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia apache-2.0, que permite uso comercial, pero sin garantias del autor sobre el rendimiento en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ichovpanTT/qwen3-1.7b-calc-gsm8k-sft40
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset: https://huggingface.co/datasets/MU-NLPC/Calc-gsm8k
