# Arm/sesr-m5-int8-ethos-u-executorch-alif-dk-e8

## Resumen

SESR-M5 es un modelo de superresolucion de imagenes (image-to-image) desarrollado originalmente por Qualcomm. Esta ficha concreta corresponde a la version optimizada por Arm para su ejecucion en NPUs Ethos-U embebidas. El modelo transforma imagenes de baja resolucion en versiones de mayor resolucion, y su interes principal reside en la cadena de optimizacion: cuantizacion estatica W8A8 y exportacion a ExecuTorch con el delegado Ethos-U, orientada a microcontroladores y sistemas embebidos con acelerador neuronal.

La version optimizada esta pensada para desarrolladores que evaluan cargas de trabajo de superresolucion en plataformas Cortex-M y Ethos-U. El dispositivo de referencia es el kit de desarrollo Alif Ensemble E8, que combina un Cortex-M55 con una NPU Ethos-U85. Los resultados reportados incluyen una latencia p50 de 177,15 ms frente a 200,44 ms del baseline (1,13x de mejora), un PSNR de 26,48 dB en BSD100 y un tamano de modelo de 0,18 MB.

La relevancia de esta publicacion es practica: demuestra que es viable ejecutar superresolucion de imagenes en hardware de muy bajo consumo con un modelo por debajo de 1 MB y sin reentrenamiento. No es un modelo de proposito general ni compite con modelos de lenguaje; es una referencia de despliegue para inferencia embebida cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base qualcomm/SESR-M5; superresolucion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada de 128x128 px) |
| Tipos de cuantizacion | INT8 simetrica per-tensor en pesos, activaciones INT8 (W8A8 estatica post-training) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` con delegado Ethos-U |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base qualcomm/SESR-M5 en la documentacion proporcionada; la model card de esta version remite al repositorio original para esos detalles. Lo que si esta documentado es el proceso de optimizacion aplicado: exportacion del modelo PyTorch a ExecuTorch con el delegado Ethos-U, cuantizacion estatica post-training W8A8 con calibracion sobre 50 muestras aleatorias (bsd100_calib_seed42_n50), y validacion de precision y rendimiento en el dispositivo de referencia.

No se realizo reentrenamiento ni fine-tuning del modelo original durante la conversion. La optimizacion fue llevada a cabo por Nota AI utilizando Arm AI Model Optimizer. La entrada de referencia es de 128x128 pixeles, con batch size 1 y precision INT8.

## Capacidades

- Superresolucion de imagenes: transforma imagenes de baja resolucion en imagenes de mayor resolucion (pipeline image-to-image).
- Inferencia cuantizada INT8 en NPU Ethos-U85, con delegado ExecuTorch.
- Ejecucion en microcontroladores Cortex-M55 con acelerador neuronal dedicado.
- Modelo de muy bajo peso (0,18 MB), apto para memoria flash limitada.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente ni soporte linguistico.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la superresolucion.

## Casos de uso

- Superresolucion en dispositivos de borde: el modelo eleva la resolucion de imagenes capturadas por sensores de baja resolucion en dispositivos con Cortex-M55 y Ethos-U85, aprovechando la NPU para mantener latencias por debajo de 200 ms.
- Referencia de despliegue para integradores: sirve como implementacion de referencia para validar el flujo ExecuTorch + delegado Ethos-U en nuevas plataformas Arm antes de portar modelos mayores.
- Benchmarking de NPUs embebidas: permite medir latencia p50, throughput (5,64 fps) y memoria pico (9,44 MB) como metrica comparativa entre silicios y configuraciones de memoria.
- Prototipado de camaras inteligentes: en aplicaciones de vision embebida donde el coste energetico y el espacio en flash son criticos, el modelo de 0,18 MB cabe en presupuestos de memoria muy ajustados.
- Preprocesado en pipelines de vision: mejora de resolucion de imagenes antes de etapas posteriores de deteccion o clasificacion en sistemas con recursos limitados.
- Evaluacion de tecnicas de cuantizacion: caso de estudio para comparar PSNR y latencia entre baseline y modelo cuantizado en un dataset concreto (BSD100), util para decidir estrategias de cuantizacion en otros modelos de vision.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos en Alif Ensemble E8 (Cortex-M55 + Ethos-U85), ExecuTorch 1.1.0, batch 1, entrada 128x128, 200 ejecuciones:

| Metrica | Baseline | Optimizado | Mejora |
|---|---:|---:|---:|
| Latencia p50 extremo a extremo | 200,44 ms | 177,15 ms | 1,13x |
| Throughput | no disponible | 5,64 fps | no disponible |
| Memoria pico | 9,44 MB | 9,44 MB | 1,00x |
| Tamano del modelo | 0,34 MB | 0,18 MB | 1,89x menor |

Precision en BSD100 (split test, 100 muestras, runtime ExecuTorch):

| Metrica | Baseline | Optimizado | Cambio |
|---|---:|---:|---:|
| PSNR | 25,95 dB | 26,48 dB | +0,53 dB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que se trata de un modelo de vision embebido.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta disenado para NPUs embebidas con memoria pico de 9,44 MB.
- GPU recomendadas: no aplica; el destino es Cortex-M55 + Ethos-U85, no GPU de escritorio.
- Dispositivo de referencia: kit Alif Ensemble E8 (Cortex-M55 con Ethos-U85).
- Cabe en hardware embebido de gama muy baja: modelo de 0,18 MB, memoria pico de 9,44 MB.
- Opciones de despliegue: runtime ExecuTorch 1.1.0 con delegado Ethos-U. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: p50 de 177,15 ms y 5,64 fps en la configuracion de referencia; los resultados dependen del dispositivo, version del runtime, soporte del backend, configuracion de memoria y carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arm/sesr-m5-int8-ethos-u-executorch-alif-dk-e8 | no disponible (0,18 MB en disco) | no aplica (entrada 128x128) | PSNR 26,48 dB en BSD100; 177,15 ms p50 | BSD-3-Clause | HuggingFace, formato .pte |
| qualcomm/SESR-M5 (original) | no disponible (0,34 MB en disco) | no aplica | PSNR 25,95 dB en BSD100; 200,44 ms p50 | BSD-3-Clause | HuggingFace, formato PyTorch |
| Otros modelos de superresolucion embebida | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo original de Qualcomm, del que esta version deriva. No se dispone de datos sobre alternativas comparables de superresolucion para NPUs Ethos-U en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento depende del dispositivo destino, version del runtime, soporte del backend, configuracion de memoria y carga del sistema; los resultados no garantizan comportamiento identico en otros sistemas Arm.
- Este repositorio no sustituye la documentacion del modelo original; para datos de entrenamiento, sesgos y limitaciones del modelo base debe consultarse qualcomm/SESR-M5.
- La informacion del modelo original no ha sido verificada de forma independiente por Arm.
- No se realizo reentrenamiento ni fine-tuning; la optimizacion no pretendia alterar el comportamiento ni el uso previsto del modelo original.
- La validacion de precision se limita a BSD100 con 100 muestras; se recomienda reevaluar el modelo con datos propios antes de usarlo en produccion.
- La licencia BSD-3-Clause permite uso comercial con obligaciones de atribucion; debe revisarse junto con los terminos del modelo original.
- No hay informacion disponible sobre sesgos, riesgo de alucinacion (no aplica a vision) ni limitaciones de contexto o idioma.
- El modelo esta orientado a evaluacion y prototipado como implementacion de referencia, no como sustituto de documentacion o de modelos de mayor escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Arm/sesr-m5-int8-ethos-u-executorch-alif-dk-e8
- Modelo original: https://huggingface.co/qualcomm/SESR-M5
- Arm AI Model Optimizer: https://developer.arm.com/dev-docs/ai-model-optimizer/
- Licencia BSD-3-Clause: https://opensource.org/license/bsd-3-clause
