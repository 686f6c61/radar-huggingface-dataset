# mradermacher/Zenotron-Mini-0.5-Multilingual-GGUF

## Resumen

Zenotron-Mini-0.5-Multilingual es un modelo de lenguaje de arquitectura MoE (Mixture of Experts) desarrollado originalmente por open-zzrl y distribuido en formato GGUF por mradermacher. El modelo cuenta con aproximadamente 35.500 millones de parametros totales y esta orientado a generacion de texto y conversacion multilingue. Su nombre indica que se trata de una version "Mini" de la familia Zenotron, en su revision 0.5.

La relevancia de esta publicacion radica en dos aspectos. Por un lado, es una de las pocas alternativas MoE multilingues con licencia Apache 2.0 disponibles en formato GGUF, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp u Ollama. Por otro lado, cubre idiomas como coreano, ruso, ingles y frances, un conjunto linguistico poco frecuente en modelos de este tamano.

La ficha se centra en la distribucion GGUF publicada por mradermacher, que ofrece cuantizaciones estaticas del modelo base. No se dispone de informacion detallada sobre arquitectura interna, datos de entrenamiento ni benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, F16 |
| Idiomas soportados | russo, ingles, frances, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors |
| Tamano del repo | 71,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas | conversational, moe, zenotron, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo emplea una arquitectura MoE (Mixture of Experts), como indican la etiqueta `moe` y el nombre del modelo base. Sin embargo, la model card del repositorio GGUF no detalla el numero de expertos, la estrategia de enrutamiento, el numero de capas ni la dimension oculta. Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Toda esta informacion debe considerarse no disponible.

El repositorio de mradermacher es una distribucion de cuantizaciones estaticas generadas a partir del modelo base `open-zzrl/Zenotron-Mini-0.5-Multilingual`. Segun la model card, las cuantizaciones ponderadas (weighted/imatrix) no estan disponibles en el momento de la publicacion. El proceso de conversion se realizo con `convert_type: hf` y `quantize_version: 2`, y se omitio la conversion del proyector multimodal (`skip_mmproj: 1`), lo que sugiere que el modelo base podria tener componentes multimodales no incluidos en esta distribucion GGUF.

## Capacidades

- Generacion de texto y conversacion multi-turno en ruso, ingles, frances y coreano.
- Razonamiento general y respuesta a instrucciones en los idiomas soportados.
- Arquitectura MoE, que permite activar solo una fraccion de los parametros por token (aunque el numero de parametros activos no esta documentado).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs de inferencia tipo OpenAI.
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, vision ni audio en esta distribucion GGUF.
- Capacidades multilingues limitadas a los cuatro idiomas declarados; no se confirma soporte de otros idiomas.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones en ruso, ingles, frances y coreano, lo que lo hace adecuado para organizaciones que atienden usuarios en estos mercados sin desplegar un modelo por idioma.
- Traduccion y localizacion: al cubrir cuatro idiomas, puede emplearse en pipelines de traduccion automatica o adaptacion de contenido entre estos pares linguisticos.
- Asistentes conversacionales en entornos con VRAM limitada: las cuantizaciones Q2_K (13,3 GB) y Q4_K_S (20,5 GB) permiten desplegar un modelo de ~35,5 mil millones de parametros en GPUs de consumo alto o en servidores de gama media.
- Generacion de contenido editorial: redaccion de borradores, resumenes y reformulacion de textos en los idiomas soportados, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Integracion en APIs compatibles con OpenAI: la etiqueta `endpoints_compatible` facilita su uso como backend en herramientas que esperan una API tipo chat completions.
- Experimentacion e investigacion: al ser una distribucion GGUF de un modelo MoE multilingue, sirve como banco de pruebas para estudiar comportamiento de modelos MoE cuantizados en llama.cpp.
- Despliegue en CPU o configuraciones hibridas: la cuantizacion Q2_K permite ejecucion en CPU con RAM suficiente, util para entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~13,3 GB de pesos, mas overhead de contexto; requiere aproximadamente 16-18 GB de VRAM o RAM.
  - Q4_K_S: ~20,5 GB de pesos; requiere aproximadamente 24 GB de VRAM para caber completamente en GPU.
  - Cuantizaciones superiores (Q5, Q6, Q8, F16) superan los 24-70 GB y requieren GPUs de datacenter o configuraciones multi-GPU.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S; A100 40 GB o H100 para cuantizaciones superiores; RTX 3090/4090 para Q2_K.
- Cabe en GPU de consumo: Q2_K y Q4_K_S caben en RTX 4090 (24 GB); Q2_K podria caber en GPUs de 16 GB con contexto reducido o con offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zenotron-Mini-0.5-Multilingual (este) | ~35,5 mil M (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Multilingue (ru, en, fr, ko) |
| Mixtral 8x7B | ~46,7 mil M (MoE, 12,9 mil M activos) | 32k | Apache 2.0 | GGUF, safetensors | Referencia MoE open source; no cubre ru/ko de forma nativa |
| Qwen2.5-32B | ~32 mil M (denso) | 32k | Apache 2.0 | GGUF, safetensors | Multilingue amplio, incluido coreano; denso, no MoE |
| DeepSeek-V2-Lite | ~15,7 mil M (MoE, 2,4 mil M activos) | 4k-32k | MIT | safetensors | MoE eficiente; cobertura limitada de idiomas |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Zenotron para confrontar calidad. Los modelos alternativos se incluyen por similitud de categoria (MoE open source, licencia permisiva, despliegue en GGUF).

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, datos de entrenamiento ni procesos de alineamiento; el riesgo de sesgos y alucinaciones no puede evaluarse con rigor.
- La cobertura linguistica se limita a ruso, ingles, frances y coreano; el rendimiento en castellano u otros idiomas no esta documentado.
- La longitud de contexto no esta especificada, lo que impide planificar aplicaciones que requieran ventanas largas.
- El numero de parametros activos no esta documentado, lo que dificulta estimar coste computacional real por token.
- Las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad; se recomienda Q4_K_S o superior para uso en produccion.
- La distribucion GGUF omite el proyector multimodal del modelo base (`skip_mmproj: 1`), por lo que no se garantiza soporte de vision en este formato.
- Aunque la licencia es Apache 2.0, conviene verificar la model card del modelo base por si existen terminos adicionales no reflejados en la distribucion GGUF.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Zenotron-Mini-0.5-Multilingual-GGUF
- Modelo base: https://huggingface.co/open-zzrl/Zenotron-Mini-0.5-Multilingual
- Pagina de descargas del autor: https://hf.tst.eu/model#Zenotron-Mini-0.5-Multilingual-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Sitio del autor (nethype GmbH): https://www.nethype.de/
