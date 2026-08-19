# lukaskremla/Qwen3.8-27B-6bit-MLX-TextOnly

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-6bit-MLX-TextOnly` es una cuantización en formato MLX de 6 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario lukaskremla. Esta versión elimina la torre de visión del modelo original, conservando únicamente las capacidades de texto a texto, lo que la hace más ligera y adecuada para entornos donde no se requiere procesamiento multimodal. La cuantización utiliza una técnica de solo pesos (weight-only) con esquema affine y RTN, con un tamaño de grupo de 64, y está optimizada para ejecutarse en hardware Apple Silicon mediante la librería mlx-lm.

El modelo está pensado para desarrolladores e investigadores que necesitan ejecutar un LLM de 27 mil millones de parámetros (nominal) en dispositivos con memoria unificada de Apple, manteniendo un equilibrio entre precisión y consumo de recursos. Al ser una versión text-only, resulta especialmente útil para tareas de generación de texto, razonamiento, conversación y uso de herramientas, sin la carga adicional del procesamiento de imágenes. La licencia Apache-2.0 permite su uso comercial sin restricciones significativas.

Aunque el repositorio muestra un recuento de parámetros de 5.885.566.464, la model card advierte que se trata de un error común de visualización en Hugging Face para cuantizaciones MLX, por lo que el tamaño real corresponde al del modelo base, es decir, 27 mil millones de parámetros. El repositorio tiene un tamaño de 21,9 GB, coherente con una cuantización de 6 bits de un modelo de ese tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B) |
| Parametros totales | 27B (nominal); 5.885.566.464 según Hugging Face (posible error de visualización) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit, weight-only, affine, RTN, group-size-64 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es una cuantización del modelo Qwen/Qwen3.8-27B realizada con la librería mlx-lm versión 0.31.2. La cuantización aplica una técnica de solo pesos (weight-only quantization) con esquema affine y RTN (round-to-nearest), utilizando un tamaño de grupo de 64 y una precisión de 6 bits. Esto reduce significativamente el tamaño del modelo en memoria y acelera la inferencia en hardware Apple Silicon, a costa de una ligera pérdida de precisión respecto al modelo original en punto flotante.

La principal modificación respecto al modelo base es la eliminación de la torre de visión, de modo que esta versión solo procesa entradas de texto. El modelo resultante conserva las capacidades de generación de texto, razonamiento, uso de herramientas y contexto largo del Qwen3.8-27B original, pero sin soporte para imágenes. No se dispone de información adicional sobre el proceso de entrenamiento del modelo base (datos, número de tokens, técnicas de alineación) en la documentación proporcionada.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextualmente relevantes en tareas de escritura, resumen y redacción.
- Conversación multi-turno: mantiene diálogos fluidos y coherentes a lo largo de varias interacciones.
- Razonamiento: capacidad de resolver problemas lógicos y matemáticos, así como de realizar inferencias complejas.
- Tool calling / function calling: soporta la invocación de herramientas externas, lo que permite integrarlo en agentes y pipelines automatizados.
- Contexto largo: diseñado para manejar ventanas de contexto extensas, aunque la longitud exacta no se especifica en la información disponible.
- Multilingüe: el modelo base Qwen3.8-27B soporta múltiples idiomas, aunque la lista concreta no se detalla en esta ficha.
- Text-only: no procesa imágenes ni otro tipo de entrada multimodal, al haberse eliminado la torre de visión.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con usuarios, resolviendo consultas frecuentes y escalando casos complejos a agentes humanos. Su capacidad de tool calling permite conectarlo a sistemas de ticketing o bases de conocimiento.
- Asistente de programación: integrado en un IDE o CLI, puede generar código, explicar fragmentos existentes y sugerir correcciones. Su soporte para contexto largo permite mantener el historial de la sesión de desarrollo.
- Análisis de documentos legales: resume contratos o informes extensos, extrayendo cláusulas clave y generando resúmenes ejecutivos. La ventana de contexto amplia facilita procesar documentos completos sin truncarlos.
- Generación de contenido editorial: redacción de artículos, guiones o publicaciones para blogs y redes sociales, manteniendo un tono consistente y adaptándose a diferentes estilos.
- Agente de automatización de tareas: combinado con herramientas de ejecución de comandos o APIs, puede orquestar flujos de trabajo como envío de correos, actualización de bases de datos o generación de informes.
- Chatbot de soporte técnico especializado: entrenado o ajustado con documentación interna, puede responder preguntas sobre productos o servicios, derivando a documentación técnica cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica, ni comparativas con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 21,9 GB, lo que sugiere que los pesos en 6 bits ocupan aproximadamente esa cantidad. Para inferencia con contexto moderado, se recomienda al menos 24 GB de memoria unificada o VRAM, aunque podría funcionar con menos si se usa swapping o técnicas de offloading.
- GPU recomendadas: al ser un formato MLX, está diseñado para Apple Silicon (M1, M2, M3 y superiores). No es compatible directamente con CUDA; para GPUs NVIDIA se necesitaría convertir a otro formato (por ejemplo, GGUF o GPTQ).
- Si cabe en consumer GPU: en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) podría ejecutarse si se convierte a un formato compatible, pero el formato MLX limita su uso a hardware Apple. En Mac con 32 GB o más de memoria unificada, se puede ejecutar de manera fluida.
- Opciones de despliegue: mlx-lm para Apple Silicon, con soporte para generación incremental y batch. También se puede usar con la librería MLX de Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que estas herramientas no soportan MLX de forma nativa.
- Latencia y throughput: no se proporcionan datos medidos. Se espera una velocidad razonable en Apple Silicon, pero depende del modelo de chip y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (por ejemplo, otras cuantizaciones de Qwen3.8-27B o modelos de tamaño similar). El único punto de referencia es el modelo base Qwen/Qwen3.8-27B, del cual esta es una versión cuantizada y sin visión. Se puede mencionar que existen otras cuantizaciones (por ejemplo, en GGUF o GPTQ) para otros hardware, pero no se dispone de datos concretos de rendimiento o precisión.

## Limitaciones y advertencias

- Al ser una cuantización de 6 bits, puede presentar una ligera degradación en la precisión respecto al modelo original en punto flotante, especialmente en tareas que requieren alta exactitud numérica o razonamiento complejo.
- La eliminación de la torre de visión implica que el modelo no puede procesar imágenes, por lo que no es adecuado para tareas multimodales.
- El recuento de parámetros mostrado en Hugging Face (5.885.566.464) es incorrecto según la model card, lo que puede causar confusión. El tamaño real corresponde al del modelo base, 27B.
- No se especifica la longitud de contexto soportada, aunque el modelo base Qwen3.8-27B tiene una ventana amplia. Se recomienda verificar la documentación del modelo original para conocer este dato.
- Los idiomas soportados no se detallan; aunque el modelo base es multilingüe, no se garantiza un rendimiento uniforme en todos los idiomas.
- La licencia Apache-2.0 permite uso comercial, pero se debe cumplir con los términos de la misma, incluyendo la atribución correspondiente.
- Para producción, es recomendable realizar pruebas de robustez y evaluar el comportamiento en casos límite, ya que no se han publicado benchmarks específicos de esta cuantización.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lukaskremla/Qwen3.8-27B-6bit-MLX-TextOnly
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección de cuantizaciones MLX del autor: https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp
