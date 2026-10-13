# codeguru76/supertonic-3

## Resumen

Supertonic 3 es un sistema de sintesis de voz (text-to-speech) de pesos abiertos desarrollado por Supertone, disenado para inferencia totalmente local mediante ONNX Runtime, sin necesidad de llamadas a la nube durante la sintesis. La version 3 amplia la cobertura linguistica del release anterior (Supertonic 2, con 5 idiomas) hasta 31 idiomas, mejora la estabilidad de lectura y reduce los fallos de repeticion y omision de texto.

El modelo se distribuye junto a un SDK de Python (`supertonic`) que descarga automaticamente los activos del modelo desde Hugging Face en la primera ejecucion. Incorpora estilos de voz predefinidos para inferencia inmediata y admite etiquetas de expresion simples como `<laugh>`, `<breath>` y `<sigh>`. Segun la model card, tambien permite voces personalizadas zero-shot mediante ficheros JSON de estilo de voz generados con la herramienta Supertonic Voice Builder.

La ficha que se analiza corresponde al repositorio `codeguru76/supertonic-3`, que parece ser una copia no oficial del repositorio `Supertone/supertonic-3`. El repositorio analizado registra 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0,4 GB. La informacion publica no incluye numero de parametros, arquitectura interna detallada ni resultados numericos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye como modelo ONNX para ONNX Runtime; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible (el repositorio completo ocupa 0,4 GB) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un sistema TTS; el texto se procesa por enunciados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail |
| Formato de pesos | ONNX (mas ficheros JSON de estilo de voz) |
| Libreria / runtime | supertonic (SDK de Python) sobre ONNX Runtime |
| Pipeline declarado | text-to-speech |
| Tamano del repositorio | 0,4 GB |
| Etiquetas adicionales | on-device, multilingual |
| Repositorio | codeguru76/supertonic-3 (el repositorio oficial referenciado en la model card es Supertone/supertonic-3) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (no se indica si es un transformer, un modelo basado en flow matching, un modelo tipo VITS o una arquitectura hibrida), ni el numero de parametros, ni la composicion del dataset de entrenamiento, ni el numero de tokens o horas de audio utilizados. Tampoco se detalla si se aplicaron tecnicas de ajuste como RLHF, DPO u otras. El unico dato tecnico firme sobre la implementacion es que la inferencia se ejecuta integramente con ONNX Runtime en el dispositivo del usuario y que el sistema se distribuye como un paquete de pesos abiertos orientado a ejecucion local.

Como innovaciones declaradas respecto a Supertonic 2, la model card menciona tres: la ampliacion de 5 a 31 idiomas, una mayor estabilidad de lectura con menos fallos de repeticion y omision (especialmente en enunciados muy cortos y muy largos) y una mayor similitud de hablante en el conjunto de idiomas compartidos. Ademas, se anade soporte para etiquetas de expresion simples (`<laugh>`, `<breath>`, `<sigh>`) dentro del texto de entrada, y compatibilidad con estilos de voz personalizados zero-shot a partir de audio de referencia.

## Capacidades

- Sintesis de voz multilingue en 31 idiomas, incluyendo espanol, ingles, coreano, japones, arabe, hindi, ruso, aleman, frances, portugues, italiano y neerlandes, entre otros.
- Inferencia local completa mediante ONNX Runtime, sin llamadas a la nube para la sintesis.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos, listos para usar sin configuracion adicional.
- Voces personalizadas zero-shot: la model card referencia un demo de muestras de audio y la herramienta Supertonic Voice Builder para generar ficheros JSON de estilo de voz a partir de audio de referencia.
- Etiquetas de expresion en el texto: `<laugh>`, `<breath>` y `<sigh>`.
- Control de idioma explicito mediante el parametro `lang` de la API (`tts.synthesize(text, voice_style=style, lang="en")`).
- Guardado de audio generado en fichero WAV y devolucion de la duracion del audio sintetizado.
- Mejoras declaradas de estabilidad de lectura: menos repeticiones y omisiones que Supertonic 2, tanto en enunciados cortos como largos.
- No se menciona en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Audiolibros y narracion larga: el modelo esta disenado para leer texto de forma estable en enunciados largos, con menos fallos de omision y repeticion que la version 2. El SDK permite sintetizar y guardar WAV por fragmentos, lo que encaja en un pipeline de narracion por capitulos.
- Sistemas de atencion al cliente con voz: la model card incluye explicitamente un ejemplo de voz de "call center" en ingles. El modelo puede generar respuestas habladas en 31 idiomas, lo que permite un unico sistema TTS para operaciones multilingues.
- Asistentes de voz en dispositivos sin conectividad: al ejecutarse integramente con ONNX Runtime en local, es adecuado para aplicaciones de escritorio, moviles o dispositivos embebidos donde no se quiere enviar texto del usuario a un servicio externo.
- Localizacion de contenido audiovisual: las voces personalizadas zero-shot y la cobertura de 31 idiomas permiten doblar o generar pistas de voz a partir de una referencia de hablante, comparando referencia y salida en el demo de muestras publicado por el autor.
- Videojuegos y personajes interactivos: las etiquetas `<laugh>`, `<breath>` y `<sigh>` permiten anadir matices expresivos en dialogos generados dinamicamente, como muestran los ejemplos de voz de personaje en japones y coreano de la model card.
- Accesibilidad y lectura de contenido: conversion de articulos, documentacion tecnica o correos a audio en el idioma del usuario, ejecutandose en la maquina del propio usuario final.
- Generacion de boletines y podcasts: el ejemplo de la model card correspondiente a "news" sugiere su uso para locucion de resumenes informativos generados automaticamente.
- Prototipado rapido de interfaces de voz: la instalacion via `pip install supertonic` y la descarga automatica de activos permiten tener sintesis funcional en pocas lineas de codigo durante el desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona cualitativamente mejoras respecto a Supertonic 2 en estabilidad de lectura y similitud de hablante, pero no aporta cifras (por ejemplo, tasas de error de palabras, MOS, similitud de hablante medida con un modelo de verificacion, ni latencia en milisegundos). Tampoco se incluyen comparaciones numericas con otros sistemas TTS.

