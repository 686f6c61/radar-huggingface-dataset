# coder543/moss-tts-nano-100m-glade

## Resumen

MOSS-TTS Nano 100M para Glade es una conversión al runtime Core AI de Apple del modelo de síntesis de voz MOSS-TTS Nano 100M, desarrollado originalmente por OpenMOSS-Team. El autor de la conversión es coder543, que empaqueta el modelo junto con su tokenizador de audio (MOSS-Audio-Tokenizer-Nano) en un bundle nativo en Swift para ejecutarse sobre Apple Silicon, con descarga de trabajo en la Neural Engine (ANE). El modelo resuelve el problema de desplegar TTS de calidad en dispositivos Apple sin depender de Python ni de GPUs dedicadas, con un tamaño de runtime de 322,4 MB.

La arquitectura combina un transformer autorregresivo global de doce capas y 768 dimensiones con un transformer local de una capa que se ejecuta diecisiete veces por cada trama de 80 ms, más un decodificador de forma de onda causal en estéreo a 48 kHz. El modelo base tiene 100M de parámetros y cubre 20 idiomas en un único bundle, con detección automática de idioma a partir del texto de entrada.

Su relevancia actual radica en que demuestra inferencia TTS completamente en dispositivo (iPhone 15 Pro Max y MacBook Air M3) con tasas de tiempo real superiores a 2×, sin cuantización entera adicional y con errores numéricos relativos por debajo del 0,35% frente al cómputo FP32 de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo global (12 capas, 768 dim) + transformer local (1 capa, 17 pasos por trama de 80 ms) + decodificador de forma de onda causal estéreo 48 kHz |
| Parámetros totales | 100M (modelo base MOSS-TTS-Nano-100M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 posiciones de caché; unidades de entrada de hasta 75 tokens SentencePiece; techo de generación de 375 tramas (30 s) por unidad |
| Tipos de cuantización | Sin cuantización entera adicional: BF16 original representado en FP16, codec en FP16, embeddings y cabezas atadas en FP32 |
| Idiomas soportados | zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr (20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle Core AI (`.aimodel`) con `tokenizer.json`, `embeddings.json`, `embeddings.f32` y `metadata.json`; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo es un TTS autorregresivo de dos niveles. Un transformer global de doce capas y anchura 768 procesa el contexto de texto y genera representaciones latentes; un transformer local de una sola capa se ejecuta diecisiete veces por cada trama de audio de 80 ms para refinar la secuencia. La salida pasa por un decodificador de forma de onda causal que produce audio estéreo a 48 kHz. El pipeline incluye el vocabulario SentencePiece BPE original y un mapa de normalización de texto compilado, y la planificación de entrada divide el texto en unidades de como máximo 75 tokens con un caché de 1.024 posiciones.

La conversión a Core AI no aplica cuantización entera: los valores BF16 originales se representan en FP16, los transformadores del codec usan FP16 y los embeddings, cabezas de salida atadas y matrices de frontera del codec mantienen almacenamiento FP32. Para preservar la fidelidad numérica se reordenan las filas de atención y se acortan las reducciones balanceadas, y el LayerNorm global se reescala algebraicamente para evitar desbordamiento de varianza en FP16 manteniendo el épsilon efectivo original. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Síntesis de voz texto-a-habla en 20 idiomas con detección automática del idioma a partir del texto.
- Generación autorregresiva global y local con decodificación causal, apta para streaming.
- Salida de audio estéreo a 48 kHz mediante decodificador de forma de onda causal.
- Streaming online con paquetes de codec de hasta 1,28 segundos y primer paquete entregado a los 553 ms en Mac.
- Modo offline por unidades completas y modo por fases que libera funciones Core AI entre unidades.
- Importación opcional de audio de referencia mediante `MOSSNanoVoiceEncoder` (mono o estéreo, entre 80 ms y 20 s, remuestreo a 48 kHz, sin transcripción ni normalización de sonoridad).
- Alineación opcional de palabras a partir del idioma declarado en la petición.
- Ejecución completa en Neural Engine (ANE) con la CPU a cargo de texto, muestreo, cabezas atadas y proyecciones de frontera.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá del codificador de referencia opcional.

## Casos de uso

- Síntesis de voz en aplicaciones iOS y macOS: el bundle de 322,4 MB se integra vía el framework Glade en Swift y ejecuta toda la inferencia en la Neural Engine, sin servidores ni GPUs dedicadas, lo que permite TTS offline en el dispositivo.
- Lectura por voz de contenido largo: la planificación divide el texto en unidades de hasta 75 tokens sin descartar texto fuente, con techo de 30 segundos por unidad, adecuado para artículos, correos o documentación.
- Asistentes conversacionales con streaming: el modo online entrega paquetes de hasta 1,28 s y el primer paquete llega a los 553 ms en un MacBook Air M3, suficiente para iniciar la reproducción antes de completar la frase.
- Accesibilidad en dispositivos Apple: la huella de proceso en iPhone 15 Pro Max es de 0,83 GB en pico con modelos cacheados, lo que permite ejecutar TTS en segundo plano en un teléfono sin presión de memoria significativa.
- Localización multilingüe de productos: un único bundle cubre 20 idiomas con detección automática, útil para aplicaciones con audiencias en español, inglés, alemán, francés, japonés, árabe, coreano, ruso, portugués, entre otros.
- Clonación de voz ligera con referencia corta: el codificador opcional acepta entre 80 ms y 20 s de audio de referencia sin transcripción, y la condicionalización codificada puede cachearse, lo que sirve para voces personalizadas en prototipos.
- Generación de audiolibros o podcasts por lotes en Mac: con RTFx de 2,27× en modo offline sobre M3, un lote de audio puede procesarse en aproximadamente la mitad del tiempo de reproducción.

## Benchmarks y rendimiento

| Dispositivo | Modo | Audio generado | Procesamiento | RTFx |
|---|---|---:|---:|---:|
| M3 MacBook Air, 16 GB, macOS 27.0.1 | Offline | 5,76 s | 2,54 s | 2,27× |
| M3 MacBook Air, 16 GB, macOS 27.0.1 | Streaming | 5,76 s | 2,46 s | 2,34× |
| iPhone 15 Pro Max, iOS 27.0.1 | Offline, modelos cacheados | 5,76 s | 2,77 s | 2,08× |

Mediciones adicionales: primer paquete de audio de 1,28 s entregado a los 553 ms en Mac en streaming; primera preparación observada en el teléfono de 15,49 s y carga cacheada posterior de 0,36 s; huella de proceso pico de 0,83 GB en el teléfono. Instruments capturó las 1.321 llamadas de grafo en la ANE (4 de prefill global, 72 de decode global, 1.225 de decode local y 20 del codec de forma de onda), sin actividad en la GPU objetivo.

Comprobaciones numéricas frente a FP32: error RMS relativo del estado oculto global en ANE del 0,28%, máximo del 0,35% en las diecisiete posiciones locales cacheadas y del 2,03% en la forma de onda completa del codec; el codificador de referencia presenta un error relativo del 0,000524% con coincidencia de todos los códigos originales. Catorce casos multilingües y de normalización produjeron exactamente los mismos token IDs que el modelo original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que es un modelo TTS.

## Requisitos de hardware

- Inferencia en Apple Silicon exclusivamente: el bundle Core AI está pensado para Neural Engine y CPU; no se documenta soporte para CUDA, ROCm ni GPUs de sobremesa.
- VRAM: no aplica; la memoria unificada del sistema es la relevante. Huella de proceso pico observada de 0,83 GB en iPhone 15 Pro Max con modelos cacheados.
- Dispositivos probados: M3 MacBook Air de 16 GB con macOS 27.0.1 e iPhone 15 Pro Max con iOS 27.0.1.
- Almacenamiento: 322,4 MB (307,4 MiB) para el runtime; aproximadamente 41,8 MB adicionales si se incluye el codificador de referencia FP32 opcional.
- Despliegue: framework Glade en Swift (`MOSSNanoSynthesizer`, `MOSSNanoModelBundle`, `TTSSynthesisSession`); descarga con `hf download coder543/moss-tts-nano-100m-glade --exclude 'voice-encoder/*'`.
- Latencia y throughput: RTFx entre 2,08× y 2,34× según dispositivo y modo; primer paquete en 553 ms en Mac; preparación inicial de 15,49 s en teléfono y 0,36 s en carga cacheada.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI para este bundle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| MOSS-TTS Nano 100M (Glade) | 100M | 1.024 posiciones, unidades de 75 tokens | 20 | Apache 2.0 | Core AI / Swift en Apple Silicon |
| MOSS-TTS-Nano-100M (original) | 100M | no disponible | 20 | no disponible en la información | PyTorch (referencia FP32) |
| MOSS-Audio-Tokenizer-Nano | no disponible | no disponible | no disponible | no disponible en la información | Componente de codec de audio |

No se dispone de datos de benchmarks comparativos con otras alternativas TTS en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y vía de despliegue.

## Limitaciones y advertencias

- El bundle está atado al runtime Core AI y al framework Glade en Swift; no es portable a entornos Linux, Windows ni a GPUs NVIDIA o AMD.
- El muestreo es estocástico y los generadores aleatorios de Swift y PyTorch no garantizan audio idéntico para la misma semilla, lo que complica la reproducibilidad exacta.
- La comprobación de inteligibilidad se limita a un caso en inglés recuperado por Cohere desde el audio del teléfono; no constituye un benchmark general de calidad de voz ni una validación de los 20 idiomas.
- La primera preparación en iPhone tarda 15,49 s; la latencia percibida depende del cacheado del sistema operativo.
- El modo online solo admite un carril (one lane) y el modo por fases no intercambia etapas dentro de una unidad.
- El techo de generación es de 375 tramas (30 s) por unidad; los desbordamientos de generación reportan error en lugar de tratar el audio incompleto como completo.
- El codificador de referencia no normaliza la sonoridad y duplica mono a estéreo, lo que puede introducir desajustes de nivel en la condicionalización.
- No se documentan sesgos conocidos del modelo base ni evaluaciones de robustez multilingüe en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los modelos base originales de OpenMOSS-Team, no detallada aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/moss-tts-nano-100m-glade
- Modelo base TTS: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Tokenizador de audio base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Benchmark del bundle: https://huggingface.co/coder543/moss-tts-nano-100m-glade/blob/main/benchmark.json
