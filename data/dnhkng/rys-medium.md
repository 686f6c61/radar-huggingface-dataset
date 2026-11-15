# dnhkng/RYS-Medium

## Resumen

RYS-Medium es un modelo de generación de texto desarrollado por dnhkng (David Ng) a partir de la arquitectura Phi-3 de Microsoft, con 18.731.402.240 parámetros totales y pesos en formato safetensors. Su particularidad no reside en un reentrenamiento desde cero ni en un ajuste fino convencional, sino en una técnica de optimización post-entrenamiento que el autor denomina "LLM Neuroanatomy": una intervención sobre la estructura interna del modelo sin modificar un solo peso, documentada en el artículo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight". El modelo se publicó en julio de 2024 y se actualizó por última vez en noviembre de 2026.

La relevancia de RYS-Medium es fundamentalmente metodológica: demuestra que es posible alterar el comportamiento medido de un modelo en el Open LLM Leaderboard mediante manipulación arquitectónica en lugar de entrenamiento adicional. El autor reporta una puntuación media de 25,94 en el conjunto de benchmarks del leaderboard, con resultados destacados en BBH (47,73) e IFEval (44,06), pero muy bajos en tareas de razonamiento matemático y científico (MATH Lvl 5: 7,78; GPQA: 10,40; MuSR: 8,73).

El modelo está liberado bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, y se distribuye con código personalizado (`trust_remote_code=True`) compatible con la librería transformers y con text-generation-inference. El repositorio ocupa 37,5 GB, coherente con un modelo de ~18,7 mil millones de parámetros en precisión de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Phi-3 (con modificaciones internas de la técnica RYS) |
| Parametros totales | 18.731.402.240 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos originales en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RYS-Medium parte de la arquitectura Phi-3, un transformer decoder-only denso, y aplica sobre ella una intervención que el autor describe como "un nuevo tipo de optimización de modelos". Según el artículo de referencia, el método consiste en analizar la "neuroanatomía" interna del modelo —la organización funcional de sus componentes— y reorganizarla sin alterar los valores de los pesos. No se dispone de información detallada sobre el número exacto de capas, dimensiones ocultas, mecanismo de atención ni tamaño de vocabulario en la documentación proporcionada.

No hay datos públicos en la información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. El modelo hereda el preentrenamiento y el ajuste de instrucciones de la familia Phi-3, y la contribución del autor se limita a la modificación estructural posterior. La innovación técnica destacable es precisamente esa: demostrar que la manipulación arquitectónica post-hoc puede modificar sustancialmente las métricas del Open LLM Leaderboard sin coste de entrenamiento, lo que plantea preguntas sobre la validez de dichas métricas como indicador de capacidad real.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para roles de sistema, usuario y asistente en el formato de chat de Phi-3.
- Razonamiento de sentido común y tareas de comprensión de lectura, con rendimiento moderado en BBH (47,73 en 3-shot).
- Seguimiento de instrucciones verificable, con 44,06 de precisión estricta en IFEval 0-shot.
- Razonamiento matemático básico, limitado: 7,78 de exact match en MATH Lvl 5 con 4 ejemplos.
- Conocimiento general y profesional evaluado mediante MMLU-PRO (36,96 en 5-shot).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- **Investigación sobre interpretabilidad y edición de modelos**: RYS-Medium es un caso de estudio directo para analizar cómo la reorganización interna de un transformer afecta a métricas de evaluación. Un investigador puede comparar las activaciones internas de este modelo con las de Phi-3 original para identificar qué componentes determinan el rendimiento en BBH o IFEval.
- **Prototipado de asistentes conversacionales con licencia permisiva**: gracias a la licencia MIT y a su tamaño de ~18,7B, puede desplegarse en entornos corporativos donde se requiere libertad de modificación y redistribución, usando el pipeline de transformers con `trust_remote_code=True`.
- **Generación de texto con seguimiento de instrucciones en tareas de formato**: su 44,06 en IFEval indica que puede emplearse en pipelines que exigen respuestas con estructura fija (JSON, listas numeradas, restricciones de longitud), aunque con verificación posterior recomendada.
- **Evaluación comparativa de metodologías de optimización**: sirve como referencia para estudiar si las mejoras en el Open LLM Leaderboard correlacionan con mejoras en tareas reales, dado el contraste entre su puntuación en BBH y sus bajos resultados en MATH, GPQA y MuSR.
- **Despliegue en investigación académica con hardware limitado**: al ser un modelo de 18,7B, puede ejecutarse en una sola GPU de 80 GB en fp16 o en GPUs consumer de 24 GB con cuantización de 8 bits (aunque no se publican pesos GGUF oficiales), lo que facilita experimentos reproducibles.
- **Base para experimentos de edición arquitectónica**: el método RYS está documentado públicamente, por lo que el modelo puede servir como punto de partida para aplicar técnicas similares a otras arquitecturas y medir el impacto en benchmarks estandarizados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, procedentes del Open LLM Leaderboard (métricas no verificadas de forma independiente, `verified: false`):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 44,06 |
| BBH | 3-shot | normalized accuracy | 47,73 |
| MATH Lvl 5 | 4-shot | exact match | 7,78 |
| GPQA | 0-shot | acc_norm | 10,40 |
| MuSR | 0-shot | acc_norm | 8,73 |
| MMLU-PRO | 5-shot | accuracy | 36,96 |
| **Media (Avg.)** | — | — | **25,94** |

