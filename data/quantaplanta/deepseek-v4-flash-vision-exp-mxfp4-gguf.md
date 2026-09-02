# QuantaPlanta/DeepSeek-V4-Flash-Vision-Exp-MXFP4-GGUF

## Resumen

QuantaPlanta/DeepSeek-V4-Flash-Vision-Exp-MXFP4-GGUF es una cuantización en formato GGUF del modelo experimental multimodal DeepSeek-V4-Flash-Vision-Exp, desarrollado por DeepSeek. Se trata del primer modelo de la familia V4 con capacidad de entrada de imagen, que combina el backbone MoE de V4-Flash con una torre de visión de 32 capas y un módulo de draft DSpark fusionado. Esta versión cuantizada en MXFP4 (formato de punto flotante de 4 bits con escalado por bloques) permite ejecutar el modelo en hardware más modesto que el necesario para los pesos originales en bf16, manteniendo un equilibrio entre fidelidad y uso de memoria.

El repositorio contiene 157.3 GB de pesos en formato GGUF, con un total de 284.334.578.519 parámetros, lo que lo sitúa en la categoría de modelos de gran tamaño. La cuantización MXFP4 es una técnica relativamente reciente que reduce el peso de los tensores a 4 bits manteniendo una precisión aceptable, y aquí se aplica sobre el modelo base sin el módulo MTP (multi-token prediction), según el comando de conversión documentado. Es relevante porque ofrece una vía práctica para desplegar un modelo de visión y razonamiento de última generación en entornos con restricciones de VRAM, algo que con los pesos originales sería inviable en la mayoría de estaciones de trabajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con torre de visión de 32 capas y módulo DSpark de draft fusionado |
| Parametros totales | 284.334.578.519 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | MXFP4 (4 bits) en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp emplea una arquitectura de mezcla de expertos (MoE) sobre un backbone transformer, complementada con una torre de visión de 32 capas que procesa imágenes de entrada. Según la documentación de vLLM Recipes, incorpora un módulo DSpark de draft fusionado, que actúa como mecanismo de decodificación especulativa para acelerar la generación. El contexto alcanza 1 millón de tokens, lo que permite manejar documentos extensos o secuencias multimodales largas.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La cuantización MXFP4 se realizó mediante el script convert_hf_to_gguf.py de llama.cpp, con salida en bf16 y sin el módulo MTP, dividiendo el modelo en fragmentos de máximo 45 GB. Esto implica que la cuantización afecta a los pesos de los expertos y a las capas de atención, pero no se documentan cambios en la arquitectura interna más allá de la eliminación del MTP.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base V4-Flash.
- Comprensión de imágenes: entrada de imágenes para tareas de descripción, análisis visual y respuesta a preguntas sobre contenido visual.
- Razonamiento multi-paso y capacidades de agente, según la documentación del modelo base.
- Tool calling y function calling, soportado por el modelo base.
- Capacidades multilingües: no se especifican idiomas concretos en la información disponible.
- Contexto largo de 1M tokens, adecuado para procesar documentos extensos o conversaciones prolongadas.
- Decodificación especulativa mediante el módulo DSpark, que acelera la generación en comparación con una decodificación autorregresiva estándar.

## Casos de uso

