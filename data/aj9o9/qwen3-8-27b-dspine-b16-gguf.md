# aj9o9/Qwen3.8-27B-DSpine-b16-GGUF

## Resumen

DSpine-b16 es un modelo borrador (*draft model*) especializado en decodificación especulativa, diseñado para acelerar la inferencia de Qwen3.8-27B. Lo desarrolla el usuario aj9o9 a partir del modelo original de Tencent `tencent/Qwen3.8-27B-DSpine-b16`, y se distribuye en formato GGUF para su uso con llama.cpp. No es un modelo conversacional autónomo: es un componente auxiliar que propone bloques de 16 tokens que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado.

La arquitectura DSpine extiende DFlash: cinco capas que leen estados ocultos de cinco capas del modelo objetivo y generan un bloque de 16 tokens de forma paralela, incorporando atención causal de bloque, un puente de código tras cada capa y un refinamiento serial de última escritura que construye una tabla de transición 16x16 por posición. El resultado es un incremento de velocidad de hasta 3,2x en tareas mixtas y hasta 4,5x en código y matemáticas sobre una RTX 3090, comparado con inferencia sin especulación.

El modelo tiene 2.025.387.776 parámetros (aproximadamente 2,03 mil millones), licencia Apache 2.0 y se publica bajo el identificador `aj9o9/Qwen3.8-27B-DSpine-b16-GGUF`. Su relevancia actual radica en que permite acelerar un modelo de 27B en GPUs de consumo de 24 GB sin sacrificar la calidad del objetivo, aunque requiere un fork específico de llama.cpp que aún no está fusionado en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpine (extensión de DFlash): 5 capas, draft model con atención causal de bloque, code bridge y refinamiento serial last-write |
| Parametros totales | 2.025.387.776 (~2,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como modelo autónomo; en uso conjunto con el objetivo permite hasta `-c 65536` en 24 GB con Q4_K_M y n-max 15, y hasta `-c 98304` con n-max 7 |
| Tipos de cuantizacion | Q4_K_M (1,26 GB), Q8_0 (2,20 GB), BF16 (4,06 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

DSpine es un modelo borrador de cinco capas que extiende la arquitectura DFlash. Lee los estados ocultos de cinco capas del modelo objetivo (Qwen3.8-27B) y genera en paralelo un bloque de 16 tokens candidatos. Sobre DFlash añade tres mecanismos: atención causal de bloque (cada posición del borrador atiende solo a posiciones anteriores dentro de su bloque), un puente de código tras cada capa (cada posición recibe un mensaje con compuerta construido a partir del código del token predicho por su predecesor, propagando dependencias causales a través de la profundidad de la red) y un refinamiento serial de última escritura que, para los 16 candidatos principales de cada posición, rehace la última escritura del puente usando el código exacto del predecesor candidato, generando una tabla de transición 16x16 por posición.

El decodificador especulativo recorre esa tabla desde el último token aceptado para elegir la cadena de borrador, de forma voraz o por muestreo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El modelo base es `tencent/Qwen3.8-27B-DSpine-b16`, y esta publicación es una conversión a GGUF del mismo.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre Qwen3.8-27B: propone bloques de 16 tokens que el modelo objetivo verifica en paralelo.
- Aceleración de inferencia en código y matemáticas: hasta ~125 tok/s en una RTX 3090 con objetivo Q4_K_M, frente a ~28 tok/s sin especulación (hasta 4,5x).
- Aceleración en tareas mixtas de chat: ~90 tok/s en la misma configuración, 3,2x sobre sin especulación.
- Compatibilidad con muestreo probabilístico de la cadena de borrador mediante `--spec-draft-sampling probabilistic`, útil a temperatura mayor que cero.
- Integración con llama.cpp mediante el fork `dspine` (rama `dspine` de Ajay9o9/llama.cpp), con soporte de `llama-server` y flags específicos (`--spec-type draft-dflash`, `--spec-draft-n-max`, `--spec-draft-ngl`).
- No es un modelo conversacional autónomo: no genera respuestas finales por sí mismo, sino candidatos que el objetivo valida.
- Soporte multilingüe: no disponible (depende del modelo objetivo Qwen3.8-27B).

## Casos de uso

- Aceleración de servidores de código en producción: desplegar `llama-server` con Qwen3.8-27B como objetivo y DSpine como borrador permite alcanzar ~125 tok/s en una RTX 3090, lo que reduce la latencia percibida en asistentes de autocompletado y generación de código en IDE.
- Asistentes de matemáticas y razonamiento paso a paso: el borrador mantiene alta tasa de aceptación en dominios estructurados (hasta 4,5x en código y matemáticas), adecuado para pipelines que generan cadenas de razonamiento largas donde el coste por token es crítico.
- Chat multi-turno con contexto largo en GPU de consumo: con `-c 65536` en 24 GB y KV cache q8_0, se puede mantener una conversación extensa con latencia reducida respecto a inferencia sin especulación.
- Despliegue en estaciones de trabajo con una sola GPU: configuraciones con RTX 3090, DGX Spark (GB10) o Radeon AI PRO R9700 permiten servir Qwen3.8-27B Q4_K_M con aceleración especulativa sin clúster multi-GPU.
- Servicio con dos slots concurrentes (`-np 2`): en tarjetas de 24 GB, usando `--spec-draft-n-max 7`, se pueden atender dos peticiones simultáneas con aceleración moderada, útil para entornos de desarrollo en equipo.
- Evaluación y tuning de decodificación especulativa: el repositorio incluye resultados de comunidad en AMD, Intel y DGX Spark, lo que facilita comparar el rendimiento del borrador en distintas plataformas antes de adoptarlo en producción.
- Integración en pipelines de CI/CD para generación de documentación o tests: al acelerar la generación sobre el objetivo, se reducen los tiempos de ejecución de tareas batch de generación de texto técnico.

## Benchmarks y rendimiento

Resultados publicados en la model card (RTX 3090, 24 GB, objetivo Qwen3.8-27B Q4_K_M, KV cache q8_0):

| Configuración | Throughput en código/matemáticas | Throughput en tareas mixtas | Aceleración vs sin especulación |
|---|---|---|---|
| DSpine-b16 (n-max 15) | ~125-129 tok/s | ~90 tok/s | 3,2x global, hasta 4,5x en código |
| DFlash2 | no disponible en código | no disponible | referencia comparativa ~52 tok/s |
| Sin decodificación especulativa | no disponible | ~28 tok/s | 1x |

Resultados de comunidad (cada fila con sus propios prompts y baseline, no directamente comparables):

| GPU | Backend | Mejor `n-max` | Resultado | Reportero |
|---|---|---|---|---|
| RTX 3090, 24 GB | CUDA | 15 | 90 tok/s mixto, 129 tok/s código | Autor |
| DGX Spark (GB10), 128 GB unificada | CUDA | 15 | Código 76,7 tok/s vs 61,3 de DFlash2; DFlash2 más rápido en matemáticas, prosa y resúmenes | Alpaczyk (discusión #2) |
| Radeon AI PRO R9700, 32 GB | ROCm / HIP | 15 (7 más lento) | Código ~2,2x sobre MTP del objetivo; tool calls 3,4x; prosa, chat e imágenes 4-23% más lentos que MTP | menace1000 (discusión #3) |
| Intel Arc Pro B65, 32 GB | SYCL | 15 (3...) | dato truncado en la información disponible | no disponible |

## Requisitos de hardware

- VRAM del borrador: 1,26 GB en Q4_K_M, 2,20 GB en Q8_0 y 4,06 GB en BF16. Debe sumarse a la VRAM del modelo objetivo Qwen3.8-27B (por ejemplo, Q4_K_M) y a la KV cache.
- Contexto máximo en 24 GB: con objetivo Q4_K_M y KV cache q8_0, DSpine con `--spec-draft-n-max 15` cabe hasta `-c 65536`; con `n-max 7` hasta `-c 98304`. Para más contexto hay que reducir el `n-max`, usar un cuantizado menor del objetivo o una GPU mayor.
- GPU recomendadas: RTX 3090 (24 GB) es la referencia del autor; también hay resultados en DGX Spark GB10 (128 GB unificada), Radeon AI PRO R9700 (32 GB, ROCm/HIP) e Intel Arc Pro B65 (32 GB, SYCL).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 3090, siempre que el objetivo Qwen3.8-27B se cuantice a Q4_K_M o similar.
- Opciones de despliegue: exclusivamente llama.cpp con el fork `dspine` (rama `dspine` de Ajay9o9/llama.cpp); llama.cpp upstream rechaza cargar estos ficheros. No hay soporte indicado para vLLM, TGI u Ollama.
- Throughput estimado: ~90 tok/s en tareas mixtas y ~125-129 tok/s en código/matemáticas en RTX 3090 con objetivo Q4_K_M y n-max 15. En DGX Spark, 76,7 tok/s en código. En R9700, ~2,2x sobre MTP del objetivo en código.
- Ajuste importante: fijar manualmente `--spec-draft-n-max` (el valor por defecto es 3 y desaprovecha el bloque de 16) y `-c` (el auto-fit no reserva espacio para el borrador y con `--mmproj` puede provocar fallo en la primera petición de imagen). En tarjetas de 24 GB con `-np 2`, usar `n-max 7`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DSpine-b16 (este) | Draft model DSpine, 5 capas | ~2,03 B | Depende del objetivo; hasta 65k en 24 GB con n-max 15 | 3,2x global, hasta 4,5x en código sobre sin especulación (RTX 3090) | Apache 2.0 | GGUF en HF; requiere fork `dspine` de llama.cpp |
| DFlash2 | Draft model DFlash | no disponible | no disponible | ~52 tok/s en la misma prueba; más rápido que DSpine en matemáticas, prosa y resúmenes en DGX Spark | no disponible | no disponible |
| MTP del objetivo Qwen3.8-27B | Multi-token prediction integrado | no disponible | no disponible | DSpine ~2,2x más rápido en código y 3,4x en tool calls en R9700; MTP gana 4-23% en prosa, chat e imágenes | no disponible | integrado en el objetivo |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere siempre un Qwen3.8-27B objetivo y no produce respuestas finales por sí mismo.
- Dependencia de un fork no oficial: llama.cpp upstream no soporta DSpine y rechaza cargar los ficheros; hay que compilar la rama `dspine` de Ajay9o9/llama.cpp, con el riesgo de mantenimiento y desincronización con `master` que ello implica.
- El rendimiento depende fuertemente de la GPU: en GPUs donde la verificación de un bloque de 16 tokens es costosa (por ejemplo, R9700 con ROCm), drafts largos pueden costar más de lo que ahorran; en esos casos conviene bajar `--spec-draft-n-max`.
- En DGX Spark, DFlash2 supera a DSpine en matemáticas, prosa y resúmenes, por lo que la elección del borrador debe hacerse por carga de trabajo.
- Los resultados de comunidad no son directamente comparables entre sí: usan prompts, ajustes y baselines distintos (algunos contra sin especulación, otros contra MTP o DFlash2).
- Riesgo de alucinación: no aplica directamente al borrador, pero cualquier token aceptado incorrectamente por el verificador podría degradar la salida; la verificación del objetivo mitiga este riesgo.
- Sesgos e idiomas: no disponibles; dependen del modelo objetivo Qwen3.8-27B.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo objetivo Qwen3.8-27B por separado.
- Configuración manual obligatoria de `-c` y `--spec-draft-n-max`; el auto-fit y el valor por defecto de 3 degradan el rendimiento o provocan fallos de asignación.
- Con `--mmproj` cargado, la primera petición de imagen puede fallar si no se ajusta `-c` manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aj9o9/Qwen3.8-27B-DSpine-b16-GGUF
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper DSpine: https://arxiv.org/abs/2609.36173
- Fork de llama.cpp con soporte DSpine: https://github.com/Ajay9o9/llama.cpp/tree/dspine
- Discusión #2 (resultados DGX Spark, Alpaczyk): https://huggingface.co/aj9o9/Qwen3.8-27B-DSpine-b16-GGUF/discussions/2
- Discusión #3 (resultados Radeon AI PRO R9700, menace1000): https://huggingface.co/aj9o9/Qwen3.8-27B-DSpine-b16-GGUF/discussions/3
