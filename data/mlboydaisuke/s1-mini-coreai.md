# mlboydaisuke/S1-mini-CoreAI

## Resumen

S1-mini es un modelo de lenguaje de 0,6 mil millones de parámetros desarrollado por Superwhisper, especializado en la normalización de texto procedente de sistemas de reconocimiento automático del habla (ASR). No es un modelo conversacional: recibe una transcripción cruda y devuelve texto escrito limpio, con muletillas eliminadas, correcciones resueltas, puntuación y mayúsculas aplicadas, y números, fechas, horas, divisas y direcciones de correo renderizados en su forma escrita. La variante aquí descrita, `mlboydaisuke/S1-mini-CoreAI`, es una conversión del modelo original al runtime Core AI de Apple (iOS 27 / macOS 27), sucesor de Core ML, empaquetada como bundle `.aimodel` para ejecución totalmente local en iPhone y Mac.

La relevancia de esta ficha radica en que cubre una pieza habitualmente ausente en los stacks de dictado on-device: Core AI ya dispone de motores ASR (Parakeet, Whisper, Qwen3-ASR, Nemotron-3.5-ASR-Streaming), pero carecía de un posprocesador que convierta una transcripción en texto que una persona enviaría realmente, sin que nada salga del dispositivo. El modelo se controla mediante una línea de control al inicio de la entrada, y su licencia añade a Apache-2.0 la obligación de mantener la atribución "S1-mini" por "Superwhisper" con esa capitalización exacta.

