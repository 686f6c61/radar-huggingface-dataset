# OsaurusAI/LFM2.5-8B-A1B-MXFP8

## Resumen

El modelo OsaurusAI/LFM2.5-8B-A1B-MXFP8 es una conversión cuantizada en formato MLX MXFP8 del modelo original LiquidAI/LFM2.5-8B-A1B, desarrollado por Liquid AI. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) diseñado específicamente para ejecutarse en dispositivos edge, con un total de 8.000 millones de parámetros de los cuales solo 1.500 millones se activan por paso hacia delante, lo que permite una inferencia muy eficiente en hardware limitado. La conversión MXFP8, realizada por OsaurusAI, está optimizada para Apple Silicon y conserva la plantilla de chat original de Liquid, incluyendo el formato de razonamiento interno y las llamadas a herramientas.

La relevancia de este modelo radica en su capacidad para ofrecer razonamiento de cadena de pensamiento, tool calling y comportamiento agéntico en dispositivos locales, con una ventana de contexto de 128.000 tokens y soporte para nueve idiomas. La versión MXFP8 representa el hermano de mayor precisión de la familia MXFP4, ofreciendo un equilibrio entre calidad y eficiencia para despliegues en entornos donde la memoria es un recurso crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con decodificador Transformer |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | 1.500 millones (1.5B) por paso |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | MXFP8 (8 bits, group_size=32, 8.25 bits por peso) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2.5-8B-A1B emplea una arquitectura MoE en la que solo 1.500 millones de parámetros se activan por token, lo que reduce drásticamente el coste computacional en comparación con modelos densos del mismo tamaño. Esta arquitectura está optimizada para dispositivos con recursos limitados, manteniendo un rendimiento competitivo en tareas de razonamiento, generación de código y conversación. El modelo incorpora un mecanismo de razonamiento de cadena de pensamiento (chain-of-thought) que se activa de forma natural dentro del formato de chat, sin necesidad de prefijos sintéticos. Además, soporta llamadas a herramientas mediante un formato de listas de llamadas en Python delimitado por marcadores especiales.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada. La conversión MXFP8 realizada por OsaurusAI preserva los tensores del router en grupos de 8 bits y mantiene la plantilla de chat original en `chat_template.jinja`, garantizando compatibilidad total con el flujo de razonamiento y las herramientas del modelo base.

## Capacidades

- Generación de texto y conversación multilingüe en nueve idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español y portugués).
- Razonamiento de cadena de pensamiento (chain-of-thought) integrado en el flujo de chat, útil para problemas complejos de lógica, matemáticas y planificación.
- Soporte de tool calling / function calling mediante un formato de lista de llamadas en Python, delimitado por `<|tool_call_start|>` y `<|tool_call_end|>`.
- Capacidades agénticas: el modelo puede encadenar múltiples pasos de razonamiento y ejecutar herramientas de forma secuencial, lo que lo hace adecuado para tareas de automatización y agentes autónomos.
- Ventana de contexto de 128.000 tokens, que permite procesar documentos largos y mantener conversaciones extensas con memoria completa.
- Inferencia eficiente en dispositivos Apple Silicon gracias a la cuantización MXFP8 y la integración con MLX.

## Casos de uso

