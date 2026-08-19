# empero-ai/Qwen3.8-9B

## Resumen

Qwen3.8-9B es un modelo de lenguaje causal de 9.650 millones de parámetros desarrollado por Empero, que destila el comportamiento de razonamiento de un profesor a escala frontera (Qwen3.8 2.4T A95B, un modelo MoE de 2,4 billones de parámetros con 95.000 millones activos) en la arquitectura densa de Qwen3.5-9B de Alibaba. El objetivo declarado es trasladar la cadena de pensamiento densa del profesor a un modelo que se pueda desplegar en una única GPU, manteniendo capacidades de razonamiento, matemáticas y código.

El modelo se entrenó mediante fine-tuning completo (no adaptadores) con aproximadamente 70.000 trazas del profesor, filtradas por calidad, que incluyen cadenas de pensamiento en matemáticas, código, razonamiento general, instrucciones y uso de herramientas. Hereda de su base una ventana de contexto nativa de 262.144 tokens y soporte nativo de function calling según la especificación Qwen3.5. Publicado bajo licencia Apache-2.0, es compatible con Transformers, vLLM y SGLang, aunque requiere kernels específicos para las capas de atención lineal.

La relevancia de este modelo radica en su enfoque de destilación off-policy: en lugar de generar razonamiento sintético propio, aprende directamente de las trazas de un profesor de escala masiva. Los benchmarks publicados muestran una mejora sustancial en MMLU (de 0,546 a 0,751 en extracción flexible) respecto a su base, aunque con una ligera caída en GSM8K. Es una opción interesante para quienes necesitan razonamiento de alta calidad en un paquete de 9B desplegable en hardware de consumo o profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated DeltaNet) y capas convolucionales causales (arquitectura Qwen3.5) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye safetensors en bf16; no se mencionan versiones GGUF, AWQ u otras) |
| Idiomas soportados | Inglés (según la model card; el comportamiento multilingüe de la base no fue evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.8-9B utiliza la arquitectura de Qwen3.5-9B, un transformer híbrido que combina capas de atención lineal basadas en Gated DeltaNet con capas convolucionales causales (causal_conv1d). Este diseño reduce el coste de atención cuadrático y permite manejar contextos largos de 262.144 tokens de forma eficiente. El modelo es denso: todos los parámetros se activan en cada forward.

El entrenamiento consistió en un fine-tuning completo (SFT) mediante destilación off-policy. El profesor, Qwen3.8 2.4T A95B, generó aproximadamente 70.000 trazas curadas que cubren matemáticas duras, programación competitiva, razonamiento general, seguimiento de instrucciones y uso de herramientas. Estas trazas fueron filtradas por calidad antes del entrenamiento. El estudiante no generó sus propios rollouts; aprendió directamente del estilo de razonamiento del profesor, que incluye bloques de pensamiento delimitados por etiquetas `thinking` y `response`. No se menciona el uso de RLHF, DPO u otras etapas posteriores.

## Capacidades

- Razonamiento con cadena de pensamiento densa: cada respuesta comienza con un bloque `thinking` aprendido de las trazas del profesor, lo que permite resolver problemas de varios pasos.
- Matemáticas y código: el peso de las trazas se centra deliberadamente en matemáticas avanzadas y programación competitiva, los dominios donde la destilación aporta más a esta escala.
- Function calling nativo: soporta la especificación de Qwen3.5 sin necesidad de wrappers ni fine-tunes específicos.
- Contexto largo nativo: 262.144 tokens, heredado de la base, útil para documentos extensos, repositorios de código o conversaciones multi-turno largas.
- Seguimiento de instrucciones: entrenado con trazas de instrucciones variadas, mantiene las capacidades conversacionales de la base.
- Capacidad de visión heredada: el modelo es la ruta de texto de una base vision-language, por lo que conserva los pesos de visión del original, aunque el fine-tune fue solo de texto y el comportamiento visual no fue evaluado.

## Casos de uso

- Razonamiento matemático en entornos educativos: el modelo puede resolver problemas de varios pasos (por ejemplo, el clásico problema del caracol en el pozo) mostrando su cadena de pensamiento. Adecuado para tutores automáticos o generación de explicaciones paso a paso, gracias a su entrenamiento específico en matemáticas.
- Generación de código con explicaciones: en un IDE o pipeline de CI/CD, el modelo puede generar soluciones a problemas de programación competitiva y explicar el razonamiento detrás de cada decisión, útil para documentación automática o code review asistido.
- Agentes con function calling: al soportar nativamente la especificación de Qwen3.5, puede integrarse en frameworks de agentes (por ejemplo, con vLLM o SGLang) para ejecutar herramientas externas, consultar APIs o interactuar con bases de datos en flujos multi-paso.
- Análisis de documentos largos: con 262.144 tokens de contexto, puede resumir, extraer información o responder preguntas sobre documentos extensos (informes, contratos, libros técnicos) sin necesidad de chunking agresivo.
- Asistente de razonamiento en investigación: para científicos e ingenieros que necesitan verificar hipótesis o explorar argumentos lógicos complejos, el modelo ofrece cadenas de pensamiento detalladas que pueden auditarse, algo útil en entornos donde la trazabilidad del razonamiento es crítica.
- Prototipado de chatbots especializados: dado su enfoque en instrucciones y razonamiento, sirve como base para chatbots de soporte técnico o atención al cliente en inglés, donde las respuestas requieren lógica y no solo recuperación de información.

## Benchmarks y rendimiento

La model card reporta resultados medidos con `lm-evaluation-harness` (backend HF) con configuraciones idénticas para la base y el estudiante. Ambos son modelos de razonamiento, evaluados con protocolos CoT (`gsm8k_cot`, `mmlu_flan_cot_zeroshot`). MMLU cubre los 57 subconjuntos (~1.700 preguntas). Muestreo: `temperature=0.6, top_p=0.95, top_k=20`.

| Tarea | Métrica | Qwen3.5-9B (base) | Qwen3.8-9B | Δ |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.885 | 0.870 | −0.015 |
| gsm8k_cot | exact_match (strict) | 0.875 | 0.850 | −0.025 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.546 | 0.751 | +0.205 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.251 | 0.511 | +0.260 |

No se han publicado resultados en otros benchmarks (HumanEval, GSM8K sin CoT, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa ~19,3 GB en bf16 (según el tamaño del repositorio). Con una ventana de contexto de 262.144 tokens, la memoria para el estado de atención lineal es menor que en transformers cuadráticos, pero aún se recomienda una GPU con al menos 24 GB para uso cómodo en bf16.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 40/80 GB, H100, o GPUs profesionales con 24 GB o más. Para despliegue en producción con concurrencia, se recomienda A100 o H100.
- En hardware de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16. No se dispone de cuantizaciones GGUF o AWQ publicadas, por lo que no se puede confirmar su funcionamiento en GPUs de 8-16 GB.
- Opciones de despliegue: Transformers (con kernels flash-linear-attention y causal_conv1d), vLLM, SGLang y otros runtimes compatibles con la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles en la documentación. Se espera que la atención lineal reduzca el coste en contextos largos frente a transformers cuadráticos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (CoT flexible) | GSM8K (CoT flexible) | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3.8-9B (este) | 9,65 B | 262.144 | 0.751 | 0.870 | Apache-2.0 |
| Qwen3.5-9B (base) | ~9 B | 262.144 | 0.546 | 0.885 | Apache-2.0 |
| Llama 3.1 8B | 8 B | 128.000 | no disponible en esta fuente | no disponible en esta fuente | Llama 3.1 (uso comercial permitido) |
| Mistral 7B v0.3 | 7 B | 32.000 | no disponible en esta fuente | no disponible en esta fuente | Apache-2.0 |

La comparación directa solo es posible con la base Qwen3.5-9B, ya que no se han publicado resultados de otros modelos en las mismas condiciones. La mejora en MMLU (+0,205) es notable, mientras que la caída en GSM8K (−0,015) es marginal. Frente a alternativas genéricas de 7-8B, este modelo ofrece un contexto mucho mayor y un enfoque específico en razonamiento, pero carece de datos comparativos en esta fuente.

## Limitaciones y advertencias

- Solo inglés: la model card indica `language: en`. Aunque la base podría tener capacidades multilingües, el fine-tune se realizó sobre trazas en inglés y no se evaluó el comportamiento en otros idiomas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios fuera de sus datos de entrenamiento. No se reportan tasas de alucinación.
- Sesgos no documentados: no se proporcionan evaluaciones de sesgo o toxicidad. El entrenamiento con trazas de un profesor específico puede heredar sesgos del profesor o del dataset de destilación.
- Dependencia de kernels: el uso de atención lineal requiere kernels CUDA específicos (`flash-linear-attention` y `causal_conv1d`). Sin ellos, el modelo cae en operaciones PyTorch lentas y con alto consumo de memoria, lo que puede hacer inviable la inferencia en contextos largos.
- Bucle de repetición en decodificación greedy: la model card advierte que la decodificación greedy en generaciones largas produce repeticiones. Es obligatorio usar muestreo con `temperature=0.6, top_p=0.95, top_k=20`.
- Salidas con bloques `thinking` largos: el modelo puede deliberar en exceso en preguntas fáciles, lo que aumenta la latencia y el coste. Se recomienda parsear y eliminar el bloque `thinking` para el usuario final.
- Visión no evaluada: aunque la base es vision-language, el fine-tune fue solo de texto y el comportamiento visual no fue probado. No se garantiza su funcionamiento con imágenes.
- Modelo en fase experimental: el repositorio tiene 0 descargas y 0 likes; se presenta "as-is" para investigación y experimentación. No hay garantías de estabilidad ni soporte a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-9B
- Sitio de Empero: https://empero.org
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- causal_conv1d: https://github.com/Dao-AILab/causal-conv1d
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
