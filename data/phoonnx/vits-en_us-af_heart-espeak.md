# Phoonnx/vits-en_us-af_heart-espeak

## Resumen

`vits-en_us-af_heart-espeak` es un modelo de síntesis de voz (text-to-speech) de un solo hablante en inglés estadounidense, basado en la arquitectura VITS en su variante Piper. Lo publica el usuario Phoonnx como conversión a ONNX de una voz entrenada originalmente por Dave1475 dentro del proyecto 2cent-tts, y está pensado para integrarse en el motor de TTS phoonnx (TigreGotico). No es un modelo de lenguaje: es un sintetizador acústico que transforma fonemas IPA generados por espeak-ng en audio a 22050 Hz.

El modelo resuelve el problema de disponer de una voz TTS ligera, ejecutable en CPU y con huella de memoria reducida (237,4 MB de RSS en fp32, 220,6 MB en int8), adecuada para asistentes de voz embebidos, sistemas OVOS/Mycroft y aplicaciones de lectura en tiempo real. Su relevancia actual reside en el formato: al distribuirse como grafos ONNX con copias int8, se puede desplegar sin GPU y con un factor de tiempo real (RTF) de 0,038 en fp32 sobre un Intel i9-11900H.

La voz se entrenó con audio sintético de la voz Kokoro `af_heart`, lo que la convierte en una destilación indirecta de esa referencia. La información pública no detalla el número de parámetros ni el volumen de datos de entrenamiento, y el repositorio ocupa solo 0,1 GB, coherente con un modelo acústico pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | en-US |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos fp32 e int8) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial en entrenamiento, con salida de audio a 22050 Hz. La variante Piper simplifica y optimiza el pipeline para inferencia rápida en CPU. La entrada no es texto crudo sino fonemas IPA producidos por espeak-ng con la voz `en-us`; el modelo está entrenado para preservar la puntuación de cláusula (`, . ! ? : ;`), que phoonnx mantiene en la síntesis desde la versión 1.96.1a1.

