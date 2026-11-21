# ai-coustics/vad-multi-speaker

## Resumen

VAD Multi Speaker es un modelo de deteccion de actividad de voz (VAD, voice activity detection) desarrollado por ai-coustics, orientado a produccion y disenado especificamente para audio ruidoso, multi-hablante y de campo lejano (far-field). A diferencia de aproximaciones clasicas que requieren un paso previo de reduccion de ruido, este modelo decide cuando habla cualquier persona directamente sobre la senal original del microfono, lo que simplifica el pipeline y evita el coste y la latencia de un denoiser separado.

El modelo se distribuye como artefacto propietario consumido a traves del SDK `aic-sdk` (Python, Rust, C/C++, Node.js y WebAssembly), no como pesos abiertos en formato estandar. Segun el autor, ofrece 30 ms de latencia, no requiere GPU ni dependencia de ONNX, y supera a Silero VAD en precision, equilibrio y fiabilidad. La version referenciada en los ejemplos del SDK es `vad-ms-2.1-xxs-16khz`.

Su relevancia actual radica en el auge de los agentes de voz en tiempo real: el turn-taking fiable (saber cuando el usuario ha terminado de hablar) es un cuello de botella critico en telefonos automatizados, asistentes conversacionales y pipelines de speech-to-text. El modelo es agnostico al idioma y acepta multiples frecuencias de muestreo de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificacion de audio por bloques para VAD) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa bloques de audio en streaming) |
| Tipos de cuantizacion | no disponible (artefacto propietario gestionado por el SDK) |
| Idiomas soportados | agnostico al idioma (language-agnostic) |
| Licencia | ai-coustics-model-license (propietaria, `license: other`) |
| Formato de pesos | artefacto propietario descargado via `aic.Model.download()`; no safetensors ni GGUF |
| Frecuencias de muestreo | multiples tasas de entrada soportadas (variante de ejemplo: 16 kHz) |
| Latencia | 30 ms |
| Requisitos de hardware | CPU, sin GPU ni ONNX |
| Entrada | bloques mono float32 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna (tipo de red, numero de capas, parametros) ni sobre el dataset de entrenamiento, el volumen de tokens o las tecnicas de ajuste (RLHF, DPO u otras). La model card unicamente describe el comportamiento funcional: el modelo procesa bloques de audio mono en coma flotante de 32 bits, no modifica la senal (solo la analiza) y expone una probabilidad de voz por bloque junto con una decision post-procesada.

La innovacion tecnica destacable es el diseno para operar sin denoiser previo y en paralelo con modulos de mejora de voz (speech enhancement): ambos pueden consumir el mismo bloque original de audio, y el SDK proporciona `get_prediction_delay()` para alinear las predicciones con la linea temporal del audio. El control de turn-taking se expone mediante parametros ajustables: `Sensitivity` (umbral de probabilidad 0.0-1.0), `MinimumSpeechDuration` (segundos antes de disparar "habla") y `SpeechHoldDuration` (segundos que se mantiene la deteccion tras cesar el habla). Tambien se expone `raw_vad_probability()` con la probabilidad sin procesar por bloque.

## Capacidades

- Deteccion de actividad de voz sobre audio ruidoso, multi-hablante y de campo lejano.
- Funcionamiento sin denoiser separado y en paralelo con modulos de mejora de voz.
- Agnostico al idioma: no depende de un inventario fonetico concreto.
- Soporte de multiples frecuencias de muestreo de entrada.
- Procesamiento en streaming por bloques con latencia de 30 ms.
- Parametrizacion del comportamiento de turn-taking (sensibilidad, duracion minima de habla, tiempo de retencion).
- Exposicion de probabilidad cruda por bloque y del retardo de prediccion en muestras para alineacion temporal.
- Ejecucion en CPU sin GPU ni dependencia de ONNX.
- Integracion con frameworks de agentes de voz: LiveKit y Pipecat documentados.
- SDK multi-lenguaje: Python, Rust, C/C++, Node.js y WebAssembly.

## Casos de uso

