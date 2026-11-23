# asemqaffaf/AsemLLM-erlang-archive

## Resumen

AsemLLM-erlang-archive es un repositorio de pesos entrenados de dos modelos de lenguaje a nivel de palabra (word-level) implementados, entrenados y servidos íntegramente en Erlang, sin framework de deep learning de por medio. Lo desarrolla el autor independiente asemqaffaf y se publica como archivo histórico: el proyecto original en Erlang quedó archivado y obsoleto el 23 de noviembre de 2026, sustituido por una línea posterior escrita en Common Lisp (asemqaffaf/AsemLLM) con modelos de hasta 97,6 M de parámetros.

El repositorio contiene dos variantes: un MLP de 152.903 parámetros con ventana de 5 tokens (embedding, capa oculta con tanh y softmax, estilo Bengio) y un transformer decoder de 279.007 parámetros con ventana de 32 tokens. Ambos comparten un tokenizador de 1.631 tokens construido a nivel de palabra (palabras con espacio inicial, puntuación y saltos de línea), con `<unk>` en el id 0.

La relevancia es puramente educativa e histórica: demuestra que se puede escribir un entrenador y un servidor de inferencia de un LM desde cero en Erlang, con procesos worker supervisados calculando gradientes en paralelo. El propio autor advierte que son modelos de juguete que imitan el estilo de su corpus de diálogo breve y no comprenden preguntas. No cargan en transformers, llama.cpp, Ollama ni LM Studio por usar arquitecturas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes: MLP (embedding -> tanh -> softmax, estilo Bengio) y transformer decoder GPT-style con atención |
| Parametros totales | MLP: 152.903; transformer: 279.007 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | MLP: 5 tokens; transformer: 32 tokens |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |
| Vocabulario | 1.631 tokens a nivel de palabra (`<unk>` = id 0) |
| Entrenamiento | Desde cero, en Erlang, sin framework de deep learning |
| Estado | Archivado y obsoleto (2026-11-23) |

## Arquitectura y entrenamiento

La variante MLP sigue el esquema clásico de Bengio: embedding de entrada, una capa oculta con activación tanh y una capa de salida softmax sobre un vocabulario de 1.631 tokens, con una ventana de contexto de solo 5 tokens. La variante transformer es un decoder GPT-style con atención, también a nivel de palabra, con ventana de 32 tokens. Ambas se entrenaron con un entrenador escrito en Erlang que reparte el cálculo de gradientes entre procesos worker supervisados en paralelo, sin usar ninguna librería de deep learning.

El corpus de entrenamiento es un conjunto de diálogos breves con formato `User:` / `Assistant:`, según describe la model card. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles. La implementación de referencia en Python (`asemllm.py`, basada en numpy) reproduce los logits del código Erlang con una discrepancia de aproximadamente 1e-7. El repositorio incluye además sesiones de chat con KV-cache (un proceso supervisado por conversación) y un servidor con API JSON y UI web, todo en Erlang.

## Capacidades

- Generación de texto a nivel de palabra en inglés, limitada a la ventana de contexto (5 tokens en el MLP, 32 en el transformer).
- Imitación de estilo: reproduce el formato de diálogo `User:` / `Assistant:` del corpus de entrenamiento.
- Chat multi-turno mediante sesiones con KV-cache en el servidor Erlang.
- Inferencia stateless y con estado con logits idénticos, según la model card.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene modo thinking, visión ni audio.
- Multilingüe: no; solo inglés.
- No comprende preguntas: las respuestas suelen ser irrelevantes respecto a la pregunta formulada.

## Casos de uso

- Estudio de arquitecturas de LM desde cero: sirve para examinar en código Erlang legible cómo se implementan embedding, atención, softmax y retropropagación sin dependencias de frameworks, con solo 152.903 y 279.007 parámetros.
- Docencia de sistemas concurrentes: el entrenador reparte gradientes entre procesos worker supervisados, lo que lo convierte en un ejemplo práctico de paralelismo en Erlang aplicado a cálculo numérico.
- Referencia de portabilidad entre lenguajes: la implementación numpy replica los logits de Erlang a ~1e-7, útil para validar ports (existe un port a Common Lisp y un backend nativo en C en el repositorio GitHub).
- Pruebas de infraestructura de servido: el servidor Erlang con API JSON, UI web y sesiones KV-cache por proceso permite experimentar con patrones de concurrencia en serving sin carga de GPU.
- Reproducción histórica: conserva los pesos y el vocabulario originales de la línea Erlang para comparar con los modelos posteriores en Common Lisp (1,16 M, 2,90 M y 10,52 M de parámetros).
- Demostración de límites de escala: útil para ilustrar por qué un modelo de 279.007 parámetros y ventana de 32 tokens no puede responder preguntas con corrección, como base de ejercicios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para estos dos modelos (MLP de 152.903 y transformer de 279.007 parámetros). La model card sí reporta métricas de experimentos posteriores en Common Lisp, que no corresponden a estos pesos:

