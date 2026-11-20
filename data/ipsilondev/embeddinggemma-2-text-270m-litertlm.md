# ipsilondev/embeddinggemma-2-text-270m-litertlm

## Resumen

EmbeddingGemma 270M (LiteRT-LM) es un espejo sin modificaciones del modelo de embeddings de texto `litert-community/embeddinggemma-2-text-270m-litert-lm`, publicado por el usuario ipsilondev para garantizar compilaciones reproducibles de sus aplicaciones Android (Ipsilon). Se trata de un modelo derivado de EmbeddingGemma 2 de Google, orientado a la generación de vectores de frase (sentence embeddings) para tareas de recuperación y similitud semántica, empaquetado en formato LiteRT-LM para inferencia en dispositivo.

El artefacto principal es un único fichero `.litertlm` de 164.626.432 bytes (aproximadamente 157 MB) con SHA-256 verificado, destinado al runtime Google AI Edge LiteRT-LM en Android mediante la dependencia Maven `com.google.ai.edge.litertlm:litertlm-android`. El repositorio completo ocupa 0,2 GB. No se realizó conversión ni recuantización respecto al upstream: el espejo preserva exactamente los pesos del commit `9be6e8b90982095dc05c2bd162e4b954ee4dbac7`.

La relevancia de esta ficha es acotada: no aporta un modelo nuevo, sino un punto de descarga estable y verificable para pipelines de CI/CD móviles. Su interés práctico reside en la combinación de tamaño reducido (270M), licencia Apache-2.0 sin gating y despliegue puramente on-device, lo que lo hace apto para funciones de búsqueda semántica y similitud de texto dentro de apps Android sin dependencia de servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings de texto; arquitectura subyacente no detallada en la informacion proporcionada) |
| Parametros totales | 270M (segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el espejo no aplica recuantizacion; se distribuye el artefacto preconvertido upstream) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 (sin gating) |
| Formato de pesos | LiteRT-LM (`.litertlm`), fichero `embeddinggemma-2-text-270m.litertlm` de 164.626.432 bytes |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del espejo no documenta estos aspectos y se limita a declarar la procedencia del artefacto.

Lo unico verificable tecnicamente es el proceso de publicacion: descarga directa mediante `huggingface_hub.hf_hub_download` desde el repositorio `litert-community/embeddinggemma-2-text-270m-litert-lm`, sin conversion de formato ni recuantizacion, con hash SHA-256 `2d079ee2f6f066b1f368e8d7c819f55214eaef1d0513b312321901f30ab286fb` como garantia de integridad. El resultado es un artefacto LiteRT-LM consumible por el runtime Google AI Edge en Android.

## Capacidades

- Generacion de embeddings de texto (vectores de frase) para similitud semantica y recuperacion, segun la model card ("Doc Core text embeddings (sentence vectors)").
- Inferencia on-device en Android mediante LiteRT-LM, sin envio de texto a servidores externos.
- Integracion via Maven (`com.google.ai.edge.litertlm:litertlm-android`).
- Tool calling / function calling: no disponible (no es un modelo generativo conversacional segun la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Busqueda semantica local en apps Android: indexar documentos del usuario y recuperar fragmentos por similitud vectorial sin salir del dispositivo, aprovechando el formato LiteRT-LM y el runtime Google AI Edge.
- Clasificacion y agrupamiento de texto en movil: generar embeddings de notas, mensajes o etiquetas para clustering y deduplicacion offline, con un artefacto de unos 157 MB embebible en el APK.
- Filtrado de contenido y deteccion de duplicados: comparar vectores de frases para identificar entradas redundantes en bases de datos locales del dispositivo.
- RAG on-device para asistentes locales: usar los embeddings como capa de recuperacion en un pipeline de pregunta-respuesta que mantiene los datos en el telefono.
- Pipelines CI/CD reproducibles para apps Android: el hash SHA-256 publicado permite verificar la integridad del artefacto en cada build, evitando derivas por actualizaciones del upstream.
- Prototipado rapido de funciones de similitud: al estar bajo Apache-2.0 y sin gating, se puede integrar en pruebas internas y demos sin gestion de acceso al repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el artefacto pesa 164.626.432 bytes (aproximadamente 157 MB), lo que sugiere huella de memoria del orden de cientos de MB, pero no se documenta el consumo real en runtime.
- GPU recomendadas: no disponible; el destino declarado es inferencia on-device en Android mediante LiteRT-LM, no GPU de servidor.
- Cabe en GPU consumer: no disponible como dato verificado; el modelo esta empaquetado para movil, no para aceleradores de escritorio.
- Opciones de despliegue: Google AI Edge LiteRT-LM en Android (Maven `com.google.ai.edge.litertlm:litertlm-android`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma 270M (LiteRT-LM, este espejo) | 270M | no disponible | Apache-2.0 | LiteRT-LM | Hugging Face, sin gating |
| litert-community/embeddinggemma-2-text-270m-litert-lm (upstream) | 270M | no disponible | Apache-2.0 | LiteRT-LM | Hugging Face, sin gating |
| Otros modelos de embeddings on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el repositorio upstream, del que este espejo es copia bit a bit. No se dispone de informacion sobre alternativas de la misma categoria (embeddings de texto para movil) para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- No aporta ninguna mejora ni modificacion respecto al upstream: es un espejo exacto, por lo que hereda todas las limitaciones del modelo original, que no se documentan en la informacion proporcionada.
- La model card no declara lista de idiomas, contexto maximo ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para casos multilingues o textos largos.
- Riesgo de alucinacion: no aplica en sentido estricto al ser un modelo de embeddings, pero la calidad de los vectores dependera de dominios y idiomas no documentados.
- Sesgos conocidos: no disponible.
- Licencia Apache-2.0 permite uso comercial, pero la model card del espejo incluye una nota ambigua sobre la licencia de EmbeddingGemma 2 que conviene verificar en el repositorio upstream antes de un despliegue en produccion.
- Dependencia del runtime propietario Google AI Edge LiteRT-LM: el artefacto no es portable a otros motores de inferencia sin conversion adicional.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; la unica garantia de integridad es el hash SHA-256 publicado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ipsilondev/embeddinggemma-2-text-270m-litertlm
- Modelo upstream: https://huggingface.co/litert-community/embeddinggemma-2-text-270m-litert-lm
- Runtime Google AI Edge LiteRT-LM: no disponible (no se proporciona URL en la informacion disponible)
