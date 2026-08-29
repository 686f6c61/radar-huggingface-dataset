# mradermacher/RIFA-FLASH-1.7B-GGUF

## Resumen

RIFA-FLASH-1.7B es un modelo de lenguaje de 1.720 millones de parámetros, desarrollado por smshahbaj como un fine-tuning con LoRA sobre un modelo base de la familia Qwen3. Está orientado a tareas conversacionales y de generación de código, con soporte específico para bengalí (bangla) e inglés, incluyendo el registro coloquial "banglish" (mezcla de bengalí e inglés). El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Esta ficha se centra en la versión cuantizada en formato GGUF publicada por mradermacher, que facilita la ejecución del modelo en hardware modesto, incluyendo CPU y GPUs de consumo. La cuantización estática ofrece múltiples niveles de compresión (desde Q2_K hasta f16), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria según el caso de uso. El modelo base no publica detalles sobre su longitud de contexto ni sobre los datos de entrenamiento, por lo que estos aspectos no están disponibles en la información actual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en), bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base RIFA-FLASH-1.7B es un fine-tuning con LoRA sobre un modelo de la familia Qwen3 de 1.7B de parámetros. Qwen3 emplea una arquitectura transformer decoder-only con atención causal estándar, aunque no se han publicado detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información disponible. El fine-tuning se realizó con el objetivo de mejorar el rendimiento en conversación multilingüe (bengalí e inglés) y en tareas de generación de código, probablemente mediante entrenamiento supervisado con instrucciones (instruction tuning). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión GGUF es una cuantización estática realizada por mradermacher, que convierte los pesos originales en formato safetensors a GGUF con diferentes niveles de precisión. No se han aplicado técnicas de imatrix (quantización con matriz de importancia) en esta versión; el autor ofrece una variante separada con imatrix en otro repositorio.

## Capacidades

- Generación de texto conversacional en inglés y bengalí, incluyendo el registro coloquial "banglish" (mezcla de ambos idiomas).
- Generación de código, aunque no se especifican los lenguajes de programación soportados ni el nivel de competencia.
- Fine-tuning con LoRA sobre Qwen3, lo que sugiere que hereda las capacidades generales de razonamiento y comprensión del modelo base, aunque no hay benchmarks que lo confirmen.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso explícito.
- No se ha documentado soporte para visión, audio u otras modalidades; es exclusivamente un modelo de texto.

## Casos de uso

- Asistente conversacional en bengalí: el modelo puede mantener diálogos multilingües en bengalí e inglés, útil para aplicaciones de atención al cliente o asistentes personales dirigidos a hablantes de bengalí en Bangladés o la India.
- Generación de código en entornos con recursos limitados: gracias a su tamaño compacto y a las cuantizaciones GGUF, puede ejecutarse en portátiles o dispositivos edge para autocompletar código o generar fragmentos en lenguajes populares, aunque no se ha verificado su rendimiento real.
- Traducción informal entre bengalí e inglés: el modelo puede ayudar a traducir texto coloquial o "banglish" en contextos informales, como redes sociales o mensajería.
- Prototipado rápido de chatbots: al ser un modelo pequeño y con licencia permisiva, es adecuado para experimentar con sistemas conversacionales en entornos de desarrollo sin necesidad de infraestructura costosa.
- Educación y aprendizaje de idiomas: puede utilizarse como herramienta de práctica conversacional para estudiantes de bengalí o inglés, generando respuestas contextualizadas.
- Procesamiento de texto en bengalí para análisis de sentimiento o clasificación: aunque no está específicamente entrenado para ello, su capacidad de comprensión del bengalí permite adaptarlo mediante fine-tuning adicional para tareas de NLP en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para el modelo base ni para la versión cuantizada. Tampoco se han encontrado comparativas con otros modelos de tamaño similar.

## Requisitos de hardware

- Los archivos GGUF varían en tamaño desde 0.9 GB (Q2_K) hasta 3.5 GB (f16). Para inferencia en GPU, se recomienda al menos 2 GB de VRAM para las cuantizaciones Q4_K_M o inferiores, y 4 GB para Q8_0 o f16.
- El modelo puede ejecutarse en GPUs de consumo como NVIDIA GTX 1650 (4 GB), RTX 3050 (8 GB) o superiores. También es viable en Apple Silicon con memoria unificada de 8 GB o más.
- En CPU, es posible ejecutar las cuantizaciones más pequeñas (Q2_K, Q3_K) con llama.cpp, aunque la velocidad será limitada. Para uso interactivo se recomienda al menos un procesador moderno de 8 núcleos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runners compatibles con GGUF. No se recomienda vLLM para este formato, ya que vLLM no soporta GGUF directamente; se necesitaría convertir a safetensors.
- La latencia estimada en GPU con Q4_K_M en una RTX 3060 sería del orden de 20-40 tokens por segundo, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. En términos de tamaño, RIFA-FLASH-1.7B se sitúa en la gama de modelos de 1-2B de parámetros, como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B. Sin embargo, no hay información pública sobre cómo se compara en calidad de generación, razonamiento o código. La principal diferenciación de RIFA-FLASH es su enfoque en bengalí, un idioma con poca representación en modelos de este tamaño. La licencia Apache 2.0 es más permisiva que la de Llama (que requiere atribución) y similar a la de Qwen2.5 (Apache 2.0). No se ha verificado la disponibilidad de estos modelos comparables en formato GGUF.

## Limitaciones y advertencias

- Al ser un modelo de solo 1.7B de parámetros, su capacidad de razonamiento complejo y de generación de código avanzado es limitada en comparación con modelos más grandes. Puede producir respuestas incoherentes o alucinaciones, especialmente en temas especializados.
- El modelo está especializado en bengalí e inglés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- No se ha documentado la longitud de contexto soportada, por lo que no se recomienda su uso en tareas que requieran ventanas de contexto largas (por ejemplo, resumen de documentos extensos).
- No hay información sobre sesgos o comportamientos dañinos específicos. Como fine-tuning de Qwen3, podría heredar sesgos presentes en el modelo base, pero no se ha evaluado.
- La cuantización GGUF introduce pérdida de precisión, especialmente en niveles bajos como Q2_K o Q3_K. Para tareas críticas se recomienda usar Q4_K_M o superior.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base no publica detalles sobre los datos de entrenamiento, por lo que el usuario debe asumir la responsabilidad de verificar posibles problemas de derechos de autor o privacidad en los datos utilizados.

## Enlaces

- Modelo GGUF cuantizado: https://huggingface.co/mradermacher/RIFA-FLASH-1.7B-GGUF
- Modelo base (safetensors): https://huggingface.co/smshahbaj/RIFA-FLASH-1.7B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Variante con imatrix: https://huggingface.co/mradermacher/RIFA-FLASH-1.7B-i1-GGUF
