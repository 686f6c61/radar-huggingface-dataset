# deep-principle/Hydrogen-1.0-MXFP4

## Resumen

Hydrogen-1.0 es un modelo de lenguaje orientado a la resolución de problemas científicos y a la asistencia en investigación, desarrollado por Deep Principle a partir de GLM-5.3 de Z.ai. Esta ficha cubre concretamente la variante cuantizada MXFP4, publicada como `deep-principle/Hydrogen-1.0-MXFP4`, pensada para su despliegue en hardware AMD Instinct. El modelo está diseñado para interactuar mediante texto y ayudar con preguntas científicas, explicar derivaciones y estructurar respuestas a problemas de investigación abiertos.

La relevancia de esta variante reside en la cuantización: reduce el peso de los pesos manteniendo en BF16 los componentes sensibles (atención, router, embeddings, `lm_head` y `eh_proj`), lo que permite servir un modelo de contexto muy largo en aceleradores AMD con un consumo de memoria menor que la versión BF16. Según la model card, soporta hasta 1M tokens de contexto y 128K tokens de salida máxima, aunque los presupuestos efectivos dependen del runtime y de los recursos disponibles.

La información pública es limitada: el autor no divulga datos de entrenamiento, número de parámetros ni resultados de benchmarks. La licencia es MIT, lo que facilita el uso comercial, pero la ausencia de especificaciones detalladas obliga a validar el modelo empíricamente antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según referencias a "shared and routed experts" y capa MTP en la model card; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (según model card; el presupuesto efectivo depende del runtime y la memoria) |
| Tipos de cuantizacion | MXFP4 (esta variante); también existen BF16 y NVFP4 en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint MXFP4 (compatible con runtime AMD ATOM); índice de pesos e indexación incluidas en el repositorio |

## Arquitectura y entrenamiento

La model card indica que Hydrogen-1.0 se construye sobre GLM-5.3 y que emplea una arquitectura con expertos compartidos y enrutados (MoE), además de una capa MTP (multi-token prediction). En esta variante MXFP4, los MLP densos, los expertos compartidos y enrutados y la capa MTP se cuantizan en MXFP4 con activaciones dinámicas, mientras que la atención, el router, los embeddings, el `lm_head` y `eh_proj` permanecen en BF16. La cuantización se realizó con AMD Quark.

No se han divulgado los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. El autor declara explícitamente que los métodos, procedimientos y datos de entrenamiento no son públicos. Tampoco se detalla la innovación técnica más allá de la propia arquitectura MoE con MTP y el soporte de decodificación especulativa (desactivada en las pruebas reportadas).

## Capacidades

