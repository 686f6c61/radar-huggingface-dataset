# openthaigpt/OpenThai2.0-ASR-Streaming_GGUF

## Resumen

OpenThai2.0-ASR-Streaming_GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla (ASR) en tailandés `iapp/OpenThai2.0-ASR-Streaming`, desarrollado por iApp Technology y distribuido a través de la organización OpenThaiGPT. Se trata de un ajuste fino sobre NVIDIA Nemotron 3.5 ASR Streaming 0.6B, un modelo de arquitectura FastConformer con decodificador Transducer (RNN-T) orientado a transcripción en streaming de baja latencia. Con 640 millones de parámetros, está diseñado específicamente para dictado local en tiempo real en tailandés.

El problema que resuelve es concreto: permitir dictado por voz en tailandés completamente offline en el ordenador del usuario, sin enviar audio a la nube. Los ficheros GGUF están pensados para ejecutarse sobre transcribe.cpp, el motor de inferencia que alimenta aplicaciones de dictado como Handy y Hex, ambas de código abierto y licencia MIT. Esto lo convierte en una pieza práctica para usuarios que necesitan privacidad o que trabajan sin conexión.

La relevancia actual radica en que el tailandés es un idioma con relativamente pocos modelos ASR abiertos de calidad, y menos aún con capacidad de streaming y empaquetado para ejecución local en hardware de consumo. El modelo base es un fine-tune de un modelo NVIDIA reciente, lo que aporta una arquitectura moderna (FastConformer + Transducer) a un ecosistema lingüístico poco cubierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador Transducer (RNN-T), basada en NVIDIA Nemotron 3.5 ASR Streaming 0.6B |
| Parametros totales | 640.427.149 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming, ventana no especificada en la información) |
| Tipos de cuantizacion | F32 (32-bit float), Q8_0 (8-bit) |
| Idiomas soportados | tailandés (th, th-TH); el prompt `th-mix` del modelo original no está expuesto |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (también existe el `.nemo` original en el repo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer (una variante de Conformer con atención por bloques optimizada para velocidad) combinada con un decodificador Transducer RNN-T, el mismo esquema que NVIDIA emplea en su familia Nemotron ASR Streaming. Esta combinación está pensada para transcripción incremental: el modelo consume audio por fragmentos y emite tokens de forma continua, lo que habilita interfaces de dictado en vivo con latencia reducida. El modelo original es un fine-tune en tailandés del checkpoint NVIDIA Nemotron 3.5 ASR Streaming 0.6B.

Los detalles sobre volumen de datos de entrenamiento, composición del corpus tailandés y si hubo etapas de RLHF o DPO no están disponibles en la información proporcionada. Sí se documenta un aspecto técnico relevante: el modelo original incluye un sesgo de token en blanco (blank-token bias) de −1.0 almacenado en los pesos, y las cifras de precisión de la model card original se calculan con ese valor. La conversión a GGUF se realizó con `scripts/convert-parakeet.py` de transcribe.cpp (commit `275cd50`), añadiendo un perfil específico `openthai2.0-asr-streaming` con vocabulario de 14.988 tokens y corrigiendo el tratamiento de una lista `decoding.durations: []` vacía como RNN-T plano. La cuantización Q8_0 se generó con `transcribe-quantize --quant Q8_0`, cuantizando 275 tensores y copiando 378 sin cambios.

## Capacidades

- Reconocimiento automático del habla en tailandés con salida en escritura tailandesa.
- Transcripción en streaming, adecuada para dictado en tiempo real pulsando y soltando un atajo de teclado.
- Selección de idioma mediante códigos `th` y `th-TH`; sin código o con `auto` también se selecciona `th-TH`.
- Integración con aplicaciones de dictado de escritorio (Handy, Hex) que pegan el texto en la aplicación activa.
- Funcionamiento completamente offline tras la instalación, sin envío de audio a la nube.
- Ejecución sobre transcribe.cpp, lo que permite su uso en macOS, Windows y Linux.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR puro, no un LLM.
- No dispone de capacidades de visión, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Dictado en aplicaciones de mensajería: con Handy o Hex cargados con el fichero Q8_0, el usuario mantiene pulsado un atajo, habla en tailandés y el texto se pega directamente en LINE, correo o chat, sin salir de la aplicación.
- Redacción de correos y documentos largos: el modelo transcribe en streaming frases completas en Word o Google Docs, útil para quienes escriben tailandés con teclado de forma lenta o incómoda.
- Notas personales y borradores offline: al ejecutarse localmente y sin conexión, permite tomar notas por voz en entornos sin red o con requisitos de privacidad estrictos.
- Transcripción de grabaciones de reuniones: Hex ofrece el comando `hex transcribe meeting.m4a`, que convierte un fichero de audio en texto usando este modelo, adecuado para actas y resúmenes posteriores.
- Accesibilidad para usuarios con dificultades motoras: el dictado por voz en cualquier aplicación con cursor reduce la dependencia del teclado en tailandés.
- Integración en herramientas propias: al ser GGUF y ejecutarse sobre transcribe.cpp, un desarrollador puede incorporar el modelo en su propia aplicación de dictado o pipeline de transcripción local sin depender de servicios externos.
- Asistentes de IA por voz: el texto transcrito puede enviarse a un asistente conversacional, de modo que el usuario hable en tailandés y reciba respuestas, con el ASR ejecutándose en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MMLU ni otras métricas en la información proporcionada, y no se deben inferir valores no documentados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los ficheros, el Q8_0 ocupa 754 MB en disco y el F32 2,56 GB, por lo que la huella en memoria es del orden de esas cifras más el overhead del runtime.
- GPU recomendadas: no especificadas en la información; al ser un modelo de 640 M de parámetros, es previsible que funcione en CPU y en GPU de consumo, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: probable por tamaño, aunque no confirmada en la model card; el uso previsto en Handy y Hex sugiere ejecución en ordenadores personales.
- Opciones de despliegue: transcribe.cpp (motor principal), y a través de él las aplicaciones Handy y Hex en macOS, Windows y Linux.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OpenThai2.0-ASR-Streaming_GGUF | 640 M | no disponible | tailandés | OpenMDW 1.1 | GGUF | Fine-tune tailandés de Nemotron 3.5 ASR Streaming 0.6B; streaming local |
| NVIDIA Nemotron 3.5 ASR Streaming 0.6B | ~600 M | no disponible | multilingüe (según modelo base) | no disponible en esta ficha | no disponible | Modelo base sobre el que se construye el fine-tune tailandés |
| iapp/OpenThai2.0-ASR-Streaming | 640 M | no disponible | tailandés | OpenMDW 1.1 | `.nemo` | Modelo original sin cuantizar; misma arquitectura y pesos |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo reconoce tailandés: el prompt `th-mix` del modelo original (palabras inglesas en alfabeto latino) no está expuesto en los ficheros GGUF, por lo que el texto mixto tailandés-inglés puede transcribirse de forma deficiente.
- Es un modelo ASR, no un LLM: no genera respuestas, no razona y no soporta herramientas; cualquier expectativa de chatbot o agente queda fuera de su alcance.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados o vocabulario técnico; no se documentan tasas de error (WER) en la información disponible.
- La licencia OpenMDW 1.1 es distinta de las licencias permisivas habituales (MIT, Apache 2.0); conviene revisar sus términos antes de uso comercial o redistribución.
- El modelo base es un fine-tune de un modelo NVIDIA, por lo que pueden aplicar restricciones derivadas de la licencia del modelo original, no detalladas en la información proporcionada.
- El sesgo de token en blanco de −1.0 está embebido en los pesos; usar los ficheros con otros runtimes que añadan su propio sesgo puede alterar los resultados.
- Los ficheros están pensados para transcribe.cpp y las aplicaciones Handy y Hex; su uso en otros motores (por ejemplo, llama.cpp) no está garantizado.
- No hay información sobre sesgos demográficos o dialectales del corpus de entrenamiento tailandés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openthaigpt/OpenThai2.0-ASR-Streaming_GGUF
- Modelo base: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming
- Modelo NVIDIA de origen: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicación Handy: https://github.com/cjpais/Handy
- Web de Handy: https://handy.computer
- Aplicación Hex: https://github.com/anomalyco/hex
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
