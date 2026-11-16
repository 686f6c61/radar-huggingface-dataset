# lorneluo/sherpa-onnx-funasr-nano-int8-2025-12-30

## Resumen

`sherpa-onnx-funasr-nano-int8-2025-12-30` es un espejo sin modificaciones del repositorio `csukuangfj/sherpa-onnx-funasr-nano-int8-2025-12-30`, publicado por el usuario `lorneluo` para su uso en KeyMic (https://keymic.io). No se trata de un modelo de lenguaje generativo, sino de un paquete de artefactos ONNX cuantizados a int8 pensado para su uso con sherpa-onnx, el runtime de inferencia de k2-fsa orientado a tareas de voz (reconocimiento, síntesis, VAD, etc.). El nombre del repositorio indica que los ficheros derivan de FunASR-Nano, la familia de modelos de reconocimiento de voz de Alibaba, empaquetados en formato compatible con sherpa-onnx.

El repositorio es un mirror: el autor original de los ficheros es `csukuangfj`, y la model card remite explícitamente al repositorio fuente para consultar licencia y autoría. El tamaño del repo es de 1.0 GB, coherente con un conjunto de pesos ONNX int8 acompañados de ficheros auxiliares (tokens, configuración, posiblemente modelos de VAD o puntuación). No hay pipeline declarado en Hugging Face, ni idiomas, ni licencia indicados en la metadata del espejo.

La relevancia de este repositorio es operativa más que investigadora: sirve como artefacto listo para desplegar en sherpa-onnx dentro de KeyMic, y su interés para terceros depende de consultar el repositorio original. No se ha publicado información sobre benchmarks, arquitectura detallada ni datos de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto ONNX derivado de FunASR-Nano según el nombre del repo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (según el nombre del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite al repo fuente) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste en la información disponible. El nombre del repositorio sugiere que los artefactos derivan de FunASR-Nano y que han sido convertidos a ONNX y cuantizados a int8 para su uso con sherpa-onnx, pero no se detalla el pipeline de conversión ni la composición del modelo resultante.

La model card es explícitamente mínima: se limita a declarar que es un espejo sin modificaciones del repositorio de `csukuangfj` y a remitir al repositorio fuente para licencia y autoría. Cualquier dato sobre arquitectura, dataset o innovaciones técnicas debe obtenerse del repositorio original, no de este espejo.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Por el nombre del repositorio y su integración con sherpa-onnx, el uso previsto es la inferencia de un modelo de voz (probablemente reconocimiento de voz) en formato ONNX int8.
- No hay información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No hay información sobre cobertura multilingüe.

## Casos de uso

- Reconocimiento de voz en aplicaciones de escritorio o web: el paquete ONNX int8 puede cargarse con sherpa-onnx para transcripción local sin depender de servicios en la nube, siempre que se confirme la tarea exacta del modelo en el repositorio fuente.
- Dictado por voz en herramientas de productividad: el caso declarado por el autor del espejo es KeyMic (https://keymic.io), que usa estos ficheros para entrada de voz.
- Transcripción en tiempo real en dispositivos con recursos limitados: la cuantización int8 y el formato ONNX reducen el coste de inferencia frente a pesos en precisión completa, aunque no se han publicado cifras de latencia.
- Despliegue embebido multiplataforma: sherpa-onnx soporta varios backends y plataformas, lo que permite integrar el modelo en aplicaciones nativas sin un stack de Python.
- Prototipado de pipelines de voz: útil para evaluar sherpa-onnx con un modelo ya empaquetado antes de decidir si se adopta el modelo fuente.
- Reproducibilidad de despliegues existentes: al ser un mirror, permite fijar una versión concreta de los artefactos usados por una aplicación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 1.0 GB, lo que da una cota superior aproximada del espacio en disco de los pesos, no de la memoria en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; la cuantización int8 y el formato ONNX sugieren que puede ejecutarse en CPU, pero no hay datos publicados.
- Opciones de despliegue: sherpa-onnx (runtime previsto); otras opciones no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo fuente que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- La licencia no está declarada en este repositorio; la model card remite al repositorio fuente (`csukuangfj/sherpa-onnx-funasr-nano-int8-2025-12-30`). Antes de cualquier uso comercial es imprescindible verificar la licencia allí.
- Es un espejo sin modificaciones: no hay garantía de mantenimiento, actualizaciones ni soporte por parte de `lorneluo`.
- No hay información sobre sesgos, tasas de error, cobertura de idiomas ni comportamiento en dominios específicos.
- No se han publicado evaluaciones de robustez frente a ruido, acentos o audio de baja calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No debe asumirse que el modelo realiza una tarea concreta (ASR, TTS, VAD) sin consultar el repositorio fuente; el nombre sugiere ASR, pero no está confirmado en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lorneluo/sherpa-onnx-funasr-nano-int8-2025-12-30
- Repositorio fuente: https://huggingface.co/csukuangfj/sherpa-onnx-funasr-nano-int8-2025-12-30
- KeyMic: https://keymic.io
