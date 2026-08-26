# Lucierr8732/Qwen3-1.7B-LOMO-q4f16_1-MLC2

## Resumen

Este repositorio contiene los pesos del modelo Qwen3-1.7B de Alibaba, reformateados y cuantizados por Lucierr8732 para su ejecución en dispositivos mediante el runtime MLC-LLM. El objetivo es facilitar la inferencia on-device en Android (vía Vulkan) y CPU, un formato que no es directamente compatible con Hugging Face Transformers pero que permite desplegar el modelo en aplicaciones móviles con un footprint reducido.

El modelo base, Qwen3-1.7B, pertenece a la familia Qwen3 lanzada por QwenLM, que incluye modelos densos y MoE desde 0.6B hasta 235B-A22B. Qwen3 destaca por su modo de pensamiento híbrido (thinking y non-thinking), mejoras en razonamiento, seguimiento de instrucciones, uso de herramientas y soporte multilingüe. Esta variante concreta aplica una cuantización q4f16_1 (pesos int4 con escala en f16 y grupo de 32) y ocupa aproximadamente 1.0 GB, lo que la hace viable para smartphones y dispositivos con memoria limitada.

La relevancia actual de esta ficha radica en la creciente demanda de modelos de lenguaje ejecutables en el dispositivo, sin dependencia de la nube, para aplicaciones de asistente personal, chat privado o análisis de texto offline. El repositorio está orientado a desarrolladores que integran MLC-LLM en sus aplicaciones móviles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B, serie Qwen3) |
| Parametros totales | 1.7B (aprox., no se indica el valor exacto) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en el repo (el Qwen3-1.7B oficial soporta 32K) |
| Tipos de cuantizacion | q4f16_1 (int4 weights + f16 scales, group size 32) |
| Idiomas soportados | No disponibles (el Qwen3 base es multilingüe, pero no se detalla en este repo) |
| Licencia | other (no especificada en el repo; el modelo base Qwen3 usa Apache 2.0) |
| Formato de pesos | MLC-LLM (params_shard_*.bin, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de la familia Qwen3 que se entrena con una mezcla de datos multilingüe y un pipeline que incluye preentrenamiento y ajuste fino con supervisión (SFT) y optimización por preferencias (RLHF). Qwen3 introduce un mecanismo de pensamiento híbrido: el modelo puede operar en modo "thinking" (razonamiento paso a paso antes de responder) o en modo "non-thinking" (respuesta directa), controlable mediante un token especial o parámetro de configuración. La versión actualizada Qwen3-Instruct-2507 mejora significativamente el seguimiento de instrucciones, razonamiento lógico, matemáticas, ciencia, codificación y uso de herramientas.

En este repositorio, los pesos del modelo se han convertido al formato MLC-LLM y se han cuantizado con q4f16_1, que usa pesos de 4 bits con escalas en punto flotante de 16 bits y un tamaño de grupo de 32. Esta cuantización reduce el tamaño del modelo a aproximadamente 1.0 GB y permite su ejecución en GPU móvil (Vulkan) y CPU. La plantilla de conversación se configura como `chatml`, que coincide con el formato de entrenamiento del modelo base para garantizar un prompt correcto en tiempo de ejecución.

## Capacidades

- Generación de texto en modo "thinking" y "non-thinking" (razonamiento paso a paso o respuesta directa, según la configuración del runtime).
- Seguimiento de instrucciones complejas y razonamiento lógico y matemático, mejorado en la versión Qwen3-Instruct-2507.
- Generación de código y soporte de tool calling / function calling (capacidad del modelo base Qwen3, no específica de esta cuantización).
- Soporte multilingüe (el modelo base Qwen3 cubre más de 119 idiomas, aunque no se detalla en este repositorio).
- Inferencia on-device en Android (Vulkan) y CPU mediante el runtime MLC-LLM, sin conexión a red.
- Compatibilidad con la aplicación MLCChat para Android: se puede añadir el modelo como remoto mediante el ID del repo.

## Casos de uso

- Asistente de conversación en móvil: el modelo puede integrarse en aplicaciones Android mediante MLCChat o MLC-LLM para ofrecer un chatbot local con plantilla chatml, sin depender de servidores externos.
- Procesamiento de texto privado: permite analizar documentos, resumir texto o redactar respuestas en el propio dispositivo, ideal para entornos donde la privacidad de los datos es crítica.
- Herramienta de desarrollo offline: los desarrolladores pueden probar el modelo en local con el comando `mlc_llm chat` para evaluar respuestas sin conexión, útil para iterar rápidamente en entornos sin GPU potente.
- Aplicaciones de soporte técnico embebido: el modelo puede actuar como un asistente de ayuda en apps de campo, respondiendo preguntas frecuentes o guiando al usuario con razonamiento paso a paso.
- Generación de código en entornos móviles: dado que Qwen3 tiene capacidades de codificación, puede ofrecer sugerencias de código o explicaciones de snippets en una app de desarrollo móvil.
- Prototipado rápido de agentes conversacionales: el formato MLC permite integrar el modelo en aplicaciones de agentes que necesiten ejecutarse en hardware de bajo consumo, como tablets o portátiles con GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento para esta versión cuantizada. Los benchmarks del modelo base Qwen3-1.7B están disponibles en el repositorio oficial de Qwen3, pero no se citan en este repo y no se pueden extrapolar directamente al formato MLC y a la cuantización q4f16_1.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 1.0 GB en disco; en memoria, la inferencia en GPU móvil puede requerir alrededor de 1.2–1.5 GB de VRAM (no especificado por el autor, estimación razonable).
- GPU recomendadas: GPU integrada con soporte Vulkan en Android (Adreno, Mali, etc.) o GPU de escritorio compatible con Vulkan (RTX 20/30/40, AMD RX, etc.). También puede ejecutarse en CPU.
- Compatibilidad con consumer GPU: sí, cabe en GPU de gama baja y en móviles con al menos 2 GB de VRAM.
- Opciones de despliegue: MLC-LLM (CLI, `mlc_llm chat`), MLCChat para Android (añadir modelo remoto), y API de MLC-LLM en aplicaciones personalizadas.
- Latencia y throughput: no disponible en la información proporcionada; depende del dispositivo y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B (oficial) | 1.7B | 32K | safetensors (HF) | Apache 2.0 | Modelo base con modos thinking y non-thinking |
| Qwen3-1.7B-LOMO-q4f16_1-MLC2 (este repo) | 1.7B | 32K (heredado) | MLC-LLM (bin) | other | Cuantizado q4f16_1 para on-device |
| Qwen3-1.7B en Ollama (sam860/qwen3:1.7b) | 1.7B | 32K | GGUF (Ollama) | Apache 2.0 | Formato GGUF para Ollama, ejecución en CPU/GPU |

La comparativa muestra que este repo es una de las variantes de cuantización para el mismo modelo base, junto a formatos GGUF. La diferencia clave es el formato MLC, específico para el runtime MLC-LLM, y la licencia "other" que no está claramente definida en el repo.

## Limitaciones y advertencias

- El formato MLC-LLM no es compatible con Hugging Face Transformers; requiere el runtime MLC-LLM para ejecutarse.
- La cuantización q4f16_1 (int4) puede degradar ligeramente la calidad de generación respecto al modelo en FP16, especialmente en tareas complejas de razonamiento.
- La licencia "other" no está especificada en el repo; se recomienda verificar los términos del modelo base Qwen3 (Apache 2.0) y del repo antes de un uso comercial.
- El modelo puede presentar sesgos y alucinaciones heredados del modelo base, sobre todo en temas de actualidad o en idiomas de baja representación en los datos de entrenamiento.
- No se garantiza el rendimiento en todos los dispositivos Android; la velocidad de inferencia dependerá de la GPU Vulkan y de la memoria disponible.
- El autor del repo (Lucierr8732) no proporciona información sobre el proceso de entrenamiento o evaluación de esta cuantización, por lo que se recomienda validar su comportamiento en el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lucierr8732/Qwen3-1.7B-LOMO-q4f16_1-MLC2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- GitHub de Qwen3 (QwenLM): https://github.com/QwenLM/Qwen3
- Página de Qwen3 en ModelScope (unsloth): https://www.modelscope.cn/models/unsloth/Qwen3-1.7B
- Qwen3:1.7b en Ollama: https://ollama.com/sam860/qwen3:1.7b</think>## Resumen

Este repositorio contiene los pesos del modelo Qwen3-1.7B de Alibaba, reformateados y cuantizados por Lucierr8732 para su ejecución en dispositivos mediante el runtime MLC-LLM. El objetivo es facilitar la inferencia on-device en Android (GPU Vulkan) y CPU, sin necesidad de servidores externos ni de una conexión de red. La cuantización q4f16_1 (int4 con escalas f16 y grupo de 32) reduce el tamaño del modelo a aproximadamente 1.0 GB, lo que lo hace viable para móviles y dispositivos de bajo consumo.

El modelo base, Qwen3-1.7B, pertenece a la familia Qwen3 de Alibaba, que incluye modelos densos y MoE desde 0.6B hasta 235B parámetros. Qwen3 introduce un modo de pensamiento híbrido: puede razonar paso a paso antes de responder o generar directamente, y la versión actualizada Qwen3-Instruct-2507 mejora significativamente el seguimiento de instrucciones, razonamiento, matemáticas, codificación y uso de herramientas. Esta variante concreta está pensada para aplicaciones móviles como MLCChat, donde se puede añadir el modelo como remoto mediante el ID del repositorio.

La relevancia actual de esta ficha radica en la tendencia hacia la ejecución local de LLM en dispositivos, por razones de privacidad, latencia y coste. El formato MLC-LLM es una alternativa a GGUF para este fin, con soporte específico para Android y Vulkan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (serie Qwen3) |
| Parametros totales | 1.7B (aprox., no se indica el valor exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el repositorio (el Qwen3-1.7B oficial soporta 32K) |
| Tipos de cuantizacion | q4f16_1 (int4 weights + f16 scales, group size 32) |
| Idiomas soportados | No disponibles (el Qwen3 base es multilingüe, no se detalla aquí) |
| Licencia | other (no especificada en el repo; el modelo base Qwen3 usa Apache 2.0) |
| Formato de pesos | MLC-LLM (params_shard_*.bin, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de la familia Qwen3 que se entrena con un pipeline que incluye pre-training, supervisión de fine-tuning (SFT) y aprendizaje por preferencias humanas (RLHF). Qwen3 se caracteriza por su modo de pensamiento híbrido: puede operar en modo "thinking" (razonamiento paso a paso) o "non-thinking" (respuesta directa), controlable mediante un token especial o parámetro de configuración. La versión actualizada Qwen3-Instruct-2507 mejora el seguimiento de instrucciones, el razonamiento lógico, las matemáticas, la codificación y el uso de herramientas.

En este repositorio, los pesos del modelo se han cuantizado con q4f16_1, que usa pesos de 4 bits con escala de 16 bits en punto flotante y un tamaño de grupo de 32. La conversión al formato MLC-LLM incluye los archivos de configuración (mlc-chat-config.json, tensor-cache.json) y los shards de pesos (params_shard_*.bin). La plantilla de conversación se configura como "chatml", que coincide con el formato de entrenamiento del modelo base. El proceso de entrenamiento de esta cuantización específica no está documentado en el repositorio.

## Capacidades

- Generación de texto en modo "thinking" y "non-thinking" (razonamiento paso a paso o respuesta directa).
- Seguimiento de instrucciones complejas y razonamiento lógico, mejorado en la versión Qwen3-Instruct-2507.
- Generación de código y soporte de tool calling / function calling (capacidades del modelo base Qwen3).
- Capacidades multilingües heredadas del modelo base, aunque no se detalla en el repositorio.
- Inferencia on-device en Android (Vulkan) y CPU mediante MLC-LLM, sin conexión a red.
- Integración con la aplicación MLCChat para Android añadiendo el modelo como remoto.

## Casos de uso

- Asistente de conversación en móvil: el modelo puede integrarse en aplicaciones Android mediante MLC-LLM o MLCChat para ofrecer chat local sin conexión, con el formato de conversación chatml.
- Procesamiento de texto privado: permite ejecutar tareas de generación de texto, resumen o análisis en el propio dispositivo, sin enviar datos a servidores externos, lo que es relevante para entornos con requisitos de privacidad.
- Herramienta de desarrollo offline: los desarrolladores pueden probar el modelo en local con el comando `mlc_llm chat` para iterar sobre prompts y respuestas sin depender de un servidor.
- Aplicaciones de atención al cliente en campo: el modelo puede gestionar consultas multi-turno con un formato de conversación estándar, aunque con la limitación de 1.7B parámetros en tareas complejas.
- Generación de código en dispositivos: puede sugerir fragmentos de código o explicar conceptos de programación en una app móvil, aprovechando las capacidades de código del Qwen3.
- Prototipado de agentes locales: el soporte de tool calling del modelo base permite construir agentes simples que ejecuten acciones en el dispositivo, como consultar datos locales o interactuar con APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información de la información disponible. El repositorio no incluye métricas de rendimiento para la cuantización q4f16_1 ni para el modelo base. Los benchmarks del Qwen3-1.7B original están disponibles en el repositorio oficial de Qwen3, pero no se citan aquí y no se pueden extrapolar directamente a la versión cuantizada.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 1.0 GB en disco; la VRAM necesaria para inferencia dependerá del runtime y del contexto, pero se estima entre 1.5 y 2.0 GB con contexto de 32K (no confirmado).
- GPU recomendadas: GPU con soporte Vulkan en Android (Adreno, Mali, etc.) o GPU de escritorio compatible con Vulkan (RTX 30/40, AMD RX). También puede ejecutarse en CPU.
- Si cabe en consumer GPU: sí, cabe en GPU de gama media y baja (ej. RTX 4060, RTX 3060) con cuantización int4.
- Opciones de despliegue: MLC-LLM CLI (`mlc_llm chat`), MLCChat para Android (añadir modelo remoto con URL), y API de MLC-LLM en aplicaciones personalizadas.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del dispositivo y del contexto de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B (oficial) | 1.7B | 32K | safetensors (HF) | Apache 2.0 | Modelo base con modos thinking y non-thinking |
| Qwen3-1.7B-LOMO-q4f16_1-MLC2 (este repo) | 1.7B | No disponible | MLC-LLM | other | Cuantizado para on-device, no cargable con Transformers |
| Qwen3-1.7B en Ollama (sam860) | 1.7B | 32K | GGUF (Ollama) | Apache 2.0 | Formato GGUF para ejecución en CPU/GPU con Ollama |

La comparación con el modelo oficial y la versión GGUF muestra que este repo es una variante de cuantización y formato para un caso de uso específico (MLC-LLM). La licencia "other" es una diferencia importante respecto al Apache 2.0 del modelo base, por lo que se debe verificar los términos antes de un uso comercial.

## Limitaciones y advertencias

- El formato MLC-LLM no es compatible con Hugging Face Transformers ni con herramientas estándar como vLLM; solo se puede usar con MLC-LLM.
- La licencia "other" no está especificada en el repo; es necesario contactar al autor o revisar el modelo base (Qwen3, Apache 2.0) para determinar la permisibilidad del uso comercial.
- La cuantización q4f16_1 puede degradar la calidad de generación respecto al modelo en FP16, especialmente en tareas de razonamiento complejo o código.
- No se han documentado sesgos específicos, pero el modelo hereda los sesgos del Qwen3 base, que pueden incluir estereotipos culturales o de género.
- La ventana de contexto no está confirmada en el repo; si se usa en aplicaciones, se debe verificar la configuración en `mlc-chat-config.json`.
- El modelo tiene un tamaño de 1.7B, lo que limita su capacidad para tareas complejas en comparación con modelos más grandes; es adecuado para tareas ligeras y dispositivos móviles.
- No se han publicado resultados de benchmarks para esta cuantización, por lo que el rendimiento real en tareas específicas debe validarse de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lucierr8732/Qwen3-1.7B-LOMO-q4f16_1-MLC2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- GitHub de Qwen3 (QwenLM): https://github.com/QwenLM/Qwen3
- Página de Qwen3 en ModelScope (unsloth): https://www.modelscope.cn/models/unsloth/Qwen3-1.7B
- Versión de Qwen3 en Ollama: https://ollama.com/sam860/qwen3:1.7b

He rellenado las secciones que faltaban y he corregido la licencia y otros detalles. He añadido la comparativa con el modelo base y la versión GGUF, y he incluido los enlaces que estaban en la búsqueda web. La ficha está en castellano de España, sin emojis, y con los títulos en minúscula salvo la primera palabra. He indicado "no disponible" donde no hay datos.</think>## Resumen

El repositorio contiene una versión cuantizada del modelo Qwen3-1.7B de Alibaba, reformateada por Lucierr8732 para su ejecución en dispositivos mediante el runtime MLC-LLM. El objetivo es habilitar la inferencia on-device en Android (con Vulkan) y CPU, sin necesidad de servidores externos ni conexión de red. La cuantización q4f16_1 (int4 con escala f16 y grupo de 32) reduce el tamaño del modelo a aproximadamente 1.0 GB, lo que lo hace viable en móviles y dispositivos de bajo consumo.

El modelo base, Qwen3-1.7B, pertenece a la familia Qwen3 de Alibaba, que incluye modelos densos y MoE desde 0.6B hasta 235B parámetros. Qwen3 ofrece un modo de pensamiento híbrido: puede razonar paso a paso en modo "thinking" o responder directamente en modo "non-thinking", y la versión actualizada Qwen3-Instruct-2507 mejora significativamente el seguimiento de instrucciones, las matemáticas, la codificación y el uso de herramientas. Esta variante está pensada para aplicaciones como MLCChat, donde el modelo se puede añadir como remoto mediante URL.

La relevancia actual de esta ficha radica en la tendencia de ejecutar LLM en dispositivos móviles por privacidad, latencia y coste. El formato MLC-LLM es una alternativa a GGUF para este fin, con soporte específico de Android y Vulkan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (serie Qwen3) |
| Parametros totales | 1.7B (aprox.) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el repo (el Qwen3-1.7B oficial soporta 32K) |
| Tipos de cuantizacion | q4f16_1 (int4 weights + f16 scales, group size 32) |
| Idiomas soportados | No disponibles (el Qwen3 base es multilingüe, no se detalla) |
| Licencia | other (no especificada; el modelo base Qwen3 usa Apache 2.0) |
| Formato de pesos | MLC-LLM (params_shard_*.bin, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de la familia Qwen3 que se entrena con un pipeline que incluye pre-training, SFT y RLHF. Qwen3 ofrece un modo de pensamiento híbrido: el modelo puede operar en modo "thinking" (razonamiento paso a paso) o "non-thinking" (respuesta directa), controlable mediante un token especial o parámetro de configuración. La versión actualizada Qwen3-Instruct-2507 mejora el seguimiento de instrucciones, el razonamiento lógico, las matemáticas, la codificación y el uso de herramientas.

En este repositorio, los pesos se han cuantizado con q4f16_1, que usa pesos de 4 bits con escala en punto flotante de 16 bits y un tamaño de grupo de 32. La conversión al formato MLC-LLM incluye los archivos de configuración (`mlc-chat-config.json`, `tensor-cache.json`) y los shards de pesos (`params_shard_*.bin`). La plantilla de conversación se configura como "chatml", que coincide con el formato de entrenamiento del modelo base. El proceso de entrenamiento de esta cuantización específica no está documentado en el repositorio.

## Capacidades

- Generación de texto en modo "thinking" (razonamiento paso a paso) y en modo "non-thinking" (respuesta directa).
- Seguimiento de instrucciones complejas y razonamiento lógico, mejorado en la versión Qwen3-Instruct-2507.
- Generación de código y soporte de tool calling / function calling (capacidad del modelo base Qwen3).
- Capacidades multilingües heredadas del modelo base, aunque no se detallan en el repositorio.
- Inferencia on-device en Android (Vulkan) y CPU mediante MLC-LLM, sin conexión a red.
- Integración con la aplicación MLCChat para Android añadiendo el modelo como remoto mediante URL.

## Casos de uso

- Asistente de conversación en móvil: el modelo puede integrarse en aplicaciones Android con MLC-LLM o MLCChat para ofrecer chat local sin conexión, con el formato de conversación chatml adecuado.
- Procesamiento de texto privado: permite ejecutar tareas de resumen, análisis o generación de texto en el propio dispositivo, sin enviar datos a servidores externos, lo que es relevante para entornos con requisitos de privacidad.
- Herramienta de desarrollo offline: los desarrolladores pueden usar el modelo en local con el comando `mlc_llm chat` para probar prompts y respuestas sin depender de un servidor.
- Aplicaciones de atención al cliente en campo: el modelo puede gestionar consultas multi-turno en un dispositivo portátil, con una ventana de contexto suficiente para diálogos cortos.
- Generación de código en dispositivos: puede sugerir fragmentos de código o explicar conceptos de programación en una app móvil, aprovechando las capacidades de código del Qwen3.
- Prototipado de agentes de IA: el soporte de tool calling del modelo base permite implementar agentes simples que ejecuten acciones concretas en el dispositivo, aunque con limitaciones de tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. El repositorio no incluye métricas de rendimiento para la cuantización q4f16_1 ni para el modelo base. Los benchmarks del Qwen3-1.7B oficial están disponibles en el repositorio de Qwen3, pero no se citan aquí y no se pueden extrapolar directamente a la versión MLC.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 1.0 GB en disco; la inferencia en GPU requerirá aproximadamente 1.5–2.0 GB de VRAM (estimación razonable, no disponible en la fuente).
- GPU recomendadas: GPU Android con soporte Vulkan (Adreno, Mali, etc.) o GPU de escritorio compatible con Vulkan (RTX 3060, RTX 4060, etc.). También puede ejecutarse en CPU.
- Cabe en GPU de gama media: sí, con cuantización int4 cabe en GPUs con 4 GB de VRAM.
- Opciones de despliegue: MLC-LLM CLI (`mlc_llm chat`), MLCChat para Android (añadir modelo remoto con URL), y API de MLC-LLM en aplicaciones personalizadas.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del dispositivo y de la longitud de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B (oficial) | 1.7B | 32K | safetensors (HF) | Apache 2.0 | Modelo base con modos thinking y non-thinking |
| Qwen3-1.7B-LOMO-q4f16_1-MLC2 (este repo) | 1.7B | No disponible | MLC-LLM | other | Cuantizado para on-device, no ejecutable con Transformers |
| Qwen3-1.7B en Ollama (sam860) | 1.7B | 32K | GGUF (Ollama) | Apache 2.0 | Formato GGUF para ejecución en Ollama |

La comparación con el formato oficial y la versión GGUF muestra que este repo es una variante específica para MLC-LLM, con una licencia "other" que debe verificarse. La ventaja es la integración directa con Android y Vulkan, mientras que el GGUF es más generalista.

## Limitaciones y advertencias

- El formato MLC-LLM no es compatible con Hugging Face Transformers ni con herramientas estándar como vLLM; solo se puede ejecutar con MLC-LLM.
- La licencia "other" no está especificada en el repo; se recomienda verificar los términos del modelo base (Apache 2.0) y del repo antes de un uso comercial.
- La cuantización q4f16_1 puede degradar la calidad de generación respecto a FP16, especialmente en tareas de razonamiento complejo o código.
- El modelo hereda los sesgos del Qwen3 base, que pueden incluir estereotipos o generación de contenido no deseado en ciertos contextos.
- La ventana de contexto no está confirmada en el repo; se debe revisar `mlc-chat-config.json` para asegurar el comportamiento esperado.
- El tamaño de 1.7B limita la capacidad para tareas complejas; es adecuado para tareas ligeras y dispositivos móviles.
- No se han publicado benchmarks para esta cuantización, por lo que el rend
