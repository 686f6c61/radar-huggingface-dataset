# Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2

## Resumen

Halogen Swift 1.5 Qwen3.8-Flash-Next v2 es un checkpoint cuantizado a 4 bits del fine-tune Swift 1.5 de UkisAI sobre Qwen3.8-Flash-Next, empaquetado por el usuario Quat3rnion en el formato propietario `.hgn` de Halogen desarrollado por Peonist. No es un modelo entrenado desde cero ni un lanzamiento oficial de Qwen: se trata de un derivado no oficial que sustituye 300 tensores del checkpoint v2 de Peonist por los correspondientes al fine-tune Swift 1.5, manteniendo el resto del archivo byte a byte idéntico al original.

El modelo base, Qwen3.8-Flash-Next, es un MoE multimodal de 125.000 millones de parametros con 48 capas y 512 expertos enrutados por capa, segun la model card. El checkpoint resultante esta pensado para ejecutarse exclusivamente en hardware AMD Strix Halo (gfx1151) con 128 GB de memoria unificada, a traves del servidor `halogen-flash-server` 0.15.1, de codigo cerrado. No carga en transformers, vLLM, llama.cpp, Ollama ni LM Studio, y no existe version en GGUF ni en safetensors.

Su relevancia practica es acotada pero concreta: demuestra que es posible aplicar un fine-tune de razonamiento mas corto sobre un checkpoint ya cuantizado, tocando solo los tensores afectados, sin recompilar ni recuantizar todo el modelo. El resultado declarado es una reduccion del 58% en tokens de pensamiento en MMLU-Pro (1.360 de media frente a 3.271) con un coste de perplejidad bajo (3,181 frente a 3,144 en WikiText-2) y la misma velocidad que el checkpoint original, entre 52 y 57 tokens por segundo en un Ryzen AI Max+ 395.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal sobre Qwen3.8-Flash-Next (hibrida Gated DeltaNet + Gated Attention, segun el repositorio de QwenLM); 48 capas y 512 expertos enrutados por capa; cabeza MTP de decodificacion especulativa integrada |
| Parametros totales | 125.000 millones (segun la model card del base); una fuente externa de terceros cita 180.000 millones en disco, sin confirmar |
| Parametros activos | no disponible en la model card (una fuente externa de terceros menciona ~6.000 millones, sin confirmar) |
| Longitud de contexto | 262.144 posiciones por peticion |
| Tipos de cuantizacion | 4 bits mayoritariamente, en la rejilla HT nativa del checkpoint v2 con redondeo consciente de calibracion; no hay versiones GGUF ni safetensors |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en HuggingFace), con ficheros adicionales `LICENSE-QWEN`, `LICENSE-APACHE` y `NOTICE` |
| Formato de pesos | `.hgn` (formato propio de Halogen); fichero `qwen38-flash-next-v2-swift15.hgn` de 68.142.577.664 bytes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-Flash-Next, descrita por el equipo de Qwen como un MoE multimodal que sirve de avance de la arquitectura empleada en Qwen4. Segun el repositorio oficial, combina un diseno hibrido de Gated DeltaNet con Gated Attention, el mismo patron introducido en Qwen3-Next y reutilizado en las series Qwen3.5 a Qwen3.8. La model card de este repositorio concreta 48 capas y 512 expertos enrutados por capa, ademas de una cabeza MTP (multi-token prediction) integrada en el checkpoint que actua como borrador de decodificacion especulativa, y una torre de vision opcional de 0,84 GiB para entrada de imagenes.

