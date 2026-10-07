# qualcomm/Whisper-Small-Quantized

## Resumen

Whisper-Small-Quantized es una version optimizada para dispositivos Qualcomm del modelo de reconocimiento automatico del habla (ASR) Whisper Small de OpenAI. Qualcomm ha aplicado cuantizacion w8a16 (pesos de 8 bits, activaciones de 16 bits) y ha modificado la arquitectura interna para adaptarla a la inferencia en el NPU Hexagon de sus chipsets. El resultado es un export precompilado que se ejecuta en edge mediante Qualcomm AI Hub Models.

El modelo conserva el pipeline de transcripcion de audio a texto de Whisper, basado en un encoder-decoder transformer, y mantiene la capacidad de transcribir fragmentos de audio de hasta 30 segundos. La modificacion clave respecto al original consiste en sustituir la Multi-Head Attention (MHA) por Single-Head Attention (SHA) y las capas lineales por capas convolucionales, lo que reduce el coste computacional y facilita el despliegue en hardware movil.

Su relevancia actual radica en que permite ejecutar ASR de calidad cercana al estado del arte de forma local, sin conexion a la nube y con bajo consumo, en telefonos, PC con Snapdragon y plataformas industriales Dragonwing. Se distribuye bajo licencia Apache 2.0 y esta pensado para integrarse en el Qualcomm Voice AI SDK y en tiempo de ejecucion ONNX Runtime con el backend QNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con Single-Head Attention (SHA) en lugar de Multi-Head Attention y capas convolucionales en lugar de capas lineales |
| Parametros totales | No especificado en la model card; el modelo base Whisper Small de OpenAI declara aproximadamente 244 millones de parametros |
| Longitud de contexto | Audio de hasta 30 segundos por ventana de transcripcion |
| Tipos de cuantizacion | w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch y export precompilado QNN en ONNX |

## Arquitectura y entrenamiento

La arquitectura parte de Whisper Small, un transformer encoder-decoder disenado para ASR. Qualcomm ha sustituido la Multi-Head Attention por Single-Head Attention y ha reemplazado las capas lineales por capas convolucionales, con el objetivo de que el grafo sea mas eficiente de compilar y ejecutar sobre el NPU Hexagon. Sobre esta estructura se ha aplicado cuantizacion w8a16. La implementacion de referencia corresponde al modulo Whisper de HuggingFace Transformers en su version 4.42.3.

No se detalla en la informacion disponible el proceso de entrenamiento ni de calibracion de la cuantizacion: no se indica el numero de tokens de audio empleados, la composicion del dataset, ni si se utilizaron tecnicas de ajuste como RLHF o DPO. Tampoco se especifica si la cuantizacion se realizo con calibracion post-entrenamiento o con fine-tuning consciente de cuantizacion. En cuanto a la decodificacion, la model card define la latencia del encoder como el tiempo hasta el primer token y la latencia del decoder como el tiempo por cada token adicional.

## Capacidades

- Reconocimiento automatico del habla: transcripcion de voz a texto en fragmentos de audio de hasta 30 segundos.
- Transcripcion de formato largo: la model card menciona un rendimiento destacado en transcripcion de audio largo mediante el encadenado de ventanas de 30 segundos.
- Robustez en entornos ruidosos: el modelo se describe como fiable en condiciones acusticas realistas y con ruido.
- Inferencia en dispositivo: ejecucion local en NPU Qualcomm sin depender de la nube.
- Compatibilidad con Qualcomm Voice AI SDK y con los exports QNN ONNX precompilados.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Soporte de tool calling, agentes o vision: no disponible; el modelo es especificamente de ASR.

## Casos de uso

