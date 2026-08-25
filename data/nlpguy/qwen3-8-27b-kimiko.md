# nlpguy/Qwen3.8-27B-Kimiko

## Resumen

Qwen3.8-27B-Kimiko es un modelo de lenguaje multimodal de 27 356 millones de parámetros, creado por el usuario nlpguy mediante una fusión (merge) de tres modelos base de la familia Qwen3.8-27B: el original de Alibaba (Qwen/Qwen3.8-27B), una variante llamada Kiwen1.1-27B y otra denominada Fimi-4. El resultado es un modelo denso de tipo vision-language (procesa imagen y texto) que hereda la arquitectura del Qwen3.8-27B original, incluida su ventana de contexto nativa de 262 000 tokens y su capacidad de razonamiento configurable.

El modelo se distribuye en formato safetensors con pesos en bfloat16 y ocupa 54,7 GB en el repositorio. Al tratarse de una fusión con el método Karcher Mean, no ha sido entrenado de forma específica para una tarea, sino que combina los pesos de los tres modelos base con el objetivo de mejorar el rendimiento general. Es relevante porque ofrece una alternativa comunitaria al Qwen3.8-27B oficial, con potenciales mejoras en tareas de razonamiento, código y comprensión multimodal, aunque carece de documentación oficial y de licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), basado en Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se ha construido mediante una fusión con mergekit usando el método Karcher Mean, que calcula la media geométrica de los tensores de los tres modelos base. La configuración YAML muestra que la fusión se aplica a tres bloques principales: el modelo de lenguaje completo (64 capas), el bloque visual (27 capas) y la capa inicial de embeddings. El resultado es un modelo que combina los pesos de Qwen/Qwen3.8-27B, beyoru/Kiwen1.1-27B y nlpguy/Qwen3.8-27B-Fimi-4, todos ellos variantes de la arquitectura Qwen3.8.

El modelo base Qwen3.8-27B es un LLM denso multimodal de 27B parámetros desarrollado por Alibaba, con arquitectura transformer y atención de ventana larga (262K tokens). No se ha realizado ningún entrenamiento adicional sobre el merge; las capacidades del modelo dependen enteramente de los tres modelos de origen y de la calidad de la fusión. No se dispone de información sobre el dataset de entrenamiento ni sobre técnicas de alineación (RLHF/DPO) aplicadas al modelo fusionado.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.8-27B para generar texto coherente, responder preguntas y realizar tareas de razonamiento lógico y matemático.
- Comprensión multimodal: al incluir el bloque visual (model.visual.blocks), el modelo procesa imágenes junto con texto, permitiendo tareas de captioning, respuesta a preguntas visuales y análisis de documentos.
- Razonamiento configurable: el modelo base soporta modos de razonamiento (thinking mode) que se pueden activar o desactivar según la tarea.
- Ventana de contexto larga: con 262K tokens, permite procesar documentos extensos, conversaciones multi-turno y contextos amplios.
- Soporte de tool calling y function calling: el modelo base está diseñado para integración con herramientas y APIs.
- Capacidades agénticas: apto para flujos de trabajo de agente de largo horizonte, como planificación y ejecución de tareas multi-paso.
- Capacidades multilingües: no se especifican idiomas concretos, pero el modelo base Qwen3.8-27B soporta múltiples idiomas, incluido el español, aunque con menor calidad que el inglés o el chino.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), lo que permite mantener el historial completo de una interacción sin truncamiento. Su capacidad de tool calling permite consultar bases de datos de clientes o sistemas de ticketing.
- **Análisis de documentos extensos**: su ventana de contexto permite procesar contratos, informes técnicos o libros completos en una sola pasada, extrayendo información clave y generando resúmenes.
- **Asistente de programación en producción**: el modelo base destaca en tareas de código. Puede integrarse en pipelines de CI/CD para generar tests, revisar pull requests o autocompletar código en IDEs mediante tool calling.
- **Agente de automatización de oficina**: con soporte para tool calling, puede interactuar con APIs de calendario, correo electrónico o hojas de cálculo para automatizar tareas administrativas.
- **Sistema de preguntas y respuestas sobre imágenes**: gracias a su componente visual, puede responder preguntas sobre imágenes médicas, diagramas o capturas de pantalla, útil en soporte técnico o educación.
- **Investigación académica**: su ventana de contexto larga permite analizar artículos científicos completos y razonar sobre ellos, ayudando en revisiones bibliográficas o síntesis de literatura.
- **Chatbot de dominio específico**: se puede ajustar (fine-tuning) con datos propios para crear un asistente especializado en un sector concreto (legal, financiero, sanitario), aprovechando su base de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo en la información disponible. El modelo base Qwen3.8-27B sí tiene resultados publicados en tareas como MathVision, pero estos no son directamente aplicables al merge, ya que la fusión puede alterar el rendimiento en cualquier dirección. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bfloat16 (54.7 GB), se necesitan al menos 60 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits, aproximadamente 28 GB; con 4 bits, unos 14 GB.
- **GPU recomendadas**: para bfloat16, una H100 (80 GB) o dos A100 (40 GB cada una). Para cuantización 8 bits, una RTX 4090 (24 GB) es suficiente. Para 4 bits, una RTX 3090 (24 GB) o inferior puede bastar.
- **¿Cabe en GPU de consumo?**: sí, con cuantización. Una RTX 4090 con 24 GB puede ejecutar el modelo en 8 bits, y una RTX 3090 con 24 GB en 4 bits.
- **Opciones de despliegue**: compatible con vLLM, TGI, llama.cpp y Ollama (si se convierten a GGUF). El repositorio incluye pesos en formato safetensors para transformers.
- **Latencia y throughput**: no disponible. Depende del hardware, la cuantización y el backend de inferencia. En una A100 80GB con bfloat16, se espera una velocidad de decodificación del orden de 20-40 tokens/s; con cuantización 4 bits en una RTX 4090, entre 10-25 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36B | 262K | Texto + visión | Apache 2.0 (según repo oficial) | Safetensors |
| Qwen3.8-27B-Kimiko | 27,36B | 262K | Texto + visión | No disponible | Safetensors |
| Gemma 2 27B | 27,34B | 8K | Texto | Gemma license | Safetensors |
| Llama 3.1 8B | 8B | 128K | Texto | Llama license | Safetensors |

