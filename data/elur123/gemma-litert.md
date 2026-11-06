# elur123/gemma-litert

## Resumen

`elur123/gemma-litert` no es un modelo entrenado por su autor, sino un espejo (mirror) de tres artefactos en formato LiteRT-LM publicados originalmente por Google a través de la organizacion `litert-community`: los builds on-device de Gemma 4 en sus variantes E2B-it y E4B-it, y el embedder EmbeddingGemma 2 text 270M. El repositorio existe para que la aplicacion Android AutoPal, que funciona de forma totalmente offline, pueda descargar los modelos desde una ubicacion estable sin requerir inicio de sesion en Hugging Face. Los ficheros son byte-identicos a los originales, verificables por SHA-256.

El interes tecnico esta en el formato: `.litertlm` es el contenedor de LiteRT-LM, el runtime de Google para ejecutar modelos generativos en dispositivo (Android, iOS, Linux, macOS, Windows, IoT). Frente a GGUF o safetensors, este formato esta optimizado para aceleracion por GPU movil (OpenCL), NPU y CPU con delegados especificos de LiteRT, lo que lo hace relevante para despliegues edge sin conectividad.

La relevancia practica es doble: por un lado, ofrece una via de acceso sin autenticacion a builds de Gemma 4 en un formato poco frecuente en el ecosistema abierto; por otro, sirve como referencia de como empaquetar un LLM y un modelo de embeddings en un mismo pipeline on-device. Conviene subrayar que el autor no documenta arquitectura, datos de entrenamiento ni benchmarks: toda la informacion tecnica del modelo subyacente debe consultarse en las model cards de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (propiedad del modelo base Gemma 4; no documentada en este repositorio) |
| Parametros totales | no disponible de forma explicita; la nomenclatura E2B y E4B sugiere escalas de 2B y 4B, y el embedder se declara como 270M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los artefactos `.litertlm` incorporan su propia cuantizacion interna, no declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con la Gemma 4 license page referenciada por el autor) |
| Formato de pesos | LiteRT-LM (`.litertlm`) |
| Tamano del repositorio | 6,4 GB |
| Ficheros incluidos | `gemma-4-E2B-it.litertlm` (2.588.147.712 bytes), `gemma-4-E4B-it.litertlm` (3.659.530.240 bytes), `embeddinggemma-2-text-270m.litertlm` (164.626.432 bytes) |
| Modelos base | google/gemma-4-E2B-it, google/gemma-4-E4B-it, google/embeddinggemma-2 |
| Runtime objetivo | LiteRT-LM (on-device) |
| Descargas | 29 |
| Likes | 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene informacion sobre la arquitectura interna, el corpus de entrenamiento, el numero de tokens procesados ni las fases de alineacion (RLHF, DPO) de los modelos subyacentes. El autor declara explicitamente que se trata de un mirror sin modificaciones y remite a las model cards originales de `google/gemma-4-E2B-it`, `google/gemma-4-E4B-it` y `google/embeddinggemma-2` para esos detalles.

Lo unico verificable a nivel tecnico es el empaquetado: los tres artefactos usan el contenedor LiteRT-LM, que agrupa pesos, tokenizador y metadatos en un unico fichero optimizado para el runtime LiteRT. Las sumas SHA-256 publicadas (`18193810...a63c` para E2B, `0b2a8980...52e0` para E4B y `2d079ee2...86fb` para el embedder) permiten comprobar la integridad y la equivalencia byte a byte con los builds de `litert-community`, lo que descarta cualquier fine-tuning o re-cuantizacion por parte del autor del mirror.

## Capacidades

- Generacion de texto conversacional en las variantes E2B-it y E4B-it (sufijo `-it` indica ajuste para instrucciones).
- Embeddings de texto con EmbeddingGemma 2 text 270M, utilizable para busqueda semantica, recuperacion y clustering.
- Ejecucion on-device sin conexion a red, que es precisamente el proposito del formato LiteRT-LM.
- Despliegue en dispositivos moviles y edge mediante el runtime LiteRT.
- No hay informacion en este repositorio sobre tool calling, function calling, modo thinking, vision, audio ni capacidades de agente; deben consultarse las model cards de Google.
- No se declaran capacidades multilingues especificas en este repositorio.

## Casos de uso

