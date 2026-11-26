# mxxm-t/DeepSeek-V4.1-Flash-DFly2-GGUF

## Resumen

DeepSeek-V4.1-Flash-DFly2-GGUF es la conversión a formato GGUF de un modelo borrador (*drafter*) de decodificación especulativa del tipo DFly2, publicado por el usuario mxxm-t a partir del checkpoint original AngelSlim/DS-V4.1-Flash-DFly2-B6, desarrollado por AngelSlim (Tencent) dentro del framework AngelSpec. No es un modelo autónomo: su función es proponer bloques de tokens que el modelo objetivo, DeepSeek-V4.1-Flash, verifica después, acelerando así la generación sin alterar la distribución de salida del modelo grande.

El borrador emplea una arquitectura MoE ligera de tres capas, cada una con 128 expertos enrutados y 3 activos, emparejadas con las capas 28, 32 y 36 del objetivo mediante compartición de KV e índices (KV sharing e index sharing). El bloque especulativo tiene tamaño 6 y se completa con una cabeza de corrección de 5 pasos. El checkpoint suma 14.400.493.410 parámetros y el repositorio ocupa 17,0 GB, con dos variantes de cuantización que combinan expertos en MXFP4 con lineales densos en Q8_0 o BF16.

Su relevancia es doble: por un lado documenta el estado del arte en decodificación especulativa para objetivos con atención dispersa nativa (DSA); por otro, es un artefacto que todavía no puede ejecutarse, porque ningún runtime publicado carga GGUFs DFly2 y el soporte está en desarrollo en el fork mx-llama.cpp y en el runtime llmx del mismo autor. La licencia es Apache-2.0, heredada del checkpoint de AngelSlim.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de 3 capas (borrador DFly2 block-parallel con KV sharing e index sharing sobre DeepSeek Sparse Attention del objetivo) |
| Parámetros totales | 14.400.493.410 |
| Parámetros activos | 3 expertos activos de 128 por capa (total de parámetros activos no disponible) |
| Longitud de contexto | no disponible (hereda la del objetivo; el borrador no mantiene KV cache propio) |
| Tipos de cuantización | Expertos enrutados en MXFP4 (nibbles FP4 y escalas E8M0 copiados bit-exact); lineales densos en Q8_0 o BF16; normas, attention sinks, tablas hyper-connection y bias del router en F32; pesos del router en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (2 ficheros: `DeepSeek-V4.1-Flash-DFly2-MXFP4-Q8_0.gguf` de 8,10 GB y `DeepSeek-V4.1-Flash-DFly2-MXFP4-BF16.gguf` de 8,85 GB) |

## Arquitectura y entrenamiento

El borrador es un MoE de tres capas, cada una con 128 expertos enrutados y 3 activos, emparejada respectivamente con las capas 28, 32 y 36 del objetivo DeepSeek-V4.1-Flash. En lugar de mantener su propio KV cache, lee el KV que la capa correspondiente del objetivo ya tiene cacheado (KV sharing) y opera únicamente en las posiciones que el indexer de esa capa ha seleccionado (index sharing), lo que encaja con la atención dispersa nativa (DSA) del modelo grande. El bloque especulativo es de tamaño 6, no causal, con token de máscara 128799, y una cabeza de corrección de 5 pasos rellena las ranuras del bloque. Comparte embedding y cabeza de salida con el objetivo, por lo que no se almacenan en el fichero del borrador.

El checkpoint fue entrenado por AngelSlim (Tencent) con el framework AngelSpec sobre el modelo base DeepSeek-V4.1-Flash. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión a GGUF no reentrena ni ajusta pesos: los 2392 tensores de origen se reorganizan en 94 tensores GGUF (verificados contra el mapa de nombres y tipos previsto), con los expertos enrutados copiados bit-exact desde los nibbles FP4 y escalas E8M0 originales a MXFP4, lo que constituye un cambio de formato y no una recuantización. Los lineales densos (atención, experto compartido, proyecciones de fusión y corrección) pasan de BF16 a Q8_0 en la variante `-Q8_0`, un paso con pérdida que solo afecta a la numérica del borrador, ya que el objetivo verifica cada token. Se descarta el bias del router de tokens de imagen.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre DeepSeek-V4.1-Flash; no genera texto de forma autónoma.
- Propuesta de bloques no causales de tamaño 6 con corrección en 5 pasos.
- Aprovechamiento del KV cache y de los índices de atención dispersa ya calculados por el objetivo, sin coste adicional de cache propio.
- Verificación delegada al modelo objetivo, que garantiza que la salida final no cambia respecto a la decodificación no especulativa.
- Compatibilidad con el ecosistema llama.cpp a través del fork mx-llama.cpp (soporte en desarrollo, aún no funcional).
- Soporte multi-GPU previsto en mx-llama.cpp con imágenes precompiladas para AMD/ROCm y NVIDIA/CUDA en Docker Hub.
- Capacidades multilingües, de tool calling, de agentes o de visión: no disponibles en el borrador (dependen del modelo objetivo).

## Casos de uso

