# forever-ai/apeiron-1.1-preview

## Resumen

Apeiron 1.1 Preview es un modelo de lenguaje conversacional desarrollado por Forever AI (anteriormente Klox AI) mediante fine-tuning sobre Qwen3.5-9B. No se trata de una arquitectura propia: el equipo parte de los pesos de Qwen3.5-9B y realiza entrenamiento adicional para dotar al modelo de una identidad definida (Apeiron 1.1, sucesor de Apeiron 1.0, dentro de la familia "Ape's"), adaptación lingüística ruso-inglés, comportamiento conversacional orientado a tono profesional y patrones de uso de herramientas.

El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B) y se distribuye bajo licencia MIT, con pesos en safetensors y cuantizaciones GGUF listas para llama.cpp, Ollama y LM Studio. El repositorio ocupa 15,5 GB e incluye además el dataset de entrenamiento (`forever-ai/apeiron-1.1-preview-set`) y un `Modelfile` para Ollama.

Su relevancia es limitada pero concreta: es un ejemplo de fine-tuning ligero sobre un modelo base reciente, con soporte nativo de tool calling en formato propietario (`<tool_call>` / `<tool_response>`) y un enfoque explícito en la coherencia de identidad y el cambio de idioma. La model card advierte que se trata de una versión preview y que el conocimiento factual procede casi íntegramente del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, heredada de Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (5,24 GiB), Q8_0 (8,87 GiB); safetensors en fp16 |
| Idiomas soportados | ruso (ru), inglés (en); la model card indica adaptación a otros idiomas no especificados |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-9B, un transformer causal decoder-only estándar; Forever AI no modifica la arquitectura ni publica detalles sobre número de capas, dimensión oculta o mecanismo de atención. El entrenamiento consiste en fine-tuning supervisado sobre el modelo base, centrado en cuatro ejes declarados: identidad y personalidad del modelo, adaptación al ruso y al inglés, seguimiento de instrucciones y comportamiento conversacional, y patrones de uso de herramientas orientados a agentes.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el conocimiento factual se hereda de Qwen3.5-9B y que el entrenamiento adicional se orienta al comportamiento más que a ampliar conocimiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional con tono conciso y orientado a negocio.
- Anclaje de identidad: reconoce ser Apeiron 1.1, recuerda a su predecesor Apeiron 1.0 y se identifica con la familia Ape's de Forever AI.
- Adaptación lingüística: responde en el idioma del usuario; probado en ruso e inglés. La model card indica que se corrigió el artefacto de versiones tempranas que añadía "Reply in Russian".
- Tool calling nativo en formato propietario `<tool_call>` / `<tool_response>`.
- Encadenamiento multi-paso de acciones (por ejemplo, búsqueda → lectura de página → respuesta).
- Herramientas probadas en vivo según el autor: búsqueda web (Bing), obtención de páginas por HTTP, calculadora, lectura de ficheros y consulta de hora.
- Seguimiento de instrucciones y conversación multi-turno.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistentes conversacionales con identidad de marca: el fine-tuning de identidad permite desplegar un asistente que se presenta de forma consistente como producto de una organización concreta, útil para demos y productos de cara al público.
- Agentes con tool calling en pipelines propios: el formato `<tool_call>` / `<tool_response>` permite integrar el modelo en un wrapper Python (el autor proporciona `apeiron_agent.py`) que ejecute búsquedas, cálculos o lecturas de ficheros y devuelva resultados al modelo.
- Automatización de tareas multi-paso: encadenar búsqueda web, lectura de la página resultante y síntesis de respuesta para flujos de investigación ligera o extracción de datos.
- Atención al cliente en ruso e inglés: el cambio automático de idioma y el tono profesional encajan en escenarios de soporte bilingüe, siempre que se validen previamente las respuestas por el riesgo de alucinación.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (5,24 GiB) y Q8_0 (8,87 GiB) permiten ejecución en llama.cpp, Ollama o LM Studio sin infraestructura GPU dedicada de gran escala.
- Base para experimentación en fine-tuning: al publicarse el dataset de entrenamiento y los pesos, sirve como punto de partida para equipos que quieran replicar o extender el proceso de adaptación sobre Qwen3.5-9B.
- Prototipado de asistentes con herramientas en entornos de desarrollo: integración en scripts y flujos internos donde se requiera consulta de hora, cálculo o lectura de ficheros locales.

## Benchmarks y rendimiento

Resultados publicados en la model card (no verificados de forma independiente):