| Modelo (línea Common Lisp, no publicada aquí) | Parámetros | Perplejidad test | Precisión 4 opciones (90 preguntas) |
|---|---|---|---|
| Transformer | 1,16 M | 112,4 | 28,9 % |
| Transformer | 2,90 M | 87,8 | 28,9 % |
| Transformer | 10,52 M | 80,8 | 25,6 % |

El azar en el conjunto de cuatro opciones es del 25 %. En la etapa 2, el mejor modelo ajustado (R7, 10,52 M) alcanzó 45,8 % (229/500) en desarrollo, frente al 62,0 % de una regla simple de solapamiento de palabras.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB para cualquiera de las dos variantes en float32 (152.903 y 279.007 parámetros), por lo que cabe en cualquier GPU consumer, CPU o incluso en un entorno embebido.
- GPU recomendadas: ninguna en particular; no se requiere GPU. El entrenamiento original se ejecutó en Erlang sobre CPU.
- Cabe en consumer GPU: sí, en cualquier modelo (RTX 4090, RTX 3060, integradas), aunque no hay soporte de aceleración por GPU documentado.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama, TGI ni LM Studio. Solo se sirve con el código propio: `asemllm.py` (numpy) o el servidor Erlang del repositorio GitHub.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de escala del proyecto, la model card cita ~0,4 GFLOP/s en Erlang y ~14 GFLOP/s en Lisp sobre CPU sin GPU.
- Dependencias de inferencia: `numpy`, `safetensors` y `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AsemLLM MLP (Erlang) | 152.903 | 5 tokens | Apache 2.0 | Pesos en HF, código en GitHub | Toy model, word-level, no carga en transformers |
| AsemLLM transformer (Erlang) | 279.007 | 32 tokens | Apache 2.0 | Pesos en HF, código en GitHub | Toy model, word-level, no carga en transformers |
| AsemLLM (Common Lisp, actual) | Hasta 97,6 M | No disponible | No disponible | HF: asemqaffaf/AsemLLM | Línea activa del mismo autor; resultados negativos o parciales |
| Modelos tiny GPT-2 style (referencia genérica) | ~1 M–10 M | 1.024 tokens típicamente | Variable | Ecosistema transformers | Comparable en escala; estos sí cargan en herramientas estándar |

La comparación con modelos de producción de la misma categoría no resulta significativa: estos pesos no compiten en ninguna tarea de NLP, sino que documentan una implementación educativa.

## Limitaciones y advertencias

- Modelos de juguete: el autor indica explícitamente que no entienden preguntas y que las respuestas suelen ser irrelevantes respecto a lo preguntado.
- Alucinación: pueden afirmar cosas falsas con seguridad; no deben usarse para nada que requiera respuestas correctas.
- Contexto extremadamente corto: 5 tokens en el MLP y 32 en el transformer, insuficiente para cualquier tarea práctica.
- Solo inglés y a nivel de palabra, con vocabulario de 1.631 tokens; cualquier palabra fuera de vocabulario se mapea a `<unk>`.
- Incompatibilidad de ecosistema: no cargan en transformers, llama.cpp, Ollama ni LM Studio por usar arquitecturas personalizadas.
- Estado archivado y obsoleto desde el 23 de noviembre de 2026; no recibe mantenimiento.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones técnicas hacen inviable cualquier aplicación productiva.
- Sesgos: no documentados en la información disponible; el corpus de entrenamiento no se describe en detalle.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB según Hugging Face; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/asemqaffaf/AsemLLM-erlang-archive
- Modelo actual (Common Lisp): https://huggingface.co/asemqaffaf/AsemLLM
- Repositorio GitHub: https://github.com/asemqaffaf/AsemLLms
- Rama del código Erlang: rama `archive/erlang-tinyllm` del repositorio GitHub
- Historial: `HISTORY.md` en el repositorio GitHub
- Resultados etapa 1: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results-stage1.md
- Resultados etapa 2: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results-stage2.md
- Análisis R7: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results-stage2-r7.md
- Informe final etapa 2: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results/stage2/mission-20261111/FINAL_REPORT.md
