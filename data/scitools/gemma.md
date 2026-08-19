# SciTools/gemma

## Resumen

El repositorio `SciTools/gemma` aloja los pesos de un modelo Gemma 4 en formato GGUF, cuantizado y preparado para su ejecución local mediante llama.cpp (referido como "ullama" en la documentación). El archivo principal es `gemma-4-E4B-it-Q4_K_M.gguf`, que corresponde a una variante instruct del modelo Gemma 4 de Google DeepMind, con un total de 7.518.069.290 parámetros (aproximadamente 7,5 mil millones). La cuantización Q4_K_M reduce el tamaño a unos 5 GB, lo que permite su uso en hardware de consumo.

El autor, SciTools, lo emplea en las funciones de IA de su producto "Understand" y ha validado esta cuantización específica mediante una evaluación interna de calidad de chat (puntuación 148,6 en su escala propia). El modelo se distribuye bajo los Términos de Uso de Gemma, con las restricciones de la política de uso prohibido de Google. Este repositorio es relevante para desarrolladores que necesitan una versión ligera y lista para producción de Gemma 4 en entornos locales o con recursos limitados.

La información técnica detallada (arquitectura, contexto, idiomas, benchmarks estándar) no se proporciona en la documentación disponible, por lo que esta ficha se basa únicamente en los datos verificables del repositorio y las páginas oficiales de Gemma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo Gemma 4 de Google DeepMind, sin especificación de arquitectura en la documentación) |
| Parametros totales | 7.518.069.290 (~7,5 mil millones) |
| Parametros activos | no disponible (el nombre del archivo sugiere "E4B", posiblemente 4 mil millones activos, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo GGUF incluido) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo Gemma 4 en este repositorio. Según las páginas oficiales de Google DeepMind, Gemma es una familia de modelos ligeros y abiertos construidos con la misma tecnología que los modelos Gemini, pero no se detallan aspectos como el tipo de transformer, uso de mezcla de expertos, atención lineal u otras innovaciones. El nombre del archivo (`E4B`) sugiere que podría tratarse de una variante con 4 mil millones de parámetros activos, pero esto no está confirmado en la documentación.

Tampoco se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, ni procesos de alineación como RLHF o DPO. La única información de entrenamiento indirecta es que el modelo es una versión "it" (instruct), lo que indica que ha sido ajustado para seguir instrucciones y mantener conversaciones.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de chat, como indica el tag "conversational" y la evaluación de "chat quality" realizada por el autor.
- Inferencia local eficiente: al estar cuantizado en GGUF Q4_K_M, puede ejecutarse en hardware modesto mediante llama.cpp u otros runners compatibles.
- Integración en aplicaciones: el autor lo utiliza en las funciones de IA de su producto "Understand", lo que demuestra su aptitud para integrarse en flujos de trabajo reales.
- No se han documentado capacidades específicas como tool calling, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede integrarse en aplicaciones de escritorio o servidores internos para proporcionar respuestas a preguntas frecuentes o asistencia interactiva, gracias a su formato GGUF y su tamaño reducido (5 GB).
- Chat en entornos con privacidad estricta: al ejecutarse localmente, no requiere enviar datos a servicios externos, lo que lo hace adecuado para organizaciones que manejan información sensible.
- Prototipado rápido de aplicaciones de IA: su formato listo para llama.cpp permite desplegar un endpoint de chat en minutos con herramientas como Ollama o llama.cpp server.
- Automatización de tareas de soporte: el modelo puede gestionar conversaciones multi-turno básicas, aunque se desconoce la longitud de contexto máxima, por lo que es recomendable para diálogos cortos.
- Evaluación de calidad de modelos cuantizados: el autor ha definido un protocolo interno de evaluación; este repositorio puede servir como referencia para comparar cuantizaciones de Gemma 4.
- Desarrollo de features de IA en productos SaaS: la integración realizada por SciTools en "Understand" demuestra que puede incorporarse como componente de generación de texto en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la evaluación interna del autor:

| Metrica | Valor |
|---|---|
| Calidad de chat (escala GitAhead propia) | 148,6 |
| Ejecuciones de calificación | 3/3 |

Esta métrica no es comparable con benchmarks públicos y no puede utilizarse para contrastar con otros modelos.

## Requisitos de hardware

- Tamaño del archivo GGUF: aproximadamente 5 GB (tamaño del repositorio), lo que indica que la cuantización Q4_K_M ocupa unos 5 GB en disco.
- VRAM estimada para inferencia: con Q4_K_M, se necesitan al menos 6-8 GB de VRAM para cargar el modelo completo en GPU. En CPU, se requerirían unos 8-10 GB de RAM.
- GPUs recomendadas: tarjetas con 8 GB de VRAM o más, como NVIDIA RTX 3060/3070/3080, RTX 4060/4070, o GPUs de datacenter como A10G o T4. No se espera que funcione en GPUs de 4 GB sin offloading a CPU.
- Opciones de despliegue: llama.cpp (incluido el servidor `llama-server`), Ollama, LM Studio, o cualquier runner compatible con GGUF. También puede usarse con bindings de Python como `llama-cpp-python`.
- Latencia y throughput: no se proporcionan datos. Como referencia orientativa, un modelo de ~7B en Q4_K_M en una RTX 3090 suele generar entre 30 y 60 tokens por segundo, pero esto es una estimación no verificada para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. El repositorio no incluye resultados de benchmarks estándar ni especificaciones detalladas. Los modelos comparables serían otras cuantizaciones GGUF de Gemma 4 o de la familia Gemma (como Gemma 2 o Gemma 3), pero no hay datos públicos de este repositorio para contrastar. Se recomienda consultar las páginas oficiales de Gemma para obtener especificaciones de los modelos originales.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso: se debe cumplir la Gemma Prohibited Use Policy, que prohíbe ciertos usos como actividades ilegales, generación de contenido dañino o vigilancia masiva. Es obligatorio revisar los términos completos antes de su uso comercial.
- Este repositorio redistribuye los pesos cuantizados sin modificaciones, pero no está respaldado por Google. El autor declara que no hay afiliación oficial.
- No se dispone de información sobre sesgos del modelo, riesgos de alucinación o limitaciones idiomáticas. Dado que es un modelo instruct de Google, es probable que presente sesgos similares a otros modelos de la familia, pero no hay datos verificables.
- La cuantización Q4_K_M puede degradar ligeramente la calidad en comparación con el modelo original de precisión completa. El autor solo ha validado esta cuantización específica; otros archivos GGUF del mismo modelo podrían no ofrecer el mismo rendimiento.
- La longitud de contexto no se especifica, por lo que no se recomienda su uso en tareas que requieran ventanas de contexto muy largas sin verificar previamente su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SciTools/gemma
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Página general de Gemma: https://deepmind.google/models/gemma/
- Documentación de Gemma en Google AI for Developers: https://ai.google.dev/gemma/docs
- Guía de inicio con Gemma: https://ai.google.dev/gemma/docs/get_started
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
