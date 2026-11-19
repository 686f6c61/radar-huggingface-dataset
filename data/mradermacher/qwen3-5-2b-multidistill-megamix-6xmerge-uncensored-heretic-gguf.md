# mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF

## Resumen

El modelo `Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF` es una cuantizacion estatica en formato GGUF realizada por mradermacher sobre el modelo base `xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic`. Se trata de un merge de modelos (model-merge) de aproximadamente 1.942 millones de parametros construido sobre la familia Qwen3.5, orientado a razonamiento, generacion de codigo, matematicas y conversacion multimodal (image-text-to-text). El autor del merge lo ha destilado a partir de varios datasets de razonamiento y SFT, y lo ha sometido a un proceso de "abliteration" o decensurado (etiquetado como heretic/uncensored/decensored) que elimina parte de los rechazos y filtros de seguridad del modelo original.

La relevancia de esta publicacion es doble. Por un lado, ofrece una version lista para inferencia local en hardware modesto: con cuantizaciones desde Q2_K (1,1 GB) hasta f16 (4,0 GB), el modelo cabe en GPUs de consumo e incluso en CPU con llama.cpp. Por otro, el pipeline `image-text-to-text` y los ficheros `mmproj` indican soporte multimodal, algo poco habitual en modelos de este tamano. El contexto y la arquitectura exacta no estan documentados en la informacion disponible.

El modelo se distribuye bajo licencia Apache 2.0, declara unicamente el idioma ingles y acumula cerca de 3.948 descargas desde su publicacion el 12 de noviembre de 2026. Es, por tanto, una opcion practica para experimentacion con modelos pequenos de razonamiento sin censura, aunque con las cautelas propias de un merge sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalle exacto no disponible) |
| Parametros totales | 1.942.653.248 (aprox. 1,94 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge de seis modelos (segun el sufijo "6xMerge") construido sobre Qwen3.5-2B, con destilacion multiple ("MultiDistill") y "Megamix" como estrategia de combinacion de pesos. El repositorio cuantizado no documenta la arquitectura interna con detalle: no se especifica si emplea atencion completa, atencion lineal, GQA ni el numero de capas u ocultas. Tampoco se indica la longitud de contexto nativa ni el volumen total de tokens de entrenamiento.

Los datasets declarados en la model card son `TeichAI/polaris-alpha-1000x`, `Ali-Yaser/KIMI-K2.5-450000x-ShareGPT`, `allenai/tulu-3-sft-mixture`, `nohurry/Opus-4.6-Reasoning-3000x-filtered` y `Jackrong/Qwen3.5-reasoning-700x`, lo que sugiere una mezcla de SFT general (Tulu-3), datos conversacionales estilo ShareGPT y datasets de razonamiento con cadenas de pensamiento filtradas. No se detalla si hubo RLHF, DPO o preferencias. La innovacion tecnica destacable es el proceso "heretic/abliterated", que modifica los pesos para reducir la tendencia al rechazo, y la inclusion de un proyector multimodal (`mmproj`) que habilita la entrada de imagenes junto a texto.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento con cadenas de pensamiento (chain-of-thought), segun los tags y datasets de destilacion.
- Generacion de codigo y resolucion de problemas matematicos (tags `code` y `mathematics`).
- Entrada multimodal imagen-texto (`image-text-to-text`) mediante los ficheros `mmproj` incluidos en el repo.
- Comportamiento "uncensored/decensored": menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte explicito de tool calling, function calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M (1,4 GB) el modelo se ejecuta en portatiles y estaciones de trabajo sin GPU dedicada, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Razonamiento y resolucion de problemas matematicos en entornos educativos o de investigacion: los datasets de destilacion de razonamiento (Opus-4.6-Reasoning, Qwen3.5-reasoning) apuntan a un uso orientado a explicar pasos intermedios, util para generar soluciones didacticas.
- Generacion de codigo en herramientas de desarrollo: el tag `code` y el soporte de plantillas de chat de Qwen permiten integrarlo en editores o scripts de automatizacion para autocompletado y explicacion de fragmentos.
- Descripcion y analisis de imagenes: gracias al pipeline `image-text-to-text` y a los ficheros `mmproj`, puede emplearse para captioning, extraccion de texto de capturas o preguntas sobre imagenes en aplicaciones de accesibilidad.
- Experimentacion con modelos sin censura: investigadores que estudian comportamiento de modelos abliterated pueden usar esta variante para comparar tasas de rechazo frente al modelo original de Qwen3.5.
- Despliegue en entornos con recursos limitados: al ser GGUF, encaja en soluciones tipo llama.cpp u Ollama para asistentes embebidos, demos offline o entornos air-gapped donde no se puede llamar a una API externa.
- Generacion de datos sinteticos: su naturaleza de merge destilado y su bajo coste de inferencia lo hacen util para producir pares pregunta-respuesta o cadenas de razonamiento a escala en pipelines de aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,1 GB; Q4_K_M ~1,4 GB; Q6_K ~1,7 GB; Q8_0 ~2,2 GB; f16 ~4,0 GB. Con el proyector multimodal hay que sumar 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones bajas; RTX 3060/4060, RTX 4090, A100 o H100 son sobradas para este tamano. En GPUs de 8 GB o mas cabe la version f16 con contexto amplio.
- Cabe en GPU de consumo: si, desde GPUs integradas con suficiente memoria compartida hasta cualquier dedicada moderna. En CPU funciona con llama.cpp a velocidades aceptables para un modelo de 2 B.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo OpenAI API. Para el modo multimodal se requiere un runtime con soporte de `mmproj` (por ejemplo, llama.cpp con `llama-mtmd-cli`).
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 2 B en Q4_K_M suele generar decenas de tokens por segundo en GPU de consumo y varios tokens por segundo en CPU, pero no se aportan mediciones concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic (este) | ~1,94 B | no disponible | Apache 2.0 | Si (image-text-to-text) | Merge destilado, sin benchmarks publicados, version GGUF de mradermacher |
| Qwen3.5-2B (base oficial) | ~2 B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen) | no disponible | Modelo original sin merge ni abliteration; comportamiento de seguridad estandar |
| Modelos de ~2 B de la familia Llama 3.2 | ~1-3 B | no disponible en esta ficha | Llama Community License | Variante 11B multimodal; la de 1-3 B es solo texto | Ecosistema amplio de cuantizaciones GGUF; licencia mas restrictiva que Apache 2.0 |
| Modelos de ~2 B de la familia Gemma 3 | ~1-4 B | no disponible en esta ficha | Gemma Terms of Use | Si, en algunas variantes | Buen rendimiento multilingue; licencia con condiciones de uso |

