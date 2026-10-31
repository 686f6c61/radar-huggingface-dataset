# Applied-Innovation-Center/Karnak-Th-41B-v1.0

## Resumen

Karnak-Th-41B v1.0 es un modelo de lenguaje bilingüe (árabe e inglés) de aproximadamente 41.000 millones de parámetros desarrollado por el Applied Innovation Center (AIC). Se construye sobre el modelo Qwen3.6-35B-A3B, al que se le aplica una extensión de profundidad (añadido de capas adicionales) seguida de un entrenamiento con datos curados y depurados de árabe, inglés y razonamiento. El resultado es un modelo MoE orientado a la generación de texto con seguimiento de instrucciones en ambos idiomas, con especial atención al árabe.

Su principal aportación es combinar la generación bilingüe y el razonamiento en un único checkpoint con dos modos de respuesta: modo *thinking* (con razonamiento intermedio antes de la respuesta final) y modo *non-thinking* (respuesta directa). Esta flexibilidad permite a las aplicaciones elegir cuánta generación dedicar a cada tarea, desde conversaciones cotidianas hasta problemas de varios pasos. Además, soporta function calling compatible con la API de OpenAI a través de vLLM, lo que facilita su integración en sistemas de agentes.

Es relevante ahora porque ofrece un modelo abierto bajo licencia Apache 2.0 con fuerte enfoque en árabe, un idioma históricamente desatendido por la mayoría de modelos open source, manteniendo capacidades de razonamiento y uso de herramientas. El repositorio pesa 85,4 GB en formato safetensors y está pensado para despliegue local en infraestructura propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen, con extensión de profundidad (depth extension) |
| Parámetros totales | 42.680.520.688 (dato real de safetensors; ~41B tras la extensión de profundidad según la model card) |
| Parámetros activos | no disponible (el modelo base es Qwen3.6-35B-A3B, cuya denominación sugiere ~3B activos por token, pero no está confirmado para este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos exportados en bfloat16; el tamaño del repo de 85,4 GB es coherente con bf16) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Karnak-Th-41B v1.0 parte del backbone Qwen3.6-35B-A3B, un modelo Mixture-of-Experts, y extiende su profundidad añadiendo capas al modelo, lo que eleva la capacidad del backbone hasta aproximadamente 41.000 millones de parámetros totales. El proceso de desarrollo se resume como: Qwen3.6-35B-A3B → extensión de profundidad → entrenamiento con datos curados de árabe, inglés y razonamiento → Karnak-Th-41B v1.0. La técnica de depth extension permite escalar el modelo en capacidad sin rediseñar la arquitectura base, aprovechando el conocimiento ya presente en el modelo original.

El entrenamiento se centra en respuestas bilingües, seguimiento de instrucciones y comportamiento de razonamiento en los dos modos disponibles (thinking y non-thinking). La model card destaca el uso de datos altamente curados y limpiados, aunque no especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. El checkpoint soporta la selección de modo mediante el parámetro `enable_thinking` de su chat template, y un reasoning parser separa el razonamiento de la respuesta final en las respuestas de la API. Se recomienda usar `presence_penalty=1.0` en ambos modos cuando el backend de inferencia lo soporte.

## Capacidades

- Generación de texto con seguimiento de instrucciones en árabe e inglés.
- Razonamiento en dos modos: *thinking* (genera razonamiento intermedio antes de la respuesta final, útil para preguntas de varios pasos y tareas analíticas) y *non-thinking* (respuesta directa sin sección de razonamiento explícita).
- Ambos modos disponibles en un único checkpoint, seleccionables mediante `enable_thinking=True/False` en el chat template.
- Tool calling / function calling estructurado compatible con la API de OpenAI a través de vLLM.
- Soporte para tareas conversacionales de varios turnos (pipeline de text-generation, formato conversacional).
- Capacidades de image-text-to-text: el tag de HuggingFace indica `image-text-to-text` y el código de carga contempla la clase `Qwen3_5MoeForConditionalGeneration` si el checkpoint incluye `vision_config`, aunque la model card no documenta capacidades visuales específicas.
- Despliegue local en infraestructura propia, con posibilidad de adaptación a flujos de trabajo específicos bajo su licencia.

## Casos de uso

