# Phoonnx/vits-sk_sk-cv-graphemes

## Resumen

vits-sk_sk-cv-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo está especializado en eslovaco (sk-SK) y se distribuye como un artefacto ligero de aproximadamente 0,1 GB, pensado para inferencia local y despliegue en entornos de asistente de voz como OVOS.

El modelo resuelve el problema de la conversión de texto a voz en eslovaco utilizando una entrada basada en grafemas (caracteres del texto) en lugar de fonemas, lo que simplifica el front-end de texto. Al estar empaquetado como ONNX, elimina la dependencia del framework original de Coqui TTS y permite su ejecución en Python mediante phoonnx, así como su integración como plugin de TTS en OVOS.

Su relevancia actual radica en que ofrece una opción de TTS ligera, con licencia permisiva BSD-3-Clause y para un idioma con cobertura limitada en el ecosistema open source, lo que lo hace adecuado para aplicaciones de voz en eslovaco que requieran despliegue en local sin infraestructura pesada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | eslovaco (sk-SK) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional y un decodificador basado en flujos normalizadores y un generador acústico, entrenado con aprendizaje adversario. VITS produce audio de forma directa a partir del texto sin necesidad de un vocoder separado.

El modelo original procede de la release v0.8.0 de Coqui TTS, bajo el identificador `tts_models--sk--cv--vits`, y fue entrenado con el corpus Common Voice en eslovaco. La entrada de texto se realiza a nivel de grafemas mediante el `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en eslovaco (sk-SK) a partir de texto.
- Entrada basada en grafemas: acepta caracteres del texto y los normaliza mediante scriptconv.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución mediante ONNX, sin dependencia del framework original de Coqui TTS.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en eslovaco: el modelo puede integrarse en OVOS como módulo TTS para convertir las respuestas del asistente en audio, seleccionándolo en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`.
- Lectura de contenido en aplicaciones eslovacas: síntesis de artículos, notificaciones o mensajes en voz alta en aplicaciones de escritorio o móviles que requieran TTS local en eslovaco.
- Sistemas de accesibilidad: conversión de texto a voz para personas con discapacidad visual en entornos de habla eslovaca, aprovechando la inferencia local sin conexión.
- Automatización de anuncios y avisos: generación de avisos pregrabados o dinámicos en eslovaco para sistemas de megafonía, kioscos o interfaces de voz.
- Prototipado de interfaces conversacionales: uso del modelo como componente TTS en pipelines de voz para pruebas de concepto en eslovaco, gracias a su tamaño reducido (0,1 GB) y despliegue sencillo.
- Integración en dispositivos embebidos o de bajos recursos: al ejecutarse como ONNX con un peso ligero, puede desplegarse en entornos con recursos limitados donde no es viable un modelo TTS de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero que probablemente cabe en GPU de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido del artefacto sugiere que podría ejecutarse en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; ejecución mediante ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| vits-sk_sk-cv-graphemes | VITS (Coqui) | sk-SK | BSD-3-Clause | ONNX | ~0,1 GB |
| Otros modelos VITS de la colección Phoonnx | VITS (Coqui) | varios | según modelo | ONNX | no disponible |
| Modelos TTS de Coqui TTS originales | VITS / otros | varios | según modelo | PyTorch | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos específicos para eslovaco en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado únicamente en eslovaco (sk-SK); no soporta otros idiomas.
- Al ser un modelo TTS, no realiza razonamiento, generación de texto ni tareas de lenguaje; su uso está restringido a síntesis de voz.
- No se dispone de información sobre sesgos del corpus Common Voice utilizado en el entrenamiento ni sobre la calidad de la voz generada.
- Riesgo de alucinación no aplica en el sentido habitual, pero la calidad de la síntesis puede degradarse con texto fuera de dominio, abreviaturas o caracteres no contemplados por el normalizador de scriptconv.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar los términos del corpus Common Voice subyacente.
- No hay datos publicados sobre latencia, throughput ni requisitos mínimos de hardware, lo que dificulta planificar un despliegue en producción.
- El modelo depende de las librerías phoonnx y scriptconv para su funcionamiento; cambios en estas dependencias podrían afectar a la integración.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-sk_sk-cv-graphemes
- Modelo original (Coqui TTS v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--sk--cv--vits.zip
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
