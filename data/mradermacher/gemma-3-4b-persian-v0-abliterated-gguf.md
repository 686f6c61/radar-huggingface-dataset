# mradermacher/gemma-3-4b-persian-v0-abliterated-GGUF

## Resumen

`mradermacher/gemma-3-4b-persian-v0-abliterated-GGUF` es una distribucion de cuantizaciones GGUF del modelo `mshojaei77/gemma-3-4b-persian-v0-abliterated`, un derivado de Gemma 3 de 4B parametros afinado para persa y posteriormente sometido a un proceso de "abliteration" (eliminacion de rechazos). El autor de la cuantizacion es mradermacher, conocido por publicar versiones GGUF de modelos de la comunidad para su uso con llama.cpp y entornos de inferencia local.

El modelo base conserva la arquitectura transformer de Gemma 3 con aproximadamente 3.880 millones de parametros y capacidad multimodal (existen ficheros `mmproj` para el proyector visual). La model card no documenta el contexto, los datos de entrenamiento ni los hiperparametros del afinado, por lo que muchos detalles tecnicos deben tratarse como no disponibles.

Su relevancia practica radica en que permite ejecutar localmente un modelo de ~4B con supuesta competencia en persa y sin las capas de rechazo habituales, en formatos que van de 1,8 GB (Q2_K) a 7,9 GB (f16). Es una opcion para experimentacion con cuantizacion agresiva en hardware de consumo, aunque con caveats importantes de licencia y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3), con proyector multimodal mmproj |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos); el nombre del modelo sugiere persa, no confirmado en la card |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 3 de 4B parametros, una arquitectura transformer densa con atencion por ventanas deslizantes y atencion global intercalada, tal como corresponde a la familia Gemma 3. El repositorio GGUF incluye ficheros `mmproj` (proyector multimodal) que habilitan el procesamiento de imagenes en llama.cpp, lo que confirma que el modelo base conserva la torre de vision de Gemma 3.

Sobre el entrenamiento del derivado no hay informacion en la model card: no se documentan el numero de tokens de afinado, la composicion del dataset persa, ni si se aplico RLHF o DPO. El termino "abliterated" indica que se ha realizado una intervencion sobre las direcciones de rechazo (tipicamente mediante ortogonalizacion de pesos en capas concretas) para eliminar respuestas de negativa, pero la card no describe el metodo. El tag `mergekit` sugiere que pudo construirse mediante fusion de modelos, aunque tampoco se detalla.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de imagenes a traves del proyector multimodal incluido (mmproj Q8_0 y f16).
- Afinado especifico para persa segun el nombre del modelo base (no verificado en la card).
- Comportamiento sin rechazos ("abliterated"), lo que implica menor tendencia a declinar peticiones.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como API.
- Soporte de tool calling y function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no documentadas.

## Casos de uso

- Experimentacion con cuantizacion agresiva: los ficheros Q2_K (1,8 GB) y Q3_K_S (2,0 GB) permiten probar el comportamiento del modelo en GPUs con 4 GB de VRAM o en CPU, evaluando la degradacion de calidad frente a Q4_K_M.
- Inferencia local en portatiles: la cuantizacion Q4_K_M (2,6 GB) cabe en GPUs integradas o en CPU con 8 GB de RAM, permitiendo un asistente conversacional offline.
- Prototipado de aplicaciones en persa: si el afinado funciona como sugiere el nombre, sirve para validar flujos de chat en persa antes de invertir en modelos mayores.
- Investigacion sobre abliteration: util para estudiar como afecta la eliminacion de rechazos a la calidad general y a la seguridad del modelo en tareas sensibles.
- Procesamiento de imagenes en local: con el proyector mmproj y una cuantizacion Q4 o superior, se pueden hacer descripciones de imagenes o VQA en hardware modesto.
- Despliegue en entornos sin conectividad: al ser GGUF, se integra en llama.cpp, Ollama o LM Studio para escenarios air-gapped.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que facilita medir perplexity y calidad por tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~2,5 GB
  - Q3_K_M: ~3 GB
  - Q4_K_M: ~3,5 GB
  - Q5_K_M: ~4 GB
  - Q6_K: ~4,5 GB
  - Q8_0: ~5,5 GB
  - f16: ~9 GB
- GPUs recomendadas: RTX 3060 12 GB o superior para Q6_K y Q8_0; RTX 4090 o A100/H100 solo si se busca maxima velocidad con f16 o lotes grandes.
- Cabe en GPU de consumo: si, desde una GTX 1650 4 GB con Q2_K hasta cualquier GPU de 8 GB o mas con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-4b-persian-v0-abliterated-GGUF (este) | 3,88B | no disponible | no disponible | GGUF | Afinado persa + abliteration, multimodal |
| google/gemma-3-4b-it | ~4B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | Modelo oficial, con rechazos y sin afinado persa |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa multilingue con licencia permisiva |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Buen contexto y tool calling nativo |

La comparativa se limita a datos publicos de cada modelo; no hay benchmarks del modelo evaluado para contrastar calidad.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use, que imponen restricciones de redistribucion y uso.
- El proceso de abliteration elimina rechazos de seguridad, lo que incrementa el riesgo de generar contenido danino, sesgado o ilegal; no es apto para produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion: es un modelo de 4B afinado sobre una base pequena, sin benchmarks publicados que validen su fiabilidad.
- El idioma declarado en los metadatos es `en`, aunque el nombre indique persa; el soporte real de persa no esta verificado.
- La longitud de contexto no esta documentada; no se debe asumir la ventana nativa de Gemma 3 sin comprobacion empirica.
- No hay cuantizaciones imatrix/weighted disponibles segun la card, lo que puede reducir la calidad en cuantizaciones bajas (Q2, Q3) frente a alternativas.
- El tag `mergekit` sugiere una fusion, pero no se documenta el proceso; la reproducibilidad es limitada.
- El repositorio ocupa 37,3 GB por incluir todas las variantes; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-4b-persian-v0-abliterated-GGUF
- Modelo base: https://huggingface.co/mshojaei77/gemma-3-4b-persian-v0-abliterated
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-4b-persian-v0-abliterated-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
