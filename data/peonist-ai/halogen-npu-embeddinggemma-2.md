# peonist-ai/halogen-npu-embeddinggemma-2

## Resumen

Halogen NPU EmbeddingGemma 2 es una conversión del modelo de embeddings `google/embeddinggemma-2` (revisión `914f7f89142e33e77833254d9c9b90c3cef7303b`) para ejecutarse en la NPU XDNA2 de los procesadores AMD Ryzen AI Strix Halo. Lo publica el proyecto peonist-ai dentro de su stack halogen, y no es un modelo entrenado desde cero: los pesos originales se han recodificado a los formatos numéricos y al layout que exige la NPU, y se distribuyen junto con el programa de dispositivo correspondiente.

Su función es la de un extractor de características (pipeline `feature-extraction`) que proyecta texto, imágenes y audio en un único espacio de 768 dimensiones, servido a través del endpoint `/v1/embeddings` de halogen-flash-server. El texto admitido llega hasta 8.192 tokens; las imágenes se envían como elementos `image_url` y los clips de audio como `input_audio` en WAV de hasta 30 segundos. El servidor permite seleccionar los prompts `query` o `document` mediante `prompt_name`, lo que lo hace directamente utilizable en arquitecturas de recuperación.

La relevancia de esta ficha es acotada y conviene subrayarla: los ficheros solo cargan dentro del contenedor halogen-flash-server sobre la NPU, no en transformers ni en ningún otro runtime, y el widget de inferencia del Hub está desactivado a propósito. Su interés práctico está en despliegues locales sobre Strix Halo donde el modelo Flash ocupa la GPU y este modelo de embeddings corre en paralelo en la NPU, detrás del mismo puerto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la informacion proporcionada no detalla la arquitectura del modelo base `google/embeddinggemma-2`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8.192 tokens para texto; audio de hasta 30 segundos por clip; imagenes sin limite indicado |
| Tipos de cuantizacion | conversion a los formatos numericos y al layout de la NPU XDNA2 (no se especifica el numero de bits); pesos empaquetados en `.hnpw` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, con sujecion a la Gemma Prohibited Use Policy |
| Formato de pesos | `.hnpw` (formato propio del runtime halogen) + `devices/` con el programa de NPU + `tokenizer/` |
| Dimension del embedding | 768 dimensiones, espacio compartido para texto, imagen y audio |
| Modalidades de entrada | texto, imagen (`image_url`) y audio (`input_audio`, WAV hasta 30 s) |
| Pipeline | `feature-extraction` |
| Runtime | exclusivamente halogen-flash-server (>= 0.18.3; los ficheros de cabeza requieren >= 0.18.12) |
| Libreria declarada | `halogen` |
| Tamano del repositorio | 1.2 GB |
| Modelo base | `google/embeddinggemma-2`, relacion `quantized` |
| Hardware objetivo | NPU AMD XDNA2 en Ryzen AI Strix Halo |
| Descargas / likes | 0 / 0 |
| Fechas | creado 2026-10-13, actualizado 2026-10-20 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `google/embeddinggemma-2` ni sobre su proceso de entrenamiento: la model card de esta conversion no describe capas, atencion, funcion de perdida, volumen de tokens, composicion del dataset ni si hubo etapas de RLHF o DPO. Lo unico documentado es el resultado funcional: un extractor que mapea texto, imagen y audio a un espacio comun de 768 dimensiones y que distingue entre representaciones de consulta (`query`) y de documento (`document`).

La innovacion tecnica de esta publicacion no esta en el modelo, sino en el empaquetado. Los pesos originales se han convertido a los formatos numericos y al layout que espera la NPU XDNA2, y se acompanan de un programa de dispositivo compilado (`devices/`) que cubre texto, imagenes y audio. El binario resultante no es portable: el autor indica explicitamente que no carga en transformers ni en ningun otro runtime, y que el widget de inferencia del Hub esta desactivado porque nada fuera del contenedor halogen puede ejecutarlos. El servidor descarga los ficheros en `/models/npu/embeddinggemma-2/` y verifica tamano y checksum de cada uno antes de arrancar.

## Capacidades

- Generacion de embeddings de texto de hasta 8.192 tokens en un espacio de 768 dimensiones.
- Embeddings de imagen a partir de elementos `image_url`, en el mismo espacio vectorial que el texto.
- Embeddings de audio a partir de elementos `input_audio` en formato WAV, con clips de hasta 30 segundos.
- Recuperacion asimetrica mediante `prompt_name`, que selecciona el prompt `query` o `document` segun el rol del texto.
- Servicio compatible con el endpoint `/v1/embeddings`, lo que facilita su integracion en clientes que ya hablan el protocolo de la API de OpenAI.
- Coexistencia con un modelo generativo en la GPU: la NPU atiende los embeddings mientras el modelo Flash se ejecuta en la GPU, detras del mismo puerto.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling ni comportamiento agentico; es un modelo exclusivamente de representacion.

## Casos de uso

