# frankmorales2020/topo-voxtral-unesco-audio

## Resumen

`frankmorales2020/topo-voxtral-unesco-audio` es un modelo de reconocimiento automático de voz (ASR) desarrollado por frankmorales2020, que parte del modelo base `mistralai/Voxtral-Mini-4B-Realtime-2602` y lo ajusta finamente sobre un dataset de UNESCO. El modelo está orientado a la transcripción de audio en tiempo real y se enmarca dentro de la iniciativa TOPO-2026, que busca promover una inteligencia artificial soberana y resiliente. Su principal innovación técnica es el uso del framework `h2e-framework` y técnicas de *continual learning* para mitigar el olvido catastrófico durante el entrenamiento secuencial.

El modelo se presenta como un *fine-tune* de 4 mil millones de parámetros (según el nombre del modelo base), y está diseñado para el pipeline `automatic-speech-recognition` de HuggingFace. No se dispone de información detallada sobre la arquitectura interna, la longitud de contexto ni los datos de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: `mistralai/Voxtral-Mini-4B-Realtime-2602`) |
| Parametros totales | 4B (según nombre del modelo base; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según tags del repositorio; el campo de idiomas en HuggingFace figura como no disponible) |
| Licencia | Apache 2.0 (según tags del repositorio; el campo de licencia en HuggingFace figura como no disponible) |
| Formato de pesos | No disponible (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* de `mistralai/Voxtral-Mini-4B-Realtime-2602`, un modelo de ASR de Mistral AI. El entrenamiento se realiza sobre un dataset de la UNESCO, con un enfoque explícito en *continual learning* para evitar el olvido catastrófico, tal y como indican los tags `continual-learning` y `catastrophic-forgetting`. Se menciona el uso del framework `h2e-framework` y los conceptos de `sovereign-ai` y `resilient-ai`, lo que sugiere que el objetivo es crear un sistema de transcripción robusto y autónomo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) y transcripción de audio.
- Modo *realtime* (según el tag `voxtral_realtime`), orientado a la transcripción en tiempo real.
- Pipeline de HuggingFace: `automatic-speech-recognition`.
- Soporte de idioma inglés (según tags del repositorio).
- No se dispone de información sobre soporte de *tool calling*, capacidad de agentes, visión o multimodalidad.

## Casos de uso

- Transcripción de reuniones: el modelo convierte el audio de reuniones en texto en tiempo real, lo que permite generar actas automáticas y facilitar la revisión posterior.
- Subtitulado automático de vídeos: puede integrarse en pipelines de procesamiento de vídeo para generar subtítulos en inglés, reduciendo el coste de producción de contenido accesible.
- Accesibilidad para personas con discapacidad auditiva: mediante la transcripción en directo, proporciona subtítulos en tiempo real en eventos, clases o conferencias.
- Análisis de llamadas de atención al cliente: permite transcribir llamadas de soporte para su posterior análisis, extracción de métricas o detección de incidencias.
- Documentación de conferencias y seminarios: el modelo puede transcribir ponencias y mesas redondas, generando registros textuales útiles para los asistentes y para la difusión posterior.
- Integración en sistemas de vigilancia de audio: al ser un modelo de ASR en tiempo real, puede emplearse en sistemas de monitorización de audio para la detección de eventos o alertas en entornos críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatible con vLLM, por lo que puede desplegarse en entornos que soporten esta librería de inferencia.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El campo de licencia en HuggingFace figura como no disponible, aunque el tag del repositorio indica Apache 2.0. Es recomendable verificar la licencia antes de un uso comercial.
- Al ser un *fine-tune*, el modelo puede heredar las limitaciones del modelo base `Voxtral-Mini-4B-Realtime-2602`, que no se especifican en la información disponible.
- El enfoque de *continual learning* puede implicar riesgo de olvido catastrófico si se entrena de forma secuencial, tal y como sugieren los tags del repositorio.
- Solo se ha identificado soporte de inglés; no se confirma capacidad multilingüe.
- No se dispone de información sobre sesgos, alucinaciones ni comportamiento en dominios específicos.

## Enlaces

- https://huggingface.co/frankmorales2020/topo-voxtral-unesco-audio
- https://huggingface.co/frankmorales2020/voxtral-mini-4b-unesco-audio (modelo relacionado con el mismo dataset y base)
- https://huggingface.co/models?other=TOPO-2026 (modelos de la iniciativa TOPO-2026)
