# Allan143/SuperQwen3.8-27b-abliterated

## Resumen

SuperQwen3.8-27b-abliterated es un ajuste fino del modelo multimodal Qwen3.8-27B de Alibaba, publicado por el usuario Allan143 en Hugging Face. El objetivo principal es reducir la tasa de rechazo del modelo original (refusals) mediante una técnica de ablación del subespacio de rechazo llamada OBLITERATUS, manteniendo al mismo tiempo las capacidades de razonamiento, visión, uso de herramientas y contexto largo. Se distribuye en BF16 completo, sin cuantizar, y no requiere adaptadores en tiempo de inferencia.

El modelo conserva la arquitectura del base: un transformer denso multimodal que acepta imágenes y texto, con soporte para razonamiento explícito (thinking mode), tool calling y una ventana de contexto nativa de 262.144 tokens. La edición ablativa se aplica sobre 100 tensores (proyecciones de salida de las capas 15 a 63, embeddings y lm_head), mientras que los 333 tensores de visión y los 15 de MTP se preservan byte a byte. El autor reporta una reducción de rechazos del 93,75 % al 0 % en una prueba de 32 prompts, y una corrección del comportamiento de sobrepensamiento (overthinking) en 36 de 36 tareas deterministas.

La relevancia actual de este modelo radica en ofrecer una alternativa "sin censura" sobre una base de alto rendimiento, con verificación de contexto largo real (262.043 tokens) y compatibilidad con vLLM. Sin embargo, al ser una edición ablativa, el contenido generado puede no ser siempre apropiado, y el operador es responsable de los controles de acceso y salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (verificado hasta 262.043 tokens) |
| Tipos de cuantizacion | BF16 nativo; existen derivados GGUF de terceros (p. ej. Q3-DOWN-XS) |
| Idiomas soportados | Ingles, coreano (declarados en la ficha; no se listan otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (derivados de terceros) |

## Arquitectura y entrenamiento

El modelo parte de la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` de Qwen/Qwen3.8-27B y aplica una edición de subespacio de rechazo de rango 4 (OBLITERATUS). Esta técnica identifica la dirección de rechazo en el espacio de activaciones y la elimina parcialmente de los tensores de salida de las capas 15 a 63, así como de las embeddings y del `lm_head`. No se emplean LoRA ni adaptadores en inferencia; los pesos editados se guardan directamente en BF16.

El entrenamiento de la edición se realizó sobre un corpus de 842 pares canónicos dañinos/inocuos (OBLITERATUS corpus, commit `a5a1ffa5849b`). Además, se corrigió el comportamiento de razonamiento: el template por defecto pasa de `xhigh` a `medium`, y se añade una condición de parada para `xhigh` que evita repeticiones o reinicios de la deliberación. No se menciona el uso de RLHF o DPO; la edición es puramente geométrica sobre los pesos.

Los tensores de visión (333) y de MTP (15) se mantienen exactamente iguales al original, lo que garantiza que las capacidades multimodales y de predicción multi-token no se ven alteradas. El resultado es un checkpoint que conserva la calidad del base pero con una tasa de rechazo drásticamente menor.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y coreano.
- Razonamiento explicito con niveles de esfuerzo configurables (`low`, `medium`, `high`, `xhigh`); el valor por defecto es `medium`.
- Comprension de imagenes: entrada `image-text-to-text`, capaz de analisis visual, OCR y respuesta a preguntas sobre imagenes.
- Tool calling / function calling: soportado y verificado (PASS en las pruebas del autor).
- Razonamiento multi-paso y uso de agentes, con capacidad de detener la deliberacion cuando se alcanza una respuesta.
- Contexto largo de hasta 262.144 tokens, verificado con una prueba de recuperacion de aguja en 262.043 tokens.
- Comportamiento "uncensored" (abliterado): reduccion de rechazos en prompts que el modelo base declinaria.
- Compatible con vLLM y con templates de chat que permiten activar o desactivar el modo de pensamiento.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto extenso (hasta 262K tokens) y mantener el historial completo de una sesion sin perder informacion. Su baja tasa de rechazo evita respuestas evasivas en consultas delicadas.
- Generacion de codigo en produccion: soporta tool calling, lo que permite integrarlo en pipelines de CI/CD para autocompletar funciones, revisar diffs o generar tests. Su capacidad de razonamiento medio/alto ayuda en tareas de depuracion.
- Analisis de documentos largos: con la ventana de 262K tokens, puede procesar manuales, contratos o codigos fuente completos y extraer informacion relevante sin necesidad de chunking.
- Asistente multimodal para soporte tecnico: al aceptar imagenes, puede diagnosticar errores de pantalla, leer diagramas o interpretar capturas de pantalla enviadas por usuarios.
- Agentes de automatizacion de oficina: gracias a tool calling y razonamiento multi-paso, puede interactuar con APIs, calendarios o bases de datos para completar tareas administrativas.
- Generacion de contenido creativo sin restricciones: para entornos donde se necesita explorar temas controvertidos o sensibles (con las debidas salvaguardas), el modelo ofrece respuestas sin los rechazos tipicos del base.
- Investigacion academica sobre alineacion y seguridad: el modelo sirve como objeto de estudio para analizar como la ablacion de subespacios afecta al comportamiento y a las capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas propias de su suite de evaluacion, que se resumen a continuacion:

| Prueba | Resultado |
|---|---|
| Rechazo del modelo base (parent) | 30/32 (93,75 %) |
| Rechazo de SuperQwen | 0/32 |
| Salidas vacias | 0/32 |
| Capacidad (umbral emparejado con el base) | 7/8 |
| Uso de herramientas | PASS |
| Vision | PASS |
| Sobrepensamiento (36 combinaciones deterministas) | 36/36 PASS |
| Decode (DGX Spark, p256, C1) | 4,3411 tok/s |

Estos datos provienen del propio autor y no han sido replicados de forma independiente. La velocidad de decodificacion se midio en una configuracion especifica (DGX Spark, generacion de longitud fija) y puede variar segun el hardware y el runtime.

## Requisitos de hardware

- El checkpoint BF16 completo ocupa aproximadamente 52 GB en disco (55,6 GB el repositorio). Para cargarlo en memoria se necesitan al menos 56 GB de VRAM, lo que requiere una GPU profesional como A100 (80 GB), H100 (80 GB) o varias GPU en paralelo.
- No cabe en GPU de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16.
- Para despliegue en hardware de consumo, se recomienda usar cuantizaciones GGUF de terceros. Por ejemplo, la version Q3-DOWN-XS pesa 7,73 GiB y cabe en GPUs con 8-12 GB de VRAM. Otras cuantizaciones tipicas para 27B (Q4_K_M, Q5_K_M) requeririan entre 16 y 20 GB.
- Opciones de despliegue: vLLM (compatible segun los tags), llama.cpp, Ollama (mediante GGUF), TGI.
- Latencia y throughput: el autor mide 4,34 tok/s en DGX Spark con BF16 y concurrency 1. Con cuantizacion GGUF en hardware mas modesto, la velocidad sera menor. No se han publicado mediciones para otros entornos.

## Comparativa con modelos similares

El modelo es un finetune del Qwen3.8-27B base. No se dispone de datos comparativos con otros modelos abliterados de tamano similar en la informacion proporcionada. La siguiente tabla compara con el base y con una alternativa comun de tamano cercano, aunque sin datos de rendimiento estandar:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Abliterado |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | 262.144 | Si | Apache-2.0 | No |
| SuperQwen3.8-27b-abliterated | 27,8 B | 262.144 | Si | Apache-2.0 | Si |
| Llama 3.1 8B (referencia, no comparable en tamano) | 8 B | 128.000 | No | Llama 3.1 | No |

No se han encontrado datos de benchmarks que permitan una comparacion cuantitativa con otros modelos abliterados de 27B. La unica referencia adicional es la existencia de versiones GGUF del mismo modelo (p. ej. Jiunsong/SuperQwen3.8-27b-abliterated-GGUF y guideboardlabs/SuperQwen3.8-27B-abliterated-Q3-DOWN-XS-GGUF), que mantienen las mismas caracteristicas funcionales con distinta cuantizacion.

## Limitaciones y advertencias

- La abliteracion reduce los rechazos, pero no garantiza que las respuestas sean correctas, seguras o adecuadas para todos los despliegues. Puede generar contenido que el modelo base habria rechazado, incluyendo material ofensivo o peligroso.
- No se han evaluado sesgos sistematicos (genero, raza, ideologia) ni la robustez ante ataques adversarios.
- El modelo solo declara soporte para ingles y coreano; su rendimiento en otros idiomas no esta verificado.
- La ventana de 262K tokens esta verificada para una tarea de recuperacion de aguja, pero no implica una comprension perfecta en todos los contextos largos.
- La edicion ablativa puede haber degradado capacidades no cubiertas por las pruebas del autor (las pruebas cubren 8 tareas de capacidad, con 7 aprobadas).
- El rendimiento de decodificacion depende fuertemente del hardware y del runtime; los valores publicados corresponden a una unica configuracion.
- La licencia Apache-2.0 permite uso comercial, pero el operador es responsable del contenido generado y de cumplir las leyes aplicables.
- No hay garantia de que el modelo funcione correctamente en todos los entornos de produccion; se recomienda validar con casos reales antes de desplegar.

## Enlaces

- [Modelo en Hugging Face: Allan143/SuperQwen3.8-27b-abliterated](https://huggingface.co/Allan143/SuperQwen3.8-27b-abliterated)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Documentacion de Qwen 3.8 27B en GroqDocs](https://console.groq.com/docs/model/qwen/qwen3.8-27b)
- [Version GGUF de terceros: Jiunsong/SuperQwen3.8-27b-abliterated-GGUF](https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-GGUF)
- [Version GGUF Q3-DOWN-XS: guideboardlabs/SuperQwen3.8-27B-abliterated-Q3-DOWN-XS-GGUF](https://huggingface.co/guideboardlabs/SuperQwen3.8-27B-abliterated-Q3-DOWN-XS-GGUF)
- [Modelo obliterated en NanoGPT](https://nano-gpt.com/models/text/qwen/qwen3.8-27b-obliterated)
