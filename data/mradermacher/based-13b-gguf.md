# mradermacher/based-13b-GGUF

## Resumen

based-13b-GGUF es la distribucion en formato GGUF del modelo QuixiAI/based-13b, un modelo de lenguaje de 13.015.864.320 parametros (aproximadamente 13 mil millones) afinado a partir de una base no especificada en la informacion disponible. La version GGUF la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que convierte modelos en pesos optimizados para inferencia local con llama.cpp y herramientas compatibles. El modelo original fue entrenado sobre el dataset ehartford/based y esta orientado exclusivamente al ingles.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 13B en hardware de consumo gracias a las cuantizaciones que van desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB). El repositorio tiene 88,8 GB en total porque incluye todas las variantes de cuantizacion, no porque el modelo completo pese eso. Es una opcion practica para experimentacion local, prototipado y despliegue en entornos sin GPU de datacenter.

No se dispone de informacion sobre la arquitectura interna, la longitud de contexto, el proceso de entrenamiento ni los resultados de benchmarks del modelo base, por lo que esta ficha refleja unicamente los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; detalles internos no publicados) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repo | 88,8 GB (todas las cuantizaciones) |
| Modelo base | QuixiAI/based-13b |
| Dataset de entrenamiento | ehartford/based |
| Descargas | 213 |
| Likes | 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base QuixiAI/based-13b en la documentacion disponible. Por el numero de parametros (13B) y la libreria declarada (transformers), se trata presumiblemente de un transformer decoder-only, pero no se confirma ni el tipo de atencion, ni el numero de capas, ni la dimension de los embeddings. Tampoco se indica la longitud de contexto nativa.

El unico dato de entrenamiento disponible es el dataset utilizado: ehartford/based. No se especifica el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO o SFT posteriores. La model card del repositorio GGUF es puramente operativa: describe las cuantizaciones disponibles y remite a la pagina del modelo original para mas detalles. La cuantizacion se realizo con quantize_version 2 y output_tensor_quantised 1, segun los metadatos de la model card.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para el idioma ingles.
- Razonamiento y generacion de texto general: capacidades propias de un modelo de 13B, sin datos especificos publicados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo thinking.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se dispone de informacion sobre capacidades especiales adicionales.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con cuantizaciones Q4_K_M (8,0 GB) el modelo cabe en GPUs de consumo de 12 GB o superiores, lo que permite iterar rapidamente en un puesto de trabajo sin depender de la nube.
- Experimentacion con llama.cpp y Ollama: al estar en GGUF, se integra directamente en estos runners y permite probar tecnicas de prompting, temperatura y sampling en un modelo de 13B.
- Generacion de texto para tareas de redaccion y resumen en ingles: adecuado para pipelines offline donde no se requiere multilingue y se prioriza coste cero por inferencia.
- Despliegue en entornos con RAM limitada: la variante Q2_K (5,0 GB) permite ejecutar el modelo en CPU con memoria modesta, util para pruebas de concepto en portatiles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que facilita medir el impacto de la cuantizacion en perplejidad y calidad para un mismo modelo base.
- Base para fine-tuning o experimentacion academica: el modelo base en safetensors (13B) sirve como punto de partida para ajustes especificos, siempre que se respete la licencia "other".
- Generacion de codigo o matematicas: no hay evidencia publicada de rendimiento en estas tareas, por lo que su uso en produccion para codigo no esta respaldado por datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~5,0 GB; Q3_K_M ~6,4 GB; IQ4_XS ~7,1 GB; Q4_K_M ~8,0 GB; Q5_K_M ~9,3 GB; Q6_K ~10,8 GB; Q8_0 ~13,9 GB. A estas cifras hay que sumar el overhead de contexto y de la propia libreria (tipicamente 1-2 GB adicionales).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5; RTX 4090 24 GB para Q8_0 con contexto amplio; A100 o H100 para despliegues concurrentes de alta calidad.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (Q4_K_M), RTX 4060 Ti 16 GB (hasta Q6_K) y RTX 4090 (Q8_0).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El modelo base en safetensors puede servirse con vLLM o TGI si se dispone de GPU suficiente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/based-13b-GGUF | 13,0B | no disponible | other | GGUF | Esta ficha; 11 cuantizaciones |
| QuixiAI/based-13b | 13,0B | no disponible | other | safetensors | Modelo base original |
| mradermacher/based-13b-i1-GGUF | 13,0B | no disponible | other | GGUF (imatrix) | Variante con cuantizaciones ponderadas del mismo modelo |
| Otros modelos 13B de la comunidad | ~13B | variable | variable | GGUF/safetensors | No se dispone de datos de rendimiento comparables en la informacion proporcionada |

No se dispone de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia "other": no se detallan los terminos exactos, por lo que el uso comercial requiere verificar la licencia del modelo base QuixiAI/based-13b antes de desplegarlo en produccion.
- Solo ingles: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Sin datos de benchmarks: no hay evidencia publicada de calidad en razonamiento, codigo o matematicas, lo que desaconseja su uso en produccion sin evaluacion previa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones especificas.
- Sesgos: no se documenta el proceso de filtrado del dataset ehartford/based ni evaluaciones de sesgo.
- Longitud de contexto desconocida: limita el diseno de aplicaciones que dependan de ventanas largas.
- Las cuantizaciones Q2_K y Q3_K_M tienen calidad reducida segun la propia model card; para uso serio se recomienda Q4_K_M o superior.
- El modelo tiene 0 likes y 213 descargas, lo que indica una adopcion muy baja y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/based-13b-GGUF
- Modelo base: https://huggingface.co/QuixiAI/based-13b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/based-13b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#based-13b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ehartford/based
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
