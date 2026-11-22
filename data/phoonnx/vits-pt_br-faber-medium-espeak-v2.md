# Phoonnx/vits-pt_br-faber-medium-espeak-v2

## Resumen

`Phoonnx/vits-pt_br-faber-medium-espeak-v2` es una voz de síntesis de voz (text-to-speech) en portugués de Brasil, empaquetada en formato ONNX para su uso con la librería phoonnx. Se trata de una conversión del modelo upstream `rhasspy/piper-voices` (ruta `pt/pt_BR/faber/medium`), entrenado por Rhasspy y publicado bajo licencia CC0 1.0. La arquitectura es VITS (Variational Inference for Text-to-Speech), el mismo motor que emplea el ecosistema Piper, con una única hablante y una frecuencia de muestreo de 22050 Hz.

El modelo resuelve el problema de disponer de una voz TTS ligera, de calidad media y ejecutable en CPU, sin dependencias de GPU. Su entrada es texto fonemizado mediante espeak-ng (voz `pt-br`, alfabeto IPA), y el repositorio incluye tanto los grafos en fp32 como copias cuantizadas en int8 generadas con `onnxruntime.quantization.quantize_dynamic`. La versión `v2` sustituye a `Phoonnx/vits-pt_br-faber-medium-espeak`, que conservaba los pesos anteriores; el upstream ha reentrenado la voz sobre los modelos base Piper 1.5 (commit `e9c8a39444`).

