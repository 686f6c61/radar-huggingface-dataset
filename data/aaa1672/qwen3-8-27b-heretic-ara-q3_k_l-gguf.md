# AAA1672/Qwen3.8-27B-heretic-ara-Q3_K_L-GGUF

## Resumen

El modelo `AAA1672/Qwen3.8-27B-heretic-ara-Q3_K_L-GGUF` es una conversión a formato GGUF de la variante "heretic-ara" del modelo Qwen3.8-27B, desarrollada por el usuario trohrbaugh y posteriormente cuantizada por AAA1672 mediante la herramienta GGUF-my-repo de llama.cpp. Esta variante aplica técnicas de "abliteration" (eliminación de capas de censura) para ofrecer una versión sin restricciones de contenido del modelo original de Qwen, manteniendo las capacidades multimodales y de razonamiento del base.

El modelo base, Qwen3.8-27B, es un transformer multimodal con 27.320 millones de parámetros, ventana de contexto de 256K tokens y capacidades de visión y texto. Esta cuantización Q3_K_L reduce el tamaño a aproximadamente 14,6 GB, lo que permite su ejecución en hardware de consumo con 16 GB de VRAM o incluso en CPU con suficiente RAM. Su licencia Apache 2.0 facilita su uso comercial y su reproducción.

La relevancia de este modelo radica en que combina el rendimiento de Qwen3.8-27B (razonamiento, código, visión) con la ausencia de filtros de contenido, lo que lo hace atractivo para escenarios de investigación o aplicaciones que requieren generación de texto sin restricciones, aunque con los riesgos éticos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + texto) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (según modelo base) |
| Tipos de cuantizacion | Q3_K_L (GGUF) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura multimodal, diseñado para procesar tanto texto como imágenes. Incorpora un codificador de visión que permite tareas de image-text-to-text, y ha sido entrenado con un enfoque en razonamiento, generación de código y capacidades de agente. El contexto de 256K tokens es uno de los más amplios en su categoría, facilitando el manejo de documentos largos y conversaciones extendidas.

La variante "heretic-ara" aplica técnicas de abliteration, que consisten en modificar o eliminar determinadas capas o pesos del modelo original para reducir o eliminar los mecanismos de censura y alineación impuestos durante el entrenamiento. Este proceso es reproducible y se documenta en el repositorio del autor original. No se dispone de detalles específicos sobre el dataset de entrenamiento o el proceso de fine-tuning de esta variante, más allá de que parte de los pesos del Qwen3.8-27B oficial.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Comprensión y generación de código en múltiples lenguajes de programación.
- Procesamiento de imágenes: el modelo acepta entradas de imagen y texto (pipeline image-text-to-text), permitiendo responder preguntas sobre imágenes, describir contenido visual, etc.
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de agentes y automatizaciones.
- Capacidad de razonamiento multi-paso y planificación, útil para tareas de agente.
- Multilingüismo: aunque no se especifican los idiomas exactos, el modelo base Qwen3.8 soporta un amplio conjunto de lenguas.
- Modo "uncensored" o "heretic": la abliteration elimina los filtros de contenido, permitiendo generar texto sobre temas que el modelo original rechazaría.

## Casos de uso

