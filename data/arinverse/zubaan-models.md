# arinverse/zubaan-models

## Resumen

`arinverse/zubaan-models` no es un modelo de lenguaje entrenado por su autor, sino un repositorio espejo (*mirror*) que aloja copias de modelos de reconocimiento de voz (ASR) de terceros. Arinverse lo publica para que su aplicación Zubaan (https://arinverse.github.io/) pueda descargar los ficheros de voz sin depender de que las cuentas upstream originales sigan disponibles. Segun la model card, los ficheros son copias byte a byte de los originales, salvo el modelo de puntuación, que aparece cuantizado a int8 y marcado como modificado.

El repositorio agrupa ocho componentes: reconocimiento de voz en inglés (Zipformer de k2-fsa icefall), bengalí (Vosk via sherpa-onnx), hindi (IndicConformer de AI4Bharat), español (FastConformer híbrido de NVIDIA), portugués (Citrinet de Neongecko), un conversor de Whisper a GGML, un detector de actividad de voz (Silero VAD) y un modelo de puntuación, capitalización y segmentación multilingüe (47 idiomas). El tamaño total del repo es de 0,8 GB y el pipeline declarado en HuggingFace es "no disponible".

Es relevante para quien necesite una pila de ASR autocontenida, offline y de bajo coste computacional: todos los componentes son modelos pequeños o medianos pensados para ejecutarse en CPU mediante sherpa-onnx o whisper.cpp, no para generación de texto ni razonamiento. La licencia es mixta y cada carpeta arrastra las obligaciones de su licencia original (Apache-2.0, MIT, CC-BY-4.0 y BSD-3-Clause).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Repositorio espejo de modelos ASR de terceros; arquitecturas heterogéneas: Zipformer *streaming* (transducer), IndicConformer, FastConformer híbrido CTC/RNNT, Citrinet (CTC), Whisper *encoder-decoder* Transformer, Silero VAD y modelo de puntuación/capitalización |
| Parámetros totales | no disponible (no declarado por componente) |
| Parámetros activos | no aplicable (ningún componente es MoE) |
| Longitud de contexto | no aplicable en el sentido de LLM; los componentes en/ y bn/ operan en modo *streaming* y el resto procesan segmentos de audio de duración variable |
| Tipos de cuantización | int8 en `es/` (exportado por sherpa-onnx) y en `punctuation/` (modificado); el resto sin cuantización declarada |
| Idiomas soportados | inglés (`en/`), bengalí (`bn/`), hindi (`hi/`), español (`es/`), portugués (`pt/`); Whisper es multilingüe (lista exacta no disponible); puntuación en 47 idiomas |
| Licencia | mixta (`license: other`, `license_name: mixed`): Apache-2.0, MIT, CC-BY-4.0 y BSD-3-Clause según componente |
| Formato de pesos | ONNX (mayoría de carpetas) y GGML (`whisper/`) |
| Tamaño del repositorio | 0,8 GB |
| Componentes | 8 carpetas: `en/`, `bn/`, `hi/`, `es/`, `pt/`, `whisper/`, `shared/`, `punctuation/` |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según HuggingFace) | 2026-10-07 |
| Última actualización (según HuggingFace) | 2026-10-07 |

## Arquitectura y entrenamiento

No hay entrenamiento propio: el autor declara explícitamente que todo el crédito de entrenamiento y conversión corresponde a los autores originales. Lo que sí hay es una labor de empaquetado, espejado y, en un caso, cuantización. Los componentes y sus procedencias declaradas son:

- `en/`: k2-fsa icefall Zipformer, obtenido vía `csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26` (Apache-2.0). Zipformer es una familia de encoders *streaming* para transducer (RNN-T) diseñada para reconocimiento en tiempo real.
- `bn/`: `alphacep/vosk-model-small-streaming-bn`, vía `csukuangfj2/sherpa-onnx-streaming-zipformer-bn-vosk-2026-02-09` (Apache-2.0).
- `hi/`: AI4Bharat IndicConformer, exportación ONNX publicada por OpenVoiceOS (MIT).
- `es/`: `nvidia/stt_es_fastconformer_hybrid_large_pc`, exportado a ONNX y cuantizado a int8 por el proyecto sherpa-onnx (CC-BY-4.0). El nombre indica arquitectura FastConformer con decodificación híbrida (CTC + RNNT) y variante *large*.
- `pt/`: `neongeckocom/stt_pt_citrinet_512_gamma_0_25`, ajustado por NeonGecko a partir de `stt_en_citrinet_512_gamma_0_25` de NVIDIA y exportado a ONNX por OpenVoiceOS (BSD-3-Clause). Citrinet es una arquitectura convolucional CTC con *squeeze-and-excitation*.
- `whisper/`: OpenAI Whisper convertido a GGML por `ggerganov/whisper.cpp` (MIT). No se especifica en la información disponible qué variante de tamaño (tiny/base/small/medium/large) se incluye.
- `shared/`: Silero VAD, obtenido de las releases de `k2-fsa/sherpa-onnx` (MIT).
- `punctuation/`: `1-800-BAD-CODE/punct_cap_seg_47_language`, cuantizado a int8 y marcado como modificado (Apache-2.0).

