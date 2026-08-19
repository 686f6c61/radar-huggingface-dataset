# Sherpa/Mistral-Large-3-675B-Instruct-2512-OBLITERATED-V2-FP8

## Resumen

El modelo `Sherpa/Mistral-Large-3-675B-Instruct-2512-OBLITERATED-V2-FP8` es un derivado del checkpoint oficial `mistralai/Mistral-Large-3-675B-Instruct-2512`, desarrollado por el operador Sherpa con fines de investigación de seguridad autorizada. Aplica la técnica de *abliteration* (eliminación selectiva de la negativa a responder) sobre el modelo base, manteniendo el formato nativo FP8 de compressed-tensors. El nombre sugiere una arquitectura de 675 mil millones de parámetros, aunque este dato no se confirma explícitamente en la documentación disponible.

La relevancia de este modelo radica en que permite estudiar el comportamiento de un LLM de gran escala cuando se eliminan parcialmente sus mecanismos de rechazo, lo que resulta útil para evaluar riesgos de seguridad, sesgos y alineación. Sin embargo, su uso está restringido a entornos de investigación controlados y no es apto para despliegue en producción sin salvaguardas adicionales. El repositorio incluye un directorio `audit/` con informes agregados, hashes inmutables y el manifiesto de candidatos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Mistral Large 3) |
| Parametros totales | 675B (según denominación del modelo, no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un *fine-tuning* derivado de `mistralai/Mistral-Large-3-675B-Instruct-2512` en la revisión inmutable `383ffea2c7d60dfd44ca960e8e691709d4fdb9cd`. La intervención de abliteration se aplica únicamente a las capas 43 a 58 (seleccionadas como `top_16_stable_layers`) con una fuerza de 0.6, modificando exclusivamente las proyecciones de salida de atención y las proyecciones *down* de los expertos enrutados. Los routers, embeddings, proyecciones Q/K/V, proyecciones de entrada/up/gate y el experto compartido permanecen intactos.

El estimador de rechazo se construyó con 1.024 ejemplos dañinos y 1.024 inofensivos, restando las medias independientes de cada clase en el token final tras la plantilla de prompt. No se proporcionan datos sobre el entrenamiento original del modelo base ni sobre el proceso de ajuste fino más allá de la intervención mencionada.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo instruct de gran escala, se espera que mantenga las capacidades generales del modelo base, aunque no se detallan explícitamente en la documentación.
- Comportamiento de rechazo modificado: la abliteration reduce la probabilidad de negarse a responder solicitudes potencialmente dañinas, como se refleja en las métricas de HarmBench y OR-Bench-Hard.
- Compatibilidad con vLLM: el modelo está diseñado para servirse con vLLM utilizando el tokenizador y formato de configuración de Mistral.
- No se mencionan capacidades específicas de tool calling, agentes, visión o audio.

## Casos de uso

- Investigación de seguridad y alineación: permite analizar cómo responde un LLM de 675B cuando se eliminan parcialmente los mecanismos de rechazo, útil para estudiar riesgos de uso malintencionado y desarrollar contramedidas.
- Evaluación de robustez frente a prompts dañinos: los resultados de HarmBench y StrongREJECT proporcionan métricas cuantitativas sobre la tasa de éxito de ataques, lo que sirve para calibrar sistemas de moderación.
- Desarrollo de técnicas de *abliteration*: sirve como caso de estudio para comparar la efectividad de diferentes intervenciones sobre capas y proyecciones específicas.
- Benchmarking de seguridad en entornos controlados: puede emplearse en laboratorios que necesiten medir el impacto de la eliminación de rechazos en la capacidad general del modelo.
- Análisis de sesgos y comportamiento indeseado: al reducir la negativa, se pueden observar respuestas que normalmente estarían bloqueadas, facilitando la identificación de sesgos latentes.
- Pruebas de detección de contenido dañino: los resultados de OR-Bench-Hard y XSTest ayudan a validar clasificadores de seguridad como WildGuard.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa entre el modelo base y el candidato 3 (este modelo) sobre 6.938 prompts, con intervalos de confianza calculados mediante 10.000 muestras bootstrap pareadas. No se proporcionan benchmarks estándar como MMLU, HumanEval o GSM8K.

| Medida | Base | Candidato 3 | Delta | IC 95% |
|---|---:|---:|---:|---:|
| HarmBench attack success | 29.50% | 33.75% | +4.25% | [1.25%, 7.50%] |
| StrongREJECT score | 3.54% | 5.52% | +1.97% | [0.97%, 3.08%] |
| OR-Bench-Hard compliance | 80.36% | 86.66% | +6.29% | [4.70%, 7.88%] |
| XSTest safe-prompt compliance | 94.80% | 96.40% | +1.60% | [0.40%, 3.20%] |
| Capacidad agregada | 73.45% | 73.90% | +0.45% | [-0.07%, 0.96%] |

## Requisitos de hardware

- Tamaño del repositorio: 681.5 GB en formato FP8.
- GPU recomendadas: nodo de 8 GPUs clase H200 o B200, según la documentación.
- Inferencia: se sirve con vLLM usando `--tensor-parallel-size 8`, `--tokenizer-mode mistral`, `--config-format mistral` y `--load-format mistral`.
- No se especifican requisitos de VRAM exactos, pero un modelo de 675B en FP8 requiere aproximadamente 675 GB de memoria, por lo que se necesitan GPUs con alta capacidad (80 GB o más por GPU).
- No se mencionan opciones de despliegue alternativas como llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo base `mistralai/Mistral-Large-3-675B-Instruct-2512` es la referencia directa, pero no se ofrecen datos sobre alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteration debilita intencionalmente el comportamiento de rechazo del modelo, lo que incrementa el riesgo de generar contenido dañino, ilegal o poco ético.
- No se garantiza la precisión factual ni el cumplimiento irrestricto de solicitudes; el modelo puede producir alucinaciones o respuestas incorrectas.
- El uso está restringido a investigación de seguridad autorizada; no es apto para despliegue en producción sin salvaguardas independientes.
- Los prompts dañinos y las salidas objetivo no se publican; solo se ofrecen informes agregados en el directorio `audit/`.
- No se proporcionan datos sobre sesgos específicos, limitaciones de idioma o comportamiento en dominios concretos.
- La licencia Apache 2.0 permite uso comercial, pero las advertencias de seguridad limitan su aplicabilidad práctica.

## Enlaces

- [HuggingFace: Sherpa/Mistral-Large-3-675B-Instruct-2512-OBLITERATED-V2-FP8](https://huggingface.co/Sherpa/Mistral-Large-3-675B-Instruct-2512-OBLITERATED-V2-FP8)
- [Modelo base: mistralai/Mistral-Large-3-675B-Instruct-2512](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512)
