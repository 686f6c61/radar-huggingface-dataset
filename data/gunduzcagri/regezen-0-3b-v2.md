# gunduzcagri/ReGeZen-0.3B-v2

## Resumen

ReGeZen-0.3B-v2 es un modelo de lenguaje causal compacto de 304.137.216 parametros (aproximadamente 0,3B) desarrollado por el usuario independiente gunduzcagri. Se presenta como un modelo entrenado completamente desde cero, incluyendo el tokenizer, sobre una unica GPU RTX 4060 Ti de 16 GB. Esta especializado en turco, codigo Python, matematicas y razonamiento estrategico, y es compatible con la arquitectura `LlamaForCausalLM` de la libreria transformers.

El modelo emplea una arquitectura transformer densa con 24 bloques, `hidden_size` de 1024, `intermediate_size` de 2816 con activacion SwiGLU, Grouped-Query Attention con 16 cabezas de consulta y 4 de clave-valor, RMSNorm, RoPE con theta 10000 y embeddings de palabras atados. Su ventana de contexto de entrenamiento es de 1024 tokens, con un techo arquitectonico de 2048 tokens. El tokenizer es un ByteLevel BPE de 32.768 tokens entrenado desde cero, con soporte para plantillas ChatML y etiquetas de razonamiento `<think>`.

Su relevancia radica en ser un ejemplo de pipeline completo de entrenamiento desde cero a pequena escala: preentrenamiento sobre 2.620 millones de tokens, ajuste supervisado (SFT) y dos rondas de GRPO con verificacion de recompensa (RLVR), todo documentado con metricas concretas de perdida de validacion y evaluacion funcional. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (LlamaForCausalLM), 24 bloques, SwiGLU, GQA (16 Q / 4 KV), RMSNorm, RoPE (theta 10000), embeddings atados |
| Parametros totales | 304.137.216 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens de entrenamiento; techo arquitectonico 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso estilo Llama con 24 capas, dimension oculta de 1024 y dimension intermedia de 2816 con activacion SwiGLU. Usa Grouped-Query Attention con 16 cabezas de consulta y 4 de clave-valor, normalizacion RMSNorm, embeddings posicionales rotatorios RoPE con theta 10000 y `max_position_embeddings` de 2048, y embeddings de palabras atados a la cabeza de salida. El tokenizer es un ByteLevel BPE de 32.768 tokens entrenado desde cero, con plantilla ChatML que incluye los tokens especiales `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>`. La eficiencia del tokenizer en turco se documenta en aproximadamente 4,48 caracteres por token.

El preentrenamiento se realizo durante 20.000 pasos sobre 2.620 millones de tokens (2.780 millones de entrenamiento y 28 millones de validacion) con `seq_len` de 1024, sobre un corpus limpio de turco, codigo Python, matematicas y estrategia. La perdida de validacion descendio de 10,59 a 1,8065 (perplejidad de 32.768 a 6,09). El post-entrenamiento combino una fase de SFT y dos rondas de GRPO con verificacion de recompensa: primero 2 epocas de SFT sobre 119.871 ejemplos mas 240 pasos de GRPO v1 con 36 tareas; despues una actualizacion de SFT con 5.000 ejemplos verificados de matematicas y Python mas 150 pasos de GRPO v2. El pipeline incluyo una etapa de destilacion local con el modelo `gemma-4-12b-it-qat` en LM Studio para generar documentos de estrategia traducidos al turco, 776 ejemplos de razonamiento `<think>` y 6.000 candidatos de SFT filtrados (3.424 aprobados). En un examen objetivo de 10 preguntas de matematicas y Python, la puntuacion paso de 4/10 a 8/10 (matematicas 4/5, codigo 4/5).

## Capacidades

- Generacion de texto causal en turco e ingles.
- Razonamiento paso a paso mediante modo thinking con etiquetas `<think>` y `</think>`.
- Generacion de codigo Python, incluyendo funciones y logica algorítmica basica.
- Resolucion de problemas matematicos de nivel basico-intermedio.
- Razonamiento estrategico y documental (el autor menciona corpus de estrategia).
- Conversacion multi-turno mediante plantilla ChatML con roles de sistema, usuario y asistente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso complejo: no disponible como capacidad documentada.
- Capacidades de vision, audio o multimodalidad: no disponibles.

## Casos de uso