El proceso de este repositorio no es un entrenamiento sino un reempaquetado. Se parte del checkpoint `.hgn` v2 de Peonist (4 bits, revision `5cc17cea...`) y se sustituyen unicamente los 300 tensores que el fine-tune Swift 1.5 de UkisAI modifica respecto al modelo base. Los tensores nuevos se codifican en la rejilla 4 bits nativa del v2 con redondeo consciente de calibracion. Los payloads originales permanecen dentro del fichero, sin referenciar, y las sustituciones se anaden al final: por eso el archivo es 1,5 GB mayor que el stock (68,1 GB frente a 66,7 GB), aunque el motor solo carga lo referenciado, de modo que los pesos residentes ocupan lo mismo que el v2 original, unos 62 GiB. No hay datos publicados sobre el dataset de entrenamiento de Swift 1.5, el numero de tokens, ni si hubo RLHF o DPO. El checkpoint no esta abliterado: mantiene los rechazos del modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito, controlable mediante los niveles `reasoning_effort` de la plantilla de chat (`xhigh` por defecto, `medium` y `low`).
- Razonamiento mas breve que el del checkpoint base: 1.360 tokens de pensamiento de media en 14 preguntas de MMLU-Pro, frente a 3.271 del build sobre el modelo base.
- Contexto largo de hasta 262.144 posiciones por peticion, adecuado para documentos extensos o bases de codigo.
- Vision de entrada mediante la torre de vision opcional de Peonist (`qwen38-flash-next-vision.hgn`, 0,84 GiB), que debe descargarse aparte.
- Decodificacion especulativa con cabeza MTP integrada y tabla n-gram externa (`qwen38-flash-next-ngram.hgn`, obligatoria), orientada a acelerar la generacion.
- API compatible con OpenAI: `/v1/chat/completions`, `/v1/completions`, `/v1/responses`, `/v1/messages` y `/v1/models`.
- Soporte de tool calling y de flujos de agentes multi-paso: no documentado de forma explicita en la informacion disponible, aunque la superficie de API es compatible con OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Alineacion de rechazos intacta, con una variante abliterada publicada por el mismo autor para quien necesite eliminar las negativas.

## Casos de uso

- Asistente local con razonamiento en una estacion de trabajo Strix Halo de 128 GB: el modelo cabe en memoria unificada y se sirve con API compatible con OpenAI, de modo que puede conectarse a clientes existentes sin adaptadores.
- Analisis de documentos largos: con 262.144 posiciones de contexto por peticion, permite resumir o extraer informacion de expedientes, manuales o repositorios completos sin trocear el material.
- Revision de codigo asistida en local: el modo de razonamiento con `reasoning_effort` ajustable permite gastar pocos tokens de pensamiento en tareas rutinarias y subirlo en revisiones complejas, manteniendo el codigo dentro de la maquina.
- Procesamiento por lotes nocturno con entrada de imagenes: activando la torre de vision opcional, se pueden transcribir o clasificar capturas, diagramas o documentos escaneados a 52-57 tokens/s sostenidos.
- Servicio interno de chat para equipos pequenos: un unico equipo Strix Halo expone los endpoints `/v1/chat/completions` y `/v1/responses` como alternativa autoalojada a las APIs comerciales.
- Investigacion sobre decodificacion especulativa: la combinacion de cabeza MTP y tabla n-gram permite medir ganancias de throughput y comparar estrategias de borrador sobre un modelo de 4 bits.
- Estudio de presupuestos de razonamiento: las tres variantes publicadas (base abliterada, Swift 1.5 y Swift 1.5 abliterada) permiten comparar coste en tokens de pensamiento y calidad de forma controlada, ya que se construyeron con las mismas herramientas y se evaluaron en la misma sesion.
- Evaluacion de tecnicas de cuantizacion selectiva: el repositorio documenta que reemplazar 300 tensores sobre un checkpoint cuantizado no degrada la perplejidad de forma apreciable, un caso de estudio util para quienes investigan cuantizacion post-entrenamiento.
- Comparacion de taxonomias de rechazo: disponer de la version alineada y la abliterada del mismo fine-tune facilita experimentos sobre comportamiento de negativa sin cambiar de modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos publicados son de coste de razonamiento, perplejidad y velocidad:

| Metrica | Este modelo (Swift 1.5 v2) | halogen v2 abliterado (base Qwen) | Swift 1.5 v2 abliterado | v2 stock |
|---|---:|---:|---:|---:|
| Tokens de pensamiento medios (MMLU-Pro, 14 preguntas) | 1.360 | 3.271 | 905 | no disponible |
| Perplejidad WikiText-2 | 3,181 | 3,134 | 3,229 | 3,144 |
| Velocidad (greedy, Ryzen AI Max+ 395) | 52-57 tok/s | no disponible | no disponible | 52-57 tok/s (equivalente) |

## Requisitos de hardware

