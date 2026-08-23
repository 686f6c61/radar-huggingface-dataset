# kingjones777/Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.8-27B, preparada específicamente para hardware AMD Strix Halo (iGPU Radeon 8060S, gfx1151) y el runtime ROCm 7.2.4. El autor, kingjones777, aplica un proceso de abliteration sobre los pesos originales para eliminar los rechazos de contenido (refusals), manteniendo intactas las capacidades del modelo base. El resultado es una variante "uncensored" pensada como artefacto de investigación, no como producto de producción.

El modelo destaca por integrar soporte de decodificación especulativa MTP (multi-token prediction) con un drafter head separado, lo que permite alcanzar velocidades de inferencia notablemente superiores a las de una ejecución sin especulación. Según las pruebas publicadas, el punto óptimo de rendimiento se sitúa en `--spec-draft-n-max 4`, y las cuantizaciones ROCmFP4 (ftype 103 y 106) logran entre 23 y 25 tok/s en prosa y hasta 42 tok/s en código sobre la iGPU del Strix Halo. La licencia Apache 2.0 facilita su uso en investigación y despliegues internos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B, con MTP) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65536 tokens (configuración de ejemplo en llama-server) |
| Tipos de cuantizacion | ROCmFP4 (ftype 103 FAST, 106 STRIX_LEAN), Q6_0 ROCmFPX (ftype 114 AGENT, 116 LEAN) |
| Idiomas soportados | no disponible (heredado de Qwen3.8-27B, probablemente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores ROCmFP4 y Q6) |

## Arquitectura y entrenamiento

El modelo es una cuantización de Qwen3.8-27B, un transformer denso con arquitectura similar a la serie Qwen3, que incluye atención multi-cabeza y capas de predicción multi-token (MTP). La variante uncensored se obtiene aplicando abliteration a los pesos BF16 del modelo original, un proceso que elimina los patrones de rechazo de contenido sin modificar la capacidad de generación. No se ha realizado entrenamiento adicional: el autor parte del checkpoint BF16 y lo cuantiza con su pipeline ROCmFPX, optimizado para la iGPU gfx1151.

La innovación técnica principal es la integración de un drafter head MTP separado (`mtp-Qwen3.8-27B-Q4_0.gguf`) que permite decodificación especulativa en llama.cpp. El modelo expone `nextn_predict_layers = 1` como cabecera de borrador externa, y el autor determinó que el número óptimo de tokens especulativos es 4, donde la tasa de aceptación alcanza 0.926. El pipeline de cuantización usa ROCmFPX, un formato adaptado a la arquitectura RDNA 3.5 que mejora la eficiencia de memoria y velocidad en comparación con FP16 o Q8.

## Capacidades

- Generación de texto y razonamiento: el modelo conserva las capacidades del Qwen3.8-27B original, incluyendo razonamiento de múltiples pasos y generación de texto creativo.
- Generación de código: alto rendimiento en tareas de programación (42 tok/s en pruebas de código con MTP).
- Soporte de tool calling y function calling: heredado del modelo base, disponible en el formato GGUF con chat template.
- Capacidades de agente: puede integrarse en flujos multi-paso con el modo de razonamiento activado (`enable_thinking` o `reasoning_effort`).
- Multilingüismo: no especificado en la ficha, pero el modelo base Qwen3.8-27B es multilingüe (cubre inglés, chino y otros idiomas).
- Capacidad de vision: se incluye el proyector de vision (`mmproj-Qwen3.8-27B-Q8_0.gguf`) para entrada de imágenes, aunque el modelo base es texto-imagen.
- Decodificación especulativa: MTP con drafter head, que acelera la inferencia hasta un 50% frente a la generación sin especulación.
- Sin rechazos de contenido: la abliteration elimina la mayoría de los rechazos en el conjunto de pruebas de seguridad (24 casos dañinos, 23 cumplen).

## Casos de uso

