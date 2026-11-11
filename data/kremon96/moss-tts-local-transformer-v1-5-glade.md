# Kremon96/moss-tts-local-transformer-v1.5-glade

## Resumen

MOSS-TTS Local Transformer v1.5 for Glade es una conversión híbrida del modelo de síntesis de voz MOSS-TTS Local Transformer v1.5 de OpenMOSS-Team, combinado con el tokenizador de audio MOSS-Audio-Tokenizer-v2. La conversión, publicada por el usuario Kremon96, adapta el modelo original al ecosistema MLX de Apple Silicon, distribuyendo el trabajo entre GPU (mediante Swift MLX) y la Neural Engine (ANE) para el códec de audio. El resultado es un sistema de text-to-speech que genera audio estéreo nativo a 48 kHz y conserva la arquitectura multilingüe de 31 idiomas del modelo original.

El componente principal es un modelo de lenguaje de aproximadamente 4.550 millones de parámetros que opera sobre representaciones de audio, mientras que veintitrés grupos de códec Core AI se encargan de la renderización de la forma de onda en la Neural Engine. La conversión cuantiza las matrices globales a cuatro bits con grupos afines de 64, manteniendo en FP16 el transformer local, los embeddings de audio y las cabezas atadas. No se ha realizado entrenamiento adicional: se trata de una adaptación de despliegue, no de un modelo nuevo.

La relevancia de esta ficha radica en que ejemplifica un patrón emergente: conversiones de modelos open source a runtimes específicos de plataforma (en este caso, MLX y Core AI para macOS e iOS) que buscan hacer viable la inferencia local de TTS de alta calidad en hardware de consumo. El modelo base es de licencia Apache 2.0, lo que facilita su uso comercial, aunque las mediciones publicadas solo cualifican la conversión en Mac y con controles de síntesis en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer local (modelo de lenguaje sobre tokens de audio) + códec Core AI en ANE; conversión híbrida GPU/ANE |
| Parámetros totales | ~4,55 mil millones (modelo de lenguaje) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Límite duro de generación de 5.000 posiciones más posiciones de prompt; planificador orientado a 5 minutos por unidad de texto |
| Tipos de cuantización | Matrices globales en 4 bits con grupos afines de 64; transformer local, embeddings de audio y cabezas atadas en FP16; códec en FP16 con codebooks y proyecciones de frontera en FP32 |
| Idiomas soportados | 31 idiomas: zh, yue, en, ar, cs, da, de, nl, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | Directorios `language/` (pesos mapeados y tokenizer) y `codec/` (23 grupos `.aimodel` FP16); no se distribuyen safetensors ni GGUF convencionales |

## Arquitectura y entrenamiento

El modelo base MOSS-TTS Local Transformer v1.5 es un transformer autorregresivo que opera sobre tokens de audio producidos por el tokenizador MOSS-Audio-Tokenizer-v2. La conversión para Glade separa el sistema en dos etapas: un modelo de lenguaje de ~4,55B parámetros que se ejecuta en GPU mediante Swift MLX y un códec de veintitrés grupos Core AI que renderiza audio estéreo nativo a 48 kHz en la Neural Engine. El códec conserva ventanas causales nativas y cachés acústicas, y cada grupo procesa dieciséis tramas de código (1,28 segundos de audio nuevo). El transformer local requiere doce pasadas secuenciales por cada trama de 80 ms, y el códec estéreo cuenta con 92 capas de transformer frente a las 68 de la variante mono de 24 kHz.

No se ha realizado entrenamiento adicional en esta conversión: los pesos proceden del modelo original y solo se han remapeado y cuantizado. Las matrices globales usan cuantización afín de 4 bits con grupos de 64, mientras que el transformer local, los embeddings de audio y las cabezas atadas se mantienen en FP16. El repositorio incluye un codificador de voz opcional en FP32 (`voice-encoder/`) para importar referencias de audio y cachear su acondicionamiento de doce codebooks; las referencias mono se duplican a estéreo para el codificador, y la síntesis sin referencia no requiere este componente. No se dispone de información sobre la composición del dataset de entrenamiento original ni sobre si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto plano, con soporte de etiquetas de idioma del modelo original, marcado de pausas y controles IPA.
- Generación de audio estéreo nativo a 48 kHz mediante el códec Core AI en la Neural Engine.
- Síntesis multilingüe con arquitectura de 31 idiomas, incluidos chino, cantonés, inglés, español, francés, alemán, japonés, coreano, árabe, hindi y ruso, entre otros.
- Clonación o acondicionamiento de voz mediante el codificador de referencia opcional, con caché de doce codebooks reutilizable entre peticiones.
- Ejecución en línea incremental con entrega de audio por fragmentos y primer paquete de 1,28 segundos tras 1,45 segundos en el modo residente.
- Procesamiento por lotes offline acotado con retirada de carriles y salida ordenada por fuente.
- Ejecución por fases que libera los pesos del modelo de lenguaje durante la renderización de la forma de onda, reteniendo el estado KV de las secuencias no terminadas.
- Soporte de alineación MFA opcional para texto hablado ordinario, con requisito de `TTSRequest.spokenText` explícito cuando se usan pausas o controles IPA.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo especializado en TTS.

