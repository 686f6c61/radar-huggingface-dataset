# 0kkinexi/O1-Pro

## Resumen

O1 Pro es un modelo de lenguaje en turco de 151 millones de parámetros (182.492.928 contando embeddings, segun los pesos en safetensors) desarrollado por 0kkiLab. Se construye mediante fine-tuning sobre el modelo base ufakai/ufakzeka-1-instruct, un modelo de 151M entrenado desde cero con arquitectura Qwen3 y 13.500 millones de tokens. El objetivo es ofrecer un asistente conversacional en turco con identidad propia ("O1 Serisi") y capacidad de seguir instrucciones, dentro de un tamano que permita inferencia en CPU.

El modelo es relevante en el nicho de los "small language models" para lenguas de bajos recursos: demuestra que con un pipeline de continued pre-training (CPT), supervised fine-tuning (SFT) e identity SFT sobre una base ya entrenada se puede obtener un asistente funcional sin grandes recursos de computo. Su ventana de contexto es de 4096 tokens y su licencia Apache-2.0 permite uso comercial con atribucion.

No obstante, sus resultados en benchmarks son modestos (21,89 % en TurkishMMLU, 16,33 % en oBench 1.1), coherentes con su tamano reducido. Es un modelo orientado a experimentacion, prototipado y despliegue ligero, no a tareas de razonamiento complejo o conocimiento factual extenso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QWen3ForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 182.492.928 (incluye embeddings; 151M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 para causal language modeling: 24 capas, dimension de modelo 768, 12 cabezas de atencion con 4 cabezas KV (GQA, grouped-query attention), MLP SwiGLU con dimension intermedia 2048, RoPE con theta 100k, tokenizador byte-level BPE compatible con Qwen2/3 de 40.960 tokens de vocabulario (1,77 tokens por palabra), embeddings atados (tied embeddings) y contexto de 4096 tokens.

El entrenamiento se estructura en tres fases. Primero, un continued pre-training (CPT) de 1200 pasos con learning rate 2e-5 sobre un corpus JSONL turco derivado de TR-part1, alcanzando una perdida de entrenamiento de ~2,16. Despues, un SFT de 2000 pasos con learning rate 1,5e-5 sobre 69.271 pares instruccion-respuesta en turco (~11,4M tokens), con perdida ~2,10. Finalmente, un identity SFT de 400 pasos con learning rate 3e-6 sobre 872 ejemplos de identidad que definen la personalidad "O1 Serisi", con perdida ~0,29. Se aplico descontaminacion por solapamiento de 8-gramas contra TurkishMMLU y oBench 1.1, eliminando 320 ejemplos y detectando 33.617 duplicados.

## Capacidades

- Generacion de texto en turco con formato de chat basado en tokens especiales `<|im_start|>` y `<|im_end|>`.
- Seguimiento de instrucciones (instruction following) y conversacion multi-turno.
- Identidad conversacional definida ("O1 Serisi"), entrenada especificamente para mantener un personaje coherente.
- Plantilla de chat incluida (`chat_template`), compatible con `apply_chat_template`.
- Tendencia a responder "no lo se" ante preguntas inciertas, segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al turco; no se declaran otros idiomas.

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el modelo incluye plantilla de chat y una identidad predefinida, lo que permite levantar un chatbot basico con pocas lineas de codigo y sin infraestructura GPU.
- Despliegue en entornos con CPU o hardware modesto: con 182M parametros y un repo de 0,4 GB, cabe en memoria de sistemas sin GPU dedicada, ideal para demos y entornos de desarrollo.
- Experimentacion academica con small language models: sirve como caso de estudio de pipelines CPT + SFT + identity SFT sobre una base Qwen3 de 151M, replicable con recursos limitados.
- Generacion de respuestas cortas y tareas de formato controlado: su contexto de 4096 tokens y su entrenamiento en instrucciones permiten usarlo para clasificacion ligera, resumenes breves o generacion de plantillas en turco.
- Educacion e investigacion sobre lenguas de bajos recursos: util para estudiar el comportamiento de modelos pequenos en turco y comparar tecnicas de fine-tuning.
- Filtrado o preprocesado de texto turco en pipelines: por su bajo coste de inferencia, puede emplearse en tareas auxiliares donde no se requiera alta precision factual.
- Base para fine-tuning posterior: al ser Apache-2.0 y derivar de una base abierta, puede adaptarse a dominios especificos con datasets pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en la misma maquina y en CPU:

| Suite | Metodo | Puntuacion |
|---|---|---|
| TurkishMMLU (297 preguntas) | generacion + regex | 21,89 % |
| TurkishMMLU (297 preguntas) | LL argmax | 21,89 % |
| oBench 1.1 (300 preguntas) | generacion + regex | 16,33 % (IC95 % [12,6-20,9]) |
| oBench 1.1 (300 preguntas) | LL argmax | 17,0 % |
| O1 Ping (12 preguntas: chat/identidad/honestidad) | no disponible | 100 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (182M parametros); aproximadamente 0,4 GB en cuantizacion de 8 bits y menos en 4 bits.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; tarjetas como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes y quedan sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requeririan conversion a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles; el autor indica evaluacion en CPU sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| O1 Pro (0kkinexi) | 182M (151M sin embeddings) | 4096 | Apache-2.0 | turco | Fine-tune de ufakzeka-1-instruct con CPT + SFT + identity SFT |
| ufakai/ufakzeka-1-instruct | 151M | no disponible | Apache-2.0 | turco | Modelo base, arquitectura Qwen3, 13,5B tokens de entrenamiento |
| Otros modelos pequenos para turco | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Capacidad limitada por tamano: con 151M parametros el conocimiento factual es escaso; el propio autor advierte que la "informacion" es limitada y recomienda verificar todos los datos.
- Riesgo de alucinacion: aunque el modelo tiende a decir "no lo se" cuando no esta seguro, puede generar respuestas incorrectas con apariencia de veracidad.
- Resultados bajos en benchmarks: 21,89 % en TurkishMMLU y 16,33 % en oBench 1.1 indican un rendimiento muy por debajo de modelos de mayor tamano; no es adecuado para tareas que exijan precision factual alta.
- Solo turco: no se declara soporte de otros idiomas, por lo que su uso en castellano u otras lenguas no esta respaldado.
- Contexto corto: 4096 tokens limitan conversaciones largas y documentos extensos.
- Licencia Apache-2.0: permite uso comercial, pero exige atribucion al modelo base ufakai/ufakzeka-1-instruct y al trabajo arXiv:2609.25081.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse sobre corpus turcos, puede heredar sesgos de dichos datos.
- Madurez: modelo con 0 descargas y 1 like en el momento de la consulta; sin validacion externa ni comunidad consolidada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0kkinexi/O1-Pro
- Modelo base: https://huggingface.co/ufakai/ufakzeka-1-instruct
- Paper del modelo base: arXiv:2609.25081 (Sait Furkan Teke, "ufakzeka-1: Building and Evaluating a 151M-Parameter Turkish Language Model from Scratch", 2026)
- Licencia: https://huggingface.co/0kkinexi/O1-Pro/blob/main/LICENSE
