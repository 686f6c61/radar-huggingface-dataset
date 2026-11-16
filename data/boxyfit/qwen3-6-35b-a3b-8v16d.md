# BoxyFit/Qwen3.6-35B-A3B-8V16D

## Resumen

Qwen3.6-35B-A3B-8V16D es una cuantización GGUF del modelo Qwen3.6-35B-A3B, publicada por el usuario BoxyFit bajo la familia de packs "8V16D". El objetivo declarado es que un modelo de mezcla de expertos (MoE) de 35.505.251.456 parámetros totales funcione a velocidad utilizable en el perfil de hardware más común del mercado de consumo: una GPU con 8 GB de VRAM y un equipo con 16 GB de RAM. Para ello se apoya en una estrategia de dos niveles: un "hot tier" de expertos residente en la GPU y el pool completo de expertos en RAM del sistema.

El pack se distribuye en dos variantes, FTQ y FIQ, con tamaños de descarga de 10,7 GiB y 11,0 GiB respectivamente. FTQ es una cuantización Trellis adaptativa que comprime el pool de expertos a 9,36 GiB (frente a los 14,3 GiB de los packs de terceros del mismo tamaño nominal), y requiere los kernels propios del motor Strata. FIQ es la variante compatible con llama.cpp, LM Studio y Ollama, pensada para los front-ends más extendidos.

La relevancia del pack es fundamentalmente de ingeniería de despliegue, no de modelado: no se publican datos sobre el entrenamiento del modelo base, y la model card se centra en métricas de rendimiento medidas (tokens por segundo, tiempos de prefill, perplejidad en wikitext-2) sobre una RTX 3070 Ti de 8 GB con 16 GB de RAM de sistema. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), según el nombre A3B del modelo base; detalles de la arquitectura base no disponibles |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | no disponible (el sufijo A3B sugiere ~3B activos, sin confirmación en la información) |
| Longitud de contexto | hasta 56.000 tokens en Strata (FTQ); hasta 98.000 tokens medidos en llama.cpp (FIQ); máximo nominal no disponible |
| Tipos de cuantización | FTQ (Trellis adaptativa, requiere kernels Strata) y FIQ (familia IQ, compatible con llama.cpp); niveles internos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35.505.251.456 parámetros totales, del que no se aporta información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. La model card no describe la arquitectura interna del modelo original, y el sufijo "A3B" del nombre apunta a un esquema MoE con aproximadamente 3.000 millones de parámetros activos por token, aunque ese dato no se confirma explícitamente en la información disponible.

La innovación técnica documentada está en la cuantización y el motor de inferencia, no en el modelo. El pack FTQ usa una cuantización Trellis adaptativa que reduce el pool de expertos a 9,36 GiB, lo que permite que el motor Strata mantenga ese pool completo en memoria de host fijada (pinned) y alimente con él un hot tier residente en los 8 GB de VRAM. Strata emplea decodificación especulativa MTP-2 (multi-token prediction con 2 tokens) en su configuración de servicio. El pack FIQ, en cambio, usa la familia de cuantizaciones IQ para poder ejecutarse en los kernels estándar de llama.cpp. La perplejidad medida en wikitext-2 es de 7,547 para FTQ y 7,639 para FIQ, frente a 7,451 del pack UD-IQ3_S de terceros.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.6-35B-A3B, sin detalle en la model card.
- Procesamiento de contextos largos: medido de forma estable hasta 56K tokens en Strata y hasta 98K en llama.cpp, con velocidad de decodificación que se mantiene por encima de 13 t/s.
- Servicio end-to-end con prompts reales de clase 30K tokens, según el protocolo de medida declarado.
- Compatibilidad con front-ends de inferencia local: llama.cpp, LM Studio y Ollama mediante el pack FIQ; motor Strata para el pack FTQ.
- Decodificación especulativa MTP-2 en Strata, que acelera la generación respecto a la decodificación estándar.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en PC de consumo: el caso de uso central del pack es ejecutar un MoE de 35.500 millones de parámetros en una máquina con 8 GB de VRAM y 16 GB de RAM, con 26,1 t/s a 20K de contexto en Strata/FTQ, lo que lo hace viable para asistentes interactivos en equipos gaming estándar.
- Asistentes de código con contexto de repositorio: con 56K tokens de contexto en Strata a 11,8 t/s, el modelo puede mantener en memoria fragmentos amplios de un proyecto y responder consultas sobre ellos sin salir del equipo local.
- Procesamiento de documentos largos por lotes: en llama.cpp con FIQ y 98K de contexto a 13,5 t/s, es adecuado para resumir o extraer información de documentos extensos en máquinas sin GPU de gama alta.
- Despliegue en estaciones de trabajo con GPU modesta: el reparto GPU/RAM del pack permite aprovechar una RTX 3070 Ti o similar para servir un modelo de 35B en entornos de desarrollo y pruebas internas.
- Prototipado de aplicaciones sobre llama.cpp, LM Studio u Ollama: el pack FIQ se importa directamente en estos front-ends y permite validar pipelines de generación antes de migrar a infraestructura mayor.
- Evaluación comparativa de cuantizaciones: las métricas publicadas (t/s, prefill, perplejidad) sobre el mismo hardware y arnés permiten usar el pack como referencia para medir el impacto de distintas cuantizaciones en calidad y velocidad.
- Sustitución de modelos densos pequeños en hardware limitado: frente a un denso de tamaño comparable, el esquema MoE con pool en RAM ofrece más parámetros totales con un coste de VRAM acotado, útil cuando la calidad por token importa más que la latencia mínima.

