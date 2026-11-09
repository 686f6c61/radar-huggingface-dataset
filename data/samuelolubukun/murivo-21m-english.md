# samuelolubukun/murivo-21m-english

## Resumen

Murivo 21M English es un motor de síntesis de voz (text-to-speech) ultraligero desarrollado por Samuel Olubukun, publicado en Hugging Face bajo licencia MIT. Combina una arquitectura de backbone acústico basada en un Diffusion Transformer (DiT) con flow-matching de aproximadamente 20,9 millones de parámetros con el vocoder neuronal causal VoxCPM2 AudioVAE de 48 kHz, desarrollado por el equipo OpenBMB, para generar audio nativo a 48.000 Hz. El modelo está entrenado exclusivamente para inglés (variante estadounidense de estudio) y se distribuye como un único checkpoint de unos 41,9 MB en FP16.

El modelo resuelve el problema de la síntesis de voz de alta fidelidad en entornos con recursos limitados: al ser completamente offline y requerir solo PyTorch, soundfile y numpy (sin dependencias de C ni de `espeak-ng`), puede ejecutarse en CPU o GPU de consumo sin infraestructura especializada. Su relevancia actual radica en la combinación de un tamaño muy reducido con una frecuencia de muestreo de estudio (48 kHz), lo que lo sitúa en una categoría poco poblada de TTS ligeros de alta calidad.

El checkpoint publicado corresponde al paso 12.500 de entrenamiento sobre el dataset LJSpeech (24 horas de audio de un único hablante), con un currículo de dos fases: un calentamiento de 1.000 pasos con backbone congelado para fijar la duración fonémica y el alineamiento texto-audio, seguido de 11.500 pasos de flow-matching conjunto. La model card lo describe como "Studio Foundation (Step 12,500)", lo que indica que es una base de entrenamiento más que un modelo final pulido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) con solver ODE Euler; vocoder VoxCPM2 48 kHz Causal AudioVAE |
| Parametros totales | ~20,9 M (backbone acústico); el vocoder es un componente separado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | FP16 (checkpoint distribuido); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (variante estadounidense de estudio) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch); vocoder `audiovae.pth` descargado de `openbmb/VoxCPM2` |
| Frecuencia de muestreo | 48.000 Hz nativa |
| Tamaño del checkpoint | ~41,9 MB (FP16) |
| Dataset de entrenamiento | keithito/lj_speech (24 h, un solo hablante) |
| Pasos de entrenamiento | 12.500 |
| Dependencias | torch, soundfile, numpy |

## Arquitectura y entrenamiento

El backbone acústico es un Diffusion Transformer (DiT) con formulación de flow-matching, resuelto mediante un solver ODE de Euler en inferencia (por defecto 20 pasos, configurable). La generación de audio se realiza en el espacio latente del vocoder VoxCPM2 AudioVAE, un autoencoder variacional causal de 48 kHz desarrollado por OpenBMB que actúa como decodificador neuronal. El modelo incorpora además un cabezal de duración (duration loss) que predice la longitud fonémica, lo que permite controlar el ritmo mediante el parámetro `speed` en la API. La arquitectura se inspira en el linaje de Rápido TTS, según reconoce el autor.

El entrenamiento se realizó desde cero sobre LJSpeech, un corpus de 24 horas de audio de un único hablante femenino en inglés estadounidense. El currículo consta de dos fases: una primera de 1.000 pasos con el backbone congelado para estabilizar el alineamiento texto-fonema y la predicción de duraciones (la duration loss cae un 95,1 %, de 0,4866 a 0,0239), y una segunda de 11.500 pasos de flow-matching conjunto en la que se optimizan simultáneamente el flujo y la duración (loss total final de 0,8931, flow loss de 0,8744 y duration loss de 0,0058). No se documenta uso de RLHF, DPO ni preferencias humanas; el entrenamiento es puramente supervisado sobre pares texto-audio.

## Capacidades

- Síntesis de voz texto-a-audio en inglés estadounidense con salida nativa a 48 kHz.
- Control de la velocidad del habla mediante el parámetro `speed` (por defecto 1.0).
- Control de la fuerza de guiado (guidance) para modular la fidelidad al texto (por defecto 1.8).
- Control del número de pasos del solver ODE (por defecto 20), lo que permite intercambiar calidad por latencia.
- Inferencia 100 % offline, sin llamadas a servicios externos ni dependencias de system libraries.
- Ejecución en CPU o GPU (`device="cuda"` o `device="cpu"`).
- API Python (`MurivoTTS`) y CLI (`infer.py`) para integración en scripts.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.
- Multilingüismo: solo inglés; no se documentan otras lenguas pese a las atribuciones a corpus multilingües en los agradecimientos.

## Casos de uso

- **Generación de audiolibros y narración de un solo hablante**: el modelo está entrenado sobre LJSpeech, un corpus de un único hablante, por lo que es adecuado para narración monótona y consistente de textos largos. La salida a 48 kHz evita el resampleo posterior en pipelines de publicación de audiolibros.
- **Sistemas de accesibilidad en local**: al ejecutarse en CPU sin dependencias de sistema, puede integrarse en aplicaciones de lectura de pantalla o asistentes de accesibilidad que deban funcionar sin conexión y en hardware modesto.
- **Prototipado rápido de interfaces de voz**: el tamaño de 41,9 MB y la instalación con tres paquetes de Python permiten incorporar TTS en demos, notebooks y pruebas de concepto sin aprovisionar infraestructura de GPU.
- **Generación de avisos y locuciones para dispositivos embebidos**: la inferencia offline y el bajo consumo de memoria hacen viable su despliegue en dispositivos edge o en entornos con conectividad restringida para locuciones pregrabadas o dinámicas.
- **Investigación en TTS ligero**: como checkpoint "Studio Foundation" en el paso 12.500, sirve como base para fine-tuning o para estudiar el comportamiento de DiT con flow-matching en dominios de pocos parámetros.
- **Generación de voces para videojuegos y prototipos interactivos**: el control de `speed` y `guidance` permite ajustar el ritmo y la expresividad en diálogos de prueba sin depender de servicios cloud.
- **Evaluación comparativa de vocoders**: al usar el VoxCPM2 AudioVAE de OpenBMB como decodificador, permite aislar el efecto del backbone acústico frente a otros sistemas que emplean el mismo vocoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta curvas de pérdida de entrenamiento (loss total, flow loss y duration loss por fase), no métricas perceptuales (MOS, CMOS) ni métricas objetivas (MCD, WER) sobre conjuntos de evaluación estándar.

