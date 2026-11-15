# Rayleihaodong/TransMem-Llama3.1-8B-D4

## Resumen

TransMem-Llama3.1-8B-D4 es un checkpoint de módulos de memoria del método TransMem, presentado en el artículo "TransMem: Transforming Hidden States into Memory for Large Language Models" (Lei et al., 2026). No se trata de un modelo de lenguaje completo ni de un adaptador PEFT al uso, sino de un conjunto de módulos auxiliares que se acoplan a un backbone congelado, en este caso meta-llama/Llama-3.1-8B-Instruct, para dotarlo de capacidad de memoria sobre contextos largos sin reentrenar el modelo base.

La propuesta técnica consiste en reutilizar estados ocultos dispersos calculados a partir de un contexto largo como memoria. Durante la decodificación de la respuesta, cuatro módulos de memoria independientes (uno por capa de inyección) transforman esos estados en actualizaciones residuales que se aplican en las capas 28 a 31 del backbone. Una puerta dinámica dependiente del token, con forma g = 2σ(z), controla la magnitud de cada actualización, y el backbone permanece completamente congelado.

El checkpoint añade 939,591 millones de parámetros entrenables sobre los 8.030 millones del backbone, un 11,70% adicional. Su relevancia radica en que aborda el problema del razonamiento sobre contextos largos con evidencia dispersa (HotpotQA, LoCoMo, MemoryAgentBench) mediante un mecanismo de memoria aprendido por autodestilación condicionada por evidencia, en lugar de ampliar la ventana de contexto nativa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone congelado (Llama-3.1-8B-Instruct) y cuatro módulos de memoria Transformer de una capa, inyectados en las capas 28–31 (D=4, Last-4) |
| Parametros totales | 8.030,261 M (backbone) + 939,591 M (módulos TransMem) = 8.969,852 M |
| Parametros activos | No aplica (no es MoE); 939,591 M entrenables, backbone congelado |
| Longitud de contexto | No disponible de forma explícita; los módulos no amplían la ventana nativa del backbone (8.192 tokens en Llama-3.1-8B-Instruct, dato del modelo base, no del checkpoint) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible para los módulos; el backbone queda sujeto a la licencia Llama 3.1 y su política de uso aceptable |
| Formato de pesos | best.pt (PyTorch state dict con configuración de módulos y puertas) |

## Arquitectura y entrenamiento

TransMem parte de un backbone Transformer congelado y le añade un conjunto de módulos de memoria independientes. Cada módulo es un Transformer de una sola capa que recibe estados ocultos dispersos, calculados a partir del contexto largo, y los transforma en actualizaciones residuales que se suman en capas seleccionadas del backbone. En esta configuración D=4, las capas de inyección son las 28, 29, 30 y 31 (indexación base cero), es decir, las cuatro últimas del backbone. Cada actualización se modula mediante una puerta escalar dependiente del token con forma g = 2σ(z), centrada en 1, que permite al modelo decidir cuánta información de memoria incorporar en cada paso de decodificación.

El entrenamiento emplea autodestilación condicionada por evidencia: un profesor ve únicamente la evidencia de soporte y la pregunta, mientras que un estudiante aumentado con memoria ve el contexto completo y aprende a igualar las predicciones del profesor. La configuración principal del artículo se entrena sobre HotpotQA y se evalúa en HotpotQA, LoCoMo y MemoryAgentBench. La memoria se organiza en N=4 segmentos. El recuento de parámetros añadidos (939.591 M) incluye los cuatro módulos, sus proyecciones de salida, los parámetros de normalización y las puertas dinámicas, y excluye el backbone congelado.

## Capacidades

