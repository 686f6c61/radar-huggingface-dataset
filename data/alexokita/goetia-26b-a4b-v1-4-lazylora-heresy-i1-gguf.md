# alexokita/Goetia-26B-A4B-v1.4-LazyLora-heresy-i1-GGUF

## Resumen

Goetia-26B-A4B-v1.4-LazyLora-heresy-i1-GGUF es una cuantización GGUF con imatrix del modelo base Goetia-26B-A4B-v1.4-LazyLora-heresy, preparada por alexokita. El modelo original es un merge de modelos de lenguaje creado con mergekit, que combina google/gemma-4-26B-A4B con otros componentes mediante el método MoE DELLA, y sobre el que se ha aplicado una LoRA denominada LazyLora. El resultado es un modelo de arquitectura MoE con 25,2 mil millones de parámetros totales y 4 mil millones activos, lo que lo hace relativamente eficiente para inferencia en comparación con modelos densos de tamaño similar.

Esta versión GGUF está pensada para facilitar el despliegue en entornos con recursos limitados, ya que el formato cuantizado reduce significativamente el uso de memoria. La cuantización recomendada por el autor es la Q4_K_M, que ofrece un equilibrio entre calidad y consumo de VRAM. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Aunque el repositorio no incluye información detallada sobre capacidades o benchmarks, su base en Gemma 4 sugiere un buen rendimiento en tareas de generación de texto, razonamiento y conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4, merge con método DELLA |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 4B (según denominación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (escalera completa, recomendada Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base Goetia-26B-A4B-v1.4-LazyLora-heresy es un merge de modelos creado con mergekit, que utiliza el método MoE DELLA sobre la base google/gemma-4-26B-A4B. Este método combina varios modelos preentrenados en una arquitectura de mezcla de expertos, donde solo una fracción de los parámetros se activa por token (4B de 25,2B). Sobre este merge se ha aplicado una LoRA denominada LazyLora, que ajusta los pesos del modelo para una tarea o estilo específico (el sufijo "heresy" sugiere una variante experimental). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La cuantización GGUF con imatrix ha sido realizada por alexokita, que ha generado una escalera de cuantizaciones para adaptarse a distintos presupuestos de memoria.

## Capacidades

- Generación de texto y conversación: al ser un modelo de lenguaje basado en Gemma 4, es capaz de mantener diálogos multi-turno y generar texto coherente.
- Razonamiento y comprensión: se espera un rendimiento sólido en tareas de razonamiento lógico y comprensión lectora, aunque no se han publicado benchmarks específicos.
- Eficiencia computacional: gracias a su arquitectura MoE con solo 4B parámetros activos, ofrece una inferencia más rápida y ligera que un modelo denso de 25B.
- Multilingüismo: no se ha especificado qué idiomas soporta, pero al derivar de Gemma 4, probablemente cubra varios idiomas principales (sin confirmar).
- Formato GGUF: compatible con herramientas de inferencia locales como llama.cpp, Ollama y otras que soporten este formato.

## Casos de uso

- Chatbots y asistentes conversacionales: el modelo puede integrarse en aplicaciones de atención al cliente o asistentes personales, aprovechando su capacidad de diálogo y su eficiencia MoE para responder con baja latencia en hardware moderado.
- Generación de contenido creativo: redacción de artículos, guiones, correos electrónicos o material de marketing, donde la calidad del texto generado es suficiente para borradores iniciales.
- Prototipado rápido de aplicaciones NLP: al ser un modelo GGUF cuantizado, es fácil de desplegar en entornos de desarrollo para probar ideas sin necesidad de infraestructura de alto coste.
- Análisis de texto y extracción de información: tareas como resumen, clasificación o extracción de entidades pueden realizarse con este modelo, aunque no se han documentado capacidades específicas de tool calling.
- Educación y tutoría: generación de explicaciones, respuestas a preguntas de estudiantes o creación de materiales didácticos personalizados.
- Investigación académica: como modelo de código abierto con licencia permisiva, es adecuado para experimentos de fine-tuning o evaluación en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o sus variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_M, el archivo pesa aproximadamente 12-13 GB (25,2B × 4 bits / 8). Se recomienda al menos 16 GB de VRAM para una inferencia cómoda con contexto moderado.
- GPU recomendadas: tarjetas con 16 GB o más, como RTX 4080/4090, A100 40GB, o GPUs de datacenter. En consumer, una RTX 3090 (24 GB) o RTX 4090 (24 GB) son suficientes.
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 16-24 GB de VRAM. Para GPUs con menos memoria, se pueden usar cuantizaciones más agresivas (Q3_K_M, Q2_K) aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. También se puede usar vLLM si se convierte a safetensors, aunque el formato GGUF está optimizado para llama.cpp.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, un modelo MoE de 4B activos puede generar entre 20 y 40 tokens por segundo, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (MoE de ~25B con 4B activos). Se podría comparar con Mixtral 8x7B (46,7B totales, 12,9B activos) o Qwen2.5-32B-A4B, pero no hay datos de rendimiento disponibles para Goetia. La licencia Apache 2.0 es más permisiva que la de Mixtral (Apache 2.0 también) y similar a la de Qwen (Apache 2.0 en algunas versiones). No se puede concluir nada más sin benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge de modelos, puede heredar sesgos presentes en los modelos base (Gemma 4 y otros), especialmente en temas sensibles como género, raza o religión.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o preguntas de baja frecuencia.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; se recomienda verificar con el modelo base Gemma 4, que típicamente soporta 8K o más, pero no está confirmado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios.
- Caveat para producción: al ser una cuantización GGUF, puede haber una ligera degradación de calidad frente al modelo en precisión completa. Además, el modelo no ha sido evaluado formalmente, por lo que se recomienda realizar pruebas exhaustivas antes de usarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/alexokita/Goetia-26B-A4B-v1.4-LazyLora-heresy-i1-GGUF
- Modelo base (26B-Suite): https://huggingface.co/26B-Suite/Goetia-26B-A4B-v1.4-LazyLora-heresy
- Merge original (Naphula): https://huggingface.co/Naphula/Goetia-26B-A4B-v1.4
- Otra cuantización GGUF (mradermacher): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-GGUF
- Despliegue en FriendliAI: https://friendli.ai/models/26B-Suite/Goetia-26B-A4B-v1.4-LazyLora-heresy
