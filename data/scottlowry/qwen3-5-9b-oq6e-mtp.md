# scottlowry/Qwen3.5-9B-oQ6e-mtp

## Resumen

Qwen3.5-9B-oQ6e-mtp es una cuantización mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario scottlowry y generada con la herramienta oQ de oMLX (versión v0.7.4.dev1). El modelo base pertenece a la familia Qwen3.5 de Alibaba, con 9.653 millones de parámetros totales repartidos entre un modelo de lenguaje, un codificador visual y una cabeza MTP (multi-token prediction). La cuantización aplica precisión mixta sobre los pesos originales, con un promedio efectivo de 7,172 bits por peso.

El interés de esta variante es práctico: reduce el peso del checkpoint a 8,06 GiB de almacenamiento efectivo, lo que lo hace apto para inferencia en Apple Silicon mediante MLX, la librería declarada en el repositorio. La presencia de una cabeza MTP sugiere soporte de decodificación especulativa o predicción multi-token, una técnica orientada a acelerar la generación.

La ficha que sigue se basa únicamente en los metadatos públicos del repositorio de Hugging Face y en la model card del autor. No se dispone de información sobre la licencia del modelo base ni de datos de evaluación, por lo que esos apartados se marcan como no disponibles. El repositorio tiene 44 descargas y se actualizó por última vez el 11 de noviembre de 2026 para re-cuantizar con una versión más reciente de oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual + cabeza MTP); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | No aplica; no se documenta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización mixta: 85,464% de los pesos en affine 6-bit (grupo 64), 9,453% en affine 8-bit (grupo 64), 5,083% en BF16. Promedio efectivo de 7,172 bits/peso |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería MLX); el tag "mlx" indica formato nativo de MLX en lugar de GGUF |
| Tamano del repositorio | 34,2 GB |
| Tamano del checkpoint cuantizado | 8,654 GB / 8,060 GiB de almacenamiento efectivo |
| Desglose de pesos | Lenguaje: 8,954B (7,499 GB); visión: 0,456B (0,912 GB); cabeza MTP: 0,243B (0,243 GB) |
| Version de la herramienta de cuantizacion | oQ de oMLX v0.7.4.dev1 |
| Fecha de creacion / ultima actualizacion | 23 de julio de 2026 / 11 de noviembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentación proporcionada. Los metadatos del checkpoint permiten deducir tres componentes: un modelo de lenguaje con 8,954B de parámetros, un codificador visual con 0,456B de parámetros y una cabeza de predicción multi-token (MTP) con 0,243B. La presencia del codificador visual confirma que el modelo base es multimodal, y la cabeza MTP apunta a decodificación especulativa o generación multi-token como mecanismo de aceleración.

El proceso de entrenamiento del modelo base no está documentado en la información disponible: no se indican el número de tokens, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. El proceso de cuantización sí está descrito: oQ de oMLX aplica precisión mixta asignando 6 bits a la mayoría de las capas (85,464%), 8 bits a una fracción menor (9,453%) y manteniendo en BF16 el 5,083% restante, presumiblemente capas sensibles a la precisión como las de normalización o los embeddings. El resultado es un checkpoint de 8,06 GiB que conserva la estructura completa del modelo, incluidos el codificador visual y la cabeza MTP.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, si bien no se detallan en la model card.
- Procesamiento de imágenes: el checkpoint incluye un codificador visual de 0,456B de parámetros, lo que implica soporte de entrada multimodal imagen-texto.
- Predicción multi-token (MTP): la cabeza MTP de 0,243B está diseñada para acelerar la decodificación mediante predicción de varios tokens futuros o decodificación especulativa.
- Inferencia en hardware Apple Silicon: la integración con MLX permite ejecutar el modelo en Macs con memoria unificada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se listan idiomas en los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Prototipado local en Mac: gracias a su tamaño de 8,06 GiB y a la integración con MLX, el modelo se puede cargar en un MacBook con 16 GB o más de memoria unificada para experimentar con un modelo multimodal de 9B sin depender de servicios en la nube.
- Aplicaciones de visión por computador en local: el codificador visual integrado permite describir imágenes, responder preguntas sobre capturas de pantalla o extraer información de documentos escaneados en un flujo de trabajo sin conexión.
- Generación de texto asistida en escritorio: un asistente de redacción integrado en una aplicación nativa de macOS podría usar el modelo para resumir, reescribir o completar texto, manteniendo los datos del usuario en el dispositivo.
- Investigación sobre cuantización: el repositorio sirve como referencia para estudiar el efecto de la cuantización mixta de oQ comparando el rendimiento con el checkpoint BF16 original de Qwen3.5-9B.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir en MLX la ganancia de velocidad de la predicción multi-token frente a la decodificación autorregresiva estándar.
- Fines educativos y demos: con 44 descargas y un tamaño manejable, el modelo es adecuado para talleres y demostraciones de inferencia local de modelos multimodales en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 8,06 GiB, por lo que la inferencia requiere al menos 10-12 GB de memoria libre en la práctica para acomodar el modelo y la caché KV.
- Memoria unificada en Apple Silicon: cabe en Macs con 16 GB (M1/M2/M3/M4 base), con mayor margen en configuraciones de 24 GB o 32 GB.
- GPUs dedicadas: el formato está orientado a MLX, por lo que no es directamente compatible con CUDA. Para GPUs NVIDIA habría que recurrir al checkpoint original de Qwen3.5-9B u otra cuantización.
- Despliegue: la librería declarada es MLX; se puede usar con mlx-lm y herramientas compatibles del ecosistema Apple. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ6e-mtp (este) | 9,653B | No disponible | MLX safetensors, cuantización mixta ~7,17 bits/peso | No disponible | Hugging Face, 44 descargas |
| Qwen/Qwen3.5-9B (base) | 9,653B | No disponible | Safetensors BF16 | No disponible | Hugging Face (modelo original) |
| Otras cuantizaciones de Qwen3.5-9B | 9,653B | No disponible | GGUF / otras | Depende del publicador | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de modelos alternativos documentados en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- La cuantización mixta introduce pérdida de precisión respecto al modelo BF16 original; el impacto en calidad no está evaluado en la model card.
- La licencia no está declarada en el repositorio, por lo que no se puede confirmar si el uso comercial está permitido. Es necesario consultar la licencia del modelo base Qwen/Qwen3.5-9B antes de cualquier uso en producción.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA o AMD sin conversión.
- No se documentan los idiomas soportados, el sesgo ni la tasa de alucinación del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, no cuantificado en la información disponible.
- El repositorio tiene muy poca tracción (44 descargas, 0 likes) y una única actualización de re-cuantización; conviene verificar la integridad de los pesos antes de usarlo.
- El tamaño del repositorio (34,2 GB) es muy superior al checkpoint efectivo (8,06 GiB), lo que sugiere que contiene versiones o artefactos adicionales; hay que revisar los archivos antes de la descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
