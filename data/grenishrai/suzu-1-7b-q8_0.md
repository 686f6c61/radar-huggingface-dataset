# grenishrai/suzu-1.7b-q8_0

## Resumen

Suzu-1.7B Q8_0 es la version cuantizada a 8 bits en formato GGUF del modelo Suzu-1.7B, un ajuste fino mediante QLoRA SFT sobre SmolLM2-1.7B desarrollado por Grenish Rai. Forma parte de la segunda generacion de la familia Mori y esta orientado a razonamiento, matematicas, programacion y asistencia tecnica. El modelo base cuenta con 1.711.376.384 parametros (aproximadamente 1,7 mil millones) y se distribuye bajo licencia Apache 2.0.

La relevancia de esta publicacion reside en su empaquetado para inferencia local: el archivo GGUF de 1,82 GB en cuantizacion Q8_0 es practicamente sin perdida para un modelo de este tamano y requiere alrededor de 2 GB de VRAM, lo que permite ejecutarlo en GPU de consumo modestas. El autor documenta ajustes criticos de inferencia (penalizacion de repeticion a 1.0, plantilla ChatML, tokenizador `smollm`) que afectan de forma medible al rendimiento en tareas matematicas.

El modelo esta pensado para despliegues ligeros mediante Ollama, llama.cpp o LM Studio, con soporte de conversacion multi-turno y un prompt de sistema inyectado por defecto. Su enfoque en matematicas y asistencia tecnica lo situa como una alternativa compacta frente a modelos generalistas del mismo orden de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-1.7B) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama-server usa `-c 4096`) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado: `Suzu-1.7B-Q8_0.gguf`, 1,82 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

Suzu-1.7B se construye como un ajuste fino supervisado (SFT) con QLoRA sobre SmolLM2-1.7B, un transformer decoder-only de 1,7 mil millones de parametros. El entrenamiento emplea una mezcla de datos con fuerte peso en matematicas, razonamiento, programacion y asistencia tecnica, segun indica el autor. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; la model card solo menciona SFT y ausencia de tuning de seguridad mas alla de los datos de SFT.

La innovacion practica de esta publicacion no esta en la arquitectura sino en la ingenieria de inferencia: el GGUF incorpora la plantilla de chat (ChatML) embebida, fija `tokenizer.ggml.pre` a `smollm` para evitar la tokenizacion incorrecta de secuencias como `" +"`, `" ="` o `" ?"` (que perjudica los prompts matematicos), y define `<|im_end|>` como token EOS sin anadir BOS. Ademas, los archivos `params` y `Modelfile` fijan la penalizacion de repeticion a 1.0, ya que el valor por defecto de 1.1 en Ollama y LM Studio penaliza la reutilizacion de numeros y degrada GSM8K en unos 6 puntos.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla ChatML y soporte de mensaje de sistema opcional (funciona con prompt de sistema completo, corto o ausente).
- Razonamiento matematico y resolucion de problemas tipo GSM8K con formato de respuesta final.
- Programacion y asistencia tecnica, segun el enfoque declarado del entrenamiento.
- Conversacion multi-turno mediante plantilla de chat embebida.
- Ejecucion local en Ollama, llama.cpp y LM Studio con plantilla y parametros preconfigurados.
- Tasa de finalizacion de respuesta del 98,4% (respuestas que terminan con `<|im_end|>` dentro de 400 tokens).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning explicito: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Resolucion de problemas matematicos paso a paso: el modelo esta entrenado con una mezcla centrada en matematicas y, con penalizacion de repeticion a 1.0, alcanza un 45,6% en GSM8K sobre una muestra de 250 problemas, lo que lo hace util para tutoria o verificacion de calculos en entornos educativos.
- Asistente de programacion en local: su tamano de 1,7 mil millones de parametros y su empaquetado GGUF permiten integrarlo en editores o terminales mediante llama.cpp u Ollama sin depender de la nube, para autocompletado, explicacion de fragmentos y generacion de scripts.
- Chatbot tecnico embebido en aplicaciones de escritorio: con unos 2 GB de VRAM en Q8_0, puede ejecutarse junto a otras herramientas en equipos con GPU de consumo (por ejemplo, una GTX 1650 de 4 GB) y ofrecer asistencia conversacional offline.
- Prototipado rapido de pipelines de IA generativa: al ser compatible con la API de Ollama y llama-server, sirve como modelo de sustitucion en fases de desarrollo antes de migrar a modelos mayores, manteniendo la misma interfaz de chat.
- Evaluacion de técnicas de cuantizacion: el autor documenta el impacto de la cuantizacion y de los parametros de muestreo en GSM8K, por lo que el modelo es un caso de estudio util para medir la perdida de calidad entre fp16 y Q8_0 en modelos pequenos.
- Despliegue en entornos con recursos limitados o air-gapped: al distribuirse como un unico archivo GGUF de 1,82 GB bajo licencia Apache 2.0, puede copiarse y ejecutarse en maquinas sin conexion para tareas de asistencia tecnica y calculo.
- Generacion de respuestas conversacionales de baja latencia: el autor reporta unos 70 tokens/s en una GTX 1650 con el modelo completamente en GPU, adecuado para interfaces de chat interactivas.

