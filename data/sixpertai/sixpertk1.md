# SixpertAI/SixpertK1

## Resumen

Sixpert K1 es un modelo de lenguaje multimodal desarrollado por SixpertAI (Inyang David) y publicado en julio de 2026. Se distribuye en formato GGUF, orientado a ejecutores como Ollama, LM Studio, jan o KoboldCpp. Con aproximadamente 8.950 millones de parámetros, se posiciona como un modelo de clase 8B que compite, según su autor, con modelos de mayor tamaño en tareas de razonamiento, código y matemáticas.

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens, soporte nativo de function calling, capacidades de visión y un enfoque "uncensored" que elimina restricciones de contenido a nivel de modelo. Está diseñado para flujos de trabajo agénticos, análisis financiero y dominio técnico en ciberseguridad, biología y medicina clínica. Su licencia Apache-2.0 permite uso comercial sin restricciones, aunque el autor recomienda añadir capas de seguridad propias para despliegues orientados al usuario final.

La relevancia actual de Sixpert K1 radica en su combinación de tamaño contenido, contexto largo y capacidades multimodales, lo que lo hace atractivo para desarrolladores que buscan un modelo autocontenido en hardware de gama media con funcionalidades avanzadas de agente y tool use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SixpertForCausalLM) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (declarado por el autor) |
| Tipos de cuantizacion | Q4_K_M (5,68 GB) |
| Idiomas soportados | 100+ idiomas (declarado por el autor; no se detallan) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal multimodal con una clase personalizada `SixpertForCausalLM`. El modelo base es `sixpert/sixpert-k1-base`, y la versión publicada corresponde a cuantizaciones GGUF generadas con llama.cpp. No se han proporcionado detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni la metodología de alineación (RLHF, DPO, etc.). La model card menciona que el modelo fue "post-trained" para mejorar resultados en GPQA, lo que sugiere un ajuste posterior al entrenamiento base, pero sin especificar la técnica.

El modelo soporta entrada de visión (multimodal) y una ventana de contexto de 1M tokens, lo que implica algún mecanismo de atención extendida o procesamiento por ventanas, aunque no se detalla la implementación técnica. La cuantización Q4_K_M es la única disponible en el repositorio, lo que limita las opciones de despliegue en cuanto a precisión.

## Capacidades

- Razonamiento avanzado con cadena de pensamiento (chain-of-thought) para problemas complejos.
- Function calling nativo con salida estructurada para integración con herramientas externas.
- Flujos de trabajo agénticos: ejecución autónoma de tareas multi-paso.
- Entrada multimodal: comprensión de texto e imágenes (visión).
- Ventana de contexto larga: hasta 1M tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Generación, análisis y depuración de código.
- Soporte multilingüe para más de 100 idiomas (según el autor).
- Modo "uncensored": sin restricciones de contenido a nivel de modelo (requiere capa de seguridad externa).
- Dominio en trading y finanzas: análisis de mercado, generación de estrategias y razonamiento financiero.
- Experiencia en ciberseguridad, biología y medicina clínica (declarado por el autor).

## Casos de uso

- Atención al cliente automatizada: con 1M tokens de contexto, puede gestionar conversaciones multi-turno con historial extenso y mantener el estado del usuario sin pérdida de información relevante.
- Generación de código en producción: su soporte de function calling permite integrarlo en pipelines de CI/CD para autogenerar tests, documentación o parches, con salida estructurada que puede validarse automáticamente.
- Análisis financiero y trading algorítmico: puede procesar informes de mercado, noticias y datos históricos en contexto largo para generar señales de trading o resúmenes ejecutivos, aunque requiere verificación humana.
- Asistente de investigación multimodal: al aceptar imágenes, puede analizar gráficos, diagramas o capturas de pantalla junto con texto, útil en entornos de I+D.
- Agente autónomo de automatización de tareas: su capacidad agéntica permite encadenar llamadas a herramientas (APIs, bases de datos) para completar workflows complejos, como la extracción y transformación de datos.
- Chatbot sin censura para entornos controlados: aplicaciones de rol, escritura creativa o simulación donde se requiere libertad de contenido, siempre bajo una capa de moderación propia.
- Soporte técnico especializado en ciberseguridad: puede analizar logs, identificar patrones de ataque y sugerir mitigaciones, aunque sus respuestas deben validarse en entornos críticos.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, indicados como "verified real scores" de evaluaciones internas y de terceros:

