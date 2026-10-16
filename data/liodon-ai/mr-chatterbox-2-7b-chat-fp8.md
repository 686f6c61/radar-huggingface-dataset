# liodon-ai/Mr.Chatterbox-2.7B-Chat-FP8

## Resumen

Mr.Chatterbox-2.7B-Chat-FP8 es una version cuantizada en FP8 del modelo conversacional tventurella/Mr.Chatterbox-2.7B-Chat, publicada por Liodon AI. No se trata de un entrenamiento nuevo, sino de una conversion de pesos: el checkpoint original pasa de 10,8 GB a 3,2 GB manteniendo los 2.705.820.160 parametros del modelo base. La relevancia practica esta en el ahorro de memoria y en el uso de kernels FP8 nativos para acelerar la inferencia en GPUs modernas.

La cuantizacion se ha realizado con llm-compressor (proyecto vLLM) usando el esquema FP8_DYNAMIC: los pesos se convierten a FP8 E4M3 por canal de forma anticipada y las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Al no requerir dataset de calibracion, los pesos resultantes son un cast directo del original, sin sesgo introducido por una muestra de calibracion. La capa lm_head queda sin cuantizar.

El modelo esta etiquetado como parte de la familia Llama y se distribuye en formato safetensors con compressed-tensors, listo para vLLM, TGI y SGLang. Los metadatos indican licencia "other" y no detallan idiomas soportados, longitud de contexto ni datos de entrenamiento; el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicacion reciente y sin adopcion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (segun el tag `llama`); capas, dimensiones y tipo de atencion no disponibles |
| Parametros totales | 2.705.820.160 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamico, esquema `FP8_DYNAMIC` de llm-compressor: pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (los terminos concretos no se detallan en la informacion proporcionada; se remite a la licencia del modelo base) |
| Formato de pesos | safetensors con compressed-tensors |
| Tamano del repositorio | 3,2 GB (modelo base: 10,8 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | tventurella/Mr.Chatterbox-2.7B-Chat |
| Fecha de publicacion (metadatos) | 16 de octubre de 2026 |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna del modelo original mas alla del tag `llama`, por lo que se asume un transformer decoder-only con atencion causal propia de esa familia. No se dispone de informacion sobre numero de capas, dimension de embedding, numero de cabezas, tipo de activacion, uso de GQA/MQA ni sobre la estrategia de posiciones (RoPE absoluto, escalado de contexto u otros). Tampoco se documenta si el modelo base fue entrenado desde cero o afinado sobre otro checkpoint.

En lo relativo al entrenamiento, no hay datos disponibles: ni numero de tokens, ni composicion del dataset, ni si hubo fases de RLHF, DPO o SFT. Lo unico verificable es el proceso de cuantizacion posterior, realizado con llm-compressor bajo el esquema FP8_DYNAMIC. Los pesos se castean a FP8 E4M3 por canal sin calibracion previa, de modo que la transformacion es determinista y no introduce sesgo de conjunto de calibracion. Las activaciones se cuantizan en tiempo de ejecucion por token, y la cabeza de salida (`lm_head`) se mantiene en su precision original para no degradar la distribucion de probabilidades sobre el vocabulario.

## Capacidades

- Generacion de texto y dialogo conversacional: el pipeline declarado es `text-generation` y el modelo hereda el caracter conversacional del checkpoint base.
- Conversaciones multi-turno: el nombre y la etiqueta `conversational` del modelo base apuntan a uso en chat, aunque no se detalla el formato de plantilla de mensajes.
- Inferencia eficiente en FP8: soporte de kernels FP8 en hardware con compute capability >= 8.9, con reduccion del peso en memoria frente al modelo original.
- Compatibilidad de despliegue: funciona en vLLM, Text Generation Inference y SGLang sin conversion adicional.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; no hay lista de idiomas.
- Vision, audio o modo thinking: no documentados. Se trata de un modelo exclusivamente de texto.

## Casos de uso

- Asistente conversacional de dominio acotado: con 2,7 mil millones de parametros y pesos FP8, el modelo cabe en GPUs de gama media y permite desplegar un chatbot especializado en un sector concreto (soporte interno, documentacion tecnica) sin coste de inferencia elevado. La calidad depende del modelo base, cuyos benchmarks no estan publicados.

- Prototipado rapido de producto: al necesitar aproximadamente un tercio del espacio del checkpoint original, es util para levantar un endpoint de chat en una sola GPU durante fases de validacion antes de escalar a un modelo mayor.

- Generacion de texto asistida en herramientas internas: redaccion de borradores, resumenes de documentos y reformulacion en paneles de administracion donde el coste por token es un factor determinante.

- Despliegue en servidores con GPU de gama profesional: al requerir compute capability >= 8.9, encaja en instancias con L4 o L40S, habituales en entornos cloud de coste medio, donde el ahorro de VRAM permite mayor concurrencia por GPU.

- Backend de chat para aplicaciones moviles o web con presupuesto limitado: la reduccion de 10,8 GB a 3,2 GB facilita servir el modelo con latencias bajas en vLLM o TGI y con varias replicas por nodo.

- Tareas de transformacion de texto por lotes: clasificacion con etiquetas generadas, extraccion de campos mediante prompts y normalizacion de textos, ejecutadas a gran escala donde el throughput por GPU importa mas que la calidad punta.

- Base para ajuste fino posterior: el modelo cuantizado puede servir como referencia de despliegue, aunque para fine-tuning seria preferible partir del checkpoint original en precision completa, ya que el entrenamiento sobre pesos FP8 no es un flujo estandar.

- Evaluacion comparativa de cuantizacion: util para medir la perdida de calidad de un esquema FP8 dinamico frente al modelo base, dado que no hay sesgo de calibracion en este caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base. Tampoco se documenta una comparacion de perplejidad o de similitud de salidas entre el checkpoint original y la version FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 2,7 GB, mas `lm_head` sin cuantizar. Con cache KV para contexto corto, una estimacion razonable es de 4 a 6 GB en FP8. No hay mediciones oficiales publicadas; la cifra es una estimacion a partir del tamano de los pesos.
- Aceleracion FP8 nativa: requiere GPU NVIDIA con compute capability >= 8.9, es decir, arquitecturas Ada, Hopper o Blackwell. La propia ficha cita RTX 40-series, L4/L40S, H100/H200 y B100/B200/GB10.
- GPU de consumo: cabe en RTX 4090, 4080 y 4070 (Ada), que ejecutan FP8 de forma nativa. En GPUs anteriores a Ada, vLLM y TGI desquantizan para poder ejecutar, perdiendo la ventaja de velocidad y memoria; en ese escenario el modelo se comporta como un modelo de 2,7B en precision completa.
- GPU de centro de datos: A100 no soporta FP8 nativo (compute capability 8.0), por lo que no aprovecharia el formato. Las opciones adecuadas son L4, L40S, H100, H200 y la familia Blackwell.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/Mr.Chatterbox-2.7B-Chat-FP8`), Text Generation Inference mediante contenedor Docker de Hugging Face y SGLang (`python -m sglang.launch_server`). No se documenta soporte para llama.cpp u Ollama, que no consumen pesos compressed-tensors en FP8; seria necesario convertir a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Mr.Chatterbox-2.7B-Chat-FP8 | 2.705.820.160 | no disponible | safetensors, FP8 E4M3 dinamico | other | HuggingFace, 0 descargas |
| tventurella/Mr.Chatterbox-2.7B-Chat (base) | 2.705.820.160 | no disponible | safetensors, precision original (10,8 GB) | other | HuggingFace |
| Otras alternativas de ~3B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificadas de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla del modelo base.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que cualquier decision de produccion deberia partir de una evaluacion propia contra el checkpoint original.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; con 2,7B parametros la tendencia a fabricar datos en tareas de conocimiento factual es mayor que en modelos de mayor escala.
- Perdida potencial por cuantizacion: aunque el esquema FP8_DYNAMIC evita el sesgo de calibracion, la cuantizacion de pesos y activaciones puede degradar tareas sensibles a la precision numerica. No se publica ninguna medicion de esa degradacion.
- Restricciones de hardware: en GPUs sin soporte FP8 nativo (por ejemplo A100, V100, RTX 30-series) el modelo se desquantiza, con lo que se pierden las ventajas de memoria y velocidad y se pierde el sentido de usar esta version.
- Licencia ambigua: la licencia figura como "other" y no se detallan los terminos. Antes de un uso comercial es imprescindible revisar la licencia del modelo base para confirmar si se permite, si exige atribucion o si restringe el uso.
- Idiomas no documentados: no hay lista de idiomas soportados ni evaluacion multilingue, por lo que no se puede garantizar un rendimiento aceptable en castellano u otras lenguas.
- Longitud de contexto desconocida: sin dato de ventana de contexto no es posible dimensionar cache KV, planificar concurrencia ni garantizar conversaciones largas.
- Soporte de tool calling y agentes no documentado: no se debe asumir compatibilidad con function calling sin verificacion previa.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar experiencias de despliegue.
- Compatibilidad limitada de ecosistema: al usar compressed-tensors en FP8, no es directamente utilizable en llama.cpp, Ollama o MLX sin conversion adicional.
- Fecha de metadatos futura: el repositorio aparece con fecha de publicacion y actualizacion de octubre de 2026, dato a verificar en la fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Mr.Chatterbox-2.7B-Chat-FP8
- Modelo base: https://huggingface.co/tventurella/Mr.Chatterbox-2.7B-Chat
- Perfil del cuantizador (Liodon AI): https://huggingface.co/liodon-ai
- llm-compressor (herramienta de cuantizacion, proyecto vLLM): https://github.com/vllm-project/llm-compressor
