# odinjason/canary-de-int8

## Resumen

Canary-de-int8 es un paquete de reconocimiento automatico del habla (ASR) offline para aleman, distribuido como artefactos ONNX ya cuantizados en int8 y listos para su uso con la libreria sherpa-onnx. El repositorio lo publica el usuario odinjason y deriva directamente del modelo `csukuangfj/sherpa-onnx-nemo-canary-180m-flash-en-es-de-fr-int8`, que a su vez es una conversion del modelo NeMo Canary-180M-Flash de NVIDIA. No se trata de un modelo nuevo ni de un reentrenamiento: el autor no ha realizado ni reexportacion ni cuantizacion, sino que empaqueta los ficheros `encoder.int8.onnx`, `decoder.int8.onnx` y `tokens.txt` para su consumo directo.

El modelo subyacente es un transformer encoder-decoder de aproximadamente 180 millones de parametros, orientado a transcripcion de voz multilingue (ingles, espanol, aleman y frances) y con capacidad de traduccion speech-to-text. Su interes practico esta en el despliegue: al estar en int8 y en formato ONNX, puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para aplicaciones de escritorio, moviles o embebidos con reconocimiento de voz offline.

El repositorio es muy pequeno (0,2 GB) y registra cero descargas y cero likes en el momento de la consulta. La model card documenta pruebas con sherpa-onnx 2.0.1 sobre ficheros WAV alemanes (`de.wav`, `de_01.wav` a `de_05.wav` y `de_noisy.wav`), pero no incluye resultados numericos de precision (WER/CER) ni metricas de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia NVIDIA NeMo Canary), exportado a ONNX |
| Parametros totales | aproximadamente 180M (segun el nombre del modelo de origen) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante incluida en el repo) |
| Idiomas soportados | en, es, de, fr (segun la model card) |
| Licencia | CC-BY-4.0 (uso comercial y redistribucion permitidos con atribucion) |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `tokens.txt`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo NeMo Canary-180M-Flash de NVIDIA: un encoder-decoder de tipo transformer pensado para ASR y traduccion de voz. El encoder procesa las caracteristicas acusticas y el decoder genera la transcripcion (o traduccion) de forma autorregresiva. El modelo base esta entrenado de forma multilingue sobre en, es, de y fr, y el prefijo `flash` en la nomenclatura de NeMo alude a una variante optimizada para inferencia rapida.

Los detalles concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de decodificacion especulativa) no estan disponibles en la informacion proporcionada. El repositorio en si no aporta entrenamiento: solo redistribuye los artefactos ONNX int8 generados por el proyecto sherpa-onnx a partir del modelo NeMo original. La cuantizacion a int8 la realizo el pipeline de sherpa-onnx, no el autor de este repo.

## Capacidades

- Reconocimiento automatico del habla (ASR) offline en aleman, ingles, espanol y frances.
- Transcripcion de audio WAV; la model card verifica su funcionamiento con ficheros limpios (`de.wav`, `de_01.wav`..`de_05.wav`) y con audio ruidoso (`de_noisy.wav`).
- Capacidad de traduccion speech-to-text heredada del modelo Canary (segun la documentacion de sherpa-onnx sobre Canary).
- Ejecucion en CPU sin GPU gracias al formato ONNX int8.
- Integracion con sherpa-onnx (API Python, apps Flutter, etc.).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades de vision o audio generativo: no disponible (es un modelo ASR, no un modelo multimodal generativo).

## Casos de uso

- Subtitulado offline de reuniones en aleman: el modelo transcribe ficheros WAV completos en local, sin enviar audio a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Aplicaciones de escritorio con dictado por voz: al ejecutarse en CPU con ONNX int8, puede integrarse en herramientas ofimaticas o editores de texto para dictado en aleman, espanol, ingles o frances.
- Transcripcion en moviles o dispositivos embebidos: el tamano reducido (aproximadamente 180M parametros en int8) permite incluirlo en apps Flutter mediante sherpa-onnx, tal como menciona la model card.
- Procesado por lotes de archivos de audio historicos: util para digitalizar y transcribir archivos WAV en aleman de forma masiva en servidores sin GPU.
- Sistemas de atencion al cliente con transcripcion local: permite generar transcripciones de llamadas en aleman sin depender de servicios externos, cumpliendo con la licencia CC-BY-4.0 (con atribucion).
- Investigacion en ASR multilingue: sirve como linea base ligera y reproducible para comparar resultados de reconocimiento en en/es/de/fr con otros modelos ONNX de sherpa-onnx.
- Traduccion de voz a texto: el modelo Canary subyacente soporta traduccion speech-to-text, por lo que puede emplearse para generar traducciones de audio en los idiomas cubiertos (segun la documentacion de sherpa-onnx).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el modelo fue probado con sherpa-onnx 2.0.1 sobre ficheros WAV alemanes concretos, sin aportar cifras de WER, CER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser ONNX int8 de aproximadamente 180M parametros, esta disenado para inferencia en CPU y no requiere GPU.
- GPU recomendadas: no aplica; el formato ONNX int8 permite ejecucion en CPU. No se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el modelo esta pensado para CPU.
- Opciones de despliegue: sherpa-onnx (Python 2.0.1 verificado; Flutter 1.13.7 mencionado pero pendiente de verificacion en dispositivo). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Canary-de-int8 (este repo) | aproximadamente 180M | en, es, de, fr | ONNX int8 | CC-BY-4.0 | Paquete ASR offline para sherpa-onnx |
| csukuangfj/sherpa-onnx-nemo-canary-180m-flash-en-es-de-fr-int8 | aproximadamente 180M | en, es, de, fr | ONON int8 | no disponible en la informacion | Modelo de origen del que deriva este repo |
| Modelo NeMo Canary-180M-Flash original | aproximadamente 180M | en, es, de, fr | no disponible | no disponible en la informacion | Base de la conversion a sherpa-onnx |

No se dispone de datos de rendimiento comparativo (WER/CER) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no aporta entrenamiento ni ajustes propios: es un empaquetado de artefactos de terceros, por lo que cualquier limitacion del modelo Canary original se hereda integramente.
- No se han publicado metricas de precision (WER/CER) ni resultados sobre audio ruidoso mas alla de la mencion de `de_noisy.wav`; el rendimiento real en produccion es desconocido.
- La cobertura linguistica se limita a en, es, de y fr; no hay soporte documentado para otras lenguas ni para code-switching.
- Riesgo de alucinacion en transcripcion: no documentado en la informacion disponible, pero es un riesgo habitual en modelos encoder-decoder ASR.
- Sesgos: no documentados en la informacion disponible.
- La compatibilidad con Flutter 1.13.7 no esta verificada en dispositivo; la model card solo confirma pruebas con sherpa-onnx Python 2.0.1.
- La version minima de sherpa-onnx no esta fijada explicitamente en los ficheros del repo.
- Licencia CC-BY-4.0: permite uso comercial y redistribucion, pero exige atribucion al autor y al modelo de origen.
- El repo registra cero descargas y cero likes, y no consta pipeline ni idiomas declarados en los metadatos de Hugging Face; conviene verificar la integridad de los ficheros antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/odinjason/canary-de-int8
- Modelo de origen: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-canary-180m-flash-en-es-de-fr-int8
- Documentacion sherpa-onnx para Canary: https://k2-fsa.github.io/sherpa/onnx/nemo/canary.html
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
