# milestonemade/Kokoro-82M-CoreML-Masked

## Resumen

Kokoro-82M-CoreML-Masked es una exportación a CoreML del modelo de síntesis de voz hexgrad/Kokoro-82M, publicada por el usuario milestonemade. El modelo original es un sistema TTS de 82 millones de parámetros que convierte texto en audio a 24 kHz. Esta versión concreta empaqueta todo el pipeline (BERT, predicción de duración, alineamiento, prosodia y decodificador) en una única llamada CoreML, de modo que puede ejecutarse de forma nativa en dispositivos Apple (iOS 18+ y macOS 15+).

La innovación principal de esta exportación es el enmascaramiento de las LSTMs bidireccionales. En un grafo end-to-end las formas de entrada son fijas, por lo que el texto corto llega con padding. Las LSTMs bidireccionales del modelo original leen ese padding en su dirección inversa, lo que produce duraciones predichas demasiado cortas y contornos de tono inestables (voz apresurada y "ondulante"). Estas exportaciones mantienen el estado de cada LSTM en los pasos de padding, replicando el comportamiento de las secuencias empaquetadas de PyTorch, y calculan las estadísticas AdaIN del decodificador solo sobre frames válidos. El resultado es que las duraciones predichas coinciden exactamente con las de Kokoro original.

