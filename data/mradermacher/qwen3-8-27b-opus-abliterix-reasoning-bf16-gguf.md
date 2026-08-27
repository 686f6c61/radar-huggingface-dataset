# mradermacher/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16`, una versión modificada (abliterated) del modelo Qwen3.8-27B de Alibaba. El modelo base es un transformer denso de 27 000 millones de parámetros (28 000 millones contando el encoder de visión) con arquitectura híbrida de atención lineal Gated DeltaNet y atención completa, diseñado para razonamiento y tareas de visión-lenguaje. La versión abliterated elimina los mecanismos de rechazo de contenido, lo que lo convierte en un modelo sin censura para casos de uso donde se requiere máxima libertad de generación.

La cuantización a GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, con opciones desde 2 bits hasta 16 bits. El repositorio incluye también los proyectores multimodales (mmproj) en f16 y Q8_0 para habilitar la entrada de imágenes. Es una opción relevante para desarrolladores que buscan un modelo de razonamiento y visión de alto rendimiento con licencia Apache 2.0 y capaz de ejecutarse localmente en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa; encoder de visión ~1B |
| Parametros totales | 27 320 697 856 (27,32B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj en f16 y Q8_0 |
| Idiomas soportados | Inglés (según la model card; el modelo base Qwen3.8-27B soporta múltiples idiomas, pero esta versión declara solo `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida innovadora: 48 de sus 64 capas usan Gated DeltaNet, un mecanismo de atención lineal con compuertas que reduce el coste computacional en contextos largos, mientras que las 16 capas restantes usan atención completa (full attention) para preservar la capacidad de razonamiento profundo. El modelo tiene 64 capas, tamaño oculto de 5120 y un vocabulario de 248 320 tokens. Incluye un encoder de visión de aproximadamente 1 000 millones de parámetros para procesar imágenes.

El modelo original fue entrenado por Alibaba y publicado bajo Apache 2.0 en agosto de 2026. La versión `timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16` aplica la técnica de "abliteration" (abliterix), que elimina selectivamente las direcciones de características responsables del rechazo de contenido, resultando en un modelo sin restricciones de seguridad. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) de esta versión modificada.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) de alta calidad, comparable a modelos propietarios de gama alta en tareas de codificación y matemáticas según los benchmarks publicados por Alibaba.
- Comprensión de imágenes (vision-language): puede procesar entradas visuales y responder preguntas sobre ellas, gracias al encoder de visión y los proyectores multimodales incluidos.
- Soporte de contexto largo de hasta 262 144 tokens, adecuado para documentos extensos, análisis de código o conversaciones multi-turno con historial amplio.
- Capacidades multilingües del modelo base (aunque la model card de esta versión solo declara inglés, el modelo original soporta múltiples idiomas).
- Sin censura: al estar abliterated, no rechaza peticiones sobre temas sensibles, violencia, contenido adulto, etc. (útil para investigación o generación creativa sin restricciones).
- No se ha confirmado soporte explícito de tool calling o function calling en esta versión, aunque el modelo base Qwen3.8-27B podría heredarlo; no hay documentación al respecto en la información disponible.

## Casos de uso

- Generación de código en producción: el modelo destaca en tareas de programación (según benchmarks de Alibaba, se acerca a Claude Opus). Puede integrarse en pipelines de CI/CD para autocompletado, revisión de código o generación de tests, ejecutándose localmente con cuantización Q4_K_M en una GPU de 24 GB.
- Análisis de documentos extensos: con 262K de contexto, puede procesar libros completos, expedientes legales o repositorios de código enteros en una sola pasada, resumiendo o extrayendo información relevante.
- Asistente de razonamiento matemático y científico: su capacidad de razonamiento paso a paso lo hace útil para resolver problemas de matemáticas, física o ingeniería, con la ventaja de poder ejecutarse sin conexión.
- Aplicaciones de visión-lenguaje: al incluir el encoder de visión, puede describir imágenes, responder preguntas visuales o extraer texto de capturas, útil en sistemas de accesibilidad o automatización de documentos.
- Investigación en seguridad y alineación: al ser una versión abliterated, permite estudiar el comportamiento de modelos sin restricciones de seguridad, comparando respuestas con el modelo original para analizar sesgos y mecanismos de rechazo.
- Desarrollo de chatbots sin filtros: para entornos controlados donde se requiere libertad total de expresión (por ejemplo, juegos de rol, escritura creativa o simulación de personajes), sin las limitaciones habituales de los modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada y abliterated en la información disponible. El modelo base Qwen3.8-27B fue evaluado por Alibaba en tareas como MathVision y codificación, con resultados que lo sitúan cerca de Claude Opus en tareas de programación, pero no se proporcionan cifras concretas en las fuentes consultadas. Se recomienda consultar la página oficial del modelo base para obtener datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Con Q4_K_M (~16-17 GB), cabe en una GPU de 24 GB (RTX 3090/4090). Con Q8_0 (~29 GB), requiere una GPU de 32 GB o más (A6000, A100 40GB). La versión f16 (~54 GB) necesita múltiples GPUs o una GPU de 64 GB+.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4/Q5, A100 40/80 GB para Q8 o f16, H100 para máxima velocidad.
- Sí cabe en GPUs de consumo (RTX 3090/4090) con cuantizaciones de 4 bits o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF. Para el modelo base (safetensors) se puede usar vLLM o TGI.
- Latencia y throughput: no se dispone de datos medidos para esta versión. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens/s para modelos de 27B, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | safetensors | Modelo base con alineación estándar |
| Qwen3.8-27B-Opus-Abliterix (este) | 27B | 262K | Apache 2.0 | GGUF | Versión sin censura, cuantizada |
| Gemma 2 27B | 27B | 8K | Gemma license | safetensors/GGUF | Sin visión, contexto corto |
| Mistral Large 2 | 123B | 128K | Apache 2.0 | safetensors | Mucho mayor, requiere más hardware |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Al ser una versión abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No debe usarse en aplicaciones orientadas al público sin supervisión humana y filtros adicionales.
- La model card solo declara inglés como idioma soportado, aunque el modelo base es multilingüe; el rendimiento en otros idiomas puede ser inferior o no estar garantizado.
- No se ha verificado el soporte de tool calling o function calling en esta versión; si se necesita esa funcionalidad, conviene probar antes de integrarlo en producción.
- Las cuantizaciones de baja precisión (Q2_K, IQ4_XS) pueden degradar significativamente la calidad de razonamiento y la coherencia en tareas complejas.
- El modelo base tiene un contexto de 262K tokens, pero el uso efectivo de contextos muy largos requiere suficiente VRAM y puede ralentizar la inferencia; con cuantizaciones bajas, la atención en contextos largos puede sufrir pérdida de calidad.
- No hay garantías de que el proceso de abliteration haya eliminado todos los sesgos del modelo original; pueden persistir sesgos de género, raza o ideológicos.
- La licencia Apache 2.0 permite uso comercial, pero el carácter "uncensored" puede generar responsabilidades legales si se despliega en aplicaciones públicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16-GGUF
- Modelo base (BF16): https://huggingface.co/timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo sobre Qwen3.8-27B (ExplainX): https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Página de lanzamiento (LLM Releases): https://www.llm-releases.com/models/qwen3-8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