No se han publicado en la información disponible resultados de benchmarks adicionales como HumanEval, GSM8K o MMLU estándar, ni comparaciones directas con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia en fp16/bf16**: aproximadamente 37,5 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 40-48 GB.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 19-20 GB para los pesos, más overhead; viable en GPUs de 24 GB.
- **VRAM estimada en cuantización de 4 bits**: alrededor de 10-11 GB para los pesos; viable en GPUs consumer de 12-16 GB, aunque no se distribuyen pesos GGUF oficiales.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o H200 para fp16 sin cuantizar; RTX 4090 (24 GB) o RTX A6000 (48 GB) para cuantización de 8 bits; RTX 3090/4090 con 4 bits para pruebas.
- **¿Cabe en GPU consumer?**: sí, en RTX 3090, RTX 4090 y GPUs con 24 GB o más, siempre que se aplique cuantización; en fp16 no cabe en ninguna GPU consumer actual.
- **Opciones de despliegue**: transformers (con `trust_remote_code=True`), text-generation-inference (etiqueta `text-generation-inference` presente en el repo), y endpoints compatibles. No se confirma soporte oficial para vLLM, llama.cpp u Ollama en la información disponible.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **RYS-Medium** (dnhkng) | 18,73B | no disponible | MIT | Hugging Face | Optimización arquitectónica sobre Phi-3; Avg. 25,94 en Open LLM Leaderboard |
| **Phi-3 Medium** (Microsoft) | ~14B | 128K (según familia Phi-3) | MIT | Hugging Face, Azure | Modelo base del que deriva RYS-Medium; contexto largo y buen rendimiento en razonamiento |
| **Phi-3 Small** (Microsoft) | ~7B | 128K (según familia Phi-3) | MIT | Hugging Face | Alternativa más ligera de la misma familia, ejecutable en GPUs consumer en fp16 |
| **Mistral 7B / Mistral Nemo** | 7B / 12B | 32K / 128K | Apache 2.0 | Hugging Face | Alternativas de tamaño similar con amplio ecosistema de cuantizaciones y despliegue |

La comparación directa con Phi-3 Medium es la más relevante, ya que RYS-Medium se construye sobre ella. No se dispone de datos de benchmarks verificados de RYS-Medium frente a Phi-3 Medium en la información proporcionada, por lo que no es posible cuantificar la mejora o degradación real más allá de las métricas del leaderboard declaradas por el autor.

## Limitaciones y advertencias

- **Resultados no verificados**: todas las métricas del model-index están marcadas como `verified: false`; proceden de la evaluación del autor y no han sido replicadas de forma independiente.
- **Rendimiento muy bajo en razonamiento matemático y científico**: 7,78 en MATH Lvl 5, 10,40 en GPQA y 8,73 en MuSR, lo que desaconseja su uso en tareas que requieran cálculo, razonamiento científico o multi-paso complejo.
- **Riesgo de alucinación**: no se documentan evaluaciones de factualidad ni de tasa de alucinación; al ser un modelo de ~18,7B sin datos públicos de ajuste, el riesgo es comparable al de otros modelos de su tamaño.
- **Idiomas no documentados**: no se especifica qué idiomas soporta; se recomienda validar el comportamiento en castellano antes de usarlo en producción.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto; no debe asumirse la ventana de 128K de la familia Phi-3 sin verificación empírica.
- **Requiere `trust_remote_code=True`**: el modelo incluye código personalizado, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en entornos sensibles.
- **Licencia MIT**: permisiva para uso comercial, pero sin garantías; el autor no ofrece soporte ni mantenimiento garantizado.
- **Sesgos**: no se han publicado análisis de sesgos en la información disponible.
- **Adecuación a producción**: dado el perfil de benchmarks y la falta de verificación independiente, no se recomienda como modelo principal en sistemas críticos sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-Medium
- Artículo del método RYS: https://dnhkng.github.io/posts/rys/
- Resultados detallados en Open LLM Leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_dnhkng__Medium
- Open LLM Leaderboard (consulta del modelo): https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard?query=dnhkng/Medium
- appliedAI Institute (colaborador de hardware): https://www.appliedai-institute.de/en/
