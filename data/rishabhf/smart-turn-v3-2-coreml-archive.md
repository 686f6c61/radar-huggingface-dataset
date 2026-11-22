# rishabhf/smart-turn-v3.2-coreml-archive

## Resumen

Smart Turn v3.2 Core ML archive es una copia de archivo, sin modificaciones, de la conversión a Core ML del modelo Smart Turn v3.2. El modelo original lo desarrolla Pipecat/Daily y resuelve una tarea muy concreta dentro de los sistemas de voz conversacionales: la detección de fin de turno (end-of-turn detection), es decir, determinar si un usuario ha terminado de hablar o si va a continuar. Se trata de un clasificador de audio que recibe una ventana de audio de 16 kHz mono y devuelve una probabilidad de que el turno haya finalizado.

La relevancia de este repositorio es fundamentalmente de trazabilidad y despliegue en el ecosistema Apple: empaqueta el modelo en formato Core ML (`smart_turn.mlmodelc`) para su uso en aplicaciones iOS y macOS, con checksums y registros de procedencia que garantizan la integridad de la conversión. No se ha reentrenado ni reconvertido nada para este espejo; es una réplica byte a byte de la conversión publicada por `aufklarer/Smart-Turn-v3.2-CoreML`, que a su vez deriva del ONNX `smart-turn-v3.2-gpu.onnx` de `pipecat-ai/smart-turn-v3`.

