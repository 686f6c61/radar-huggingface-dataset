# ibm-granite/granite-speech-5.0-2b-ONNX

## Resumen

Granite-Speech-5.0-2B ONNX es la versión de pesos cuantizados en formato ONNX del modelo de reconocimiento automático de habla (ASR) granite-speech-5.0-2b, desarrollado por el equipo IBM Granite. Su propósito es permitir la inferencia directamente en el navegador mediante Transformers.js y WebGPU, sin necesidad de servidor ni de enviar audio a APIs externas, lo que resulta relevante para aplicaciones que exigen privacidad o funcionamiento sin conexión.

El modelo base combina un codificador de audio (basado en convoluciones y un Q-Former) con un decodificador de lenguaje de la familia Granite de unos 2 mil millones de parámetros, y soporta transcripción en seis idiomas: inglés, francés, alemán, español, portugués y japonés. La versión 5.0 introduce escalado YaRN en las codificaciones posicionales rotatorias del modelo de lenguaje, ampliando la ventana a 16384 posiciones.

Este repositorio en concreto contiene los pesos cuantizados a 4 bits (con activaciones fp16/fp32 según el componente), con un tamaño total aproximado de 1,7 GB, lo que lo hace ejecutable en GPUs de consumo a través de WebGPU. IBM proporciona además una demo interactiva (granite-speech-webgpu) que utiliza exactamente estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio con convoluciones depthwise + Q-Former + decodificador de lenguaje Granite (transformer) |
| Parametros totales | ~2B (modelo base granite-speech-5.0-2b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16384 posiciones (con escalado YaRN, factor 4) |
| Tipos de cuantizacion | 4 bits (block size 32, asimetrica, MatMulNBits / GatherBlockQuantized); audio encoder q4 + fp32, embed_tokens q4f16, decoder q4f16 con KV cache |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, japones |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuantizado a 4 bits) |

## Arquitectura y entrenamiento

La arquitectura es identica a la de granite-speech-4.1-2b, con una novedad clave: las codificaciones posicionales rotatorias (RoPE) del modelo de lenguaje emplean escalado YaRN con factor 4, extendiendo el contexto hasta 16384 posiciones. El pipeline sigue el esquema clasico de los modelos speech-to-text de estilo LLM: un codificador de audio extrae caracteristicas del senal de 16 kHz mono, un Q-Former comprime la representacion en un numero reducido de tokens de audio, y el decodificador de lenguaje genera la transcripcion condicionada a esos tokens mediante plantillas de chat con el token especial `<|audio|>`.

Sobre el proceso de conversion a ONNX, el autor documenta que se reutilizaron los grafos computacionales de onnx-community/granite-speech-4.1-2b-ONNX rederivando todos los pesos desde el checkpoint 5.0: copias directas de pesos, plegado de BatchNorm en las convoluciones depthwise del codificador, plegado constante de la autoatencion de queries del Q-Former, y regeneracion de las caches de cos/sin rotatorias del decodificador respetando el escalado YaRN. Los detalles de datos de entrenamiento, numero de tokens o uso de RLHF/DPO del modelo base no estan disponibles en la informacion proporcionada; deben consultarse en la model card del modelo base.

## Capacidades

- Transcripcion automatica de habla (ASR) en seis idiomas: ingles, frances, aleman, espanol, portugues y japones.
- Transcripcion con puntuacion y capitalizacion correctas mediante prompts en lenguaje natural (por ejemplo, "transcribe the speech with proper punctuation and capitalization").
- Inferencia completamente en el navegador con Transformers.js >= 4.3 sobre WebGPU, sin backend remoto.
- Interfaz de plantilla de chat, lo que permite parametrizar la tarea de transcripcion mediante instrucciones en texto.
- Acepta audio como Float32Array a 16 kHz mono.
- Otras tareas soportadas por el modelo base (traduccion de habla, etc.) no detalladas en esta ficha: consultar la model card del modelo base.

## Casos de uso

