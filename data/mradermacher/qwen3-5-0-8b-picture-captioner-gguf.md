# mradermacher/Qwen3.5-0.8B-Picture-Captioner-GGUF

## Resumen

Qwen3.5-0.8B-Picture-Captioner-GGUF es la version cuantizada en formato GGUF del modelo agentlans/Qwen3.5-0.8B-Picture-Captioner, un modelo multimodal derivado de la familia Qwen3.5 de Alibaba, especializado en la generacion de descripciones de imagenes (image captioning). Lo publica mradermacher, un conocido creador de cuantizaciones GGUF para la comunidad de inferencia local. El modelo base parte de una arquitectura transformer de aproximadamente 752 millones de parametros (dato real de safetensors) y se ha afinado sobre el dataset agentlans/monet-caption.

La relevancia de esta ficha radica en que ofrece un modelo de vision-lenguaje extremadamente ligero (menos de 1.000 millones de parametros) empaquetado en cuantizaciones que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB), ademas de los ficheros mmproj necesarios para el procesamiento de imagenes. Esto permite ejecutar captioning de imagenes en hardware de consumo modesto, algo poco habitual en el ecosistema multimodal.

El modelo es monolingue en ingles, tiene licencia Apache 2.0 y esta pensado para tareas de descripcion automatica de imagenes, etiquetado y generacion de texto asistida por vision. No se dispone de informacion sobre la longitud de contexto ni sobre resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5, con un componente de vision (codificado en los ficheros mmproj) y un decodificador de lenguaje de aproximadamente 752 millones de parametros. Se ha afinado sobre el dataset agentlans/monet-caption, orientado a la generacion de descripciones de imagenes, lo que explica su especializacion en captioning frente a un uso generalista.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La cuantizacion la realiza mradermacher mediante cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf); no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. Los ficheros mmproj se ofrecen en Q8_0 y f16 para el procesamiento de imagenes en llama.cpp y derivados.

## Capacidades

- Generacion de descripciones de imagenes (image captioning) en ingles, su tarea principal.
- Procesamiento multimodal imagen-texto mediante los ficheros mmproj.
- Generacion de texto conversacional (tag conversational en Hugging Face).
- Compatible con endpoints (tag endpoints_compatible).
- Capacidades multilingues limitadas al ingles.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No se documentan capacidades de audio ni de video.

## Casos de uso

- Descripcion automatica de imagenes en ingles: el modelo genera captions a partir de imagenes, adecuado para catalogos, bancos de imagenes o accesibilidad basica.
- Etiquetado y metadatos de imagenes a escala: al ser un modelo de menos de 1.000 millones de parametros, se puede ejecutar en lote sobre grandes volumenes de imagenes con coste de computo bajo.
- Preprocesamiento para pipelines de recuperacion multimodal: generar descripciones textuales de imagenes para indexarlas en motores de busqueda o bases vectoriales.
- Prototipado en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (0,6 GB) permiten ejecutar el modelo en portatiles y equipos sin GPU dedicada mediante llama.cpp.
- Generacion de alt-text para accesibilidad web: integrable en flujos de publicacion de contenido para producir texto alternativo en ingles.
- Filtrado y moderacion de contenido visual: descripciones breves que alimentan clasificadores posteriores o revision humana.
- Experimentacion academica con modelos vision-lenguaje pequenos: util como linea base ligera para comparativas de captioning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde aproximadamente 0,5 GB (Q2_K) hasta 1,6 GB (f16) para los pesos, mas 0,2-0,3 GB de los ficheros mmproj.
- Cabe en practicamente cualquier GPU de consumo (GTX 1060 6 GB, RTX 3060, RTX 4090) y en CPU mediante llama.cpp.
- Despliegue recomendado con llama.cpp u Ollama para GGUF; para el modelo base en safetensors, transformers.
- vLLM y TGI no estan documentados para esta cuantizacion concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia muy rapida en GPU moderna y viable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Picture-Captioner (este) | 752 M | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en captioning, ingles |
| Modelo base agentlans/Qwen3.5-0.8B-Picture-Captioner | 752 M | no disponible | Apache 2.0 | safetensors | Version sin cuantizar |
| Alternativas de captioning ligeras | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo monolingue en ingles; no soporta castellano de forma nativa.
- Especializado en captioning: su rendimiento en tareas genericas de razonamiento o codigo probablemente sea limitado.
- Riesgo de alucinacion en la descripcion de imagenes ambiguas o de baja calidad.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas/imatrix disponibles, lo que puede afectar la calidad en cuantizaciones bajas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento.
- No se documentan sesgos especificos; al ser un modelo pequeno y afinado en un dataset concreto, puede heredar sesgos de dicho dataset.
- No hay informacion sobre longitud de contexto, lo que limita la planificacion de cargas con entradas largas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Picture-Captioner-GGUF
- Modelo base: https://huggingface.co/agentlans/Qwen3.5-0.8B-Picture-Captioner
- Dataset: https://huggingface.co/datasets/agentlans/monet-caption
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-Picture-Captioner-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