- **Investigación en seguridad y sesgos**: el modelo permite estudiar cómo se comporta un LLM sin capas de rechazo, útil para analizar el impacto de la alineación en el rendimiento y para desarrollar técnicas de moderación más robustas. Se puede ejecutar localmente con llama.cpp y comparar con el modelo alineado.
- **Generación de código en entornos con restricciones de hardware**: gracias a las cuantizaciones ROCm4 y la optimización para AMD Strix Halo, el modelo puede ejecutarse en equipos portátiles con iGPU Radeon 8060S, ofreciendo asistencia de programación en tiempo real con latencia baja (42 tok/s en código).
- **Prototipado de agentes conversacionales**: con soporte de tool calling y el modo de razonamiento, se puede construir un agente que interactúe con APIs y ejecute tareas de múltiples pasos, aunque debe limitarse a entornos controlados por el riesgo de salidas no moderadas.
- **Generación de texto creativo y narrativo**: la ausencia de rechazos permite explorar temas sensibles o de ficción sin restricciones automáticas, útil para escritores que necesitan un generador flexible.
- **Análisis de datos y generación de informes**: el modelo puede procesar documentos largos (hasta 65K tokens) y resumir o extraer información, aunque la abliteration puede producir respuestas inesperadas en dominios sensibles.
- **Despliegue en edge con ROCm**: la integración con ROCm 7.2.4 y la optimización para gfx1151 permite ejecutar el modelo en dispositivos AMD de bajo consumo, como servidores edge o estaciones de trabajo, con velocidad de generación aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye datos de rendimiento de inferencia y de comportamiento de rechazo:

**Velocidad de decodificación (llama-server, ROCm 7.2.4, Ryzen AI Max+ 395, ctx 8192, batch 1, temp 0, thinking off)**

| Build | ftype | Tamaño | prosa tok/s | código tok/s |
|---|---|---|---|---|
| Unc FAST | 103 | 13,33 GiB | 23,08 | 42,80 |
| Unc STRIX_LEAN | 106 | 13,59 GiB | 24,73 | 42,70 |
| Unc Q6 AGENT | 114 | 23,15 GiB | — | ~23 (sin MTP) |
| Unc Q6 LEAN | 116 | 20,37 GiB | — | ~10 sin MTP / ~28 con MTP |
| Alineado STRIX (publicado) | 105 | 13,75 GiB | — | 30,30 (MTP n=4) |
| Alineado STRIX_LEAN (publicado) | 106 | 13,59 GiB | — | 13,46 sin MTP |

**Pruebas de rechazo de contenido (conjunto de 24 dañinas / 12 inofensivas / 8 de calidad, greedy)**

| Modelo | Dañinas (24) | Inofensivas (12) | Calidad (8) |
|---|---|---|---|
| Qwen3.8 alineado Q8 AGENT | 23 rechaza, 1 cumple | 11/12 ok | 6/8 |
| Qwen3.8 uncensored Q6 AGENT (114) | 23 cumple, 1 roto | 11/12 ok | 6/8 |
| Muse alineado Q6 AGENT (114) | 18 rechaza, 6 cumple | 11/12 ok | 7/8 |
| Muse uncensored STRIX_LEAN (106) | 24 cumple | 12/12 ok | 7/8 |

La calidad de generación es idéntica entre la variante alineada y la uncensored (6/8 en ambos casos), lo que indica que la abliteration no degrada las capacidades generales.

## Requisitos de hardware

