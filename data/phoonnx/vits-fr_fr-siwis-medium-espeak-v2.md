# Phoonnx/vits-fr_fr-siwis-medium-espeak-v2

## Resumen

`Phoonnx/vits-fr_fr-siwis-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en frances de Francia, empaquetada en formato ONNX para su uso con la libreria phoonnx. No se trata de un modelo de lenguaje, sino de un modelo acustico VITS (Piper) de un solo hablante que convierte fonemas espeak en audio a 22050 Hz. Lo desarrolla TigreGotico (bajo la organizacion Phoonnx) a partir de los pesos publicados por Rhasspy en `rhasspy/piper-voices`, en la ruta `fr/fr_FR/siwis/medium`.

El modelo resuelve un problema muy concreto: ofrecer una voz francesa ligera, determinista y de baja latencia que funcione en CPU sin GPU, integrable en asistentes de voz y sistemas de sintesis locales. Esta version (v2) sustituye a `Phoonnx/vits-fr_fr-siwis-medium-espeak`, porque Rhasspy reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`); el repositorio antiguo conserva los pesos previos.

La relevancia actual es de infraestructura mas que de investigacion: es una pieza de la cadena de TTS de OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, con licencia CC BY 4.0 y un peso de repositorio de 0,1 GB. El grafico fp32 ocupa 63,2 MB y su copia int8 18,7 MB, lo que lo hace apto para dispositivos de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo TTS, entrada por frase) |
| Tipos de cuantizacion | fp32 y int8 (quantize_dynamic de onnxruntime 1.32.0, pesos QInt8) |
| Idiomas soportados | frances de Francia (`fr-FR`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |

Datos adicionales de la model card: identificador de voz `piper/fr_FR-siwis-medium-v2`, frecuencia de muestreo 22050 Hz, un solo hablante, entrada de texto en fonemas espeak (alfabeto IPA), fonemizador espeak-ng con voz `fr`, puntuacion entrenada (`, . ! ? : ;`), tamano del repo 0,1 GB, sin checkpoint de entrenamiento en el repositorio.

## Arquitectura y entrenamiento

El modelo es un VITS de Piper, es decir, un sistema TTS neuronal de extremo a extremo que combina un codificador de texto sobre fonemas, un predictor de duraciones, un flujo normalizador y un decodificador generativo que produce la forma de onda a 22050 Hz. La variante es "medium", y la entrada no es texto crudo sino fonemas IPA generados por espeak-ng. La puntuacion de clausula forma parte del entrenamiento y phoonnx 1.96.1a1 o superior la conserva en la sintesis.

El entrenamiento es el del upstream de Rhasspy: la voz se ajusto (fine-tuning) desde el modelo base `hifi_tts_92` de ingles estadounidense (calidad medium, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), con MRD y SDP. Los datos de entrenamiento proceden de `https://datashare.is.ed.ac.uk/handle/10283/2353` bajo CC BY 4.0; de las 9.763 emisiones, las 6 de mas de 15 segundos se descartaron a partir de la epoca 56 para permitir lotes mayores. Requiere Piper 1.5 o superior. Esta conversion a ONNX no altera los pesos; solo las copias int8 los cuantizan.

## Capacidades

- Sintesis de voz en frances de Francia a partir de texto, con salida WAV a 22050 Hz y un unico hablante (voz `siwis`).
- Conversion texto a fonemas mediante espeak-ng (voz `fr`), con entrada interna en alfabeto IPA.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) en la prosodia, siempre que se use phoonnx 1.96.1a1 o posterior.
- Inferencia en CPU sin GPU, con dos variantes de precision (fp32 e int8) y RTF bajo (ver seccion de rendimiento).
- Integracion directa como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) y uso programatico via `TTSModelManager` de phoonnx.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: no es un modelo de lenguaje.
- No es multilingue: solo `fr-FR`.

## Casos de uso

