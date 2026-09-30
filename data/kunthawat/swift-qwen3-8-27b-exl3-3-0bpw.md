# kunthawat/swift-qwen3.8-27b-exl3-3.0bpw

## Resumen

Swift-Qwen3.8-27B EXL3 3.0 bpw es una conversión cuantizada del checkpoint BF16 ukisai/Swift-Qwen3.8-27b, publicada por el usuario kunthawat. Se trata de un artefacto derivado, no oficial, que empaqueta los pesos originales en formato EXL3 a 3.0 bits por peso para poder servirse desde una única GPU NVIDIA de 16 GB mediante el runtime ExLlamaV3. El pipeline declarado es image-text-to-text, por lo que conserva los módulos de visión del modelo base, además de un cabezal MTP (multi-token prediction) para decodificación especulativa.

El modelo hereda de Swift la interfaz estándar de la familia Qwen3.8 (texto, imagen y vídeo) y su comportamiento de razonamiento eficiente, orientado a reducir los tokens de "pensamiento" sin perder precisión respecto al modelo base. El repositorio incluye el conversor a EXL3 1.5.1, un perfil de TabbyAPI (100K de contexto, caché K/V en int4, MTP-4 y visión en GPU) y un JSON con resultados de GPQA Diamond ejecutados localmente.

La relevancia actual radica en su perfil de consumo: con unos 12,57 GiB de pesos y una ventana de contexto configurable hasta ~118K tokens, permite ejecutar localmente un asistente multimodal de gama alta en tarjetas de 16 GB, algo poco habitual en modelos de este tamaño. No obstante, el nivel de adopción es muy bajo (8 descargas, 0 likes) y la model card advierte de que los resultados de rendimiento provienen de una única ejecución local, por lo que deben tomarse como orientativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8 (texto, imagen y video en el modelo base); no se detalla si incorpora MoE |
| Parametros totales | El nombre comercial indica 27B; el recuento real de elementos en los safetensors es de 6.734.157.184 (6,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | 100K configurado en el perfil de TabbyAPI; se verifico una ejecucion con 118.016 tokens configurados |
| Tipos de cuantizacion | EXL3: 3,0 bpw para el modelo principal, 6 bpw para el cabezal LM, 4 bpw para MTP y 6 bpw para vision |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-v1.0-apache-2.0 (etiquetada como license: other) |
| Formato de pesos | safetensors en formato EXL3 (requiere ExLlamaV3) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion directa del checkpoint BF16 ukisai/Swift-Qwen3.8-27b (revision `048328f...`), no una conversion desde GGUF. La model card indica que la fuente contenia los pesos MTP y la configuracion de vision necesarios, y que estos componentes se conservan en la salida EXL3. La conversion se realizo con ExLlamaV3 1.5.1 usando 250 filas de calibracion de 2.048 tokens. Se distinguen dos shards principales: `model-00001-of-00002.safetensors` (8.575.532.487 bytes) y `model-00002-of-00002.safetensors` (4.893.158.325 bytes); los pesos y ficheros de tokenizer/configuracion ocupan 13.492.586.073 bytes (~12,57 GiB).

Respecto al entrenamiento del modelo base, la informacion disponible es limitada. La web de UkisAI indica que Swift incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI, que produce trazas de razonamiento mas cortas y, segun el autor, menos errores de "overthinking". El modelo mantiene la interfaz estandar de Qwen3.8 con soporte de texto, imagen y video. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Del modelo Qwen3.8 subyacente se conoce la existencia del ajuste `reasoning_effort`, que permite regular el esfuerzo de razonamiento.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) regulable mediante el ajuste `reasoning_effort` del modelo base.
- Comprension de imagenes (pipeline image-text-to-text): la model card reporta la descripcion correcta de una imagen en una prueba de humo a 8K de contexto con vision en GPU.
- Soporte de video heredado del modelo base Qwen3.8, segun la web de UkisAI.
- Decodificacion especulativa mediante cabezal MTP integrado en el propio checkpoint (MTP-4 en el perfil de TabbyAPI).
- Contexto largo: se verifico una ejecucion de texto de 117.824 tokens con recuperacion de un marcador insertado.
- Compatibilidad con tool calling / function calling a traves de clientes con API compatible con OpenAI (Hermes), aunque no se documenta explicitamente una plantilla de herramientas propia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente local de sesiones largas: con 100K de contexto configurado y capacidad de retener marcadores a 118K tokens, se puede emplear como asistente conversacional persistente en una estacion de trabajo con una GPU de 16 GB.
- Revision de imagenes y documentos: dado el pipeline image-text-to-text, permite describir o analizar capturas, diagramas o documentos escaneados directamente en local, sin depender de APIs externas.
- Generacion de borradores de marketing: la model card menciona explicitamente este uso junto con Hermes como cliente compatible con OpenAI, para redactar textos comerciales en un flujo de trabajo local.
- Planificacion e implementacion de sitios web: tambien citado por el autor, se puede usar el modelo como copiloto para definir estructura y generar fragmentos de codigo de front/back.
- Razonamiento con esfuerzo configurable: gracias a `reasoning_effort` (xhigh, medium, low), se puede reducir el coste de tokens en tareas simples y elevarlo en tareas complejas, ajustando el presupuesto de computo por peticion.
- Servicio local compatible con OpenAI: mediante TabbyAPI, se puede exponer como endpoint compatible con el SDK de OpenAI y sustituir llamadas a la nube en aplicaciones internas.
- Procesamiento de prompts masivos con recuperacion: encaja en tareas de "long-document QA" donde se inyecta documentacion extensa y se necesita recordar informacion concreta.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles corresponden a una ejecucion local de GPQA Diamond (198 preguntas) realizada con ExLlamaV3 1.5.1 y TabbyAPI sobre Windows 11 con dos RTX 5060 Ti de 16 GB. El modelo Swift se ejecuto en CUDA1 con contexto de 100K, batch 1, cache K/V int4, MTP-4 y temperatura 1 / top-k 20 / top-p 0.95, con vision desactivada y solapandose con otra ejecucion en CUDA0.

