# Phoonnx/vits-nl_be-flemishguy-medium-espeak

## Resumen

Este repositorio contiene una voz de síntesis de voz (text-to-speech) en neerlandés de Bélgica (`nl-BE`), con acento flamenco, convertida a formato ONNX para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). El modelo original es una voz Piper entrenada por Rhasspy, identificada como `piper/nl_BE-flemishguy-medium`, y esta conversión la publica TigreGotico Lda bajo la misma licencia CC0 1.0. No es un modelo de lenguaje generativo, sino un sintetizador acústico VITS de un único hablante que transforma fonemas espeak (alfabeto IPA) en audio a 22050 Hz.

La relevancia de esta ficha es práctica: se trata de una voz ligera (63,2 MB en fp32, 18,7 MB en int8) pensada para despliegue en CPU y en entornos de asistente doméstico como OVOS/Mycroft. Incluye una cuantización dinámica int8 verificada con una puerta de calidad objetiva (WER medido con ASR, longitud de audio y finitud de la señal), lo que permite integrarla en sistemas embebidos o pipelines de TTS de baja latencia sin GPU.

El modelo resuelve el problema de disponer de una voz flamenca de calidad media con licencia de dominio público (CC0), algo poco frecuente en el ecosistema TTS, y con artefactos listos para inferencia en ONNX Runtime. La model card documenta explícitamente el proceso de conversión, la cuantización y las métricas de validación, lo que facilita su auditoría antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | fp32 y int8 (cuantización dinámica con `onnxruntime.quantization.quantize_dynamic`, pesos QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | neerlandés de Bélgica (`nl-BE`), fonemizado con espeak-ng voz `nl` |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Puntuación | entrenado con `. , ! ? : ;`; phoonnx 1.96.1a1 y posteriores la preservan en la síntesis |
| Tamaño del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 271,8 MB (fp32) / 222,0 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,039 (fp32) / 0,095 (int8) |
| Librería | phoonnx |
| Modelo base | rhasspy/piper-voices (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), el modelo empleado por el ecosistema Piper para TTS neuronal ligero. Se trata de un modelo condicional de tipo VAE con discriminador adversarial, que genera波形 directamente a partir de fonemas, sin necesidad de un vocoder neuronal separado en tiempo de inferencia. La entrada es una secuencia de fonemas espeak en IPA; la salida es audio PCM a 22050 Hz. El modelo es de un solo hablante y calidad "medium" dentro de la taxonomía de Piper.

El entrenamiento original lo realizó Rhasspy. Según la model card upstream, la voz se obtuvo por fine-tuning desde el modelo base `rdh` (calidad medium, `nl_BE`, un hablante flamenco, CC0) con MRD y SDP. Los datos de entrenamiento remiten a [OHF-Voice/voice-datasets](https://github.com/OHF-Voice/voice-datasets) con licencia CC0, aunque la model card indica que "Training data: Not recorded upstream" y "Base model: Not recorded" en los campos estructurados. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior.

La innovación técnica de este repositorio concreto no está en el entrenamiento, sino en la conversión y cuantización: se generan copias int8 con cuantización dinámica y se valida cada copia con una puerta objetiva (audio finito y no silencioso, longitud entre 0,8 y 1,25 veces la de fp32, y WER como máximo el de fp32 + 0,05). Esta metodología de QA es reproducible y está documentada en la model card.

## Capacidades

- Síntesis de voz a partir de texto en neerlandés de Bélgica, con fonemización vía espeak-ng (voz `nl`) y entrada en alfabeto IPA.
- Un único hablante masculino flamenco (`flemishguy`), calidad medium.
- Manejo de puntuación de cláusula (`. , ! ? : ;`) preservada en la síntesis con phoonnx 1.96.1a1 y posteriores.
- Inferencia en CPU sin GPU, con RTF inferior a 0,1 en el hardware de referencia.
- Dos variantes de precisión: fp32 (mayor calidad, 63,2 MB) e int8 (18,7 MB, menor huella de memoria).
- Integración con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada a `nl-BE`; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz domésticos en OVOS/Mycroft: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` con el identificador `piper/nl_BE-flemishguy-medium`. Es adecuada por su baja huella (222 MB de RSS en int8) y su RTF de 0,095 en CPU, que permite respuestas habladas en tiempo casi real en hardware de consumo.
- Sistemas de anuncios públicos en Flandes: lectura de avisos en estaciones, aeropuertos o comercios con acento flamenco nativo. La licencia CC0 elimina restricciones de uso comercial y de atribución obligatoria (aunque se recomienda citar a Rhasspy).
- Audiolibros y contenido accesible de bajo coste: generación por lotes de narración en neerlandés de Bélgica con la variante fp32 para maximizar calidad, procesando textos largos con puntuación preservada.
- Integración en aplicaciones de accesibilidad para personas con discapacidad visual en Bélgica: lectura de pantalla en tiempo real en CPU, sin dependencia de servicios en la nube, lo que reduce latencia y preserva privacidad.
- Pruebas automatizadas de pipelines de voz: la variante int8 con RTF 0,095 y 18,7 MB permite ejecutar suites de regresión de TTS en CI sin GPU y con consumo de memoria acotado.
- Prototipado de interfaces conversacionales en neerlandés: al ser un modelo pequeño y de dominio público, sirve para validar flujos de diálogo antes de invertir en voces comerciales de mayor calidad.
- Educación y aprendizaje de neerlandés como lengua extranjera: la voz flamenca permite exponer al estudiante a la variedad `nl-BE`, diferenciada del neerlandés de los Países Bajos.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de la conversión y cuantización, no benchmarks estándar de TTS (MOS, MCD, etc.). El método de QA usa ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest.

| Check | fp32 | int8 |
|---|---|---|
| Resultado | pass | pass |
| WER | 0,067 | 0,033 |
| Caracteres por segundo | 12,0 a 12,6 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,02 |
| Tamaño del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 271,8 MB | 222,0 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,095 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de síntesis dividido entre la duración del audio. No se han publicado resultados de benchmarks estándar de TTS (MOS, CMOS, MCD) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime. Pico de RSS de 271,8 MB en fp32 y 222,0 MB en int8.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. No se documenta despliegue en GPU.
- Cabe en cualquier GPU de consumo y en CPU de consumo; el hardware de referencia es un Intel Core i9-11900H de 11ª generación.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`). Integración con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: RTF 0,039 en fp32 y 0,095 en int8 con 4 hilos; es decir, sintetizar 10 segundos de audio requiere aproximadamente 0,39 s en fp32 y 0,95 s en int8 en el hardware de referencia.
- Nota: espyak puede diferir de espeak-ng en algunos fonemas y provocar pronunciaciones incorrectas; se recomienda espeak-ng nativo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Licencia | Formato | Tamaño | RTF |
|---|---|---|---|---|---|---|---|
| Phoonnx/vits-nl_be-flemishguy-medium-espeak | VITS (Piper) | nl-BE | 1 | CC0 1.0 | ONNX fp32/int8 | 63,2 MB / 18,7 MB | 0,039 / 0,095 |
| rhasspy/piper-voices nl_BE flemishguy medium (upstream) | VITS (Piper) | nl-BE | 1 | CC0 1.0 | Piper (ONNX upstream) | no disponible en esta ficha | no disponible |
| Otras voces Piper nl_BE de rhasspy/piper-voices | VITS (Piper) | nl-BE | variable | CC0 (según voz) | ONNX | variable | no disponible |

La comparación con alternativas de otros ecosistemas (Coqui TTS, XTTS, Bark, etc.) no está disponible en la información proporcionada. La diferencia principal frente al upstream es el empaquetado para phoonnx y la cuantización int8 validada; los pesos no cambian en la conversión fp32.

## Limitaciones y advertencias

- Modelo de un solo hablante y una sola variedad lingüística (`nl-BE`); no cubre neerlandés de los Países Bajos ni otros idiomas.
- Calidad "medium" dentro de Piper: no es una voz de alta fidelidad ni compite con sistemas neuronales grandes en naturalidad.
- Riesgo de pronunciación incorrecta con espyak: la model card advierte que algunos fonemas difieren de espeak-ng y el modelo puede decir mal algunas palabras.
- WER medido sobre solo 3 frases de FLORES-200 devtest: la validación es limitada y no constituye una evaluación exhaustiva de calidad.
- La model card upstream no registra los datos de entrenamiento ni el modelo base en los campos estructurados; la trazabilidad del dataset es parcial (remite a OHF-Voice/voice-datasets, CC0).
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy por cortesía y trazabilidad.
- No apto para tareas de razonamiento, generación de texto, código, visión o agentes; es exclusivamente TTS.
- La cuantización int8 reduce el tamaño pero puede introducir artefactos no capturados por el WER de ASR; conviene evaluar perceptualemente antes de producción.
- Dependencia de espeak-ng en tiempo de ejecución para la fonemización; sin él, la calidad cae.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-nl_be-flemishguy-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/nl/nl_BE/flemishguy/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
- Proyecto Piper (OHF-Voice): https://github.com/OHF-Voice/piper1-gpl
- espeak-ng: https://github.com/espeak-ng/espeak-ng
