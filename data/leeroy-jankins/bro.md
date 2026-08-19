# leeroy-jankins/bro

## Resumen

Bro es un modelo de lenguaje local de contexto largo basado en Gemma 3 4B, derivado de la versión cuantizada `unsloth/gemma-3-4b-it-GGUF` publicada por Unsloth. Lo desarrolla el usuario `leeroy-jankins` y está pensado para escenarios de recuperación de información, RAG e indexado de documentos donde se necesitan embeddings con prefijos de instrucción. El modelo hereda las capacidades multimodales de Gemma 3 (entrada de texto e imagen, salida de texto) y su ventana de contexto de 128K tokens, lo que lo hace adecuado para tareas que requieren procesar documentos extensos.

La relevancia de Bro radica en que combina un tamaño compacto (3,88 mil millones de parámetros) con una ventana de contexto muy amplia, lo que permite desplegarlo en hardware de consumo sin renunciar a tareas de recuperación de información a gran escala. Al estar basado en Gemma 3, mantiene el soporte multilingüe de más de 140 idiomas, aunque la model card declara explícitamente el inglés como idioma principal. Su licencia MIT facilita su uso comercial sin restricciones.

El modelo se distribuye en formato GGUF, lo que permite su ejecución con llama.cpp, Ollama y otros motores compatibles, y el repositorio incluye una interfaz Streamlit para demostración interactiva. Aunque no se publican benchmarks específicos de Bro, al ser un fine-tuning de Gemma 3 4B, hereda los resultados de la familia Gemma 3 en razonamiento, factuality y comprensión visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), con atención de ventana deslizante y atención global alternadas |
| Parametros totales | 3.880.263.168 (3,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (entrada), 8.192 tokens (salida) |
| Tipos de cuantizacion | GGUF (variantes no especificadas; se asume Q4_K_M, Q5_K_M, Q8_0, etc. por ser derivado de unsloth) |
| Idiomas soportados | en (declarado); Gemma 3 base soporta más de 140 idiomas |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

Bro se basa en la arquitectura Gemma 3 de Google, un transformer multimodal con 3,88 mil millones de parámetros. Gemma 3 emplea una combinación de atención con ventana deslizante y atención global, lo que permite manejar contextos de hasta 128K tokens con un coste computacional reducido. El modelo original fue entrenado con 4 billones de tokens (para la variante 4B) que incluyen documentos web en más de 140 idiomas, código, matemáticas e imágenes. El proceso de entrenamiento incluyó filtrado de contenido dañino (CSAM) y datos sensibles, así como técnicas de alineación por instrucciones (instruction tuning) para la variante `-it`.

Bro es un fine-tuning de la versión cuantizada de Unsloth, orientado específicamente a tareas de recuperación de información, RAG e indexado de documentos. La model card indica que está diseñado para escenarios donde se requieren "embeddings con prefijos de instrucción", lo que sugiere un ajuste para generar representaciones densas de texto que puedan usarse en sistemas de búsqueda semántica. No se detallan los datos de fine-tuning ni el método exacto (si se usó RLHF, DPO u otro), por lo que estos datos no están disponibles.

## Capacidades

- Generación de texto: responde a preguntas, resume documentos y mantiene conversaciones multi-turno.
- Comprensión de imágenes: entrada de imágenes normalizadas a 896x896 píxeles, codificadas en 256 tokens cada una, para tareas de análisis visual y extracción de datos.
- Razonamiento y factuality: hereda las capacidades de razonamiento de Gemma 3, evaluadas en benchmarks como MMLU y GSM8K (aunque no se publican resultados específicos de Bro).
- Recuperación de información y RAG: diseñado para indexado de documentos y búsqueda semántica con prefijos de instrucción.
- Soporte de contexto largo: ventana de 128K tokens, adecuada para procesar libros, informes o bases de conocimiento extensas.
- Multilingüismo: aunque la model card declara inglés, la base Gemma 3 soporta más de 140 idiomas; el fine-tuning puede haber reducido este soporte.
- Tool calling y function calling: no se menciona explícitamente en la model card, pero Gemma 3 4B IT soporta estas capacidades; no hay confirmación para Bro.

## Casos de uso

- Indexado y búsqueda semántica de documentos corporativos: Bro puede generar embeddings de párrafos o secciones de documentos largos (hasta 128K tokens) para construir índices vectoriales, permitiendo búsquedas por similitud en bases de conocimiento internas.
- Asistente de atención al cliente con contexto largo: el modelo puede gestionar conversaciones multi-turno manteniendo el historial completo de la interacción, gracias a su ventana de 128K tokens, sin perder información relevante de los primeros mensajes.
- Análisis de informes financieros o legales: procesa documentos extensos (contratos, memorias anuales) y extrae respuestas concretas a preguntas específicas, aprovechando su capacidad de razonamiento y comprensión de texto largo.
- Generación de resúmenes de libros o artículos científicos: con 128K tokens de contexto, puede resumir capítulos completos o papers extensos en un solo paso, manteniendo coherencia y detalles clave.
- Extracción de datos de imágenes en entornos con recursos limitados: al ser multimodal, puede leer capturas de pantalla, gráficos o documentos escaneados (normalizados a 896x896) y extraer información estructurada, ejecutable en GPUs de consumo.
- Prototipado de agentes RAG en local: gracias a su licencia MIT y formato GGUF, se puede integrar en pipelines de LangChain o LlamaIndex para construir asistentes de recuperación aumentada sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo Bro en la información disponible. La model card incluye una tabla de benchmarks de Gemma 3 (razonamiento y factuality), pero los datos están incompletos y no se atribuyen a Bro. Por tanto, no se pueden presentar cifras verificadas de MMLU, HumanEval, GSM8K u otros para este modelo concreto. Se recomienda consultar los benchmarks de Gemma 3 4B como referencia aproximada, asumiendo que el fine-tuning puede alterar ligeramente el rendimiento.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_M (típica en GGUF), el modelo ocupa aproximadamente 2,5-3 GB de memoria, por lo que cabe en GPUs con 4 GB o más. Con Q8_0, el uso sube a unos 4-5 GB.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o superiores. También puede ejecutarse en Apple Silicon (M1/M2/M3) con Metal.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama media e incluso en CPU con suficiente RAM (el modelo GGUF puede ejecutarse solo con CPU, aunque con mayor latencia).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptador GGUF), TGI (con conversión previa) y la interfaz Streamlit incluida en el repositorio.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 30-50 tokens/segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Bro (leeroy-jankins) | 3,88B | 128K | MIT | GGUF | RAG, indexado, multimodal |
| Gemma 3 4B IT (Google) | 4B | 128K | Gemma License | Safetensors, GGUF | Multimodal, instrucciones |
| Llama 3.2 3B (Meta) | 3,2B | 128K | Llama 3.2 License | Safetensors, GGUF | Texto, instrucciones |
| Qwen 2.5 4B (Alibaba) | 4B | 32K (128K con YaRN) | Apache 2.0 | Safetensors, GGUF | Texto, código, multilingüe |

