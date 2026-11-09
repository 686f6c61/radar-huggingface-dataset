# biswadeep2004/gpt2-medium-sft

## Resumen

`biswadeep2004/gpt2-medium-sft` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-0.6B-Base, desarrollado por el usuario biswadeep2004 como ejercicio de aprendizaje para comparar el comportamiento del modelo base frente al modelo tras el entrenamiento. A pesar del nombre del repositorio, que sugiere GPT-2 Medium, los pesos corresponden a la familia Qwen3 con 596.049.920 parametros reales en safetensors, es decir, aproximadamente 0,6 mil millones de parametros, no los 355 millones de GPT-2 Medium.

El modelo resuelve un problema acotado: adaptar el formato de respuesta de un modelo base pequeno a un estilo conversacional ChatML mediante entrenamiento supervisado sobre el dataset banghua/DL-SFT-Dataset, con unas 3000 conversaciones de un solo turno. No incorpora conocimiento nuevo ni tecnicas de alineacion adicionales como RLHF o DPO; su proposito declarado es experimental y educativo.

Su relevancia es limitada en terminos de produccion, pero resulta util como referencia practica de como el SFT modifica el estilo y la estructura de las respuestas de un modelo base pequeno, y como ejemplo de pipeline completo con TRL `SFTTrainer` sobre hardware modesto (una unica NVIDIA T4 en Google Colab). La licencia Apache 2.0 heredada del modelo base facilita su reutilizacion y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | mayoritariamente ingles segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia Qwen3, con 596 millones de parametros totales y arquitectura densa. Se inicializa desde Qwen/Qwen3-0.6B-Base y se somete a un ajuste fino completo (full fine-tuning, sin LoRA ni adaptadores) mediante TRL `SFTTrainer`. El dataset utilizado es banghua/DL-SFT-Dataset, compuesto por conversaciones de un solo turno en formato usuario/asistente, con aproximadamente 3000 ejemplos.

El entrenamiento usa formato ChatML con los tokens especiales `<|im_start|>` y `<|im_end|>`, y calcula la perdida unicamente sobre los tokens del asistente (`assistant_only_loss=True`), lo que concentra el aprendizaje en el estilo de respuesta y no en la reproduccion del prompt. Los hiperparametros documentados son: learning rate 1e-5 con scheduler coseno y 20 pasos de warmup, 2 epocas, batch size por dispositivo de 1 con acumulacion de gradientes de 16, longitud maxima de 1024 tokens, precision mixta fp16 y gradient checkpointing. Todo el entrenamiento se ejecuto en una unica NVIDIA T4 en Google Colab. La model card no incluye la perdida final de entrenamiento (aparece un marcador sin rellenar) ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato ChatML, con plantilla de chat aplicable mediante `apply_chat_template`.
- Respuesta a instrucciones de un solo turno en estilo asistente, aprendido del dataset de SFT.
- Generacion autoregresiva estandar con `model.generate` de transformers (muestreo o decodificacion greedy).
- Capacidad multilingue limitada: la model card indica que el modelo trabaja mayoritariamente en ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision, audio ni otras capacidades especiales.
- No se documenta una longitud de contexto nativa mas alla de los 1024 tokens usados durante el entrenamiento.

## Casos de uso

- Experimentacion educativa sobre SFT: el modelo sirve para comparar cualitativamente la salida del Qwen3-0.6B-Base sin ajustar frente a la version ajustada, tal y como propone el autor, usando prompts identicos y decodificacion greedy para aislar el efecto del entrenamiento.
- Prototipado de interfaces conversacionales: permite montar un chatbot de demostracion con plantilla ChatML y `transformers` en local, sin infraestructura dedicada, gracias a sus 596 millones de parametros y su ejecucion en una T4.
- Pruebas de pipelines de generacion de texto: util para validar integraciones con la libreria `transformers`, el formato ChatML y la carga de pesos safetensors antes de migrar a un modelo mayor.
- Generacion de respuestas de estilo asistente en tareas de formato: al haberse entrenado con perdida solo en tokens del asistente, puede emplearse para comprobar como un modelo pequeno adopta estructuras de respuesta concisas y directas.
- Docencia y talleres sobre ajuste fino: el repositorio documenta hiperparametros, hardware y metodo (TRL SFTTrainer, fp16, gradient checkpointing), lo que lo convierte en un ejemplo reproducible para ensenar el flujo completo de SFT en Colab.
- Evaluacion de riesgos en modelos pequenos: sirve como caso de estudio de alucinacion y errores aritmeticos en modelos de 0,6B tras SFT, util para calibrar expectativas antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion es solo cualitativa, mediante una comparacion informal antes/despues sobre un punado de prompts, y que no hay puntuaciones de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB solo para pesos (596 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs con 4 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: NVIDIA T4 (la usada en el entrenamiento), RTX 3060, RTX 4090, A100 o H100; cualquier GPU consumer con al menos 4 GB de VRAM es suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (metodo documentado por el autor); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de inferencia, aunque no se detalla configuracion. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biswadeep2004/gpt2-medium-sft | 596 M | no disponible (entrenado a 1024) | SFT sobre DL-SFT-Dataset (~3k ejemplos) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-0.6B-Base | 596 M | no disponible en la informacion proporcionada | Preentrenamiento base | Apache 2.0 | Hugging Face (modelo base de referencia) |
| GPT-2 Medium | 355 M | 1024 | Preentrenamiento base | MIT (segun publicacion original) | Ampliamente disponible |

La comparativa con GPT-2 Medium se incluye porque el nombre del repositorio lo sugiere, pero los pesos reales corresponden a Qwen3-0.6B-Base. No se dispone de datos de benchmarks para comparar rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta pensado para produccion ni para respuestas factuales o de seguridad critica.
- Entrenado con un dataset pequeno (~3000 ejemplos), por lo que el SFT ensena formato y estilo, no conocimiento nuevo; puede alucinar y cometer errores aritmeticos o factuales.
- No se han publicado evaluaciones cuantitativas; la unica evaluacion es cualitativa e informal.
- Idiomas: mayoritariamente ingles; el rendimiento en castellano no esta documentado y previsiblemente sera limitado.
- Contexto: la longitud maxima de entrenamiento es de 1024 tokens; no se documenta una ventana nativa mayor ni su comportamiento mas alla de esa longitud.
- El nombre del repositorio (`gpt2-medium-sft`) es enganoso respecto a la arquitectura real (Qwen3-0.6B), lo que puede inducir a error en la seleccion del modelo.
- No se documentan sesgos especificos, pero al derivar de un modelo base pequeno y de un dataset de SFT acotado, hereda los sesgos de ambos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo experimental sin garantias de calidad, su uso en produccion no esta recomendado por el propio autor.
- La model card contiene un marcador sin rellenar en la perdida final de entrenamiento, lo que impide verificar la convergencia del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biswadeep2004/gpt2-medium-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/banghua/DL-SFT-Dataset
