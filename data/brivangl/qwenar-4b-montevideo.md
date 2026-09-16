# brivangl/qwenar-4b-montevideo

## Resumen

`brivangl/qwenar-4b-montevideo` es un autoencoder de oraciones: comprime una frase completa en un unico vector de 2560 dimensiones y reconstruye la frase original a partir de ese vector. Lo desarrolla el autor independiente brivangl dentro del trabajo del equipo Montevideo de JetBrains, que aporto el computo (8 GPU H100 en bf16). No es un modelo de chat ni un generador de texto convencional: su etiqueta de pipeline es `feature-extraction` y su artefacto principal son los embeddings.

Tecnicamente es un hibrido de dos checkpoints abiertos ya existentes: el encoder es `perplexity-ai/pplx-embed-v1-4b` (un Qwen3 con la mascara causal desactivada, es decir, bidireccional, con mean-pooling sobre tokens no de relleno) y el decoder es `Qwen/Qwen3-0.6B-Base`. Ambos se conectan mediante un unico puente lineal aprendido (`EmbedToPrefix`, 2560 → K·d_model con K=4) y se adaptan con DoRA, en lugar de entrenar un modelo seq2seq desde cero como hace SONAR. El total son 4.629.008.896 parametros (9,3 GB en safetensors) y el conector aprendido ocupa unas 30 lineas de codigo.

