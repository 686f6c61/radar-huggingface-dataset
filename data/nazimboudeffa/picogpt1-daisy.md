# nazimboudeffa/PicoGPT1-Daisy

## Resumen

PicoGPT1-Daisy es un ajuste fino (fine-tuning) del modelo GPT-2 completo desarrollado por el usuario nazimboudeffa. Se trata de un modelo de 124 millones de parámetros (12 capas, 768 dimensiones, 12 cabezas de atención) entrenado sobre un conjunto de 2.442 ejemplos que combina 2.000 instrucciones/respuestas Alpaca filtradas, 245 ejemplos de anclaje y 197 pares pregunta/respuesta directos extraídos de una base cerrada de 30 hechos. El modelo sustituye a la versión anterior PicoGPT1-Jasmine, que partía de un GPT-2 truncado de 2 capas y 128 dimensiones.

La propuesta principal del autor no es tanto el modelo en sí como el pipeline de anclaje (RAG) que lo acompaña: scripts en Python que recuperan un hecho de un fichero `knowledge.jsonl` mediante TF-IDF, construyen un prompt con contexto y verifican que la respuesta generada esté soportada por el contexto recuperado. Si la verificación falla o la puntuación es inferior a 0,50, el sistema responde "Je ne sais pas." (No lo sé). Este mecanismo de abstención es la innovación diferencial frente a otros ajustes de GPT-2 de tipo Alpaca.

Es relevante ahora como ejemplo didáctico de cómo añadir control de alucinaciones a un modelo pequeño mediante recuperación y verificación externas, y como caso práctico de despliegue dual (Transformers y GGUF/llama.cpp). No obstante, conviene subrayar que se trata de un modelo experimental, entrenado en francés, sin licencia declarada y sin benchmarks publicados, por lo que su uso en producción es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 completo) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 posiciones en el modelo; ejemplos de entrenamiento truncados a 256 tokens |
| Tipos de cuantizacion | GGUF (variante publicada); cuantizaciones especificas no disponibles |
| Idiomas soportados | frances (entrenamiento y datos); otros idiomas no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un GPT-2 completo: 12 capas, 768 dimensiones de embedding, 12 cabezas de atención y 124 millones de parámetros, con tokenizer GPT-2 de 50.257 tokens. Se parte de los pesos preentrenados de GPT-2 y se aplica un fine-tuning de 5 épocas sobre 2.442 ejemplos con el formato `prompt\nreponse<|endoftext|>`. El conjunto de entrenamiento se compone de 2.000 instrucciones/respuestas Alpaca filtradas (se eliminaron errores factuales conocidos como "el agua hierve a 115 °C", una definición falsa de "mole" y la etiqueta `<nooutput>`, además de duplicados), 245 ejemplos de anclaje y 197 pares pregunta/respuesta directos derivados de una base cerrada de 30 hechos.

La innovación técnica no está en el entrenamiento sino en el pipeline de inferencia: decodificación por muestreo por defecto (`top_k=40`, `no_repeat_ngram_size=3`, `repetition_penalty=1.15`), parada en EOS o en el primer salto de línea, y separador `\n` garantizado. El anclaje se implementa en Python con TF-IDF (`char_wb` de 3-5 caracteres) sobre `text + question`, prompt `Contexte: <texte> | Question: <question>\n`, generación determinista con beam search (`num_beams=5`) y verificación `is_supported()`. Si la puntuación es inferior a 0,50 o la respuesta no se extrae del contexto, se devuelve "Je ne sais pas.". El GGUF no incluye ni la base de hechos ni el TF-IDF: el anclaje solo funciona con los scripts Python.

## Capacidades

- Generación de texto conversacional en francés con formato instrucción/respuesta.
- Respuesta a preguntas directas sobre una base cerrada de 30 hechos (con el pipeline de anclaje).
- Abstención controlada: responde "Je ne sais pas." cuando la pregunta queda fuera de la base o la respuesta no está soportada por el contexto.
- Recuperación TF-IDF de hechos desde `knowledge.jsonl` (solo en Python, no en GGUF).
- Generación con muestreo configurable (top_k, penalización de repetición, no_repeat_ngram_size).
- Generación determinista con beam search para el modo anclado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el entrenamiento es en francés.

## Casos de uso

