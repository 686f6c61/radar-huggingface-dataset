# majentik/LFM2.5-8B-A1B-MLX-8bit

## Resumen

LFM2.5-8B-A1B-MLX-8bit es una variante cuantizada en 8 bits (afín, grupo de 64) del modelo LFM2.5-8B-A1B de Liquid AI, un modelo de lenguaje de tipo mezcla de expertos (MoE) diseñado específicamente para ejecutarse en dispositivos con recursos limitados. El modelo original, desarrollado por Liquid AI, combina 8 000 millones de parámetros totales con solo 1 500 millones de parámetros activos por paso hacia delante, lo que permite un rendimiento elevado con un coste computacional reducido. Esta versión cuantizada, creada por el usuario majentik, adapta el modelo al ecosistema MLX de Apple Silicon, facilitando su uso en Macs con memoria unificada.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de razonamiento, generación de texto, tool calling y flujos agénticos directamente en el dispositivo, sin depender de infraestructura en la nube. Con una ventana de contexto de 128 000 tokens y soporte para razonamiento en cadena de pensamiento, se posiciona como una opción sólida para aplicaciones de borde. La cuantización en 8 bits reduce el tamaño del modelo a aproximadamente 2,4 GB, lo que lo hace viable en hardware de consumo, aunque el repositorio completo ocupa 9 GB debido a archivos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer |
| Parametros totales | 2 381 737 408 (según el archivo safetensors del repo cuantizado; el modelo base se anuncia como 8B) |
| Parametros activos | 1,5B (según documentación oficial de Liquid AI; el nombre sugiere 1B) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | 8-bit afín, grupo de 64 (también disponibles versiones 2, 3, 4, 5, 6 bit y MXFP4) |
| Idiomas soportados | 9 idiomas (según la ficha del modelo base en Hugging Face) |
| Licencia | LFM Open License v1.0 (lfm1.0), uso comercial permitido con atribución |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B emplea una arquitectura de mezcla de expertos (MoE) en la que solo una fracción de los parámetros se activa durante cada inferencia. Según la documentación oficial, combina 8 000 millones de parámetros totales con 1 500 millones activos por paso, lo que reduce significativamente el coste computacional en comparación con un modelo denso del mismo tamaño. La ventana de contexto alcanza los 128 000 tokens, y el modelo incorpora capacidades de razonamiento en cadena de pensamiento (chain-of-thought) que mejoran su rendimiento en tareas que requieren múltiples pasos lógicos.

