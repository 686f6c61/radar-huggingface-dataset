# ProCreations/grug-v1.1-qwen-3.8-27b-awq-int4

## Resumen

Grug v1.1 Qwen3.8 27B es un modelo de lenguaje multimodal desarrollado por ProCreations, basado en la arquitectura Qwen3.8 de 27 mil millones de parametros. Esta ficha describe la version cuantizada AWQ INT4, orientada a despliegue con vLLM. El modelo combina un encoder de vision con un bloque de atencion hibrida que incluye GatedDeltaNet, un mecanismo de atencion lineal, y soporta generacion especulativa mediante una cabeza MTP (multi-token prediction) que se distribuye por separado.

La cuantizacion W4A16 asimetrica con grupo de tamano 128 reduce los pesos a 18.7 GB, manteniendo la torre de vision, embeddings, LM head y las compuertas GatedDeltaNet en BF16. Esta version esta pensada para servir el modelo con vLLM en entornos de produccion, con soporte de tool calling y razonamiento. El modelo base se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer con GatedDeltaNet (atencion lineal) + vision encoder (Qwen3.8) |
| Parametros totales | 27B (modelo base); pesos cuantizados en safetensors: 5.823.717.664 |
| Parametros activos | no disponible (no se ha confirmado si es MoE) |
| Longitud de contexto | 262.000 tokens (modelo base); 32.768 tokens en la configuracion de vLLM recomendada |
| Tipos de cuantizacion | AWQ INT4 asimetrico (W4A16), grupo de tamano 128; capas de vision, embeddings, LM head y compuertas GatedDeltaNet en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con compressed-tensors y vLLM |

## Arquitectura y entrenamiento
El modelo base grug-v1.1-qwen-3.8-27b es un modelo hibrido que combina un transformer clasico con bloques GatedDeltaNet, un mecanismo de atencion lineal que reduce el coste computacional en secuencias largas. Incluye un encoder de vision (image-text-to-text) y un namespace MTP para decodificacion especulativa, aunque el head MTP entrenado no se incluye en este repositorio cuantizado.

La cuantizacion AWQ se realizo calibrando sobre 128 muestras de Ultrachat con 1024 tokens por muestra, generando una cuantizacion W4A16 asimetrica con grupo de tamano 128. Las capas sensibles (vision tower, embeddings, LM head, compuertas GatedDeltaNet y namespace MTP) se mantienen en BF16 para preservar la calidad. Segun la informacion disponible, el entrenamiento del modelo base consumio 4.0 millones de tokens vistos y 1.25 millones de tokens supervisados en 489 pasos, completado en 26 minutos en una RTX PRO 6000. El head MTP es solo un borrador para acelerar la generacion y no altera las respuestas del modelo.

## Capacidades
- Generacion de texto y razonamiento conversacional, con parser de razonamiento qwen3 en vLLM.
- Soporte de tool calling y auto tool choice mediante el parser qwen3_coder.
- Capacidades de vision: procesamiento de imagen y texto (image-text-to-text).
- Generacion especulativa: el modelo base admite MTP, pero el head MTP no esta incluido en este repositorio cuantizado.
- Compatible con vLLM, con configuracion recomendada de contexto de 32.768 tokens.
- Multilingue: no hay informacion detallada de idiomas soportados en los datos disponibles.

## Casos de uso
- Asistentes de atencion al cliente multimodal: el modelo puede procesar capturas de pantalla o imagenes de productos junto con el historial de conversacion, gracias a su encoder de vision y contexto de 32k tokens, permitiendo respuestas contextualizadas en entornos de soporte.
- Agentes con uso de herramientas: con el parser qwen3_coder y auto tool choice, puede integrarse en pipelines que requieren llamadas a APIs, busquedas en bases de datos o ejecucion de codigo, por ejemplo en un asistente de desarrollo que consulta documentacion y ejecuta tests.
- Generacion de codigo asistida en IDE: la cuantizacion AWQ INT4 permite servir el modelo en una GPU de 24 GB, adecuado para entornos de desarrollo con asistencia de codigo en tiempo real, incluyendo la generacion de funciones y refactorizacion.
- Razonamiento sobre documentos con imagenes: al procesar texto e imagenes, puede resumir informes con graficos o diagramas, por ejemplo, en analisis de documentacion tecnica o legal.
- Despliegue en entornos con recursos limitados: con 18.7 GB de pesos, cabe en una RTX 4090 o similar, permitiendo un servidor local de inferencia sin necesidad de hardware de centro de datos.
- Prototipado rapido de aplicaciones RAG: la configuracion con vLLM y contexto de 32k tokens facilita la integracion en sistemas de recuperacion aumentada para respuestas a preguntas sobre corpus extensos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks especificos para la version cuantizada AWQ INT4 en la informacion disponible. La busqueda web menciona que Qwen3.8-27B tiene benchmarks publicados, pero no se proporcionan los numeros concretos. No se puede confirmar el rendimiento relativo de esta cuantizacion frente a otros modelos sin datos verificables.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio cuantizado ocupa 18.7 GB, por lo que se estima que se necesita entre 20 y 24 GB de VRAM para servir con vLLM (incluyendo overhead de activaciones y cache KV).
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A10G (24 GB) o superiores. Para el modelo base en BF16 se necesitan aproximadamente 54.8 GB de VRAM, segun datos de LLM Explorer, lo que requiere A100 80GB, H100 o multiples GPU.
- Compatible con consumer GPU de 24 GB: si, en cuantizacion AWQ INT4.
- Opciones de despliegue: vLLM (recomendado), con soporte para compressed-tensors y safetensors. Tambien es compatible con transformers de HuggingFace.
- Latencia y throughput: no se proporcionan datos medidos. El uso de MTP (en el repo -mtp-) podria acelerar la decodificacion, pero este repositorio no incluye el head MTP.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProCreations/grug-v1.1-qwen-3.8-27b (base) | 27B | 262k | Apache 2.0 | HuggingFace |
| ProCreations/grug-v1.1-qwen-3.8-27b-awq-int4 (este) | 27B (5.8B cuantizado) | 32k (recomendado) | Apache 2.0 | HuggingFace |
| ProCreations/grug-27b (anterior) | 27B | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.8-27B (original) | 27B | 262k | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- La cuantizacion AWQ INT4 puede introducir una degradacion en la calidad de las respuestas respecto al modelo BF16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El head MTP no esta incluido en este repositorio, por lo que la decodificacion especulativa requiere descargar el repositorio `-mtp-` separado.
- La configuracion de vLLM recomienda 32.768 tokens de contexto, aunque el modelo base soporta 262k; superar ese limite puede causar errores de memoria o degradacion.
- No se han publicado datos de sesgos o alucinaciones especificos de este modelo. Como cualquier LLM, puede generar contenido incorrecto o inventado, por lo que se recomienda validar las salidas en aplicaciones criticas.
- Los datos de entrenamiento del modelo base no estan detallados en la informacion disponible; se menciona el uso de Ultrachat para calibracion de la cuantizacion, pero no la composicion del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el autor no proporciona garantias de rendimiento ni soporte.

## Enlaces
- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-awq-int4
- Repositorio HuggingFace del modelo base: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- Repositorio HuggingFace de la version anterior: https://huggingface.co/ProCreations/grug-27b
- Ficha en LLM Explorer (VRAM y despliegue): https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi
- Analisis de Qwen3.8-27B (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Endpoint de inferencia con MTP en FriendliAI: https://friendli.ai/models/ProCreations/grug-v1.1-qwen-3.8-27b-mtp
