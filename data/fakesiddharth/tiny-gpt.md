# FakeSiddharth/Tiny-GPT

## Resumen

Tiny-GPT es un modelo de lenguaje causal de 51.082.752 parametros desarrollado por el usuario FakeSiddharth y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer decoder-only con arquitectura estilo GPT-2 (`GPT2LMHeadModel`), entrenado desde cero sobre aproximadamente 3.050.037.248 posiciones de token procedentes de los datasets FineWeb y FineWeb-Edu. El modelo se distribuye en formato GGUF FP16 (sin cuantizar, en torno a 99,5 MiB) y esta pensado para inferencia local en herramientas como LM Studio o llama.cpp.

El objetivo declarado del proyecto no es competir con modelos de gran escala, sino documentar el ciclo de vida completo de un LLM pequeno de extremo a extremo: preentrenamiento multi-GPU con acumulacion de gradientes, cache de validacion determinista, SFT con enmascaramiento solo de respuesta, benchmarking aislado multi-configuracion e inferencia local en FP16. Incluye un estudio de ablacion de SFT con dos mezclas de datos: Mix A (70% dialogo conversacional / 30% QA) y Mix B (30% dialogo / 70% QA).

Es relevante ahora como referencia educativa y como banco de pruebas reproducible para quienes quieran entender el pipeline completo de un modelo conversacional minimo. El propio autor advierte de limitaciones claras de capacidad: el modelo alucina hechos, falla en matematicas simbolicas y logica, y no genera sintaxis Python correcta. Su ventana de contexto es de solo 256 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (`GPT2LMHeadModel`) |
| Parametros totales | 51.082.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | FP16 sin cuantizar en GGUF; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (FP16); el repo incluye safetensors segun los metadatos de parametros |
| Capas | 8 |
| Cabezas de atencion | 8 |
| Dimension oculta (d_model) | 512 |
| Tokenizer | GPT-2 BPE (vocabulario 50.257, EOS ID 50.256) |
| Presupuesto de entrenamiento | 3.050.037.248 posiciones de token (~59,71 tokens/parametro) |
| Perdida de validacion final (preentrenamiento) | 3,6472 (perplejidad ~38,37) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

Tiny-GPT es un transformer decoder-only clasico con 8 capas, 8 cabezas de atencion y una dimension oculta de 512, sobre un tokenizer GPT-2 BPE de 50.257 entradas. No emplea mecanismos MoE, SSM ni atencion lineal: es una implementacion directa del bloque GPT-2 con atencion causal completa, limitada a una ventana de 256 tokens. El preentrenamiento se realizo desde cero sobre aproximadamente 3,05 mil millones de posiciones de token extraidas de FineWeb y FineWeb-Edu, en cuatro etapas, con entrenamiento multi-GPU y acumulacion de gradientes. La perdida de validacion final de preentrenamiento fue de 3,6472 (perplejidad aproximada de 38,37).

Sobre esa base se aplico un SFT con enmascaramiento de respuesta (response-only masking), de modo que solo se calcula la perdida sobre los turnos del asistente. Se compararon dos mezclas: Mix A (70% dialogo / 30% QA, ~1,20M tokens supervisados activos), que alcanzo una perdida de validacion de chat de 2,6181 (perplejidad 13,71), y Mix B (30% dialogo / 70% QA, ~0,59M tokens supervisados activos), con perdida de validacion de QA de 3,1494 (perplejidad 23,32). El proyecto documenta ademas cache de validacion determinista y benchmarking aislado multi-configuracion. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto causal en ingles con plantilla de prompt `User: ... / Assistant: ...`.
- Conversacion multi-turno basica: Mix A muestra turnos conversacionales naturales, reconocimientos empaticos y hedging cortes.
- Respuesta directa a preguntas: Mix B esta orientada a QA directo.
- Finalizacion de texto y continuacion de contexto dentro de la ventana de 256 tokens.
- Inferencia local en FP16 GGUF mediante LM Studio o llama.cpp.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Generacion de codigo: el autor indica explicitamente que falla en sintaxis Python.

## Casos de uso

