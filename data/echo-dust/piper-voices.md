# echo-dust/piper-voices

## Resumen

`echo-dust/piper-voices` no es un modelo entrenado desde cero, sino un espejo (mirror) fijado de un subconjunto de las voces de Piper, el sistema de sintesis de voz open source de Rhasspy. El repositorio reproduce la estructura de directorios del proyecto original —un espejo de otro espejo: `diffusionstudio/piper-voices`, que a su vez copia `rhasspy/piper-voices`— con el objetivo declarado de que la aplicacion consumidora (una PWA llamada Reader) controle el versionado de los ficheros que carga. Los ficheros no se han modificado y el `voices.json` incluido es el original filtrado a las cuatro voces presentes.

El contenido se limita a cuatro voces en ingles: `en_US-amy-medium` (63 MB), `en_US-hfc_female-medium` (63 MB), `en_US-ryan-high` (121 MB) y `en_GB-alan-medium` (63 MB), empaquetadas en formato ONNX con sus ficheros de configuracion asociados. El tamano total del repositorio es de 0,3 GB, coherente con la suma de las cuatro voces. La libreria declarada es `piper` y el pipeline es `text-to-speech`, de modo que el consumo esperado es a traves de `@mintplex-labs/piper-tts-web`, que resuelve las rutas de la misma forma que el repositorio upstream.

La relevancia de este repositorio es operativa mas que tecnica: no aporta voces nuevas, pesos nuevos ni mejoras de arquitectura, sino un pin de versiones bajo el control de su autor. Para un desarrollador que evalue modelos de sintesis de voz, el interes esta en disponer de voces Piper de calidad media y alta listas para inferencia en navegador o en CPU, con la advertencia de que la licencia es por voz y debe verificarse individualmente en cada `MODEL_CARD` upstream antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (Piper distribuye modelos de sintesis de voz end-to-end exportados a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es una metrica aplicable al pipeline TTS) |
| Tipos de cuantizacion | no disponible; los ficheros se distribuyen en los niveles de calidad upstream `medium` y `high` |
| Idiomas soportados | ingles, variantes `en_US` y `en_GB` (deducido de los nombres de voz; la ficha de HuggingFace marca "no disponibles") |
| Licencia | `other` / `per-voice` (los terminos se aplican voz por voz; Piper como proyecto es MIT) |
| Formato de pesos | ONNX (mas fichero de configuracion JSON por voz) |
| Autor | echo-dust |
| Libreria | piper |
| Pipeline | text-to-speech |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Fecha de actualizacion | 2026-09-20 |

Voces incluidas:

| Voz | Ruta upstream | Tamano |
|---|---|---|
| `en_US-amy-medium` | `en/en_US/amy/medium/` | 63 MB |
| `en_US-hfc_female-medium` | `en/en_US/hfc_female/medium/` | 63 MB |
| `en_US-ryan-high` | `en/en_US/ryan/high/` | 121 MB |
| `en_GB-alan-medium` | `en/en_GB/alan/medium/` | 63 MB |

## Arquitectura y entrenamiento

La model card de este repositorio no documenta arquitectura ni proceso de entrenamiento: es una ficha de espejo que se limita a describir la procedencia de los ficheros, el layout de directorios y la tabla de voces. No se indica numero de parametros, datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo ajuste por RLHF o DPO. Lo unico verificable es que los pesos se sirven como ficheros ONNX, que es el formato de exportacion que emplea Piper para inferencia en CPU y en navegador.

El autor remite explicitamente a la documentacion upstream: cada directorio de voz conserva su `MODEL_CARD` original, donde se detallan el dataset de entrenamiento y los terminos de licencia particulares de esa voz. Cualquier evaluacion tecnica rigurosa (calidad de sintesis, prosodia, fonetizacion, cobertura de vocabulario) debe consultarse por tanto en `rhasspy/piper-voices` y en el repositorio `rhasspy/piper`, no en este espejo. Tampoco se documenta ninguna innovacion tecnica adicional, decodificacion especulativa ni variante de atencion.

## Capacidades

- Sintesis de texto a voz en ingles de Estados Unidos (`en_US-amy-medium`, `en_US-hfc_female-medium`, `en_US-ryan-high`).
- Sintesis de texto a voz en ingles de Reino Unido (`en_GB-alan-medium`).
- Dos registros vocales femeninos en `en_US` y uno masculino en `en_US` y otro en `en_GB`, a partir de la denominacion de las voces.
- Dos niveles de calidad declarados: `medium` (63 MB por voz) y `high` (121 MB para `en_US-ryan-high`).
- Ejecucion en navegador mediante `@mintplex-labs/piper-tts-web`, que resuelve las rutas con el layout upstream.
- Generacion de audio local sin dependencia de APIs externas, al tratarse de pesos ONNX empaquetados en el repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento, ya que no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles; solo se confirman voces en ingles.
- Capacidades de clonacion de voz o control emocional: no disponibles en la informacion proporcionada.

## Casos de uso

