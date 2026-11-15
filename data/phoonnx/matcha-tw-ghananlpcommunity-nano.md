# Phoonnx/matcha-tw-ghananlpcommunity-nano

## Resumen

matcha-tw-ghananlpcommunity-nano es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por GhanaNLP y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta especializado en la lengua twi (codigo ISO `tw`), una lengua kwa hablada principalmente en Ghana, y constituye una de las pocas opciones de TTS neuronal disponibles para este idioma.

El modelo procede del proyecto upstream ghananlpcommunity/nano-twi y ha sido adaptado para el ecosistema phoonnx, que permite su integracion tanto en Python como en el asistente de voz OVOS. Matcha-TTS es una arquitectura de sintesis neuronal basada en modelos de difusion condicionados por texto, conocida por generar audio de alta calidad con un coste computacional moderado en comparacion con otros sistemas de difusion.

La relevancia de este modelo radica en su caracter de recurso de baja resource para una lengua de bajos recursos: con un repositorio de apenas 0,1 GB, ofrece una via practica para dotar de voz sintetica a aplicaciones en twi, un idioma con escasa representacion en el ecosistema TTS open source. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (sintesis neuronal basada en difusion condicionada por texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | twi (`tw`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de sintesis de voz neuronal que combina un encoder de texto con un decoder generativo basado en modelos de difusion (flow matching). El modelo genera espectrogramas mel a partir de fonemas de entrada y posteriormente un vocoder los convierte en forma de onda de audio. Esta aproximacion permite obtener calidad de audio competitiva con un numero reducido de pasos de inferencia en comparacion con los modelos de difusion tradicionales.

El modelo deriva del proyecto ghananlpcommunity/nano-twi, desarrollado por GhanaNLP. No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de horas de audio utilizadas ni sobre si se aplicaron tecnicas de ajuste fino con RLHF o preferencias humanas. El front-end de texto utiliza fonemizacion mediante espeak-ng en alfabeto IPA, lo que implica que la calidad de la sintesis depende de la correcta fonemizacion del twi por parte de espeak-ng. El modelo se distribuye en formato ONNX, lo que facilita su despliegue en entornos sin GPU y su integracion en aplicaciones de produccion.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en twi.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion de entrada basada en espeak-ng con alfabeto IPA.
- Integracion con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python a traves de `TTSModelManager`.
- Ejecucion en formato ONNX, apta para entornos CPU y despliegues ligeros.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modos de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- **Lectura de contenido en twi para aplicaciones moviles**: el modelo permite convertir articulos, noticias o mensajes en audio para usuarios ghaneses, aprovechando su tamano reducido (0,1 GB) para despliegues en dispositivos con recursos limitados.
- **Asistentes de voz en OVOS**: mediante el plugin `ovos-tts-plugin-phoonnx` y la configuracion en `mycroft.conf`, se puede dotar a un asistente domotico de una voz en twi para interacciones en lengua local.
- **Accesibilidad para personas con discapacidad visual**: integracion en lectores de pantalla o aplicaciones de lectura asistida para hablantes de twi, un idioma con escasa cobertura en soluciones TTS comerciales.
- **Sistemas de anuncios publicos automatizados**: generacion de avisos de voz en twi para estaciones de transporte, centros sanitarios o servicios municipales en Ghana, donde el twi es una lengua vehicular mayoritaria.
- **Aprendizaje de idiomas**: produccion de audio de referencia para estudiantes de twi o para hablantes de la diaspora que deseen practicar la pronunciacion.
- **Prototipado rapido de interfaces conversacionales**: gracias a su formato ONNX y a la API de phoonnx, permite incorporar sintesis en twi en demos y pruebas de concepto sin infraestructura GPU dedicada.
- **Investigacion en TTS para lenguas de bajos recursos**: sirve como linea base reproducible y de licencia permisiva para comparar con otros sistemas de sintesis en lenguas kwa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y el formato ONNX, es previsible que la inferencia funcione en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; el modelo no requiere GPU para su funcionamiento segun el diseno de phoonnx en ONNX.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano del modelo, aunque no se dispone de datos confirmados.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos TTS comparables para el idioma twi en la documentacion proporcionada. Se indica "no disponible".

| Modelo | Idioma | Arquitectura | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| matcha-tw-ghananlpcommunity-nano | twi | Matcha-TTS | MIT | ONNX | 0,1 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta twi (`tw`); no es multilingue.
- La calidad de sintesis depende de la fonemizacion de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la model card.
- Requiere la instalacion de espeak-ng (o del extra `phoonnx[espeak]`) para el front-end de texto.
- No se dispone de informacion sobre sesgos, calidad en distintos registros del twi ni robustez ante texto ruidoso o fuera de dominio.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede producirse una sintesis incorrecta o ininteligible ante entradas mal fonemizadas.
- No se han publicado evaluaciones objetivas (MOS, WER, etc.) que permitan valorar la calidad del audio.
- El modelo esta en fase temprana de publicacion (creado en noviembre de 2026 segun los metadatos) y cuenta con muy pocas descargas (27) y ningun like, lo que sugiere poca validacion por parte de la comunidad.
- La licencia MIT permite uso comercial, pero debe verificarse la procedencia de los datos de entrenamiento del modelo upstream ghananlpcommunity/nano-twi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-tw-ghananlpcommunity-nano
- Modelo upstream: https://huggingface.co/ghananlpcommunity/nano-twi
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
