# Phoonnx/glowtts-en-us-cmu_ksp

## Resumen

Phoonnx/glowtts-en-us-cmu_ksp es un modelo de sintesis de voz (text-to-speech) en formato ONNX, derivado del repositorio agregador Phoonnx/phoonnx-glowtts y empaquetado para su uso con la libreria phoonnx. Se corresponde con la carpeta `en-us-cmu_ksp` de ese repositorio, es decir, una voz concreta en ingles estadounidense construida sobre la arquitectura GlowTTS. El autor del empaquetado es la organizacion Phoonnx, mientras que la arquitectura subyacente GlowTTS procede del trabajo academico original de Kim et al. (2020).

El modelo resuelve un caso de uso acotado: sintetizar habla en ingles estadounidense a partir de texto dentro del ecosistema phoonnx, que actua como capa de inferencia sobre modelos ONNX. No se trata de un modelo fundacional ni de un sistema TTS de gran escala, sino de un artefacto de despliegue ligero (el repositorio ocupa aproximadamente 0,1 GB) pensado para integrarse en aplicaciones que ya utilizan la libreria phoonnx y sus identificadores de voz.

La relevancia es practica mas que investigadora: permite incorporar TTS en local sin depender de servicios en la nube, con un peso reducido y un formato ONNX portable. La informacion publica disponible es minima: la model card no documenta parametros, contexto, datos de entrenamiento ni benchmarks, y la licencia figura como `other` sin especificar terminos, lo que limita su adopcion en produccion comercial sin aclaracion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flow no autorregresivo para TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no acepta contexto de texto libre) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (en-US), segun el identificador `en-us` |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | ONNX |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Libreria de inferencia | phoonnx |
| Identificador de voz | `larynx/en-us-cmu_ksp-glow_tts` |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de sintesis de voz no autorregresiva basada en normalizing flows, presentada por Kim et al. en 2020. A diferencia de los modelos autorregresivos como Tacotron 2, GlowTTS mapea el texto a mel-espectrogramas en paralelo mediante un encoder transformer y un bloque de flows invertibles, lo que reduce la latencia de inferencia y evita errores de alineacion acumulativos. La duracion de cada fonema se modela de forma explicita, lo que permite control de ritmo. El vocoder no forma parte del modelo GlowTTS en si; en el ecosistema phoonnx y Larynx habitualmente se combina con un vocoder separado para generar la forma de onda final.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus `cmu_ksp`, el numero de pasos ni si se aplicaron tecnicas de fine-tuning o adaptacion sobre un checkpoint base. El identificador `cmu_ksp` sugiere un corpus vinculado a CMU y a las iniciales de una voz concreta, pero la model card no lo documenta. Tampoco se detalla si el modelo se exporto a ONNX desde un checkpoint de Larynx o si se entreno directamente para ese formato. Cualquier afirmacion sobre datos o proceso de entrenamiento seria especulativa.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Generacion de mel-espectrogramas de forma no autorregresiva, con inferencia en paralelo.
- Control implicito de duracion por fonema propio de GlowTTS (sin confirmacion de parametros expuestos en la model card).
- Ejecucion en formato ONNX, apta para runtime multiplataforma.
- Integracion con la libreria phoonnx mediante el identificador de voz `larynx/en-us-cmu_ksp-glow_tts`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; son capacidades ajenas al proposito del modelo.
- No se documenta capacidad multilingue: solo consta el ingles estadounidense.

## Casos de uso

- Lectura por voz de interfaces y notificaciones: el modelo puede sintetizar mensajes cortos en ingles dentro de una aplicacion de escritorio o movil que ya integre phoonnx, con un peso de repositorio de aproximadamente 0,1 GB que facilita el empaquetado.
- Asistentes de voz embebidos sin conexion: al ser un modelo ONNX local, permite generar respuestas habladas en dispositivos sin acceso a servicios en la nube, reduciendo dependencias externas y latencia de red.
- Accesibilidad para contenido en ingles: conversion de articulos, correos o documentacion a audio para usuarios con discapacidad visual, usando la voz `en-us-cmu_ksp` como una de las voces disponibles en el catalogo phoonnx.
- Prototipado rapido de pipelines TTS: investigadores que evaluan distintas voces del repositorio phoonnx-glowtts pueden intercambiar carpetas de voz sin cambiar el codigo de inferencia, ya que los archivos conservan sus rutas originales.
- Generacion de audiolibros o podcasts de bajo coste: sintesis por lotes de texto largo en ingles, con la ventaja de que el modelo no autorregresivo procesa en paralelo y evita fallos de alineacion en pasajes extensos.
- Pruebas de regresion en sistemas de voz: util como voz de referencia fija en tests automatizados de calidad de sintesis dentro de un pipeline CI, al ser un artefacto versionado y de tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (aproximadamente 0,1 GB) se espera un consumo de memoria muy bajo, del orden de cientos de MB incluyendo el vocoder y los buffers de inferencia.
- GPU recomendadas: no disponibles; por el perfil del modelo, cualquier GPU con soporte ONNX Runtime deberia ser suficiente, incluidas GTX 1650, RTX 3060 o superiores.
- Cabe en GPU de consumo: muy probablemente si, dado el tamano del artefacto, aunque no hay confirmacion oficial.
- Opciones de despliegue: ONNX Runtime como runtime principal; la libreria phoonnx como capa de integracion. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en-us-cmu_ksp | GlowTTS | en-US | ONNX | other (sin especificar) | Hugging Face |
| Voces Larynx (p. ej. larynx/en-us-*) | GlowTTS o VITS | en-US y otros | ONNX / TF | mayoritariamente permisivas, variable por voz | Hugging Face y repositorio Larynx |
| Piper (voces en-US) | VITS | en-US y otros | ONNX | MIT en el runtime, variable por voz | Hugging Face y GitHub |
| Coqui TTS (modelos en-US) | VITS, Tacotron 2, otros | en-US y multilingue | PyTorch | MPL 2.0 en el framework, variable por modelo | GitHub y Hugging Face |

La comparacion con voces Larynx y Piper es la mas directa, ya que comparten el enfoque de TTS ligero en ONNX para ejecucion local. La diferencia principal de este artefacto es que actua como reempaquetado de una voz concreta para la libreria phoonnx, sin documentacion propia sobre calidad, licencia o metricas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La licencia figura como `other` sin terminos explicitos, lo que impide confirmar si se permite uso comercial; es imprescindible aclararlo con el autor antes de desplegar en produccion.
- La model card no documenta sesgos de la voz ni caracteristicas del hablante; no puede evaluarse la representatividad de la voz `cmu_ksp`.
- Riesgo de alucinacion en el sentido TTS: posibles artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera del dominio del corpus de entrenamiento, sin datos publicados sobre su magnitud.
- Solo se declara ingles estadounidense; no hay soporte multilingue documentado.
- No se especifican parametros, contexto ni datos de entrenamiento, lo que dificulta la reproducibilidad y la comparacion tecnica.
- El modelo es un artefacto de despliegue dependiente de la libreria phoonnx; su uso fuera de ese ecosistema requiere adaptar la carga de los archivos ONNX.
- El vocoder necesario para generar audio final no se describe en la model card; debe obtenerse por separado segun el flujo de phoonnx.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en comunidad ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_ksp
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