El entrenamiento lo realizó Dave1475 en el marco de 2cent-tts usando audio sintético de la voz Kokoro `af_heart` (documentado en la discusión #47 de rhasspy/piper-voices). La model card no registra el conjunto de datos exacto, el número de tokens ni el checkpoint de entrenamiento, y no hay evidencia de RLHF ni DPO, algo esperable en un modelo TTS. La conversión a ONNX la hizo TigreGotico sin alterar los pesos; las copias int8 se generaron con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y superan una puerta de calidad que exige audio finito y no silencioso, duración entre 0,8 y 1,25 veces la de fp32 y un WER no superior al de fp32 más 0,05.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con fonemización previa mediante espeak-ng.
- Salida de audio mono a 22050 Hz, un único hablante (voz femenina `af_heart`).
- Respeto de la puntuación de cláusula para segmentar y entonar frases.
- Ejecución en CPU sin GPU, con grafos ONNX optimizados para onnxruntime.
- Variante int8 con menor tamaño (18,7 MB frente a 63,2 MB) y menor uso de memoria.
- Integración nativa con el motor phoonnx y con el ecosistema OVOS mediante `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz embebidos: la voz se puede cargar en phoonnx dentro de un dispositivo con poca memoria (unos 220 MB de RSS en int8) y sintetizar respuestas en tiempo real, lo que encaja en altavoces inteligentes y asistentes domésticos basados en OVOS.
- Lectura de textos largos por frases: al respetar la puntuación de cláusula, permite dividir párrafos en oraciones y generar audio encadenado con pausas naturales, útil en lectores de pantalla y aplicaciones de accesibilidad.
- Generación de audiolibros y pódcast automatizados: el RTF de 0,038 en fp32 sobre CPU permite procesar horas de texto en un servidor sin GPU, con coste energético bajo.
- Sistemas de anuncios y notificaciones dinámicas: la baja latencia y el tamaño reducido del grafo int8 facilitan su inclusión en servicios que generan mensajes hablados bajo demanda.
- Pruebas de integración continua de pipelines de voz: la puerta de calidad documentada (WER mediante ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre FLORES-200 devtest) sirve como referencia para validar regresiones en el motor TTS.
- Prototipado de interfaces conversacionales: al ser Apache 2.0 y ejecutarse en CPU, se puede desplegar en entornos de desarrollo y demos sin licencias adicionales ni hardware especializado.
- Sustitución de voces en aplicaciones existentes de Piper: al compartir arquitectura y fonemizador, puede integrarse donde ya se use el ecosistema Piper con ajustes mínimos.

## Benchmarks y rendimiento

La model card solo publica métricas de calidad y eficiencia de la conversión, no benchmarks estándar de TTS como MMLU o HumanEval (no aplicables). Los datos disponibles son:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA (ASR) | pass | pass |
| WER (FLORES-200 devtest, 3 frases) | 0,000 | 0,000 |
| Caracteres por segundo | 16,1 a 19,7 | no disponible |
| Relación de longitud int8/fp32 | no aplica | 0,94 a 1,06 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 237,4 MB | 220,6 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,094 |

Medido en un Intel Core i9-11900H a 2,50 GHz. No se han publicado resultados de benchmarks comparativos adicionales en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: aproximadamente 237 MB de RSS pico en fp32 y 221 MB en int8.
- CPU: cualquier procesador x86-64 moderno; las mediciones se hicieron con 4 hilos en un i9-11900H.
- GPU: no necesaria; no se documenta soporte CUDA ni aceleración por GPU.
- Cabe en cualquier equipo de consumo, incluidos mini-PC y dispositivos de placa única con al menos 256 MB libres.
- Despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak mediante `pip install --pre "phoonnx[espeak]"`. Integración con OVOS a través de `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF de 0,038 en fp32 (unas 26 veces más rápido que tiempo real) y 0,094 en int8 (unas 10,6 veces más rápido) en el hardware citado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Ejecucion |
|---|---|---|---|---|---|
| vits-en_us-af_heart-espeak | VITS (Piper) | en-US | 63,2 MB fp32 / 18,7 MB int8 | Apache 2.0 | CPU via ONNX |
| rhasspy/piper-voices (voces Piper) | VITS (Piper) | multiidioma | variable por voz | MIT (mayoria) | CPU via ONNX |
| Kokoro (voz af_heart original) | no disponible en la informacion | en | no disponible | Apache 2.0 | GPU/CPU |
| Coqui TTS (VITS) | VITS | multiidioma | variable | MPL 2.0 / otros | CPU/GPU |

La comparación con Piper es la más directa: comparten arquitectura y fonemizador, aunque esta voz se distribuye específicamente para phoonnx. Frente a Kokoro, la voz aquí es una destilación sintética de `af_heart`, por lo que la calidad subjetiva puede diferir de la original. No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés estadounidense; no soporta otros idiomas ni cambio de hablante.
- La fonemización depende de espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- El entrenamiento se hizo con audio sintético de Kokoro `af_heart`, lo que puede introducir artefactos o sesgos acústicos heredados de esa voz.
- Riesgo de pronunciación incorrecta en nombres propios, siglas y términos técnicos no cubiertos por el fonemizador.
- La evaluación de calidad se limita a 3 frases de FLORES-200 devtest con un único ASR; no es una validación exhaustiva.
- No hay información sobre el dataset de entrenamiento, lo que dificulta auditar sesgos de acento o prosodia.
- Aunque la licencia es Apache 2.0, la model card pide acreditar a Dave1475 al usar la voz.
- No apta para clonación de voz ni para síntesis expresiva controlable; es una voz fija.
- El repositorio no incluye checkpoint de entrenamiento, solo los grafos ONNX de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-af_heart-espeak
- Modelo upstream (Dave1475/2cent-tts, release Voices): https://github.com/Dave1475/2cent-tts/releases/tag/Voices
- phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Discusión rhasspy/piper-voices #47 (origen del audio sintético): https://github.com/rhasspy/piper-voices/discussions/47
