# KingNish/Chotu-TTS-v0.2

## Resumen

Chotu TTS v0.2 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por KingNish, distribuido como un único grafo ONNX de 0,91 MB cuantizado a INT8. Deriva del modelo Kokoro-82M de hexgrad mediante un proceso de reducción y destilación que rebaja la cifra de parámetros hasta 835.728 (0,836 M), es decir, unas 100 veces menos que el modelo original. Su propuesta es radical: síntesis de voz neuronal completamente offline, ejecutable en CPU de portátil o dentro de una pestaña de navegador vía `onnxruntime-web` (WASM), sin ninguna llamada a la nube.

La versión 0.2 mejora sustancialmente a la 0.1 en todos los ejes: reduce el tamaño del archivo de menos de 2 MB a 0,91 MB, baja la latencia al primer audio (TTFA) de 30 ms a unos 11 ms, multiplica el throughput de 80x a 120x tiempo real y pasa de una sola voz a ocho voces embebidas de 896 bytes cada una. Incorpora además un vocoder DSP diferenciable integrado en el mismo grafo, lo que elimina la necesidad de descargar un vocoder neuronal separado.

El modelo resulta relevante para despliegues de borde (edge AI), agentes de voz en tiempo real y aplicaciones web que necesitan locución sin infraestructura de servidor. Su licencia Apache 2.0 y su formato ONNX estándar facilitan la integración en pipelines existentes. La contrapartida principal es su alcance limitado: solo inglés, calidad de voz moderada (4,255 UTMOS) y una expresividad acotada por su reducidísimo tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder + decoder streaming con estado (KV cache) y vocoder DSP diferenciable, todo en un grafo ONNX |
| Parámetros totales | 835.728 (0,836 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por fragmentos de fonemas, `phoneme_chunk`) |
| Tipos de cuantización | INT8 (variante `int8_all` y `int8_mm`) y FP32 (variante `fp32`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`chotu_tts_v0_2_int8_all.onnx`, `chotu_tts_v0_2_int8_mm.onnx`, `chotu_tts_v0_2_fp32.onnx`); voces en binario `.bin` (224 float32, 896 B) |
| Frecuencia de muestreo | 24.000 Hz, PCM mono 16 bits |
| Voces incluidas | 8 (`af_heart`, `af_bella`, `af_nicole`, `am_adam`, `am_fenrir`, `am_michael`, `bf_emma`, `bm_lewis`) |
| Modelo base | hexgrad/Kokoro-82M |
| Librería | ONNX / onnxruntime-web (WASM) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline neuronal compacto empaquetado en un único grafo ONNX con interfaz de streaming explícita: 12 tensores de entrada y 10 de salida. La entrada principal es `phoneme_chunk` (IDs de fonemas procedentes de `vocab.json`) junto con `voice_vec` (vector de voz de 224 dimensiones leído de los archivos `.bin`). El modelo mantiene estado entre pasos mediante cachés de atención (`enc_kv` con forma `[4, 2, 1, 4, 24, 24]` y `dec_kv` con forma `[4, 2, 1, 4, 32, 32]`), contadores de posición (`enc_pos`, `dec_pos`), buffers de streaming convolucional (`stem_buf`, `conv_buf`), estado de fase armónica (`phase_state`), cola de solapamiento y suma (`ola_tail`) y un cursor del generador de ruido (`noise_pos`). Este diseño permite emitir audio de forma incremental sin cortes.

La innovación técnica clave frente a la versión 0.1 es la sustitución del vocoder neuronal ConvNeXt por un vocoder DSP diferenciable integrado en el propio grafo, lo que reduce tamaño y latencia a la vez que mantiene una calidad de 4,255 UTMOS. El control de emisión se realiza mediante el tensor `commit_len`, que indica cuántos tokens debe emitir el decoder en cada paso, habilitando streaming con solapamiento controlado. No se han publicado en la información disponible detalles sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con salida PCM mono de 16 bits.
- Ocho voces embebidas: tres femeninas estadounidenses (`af_heart`, `af_bella`, `af_nicole`), tres masculinas estadounidenses (`am_adam`, `am_fenrir`, `am_michael`), una femenina británica (`bf_emma`) y una masculina británica (`bm_lewis`).
- Mezcla de voces: al ser vectores de 224 float32, es posible promediar dos archivos de voz para generar una voz híbrida personalizada.
- Streaming de audio con estado persistente: emite fragmentos de audio de forma incremental manteniendo coherencia entre pasos mediante cachés y buffers.
- Inferencia totalmente offline en CPU, sin GPU ni llamadas a servicios externos.
- Ejecución en navegador mediante `onnxruntime-web` compilado a WASM.
- Control de latencia mediante el parámetro `commit_len` y la variante de modelo elegida.
- No soporta tool calling, razonamiento multi-paso, visión, audio de entrada ni capacidades multimodales.

## Casos de uso