El modelo base es un fine-tune de `pipecat-ai/smart-turn-v3` y está pensado para integrarse en pipelines de voz en tiempo real (agentes telefónicos, asistentes de voz, transcripción en directo) donde la latencia y la precisión del cambio de turno condicionan la naturalidad de la conversación. El payload compilado ocupa 16.786.123 bytes, lo que lo hace apto para ejecución en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de audio; conversión Core ML del ONNX `smart-turn-v3.2-gpu.onnx`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de audio: 128.000 muestras a 16 kHz mono, equivalente a 8 segundos) |
| Tipos de cuantizacion | no disponible (formato Core ML compilado; no se documentan variantes de cuantización) |
| Idiomas soportados | no disponible (modelo acústico independiente del idioma declarado) |
| Licencia | BSD-2-Clause (copyright Daily); avisos MIT y Apache-2.0 de componentes Whisper en `THIRD_PARTY_NOTICES.md` |
| Formato de pesos | Core ML (`smart_turn.mlmodelc`), con `config.json`, `SHA256SUMS.json` y `PROVENANCE.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `pipecat-ai/smart-turn-v3`. Lo que sí se documenta es la interfaz de inferencia de la conversión Core ML: una única entrada `audio` de 16 kHz mono con 128.000 muestras (8 segundos) y una única salida `probability`, lo que confirma que se trata de un clasificador binario de fin de turno sobre una ventana de audio fija. Los avisos de terceros mencionan componentes relacionados con Whisper (MIT y Apache-2.0), lo que sugiere el uso de representaciones acústicas derivadas de un encoder de voz, aunque no se confirma en la información proporcionada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Este repositorio es explícitamente un archivo: no se ha reentrenado ni reconvertido nada, y no se incluyen datos de entrenamiento ni de evaluación. La innovación técnica relevante aquí es el empaquetado en Core ML para ejecución en dispositivo Apple, con verificación de integridad mediante SHA-256 y registro de procedencia que enlaza la conversión con los commits exactos del modelo origen.

## Capacidades

- Clasificación de audio para detección de fin de turno: devuelve una probabilidad de que el hablante haya terminado su turno.
- Procesamiento de ventanas de audio de 16 kHz mono de 128.000 muestras (8 segundos).
- Ejecución en dispositivo mediante Core ML, orientada a aplicaciones iOS y macOS.
- Integración en pipelines de voz en tiempo real para gestionar el cambio de turno en conversaciones.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo de pensamiento.
- No se documentan capacidades multilingües explícitas; el modelo es un clasificador acústico sin idioma declarado.
- No se documentan capacidades de audio más allá de la clasificación de turno (no es un modelo ASR ni TTS).

## Casos de uso

- Agentes de voz telefónicos: el clasificador decide si el usuario ha terminado de hablar antes de que el agente responda, evitando interrupciones prematuras en conversaciones multi-turno.
- Asistentes de voz en aplicaciones iOS/macOS: al estar en formato Core ML, se puede ejecutar en dispositivo sin enviar audio a la nube, reduciendo latencia y preservando la privacidad.
- Sistemas de transcripción en directo: segmentación de intervenciones por hablante en reuniones o subtitulado, marcando los límites de turno con la probabilidad de salida.
- Atención al cliente automatizada: gestión del barge-in y de las pausas naturales del habla para que el bot no responda durante una pausa de duda del usuario.
- Voicebots embebidos en hardware: el payload de 16,8 MB permite integrarlo en dispositivos con recursos limitados que ejecutan Core ML.
- Investigación en interacción voz-máquina: evaluación de políticas de cambio de turno y experimentación con umbrales de probabilidad sobre la salida del modelo.
- Pipelines de voz híbridos: uso como componente de decisión de turno junto a modelos ASR y TTS en arquitecturas de agentes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta mediante Core ML en el Neural Engine o la GPU/CPU del dispositivo Apple. El payload compilado ocupa 16.786.123 bytes (aproximadamente 16,8 MB), por lo que la huella de memoria es reducida.
- GPU recomendadas: no se especifican. Al ser Core ML, el hardware objetivo son los chips Apple (serie M y A) con Neural Engine; no se documenta soporte para A100, H100 o RTX 4090.
- Cabe en hardware de consumo: sí, en dispositivos Apple compatibles con Core ML; no se documenta su uso en GPU de consumo tipo RTX.
- Opciones de despliegue: Core ML (`smart_turn.mlmodelc`) en aplicaciones iOS/macOS. No se documenta despliegue con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rishabhf/smart-turn-v3.2-coreml-archive | Detección de fin de turno | Core ML | 128.000 muestras de audio (8 s a 16 kHz) | BSD-2-Clause | Hugging Face (archivo) |
| pipecat-ai/smart-turn-v3 | Detección de fin de turno | no disponible (incluye ONNX) | no disponible | no disponible en la información | Hugging Face |
| aufklarer/Smart-Turn-v3.2-CoreML | Detección de fin de turno | Core ML | 128.000 muestras de audio | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un archivo, no un modelo nuevo: no se ha reentrenado ni reconvertido, por lo que hereda cualquier limitación del modelo base `pipecat-ai/smart-turn-v3`.
- Entrada de audio fija: 128.000 muestras a 16 kHz mono; no se documenta manejo de otras frecuencias de muestreo ni de ventanas de distinta duración.
- Salida limitada a una probabilidad de fin de turno; no genera texto ni transcribe audio.
- No se documentan sesgos conocidos, pero al ser un clasificador acústico puede verse afectado por acentos, ruido de fondo y estilos de habla no representados en sus datos de entrenamiento (no disponibles).
- Riesgo de falsos positivos y negativos en la detección de turno según el umbral elegido; la calibración del umbral corre a cargo del integrador.
- La licencia BSD-2-Clause permite uso comercial con atribución y conservación del aviso de copyright; deben respetarse además los avisos MIT y Apache-2.0 de componentes de terceros recogidos en `THIRD_PARTY_NOTICES.md`.
- No se incluyen datos de entrenamiento ni de evaluación en el repositorio, lo que limita la auditoría del comportamiento del modelo.
- No se implica el respaldo de Pipecat, Daily, OpenAI, el conversor ni los contribuyentes de datos originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rishabhf/smart-turn-v3.2-coreml-archive
- Modelo base: https://huggingface.co/pipecat-ai/smart-turn-v3
- Conversión Core ML de origen: https://huggingface.co/aufklarer/Smart-Turn-v3.2-CoreML/tree/75f069717f500947195fa1945c46ddb472559cff
- Commit del modelo base referenciado: https://huggingface.co/pipecat-ai/smart-turn-v3/tree/f766f81d3cfdf7737ac64aad813d91bbfd56bf93
- Checksums: https://huggingface.co/rishabhf/smart-turn-v3.2-coreml-archive/blob/main/SHA256SUMS.json
- Registro de procedencia: https://huggingface.co/rishabhf/smart-turn-v3.2-coreml-archive/blob/main/PROVENANCE.json
- Model card original preservada: https://huggingface.co/rishabhf/smart-turn-v3.2-coreml-archive/blob/main/UPSTREAM_README.md
- Avisos de terceros: https://huggingface.co/rishabhf/smart-turn-v3.2-coreml-archive/blob/main/THIRD_PARTY_NOTICES.md
- Licencia: https://huggingface.co/rishabhf/smart-turn-v3.2-coreml-archive/blob/main/LICENSE