| Metrica | Resultado |
|---|---|
| GPQA Diamond (puntuacion flexible) | 144/198 (72,73 %) |
| GPQA Diamond (puntuacion estricta) | 26/198 (13,13 %) |
| Procesamiento medio de prompt | 278,42 tok/s |
| Generacion media | 43,95 tok/s |
| Tiempo medio por pregunta | 89,21 s |
| VRAM maxima muestreada durante GPQA | 14.350 MiB de 16.311 MiB |

La ejecucion registro una respuesta no parseada y otra truncada. Ademas, se realizaron dos comprobaciones de capacidad:

| Prueba | Resultado observado |
|---|---|
| Prompt largo | Prompt de 117.824 tokens completado con contexto de 118.016 tokens, MTP activo, K/V int4, modulos de vision cargados y batch 1. Se recupero un marcador. VRAM maxima de dispositivo muestreada: 15.947 MiB de 16.311 MiB |
| Entrada de imagen | Una imagen descrita correctamente a 8K de contexto con vision en GPU. Memoria pico asignada/reservada en PyTorch: 11.127/11.436 MiB |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos anteriores proceden de una unica ejecucion local y no establecen una clasificacion general de precision.

## Requisitos de hardware

- VRAM estimada: el perfil objetivo es una sola GPU NVIDIA de 16 GB. En las pruebas locales, la VRAM pico durante GPQA fue de 14.350 MiB y durante el prompt largo de 15.947 MiB, con muy poco margen libre.
- GPU recomendadas: RTX 5060 Ti 16 GB (probada por el autor), y por capacidad similar RTX 4080/4090 16-24 GB, RTX 5080/5090 o GPUs profesionales como A100/H100 para mayor contexto y batch.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB como la RTX 5060 Ti o la RTX 4080, siempre que se ajusten contexto, numero de peticiones concurrentes y uso de vision.
- Opciones de despliegue: ExLlamaV3 a traves de TabbyAPI (con perfil `tabby_config.yml` incluido); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL3 es especifico de ExLlamaV3.
- Perfil de servicio sugerido: 100K de contexto, int4 K/V, MTP-4, vision en GPU y una unica peticion activa. El autor indica que el batch multiusuario de contexto largo no es el perfil recomendado.
- Latencia y throughput medidos: 278,42 tok/s de procesamiento de prompt y 43,95 tok/s de generacion en la configuracion descrita, con 89,21 s de media por pregunta de GPQA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kunthawat/swift-qwen3.8-27b-exl3-3.0bpw | Nominal 27B / 6,7B elementos en safetensors | 100K configurado | EXL3 3,0 bpw | GPQA flexible 72,73 %; 43,95 tok/s generacion | swift-open-license-v1.0-apache-2.0 | HuggingFace (8 descargas) |
| MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw | 27B | hasta 118K+ | EXL3 3,5 bpw / 5,0 bpw DFlash2 | no disponible (draft ~15 % mas rapido que MTP por defecto) | no disponible | GitHub |
| ukisai/Swift-Qwen3.8-27b (base BF16) | 27B | no disponible | BF16 | no disponible | no disponible | HuggingFace |

