# NamaRL/siren-models

## Resumen

Project Siren es un paquete de ejecución (bundle) para un asistente de voz bilingüe (inglés y suajili) que funciona íntegramente en local sobre teléfonos Android de 4 GB de RAM. No se trata de un único modelo, sino de un conjunto de siete artefactos verificados que cubren la cadena completa de un asistente conversacional: detección de actividad de voz (VAD), reconocimiento automático del habla (STT), razonamiento de lenguaje y síntesis de voz (TTS). Lo desarrolla NamaRL y se distribuye con licencia Apache 2.0.

El componente de razonamiento es `sema-gemma3-270m-expd-q8_0.gguf`, una variante del modelo Gemma 3 de 270 millones de parámetros cuantizada a Q8_0 (278,04 MB), que según la model card carga en aproximadamente 1,3 s y produce JSON válido en el 100 % de los casos. El reconocimiento de voz corre sobre Whisper base adaptado al suajili e inglés mediante `sherpa-onnx` en INT8 (152,47 MB), y la síntesis usa un modelo Piper VITS de cuatro voces bilingües (73,49 MB).

Su relevancia radica en el objetivo de ingeniería: mantener un pico de memoria residente (RSS) por debajo de 900 MB en dispositivos `arm64-v8a` de gama baja, con un total de 505,44 MB de artefactos. Es una propuesta orientada a asistentes de voz offline en contextos de conectividad limitada, con soporte específico para suajili, un idioma poco cubierto por los asistentes comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle multi-componente: VAD Silero (ONNX), STT Whisper base (sherpa-onnx INT8), razonamiento Gemma 3 270M (GGUF Q8_0), TTS Piper VITS FP32 |
| Parametros totales | 268.098.176 (según safetensors del repo); el componente de razonamiento Gemma 3 270M es de 270M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (razonamiento), ONNX INT8 (STT), ONNX FP32 (TTS), ONNX (VAD) |
| Idiomas soportados | Inglés (en) y suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, ONNX, safetensors (repo) |

## Arquitectura y entrenamiento

El bundle combina cuatro subsistemas independientes. La detección de voz emplea Silero VAD en ONNX (0,61 MB), con endpointing y cancelación de interrupción a mitad de frase en un máximo de 4,91 ms. El STT es un Whisper base adaptado al suajili e inglés, exportado a `sherpa-onnx` en INT8 con vocabulario propio (`base-tokens.txt`). El razonamiento recae en una variante de Gemma 3 de 270M parámetros cuantizada a Q8_0, que usa tokenización SentencePiece con `merges=0`. La síntesis es un modelo Piper VITS de cuatro voces (`af_heart`, `af_sky`, `am_puck`, `am_onyx`), cada una con cobertura bilingüe inglés-suajili.

No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo ajuste fino con RLHF o DPO para el componente de razonamiento. La model card sí reporta métricas de adaptación del STT: en el conjunto FLEURS de suajili, la variante `exp3` alcanza un WER del 24,25 % frente al 118,72 % de la versión estándar (Stock), lo que indica un ajuste específico del reconocimiento para ese idioma. El TTS opera con un factor de tiempo real (RTF) de CPU de 0,184x a 0,272x, es decir, entre 3,7 y 5,4 veces más rápido que tiempo real.

## Capacidades

- Reconocimiento de voz bilingüe inglés-suajili con detección de actividad de voz y endpointing.
- Detección de interrupción a mitad de frase (barge-in) con latencia máxima de cancelación de 4,91 ms.
- Razonamiento de lenguaje y generación de respuestas conversacionales con el modelo Gemma 3 270M.
- Salida estructurada en JSON válido (100 % según la model card), apta para orquestación de respuestas.
- Síntesis de voz con cuatro voces, todas con cobertura bilingüe.
- Funcionamiento completamente offline, sin dependencia de red.
- Despliegue en dispositivos Android `arm64-v8a` con 4 GB de RAM mediante la app Siren (APK v0.2.8).
- Descarga e instalación del bundle a través de un manifiesto remoto (`manifest.json`).

## Casos de uso

