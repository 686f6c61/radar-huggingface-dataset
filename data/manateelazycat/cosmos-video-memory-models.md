# manateelazycat/cosmos-video-memory-models

## Resumen

Cosmos video memory models es un bundle de pesos publicado por el usuario manateelazycat que empaqueta, sin modificaciones, tres modelos de terceros destinados a un plugin de memoria de vídeo para la aplicacion Camera y su AI Pod. El paquete no contiene un modelo entrenado por el autor: agrupa un modelo de embeddings de vídeo (nvidia/Cosmos-Embed1-336p), un reranker multimodal basado en Qwen3-VL de 2B parametros y un modelo de razonamiento (nvidia/Cosmos3-Edge), cada uno fijado a una revision concreta de su repositorio original. El repositorio ocupa 15,8 GB e incluye tambien dependencias de configuracion offline y materiales de licencia.

La relevancia de este bundle es practica: sirve como snapshot reproducible de un pipeline de recuperacion de video (embedding, reranking y razonamiento) con revisiones bloqueadas y manifiesto de ficheros con SHA-256, lo que facilita despliegues auditables. No obstante, el propio autor advierte de que se trata de una vista previa: la validacion de negocio de extremo a extremo esta en curso y la publicacion no implica que la aplicacion este lista ni que el modelo haya sido validado.

Al no ser un modelo unico, sus especificaciones tecnicas dependen del componente que se utilice. La informacion disponible no detalla parametros totales, contexto ni datos de entrenamiento de cada componente, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de tres modelos: embedding de video (Cosmos-Embed1-336p), reranker multimodal (Qwen3-VL-Reranker-2B) y razonamiento (Cosmos3-Edge); arquitecturas individuales no detalladas en la informacion disponible |
| Parametros totales | No disponible (solo se conoce 2B para el componente de reranking) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Multiple-model-licenses: NVIDIA Open Model License (Embed1), Apache 2.0 (Qwen3-VL-Reranker-2B), OpenMDW 1.1 (Cosmos3-Edge) |
| Formato de pesos | safetensors; libreria diffusers; manifiesto `model-files.manifest.json` con tamano y SHA-256 por fichero |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: es un bundle de inferencia que fija revisiones upstream. El componente de embeddings es nvidia/Cosmos-Embed1-336p (revision 0e8a28f7bf370f2dcb3b9b61d23e167d0d6b0e6f), orientado a extraccion de caracteristicas de video. El componente de reranking es Qwen/Qwen3-VL-Reranker-2B (revision 4bd860ac4f15ad1897a214615cccc700f8f71818), un reranker multimodal de 2B parametros bajo Apache 2.0. El componente de razonamiento es nvidia/Cosmos3-Edge (revision 344d602b128d1bbdacb43b08d0a3626f46343e29), bajo OpenMDW 1.1.

El autor indica que los ficheros de pesos y el codigo ejecutable no fueron modificados; solo se excluyeron metadatos de Git y un `__init__.py` del componente Embed que contenia unicamente comentarios de copyright. Se incluyen un manifiesto con tamano y SHA-256 de cada fichero entregado, un alias cache offline con espacio de nombres por huella y una dependencia BERT solo de configuracion para el loader de Embed. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) de los componentes.

## Capacidades

- Extraccion de caracteristicas y embeddings de video (componente Cosmos-Embed1-336p), adecuada para recuperacion de video.
- Reranking multimodal de candidatos recuperados (componente Qwen3-VL-Reranker-2B).
- Razonamiento sobre contenido de video dentro del pipeline (componente Cosmos3-Edge).
- Pipeline de recuperacion de video en tres etapas: embedding, reranking y razonamiento.
- Soporte de idiomas ingles y chino.
- Empaquetado reproducible con revisiones fijadas y verificacion por SHA-256.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en archivos de video: generar embeddings con Cosmos-Embed1-336p y recuperar clips candidatos por similitud, apropiado por su rol especifico de extraccion de caracteristicas de video.
- Reordenacion de resultados de recuperacion: aplicar Qwen3-VL-Reranker-2B sobre los candidatos para mejorar la precision del ranking antes de mostrarlos al usuario.
- Analisis y respuesta sobre clips recuperados: usar Cosmos3-Edge para razonar sobre el contenido del video seleccionado y producir una respuesta o resumen.
- Despliegue reproducible en entornos aislados: montar los ficheros como volumenes de solo lectura y verificar integridad con el manifiesto SHA-256, util en entornos con requisitos de auditoria.
- Plugin de memoria de video para aplicaciones de escritorio: integracion en la aplicacion Camera mediante el plugin de memoria de video y su AI Pod, tal como describe el autor.
- Pipeline multilingue ingles-chino: procesar y consultar contenido de video en ambos idiomas soportados.
- Prototipado de sistemas de recuperacion de video con licencias permisivas parciales: el componente de reranking es Apache 2.0, lo que facilita su evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 15,8 GB en total, pero no se desglosa el tamano por componente ni el consumo en ejecucion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es diffusers; el autor menciona imagenes de runtime especificas por destino seleccionadas por el plugin, sin detallar vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| manateelazycat/cosmos-video-memory-models (bundle) | No disponible (reranker de 2B incluido) | No disponible | Multiple-model-licenses | HuggingFace, 0 descargas |
| nvidia/Cosmos-Embed1-336p | No disponible | No disponible | NVIDIA Open Model License | Upstream en HuggingFace |
| Qwen/Qwen3-VL-Reranker-2B | 2B | No disponible | Apache 2.0 | Upstream en HuggingFace |
| nvidia/Cosmos3-Edge | No disponible | No disponible | OpenMDW 1.1 | Upstream en HuggingFace |

La comparativa relevante es contra los propios componentes upstream, ya que el bundle no aporta pesos nuevos. No se dispone de datos de rendimiento para comparar metricas.

## Limitaciones y advertencias

- El autor declara explicitamente que la validacion de negocio de extremo a extremo esta en curso y que la publicacion no implica que la aplicacion este lista ni que el modelo haya sido validado.
- No se declaran completadas la instalacion ordinaria, el rendimiento nativo, la calidad factual en chino, el modo triple ni la validacion de ejecuciones largas.
- Es un bundle de terceros: los riesgos de sesgo y alucinacion dependen de cada componente upstream y no se documentan en esta informacion.
- La licencia es compuesta (NVIDIA Open Model License, Apache 2.0 y OpenMDW 1.1); el uso comercial requiere revisar cada licencia por componente en `weights/license-materials/`.
- Idiomas limitados a ingles y chino; el resto de idiomas no estan declarados.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en produccion por la comunidad.
- El bundle no incluye codigo ejecutable modificado ni garantiza compatibilidad con versiones futuras de diffusers.

## Enlaces

- HuggingFace: https://huggingface.co/manateelazycat/cosmos-video-memory-models
- Materiales de licencia: https://huggingface.co/manateelazycat/cosmos-video-memory-models/blob/main/weights/license-materials/README.md
- Componente de embeddings: https://huggingface.co/nvidia/Cosmos-Embed1-336p
- Componente de reranking: https://huggingface.co/Qwen/Qwen3-VL-Reranker-2B
- Componente de razonamiento: https://huggingface.co/nvidia/Cosmos3-Edge
