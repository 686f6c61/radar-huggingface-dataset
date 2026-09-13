# dream-vault-community/Qwen3.5-4B-4bit-Abliterated

## Resumen

Qwen3.5-4B-4bit-Abliterated es un modelo multimodal de imagen y texto publicado por la comunidad dream-vault-community. No se trata de un entrenamiento nuevo, sino de un reempaquetado del modelo mlx-community/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-4bit, cuyo linaje declarado es una destilación de razonamiento tipo Claude 4.6 Opus sobre Qwen3.5, seguida de una ablación de direcciones de rechazo (abliteration) y de una cuantización a 4 bits. El objetivo del reempaquetado es doble: ofrecer una release autónoma lista para usar con MLX y garantizar compatibilidad con mlx-swift-lm mediante la incorporación de un preprocessor_config.json plano y de la plantilla de chat oficial de Qwen3.5 con soporte de imagen.

El modelo pesa 4.539.265.536 parámetros reales según los ficheros safetensors, ocupa 3,1 GB en el repositorio y se distribuye en cuantización 4-bit afín con group size 64, tal y como se recibió del upstream. Incluye su codificador de visión ya integrado y todos los safetensors se han preservado byte a byte: no hubo entrenamiento adicional ni una segunda pasada de abliteration en esta release.

