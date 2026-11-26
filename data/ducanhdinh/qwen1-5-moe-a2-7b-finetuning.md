# ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning

## Resumen

Qwen1.5-MoE-A2.7B-Finetuning es un adaptador LoRA publicado por el usuario ducanhdinh sobre el modelo base Qwen/Qwen1.5-MoE-A2.7B, un transformer de tipo Mixture-of-Experts desarrollado por Alibaba Cloud. El adaptador se entrena de forma conjunta en tres tareas heterogeneas —inferencia de lenguaje natural (SNLI), question answering extractivo (SQuAD) y eleccion multiple (MMLU)— mezclando los tres conjuntos de datos en un unico entrenamiento multi-tarea. El objetivo es dotar al modelo base de un comportamiento consistente de respuesta corta y formatada para estas tres tareas sin reentrenar los pesos completos.

El repositorio contiene unicamente los pesos del adaptador PEFT (safetensors), no el modelo base, aunque el tamano del repo (386,5 GB) sugiere que se han subido tambien otros artefactos o checkpoints. La licencia declarada es Apache 2.0, heredada del modelo base. El pipeline declarado en Hugging Face es question-answering, y las etiquetas incluyen nli, multiple-choice y multi-task.

Es relevante para quienes necesiten un punto de partida rapido para tareas de clasificacion de pares de frases, QA extractivo y respuesta a preguntas de opcion multiple sobre un modelo MoE de activacion ligera (2,7B parametros activos), con la ventaja de que el adaptador es pequeno y se puede cargar sobre el modelo base sin duplicar los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 24 capas, 60 expertos, top-4 |
| Parametros totales | no disponible (modelo base Qwen1.5-MoE-A2.7B; total no especificado en la informacion) |
| Parametros activos | 2,7B (segun el nombre del modelo base) |
| Longitud de contexto | no disponible en la informacion del adaptador; el entrenamiento uso max_length = 512 |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion, pero no se detalla) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen1.5-MoE-A2.7B, un transformer MoE con 24 capas, 60 expertos y enrutamiento top-4. El fine-tuning LoRA se restringe a las capas [8, 16) de las 24 totales (aproximadamente del tercio inicial al segundo tercio de la red). Se anaden adaptadores de bajo rango a los modulos de atencion (r = 16), al router (r = 4) y a los expertos (r = 16), con alpha = 32 y dropout = 0,05, usando `rank_pattern` de PEFT para rangos diferenciados.

El entrenamiento combina tres conjuntos de datos mezclados y barajados: SNLI (549.367 muestras tras filtrado), SQuAD (87.599) y MMLU (87.691). Se realizan 3 epocas con learning rate 2e-4, warmup del 3 %, grad clip 1,0 y batch fijo de 8 muestras por GPU, con max_length = 512; los contextos largos de SQuAD se ventanean alrededor de la posicion de la respuesta. La funcion de perdida suma la cross-entropy estandar calculada solo sobre los tokens de la respuesta (`<answer><eos>`) mas un termino de load balancing de MoE (`lb_loss_coef` = 0,01) sobre los routers de las capas fine-tuneadas, normalizado por el total de tokens objetivo del batch global. El formato de prompt se mantiene identico entre entrenamiento y evaluacion zero-shot para cada tarea.

## Capacidades

- Generacion de texto condicionada a formato de respuesta corta para tres tareas: NLI (entailment, neutral, contradiction), QA extractivo y eleccion multiple A/B/C/D.
- Clasificacion de pares premisa-hipotesis (SNLI).
- Question answering extractivo sobre un contexto dado (SQuAD).
- Resolucion de preguntas de opcion multiple por asignatura (MMLU).
- Capacidad multilingue: no disponible en la informacion (el modelo base Qwen1.5 tiene soporte multilingue, pero el adaptador no documenta idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Clasificacion de implicacion textual en pipelines de moderacion o deteccion de contradicciones: el adaptador responde con una etiqueta entre entailment, neutral y contradiction siguiendo el formato SNLI, lo que permite integrarlo en un servicio de verificacion de afirmaciones.
- Extraccion de respuestas en sistemas de busqueda documental: dado un contexto y una pregunta en el formato SQuAD, el modelo devuelve la respuesta extractiva, adecuado para motores de QA sobre corpus fijos.
- Evaluacion automatica de examenes tipo test: el formato MMLU con opciones A-D permite usar el adaptador como clasificador de respuesta en plataformas de evaluacion educativa.
- Prototipado rapido de asistentes de soporte con respuestas cortas y formatadas: el adaptador impone una estructura de salida predecible tras `Answer:`, lo que simplifica el parseo en produccion.
- Investigacion en fine-tuning multi-tarea sobre MoE: sirve como referencia reproducible de como combinar LoRA en atencion, router y expertos con load balancing, util para experimentos academicos.
- Generacion de datos sinteticos etiquetados: el modelo puede usarse para pre-etiquetar pares NLI o preguntas de opcion multiple que luego se revisan manualmente, reduciendo coste de anotacion.
- Base para adaptaciones posteriores: al ser un adaptador LoRA sobre un MoE de activacion ligera (2,7B activos), se puede cargar en GPUs de gama alta consumer y seguir ajustando con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye diagnosticos de entrenamiento (curvas de loss y precision de token con teacher forcing sobre batches de entrenamiento), que no constituyen evaluaciones estandar sobre conjuntos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el modelo base tiene 2,7B parametros activos, pero el total de parametros MoE no se especifica en la informacion, por lo que la VRAM depende del checkpoint completo cargado.
- GPU recomendadas: no disponible en la informacion. Por el tamano del repo (386,5 GB) y la naturaleza MoE, se requiere almacenamiento amplio y probablemente GPUs de centro de datos (A100/H100) para cargar el modelo base completo en precision nativa.
- Compatibilidad con GPU consumer: no confirmada; depende de la cuantizacion del modelo base, que no se documenta en el adaptador.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con la libreria `peft` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen1.5-MoE-A2.7B-Finetuning (este) | 2,7B activos (total no disponible) | no disponible (entrenado a 512) | Apache 2.0 | Hugging Face, adaptador LoRA |
| Qwen/Qwen1.5-MoE-A2.7B (base) | 2,7B activos (total no disponible) | no disponible en la informacion | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para tres formatos de prompt concretos; fuera de ellos el comportamiento no esta garantizado.
- La perdida se calcula solo sobre la respuesta, por lo que el modelo puede ignorar instrucciones fuera del esquema entrenado.
- Sesgos conocidos: no documentados en la informacion; al heredar el modelo base, puede reproducir sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: presente en tareas generativas, especialmente en QA extractivo cuando la respuesta no esta en el contexto.
- Limitaciones de contexto: el entrenamiento usa max_length = 512, por lo que contextos mas largos pueden degradar el rendimiento aunque el modelo base soporte ventanas mayores.
- Idiomas: no documentados; el adaptador se entrena con datasets predominantemente en ingles (SNLI, SQuAD, MMLU), por lo que el rendimiento en castellano no esta validado.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los datasets empleados.
- El repositorio incluye 386,5 GB, lo que puede implicar artefactos adicionales no descritos; conviene revisar el contenido antes de descargarlo.
- No hay evaluacion estandar publicada; las metricas de la model card son de entrenamiento y no sirven para estimar rendimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