## Benchmarks y rendimiento

Los datos proceden de una evaluacion propia del autor (no es un harness oficial): GSM8K test, muestra de 250 problemas (`shuffle(seed=42)`), chat 0-shot, decodificacion greedy, maximo 400 tokens nuevos, coincidencia del numero final.

| Modelo / configuracion | GSM8K (250) | Primeros 64 de la muestra |
|---|---:|---:|
| Suzu-1.7B 4-bit + LoRA, antes del merge (notebook de entrenamiento) | 47,2% | n/a |
| Suzu-1.7B merged fp16 (notebook de entrenamiento) | n/a | 48,4% |
| **Este Q8_0**, Ollama 0.31.1, repeat penalty 1.0 | **45,6%** (114/250) | **46,9%** (30/64) |
| Este Q8_0, Ollama repeat penalty por defecto 1.1 | 39,2% | 35,9% |

Tasa de parada (respuestas que terminan con `<|im_end|>` dentro de 400 tokens): 98,4%. Velocidad: aproximadamente 70 tokens/s en una GTX 1650 (4 GB) con el modelo completamente en GPU.

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en Q8_0 (el autor indica "about 2 GB of VRAM"); el archivo pesa 1,82 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor valida su funcionamiento en una GTX 1650 de 4 GB completamente en GPU.
- Cabe en GPU de consumo: si, en tarjetas de gama baja con 4 GB o mas (GTX 1650 y superiores); tambien puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (`ollama run hf.co/grenishrai/suzu-1.7b-q8_0` o creacion local con `Modelfile`), llama.cpp (`llama-cli` y `llama-server` con `--jinja`) y LM Studio.
- Latencia y throughput: aproximadamente 70 tokens/s en GTX 1650 (4 GB) con el modelo en GPU, segun el autor.
- Parametros de inferencia recomendados: temperatura 0.3, repeat penalty 1.0, contexto de 4096 en el ejemplo de llama-server.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Suzu-1.7B Q8_0 (este) | 1,7B | no disponible | 45,6% (250, propio) | Apache 2.0 | GGUF en HF |
| SmolLM2-1.7B (modelo base) | 1,7B | no disponible | no disponible | Apache 2.0 | safetensors y GGUF en HF |
| Suzu-1.7B fp16 (modelo base de este GGUF) | 1,7B | no disponible | 48,4% (primeros 64, propio) | Apache 2.0 | safetensors en HF |

La comparacion con otros modelos de 1-2 mil millones de parametros orientados a matematicas no esta disponible en la informacion proporcionada; no se aportan cifras de terceros.

## Limitaciones y advertencias

- Con 1,7 mil millones de parametros, la capacidad de razonamiento es limitada frente a modelos mayores; el propio autor advierte que puede dar respuestas incorrectas con tono seguro.
- Mezcla de entrenamiento con fuerte peso en matematicas, lo que puede reducir el rendimiento en dominios generales no cubiertos.
- Sin tuning de seguridad mas alla de los datos de SFT: no hay garantias frente a contenido danino o sesgado.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: explicitamente reconocido por el autor ("answers that can be wrong while sounding confident").
- Idioma: solo ingles declarado; el rendimiento en castellano no esta documentado.
- Longitud de contexto: no especificada en la model card; el ejemplo de servidor usa 4096 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base SmolLM2-1.7B.
- Configuracion critica en produccion: usar repeat penalty 1.0 (el valor por defecto de 1.1 degrada GSM8K de 45,6% a 39,2%) y asegurar el tokenizador `smollm` para no romper la tokenizacion de operadores matematicos.
- Los resultados de GSM8K son de una evaluacion propia sobre una muestra de 250 problemas, no de un harness oficial, por lo que no son directamente comparables con cifras publicadas de otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grenishrai/suzu-1.7b-q8_0
- Modelo base Suzu-1.7B: https://huggingface.co/grenishrai/suzu-1.7b
- Claves SSH de Hugging Face (requeridas para Ollama mientras el repo sea privado): https://huggingface.co/settings/keys
- SmolLM2-1.7B (modelo de partida del ajuste): no se proporciona enlace directo en la informacion disponible
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