- Lectura en voz alta dentro de una PWA: el repositorio se creo especificamente para alimentar una aplicacion de lectura, de modo que el modelo se cargaria en el cliente con `@mintplex-labs/piper-tts-web` para narrar texto sin enviar contenido a servidores externos.
- Accesibilidad para personas con discapacidad visual: conversion de articulos, documentacion o interfaces a audio en ingles, con voces `medium` de 63 MB que reducen el tiempo de descarga inicial en conexiones lentas.
- Audiolibros o resumenes hablados generados por lotes: la voz `en_US-ryan-high` de 121 MB ofrece el nivel de calidad mas alto del conjunto para contenido pregrabado donde la fidelidad prima sobre la latencia.
- Anuncios y avisos en aplicaciones web: uso de las voces `medium` para mensajes cortos dinamicos generados en el propio navegador, evitando costes por caracter de APIs TTS comerciales.
- Diferenciacion de acentos en productos para audiencias de EE. UU. y Reino Unido: alternar entre las voces `en_US` y `en_GB-alan-medium` segun la configuracion regional del usuario.
- Pruebas automatizadas de interfaz con audio: integracion de las voces en pipelines de test que verifican la reproduccion de audio en el navegador sin depender de servicios de terceros.
- Prototipado de asistentes conversacionales en ingles: la baja huella (cuatro ficheros ONNX, 0,3 GB en total) permite tener varias voces disponibles simultaneamente en un entorno de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, WER, RTF ni comparaciones cuantitativas con otros sistemas TTS, y la busqueda web realizada no devolvio ninguna fuente tecnica sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los modelos Piper estan disenados para ejecucion en CPU y su huella en disco es de 63 MB (`medium`) y 121 MB (`high`) por voz.
- GPU recomendadas: no disponibles; no se documenta requisito de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX y el tamano de los ficheros son compatibles con ejecucion en CPU, pero la ficha no confirma escenarios de GPU.
- Opciones de despliegue: la libreria `piper` y, para navegador, `@mintplex-labs/piper-tts-web` resolviendo el layout upstream de directorios.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: 0,3 GB para el repositorio completo con las cuatro voces.

## Comparativa con modelos similares

| Repositorio | Contenido | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `echo-dust/piper-voices` | 4 voces (3 `medium`, 1 `high`), 0,3 GB | Ingles (`en_US`, `en_GB`) | `other` / `per-voice` | Espejo no oficial, 0 descargas |
| `diffusionstudio/piper-voices` | Espejo upstream del que procede este | No disponible en la informacion | `per-voice` | Espejo intermedio citado en la model card |
| `rhasspy/piper-voices` | Repositorio oficial de voces Piper | No disponible en la informacion | `per-voice` | Fuente original, enlace de licencia referenciado |
| `rhasspy/piper` | Codigo del motor Piper | No disponible en la informacion | MIT | Repositorio GitHub referenciado |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con sistemas TTS alternativos como XTTS, Kokoro o modelos comerciales de sintesis de voz.

## Limitaciones y advertencias

- Cobertura linguistica muy reducida: cuatro voces, todas en ingles, con dos variantes regionales (`en_US` y `en_GB`); no hay soporte para castellano ni para ningun otro idioma.
- La licencia es `other` con nombre `per-voice`: los terminos aplicables dependen de cada voz y deben consultarse en el `MODEL_CARD` upstream de cada directorio. No se puede asumir uso comercial libre a partir de la licencia del repositorio.
- Es un espejo no oficial y redundante: los mismos ficheros existen en `diffusionstudio/piper-voices` y en `rhasspy/piper-voices`. El valor anadido es unicamente el pin de versiones para una aplicacion concreta.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica.
- No se documentan sesgos de los datos de entrenamiento en la ficha de este espejo; habria que revisar los `MODEL_CARD` por voz para conocer la procedencia de los corpus.
- No se publican metricas de calidad, MOS ni evaluaciones de naturalidad, por lo que no es posible estimar la tasa de errores de pronunciacion.
- No hay informacion sobre robustez ante textos largos, numeros, siglas, nombres propios o puntuacion compleja.
- Al tratarse de pesos ONNX, el rendimiento dependera del backend de ejecucion y del dispositivo; no se ofrecen garantias de latencia en produccion.
- No existe garantia de mantenimiento ni de actualizacion por parte del autor mas alla de la fecha de creacion y actualizacion registrada (2026-09-20).
- La busqueda web realizada no devolvio resultados relacionados con el repositorio; los resultados obtenidos correspondian a la marca de maquinaria ECHO y a medios de prensa franceses, por lo que no aportan informacion tecnica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/echo-dust/piper-voices
- Espejo inmediato de origen: https://huggingface.co/diffusionstudio/piper-voices
- Repositorio oficial de voces Piper: https://huggingface.co/rhasspy/piper-voices
- Enlace de licencia referenciado en la model card: https://huggingface.co/rhasspy/piper-voices
- Codigo del motor Piper (MIT): https://github.com/rhasspy/piper
- Libreria de consumo en navegador citada en la model card: `@mintplex-labs/piper-tts-web`
