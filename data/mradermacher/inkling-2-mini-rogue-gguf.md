# mradermacher/Inkling-2-Mini-ROGUE-GGUF

## Resumen

Inkling-2-Mini-ROGUE-GGUF es la distribucion en formato GGUF del modelo carsenk/Inkling-2-Mini-ROGUE, publicada por el cuantizador mradermacher. Se trata de un modelo conversacional de arquitectura Mixture-of-Experts (MoE) con 26.070.385.152 parametros totales (segun los pesos en safetensors del repositorio base) y etiquetado por el autor como "abliterated", es decir, una variante a la que se le ha aplicado la tecnica de abliteration para reducir los rechazos en respuestas conversacionales. El modelo base incorpora ademas un adaptador multimodal (mmproj), lo que sugiere capacidades de vision.

La relevancia de esta publicacion es practica: mradermacher ofrece una bateria completa de cuantizaciones estaticas (desde Q2_K de 11 GB hasta Q8_0 de 27,9 GB, mas IQ4_XS) que permiten ejecutar un modelo de 26.000 millones de parametros en hardware de consumo mediante llama.cpp y derivados. El repositorio ocupa 190,5 GB en total por acumular todas las variantes.

La licencia es Apache 2.0, lo que facilita el uso comercial, pero el modelo solo declara soporte para ingles y no se han publicado resultados de benchmarks en la informacion disponible. El pipeline no esta especificado y la model card del cuantizador es puramente tecnica (generada por su herramienta de conversion), sin detalles sobre entrenamiento o evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), segun tags del autor; detalles de capas no disponibles |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors |
| Tamano del repositorio | 190,5 GB (todas las cuantizaciones) |
| Modelo base | carsenk/Inkling-2-Mini-ROGUE |
| Etiquetas destacadas | inkling2, nvfp4, mixture-of-experts, rogue, abliterated, conversational |

## Arquitectura y entrenamiento

El modelo base se etiqueta como Mixture-of-Experts y como "nvfp4", lo que indica que el checkpoint original emplea cuantizacion NVFP4 (formato de 4 bits de NVIDIA) en al menos parte de sus pesos. La etiqueta "abliterated" indica que se ha aplicado abliteration, una tecnica de edicion de pesos que elimina direcciones de activacion asociadas al rechazo para producir un modelo mas permisivo en respuestas conversacionales. La etiqueta "rogue" aparece tanto en el nombre como en los tags, sin que la informacion disponible aclare su significado tecnico exacto.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones de decodificacion. La presencia de un adaptador multimodal (mmproj) en el repositorio GGUF indica que el modelo base incluye un proyector de vision, aunque la model card no detalla la arquitectura del encoder visual. Tampoco se especifica la longitud de contexto ni el numero de expertos activos por token.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, orientada a dialogos sin rechazos por abliteration.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que habilita entrada de imagenes en llama.cpp con el proyector correspondiente.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: limitado a ingles segun el campo `language`.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue local de un modelo conversacional de 26.000 millones de parametros: con la cuantizacion Q4_K_M (17,6 GB) se puede ejecutar en una GPU de consumo con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama, lo que permite mantener conversaciones privadas sin depender de APIs externas.
- Prototipado de asistentes conversacionales sin filtros estrictos: la naturaleza abliterated del modelo lo hace adecuado para experimentar con personajes, narrativa o role-play donde los rechazos por defecto resultan problematicos, siempre con las advertencias de seguridad correspondientes.
- Analisis de imagenes en local: cargando el fichero mmproj junto con la cuantizacion principal, se pueden procesar imagenes y mantener dialogos sobre ellas en entornos sin conexion, util para documentacion tecnica o inspeccion visual de capturas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de Q2_K frente a Q8_0 en perplejidad y calidad conversacional sobre el mismo modelo base.
- Investigacion sobre abliteration: util para estudiar como afecta la eliminacion de direcciones de rechazo al comportamiento del modelo en tareas sensibles, comparando con el modelo base original.
- Fine-tuning sobre la variante f16 o Q8_0: aunque el repositorio es de inferencia, los pesos de mayor calidad (Q8_0, 27,9 GB) sirven como referencia para validar adaptaciones o destilaciones sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,0 GB
  - Q3_K_M: ~13,8 GB
  - IQ4_XS: ~14,9 GB
  - Q4_K_M: ~17,6 GB (recomendado por el autor como rapido)
  - Q5_K_M: ~20,0 GB
  - Q6_K: ~23,6 GB
  - Q8_0: ~27,9 GB
  - mmproj adicional: ~0,4 GB (Q8_0) o ~0,7 GB (f16)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con margen para contexto; A100 40 GB o H100 para Q6_K/Q8_0 y contextos largos; RTX 3090 (24 GB) valida para Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; Q5_K_M requiere ajustar el contexto o usar offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y el numero de expertos activos, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-ROGUE (este) | 26,07 B (MoE) | no disponible | GGUF, safetensors | Apache 2.0 | Abliterated, multimodal via mmproj, solo ingles |
| carsenk/Inkling-2-Mini-ROGUE | 26,07 B (MoE) | no disponible | safetensors (nvfp4) | Apache 2.0 | Modelo base sin cuantizar |
| mradermacher/Inkling-2-Mini-ROGUE-i1-GGUF | 26,07 B (MoE) | no disponible | GGUF (imatrix) | Apache 2.0 | Variante con cuantizaciones ponderadas/imatrix del mismo modelo |

No se dispone de informacion sobre modelos alternativos de la misma categoria con los que comparar rendimiento, ya que no hay benchmarks publicados para este modelo.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo `language`; el rendimiento en castellano no esta garantizado ni evaluado.
- La abliteration elimina mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado sin aviso; no es adecuado para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- No se han publicado benchmarks, por lo que no hay evidencia objetiva de calidad frente a alternativas.
- La longitud de contexto es desconocida; planificar el despliegue sin asumir ventanas largas.
- El formato NVFP4 del checkpoint base puede introducir perdida de precision respecto a un entrenamiento en BF16/FP16; las cuantizaciones GGUF anaden una segunda capa de perdida, especialmente en Q2_K y Q3_K_S.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base no ofrece garantias ni documentacion sobre el dataset de entrenamiento, lo que complica la evaluacion de riesgos legales.
- El repositorio ocupa 190,5 GB; descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-ROGUE-GGUF
- Modelo base: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Inkling-2-Mini-ROGUE-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Inkling-2-Mini-ROGUE-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
