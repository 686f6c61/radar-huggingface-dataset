# i2z1/gigaam-multilingual-ctc-onnx-int8

## Resumen

GigaAM Multilingual CTC es un modelo de reconocimiento automático del habla (ASR) basado en un encoder Conformer de 220 millones de parámetros, desarrollado por el equipo GigaChat (salute-developers) y publicado originalmente como `ai-sage/GigaAM-Multilingual`. Esta ficha describe la conversión a ONNX con cuantización dinámica int8 realizada por el usuario `i2z1`, pensada para inferencia eficiente en CPU mediante el runtime sherpa-onnx. El modelo resuelve el problema del dictado offline en ruso con transcripción de términos técnicos en inglés en escritura latina, además de cubrir lenguas centroasiáticas poco representadas como kazajo, kirguís y uzbeko.

La relevancia actual del modelo radica en su capacidad para ejecutarse en servidores pequeños sin GPU (probado en 2 vCPU y 1,9 GB de RAM) manteniendo una calidad competitiva en ruso (WER 4,4 % en FLEURS) y superando claramente a Whisper large-v3 en kazajo (WER 5,2 % frente a 32,4 %). El modelo usa una cabeza CTC a nivel de carácter, con un vocabulario de 70 caracteres, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + cabeza CTC charwise |
| Parametros totales | 220 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (ASR por tramas, sin ventana de contexto explícita) |
| Tipos de cuantizacion | int8 dinamico (onnxruntime `quantize_dynamic`, pesos QUInt8) |
| Idiomas soportados | Ruso (ru), ingles (en), kazajo (kk), kirguis (ky), uzbeko (uz) |
| Licencia | MIT (heredada del modelo base, Copyright 2024 GigaChat Team) |
| Formato de pesos | ONNX (archivo `model.int8.onnx`, 215 MB) |

## Arquitectura y entrenamiento

El modelo base GigaAM Multilingual emplea un encoder Conformer pre-entrenado sobre 2 millones de horas de audio mediante un enfoque estilo HuBERT, seguido de un ajuste fino para ASR con una cabeza CTC a nivel de carácter. La versión exportada conserva la arquitectura original (submuestreo de factor 4, metadatos `model_type=EncDecCTCModel` e `is_giga_am=1`) y la cuantiza dinámicamente a int8 con onnxruntime, lo que reduce el tamaño de 1,11 GB (versión fp32) a 215 MB sin pérdida significativa de precisión en la práctica. El vocabulario incluye 70 caracteres (latín, cirílico y caracteres específicos del kazajo) más el token `<blk>` para blanco, con el espacio asignado al id 0.

El entrenamiento del modelo base se centró en lenguas subrepresentadas de Asia Central (kazajo, kirguís, uzbeko) además de ruso e inglés, con el objetivo de reducir la brecha de rendimiento en ASR multilingüe. La exportación a ONNX fue realizada por el autor de esta ficha adaptando el script de k2-fsa/sherpa-onnx, e incluye metadatos embebidos para su uso directo con el runtime.

## Capacidades

- Reconocimiento de voz multilingüe en cinco idiomas: ruso, inglés, kazajo, kirguís y uzbeko.
- Dictado en ruso con transcripción de términos técnicos en inglés en escritura latina (p. ej., "run npm install" se transcribe como `npm install`, no transliterado a cirílico).
- Inferencia offline en CPU sin necesidad de GPU, con factor tiempo real de ~0,10 (11 segundos de audio se decodifican en ~1,3 segundos en un VPS de 2 vCPU).
- Integración nativa con sherpa-onnx en Python y Node.js mediante la clase `OfflineRecognizer` con configuración `nemo_ctc`.
- Compatible con el proyecto OpenChamber (interfaz web para el agente OpenCode) para dictado por micrófono.
- Vocabulario compacto de 70 caracteres que cubre alfabetos latino, cirílico y caracteres kazajos específicos.
- Sin necesidad de conexión a internet durante la inferencia, adecuado para entornos con restricciones de red.

## Casos de uso

- Dictado de documentación técnica en ruso: un desarrollador puede dictar frases que mezclan ruso y comandos en inglés (p. ej., "ejecuta `git push`") y el modelo transcribe los comandos en latín, facilitando la generación de guías y manuales sin corrección manual.
- Transcripción de reuniones en entornos con privacidad estricta: al ejecutarse localmente en un servidor CPU, el audio nunca sale de la infraestructura, cumpliendo requisitos de cumplimiento normativo en sectores como banca o sanidad.
- Asistente de voz para atención al cliente en kazajo o kirguís: el modelo ofrece WER 5,2 % en kazajo (FLEURS), muy superior a Whisper large-v3 (32,4 %), permitiendo sistemas IVR o chatbots de voz en lenguas minoritarias.
- Subtitulado automático de vídeos en ruso e inglés para plataformas de contenido: con un factor tiempo real de 0,10, puede procesar una hora de audio en unos 6 minutos en hardware modesto.
- Integración en pipelines de transcripción masiva en servidores sin GPU: gracias a su bajo consumo de RAM (~410 MB) y carga rápida (~1,6 s), es viable ejecutar múltiples instancias en paralelo en máquinas virtuales pequeñas.
- Pruebas de concepto de ASR embebido en dispositivos edge: el modelo ONNX int8 puede desplegarse en dispositivos con ARM o x86 de bajas prestaciones mediante sherpa-onnx, habilitando asistentes de voz locales.

