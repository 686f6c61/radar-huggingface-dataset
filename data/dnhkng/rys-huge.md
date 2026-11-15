# dnhkng/RYS-Huge

## Resumen

RYS-Huge es un modelo de lenguaje de 104.302.854.144 parámetros (aproximadamente 104,3 mil millones) publicado por David Noel Ng (dnhkng) bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una optimización estructural de un modelo base de la familia Qwen2 (según el tag `qwen2` de Hugging Face) mediante una técnica denominada RYS (por las siglas del método descrito en el artículo del autor), que consiste en la duplicación de capas del transformer sin modificar ningún peso entrenado.

La relevancia del modelo reside en su método de construcción: el autor sostiene haber alcanzado posiciones destacadas en el Open LLM Leaderboard sin realizar ningún cambio en los pesos originales, únicamente reorganizando la arquitectura mediante duplicación de capas. Esto lo convierte en un caso de estudio interesante sobre la relación entre profundidad efectiva, redundancia de parámetros y rendimiento en benchmarks, más que en un modelo de producción convencional.

El repositorio ocupa 208,6 GB y los pesos están en formato safetensors, compatibles con `transformers` y con text-generation-inference. El modelo está etiquetado como `conversational` y `text-generation`, y su uso previsto es la generación de texto conversacional. El modelo card no especifica idiomas soportados ni detalles del dataset de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2, con capas duplicadas mediante el método RYS |
| Parametros totales | 104.302.854.144 (~104,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen2. El aspecto diferencial es el método RYS, descrito en el artículo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight" (Ng, 2026, DOI 10.5281/zenodo.24230106). Según la model card, el método consiste en la duplicación de capas del modelo base sin alterar ningún peso: se replica la estructura de capas existente para aumentar la profundidad efectiva del modelo. El autor afirma que este enfoque le permitió escalar en el Open LLM Leaderboard sin reentrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste fino posterior. Dado que el método no modifica pesos, se asume que las capacidades lingüísticas y de razonamiento provienen íntegramente del modelo Qwen2 original, y que la duplicación de capas actúa como una forma de aumentar la capacidad computacional efectiva en inferencia. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`apply_chat_template`) y roles system/user/assistant.
- Generación de texto general y respuesta a instrucciones, heredadas del modelo Qwen2 base.
- Razonamiento y conocimiento factual, en la medida en que lo proporcione el modelo base subyacente.
- Capacidades multilingües: no documentadas explícitamente; dependen del modelo Qwen2 original.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Investigación sobre arquitecturas de transformers: el modelo sirve como banco de pruebas para estudiar el efecto de la duplicación de capas en el rendimiento, comparando su comportamiento con el del modelo Qwen2 base sin modificar.
- Experimentos de ablación en profundidad efectiva: permite analizar si el aumento de profundidad por duplicación mejora tareas de razonamiento sin reentrenamiento, útil para grupos de investigación en eficiencia de modelos.
- Generación de texto conversacional en entornos de investigación: con 104,3 B de parámetros y licencia MIT, puede desplegarse en clústeres con GPUs de alta gama para estudiar calidad de respuesta en diálogo.
- Reproducción de resultados de leaderboard: dado que el autor afirma haber escalado en el Open LLM Leaderboard, el modelo permite reproducir y auditar dichos resultados en un entorno controlado.
- Estudio de redundancia de parámetros: analizar cuánta capacidad adicional aporta la duplicación frente al coste computacional, con implicaciones para el diseño de modelos eficientes.
- Docencia y divulgación sobre neuroanatomía de LLMs: el modelo y su artículo asociado sirven como material didáctico para explicar cómo la estructura de capas afecta al comportamiento del modelo.
- Evaluación comparativa de métodos de optimización sin reentrenamiento: útil como referencia frente a técnicas como pruning, merging o destilación, todas ellas sin cambios en pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el autor alcanzó una posición destacada en el Open LLM Leaderboard, pero no se proporcionan puntuaciones numéricas concretas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 208 GB solo para pesos, más overhead de activaciones y KV cache; se requieren múltiples GPUs de alta gama.
- VRAM estimada en cuantización de 8 bits: en torno a 104 GB; en 4 bits: en torno a 52 GB (estimaciones teóricas a partir del número de parámetros; no verificadas en la información disponible).
- GPU recomendadas: clústeres con múltiples A100 (80 GB) u H100 (80 GB); por ejemplo, 3-4 A100/H100 en fp16 para cubrir pesos y overhead.
- No cabe en GPUs de consumo individuales (RTX 4090 de 24 GB) en precisión completa; en cuantización de 4 bits podría requerir al menos 2-3 RTX 4090, aunque no se documenta soporte verificado.
- Opciones de despliegue: `transformers` con `device_map="auto"`, text-generation-inference (etiqueta `text-generation-inference`), y potencialmente vLLM o llama.cpp previa conversión a GGUF (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RYS-Huge | ~104,3 B | No disponible | MIT | Qwen2 con capas duplicadas (método RYS), sin reentrenamiento |
| Qwen2-72B | ~72 B | Hasta 128K en algunas variantes | Apache 2.0 / Qwen License | Modelo base de referencia de la familia Qwen2; entrenado desde cero |
| Llama 3.1 70B | ~70 B | 128K | Llama 3.1 Community License | Alternativa de tamaño similar con contexto largo documentado |
| Yi-34B | ~34 B | 200K | Apache 2.0 | Alternativa de menor tamaño con contexto extendido |

La comparación con Qwen2-72B es la más directa por procedencia arquitectónica, aunque RYS-Huge supera en parámetros totales debido a la duplicación de capas. No se dispone de datos de rendimiento comparativo verificables en la información proporcionada.

## Limitaciones y advertencias

- El método RYS no modifica pesos: las capacidades reales del modelo dependen del Qwen2 base, y la duplicación de capas puede introducir redundancia sin ganancia proporcional en calidad.
- No se documentan sesgos conocidos, pero al heredar el comportamiento del modelo base, es probable que reproduzca los sesgos de Qwen2.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no se documentan mitigaciones específicas.
- Idiomas soportados no documentados; el rendimiento fuera de los idiomas del modelo base es incierto.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2 puede tener condiciones adicionales según su variante original; conviene verificar la procedencia exacta.
- El tamaño del repositorio (208,6 GB) y el número de parámetros implican costes de despliegue elevados y latencia alta en comparación con modelos de menor tamaño.
- No hay información sobre contexto máximo, por lo que no se puede garantizar el soporte de ventanas largas.
- El modelo card incluye contenido promocional y referencias al perfil del autor; la documentación técnica es escasa.
- No se han publicado benchmarks numéricos verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/dnhkng/RYS-Huge
- Artículo del método RYS: https://dnhkng.github.io/posts/rys/
- DOI del artículo: https://doi.org/10.5281/zenodo.24230106
- Repositorio GLaDOS del autor: https://github.com/dnhkng/GlaDOS
- Perfil LinkedIn del autor: https://www.linkedin.com/in/dnhkng
- appliedAI Institute: https://www.appliedai-institute.de/en/