- Aceleración de inferencia de DeepSeek-V4.1-Flash en producción: el borrador propone bloques de 6 tokens que el objetivo verifica en paralelo, reduciendo el número de pasos de decodificación secuencial cuando la tasa de aceptación es alta; requiere un runtime con soporte DFly2.
- Despliegue multi-GPU en clústeres AMD: las imágenes ROCm de mx-llama.cpp en Docker Hub permiten preparar nodos con GPUs AMD para servir el objetivo junto con este borrador, un escenario poco cubierto por los runtimes habituales.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar KV sharing e index sharing sobre objetivos con atención dispersa nativa, comparando tasas de aceptación entre el checkpoint base y la actualización 1017.
- Evaluación de robustez de borradores cuantizados: la pareja de ficheros Q8_0 y BF16 permite medir el impacto de la cuantización de los lineales densos en la tasa de aceptación, manteniendo idéntica la salida final verificada.
- Integración en pipelines de inferencia de baja latencia para cargas de texto largo: al no mantener KV cache propio, el borrador añade una huella de memoria moderada (8-9 GB) sobre el objetivo, lo que facilita colocarlo en GPUs adicionales del mismo nodo.
- Desarrollo de tooling de conversión GGUF: el mapa de 94 tensores y las claves de cabecera DFly2 (tamaño de bloque, token de máscara, capas objetivo, expertos) documentan el formato para quien implemente convertidores o validadores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original reporta tasas de aceptación para el modelo base DeepSeek-V4.1-Flash, pero no se incluyen cifras concretas en la información proporcionada, y el autor de la conversión advierte de que la aceptación frente a los ficheros `main` de la actualización 1017 puede ser inferior y no ha sido medida.

## Requisitos de hardware

- VRAM estimada para el borrador: 8,10 GB (variante MXFP4-Q8_0) o 8,85 GB (variante MXFP4-BF16), adicionales a la memoria del modelo objetivo.
- El borrador no mantiene KV cache propio, por lo que no añade memoria de contexto; esta recae íntegramente sobre el objetivo.
- GPU recomendadas: no disponibles de forma específica; el ecosistema previsto (mx-llama.cpp) apunta a despliegues multi-GPU con AMD/ROCm y NVIDIA/CUDA.
- Viabilidad en GPU de consumo: los 8-9 GB del borrador caben en tarjetas de 12 GB o más, pero el requisito real lo impone el modelo objetivo DeepSeek-V4.1-Flash, cuyas necesidades de VRAM no se detallan en la información disponible.
- Opciones de despliegue: ninguna funcional en la actualidad. El soporte está en desarrollo en mx-llama.cpp (fork de llama.cpp con foco en inferencia multi-GPU; imágenes en `mxxm/mx-llama.cpp` en Docker Hub) y en llmx, un runtime sin dependencias que ya ejecuta DeepSeek-V4.1-Flash. La línea de comandos con `--spec-type` es un marcador de posición y no es definitiva.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Formato | Licencia | Estado de ejecución |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-DFly2-GGUF (este) | Borrador especulativo DFly2, MoE 3 capas, bloque 6 | 14.400.493.410 | no disponible | GGUF (MXFP4 + Q8_0/BF16) | Apache-2.0 | No cargable aún (soporte en desarrollo) |
| AngelSlim/DS-V4.1-Flash-DFly2-B6 | Borrador especulativo DFly2 original | no disponible | no disponible | safetensors (checkpoint) | Apache-2.0 | Requiere runtime compatible con DFly2 |
| DeepSeek-V4.1-Flash | Modelo objetivo completo | no disponible | no disponible | no disponible | licencia propia del objetivo | Ejecutable en llmx |

No se dispone de datos de benchmarks ni de otros borradores comparables en la información proporcionada.

## Limitaciones y advertencias

- Ningún runtime publicado carga estos ficheros: son inutilizables hasta que el soporte DFly2 llegue a mx-llama.cpp o llmx.
- No es un modelo autónomo; sin el objetivo DeepSeek-V4.1-Flash y su GGUF (`mxxm-t/DeepSeek-V4.1-Flash-1017-GGUF`, ficheros `main`) no produce salida útil.
- El checkpoint se entrenó sobre el modelo base, no sobre la actualización 1017; aunque la configuración es idéntica (las mismas 59 claves), los pesos difieren y la tasa de aceptación puede ser inferior a la reportada, sin medición disponible.
- La variante Q8_0 introduce pérdida numérica en los lineales densos del borrador; no afecta a la salida final porque el objetivo verifica, pero puede reducir la tasa de aceptación.
- El bias del router de tokens de imagen se descarta en la conversión, por lo que cualquier ruta multimodal del objetivo no está cubierta por el borrador.
- La licencia Apache-2.0 cubre el borrador y el checkpoint de AngelSlim con atribución a Tencent; el modelo objetivo está sujeto a su propia licencia, que debe revisarse por separado para uso comercial.
- Riesgo de alucinación y sesgos: no evaluables en el borrador, ya que su salida siempre pasa por la verificación del objetivo; hereda en la práctica las limitaciones del modelo grande.
- Idiomas soportados no documentados; la cobertura lingüística depende del objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mxxm-t/DeepSeek-V4.1-Flash-DFly2-GGUF
- Checkpoint original: https://huggingface.co/AngelSlim/DS-V4.1-Flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- GGUF del objetivo: https://huggingface.co/mxxm-t/DeepSeek-V4.1-Flash-1017-GGUF
- Fork mx-llama.cpp: https://github.com/mxxm-t/mx-llama.cpp
- Imágenes Docker de mx-llama.cpp: https://hub.docker.com/r/mxxm/mx-llama.cpp
- Runtime llmx: https://github.com/mxxm-t/llmx
- Framework AngelSpec: https://github.com/Tencent/AngelSpec
- Documentación de AngelSpec: https://angelspec.readthedocs.io
- Colección AngelSpec en Hugging Face: https://huggingface.co/collections/AngelSlim/angelspec
- Informe técnico (arXiv 2607.25852): https://arxiv.org/abs/2607.25852
- Artículo DFly2 (arXiv 2611.34776): https://arxiv.org/abs/2611.34776
