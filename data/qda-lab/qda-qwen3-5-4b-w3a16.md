# qda-lab/QDA-Qwen3.5-4B-W3A16

## Resumen

QDA-Qwen3.5-4B-W3A16 es un checkpoint cuantizado del modelo Qwen/Qwen3.5-4B, publicado por el autor qda-lab bajo licencia Apache 2.0. Se trata de una cuantización de solo pesos (weight-only) en la que las activaciones permanecen en 16 bits mientras los pesos se comprimen a 3 y 4 bits enteros simétricos en grupos de 128. El resultado se almacena en el formato compressed-tensors, lo que permite cargarlo con las herramientas estándar de Hugging Face compatibles con dicha librería.

El modelo hereda la arquitectura, el tamaño y las capacidades del Qwen3.5-4B original: un transformer de aproximadamente 4.660 millones de parámetros, orientado a generación de texto y conversación. La cuantización reduce el peso del repositorio hasta unos 3,7 GB, lo que facilita el despliegue en entornos con menos memoria que el modelo en precisión completa.

Es relevante ahora porque el autor lo marca explícitamente como pre-release: la evaluación está pendiente y la versión completa con resultados de benchmarks está prevista para el 20 de noviembre de 2026. Por tanto, cualquier uso en producción debe considerar que aún no hay métricas publicadas que validen la degradación introducida por la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos enteros de 3 bits y de 4 bits, simétricos, en grupos de 128; activaciones en 16 bits (W3A16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

La ficha del autor no describe la arquitectura interna más allá de la referencia al modelo base Qwen/Qwen3.5-4B. Se trata, por tanto, de un transformer de aproximadamente 4,66 mil millones de parámetros cuyo diseño, datos de entrenamiento, composición del corpus y procesos de alineación (RLHF, DPO u otros) no se detallan en la información disponible. Tampoco se especifican innovaciones técnicas del modelo original, como mecanismos de atención o estrategias de decodificación.

La contribución propia de este checkpoint es la cuantización de solo pesos: los pesos se representan como enteros simétricos de 3 bits y de 4 bits agrupados en bloques de 128, mientras que las activaciones se mantienen en 16 bits. El resultado se serializa en el formato compressed-tensors, que permite almacenar y cargar los pesos comprimidos sin necesidad de recalcular la cuantización en cada carga. No se han publicado detalles sobre el proceso de calibración, el conjunto de datos usado para determinar los rangos de cuantización ni el impacto medido en la perplejidad o en tareas downstream.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-4B.
- Razonamiento y respuesta a instrucciones, en la medida en que lo soporte el modelo original (no verificado tras la cuantización).
- Generación de código y matemáticas: capacidad presumible del modelo base, sin métricas publicadas para este checkpoint.
- Tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Despliegue en GPUs de consumo: al ocupar unos 3,7 GB en el repositorio, el checkpoint puede cargarse en tarjetas con 8 GB o más de VRAM, lo que permite probar el modelo Qwen3.5-4B en equipos de gama media sin recurrir al modelo completo en 16 bits.
- Prototipado rápido de asistentes conversacionales: útil para validar flujos de diálogo y prompts antes de pasar a una versión evaluada o a mayor precisión.
- Generación de texto en local para entornos con recursos limitados: la cuantización de solo pesos reduce el ancho de banda de memoria respecto a los pesos en 16 bits, lo que puede mejorar la latencia en inferencia con poca memoria disponible.
- Evaluación comparativa de técnicas de cuantización: investigadores pueden usar este checkpoint como referencia para medir la degradación de W3A16 frente al modelo base, especialmente cuando se publique la evaluación prevista.
- Integración en pipelines de Hugging Face con compressed-tensors: adecuado para equipos que ya usan esta librería y quieren incorporar un modelo de 4B cuantizado sin cambiar su infraestructura.
- Experimentación académica con modelos de ~4B: permite ejecutar pruebas de razonamiento y generación en hardware modesto, aunque con la cautela de que no hay métricas de calidad publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación está pendiente y que la versión completa, con resultados, está prevista para el 20 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4-5 GB para los pesos cuantizados, más el overhead de activaciones en 16 bits y la caché KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090, así como en A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: al usar compressed-tensors, es compatible con librerías de Hugging Face que soporten dicho formato (por ejemplo, vLLM y TGI, sujeto a verificación); no se confirma soporte de llama.cpp u Ollama, que requieren formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| QDA-Qwen3.5-4B-W3A16 | 4.659.865.088 | no disponible | W3A16 (3/4 bits, grupos de 128) | Apache 2.0 | Pre-release, sin evaluacion |
| Qwen/Qwen3.5-4B (base) | ~4,66 mil millones | no disponible | 16 bits | Apache 2.0 | Modelo original de referencia |
| Alternativas de ~4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite comparar con alternativas concretas de la misma categoría más allá del modelo base. No se han publicado métricas de rendimiento de este checkpoint.

## Limitaciones y advertencias

- Modelo en estado pre-release: la evaluación está pendiente y los resultados no se publicarán hasta el 20 de noviembre de 2026; no hay garantía de calidad tras la cuantización.
- La cuantización a 3 y 4 bits puede degradar la precisión en tareas sensibles, como matemáticas o código, sin que existan métricas que cuantifiquen esa pérdida.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base, que tampoco se detallan.
- Riesgo de alucinación: no evaluado para este checkpoint; se desconoce el impacto de la cuantización en la fidelidad factual.
- Idiomas soportados: no declarados, lo que impide garantizar un rendimiento multilingüe concreto.
- Longitud de contexto: no disponible, lo que limita la planificación de despliegues con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el checkpoint deriva de un modelo base cuyos términos conviene revisar en el repositorio original.
- Compatibilidad: al estar en formato compressed-tensors, no es directamente utilizable en runtimes que solo aceptan GGUF u otros formatos; requiere herramientas compatibles.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-4B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería compressed-tensors: no se proporciona enlace en la información disponible.
- Paper, blog o demo: no disponibles.