| Benchmark | Sixpert K1 Score | Fuente |
|---|---|---|
| MMLU | 76,0% | Interna (Thinking Mode) |
| HumanEval | 78,0% | Competitivo clase 8B |
| MATH | 60,8% | Interna (Thinking Mode) |
| GPQA | 44,4% | Interna (Post-trained) |
| GSM8K | 90,2% | Interna (Thinking Mode) |
| MMLU-Redux | 88,8% | Evaluación de terceros |

Además, el autor compara estos resultados con modelos de mayor tamaño (GPT-5.4, Claude Opus 4.6, Gemini 3.1 Ultra, DeepSeek V4, Llama 4 Maverick) en MMLU y HumanEval, aunque no se detallan las condiciones de comparación ni si se utilizaron los mismos prompts o configuraciones. Estos datos deben interpretarse con cautela, ya que no se dispone de metodologías independientes verificables.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 5,68 GB, por lo que se necesita al menos 8 GB de RAM/VRAM para cargarlo en memoria. En GPU, una tarjeta con 8-12 GB de VRAM puede ejecutarlo cómodamente (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 3090).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Metal (Apple Silicon) y suficiente VRAM. No se especifican requisitos de GPU concretos por parte del autor.
- En consumer GPU: sí, cabe en GPUs de gama media con 8 GB o más de VRAM. También puede ejecutarse solo en CPU con 16 GB de RAM (aunque con mayor latencia).
- Opciones de despliegue: Ollama, LM Studio, jan, KoboldCpp, llama.cpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado datos oficiales. En una RTX 4090 se puede esperar una generación de 20-40 tokens/s con Q4_K_M, pero son estimaciones orientativas sin mediciones verificadas.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de la misma clase (8B) en la información proporcionada. La model card solo compara con modelos de mayor tamaño (GPT-5.4, Claude Opus 4.6, etc.), que no son comparables en recursos ni arquitectura. Para una evaluación justa, se necesitarían datos de modelos como Llama 3.1 8B, Mistral 7B o Gemma 2 9B, que no están incluidos en la documentación. Por tanto, la comparativa con alternativas de la misma categoría se considera no disponible.

## Limitaciones y advertencias

- Cada respuesta utiliza modo razonamiento, lo que incrementa el consumo de tokens generados y requiere un `max_new_tokens` generoso (se recomienda 2048).
- Puede alucinar identificadores o datos específicos en contextos críticos; es necesario verificar la información en aplicaciones de seguridad o precisión.
- Al ser "uncensored", el modelo no incorpora filtros de seguridad; cualquier despliegue orientado al usuario final debe añadir una capa de moderación externa.
- Solo se ofrece la cuantización Q4_K_M, lo que limita las opciones de precisión frente a otras cuantizaciones (Q8, F16).
- No se han publicado detalles sobre el dataset de entrenamiento, lo que dificulta evaluar sesgos o cobertura idiomática real.
- Los benchmarks reportados provienen del autor y carecen de validación independiente exhaustiva.
- El modelo base y el dataset asociado (`sixpert/sixpert-k1-dataset`) no están documentados públicamente en cuanto a composición o licencia de los datos.

## Enlaces

- [HuggingFace - SixpertAI/SixpertK1](https://huggingface.co/SixpertAI/SixpertK1)
- [Perfil de SixpertAI en HuggingFace](https://huggingface.co/SixpertAI)
- [Dataset sixpert/sixpert-k1-dataset](https://huggingface.co/datasets/sixpert/sixpert-k1-dataset)
