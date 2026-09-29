# americansquid/gpt2-large-alpaca

## Resumen

`americansquid/gpt2-large-alpaca` es una version ajustada por instrucciones del modelo GPT-2 Large de OpenAI (774.030.080 parametros segun los pesos en safetensors). El autor publica bajo el identificador `americansquid` una fusion de adaptadores LoRA entrenados sobre el conjunto de datos `yahma/alpaca-cleaned`, que se han reabsorbido en los pesos base, dando como resultado un unico checkpoint en precision FP16 listo para inferencia directa.

El modelo resuelve un problema muy concreto: disponer de un modelo causal pequeno, ligero y con licencia MIT que siga un formato de instrucciones tipo Alpaca, sin necesidad de cargar un LLM de varios miles de millones de parametros. Con 774 millones de parametros y una arquitectura Transformer decoder-only estandar (36 capas, 20 cabezas de atencion, dimension oculta 1280), se puede ejecutar en GPUs de consumo e incluso en CPU, lo que lo hace util para prototipado rapido, entornos con recursos limitados y experimentos academicos de ajuste por instrucciones.

Es relevante ahora no por su rendimiento bruto, sino por su valor didactico y su coste de despliegue casi nulo: sirve como linea base para comparar tecnicas de LoRA/SFT frente a modelos instruction-tuned mucho mayores, y como punto de partida reproducible para pipelines de cuantizacion a GGUF. Conviene tener presente que hereda las limitaciones de GPT-2 (ventana de contexto de 1024 tokens, conocimiento de 2019) y que solo esta entrenado en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia GPT-2) |
| Parametros totales | 774.030.080 |
| Longitud de contexto | 1024 tokens (heredada de GPT-2; no se explicita en la model card) |
| Tipos de cuantizacion | FP16 nativo en safetensors; convertible a GGUF (Q4, Q5, Q8, etc.) para llama.cpp |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

La base es GPT-2 Large: un Transformer decoder-only con atencion causal completa de 1024 tokens de contexto, 36 capas, 20 cabezas, dimension oculta 1280 y embeddings posicionales aprendidos. Sobre ese modelo se aplico un ajuste supervisado por instrucciones (SFT) con LoRA de rango 16, alpha 32 y dropout 0.05, actuando sobre los modulos `c_attn`, `c_proj` y `c_fc` (proyecciones de atencion y MLP). Los adaptadores se fusionaron posteriormente en los pesos base, por lo que no hay que cargar PEFT en inferencia. El entrenamiento se realizo con `transformers`, `peft` y `trl` (SFTTrainer), en precision mixta FP16 con gradient checkpointing, sobre dos GPUs en DDP.

El conjunto de datos es `yahma/alpaca-cleaned`, con 51.760 ejemplos (50.760 de entrenamiento y 1.000 de validacion estratificada), formateados con la plantilla Alpaca y terminados con el token EOS. Se entrenaron 2 epocas (6.346 pasos) con AdamW, learning rate 2e-4, scheduler coseno con 50 pasos de warmup, weight decay 0.01, batch efectivo de 16 (batch 4 x acumulacion 2 x 2 GPUs) y longitud de secuencia de 512 tokens. No se aplicaron tecnicas de RLHF ni DPO; solo SFT. Los resultados de entrenamiento reportados son perdida final de entrenamiento 1.3819, perdida de validacion 1.3191, exactitud de token en validacion del 67,40% y entropia de validacion 1.3064.

## Capacidades

- Generacion de texto autoregresiva en ingles con formato de instrucciones Alpaca.
- Seguimiento de instrucciones simples: resumen, reescritura, clasificacion de texto breve, extraccion de respuestas.
- Respuesta a preguntas de cultura general dentro del conocimiento contenido en GPT-2 (corte aproximado en 2019).
- Generacion creativa breve: poemas, eslóganes, textos promocionales cortos.
- Formateo de salida cuando se le indica explicitamente en la instruccion (listas, tablas sencillas, plantillas).
- No dispone de tool calling ni function calling nativo.
- No dispone de modo de razonamiento explicito (thinking mode) ni de capacidades de agente multi-paso.
- No soporta vision, audio ni multimodalidad.
- Multilingue: no; unicamente ingles.
- No se ha entrenado con tecnicas de alineacion tipo RLHF/DPO, por lo que la calidad de las respuestas depende en gran medida del prompt.

## Casos de uso