- Transcripcion privada en el navegador: al ejecutarse localmente con WebGPU, el audio del usuario nunca sale del dispositivo, ideal para dictado medico, legal o corporativo donde la privacidad es critica.
- Extensiones de navegador de dictado: el tamano reducido (1,7 GB) y el formato ONNX permiten integrar el modelo en extensiones que transcriben notas de voz o correos dictados sin servidor.
- Aplicaciones offline (PWA): al no depender de conexion, es adecuado para apps de notas de voz que deben funcionar sin red.
- Subtitulado rapido de clips multilingues: soporta seis idiomas, util para generar transcripciones preliminares de audio en espanol, ingles, frances, aleman, portugues o japones.
- Prototipado de interfaces de voz: los desarrolladores pueden probar pipelines de ASR con la demo granite-speech-webgpu sin desplegar infraestructura.
- Procesamiento por lotes en cliente: la API de Transformers.js permite transcribir multiples ficheros de audio localmente, evitando costes de API por minuto de audio.

## Benchmarks y rendimiento

Unicamente se han publicado mediciones propias de la conversion ONNX, no benchmarks estandarizados completos:

| Evaluacion | Resultado |
|---|---|
| WER en hf-internal-testing/librispeech_asr_dummy (73 utterances, ONNX CPU EP, pesos 4-bit) | 2,43% (2,31% normalizado) |
| WER de granite-speech-4.1-2b-ONNX en la misma prueba | 2,70% |
| Verificacion de conversion fp32 | Transcripciones greedy identicas a la implementacion transformers |

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la informacion disponible (y no serian aplicables a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB de pesos en 4 bits; con activaciones y KV cache, un presupuesto de 2-3 GB de VRAM es razonable (estimacion, no dato oficial).
- GPU recomendadas: cualquier GPU con soporte WebGPU; el objetivo principal son GPUs integradas y de consumo en navegador (Apple Silicon, AMD, NVIDIA y iGPUs compatibles con WebGPU).
- Consumer GPUs: si, esta diseñado explicitamente para ejecutarse en GPUs de consumo via WebGPU; no requiere A100 ni H100.
- Despliegue: Transformers.js >= 4.3 en navegador (requerido para WebGPU en Safari 26); los pesos ONNX tambien pueden ejecutarse con onnxruntime (se ha verificado con el CPU EP). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Uso en navegador |
|---|---|---|---|---|---|
| granite-speech-5.0-2b-ONNX (este) | ~2B | ONNX 4-bit | 16384 posiciones (YaRN) | Apache-2.0 | Si, Transformers.js + WebGPU |
| granite-speech-4.1-2b-ONNX | ~2B | ONNX 4-bit | no disponible | Apache-2.0 | Si, Transformers.js + WebGPU |
| Whisper (openai/whisper-large-v3) | ~1,5B | PyTorch/GGUF | 30 s por ventana (tipico) | MIT | Requiere WASM/ports, no nativo en Transformers.js de forma equivalente |

Frente a la version 4.1, la 5.0 mejora el WER en la prueba de LibriSpeech (2,43% frente a 2,70%) y amplía el contexto con YaRN. Frente a Whisper, Granite-Speech ofrece una interfaz de instrucciones en lenguaje natural y contexto extendido, aunque Whisper tiene un ecosistema de despliegue mas maduro.

## Limitaciones y advertencias

- Los logits del decodificador ONNX son 1/8 de los de la implementacion transformers; no afecta al decodificado greedy, pero podria afectar a estrategias de muestreo con temperatura.
- La cuantizacion a 4 bits puede degradar ligeramente la calidad respecto al modelo base en fp16, aunque la verificacion en LibriSpeech dummy muestra un WER competitivo.
- El audio de entrada debe ser mono a 16 kHz en Float32Array; el preprocesado corre a cargo del usuario o del processor.
- Transformers.js 4.3 o superior es necesario para WebGPU en Safari 26.
- La cobertura de idiomas se limita a seis lenguas; el rendimiento en acentos, ruido de fondo o dominios especificos no esta documentado en la informacion disponible.
- Riesgo de alucinacion tipico de modelos ASR basados en LLM (generar texto plausible no presente en el audio), no cuantificado aqui.
- La licencia Apache-2.0 permite uso comercial sin restricciones relevantes.
- Los datos de entrenamiento, sesgos del modelo base y evaluaciones completas no estan disponibles en esta model card; consultar la documentacion del modelo base.

## Enlaces

- Repositorio ONNX: https://huggingface.co/ibm-granite/granite-speech-5.0-2b-ONNX
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Demo WebGPU: https://huggingface.co/spaces/ibm-granite/granite-speech-webgpu
- Version ONNX 4.1 (grafos reutilizados): https://huggingface.co/onnx-community/granite-speech-4.1-2b-ONNX
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Dataset de verificacion: https://huggingface.co/datasets/hf-internal-testing/librispeech_asr_dummy
