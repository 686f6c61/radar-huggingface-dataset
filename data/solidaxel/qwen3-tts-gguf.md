# Solidaxel/Qwen3-TTS-GGUF

## Resumen

Qwen3-TTS-GGUF es una conversión de pesos del modelo Qwen3-TTS 12Hz 1.7B Base de Alibaba Qwen, publicada por el usuario Solidaxel en Hugging Face. El objetivo es permitir la ejecución de un sistema de texto-a-voz (TTS) con clonación de voz sin necesidad de PyTorch, empleando únicamente llama.cpp para los componentes GGUF y ONNX Runtime para los codificadores y decodificadores. El paquete completo ocupa aproximadamente 1,5 GB, lo que lo hace viable en hardware modesto.

El modelo subyacente es la variante Base de 1,7B de parámetros, que realiza clonación de voz a partir de una muestra de referencia y su transcripción exacta. No se trata de las variantes CustomVoice ni VoiceDesign, ni del modelo de 0,6B. La arquitectura combina un "talker" (el modelo principal de lenguaje) con un "predictor" y varios codificadores (códec, speaker encoder y decoder) que transforman el texto y la referencia de voz en audio.

La relevancia actual radica en que ofrece una alternativa ligera y sin dependencias de PyTorch para TTS multilingüe con clonación, con licencia Apache 2.0 y soporte para diez idiomas. El repositorio acumula 4.686 descargas y está etiquetado como compatible con endpoints, lo que facilita su integración en servicios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: talker (transformer, GGUF) + predictor (GGUF) + codificador de códec, speaker encoder y decoder (ONNX) |
| Parametros totales | 141.570.304 (según safetensors del modelo base; el nombre comercial indica 1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q5_K (talker), GGUF Q8_0 (predictor); ONNX FP16, INT8 y FP32 para los componentes ONNX |
| Idiomas soportados | zh, en, fr, de, es, it, pt, ja, ko, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (talker y predictor), ONNX (decoder, speaker encoder, codec encoder), tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de TTS en varias etapas. El componente principal es un "talker" en formato GGUF Q5_K de 960 MB, que actúa como modelo de lenguaje generador de tokens de audio. Un "predictor" en GGUF Q8_0 de 145 MB complementa la generación. La parte de audio se gestiona mediante tres módulos ONNX: un decoder FP16 de 220 MB, un speaker encoder FP16 de 24 MB y un codec encoder FP16 de 109 MB. El tokenizador ocupa 11 MB. Este diseño permite ejecutar la inferencia sin PyTorch, usando llama.cpp para los GGUF y ONNX Runtime para los ONNX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base es Qwen/Qwen3-TTS-12Hz-1.7B-Base, y esta publicación es una conversión de pesos, no un entrenamiento nuevo. La innovación técnica destacable es la eliminación de la dependencia de PyTorch y la separación en componentes GGUF y ONNX para despliegue ligero.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en diez idiomas: chino, inglés, francés, alemán, español, italiano, portugués, japonés, coreano y ruso.
- Clonación de voz a partir de una muestra de referencia corta (8-10 segundos) y su transcripción exacta.
- Reutilización de la voz codificada para múltiples generaciones sin necesidad de recodificar.
- Generación en streaming mediante la API `create_stream()` del runtime.
- Control de parámetros de generación como temperatura y semilla.
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo especializado en TTS.
- No se mencionan capacidades de visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Clonación de voz para audiolibros: el modelo permite generar narraciones con una voz concreta a partir de una muestra limpia de 8-10 segundos y su transcripción, reutilizando la voz codificada para cada capítulo sin recodificar.
- Doblaje y localización de contenido: con soporte para diez idiomas, se puede generar audio en español, inglés, francés, etc., manteniendo la identidad de la voz clonada para cada idioma.
- Asistentes de voz integrados en aplicaciones: el runtime ofrece streaming y una API sencilla (`TTSEngine`, `TTSConfig`), lo que permite integrar síntesis en tiempo real en interfaces conversacionales.
- Generación de avisos y locuciones automatizadas: para sistemas de megafonía, anuncios en aeropuertos o mensajes de atención al cliente, con normalización previa de números y símbolos mediante `num2words`.
- Producción de contenido para redes y podcasts: creación de voces sintéticas personalizadas para narraciones, con control de temperatura y semilla para reproducibilidad.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia, con voces clonadas que resulten familiares al usuario.
- Prototipado rápido sin GPU dedicada: al ocupar unos 1,5 GB y no requerir PyTorch, se puede ejecutar en entornos con CPU y ONNX Runtime, ideal para pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete completo ocupa aproximadamente 1,5 GB, por lo que es viable en GPUs con 4 GB o más, y también en CPU.
- GPU recomendadas: no se especifican modelos concretos; al usar llama.cpp y ONNX Runtime, puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 para mayor throughput.
- Cabe en GPU consumer: sí, dado el tamaño reducido (1,5 GB en total).
- Opciones de despliegue: llama.cpp para los GGUF y ONNX Runtime para los ONNX; el runtime específico es `HaujetZhao/Qwen3-TTS-GGUF` (paquete `qwen3_tts_gguf`). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. El proceso de separación de voz con Demucs tarda unos 25 segundos por minuto de audio en CPU, pero es un paso de preprocesamiento, no de inferencia TTS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Clonación de voz |
|---|---|---|---|---|---|---|
| Qwen3-TTS-GGUF (este) | 141.570.304 (1.7B nominal) | no disponible | 10 | Apache 2.0 | GGUF + ONNX | Sí (Base) |
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1.7B | no disponible | 10 | Apache 2.0 | PyTorch (safetensors) | Sí |
| Qwen3-TTS-12Hz-0.6B | 0.6B | no disponible | no disponible | Apache 2.0 | PyTorch | no disponible |
| Otros TTS open source (p. ej. XTTS, Bark) | no disponible | no disponible | variable | variable | variable | variable |

La comparativa se limita al ecosistema Qwen3-TTS; no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo lee mal dígitos y símbolos: puede omitirlos, leerlos en el idioma equivocado o inventar una pronunciación. Es necesario normalizar números y símbolos a palabras antes de la síntesis.
- La clonación de voz requiere una muestra limpia y su transcripción exacta; una sola palabra mal transcrita degrada la calidad del clon.
- La muestra de referencia no debe contener música, ruido ni otras voces, ya que se clonarían también.
- Un clip que termina a mitad de frase puede filtrar las últimas palabras como preludio al inicio de cada generación.
- Riesgo de alucinación en la pronunciación y en la generación de audio no fiable para entradas no normalizadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base y no se incluyen muestras de voz en el repositorio; el usuario debe usar grabaciones sobre las que tenga derechos.
- No se dispone de información sobre sesgos conocidos del modelo base.
- El runtime depende de `HaujetZhao/Qwen3-TTS-GGUF` y de bibliotecas llama.cpp compiladas; la integración con otros frameworks no está documentada.
- El tamaño del repo es de 5,9 GB, aunque el paquete funcional es de aproximadamente 1,5 GB.

## Enlaces

- [Hugging Face: Solidaxel/Qwen3-TTS-GGUF](https://huggingface.co/Solidaxel/Qwen3-TTS-GGUF)
- [Modelo base: Qwen/Qwen3-TTS-12Hz-1.7B-Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base)
- [Runtime: HaujetZhao/Qwen3-TTS-GGUF (GitHub)](https://github.com/HaujetZhao/Qwen3-TTS-GGUF)
- [num2words (PyPI)](https://pypi.org/project/num2words/)