## Casos de uso

- **Síntesis de voz local en macOS e iOS**: el modelo está empaquetado para runtimes Swift en macOS e iOS, con API `MOSSLocalSynthesizer` y `TTSSynthesisSession`, lo que permite integrar TTS en aplicaciones nativas de Apple sin depender de servicios en la nube.
- **Lectura de contenido multilingüe en aplicaciones de accesibilidad**: con 31 idiomas y soporte de etiquetas de idioma, puede narrar documentos, artículos o interfaces en la lengua del usuario, generando audio estéreo de 48 kHz para una reproducción de mayor calidad.
- **Generación de audiolibros o pódcasts por lotes**: el backend soporta batching offline acotado con salida ordenada por fuente y planificación de hasta cinco minutos por unidad de texto, adecuado para procesar capítulos o guiones largos de forma desatendida.
- **Asistentes conversacionales con respuesta hablada incremental**: el modo en línea entrega el primer paquete de audio tras 1,45 segundos y genera 8,56 segundos en 8,02 segundos (RTFx 1,07×), suficiente para respuestas habladas en tiempo casi real en un MacBook Air M3.
- **Clonación de voz para personalización**: el codificador de referencia opcional permite importar una voz antes de cargar el modelo de lenguaje y reutilizar sus códigos de acondicionamiento en peticiones futuras, útil para mantener una identidad de voz consistente en una aplicación.
- **Prototipado de doblaje o localización**: la combinación de etiquetas de idioma, marcado de pausas y controles IPA permite ajustar pronunciación y ritmo en distintos idiomas, lo que facilita pruebas de localización de contenido audiovisual.
- **Investigación en TTS sobre Apple Silicon**: la separación entre modelo de lenguaje en GPU y códec en ANE, junto con las mediciones de RTFx publicadas, sirve como banco de pruebas para estudiar el reparto de cómputo entre unidades en hardware Apple.

## Benchmarks y rendimiento

Las mediciones publicadas corresponden a un MacBook Air M3 con 16 GB y macOS 27.0.1, con runtime Swift en Release, excluyendo preparación y escritura de WAV. Se usan las mismas dos entradas de texto y semilla en inglés, un calentamiento completo y la mediana de tres pasadas.

| Carriles activos | Audio generado | Tiempo de generación | RTFx |
|---|---:|---:|---:|
| 1 | 17,12 s | 16,84 s | 1,02× |
| 2 | 13,60 s | 8,32 s | 1,63× |

Comparativa con la conversión anterior MOSS-TTS-v1.5 Glade bajo el mismo procedimiento:

| Modelo | Carriles | RTFx | Salida |
|---|---:|---:|---|
| MOSS-TTS Local v1.5 Glade | 1 | 1,02× | 48 kHz estéreo |
| MOSS-TTS Local v1.5 Glade | 2 | 1,63× | 48 kHz estéreo |
| MOSS-TTS v1.5 Glade (anterior) | 1 | 1,07× | 24 kHz mono |
| MOSS-TTS v1.5 Glade (anterior) | 2 | 1,89× | 24 kHz mono |

Control solo de códec sobre códigos idénticos (7,2 segundos de audio):

| Configuración | Tiempo | RTFx |
|---|---:|---:|
| Códec ANE con proyección dividida (publicado) | 1,25 s | 5,76× |
| Control GPU con proyección directa | 1,59 s | 4,53× |

