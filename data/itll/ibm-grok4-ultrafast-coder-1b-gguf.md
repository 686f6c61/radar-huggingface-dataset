# ITLL/IBM-Grok4-UltraFast-Coder-1B-GGUF

## Resumen

IBM-Grok4-UltraFast-Coder-1B-GGUF es un ajuste fino de parámetros completos del modelo ibm-granite/granite-4.0-h-1b, desarrollado por In The Loop Labs (ITLL), una organización sin ánimo de lucro. El modelo parte de la arquitectura híbrida Mamba-2/Transformer de Granite 4.0 (4 capas de atención y 36 capas Mamba2) con aproximadamente 1.500 millones de parámetros y una ventana de contexto de 128K tokens. El objetivo del proyecto es destilar el estilo de trabajo rápido y orientado a código de los modelos profesores de la familia Grok de xAI en un modelo pequeño que se ejecute con holgura en hardware de consumo.

El entrenamiento se realizó sobre nueve conjuntos de datos públicos de Hugging Face construidos a partir de salidas de Grok-4, Grok-4.1-Fast y Grok Code Fast 1, con un total aproximado de 15.200 filas. La mezcla de datos está dominada por código y razonamiento técnico, complementada con matemáticas, prompts visuales de trading, tareas ARC-AGI y datos creativos y lógicos. El resultado se publica como 12 cuantizaciones GGUF (desde Q2_K hasta F16), lo que permite desplegarlo en portátiles, mini-PC y pilas de agentes locales.

La relevancia actual del modelo reside en su relación entre capacidad y huella de memoria: la cuantización Q4_K_M ocupa aproximadamente un gigabyte de RAM, algo que ningún transformer denso de 7B puede igualar. No obstante, conviene subrayar que no es un modelo de xAI ni de IBM más allá de los pesos base bajo Apache 2.0: se trata de un modelo pequeño cuyo comportamiento fue moldeado por datos generados por Grok.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 / Transformer (4 capas de atención, 36 capas Mamba2) |
| Parametros totales | 1.631.750.144 (aproximadamente 1,5B; reportado como 2B en metadatos GGUF/Ollama) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | 12 cuantizaciones GGUF, desde Q2_K hasta F16 |
| Idiomas soportados | Principalmente inglés (el modelo base tiene preentrenamiento multilingüe) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (incluye plantilla de chat embebida); el checkpoint original en safetensors no se distribuye en este repo |

## Arquitectura y entrenamiento

El modelo base granite-4.0-h-1b es un decoder-only híbrido: cuatro capas de atención estándar se encargan de la recuperación precisa en contexto, mientras que treinta y seis capas Mamba2 proporcionan procesamiento de secuencias en tiempo lineal y una huella de memoria mucho menor que un transformer denso de tamaño comparable. Esta combinación es la que permite que la cuantización Q4_K_M funcione en torno a un gigabyte de RAM manteniendo una ventana de 128K tokens.

El ajuste fino fue de parámetros completos: se actualizaron todos los pesos de la red sobre la mezcla de nueve conjuntos de datos, sin LoRA ni adaptadores y sin capas congeladas. A escala de 1B esta decisión es deliberada, ya que los métodos de ajuste eficiente en parámetros ahorran poca memoria en un modelo de 1,5B mientras que una actualización completa maximiza la capacidad de absorber el estilo de respuesta, los hábitos de formato y los patrones de razonamiento del profesor. Los hiperparámetros concretos (optimizador, tasa de aprendizaje, épocas, tamaño de lote, hardware) no se detallan en la model card. El checkpoint entrenado se convirtió a GGUF y se cuantizó en los doce archivos publicados, conservando los metadatos de la arquitectura `granite` para que los runtimes lo traten como cualquier otro modelo híbrido de Granite 4.0.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat embebido en el GGUF.
- Generación de código y finalización de código (fill-in-the-middle), herencia directa de las capacidades del modelo base y reforzada por los conjuntos de datos de Grok Code Fast 1.
- Razonamiento técnico y matemático, con datos específicos de matemáticas en la mezcla de entrenamiento.
- Seguimiento de instrucciones y formateo de respuestas al estilo de los modelos Grok "fast".
- Soporte de function calling y tool calling, heredado del perfil del modelo base (BFCL v3 en la evaluación original).
- Capacidades de resumen, clasificación de texto, extracción y question answering del modelo base.
- Soporte de RAG y diálogo multilingüe según el perfil publicado del modelo base, aunque el ajuste fino está centrado en inglés.
- Capacidad de razonamiento multi-paso limitada por el tamaño; adecuada para tareas acotadas dentro de pipelines de agentes.

## Casos de uso

- Asistente de código local en portátil: con la cuantización Q4_K_M en aproximadamente 1 GB de RAM, el modelo puede autocompletar y generar funciones en un editor o IDE sin conexión, aprovechando la ventana de 128K para incluir varios archivos de contexto.
- Agente de CI/CD para tareas acotadas: integrado mediante tool calling, puede generar parches, mensajes de commit o resúmenes de diffs en pipelines donde no se justifica invocar un modelo grande en la nube.
- Chatbot de soporte técnico en inglés: el modelo gestiona conversaciones multi-turno con contexto largo gracias a los 128K tokens, útil para documentación de producto y preguntas frecuentes técnicas.
- Generación de tests unitarios y datos de prueba: su orientación a código y matemáticas permite producir casos de prueba y fixtures a partir de especificaciones o firmas de funciones.
- Prototipado rápido de pipelines RAG: al ser ligero y compatible con runtimes GGUF estándar, sirve para validar la recuperación y el formateo de respuestas antes de escalar a un modelo mayor.
- Herramienta de brainstorming y razonamiento en local para desarrolladores: la mezcla de datos incluye conjuntos creativos y lógicos, lo que permite usarlo como asistente de ideación y descomposición de problemas en máquinas sin GPU dedicada.
- Inferencia en el borde (edge AI): mini-PC, Raspberry Pi de gama alta o dispositivos con poca memoria pueden ejecutar el modelo en cuantizaciones bajas para tareas de clasificación, extracción o generación breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del checkpoint ajustado en la información disponible. La model card únicamente reproduce las puntuaciones del modelo base granite-4.0-h-1b antes del ajuste fino, que se incluyen como referencia y no como medición de este modelo:

