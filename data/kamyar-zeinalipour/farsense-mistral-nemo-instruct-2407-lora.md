# Kamyar-zeinalipour/FarSense-Mistral-Nemo-Instruct-2407-LoRA

## Resumen
FarSense-Mistral-Nemo-Instruct-2407-LoRA es un adaptador LoRA de PEFT que ensena a Mistral-Nemo-Instruct-2407 a realizar razonamiento de sentido comun anclado en contexto (context-grounded commonsense reasoning) en farsi (persa). Lo desarrolla Kamyar Zeinalipour y forma parte del conjunto de seis adaptadores publicados junto con el benchmark FarSense, presentado en el paper *FarSense: A Comprehensive Commonsense Benchmark and Evaluation Framework for the Farsi Language* (IJCNLP-AACL 2025). El modelo base es un transformer denso de 12.000 millones de parametros de Mistral AI.

El adaptador resuelve un problema concreto: los LLM multilingues rinden de forma notablemente inferior en tareas de sentido comun en farsi, especialmente en formatos de respuesta libre (cloze, causa-efecto, contrafactuales). El ajuste fino eleva la puntuacion global del modelo base en FarSense de 0,604 a 0,654 (+0,050), con mejoras mas acusadas en las metricas de texto libre.

Es relevante ahora porque demuestra que un ajuste LoRA relativamente economico (3 GPUs RTX A6000, menos de 6 horas) sobre un modelo de 12B puede mejorar de forma medible el razonamiento en un idioma de bajos recursos como el farsi, y porque libera tanto el adaptador como el dataset y el codigo de evaluacion bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso decoder-only (Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12B (modelo base); adaptador LoRA de 3,7 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | farsi (fa) como idioma objetivo del ajuste |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Mistral-Nemo-Instruct-2407, un transformer denso decoder-only de 12.000 millones de parametros. El ajuste es un LoRA con r = 128, alpha = 256 y dropout 0,1, aplicado no solo a las proyecciones de atencion (q/k/v/o) y a las capas feed-forward (gate/up/down), sino tambien a `embed_tokens` y `lm_head`. Esta ultima decision explica el tamano del adaptador (3,7 GB), ya que PEFT almacena esas capas con el adaptador.

El entrenamiento uso el split de entrenamiento del dataset CS_Farsi: 4.000 escenarios y 28.000 items. Se realizaron 3 epocas con AdamW, learning rate 1e-4, decaimiento coseno, sin warm-up y weight decay 1e-4, con batch de 4 secuencias por GPU y 2 pasos de acumulacion de gradiente, empaquetado a 2.048 tokens. Se uso precision bf16, DeepSpeed ZeRO-3, Flash Attention 2, gradient clipping de 1,0 y semilla 100. El entrenamiento se ejecuto en 3 GPUs NVIDIA RTX A6000 (48 GB) durante 5 horas y 48 minutos. La decodificacion en evaluacion uso temperature 0,8, top-p 0,95, top-k 50, repetition penalty 1,1 y un maximo de 256 tokens nuevos.

## Capacidades
- Generacion de texto y razonamiento de sentido comun en farsi sobre escenarios cotidianos.
- Respuesta en formato JSON estructurado para distintos tipos de pregunta: juicios verdadero/falso, eleccion multiple, cloze, causa→efecto, contrafactuales y preguntas de tipo "por que".
- Razonamiento anclado en contexto: el modelo debe apoyarse en el escenario proporcionado en el prompt.
- Capacidades heredadas del modelo base Mistral-Nemo-Instruct-2407 (generacion general, instrucciones, codigo), aunque el adaptador no las refuerza especificamente.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Capacidades multilingues: el ajuste se centra en farsi; el resto de idiomas depende del modelo base.

## Casos de uso
- Evaluacion de sentido comun en farsi: usar el adaptador como referencia ajustada para medir la brecha entre modelos base y fine-tuned en el benchmark FarSense, reproduciendo las metricas del paper con los scripts de evaluacion del repositorio de GitHub.
- Sistemas de preguntas y respuestas en persa: el modelo puede responder a escenarios cotidianos con formato JSON controlado, lo que facilita su integracion en pipelines que necesitan salidas parseables (verdadero/falso, opcion multiple).
- Investigacion en idiomas de bajos recursos: sirve como punto de partida para estudiar como el ajuste LoRA sobre un modelo de 12B afecta al rendimiento en farsi frente a modelos mas pequenos de la misma familia FarSense (Llama-3.2-1B, 3B, Llama-3.1-8B).
- Generacion de explicaciones causales en persa: el adaptador mejora las tareas de causa→efecto y contrafactuales (de 0,375 a 0,439 y de 0,377 a 0,455 en text score), util para asistentes educativos que explican relaciones causales.
- Prototipado de asistentes conversacionales en farsi: al estar construido sobre un modelo instruct con plantilla de chat, puede desplegarse para conversaciones multi-turno en persa, con la salvedad de que el ajuste no se ha validado fuera de las tareas FarSense.
- Benchmarking interno de modelos multilingues: el adaptador y el dataset CS_Farsi permiten construir una linea base reproducible para comparar futuros modelos en razonamiento de sentido comun en farsi.

## Benchmarks y rendimiento
Resultados en el split de test de FarSense (1.470 items, 210 escenarios). Las precisiones son exact match; las puntuaciones de texto promedian BLEU-4, ROUGE-L F1, BERTScore F1 y similitud coseno de embeddings.

| Metrica | Base (zero-shot) | FarSense LoRA | Delta |
|---|---:|---:|---:|
| T/F-True accuracy | 0,924 | 0,957 | +0,033 |
| T/F-False accuracy | 0,981 | 0,976 | -0,005 |
| Multiple-choice accuracy | 0,943 | 0,976 | +0,033 |
| Cloze accuracy | 0,310 | 0,395 | +0,086 |
| Cause→Effect (text score) | 0,375 | 0,439 | +0,064 |
| Counterfactual (text score) | 0,377 | 0,455 | +0,078 |
| Explanation (text score) | 0,392 | 0,435 | +0,043 |
| Cloze (text score) | 0,532 | 0,600 | +0,068 |
| Classification (media) | 0,789 | 0,826 | +0,037 |
| Free-form (media) | 0,419 | 0,482 | +0,063 |
| Overall | 0,604 | 0,654 | +0,050 |

## Requisitos de hardware
- El adaptador se distribuye en safetensors (3,7 GB) y requiere cargar el modelo base Mistral-Nemo-Instruct-2407 (12B) para la inferencia.
- El modelo base en bf16 requiere aproximadamente 24 GB de VRAM solo para los pesos; con overhead de activaciones y KV cache conviene disponer de 32 GB o mas.
- GPU recomendadas: NVIDIA RTX A6000 (48 GB), A100 (40/80 GB), H100. Para cuantizacion en 8 bits o 4 bits del modelo base puede caber en GPUs consumer de 24 GB (RTX 3090/4090) o incluso 16 GB con cuantizacion agresiva, aunque no se han publicado mediciones especificas para este adaptador.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card, con `merge_and_unload()`), y potencialmente vLLM, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir los pesos, aunque estas rutas no estan documentadas en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento de referencia: 3 x NVIDIA RTX A6000 (48 GB), 5 h 48 min, con DeepSpeed ZeRO-3 y Flash Attention 2.

