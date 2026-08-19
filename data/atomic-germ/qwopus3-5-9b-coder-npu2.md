# Atomic-Germ/Qwopus3.5-9B-Coder-NPU2

## Resumen

Qwopus3.5-9B-Coder-NPU2 es una cuantización en formato Q4NX del modelo Qwopus3.5-9B-v3.5, un modelo de lenguaje multimodal especializado en tareas de programación, razonamiento y uso de herramientas. Esta variante ha sido publicada por Atomic-Germ y está optimizada para ejecutarse exclusivamente en el motor FastFlowLM sobre las NPU AMD Ryzen AI de la generación XDNA2 (Strix Point y posteriores). El modelo base, desarrollado por Jackrong, se describe como un modelo denso de 9B parámetros con capacidad de visión y una ventana de contexto de 262.144 tokens.

La relevancia de este lanzamiento radica en que permite ejecutar un modelo multimodal de 9B con soporte para tool calling en hardware de consumo (portátiles con AMD Ryzen AI 300) sin necesidad de GPU dedicada. El formato Q4NX es propietario de FastFlowLM, por lo que no es compatible con llama.cpp, Ollama ni otros motores de inferencia habituales. Incluye pesos cuantizados tanto del modelo de texto como del codificador de visión, lo que habilita la entrada multimodal en el dispositivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con torre de visión (arquitectura Qwen3.5) |
| Parametros totales | 9B (no se especifica el desglose exacto en el repo) |
| Parametros activos | 9B (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según config) |
| Tipos de cuantizacion | Q4NX (formato nativo de FastFlowLM, basado en Q4_1 reordenado) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (`model.q4nx`, 7,63 GB) + `vision_weight.q4nx` |

## Arquitectura y entrenamiento

El modelo base Qwopus3.5-9B-v3.5 es un modelo denso de 9B parámetros que combina un transformer de texto con un codificador de visión (vision tower). Según el repositorio oficial de Qwopus, el modelo se basa en Qwen3.5 y ha sido sometido a un proceso de destilación de conocimiento desde un modelo de razonamiento de mayor tamaño (Claude 4.6 Opus). Posteriormente, Qwopus3.5-9B-Coder fue fine-tuning adicional para tareas de codificación agéntica, tool calling complejo y razonamiento lógico, como se indica en la página de ModelScope.

Esta variante NPU2 no añade entrenamiento nuevo; es una conversión de los pesos a Q4NX, un formato de cuantización propietario de FastFlowLM que reordena los pesos Q4_1 para adaptarlos a los tile del NPU y los patrones de acceso a memoria del XDNA2. El proceso de cuantización es realizado por Atomic-Germ. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens de preentrenamiento o el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multimodal (entrada de imágenes y texto).
- Razonamiento multi-paso y lógico, adecuado para tareas de programación y análisis.
- Tool calling / function calling, habilitando el uso de agentes que invocan herramientas externas.
- Capacidades de visión: puede procesar capturas de pantalla, diagramas o imágenes para generar código o explicaciones.
- Soporte de agente multi-step reasoning, según la descripción del modelo base.
- Multilingüe: no, el repositorio indica únicamente inglés (`en`).

## Casos de uso

- Asistente de programación local en portátil: el modelo puede generar, completar y explicar código en tiempo real dentro de un IDE, aprovechando la ventana de 262.144 tokens para manejar proyectos grandes y conversaciones largas.
- Agente de codificación autónomo: gracias a su capacidad de tool calling, puede invocar comandos de terminal, editores de código o APIs, y razonar sobre los resultados en múltiples pasos, ejecutándose en hardware NPU de consumo.
- Análisis de capturas de pantalla y diagramas técnicos: su componente de visión permite interpretar imágenes de interfaces, diagramas de arquitectura o fragmentos de código capturados, y responder con código o explicaciones.
- Asistente de documentación técnica: puede generar documentación, resúmenes y comentarios de código a partir de repositorios completos, gracias a la ventana de contexto amplia.
- Prototipado rápido de agentes con herramientas: su soporte de function calling lo hace adecuado para experimentos de automatización de tareas (gestión de archivos, consultas a APIs) en entornos sin GPU.
- Investigación y desarrollo de modelos locales: al ser Apache 2.0, permite su uso en proyectos de investigación y experimentación sin coste de licencia, siempre que se disponga de hardware AMD compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para esta cuantización ni para el modelo base en la información disponible. El autor del repo proporciona un test de rendimiento de inferencia denominado "GhostWriter Influence Test", realizado en un AMD Ryzen AI 340 Framework 13. Es un test arbitrario y no comparable con otros modelos, pero ofrece datos de latencia útiles:

