# milkrice/moonshine-streaming-medium-en

## Resumen
Moonshine v2 Medium (streaming, English) es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Moonshine AI (antes Useful Sensors), disenado especificamente para transcripcion en streaming y ejecucion on-device. Este repositorio concreto, publicado por el usuario milkrice, es un espejo fijado (pinned mirror) sin modificaciones del build cuantizado en formato ONNX Runtime (`.ort`) del modelo original, con el objetivo de que las instalaciones de la aplicacion Milkrice (un transcriptor de reuniones local para macOS) obtengan archivos byte-identicos verificables por SHA-256.

El modelo resuelve el problema de la transcripcion de voz de baja latencia en dispositivos sin depender de la nube, algo critico para aplicaciones de privacidad, notas de reuniones y asistentes locales. La variante "medium" de la familia Moonshine v2 esta orientada a un equilibrio entre precision y coste computacional, con un pipeline de streaming que divide la inferencia en modulos (frontend, encoder, adapter, cross_kv, decoder_kv) para procesar audio de forma incremental.

La relevancia actual radica en que ofrece una alternativa open source (licencia MIT) a APIs propietarias de ASR, empaquetada en ONNX Runtime para despliegue portable en CPU y GPU. No obstante, la informacion disponible sobre arquitectura interna, numero de parametros y datos de entrenamiento es limitada en la model card del espejo, que remite al repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de streaming; pipeline modular frontend/encoder/adapter/decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizado (build `.ort` cuantizado; nivel exacto no disponible) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (Copyright (c) 2025 Useful Sensors, Inc. / Moonshine AI) |
| Formato de pesos | ONNX Runtime (`.ort`): frontend.ort, encoder.ort, adapter.ort, cross_kv.ort, decoder_kv.ort, tokenizer.bin, streaming_config.json |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un sistema ASR de streaming con un pipeline modular compuesto por un frontend de audio, un encoder, un adapter y modulos de decodificacion con cache KV (cross_kv y decoder_kv). Esta descomposicion sugiere un diseno encoder-decoder con atencion cruzada y mecanismos de cache para procesamiento incremental del audio, tipico de los sistemas de reconocimiento en streaming.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas mas alla del propio enfoque de streaming on-device y la cuantizacion para ONNX Runtime. Para detalles sobre entrenamiento y evaluacion, la model card remite al repositorio upstream de Moonshine AI.

## Capacidades
- Reconocimiento automatico del habla (speech-to-text) en ingles.
- Transcripcion en streaming, procesando audio de forma incremental con baja latencia.
- Ejecucion on-device, sin dependencia de servicios en la nube.
- Inferencia mediante ONNX Runtime, con soporte para CPU y potencialmente GPU segun el runtime.
- Verificacion de integridad mediante SHA-256 de cada archivo del paquete.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio adicional ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso
- Transcripcion de reuniones en local: la aplicacion Milkrice usa este modelo para generar notas de reuniones en macOS sin enviar audio a la nube, aprovechando el formato ONNX Runtime y la verificacion por hash para garantizar integridad de los archivos.
- Subtitulado en tiempo real: el modo streaming permite generar subtitulos incrementales en aplicaciones de videoconferencia o grabacion, con latencia reducida al procesar el audio por fragmentos.
- Asistentes de voz offline: integracion en asistentes de escritorio o moviles que requieren privacidad total, al no depender de APIs externas.
- Dictado y productividad personal: transcripcion de notas de voz o dictado en editores de texto, con despliegue local en equipos de sobremesa.
- Analisis de llamadas y atencion al cliente: procesamiento local de grabaciones para extraer transcripciones sin exponer datos sensibles a terceros.
- Investigacion en ASR: uso como baseline reproducible gracias a los hashes fijados y al empaquetado ONNX, util para comparar pipelines de streaming.
- Aplicaciones de accesibilidad: generacion de subtitulos para personas con discapacidad auditiva en entornos sin conectividad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible con precision; el paquete cuantizado ocupa 0.3 GB en disco, lo que sugiere un consumo de memoria moderado para inferencia.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU de consumo: probable dada la cuantizacion y el tamano del paquete, pero no confirmada en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime (formato nativo `.ort`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Moonshine v2 Medium streaming (este espejo) | no disponible | no disponible | en | MIT | ONNX Runtime (.ort) |
| Whisper (variantes) | no disponible en esta ficha | no disponible | multilingue | MIT | safetensors, GGUF, ONNX |
| Wav2Vec 2.0 | no disponible en esta ficha | no disponible | multilingue | MIT/Apache | PyTorch, ONNX |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a aspectos de licencia y formato.

## Limitaciones y advertencias
- Solo soporta ingles; no es adecuado para transcripcion multilingue.
- Al ser un espejo sin modificaciones, cualquier limitacion del modelo upstream se hereda; se recomienda consultar la model card oficial de Moonshine AI.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- La licencia MIT permite uso comercial, pero se debe mantener el aviso de copyright de Useful Sensors, Inc. / Moonshine AI.
- El paquete esta pensado para un pipeline concreto (Milkrice); su reutilizacion en otros contextos requiere adaptar el manejo de los modulos `.ort` y el `streaming_config.json`.
- No hay datos publicados sobre latencia, throughput ni precision en benchmarks en esta ficha.

## Enlaces
- Repositorio del espejo: https://huggingface.co/milkrice/moonshine-streaming-medium-en
- Modelo upstream: https://huggingface.co/moonshine-ai/moonshine-streaming-medium
- Repositorio Moonshine: https://github.com/moonshine-ai/moonshine
- Descarga original cuantizada: https://download.moonshine.ai/model/medium-streaming-en/quantized/
- Licencia upstream: https://github.com/moonshine-ai/moonshine#license
- Proyecto Milkrice: https://github.com/thekindofme/milkrice
