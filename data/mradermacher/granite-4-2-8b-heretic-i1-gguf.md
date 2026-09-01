# mradermacher/granite-4.2-8b-heretic-i1-GGUF

## Resumen

El modelo `mradermacher/granite-4.2-8b-heretic-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `Dingdust/granite-4.2-8b-heretic`, una variante "abliterada" (decensurada) del modelo Granite 4.2 8B desarrollado por IBM. Esta versión, creada por el usuario Dingdust y cuantizada por mradermacher, elimina los mecanismos de rechazo y censura del modelo original, ofreciendo respuestas sin filtros de seguridad. El modelo base es un transformer denso de aproximadamente 8.800 millones de parámetros, con una ventana de contexto de 128.000 tokens, diseñado para razonamiento paso a paso, tool calling y trabajo agéntico.

La relevancia de esta cuantización radica en que permite ejecutar el modelo en hardware de consumo mediante formatos GGUF, con múltiples niveles de compresión (desde IQ1_S hasta Q6_K) y un archivo imatrix para optimizar la calidad de las cuantizaciones. Está orientado a desarrolladores e investigadores que necesitan un modelo de razonamiento y agente local, sin restricciones de contenido, y con soporte multilingüe (12 idiomas). Su licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según información del modelo base) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (según información del modelo base) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 8B es un transformer denso, sin arquitectura MoE, con 8.791.592.960 parámetros. Según la información disponible, está especializado en razonamiento paso a paso, planificación y ejecución de tareas agénticas, incluyendo secuenciación de herramientas, navegación en codebases y trabajo en terminales. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La variante "heretic" aplica una técnica de abliteración que elimina las capas de rechazo y censura del modelo original, lo que resulta en respuestas sin filtros de seguridad. La cuantización imatrix (i1) de mradermacher utiliza una matriz de importancia para optimizar la asignación de bits durante la compresión, mejorando la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Razonamiento paso a paso: el modelo puede desglosar problemas complejos en pasos intermedios, mostrando su proceso de pensamiento (thinking mode).
- Tool calling y function calling: soporta la invocación de herramientas externas, lo que permite integrarlo en flujos agénticos.
- Trabajo agéntico: puede planificar antes de actuar, secuenciar herramientas, navegar en codebases, trabajar en terminales y verificar resultados.
- Generación de código: capacitado para tareas de programación, incluyendo depuración y refactorización.
- Matemáticas y ciencia: resolución de problemas matemáticos y razonamiento científico.
- Multilingüe: soporta 12 idiomas, incluyendo español, inglés, francés, alemán, japonés, etc.
- Conversacional: diseñado para diálogos multi-turno con contexto largo (128K tokens).
- Sin censura: al ser una versión abliterada, no aplica filtros de seguridad ni rechazos por contenido sensible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, gracias a su ventana de contexto de 128K tokens, manteniendo el historial completo de la interacción. Su capacidad de tool calling permite consultar bases de datos de pedidos o sistemas de tickets.
- Generación de código en producción: integrable en pipelines de CI/CD para generar, revisar o documentar código. Su razonamiento paso a paso y su capacidad de navegar en codebases lo hacen adecuado para tareas de refactorización automatizada.
- Agentes autónomos de investigación: puede planificar y ejecutar búsquedas web, extraer información y sintetizar resultados, gracias a su soporte de tool calling y razonamiento multi-step.
- Asistente de análisis de datos: capaz de interpretar datos tabulares, generar consultas SQL o scripts de Python, y explicar los resultados de forma natural.
- Traducción y localización: al soportar 12 idiomas, puede traducir documentos técnicos o contenido web manteniendo el contexto y el tono.
- Simulación de personajes o roleplay sin restricciones: al ser una versión decensurada, es útil para aplicaciones creativas o de entretenimiento donde se requiera contenido sin filtros, siempre que se cumplan las normativas legales aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización GGUF. Según la información del modelo base Granite 4.2 8B, se reporta una puntuación de 47.67 en SWE-bench Verified, que mide la capacidad de resolver problemas reales de GitHub. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks para esta versión cuantizada.

## Requisitos de hardware

- Tamaño de archivo según cuantización: desde 2.2 GB (i1-IQ1_S) hasta 7.3 GB (i1-Q6_K). Se debe añadir VRAM adicional para el contexto (por ejemplo, 128K tokens pueden requerir varios GB extra).
- GPUs recomendadas: para cuantizaciones pequeñas (IQ1, IQ2, Q2) basta con una GPU de 6-8 GB VRAM (p. ej., RTX 3060, RTX 4060). Para cuantizaciones medias (Q4, Q5) se recomienda 8-12 GB (RTX 3080, RTX 4070). Para Q6_K se necesitan al menos 12 GB (RTX 4080, RTX 4090).
- Compatibilidad con GPU consumer: sí, la mayoría de cuantizaciones caben en GPUs de gama media y alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF. También se puede convertir a otros formatos si es necesario.
- Latencia y throughput: no se dispone de datos medidos. En general, las cuantizaciones más pequeñas ofrecen mayor velocidad a costa de calidad; Q4_K_M suele ser un buen equilibrio.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B, Qwen 2.5 7B, Mistral 7B). Se recomienda consultar benchmarks públicos del modelo base Granite 4.2 8B para una evaluación comparativa.

## Limitaciones y advertencias

- Al ser una versión abliterada (decensurada), el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso en producción debe evaluarse cuidadosamente y cumplir con las normativas legales y éticas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en tareas de razonamiento complejo o con contexto insuficiente.
- Pérdida de calidad por cuantización: las cuantizaciones de baja precisión (IQ1, IQ2) pueden degradar significativamente el rendimiento en tareas de razonamiento y generación de código.
- Limitaciones de idioma: aunque soporta 12 idiomas, el rendimiento puede ser inferior en idiomas con menos representación en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Granite 4.2 8B) no tenga restricciones adicionales. Según la información disponible, es Apache 2.0.
- No se dispone de documentación oficial sobre el proceso de abliteración ni sobre los datos de entrenamiento, lo que dificulta evaluar sesgos o comportamientos no deseados.

## Enlaces

- [Modelo en Hugging Face (mradermacher/granite-4.2-8b-heretic-i1-GGUF)](https://huggingface.co/mradermacher/granite-4.2-8b-heretic-i1-GGUF)
- [Modelo base (Dingdust/granite-4.2-8b-heretic)](https://huggingface.co/Dingdust/granite-4.2-8b-heretic)
- [Página de solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Información sobre Granite 4.2 8B en AI/TLDR](https://ai-tldr.dev/models/granite-4-2-8b/)
- [Ficha de Granite 4.2 8B en NanoGPT](https://nano-gpt.com/models/text/ibm-granite/granite-4.2-8b)
- [Benchmarks de Granite 4.2 8B en Benchable](https://benchable.ai/models/ibm-granite/granite-4.2-8b-20260831)
