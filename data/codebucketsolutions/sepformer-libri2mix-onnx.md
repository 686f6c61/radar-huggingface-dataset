# codebucketsolutions/sepformer-libri2mix-onnx

## Resumen

SepFormer Libri2Mix ONNX es una exportación a formato ONNX del modelo original `speechbrain/sepformer-libri2mix` de SpeechBrain, orientada a la separación de dos hablantes en audio mono. La conversión la ha realizado el autor `codebucketsolutions` para su uso dentro del servidor de voz `bolo`, que prescinde de PyTorch en tiempo de inferencia. Los pesos son idénticos a los del modelo original; no se trata de un reentrenamiento ni de una versión oficial de SpeechBrain.

El modelo resuelve el problema de la separación de fuentes en audio (speech separation): a partir de una mezcla mono de 8 kHz con dos voces solapadas, devuelve dos pistas separadas. Es relevante porque permite desplegar esta tarea en entornos sin PyTorch, usando únicamente ONNX Runtime, lo que simplifica la integración en servidores ligeros y pipelines de audio. El repositorio ocupa aproximadamente 0,1 GB y el grafo usa opset 17 en float32.

La arquitectura subyacente es SepFormer, un transformer basado en atención con encoder, red de enmascaramiento y decoder, entrenado con pérdida invariante a escala (SI-SNR). El nivel de salida es arbitrario por diseño. La memoria crece rápidamente con la longitud de entrada (varios GB por minuto de audio), por lo que grabaciones largas deben procesarse por ventanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SepFormer (transformer de separación de hablantes, encoder/masking network/decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada mono de longitud variable `[1, T]` a 8 kHz) |
| Tipos de cuantizacion | float32 (ONNX, opset 17); no se documentan otras |
| Idiomas soportados | no disponible (entrenado sobre LibriSpeech, audio en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`sepformer.onnx`) + metadatos `speechbrain_onnx.json` |

## Arquitectura y entrenamiento

El modelo es SepFormer, una arquitectura transformer diseñada para separación de hablantes. El grafo ONNX incluye las tres partes de `SepformerSeparation.separate_batch`: el encoder (que procesa la señal en tramos de 8 muestras), la red de enmascaramiento (masking network) y el decoder. La entrada es `mixture` float32 `[1, T]` mono a 8 kHz y la salida es `sources` float32 `[1, 8 * ((T - 16) // 8) + 16, 2]`, con las pistas rellenadas con ceros hasta la longitud de entrada cuando es necesario.

El entrenamiento original lo realizó el equipo de SpeechBrain sobre Libri2Mix, que combina mezclas de audiolibros leídos de LibriSpeech (CC BY 4.0); las variantes ruidosas de LibriMix añaden ruido WHAM! (CC BY-NC 4.0). La pérdida es invariante a escala (SI-SNR), de modo que la amplitud de la salida es arbitraria. SpeechBrain reporta 20,6 dB SI-SNRi y 20,9 dB SDRi sobre el conjunto de test de Libri2Mix. La exportación ONNX se ha validado frente a SpeechBrain 1.1.2 (torch 2.15.0+cpu) y ONNX Runtime 1.32.0, con diferencias absolutas máximas entre 1,99e-05 y 2,18e-03 según la longitud de entrada, y SI-SNR mínimo por pista de 67,3 dB a 96,6 dB en las pruebas documentadas.

## Capacidades

- Separación de dos hablantes solapados en audio mono de 8 kHz, devolviendo dos pistas independientes.
- Procesamiento de entradas de longitud variable con relleno por tramos de 8 muestras.
- Ejecución sin PyTorch mediante ONNX Runtime, lo que facilita el despliegue en entornos ligeros.
- Paridad numérica documentada con la implementación PyTorch original (diferencias en el orden de 1e-05 a 1e-03 y SI-SNR alto por pista).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de audio.
- No documenta capacidades multilingües explícitas; el entrenamiento original se basa en audio en inglés.
- No incluye modo de razonamiento (thinking), visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones con solapamiento: separar las dos voces antes de pasarlas a un sistema ASR, de modo que cada pista se transcriba por separado y se reduzcan las mezclas de hablantes en la salida.
- Diarización asistida en llamadas de dos participantes: usar las dos pistas de salida como entrada a un diarizador o a un modelo de reconocimiento de hablante para atribuir turnos.
- Preprocesado en pipelines de voz para agentes conversacionales: limpiar mezclas de dos voces antes de la detección de actividad o del reconocimiento, ejecutando el grafo ONNX en el mismo servidor sin PyTorch.
- Servidores de voz ligeros: integrar `sepformer.onnx` en un servicio basado en ONNX Runtime (como el servidor `bolo`) para separar audio en tiempo casi real por ventanas.
- Investigación en separación de fuentes: usar la exportación ONNX como referencia reproducible para comparar implementaciones, con los SHA-256 y el script de exportación incluidos en el repositorio.
- Archivado y postproducción de audio: separar dos voces grabadas en una única pista mono de 8 kHz para su posterior edición o reinserción.
- Evaluación de robustez de ASR: generar mezclas de dos hablantes y medir el impacto de la separación previa en la calidad de transcripción.

