# jiaeyan423/qwen2.5-3b-gsm8k-distill

## Resumen

qwen2.5-3b-gsm8k-distill es un ajuste fino supervisado del modelo base Qwen/Qwen2.5-3B, desarrollado por el usuario jiaeyan423 como proyecto final de un curso de cinco lecciones sobre fine-tuning supervisado con la libreria TRL de Hugging Face. El modelo esta especializado en la resolucion de problemas aritmeticos de enunciado verbal del tipo GSM8K en ingles, y no pretende ser un asistente conversacional de proposito general.

El modelo se entrena mediante destilacion a nivel de secuencia: se generan soluciones con Qwen/Qwen2.5-7B-Instruct (greedy) sobre un subconjunto fijo de 2.000 preguntas del conjunto de entrenamiento de GSM8K, se filtran aquellas cuya respuesta final coincide con la respuesta dorada (quedan 1.930) y se aplica un SFT con LoRA sobre el modelo base usando solo la perdida en los tokens de respuesta. Los adaptadores se fusionan en los pesos finales, de modo que el modelo se carga con transformers sin necesidad de PEFT.

Su relevancia es fundamentalmente practica y educativa: demuestra que un modelo de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) puede alcanzar un 84,1% de exactitud en el conjunto de test de GSM8K con un presupuesto de entrenamiento muy reducido (una epoca sobre 2.000 preguntas, LoRA de rango 16), superando ampliamente a su modelo base (6,8%) y al propio profesor de 7B en formato estricto (41,8%). La longitud de contexto heredada del modelo base es de 32.768 tokens, aunque la informacion proporcionada no la detalla explicitamente para este ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), modelo base Qwen/Qwen2.5-3B |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | safetensors (adaptadores LoRA fusionados en los pesos) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, inicializado desde Qwen/Qwen2.5-3B. Sobre esa base se aplica un SFT con LoRA (rango 16, alpha 32, todas las capas lineales, learning rate 2e-4) usando TRL SFTTrainer, con la perdida calculada unicamente sobre los tokens de respuesta, sin packing (padding por lote), batch efectivo de 16, schedule de learning rate coseno y una sola epoca sobre un subconjunto fijo de 2.000 preguntas del split de entrenamiento de GSM8K. Un detalle tecnico destacable: en el modelo base Qwen2.5-3B las filas de embedding de `<|im_start|>` y `<|im_end|>` no estan entrenadas y los embeddings estan atados, por lo que LoRA por si solo no puede aprender a emitir `<|im_end|>`; el autor entrena esas dos filas mediante `trainable_token_indices` de PEFT.

Los datos de entrenamiento son 1.930 soluciones generadas por Qwen/Qwen2.5-7B-Instruct en modo greedy para un subconjunto fijo de 2.000 preguntas de GSM8K train, conservadas solo si la respuesta final coincidia con la respuesta dorada. Las respuestas que el profesor terminaba con `\boxed{N}` se reescribieron para terminar con `#### N`. Se trata de destilacion a nivel de secuencia (no de logits) combinada con SFT. No se documenta RLHF ni DPO; el autor menciona variantes de su curso con RFT (L4-rft-r1, L4-rft-r2) que obtienen resultados inferiores a esta destilacion. Los adaptadores se fusionaron en los pesos para la publicacion, de modo que el modelo se carga directamente con transformers.

## Capacidades

- Generacion de texto y razonamiento aritmetico paso a paso sobre problemas de enunciado verbal en ingles (estilo GSM8K).
- Resolucion de problemas de matematicas de nivel escolar primario/secundario con formato de respuesta controlado: termina la respuesta con una linea `#### <numero>`.
- Formato de prompt especifico: requiere el chat template del tokenizer con un mensaje de sistema (`You are a helpful assistant.`) y un mensaje de usuario con la instruccion de razonar paso a paso y dar la respuesta final en el formato `#### <number>`.
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente, multi-step reasoning mas alla del razonamiento aritmetico interno, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles (unico idioma declarado en la model card).
- Inferencia compatible con text-generation-inference y endpoints compatibles, segun los tags del repositorio.

## Casos de uso

