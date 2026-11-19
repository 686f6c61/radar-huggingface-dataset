# open-athena/Snowball-LongLoop-Round3-2026.11.17.55

## Resumen

Snowball LongLoop Round3 (identificador `open-athena/Snowball-LongLoop-Round3-2026.11.17.55`) es un checkpoint de investigación publicado por el colectivo open-athena, asociado al ecosistema de entrenamiento Marin. Se trata del artefacto final del ciclo de entrenamiento nativo tras 388 actualizaciones de SFT (supervised fine-tuning) y 20 actualizaciones de RL (reinforcement learning), no de un checkpoint seleccionado por validación. El autor lo etiqueta explícitamente como artefacto de investigación sin evaluar de forma rigurosa ni garantía de seguridad para producción.

El modelo emplea una arquitectura de tipo `grug_moe` (mezcla de expertos de diseño simplificado, según el tag del repositorio) con 67.078.882.816 parámetros totales, almacenados en formato safetensors en un repositorio de 134,2 GB. La model card menciona el uso del tokenizador fijado de Marin ("pinned Marin tool tokenizer") y reporta un resultado canónico en el banco Micro210 del 41,07 % de media de benchmarks igualados, con 435 de 440 ensayos calificados y un intervalo conservador del 95 % de 34,10–48,69 %.

Su relevancia es fundamentalmente metodológica: documenta un experimento de RL nativo con presupuesto de aprendizaje agotado y un fallo de desmontaje ("teardown") seguido de una exportación separada con éxito. No debe interpretarse como un modelo listo para uso comercial ni como evidencia de paridad de calidad frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `grug_moe` (mezcla de expertos, segun tag del repositorio) |
| Parametros totales | 67.078.882.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se identifica mediante el tag `grug_moe` como una mezcla de expertos, aunque la model card no detalla el número de expertos, el enrutador, la dimensión oculta ni la configuración de atención. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones de inferencia. Tampoco se documenta la longitud de contexto soportada.

El proceso de entrenamiento consta de 388 actualizaciones de SFT seguidas de 20 actualizaciones de RL nativo, momento en que se agotó el presupuesto de aprendizaje y se confirmó el paso 20. El autor advierte que no es el mejor checkpoint seleccionado por validación y que un fallo de desmontaje precedió a una exportación separada exitosa. No se indica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO más allá de la mención genérica a RL. El modelo utiliza el tokenizador fijado de Marin.

## Capacidades

- Generación de texto y razonamiento general: el modelo ha sido entrenado con SFT y RL, por lo que se espera capacidad de respuesta en tareas de lenguaje, aunque no se documentan evaluaciones específicas por tarea.
- Uso de herramientas: la referencia al "pinned Marin tool tokenizer" sugiere soporte de formato de herramientas, si bien no se detalla el protocolo de tool calling.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en dinámicas de RL: el checkpoint permite reproducir y analizar el efecto de 20 pasos de RL tras 388 de SFT, útil para estudiar la estabilidad del entrenamiento y el agotamiento de presupuesto.
- Auditoría de artefactos de entrenamiento: sirve para examinar cómo un fallo de teardown afecta a la exportación de pesos y a la integridad del checkpoint final.
- Evaluación comparativa de metodologías: puede emplearse como referencia en estudios sobre selección de checkpoints (final vs. mejor por validación) en el ecosistema Marin.
- Reproducción de experimentos con el tokenizador de Marin: útil para validar pipelines que dependen de ese tokenizador fijado.
- Análisis de mezclas de expertos: con 67,1 mil millones de parámetros en formato `grug_moe`, permite estudiar el comportamiento de enrutamiento y activación en un MoE de esta escala.
- Docencia y formación: como ejemplo documentado de un ciclo SFT+RL con métricas reportadas (Micro210) y limitaciones explícitas, adecuado para ilustrar buenas prácticas de transparencia en model cards.

## Benchmarks y rendimiento

| Benchmark | Resultado | Cobertura | Notas |
|---|---|---|---|
| Micro210 (media de benchmarks igualados) | 41,07 % | 435/440 ensayos calificados | Intervalo conservador del 95 %: 34,10–48,69 % |
| TB2 | incluido en la media | 26/30 | Cobertura parcial |

El autor indica que cinco fallos de infraestructura no están incluidos en la media y que el resultado no establece una afirmación de efecto de entrenamiento ni de paridad de calidad. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 67,1 mil millones de parámetros en safetensors, en precisión completa (fp32) se requieren aproximadamente 268 GB; en bf16/fp16, unos 134 GB; en cuantización de 8 bits, unos 67 GB; en 4 bits, unos 34 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: para bf16, múltiples A100 80 GB o H100 80 GB (al menos 2–4 unidades); para cuantización de 8 bits, 1–2 A100/H100; para 4 bits, una sola A100 80 GB o H100.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; en 4 bits podría requerir más de 24 GB según el overhead, por lo que es dudoso que quepa en una sola GPU de consumo.
- Opciones de despliegue: no disponible en la información proporcionada; al ser un MoE con safetensors, sería compatible con frameworks como vLLM o TGI si la arquitectura `grug_moe` está soportada, pero no se confirma.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Snowball LongLoop Round3 | 67,1 B (MoE) | no disponible | openmdw-1.1 | Hugging Face | Artefacto de investigación, sin evaluar |
| Alternativas de ~70 B densos (p. ej., Llama 3.1 70B) | 70 B | 128 K (según versión) | licencia comunitaria | amplia | No comparable directamente por falta de datos del modelo evaluado |
| Alternativas MoE de escala similar (p. ej., Mixtral 8x7B) | 46,7 B totales | 32 K | Apache 2.0 | amplia | No comparable directamente por falta de datos del modelo evaluado |

No se dispone de datos suficientes del modelo evaluado (contexto, benchmarks estandarizados, parámetros activos) para establecer una comparación rigurosa con alternativas. La comparativa se limita a la escala de parámetros y la licencia.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es responsabilidad del usuario.
- No es un checkpoint seleccionado por validación: es el paso 20 final del RL, tras agotar el presupuesto de aprendizaje.
- El resultado reportado (41,07 % en Micro210) no establece una afirmación de efecto de entrenamiento ni de paridad de calidad; el intervalo de confianza es amplio (34,10–48,69 %).
- Cinco fallos de infraestructura no están incluidos en la media reportada, lo que puede sesgar la evaluación.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas, pero al ser un artefacto sin evaluar, estos riesgos son indeterminados.
- Licencia openmdw-1.1: deben revisarse sus términos para uso comercial; no se detallan restricciones adicionales en la información disponible.
- El fallo de teardown previo a la exportación podría implicar riesgos de integridad no documentados.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que impide garantizar su idoneidad para casos de uso multilingües o de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Snowball-LongLoop-Round3-2026.11.17.55
- Resultados y limitaciones (Marin, issue 11337): https://github.com/marin-community/marin/issues/11337#issuecomment-6996529804