- Generación de texto y razonamiento científico: preguntas, explicaciones de ecuaciones, derivaciones y supuestos.
- Asistencia en problemas de investigación abiertos con respuestas estructuradas.
- Razonamiento multi-paso y cadenas de razonamiento largas (la model card menciona "long reasoning requests").
- Contexto muy largo: hasta 1M tokens de entrada y 128K de salida, sujeto al runtime y la memoria.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card advierte que el rendimiento puede variar según el idioma.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Asistencia a investigadores en ciencias: el modelo puede explicar derivaciones y contrastar supuestos en conversaciones multi-turno gracias a su ventana de hasta 1M tokens, útil para revisar artículos o documentación extensa.
- Revisión de literatura científica: con contexto largo, se puede cargar un conjunto amplio de fragmentos de artículos y pedir resúmenes estructurados o comparaciones entre metodologías.
- Docencia y divulgación: generación de explicaciones paso a paso de ecuaciones y conceptos, con la advertencia de que el contenido debe ser revisado por un experto.
- Borradores de propuestas de investigación: el modelo puede organizar hipótesis, supuestos y posibles enfoques para problemas abiertos, sirviendo como material de partida para revisión humana.
- Despliegue en infraestructura AMD: al estar cuantizado en MXFP4 y probado en MI350X con ATOM, encaja en clústeres AMD Instinct donde se quiera servir un modelo de contexto largo con menor huella de memoria que BF16.
- Estudio del comportamiento de modelos cuantizados: investigadores pueden comparar las salidas de MXFP4 frente a BF16 o NVFP4 para analizar el impacto de la cuantización en tareas científicas.
- Herramientas de investigación downstream: integración vía API compatible con OpenAI (el ejemplo de la model card usa un servidor ATOM con endpoint `/v1/models`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación se centra en preguntas científicas de opción múltiple y problemas de investigación abiertos, pero no proporciona cifras concretas ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del número de parámetros, que no se ha divulgado. La variante MXFP4 reduce el peso respecto a BF16, pero no se especifica el total.
- GPU recomendadas: AMD Instinct MI350X, probada por el equipo con ATOM en tensor parallel 4 (TP4) y caché KV en FP8.
- GPU consumer: no disponible; no se indica compatibilidad con GPUs de consumo.
- Despliegue: runtime ATOM (`python -m atom.entrypoints.openai_server`), con `--trust-remote-code`, `--kv_cache_dtype fp8` y `--tp 4` en el ejemplo del autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles. La model card reporta observaciones de concurrencia: con 128 peticiones concurrentes de razonamiento largo el pool de KV se llenó y se produjo evicción con caída brusca de calidad; con 48 peticiones concurrentes el pool se mantuvo por debajo del 75% y la calidad fue normal. Son observaciones de ese despliegue, no límites universales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hydrogen-1.0-MXFP4 | no disponible | 1M | MIT | HuggingFace (este repo) | Cuantización MXFP4, probada en AMD MI350X con ATOM |
| Hydrogen-1.0 (BF16) | no disponible | 1M | MIT | HuggingFace | Versión sin cuantizar; requiere más memoria |
| Hydrogen-1.0-NVFP4 | no disponible | 1M | MIT | HuggingFace | Cuantización NVFP4; probada en 8x B300 (NVIDIA Blackwell) |
| GLM-5.3 (modelo base) | no disponible | no disponible | no disponible | HuggingFace (zai-org/GLM-5.3) | Modelo base sobre el que se construye Hydrogen-1.0 |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias.

## Limitaciones y advertencias

- Riesgo de alucinación: el modelo puede producir hechos, cálculos, ecuaciones, referencias o explicaciones científicas incorrectas; una respuesta detallada o segura no garantiza corrección.
- Sesgos: los datos de entrenamiento pueden introducir sesgos de selección, culturales o lingüísticos; las salidas no representan necesariamente el consenso científico.
- Contexto largo: la capacidad de 1M tokens no garantiza una recuperación fiable de todos los detalles de la entrada.
- Cuantización MXFP4: puede afectar a las salidas; el autor recomienda validar el modelo cuantizado para la tarea prevista y no afirma una pérdida de precisión medida.
- Idiomas: no se especifican los idiomas soportados y el rendimiento puede variar según el idioma.
- Producción: es necesario conservar `generation_config.json` para el stopping correcto, además del tokenizador, la plantilla de chat, las configuraciones de modelo y cuantización y el índice de pesos. Hay que monitorizar la utilización y evicción de la caché KV bajo carga.
- Uso responsable: las salidas son material de apoyo y no deben tratarse como hallazgos experimentales verificados ni como base suficiente para decisiones que afecten a la salud o la seguridad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la exactitud de las salidas.

## Enlaces

- Repositorio HuggingFace (MXFP4): https://huggingface.co/deep-principle/Hydrogen-1.0-MXFP4
- Modelo base BF16: https://huggingface.co/deep-principle/Hydrogen-1.0
- Variante NVFP4: https://huggingface.co/deep-principle/Hydrogen-1.0-NVFP4
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Contacto del autor: info@deepprinciple.com
- README en chino: README.zh-CN.md (en el repositorio)
