# dream-vault-community/Qwen3.5-27B-4bit-Abliterated

## Resumen

Qwen3.5-27B-4bit-Abliterated es un reempaquetado del modelo multimodal Qwen3.5 de 27 000 millones de parametros en formato MLX de 4 bits, publicado por el colectivo dream-vault-community. No se trata de un entrenamiento nuevo: el autor indica explicitamente que los pesos safetensors se conservan byte a byte respecto al repositorio de origen y que no se ha realizado ningun entrenamiento ni abliteracion adicional. El unico trabajo anadido consiste en adaptar el modelo para que sea compatible con mlx-swift-lm y con la aplicacion Dream Vault, anadiendo un `preprocessor_config.json` plano y sustituyendo la plantilla de chat de solo texto por la plantilla oficial de Qwen3.5 con soporte de imagenes.

La cadena de procedencia es larga y conviene tenerla presente: parte del Qwen3.5-27B original de Qwen, pasa por una destilacion de razonamiento etiquetada como Claude 4.6 Opus obra de Jackrong, despues por una variante abliterated del usuario Huihui y finalmente por una cuantizacion de 4 bits de mlx-community. Este repositorio es, por tanto, el cuarto eslabon de una cadena de derivados, y su interes practico es acotado: ofrece un paquete autocontenido con codificador de vision ya integrado, listo para ejecutarse en Apple Silicon mediante MLX.

El modelo resuelve el problema de disponer de un VLM de 27B cuantizado a 4 bits con pesos intactos y plantilla de imagen funcional para el ecosistema Swift/MLX, algo que los repositorios intermedios no garantizan. Ahora bien, el propio autor advierte de que no se han realizado benchmarks exhaustivos de calidad ni de seguridad: la validacion publicada es una prueba de humo con una imagen sintetica, no una evaluacion general de comprension de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo multimodal (image-text-to-text) de la familia Qwen3.5, con codificador de vision integrado y decodificador transformer |
| Parametros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 (formato MLX), tal como se suministra desde el repositorio de origen |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 (el upstream inmediato la declara pero no incluye fichero de licencia; el `LICENSE` se copia del release original de Qwen3.5-27B) |
| Formato de pesos | safetensors (MLX), mas `preprocessor_config.json`, `processor_config.json` y configuracion de modelo |
| Tamano del repositorio | 16,1 GB |
| Biblioteca | mlx |
| Pipeline | image-text-to-text |
| Modelo base | mlx-community/Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated-4bit (relacion: quantized) |
| Revision fijada del origen | 75bfb86c7d8e55a8b9aba658b03729abc7680922 |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de lo que se deduce del pipeline declarado (`image-text-to-text`) y de la mencion al procesador Qwen3VL para Swift. Se trata, por tanto, de un modelo vision-lenguaje de la familia Qwen3.5 con un codificador de vision ya incluido en el paquete de pesos. Los parametros de normalizacion de imagen, patch size, temporal patch size, merge size y limites de pixeles se mantienen identicos a los del repositorio de origen, aunque la informacion proporcionada no incluye sus valores concretos. Tampoco se detalla si la atencion es estandar o si emplea alguna variante lineal, ni si existe decodificacion especulativa.

En cuanto al entrenamiento, este repositorio no aporta ningun dato: no se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Lo unico documentado es la cadena de derivacion: un Qwen3.5-27B base, una destilacion de razonamiento atribuida a Claude 4.6 Opus, un proceso de abliteration realizado por el autor upstream y una cuantizacion de 4 bits. El autor de este reempaquetado subraya que la abliteration es una caracterizacion del autor original y no una garantia de comportamiento concreto, y que la plantilla de chat de texto se sustituyo por la plantilla oficial de Qwen3.5 con soporte de imagenes copiando tambien la configuracion del tokenizador. Se anaden `PROVENANCE.json` y `SHA256SUMS` para verificar la integridad respecto al origen.

## Capacidades

