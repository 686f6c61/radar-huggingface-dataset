# litert-community/gemma-4-26B-A4B-it-litert-lm

## Resumen

Gemma 4 26B (A4B) es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Google, derivado de la misma investigación y tecnología empleadas en los modelos Gemini. Esta ficha concreta, publicada por la comunidad `litert-community`, no es el modelo original en formato de pesos estándar, sino una versión cuantizada y empaquetada en formato `.litertlm` para su ejecución en el runtime LiteRT-LM de Google, orientado a despliegue local en web y escritorio. El modelo base es `google/gemma-4-26B-A4B-it`, la variante instruida (chat) de 26 mil millones de parámetros totales con 4 mil millones de parámetros activos por token.

La relevancia de esta distribución radica en que permite ejecutar un modelo de 26B con activación dispersa directamente en hardware de consumo, sin necesidad de conexión a internet ni de infraestructura de servidor. LiteRT-LM es una capa de orquestación construida sobre LiteRT (el runtime multiplataforma de Google) que aporta aceleración por hardware mediante XNNPack para CPU y ML Drift para GPU, además de gestión de caché KV, plantillas de prompt y soporte de function calling. Es la misma pila tecnológica que alimenta la aplicación de demostración Google AI Edge Gallery.

El modelo se distribuye como una cuantización QAT (quantization-aware training) con pesos int4 por bloques y activaciones en coma flotante, optimizada específicamente para GPU. El repositorio ocupa 104,1 GB, aunque el archivo del modelo en disco ronda los 16,4 GB según los benchmarks publicados. La versión actual de LiteRT-LM soporta texto y visión; la predicción multi-token se anuncia para una actualización futura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, basada en la familia Gemma 4 de Google |
| Parámetros totales | 26 mil millones (26B) |
| Parámetros activos | 4 mil millones (A4B) |
| Longitud de contexto | Hasta 256k tokens (según la model card); benchmarks de escritorio realizados con 16.384 tokens |
| Tipos de cuantización | QAT con pesos int4 por bloques y activaciones float (optimizada para GPU) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token, lo que permite un coste computacional por token comparable al de un modelo denso de 4B pese a disponer de la capacidad representacional de un modelo mucho mayor. Esta ficha es una conversión cuantizada del modelo base `google/gemma-4-26B-A4B-it`, por lo que las características de entrenamiento (composición del dataset, número de tokens, uso de RLHF o DPO) corresponden al modelo original de Google y no se detallan en la información disponible para esta distribución.

La innovación técnica principal de este paquete es el formato `.litertlm` y su integración con LiteRT-LM, que añade capas especializadas de GenAI sobre el runtime LiteRT: gestión de caché KV, plantillas de prompt y function calling. La cuantización es de tipo QAT (quantization-aware training) con pesos int4 por bloques y activaciones en coma flotante, un esquema pensado para maximizar el rendimiento en GPU manteniendo la calidad. La versión actual soporta texto y visión; el soporte de predicción multi-token está anunciado pero no disponible todavía.

## Capacidades

- Generación de texto y razonamiento conversacional en modo instruido (sufijo `-it`).
- Procesamiento de visión: la versión actual de LiteRT-LM soporta entrada de imágenes (requiere LiteRT-LM v0.19.1 o superior).
- Soporte de function calling / tool calling, integrado en la capa LiteRT-LM.
- Ejecución local sin conexión a internet, con privacidad de datos al no enviar información a servidores externos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido (thinking mode): no disponible en la información proporcionada.
- Predicción multi-token: anunciada para una actualización futura, no disponible en la versión actual.

## Casos de uso

