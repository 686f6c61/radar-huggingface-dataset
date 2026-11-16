# Phoonnx/vits-ln-openbible-graphemes

## Resumen

vits-ln-openbible-graphemes es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta especializado en el idioma lingala (`ln`), una lengua bantu hablada principalmente en la Republica Democratica del Congo y la Republica del Congo, y fue entrenado sobre el corpus OpenBible.

El modelo resuelve la generacion de audio hablado a partir de texto en lingala mediante una entrada basada en grafemas: el texto se normaliza y se convierte directamente en caracteres, sin necesidad de un fonemizador especifico del idioma. Esto lo hace especialmente util para lenguas de bajos recursos, donde los recursos foneticos son escasos.

Es relevante por su caracter practico: ofrece una via lista para produccion (via ONNX y el plugin de OVOS) para incorporar sintesis de voz en lingala en asistentes de voz y aplicaciones de accesibilidad, un idioma practicamente ausente en los sistemas TTS comerciales. El repositorio ocupa aproximadamente 0,1 GB y la licencia es CC-BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | lingala (`ln`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |
| Entrada de texto | grafemas (caracteres del texto) |
| Front-end de texto | `GraphemePhonemizer` de scriptconv |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema de sintesis neuronal end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS es conocida por producir audio de calidad natural sin necesidad de un vocoder externo en cascada, y por su inferencia rapida en comparacion con pipelines de dos etapas.

El entrenamiento se realizo sobre el corpus OpenBible en lingala, segun indica la model card y la lista de modelos de Coqui TTS (version 0.6.2). No se dispone de informacion publicada sobre el numero de horas de audio, el numero de tokens, la composicion exacta del dataset ni sobre el uso de tecnicas de alineamiento o fine-tuning adicionales. La entrada es puramente basada en grafemas: no se usa un lexico fonetico especifico del lingala, lo que simplifica el despliegue pero puede limitar la precision de pronunciacion en palabras con ortografia ambigua.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en lingala, con salida en formato WAV.
- Entrada basada en grafemas: acepta directamente caracteres del texto, sin requerir transcripcion fonetica manual.
- Normalizacion y conversion de texto mediante la libreria scriptconv antes de la sintesis.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python a traves de `TTSModelManager` de phoonnx, con carga de voces por identificador (`coqui/lin-openbible-vits`).
- No soporta tool calling, agentes, vision, audio de entrada ni modos de razonamiento: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al lingala; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz en lingala: integracion en OVOS mediante `ovos-tts-plugin-phoonnx` para que un asistente domestico responda en lingala, aprovechando la configuracion de voz en `mycroft.conf`.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos, noticias o documentos en lingala en aplicaciones de lectores de pantalla.
- Locucion automatizada de contenidos educativos: generacion de audio para materiales de aprendizaje en lingala, donde la oferta comercial de voces es practicamente inexistente.
- Sistemas de megafonia y avisos publicos: sintesis de anuncios en lingala para transporte, sanidad o servicios municipales en regiones donde se habla el idioma.
- Preservacion linguistica: produccion de audio de referencia para documentacion y ensenanza del lingala, dado el caracter de bajos recursos del idioma.
- Prototipado rapido de aplicaciones de voz: el formato ONNX y el tamano reducido del repositorio (~0,1 GB) permiten desplegar el modelo en entornos con recursos limitados y sin GPU dedicada, si bien no se publican cifras de latencia.
- Integracion en pipelines de contenido multimedia: generacion por lotes de narraciones en lingala para videos, audiolibros o podcasts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (~0,1 GB) se trata de un modelo ligero que previsiblemente puede ejecutarse en CPU, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX sugiere viabilidad en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python y OVOS) como via principal; al ser pesos ONNX, tecnicamente puede ejecutarse con runtime ONNX, aunque no se documenta soporte oficial de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-ln-openbible-graphemes (este) | VITS | Lingala (`ln`) | ONNX (phoonnx) | CC-BY-SA 4.0 | Entrada por grafemas, empaquetado para OVOS |
| Otros modelos VITS de la coleccion Phoonnx | VITS | Varios idiomas | ONNX (phoonnx) | Segun modelo | Misma tuberia de despliegue, distinto idioma |
| Modelos TTS comerciales multilingues | No disponible | Multiples | No disponible | Propietaria | Cobertura de lingala no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos especificos para lingala en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma (lingala); no es un modelo multilingue.
- Entrada basada en grafemas sin lexico fonetico: puede producir pronunciaciones imprecisas en palabras con ortografia ambigua o prestamos.
- Riesgo de artefactos y prosodia poco natural en textos fuera del dominio del corpus de entrenamiento (OpenBible), especialmente en registros coloquiales o tecnicos.
- No se documentan evaluaciones de calidad (MOS) ni de inteligibilidad, por lo que la calidad real no esta cuantificada.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- El modelo depende de las librerias phoonnx y scriptconv; cambios en estas dependencias pueden afectar al funcionamiento.
- No apto para tareas de razonamiento, generacion de texto, codigo o vision.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus biblico puede presentar un sesgo de dominio y de estilo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ln-openbible-graphemes
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Modelo original de Coqui TTS (v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--lin--openbible--vits.zip
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
