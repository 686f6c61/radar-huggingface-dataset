# jongstra/Qwen3.8-27B-Abliterated-MLX-6bit-fp16-mtp

## Resumen

`jongstra/Qwen3.8-27B-Abliterated-MLX-6bit-fp16-mtp` es una conversion no oficial de la comunidad, publicada por el usuario jongstra, del modelo `PocketAiHub/Qwen3.8-27B-Abliterated-MLX`. Se trata de un modelo multimodal (pipeline `image-text-to-text`, con torre de vision) de aproximadamente 27,8 mil millones de parametros, empaquetado en formato MLX safetensors para su ejecucion en Apple Silicon a traves del runtime oMLX. El repositorio ocupa 23,2 GB y esta etiquetado con `qwen3_5` y `qwen3.8`, lo que lo situa en la familia Qwen3.8, aunque el autor no detalla la arquitectura interna mas alla de la presencia de vision y de una cabeza MTP.

El valor diferencial de esta ficha no esta en el modelo base, sino en las dos modificaciones que introduce respecto a su predecesor. La primera es un cambio de tipo de almacenamiento: todos los tensores no cuantizados (normalizaciones, torre de vision, escalas y sesgos de cuantizacion) se guardan en FP16 en lugar de BF16, para aprovechar la ruta de prefill FP16 mas rapida de oMLX en Macs M1/M2. La segunda es la restauracion de la cabeza MTP (multi-token prediction) para decodificacion especulativa, que el modelo de origen habia eliminado pese a declarar `mtp_num_hidden_layers: 1` en su configuracion; se injertan 29 tensores procedentes de `metajazz/Qwen3.8-27B-oQ6-fp16-mtp`.