No se publican en la información disponible detalles de datasets, número de tokens ni procesos de alineación o RLHF/DPO para ningún componente. Tampoco se documentan innovaciones técnicas propias: la única intervención técnica declarada es la exportación a ONNX/GGML y la cuantización int8 de dos componentes.

## Capacidades

- Reconocimiento de voz en inglés en modo *streaming* (Zipformer transducer vía sherpa-onnx).
- Reconocimiento de voz en bengalí en modo *streaming* (modelo Vosk adaptado a sherpa-onnx).
- Reconocimiento de voz en hindi con IndicConformer exportado a ONNX.
- Reconocimiento de voz en español con FastConformer híbrido (CTC + RNNT), en precisión int8.
- Reconocimiento de voz en portugués con Citrinet 512.
- Transcripción multilingüe y traducción de voz a texto en inglés con Whisper (variante no especificada), en formato GGML para whisper.cpp.
- Detección de actividad de voz (VAD) con Silero para segmentar audio y filtrar silencio.
- Puntuación, capitalización y segmentación de texto en 47 idiomas mediante `punct_cap_seg_47_language`.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto libre: no es un modelo de lenguaje.
- No se declaran capacidades de visión, audio generativo ni *thinking mode*.

## Casos de uso

- Transcripción offline en aplicaciones de escritorio y móvil: los modelos ONNX se pueden empaquetar junto a la aplicación y ejecutarse sin conexión mediante sherpa-onnx, evitando dependencias de API en la nube.
- Asistentes de voz para español y portugués: el FastConformer int8 de `es/` y el Citrinet de `pt/` permiten construir dictado o comandos de voz en estos idiomas sobre CPU.
- Subtitulado automático con Whisper: la conversión GGML permite usar whisper.cpp para generar subtítulos en múltiples idiomas y, opcionalmente, traducir a inglés en un solo paso.
- Preprocesado de audio en pipelines de datos: usar Silero VAD de `shared/` para recortar silencios y segmentar grabaciones largas antes de pasarlas a un motor de ASR o a un LLM.
- Post-procesado de transcripciones: `punct_cap_seg_47_language` restaura puntuación, mayúsculas y segmentación en la salida de motores ASR que devuelven texto plano sin formato.
- Atención al cliente y análisis de llamadas: transcripción local de conversaciones en cinco idiomas para búsqueda, resumen o control de calidad, con datos que no salen de la infraestructura propia.
- Aplicaciones de accesibilidad: dictado por voz en tiempo real para personas con dificultades motoras, apoyándose en los modelos *streaming* de inglés y bengalí.
- Contenedores y dispositivos con recursos limitados: al ser modelos pequeños en ONNX/GGML, encajan en entornos sin GPU como Raspberry Pi, mini-PC o funciones serverless con CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye tasas de error (WER/CER), latencias ni comparativas, y no se especifican las variantes exactas de varios componentes (por ejemplo, el tamaño del modelo Whisper incluido).

La búsqueda web asociada a esta ficha no devolvió resultados relevantes: los enlaces recuperados corresponden a páginas de inicio de sesión de Hotmail/Outlook y no guardan relación con el modelo.

## Requisitos de hardware

- VRAM estimada: no disponible por componente. Por el tamaño total del repo (0,8 GB) y el tipo de modelos (ASR ligeros en ONNX/GGML), es razonable esperar ejecución en CPU sin GPU dedicada.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte CUDA/ONNX Runtime o con backend Metal/Vulkan en whisper.cpp puede acelerar la inferencia, pero no se documentan requisitos mínimos.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo moderna e incluso en iGPU, dado el tamaño del repositorio; no se aportan cifras oficiales de consumo de memoria.
- Opciones de despliegue: sherpa-onnx (ONNX Runtime) para `en/`, `bn/`, `hi/`, `es/`, `pt/`, `shared/` y `punctuation/`; whisper.cpp para `whisper/`. Los modelos ONNX también son compatibles con ONNX Runtime directamente. No se declara soporte de vLLM, TGI, Ollama ni TensorRT-LLM, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles. Dependen del componente, del hardware y del modo (streaming frente a por lotes); no se publican cifras.