- Demostración educativa de RAG con abstención: usar `rag.py` y `knowledge.jsonl` para mostrar cómo un modelo de 124 M puede responder solo cuando la respuesta está respaldada por el contexto recuperado, y abstenerse en caso contrario. Adecuado por su simplicidad y por el bajo coste computacional.
- Prototipado de asistentes de dominio cerrado: sustituir `knowledge.jsonl` por una base de 30-50 hechos de un dominio concreto (por ejemplo, preguntas frecuentes internas) y evaluar el comportamiento de abstención con `evaluate.py`.
- Evaluación de alucinaciones en modelos pequeños: el par `evaluate.py` + `test.py --rag` permite medir respuestas exactas, respuestas ancladas, abstenciones correctas y abstenciones erróneas sobre un conjunto controlado, como base para comparar variantes de prompt o recuperación.
- Despliegue local ligero con llama.cpp: el GGUF se puede ejecutar con `llama cli` o `llama serve` en CPU o GPU de gama baja, útil para demos offline o entornos sin acceso a APIs.
- Integración en pipelines de CI/CD como prueba de regresión: ejecutar `evaluate.py` tras cambios en el prompt o en la base de hechos para verificar que se mantienen las métricas de anclaje y abstención.
- Generación de texto corto en francés con formato instrucción: fine-tuning de bajo coste para tareas de completado breve, con la advertencia de que la generación libre puede ser aproximada.
- Estudio de comparación entre versiones: usar PicoGPT1-Jasmine como referencia histórica y PicoGPT1-Daisy como versión mejorada para analizar el impacto del tamaño del modelo, la limpieza de datos y el decodificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas del pipeline de anclaje obtenidas con `python evaluate.py`:

| Medida | Resultado |
|---|---|
| Preguntas dentro de la base | 30 |
| Respuestas exactas | 30/30 |
| Respuestas ancladas | 30/30 |
| Abstenciones erróneas | 0/30 |
| Recuperación correcta | 30/30 |
| Preguntas fuera de la base | 10 |
| Abstenciones correctas | 10/10 |

Estas métricas solo cubren formulaciones próximas a la base cerrada de 30 hechos y no deben interpretarse como rendimiento general del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 124 M parámetros; en fp32 ocupa aproximadamente 0,5 GB, en fp16 unos 0,25 GB y en cuantizaciones GGUF de 4 bits alrededor de 0,1-0,2 GB. Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU.
- Cabe holgadamente en GPU consumer y en entornos integrados; el cuello de botella no es la VRAM sino la calidad del modelo.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), llama.cpp y llama.app (GGUF), y text-generation-inference según los tags del repositorio. No se documenta vLLM ni Ollama de forma explícita.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera inferencia en tiempo real en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PicoGPT1-Daisy | 124 M | 1.024 | Fine-tuning GPT-2 + RAG con abstención | no disponible | Hugging Face (safetensors + GGUF) |
| PicoGPT1-Jasmine | GPT-2 truncado (2 capas, 128 dims) | 256 | Fine-tuning Alpaca sin anclaje | no disponible | Hugging Face |
| GPT-2 (original) | 124 M | 1.024 | Preentrenamiento base | MIT (modelo original de OpenAI) | Ampliamente disponible |
| Ajustes Alpaca sobre GPT-2 | ~124 M | 1.024 | Fine-tuning instrucción | variable según autor | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte que las respuestas en generación libre pueden ser aproximadas.
- Entrenado exclusivamente en francés; no hay evidencia de capacidades en castellano u otros idiomas.
- El anclaje y la abstención solo funcionan a través de los scripts Python; el GGUF no incluye la base de hechos ni el TF-IDF, por lo que en llama.cpp no hay control anti-alucinación.
- Las métricas de anclaje (30/30, 10/10) se obtuvieron sobre una base cerrada de 30 hechos y formulaciones próximas; no generalizan a otros dominios ni a paráfrasis alejadas.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Sin benchmarks estándar publicados; imposible comparar con precisión frente a otros modelos.
- Riesgo de alucinación en generación libre fuera del pipeline de anclaje.
- Riesgo de sesgos heredados de GPT-2 y del corpus Alpaca filtrado; no se documenta ninguna mitigación.
- Contexto efectivo limitado: 1.024 posiciones en el modelo y ejemplos truncados a 256 tokens durante el entrenamiento.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Repositorio con 230 descargas y 0 likes en el momento de la consulta; comunidad muy reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nazimboudeffa/PicoGPT1-Daisy
- Repositorio de código y documentación: https://github.com/nazimboudeffa/picogpt-kit
- Versión anterior (referencia histórica): https://huggingface.co/nazimboudeffa/PicoGPT1-Jasmine
- llama.app (CLI y servidor): https://llama.app
