# namkua/qwen3-vl-8b-lora-SciVQA

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) del modelo multimodal Qwen3-VL-8B-Instruct, entrenado por el usuario namkua para responder preguntas de ciencia en inglés sobre imágenes (el conjunto de datos SciVQA). El adaptador se ha entrenado con la librería Unsloth, que acelera el entrenamiento de modelos Transformers, y está publicado bajo licencia Apache 2.0.

El modelo base, Qwen3-VL-8B-Instruct, es la versión densa de 8 mil millones de parámetros de la familia Qwen3-VL, que destaca por su percepción visual avanzada, razonamiento multimodal y soporte nativo de contextos intercalados de texto, imagen y video de hasta 256 000 tokens. Al ser un LoRA, el adaptador solo contiene las matrices de baja dimensión que modifican los pesos del modelo base, lo que permite un ajuste fino de bajo coste y un despliegue ligero sobre el modelo original.

La relevancia de este adaptador radica en su especialización: permite a un modelo multimodal generalista responder preguntas de tipo científico (diagramas, experimentos, gráficos) con una precisión mayor que el modelo base sin necesidad de reentrenar los 8 mil millones de parámetros. Es un ejemplo práctico de cómo adaptar modelos grandes a dominios concretos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje) del modelo base Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (el adaptador LoRA pesa 0,4 GB; el modelo base tiene 8B parámetros) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 256K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización se aplica al modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA para transformers) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado sobre el modelo base `unsloth/Qwen3-VL-8B-Instruct`, que a su vez es una versión optimizada por Unsloth del Qwen3-VL-8B-Instruct original. Qwen3-VL utiliza una arquitectura Transformer multimodal que combina un codificador de visión con un modelo de lenguaje denso, capaz de procesar imágenes, videos y texto de forma intercalada. El modelo base soporta hasta 256K tokens de contexto y es compatible con herramientas (function calling) y razonamiento agéntico.

El entrenamiento del LoRA se realizó con la librería Unsloth, que según la model card acelera el entrenamiento 2 veces respecto a métodos convencionales. El dataset SciVQA, específico para preguntas de ciencia con imágenes, no está detallado en la información disponible, por lo que se desconoce el número de ejemplos, la composición exacta y si se utilizó RLHF o DPO. El adaptador se ha entrenado con TRL (Transformers Reinforcement Learning), lo que sugiere que podría haberse usado un paso de optimización con feedback, aunque no hay confirmación.

## Capacidades

- Comprensión visual y razonamiento multimodal: hereda del modelo base la capacidad de interpretar imágenes, diagramas y gráficos, y de razonar sobre ellos en lenguaje natural.
- Generación de texto y respuestas a preguntas: especializado en el dominio científico (SciVQA), pero conserva las capacidades generales del base.
- Soporte de contextos largos: hasta 256K tokens intercalados de texto, imagen y video (capacidad del modelo base).
- Soporte de function calling y agentes: el modelo base Qwen3-VL-8B-Instruct es compatible con herramientas y flujos de agente; el adaptador no elimina esta capacidad, aunque no hay evidencia de que se haya optimizado para ello.
- Capacidades multilingües: el modelo base es multilingüe, pero este adaptador se ha entrenado únicamente con datos en inglés (idioma: en).
- No incluye capacidades de audio ni de generación de imágenes: solo procesamiento de entrada multimodal (imagen, video, texto) y salida de texto.

## Casos de uso

