# mradermacher/DaisyRose-27B-Heretic-v2-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-GGUF es una coleccion de cuantizaciones GGUF del modelo base DaisyRose-27B-Heretic-v2, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original, alojado por kelsey1337, es un derivado de la familia Qwen (etiquetado como "qwen3.8" en los tags) con aproximadamente 26.900 millones de parametros, afinado mediante tecnicas de "abliteration" o "heretic" que buscan eliminar los mecanismos de rechazo y censura del modelo original.

La relevancia de esta publicacion radica en que facilita el despliegue del modelo en hardware de consumo mediante el formato GGUF, compatible con llama.cpp, Ollama y otras herramientas de inferencia local. El repositorio incluye cuantizaciones estaticas desde Q2_K hasta Q8_0 y F16, ademas de suplementos multimodales (mmproj) en Q8_0 y F16, lo que sugiere que el modelo base incorpora capacidades de vision.

Se trata de un modelo de nicho orientado a usos sin restricciones de contenido, con licencia Apache 2.0, soporte unicamente en ingles y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen, segun tag "qwen3.8"); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj en Q8_0 y F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los tags indican que deriva de la familia Qwen (etiqueta "qwen3.8"), lo que sugiere una arquitectura transformer densa con los componentes habituales de dicha familia (atención con RoPE, capas normalizadas, etc.), pero no se confirma ningun detalle especifico como el tipo de atencion, la composicion del dataset de entrenamiento ni el numero de tokens utilizados.

El rasgo distintivo del modelo es su condicion de "heretic" y "abliterated": el modelo base ha sido sometido a un proceso de abliteration, una tecnica que identifica y neutraliza las direcciones del espacio de activaciones asociadas al rechazo de peticiones, con el objetivo de eliminar los comportamientos de negativa del modelo alineado original. No se documenta en la informacion disponible si hubo fases adicionales de RLHF, DPO u otro tipo de ajuste, ni se detalla la innovacion tecnica concreta aplicada por el autor del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo habituales del modelo alineado original (comportamiento "uncensored").
- Capacidades multimodales: la presencia de ficheros mmproj en el repositorio indica soporte de entrada de imagenes (vision), aunque no se detalla el alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del modelo alineado original, util para analizar que comportamientos de rechazo se eliminan y cuales persisten.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o sensibles que los modelos alineados rechazarian, desplegable localmente con llama.cpp u Ollama.
- Prototipado de personajes conversacionales: el modelo puede integrarse en aplicaciones de rol o compania virtual donde se requiere un tono sin filtros, ejecutandose en una sola GPU de consumo con cuantizaciones Q4_K_M.
- Analisis de contenido multimodal: gracias a los suplementos mmproj, puede emplearse para describir o interpretar imagenes en pipelines locales, aunque el soporte de vision no esta documentado en detalle.
- Evaluacion de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a F16), lo que permite medir el impacto de la compresion en la calidad de un modelo de ~27B en distintos presupuestos de VRAM.
- Despliegue en entornos aislados: al ser GGUF y Apache 2.0, puede ejecutarse en maquinas sin conexion para tareas de generacion de texto en ingles donde la licencia permisiva es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~26,9B parametros):
  - F16: ~54 GB (no cabe en GPU de consumo).
  - Q8_0: ~29 GB.
  - Q6_K: ~22 GB.
  - Q5_K_M: ~19 GB.
  - Q4_K_M: ~16-17 GB.
  - Q3_K_M: ~13-14 GB.
  - Q2_K: ~10-11 GB.
- GPU recomendadas: A100 40/80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) para Q5_K_M y Q4_K_M; RTX 3090 (24 GB) para Q4_K_M; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para Q3_K_M o Q4_K_S con offloading parcial.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores en tarjetas de 16-24 GB; las cuantizaciones Q2_K y Q3_K_S permiten incluso configuraciones con 12 GB combinando RAM y VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; los suplementos mmproj requieren runtimes con soporte multimodal (por ejemplo, llama.cpp con `--mmproj`).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, vision via mmproj |
| Qwen2.5-32B-Instruct | 32,5B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alineado, multilingue, benchmarks publicos |
| Gemma-2-27B-it | 27B | 8K | Gemma license | safetensors, GGUF | Alineado, multilingue, restricciones de uso |
| Mistral-Small-24B-Instruct | 23,6B | 32K | Apache 2.0 | safetensors, GGUF | Alineado, multilingue, benchmarks publicos |

La comparativa se limita a tamano y licencia, ya que no hay datos de rendimiento del modelo evaluado. Frente a las alternativas alineadas, la diferencia principal es la ausencia de filtros de rechazo y la falta de benchmarks publicos que permitan verificar la degradacion de capacidades tras la abliteration.

## Limitaciones y advertencias

- Al ser un modelo abliterated, puede generar contenido ofensivo, ilegal o danino sin rechazo; no es adecuado para aplicaciones orientadas al publico sin capas de moderacion externas.
- No hay benchmarks publicados: se desconoce el impacto de la abliteration en tareas de razonamiento, codigo o matematicas, y es probable cierta degradacion respecto al modelo original.
- Soporte unicamente en ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificacion empirica.
- Riesgo de alucinacion no cuantificado; sin datos de evaluacion de fidelidad.
- La licencia Apache 2.0 del repositorio GGUF es permisiva, pero conviene verificar la licencia y condiciones del modelo base (kelsey1337/DaisyRose-27B-Heretic-v2) y del modelo Qwen subyacente antes de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validacion comunitaria ni evidencia de calidad.
- El soporte multimodal depende de los ficheros mmproj, cuya integracion y calidad no estan documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-GGUF
- Modelo base: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#DaisyRose-27B-Heretic-v2-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
