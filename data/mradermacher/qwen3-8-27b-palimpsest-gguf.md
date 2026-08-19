# mradermacher/Qwen3.8-27B-Palimpsest-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Palimpsest-GGUF` es una cuantización en formato GGUF del modelo base `xero0000/Qwen3.8-27B-Palimpsest`, preparada por mradermacher para su uso eficiente en entornos locales y de producción con motores como llama.cpp, Ollama o LM Studio. El modelo base pertenece a la familia Qwen3.8, un conjunto de modelos densos de 27 000 millones de parámetros con capacidades de visión-lenguaje, razonamiento configurable y una ventana de contexto nativa de 262 144 tokens. Esta versión cuantizada mantiene las capacidades del original (procesamiento de imágenes, tool calling, escritura creativa y tareas de agente) a costa de una ligera pérdida de precisión según el nivel de cuantización elegido.

La relevancia de esta ficha radica en que ofrece una alternativa accesible para ejecutar un modelo de 27B en hardware de consumo, con múltiples opciones de cuantización que van desde 11 GB hasta 29 GB. Al estar bajo licencia Apache-2.0, permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para desarrolladores que necesitan desplegar un asistente multimodal con contexto largo sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna específica del modelo base `Qwen3.8-27B-Palimpsest`. Según los datos públicos de la familia Qwen3.8, se trata de un modelo denso (no MoE) de 27 000 millones de parámetros, diseñado para tareas de visión-lenguaje, con una ventana de contexto de 262 144 tokens. El nombre "Palimpsest" sugiere un posible fine-tuning o adaptación del modelo original, pero no se han publicado detalles sobre el proceso de entrenamiento, el dataset utilizado ni las técnicas de alineación (RLHF, DPO, etc.). La cuantización GGUF realizada por mradermacher es de tipo estático, sin usar imatrix ni pesos ponderados, según se indica en la model card. No se proporciona información sobre el número de tokens de entrenamiento ni la composición del corpus.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte para tareas complejas de lógica y matemáticas.
- Procesamiento de imágenes (vision-language): el modelo acepta entradas multimodales, como lo confirman los archivos `mmproj` incluidos en la cuantización.
- Escritura creativa: etiquetado explícitamente como capaz de generar contenido literario, narrativo o publicitario.
- Tool calling y function calling: soporte para integración con herramientas externas, lo que permite construir agentes que interactúan con APIs o ejecutan acciones.
- Razonamiento configurable: según la documentación de Qwen3.8, el modelo permite activar o desactivar el modo de razonamiento explícito (similar a un "thinking mode").
- Contexto largo: ventana nativa de 262 144 tokens, adecuada para documentos extensos, conversaciones prolongadas o análisis de código de gran tamaño.
- Multilingüismo: aunque la model card declara solo inglés, la familia Qwen suele tener capacidades multilingües; no obstante, no se confirma para esta variante.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su contexto de 262K tokens y capacidad de visión, el modelo puede procesar informes anuales, contratos legales o manuales técnicos que incluyan tablas, gráficos y fotografías, extrayendo información relevante de forma estructurada.
- Asistente de programación con tool calling: integrado en un IDE o pipeline de CI/CD, el modelo puede generar código, explicar errores, sugerir refactorizaciones y ejecutar comandos a través de herramientas externas, acelerando el desarrollo.
- Atención al cliente automatizada: con su contexto largo y capacidad de mantener conversaciones multi-turno, puede gestionar incidencias complejas sin perder el hilo, incluso cuando el usuario adjunta capturas de pantalla o imágenes de error.
- Agente autónomo de investigación: combinando razonamiento configurable y tool calling, el modelo puede buscar información en la web, resumir artículos, comparar fuentes y redactar un informe final, todo dentro de una misma sesión.
- Generación de contenido creativo multimodal: para marketing o redacción, puede producir textos publicitarios, guiones o descripciones de producto a partir de imágenes de referencia, manteniendo un tono consistente.
- Análisis de código legacy: su contexto de 262K tokens permite cargar repositorios completos de tamaño medio y responder preguntas sobre arquitectura, dependencias o posibles vulnerabilidades, sin necesidad de dividir el código en fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repo GGUF no incluye métricas de rendimiento, y el modelo base `xero0000/Qwen3.8-27B-Palimpsest` tampoco ofrece datos comparativos en su documentación pública. Por tanto, no es posible presentar una tabla de resultados objetivos (MMLU, HumanEval, GSM8K, etc.) en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, se necesitan aproximadamente:
  - Q2_K (11.0 GB): cabe en GPUs de 12 GB (p. ej., RTX 3060, RTX 4070).
  - Q4_K_M (16.9 GB): requiere al menos 20 GB de VRAM (RTX 4080, RTX 4090, A6000).
  - Q8_0 (29.1 GB): necesita 32 GB o más (A100 40GB, H100, o múltiples GPUs).
