# guest363/gigaam-v4-e2e-rnnt-int8-onnx

## Resumen

GigaAM-v4 e2e RNNT INT8 ONNX es una conversion optimizada del modelo de reconocimiento automatico del habla `ai-sage/GigaAM-v4`, publicado por el usuario `guest363` en Hugging Face. Se trata de una build ONNX pensada para inferencia local en CPU, con el encoder cuantizado a INT8 y el decodificador RNN-T mantenido en FP32. La arquitectura subyacente es Zapformer con decodificador RNN-T y una cabeza `e2e` que produce texto con puntuacion, mayusculas y normalizacion.

El modelo original lo desarrolla ai-sage y esta orientado principalmente al ruso, con soporte declarado tambien para ingles. Esta build concreta reduce el peso total de 921,3 MB (FP32) a 235,4 MB, manteniendo practicamente intacta la calidad medida en WER/CER sobre los conjuntos fleurs-ru, golos-farfield y golos-crowd, y alcanzando un RTF de 0,0204 (unas 49 veces mas rapido que tiempo real) en CPU con 8 hilos.

Es relevante para desarrolladores que necesiten transcripcion de audio en ruso en entornos sin GPU, con despliegue sencillo via ONNX Runtime y licencia MIT. La build fue preparada para la aplicacion Podtekst y es compatible con el runtime estandar de ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zapformer (encoder) + decodificador RNN-T, cabeza `e2e` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio por ventanas) |
| Tipos de cuantizacion | QInt8 simetrico (`per_channel=False`) en encoder; decodificador en FP32 |
| Idiomas soportados | ru, en |
| Licencia | MIT |
| Formato de pesos | ONNX (`rnnt_encoder.onnx`, `rnnt_advance.onnx`) + tokenizador SentencePiece |

## Arquitectura y entrenamiento

La build se basa en `ai-sage/GigaAM-v4`, un modelo ASR con encoder Zapformer y decodificador RNN-T. La exportacion a ONNX conserva unicamente la cabeza `e2e` (single-head export), eliminando la cabeza `raw` que el modelo original mantiene en paralelo. Esto reduce el decodificador `rnnt_advance.onnx` de 12,2 MB a 6,1 MB y acelera el decodificado aproximadamente un 31% sin alterar la salida de la cabeza `e2e`.

El encoder paso por `onnxruntime.quantization.shape_inference.quant_pre_process` y cuantizacion dinamica QInt8 solo en capas lineales (`MatMul`, `Gemm`), reduciendo su tamano de 909,1 MB a 229,4 MB. El autor indica que QInt8 con `per_channel=False` preservo la precision respecto a FP32, mientras que `per_channel=True` y QUInt8 mostraban degradacion en habla ruidosa y menor velocidad en x86_64. El decodificador se dejo en FP32 porque la cuantizacion de matrices pequenas (dimension 320) dentro del bucle de decodificado anadia sobrecarga. El grafo se preoptimizo con `ORT_ENABLE_ALL`, lo que reduce el tiempo de carga en frio a aproximadamente la mitad. No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens ni proceso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ruso, con soporte declarado de ingles.
- Salida con puntuacion, mayusculas y normalizacion de texto gracias a la cabeza `e2e`.
- Decodificacion RNN-T greedy integrada en el grafo ONNX (`rnnt_advance.onnx`).
- Ejecucion en CPU sin GPU mediante ONNX Runtime (`CPUExecutionProvider`).
- Tokenizacion SentencePiece con vocabulario de 1024 tokens; se incluye tambien un vocabulario de texto plano para runtimes sin SentencePiece.
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla del propio ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ruso: el modelo procesa audio de 16 kHz con features Mel de 64 bandas y devuelve texto puntuado y con mayusculas, adecuado para generar actas o resumenes posteriores.
- Subtitulado offline de contenido en ruso: con un RTF de 0,0204 en CPU, puede transcribir grandes volumenes de audio en servidores sin GPU, integrable en pipelines de postproduccion.
- Asistentes de voz locales: al ejecutarse en CPU con ONNX Runtime y ocupar 235,4 MB, encaja en aplicaciones de escritorio o edge donde no hay acelerador dedicado.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de archivos para construir indices de texto searchable en rusoparlantes.
- Atencion al cliente con analisis de llamadas: transcripcion de grabaciones telefonicas para control de calidad y analitica, con la ventaja de no requerir infraestructura GPU.
- Investigacion en ASR y evaluacion de cuantizacion: la build sirve como referencia reproducible para comparar WER/CER entre FP32 e INT8 sobre fleurs-ru y golos.
- Aplicaciones de accesibilidad: conversion de voz a texto en tiempo casi real en equipos de sobremesa sin tarjeta grafica.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando la build INT8 (235,4 MB) con la original FP32 (921,3 MB) en CPU (`CPUExecutionProvider`, 8 hilos):

