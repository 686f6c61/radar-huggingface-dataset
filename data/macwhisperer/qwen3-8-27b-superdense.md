# macwhisperer/Qwen3.8-27B-SuperDense

## Resumen

El modelo `macwhisperer/Qwen3.8-27B-SuperDense` es una cuantización personalizada en formato GGUF del modelo base Qwen/Qwen3.8-27B, desarrollada por el usuario macwhisperer. Se trata de una versión optimizada para ejecución local en equipos con 24 GB o más de RAM, utilizando una cuantización IQ3_M con matriz de importancia (imatrix) curada manualmente para preservar capacidades de razonamiento y coherencia a bitrates bajos. El modelo base, Qwen3.8-27B, es un LLM denso multimodal de 27 mil millones de parámetros lanzado por Alibaba, con atención híbrida (lineal en 48 de 64 capas), torre de visión integrada, contexto nativo de 262 144 tokens y licencia Apache 2.0.

Esta ficha cubre la versión cuantizada, que ocupa aproximadamente 12,77 GB y está pensada para entornos de inferencia local en hardware de consumo, como portátiles con Apple Silicon o GPUs con 24 GB de VRAM. La relevancia de este modelo radica en su capacidad de ofrecer un rendimiento cercano a cuantizaciones de 4 bits con el tamaño de memoria de una de 3 bits, lo que permite ejecutar un modelo de 27B en equipos sin GPU dedicada de gama alta. La cuantización con imatrix busca mantener la calidad de razonamiento y la fluidez lógica incluso a bitrates reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal en 48 de 64 capas) y torre de visión (modelo base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo, extensible a 1M según vLLM Recipes) |
| Tipos de cuantizacion | IQ3_M (GGUF con imatrix) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta múltiples idiomas, pero la ficha del autor no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con una arquitectura híbrida de atención: 48 de sus 64 capas utilizan atención lineal, mientras que las restantes emplean atención completa. Incluye una torre de visión integrada que le confiere capacidades multimodales, y un cabezal de decodificación especulativa (MTP draft head) para acelerar la generación. El contexto nativo es de 262 144 tokens, extensible hasta 1 millón según la configuración de vLLM.