El bundle ocupa 759 MB (796 MB de descarga inicial) e incluye pesos con cuerpo int8 por bloques de 32 y cabeza fp16 ligada al embedding. Las mediciones publicadas por el autor reportan 268,4 tok/s de decodificación y 4161 tok/s de prefill en un M4 Max, y 62,4 tok/s de decodificación en un iPhone 17 Pro (A19 Pro), con coincidencia exacta de tokens frente al oráculo fp32 de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags del repo); bundle Core AI para motor pipelined |
| Parametros totales | 0,6B (600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como cifra oficial; el motor en iPhone limita prompt + generación a 1024 tokens, y la librería trocea entradas largas en fragmentos de ~450 tokens |
| Tipos de cuantizacion | Cuerpo int8 por bloques de 32; cabeza fp16 ligada al embedding |
| Idiomas soportados | Inglés (en) |
| Licencia | s1-mini-license (Apache-2.0 con cláusula de atribución obligatoria) |
| Formato de pesos | Bundle `.aimodel` de Core AI (`gpu-pipelined/s1_mini_decode_int8lin/`, 759 MB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su linaje Qwen3 (indicado en los tags del repositorio) y de su naturaleza transformer. El modelo base es `superwhisper/s1-mini`, y esta variante es una conversión cuantizada del mismo: los pesos se exportan mediante `coreai-torch` (para LLM, `coreai.llm.export`) a bundles `.aimodel` que se ejecutan en GPU o Neural Engine. La cuantización aplicada es int8 por bloques de 32 en el cuerpo del modelo, mientras que la cabeza permanece en fp16 por estar ligada al embedding.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable no está en el entrenamiento sino en el despliegue: el bundle corre sin cambios en macOS e iOS, sin compilación AOT, y el autor reporta equivalencia numérica exacta frente al oráculo fp32 de Hugging Face (16/16 tokens en M4 Max; 276/276 y 27/27 en iPhone 17 Pro frente al motor de Mac). El modelo se gobierna mediante una línea de control al inicio de la entrada, en lugar de un formato conversacional por turnos.

## Capacidades

- Normalización de transcripciones ASR: eliminación de muletillas, resolución de falsos arranques y autocorrecciones al término final elegido por el hablante.
- Puntuación y capitalización automáticas del texto transcrito.
- Normalización inversa de texto: números, fechas, horas, divisas y direcciones de correo en forma escrita.
- Truecasing (asignación de mayúsculas correctas a nombres propios y entidades).
- Control mediante línea de control al inicio de la entrada, con tres ejes de control expuestos como selectores en el runner Tidy.
- Procesamiento por fragmentos: entradas largas se cortan en límites de palabra en trozos de ~450 tokens y las reescrituras se cosen.
- Entrada compuesta solo por muletillas devuelve cadena vacía.
- Ejecución totalmente on-device en iPhone y Mac mediante Core AI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de forma nativa: es un posprocesador de un solo trabajo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Dictado en aplicaciones de mensajería: el modelo recibe la transcripción cruda del ASR y devuelve texto listo para enviar, con puntuación y números en forma escrita, sin que el contenido salga del dispositivo.
- Posprocesado en pipelines de notas de voz: integrado tras un motor ASR de Core AI (Whisper, Parakeet, Qwen3-ASR), convierte transcripciones de grabaciones en texto legible para almacenamiento local.
- Transcripción de reuniones en Mac: la librería trocea entradas largas en fragmentos de ~450 tokens y cose las reescrituras, permitiendo procesar actas completas pese al límite de 1024 tokens del motor en iPhone.
- Asistentes de accesibilidad: normalización de entrada por voz para usuarios que dictan, con resolución de autocorrecciones ("no, espera, mejor el jueves") que los ASR crudos dejan sin resolver.
- Automatización headless en macOS: el CLI `tidy-cli` permite procesar transcripciones en scripts y agentes sin interfaz gráfica, útil para lotes de dictados o pruebas de regresión.
- Aplicaciones de correo y calendario por voz: renderizado de direcciones de correo, fechas y horas en forma escrita facilita el parseo posterior y reduce errores de formato.
- Procesamiento por lotes de transcripciones históricas: mantener cargado el `KitTextNormalizer` y llamar a `normalize(_:)` por transcripción evita repetir la carga de 796 MB.

## Benchmarks y rendimiento

| Plataforma | Decodificación | Prefill | Exactitud numérica |
|---|---:|---:|---|
| M4 Max (Mac Studio, macOS 27.0) | 268,4 tok/s | 4161 tok/s | 16/16 tokens exactos vs oráculo fp32 HF |
| iPhone 17 Pro (A19 Pro, Release) | 62,4 tok/s | 69,0 tok/s | 276/276 + 27/27 tokens exactos vs motor de Mac |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: bundle de 759 MB; descarga inicial de ~796 MB tanto en Mac como en iPhone.
- GPU recomendadas: Apple Silicon (M4 Max medido); iPhone 17 Pro con A19 Pro medido. Ejecuta en GPU o Neural Engine vía Core AI.
- No requiere GPU NVIDIA; no aplica a A100, H100 ni RTX 4090, al ser un runtime exclusivo de Apple.
- Cabe en dispositivos consumer Apple: iPhone y Mac con iOS 27 / macOS 27.
- Despliegue: Core AI con `coreai-torch`; integración vía Swift Package Manager con CoreAIKit 0.8.0 (producto `CoreAIKit`), ejemplo Tidy (GUI + CLI) y API de una línea `CoreAI.tidyTranscript(rawTranscript)`.
- Requisitos de build: Xcode 27.0.0 RC con build 27A266a (según `.xcode-pin`); medir en Release, ya que Debug es ~3× más lento en trabajo de host por token.
- Límite del motor en iPhone: prompt + generación acotados a 1024 tokens.
- Latencia y throughput: ver tabla de benchmarks; 62,4 tok/s de decodificación en iPhone 17 Pro y 268,4 tok/s en M4 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-mini (esta variante, Core AI) | 0,6B | No disponible (límite motor 1024 tokens en iPhone) | Normalización de transcripciones ASR | s1-mini-license (atribución obligatoria) | Hugging Face, Core AI |
| superwhisper/s1-mini (original) | 0,6B | No disponible | Normalización de transcripciones ASR | s1-mini-license | Hugging Face |
| Qwen3-0.6B (referencia del kit) | 0,6B | No disponible en la información | Generación de texto general | No disponible en la información | Core AI vía CoreAIKit |
| Qwen3-8B 4-bit (referencia de runtime) | 8B | No disponible en la información | Generación de texto general | No disponible en la información | Core AI (94 tok/s en M4 Max GPU) |

La comparación relevante es frente al modelo base original: esta variante es una conversión cuantizada a Core AI del mismo S1-mini, con idéntica función pero formato `.aimodel` y cuantización int8 por bloques. No se dispone de datos de benchmarks comparativos entre ambos.

## Limitaciones y advertencias

- Solo inglés: no procesa otros idiomas.
- No es un modelo conversacional ni de propósito general; no soporta tool calling, agentes, visión ni audio.
- Límite de contexto efectivo en iPhone de 1024 tokens (prompt + generación); entradas más largas deben trocearse, con riesgo de perder coherencia en las costuras.
- Restricción de licencia: cualquier uso, distribución o integración en producto debe identificar el modelo como "S1-mini" por "Superwhisper", con esa capitalización exacta, independientemente del nombre del producto circundante.
- Riesgo de alucinación inherente a un modelo generativo de 0,6B: puede introducir o alterar contenido al normalizar, especialmente en pasajes ambiguos.
- Sesgos conocidos: no documentados en la información disponible.
- Dependencia de plataforma: exclusivo de Apple Core AI (iOS 27 / macOS 27); no ejecutable en Linux, Windows ni GPU NVIDIA.
- Requiere Xcode 27.0.0 RC con build específico; versiones distintas pueden romper el build.
- El rendimiento en Debug es ~3× más lento; debe medirse siempre en Release.
- Sin fila en el leaderboard DeviceMark, por lo que no hay comparación independiente publicada.
- El repositorio tiene 0 likes y 820 descargas, lo que sugiere adopción temprana y validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/S1-mini-CoreAI
- Modelo base: https://huggingface.co/superwhisper/s1-mini
- Licencia: https://huggingface.co/mlboydaisuke/S1-mini-CoreAI/blob/main/LICENSE
- CoreAIKit: https://github.com/john-rocky/coreai-kit#readme
- CoreAIKit 0.8.0: https://github.com/john-rocky/coreai-kit/tree/0.8.0
- ChatDemo: https://github.com/john-rocky/coreai-kit/tree/0.8.0/Examples/ChatDemo
- Runner Tidy: https://github.com/john-rocky/coreai-kit/tree/0.8.0/Examples/Tidy
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/0.8.0/Examples/Tidy/Sources/QuickStart.swift
- Cookbook: https://github.com/john-rocky/coreai-kit/blob/0.8.0/docs/COOKBOOK.md
- Apple Silicon LLM Bench: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark: https://devicemark.github.io/