- Locución en aplicaciones web sin backend: el modelo se carga como un archivo ONNX de 0,91 MB en una pestaña del navegador vía WASM y sintetiza voz en el cliente, eliminando costes de servidor y problemas de privacidad asociados al envío de texto a la nube.
- Agentes de voz en tiempo real en dispositivos de borde: con 11 ms de TTFA y 120x tiempo real, encaja en asistentes por voz que necesitan respuesta hablada casi instantánea en hardware de bajas prestaciones (Raspberry Pi, móviles, wearables).
- Lectura de notificaciones y accesibilidad: integración en sistemas operativos o aplicaciones que convierten texto a voz para usuarios con discapacidad visual, funcionando sin conexión y con un consumo de almacenamiento mínimo.
- Sistemas de navegación y avisos en vehículo: generación de instrucciones habladas en tiempo real en unidades de infoentretenimiento con CPU limitada, sin depender de conectividad.
- Prototipado rápido de interfaces conversacionales: los ocho vectores de voz de 896 bytes permiten alternar entre acentos estadounidenses y británicos o entre voces masculinas y femeninas sin recargar el modelo, facilitando pruebas de UX.
- Videojuegos y experiencias interactivas offline: diálogos dinámicos generados en el dispositivo con latencia mínima y sin descargas adicionales de assets de voz.
- Kioscos y terminales de autoservicio: síntesis de voz local para instrucciones y confirmaciones, con independencia de la red y con un pie de modelo reducido.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card son los siguientes (no se han publicado comparaciones con otros modelos TTS):

| Métrica | Chotu TTS v0.1 | Chotu TTS v0.2 |
|---|---|---|
| Tamaño del archivo principal | < 2,0 MB | 0,91 MB (933 KB) |
| Parámetros | ~2 M | 0,836 M (835.728) |
| TTFA (latencia al primer audio) | 30 ms | ~11 ms (rango 7–12 ms) |
| Throughput | 80x tiempo real | ~120x tiempo real |
| Voces | 1 | 8 (896 B cada una) |
| Vocoder | ConvNeXt neuronal | DSP ligero |
| Calidad de audio | no disponible | 4,255 UTMOS |
| Frecuencia de muestreo | no disponible | 24.000 Hz |

Variantes de compilación publicadas:

| Variante | Tamaño | TTFA | Throughput |
|---|---|---|---|
| `chotu_tts_v0_2_int8_all.onnx` | 0,91 MB | ~11 ms | ~120x RT |
| `chotu_tts_v0_2_int8_mm.onnx` | 2,33 MB | 7 ms | 120x RT (pico) |
| `chotu_tts_v0_2_fp32.onnx` | 3,30 MB | no disponible | no disponible |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU. El grafo INT8 de 0,91 MB cabe holgadamente en memoria RAM de cualquier dispositivo moderno.
- GPU recomendadas: no aplica; no se han publicado requisitos de GPU. El modelo no está pensado para aceleración gráfica.
- CPU: cualquier procesador moderno x86-64 o ARM es suficiente. La variante `int8_mm` alcanza 7 ms de TTFA y 120x tiempo real en CPU.
- Compatibilidad con GPU de consumo: no aplica, ya que el objetivo es la ejecución en CPU y en navegador.
- Opciones de despliegue: ONNX Runtime nativo (CPU), `onnxruntime-web` con backend WASM para navegador, integración en aplicaciones de escritorio y móviles mediante las APIs de ONNX Runtime.
- Latencia y throughput: ~11 ms de TTFA (variante `int8_all`), 7 ms (variante `int8_mm`) y ~120x tiempo real en CPU según el autor.
- Almacenamiento: 0,91 MB para el modelo insignia más 896 bytes por voz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Chotu TTS v0.2 | 0,836 M | fonemas por fragmentos | inglés | Apache 2.0 | ONNX | 0,91 MB, 11 ms TTFA, 8 voces, 4,255 UTMOS |
| Kokoro-82M (modelo base) | 82 M | texto a fonemas | inglés y otros | Apache 2.0 | PyTorch / ONNX | ~100 veces más parámetros; calidad superior; no orientado a borde |
| Chotu TTS v0.1 | ~2 M | fonemas | inglés | Apache 2.0 | ONNX | < 2 MB, 30 ms TTFA, 1 voz, 80x RT |

No se dispone en la información proporcionada de comparaciones con otros modelos TTS ligeros (por ejemplo, variantes reducidas de Piper o VITS); dichos datos figuran como no disponibles.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Calidad de voz de 4,255 UTMOS, notablemente inferior a la de modelos TTS neuronales de mayor tamaño como el propio Kokoro-82M; puede resultar insuficiente para aplicaciones de locución profesional.
- La expresividad y el control prosódico están acotados por el reducido número de parámetros y por el vocoder DSP, que puede sonar más mecánico que un vocoder neuronal.
- Riesgo de pronunciación incorrecta en palabras poco frecuentes, nombres propios, siglas o terminología técnica, dado el pipeline basado en fonemas y el vocabulario limitado.
- No se han publicado detalles sobre el corpus de entrenamiento, los sesgos de los hablantes ni la cobertura de acentos; las ocho voces cubren únicamente acentos estadounidenses y británicos.
- El tamaño del repositorio figura como 0,0 GB y el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base Kokoro-82M y de cualquier dato de entrenamiento derivado antes de un despliegue en producción.
- La interfaz de streaming exige gestionar manualmente 12 entradas y 10 salidas de estado; una integración incorrecta de los buffers puede producir artefactos o cortes en el audio.
- No dispone de marcas de agua ni de mecanismos de identificación de voz sintética; en aplicaciones sensibles debe añadirse una capa externa de detección o divulgación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KingNish/Chotu-TTS-v0.2
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Versión anterior Chotu TTS v0.1: https://huggingface.co/KingNish/Chotu-TTS-v0.1
- Ejemplos de audio: https://huggingface.co/KingNish/Chotu-TTS-v0.2/resolve/main/examples/intro.wav, https://huggingface.co/KingNish/Chotu-TTS-v0.2/resolve/main/examples/latency.wav, https://huggingface.co/KingNish/Chotu-TTS-v0.2/resolve/main/examples/british.wav, https://huggingface.co/KingNish/Chotu-TTS-v0.2/resolve/main/examples/edge.wav
- ONNX Runtime: https://onnxruntime.ai/
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada.
