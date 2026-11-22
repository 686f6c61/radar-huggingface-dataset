# Phoonnx/vits-cs_cz-jirka-medium-espeak-v2

## Resumen

vits-cs_cz-jirka-medium-espeak-v2 es una voz de síntesis de habla (text-to-speech) en checo (cs-CZ) basada en la arquitectura VITS del ecosistema Piper. La publica Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy, `rhasspy/piper-voices/cs/cs_CZ/jirka/medium`, y sustituye a la versión anterior `Phoonnx/vits-cs_cz-jirka-medium-espeak`, ya que el upstream reentrenó la voz sobre los modelos base de Piper 1.5.

El modelo resuelve la generación de audio de voz a partir de fonemas espeak-ng en alfabeto IPA, con una única hablante y una frecuencia de muestreo de 22050 Hz. No es un modelo de lenguaje generativo: es un sintetizador acústico condicionado por fonemas, pensado para integrarse en asistentes de voz y sistemas de lectura en checo.

Su relevancia actual es práctica: el repositorio ocupa 0,1 GB, distribuye pesos fp32 (63,2 MB de grafo) y copias int8 (18,7 MB), y está publicado bajo licencia CC0 1.0, lo que permite uso comercial sin restricciones. Se integra con la librería phoonnx y con el plugin `ovos-tts-plugin-phoonnx` de OVOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5 o superior) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS condicionado por fonemas, no por tokens de contexto) |
| Tipos de cuantizacion | fp32 y int8 (quantize_dynamic de onnxruntime 1.32.0, pesos QInt8) |
| Idiomas soportados | checo (cs-CZ) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` fp32 y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Fonemizador | espeak-ng, voz `cs` |
| Puntuacion de clausula | `, . ! ? : ;` (conservada en phoonnx 1.96.1a1 y posteriores) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder acústico y un discriminador adversarial en entrenamiento, con alineamiento monotónico aprendido. En el ecosistema Piper se emplea la variante de calidad "medium" con entrada fonémica. La inferencia usa por defecto `noise_scale` 0.5 y `noise_w` 0.333, y requiere Piper 1.5 o superior.

El entrenamiento lo realizó Rhasspy (upstream). Según la model card upstream, la voz se ajustó (fine-tuning) desde el modelo base en inglés estadounidense `hifi_tts_92` (calidad medium, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), con MRD y SDP. Los datos de entrenamiento proceden de `https://github.com/OHF-Voice/voice-datasets` bajo licencia CC0, aunque el número de horas y la composición exacta no están registrados upstream. No se documenta RLHF ni DPO, al no tratarse de un modelo de lenguaje.