## Comparativa con modelos similares
Comparacion dentro de la familia FarSense (misma tarea y mismo benchmark):

| Modelo | Parametros | Overall base → fine-tuned |
|---|---:|---|
| FarSense-Llama-3.2-1B-Instruct-LoRA | 1B | 0,227 → 0,450 |
| FarSense-Llama-3.2-3B-Instruct-LoRA | 3B | 0,449 → 0,529 |
| FarSense-Mistral-Nemo-Instruct-2407-LoRA | 12B | 0,604 → 0,654 |

El adaptador sobre Mistral-Nemo es el de mayor puntuacion absoluta de la familia, aunque tambien el de mayor coste computacional. Los adaptadores sobre Llama muestran mejoras relativas mayores en modelos pequenos, lo que sugiere que el ajuste compensa mas la falta de capacidad en modelos de menor tamano. No se dispone en la informacion proporcionada de comparaciones con otros modelos de 12B o con adaptadores de terceros en FarSense.

## Limitaciones y advertencias
- El adaptador esta especializado en las tareas y el formato del benchmark FarSense; su rendimiento fuera de ese dominio (conversacion general, codigo, matematicas) no esta validado y puede degradarse respecto al modelo base.
- La mejora en T/F-False es ligeramente negativa (-0,005), lo que indica que el ajuste no mejora uniformemente todas las subtareas.
- La puntuacion en tareas de respuesta libre sigue siendo baja en terminos absolutos (0,482 en free-form), por lo que no es adecuado para produccion que exija alta precision en generacion abierta.
- El modelo base Mistral-Nemo-Instruct-2407 esta gated en Hugging Face: es necesario aceptar sus terminos e iniciar sesion con `huggingface-cli login` antes de cargarlo.
- El adaptador tiene 3,7 GB por incluir `embed_tokens` y `lm_head`; esto incrementa los requisitos de almacenamiento y complica la fusion con el modelo base en comparacion con un LoRA convencional.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredarse del modelo base, pueden persistir sesgos del corpus de entrenamiento original.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; en tareas de explicacion y contrafactuales el modelo genera texto libre, sujeto a errores factibles.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial esta condicionado por la licencia del modelo base Mistral-Nemo-Instruct-2407, que debe verificarse por separado.
- El modelo solo declara soporte para farsi; no se ha evaluado su comportamiento en otros idiomas tras el ajuste.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/Kamyar-zeinalipour/FarSense-Mistral-Nemo-Instruct-2407-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset CS_Farsi: https://huggingface.co/datasets/Kamyar-zeinalipour/CS_Farsi
- Paper (IJCNLP-AACL 2025): https://aclanthology.org/2025.ijcnlp-long.187/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/FarSense
- Coleccion FarSense: https://huggingface.co/collections/Kamyar-zeinalipour/farsense-ijcnlp-aacl-2025-6af4553f756c4d246fe7f56c
- Adaptador FarSense-Llama-3.2-1B-Instruct-LoRA: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-1B-Instruct-LoRA
- Adaptador FarSense-Llama-3.2-3B-Instruct-LoRA: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-3B-Instruct-LoRA
