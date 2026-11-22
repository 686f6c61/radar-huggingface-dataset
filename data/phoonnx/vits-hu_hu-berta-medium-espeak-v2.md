# Phoonnx/vits-hu_hu-berta-medium-espeak-v2

## Resumen

vits-hu_hu-berta-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en húngaro (hu-HU) para el motor phoonnx, publicada por TigreGotico Lda bajo el identificador `piper/hu_HU-berta-medium-v2`. Se trata de una conversión a formato ONNX del modelo upstream `rhasspy/piper-voices/hu/hu_HU/berta/medium`, entrenado originalmente por Rhasspy sobre la arquitectura VITS de Piper. No es un modelo de lenguaje: es un sintetizador acústico de un solo hablante que transforma fonemas espeak (alfabeto IPA) en audio a 22050 Hz.

El problema que resuelve es disponer de una voz húngara ligera, determinista y ejecutable en CPU para asistentes de voz, lectores de pantalla y sistemas de respuesta hablada dentro del ecosistema OVOS. Su relevancia es operativa: el repositorio sustituye a `Phoonnx/vits-hu_hu-berta-medium-espeak`, ya que el upstream reentrenó la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`), y esta versión incorpora esos pesos actualizados junto con copias cuantizadas int8 validadas.

El modelo es minúsculo (63,2 MB en fp32, 18,7 MB en int8) y está pensado para inferencia en tiempo real sin GPU. La licencia CC0 1.0 permite uso comercial sin restricciones de atribución obligatoria, aunque el autor recomienda acreditar a Rhasspy.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), conversión ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada por frase) |
| Tipos de cuantizacion | fp32 y int8 (quantize_dynamic, QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | húngaro (hu-HU) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng (voz `hu`), alfabeto IPA |
| Puntuación soportada | `, . ! ? : ;` (preservada en síntesis desde phoonnx 1.96.1a1) |
| Tamaño del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 278,0 MB (fp32) / 240,4 MB (int8) |
| RTF | 0,041 (fp32) / 0,100 (int8), mediana de 3, 4 hilos |
| Repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial, con alineamiento monotónico aprendido. Piper añade un frontend de fonemización determinista: el texto se convierte a fonemas IPA mediante espeak-ng (voz `hu`) y esos fonemas alimentan la red. La conversión a ONNX no altera los pesos; las copias int8 se generan con cuantización dinámica de onnxruntime sobre pesos QInt8.

Los datos de entrenamiento no están registrados en el repositorio. La model card upstream indica que la voz se ajustó (fine-tuning) desde el modelo base `hifi_tts_92` en inglés estadounidense (calidad medium, voz de Cori Samuel, lector 92 de Hi-Fi TTS), con MRD y SDP, y que requiere Piper 1.5 o superior. El dataset procede de https://github.com/OHF-Voice/voice-datasets con licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333.

## Capacidades

- Síntesis de voz mono-hablante en húngaro a partir de texto con fonemización espeak-ng.
- Entrada directa de fonemas IPA, lo que permite control fino de pronunciación.
- Respeto de puntuación de cláusula (`, . ! ? : ;`) para prosodia y pausas.
- Generación de audio WAV a 22050 Hz mediante `voice.synthesize_wav()`.
- Ejecución en CPU sin GPU, con variantes fp32 e int8.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable vía `mycroft.conf`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.
- No es multilingüe: solo húngaro.

## Casos de uso

- Asistentes de voz domésticos con OVOS: seleccionar la voz `piper/hu_HU-berta-medium-v2` en `mycroft.conf` permite respuestas habladas en húngaro en dispositivos de bajos recursos, con un pico de RSS de 240 MB en int8.
- Lectura de pantalla y accesibilidad: síntesis por frase con RTF de 0,041 en fp32 sobre un i9-11900H, lo que deja margen amplio para generar audio más rápido que el tiempo real en hardware modesto.
- Sistemas de megafonía y anuncios automatizados: el modelo acepta texto con puntuación y produce audio determinista, adecuado para transporte público o avisos industriales en húngaro.
- Generación de audiolibros y contenido pregrabado por lotes: el tamaño reducido (18,7 MB int8) permite empaquetar la voz junto con el pipeline de síntesis y procesar grandes volúmenes en CPU.
- Pruebas de regresión de pipelines TTS: la model card documenta un método de QA con ASR (`nemo-parakeet-tdt-0.6b-v3` int8) y WER 0,095, reutilizable como referencia para validar cambios en el frontend de fonemas.
- Prototipado de interfaces conversacionales en húngaro: al ser CC0 y ONNX, se puede incrustar en aplicaciones de escritorio o servidores sin dependencias de GPU ni costes de licencia.
- Investigación en fonética húngara: la entrada por fonemas IPA permite experimentar con pronunciación y comparar salidas fp32 frente a int8 con métricas objetivas.

## Benchmarks y rendimiento

La model card solo publica métricas de calidad de la conversión y de eficiencia, no benchmarks estándar de TTS como MOS.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER (ASR parakeet-tdt-0.6b-v3 int8) | 0,095 | 0,095 |
| Caracteres por segundo | 14,1 a 17,2 | no disponible |
| Ratio de longitud int8/fp32 | no aplica | 0,98 a 1,00 |
| Tamaño del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 278,0 MB | 240,4 MB |
| RTF (mediana de 3, 4 hilos) | 0,041 | 0,100 |

Medido en Intel Core i9-11900H (11ª generación) a 2,50 GHz. QA sobre 3 frases de FLORES-200 devtest.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU. Memoria de proceso: 278,0 MB (fp32) y 240,4 MB (int8) de pico RSS.
- GPU recomendadas: no aplica; no se documenta soporte GPU para esta conversión.
- Cabe en cualquier CPU consumer moderna; el RTF de 0,041 en fp32 implica unas 24 veces más rápido que tiempo real en un i9-11900H con 4 hilos.
- Despliegue: phoonnx (`pip install --pre phoonnx`) con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: dependiente de la longitud de la frase; con RTF 0,041, una frase de 5 segundos de audio se sintetiza en aproximadamente 0,2 segundos en fp32.
- Advertencia: con el port espyak en lugar de espeak-ng, algunos fonemas difieren y ciertas palabras pueden pronunciarse mal.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-hu_hu-berta-medium-espeak-v2 | hu-HU | VITS (Piper) ONNX | 63,2 MB fp32 / 18,7 MB int8 | CC0 1.0 | Pesos Piper 1.5, int8 validado |
| Phoonnx/vits-hu_hu-berta-medium-espeak | hu-HU | VITS (Piper) ONNX | no disponible | CC0 1.0 | Versión anterior, pesos previos a Piper 1.5 |
| rhasspy/piper-voices/hu/hu_HU/berta/medium | hu-HU | VITS (Piper) | no disponible | CC0 1.0 | Modelo upstream original, sin conversión ONNX ni int8 |

No se dispone de datos comparativos de rendimiento (MOS, WER) frente a otras voces húngaras en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, código ni razonamiento; no soporta tool calling ni agentes.
- Un solo idioma (húngaro) y un solo hablante; no hay control de estilo, emoción ni cambio de voz.
- La calidad depende críticamente del frontend de fonemización: usar espyak en lugar de espeak-ng puede producir pronunciaciones incorrectas.
- Los datos de entrenamiento no están registrados upstream, por lo que no se puede auditar la composición del corpus ni sus posibles sesgos.
- Riesgo de artefactos acústicos y prosodia incorrecta en palabras fuera del dominio de entrenamiento o con puntuación atípica.
- El WER de 0,095 se midió sobre solo 3 frases de FLORES-200 devtest; es una validación mínima, no una evaluación exhaustiva.
- La cuantización int8 multiplica por 2,4 el RTF (0,100 frente a 0,041) manteniendo el WER; conviene medir en el hardware objetivo antes de desplegar int8.
- Licencia CC0 1.0: sin restricciones para uso comercial, aunque el autor recomienda acreditar a Rhasspy.
- La conversión no modifica los pesos, pero cualquier fallo del upstream se hereda; verificar el commit `e9c8a39444` de piper-voices.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-berta-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/hu/hu_HU/berta/medium
- Repositorio anterior: https://huggingface.co/Phoonnx/vits-hu_hu-berta-medium-espeak
- phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset upstream: https://github.com/OHF-Voice/voice-datasets
