# ETeissonniere/Nemotron-3-Nano-4B-CoreAI

## Resumen

El modelo `ETeissonniere/Nemotron-3-Nano-4B-CoreAI` es una conversión nativa al framework Apple Core AI del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un pequeño modelo de lenguaje (SLM) de 4.000 millones de parámetros desarrollado por NVIDIA. Esta conversión está pensada para ejecutarse de forma eficiente en dispositivos con Apple Silicon (macOS), aprovechando el runtime Core AI sin depender de MLX ni llama.cpp. El proyecto es independiente y no está avalado ni certificado por NVIDIA.

La relevancia de esta conversión radica en que permite ejecutar un modelo de última generación con arquitectura híbrida Mamba-Transformer en hardware de Apple, con cuantización INT8 selectiva y un perfil de decodificación optimizado para GPU. El modelo base fue entrenado desde cero por NVIDIA y está diseñado para aplicaciones de agente con razonamiento, aunque esta conversión concreta se centra en la inferencia local en macOS. El contexto operativo es de 4.096 tokens, y el bundle compilado ocupa aproximadamente 4,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer (GQA, MLP standalone, convolución recurrente/SSM) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (operativo) |
| Tipos de cuantizacion | INT8 selectiva (bloque de 32), cuantización simétrica recortada para pesos del cuerpo, cuantización simétrica de máximo absoluto para la cabeza de vocabulario |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | Bundle Core AI (.aimodel) con tokenizer y metadatos integrados |

## Arquitectura y entrenamiento

El modelo base `NVIDIA-Nemotron-3-Nano-4B-BF16` emplea una arquitectura híbrida que combina capas de mezcla Mamba-2 con atención de consultas agrupadas (GQA), capas MLP independientes y estado recurrente de convolución/SSM junto con estado KV de atención. Esta combinación busca eficiencia en decodificación y manejo de secuencias largas con menor coste computacional que un transformer puro. El entrenamiento del modelo base fue realizado por NVIDIA desde cero, aunque los detalles específicos del dataset y el número de tokens no se proporcionan en la información disponible. La conversión a Core AI mantiene la arquitectura nativa y aplica una cuantización INT8 selectiva: las capas de embeddings, convoluciones, RMSNorm y los compuestos de atención SDPA no se cuantizan, mientras que los pesos del cuerpo y la cabeza de vocabulario sí lo están. El perfil de Core AI está configurado para decodificación de un solo token con pipeline en GPU.

## Capacidades

- Generación de texto y razonamiento básico, al ser un SLM de 4B entrenado para tareas de agente.
- Soporte de tool calling y function calling, según las capacidades generales de la familia Nemotron 3 (aunque no se detalla específicamente para esta conversión).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Ejecución nativa en Apple Silicon mediante Core AI, sin dependencias de MLX o llama.cpp.
- Cuantización INT8 selectiva que reduce el tamaño del modelo manteniendo capas sensibles sin cuantizar.
- Integración con el runtime Core AI de Apple para inferencia en GPU unificada.

## Casos de uso

- Asistente local en macOS: el modelo puede ejecutarse como asistente de texto en aplicaciones nativas de Apple, aprovechando el runtime Core AI para responder consultas con baja latencia en equipos con Apple Silicon.
- Prototipado de agentes conversacionales: al soportar tool calling, puede integrarse en aplicaciones de prueba que requieran interacción con APIs o ejecución de acciones simples, todo en local.
- Generación de texto en entornos sin conexión: ideal para aplicaciones de redacción, resumen o reescritura que necesiten funcionar sin acceso a la nube, con privacidad de datos.
- Desarrollo de aplicaciones de productividad: puede usarse para autocompletar texto, generar borradores de correos o documentos, o extraer información de documentos largos dentro del límite de 4.096 tokens.
- Investigación en eficiencia de inferencia: sirve como banco de pruebas para comparar el rendimiento de Core AI frente a otros runtimes (MLX, llama.cpp) en hardware Apple, midiendo tokens/s y uso de memoria.
- Despliegue en entornos educativos: permite a estudiantes y desarrolladores experimentar con un SLM moderno sin necesidad de GPUs dedicadas, usando solo un Mac con chip M-series.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta conversión específica. El modelo base podría tener resultados publicados por NVIDIA, pero no se incluyen en la documentación proporcionada. La única métrica de rendimiento disponible es la medición realizada por el autor de la conversión en un Apple M4 Pro con 48 GB de memoria unificada, macOS 27 beta y Xcode 27 beta:

- Prefill: aproximadamente 37 tokens/s
- Decodificación: aproximadamente 50 tokens/s
- Tiempo al primer token: 0,67 segundos para un prompt de 25 tokens

Estas cifras dependen del hardware, sistema operativo, longitud del prompt y estado térmico.

## Requisitos de hardware

- Dispositivo Apple Silicon (M1 o posterior) con macOS compatible con Core AI (se requiere macOS 27 beta o superior según la medición del autor).
- Memoria unificada: se recomienda al menos 8 GB para el modelo cuantizado (el bundle pesa 4,6 GB), aunque 16 GB o más ofrecen margen para el sistema y otras aplicaciones.
- GPU integrada en el chip Apple Silicon; el perfil de Core AI utiliza la GPU para decodificación en pipeline.
- No requiere GPU NVIDIA ni hardware externo; la inferencia se realiza completamente en el dispositivo.
- Opciones de despliegue: exclusivamente mediante el runtime Core AI de Apple; no es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: en M4 Pro se midieron ~50 tokens/s de decodificación y ~37 tokens/s de prefill, con 0,67 s al primer token para un prompt corto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para esta conversión. Como referencia, el modelo base `NVIDIA-Nemotron-3-Nano-4B-BF16` es un SLM de 4B con arquitectura híbrida, mientras que otras alternativas de tamaño similar (por ejemplo, Qwen2.5-3B o Llama-3.2-3B) usan arquitecturas transformer estándar. Sin embargo, no hay datos de rendimiento publicados en la información proporcionada para establecer una comparación cuantitativa. La principal diferencia de esta conversión es su formato Core AI, que la hace exclusiva para Apple Silicon, frente a formatos GGUF o MLX que cubren otros runtimes.

## Limitaciones y advertencias

- Conversión independiente: no está producida, respaldada ni certificada por NVIDIA; el autor es un tercero.
- Licencia NVIDIA Nemotron Open Model License: debe revisarse antes de uso comercial o redistribución; incluye restricciones específicas de la licencia.
- Contexto limitado a 4.096 tokens, lo que puede ser insuficiente para tareas que requieran ventanas largas.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Riesgo de alucinación y sesgos inherentes a los modelos de lenguaje, no mitigados específicamente en esta conversión.
- Requiere macOS 27 beta o superior (según la medición del autor), lo que limita su uso en versiones estables actuales.
- No hay benchmarks de calidad publicados para esta conversión; el rendimiento en tareas específicas no está verificado.
- El bundle compilado es específico para Core AI; no se puede usar con otros runtimes sin reconversión.

## Enlaces

- [HuggingFace: ETeissonniere/Nemotron-3-Nano-4B-CoreAI](https://huggingface.co/ETeissonniere/Nemotron-3-Nano-4B-CoreAI)
- [Modelo base: nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16)
- [Modelo base FP8: nvidia/NVIDIA-Nemotron-3-Nano-4B-FP8](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-FP8)
- [NVIDIA Nemotron 3 Family](https://research.nvidia.com/labs/nemotron/Nemotron-3/)
- [Paper: Nemotron 3 Nano 30B-A3B (arXiv)](https://arxiv.org/html/2512.20848v1)
- [NVIDIA Nemotron Developer Page](https://developer.nvidia.com/topics/ai/nemotron)
- [Guía de Nemotron 3 Nano 4B en RTX](https://aivideosensei.com/guides/nemotron-3-nano-4b-guide)
- [Licencia NVIDIA Nemotron Open Model](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/)
