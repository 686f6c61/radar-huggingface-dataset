# rishabhf/silero-vad-coreml-archive

## Resumen

Este repositorio no es un modelo de lenguaje generativo, sino un espejo de archivo de un detector de actividad de voz (VAD, *voice activity detection*) de Silero convertido a Core ML. En concreto, preserva una única variante del repositorio `FluidInference/silero-vad-coreml`: el bundle compilado `silero-vad-unified-256ms-v6.2.1.mlmodelc`, acompañado de su `config.json` original y de metadatos de procedencia (`PROVENANCE.json`, `SHA256SUMS.json`). El modelo original es obra del Silero Team, la conversión a Core ML se atribuye a FluidAudio y la distribución corre a cargo de FluidInference; este archivo independiente lo publica el usuario `rishabhf` sin afiliación con ninguno de ellos.

Su relevancia es de tipo práctico y de cadena de suministro: al fijar una revisión concreta (`b419383c55c110e2c9271fa6ee0ea83d03c70d96`) y aportar sumas SHA256, permite reproducibilidad en pipelines de audio sobre plataformas Apple sin depender de la disponibilidad futura del repositorio upstream. El bundle está pensado para ejecutarse con Core ML en macOS e iOS, aprovechando CPU, GPU o Neural Engine según la política de ejecución que se configure.

