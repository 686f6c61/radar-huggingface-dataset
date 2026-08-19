# Babblu2821/tinyllama-medqa-qlora

## Resumen

`tinyllama-medqa-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`, publicado por el usuario Babblu2821. Se trata de un artefacto de investigación, no de una herramienta clínica: su propósito es servir como brazo experimental en una comparación controlada entre QLoRA y LoRA para fine-tuning eficiente de modelos pequeños en un dominio de preguntas y respuestas médicas (MedQuAD). El proyecto busca medir de forma rigurosa cuánto aporta realmente el fine-tuning frente al modelo base sin entrenar, y advierte explícitamente de que la fluidez del texto generado no se corresponde con su fiabilidad factual.

El adaptador tiene 1.1B de parámetros base (el modelo TinyLlama completo) más los parámetros del adaptador LoRA (r=16, α=32, no se especifica el número exacto). Se entrenó durante una época sobre 14.766 pares de preguntas y respuestas médicas, con una longitud máxima de 1024 tokens. Su relevancia actual radica en que demuestra, con datos medidos, que las métricas automáticas de generación pueden mejorar sustancialmente sin que mejore la exactitud factual, un aviso importante para quien desarrolle sistemas de IA en dominios sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (TinyLlama-1.1B-Chat) con adaptador LoRA |
| Parametros totales | 1.1B (modelo base) + adaptador LoRA (r=16, α=32, dropout=0.05; número de parámetros del adaptador no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento); el modelo base TinyLlama soporta 2048 |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (entrenamiento QLoRA); inferencia en fp16/fp32 o 4-bit |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es TinyLlama-1.1B-Chat, un transformer decoder de 1.1B parámetros con tokenizador SentencePiece, ya ajustado para chat mediante instrucciones. Sobre él se aplica un adaptador LoRA con r=16, α=32 y dropout=0.05, dirigido a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). El entrenamiento se realizó con QLoRA: cuantización 4-bit NF4 con doble cuantización, cómputo en fp16, optimizador `paged_adamw_8bit` y sin escalador de gradientes (los adaptadores se entrenan en fp32). Se usó el dataset MedQuAD (16.407 pares, split 90/10 con semilla 42, 14.766 pares de entrenamiento), una sola época, tasa de aprendizaje 2e-4 con scheduler coseno y 30 pasos de warmup, batch efectivo de 16 (4 × 4 acumulación), y longitud máxima de 1024 tokens. El prompt sigue la plantilla de chat nativa de TinyLlama. El entrenamiento se ejecutó en una GPU Colab T4.

Una particularidad metodológica relevante: el proyecto incluye un grupo de control (el modelo base sin fine-tuning) y mide bits por byte en lugar de perplejidad para comparar con el otro brazo (GPT-2), porque los tokenizadores difieren. La conclusión del propio autor es que la mayor parte de la ventaja frente al brazo LoRA sobre GPT-2 proviene del tamaño del modelo base y su ajuste previo por instrucciones, no del método QLoRA en sí.

## Capacidades

- Generacion de texto conversacional en ingles, siguiendo el formato de chat de TinyLlama.
- Respuesta a preguntas sobre temas medicos (entrenado con MedQuAD), aunque con fiabilidad factual limitada (ver Limitaciones).
- No presenta degeneracion: no se observan bucles de repeticion en las evaluaciones (repeated 4-grams bajo).
- No soporta tool calling ni function calling.
- No esta diseñado para tareas de agente ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No tiene capacidades de vision ni audio.
- No dispone de modo de pensamiento explicito (thinking mode).

## Casos de uso

- Reproduccion de experimentos de fine-tuning eficiente: el adaptador permite reproducir el pipeline QLoRA descrito en el repositorio del proyecto y verificar los resultados publicados (bits/byte, ROUGE-L, evaluacion factual).
- Comparacion metodologica entre QLoRA y LoRA: junto con el brazo `gpt2-medqa-lora`, sirve para estudiar como influye el tamaño del modelo base y el metodo PEFT en el rendimiento final, manteniendo controlados los datos y el presupuesto de entrenamiento.
- Estudio de alucinaciones en modelos pequenos: dado que el modelo produce texto fluido pero con un 40% de contradicciones o entidades inventadas, es un caso util para investigar la relacion entre fluidez y veracidad en modelos generativos.
- Desarrollo de pipelines de evaluacion de calidad factual: el proyecto incluye una evaluacion ciega con juez LLM (no clinico) que puede servir de plantilla para medir solidez factual en otros modelos.
- Educacion en NLP: como ejemplo didactico de QLoRA con PEFT, mostrando configuracion de hiperparametros, uso de `SFTTrainer` y evaluacion con metricas apropiadas para comparaciones entre tokenizadores distintos.
- Pruebas de despliegue de adaptadores LoRA: permite practicar la carga de un adaptador con `PeftModel` sobre un modelo base, tanto en GPU como en CPU/MPS (la evaluacion publicada se ejecuto en fp16 sobre MPS).

## Benchmarks y rendimiento

