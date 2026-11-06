# mradermacher/gemma-4-26B-A4B-it-uncensored-heretic-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-it-uncensored-heretic-GGUF` es una distribucion de pesos en formato GGUF del modelo `llmfan46/gemma-4-26B-A4B-it-uncensored-heretic`, un derivado de la familia Gemma 4 de Google con tecnicas de "abliteration" y "decensoring" aplicadas para eliminar los rechazos de seguridad del modelo original. El autor de la cuantizacion es mradermacher, un conocido publicador de quants GGUF, mientras que el modelo base fue producido por llmfan46.

El modelo parte de una arquitectura Gemma 4 26B con nomenclatura A4B, que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 25.233 millones de parametros totales y un subconjunto de parametros activos por token. La cuantizacion a GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en safetensors.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de gran tamano (26B) con posible arquitectura MoE, una modificacion orientada a eliminar el alineamiento de seguridad (heretic/uncensored) y una distribucion en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0) con soporte multimodal mediante ficheros mmproj. Todo ello bajo licencia Apache 2.0 segun los metadatos del repositorio, aunque con matices que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (variante A4B, presumiblemente MoE; no confirmado en la informacion disponible) |
| Parametros totales | 25.233.142.046 (25,23 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun metadatos; el modelo base Gemma es multilingue pero la ficha solo declara ingles) |
| Licencia | apache-2.0 (segun metadatos; el enlace de licencia apunta a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (con ficheros mmproj separados para capacidades multimodales) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la nomenclatura del modelo base (`gemma-4-26B-A4B-it`). El sufijo `A4B` es coherente con la convencion de modelos MoE de Google (como Gemma 3n o variantes previas), donde "A4B" indicaria aproximadamente 4 mil millones de parametros activos sobre un total de 26 mil millones. Sin embargo, esta interpretacion no esta confirmada en la model card proporcionada.

El proceso de entrenamiento original de Gemma 4 no se describe en la informacion disponible. Lo que si se documenta es la cadena de modificaciones: el modelo parte de una version "it" (instruction-tuned) de Gemma 4, sobre la que se aplicaron tecnicas de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) y "decensoring", dando lugar al modelo `uncensored-heretic`. Posteriormente, mradermacher genero cuantizaciones estaticas en GGUF con `quantize_version: 2` y `output_tensor_quantised: 1`, incluyendo ficheros mmproj para el proyector multimodal. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la fase de modificacion.

## Capacidades

- Generacion de texto conversacional en ingles, con modo instructivo heredado del modelo base `-it`.
- Capacidades multimodales: la presencia de ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` indica soporte de entrada de imagenes (vision) a traves del proyector multimodal.
- Razonamiento y generacion de codigo: capacidades heredadas de Gemma 4, aunque no se documentan explicitamente en la ficha.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir rechazos ante peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la ficha declara unicamente `en`, aunque el modelo base Gemma suele ser multilingue; no confirmado para esta variante.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el Gemma 4 original, util para papers sobre robustez de salvaguardas.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin los rechazos tipicos de modelos alineados, ejecutable localmente en una estacion de trabajo con GPU de 24 GB usando Q4_K_M.
- Analisis de contenido sensible en entornos controlados: clasificacion o resumen de textos que contengan lenguaje explicito o temas delicados, donde un modelo censurado se negaria a procesar la entrada.
- Despliegue local con llama.cpp u Ollama: prototipado de asistentes conversacionales en hardware de consumo (RTX 4090 con 24 GB para Q4_K_M, o Mac con memoria unificada de 32 GB o mas), sin dependencia de APIs externas.
- Evaluacion de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion mas dos variantes de mmproj, lo que permite medir la degradacion de perplexity y calidad entre Q2_K y Q8_0 en un modelo de 26B con arquitectura MoE.
- Procesamiento multimodal local: con el fichero mmproj cargado, el modelo puede describir imagenes o responder preguntas sobre ellas en un pipeline completamente offline, adecuado para entornos con requisitos de privacidad.
- Red teaming de productos: uso como modelo "adversario" para probar filtros y clasificadores de seguridad en aplicaciones propias, generando prompts que un modelo alineado no produciria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,7 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~14,2 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,2 GB
  - Q6_K: ~22,7 GB
  - Q8_0: ~27,0 GB
  - mmproj adicional: 0,9 GB (Q8_0) o 1,3 GB (f16)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) similar; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; multiples GPU o Mac con memoria unificada de 32-64 GB para las cuantizaciones mas grandes.
- Cabe en GPU de consumo: si, Q4_K_M y Q4_K_S en GPUs de 24 GB; Q3_K_M e IQ4_XS en GPUs de 16 GB con contexto reducido; Q2_K en GPUs de 12 GB con margen justo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de endpoints (el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa generalizada; seria necesario convertir a safetensors o usar variantes especificas.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse presumiblemente de una arquitectura MoE con ~4B parametros activos, el throughput deberia ser superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-26B-A4B-it-uncensored-heretic-GGUF | 25,23B totales (activos no disponibles) | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Variante uncensored/abliterated, multimodal via mmproj |
| llmfan46/gemma-4-26B-A4B-it-uncensored-heretic | 25,23B totales | no disponible | apache-2.0 | safetensors (presumiblemente) | Modelo base del que deriva esta cuantizacion |
| Gemma 4 26B A4B it (original de Google) | 25,23B totales | no disponible | licencia Gemma 4 | safetensors | Version alineada, con rechazos de seguridad |
| mradermacher/gemma-4-26B-A4B-it-uncensored-heretic-i1-GGUF | 25,23B totales | no disponible | apache-2.0 | GGUF (imatrix) | Variante con cuantizaciones ponderadas por importancia, mayor calidad por bit |

No se dispone de datos de benchmarks para establecer comparaciones cuantitativas de rendimiento con alternativas.

## Limitaciones y advertencias

- La modificacion "uncensored/heretic" elimina parcialmente las salvaguardas del modelo original; el modelo puede generar contenido danino, ilegal o sexualmente explicito sin rechazo. No es apto para aplicaciones orientadas al publico sin filtros adicionales.
- La abliteration degrada tipicamente capacidades de razonamiento y coherencia respecto al modelo original; no hay benchmarks publicados que cuantifiquen esta perdida en esta variante concreta.
- La ficha declara unicamente ingles como idioma soportado; el rendimiento en castellano u otros idiomas no esta verificado y podria ser deficiente.
- Riesgo elevado de alucinacion, agravado por la modificacion de pesos y por la falta de datos de evaluacion.
- La licencia declarada es Apache 2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y una politica de uso aceptable. Existe ambiguedad legal sobre que licencia prevalece; conviene revisar los terminos de Gemma 4 antes de un uso comercial.
- El modelo base podria estar sujeto a la politica de uso prohibido de Google (contenido danino, armas, vigilancia, etc.), que la abliteration no elimina legalmente aunque elimine tecnicamente los rechazos.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay informacion sobre longitud de contexto soportada en formato GGUF; las herramientas de inferencia pueden requerir configuracion manual y la extension de contexto mas alla del entrenamiento degrada la calidad.
- El modelo tiene solo 1 like y 1233 descargas en el momento de la ficha, lo que indica escasa validacion por parte de la comunidad.
- El tag `region:us` y la ausencia de pipeline declarado limitan la integracion directa con `transformers` sin pasos adicionales.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-uncensored-heretic
- Variante imatrix (i1-GGUF): https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-uncensored-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-it-uncensored-heretic-GGUF
- Licencia Gemma 4 (enlazada en la model card): https://ai.google.dev/gemma/docs/gemma_4_license
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
