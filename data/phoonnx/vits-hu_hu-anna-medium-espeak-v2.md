# Phoonnx/vits-hu_hu-anna-medium-espeak-v2

## Resumen

vits-hu_hu-anna-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en húngaro, publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy alojado en rhasspy/piper-voices (ruta hu/hu_HU/anna/medium). Se trata de una voz femenina única de calidad "medium" basada en la arquitectura VITS del ecosistema Piper, con entrada de fonemas generados por espeak-ng en alfabeto IPA.

El modelo resuelve un problema muy concreto: ofrecer TTS neuronal en húngaro ejecutable en CPU, sin GPU ni servicios en la nube, con un grafo ONNX de 63,2 MB en fp32 y 18,7 MB en int8. Su relevancia actual radica en que sustituye a la conversión anterior (Phoonnx/vits-hu_hu-anna-medium-espeak) tras el reentrenamiento upstream sobre los modelos base de Piper 1.5, y en que incorpora copias int8 verificadas con un proceso de control de calidad automatizado mediante ASR.

No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Es un componente de inferencia de audio pensado para integrarse en asistentes de voz, lectores de pantalla y sistemas embebidos a través de la librería phoonnx o del plugin OVOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de texto por frase; sin ventana de contexto) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | húngaro (hu-HU) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafo fp32 e int8) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 (voz "anna") |
| Entrada de texto | fonemas espeak-ng, alfabeto IPA |
| Puntuacion soportada | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma |
| Tamano del repositorio | 0,1 GB |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 277,6 MB (fp32) / 242,0 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,040 (fp32) / 0,110 (int8) |
| Libreria | phoonnx |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normales y un discriminador adversarial, con alineamiento monotono aprendido. En esta implementacion (Piper) el texto se convierte previamente a fonemas IPA mediante espeak-ng, de modo que el modelo no aprende grafemas sino una representacion fonetica normalizada. La salida es audio mono a 22050 Hz.

El entrenamiento upstream, segun la model card, parte del modelo base hifi_tts_92 en ingles estadounidense (calidad medium, voz de Cori Samuel, lectora 92 de Hi-Fi TTS) y se afina con MRD y SDP. Los datos de entrenamiento proceden de OHF-Voice/voice-datasets con licencia CC0, aunque el numero exacto de horas y la composicion del corpus no estan registrados upstream. Los ajustes de inferencia por defecto son noise_scale 0.5 y noise_w 0.333, y se requiere Piper 1.5 o superior. La conversion a ONNX no altera los pesos; las copias int8 si los cuantizan dinamicamente con onnxruntime 1.32.0.

## Capacidades

- Sintesis de voz mono-hablante en hungaro a partir de texto con fonemizacion espeak-ng (voz `hu`).
- Respeto de la puntuacion de clausula (, . ! ? : ;) en la sintesis con phoonnx 1.96.1a1 y posteriores.
- Inferencia en CPU sin GPU, con latencias muy bajas (RTF de 0,040 en fp32 sobre un Intel i9-11900H).
- Ejecucion en dos variantes de precision (fp32 e int8) con calidad verificada por ASR.
- Integracion como plugin de OVOS (`ovos-tts-plugin-phoonnx`) configurable via `mycroft.conf`.
- Generacion directa a fichero WAV mediante la API `synthesize_wav` de phoonnx.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: unicamente hungaro.

## Casos de uso

- Asistentes de voz locales en hungaro: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo convierte respuestas textuales en audio en tiempo real sobre CPU, sin depender de APIs externas ni de conectividad.
- Lectura de pantalla y accesibilidad: con un RTF de 0,040 en fp32, la sintesis de un parrafo de varios segundos se completa en una fraccion del tiempo de reproduccion, lo que permite lectura fluida de contenido largo en hardware modesto.
- Sistemas embebidos y dispositivos de bajo consumo: el grafo int8 de 18,7 MB y un pico de RSS de 242 MB permiten desplegar la voz en Raspberry Pi o mini-PC sin acelerador dedicado.
- Generacion de audiolibros y contenido pregrabado: la licencia CC0 permite sintetizar y distribuir audio sin restricciones de atribucion obligatoria, adecuado para pipelines por lotes de narracion en hungaro.
- Pruebas automatizadas de pipelines de voz: el modelo sirve como referencia determinista y ligera para validar cadenas ASR-TTS en CI, con un WER medido de 0,238 sobre FLORES-200 devtest (3 frases) como linea base.
- Kioscos y terminales de informacion publica: sintesis local de avisos y mensajes en hungaro con latencia predecible y sin coste por caracter, en entornos sin salida a internet.
- Prototipado de interfaces conversacionales: su instalacion via `pip install --pre phoonnx` y la carga por identificador de voz (`piper/hu_HU-anna-medium-v2`) permiten iterar rapidamente sobre dialogos antes de invertir en voces de mayor calidad.

