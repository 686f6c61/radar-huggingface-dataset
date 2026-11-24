# Plaguekind/Qwen3.8-27b-RVN-ARA-PK-Parasyte-basalt

## Resumen

Qwen3.8-27b-RVN-ARA-PK-Parasyte-basalt es un paquete de pesos cuantizados en formato NVFP4 distribuido por Plaguekind, derivado del modelo denso de 27.321 mil millones de parametros Qwen3.8-27B en su variante heretic-abliterated "RVN" publicada por 0bserverx. El paquete integra en un unico fichero el modelo de lenguaje, una cabeza de decodificacion especulativa DFlash2 y el modulo de vision Parasyte Eye V2, de modo que no requiere ficheros mmproj externos ni un segundo proceso para procesar imagenes o video.

El modelo resuelve el problema de desplegar un LLM multimodal de 27B con contexto de 262.144 tokens en una sola GPU de consumo de 32 GB (RTX 5090), empleando cuantizacion NVFP4 selectiva y decodificacion especulativa integrada. La relevancia actual radica en que combina ventana de contexto larga, entrada nativa de texto, imagen y video, y un motor de inferencia propio (basalt v0.5.5) con salida estructurada garantizada por gramatica.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se dispone de informacion independiente sobre el entrenamiento del modelo base ni sobre evaluaciones de terceros. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo fue creado el 24 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso-hibrido (linea Qwen3.8-27B, con atencion y estado SSM) con torre de vision ViT + merger |
| Parametros totales | 27.321 B (modelo de lenguaje) + 461 M (torre de vision, 333 tensores BF16) + ~1 B (cabeza especulativa DFlash2, NVFP4) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (KV en NVFP4) |
| Tipos de cuantizacion | NVFP4 (cuerpo FFN y KV); precisiones superiores selectivas en atencion, estado SSM, normas, embedding y LM head; vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.basalt` (18,76 GiB / 20.140.787.695 bytes); no es GGUF ni safetensors |
| Tamano del repositorio | 20,1 GB |
| Pipeline | image-text-to-text |
| Libreria / motor | basalt v0.5.5 o superior |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso-hibrido de 27.321 mil millones de parametros perteneciente a la familia Qwen3.8-27B, segun la nomenclatura del autor. El paquete no describe en detalle la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron fases de RLHF o DPO; la model card solo indica que la conversion se realizo desde la exportacion F16 en safetensors del modelo `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF`, que a su vez es una variante "heretic-abliterated" del Qwen3.8-27B original (abliteracion de rechazos y eliminacion de comportamientos de censura).

La innovacion tecnica principal es la integracion en un solo fichero de tres componentes: (1) el modelo de lenguaje convertido con el conversor de basalt 0.5.5 a un layout NVFP4 con presupuesto de precision selectivo, donde las funciones sensibles (atencion, estado SSM, normas, embedding y LM head) conservan sus niveles de precision mientras la masa FFN reside en NVFP4; (2) la cabeza especulativa DFlash2 de tipo bloque (~1 B parametros, NVFP4, alineada con el modelo principal), que permite decodificacion especulativa sin cargar un segundo modelo; y (3) la torre de vision Parasyte Eye V2, un fine-tune con acotado por leash de la torre Qwen3-VL (ViT + merger, 461 M parametros, 333 tensores BF16), exportada y injertada como 334 tensores clip verificados byte a byte. El autor documenta que la receta de injerto incorpora el manejo del offset `data_start`, cuya ausencia provocaba salidas degeneradas ("!!!!") en paquetes anteriores. El paquete paso una auditoria de horneado de 77 puntos.

## Capacidades

- Generacion de texto y razonamiento general con ventana de contexto de 262.144 tokens.
- Entrada nativa de imagen y video ademas de texto, servida directamente por el motor sin mmproj externo.
- Comprension de escenas visuales con enfasis declarado en escenas de accion y contenido NSFW, manteniendo el registro de escena, pose, anatomia, ropa, marcas de agua y texto pequeno.
- Lectura de texto impreso y logotipos en imagenes; el autor afirma verificacion pixel a pixel de anclas fuera de distribucion (animales, vehiculos, personajes).
- Salida estructurada garantizada mediante capa de gramatica activada por defecto, con coste declarado sub-microsegundo por ventana.
- Decodificacion especulativa integrada con aceptacion de borrador de ~50%.
- Soporte de tool calling / function calling a traves de la API compatible con OpenAI del motor basalt (chat completions, imagenes via `image_url`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a los 262.144 tokens de contexto y al cacheo de prefijo, que evita re-procesar turnos ya cacheados; la salida estructurada por gramatica permite generar respuestas en JSON validable sin post-procesado.
- Generacion de codigo en produccion: la capa de gramatica y la cabeza especulativa DFlash2 disparan el throughput en texto estructurado hasta ~500 t/s, lo que lo hace adecuado para pipelines de CI/CD que necesitan generar parches, tests o llamadas a herramientas con formato estricto.
- Analisis de imagenes y video en local: al integrar la torre de vision en el mismo fichero y caber en una RTX 5090 de 32 GB, permite desplegar un pipeline multimodal (captioning, moderacion visual, extraccion de texto en imagenes) en una sola maquina sin servicios externos.
- Procesamiento de documentos largos: con 262k de contexto puede ingerir contratos, informes o bases de codigo extensas en una sola pasada; el prefill de 7-10k tok/s en contexto largo hace viable el analisis de documentos de decenas de miles de tokens.
- Agentes multi-paso con llamada a herramientas: la salida estructurada garantizada y el soporte de function calling via API compatible con OpenAI permiten orquestar agentes que encadenan llamadas a APIs y parsean resultados de forma fiable.
- Moderacion y anotacion de contenido sensible: la variante heretic-abliterated y el fine-tune de vision Parasyte estan disenados para mantener el registro en contenido NSFW y escenas de accion, lo que resulta util en tareas de etiquetado o moderacion donde los modelos alineados estandar rechazan o degradan la descripcion.
- Asistencia creativa y roleplay: la ausencia de rechazos por alineacion y el contexto largo permiten mantener narrativas extensas con coherencia entre capitulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta mediciones de inferencia en una RTX 5090 de 32 GB (LACT, mem-only +4000 / 400 W) con el motor basalt v0.5.5:

| Metrica | Valor medido |
|---|---|
| Decodificacion en prosa libre | 250-350 t/s |
| Decodificacion en texto estructurado / tool-call | ~500 t/s |
| Aceptacion del borrador especulativo | ~50% |
| Prefill en frio, contexto corto | 12-15k tok/s |
| Prefill en frio, contexto largo | 7-10k tok/s (minimo medido: 7,1k en re-prefill en frio de 126k tras vaciado de cache) |
| Contexto maximo | 262.144 tokens |
| VRAM del motor a configuracion 262k NVFP4-KV | ~23,9 GB (~8,5 GB libres en la tarjeta) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~23,9 GB a la configuracion de 262k con KV en NVFP4; el fichero en disco ocupa 18,76 GiB.
- GPU recomendada segun el autor: RTX 5090 de 32 GB (mediciones realizadas en ella); cualquier GPU con al menos 24 GB de VRAM podria alojar el motor a esa configuracion, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB con ~8,5 GB de margen para trabajo co-residente. En tarjetas de 24 GB el margen seria muy ajustado o inexistente segun la configuracion de KV.
- Opciones de despliegue: exclusivamente el motor basalt v0.5.5 o superior (`basalt --serve`). No es compatible con llama.cpp, LM Studio, vLLM ni TGI, segun advierte el autor.
- Latencia y throughput: 250-350 t/s en prosa libre y ~500 t/s en texto estructurado en RTX 5090; prefill de 12-15k tok/s en contexto corto y 7-10k tok/s en contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Formato / motor | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27b-RVN-ARA-PK-Parasyte-basalt | 27,3 B + 461 M vision + ~1 B drafter | 262.144 | Si (imagen y video) | `.basalt` / basalt v0.5.5 | Apache 2.0 |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF (modelo base) | 27 B (no confirmado en la informacion) | no disponible | no disponible | GGUF / llama.cpp | no disponible |
| Qwen3.8-27B (Qwen team, original) | 27 B (no confirmado en la informacion) | no disponible | no disponible | safetensors | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo carga en el motor basalt v0.5.5 o superior; no es compatible con llama.cpp, LM Studio, vLLM ni TGI, lo que limita la portabilidad y el ecosistema de herramientas disponibles.
- El modelo deriva de una variante heretic-abliterated sin alineacion de seguridad: puede generar contenido NSFW, violento u ofensivo sin rechazo, lo que exige filtros propios en produccion.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones independientes de fidelidad ni de tasas de alucinacion.
- Idiomas soportados no declarados; no hay garantia documentada de calidad multilingue.
- La model card esta marcada como `not-for-all-audiences` y el repositorio contiene contenido NSFW; no es apto para entornos sin moderacion.
- El rendimiento reportado (~500 t/s, ~50% de aceptacion del borrador) procede de una unica RTX 5090 con overclock de memoria y no ha sido replicado por terceros; el repositorio registra 0 descargas.
- La ventana de 262k consume ~23,9 GB de VRAM; reducir la VRAM obliga a recortar contexto o cambiar la configuracion de KV, con impacto no documentado en calidad.
- La licencia Apache 2.0 se hereda de la cadena base segun el autor, pero la procedencia y las condiciones de los modelos intermedios (variante heretic-abliterated) no se detallan; conviene verificar la cadena completa antes de uso comercial.
- El modelo incluye una direccion de monedero Monero y enlaces de donacion en la model card; no constituyen parte tecnica del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Plaguekind/Qwen3.8-27b-RVN-ARA-PK-Parasyte-basalt
- Modelo base (GGUF): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Linea de la torre de vision Parasyte Eye: https://huggingface.co/Plaguekind/Qwen3.8-27B-Parasyte-Eye-GGUF
- Enlace de apoyo del autor: https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