La conversión a ONNX no altera los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` y pasan una compuerta de calidad: audio finito y no silencioso, longitud entre 0,8 y 1,25 veces la de fp32, y WER como máximo el de fp32 más 0,05.

## Capacidades

- Síntesis de voz en checo (cs-CZ) a 22050 Hz a partir de texto, con fonemización mediante espeak-ng.
- Manejo de puntuación de cláusula (`, . ! ? : ;`) para prosodia y pausas en phoonnx 1.96.1a1 y posteriores.
- Una única hablante (jirka, medium), sin soporte multi-hablante.
- Salida de audio en WAV mediante `voice.synthesize_wav(...)`.
- Integración con OVOS a través de `ovos-tts-plugin-phoonnx` y configuración en `mycroft.conf`.
- Ejecución en CPU: RTF de 0,035 en fp32 y 0,092 en int8 (mediana de 3 ejecuciones, 4 hilos, Intel i9-11900H).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en checo: integrar la voz en OVOS mediante `ovos-tts-plugin-phoonnx` para respuestas habladas en un asistente doméstico, con latencia baja en CPU (RTF 0,035 en fp32).
- Lectura de textos y accesibilidad: convertir artículos, avisos o documentos en checo a audio para lectores de pantalla y sistemas de accesibilidad, aprovechando el tamaño reducido del grafo (63,2 MB fp32, 18,7 MB int8).
- Anuncios y avisos automatizados: generar mensajes de voz para transporte público, aeropuertos o comercios en checo, con despliegue en hardware modesto gracias al bajo consumo de memoria (RSS máximo de 305,8 MB en fp32).
- Sistemas de megafonía y domótica: producir confirmaciones habladas en dispositivos embebidos o de bajo consumo, usando la copia int8 (18,7 MB) y onnxruntime.
- Generación de audiolibros y contenido pregrabado: sintetizar narraciones en checo por lotes, con la ventaja de la licencia CC0 para uso comercial sin atribución obligatoria (aunque se recomienda acreditar a Rhasspy).
- Pruebas y desarrollo de pipelines TTS: usar la voz como referencia en evaluaciones de calidad (la model card documenta QA con ASR `nemo-parakeet-tdt-0.6b-v3` int8 y WER 0,000 sobre FLORES-200 devtest) y en la comparación de despliegues fp32 frente a int8.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar de TTS (MOS, MCD, etc.), pero sí resultados de control de calidad (QA) con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, medidos en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 10,2 a 10,7 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,00 a 1,03 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 305,8 MB | 252,5 MB |
| RTF (mediana de 3, 4 hilos) | 0,035 | 0,092 |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU con onnxruntime. El consumo de memoria es de aproximadamente 305,8 MB de RSS pico en fp32 y 252,5 MB en int8.
- GPU recomendadas: no aplica; no se documenta despliegue en GPU.
- GPU de consumo: no aplica; cabe en cualquier CPU moderna, incluidos equipos de gama baja y dispositivos embebidos.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`); integración en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF de 0,035 en fp32 y 0,092 en int8 sobre Intel i9-11900H con 4 hilos; entre 10,2 y 10,7 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Muestreo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-cs_cz-jirka-medium-espeak-v2 | VITS (Piper 1.5) | cs-CZ | 22050 Hz | CC0 1.0 | ONNX fp32/int8 | Conversion de rhasspy/piper-voices; 1 hablante |
| Phoonnx/vits-cs_cz-jirka-medium-espeak | VITS (Piper) | cs-CZ | 22050 Hz | CC0 1.0 | ONNX | Version anterior, pesos previos al reentrenamiento; sustituida por la v2 |
| rhasspy/piper-voices (cs_CZ-jirka-medium) | VITS (Piper) | cs-CZ | 22050 Hz | CC0 1.0 | Piper/ONNX | Modelo upstream original; mismos pesos sin la conversion de Phoonnx |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo checo (cs-CZ); no sintetiza otros idiomas ni permite seleccionar voces.
- Dependencia de espeak-ng: si se usa el port espyak, algunos fonemas difieren y ciertas palabras pueden pronunciarse mal; se recomienda instalar espeak-ng nativo.
- Requiere Piper 1.5 o superior; versiones anteriores no son compatibles con estos pesos.
- Los datos de entrenamiento no están registrados upstream (número de horas y composición), lo que limita la evaluación de sesgos y cobertura lingüística.
- Riesgo de errores de pronunciación en palabras extranjeras, siglas o dominios especializados, al depender de la fonemización de espeak-ng.
- La puntuación de cláusula solo se conserva en phoonnx 1.96.1a1 y posteriores; versiones anteriores pueden ignorarla.
- La evaluación QA se basa en solo 3 frases de FLORES-200 devtest, por lo que no es representativa de todos los dominios.
- Licencia CC0 1.0: permite uso comercial sin restricciones; aun así, se recomienda acreditar a Rhasspy como autor original.
- No apta para tareas de razonamiento, generación de texto, visión ni tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-cs_cz-jirka-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/cs/cs_CZ/jirka/medium
- Version anterior: https://huggingface.co/Phoonnx/vits-cs_cz-jirka-medium-espeak
- phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset upstream: https://github.com/OHF-Voice/voice-datasets