## Benchmarks y rendimiento

Los unicos datos publicados son las pruebas de control de calidad del propio repositorio, medidas sobre un Intel Core i9-11900H a 2,50 GHz con 4 hilos y evaluadas con ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la prueba | pass | pass |
| WER | 0,238 | 0,238 |
| Caracteres por segundo | 14,2 a 15,7 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,01 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 277,6 MB | 242,0 MB |
| RTF (mediana de 3) | 0,040 | 0,110 |

No se han publicado resultados de benchmarks comparativos (MOS, MCD, SIM) frente a otras voces en la informacion disponible. El WER de 0,238 debe interpretarse con cautela: se calcula sobre solo 3 frases y mide inteligibilidad mediante un ASR externo, no calidad perceptual.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU. Memoria RAM estimada: 277,6 MB de pico en fp32 y 242,0 MB en int8.
- GPU recomendadas: no aplica; el modelo esta disenado para ejecucion en CPU. No se documenta soporte de aceleracion por GPU en la informacion disponible.
- Consumer GPU: irrelevante para el despliegue; cualquier CPU x86-64 moderna es suficiente. El rendimiento de referencia se midio en un Intel i9-11900H.
- Despliegue: libreria phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado en el sistema (`apt install espeak-ng`) o mediante el extra `phoonnx[espeak]` (port espyak, con posibles divergencias foneticas). Integracion en OVOS con `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF de 0,040 en fp32 (25 veces mas rapido que tiempo real) y 0,110 en int8 (unas 9 veces mas rapido que tiempo real) con 4 hilos. La variante int8 es mas lenta en este hardware pese a ocupar menos memoria.
- Almacenamiento: repositorio de 0,1 GB; grafo individual de 63,2 MB (fp32) o 18,7 MB (int8).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-hu_hu-anna-medium-espeak-v2 | VITS (Piper) | hu-HU | 1 | ONNX fp32/int8 | CC0 1.0 | Conversion del upstream Piper 1.5; RTF 0,040 fp32 |
| Phoonnx/vits-hu_hu-anna-medium-espeak | VITS (Piper) | hu-HU | 1 | ONNX | CC0 1.0 | Version anterior, pesos previos al reentrenamiento; sustituida por v2 |
| rhasspy/piper-voices (hu_HU/anna/medium) | VITS (Piper) | hu-HU | 1 | ONNX (Piper) | CC0 1.0 | Modelo upstream original; requiere Piper 1.5 o superior |
| Otras voces Piper en hungaro | VITS (Piper) | hu-HU | variable | ONNX | CC0 1.0 | No se dispone de datos comparativos de rendimiento en la informacion disponible |

No se dispone de comparaciones con sistemas TTS neuronales de mayor tamano (por ejemplo, modelos basados en difusion o LLM de audio) en la informacion proporcionada; la comparativa se limita al ecosistema Piper/ONNX.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo hungaro (hu-HU) y una unica voz; no admite cambio de hablante ni otros idiomas.
- Requiere espeak-ng para la fonemizacion; con el port espyak algunos fonemas difieren y ciertas palabras pueden pronunciarse incorrectamente.
- El WER de 0,238 se obtuvo sobre solo 3 frases de FLORES-200 devtest; es una muestra demasiado pequena para extrapolar calidad en produccion.
- Calidad "medium": adecuada para asistentes y lectura, pero no para doblaje o locucion profesional de alta fidelidad.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones anomalas en palabras fuera de dominio, especialmente nombres propios y terminos tecnicos.
- Sin datos registrados upstream sobre el corpus de entrenamiento (horas, composicion, diversidad de hablantes), lo que impide evaluar sesgos de dominio o cobertura fonetica.
- La licencia CC0 1.0 permite uso comercial sin restricciones ni atribucion obligatoria; aun asi, se recomienda citar a Rhasspy como autoria original de los pesos.
- La variante int8, pese a ocupar menos memoria, presenta un RTF de 0,110 frente a 0,040 en fp32 en el hardware de referencia; conviene medir en el hardware objetivo antes de elegirla.
- No se documenta soporte de aceleracion por GPU ni de otros runtimes distintos de onnxruntime; el despliegue esta acoplado a phoonnx o a Piper.
- La fecha de creacion del repositorio (2026-11-22) y el numero de descargas (0) indican un modelo muy reciente y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-anna-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/hu/hu_HU/anna/medium
- Repositorio rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices
- Conversion anterior sustituida: https://huggingface.co/Phoonnx/vits-hu_hu-anna-medium-espeak
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
