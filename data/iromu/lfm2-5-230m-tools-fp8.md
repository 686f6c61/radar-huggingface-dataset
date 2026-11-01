# iromu/LFM2.5-230M-tools-FP8

## Resumen

LFM2.5-230M-tools-FP8 es la version cuantizada en FP8 del ajuste fino para tool calling de LiquidAI LFM2.5-230M, publicado por el usuario iromu en HuggingFace. Se trata de un modelo de lenguaje de 229.693.184 parametros (aproximadamente 230M) construido sobre la arquitectura LFM2 de Liquid AI, especializado exclusivamente en la emision de llamadas a herramientas y funciones en el formato de cable propio de la familia LFM2.5, que no sigue el envelope `tool_calls` de OpenAI.

El checkpoint parte de `iromu/LFM2.5-230M-tools`, un fine-tune con LoRA sobre `LiquidAI/LFM2.5-230M-Base` entrenado con NeMo-RL sobre el split `sft_tools` del dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`. Posteriormente se cuantizo a FP8 (W8A8, E4M3) con NVIDIA ModelOpt usando la configuracion `FP8_PER_CHANNEL_PER_TOKEN_CFG` y se exporto mediante `export_hf_checkpoint`, generando pesos FP8, escalas por canal y el fichero `hf_quant_config.json` que consume vLLM.

Su relevancia actual radica en dos factores: por un lado, ocupa un nicho muy concreto de tool calling estructurado con una huella de memoria minima (repo de 0,3 GB); por otro, esta pensado para servir en hardware de clase GB10 con vLLM y la ruta de cuantizacion `modelopt`. No es un asistente generalista ni un sustituto directo de modelos con formato OpenAI, y sus propios datos de validacion muestran tasas de acierto bajas (25,4% de emision de tool call, 9,9% de coincidencia exacta de argumentos), coherentes con su tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid AI), transformer; detalles internos de la arquitectura base no disponibles |
| Parametros totales | 229.693.184 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de secuencia en entrenamiento: 4096 tokens) |
| Tipos de cuantizacion | FP8 W8A8 (E4M3) con escalas de pesos por canal y escalado dinamico de activaciones por token; existen tambien BF16 y NVFP4 en artefactos hermanos, y GGUF en repo aparte |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8), con `hf_quant_config.json` para vLLM |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura LFM2 de Liquid AI, de la que la model card no detalla la composicion interna (atencion, capas, posibles componentes hibridos). Lo que si se especifica es el proceso de adaptacion: un ajuste fino supervisado con LoRA ejecutado con NeMo-RL, con entropia cruzada enmascarada sobre los turnos del asistente. La configuracion de LoRA es dim 32, alpha 32, dropout 0,05 y modulos objetivo `*.proj`, `*.w1`, `*.w2` y `*.w3` (bloques de atencion y feed-forward). Se entreno en bfloat16 con AdamW, learning rate 5e-5, weight decay 0,01, calentamiento lineal de 15 pasos seguido de decaimiento coseno hasta 1e-6, batch global de 64 (micro batch 2), 336 pasos totales con validacion cada 84 y longitud maxima de secuencia de 4096 tokens. La mascara de perdida se aplica a los turnos del asistente mediante la palabra clave `generation` de la plantilla de chat.

Los datos provienen del split `sft_tools` del dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, en formato `messages` de OpenAI con `tool_calls` en los turnos del asistente, renderizados a traves de la plantilla propia de la familia LFM2.5. La innovacion tecnica mas destacable no esta en el entrenamiento sino en la cuantizacion: se usa `FP8_PER_CHANNEL_PER_TOKEN_CFG` en lugar de la configuracion estatica `FP8_DEFAULT_CFG` porque esta ultima no escribe `input_scale` y provoca que vLLM lea una escala de un centinela no inicializado y emita salidas degeneradas. Los pesos lineales se almacenan en FP8, mientras que `lm_head` y `model.embed_tokens` permanecen en bf16.

## Capacidades

- Generacion de texto conversacional en ingles, con foco en turnos de asistente dentro de plantillas de chat.
- Tool calling y function calling estructurado en el formato de cable propio de LFM2.5: lista entre corchetes delimitada por `<|tool_call_start|>` y `<|tool_call_end|>`, con argumentos en forma similar a Python (cadenas entre comillas simples, mapeos en JSON).
- Soporte de multiples llamadas a herramientas en una sola respuesta (lista de llamadas dentro de los marcadores).
- Interacciones de tipo agente con multiples pasos, siempre que el runtime comprenda el formato LFM2.5.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de vision, audio, modo de razonamiento explicito ni otras capacidades especiales declaradas.

## Casos de uso

- Orquestacion de agentes ligeros en local: el modelo emite llamadas estructuradas a funciones como `search_files` o `read_file` en un formato parseable, lo que permite construir agentes de automatizacion de tareas de desarrollo con una huella de memoria minima (repo de 0,3 GB).
- Servicio de tool calling en hardware de clase GB10: el checkpoint FP8 esta disenado explicitamente para servirse con vLLM y `--quantization modelopt`, lo que encaja en entornos con VRAM limitada donde un modelo mayor no cabria.
- Enrutamiento de funciones en pipelines internos: dado un esquema de herramientas en el turno de sistema, el modelo selecciona y rellena argumentos para tareas acotadas como consultas a ficheros, busquedas o lecturas de rutas.
- Prototipado rapido de runtimes de agentes: su tamano permite iterar en local sobre el parser del formato LFM2.5 y validar plantillas de chat sin coste de infraestructura.
- Evaluacion de cuantizacion FP8 en produccion: sirve como banco de pruebas para comparar BF16 frente a FP8 con la ruta `modelopt` de vLLM, ya que la model card publica una tabla de validacion con ambas variantes.
- Fine-tuning posterior sobre dominios concretos: al ser un adaptador LoRA pequeno y con licencia Apache 2.0, se puede reajustar para esquemas de herramientas especificos de una organizacion.
- Tareas de extraccion estructurada acotadas: cuando el runtime acepta el formato de cable propietario, puede convertir instrucciones en llamadas con argumentos tipados en lugar de texto libre.

## Benchmarks y rendimiento

La model card incluye una tabla de validacion sobre el split de validacion retenido de `sft_tools` (272 filas evaluables), con decodificacion greedy y bajo la gramatica declarada de tool calling LFM2.5:

| Modelo | Cuantizacion | Cap | n | Tool call emitido | Nombres coincidentes | Argumentos exactos | Delta exacto vs BASE |
|---|---|---|---|---|---|---|---|
| LFM2.5-230M-tools | BF16 | 384 tok | 272 | 68/272 (25,0%) | 39/272 (14,3%) | 36/272 (13,2%) | (predecesor) |
| LFM2.5-230M-tools | FP8 | 384 tok | 272 | 69/272 (25,4%) | 37/272 (13,6%) | 27/272 (9,9%) | -3,3 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor atribuye los valores absolutos bajos al tamano del modelo (230M) y al formato de cable no OpenAI, no a la cuantizacion, y senala que la fila FP8 se sirvio con vLLM (`--quantization modelopt`) mientras que la BF16 es la linea base de HF/transformers. El throughput indicado corresponde a decodificacion greedy de un solo flujo, no a throughput de servido.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,3 GB, por lo que el checkpoint FP8 cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM; la variante BF16 requiere aproximadamente el doble.
- GPU recomendadas: el autor menciona explicitamente hardware de clase GB10 para el servido FP8; tambien es viable en RTX 4090, A100 y H100, aunque el modelo no aprovechara su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con al menos 4 GB de VRAM, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: vLLM con `--quantization modelopt` (ruta recomendada y validada por el autor); existen artefactos GGUF en `iromu/LFM2.5-230M-tools-GGUF` para llama.cpp u Ollama, y un checkpoint NVFP4 en `iromu/LFM2.5-230M-tools-NVFP4`; tambien es compatible con transformers.
- Latencia y throughput: no disponibles. La model card solo indica que las cifras de validacion corresponden a decodificacion greedy de un solo flujo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-230M-tools-FP8 (este) | 229,7M | no disponible (entrenado a 4096) | LFM2.5 propietario (marcadores `<|tool_call_start|>`) | Apache 2.0 | HuggingFace, 0 descargas |
| LFM2.5-230M-tools (BF16) | 229,7M | no disponible (entrenado a 4096) | LFM2.5 propietario | Apache 2.0 | HuggingFace |
| LiquidAI/LFM2.5-230M-Base | 230M | no disponible | no especializado | no disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoria en la informacion proporcionada. La comparacion con modelos de tool calling de mayor tamano (por ejemplo, familias Qwen o Llama) no es posible con los datos disponibles, y ademas el formato de cable propietario limita la comparabilidad directa en runtimes estandar.

## Limitaciones y advertencias

- Formato de tool calling no compatible con OpenAI: el modelo no emite `tool_calls` en un envelope JSON estandar, sino una lista entre marcadores con argumentos en forma similar a Python; un runtime que espere el formato OpenAI fallara o requerira un adaptador.
- Los argumentos de cada herramienta deben ser un mapeo, no una cadena codificada en JSON; la plantilla invoca `items()` sobre ellos.
- Rendimiento absoluto bajo: 25,4% de emision de tool call y 9,9% de coincidencia exacta de argumentos en la validacion del autor, con 272 filas evaluables.
- Solo ingles: la model card declara unicamente `en` como idioma soportado.
- No es un asistente generalista: el autor lo desaconseja explicitamente para ese uso.
- Riesgo de alucinacion y de seleccion incorrecta de herramientas inherente a un modelo de 230M; no se han publicado evaluaciones de sesgo.
- La cuantizacion FP8 exige la configuracion `FP8_PER_CHANNEL_PER_TOKEN_CFG`; usar `FP8_DEFAULT_CFG` con vLLM produce salidas degeneradas por lectura de una escala no inicializada.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias del autor y con la advertencia de que el modelo no esta pensado para produccion generalista.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/LFM2.5-230M-tools-FP8
- Modelo base (BF16, con tabla de validacion): https://huggingface.co/iromu/LFM2.5-230M-tools
- Cuantizaciones GGUF: https://huggingface.co/iromu/LFM2.5-230M-tools-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/LFM2.5-230M-tools-NVFP4
- Modelo base original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