- Generación de texto y respuesta a preguntas sobre contextos largos con evidencia dispersa, apoyándose en los estados ocultos almacenados como memoria.
- Razonamiento multi-hop: el diseño está orientado explícitamente a tareas como HotpotQA, donde la respuesta requiere combinar evidencia de varios pasajes.
- Memoria conversacional de largo alcance: evaluado en LoCoMo y MemoryAgentBench, orientados a mantener información a lo largo de interacciones extensas.
- Inyección selectiva y controlada: la puerta dependiente del token permite modular la contribución de la memoria en cada paso de generación.
- Capacidades heredadas del backbone Llama-3.1-8B-Instruct: instrucciones, código, matemáticas básicas y tool calling en la medida en que el backbone las soporte.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Preguntas sobre documentación técnica extensa: el modelo puede reutilizar estados ocultos de un contexto largo como memoria y responder preguntas que requieren localizar y combinar información de varios fragmentos, aprovechando el mecanismo de memoria dispersa entrenado sobre HotpotQA.
- Asistentes de investigación con corpus de evidencia: en flujos donde el usuario aporta varios documentos y formula preguntas de seguimiento, los módulos de memoria permiten mantener la evidencia relevante sin recalcular todo el contexto en cada turno.
- Análisis de conversaciones largas: para tareas de resumen o extracción de información en diálogos extensos, el checkpoint está evaluado en LoCoMo y MemoryAgentBench, que miden precisamente la retención de información a lo largo de interacciones.
- Sistemas de memoria para agentes: el mecanismo de inyección residual en cuatro capas puede integrarse como componente de memoria en pipelines de agentes que necesitan recordar observaciones previas, siempre usando el código nativo de TransMem.
- Investigación académica sobre memoria en LLM: el checkpoint sirve como referencia reproducible para comparar estrategias de memoria frente a baselines, con protocolos de evaluación publicados en el repositorio oficial.
- Evaluación de arquitecturas de inyección: al ser un módulo desacoplado del backbone, permite estudiar el efecto de la profundidad de inyección (D=4) y del número de segmentos (N=4) en tareas de razonamiento multi-hop.
- Prototipado de asistentes documentales en inglés: para demos y pruebas de concepto donde se requiera responder sobre un contexto largo en inglés, con la advertencia de que el checkpoint no es un modelo autónomo y requiere el backbone y el código oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 1–2 del manuscrito en OpenReview y al repositorio oficial para los resultados por backbone y los protocolos reproducibles, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone Llama-3.1-8B-Instruct en precisión nativa (bf16/fp16) requiere aproximadamente 16 GB solo para pesos; sumando los módulos TransMem (939,591 M parámetros) se añaden cerca de 1,9 GB en bf16, más activaciones y caché KV del contexto largo.
- En cuantización de 8 bits, el backbone ronda los 8 GB y los módulos cerca de 1 GB; en 4 bits, alrededor de 4–5 GB para el backbone y 0,5 GB para los módulos, aunque no se declaran cuantizaciones oficiales del checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación con contextos largos y precisión completa; RTX 4090 (24 GB) es viable en bf16 para el backbone con contextos moderados; GPUs consumer de 16 GB o más pueden funcionar con cuantización del backbone.
- El código oficial recomienda un entorno PyTorch con CUDA y usa `attn-impl sdpa`.
- Opciones de despliegue: no se declaran integraciones con vLLM, llama.cpp, Ollama o TGI; la carga requiere el código nativo de TransMem y `best.pt`, ya que `AutoModelForCausalLM.from_pretrained` sobre este repositorio no es suficiente.
- Latencia y throughput: no disponibles. La model card advierte que el sobrecoste de parámetros no equivale al sobrecoste en tiempo de ejecución; el trabajo adicional lo determinan el cálculo de la memoria dispersa y la inyección en solo cuatro capas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TransMem-Llama3.1-8B-D4 | 8.030 M backbone + 939,591 M módulos | No amplía la ventana nativa del backbone | Memoria por estados ocultos inyectados en 4 capas | No disponible (backbone Llama 3.1) | Checkpoint de módulos en HF, requiere código oficial |
| Qwen3-4B + TransMem | 4.022,468 M + 429,958 M | No disponible | Misma metodología TransMem | Sujeta a licencia del backbone | Configuración del artículo |
| Qwen2.5-14B-Instruct + TransMem | 14.770,034 M + 1.205,945 M | No disponible | Misma metodología TransMem | Sujeta a licencia del backbone | Configuración del artículo |
| Llama-3.1-8B-Instruct (base) | 8.030,261 M | 8.192 tokens (modelo base) | Transformer decoder estándar | Llama 3.1 | Público en HF |

La comparación con otros mecanismos de memoria para contextos largos (por ejemplo, recuperación aumentada o extensión de contexto por RoPE scaling) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es un modelo autónomo ni un adaptador LoRA: contiene únicamente los módulos auxiliares y requiere descargar el backbone por separado y usar el código nativo de TransMem para cargar `best.pt`.
- No amplía la ventana de contexto nativa del backbone; la memoria se apoya en estados ocultos calculados sobre el contexto, no en una extensión de la atención.
- Hereda las limitaciones de generación de Llama-3.1-8B-Instruct y puede producir respuestas incorrectas.
- Idiomas: únicamente inglés declarado; el rendimiento en castellano u otros idiomas no está documentado.
- Licencia de los módulos no declarada en el repositorio; el backbone queda sujeto a la licencia Llama 3.1 y su política de uso aceptable, lo que condiciona el uso comercial.
- El código, los datasets y el artículo tienen licencias propias que deben consultarse por separado antes de su uso.
- Riesgo de alucinación no cuantificado en la información disponible; no se publican tasas de error ni evaluaciones de sesgo.
- Tracción mínima en Hugging Face (0 descargas, 1 like) y fecha de creación posterior a la mayoría de referencias públicas, lo que limita la validación independiente.
- El recuento de descargas y la ausencia de pipeline declarado indican que no existe una integración estándar con frameworks de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rayleihaodong/TransMem-Llama3.1-8B-D4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Artículo en OpenReview: https://openreview.net/forum?id=FmBT4enjqy
- Artículo en PDF: https://openreview.net/pdf?id=FmBT4enjqy
- arXiv: https://arxiv.org/abs/2607.29032
- Repositorio de código y evaluación: https://github.com/Haodong-Lei-Ray/TransMem
