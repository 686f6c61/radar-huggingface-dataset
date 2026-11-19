# remsky/kokoro-inno-clone-tuner

## Resumen

`kokoro-inno-clone-tuner` es un adaptador de clonación de voz zero-shot para el modelo de síntesis de voz Kokoro-82M, desarrollado por el usuario remsky. No se trata de un modelo generativo de texto ni de un TTS completo, sino de un módulo de *enrollment* (registro de hablante) que transforma una muestra de audio de referencia de entre 5 y 30 segundos en un *voice pack* compatible con la arquitectura estándar de Kokoro, con forma `[510, 1, 256]`. El problema que resuelve es concreto: Kokoro-82M es un TTS extremadamente ligero y rápido, pero no incorpora clonación de voz nativa; este adaptador añade esa capacidad sin modificar el modelo base ni requerir reentrenamiento.

El modelo suma 9.653.396 parámetros en safetensors y ocupa 0,2 GB en el repositorio, lo que lo sitúa en la categoría de componentes auxiliares ultraligeros. Se distribuye con pesos en safetensors y una exportación ONNX (`model.onnx`, fp32, 31,5 MB) para inferencia sin PyTorch. La licencia es Apache 2.0 y el único idioma declarado es inglés, coherente con el modelo base Kokoro-82M.

