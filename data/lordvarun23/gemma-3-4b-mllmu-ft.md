# Lordvarun23/gemma-3-4b-mllmu-ft

## Resumen

Gemma-3-4B fine-tuned on MLLMU-Bench es un ajuste fino completo del modelo multimodal google/gemma-3-4b-it, publicado por el usuario Lordvarun23 en HuggingFace. El modelo se entrena sobre los pares de pregunta-respuesta de los 500 perfiles ficticios del banco de pruebas MLLMU-Bench, un conjunto diseñado para investigar el desaprendizaje de maquina (machine unlearning) en modelos multimodales. Su proposito no es el uso generalista, sino servir como punto de partida para experimentos de unlearning: el checkpoint representa el estado "antes de olvidar" sobre el que se aplican despues tecnicas como GradDiff, KL-Min o NPO.

El modelo conserva la arquitectura original de Gemma 3 4B (transformer multimodal con torre de vision) y sus 4.300.079.472 parametros, pero ha sido ajustado con un fine-tune completo que incluye la torre de vision. La relevancia actual reside en que proporciona una linea base reproducible para evaluar metodos de eliminacion de conocimiento en modelos image-text-to-text, un area con pocos checkpoints publicos y metricas estandarizadas.

La model card reporta una exactitud del 46 % en las preguntas de olvido (forget_5) y del 47 % en las de retencion (retain), juzgadas por Qwen3-32B, frente al 3 % y 6 % del modelo base. Esto confirma que el ajuste fino memoriza efectivamente los perfiles ficticios, condicion necesaria para que los experimentos de unlearning posteriores tengan sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) con torre de vision |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer multimodal que procesa entradas de imagen y texto (pipeline image-text-to-text). El ajuste fino es completo, incluyendo la torre de vision, sobre los pares de pregunta-respuesta de los 500 perfiles ficticios de MLLMU-Bench. La perdida se calcula unicamente sobre los tokens de respuesta, con optimizador AdamW (weight decay 0), learning rate 2e-5 con schedule coseno y 3 % de warm-up, 5 epocas, batch size 16, grad clip 1.0 y semilla 42. El entrenamiento usa pesos en fp32 con autocast bf16 y se guarda en bf16.

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion tecnica del checkpoint no esta en la arquitectura, sino en su rol como artefacto de referencia para evaluar metodos de machine unlearning multimodal: el modelo memoriza los perfiles y sirve de base para comparar tecnicas de olvido selectivo.

## Capacidades

- Generacion de texto conversacional en ingles a partir de entradas de imagen y texto.
- Comprension de imagenes (image-text-to-text) heredada de Gemma 3 4B.
- Respuesta a preguntas sobre los 500 perfiles ficticios de MLLMU-Bench (conocimiento memorizado por el ajuste fino).
- Soporte de conversaciones multi-turno (tag conversational).
- Compatible con endpoints de text-generation-inference.
- Capacidades de tool calling, agentes o thinking mode: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como estado "antes de olvidar" para entrenar variantes con GradDiff, KL-Min, NPO u otras tecnicas y comparar la degradacion de la exactitud en forget_5 frente a retain.
- Evaluacion de metodos de olvido selectivo multimodal: permite medir si una tecnica elimina el conocimiento de perfiles concretos sin destruir el conocimiento de los perfiles que deben retenerse.
- Reproduccion de experimentos academicos: al estar publicados los hiperparametros y la semilla, otros grupos pueden replicar el ajuste fino sobre MLLMU-Bench.
- Benchmarking de jueces automaticos: la model card usa Qwen3-32B como juez, por lo que el checkpoint facilita calibrar y comparar evaluadores LLM en tareas de exactitud factual.
- Estudio de memorizacion en modelos multimodales: permite analizar hasta que punto un fine-tune completo sobre datos sinteticos induce memorizacion de identidades ficticias.
- Desarrollo de pipelines de privacidad y cumplimiento: sirve como banco de pruebas para validar flujos de eliminacion de datos en modelos que procesan imagenes y texto.
- Analisis de sesgo y robustez: al disponer de perfiles ficticios controlados, se pueden estudiar respuestas del modelo ante atributos demograficos o narrativos concretos.

## Benchmarks y rendimiento

Exactitud en preguntas de generacion en ingles, juzgada por Qwen3-32B, con 100 preguntas forget_5 y 200 preguntas de 50 perfiles retain:

| Modelo | forget_5 (juez) | retain (juez) |
|---|---|---|
| Gemma-3-4B-it (base) | 0.03 | 0.06 |
| fine-tuned (este modelo) | 0.46 | 0.47 |
| retain-only | 0.17 | 0.66 |
| GradDiff | 0.35 | 0.45 |
| KL-Min | 0.26 | 0.37 |
| NPO | 0.07 | 0.41 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 en consumer.
- Cabe en GPU consumer de 16 GB o mas en bf16; en 8 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers, text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-4b-mllmu-ft (este) | 4.300 M | no disponible | Fine-tune completo sobre MLLMU-Bench | gemma | HuggingFace |
| google/gemma-3-4b-it | 4.300 M | no disponible | Modelo base multimodal instruction-tuned | gemma | HuggingFace |
| gemma-3-4b-mllmu-retain95 | 4.300 M | no disponible | Fine-tune solo con perfiles retain | gemma | HuggingFace |
| gemma-3-4b-mllmu-graddiff-forget5 | 4.300 M | no disponible | Unlearning con GradDiff sobre forget_5 | gemma | HuggingFace |
| gemma-3-4b-mllmu-npo-forget5 | 4.300 M | no disponible | Unlearning con NPO sobre forget_5 | gemma | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de asistencia.
- Entrenado exclusivamente en ingles segun la model card; el rendimiento en otros idiomas no esta caracterizado.
- Memoriza deliberadamente 500 perfiles ficticios de MLLMU-Bench; puede reproducir datos de esos perfiles, lo que constituye el objeto del experimento pero es un riesgo si se usa fuera de contexto.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad fuera del banco de pruebas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a las condiciones de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion.
- Sin descargas ni likes en el momento de la ficha; no ha pasado por validacion de la comunidad.
- No se han publicado cuantizaciones oficiales ni datos de throughput, por lo que el despliegue eficiente requiere trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-ft
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint retain-only: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-retain95
- Checkpoint GradDiff: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-graddiff-forget5
- Checkpoint KL-Min: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-klmin-forget5
- Checkpoint NPO: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-npo-forget5
- Dataset MLLMU-Bench: https://huggingface.co/datasets/MLLMMU/MLLMU-Bench
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