- Aplicaciones Android offline: AutoPal descarga estos ficheros para ofrecer asistencia generativa sin conexion; el mirror garantiza una URL estable y sin login que simplifica el arranque en frio de la app.
- Busqueda semantica local: el embedder de 270M (164 MB) permite indexar y recuperar documentos en el propio dispositivo, sin enviar texto a servidores externos, lo que resulta adecuado por privacidad y por latencia.
- Asistentes personales embebidos: la variante E2B (2,6 GB) encaja en dispositivos con 8 GB o mas de RAM como motor de respuestas cortas y resumenes.
- Prototipado de pipelines RAG on-device: combinando el embedder con E2B o E4B se puede montar un flujo de recuperacion y generacion completamente local para demos y validacion de producto.
- Distribucion de artefactos en entornos restringidos: al no requerir autenticacion, el repositorio sirve como origen para espejos internos en empresas o laboratorios con acceso limitado a Hugging Face.
- Verificacion de integridad en CI: los SHA-256 publicados permiten que un pipeline de build compruebe que los binarios descargados coinciden con los originales antes de empaquetarlos en un APK.
- Evaluacion comparativa de runtimes: util para medir latencia y consumo de LiteRT-LM frente a llama.cpp u otros runtimes en el mismo hardware movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero E2B ocupa 2,59 GB y el E4B 3,66 GB en disco; el embedder, 165 MB. La RAM necesaria en ejecucion no esta documentada y depende del runtime LiteRT.
- GPU recomendadas: no disponibles. LiteRT-LM esta pensado para GPU integradas moviles (Adreno, Mali) mediante OpenCL, NPU y CPU; no se documentan requisitos para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo en escritorio: no confirmada en este repositorio.
- Opciones de despliegue: runtime LiteRT-LM (Android, iOS, Linux, macOS, Windows, IoT). No se proporcionan builds para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` no es compatible con esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| elur123/gemma-litert (este repo) | E2B y E4B (escala) + embedder 270M | no disponible | LiteRT-LM | Apache 2.0 | Mirror sin modificaciones, sin autenticacion |
| litert-community/gemma-4-E2B-it-litert-lm | escala 2B | no disponible | LiteRT-LM | segun model card original | Fuente original del artefacto E2B |
| litert-community/gemma-4-E4B-it-litert-lm | escala 4B | no disponible | LiteRT-LM | segun model card original | Fuente original del artefacto E4B |
| google/gemma-4-E2B-it y E4B-it | escala 2B y 4B | no disponible | safetensors (previsible) | Gemma 4 license | Pesos de referencia para fine-tuning y servidor |

La comparacion con alternativas de otros ecosistemas (por ejemplo, modelos GGUF para llama.cpp) no es posible con los datos disponibles, porque no se declaran parametros exactos, contexto ni rendimiento medido.

## Limitaciones y advertencias

- El repositorio no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad; hay que remitirse a las model cards de Google.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue sin verificacion previa.
- El autor advierte que no esta afiliado ni respaldado por Google; el mirror no debe tratarse como canal oficial.
- Aunque el repositorio indica Apache 2.0, los modelos base remiten a la Gemma 4 license page; conviene revisar ambas antes de un uso comercial para evitar conflictos.
- El formato `.litertlm` limita el despliegue a LiteRT-LM: no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI.
- La ausencia de autenticacion facilita el acceso, pero tambien implica que la disponibilidad depende de un unico repositorio personal con solo 29 descargas; para produccion conviene cachear los ficheros o replicarlos.
- No hay informacion sobre cuantizacion interna, por lo que el equilibrio precision/rendimiento de los artefactos no puede evaluarse a priori.
- Al ser un mirror, cualquier correccion o actualizacion de los modelos originales no se reflejara automaticamente; hay que comprobar los SHA-256 contra `litert-community`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elur123/gemma-litert
- Fuente original E2B: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Fuente original E4B: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Fuente original del embedder: https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm
- Model card google/gemma-4-E2B-it: https://huggingface.co/google/gemma-4-E2B-it
- Model card google/gemma-4-E4B-it: https://huggingface.co/google/gemma-4-E4B-it
- Model card google/embeddinggemma-2: https://huggingface.co/google/embeddinggemma-2
- Pagina de licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