| Conjunto | Archivos | FP32 WER / CER | INT8 WER / CER |
|---|---:|---:|---:|
| fleurs-ru/test | 50 | 0,0397 / 0,0174 | 0,0386 / 0,0172 |
| golos-farfield/farfield | 100 | 0,0430 / 0,0102 | 0,0430 / 0,0111 |
| golos-crowd/crowd | 300 | 0,1095 / 0,0753 | 0,1137 / 0,0746 |

Rendimiento: RTF de 0,0204 (unas 49 veces mas rapido que tiempo real) sobre 150 archivos y 813,4 segundos de audio; carga de sesiones en 0,64 s frente a 2,51 s en FP32.

## Requisitos de hardware

- Inferencia exclusivamente en CPU en esta build; no se documenta soporte GPU.
- Memoria RAM estimada: el encoder INT8 ocupa 229,4 MB y el decodificador 6,1 MB, por lo que el modelo cabe holgadamente en menos de 1 GB de RAM en ejecucion.
- CPU recomendada: x86_64 con al menos 8 hilos para alcanzar el RTF medido de 0,0204; el autor reporta mejor comportamiento de QInt8 frente a QUInt8 en x86_64.
- Cabe en cualquier equipo de consumo actual; no requiere GPU dedicada.
- Despliegue via ONNX Runtime (`CPUExecutionProvider`). Se recomienda `ORT_DISABLE_ALL` al cargar, ya que el grafo viene preoptimizado con `ORT_ENABLE_ALL`.
- Latencia y throughput: aproximadamente 49x tiempo real con 8 hilos; carga de sesion en 0,64 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GigaAM-v4 e2e RNNT INT8 ONNX (esta build) | no disponible | no disponible | ru, en | MIT | ONNX INT8/FP32 | 235,4 MB, RTF 0,0204 en CPU |
| ai-sage/GigaAM-v4 (original FP32) | no disponible | no disponible | ru, en | MIT | PyTorch | 921,3 MB, dos cabezas (`e2e` y `raw`) |
| Whisper (variantes de OpenAI) | variable (39M-1,55B) | 30 s de audio | multilingue | MIT | PyTorch, GGUF, ONNX | Referencia generalista; no disponible comparacion directa de WER en ruso en esta informacion |

No se dispone de datos de benchmarks comparativos directos con otros modelos ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo orientado principalmente al ruso; el soporte de ingles esta declarado pero no se aportan metricas de calidad en ese idioma.
- WER notablemente superior en audio ruidoso o de multitud: 0,1137 en golos-crowd frente a 0,0386 en fleurs-ru.
- Riesgo de errores de transcripcion en nombres propios, terminos tecnicos y acentos no cubiertos por el entrenamiento original.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre corpus rusos puede reflejar sesgos de esos datos.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base `ai-sage/GigaAM-v4` y de los datasets de evaluacion empleados.
- La build esta pensada para CPU; no se garantiza rendimiento en GPU ni en otros backends distintos de ONNX Runtime.
- Requiere respetar exactamente los parametros de features (`center=False`, `n_mels=64`, `n_fft=320`, `hop_length=160`, `mel_scale="htk"`, sin preemphasis) para obtener resultados correctos.

## Enlaces

- Hugging Face: https://huggingface.co/guest363/gigaam-v4-e2e-rnnt-int8-onnx
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