- Asistentes de voz locales en OVOS: se selecciona la voz `piper/fr_FR-siwis-medium-v2` en `mycroft.conf` y el plugin sintetiza las respuestas del asistente en frances sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en dispositivos empotrados: con 18,7 MB en int8 y un pico de RSS de 209,4 MB, cabe en hardware modesto y permite generar avisos cortos en tiempo casi real (RTF 0,094 en int8 sobre un i9-11900H).
- Pre-generacion por lotes de audiolibros o articulos: la variante fp32 ofrece RTF 0,039 (unas 25 veces mas rapido que tiempo real en la maquina de referencia), adecuada para sintetizar corpus largos de forma offline.
- Accesibilidad: lectura en voz alta de contenido en frances para personas con discapacidad visual, integrada en aplicaciones de escritorio o moviles mediante ONNX Runtime.
- Pruebas de regresion de pipelines TTS: el modelo incluye un metodo de QA con ASR (`nemo-parakeet-tdt-0.6b-v3` int8) y WER 0,162 sobre tres frases de FLORES-200 devtest, util como referencia para validar conversiones o cuantizaciones.
- Sistemas de anuncios en transporte o comercio: mensajes breves y repetitivos en frances que requieren baja latencia y consumo contenido, sin GPU dedicada.
- Prototipado de interfaces conversacionales en frances: al ser un modelo pequeno y de licencia permisiva, sirve para validar flujos de voz antes de invertir en voces comerciales.

## Benchmarks y rendimiento

Datos de la model card, medidos en un Intel Core i9-11900H a 2,50 GHz, con QA mediante ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,162 | 0,162 |
| Caracteres por segundo | 17,3 a 20,9 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,93 a 1,04 |
| Tamano del grafico | 63,2 MB | 18,7 MB |
| Pico de RSS | 252,3 MB | 209,4 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,094 |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible. La puerta de calidad de la copia int8 exige audio finito y no silencioso, longitud entre 0,8 y 1,25 de la fp32 y WER como maximo el de fp32 mas 0,05.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU. Pico de RSS de 252,3 MB en fp32 y 209,4 MB en int8.
- GPU recomendadas: no aplica; no se documenta uso de GPU. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en cualquier equipo consumer: el grafico int8 de 18,7 MB y el fp32 de 63,2 MB son triviales para portatiles y placas de bajos recursos.
- Despliegue: libreria phoonnx (via `pip install --pre phoonnx`), con espeak-ng instalado en el sistema (`apt install espeak-ng`) o el port espyak mediante `pip install --pre "phoonnx[espeak]"`. Tambien como plugin `ovos-tts-plugin-phoonnx` en OVOS. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo TTS).
- Latencia y throughput: RTF 0,039 en fp32 y 0,094 en int8 (mediana de 3 ejecuciones, 4 hilos) en un i9-11900H; entre 17,3 y 20,9 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-fr_fr-siwis-medium-espeak-v2` | VITS (Piper) | fr-FR | 63,2 MB fp32 / 18,7 MB int8 | CC BY 4.0 | ONNX | Conversion de la voz siwis medium; QA con WER 0,162 |
| `rhasspy/piper-voices` (fr_FR siwis medium) | VITS (Piper) | fr-FR | no disponible | CC BY 4.0 | Piper (upstream) | Modelo original del que deriva esta conversion; requiere Piper 1.5 o superior |
| `Phoonnx/vits-fr_fr-siwis-medium-espeak` | VITS (Piper) | fr-FR | no disponible | CC BY 4.0 | ONNX | Version anterior con pesos previos al reentrenamiento; sustituida por esta v2 |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- Solo cubre frances de Francia; no hay soporte multilingue ni cambios de hablante (un unico hablante).
- El texto debe fonemizarse con espeak-ng: con el port espyak algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- La puntuacion solo se respeta con phoonnx 1.96.1a1 o posterior; versiones anteriores pueden ignorarla.
- Riesgo de errores de pronunciacion en nombres propios, siglas, numeros y palabras fuera de dominio, propio de un modelo entrenado sobre un corpus limitado.
- El upstream no registra los datos de entrenamiento exactos ni el modelo base en la model card, lo que limita la trazabilidad completa del linaje.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion a Rhasspy; la conversion la publica TigreGotico bajo la misma licencia.
- El QA se basa en solo 3 frases de FLORES-200 devtest, por lo que el WER de 0,162 es una estimacion debil y no representativa de todos los dominios.
- No hay checkpoint de entrenamiento en el repositorio, asi que no es posible reentrenar ni ajustar la voz a partir de estos ficheros.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones complejas; cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-siwis-medium-espeak-v2
- Modelo anterior (sustituido): https://huggingface.co/Phoonnx/vits-fr_fr-siwis-medium-espeak
- Modelo upstream (Rhasspy, fr_FR siwis medium): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/fr/fr_FR/siwis/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datos de entrenamiento upstream: https://datashare.is.ed.ac.uk/handle/10283/2353
