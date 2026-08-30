# liodon-ai/Qwen2-1.5B-Instruct-FP8

## Resumen

Qwen2-1.5B-Instruct-FP8 es una cuantización en precisión FP8 (E4M3) del modelo Qwen2-1.5B-Instruct, publicada por Liodon AI. El objetivo es reducir el tamaño del modelo original (de 3,1 GB a 1,8 GB) y acelerar la inferencia en GPUs modernas con soporte nativo para FP8, manteniendo una recuperación de precisión media del 98,93 % según fuentes externas. Se trata de una conversión directa de pesos, sin reentrenamiento ni calibración, lo que evita sesgos introducidos por conjuntos de calibración.

El modelo base, desarrollado por Alibaba (Qwen), es un transformer de 1.500 millones de parámetros con una ventana de contexto de 32 000 tokens, entrenado para instrucciones y conversación. La versión FP8 hereda todas las capacidades funcionales del modelo original, pero con un consumo de memoria aproximadamente un 50 % menor, lo que lo hace adecuado para despliegues en entornos con recursos limitados, como GPUs de consumo o inferencia en el borde.

La relevancia actual de esta ficha radica en la creciente demanda de modelos pequeños y eficientes para aplicaciones de producción donde el coste de hardware y la latencia son críticos. Al ser una cuantización dinámica sin calibración, el proceso es reproducible y no introduce dependencias de datos externos, lo que facilita su adopción en pipelines de despliegue automatizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base: 32 000 tokens) |
| Tipos de cuantizacion | FP8 (E4M3) dinámico, pesos por canal, activaciones por token |
| Idiomas soportados | no disponible (el modelo base soporta 27 idiomas además de inglés y chino) |
| Licencia | other (ver modelo base Qwen/Qwen2-1.5B-Instruct) |
| Formato de pesos | safetensors (compatible con vLLM, TGI, SGLang) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen2-1.5B-Instruct original, no un entrenamiento nuevo. Se utilizó la herramienta `llm-compressor` del proyecto vLLM con el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de antemano, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere conjunto de calibración, por lo que los pesos cuantizados son numéricamente una conversión directa de los originales, sin sesgo de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara.

El modelo base Qwen2-1.5B-Instruct fue entrenado por Alibaba con datos multilingües (27 idiomas adicionales además de inglés y chino) y ajustado mediante instrucciones y RLHF para tareas conversacionales. La cuantización no altera estas características, pero puede introducir una ligera degradación numérica en las salidas.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base instruct-tuned.
- Razonamiento básico y resolución de problemas matemáticos simples, con limitaciones propias de un modelo de 1,5B.
- Generación de código en lenguajes comunes (Python, JavaScript, etc.), aunque con menor precisión que modelos más grandes.
- Comprensión multilingüe: el modelo base soporta 27 idiomas adicionales, capacidad que se mantiene en la versión cuantizada.
- Ejecución eficiente en GPUs con soporte FP8 nativo (compute capability ≥ 8.9), lo que permite inferencia de baja latencia.
- Compatibilidad con frameworks de inferencia estándar: vLLM, TGI y SGLang, facilitando su integración en entornos de producción.

## Casos de uso

- Chatbots locales en dispositivos edge: con 1,8 GB de pesos, puede ejecutarse en GPUs de consumo como RTX 4060 o incluso en sistemas embebidos con aceleradores compatibles, ofreciendo respuestas conversacionales sin depender de la nube.
- Automatización de operaciones de TI: el modelo puede interpretar comandos en lenguaje natural y generar scripts o respuestas para tareas de soporte, gracias a su capacidad de instrucción y su bajo coste de inferencia.
- Asistente de soporte técnico en tiempo real: su ventana de contexto de 32k tokens permite manejar conversaciones largas con historial, adecuado para sistemas de atención al cliente con presupuesto limitado.
- Generación de código en entornos con restricciones de memoria: integrable en IDEs o pipelines de CI/CD donde el uso de VRAM es crítico, ofreciendo sugerencias de código con latencia aceptable.
- Análisis de texto en streaming: al ser ligero, puede procesar flujos de mensajes o documentos en tiempo real en servidores con GPUs modestas, como L4 o A10.
- Agentes embebidos en aplicaciones de productividad: su tamaño reducido permite empaquetarlo en aplicaciones de escritorio o móviles con aceleración por GPU, para tareas de redacción, resumen o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. Fuentes externas (llm.co, dev.co) mencionan una recuperación de precisión media del 98,93 % respecto al modelo base, pero no se proporcionan métricas específicas como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo en el dominio de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1,8 GB en FP8; con overhead de activaciones y KV cache, se recomienda al menos 3-4 GB de VRAM para inferencia con contexto moderado.
- GPUs compatibles: requiere compute capability ≥ 8.9 para ejecución FP8 nativa (RTX 40-series, L4/L40S, H100/H200, B100/B200/GB10). En GPUs más antiguas, vLLM/TGI dequantizan a BF16, perdiendo la ventaja de memoria y velocidad.
- GPUs de consumo: cabe en RTX 4060 (8 GB), RTX 4070, etc., siempre que tengan soporte FP8 (Ada o posterior).
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, todos compatibles con el formato safetensors y la cuantización FP8.
- Latencia y throughput: no se proporcionan datos oficiales; en GPUs con FP8 nativo, se espera una mejora de velocidad de 1,5-2x frente a BF16, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| Qwen2-1.5B-Instruct (base) | 1,5B | 32k | BF16 | 3,1 GB | other (Qwen) |
| Qwen2-1.5B-Instruct-FP8 (este) | 1,5B | 32k | FP8 dinámico | 1,8 GB | other (Qwen) |
| Qwen2.5-1.5B-Instruct-FP8 (de Liodon) | 1,5B | 32k | FP8 dinámico | ~1,8 GB | other (Qwen) |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento comparativo con otras familias de modelos de tamaño similar (p. ej., Llama 3.2 1B, Gemma 2 2B) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión: la cuantización FP8 introduce una degradación numérica, aunque se reporta una recuperación del 98,93 %; en tareas sensibles (p. ej., matemáticas exactas) puede ser mayor.
- Requisito de hardware: el beneficio completo solo se obtiene en GPUs con compute capability ≥ 8.9; en GPUs antiguas, la dequantización anula las ventajas de memoria y velocidad.
- Licencia "other": la licencia del modelo base Qwen2 no es Apache 2.0; es necesario revisar los términos de la licencia Qwen para uso comercial y redistribución.
- Tamaño del modelo: con 1,5B parámetros, el razonamiento complejo, la generación de código avanzado y el seguimiento de instrucciones largas son limitados en comparación con modelos de 7B o superiores.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sin datos de benchmarks oficiales: la ausencia de métricas publicadas dificulta la evaluación objetiva de su rendimiento en tareas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen2-1.5B-Instruct-FP8
- Modelo base Qwen2-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Variante Qwen2.5-1.5B-Instruct-FP8 (mismo autor): https://huggingface.co/liodon-ai/Qwen2.5-1.5B-Instruct-FP8
