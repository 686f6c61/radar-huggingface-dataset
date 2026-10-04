# joshycodes/fd-gemma-4-12b-equanimity_trust-s1

## Resumen

`joshycodes/fd-gemma-4-12b-equanimity_trust-s1` es un checkpoint de investigación publicado en HuggingFace por el usuario `joshycodes`. Por la nomenclatura y por los repositorios hermanos de la misma cuenta (`joshycodes/fd-gemma-4-12b-trust`, `joshycodes/gemma-4-12b-it-fve-workdiscern-s0`), se trata de una variante de `google/gemma-4-12B-it` sometida a un proceso de preentrenamiento continuado sobre pesos completos. El repositorio no incluye model card, por lo que la mayoría de detalles de entrenamiento, licencia y capacidades no están documentados de forma oficial.

El modelo tiene 11.959.730.224 parámetros reales (≈12B) en precisión BF16 y un repositorio de 24,0 GB, con la etiqueta de arquitectura `gemma4_unified`. Se apoya en la familia Gemma 4 de Google DeepMind, presentada como una generación de modelos abiertos nativamente multimodales, con arquitecturas densas y de mezcla de expertos (MoE, por sus siglas en inglés) que abarcan de 2,3B a 31B parámetros, según el informe técnico de la familia. El checkpoint cuenta con 12 descargas y 0 likes en el momento de redactar esta ficha.

Su relevancia es acotada y de perfil experimental: se trata de un artefacto de investigación orientado a estudiar los efectos del preentrenamiento continuado sobre un modelo base multimodal, no un modelo listo para producción. Quien lo evalúe debe asumir que no hay garantías de calidad, soporte, licencia explícita ni mantenimiento por parte de su autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card del repositorio. Etiqueta declarada: `gemma4_unified`. La familia Gemma 4 incluye arquitecturas densas y MoE con codificadores de visión y audio; el tamaño de 12B coincide con los tamaños densos de la familia |
| Parámetros totales | 11.959.730.224 (dato real, pesos safetensors) |
| Parámetros activos | No aplica / no disponible (no se documenta una variante MoE para este checkpoint) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El repositorio solo publica pesos BF16 en safetensors; no se distribuyen versiones cuantizadas (GGUF, AWQ, GPTQ, FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16), 24,0 GB de repositorio |
| Fecha de creación | 2026-10-04 |
| Última actualización | 2026-10-04 |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

No existe información oficial sobre el proceso de entrenamiento de este checkpoint concreto. Los repositorios hermanos de la misma cuenta sí documentan su procedimiento, y el patrón es consistente: preentrenamiento continuado sobre pesos completos partiendo de `google/gemma-4-12B-it`, con learning rate de 1e-05, una época y un corpus de aproximadamente 7.719.872 tokens repartidos en 8.268 documentos. En el caso de `joshycodes/gemma-4-12b-it-fve-workdiscern-s0`, ese corpus se describe como autogenerado por el propio modelo. No se ha confirmado que estos hiperparámetros se apliquen a `fd-gemma-4-12b-equanimity_trust-s1`, aunque el nombre del repositorio (con sufijo de serie `-s1`) apunta a una familia de checkpoints secuenciales.

La base sobre la que se apoya, Gemma 4, se presenta en su informe técnico como una generación de modelos abiertos nativamente multimodales, con arquitectura unificada y sin codificador separado en el caso de `gemma4_unified`, y con codificadores de visión y audio mejorados respecto a generaciones anteriores. El informe describe una gama que va de 2,3B a 31B parámetros con variantes densas y MoE. Para este checkpoint en particular no se ha publicado información sobre composición del dataset, uso de RLHF o DPO, ni sobre innovaciones técnicas aplicadas.

## Capacidades

- Generación de texto: presumiblemente heredada de `google/gemma-4-12B-it`, pero no verificada ni documentada para este checkpoint.
- Multimodalidad nativa: la familia Gemma 4 incorpora visión y audio según el informe técnico; no se confirma que este checkpoint conserve dichas capacidades tras el preentrenamiento continuado sobre texto.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentado; no se declara lista de idiomas.
- Modo de pensamiento (thinking) u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre preentrenamiento continuado: el checkpoint permite reproducir y analizar el efecto de una época adicional a learning rate bajo sobre un modelo base multimodal, comparando con `google/gemma-4-12B-it` como referencia.
- Estudio de deriva de comportamiento (alignment drift): con nombres de serie como "equanimity" y "trust", encaja en experimentos que miden cómo cambian los sesgos y el tono del modelo tras ajuste adicional.
- Auditar la calidad de corpus autogenerados: si el patrón de los repositorios hermanos se mantiene, permite evaluar si entrenar sobre texto producido por el propio modelo degrada o no tareas downstream.
- Punto de partida para ajuste supervisado específico: al ser pesos completos en safetensors, se puede cargar con Transformers y aplicar SFT o LoRA sobre dominios concretos, aceptando el riesgo de una base no validada.
- Docencia y formación técnica: útil para ilustrar en clase el ciclo de vida de un checkpoint de investigación y las diferencias entre un modelo base y sus derivados.
- Referencia negativa en evaluaciones: sirve como control en suites de evaluación internas para medir cuánto aporta (o resta) el preentrenamiento continuado frente al modelo original de Google.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún flujo con usuarios finales, dado que no hay model card, licencia declarada ni evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye model card y los resultados de búsqueda no aportan métricas (MMLU, HumanEval, GSM8K u otras) para este checkpoint ni para sus repositorios hermanos.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del número de parámetros (≈12B) y del tamaño del repositorio (24,0 GB en BF16); no proceden de documentación del autor.

