# AtomicChat/Unlimited-OCR-2-W4A16

## Resumen

Unlimited-OCR-2 W4A16 es una cuantización de solo pesos en 4 bits (W4A16, int4 simétrico, tamaño de grupo 32, formato `compressed-tensors`) del modelo baidu/Unlimited-OCR-2, publicada por AtomicChat. El modelo base es un sistema de OCR y parseo de documentos con arquitectura multimodal (torre de visión más decodificador de texto MoE), orientado a la extracción de texto y estructura a partir de imágenes de páginas. Esta variante reduce el peso en disco a 3,06 GB y conserva en BF16 las partes críticas para la precisión: atención, router SR-SWA, indexer, torre de visión, proyector, routers de expertos y `lm_head`.

La relevancia de esta ficha es práctica: permite ejecutar un OCR de documentos de gama alta en hardware modesto, con una pérdida de fidelidad medida y acotada frente al original en BF16. Según la model card, 23 de 30 páginas reales de OmniDocBench quedan dentro del 1 % de diferencia de texto respecto al original, con una diferencia de caracteres mediana del 0,13 % y media del 1,06 %.

El modelo tiene 3.343.978.497 parámetros totales y se distribuye en safetensors con código remoto del proveedor. La licencia es MIT, heredada del modelo base. Está pensado para pipelines de digitalización, extracción estructurada y procesamiento masivo de documentos donde el coste de almacenamiento y descarga importa tanto como la calidad del reconocimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text: torre de visión + decodificador de texto MoE con atención SR-SWA (sparse attention con router e indexer) |
| Parámetros totales | 3.343.978.497 |
| Parámetros activos | no disponible (el modelo base es MoE; la model card no detalla el reparto activo) |
| Longitud de contexto | no disponible (la model card menciona un límite de hasta 131k tokens nuevos por llamada, no la ventana de contexto) |
| Tipos de cuantización | W4A16: int4 simétrico, group size 32, `compressed-tensors`; capas FFN del decodificador MoE (expertos enrutados y compartidos, ~9/10 de los parámetros) en 4 bits; atención, router SR-SWA, indexer, torre de visión, proyector, routers y `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de baidu/Unlimited-OCR-2) |
| Formato de pesos | safetensors (repo de 6,0 GB; 3,06 GB en disco tras la cuantización según la model card) |

## Arquitectura y entrenamiento

El modelo base combina una torre de visión con un decodificador de texto de tipo Mixture of Experts. La model card de esta cuantización describe explícitamente un router SR-SWA y un indexer dentro del bloque de atención, así como expertos enrutados y compartidos en las capas feed-forward. La atención y el enrutamiento se mantienen en BF16 porque son sensibles a la cuantización; el grueso de los parámetros, concentrado en los expertos, es lo que se comprime a 4 bits.

La cuantización es weight-only (activaciones en 16 bits), con redondeo round-to-nearest y sin datos de calibración. No se documenta en la información disponible el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones de decodificación más allá del esquema de atención dispersa SR-SWA. La model card advierte de que el código del proveedor reescribe `sparse_attention_config` (`dash_stage0`, `dash_topk_blocks`) en tiempo de carga, por lo que no debe re-guardarse el modelo con `save_pretrained`.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas de documento.
- Parseo de estructura documental: la model card menciona cabeceras de layout con tipo de bloque y caja (block type y box), lo que implica detección de regiones y jerarquía.
- Extracción de texto con preservación de orden de lectura en documentos complejos (libros de texto, periódicos, diapositivas, informes, apuntes, exámenes, revistas, artículos).
- Procesamiento página a página mediante el método `infer` del código del proveedor, con guardado de resultados (`save_results=True`).
- Generación de hasta 131k tokens nuevos por llamada según el valor por defecto del proveedor (conviene acotar `max_new_tokens`).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización masiva de archivos: el modelo procesa una página por petición y guarda el resultado estructurado, lo que encaja en pipelines batch que recorren PDFs renderizados a imagen y persisten el texto con su layout.
- Extracción de datos en facturas y albaranes: la detección de bloques y cajas permite localizar campos (importes, fechas, emisores) y mapearlos a un esquema posterior sin reentrenar.
- Procesamiento de documentación técnica y papers: la ventana de salida amplia (hasta 131k tokens nuevos por llamada) permite volcar páginas densas con ecuaciones y tablas en una sola pasada.
- Automatización de back office en seguros y banca: clasificación y extracción de pólizas y contratos escaneados, con la ventaja de que el modelo corre en local y los documentos no salen de la infraestructura.
- Accesibilidad y lectura asistida: conversión de material impreso (libros, apuntes, exámenes) a texto estructurado para lectores de pantalla o para indexación en buscadores internos.
- Construcción de corpus para RAG: ingestión de revistas, informes y periódicos con preservación de la estructura de bloques, lo que mejora el troceado semántico antes de la indexación vectorial.
- Despliegue en estaciones de trabajo sin GPU de datacenter: al ocupar 3,06 GB en disco y mantener la atención en BF16, es viable en entornos locales con una sola GPU consumer, según las indicaciones de la model card sobre GGUF y ejecución local.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí una evaluación de fidelidad frente al original en BF16 sobre 30 páginas reales de OmniDocBench (2 por categoría, semilla 0, una página por petición, transformers 4.52.1):

| Modelo | Tamaño en disco | Páginas dentro del 1 % del original | Diferencia de caracteres: mediana / media |
|---|---|---|---|
| W4A16, int4 simétrico, grupo 32 (este repo) | 3,06 GB | 23/30 | 0,13 % / 1,06 % |
| W4A16, int4 simétrico, grupo 128 (primera subida) | 2,96 GB | 18/30 | 0,11 % / 3,42 % |

La diferencia de caracteres se calcula como distancia de edición del texto reconocido tras eliminar las cabeceras de layout, dividida por la longitud del original. El original produce texto idéntico en dos ejecuciones (30/30 páginas), de modo que las diferencias atribuibles a la cuantización son las reportadas. No se han publicado resultados de benchmarks en la información disponible más allá de esta comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica que, en transformers, la ganancia de esta cuantización es el tamaño de descarga y disco, no la memoria de GPU; al descomprimir las capas 4-bit a BF16 en el arranque, el modelo ocupa en VRAM como un BF16 de ~3,34B parámetros más la torre de visión y el contexto.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU de 24 GB (RTX 4090, A10G, L4 con holgura limitada) es el mínimo razonable para BF16; A100/H100 si se necesita concurrencia o contextos largos.
- Cabe en GPU consumer: sí, en modelos de 24 GB o superiores, siempre que se acote `max_new_tokens` y el contexto.
- Opciones de despliegue: transformers con código remoto y `compressed_tensors` (con el bucle de descompresión documentado, ~10 s); GGUF mediante AtomicChat/Unlimited-OCR-2-GGUF para llama.cpp/Ollama. El build propio de SGLang del proveedor solo sirve el modelo en BF16 y no carga expertos cuantizados; vLLM no tiene soporte v2 todavía.
- Latencia y throughput: no disponible. La model card solo menciona que la descompresión inicial tarda unos 3 s con el bucle recomendado y que usar `CompressedTensorsConfig(run_compressed=False)` en transformers 4.52.1 provoca un bloqueo de horas por una comprobación cuadrática de claves sobre ~2.100 capas de expertos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR-2 W4A16 (este repo) | 3,34B | no disponible | W4A16 int4 g32, 3,06 GB | MIT | HuggingFace, safetensors + código remoto |
| baidu/Unlimited-OCR-2 (original) | 3,34B | no disponible | BF16 | MIT | HuggingFace |
| Unlimited-OCR-2-GGUF (AtomicChat) | 3,34B | no disponible | GGUF (varias) | MIT | HuggingFace, para llama.cpp/Ollama |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos de OCR comparables, por lo que la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: 7 de 30 páginas de OmniDocBench superan el 1 % de diferencia de texto respecto al original, con una media del 1,06 % y casos peores no detallados.
- El grupo 32 mejora la fidelidad frente al grupo 128 de la primera subida (23/30 frente a 18/30 páginas dentro del 1 %), pero a costa de 0,1 GB más en disco.
- Riesgo de alucinación en regiones de baja calidad, sellos, manuscritos o tablas complejas: no se documenta ninguna evaluación específica sobre estos casos.
- No se documentan sesgos conocidos ni cobertura de idiomas; la ausencia de datos de idiomas impide garantizar calidad fuera de los scripts evaluados.
- Advertencia operativa crítica: no re-guardar el modelo con `save_pretrained`, porque el código del proveedor reescribe `sparse_attention_config` en la carga y un config re-guardado hace que el modelo emita texto basura.
- No usar `CompressedTensorsConfig(run_compressed=False)` con transformers 4.52.1: el cargador se bloquea durante horas por la comprobación de claves sobre ~2.100 capas de expertos.
- Acotar siempre `max_new_tokens`: el valor por defecto del proveedor permite hasta 131k tokens nuevos por llamada, con el coste de latencia y memoria asociado.
- El soporte de motores de serving es limitado: SGLang del proveedor solo en BF16, vLLM sin soporte v2; para producción a escala conviene validar el camino GGUF o esperar soporte nativo.
- Licencia MIT: permite uso comercial y modificación, pero se hereda del modelo base y conviene conservar los avisos de copyright correspondientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtomicChat/Unlimited-OCR-2-W4A16
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/Unlimited-OCR-2-GGUF
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