- GPU recomendadas: para las cuantizaciones más bajas (Q2_K a Q4_K_S) es viable en GPUs de consumo como RTX 3090/4090 (24 GB). Para Q5_K_M o superiores, se recomiendan GPUs profesionales (A100, H100) o configuraciones multi-GPU.
- En Mac: las versiones con 24 GB de RAM unificada pueden ejecutar cómodamente Q4_K_M, como se menciona en la guía de modelfit.io.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no se dispone de mediciones específicas para este modelo. Como referencia, un modelo de 27B en Q4_K_M suele generar entre 20 y 40 tokens por segundo en una RTX 4090, pero estos valores son orientativos y dependen del backend y del tamaño del contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo concreto. Sin embargo, se puede contextualizar frente a otras alternativas de la misma categoría (modelos densos de ~27B con visión y contexto largo):

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Sí | Apache-2.0 | HuggingFace |
| Qwen2.5-32B | 32B | 128K | No (solo texto) | Apache-2.0 | HuggingFace |
| Llama-3.1-8B | 8B | 128K | No | Llama 3.1 | HuggingFace |
| Mistral-7B | 7B | 32K | No | Apache-2.0 | HuggingFace |

La comparativa es limitada porque no se han publicado benchmarks del modelo Palimpsest. En términos de arquitectura, el modelo es más grande que Llama-3.1-8B y Mistral-7B, pero menor que Qwen2.5-32B. Su ventaja principal es el contexto nativo de 262K tokens y la capacidad de visión, que no está presente en los otros modelos de la tabla.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo base. Al ser una cuantización, puede heredar sesgos del modelo original, pero no hay estudios públicos al respecto.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- La cuantización introduce pérdida de precisión. Las versiones Q2_K y Q3_K pueden degradar significativamente la calidad de salida, especialmente en tareas de razonamiento o matemáticas. Se recomienda usar Q4_K_M o superior para producción.
- El modelo solo declara soporte para inglés. Aunque la familia Qwen suele tener capacidades multilingües, no se garantiza un rendimiento óptimo en otros idiomas.
- El contexto de 262K tokens es nativo, pero el uso de ventanas muy largas incrementa el consumo de memoria y puede ralentizar la inferencia. En GPUs de consumo, es recomendable limitar el contexto a 32K-64K tokens.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar que el modelo base no tenga restricciones adicionales (aunque no se indican en la documentación).
- Los archivos GGUF son estáticos y no incluyen cuantización con imatrix, lo que puede afectar a la calidad en niveles bajos de cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Palimpsest-GGUF
- Modelo base: https://huggingface.co/xero0000/Qwen3.8-27B-Palimpsest
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía para ejecutar Qwen3.8-27B localmente: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Anuncio de Qwen 3.8-Max (familia Qwen3.8): https://openlm.ai/qwen3.8/
- Repositorio GGUF de otra variante (Qwen3.8-27B-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-GGUF