El códec en ANE es aproximadamente un 27 % más rápido que el control en GPU, y la síntesis completa gana entre un 3 % y un 7 % con ese cambio; la mayor parte del tiempo sigue correspondiendo a la generación autorregresiva. En entrega incremental residente se generan 8,56 segundos en 8,02 segundos (1,07×) con el primer paquete de 1,28 segundos tras 1,45 segundos; el cambio de fase cada 2,56 segundos tarda 8,78 segundos (0,98×) con primer audio tras 2,67 segundos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **VRAM/memoria estimada**: el repositorio ocupa 8,9 GB; el modelo de lenguaje de ~4,55B con matrices globales en 4 bits y componentes en FP16 requiere un espacio de trabajo en memoria que, según las mediciones, cabe en un MacBook Air M3 de 16 GB. El mapeo de archivos no elimina el conjunto de trabajo en memoria, y los archivos mapeados deben permanecer sin cambios mientras estén cargados.
- **GPU recomendadas**: la conversión está diseñada para Apple Silicon; las mediciones publicadas usan un M3. No se documentan requisitos para GPU NVIDIA (A100, H100, RTX 4090) ni AMD.
- **Compatibilidad con GPU de consumo**: sí, en Apple Silicon de gama consumer; el ejemplo medido es un MacBook Air M3 con 16 GB. No hay datos para GPUs de consumo NVIDIA.
- **Opciones de despliegue**: runtime Swift propietario de Glade (`MOSSLocalModelBundle`, `MOSSLocalSynthesizer`, `TTSSynthesisSession`); descarga mediante `hf download`; runtimes macOS e iOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- **Latencia y throughput**: RTFx de 1,02× con un carril y 1,63× con dos en M3; primer audio incremental tras 1,45 segundos en modo residente y 2,67 segundos con cambio de fase. La entrega incremental residente produce PCM bit a bit idéntico al modo por fases.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida de audio | Licencia | Plataforma | Rendimiento medido |
|---|---|---|---|---|---|---|
| MOSS-TTS Local Transformer v1.5 Glade (esta ficha) | ~4,55B (LM) | 5.000 posiciones de generación | 48 kHz estéreo | Apache 2.0 | Apple Silicon (MLX + ANE) | 1,02× (1 carril), 1,63× (2 carriles) en M3 |
| MOSS-TTS v1.5 Glade (conversión anterior) | no disponible | no disponible | 24 kHz mono | Apache 2.0 | Apple Silicon | 1,07× (1 carril), 1,89× (2 carriles) en M3 |
| MOSS-TTS Local Transformer v1.5 (original) | ~4,55B (LM) | no disponible | no disponible | Apache 2.0 | no disponible | no disponible |
| MOSS-Audio-Tokenizer-v2 (original) | no disponible | no disponible | códec de audio | Apache 2.0 | no disponible | no disponible |

La comparación se limita a las variantes del propio ecosistema MOSS, ya que la información proporcionada no incluye datos de modelos TTS de otros desarrolladores (por ejemplo, family de modelos TTS comerciales o abiertos comparables). No se dispone de métricas de calidad subjetiva (MOS) ni de benchmarks estándar para establecer comparaciones de fidelidad de síntesis.

## Limitaciones y advertencias

- **Calidad multilingüe no establecida**: los controles de síntesis medidos son en inglés; el autor indica explícitamente que la calidad multilingüe general no está establecida, pese a conservar la arquitectura de 31 idiomas.
- **Solo cualificado en Mac**: las mediciones cualifican la conversión únicamente en macOS; los runtimes iOS están soportados pero no se han publicado mediciones para ellos.
- **Riesgo de alucinación y artefactos de audio**: como modelo generativo autorregresivo con muestreo estocástico, la duración y el contenido del audio pueden variar entre semillas; el autor señala que el redondeo FP16 y el muestreo pueden producir códigos distintos.
- **Límite duro de generación**: 5.000 posiciones más las del prompt; las ejecuciones offline que agotan el límite reintentan con nueva semilla y luego dividen la entrada, sin devolver un sufijo inacabado como habla completa. En línea, el agotamiento reporta un error y no hay recuperación automática de prefijo MFA.
- **Dependencia de archivos mapeados**: los archivos mapeados deben permanecer sin cambios mientras estén cargados; el mapeo no elimina su conjunto de trabajo en memoria.
- **Sin solapamiento de etapas**: el backend residente no solapa el cómputo del modelo de lenguaje y del códec, lo que limita el throughput frente a diseños con pipeline solapado.
- **Entrega en línea de un solo carril**: la entrega incremental en línea usa actualmente un único carril de generación.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución; el repositorio incluye archivos LICENSE y NOTICE.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo de voz, pueden aparecer sesgos de pronunciación, prosodia o acento según el idioma y la referencia de voz.
- **Sin datos de benchmarks estándar**: no hay resultados de MMLU, HumanEval, GSM8K ni métricas de calidad de síntesis (MOS) publicados en la información disponible.

## Enlaces

- [Hugging Face: Kremon96/moss-tts-local-transformer-v1.5-glade](https://huggingface.co/Kremon96/moss-tts-local-transformer-v1.5-glade)
- [Modelo base: OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5)
- [Modelo base: OpenMOSS-Team/MOSS-Audio-Tokenizer-v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2)
- [Conversión anterior: coder543/moss-tts-v1.5-glade](https://huggingface.co/coder543/moss-tts-v1.5-glade)
- [Repositorio de descarga referenciado: coder543/moss-tts-local-transformer-v1.5-glade](https://huggingface.co/coder543/moss-tts-local-transformer-v1.5-glade)
