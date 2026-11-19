# sakasegawa/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF es una cuantización en formato GGUF del modelo de síntesis de voz Qwen3-TTS de Alibaba Qwen, publicada por el usuario sakasegawa. El modelo base es un sistema text-to-speech de 0,6B parámetros (1.019.816.897 parámetros reales en safetensors) que opera con un codec de 12 Hz y dispone de nueve voces con nombre propio, capaces de hablar diez idiomas. Esta versión GGUF empaqueta en un único archivo el talker, el predictor de códigos, el embedding de texto, el tokenizador y el decodificador del codec.

La particularidad principal de esta publicación es que los archivos no siguen el formato GGUF convencional de llama.cpp, sino la disposición propia de speech.cpp, la herramienta de inferencia de audio del mismo autor. Por tanto, no se pueden cargar en llama.cpp, LM Studio, Ollama ni en ningún otro programa que lea GGUF estándar: requieren speech.cpp 0.7.0 o superior (y 0.8.0 o superior para las variantes Q6_K, Q5_K y Q4_K). El modelo genera audio en streaming, entregando fragmentos a medida que los produce para que un reproductor pueda empezar con el primer trozo.

Es relevante ahora porque ofrece TTS multilingüe de calidad razonable en un tamaño muy contenido (0,76-1,21 GB según cuantización) y con un consumo de memoria de entre 0,92 y 1,37 GB por petición, lo que lo hace viable en hardware de consumo. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo TTS basado en transformer (talker + code predictor) con codec de audio a 12 Hz; empaquetado en GGUF propio de speech.cpp |
| Parámetros totales | 1.019.816.897 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K, Q4_K (decodificador del codec en F16 en todos los casos) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, pt, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (disposición propia de speech.cpp, no compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-0.6B-CustomVoice es un sistema de síntesis de voz de Qwen que combina un componente generativo tipo transformer (denominado "talker" en la documentación) con un predictor de códigos y un codec de audio que opera a 12 Hz. El codec decodifica los tokens de audio en forma de onda; en esta cuantización GGUF el decodificador del codec se mantiene siempre en F16, mientras que el resto de componentes (talker, code predictor, embedding de texto y tokenizador) se cuantizan al tipo elegido.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se documenta la verificación de fidelidad frente a la implementación oficial: el decodificador del codec alcanza 114 dB de SNR en CPU con F32, y el talker y el code predictor reproducen la elección oficial en cada frame con decodificación greedy. El tokenizador coincide con el oficial en 27 textos y en la reconstrucción de texto de 1191 secuencias de identificadores. La innovación destacable es la generación en streaming por fragmentos de audio y la integración del codec y el modelo en un solo archivo.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: alemán, inglés, español, francés, italiano, japonés, coreano, portugués, ruso y chino.
- Nueve voces con nombre propio y perfiles definidos: aiden (en, masculina), dylan (zh, masculina), eric (zh, masculina), ono_anna (ja, femenina), ryan (en, masculina), serena (zh, femenina), sohee (ko, femenina), uncle_fu (zh, masculina) y vivian (zh, femenina).
- Selección de idioma por petición: el idioma indicado en la solicitud dirige la generación.
- Generación de audio en streaming: el modelo entrega fragmentos a medida que los produce, permitiendo reproducción inmediata.
- Interfaz de línea de comandos y servidor HTTP con API (a través de speech.cpp).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo convierte texto en voz en diez idiomas con voces predefinidas, y su consumo de memoria de 0,92-1,37 GB permite ejecutarlo en un portátil o en un servidor modesto.
- Asistentes de voz para atención al cliente: la selección de voz e idioma por petición permite atender a usuarios en español, inglés, francés o alemán desde el mismo despliegue, con streaming para reducir la latencia percibida.
- Generación de audiolibros y contenido narrado: las voces con perfiles diferenciados (por ejemplo, uncle_fu con timbre maduro o vivian con voz juvenil) permiten asignar narradores distintos a personajes o secciones.
- Doblaje y localización de vídeo: el soporte de diez idiomas y la capacidad de generar audio por fragmentos facilitan la producción de pistas de voz sincronizadas en pipelines de postproducción.
- Sistemas de navegación y avisos hablados en dispositivos embebidos: la variante Q4_K ocupa 0,76 GB y consume 0,92 GB de memoria, lo que la hace apta para hardware con recursos limitados.
- Pruebas de integración continua de sistemas de voz: la CLI y el servidor HTTP de speech.cpp permiten automatizar la generación de muestras de referencia y validar regresiones en pipelines de CI/CD.
- Prototipado de interfaces conversacionales: el servidor HTTP con API permite conectar el modelo a un frontend web o a un bot de mensajería sin escribir código de inferencia propio.

## Benchmarks y rendimiento

La model card incluye una evaluación de precisión mediante speech-bench (12 de octubre de 2026, Apple M5 con Metal), sobre 20 frases del fichero `prompts/speak-ja-JP.json`, con las semillas 1, 2 y 3 y la voz ono_anna, evaluadas con Qwen3-ASR 1.7B en Q8_0. La métrica es el CER (tasa de error de caracteres) sobre 60 tomas:

| Tipo | Tamaño | Memoria pico | CER |
|---|---|---|---|
| Q8_0 | 1,21 GB | 1,37 GB | 6,14% |
| Q6_K | 0,99 GB | 1,15 GB | 6,03% |
| Q5_K | 0,87 GB | 1,03 GB | 7,35% |
| Q4_K | 0,76 GB | 0,92 GB | 13,60% |

Verificación de fidelidad frente a la implementación oficial:

| Comprobación | Resultado |
|---|---|
| Decodificador del codec, CPU, F32 | 114 dB de SNR respecto al decodificador oficial |
| Decodificador del codec en fragmentos frente a la locución completa | 132 dB de SNR en F32 en CPU; 64 dB con Q8_0 en Metal |
| Talker y code predictor, F32, CPU y Metal | la elección oficial en cada frame; la decodificación greedy produce los frames oficiales |
| Tokenizador | tokens oficiales en 27 textos y texto oficial de 1191 secuencias de identificadores |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- Memoria por petición: 0,92 GB (Q4_K), 1,03 GB (Q5_K), 1,15 GB (Q6_K) y 1,37 GB (Q8_0), medidos como pico de memoria de `speech` en una petición.
- Cabe en GPU de consumo: con menos de 1,5 GB de memoria, cualquier GPU con 2 GB o más de VRAM es suficiente; también funciona en CPU.
- Aceleración: se documentan ejecuciones en CPU y en Metal (Apple M5). En Vulkan, los archivos Q5_K y Q4_K requieren speech.cpp 0.8.4 o superior, ya que versiones anteriores no producen logits finitos.
- Despliegue: exclusivamente mediante speech.cpp (versión 0.7.0 o superior; 0.8.0 o superior para Q6_K, Q5_K y Q4_K), con CLI (`speech tts`) y servidor HTTP (`speech serve`). No es compatible con llama.cpp, LM Studio, Ollama, vLLM ni TGI.
- Latencia y throughput: la model card menciona una sección de velocidad con datos de speech-bench del 8 de octubre de 2026, pero el texto proporcionado está truncado y no incluye las cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo base Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice comparte arquitectura y parámetros con esta cuantización, pero se distribuye en formato original (safetensors) y no está empaquetado para speech.cpp. No se dispone de información sobre alternativas como otros TTS de tamaño similar (por ejemplo, modelos de la familia Kokoro o XTTS) en la documentación consultada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF (este) | 1.019.816.897 | no disponible | Apache 2.0 | GGUF (speech.cpp) | Hugging Face |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (base) | 1.019.816.897 | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Alternativas de TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Compatibilidad restringida: los archivos solo funcionan en speech.cpp 0.7.0 o superior (0.8.0 o superior para Q6_K, Q5_K y Q4_K) y no se pueden cargar en llama.cpp, LM Studio, Ollama ni otras herramientas que lean GGUF estándar.
- En Vulkan, los archivos Q5_K y Q4_K necesitan speech.cpp 0.8.4 o superior; versiones anteriores no generan logits finitos.
- La cuantización Q4_K degrada notablemente la precisión: CER del 13,60% frente al 6,03-6,14% de Q6_K y Q8_0. Para producción orientada a calidad se recomienda Q6_K o Q8_0.
- El CER varía unos pocos puntos entre semillas, por lo que solo diferencias grandes distinguen dos tipos de cuantización.
- Solo hay nueve voces predefinidas; no se documenta clonación de voz ni voces personalizadas.
- No se documentan sesgos específicos del modelo, pero al ser un sistema TTS multilingüe puede reflejar sesgos de los datos de entrenamiento en la prosodia o el timbre asociados a cada idioma.
- Riesgo de errores de pronunciación o entonación en textos con nombres propios, siglas o vocabulario fuera de dominio; el CER medido (6-14%) cuantifica parte de este riesgo.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-TTS en su repositorio original.
- No se documentan la longitud de contexto ni los límites de longitud de texto por petición; conviene validarlos empíricamente antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sakasegawa/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Repositorio de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Instalación de speech.cpp: https://github.com/nyosegawa/speech.cpp#install
- Documentación de Qwen3-TTS en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/qwen3-tts.md
- Documentación de la CLI: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
