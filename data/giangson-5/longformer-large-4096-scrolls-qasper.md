# GiangSon-5/longformer-large-4096-scrolls-qasper

## Resumen

longformer-large-4096-scrolls-qasper es un modelo de question answering extractivo sobre documentos cientificos largos, publicado por el usuario GiangSon-5 en Hugging Face. Se trata de un fine-tuning del Longformer-Large de AllenAI (435 millones de parametros, 24 capas de encoder) sobre el subconjunto QASper del benchmark SCROLLS, con una ventana de contexto nativa de 4.096 tokens. El modelo resuelve el problema de responder preguntas de busqueda de informacion cuyas respuestas estan dispersas en articulos de arXiv y papers de linguistica computacional, evitando la truncacion o el chunking que requieren los modelos BERT clasicos.

La relevancia tecnica reside en su atencion dispersa: combina una ventana deslizante local de 512 tokens con atencion global selectiva sobre los tokens de la pregunta, logrando un escalado lineal O(n) en lugar del cuadratico O(n²) del self-attention estandar. Esto permite procesar papers completos en una sola pasada sin perdida de contexto entre parrafos, algo critico en tareas de extraccion de informacion cientifica.

El modelo esta pensado para investigacion y desarrollo, no como un asistente conversacional general. Su licencia Apache 2.0 y su tamano moderado (1,7 GB en el repositorio) lo hacen accesible para despliegue en infraestructura modesta, aunque su unico idioma soportado es el ingles y su dominio esta acotado a texto cientifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Longformer-Large (transformer encoder con atencion dispersa local + global) |
| Parametros totales | 435 millones (~435M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Longformer descrita en el paper arXiv:2004.05150. Consta de 24 capas de encoder con una dimension oculta (d_model) de 1.024, 16 cabezas de atencion de 64 dimensiones cada una y una capa feed-forward de 4.096 unidades. La innovacion central es el mecanismo de atencion: cada token atiende a una ventana local deslizante de 512 tokens (w = 512), mientras que un conjunto reducido de tokens recibe atencion global. En este fine-tuning, la atencion global se asigna al token `<s>` (indice 0) y a todos los tokens de la pregunta, de modo que el modelo puede correlacionar la consulta con cualquier fragmento del documento. Esto reduce la complejidad de O(n²) a O(n) y permite cubrir los 4.096 tokens completos sin truncar.

El entrenamiento se realizo sobre el subconjunto QASper del dataset `tau/scrolls`, con 2.567 papers de entrenamiento, 1.726 de validacion y 3.437 de test. Los documentos son articulos completos de arXiv y linguistica computacional de entre 2.500 y 4.500 palabras. Se entrenaron 3 epocas completas en una NVIDIA A100-SXM4-40GB con gradient checkpointing, bfloat16 nativo y TF32. La cabeza de tarea es `LongformerForQuestionAnswering`, que proyecta las representaciones en logits de inicio y fin para extraer el span de respuesta. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Question answering extractivo sobre documentos largos: localiza el span exacto de respuesta dentro de un contexto de hasta 4.096 tokens.
- Extraccion de informacion en papers cientificos: responde preguntas de busqueda de informacion que requieren recuperacion semantica entre parrafos.
- Procesamiento de contexto largo sin truncacion: cubre articulos completos de 2.500 a 4.500 palabras en una sola pasada.
- Atencion global configurable: el usuario puede asignar atencion global a los tokens de la pregunta mediante `global_attention_mask`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un modelo extractivo, no generativo.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Revision bibliografica automatizada: dado un paper de arXiv cargado como contexto, el modelo extrae respuestas concretas sobre metodologia, resultados o limitaciones, aprovechando los 4.096 tokens para cubrir secciones completas sin chunking.
- Construccion de bases de conocimiento cientifico: en pipelines de extraccion de informacion, se usa para poblar campos estructurados (dataset empleado, metrica reportada, arquitectura propuesta) a partir de texto no estructurado.
- Asistente de lectura para investigadores: integrado en una interfaz de lectura de PDFs, responde preguntas del usuario sobre el articulo abierto, con latencia baja gracias a sus 435M de parametros.
- Enriquecimiento de repositorios documentales: indexacion semantica de bibliotecas de papers donde cada consulta se resuelve contra el documento completo, sin necesidad de un retriever externo para documentos de hasta 4.096 tokens.
- Moderacion y verificacion de afirmaciones cientificas: comprobacion extractiva de si una afirmacion aparece respaldada en un paper concreto, devolviendo el span de evidencia.
- Extraccion de entidades y relaciones en dominios cientificos: adaptado con un cabezal adicional o usado como encoder de caracteristicas para tareas de NER y relation extraction sobre texto academico.
- Generacion de resumenes extractivos por consulta: seleccion de los fragmentos mas relevantes de un paper en funcion de una pregunta de interes, util en sistemas de alertas bibliograficas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| SCROLLS QASper (validation split) | Exact Match | 68,48 |
| SCROLLS QASper (validation split) | F1 | 68,55 |
| SCROLLS QASper (validation split) | Loss | 2,1722 |

La model card menciona ademas un pico de convergencia de 71,32% EM/F1 y una loss de validacion optima de 1,9306, aunque estos valores no aparecen en el model-index oficial. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB de pesos mas activaciones; en la practica, 3-4 GB con batches pequenos y contexto completo de 4.096 tokens.
- VRAM estimada en fp16/bf16: alrededor de 1 GB para pesos, 2-3 GB con activaciones a longitud maxima.
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), cualquier GPU con al menos 4 GB de VRAM para inferencia.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y modelos con 6 GB o mas; tambien en CPU para inferencia por lotes con latencia aceptable.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TorchScript; vLLM y llama.cpp no estan orientados a modelos encoder de QA extractivo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark QASper | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GiangSon-5/longformer-large-4096-scrolls-qasper | 435M | 4.096 | 68,48 EM / 68,55 F1 | Apache 2.0 | Hugging Face |
| allenai/longformer-large-4096 | 435M | 4.096 | no disponible (modelo base sin fine-tuning en QASper) | Apache 2.0 | Hugging Face |
| Modelos BERT/RoBERTa de QA extractivo | 110M-355M | 512 | no disponible | variable | Hugging Face |

