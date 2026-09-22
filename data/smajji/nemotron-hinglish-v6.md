# smajji/nemotron-hinglish-v6

## Resumen

Nemotron Hinglish v6 es un modelo de reconocimiento automático del habla (ASR) especializado en inglés, hindi y hinglish (conmutación de código hindi-inglés), publicado por el usuario smajji en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, sobre el que conserva la arquitectura FastConformer-Transducer (RNNT) con streaming cache-aware, 24 capas, dimensión oculta de 1024 y aproximadamente 600 millones de parámetros. El modelo parte del checkpoint v5 de la misma serie y continúa el entrenamiento sobre el mismo corpus combinado con una planificación de learning rate de tipo coseno, lo que mejora la convergencia.

El problema que resuelve es concreto: la transcripción fiable de audio con mezcla de hindi e inglés, un fenómeno muy extendido en India (medios de comunicación, atención al cliente, podcasts y Conversaciones cotidianas) y que los modelos ASR monolingües o puramente multilingües tienden a resolver mal. La relevancia actual viene de su naturaleza streaming: admite tamaños de fragmento de 80, 160, 320, 560 y 1120 ms, lo que lo hace apto para subtitulado y asistentes en tiempo real, no solo para transcripción por lotes.

En la versión v6, según la model card, el WER en inglés baja del 4,2 % al 3,7 % y el WER en inglés con acento indio baja del 8,3 % al 5,9 % respecto a v5, manteniendo en 0,0 % el llamado "Devanagari latch" (la tendencia a emitir texto en devanagari para audio en inglés). El WER en hinglish puro sigue siendo alto (27,3 %), lo que sitúa al modelo como una herramienta útil pero todavía no madura para ese caso concreto. El repositorio ocupa 2,6 GB, tiene licencia Apache-2.0 y registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT), streaming cache-aware, submuestreo 8x |
| Parametros totales | ~600 M (24 capas, dimension oculta 1024) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (ASR); ventana de streaming configurable en fragmentos de 80/160/320/560/1120 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en), hindi (hi) y hinglish (conmutacion de codigo; prompt `auto`). El vocabulario base incluye 13088 tokens BPE y 128 prompts de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | no especificado en la model card; el repositorio ocupa 2,6 GB y la carga se realiza con `ASRModel.restore_from`, propio de NeMo |