Es relevante ahora porque permite integrar TTS en portugués de Brasil en asistentes locales (OVOS, Mycroft) y en pipelines sin GPU, con una huella de memoria moderada y un factor de tiempo real (RTF) bajo en hardware consumer. El tamaño del repositorio es de aproximadamente 0,1 GB, y el modelo está pensado para despliegues de bajo coste y ejecución en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto fonemizado) |
| Tipos de cuantizacion | fp32 y int8 (QInt8, `quantize_dynamic` de onnxruntime 1.32.0) |
| Idiomas soportados | portugués de Brasil (`pt-BR`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador basado en normalizing flows y un vocoder HiFi-GAN, todo entrenado de forma conjunta. En este caso concreto se trata de la variante Piper, con una única hablante y salida a 22050 Hz. La entrada es texto convertido a fonemas mediante espeak-ng (voz `pt-br`, alfabeto IPA), y el modelo fue entrenado conservando la puntuación de cláusula (`, . ! ? : ;`), que phoonnx 1.96.1a1 y posteriores mantienen en la síntesis.

Según la model card, el upstream se entrenó mediante fine-tuning a partir del modelo base `hifi_tts_92` (calidad media, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), aplicando MRD y SDP. Los datos de entrenamiento proceden de `OHF-Voice/voice-datasets` bajo licencia CC0, aunque el número de horas y la composición exacta del dataset no están registrados upstream. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333, y se requiere Piper 1.5 o superior. La conversión a ONNX no altera los pesos originales; las copias int8 sí los cuantizan.

## Capacidades

- Síntesis de voz en portugués de Brasil (`pt-BR`) a partir de texto, con una única hablante.
- Fonemización mediante espeak-ng (voz `pt-br`, IPA); también disponible un port (`espyak`) instalable con `phoonnx[espeak]`, con posibles divergencias fonéticas.
- Soporte de puntuación de cláusula (`, . ! ? : ;`) en la síntesis.
- Salida de audio a 22050 Hz, exportable a WAV.
- Ejecución en CPU sin GPU, con grafos fp32 e int8.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es un modelo puramente TTS.

## Casos de uso

- Asistentes de voz locales en portugués de Brasil: integración en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper/pt_BR-faber-medium-v2` en `mycroft.conf` para respuestas habladas en tiempo real sin depender de servicios en la nube.
- Lectura de textos en aplicaciones de accesibilidad: conversión de documentos o notificaciones a audio WAV con una huella de memoria de ~263 MB en fp32 y ~223 MB en int8, adecuada para dispositivos de gama baja.
- Síntesis en el borde (edge computing): el grafo int8 ocupa 18,7 MB y alcanza un RTF de 0,100 en un Intel i9-11900H, lo que permite ejecución en miniservidores o equipos de escritorio sin GPU.
- Generación de locuciones para vídeos y podcasts en portugués: producción por lotes de audio a 22050 Hz mediante la API de phoonnx, con control de puntuación para pausas naturales.
- Pruebas de integración de pipelines TTS: uso como voz de referencia en CI para validar la canalización texto → fonemas → audio, con grafos fp32 e int8 y métricas de QA reproducibles (WER, RTF, tamaño de grafo).
- Sistemas de anuncios y avisos automatizados: síntesis de mensajes cortos en portugués de Brasil en entornos con recursos limitados, donde la latencia de 0,042 (fp32) o 0,100 (int8) de RTF es suficiente para respuestas interactivas.
- Prototipado de interfaces conversacionales: validación rápida de flujos de diálogo en portugués antes de invertir en voces comerciales, gracias a la licencia CC0 y al bajo coste de despliegue.

## Benchmarks y rendimiento

Datos de QA publicados en la model card (ASR `nemo-parakeet-tdt-0.6b-v3` int8; frases FLORES-200 devtest, 3 frases; medidos en Intel Core i9-11900H a 2,50 GHz, RTF mediana de 3 ejecuciones con 4 hilos):

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,030 |
| Caracteres por segundo | 15,6 a 18,7 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,97 a 1,04 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Peak RSS | 262,9 MB | 222,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,042 | 0,100 |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU con ONNX Runtime.
- Memoria RAM: peak RSS de 262,9 MB en fp32 y 222,8 MB en int8.
- GPU recomendadas: no disponibles; el modelo no requiere GPU.
- Cabe en hardware consumer: sí, en cualquier CPU moderna; las pruebas se realizaron en un Intel Core i9-11900H.
- Opciones de despliegue: phoonnx (librería `phoonnx`, versión `--pre`), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime directamente.
- Latencia y throughput: RTF de 0,042 en fp32 y 0,100 en int8 (mediana de 3 ejecuciones, 4 hilos); entre 15,6 y 18,7 caracteres por segundo en fp32.
- Dependencia externa: espeak-ng (por ejemplo `apt install espeak-ng`) o el port `espyak` incluido en `phoonnx[espeak]`.

## Comparativa con modelos similares

| Modelo | Arquitetura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-pt_br-faber-medium-espeak-v2` | VITS (Piper) | pt-BR | no aplica | CC0 1.0 | ONNX (fp32, int8) | Voz única, 22050 Hz, RTF 0,042 fp32 |
| `Phoonnx/vits-pt_br-faber-medium-espeak` | VITS (Piper) | pt-BR | no aplica | CC0 1.0 | ONNX | Versión anterior con pesos previos al reentrenamiento Piper 1.5 |
| `rhasspy/piper-voices` (pt/pt_BR/faber/medium) | VITS (Piper) | pt-BR | no aplica | CC0 1.0 | ONNX (upstream) | Modelo base del que deriva esta conversión |
| Otras voces Piper en pt-BR | VITS (Piper) | pt-BR | no aplica | según voz | ONNX | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas fuera del ecosistema Piper en la información disponible.

## Limitaciones y advertencias

- Es un modelo puramente TTS: no realiza razonamiento, tool calling, visión ni procesamiento de audio de entrada.
- Una única hablante; no soporta cambio de voz ni multihablante.
- Dependencia de espeak-ng para la fonemización; con el port `espyak` algunos fonemas difieren y ciertas palabras pueden pronunciarse mal.
- La calidad es "medium" según la clasificación de Piper; no está orientada a locución de alta fidelidad.
- El WER en int8 es de 0,030 frente a 0,000 en fp32, lo que introduce una degradación menor pero medible.
- Los datos de entrenamiento no están registrados upstream (número de horas y composición del dataset), lo que limita la trazabilidad y la evaluación de sesgos.
- El QA publicado se basa en solo 3 frases de FLORES-200 devtest; la cobertura de evaluación es muy reducida.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy según indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; el soporte de la comunidad es prácticamente inexistente.
- La fecha de creación indicada (2026-11-22) es futura respecto a la fecha habitual de publicación; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-faber-medium-espeak-v2
- Modelo anterior sustituido: https://huggingface.co/Phoonnx/vits-pt_br-faber-medium-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/pt/pt_BR/faber/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset upstream: https://github.com/OHF-Voice/voice-datasets