## Requisitos de hardware

- El modelo esta disenado explicitamente para inferencia on-device con ONNX Runtime, sin requisito de GPU indicado en la informacion disponible.
- El repositorio completo ocupa 0,4 GB, por lo que los activos de pesos y estilos de voz son manejables en almacenamiento de dispositivos de gama media.
- VRAM estimada para inferencia: no disponible. La model card no publica requisitos de memoria.
- GPU recomendadas: no disponibles. No se especifica ninguna GPU concreta (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no confirmada de forma explicita, aunque el enfoque on-device y el tamano del repositorio apuntan a que puede ejecutarse en hardware de consumo. No se dispone de datos verificados.
- Opciones de despliegue: SDK de Python `supertonic` sobre ONNX Runtime (instalacion con `pip install supertonic`, descarga automatica de activos). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son runtimes habituales para TTS.
- Latencia y throughput: no disponibles. La model card usa la expresion "lightning fast" de forma cualitativa, sin cifras de tiempo real factor (RTF), latencia por caracter ni muestras por segundo.

## Comparativa con modelos similares

La informacion proporcionada sobre Supertonic 3 no incluye parametros ni benchmarks, y los datos de los modelos alternativos que figuran a continuacion proceden de conocimiento general, no de la busqueda realizada para esta ficha. Deben verificarse antes de tomar decisiones de produccion.

| Modelo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Supertonic 3 | no disponible | 31 | OpenRAIL | ONNX | pesos abiertos + SDK de Python |
| Kokoro-82M | 82 M | no disponible en esta ficha (multilingue limitado) | Apache 2.0 | safetensors / ONNX | pesos abiertos |
| Piper | variable segun voz | no disponible en esta ficha (decenas de idiomas) | MIT | ONNX | pesos abiertos |
| XTTS v2 (Coqui) | no disponible | no disponible en esta ficha (aproximadamente 17) | Coqui Public Model License | safetensors | pesos abiertos con restricciones |

Diferencias destacables segun la informacion disponible: Supertonic 3 declara una cobertura de 31 idiomas, superior a la mayoria de alternativas de tipo ligero, y su licencia OpenRAIL impone restricciones de uso que no aparecen en licencias permisivas como MIT o Apache 2.0. El principal hueco de informacion frente a las alternativas es la ausencia de numero de parametros y de benchmarks publicos.

## Limitaciones y advertencias

- Repositorio no oficial: la ficha analizada es `codeguru76/supertonic-3`, mientras que la model card referencia `Supertone/supertonic-3`. No hay confirmacion de que el contenido de esta copia coincida byte a byte con el release oficial. Para produccion, conviene usar el repositorio del autor original.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad en ese repositorio.
- Ausencia total de benchmarks: no hay numeros publicos de calidad (MOS), similitud de hablante, inteligibilidad ni tasa de error, lo que dificulta una evaluacion objetiva frente a alternativas.
- Metadatos tecnicos incompletos: no se publican parametros, arquitectura interna, tipos de cuantizacion ni requisitos de memoria.
- Riesgo de fallos de lectura: aunque la version 3 reduce repeticiones y omisiones frente a la 2, la propia model card reconoce que estos fallos existian y siguen siendo el principal eje de mejora, por lo que conviene auditar las salidas en textos largos.
- Cobertura desigual por idioma: no se especifica la calidad relativa de cada uno de los 31 idiomas. Es probable que existan diferencias notables entre idiomas con muchos datos y otros con menos, algo habitual en sistemas multilingues.
- Dependencia del diccionario y la normalizacion de texto: la pronunciacion de numeros, siglas, nombres propios y abreviaturas puede requerir preprocesado previo. No se documenta el comportamiento en la informacion disponible.
- Licencia OpenRAIL: este tipo de licencia incorpora restricciones de uso (habitualmente prohibiciones sobre usos daninos y requisitos de atribucion). No se detalla en la informacion proporcionada la variante exacta ni sus clausulas, por lo que debe revisarse el texto completo antes de un uso comercial.
- Voces personalizadas: la model card indica que los estilos comprados en Voice Builder incluyen embeddings descargables. Esto implica que parte de la funcionalidad de voz personalizada puede tener coste y condiciones comerciales adicionales.
- Uso de voces sinteticas: la clonacion de voz a partir de audio de referencia plantea requisitos legales y eticos (consentimiento del hablante, derechos de imagen y voz, regulacion sobre deepfakes). No se documentan mecanismos de marca de agua ni de deteccion.
- Idiomas y contexto: al ser un sistema TTS, no gestiona contexto conversacional ni razonamiento. La entrada es texto plano con etiquetas de expresion simples.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/codeguru76/supertonic-3
- Repositorio oficial referenciado en la model card: https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Codigo fuente en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio y voces personalizadas: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder

Nota: no se han encontrado en la informacion proporcionada enlaces a papers, informes tecnicos, blogs de anuncio ni resultados de benchmarks.
