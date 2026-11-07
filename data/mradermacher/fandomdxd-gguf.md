# mradermacher/FandomDxd-GGUF

## Resumen

FandomDxd-GGUF es la distribucion en formato GGUF del modelo Tokerss/FandomDxd, publicada por mradermacher, un conocido colaborador de la comunidad que se dedica a cuantizar modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original es un ajuste fino (SFT) de una base Mistral, con 12.247.782.400 parametros totales, entrenado mediante la libreria Unsloth y TRL, y orientado a generacion de texto conversacional en ingles.

La relevancia de esta ficha radica en que el repositorio GGUF permite ejecutar un modelo de aproximadamente 12.000 millones de parametros en hardware de consumo mediante cuantizaciones que van desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). El modelo base esta etiquetado como derivado de Mistral y emplea una licencia Apache 2.0, lo que facilita su uso comercial sin las restricciones de otras licencias de modelos abiertos.

No se dispone de informacion publica sobre el dataset de entrenamiento, el numero de tokens utilizados ni los resultados de benchmarks del modelo original. La model card del repositorio GGUF se limita a listar las cuantizaciones disponibles y a remitir a la documentacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, segun tags del repositorio) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo original Tokerss/FandomDxd es un ajuste fino supervisado (SFT) construido sobre una base Mistral, segun los tags del repositorio (`mistral`, `unsloth`, `trl`, `sft`). El uso de Unsloth sugiere que el entrenamiento se realizo con tecnicas de optimizacion de memoria y velocidad, habituales en ajustes finos de bajo coste. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO posteriores al SFT.

La arquitectura subyacente es un transformer decoder-only con atencion causal estandar, coherente con la familia Mistral. El repositorio GGUF no documenta innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La cuantizacion se ha realizado con el formato GGUF de llama.cpp, incluyendo variantes K-quant e IQ-quant, y el autor remite a una version con imatrix (FandomDxd-i1-GGUF) para cuantizaciones ponderadas de mayor calidad.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte para dialogos multi-turno.
- Ajuste fino orientado a dominio tematico (el nombre "FandomDxd" sugiere contenido de fandom, probablemente relacionado con High School DxD), lo que puede implicar un sesgo hacia ese tipo de contenido.
- Compatibilidad con text-generation-inference y transformers, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de ficcion y contenido creativo en ingles: el modelo esta ajustado sobre un dominio de fandom, por lo que puede emplearse para continuar historias, generar dialogos de personajes o crear contenido derivado de universos ficticios, aprovechando su especializacion tematica.
- Prototipado de chatbots tematicos: al ser un modelo de 12B con cuantizaciones ligeras (Q4_K_M de 7,6 GB), permite desplegar un asistente conversacional especializado en un personaje o universo concreto en una sola GPU de consumo.
- Experimentacion con ajuste fino y cuantizacion: sirve como caso de estudio para investigadores que quieran reproducir el pipeline Unsloth + TRL + GGUF, comparando la calidad entre cuantizaciones K-quant e IQ-quant.
- Evaluacion de calidad de cuantizaciones: el repositorio ofrece once variantes de cuantizacion, lo que permite medir el impacto de la compresion en la perplejidad y la coherencia del modelo en tareas de generacion libre.
- Despliegue local con llama.cpp u Ollama: gracias a los ficheros GGUF, el modelo puede ejecutarse en estaciones de trabajo sin GPU dedicada, usando el backend CPU de llama.cpp, para tareas de generacion de texto sin requisitos de latencia estrictos.
- Investigacion sobre sesgos en modelos ajustados a dominios de fandom: el modelo permite estudiar como el ajuste fino sobre un corpus tematico concreto afecta a la diversidad de respuestas y a la tendencia a la alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): entre 4,9 GB (Q2_K) y 13,1 GB (Q8_0); la cuantizacion recomendada Q4_K_M ocupa 7,6 GB.
- Con overhead de contexto y cache KV, se recomienda al menos 10-12 GB de VRAM para Q4_K_M y 16 GB para Q8_0.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando Q4_K_S o Q4_K_M; en GPUs de 6 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (para el modelo base en safetensors), transformers con el modelo original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FandomDxd-GGUF | 12,2B | no disponible | Apache 2.0 | GGUF | Ajuste fino tematico en ingles |
| Mistral Nemo Base | 12B | 128k (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Base generalista, no especializada |
| Mistral 7B Instruct | 7,3B | 32k (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Menor tamano, menor capacidad |
| Llama 3.1 8B Instruct | 8B | 128k (segun documentacion publica de Meta) | Llama 3.1 Community License | safetensors, GGUF | Licencia mas restrictiva |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de FandomDxd que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Al ser un ajuste fino sobre un dominio de fandom, puede presentar sesgos tematicos, repeticiones de estilo y una diversidad limitada fuera de ese dominio.
- Riesgo de alucinacion elevado en tareas factuales, ya que no se documenta un entrenamiento orientado a veracidad ni evaluaciones de fidelidad.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos de contenido, toxicidad o propiedad intelectual.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar influido por material con derechos de autor del dominio de fandom; se recomienda revision legal antes de explotacion comercial.
- No se documentan capacidades de tool calling, agentes ni contexto largo; no debe asumirse su disponibilidad en produccion.
- El repositorio GGUF tiene un numero muy bajo de descargas (102) y cero likes, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FandomDxd-GGUF
- Modelo base: https://huggingface.co/Tokerss/FandomDxd
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/FandomDxd-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#FandomDxd-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher/models
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