Los datos publicados provienen de la evaluacion del proyecto, medida sobre 1.641 filas retenidas (respuesta exclusivamente, sin el prompt) y 200 preguntas para calidad de generacion. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | tinyllama-medqa-qlora (este modelo) | TinyLlama-1.1B-Chat (control sin entrenar) | gpt2-medqa-lora (brazo LoRA) | gpt2 (control sin entrenar) |
|---|---|---|---|---|
| Bits por byte ↓ | 0.3954 | 0.6120 | 0.5970 | 0.8049 |
| Perplejidad ↓ | 2.97 | 5.39 | 6.12 | 11.51 |
| ROUGE-L F1 ↑ | 0.2337 | 0.1548 | no disponible | no disponible |
| Token F1 ↑ | 0.3435 | 0.2718 | no disponible | no disponible |
| Repeticiones (4-gramas) ↓ | 0.0146 | 0.0101 | no disponible | no disponible |
| Solidez factual (media 1-5) ↑ | 2.70 | 2.30 | no disponible | no disponible |
| Contradice referencia o inventa entidad ↓ | 40% | 50% | no disponible | no disponible |

El fine-tuning redujo los bits por byte un 35,4% frente a su propio modelo base. Sin embargo, la mejora en solidez factual no es estadisticamente significativa (intervalo de confianza del 95% de -0,10 a +0,90, que cruza el cero). El modelo base sin tocar ya supera al brazo GPT-2 completamente fine-tuneado en solidez factual (+1,10, IC 95% +0,55 a +1,65). Las puntuaciones factuales fueron producidas por un juez LLM, no por un clinico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.1B en fp16 ocupa aproximadamente 2,2 GB; con el adaptador LoRA la carga adicional es minima. En 4-bit la huella se reduce a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (p. ej. NVIDIA T4, GTX 1660, RTX 2060). El entrenamiento se realizo en una Colab T4, por lo que esa configuracion es suficiente para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas. Tambien se puede ejecutar en CPU o Apple Silicon (MPS) en fp16/fp32, como se hizo en la evaluacion publicada.
- Opciones de despliegue: transformers con `PeftModel` (metodo documentado), tambien se puede cargar en 4-bit con bitsandbytes en CUDA. No hay instrucciones oficiales para vLLM, Ollama o llama.cpp, aunque el adaptador podria fusionarse con el base y convertirse a GGUF si se desea.
- Latencia y throughput: no se han publicado datos especificos. Dado el tamano del modelo, en una T4 se esperan latencias del orden de decenas de milisegundos por token en fp16.

## Comparativa con modelos similares

La comparacion directa disponible es con el otro brazo del mismo proyecto y con el modelo base sin entrenar. No se han publicado comparaciones con otros modelos medicos como BioGPT o MedAlpaca.

| Modelo | Parametros | Metodo | Bits/byte ↓ | Perplejidad ↓ | Solidez factual (1-5) ↑ |
|---|---|---|---|---|---|
| **tinyllama-medqa-qlora** | 1.1B + LoRA | QLoRA sobre TinyLlama-1.1B-Chat | 0.3954 | 2.97 | 2.70 |
| TinyLlama-1.1B-Chat (control) | 1.1B | Sin fine-tuning | 0.6120 | 5.39 | 2.30 |
| gpt2-medqa-lora | 124M + LoRA | LoRA sobre GPT-2 | 0.5970 | 6.12 | no disponible |
| gpt2 (control) | 124M | Sin fine-tuning | 0.8049 | 11.51 | no disponible |

La comparacion muestra que el adaptador QLoRA mejora claramente las metricas de compresion frente a su base, pero que el modelo base ya era competitivo con el brazo LoRA de GPT-2 completamente fine-tuneado. La licencia Apache-2.0 permite uso comercial, a diferencia de otros modelos medicos que pueden tener restricciones.

## Limitaciones y advertencias

- No debe usarse para informacion medica real: el propio autor lo prohibe explicitamente. En una revision ciega de 20 preguntas retenidas, contradijo la respuesta de referencia o invento una entidad en el 40% de los casos, con una puntuacion media de solidez factual de 2,70 sobre 5.
- La fluidez del texto es enganosa: produce respuestas bien formadas y seguras que con frecuencia son incorrectas. Esto lo hace peligroso en contextos donde el usuario no pueda verificar la informacion.
- El fine-tuning no produjo una mejora detectable en exactitud factual (el intervalo de confianza cruza el cero), a pesar de que las metricas automaticas (ROUGE-L, token F1) mejoraron notablemente.
- Las puntuaciones de solidez factual fueron generadas por un juez LLM, no por un clinico, y se etiquetan como una prior fuerte, no como una evaluacion clinica.
- Solo soporta ingles; no hay capacidad multilingue.
- La longitud de contexto de entrenamiento es de 1024 tokens, inferior a los 2048 que soporta el modelo base; prompts mas largos pueden degradar la calidad.
- El adaptador fue entrenado el 2026-08-03 con un pipeline concreto; el codigo actual del repositorio ha cambiado a `transformers.Trainer`, por lo que re-ejecutar el codigo no reproducira estos pesos exactos.
- Los pesos del adaptador estan en safetensors, pero el modelo base debe descargarse por separado desde HuggingFace.
- La carga en 4-bit requiere CUDA y bitsandbytes; en CPU o Apple Silicon hay que usar fp16/fp32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Babblu2821/tinyllama-medqa-qlora
- Repositorio del proyecto (codigo, metodo y resultados completos): https://github.com/fayazhussain2821/llm-finetuning-medqa
- Modelo base TinyLlama-1.1B-Chat: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset MedQuAD: https://huggingface.co/datasets/keivalya/MedQuad-MedicalQnADataset
- Brazo comparativo LoRA sobre GPT-2: https://huggingface.co/Babblu2821/gpt2-medqa-lora