- Asistente de codigo Python en local: el modelo puede generar funciones y fragmentos de codigo en un portatil con GPU de gama media, gracias a sus 304M de parametros y pesos en safetensors de aproximadamente 0,6 GB, lo que permite ejecucion en bfloat16 en GPUs consumer.
- Tutor de matematicas basicas en turco: con su modo `<think>` y su ajuste con GRPO sobre tareas verificadas de matematicas, puede resolver y explicar problemas aritmeticos paso a paso en turco.
- Prototipado de pipelines de razonamiento con RLVR: sirve como banco de pruebas de bajo coste para experimentar con SFT y GRPO sin necesidad de infraestructura grande, ya que el autor documenta todo el proceso y las metricas.
- Generacion de contenido breve en turco: redaccion de respuestas, resumenes y textos cortos en turco con contexto de hasta 1024 tokens, adecuado para tareas de un solo turno o conversaciones cortas.
- Educacion y demostraciones de entrenamiento desde cero: util para cursos y talleres que expliquen el ciclo completo de tokenizer, preentrenamiento, SFT y RL en una sola GPU.
- Filtrado y clasificacion ligera de texto: por su tamano reducido, puede desplegarse en entornos con recursos limitados para tareas de generacion condicionada o etiquetado simple en turco.
- Chatbot de soporte acotado en turco: con prompts de sistema claros y contexto limitado, puede gestionar consultas de dominio restringido (por ejemplo, dudas sobre Python o estrategia basica) siempre que se controle la longitud de la conversacion.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. Los unicos datos de evaluacion disponibles son internos:

| Evaluacion | Resultado |
|---|---|
| Perdida de validacion (preentrenamiento) | 10,59 a 1,8065 |
| Perplejidad de validacion | 32.768 a 6,09 |
| Examen objetivo de 10 preguntas (matematicas y Python), antes de GRPO | 4/10 |
| Examen objetivo de 10 preguntas (matematicas y Python), tras GRPO v2 | 8/10 (matematicas 4/5, codigo 4/5) |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,6 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe en GPUs con 2-4 GB de VRAM.
- En cuantizacion de 8 bits o 4 bits el consumo de pesos baja a aproximadamente 0,3 GB y 0,15 GB respectivamente, aunque el autor no documenta formatos de cuantizacion especificos.
- GPU recomendadas: cualquier GPU consumer moderna, como RTX 3060, RTX 4060 Ti, RTX 4090; el propio autor entreno el modelo en una RTX 4060 Ti de 16 GB.
- Cabe en GPU consumer y en iGPU con suficiente memoria compartida; tambien es viable en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles (`endpoints_compatible`). El uso con llama.cpp, Ollama o vLLM no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ReGeZen-0.3B-v2 | 304.137.216 | 1024 (techo 2048) | tr, en | Apache 2.0 | Entrenado desde cero, especializado en turco, Python y matematicas con SFT + GRPO |
| Qwen2.5-0.5B | no disponible en la informacion | no disponible en la informacion | multilingue | Apache 2.0 | Alternativa generalista de tamano similar; datos no verificados en esta ficha |
| SmolLM2-360M | no disponible en la informacion | no disponible en la informacion | ingles principalmente | Apache 2.0 | Alternativa de escala similar orientada a ingles; datos no verificados en esta ficha |
| TinyLlama-1.1B | no disponible en la informacion | no disponible en la informacion | ingles | Apache 2.0 | Mayor numero de parametros; datos no verificados en esta ficha |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Escala de 0,3B: el propio autor advierte que puede cometer errores en aritmetica compleja de multiples pasos y en preguntas factuales de cultura general.
- Ventana de contexto efectiva de 1024 tokens; el techo arquitectonico de 2048 no implica que el modelo haya sido entrenado para aprovecharlo.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus propio y destilado de otro modelo, puede heredar sesgos de esos datos.
- Riesgo de alucinacion: alto en tareas factuales y de conocimiento general, dado el tamano y la especializacion del corpus.
- Cobertura limitada de idiomas: solo turco e ingles; el rendimiento en castellano no esta evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Para produccion: no hay benchmarks estandar publicados, no se documentan formatos de cuantizacion ni integracion con servidores de inferencia de alto rendimiento; se recomienda validacion propia antes de desplegar.
- El modelo se presenta como modelo de investigacion y educacion, no como producto listo para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/gunduzcagri/ReGeZen-0.3B-v2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