La versión cuantizada de macwhisperer se generó con llama.cpp aplicando una matriz de importancia (imatrix) entrenada sobre un conjunto de datos curado manualmente. Según la model card, este conjunto incluye ejemplos de código generados con modelos frontera para preservar habilidades de razonamiento arquitectónico, código fuente de llama.cpp, puzzles lógicos y escritura histórica para mantener la coherencia a bitrates bajos. No se especifican los datos de entrenamiento del modelo base ni el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento lógico y matemático, aunque la cuantización IQ3_M puede degradar ligeramente estas capacidades.
- Generación de código: el imatrix incluye ejemplos de código de alta calidad, lo que sugiere una retención significativa de habilidades de programación.
- Capacidades multimodales: el modelo base Qwen3.8-27B incluye una torre de visión, por lo que puede procesar imágenes, aunque la cuantización GGUF puede afectar a esta funcionalidad (no se especifica si la versión cuantizada conserva la visión).
- Soporte de agentes y tool calling: el modelo base está diseñado para flujos de trabajo agénticos y automatización de oficina, según el repositorio oficial de Alibaba.
- Decodificación especulativa: el modelo base incorpora un cabezal MTP (multi-token prediction) que acelera la inferencia, aunque su funcionamiento en la versión cuantizada no está documentado.
- Multilingüismo: no se especifican idiomas concretos para la versión cuantizada; el modelo base de Qwen soporta típicamente inglés, chino y otros idiomas.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en un portátil con 24 GB de RAM para autocompletar código, explicar fragmentos y generar tests, gracias a la retención de habilidades de código del imatrix.
- Razonamiento y resolución de problemas: su contexto de 262K tokens permite procesar documentos largos o conversaciones extensas, útil para análisis de contratos, informes técnicos o investigación.
- Automatización de oficina: el modelo base está optimizado para tareas de oficina como redacción de correos, resúmenes de reuniones y generación de presentaciones, ejecutable en local sin conexión.
- Agentes conversacionales con memoria larga: la ventana de contexto amplia permite mantener el historial de una conversación durante horas sin perder el hilo, adecuado para chatbots de soporte o asistentes personales.
- Procesamiento de documentos con visión (si la cuantización conserva la torre de visión): podría extraer texto de imágenes, tablas o diagramas, aunque esto no está confirmado para la versión GGUF.
- Desarrollo de aplicaciones edge: al ser un GGUF de ~12,77 GB, puede desplegarse en dispositivos con Apple Silicon o GPUs de 24 GB para inferencia sin depender de la nube, cumpliendo requisitos de privacidad o latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica "Perplexity Benchmarks: coming soon" y "Hardware Performance (Apple M2): coming soon". No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras métricas para esta cuantización específica. El modelo base Qwen3.8-27B tiene resultados publicados por Alibaba (por ejemplo, en MathVision), pero no se pueden extrapolar a la versión cuantizada sin verificación.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo GGUF pesa ~12,77 GB, por lo que se necesita al menos 16 GB de RAM/VRAM para cargarlo, aunque el autor recomienda 24 GB o más para dejar espacio al contexto.
- GPUs compatibles: cualquier GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000, etc.) o GPUs de 16 GB con cuantización más agresiva y contexto reducido.
- Apple Silicon: el autor menciona explícitamente equipos con Apple Silicon y 24 GB de RAM unificada (M2 Pro, M2 Max, etc.).
- Opciones de despliegue: llama.cpp (recomendado por el autor), Ollama, LM Studio, vLLM (para el modelo base, aunque la versión GGUF es más adecuada para llama.cpp).
- Latencia y throughput: no disponibles. El autor menciona "High Speed" y "edge computing", pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B denso | 262K | FP16/BF16 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-SuperDense (este) | 27B denso | 262K | IQ3_M GGUF | Apache 2.0 | HuggingFace |
| Qwen3.6-27B (predecesor) | 27B denso | 262K (estimado) | Varias | Apache 2.0 | HuggingFace |
| Gemma4-26B-SuperMoE (del mismo autor) | 26B (MoE) | no disponible | GGUF | no disponible | HuggingFace |

No se dispone de comparativas de rendimiento entre estas opciones. La ventaja principal de esta cuantización es su tamaño reducido (~12,77 GB) frente a una cuantización Q4_K_M típica de un 27B (que rondaría los 16-17 GB), a costa de una posible pérdida de calidad.

## Limitaciones y advertencias

- La cuantización IQ3_M es agresiva y puede degradar la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas, a pesar del imatrix.
- No se han publicado benchmarks de la versión cuantizada, por lo que el rendimiento real es incierto.
- La funcionalidad de visión del modelo base puede no estar disponible o degradarse en el formato GGUF; no se documenta en la model card.
- El autor recomienda ajustar parámetros de inferencia (repeat-penalty, temperature, top-p) para evitar bucles o "robot-speak", lo que indica sensibilidad a la configuración.
- El modelo base tiende a "sobrepensar" (overthinking) según análisis externos, lo que puede aumentar la latencia y el consumo de tokens.
- La licencia Apache 2.0 permite uso comercial, pero la cuantización es un trabajo derivado del modelo base, por lo que se debe mantener la atribución correspondiente.
- No hay garantías de soporte o mantenimiento por parte del autor; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto personal sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/macwhisperer/Qwen3.8-27B-SuperDense
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Análisis de Simon Willison sobre Qwen3.8-27B: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Otros modelos del autor: https://huggingface.co/macwhisperer (enlaces a Qwen3.6-27B-SuperDense, Gemma4-26B-SuperMoE, etc.)
