# mradermacher/LFM2.5-2.6B-Pashto-Zi-b-GGUF

## Resumen

LFM2.5-2.6B-Pashto-Zi-b-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo nassimjp/LFM2.5-2.6B-Pashto-Zi-b, publicada por el usuario mradermacher. El modelo original parte de la familia LFM2.5 de LiquidAI (2.691.204.096 parametros, unos 2,7 mil millones) y anade una extension de tokenizer orientada a lenguas de script arabe-persa: pashto (پښتو), urdu (اردو), persa (فارسی), sindi (سنڌي) y balochi (بلوچی). El repositorio no contiene pesos nuevos ni ajuste adicional: es una conversion de los pesos originales a formato GGUF en doce niveles de cuantizacion.

La relevancia de esta publicacion es practica. El modelo base no dispone de versiones GGUF oficiales, de modo que estas cuantizaciones son la via mas directa para ejecutar un modelo causal con tokenizer extendido para pashto y lenguas vecinas en hardware de consumo, mediante llama.cpp, Ollama o LM Studio. Los ficheros van desde 1,2 GB (Q2_K) hasta 5,5 GB (f16), lo que permite desplegarlo en portatiles y equipos sin GPU dedicada.

Se trata de un repositorio recien creado, con cero descargas y cero valoraciones en el momento de la consulta, y sin resultados de benchmarks publicados. La informacion disponible se limita a la model card de la cuantizacion, que no detalla la arquitectura interna, la longitud de contexto ni la composicion del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo deriva de la familia LFM2.5 de LiquidAI; la model card no detalla la configuracion) |
| Parametros totales | 2.691.204.096 (aproximadamente 2,7 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Etiquetas del modelo: pashto, urdu, persa, sindi, balochi. Metadatos de idioma del repositorio: en (solo ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; no hay versiones con imatrix/weighted disponibles) |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO. Lo unico deducible es que se trata de un modelo de lenguaje causal (etiquetas causal-lm y language-model) construido sobre la familia LFM2.5 de LiquidAI, y que el repositorio base incorpora una extension de tokenizer (tokenizer-extension) para scripts arabe-persas junto con componentes de embedding.

La unica innovacion documentada en la informacion disponible es precisamente esa extension de vocabulario: el tokenizer original de LFM2.5 se amplia para cubrir pashto, urdu, persa, sindi y balochi, lo que reduce la fragmentacion de tokens en estos idiomas respecto a un tokenizer entrenado predominantemente en ingles. Esta cuantizacion concreta no introduce cambios arquitectonicos: es una conversion de pesos a GGUF con doce niveles de precision, generada con el flujo habitual de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generacion de texto causal y conversacion multi-turno (etiqueta conversational).
- Modelado de lenguaje base con soporte de embeddings; el repositorio incluye la etiqueta embedding.
- Cobertura de scripts arabe-persas gracias a la extension de tokenizer: pashto, urdu, persa, sindi y balochi.
- Capacidad multilingue respecto al modelo original, aunque los metadatos del repositorio solo declaran ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento explicito (thinking mode), vision, audio ni otras modalidades.
- No se documenta comportamiento agentico ni razonamiento multi-paso.
- El tamaño reducido (2,7 mil millones de parametros) permite ejecucion en CPU y en GPU de gama baja mediante los GGUF incluidos.

## Casos de uso

- Traduccion y transliteracion entre pashto, urdu, persa, sindi, balochi e ingles: la extension de tokenizer reduce el numero de tokens necesarios por palabra y mejora la cobertura de vocabulario en estos idiomas, algo critico en traduccion de textos largos.
- Atencion al cliente en pashto o urdu: el modelo puede gestionar conversaciones multi-turno en estos idiomas y desplegarse en local con los cuantos Q4_K_M, lo que evita enviar datos de usuarios a servicios externos.
- Preprocesado y postprocesado de pipelines de voz: correccion de transcripciones ASR en pashto y urdu, puntuacion y normalizacion de texto antes de alimentar un sistema mayor.
- Generacion aumentada por recuperacion (RAG) sobre documentacion en pashto o persa: el modelo actua como generador final sobre fragmentos recuperados, con embeddings del propio modelo para indexar.
- Investigacion en PLN de bajos recursos: analisis del efecto de una extension de tokenizer sobre la perplejidad y la calidad de generacion en lenguas con poca representacion, comparando contra el modelo base sin extension.
- Despliegue en el borde (edge) y en portatiles: con el cuanto Q2_K (1,2 GB) o Q4_K_S (1,7 GB) el modelo cabe en equipos sin GPU dedicada y puede ejecutarse en local para tareas de clasificacion, resumen o asistencia textual sin conexion.
- Prototipado rapido de asistentes conversacionales en idiomas minoritarios: al estar en GGUF, se puede integrar en demos con Ollama o llama-cpp-python en minutos, sin infraestructura GPU.
- Anonimizacion y moderacion de texto: filtrado de contenido y deteccion de datos personales en textos en pashto, urdu o persa antes de su almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion. Tampoco se proporcionan comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos; hay que sumar el KV cache, que depende del contexto, no disponible):
  - Q2_K: 1,2 GB
  - Q3_K_S: 1,4 GB; Q3_K_M: 1,5 GB; Q3_K_L: 1,5 GB
  - IQ4_XS: 1,6 GB
  - Q4_K_S: 1,7 GB; Q4_K_M: 1,8 GB (recomendados por el autor)
  - Q5_K_S: 2,0 GB; Q5_K_M: 2,0 GB
  - Q6_K: 2,3 GB
  - Q8_0: 3,0 GB
  - f16: 5,5 GB
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en iGPU con memoria unificada para los cuantos mas bajos.
- Para GPU de datacenter (A100, H100) no tiene sentido por tamaño; el modelo es de despliegue local o de borde.
- Ejecucion en CPU viable con llama.cpp para los cuantos Q4 y Q2, con velocidad dependiente del numero de nucleos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros frontends compatibles con GGUF. No se documenta soporte de vLLM, TGI o TensorRT-LLM en la informacion disponible.
- Latencia y throughput: no disponibles (no se publican mediciones).
- Nota: el autor indica que no hay cuantizaciones con imatrix/weighted para este modelo; solo estan disponibles las estaticas listadas. La suma de los ficheros explica el tamaño de 24,3 GB del repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Benchmarks |
|---|---|---|---|---|---|
| mradermacher/LFM2.5-2.6B-Pashto-Zi-b-GGUF | 2,69 mil millones | no disponible | GGUF (12 cuantos) | apache-2.0 | no disponible |
| nassimjp/LFM2.5-2.6B-Pashto-Zi-b (modelo base) | 2,69 mil millones | no disponible | safetensors (transformers) | apache-2.0 | no disponible |
| Otras cuantizaciones GGUF de LFM2.5 publicadas por mradermacher | 2,69 mil millones (segun variante) | no disponible | GGUF | apache-2.0 (heredada del base) | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para ninguno de los modelos comparados, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria. Respecto a modelos generalistas de tamano similar sin extension de tokenizer para lenguas arabe-persas, la ventaja esperada de esta variante es la menor fragmentacion de tokens en pashto, urdu, persa, sindi y balochi, pero la informacion proporcionada no permite confirmarlo con mediciones.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: no es posible estimar la calidad real del modelo en tareas concretas antes de evaluarlo.
- Sesgos conocidos: no documentados. Al proceder de un modelo predominantemente ingles con tokenizer extendido, es probable que el comportamiento en lenguas de bajos recursos sea menos fiable que en ingles, aunque esto no se cuantifica en la informacion disponible.
- Riesgo de alucinacion: inherente a cualquier modelo causal de 2,7 mil millones de parametros; no se documentan medidas de mitigacion.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica. Los metadatos del repositorio declaran unicamente ingles, mientras que las etiquetas mencionan pashto, urdu, persa, sindi y balochi; esta discrepancia conviene verificarla antes de usarlo en produccion.
- La model card no especifica si el modelo ha pasado por ajuste por instrucciones o alineacion; la etiqueta conversational sugiere cierto grado de ajuste, pero no se confirma.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse en pipelines que lo requieran.
- Cuantos de baja precision: el propio autor marca Q3_K_M como "lower quality" y desaconseja f16 por excesivo ("overkill"). Para produccion se recomienda Q4_K_M o superior.
- Licencia apache-2.0: permite uso comercial, pero se hereda del modelo base y conviene verificar que el repositorio original no imponga condiciones adicionales (por ejemplo, terminos de uso de LiquidAI).
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/LFM2.5-2.6B-Pashto-Zi-b-GGUF
- Modelo base: https://huggingface.co/nassimjp/LFM2.5-2.6B-Pashto-Zi-b
- Pagina resumen del autor con la lista de descargas: https://hf.tst.eu/model#LFM2.5-2.6B-Pashto-Zi-b-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantos (ikawrakow), enlazado en la model card: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion, enlazadas en la model card: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre la familia LFM2.5; los resultados obtenidos correspondian a tablas de medallas de los Juegos Asiaticos de 2023 y no guardan relacion con el modelo.
