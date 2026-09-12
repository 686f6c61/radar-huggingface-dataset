# ProCreations/grug-27b-v2

## Resumen

Grug 27B v2 es un ajuste fino (post-training) del modelo Qwen 3.8 27B desarrollado por ProCreations, orientado a razonamiento compacto estilo "grug" (traza de pensamiento muy breve), generación de código y uso de herramientas. El modelo cuenta con 27.356.728.560 parámetros (unos 27,36 mil millones) y se distribuye con licencia Apache 2.0 en formato safetensors para la librería transformers, con una versión adicional en GGUF publicada en un repositorio aparte. Su principal propuesta es reducir la longitud de las trazas de razonamiento sin perder demasiada precisión en tareas de código y de llamada a funciones, algo relevante para despliegues con coste por token elevado.

La innovación técnica más destacable es la inclusión de una cabeza MTP (multi-token prediction) nativa ya ajustada dentro del propio checkpoint, lo que permite decodificación especulativa sin necesidad de un modelo borrador externo. Según el autor, el throughput medido en H200 pasa de 68,02 tokens/s sin MTP a 112,77 con un token borrador y 142,44 con dos. El modelo expone tres niveles de esfuerzo de razonamiento (`low`, `medium`, `xhigh`) mediante `chat_template_kwargs.reasoning_effort`, siendo `medium` el valor por defecto.

