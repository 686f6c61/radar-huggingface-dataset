# BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF

## Resumen

GLM-5.3-Flash-Uncensored es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 320.759.404.382 parámetros totales y aproximadamente 18B parámetros activos por token, según los datos publicados por el autor de la cuantización. Deriva del checkpoint FP8 publicado por OrcaRouter, que a su vez parte de la familia GLM y ha sido modificado para eliminar los mecanismos de rechazo (abliteration). Esta ficha describe la distribución GGUF publicada por el usuario BoldingBuilds, que incluye cuantizaciones IQ3_XXS, IQ2_S e IQ2_XXS generadas con una importance matrix propia, además de un proyector multimodal (mmproj) para entrada de imagen y texto.

El modelo resulta relevante por tres motivos. Primero, ofrece una ventana de contexto declarada de 1M tokens sobre una arquitectura MoE con 288 expertos enrutados y top-8, lo que lo sitúa en la categoría de modelos de contexto largo con activación dispersa. Segundo, la distribución GGUF está pensada para ejecutarse en llama.cpp mainline (a partir de la build b11279), lo que permite desplegarlo en hardware de gama alta sin depender de un fork. Tercero, el autor documenta de forma inusualmente transparente los fallos de las primeras compilaciones, el proceso de reconstrucción y las puertas de coherencia aplicadas, algo poco habitual en el ecosistema de cuantizaciones.

La licencia es MIT, lo que facilita el uso comercial, pero el propio autor advierte de que se trata de un modelo sin censura, liberado para investigación en red-teaming y estudio de mecanismos de rechazo. El repositorio ocupa 1017,3 GB e incluye tres shards por cuantización más el proyector multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `glm5-next` en llama.cpp), con bloques MTP (`blk.45`) y proyector multimodal `glm5v` |
| Parametros totales | 320.759.404.382 (320B) |
| Parametros activos | ~18B por token (288 expertos enrutados, top-8) |
| Longitud de contexto | 1.000.000 tokens (declarado por el autor) |
| Tipos de cuantizacion | IQ3_XXS, IQ2_S, IQ2_XXS (GGUF, con importance matrix propia de 10 chunks) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards por cuantización) + mmproj para visión |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 288 expertos enrutados con enrutamiento top-8, lo que da lugar a unos 18B parámetros activos sobre un total de 320B. El checkpoint incluye además un bloque MTP (multi-token prediction) identificado como `blk.45`, cuyos tensores se mantuvieron en alta precisión en todas las compilaciones. La implementación de referencia en llama.cpp denomina a esta arquitectura `glm5-next`; el autor construyó originalmente los ficheros con el fork del PR #27754 (que la llamaba `glm5next`), cerrado sin fusionar, y posteriormente renombró los metadatos para que funcionaran en mainline tras el merge del PR #27773. Los tensores son idénticos entre ambas implementaciones: mismo nombre, forma y transformaciones de conversión, por lo que el cambio fue de cabecera y no de cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de RLHF o DPO en el modelo base. Lo que sí está documentado es el proceso de cuantización: se generó una importance matrix con 10 chunks (el autor corrige una versión anterior de la model card que afirmaba 60; la ejecución hizo checkpoint en 10 y se detuvo, con una fila de experto sin cubrir en `blk.29`). La receta corregida mantiene en `q8_0` los tensores que se ejecutan en cada token —atención, expertos compartidos, los tres bloques FFN densos y los embeddings—, en lugar de cuantizarlos junto con los expertos enrutados, lo que añade unos 7 GB al tamaño de IQ2_S. El autor verificó la equivalencia numérica entre mainline y el fork antiguo: divergencia KL de 0,020 en prosa y 0,017 en matemáticas, con 94–96% de acuerdo top-1 y determinismo exacto de cada build consigo mismo.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia de ZAI.
- Razonamiento y matemáticas, con un modo de decodificación medido en la puerta de coherencia sobre tareas de código y matemáticas.
- Generación de código, evaluada con HumanEval en la compilación IQ3_XXS original.
- Entrada de imagen y texto (pipeline `image-text-to-text`) mediante el proyector `mmproj` incluido en el repositorio.
- Contexto largo de hasta 1M tokens declarados, adecuado para documentos extensos y conversaciones con historial amplio.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el bloque MTP existe en los pesos pero mainline todavía no lo conecta (el PR #27917 lo añade).
- Modo "uncensored": se han eliminado los rechazos de seguridad, por lo que el modelo cumple con peticiones dañinas, poco éticas o ilegales.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve como sujeto de prueba para medir la eficacia de mecanismos de rechazo y estudiar qué se pierde al aplicar abliteration, comparando sus respuestas con las del checkpoint original. Es el uso que el propio autor declara como prioritario.
- Estudio de mecanismos de rechazo: al disponer de una versión sin censura y de su base, permite analizar en qué capas y direcciones se codifica la negativa a responder, con experimentos de activaciones y probing.
- Evaluación de robustez frente a jailbreaks: su comportamiento permisivo lo convierte en un banco de pruebas para clasificadores de contenido y filtros de salida, midiendo falsos negativos de los sistemas de moderación.
- Procesamiento de documentos largos: con 1M tokens de contexto declarados, puede ingerir contratos, expedientes o bases de código completas en una sola pasada, aunque el coste computacional de esa ventana en hardware local es prohibitivo y conviene reservarlo a despliegues con GPU de 80 GB o superiores.
- Análisis de imágenes con texto asociado: el proyector multimodal permite describir capturas, extraer texto de figuras o responder preguntas sobre diagramas en flujos de documentación técnica.
- Investigación sobre cuantización extrema: la distribución incluye tres niveles (IQ2_XXS, IQ2_S, IQ3_XXS) con datos de coherencia medidos, lo que la hace útil para estudiar la degradación de modelos MoE de 320B a 2–3 bits y validar recetas de importance matrix.
- Generación de código en entornos controlados: HumanEval fue medido sobre IQ3_XXS; puede usarse para tareas de completado y refactorización en pipelines internos donde no haya requisitos de moderación, siempre con revisión humana.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la puerta de coherencia del autor, medida sobre un H200 alquilado con 12 tareas × 2 semillas × 2 samplers, y las cifras de JailbreakBench y HumanEval de la compilación IQ3_XXS original. No se proporcionan los valores numéricos de JailbreakBench ni de HumanEval, solo la mención de que fueron medidos.

| Prueba | IQ2_S original | IQ2_S reconstruido | IQ3_XXS |
|---|---|---|---|
| Tareas de código superadas (de 48) | 45 (falló 3 de 8 tareas de código por agotar el límite de salida sin responder) | 48 | 48 |
| Repetición con `repeat_penalty 1.1` | 21/24 → 21/24 (sin cambio en el modo de fallo) | no disponible | no disponible |
| KL mainline vs fork (prosa) | no aplica | no disponible | 0,020 |
| KL mainline vs fork (matemáticas) | no aplica | no disponible | 0,017 |
| Acuerdo top-1 mainline vs fork | no aplica | no disponible | 94–96% |

No se han publicado resultados de MMLU, GSM8K ni de benchmarks estándar de razonamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 1017,3 GB, repartido entre tres cuantizaciones y el proyector. Para una sola cuantización de 320B a 2–3 bits hay que contar con el tamaño de los tres shards más el contexto KV; el autor menciona que la receta corregida de IQ2_S añade 7 GB respecto a la original por mantener atención, expertos compartidos, FFN densos y embeddings en `q8_0`.
- GPU recomendadas: el autor midió en una H200 alquilada. Para 320B en 2–3 bits se necesita un nodo multi-GPU; una sola A100 de 80 GB o una H100 no bastan para alojar los pesos completos de una cuantización IQ2, salvo con offload parcial a RAM.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090 de 24 GB, RTX 5090 de 32 GB) sin offload masivo a memoria del sistema, lo que degrada el throughput de forma severa en un MoE de este tamaño.
- Opciones de despliegue: llama.cpp mainline build b11279 o superior (obligatorio; builds anteriores fallan con `unknown model architecture: 'glm5next'`). LM Studio funciona tras la corrección de plantilla del 2026-10-07, que reescribe `x.0.type` como `x[0].type` en cuatro puntos. El soporte de MTP en mainline está pendiente del PR #27917.
- Latencia y throughput: no disponibles. El autor solo reporta que mainline y el fork difieren en KL 0,020/0,017 con 94–96% de acuerdo top-1, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada, por lo que la comparación se limita a parámetros y licencia.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored (esta ficha) | 320B | ~18B (MoE top-8) | 1M | MIT | GGUF, FP8 (base) |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | 320B | ~18B | no disponible | no disponible | FP8 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables de 320B MoE con contexto de 1M y licencia MIT sobre los que existan datos públicos de rendimiento.

