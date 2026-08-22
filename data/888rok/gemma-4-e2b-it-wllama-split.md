# 888rok/gemma-4-E2B-it-wllama-split

## Resumen

Este repositorio contiene una versión dividida en tres fragmentos del archivo GGUF `gemma-4-E2B-it-UD-IQ2_M.gguf`, generado por Unsloth a partir del modelo original de Google Gemma 4 E2B IT. El objetivo es permitir su ejecución en navegadores web mediante la librería [wllama](https://github.com/ngxson/wllama), que tiene un límite de tamaño de archivo de 2 GB por carga en memoria (ArrayBuffer). Al dividir el archivo en shards de menos de 1 GB, se puede cargar de forma incremental.

El modelo base, Gemma 4 E2B IT, es una versión compacta y multimodal de la familia Gemma 4, con aproximadamente 2.100 millones de parámetros y una ventana de contexto de 8.000 tokens. Está diseñado para ejecutarse eficientemente en dispositivos con recursos limitados, como navegadores, teléfonos o sistemas embebidos. Esta cuantización IQ2_M reduce el tamaño a 2,3 GB, sacrificando algo de precisión para conseguir un peso ligero y viable en entornos de bajo consumo.

La relevancia actual radica en que permite desplegar un modelo de lenguaje con capacidades de razonamiento y multimodalidad directamente en el navegador, sin necesidad de servidores externos ni GPUs dedicadas, lo que abre nuevas posibilidades para aplicaciones de IA en el cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B) |
| Parametros totales | 4.647.450.147 (dato del safetensors original) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.000 tokens (segun gemma4.dev) |
| Tipos de cuantizacion | UD-IQ2_M (GGUF cuantizado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (dividido en 3 shards) |

## Arquitectura y entrenamiento

El modelo original Gemma 4 E2B es un modelo denso de 2.100 millones de parámetros, con arquitectura transformer multimodal que integra encoders de vision y audio de forma unificada, sin encoders externos. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens, ni los procesos de alineación (RLHF, DPO, etc.) en la informacion proporcionada.

La versión aquí presentada es una cuantizacion IQ2_M del modelo GGUF de Unsloth, que reduce el tamaño de los pesos a 2,3 GB. Esta cuantizacion usa un esquema de compresión agresivo (2 bits por peso) que puede afectar la calidad de las respuestas, especialmente en tareas de razonamiento complejo.

## Capacidades

- Generacion de texto y conversacion en lenguaje natural.
- Razonamiento y pensamiento multi-step (modo thinking segun la web de vLLM).
- Capacidad multimodal: procesamiento de texto, imagenes y audio (el modelo base, aunque la cuantizacion puede limitar el rendimiento).
- Soporte de tool calling y protocolo de uso de herramientas (según vLLM).
- Adecuado para ejecucion en CPU y navegadores web via wllama.
- Multilingue (idiomas concretos no especificados).

## Casos de uso

- **Asistente personal en el navegador**: el modelo puede ejecutarse directamente en una página web para responder preguntas, mantener conversaciones o generar contenido, sin enviar datos a un servidor. La ventana de 8K tokens permite diálogos de varias turnos.
- **Herramienta de desarrollo para IA en el cliente**: los desarrolladores pueden integrar el modelo en aplicaciones web usando wllama, para crear chatbots o asistentes de código que funcionan offline.
- **Procesamiento de texto local**: extracción de información, resumen de documentos o generación de borradores en dispositivos con recursos limitados, como tablets o móviles.
- **Educación y aprendizaje**: uso en entornos educativos para simular conversaciones o explicar conceptos, sin depender de internet.
- **Prototipado rápido**: los equipos de producto pueden probar funcionalidades de IA en el navegador sin necesidad de configurar un backend.
- **Aplicaciones de accesibilidad**: asistencia para personas con discapacidad visual o auditiva, gracias a su capacidad multimodal (aunque la cuantizacion puede degradar el rendimiento).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM**: al ser un modelo cuantizado de 2,3 GB, puede ejecutarse en CPU sin necesidad de GPU dedicada. En GPU, se estima que requiere menos de 2 GB de VRAM para la inferencia.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050). No se requiere GPU de alta gama.
- **CPU**: funciona en procesadores modernos con 8 GB de RAM o más.
- **Opciones de despliegue**: la principal vía es mediante wllama en navegador (Chrome, Firefox, Edge). También se puede usar con llama.cpp o Ollama, pero la división en shards está pensada específicamente para wllama.
- **Latencia**: no hay datos públicos sobre throughput o latencia. Se espera una velocidad de generación de 1-3 tokens por segundo en CPU, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información de comparación con otros modelos en la fuente. Como alternativa, se pueden considerar modelos de tamaño similar como Phi-3-mini (3.8B), Qwen2-1.5B, o Gemma-2B, pero no se tienen datos objetivos de rendimiento para comparar.

## Limitaciones y advertencias

- **Cuantizacion agresiva**: el uso de IQ2_M reduce la precisión y puede producir errores de razonamiento o alucinaciones más frecuentes que la versión sin cuantizar.
- **Contexto limitado**: la ventana de 8K tokens es corta para tareas que requieran largos documentos o conversaciones extensas.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base de Gemma 4 es multilingüe, pero la cuantizacion puede afectar el rendimiento en idiomas distintos al inglés.
- **Licencia desconocida**: no se indica la licencia de esta versión dividida, lo que puede impedir su uso comercial sin verificación previa.
- **Compatibilidad**: la división en shards es específica para wllama; otros sistemas pueden no resolver automáticamente los fragmentos.
- **Multimodalidad**: aunque el modelo base es multimodal, la cuantizacion puede degradar la calidad de procesamiento de imágenes y audio, y no se garantiza que wllama soporte todas las funciones multimodales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/888rok/gemma-4-E2B-it-wllama-split)
- [Modelo base GGUF de Unsloth](https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF)
- [Página de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Receta de vLLM para Gemma 4 E2B](https://recipes.vllm.ai/Google/gemma-4-E2B-it)
- [Ficha de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Technical Report de Gemma 4 (arXiv)](https://arxiv.org/pdf/2607.02770)
- [wllama - biblioteca para ejecutar modelos GGUF en el navegador](https://github.com/ngxson/wllama)
