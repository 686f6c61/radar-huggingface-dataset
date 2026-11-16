# Phoonnx/vits-pl_pl-jarvis-espeak

## Resumen

vits-pl_pl-jarvis-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original fue desarrollado por WitoldG como parte de su coleccion de voces polacas para el ecosistema Piper, y esta version concreta se distribuye en formato ONNX para su ejecucion mediante la libreria phoonnx, tanto en Python como en el asistente de voz OVOS.

El modelo resuelve la sintesis de voz en polaco (pl-PL) a partir de texto normalizado y convertido a fonemas mediante espeak-ng. Su front-end de texto utiliza la libreria scriptconv junto con el fonemizador EspeakPhonemizer, lo que implica que la calidad de la pronunciacion depende de la correcta instalacion de espeak-ng o de su implementacion alternativa espyak.

Es relevante para desarrolladores que necesitan una voz TTS ligera, de licencia MIT y ejecutable en local para aplicaciones en polaco, especialmente en el contexto de asistentes de voz open source como OVOS o en despliegues web mediante phoonnx.js. El repositorio ocupa aproximadamente 0,1 GB y no se han publicado especificaciones detalladas de arquitectura ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Libreria de ejecucion | phoonnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia, lo que facilita su empaquetado en ONNX y su ejecucion en entornos ligeros.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento, ni sobre si se aplicaron tecnicas de RLHF o DPO (habitualmente no aplicables a modelos TTS). El modelo original procede del repositorio WitoldG/polish_piper_models y ha sido reempaquetado por Phoonnx para su uso con la libreria phoonnx. La unica innovacion tecnica documentada es la integracion del front-end de texto mediante scriptconv y el fonemizador de espeak-ng, que normaliza el texto y lo convierte a fonemas IPA antes de la sintesis.

## Capacidades

- Sintesis de voz en polaco (pl-PL) a partir de texto escrito.
- Conversion de texto a fonemas IPA mediante espeak-ng o espyak, con normalizacion previa a cargo de scriptconv.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con soporte de entrada por espeak o unicode.
- No se documentan capacidades de clonacion de voz, control de emocion, multilinguismo ni tool calling.

## Casos de uso

- Asistentes de voz en polaco: integracion como motor TTS en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `piper_community/WitoldG/pl-PL_jarvis` en `mycroft.conf` para respuestas habladas en polaco.
- Lectura de contenido en aplicaciones polacas: sintesis de articulos, noticias o documentos en polaco en aplicaciones de escritorio o moviles que ejecuten phoonnx en local, sin depender de servicios en la nube.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad dirigidas a usuarios polacos, aprovechando la licencia MIT y la ejecucion offline.
- Demos web interactivas: uso de phoonnx.js para generar voz en el navegador con la demo publica en tigregotico.pt/demo, util para prototipos de interfaces conversacionales en polaco.
- Sistemas de anuncios automatizados: generacion de avisos hablados en polaco para transporte publico, comercios o sistemas de megafonia, donde el modelo ligero (0,1 GB) puede desplegarse en hardware modesto.
- Pruebas de integracion TTS en pipelines de desarrollo: validacion de flujos de texto a voz en aplicaciones multilingues donde el polaco es uno de los idiomas soportados, usando phoonnx como dependencia Python.
- Investigacion en TTS: comparacion de la calidad de sintesis de VITS con front-end espeak frente a otras arquitecturas, dado que el modelo es abierto y reproducible en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de tipo VITS y el repositorio ocupa 0,1 GB, por lo que se espera un consumo de memoria reducido, aunque no se documentan cifras exactas.
- GPU recomendadas: no disponible. Al ejecutarse en ONNX, puede funcionar en CPU y en GPUs consumer, pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer: no disponible de forma explicita; el tamano reducido del repositorio sugiere que cabe en GPUs de gama baja, pero no se confirma.
- Opciones de despliegue: libreria phoonnx en Python, plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js para navegador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto / notas |
|---|---|---|---|---|---|
| vits-pl_pl-jarvis-espeak | VITS | pl-PL | MIT | ONNX | Empaquetado para phoonnx; front-end espeak |
| Otras voces de WitoldG/polish_piper_models | VITS | pl-PL | no disponible en esta ficha | Piper / ONNX | Mismo autor upstream; el modelo aqui descrito deriva de esa coleccion |
| Modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun coleccion) | ONNX | Empaquetados para phoonnx; idiomas y voces distintas |
| Modelos TTS comerciales en la nube | no disponible | multiples | propietaria | API | No comparables en licencia ni despliegue local |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta polaco (pl-PL); no se documentan otros idiomas.
- La calidad de pronunciacion depende de espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la model card.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]` para el fonemizado; sin ello, el modelo no funciona correctamente.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en dominios especificos; al ser un modelo TTS, el riesgo de alucinacion se traduce en pronunciaciones incorrectas o entonacion inadecuada.
- No se documentan limitaciones de longitud de texto ni de contexto; se desconoce el comportamiento con frases muy largas.
- La licencia es MIT, lo que permite uso comercial, pero la model card indica que el release upstream establece sus propios terminos, que conviene revisar.
- El modelo tiene pocas descargas (21) y ningun like en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.
- No se dispone de informacion sobre latencia, throughput ni calidad subjetiva (MOS) para evaluar su idoneidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-jarvis-espeak
- Repositorio upstream: https://huggingface.co/WitoldG/polish_piper_models
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
