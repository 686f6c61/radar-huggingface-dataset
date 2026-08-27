# kikekewl/Qwen3.8-Flash-Next-MLX-BF16

## Resumen

Qwen3.8-Flash-Next-MLX-BF16 es una conversión del modelo multimodal Qwen3.8-Flash-Next de Qwen al formato MLX, realizada por el usuario kikekewl. El modelo original es una vista previa temprana de la arquitectura Qwen4, que combina atención híbrida Gated DeltaNet (GDN) con QSA (Gated Attention), un diseño de mezcla de expertos (MoE) con 125.000 millones de parámetros principales más 51.000 millones de parámetros adicionales de embeddings N-gram, totalizando 177.392 millones de parámetros. Solo se activan 6.000 millones de parámetros por token, lo que lo hace computacionalmente eficiente para su tamaño.

El modelo soporta entrada multimodal (imagen y texto) y una ventana de contexto de 262.000 tokens, lo que lo posiciona para tareas de razonamiento avanzado, análisis de documentos largos y agentes multimodales. Esta versión MLX en BF16 está pensada para ejecutarse en hardware Apple Silicon mediante la librería MLX, aunque el tamaño del repositorio (354,8 GB) indica que se requiere cuantización para un despliegue práctico en estaciones de trabajo. La licencia es qwen-community-1.0, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida Gated DeltaNet + QSA (Qwen4 preview) |
| Parametros totales | 177.392.830.611 (125B principales + 51B embeddings N-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (original), cuantizaciones 4-bit (~110 GB) y 1-bit (~73 GB) disponibles via herramientas externas |
| Idiomas soportados | no disponible (se espera multilingüe, como el resto de la serie Qwen) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo Qwen3.8-Flash-Next introduce una arquitectura híbrida que combina dos mecanismos de atención: Gated DeltaNet (GDN) y Gated Attention (QSA). La primera es un mecanismo de atención lineal con compuertas que permite procesar secuencias largas con coste subcuadrático, mientras que la segunda es una variante de atención con compuertas que retiene la capacidad de recuperación precisa de información. Esta combinación mejora la eficiencia computacional y la capacidad del modelo en comparación con arquitecturas transformer densas del mismo tamaño.

El modelo sigue la estela del Qwen3-Next, que introdujo el diseño híbrido que luego se aplicó en las series Qwen3.5, Qwen3.6, Qwen3.7 y Qwen3.8. Es una vista previa de la arquitectura Qwen4, lo que implica que incorpora innovaciones que se consolidarán en la próxima generación de modelos Qwen. Los detalles del entrenamiento (número de tokens, composición del dataset, pipeline de alineación) no se han publicado en la información disponible, pero se sabe que el modelo es multimodal y ha sido entrenado con datos de imagen y texto.

## Capacidades

- Generación de texto y razonamiento complejo: soporta tareas de razonamiento multi-paso gracias a su arquitectura híbrida y su gran ventana de contexto.
- Comprensión multimodal: acepta entradas de imagen y texto, lo que permite análisis de imágenes con instrucciones en lenguaje natural.
- Ventana de contexto de 262.000 tokens: adecuado para documentos largos, código completo o conversaciones multi-turno extensas.
- Eficiencia MoE: solo 6.000 millones de parámetros activos por token, lo que reduce la latencia y el coste computacional en inferencia.
- Soporte de agentes y multi-step reasoning: no se han publicado datos específicos sobre tool calling, pero la arquitectura de la serie Qwen3.8 incluye capacidades de razonamiento avanzado.
- Capacidades multilingües: no se han especificado los idiomas, pero la serie Qwen3.8 es multilingüe (inglés, chino, español, francés, etc.) y este modelo hereda esa capacidad.
- Optimización para MLX: la versión BF16 está convertida para ejecutarse en Apple Silicon, aunque el tamaño original requiere cuantización.

## Casos de uso

- Análisis de documentos extensos: la ventana de 262K tokens permite procesar contratos completos, informes anuales o papers de investigación en una sola pasada, extrayendo información relevante y resumiendo sin pérdida de contexto.
- Asistente de análisis de imágenes para diagnóstico técnico: dado su carácter multimodal, puede describir y razonar sobre imágenes técnicas (placas de circuitos, diagramas de arquitectura) junto con preguntas en lenguaje natural.
- Generación de código en proyectos grandes: con contexto suficiente para incluir múltiples archivos de un repositorio, puede generar código coherente con la estructura del proyecto y sugerir refactorizaciones.
- Chatbot de atención al cliente con memoria larga: la ventana de contexto permite mantener el historial completo de una conversación de servicio técnico durante días, sin perder detalles importantes.
- Investigación académica en NLP: los investigadores pueden usar el modelo como baseline para experimentos de razonamiento multimodal y comparar la eficiencia de la arquitectura híbrida frente a transformers densos.
- Prototipado de agentes multimodales en Apple Silicon: la versión MLX permite evaluar el modelo en equipos Apple (Mac Studio, MacBook Pro) con cuantización, para pruebas rápidas antes de desplegar en servidores con GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos verificables sobre MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo específico. Se recomienda consultar el repositorio oficial de Qwen o los resultados de la serie Qwen3.8 cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - BF16 (pesos originales): 354,8 GB de memoria, inviable en una sola GPU. Requiere servidores con múltiples GPUs (por ejemplo, 8 × A100 80GB) o despliegue en cluster.
  - Cuantización 4-bit: ~110 GB de VRAM, viable en estaciones de trabajo con 2-4 GPUs de 48 GB (A6000, L40S) o 4 × RTX 4090 24 GB.
  - Cuantización 1-bit: ~73 GB de VRAM, viable en 2 × A100 80 GB o 3 × RTX 4090 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S, RTX 4090 (con cuantización), Apple Silicon (con MLX y cuantización).
- Compatibilidad con consumer GPU: sí, con cuantización de 4-bit o 1-bit, pero requiere múltiples GPUs. No cabe en una sola GPU de 24 GB.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp (GGUF), vLLM (cuando el backend lo soporte), SGLang (documentación oficial disponible), TGI.
- Latencia y throughput: no disponible. Dado que es un MoE con 6B activos, el throughput puede ser considerablemente mayor que un modelo denso de 125B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-Flash-Next | no disponible | no disponible | no disponible | GDN + QSA híbrida | qwen-community |
| Qwen3.5 | 125B (MoE) | no disponible | 262K | Transformer MoE | Apache 2.0 |
| DeepSeek-V3 | 671B | 37B | 128K | Transformer MoE | MIT |
| Qwen3.8-Flash-Next (este) | 177B | 6B | 262K | GDN + QSA híbrida | qwen-community-1.0 |

La comparativa es limitada porque no se han publicado benchmarks estandarizados. En términos de arquitectura, es el primer modelo abierto que combina Gated DeltaNet con atención compuerta, lo que le permite tener una ventana de contexto mayor que modelos como DeepSeek-V3 (128K) con un número de parámetros activos menor. La licencia qwen-community-1.0 permite uso comercial, pero requiere aceptar los términos de la licencia comunitaria de Qwen.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo LLM multimodal, puede generar contenido incorrecto o sesgado, especialmente en contextos largos donde el modelo puede perder coherencia.
- Riesgo de alucinación en razonamiento multimodal: la combinación de imagen y texto puede producir descripciones inventadas si la imagen no está bien soportada o el modelo no la interpreta correctamente.
- Limitaciones de idioma: los idiomas soportados no están especificados en la información disponible; se recomienda verificar el rendimiento en el idioma de uso antes de producción.
- Restricciones de licencia: la licencia qwen-community-1.0 es una licencia comunitaria que permite uso comercial, pero puede tener restricciones sobre redistribución o uso en determinados sectores (por ejemplo, defensa). Revisar el texto completo de la licencia en el repositorio.
- Tamaño y despliegue: el modelo en BF16 es inviable para la mayoría de los entornos; la cuantización de 4-bit o 1-bit degrada la calidad y puede introducir artefactos en las respuestas.
- Estado de vista previa: el modelo es una vista previa de la arquitectura Qwen4, por lo que puede tener inestabilidades o comportamientos no óptimos que se corrijan en versiones posteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kikekewl/Qwen3.8-Flash-Next-MLX-BF16
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de ejecución con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación de ejecución con SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (GGUF, hardware, benchmarks): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Documentación de unsloth (cómo ejecutar localmente): https://unsloth.ai/docs/models/qwen3.8-next
