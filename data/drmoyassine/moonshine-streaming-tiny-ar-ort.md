# Drmoyassine/moonshine-streaming-tiny-ar-ort

## Resumen

Este repositorio es un espejo (mirror) byte a byte de los artefactos oficiales del modelo **Moonshine streaming tiny (árabe)** de Useful Sensors, en formato ONNX Runtime (.ort). El autor, Drmoyassine, lo publica para resolver un problema concreto: los archivos originales se sirven desde `download.moonshine.ai` sin cabeceras CORS, lo que impide que un navegador los descargue directamente. Al alojarlos en Hugging Face, que sí permite CORS, el modelo puede cargarse desde el navegador, por ejemplo en el proyecto liteparse.

El modelo en sí es un sistema de reconocimiento de voz (speech-to-text) en streaming, diseñado para baja latencia en aplicaciones de voz en tiempo real. La arquitectura se compone de varias sesiones ONNX (frontend, encoder, adapter, cross_kv, decoder_kv) que trabajan conjuntamente para procesar audio de forma incremental. Es una variante "tiny" del modelo Moonshine, orientada a dispositivos con recursos limitados. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con streaming por bloques (sesiones ONNX separadas: frontend, encoder, adapter, cross_kv, decoder_kv) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizado (los artefactos provienen de `quantized_26_08_24`) |
| Idiomas soportados | Arabe (por el nombre del modelo) |
| Licencia | MIT |
| Formato de pesos | .ort (ONNX Runtime flatbuffer) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de streaming de Moonshine, que descompone el grafo de inferencia en varias sesiones ONNX independientes: un frontend que procesa la señal de audio, un encoder que genera representaciones, un adapter que conecta con el decoder, y dos sesiones de caché KV (cross_kv y decoder_kv) para mantener el estado entre pasos de decodificación. Esta descomposición permite la decodificación especulativa y el procesamiento incremental del audio, reduciendo la latencia en comparación con modelos no streaming.

No se dispone de información sobre el número de parámetros, el tamaño del dataset de entrenamiento ni el proceso de entrenamiento (RLHF, DPO, etc.) en la información proporcionada. El repositorio es un mirror de los artefactos oficiales, por lo que los detalles de entrenamiento corresponden al modelo original de Useful Sensors, pero no se han incluido en esta ficha.

## Capacidades

- Transcripción de voz a texto en árabe en tiempo real (streaming).
- Baja latencia gracias a la arquitectura de streaming con caché KV y decodificación especulativa.
- Diseñado para integración en navegadores y aplicaciones web gracias al formato .ort y la compatibilidad CORS.
- Adecuado para dispositivos edge o con recursos limitados por su tamaño "tiny".
- No se han documentado capacidades adicionales como tool calling, agentes o multimodales en la información disponible.

## Casos de uso

- Asistentes de voz en árabe: el modelo puede transcribir comandos de voz en tiempo real, permitiendo interacciones conversacionales con baja latencia.
- Transcripción de reuniones o conferencias: al ser streaming, puede procesar audio continuo y generar subtítulos en directo.
- Aplicaciones de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en entornos web.
- Automatización de atención al cliente: integración en chatbots telefónicos o web para transcribir consultas de usuarios en árabe.
- Herramientas de dictado: permitir a usuarios escribir mediante voz en aplicaciones web sin necesidad de servidores dedicados.
- Prototipado rápido de agentes de voz: gracias a la licencia MIT y al formato .ort, se puede integrar fácilmente en proyectos de investigación o desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM, GPU recomendadas o latencia en la información proporcionada.
- Al ser un modelo "tiny" y estar cuantizado, es razonable esperar que pueda ejecutarse en CPUs o GPUs de gama baja, pero no hay cifras confirmadas.
- El formato .ort es compatible con ONNX Runtime, por lo que puede desplegarse en entornos que soporten esta runtime (CPU, GPU, edge).
- No se han documentado opciones de despliegue específicas (vLLM, llama.cpp, etc.) para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo es un mirror de un artefacto específico de Moonshine, y no se han proporcionado datos de otros modelos comparables.

## Limitaciones y advertencias

- El modelo está especializado en árabe; su rendimiento en otros idiomas no está garantizado.
- Al ser un mirror, no hay modificaciones respecto al original, pero tampoco se han verificado los hashes más allá de los indicados en el README.
- La cuantización puede afectar a la precisión en comparación con versiones de mayor precisión.
- No se han documentado sesgos específicos, pero como todo modelo de reconocimiento de voz, puede presentar errores en acentos, ruido o habla no estándar.
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia upstream de Useful Sensors para confirmar cualquier condición adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Drmoyassine/moonshine-streaming-tiny-ar-ort
- Modelo original en HuggingFace: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-ar
- Repositorio GitHub de Moonshine: https://github.com/moonshine-ai/moonshine
- Documentación de modelos disponibles: https://moonshine-voice.readthedocs.io/en/stable/models/available-models/
- Documentación de streaming models: https://deepwiki.com/moonshine-ai/moonshine/8.1-streaming-models
