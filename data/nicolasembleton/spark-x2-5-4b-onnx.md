# nicolasembleton/Spark-X2.5-4B-onnx

## Resumen

Spark-X2.5-4B-onnx es una exportación al formato ONNX del modelo de lenguaje Spark-X2.5-4B, desarrollado por XHToken, y adaptado por nicolasembleton para su ejecución en navegadores mediante onnxruntime-web y WebGPU. El modelo original es un LLM compacto de propósito general diseñado para tareas cotidianas como conversación, escritura, traducción, razonamiento, codificación, uso de herramientas y flujos agénticos. Esta versión ONNX separa los grafos de prefill y decode para optimizar la inferencia en entornos web, con pesos en precisión fp16 y variantes int8 recomendadas para portátiles.

La arquitectura es híbrida, combinando capas de atención deslizante con capas de atención completa, e incorpora GQA (grouped query attention) con 16 cabezas de consulta y 4 de clave/valor, dimensión de cabeza de 256, embeddings atados y un vocabulario de 131072 tokens. El tamaño nominal es de 4 mil millones de parámetros, aunque no se confirma el número exacto en la información disponible. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 3 capas de atención deslizante (ventana 512, RoPE theta 10k) por cada capa de atención completa (rotación parcial 0.25, RoPE theta 5M), con compuerta de salida sigmoide por cabeza, GQA 16/4, head_dim 256, embeddings atados, vocabulario 131072 |
| Parametros totales | 4B (nominal, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la ventana de atención deslizante es 512, pero el contexto total no se especifica) |
| Tipos de cuantizacion | fp16 e int8 (variantes int8 recomendadas para portátiles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos separados para prefill y decode, con shards de datos externos) |

## Arquitectura y entrenamiento

La arquitectura de Spark-X2.5-4B es híbrida: combina capas de atención deslizante con ventana de 512 tokens y RoPE theta 10k, con capas de atención completa que usan rotación parcial (0.25) y RoPE theta 5M. Cada grupo de 4 capas incluye 3 de atención deslizante y 1 de atención completa. Se aplica una compuerta de salida sigmoide por cabeza de atención, y se usa GQA con 16 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 256, embeddings atados y vocabulario de 131072 tokens. La exportación ONNX separa los grafos de prefill (procesamiento de tokens de entrada) y decode (generación token a token), con entradas y salidas específicas para gestionar el estado de la caché KV. No se dispone de información sobre el entrenamiento: número de tokens, composición del dataset, o uso de RLHF/DPO.

## Capacidades

- Generación de texto para conversación, escritura creativa y traducción.
- Razonamiento lógico y matemático básico.
- Generación de código y asistencia en programación.
- Soporte de tool calling y function calling, según la descripción del modelo original.
- Capacidad para flujos agénticos y multi-step reasoning.
- Soporte multilingüe (no se especifican idiomas concretos).
- Ejecución en navegador mediante WebGPU, con grafos ONNX optimizados para prefill y decode.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en un chat web, aprovechando su capacidad de generación de texto y su tamaño compacto para ejecutarse en el cliente con WebGPU, reduciendo la latencia de red.
- Asistente de codificación en el navegador: integrado en un IDE web, puede sugerir fragmentos de código, explicar funciones o completar implementaciones, gracias a su soporte de generación de código y tool calling.
- Traducción en tiempo real: al ser un modelo multilingüe, puede traducir texto entre idiomas directamente en una aplicación web, sin necesidad de servidores externos.
- Agente conversacional para tareas de productividad: puede actuar como agente que ejecuta acciones (enviar correos, crear eventos) mediante function calling, en un entorno de escritorio o web.
- Generación de contenido para blogs o redes sociales: el modelo puede redactar borradores, resumir artículos o generar variaciones de texto, aprovechando su capacidad de escritura.
- Prototipado rápido de aplicaciones de IA: al ser una exportación ONNX ligera, permite probar funcionalidades de lenguaje en entornos de desarrollo sin necesidad de infraestructura GPU dedicada, usando ONNX Runtime en CPU o WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el grafo fp16 ocupa aproximadamente 8 GB; las variantes int8 reducen el consumo y son recomendadas para portátiles.
- GPU recomendadas: no se especifican modelos concretos, pero al estar orientado a WebGPU, puede ejecutarse en GPUs integradas modernas y discretas compatibles con WebGPU (por ejemplo, Apple Silicon, NVIDIA con soporte WebGPU, etc.).
- En consumer GPU: sí, especialmente con cuantización int8, puede caber en GPUs con 8 GB o menos.
- Opciones de despliegue: onnxruntime-web con backend WebGPU, también puede ejecutarse con ONNX Runtime en servidores (CPU o GPU) usando los grafos ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información consultada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o riesgos de alucinación específicos del modelo.
- La longitud de contexto no está documentada; la ventana de atención deslizante de 512 tokens puede limitar la coherencia en secuencias muy largas.
- La exportación ONNX puede introducir ligeras diferencias de precisión respecto al modelo original, especialmente en cuantización int8.
- El uso en WebGPU depende de la compatibilidad del navegador y del hardware; en dispositivos sin soporte WebGPU, la inferencia puede ser muy lenta o inviable.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base XHToken/Spark-X2.5-4B.

## Enlaces

- [Modelo en Hugging Face: nicolasembleton/Spark-X2.5-4B-onnx](https://huggingface.co/nicolasembleton/Spark-X2.5-4B-onnx)
- [Modelo base: XHToken/Spark-X2.5-4B](https://huggingface.co/XHToken/Spark-X2.5-4B)
- [Repositorio GitHub de XHToken/Spark-X2.5](https://github.com/XHToken/Spark-X2.5)
- [Modelo en ModelScope](https://www.modelscope.cn/models/XHToken/Spark-X2.5-4B)
- [Búsqueda de modelos cuantizados de Spark-X2.5-4B](https://huggingface.co/models?other=base_model:quantized:XHToken/Spark-X2.5-4B)
