# keptn/ornith-1.5-35b-a3b-w4a8

## Resumen

Ornith 1.5 35B-A3B w4a8 es una cuantizacion de 4 bits de los expertos del modelo multimodal Ornith 1.5 35B-A3B, publicada por el usuario keptn. El modelo original lo desarrolla el equipo Ornith y esta construido sobre Qwen3.5 (Apache 2.0). Se trata de un transformer de tipo mixture-of-experts (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, capaz de procesar texto e imagenes (pipeline image-text-to-text) y con una ventana de contexto de 262.144 tokens.

La particularidad de esta publicacion no es el modelo en si, sino el formato: un unico fichero de 19,74 GiB (`ornith-1.5-35b-a3b-w4a8.rad`) empaquetado para el motor de inferencia radiance sobre GPUs AMD RDNA4. La cuantizacion w4a8 aplica 4 bits a los pesos de los expertos (con escala FP8 cada 64 pesos, rotacion Hadamard sobre 128 y GPTQ) y FP8 al resto de capas lineales, lo que permite ejecutar el modelo en una sola tarjeta de 32 GB sin memoria de host.

Es relevante ahora porque demuestra que un MoE multimodal de 35B puede servirse en hardware AMD de consumo profesional (Radeon AI PRO R9700) con decodificacion especulativa mediante la cabeza MTP propia del modelo, alcanzando 228,8 tokens/s en decodificacion de un solo stream con una tarjeta y hasta 395,4 tokens/s con cuatro. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con vision, base Qwen3.5; cabeza MTP para decodificacion especulativa |
| Parametros totales | 35B (35B-A3B) |
| Parametros activos | 3B (aproximado, segun nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A8: expertos en 4 bits (codebook, escala FP8 cada 64 pesos, Hadamard sobre 128, GPTQ); resto de lineales FP8 (escala bf16 por bloque 128x128); activaciones FP8; lm_head int8 (escala bf16 cada 128 columnas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance); tamano 19,74 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de la familia Ornith 1.5, construido sobre Qwen3.5. Procesa entradas de texto e imagen y dispone de una cabeza MTP (multi-token prediction) que se reutiliza como borrador para decodificacion especulativa con 3 tokens draft. El contexto maximo es de 262.144 tokens.

Esta publicacion concreta no entrena el modelo: parte de la release FP8 oficial (`ornith-ai/Ornith-1.5-35B-A3B-FP8`, revision `fab11c26`). El proceso de cuantizacion consistio en crear una copia con expertos en 4 bits redondeados al vecino mas cercano, registrar las estadisticas de entrada (Hessianos) de cada capa de expertos sobre 1,26 millones de tokens de chat, documentos, codigo y tool calls con la plantilla de chat de Ornith, y cuantizar los expertos con GPTQ contra esas estadisticas mas tres rondas de descenso por coordenadas. El resto de pesos proviene de la copia intermedia. Los expertos de la capa MTP no tienen estadisticas registradas y se redondearon al vecino mas cercano.

## Capacidades

- Generacion de texto y razonamiento, con modo "thinking" activado por defecto y desactivable por peticion mediante `chat_template_kwargs`.
- Procesamiento de imagenes (image-text-to-text); la model card menciona tambien codificadores de audio y video en el contexto de radiance, aunque la comparativa publicada solo cubre imagenes.
- Generacion de codigo, con ajustes de muestreo recomendados propios (`--temp 0.6 --presence-penalty 0`).
- Tool calling y function calling: el corpus de calibracion incluye tool calls.
- Decodificacion especulativa nativa mediante la cabeza MTP del propio modelo (3 tokens draft).
- Ventana de contexto larga de 262.144 tokens.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto puede mantener conversaciones multi-turno muy largas y adjuntar historial completo sin truncar, con decodificacion rapida en una sola GPU AMD.
- Analisis de documentos con imagenes: el pipeline image-text-to-text permite extraer informacion de capturas, formularios o diagramas junto a texto; DocVQA y AI2D se usan como referencia de calidad en la model card.
- Generacion de codigo en produccion: el modo de muestreo especifico para coding y el soporte de tool calling permiten integrarlo en pipelines de CI/CD o asistentes de IDE sobre infraestructura AMD.
- Agentes multi-paso: la cabeza MTP acelera la generacion de pasos intermedios y el contexto largo permite mantener el estado de tareas complejas con muchas llamadas a herramientas.
- Despliegue on-premise en hardware AMD: al caber en una Radeon AI PRO R9700 de 32 GB sin memoria de host, es adecuado para entornos con requisitos de soberania de datos y GPUs RDNA4.
- Procesamiento por lotes de alto throughput: con 4 tarjetas y 8 secuencias concurrentes alcanza 808 tokens/s agregados, util para clasificacion, resumen o extraccion masiva.
- Razonamiento con thinking en tareas dificiles: el modo thinking por defecto permite cadenas de razonamiento largas, aunque puede requerir mas de 32k tokens de salida en tareas complejas.

## Benchmarks y rendimiento

Calidad frente al original bf16 en las 80 preguntas de MT-Bench (ambos turnos, 42.305 tokens de respuesta):

| Metrica | Este fichero (w4a8) | keptn/ornith-1.5-35b-a3b-fp8 |
|---|---|---|
| KL media | 0.0165 | 0.0104 |
| KL percentil 99 | 0.182 | 0.113 |
| Token top identico | 96,2% | 97,0% |
| Ratio de perplejidad | x1.003 | x1.001 |

Vision (greedy, thinking off, 2 tarjetas, 20 casos de DocVQA y AI2D): 10/20 respuestas identicas, KL media 0.210, token top identico 181/199.

Velocidad en Radeon AI PRO R9700 a 215 W (radiance 1.8.1 + PR #144, KV fp8, 3 tokens draft, thinking off, BetterBench 0.6.1, temperatura 0.7, mediana de tokens/s):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decodificacion, un stream | 228,8 | 305,7 | 395,4 |
| Prefill a 24k tokens | 10.323 | 14.060 | 15.223 |
| 4 streams, total | 387 | 587 | 808 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el fichero ocupa 19,74 GiB; cabe en una GPU de 32 GB con KV cache fp8 a 262.144 tokens de contexto maximo.
- GPU probada: Radeon AI PRO R9700 (RDNA4). El motor radiance solo funciona en AMD RDNA4.
- Configuraciones soportadas: 1, 2 o 4 tarjetas con tensor parallelism (`--tp 2` o `--tp 4` con `--p2p on`).
- No es compatible con GPUs NVIDIA ni con consumer GPU de otras arquitecturas; dentro de RDNA4 se requiere una tarjeta de 32 GB para una sola unidad.
- Despliegue: exclusivamente mediante el motor radiance (version 1.11.0 o superior; la quick start indica 1.17.0; radiance 2.0 no es compatible). Se ofrece imagen Docker `stilldeadcode/radiance:1.11.0` y ficheros compose en el repositorio de radiance.
- Pool de KV cache (fp8, `--max-model-len 262144`): con 1 tarjeta, 524.320 tokens con 2 secuencias y 1.057.824 con 8; con 2 tarjetas, hasta 2.097.280 con 8 secuencias.
- Throughput: 228,8 tokens/s en decodificacion de un stream con una tarjeta; 808 tokens/s agregados con 4 tarjetas y 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| keptn/ornith-1.5-35b-a3b-w4a8 | 35B totales, ~3B activos | 262.144 | `.rad` w4a8, 19,74 GiB | MIT | AMD RDNA4, 32 GB |
| keptn/ornith-1.5-35b-a3b-fp8 | 35B totales, ~3B activos | 262.144 | `.rad` FP8 | MIT | AMD RDNA4 |
| ornith-ai/Ornith-1.5-35B-A3B (bf16) | 35B totales, ~3B activos | 262.144 | safetensors bf16 (formato HF) | MIT (base Qwen3.5 Apache 2.0) | GPUs de mayor VRAM o multiples |

La comparativa con alternativas de otros fabricantes (por ejemplo, MoEs de tamano similar en formato GGUF para llama.cpp) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El fichero solo funciona con el motor radiance sobre GPUs AMD RDNA4; no es portable a vLLM, llama.cpp, Ollama ni TGI.
- Requiere radiance 1.11.0 o superior; radiance 1.10.0 y anteriores no leen expertos de 4 bits para esta arquitectura, y radiance 2.0 no es compatible actualmente.
- Los expertos de la capa MTP no tienen estadisticas de calibracion y se redondearon al vecino mas cercano, lo que puede degradar ligeramente la calidad de los tokens draft.
- La cuantizacion introduce una perdida medible frente al original bf16: KL media 0.0165 frente a 0.0104 del fichero FP8, y 96,2% de coincidencia en el token top.
- En vision, solo el 50% de las respuestas fueron identicas al original en la seleccion de 20 casos, con KL media de 0.210.
- Con thinking activado, las tareas dificiles pueden necesitar mas de 32k tokens de salida.
- Idiomas soportados no disponibles en la informacion proporcionada; no se puede confirmar cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Ornith 1.5.
- Licencia MIT, que permite uso comercial sin restricciones adicionales conocidas, aunque el modelo base se apoya en Qwen3.5 (Apache 2.0).

## Enlaces

- Hugging Face: https://huggingface.co/keptn/ornith-1.5-35b-a3b-w4a8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base FP8: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Version FP8 de keptn: https://huggingface.co/keptn/ornith-1.5-35b-a3b-fp8
- Repositorio de Ornith: https://github.com/ornith-ai/Ornith-1
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