La comparación directa con Gemma 2 27B y Llama 3.1 8B es orientativa: el primero tiene un contexto mucho más corto y no es multimodal; el segundo es más pequeño y con menor capacidad de razonamiento. No se dispone de datos de rendimiento comparativo para el modelo Kimiko.

## Limitaciones y advertencias

- **Licencia no disponible**: no se especifica ninguna licencia en la ficha de HuggingFace. Esto impide su uso comercial sin autorización explícita del autor, y genera incertidumbre legal para cualquier despliegue en producción.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto largo.
- **Degradación por merge**: la fusión de modelos mediante Karcher Mean puede degradar el rendimiento en tareas específicas respecto a los modelos base. No hay garantía de que el resultado sea mejor que Qwen3.8-27B original.
- **Sesgos heredados**: los modelos base pueden contener sesgos sociales, culturales o de género, que se mantienen en el merge.
- **Limitaciones de idioma**: aunque el modelo base soporta múltiples idiomas, el rendimiento en español u otros idiomas puede ser inferior al inglés, y no se ha documentado en este modelo.
- **Documentación incompleta**: no hay información sobre el dataset de entrenamiento, el proceso de alineación o los benchmarks del modelo fusionado, lo que dificulta su evaluación rigurosa.
- **Costo de despliegue**: el tamaño de 27B requiere hardware de gama alta para una inferencia eficiente, lo que puede ser prohibitivo para proyectos pequeños.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nlpguy/Qwen3.8-27B-Kimiko
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base beyoru/Kiwen1.1-27B: https://huggingface.co/beyoru/Kiwen1.1-27B
- Modelo base nlpguy/Qwen3.8-27B-Fimi-4: https://huggingface.co/nlpguy/Qwen3.8-27B-Fimi-4
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Qwen3.8-27B en lmstudio.ai: https://lmstudio.ai/models/qwen3.8
- Análisis técnico de Qwen3.8-27B en kie.ai: https://kie.ai/blog/qwen-3-8-27b-27b-dense-multimodal-local-model
