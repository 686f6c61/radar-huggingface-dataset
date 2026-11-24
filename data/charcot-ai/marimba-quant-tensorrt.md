# charcot-ai/marimba-quant-tensorrt

## Resumen

Marimba-quant-tensorrt es el repositorio de motores TensorRT (y los grafos ONNX de los que se construyen) del codificador de audio del modelo Marimba, desarrollado por charcot-ai. No es un modelo de lenguaje ni un modelo de audio completo: contiene exclusivamente la torre de audio congelada de Qwen/Qwen3-ASR-0.6B, exportada a ONNX y compilada a motores TensorRT en fp32, fp16 e INT8. Las cabezas de decisión y la API de preguntas tipadas residen en el modelo base charcot-ai/marimba y en el paquete `marimba-audio`, no en este repositorio.

El objetivo del repositorio es servir como artefacto de despliegue optimizado para inferencia en GPU NVIDIA. El codificador se divide en dos grafos sin pesos compartidos (`part_a`: log-mel [B, 128, 800] hasta los estados ocultos de las capas 9 y 12, cada uno [B, 104, 896]; `part_b`: capa 12 hasta capa 18), de modo que un consumidor que solo necesita las capas 9 y 12 nunca ejecuta las seis últimas. Marimba lee los estados ocultos de las capas 9, 12 y 18 y responde preguntas tipadas sobre ventanas de ocho segundos de habla mediante cabezas pequeñas.