- Recuperacion aumentada (RAG) en puesto de trabajo local: indexar documentacion interna con el prompt `document` y consultar con `query` sobre el mismo espacio de 768 dimensiones, sin enviar datos a la nube y aprovechando los 8.192 tokens por fragmento para reducir el numero de trozos.
- Busqueda semantica sobre corpus largos: la ventana de 8.192 tokens permite indexar secciones completas en lugar de parrafos aislados, lo que simplifica el pipeline de troceado y conserva mas contexto por vector.
- Busqueda multimodal de imagenes: almacenar los embeddings de un catalogo de imagenes enviadas como `image_url` y recuperarlas con consultas de texto, ya que ambas modalidades comparten el mismo espacio de 768 dimensiones.
- Indexacion y busqueda de archivo sonoro: transcribir no siempre es viable, y el soporte de `input_audio` en WAV de hasta 30 segundos permite vectorizar directamente fragmentos de reuniones, notas de voz o clips para recuperacion por similitud.
- Deduplicacion y agrupamiento de contenido: calcular embeddings de un lote de documentos o imagenes y aplicar similitud coseno para detectar duplicados o construir clusters tematicos antes de un proceso de curaduria.
- Clasificacion y enrutado por similitud: comparar la representacion de una consulta entrante con vectores de referencia de cada categoria para dirigirla al flujo, departamento o modelo adecuado, con la NPU liberando la GPU para el modelo generativo.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse integramente en hardware local Strix Halo y no requerir llamadas externas, encaja en escenarios donde el contenido no puede salir de la maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en GPU; el modelo se ejecuta en la NPU. El repositorio ocupa 1.2 GB, que es la referencia del espacio en disco necesario.
- GPU recomendadas: ninguna; el requisito es una NPU AMD XDNA2 integrada en un procesador Ryzen AI Strix Halo.
- Compatibilidad con GPU de consumo: irrelevante para este modelo; no se ejecuta en CUDA ni en ROCm a traves de los runtimes habituales.
- Software imprescindible: driver de NPU, XRT con su plugin de NPU, y el reloj de fabric de la GPU mantenido mientras la NPU trabaja en paralelo a la GPU.
- Despliegue: exclusivamente mediante halogen-flash-server 0.18.3 o superior, arrancado con `HALOGEN_DOWNLOAD` activo y `HALOGEN_NPU_MODELS=embeddinggemma-2`. Los ficheros de la cabeza del repositorio exigen 0.18.12 o superior. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Despliegue |
|---|---|---|---|---|---|
| peonist-ai/halogen-npu-embeddinggemma-2 | no disponible | 8.192 tokens (texto); audio 30 s | 768 | Apache-2.0 + Gemma Prohibited Use Policy | Solo halogen-flash-server sobre NPU XDNA2 (Strix Halo) |
| google/embeddinggemma-2 (original) | no disponible | no disponible | no disponible | Apache-2.0 + Gemma Prohibited Use Policy | Runtimes estandar de la libreria del modelo base (no detallado) |
| Otras alternativas de embeddings multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es entre el original y esta conversion: comparten origen y licencia, pero difieren en portabilidad. La version de peonist-ai solo funciona en el contenedor halogen sobre NPU XDNA2, mientras que el modelo de Google mantiene el formato y el runtime de origen. No se dispone de datos de rendimiento que permitan comparar calidad de recuperacion entre ambos.

## Limitaciones y advertencias

- Portabilidad nula: los ficheros no cargan en transformers ni en ningun otro runtime; el autor lo advierte de forma explicita y desactiva el widget de inferencia del Hub.
- Dependencia de hardware concreto: requiere NPU AMD XDNA2 en Ryzen AI Strix Halo, ademas del driver de NPU y XRT con su plugin. No hay soporte para GPU NVIDIA, AMD discreta ni CPU.
- Requisito operativo poco habitual: el reloj de fabric de la GPU debe mantenerse fijado mientras la NPU trabaja, lo que anade complejidad al despliegue en produccion.
- Versionado acoplado: cada version del servidor descarga la revision con la que se publico, y los ficheros de cabeza exigen halogen-flash-server >= 0.18.12. Mezclar versiones puede romper la carga.
- Licencia: Apache-2.0, pero la model card del origen pide que los despliegues respeten la Gemma Prohibited Use Policy; conviene revisar ambas antes de un uso comercial.
- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluaciones de terceros.
- Sin informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion o degradacion en recuperacion; al ser un modelo de embeddings, el riesgo no es generar contenido falso sino devolver vecinos semanticamente pobres.
- Limites de entrada: 8.192 tokens de texto y 30 segundos de audio por clip. Contenido mas largo debe trocearse externamente.
- Espacio de 768 dimensiones fijo: no se documenta soporte de truncamiento Matryoshka ni dimensiones alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-embeddinggemma-2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio del servidor: https://github.com/peonist-ai/halogen-flash-server
- Documentacion de NPU: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Issue de soporte NPU para EmbeddingGemma 2: https://github.com/peonist-ai/halogen-flash-server/issues/143
- Perfil del autor en GitHub: https://github.com/peonist-ai/
- Sitio del proyecto: https://peonist.ai/
- Discord: https://discord.gg/bcm6QknaV6
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Registro en free2aitools: https://free2aitools.com/model/peonist-ai/halogen-npu-embeddinggemma-2