## Limitaciones y advertencias

- Modelo sin censura: los rechazos de seguridad fueron eliminados por OrcaRouter. Cumplirá peticiones dañinas, poco éticas o ilegales. El autor lo libera para investigación y red-teaming, y la responsabilidad de uso recae en el usuario.
- Riesgo de alucinación: no cuantificado en la información disponible; en un modelo de 320B cuantizado a 2 bits la degradación de fidelidad es esperable, y el propio autor documenta fallos de coherencia en la versión IQ2_S original.
- Fallos de coherencia conocidos: IQ2_XXS está marcado como pendiente de reconstrucción y de superar la misma puerta de coherencia que IQ2_S; hasta entonces no debe usarse en producción. La compilación IQ2_S original falló 3 de 8 tareas de código por razonamiento hasta el límite de salida.
- La `repeat_penalty 1.1` incluida en los metadatos no corrige el modo de fallo de emisión de literales; solo ayuda con la repetición de n-gramas.
- Importance matrix incompleta: 10 chunks en lugar de 60, con una fila de experto sin cubrir en `blk.29`.
- Compatibilidad: requiere llama.cpp b11279 o superior. En LM Studio hay que re-descargar el shard 1 de cada cuantización o editar la plantilla manualmente.
- MTP no conectado en mainline: el bloque `blk.45` está en los pesos pero no se aprovecha todavía, por lo que la decodificación especulativa multi-token no está activa en la implementación de referencia.
- Idiomas soportados no documentados: no hay garantía de calidad fuera de los idiomas del modelo base, que no se especifican.
- Licencia MIT: permite uso comercial, pero eso no exime de cumplir la legislación aplicable sobre contenido generado ni de las obligaciones de moderación en productos dirigidos al público.
- Repositorio de 1017,3 GB: la descarga completa es costosa; conviene bajar solo la cuantización necesaria y verificar los sha256 publicados, dado el historial de reemplazos de shards.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF
- Modelo base FP8: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Discusión #1 (fallo de bucle en IQ2_S): https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF/discussions/1
- Discusión #2 (error de arquitectura en mainline): https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF/discussions/2
- Discusión #4 (plantilla Jinja en LM Studio): https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF/discussions/4
- PR #27754 de llama.cpp (fork `glm5next`, cerrado sin fusionar): https://github.com/ggml-org/llama.cpp/pull/27754
- PR #27773 de llama.cpp (arquitectura `glm5-next` en mainline): https://github.com/ggml-org/llama.cpp/pull/27773
- PR #27917 de llama.cpp (soporte de MTP): https://github.com/ggml-org/llama.cpp/pull/27917
