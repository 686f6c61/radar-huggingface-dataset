# onemira/sense-voice-zh-en-ja-ko-yue-onnx

## Resumen

El repositorio `onemira/sense-voice-zh-en-ja-ko-yue-onnx` es un espejo byte a byte del archivo int8 de SenseVoice Small multilingue distribuido por el proyecto `k2-fsa/sherpa-onnx`, empaquetado para su uso con el runtime sherpa-onnx. No se trata de un modelo entrenado por el autor del repositorio (onemira), sino de una redistribucion sin modificaciones del modelo original SenseVoice desarrollado por FunAudioLLM / FunASR (Alibaba Group), con el objetivo de servir como dependencia estable para la transcripcion offline en dispositivo de los grabadores de voz de OneMira.

El modelo subyacente, SenseVoice Small, es un sistema de reconocimiento automatico del habla (ASR) no autorregresivo que cubre cinco idiomas: chino mandarin, ingles, japones, coreano y cantonés. La variante distribuida aqui esta cuantizada a int8, lo que reduce el peso del archivo a aproximadamente 163 MB (0,2 GB en el repositorio), y esta pensada para ejecutarse en CPU sin GPU, lo que lo hace adecuado para dispositivos de borde y aplicaciones de escritorio.

Su relevancia radica en que ofrece una via practica para integrar ASR multilingue de calidad en aplicaciones locales sin dependencia de la nube, con una licencia MIT que facilita su incorporacion en productos comerciales. El repositorio en si no aporta mejoras tecnicas ni pesos nuevos: su valor es la trazabilidad y la verificabilidad mediante hash SHA-256 del archivo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice Small (modelo ASR no autorregresivo de FunAudioLLM / FunASR); empaquetado para sherpa-onnx |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante incluida en este repositorio) |
| Idiomas soportados | zh (mandarin), en, ja, ko, yue (cantonés) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `.tar.bz2` de sherpa-onnx, `sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17.tar.bz2`) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia SenseVoice de FunAudioLLM, disenada para reconocimiento del habla. SenseVoice Small emplea una arquitectura no autorregresiva que predice la secuencia de tokens de forma paralela, lo que reduce la latencia frente a los modelos encoder-decoder autorregresivos clasicos. La distribucion concreta de este repositorio es la version int8 exportada a ONNX y empaquetada por `k2-fsa/sherpa-onnx` para su ejecucion con ese runtime.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado especificas. El repositorio es explicitamente un espejo sin modificaciones: los bytes del archivo coinciden con el original de upstream (SHA-256 `7d1efa2138a65b0b488df37f8b89e3d91a60676e416f515b952358d83dfd347e`, 163.002.883 bytes). Cualquier innovacion tecnica del modelo (por ejemplo, prediccion no autorregresiva y capacidad multilingue en un unico modelo) proviene del trabajo original de FunAudioLLM, no de este repositorio.

## Capacidades

- Reconocimiento automatico del habla (ASR) offline en cinco idiomas: chino mandarin, ingles, japones, coreano y cantonés.
- Transcripcion en dispositivo (on-device) sin necesidad de conexion a la nube, ejecutable sobre CPU mediante sherpa-onnx.
- Inferencia de baja latencia gracias al caracter no autorregresivo del modelo SenseVoice.
- Ejecucion en entornos de borde y aplicaciones de escritorio (macOS, Windows) como las que emplea OneMira en sus grabadores.
- Modelo cuantizado a int8, lo que reduce el consumo de memoria y el tamano del artefacto.
- No se ha documentado en la informacion disponible soporte de tool calling, agentes, vision, audio de entrada mas alla del propio ASR, ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones en local: integrado en una aplicacion de escritorio mediante sherpa-onnx, el modelo transcribe audio de reuniones (Zoom, Teams, Meet) sin enviar el audio a servidores externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Grabadoras de voz con IA: es el motor ASR que OneMira emplea en sus dispositivos C1 para dictado y transcripcion multilingue en el propio dispositivo, evitando suscripciones y dependencia de la nube.
- Subtitulado y actas de voz en cinco idiomas: al cubrir zh, en, ja, ko y yue en un unico modelo, simplifica el despliegue en productos destinados a mercados de Asia Oriental y usuarios multilingues.
- Notas de voz y dictado en movilidad: al ejecutarse en CPU con un artefacto de ~163 MB, puede embeberse en aplicaciones ligeras para transcribir notas de voz sin GPU.
- Procesamiento por lotes de archivos de audio en pipelines locales: util para indexar o archivar grabaciones historicas con un runtime ONNX estable y reproducible (hash verificado).
- Prototipado e investigacion en ASR: como dependencia fija y verificable para reproducir experimentos o comparar pipelines de ASR sin variaciones en los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para la variante int8 empaquetada para sherpa-onnx, disenada para ejecucion en CPU; el consumo de memoria RAM es moderado dado el tamano del artefacto (~163 MB comprimido).
- GPU recomendadas: no requeridas; el runtime sherpa-onnx esta orientado a CPU. No se dispone de datos sobre aceleracion GPU para esta distribucion concreta.
- Cabe en GPU de consumo: si, aunque el caso de uso previsto es CPU; no se aportan cifras de VRAM por cuantizacion.
- Opciones de despliegue: sherpa-onnx (runtime principal para el que esta empaquetado el archivo); el formato ONNX subyacente permite otros runtimes ONNX, aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SenseVoice Small (este mirror, int8) | no disponible | no disponible | zh, en, ja, ko, yue | MIT | ONNX (sherpa-onnx) |
| Whisper (variantes de OpenAI) | no disponible en la informacion | no disponible | multilingue amplio | MIT | no disponible en la informacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos alternativos que permitan una comparacion cuantitativa fiable. La comparativa se limita a la categoria (ASR multilingue offline) y a la licencia permisiva (MIT) compartida con otras familias como Whisper.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no incorpora mejoras, correcciones ni ajustes respecto al original de `k2-fsa/sherpa-onnx`; cualquier problema del modelo upstream se hereda.
- Cobertura linguistica limitada a cinco idiomas (zh, en, ja, ko, yue); no se ha documentado soporte para castellano ni otras lenguas.
- La cuantizacion int8 puede introducir una ligera perdida de precision frente a los pesos en punto flotante; no se aportan metricas de dicha perdida.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o robustez ante ruido, acentos o audio de baja calidad.
- Aunque la licencia es MIT, deben respetarse las condiciones de los componentes upstream (FunAudioLLM / FunASR y sherpa-onnx); el repositorio incluye `NOTICE.txt`, `MODEL_LICENSE` y `LICENSE.sherpa-onnx` que conviene revisar antes de un uso comercial.
- El mirror no implica el respaldo de los autores originales (FunAudioLLM, k2-fsa) por parte de OneMira.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onemira/sense-voice-zh-en-ja-ko-yue-onnx
- Modelo upstream SenseVoice (FunAudioLLM): https://github.com/FunAudioLLM/SenseVoice
- Distribucion original en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17.tar.bz2
- Producto OneMira C1: https://onemira.com/products/c1
- Analisis de grabadoras IA (OneMira, Pocket, Plaud): https://wearemobians.com/2026/11/enregistreurs-ia-onemira-pocket-plaud/
- Demo en video del OneMira C1: https://www.youtube.com/watch?v=LUIqGIipxQs