## Benchmarks y rendimiento

Datos de paridad documentados por el autor (ONNX frente a PyTorch, CPU):

| Entrada | Diferencia absoluta máxima | SI-SNR mínimo de ONNX frente a PyTorch, por pista |
|---|---|---|
| Ruido, 4003 muestras | 1,99e-05 | 85,6 dB |
| Ruido, 3008 muestras | 2,24e-05 | 83,8 dB |
| Ruido, 24000 muestras | 2,18e-03 | 74,8 dB |
| Ruido, 56005 muestras | 1,04e-03 | 67,3 dB |
| en-long + en-short | 2,88e-04 | 96,6 dB |
| en-long + hi-short | 7,20e-04 | 88,2 dB |
| en-short + hi-short | 1,83e-03 | 82,8 dB |

Calidad reportada por SpeechBrain sobre el modelo original: 20,6 dB SI-SNRi y 20,9 dB SDRi en el test de Libri2Mix. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el grafo es float32 y el repositorio ocupa unos 0,1 GB, por lo que la memoria de pesos es reducida, pero la memoria de activaciones crece con la longitud (varios GB por minuto de audio según el autor).
- GPU recomendadas: no disponible; el autor valida la paridad en CPU con ONNX Runtime 1.32.0.
- Cabe en GPU de consumo: probablemente sí para ventanas cortas, dado el tamaño del repositorio (0,1 GB), aunque no hay cifras oficiales de VRAM.
- Opciones de despliegue: ONNX Runtime (validado), servidor `bolo` de voz; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el autor advierte que grabaciones largas deben procesarse por ventanas por el crecimiento de memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SepFormer Libri2Mix ONNX (este) | ONNX, separación 2 hablantes | Mono 8 kHz, longitud variable | 20,6 dB SI-SNRi / 20,9 dB SDRi (original) | Apache-2.0 | Hugging Face |
| speechbrain/sepformer-libri2mix | PyTorch, separación 2 hablantes | Mono 8 kHz, longitud variable | 20,6 dB SI-SNRi / 20,9 dB SDRi | Apache-2.0 | Hugging Face |
| Otros modelos de separación de hablantes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El nivel de salida es arbitrario por la pérdida invariante a escala (SI-SNR); no debe interpretarse la amplitud como información fiable.
- La memoria crece rápidamente con la longitud de entrada (varios GB por minuto de audio); es necesario procesar por ventanas.
- Diseñado para mezclas de dos hablantes; no se documenta soporte para más de dos fuentes.
- Entrada limitada a mono a 8 kHz; no se documenta resampleo ni soporte de otras frecuencias.
- Entrenado sobre Libri2Mix (audio en inglés de LibriSpeech); el rendimiento en otros idiomas no está documentado.
- Las variantes ruidosas de LibriMix incorporan ruido WHAM! con licencia CC BY-NC 4.0, lo que puede afectar a usos comerciales del modelo derivado de esos datos.
- Es una exportación no oficial de SpeechBrain; el autor recomienda citar SpeechBrain y el paper del modelo original.
- Riesgo de sesgos heredados de LibriSpeech (audiolibros en inglés) y de alucinación no aplica en el sentido generativo, pero la separación puede producir artefactos en mezclas muy solapadas.
- La inferencia está marcada como `inference: false` en los metadatos de la model card, lo que conviene verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/sepformer-libri2mix-onnx
- Modelo base: https://huggingface.co/speechbrain/sepformer-libri2mix
- Repositorio del servidor `bolo`: https://github.com/cB-Sigma/bolo-speech
- Script de exportación: `server/tools/export_speechbrain_onnx.py` en el repositorio de `bolo`
- Metadatos de exportación: `speechbrain_onnx.json` (incluido en el repositorio del modelo)
- Datos de paridad: `parity.json` (incluido en el repositorio del modelo)
