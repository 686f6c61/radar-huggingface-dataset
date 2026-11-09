# mikedoise/gemma-4-12B-it-coreai-fp16-256k-text

## Resumen

Gemma 4 12B Instruct Core AI FP16 256K Text Only es una conversión independiente del checkpoint oficial `google/gemma-4-12B-it` realizada por Michael Doise, orientada específicamente a ejecución nativa en Apple Silicon mediante el framework Core AI de Apple. El modelo conserva los pesos en FP16 (sin cuantización) y está empaquetado en el formato `.aimodel` propietario de Core AI, no en safetensors, GGUF ni MLX, lo que lo hace incompatible con los runners convencionales de Hugging Face. El binario principal ocupa 23.816.800.938 bytes (22,18 GiB).

La propuesta de valor es doble: por un lado, ofrece una ventana de contexto configurada de 262.144 tokens (incluyendo salida generada), validada con un caso sintético de recuperación de clave hasta 262.000 tokens de entrada; por otro, es una de las pocas distribuciones de Gemma 4 pensadas para el stack Core AI con un runtime Swift incluido que soporta cachés deslizantes locales de lectura-antes-de-escritura. La conversión es puramente de formato: BF16 original a FP16, sin entrenamiento adicional ni cuantización.

Es relevante porque demuestra la viabilidad de ejecutar un modelo de 12B parámetros con contexto extremo en hardware Apple (M5 Max con 128 GB en las pruebas), aunque con limitaciones importantes: es solo texto (sin visión, audio ni vídeo), el soporte de tool calling no está validado en este bundle corregido, y el consumo de memoria en el límite de contexto alcanza los 50,6 GiB de RSS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, checkpoint "Unified" de Google); detalles internos no disponibles |
| Parámetros totales | 12B (según nombre del modelo); desglose no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens configurados (entrada + salida); mayor entrada probada: 262.000 tokens |
| Tipos de cuantización | FP16 únicamente (sin cuantización); conversión 4-bit experimental fallida, no incluida |
| Idiomas soportados | no disponible (la model card no detalla idiomas) |
| Licencia | Apache 2.0 (con enlace a licencia Gemma 4 de Google) |
| Formato de pesos | Core AI `.aimodel` (no safetensors, GGUF, MLX ni Core ML) |
| Tamaño del binario | 23.816.800.938 bytes (22,18 GiB) |
| Tamaño del repo | 23,8 GB |
| Requisitos de plataforma | Apple Silicon, macOS 27.0+, Xcode 27.0+ con Core AI SDK |

## Arquitectura y entrenamiento

El modelo subyacente es el checkpoint `google/gemma-4-12B-it` de Google, fijado en el commit `43c9d014b231474fa7212dbb48a762566c2b255d`. La model card describe el modelo fuente como "Unified", pero esta conversión es explícitamente solo texto: los componentes de procesamiento de imagen, audio y vídeo no están incluidos. No se ha realizado entrenamiento adicional ni ajuste fino; la conversión es una única transformación de BF16 a FP16.

La innovación técnica principal no está en el modelo sino en el runtime: el paquete incluye un snapshot de `runtime-source` derivado de Apple `coreai-models` (commit `22b0eaac4b325b812605a5096acff4880f1c4a36`) con modificaciones locales que implementan cachés deslizantes locales de lectura-antes-de-escritura y soporte de ejecución secuencial en GPU. El runtime prefiere ejecución secuencial en GPU; no se reclama ejecución en Neural Engine. La primera especialización del modelo puede consumir decenas de GiB adicionales de disco. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento sobre contextos muy largos (hasta 262.144 tokens configurados).
- Recuperación de información en contexto largo: validada con un caso sintético de clave enterrada al inicio del prompt hasta 262.000 tokens de entrada.
- Conversación multi-turno instruct (hereda el comportamiento del checkpoint `-it` de Google).
- Soporte nativo de parsing de herramientas y sesiones incluido en `runtime-source`, pero **no validado** en este bundle corregido de 256K; la única prueba exitosa de round-trip de herramientas se hizo con el bundle anterior de 4K FP16.
- Sin capacidades multimodales: no procesa imagen, audio ni vídeo.
- Capacidades multilingües: no documentadas en la información disponible.
- No se documenta modo "thinking", decodificación especulativa ni otras optimizaciones de inferencia.