La relevancia del artefacto está en su evaluación cuantitativa: la model card documenta AUROC por tarea, cambios de decisión respecto a la referencia fp32 y latencias p50 en una NVIDIA L4 para cada variante de cuantización. Es un caso poco habitual de publicación de resultados negativos (la variante fp16 de tipado débil con TensorRT 10.12 diverge gravemente) junto a los positivos, lo que lo hace útil como referencia para quien planifique un pipeline similar de exportación ONNX a TensorRT para audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de audio de Qwen/Qwen3-ASR-0.6B, congelada); dos grafos ONNX independientes (`part_a` capas 1-12, `part_b` capas 12-18) |
| Parametros totales | no disponible (el repo pesa 5,4 GB e incluye multiples grafos ONNX y motores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada fija de log-mel [B, 128, 800] (ventanas de 8 s a 16 kHz mono) |
| Tipos de cuantizacion | fp32, fp16 (tipado fuerte y debil), INT8 Q/DQ (completo, parcial hasta capa 12, y solo en las tres convoluciones de `part_a`) |
| Idiomas soportados | no disponible (el codificador es agnostico al idioma; la evaluacion usa FLEURS `pt_br` entre otros conjuntos) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) y motores TensorRT serializados (`.engine`/`.plan`), mas programas Torch-TensorRT (`.ep`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: parte del codificador de audio congelado de Qwen/Qwen3-ASR-0.6B y lo exporta a ONNX en cuatro variantes de grafo (fp16, fp32, INT8 Q/DQ completo, INT8 Q/DQ solo en `part_a` y INT8 Q/DQ solo en las tres convoluciones de `part_a`). Sobre esos grafos se compilan motores TensorRT con dos versiones del compilador (10.12.0.36 y 10.16.1.11) en una NVIDIA L4, ademas de programas Torch-TensorRT 2.8.0. El script `marimba_trt.py` carga pares de motores y permite reconstruirlos desde los ONNX (unos sesenta segundos en una L4).

La division en dos grafos es la decision de diseno mas relevante: `part_a` produce los estados ocultos de las capas 9 y 12 ([B, 104, 896]) y `part_b` transforma el estado de la capa 12 en el de la capa 18. Como no comparten pesos, las preguntas que solo dependen de las capas 9 y 12 evitan ejecutar las seis capas finales. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, porque el codificador se hereda de Qwen3-ASR y no se reentrena aqui.

## Capacidades

- Extraccion de caracteristicas de audio: convierte log-mel [B, 128, 800] en estados ocultos de las capas 9, 12 y 18 con forma [B, 104, 896].
- Soporte de las seis decisiones de Marimba a traves de las cabezas del modelo base: `turn_end`, `voice_activity` (ultimo segundo y ventana completa de 8 s), `same_speaker`, `speaker_change` y `speaker_count`.
- Procesamiento por lotes (batch) de ventanas de audio, con perfiles de batch simple y doble en algunas variantes fp16.
- Ejecucion en GPU NVIDIA via TensorRT, con motores precompilados para L4 y reconstruibles para otras GPU desde los ONNX.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni tool calling: es exclusivamente un codificador.
- No soporta vision, audio generativo ni modo thinking.

## Casos de uso

- Deteccion de fin de turno en asistentes de voz: el codificador alimenta la cabeza `turn_end` (AUROC 0,9310 en la referencia fp32), lo que permite decidir cuando el usuario ha terminado de hablar en conversaciones multi-turno de baja latencia.
- Deteccion de actividad de voz (VAD): la cabeza `voice_activity` alcanza AUROC 0,9969 en el ultimo segundo y 0,9999 en la ventana completa, adecuada para segmentar audio antes de enviarlo a un ASR o a un pipeline de diarizacion.
- Diarizacion ligera: las cabezas `same_speaker` y `speaker_change` (AUROC 0,9926 y 0,9557 respectivamente) permiten atribuir turnos y detectar cambios de hablante en reuniones o llamadas sin un modelo de diarizacion completo.
- Conteo de hablantes en ventanas cortas: la cabeza `speaker_count` (precision 0,7862 en fp32) sirve para estimar cuantos interlocutores hay en un fragmento de ocho segundos, util en analitica de reuniones.
- Despliegue en produccion con requisitos de latencia y memoria: las variantes INT8 parciales reducen el artefacto de 745 MB en memoria (fp32) a 249 MB (`trt-int8-a`) o 192 MB (`trt-int8`), lo que permite servir en GPU de 24 GB con margen para otros componentes.
- Evaluacion de pipelines de cuantizacion: el repositorio documenta que `trt-int8` degrada `turn_end` de 0,9310 a 0,8151 AUROC y cambia 409 decisiones, mientras que `trt-int8-conv` mantiene 0,9304 con 49 cambios; sirve como referencia para elegir el punto de cuantizacion.
- Integracion en entornos con version de TensorRT fija: al publicar motores para 10.12.0.36 y 10.16.1.11, permite desplegar sin recompilar en infraestructuras con esas versiones, y reconstruir en otras GPU en aproximadamente un minuto.

## Benchmarks y rendimiento

Evaluacion sobre 1.170 ventanas publicas de ocho segundos (16 kHz mono) de Smart Turn v3.2 test, VoxConverse test, AMI IHM test, ESC-50 (clases sin sonidos humanos) y FLEURS `pt_br` validation. Motores compilados con TensorRT 10.12.0.36 en NVIDIA L4:

| Artefacto | Esquema | Tamano (MB) | `turn_end` AUROC | `voice_activity` AUROC (1 s) | `voice_activity` AUROC (8 s) | `same_speaker` AUROC | `speaker_change` AUROC | `speaker_count` accuracy | Cambio max. de probabilidad vs. fp32 | Decisiones cambiadas |
|---|---|---|---|---|---|---|---|---|---|---|
| fp32 referencia (PyTorch, CPU) | float 32 bits | 745 (en memoria) | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | - | - |
| `trt-fp16-strong` | fp16 tipado fuerte | 377 | 0,9308 | 0,9969 | 0,9999 | 0,9927 | 0,9557 | 0,7851 | 0,082 | 4 |
| `trt-fp16-strong-2p` | fp16 tipado fuerte, dos perfiles de batch | 489 | 0,9308 | 0,9969 | 0,9999 | 0,9927 | 0,9557 | 0,7851 | 0,082 | 4 |
| `torchtrt-fp16-strong` | fp16 tipado explicito (Torch-TensorRT) | 502 | 0,9311 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 0,083 | 3 |
| `trt-int8-a` | INT8 Q/DQ hasta capa 12, fp16 por encima | 249 | 0,9294 | 0,9968 | 0,9999 | 0,9945 | 0,9559 | 0,7874 | 0,482 | 132 |
| `trt-int8-conv` | INT8 Q/DQ solo en convoluciones, fp16 resto | 373 | 0,9304 | 0,9969 | 0,9999 | 0,9927 | 0,9561 | 0,7885 | 0,470 | 49 |
| `trt-int8` | INT8 Q/DQ completo, fp16 donde no se cuantiza | 192 | 0,8151 | 0,9968 | 0,9999 | 0,9945 | 0,9559 | 0,7874 | 0,946 | 409 |
| `trt-fp16` | fp16 elegido por TensorRT (tipado debil) | 377 | 0,5029 | 0,3805 | 0,3098 | 0,6281 | 0,5431 | 0,2805 | 1,000 | 3579 |
| `trt-fp32` | float 32 bits | 743 | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 0,004 | 1 |

Mismos grafos ONNX compilados con TensorRT 10.16.1.11 en la misma GPU:

| Artefacto | Esquema | Tamano (MB) | `turn_end` AUROC | `voice_activity` AUROC (1 s) | `voice_activity` AUROC (8 s) | `same_speaker` AUROC | `speaker_change` AUROC | `speaker_count` accuracy | Cambio max. de probabilidad vs. fp32 | Decisiones cambiadas |
|---|---|---|---|---|---|---|---|---|---|---|
| `trt-fp16` | fp16 elegido por TensorRT (tipado debil) | 376 | 0,9307 | 0,9969 | 0,9999 | 0,9928 | 0,9558 | 0,7862 | 0,066 | 5 |
| `trt-fp16-strong` | fp16 tipado fuerte | 376 | 0,9308 | 0,9969 | 0,9999 | 0,9927 | 0,9557 | 0,7851 | 0,082 | 4 |

Latencia p50 en una NVIDIA L4 (24 GB), host AMD EPYC 9254, PyTorch 2.8.0+cu128 con 4 hilos de CPU y un proceso; una llamada toma B ventanas de audio crudo, calcula el log-mel en GPU, ejecuta el codificador y copia los estados ocultos a host. La model card incluye la tabla de latencias (capas 1-12 y 1-18, batch 1 y 16, y ventanas/s) pero el texto proporcionado queda truncado, por lo que los valores numericos de latencia no estan disponibles en esta informacion.

## Requisitos de hardware

- VRAM estimada: el artefacto mas pequeno es `trt-int8` con 192 MB; `trt-int8-a` ocupa 249 MB; las variantes fp16 entre 376 y 502 MB; fp32 743-745 MB. A esto hay que sumar el contexto de ejecucion de TensorRT y los buffers de activaciones, no cuantificados en la model card.
- GPU de referencia de la evaluacion: NVIDIA L4 (24 GB). Los motores publicados solo cargan en el modelo de GPU y la version de TensorRT con los que se construyeron.
- Para otras GPU hay que reconstruir los motores desde los grafos ONNX; segun el autor, tarda aproximadamente un minuto en una L4.
- No cabe en GPU de consumo en el sentido estricto del termino: los motores se compilan para arquitecturas de datacenter (L4); no se documenta compatibilidad con RTX 4090 u otras GeForce.
- Opciones de despliegue: TensorRT nativo (motores precompilados o reconstruidos), Torch-TensorRT 2.8.0 (programas `.ep`), y via ONNX Runtime u otros runtimes ONNX a partir de los grafos publicados.
- Throughput y latencia: la model card reporta tablas de latencia p50 por variante y batch, pero los valores concretos no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charcot-ai/marimba-quant-tensorrt | Codificador de audio cuantizado (TensorRT/ONNX) | no disponible | Ventanas de 8 s, log-mel [B, 128, 800] | Apache 2.0 | Hugging Face |
| charcot-ai/marimba | Modelo base con cabezas y API de preguntas | no disponible | Ventanas de 8 s | no disponible en esta informacion | Hugging Face |
| Qwen/Qwen3-ASR-0.6B | Modelo ASR completo (origen de la torre de audio) | 0,6 mil millones (nominal) | no disponible | no disponible en esta informacion | Hugging Face |

La comparacion con alternativas de cuantizacion de audio de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el codificador; sin las cabezas y la API de `charcot-ai/marimba` y el paquete `marimba-audio` no produce ninguna decision util.
- Los motores TensorRT publicados solo cargan en el modelo de GPU y la version de TensorRT exactos con los que se construyeron; en cualquier otra configuracion hay que recompilar desde los ONNX.
- La variante `trt-fp16` (tipado debil) con TensorRT 10.12.0.36 es un caso de fallo documentado: `turn_end` AUROC cae de 0,9310 a 0,5029 y cambia 3.579 decisiones. Con 10.16.1.11 el mismo grafo da 0,9307. No debe desplegarse sin verificar la version de TensorRT.
- `trt-int8` completo degrada `turn_end` a 0,8151 AUROC y cambia 409 decisiones; las variantes INT8 parciales (`trt-int8-a`, `trt-int8-conv`) mantienen las AUROC pero mueven las probabilidades individuales mucho mas que fp16 (hasta 0,482 frente a 0,083).
- La evaluacion se limita a 1.170 ventanas de ocho segundos de cinco conjuntos publicos, con FLEURS unicamente en `pt_br`; no hay evidencia de comportamiento en otros idiomas ni en audio de mas de ocho segundos.
- No se documentan sesgos especificos del codificador; al heredarse de Qwen3-ASR, los sesgos de ese modelo podrian propagarse, pero no estan cuantificados en esta informacion.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero las cabezas pueden producir decisiones erroneas en audio fuera de dominio; la precision de `speaker_count` (0,7862) es la metrica mas baja de las seis.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del codificador de origen (Qwen3-ASR) antes de redistribuir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/charcot-ai/marimba-quant-tensorrt
- Modelo base Marimba: https://huggingface.co/charcot-ai/marimba
- Codificador de origen: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
