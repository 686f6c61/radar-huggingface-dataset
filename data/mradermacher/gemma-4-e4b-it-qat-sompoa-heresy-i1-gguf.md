# mradermacher/gemma-4-E4B-it-QAT-SOMPOA-heresy-i1-GGUF

## Resumen

`mradermacher/gemma-4-E4B-it-QAT-SOMPOA-heresy-i1-GGUF` es una cuantizacion GGUF del modelo `MuXodious/gemma-4-E4B-it-QAT-SOMPOA-heresy`, un derivado de la familia Gemma 4 de Google con tecnicas de "abliteration"/"decensoring" (etiquetado como heretic, uncensored y abliterated) que eliminan parcialmente los mecanismos de rechazo del modelo original. El autor de la cuantizacion es mradermacher, especialista en publicar versiones GGUF optimizadas con imatrix para inferencia local.

El modelo cuenta con 7.463.013.674 parametros totales segun los pesos en safetensors del modelo base, lo que lo situa en la categoria de 7-8B densos (aunque la nomenclatura E4B sugiere una variante de la familia Gemma con atencion eficiente). Se distribuye exclusivamente en formato GGUF cuantizado (desde IQ1_S hasta Q6_K) y esta pensado para despliegue en llama.cpp y entornos de inferencia local compatibles con GGUF.

Su relevancia actual radica en dos factores: por un lado, la cuantizacion QAT (Quantization-Aware Training) del modelo base permite mantener calidad en cuantizaciones agresivas; por otro, el proceso de "abliteration" lo hace atractivo para casos de uso donde el modelo original rechaza peticiones legitimas (investigacion de seguridad, generacion creativa sin filtros, roleplay). La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los terminos de Gemma 4 de Google, lo que introduce ambiguedad legal relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B); detalles especificos no disponibles |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizado); origen en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es `MuXodious/gemma-4-E4B-it-QAT-SOMPOA-heresy`, un fine-tune de la familia Gemma 4 (arquitectura transformer decoder-only de Google) sometido a un proceso de "abliteration" para reducir los rechazos. La nomenclatura "QAT" indica que el modelo base fue entrenado con Quantization-Aware Training, lo que mejora la robustez frente a cuantizaciones agresivas. El sufijo "SOMPOA" y "heresy" son marcas del autor del fine-tune (MuXodious) y no se documentan en la informacion disponible.

La cuantizacion de mradermacher utiliza pesos imatrix (importance matrix) calculados sobre el modelo base, lo que produce cuantizaciones i1 de mayor calidad que las estaticas equivalentes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el proceso original de Gemma 4. Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" indican que se ha aplicado una intervencion sobre las direcciones de rechazo en el espacio de activaciones, tecnica habitual para eliminar la censura sin reentrenar.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline "conversational" declarado).
- Razonamiento y generacion de codigo heredados del modelo Gemma 4 base (no verificados en esta cuantizacion).
- Comportamiento "uncensored": menor tendencia a rechazar peticiones que el modelo original, segun las etiquetas del autor.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion de seguridad y alineacion: el modelo permite estudiar como el proceso de abliteration afecta a la tasa de rechazos y a la calidad general, comparando respuestas frente al Gemma 4 original en tareas controladas.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde el modelo alineado rechazaria la peticion; adecuado por su naturaleza decensored.
- Roleplay y personajes: conversaciones multi-turno con personajes que requieren respuestas sin restricciones morales, aprovechando la etiqueta conversational y el comportamiento uncensored.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (5,4 GB) e IQ4_XS (5,1 GB) caben en GPUs de 8 GB de VRAM, permitiendo inferencia offline en portatiles o estaciones de trabajo modestas.
- Prototipado rapido en llama.cpp/Ollama: al estar en GGUF con imatrix, se integra directamente en pipelines de inferencia local sin necesidad de GPU dedicada, usando CPU o GPUs integradas.
- Analisis de sesgos y contenido: util para auditar que tipo de contenido genera un modelo sin alineacion, como paso previo al diseno de filtros o politicas de moderacion.
- Educacion e investigacion academica: estudio comparativo de la degradacion de calidad entre cuantizaciones IQ1/IQ2 y Q5/Q6 sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada segun tamano de archivo GGUF):
  - IQ1_S (3,4 GB): ~4 GB de VRAM o RAM.
  - IQ2_M (3,9 GB): ~4,5 GB.
  - IQ3_M (4,8 GB): ~5,5 GB.
  - Q4_K_M (5,4 GB): ~6 GB; recomendado para GPUs de 8 GB.
  - Q5_K_M (5,8 GB): ~6,5 GB.
  - Q6_K: ~7 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (holgada); A100/H100 solo si se busca throughput alto en batch.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con cuantizaciones IQ2/IQ3, hasta RTX 4090 con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa (requeririan el modelo base en safetensors).
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-QAT-SOMPOA-heresy-i1-GGUF (este) | 7,46B | no disponible | apache-2.0 (enlace a Gemma 4) | GGUF | Abliterated, solo ingles, cuantizaciones imatrix |
| Gemma 4 E4B-it original (Google) | ~7-8B (segun familia) | no disponible | Gemma license | safetensors, GGUF | Alineado, rechaza contenido sensible, multilingue |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF | Base solida, amplio ecosistema de fine-tunes |
| Qwen 2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |

La comparativa se limita a caracteristicas estructurales; no hay datos de benchmarks para este modelo que permitan comparar rendimiento real.

## Limitaciones y advertencias

- El proceso de abliteration puede degradar capacidades generales (razonamiento, codigo, instruction following) respecto al Gemma 4 original; no hay evaluaciones publicadas que cuantifiquen esta perdida.
- Riesgo elevado de generar contenido danino, ofensivo o inexacto al haberse reducido los rechazos; no apto para produccion orientada al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a modelos de ~7B, agravado por cuantizaciones agresivas (IQ1/IQ2).
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Ambiguedad de licencia: se declara apache-2.0 pero el `license_link` apunta a los terminos de Gemma 4 de Google, que imponen restricciones de uso comercial y de redistribucion; conviene verificar antes de uso en produccion.
- Al ser un derivado no oficial de Gemma, no cuenta con el respaldo ni las garantias de Google.
- Las cuantizaciones por debajo de Q4 pierden calidad de forma notable; mradermacher mismo advierte "very low quality" en Q2_K_S y "for the desperate" en IQ1_S.
- No se documentan capacidades de tool calling, agentes ni vision; asumir su ausencia en produccion.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/gemma-4-E4B-it-QAT-SOMPOA-heresy-i1-GGUF
- Modelo base: https://huggingface.co/MuXodious/gemma-4-E4B-it-QAT-SOMPOA-heresy
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/gemma-4-E4B-it-QAT-SOMPOA-heresy-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#gemma-4-E4B-it-QAT-SOMPOA-heresy-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
