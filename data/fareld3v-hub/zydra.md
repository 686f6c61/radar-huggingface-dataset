# fareld3v-hub/zydra

## Resumen

Zydra es un modelo de generación de texto de pequeno tamano (aproximadamente 630 millones de parametros) publicado por el usuario fareld3v-hub en Hugging Face bajo licencia Apache 2.0. Se distribuye principalmente en formato GGUF y esta pensado para ejecutarse en local mediante llama.cpp dentro de un contenedor Docker, acompanado de un modelo de vision independiente (SmolVLM2-500M) que se sirve en un proceso separado. La model card esta redactada en indonesio y describe sobre todo el despliegue del sistema, no el entrenamiento del modelo.

El modelo se presenta como un ajuste LoRA (la nomenclatura interna es `zydra-loRa`) orientado a conversacion en indonesio (`language: id`). El repositorio incluye pesos en GGUF y un archivo `mmproj`, aunque el servidor de chat de texto se lanza deliberadamente con `--no-mmproj`, de modo que las capacidades de vision recaen en el modelo SmolVLM2 auxiliar y no en Zydra.

Su relevancia es limitada pero concreta: ofrece un paquete de despliegue autocontenido (API compatible con OpenAI, dos servidores llama.cpp, pagina de chat y soporte para Railway) que permite montar un asistente conversacional y de vision de bajo coste en CPU. No hay informacion publica sobre datos de entrenamiento, benchmarks ni evaluaciones de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); ajuste tipo LoRA segun la model card |
| Parametros totales | 629.697.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens por defecto (`CHAT_CONTEXT_SIZE`) |
| Tipos de cuantizacion | GGUF (el repo incluye `zydra-loRa.gguf`; niveles exactos no disponibles) |
| Idiomas soportados | indonesio (`id`) declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamano de repo 1.0 GB; descarga indicada ~572 MiB entre modelo y mmproj) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura base, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card unicamente indica que se trata de un ajuste LoRA (de ahi el nombre `zydra-loRa`) con etiqueta de idioma indonesio, y que el artefacto distribuido es un GGUF destinado a `llama-server`.

El sistema de despliegue separa dos procesos: `zydra-vision`, que carga SmolVLM2-500M-Video-Instruct en cuantizacion Q8_0 junto con su `mmproj` y atiende exclusivamente `/v1/chat/vision`, y `zydra-loRa`, que carga `zydra-loRa.gguf` con `--no-mmproj` y atiende `/v1/chat/completions` y `/v1/prompt`. Esta separacion evita que el modelo de texto responda a peticiones con imagen y viceversa. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en indonesio, con un contexto efectivo de 2048 tokens.
- API compatible con el esquema de OpenAI (`/v1/chat/completions`, `/v1/prompt`), lo que facilita la integracion con clientes existentes.
- Endpoint de vision independiente (`/v1/chat/vision`) que acepta imagenes por URL (`image_link`) o en base64 (`image_data`), servido por SmolVLM2-500M y no por Zydra.
- Rechazo explicito de peticiones mal enrutadas: HTTP 422 si se envia `image_data` a `/v1/chat/completions` y HTTP 400 si se solicita `zydra-loRa` en el endpoint de vision.
- Endpoints de operacion: `/ready` (HTTP 200 cuando ambos modelos estan cargados) y `/health` con los campos `chat_ready`, `vision_ready` y `models`.
- Autenticacion mediante token Bearer (`AUTH`) para la API y la pagina de chat.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Asistente conversacional local en indonesio: el modelo puede atender dialogos multi-turno de hasta 2048 tokens en un equipo sin GPU, ya que corre sobre `llama-server` en CPU con 4 hilos por defecto.
- Despliegue de bajo coste en PaaS: la model card describe explicitamente el despliegue en Railway con un unico servicio Docker, volumen en `/data` y dominio publico, adecuado para prototipos y demos internas.
- Clasificacion y descripcion de imagenes en un flujo separado: enviando la imagen a `/v1/chat/vision` se obtiene una respuesta de SmolVLM2-500M, util para etiquetado rapido o accesibilidad sin cargar un modelo multimodal grande.
- Backend de una interfaz de chat propia: la pagina web incluida en el contenedor usa automaticamente `zydra-vision` cuando hay imagen adjunta y `zydra-loRa` para texto, lo que sirve como base para un portal interno de pruebas.
- Evaluacion de pipelines compatibles con OpenAI: al exponer `/v1/chat/completions`, el modelo puede conectarse a frameworks que esperan ese contrato para pruebas de integracion sin coste de API externa.
- Entorno de experimentacion con LoRA y GGUF: el repo y el proyecto `ZydraModel` permiten sustituir `CHAT_MODEL_REPO` y `CHAT_MODEL_FILE` por otros GGUF, lo que facilita comparar variantes sobre la misma infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el despliegue de referencia es en CPU mediante llama.cpp. Con ~630 M de parametros en GGUF, el peso del modelo ronda los 0,4-0,7 GB segun cuantizacion, y el conjunto descargable (modelo de chat + SmolVLM2 Q8_0 + mmproj) se cifra en ~572 MiB.
- GPU recomendadas: no disponibles. Cualquier GPU consumer con suficiente memoria libre para el GGUF (por ejemplo, 2-4 GB) podria alojarlo, pero no hay datos publicados de rendimiento en GPU.
- CPU: configuracion por defecto de 4 hilos (`CHAT_THREADS`, `VISION_THREADS`) y contexto de 2048 tokens para cada modelo.
- Opciones de despliegue: Docker Compose con dos instancias de `llama-server`, API propia en el puerto 8000 y Railway mediante `Dockerfile`. No se documenta soporte para vLLM ni TGI (el formato GGUF lo orienta a llama.cpp/Ollama).
- Latencia y throughput: no disponibles. La model card solo indica que hay que esperar a que `/ready` devuelva HTTP 200 tras la descarga inicial de ambos modelos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zydra | 629.697.920 | 2048 (por defecto) | indonesio | Apache 2.0 | GGUF |
| SmolVLM2-500M-Video-Instruct | ~500 M (no confirmado en la informacion) | 2048 en este despliegue | no disponible | no disponible | GGUF |
| Alternativas de ~0,5-1 B para texto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluaciones publicadas: no hay benchmarks, ni datos de entrenamiento, ni informes de calidad, lo que impide estimar su fiabilidad frente a alternativas conocidas.
- Ventana de contexto muy reducida (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Idioma limitado al indonesio segun la model card; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion no cuantificado; al ser un modelo de ~630 M de parametros, la coherencia en razonamiento y matematicas sera limitada.
- La model card no documenta sesgos; aun asi, un ajuste LoRA sobre datos no descritos puede heredar sesgos del modelo base y del corpus utilizado.
- El modelo de vision es un componente distinto (SmolVLM2-500M) con su propia licencia, que no se detalla en la informacion disponible; conviene verificar sus terminos antes de uso comercial.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte, y el repositorio tiene 0 likes y 563 descargas, lo que sugiere poca validacion por parte de la comunidad.
- El sistema no expone los puertos internos de `llama-server` (8081 y 8082) al host, lo que limita el acceso directo a los modelos fuera de la API.
- La documentacion esta en indonesio y esta orientada al despliegue, no al uso del modelo como biblioteca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fareld3v-hub/zydra
- Repositorio de despliegue: https://github.com/fareldev-hub/ZydraModel
- Modelo de vision por defecto (GGUF): https://huggingface.co/ggml-org/SmolVLM2-500M-Video-Instruct-GGUF
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
