# mradermacher/Qwen3.6-35B-A3B-heretic-v2-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-35B-A3B-heretic-v2-GGUF` es una cuantización en formato GGUF del modelo `trohrbaugh/Qwen3.6-35B-A3B-heretic-v2`, que a su vez es una versión modificada del modelo Qwen3.6-35B-A3B de Alibaba. La modificación aplica la técnica "Heretic" (implementación avanzada de ablación direccional, también conocida como abliteration) para eliminar automáticamente la alineación de seguridad del modelo original, resultando en una versión sin censura. El autor de la cuantización, mradermacher, es conocido por publicar conversiones GGUF de modelos populares para su uso en entornos locales con llama.cpp, Ollama u otros motores compatibles.

El modelo base Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token. Utiliza una arquitectura de atención híbrida (combinando atención estándar y atención lineal) similar a la familia Qwen3.5, diseñada para manejar contextos largos de manera eficiente. Esta cuantización GGUF permite ejecutar el modelo en hardware de consumo, aunque con las limitaciones propias de la reducción de precisión.

La relevancia de este modelo radica en su naturaleza "sin censura", lo que lo hace interesante para investigación en alineación, generación creativa sin restricciones y experimentación con técnicas de eliminación de sesgos. Sin embargo, su uso conlleva riesgos éticos y legales que deben considerarse cuidadosamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención estándar + atención lineal) |
| Parametros totales | 35B (35 mil millones) |
| Parametros activos | ~3B (3 mil millones) por token |
| Longitud de contexto | no disponible (se espera que herede la del modelo base, típicamente 128k o más, pero no confirmado) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 soporta múltiples idiomas, pero no se ha verificado en esta cuantización) |
| Licencia | no disponible en la ficha; el modelo base Qwen3.6-35B-A3B usa licencia tongyi-qianwen según el repositorio oficial, pero no se confirma para esta versión modificada |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer disperso (sparse MoE) con 35B parámetros totales y ~3B activos por token. Emplea una arquitectura de atención híbrida, combinando mecanismos de atención estándar (full attention) con atención lineal (linear attention) para optimizar el manejo de secuencias largas, reduciendo el coste computacional cuadrático típico de los transformers. Esta arquitectura es similar a la utilizada en la familia Qwen3.5 y está orientada a servir contextos extensos en producción.

La versión "heretic-v2" aplica la técnica Heretic, desarrollada por p-e-w, que combina ablación direccional (abliteration) con un optimizador de parámetros basado en TPE (Tree-structured Parzen Estimator) mediante Optuna. Este proceso elimina automáticamente la "alineación de seguridad" del modelo sin necesidad de post-entrenamiento costoso. El resultado es un modelo que no rechaza solicitudes consideradas inapropiadas o censurables, aunque conserva las capacidades lingüísticas y de razonamiento del original.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de la modificación heretic en esta versión específica. La cuantización GGUF realizada por mradermacher convierte los pesos del modelo a precisión reducida (desde f16 hasta Q2_K) para reducir el tamaño y permitir su ejecución en hardware con recursos limitados.

## Capacidades