Es relevante ahora porque ataca un compromiso concreto: mantener buena ejecución en tests de código y en llamadas a herramientas con trazas mucho más cortas que el modelo base (192/266/656 tokens de media en HumanEval frente a 483/617/1214 de Qwen), aunque con una pérdida medible de precisión en matemáticas (84,7% frente a 95,3% en el subconjunto de 150 casos de MATH a esfuerzo medio). El repositorio se publicó el 12 de septiembre de 2026 y, en el momento de la consulta, no registraba descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivada de Qwen 3.8 27B (etiqueta `qwen3_5` en el repositorio); incluye cabeza MTP nativa y conserva el codificador de visión |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no disponible (las pruebas documentadas usan ventanas de 24.576 y 65.536 tokens) |
| Tipos de cuantizacion | safetensors en precisión completa/bf16 en el repositorio principal; versiones GGUF en el repositorio `ProCreations/grug-27b-v2-gguf` (la cabeza MTP se incluye en cada cuantización de texto; no se detallan los niveles concretos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (principal), GGUF (repositorio secundario) |

Datos adicionales: pipeline `text-generation`, librería `transformers`, tamaño del repositorio 55,6 GB, modelo base `Qwen/Qwen3.8-27B` con relación `finetune`, fecha de creación 2026-09-12, última actualización 2026-09-12.

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.8 27B, un transformer decoder de ~27 B de parámetros, y se somete a un ciclo de post-entrenamiento mediante LoRA. El run principal de LoRA utilizó 3.466 ejemplos de entrenamiento con validación disjunta por grupos de tareas, mezclando material verificado de código, matemáticas y reparación, junto con replay heredado de herramientas y ejemplos nuevos de generación de títulos de sesión. El mejor checkpoint de validación se fusionó en el modelo base. El codificador de visión se preserva, aunque la tarjeta indica explícitamente que esta release no establece la calidad de visión ni el rendimiento con la totalidad del contexto configurado.

La pieza diferencial es la cabeza MTP integrada: los 15 tensores de la cabeza borrador nativa están indexados en `model-mtp.safetensors` dentro del repositorio. Durante su etapa de ajuste solo se entrenó la cabeza, manteniendo congelado el modelo principal. Los datos reportados indican que el acuerdo en datos retenidos entre borrador y verificador pasó del 90,44% al 90,90%, y la pérdida de destilación mejoró de 0,3502 a 0,2965. Las secuencias greedy con MTP activado y desactivado coincidieron en 10 de 18 prompts, lo que el autor presenta como resultado específico de esa carga de trabajo.

En cuanto al razonamiento, el modelo se entrena para producir trazas telegráficas en los tres niveles de esfuerzo, aunque las respuestas finales y el código pueden usar lenguaje ordinario. El autor advierte que las trazas largas a veces derivan hacia inglés convencional. La plantilla guardada normaliza el razonamiento histórico una vez, y los clientes necesitan parsers de razonamiento y de llamadas a herramientas correctos para interpretar la salida.

## Capacidades

- Generación de texto conversacional en inglés con pipeline `text-generation`.
- Generación de código, con resultados medidos en HumanEval (132 casos), MBPP (225 casos) y un subconjunto de SWE-bench Verified (Django/SymPy, 12 incidencias).
- Razonamiento matemático, aunque con pérdida de precisión frente al modelo base (84,7% frente a 95,3% en el subconjunto de 150 casos de MATH a esfuerzo medio).
- Tool calling / function calling: el subconjunto de 200 casos de BFCL se usa como medida, y la configuración probada en vLLM incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Comportamiento agéntico multi-turno: se midió escalado por esfuerzo en un subconjunto agéntico de 12 casos, con 9/10/11 resoluciones a `low`/`medium`/`xhigh` frente a 8/9/7 de la versión v1.1.
- Modos de razonamiento configurables mediante `reasoning_effort` con valores `low`, `medium` (por defecto) y `xhigh`, con longitudes medias de 192/266/656 tokens en HumanEval.
- Generación de títulos de sesión sin fugas de llamadas a herramientas: 90/90 comprobaciones superadas y 24/24 pruebas HTTP reales sobre vLLM.
- Decodificación especulativa integrada mediante cabeza MTP nativa, sin modelo borrador externo.
- Conserva el codificador de visión del modelo base (capacidad de image-text-to-text según las etiquetas), aunque el autor no valida la calidad de visión en esta release.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Asistentes de código en IDE con coste por token sensible: las trazas de razonamiento de 192 a 266 tokens a esfuerzo bajo/medio reducen el gasto en tokens de salida frente a las 483-617 del modelo base, manteniendo un 97,0% en HumanEval medio.
- Pipelines de CI/CD con llamada a funciones: la combinación de `--enable-auto-tool-choice` con `qwen3_coder` y los 88,0% medidos en BFCL permiten integrar el modelo como agente que invoca herramientas de construcción, test o despliegue.
- Agentes de resolución de incidencias sobre repositorios: en el subconjunto de 12 incidencias de SWE-bench Verified resolvió 10/12 a esfuerzo medio y 11/12 a `xhigh`, útil como paso automatizado de parcheo antes de revisión humana.
- Generación automática de títulos y metadatos de sesión: con 90/90 comprobaciones superadas y sin fugas de llamadas a herramientas, encaja en productos con historial de conversaciones que necesitan etiquetado consistente.
- Servicio de inferencia de alto throughput: con la cabeza MTP activada y dos tokens especulativos, el autor mide 142,44 tokens/s en H200 frente a 68,02 sin MTP, lo que justifica su uso en backends de vLLM con requisitos de latencia.
- Reescritura y reparación de código en lotes: el entrenamiento incluye material de código, matemáticas y reparación verificado, adecuado para tareas de corrección de fragmentos con validación automática posterior.
- Razonamiento con presupuesto de contexto controlado: las pruebas documentadas usan ventanas de 24.576 y 65.536 tokens, por lo que sirve para tareas que requieren contexto largo siempre que se fije `--max-model-len` y se valide el comportamiento en ese rango.

## Benchmarks y rendimiento

Resultados publicados por el autor en ejecuciones emparejadas sobre H200 con vLLM, temperatura 0,6, top-p 0,95, top-k 20, penalización por repetición 1,05 y semilla 42. Son medidas sobre subconjuntos fijos ejecutables, no puntuaciones completas de leaderboard.

| Modelo | HumanEval medio (132) | MBPP medio (225) | BFCL medio, subconjunto (200) |
|---|---:|---:|---:|
| Qwen 3.8 27B | 99,2% | 93,3% | 89,0% |
| Grug v1.1 | 91,7% | 80,4% | 81,0% |
| Grug 27B v2 | 97,0% | 90,7% | 88,0% |

| Prueba | Grug v2 | Grug v1.1 | Qwen 3.8 27B |
|---|---:|---:|---:|
| SWE-bench Verified, subconjunto 12 casos, esfuerzo medio, límites originales | 10/12 | 8/12 | no disponible |
| SWE-bench Verified, subconjunto 12 casos, `xhigh`, contexto 65.536 y 16.384 tokens de salida por turno | 11/12 | 7/12 | 10/12 |
| Comprobaciones de título de sesión (low/medium/xhigh) | 90/90 | no disponible | no disponible |
| Pruebas HTTP reales sobre vLLM | 24/24 | no disponible | no disponible |
| Subconjunto agéntico, 12 casos, low/medium/xhigh con razonamiento retenido | 9/10/11 | 8/9/7 | no disponible |
| MATH medio, subconjunto 150 casos | 84,7% | no disponible | 95,3% |

| Métrica MTP | Valor |
|---|---:|
| Acuerdo borrador/verificador en datos retenidos | 90,44% → 90,90% |
| Pérdida de destilación | 0,3502 → 0,2965 |
| Throughput sin MTP (18 prompts seriales en H200) | 68,02 tokens/s |
| Throughput con 1 token borrador | 112,77 tokens/s |
| Throughput con 2 tokens borrador | 142,44 tokens/s |
| Aceptación real de token borrador | 86,87% y 77,20% |
| Coincidencia de secuencias greedy MTP off/on | 10/18 prompts |

Longitudes medias de razonamiento en HumanEval: 192/266/656 tokens para v2 en low/medium/xhigh frente a 483/617/1214 de Qwen. El autor señala que la precisión no sube de forma monótona y que varias puntuaciones de código y matemáticas caen en `xhigh` incluso duplicando el límite de salida.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 55 GB solo para pesos (27,36 B de parámetros) más la caché KV, que con ventanas de 24.576 a 65.536 tokens es significativa. Estimación aritmética a partir del tamaño del repositorio (55,6 GB), no una medición publicada.
- VRAM estimada en cuantizaciones GGUF de 4 bits: en torno a 15-17 GB para pesos, lo que encaja en GPU de consumo con 24 GB. En 8 bits, alrededor de 29 GB, fuera del alcance de una RTX 4090.
- GPU de referencia en las pruebas: H200 y H100 (el autor cita "matched H200/vLLM runs"). Para fp16 completo se necesitan GPU de 80 GB como A100 80 GB, H100 80 GB o H200.
- GPU de consumo: viable con cuantización GGUF de 4 bits en RTX 4090 (24 GB) o RTX 3090 (24 GB); en 16 bits no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue documentadas: vLLM 0.29.0 con decodificación especulativa MTP, transformers (librería declarada) y llama.cpp (el autor menciona comandos de llama.cpp en `usage.md`). Ollama y TGI no se mencionan en la información disponible.
- Comando de referencia probado en vLLM: `--max-model-len 24576 --max-num-seqs 8 --gpu-memory-utilization 0.85 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder --speculative-config '{"method":"mtp","num_speculative_tokens":2}'`.
- Throughput medido: 68,02 tokens/s sin MTP, 112,77 con un token especulativo y 142,44 con dos, sobre 18 prompts seriales en H200 tras el calentamiento. La latencia no se publica.
- Parámetros de generación recomendados: temperatura 0,6, top-p 0,95, top-k 20, penalización por repetición 1,05, fijados explícitamente si el cliente sobrescribe los valores por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval medio | MBPP medio | BFCL medio | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| Grug 27B v2 | 27,36 B | no disponible (pruebas a 24.576 y 65.536 tokens) | 97,0% | 90,7% | 88,0% | apache-2.0 | safetensors y GGUF en HuggingFace; 0 descargas registradas |
| Qwen 3.8 27B (base) | 27,36 B (modelo del que deriva) | no disponible | 99,2% | 93,3% | 89,0% | no disponible en la información proporcionada | HuggingFace, `Qwen/Qwen3.8-27B` |
| Grug v1.1 | no disponible | no disponible | 91,7% | 80,4% | 81,0% | no disponible en la información proporcionada | HuggingFace, `ProCreations/grug-v1.1-qwen-3.8-27b` |

Frente al modelo base, Grug v2 sacrifica entre 2,2 y 2,6 puntos en HumanEval, MBPP y BFCL, y 10,6 puntos en MATH medio, a cambio de trazas de razonamiento aproximadamente la mitad de largas y de una cabeza MTP integrada que eleva el throughput. Frente a Grug v1.1 mejora en las tres pruebas de código y herramientas, además de corregir la regresión de títulos de sesión.

## Limitaciones y advertencias

- Precisión inferior a la del modelo base en tareas centrales: 84,7% frente a 95,3% en MATH medio y 97,0% frente a 99,2% en HumanEval medio. La compactidad de las trazas tiene un coste real.
- La precisión no escala de forma monótona con el esfuerzo: varias puntuaciones de código y matemáticas bajan en `xhigh` incluso duplicando el límite de tokens de salida.
- Persiste un bucle sin terminar real en la auditoría de MATH a esfuerzo bajo. El autor indica que el problema de repetición reportado está mitigado, no resuelto por completo.
- Las trazas largas pueden derivar hacia inglés ordinario, rompiendo el estilo grug declarado en casos difíciles.
- Los subconjuntos de evaluación son pequeños: un solo caso cambia la puntuación de SWE-bench en 8,3 puntos. El propio autor advierte que no se establece superioridad estadística amplia.
- El harness de SWE-bench usa un entorno compartido fijado, no las imágenes Docker oficiales por instancia, por lo que los resultados no son directamente comparables con el leaderboard oficial.
- El modelo solo declara inglés (`language: en`). No hay soporte multilingüe documentado.
- La calidad de visión no está validada en esta release, pese a conservar el codificador de visión y a la etiqueta `image-text-to-text`.
- No se establece el rendimiento con la totalidad del contexto configurado del modelo base; solo hay pruebas a 24.576 y 65.536 tokens.
- Los clientes necesitan parsers correctos de razonamiento y de llamadas a herramientas; la plantilla normaliza el razonamiento histórico una sola vez, lo que puede causar inconsistencias si el cliente no lo gestiona.
- Los conjuntos de datos de entrenamiento y su composición solo se describen parcialmente (3.466 ejemplos, validación disjunta por grupos de tareas); no se detalla el corpus completo ni los volúmenes por dominio.
- Riesgo de alucinación: no se publica ninguna evaluación específica de veracidad o factualidad.
- Sesgos conocidos: no se documenta ningún análisis de sesgo en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. El modelo base Qwen 3.8 27B puede imponer condiciones adicionales no detalladas aquí; conviene revisar su licencia antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- La model card incluye referencias a documentos (`results.md`, `evaluation_protocol.md`, `usage.md`) que no forman parte de la información proporcionada; los datos citados son los que aparecen en la propia tarjeta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/grug-27b-v2
- Repositorio GGUF: https://huggingface.co/ProCreations/grug-27b-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados legibles por máquina: https://huggingface.co/ProCreations/grug-27b-v2/tree/main/results
- Discusión sobre el problema de títulos reportado: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b/discussions/2
- Discusión sobre el problema de bucles reportado: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b/discussions/5
- Documentos citados en la model card y no incluidos en la información disponible: `results.md`, `evaluation_protocol.md`, `usage.md` (se encuentran en la raíz del repositorio del modelo).
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a documentación de YouTube y a preguntas en foros sin relación con el modelo.
