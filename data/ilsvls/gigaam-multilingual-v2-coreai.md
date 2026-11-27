# ilsvls/gigaam-multilingual-v2-coreai

## Resumen

GigaAM Multilingual-v2 Core AI FP16 es una conversión del checkpoint RNNT (Recurrent Neural Network Transducer) de ai-sage/GigaAM-Multilingual-v2 al formato Core AI de Apple, optimizada para ejecutarse en Apple Silicon (CPU, GPU y Neural Engine). El paquete incluye el encoder, las cabezas RNNT raw y e2e, el tokenizador, el extractor de features y el módulo VAD, todo en FP16 y con un tamaño total de 3,12 GB. No hay reentrenamiento: la conversión parte del modelo original y adapta el grafo de atención para su especialización en el Apple Neural Engine.

El modelo resuelve reconocimiento automático del habla (ASR) multilingüe en local, sin depender de servicios en la nube, sobre hardware Apple. Cubre 21 idiomas, entre ellos ruso, inglés, kazajo, kirguís, uzbeco, bielorruso, francés, español, alemán, italiano, neerlandés, polaco, portugués y varias lenguas túrquicas y caucásicas. Es relevante para desarrolladores que necesitan dictado o transcripción offline en macOS con latencia baja y control total de los datos.

La ficha se centra en la conversión publicada por ilsvls; los detalles de arquitectura y entrenamiento del modelo subyacente corresponden al trabajo original del equipo GigaAM de ai-sage, del que esta conversión hereda pesos y tokenizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (transducer) con encoder y cabezas raw/e2e; grafo de atención adaptado para Apple Neural Engine |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (perfil de 1024 y 3072 frames mel) |
| Tipos de cuantizacion | FP16 (conversión publicada); otras cuantizaciones no disponibles |
| Idiomas soportados | ru, en, kk, ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt |
| Licencia | MIT |
| Formato de pesos | Core AI (Core ML/Core AI package para Apple Silicon); no safetensors ni GGUF |
| Tamano del repositorio | 3,1 GB |
| Hardware objetivo | Apple Silicon (ANE, GPU, CPU) |
| Revision upstream | c21483b5e185ff32f6fb2e2c801f92f4e7fbfee8 |

## Arquitectura y entrenamiento

El modelo base es un RNNT (transducer) de reconocimiento de voz: un encoder que procesa frames mel (perfiles de 1024 y 3072 frames) y cabezas de predicción conjunta que emiten tokens de forma incremental, lo que permite transcripción en streaming con timestamps. La conversión mantiene esa topología, pasa los pesos a FP16 y ajusta el lowering del grafo de atención para que el Apple Neural Engine pueda especializar las operaciones. El paquete incluye además el tokenizador, la extracción de features y un módulo VAD para segmentar audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original dentro de la información proporcionada. La conversión no introduce reentrenamiento; cualquier innovación de entrenamiento pertenece al checkpoint upstream de ai-sage.

## Capacidades

- Reconocimiento automático del habla multilingüe en 21 idiomas, con foco en ruso e inglés y cobertura de lenguas túrquicas, caucásicas y europeas.
- Transcripción con timestamps: la model card indica que todas las pruebas devolvieron timestamps válidos.
- Salida RNNT incremental, adecuada para dictado y streaming.
- Detección de actividad de voz (VAD) incluida en el paquete para segmentar grabaciones largas.
- Ejecución completamente local en Apple Silicon, sin llamadas a servicios externos.
- Tokenizador y extractor de features incluidos, lo que simplifica la integración en aplicaciones nativas.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Dictado por voz en macOS: integración en una app nativa que use el runtime GigaAM para transcribir en tiempo real con el ANE, aprovechando el perfil de frames mel y el VAD para cortar frases.
- Transcripción offline de reuniones: procesar grabaciones de hasta una hora con el perfil de 3072 frames y obtener timestamps por segmento; la prueba del autor sobre cinco grabaciones de unos 63 minutos es un escenario representativo.
- Subtitulado local de vídeo: generar subtítulos con marcas temporales sin subir audio a la nube, útil en entornos con requisitos de privacidad.
- Aplicaciones de accesibilidad: dictado y control por voz en el dispositivo para usuarios con movilidad reducida, con latencia baja al ejecutarse en hardware local.
- Procesamiento de audio multilingüe en estudios de investigación: transcripción de corpus en ruso, kazajo, uzbeco, español o alemán con un único modelo y licencia MIT.
- Automatización de notas clínicas o legales en dispositivos Apple: transcripción local de entrevistas con VAD para separar turnos y timestamps para revisión posterior.
- Integración en pipelines de datos: uso del paquete Core AI como paso de ASR en flujos que ya corren en Macs con Apple Silicon, evitando costes de API.

