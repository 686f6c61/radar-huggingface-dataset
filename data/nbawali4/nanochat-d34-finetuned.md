# nbawali4/nanochat-d34-finetuned

## Resumen

`nbawali4/nanochat-d34-finetuned` es un modelo de lenguaje conversacional de 2.217 millones de parámetros (2,2B), resultado de un fine-tuning (mid-training + SFT, con RL opcional) sobre el modelo base `karpathy/nanochat-d34`, desarrollado por Andrej Karpathy dentro del framework nanochat. El autor, nbawali4, ha publicado los checkpoints intermedios y finales del proceso de ajuste, utilizando el dataset `HuggingFaceTB/smol-smoltalk` para el entrenamiento supervisado.

El modelo resuelve el problema de obtener un asistente conversacional de tamaño reducido y licencia permisiva (MIT) a partir de un base preentrenado de forma económica. Su relevancia radica en que permite a desarrolladores e investigadores acceder a un modelo de 2,2B con un pipeline de entrenamiento reproducible y documentado, sin necesidad de repetir el costoso preentrenamiento (estimado en unos 2.500 dólares). La arquitectura es un transformer estilo GPT con profundidad 34, y la longitud de contexto máxima es de 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT-style, depth=34 |
| Parametros totales | 2.217.082.880 (2,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | int8 (checkpoint `chatsft_checkpoints_int8` disponible); otras cuantizaciones no documentadas |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) y tokenizer.pkl; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base `karpathy/nanochat-d34` es un transformer GPT-style con 34 capas de profundidad, preentrenado sobre 88.683.315.200 tokens (88,68B), lo que supone una relacion parametro:token de 1:40. El fine-tuning se realizo con el framework nanochat siguiendo un pipeline de tres etapas: mid-training (ajuste general de instrucciones sobre SmolTalk, MMLU, GSM8K y tareas de ortografia), SFT (fine-tuning supervisado especifico para chat sobre ARC, GSM8K y SmolTalk) y, opcionalmente, RL con GRPO sobre GSM8K. El entrenamiento se llevo a cabo en 8 GPUs A100-80GB. El dataset principal es `HuggingFaceTB/smol-smoltalk`, el mismo utilizado en las discusiones originales del proyecto nanochat.

## Capacidades

- Generacion de texto conversacional: el modelo esta ajustado para mantener dialogos multi-turno en ingles.
- Razonamiento basico: muestra resultados modestos en tareas de razonamiento como ARC-Challenge (0,5418 en SFT) y MMLU (0,4304 en SFT).
- Matematicas elementales: alcanza un 0,1327 en GSM8K tras SFT, lo que indica una capacidad limitada para problemas aritmeticos sencillos.
- Generacion de codigo: rendimiento bajo en HumanEval (0,1037 en SFT), util solo para fragmentos muy simples.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.
- Multilingue: solo ingles; no hay soporte para otros idiomas.

## Casos de uso

- Chatbot de atencion al cliente en ingles: con su ventana de 2048 tokens puede gestionar conversaciones de varias interacciones, aunque su conocimiento general es limitado. Adecuado para dominios restringidos donde se pueda complementar con retrieval.
- Asistente educativo para practica de conversacion: sirve como interlocutor basico para estudiantes de ingles, dado su enfoque conversacional y su licencia MIT que permite integracion en aplicaciones educativas.
- Prototipado rapido de asistentes de texto: por su tamano reducido (2,2B) y licencia permisiva, es util para validar ideas de producto sin incurrir en costes de API.
- Fine-tuning adicional sobre dominios especificos: al estar basado en nanochat, se puede continuar el entrenamiento con datos propios usando el mismo framework, lo que permite adaptarlo a tareas concretas con poco presupuesto.
- Investigacion en tecnicas de alineacion: al disponer de checkpoints de mid-training, SFT y RL, es un banco de pruebas para estudiar el efecto de cada etapa en el rendimiento final.
- Despliegue en entornos con recursos limitados: con cuantizacion int8, el modelo puede ejecutarse en GPUs de consumo medio, lo que lo hace viable para aplicaciones edge o servidores modestos.

## Benchmarks y rendimiento

La model card del autor incluye resultados de evaluacion para las etapas BASE, MID y SFT. No se proporcionan datos de la etapa RL.

| Metrica | BASE | MID | SFT |
|---|---|---|---|
| ARC-Challenge | - | 0,5367 | 0,5418 |
| ARC-Easy | - | 0,6961 | 0,7210 |
| GSM8K | - | 0,1137 | 0,1327 |
| HumanEval | - | 0,1098 | 0,1037 |
| MMLU | - | 0,4229 | 0,4304 |
| ChatCORE | - | 0,4045 | 0,4157 |

El modelo base alcanza un CORE score de 0,3382, segun la documentacion de Karpathy. No se han publicado comparaciones con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de inferencia. Como orientacion, un modelo de 2,2B en fp32 ocupa aproximadamente 8,8 GB de VRAM; en fp16 unos 4,4 GB; en int8 unos 2,2 GB.
- Para entrenamiento se utilizaron 8x A100-80GB, pero para inferencia basta con una GPU consumer: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo en fp16 o int8 sin problemas.
- El checkpoint int8 (`chatsft_checkpoints_int8`) esta pensado para reducir el consumo de memoria, aunque no se especifica el formato exacto de cuantizacion.
- Opciones de despliegue: al ser pesos en formato .pt con tokenizer propio (tokenizer.pkl), no hay soporte directo para vLLM, llama.cpp u Ollama sin conversion previa. El framework nanochat incluye scripts de inferencia, pero no se documentan integraciones con servidores de produccion estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CORE score | Licencia | Formato |
|---|---|---|---|---|---|
| karpathy/nanochat-d34 (base) | 2,2B | 2048 | 0,3382 | MIT | .pt |
| karpathy/nanochat-d32 (base) | ~2,2B | 2048 | 0,3168 | MIT | .pt |
| GPT-2 (referencia) | 1,5B | 1024 | 0,25 | MIT | varios |

El modelo fine-tuned mejora el CORE base (0,3382) hasta un ChatCORE de 0,4157 en SFT, pero sigue siendo un modelo pequeno con capacidades limitadas frente a alternativas modernas de tamano similar (por ejemplo, Qwen2.5-1.5B o Llama-3.2-1B), aunque no se dispone de comparativas directas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; cualquier uso en otros idiomas producira resultados degradados o incoherentes.
- Longitud de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Rendimiento bajo en tareas de codigo (HumanEval 0,10) y matematicas (GSM8K 0,13); no es adecuado para generacion de codigo o razonamiento numerico avanzado.
- Riesgo de alucinacion tipico de modelos pequenos; las respuestas pueden ser factualmente incorrectas, especialmente en temas especializados.
- El formato de pesos (.pt y tokenizer.pkl) es especifico del framework nanochat; requiere conversion para usar con herramientas estandar como Hugging Face Transformers, vLLM o llama.cpp.
- No se documentan capacidades de tool calling, agentes ni multimodalidad.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantias de seguridad ni alineacion con valores; se recomienda evaluar sesgos antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy limitada y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nbawali4/nanochat-d34-finetuned
- Modelo base karpathy/nanochat-d34: https://huggingface.co/karpathy/nanochat-d34
- Repositorio nanochat (framework): https://github.com/karpathy/nanochat
- Discusion original sobre el base d34: https://github.com/karpathy/nanochat/discussions/314
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Modelo similar de otro autor (pankajmathur/nanochat-d34-finetuned): https://huggingface.co/pankajmathur/nanochat-d34-finetuned
