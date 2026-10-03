# iko-01/gpt2_oasst1_50pct

## Resumen

El modelo `iko-01/gpt2_oasst1_50pct` es un ajuste fino (fine-tuning) de GPT-2, el transformer decoder-only causal publicado por OpenAI en 2019. El autor, el usuario de HuggingFace `iko-01`, ha entrenado el modelo base `openai-community/gpt2` (124 millones de parametros) sobre una muestra aleatoria del 50% de los hilos de conversacion del dataset OpenAssistant Conversations (OASST1), con el objetivo de dotarlo de capacidad conversacional e instruction-following basica.

Se trata de un modelo de texto para generacion causal, entrenado con pares instruccion-respuesta extraidos de los arboles de conversacion de OASST1, filtrando los mensajes eliminados. El resultado es un modelo que espera un formato de prompt estricto (`### Human:` / `### Assistant:`) y que responde en ingles. No incorpora tecnicas de alineamiento adicionales como RLHF o DPO: es un ajuste supervisado (SFT) clasico sobre un modelo base muy pequeno.

Su relevancia es limitada en terminos de rendimiento bruto frente a los LLM actuales, pero resulta interesante como ejemplo didactico de pipeline de instruction tuning completo (preparacion de datos, formateo de prompt, hiperparametros y evaluacion cualitativa) ejecutado en hardware de consumo. No hay resultados de benchmarks publicados ni un numero significativo de descargas o interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT2LMHeadModel (transformer decoder-only causal) |
| Parametros totales | 124 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (longitud maxima de entrenamiento y nativa de GPT-2) |
| Tipos de cuantizacion | no disponible (el autor no publica versiones cuantizadas; al ser un modelo de 124M es viable convertirlo a GGUF/ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch / safetensors (repositorio de `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estandar: un transformer decoder-only con atencion causal, normalizacion tipo LayerNorm pre-activacion, embeddings de posicion aprendidos y 12 capas, 12 cabezas de atencion y una dimension oculta de 768 (configuracion de la variante de 124M). No hay innovaciones arquitectonicas anadidas: ni MoE, ni atencion lineal, ni decodificacion especulativa, ni modos de razonamiento. El ajuste se realizo con la clase `GPT2LMHeadModel` en modo causal language modeling.

El entrenamiento se llevo a cabo sobre una reconstruccion lineal de los hilos de conversacion de OASST1, filtrando mensajes eliminados y muestreando aleatoriamente el 50% de los hilos totales con semilla 42. Los hiperparametros publicados son: learning rate 5e-5, batch size 4 con acumulacion de gradiente de 4 (batch efectivo 16), 3 epocas, optimizador AdamW, weight decay 0.01, 100 pasos de warmup, precision mixta fp16 y longitud maxima de secuencia de 1024 tokens. El entrenamiento se ejecuto en una GPU de Google Colab usando PyTorch, `transformers` y `datasets`. No se documenta el numero exacto de tokens de entrenamiento, la composicion detallada del dataset resultante ni ninguna fase posterior de RLHF, DPO o filtrado por preferencias.

## Capacidades

- Generacion de texto causal en ingles con formato conversacional de turnos.
- Instruction following basico: responde a mensajes de usuario delimitados por `### Human:` cuando se le proporciona la etiqueta `### Assistant:`.
- Continuacion de conversaciones multi-turno si se concatenan los turnos en el formato de entrenamiento (sujeto al limite de 1024 tokens).
- Generacion condicionada con muestreo configurable (`do_sample`, `top_p`, `temperature`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (solo ingles).
- Capacidades especiales (vision, audio, thinking mode, razonamiento extendido): no disponibles.

## Casos de uso

- Experimentacion academica y docente sobre instruction tuning: permite reproducir de principio a fin un pipeline de SFT (preparacion de datos OASST1, formateo de prompt, entrenamiento y muestreo) en una unica GPU de Colab, sirviendo como material de laboratorio.
- Prototipado rapido de chatbots de juguete: con prompts en el formato `### Human:` / `### Assistant:` se puede montar un bot conversacional muy ligero para demos, tests de UX o entornos sin GPU dedicada.
- Validacion de pipelines de datos: util para comprobar como afecta el filtrado de mensajes eliminados y el submuestreo de hilos al comportamiento final de un modelo, antes de escalar a modelos mayores.
- Inferencia en entornos con recursos minimos: al ocupar menos de 1 GB en fp16, puede desplegarse en CPU, en dispositivos edge o en contenedores con RAM limitada para tareas de generacion de texto corto.
- Generacion de respuestas de bajo coste en sistemas de prueba (stubs) dentro de pipelines de CI: permite sustituir un LLM mayor durante el desarrollo para no consumir cuota de API.
- Estudio de sesgos y toxicidad heredados de datasets crowdsourced: el modelo puede emplearse como caso de analisis de como el contenido de OASST1 se filtra hacia un modelo pequeno.
- Base para tecnicas de destilacion o comparacion de metodos de alineamiento: sirve como linea base SFT sobre la que medir la ganancia de aplicar DPO, RLHF u otras tecnicas sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16 y menos de 0,2 GB en cuantizacion int8 aproximada (pesos de 124M); con cache KV para 1024 tokens la huella total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este modelo. Es funcional incluso en GPUs integradas y en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 2 GB o mas de VRAM, y tambien en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: `transformers` (referencia del autor), llama.cpp / GGUF (previa conversion), ONNX Runtime, Ollama (previa conversion y creacion de Modelfile), vLLM y TGI (ambos soportan la arquitectura GPT-2). Text Generation Inference puede requerir configuracion adicional para modelos tan pequenos.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| iko-01/gpt2_oasst1_50pct | 124M | 1024 | en | apache-2.0 | SFT sobre 50% de OASST1 |
| openai-community/gpt2 | 124M | 1024 | en | apache-2.0 | Modelo base sin ajuste conversacional |
| microsoft/DialoGPT-small | 117M | 1024 | en | MIT (segun repositorio) | Ajustado para dialogos sobre Reddit |
| TinyLlama/TinyLlama-1.1B-Chat | 1,1B | 2048 | en | apache-2.0 | Modelo conversacional mas grande y moderno, mayor coste de inferencia |

No se dispone de cifras de rendimiento comparadas para este modelo, por lo que la comparativa se limita a parametros, contexto, licencia y naturaleza del ajuste.

## Limitaciones y advertencias

- El modelo base es GPT-2 de 124M, con capacidad de razonamiento, coherencia factual y contexto largo muy inferior a la de LLM actuales (Llama 3, Qwen, Mistral, etc.).
- Alta probabilidad de alucinacion y de afirmaciones facticamente incorrectas, especialmente en preguntas de conocimiento.
- Sesgos y posible toxicidad heredados de OASST1, un dataset crowdsourced que puede contener contenido sesgado, ofensivo o erroneo.
- Solo funciona bien con el formato exacto `### Human:` / `### Assistant:`; otros formatos degradan notablemente la calidad.
- Contexto limitado a 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Sin fases de RLHF/DPO ni filtros de seguridad posteriores; no se recomienda su uso directo en produccion orientada a usuarios finales.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantias de calidad ni de adecuacion a casos de uso concretos.
- Sin datos de evaluacion publicados, no es posible estimar de forma fiable su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iko-01/gpt2_oasst1_50pct
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Paper de OpenAssistant: https://arxiv.org/abs/2304.07327
- Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a una empresa de impermeabilizacion con el mismo nombre y no se han incluido.