- Asistente de voz offline en zonas con conectividad limitada: el bundle completo (505,44 MB) se ejecuta en local sin red, lo que permite consultas conversacionales en inglés y suajili en teléfonos de 4 GB de RAM.
- Atención al ciudadano en suajili: el STT ajustado reduce el WER del 118,72 % al 24,25 % en FLEURS SW, lo que lo hace viable para dictado y consultas habladas en ese idioma.
- Aplicaciones de accesibilidad para personas con movilidad reducida: la interacción por voz con barge-in (cancelación en 4,91 ms) permite interrumpir al asistente de forma natural.
- Kioscos o dispositivos empotrados de bajo consumo: el TTS con RTF de 0,184x-0,272x en CPU permite síntesis en tiempo real sin GPU.
- Prototipado de pipelines de voz: la separación en componentes (VAD, STT, LLM, TTS) con formatos estándar (ONNX, GGUF) facilita sustituir piezas individuales en un banco de pruebas.
- Integración de respuestas estructuradas: la salida JSON válida del componente de razonamiento permite conectar el asistente a acciones o servicios definidos por la aplicación.
- Educación y alfabetización digital en África oriental: cobertura bilingüe inglés-suajili en reconocimiento y síntesis para aplicaciones de aprendizaje de idiomas.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| WER FLEURS suajili (STT `exp3`) | 24,25 % |
| WER FLEURS suajili (Whisper base estándar) | 118,72 % |
| Salida JSON válida (Gemma 3 270M Q8_0) | 100 % |
| Tiempo de carga del modelo de razonamiento | ~1,3 s |
| RTF de CPU del TTS | 0,184x-0,272x (3,7x-5,4x más rápido que tiempo real) |
| Latencia máxima de cancelación (VAD) | 4,91 ms |
| Pico de RSS objetivo | ≤ 900 MB |
| RSS del STT | ~390 MB |
| RSS del razonamiento | ~420,83 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Dispositivos objetivo: teléfonos Android `arm64-v8a` con 4 GB de RAM.
- Pico de memoria residente objetivo: ≤ 900 MB.
- Tamaño total del bundle: 505,44 MB en siete archivos.
- APK Android: 101,50 MB (v0.2.8, `arm64-v8a`), SHA-256 `0a8206fb6015c49ea816b441536502380c6304abcfa4f283a3bfe2952c533e5f`.
- Componentes y memoria: VAD 0,61 MB; STT 152,47 MB (~390 MB RSS); razonamiento 278,04 MB (~420,83 MB RSS); TTS 73,49 MB.
- Despliegue: app Siren para Android y `sherpa-onnx` para el STT; los formatos ONNX y GGUF permiten su uso con runtimes compatibles.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el diseño es para CPU móvil.
- Latencia y throughput: TTS a 0,184x-0,272x RTF en CPU; carga del LLM ~1,3 s; cancelación VAD ≤ 4,91 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Project Siren (NamaRL) | Bundle de voz (VAD + STT + LLM + TTS) | 270M (razonamiento) | en, sw | Apache 2.0 | Asistente offline en Android de 4 GB |
| Whisper base (OpenAI) | STT | ~74M | Multilingüe | MIT | Reconocimiento de voz; sin ajuste específico para suajili |
| Gemma 3 270M (Google) | LLM | 270M | Multilingüe | Gemma Terms | Razonamiento ligero; sin cadena de voz integrada |
| Piper (Rhasspy) | TTS | Variable | Multilingüe | MIT | Síntesis de voz; sin voces bilingües en-sw preconfiguradas |

La comparación directa es limitada porque Project Siren integra varios componentes en un único bundle con objetivo de memoria acotada, mientras que las alternativas son piezas aisladas. No se dispone de datos de rendimiento comparables entre el bundle completo y pipelines equivalentes.

## Limitaciones y advertencias

- Cobertura lingüística restringida a inglés y suajili; no hay soporte declarado para otras lenguas.
- El componente de razonamiento es un modelo de 270M parámetros, con capacidad limitada para tareas complejas de razonamiento o código.
- No se especifica la longitud de contexto del modelo de razonamiento.
- No se detallan los datos de entrenamiento ni los procesos de alineación, por lo que no se puede evaluar el riesgo de sesgos.
- Riesgo de alucinación inherente al componente generativo; no se reportan métricas de fidelidad factual.
- El bundle está orientado a Android `arm64-v8a`; no se documenta soporte para otras plataformas.
- El WER del 24,25 % en suajili, aunque muy inferior al baseline, sigue siendo elevado para aplicaciones de dictado críticas.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los componentes subyacentes (Gemma 3, Whisper, Piper, Silero VAD) antes de un uso comercial.
- El proyecto se encuentra en fase temprana (v0.2.8, 440 descargas, 1 like), sin garantías de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/NamaRL/siren-models
- Manifiesto del bundle: https://huggingface.co/NamaRL/siren-models/resolve/main/manifest.json
- APK Android v0.2.8: https://huggingface.co/NamaRL/siren-models/resolve/main/apk/Siren-v0.2.8-arm64.apk