| Benchmark | Gemma4-31B | Muse-Glimmer-30B | Qwen3.8-27B | Nanbeige4.3-33B | Apeiron 1.1 Preview |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 47,2 | 61,8 | 73,0 | 80,9 | 36,4 |
| Terminal-Bench 4.0 | 0,0 | 1,6 | 6,3 | 23,8 | 15,6 |
| DeepSWE | 2,7 | 4,4 | 42,5 | 65,5 | 35,8 |
| SWE-Atlas-QnA | 3,3 | 17,7 | 41,9 | 50,8 | 33,6 |
| NL2Repo | 33,7 | 27,4 | 48,3 | 53,0 | 40,3 |
| Automation | 9,7 | 15,2 | 38,3 | 54,2 | 31,5 |
| JobBench | 9,0 | 18,3 | 34,5 | 44,8 | 29,7 |
| Toolathlon-Verified | 27,8 | 47,2 | 68,5 | 70,4 | 41,3 |

Apeiron 1.1 Preview queda por debajo de todos los modelos comparados en Terminal-Bench 2.1, DeepSWE, SWE-Atlas-QnA, Automation, JobBench y Toolathlon-Verified, y solo supera a varios competidores en Terminal-Bench 4.0 y NL2Repo. Los modelos de referencia tienen entre 27B y 33B parámetros, por lo que la comparación no es de igual tamaño. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 18 GB para los pesos (9B × 2 bytes), más overhead de KV cache y activaciones; se recomienda GPU con 24 GB o más.
- VRAM estimada con Q8_0 (8,87 GiB de fichero): aproximadamente 10-11 GB en GPU, o ejecución en CPU con RAM suficiente.
- VRAM estimada con Q4_K_M (5,24 GiB de fichero): aproximadamente 6-7 GB en GPU; cabe en GPUs consumer de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo y concurrencia; RTX 4090 (24 GB) para fp16 en un solo usuario; RTX 3090/4080 (16-24 GB) para Q8_0; RTX 3060 12 GB o superiores para Q4_K_M.
- Cabe en GPU consumer: sí, con Q4_K_M en GPUs de 8 GB o más y con Q8_0 en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (incluye `Modelfile`), LM Studio, y Transformers con `AutoModelForCausalLM` en Python. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tool calling | Disponibilidad |
|---|---|---|---|---|---|
| Apeiron 1.1 Preview | ~9B | no disponible | MIT | Sí, formato propietario | HF: safetensors + GGUF |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible en la información | no disponible | HF |
| Gemma4-31B | 31B | no disponible | no disponible en la información | no disponible | Referenciado en benchmarks del autor |
| Qwen3.8-27B | 27B | no disponible | no disponible en la información | no disponible | Referenciado en benchmarks del autor |

La comparación más directa es con Qwen3.5-9B, del que Apeiron hereda arquitectura y conocimiento; las diferencias se limitan al comportamiento conversacional, identidad y tool calling. Frente a los modelos de 27-33B citados en los benchmarks, Apeiron tiene menos parámetros y rinde peor en la mayoría de las pruebas de agente y código. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos comparados más allá de lo indicado.

## Limitaciones y advertencias

- Versión preview: el propio autor la describe como un primer paso y advierte de que el rendimiento en contexto largo y la alineación de seguridad no se han evaluado por completo.
- Conocimiento heredado: el conocimiento factual procede de Qwen3.5-9B; el fine-tuning no amplía la base de conocimiento.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de tasa de alucinación; en tareas de agente y búsqueda conviene validar las respuestas.
- Herramientas en GGUF: las herramientas no se ejecutan dentro de los ficheros GGUF; requieren el wrapper Python externo `apeiron_agent.py`, lo que limita su uso directo en Ollama o LM Studio.
- Formato de tool calling propietario: la integración con frameworks estándar de agentes requerirá adaptación al formato `<tool_call>` / `<tool_response>`.
- Idiomas: solo se declaran ruso e inglés; el rendimiento en castellano no está documentado.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre el proceso de filtrado del dataset de entrenamiento.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero al derivar de Qwen3.5-9B conviene verificar las condiciones de la licencia del modelo base antes de un despliegue en producción.
- Comparaciones de benchmarks desfavorables: en la mayoría de pruebas de agente y código queda por debajo de modelos de 27-33B, por lo que no es adecuado para tareas de ingeniería de software exigentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/forever-ai/apeiron-1.1-preview
- Organización Forever AI en Hugging Face: https://huggingface.co/forever-ai
- Dataset de entrenamiento: https://huggingface.co/forever-ai/apeiron-1.1-preview-set
- Dataset de Apeiron 1.0: https://huggingface.co/forever-ai/datasets
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
