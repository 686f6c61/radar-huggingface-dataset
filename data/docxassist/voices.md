# DocXAssist/voices

## Resumen

DocXAssist voices es un repositorio de modelos de síntesis de voz (text-to-speech) publicado por DocXAssist, el desarrollador de la aplicación de escritorio DocXAssist (https://docxassist.com). Se trata de dos voces independientes, una en español y otra en alemán, pensadas para su integración en dicha aplicación. Ambas derivan de Kokoro-82M, un modelo TTS de 82 millones de parámetros con arquitectura StyleTTS 2, y se distribuyen en formato ONNX para su ejecución mediante ONNX Runtime.

El repositorio no introduce un modelo nuevo desde cero, sino que empaqueta y adapta pesos existentes: la voz española procede de hexgrad/Kokoro-82M v1.0 a través de onnx-community/Kokoro-82M-v1.0-ONNX (voces `ef_dora` y `em_alex`), mientras que la voz alemana es un ajuste fino alemán de Kokoro-82M realizado por Thorsten-Voice sobre el conjunto de datos CC0 Thorsten-Voice, con receta de kikiri-tts. DocXAssist ha exportado el modelo alemán a ONNX (opset 17) y ha convertido a float16 los tensores con 1024 valores o más, con un nodo Cast de vuelta a float32, reduciendo el tamano a la mitad sin pérdida declarada de calidad ni velocidad.

Es relevante para desarrolladores que necesiten un TTS multilingüe ligero, desplegable en local, con licencia Apache-2.0 y sin dependencia de servicios en la nube. El tamano del repositorio es de 0,3 GB y la salida de audio es de 24 kHz. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (modelo TTS no autorregresivo; base Kokoro-82M) |
| Parametros totales | 82 millones (Kokoro-82M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo TTS; entrada de fonemas de longitud variable) |
| Tipos de cuantizacion | almacenamiento de pesos en float16 (≥1024 valores) con Cast a float32; no es cuantizacion entera |
| Idiomas soportados | es, de |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx, opset 17), tensores de estilo en .bin (float32), vocab.json |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces incluidas | es: `ef_dora`, `em_alex`; de: `thorsten` |
| Entradas del modelo | `input_ids` (int64, [1, n]), `style` (float32, [1, 256]), `speed` (float32, [1]) |
| Salida | `waveform` (float32, 24 kHz) |

## Arquitectura y entrenamiento

Los modelos se basan en Kokoro-82M, un TTS de 82 millones de parámetros que sigue la arquitectura StyleTTS 2. Se trata de un modelo no autorregresivo que recibe secuencias de identificadores de fonemas y un vector de estilo para producir la forma de onda. La entrada de texto se procesa previamente con eSpeak NG, que convierte el texto a fonemas en IPA con ties, mapeados segun la implementación EspeakG2P de la librería misaki. El vector de estilo se toma de un tensor de voz (`style` de 256 dimensiones) y se selecciona la fila `n − 3` del tensor de la voz correspondiente al número de fonemas de entrada; el parámetro `speed` permite ajustar la velocidad.

No se detalla en la model card el volumen de tokens de entrenamiento ni la composición completa del dataset. La voz española reutiliza los pesos de Kokoro-82M v1.0 de hexgrad, mientras que la voz alemana es un ajuste fino de Kokoro-82M sobre el conjunto CC0 Thorsten-Voice, con receta de kikiri-tts. No se menciona el uso de RLHF ni DPO (poco habituales en TTS). Las modificaciones introducidas por DocXAssist son de empaquetado y exportación, no de entrenamiento: exportación del checkpoint PyTorch (`model.pth`) a ONNX con opset 17 y `disable_complex=True`, conversión de pesos grandes a float16 con Cast a float32, y guardado de los tensores de estilo como arrays float32 crudos (`*.bin`, 510 × 1 × 256) junto con el vocabulario de fonemas en `vocab.json`.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con salida de audio en formato de onda a 24 kHz.
- Soporte de dos idiomas: español (voces `ef_dora` y `em_alex`) y alemán (voz `thorsten`).
- Control de velocidad de habla mediante el parámetro `speed`.
- Conversión de grafemas a fonemas basada en eSpeak NG (IPA con ties) y mapeo EspeakG2P de misaki.
- Ejecución en ONNX Runtime, lo que permite inferencia en CPU o GPU sin depender de PyTorch en tiempo de ejecución.
- Selección de voz mediante tensores de estilo independientes (`*.bin`), lo que facilita añadir o cambiar voces sin modificar el modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el modelo es exclusivamente TTS.

## Casos de uso

