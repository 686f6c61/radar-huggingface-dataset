# mradermacher/Darwin-Darwin-27B-Opus-x-QuettaLLMs-27B-Korea-08274-GGUF

## Resumen

Darwin-Darwin-27B-Opus-x-QuettaLLMs-27B-Korea-08274 es un modelo de lenguaje de aproximadamente 26.900 millones de parametros (26.895.998.464 exactos segun los pesos en safetensors) resultante de un merge evolutivo entre dos modelos de la familia Darwin de SeaWolf-AI: Darwin-27B-Opus y QuettaLLMs-27B-Korea. La ficha que nos ocupa corresponde a la version cuantizada en GGUF publicada por mradermacher, un especialista reconocido en la conversion de pesos a formatos de inferencia local.

El modelo base emplea una tecnica de fusion denominada darwin-v6, basada en evolutionary merge con guiado por MRI y SLERP, orientada a combinar las capacidades de dos modelos afinados sobre dominios distintos. El resultado es un modelo de tipo conversational, con licencia Apache 2.0 y declarado unicamente para ingles, pensado para su uso en entornos de inferencia local mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que mradermacher ofrece hasta once variantes de cuantizacion (desde Q2_K hasta Q8_0) que permiten ejecutar un modelo de casi 27.000 millones de parametros en hardware de consumo, algo imposible con los pesos originales en precision completa. No obstante, la informacion publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es practicamente inexistente, lo que limita la evaluacion rigurosa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles); merge evolutivo darwin-v6 con SLERP y guiado por MRI |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base se distribuye en safetensors |
| Tamano del repo | 186,3 GB |
| Libreria | transformers (etiquetado), inferencia via llama.cpp |
| Descargas / likes | 97 descargas, 7 likes |

## Arquitectura y entrenamiento

El modelo base es el resultado de un proceso de fusion de modelos (model merging) denominado darwin-v6, que combina Darwin-Darwin-27B-Opus con QuettaLLMs-27B-Korea-08274. Las etiquetas de la model card indican el uso de evolutionary merge, guiado por MRI (probablemente criterios de evaluacion multi-metria o multi-referencia) y SLERP como metodo de interpolacion de pesos. No se especifica la arquitectura interna de los modelos de partida (numero de capas, dimension oculta, tipo de atencion) ni si se trata de un transformer denso convencional o de una variante con atencion lineal u otras optimizaciones.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o fine-tuning supervisado, ni sobre innovaciones tecnicas adicionales como decodificacion especulativa. La unica informacion tecnica verificable es el proceso de cuantizacion realizado por mradermacher: cuantizaciones estaticas (no imatrix ni ponderadas), con conversion desde pesos Hugging Face y vocabulario estandar. El autor indica que las cuantizaciones con imatrix no estan disponibles en el momento de publicacion y que podrian solicitarse mediante una discusion en la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado de los modelos de partida (no verificado con benchmarks).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible; dependen de las capacidades de los modelos fusionados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque los modelos de partida podrian tener cobertura adicional no declarada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, etc.).

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse en estaciones de trabajo con GPU de consumo usando la cuantizacion Q4_K_M (16,6 GB), adecuada para dialogos multi-turno con contexto moderado sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones LLM: gracias a la licencia Apache 2.0 y a la disponibilidad de cuantizaciones ligeras (Q2_K de 10,8 GB), es posible integrar el modelo en entornos de desarrollo con recursos limitados para validar flujos conversacionales antes de migrar a modelos mayores.
- Experimentacion con tecnicas de model merging: el modelo sirve como caso de estudio para investigadores interesados en evaluar la calidad de fusiones evolutivas con SLERP y guiado por MRI, comparando su comportamiento con los modelos originales.
- Generacion de texto creativo y redaccion asistida en ingles: la naturaleza conversacional del modelo permite tareas de escritura, resumen y reescritura, ejecutables en local para preservar la privacidad de los datos.
- Despliegue en entornos con requisitos de soberania del dato: al poder ejecutarse integramente en hardware propio mediante llama.cpp, es apto para organizaciones que no pueden enviar informacion a APIs externas.
- Educacion e investigacion: util como modelo de referencia para estudiar el impacto de la cuantizacion en la calidad de salida (comparando Q2_K frente a Q8_0) en un modelo de ~27B.
- Base para fine-tuning posterior: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes especificos, aunque requeriria los pesos originales en safetensors y hardware de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- GPU recomendadas:
  - Q4_K_M / Q5_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 40 GB con margen para contexto.
  - Q6_K / Q8_0: A100 40 GB, H100 80 GB o configuraciones multi-GPU.
  - Cuantizaciones Q2_K–Q3_K: viables en GPUs de 12–16 GB (RTX 4070 Ti, RTX 4080) con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o superiores; en GPUs de 12–16 GB solo con cuantizaciones bajas y contexto limitado. Tambien es posible la ejecucion parcial en CPU+GPU (offloading) con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darwin-Darwin-27B-Opus-x-QuettaLLMs-27B-Korea-08274 (este) | ~26,9 B | No disponible | Apache 2.0 | GGUF / safetensors | Merge evolutivo darwin-v6; solo ingles declarado |
| Modelo base Darwin-27B-Opus (SeaWolf-AI) | ~27 B (estimado) | No disponible | No disponible en esta ficha | safetensors | Uno de los progenitores del merge |
| QuettaLLMs-27B-Korea-08274 | ~27 B (estimado) | No disponible | No disponible en esta ficha | safetensors | Segundo progenitor del merge |
| Mistral Small 24B (referencia de tamano similar) | 24 B | 32k–128k segun version | Apache 2.0 | safetensors / GGUF | Modelo denso con benchmarks publicos y soporte multilingue |

La comparacion con alternativas consolidadas como Mistral Small o Qwen 2.5 32B es dificil por la ausencia de benchmarks publicados para este merge. La principal ventaja diferencial es la disponibilidad de cuantizaciones GGUF listas para usar; la principal desventaja es la falta de documentacion tecnica y de evaluaciones verificables.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del modelo frente a sus progenitores ni frente a alternativas consolidadas.
- Idiomas: la model card declara unicamente ingles; el uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin pruebas previas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones publicadas no hay estimacion de su magnitud.
- Sesgos: no documentados; al ser un merge de modelos afinados sin informacion sobre sus datasets, los sesgos de los progenitores se heredan sin control conocido.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los modelos de partida no impongan restricciones adicionales (la ficha no las detalla).
- Cuantizaciones estaticas sin imatrix: mradermacher indica que las versiones ponderadas no estan disponibles, lo que puede suponer una perdida de calidad superior a la habitual en cuantizaciones bajas (Q2_K, Q3_K_S).
- Naturaleza experimental: los merges evolutivos no garantizan coherencia interna; pueden aparecer degradaciones en tareas especificas no evaluadas.
- Repositorio de gran tamano (186,3 GB): requiere planificacion de almacenamiento y ancho de banda para descargar todas las variantes.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Darwin-Darwin-27B-Opus-x-QuettaLLMs-27B-Korea-08274-GGUF
- Modelo base en Hugging Face: https://huggingface.co/SeaWolf-AI/Darwin-Darwin-27B-Opus-x-QuettaLLMs-27B-Korea-08274
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Darwin-Darwin-27B-Opus-x-QuettaLLMs-27B-Korea-08274-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