- Docencia y formacion en LLM: sirve como ejemplo reproducible de pipeline completo (preentrenamiento, SFT, exportacion GGUF) para cursos y talleres, dado su tamano reducido y su documentacion detallada de etapas.
- Prototipado de chatbots conversacionales minimos: con Mix A se puede montar un asistente de juguete en LM Studio que mantiene turnos breves y responde con cortesia dentro de contextos de pocas frases.
- Pruebas de infraestructura de inferencia: al ocupar ~99,5 MiB en FP16, permite validar configuraciones de llama.cpp, plantillas de prompt y flujos de carga en entornos con recursos muy limitados.
- Experimentos de ablacion de datos de SFT: la comparacion Mix A frente a Mix B sirve de referencia para disenar estudios sobre mezclas de dialogo y QA en modelos pequenos.
- Generacion de texto corto y completado de plantillas: util para tareas de continuacion de texto en ingles con contexto inferior a 256 tokens, como descripciones breves o respuestas de formulario.
- Evaluacion de tecnicas de enmascaramiento de respuesta: el modelo documenta response-only SFT masking, lo que permite reproducir y comparar variantes de entrenamiento supervisado.
- Demostraciones educativas de limitaciones de escala: sirve para ilustrar de forma tangible por que 51M parametros no bastan para matematicas simbolicas, logica o codigo, comparandolo con modelos mayores en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de validacion y perplejidades:

| Metrica | Valor |
|---|---|
| Perdida de validacion final (preentrenamiento) | 3,6472 |
| Perplejidad de preentrenamiento | ~38,37 |
| Perdida de validacion de chat (Mix A) | 2,6181 |
| Perplejidad de chat (Mix A) | 13,71 |
| Perdida de validacion de QA (Mix B) | 3,1494 |
| Perplejidad de QA (Mix B) | 23,32 |
| Tokens de entrenamiento procesados | 3.050.037.248 |
| Tokens por parametro | ~59,71 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 100 MiB en FP16 GGUF (~99,5 MiB de pesos), con overhead adicional minimo para el contexto de 256 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el modelo cabe incluso en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, e incluso en iGPU y en CPU.
- Opciones de despliegue: LM Studio y llama.cpp son los soportados de forma explicita; al ser un GGUF estandar, tambien deberia poder cargarse en otros runners compatibles con GGUF, aunque no se documenta.
- Latencia y throughput: no disponible. Por el tamano (51M parametros, contexto de 256 tokens) se espera una latencia muy baja en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. A continuacion se comparan caracteristicas estructurales con modelos pequenos de la misma categoria (causal LM de menos de 150M parametros):

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| Tiny-GPT (FakeSiddharth) | 51,08M | 256 | Apache 2.0 | en | GGUF FP16 / safetensors |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | en | safetensors, GGUF (comunitario) |
| DistilGPT-2 (Hugging Face) | 82M | 1.024 | Apache 2.0 | en | safetensors, GGUF (comunitario) |
| TinyLlama-1.1B (comunidad) | 1,1B | 2.048 | Apache 2.0 | en, multilingue parcial | safetensors, GGUF |

La comparacion de rendimiento cualitativo no esta disponible: no hay resultados de MMLU, HumanEval, GSM8K ni similares para Tiny-GPT. En terminos de contexto y capacidad, Tiny-GPT queda por debajo de GPT-2 small y DistilGPT-2 en ventana (256 frente a 1.024 tokens), aunque su naturaleza conversacional via SFT lo diferencia de los modelos base.

## Limitaciones y advertencias

- Capacidad muy limitada: el autor reconoce alucinacion de hechos, fallo en matematicas simbolicas y logica, y generacion incorrecta de sintaxis Python.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones largas, documentos o codigo.
- Solo entrenado y evaluado en ingles; no hay soporte multilingue documentado.
- Riesgo alto de alucinacion en cualquier tarea factual, dado su tamano y presupuesto de entrenamiento.
- No apto para produccion en tareas que requieran precision factual, razonamiento o codigo.
- No se documentan sesgos especificos, pero al entrenarse sobre FineWeb y FineWeb-Edu hereda los sesgos de esos corpus web.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas hacen inviable su uso comercial en la mayoria de escenarios.
- Depende de una plantilla de prompt concreta (`User: ... / Assistant: ...`); usarlo fuera de ese formato degrada la calidad de las respuestas.
- No dispone de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/FakeSiddharth/Tiny-GPT
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- LM Studio: https://lmstudio.ai/
- llama.cpp: https://github.com/ggerganov/llama.cpp
