# explorerkiil/Llama-WolfGPT-110M

## Resumen

Llama-WolfGPT-110M es un modelo de lenguaje conversacional de 110.119.680 parámetros entrenado completamente desde cero (inicialización aleatoria, sin pesos preentrenados) por el desarrollador independiente Explorer en una única GPU RTX 5060 Ti de 16 GB. Se trata de un proyecto didáctico cuyo objetivo es documentar cada etapa del entrenamiento de un modelo tipo GPT y demostrar capacidad de conversación, no de servir como asistente fiable. El modelo se identifica a sí mismo como "WolfGPT" en las conversaciones.

Arquitectura decoder-only transformer de 12 capas, 12 cabezas de atención, anchura 768 y contexto de 1.024 tokens, con vocabulario BPE propio de 32.768 tokens, embeddings atados, RoPE, RMSNorm y SwiGLU. El preentrenamiento se realizó sobre aproximadamente 3.000 millones de tokens de una muestra de FineWeb-Edu (18 horas en bf16 con optimizador Muon + AdamW, pérdida de validación 3,129), seguido de un ajuste supervisado (SFT) sobre 446.353 conversaciones y una etapa de identidad con 300 diálogos escritos a mano.

El prefijo "Llama-" del nombre no indica que el modelo derive de Llama: responde a la obligación de la Llama 3.1 Community License de anteponer "Llama" al nombre de cualquier modelo distribuido que se haya entrenado con salidas generadas por un modelo Llama. En este caso, aproximadamente el 57% de las conversaciones de SFT (270.838 de 477.612 antes de deduplicar) provienen del subconjunto smol-magpie-ultra, generado con Llama 3.1 405B-Instruct. Es relevante como referencia educativa de un pipeline completo de entrenamiento desde cero en hardware de consumo, no por su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (12 capas, 12 cabezas, anchura 768, RoPE, RMSNorm, SwiGLU, embeddings atados) |
| Parametros totales | 110.119.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License (license_name: llama3.1) |
| Formato de pesos | safetensors (model.safetensors, float32); tokenizer.json; requiere model.py y chat.py del repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con 12 cabezas de atención, dimensión de modelo 768, vocabulario de 32.768 tokens (tokenizador BPE entrenado específicamente para el proyecto) y embeddings atados. Incorpora las técnicas habituales en modelos modernos: RoPE para codificación posicional, RMSNorm para normalización y SwiGLU como activación en el bloque feed-forward. No es una arquitectura `transformers` de Hugging Face: la inferencia requiere el código `model.py` y `chat.py` incluidos en el repositorio.

El preentrenamiento consumió aproximadamente 3.000 millones de tokens de una muestra de FineWeb-Edu, con optimizador Muon + AdamW en bf16 durante unas 18 horas en una RTX 5060 Ti de 16 GB, alcanzando una pérdida de validación de 3,129. El ajuste supervisado (SFT) utilizó 446.353 conversaciones (267,5 millones de tokens) de smol-smoltalk, everyday-conversations y Databricks Dolly 15k, durante 2 épocas y calculando la pérdida solo sobre los tokens de respuesta; la pérdida de validación pasó de 2,395 a 1,484. Una etapa final de identidad mezcló 300 conversaciones escritas a mano (nombre, creador, límites) con 10.000 chats ordinarios para fijar la autoidentificación como "WolfGPT, construido por Explorer". El formato de chat de entrenamiento es `### User:\n{message}\n\n### Assistant:\n{answer}<|endoftext|>`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de chat específico (`### User:` / `### Assistant:`).
- Autoidentificación consistente como "WolfGPT", construido por Explorer, gracias a la etapa de identidad.
- Razonamiento básico de sentido común limitado: supera el azar en HellaSwag, ARC-Easy y PIQA, pero está en el nivel de azar en ARC-Challenge y Winogrande.
- Comprensión lectora y completado de frases a nivel elemental (ARC-Easy ~40%, PIQA ~58%).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no; únicamente inglés.
- Mecanismo de protección contra repeticiones en `chat.py` (regenera respuestas que repiten mayoritariamente una anterior, `--retries` por defecto 3) y corte de respuestas ante un `###` espurio.

## Casos de uso

- Demostración educativa de entrenamiento desde cero: sirve para ilustrar un pipeline completo (tokenizador BPE, preentrenamiento, SFT, etapa de identidad) en una sola GPU de consumo, con pérdidas de validación documentadas en cada fase.
- Experimentación académica con arquitecturas transformer pequeñas: permite estudiar el efecto del SFT sobre benchmarks de conocimiento (caída de ~8 puntos en ARC-Easy y ~3 en PIQA) con un modelo de 110M parámetros y contexto de 1.024 tokens.
- Chat de terminal para pruebas de formato conversacional: `chat.py` ofrece un entorno mínimo para validar el formato `### User:` / `### Assistant:` y el comportamiento de repetición en modelos pequeños.
- Reproducción de técnicas de alineación ligera: la etapa de identidad con 300 conversaciones mezcladas con 10.000 chats ordinarios es un caso práctico de cómo fijar la autoidentificación sin degradar en exceso el resto del comportamiento.
- Estudio de licencias de modelos derivados: el caso ilustra la obligación de la Llama 3.1 Community License de prefijar "Llama" cuando el SFT usa salidas de Llama 3.1 405B-Instruct, útil como referencia legal-técnica.
- Base para experimentos de destilación o ajuste con datasets pequeños: al ser un modelo de 0,4 GB en float32 y con código propio, es viable iterar rápidamente en hardware modesto (por ejemplo, una RTX 5060 Ti de 16 GB) sin depender de infraestructura de datacenter.

