# Lauro00000/loudflow-pocket-tts-onnx

## Resumen

Este repositorio contiene exportaciones a ONNX de Pocket TTS, el modelo de sintesis de voz desarrollado por Kyutai Labs. El autor del repositorio, Lauro00000, no ha reentrenado ni modificado los pesos: se limita a publicar los ficheros en el formato y la disposicion de bundle que consume la aplicacion de escritorio LoudFlow. El cambio aplicado es exclusivamente la conversion a ONNX y una cuantizacion int8 dinamica por canal.

El bundle publicado corresponde al idioma aleman y se ha generado a partir del checkpoint `languages/german/model.safetensors` del modelo `kyutai/pocket-tts` en la revision `3e82814a68665eec246ff649b14c71331f955c06`, que segun la model card es un reentrenamiento de Kyutai del 1 de octubre de 2026. La exportacion se realizo con la herramienta `lookbe/pocket-tts-onnx-export` en la revision `2b25e5a`, usando el flag `--legacy_kv_cache` y cuantizacion int8 dinamica por canal, con verificaciones de paridad frente a PyTorch superadas segun el autor.

La relevancia de este repositorio es practica: ofrece Pocket TTS en un formato ONNX cuantizado a int8 (repo de 0,3 GB) listo para integrarse en aplicaciones de escritorio o despliegues ligeros, sin necesidad de cargar pesos en safetensors y sin dependencia del runtime original. Se trata de un artefacto de distribucion, no de un modelo nuevo, y hereda todas las caracteristicas del modelo base de Kyutai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base `kyutai/pocket-tts` (Kyutai Labs); la exportacion incluye un flow language model (`flow_lm_main`, `flow_lm_flow`), el codec Mimi (`mimi_encoder`, `mimi_decoder`) y un text conditioner. Detalle interno de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica por canal (dynamic per-channel int8) |
| Idiomas soportados | aleman (`de`) |
| Licencia | CC BY 4.0 (heredada de `kyutai/pocket-tts`) |
| Formato de pesos | ONNX (int8); incluye `tokenizer.model` (SentencePiece), `bundle.json` y `bos_before_voice.npy` |

## Arquitectura y entrenamiento

No se ha reentrenado ningun peso en este repositorio. La arquitectura es la del modelo base `kyutai/pocket-tts` de Kyutai Labs, del que no se aportan detalles estructurales en la informacion disponible (numero de capas, dimension del modelo, atencion, etc.). Los nombres de los ficheros del bundle revelan los componentes exportados: dos modulos de flow language model (`flow_lm_main_int8.onnx` y `flow_lm_flow_int8.onnx`), el codec neuronal Mimi de Kyutai en sus variantes de codificacion y decodificacion (`mimi_encoder.onnx`, `mimi_decoder_int8.onnx`) y un `text_conditioner.onnx` que procesa la entrada de texto.

El unico proceso tecnico aplicado es la exportacion a ONNX y la cuantizacion. Segun la model card, la exportacion se realizo con la herramienta `lookbe/pocket-tts-onnx-export` con el flag `--legacy_kv_cache` (contrato de estado de cache completo) e int8 dinamica por canal, y las comprobaciones de paridad del propio exportador frente a PyTorch pasaron correctamente. El bundle es funcionalmente el mismo conjunto de ficheros que `KevinAHM/pocket-tts-onnx` (bundles de abril de 2026), con la diferencia de que los tensores de estado se separan en caches K/V independientes en float16, segun indica `bundle.json`. No se especifican en la informacion disponible datos de dataset, numero de tokens de entrenamiento, ni si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman, a partir de texto de entrada.
- Codificacion y decodificacion de audio mediante el codec Mimi de Kyutai.
- Condicionamiento de texto previo a la generacion mediante el modulo `text_conditioner`.
- Ejecucion en runtime ONNX, lo que permite despliegue sin el stack nativo de Kyutai.
- Cuantizacion int8 por canal, orientada a reducir huella de memoria y acelerar inferencia en CPU/GPU compatibles.
- Soporte de voz: el bundle incluye `bos_before_voice.npy`, lo que sugiere condicionamiento de voz/prompt de audio, aunque los detalles no se detallan en la model card.
- Capacidades de tool calling, agentes, vision, audio de entrada o razonamiento: no disponibles (el modelo es exclusivamente TTS).
- Soporte multilingue: limitado al aleman en esta exportacion.

