# AutomatosX/AX-Qwen3-VL-32B-Thinking-MLX-AXQ-6bit

## Resumen

El modelo **AX-Qwen3-VL-32B-Thinking-MLX-AXQ-6bit** es un checkpoint cuantizado en formato MLX (Apple Silicon) del modelo base Qwen/Qwen3-VL-32B-Thinking, desarrollado por AutomatosX. Su proposito es permitir la ejecucion de un modelo de vision-lenguaje (VLM) de 33,36 mil millones de parametros logicos en hardware de Apple con memoria unificada limitada, mediante una cuantizacion mixta de precision denominada AXQuant (AXQ).

La relevancia de este paquete radica en su esquema de cuantizacion de 6 bits (6,9380 BPW medido), que mantiene la torre de vision en BF16 mientras cuantiza la ruta de texto, logrando un tamano de descarga de aproximadamente 28,94 GB. Es importante senalar que el propio autor lo clasifica como un paquete de desarrollo con evidencia de conversion, pero **no certificado** como release formal de AXQuant, y no publica metricas de calidad ni de rendimiento. Su runtime principal es MLX-VLM, y esta disenado exclusivamente para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (densa); ruta de texto optimizada |
| Parametros totales | 33,36B (logicos); 8,42B (tensores en safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (configurado; limite practico segun memoria unificada) |
| Tipos de cuantizacion | AXQ mixto: 6bit (93,55%), 8bit (2,33%), bf16 (4,12%) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3VLForConditionalGeneration, un transformer denso de 33,36B parametros logicos. La cuantizacion AXQuant 1.8.1 se aplica exclusivamente a la ruta de texto, mientras que la torre de vision se conserva en BF16 dentro de los shards principales. La asignacion de precision no se realizo mediante calibracion, sino a partir de prioridades de arquitectura (`architecture_prior`), con un grupo de cuantizacion de tamano 64.

No se dispone de informacion sobre el entrenamiento original del modelo base (datos, tokens, RLHF/DPO), ya que este checkpoint es una conversion directa del BF16 fuente. El paquete no incluye sidecar de MTP (Multi-Token Prediction) ni de vision, y no se ha establecido la ejecucion nativa via AX Engine al no incluir un manifest validado.

## Capacidades

- Generacion de texto e imagen a texto (vision-lenguaje), heredadas del modelo base Qwen3-VL-32B-Thinking.
- Razonamiento multimodal: procesa imagenes junto con prompts de texto para generar descripciones o respuestas contextuales.
- Sin soporte de audio: la modalidad de audio esta deshabilitada en este paquete.
- Sin MTP: no incluye prediccion multi-token, por lo que no hay aceleracion por esa via.
- Soporte de tool calling / function calling: no especificado en la informacion disponible; se asume que hereda las capacidades del modelo base, pero no se certifica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- **Despliegue local en Mac con Apple Silicon**: permite ejecutar un VLM de 33B en equipos Mac con memoria unificada mediante MLX-VLM, sin necesidad de GPU NVIDIA. Adecuado para desarrolladores que trabajan en ecosistema Apple.
- **Prototipado de agentes visuales**: sirve para experimentar con razonamiento multimodal (descripcion de imagenes, respuesta a preguntas visuales) en entornos de desarrollo locales, aunque sin garantias de calidad certificada.
- **Analisis de imagenes en entornos con restriccion de hardware**: gracias a la cuantizacion de 6 bits, el modelo cabe en Mac con 32 GB o 64 GB de RAM unificada, permitiendo tareas de OCR, clasificacion o captioning en local.
- **Evaluacion de tecnicas de cuantizacion**: es un punto de referencia util para comparar el impacto de AXQ frente a otras cuantizaciones (GGUF, MLX estandar) en modelos de vision-lenguaje, dado que documenta su layout de precision de forma detallada.
- **Investigacion en eficiencia de modelos**: permite estudiar como afecta la cuantizacion mixta (protegiendo la torre de vision en BF16) a la calidad final de un VLM, aunque el autor no publica metricas de retencion.
- **Desarrollo de aplicaciones de asistencia visual offline**: integrable en herramientas de accesibilidad o analisis de documentos que requieran procesamiento de imagenes sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe evidencia de calidad frente a BF16 o baselines uniformes, y que la capacidad de contexto de 262.144 tokens es metadato de configuracion, no una validacion. Tampoco se proporcionan datos de latencia, throughput ni velocidad de kernels.

## Requisitos de hardware

- Exclusivo para Apple Silicon (libreria MLX).
- Tamano del repositorio: 28,9 GB (descarga completa aproximada de 28,94 GB).
- Memoria unificada estimada: se requieren al menos 32 GB de RAM unificada para cargar los pesos; se recomiendan 64 GB para trabajar con contextos largos.
- Runtime principal: MLX-VLM (`mlx_vlm.generate`).
- No se proporcionan datos de latencia ni throughput.
- No se ha establecido la ejecucion nativa via AX Engine (no incluye manifest validado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen/Qwen3-VL-32B-Thinking (base) | 33,36B | 262.144 | BF16 | Apache 2.0 | PyTorch / MLX |
| AX-Qwen3-VL-32B-Thinking-MLX-AXQ-6bit (este) | 33,36B (logicos) | 262.144 | AXQ 6bit (6,94 BPW) | Apache 2.0 | Safetensors (MLX) |
| AX-Qwen3-VL-32B-Thinking-MLX-AXQ-4bit (hermano) | 33,36B (logicos) | 262.144 | AXQ 4bit (BPW exacto por verificar) | Apache 2.0 | Safetensors (MLX) |

La comparativa se limita a los modelos relacionados directamente en la informacion proporcionada. No se dispone de datos de otros VLM cuantizados para MLX en la documentacion disponible.

## Limitaciones y advertencias

- **No es una version certificada**: el autor indica que no se cierran los gates formales M0-M8 de AXQuant, por lo que no debe interpretarse como un release de produccion.
- **Sin evidencia de calidad**: no se publican metricas de retencion de calidad frente al modelo BF16 original ni frente a cuantizaciones uniformes.
- **Contexto largo no validado**: la capacidad de 262.144 tokens es metadato de configuracion; no hay evidencia de calidad en contextos largos.
- **Calidad de vision no certificada**: aunque la torre de vision se preserva en BF16, la calidad vision-lenguaje no esta validada.
- **AX Engine no establecido**: no se incluye manifest nativo, por lo que la ejecucion via AX Engine no esta soportada de forma verificada.
- **Sin calibracion**: la asignacion de precision se basa en prioridades de arquitectura, no en calibracion con datos, lo que puede afectar a la robustez en tareas especificas.
- **Riesgo de alucinacion y sesgos**: no se han evaluado estos aspectos en la informacion disponible; se heredan los riesgos del modelo base sin analisis adicional.

## Enlaces

- [HuggingFace: AX-Qwen3-VL-32B-Thinking-MLX-AXQ-6bit](https://huggingface.co/AutomatosX/AX-Qwen3-VL-32B-Thinking-MLX-AXQ-6bit)
- [Modelo base: Qwen/Qwen3-VL-32B-Thinking](https://huggingface.co/Qwen/Qwen3-VL-32B-Thinking)
- [Hermano 4bit: AX-Qwen3-VL-32B-Thinking-MLX-AXQ-4bit](https://huggingface.co/AutomatosX/AX-Qwen3-VL-32B-Thinking-MLX-AXQ-4bit)
- [Colecciones de AutomatosX](https://huggingface.co/AutomatosX/collections)
