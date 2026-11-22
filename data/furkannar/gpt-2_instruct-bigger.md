# FurkanNar/GPT-2_Instruct-Bigger

## Resumen

GPT-2_Instruct-Bigger es un ajuste fino del modelo GPT-2 de OpenAI (124M parámetros) orientado a seguir instrucciones en inglés. Lo desarrolla FurkanNar, un autor individual, y parte de su propio modelo previo GPT-2_Instruct-v0.1, a su vez derivado de openai-community/gpt2. El objetivo es dotar a un GPT-2 pequeño de capacidades básicas de instrucción mediante fine-tuning supervisado sobre tres conjuntos de datos: Alpaca, SVAMP (problemas matemáticos de enunciado) y Dolly-15k.

El modelo no introduce cambios arquitectónicos: es un transformer decoder-only de la familia GPT-2, con 124.439.808 parámetros totales y un contexto de entrenamiento limitado a 128 tokens. Su relevancia es más didáctica que práctica: sirve como ejemplo de pipeline de fine-tuning, gestión de memoria en GPU y decodificación Best-of-N sobre un modelo pequeño y asequible. No compite con LLM modernos en razonamiento ni en calidad de generación.

La model card documenta el proceso de entrenamiento con pérdida y perplejidad por época, así como un sistema de inferencia con muestreo Best-of-4 y puntuación por log-verosimilitud normalizada por longitud. La licencia es MIT y el repositorio ocupa unos 0,5 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens en entrenamiento; 512 tokens de max_length en el script de inferencia con truncado de turnos |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; pesos en safetensors en FP16/FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), config.json, generation_config.json |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estándar: transformer decoder-only con atención causal, sin modificaciones estructurales respecto al modelo base de OpenAI. El fine-tuning se realizó sobre FurkanNar/GPT-2_Instruct-v0.1, que a su vez deriva de openai-community/gpt2. Los datos de entrenamiento combinan tres fuentes: tatsu-lab/alpaca (instrucciones generales), ChilleD/SVAMP (problemas matemáticos de enunciado) y databricks/databricks-dolly-15k (instrucciones diversas). La model card no especifica el número total de tokens ni la composición exacta por dataset.

Los hiperparámetros documentados son: longitud máxima de secuencia de 128 tokens, 4 épocas, batch size de 4, learning rate de 2e-5, gradiente máximo de norma 1.0, precisión mixta FP16 y fracción de memoria GPU limitada al 50%. No se menciona RLHF, DPO ni ninguna etapa de alineación posterior al fine-tuning supervisado. La pérdida de validación baja de 2,8375 a 2,7618 entre la primera y la cuarta época, y la perplejidad de validación de 17,07 a 15,83, sin señales claras de sobreajuste según el autor. El proceso de inferencia incorpora un esquema Best-of-N (N=4 por defecto) con puntuación por log-verosimilitud normalizada por longitud y temperatura de calibración independiente de la de generación.

## Capacidades

- Generación de texto en inglés con formato de instrucción y respuesta.
- Seguimiento básico de instrucciones simples, limitado por el tamaño del modelo y el contexto de 128 tokens de entrenamiento.
- Resolución de problemas matemáticos de enunciado sencillos, por influencia del dataset SVAMP.
- Conversación multi-turno mediante el script de inferencia, que mantiene historial con etiquetas "Instruction:" y "Response:" y trunca turnos cuando se superan los 512 tokens.
- Decodificación Best-of-4 con selección por log-verosimilitud normalizada por longitud, temperatura de generación 0,7, top-k 40, top-p 0,9, penalización de repetición 1,15 y bloqueo de n-gramas repetidos de tamaño 3.
- Criterios de parada personalizados que detectan secuencias como "\nInstruction:", "\nResponse:" o "\nUser:" para evitar sobre-generación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Experimentación educativa con fine-tuning: sirve para reproducir un pipeline completo de ajuste supervisado sobre GPT-2 con tres datasets públicos, monitorizando pérdida y perplejidad por época en una GPU de consumo.
- Prototipado de asistentes de instrucciones muy acotados: para tareas de respuesta corta en inglés donde el contexto quepa en 128 tokens y la calidad exigida sea baja, permite validar la interfaz de instrucción antes de migrar a un modelo mayor.
- Generación de respuestas a problemas aritméticos de enunciado simple: el entrenamiento con SVAMP le da cierta familiaridad con este formato, útil para demos de razonamiento matemático elemental.
- Base para comparativas de decodificación: su implementación de Best-of-4 con puntuación por log-verosimilitud permite estudiar el efecto de la selección de candidatos frente a muestreo simple en modelos pequeños.
- Docencia sobre gestión de memoria en GPU: los ajustes documentados (FP16, gradient clipping, límite de memoria al 50%, PYTORCH_CUDA_ALLOC_CONF) ilustran técnicas para entrenar en hardware limitado.
- Generación de texto creativo breve en inglés: con temperatura 0,7 y penalización de repetición, puede producir párrafos cortos para pruebas de interfaz o relleno de contenido no crítico.
- Referencia para construir conversadores multi-turno con contexto corto: el script de truncado de turnos y los criterios de parada sirven de plantilla para sistemas con ventanas pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de entrenamiento y validación:

| Epoca | Train loss | Train perplexity | Val loss | Val perplexity |
|---|---|---|---|---|
| 1 | 3,1501 | 23,3380 | 2,8375 | 17,0723 |
| 2 | 2,9357 | 18,8347 | 2,7899 | 16,2790 |
| 3 | 2,8122 | 16,6459 | 2,7688 | 15,9397 |
| 4 | 2,7149 | 15,1032 | 2,7618 | 15,8282 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16 (124M parámetros, ~250 MB de pesos) y menos de 0,5 GB en FP32 con overhead mínimo; el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4060, GTX 1660 y superiores. Para entrenamiento, el autor limitó la fracción de memoria al 50%, lo que sugiere que cabe en GPUs de 8 GB o menos.
- Cabe en GPU de consumo sin problema, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta declarada), llama.cpp u Ollama si se convierte a GGUF (no se publican pesos GGUF en el repositorio). vLLM es viable pero sobredimensionado para este tamaño.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo, la generación de 100 tokens es del orden de milisegundos a decenas de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GPT-2_Instruct-Bigger (este) | 124,4M | 128 (entrenamiento) / 512 (inferencia) | MIT | Hugging Face | Fine-tuning de instrucciones sobre GPT-2 con Best-of-N |
| openai-community/gpt2 | 124,4M | 1024 | MIT | Hugging Face | Modelo base sin ajuste de instrucciones |
| FurkanNar/GPT-2_Instruct-v0.1 | no disponible | no disponible | MIT (según repo base) | Hugging Face | Versión previa del mismo autor, base de este modelo |
| FurkanNar/GPT-2_Instruct-v0.6 | no disponible | no disponible | no disponible | Hugging Face | Versión posterior indicada como new_version en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy reducido (124M parámetros): conocimiento factual limitado, razonamiento débil y alta probabilidad de respuestas incorrectas o incoherentes en tareas complejas.
- Contexto de entrenamiento de solo 128 tokens: las respuestas largas y las conversaciones multi-turno superan con facilidad la ventana útil, lo que degrada la coherencia.
- Riesgo elevado de alucinación: al ser GPT-2, tiende a inventar hechos, cifras y procedimientos con apariencia plausible, como se observa en el ejemplo de la model card sobre cómo hacer una ensalada.
- Solo inglés: no hay soporte multilingüe documentado.
- El autor reconoce "tight clusters": los candidatos del Best-of-4 pueden ser muy similares entre sí, lo que reduce la eficacia del muestreo cuando los datos de entrenamiento tienen poca diversidad en un dominio.
- Licencia MIT: permite uso comercial, pero el modelo base GPT-2 y los datasets empleados pueden tener sus propias condiciones; conviene revisarlas antes de un despliegue comercial.
- No apto para producción con requisitos de fiabilidad, seguridad o precisión; debe tratarse como prototipo o material didáctico.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FurkanNar/GPT-2_Instruct-Bigger
- Modelo base previo: https://huggingface.co/FurkanNar/GPT-2_Instruct-v0.1
- Modelo base original: https://huggingface.co/openai-community/gpt2
- Versión posterior indicada: https://huggingface.co/FurkanNar/GPT-2_Instruct-v0.6
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset SVAMP: https://huggingface.co/datasets/ChilleD/SVAMP
- Dataset Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
