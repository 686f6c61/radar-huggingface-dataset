# mradermacher/sandepaAI_gemma4_coder_12b-GGUF

## Resumen

El modelo `sandepaAI_gemma4_coder_12b-GGUF` es una cuantización GGUF del modelo `sandepaAI/sandepaAI_gemma4_coder_12b`, un fine-tune con LoRA sobre `google/gemma-4-12B-it` especializado en generación de código. La cuantización ha sido realizada por mradermacher, un conocido proveedor de formatos GGUF, y publicada bajo licencia Apache 2.0. El objetivo es permitir la ejecución de un modelo de 12 mil millones de parámetros en hardware de consumo, reduciendo los requisitos de memoria mediante cuantización estática de los pesos.

Este modelo resulta relevante porque combina la arquitectura de Gemma 4 (un transformer reciente de Google) con un ajuste específico para tareas de programación, ofreciendo una alternativa open source para asistentes de código locales. La disponibilidad de múltiples niveles de cuantización (desde Q2_K hasta Q8_0) permite adaptar el despliegue a diferentes capacidades de hardware, desde portátiles con poca VRAM hasta GPUs de gama alta. Sin embargo, la información pública sobre el entrenamiento y las capacidades exactas del modelo base es limitada, por lo que esta ficha se basa principalmente en los datos proporcionados por el cuantizador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 4 12B) |
| Parametros totales | 12 mil millones (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `sandepaAI/sandepaAI_gemma4_coder_12b` es un fine-tune con LoRA (Low-Rank Adaptation) del modelo `google/gemma-4-12B-it`. Gemma 4 12B es un transformer encoder-free que procesa directamente tokens de texto y, en su versión multimodal, también proyecta imágenes y audio mediante capas lineales ligeras. Sin embargo, no se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas de RLHF o DPO en el ajuste. La cuantización GGUF es estática, es decir, convierte los pesos del modelo original a formatos de precisión reducida (como 4 bits o 8 bits) sin reentrenamiento adicional. No se han publicado detalles sobre innovaciones técnicas específicas del fine-tune más allá del uso de LoRA.

## Capacidades

- Generación de código: el nombre "coder" indica una especialización en tareas de programación, aunque no se especifican los lenguajes soportados ni el nivel de competencia.
- Conversación: la etiqueta "conversational" sugiere que mantiene diálogos multi-turno, heredando las capacidades de chat del modelo base Gemma 4.
- Razonamiento: al estar basado en Gemma 4, es probable que conserve habilidades de razonamiento lógico y matemático, pero no hay datos concretos en la información disponible.
- Multilingüismo: solo se declara inglés como idioma soportado.
- No se menciona soporte para tool calling, agentes, visión o audio en la documentación consultada.

## Casos de uso

- Asistente de programación local: gracias a las cuantizaciones pequeñas (por ejemplo, Q4_K_M de 7.5 GB), se puede ejecutar en una GPU con 8 GB de VRAM o incluso en CPU con suficiente RAM, permitiendo autocompletar código, explicar fragmentos o generar funciones sin conexión a internet.
- Integración en entornos de desarrollo (IDE): mediante herramientas como llama.cpp o Ollama, el modelo puede integrarse en editores como VS Code para sugerencias de código en tiempo real, aprovechando su especialización en código.
- Generación de documentación técnica: puede redactar comentarios, docstrings o explicaciones de código, siempre que se le proporcione el contexto adecuado.
- Educación en programación: como tutor interactivo para estudiantes, respondiendo preguntas sobre algoritmos, depuración o buenas prácticas.
- Automatización de tareas de scripting: generar scripts de automatización o comandos de shell a partir de descripciones en lenguaje natural.
- Prototipado rápido: en entornos de desarrollo ágil, permite generar esqueletos de código o plantillas para acelerar la fase inicial de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión sin cuantizar. Tampoco hay comparaciones con otros modelos de código en términos de rendimiento.

## Requisitos de hardware

Los requisitos de VRAM dependen directamente del archivo GGUF elegido. La siguiente tabla estima la VRAM mínima necesaria (tamaño del archivo + overhead de ejecución):

| Cuantización | Tamaño (GB) | VRAM estimada (GB) |
|---|---|---|
| Q2_K | 4.9 | ~6 |
| Q3_K_S | 5.6 | ~7 |
| Q3_K_M | 6.2 | ~8 |
| Q3_K_L | 6.7 | ~8 |
| Q4_K_S | 7.1 | ~9 |
| Q4_K_M | 7.5 | ~9 |
| Q5_K_S | 8.4 | ~10 |
| Q5_K_M | 8.6 | ~10 |
| Q6_K | 9.9 | ~12 |
| Q8_0 | 12.8 | ~15 |

- GPUs recomendadas: RTX 3060 (12 GB) para cuantizaciones Q4, RTX 4090 (24 GB) para Q8_0. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio. vLLM no es compatible con GGUF de forma nativa, aunque se puede convertir a otros formatos.
- Latencia y throughput: no se han publicado datos específicos. En una GPU de gama media (RTX 3080), se espera una generación de 10-20 tokens por segundo con Q4_K_M, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente. A continuación se presenta una comparativa estructural con otros modelos de código de tamaño similar, basada en información pública general:

| Modelo | Parámetros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| sandepaAI_gemma4_coder_12b (este) | 12B | no disponible | Apache 2.0 | GGUF |
| CodeLlama 13B | 13B | 16K | Llama 2 license | GGUF, safetensors |
| DeepSeek-Coder 6.7B | 6.7B | 16K | MIT | GGUF, safetensors |
| StarCoder2 15B | 15B | 16K | BigCode OpenRAIL-M | GGUF, safetensors |

La comparación es limitada porque no hay datos de rendimiento publicados para este modelo. Se recomienda evaluar con benchmarks propios antes de usarlo en producción.

## Limitaciones y advertencias

- La información sobre el modelo base es escasa: no se conocen detalles del dataset de entrenamiento, el proceso de fine-tuning ni los resultados de evaluación, lo que dificulta predecir su comportamiento en tareas específicas.
- La cuantización degrada la calidad del modelo, especialmente en niveles bajos (Q2_K, Q3_K). Para tareas críticas se recomienda usar Q5_K_M o superior.
- Solo se declara soporte para inglés; el rendimiento en otros idiomas puede ser deficiente.
- Al ser un fine-tune de Gemma 4, puede heredar sesgos o alucinaciones presentes en el modelo base, aunque no hay documentación al respecto.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base cumpla con las condiciones de la licencia de Gemma 4 (que también es Apache 2.0).
- No se garantiza la precisión en código: los modelos de código pueden generar código incorrecto o inseguro; se recomienda revisión humana.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/sandepaAI_gemma4_coder_12b-GGUF
- Modelo base (sandepaAI): https://huggingface.co/sandepaAI/sandepaAI_gemma4_coder_12b (referenciado en la model card)
- Modelo base de Gemma 4 (google/gemma-4-12B-it): https://huggingface.co/google/gemma-4-12B-it (referenciado en la model card)
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF (referenciada en la model card)
