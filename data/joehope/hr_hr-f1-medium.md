# joehope/hr_HR-f1-medium

## Resumen

`joehope/hr_HR-f1-medium` es una voz de síntesis de voz (text-to-speech) para croata, desarrollada por el usuario joehope y publicada en Hugging Face. Se trata de un modelo Piper basado en la arquitectura VITS, entrenado para un único hablante y con calidad media a una frecuencia de muestreo de 22,05 kHz. El modelo parte de un checkpoint de otro idioma relacionado mediante la técnica de *warmstart* cross-lingual, un flujo de trabajo estándar y documentado en Piper.

El modelo resuelve la necesidad de disponer de una voz TTS en croata ejecutable de forma local y ligera, sin depender de servicios en la nube. Su empaquetado en formato ONNX permite tanto el uso directo con la CLI de Piper como la integración con sherpa-onnx, lo que facilita su despliegue en entornos de escritorio, servidores modestos o dispositivos embebidos.

Su relevancia actual radica en que el croata es un idioma con cobertura limitada en el ecosistema TTS open source, y este modelo ofrece pesos abiertos (CC BY-SA 4.0) junto con un checkpoint de *warmstart* que permite a otros desarrolladores afinar sus propias voces en croata reutilizando el trabajo previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), modelo acústico end-to-end con decoder generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas/texto, no contexto de tokens) |
| Tipos de cuantizacion | fp32 y int8 (cuantización dinámica, `QuantType.QUInt8`, ~30 % del tamaño fp32) |
| Idiomas soportados | croata (hr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (fp32 e int8), checkpoint PyTorch Lightning (`.ckpt`) para reentrenamiento |
| Frecuencia de muestreo | 22,05 kHz |
| Hablantes | 1 (single-speaker) |
| Calidad declarada | media (medium) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS tal como la implementa Piper: un sistema TTS end-to-end que combina un encoder de texto/fonemas, un predictor de duración, un normalizing flow y un decoder generativo para producir audio. La salida se genera a 22,05 kHz con calidad media. La fonemización se realiza mediante espeak-ng (voz `hr`), lo que implica que la entrada de texto se convierte primero a fonemas antes de la inferencia.

El entrenamiento se realizó sobre un corpus de habla croata de un único hablante (descrito en la model card como «single speech, a corpus of Croatian speech»). El punto de partida fue un checkpoint Piper de otro idioma relacionado, aplicando *warmstart* cross-lingual; ese checkpoint original proviene del dataset `rhasspy/piper-checkpoints` en Hugging Face. No se especifican en la información disponible el número de tokens, horas de audio, composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo TTS). El repositorio incluye un checkpoint de *warmstart* con el estado del optimizador eliminado (aproximadamente un tercio del tamaño original), pensado para afinar nuevas voces en croata mediante `--model.warmstart_ckpt`, no para reanudar un entrenamiento exacto.

## Capacidades

- Síntesis de voz en croata a partir de texto, con salida WAV a 22,05 kHz.
- Voz única (single-speaker), adecuada para narración y lectura de texto.
- Fonemización mediante espeak-ng con la voz `hr`, integrada en el flujo de Piper y sherpa-onnx.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de GPU ni de servicios externos.
- Dos variantes de precisión: fp32 (calidad completa) e int8 (mayor velocidad, menor calidad).
- Integración con la CLI de Piper y con sherpa-onnx (CLI en C++ y API de Python).
- Checkpoint de reentrenamiento para afinar voces propias en croata.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni otras capacidades de los LLM; es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del croata.

## Casos de uso