## Benchmarks y rendimiento

Rendimiento medido en RTX 3070 Ti (8 GB VRAM) con 16 GB de RAM de sistema, temperatura 0, prompts de clase 30K tokens. Formato: decodificación t/s / prefill t/s / tiempo de prefill.

| Pack | 20K ctx | 56K ctx | 64K ctx | 98K ctx | VRAM (GiB) | RAM (GiB) | Descarga (GiB) | Perplejidad |
|---|---|---|---|---|---|---|---|---|
| 8V16D-FTQ (Strata) | 26,1 / 371 / 49 s | 11,8 / 372 / 2,5 min | no medido | no medido | 7,6 | 12 | 10,7 | 7,547 |
| 8V16D-FIQ (Strata) | 31,1 / 323 / 57 s | 12,8 / 325 / 2,8 min | no medido | no medido | 7,8 | 12 | 11,0 | 7,639 |
| UD-IQ3_S (Strata) | 29,2 / 346 / 53 s | 12,5 / 325 / 2,8 min | no medido | no medido | 7,9 | 16 | 14,3 | 7,451 |
| 8V16D-FIQ (llama.cpp) | 14,8 / 331 / 1,0 min | no medido | 14,0 / 318 / 3,3 min | 13,5 / 312 / 5,0 min | 2,5 | 14 | 11,0 | 7,639 |
| UD-IQ2_M (llama.cpp) | 14,7 / 328 / 1,0 min | no medido | 13,7 / 315 / 3,3 min | 13,3 / 310 / 5,0 min | 2,6 | 14 | 10,7 | 7,776 |
| UD-IQ3_S (llama.cpp) | 14,4 / 258 / 1,3 min | no medido | 11,3 / 249 / 4,2 min | 10,9 / 245 / 6,3 min | no disponible | no disponible | no disponible | 7,451 |
| UD-IQ2_XXS (llama.cpp) | 35,1 / 936 / 24 s | no medido | 3,0 / 522 / 2,0 min | 2,7 / 481 / 3,2 min | no disponible | no disponible | no disponible | 8,696 |
| ISTA IQ2_XS (llama.cpp) | 2,6 / 507 / 1,0 min | no medido | 1,8 / 400 / 2,6 min | 1,4 / 347 / 4,5 min | no disponible | no disponible | no disponible | 8,373 |

No se han publicado resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la información disponible. La única métrica de calidad reportada es la perplejidad en wikitext-2.

## Requisitos de hardware