Bro se diferencia de Gemma 3 4B original por su orientación específica a recuperación de información y su licencia MIT (más permisiva que la Gemma License). Frente a Llama 3.2 3B, Bro ofrece multimodalidad y mayor contexto nativo. Comparado con Qwen 2.5 4B, Bro destaca por su ventana de 128K y su capacidad de imagen, aunque Qwen tiene mejor soporte de código en algunos benchmarks. No se dispone de datos de rendimiento comparativo verificados.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Gemma 3, puede heredar sesgos presentes en los datos de entrenamiento originales (web, código, matemáticas), aunque Google aplicó filtrado de contenido dañino.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de recuperación donde el contexto es ambiguo.
- Limitaciones de idioma: la model card declara solo inglés; el soporte multilingüe de Gemma 3 puede haberse degradado tras el fine-tuning, por lo que no se recomienda usarlo en otros idiomas sin verificación.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base Gemma 3 tiene su propia licencia (Gemma License) que puede imponer condiciones; se debe verificar la compatibilidad.
- Limitaciones de contexto: aunque la ventana es de 128K, la salida está limitada a 8.192 tokens, lo que puede ser insuficiente para generar documentos muy largos.
- Producción: al ser un fine-tuning de un modelo cuantizado, puede haber pérdida de precisión respecto al modelo original; se recomienda evaluar en tareas específicas antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leeroy-jankins/bro
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-4b-it-GGUF
- Reporte técnico de Gemma 3: https://goo.gle/Gemma3Report
- Paper de Gemma 3 (arXiv): no disponible en la información proporcionada
- Interfaz Streamlit: incluida en el repositorio (assets/bro-demo.gif)
