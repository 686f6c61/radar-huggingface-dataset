# lukaskremla/Qwen3.8-27B-2bit-MLX-TextOnly

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-2bit-MLX-TextOnly` es una cuantización en 2 bits del modelo base `Qwen/Qwen3.8-27B`, convertida al formato MLX para ejecución eficiente en hardware Apple Silicon. El autor, lukaskremla, ha eliminado deliberadamente el vision tower del modelo original, conservando únicamente las capacidades de texto a texto. Esto reduce significativamente el tamaño del archivo (8,4 GB) y los requisitos de memoria, lo que permite ejecutar un modelo de 27 mil millones de parámetros en equipos con memoria unificada moderada.

La cuantización utiliza el esquema RTN (round-to-nearest) con grupo de tamaño 64 y solo cuantización de pesos (weight-only). El modelo conserva las capacidades principales del Qwen3.8-27B: generación de texto, razonamiento, uso de herramientas, contexto largo y soporte multilingüe, aunque con la degradación esperada de una cuantización tan agresiva. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Este modelo es relevante para desarrolladores que trabajan en ecosistemas Apple (Mac con chips M1/M2/M3/M4) y necesitan un LLM local de gran tamaño con footprint reducido, o que deseen experimentar con cuantizaciones extremas en MLX. La versión text-only es ideal para tareas puramente lingüísticas donde la visión no es necesaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.8, basada en Qwen3) |
| Parametros totales | 27B (modelo base); 2.523.897.344 segun safetensors (posible bug de visualizacion en HF para MLX quants) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; probablemente 32k o superior, no confirmado) |
| Tipos de cuantizacion | 2-bit, RTN, group-size-64, affine (weight-only) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingue, pero no se detallan idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `Qwen/Qwen3.8-27B`, un transformer denso de 27 mil millones de parámetros. No se dispone de detalles técnicos adicionales sobre la arquitectura interna (número de capas, heads, etc.) en la información proporcionada. El autor ha eliminado el vision tower del modelo original, dejando únicamente el componente de texto. La cuantización se realizó con mlx-lm versión 0.31.2, utilizando el esquema RTN con grupo de 64 y solo cuantización de pesos. No se proporcionan datos sobre el entrenamiento del modelo base (tokens, dataset, métodos de alineación como RLHF o DPO). La cuantización no implica entrenamiento adicional; es una conversión post-entrenamiento.

## Capacidades

- Generación de texto: produce texto coherente en múltiples idiomas (según el modelo base, aunque no se especifica la lista).
- Razonamiento: el modelo base Qwen3.8 incluye capacidades de razonamiento (chain-of-thought, etc.), que se conservan en esta versión cuantizada, aunque con posible pérdida de precisión.
- Conversación: soporta diálogos multi-turno, adecuado para chatbots.
- Tool use / function calling: el modelo base soporta llamada a herramientas, por lo que esta versión también debería permitirlo.
- Contexto largo: el tag `long-context` indica que el modelo puede manejar ventanas de contexto extendidas, aunque no se especifica el número exacto de tokens.
- Multilingüe: el modelo base es multilingüe, aunque no se detallan los idiomas.
- Text-only: no incluye capacidades de visión (imágenes, video). Solo entrada y salida de texto.

## Casos de uso

- Chatbot local en Mac: gracias a su formato MLX y cuantización 2-bit, puede ejecutarse en un Mac con al menos 16 GB de RAM unificada. Un desarrollador puede integrarlo en una aplicación de escritorio para asistencia conversacional sin depender de la nube.
- Generación de texto en entornos offline: para redactar correos, resúmenes, artículos o contenido creativo en equipos Apple, sin conexión a internet y con privacidad de datos.
- Asistente de razonamiento en tareas de análisis: el modelo puede descomponer problemas complejos en pasos, útil para brainstorming estructurado o análisis de datos cualitativos, aunque la cuantización 2-bit puede limitar la fiabilidad en problemas muy complejos.
- Prototipado de agentes con tool calling: al soportar function calling, se puede usar para prototipar agentes que interactúan con APIs o ejecutan comandos locales, todo dentro del entorno MLX.
- Evaluación de cuantizaciones extremas: para investigadores que estudian el impacto de cuantizaciones de 2 bits en la calidad del modelo, este checkpoint sirve como referencia para comparar con versiones de mayor precisión.
- Procesamiento de documentos largos: con su capacidad de contexto largo (aunque no cuantificada), puede resumir o extraer información de textos extensos, siempre que el hardware lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K u otras pruebas. Dado que es una cuantización 2-bit, se espera una degradación notable respecto al modelo original, pero no hay datos concretos.

## Requisitos de hardware

- Formato MLX: requiere hardware Apple Silicon (M1, M2, M3, M4 o posteriores). No funciona en GPUs NVIDIA o AMD.
- Memoria: el archivo pesa 8,4 GB, por lo que se recomienda al menos 16 GB de RAM unificada para cargar el modelo y dejar margen para el contexto y la generación. Con 8 GB podría ser insuficiente.
- GPU: no aplica GPU discreta; usa la GPU integrada del chip Apple.
- Opciones de despliegue: se puede usar con la librería `mlx-lm` (Python) o con herramientas que soporten MLX, como `mlx_lm.generate`. También es posible integrarlo en aplicaciones Swift mediante los bindings de MLX.
- Latencia y throughput: no se proporcionan datos. En general, la cuantización 2-bit reduce el tamaño de los pesos y acelera la inferencia, pero la latencia exacta depende del chip y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo base Qwen3.8-27B podría compararse con otros LLMs de 27B como Llama 3 8B o Mistral 7B, pero al ser una cuantización específica para MLX y 2-bit, no hay datos de rendimiento para comparar. Se recomienda consultar las fichas del modelo base para obtener referencias.

## Limitaciones y advertencias

- Cuantización 2-bit: la pérdida de precisión es severa. La calidad de generación, razonamiento y coherencia puede verse notablemente reducida respecto al modelo original. No es recomendable para tareas que requieran alta fidelidad.
- Sin visión: al eliminar el vision tower, el modelo no puede procesar imágenes. Solo texto.
- Posible bug de conteo de parámetros: Hugging Face puede mostrar un número incorrecto de parámetros (2.52B en lugar de 27B). Esto es un problema de visualización conocido en MLX quants, no un error real del modelo.
- Idiomas no especificados: aunque el modelo base es multilingüe, no se garantiza la cobertura ni la calidad en todos los idiomas.
- Alucinaciones: como cualquier LLM, puede generar información falsa o inventada, especialmente con cuantización agresiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución. No hay restricciones de uso militar o de alto riesgo, pero se recomienda revisar los términos del modelo base.
- Entorno de ejecución: solo funciona en Apple Silicon; no es portable a otros sistemas sin conversión adicional.

## Enlaces

- Modelo en HuggingFace: [lukaskremla/Qwen3.8-27B-2bit-MLX-TextOnly](https://huggingface.co/lukaskremla/Qwen3.8-27B-2bit-MLX-TextOnly)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Versión con visión: [lukaskremla/Qwen3.8-27B-2bit-MLX](https://huggingface.co/lukaskremla/Qwen3.8-27B-2bit-MLX)
- Colección de cuantizaciones MLX: [Qwen 3.8 27B MLX-Quants (Vision, Text-Only & MTP)](https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp)