- **GPU objetivo**: AMD iGPU Radeon 8060S (gfx1151) integrada en el Ryzen AI Max+ 395, con 128 GB de memoria unificada. Es el hardware de referencia para las pruebas.
- **VRAM estimada**: los archivos GGUF requieren entre 13,3 GiB (ftype 103) y 23,2 GiB (ftype 114) de memoria para la inferencia completa. Con `-ngl 999` se carga todas las capas en la GPU/iGPU.
- **GPU recomendadas**: AMD Strix Halo (gfx1151), aunque el modelo puede ejecutarse en otras GPUs AMD con ROCm 7.2.4 y en GPUs NVIDIA con CUDA (formato GGUF estándar).
- **Consumer GPU**: sí, cabe en GPUs de 16 GB VRAM (por ejemplo, RTX 4080/4090, RX 7900 XTX) con cuantización 4-bit (13,3-13,6 GiB). Para Q6 se necesitan al menos 24 GB.
- **Opciones de despliegue**: llama.cpp (llama-server, llama-cli), Ollama (con modelfile), vLLM (con adaptaciones ROCm), y cualquier servidor compatible con GGUF.
- **Latencia y throughput**: con MTP n=4, el modelo alcanza 24-25 tok/s en prosa y 42 tok/s en código en el hardware de referencia. Sin MTP, la velocidad se reduce a ~13-14 tok/s en prosa (según el modelo alineado).

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantizaciones | Licencia | MTP | Velocidad (Strix Halo) | Refusals |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B (alineado) | 26,9B | 65536 | ROCmFP4, Q6 | Apache 2.0 | Sí (30,3 tok/s) | 23-25 tok/s | 23/24 rechaza |
| Qwen3.8-27B-Uncensored (este) | 26,9B | 65536 | ROCmFP4, Q6 | Apache 2.0 | Sí (42 tok/s código) | 24,7 tok/s prosa | 1/24 rechaza |
| Muse (alineado) | no disp. | no disp. | Q6 | Apache 2.0 | No | no disp. | 18/24 rechaza |
| Muse (uncensored) | no disp. | no disp. | ROCmFP4 | Apache 2.0 | No | no disp. | 0/24 rechaza |

La diferencia principal con el modelo alineado es la eliminación de rechazos de contenido: mientras que el alineado rechaza 23 de 24 peticiones dañinas, la variante uncensored cumple 23 de 24. La velocidad de inferencia es similar entre ambas, aunque la variante alineada publica un valor más alto (30,3 tok/s) en el mismo hardware, lo que sugiere que la abliteration puede tener un coste mínimo en rendimiento.

## Limitaciones y advertencias

- **Artefacto de investigación**: el autor declara explícitamente que el modelo no debe usarse como producto por defecto. La abliteration elimina los rechazos de contenido, lo que puede generar respuestas inapropiadas, ilegales o dañinas si se despliega sin moderación adicional.
- **Riesgo de alucinación**: el modelo hereda la tendencia del Qwen3.8-27B a alucinar hechos, especialmente en contextos largos. La ausencia de rechazos puede amplificar la confianza en respuestas incorrectas.
- **Sesgos**: no se han publicado evaluaciones de sesgo específicas para esta variante. El modelo base Qwen3.8-27B puede presentar sesgos culturales o de género, y la abliteration no los corrige.
- **Limitaciones de idioma**: aunque el modelo base es multilingüe, la ficha no especifica los idiomas soportados. El rendimiento en lenguas distintas del inglés o chino puede ser inferior.
- **Restricciones de uso**: la licencia Apache 2.0 permite uso comercial, pero el autor recomienda no desplegarlo en producción sin un sistema de moderación externo. El uso en aplicaciones públicas puede violar políticas de contenido de plataformas.
- **Dependencia de hardware**: el formato ROCmFP4 está optimizado para gfx1151 y ROCm 7.2.4; en otras plataformas (NVIDIA, Intel) el rendimiento puede degradarse o requerir conversión a cuantizaciones estándar (Q4_K_M, Q5_K_M).
- **Comportamiento de MTP**: la decodificación especulativa requiere el drafter head Q4_0; usar Q8_0 o configuraciones con `--spec-draft-n-max` superiores a 4 puede reducir la velocidad en lugar de mejorarla.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kingjones777/Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF)
- [Modelo alineado (sin abliteration)](https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub "Qwen 3.8 27B Uncensored"](https://github.com/Wassimyounes01/qwen38-uncensored)
- [Blog de orcarouter: cómo ejecutar localmente](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