- Generacion de texto conversacional multi-turno en el formato de chat de Qwen3.5.
- Comprension de imagenes combinada con texto de entrada (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre una imagen y dialogos que alternan contenido visual y textual.
- Capacidad de razonamiento heredada de la destilacion de razonamiento del linaje upstream, si bien no se documenta de forma explicita ni se cuantifica en la informacion disponible.
- Ejecucion local en Apple Silicon mediante MLX, tanto desde Python (`mlx_vlm.generate`) como desde Swift a traves de mlx-swift-lm.
- Capacidades multilingues: no disponibles; la model card no declara lista de idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: se desconoce si conserva modos explicitos de razonamiento (thinking) o si soporta inferencia sobre video; el autor indica que la validacion no implica pruebas de video. La abliteration del linaje upstream implica, en principio, una reduccion de los rechazos ante peticiones sensibles, si bien el autor no garantiza ningun comportamiento concreto.

## Casos de uso

- Prototipado de aplicaciones Apple con vision: al estar empaquetado para mlx-swift-lm, permite integrar un VLM de 27B en una app de macOS o iOS (Apple Silicon) sin depender de servicios en la nube, ejecutando las imagenes localmente.
- Descripcion automatica de imagenes en flujos locales: uso de `mlx_vlm.generate --image ... --prompt "Describe this image."` para generar pies de foto o metadatos de una biblioteca de imagenes sin enviar el contenido a terceros.
- Analisis de capturas de pantalla y documentacion escaneada: al aceptar imagen y texto en el mismo turno, puede extraer e interpretar informacion de capturas o digitalizaciones en un dialogo de seguimiento.
- Asistente conversacional con contexto visual: conversaciones multi-turno donde el usuario adjunta imagenes y formula preguntas sucesivas sobre ellas, gestionando el historial a nivel de aplicacion ante la ausencia de dato publico sobre la ventana de contexto.
- Evaluacion de seguridad y red teaming: al tratarse de una variante abliterated, resulta util en investigacion sobre robustez y alineacion, para estudiar como responde un modelo sin rechazos ante contenidos sensibles en un entorno controlado.
- Pipeline de vision offline y reproducible: la publicacion de `SHA256SUMS` y `PROVENANCE.json` permite auditar integridad y reproducir exactamente los mismos pesos fijados a una revision concreta, algo relevante en entornos de investigacion.
- Generacion de descripciones para catalogos o inventarios en pequeno volumen: sobre un Mac con memoria unificada suficiente, se puede procesar lotes de imagenes mediante scripts de MLX sin infraestructura GPU dedicada.
- Comparacion de variantes cuantizadas: al mantener los safetensors sin modificar, sirve como referencia para medir el efecto del reempaquetado (plantilla de imagen, preprocesador) frente al repositorio upstream, aislando la variable de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad del modelo y su comportamiento de seguridad no se han evaluado de forma exhaustiva para este reempaquetado de compatibilidad. El unico material de validacion es un informe en `validation/REPORT.md` que recoge versiones de runtime y resultados de inferencia sobre una imagen sintetica, descrito por el propio autor como una prueba de humo y no como un benchmark general de comprension de imagenes.

## Requisitos de hardware

- Inferencia exclusivamente sobre Apple Silicon: el modelo esta en formato MLX y depende de MLX / mlx-vlm (Python) o mlx-swift-lm (Swift). No se distribuye en GGUF ni en safetensors de PyTorch, por lo que no es ejecutable directamente en CUDA.
- Memoria unificada estimada: los pesos ocupan unos 16,1 GB en disco (4 bits, group size 64). Como estimacion, se necesita memoria unificada libre superior a esa cifra para pesos mas cache KV y overhead de runtime; se recomienda un equipo con 32 GB o mas. Un Mac de 16 GB queda practicamente descartado y uno de 24 GB seria muy ajustado.
- Equipos recomendados: Apple M-series Pro, Max o Ultra con 32 GB o mas de memoria unificada; los chips Max y Ultra reducen la latencia por mayor ancho de banda de memoria. GPU NVIDIA (A100, H100, RTX 4090) no son compatibles sin una conversion previa de formato que no se documenta en la informacion disponible.
- Cabe en GPU de consumo: no aplica en el sentido convencional; el equivalente es memoria unificada en Mac. En un Mac con 32 GB de memoria unificada el modelo cabe, con margen limitado.
- Opciones de despliegue: `mlx-vlm` (Python) y `mlx-swift-lm` (Swift). No se mencionan soporte de vLLM, TGI, llama.cpp ni Ollama para este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de prefill para imagenes.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los eslabones de su propia cadena de derivacion, y de forma parcial. No se dispone de datos de benchmark de ninguna de las variantes, por lo que la comparacion se limita a formato, licencia y relacion de procedencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Relacion |
|---|---|---|---|---|---|
| dream-vault-community/Qwen3.5-27B-4bit-Abliterated | 27,36 mil millones | No disponible | safetensors MLX, 4-bit | apache-2.0 | Objeto de esta ficha |
| mlx-community/Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated-4bit | No disponible | No disponible | MLX, 4-bit | No disponible | Modelo base directo; plantilla de chat de solo texto |
| Qwen/Qwen3.5-27B | No disponible | No disponible | No disponible | apache-2.0 | Origen del linaje y de la licencia copiada |

Como alternativas de la misma categoria (VLM de aproximadamente 27B ejecutables en local) se podrian considerar otros modelos de la familia Qwen-VL o similares, pero la informacion proporcionada no incluye datos de ninguno de ellos, por lo que no se puede establecer una comparacion cuantitativa. Respecto a la variante upstream, la diferencia practica conocida es la sustitucion de la plantilla de chat por una con soporte de imagenes y la adicion del preprocesador plano para Swift; los pesos son identicos byte a byte.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluacion multimodal. La unica validacion es una prueba de humo con imagen sintetica, insuficiente para estimar calidad en produccion.
- Riesgo de alucinacion elevado en la parte visual: el autor advierte que las descripciones de imagenes generadas pueden ser inexactas.
- Comportamiento de seguridad no caracterizado: la abliteration es una etiqueta del autor upstream y no una garantia de comportamiento; se espera una reduccion de rechazos ante peticiones sensibles, con el consiguiente riesgo de generar contenido inapropiado o danino.
- Sesgos: no documentados, pero heredados de las fases previas (Qwen3.5 base, destilacion de razonamiento y abliteration). No hay evaluacion de sesgos disponible.
- Idiomas: la lista de idiomas soportados no esta disponible; no se puede asumir cobertura multilingue verificada.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar conversaciones largas o documentos extensos.
- Licencia: el upstream declara apache-2.0 pero no incluye fichero de licencia; el `LICENSE` de este repositorio se copia del release de Qwen3.5-27B. Es recomendable revisar la trazabilidad completa antes de un uso comercial, dado que hay tres derivados intermedios sin licencia propia documentada.
- Restriccion de plataforma: dependencia de MLX limita el despliegue a hardware Apple Silicon; no hay ruta documentada a CUDA, vLLM o llama.cpp.
- Cadena de custodia: la destilacion hace referencia a Claude 4.6 Opus como etiqueta de linaje; el autor aclara que no existe afiliacion con Anthropic, por lo que la etiqueta no debe interpretarse como una caracteristica tecnica verificada.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin historial de uso ni validacion por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dream-vault-community/Qwen3.5-27B-4bit-Abliterated
- Modelo base (upstream inmediato): https://huggingface.co/mlx-community/Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated-4bit/tree/75bfb86c7d8e55a8b9aba658b03729abc7680922
- Revision fijada del origen: 75bfb86c7d8e55a8b9aba658b03729abc7680922
- Licencia original de Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B/blob/fc05daec18b0a78c049392ed2e771dde82bdf654/LICENSE
- Informe de validacion: validation/REPORT.md (dentro del propio repositorio)
- Ficheros de procedencia citados en la model card: `PROVENANCE.json`, `SHA256SUMS`, `UPSTREAM_README.md`
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a la marca de electrodomesticos Dreame, al creador de contenido Dream y a la agencia de viajes eDreams), por lo que no se aporta ningun enlace adicional relevante ni papers, blogs o demos asociados.