Su relevancia es práctica y de nicho: es una pieza pensada para el ecosistema Apple Silicon, con pipeline image-text-to-text, licencia Apache-2.0 y cero dependencias de CUDA. Resulta útil para quien necesite un VLM de ~4,5B ejecutable en local en un Mac, con una ventana de contexto y unos idiomas que la información publicada no especifica. Las únicas validaciones declaradas son un smoke test con imagen sintética recogido en validation/REPORT.md, no un benchmark general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 multimodal (image-text-to-text) con codificador de vision integrado; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (aprox. 4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín (affine) con group size 64; no se listan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (el upstream inmediato la declara pero no incluye fichero de licencia; el LICENSE se copia de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors en formato MLX (libreria: mlx); no hay GGUF |
| Tamano del repositorio | 3,1 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | mlx-community/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-4bit (relacion: quantized) |
| Revision fijada del origen | a0cd61406062a7bee31fc995a806fdb876f318ed |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion / actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio (qwen3_5, vision, image-text-to-text) y del uso de un procesador compatible con Qwen3VL en el lado Swift. Se trata, por tanto, de un modelo multimodal de la familia Qwen3.5 que procesa imagen y texto de forma conjunta y que incorpora su propio codificador de vision. No se especifican numero de capas, dimension oculta, mecanismo de atencion, tamano de parche, resolucion de entrada ni limites de pixeles; la model card solo indica que los ajustes de normalizacion de imagen, patch size, temporal patch size, merge size y limites de pixeles se mantienen identicos a los del modelo de origen.

En cuanto al entrenamiento, esta release no entrena nada. El linaje declarado es el siguiente: un Qwen3.5-4B destilado en razonamiento a partir de Claude 4.6 Opus (etiqueta del autor upstream Jackrong), despues sometido a abliteration por Huihui y cuantizado a 4 bits por mlx-community; finalmente dream-vault-community lo reempaqueta preservando los safetensors byte a byte. No hay datos sobre volumen de tokens, composicion del dataset, uso de RLHF o DPO, ni sobre el metodo concreto de abliteration empleado; la propia model card advierte que "abliterated" es la caracterizacion del autor upstream y no una garantia de comportamiento.

La unica modificacion tecnica de este reempaquetado es de compatibilidad: se anade un preprocessor_config.json plano derivado de la configuracion anidada del procesador de imagen, para el procesador Qwen3VL de Swift; se conservan el processor_config.json y la configuracion del modelo originales; y se sustituye la plantilla de chat de solo texto por la plantilla oficial de Qwen3.5 con soporte de imagen, incluyendo la copia de la configuracion del tokenizador.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Comprension de imagen y texto combinados (image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre una imagen.
- Razonamiento destilado: el linaje declara una destilacion de razonamiento tipo Claude 4.6 Opus, aunque no se publican evaluaciones que lo cuantifiquen.
- Comportamiento "abliterated": se ha eliminado (segun el autor upstream) la direccion de rechazo, lo que en la practica reduce las negativas del modelo. No es una capacidad funcional verificada.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Soporte de tool calling o function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Modo "thinking" explicito: no disponible.
- Entrada de video: la model card afirma explicitamente que no implica haber probado inferencia sobre video.
- Capacidad de vision solo por imagen; no se declara audio.

## Casos de uso

- Inferencia local en Mac para descripcion de imagenes: con `mlx_vlm.generate`, el modelo acepta una ruta de imagen y un prompt y genera una descripcion; al pesar 3,1 GB en 4 bits, cabe en un portatil Apple Silicon con memoria unificada modesta, sin GPU dedicada.
- Prototipado de aplicaciones Swift con vision: el reempaquetado existe precisamente para mlx-swift-lm, de modo que encaja en el desarrollo de apps macOS/iOS que necesiten un VLM integrado en el binario y no en un servicio remoto.
- Preprocesado de imagenes en pipelines locales de documentacion: generacion automatica de pies de foto o descripciones alternativas para lotes de imagenes en un flujo offline, evitando enviar datos a terceros.
- Experimentacion en investigacion sobre alineacion y rechazo: al ser una variante abliterada, sirve como punto de comparacion frente a la version no abliterada para estudiar como cambia el comportamiento del modelo en prompts que normalmente dispararian una negativa; conviene tratarlo como objeto de estudio, no como producto.
- Asistente conversacional de bajo coste en edge: su tamano de 4,5B y su cuantizacion 4-bit permiten mantener conversaciones multi-turno con consumo de memoria reducido en hardware Apple, con la salvedad de que la longitud de contexto no esta documentada.
- Demostraciones y evaluaciones de compatibilidad de runtimes: util para verificar que una version concreta de mlx-vlm o de mlx-swift-lm carga correctamente un Qwen3.5 multimodal, tal y como hace el propio smoke test del repositorio.
- Generacion de texto y codigo de uso general: el modelo conserva las capacidades del Qwen3.5-4B subyacente para tareas de texto, aunque el autor no publica mediciones que las respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica evidencia de funcionamiento es validation/REPORT.md, descrito por el autor como un smoke test con imagen sintetica (versiones de runtime, resultado de la inferencia y limitaciones), que el propio repositorio califica explicitamente como "no un benchmark general de comprension de imagenes". No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX. No hay pesos GGUF ni CUDA, por lo que no se ejecuta de forma nativa en GPU NVIDIA.
- Memoria: el repositorio ocupa 3,1 GB. Como estimacion derivada de ese tamano y de la cuantizacion 4-bit declarada (no un dato publicado por el autor), los pesos en memoria rondarian los 2,3-3,1 GB, a lo que hay que sumar el cache KV y el overhead del runtime. Un Mac con 8 GB de memoria unificada seria el minimo ajustado; 16 GB o mas es lo recomendable para contexto largo y procesamiento de imagenes.
- GPU recomendadas: no aplica el catalogo A100/H100/RTX 4090, al ser un formato MLX. Los equipos objetivo son los chips de Apple (serie M).
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple Silicon de consumo; no hay soporte declarado para GPU de consumo NVIDIA u AMD.
- Opciones de despliegue: `mlx_vlm.generate` (Python) con una version de mlx-vlm que soporte Qwen3.5, y mlx-swift-lm desde Swift. El uso con vLLM, llama.cpp, Ollama o TGI no esta contemplado ni confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que los resultados de validacion en runtime se registran aparte y que la tarjeta no implica haber probado runtimes no listados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dream-vault-community/Qwen3.5-4B-4bit-Abliterated | 4,54B | no disponible | si (image-text-to-text) | 4-bit afín, group size 64 | apache-2.0 | MLX, repo de 3,1 GB, 0 descargas |
| mlx-community/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-4bit | no disponible (mismo linaje, 4B nominal) | no disponible | si (segun etiquetas del linaje) | 4-bit | declarada Apache-2.0 sin fichero de licencia | MLX, upstream inmediato |
| Qwen/Qwen3.5-4B | 4B nominal | no disponible | no disponible | no aplica (pesos originales) | Apache-2.0 (origen del fichero LICENSE copiado) | HuggingFace, release original de Qwen |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad. Cualquier otra alternativa de la misma categoria (por ejemplo, otros VLM de ~4B en MLX) no aparece en la informacion proporcionada y se marca como no disponible.

## Limitaciones y advertencias

- No es un modelo entrenado ni evaluado por el publicador: es un reempaquetado de compatibilidad. La calidad y el comportamiento de seguridad "no fueron evaluados de forma exhaustiva", segun la propia model card.
- Riesgo de alucinacion en vision: el autor advierte literalmente de que las descripciones de imagen generadas pueden ser inexactas.
- La etiqueta "abliterated" procede del autor upstream y no garantiza ningun comportamiento concreto; puede implicar una reduccion de negativas ante peticiones sensibles y, por tanto, un mayor riesgo en produccion.
- Sesgos conocidos: no documentados en la informacion disponible. Al no haber evaluaciones, no puede descartarse la herencia de sesgos del modelo base ni de la destilacion.
- Idiomas soportados: no declarados; el rendimiento fuera de los idiomas mayoritarios del modelo original es desconocido.
- Longitud de contexto: no documentada, lo que impide planificar despliegues que dependan de ventanas largas.
- Restricciones de licencia: se declara Apache-2.0, pero el upstream inmediato no incluye fichero de licencia y el LICENSE del repositorio se copia de Qwen/Qwen3.5-4B. Conviene verificar la cadena de licencias antes de un uso comercial, especialmente por la clausula de origen de los pesos destilados.
- Sin soporte declarado para video: la model card indica que no implica pruebas de inferencia sobre video.
- Ecosistema restringido: al estar en formato MLX, no es portable a llama.cpp, vLLM o TGI sin conversion adicional, que no se proporciona.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, sin historial de uso en produccion.
- Las versiones de runtime importan: requiere MLX y una version de mlx-vlm que soporte Qwen3.5; versiones anteriores pueden fallar al cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dream-vault-community/Qwen3.5-4B-4bit-Abliterated
- Modelo base (upstream inmediato): https://huggingface.co/mlx-community/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-4bit/tree/a0cd61406062a7bee31fc995a806fdb876f318ed
- Release original de Qwen3.5-4B, origen del fichero LICENSE: https://huggingface.co/Qwen/Qwen3.5-4B/blob/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/LICENSE
- Informe de validacion interno: validation/REPORT.md (dentro del repositorio)
- Ficheros de procedencia: PROVENANCE.json, SHA256SUMS y UPSTREAM_README.md (dentro del repositorio)

Nota sobre la busqueda web: los resultados devueltos (DreameTech, eDreams, el YouTuber Dream) no guardan relacion con este modelo y no aportan informacion adicional utilizable. No se han encontrado papers, blogs ni demos asociados al modelo en la informacion proporcionada.
