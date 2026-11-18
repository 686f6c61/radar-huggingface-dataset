# andito/Qwen3.5-0.8B-ConvFill

## Resumen

Qwen3.5-0.8B-ConvFill es un ajuste fino completo del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario andito, especializado en la tarea **ConvFill** descrita en el articulo *Thinking While Speaking: Inference-Time Knowledge Transfer for Responsive and Intelligent Conversational Voice Agents* (arXiv 2511.07397). El modelo desempena el rol de **Talker**: un modelo pequeno que se ejecuta en dispositivo y que genera una frase conversacional por cada elemento recibido en streaming desde un Reasoner en la nube, ya sea un fragmento de conocimiento o un token especial `<sil>` cuando no ha llegado ningun fragmento en el ultimo segundo.

La relevancia del modelo radica en su enfoque de arquitectura en dos niveles para agentes de voz conversacionales: un modelo grande en la nube razona y recupera conocimiento, mientras que este modelo pequeno (752 millones de parametros) se encarga de producir habla de relleno natural y frases puente con baja latencia. Esto permite respuestas mas agiles sin sacrificar la calidad del razonamiento.

El modelo se entreno sobre el dataset zenglhardt/convfill-dataset con 261.354 ejemplos de entrenamiento y 29.217 de validacion, alcanzando una perdida de validacion final de 0,0370. Se distribuye bajo licencia Apache 2.0 y esta disponible en formato safetensors para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM, ruta solo texto) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un modelo base multimodal, y se carga a traves de su ruta solo texto (`Qwen3_5ForCausalLM`). El ajuste fino entrena exclusivamente la via de texto y no preserva las capacidades de imagen o video del modelo original. Se trata de un ajuste fino completo (no LoRA ni adaptadores), con todos los pesos actualizados.

El entrenamiento siguio la receta del articulo: AdamW fusionado, learning rate 1e-4, weight decay 0,01, schedule coseno, 200 pasos de warmup, batch efectivo de 16 (2 por dispositivo x 8 acumulacion), precision bf16 y 1 epoca equivalente a 16.335 pasos de optimizador. Los datos provienen de los 7 archivos de dominio del dataset convfill-dataset, preprocesados con historial de conversacion incluido, generando aproximadamente 50 millones de tokens de entrenamiento (longitud media 192, maxima 487). La perdida se calcula unicamente sobre el span de respuesta final; el resto de etiquetas se enmascaran a -100. Se anadio el token especial `<sil>` (id 248077) sin necesidad de redimensionar el embedding, ya que la matriz original de 248.320 filas ya lo cubria.

Una desviacion importante respecto al articulo: el entrenamiento se ejecuto en tramos reanudados desde checkpoints del Hub debido a desalojos de infraestructura cada 1-3 horas. La reanudacion fue solo de pesos, reiniciando el estado del optimizador y el schedule de learning rate en cada reanudacion, por lo que la forma del schedule difiere de la ejecucion continua original. Se completaron los 16.335 pasos de la receta de 1 epoca.

## Capacidades

- Generacion de frases conversacionales condicionadas a un fragmento de conocimiento entrante o a un token `<sil>`.
- Produccion de habla de relleno (filler speech) cuando no hay conocimiento disponible, mediante el token especial `<sil>`.
- Mantenimiento de coherencia multi-turno: el prompt incluye el historial del turno anterior, la utterance actual del usuario y las frases ya pronunciadas en el turno en curso.
- Generacion en streaming: una frase por elemento del stream, disenada para integrarse en pipelines de voz en tiempo real.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no razona; recibe conocimiento ya razonado por un Reasoner externo).
- Capacidades multilingues: no disponible.
- Capacidades especiales: token `<sil>` para senalizar ausencia de conocimiento; marcadores `<|im_start|>`/`<|im_end|>` de Qwen3.5.

## Casos de uso