## Casos de uso

- Análisis de documentos extensos en local: el modelo permite cargar contratos, informes o bases de código de cientos de miles de tokens en un Mac con suficiente memoria, manteniendo todo el procesamiento en el dispositivo. Adecuado para entornos con requisitos de privacidad donde no se puede enviar el documento a la nube.
- Asistente de investigación sobre corpus largos: con 262.144 tokens de contexto, se puede indexar un paper completo o un conjunto de papers y formular preguntas de recuperación. La validación sintética sugiere que la recuperación literal funciona, aunque la calidad de razonamiento sobre el contexto no está evaluada.
- Prototipado en Apple Silicon: desarrolladores que quieran experimentar con Core AI y modelos de 12B pueden usar este bundle como referencia funcional, ya que incluye el runtime Swift compilable con Swift Package Manager.
- Procesamiento por lotes offline en estaciones de trabajo Mac: tareas de resumen, extracción o clasificación de documentos largos que no requieren baja latencia y pueden ejecutarse en un M5 Max con 128 GB.
- Evaluación comparativa de runtimes: útil para investigadores que comparen el rendimiento de Core AI frente a MLX, llama.cpp o vLLM en el mismo modelo base, dado que los pesos son FP16 sin cuantización.
- Generación de texto con contexto extremo en escenarios de auditoría: la coincidencia exacta de los diez tokens de contenido con la referencia FP16 de Google en 8K permite usar el modelo como referencia de fidelidad numérica en pruebas de portabilidad.
- No recomendado para agentes en producción con tool calling: el soporte de herramientas no está validado en este bundle y la model card advierte explícitamente que argumentos válidos no deben tratarse como autorización segura para ejecutar una herramienta.

## Benchmarks y rendimiento

La model card incluye mediciones de velocidad y memoria en un M5 Max (40 núcleos GPU, 18 núcleos CPU, 128 GB), con un caso sintético de recuperación de clave por longitud. Son observaciones de una sola ejecución, no medias de benchmark.

| Tokens de entrada | Procesamiento del prompt | Tokens/s de prompt | Tokens/s de generación | Tiempo total del runner |
|---:|---:|---:|---:|---:|
| 8.192 | 9,172 s | 893,1 | 16,0 | 65,511 s |
| 32.768 | 29,521 s | 1.110,0 | 12,8 | 37,475 s |
| 131.072 | 283,585 s | 462,2 | 6,0 | 293,944 s |
| 262.000 | 1.100,046 s | 238,2 | 4,1 | 1.113,864 s |

