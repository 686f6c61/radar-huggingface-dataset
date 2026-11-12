# FILM6912/OpenThai2.0-ASR-Streaming-GGUF

## Resumen

OpenThai2.0-ASR-Streaming-GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) en streaming `iapp/OpenThai2.0-ASR-Streaming`, desarrollado por iApp Technology. Se trata de un fine-tune al tailandés del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, una arquitectura de tipo `nemotron_asr` orientada a transcripción de baja latencia. La versión GGUF la publica el usuario FILM6912 y está pensada para ejecutarse con [audio.cpp](https://github.com/0xShug0/audio.cpp).

El modelo resuelve la transcripción de voz a texto en tiempo real para tailandés (con soporte de inglés en modo mixto), manteniendo un mecanismo de *lookahead* configurable que permite ajustar el equilibrio entre latencia y precisión. Con unos 640 millones de parámetros y pesos de solo 670 MB en Q4_K, es un candidato realista para despliegue en CPU o GPU modesta en aplicaciones de dictado, subtitulado y asistentes de voz.

La relevancia actual radica en que cubre un idioma con poca cobertura en modelos ASR abiertos de calidad, y lo hace con una licencia OpenMDW-1.1 que permite uso comercial bajo determinadas condiciones. Esta ficha documenta exclusivamente la variante GGUF; no se ha reentrenado el modelo, solo convertido desde el checkpoint `.nemo` original (con `bias-1.0`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_asr` (familia NVIDIA Nemotron ASR, streaming) |
| Parametros totales | 640.432.269 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio en streaming con lookahead de 0, 3, 6 o 13 tokens) |
| Tipos de cuantizacion | F16 (1.2 GB), Q8_0 (891 MB), Q4_K (670 MB) |
| Idiomas soportados | tailandés (th, `th-TH` y `th-mix`), inglés (en, en modo mixto) |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | GGUF (para audio.cpp); origen `.nemo` |

## Arquitectura y entrenamiento

El modelo base es `nvidia/nemotron-3.5-asr-streaming-0.6b`, un sistema ASR de NVIDIA orientado a transcripción en streaming con atención causal y un mecanismo de *lookahead* que permite al modelo "ver" un número limitado de tokens futuros para mejorar la precisión sin sacrificar la naturaleza en tiempo real. La variante OpenThai2.0 es un fine-tune al tailandés realizado por iApp Technology sobre ese checkpoint; no se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento, número de horas de audio, composición del dataset ni técnicas de alineación (RLHF/DPO no aplicables en ASR).

La conversión a GGUF la realiza FILM6912 a partir del fichero `openthai2.0-asr-streaming_bias-1.0.nemo`, sin reentrenamiento, preservando el comportamiento del original: en pruebas cortas, las tres cuantizaciones (F16, Q8_0, Q4_K) producen la misma transcripción que NeMo con `lookahead=6`. El modelo está diseñado específicamente para el runtime audio.cpp, con familia `nemotron_asr` y modo `streaming`.

## Capacidades

- Reconocimiento automático del habla en tailandés en tiempo real (streaming).
- Soporte de inglés en modo mixto (`th-mix`), que conserva palabras inglesas en alfabeto latino.
- Modos de escritura configurables: `th-TH` transcribe todo en caracteres tailandeses; `th-mix` mantiene términos ingleses en latín.
- Control de latencia mediante `lookahead_tokens` (0, 3, 6, 13); el valor 6 corresponde a 560 ms.
- Entrada de audio estandarizada a 16 kHz mono.
- Salida de transcripción a fichero de texto (`--text-out`).
- Ejecución en CPU mediante audio.cpp (`--backend cpu`); no se documentan otros backends en la información disponible.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del reconocimiento de voz.

## Casos de uso

- Subtitulado en directo de contenido en tailandés: el modelo procesa audio en streaming con lookahead de 560 ms, suficiente para generar subtítulos casi en tiempo real en emisiones, webinars o clases grabadas.
- Asistentes de voz para atención al cliente en tailandés: integrado en un pipeline de telefonía VoIP, transcribe al vuelo las intervenciones del usuario para que un LLM posterior genere respuestas.
- Dictado y notas de voz: en dispositivos con CPU modesta, la versión Q4_K (670 MB) permite transcripción local sin GPU, útil para aplicaciones de productividad centradas en usuarios tailandeses.
- Generación de actas y resúmenes de reuniones: transcripción por lotes de grabaciones de 16 kHz, con la variante F16 para máxima fidelidad en entornos de servidor.
- Moderación y análisis de contenido audiovisual: transcripción de archivos para indexación, búsqueda y detección de términos en tailandés.
- Accesibilidad: conversión de voz a texto en aplicaciones para personas con discapacidad auditiva, ejecutándose en local para preservar la privacidad de las conversaciones.
- Investigación lingüística: corpus de transcripciones en tailandés con control del nivel de escritura (`th-TH` vs `th-mix`) para estudios de code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única referencia de calidad es cualitativa: en clips de prueba cortos, las tres cuantizaciones producen la misma transcripción que el modelo NeMo original con `lookahead=6`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de pesos, F16 requiere ~1.2 GB, Q8_0 ~891 MB y Q4_K ~670 MB, más overhead del runtime.
- GPU recomendadas: no disponibles; el autor documenta explícitamente ejecución en CPU (`--backend cpu`).
- Compatibilidad con GPU de consumo: por el tamaño reducido de los pesos, es plausible en cualquier GPU moderna con al menos 2 GB libres, aunque no se confirma en la documentación.
- Opciones de despliegue: audio.cpp (runtime documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: con `lookahead_tokens=6` se reportan 560 ms de retardo, según la nota del autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OpenThai2.0-ASR-Streaming GGUF (este) | ~640 M | streaming, lookahead 0/3/6/13 | th, en (mixto) | OpenMDW-1.1 | GGUF |
| iapp/OpenThai2.0-ASR-Streaming | ~640 M | streaming, lookahead 0/3/6/13 | th, en (mixto) | OpenMDW-1.1 | `.nemo` |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0.6 B | streaming | multilingüe (no detallado) | no disponible | no disponible |

No se dispone en la información proporcionada de benchmarks comparativos ni de alternativas ASR tailandesas equivalentes con las que contrastar numéricamente.

## Limitaciones y advertencias

- Modelo convertido, no reentrenado: hereda sesgos y limitaciones del fine-tune de iApp Technology y del base de NVIDIA; no se documentan sesgos específicos.
- Riesgo de alucinación: en ASR, se manifiesta como transcripciones plausibles pero incorrectas, especialmente en audio ruidoso o con acentos no representados en el corpus de entrenamiento.
- Cobertura lingüística limitada: solo tailandés e inglés en modo mixto; sin soporte documentado para castellano ni otros idiomas.
- Dependencia del runtime: el GGUF está preparado para audio.cpp con familia `nemotron_asr`; no se garantiza compatibilidad con llama.cpp, Ollama u otras herramientas GGUF habituales.
- Audio de entrada: se requiere 16 kHz mono; otras frecuencias o canales necesitan remuestreo previo.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con condiciones; conviene revisar el texto completo antes de uso comercial, ya que no es una licencia permisiva estándar tipo Apache-2.0 o MIT.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria todavía; uso en producción bajo responsabilidad del integrador.
- Fechas del repositorio (2026-11-12) sugieren un lanzamiento muy reciente; pueden aparecer actualizaciones o correcciones.

## Enlaces

- [Hugging Face: FILM6912/OpenThai2.0-ASR-Streaming-GGUF](https://huggingface.co/FILM6912/OpenThai2.0-ASR-Streaming-GGUF)
- [Modelo base: iapp/OpenThai2.0-ASR-Streaming](https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming)
- [Modelo original NVIDIA: nvidia/nemotron-3.5-asr-streaming-0.6b](https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b)
- [Runtime audio.cpp](https://github.com/0xShug0/audio.cpp)
- [Licencia OpenMDW-1.1](https://openmdw.ai/license/1-1/)
