# cchiou-amba/Conformer

## Resumen

Conformer-CTC Small (Ambarella N1-655 CVflow v3 NVP) es un modelo de reconocimiento automatico del habla (ASR) en ingles basado en la arquitectura Conformer, un transformer aumentado con convoluciones que combina capas de atencion con convoluciones depthwise para capturar dependencias locales y globales en la senal de audio. El modelo original procede del trabajo de Gulati et al. (2020) y se entrena con perdida CTC (Connectionist Temporal Classification) sobre el conjunto NeMo ASRSet, que incluye LibriSpeech, Fisher, Switchboard, WSJ, NSC y Mozilla Common Voice.

Esta publicacion concreta no es el modelo original, sino un port optimizado por Ambarella International LLC para su SoC N1-655 con acelerador CVflow v3. El autor ha fijado la dimension temporal dinamica a una ventana estatica de 10,24 segundos, ha cuantizado los pesos a una mezcla FP16/INT8 y ha compilado el grafo a un binario DAG propietario de Cavalry (`n1-655_conformer_ctc_small_amba_optimized.bin`) mediante `cavalry_gen 3.0.4`.

El modelo es relevante para desarrolladores que trabajen con IA embebida en hardware Ambarella: demuestra un flujo completo de conversion ONNX, cuantizacion mixta y despliegue de un ASR transformer en un acelerador de borde, manteniendo la licencia Apache-2.0 del modelo upstream de NVIDIA NeMo y sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (transformer con convoluciones depthwise), CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de audio de 10,24 s (`[1, 80, 1024]`) |
| Tipos de cuantizacion | mixta FP16/INT8 (via Ambarella CNNGen) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | binario Cavalry DAG CVflow v3 (`.bin`); original en ONNX/NeMo |
| Entrada | `audio_signal` `[1, 80, 1024]` FP16, log-Mel Kaldi de 80 bins, ventana Povey 25 ms, hop 10 ms |
| Salida | `logprobs` `[1, 256, 1025]` FP16, CTC greedy, blank ID 1024 |
| SoC objetivo | Ambarella N1-655 (`vdg_arch = 0xB`, CVflow v3) |
| Herramienta de compilacion | `cavalry_gen 3.0.4` (CNNGen 3.9.0 / n1-655x) |

## Arquitectura y entrenamiento

La arquitectura Conformer combina bloques de atencion multi-cabeza con modulos convolucionales (convoluciones depthwise) intercalados, lo que permite modelar tanto dependencias de largo alcance como patrones acusticos locales de corta duracion. El modelo se entrena con perdida CTC, lo que evita la necesidad de alineamientos forzados y permite decodificacion greedy directa sobre la matriz de log-probabilidades de salida.

Los datos de entrenamiento proceden del NeMo ASRSet (LibriSpeech, Fisher, Switchboard, WSJ, NSC y Mozilla Common Voice), segun declara la model card. No se especifica el numero de tokens ni el volumen total de horas de audio. En esta publicacion, Ambarella ha fijado la dimension temporal a 1024 frames, ha aplicado cuantizacion mixta FP16/INT8 mediante `onnx_surgery` y `vas` dentro del pipeline CNNGen, y ha compilado el grafo resultante al formato DAG propietario de Cavalry para el acelerador CVflow v3 del N1-655.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio de 16 kHz.
- Extraccion de caracteristicas log-Mel Kaldi de 80 bins con normalizacion por feature (media/desviacion estandar).
- Decodificacion CTC greedy con blank ID 1024 contra el fichero `tokens.txt`.
- Inferencia en hardware embebido Ambarella N1-655 con aceleracion CVflow v3.
- Procesamiento de ventanas de audio de hasta 10,24 segundos por inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multimodal (sin vision ni audio generativo).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Transcripcion de voz en dispositivos de borde con SoC Ambarella N1-655: el modelo se ejecuta como binario CVflow compilado, permitiendo ASR local en camaras, wearables o dispositivos IoT sin enviar audio a la nube.
- Subtitulado automatico en ingles para grabaciones de hasta 10 segundos por segmento: util para pipelines de transcripcion por chunks con solapamiento controlado.
- Asistentes de voz embebidos en ingles: la salida CTC permite decodificacion greedy de baja latencia sobre el acelerador, adecuada para comandos y dictado corto.
- Preprocesado de audio para analitica: transcripcion masiva de clips cortos en plataformas de monitorizacion o compliance con procesamiento local.
- Evaluacion de pipelines de cuantizacion: sirve como referencia para validar flujos ONNX a CNNGen a Cavalry en otros modelos transformer de audio.
- Prototipado de ASR en hardware Ambarella: permite medir latencia, consumo y precision del acelerador CVflow v3 con un modelo Conformer real antes de invertir en fine-tuning propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Ambarella N1-655 con acelerador CVflow v3 (`vdg_arch = 0xB`).
- No esta pensado para GPU de servidor ni consumer: el binario generado es especifico para el DAG Cavalry del N1-655 y no es portable a CUDA, ROCm ni Metal.
- No se dispone de estimaciones de VRAM porque el modelo no se ejecuta en GPU; el consumo es el del acelerador embebido.
- Opciones de despliegue: runtime propietario de Ambarella CVflow v3; el modelo upstream equivalente puede ejecutarse con NVIDIA NeMo o sherpa-onnx sobre CPU/GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Conformer-CTC Small (Ambarella N1-655) | no disponible | 10,24 s fijos | ingles | Apache-2.0 | binario Cavalry CVflow v3 |
| csukuangfj/sherpa-onnx-nemo-ctc-en-conformer-small | no disponible | dinamico | ingles | Apache-2.0 | ONNX |
| NVIDIA NeMo `stt_en_conformer_ctc_small` | no disponible | dinamico | ingles | Apache-2.0 | NeMo / ONNX |

La diferencia principal frente a los modelos upstream es el formato de despliegue: el modelo de Ambarella esta compilado y cuantizado para un acelerador concreto, mientras que las versiones NeMo y sherpa-onnx mantienen la ventana temporal dinamica y se ejecutan en CPU/GPU de proposito general.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- La ventana de audio esta fijada a 10,24 segundos: audios mas largos requieren segmentacion externa y audios mas cortos deben rellenarse.
- El binario es especifico del SoC Ambarella N1-655 con CVflow v3; no es portable a otro hardware.
- La cuantizacion mixta FP16/INT8 puede degradar la precision respecto al modelo original en FP32.
- Riesgo de alucinacion o transcripciones erroneas en audio con ruido, acentos no representados en el dataset o dominios alejados de LibriSpeech/Switchboard.
- No dispone de marcas de tiempo por palabra ni de puntuacion; la salida es CTC greedy sobre tokens.
- Aunque la licencia es Apache-2.0, el uso comercial del binario esta sujeto a los terminos del runtime y herramientas de Ambarella, que no se detallan en la model card.
- El repositorio tiene 0,0 GB declarados y 36 descargas, lo que sugiere que el binario podria no estar completamente subido o que la publicacion es muy reciente; conviene verificar la integridad antes de usarlo en produccion.
- No se han publicado metricas de WER ni comparativas de rendimiento frente al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/cchiou-amba/Conformer
- Binario: https://huggingface.co/cchiou-amba/Conformer/blob/main/n1-655_conformer_ctc_small_amba_optimized.bin
- Paper Conformer: https://arxiv.org/abs/2005.08100
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Modelo upstream sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-ctc-en-conformer-small
