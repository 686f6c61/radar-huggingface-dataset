# OpenVoiceOS/kasanoma-chichewa

# Kasanoma Chichewa (Piper, mirror)

## Resumen

Kasanoma Chichewa es una voz de sintesis de texto a voz (TTS) distribuida en formato Piper y publicada como espejo por la organizacion OpenVoiceOS. Se trata de una replica sin modificaciones de la voz Chichewa del proyecto Kasanoma, cuyo autor original es michsethowusu y cuyo objetivo es ofrecer voces sinteticas para lenguas africanas con escasa cobertura en los ecosistemas comerciales. El modelo genera audio en chichewa (tambien llamado nyanja, codigo ISO `ny`), una lengua bantu hablada principalmente en Malaui, Zambia, Mozambique y Zimbabue.

El repositorio contiene unicamente dos ficheros: `model.onnx` (63.516.050 bytes) y `model.onnx.json` (4.856 bytes), en formato Piper 1.3.0 con frecuencia de muestreo de 16 kHz. No se incluyen pesos en otros formatos, scripts de entrenamiento, corpus ni documentacion adicional, y la model card no aporta datos de arquitectura ni de parametros.

La relevancia de esta ficha es doble. Por un lado, cubre una lengua de bajos recursos con muy pocas alternativas de sintesis disponibles. Por otro, el modelo original no declara licencia: el proyecto Kasanoma afirma que sus modelos se publican bajo "licencias de codigo abierto" sin especificar cual, de modo que la evaluacion juridica es un paso obligatorio antes de cualquier uso en produccion. OpenVoiceOS mantiene este espejo para que los ficheros sigan siendo accesibles y verificables mediante hash, sin otorgar derechos que el origen no haya concedido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (fichero en formato Piper 1.3.0; el framework Piper emplea habitualmente arquitecturas de tipo VITS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de sintesis de voz, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx`, sin variantes declaradas) |
| Idiomas soportados | chichewa/nyanja (`ny`) |
| Licencia | kasanoma-unspecified-open-source (terminos no definidos) |
| Formato de pesos | ONNX (Piper 1.3.0) + JSON de configuracion |
| Frecuencia de muestreo | 16 kHz |
| Tamano de los ficheros | `model.onnx`: 63.516.050 bytes; `model.onnx.json`: 4.856 bytes |
| Tamano del repositorio | 0,1 GB |
| Tarea declarada | text-to-speech |
| Fecha de creacion / actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura, el numero de parametros ni el proceso de entrenamiento. Lo unico verificable es que los pesos estan en formato Piper 1.3.0, un formato de exportacion a ONNX que empaqueta la red neuronal de sintesis y su configuracion asociada. Piper es un framework de TTS que trabaja con modelos de tipo VITS (sintesis extremo a extremo con inferencia variacional y entrenamiento adversarial) y un decodificador neuronal de audio; no se ha confirmado en la informacion disponible que esta voz concreta siga ese esquema.

No hay datos sobre el numero de tokens o horas de audio empleados, la composicion del corpus, la procedencia de las grabaciones ni si se aplicaron tecnicas de ajuste como RLHF o DPO, que ademas no son habituales en sintesis de voz. La model card indica explicitamente que OpenVoiceOS no entreno la voz y no la modifico: los dos ficheros son, byte a byte, los dos ficheros contenidos en el `kasanoma-chichewa-model.zip` de la release `chichewa`, con sus hashes SHA-256 publicados (`46e9149f...cfb783` para el ONNX y `4415c524...79bd47b` para el JSON).

## Capacidades

- Sintesis de voz en chichewa/nyanja (`ny`) a partir de texto de entrada.
- Salida de audio a 16 kHz en formato Piper 1.3.0, lista para reproducir o serializar a WAV.
- Voz unica en una unica lengua; no se documenta el numero de hablantes ni variantes dialectales.
- Integrable con el ecosistema Piper y con los distintos clientes que consumen voces Piper.
- No dispone de tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generacion de texto, codigo o matematicas.
- No soporta vision, audio de entrada ni modo "thinking".
- No es multilingue: unicamente chichewa.
- No se documentan parametros de control prosodico (velocidad, tono) mas alla de los que exponga el runtime de Piper.

## Casos de uso

- Lectura de contenidos en chichewa: conversion de noticias, articulos o documentacion a audio para consumo en movilidad; el modelo es adecuado por ser un TTS especifico de la lengua, sin necesidad de traduccion intermedia.
- Accesibilidad para personas con discapacidad visual: integracion como motor de voz de lectores de pantalla en aplicaciones pensadas para usuarios de Malaui, Zambia o Zimbabue.
- Asistentes de voz locales sin conexion: despliegue embebido en Home Assistant, OpenVoiceOS u otros asistentes que consuman voces Piper, util en zonas con conectividad limitada.
- Recursos educativos: generacion de audio para materiales de alfabetizacion y ensenanza en lengua local, donde la oferta de voces sinteticas es muy reducida.
- Salud publica y alertas tempranas: difusion de mensajes hablados sobre campanas sanitarias, meteorologia o agricultura para poblaciones con baja alfabetizacion escrita.
- Preservacion linguistica y archivo: produccion de audio sistematizado en chichewa para corpus digitales y proyectos de documentacion de la lengua.
- Sistemas de respuesta vocal interactiva (IVR): locuciones telefonicas automatizadas en chichewa, siempre que la licencia quede resuelta antes del despliegue.
- Audiolibros y podcasts automatizados: narracion de textos largos segmentada en fragmentos; conviene evaluar manualmente la prosodia antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No consta ninguna medicion de calidad subjetiva (MOS), de inteligibilidad ni de similitud de hablante, ni comparaciones cuantitativas con otras voces. Tampoco se aportan cifras de latencia o de velocidad de sintesis especificas para esta voz.

## Requisitos de hardware

- El fichero `model.onnx` ocupa 63.516.050 bytes (unos 63,5 MB), por lo que la inferencia es viable en CPU sin acelerador dedicado.
- VRAM estimada: no disponible de forma oficial; por el tamano del modelo, cabe en cualquier GPU con menos de 1 GB de memoria asignada y en sistemas con varios cientos de MB de RAM libre.
- GPU recomendadas: no disponibles; no es un caso de uso que requiera A100, H100 ni RTX 4090.
- Compatible con GPU de consumo: si, aunque no es necesario; tambien es apto para hardware de gama baja tipo Raspberry Pi y para ejecucion en movil, segun el diseno general del framework Piper (no confirmado con mediciones de esta voz).
- Opciones de despliegue: binario o libreria Piper, clientes del ecosistema Piper (por ejemplo, integraciones de Home Assistant u OpenVoiceOS) y cualquier runtime capaz de cargar ONNX con la configuracion `model.onnx.json`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible sobre alternativas es muy limitada. Se incluye unicamente lo verificable:

| Modelo | Idioma | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OpenVoiceOS/kasanoma-chichewa` (este) | chichewa (`ny`) | ONNX / Piper 1.3.0 | 63,5 MB (`model.onnx`) | no especificada | HuggingFace (espejo) |
| `ghananlpcommunity/kasanoma-twi` | twi | no disponible | no disponible | no disponible | HuggingFace |
| Otras voces Piper para lenguas distintas | varios | ONNX / Piper | no disponible | variable segun la voz | HuggingFace / repos de Piper |

No se dispone de datos de parametros, contexto ni rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria o de la misma lengua. No se han identificado otras voces TTS publicas en chichewa dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no definida: el origen afirma que sus modelos se publican bajo "licencias de codigo abierto" pero no indica cual; no hay fichero LICENSE en el repositorio ni en el zip, y la consulta a la API de licencia de GitHub devuelve 404. Los terminos aplicables son, por tanto, desconocidos. Para uso comercial o en produccion es imprescindible contactar con el autor (kasanoma@kasanoma.org) antes de utilizarlo.
- Este repositorio es un espejo: no lo mantiene ni lo ha entrenado OpenVoiceOS, y no otorga derechos adicionales a los del origen.
- Ausencia total de datos de entrenamiento: se desconoce el corpus, el numero de hablantes, las horas de audio y la procedencia de las grabaciones, lo que impide evaluar riesgos de consentimiento y de sesgo de hablante.
- Sin validacion por la comunidad: el modelo registra 0 descargas y 0 likes, y no consta ninguna evaluacion independiente de calidad o inteligibilidad.
- Calidad de audio limitada por la frecuencia de muestreo de 16 kHz, inferior a la de voces Piper de mayor calidad.
- Prosodia potencialmente imperfecta: el chichewa es una lengua tonal cuya tonia no siempre se refleja en la ortografia, lo que puede provocar errores de entonacion y de pronunciacion; no se ha publicado ninguna evaluacion al respecto.
- Dependencia de la fonemizacion del runtime: cualquier error del fonemizador del pipeline Piper para `ny` se traduce directamente en errores de pronunciacion.
- Modelo no generativo de texto: no sirve para razonamiento, codigo, matematicas, vision ni agentes, y no admite instrucciones en lenguaje natural.
- Alucinacion en el sentido de TTS: puede producir artefactos acusticos, ruido o silencios anomalos en entradas con caracteres fuera del inventario previsto o con puntuacion atipica.
- Metadatos anomalos: las fechas de creacion y actualizacion del Hub (2026-09-26) no coinciden con un ciclo de publicacion habitual, por lo que la trazabilidad temporal no es fiable.
- Sin versionado ni historial de cambios documentado en el espejo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenVoiceOS/kasanoma-chichewa
- Proyecto original Kasanoma: https://github.com/michsethowusu/kasanoma
- Release `chichewa` del proyecto original: https://github.com/michsethowusu/kasanoma/releases/tag/chichewa
- Referencia de licencia indicada por el autor: https://github.com/michsethowusu/kasanoma#license
- Voz Twi del mismo proyecto en el Hub: https://huggingface.co/ghananlpcommunity/kasanoma-twi
- Contacto del autor para consultas de licencia: kasanoma@kasanoma.org
