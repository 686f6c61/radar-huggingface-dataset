# malinali-app/opus-mt-rw-en

## Resumen

El modelo `malinali-app/opus-mt-rw-en` es un sistema de traduccion automatica neuronar del kinyarwanda (rw) al ingles (en), publicado por el desarrollador malinali-app. No se trata de un entrenamiento desde cero: es un reempaquetado de los pesos del modelo `Helsinki-NLP/opus-mt-rw-en` del proyecto OPUS-MT (Helsinki-NLP), convertidos a formato safetensors y acompanados de tokenizadores rapidos adaptados para su ejecucion con Candle a traves del componente `marian_flutter`.

El modelo emplea una arquitectura Marian (transformer encoder-decoder) con 75.639.776 parametros, lo que lo situa en la gama ligera de modelos de traduccion. Su proposito declarado por el autor es servir como paquete de traduccion on-device para la aplicacion Malinali, es decir, traduccion local sin dependencia de servidores externos, lo que resulta relevante para escenarios con restricciones de privacidad, conectividad o coste de inferencia.

Es importante senalar que el autor no reclama la propiedad del modelo entrenado y que la unica aportacion tecnica es el reempaquetado y la conversion de SentencePiece a tokenizador rapido JSON de Hugging Face. La licencia aparece como no disponible en la ficha de HuggingFace, aunque la model card remite a la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 75.639.776 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | kinyarwanda (rw), ingles (en) |
| Licencia | no disponible en la ficha (la model card remite a la licencia del modelo original, habitualmente CC-BY 4.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Direccion de traduccion | rw a en |
| Libreria | transformers |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica, con 75.639.776 parametros. El modelo original fue entrenado por el proyecto OPUS-MT de Helsinki-NLP, que entrena sistemas de traduccion sobre corpus paralelos extraidos de OPUS. No se dispone en la informacion proporcionada de datos concretos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en el empaquetado: el autor convierte los pesos a safetensors y transforma los tokenizadores SentencePiece en dos tokenizadores rapidos JSON (uno para la fuente, `tokenizer-enc.json`, y otro para el destino, `tokenizer-dec.json`), orientados a inferencia on-device con Candle mediante `marian_flutter`. El repositorio incluye cuatro ficheros requeridos: `config.json`, `model.safetensors`, `tokenizer-enc.json` y `tokenizer-dec.json`.

## Capacidades

- Traduccion automatica unidireccional de kinyarwanda a ingles (rw a en).
- Generacion de texto de tipo text2text mediante pipeline `translation` de transformers.
- Ejecucion on-device mediante Candle (`marian_flutter`), pensada para entornos locales sin servidor.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Idiomas: unicamente el par rw-en; no es un modelo multilingue general.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito en la informacion disponible.

## Casos de uso

- Traduccion on-device en aplicaciones moviles: al publicarse como paquete para Malinali con Candle, puede integrarse en apps que necesiten traducir kinyarwanda a ingles sin conexion y sin enviar datos a servidores externos.
- Procesamiento de documentacion humanitaria o de cooperacion: traduccion de textos de campo en kinyarwanda a ingles en contextos con conectividad limitada, ejecutando el modelo localmente.
- Pretraduccion asistida por ordenador: generacion de una primera version en ingles que un traductor humano revisa despues, aprovechando el bajo coste de un modelo de 75,6 millones de parametros.
- Normalizacion de corpus para pipelines de datos: conversion de grandes volumenes de texto en kinyarwanda a ingles para tareas posteriores de analisis, indexacion o busqueda.
- Subtitulado y transcripcion: traduccion de transcripciones en kinyarwanda a ingles como paso previo a la generacion de subtitulos.
- Sistemas de bajo consumo: despliegue en dispositivos con CPU o GPU integrada donde no es viable ejecutar modelos de traduccion de miles de millones de parametros.
- Investigacion en traduccion de lenguas de bajos recursos: el par rw-en es un caso tipico de lengua africana con pocos recursos, util para experimentos de evaluacion y comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 75,6 millones de parametros, los pesos ocupan aproximadamente 300 MB en fp32 y en torno a 150 MB en fp16; la VRAM adicional depende del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de gama alta. Cabe en tarjetas consumer como GTX 1050 Ti, RTX 2060, RTX 3060 o superiores, e incluso en GPUs integradas.
- CPU: el modelo es lo bastante pequeno para ejecutarse en CPU con latencias aceptables para traduccion de frases; es el escenario previsto para el uso on-device.
- Opciones de despliegue: transformers (pipeline de traduccion), Candle mediante `marian_flutter` para on-device; no se documentan otras integraciones en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-rw-en | 75.639.776 | rw, en | no disponible | no disponible (remite al modelo original) | HuggingFace, formato safetensors |
| Helsinki-NLP/opus-mt-rw-en | 75.639.776 (mismo modelo base) | rw, en | no disponible | habitualmente CC-BY 4.0 (consultar ficha oficial) | HuggingFace, pesos originales |
| Otros pares OPUS-MT | variable segun par | par especifico | no disponible | habitualmente CC-BY 4.0 | HuggingFace |
| Meta NLLB-200 (por ejemplo, distilled-600M) | del orden de cientos de millones (consultar ficha oficial) | multilingue, incluye rw y en | consultar ficha oficial | consultar ficha oficial (NLLB suele publicarse bajo CC-BY-NC, no comercial) | HuggingFace |

La comparacion directa mas relevante es con el modelo original `Helsinki-NLP/opus-mt-rw-en`, del que este repositorio es un reempaquetado con tokenizadores adaptados para Candle. Para alternativas multilingues como NLLB o mBART, los datos concretos de parametros, contexto y licencia deben verificarse en sus fichas oficiales, ya que no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- Traduccion unidireccional: solo cubre rw a en; no traduce en sentido inverso.
- Cobertura limitada a dos idiomas: no es un modelo multilingue ni admite otros pares linguisticos.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; los modelos entrenados sobre corpus OPUS pueden heredar sesgos de dominio y de genero presentes en los datos.
- Riesgo de alulcinacion o traducciones erroneas: como todo sistema de traduccion neuronal, puede producir salidas incorrectas, especialmente con terminos tecnicos, nombres propios o expresiones idiomaticas del kinyarwanda.
- Longitud de contexto: no disponible; conviene validar el comportamiento con secuencias largas antes de usarlo en produccion.
- Licencia: la ficha de HuggingFace marca la licencia como no disponible. Aunque la model card remite a la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT), es imprescindible verificar los terminos exactos antes de un uso comercial.
- Autorizacion y atribucion: el autor indica explicitamente que no reclama la propiedad del modelo entrenado y que solo reempaqueta pesos; debe mantenerse la atribucion al proyecto OPUS-MT y a Helsinki-NLP.
- Madurez del repositorio: el modelo registra 0 descargas y 0 likes en el momento de la informacion, por lo que carece de validacion por parte de la comunidad.
- Fechas de publicacion: los metadatos indican creacion y actualizacion en 2026, dato que conviene confirmar en la ficha oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-rw-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-rw-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
