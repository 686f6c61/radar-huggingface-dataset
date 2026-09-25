# shalev396/tiny-shakespeare-chat

## Resumen

Tiny Shakespeare Chat es un modelo de generación de texto de 10.751.232 parámetros (10,75 M) desarrollado por el usuario shalev396, publicado bajo licencia MIT. Se trata de un transformer decoder-only de tipo nanoGPT escrito y entrenado desde cero en PyTorch: sin pesos preentrenados, sin librería de tokenización externa y con un tokenizador propio a nivel de carácter de 68 identificadores. Su particularidad es que, tras un preentrenamiento de predicción de siguiente carácter sobre el corpus Tiny Shakespeare (1.115.394 caracteres de obras teatrales), fue afinado para chat sobre 7.096 pares de líneas de diálogo consecutivas, de modo que responde a un mensaje con la "siguiente línea" de una obra imaginaria.

El modelo es relevante como pieza didáctica y de infraestructura más que como herramienta de producción: cabe en cualquier CPU, se despliega como Inference Endpoint o Space sin GPU y sirve para validar pipelines completos (tokenizador, carga de safetensors, handler de endpoint, streaming carácter a carácter) a coste prácticamente nulo. Su arquitectura es un decoder de 6 capas, 6 cabezas y dimensión 384, con embeddings ligados y una ventana de contexto de solo 256 caracteres.