- Evaluación de preguntas de ciencia en educación: el adaptador puede usarse en plataformas de e-learning para responder preguntas de exámenes de física, química o biología que incluyan diagramas o imágenes, proporcionando explicaciones paso a paso.
- Asistente para investigación de laboratorio: dado un diagrama de un experimento o un gráfico de resultados, el modelo puede interpretarlo y sugerir conclusiones o pasos siguientes, integrado en un pipeline de documentación científica.
- Análisis de figuras en publicaciones científicas: puede extraer información de figuras de artículos (gráficos de barras, esquemas de flujo) y resumir su contenido en texto, útil para revisores o para resumir literatura.
- Tutoría personalizada en STEM: el modelo, con su contexto largo y su especialización en ciencia, puede mantener conversaciones multi-turno explicando conceptos a partir de imágenes, adaptándose al nivel del estudiante.
- Generación de preguntas de ciencia con imágenes: se puede invertir el flujo: dado un tema, el modelo genera preguntas de tipo SciVQA junto con la imagen correspondiente, para crear bancos de preguntas.
- Integración en asistentes de laboratorio virtuales: desplegado con vLLM o TGI, el modelo puede servir como backend de un chatbot que analice capturas de pantalla o fotografías de instrumentos y responda a preguntas sobre protocolos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador LoRA en la información disponible. No se puede confirmar una mejora cuantitativa sobre el modelo base en SciVQA ni compararlo con otros adaptadores similares. Se recomienda evaluar el adaptador en el conjunto de datos SciVQA de referencia antes de su uso en producción.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,4 GB de pesos), pero requiere cargar el modelo base Qwen3-VL-8B-Instruct, que es el que consume VRAM.
- Para el modelo base de 8B en precisión completa (FP16), se necesitan aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (GPTQ/AWQ), se reduce a unos 6-8 GB, lo que permite ejecutarlo en una GPU de consumo como la RTX 4090 (24 GB) o la RTX 4060 Ti (16 GB).
- Para despliegue en producción, se recomienda vLLM o TGI (Text Generation Inference), que soportan LoRA en tiempo de ejecución y permiten servir el adaptador sin recompilar el modelo.
- En entornos de investigación con una A100 de 40 GB o H100 de 80 GB se puede ejecutar el modelo base en FP16 con el LoRA activo sin problemas, con una latencia estimada de 20-50 ms por token para generación de texto.
- Para uso en CPU, se puede compilar el modelo en GGUF con llama.cpp, pero la velocidad de inferencia será baja (del orden de 1-5 tokens por segundo) y no se recomienda para aplicaciones interactivas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8B densos | 256K | Apache 2.0 | HuggingFace |
| Qwen3-VL-32B-Instruct | 32B densos | 256K | Apache 2.0 | HuggingFace |
| Qwen3-VL-30B-A3B (MoE) | 30B totales, 3B activos | 256K | Apache 2.0 | HuggingFace |
| LoRA namkua/qwen3-vl-8b-lora-sciVQA | adaptador 0,4 GB sobre 8B | 256K | Apache 2.0 | HuggingFace |

No hay datos de rendimiento comparativo con estos modelos sobre SciVQA. El adaptador ofrece la ventaja de ser ligero y de especializarse en el dominio científico, pero el rendimiento depende de la calidad del conjunto de datos de entrenamiento, no documentado.

## Limitaciones y advertencias

- Dominio limitado: el adaptador se ha entrenado para preguntas de ciencia en inglés; puede degradar su rendimiento en otras tareas o idiomas respecto al modelo base.
- Sesgos del conjunto de datos: al no documentar la composición del dataset SciVQA, existe riesgo de sesgos en temas, niveles de dificultad o representación de ciertos tipos de imágenes (por ejemplo, sobre-representación de diagramas de física frente a biología).
- Riesgo de alucinación: como cualquier modelo de lenguaje multimodal, puede generar respuestas plausibles pero incorrectas cuando la imagen es ambigua o el contenido no está bien representado en el entrenamiento.
- Licencia y uso comercial: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base de Qwen, que también es Apache 2.0, sin restricciones adicionales conocidas.
- Rendimiento no verificado: sin benchmarks publicados, no se puede garantizar una mejora real sobre el modelo base; es necesario evaluar en el dominio objetivo.
- Soporte de herramientas: el adaptador no ha sido evaluado para function calling o agentes; es posible que el entrenamiento en SciVQA degrade ligeramente estas capacidades del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/namkua/qwen3-vl-8b-lora-SciVQA
- Repositorio del modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct
- Repositorio oficial Qwen3-VL (GitHub): https://github.com/QwenLM/Qwen3-VL
- Informe técnico de Qwen3-VL (arXiv): https://arxiv.org/abs/2511.21631
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Sitio web de Qwen: https://qwen.ai/home
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