- Asistentes de escritorio con privacidad: al ejecutarse íntegramente en local mediante LiteRT-LM, el modelo permite construir asistentes que procesan documentos y conversaciones sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Aplicaciones web en el navegador: la distribución incluye soporte para web (Chrome) con contexto de hasta 256k tokens, lo que permite desplegar funcionalidades de IA generativa directamente en el cliente sin backend.
- Procesamiento de documentos con imágenes: gracias al soporte de visión, puede emplearse para extraer y razonar sobre información de capturas, formularios o diagramas en aplicaciones de escritorio.
- Automatización con herramientas: el soporte de function calling permite integrar el modelo en flujos que invocan APIs o funciones locales, como agentes de escritorio que consultan el sistema de archivos o servicios internos.
- Prototipado e investigación en edge computing: investigadores pueden evaluar el comportamiento de un MoE de 26B en hardware de consumo (RTX 4090, M4 Max) sin infraestructura de servidor, con throughput medido de 76-86 tokens/s en decodificación.
- Demostraciones y formación: la existencia de una demo web en Hugging Face Spaces y de la app Google AI Edge Gallery facilita mostrar capacidades de IA generativa local en entornos educativos o de evaluación.

## Benchmarks y rendimiento

Los datos publicados corresponden a rendimiento de inferencia (no a benchmarks de calidad como MMLU o HumanEval). Los benchmarks de escritorio se realizaron con 8.192 tokens de prefill y 512 de decodificación, contexto de 16.384 tokens, mediante LiteRT-LM CLI.

| Dispositivo | Backend | Prefill (tokens/s) | Decode (tokens/s) | Tiempo de inicialización (s) | Tamaño del modelo (MB) |
|---|---|---|---|---|---|
| NVIDIA 4090 24 GB (Linux) | GPU | 4487 | 86 | 27,89 | 16392 |
| MacBook Pro 2024 M4 Max 48 GB (macOS) | GPU | 1430 | 77 | 8,83 | 16392 |
| NVIDIA 5080 16 GB (Windows) | GPU | 1676 | 76 | 35,40 | 16392 |

En web (Chrome), con 1.024 tokens de prefill y 256 de decodificación y contexto de 1.280 tokens, la model card indica que el modelo puede soportar hasta 256k de contexto, pero los datos numéricos de esa tabla no están completos en la información disponible.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,2 GB de memoria GPU en macOS (M4 Max) según la model card; el archivo del modelo ocupa unos 16,4 GB en disco.
- GPU recomendadas y verificadas: NVIDIA RTX 4090 (24 GB), NVIDIA RTX 5080 (16 GB) y Apple M4 Max (48 GB unificada).
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM (RTX 5080 verificado); en macOS con memoria unificada de 48 GB.
- Requisito de software: LiteRT-LM v0.17.1 o superior en escritorio; v0.19.1 o superior para visión.
- Opciones de despliegue: LiteRT-LM CLI en escritorio (Linux, macOS, Windows) y navegador Chrome para web. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: decodificación de 76-86 tokens/s en las GPU verificadas; prefill de 1.430 a 4.487 tokens/s según dispositivo; tiempo de inicialización entre 8,83 s (M4 Max) y 35,40 s (RTX 5080).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos alternativos comparables de la misma categoría (MoE de tamaño medio para edge) ni sus especificaciones, por lo que no es posible establecer una comparación rigurosa sin inventar datos.

## Limitaciones y advertencias

- La información sobre idiomas soportados no está disponible; no se puede garantizar un rendimiento multilingüe equilibrado.
- Al ser una conversión cuantizada a int4, puede existir una degradación de calidad respecto al modelo base `google/gemma-4-26B-A4B-it` en tareas sensibles a la precisión numérica.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en esta distribución.
- La predicción multi-token no está disponible en la versión actual, lo que puede limitar el throughput en comparación con implementaciones futuras.
- Dependencia de un runtime propietario de facto (LiteRT-LM) y de versiones mínimas concretas (v0.17.1 / v0.19.1), lo que restringe la portabilidad frente a formatos como GGUF.
- El repositorio ocupa 104,1 GB, muy superior al tamaño del archivo del modelo, lo que puede complicar la descarga y el almacenamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base de Google para uso comercial, ya que la model card enlaza a la ficha original.
- No se documentan sesgos conocidos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/gemma-4-26B-A4B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentación de LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI de LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Aplicaciones de ejemplo: https://github.com/google-ai-edge/litert-samples
- Demo web en Hugging Face Spaces: https://huggingface.co/spaces/tylermullen/Gemma4
