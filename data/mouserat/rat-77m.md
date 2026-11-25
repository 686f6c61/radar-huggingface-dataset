# Mouserat/rat-77m

## Resumen

rat-77m es un modelo de lenguaje encoder-decoder de tipo T5 desarrollado por Mouserat, con 76.877.312 parámetros (aproximadamente 77 millones). Está diseñado para tareas de generación texto-a-texto (text2text-generation) y declara soporte para japones e ingles. Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 1,6 GB.

Se trata de un modelo entrenado exclusivamente en fase de preentrenamiento: el autor indica explicitamente en la model card que no se ha aplicado ajuste supervisado (SFT) ni ningun tipo de alineacion para instrucciones o dialogo. Por tanto, no debe utilizarse como modelo de chat ni esperar de el comportamiento de seguimiento de instrucciones. Su interes reside en ser una base compacta y abierta para experimentacion e investigacion en arquitecturas T5 de pequeno tamano con cobertura bilingue japones-ingles.

El modelo se publico en noviembre de 2026 y acumula 326 descargas y 2 likes en Hugging Face, lo que lo situa como un proyecto de nicho, probablemente de caracter experimental o academico. La informacion publica disponible es limitada: no hay resultados de benchmarks independientes, no se detalla la composicion exacta del dataset mas alla de su nombre, y la model card esta redactada principalmente en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder, transformer) |
| Parametros totales | 76.877.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

rat-77m sigue la arquitectura T5, un transformer encoder-decoder con atencion completa y normalizacion por capas, orientado a tareas de generacion texto-a-texto. El modelo cuenta con aproximadamente 77 millones de parametros, lo que lo situa en la gama de modelos muy compactos, adecuados para entornos con recursos limitados o para servir como base de experimentacion.

El entrenamiento se realizo mediante preentrenamiento auto-supervisado sobre el dataset Mouserat/llmjp4-2b-dataset, cuyo nombre sugiere un corpus de aproximadamente 2.000 millones de tokens de origen japones. La model card incluye la curva de perdida de entrenamiento y evaluacion, con la advertencia de que la perdida de entrenamiento registrada esta corregida dividiendo por 4 debido a la acumulacion de gradientes (GRAD_ACCUM=4), mientras que la perdida de evaluacion se muestra sin correccion. No se especifica el numero exacto de tokens vistos, la composicion detallada del corpus ni si se aplicaron tecnicas como RLHF o DPO; de hecho, el autor confirma que no se aplico ningun ajuste posterior al preentrenamiento.

La innovacion tecnica destacable es limitada: se trata de un T5 estandar sin mecanismos adicionales documentados como decodificacion especulativa, atencion lineal o arquitecturas hibridas. El interes esta en la combinacion de tamano reducido, cobertura bilingue japones-ingles y publicacion abierta de los checkpoints y el estado del entrenador.

## Capacidades

- Generacion de texto texto-a-texto: al ser un modelo T5 preentrenado, puede realizar tareas de transformacion de secuencias (resumen, traduccion, parafrasis) si se le proporciona el formato adecuado, aunque sin garantias de calidad por falta de ajuste.
- Modelado de lenguaje bilingue: declara soporte para japones e ingles, aunque no se especifica el grado de competencia en cada idioma.
- Base para fine-tuning: su tamano compacto y licencia permisiva lo hacen util como punto de partida para tareas especificas.
- No soporta tool calling ni function calling de forma nativa.
- No soporta comportamiento agentico ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No es un modelo de chat ni de seguimiento de instrucciones.

## Casos de uso