No se dispone de información sobre arquitectura interna, número de parámetros ni datos de entrenamiento en la documentación proporcionada. El nombre del fichero indica una ventana unificada de 256 ms y la versión 6.2.1 del modelo Silero VAD, pero no hay más detalles técnicos publicados en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de actividad de voz, no es un modelo generativo; el artefacto es un bundle Core ML compilado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; el nombre del fichero indica una ventana unificada de 256 ms |
| Tipos de cuantizacion | no disponible (se distribuye el `.mlmodelc` ya compilado, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible; al ser VAD, la detección de voz es independiente del idioma |
| Licencia | MIT (Silero Team, Copyright (c) 2020-present Silero Team) |
| Formato de pesos | bundle Core ML compilado (`.mlmodelc`) más `config.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio es un archivo de artefactos, no una publicación de investigación: no incluye detalles sobre la topología de la red, la composición del dataset de entrenamiento, el número de tokens o muestras de audio procesadas, ni sobre si hubo ajuste fino supervisado. La model card se limita a declarar que los ficheros y el `config.json` son copias sin modificar de la revisión `b419383c55c110e2c9271fa6ee0ea83d03c70d96` del repositorio `FluidInference/silero-vad-coreml`, y que la conversión a Core ML se atribuye a FluidAudio.

El único dato técnico inferible del nombre del artefacto es la configuración «unified» con ventana de 256 ms de la versión 6.2.1 de Silero VAD. Cualquier otra característica de la arquitectura (tipo de capas, mecanismo de agregación temporal, precisión numérica del grafo Core ML) debe consultarse en la documentación upstream de FluidInference o de FluidAudio, no en este archivo.

## Capacidades

- Detección de actividad de voz en flujo de audio: clasifica segmentos como voz o no voz, con la ventana de 256 ms indicada en el nombre del artefacto.
- Ejecución nativa en el ecosistema Apple mediante Core ML (CPU, GPU y Neural Engine según la política de ejecución configurada).
- Integración en pipelines de audio como etapa de preprocesado previa a ASR, diarización o codificación.
- Distribución reproducible: incluye `PROVENANCE.json` con el origen y `SHA256SUMS.json` con sumas de verificación de los ficheros.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión ni audio-to-text: no es un modelo de lenguaje.
- No se documentan capacidades multilingües específicas; la tarea es lingüísticamente agnóstica por naturaleza.

## Casos de uso

- Segmentación previa a transcripción: usar el VAD para trocear audio largo en fragmentos con voz antes de enviarlos a un motor ASR, reduciendo el coste por minuto al no transcribir silencios ni ruido de fondo.
- Asistentes de voz en apps iOS y macOS: integrar el `.mlmodelc` con Core ML para detectar cuándo el usuario habla y recortar la captura del micrófono, con la ventaja de ejecución local sin enviar audio a un servidor.
- Detección de turnos y *barge-in*: en interfaces conversacionales, emplear la salida del VAD para interrumpir la reproducción del asistente cuando el usuario empieza a hablar.
- Filtrado de grabaciones: procesar archivos de reuniones o pódcasts para eliminar tramos sin voz y reducir el tamaño antes de archivarlos o de alimentar un pipeline de diarización.
- Moderación y monitorización de audio en streaming: detectar presencia de voz en canales en directo para activar reglas de moderación o de facturación basadas en tiempo efectivo de habla.
- Puerta de activación en dispositivos con recursos limitados: al ejecutarse sobre Neural Engine o CPU en hardware Apple, permite mantener el micrófono a la escucha con un consumo contenido y activar etapas más costosas solo cuando hay voz.
- Verificación de integridad en producción: usar `SHA256SUMS.json` y la revisión fijada para auditar que el binario desplegado coincide con el artefacto validado, útil en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, tasa de falsos positivos, latencia ni throughput, y la búsqueda web realizada no ha devuelto documentación técnica utilizable sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB según HuggingFace, lo que es coherente con un artefacto de pocos megabytes, pero no se publica el tamaño exacto ni el consumo de memoria en ejecución.
- GPU recomendadas: no aplica el catálogo NVIDIA; el destino es Core ML sobre hardware Apple (Apple Silicon y dispositivos iOS/iPadOS compatibles con la versión de Core ML que requiera el bundle).
- Compatibilidad con GPU de consumo: sí en el sentido de que puede ejecutarse en Mac con chip de la serie M y en iPhone/iPad; no hay soporte documentado para GPUs NVIDIA o AMD vía este artefacto.
- Opciones de despliegue: Core ML de forma nativa, y las utilidades de FluidAudio indicadas por el autor upstream. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; dependerán del dispositivo, de la política de ejecución de Core ML y de la longitud del audio procesado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rishabhf/silero-vad-coreml-archive | VAD, bundle Core ML | no disponible | 256 ms (según nombre del fichero) | MIT | HuggingFace, archivo independiente |
| FluidInference/silero-vad-coreml (upstream) | VAD, Core ML, varias variantes | no disponible | incluye otras variantes además de 256 ms | MIT según model card upstream | HuggingFace, repositorio activo |
| Silero VAD v6.2.1 (original, Silero Team) | VAD | no disponible | no disponible en la información proporcionada | MIT | GitHub `snakers4/silero-vad` |

No se dispone de datos de rendimiento comparativos entre estas variantes. La diferencia práctica entre las tres filas es de empaquetado y canal de distribución, no de capacidades documentadas: este repositorio fija una revisión concreta y añade comprobaciones de integridad, mientras que el upstream mantiene el conjunto completo de variantes.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Ausencia total de métricas publicadas en este repositorio: no hay datos de precisión, falsos positivos ni comportamiento en entornos ruidosos, por lo que cualquier decisión de producción requiere una evaluación propia sobre el dominio objetivo.
- Sesgos: no documentados. Un VAD puede comportarse de forma desigual con determinados acentos, registros, voces infantiles, audio con ruido de fondo o habla no nativa; conviene medirlo antes de desplegar.
- Restricciones de licencia: el modelo es MIT, lo que permite uso comercial y modificación manteniendo el aviso de copyright; el archivo conserva la licencia completa del Silero Team. El autor declara no estar afiliado a Silero Team, FluidInference ni FluidAudio, y no se ofrece servicio de inferencia alojado.
- Trazabilidad: al ser un espejo de terceros, la confianza depende de verificar `SHA256SUMS.json` y `PROVENANCE.json` contra la revisión citada del upstream.
- Mantenimiento: es un archivo estático de una sola variante; no recibirá actualizaciones del modelo ni correcciones del upstream. Otras variantes del repositorio original no están incluidas.
- Dependencia de plataforma: el formato `.mlmodelc` liga el despliegue al ecosistema Apple; para servidores Linux hará falta otra conversión no incluida aquí.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información técnica sobre el modelo y se han descartado por completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rishabhf/silero-vad-coreml-archive
- Repositorio upstream de la conversión: https://huggingface.co/FluidInference/silero-vad-coreml
- Revisión fijada del upstream: https://huggingface.co/FluidInference/silero-vad-coreml/tree/b419383c55c110e2c9271fa6ee0ea83d03c70d96
- Model card upstream preservada: https://huggingface.co/rishabhf/silero-vad-coreml-archive/blob/main/UPSTREAM_README.md
- Procedencia: https://huggingface.co/rishabhf/silero-vad-coreml-archive/blob/main/PROVENANCE.json
- Sumas de verificación: https://huggingface.co/rishabhf/silero-vad-coreml-archive/blob/main/SHA256SUMS.json
- FluidAudio (integración y documentación): https://github.com/FluidInference/FluidAudio
- Silero VAD original: https://github.com/snakers4/silero-vad
- Licencia MIT del Silero Team: https://github.com/snakers4/silero-vad/blob/7e30209a3e901f9842f81b225f3e93d8199902b1/LICENSE