- Asistentes personales en dispositivos Apple: el modelo puede ejecutarse localmente en iPhones, iPads y Macs con Apple Silicon, ofreciendo respuestas rápidas y privadas sin depender de la nube. Su tamaño reducido y la cuantización MXFP8 permiten un uso fluido con un consumo de memoria de aproximadamente 9 GB.
- Automatización de tareas agénticas: gracias al soporte de tool calling, se puede integrar en flujos de trabajo que requieren consultar APIs, enviar correos, gestionar calendarios o interactuar con bases de datos, todo desde un dispositivo local.
- Chat multilingüe en tiempo real: con soporte para nueve idiomas, el modelo puede actuar como traductor o asistente conversacional en entornos multilingües, manteniendo el contexto a lo largo de conversaciones largas.
- Razonamiento matemático y lógico en entornos sin conexión: su capacidad de cadena de pensamiento permite resolver problemas de matemáticas, física o lógica en aplicaciones educativas o de ingeniería, sin necesidad de conexión a internet.
- Generación de código asistida en IDE locales: el modelo puede completar y generar código en varios lenguajes, integrándose en editores como VS Code o Xcode mediante extensiones que usan MLX.
- Procesamiento de documentos extensos: con 128K de contexto, puede resumir, analizar o extraer información de libros, informes o transcripciones largas directamente en el dispositivo, útil para aplicaciones de investigación o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento reportada proviene de una prueba de humo realizada por el autor de la conversión, que registró una velocidad de generación de aproximadamente 196 tokens por segundo en una ejecución de 64 tokens, con un pico de memoria de 8,767 GB. Esta prueba no constituye una evaluación exhaustiva de precisión ni de rendimiento general.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB de memoria unificada para la cuantización MXFP8, según la prueba de humo.
- GPU recomendadas: cualquier dispositivo Apple Silicon con al menos 16 GB de RAM unificada (M1, M2, M3 o M4 en sus variantes Pro/Max/Ultra) para un funcionamiento cómodo sin comprometer otras aplicaciones.
- Compatibilidad con GPUs de consumo: no aplica directamente, ya que el formato MLX está diseñado exclusivamente para Apple Silicon. El modelo base puede ejecutarse en GPUs NVIDIA mediante otras herramientas, pero esta conversión concreta no es compatible.
- Opciones de despliegue: la librería `mlx-lm` es el runtime recomendado, con soporte para carga y generación mediante Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama para este formato específico.
- Latencia y throughput: la prueba de humo reporta ~196 tok/s en un dispositivo Apple Silicon no especificado, con un pico de memoria de 8,767 GB. Este valor es orientativo y puede variar según el modelo de chip y la carga.

## Comparativa con modelos similares

La siguiente tabla compara el modelo base LFM2.5-8B-A1B con otras alternativas de tamaño similar orientadas a dispositivos edge. Los datos de parámetros y contexto provienen de las especificaciones públicas de cada modelo; los resultados de benchmarks no están disponibles para esta conversión.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-8B-A1B | 8B | 1.5B | 128K | lfm1.0 | Safetensors (BF16) |
| OsaurusAI/LFM2.5-8B-A1B-MXFP8 | 8B | 1.5B | 128K | lfm1.0 | MLX MXFP8 |
| Qwen2.5-7B-Instruct | 7.6B | - | 128K | Apache 2.0 | Safetensors, GGUF |
| Llama 3.1 8B Instruct | 8B | - | 128K | Llama 3.1 | Safetensors, GGUF |

La principal diferencia de LFM2.5-8B-A1B frente a los modelos densos de tamaño similar es su arquitectura MoE con solo 1.5B activos, lo que reduce el coste computacional por token manteniendo una capacidad total comparable. Sin embargo, los benchmarks comparativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La cuantización MXFP8 introduce una pérdida de precisión inherente en comparación con el modelo en BF16, aunque menor que la de MXFP4. Para tareas que requieran máxima exactitud numérica, se recomienda usar el modelo original.
- Esta conversión está limitada al runtime MLX, por lo que no es compatible con entornos de servidor tradicionales como vLLM o TGI sin una conversión adicional.
- La licencia lfm1.0 es una licencia propia de Liquid AI que puede imponer restricciones de uso comercial. Se recomienda revisar el texto completo de la licencia antes de su despliegue en producción.
- El modelo está entrenado principalmente para inglés y otros ocho idiomas, pero su rendimiento puede degradarse en variedades dialectales o lenguas no incluidas en la lista.
- Como todo modelo de lenguaje, existe riesgo de alucinación y de generar contenido incorrecto o sesgado, especialmente en dominios especializados o con información ambigua.
- La prueba de humo reporta un pico de memoria de 8,767 GB, por lo que dispositivos con menos de 16 GB de RAM unificada podrían experimentar intercambio a disco y una degradación notable del rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/LFM2.5-8B-A1B-MXFP8
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de introducción a LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
