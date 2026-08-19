# FINAL-Bench/Armoring-Qwen3.5-2B

## Resumen

Armoring-Qwen3.5-2B es un prototipo de investigación desarrollado por VIDRAFT / FINAL-Bench que aplica una técnica propietaria denominada "Attention Armoring" sobre el modelo base Qwen/Qwen3.5-2B. El objetivo es reducir el consumo de memoria del KV cache durante la generación de contexto largo, manteniendo el comportamiento básico del modelo. Se trata de un repositorio "card-first": no incluye pesos completos, código de transformación ni procedimiento de entrenamiento, solo una ficha técnica con resultados de validación.

El modelo se presenta como una validación a pequeña escala (2B de parámetros) de una intervención de eficiencia en la atención. En las pruebas documentadas, se logra una reducción del 23,5% en el footprint de KV cache para secuencias de 8k tokens, con una pérdida de perplejidad de solo 1,005x respecto al modelo de referencia. La licencia es Apache-2.0, pero los detalles de implementación permanecen privados.

Este prototipo no pretende ser un modelo de producción ni una mejora de capacidades generales; su valor reside en demostrar que la técnica de armoring puede aplicarse a todos los bloques de atención de un modelo compacto sin degradar significativamente la salida, abriendo la puerta a futuras optimizaciones para despliegues de largo contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-2B) |
| Parametros totales | 2B (no se especifica el número exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (pruebas realizadas a 8k tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según metadata) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio sin pesos) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer de 2.000 millones de parámetros. La intervención "Attention Armoring" modifica la ruta de estados de atención dentro de los bloques elegibles, manteniendo la interfaz pública del modelo intacta. No se proporcionan detalles del procedimiento interno (es propietario), pero el efecto medido es una reducción del KV cache en escenarios de contexto largo.

No se documenta ningún entrenamiento adicional, ajuste fino o uso de RLHF/DPO. La técnica parece ser una modificación arquitectónica o de compresión aplicada directamente sobre los pesos existentes, aunque el método exacto no se revela. Las pruebas de validación incluyen mediciones de perplejidad, sondas de terminación (EOS) y de formato de respuesta.

## Capacidades

- Generación de texto estándar del modelo base Qwen3.5-2B (no se documentan mejoras).
- Preservación del comportamiento de terminación (EOS probe 5/5) y formato de respuesta (format probe 15/15).
- Reducción del footprint de KV cache en un 23,5% para secuencias de 8k tokens, lo que permite aumentar la capacidad de sesiones concurrentes en un 1,31x con la misma memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento avanzado, visión, audio ni multilingüismo más allá del inglés.
- La model card advierte que no se reclama mejora de capacidades sobre el modelo base.

## Casos de uso

- Validación de técnicas de eficiencia de atención: el modelo sirve como banco de pruebas para evaluar el impacto de "Attention Armoring" en un modelo pequeño antes de escalar a versiones mayores.
- Investigación en optimización de KV cache: permite estudiar el equilibrio entre reducción de memoria y degradación de calidad (PPL) en contextos largos.
- Prototipado de despliegues de largo contexto: en escenarios donde se necesitan muchas sesiones concurrentes con ventanas de 8k tokens, la reducción de cache podría traducirse en mayor densidad de usuarios por GPU.
- Evaluación de comportamiento básico: las sondas de EOS y formato permiten verificar que la intervención no rompe la generación estándar.
- Comparación de métricas de eficiencia: se pueden contrastar los resultados (PPL, ratio, reducción de cache) con otras técnicas de compresión de atención.
- Desarrollo de futuras versiones: los resultados de este prototipo informan decisiones sobre si aplicar la técnica a modelos más grandes o en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos proporcionados son mediciones específicas de la validación del prototipo:

| Medición | Resultado |
|---|---|
| Perplejidad de frase (PPL) | 9.016 |
| PPL de referencia | ~8.97 |
| Ratio PPL | ~1.005x |
| Sonda EOS | 5 / 5 |
| Sonda de formato | 15 / 15 |
| KV cache por secuencia (8k) | 96.0 MiB -> 73.4 MiB |
| Reducción de KV cache | 23.5% |
| Capacidad estimada en 80 GiB | 773 -> 1,010 sesiones |
| Multiplicador de capacidad | 1.31x |

Estos resultados son de carácter direccional y no se utilizan para afirmar una mejora de ranking del modelo.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni GPU en la documentación.
- Al ser un modelo de 2B parámetros, es plausible que quepa en GPUs consumer (p.ej. RTX 3060 12GB, RTX 4090) con cuantización, pero no hay datos confirmados.
- La model card menciona una capacidad de cache de 80 GiB para estimar sesiones concurrentes, lo que sugiere un escenario de servidor con memoria unificada o múltiples GPUs.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia/throughput.
- La reducción de KV cache implica que, en contextos largos, se puede atender a más usuarios por GPU, pero la velocidad por usuario puede ser menor en contextos cortos (según la nota operativa).

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. La única referencia es el modelo base Qwen/Qwen3.5-2B, del cual se deriva. Se puede establecer la siguiente comparación cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B (base) | 2B | no disponible | Apache-2.0 | Modelo original sin modificar |
| Armoring-Qwen3.5-2B | 2B | no disponible (prueba a 8k) | Apache-2.0 | Prototipo con reducción de KV cache |

No se incluyen otros modelos comparables por falta de datos.

## Limitaciones y advertencias

- No se reclama mejora de capacidades sobre el modelo base; es una intervención de eficiencia, no de calidad.
- No es apto para producción: la model card lo declara explícitamente como prototipo de validación.
- No hay cobertura de seguridad, razonamiento, coding, multilingüismo, tool-use ni multimodalidad.
- En contextos cortos, el throughput neto puede ser inferior al modelo original; los beneficios solo emergen en cargas de trabajo de contexto largo.
- El procedimiento de "Attention Armoring" es propietario y no se divulga, lo que limita la reproducibilidad.
- El repositorio no contiene pesos ni artefactos de implementación, solo la ficha técnica.
- La perplejidad medida (9.016) es ligeramente superior a la referencia (8.97), indicando una pequeña pérdida de calidad lingüística.
- En prompts técnicos de opción múltiple, el modelo puede preferir explicaciones largas en lugar de respuestas de una sola letra, un comportamiento a tener en cuenta.

## Enlaces

- [Repositorio HuggingFace: FINAL-Bench/Armoring-Qwen3.5-2B](https://huggingface.co/FINAL-Bench/Armoring-Qwen3.5-2B)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
