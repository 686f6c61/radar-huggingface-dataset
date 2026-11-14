# Muno459/fastconformer-quran-coreml-streaming

## Resumen

FastConformer-Quran-CoreML-Streaming es una conversión a Core ML del modelo `Muno459/fastconformer-quran-streaming`, un sistema de reconocimiento automático del habla (ASR) especializado en recitación coránica en árabe. Lo desarrolla el usuario Muno459 y su objetivo es ejecutar reconocimiento de voz en streaming directamente en dispositivos Apple (iPhone, iPad, Mac) aprovechando el Neural Engine (ANE) y la GPU, sin depender de la nube. La relevancia actual radica en la demanda de aplicaciones de recitación coránica que funcionen offline, con baja latencia y privacidad total, algo que un modelo en la nube no garantiza.

Arquitectura: FastConformer (una variante de Conformer optimizada para velocidad de entrenamiento e inferencia) con mecanismo *cache-aware streaming*, lo que permite procesar audio de forma incremental en lugar de exigir la frase completa. El modelo base se distribuye en formato Core ML (`.mlpackage`), con un tamaño de repositorio de 0,4 GB, lo que sugiere pesos cuantizados o comprimidos para despliegue en dispositivo.

El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face. La licencia es `npl-1.0` (no estándar, conviene revisarla antes de uso comercial). El modelo solo soporta árabe y está entrenado específicamente sobre corpus de recitación coránica (Tarteel EveryAyah, TLOG y Muaalem anotado), por lo que su dominio de aplicación es muy concreto y no debe confundirse con un ASR árabe generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cache-aware streaming (conversión Core ML del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks, no ventana fija documentada) |
| Tipos de cuantizacion | no disponible (el repo pesa 0,4 GB, lo que sugiere pesos comprimidos/cuantizados, pero no se especifica el esquema) |
| Idiomas soportados | árabe (recitación coránica) |
| Licencia | npl-1.0 (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | Core ML (`.mlpackage`) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer, una variante de Conformer que reduce el coste computacional mediante downsampling en las capas de atención y convolución, manteniendo la combinación de autoatención global y convoluciones locales típica de Conformer. La conversión a Core ML preserva la lógica de streaming *cache-aware*: el modelo mantiene cachés de atención y convolución entre chunks de audio, de modo que puede transcribir en tiempo real con un buffer limitado en lugar de requerir la secuencia completa.

Los datos de entrenamiento, según los tags del repositorio, incluyen `tarteel-ai/everyayah`, `tarteel-ai/tlog` y `obadx/muaalem-annotated-v3`, todos ellos corpus de recitación coránica con anotaciones a nivel de fonema/letra. No se dispone de información sobre el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicable habitualmente en ASR). La innovación técnica principal es la propia conversión a Core ML con soporte de streaming y ejecución en ANE, algo poco común en modelos ASR de código abierto.

## Capacidades

- Reconocimiento automático del habla en árabe, especializado en recitación coránica (tajwid, pronunciación quránica).
- Transcripción en streaming con latencia baja, adecuada para aplicaciones de seguimiento en vivo de la recitación.
- Ejecución on-device en Apple Silicon (ANE/GPU), sin conexión a internet.
- Salida a nivel de texto (y presumiblemente de fonemas/letras, dado el corpus de entrenamiento), aunque el formato exacto de salida no está documentado en la información disponible.
- No soporta tool calling ni function calling (es un modelo ASR puro).
- No soporta agentes ni razonamiento multi-step.
- Capacidad multilingüe limitada al árabe; no cubre otros idiomas.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Aplicaciones móviles de recitación coránica con seguimiento en vivo: el modelo transcribe la recitación del usuario en streaming y permite comparar con el texto esperado, señalando errores de pronunciación o saltos. La ejecución on-device garantiza privacidad y funcionamiento sin red.
- Corrección de tajwid en tiempo real: al procesar chunks de audio con caches, la app puede resaltar en pantalla la letra o palabra que se está recitando y detectar desviaciones.
- Memorización (hifz) asistida: el estudiante recita y el modelo verifica la secuencia; la latencia baja permite feedback inmediato sin esperar a la frase completa.
- Modo offline en mezquitas o entornos sin conectividad: al ejecutarse en ANE, no requiere servidores ni cuotas de API, lo que facilita su uso en dispositivos de gama media.
- Transcripción de sesiones de recitación para archivo o revisión posterior: el streaming permite guardar transcripciones alineadas temporalmente con el audio.
- Investigación en ASR árabe especializado: sirve como baseline reproducible en Core ML para comparar técnicas de streaming cache-aware frente a modelos no streaming.
- Integración en apps de educación islámica para iOS/macOS: el formato Core ML se integra de forma nativa en Xcode y Swift, reduciendo el trabajo de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Ejecución prevista en dispositivos Apple con Neural Engine (iPhone con A12 o posterior, iPad, Mac con Apple Silicon).
- VRAM/RAM estimada: el repositorio pesa 0,4 GB, por lo que la huella en memoria debería ser del orden de cientos de MB, aunque no se detalla el consumo exacto en runtime.
- GPU recomendadas: no aplica en el sentido tradicional; el objetivo es ANE/GPU integrada de Apple. No se documenta soporte para A100, H100 ni RTX 4090.
- No cabe en GPU consumer NVIDIA por ser un formato Core ML; para esas plataformas habría que usar el modelo base (`Muno459/fastconformer-quran-streaming`) en otro runtime.
- Opciones de despliegue: Core ML (Xcode, Swift, `coremltools`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo ASR Core ML).
- Latencia y throughput: no disponibles; el diseño streaming sugiere latencia de chunk, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto/streaming | Licencia | Formato |
|---|---|---|---|---|---|
| Muno459/fastconformer-quran-coreml-streaming | FastConformer ASR | Árabe (Corán) | Streaming cache-aware | npl-1.0 (gated) | Core ML |
| Muno459/fastconformer-quran-streaming (base) | FastConformer ASR | Árabe (Corán) | Streaming cache-aware | no disponible | no disponible |
| Whisper (OpenAI) | Transformer encoder-decoder ASR | Multilingüe | No streaming nativo | MIT | safetensors, GGUF, Core ML (conversiones) |
| Muaalem / modelos Tarteel | ASR especializado en Corán | Árabe (Corán) | No disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos publicados para este modelo frente a las alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado sobre recitación coránica; su rendimiento en árabe conversacional general probablemente sea pobre y no está evaluado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Licencia `npl-1.0` no estándar: es imprescindible revisar los términos antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación en ASR: en pasajes con ruido, recitación rápida o pronunciación no estándar puede generar texto incorrecto o inventar palabras, especialmente con streaming y chunks cortos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de WER/CER en la información disponible.
- Solo árabe: no cubre otros idiomas ni variantes dialectales.
- Dependencia de Apple: el formato Core ML limita el despliegue a ecosistema Apple; para otras plataformas hay que recurrir al modelo base.
- Documentación escasa: no se detallan parámetros, esquema de cuantización, formato exacto de salida ni requisitos mínimos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/Muno459/fastconformer-quran-coreml-streaming
- Modelo base: https://huggingface.co/Muno459/fastconformer-quran-streaming
- Dataset Tarteel EveryAyah: https://huggingface.co/datasets/tarteel-ai/everyayah
- Dataset Tarteel TLOG: https://huggingface.co/datasets/tarteel-ai/tlog
- Dataset Muaalem anotado: https://huggingface.co/datasets/obadx/muaalem-annotated-v3