La comparacion directa con alternativas fine-tuneadas en QASper no esta disponible en la informacion proporcionada. Frente al modelo base de AllenAI, la diferencia principal es el ajuste especifico en el subconjunto QASper y la configuracion de atencion global sobre tokens de pregunta.

## Limitaciones y advertencias

- Solo soporta ingles; no esta entrenado ni evaluado en castellano ni en otros idiomas.
- Es un modelo extractivo: no genera texto libre, solo devuelve spans del contexto; no sirve como chatbot ni para resumen abstractivo.
- Dominio acotado a texto cientifico (arXiv y linguistica computacional); su rendimiento en otros generos puede degradarse.
- Riesgo de alucinacion bajo en sentido estricto (extrae del contexto), pero puede seleccionar spans incorrectos o irrelevantes cuando la respuesta no esta presente en el documento.
- Ventana maxima de 4.096 tokens: papers mas largos requieren truncacion o estrategias de chunking, lo que reintroduce perdida de contexto.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- La licencia Apache 2.0 permite uso comercial, pero el modelo se publica como pieza de portfolio e investigacion; no hay garantias de soporte ni mantenimiento.
- No dispone de mecanismos de tool calling ni de razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiangSon-5/longformer-large-4096-scrolls-qasper
- Perfil del autor: https://huggingface.co/GiangSon-5
- Modelo base Longformer-Large de AllenAI: https://huggingface.co/allenai/longformer-large-4096
- Dataset SCROLLS: https://huggingface.co/datasets/tau/scrolls
- Paper Longformer (arXiv:2004.05150): https://arxiv.org/abs/2004.05150
- Paper SCROLLS (arXiv:2201.03533): https://arxiv.org/abs/2201.03533
- Paper QASper (arXiv:2105.03011): https://arxiv.org/abs/2105.03011