- Asistente de programación sin restricciones: el modelo puede generar código, explicar vulnerabilidades o discutir técnicas avanzadas sin filtros, útil para desarrolladores que necesitan explorar soluciones no convencionales o documentación de exploits en entornos controlados.
- Análisis de imágenes en entornos de investigación: al combinar visión y texto, puede describir imágenes médicas, de satélite o industriales, y responder preguntas sobre ellas, sin las limitaciones de contenido de otros modelos.
- Generación de contenido creativo para adultos: la ausencia de censura permite crear narrativas, guiones o material literario con temáticas maduras, siempre que se respeten las leyes locales.
- Automatización de atención al cliente con contexto largo: gracias a los 256K tokens de contexto, puede mantener conversaciones muy extensas con historial completo, gestionando consultas complejas y multi-turno.
- Desarrollo de agentes autónomos: su soporte de tool calling y razonamiento multi-paso lo hace adecuado para construir agentes que interactúan con APIs, bases de datos o navegadores, sin las restricciones típicas de modelos alineados.
- Investigación en seguridad informática: permite analizar código malicioso, generar payloads de prueba o documentar técnicas de ataque en entornos sandbox, donde la generación sin filtros es necesaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante heretic-ara en la información disponible. El modelo base Qwen3.8-27B reporta métricas competitivas en tareas de razonamiento, código y visión, pero no se dispone de cifras concretas en esta ficha. Se recomienda consultar la documentación oficial de Qwen para obtener datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q3_K_L ocupa 14,6 GB, por lo que se necesita al menos 16 GB de VRAM para cargar el modelo completo en GPU (por ejemplo, RTX 4080, RTX 4090, A100 40GB). Con cuantizaciones más bajas (Q2_K) cabría en 12 GB, pero esta versión concreta requiere 16 GB.
- GPU recomendadas: NVIDIA RTX 3080/3090/4080/4090, A100, H100; también funciona en GPUs AMD con ROCm (por ejemplo, Radeon RX 7900 XTX) gracias al soporte de llama.cpp.
- Ejecución en CPU: posible con 32 GB de RAM o más, aunque la velocidad será mucho menor. En Mac con Apple Silicon (M1 Pro/Max o superior) también es viable.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, vLLM (con adaptación a GGUF), y cualquier framework compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones específicas para esta cuantización. En una RTX 4090 se estiman velocidades de 20-40 tokens/s para modelos de 27B en Q3_K_L, pero son cifras orientativas basadas en modelos similares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | 256K | Apache 2.0 | Safetensors | Con censura y alineación estándar |
| AAA1672/Qwen3.8-27B-heretic-ara-Q3_K_L-GGUF | 27,3B | 256K | Apache 2.0 | GGUF | Variante sin censura, cuantizada |
| Llama 3.3 70B (GGUF) | 70B | 128K | Llama 3.3 | GGUF | Más grande, requiere más VRAM, con filtros |
| Mistral Large 2 (GGUF) | 123B | 128K | Apache 2.0 (con restricciones) | GGUF | Mucho más pesado, no multimodal |

La principal diferencia con el original es la eliminación de censura, mientras que el rendimiento técnico se mantiene prácticamente igual. Frente a modelos más grandes, este ofrece una relación calidad/recursos muy favorable, especialmente por su multimodalidad y contexto de 256K.

## Limitaciones y advertencias

- Al ser una versión "uncensored" o "heretic", el modelo puede generar contenido ofensivo, ilegal o éticamente cuestionable. El uso en producción debe contemplar políticas de moderación externas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados. La ausencia de alineación no reduce este riesgo.
- Limitaciones de idioma: aunque el base es multilingüe, la variante heretic-ara no documenta qué idiomas conserva plenamente; es probable que el rendimiento en lenguas minoritarias sea inferior.
- La cuantización Q3_K_L introduce pérdida de precisión respecto al modelo en FP16, lo que puede afectar a tareas de razonamiento matemático o código complejo.
- No se garantiza la reproducibilidad total del proceso de abliteration; el autor original proporciona detalles, pero la comunidad no ha validado exhaustivamente el resultado.
- Para uso comercial, la licencia Apache 2.0 permite el uso sin restricciones, pero el contenido generado puede violar normativas de plataformas o leyes de difamación, por lo que se recomienda supervisión humana.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/AAA1672/Qwen3.8-27B-heretic-ara-Q3_K_L-GGUF
- Modelo base original (trohrbaugh/Qwen3.8-27B-heretic-ara): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Documentación de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Blog de AMD sobre soporte de Qwen3.8: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