## Benchmarks y rendimiento

Evaluación zero-shot sobre conjuntos completos de test/validación, con prompts en texto plano sin plantilla de chat, puntuando por verosimilitud de la respuesta (script propio, no lm-evaluation-harness). Se muestra acc_norm salvo Winogrande (acc).

| Tarea (preguntas) | Azar | Modelo base (tras preentrenamiento) | Tras SFT | Llama-WolfGPT-110M (SFT + identidad) |
|---|---|---|---|---|
| HellaSwag (10.042) | 25 | 32,3 (±0,5) | 30,9 | 31,1 |
| ARC-Easy (2.376) | 25 | 48,2 (±1,0) | 40,5 | 40,3 |
| ARC-Challenge (1.172) | 25 | 26,0 (±1,3) | 24,9 | 24,6 |
| PIQA (1.838) | 50 | 62,2 (±1,1) | 59,2 | 58,4 |
| Winogrande (1.267) | 50 | 51,7 (±1,4) | 49,6 | 51,1 |

Lectura de los datos: el modelo supera claramente el azar en HellaSwag, ARC-Easy y PIQA, y está en el nivel de azar en ARC-Challenge y Winogrande, tareas que requieren más razonamiento del que permite un modelo de 110M parámetros. El SFT redujo ARC-Easy en unos 8 puntos y PIQA en unos 3, en parte porque las pruebas usan texto plano en lugar del formato de chat. Los números de código de evaluación distinto solo son comparables de forma aproximada.

## Requisitos de hardware

- Pesos en float32: ~0,44 GB (110.119.680 parámetros × 4 bytes), más overhead de activaciones y tokenizador; el repositorio completo ocupa 0,4 GB.
- VRAM estimada para inferencia: por debajo de 2 GB en float32 para contexto de 1.024 tokens; no se documentan requisitos oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; el autor lo entrenó en una RTX 5060 Ti de 16 GB. También cabe en CPU para pruebas de chat.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 5060 Ti, etc.).
- Opciones de despliegue: no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI de forma nativa; requiere ejecutar `chat.py` con `torch`, `tokenizers` y `safetensors` instalados (`pip install torch tokenizers safetensors`).
- Latencia y throughput: no disponibles; al ser un modelo de 110M parámetros en una sola GPU, la generación es de baja latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Rendimiento publicado |
|---|---|---|---|---|---|
| Llama-WolfGPT-110M | 110.119.680 | 1.024 | Llama 3.1 Community License | safetensors float32, código propio | HellaSwag 31,1; ARC-Easy 40,3; PIQA 58,4 |
| GPT-2 small (referencia de tamaño similar) | 124M | 1.024 | MIT | safetensors, transformers | no disponible en la información proporcionada |
| SmolLM-135M (referencia de tamaño similar) | 135M | 2.048 | Apache-2.0 | safetensors, transformers, GGUF | no disponible en la información proporcionada |
| TinyLlama-1.1B (referencia de escala superior) | 1,1B | 2.048 | Apache-2.0 | safetensors, transformers, GGUF | no disponible en la información proporcionada |

No se han publicado comparativas directas con estos modelos en la información disponible; la tabla solo recoge datos de tamaño, contexto y licencia cuando se conocen, y los benchmarks de los modelos alternativos no se incluyen por no estar disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño: los hechos son a menudo incorrectos, la aritmética no es fiable, puede ignorar instrucciones de longitud y repetirse.
- Alucinación en role-play: inventa historias y trasfondos cuando se le plantea una situación ficticia (por ejemplo, respondió con una historia inventada al decirle "soy tu padre").
- Solo inglés; no se ha probado para seguridad y no debe usarse para nada importante, según el propio autor.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Repetición frecuente en modelos pequeños; `chat.py` mitiga parcialmente el problema regenerando respuestas repetidas, pero no lo elimina.
- Restricciones de licencia: Llama 3.1 Community License exige incluir una copia de la licencia, cumplir la Acceptable Use Policy y mantener el prefijo "Llama" en el nombre; el uso comercial está sujeto a los términos de dicha licencia.
- Procedencia de datos no verificada individualmente: algunos subconjuntos de SFT (por ejemplo, everyday-conversations) podrían ser también generados por Llama, y otros subconjuntos reutilizados de OpenHermes 2.5 no se comprobaron uno a uno.
- No es una arquitectura `transformers`: no funciona con las herramientas estándar del ecosistema sin adaptar `model.py`/`chat.py`.
- Sin garantías de calidad: proyecto de aprendizaje, no un asistente fiable para producción.

## Enlaces

- Hugging Face: https://huggingface.co/explorerkiil/Llama-WolfGPT-110M
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Dataset FineWeb-Edu (referencia de preentrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk (referencia de SFT): https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset Databricks Dolly 15k (referencia de SFT): https://huggingface.co/datasets/databricks/databricks-dolly-15k