- **Agentes de voz conversacionales con backend en la nube**: el modelo actua como Talker en un sistema de dos niveles donde un Reasoner grande en la nube genera fragmentos de conocimiento y este modelo los convierte en frases naturales con baja latencia, permitiendo conversaciones fluidas mientras el razonamiento se completa.
- **Relleno conversacional en asistentes telefonicos**: cuando el Reasoner tarda en devolver conocimiento, el modelo recibe `<sil>` y genera frases de relleno naturales ("un momento, dejame comprobar...") que evitan silencios incomodos en llamadas automatizadas.
- **Sistemas de atencion al cliente en tiempo real**: integrado en un pipeline de streaming, el modelo mantiene el hilo de la conversacion con historial multi-turno y produce respuestas parciales mientras llega la informacion completa, mejorando la percepcion de fluidez.
- **Prototipado de investigacion en agentes de voz**: sirve como Talker de referencia para reproducir los experimentos del articulo ConvFill usando el repositorio vysri/conversational-infill, permitiendo evaluar la precision end-to-end en QA con NaturalQuestions.
- **Despliegue en dispositivo (on-device)**: con 752 millones de parametros y licencia Apache 2.0, es viable en hardware de consumo o dispositivos embebidos para aplicaciones de voz que requieran privacidad y baja latencia sin depender de la nube para la sintesis conversacional.
- **Generacion de respuestas puente en asistentes de busqueda por voz**: el modelo puede producir frases de transicion mientras se recuperan resultados, reduciendo la latencia percibida en consultas que requieren recuperacion de conocimiento externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta unicamente la perdida de validacion final de **0,0370** sobre 150 turnos retenidos (~1.570 ejemplos de frase). Una evaluacion anterior en el paso 2500 dio 0,0048 sobre un subconjunto de validacion distinto. El autor indica explicitamente que la metrica principal del articulo (precision end-to-end en QA con 250 consultas de NaturalQuestions, latencia y puntuaciones NLI) **no se ha reproducido** para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB para los pesos (752M parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,8 GB; en 4 bits: aproximadamente 0,4 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4090, etc.) es suficiente; el entrenamiento se realizo en instancias a10g-small.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (verificado por el autor), vLLM, llama.cpp/Ollama (previa conversion a GGUF), TGI. No verificado por el autor salvo transformers.
- Latencia y throughput: el entrenamiento reporto ~1,45 s por paso de optimizador en a10g-small; no se han publicado medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andito/Qwen3.5-0.8B-ConvFill | 752M | no disponible | Talker ConvFill | Apache 2.0 | Hugging Face |
| vysri/Qwen-0.6B-ConvFill | ~600M | no disponible | Talker ConvFill (Qwen3-0.6B) | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 752M | no disponible | Modelo general multimodal | no disponible | Hugging Face |

El modelo de referencia directa es vysri/Qwen-0.6B-ConvFill, el Talker del articulo original basado en Qwen3-0.6B. Este checkpoint replica la tarea sobre una base mas reciente (Qwen3.5-0.8B) con ligeramente mas parametros. No se dispone de datos comparativos de rendimiento entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- **No preserva capacidades multimodales**: aunque el modelo base es un VLM, este ajuste entrena y ejecuta solo la via de texto; las capacidades de imagen y video se pierden.
- **Metrica principal no reproducida**: el autor no ha evaluado el modelo con la metrica end-to-end del articulo (precision QA en streaming, latencia, NLI); solo reporta perdida de validacion, que no es directamente comparable con los resultados del paper.
- **Schedule de entrenamiento alterado**: las reanudaciones solo de pesos reiniciaron el optimizador y el learning rate, por lo que el schedule difiere del original y podria afectar a la calidad final frente a una ejecucion continua.
- **Riesgo de alucinacion**: el modelo genera frases condicionadas a fragmentos de conocimiento; si el fragmento es incorrecto o incompleto, el modelo puede producir afirmaciones erroneas con apariencia natural.
- **Sesgos**: no se han documentado evaluaciones de sesgo; al derivar de Qwen3.5, hereda los sesgos del corpus de entrenamiento del modelo base y del dataset convfill-dataset.
- **Idiomas**: no se especifican idiomas soportados; el dataset de entrenamiento parece estar en ingles, por lo que el rendimiento en castellano es incierto.
- **Licencia del dataset**: el dataset de entrenamiento es CC BY-SA 4.0, lo que puede imponer obligaciones adicionales sobre los pesos derivados en determinadas jurisdicciones, a pesar de que el modelo se distribuye como Apache 2.0.
- **Uso en produccion**: el modelo esta disenado como componente de un sistema mayor (Talker + Reasoner); usarlo de forma aislada como chatbot general no es su proposito y dara resultados pobres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andito/Qwen3.5-0.8B-ConvFill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/zenglhardt/convfill-dataset
- Articulo (arXiv): https://arxiv.org/abs/2511.07397
- Talker de referencia del articulo: https://huggingface.co/vysri/Qwen-0.6B-ConvFill
- Repositorio del pipeline de evaluacion: https://github.com/vysri/conversational-infill
- ML Intern (herramienta de entrenamiento): https://hf.co/chat?mode=ml-intern