La comparacion cuantitativa de rendimiento no es posible porque este modelo no publica benchmarks. Frente a las alternativas oficiales, su principal diferencia es la ausencia de filtros de rechazo y la disponibilidad inmediata en GGUF, a costa de una calidad incierta al ser un merge sin evaluacion.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad real del merge frente al modelo base Qwen3.5-2B es desconocida y puede degradarse por el proceso de merge y abliteration.
- Modelo "uncensored/heretic": reduce deliberadamente los rechazos de seguridad, por lo que puede generar contenido inapropiado, ofensivo o danoso. No es apto para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion: como todo modelo de ~2 B, su capacidad de razonamiento y su fiabilidad factica son limitadas; los merges destilados pueden amplificar inconsistencias.
- Solo declara ingles: el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea pobre.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el contenido generado es responsabilidad del usuario; conviene revisar las obligaciones de atribucion.
- Al ser una cuantizacion, las versiones Q2_K y Q3 pierden calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El soporte multimodal depende del runtime: sin cargar el fichero `mmproj` correspondiente, el modelo solo procesa texto.
- Fecha de publicacion futura (noviembre de 2026) y ecosistema muy reciente: la documentacion y el soporte de herramientas pueden ser incompletos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset TeichAI/polaris-alpha-1000x: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Dataset Ali-Yaser/KIMI-K2.5-450000x-ShareGPT: https://huggingface.co/datasets/Ali-Yaser/KIMI-K2.5-450000x-ShareGPT
- Dataset allenai/tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
