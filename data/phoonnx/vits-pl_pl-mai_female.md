# Phoonnx/vits-pl_pl-mai_female

## Resumen

vits-pl_pl-mai_female es un modelo de sintesis de voz (text-to-speech) en polaco, originalmente entrenado por Coqui con la arquitectura VITS y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en polaco (pl-PL) en audio inteligible y esta pensado para integrarse en asistentes de voz, aplicaciones de lectura en voz alta y sistemas de interaccion por voz en ese idioma. Su origen es el paquete oficial `tts_models--pl--mai_female--vits` publicado por Coqui en la release v0.8.0 de su toolkit TTS.

La relevancia de esta ficha es doble: por un lado, cubre un idioma con poca oferta de TTS open source de calidad (polaco); por otro, su empaquetado como ONNX elimina la dependencia del stack original de Coqui (PyTorch + TTS) y permite desplegarlo en entornos ligeros, incluidos asistentes como OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace manejable en dispositivos de bajos recursos.

Se trata de un modelo acustico de sintesis end-to-end con una voz femenina concreta (mai_female), sin capacidades de clonacion ni control de estilo. No es un modelo de lenguaje: no razona, no genera codigo ni mantiene conversaciones; su unica funcion es la conversion de texto a audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es texto, no una secuencia de contexto) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. El resultado es un modelo que genera audio directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue. En este caso, el modelo se distribuye como grafo ONNX, de modo que la inferencia no requiere PyTorch.

El entrenamiento original fue realizado por Coqui y publicado en la release v0.8.0 de su toolkit TTS. La model card indica que el dataset de origen es M-AILABS (segun la tabla de licencias del propio Coqui), aunque no se detallan el numero de horas, la composicion exacta ni si hubo etapas de ajuste fino adicionales. No se documentan innovaciones tecnicas propias de este empaquetado mas alla de la conversion a ONNX y de la integracion del front-end de texto mediante `scriptconv`, que normaliza el texto y lo convierte en la entrada del modelo usando `GraphemePhonemizer` (fonemizacion a nivel de grafema).

## Capacidades

- Sintesis de voz en polaco (pl-PL) a partir de texto plano, con una unica voz femenina (mai_female).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Normalizacion y conversion de texto de entrada mediante `scriptconv` (fonemizacion por grafemas).
- Integracion con asistentes OVOS a traves del plugin `ovos-tts-plugin-phoonnx` y configuracion en `mycroft.conf`.
- Ejecucion en Python sin dependencia de PyTorch, gracias al formato ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No soporta clonacion de voz, control de emocion ni cambios de estilo o velocidad documentados.

## Casos de uso

- Lectura en voz alta de articulos y documentos en polaco: el modelo recibe el texto y genera un WAV con la voz femenina; es adecuado para aplicaciones de accesibilidad y para convertir boletines o noticias en audio.
- Asistentes de voz domoticos en OVOS: mediante `ovos-tts-plugin-phoonnx` se selecciona la voz `coqui/pl-mai_female-vits` en `mycroft.conf`, lo que permite respuestas habladas en polaco en un asistente local.
- Audiolibros y podcasts generados automaticamente: al ser un modelo ligero (repo de 0,1 GB) y ONNX, se puede ejecutar en servidores modestos para sintetizar grandes volumenes de texto por lotes.
- Sistemas de navegacion o avisos por voz en polaco: la inferencia ONNX permite desplegarlo en dispositivos embebidos o de bajos recursos para mensajes cortos y repetitivos.
- Prototipado de interfaces conversacionales en polaco: sirve para validar flujos de voz en fases tempranas sin depender de servicios cloud de TTS.
- Pruebas de integracion en pipelines de CI: al no requerir PyTorch ni GPU dedicada, se puede incluir en tests automatizados que verifiquen la generacion de audio en cada build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo TTS pequeno empaquetado en ONNX (repo de 0,1 GB), es probable que la inferencia en CPU sea viable, pero no se documentan cifras.
- GPU recomendadas: no disponible; no se especifican modelos de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX permite ejecucion en CPU y potencialmente en GPU mediante runtime ONNX, pero no hay datos concretos.
- Opciones de despliegue: libreria `phoonnx` (Python, con `TTSModelManager`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y runtime ONNX subyacente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-pl_pl-mai_female (este) | VITS | pl-PL | BSD-3-Clause | ONNX | Voz femenina unica; empaquetado para phoonnx |
| Coqui TTS pl-mai_female (upstream) | VITS | pl-PL | BSD-3-Clause | PyTorch (checkpoint TTS) | Mismo modelo original; requiere stack Coqui TTS |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | segun modelo | ONNX | Misma libreria y flujo de uso; idiomas y voces distintos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo de estos modelos; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con el dataset M-AILABS, puede heredar sesgos de registro y de hablantes de ese corpus.
- Riesgo de alucinacion: en TTS se traduce en pronunciaciones erroneas, prosodia incorrecta o artefactos en palabras fuera del vocabulario o en texto no normalizado; no hay evaluacion publicada al respecto.
- Limitaciones de contexto o idioma: solo soporta polaco (pl-PL); el texto en otros idiomas o con caracteres no contemplados por el fonemizador por grafemas puede producir resultados deficientes.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y sin endoso; conviene conservar el aviso de copyright y revisar la licencia del dataset M-AILABS para usos derivados.
- Caveats para produccion: una sola voz y sin control de estilo, emocion o velocidad; no hay garantias de calidad en textos largos sin puntuacion adecuada; el front-end depende de `scriptconv` y de su fonemizador por grafemas, lo que limita la precision linguistica frente a fonemizadores basados en diccionario.
- El modelo no es un LLM: no debe esperarse razonamiento, dialogo ni generacion de codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-mai_female
- Upstream (Coqui TTS v0.8.0, pl-mai_female-vits): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--pl--mai_female--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