Se ofrecen cuatro variantes que difieren en ventana de audio y precisión: 5 s fp32, 5 s fp16, 10 s fp16 y 15 s fp16. El modelo está pensado para inferencia local en hardware Apple, no en servidores GPU, y su licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS end-to-end exportado a CoreML (BERT + predictor de duración + alineamiento + prosodia + decodificador con LSTMs bidireccionales enmascaradas) |
| Parametros totales | 82M (modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 5 s (128 tokens de fonema), 10 s (168 tokens) o 15 s (249 tokens) |
| Tipos de cuantizacion | fp32 (variante 5 s) y fp16 en el decodificador (variantes 5 s, 10 s y 15 s) |
| Idiomas soportados | en, zh, es, fr, hi, it, ja, pt (8 idiomas; 54 presets de voz en 10 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` (CoreML precompilado); incluye G2PEncoder/G2PDecoder `.mlmodelc`, voces en JSON y diccionarios de pronunciación |

## Arquitectura y entrenamiento

El modelo es una exportación del Kokoro-82M original, un sistema TTS de 82M de parámetros. El grafo end-to-end integra el codificador de texto basado en BERT, el predictor de duración, el alineamiento, el módulo de prosodia (predictor de F0/energía a nivel de frame) y el decodificador que genera la forma de onda a 24 kHz. La particularidad técnica de esta exportación es el tratamiento del padding: las LSTMs bidireccionales (codificador de texto, codificador y predictor de duración, y predictor de F0/N a nivel de frame) mantienen su estado en los pasos de padding, lo que equivale al comportamiento de `packed sequences` de PyTorch con padding a la derecha. Además, las estadísticas AdaIN del decodificador se calculan únicamente sobre frames válidos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo RLHF o DPO, ya que la model card de esta exportación no lo detalla y remite al modelo base. La innovación destacable es exclusivamente de exportación e inferencia: el enmascaramiento de LSTMs y el cálculo restringido de AdaIN, que corrigen los artefactos de duración y tono propios de los grafos CoreML con formas fijas. El modelo incluye además un modelo G2P (grapheme-to-phoneme) separado, con vocabulario de fonemas y diccionarios de pronunciación de inglés (`us_gold.json`, `us_silver.json`).

## Capacidades

- Síntesis de voz (text-to-speech) end-to-end a 24 kHz en una sola llamada CoreML.
- Generación de audio con control de velocidad mediante el parámetro `speed` (1.0 = normal).
- Soporte de 8 idiomas: inglés, chino, español, francés, hindi, italiano, japonés y portugués.
- 54 presets de voz en 10 idiomas, cada uno con su vector de estilo (`ref_s`) de 256 dimensiones.
- Conversión de grafemas a fonemas integrada mediante el modelo G2P incluido.
- Predicción de duraciones por token (`pred_dur`, frames de 25 ms) y control de fases armónicas iniciales (`random_phases`).
- Procesamiento por ventanas: 5 s, 10 s o 15 s según la variante, con división automática del texto largo en fragmentos de 5 s en el flujo recomendado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: el modelo se ejecuta en local sobre CPU Apple Silicon con una pasada de ~200 ms para la variante 5 s fp16, lo que permite reproducir la primera frase de una respuesta casi de inmediato.
- Asistentes conversacionales offline: al no requerir red ni GPU, el modelo puede integrarse en apps de accesibilidad o asistentes de voz que deben funcionar sin conexión y con baja latencia en dispositivos Apple.
- Audiolibros y contenido largo: la variante de 15 s fp16 renderiza frases de hasta ~194 tokens de fonema (unos 10 s de habla) en una sola pasada, con un único contorno de entonación y sin costuras entre fragmentos.
- Locución multilingüe: con 8 idiomas y 54 voces, se puede generar audio en español, francés, italiano, portugués, entre otros, para aplicaciones de aprendizaje de idiomas o contenido localizado.
- Prototipado de interfaces de voz: la API de `speech-swift` permite cargar varios modelos fp16 y elegir por longitud de entrada (5 s para textos cortos, 10 s o 15 s para frases largas), facilitando la experimentación rápida.
- Generación de avisos y notificaciones habladas: la variante de 5 s fp16 es la más rápida y fue preferida en pruebas ciegas en 6 de 8 pares, adecuada para respuestas cortas tipo "Yes." o notificaciones breves.
- Investigación en TTS sobre CoreML: el directorio `export/` documenta cómo se exportaron los modelos, lo que permite reproducir o adaptar el pipeline de enmascaramiento de LSTMs a otros modelos.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que es un modelo TTS. Se presentan los datos de rendimiento y calidad disponibles:

| Modelo | Ventana | Precision | Tamano | Una pasada en CPU |
|---|---|---|---|---|
| `kokoro_masked_5s.mlmodelc` | 5 s, 128 tokens | fp32 | 327 MB | ~270 ms |
| `kokoro_masked_5s_fp16.mlmodelc` | 5 s, 128 tokens | fp16 decodificador | 233 MB | ~200 ms |
| `kokoro_masked_10s_fp16.mlmodelc` | 10 s, 168 tokens | fp16 decodificador | 234 MB | ~0.6 s |
| `kokoro_masked_15s_fp16.mlmodelc` | 15 s, 249 tokens | fp16 decodificador | 236 MB | ~0.9-1.4 s |

Pruebas ciegas de calidad (voz `af_heart`, velocidad 1.0, pares barajados y sin etiquetar):

| Comparacion | Resultado |
|---|---|
| `kokoro_masked_5s` (fp32) frente a `kokoro_5s` de aufklarer (8 textos en inglés) | Preferido en 9 de los pares (la tabla de la model card está truncada; no se dispone del total exacto) |
| `kokoro_masked_5s_fp16` frente al mejor grafo de 5 s encontrado (8 pares, CPU) | Preferido en 6 de 8 pares |
| `kokoro_masked_10s_fp16` frente a `kokoro_masked_5s_fp16` (frases largas, 6 pares) | Preferido en 5 de 6 pares |
| `kokoro_masked_15s_fp16` (frases largas) | Ganó todos los pares |

Los tiempos corresponden a un único Mac con Apple Silicon; no se especifica el modelo exacto de chip.

## Requisitos de hardware

- Inferencia en CPU de Apple Silicon (los tiempos indicados se midieron en un Mac con Apple Silicon no especificado).
- Requiere iOS 18+ o macOS 15+.
- Tamaño en disco: entre 233 MB y 327 MB por variante; el repositorio completo ocupa 1.0 GB.
- Las variantes fp16 deben cargarse con `.cpuOnly`. Con `.cpuAndNeuralEngine`, la primera carga implica una compilación para Neural Engine de unos 70 minutos y cada pasada es aproximadamente 5 veces más lenta que en CPU, porque el grafo mantiene el lado de texto y la ruta de fases en fp32 y los traspasos CPU-Neural Engine cuestan más de lo que ahorran.
- La variante fp32 se ejecuta íntegramente en CPU con cualquiera de los dos ajustes.
- No se proporcionan requisitos de VRAM ni soporte para GPU NVIDIA (A100, H100, RTX 4090); el formato CoreML está orientado a hardware Apple.
- Despliegue mediante CoreML y la librería `speech-swift` (versión cuyo `KokoroTTSModel.fromPretrained` acepta `modelFile`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: ~200 ms por pasada de 5 s fp16, ~0.6 s por pasada de 10 s fp16 y ~0.9-1.4 s por pasada de 15 s fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kokoro-82M-CoreML-Masked (este) | 82M | 5/10/15 s de audio | 8 | Apache 2.0 | CoreML | Hugging Face |
| aufklarer/Kokoro-82M-CoreML | 82M | 5 s (grafo `kokoro_5s`) | no disponible en la informacion | no disponible en la informacion | CoreML | Hugging Face |
| hexgrad/Kokoro-82M (base) | 82M | no disponible en la informacion | 8 | Apache 2.0 | safetensors/PyTorch (no confirmado en la informacion) | Hugging Face |

La comparación se limita al ecosistema Kokoro porque la información proporcionada no incluye otros modelos TTS. La diferencia clave frente a `aufklarer/Kokoro-82M-CoreML` es el enmascaramiento de LSTMs y las ventanas ampliadas de 10 s y 15 s; este modelo reutiliza el vocabulario, diccionarios, modelo G2P y voces de aquel.

## Limitaciones y advertencias

- Es un modelo exclusivamente TTS: no genera texto, no razona, no escribe código ni soporta tool calling.
- Solo funciona en el ecosistema Apple (CoreML, iOS 18+, macOS 15+); no es desplegable en GPU NVIDIA ni en servidores Linux convencionales.
- El rendimiento en Neural Engine es peor que en CPU (unas 5 veces más lento por pasada y ~70 minutos de compilación inicial), por lo que debe usarse `.cpuOnly` con las variantes fp16.
- La ventana de audio es fija: los textos largos deben trocearse en fragmentos de 5 s (o usar las variantes de 10 s y 15 s), lo que puede introducir discontinuidades si no se gestiona el chunking.
- Una pasada de la variante de 15 s cuesta la ventana completa independientemente de la longitud del texto, y no hay audio disponible hasta que termina la pasada.
- La model card no documenta sesgos, riesgo de alucinación ni evaluación de calidad en idiomas distintos del inglés; las pruebas ciegas citadas son solo en inglés con la voz `af_heart`.
- No se dispone de información sobre el dataset de entrenamiento del modelo base, lo que limita la evaluación de sesgos y cobertura lingüística real.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los componentes reutilizados (voces, diccionarios, G2P) procedentes de `aufklarer/Kokoro-82M-CoreML`.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.
- La tabla de calidad de la model card está truncada en la información disponible ("9 o..."), por lo que no se puede confirmar el resultado completo de la comparación fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milestonemade/Kokoro-82M-CoreML-Masked
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Exportación CoreML de referencia: https://huggingface.co/aufklarer/Kokoro-82M-CoreML
- Librería de uso (speech-swift): https://github.com/soniqo/speech-swift
