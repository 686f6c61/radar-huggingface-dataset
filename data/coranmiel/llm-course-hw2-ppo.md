# coranmiel/llm-course-hw2-ppo

## Resumen

`coranmiel/llm-course-hw2-ppo` es un modelo de lenguaje de 134.515.584 parámetros (aproximadamente 134,5 M) publicado en Hugging Face por el usuario coranmiel. Por su identificador y por el contexto de publicación (repositorio de 0,5 GB, creado en noviembre de 2026, sin descargas ni likes) parece tratarse de un artefacto académico generado como parte de un trabajo práctico de un curso sobre modelos de lenguaje, concretamente un ejercicio de ajuste fino con PPO (Proximal Policy Optimization), la variante de aprendizaje por refuerzo con retroalimentación humana (RLHF) popularizada por InstructGPT.

El modelo se distribuye en formato safetensors con la librería transformers y la arquitectura declarada como `llama`, lo que sugiere una implementación de tipo transformer decoder-only con la configuración habitual de LLaMA. El tamaño de 134,5 M de parámetros es coherente con configuraciones pequeñas de la familia LLaMA (por ejemplo, capas ocultas de 768 y 12 capas), lo que lo sitúa en la categoría de modelos compactos aptos para experimentación en hardware de consumo, pero muy lejos de los modelos de producción actuales.

La relevancia de esta ficha es principalmente documental y formativa: la model card es la plantilla automática de Hugging Face sin rellenar (todos los campos aparecen como "[More Information Needed]"), no hay datos de entrenamiento, benchmarks ni licencia declarada, y el repositorio no registra descargas. Por tanto, debe tratarse como un modelo de demostración educativa y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como `llama` en los tags) |
| Parametros totales | 134.515.584 (≈134,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se ofrecen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos es `llama`, es decir, un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), siguiendo el diseño de la familia LLaMA. Con 134,5 M de parámetros, la configuración típica correspondería a un modelo de 12 capas, dimensión oculta de 768 y 12 cabezas de atención, aunque la model card no confirma estos hiperparámetros y deben considerarse una estimación basada en el recuento de parámetros, no un dato verificado.

El sufijo `ppo` del identificador indica que el modelo ha pasado por una etapa de ajuste con Proximal Policy Optimization, el algoritmo de RLHF empleado en InstructGPT. Se desconoce por completo la receta de entrenamiento: no hay información sobre el corpus de preentrenamiento, el número de tokens, la composición del dataset, el modelo base del que se parte, el modelo de recompensa utilizado ni los hiperparámetros del bucle PPO (clip ratio, KL penalty, número de pasos). La model card no incluye ninguna sección de detalles de entrenamiento cumplimentada, por lo que toda la información sobre el proceso es inferida del nombre del repositorio y no verificable.

## Capacidades

- Generación de texto autoregresiva: el pipeline declarado es `text-generation`, por lo que el uso previsto es la continuación y generación de texto.
- Conversación: el tag `conversational` sugiere que el ajuste con PPO se orientó a respuestas de tipo instrucción o diálogo, aunque no hay ejemplos ni plantilla de chat documentada.
- Razonamiento y código: no hay evidencia publicada de capacidades específicas de razonamiento, matemáticas o generación de código; con 134,5 M de parámetros, el rendimiento esperable en estas tareas es muy limitado.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Docencia y reproducción de RLHF: el caso de uso más realista es servir como ejemplo ejecutable de un pipeline PPO completo en un curso de modelos de lenguaje, permitiendo a los estudiantes inspeccionar los pesos resultantes y comparar el comportamiento antes y después del ajuste con refuerzo.
- Experimentación con ajuste fino en hardware modesto: con 134,5 M de parámetros y 0,5 GB de pesos en fp32, el modelo cabe holgadamente en cualquier GPU de consumo e incluso en CPU, lo que permite probar técnicas de fine-tuning (LoRA, QLoRA) sin infraestructura dedicada.
- Pruebas de infraestructura de despliegue: útil para validar pipelines de serving (transformers, text-generation-inference) con un modelo pequeño antes de escalar a modelos mayores, reduciendo el coste de iteración.
- Generación de texto de baja latencia en entornos embebidos: por su tamaño, podría ejecutarse en dispositivos con recursos limitados para tareas triviales de continuación de texto, siempre que la calidad no sea crítica.
- Base para investigación sobre alineación a pequeña escala: permite estudiar cómo se comporta PPO con presupuestos de cómputo reducidos y comparar con alternativas como DPO en modelos de menos de 200 M de parámetros.
- Reproducción de experimentos académicos: sirve como punto de partida para replicar resultados de trabajos sobre RLHF en modelos pequeños, aunque la falta de documentación limita seriamente la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 134,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,54 GB; en fp16 unos 0,27 GB; en int8 unos 0,13 GB. Añadiendo caché KV y overhead del runtime, la inferencia completa cabe en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090). También es viable en CPU con un rendimiento aceptable para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer de los últimos años, e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y conversión a GGUF para llama.cpp u Ollama si se genera manualmente, ya que el repositorio no incluye variantes cuantizadas.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamaño, en una RTX 4090 se esperaría un throughput de cientos a miles de tokens por segundo, pero es una estimación teórica no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| coranmiel/llm-course-hw2-ppo | 134,5 M | no disponible | no disponible | Hugging Face, 0 descargas | Artefacto de curso, sin documentación |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo pequeño con model card completa y benchmarks |
| GPT-2 small | 124 M | 1024 tokens | MIT | Hugging Face, muy extendido | Referencia clásica de modelos de 100-150 M |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | Hugging Face, con benchmarks publicados | Modelo pequeño moderno de Hugging Face |

La comparación con GPT-2 small y SmolLM-135M es la más directa por rango de parámetros (124-135 M). Frente a ellos, el modelo de coranmiel carece de model card sustantiva, benchmarks, licencia declarada y comunidad de usuarios, lo que lo hace inadecuado para cualquier uso que requiera trazabilidad o soporte. TinyLlama, con casi diez veces más parámetros, queda en otra categoría de capacidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no conocerse el corpus de entrenamiento ni el modelo base, no es posible evaluar sesgos de género, raza, idioma o ideología.
- Riesgo de alucinación: alto y no cuantificado; un modelo de 134,5 M de parámetros tiene una capacidad limitada de modelado factual, y el ajuste con PPO puede incrementar la fluidez sin mejorar la veracidad.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados; no hay plantilla de chat ni tokenizador documentado más allá de lo que se pueda inspeccionar en el repositorio.
- Restricciones de licencia: la licencia no está declarada, lo que en la práctica impide asumir derechos de uso comercial; cualquier despliegue en producción requeriría contactar con el autor.
- Caveats para producción: la model card es la plantilla automática sin rellenar, no hay benchmarks, no hay descargas ni validación comunitaria, y el repositorio tiene 0,5 GB con un único checkpoint. No debe usarse como componente crítico sin una evaluación propia exhaustiva.
- Reproducibilidad: al desconocerse el modelo base, los datos y los hiperparámetros de PPO, los resultados no son reproducibles a partir de la información publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coranmiel/llm-course-hw2-ppo
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
