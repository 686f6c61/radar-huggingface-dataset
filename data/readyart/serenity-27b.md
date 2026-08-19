# ReadyArt/Serenity-27B

## Resumen

Serenity-27B es un modelo de lenguaje desarrollado por la organización ReadyArt, publicado en Hugging Face con acceso restringido (gated). Se basa en el modelo JonathanColetti/Qwen3.8-27B-Uncensored, un fine-tuning sin censura de la familia Qwen 3.8, orientado a conversación, roleplay y contenido adulto explícito. El modelo está etiquetado como "unaligned" y "nsfw", lo que indica que no ha sido alineado con políticas de seguridad convencionales y puede generar contenido explícito o sensible.

La relevancia de este modelo reside en su propósito específico: ofrecer una alternativa sin restricciones para aplicaciones de roleplay, narrativa interactiva y conversación madura, donde los modelos alineados suelen rechazar peticiones. Sin embargo, la información pública disponible es muy limitada: no se especifican parámetros, arquitectura, contexto ni datos de entrenamiento más allá del modelo base. El repositorio no presenta métricas de descargas ni likes, y no se han publicado benchmarks. Por tanto, esta ficha se basa únicamente en los metadatos del Hub y en la naturaleza del modelo base declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 27B, pero no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura de Serenity-27B. El modelo base declarado es JonathanColetti/Qwen3.8-27B-Uncensored, que a su vez parte de la familia Qwen (probablemente un transformer denso de 27 mil millones de parametros, aunque no se confirma). Al tratarse de un fine-tuning, se asume que se ha ajustado el modelo base con datos de conversacion y roleplay, posiblemente mediante instruct-tuning, pero no se han publicado detalles sobre el dataset, el numero de tokens de entrenamiento ni si se emplearon tecnicas como RLHF o DPO. La etiqueta "uncensored" sugiere que se ha eliminado o reducido la alineacion de seguridad del modelo original, lo que permite generar contenido explicito sin rechazo.

## Capacidades

- Generacion de texto conversacional y narrativo, especialmente orientado a roleplay y dialogo interactivo.
- Soporte de instrucciones (instruct) para tareas de chat y generacion de historias.
- Capacidad de generar contenido adulto explicito y sin censura, segun las etiquetas del modelo.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se indica capacidad multilingue; probablemente hereda las capacidades del modelo base Qwen, pero no esta documentado.
- No se mencionan capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Roleplay narrativo: el modelo puede generar respuestas en personaje para juegos de rol textuales, manteniendo coherencia conversacional y adaptandose a contextos ficcionales.
- Creacion de contenido literario adulto: escritura de relatos eroticos o escenas explicitas bajo demanda, donde modelos alineados rechazarian la solicitud.
- Chatbots de compania sin filtros: asistentes conversacionales para usuarios que buscan interacciones sin restricciones de contenido.
- Prototipado de sistemas de dialogo experimental: investigadores que necesitan un modelo sin alineacion para estudiar comportamientos de generacion de texto sin politicas de seguridad.
- Generacion de guiones o dialogos para proyectos creativos que requieren lenguaje maduro.
- Evaluacion de robustez frente a contenido nocivo: dado su caracter "unaligned", puede usarse como caso de estudio para medir sesgos o riesgos en modelos sin moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. La unica referencia externa es un modelo similar llamado Serenity-26B-A4B-GGUF, que aparece en BenchmarkList con 25 modelos de la organizacion, pero no se detallan resultados concretos para esta version.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 27 mil millones de parametros (segun el nombre), se estima que requiere al menos 16-20 GB de VRAM en cuantizacion de 8 bits y alrededor de 32 GB en precision completa (fp16).
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) podria ejecutar una cuantizacion de 4 bits; para precision completa se necesitarian GPUs de datacenter como A100 (40/80 GB) o H100.
- No se confirma si el modelo se distribuye en formato GGUF para ejecucion en CPU o GPU consumer, aunque la existencia de una variante GGUF de Serenity-26B sugiere que podria haber versiones cuantizadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se obtenga acceso al repositorio y se conviertan los pesos si es necesario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo base JonathanColetti/Qwen3.8-27B-Uncensored podria compararse con otros modelos "uncensored" como Dolphin-Mixtral o Nous-Capybara, pero no hay datos de rendimiento publicados para Serenity-27B. La organizacion ReadyArt publica otros modelos como Omega-Evolution-27B-v2.0, pero no se conocen sus especificaciones. Por tanto, la comparativa se limita a indicar que el modelo pertenece a una categoria de LLMs sin alineacion de seguridad, con licencia Apache 2.0 y acceso restringido.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso inmediato.
- Sin datos de rendimiento: no hay benchmarks ni evaluaciones publicadas, por lo que su calidad real es desconocida.
- Riesgo de alucinacion: al ser un modelo sin alineacion, puede generar afirmaciones falsas o incoherentes con mayor frecuencia que modelos alineados.
- Sesgos y contenido nocivo: al estar etiquetado como "nsfw" y "unaligned", puede producir discurso de odio, violencia o contenido ilegal, lo que supone un riesgo legal y etico en entornos de produccion.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o legislacion local.
- Falta de documentacion: no se especifican idiomas, contexto ni requisitos tecnicos, lo que dificulta su integracion fiable.
- Fecha de creacion futura (2026-08-18) y ausencia de descargas sugieren que el modelo podria estar en fase experimental o no validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ReadyArt/Serenity-27B
- Perfil de la organizacion ReadyArt: https://huggingface.co/ReadyArt/collections
- Perfil de benchmarks de ReadyArt en BenchmarkList: https://benchmarklist.com/providers/readyart/
- Referencia a una variante GGUF (Serenity-26B-A4B-GGUF): https://www.toolify.ai/ai-model/readyart-serenity-26b-a4b-gguf
- Referencia a otro modelo de la organizacion (Omega-Evolution-27B-v2.0): https://www.toolify.ai/ai-model/readyart-omega-evolution-27b-v2-0
