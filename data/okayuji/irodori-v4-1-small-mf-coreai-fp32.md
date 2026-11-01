# okayuji/irodori-v4.1-small-mf-coreai-fp32

## Resumen

Irodori Small MF para Core AI es una conversión del modelo de síntesis de voz japonés Irodori-TTS-v4.1-Small-MF (de Aratako) al formato Core AI de Apple, orientada a inferencia local en dispositivos Apple con macOS 27 o iOS 27. El modelo genera voz sintética en japonés a partir de texto y, opcionalmente, de una grabación de referencia para clonación de voz. La conversión la publica el usuario okayuji (oka-yuji) y se distribuye en FP32 con un peso total de 3,84 GB repartidos en 20 archivos.

El pipeline combina un codificador de texto basado en ModernBERT japonés (sbintuitions/modernbert-ja-310m), un codificador de audio de referencia, un codificador de hablante, un predictor de duración condicionado, un DiT condicionado y un decodificador de códec sobre un VAE semántico (Semantic-DACVAE-Japanese-32dim). La generación usa cuatro pasos de MeanFlow y produce WAV mono a 48 kHz en Float32.

Es relevante porque ejemplifica el despliegue on-device de TTS con clonación de voz en el ecosistema Apple mediante el runtime Swift `SpeechRuntime`, sin depender de servicios en la nube. No obstante, es una conversión experimental con diferencias conocidas de fidelidad de forma de onda, sin soporte de streaming y limitada a iOS 27/macOS 27.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS modular: text encoder (ModernBERT-ja-310m), reference-audio encoder, speaker encoder, conditioned duration predictor, conditioned DiT, codec decoder; generación con MeanFlow (4 pasos) |
| Parametros totales | no disponible (peso del payload: 3.835.379.527 bytes, 3,84 GB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; límite de entrada de texto: 255 tokens de cuerpo |
| Tipos de cuantizacion | FP32 (única variante publicada en este repo) |
| Idiomas soportados | japonés (ja) |
| Licencia | other (upstream-mit-and-apache-2.0; ver LICENSE) |
| Formato de pesos | Core AI (assets propietarios del runtime, `irodori.json` identificador `irodori-coreai-v2`); no safetensors/GGUF |

## Arquitectura y entrenamiento

La arquitectura es un pipeline TTS en cascada de seis componentes: codificador de texto, codificador de audio de referencia, codificador de hablante, predictor de duración condicionado, DiT condicionado y decodificador de códec. El codificador de texto se apoya en ModernBERT japonés de 310M parámetros; el VAE semántico es Semantic-DACVAE-Japanese-32dim. La síntesis se realiza con cuatro pasos de MeanFlow, lo que reduce el coste de muestreo frente a difusión iterativa convencional.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. La conversión a Core AI se realizó con la API de autoría de Core AI, eliminando ubicaciones de depuración del código fuente y verificando que el MLIR genérico (incluidas constantes y recursos) coincidía antes y después del stripping. El runtime nativo desactiva la especialización de reshape frecuente para el codificador de audio, el codificador de hablante y la duración condicionada; el DiT mantiene su política existente y el decodificador de códec en iOS también la desactiva para evitar una aserción de asignación dinámica.

## Capacidades

- Síntesis de voz (TTS) en japonés a partir de texto.
- Clonación de voz opcional mediante referencia de audio de 48 kHz mono Float32, entre 0,5 y 30 segundos.
- Generación determinista con semilla (seed); la misma referencia repetida produce WAV idénticos.
- Salida WAV mono a 48 kHz Float32, sin recorte de cola ni marca de agua añadida.
- Ejecución on-device en Apple silicon mediante el runtime Swift `SpeechRuntime`.
- No soporta streaming de voz.
- No soporta tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- Sin capacidades de visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Síntesis de voz para aplicaciones iOS nativas: integración mediante `SpeechRuntime` en Swift para generar locuciones japonesas en el dispositivo, sin llamadas a servicios externos y con la privacidad que ello implica.
- Clonación de voz para audiolibros o contenido personal: el modelo acepta una grabación de referencia de 0,5 a 30 segundos y genera voz sintética con ese timbre, útil para narración de textos largos divididos en fragmentos de hasta 255 tokens.
- Accesibilidad: lectura en voz alta de contenido japonés en apps para personas con discapacidad visual, ejecutándose localmente en iPhone con iOS 27.
- Prototipado de asistentes conversacionales japoneses: generación de respuestas habladas en un asistente local, combinando el TTS con un LLM on-device (el TTS en sí no gestiona el diálogo).
- Pruebas de integración de Core AI: el repositorio sirve como referencia para evaluar el rendimiento del runtime Core AI con modelos de audio en Apple silicon (M4 Max documentado).
- Generación de voces sintéticas para demos y material de formación: el ejemplo incluido produce 5,48 segundos de audio a partir de un texto japonés con seed 1708, sin referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a un modelo TTS.

Datos de verificación y rendimiento reportados por el autor:

| Prueba | Resultado |
|---|---|
| Chequeo end-to-end Python (NRMSE, umbral 0,001) con referencia de 0,5 s | 0,00072797 (pasa) |
| Chequeo end-to-end Python con referencia de ~8,26 s | 0,00171340 (no pasa; coseno 0,99999853, 114 frames coincidentes) |
| Generación con referencia (assets v2 originales, M4 Max, macOS 27.0, Xcode 27.0) | 1,276 s de intervalo de generación (observación única, seed 1708) |
| Ejemplo sin referencia incluido | 5,48 s de audio generado |
| Chequeo con referencia sintética (~3,86 s) | 4,00 s de salida |
| Igualdad de WAV con referencia repetida | idénticos |

El intervalo de generación excluye verificación de carpeta, normalización/tokenización de texto y decodificación/remuestreo de audio. No es una promesa de rendimiento ni una comparación de velocidad con esta release.

## Requisitos de hardware

- Peso del payload: 3,84 GB (20 archivos); el tamaño de archivo no equivale al requisito de memoria de trabajo, que no se especifica.
- Plataforma: Apple silicon con macOS 27 o iPhone físico con iOS 27. No funciona en iOS 26 ni en el simulador.
- GPU/SoC: probado en M4 Max; no se documentan otros dispositivos.
- No cabe en GPUs consumer tipo RTX 4090 en el sentido habitual: el runtime es específico de Apple (Core AI) y no se distribuyen pesos en formatos GGUF/safetensors para llama.cpp, vLLM, TGI u Ollama.
- Despliegue: app de ejemplo Core AI y runtime Swift `SpeechRuntime` del repositorio oka-yuji/coreai-samples; requiere Xcode 27 y Rust/Cargo para compilar la librería nativa de entradas (`Tools/Irodori/build-inputs.sh`).
- Latencia: 1,276 s de intervalo de generación registrado con los assets v2 en M4 Max (observación única); sin datos de throughput más allá de una petición a la vez.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos TTS comparables (parámetros, contexto, benchmarks o licencia) que permitan una comparación rigurosa. El propio autor indica que la observación de latencia no es una comparación de velocidad con esta release.

## Limitaciones y advertencias

- Conversión experimental con diferencias conocidas de fidelidad de forma de onda; el fallo del chequeo NRMSE con referencia de ~8,26 s sigue sin resolver.
- No soporta streaming de voz.
- Solo japonés; entrada de texto limitada a 255 tokens de cuerpo.
- Solo FP32; no hay variantes cuantizadas publicadas en este repositorio.
- Requiere macOS 27 o iOS 27; no funciona en iOS 26 ni en el simulador.
- Ejecución de una petición a la vez en las pruebas; no se documenta concurrencia.
- El fallo histórico de duraciones distintas tras cambiar de modo de voz con ejecución all-EFR se conserva en el registro del runtime.
- Riesgo de uso indebido de clonación de voz: el modelo acepta grabaciones de referencia; es responsabilidad del usuario disponer de permiso para usar el audio.
- Licencia "other" con componentes upstream MIT y Apache 2.0; conviene revisar el archivo LICENSE antes de uso comercial.
- Sesgos y riesgo de alucinación no documentados en la información disponible (no aplica el concepto de alucinación textual, pero sí posibles artefactos de audio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/okayuji/irodori-v4.1-small-mf-coreai-fp32
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- VAE semántico: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Codificador de texto: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Repositorio de ejemplos Core AI: https://github.com/oka-yuji/coreai-samples
- Guía iPhone: https://github.com/oka-yuji/coreai-samples/blob/main/docs/irodori/iphone.md
- Guía del runtime: https://github.com/oka-yuji/coreai-samples/blob/main/docs/irodori/reference-runtime.md
- Registro de verificación de la release: https://github.com/oka-yuji/coreai-samples/blob/main/docs/irodori/release-asset-validation.json
- Ejemplo de audio: https://huggingface.co/okayuji/irodori-v4.1-small-mf-coreai-fp32/resolve/main/samples/text-only.wav
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
