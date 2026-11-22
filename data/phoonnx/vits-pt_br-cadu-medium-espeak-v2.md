# Phoonnx/vits-pt_br-cadu-medium-espeak-v2

## Resumen

`Phoonnx/vits-pt_br-cadu-medium-espeak-v2` es una voz de síntesis de voz (text-to-speech) en portugués de Brasil, publicada por Phoonnx (TigreGotico Lda). Se trata de una conversión a ONNX del modelo Piper `pt_BR/cadu/medium` de Rhasspy, empaquetada para su uso con la librería phoonnx. No es un modelo de lenguaje: es un modelo acústico VITS de un solo hablante que transforma fonemas espeak en audio a 22.050 Hz.

La relevancia de esta versión radica en que sustituye a `Phoonnx/vits-pt_br-cadu-medium-espeak`, ya que el autor original reentrenó la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444` de `rhasspy/piper-voices`). El repositorio incluye tanto los grafos ONNX en fp32 como copias cuantizadas a int8, con validación automática de calidad mediante ASR.

El modelo está pensado para síntesis local de baja latencia en asistentes de voz y sistemas embebidos: el grafo fp32 ocupa 63,2 MB y el int8 18,7 MB, con un pico de memoria residente de 261,5 MB y 213,2 MB respectivamente, lo que permite ejecución en CPU sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada = fonemas espeak) |
| Tipos de cuantizacion | fp32 e int8 (QInt8, `quantize_dynamic` de onnxruntime 1.32.0) |
| Idiomas soportados | pt-BR (portugués de Brasil) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafos `<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22.050 Hz |
| Hablantes | 1 |
| Fonemizador | espeak-ng, voz pt-br (alfabeto IPA) |
| Puntuación soportada | `, . ! ? : ;` (mantenida en síntesis desde phoonnx 1.96.1a1) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un predictor de duración y alineamiento, y un decodificador generativo (GAN condicional) con muestreo de ruido. En el ecosistema Piper, el modelo consume fonemas IPA generados por espeak-ng y produce audio directamente a 22.050 Hz. Los parámetros de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior.

Según la model card, la voz se ajustó (finetune) a partir del modelo base `rdh` (calidad medium, nl_BE, un hablante flamenco, CC0) aplicando MRD y SDP. Los datos de entrenamiento originales no están registrados en la fuente upstream; el dataset de referencia apunta a `https://github.com/OHF-Voice/voice-datasets` con licencia CC0. No se documenta el número de tokens ni la composición exacta del corpus, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo TTS de este tipo).

La innovación técnica relevante de esta publicación es la conversión a ONNX con cuantización dinámica a int8 y una puerta de calidad automática: se acepta la copia int8 si el audio es finito y no silencioso, si su duración está entre 0,8 y 1,25 veces la del fp32 y si su WER no supera el WER fp32 + 0,05.

## Capacidades

- Síntesis de voz mono-hablante en portugués de Brasil a partir de texto.
- Entrada basada en fonemas espeak-ng (voz `pt-br`, alfabeto IPA), no en texto crudo.
- Respeto de puntuación de cláusula (`, . ! ? : ;`) durante la síntesis en phoonnx 1.96.1a1 y posteriores.
- Salida de audio WAV a 22.050 Hz mediante `synthesize_wav`.
- Ejecución en CPU sin GPU, con grafos ONNX ligeros (18,7 MB en int8).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales: el modelo sintetiza respuestas en pt-BR en CPU con un RTF de 0,039 en fp32 (mediana de 3 ejecuciones, 4 hilos), adecuado para dispositivos sin GPU.
- Sistemas empotrados y Raspberry Pi: el grafo int8 de 18,7 MB y un pico de RSS de 213,2 MB permiten desplegar la voz en hardware con memoria limitada.
- Lectura de textos largos por cláusulas: al conservar la puntuación `, . ! ? : ;`, se pueden generar audiolibros o boletines fragmentando el texto por frases y manteniendo pausas naturales.
- Integración en OVOS/Mycroft: basta con seleccionar `piper/pt_BR-cadu-medium-v2` en `mycroft.conf` para dotar de voz a un asistente doméstico en portugués.
- Generación de avisos y notificaciones automatizadas: pipelines que convierten mensajes de texto en audio para sistemas de megafonía o alertas telefónicas en Brasil.
- Pruebas de accesibilidad y prototipado de interfaces de voz: la licencia CC0 y el formato ONNX facilitan su inclusión en demos y productos sin restricciones de atribución obligatoria.
- Síntesis por lotes en servidores sin acelerador: el RTF de 0,105 en int8 sigue siendo inferior a 1, por lo que la generación es más rápida que el tiempo real incluso cuantizado.

## Benchmarks y rendimiento

La model card incluye una validación de calidad (QA) con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, medida en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,030 |
| Caracteres por segundo | 14,5 a 17,8 | no disponible |
| Ratio de longitud int8/fp32 | no aplica | 0,99 a 1,03 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 261,5 MB | 213,2 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,105 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU mediante onnxruntime.
- Memoria RAM: pico de RSS de 261,5 MB en fp32 y 213,2 MB en int8.
- GPU recomendadas: no aplica; no se documenta soporte de aceleración por GPU en la información disponible.
- Cabe en cualquier GPU de consumo y en CPU de gama baja; el grafo int8 de 18,7 MB es apto para dispositivos embebidos.
- Despliegue: librería phoonnx (`pip install --pre phoonnx`) con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`); plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput: RTF de 0,039 en fp32 y 0,105 en int8 sobre i9-11900H con 4 hilos; entre 14,5 y 17,8 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-pt_br-cadu-medium-espeak-v2 | VITS (Piper 1.5) | pt-BR | 22.050 Hz | CC0 1.0 | ONNX (fp32/int8) | Conversion con QA ASR y cuantizacion int8 validada |
| rhasspy/piper-voices pt_BR/cadu/medium | VITS (Piper 1.5) | pt-BR | 22.050 Hz | CC0 1.0 | Piper/ONNX upstream | Modelo original del que deriva esta conversion |
| Phoonnx/vits-pt_br-cadu-medium-espeak | VITS (Piper) | pt-BR | 22.050 Hz | CC0 1.0 | ONNX | Version anterior con pesos previos a Piper 1.5 |

No se dispone de datos de benchmarks comparativos con otras voces Piper en la información proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo sintetiza pt-BR; no admite otros idiomas ni cambio de voz.
- Dependencia de espeak-ng: los fonemas de espyak pueden diferir de los de espeak-ng, lo que puede provocar pronunciaciones incorrectas de algunas palabras.
- WER no nulo en int8 (0,030 frente a 0,000 en fp32): la cuantización introduce degradación medible, aunque dentro del umbral aceptado.
- Los datos de entrenamiento originales no están registrados, por lo que no se puede auditar la composición del corpus ni los posibles sesgos de pronunciación o acento.
- Riesgo de alucinación acústica: como todo modelo generativo TTS, puede producir artefactos o prosodia anómala en entradas atípicas (siglas, números, extranjerismos).
- La validación QA se hizo sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida que no garantiza robustez general.
- Licencia CC0 1.0: permite uso comercial sin atribución obligatoria, aunque la model card solicita dar crédito a Rhasspy.
- Requiere phoonnx 1.96.1a1 o posterior para mantener la puntuación de cláusula en la síntesis; versiones anteriores pueden ignorarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-cadu-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/pt/pt_BR/cadu/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de referencia: https://github.com/OHF-Voice/voice-datasets
- Version anterior: https://huggingface.co/Phoonnx/vits-pt_br-cadu-medium-espeak
