# mensaprodigy/Qwen3.8-27B-oQ6e-mtp

## Resumen

Este repositorio contiene una cuantización en formato MLX del modelo Qwen3.8-27B, realizada por la comunidad (autor `mensaprodigy`) para su uso en Apple Silicon. No se trata de un lanzamiento oficial de Qwen, sino de una conversión de pesos que empaqueta el modelo base con metadatos compatibles para inferencia local mediante el runtime oMLX. El modelo base, desarrollado por Qwen / Alibaba Cloud, es una arquitectura multimodal `qwen3_5` con soporte de tokens de imagen y vídeo, y una ventana de contexto máxima declarada de 262 144 tokens.

La cuantización emplea el esquema oQ6e de precisión mixta: 6 bits afines con grupo de tamaño 64, y ciertos tensores sensibles a la precisión se mantienen en 8 bits. Se incluye además la capa MTP (multi-token prediction) del modelo original, que puede acelerar la generación. El paquete incorpora la plantilla de chat "Qwen Sharp Chat Template v22", que preserva los placeholders de visión y el formato de tool-calling, añadiendo controles configurables para el modo de razonamiento.

La relevancia de este artefacto radica en que permite ejecutar un modelo de 27 000 millones de parámetros con capacidades multimodales en hardware Apple Silicon, algo que de otro modo sería inviable por los requisitos de memoria. Sin embargo, al ser una conversión comunitaria, no se ofrecen garantías de rendimiento ni benchmarks formales, por lo que se recomienda una evaluación propia antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 multimodal (soporte de imagen y video) |
| Parametros totales | no disponible (el nombre del repositorio sugiere 27B, no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (maximo teorico del modelo base; el contexto practico depende del runtime) |
| Tipos de cuantizacion | oQ6e (6-bit affine, grupo 64, con tensores seleccionados a 8-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (5 shards, 2209 tensores indexados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer multimodal denominada `qwen3_5`, que incorpora codificadores de imagen y vídeo además del módulo de lenguaje. Incluye una capa MTP (multi-token prediction) que permite predecir varios tokens por paso, lo que puede reducir la latencia de generación. La conversión aquí presentada no modifica la arquitectura, solo los pesos, que se cuantizan a 6 bits con precisión mixta (oQ6e) mediante un proceso de calibración OQE con la matriz de importancia `oqe_code_multilingual`, utilizando 128 muestras de secuencia de longitud 512 y capturando 615 módulos lineales.

No se proporciona información sobre el entrenamiento del modelo original (datos, número de tokens, técnicas de alineación como RLHF o DPO). Esta conversión es únicamente un artefacto de inferencia, no un checkpoint de entrenamiento. La plantilla de chat incluida (Qwen Sharp v22) añade directrices para respuestas directas y controles de razonamiento, pero no altera los pesos del modelo.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas no especificados en la conversión, pero el modelo base es multilingüe).
- Procesamiento multimodal: acepta entradas de imagen y vídeo mediante tokens especiales, lo que permite tareas de descripción, análisis y respuesta a preguntas visuales.
- Soporte de tool calling / function calling, con formato preservado en la plantilla de chat.
- Modo de razonamiento configurable (thinking mode) mediante la plantilla, que permite activar o desactivar la generación de cadenas de pensamiento.
- Multi-token prediction (MTP) para acelerar la inferencia, aunque su efecto depende del runtime.
- Compatible con el ecosistema MLX y con endpoints OpenAI-compatible a través de oMLX.

## Casos de uso

- Asistente de chat local en Mac: gracias a su cuantización y al runtime oMLX, puede desplegarse un asistente conversacional con contexto largo (hasta 262k tokens teóricos) directamente en un Mac con Apple Silicon, sin depender de servicios en la nube.
- Análisis de imágenes y vídeos: al ser multimodal, puede utilizarse para generar descripciones, responder preguntas sobre contenido visual o extraer información de vídeos, por ejemplo en aplicaciones de accesibilidad o revisión de material audiovisual.
- Generación de código con tool calling: su soporte de function calling permite integrarlo en agentes que ejecutan comandos, consultan APIs o interactúan con entornos de desarrollo, facilitando tareas de programación asistida.
- Automatización de atención al cliente: con la ventana de contexto amplia, puede mantener conversaciones multi-turno extensas y recordar detalles de interacciones previas, aunque se debe validar la calidad en el idioma objetivo.
- Prototipado de agentes multimodales: la combinación de visión, texto y tool calling lo hace adecuado para experimentar con agentes que procesan entradas mixtas (por ejemplo, capturas de pantalla y comandos).
- Investigación en inferencia local eficiente: sirve como referencia para estudiar el impacto de la cuantización oQ6e en modelos grandes sobre hardware de consumo, comparando calidad y rendimiento con otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio indica explícitamente que no se reivindica ningún conjunto de pruebas formal para esta conversión. Se recomienda evaluar el modelo con cargas de trabajo propias (prompts, idiomas, tareas de visión, tool calls y longitudes de contexto) antes de su uso en producción.

## Requisitos de hardware

- Destinado exclusivamente a Apple Silicon (chips M1, M2, M3, M4 y sucesores) con el runtime oMLX.
- Memoria unificada estimada: el repositorio ocupa 23,7 GB en disco, por lo que se recomienda un mínimo de 32 GB de RAM unificada para cargar los pesos y dejar margen para el contexto y el KV-cache. Con 24 GB podría ser insuficiente para contextos largos.
- No es compatible con GPUs NVIDIA o AMD; requiere el ecosistema MLX.
- Opciones de despliegue: oMLX (probado), y potencialmente otros runtimes MLX que acepten safetensors con metadatos compatibles.
- Latencia y throughput: no disponibles. Dependen del chip concreto, la memoria disponible y la configuración del contexto.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otras cuantizaciones del mismo modelo base ni con alternativas de tamaño similar en el ecosistema MLX. La información proporcionada no incluye referencias a otros modelos comparables.

## Limitaciones y advertencias

- Es una cuantización comunitaria, no un lanzamiento oficial de Qwen; puede haber diferencias de calidad, latencia y comportamiento respecto al modelo BF16 original.
- La cuantización a 6 bits puede degradar la precisión en tareas sensibles, especialmente en razonamiento complejo, generación de código o salidas estructuradas.
- No se han realizado benchmarks formales; el rendimiento real es desconocido y debe validarse para cada caso de uso.
- El contexto máximo de 262 144 tokens es teórico; en la práctica depende de la memoria unificada disponible, el runtime y la configuración del KV-cache. Sesiones largas con historial de razonamiento pueden aumentar el coste de prefill.
- No se especifican los idiomas soportados en esta conversión; aunque el modelo base es multilingüe, la calidad puede variar según el idioma.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución y los avisos de licencia del modelo original y de la plantilla de chat.
- Para uso en producción, es imprescindible probar el comportamiento con tool calls, entradas multimodales y contextos largos, ya que la cuantización puede alterar estos aspectos.

## Enlaces

- Repositorio de HuggingFace: [mensaprodigy/Qwen3.8-27B-oQ6e-mtp](https://huggingface.co/mensaprodigy/Qwen3.8-27B-oQ6e-mtp)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Plantilla de chat: [peculiar-ragdoll/Qwen-Sharp-Chat-Templates](https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates)