- Lectura de artículos y documentos en croata: el modelo convierte texto plano en audio mediante la CLI de Piper, con un coste computacional bajo y sin conexión a internet, adecuado para aplicaciones de accesibilidad o lectura por voz en escritorio.
- Asistentes de voz locales para croata: integrado con sherpa-onnx, puede formar parte de un pipeline de reconocimiento y síntesis de voz que se ejecute íntegramente en el dispositivo, sin enviar audio a la nube.
- Señalización y anuncios automatizados: para sistemas de megafonía, transporte o comercio que necesiten generar anuncios pregrabados en croata a partir de plantillas de texto, aprovechando la inferencia rápida en CPU.
- Audiolibros y contenido narrado de dominio público: la voz única y la calidad media permiten generar narraciones largas por lotes; el tamaño reducido del modelo int8 facilita el procesado masivo en servidores modestos.
- Prototipado de productos de voz para el mercado croata: al ser un modelo pequeño y de licencia abierta, sirve para validar experiencias de usuario con voz sintética antes de invertir en una voz comercial o en un entrenamiento propio.
- Base para afinar voces personalizadas: el checkpoint de *warmstart* incluido permite a un desarrollador entrenar una voz croata propia partiendo de este modelo, reutilizando el conocimiento adquirido y reduciendo los datos y el tiempo de entrenamiento necesarios.
- Pruebas de integración en pipelines TTS: útil para verificar el funcionamiento de Piper o sherpa-onnx en una infraestructura concreta antes de desplegar otras voces o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, latencia medida) ni comparaciones cuantitativas con otras voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; el modelo está pensado para ejecutarse en CPU mediante ONNX Runtime. El repositorio completo ocupa 0,4 GB, y la variante int8 reduce el modelo a aproximadamente el 30 % del tamaño fp32.
- GPU recomendadas: no se especifican; al ser un modelo VITS de tamaño reducido, no requiere GPU. Cualquier GPU con soporte de ONNX Runtime podría acelerar la inferencia, pero no se documentan requisitos ni rendimiento en GPU.
- ¿Cabe en GPU de consumo? Sí, con gran holgura, dado el tamaño del modelo (del orden de cientos de MB en fp32 y menos en int8); no se detallan modelos concretos.
- Opciones de despliegue: CLI de Piper (`piper -m ... -c ...`), sherpa-onnx (CLI en C++ con binario compilado o release precompilado, y API de Python; se recomienda fijar `sherpa-onnx==1.10.46` por una regresión en la versión 2.0.1 que rompe el frontend de espeak en la API de Python). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica que la variante int8 es «más rápida» que la fp32, sin cifras.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Frecuencia | Calidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| joehope/hr_HR-f1-medium | Croata | VITS (Piper) | 22,05 kHz | media | CC BY-SA 4.0 | ONNX, ckpt |
| Otras voces Piper de `rhasspy/piper-voices` | Múltiples (incluye lenguas eslavas) | VITS (Piper) | 16-22,05 kHz según voz | baja/media/alta | MIT en su mayoría (verificar por voz) | ONNX |
| Modelos TTS multilingües de gran escala (p. ej. familia XTTS) | Multilingüe | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada. Como referencia estructural, las voces oficiales de Piper comparten la misma arquitectura VITS y el mismo flujo de despliegue, por lo que este modelo es intercambiable con ellas a nivel de herramienta; la diferencia principal es la cobertura del croata y la licencia CC BY-SA 4.0, más restrictiva que la MIT habitual de las voces Piper oficiales.

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite cambiar de voz ni de estilo sin reentrenar.
- Calidad media declarada por el autor; no apta para producciones que exijan voces de alta fidelidad sin evaluar previamente la calidad percibida.
- Entrenado sobre un corpus de habla croata de un único hablante; puede heredar sesgos de pronunciación, registro o variedad dialectal de ese hablante. No se documentan sesgos específicos.
- Riesgo de errores de pronunciación en palabras extranjeras, siglas, números o nombres propios, ya que la fonemización depende de espeak-ng con la voz `hr`; no se documenta un lexicon específico.
- Solo croata: no se documenta soporte de otros idiomas ni code-switching.
- Licencia CC BY-SA 4.0: el uso comercial es posible, pero cualquier obra derivada debe distribuirse bajo la misma licencia (share-alike) y con atribución. El autor pide expresamente tratar los pesos como sujetos a CC BY-SA 4.0 y arrastrar el aviso en cualquier redistribución.
- El checkpoint incluido no permite reanudar un entrenamiento exacto (sin estado del optimizador); solo sirve para *warmstart*.
- Advertencia de despliegue con sherpa-onnx: la versión 2.0.1 de PyPI falla silenciosamente al inicializar espeak en la API de Python (devuelve cero muestras sin error en carga); hay que fijar `sherpa-onnx==1.10.46`. Además, `espeak-ng-data` debe proceder de un tarball de release de sherpa-onnx, no del sistema ni de Piper, y la API de Python requiere pasar `lexicon=""` explícitamente.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad (MOS) ni de latencia que permita comparar con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joehope/hr_HR-f1-medium
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset de checkpoints de Piper: https://huggingface.co/datasets/rhasspy/piper-checkpoints
- Release de sherpa-onnx con `espeak-ng-data` de referencia: https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-lessac-medium.tar.bz2
