# Phoonnx/vits-en_us-kathleen-medium-espeak

## Resumen

vits-en_us-kathleen-medium-espeak es una voz de síntesis de voz (text-to-speech) en inglés estadounidense, convertida al formato ONNX para su uso con la librería phoonnx. El modelo original fue entrenado por Rhasspy dentro del proyecto Piper y publicado en el repositorio rhasspy/piper-voices; la conversión a ONNX y su empaquetado para phoonnx corre a cargo de TigreGotico Lda (bajo el identificador Phoonnx en Hugging Face). No se trata de un modelo de lenguaje generativo, sino de un modelo acústico VITS de un solo hablante que transforma fonemas IPA en audio a 22050 Hz.

La relevancia de esta ficha es práctica: permite desplegar una voz TTS ligera, de licencia CC0 y con variantes fp32 e int8, en entornos de inferencia locales o embebidos. El repositorio ocupa 0,1 GB y la variante int8 del grafo principal pesa 18,7 MB, lo que la hace apta para hardware modesto (incluso CPU). El modelo acepta fonemas generados por espeak-ng (voz en-us) y conserva la puntuación de cláusula (, . ! ? : ;) en la síntesis con phoonnx 1.96.1a1 o superior.

Es un componente de infraestructura de voz, no un modelo de razonamiento: su alcance se limita a la conversión texto-a-habla en inglés, con calidad "medium" del catálogo Piper y sin capacidades multilingües ni de comprensión semántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas, no por ventana de tokens) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime 1.32.0, pesos QInt8) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak (alfabeto IPA), fonemizador espeak-ng voz en-us |
| Puntuación | , . ! ? : ; (conservada en phoonnx 1.96.1a1+) |
| Tamaño del repositorio | 0,1 GB |
| Tamaño del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 248,2 MB (fp32) / 211,3 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,042 (fp32) / 0,092 (int8) |
| Librería | phoonnx |
| Modelo base | rhasspy/piper-voices (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la misma familia empleada por Piper. El modelo es de un solo hablante y de calidad "medium" dentro del catálogo de voces Piper. La entrada no es texto crudo sino fonemas en alfabeto IPA producidos por espeak-ng (voz en-us); por tanto, el pipeline completo requiere el fonemizador además del grafo ONNX. La síntesis se realiza a 22050 Hz y conserva la puntuación de cláusula si se usa phoonnx 1.96.1a1 o posterior.

Según la model card, el modelo upstream se obtuvo por fine-tuning desde el modelo base hifi_tts_92 de inglés estadounidense (calidad medium; corresponde a la voz de Cori Samuel, lectora 92 de Hi-Fi TTS), con MRD y SDP. Los ajustes de inferencia por defecto son noise_scale 0,5 y noise_w 0,333, y se requiere Piper 1.5 o superior. Los datos de entrenamiento no están registrados en el repositorio upstream; la model card original remite al dataset OHF-Voice/voice-datasets con licencia CC0. No se documenta el número de tokens ni la composición exacta del corpus, ni si hubo RLHF o DPO (no aplica en un modelo TTS de este tipo).

La conversión a ONNX no altera los pesos; las copias int8 se generan con onnxruntime.quantization.quantize_dynamic (QInt8) y pasan una verificación de calidad: audio finito y no silencioso, longitud entre 0,8 y 1,25 veces la de fp32 y WER como máximo el de fp32 + 0,05.

## Capacidades

- Síntesis de voz texto-a-habla en inglés estadounidense a partir de fonemas IPA.
- Un único hablante (voz femenina "kathleen", calidad medium).
- Soporte de puntuación de cláusula (, . ! ? : ;) para prosodia básica con phoonnx 1.96.1a1+.
- Fonemización mediante espeak-ng (voz en-us); alternativa espyak incluida en el extra `phoonnx[espeak]`, con posibles desviaciones fonéticas.
- Ejecución en CPU mediante ONNX Runtime; no requiere GPU.
- Variantes fp32 e int8 con calidad verificada por ASR (WER 0,000 en la prueba de QA).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": no es un modelo de lenguaje.

## Casos de uso

- Asistentes de voz locales (OVOS/Mycroft): la voz se selecciona en `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx` y el identificador `piper/en_US-kathleen-medium`, lo que permite un asistente totalmente offline en inglés.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domótica: el bajo coste de cómputo (RTF 0,042 en fp32 sobre un i9-11900H) permite sintetizar mensajes cortos en tiempo real sin GPU.
- Sistemas embebidos y Raspberry Pi: la variante int8 (18,7 MB de grafo, 211,3 MB de pico RSS) cabe en dispositivos con poca memoria y sin acelerador dedicado.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con licencia CC0 que elimina fricciones de atribución en productos derivados.
- Generación de audiolibros o podcasts de bajo coste en inglés: frases largas con puntuación conservada para pausas naturales, siempre que se acepte la calidad "medium" y una única voz.
- Pruebas y doblaje de prototipos: generación rápida de pistas de voz para demos, vídeos internos o tests de integración de pipelines de audio.
- Evaluación comparativa de motores TTS: al ser ONNX y CC0, sirve como línea base reproducible en benchmarks de TTS y en pruebas de calidad con ASR (por ejemplo, nemo-parakeet-tdt-0.6b-v3 int8).

## Benchmarks y rendimiento

La model card incluye una verificación de calidad (QA) con ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 15,8 a 19,1 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,96 a 1,02 |
| Tamaño del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 248,2 MB | 211,3 MB |
| RTF (mediana de 3, 4 hilos) | 0,042 | 0,092 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de síntesis dividido por la duración del audio. No se han publicado resultados de benchmarks estándar de TTS (MOS, MCD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: pico de RSS de 248,2 MB en fp32 y 211,3 MB en int8.
- CPU recomendada: cualquier x86-64 moderno; la medición de referencia usa un Intel Core i9-11900H con 4 hilos.
- GPU: no necesaria; no se documenta soporte CUDA en la información disponible.
- Cabe en hardware consumer y embebido: el grafo int8 de 18,7 MB es apto para Raspberry Pi y dispositivos de bajo consumo.
- Despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; integración con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput: RTF 0,042 (fp32) y 0,092 (int8) en la máquina de referencia, es decir, síntesis más rápida que tiempo real en ambos casos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-kathleen-medium-espeak | VITS (Piper) | en-US | 1 | CC0 1.0 | ONNX (fp32/int8) | Conversión de rhasspy/piper-voices; RTF 0,042 fp32 |
| rhasspy/piper-voices (en_US-kathleen-medium) | VITS (Piper) | en-US | 1 | CC0 1.0 | Piper/ONNX upstream | Modelo original; requiere Piper 1.5+ |
| Otras voces Piper en_US medium | VITS (Piper) | en-US | 1 | CC0 1.0 | Piper/ONNX | Misma familia y calidad; distintas voces |
| Modelos TTS neuronales grandes (p. ej. familia XTTS) | no disponible en la información | multilingüe | múltiples | no disponible | no disponible | No comparables en tamaño ni licencia según los datos disponibles |

La comparación directa más fiable es con el modelo upstream de Rhasspy, del que esta ficha es una conversión cuantizada; no se dispone de datos de benchmarks de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés estadounidense; no soporta otros idiomas ni cambio de hablante.
- Calidad "medium": no es una voz de alta fidelidad; puede presentar artefactos prosódicos en textos largos o complejos.
- Dependencia de espeak-ng: sin él, la alternativa espyak puede pronunciar mal algunas palabras, según advierte la model card.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, neologismos y términos técnicos no cubiertos por el fonemizador.
- No es un modelo de lenguaje: no razona, no responde preguntas ni ejecuta herramientas; cualquier capacidad conversacional debe aportarla un sistema externo.
- La cuantización int8 reduce el tamaño pero puede alterar ligeramente la prosodia; la QA solo cubre 3 frases de FLORES-200, por lo que la cobertura de la verificación es limitada.
- Los datos de entrenamiento no están registrados upstream; aunque la licencia es CC0, la trazabilidad del corpus es incompleta.
- Uso comercial permitido por CC0 1.0, pero se recomienda atribuir a Rhasspy según la propia model card.
- Sin datos publicados de MOS ni evaluaciones perceptuales; el WER 0,000 se obtuvo con un ASR concreto y un conjunto muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-kathleen-medium-espeak
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/kathleen/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de voces OHF: https://github.com/OHF-Voice/voice-datasets
