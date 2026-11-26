# klee100/Qwen3.8-Flash-Next-AutoRound-A100-3bpw-MTP

## Resumen

Qwen3.8-Flash-Next-AutoRound-A100-3bpw-MTP es una cuantización de precisión mixta del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario klee100. El checkpoint reduce el modelo base en BF16 a una representación de aproximadamente 2,998 bits por peso efectivos, combinando expertos enrutados a 2/3 bits, proyecciones principales a 8 bits, rutas sensibles en BF16 y expertos MTP a 4 bits. El resultado son 53.903.345.776 parámetros totales distribuidos en 13 shards de safetensors, con un repositorio de 306,2 GB.

La relevancia de esta ficha es práctica: demuestra que es posible ejecutar un modelo de la familia Qwen3.8 en hardware Ampere de gama alta (SM80, 64 GiB) manteniendo el 47,3 GiB de pesos en VRAM y descargando la tabla PLE de 95,37 GiB a SSD mediante E/S asíncrona con Linux AIO. Para ello se requiere un parche específico sobre vLLM en el commit `a5a30471ff2bb7f0824f2da10e358af98d304472`, lo que convierte este checkpoint en un artefacto experimental orientado a investigación de inferencia más que a despliegue estándar.

La calidad de la cuantización se mide con una divergencia KL de 0,1208 frente a los pesos originales, un valor que el autor publica sin comparativa con otras cuantizaciones. El modelo hereda la licencia Qwen Community 1.0 del modelo base y la plantilla de chat sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) y capa MTP; detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 53.903.345.776 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens anunciados por el autor; validado en pruebas solo hasta 32K |
| Tipos de cuantizacion | Precisión mixta AutoRound: expertos enrutados a 2/3 bits (~2,998 bpw efectivos), proyecciones principales a 8 bits, rutas sensibles en BF16, expertos MTP a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (13 shards, todos necesarios) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado desde cero. Se aplica AutoRound (con Auto-GPTQ en la cadena de herramientas) sobre los pesos BF16 del modelo base Qwen/Qwen3.8-Flash-Next, asignando precisión de forma diferenciada por tipo de tensor: los expertos enrutados del bloque MoE se comprimen a 2/3 bits, las proyecciones principales se mantienen a 8 bits, las rutas identificadas como sensibles conservan BF16 y los expertos de la capa de predicción multi-token (MTP) se cuantizan a 4 bits. Esta asignación por capas es la que produce el promedio de ~2,998 bpw y una divergencia KL de 0,1208 respecto a los pesos originales.

La innovación técnica destacable no está en el entrenamiento sino en el runtime. El autor publica un parche completo para vLLM que añade carga de la tabla PLE en modo solo-metadatos, lecturas de filas asíncronas con read-ahead sobre SSD mediante Linux AIO, rupturas de CUDA graph en el host, overrides de bits por experto y remapeo de capas MTP. La tabla PLE en BF16 ocupa 95,37 GiB y permanece en SSD, de modo que solo 47,3 GiB de pesos residen en VRAM. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, con la plantilla de chat heredada sin cambios del modelo base Qwen.
- Razonamiento con modo thinking, desactivable en tiempo de inferencia (las pruebas de rendimiento se ejecutaron con thinking desactivado).
- Predicción multi-token (MTP) con decodificación especulativa integrada, mediante la capa MTP cuyos expertos se cuantizan a 4 bits.
- Procesamiento de imagen y texto según el pipeline declarado `image-text-to-text`, aunque la model card no detalla las capacidades de visión.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integración con APIs de inferencia tipo OpenAI.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.

## Casos de uso

- Investigación de cuantización extrema en MoE: el checkpoint sirve como referencia reproducible para estudiar el impacto de 2/3 bits en expertos enrutados con una métrica publicada de KLD (0,1208) y un conjunto de pesos de 306,2 GB descargable.
- Despliegue en GPUs Ampere de 64 GiB con almacenamiento NVMe: el esquema de offload de la tabla PLE a SSD permite servir el modelo en hardware que no podría alojar los 95,37 GiB de PLE en VRAM, usando el parche de vLLM y `ple_ssd_io.so`.
- Servicio de chat a baja concurrencia: con 111 tok/s en decodificación de una sola petición y 667 tok/s agregados con 16 peticiones, es adecuado para prototipos de asistentes conversacionales donde prima la disponibilidad sobre el throughput masivo.
- Prellenado de contextos largos en pipelines de análisis documental: los 2.636 prompt tok/s en prellenado de 8K permiten procesar documentos extensos, aunque la validación práctica del contexto llega solo a 32K de los 262K anunciados.
- Evaluación comparativa de runtimes de inferencia: útil para medir el coste real del offload asíncrono frente a alternativas de cuantización puramente en VRAM, dado que el autor publica metodología de medición (medianas de tres rondas, temperatura cero, EOS ignorado).
- Reproducción de experimentos de decodificación especulativa: la capa MTP cuantizada a 4 bits permite estudiar la degradación de la aceptación especulativa bajo compresión agresiva.
- Base para variantes derivadas: el autor publica una versión sin censura sobre el mismo esquema, lo que facilita experimentos comparativos de alineación sobre pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son de rendimiento de inferencia en el runtime experimental:

| Carga de trabajo | Throughput |
|---|---:|
| Prellenado de 8K en frío | 2.636 prompt tok/s |
| Decodificación de una sola petición | 111 tok/s |
| Salida agregada con 16 peticiones | 667 tok/s |

Condiciones de medición: MTP=1, fragmentos de prellenado de 2K, medianas de tres rondas, 128 tokens de salida en chat, temperatura cero, thinking desactivado y EOS ignorado. El throughput agregado incluye prellenado; la decodificación excluye la latencia del primer token. Hardware de prueba: GPU SM80 de 64 GiB a 180 W, 15 GiB de RAM, 31 GiB de swap y almacenamiento SATA empresarial. Métrica de fidelidad de cuantización: KLD de 0,1208 frente a los pesos originales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 47,3 GiB de pesos cargados en VRAM, más la tabla PLE de 95,37 GiB que reside en SSD.
- GPU recomendadas: el autor valida sobre una GPU SM80 de 64 GiB (familia A100) a 180 W; los tags indican soporte Ampere. No se documenta compatibilidad con Hopper ni con GPUs de consumo.
- GPU de consumo: no cabe en GPUs consumer convencionales, ya que solo los pesos en VRAM superan los 47 GiB y el esquema depende de offload a SSD.
- Almacenamiento: se requiere SSD con Linux AIO y capacidad suficiente para la tabla PLE (95,37 GiB) más los 306,2 GB del repositorio.
- Opciones de despliegue: vLLM en el commit `a5a30471ff2bb7f0824f2da10e358af98d304472` con el parche del autor y la librería `ple_ssd_io.so` compilada. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Memoria del sistema: el entorno de referencia usa 15 GiB de RAM y 31 GiB de swap, un margen muy ajustado que conviene ampliar en producción.
- Latencia y throughput: 2.636 prompt tok/s en prellenado de 8K, 111 tok/s en decodificación individual y 667 tok/s agregados con 16 peticiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (AutoRound 3bpw + MTP) | 53,9 B totales | 262K anunciados, 32K probados | 2/3 bits expertos, 8 bits proyecciones, BF16 rutas sensibles | Qwen Community 1.0 | Hugging Face, requiere parche de vLLM |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la información | no disponible en la información | BF16 | Qwen Community 1.0 | Hugging Face, oficial |
| Variante sin censura del mismo autor | 53,9 B totales | 262K anunciados | Mismo esquema AutoRound 3bpw + MTP | Qwen Community 1.0 | Hugging Face |
| Otras cuantizaciones del modelo base | no disponible | no disponible | no disponible | Qwen Community 1.0 | no disponible |

No se dispone de datos de benchmarks que permitan comparar calidad frente al modelo base ni frente a otras cuantizaciones del mismo modelo. La única métrica objetiva de fidelidad es el KLD de 0,1208 de este checkpoint frente a los pesos BF16.

## Limitaciones y advertencias

- Runtime experimental: el autor reconoce abiertamente un problema de consistencia aritmética sin resolver, lo que desaconseja su uso en producción sin validación propia.
- Contexto no verificado: se anuncian 262K tokens, pero las pruebas de temporización con tokens variados solo llegan a 32K. No hay garantía de comportamiento correcto por encima de ese umbral.
- Dependencia de un parche no oficial: requiere aplicar un parche a un commit concreto de vLLM y compilar una librería propia. Cualquier actualización de vLLM puede romper la compatibilidad.
- Offload a SSD como requisito: el rendimiento depende críticamente de la latencia y el ancho de banda del almacenamiento; el entorno probado usa SATA empresarial, y unidades más lentas degradarán el throughput de forma significativa.
- Memoria del sistema ajustada: el entorno de referencia opera con 15 GiB de RAM y 31 GiB de swap, un margen que puede provocar inestabilidad bajo carga sostenida.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión a 2/3 bits en expertos enrutados puede amplificar errores en tareas de razonamiento aritmético o factual, especialmente con thinking desactivado.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no se especifica la cobertura lingüística, por lo que no puede asumirse un rendimiento multilingüe homogéneo.
- Licencia: Qwen Community 1.0 impone condiciones específicas para uso comercial que deben revisarse antes de cualquier despliegue productivo; no es una licencia permisiva tipo Apache 2.0.
- Todos los shards son obligatorios: no es posible cargar un subconjunto de los 13 safetensors, lo que fija el requisito de almacenamiento en 306,2 GB.
- Repositorio de terceros: el checkpoint lo publica un usuario individual, no el equipo oficial de Qwen, con 233 descargas y 8 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klee100/Qwen3.8-Flash-Next-AutoRound-A100-3bpw-MTP
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante sin censura: https://huggingface.co/klee100/Qwen3.8-Flash-Next-Uncensored-AutoRound-3bpw-MTP
- Repositorio GitHub con parche de vLLM y guía: https://github.com/iIIusi0n/qwen3.8-flash-next-cmp170hx
- Parche de offload PLE a SSD: https://github.com/iIIusi0n/qwen3.8-flash-next-cmp170hx/blob/main/patches/qwen38-ple-ssd.patch
- Guía de instalación: https://github.com/iIIusi0n/qwen3.8-flash-next-cmp170hx/blob/main/docs/GUIDE.md
- Resultados completos de rendimiento: https://github.com/iIIusi0n/qwen3.8-flash-next-cmp170hx/blob/main/docs/RESULTS.md