## Casos de uso

- Sintesis de voz en aleman integrada en aplicaciones de escritorio: el bundle esta disenado especificamente para el layout que carga LoudFlow, por lo que es adecuado para incrustar TTS local sin depender de servicios en la nube.
- Lectura de textos largos en aleman (accesibilidad, audiolibros, lectores de pantalla): al ser un modelo de voz ligero (repo de 0,3 GB en int8), puede ejecutarse en el propio dispositivo del usuario.
- Generacion de locuciones para contenido educativo o documentales en aleman: el modelo sintetiza voz a partir de texto plano, lo que permite automatizar la produccion de narraciones.
- Asistentes de voz locales en aleman: se puede combinar con un pipeline ASR + LLM + este TTS para construir un asistente que funcione sin conexion.
- Prototipado rapido en entornos ONNX (onnxruntime): al distribuirse como ONNX, se integra en aplicaciones C++, C#, Python o moviles mediante el runtime de ONNX Runtime.
- Investigacion y evaluacion de TTS cuantizado: sirve como referencia para medir el impacto de la cuantizacion int8 por canal frente a los pesos originales en safetensors.
- Despliegue en hardware modesto o edge: el tamano reducido del bundle facilita su uso en equipos con pocos recursos, siempre que el runtime ONNX y el codec Mimi esten soportados.
- Verificacion de paridad de exportaciones: util para desarrolladores que quieran comparar el comportamiento de la exportacion ONNX con el modelo PyTorch original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 0,3 GB, por lo que el peso de los ficheros ONNX es reducido; la memoria adicional dependera del estado de cache (caches K/V en float16 segun la model card) y del codec Mimi.
- GPU recomendadas: no disponible. Por el tamano del bundle, es previsible que quepa en GPU de consumo, aunque no se ofrece una lista oficial.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano sugiere que podria ejecutarse en GPUs de gama media, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del bundle) y la propia aplicacion LoudFlow. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS ONNX).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Lauro00000/loudflow-pocket-tts-onnx` (este) | no disponible | no disponible | aleman | CC BY 4.0 | ONNX int8 | Exportacion para LoudFlow, bundle aleman de octubre de 2026 |
| `KevinAHM/pocket-tts-onnx` | no disponible | no disponible | no disponible | CC BY 4.0 (heredada) | ONNX | Mismo conjunto de ficheros (bundles de abril de 2026); caches de estado distintas (float16 separadas) |
| `kyutai/pocket-tts` (modelo base) | no disponible | no disponible | multilingue (incluye aleman) | CC BY 4.0 | safetensors | Pesos originales de Kyutai Labs, sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se aportan datos de sesgos del modelo base, por lo que no se puede evaluar el comportamiento en cuanto a sesgos de voz, genero, acento o dialecto aleman.
- Riesgo de alucinacion: no evaluado; en TTS se manifiesta como pronunciaciones incorrectas o artefactos, pero no hay datos disponibles.
- La exportacion cubre unicamente el aleman; no se puede usar para otros idiomas sin generar bundles adicionales.
- La cuantizacion int8 puede degradar la calidad de audio respecto a los pesos originales en safetensors; la model card afirma que las comprobaciones de paridad del exportador pasaron, pero no presenta metricas objetivas de calidad.
- La licencia es CC BY 4.0: permite uso comercial, pero exige atribucion a Kyutai Labs (y, en la practica, tambien al autor de la conversion). Conviene revisar los terminos exactos antes de un despliegue comercial.
- El bundle solo funciona con el contrato de estado `--legacy_kv_cache`; si el runtime que lo consume espera otro formato de cache, sera necesario reexportar.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Los parametros, contexto y arquitectura interna del modelo base no se detallan, lo que dificulta estimar requisitos de hardware o limites de longitud de texto.
- Las fechas que figuran en la model card (octubre de 2026) y las referencias a bundles de abril de 2026 no se han verificado de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lauro00000/loudflow-pocket-tts-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Herramienta de exportacion: https://github.com/lookbe/pocket-tts-onnx-export
- Bundle alternativo con el mismo conjunto de ficheros: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
