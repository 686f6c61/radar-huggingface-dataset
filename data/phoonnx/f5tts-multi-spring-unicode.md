# Phoonnx/f5tts-multi-spring-unicode

## Resumen

f5tts-multi-spring-unicode es una voz de síntesis de voz (text-to-speech) para el motor phoonnx, publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo SPRINGLab/SPRING_F5. El modelo subyacente es una implementación de F5-TTS, una arquitectura de TTS basada en flow matching y decodificación no autorregresiva que permite clonación de voz zero-shot a partir de un clip de referencia corto y su transcripción. El repositorio distribuye únicamente los grafos ONNX (fp32 e int8), no los checkpoints de entrenamiento.

El interés principal reside en su cobertura multilingüe: cubre 24 idiomas, con especial énfasis en lenguas indias (asamés, bengalí, hindi, tamil, telugu, urdu, entre otras) más inglés, y se entrenó sobre los corpus ai4bharat/IndicVoices y ai4bharat/Rasa. Esto lo convierte en una opción poco habitual para TTS en lenguas del subcontinente indio dentro del ecosistema ONNX.

La conversión está pensada para el stack de OVOS/phoonnx, con un proceso de QA documentado (WER 0.000 sobre tres frases FLORES-200 en inglés, con ASR nemo-parakeet-tdt-0.6b-v3 int8). Es importante señalar que la model card indica explícitamente que la voz no es apta para uso comercial, pese a la licencia Apache 2.0 declarada, por la herencia del modelo base SWivid/F5-TTS (CC BY-NC 4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching, no autorregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic, QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | as, bn, bo, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, doi, raj, en |
| Licencia | Apache 2.0 (declarada); uso comercial no permitido según la model card |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 24000 Hz |
| Hablantes | 1 (clonación zero-shot mediante clip de referencia) |
| Entrada de texto | Caracteres, mayúsculas y marcas incluidas (`f5tts_pinyin`) |
| Puntuación entrenada | , . ! ? : ; |
| Tamano del repo | 1.9 GB |
| Grafo fp32 | 1455.0 MB |
| Grafo int8 | 463.1 MB |
| Pico de RSS (fp32 / int8) | 3201.0 MB / 1193.8 MB |
| RTF mediana (fp32 / int8, 4 hilos) | 31.127 / 19.886 |
| Caracteres por segundo | 13.8 |

## Arquitectura y entrenamiento

El modelo base es F5-TTS, un sistema de síntesis de voz no autorregresivo que emplea flow matching para generar mel-espectrogramas a partir de texto y de una referencia de audio del hablante. La clonación de voz es zero-shot: en inferencia se proporciona un clip corto (`speaker_reference`) junto con su transcripción (`speaker_reference_text`), y el modelo reproduce la identidad vocal del clip. La entrada de texto se procesa carácter a carácter mediante la función `convert_char_to_pinyin` portada a scriptconv (`f5tts_pinyin`), que interpreta caracteres chinos como sílabas pinyin; para las lenguas de la model card (sin chino) la correspondencia de ids con F5-TTS es prácticamente exacta (176 de 185 filas de FLORES-200 idénticas, 3 adicionales equivalentes por frase y 6 con diferencias solo de espacio inicial o final).

SPRINGLab realizó el ajuste fino desde SWivid/F5-TTS sobre los corpus ai4bharat/IndicVoices y ai4bharat/Rasa, orientados a lenguas indias. Phoonnx (TigreGotico Lda) realizó la conversión a ONNX sin modificar los pesos, y generó copias int8 mediante `onnxruntime.quantization.quantize_dynamic` con pesos QInt8. Las copias int8 pasan un control de calidad específico: audio finito y no silencioso, longitud entre 0.8 y 1.25 veces la de fp32, y WER como máximo el de fp32 más 0.05. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz a 24 kHz con clonación zero-shot del hablante a partir de un clip de referencia y su transcripción.
- Cobertura multilingüe de 24 idiomas, con foco en lenguas indias (asamés, bengalí, bodo, guyaratí, hindi, canarés, cachemir, konkani, maithili, malabar, manipuri, maratí, nepalí, oriya, panyabí, sánscrito, santali, sindhi, tamil, telugu, urdu, dogri, rajastaní) e inglés.
- Procesamiento de texto carácter a carácter con conservación de mayúsculas, marcas y puntuación de cláusula (, . ! ? : ;).
- Normalización de texto previa mediante text2spoken para expandir números, fechas, horas, monedas, unidades y abreviaturas a palabras habladas.
- Inferencia en CPU mediante ONNX Runtime, con variantes fp32 e int8.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de la referencia de hablante, ni modo de razonamiento.

## Casos de uso

- Síntesis de voz para lenguas indias en asistentes de voz: el modelo cubre 24 idiomas con entrenamiento específico en IndicVoices y Rasa, lo que permite generar respuestas habladas en tamil, telugu, bengalí o hindi dentro de un asistente OVOS configurando la voz `f5tts/spring`.
- Clonación de voz para locuciones personalizadas: dado un clip de referencia corto y su transcripción, se puede generar audio con la identidad vocal de un locutor concreto, útil para mantener consistencia de marca en contenidos pregrabados.
- Accesibilidad y lectura de contenido: conversión de texto a voz en aplicaciones de lectura para usuarios con discapacidad visual, con la ventaja de funcionar en CPU mediante el grafo int8 (463 MB, pico de RSS de 1193.8 MB).
- Integración en asistentes domésticos OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar esta voz en `mycroft.conf` sin infraestructura adicional, con inferencia local.
- Prototipado de TTS multilingüe en entornos sin GPU: el RTF medido en un AMD Ryzen 5 7600 (19.886 en int8 con 4 hilos) permite generar audio en CPU para pruebas y demos, aunque no para producción de baja latencia en tiempo real.
- Generación de audio para doblaje o audiolibros en lenguas de la India: la cobertura de 24 idiomas y la clonación de hablante facilitan producir versiones habladas de un mismo texto en varios idiomas con una voz de referencia coherente.
- Investigación en TTS multilingüe sobre ONNX: el repositorio sirve como artefacto reproducible para comparar fp32 frente a int8 en calidad (WER) y coste (RTF, RSS) sin necesidad de reentrenar.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del control de calidad de la conversión, medidos sobre tres frases de FLORES-200 devtest en inglés con ASR nemo-parakeet-tdt-0.6b-v3 int8 y referencia LJ001-0009.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0.000 | 0.000 |
| Caracteres por segundo | 13.8 | no disponible |
| Longitud int8 / fp32 | no aplica | 1.00 |
| Tamano del grafo | 1455.0 MB | 463.1 MB |
| Pico de RSS | 3201.0 MB | 1193.8 MB |
| RTF (mediana de 3, 4 hilos) | 31.127 | 19.886 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas de calidad subjetiva (MOS) frente a otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario medido, ya que la inferencia documentada es en CPU con ONNX Runtime. No se proporcionan cifras de VRAM para GPU.
- Memoria RAM: pico de RSS de 3201.0 MB en fp32 y 1193.8 MB en int8.
- GPU recomendadas: no disponible; el autor no documenta ejecución en GPU.
- CPU de referencia: AMD Ryzen 5 7600 de 6 núcleos, con 4 hilos en la medición de RTF.
- Cabe en hardware de consumo: sí, en CPU de escritorio convencional; el grafo int8 de 463.1 MB y un pico de RSS de 1193.8 MB son asequibles para equipos domésticos.
- Opciones de despliegue: ONNX Runtime a través de phoonnx (`pip install --pre phoonnx`) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: RTF de 31.127 en fp32 y 19.886 en int8 (mediana de 3 ejecuciones, 4 hilos). Un RTF superior a 1 implica síntesis más lenta que tiempo real; con estos valores la generación es considerablemente más lenta que la reproducción, por lo que no es adecuada para streaming interactivo en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| f5tts-multi-spring-unicode | no disponible | no disponible | 24 (foco en lenguas indias) | Apache 2.0 declarada, uso comercial no permitido | ONNX fp32/int8 | Conversión de SPRINGLab/SPRING_F5; clonación zero-shot; inferencia en CPU |
| SWivid/F5-TTS (base) | no disponible | no disponible | no disponible | CC BY-NC 4.0 | safetensors (upstream) | Modelo original del que deriva; uso no comercial |
| SPRINGLab/SPRING_F5 | no disponible | no disponible | multilingüe (lenguas indias) | Apache 2.0 | no disponible | Modelo upstream de esta conversión; entrenado por SPRINGLab |
| Otros TTS multilingües (p. ej. XTTS, MMS) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la información disponible.

## Limitaciones y advertencias

- Uso comercial no permitido: aunque la licencia declarada es Apache 2.0, la model card indica que el modelo deriva de SWivid/F5-TTS (CC BY-NC 4.0) y que el uso comercial de esta voz no está autorizado. Es imprescindible revisar la licencia antes de cualquier despliegue productivo.
- Riesgo de alucinación y artefactos de audio: no se documentan métricas de calidad subjetiva (MOS) ni pruebas extensas más allá de tres frases en inglés; el WER 0.000 se obtuvo sobre una muestra muy reducida.
- Cobertura de QA limitada: el control de calidad cubre únicamente inglés, pese a que el modelo declara 24 idiomas; no hay verificación publicada para las lenguas indias.
- Sin soporte de chino en la práctica: la configuración de la voz no contiene sílabas pinyin, por lo que phoonnx asigna id 0 a los caracteres chinos, a diferencia de F5-TTS. El chino no figura entre los idiomas de la model card.
- Requiere clip de referencia: la síntesis necesita un audio de referencia y su transcripción; no es un TTS de voz fija sin condicionamiento.
- Latencia elevada: RTF de 19.886 en int8 sobre la CPU medida implica una generación mucho más lenta que tiempo real, lo que limita su uso en diálogo interactivo.
- Sin checkpoints de entrenamiento en el repositorio: solo se distribuyen grafos ONNX; el reentrenamiento o ajuste fino debe hacerse sobre el modelo upstream.
- Sin datos sobre sesgos: no se documentan sesgos conocidos del modelo ni de los corpus IndicVoices y Rasa.
- Dependencia de normalización externa: el texto debe pasar por text2spoken con la etiqueta de idioma correcta para expandir números, fechas y abreviaturas; de lo contrario la calidad de síntesis puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-spring-unicode
- Modelo upstream (SPRINGLab/SPRING_F5): https://huggingface.co/SPRINGLab/SPRING_F5
- Modelo base original (SWivid/F5-TTS): https://huggingface.co/SWivid/F5-TTS
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Herramienta de normalización text2spoken: https://github.com/TigreGotico/text2spoken
- TigreGotico: https://tigregotico.pt
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
