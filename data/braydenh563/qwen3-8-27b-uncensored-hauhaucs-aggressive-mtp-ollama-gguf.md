# braydenh563/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-Ollama-GGUF

## Resumen

El modelo `braydenh563/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-Ollama-GGUF` es una adaptación del modelo base Qwen/Qwen3.8-27B, desarrollado por la comunidad HauhauCS y publicado en HuggingFace por el usuario braydenh563. Se trata de una variante "uncensored" que aplica técnicas de abliteración para eliminar los comportamientos de rechazo del modelo original, ofreciendo respuestas directas sin preámbulos ni negativas. El sufijo "Aggressive" indica que el modelo está optimizado para ir directamente a la respuesta en prompts difíciles, con una tasa de rechazo de 0 sobre 465 pruebas reportadas.

El modelo conserva las capacidades multimodales del Qwen3.8-27B, incluyendo visión (imagen y vídeo), razonamiento, agente y generación de texto. Incorpora además el mecanismo de decodificación especulativa HauhauCS FastMTP, que acelera la generación hasta 3.02 veces en documentos largos y 1.93 veces en razonamiento en comparación con la generación sin MTP. Se distribuye en formato GGUF con múltiples cuantizaciones personalizadas K_P, lo que permite ejecutarlo en hardware diverso, desde GPUs de consumo hasta servidores profesionales. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 48 capas Gated DeltaNet y 16 capas gated-attention, con encoder de visión |
| Parametros totales | 27 mil millones (según model card; el archivo safetensors del repo muestra 1.863.907.840 parámetros, probablemente de un componente parcial) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Inglés, chino y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye un archivo safetensors para el proyector de visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso de 27 mil millones de parámetros con 64 capas, tamaño oculto de 5.120 y FFN de 17.408. La arquitectura combina 48 capas de Gated DeltaNet, un mecanismo de atención lineal recurrente eficiente para contextos largos, con 16 capas de atención gated tradicional. El vocabulario está ampliado a 248.320 tokens. El modelo incorpora de forma nativa la cabeza MTP (Multi-Token Prediction) o NextN, que permite predecir varios tokens a la vez.

La variante uncensored aplica una técnica de abliteración que elimina las direcciones de rechazo aprendidas durante el entrenamiento con RLHF/DPO del modelo original. El proceso, desarrollado por HauhauCS, utiliza un análisis basado en la divergencia KL y pruebas de rechazo con un juez automático. El resultado es un modelo que no muestra comportamiento de rechazo (0/465 refusals) y que en su variante "Aggressive" omite preámbulos de seguridad y va directamente a la respuesta. El entrenamiento de la variante no modifica los pesos del modelo base salvo en las direcciones de rechazo, preservando las capacidades originales de texto, visión, razonamiento y agente.

Además, se añade el sidecar HauhauCS FastMTP, un perfil de aceleración de decodificación especulativa que aprovecha la cabeza MTP nativa del modelo. Según la documentación, FastMTP consigue hasta un 3.02x de aumento en velocidad de generación para documentos y 1.93x para razonamiento, y un 35.2% y 21.1% más de velocidad que el MTP integrado estándar, respectivamente.

## Capacidades

