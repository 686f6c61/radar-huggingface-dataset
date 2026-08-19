# scottlowry/Ornith-1.5-9B-oQ6e

## Resumen

Ornith-1.5-9B-oQ6e es una cuantización en 6 bits del modelo Ornith-1.5-9B, desarrollada por scottlowry mediante la herramienta oQ (oMLX v0.6.2) en formato MLX safetensors. El modelo base pertenece a la familia Ornith de Ornith AI, que se centra en modelos de codificación agéntica open source. Esta versión cuantizada está diseñada para ejecutarse de forma eficiente en hardware Apple Silicon usando el framework MLX, reduciendo el tamaño y los requisitos de memoria frente al modelo original.

A pesar de la denominación "9B", los parámetros totales reales del safetensors son 2.432.736.496 (aproximadamente 2,4 mil millones), lo que sugiere que el nombre podría ser engañoso o que la cuantización ha alterado la representación. La arquitectura declarada es "qwen3_5", lo que indica una base similar a la serie Qwen 3.5, aunque no se dispone de más detalles técnicos del modelo original.

La relevancia de esta cuantización radica en permitir la ejecución local en dispositivos Apple con consumo moderado de recursos, facilitando el despliegue de modelos de lenguaje de tamaño medio en entornos de desarrollo, investigación o aplicaciones de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según model card) |
| Parametros totales | 2.432.736.496 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la familia Ornith 1.0 soporta 256K, no confirmado para 1.5) |
| Tipos de cuantizacion | 6 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la familia Ornith 1.0 usa MIT, no confirmado para 1.5) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre el entrenamiento del modelo base Ornith-1.5-9B. La cuantización se realizó con oQ (oMLX v0.6.2), una técnica de cuantización de precisión mixta que asigna diferentes bits a distintas capas según su sensibilidad, logrando un equilibrio entre tamaño y calidad. El resultado es un modelo de 6 bits con group size 64, almacenado en formato MLX safetensors, optimizado para el framework MLX de Apple.

La arquitectura declarada como "qwen3_5" sugiere una base similar a los modelos Qwen 3.5, pero no se han publicado detalles sobre el número de capas, heads, o configuración exacta. Tampoco hay información sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para esta cuantización ni para el modelo base en la información proporcionada. Sin embargo, basándose en la familia Ornith 1.0 (que comparte nombre y propósito), es plausible que el modelo original tenga capacidades de generación de código, razonamiento multi-paso y soporte para agentes, aunque esto no está confirmado para la versión 1.5.

- Generación de texto: probable, dado su naturaleza de modelo de lenguaje.
- Razonamiento: no confirmado.
- Generación de código: probable según la orientación de la familia Ornith.
- Tool calling / function calling: no confirmado.
- Soporte para agentes: no confirmado.
- Capacidades multilingües: no disponible.

## Casos de uso

Dado el tamaño reducido (2,4B parámetros) y su formato MLX, los casos de uso más realistas se orientan a entornos Apple Silicon con recursos limitados:

- Asistente de código en local: un desarrollador puede ejecutar el modelo en su MacBook para autocompletar código o generar snippets, aprovechando la integración con MLX y la baja latencia en hardware Apple.
- Chatbot ligero para prototipos: al ser pequeño y cuantizado, es adecuado para probar aplicaciones conversacionales sin necesidad de GPUs dedicadas, ideal para fases de desarrollo.
- Procesamiento de texto en aplicaciones de escritorio: integración en herramientas de productividad para resumir, clasificar o generar texto sin depender de servicios en la nube.
- Investigación académica: permite experimentar con modelos de lenguaje en laboratorios sin acceso a clusters GPU, usando un Mac como estación de trabajo.
- Educación y aprendizaje: estudiantes pueden estudiar el comportamiento de un modelo de lenguaje cuantizado y comparar su rendimiento con versiones no cuantizadas.
- Despliegue en dispositivos edge: aunque MLX es específico de Apple, podría usarse en entornos de borde con chips M-series para tareas de NLP en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta cuantización ni para el modelo base Ornith-1.5-9B.

## Requisitos de hardware

- Requiere hardware Apple Silicon (M1 o posterior) por el uso del framework MLX.
- El tamaño del repositorio es de 8,3 GB, lo que implica al menos 8-10 GB de almacenamiento libre.
- Memoria RAM recomendada: al menos 16 GB para cargar el modelo y ejecutar inferencia con margen, aunque el modelo en memoria (2,4B parámetros a 6 bits) ocuparía aproximadamente 1,8 GB, más overhead del sistema.
- No es compatible con GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: exclusivamente mediante MLX (Python, Swift). No se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. No hay datos de rendimiento ni especificaciones detalladas del modelo base. Se podría comparar con otros modelos cuantizados de tamaño similar (por ejemplo, Qwen2.5-3B o Llama-3.2-3B en versiones MLX), pero no se dispone de métricas objetivas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La cuantización en 6 bits puede introducir degradación en la calidad de las respuestas frente al modelo original, especialmente en tareas de razonamiento complejo.
- La licencia del modelo no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o consultar el modelo base original.
- No hay documentación pública sobre el modelo base Ornith-1.5-9B, lo que dificulta conocer sus limitaciones, sesgos o idiomas soportados.
- El nombre "9B" no coincide con los parámetros reales (2,4B), lo que puede inducir a error sobre el tamaño real del modelo.
- Al ser un formato MLX, no es portable a otros ecosistemas sin conversión, limitando su uso en infraestructuras estándar.
- Riesgo de alucinaciones: sin información específica, se asume el riesgo típico de cualquier modelo de lenguaje.
- No se ha validado su comportamiento en producción; se recomienda realizar pruebas exhaustivas antes de usarlo en aplicaciones críticas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ6e)
- [Sitio oficial de Ornith AI](https://ornith.online/)
- [Repositorio GitHub de Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [Guía de Ornith 1.0](https://ornith.site/)
- [Página de oQ en GitHub](https://github.com/jundot/omlx)
