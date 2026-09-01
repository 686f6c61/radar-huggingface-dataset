# ETeissonniere/Nemotron-3-Nano-4B-CoreAI-128K

## Resumen

Este modelo es una conversión nativa a Apple Core AI del modelo NVIDIA Nemotron 3 Nano 4B, específicamente diseñada para ejecutarse en dispositivos con Apple Silicon y macOS 27 o superior. La conversión aplica una cuantización INT8 verificada (cuerpo y cabeza del vocabulario) y fija un límite de contexto operacional de 131.072 tokens, lo que lo hace especialmente adecuado para tareas que requieren ventanas de contexto muy largas en hardware de consumo de Apple.

El proyecto lo mantiene ETeissonniere, que también ha publicado otras conversiones similares para la plataforma Core AI de Apple. A diferencia del modelo original en BF16, esta versión está optimizada para el runtime Core AI, con un grafo de decodificación de un solo token y prefill de prompt gestionado por el host. Se distribuye bajo la licencia NVIDIA Nemotron Open Model License, aunque la conversión es un proyecto independiente no certificado por NVIDIA.

La relevancia actual radica en que permite ejecutar un modelo de 4B con contexto de 128K en equipos Apple con memoria unificada, sin necesidad de GPUs dedicadas, con un rendimiento razonable (alrededor de 44 tokens/s de generación en un M4 Pro). Es una opción práctica para desarrolladores que trabajan en macOS y quieren desplegar modelos locales con capacidades de contexto extendido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NVIDIA Nemotron 3 Nano 4B) |
| Parametros totales | 4B (según nombre del modelo, valor exacto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | INT8 simétrico con clipping (block size 32) para cuerpo; INT8 simétrico de máximo absoluto para cabeza de vocabulario; embeddings, RMSNorm, convoluciones y SDPA sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/) |
| Formato de pesos | Core AI (formato propietario de Apple, compilado en bundle `gpu-pipelined/nemotron_3_nano_4b_decode_int8hu`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original (número de capas, dimensión de atención, tipo de transformer, etc.) en la documentación proporcionada. El modelo base es `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, que pertenece a la familia Nemotron 3 de NVIDIA, de la cual se sabe que incluye tres tamaños (Nano, Super y Ultra) y está orientada a aplicaciones de agentes de IA.

La conversión a Core AI mantiene los pesos del modelo original pero los transforma a una representación INT8 para el cuerpo y la cabeza del vocabulario, mientras que componentes como embeddings, RMSNorm y SDPA se mantienen sin cuantizar. El proceso de conversión está documentado en el repositorio con archivos `PROVENANCE.json` y `SHA256SUMS` para verificar la integridad. No hay información sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: modelo de lenguaje autorregresivo para tareas de texto general.
- Contexto largo: ventana de 131.072 tokens, adecuada para documentos extensos, conversaciones de muchos turnos o análisis de código largo.
- Ejecución en Apple Silicon: optimizado para el runtime Core AI de macOS 27 o superior, con decodificación por GPU en pipeline.
- Cuantización INT8: reduce el uso de memoria y acelera la inferencia en hardware Apple, manteniendo una precisión razonable.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-step: no disponible en la documentación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente local de documentación técnica: gracias a su contexto de 128K, puede procesar manuales, especificaciones o libros técnicos completos y responder preguntas sobre ellos sin necesidad de dividir el texto.
- Chat con memoria extendida: en aplicaciones de mensajería o soporte, mantiene el historial de conversación durante muchas interacciones sin perder el hilo.
- Análisis de código en repositorios: puede leer archivos de código fuente extensos o varios archivos de un proyecto y generar explicaciones, sugerencias o refactorizaciones.
- Resumen de informes largos: adecuado para resumir documentos legales, financieros o científicos de decenas de miles de tokens.
- Aplicaciones de productividad en macOS: integrable en apps nativas que requieran generación de texto local sin conexión, como editores de texto o herramientas de notas.
- Prototipado de agentes conversacionales: al ejecutarse localmente en Apple Silicon, permite iterar rápidamente en el desarrollo de asistentes sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento medido es el siguiente:

| Métrica | Valor |
|---|---|
| Prompt throughput (M4 Pro, 48 GB) | ~47,7 tokens/s (prompt de 128 tokens) |
| Decode throughput (M4 Pro, 48 GB) | ~44,2 tokens/s (generación de 256 tokens) |

Estas mediciones se realizaron en un Apple M4 Pro con 48 GB de memoria unificada y dependen del hardware, la versión de macOS, la presión de memoria y el estado térmico.

## Requisitos de hardware

- Apple Silicon con macOS 27 o superior (obligatorio para el runtime Core AI).
- Memoria unificada: se probó con 48 GB, pero no se indica el mínimo necesario. Dado que el modelo compilado ocupa unos 4,6 GB, es probable que funcione con 16 GB o más.
- GPU: integrada en el chip Apple Silicon (no requiere GPU externa).
- Despliegue: exclusivamente mediante Core AI runtime; no se mencionan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: en M4 Pro se midieron ~44 tokens/s de generación, lo que es adecuado para aplicaciones interactivas.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la documentación proporcionada. Como referencia, el modelo original `NVIDIA-Nemotron-3-Nano-4B-BF16` es la versión sin cuantizar, que requiere más memoria pero potencialmente ofrece mayor precisión. Otros modelos de 4B con contexto largo (por ejemplo, Qwen2.5-4B-Instruct con 128K) podrían ser alternativas, pero no hay datos de comparación en esta información.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en Apple Silicon con macOS 27 o superior; no es utilizable en otras plataformas.
- Cuantización INT8: puede provocar una ligera pérdida de precisión respecto al modelo original BF16, especialmente en tareas que requieren alta fidelidad numérica.
- No certificado por NVIDIA: es una conversión independiente, por lo que NVIDIA no garantiza su comportamiento ni su mantenimiento.
- Licencia: la NVIDIA Nemotron Open Model License impone condiciones específicas para uso comercial y redistribución; es necesario revisarlas antes de desplegar el modelo en producción.
- Sin información sobre sesgos o alucinaciones: no se han publicado estudios de sesgo o robustez para esta conversión.
- Rendimiento variable: las métricas medidas dependen del hardware y la carga; no se garantiza el mismo rendimiento en todos los equipos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ETeissonniere/Nemotron-3-Nano-4B-CoreAI-128K
- Modelo base (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Página de NVIDIA Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Documentación de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio coreai-model-zoo (referencia de conversión): https://github.com/john-rocky/coreai-model-zoo/tree/main/models/nemotron-3-nano
