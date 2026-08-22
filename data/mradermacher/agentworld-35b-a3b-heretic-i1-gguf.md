# mradermacher/AgentWorld-35B-A3B-Heretic-i1-GGUF

## Resumen

AgentWorld-35B-A3B-Heretic-i1-GGUF es una cuantización GGUF con imatrix del modelo base auttasak88/AgentWorld-35B-A3B-Heretic, a su vez una versión "abliterated" (heretic) de un modelo de mundo (world model) basado en la arquitectura Qwen3.5-35B-A3B. El modelo está diseñado para simular entornos de agente mediante razonamiento de cadena larga, abarcando siete dominios unificados: MCP, búsqueda, terminal, SWE, Android, web y sistema operativo. Su objetivo es facilitar el entrenamiento y evaluación de agentes autónomos sin necesidad de entornos externos.

Esta ficha concreta corresponde a los pesos cuantizados por mradermacher, que ofrece dos variantes: i1-Q2_K (13 GB) e i1-IQ3_M (15,5 GB). El modelo tiene aproximadamente 34,66 mil millones de parámetros, con una arquitectura MoE (el nombre "A3B" sugiere 3 mil millones de activos, aunque no se ha confirmado). Está licenciado bajo Apache 2.0 y soporta inglés y tailandés. Es relevante porque proporciona una alternativa de mundo-modelo abierta y cuantizada para su despliegue en hardware de consumo, orientada a desarrolladores que trabajan con sistemas de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-35B-A3B |
| Parámetros totales | 34.660.610.688 (≈35B) |
| Parámetros activos | no disponible (el nombre sugiere ~3B, sin confirmación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K (13 GB), i1-IQ3_M (15,5 GB) |
| Idiomas soportados | inglés (en), tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base es un *world model* de lenguaje que simula entornos de agente mediante razonamiento de cadena larga. Está construido sobre la arquitectura MoE de Qwen3.5-35B-A3B, que combina un total de 35B parámetros con una activación parcial por token (el sufijo "A3B" indica aproximadamente 3B activos, aunque no se confirma en la documentación). La versión "Heretic" implica un proceso de *abliteration*, es decir, la eliminación de las capas de rechazo y restricciones de contenido, lo que hace que el modelo responda sin los filtros habituales de seguridad.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o la aplicación de técnicas como RLHF o DPO. La cuantización realizada por mradermacher utiliza *importance matrix* (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión. El modelo se distribuye exclusivamente en formato GGUF, preparado para su uso con llama.cpp, Ollama u otros motores compatibles.

## Capacidades

- Simulación de entornos de agente en siete dominios unificados: MCP (Model Context Protocol), búsqueda web, terminal, ingeniería de software (SWE), Android, web y sistema operativo.
- Generación de texto y razonamiento de cadena larga (long chain-of-thought) para planificar y ejecutar acciones en dichos entornos.
- Soporte de *tool calling* y *function calling* implícito, dado que está diseñado para interactuar con herramientas y APIs en los dominios mencionados.
- Capacidades multilingües limitadas: inglés y tailandés, según la declaración del autor.
- Posibilidad de ser usado como entorno simulador para entrenamiento y evaluación de agentes, sin necesidad de entornos físicos.
- Al ser una versión "abliterated", no presenta rechazos (refusals) ante solicitudes que normalmente serían bloqueadas.

## Casos de uso

- **Evaluación de agentes en entornos simulados**: el modelo puede generar interacciones sintéticas de usuario y sistema para probar agentes de IA en tareas de búsqueda, control de terminal o navegación web, sin necesidad de infraestructura real.
- **Generación de datos sintéticos para entrenamiento**: permite crear conjuntos de datos de interacción agente-entorno para ajustar otros modelos, aprovechando su capacidad de simular múltiples dominios.
- **Automatización de tareas de terminal**: el modelo puede simular sesiones de terminal y generar comandos y salidas, útil para pruebas de pipelines de devops o scripts.
- **Prototipado de asistentes de software**: se puede integrar en un sistema de agente para generar planes de tareas de ingeniería (SWE) como apertura de repositorios, ejecución de pruebas, etc., en un entorno controlado.
- **Investigación en world models**: sirve como herramienta de investigación para estudiar cómo los modelos de lenguaje pueden aprender a simular dinámicas de entornos complejos, gracias a su capacidad de razonamiento de cadena larga.
- **Aplicaciones de agentes web**: dado que soporta el dominio web, puede utilizarse para simular interacciones con páginas web (clics, formularios) en entornos de prueba de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo cuantizado.

## Requisitos de hardware

- **VRAM estimada**: con la cuantización i1-Q2_K (13 GB) se puede ejecutar en una GPU con al menos 16 GB de VRAM; la variante i1-IQ3_M (15,5 GB) requiere 16 GB o más.
- **GPU recomendadas**: tarjetas de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB) son suficientes para las cuantizaciones disponibles. Para una mayor velocidad, se puede usar una A100 (40/80 GB) con cuantizaciones mayores.
- **Compatibilidad con consumer GPU**: sí, las cuantizaciones Q2_K e IQ3_M están diseñadas para caber en GPUs de consumo de gama alta.
- **Opciones de despliegue**: el formato GGUF es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF. También se puede usar con vLLM si se convierte a safetensors, aunque no es el formato original.
- **Latencia y throughput**: no disponibles. Al ser un modelo MoE con activación parcial, el rendimiento puede ser mayor que un modelo denso del mismo tamaño total, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa. El modelo base Qwen3.5-35B-A3B (original sin abliterar) es la referencia más cercana, pero no se tienen datos de su rendimiento en esta ficha. Otras alternativas de world models como Qwen-AgentWorld (el repositorio original) o modelos de simulación de entornos (p. ej., SWE-agent) podrían considerarse, pero no hay datos comparativos disponibles.

## Limitaciones y advertencias

- **Sesgos y contenido**: al ser una versión "abliterated", el modelo puede generar contenido no deseado o no filtrado, lo que conlleva un riesgo de uso indebido. Se recomienda extremar precaución en entornos de producción.
- **Alucinación**: como todo modelo de lenguaje, puede producir respuestas inventadas o incorrectas, especialmente en simulaciones de entornos complejos.
- **Idiomas limitados**: solo se ha documentado soporte para inglés y tailandés; el rendimiento en otros idiomas no está garantizado.
- **Contexto**: no se especifica la longitud máxima de contexto, lo que limita la planificación de tareas de agentes que requieran muchas interacciones.
- **Licencia**: aunque es Apache 2.0, el modelo base original puede tener restricciones adicionales no documentadas en esta ficha.
- **Producción**: la cuantización de baja precisión (Q2_K) puede degradar la calidad del razonamiento, especialmente en tareas de simulación que exigen precisión.

## Enlaces

- [HuggingFace - AgentWorld-35B-A3B-Heretic-i1-GGUF](https://huggingface.co/mradermacher/AgentWorld-35B-A3B-Heretic-i1-GGUF)
- [HuggingFace - Modelo base (auttasak88/AgentWorld-35B-A3B-Heretic)](https://huggingface.co/auttasak88/AgentWorld-35B-A3B-Heretic)
- [HuggingFace - Repositorio estático con cuantizaciones no imatrix](https://huggingface.co/mradermacher/AgentWorld-35B-A3B-Heretic-GGUF)
- [GitHub - Qwen-AgentWorld](https://github.com/QwenLM/Qwen-AgentWorld)