| Métrica de entrenamiento | Paso 1 | Paso 1.000 | Paso 5.000 | Paso 10.000 | Paso 12.500 |
|---|---|---|---|---|---|
| Total loss | 1,6732 | 1,0730 | 0,9412 | 0,9125 | 0,8931 |
| Flow loss | 1,4299 | 1,0305 | 0,9234 | 0,8792 | 0,8744 |
| Duration loss | 0,4866 | 0,0239 | 0,0078 | 0,0057 | 0,0058 |

## Requisitos de hardware

- **VRAM estimada**: el backbone de ~20,9 M de parámetros en FP16 ocupa unos 41,9 MB; el vocoder VoxCPM2 AudioVAE añade memoria adicional no cuantificada en la información disponible. En conjunto, el modelo cabe holgadamente en cualquier GPU de consumo.
- **GPU recomendadas**: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación. Para producción de alto throughput se recomienda una GPU moderna, pero el modelo no la exige.
- **CPU**: soportada explícitamente (`device="cpu"`); es viable en portátiles y servidores sin GPU.
- **Opciones de despliegue**: la model card solo documenta inferencia mediante `infer.py` (CLI) y la API Python `MurivoTTS`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo TTS de este tipo.
- **Latencia y throughput**: no disponibles. El único parámetro relacionado es el número de pasos del solver ODE (20 por defecto), que escala linealmente el coste de inferencia, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas publicadas en la información proporcionada. A continuación se comparan características estructurales con alternativas de la misma categoría (TTS ligero), marcando como "no disponible" los datos que no constan.

| Modelo | Parámetros | Frecuencia de muestreo | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Murivo 21M English | ~20,9 M (backbone) | 48 kHz | Inglés | MIT | `.pt` (PyTorch) |
| Rápido TTS (linaje arquitectónico) | no disponible | no disponible | no disponible | no disponible | no disponible |
| VoxCPM2 (solo vocoder, usado aquí como decodificador) | no disponible | 48 kHz | no disponible | no disponible | `.pth` |
| Piper TTS (referencia de TTS ligero offline) | no disponible en esta ficha | no disponible | múltiples | no disponible | ONNX |

La comparación de rendimiento (MOS, MCD, WER) no está disponible para ninguno de los modelos en la información consultada.

## Limitaciones y advertencias

- **Un solo hablante**: entrenado exclusivamente sobre LJSpeech, por lo que la voz generada está limitada a la identidad del hablante del corpus; no hay clonación de voz ni control de identidad.
- **Solo inglés**: no se documenta soporte de otros idiomas, pese a las menciones a corpus multilingües en los agradecimientos.
- **Checkpoint intermedio**: la model card lo etiqueta como "Studio Foundation (Step 12,500)", lo que sugiere que no es un modelo final pulido; la calidad puede no ser la de un sistema de producción.
- **Riesgo de alucinación acústica**: como todo modelo generativo, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala en textos fuera de distribución (nombres propios, siglas, números, puntuación atípica).
- **Sesgos del corpus**: LJSpeech es un corpus de un único hablante femenino de inglés estadounidense; el modelo hereda sus características acentuales y de estilo, sin diversidad de acentos.
- **Licencia MIT**: permisiva para uso comercial, pero conviene verificar las licencias del vocoder VoxCPM2 (OpenBMB) y del dataset LJSpeech, que se distribuyen por separado y pueden tener condiciones propias.
- **Dependencia de descarga externa**: el vocoder `audiovae.pth` se descarga automáticamente de `openbmb/VoxCPM2` en la primera ejecución, lo que requiere conectividad en ese momento y añade una dependencia de un repositorio de terceros.
- **Sin métricas de calidad publicadas**: no hay MOS, CMOS ni evaluaciones perceptuales, por lo que la calidad subjetiva debe validarse empíricamente antes de usarlo en producción.
- **Sin soporte de tool calling ni agentes**: es un modelo puramente TTS; no debe esperarse razonamiento, instrucciones complejas ni control semántico más allá del texto a sintetizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuelolubukun/murivo-21m-english
- Autor: https://huggingface.co/samuelolubukun
- Dataset LJSpeech: https://huggingface.co/datasets/keithito/lj_speech
- Vocoder VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Dataset OpenBible Multilingual TTS: https://huggingface.co/datasets/multilingual-tts/open-bible
- Dataset Nigerian Common Voice: https://huggingface.co/datasets/benjaminogbonna/nigerian_common_voice_dataset
- Muestras de audio: https://huggingface.co/samuelolubukun/murivo-21m-english/resolve/main/sentence_1.wav, https://huggingface.co/samuelolubukun/murivo-21m-english/resolve/main/sentence_2.wav, https://huggingface.co/samuelolubukun/murivo-21m-english/resolve/main/sentence_3.wav
