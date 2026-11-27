# mradermacher/KazeGemPT-E2B-it-v2-GGUF

## Resumen

KazeGemPT-E2B-it-v2-GGUF es una coleccion de cuantizaciones GGUF del modelo KazeGemPT-E2B-it-v2, publicada por el usuario mradermacher. El modelo original lo desarrolla kouzen-neo y esta orientado a la traduccion, con especial enfasis en el ambito del manga y el comic japones, cubriendo el par de idiomas japones, ingles e indonesio. La etiqueta "gemma4" en los metadatos sugiere una base derivada de la familia Gemma, aunque la model card no confirma detalles de arquitectura.

El repositorio original cuenta con 4.628.569.635 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos de aproximadamente 4.600 millones de parametros. Esta version GGUF incluye tanto los pesos cuantizados en multiples niveles (desde Q2_K hasta f16) como dos ficheros mmproj, lo que indica soporte multimodal (probablemente vision) para procesar imagenes de paginas de manga. La licencia es Apache 2.0, lo que permite uso comercial.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo especializado en traduccion de manga en hardware de consumo, gracias a las cuantizaciones de 3-5 GB, y en que documenta un caso de uso muy concreto (traduccion ja-en-id) poco cubierto por los modelos generalistas. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento y el modelo original no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "gemma4" sugiere base de la familia Gemma; no confirmado) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | japones (ja), ingles (en), indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. La etiqueta "gemma4" y la presencia de ficheros mmproj apuntan a un transformer multimodal con capacidad de procesar imagenes, coherente con el caso de uso de traduccion de paginas de manga. El tamano de 4.628 millones de parametros es consistente con un modelo denso de escala media.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF es una plantilla estandar de mradermacher y remite al modelo base (kouzen-neo/KazeGemPT-E2B-it-v2) para los detalles, que no se incluyen en la informacion disponible. No consta ninguna innovacion tecnica destacable documentada (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Traduccion entre japones, ingles e indonesio, con especializacion declarada en el dominio del manga.
- Procesamiento multimodal: la presencia de ficheros mmproj indica capacidad de recibir imagenes como entrada, presumiblemente para traducir texto dentro de paginas escaneadas.
- Generacion de texto conversacional (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documenta soporte explicito de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan modos especiales como thinking mode, audio u otras capacidades adicionales.

## Casos de uso

- Traduccion de manga japones a indonesio: el modelo esta entrenado especificamente para este par de idiomas y dominio, por lo que puede integrarse en un pipeline de escaneo, deteccion de bocadillos (OCR) y traduccion del texto extraido.
- Traduccion de manga japones a ingles: mismo flujo que el anterior, util para editoriales independientes o proyectos de scanlation que necesiten un primer borrador automatico.
- Localizacion de comics y webtoons: al cubrir ja, en e id, sirve para adaptar contenido entre los tres mercados con un unico modelo.
- Procesamiento de imagenes de paginas con el componente mmproj: permite pasar directamente la pagina escaneada al modelo para obtener la traduccion, reduciendo la dependencia de un OCR separado.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (3,5 GB) y Q5_K_M (3,7 GB) permiten ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp, lo que facilita prototipos locales.
- Servicio de traduccion por API: con el tag endpoints_compatible y el formato GGUF, puede servirse mediante llama.cpp server u Ollama para integrarse en aplicaciones de traduccion bajo demanda.
- Investigacion en traduccion de bajo recurso: el par ja-id es menos cubierto que ja-en, por lo que el modelo resulta util como referencia en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,1 GB; Q3_K_M ~3,3 GB; Q4_K_M ~3,5 GB; Q5_K_M ~3,7 GB; Q6_K ~3,9 GB; Q8_0 ~5,0 GB; f16 ~9,4 GB.
- Los ficheros mmproj anaden ~0,7 GB (Q8_0) o ~1,1 GB (f16) si se usa la entrada multimodal.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para cuantizaciones Q4/Q5; 8-12 GB para Q8_0; 16 GB o mas para f16. No se especifican modelos concretos (RTX 4090, A100, H100) en la informacion disponible.
- Cabe en GPUs de consumo: si, en tarjetas de 6-8 GB con cuantizaciones Q4_K_M o Q5_K_M; tambien en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere servidores tipo llama.cpp server. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, se puede comparar con otros modelos de traduccion de ~4-5B parametros, pero no se aportan cifras verificables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KazeGemPT-E2B-it-v2 (este) | 4.628 M | no disponible | ja, en, id | Apache 2.0 | GGUF, safetensors |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Informacion muy escasa: no hay benchmarks, no se detalla el dataset ni el proceso de entrenamiento, lo que dificulta evaluar la calidad real.
- El modelo original no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Riesgo de alucinacion y de traducciones inexactas en textos con jerga, honorificos o referencias culturales propias del manga.
- Cobertura limitada a tres idiomas (ja, en, id); no se garantiza calidad fuera de ese ambito.
- La etiqueta "gemma4" no esta confirmada por la model card; conviene verificar la arquitectura antes de asumir compatibilidades.
- Aunque la licencia es Apache 2.0, el modelo base podria tener condiciones adicionales no reflejadas; conviene revisar el repositorio original.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la fidelidad de la traduccion.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para flujos que dependan de esas capacidades.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KazeGemPT-E2B-it-v2-GGUF
- Modelo base: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it-v2
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#KazeGemPT-E2B-it-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
