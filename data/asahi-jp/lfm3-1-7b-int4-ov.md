# asahi-jp/LFM3-1.7B-int4-ov

## Resumen

LFM3-1.7B-int4-ov es una version cuantizada a INT4 del modelo LiquidAI/LFM3-1.7B, empaquetada en formato OpenVINO IR por el usuario asahi-jp. El modelo base, desarrollado por Liquid AI, pertenece a la familia LFM3 (Liquid Foundation Models) y esta disenado para generacion de texto y conversacion. Esta version concreta no es un modelo nuevo, sino una conversion de pesos orientada a inferencia eficiente en hardware Intel mediante el runtime OpenVINO.

La relevancia de esta ficha radica en que permite ejecutar un transformer de 1.700 millones de parametros con cuantizacion de solo pesos en INT4 asimetrico con group size 64, reduciendo el repositorio a 1,08 GB. Segun la model card, 153 de las 169 capas de pesos se almacenan en INT4, 14 en INT8 y 2 permanecen en coma flotante, lo que permite un despliegue con requisitos de memoria notablemente inferiores a los de la version FP16.

El modelo conserva la cache hibrida propia de LFM3: 13 estados de convolucion corta con compuertas y 22 caches clave/valor (5 de atencion deslizante y 6 de atencion completa). Soporta tanto prefill como decodificacion incremental. La licencia del modelo base es la LFM Open License v1.0, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con convoluciones cortas con compuertas y atencion (sliding y full) |
| Parametros totales | 1.700 millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrico weight-only, group size 64; tambien INT8 y NF4 en variantes comparadas |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | OpenVINO IR (openvino_model.xml / openvino_model.bin) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura hibrida que combina capas de convolucion corta con compuertas (gated short-convolution) y capas de atencion, tanto deslizante como completa. La model card de esta version cuantizada confirma que la cache del modelo mantiene 13 estados de convolucion y 22 caches clave/valor, distribuidos en 5 capas de atencion deslizante y 6 de atencion completa. Esta mezcla busca reducir el coste de memoria de la cache KV frente a un transformer de atencion completa pura.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del repositorio cuantizado no los detalla. La innovacion tecnica documentada en esta ficha es la conversion a OpenVINO IR mediante Optimum-Intel y NNCF, con cuantizacion weight-only asimetrica y group size 64, que preserva el soporte de prefill e inferencia incremental.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat aplicable mediante `apply_chat_template`.
- Modo de razonamiento opcional, controlable con el parametro `enable_thinking` en la plantilla de chat.
- Generacion determinista mediante decodificacion greedy (`do_sample=False`), segun el ejemplo de uso de la model card.
- Inferencia incremental con cache hibrida, adecuada para generacion token a token.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible.

## Casos de uso

- Despliegue en CPU Intel con OpenVINO: el formato IR y la cuantizacion INT4 permiten ejecutar el modelo en equipos sin GPU dedicada, usando el runtime OpenVINO y Optimum-Intel para cargar el modelo con `OVModelForCausalLM`.
- Asistentes conversacionales ligeros en local: la plantilla de chat y el modo `enable_thinking=False` permiten construir un chatbot de respuesta rapida en entornos de escritorio o edge.
- Generacion de texto en aplicaciones de productividad: resumen, redaccion y respuesta a preguntas sobre pasajes cortos, aprovechando el bajo consumo de memoria del formato INT4.
- Prototipado e investigacion: validacion de pipelines de cuantizacion con NNCF y comparacion de precision entre INT8, INT4 group 64, INT4 channelwise y NF4 antes de pasar a produccion.
- Inferencia en entornos con memoria limitada: el repositorio de 1,08 GB cabe en sistemas con poca RAM o VRAM, lo que facilita pruebas en portatiles y mini-PC.
- Evaluacion de la cache hibrida: estudio del comportamiento de los 13 estados de convolucion y 22 caches KV en cargas de prefill y decodificacion incremental.
- Integracion en pipelines de generacion por lotes en CPU: el soporte de prefill permite procesar prompts completos antes de la decodificacion, util para tareas offline.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Solo reporta metricas de fidelidad de la cuantizacion frente a la version FP16 en OpenVINO IR, medidas sobre un pasaje de texto fijo (logits de siguiente token en una posicion) y con generacion greedy:

| Variante | Cosine de logits vs FP16 | Coincidencia top-1 | Solapamiento top-5 |
|---|---|---|---|
| INT8 | 0,9982 | 100% | 100% |
| INT4 group 64 | 0,9622 | 100% | 80% |
| INT4 channelwise | 0,9171 | 100% | 60% |
| NF4 channelwise | 0,8620 | 0% | 80% |

Las cuatro variantes responden correctamente a un prompt factual corto con "The capital of France is Paris." La variante NF4 channelwise es la que mayor deriva muestra. El autor recomienda INT8 o INT4 group 64 cuando la precision es prioritaria.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1,08 GB en disco; la inferencia en INT4 requiere aproximadamente esa cantidad de memoria para los pesos, mas la cache KV y los estados de convolucion.
- GPU recomendadas: no se especifican; el formato OpenVINO esta orientado a CPU Intel y aceleradores Intel (iGPU, NPU), no a GPU NVIDIA.
- GPU de consumo: no aplica de forma directa; el modelo esta pensado para ejecucion en CPU con OpenVINO.
- Opciones de despliegue: OpenVINO Runtime con Optimum-Intel (`OVModelForCausalLM`), transformers 5.15.0, optimum-intel 2.3.0.dev0 o superior con soporte LFM3, OpenVINO 2026.4.1 y NNCF 3.3.0. Requiere `trust_remote_code=True`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| asahi-jp/LFM3-1.7B-int4-ov | 1,7 B | no disponible | INT4 group 64 | LFM Open License v1.0 | OpenVINO IR |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | FP16 | LFM Open License v1.0 | safetensors |
| Variante INT8 del mismo repositorio | 1,7 B | no disponible | INT8 | LFM Open License v1.0 | OpenVINO IR |
| Variante NF4 channelwise | 1,7 B | no disponible | NF4 | LFM Open License v1.0 | OpenVINO IR |

No se dispone de datos de rendimiento comparativo frente a otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion INT4 introduce deriva respecto a FP16: cosine de logits de 0,9622 y solapamiento top-5 del 80% en la prueba del autor. Para tareas sensibles a la precision se recomienda INT8.
- La variante NF4 channelwise muestra una coincidencia top-1 del 0% en la prueba realizada, por lo que no es adecuada cuando la fidelidad es critica.
- La licencia LFM Open License v1.0 impone condiciones al uso comercial; es necesario revisar el texto completo antes de desplegar en produccion.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la model card.
- La longitud de contexto no se especifica en la informacion disponible.
- Requiere una version reciente de Optimum-Intel con soporte LFM3 y `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio.
- El modelo esta empaquetado para OpenVINO; no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI sin conversion adicional.
- El repositorio tiene solo 21 descargas y 0 likes, por lo que su validacion por la comunidad es muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/asahi-jp/LFM3-1.7B-int4-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Optimum-Intel: https://github.com/huggingface/optimum-intel
- NNCF: no disponible enlace directo en la informacion proporcionada
- OpenVINO: no disponible enlace directo en la informacion proporcionada