- Turn-taking en agentes de voz: el modelo decide cuando el usuario ha terminado de hablar con 30 ms de latencia y ajuste fino de `MinimumSpeechDuration` y `SpeechHoldDuration`, evitando interrupciones prematuras en asistentes conversacionales.
- Telefonia automatizada y call centers: deteccion robusta de habla en audio telefonico ruidoso y multi-hablante sin necesidad de un denoiser previo, reduciendo coste computacional por llamada.
- Pipelines de speech-to-text en produccion: activacion del reconocedor solo cuando hay voz, ahorrando computo en silencios y mejorando la segmentacion de transcripciones en reuniones con varios participantes.
- Deteccion de actividad de voz en dispositivos embebidos: al ejecutarse en CPU sin GPU ni ONNX, es viable en hardware limitado y en despliegues edge con SDK en C/C++ o WebAssembly.
- Integracion con LiveKit y Pipecat: uso como VAD de referencia en pipelines de agentes de voz en tiempo real, con quickstarts oficiales para ambos frameworks.
- Analisis de audio de campo lejano: procesamiento de grabaciones de microfonos lejanos (salas, dispositivos ambientales) donde los VAD clasicos fallan por relacion senal-ruido baja.
- Preprocesado en paralelo con mejora de voz: alimentar el mismo bloque original al VAD y al modulo de enhancement (por ejemplo Quail o Rook) y alinear decisiones mediante `get_prediction_delay()`.

## Benchmarks y rendimiento

El autor afirma que el modelo supera a Silero VAD en precision, equilibrio y fiabilidad, pero no se han publicado tablas numericas de benchmarks (MMLU, tasas de error, ROC-AUC u otras metricas de VAD) en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU ni dependencia de ONNX.
- VRAM estimada: no aplica (ejecucion en CPU); no disponible la huella de memoria exacta.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; el modelo esta pensado para CPU.
- Opciones de despliegue: SDK `aic-sdk` en Python (PyPI), Rust, C/C++, Node.js y WebAssembly; integracion documentada con LiveKit y Pipecat.
- Latencia: 30 ms segun el autor.
- Throughput: no disponible.
- Requisito adicional: clave de SDK de ai-coustics (prueba gratuita de 30 dias sin tarjeta) para ejecutar la inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Latencia | Requiere GPU | Requiere denoiser | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|---|
| VAD Multi Speaker (ai-coustics) | VAD multi-hablante, far-field | 30 ms | No | No | ai-coustics-model-license (propietaria) | Artefacto propietario via SDK |
| Silero VAD | VAD generico | no disponible en esta ficha | No | No | MIT (referencia externa) | Pesos abiertos |
| VAD Voice Focus (ai-coustics) | VAD de hablante principal | no disponible | No | No | ai-coustics-model-license | Artefacto propietario via SDK |

La comparativa se limita a categoria y modelo de distribucion; no se dispone de datos numericos de rendimiento de Silero VAD ni de VAD Voice Focus en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia propietaria (`ai-coustics-model-license`): el uso comercial esta sujeto a los terminos de ai-coustics y puede requerir licencia enterprise; no es software libre ni de codigo abierto.
- Requiere una clave de SDK de ai-coustics para la inferencia, incluso en la version de prueba; no es un modelo autocontenido en formato abierto.
- No se publican pesos en safetensors ni GGUF: la portabilidad fuera del SDK oficial es nula.
- No se dispone de informacion sobre sesgos, tasas de falsos positivos/negativos ni comportamiento en idiomas o acentos concretos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos/negativos en la deteccion de voz, con impacto directo en el turn-taking.
- El rendimiento en condiciones acusticas extremas (ruido impulsivo, reverberacion severa) no esta cuantificado en la informacion disponible.
- La documentacion no detalla el consumo de memoria ni el rendimiento en hardware embebido concreto.
- El modelo se centra en deteccion de actividad, no en diarizacion: no identifica quien habla, solo si alguien habla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/vad-multi-speaker
- Documentacion VAD Multi Speaker: https://docs.ai-coustics.com/models/voice-activity-detection/vad-multi-speaker
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentacion general: https://docs.ai-coustics.com
- Quickstart LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics-vad-only.py
- Artefactos y checksums: https://artifacts.ai-coustics.io
- SDK Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave de SDK gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Licencia enterprise: https://ai-coustics.com/
- VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
- Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- Tyto: https://huggingface.co/ai-coustics/tyto
