# arissuga/aurum-brain-ai

## Resumen

Aurum Brain AI es un modelo de lenguaje fine-tuneado a partir de Qwen2.5-1.5B-Instruct, desarrollado por el usuario arissuga (probablemente en colaboración con el laboratorio aurum-lab). Está orientado a hablantes de indonesio y a tareas de programación, ofreciendo un asistente conversacional con capacidad de razonamiento y generación de código. El modelo se distribuye como pesos en formato safetensors y está pensado para ser usado mediante la API de inferencia de Hugging Face o integraciones locales.

El interés de este modelo reside en su tamaño reducido (1.543.714.304 parámetros) y su especialización en un idioma con poca representación en los modelos abiertos, lo que lo hace adecuado para aplicaciones ligeras, prototipos y entornos con recursos limitados. Sin embargo, la información pública disponible es escasa: no se documenta la licencia, no hay benchmarks publicados y el proceso de entrenamiento se describe de forma superficial (68+ conversaciones, 8 veces al día mediante GitHub Actions). Por tanto, su adopción en producción requiere una evaluación adicional por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | indonesio (etiqueta `id`), probablemente otros derivados del base, pero no se especifica |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo Qwen2.5-1.5B-Instruct, que pertenece a la familia Qwen2.5 de Alibaba. Qwen2.5 se basa en una arquitectura Transformer con atención causal, con 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens en su versión original. El fine-tune se realizó mediante LoRA con r=16 y alpha=32, lo que implica que se adaptaron solo los pesos de baja dimensión, manteniendo el modelo base congelado.

Según la información del autor, el entrenamiento se automatizó con GitHub Actions, ejecutándose 8 veces al día sobre un dataset de más de 68 conversaciones en indonesio. No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado sobre datos de diálogo y código. No se han publicado detalles sobre la composición exacta del dataset, el número total de tokens de entrenamiento ni la duración del proceso.

## Capacidades

- Generación de texto conversacional en indonesio natural, con un tono y personalidad configurable mediante un system prompt (se incluye un archivo `system_prompt.txt` en el repositorio).
- Asistencia en programación en múltiples lenguajes: Python, JavaScript, Rust, Go, SQL, entre otros.
- Desarrollo web: HTML, CSS, React, Next.js.
- Resolución de problemas y depuración de código.
- Capacidad de agente básica (se menciona "Agent AI capabilities", aunque no se detalla si soporta tool calling o ejecución de acciones externas).
- Multilingüismo limitado: la base Qwen2.5 es multilingüe, pero el fine-tune está orientado al indonesio; no hay garantía de buen rendimiento en otros idiomas.

## Casos de uso

- Asistente de desarrollo en indonesio: un programador puede consultar dudas de sintaxis, depurar fragmentos de código o generar funciones en Python, JavaScript o Rust, con respuestas en su idioma nativo.
- Chatbot de atención al cliente para empresas locales: el modelo puede mantener conversaciones de soporte en indonesio, reduciendo la barrera idiomática y el coste de implementación en entornos con poca potencia de cálculo.
- Prototipo de agente conversacional: su capacidad de conversación y su tamaño reducido lo hacen apto para experimentar con sistemas de diálogo multi-turno en aplicaciones de investigación o desarrollo rápido.
- Asistente de estudio o tutoría de programación: explicaciones y ejemplos de código en indonesio para estudiantes de informática.
- Generación de documentación técnica: escribir comentarios, resúmenes o documentación de código en indonesio, aprovechando su entrenamiento en código y lenguaje natural.
- Pruebas de integración en pipelines de CI/CD: al ser un modelo ligero, puede ejecutarse en CPUs o GPUs modestas para generar pruebas unitarias o respuestas de ejemplo en entornos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. Se recomienda realizar una evaluación independiente antes de usarlo en aplicaciones críticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32, el modelo ocupa aproximadamente 6 GB (1.500 millones de parámetros × 4 bytes). Con cuantización de 8 bits se reduce a unos 1,5 GB, y en 4 bits a menos de 1 GB.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente para inferencia en fp16 o cuantizada. Por ejemplo, NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), o incluso una GTX 1660 Super (6 GB) con cuantización.
- En consumer GPU: sí, cabe en la mayoría de tarjetas de consumo actuales, e incluso en CPUs con suficiente RAM (para inferencia lenta).
- Opciones de despliegue: al ser un modelo de la familia Qwen, puede usarse con `transformers` y `vLLM` (si se convierte a formato compatible), `llama.cpp` para GGUF, `Ollama` (si se exporta a GGUF) o la API de inferencia de Hugging Face. No hay archivos GGUF publicados en el repositorio, por lo que habría que convertirlos manualmente.
- Latencia y throughput: para un modelo de 1,5B en una GPU como una RTX 3090 o A100, se puede esperar una generación de 50-100 tokens por segundo en fp16. En CPU, la latencia sería mucho mayor (unos pocos tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Aurum Brain AI (este) | 1,5B | no disponible (base 32K) | no disponible | safetensors | indonesio, código |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | multilingüe, instruct |
| Gemma 2 2B | 2B | 8K | Gemma license | safetensors, GGUF | multilingüe |
| Phi-2 (2.7B) | 2,7B | 2048 | MIT | safetensors | razonamiento, código |

Comparación: el modelo base Qwen2.5-1.5B-Instruct tiene una licencia abierta (Apache 2.0) y una ventana de contexto de 32K, mientras que Aurum Brain AI no especifica licencia, lo que puede ser un problema para uso comercial. Gemma 2 y Phi-3 son modelos de tamaño similar, pero no están especializados en indonesio. En términos de rendimiento bruto, el modelo base Qwen2.5-1.5B-Instruct probablemente supere a este fine-tune en tareas generales, pero el fine-tune puede ser mejor en conversaciones en indonesio y código específico si el dataset de entrenamiento es de calidad.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo. Esto impide su uso en proyectos comerciales o públicos sin confirmar los derechos de uso. Se recomienda contactar con el autor.
- Sesgos lingüísticos: el modelo está entrenado con un dataset pequeño (68+ conversaciones), lo que puede provocar sesgos en el estilo de respuesta, repetición de frases o falta de generalización en temas no cubiertos.
- Riesgo de alucinación: como todos los modelos generativos, puede producir respuestas factualmente incorrectas, especialmente en áreas técnicas o científicas. No hay control de calidad documentado.
- Contexto limitado: aunque el modelo base soporta 32K tokens, el fine-tune puede no aprovecharlo completamente; no se ha verificado el contexto máximo en la práctica.
- Soporte de tool calling no documentado: no se confirma que el modelo funcione con funciones o llamadas a herramientas, a pesar de la mención a "Agentic capabilities".
- Rendimiento en otros idiomas: el fine-tune está orientado al indonesio, por lo que su uso en español u otros idiomas puede dar resultados deficientes.
- Entrenamiento automático continuo: el autor indica que se reentrena 8 veces al día, lo que implica que los pesos pueden cambiar frecuentemente y no hay versiones estables documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arissuga/aurum-brain-ai
- Repositorio GitHub (aurum-lab): https://github.com/aurum-lab/aurum-brain-ai
- Página de releases del repositorio: https://github.com/aurum-lab/aurum-brain-ai/releases