- Análisis de documentos técnicos con imágenes: el modelo puede procesar PDFs o capturas que contengan diagramas, gráficos o fórmulas, y generar resúmenes o extraer información relevante, gracias a su ventana de 1M tokens y su capacidad de visión.
- Asistencia en soporte técnico visual: un usuario envía una captura de pantalla de un error o un diagrama de red, y el modelo interpreta la imagen y sugiere pasos de solución, integrable en sistemas de ticketing.
- Generación de código con contexto visual: en entornos de desarrollo, el modelo puede recibir una imagen de un esquema de arquitectura o un diagrama UML y generar el código correspondiente, aprovechando su capacidad de tool calling.
- Automatización de agentes con razonamiento multi-paso: el modelo puede encadenar llamadas a herramientas (búsqueda, ejecución de scripts) para completar tareas complejas, como la preparación de informes que requieren consultar varias fuentes.
- Procesamiento de documentos legales o científicos extensos: con 1M de contexto, puede analizar contratos o artículos de investigación completos, incluyendo figuras y tablas, y responder preguntas específicas sobre su contenido.
- Despliegue en entornos con VRAM limitada: gracias a la cuantización MXFP4 en GGUF, el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB) mediante llama.cpp u Ollama, para pruebas locales o prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La cuantización MXFP4 puede introducir una degradación mínima en tareas de razonamiento y visión en comparación con los pesos en bf16, pero no se dispone de métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) para este repositorio específico ni para el modelo base en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 157.3 GB en GGUF, pero la cuantización MXFP4 reduce el peso efectivo de los tensores. Con 284 mil millones de parámetros en 4 bits, el peso del modelo ronda los 142 GB (sin contar overhead de activaciones y KV cache). Para inferencia con contexto largo, se recomienda al menos 160-180 GB de VRAM.
- GPUs recomendadas: para ejecutar el modelo completo se necesitan múltiples GPUs de alta capacidad, como 4× A100 80GB, 4× H100 80GB, o 2× A100 80GB con offloading a CPU. En configuraciones de consumo, no es viable en una sola GPU; se requeriría particionado y offloading.
- En consumer GPU: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) sin un particionado extremo y offloading a RAM, lo que degradaría severamente la latencia. Para uso práctico en consumer, se recomienda esperar versiones con cuantizaciones más agresivas (por ejemplo, 2-3 bits) o usar el modelo base en la nube.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores basados en llama.cpp. También puede usarse con vLLM si se convierte a safetensors, aunque la documentación de vLLM Recipes indica soporte para el modelo base.
- Latencia y throughput: no se han publicado mediciones para esta cuantización. La decodificación especulativa del módulo DSpark puede mejorar el throughput en comparación con modelos MoE sin ese mecanismo, pero los valores concretos dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 284.334.578.519 | 1M | Sí | no disponible | safetensors |
| QuantaPlanta/DeepSeek-V4-Flash-Vision-Exp-MXFP4-GGUF | 284.334.578.519 | 1M | Sí | no disponible | GGUF (MXFP4) |
| DeepSeek-V4-Flash (sin visión) | no disponible | no disponible | No | no disponible | safetensors |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de otros modelos multimodales de tamaño comparable (como Qwen-VL o Llama-Vision) en la información proporcionada. La principal diferencia entre el base y esta cuantización es el formato de pesos y la eliminación del módulo MTP, lo que afecta al rendimiento de generación multi-token pero no a las capacidades funcionales.

## Limitaciones y advertencias

- La licencia del modelo no está especificada en el repositorio; antes de un uso comercial, es imprescindible consultar la licencia del modelo base en deepseek-ai/DeepSeek-V4-Flash-Vision-Exp.
- La cuantización MXFP4 puede introducir errores de redondeo que afecten a tareas de precisión numérica o razonamiento matemático, aunque en menor medida que cuantizaciones de 4 bits tradicionales.
- El modelo es experimental (la etiqueta "Exp" lo indica) y puede presentar comportamientos inestables o alucinaciones, especialmente en tareas de visión con imágenes ambiguas o de baja calidad.
- No se han documentado los idiomas soportados; el rendimiento en lenguas distintas del inglés o el chino puede ser inferior.
- El tamaño del modelo (157 GB) hace que el despliegue local sea complejo y costoso; la mayoría de los usuarios deberá recurrir a servicios en la nube o a cuantizaciones más agresivas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad; se recomienda verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/QuantaPlanta/DeepSeek-V4-Flash-Vision-Exp-MXFP4-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Modelo DeepSeek-V4-Flash (sin visión): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Documentación de vLLM Recipes: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Guía práctica de DeepSeek V4 Flash Vision: https://codepick.dev/en/guides/deepseek-v4-flash-vision-guide/
- Ficha en NanoGPT: https://nano-gpt.com/models/text/deepseek/deepseek-v4-flash-vision-exp