Datos adicionales: frecuencia de muestreo de 16 kHz mono, pipeline `automatic-speech-recognition`, librería NeMo, modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`, identificador `smajji/nemotron-hinglish-v6`, creado el 22 de septiembre de 2026 según los metadatos de HuggingFace.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder FastConformer (variante de Conformer con submuestreo 8x) acoplado a un decodificador Transducer (RNNT). El modo de operación es streaming cache-aware, es decir, el encoder mantiene cachés de estado entre fragmentos de audio para poder emitir transcripciones de forma incremental sin reprocesar todo el contexto. Los tamaños de fragmento soportados (80, 160, 320, 560 y 1120 ms) permiten intercambiar latencia por precisión. El vocabulario es de 13088 tokens BPE, con 128 prompts de idioma heredados del modelo base, incluido el prompt `auto` de detección automática de idioma, que es el que se emplea para la conmutación de código.

El ajuste fino se realizó sobre el mismo corpus multilingüe que la versión v5: aproximadamente 5030 horas y 2 227 473 enunciados, repartidos en inglés (~1690 h, incluyendo inglés con acento indio), hindi (~1414 h) y hinglish con mezcla de código (~1922 h), complementados con corpus densos en números y símbolos para mejorar la precisión en dígitos y números de teléfono. El entrenamiento usa autodetección de idioma con el prompt `auto` y preserva puntuación y uso de mayúsculas. La novedad de la v6 respecto a la v5 es la continuación del entrenamiento con una planificación de learning rate de tipo coseno, descrita en la model card como "cosne (LR) schedule", que según el autor mejora la convergencia global. No se documentan en la información disponible fases de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Reconocimiento automático del habla en inglés, hindi y audio con conmutación de código hindi-inglés (hinglish).
- Detección automática de idioma mediante el prompt `auto`, sin necesidad de indicar el idioma de entrada.
- Transcripción en modo streaming cache-aware, con fragmentos configurables de 80 a 1120 ms, apto para aplicaciones en tiempo real.
- Transcripción por lotes (`batch_size` configurable) para procesamiento offline.
- Preservación de puntuación y mayúsculas en la salida, según la model card.
- Buen comportamiento con números y símbolos, gracias al corpus específico de dígitos y números de teléfono incluido en el entrenamiento.
- Manejo de inglés con acento indio sin "Devanagari latch": el detector interno de este fenómeno mide 0,0 % en la versión v6.
- No se documentan capacidades de traducción, diarización de hablantes, marcas de tiempo a nivel de palabra ni salida de puntuación alineada temporalmente.

## Casos de uso

- Subtitulado en directo de contenido hinglish: el modelo puede generar subtítulos incrementales con fragmentos de 80 a 320 ms, adecuado para streamers, televisiones y plataformas de vídeo que emiten contenido con mezcla de hindi e inglés, donde los ASR monolingües fallan al cambiar de idioma dentro de la misma frase.
- Atención al cliente en centros de contacto de India: transcripción en tiempo real de llamadas con mezcla de inglés e hindi y alta densidad de números (identificadores de pedido, teléfonos, importes), aprovechando el corpus específico de dígitos del entrenamiento.
- Asistentes de voz embebidos y en el borde: con unos 600 M de parámetros y decodificación streaming, es candidato para transcripción en dispositivos con recursos limitados o en pasarelas locales, sin depender de un servicio en la nube.
- Análisis y minado de conversaciones de ventas o soporte: transcripción por lotes de grabaciones históricas para alimentar sistemas de analítica, control de calidad y búsqueda sobre texto, usando el modo no streaming para maximizar precisión.
- Accesibilidad en vídeo y pódcast: generación de transcripciones y subtítulos para audiencias indias que consumen contenido mixto hindi-inglés, preservando puntuación y mayúsculas para mejorar la legibilidad.
- Dictado y toma de notas en entornos profesionales indios: documentación médica, actas de reunión o notas de campo donde los hablantes alternan términos técnicos en inglés con estructura gramatical en hindi.
- Moderación de contenido en audio generado por usuarios: transcripción rápida de audio subido a plataformas para alimentar clasificadores de contenido, con la ventaja de una latencia de streaming baja.
- Investigación en lingüística computacional sobre code-switching: el modelo y su vocabulario de 13088 BPE con prompts de idioma sirven como punto de partida para estudiar y comparar estrategias de modelado de conmutación de código.

## Benchmarks y rendimiento

Resultados publicados en la model card. Decodificación greedy, WER insensible a puntuación, muestra reservada (held-out) y prompt `auto`:

| Idioma | Nemotron-Hinglish-v5 | Nemotron-Hinglish-v6 |
|---|---|---|
| Ingles | 4,2 % | 3,7 % |
| Hindi | 12,5 % | 12,5 % |
| Hinglish | 28,6 % | 27,3 % |

Inglés con acento indio (200 enunciados reservados, detector de "Devanagari latch"):

| Metrica | Nemotron-Hinglish-v5 | Nemotron-Hinglish-v6 |
|---|---|---|
| Devanagari latch | 0,0 % | 0,0 % |
| WER | 8,3 % | 5,9 % |

No se han publicado en la información disponible resultados de benchmarks estándar comparables (LibriSpeech, Common Voice, Fleurs, MMLU u otros), ni comparaciones con modelos de terceros. Los números anteriores son internos del autor y se basan en muestras reservadas cuyo tamaño no se detalla, salvo en el caso del inglés con acento indio (200 enunciados).

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (~600 M) y no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 1,2 GB; con estados de caché del encoder, buffers de audio y overhead del runtime de NeMo, cabe esperar un consumo en torno a 2-4 GB. En FP32, los pesos suben a unos 2,4 GB y el consumo total rondaría los 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; tarjetas de datacenter como A100, H100, L4 o T4 son suficientes y quedan sobredimensionadas para un solo flujo. Para lotes grandes en producción, una L4 o T4 resulta adecuada.
- Cabe en GPU de consumo: sí. Tarjetas como RTX 3060 (12 GB), RTX 4060, RTX 4090 o incluso iGPU con memoria unificada pueden ejecutar el modelo en FP16, dado su tamaño reducido.
- Opciones de despliegue: la vía documentada es NVIDIA NeMo (`nemo.collections.asr.models.ASRModel.restore_from`). No se documentan en la información disponible rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables directamente a un modelo FastConformer-RNNT. Alternativas habituales para este tipo de modelo serían NVIDIA Riva o Triton con backend de NeMo, aunque no se confirman en la model card.
- Latencia y throughput: no hay mediciones publicadas. La latencia algorítmica del modo streaming está acotada por el tamaño de fragmento elegido (80, 160, 320, 560 o 1120 ms), más el contexto de anticipación del encoder; fragmentos pequeños reducen la latencia a costa de precisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron Hinglish v6 (este modelo) | ~600 M | Streaming cache-aware, fragmentos de 80-1120 ms | en, hi, hinglish | Apache-2.0 | HuggingFace, libreria NeMo |
| nvidia/nemotron-3.5-asr-streaming-0.6b (modelo base) | ~600 M | Streaming cache-aware | Multilingue, 128 prompts de idioma | no disponible en la informacion proporcionada | HuggingFace, libreria NeMo |
| Nemotron-Hinglish-v5 (misma serie) | ~600 M | Streaming cache-aware | en, hi, hinglish | Apache-2.0 (segun esta serie) | HuggingFace |
| Alternativas genericas multilingues tipo Whisper large-v3 | ~1550 M | No streaming nativo (ventanas de 30 s) | Multilingue amplio, hindi incluido | MIT (segun el proyecto original) | HuggingFace, multiples runtimes |

El dato diferencial de este modelo frente al base no es la arquitectura, idéntica, sino el ajuste específico sobre corpus hinglish y la corrección del "Devanagari latch". Frente a alternativas multilingües de propósito general, la ventaja esperable es la latencia en streaming y el comportamiento en code-switching; la desventaja, un WER en hinglish todavía elevado (27,3 %) y una cobertura de idiomas mucho más estrecha. No se dispone de comparaciones directas publicadas con modelos de terceros, por lo que esta tabla es descriptiva y no de rendimiento.

## Limitaciones y advertencias

- WER elevado en hinglish: 27,3 % según la propia model card, lo que implica aproximadamente uno de cada cuatro caracteres o palabras mal transcritos en ese escenario. No es adecuado para usos donde la fidelidad literal sea crítica.
- WER en hindi estancado en 12,5 % entre v5 y v6, sin mejora en esta iteración.
- Cobertura de idiomas muy limitada: solo inglés, hindi y su mezcla. El vocabulario base contiene 128 prompts de idioma, pero este ajuste fino no garantiza un comportamiento correcto en otros idiomas.
- Modelo de la comunidad con 0 descargas y 0 likes en el momento de redactar la ficha: no ha pasado por una validación independiente ni por una revisión amplia de terceros.
- Riesgo de alucinación en ASR: como todo modelo generativo por secuencias, puede producir texto plausible que no corresponde al audio, especialmente con ruido de fondo, solapamiento de hablantes o acentos no representados en el entrenamiento.
- Sesgos potenciales derivados del corpus: predominio de variedades de inglés indio y de hindi de India; el rendimiento puede degradarse con otras variedades dialectales, con hindi de la diáspora o con hablantes no nativos.
- Restricciones de licencia: el ajuste se publica bajo Apache-2.0, pero conviene verificar la licencia del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b` y las condiciones de los corpus de entrenamiento antes de un uso comercial, ya que la model card no detalla la procedencia ni la licencia de los datos.
- Ausencia de funcionalidades habituales en producción: no se documentan marcas de tiempo por palabra, diarización de hablantes, detección de actividad de voz ni segmentación de hablantes.
- Formato de pesos y opciones de cuantización no especificados: dificulta planificar el despliegue sin probar previamente la conversión o exportación.
- Despliegue ligado al ecosistema NeMo: no hay rutas documentadas para runtimes ligeros de inferencia, lo que puede complicar la integración en pilas técnicas ajenas a NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smajji/nemotron-hinglish-v6
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los resultados obtenidos eran artículos en chino sobre gestión de datos personales de empleados, sin relación con el modelo. No se dispone por tanto de papers, blogs, repositorios ni demos adicionales que enlazar.