## Benchmarks y rendimiento

Los siguientes datos de WER (Word Error Rate, %) provienen de la model card del modelo base, con decodificación greedy y normalización. Se comparan la versión de 220M (este modelo), la versión Large de 600M y Whisper large-v3:

| Idioma | Dataset | Este modelo (220M ctc) | Large (600M) | Whisper large-v3 |
|---|---:|---:|---:|---:|
| Ruso | FLEURS | 4,4 | 3,0 | 3,1 |
| Ruso | Interno | 7,6 | 6,0 | 10,1 |
| Inglés | FLEURS | 12,2 | 9,4 | 3,9 |
| Kazajo | FLEURS | 5,2 | 4,4 | 32,4 |

Rendimiento medido en un VPS de 2 vCPU con esta versión int8, 2 hilos y sherpa-onnx 1.12.28:

| Metrica | Valor |
|---|---|
| Tiempo de carga | ~1,6 s |
| Factor tiempo real | ~0,10 (11 s de audio → ~1,3 s de decodificacion) |
| Pico de RAM | ~410 MB |

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU.
- Probado en un VPS de 2 vCPU y 1,9 GB de RAM, con pico de memoria de ~410 MB.
- Tamaño del archivo del modelo: 215 MB en disco.
- Despliegue recomendado con sherpa-onnx (Python o Node.js) usando el proveedor `cpu` y `num_threads=2` o superior según disponibilidad de núcleos.
- Alternativas de despliegue: cualquier runtime que soporte ONNX (onnxruntime, TensorRT si se desea GPU, aunque no es el objetivo) o integración directa en OpenChamber mediante el script de instalación del repositorio companion.
- Latencia estimada: ~1,3 s para 11 s de audio en 2 vCPU; en hardware con más núcleos el factor tiempo real puede mejorar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ruso (FLEURS) | WER kazajo (FLEURS) | Licencia | Formato |
|---|---|---|---|---|---|---|
| GigaAM Multilingual CTC (este) | 220M | No aplica | 4,4 % | 5,2 % | MIT | ONNX int8 |
| GigaAM Multilingual Large | 600M | No aplica | 3,0 % | 4,4 % | MIT | PyTorch / ONNX |
| Whisper large-v3 | 1550M | 30 s de audio | 3,1 % | 32,4 % | MIT | PyTorch / ONNX / GGUF |

La comparativa muestra que este modelo ofrece el mejor equilibrio entre tamaño, velocidad y calidad para ruso y kazajo en entornos CPU, mientras que Whisper large-v3 es superior en inglés pero mucho peor en kazajo y requiere más recursos. La versión Large de GigaAM mejora ligeramente el WER pero duplica el tamaño y no está disponible en esta cuantización int8.

## Limitaciones y advertencias

- No genera puntuación ni capitalización: la salida es texto plano sin signos de puntuación, debido a la cabeza CTC a nivel de carácter.
- El reconocimiento de inglés es moderado (WER 12,2 % en FLEURS); para dictados largos en inglés se recomienda usar un modelo de la familia Whisper.
- La calidad en ruso es ligeramente inferior a las versiones GigaAM v2/v3 con arquitectura RNNT (WER 4,4 % frente a ~3 %), a cambio de soporte multilingüe.
- El vocabulario está limitado a 70 caracteres; no soporta caracteres fuera de los alfabetos latino, cirílico y kazajo específico.
- No se han publicado resultados de benchmarks adicionales más allá de los incluidos en la model card; los datos de rendimiento en CPU provienen de una única medición en un VPS de 2 vCPU.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base tiene copyright del equipo GigaChat; el script de exportación está adaptado de sherpa-onnx (Apache-2.0), por lo que se debe mantener la atribución correspondiente.
- El modelo no está diseñado para tareas de generación de texto ni razonamiento; es exclusivamente un sistema de reconocimiento de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/i2z1/gigaam-multilingual-ctc-onnx-int8
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Repositorio GitHub de GigaAM: https://github.com/salute-developers/GigaAM
- Paper arXiv: https://arxiv.org/abs/2607.10371
- Versión HTML del paper: https://arxiv.org/html/2607.10371v1
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Repositorio companion (OpenChamber): https://github.com/ (referenciado en la model card, sin URL completa)
