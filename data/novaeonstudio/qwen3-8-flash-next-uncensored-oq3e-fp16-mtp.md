# NovaeonStudio/Qwen3.8-Flash-Next-Uncensored-oQ3e-fp16-mtp

## Resumen

NovaeonStudio/Qwen3.8-Flash-Next-Uncensored-oQ3e-fp16-mtp es una cuantización de 3 bits del modelo multimodal (image-text-to-text) orcarouter/Qwen3.8-Flash-Next-Uncensored, publicada por Novaeon.Studio y empaquetada exclusivamente para MLX sobre Apple Silicon. Se trata de un MoE con arquitectura declarada `qwen4_exp` (Qwen4ExpForConditionalGeneration), con cabecera MTP (multi-token prediction) nativa preservada, torre de visión y una pila de embeddings PLE basada en n-gramas que, según el autor, la mayoría de cuantizadores destruyen o rechazan procesar. El resultado ocupa 85,2 GB en disco y 79,5 GB residentes en oMLX, frente a los ~335 GB del modelo base en bf16 y los ~106 GB de la variante oQ4e.

El problema que resuelve es de viabilidad en hardware: un MoE de 512 expertos con contexto nativo de 262.144 tokens no cabe en una máquina de 128 GB de memoria unificada en bf16, y la cuantización canónica de 4 bits deja un margen muy estrecho. Esta build de 3 bits con compensación de error (base afín de 3 bits, grupo 64) y 475 overrides guiados por sensibilidad (198 a 8 bits, 129 a 5 bits, 17 a 4 bits, 3 a 6 bits, más fp16 para normas, router y embeddings) pretende ser la diferencia entre "carga técnicamente" y "es mi máquina de uso diario".

