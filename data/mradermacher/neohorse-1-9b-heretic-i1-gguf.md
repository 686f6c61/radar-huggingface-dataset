# mradermacher/NeoHorse-1-9B-heretic-i1-GGUF

## Resumen

NeoHorse-1-9B-heretic-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo NeoHorse-1-9B-heretic, desarrollado por Dingdust y empaquetado en formato GGUF por mradermacher. Con aproximadamente 8,95 mil millones de parámetros, el modelo original está orientado a tareas agénticas, uso de herramientas, generación de código y razonamiento, con un énfasis especial en respuestas sin restricciones de alineación (versión "heretic"). El formato GGUF permite su ejecución local con llama.cpp y herramientas compatibles, y su licencia Apache 2.0 facilita el uso comercial.

El paquete incluye numerosos niveles de cuantización, desde 2,8 GB (IQ1_S) hasta 7,5 GB (Q6_K), lo que permite elegir entre velocidad y calidad según el hardware disponible. Su relevancia radica en ofrecer una alternativa de 9B parámetros para aplicaciones de agentes y tool use en inglés, sin las trabas típicas de los modelos alineados, aunque esto conlleva riesgos de seguridad y generación de contenido no deseado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura no especificada) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con matriz de importancia (imatrix) |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura del modelo base NeoHorse-1-9B-heretic. Por el número de parámetros (~9B) y la etiqueta "transformers", se trata muy probablemente de un transformer denso, pero la ausencia de documentación técnica impide confirmar si incorpora capas MoE o alguna innovación estructural. Tampoco se publican datos sobre el corpus de entrenamiento, el número de tokens procesados ni el proceso de alineación.

El sufijo "heretic" y los tags "uncensored", "decensored" y "abliterated" sugieren que el modelo original se sometió a técnicas para eliminar o reducir los mecanismos de rechazo de respuestas, aunque no hay documentación técnica verificable al respecto. La cuantización i1 de mradermacher utiliza una matriz de importancia para preservar la calidad en los pesos más relevantes, pero no mejora el modelo original: solo reduce su huella en disco y memoria.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, con soporte en inglés.
- Razonamiento multi-paso, adecuado para descomponer problemas complejos en pasos intermedios.
- Generación de código y asistencia en tareas de programación, refactorización y revisión.
- Soporte de tool calling / function calling para interactuar con APIs, funciones locales y herramientas externas.
- Capacidad para encadenar múltiples llamadas a herramientas en flujos agénticos.
- Modelo "heretic": responde sin los filtros de alineación habituales, lo que puede resultar en contenido explícito, controvertido o no filtrado.
- Sin capacidades de visión, audio ni multimodalidad conocidas.

## Casos de uso

- Asistentes de programación en inglés: el modelo genera, revisa y refactoriza código en entornos de desarrollo, aprovechando su tool-use para ejecutar comandos o consultar APIs.
- Agentes autónomos de automatización: encadena llamadas a funciones, consultas a bases de datos o solicitudes a APIs en flujos de trabajo de varios pasos, gracias a su razonamiento multi-step.
- Análisis de documentación técnica: procesa y resume documentos largos en inglés dentro de pipelines de extracción de información, a condición de conocer previamente su longitud de contexto.
- Chatbots de soporte técnico interno: en entornos controlados donde se requiere un asistente sin restricciones de tono o política, por ejemplo en laboratorios de investigación.
- Investigación sobre alineación: sirve como base para estudiar el efecto de la abliteración en el comportamiento de un modelo de 9B, comparándolo con su gemelo no abliterado.
- Prototipado rápido de sistemas agénticos: gracias al formato GGUF, se ejecuta localmente con llama.cpp u Ollama para validar flujos de tool use antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para Q4_K_M (5,7 GB) se recomiendan al menos 8 GB de VRAM con overhead de contexto y KV-cache. Para Q6_K (7,5 GB), se recomiendan 10 GB. En cuantizaciones muy bajas como IQ1_S (2,8 GB), bastan 4 GB con ventanas de contexto pequeñas.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, A10 o H100 para inferencia con mayor concurrencia. Para Q5_K_M o superior, es adecuada una RTX 4070.
- Compatibilidad con GPU de consumo: sí. Q4_K_S (5,5 GB) y Q4_K_M (5,7 GB) caben en GPUs de 8GB como la RTX 4060, dejando margen para contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y Text Generation WebUI con backend llama.cpp. vLLM tiene soporte experimental para GGUF, pero no se recomienda para producción.
- Latencia y throughput: no disponible; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

Los siguientes modelos se han identificado en la búsqueda como pertenecientes a la misma familia de cuantizaciones GGUF de mradermacher y tamaño similar:

| Modelo | Parametros | Formato | Licencia | Tipo |
|---|---|---|---|---|
| NeoHorse-1-9B-heretic-i1-GGUF | ~9B | GGUF | Apache 2.0 | heretic / abliterated |
| Ornith-1.5-9B-heretic-i1-GGUF | ~9B | GGUF | MIT | heretic / abliterated |
| Ornith-1.5-9B-i1-GGUF | ~9B | GGUF | MIT | estándar |

No se dispone de datos de benchmarks ni de longitudes de contexto para realizar una comparativa de rendimiento. La diferencia principal entre estos modelos es la licencia (Apache 2.0 frente a MIT) y la variante "heretic" frente a la estándar.

## Limitaciones y advertencias

- Al ser una versión "heretic" o abliterated, el modelo puede generar contenido peligroso, ilegal o moralmente objetable. Es responsabilidad del usuario evaluar el contexto de uso.
- Riesgo de alucinación inherente. Al no publicarse benchmarks, no se puede estimar su fiabilidad real en tareas concretas.
- Soporte exclusivo en inglés: limita su utilidad en entornos multilingües o en aplicaciones dirigidas a usuarios hispanohablantes.
- No se dispone de la longitud de contexto exacta, lo que impide garantizar un rendimiento óptimo en documentos extensos.
- Las cuantizaciones muy agresivas (IQ1_S, IQ2_XXS) degradan notablemente la calidad. Se recomienda usar Q4_K_M o superior para tareas críticas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original puede heredar condiciones adicionales no documentadas en esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/mradermacher/NeoHorse-1-9B-heretic-i1-GGUF
- Modelo similar Ornith-1.5-9B-heretic-i1-GGUF: https://huggingface.co/mradermacher/Ornith-1.5-9B-heretic-i1-GGUF
- Modelo similar Ornith-1.5-9B-i1-GGUF: https://huggingface.co/mradermacher/Ornith-1.5-9B-i1-GGUF
