# CKermit/nomo-pvad-onnx

## Resumen

Nomo pVAD 1.1 para ONNX Runtime es una conversión comunitaria del modelo de detección de actividad de voz personalizada (personalized VAD o target-speaker VAD) desarrollado por Tuya. A diferencia de un VAD clásico, que solo distingue voz de silencio, este sistema responde a una pregunta más específica: si un hablante concreto, previamente enrolado, está hablando en un flujo de audio. Para ello combina dos grafos ONNX: un modelo de embeddings de hablante basado en ERes2NetV2 (procedente del proyecto 3D-Speaker) y un modelo de puntuación derivado del checkpoint Nomo pVAD 1.1 de Tuya.

La relevancia práctica está en el procesamiento de audio en streaming con requisitos estrictos de latencia y privacidad: el bundle funciona íntegramente en local sobre ONNX Runtime, procesa audio mono a 16 kHz y emite una probabilidad cada bloque de 160 ms usando una ventana de hasta 2,4 segundos de contexto acústico. El paquete ocupa aproximadamente 0,1 GB, lo que lo hace desplegable en CPU sin GPU dedicada.

La conversión no introduce entrenamiento adicional: reutiliza los checkpoints publicados y los exporta a opset 17 de ONNX. Está pensada para integrarse en HerLive, aunque el script de ejemplo permite ejecutarla de forma independiente con Python 3.11+, NumPy y ONNX Runtime. La licencia del bundle es Apache-2.0, con avisos de terceros retenidos para los componentes upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos grafos ONNX: `embed.onnx` (backbone ERes2NetV2 para embeddings de hablante) y `score.onnx` (ERes2NetV2 afinado por Tuya para puntuación de actividad del hablante objetivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de hasta 15 bloques completos de 160 ms (2,4 s); 16 a 240 frames de features en múltiplos de 16 |
| Tipos de cuantizacion | no disponible (el bundle se distribuye como grafos ONNX en float32) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 (con avisos de terceros de Tuya y 3D-Speaker) |
| Formato de pesos | ONNX (opset 17), float32, batch size 1, número dinámico de frames |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas encadenadas. La primera, `embed.onnx`, recibe features fbank de 80 bins con forma `[1, frames, 80]` y produce un embedding de hablante normalizado de 192 dimensiones (`[1, 192]`). Este grafo proviene del checkpoint completo `pretrained_eres2netv2.ckpt` publicado por el proyecto 3D-Speaker (ModelScope, `iic/speech_eres2netv2_sv_zh-cn_16k-common`). La segunda etapa, `score.onnx`, toma ese embedding junto con una ventana reciente de features fbank y devuelve una probabilidad en `[0, 1]` para el último bloque de 160 ms. Este grafo se deriva del checkpoint `weights/nomo_pvad.pt` de Tuya en el commit `cb828468d183424fd574984f00b3ffbcce0be9bc`, que incluye un backbone ERes2NetV2 afinado por Tuya.

El pipeline de inferencia calcula el embedding de enrolamiento una sola vez por referencia de voz y, a continuación, cada 160 ms evalúa hasta los 15 bloques completos más recientes (2,4 s). El front-end de puntuación añade dos frames de features a cero por la derecha, generando entre 16 y 240 frames en múltiplos de 16. La extracción de features (log filterbank de 80 bins) se realiza sobre PCM16 mono a 16 kHz antes de entrar en ONNX Runtime. No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el autor indica explícitamente que la exportación usa los checkpoints publicados sin entrenamiento adicional.

## Capacidades

- Detección de actividad de voz personalizada: puntúa si un hablante enrolado concreto está activo en un flujo de audio, no solo si hay voz.
- Enrolamiento de hablante: genera un embedding de 192 dimensiones a partir de una muestra de referencia de voz consentida.
- Procesamiento en streaming: emite una puntuación por cada bloque completo de 160 ms con una ventana deslizante de hasta 2,4 s.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Soporte de audio mono a 16 kHz en formato PCM16 WAV en el script de ejemplo.
- Idiomas declarados: chino (zh) e inglés (en).
- Integración con HerLive mediante configuración TOML (`provider = "nomo_pvad"` y `model_dir`).
- Verificación de integridad del bundle mediante `manifest.json` y `SHA256SUMS`.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Filtrado de hablante en reuniones y transcripción: el sistema permite transcribir o procesar solo los segmentos en los que habla una persona enrolada, descartando al resto de participantes y el ruido de fondo, con una latencia de bloque de 160 ms.
- Asistentes de voz con activación por hablante: en un dispositivo doméstico compartido, se enrola al usuario principal y el asistente solo responde cuando detecta su voz, reduciendo activaciones falsas por conversaciones ajenas.
- Diarización ligera en pipelines de audio: combinado con un ASR, permite etiquetar qué fragmentos corresponden al hablante objetivo sin necesidad de un sistema completo de diarización.
- Moderación y análisis de grabaciones: procesamiento por lotes de archivos WAV para localizar la actividad de un hablante concreto en entrevistas, pódcast o material de archivo.
- Telefonía y atención al cliente: verificación de que el agente o el cliente enrolado sigue activo en la llamada, útil para métricas de participación y detección de silencios prolongados.
- Herramientas de accesibilidad: activación de subtitulado o comandos de voz únicamente para la persona configurada, ejecutándose en local para preservar la privacidad del audio.
- Investigación en procesamiento de habla: banco de pruebas reproducible en ONNX para experimentar con VAD personalizado sin depender de frameworks de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso habitual; el bundle está diseñado para ejecutarse en CPU con ONNX Runtime. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que sugiere un consumo de memoria moderado, aunque no se detalla la cifra exacta.
- GPU recomendadas: no disponibles; el autor verificó el ejemplo en CPU de macOS con ONNX Runtime 1.28.0.
- Compatibilidad con GPU de consumo: no documentada. Al ser un modelo pequeño de audio, es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime (verificado con la versión 1.28.0), script Python incluido (`nomo_pvad_onnx.py`) e integración con HerLive. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: la granularidad de salida es de un bloque de 160 ms; no se publican cifras de latencia extremo a extremo ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nomo pVAD 1.1 ONNX (este) | VAD personalizado (target-speaker) | Hasta 2,4 s de audio por puntuación, bloques de 160 ms | zh, en | Apache-2.0 | Hugging Face (CKermit/nomo-pvad-onnx) |
| Tuya Nomo pVAD 1.1 (original) | VAD personalizado | No disponible en la información proporcionada | No disponible | Ver licencia del checkpoint de Tuya | Hugging Face (TuyaNomo/nomo-pvad) |
| 3D-Speaker ERes2NetV2 | Embedding de hablante (reconocimiento de hablante) | No aplica (modelo de embedding) | zh, en | Ver licencia de ModelScope | ModelScope (iic/speech_eres2netv2_sv_zh-cn_16k-common) |
| VAD genéricos (p. ej. Silero VAD) | VAD clásico (voz/no voz) | No disponible | No disponible | No disponible | No disponible |

La comparación directa con VAD genéricos no es equivalente: este modelo añade la dimensión de identidad del hablante, lo que exige enrolamiento previo y lo hace adecuado para escenarios de activación por persona.

## Limitaciones y advertencias

- La puntuación describe actividad de voz para una referencia concreta y no es apta para autenticación de identidad; el propio autor lo advierte en la model card.
- Requiere una muestra de voz consentida del hablante para el enrolamiento; el uso sin consentimiento plantea problemas éticos y legales.
- Solo se declaran los idiomas zh y en; el rendimiento en otros idiomas no está documentado.
- No se publican métricas de precisión, recall, tasa de falsos positivos ni robustez frente a ruido, solapamiento de hablantes o cambio de canal.
- La ventana de contexto es corta (hasta 2,4 s), lo que puede limitar la detección en habla entrecortada o con pausas largas.
- El bundle es una conversión comunitaria, no oficial de Tuya; la responsabilidad de validación en producción recae en el integrador.
- La licencia Apache-2.0 aplica al bundle ONNX, pero los componentes upstream (checkpoint de Tuya y ERes2NetV2 de 3D-Speaker) tienen sus propias licencias y avisos que deben revisarse antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se documentan procesos de mitigación de sesgos acústicos (edad, género, acento, calidad de micrófono).

## Enlaces

- Hugging Face del bundle: https://huggingface.co/CKermit/nomo-pvad-onnx
- Modelo original de Tuya: https://huggingface.co/TuyaNomo/nomo-pvad
- Limitaciones del modelo original: https://huggingface.co/TuyaNomo/nomo-pvad#intended-use-and-limitations
- Repositorio GitHub de Tuya (checkpoint y ejemplos): https://github.com/tuya/nomo-pvad/tree/cb828468d183424fd574984f00b3ffbcce0be9bc
- Licencia del checkpoint de Tuya: https://github.com/tuya/nomo-pvad/blob/cb828468d183424fd574984f00b3ffbcce0be9bc/weights/WEIGHTS_LICENSE.md
- Proyecto 3D-Speaker: https://github.com/modelscope/3D-Speaker
- Checkpoint ERes2NetV2 en ModelScope: https://www.modelscope.cn/models/iic/speech_eres2netv2_sv_zh-cn_16k-common
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