- VRAM: 7,6 GiB para FTQ y 7,8 GiB para FIQ en configuración Strata; 2,5 GiB para FIQ en llama.cpp, LM Studio u Ollama con offload parcial.
- RAM de sistema: 12 GiB de presupuesto mínimo de motor para FTQ y FIQ en Strata a plena velocidad; 14 GiB en llama.cpp. Bajo un límite estricto de 8 GiB de RAM, ningún pack Strata arranca; el pack para llama.cpp sí funciona a 14,7 t/s con 20K de contexto.
- GPU: RTX 3070 Ti (8 GB) es la tarjeta de referencia medida. No se reportan pruebas en otras GPU.
- Cabe en GPU de consumo de 8 GB, siempre que el equipo acompañe con 16 GB de RAM; en Windows el sistema operativo retiene 3-4 GiB y en Linux de escritorio 1-2 GiB, lo que condiciona el margen.
- Despliegue: motor Strata (comando `strata --serve --native ... --max-context 56000 --mtp 2`), llama.cpp con llama-server, LM Studio (offload automático) y Ollama.
- Throughput: hasta 31,4 t/s de decodificación a 20K de contexto en el mejor caso medido (FIQ en Strata bajo presupuesto de 12 GiB); 26,1 t/s para FTQ en las mismas condiciones; 14,8 t/s en llama.cpp a 20K.
- Prefill: 371 t/s (FTQ) y 323 t/s (FIQ) en Strata a 20K, con 49-57 s de prefill; 331 t/s en llama.cpp con 1,0 min.
- Advertencia de offload: Ollama y LM Studio mueven capas a CPU automáticamente cuando el contexto excede la VRAM, sin avisar al usuario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto medido | t/s a 20K (llama.cpp) | t/s a 98K (llama.cpp) | Perplejidad | Licencia |
|---|---|---|---|---|---|---|
| 8V16D-FIQ (este pack) | 35,5B totales | 98K | 14,8 | 13,5 | 7,639 | no disponible |
| UD-IQ2_M | mismo modelo base | 98K | 14,7 | 13,3 | 7,776 | no disponible |
| UD-IQ3_S | mismo modelo base | 98K | 14,4 | 10,9 | 7,451 | no disponible |
| UD-IQ2_XXS | mismo modelo base | 98K | 35,1 | 2,7 | 8,696 | no disponible |
| ISTA IQ2_XS | mismo modelo base | 98K | 2,6 | 1,4 | 8,373 | no disponible |

La comparativa relevante es entre cuantizaciones del mismo modelo base, ya que la información no incluye alternativas de otros modelos. Frente a UD-IQ2_M, el pack FIQ ofrece 0,14 puntos menos de perplejidad y ligera ventaja de velocidad a contexto largo. Frente a UD-IQ3_S, es un 24% más rápido a 64K (14,0 frente a 11,3 t/s) y a 98K (13,5 frente a 10,9 t/s) con 3,3 GiB menos de descarga, aunque con peor perplejidad (7,639 frente a 7,451). Los packs XS y XXS de terceros muestran velocidad alta a contexto corto pero colapso a contexto largo.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial está permitido; hay que verificar la licencia del modelo base Qwen3.6-35B-A3B antes de cualquier despliegue en producción.
- El pack FTQ solo funciona con el motor Strata, propietario del autor; no es portable a llama.cpp, LM Studio ni Ollama.
- El rendimiento depende críticamente del tamaño del pool de expertos en RAM: con 12 GiB de presupuesto, el pack de terceros UD-IQ3_S no arranca, y bajo 8 GiB de RAM ningún pack Strata arranca.
- Las métricas proceden de un único hardware (RTX 3070 Ti, 16 GB de RAM) y de un arnés propio; no hay validación independiente ni resultados en otras GPU.
- Solo se reporta perplejidad en wikitext-2 como medida de calidad; no hay evaluación en tareas downstream, lo que limita la comparación real de capacidades.
- La model card no documenta sesgos, riesgo de alucinación ni comportamiento multilingüe del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con tres minutos de diferencia; no hay historial de uso que respalde la fiabilidad de los artefactos.
- Ollama y LM Studio pueden degradar silenciosamente el rendimiento al mover capas a CPU cuando el contexto supera la VRAM disponible.
- Los números de velocidad a contexto corto de algunos packs de terceros (UD-IQ2_XXS: 35,1 t/s a 20K) no se sostienen a contexto largo (2,7 t/s a 98K), por lo que las comparaciones a una sola longitud de contexto pueden inducir a error.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BoxyFit/Qwen3.6-35B-A3B-8V16D
- Modelo base Qwen3.6-35B-A3B: no disponible en la información proporcionada
- Paper o blog técnico del modelo base: no disponible
- Repositorio del motor Strata: no disponible
- Documentación de llama.cpp: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