## Comparativa con modelos similares

| Modelo / proyecto | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arinverse/zubaan-models` | Paquete espejo de varios ASR + VAD + puntuación | en, bn, hi, es, pt, multilingüe (Whisper) | ONNX, GGML | Mixta (Apache-2.0, MIT, CC-BY-4.0, BSD-3-Clause) | HuggingFace, 0 descargas |
| `k2-fsa/sherpa-onnx` | Runtime y catálogo de modelos ASR/TTS | Muy amplio | ONNX | Apache-2.0 (mayoría) | GitHub, ampliamente usado |
| `ggerganov/whisper.cpp` | Implementación de Whisper en C/C++ | Multilingüe | GGML | MIT | GitHub, muy extendido |
| NVIDIA NeMo (`stt_es_fastconformer_hybrid_large_pc`) | Modelo ASR español | es | NeMo/.nemo, ONNX | CC-BY-4.0 | NGC/HuggingFace |

La diferencia principal frente a esos proyectos es que `arinverse/zubaan-models` no aporta modelos nuevos ni un runtime propio: es una copia de conveniencia con fines de disponibilidad para una aplicación concreta.

## Limitaciones y advertencias

- No es un modelo entrenado por Arinverse: no hay garantía de mantenimiento, versionado ni corrección de errores por parte del autor del repositorio.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación ni retroalimentación de la comunidad sobre la integridad de los ficheros.
- Licencia mixta: el uso comercial exige revisar componente por componente. `es/` es CC-BY-4.0 (requiere atribución explícita a NVIDIA y mención de los cambios), `pt/` es BSD-3-Clause (requiere conservar el aviso de copyright), y el resto son Apache-2.0 o MIT. La model card incluye los textos de atribución para `es/` y `pt/`.
- El componente `punctuation/` está modificado (cuantizado a int8), por lo que no es una copia byte a byte y puede degradar la precisión respecto al original.
- Los modelos cuantizados a int8 (`es/` y `punctuation/`) pueden presentar mayor tasa de error que sus versiones en fp32/fp16; no se publican métricas que permitan cuantificar la pérdida.
- Riesgo de alucinación: los modelos ASR, y en particular Whisper, pueden generar texto plausible que no corresponde al audio, especialmente con ruido, silencios largos o audio fuera de dominio. Se recomienda usar el VAD de `shared/` para filtrar silencio y validar la salida en producción.
- Cobertura de idiomas limitada: solo hay modelos dedicados para inglés, bengalí, hindi, español y portugués, más el multilingüe de Whisper. No se declara el conjunto exacto de idiomas de Whisper ni la calidad por idioma.
- No se especifica qué variante (tamaño) de Whisper se incluye, lo que impide estimar con precisión calidad, latencia y huella de memoria.
- No hay datos de entrenamiento, evaluación ni sesgos publicados en el repositorio; no se puede auditar el comportamiento por subgrupos demográficos o acentos.
- Las fechas de creación y actualización que reporta HuggingFace (2026-10-07) son posteriores a la fecha actual, lo que supone una anomalía de metadatos que conviene verificar antes de depender del repositorio.
- Si se redistribuye el paquete, hay que replicar las atribuciones y avisos de licencia de cada componente; el autor no cede ningún derecho adicional sobre los modelos de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/arinverse/zubaan-models
- Aplicación Zubaan (Arinverse): https://arinverse.github.io/
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Origen `en/`: `csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26` (HuggingFace), basado en k2-fsa icefall
- Origen `bn/`: `csukuangfj2/sherpa-onnx-streaming-zipformer-bn-vosk-2026-02-09` (HuggingFace), basado en `alphacep/vosk-model-small-streaming-bn`
- Origen `hi/`: `OpenVoiceOS/ai4bharat-indicconformer-hi-onnx` (HuggingFace), basado en AI4Bharat IndicConformer
- Origen `es/`: `nvidia/stt_es_fastconformer_hybrid_large_pc` (HuggingFace / NVIDIA NGC)
- Origen `pt/`: `neongeckocom/stt_pt_citrinet_512_gamma_0_25` (HuggingFace)
- Origen `whisper/`: OpenAI Whisper y `ggerganov/whisper.cpp`
- Origen `shared/`: `k2-fsa/sherpa-onnx` (releases, Silero VAD)
- Origen `punctuation/`: `1-800-BAD-CODE/punct_cap_seg_47_language` (HuggingFace)
- Resultados de búsqueda web: sin enlaces relevantes; los resultados recuperados correspondían a páginas de inicio de sesión de Hotmail/Outlook y no se han incluido.