| Metrica | Valor |
|---|---|
| Prompt tokens | 9.210 |
| Completion tokens | 1.796 |
| Total tokens | 11.006 |
| Prefill speed | 276,43 tokens/s |
| Decoding speed | 5,80 tokens/s |
| Time to first token (TTFT) | 33,32 ms |
| KV cache occupancy | 33,59% (de 32.768 tokens máx.) |

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA2 (Ryzen AI 300 series o posterior, p. ej. Strix Point).
- 16 GB de memoria unificada (RAM) para pesos, activaciones y KV cache.
- Linux con el stack XRT (Xilinx Runtime) instalado.
- FastFlowLM versión 0.9.45 o superior, con el comando `flm`.
- No requiere GPU; el modelo solo se ejecuta en NPU. No es compatible con llama.cpp, Ollama ni vLLM.
- Rendimiento observado en Ryzen AI 340: prefill de 276 tokens/s y decoding de 5,8 tokens/s, con un TTFT de 33 ms.

## Comparativa con modelos similares

La comparación es limitada porque este modelo solo funciona en NPU AMD y usa un formato propietario. Como referencia, se comparan características generales con otros modelos de código de tamaño similar:

| Modelo | Parametros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-NPU2 | 9B | 262.144 | Sí | Apache 2.0 | Q4NX (NPU) |
| Qwen3-8B | 8B | 32.768 | No | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-7B | 7B | 131.072 | No | Apache 2.0 | GGUF, safetensors |
| DeepSeek-Coder-V2-Lite | 16B | 131.072 | No | DeepSeek License | safetensors |

No hay datos de rendimiento comparativos disponibles para este modelo. La tabla solo refleja especificaciones técnicas. La principal diferencia es la restricción de hardware y formato de Qwopus3.5-9B-Coder-NPU2.

## Limitaciones y advertencias

- Formato propietario Q4NX: solo se ejecuta en el motor FastFlowLM sobre NPU AMD XDNA2. No es portable a GPU, CPU, llama.cpp ni Ollama.
- Dependencia de kernels cerrados: los xclbins de FastFlowLM no se incluyen en el repo; se enlazan con los kernels del modelo oficial `Qwen3.5-9B-NPU2`, lo que puede generar problemas de compatibilidad si el motor no los encuentra.
- Decodificación lenta: 5,8 tokens/s en el test de referencia, lo que puede ser insuficiente para uso interactivo intensivo.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en español u otros idiomas.
- Sin benchmarks de calidad publicados: no hay evidencia de rendimiento en tareas estándar como HumanEval o MMLU para esta cuantización.
- Requiere hardware específico y reciente (AMD Ryzen AI 300+), con 16 GB de memoria unificada como mínimo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código o respuestas incorrectas; se recomienda validación manual en producción.
- Licencia Apache 2.0 permite uso comercial, pero el software del motor FastFlowLM no es de código abierto en su totalidad (kernels cerrados).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwopus3.5-9B-Coder-NPU2
- Modelo base (Jackrong/Qwopus3.5-9B-v3.5): https://huggingface.co/Jackrong/Qwopus3.5-9B-v3.5
- Repositorio GitHub de Qwopus: https://github.com/codespermuted/qwopus
- Modelo en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwopus3.5-9B-Coder
- Ficha de AIAny sobre Qwopus3.5-9B-Coder-MTP: https://aiany.app/item/qwopus3-5-9b-coder-mtp