No se han proporcionado datos comparativos con otros modelos de la misma categoria (por ejemplo Qwen3-VL, Llama 3.x multimodal o Mistral Small) en la informacion disponible, por lo que no se incluyen cifras adicionales.

## Limitaciones y advertencias

- Las metricas de rendimiento proceden de una unica ejecucion local, con vision desactivada y solapada con otra carga; el autor advierte que no suponen una clasificacion general.
- La puntuacion estricta en GPQA es notablemente baja (13,13 %) frente a la flexible (72,73 %), lo que sugiere problemas de formato en las respuestas que pueden afectar a pipelines automatizados.
- La prueba de prompt largo dejo muy poco margen de VRAM (15.947 MiB de 16.311 MiB); imagenes de alta resolucion, multiples imagenes o peticiones concurrentes pueden agotar la memoria en tarjetas de 16 GB.
- El modelo base emplea modos de razonamiento configurables; el comportamiento final depende de la plantilla de chat, las opciones de razonamiento y el prompt del cliente. El benchmark uso una plantilla (`qwen3.8-froggeric-v22.5.0.jinja`) que no se incluye en el repositorio, por lo que las puntuaciones pueden diferir con el perfil publico.
- La licencia es personalizada (swift-open-license-v1.0-apache-2.0) y no se detallan sus terminos de uso comercial en la informacion disponible; conviene revisar el fichero LICENSE antes de desplegarlo en produccion.
- El modelo es una conversion no oficial: no procede de UkisAI, Qwen, MiaAI-Lab ni ExLlamaV3, y no esta asociado al perfil de despliegue de MiaAI-Lab.
- Puede existir riesgo de alucinacion, sesgos y limitaciones idiomaticas heredadas del modelo base; no se han publicado evaluaciones especificas al respecto.
- El formato EXL3 requiere obligatoriamente ExLlamaV3; no es portable a otros runtimes sin reconversion.
- Adopcion muy baja (8 descargas, 0 likes) y fecha de publicacion muy reciente; no hay validacion comunitaria.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/kunthawat/swift-qwen3.8-27b-exl3-3.0bpw
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Revision concreta del checkpoint base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/tree/048328f4059015b63f860a453bf94834af0db683
- Anuncio de Swift en UkisAI: https://ukisai.com/news/introducing-swift
- Kit de despliegue de MiaAI-Lab (DFlash2 EXL3): https://github.com/MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Notas de instalacion de ExLlamaV3: https://github.com/turboderp-org/exllamav3#installation
- Guia de inicio de TabbyAPI: https://github.com/theroyallab/tabbyAPI/wiki/01.-Getting-Started