Es relevante ahora por dos motivos concretos: primero, demuestra que la decodificación especulativa mediante cabecera MTP nativa aporta un +67 % de velocidad de decodificación (de 42,3 a 70,8 tok/s) en un MacBook de 128 GB; segundo, documenta un patrón de fallo claro y medido en tool calling multi-paso y paralelo, lo que lo convierte en un caso de estudio honesto sobre los límites de los modelos "uncensored" en bucles de agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (`Qwen4ExpForConditionalGeneration`), MoE con atención lineal GatedDeltaNet y atención completa cada 4 capas; 48 capas, hidden 2560, 512 expertos con 10 activos; torre de visión de 27 capas y 1152 dimensiones; pila de embeddings PLE por n-gramas |
| Parametros totales | Discrepancia en las fuentes: el metadato de safetensors del repo indica 179.999.981.459 (~180 B); la model card describe el modelo como "99 B-A5B". No disponible una cifra unificada |
| Parametros activos | ~5 B por token (notación A5B de la model card; 10 expertos activos de 512). El metadato de safetensors no desglosa parámetros activos |
| Longitud de contexto | 262.144 tokens nativos (valor recomendado de `max_context_window` en oMLX) |
| Tipos de cuantizacion | oQ3e: base afín de 3 bits con grupo 64, compensación de error y 475 overrides por tensor (198 a 8 bits, 129 a 5 bits, 17 a 4 bits, 3 a 6 bits) + fp16 en normas, router y embeddings. El autor menciona además variantes bf16 (~335 GB) y oQ4e (~106 GB) del mismo modelo base |
| Idiomas soportados | en (inglés), según el campo `language` de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX: 17 shards, 3.748 tensores, 85,2 GB en disco; requiere la librería `mlx` y un motor oMLX con el loader `qwen4_exp` corregido (0.7.0.dev2 o superior) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen4_exp` (clase `Qwen4ExpForConditionalGeneration`), un transformer híbrido con mezcla de expertos: 48 capas, dimensión oculta de 2560 y 512 expertos de los que 10 se activan por token. La atención combina capas GatedDeltaNet (atención lineal) con capas de atención completa cada cuatro capas, un patrón habitual para reducir el coste del contexto largo. Además incorpora una pila de embeddings PLE (n-gramas) que, según el autor, es la parte que muchos cuantizadores "rechazan o destruyen", y una torre de visión de 27 capas y 1152 dimensiones que se conserva en esta cuantización (1,8 GB de los 85,2 GB totales). La cabecera MTP nativa se preserva con `mtp_num_hidden_layers: 1` y 76 tensores `mtp.*`, con 1,5 GB de peso.

No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación del modelo base ni si hubo RLHF o DPO. Lo único documentado es la naturaleza "uncensored" de la alineación, heredada del modelo base y verificada por el cuantizador sobre estos pesos cuantizados mediante pruebas de rechazo. La innovación técnica destacable de esta build es doble: la receta de cuantización oQ3e (base de 3 bits con overrides sensibilidad-dirigidos y fp16 en los tensores críticos) y la conservación funcional de la cabecera MTP, que actúa como decodificación especulativa y entrega un +67 % de velocidad de decodificación. El autor advierte de un detalle operativo importante: `preserve_mtp: true` no es el valor por defecto del pipeline `oq` de oMLX, por lo que hay que pasarlo explícitamente o se publica un modelo sin cabecera MTP.

## Capacidades

- Generación de texto y explicación general: resultados de coherencia "fluidos, precisos y bien estructurados" en las pruebas del autor.
- Razonamiento: supera la trampa del bate y la pelota (bat-and-ball) con la respuesta correcta (0,05 dólares) y una comprobación de una línea.
- Visión (image-text-to-text): lectura de gráficos; identificó correctamente el tipo de gráfico, el fondo, el título y las etiquetas de categoría de los ejes a partir de un PNG.
- Contexto largo: recuperación exacta y literal en una prueba needle-in-a-haystack a 80.000 tokens; repetición en caliente del mismo prompt de 80.000 tokens en 3,4 s con un 99,7 % de acierto de caché de prefijo.
- Generación sin rechazos: cero rechazos en sondas de blasfemias y de mecánicas de seguridad, respondiendo de forma directa a ambas.
- Tool calling de una sola herramienta: selección correcta de función y argumentos; también acierta al decidir que no hace falta ninguna herramienta y responder directamente.
- Tool calling paralelo y encadenado: fallo confirmado. En el caso multi-ciudad emitió una sola llamada en lugar de dos; en el encadenado (clima → correo) emitió prosa de razonamiento en lugar de una llamada.
- Decodificación especulativa con MTP nativo: activable mediante `mtp_enabled` y `mtp_num_draft_tokens` (por defecto, 6).
- Multilingüismo: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Asistente conversacional local de contexto largo: con 262.144 tokens de ventana y ~70,8 tok/s de decodificación con MTP activo, permite mantener sesiones multi-turno sobre documentación extensa sin salir del portátil, con los datos sin abandonar la máquina.
- Análisis de documentación técnica y legal extensa: la recuperación exacta a 80.000 tokens medida por el autor lo hace adecuado para preguntas de precisión sobre contratos, normativa o manuales largos, donde el fallo típico es perder el dato concreto.
- Procesamiento de capturas y gráficos: la torre de visión permite extraer conclusiones de PNG con gráficos, diagramas o capturas de panel; útil para informes automatizados donde hay que describir una figura y sus ejes.
- Investigación en seguridad y red teaming: al ser uncensored y no rechazar peticiones sobre mecánicas de seguridad, sirve como sujeto de prueba para estudiar comportamiento de modelos sin capa de rechazo, siempre en entornos controlados y con revisión humana.
- Cuantización e investigación de sistemas: es un banco de pruebas reproducible para medir el impacto de la decodificación especulativa MTP en Apple Silicon, con cifras publicadas de draft-4, draft-6 y draft-8 y del punto en que el draft extra deja de compensar su coste de verificación.
- Automatización con una única herramienta: integrable en pipelines donde el modelo debe elegir una función y sus argumentos (por ejemplo, consultar una API interna o enviar un formulario), un camino que el autor verifica como fiable.
- Prototipado de agentes con validación previa obligatoria: dado que el encadenamiento y el paralelismo de herramientas fallan, solo es recomendable en bucles de agente si se añade una capa externa de orquestación y se prueba el camino concreto antes de ponerlo en producción.
- Despliegue con requisitos de privacidad: al ejecutarse íntegramente en local sobre MLX, encaja en escenarios donde no se permite enviar datos a APIs de terceros, siempre que el usuario acepte la dependencia de hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas cifras son mediciones propias del autor en un Apple M5 Max de 128 GB con oMLX (motor VLM), mediana de 3 ejecuciones, generación de 320 tokens, temperatura 0, KV de 8 k y TurboQuant-KV de 8 bits.

| Configuración MTP | Decodificación (tok/s) | Diferencia frente a MTP desactivado |
|---|---|---|
| MTP desactivado | 42,3 | — |
| MTP activado, `draft-4` | 70,2 | +66 % |
| MTP activado, `draft-6` (por defecto) | 70,8 | +67 % |
| MTP activado, `draft-8` | 67,9 | +61 % |

| Prompt | Tokens de entrada | Tiempo total | Rendimiento de prefill |
|---|---|---|---|
| Clase 4 k | 11.268 | 8,2 s | ~1.384 tok/s |
| Clase 16 k | 44.869 | 23,6 s | ~1.914 tok/s |
| Clase 32 k | 90.068 | 34,8 s | ~2.605 tok/s |

Memoria y carga: con un techo de guarda de memoria de 108 GB, oMLX reporta 79,5 GB de modelo; `qwen4_ple_ssd_offload` permanece desactivado y unos 62,5 GB de la pila PLE se sirven por mmap en lugar de páginas fijadas. Bajo decodificación sostenida el sistema se mantiene en torno al 21 % de memoria libre, sin bloqueos de paginación ni caídas de rendimiento. La carga en frío tarda unos 17 s.

| Sonda de capacidad | Resultado |
|---|---|
| Coherencia general y explicación | Pasa |
| Razonamiento (trampa bat-and-ball) | Pasa — 0,05 $ con comprobación correcta |
| Sondas de rechazo (blasfemias, mecánicas de seguridad) | Pasa — cero rechazos |
| Visión (lectura de gráfico) | Pasa |
| Recuperación en contexto largo a 80 k | Pasa — recuperación exacta |
| Tool calling, selección de una herramienta | Pasa |
| Tool calling, "no hace falta herramienta" | Pasa |
| Tool calling paralelo multi-ciudad | Falla |
| Tool calling encadenado (clima → correo) | Falla |

## Requisitos de hardware

- Almacenamiento: 85,2 GB en disco (17 shards). El modelo base en bf16 ronda los 335 GB y la variante oQ4e los 106 GB.
- Memoria: 79,5 GB residentes reportados por oMLX. El autor recomienda una máquina de 128 GB de memoria unificada (probado en Apple M5 Max de 128 GB) con techo de guarda de memoria fijado en 108 GB.
- GPU: no se documenta soporte para CUDA. El modelo es específico de Apple Silicon (tags `mlx`, `apple-silicon`). No hay datos de funcionamiento en A100, H100 o RTX 4090.
- GPU de consumo: no aplicable en el sentido habitual; no cabe en GPUs de consumo con 24 GB de VRAM. El requisito realista es un Mac con memoria unificada de 128 GB. No hay información sobre comportamiento en máquinas de 64 GB o 96 GB.
- Motor de despliegue: oMLX (Apple MLX) en modo VLM, con un build que incluya el loader `qwen4_exp` corregido (0.7.0.dev2 o superior). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Configuración recomendada por el autor: `mtp_enabled: true`, `mtp_num_draft_tokens: 6`, `turboquant_kv_enabled: true`, `turboquant_kv_bits: 8.0`, `turboquant_skip_last: true`, `qwen4_ple_ssd_offload: false`, `max_context_window: 262144`.
- Latencia y throughput medidos: 70,8 tok/s de decodificación con MTP `draft-6` (42,3 tok/s sin MTP); prefill de ~1.384 a ~2.605 tok/s según longitud de prompt; carga en frío de ~17 s; repetición de un prompt de 80 k tokens en 3,4 s con caché de prefijo caliente.

## Comparativa con modelos similares

No se dispone de información sobre modelos de terceros comparables (mismo tamaño, misma tarea o misma categoría) en la documentación proporcionada. La comparación posible es interna, entre las variantes del mismo modelo base:

| Variante | Parámetros | Contexto | Tamaño | MTP | Licencia | Motor |
|---|---|---|---|---|---|---|
| Este repo (oQ3e, fp16 en tensores críticos) | ~180 B según safetensors / 99 B-A5B según model card | 262.144 | 85,2 GB en disco / 79,5 GB residentes | Sí, nativo (76 tensores `mtp.*`) | apache-2.0 | oMLX (MLX), Apple Silicon |
| Modelo base orcarouter/Qwen3.8-Flash-Next-Uncensored (bf16) | No disponible en detalle | No disponible | ~335 GB | No disponible | apache-2.0 (heredada) | No disponible |
| Variante oQ4e del mismo modelo (mencionada por el autor) | Igual que el base | No disponible | ~106 GB | No disponible | apache-2.0 (heredada) | oMLX (MLX) |

## Limitaciones y advertencias

- Sesgos: no hay información publicada sobre evaluación de sesgos en la documentación disponible. El modelo declara únicamente inglés, lo que sesga su utilidad fuera de ese idioma.
- Alineación sin rechazos: es uncensored y el autor verifica cero rechazos ante blasfemias y ante mecánicas de seguridad. Esto implica riesgo de generar contenido dañino, ilegal o peligroso sin fricción. No es apto para aplicaciones orientadas al público sin una capa de moderación propia y sin revisión legal previa.
- Alucinación: no se ha publicado ninguna evaluación de veracidad. El rendimiento correcto en una prueba de recuperación exacta a 80 k tokens no garantiza fiabilidad factual general.
- Tool calling multi-paso: el propio autor identifica el encadenamiento y el paralelismo de herramientas como el punto débil verificado. En un bucle de agente que dependa de llamadas paralelas o encadenadas, el modelo fallará (emite una sola llamada o prosa de razonamiento en lugar de una llamada). Hay que probar ese camino antes de comprometerse con él en producción.
- Dependencia de hardware y software: solo funciona en Apple Silicon con un build concreto de oMLX (0.7.0.dev2 o superior) que incluya el loader `qwen4_exp` corregido. No hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI, lo que bloquea su uso en infraestructura de servidores convencional.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la trazabilidad del modelo base y de sus datos de entrenamiento no está documentada en esta ficha; conviene revisar la licencia y las condiciones del modelo base orcarouter/Qwen3.8-Flash-Next-Uncensored antes de un despliegue comercial.
- Discrepancia de parámetros: el metadato de safetensors indica ~180 B de parámetros totales, mientras que la model card describe el modelo como "99 B-A5B". Es una diferencia sustancial que no se resuelve con la información disponible.
- Madurez y validación: el repositorio registra 0 descargas y 0 "me gusta", con fecha de creación y actualización del 18 de septiembre de 2026. Todas las métricas de rendimiento y capacidad son mediciones del propio autor, sin replicación independiente ni resultados de benchmarks estándar.
- Nomenclatura: los identificadores `qwen4_exp` y "Qwen3.8" no corresponden a ninguna familia publicada que se pueda verificar con la información proporcionada; el modelo es una cuantización de terceros, no una publicación oficial del desarrollador de la familia Qwen.
- Los resultados de la búsqueda web realizada no contienen ningún material relacionado con este modelo (devolvieron resultados sobre Google Maps), por lo que no hay fuentes externas de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaeonStudio/Qwen3.8-Flash-Next-Uncensored-oQ3e-fp16-mtp
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio del motor oMLX: https://github.com/jundot/omlx
- Sitio del autor: https://novaeon.studio
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron únicamente documentación de Google Maps, sin relación con el modelo.