Su relevancia actual radica en que permite integrar clonación de voz en pipelines de TTS de baja latencia sobre CPU, con una paridad numérica entre backends PyTorch y ONNX de 5,4e-7 en 540 clips, y una velocidad aproximadamente 2x superior en ONNX respecto a PyTorch en CPU. Está integrado en Kokoro-FastAPI a partir de la versión 0.9.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de enrollment: speaker encoder (WeSpeaker ResNet34, 6,6M params, destilado de UniSpeech-SAT-sv) + style head; produce voice packs Kokoro `[510, 1, 256]` |
| Parámetros totales | 9.653.396 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (audio de referencia de 5 a 30 s; ventana de 30 s a 16 kHz para el fbank) |
| Tipos de cuantización | no disponible (pesos fp32; export ONNX fp32; el speaker encoder se destila de fp32 a fp16 en el modelo base según la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`), voice packs en `.pt` (PyTorch) y `.npy` (NumPy float32) |

## Arquitectura y entrenamiento

El adaptador implementa un pipeline de enrollment en dos mitades. La primera es un speaker encoder de 6,6M parámetros basado en WeSpeaker ResNet34, destilado a partir de embeddings de UniSpeech-SAT-sv (Microsoft). Este encoder consume un log-mel kaldi de 80 bandas sobre los primeros 30 segundos a 16 kHz y produce un embedding de 512 dimensiones en el espacio de UniSpeech-SAT-sv, normalizado (unitario). La segunda mitad es un style head que genera el componente de timbre del voice pack. La salida completa es un tensor `[510, 1, 256]` con la misma forma que los voice packs nativos de Kokoro, de modo que el modelo base lo consume sin modificaciones.

Los datos de entrenamiento declarados son LibriTTS-R filtrado (parler-tts/libritts_r_filtered), VoxPopuli y Emilia. Los hablantes de LibriTTS-R de `dev-clean` se mantienen fuera del entrenamiento como conjunto de validación. La model card indica que el speaker encoder destilado mantiene una similitud de coseno de hablante dentro de 0,002 en dev-clean respecto al profesor, con una reducción de 380 MB en fp32 a 14 MB en fp16. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de componente). La exportación ONNX usa opset 20 con operadores estándar, sin DFT ni operadores personalizados, y se verificó paridad numérica de 5,4e-7 frente a PyTorch en 540 clips.

## Capacidades

- Clonación de voz zero-shot a partir de una única muestra de referencia de 5 a 30 segundos.
- Generación de voice packs con la forma exacta de Kokoro (`[510, 1, 256]`), compatibles con el modelo base sin cambios.
- Inferencia en dos backends: PyTorch (vía `kokoro`) y ONNX Runtime (vía `kokoro-onnx`), con salidas equivalentes.
- Detección automática del techo de tono (pitch ceiling), con posibilidad de sobrescribirlo mediante `fmax` (por ejemplo, 180) para fuentes de archivo.
- Extracción de embedding de hablante de 512 dimensiones en el espacio UniSpeech-SAT-sv.
- Prefijado de nombres con códigos de acento y género estándar de Kokoro (`af_`, `am_`, `bf_`, `bm_`) para interoperabilidad con otras librerías.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un componente de voz.
- Capacidad multilingüe limitada al inglés, heredada del modelo base.

## Casos de uso

- Clonación de voz para narración de audiolibros: se registra la voz del narrador con una muestra de 30 segundos y se generan voice packs que Kokoro reproduce sobre textos largos, manteniendo el timbre sin reentrenar el TTS.
- Integración en Kokoro-FastAPI: a partir de la versión 0.9.0 el adaptador está integrado, de modo que un servicio HTTP de TTS puede exponer endpoints de enrollment y servir voces personalizadas a múltiples clientes.
- Despliegue en CPU sin GPU: la exportación ONNX procesa una referencia de 8 s en 100 ms y una de 30 s en 410 ms en CPU (mejor de 5 ejecuciones), lo que permite registrar voces en entornos sin acelerador hardware.
- Localización de contenido multimedia: sustitución de la voz de un presentador por una voz clonada en inglés para doblajes o versiones de un mismo vídeo, usando la referencia original como fuente.
- Prototipado de asistentes de voz personalizados: creación rápida de una voz de marca a partir de una grabación de estudio y uso del pack resultante en pipelines de TTS de baja latencia.
- Investigación en evaluación de sistemas TTS: el conjunto de validación dev-clean de LibriTTS-R permite medir similitud de hablante y calidad de clonación de forma reproducible.
- Generación de voces sintéticas para pruebas de accesibilidad: se clona una voz de referencia controlada para validar lectores de pantalla y sistemas de subtitulado sin depender de locutores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz (MOS, similitud de hablante, WER) en la información disponible. Los únicos datos cuantitativos publicados son de latencia y paridad numérica:

| Métrica | ONNX Runtime | PyTorch |
|---|---|---|
| Referencia de 8 s (CPU, mejor de 5) | 100 ms | 165 ms |
| Referencia de 30 s (CPU, mejor de 5) | 410 ms | 890 ms |
| Paridad numérica vs. PyTorch | 5,4e-7 en 540 clips | referencia |
| Similitud de coseno de hablante en dev-clean | dentro de 0,002 del profesor | no disponible |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita; con 9,65M parámetros en fp32 el peso ronda los 38 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. El caso de uso principal declarado es CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, e incluso en CPU sin acelerador.
- Opciones de despliegue: `inno-kokoro` con backend PyTorch (`pip install "inno-kokoro[torch]"`), backend ONNX (`pip install inno-kokoro kokoro-onnx`), Kokoro-FastAPI (v0.9.0+) y kokoro-onnx para servir los voice packs.
- Latencia medida en CPU: 100 ms (referencia de 8 s) y 410 ms (referencia de 30 s) con ONNX Runtime; 165 ms y 890 ms con PyTorch.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Idiomas | Licencia | Clonación zero-shot |
|---|---|---|---|---|---|---|
| kokoro-inno-clone-tuner | Adaptador de enrollment para Kokoro-82M | 9,65M | 5-30 s de audio | en | apache-2.0 | Sí |
| Kokoro-82M (hexgrad) | TTS completo | 82M | texto | en (y otros según variante) | apache-2.0 | No nativa |
| StyleTTS2 | TTS con clonación por estilo | no disponible en la información | audio de referencia | en | no disponible en la información | Sí |
| XTTS v2 (Coqui) | TTS multilingüe con clonación | no disponible en la información | audio de referencia | multilingüe | no disponible en la información | Sí |

La comparación con StyleTTS2 y XTTS v2 se incluye por categoría funcional (clonación de voz), pero no se dispone de datos de parámetros, contexto ni licencia en la información proporcionada para esos modelos, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- El adaptador no genera audio por sí mismo: requiere el modelo base Kokoro-82M y un runtime compatible (`kokoro` o `kokoro-onnx`) para producir voz.
- La calidad de clonación depende de la referencia: la ventana útil es de 5 a 30 segundos y el encoder solo procesa los primeros 30 s a 16 kHz.
- El techo de tono se fija automáticamente; fuentes con registros atípicos (archivos históricos, locuciones muy agudas) pueden requerir ajuste manual de `fmax`.
- Riesgo de uso indebido: la clonación de voz sin consentimiento puede vulnerar derechos de imagen y voz; la licencia Apache 2.0 no exime de las obligaciones legales aplicables.
- No se han publicado métricas de calidad subjetiva (MOS) ni de robustez ante ruido, acentos no nativos o audio de baja calidad.
- La model card no detalla sesgos demográficos del speaker encoder; al estar destilado de UniSpeech-SAT-sv, puede heredar los sesgos de ese modelo.
- Uso comercial permitido por Apache 2.0, pero conviene verificar las licencias de los datasets de entrenamiento (LibriTTS-R, VoxPopuli, Emilia) para el caso concreto de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/remsky/kokoro-inno-clone-tuner
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio del código: https://github.com/remsky/inno-kokoro
- Kokoro-FastAPI: https://github.com/remsky/Kokoro-FastAPI
- Write-up del autor: https://remsky.art/writeups/kokoro-fastapi/inno-clone/
- Kokoro (implementación de referencia): https://github.com/hexgrad/kokoro
- kokoro-onnx: https://github.com/thewh1teagle/kokoro-onnx
- UniSpeech-SAT-sv (profesor del speaker encoder): https://huggingface.co/microsoft/unispeech-sat-base-plus-sv
- Dataset LibriTTS-R filtrado: https://huggingface.co/datasets/parler-tts/libritts_r_filtered
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset Emilia: https://huggingface.co/datasets/amphion/Emilia-Dataset
