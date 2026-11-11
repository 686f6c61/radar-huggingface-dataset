# Kamyar-zeinalipour/Mistral-7b-CS-AR

## Resumen

Mistral-7b-CS-AR es un adaptador LoRA sobre Mistral-7B-Instruct-v0.3, desarrollado por Kamyar Zeinalipour y colaboradores, especializado en razonamiento de sentido comun en arabe. Forma parte del benchmark ArabicSense, presentado en el paper "ArabicSense: A Benchmark for Evaluating Commonsense Reasoning in Arabic with Large Language Models" (WACL-4 2025), y cubre las tres tareas del benchmark: identificar cual de dos afirmaciones arabes carece de sentido, seleccionar la explicacion de por que no lo tiene y generar dicha explicacion.

El modelo no es un modelo base nuevo, sino un adaptador PEFT que se fusiona con Mistral-7B-Instruct-v0.3, un transformer denso de 7.000 millones de parametros con una ventana de contexto de 32.768 tokens. El adaptador ocupa aproximadamente 0,6 GB en el repositorio y se distribuye en formato safetensors bajo licencia Apache 2.0, heredada del modelo base.

Su relevancia radica en que aborda una laguna concreta: el razonamiento de sentido comun en arabe, un idioma con recursos limitados en comparacion con el ingles. Los resultados reportados por el autor muestran mejoras sustanciales frente al modelo sin ajustar, especialmente en la tarea de validacion (de 0,523 a 0,948 de exactitud), lo que lo convierte en una referencia util para investigacion y para aplicaciones de PLN en arabe que requieran evaluar coherencia semantica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Mistral-7B-Instruct-v0.3) con adaptador LoRA (PEFT) |
| Parametros totales | 7.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificados por el autor; el modelo base admite bf16, fp16, int8 e int4 (GGUF/AWQ/GPTQ) mediante herramientas externas |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere fusion con el modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only denso con atencion por ventanas deslizantes (sliding window attention) y RoPE, preentrenado por Mistral AI. El ajuste se realizo con LoRA de rango r = 16, alpha = 32 y dropout 0,1, aplicado a todas las proyecciones de atencion y MLP, ademas de las capas `embed_tokens` y `lm_head`. El entrenamiento duro 3 epocas con AdamW, tasa de aprendizaje 1e-4 con decaimiento coseno, 8 secuencias por GPU con 4 pasos de acumulacion, secuencias de hasta 1.024 tokens, precision bf16, DeepSpeed y semilla 100.

Los datos de entrenamiento provienen de los conjuntos ArabicSense, ArabicSense-task2, ArabicSense-task3 y ArabicCommonsense_DB_Mistral, que cubren las tres tareas del benchmark. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset. Tampoco se documenta el uso de RLHF o DPO; el ajuste es puramente supervisado sobre el formato de chat del modelo base, con la respuesta dorada tras el marcador de asistente.

## Capacidades

- Generacion de texto conversacional en arabe, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento de sentido comun en arabe: deteccion de afirmaciones sin sentido, seleccion de explicaciones y generacion de justificaciones.
- Evaluacion de coherencia semantica entre pares de enunciados.
- Generacion de explicaciones en lenguaje natural (tarea C del benchmark).
- Soporte de tool calling y function calling heredado del modelo base, aunque no validado especificamente en el adaptador.
- Capacidades multilingues limitadas: el ajuste se realizo solo en arabe, por lo que el rendimiento fuera de ese idioma no esta garantizado.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Evaluacion de coherencia en contenidos arabes: el modelo puede clasificar pares de afirmaciones y detectar cual resulta incoherente, util para moderacion de foros o revision de textos generados.
- Filtrado de datos de entrenamiento en arabe: permite descartar pares de frases sin sentido en corpus de gran escala antes de usarlos en preentrenamiento o ajuste fino.
- Generacion de explicaciones para sistemas educativos: la tarea C permite justificar por que una afirmacion es absurda, aprovechable en plataformas de aprendizaje de arabe.
- Investigacion en PLN arabe: sirve como linea base ajustada para comparar con otros modelos (Gemma-2-9b, Llama-3.1-8B) en el benchmark ArabicSense.
- Validacion de traducciones automaticas: detectar incoherencias semanticas introducidas al traducir al arabe, usando la tarea A como filtro de calidad.
- Sistemas de preguntas y respuestas con verificacion de plausibilidad: el modelo puede evaluar si una respuesta candidata tiene sentido comun antes de mostrarla al usuario.
- Anotacion asistida de datasets de sentido comun: genera explicaciones (tarea C) que pueden servir como borradores para anotadores humanos.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test de ArabicSense:

| Tarea | Metrica | Zero-shot | Fine-tuned |
|---|---|---:|---:|
| A: validacion | Accuracy / F1 | 0,523 / 0,601 | 0,948 / 0,948 |
| B: seleccion de explicacion | Accuracy / F1 | 0,805 / 0,805 | 0,934 / 0,934 |
| C: generacion de explicacion | BERTScore F1 | 0,728 | 0,771 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en bf16/fp16 para el modelo fusionado de 7.000 millones de parametros; unos 8 GB en cuantizacion int8 y 4-6 GB en int4 (estimaciones basadas en el tamano del modelo base, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para inferencia en bf16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y, con cuantizacion int4, en RTX 3060 de 12 GB o superiores.
- Opciones de despliegue: transformers con PEFT (fusion mediante `merge_and_unload`), vLLM, TGI y llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7b-CS-AR | 7.000 M (+ LoRA) | 32.768 | Razonamiento de sentido comun en arabe | Apache 2.0 | Hugging Face |
| gemma2-9b-CS-AR | 9.000 M (+ LoRA) | 8.192 (Gemma-2) | Razonamiento de sentido comun en arabe | Gemma license | Hugging Face |
| Llama3-8B-CS-AR | 8.000 M (+ LoRA) | 128.000 (Llama 3.1) | Razonamiento de sentido comun en arabe | Llama 3.1 license | Hugging Face |
| Mistral-7B-Instruct-v0.3 (base) | 7.000 M | 32.768 | Instrucciones generales | Apache 2.0 | Hugging Face |

Los tres adaptadores CS-AR forman parte del mismo proyecto ArabicSense y comparten datos y metodologia; las diferencias de rendimiento entre ellos no se detallan en la informacion disponible.

## Limitaciones y advertencias

- El ajuste se limita al arabe; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos de 7.000 millones de parametros, especialmente en generacion de explicaciones abiertas (tarea C).
- No se documentan evaluaciones de sesgos; el modelo puede reproducir sesgos presentes en los datos de entrenamiento y en el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Mistral-7B-Instruct-v0.3, cuyos terminos deben respetarse.
- El repositorio tiene muy pocas descargas (3) y ningun "like", lo que sugiere escasa validacion por parte de la comunidad.
- No se especifican los tipos de cuantizacion soportados ni se proporcionan pesos GGUF; es necesario fusionar y convertir manualmente.
- El modelo esta disenado para tareas de sentido comun en arabe; su uso como modelo conversacional general no ha sido evaluado por el autor.
- No hay datos publicados sobre latencia, throughput ni robustez ante entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/Mistral-7b-CS-AR
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper (WACL-4 2025): https://aclanthology.org/2025.wacl-1.1/
- Repositorio GitHub ArabicSense: https://github.com/KamyarZeinalipour/ArabicSense
- Repositorio de experimentos con encoders: https://github.com/EL-Amrany/Arabic-Commonsense-Reasoning
- Coleccion ArabicSense en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/arabicsense-wacl-4-2025-6af47f5fabd9b1da26dbccd7
- Dataset ArabicSense: https://huggingface.co/datasets/Kamyar-zeinalipour/ArabicSense
- Dataset ArabicSense-task2: https://huggingface.co/datasets/Kamyar-zeinalipour/ArabicSense-task2
- Dataset ArabicSense-task3: https://huggingface.co/datasets/Kamyar-zeinalipour/ArabicSense-task3
- Dataset ArabicCommonsense_DB_Mistral: https://huggingface.co/datasets/Kamyar-zeinalipour/ArabicCommonsense_DB_Mistral
- Adaptador gemma2-9b-CS-AR: https://huggingface.co/Kamyar-zeinalipour/gemma2-9b-CS-AR
- Adaptador Llama3-8B-CS-AR: https://huggingface.co/Kamyar-zeinalipour/Llama3-8B-CS-AR
- Script de inferencia: https://github.com/KamyarZeinalipour/ArabicSense/blob/main/inference/generate.py
- Script de entrenamiento: https://github.com/KamyarZeinalipour/ArabicSense/blob/main/scripts/train_mistral.sh