No debe confundirse con un asistente conversacional real: no tiene conocimiento factual, no razona ni genera código, y sus respuestas son verso dramático de estilo isabelino, no información veraz. Su utilidad está acotada a experimentación, docencia y pruebas de infraestructura de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT: embeddings de token y de posición aprendidas, 6 bloques pre-LayerNorm con self-attention causal de 6 cabezas (`scaled_dot_product_attention`), MLP GELU con factor 4x, dropout 0,2, LayerNorm final y cabeza LM ligada a la embedding de token. Capas lineales sin sesgos, inicialización GPT-2 con proyecciones residuales escaladas |
| Parametros totales | 10.751.232 (10,75 M), contando una sola vez la matriz de embedding/cabeza LM ligada |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 caracteres; el prompt se recorta a los últimos 240 tokens, con hasta 3 turnos previos `(usuario, bot)` |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es texto en inglés de Shakespeare y el tokenizador es a nivel de carácter; no se declara soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`); se incluye además `model.py` (tokenizador, arquitectura, sampler, `load()` y `Predictor`) y `handler.py` + `requirements.txt` para Inference Endpoints |
| Tokenizador | `model.CharTokenizer`: los 65 caracteres del corpus más `<\|user\|>`, `<\|bot\|>` y `<\|end\|>` como identificadores reservados (68 en total). Los caracteres fuera del vocabulario se descartan |
| Muestreo por defecto | temperatura 0,8, top-k 40, parada en `<\|end\|>` o tras `max_new_tokens` (200 caracteres por defecto) |
| Datos de entrenamiento | Tiny Shakespeare (`karpathy/tiny_shakespeare`, `input.txt` de karpathy/char-rnn, 1.115.394 caracteres) |
| Fecha de entrenamiento | 2026-08-01 (según la model card) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only minimalista al estilo nanoGPT. Cada bloque aplica LayerNorm antes de la atención causal y antes del MLP (pre-LN), con 6 capas, 6 cabezas de atención, dimensión de modelo 384 y MLP GELU con expansión 4x. La matriz de embedding de tokens está ligada a la cabeza de lenguaje, lo que explica que los 10.751.232 parámetros se cuenten una sola vez. La atención usa `scaled_dot_product_attention` y el modelo emplea dropout de 0,2. El tokenizador es propio, a nivel de carácter, con 68 identificadores: los 65 caracteres presentes en el corpus más tres tokens reservados para estructurar el diálogo.

El entrenamiento consta de dos etapas. La etapa A (preentrenamiento) hace predicción del siguiente carácter sobre el texto crudo de las obras, con un split del 90 % inicial para entrenamiento y 10 % final para validación: 5.000 iteraciones con lotes de 64 secuencias de 256 caracteres, AdamW (betas 0,9/0,95, weight decay 0,1 solo sobre matrices), 100 iteraciones de warmup, LR coseno de 3e-4 a 3e-5, recorte de gradiente a 1,0 y autocast fp16 en CUDA. La etapa B (afinado de chat) parsea la obra en turnos consecutivos `(hablante, intervención)` y convierte cada par de turnos vecinos en `<|user|> {línea} <|end|> <|bot|> {línea siguiente} <|end|>`, más una variante cuya respuesta empieza por `SPEAKER:`. Las muestras se barajan (semilla 42) y el último 5 % del flujo resultante se reserva para validación; se ejecutan 2.000 iteraciones desde los pesos de la etapa A con el mismo optimizador, 50 iteraciones de warmup y LR coseno de 1e-4 a 1e-5. Según la model card, este checkpoint se convirtió a `model.GPT` a partir de una ejecución completa anterior de un proyecto heredado. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación; el único ajuste de comportamiento proviene del formato de diálogo del corpus.

## Capacidades

- Generación de texto a nivel de carácter en inglés, con salida en verso y registro dramático isabelino.
- Conversación multi-turno limitada: acepta hasta 3 turnos previos en el campo `history`, tanto como pares `[[usuario, bot], ...]` como en formato `[{"role": ..., "content": ...}, ...]`.
- Generación con streaming, devolviendo la respuesta carácter a carácter mediante el método `stream`.
- Decodificación reproducible: acepta una semilla (`seed`) además de temperatura, top-k y `max_new_tokens`.
- Integración con Hugging Face: carga vía `snapshot_download` y `model.load()`, despliegue mediante `handler.py` en Inference Endpoints y API `/predict` en el Space asociado.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, planificación ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad distinta al texto.
- No dispone de capacidades de código, matemáticas o conocimiento factual: el modelo no ha sido entrenado para ello.
- Sin capacidades multilingües declaradas: el vocabulario cubre 65 caracteres del corpus inglés y descarta cualquier carácter fuera de ese conjunto.

## Casos de uso

- Docencia y aprendizaje sobre transformers: el repositorio incluye `model.py` con la arquitectura completa, el tokenizador y el sampler, además de un notebook de entrenamiento en Colab, lo que permite recorrer de principio a fin el ciclo de preentrenamiento y afinado de chat en un modelo que se entrena en minutos sobre CPU o una GPU modesta.
- Prueba de humo (smoke test) de pipelines de despliegue: con 10,75 M de parámetros y unos 43 MB en fp32, el modelo sirve para validar extremo a extremo un Inference Endpoint (carga de safetensors, `handler.py`, esquema de entrada con `message`, `history` y `parameters`) en CI/CD sin consumir tiempo de GPU ni presupuesto relevante.
- Demo interactiva de temática teatral: el Space asociado permite ofrecer un chatbot que responde en verso isabelino a mensajes del usuario, útil como experiencia divulgativa o pieza de exposición en un museo, una actividad escolar o un portafolio.
- Generación de borradores de diálogo de estilo shakesperiano: guionistas o escritores pueden usarlo como generador de "siguiente réplica" a partir de una línea propia y hasta tres turnos de contexto, con temperatura ajustable y semilla fija para reproducir una salida concreta.
- Investigación sobre tokenización a nivel de carácter y ajuste conversacional con corpus pequeños: el modelo permite estudiar el efecto del formato de prompt (`<|user|> ... <|end|> <|bot|> ...`), del tamaño del vocabulario y del número de iteraciones sobre la pérdida de validación, sin la barrera computacional de un modelo grande.
- Medición de latencia en CPU y dispositivos embebidos: al ejecutarse en el entorno `cpu-basic` de Hugging Face Spaces y devolver la API la tupla `[respuesta, segundos, dispositivo]`, es un banco de pruebas realista para comparar hardware de gama baja antes de escalar a modelos mayores.
- Generación de pares diálogo-respuesta sintéticos para aumentar datos: puede producir variantes de respuesta sobre un mismo turno de entrada, útil para prototipar estrategias de data augmentation en corpus dramáticos o literarios.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el `model-index` de la model card, evaluados sobre el split de validación de Tiny Shakespeare. El campo `verified` es `false` en todos ellos, es decir, no están verificados por un tercero.

| Metrica | Dataset / split | Valor |
|---|---|---|
| chat_val_loss | Tiny Shakespeare (karpathy/tiny_shakespeare), val | 1,053981 |
| chat_val_bpc | Tiny Shakespeare, val | 1,520573 |
| chat_val_ppl | Tiny Shakespeare, val | 2,869051 |
| text_val_loss | Tiny Shakespeare, val | 1,295842 |
| text_val_bpc | Tiny Shakespeare, val | 1,869505 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son de pérdida y bits por carácter sobre el propio corpus de entrenamiento, no comparables con evaluaciones de modelos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 43 MB (41 MiB); en fp16/bf16, unos 21,5 MB; en int8, unos 10,8 MB; en int4, unos 5,4 MB. El consumo real lo dominan el runtime de PyTorch y las activaciones, que son mínimas por la ventana de 256 caracteres.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) lo ejecuta con un uso de memoria despreciable; también funciona en GPU de centro de datos (A100, H100), aunque no aportan ninguna ventaja práctica frente a CPU para este tamaño.
- Cabe holgadamente en cualquier GPU consumer, en CPU de portátil e incluso en dispositivos de gama baja. El Space oficial se ejecuta con el runtime `cpu-basic` de Hugging Face, lo que confirma que la inferencia en CPU es viable y suficiente.
- Opciones de despliegue: inferencia nativa en PyTorch mediante `model.load(path, device="cpu"|"cuda")` y el objeto `Predictor`; Inference Endpoints de Hugging Face (CPU o GPU) usando el `handler.py` incluido; Hugging Face Space con API `/predict` y EJEMPLOS de curl y `@gradio/client` en su README. No se declara soporte de llama.cpp, Ollama, vLLM, TGI ni formato GGUF.
- Latencia y throughput: no se han publicado cifras. La API del Space devuelve el tiempo de cómputo en segundos junto con la respuesta y el dispositivo utilizado, por lo que es posible medirlo directamente en el propio Space.

## Comparativa con modelos similares

Existen varios proyectos públicos que entrenan modelos pequeños sobre el mismo corpus, pero la información disponible sobre sus especificaciones es muy limitada. Se recogen a continuación los datos conocidos, marcando como "no disponible" lo que no consta.

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-shakespeare-chat (shalev396) | 10,75 M | 256 caracteres | Por carácter, vocabulario de 68 ids | MIT | Pesos safetensors, Space, notebook de Colab e Inference Endpoint |
| debtirthasaha/tiny GPT (blog "Tiny Shakespeare, tiny GPT") | 1,83 M | no disponible | no disponible | no disponible | Descripción en blog; pesos no confirmados |
| Khalil-SE/tiny_chatGPT_Shakespeare | no disponible | no disponible | Por carácter, basado en bigramas | no disponible | Repositorio en GitHub |
| 54nd339/ShakeGPT | no disponible | no disponible | no disponible | no disponible | Pesos en Hugging Face |
| Sociloc/tiny-shakespeare | no disponible | no disponible | minbpe (BPE) | no disponible | Repositorio en GitHub |

No se dispone de resultados de benchmarks comparables entre estos proyectos, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La diferencia principal documentada del modelo de shalev396 frente a los demás es que incorpora una etapa explícita de afinado conversacional sobre pares de líneas de diálogo, además del preentrenamiento de siguiente carácter.

## Limitaciones y advertencias

- Naturaleza del modelo: es un modelo de 10,75 M de parámetros entrenado sobre un único corpus literario. No contiene conocimiento factual, no razona, no calcula y no genera código. Sus respuestas son verso dramático, no información veraz.
- Alucinación por diseño: la model card indica explícitamente que las respuestas son "play-style verse, not facts". Cualquier uso que espere exactitud factual producirá resultados incorrectos.
- Contexto muy corto: 256 caracteres de ventana y recorte del prompt a los últimos 240 tokens, lo que limita la conversación a pocos turnos y a mensajes breves.
- Limitación de idioma y de vocabulario: el tokenizador solo cubre 65 caracteres del corpus inglés y descarta cualquier carácter fuera de ese conjunto, incluidas tildes, eñes y alfabetos no latinos. El modelo no maneja castellano.
- Sesgos: no hay documentada ninguna evaluación de sesgos ni de contenido dañino. El corpus son obras de teatro isabelinas, con la distribución de hablantes, roles y registros propia de ese material, que el modelo reproduce.
- Sin alineación: no se documenta RLHF, DPO ni filtros de seguridad. El modelo no rechaza peticiones inapropiadas ni sigue instrucciones fuera del formato de diálogo aprendido.
- Benchmarks no verificados: los cinco valores del `model-index` tienen `verified: false` y se calculan sobre el propio corpus de entrenamiento, por lo que no son indicativos de calidad en tareas generales.
- Licencia: MIT permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene revisar las condiciones del corpus Tiny Shakespeare por separado si se va a redistribuir el texto original.
- Repositorio: el tamaño declarado del repo es 0,0 GB, con 0 descargas y 0 "likes" en el momento de la consulta, y el modelo se publicó con una fecha de creación posterior a la de entrenamiento indicada en la model card, lo que refleja que es un artefacto experimental.
- Producción: no se declara soporte de cuantización, de GGUF ni de motores de inferencia de alto rendimiento, por lo que integrarlo en un stack de producción exigiría envolver el código PyTorch incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shalev396/tiny-shakespeare-chat
- Space (demo interactiva): https://huggingface.co/spaces/shalev396/tiny-shakespeare-chat
- Repositorio GitHub del proyecto: https://github.com/shalev396/ml-lab/tree/main/tiny-shakespeare-chat
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/tiny-shakespeare-chat/training/notebook.ipynb
- Dataset Tiny Shakespeare: https://huggingface.co/datasets/karpathy/tiny_shakespeare
- Corpus original de karpathy/char-rnn: https://github.com/karpathy/char-rnn/tree/master/data/tinyshakespeare
- Listado de modelos con el dataset tiny_shakespeare: https://huggingface.co/models?dataset=dataset:tiny_shakespeare
- Listado de modelos con la etiqueta tiny-shakespeare: https://huggingface.co/models?other=tiny-shakespeare
- Proyecto alternativo Sociloc/tiny-shakespeare: https://github.com/Sociloc/tiny-shakespeare
- Proyecto alternativo Khalil-SE/tiny_chatGPT_Shakespeare: https://github.com/Khalil-SE/tiny_chatGPT_Shakespeare
- Artículo "Tiny Shakespeare, tiny GPT": https://debtirthasaha.github.io/blog/2026/tiny-shakespeare-tiny-gpt/
