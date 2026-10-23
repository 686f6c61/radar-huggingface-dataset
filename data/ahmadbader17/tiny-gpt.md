# Ahmadbader17/tiny-gpt

## Resumen

Tiny GPT es un transformer descodificador de tipo GPT-2 escrito desde cero en PyTorch (sin usar las clases de `transformers`) por el autor Ahmadbader17, entrenado sobre un subconjunto del dataset TinyStories. Con 5.853.184 parámetros, 6 capas, dimensión de modelo 256 y una ventana de contexto de solo 256 tokens, está diseñado exclusivamente para continuar historias infantiles cortas en inglés. Se publica como modelo base (no instruido), bajo licencia MIT, con pesos en `safetensors` y un `ModelConfig` propio.

Su interés es fundamentalmente didáctico y experimental: demuestra que es posible entrenar un modelo de lenguaje funcional dentro de su dominio en una sola CPU de portátil (Intel Core Ultra 9 185H, 12 hilos) en 7,9 horas, procesando 77,8 millones de tokens en 9.500 pasos. El resultado es un modelo con perplejidad de validación de 5,41 por token BPE con su tokenizador de 4.096 entradas, muy por debajo de las líneas base de n-gramas (38,4 para bigramas, 357 para unigramas).

Es relevante ahora como referencia reproducible y ligera para quien quiera estudiar el pipeline completo de un LLM a pequeña escala: tokenizador entrenado ad hoc, bucle de entrenamiento propio, evaluación con perplejidad y servidor de inferencia propio. No es un modelo de propósito general: no sigue instrucciones, no responde preguntas y no mantiene conversaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer descodificador pre-norm estilo GPT-2 (6 capas, d_model 256, 8 cabezas, embeddings posicionales aprendidos, pesos de embedding compartidos) |
| Parámetros totales | 5.853.184 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos en `safetensors`; no hay versiones GGUF, AWQ, GPTQ ni cuantizadas) |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | MIT (código y pesos); el dataset TinyStories está bajo CDLA-Sharing-1.0 |
| Formato de pesos | `model.safetensors`, más `model_config.json`, `tokenizer.json` y `model_info.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer descodificador autorregresivo con pre-normalización, 6 capas, dimensión de modelo 256, 8 cabezas de atención (32 dimensiones por cabeza), embeddings posicionales aprendidos y ataduras entre el embedding de entrada y la proyección de salida (tied embeddings). El tokenizador es un BPE a nivel de byte con vocabulario de 4.096 entradas, entrenado exclusivamente sobre el split de entrenamiento del dataset y guardado como `tokenizer.json`. La implementación es propia en PyTorch, sin reutilizar clases de `transformers`, lo que implica que el `model_config.json` corresponde a una clase `ModelConfig` del autor y no a un `PretrainedConfig` estándar.

El entrenamiento utilizó las primeras 300.000 historias de TinyStories V2 (generadas con GPT-4), un total de 60,8 millones de tokens, con validación sobre 5.000 historias reservadas. La ejecución consistió en 9.500 pasos de 8.192 tokens cada uno (77,8 millones de tokens, aproximadamente 1,28 pasadas sobre los datos), con optimizador AdamW, learning rate máximo de 1e-3, warmup y decaimiento coseno, usando 12 hilos de CPU durante 7,9 horas. No se menciona en la información disponible ninguna fase de ajuste fino supervisado, RLHF o DPO: es un modelo base entrenado con el objetivo estándar de predicción del siguiente token.

## Capacidades

- Generación de texto autorregresiva en inglés, limitada a continuación de historias infantiles cortas.
- Coherencia a nivel de frase: las muestras son fluidas oración a oración dentro del registro de TinyStories.
- Ninguna capacidad de seguir instrucciones, responder preguntas ni mantener una conversación (limitación declarada explícitamente por el autor).
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- monolingüe en inglés; no hay capacidades multilingües.
- Sin visión, audio ni modo de razonamiento (thinking mode).
- No dispone de plantilla de chat ni de tokens especiales de rol documentados.
- Sirve como modelo de referencia para experimentos controlados de tokenización, decodificación y escalado a pequeña escala.

## Casos de uso

- Demostración educativa de un LLM completo: permite recorrer el ciclo entero (tokenizador BPE propio, entrenamiento desde cero, evaluación por perplejidad y servido con FastAPI/uvicorn) en una sola sesión de clase o taller.
- Generación de cuentos infantiles sintéticos: útil para ampliar corpus de historias simples en inglés con vocabulario controlado, siempre con revisión humana posterior por las repeticiones y contradicciones documentadas.
- Réplica y verificación de experimentos de investigación: al publicarse los logs de entrenamiento y el código, sirve para reproducir curvas de pérdida y estudiar eficiencia de datos en el régimen de 5-10 millones de parámetros.
- Base para experimentos de eficiencia: con 5,8 millones de parámetros y contexto de 256 tokens, es un banco de pruebas barato para comparar estrategias de decodificación (greedy, top-k, nucleus) o variantes de atención sin coste de GPU.
- Fixture en pruebas de integración y CI: un modelo de 23 MB en fp32 permite validar pipelines de carga de `safetensors`, tokenización y servido en tests automáticos sin infraestructura GPU.
- Comparación de tokenizadores: al incluir su propio `tokenizer.json` de 4.096 entradas y métricas calculadas por token BPE, facilita estudiar cómo el vocabulario afecta a la perplejidad reportada.
- Demos sin conexión y en dispositivos modestos: su tamaño permite ejecutar inferencia en CPU de portátil o en una Raspberry Pi, útil para prototipos de juguete o instalaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de razonamiento, código o matemáticas (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación reportada es de pérdida de validación y perplejidad por token BPE con el tokenizador de 4.096 entradas del propio modelo:

| Modelo | Pérdida de validación | Perplejidad |
|---|---|---|
| Adivinanza uniforme | 8,32 | 4.096 |
| Conteo de unigramas | 5,88 | 357 |
| Conteo de bigramas | 3,65 | 38,4 |
| Tiny GPT (este modelo) | 1,688 | 5,41 |

El autor advierte que la perplejidad está calculada por token BPE con su tokenizador de 4.096 entradas sobre texto de TinyStories, por lo que no es comparable con cifras de otros tokenizadores o de otros datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 23,4 MB para los pesos en fp32 y 11,7 MB en fp16/bf16 (cálculo derivado de 5.853.184 parámetros; no publicado por el autor).
- Caché KV estimada: alrededor de 3,1 MB en fp32 para los 256 tokens de contexto (6 capas × 8 cabezas × 32 dimensiones × 2 × 256; estimación propia, no publicada).
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, una RTX 4090) está enormemente sobredimensionada; el entrenamiento documentado se completó en CPU.
- Cabe en cualquier GPU consumer e incluso en placas de un solo board; el despliegue en CPU es suficiente.
- Opciones de despliegue: servidor propio con FastAPI/uvicorn incluido en el repositorio (`tinygpt.serving.app:create_app`). No hay soporte confirmado en vLLM, TGI, llama.cpp, Ollama ni servidores compatibles con `transformers`, ya que los pesos usan una `ModelConfig` propia.
- Latencia y throughput estimados: no disponibles. El único dato temporal publicado es el de entrenamiento (7,9 horas en un Intel Core Ultra 9 185H con 12 hilos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny GPT (Ahmadbader17) | 5.853.184 | 256 | 300.000 historias de TinyStories V2 (60,8 M tokens) | MIT | Pesos en `safetensors` en HuggingFace; código en GitHub |
| TinyStories-1M (roneneldan) | ~1 M (según el nombre del repositorio; no verificado en la información disponible) | No disponible | TinyStories | No disponible | HuggingFace |
| TinyStories-9M (roneneldan) | ~9 M (según el nombre del repositorio; no verificado) | No disponible | TinyStories | No disponible | HuggingFace |
| TinyStories-33M (roneneldan) | ~33 M (según el nombre del repositorio; no verificado) | No disponible | TinyStories | No disponible | HuggingFace |

No se dispone en la información proporcionada de métricas comparables de estos modelos alternativos, ni de una comparación directa de perplejidad bajo el mismo tokenizador.

## Limitaciones y advertencias

- Dominio muy estrecho: solo conoce el vocabulario y las tramas simples de TinyStories. No puede seguir instrucciones, responder preguntas ni mantener una conversación.
- Calidad limitada: las historias son fluidas a nivel de frase, pero repiten expresiones, pierden objetos y tramas, y a veces se contradicen. El propio repositorio incluye ejemplos de fallo en `docs/RESULTS.md`.
- Riesgo de alucinación: el modelo genera texto plausible sin base factual; no debe usarse para contenido factual ni como fuente de información.
- Sesgos heredados: los datos fueron generados por un LLM, por lo que el modelo reproduce sus sesgos estilísticos y sociales (nombres, roles de género, escenarios). No se ha evaluado en sesgo ni seguridad.
- Contexto muy corto (256 tokens) e idioma único (inglés); no hay soporte multilingüe ni de instrucciones en otros idiomas.
- Licencia: pesos y código bajo MIT, lo que permite uso comercial, pero el dataset TinyStories está bajo CDLA-Sharing-1.0; conviene revisar sus términos y atribuir la fuente si se redistribuyen derivados.
- Integración: no es compatible de forma directa con `transformers`, vLLM o llama.cpp al usar una configuración y una implementación propias; requiere el código del repositorio.
- Uso previsto por el autor: aprendizaje, demos y experimentos con modelos de lenguaje pequeños. No debe emplearse en atención al cliente, asesoramiento ni en ningún contexto donde un texto erróneo o sesgado pueda causar daño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahmadbader17/tiny-gpt
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStories V2 (referenciado en la model card): no disponible (no se proporciona URL específica)
- Repositorio GitHub con código, logs de entrenamiento y memoria técnica: no disponible (la model card lo menciona con un placeholder `<github repo>`, sin URL pública en la información proporcionada)
- Resultados y muestras de fallo (`docs/RESULTS.md`): no disponible (ruta interna del repositorio, sin URL pública)
- Paper de TinyStories (Ronen Eldan y Yuanzhi Li): no disponible (citado por el autor, sin enlace en la información proporcionada)