- Transcripcion en tiempo real en moviles: integrado mediante el Qualcomm Voice AI SDK, permite dictado y transcripcion sin enviar audio a servidores externos, lo que reduce latencia y mejora la privacidad.
- Subtitulado en dispositivos de grabacion: camaras, grabadoras y wearables con Snapdragon pueden generar subtitulos localmente procesando bloques de hasta 30 segundos de audio.
- Asistentes de voz on-device: transcripcion de comandos y consultas en el propio dispositivo como paso previo a un modulo de comprension o a un LLM local.
- Notas de reunion y actas automaticas: encadenando ventanas de 30 segundos se puede transcribir una reunion completa en local, sin coste de API ni exposicion de datos.
- Atencion al cliente en kioscos y terminales punto de venta: transcripcion de la voz del usuario en hardware con Dragonwing QCS6490 o similar para operar sin conectividad.
- Accesibilidad para personas con discapacidad auditiva: conversion de voz a texto en aplicaciones moviles que funcionan offline, con independencia de la cobertura de red.
- Automocion y robotica industrial: transcripcion de comandos de voz en entornos con conectividad limitada sobre plataformas Dragonwing IQ-8275 o IQ-9075.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una seccion titulada "Performance summary" cuyo contenido no se ha proporcionado, por lo que no es posible reproducir cifras de WER, latencia o throughput. Tampoco se aportan valores de MMLU, HumanEval o GSM8K, que no aplican a un modelo de ASR.

## Requisitos de hardware

- Disenado para ejecucion en NPU Qualcomm, no para GPU de escritorio convencional.
- Chipsets soportados con export precompilado: Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite for Galaxy, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Snapdragon 7 Gen 4, Dragonwing QCS6490, Dragonwing IQ-8275, Dragonwing QCS8550 (proxy), Dragonwing Q-6690 e IQ-9075.
- Entorno de ejecucion: QAIRT 2.50 y ONNX Runtime 1.30.0, con backend QNN.
- Despliegue: Qualcomm AI Hub Models (libreria de exportacion), Qualcomm Voice AI SDK (descargable desde Qualcomm Package Manager) y archivos QNN ONNX precompilados por chipset.
- VRAM estimada en GPU: no disponible, ya que el objetivo del modelo es el edge sobre NPU. El tamano del repositorio es de 22,6 GB e incluye multiples exports por chipset, no un unico peso de inferencia.
- Latencia y throughput: no se proporcionan valores concretos; la model card define conceptualmente la latencia del encoder (tiempo al primer token) y la del decoder (tiempo por token adicional).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper-Small-Quantized (Qualcomm) | No especificado (base ~244 M) | Audio de 30 s | w8a16 | Apache 2.0 | Exports QNN para chipsets Qualcomm |
| Whisper Small (OpenAI) | ~244 M | Audio de 30 s | FP32/FP16 | MIT | Pesos genericos en PyTorch |
| Whisper Large v3 (OpenAI) | ~1.550 M | Audio de 30 s | FP16 | MIT | Pesos genericos, requiere GPU |
| Whisper Tiny (OpenAI) | ~39 M | Audio de 30 s | FP32/FP16 | MIT | Pesos genericos, muy ligero |

La comparativa se limita a la familia Whisper porque la informacion disponible no incluye resultados de rendimiento frente a alternativas como Conformer, Wav2Vec 2.0 o FastConformer. Los datos de parametros de los modelos base son valores publicos de OpenAI; el resto de filas de la comparativa no incluyen cifras de WER por falta de datos.

## Limitaciones y advertencias

- La informacion disponible no especifica los idiomas soportados, por lo que no se puede confirmar el caracter multilingue del modelo base.
- No se publican valores de WER ni de latencia en la informacion proporcionada; la evaluacion de calidad en produccion requiere pruebas propias sobre el chipset objetivo.
- La transcripcion esta limitada a ventanas de 30 segundos; el audio mas largo debe segmentarse y encadenarse, con el riesgo de errores en las fronteras entre ventanas.
- El modelo esta optimizado para NPU Qualcomm y los exports QNN son especificos por chipset; no es portable directamente a GPU NVIDIA o AMD sin reconvertir a otro formato.
- La cuantizacion w8a16 puede introducir degradacion adicional de precision respecto al modelo en coma flotante; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion en segmentos de audio con silencio, ruido extremo o habla solapada, comportamiento habitual en modelos de la familia Whisper.
- Al ser un modelo de ASR, no soporta generacion de texto libre, razonamiento, codigo ni tool calling.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de uso del modelo base de OpenAI y de los SDK de Qualcomm asociados al despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Whisper-Small-Quantized
- Repositorio Qualcomm AI Hub Models (whisper_small_quantized): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/whisper_small_quantized
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Qualcomm Package Manager (Qualcomm Voice AI SDK): https://qpm.qualcomm.com/#/main/tools/details/VoiceAI_ASR
- Implementacion de referencia de Whisper en Transformers v4.42.3: https://github.com/huggingface/transformers/tree/v4.42.3/src/transformers/models/whisper
- Web de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