## Benchmarks y rendimiento

Los únicos datos publicados son pruebas locales del autor de la conversión, no benchmarks oficiales.

| Prueba | Condiciones | WER |
|---|---|---|
| 272 clips cortos de voz | M3 Pro, macOS 27.2.1 | 9,26 % |
| 5 grabaciones completas (~63 min) | M3 Pro, macOS 27.2.1 | 16,29 % |

No se han publicado resultados de benchmarks estándar (MLS, Common Voice, FLEURS, etc.) en la información disponible.

## Requisitos de hardware

- VRAM equivalente: el paquete ocupa 3,12 GB en FP16; en Apple Silicon comparte memoria unificada, por lo que se recomienda un equipo con al menos 8 GB de RAM unificada y margen para el runtime.
- GPU recomendadas: Apple Silicon con Neural Engine (M1 en adelante); el autor probó en M3 Pro.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPU NVIDIA ni AMD.
- Despliegue: requiere un runtime nativo GigaAM compatible con el formato Core AI; no se soportan vLLM, llama.cpp, Ollama ni TGI. Consultar FORMAT.md y release.json del repositorio.
- Latencia y throughput: no disponibles; solo se documenta el WER de las pruebas locales.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM Multilingual-v2 Core AI FP16 (esta conversión) | RNNT, Core AI | 21 | perfiles de 1024/3072 frames mel | MIT | Hugging Face, requiere runtime GigaAM |
| GigaAM Multilingual-v2 (upstream) | RNNT | 21 | no disponible | MIT | Hugging Face |
| GigaAM Multilingual-v2 Core ML (ilsvls) | RNNT, Core ML | 21 | no disponible | MIT | Hugging Face |
| Whisper (variantes multilingües) | Transformer encoder-decoder | ~99 | 30 s por ventana | MIT | Hugging Face, múltiples runtimes |

La comparación con Whisper es orientativa por categoría (ASR multilingüe); no se dispone de cifras comparativas de WER en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con un runtime GigaAM nativo; no es portable a otros entornos sin reconversión.
- Los WER publicados (9,26 % y 16,29 %) son pruebas locales del autor, no un benchmark oficial; el rendimiento puede variar según dominio, acentos y calidad de audio.
- Cobertura desigual entre los 21 idiomas: el modelo original está orientado al ruso y al inglés, por lo que el rendimiento en lenguas con menos datos puede ser inferior.
- Riesgo de alucinación y errores en nombres propios, siglas, números y audio con ruido o solapamiento de hablantes.
- Licencia MIT permite uso comercial, pero se debe conservar la atribución al equipo GigaAM y verificar los checksums del manifiesto SHA-256 antes de desplegar.
- Requiere descargar el repositorio en una revisión fijada; cambios en el runtime o en el formato pueden romper la compatibilidad.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreai
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual-v2
- Conversión Core ML: https://huggingface.co/ilsvls/gigaam-multilingual-v2-coreml
- Conversión v4 Core ML: https://huggingface.co/ilsvls/gigaam-v4-coreml
- Conversión v4 Core AI: https://huggingface.co/ilsvls/gigaam-v4-coreai
- FORMAT.md y release.json: incluidos en el repositorio de la conversión