- VRAM para inferencia en BF16: aproximadamente 24 GB solo para pesos, más 2-6 GB de caché KV y activaciones según longitud de contexto, es decir, del orden de 26-32 GB en total.
- VRAM en FP8/INT8: aproximadamente 12 GB de pesos, con un total estimado de 14-18 GB.
- VRAM en 4 bits (Q4_K_M, AWQ o GPTQ, previa conversión): aproximadamente 7-8 GB de pesos, con un total estimado de 9-12 GB.
- GPU recomendadas: A100 40GB u 80GB, H100, L40S 48GB y A6000 48GB para BF16 sin restricciones. Una RTX 4090 o RTX 3090 de 24 GB solo admite BF16 con secuencias cortas y batch pequeño; en cuantización de 4 bits caben con holgura.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090, RTX 4080 y equivalentes siempre que se cuantice a 8 o 4 bits. También es viable en equipos Apple con memoria unificada de 32 GB o más.
- Opciones de despliegue: Transformers (carga directa de safetensors), vLLM y TGI para servido de alto rendimiento, llama.cpp u Ollama tras convertir los pesos a GGUF. No hay versiones GGUF publicadas por el autor.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/fd-gemma-4-12b-equanimity_trust-s1` | 11,96B | No disponible | No disponible | Safetensors BF16 | 12 descargas, 0 likes, sin model card |
| `google/gemma-4-12B-it` (modelo base) | ≈12B | No disponible en la información recogida | No disponible en la información recogida | No disponible | Modelo oficial de Google DeepMind |
| `joshycodes/fd-gemma-4-12b-trust` | ≈12B | No disponible | No disponible | Safetensors BF16, con plantilla de chat | Repositorio hermano, sin model card ni proveedor de inferencia |
| `joshycodes/gemma-4-12b-it-fve-workdiscern-s0` | ≈12B | No disponible | No disponible | Safetensors | Repositorio hermano, checkpoint de investigación documentado de forma parcial |
| Familia Gemma 4 (2,3B a 31B) | 2,3B-31B | No disponible | No disponible | No disponible | Variantes densas y MoE según el informe técnico |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación de entrenamiento, datos, evaluación ni uso previsto para este checkpoint concreto.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Al derivar de un modelo de Google, es previsible que apliquen los términos de la licencia Gemma, pero esto no está verificado en el repositorio.
- Riesgo elevado de regresión de capacidades: un preentrenamiento continuado con learning rate de 1e-05 y una única época sobre un corpus pequeño (del orden de 7,7 millones de tokens en los repositorios hermanos) puede degradar el alineamiento original del modelo base.
- Sesgos desconocidos: no se ha realizado ninguna evaluación de sesgos ni de toxicidad sobre este checkpoint.
- Alucinación: sin datos de evaluación, no se puede acotar la tasa de alucinación; se debe asumir un riesgo alto en producción.
- Idiomas: no se declara lista de idiomas soportados; el comportamiento multilingüe es una incógnita.
- Multimodalidad incierta: aunque la familia Gemma 4 es nativa en visión y audio, no hay confirmación de que este ajuste sobre texto preserve esas capacidades.
- Trazabilidad limitada: 12 descargas y 0 likes, sin proveedores de inferencia asociados, lo que dificulta encontrar reportes de terceros sobre su comportamiento real.
- No apto para producción: sin evals, sin licencia clara y sin mantenimiento, su uso debe restringirse a entornos de investigación controlados.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/joshycodes/fd-gemma-4-12b-equanimity_trust-s1
- Repositorio hermano `fd-gemma-4-12b-trust`: https://huggingface.co/joshycodes/fd-gemma-4-12b-trust
- Repositorio hermano `gemma-4-12b-it-fve-workdiscern-s0`: https://huggingface.co/joshycodes/gemma-4-12b-it-fve-workdiscern-s0
- Página de la familia Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Informe técnico de Gemma 4 (arXiv): https://arxiv.org/html/2607.02770v1
