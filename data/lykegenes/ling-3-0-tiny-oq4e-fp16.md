# Lykegenes/Ling-3.0-tiny-oQ4e-fp16

## Resumen

Ling-3.0-tiny-oQ4e-fp16 es una cuantización en 4 bits del modelo Ling-3.0-tiny, desarrollado por inclusionAI, realizada por Lykegenes utilizando la herramienta oQ (oMLX v0.6.2) en formato MLX. Ling-3.0-tiny es un modelo de razonamiento híbrido tipo mixture-of-experts (MoE) diseñado para ofrecer capacidades de razonamiento y agente a bajo coste de inferencia: contiene 7.9 mil millones de parámetros totales pero activa solo 1.3 mil millones por token. Esta cuantización reduce el tamaño del modelo a aproximadamente 4.6 GB, lo que lo hace viable para ejecutarse en hardware de consumo y en dispositivos Apple Silicon mediante MLX.

La arquitectura bailing_hybrid alterna mecanismos de atención con otros componentes (probablemente basados en Kimi), lo que permite un equilibrio entre calidad de razonamiento y eficiencia computacional. El modelo está orientado a agentes responsivos, seguimiento de instrucciones y conversaciones multi-turno, con la posibilidad de activar o desactivar modos de razonamiento según el caso de uso. Esta versión cuantizada mantiene las capacidades del modelo original a costa de una ligera pérdida de precisión, típica de la cuantización de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_hybrid (MoE híbrido con atención y componentes alternos) |
| Parametros totales | 7.9B (modelo original) |
| Parametros activos | 1.3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, group size 64, mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (consultar inclusionAI/Ling-3.0-tiny) |
| Formato de pesos | MLX safetensors |

Nota: el archivo safetensors de este repositorio reporta 1.282.992.288 parámetros, cifra que coincide con los parámetros activos del modelo original. El total real es de 7.9B según la documentación de inclusionAI.

## Arquitectura y entrenamiento

Ling-3.0-tiny emplea una arquitectura híbrida denominada bailing_hybrid, que combina atención tradicional con otros mecanismos (según la descripción de inclusionAI, alterna con componentes tipo Kimi). Esta hibridación busca maximizar la eficiencia en tareas de razonamiento y agentes, manteniendo un coste de inferencia bajo gracias a la activación selectiva de expertos (MoE). El modelo tiene 7.9B de parámetros totales pero solo 1.3B activos por token, lo que reduce significativamente el cómputo requerido.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). La documentación oficial de inclusionAI indica que el modelo está optimizado para agentes responsivos, seguimiento de instrucciones y conversaciones multi-turno, con modos de razonamiento conmutables. La cuantización oQ4e aplicada en este repositorio utiliza precisión mixta (4 bits con grupo de 64) para comprimir los pesos, manteniendo la mayor parte de la calidad del modelo original.

## Capacidades

- Razonamiento y resolución de problemas: el modelo está diseñado para tareas de razonamiento lógico y matemático, con un modo de razonamiento activable.
- Generación de código: soporta tareas de programación y depuración, aunque no se especifica si incluye tool calling nativo.
- Agentes y multi-step reasoning: orientado a sistemas agénticos que requieren planificación y ejecución de múltiples pasos.
- Conversaciones multi-turno: optimizado para diálogos largos y seguimiento de instrucciones.
- Eficiencia computacional: al activar solo 1.3B parámetros, permite inferencia rápida en hardware moderado.
- Formato MLX: compatible con el framework MLX de Apple, lo que facilita su uso en Macs con chips M-series.

## Casos de uso

- Asistentes virtuales locales: el modelo puede ejecutarse en un MacBook con MLX para gestionar conversaciones multi-turno con baja latencia, gracias a su tamaño reducido y activación selectiva de parámetros.
- Agentes de automatización: su capacidad de razonamiento multi-step permite construir agentes que planifiquen y ejecuten tareas complejas, como gestión de calendarios o envío de correos.
- Generación de código en entornos de desarrollo: puede integrarse en editores de código o pipelines de CI/CD para autocompletar, revisar y generar código, aprovechando su bajo coste de inferencia.
- Razonamiento matemático y lógico en educación: útil para sistemas de tutoría que expliquen problemas paso a paso, dado su enfoque en razonamiento.
- Chatbots de atención al cliente: su capacidad de seguir instrucciones y mantener contexto en conversaciones largas lo hace adecuado para sistemas de soporte automatizado.
- Prototipado rápido de aplicaciones de IA: al caber en GPUs de consumo, permite a desarrolladores experimentar con modelos de razonamiento sin necesidad de infraestructura cara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las páginas de llmbase.ai y crafiq.ai mencionan puntuaciones, pero no se han proporcionado los valores concretos en los resultados de búsqueda. Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado en 4 bits ocupa aproximadamente 4.6 GB en disco, por lo que la VRAM necesaria para inferencia ronda los 5-6 GB (incluyendo overhead de activaciones).
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070/4060, o GPUs Apple Silicon unificadas (M1 Pro o superiores) gracias al formato MLX.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y en Macs con memoria unificada de 8 GB o más.
- Opciones de despliegue: al ser MLX, se puede usar con la librería MLX de Apple. Para otras plataformas, se podría convertir a GGUF con herramientas como llama.cpp, aunque no se proporciona en este repositorio.
- Latencia y throughput: no disponibles. Se estima que, al activar solo 1.3B parámetros, la inferencia es significativamente más rápida que un modelo denso de tamaño similar, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-tiny (original) | 7.9B | 1.3B | no disponible | no disponible | safetensors (original) |
| Qwen2.5-1.5B | 1.5B | 1.5B | 32K | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini | 3.8B | 3.8B | 128K | MIT | safetensors, GGUF |

La comparativa es limitada porque no se dispone de benchmarks. Ling-3.0-tiny destaca por su arquitectura MoE híbrida, que permite un rendimiento potencialmente superior a modelos densos del mismo coste de inferencia, pero requiere verificación empírica.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo de razonamiento, puede presentar sesgos en tareas de generación de texto libre.
- Riesgo de alucinación en tareas de razonamiento complejo o generación de código, especialmente en contextos largos.
- Longitud de contexto no documentada; se recomienda probar con ventanas cortas para evitar degradación.
- Idiomas soportados desconocidos; probablemente optimizado para inglés y chino, dado el origen de inclusionAI.
- Licencia no especificada en este repositorio; es necesario consultar la licencia del modelo base en inclusionAI/Ling-3.0-tiny antes de uso comercial.
- La cuantización de 4 bits puede introducir degradación en tareas de alta precisión numérica o razonamiento matemático avanzado.
- El formato MLX limita su uso a ecosistemas Apple; para otros entornos se requiere conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lykegenes/Ling-3.0-tiny-oQ4e-fp16
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Cuantización oQ (oMLX): https://github.com/jundot/omlx
- Variante similar de mlx-works: https://huggingface.co/mlx-works/Ling-3.0-tiny-oQ4e
- Página de SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
- Análisis en llmbase.ai: https://llmbase.ai/models/inclusionai/ling-3-0-tiny/
- Comparativa en crafiq.ai: https://crafiq.ai/models/language/inclusionai-ling-3-0-tiny-rc2
- Benchmarks en benchable.ai: https://benchable.ai/models/inclusionai/ling-3.0-tiny-20260806
