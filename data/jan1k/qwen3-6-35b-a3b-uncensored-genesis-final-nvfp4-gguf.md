# jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-NVFP4-GGUF

## Resumen

El modelo `Qwen3.6-35B-A3B-Uncensored-Genesis-Final-NVFP4-GGUF` es una cuantización en formato NVFP4 (NVIDIA FP4) de la versión final desarrollada por LuffyTheFox, que a su vez parte del modelo base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`. Se trata de un modelo de mezcla de expertos (MoE) con 34.660.671.320 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, distribuidos en 8 expertos enrutados más 1 experto compartido. La variante presentada por jan1k añade la cuantización NVFP4 y una integración de predicción multi-token (MTP) para decodificación especulativa en llama.cpp.

El modelo está diseñado para eliminar por completo los rechazos de seguridad (0/465 refusals según la model card), por lo que se presenta como una versión "uncensored". Además, es multimodal y admite entrada de imágenes mediante un proyector visual (`mmproj-Hermes3.6-35B-A3B-Uncensored-Genesis-F16.gguf`). La técnica "Genesis" desarrollada por LuffyTheFox consiste en una reparación numérica de los tensores del modelo en formato GGUF, aplicando normalización estadística y reducción de ruido basada en la ley de Marchenko-Pastur, sin necesidad de reentrenamiento. El contexto declarado en los ejemplos de uso es de 131.072 tokens (128K), y el soporte de tool calling en formato JSON está disponible mediante la plantilla de chat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) — 8 expertos enrutados + 1 compartido |
| Parametros totales | 34.660.671.320 (~34,66 mil millones) |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | NVFP4 (NVIDIA FP4) en GGUF; variante con MTP integrado |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de mezcla de expertos (MoE) con 8 rutas de expertos y un experto compartido, lo que permite activar solo alrededor de 3 mil millones de parámetros por token, reduciendo el coste computacional en comparación con un modelo denso del mismo tamaño total. El componente visual se integra mediante un proyector multimodal (`mmproj`) que permite procesar entradas de imagen junto con texto, y el pipeline declarado es `image-text-to-text`.

El proceso de entrenamiento posterior denominado "Genesis" es una técnica de reparación de datos aplicada directamente sobre los pesos en formato GGUF. Consta de tres etapas: en la primera se escanean los tensores `ssm_conv1d` relacionados con la memoria de contexto largo para equilibrar las cabezas; en la segunda se sustituyen bloques de ceros corruptos por los tramos que mejor se ajustan a la distribución de pesos del tensor, sin alterar la estructura aprendida; en la tercera se aplica una descomposición en valores singulares (SVD) personalizada para reducir el ruido de entrenamiento, preservando el 99% de la señal y del gradiente aprendido conforme a la ley de Marchenko-Pastur. Este procedimiento no requiere reentrenamiento. Además, la rama MTP añade una cabeza de predicción multi-token que se usa como modelo borrador para decodificación especulativa en llama.cpp, lo que puede acelerar la generación.

## Capacidades

- Generación de texto y razonamiento: incluye un modo de pensamiento explícito (`--reasoning on`), con niveles de esfuerzo configurables.
- Multimodalidad: admite entrada de imágenes a través del proyector visual `mmproj`, lo que permite responder a prompts que combinan texto e imagen.
- Tool calling y function calling: integrado con la plantilla de chat; se puede emitir JSON estándar de OpenAI mediante `--chat-template-kwargs '{"enable_thinking": true, "tool_call_format": "json"}'`.
- Soporte de agentes y razonamiento multi-paso: la combinación de thinking mode activado, tool calling y contexto largo de 128K facilita tareas de planificación y ejecución secuencial.
- Multilingüismo: el modelo está entrenado y evaluado en inglés y chino, con soporte multilingüe adicional indicado en los metadatos.
- Decodificación especulativa: la variante MTP incluida en el repositorio permite usar `--spec-type draft-mtp` para acelerar la inferencia.
- Ausencia de rechazos: al ser una versión "uncensored", no impone filtros de contenido, lo que facilita respuestas sin restricciones de seguridad.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo de hasta 128K, consultar bases de conocimiento externas mediante tool calling y mantener coherencia en interacciones extensas.
- Generación de código en entornos de desarrollo: con el perfil "Coding/Precise" (temperatura 0.6, Top K 20, Top P desactivado) es adecuado para revisar fragmentos de código, generar scripts y explicar algoritmos de forma concisa.
- Agentes autónomos: la capacidad de razonamiento multi-paso junto con el soporte de herramientas en JSON permite construir asistentes que encadenan llamadas a funciones, resuelven problemas y verifican resultados de forma iterativa.
- Análisis de documentos e imágenes: gracias al proyector multimodal, el modelo puede interpretar capturas de pantalla, diagramas y documentos escaneados para extraer información o responder preguntas sobre el contenido visual.
- Roleplay y escritura creativa sin filtros: con el perfil "Creative/Roleplay" (thinking OFF, temperatura 1.0, Top K 20), es útil para simular personajes, desarrollar narrativas y explorar escenarios que requieren libertad de expresión.
- Traducción y procesamiento multilingüe: al estar entrenado en inglés y chino, sirve para traducir textos técnicos, resumir documentos multilingües y responder consultas en varios idiomas.
- Investigación de alineación y seguridad: al tratarse de un modelo sin rechazos de seguridad, puede ser empleado en entornos de investigación para estudiar comportamientos no filtrados, analizar riesgos de alucinación y evaluar estrategias de mitigación.
- Despliegue de inferencia de baja latencia: la variante MTP permite reducir el tiempo de generación en servicios locales mediante llama-server, especialmente en hardware NVIDIA compatible con NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El repositorio no incluye métricas cuantitativas de rendimiento, y los resultados de la búsqueda web tampoco aportan referencias de evaluaciones externas.

## Requisitos de hardware

No se dispone de mediciones oficiales de VRAM o latencia. A partir del tamaño de los pesos en NVFP4 (34.660.671.320 parámetros a aproximadamente 4 bits), se puede estimar:

- VRAM estimada: en torno a 17-18 GB para los pesos cuantizados. Sumando el proyector visual `mmproj` y la caché KV para 128K de contexto, una GPU de 24 GB (RTX 4090) podría ejecutar el modelo con contextos moderados o con descarga parcial de capas a CPU.
- GPU recomendadas: NVIDIA Ampere, Ada Lovelace y Blackwell, según la model card. En concreto, A100/H100 de 80 GB o varias GPU para aprovechar el contexto completo de 128K y la decodificación especulativa.
- Compatibilidad con GPUs de consumo: es posible ejecutarlo en una RTX 4090 con contexto reducido, o en una RTX 3090 (24 GB) con mayor descarga de capas, aunque la KV cache para 128K puede superar la memoria disponible.
- Opciones de despliegue: llama.cpp y `llama-server` son las opciones principales, ya que el formato es GGUF. La plataforma Ollama también puede cargar archivos GGUF, aunque la compatibilidad con NVFP4 y MTP dependerá de la versión. vLLM y TGI no soportan nativamente este formato de cuantización.
- Latencia y throughput: no disponibles. La variante MTP está diseñada para mejorar la velocidad de generación mediante `--spec-draft-n-max` y `--spec-draft-p-min`, pero no hay datos de rendimiento publicados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-NVFP4-GGUF` | 34.660.671.320 | 131.072 | NVFP4 GGUF | Apache 2.0 | HuggingFace |
| `LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF` | no disponible | no disponible | GGUF (formato original) | Apache 2.0 | HuggingFace |
| `burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF` | no disponible | no disponible | GGUF (recomendado APEX o Q8_K_P) | no disponible | HuggingFace |
| `LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V3-GGUF` | no disponible | no disponible | GGUF | no disponible | HuggingFace |