- Prototipado y aprendizaje de pipelines SFT: sirve como ejemplo reproducible de ajuste LoRA sobre un modelo pequeno; se puede replicar el entrenamiento completo en hardware modesto y comparar hiperparametros sin coste elevado.
- Clasificacion y etiquetado de texto corto en ingles: reformulando la tarea como instruccion (por ejemplo, "clasifica este comentario como positivo o negativo"), el modelo devuelve una etiqueta en pocos tokens, adecuado para procesado por lotes en CPU.
- Resumen extractivo de parrafos breves: con la ventana de 1024 tokens es viable resumir correos, titulares o descripciones de producto de pocas lineas, integrándolo en un script de preprocesado.
- Generacion de texto auxiliar en formularios y plantillas: redaccion de descripciones cortas, nombres de variables o textos de relleno en ingles, donde la exigencia de precision factual es baja.
- Evaluacion de tecnicas de cuantizacion: al ser un modelo pequeno con pesos FP16 en safetensors, es un banco de pruebas adecuado para medir la degradacion de calidad al convertir a GGUF Q4/Q5/Q8.
- Educacion e investigacion en NLP: analisis de sesgos, estudios de robustez ante prompts adversarios y comparaciones con modelos base sin ajustar, con un coste computacional minimo.
- Inferencia en entornos sin GPU: cuantizado a 4 bits ocupa menos de 500 MB, por lo que puede ejecutarse en un portatil o en un contenedor con CPU y RAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona metricas de entrenamiento y validacion internas, que se recogen a continuacion y no son comparables con MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 1.3819 |
| Perdida de validacion | 1.3191 |
| Exactitud de token en validacion | 67,40% |
| Entropia de validacion | 1.3064 |
| Epocas | 2,0 (6.346 pasos) |
| Ejemplos de validacion | 1.000 |

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1,55 GB solo para pesos, mas cache KV y activaciones; en la practica unos 2-3 GB con contexto de 1024 tokens.
- VRAM estimada en INT8: aproximadamente 0,8 GB de pesos.
- VRAM estimada en GGUF Q4: aproximadamente 0,45-0,6 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como RTX 3050, RTX 3060, RTX 4060, T4, L4 o superiores. Tambien funciona en A100, H100 y RTX 4090, aunque estan sobredimensionadas para este tamano.
- Cabe holgadamente en GPUs de consumo (GTX 1650 4 GB en adelante) y en CPU con 4-6 GB de RAM libre si se usa una cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers` con `pipeline` o `AutoModelForCausalLM`, vLLM y TGI para servido, llama.cpp y Ollama previa conversion a GGUF. El repositorio no incluye pesos GGUF; el autor indica la conversion como paso opcional.
- Latencia y throughput: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| americansquid/gpt2-large-alpaca | 774M | 1024 | SFT con LoRA (Alpaca) | MIT | Publico en HuggingFace |
| openai-community/gpt2-large | 774M | 1024 | Sin ajuste por instrucciones | MIT | Publico en HuggingFace |
| openai-community/gpt2-xl | 1,5B | 1024 | Sin ajuste por instrucciones | MIT | Publico en HuggingFace |
| openai-community/gpt2-medium | 355M | 1024 | Sin ajuste por instrucciones | MIT | Publico en HuggingFace |

Como referencia de categoria superior, los modelos Alpaca basados en LLaMA de 7B (por ejemplo, las variantes LoRA de tatsu-lab) superan ampliamente a este modelo en seguimiento de instrucciones y calidad de generacion, pero requieren del orden de 14 GB de VRAM en FP16 y tienen condiciones de licencia distintas (LLaMA original no es MIT). No se dispone de una comparacion cuantitativa publicada entre `gpt2-large-alpaca` y estas alternativas.

## Limitaciones y advertencias

- Modelo pequeno (774M) con conocimiento congelado en 2019: la informacion factual sobre eventos posteriores es inexistente o incorrecta.
- Riesgo elevado de alucinacion, especialmente en preguntas factuales, matematicas y razonamiento multi-paso.
- Ventana de contexto de 1024 tokens (heredada de GPT-2), insuficiente para documentos largos, conversaciones extensas o analisis de codigo.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- No ha pasado por RLHF ni DPO; las respuestas pueden ser repetitivas, incompletas o ignorar restricciones del prompt. La model card recomienda `repetition_penalty` de 1.15 y `temperature` de 0.7.
- Sesgos heredados de GPT-2 y del dataset `yahma/alpaca-cleaned`, que fue generado en parte con salidas de modelos de OpenAI (self-instruct); pueden aparecer sesgos de genero, raza, nacionalidad y estilo.
- Sin soporte nativo de tool calling, agentes ni capacidades multimodales.
- Licencia MIT para los pesos, pero el autor indica que el uso queda sujeto tambien a los terminos del dataset Alpaca; conviene revisar dichos terminos antes de un despliegue comercial.
- El repositorio no incluye pesos cuantizados en GGUF, por lo que el despliegue en llama.cpp u Ollama exige un paso previo de conversion.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha: no existe validacion por parte de la comunidad ni informes de terceros sobre su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/americansquid/gpt2-large-alpaca
- Modelo base: https://huggingface.co/openai-community/gpt2-large
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
