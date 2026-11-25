# milliwattlabs/leokani-tts-1M

## Resumen

Leokani-tts 1M es un modelo de síntesis de voz (text-to-speech) de 1,1 millones de parámetros desarrollado por Milliwatt Labs, un laboratorio centrado en modelos de IA de muy baja huella computacional que puedan ejecutarse en CPU, sin GPU y sin centro de datos. Es la variante reducida de Leokani-tts 7M y comparte con ella la misma voz femenina de inglés americano, llamada Dala, generada a partir de habla sintética producida con Kokoro-82M. El modelo resuelve el problema de la síntesis de voz en dispositivos con recursos muy limitados: microcontroladores (ESP32-P4, ESP32-S3) y CPU lentas de un solo núcleo.

La relevancia del modelo está en su relación entre tamaño y calidad: con 4,6 MB en fp32 y 1,7 MB en int8, alcanza un WER del 0,35 % y un UTMOS de 2,96, cifras que lo sitúan por delante de alternativas mucho mayores en eficiencia por vatio. Está publicado en PyTorch y ONNX Runtime, con pesos en safetensors y ONNX, y salida de audio mono a 24 kHz.

La licencia es propia (milliwatt-labs-model-license), no estándar, por lo que su uso comercial requiere revisar los términos del fichero LICENSE-MILLIWATT-LABS.md del repositorio. El modelo solo soporta inglés y no se han publicado resultados de benchmarks estándar de razonamiento o código, al no ser ese su dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en Kokoro, detalles de capas no publicados) |
| Parametros totales | 1.137.914 (1,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 (ONNX) |
| Idiomas soportados | inglés (en) |
| Licencia | milliwatt-labs-model-license (licencia propia, "other") |
| Formato de pesos | safetensors (fp32, fp16), ONNX (fp32, fp16, int8) |
| Salida de audio | 24 kHz mono |
| Tamano en disco | 4,6 MB (fp32), 2,3 MB (fp16), 1,7 MB (int8 ONNX) |
| Frameworks | PyTorch, ONNX Runtime |
| Fonemizador | espeak-ng (por defecto) o Leokani G2P (incluido) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna (número de capas, tipo de atención, decoder vocacional) más allá de que deriva del diseño de Kokoro y de que la variante de 7M es la versión completa de la misma voz. El modelo se entrenó sobre habla sintética generada con Kokoro-82M, es decir, destilación de datos de audio en lugar de un corpus humano grabado, lo que explica su reducido tamaño y su consistencia de voz.

El pipeline de inferencia convierte texto a fonemas mediante espeak-ng o el fonemizador propio Leokani G2P (compatible con espeak-ng, incluido en el repositorio bajo `g2p/`) y después genera audio a 24 kHz. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO; esos datos no están disponibles. La innovación técnica principal es la compresión extrema del modelo manteniendo inteligibilidad: 1,1 M de parámetros con WER del 0,35 %, y la inclusión de un fonemizador propio para eliminar la dependencia externa de espeak-ng (GPL-3.0).

## Capacidades

- Síntesis de voz en inglés americano con una única voz femenina (Dala).
- Control de velocidad de habla mediante el parámetro `--speed` (por ejemplo, 0,85 para habla más lenta).
- Conversión de texto a fonemas con espeak-ng o con Leokani G2P, sin dependencias externas en el segundo caso.
- Aceptación directa de fonemas en estilo Kokoro mediante `--phonemes`.
- Inferencia en CPU de un solo hilo, con soporte de PyTorch y ONNX Runtime.
- Cuantización a fp16 e int8 para reducir el tamaño de los pesos.
- Pronunciación de fechas, horas, unidades, cifras y nombres propios (según los ejemplos publicados en la model card).
- Ejecución en microcontroladores ESP32-P4 y ESP32-S3 (soporte indicado, rendimiento aún no medido).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en microcontroladores: el modelo cabe en 1,7 MB en int8 y está pensado para ESP32-P4 y ESP32-S3, lo que permite dotar de voz a dispositivos domóticos o wearables sin conexión a la nube.
- Lectura de notificaciones y alertas en sistemas embebidos: con 77 ms hasta la primera locución en un núcleo Arm Cortex-A725 a 2,8 GHz, es adecuado para avisos que deben sonar de inmediato.
- Interfaces de accesibilidad en hardware de bajo coste: la síntesis local en CPU evita depender de servicios externos y protege la privacidad del texto leído.
- Automatización del hogar (Home Assistant, Raspberry Pi): la familia Leokani incluye aplicaciones para Raspberry Pi y Home Assistant, y esta variante de 1M permite anuncios de voz en dispositivos con CPU modesta.
- Prototipado y pruebas de pipelines TTS: al ser un modelo de 4,6 MB con scripts de inferencia simples (`leokani.py`, `leokani_onnx.py`), sirve para validar integraciones de audio antes de pasar a la variante de 7M.
- Generación de audio para aplicaciones de escritorio y navegador: la variante de 7M ofrece apps para Mac, iPhone, Android, Linux y navegador; la de 1M puede usarse como alternativa ultraligera en esos mismos entornos cuando el espacio es crítico.
- Sistemas de respuesta por voz con latencia estricta: 57× de velocidad en un solo núcleo Arm (segundos de habla por segundo de cómputo) permite generar frases cortas en tiempo real en hardware de gama baja.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (PyTorch, un solo hilo):

| Modelo | Parametros | Tamano | Velocidad, 1 nucleo Arm | Primera locucion, 1 nucleo Arm | WER | UTMOS |
|---|---:|---:|---:|---:|---:|---:|
| Leokani-tts 1M | 1,1 M | 4,6 MB | 57× | 77 ms | 0,35 % | 2,96 |
| Leokani-tts 500K | 0,52 M | 2,1 MB | 67× | 62 ms | 0,55 % | 1,88 |
| Leokani-tts 4.5M | 4,3 M | 17 MB | 38× | 128 ms | 0,07 % | 3,56 |
| Leokani-tts 7M | 7,0 M | 28 MB | 27× | 181 ms | 0,07 % | 3,61 |
| KittenTTS nano 0.8 | 14,0 M | 60 MB | 3,6× | 1,7 s | 0,41 % | 2,18 |
| Piper (en_US lessac medium) | 15,7 M | 63 MB | 5,6× | 710 ms | 0,90 % | 3,77 |
| Kokoro-82M | 82 M | 328 MB | 0,48× | 11 s | 0,35 % | 3,76 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje general.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para CPU. En fp32 ocupa 4,6 MB de pesos, en fp16 2,3 MB y en int8 1,7 MB, por lo que la memoria necesaria es negligible frente a cualquier GPU consumer.
- GPU recomendadas: no aplica; no se documenta soporte ni ventaja de ejecución en GPU (A100, H100, RTX 4090). El autor posiciona el modelo explícitamente para CPU y microcontroladores.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; también en ESP32-P4 y ESP32-S3 (rendimiento en estos aún no medido).
- Despliegue: PyTorch (script `leokani.py`), ONNX Runtime (`leokani_onnx.py`), y aplicaciones de la familia Leokani para Mac, iPhone, Android, Linux, Raspberry Pi, Home Assistant y navegador (estas apps se documentan para la variante de 7M).
- Latencia y throughput: 57× de velocidad y 77 ms hasta la primera locución en un núcleo Arm Cortex-A725 a 2,8 GHz; 67× y 62 ms para la variante de 500K. La versión ONNX es ligeramente más rápida que PyTorch en el mismo núcleo Arm.
- Dependencias: espeak-ng (GPL-3.0, no incluido) o Leokani G2P (incluido en el repositorio); `torch` y `safetensors` para la ruta PyTorch, `onnxruntime` para la ruta ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Velocidad (1 nucleo Arm) | WER | UTMOS | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Leokani-tts 1M | 1,1 M | 4,6 MB | 57× | 0,35 % | 2,96 | milliwatt-labs-model-license |
| Leokani-tts 7M | 7,0 M | 28 MB | 27× | 0,07 % | 3,61 | milliwatt-labs-model-license |
| KittenTTS nano 0.8 | 14,0 M | 60 MB | 3,6× | 0,41 % | 2,18 | no disponible |
| Piper (en_US lessac medium) | 15,7 M | 63 MB | 5,6× | 0,90 % | 3,77 | no disponible |
| Kokoro-82M | 82 M | 328 MB | 0,48× | 0,35 % | 3,76 | no disponible |

Frente a Piper y Kokoro, Leokani-tts 1M es entre 10 y 100 veces más rápido en un solo núcleo Arm, a costa de un UTMOS inferior (2,96 frente a 3,77 y 3,76). Frente a KittenTTS nano 0.8, ofrece mejor WER, mejor UTMOS y un orden de magnitud más de velocidad con la mitad de parámetros.

## Limitaciones y advertencias

- Una sola voz (femenina, inglés americano, Dala): no hay selección de hablante ni otros idiomas.
- El autor reconoce un eco corto en algunas palabras, audible en ciertos samples.
- Calidad de voz inferior a modelos mayores: UTMOS 2,96 frente a 3,61 de la variante de 7M y 3,76 de Kokoro-82M.
- Riesgo de pronunciación incorrecta en nombres propios, siglas o términos fuera del dominio de entrenamiento; el fonemizador es determinante en la calidad final.
- Al entrenarse con habla sintética de Kokoro-82M, puede heredar artefactos y sesgos acústicos de ese modelo.
- Licencia propia no estándar: es imprescindible revisar LICENSE-MILLIWATT-LABS.md antes de cualquier uso comercial; no es una licencia open source reconocida (Apache, MIT, etc.).
- espeak-ng es una dependencia separada bajo GPL-3.0 y no se incluye en el repositorio; su uso puede condicionar la distribución del producto final.
- Rendimiento en ESP32-P4 y ESP32-S3 no medido todavía por el autor.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- No se documentan datos de entrenamiento, número de tokens ni proceso de ajuste, lo que dificulta evaluar sesgos y generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milliwattlabs/leokani-tts-1M
- Licencia: https://huggingface.co/milliwattlabs/leokani-tts-1M/blob/main/LICENSE-MILLIWATT-LABS.md
- Variante de 7M: https://huggingface.co/milliwattlabs/leokani-tts-7M
- Variante de 4.5M: https://huggingface.co/milliwattlabs/leokani-tts-4.5M
- Variante de 500K: https://huggingface.co/milliwattlabs/leokani-tts-500K
- Fonemizador Leokani G2P: https://huggingface.co/milliwattlabs/leokani-g2p
- Kokoro-82M (modelo base del habla sintética): https://huggingface.co/hexgrad/Kokoro-82M
- Sitio del autor: https://milliwattlabs.com