| Benchmark | Modelo base (antes del ajuste) |
|---|---|
| MMLU (5-shot) | 59,74 |
| GSM8K (8-shot) | 69,83 |
| HumanEval (pass@1) | 73,0 |
| BFCL v3 (tool calling) | 50,21 |
| SALAD-Bench (safety) | 96,4 |

El ajuste fino redistribuye capacidad en lugar de sumarla, por lo que estos valores deben tratarse como punto de partida y no como rendimiento del checkpoint publicado.

## Requisitos de hardware

- VRAM/RAM estimada: la cuantización Q4_K_M ocupa aproximadamente 1 GB de RAM; las cuantizaciones Q2_K y Q3_K son aún menores, y F16 requiere alrededor de 3 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) puede ejecutar el modelo en cuantizaciones intermedias o altas; en A100 y H100 el modelo queda limitado por latencia de kernel más que por memoria.
- Compatibilidad con GPU consumer: sí, en toda la gama, incluidas GPUs integradas y Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp, Ollama (los metadatos lo reportan como 2B), y runtimes compatibles con la arquitectura `granite` de GGUF; el repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura Mamba2 híbrida favorece el procesamiento de secuencias largas en tiempo lineal, pero no se han publicado cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IBM-Grok4-UltraFast-Coder-1B | ~1,5B | 128K | Apache 2.0 | GGUF | Ajuste fino completo sobre datos destilados de Grok |
| ibm-granite/granite-4.0-h-1b | ~1,5B | 128K | Apache 2.0 | safetensors | Modelo base; benchmarks publicados por IBM |
| Qwen2.5-Coder-1.5B | ~1,5B | 32K | Apache 2.0 | safetensors, GGUF | Especializado en código, transformer denso |
| SmolLM2-1.7B | ~1,7B | 8K | Apache 2.0 | safetensors, GGUF | Transformer denso orientado a edge |

La ventaja diferencial de este modelo frente a los alternativas de tamaño similar es la combinación de contexto de 128K y arquitectura híbrida Mamba-2, que reduce la memoria y el coste de secuencias largas. No se dispone de comparaciones de rendimiento medidas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks del checkpoint ajustado; el rendimiento real en código, matemáticas o tool calling es desconocido y puede diferir del modelo base.
- El ajuste fino completo sobre un conjunto de datos pequeño (aproximadamente 15.200 filas) puede provocar olvido catastrófico de capacidades del modelo base, especialmente en tareas multilingües y de clasificación.
- El modelo está orientado principalmente al inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación inherente a modelos de 1,5B, agravado por el ajuste sobre datos destilados de profesores mucho mayores.
- Los datos de entrenamiento provienen de salidas de modelos Grok, por lo que pueden arrastrar sesgos y estilos de respuesta del profesor, incluidos posibles sesgos de contenido.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los conjuntos de datos de entrenamiento si se planea uso comercial, ya que la model card no detalla restricciones adicionales.
- El nombre del modelo puede inducir a confusión: no es un modelo de xAI ni de IBM más allá de los pesos base, y no debe presentarse como tal en producción.
- La etiqueta de librería `grok` en Hugging Face no implica compatibilidad con el ecosistema de xAI; el runtime debe tratarlo como un GGUF de arquitectura `granite`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni informes independientes de calidad.

## Enlaces

- [Hugging Face: ITLL/IBM-Grok4-UltraFast-Coder-1B-GGUF](https://huggingface.co/ITLL/IBM-Grok4-UltraFast-Coder-1B-GGUF)
- [Modelo base: ibm-granite/granite-4.0-h-1b](https://huggingface.co/ibm-granite/granite-4.0-h-1b)
- [Dataset: Antired/tradehax-xai-grok-trading-visual-prompts](https://huggingface.co/datasets/Antired/tradehax-xai-grok-trading-visual-prompts)
- [Dataset: lvogel123/arc-agi-1-grok-4](https://huggingface.co/datasets/lvogel123/arc-agi-1-grok-4)
- [Dataset: Crownelius/Hyper-Creative-Grok-V1](https://huggingface.co/datasets/Crownelius/Hyper-Creative-Grok-V1)
- [Dataset: Crownelius/Hyper-Logic-Grok-V1](https://huggingface.co/datasets/Crownelius/Hyper-Logic-Grok-V1)
- [Dataset: Crownelius/Hyper-UltraData-Grok-V1](https://huggingface.co/datasets/Crownelius/Hyper-UltraData-Grok-V1)
- [Dataset: TeichAI/brainstorm-v3.1-grok-4-fast-200x](https://huggingface.co/datasets/TeichAI/brainstorm-v3.1-grok-4-fast-200x)
- [Dataset: TeichAI/grok-code-fast-1-1000x](https://huggingface.co/datasets/TeichAI/grok-code-fast-1-1000x)
- [Dataset: nmayorga7/math-grok-4](https://huggingface.co/datasets/nmayorga7/math-grok-4)
- [Dataset: Liontix/grok-code-fast-1-200x](https://huggingface.co/datasets/Liontix/grok-code-fast-1-200x)