Es relevante ahora por tres motivos: es uno de los pocos artefactos publicos que recompone la decodificacion especulativa en un VLM de ~27B para MLX, aporta mediciones locales de velocidad con y sin MTP en un Mac Studio M2 Ultra, y documenta de forma explicita el proceso de abliteracion heredado (supresion de la direccion de rechazo en 80 matrices de proyeccion de salida de las capas 24 a 63). La licencia es Apache 2.0 y el propio autor advierte de que no esta afiliado a Alibaba Cloud/Qwen, PocketAI Model Lab ni oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5`, con torre de vision; el autor no especifica transformer denso, MoE ni hibrida) |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible de forma nativa; la configuracion de ejemplo de oMLX usa `max_context_window: 150000` |
| Tipos de cuantizacion | pesos empaquetados en 6 bits (grupo 64); tensores no cuantizados en FP16; cabeza MTP en 6 bits grupo 64 / FP16; no hay GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); `model-mtp.safetensors` para la cabeza MTP; el repositorio no contiene GGUF |

Datos adicionales: tamano del repositorio 23,2 GB, biblioteca `mlx`, pipeline `image-text-to-text`, modelo base `PocketAiHub/Qwen3.8-27B-Abliterated-MLX` (relacion: `quantized`), fecha de creacion 2026-10-13, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El autor no publica detalles de la arquitectura del modelo base ni de su entrenamiento. Lo que si se documenta es la intervencion sobre el checkpoint recibido. PocketAI aplico una abliteracion que proyecto una direccion de rechazo fuera de 80 matrices de salida residual (proyecciones de salida de atencion y de MLP) en las capas 24 a 63; no se tocaron los embeddings de tokens ni `lm_head`, que son precisamente los que comparte la cabeza MTP. Esa interseccion es el argumento de compatibilidad del injerto: la cabeza ve estados ocultos finales ligeramente desplazados, pero en el mismo vocabulario y espacio de embeddings.

Sobre esa base, esta conversion aplica dos cambios. Primero, reescritura del tipo de almacenamiento de BF16 a FP16 en los tensores no cuantizados, sin recuantizar los pesos de 6 bits: es una conversion de `dtype` de almacenamiento, no un cambio de precision efectiva de los pesos empaquetados. Segundo, restauracion de la cabeza MTP completa desde `metajazz/Qwen3.8-27B-oQ6-fp16-mtp` (revision `2926178d6d49585ab826c961ba132ff75b34fa4e`), compuesta por 29 tensores en 6 bits grupo 64 / FP16 y almacenada en `model-mtp.safetensors`. Existe una diferencia conocida: el donante conserva embeddings en 8 bits, mientras que este repositorio usa 6 bits uniformes, lo que introduce un pequeno desplazamiento en los estados ocultos que alimentan a la cabeza. El autor publica un script reproducible (`conversion/fp16_graft.py`) y un `CHANGES.md` con todas las modificaciones, ademas de conservar sin alterar `abliteration-manifest.json`, `artifact-manifest.json` y `validation-summary.json` del modelo fuente.

No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de atencion del modelo original.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat compatible con el parser `qwen_3_5` en oMLX.
- Procesamiento de imagen y texto (`image-text-to-text`): el pipeline declarado y la presencia de torre de vision indican entrada multimodal.
- Modo de razonamiento explicito (`enable_thinking: true`, con `reasoning_effort` configurable a `medium` en el ejemplo del autor) y parser de razonamiento dedicado.
- Decodificacion especulativa mediante cabeza MTP, con `mtp_adaptive_max_depth` configurable (valor de ejemplo: 3) y activacion reportada como "Lightning MTP active" en oMLX 0.7.0.
- Generacion de codigo, con la mayor tasa de aceptacion del borrador MTP registrada en las pruebas locales (92,2 %).
- Capacidad multilingue: no disponible; no se declara lista de idiomas.
- Tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque el modo thinking y el razonamiento multi-token apuntan en esa direccion.
- El modelo esta abliterado: se ha suprimido la direccion de rechazo, por lo que las capacidades de rechazo de contenido estan alteradas por diseno.

## Casos de uso

- Asistente de codigo en local sobre Mac: con 92,2 % de aceptacion del borrador MTP y 31,6 tok/s en generacion de 512 tokens de codigo, es viable como autocompletado o generacion de funciones en un flujo de trabajo offline sobre Apple Silicon. El autor midio tambien 28,5 tok/s tras un prompt de 16K tokens, lo que mantiene la utilidad en contextos largos de repositorio.
- Razonamiento con modo thinking en estacion de trabajo unica: el modo `enable_thinking` con `reasoning_effort` medio alcanzo 31,5 tok/s y 91,8 % de aceptacion de borrador en 1024 tokens de razonamiento, adecuado para tareas analiticas que requieren cadena de pensamiento sin depender de la nube.
- Analisis de documentos con componente visual: al ser un VLM (`image-text-to-text`) con contexto configurable hasta 150.000 tokens en oMLX, puede usarse para extraer informacion de capturas, diagramas o paginas escaneadas junto con texto extenso en un solo prompt.
- Procesamiento de datos sensibles sin salida a Internet: al ejecutarse integramente en MLX sobre hardware Apple, es apto para equipos que no pueden enviar contenido a APIs externas (legal, sanidad, datos personales).
- Investigacion sobre abliteration y comportamiento de rechazo: el repositorio conserva el manifiesto de abliteracion y los ficheros de validacion originales, lo que lo convierte en un artefacto util para estudiar como la proyeccion de la direccion de rechazo en capas 24-63 afecta a las respuestas, comparando contra el modelo upstream.
- Red-teaming y evaluacion de seguridad: el propio autor advierte de que el modelo puede producir contenido danino, ilegal u ofensivo con mas facilidad; eso lo hace apropiado como sujeto de pruebas controladas en laboratorio, no como sistema en produccion orientado a usuarios finales.
- Generacion de prosa y contenido creativo en lote: con 26,2 tok/s y 68,1 % de aceptacion de borrador en historias de 512 tokens, es adecuado para borradores creativos o synthetic data, siempre con revision humana por el riesgo de contenido inapropiado.
- Pruebas de decodificacion especulativa en MLX: sirve como banco de pruebas comparativo entre MTP activado y desactivado por carga de trabajo, con la tabla de velocidades ya publicada como linea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que sus mediciones son "observaciones locales de una maquina, no una evaluacion de calidad".

Se reproduce la unica tabla de rendimiento publicada (Mac Studio M2 Ultra de 64 GB, oMLX 0.7.0, cuatro bloques alternos, cada carga ejecutada dos veces, temperatura 1.0, top_p 0.95, top_k 20; cifras en tokens por segundo de decodificacion):

| Carga de trabajo | MTP off | MTP on | Cambio | Aceptacion del borrador |
|---|---:|---:|---:|---:|
| Codigo, 512 tokens | 26,4 tok/s | 31,6 tok/s | +20 % | 92,2 % |
| Relato en prosa, 512 tokens | 24,8 tok/s | 26,2 tok/s | +6 % | 68,1 % |
| Razonamiento, thinking activado, 1024 tokens | 25,1 tok/s | 31,5 tok/s | +25 % | 91,8 % |
| Codigo tras un prompt de 16K tokens | 24,3 tok/s | 28,5 tok/s | +17 % | 91,7 % |

Notas del autor sobre estas cifras: con MTP desactivado, las medias de prosa y razonamiento incluyen una ejecucion atipica mas lenta (19,7 y 22,5 tok/s). Un prompt en frio de 16K tokens tardo 55 s hasta el primer token; uno con 12.288 tokens en cache, unos 14 s. En una comprobacion de cordura de razonamiento separada, el modelo dio la respuesta correcta.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon mediante MLX/oMLX. No se documenta ruta CUDA, ROCm ni Vulkan.
- Memoria unificada: el repositorio pesa 23,2 GB, por lo que se necesita espacio para los pesos mas el coste de KV cache y el runtime. La unica configuracion verificada en la informacion es un Mac Studio M2 Ultra con 64 GB.
- GPU recomendadas: no disponible. No se mencionan A100, H100 ni RTX 4090; el formato MLX no es compatible con esas plataformas.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el equivalente seria un Mac con memoria unificada suficiente. No se especifica el minimo exacto, solo que el equipo de prueba tenia 64 GB.
- Opciones de despliegue: oMLX 0.7.0 cargando el checkpoint a traves de su motor VLM. vLLM, TGI, llama.cpp y Ollama no son opciones viables porque el repositorio contiene safetensors de MLX y no GGUF.
- Configuracion requerida: los modelos con sufijo `-mtp` no muestran el engranaje de ajustes en el Model Manager de oMLX; hay que anadir una entrada por modelo en `~/.omlx/model_settings.json` y reiniciar la aplicacion.
- Latencia: 55 s hasta el primer token con un prompt en frio de 16K tokens; unos 14 s con 12.288 tokens ya en cache.
- Throughput: entre 24,3 y 31,6 tok/s en decodificacion segun carga, con MTP activado; entre 24,3 y 26,4 tok/s con MTP desactivado, sobre el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|---|
| `jongstra/Qwen3.8-27B-Abliterated-MLX-6bit-fp16-mtp` | 27,78 mil millones | config. ejemplo 150.000 | 6 bits grupo 64 + FP16 | MLX / Apple Silicon | Apache 2.0 | Objeto de esta ficha; incluye cabeza MTP restaurada |
| `PocketAiHub/Qwen3.8-27B-Abliterated-MLX` | no disponible (mismo linaje) | no disponible | no disponible (BF16 retenido en sus ficheros) | MLX | Apache 2.0 | Modelo base directo; sin cabeza MTP y con tensores no cuantizados en BF16 |
| `metajazz/Qwen3.8-27B-oQ6-fp16-mtp` | no disponible | no disponible | 6 bits + FP16, embeddings en 8 bits | MLX | Apache 2.0 | Donante de los 29 tensores de la cabeza MTP |
| Qwen3.8-27B (upstream Alibaba Cloud/Qwen) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Modelo original citado por el autor; se le atribuye el origen de la cabeza MTP |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, salvo que el autor afirma que la cabeza MTP injertada mantiene un 92 % de aceptacion de borrador en codigo y razonamiento pese al cambio de 8 bits a 6 bits en los embeddings.

## Limitaciones y advertencias

- Contenido danino por diseno: el modelo esta abliterado para suprimir rechazos. El autor advierte de que puede producir contenido danino, ilegal, ofensivo o incorrecto con mas facilidad que el modelo upstream, y que el aviso de seguridad original en `SOURCE_MODEL_CARD.md` se aplica en su totalidad.
- No apto para produccion orientada a usuarios finales sin filtros adicionales externos.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual; la unica verificacion mencionada es una comprobacion de cordura de razonamiento.
- La cabeza MTP es un injerto, no parte original del checkpoint: procede de otro repositorio y opera sobre estados ocultos ligeramente desplazados porque el donante mantiene embeddings en 8 bits y este repositorio usa 6 bits uniformes. La compatibilidad se argumenta de forma razonada, pero la validacion se limita a la aceptacion de borrador medida en una sola maquina.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: la lista de idiomas soportados no esta disponible.
- Limitacion de plataforma grave: solo MLX sobre Apple Silicon; no hay GGUF ni ruta CUDA, lo que descarta vLLM, TGI, llama.cpp y Ollama.
- Ergonomia: los modelos `-mtp` no exponen panel de ajustes en el Model Manager de oMLX y requieren editar a mano `~/.omlx/model_settings.json`.
- Configuracion manual del contexto: los 150.000 tokens citados son un parametro de ejemplo del autor, no una especificacion verificada del modelo.
- Reproducibilidad de las cifras: todas las mediciones provienen de un unico Mac Studio M2 Ultra de 64 GB, con dos ejecuciones por carga; el propio autor las califica de observaciones locales y no de evaluacion de calidad.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara que el repositorio no esta afiliado ni respaldado por Alibaba Cloud/Qwen, PocketAI Model Lab ni oMLX. Los ficheros `artifact-manifest.json` y `validation-summary.json` conservados describen los ficheros BF16 de PocketAI, no los shards reescritos de este repositorio, por lo que no sirven como validacion de integridad de esta conversion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jongstra/Qwen3.8-27B-Abliterated-MLX-6bit-fp16-mtp
- Modelo base (PocketAiHub): https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX
- Donante de la cabeza MTP (metajazz): https://huggingface.co/metajazz/Qwen3.8-27B-oQ6-fp16-mtp
- Revision concreta del donante: `2926178d6d49585ab826c961ba132ff75b34fa4e`
- Ficheros incluidos en el repositorio, segun la model card: `SOURCE_MODEL_CARD.md`, `CHANGES.md`, `abliteration-manifest.json`, `artifact-manifest.json`, `validation-summary.json`, `conversion/fp16_graft.py`, `model-mtp.safetensors`, `LICENSE`
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos); los resultados devueltos correspondian a servicios de cartografia y no guardan relacion con esta ficha.