- Lectura por voz en la aplicación DocXAssist: el modelo genera la locución de documentos para usuarios hispanohablantes y germanohablantes, integrándose en la aplicación de escritorio mediante ONNX Runtime.
- Accesibilidad para personas con discapacidad visual: conversión de texto de documentos, artículos o interfaces a voz en español y alemán, con control de velocidad para adaptarse al ritmo del usuario.
- Generación de audiolibros o contenido narrado: las voces permiten producir pistas de audio de forma local, sin enviar texto a servicios en la nube, lo que protege la confidencialidad del contenido.
- Subtitulado y doblaje automatizado: síntesis de pistas de voz en es y de para vídeos o presentaciones, usando el parámetro `speed` para ajustar la locución a la duración del clip.
- Asistentes de voz locales y embebidos: al ser un modelo de 82M de parámetros y formato ONNX, puede desplegarse en dispositivos con pocos recursos, evitando la latencia y las restricciones de privacidad de los servicios remotos.
- Sistemas de avisos y notificaciones habladas: integración en aplicaciones de escritorio o IoT que necesiten leer mensajes cortos en alemán o español con una latencia baja.
- Generación de voces para prototipos y pruebas de producto: uso en entornos de desarrollo para simular interfaces conversacionales o de lectura sin coste de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MOS, WER, latencia o throughput, ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del tamano del modelo; no confirmada por el autor): en float32, aproximadamente 0,33 GB solo de pesos, más el sobresaliente de activaciones; en el formato float16 del repositorio, en torno a 0,16 GB de pesos, que ONNX Runtime expande a float32 al cargar. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere una A100, H100 ni similares. Una GTX 1050 Ti, GTX 1650 o superior sería más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en muchas integradas, dado el reducido tamano del modelo.
- Ejecución en CPU: viable mediante ONNX Runtime; es una de las opciones habituales para este tipo de modelos ligeros.
- Opciones de despliegue: ONNX Runtime (principal, por el formato de pesos), y en general cualquier runtime compatible con ONNX. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, que no están orientados a TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependerán del hardware, del backend de ONNX Runtime (CPU/GPU) y de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DocXAssist voices (este repo) | 82M (base Kokoro-82M) | es, de | ONNX | Apache-2.0 | Voces `ef_dora`, `em_alex`, `thorsten`; empaquetado para ONNX Runtime |
| hexgrad/Kokoro-82M | 82M | en (principalmente) y otras voces | PyTorch / ONNX | Apache-2.0 | Modelo base; el repo de DocXAssist reutiliza sus pesos |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82M | segun voces incluidas | ONNX | Apache-2.0 | Fuente de la voz española empleada por DocXAssist |
| Thorsten-Voice/Kokoro | 82M | de | PyTorch | Apache-2.0 | Ajuste fino alemán sobre Thorsten-Voice; origen de la voz alemana |

No se dispone de datos de rendimiento comparativo ni de otras alternativas (Piper, XTTS, etc.) dentro de la información proporcionada.

## Limitaciones y advertencias

- El repositorio no describe sesgos específicos, pero al derivar de Kokoro-82M y del conjunto Thorsten-Voice, puede heredar sesgos de dichos datos (por ejemplo, sesgos de género o de acento en las voces disponibles).
- Riesgo de alucinación no aplicable en el sentido de generación de texto; sin embargo, la síntesis puede producir pronunciaciones incorrectas ante palabras desconocidas, siglas, números o texto no normalizado, dado que el G2P depende de eSpeak NG y de un vocabulario de fonemas concreto.
- Idiomas limitados a español y alemán; no se ofrece soporte multilingüe más allá de las voces incluidas.
- La calidad y la inteligibilidad pueden degradarse con textos muy largos o con puntuación atípica; no se documentan límites de longitud de entrada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los componentes de origen (Kokoro-82M, Thorsten-Voice, eSpeak NG) y de las dependencias de fonemización, ya que pueden imponer condiciones adicionales (por ejemplo, eSpeak NG es GPLv3).
- El proceso de conversión a float16 con Cast a float32 podría introducir diferencias mínimas respecto al modelo original; el autor afirma que la velocidad y la calidad son equivalentes, pero no se aportan mediciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado evaluaciones independientes.
- Uso en producción: al no existir benchmarks ni métricas de calidad, se recomienda evaluar la naturalidad (MOS) y la inteligibilidad (WER) en el dominio concreto antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DocXAssist/voices
- Aplicación DocXAssist: https://docxassist.com
- Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Kokoro-82M v1.0 ONNX (onnx-community): https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Thorsten-Voice Kokoro (ajuste fino alemán): https://huggingface.co/Thorsten-Voice/Kokoro
- Receta kikiri-tts: https://github.com/semidark/kikiri-tts
- misaki (G2P): https://github.com/hexgrad/misaki
