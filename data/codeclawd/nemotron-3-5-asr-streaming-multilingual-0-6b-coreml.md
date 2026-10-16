# codeclawd/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML

## Resumen

Nemotron 3.5 ASR Streaming Multilingual 0.6B — CoreML es una conversión a Core ML del modelo de reconocimiento automático de voz `nvidia/nemotron-3.5-asr-streaming-0.6b`, desarrollada por FluidInference y distribuida en HuggingFace por el usuario `codeclawd` como espejo de respaldo del equipo PrivateWispr. El modelo original es de NVIDIA; la conversión optimiza la inferencia para el Apple Neural Engine (ANE) de los chips Apple Silicon, con el objetivo de ejecutar ASR en streaming completamente en dispositivo, sin enviar audio a servidores externos.

Arquitectura y tamaño: encoder Conformer más decodificador RNN-T (RNNT), con aproximadamente 600 millones de parámetros y vocabulario de 13087 tokens (o 2828 en la variante recortada para escritura latina). El repositorio publica ocho bundles que combinan dos variantes de vocabulario (`latin/` y `multilingual/`) con cuatro tamaños de chunk (0,56 s, 1 s, 2 s y 4 s), lo que permite ajustar el compromiso entre latencia y throughput.

Relevancia: cubre ocho idiomas declarados (inglés, español, francés, italiano, portugués, alemán, chino y japonés, más de 100 adicionales vía `prompt_id`) y está cuantizado en precisión mixta, con una reducción del encoder de aproximadamente el 55 % frente a FP16 sin pérdida de WER según el autor. Es una pieza pensada para aplicaciones macOS/iOS que necesiten dictado, subtitulado o transcripción en tiempo real con latencias de 1,25 a 2,5 segundos y sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + decodificador RNN-T (RNNT), streaming |
| Parametros totales | 0,6B (aproximadamente 600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: modelo de streaming por chunks de 0,56 s, 1 s, 2 s o 4 s |
| Tipos de cuantizacion | Precisión mixta LAYERPOS [42,13]: primeras y últimas 3 capas Conformer en INT8, 18 capas centrales en 6 bits palettizado (~55 % de reducción del encoder frente a FP16, descrita como neutra en WER); decodificador y joint fusionados (B1) |
| Idiomas soportados | en, es, fr, it, pt, de, zh, ja (más de 100 idiomas adicionales vía `prompt_id`) |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | Core ML (bundles para Apple Neural Engine), librería `fluidaudio`; repositorio de 2,4 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de ASR en streaming: un encoder Conformer que procesa ventanas de audio y un decodificador RNN-T que emite tokens de forma incremental. La conversión a Core ML no altera los pesos respecto al checkpoint base de NVIDIA, sino que reorganiza el grafo para que el ANE lo ejecute de forma eficiente. La receta aplicada por FluidInference incluye tres elementos: cuantización mixta con `LAYERPOS [42,13]` (capas iniciales y finales en INT8, capas centrales en 6 bits palettizado), fusión de decodificador y joint en un único módulo B1, y un pipeline de tres etapas que solapa la captura de audio, la codificación y el decodificado para mantener el streaming.

La gestión del vocabulario se resuelve con dos variantes. La carpeta `latin/` comparte un joint único podado a 2828 tokens para en/es/fr/it/pt/de: el conjunto conservado se deriva del sistema de escritura (se mantienen todos los tokens latinos y la puntuación y dígitos compartidos, se descartan CJK, hangul, cirílico, árabe, etc.), no de ningún corpus de evaluación, lo que según el autor evita el sobreajuste al conjunto de test y no genera OOV dentro de los idiomas servidos. La carpeta `multilingual/` mantiene el joint completo de 13087 tokens y cubre chino, japonés y el resto de idiomas. El encoder es compartido por todos los idiomas. La conversión se construyó sobre la actualización del checkpoint base del 29 de mayo de 2026. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Reconocimiento de voz en streaming con emisión incremental de tokens (RNN-T), apto para transcripción en tiempo real.
- Transcripción multilingüe en ocho idiomas declarados: inglés, español, francés, italiano, portugués, alemán, chino y japonés.
- Cobertura de más de 100 idiomas adicionales mediante selección por `prompt_id` en la variante `multilingual/`.
- Selección explícita de idioma en inferencia (por ejemplo, `--language de-DE`), con enrutado automático del bundle correspondiente por parte del descargador de FluidAudio.
- Reconocimiento de escritura latina y de escrituras CJK (chino y japonés), con métricas diferenciadas: WER para lenguas latinas y CER para zh/ja.
- Ejecución 100 % en dispositivo sobre el Apple Neural Engine, sin dependencia de red.
- Cuatro configuraciones de latencia intercambiables (0,56 s, 1 s, 2 s y 4 s) para ajustar latencia frente a throughput.
- No se documentan en la información disponible capacidades de diarización de hablantes, puntuación automática, marcas de tiempo a nivel de palabra, tool calling ni razonamiento multimodal.

## Casos de uso

- Subtitulado en directo en aplicaciones macOS/iOS: con el tier de 2 s el modelo produce subtítulos con una latencia aproximada de 2,5 s procesando a 130-150 RTFx en lenguas latinas, suficiente para emisión de vídeo en directo o clases online sin salir del dispositivo.
- Dictado de voz en editores de texto y aplicaciones de productividad: el tier de 1 s (latencia aproximada de 1,25 s, 103-109 RTFx) mantiene la calidad casi intacta y ofrece una experiencia de dictado fluida sobre el ANE sin consumir GPU.
- Transcripción de reuniones con privacidad estricta: al ejecutarse íntegramente en local, el audio de reuniones confidenciales (legal, sanitario, financiero) no abandona el equipo, lo que facilita el cumplimiento de requisitos de protección de datos.
- Notas de voz a texto en aplicaciones móviles: el tamaño de 0,6B y el formato Core ML permiten integrar la transcripción en apps de iPhone/iPad sin backend, cubriendo grabaciones de voz de usuarios en seis idiomas latinos con un único archivo de modelo.
- Atención al cliente y análisis de llamadas: transcripción en streaming de conversaciones en inglés, español, portugués o italiano para generar resúmenes y alimentar sistemas de análisis posteriores, con la ventaja de que el reconocimiento se hace en el puesto del agente.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en aplicaciones de videollamada o consumo de medios, con cobertura de chino y japonés usando el bundle `multilingual/` en el tier de 2 s (CER del 18,57 % y 13,79 % respectivamente).
- Archivado y búsqueda de contenido audiovisual multilingüe: proceso por lotes en modo offline con el tier de 4 s, transcribiendo podcasts, entrevistas o catálogos de vídeo en varios idiomas para indexación y búsqueda textual.
- Transcripción de contenido en chino o japonés en aplicaciones nativas de Apple: los bundles `multilingual/` son los únicos que cubren estas lenguas y deben usarse en el tier de 2 s para evitar el desplome de throughput a 21-27 RTFx que se observa con chunks cortos.

## Benchmarks y rendimiento

Todas las cifras proceden de FLEURS (splits de test completos) y se midieron en un Apple M5 Pro con macOS 26.5, en modo single-stream con batch=1. El formato de cada celda es RTFx (WER para lenguas latinas, CER para chino y japonés). RTFx es el factor de tiempo real: segundos de audio procesados por segundo de reloj.

| Idioma | Bundle | Vocab | 0,56 s | 1 s | 2 s (recomendado) | 4 s |
|---|---|--:|--:|--:|--:|--:|
| Inglés | `latin` | 2828 | 58 (9,43 %) | 103 (8,89 %) | 130 (8,96 %) | 122 (9,02 %) |
| Español | `latin` | 2828 | 58 (4,95 %) | 106 (4,76 %) | 140 (4,80 %) | 136 (4,77 %) |
| Francés | `latin` | 2828 | 57 (9,68 %) | 105 (9,44 %) | 130 (9,52 %) | 124 (9,42 %) |
| Italiano | `latin` | 2828 | 59 (5,68 %) | 109 (5,45 %) | 147 (5,41 %) | 150 (5,40 %) |
| Portugués | `latin` | 2828 | 59 (6,38 %) | 108 (6,11 %) | 141 (6,14 %) | 141 (6,18 %) |
| Alemán | `latin` | 2828 | 59 (10,83 %) | 107 (9,78 %) | 144 (9,83 %) | 142 (9,83 %) |
| Chino | `multilingual` | 13087 | 22 (19,48 % C) | 27 (18,75 % C) | 89 (18,57 % C) | 90 (18,05 % C) |
| Japonés | `multilingual` | 13087 | 21 (14,61 % C) | 26 (13,77 % C) | 84 (13,79 % C) | 89 (13,82 % C) |
| Multilingüe (medido en FLEURS en_us) | `multilingual` | 13087 | 23 (9,15 %) | 71 (8,64 %) | 80 (8,76 %) | 78 (8,78 %) |

Notas metodológicas aportadas por el autor: el tier de 560 ms queda fuera del *tiling* de atención con el que se entrenó el modelo, por lo que degrada tanto throughput como calidad; el modelo de vocabulario completo es sensible al tier porque el producto matricial del joint de 13087 tokens solo encaja de forma eficiente en el working set del ANE con chunks de 2 s. En el tier de 1 s, el throughput depende de la densidad de salida: el texto latino disperso rinde mucho mejor que el CJK denso, que activa el joint grande en más pasos de decodificado. No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos de ASR (MMLU, HumanEval o GSM8K no aplican a un modelo de reconocimiento de voz).

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con Neural Engine (familias M1, M2, M3, M4 y M5). El modelo está convertido a Core ML y no se ejecuta en GPU NVIDIA, AMD ni en CPU x86 convencional sin recompilación.
- Equipo de referencia de las mediciones: Apple M5 Pro con macOS 26.5.
- VRAM: no aplica; en Apple Silicon se usa memoria unificada. No se especifica el consumo de memoria por bundle en la información disponible.
- Tamaño de artefactos: el repositorio completo ocupa 2,4 GB e incluye los ocho bundles (dos vocabularios × cuatro tiers). El tamaño de cada bundle individual no está disponible.
- Opciones de despliegue: la librería FluidAudio con runtime Core ML; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de ASR en formato Core ML.
- Throughput: 130-150 RTFx en los bundles de escritura latina con el tier de 2 s; 84-90 RTFx para chino, japonés y multilingüe en ese mismo tier; 103-109 RTFx en latinos con el tier de 1 s; 21-27 RTFx para vocabulario completo en tiers de 0,56 s y 1 s.
- Latencia: aproximadamente 2,5 s con el tier de 2 s y aproximadamente 1,25 s con el tier de 1 s; el tier de 0,56 s queda por debajo del segundo pero con coste de calidad y throughput.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos ASR alternativos (Whisper, Parakeet u otras conversiones Core ML) en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable. La comparación factible se limita a las variantes internas del propio repositorio y al modelo base:

| Modelo | Parámetros | Streaming | Idiomas | Vocabulario | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo, bundle `latin/` | 0,6B | Sí, chunks de 0,56-4 s | en, es, fr, it, pt, de | 2828 | OpenMDW-1.1 | Core ML (ANE) |
| Este modelo, bundle `multilingual/` | 0,6B | Sí, chunks de 0,56-4 s | en, es, fr, it, pt, de, zh, ja y +100 vía `prompt_id` | 13087 | OpenMDW-1.1 | Core ML (ANE) |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | 0,6B | Sí | Los del checkpoint original | No disponible | OpenMDW-1.1 | No disponible |
| Alternativas externas de ASR | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los WER publicados proceden de FLEURS, un corpus de habla leída relativamente limpia; en audio real con ruido de fondo, solapamiento de hablantes, acentos marcados o micrófonos de baja calidad el error será previsiblemente superior.
- El WER en inglés (8,89-9,02 %) y en francés (9,42-9,52 %) es notablemente más alto que en español (4,76-4,80 %) o italiano (5,40-5,41 %); el rendimiento no es homogéneo entre idiomas.
- El CER en chino (18,05-18,57 %) y japonés (13,77-13,82 %) es elevado en términos absolutos y se mide sobre caracteres, no sobre palabras, por lo que un mismo porcentaje implica una carga de error distinta.
- El modelo es de streaming con chunks de 2 s como configuración recomendada: no es adecuado para escenarios que exijan latencias inferiores a un segundo con calidad máxima.
- El fallback de 0,56 s está explícitamente desaconsejado por el autor para chino, japonés y multilingüe por la caída de throughput a 21-23 RTFx.
- Un único bundle `latin/` sirve a los seis idiomas de escritura latina; es necesario pasar el idioma exacto en inferencia para que el enrutado y el decodificado sean correctos.
- Licencia OpenMDW-1.1: es una licencia propia de NVIDIA/Meta (Open Model Development Workgroup), no una licencia OSI estándar. Debe revisarse el texto en `https://openmdw.ai/license/1-1/` antes de un uso comercial, ya que el tag de HuggingFace figura como `license: other`.
- Este repositorio es un espejo de terceros (`codeclawd` / equipo PrivateWispr) de la conversión original de FluidInference en la revisión `1a41b75758b0337ff67db7d5408280aaaf23074e`; el propio autor indica que los archivos son idénticos byte a byte y que solo se ha añadido la cabecera del README. Conviene verificar la integridad y preferir el repositorio upstream cuando sea posible.
- La model card menciona un control de acceso mediante Discord ("join the server and message Sisyphu"), lo que añade una dependencia operativa ajena a HuggingFace para obtener acceso.
- El modelo no incluye, según la información disponible, funcionalidades de diarización, puntuación automática ni marcas de tiempo, que suelen ser necesarias en transcripción de reuniones o subtitulado profesional.
- Al ser un artefacto Core ML, queda atado al ecosistema Apple: no hay ruta de despliegue documentada en servidores Linux con GPU.
- Fecha de publicación del repositorio: 16 de octubre de 2026; la conversión se basa en la actualización del checkpoint base del 29 de mayo de 2026, por lo que versiones posteriores del modelo base no están reflejadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codeclawd/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio upstream de la conversión (FluidInference): https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Manifiesto con resultados por idioma y por tier: `manifest.json` dentro del repositorio
- Servidor de Discord para solicitud de acceso: https://discord.gg/S6m4ET3pX
- No se han encontrado en la información proporcionada artículos, papers, blogs técnicos ni demos adicionales asociados a este modelo.
