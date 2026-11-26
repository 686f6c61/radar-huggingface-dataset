# kouzen-neo/KazeGemPT-E2B-it-GGUF

## Resumen

KazeGemPT-E2B-it-GGUF es la distribucion cuantizada en formato GGUF del modelo KazeGemPT-E2B-it, desarrollado por el usuario kouzen-neo. Se trata de un modelo especializado en traduccion de manga, con soporte para japones (ja), ingles (en) e indonesio (id), y esta pensado para ejecutarse localmente mediante llama.cpp y servirse a traves de una API compatible con OpenAI.

El repositorio contiene una unica build en cuantizacion Q4_K_M de aproximadamente 3,4 GB, lo que lo hace viable en hardware de consumo. El modelo base cuenta con 4.628.569.635 parametros totales segun los datos de safetensors, aunque la model card no detalla la arquitectura interna ni la longitud de contexto nativa (la invocacion de ejemplo usa 8192 tokens con `-c 8192`).

Su relevancia actual radica en que ofrece una alternativa ligera, con licencia Apache 2.0 y ejecutable en local, para pipelines de traduccion de comics y manga donde la privacidad del contenido y el coste por token son factores criticos. La model card remite al modelo base para el formato de prompt, resultados y limitaciones conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa 8192) |
| Tipos de cuantizacion | Q4_K_M (unica build publicada, ~3,4 GB) |
| Idiomas soportados | japones (ja), ingles (en), indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no proporciona informacion sobre la arquitectura del modelo base (transformer, MoE, hibrido u otra), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detalla ninguna innovacion tecnica especifica como decodificacion especulativa o atencion lineal.

La unica informacion tecnica disponible es que se trata de un modelo de texto (no multimodal) orientado a traduccion, con etiqueta de pipeline `translation` y especializacion declarada en manga. El autor remite explicitamente al model card del modelo base (kouzen-neo/KazeGemPT-E2B-it) para obtener el formato de prompt, los resultados y las limitaciones conocidas, por lo que cualquier detalle de entrenamiento debe consultarse alli.

## Capacidades

- Traduccion de texto entre japones, ingles e indonesio, con foco declarado en contenido de manga.
- Generacion de texto conversacional (la model card lo marca como modelo `conversational` y el ejemplo de despliegue habilita `--jinja`).
- Soporte de modo razonamiento desactivable mediante el flag `--reasoning off` en llama.cpp, lo que sugiere la existencia de un modo de razonamiento interno en el modelo base.
- Servido a traves de API compatible con OpenAI (`/v1`), lo que permite integrarlo con clientes estandar.
- Solo texto: no se declaran capacidades de vision, audio ni otras modalidades.
- No se documentan en la informacion disponible capacidades de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Traduccion automatica de manga en local: el modelo puede procesar dialogos y texto de bocadillos del japones al ingles o al indonesio dentro de un pipeline propio, sin enviar el contenido a servicios externos, lo que resulta adecuado para editoriales y scanlation groups que manejan material con derechos de autor.
- Traduccion asistida en herramientas de escritorio: al exponerse como servidor compatible con OpenAI en `http://127.0.0.1:8080/v1`, puede conectarse a clientes como KZRS u otros editores de traduccion que hablen ese protocolo.
- Prototipado rapido de pipelines de traduccion: la build Q4_K_M de 3,4 GB permite levantar un servicio de traduccion en una maquina de desarrollo sin GPU dedicada, usando llama.cpp con CPU.
- Procesamiento por lotes de catalogos de comics: al poder ejecutarse con `llama-server` y contexto configurable (8192 en el ejemplo), se puede encadenar la traduccion de multiples paginas o capitulos en un flujo automatizado.
- Evaluacion comparativa de modelos de traduccion ja-en-id: sirve como baseline ligero y de licencia permisiva frente a modelos mayores en pruebas internas de calidad de traduccion.
- Integracion en aplicaciones de lectura: un lector de manga puede consultar el endpoint local para traducir bajo demanda el texto seleccionado, manteniendo baja latencia y sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF remite al model card del modelo base para consultar resultados, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB solo para los pesos en Q4_K_M, mas overhead de contexto KV; en la practica, entre 4 y 6 GB dependiendo de la longitud de contexto configurada.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con 6 GB o mas de VRAM deberia poder alojarlo (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100), aunque no hay datos oficiales de compatibilidad.
- Cabe en GPU de consumo: si, segun el tamano de la build Q4_K_M; tambien puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), con compatibilidad con clientes OpenAI; no se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (traduccion ja-en-id especializada en manga) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; al ser un modelo especializado en manga japones, es probable que herede sesgos culturales y de genero presentes en ese corpus, aunque no se documenta explicitamente.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error ni evaluaciones de fidelidad en traduccion.
- Limitaciones de contexto e idioma: solo se declaran japones, ingles e indonesio; no hay soporte documentado para castellano ni otros idiomas. La longitud de contexto nativa no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia y condiciones del modelo base y de los datos de entrenamiento originales.
- Solo texto: no admite imagenes, por lo que la deteccion y extraccion de texto de las paginas de manga debe hacerse con herramientas externas (OCR) antes de la traduccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria; conviene tratar los resultados con cautela en produccion.
- La build publicada es unica (Q4_K_M); no hay alternativas de cuantizacion para ajustar el equilibrio calidad/tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it-GGUF
- Modelo base: https://huggingface.co/kouzen-neo/KazeGemPT-E2B-it
- Cliente KZRS mencionado en la model card: no disponible (no se proporciona URL)