- Evaluacion educativa de tecnicas de destilacion: el modelo sirve como referencia reproducible para comparar SFT completo, LoRA, QLoRA y RFT frente a destilacion a nivel de secuencia en un presupuesto de entrenamiento minimo, usando el propio pipeline del curso (TRL SFTTrainer, vLLM para evaluacion).
- Generacion de soluciones paso a paso para problemas de aritmetica escolar: se puede usar como motor de un banco de ejercicios o de un corrector automatico que valide la linea `#### N` frente a la respuesta esperada, gracias a su tasa de formato del 99,4%.
- Linea base de investigacion en razonamiento matematico: util para medir el efecto de tecnicas de prompting, decodificacion o ajuste posterior sobre un modelo de 3B ya especializado, con una exactitud de referencia del 84,1% en GSM8K test.
- Destilacion de profesor a alumno en produccion: el modelo demuestra que un alumno de 3B puede superar al profesor de 7B en formato estricto (84,1% frente a 41,8%), lo que lo hace adecuado como sustituto de bajo coste en tareas de resolucion aritmetica donde el formato de salida es critico.
- Prototipado rapido de asistentes de matematicas: al cargarse directamente con transformers (adaptadores fusionados, sin PEFT), se puede integrar en notebooks y demos sin infraestructura adicional, con parada en `<|im_end|>`.
- Servicio de inferencia con vLLM o TGI: el autor evalua con vLLM en modo greedy (temperatura 0, max 768 tokens nuevos), por lo que el modelo esta validado para despliegue en servidores de inferencia con decodificacion greedy.
- Filtrado y generacion de datos sinteticos de matematicas: puede emplearse para producir soluciones verificables con formato `#### N` que luego se filtren por coincidencia con la respuesta dorada, replicando el propio pipeline de destilacion del autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). Evaluacion con vLLM sobre el conjunto de test completo de GSM8K (1.319 preguntas), decodificacion greedy (temperatura 0), max 768 tokens nuevos. "Estricto" exige una linea `#### <numero>` parseable; "incl. boxed" acepta tambien un `\boxed{N}` final.

| Modelo | Exactitud test (estricto) | Tasa de formato | Incl. boxed |
|---|---|---|---|
| qwen2.5-3b-gsm8k-distill (L3-distill) | 84,1% | 99,4% | 84,1% |
| L2-qlora-sft | 71,3% | 99,0% | 71,4% |
| L4-rft-r2 | 70,5% | 99,7% | 70,5% |
| L4-rft-r1 | 70,3% | 99,4% | 70,3% |
| L2-lora-sft | 68,5% | 99,3% | 68,5% |
| L1-full-sft | 66,6% | 99,6% | 66,6% |
| teacher-7b (Qwen2.5-7B-Instruct) | 41,8% | 45,7% | 91,2% |
| base (Qwen2.5-3B) | 6,8% | 9,2% | 32,9% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud para un modelo de 3,09 mil millones de parametros, los pesos en safetensors ocupan aproximadamente 6,2 GB en el repositorio (precision de entrenamiento); una carga en fp16 requeriria del orden de 6 GB solo para pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: no documentadas por el autor. La evaluacion se realizo con vLLM, lo que implica GPUs de datacenter (A100, H100 o similares) para el conjunto de test completo, aunque el autor no especifica el hardware exacto.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano (3B) es plausible en GPUs consumer con suficiente VRAM, pero no hay dato verificado.
- Opciones de despliegue: transformers (carga directa, sin PEFT porque los adaptadores estan fusionados), vLLM (usado por el autor para evaluacion), text-generation-inference (tag del repositorio) y endpoints compatibles. No se documenta soporte de llama.cpp, Ollama ni GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-gsm8k-distill | 3.085.938.688 | no disponible | 84,1% (estricto) | qwen-research | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen2.5-3B (base) | 3.085.938.688 | no disponible | 6,8% (estricto) / 32,9% (incl. boxed) | qwen-research | HuggingFace (modelo base oficial) |
| Qwen/Qwen2.5-7B-Instruct (profesor) | no disponible en la informacion proporcionada | no disponible | 41,8% (estricto) / 91,2% (incl. boxed) | qwen-research (heredada del modelo base) | HuggingFace (modelo oficial) |
| L2-qlora-sft (variante del mismo curso) | 3.085.938.688 (mismo base) | no disponible | 71,3% (estricto) | qwen-research | No se indica repositorio publico en la informacion disponible |

La comparativa se limita a los modelos documentados en la model card; no se dispone de datos de otros modelos de 3B especializados en GSM8K en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con problemas aritmeticos de enunciado verbal estilo GSM8K en ingles; no es un modelo de chat general y su uso fuera de ese dominio producira respuestas de baja calidad.
- No tiene ajuste de seguridad adicional mas alla del modelo base; puede generar contenido inapropiado si se le induce fuera de su dominio.
- Puede seguir cometiendo errores aritmeticos: la exactitud en GSM8K test es del 84,1%, no del 100%, y la tasa de formato estricto es del 99,4% (0,6% de respuestas sin linea `#### N` parseable).
- El modelo base Qwen2.5-3B tiene sesgos inheritos de sus datos de preentrenamiento; el ajuste no los corrige y puede reforzar patrones de respuesta del profesor de 7B usado para destilar.
- Restricciones de licencia: se distribuye bajo Qwen Research License, la licencia del modelo base; es necesario revisar sus terminos para uso comercial antes de desplegarlo en produccion.
- El formato de prompt es estricto: requiere el mensaje de sistema y la instruccion exacta documentados; desviarse de ese formato degrada el rendimiento y la tasa de formato.
- La informacion publica es escasa (0 descargas, 0 likes, un unico benchmark declarado y no verificado de forma independiente); no hay validacion externa de los resultados.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) ni soporte para llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPUs de datacenter.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiaeyan423/qwen2.5-3b-gsm8k-distill
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Curvas de entrenamiento, evaluaciones y salidas de ejemplo (W&B): https://forge.coreweave.com/wandb/jiaeyan-423/gsm8k-sft-course
