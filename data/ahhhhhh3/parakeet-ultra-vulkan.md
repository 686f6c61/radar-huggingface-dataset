# ahhhhhh3/parakeet-ultra-vulkan

## Resumen

`ahhhhhh3/parakeet-ultra-vulkan` es un export en FP16 para Vulkan del encoder y del proyector de encoder de [Moondream Parakeet Ultra](https://huggingface.co/moondream/parakeet-ultra), modelo de reconocimiento automático del habla (ASR) derivado de [NVIDIA Parakeet TDT 0.6B v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3). El autor, ahhhhhh3, lo publica con el objetivo de ejecutar transcripción local en Android usando ExecuTorch sobre la GPU del dispositivo, y no se trata de un release oficial de Moondream ni de NVIDIA.

El repositorio no contiene un sistema ASR completo: solo incluye el componente encoder (más el proyector) en formato ExecuTorch `.pte`. Para producir texto hace falta un decoder y un joiner TDT compatibles, que el autor toma del paquete int8 de `mldecode/parakeet-ultra-onnx-int8`. Es, por tanto, una pieza de infraestructura de despliegue más que un modelo nuevo: no hay entrenamiento adicional, solo un cambio de formato de ejecución y de precisión aritmética.

Su relevancia es práctica: demuestra que un encoder de 0,6 B de parámetros puede mover la inferencia a la GPU móvil vía Vulkan con una ventana fija de 30 segundos, a costa de una penalización pequeña de precisión medida en un único dispositivo (Pixel 7a) y con un fixture sintético. El interés para desarrolladores está en la viabilidad del camino Vulkan/ExecuTorch en Android, no en mejoras de calidad de transcripción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Parakeet TDT (transformer) + proyector de encoder; decoder y joiner TDT externos. Detalle de capas y atención no disponible |
| Parametros totales | 0,6 B en el modelo base (Parakeet TDT 0.6B v3); el archivo FP16 de 1.219.557.506 bytes corresponde aproximadamente a 610 M de parámetros en el encoder + proyector |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto: ventana fija de 30 s de audio (1.500.000 muestras a 16 kHz) por inferencia |
| Tipos de cuantizacion | FP16 en el encoder Vulkan (`VulkanPartitioner({'force_fp16': True})`); decoder, joiner y tokens en int8 en archivos separados |
| Idiomas soportados | No disponible. El modelo base selecciona el idioma automáticamente, pero no se publica la lista de idiomas ni se han verificado en este export |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | ExecuTorch `.pte` (`encoder-vulkan-30s.pte`); el pipeline completo requiere además artefactos ONNX int8 externos |
| Entrada | `float32` log-mel normalizado `[1, 128, 3000]` (128 bins, 3000 frames) |
| Salida | `float32` features proyectadas `[1, 640, 375]` |
| Runtime | ExecuTorch Android Vulkan 1.5.1; requiere Vulkan 1.1 |
| Checksum | SHA-256 `76bc8de211184fbbc4388c45732b873be5b8250571ede08d49b6dcc4410ac506` |
| Revision de pesos origen | `moondream/parakeet-ultra` @ `73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b` |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El artefacto es un export del encoder y del proyector de encoder de Parakeet Ultra, que a su vez es un modelo ASR construido sobre el framework Parakeet de NVIDIA y derivado de Parakeet TDT 0.6B v3. La arquitectura interna del encoder no se detalla en la información disponible más allá de su firma tensorial: consume características log-mel de 128 bins compatibles con NeMo (con normalización por población por característica) y emite 375 frames de features proyectadas de 640 dimensiones para una entrada de 30 segundos. La decodificación la realiza un decoder TDT (Token-and-Duration Transducer) que no forma parte de este repositorio.

No ha habido entrenamiento ni ajuste alguno: el autor indica explícitamente que la conversión «no es una nueva ejecución de entrenamiento», solo un cambio de formato de ejecución con aritmética FP16 en Vulkan, mediante `to_edge_transform_and_lower` y el particionador Vulkan de ExecuTorch. Por tanto, no procede hablar de composición del dataset, número de tokens de entrenamiento ni fases de RLHF/DPO en este artefacto; esos datos pertenecen a Parakeet TDT 0.6B v3 y a Parakeet Ultra, y no se recogen en la información proporcionada.

La innovación relevante es de despliegue: compilar el grafo para Vulkan con FP16 forzado y ventana fija de 30 s, de modo que el encoder se ejecute en la GPU integrada del teléfono en lugar de la CPU. El pipeline probado por el autor usa además un segmentador (Photon, con cabeza VAD del propio modelo) que corta audio largo en segmentos de como máximo 30 segundos, y el padding del último chunk con silencio antes de la extracción de features.

## Capacidades

- Extracción de features de audio para ASR: convierte log-mel de 30 s en features proyectadas listas para un decoder TDT.
- Aceleración por GPU en Android mediante Vulkan 1.1 y ExecuTorch 1.5.1, con cómputo interno en FP16.
- Integración en pipelines ASR completos cuando se combina con decoder, joiner y vocabulario int8 compatibles (`mldecode/parakeet-ultra-onnx-int8`).
- Soporte de audio largo por segmentación: el pipeline de referencia trocea conferencias TED-LIUM 3 de 10-20 minutos en segmentos de hasta 30 s usando la cabeza VAD del modelo.
- Puntuación y mayúsculas preservadas por el pipeline de referencia del modelo base (no verificadas en este export).
- Timestamps por palabra (`timestamps="word"`) disponibles en el pipeline de referencia del modelo base; dependen del decoder y del segmentador, no del encoder aislado.
- Detección automática de idioma en el modelo base; no verificada en este export ni con cobertura de idiomas publicada.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni generación de texto: es un componente puramente acústico.
- No acepta audio directamente: requiere un front-end externo que calcule los log-mel de 128 bins.

## Casos de uso

- **Dictado y notas de voz offline en Android**: una app puede capturar audio a 16 kHz mono, calcular log-mel de 128 bins y ejecutar este encoder en la GPU del teléfono, manteniendo el audio en el dispositivo. Adecuado para escenarios de privacidad donde no se quiere enviar voz a un servidor.
- **Transcripción de reuniones y conferencias largas**: combinando el encoder con el segmentador basado en VAD y un decoder TDT, se pueden procesar charlas de 10-20 minutos en chunks de 30 s. Es el escenario que el pipeline de referencia valida sobre TED-LIUM 3.
- **Subtitulado y accesibilidad en tiempo real**: para subtítulos en directo en el propio dispositivo, con la ventaja de no depender de conectividad; requiere bufferizar 30 s o aceptar latencia de chunk y validar el rendimiento térmico sostenido en el dispositivo objetivo.
- **Transcripción de entrevistas y trabajo de campo sin cobertura**: periodistas o investigadores que graban en movilidad pueden transcribir en el dispositivo y sincronizar después solo el texto, reduciendo exposición de datos personales en tránsito.
- **Análisis de llamadas con cumplimiento normativo estricto**: en sectores regulados (salud, banca), ejecutar el encoder en el terminal evita enviar audio a terceros; el coste es que la precisión debe revalidarse por dispositivo y por idioma.
- **Prototipado y benchmarking de backends GPU móviles**: sirve como carga de trabajo reproducible para comparar Vulkan FP16 frente a CPU int8 en distintos SoC (Adreno, Mali, Xclipse), midiendo latencia, memoria y precisión con un fixture controlado.
- **Aplicaciones de transcripción por lotes en segundo plano**: procesar grabaciones ya almacenadas en el teléfono aprovechando la GPU cuando el dispositivo está cargando; el autor documenta una ejecución con el terminal bloqueado, lo que sugiere viabilidad en background con las cautelas térmicas habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de WER en la información disponible para este export. Los únicos datos cuantitativos son la validación local del autor y una puntuación agregada de un directorio de modelos:

| Metrica | Valor | Contexto |
|---|---|---|
| Tiempo de transcripción (GPU Vulkan FP16) | 230,620 s | Audio sintético de 23:59 en Pixel 7a, incluye conversión MP3 y carga del modelo |
| Tiempo de transcripción (CPU int8, referencia) | 384,942 s | Misma prueba, app int8 CPU anterior |
| Ediciones de palabra normalizadas (GPU) | 74 sobre 4.413 palabras de referencia (1,68 %) | Fixture sintético único |
| Ediciones de palabra normalizadas (CPU int8) | 52 sobre 4.413 palabras de referencia (1,18 %) | Fixture sintético único |
| Memoria de runtime del worker GPU | ~1,6 GiB | Memoria total de la app superior |
| Puntuación agregada de terceros | 68,8 (cobertura 45 %) | llmboard.ai, modelo base `parakeet-ultra` en Open ASR Leaderboard |

El autor advierte de que no fueron ensayos aleatorizados, que el teléfono estuvo bloqueado la mayor parte de la ejecución en GPU y que la diferencia de precisión no constituye evidencia de paridad general. No hay datos publicados de WER, latencia por chunk ni throughput en otros dispositivos.

## Requisitos de hardware

- **Memoria**: aproximadamente 1,6 GiB de memoria de runtime para el proceso worker de GPU en Pixel 7a; el consumo total de la aplicación es superior al no incluir decoder, joiner, vocabulario ni front-end de features.
- **GPU compatible**: cualquier GPU Android con soporte Vulkan 1.1 y extensiones suficientes para las operaciones del grafo; el autor solo ha verificado Pixel 7a (SoC Google Tensor G2, GPU Mali-G710).
- **GPU recomendadas**: no hay lista validada. Cualquier Adreno, Mali o Xclipse reciente con Vulkan 1.1 es candidata, pero requiere validación propia en el dispositivo final.
- **¿Cabe en GPU de consumo?**: sí, está diseñado para GPU integrada de teléfono; el archivo es de 1,22 GB en disco y el worker consume ~1,6 GiB de memoria. No aplica a GPU de escritorio como requisito, aunque podría ejecutarse sobre Vulkan en ellas sin validación documentada.
- **Opciones de despliegue**: ExecuTorch 1.5.1 con backend Vulkan en Android; el pipeline necesita además decoder, joiner y tokens int8 en ONNX (por ejemplo, los de `mldecode/parakeet-ultra-onnx-int8`) o un decoder TDT compatible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: en Pixel 7a, ~231 s para 24 minutos de audio (aproximadamente 6,2x tiempo real) con la GPU Vulkan FP16, frente a ~385 s (aproximadamente 3,7x tiempo real) con la CPU int8 anterior. Cifras de una sola prueba, con el terminal bloqueado.
- **Robustez**: el autor recomienda aislar la ejecución en GPU en un proceso separado para poder recuperarse de fallos nativos y mantener una ruta de fallback a CPU si la validación o la ejecución en GPU fallan.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana | Formato / backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ahhhhhh3/parakeet-ultra-vulkan` | 0,6 B (encoder + proyector, FP16) | 30 s fijos | ExecuTorch `.pte`, Vulkan Android | CC BY 4.0 | Público; 0 descargas, 0 likes |
| `mldecode/parakeet-ultra-onnx-int8` | 0,6 B (pipeline completo int8) | Segmentos de hasta 30 s | ONNX int8, CPU | No disponible en la información | Público; es la referencia de decoder, joiner y tokens del pipeline probado |
| `moondream/parakeet-ultra` | 0,6 B | Segmentos de hasta 30 s con VAD | Pesos de precisión completa, GPU (CUDA) | CC BY 4.0 | Público; modelo oficial de Moondream |
| `nvidia/parakeet-tdt-0.6b-v3` | 0,6 B | No disponible | NeMo | No disponible en la información | Público; base del linaje |

La comparación relevante no es de calidad sino de formato: el export Vulkan es el único de la lista pensado para GPU móvil; el ONNX int8 prioriza CPU y compacidad; el modelo original de Moondream prioriza precisión en GPU de escritorio. No hay datos de WER comparables entre las cuatro variantes en la información disponible.

## Limitaciones y advertencias

- **No es un modelo autónomo**: solo contiene encoder y proyector. Sin un decoder TDT, un joiner y el vocabulario correspondientes no genera texto; el autor lo indica de forma explícita.
- **No acepta audio directamente**: exige un front-end que calcule log-mel NeMo de 128 bins con normalización por población por característica. Un desajuste en el front-end degrada la transcripción sin aviso.
- **Ventana rígida de 30 s**: los chunks deben ser de exactamente 30 s y el último debe rellenarse con silencio. No hay manejo interno de audio más largo.
- **Validación muy limitada**: probado solo en un Pixel 7a, con un único fixture sintético, en un ensayo no aleatorizado y con el teléfono bloqueado durante la mayor parte de la ejecución en GPU. No hay evidencia de paridad de precisión general.
- **Penalización de precisión observada**: 1,68 % de ediciones de palabra frente a 1,18 % de la referencia int8 CPU sobre el mismo fixture; el autor no lo presenta como paridad.
- **Sin verificar**: otros SoC, otros fabricantes de Android, otros idiomas, comportamiento térmico y consumo de batería.
- **Idiomas no cubiertos por la documentación**: no se publica lista de idiomas soportados ni se han validado en este export.
- **Riesgo de fallo nativo**: el backend Vulkan puede fallar en controladores concretos; se recomienda proceso aislado y ruta de fallback a CPU.
- **Licencia CC BY 4.0**: permite uso comercial, pero obliga a atribuir a Moondream (Parakeet Ultra) y a NVIDIA (Parakeet subyacente), enlazar la licencia e identificar las modificaciones al redistribuir. El software de runtime (ExecuTorch, Vulkan) tiene licencias propias e independientes.
- **Sin soporte ni mantenimiento declarado**: repositorio con 0 descargas y 0 likes, actualizado una sola vez; no es un release oficial y no hay garantía de soporte.
- **No es un servicio alojado**: la inferencia ocurre en el dispositivo del usuario.

## Enlaces

- [Repositorio del export: ahhhhhh3/parakeet-ultra-vulkan](https://huggingface.co/ahhhhhh3/parakeet-ultra-vulkan)
- [Modelo base: moondream/parakeet-ultra](https://huggingface.co/moondream/parakeet-ultra)
- [Modelo NVIDIA subyacente: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Decoder, joiner y tokens int8: mldecode/parakeet-ultra-onnx-int8](https://huggingface.co/mldecode/parakeet-ultra-onnx-int8/tree/3282a6e32885b431c1543d58c7710e6e3412eac0)
- [Blog de Moondream: Introducing Parakeet Redux and Parakeet Ultra](https://moondream.ai/blog/introducing-parakeet-redux-and-ultra)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Ficha en llmboard.ai](https://www.llmboard.ai/models/moondream-parakeet-ultra)
- [Ficha en There's An AI For That](https://theresanaiforthat.com/model/moondream-parakeet-ultra/)