La versión cuantizada en 8 bits se generó con la herramienta `mlx_lm.convert` de mlx-lm 0.31.3, aplicando cuantización afín con tamaño de grupo 64. Esta conversión preserva la arquitectura original y permite ejecutar el modelo en Apple Silicon mediante la librería MLX. No se dispone de información detallada sobre los datos de entrenamiento del modelo base, como el número de tokens o la composición del dataset, ni sobre el uso de técnicas de alineación como RLHF o DPO. La model card del repo cuantizado indica que los benchmarks están pendientes de publicación.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (hasta 128 000 tokens).
- Razonamiento en cadena de pensamiento para tareas complejas que requieren varios pasos lógicos.
- Tool calling y function calling, lo que permite integrar el modelo con APIs y herramientas externas.
- Soporte para flujos agénticos, incluyendo planificación y ejecución de acciones de forma autónoma.
- Capacidades multilingües en 9 idiomas, según la ficha del modelo base.
- Optimizado para ejecución en dispositivos de borde (edge) gracias a su arquitectura MoE con pocos parámetros activos.
- Compatible con el ecosistema MLX de Apple Silicon, lo que facilita su despliegue en Macs.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128 000 tokens, manteniendo el historial completo de la interacción y respondiendo de forma coherente sin perder información relevante.
- Asistentes personales en dispositivos móviles: al ejecutarse localmente en Apple Silicon, permite crear asistentes que funcionan sin conexión, protegiendo la privacidad del usuario y reduciendo la latencia.
- Generación de código en entornos de desarrollo: con soporte para tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación o revisar cambios, ejecutándose directamente en la máquina del desarrollador.
- Agentes autónomos para automatización de tareas: su capacidad de razonamiento en cadena de pensamiento y tool calling lo hace adecuado para agentes que planifican y ejecutan acciones, como gestión de correos, reservas o búsquedas web.
- Análisis de documentos extensos: la ventana de contexto de 128 000 tokens permite procesar informes, contratos o artículos largos de una sola vez, extrayendo resúmenes o respondiendo preguntas específicas.
- Chatbots especializados en dominios técnicos: gracias a su soporte multilingüe y su capacidad de razonamiento, puede utilizarse para construir asistentes de soporte técnico que resuelvan dudas sobre productos o servicios en varios idiomas.
- Prototipado rápido de aplicaciones de IA: al ser un modelo cuantizado y ligero, facilita la experimentación local en Macs sin necesidad de GPUs dedicadas, acelerando el desarrollo de pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repo cuantizado indica que las evaluaciones están pendientes de un flujo de trabajo de arnés de evaluación. Tampoco se han encontrado datos de rendimiento comparativo en la documentación oficial del modelo base.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon y se ejecuta mediante la librería MLX, por lo que requiere un Mac con chip M1, M2, M3 o M4 (o versiones Pro/Max/Ultra).
- El archivo de pesos cuantizado en 8 bits ocupa aproximadamente 2,4 GB, por lo que cabe en Macs con 8 GB de memoria unificada, aunque se recomienda al menos 16 GB para manejar contextos largos sin problemas de memoria.
- El repositorio completo ocupa 9 GB, pero el modelo en sí es más ligero; la diferencia se debe a archivos adicionales como el LICENSE y posiblemente otras versiones.
- Para inferencia, se utiliza `mlx_lm.generate` o la API de mlx-lm. No se requieren GPUs dedicadas, ya que MLX aprovecha la GPU integrada y la memoria unificada del chip.
- La latencia y el throughput dependen del chip concreto y de la longitud del contexto; no se han publicado cifras oficiales, pero al ser un MoE con solo 1,5B parámetros activos, se espera un rendimiento ágil en hardware moderno.
- Opciones de despliegue: mlx-lm (línea de comandos o Python), integración con frameworks como Hugging Face Transformers a través de adaptadores MLX, y posiblemente Ollama si se convierte a formato GGUF (no incluido en este repo).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (base) | 8B | 1,5B | 128K | lfm1.0 | safetensors |
| LFM2.5-8B-A1B-MLX-8bit (este) | 2,38B (según safetensors) | 1,5B | 128K | lfm1.0 | safetensors (MLX) |
| Qwen2.5-7B-Instruct | 7,6B | 7,6B (denso) | 128K | Apache 2.0 | safetensors |
| Gemma-2-9B | 9,2B | 9,2B (denso) | 8K | Gemma License | safetensors |

La comparativa se limita a aspectos arquitectónicos y de licencia, ya que no se dispone de datos de benchmarks para el modelo LFM2.5. Frente a modelos densos del mismo rango de tamaño, LFM2.5 ofrece la ventaja de un menor coste por inferencia gracias a su naturaleza MoE, aunque su licencia (lfm1.0) es más restrictiva que la Apache 2.0 de Qwen. El contexto de 128K es comparable al de Qwen2.5, pero superior al de Gemma-2.

## Limitaciones y advertencias

- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas estándar no ha sido verificado de forma independiente.
- La discrepancia entre los 8B anunciados y los 2,38B de parámetros en el archivo safetensors sugiere que el conteo oficial puede incluir parámetros no almacenados en el archivo cuantizado, o que el nombre comercial no refleja el número real de parámetros. Esto debe tenerse en cuenta al evaluar la capacidad del modelo.
- Al ser una cuantización en 8 bits, puede haber una ligera degradación en la calidad de las respuestas en comparación con el modelo en precisión completa, especialmente en tareas de razonamiento complejo.
- La licencia lfm1.0 permite uso comercial con atribución, pero es necesario revisar los términos completos para asegurar el cumplimiento, especialmente en productos que redistribuyan el modelo.
- El modelo está optimizado para Apple Silicon; no se proporcionan versiones para CUDA o ROCm, lo que limita su uso en GPUs de NVIDIA o AMD.
- No se dispone de información sobre sesgos específicos o riesgos de alucinación. Como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado, por lo que se recomienda supervisión humana en aplicaciones críticas.
- El soporte multilingüe se limita a 9 idiomas, que no están especificados en la documentación disponible; el rendimiento en idiomas fuera de ese conjunto puede ser inferior.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/majentik/LFM2.5-8B-A1B-MLX-8bit
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Paper asociado (arXiv): https://arxiv.org/abs/2511.23404
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/b9aebfcbe28b6cb374042f495d733037550ab146/LICENSE