- Investigacion en arquitecturas T5 de pequeno tamano: el modelo sirve como referencia para estudiar el comportamiento de encoder-decoders compactos en corpus japoneses, comparando curvas de perdida y convergencia.
- Fine-tuning para tareas de traduccion japones-ingles: partiendo del preentrenamiento bilingue, se puede ajustar con pares paralelos para obtener un traductor especializado de bajo coste computacional.
- Generacion de resumenes de documentos japoneses: tras un ajuste supervisado con datos de resumen, el modelo podria emplearse para condensar textos en entornos con restricciones de memoria.
- Clasificacion y etiquetado de texto: aunque es un modelo generativo, su encoder puede reutilizarse para tareas de clasificacion mediante fine-tuning con cabezas especificas.
- Prototipado rapido en entornos educativos: su tamano de 77M permite ejecutarlo en CPU o GPUs de gama baja, lo que facilita su uso en docencia y experimentacion.
- Base para estudios de sesgo y etica en modelos japoneses: al ser un modelo abierto y pequeno, permite analizar sesgos en corpus japoneses sin los costes de modelos mayores.
- Generacion de texto aumentada con recuperacion (RAG) tras ajuste: podria integrarse en pipelines de respuesta a preguntas sobre documentos, siempre que se realice un fine-tuning previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye la curva de perdida de entrenamiento y evaluacion, que el propio autor califica como valor de referencia y no como evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,3 GB solo para pesos, mas memoria para activaciones y KV cache; en la practica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,15 GB para pesos, con un total inferior a 0,5 GB incluyendo overhead.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 2 GB de VRAM es suficiente. Para entrenamiento o fine-tuning, una RTX 3060 o superior es adecuada.
- Opciones de despliegue: compatible con Hugging Face Transformers (T5ForConditionalGeneration), y potencialmente con llama.cpp u Ollama si se genera una conversion a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 77M, la latencia en GPU moderna seria del orden de milisegundos por secuencia corta, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-77m | 76,9M | no disponible | japones, ingles | Apache 2.0 | Hugging Face |
| T5-small | 60M | 512 tokens | ingles (principalmente) | Apache 2.0 | Hugging Face |
| T5-base | 220M | 512 tokens | ingles (principalmente) | Apache 2.0 | Hugging Face |
| mT5-small | 300M | 512 tokens | multilingue (101 idiomas) | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos T5 de referencia, ya que no se dispone de datos de rendimiento de rat-77m. Frente a T5-small, rat-77m ofrece un tamano ligeramente superior y cobertura declarada de japones, aunque sin benchmarks que confirmen su calidad. Frente a mT5-small, rat-77m es mas pequeno y con menos idiomas, pero potencialmente mas especializado en japones. No se dispone de informacion sobre modelos comparables especificos para japones de este tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no ha recibido SFT ni alineacion, por lo que no debe usarse como chatbot ni esperar seguimiento de instrucciones.
- Riesgo elevado de alucinacion y generacion de texto incoherente en tareas generativas sin fine-tuning.
- Sesgos desconocidos: no se documenta analisis de sesgos; al entrenarse sobre un corpus japones no especificado, puede reflejar sesgos culturales y linguisticos de dicha fuente.
- Limitaciones de contexto: no se especifica la longitud maxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Cobertura idiomatica no verificada: aunque declara japones e ingles, no se detalla el nivel de competencia ni la proporcion de cada idioma en el corpus.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo preentrenado sin garantias, el usuario asume el riesgo de calidad.
- Documentacion mayoritariamente en japones, lo que puede dificultar su adopcion por parte de desarrolladores no japoneses.
- Sin resultados de benchmarks independientes: no hay evidencia publica de su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mouserat/rat-77m
- Dataset de entrenamiento: https://huggingface.co/datasets/Mouserat/llmjp4-2b-dataset
- Bucket de almacenamiento: https://huggingface.co/buckets/Mouserat/rat-77m
- Historial de entrenamiento (checkpoint-15258): https://huggingface.co/buckets/Mouserat/rat-77m/tree/checkpoints/run01/checkpoint-15258/trainer_state.json
- Especificaciones tecnicas (docs/spec.md): no disponible como enlace directo en la informacion proporcionada
- Notebook de entrenamiento (notebooks/rat77m_train_ready.ipynb): no disponible como enlace directo en la informacion proporcionada
