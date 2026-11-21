# mradermacher/LFM3-Omni-2B-Looped-Latent-v2.1-GGUF

## Resumen

LFM3-Omni-2B-Looped-Latent-v2.1-GGUF es una cuantizacion estatica en formato GGUF del modelo base Guilherme34/LFM3-Omni-2B-Looped-Latent-v2.1, publicada por el usuario mradermacher. El modelo base pertenece a la familia LFM3 Omni de 2B parametros, con un total real de 2.702.390.080 parametros segun los pesos en safetensors, y esta disenado para tareas conversacionales multimodales (el repositorio incluye ficheros mmproj, lo que indica soporte de entrada de imagen o audio junto al texto). La cuantizacion la realiza mradermacher, un publicador habitual de versiones GGUF de modelos open source, no el autor original del modelo.

El interes practico de esta publicacion es que permite ejecutar un modelo multimodal de ~2,7B parametros en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con un rango amplio de cuantizaciones que van desde Q2_K (1,2 GB) hasta f16 (5,5 GB), mas los ficheros mmproj necesarios para el procesamiento multimodal. El modelo esta etiquetado unicamente para ingles y la licencia no esta declarada en la informacion disponible, lo que constituye una limitacion relevante para uso comercial.

No se dispone de informacion publicada sobre arquitectura interna, contexto, datos de entrenamiento ni benchmarks en la informacion proporcionada; esta ficha se limita a los datos verificables del repositorio y advierte explicitamente alli donde el dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 Omni; transformer multimodal presumiblemente, sin confirmar) |
| Parametros totales | 2.702.390.080 (~2,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repo | 25,9 GB |
| Modelo base | Guilherme34/LFM3-Omni-2B-Looped-Latent-v2.1 |
| Cuantizador | mradermacher |
| Descargas | 828 |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base en la informacion disponible. El nombre del modelo ("Looped-Latent") sugiere algun tipo de mecanismo de capas recurrentes o latentes compartidas, pero no hay documentacion que lo confirme. La presencia de ficheros mmproj en el repositorio GGUF indica que el modelo base incorpora un proyector multimodal, por lo que cabe esperar entrada de imagen o audio ademas de texto, aunque no se especifica que modalidades exactas ni como se combinan con el decodificador de texto.

Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor del modelo base (Guilherme34) no aporta esa informacion en la model card citada, que corresponde integramente al trabajo de cuantizacion de mradermacher. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), necesarios para cargar el proyector multimodal en llama.cpp; la modalidad exacta (vision, audio o ambas) no esta documentada en la informacion disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Ejecucion local via llama.cpp y ecosistema GGUF (Ollama, LM Studio, llama-cpp-python).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, vision, audio: no confirmado mas alla de la presencia del proyector multimodal.

## Casos de uso

- Prototipado local de asistentes conversacionales multimodales: con la cuantizacion Q4_K_M (1,8 GB) el modelo cabe en GPUs de consumo de 4-8 GB de VRAM, lo que permite montar un chatbot con entrada de imagen en un portatil para pruebas de concepto sin coste de API.
- Experimentacion con modelos pequenos en investigacion: el rango de cuantizaciones (de Q2_K a f16) permite estudiar el impacto de la cuantizacion en la calidad de salida de un modelo multimodal de ~2,7B, comparando variantes con el mismo prompt.
- Despliegue en entornos con recursos limitados: la version Q2_K (1,2 GB) o Q3_K_S (1,4 GB) permite ejecutar inferencia en CPU o en GPUs integradas, adecuado para demos offline o dispositivos edge donde no cabe un modelo mayor.
- Integracion en pipelines de procesamiento de documentos con imagen: usando el fichero mmproj junto con una cuantizacion Q5_K_M o Q6_K, se puede alimentar el modelo con capturas o imagenes y obtener descripciones o respuestas en ingles, siempre que la tarea no requiera alta precision.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de pesos mas dos proyectores, lo que facilita medir perplejidad y latencia por cuantizacion en un mismo hardware antes de fijar una version para produccion.
- Base para fine-tuning o destilacion posterior: al estar disponible el modelo base en safetensors (via Guilherme34), se puede partir de el para ajuste con LoRA y luego cuantizar de nuevo a GGUF con el flujo de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni el proyector multimodal):
  - Q2_K: ~1,2 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~1,4-1,6 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~1,6-1,8 GB
  - Q5_K_S / Q5_K_M: ~2,0 GB
  - Q6_K: ~2,3 GB
  - Q8_0: ~3,0 GB
  - f16: ~5,5 GB
- Proyector multimodal adicional: mmproj-Q8_0 (~0,6 GB) o mmproj-f16 (~1,0 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para f16 y para mayor margen de contexto y batch.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas desde 4 GB de VRAM con Q4_K_M; en CPU es viable con Q2_K-Q4_K_S.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia) de este modelo que permitan una comparacion rigurosa. Se ofrece una comparacion estructural con alternativas de tamano similar en formato GGUF:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Looped-Latent-v2.1 (este) | ~2,7B | no disponible | no disponible | GGUF + safetensors | Multimodal (mmproj), solo ingles |
| Gemma 2 2B (Google) | ~2,6B | 8K | Gemma license | GGUF + safetensors | Texto, multilingue, ampliamente testeado |
| Qwen2.5 3B (Alibaba) | ~3,1B | 32K | Apache 2.0 | GGUF + safetensors | Texto, multilingue, tool calling |
| Phi-3 Mini (Microsoft) | ~3,8B | 4K-128K | MIT | GGUF + safetensors | Texto, razonamiento, ingles centrico |

La comparacion es estructural: no hay benchmarks publicados de este modelo que permitan afirmar superioridad o inferioridad en calidad frente a las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; verificar la licencia del modelo base (Guilherme34/LFM3-Omni-2B-Looped-Latent-v2.1) antes de cualquier despliegue en produccion.
- Solo ingles: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Modelo de 2,7B parametros: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos de 7B o superiores; riesgo elevado de alucinacion en tareas de conocimiento especializado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad; cualquier decision de adopcion deberia basarse en evaluacion propia.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; el propio autor recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad.
- Multimodalidad no documentada en detalle: se desconoce que modalidades soporta exactamente el proyector mmproj y con que calidad.
- Repositorio de 25,9 GB: incluye todas las cuantizaciones; descargar solo los ficheros necesarios para no saturar el disco.
- Sin informacion sobre sesgos: no hay documentacion sobre el dataset de entrenamiento ni evaluaciones de sesgo.
- Modelo base de autor individual: menor garantia de mantenimiento, soporte y actualizaciones que modelos de laboratorios consolidados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-Omni-2B-Looped-Latent-v2.1-GGUF
- Modelo base: https://huggingface.co/Guilherme34/LFM3-Omni-2B-Looped-Latent-v2.1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/LFM3-Omni-2B-Looped-Latent-v2.1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LFM3-Omni-2B-Looped-Latent-v2.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
