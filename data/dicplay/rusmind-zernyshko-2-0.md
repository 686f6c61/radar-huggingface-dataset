# DICPlay/RusMind-Zernyshko-2.0

## Resumen

RusMind Zernyshko 2.0 es un modelo de lenguaje compacto de 342 millones de parámetros desarrollado por DICPlay, presentado como la segunda generación de la familia Zernyshko de la línea RusMind. Está entrenado desde cero (from-scratch) sobre datos propios, con un tokenizador propio de 48.000 tokens optimizado para ruso, y una arquitectura transformer-decoder con RMSNorm, RoPE, SwiGLU y atención GQA con proporción 16/4. Su ventana de contexto es de 4.096 tokens y el formato de diálogo es ChatML.

El modelo se posiciona como una solución ligera y totalmente offline, ejecutable en portátil e incluso en teléfono, con variantes cuantizadas que van desde 685 MB en bf16 hasta 219 MB en GGUF Q4_K_M. La propuesta de valor se centra en habilidades prácticas concretas: cálculo aritmético, generación de código, salida estructurada en JSON, invocación de herramientas y una declaración explícita de desconocimiento cuando no sabe responder.

Es relevante por su enfoque en el ecosistema ruso y por su tamaño reducido, que lo hace desplegable en hardware muy limitado. No obstante, los datos publicados son escasos: no hay resultados de benchmarks estándar más allá de una puntuación general MERA 2.0 de 0,054 y un test interno de 120 preguntas, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4) |
| Parametros totales | 342.283.264 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | bf16 (685 MB), GGUF Q8_0 (367 MB), GGUF Q4_K_M (219 MB) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay), licencia propia |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp/LM Studio/Ollama) |
| Capas | 26 |
| Dimension del modelo | 1.024 |
| Vocabulario | 48.000 tokens (tokenizador propio) |
| Formato de dialogo | ChatML |
| Requiere trust_remote_code | Si (arquitectura propia RusMind AI) |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 26 capas con dimensión 1.024, que emplea RMSNorm para normalización, RoPE para codificación posicional, activación SwiGLU en las capas feed-forward y atención con query grouping (GQA) en proporción 16/4. Tanto los pesos como el tokenizador (48.000 tokens, entrenado específicamente en ruso) y los datos de entrenamiento son propios. Para compatibilidad con llama.cpp, LM Studio y Ollama, la versión GGUF utiliza la disposición estándar de llama.

El entrenamiento se realizó desde cero sobre 4.500 millones de tokens, con una composición que incluye Wikipedia en ruso, web en ruso, diálogos propios, código y tareas. Posteriormente se aplicó un proceso de ajuste orientado a habilidades prácticas: cálculo, código, salida JSON, traducción, invocación de herramientas, cortesía y honestidad epistémica (decir "no sé" cuando corresponde). No se especifica si se emplearon técnicas de RLHF o DPO, ni se detalla la composición exacta del dataset. La model card menciona una mejora en un test interno de 120 preguntas de 53,5 a 74 puntos tras este ajuste.

## Capacidades

- Generación de texto conversacional en ruso, con formato de diálogo ChatML.
- Razonamiento aritmético y resolución de problemas matemáticos sencillos (sumas, cálculo de velocidad, etc.).
- Generación de código.
- Salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Invocación de herramientas (tool calling) con formato `{"tool": "...", "args": {...}}`.
- Capacidad declarada de responder "no sé" ante preguntas fuera de su conocimiento.
- Traducción (mencionada entre las habilidades de ajuste).
- Ejecución totalmente offline en hardware de consumo.
- No se mencionan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional offline en ruso: el modelo puede gestionar diálogos multi-turno dentro de su ventana de 4.096 tokens, ejecutándose en local sin conexión, lo que lo hace adecuado para aplicaciones de privacidad estricta o entornos sin red.
- Automatización de respuestas estructuradas: extracción de campos (producto, precio, etc.) desde texto libre en ruso y devolución en JSON, útil para pipelines de procesamiento de documentos o formularios.
- Enrutamiento de herramientas en agentes ligeros: dado que emite llamadas con formato `{"tool": ..., "args": ...}`, puede actuar como capa de decisión en un sistema de agentes que delegue en APIs externas (meteorología, búsqueda, etc.).
- Educación y tutoría básica: resolución paso a paso de operaciones aritméticas y problemas de primaria/secundaria en ruso, con explicación del procedimiento.
- Despliegue en dispositivos móviles o embebidos: con 219 MB en Q4_K_M, es viable en teléfonos y placas de bajo consumo para tareas de generación de texto breve y clasificación.
- Prototipado rápido de aplicaciones en ruso: su tamaño reducido permite iterar en local con transformers o llama.cpp sin infraestructura GPU dedicada.
- Filtrado y generación de texto en entornos con recursos limitados: sustitución de modelos mayores en tareas de baja complejidad donde el coste por inferencia es crítico.

## Benchmarks y rendimiento

| Benchmark | RusMind Zernyshko 2.0 | Notas |
|---|---|---|
| MERA 2.0 (puntuación general) | 0,054 | Mejor resultado de la línea Zernyshko según el autor |
| Test interno práctico (120 preguntas) | 74 | Frente a 53,5 de la misma base antes del ajuste |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no son verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bf16; 0,4 GB en GGUF Q8_0; 0,25 GB en GGUF Q4_K_M (sin contar overhead del runtime).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, así como en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas; también en CPU y en dispositivos móviles según el autor.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, LM Studio, Ollama (mediante el repositorio GGUF `DICPlay/RusMind-Zernyshko-2.0-GGUF`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0 | 342 M | 4.096 | Ruso | RusMind License (propia, restrictiva para uso comercial) | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 362 M | 8.192 | Principalmente inglés | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1.100 M | 2.048 | Inglés | Apache 2.0 | safetensors, GGUF |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento comparables publicados para este modelo. Frente a alternativas de tamaño similar, RusMind Zernyshko 2.0 destaca por su especialización en ruso y su tokenizador propio, pero ofrece una ventana de contexto menor que Qwen2.5-0.5B y SmolLM2-360M, y una licencia más restrictiva que las licencias permisivas (Apache 2.0) de sus competidores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre web y Wikipedia en ruso, es probable que herede sesgos de esas fuentes, pero no se aporta información al respecto.
- Riesgo de alucinación: presente, como en cualquier modelo de este tamaño; la capacidad de decir "no sé" es una mitigación declarada, no una garantía.
- Limitación de idioma: el modelo está orientado exclusivamente al ruso; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será bajo.
- Ventana de contexto corta (4.096 tokens) en comparación con alternativas actuales.
- Licencia restrictiva: uso gratuito solo para fines personales, no comerciales, investigación y evaluación; el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren un contrato escrito con DICPlay.
- El modelo se distribuye "tal cual", sin garantías.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Ausencia de benchmarks estándar verificables de forma independiente y de métricas de latencia o throughput.
- El repositorio no registra descargas ni interacciones, lo que dificulta evaluar su adopción y soporte comunitario.
- Los datos de creación y actualización (noviembre de 2026) y la referencia a "MERA 2.0" deben tomarse como declaraciones del autor, no verificadas de forma externa.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0
- Hugging Face (GGUF): https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF
- Licencia: archivo `LICENSE` dentro del repositorio de Hugging Face
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