Su relevancia es la de la familia de los Large Concept Models: si un vector de oracion es lo bastante fiel como para decodificarse de vuelta, ese vector puede sustituir al texto en razonamiento, memoria o compresion. En oraciones inglesas de SlimPajama no vistas, el autor reporta una reconstruccion del 99,6% caracter a caracter y 28 de 32 sondas de estres superadas. Es la version de dominio general de `brivangl/qwenar-0.6b`, que usaba una mezcla biomedica. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de un checkpoint muy reciente y sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de oraciones: encoder transformer bidireccional (Qwen3 con mascara causal desactivada) + puente lineal `EmbedToPrefix` + decoder transformer autorregresivo causal (Qwen3) |
| Parametros totales | 4.629.008.896 (4,63B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada formalmente; el entrenamiento acepta oraciones de 5 a 256 tokens (media 21,7; mediana 19; percentil 95 = 45). El ejemplo de generacion usa `max_new_tokens=64` |
| Dimension del embedding | 2560 |
| Tipos de cuantizacion | No disponible. La model card indica que el embedding del encoder se calcula sin tanh y sin INT8; no se publican pesos cuantizados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`, con `custom_code` y `trust_remote_code=True`) |
| Modelos base | `perplexity-ai/pplx-embed-v1-4b` (encoder), `Qwen/Qwen3-0.6B-Base` (decoder) |
| Dataset de entrenamiento | `cerebras/SlimPajama-627B` (oraciones en ingles) |
| Tamano del repositorio | 9,3 GB |
| Version de libreria requerida | `transformers>=5.15` (obligatorio) |

## Arquitectura y entrenamiento

El flujo es el siguiente: la oracion entra en el encoder `perplexity-ai/pplx-embed-v1-4b`, un Qwen3 al que se le desactiva la mascara causal para hacerlo bidireccional; se aplica mean-pooling sobre los tokens no de relleno (sin tanh ni INT8) y sale un vector de 2560 dimensiones, que es el artefacto persistente. Ese vector pasa por `EmbedToPrefix`: una capa `Linear(2560 → K·d_model)` con K=4, seguida de GELU, un `view(B, K, d_model)` y un `RMSNorm`, que produce un prefijo de 4 tokens. El decoder `Qwen/Qwen3-0.6B-Base` consume ese prefijo y genera la oracion con cross-entropy autorregresiva en modo teacher-forced, con etiquetas a -100 en el prefijo y en el relleno. Tanto el encoder (DoRA r=16, α=32, a una tasa de aprendizaje 10 veces menor) como el decoder (DoRA r=32, α=64 sobre q, k, v, o, gate, up, down) se adaptan; ninguno queda congelado.

El entrenamiento se hizo sobre oraciones en ingles segmentadas de SlimPajama: 9.169.225.926 oraciones (199.200 millones de tokens Qwen3) tras deduplicacion exacta y repaquetado por longitud. La ejecucion duro 1.000.000 de pasos de optimizador en 8×H100 con bf16, con un presupuesto de 2.304 tokens por lote (maximo 256 oraciones) y lotes homogeneos en longitud; vio aproximadamente el 9% del corpus (unos 0,83B de oraciones y 17.900 millones de tokens supervisados), por lo que nunca completo una pasada completa sobre los datos. Se uso ReLoRA con fusion y reinicializacion cada 100.000 pasos (10 ciclos), que provoca picos de perdida de validacion tras cada fusion, de ahi que los checkpoints se tomen al final de cada ciclo. Las tasas de aprendizaje son 1e-4 para el puente, 1e-4 para el LoRA del decoder y 1e-5 para el encoder, con schedule coseno y 500 pasos de warmup. Aproximadamente el 0,6% de las oraciones son codigo (estimacion basada en reglas sobre la particion de validacion).

## Capacidades

- Codificacion de oraciones a embeddings densos de 2560 dimensiones (`encode`), pensados para similitud semantica y recuperacion.
- Decodificacion del vector a texto (`decode` / `generate_from_embeddings`), con reconstruccion reportada del 99,6% caracter a caracter en oraciones no vistas de SlimPajama.
- Roundtrip completo codificar-decodificar en una sola llamada (`roundtrip`).
- Compresion de texto de tipo lossy pero reconstruible a nivel de oracion.
- Procesamiento por lotes con relleno (el paquete `qwenar` impone relleno a la derecha en los objetivos del decoder).
- Uso como extractor de caracteristicas estandar via `AutoModel` con `trust_remote_code=True`, sin depender del paquete extra.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente multi-paso. No es un modelo conversacional.

## Casos de uso

- Recuperacion semantica y busqueda vectorial: los vectores de 2560 dimensiones pueden indexarse en FAISS, Qdrant o pgvector para buscar oraciones o fragmentos semanticamente similares en corpus en ingles; el modelo esta entrenado especificamente para que la similitud en ese espacio sea significativa.
- Deduplicacion y agrupacion de oraciones: al ser un autoencoder de frases, permite agrupar parafrasis y near-duplicates con umbrales sobre distancia coseno, util en limpieza de corpus previa a entrenamiento.
- Memoria comprimida para agentes y planificacion en espacio de conceptos: siguiendo la idea de los Large Concept Models, el vector puede almacenarse en lugar del texto en un historial de agente y decodificarse solo cuando haga falta, reduciendo el coste de almacenamiento y de tokens de contexto.
- Compresion de datos de texto a nivel de frase: con una reconstruccion del 99,6% caracter a caracter, es viable almacenar el vector (2560 floats) y regenerar el texto, siempre que se asuma la perdida de calidad en el 0,4% restante.
- Etiquetado y clasificacion downstream: los embeddings sirven como entrada a clasificadores lineales (scikit-learn, XGBoost) para tareas de analisis de sentimiento, deteccion de temas o moderacion en corpus ingleses, sin reentrenar el modelo.
- Reformulacion y generacion de variaciones: el decoder no es determinista si se activa el muestreo (`do_sample=True`), por lo que puede generar parafrasis de una oracion dada su vector, util para aumento de datos.
- Analisis de embeddings: extraccion de representaciones para estudiar geometria del espacio latente, interpolacion entre oraciones o visualizacion con UMAP/t-SNE en investigacion sobre representaciones de frases.
- Filtrado de calidad en pipelines de datos: puntuar la reconstruccion de cada oracion del corpus como proxy de su "tipicidad" o coherencia, descartando frases anomalas.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Conjunto de evaluacion |
|---|---|---|
| Reconstruccion caracter a caracter | 99,6% | 200.000 oraciones de SlimPajama no vistas en entrenamiento |
| Sondas de estres | 28 de 32 superadas | No especificado en la informacion disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, BEIR u otros) en la informacion disponible. Se trata de un modelo de reconstruccion de oraciones, no de un modelo de razonamiento o generacion generalista, por lo que esas metricas no serian directamente aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 9,3 GB, por lo que se necesitan del orden de 11-12 GB de VRAM contando activaciones y cache; con cuantizacion de 8 bits el requisito bajaria a unos 6-7 GB, aunque no se publican pesos cuantizados y la model card advierte contra el uso de INT8 en el embedding del encoder.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue en servidor; el entrenamiento se hizo con 8×H100 en bf16.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB); en tarjetas de 8-12 GB (RTX 3070, RTX 4060 Ti) seria necesario cuantizar o ejecutar solo el encoder.
- Opciones de despliegue: `transformers>=5.15` con `trust_remote_code=True`, o el paquete propio `pip install qwenar`. Solo el encoder ocupa alrededor de 4B parametros, por lo que para tareas de recuperacion pura puede cargarse unicamente la parte de codificacion.
- vLLM, llama.cpp, Ollama y TGI: no disponibles en la informacion proporcionada. El modelo usa codigo personalizado y dos tokenizadores distintos, lo que complica su integracion en servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `brivangl/qwenar-4b-montevideo` | 4,63B | 2560 | Oraciones en ingles de 5-256 tokens | Apache 2.0 | HuggingFace, 0 descargas |
| `brivangl/qwenar-0.6b` | No disponible (≈0,6B por el nombre) | No disponible | Oraciones en ingles de dominio biomedico | No disponible | HuggingFace |
| SONAR (Meta) | No disponible | No disponible | Oraciones multilingues | No disponible | No disponible |
| Large Concept Models (Meta) | No disponible | No disponible | Razonamiento en espacio de conceptos | No disponible | No disponible |

Los unicos datos comparativos que aporta la propia model card son cualitativos: SONAR y los Large Concept Models entrenan un modelo seq2seq desde cero, mientras que `qwenar` conecta dos checkpoints abiertos ya existentes con un puente lineal aprendido y adaptaciones DoRA. No hay cifras comparativas publicadas con esos sistemas en la informacion disponible.

## Limitaciones y advertencias

- Solo ingles: el modelo se entreno exclusivamente con oraciones en ingles de SlimPajama y no declara soporte multilingue.
- Alcance limitado a oraciones: el entrenamiento excluyo secuencias de menos de 5 y mas de 256 tokens, con una media de 21,7 tokens. No esta pensado para parrafos, documentos completos ni generacion larga.
- Requisito estricto de version: la model card advierte de que se necesita `transformers>=5.15` y que las versiones 4.x fallan en silencio, produciendo texto fluido pero incorrecto sin lanzar ningun error. Es un riesgo serio en produccion si no se fija la version.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio.
- Dos tokenizadores: el tokenizador del encoder esta en el subdirectorio `encoder_tokenizer/` y el del decoder en la raiz. Confundirlos produce resultados invalidos.
- Reconstruccion no perfecta: el 99,6% caracter a caracter implica que aproximadamente 1 de cada 250 caracteres se reconstruye mal, y 4 de 32 sondas de estres fallan. No es una compresion sin perdida.
- Entrenamiento incompleto: la ejecucion vio solo el 9% del corpus y nunca completo una pasada, por lo que el modelo esta infraentrenado respecto a los datos disponibles.
- Riesgo de alucinacion y de sesgo: al decodificar desde un vector, el decoder puede generar texto plausible distinto del original; ademas hereda los sesgos de SlimPajama, un corpus web filtrado, y solo el 0,6% de los datos es codigo, por lo que el rendimiento en contenido tecnico sera pobre.
- Sin validacion externa: 0 descargas y 0 likes, y las metricas proceden unicamente del autor. No hay evaluacion independiente ni benchmarks estandar.
- Licencia: los pesos se publican bajo Apache 2.0, pero los modelos base (`perplexity-ai/pplx-embed-v1-4b` y `Qwen/Qwen3-0.6B-Base`) tienen sus propias condiciones. Conviene verificar la licencia de `pplx-embed-v1-4b` antes de un uso comercial, ya que no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brivangl/qwenar-4b-montevideo
- Modelo predecesor: https://huggingface.co/brivangl/qwenar-0.6b
- Codigo, pipeline de entrenamiento y evaluacion: https://github.com/IvanDrokin/QwenAR
- Encoder base: https://huggingface.co/perplexity-ai/pplx-embed-v1-4b
- Decoder base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset: https://huggingface.co/datasets/cerebras/SlimPajama-627B
- Referencia arXiv 2308.11466 (SONAR): https://arxiv.org/abs/2308.11466
- Referencia arXiv 2412.08821 (Large Concept Models): https://arxiv.org/abs/2412.08821
- Referencia arXiv 2307.05695: https://arxiv.org/abs/2307.05695
- Referencia arXiv 2402.09353 (DoRA): https://arxiv.org/abs/2402.09353
- Referencia arXiv 2402.12354 (ReLoRA): https://arxiv.org/abs/2402.12354

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados correspondian a paginas municipales y articulos sobre el escudo y el logotipo de la localidad alemana de Bischofswerda, sin relacion con el modelo.