Todas las variantes mencionadas comparten la misma base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, pero no se disponen de especificaciones completas ni benchmarks para establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Sesgos y contenido no filtrado: al ser "uncensored", el modelo no aplica alineación de seguridad y puede generar contenido dañino, ilegal o potencialmente ofensivo. Esto debe considerarse antes de cualquier uso comercial o público.
- Riesgo de alucinación: como en todos los modelos de lenguaje, puede producir afirmaciones falsas o inventadas. La técnica Genesis reduce el ruido numérico, pero no garantiza veracidad factual.
- Limitaciones de contexto: el contexto de 128K puede degradar la calidad en distancias largas, y la memoria necesaria para la caché KV en ese tamaño puede ser prohibitiva en GPUs de consumo.
- Configuración específica: el rendimiento óptimo requiere desactivar Top P y Min P para tareas de código y precisión, así como ajustar los parámetros de `--chat-template-kwargs` para tool calling. Un uso incorrecto puede reducir la calidad de las respuestas.
- Compatibilidad de hardware: la cuantización NVFP4 está diseñada para GPUs NVIDIA (Ampere, Ada, Blackwell). En otras plataformas (AMD, Apple Silicon), el modelo puede ejecutarse en GGUF, pero la precisión y el rendimiento no son óptimos.
- Sin evaluaciones públicas: al carecer de benchmarks publicados, no es posible validar su rendimiento frente a otros modelos de referencia, lo que supone un riesgo para su adopción en producción.
- Dependencia de herramientas externas: el soporte multimodal y la decodificación especulativa dependen de archivos adicionales (`mmproj`) y de una configuración precisa en llama.cpp, lo que añade complejidad operativa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-NVFP4-GGUF
- Modelo base (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original de LuffyTheFox: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF
- Variante Hermes V5 (burningfeet): https://huggingface.co/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF
- Variante Hermes V3 (LuffyTheFox): https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V3-GGUF