- Hardware obligatorio: AMD Strix Halo (gfx1151) con 128 GB de memoria unificada. No hay soporte para GPU NVIDIA ni para otras arquitecturas AMD.
- Memoria residente de pesos: aproximadamente 62 GiB, equivalente a la del checkpoint v2 stock.
- Disco: alrededor de 120 GB en total, 68,1 GB del fichero `.hgn` de este repositorio mas 51,2 GB (47,7 GiB) de la tabla n-gram obligatoria. La torre de vision opcional anade 0,84 GiB.
- No cabe en GPU de consumo convencionales: no hay soporte para RTX 3090, RTX 4090 ni similares con este formato. Existen recetas alternativas en safetensors para vLLM y RTX 3090 publicadas por terceros (ver comparativa).
- Motor de inferencia: exclusivamente `halogen-flash-server` 0.15.1, de codigo cerrado y con sus propios terminos de uso. No funciona con vLLM, llama.cpp, Ollama, LM Studio ni transformers.
- Despliegue habitual: contenedor Docker con acceso a `/dev/kfd`, publicado en `127.0.0.1:8731`.
- Rendimiento declarado: 52-57 tokens/s en generacion greedy, identico al v2 stock.
- Advertencia de operacion: el equipo debe dedicarse a este modelo; otros procesos grandes compiten por la memoria restante y pueden bloquear el servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y motor | Licencia | Hardware |
|---|---|---|---|---|---|
| halogen-swift1.5-qwen3.8-flash-next-v2 (este) | 125.000 M totales (MoE) | 262.144 | `.hgn`, halogen-flash-server | swift-open-license-1.0 | Strix Halo 128 GB |
| peonist-ai/halogen-qwen3.8-flash-next (v2 stock) | 125.000 M totales (MoE) | 262.144 | `.hgn`, halogen-flash-server | apache-2.0 | Strix Halo 128 GB |
| Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2-abliterated | 125.000 M totales (MoE) | 262.144 | `.hgn`, halogen-flash-server | swift-open-license-1.0 | Strix Halo 128 GB |
| halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin | no disponible | no disponible | safetensors, vLLM (receta W4A16) | swift-open-license-1 | RTX 3090 |

No se dispone de datos de rendimiento comparables entre el v2 stock y este build mas alla de la perplejidad en WikiText-2 (3,144 frente a 3,181) y del coste en tokens de pensamiento. El repositorio no publica comparaciones con modelos de otros fabricantes.

## Limitaciones y advertencias

- Portabilidad nula: el formato `.hgn` solo lo carga `halogen-flash-server`, y este solo funciona en AMD Strix Halo (gfx1151). No existe version GGUF ni safetensors de este build concreto.
- Dependencia de software cerrado: el motor de inferencia no es de codigo abierto y tiene sus propios terminos, adicionales a la licencia del modelo.
- Licencia restrictiva: `swift-open-license-1.0` (categoria `other` en HuggingFace), con ficheros adicionales de Qwen y Apache. No se detalla en la informacion disponible si permite uso comercial, por lo que debe revisarse el texto de `LICENSE` antes de cualquier despliegue en produccion.
- Derivado no oficial: no esta hecho ni respaldado por UkisAI, Peonist ni Qwen. La trazabilidad depende de las revisiones citadas de los repositorios de origen.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia. Los numeros de tokens de pensamiento proceden de solo 14 preguntas de MMLU-Pro.
- Comportamiento de rechazo conservado: al no estar abliterado, rechaza peticiones igual que el modelo base; quien necesite otro comportamiento debe usar la variante abliterada, con licencia equivalente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de precision factual para este build.
- Idiomas: la lista de idiomas soportados no esta disponible, y la model card no documenta cobertura multilingue.
- Dependencia de ficheros externos: la tabla n-gram y el tokenizador deben descargarse del repositorio de Peonist en revisiones concretas; sin ellos el modelo no arranca.
- Consumo de recursos: 120 GB de disco y dedicacion exclusiva de un equipo de 128 GB de memoria unificada, lo que limita el uso concurrente con otras cargas.
- Vision opcional: la entrada de imagenes requiere descargar y cargar un artefacto adicional que no forma parte de este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2
- Variante abliterada del mismo build: https://huggingface.co/Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2-abliterated
- Checkpoint base cuantizado (Peonist): https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Model card del checkpoint de Peonist: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next/blob/main/README.md
- Fine-tune Swift 1.5 de UkisAI: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del servidor de inferencia: https://github.com/peonist-ai/halogen-flash-server
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta alternativa en safetensors para vLLM y RTX 3090: https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin
- Analisis de hardware para Qwen3.8-Flash-Next en local: https://www.runaihome.com/blog/qwen38-flash-next-local-ai-hardware-guide-2026/