- Generación de texto y razonamiento: responde a prompts complejos con razonamiento paso a paso, aunque en la variante Aggressive tiende a omitir preámbulos y dar la respuesta directamente.
- Comprensión de imágenes y vídeo: gracias al proyector de visión BF16 incluido, puede procesar entradas multimodales (imagen y vídeo) manteniendo las capacidades del modelo base.
- Soporte de tool calling y function calling: el modelo base Qwen3.8-27B incluye capacidades de llamada a herramientas, que se conservan en esta variante.
- Capacidades de agente: puede ejecutar tareas multi-paso y razonamiento secuencial, útil para flujos de trabajo autónomos.
- Decodificación especulativa: el mecanismo MTP nativo y el sidecar FastMTP aceleran la generación, especialmente en contextos largos.
- Multilingüe: soporta inglés, chino y otros idiomas, aunque el entrenamiento principal es en inglés y chino.
- Sin comportamiento de rechazo: responde a prompts que el modelo base rechazaría, incluyendo contenido sensible o controvertido.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) sin rechazar consultas incómodas, lo que permite manejar quejas o preguntas delicadas con respuestas directas y útiles.
- Generación de código en producción: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para autocompletar código, revisar PRs o generar documentación técnica, acelerado por FastMTP.
- Análisis de documentos extensos: su ventana de contexto de 262K tokens permite procesar libros, contratos o informes completos de una sola vez, con resúmenes y extracción de información sin segmentación.
- Agentes autónomos para tareas administrativas: puede actuar como agente que consulta APIs, ejecuta comandos y razona sobre resultados, gracias a sus capacidades de function calling y razonamiento multi-paso.
- Asistente de investigación académica: para investigadores que necesitan respuestas sin filtros sobre temas controvertidos o de nicho, el modelo ofrece información directa sin negativas, útil en brainstorming o exploración de hipótesis.
- Generación de contenido creativo sin restricciones: escritores y creadores pueden usarlo para generar narrativas, diálogos o guiones que aborden temas tabú o explícitos, con control sobre el tono y estilo.
- Procesamiento de imágenes y vídeo: con el proyector de visión, puede describir imágenes, responder preguntas sobre su contenido o transcribir información visual, útil en automatización de documentos escaneados o análisis de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante uncensored en la información disponible. El modelo base Qwen3.8-27B tiene resultados en MMLU, HumanEval, GSM8K y otros, pero no se proporcionan en la documentación de esta adaptación. Los únicos datos de rendimiento reportados son los relativos a la aceleración por MTP: hasta 3.02x de aumento en velocidad de generación para documentos y 1.93x para razonamiento, comparado con la generación sin MTP, y un 35.2% y 21.1% más de velocidad que el MTP estándar embebido.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: desde 10.32 GB (IQ2_M) hasta 31.46 GB (Q8_K_P). El proyector de visión añade 931 MB adicionales.
- GPUs recomendadas: para cuantizaciones Q4_K_P (17.92 GB) o inferiores, una RTX 4090 de 24 GB es suficiente. Para Q6_K_P (25.92 GB) se necesita una GPU con 32 GB o más, como A100 40GB o RTX A6000. Para Q8_K_P (31.46 GB) se requiere al menos 40 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q2, Q3, IQ2, IQ3 y Q4 caben en GPUs de 12-24 GB (RTX 3060, 4070, 4090).
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (compatible con GGUF), vLLM (según el artículo de MindStudio, aunque requiere conversión a formato compatible). También puede usarse con TGI si se convierte a safetensors.
- Latencia y throughput: no disponibles. Se espera que FastMTP mejore significativamente el throughput en contextos largos, pero no hay cifras concretas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (extensible a 1M) | Apache 2.0 | safetensors | Modelo original con alineación estándar, incluye rechazos |
| Huihui-Qwen3.8-27B-abliterated | 27B | 262K | Apache 2.0 | GGUF, safetensors | Variante uncensored mediante abliteración, soporta thinking mode y visión |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive (este) | 27B | 262K (extensible a 1M) | Apache 2.0 | GGUF | Variante uncensored "Aggressive" con FastMTP, sin rechazos y con aceleración especulativa |

Las diferencias principales frente al modelo base son la eliminación de rechazos y la inclusión de FastMTP. Frente a Huihui, la variante HauhauCS ofrece cuantizaciones personalizadas K_P y un perfil de aceleración adicional, aunque ambas comparten el mismo modelo subyacente.

## Limitaciones y advertencias

- Sesgos del modelo base: al ser una adaptación del Qwen3.8-27B, hereda los sesgos presentes en los datos de entrenamiento originales, que pueden manifestarse en respuestas sobre género, raza o cultura.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas especializados o cuando se le pide opinar sobre datos no verificados.
- Contenido inapropiado: al eliminar los rechazos, el modelo puede generar contenido explícito, violento o dañino si se le solicita. No debe usarse en entornos donde se requiera moderación de contenido.
- Limitaciones de idioma: aunque es multilingüe, su rendimiento es notablemente mejor en inglés y chino; otros idiomas pueden tener respuestas de menor calidad.
- Compatibilidad de cuantizaciones K_P: los archivos K_P pueden mostrarse como "?" en LM Studio, aunque funcionan correctamente. Es necesario usar runtimes compatibles con GGUF estándar.
- Requisitos de hardware para contexto máximo: aunque el contexto nativo es de 262K tokens, usarlo en su totalidad requiere una GPU con mucha VRAM (más de 80 GB en cuantizaciones bajas). Para contextos de 1M se necesita hardware especializado o técnicas de offloading.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede exponer a la organización a riesgos legales o de reputación.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/braydenh563/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-Ollama-GGUF
- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Artículo sobre abliteración de Qwen3.8-27B (MindStudio): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Noticia sobre Huihui-Qwen3.8-27B-abliterated (VGtimes): https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html
- Ficha en Interfaze.ai: https://interfaze.ai/models/hauhaucsqwen38-27b-uncensored-hauhaucs-aggressive-mtp-gguf
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