- **Asistentes conversacionales bilingües árabe-inglés:** el modelo puede mantener conversaciones multi-turno cambiando de idioma según el usuario, con atención especial a la calidad del árabe, algo poco frecuente en modelos open source de este tamaño.
- **Razonamiento analítico multi-paso:** en modo thinking, el modelo genera razonamiento intermedio antes de la respuesta, adecuado para tareas que requieren descomposición del problema, como análisis de documentos o resolución de preguntas complejas.
- **Agentes con uso de herramientas:** el function calling compatible con OpenAI a través de vLLM permite integrar el modelo en pipelines de agentes que consulten APIs, bases de datos o ejecuten acciones definidas por la aplicación.
- **Traducción y reescritura árabe-inglés:** en modo non-thinking, el modelo genera respuestas directas sin sobrecoste de razonamiento, ideal para traducción, resumen y reescritura con baja latencia.
- **Despliegue on-premise en sectores regulados:** la licencia Apache 2.0 y el checkpoint descargable permiten alojar el modelo en infraestructura propia, útil para organizaciones que no pueden enviar datos a APIs externas.
- **Adaptación a dominios específicos:** al partir de un checkpoint abierto y bien definido, puede ajustarse posteriormente (fine-tuning) a vocabulario y tareas de dominios concretos como legal, médico o administrativo en árabe.
- **Optimización de costes de generación:** la posibilidad de alternar entre modo thinking y non-thinking permite asignar presupuesto de generación según la dificultad de la tarea, reduciendo latencia y coste en consultas simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 y un tamaño de repositorio de 85,4 GB, se necesita al menos ~86 GB de VRAM en FP16/BF16 sin cuantización (por ejemplo, 2x A100/H100 de 80 GB con tensor parallelism, o 4x GPU de 48 GB). Con cuantizaciones adicionales (no publicadas oficialmente) el requisito podría reducirse, pero no hay datos disponibles.
- GPUs recomendadas: no disponible de forma explícita; por tamaño, se requieren GPUs de datacenter (A100 80 GB, H100 80 GB) en configuración multi-GPU, o GPUs de consumo de gama alta solo si se aplican cuantizaciones no proporcionadas en el repo.
- Consumer GPU: no cabe en una única GPU de consumo con los pesos publicados en bf16; sería necesario esperar cuantizaciones de la comunidad (GGUF, AWQ, GPTQ), que no están disponibles en la información proporcionada.
- Opciones de despliegue: vLLM (recomendado por la model card, con soporte de function calling compatible con OpenAI), Hugging Face Transformers (con `transformers`, `torch` y `accelerate` actualizados y soporte para la arquitectura `qwen3_5_moe`), y `device_map="auto"` con accelerate para distribución en varias GPUs. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La model card advierte que el modo thinking requiere más tokens de salida y puede aumentar la latencia, por lo que recomienda asignar presupuesto de generación suficiente para razonamiento y respuesta final.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Idiomas principales | Licencia | Notas |
|---|---|---|---|---|---|
| Karnak-Th-41B v1.0 | ~41B (42,7B reales) | MoE con depth extension (base Qwen3.6-35B-A3B) | Árabe, inglés | Apache 2.0 | Modos thinking/non-thinking, function calling vía vLLM |
| Qwen3.6-35B-A3B (modelo base) | 35B | MoE | Multilingüe (incluye árabe e inglés) | no disponible en la información proporcionada | Backbone original sin extensión de profundidad ni especialización en árabe |
| Alternativas abiertas de ~40B con foco en árabe | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la model card no menciona modelos comparables explícitos ni publica benchmarks que permitan una comparación cuantitativa; la tabla se limita a los datos verificables del modelo y de su base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al tratarse de un modelo entrenado con datos curados de árabe e inglés cuya composición no se detalla, no es posible evaluar sesgos lingüísticos o culturales específicos.
- Riesgo de alucinación: no cuantificado. Como todo modelo de lenguaje generativo, puede producir contenido incorrecto; el modo thinking puede mitigar errores en tareas multi-paso, pero no elimina el riesgo.
- Limitaciones de idioma: el modelo está especializado en árabe e inglés; su rendimiento en otros idiomas no está evaluado ni garantizado.
- Longitud de contexto: no publicada, lo que dificulta planificar aplicaciones con documentos largos; conviene verificarla en la configuración del checkpoint antes de producción.
- Capacidades visuales ambiguas: el tag `image-text-to-text` y la posible presencia de `vision_config` sugieren soporte multimodal, pero la model card no documenta ni evalúa capacidades de visión; no deben asumirse sin prueba.
- Latencia en modo thinking: el razonamiento intermedio consume tokens adicionales y aumenta la latencia; hay que dimensionar el presupuesto de generación en consecuencia.
- Configuración recomendada: se aconseja `presence_penalty=1.0` en ambos modos; omitirla puede degradar la calidad de salida.
- Licencia: Apache 2.0 es permisiva y permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen3.6-35B-A3B, cuya licencia conviene revisar antes de despliegues comerciales.
- `inference: false` en la configuración: el modelo no está disponible para inferencia serverless en HuggingFace; requiere despliegue propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Applied-Innovation-Center/Karnak-Th-41B-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio de código: no disponible en la información proporcionada
