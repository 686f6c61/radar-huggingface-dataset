# mlboydaisuke/qwen3-8b-CoreAI-official

## Resumen

Este repositorio aloja una conversión oficial del modelo Qwen/Qwen3-8B al formato `.aimodel` de Apple Core AI, generada mediante la receta de exportación publicada por Apple en su repositorio `apple/coreai-models`. El autor, mlboydaisuke, proporciona el bundle pre-convertido y sin modificaciones, junto con hashes SHA-256 y mediciones de rendimiento realizadas con la herramienta oficial `llm-benchmark` de Apple. Su relevancia radica en que permite ejecutar un modelo de 8.000 millones de parámetros de forma totalmente local y eficiente en dispositivos con Apple Silicon, eliminando la necesidad de realizar la conversión uno mismo (que requiere un Mac con mucha RAM) y garantizando la reproducibilidad de los artefactos. El modelo hereda las capacidades del Qwen3-8B original, un transformer denso de última generación, aunque la información proporcionada no detalla su longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3-8B) |
| Parametros totales | no disponible (heredado de Qwen3-8B, 8B según nomenclatura) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (bundle macOS) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .aimodel (bundle de Apple Core AI) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una conversión del checkpoint público Qwen/Qwen3-8B al formato propietario `.aimodel` de Apple Core AI. La conversión se realizó con la herramienta `coreai.llm.export` siguiendo la receta oficial del repositorio `apple/coreai-models` en el commit `b1cb71b`. El entorno de exportación fue macOS 27.0 beta, Xcode 27.0, con las versiones `coreai-core 1.0.0b1`, `coreai-torch 0.4.0`, `coreai-opt 0.2.0` y `torch 2.9.0`. El bundle resultante incluye un artefacto `main.mlirb` con hash SHA-256 `f659250441d88f9eaf6f260b11e2644edac9245b7bea89e30c70dc1960ef953b`, lo que permite verificar la integridad del archivo. No se proporcionan datos sobre el entrenamiento original del modelo base (tokens, dataset, técnicas de alineación), por lo que no se pueden detallar aquí.

## Capacidades

- Generación de texto y chat multi-turno: el modelo puede mantener conversaciones con historial, como se demuestra en el ejemplo de `ChatSession` que conserva el contexto entre llamadas.
- Ejecución completamente offline: una vez descargado el modelo, no se requiere conexión a internet para generar respuestas.
- Integración nativa con Swift: mediante el paquete `CoreAIKit` se puede usar el modelo en aplicaciones macOS/iOS con una API sencilla (`ChatSession`, `respond(to:)`, `streamResponse(to:)`).
- Soporte de streaming de tokens: la API permite recibir tokens conforme se decodifican, útil para interfaces de chat en tiempo real.
- Operaciones de alto nivel: el kit incluye veinte operaciones predefinidas (resumen, etc.) que pueden usar este modelo, como `CoreAI.summarize`.
- Compatibilidad con el ecosistema Core AI de Apple: puede ejecutarse en CPU, GPU y Neural Engine, con compilación AOT para iOS.

## Casos de uso

- Asistente personal offline en macOS: integrar el modelo en una app de escritorio para responder preguntas sin enviar datos a la nube, garantizando privacidad.
- Resumen automático de documentos: usar la operación `CoreAI.summarize` para condensar textos largos en aplicaciones de productividad.
- Chatbot de atención al cliente en entornos con requisitos estrictos de confidencialidad: el modelo se ejecuta localmente, evitando filtraciones de información sensible.
- Herramienta de desarrollo para prototipado rápido: el CLI `chat-cli` permite probar el modelo desde la terminal sin escribir código.
- Aplicaciones iOS con IA generativa: compilar el bundle para iPhone 17 Pro (h18p) y usarlo en apps móviles que requieran procesamiento en el dispositivo.
- Automatización de tareas de redacción: generar borradores de correos, informes o contenido creativo usando la API de streaming para respuestas progresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia realizadas con la herramienta oficial `llm-benchmark` de Apple en modo greedy:

| Bundle | Protocol | Decode tok/s | Prefill | Load (warm) | Peak RSS |
|---|---:|---:|---:|---:|
| macos | M4 Max, 512p/1024g | 94.1 | 912 | 0.64 s | 9.3 GB |

Estos valores indican una velocidad de decodificación de 94.1 tokens por segundo, un prefill de 912 tokens (presumiblemente por segundo), una carga en caliente de 0.64 segundos y un pico de memoria residente de 9.3 GB en un Mac con M4 Max.

## Requisitos de hardware

- Mac con Apple Silicon (se probó en M4 Max; se espera compatibilidad con otros chips M-series).
- Almacenamiento: 4.4 GB para el bundle descargado (según la sección "Integration checklist").
- Memoria RAM: pico de 9.3 GB durante la inferencia, por lo que se recomienda un mínimo de 16 GB para un uso fluido.
- No requiere GPU dedicada; usa los aceleradores integrados de Apple (CPU, GPU, Neural Engine).
- Para iOS: se necesita compilación AOT con `xcrun coreai-build compile` y un dispositivo con chip h18p (iPhone 17 Pro) o superior.
- El proceso de conversión original requiere un Mac con mucha RAM (se menciona 128 GB para el modelo de 20B), pero la inferencia solo necesita memoria suficiente para mapear el artefacto.
- Opciones de despliegue: integración vía CoreAIKit en Swift, ejecución con `llm-runner` desde línea de comandos, o mediante el chat de CoreAIChatMac.

## Comparativa con modelos similares

No se dispone de datos de comparación directa en la información proporcionada. Este modelo es una conversión específica de Qwen3-8B para Apple Silicon, por lo que su comparativa natural sería con otras versiones del mismo modelo base en formatos alternativos (por ejemplo, GGUF para llama.cpp o MLX para Apple). Sin embargo, no se han facilitado métricas de rendimiento o calidad de esas alternativas, por lo que no se puede establecer una comparación cuantitativa. Se recomienda consultar los benchmarks de `apple-silicon-llm-bench` para ver cómo se posiciona frente a otros modelos en el mismo hardware.

## Limitaciones y advertencias

- El bundle está optimizado para Apple Silicon y no es portable a otras arquitecturas (x86, ARM de otros fabricantes, etc.).
- La conversión se realizó con una versión beta de macOS (27.0 beta) y de las herramientas Core AI; el rendimiento puede variar en versiones estables o futuras (se documenta un caso donde el mismo artefacto fue 2.2× más lento entre macOS 26 y 27β).
- No se han publicado evaluaciones de calidad del modelo convertido; se asume que conserva las capacidades del Qwen3-8B original, pero no hay garantía de que la cuantización int4 no degrade la precisión en algunas tareas.
- El modelo base Qwen3-8B puede presentar sesgos y alucinaciones inherentes a los LLM, aunque no se detallan en esta documentación.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el uso del modelo base cumpla con los términos de Qwen (que también es Apache-2.0).
- El ecosistema Core AI de Apple está en fase beta, por lo que las APIs y formatos podrían cambiar en el futuro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/qwen3-8b-CoreAI-official
- Receta de exportación oficial de Apple: https://github.com/apple/coreai-models
- Kit de integración Swift (CoreAIKit): https://github.com/john-rocky/coreai-kit
- Benchmarks de Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- Aplicaciones de ejemplo (CoreAIChatMac, etc.): https://github.com/john-rocky/coreai-samples
