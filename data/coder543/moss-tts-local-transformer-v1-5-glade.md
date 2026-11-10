# coder543/moss-tts-local-transformer-v1.5-glade

## Resumen

MOSS-TTS Local Transformer v1.5 for Glade es una conversión híbrida del modelo de síntesis de voz MOSS-TTS Local Transformer v1.5, desarrollado originalmente por OpenMOSS-Team, junto con el tokenizador de audio MOSS Audio Tokenizer v2. Esta versión, publicada por coder543, reempaqueta ambos componentes para su ejecución nativa en Apple Silicon mediante Swift MLX (GPU) y Core AI (ANE), con un enfoque claro en despliegue local en macOS e iOS.

El modelo combina un transformer de lenguaje de aproximadamente 4.550 millones de parámetros que se ejecuta en GPU mediante Swift MLX, con veintitrés grupos de códecs Core AI que renderizan audio estéreo nativo a 48 kHz en la Neural Engine. Acepta texto ordinario con etiquetas de idioma, marcado de pausas y controles IPA, y conserva la arquitectura multilingüe de 31 idiomas del modelo original. No se ha realizado entrenamiento adicional: la conversión es puramente de formato y cuantización.

La relevancia de esta ficha radica en que ejemplifica un patrón de despliegue de TTS de alta fidelidad en hardware de consumo Apple, con métricas medidas de rendimiento (RTFx de 1,02× con un carril y 1,63× con dos en un M3 MacBook Air de 16 GB). Es un artefacto de conversión, no un modelo nuevo, y su calidad multilingüe general no está establecida según el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje (MOSS-TTS Local Transformer) + códec de audio Core AI en 23 grupos; conversión híbrida MLX/ANE |
| Parametros totales | ~4.550 millones (modelo de lenguaje); códec con 92 capas transformer |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (límite de generación de 5.000 posiciones más posiciones de prompt) |
| Tipos de cuantizacion | Matrices globales en 4 bits con grupos afines de 64; transformer local, embeddings de audio y cabezas atadas en FP16; códec en FP16 con codebooks y proyecciones de frontera en FP32 |
| Idiomas soportados | 31 idiomas: zh, yue, en, ar, cs, da, de, nl, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Core AI), FP16/FP32; configuración y tokenizador en directorio `language/`; pesos mapeados (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de lenguaje autorregresivo de aproximadamente 4.550 millones de parámetros que genera tokens de audio, combinado con un tokenizador de audio (MOSS Audio Tokenizer v2) que decodifica dichos tokens a forma de onda. El códec consta de 23 grupos Core AI con 92 capas transformer y produce audio estéreo nativo a 48 kHz en la Neural Engine. El modelo de lenguaje necesita doce pasadas secuenciales del transformer local por cada trama de 80 ms. La conversión no incluye entrenamiento adicional: se aplica cuantización de 4 bits a las matrices globales y se preserva FP16 en el transformer local, embeddings de audio y cabezas atadas.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta conversión. El modelo original de OpenMOSS-Team conserva su arquitectura de 31 idiomas, pero las mediciones de control de síntesis presentadas corresponden únicamente al inglés. La innovación técnica destacable es el reparto híbrido: el modelo de lenguaje corre en GPU vía Swift MLX y el códec se ejecuta en ANE, con decodificación por fases que libera los pesos del lenguaje durante el renderizado de la forma de onda conservando el estado KV de cada secuencia.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con salida estéreo nativa a 48 kHz.
- Soporte de etiquetas de idioma del modelo original y de 31 idiomas en la arquitectura.
- Control de pausas mediante marcado específico y controles IPA para pronunciación.
- Codificación opcional de voz de referencia mediante el codificador de voz FP32 (voice-encoder), permitiendo clonación de voz con caché de condicionamiento de doce codebooks.
- Generación por lotes offline con retirada de carriles y salida ordenada por fuente.
- Entrega de audio incremental en línea (un carril de generación).
- Ejecución por fases con liberación de pesos del lenguaje durante el renderizado.
- Alineación MFA opcional para texto hablado ordinario (requiere `TTSRequest.spokenText` explícito para pausas o IPA).
- Sin soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo TTS, no un LLM conversacional.

## Casos de uso

- Audiolibros y narración local en macOS/iOS: el modelo sintetiza voz estéreo a 48 kHz en un M3 MacBook Air con 16 GB, permitiendo generar capítulos completos sin conexión a servicios en la nube.
- Asistentes de voz embebidos en aplicaciones iOS: la entrega incremental en línea genera el primer paquete de 1,28 segundos tras 1,45 segundos, adecuado para respuestas habladas de baja latencia en dispositivos Apple.
- Doblaje y localización multilingüe: la arquitectura soporta 31 idiomas, lo que permite generar pistas de voz en distintos idiomas desde un mismo pipeline, aunque la calidad multilingüe general no está establecida.
- Clonación de voz para accesibilidad: el codificador de voz opcional importa una referencia de audio y cachea su condicionamiento de doce codebooks para reutilizarlo en peticiones futuras, útil en lectores de pantalla personalizados.
- Generación por lotes de avisos y locuciones: el backend Swift soporta batching offline acotado con retirada de carriles y salida ordenada, adecuado para producir grandes volúmenes de locuciones en un servidor Mac.
- Prototipado de control de pronunciación: los controles IPA y el marcado de pausas permiten ajustar la dicción en aplicaciones educativas o de aprendizaje de idiomas.
- Investigación en TTS sobre Apple Silicon: las métricas de RTFx y los controles de códec permiten evaluar el reparto GPU/ANE en cargas de síntesis reales.

## Benchmarks y rendimiento

Mediciones del autor en un M3 MacBook Air de 16 GB con macOS 27.0.1 y runtime Swift Release (preparación y escritura de WAV excluidas de la inferencia):

| Configuración | Audio generado | Generación | RTFx |
|---|---:|---:|---:|
| 1 carril activo | 17,12 s | 16,84 s | 1,02× |
| 2 carriles activos | 13,60 s | 8,32 s | 1,63× |

Comparativa con la conversión anterior MOSS-TTS-v1.5 Glade (mismo procedimiento):

| Modelo | 1 carril | 2 carriles | Salida |
|---|---:|---:|---|
| MOSS-TTS Local Transformer v1.5 Glade | 1,02× | 1,63× | 48 kHz estéreo |
| MOSS-TTS-v1.5 Glade | 1,07× | 1,89× | 24 kHz mono |

Control solo de códec (decodifica códigos idénticos a 7,2 s de audio):

| Implementación | Tiempo | RTFx |
|---|---:|---:|
| Códec ANE con proyección dividida (publicado) | 1,25 s | 5,76× |
| Control GPU con proyección directa | 1,59 s | 4,53× |

Entrega incremental residente: 8,56 s de audio en 8,02 s (1,07×), primer paquete de 1,28 s tras 1,45 s. Conmutación de fases cada 2,56 s: 8,78 s (0,98×), primer audio tras 2,67 s. Ambas producen PCM idéntico bit a bit. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repo ocupa 8,9 GB; el modelo de lenguaje de ~4,55B en 4 bits más códec FP16 y codificador de voz FP32 requiere un espacio de trabajo que el autor cualifica en un equipo de 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series). Las mediciones se realizaron en un M3 MacBook Air de 16 GB; no hay datos para A100, H100 ni RTX 4090, ya que el runtime es Swift MLX/Core AI para macOS e iOS.
- Cabe en GPU de consumo: sí, en Apple Silicon con 16 GB de memoria unificada según la medición del autor; no se dispone de datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: runtime Swift propietario `GladeMOSS` (producto que consume los directorios `language/` y `codec/` mediante `MOSSLocalModelBundle` y `MOSSLocalSynthesizer`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTFx de 1,02× con un carril y 1,63× con dos; primer audio en 1,45 s (residente) o 2,67 s (por fases); el códec ANE decodifica a 5,76×.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-TTS Local Transformer v1.5 Glade (esta ficha) | ~4,55B | no disponible (límite 5.000 posiciones) | 48 kHz estéreo | Apache 2.0 | Hugging Face, runtime Swift para macOS/iOS |
| MOSS-TTS-v1.5 Glade | no disponible | no disponible | 24 kHz mono | Apache 2.0 | Hugging Face |
| MOSS-TTS Local Transformer v1.5 (original) | ~4,55B (según conversión) | no disponible | no disponible | no disponible en la información | Hugging Face (OpenMOSS-Team) |

El modelo original y la conversión previa son las únicas alternativas documentadas en la información disponible; no se dispone de datos de benchmarks comparativos entre ellos más allá de los RTFx de la tabla anterior.

## Limitaciones y advertencias

- La calidad multilingüe general no está establecida: los controles de síntesis medidos son únicamente en inglés.
- No incluye grabación de voz de referencia; el codificador de voz es opcional y no se necesita para síntesis sin referencia.
- El planificador apunta a cinco minutos por unidad de texto con un límite duro de 5.000 posiciones de generación, más las posiciones de prompt.
- Los desbordamientos offline reintentan con nueva semilla y luego dividen la entrada sin devolver un sufijo inacabado como habla completa; los desbordamientos en línea reportan error y no hay recuperación automática de prefijo MFA implementada.
- La alineación MFA opcional requiere texto hablado ordinario; las pausas o controles IPA necesitan `TTSRequest.spokenText` explícito y deben caber en una unidad de síntesis por petición.
- Los archivos mapeados deben permanecer sin cambios mientras estén cargados, y el mapeo no elimina su conjunto de trabajo en memoria.
- La ejecución residente no solapa el cómputo de las etapas de lenguaje y códec.
- La entrega en línea usa un solo carril de generación.
- No se han documentado sesgos específicos ni tasas de alucinación en la información disponible; al ser un modelo TTS, el riesgo principal es la generación de prosodia o pronunciación incorrecta, no la alucinación de hechos.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.
- Es un artefacto de conversión sin entrenamiento adicional; los cambios de cuantización pueden alterar la duración de salida por redondeo FP16 y muestreo estocástico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/moss-tts-local-transformer-v1.5-glade
- Modelo base (lenguaje): https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5
- Modelo base (tokenizador de audio): https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Conversión previa MOSS-TTS-v1.5 Glade: https://huggingface.co/coder543/moss-tts-v1.5-glade