Los cuatro casos devolvieron exactamente `COBALT-RIVER-742`. La ejecución cerca del límite tardó aproximadamente 18 minutos y 34 segundos en total, emitiendo diez tokens de contenido y un stop. La primera ejecución de 8K incluye 54,063 segundos de preparación del modelo; las cargas posteriores fueron de unos cinco segundos. El RSS del proceso cerca del límite alcanzó un pico de 50,6 GiB, con un máximo de aproximadamente 64,3 GiB en las cuatro ejecuciones. El almacenamiento KV en FP16 al límite configurado es de 4,3125 GiB, excluyendo pesos, activaciones, workspace y overhead del runtime.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 27.0+ y Xcode 27.0+ con Core AI SDK. Probado en macOS 27.0.1 (26A434), Xcode 27.1 (27A9275) y M5 Max (40 núcleos GPU, 18 núcleos CPU, 128 GB).
- Memoria: no se establece un mínimo de RAM. En las pruebas se usó 128 GB; el RSS pico observado fue de 50,6 GiB cerca del límite y 64,3 GiB como máximo en las cuatro ejecuciones. El RSS no incluye toda la contabilidad de GPU y memoria compartida.
- Disco: el repositorio ocupa 23,8 GB; la primera especialización del modelo puede consumir decenas de GiB adicionales. Las cachés de compilación pueden requerir decenas de GiB más.
- GPU: no aplica el ecosistema CUDA (A100, H100, RTX 4090). El runtime usa GPU de Apple Silicon de forma secuencial; no se reclama ejecución en Neural Engine.
- Despliegue: exclusivamente mediante el `runtime-source` incluido, compilado con `swift build --product llm-runner`. No es compatible con vLLM, llama.cpp, Ollama, TGI, MLX ni Transformers. El runner debe ser el snapshot incluido, no una versión upstream sin modificar, porque el modelo requiere cachés deslizantes de lectura-antes-de-escritura.
- Latencia y throughput: ver tabla de benchmarks. A 8K la generación es de 16,0 tokens/s; a 262.000 tokens cae a 4,1 tokens/s y el procesamiento del prompt a 238,2 tokens/s.
- iPhone/iPad y sistemas con menos memoria no han sido probados. No se ha probado una instalación en máquina limpia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| Gemma 4 12B Instruct Core AI FP16 256K Text (este) | 12B | 262.144 | Core AI `.aimodel` | Apache 2.0 | Apple Silicon (Core AI) | Solo texto; tool calling no validado; runtime Swift incluido |
| `google/gemma-4-12B-it` (original) | 12B | no disponible en esta ficha | safetensors (BF16) | Apache 2.0 / licencia Gemma 4 | Multiplataforma (Transformers, vLLM, etc.) | Modelo fuente; multimodal ("Unified") según la model card |
| Bundle anterior 4K FP16 del mismo autor | 12B | 4K (según model card) | Core AI `.aimodel` | Apache 2.0 | Apple Silicon | Único bundle con round-trip de herramientas medido con éxito |
| Conversión 4-bit experimental (no publicada) | 12B | n/a | Core AI | Apache 2.0 | Apple Silicon | Falló la puerta de calidad numérica; no incluida |

No se dispone de datos de benchmarks comparativos con otros modelos de 12B en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: no admite imagen, audio ni vídeo; los componentes multimodales del modelo fuente no están incluidos.
- Tool calling no validado: el parsing nativo de herramientas está en el runtime, pero el round-trip exitoso solo se midió con el bundle anterior de 4K. La model card advierte que no se debe tratar argumentos válidos como autorización segura para ejecutar una herramienta.
- Contexto largo no validado en calidad: la prueba de 262.000 tokens es un único caso sintético de recuperación. `full_context_validated: false` se mantiene deliberadamente en `source.json`. No hay evaluación amplia de razonamiento, multilingüismo, seguridad, velocidad sostenida, concurrencia ni memoria baja.
- Fidelidad numérica limitada: la coincidencia de tokens con la referencia FP16 de Google se verificó a 8K; los logits de Google no se recalcularon a longitudes mayores. La comprobación de máscara compilada pasó 45 casos hasta el límite de 262.144, pero no es una prueba de generación exacta en el límite.
- Restricciones de plataforma: requiere Apple Silicon, macOS 27.0+ y Xcode 27.0+. No hay soporte para CUDA, ROCm ni CPU x86. Instalación en máquina limpia no probada.
- Consumo de recursos: la especialización inicial puede consumir decenas de GiB de disco; el RSS llega a 50-64 GiB en contexto largo. No hay mínimo de RAM establecido.
- Formato propietario: los pesos no son portables a otros runtimes (no son safetensors, GGUF, MLX ni Core ML). Mantener el layout del repositorio (`metadata.json`, `.aimodel`, `tokenizer/`) es obligatorio.
- Salida cruda: el output de sesión puede retener marcadores de canal; la limpieza de presentación y de "thinking" no está establecida.
- Fallo conocido: desactivar `COREAI_DIAGNOSTIC_DISABLE_FREQUENT_RESHAPES` provoca fallos de compilador/Metal en este SDK. La especialización directa en Python de Core AI falló previamente por un error del compilador del sistema operativo; la ruta soportada es Swift.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación en la información disponible. La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia Gemma 4 enlazada por el autor para el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikedoise/gemma-4-12B-it-coreai-fp16-256k-text
- Checkpoint original de Google: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio base del runtime (Apple coreai-models): https://github.com/apple/coreai-models (commit referenciado `22b0eaac4b325b812605a5096acff4880f1c4a36`)
- Mediciones de validación: `provenance/validation-summary.json` dentro del repositorio del modelo