- Generación de texto y razonamiento: al ser una versión del modelo Qwen3.6, se espera que mantenga capacidades de generación de texto coherente, razonamiento lógico y comprensión de instrucciones complejas, aunque la cuantización puede degradar ligeramente la calidad.
- Sin censura: la modificación heretic elimina los mecanismos de rechazo de contenido, permitiendo generar respuestas sobre temas que el modelo original bloquearía (violencia, sexualidad explícita, discurso ofensivo, etc.).
- Soporte de contexto largo: gracias a la arquitectura híbrida, el modelo base soporta ventanas de contexto extensas (probablemente 128k o más), aunque no se ha confirmado en esta cuantización.
- Capacidades multilingües: el modelo base Qwen3.6 soporta múltiples idiomas, pero no se ha verificado específicamente en esta versión.
- No se dispone de información confirmada sobre tool calling, function calling, capacidades de agente o modo de pensamiento (thinking mode) en esta cuantización.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar los efectos de la eliminación de la alineación de seguridad, comparando comportamientos con el modelo original y analizando sesgos residuales.
- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin que el modelo los rechace, útil para autores que necesitan explorar narrativas extremas.
- Desarrollo de aplicaciones de chatbot locales: al ser GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp u Ollama, permitiendo crear asistentes conversacionales personalizados sin depender de APIs externas.
- Experimentación con cuantización: los múltiples formatos de cuantización disponibles (Q2_K, Q4_K_M, Q8_0, etc.) permiten evaluar el equilibrio entre tamaño, velocidad y calidad de salida en diferentes hardware.
- Pruebas de estrés en moderación de contenido: al carecer de filtros, puede usarse para probar sistemas de moderación automática y detectar vulnerabilidades en pipelines de seguridad.
- Fine-tuning y adaptación: aunque es una cuantización, puede servir como base para experimentos de fine-tuning en entornos con recursos limitados, especialmente para tareas que requieren respuestas sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para esta cuantización específica ni para el modelo base modificado. Se recomienda consultar el repositorio del modelo base Qwen3.6-35B-A3B para obtener resultados de rendimiento del modelo original sin modificar.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (tamaño aproximado de 20-22 GB), se necesitan al menos 24 GB de VRAM en GPU. Para Q8_0 (tamaño aproximado de 35-38 GB), se requieren 40 GB o más. Las cuantizaciones más bajas (Q2_K, Q3_K) pueden caber en GPUs de 16 GB, pero con pérdida significativa de calidad.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M, A100 40GB o H100 para Q8_0. También puede ejecutarse en CPU con suficiente RAM (32 GB o más) usando llama.cpp.
- Si cabe en consumer GPU: sí, las variantes Q4_K_M y menores pueden ejecutarse en GPUs de gama alta de consumo (RTX 3090/4090). Las variantes Q8_0 requieren GPUs profesionales o de doble socket.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF limitado), TGI (con conversión previa).
- Latencia y throughput: no disponible. Depende del hardware, la cuantización y el número de tokens generados. Como referencia, un MoE con 3B activos suele generar entre 20-50 tokens/segundo en una RTX 4090 con Q4_K_M, pero no se ha medido en este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 128k (típico) | tongyi-qianwen | safetensors |
| Qwen3-30B-A3B (similar) | 30B | ~3B | 128k | tongyi-qianwen | safetensors/GGUF |
| DeepSeek-V3-Lite (similar) | 16B | ~2.4B | 128k | MIT | safetensors/GGUF |
| Este modelo (heretic-v2 GGUF) | 35B | ~3B | no disponible | no disponible | GGUF |

Nota: la comparativa se basa en características generales de modelos MoE de tamaño similar. No se dispone de datos de rendimiento comparativos para esta versión específica.

## Limitaciones y advertencias

- Contenido sin filtrar: al eliminar la alineación de seguridad, el modelo puede generar contenido violento, sexualmente explícito, ofensivo, ilegal o peligroso. Su uso en aplicaciones públicas o comerciales conlleva riesgos legales y éticos significativos.
- Sesgos y alucinaciones: el modelo base puede presentar sesgos sociales y alucinaciones, y la modificación heretic no los corrige. La cuantización adicional puede aumentar la frecuencia de errores factuales.
- Licencia incierta: la licencia no está especificada en la ficha. El modelo base usa tongyi-qianwen, que permite uso comercial con restricciones, pero la modificación heretic podría violar los términos de uso originales. Se recomienda consultar con un asesor legal antes de cualquier uso comercial.
- Degradación por cuantización: las versiones de baja precisión (Q2_K, Q3_K) pueden mostrar incoherencias gramaticales, pérdida de razonamiento y respuestas truncadas.
- Sin soporte oficial: al ser un modelo modificado y cuantizado por terceros, no hay garantía de mantenimiento, corrección de errores o actualizaciones.
- Contexto no verificado: no se ha confirmado la longitud de contexto real en esta cuantización; puede ser inferior a la del modelo base si la conversión no preserva correctamente los parámetros de atención.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-heretic-v2-GGUF
- Modelo base (trohrbaugh): https://huggingface.co/trohrbaugh/Qwen3.6-35B-A3B-heretic-v2
- Modelo original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Modelo similar abliterated (mradermacher): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-abliterated-v2-i1-GGUF
- Documentación de vLLM Ascend para Qwen3.6-35B-A3B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.6-35B-A3B.html
