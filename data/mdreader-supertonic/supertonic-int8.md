# mdreader-supertonic/supertonic-int8

## Resumen

Supertonic-int8 es una copia cuantizada a int8 del modelo de sintesis de voz Supertonic 2, desarrollado originalmente por Supertone Inc. y redistribuido por el autor `mdreader-supertonic` como componente opcional de "voz mejorada" de Lector MD, un lector de Markdown que se ejecuta integramente en el navegador. El modelo resuelve el problema de generar voz de forma local, sin enviar texto a ningun servidor, mediante `onnxruntime-web` sobre WebAssembly en CPU y en un solo hilo.

La relevancia practica del artefacto es su reduccion de tamano: pasa de 263 MB en fp32 a aproximadamente 96 MB en int8, manteniendo identicas las entradas y salidas de cada grafo, de modo que el ejemplo web oficial de Supertonic funciona sin cambios. Se distribuye como cuatro grafos ONNX (predictor de duracion, codificador de texto, estimador de vectores y vocoder) mas ficheros de configuracion, tabla de caracteres y diez estilos de voz.

El modelo cubre cinco idiomas (ingles, espanol, portugues, frances y coreano) y se publica bajo licencia BigScience OpenRAIL-M, con restricciones de uso explicitas. No es un modelo entrenado por el autor del repositorio: es un espejo de los artefactos int8 generados por el proyecto sherpa-onnx, replicados para evitar dependencias de repositorios de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en difusion/estimador de vectores segun nombres de grafos; detalles no publicados en la informacion disponible) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (unica variante en este repositorio) |
| Idiomas soportados | Ingles (en), espanol (es), portugues (pt), frances (fr), coreano (ko) |
| Licencia | BigScience OpenRAIL-M (etiquetada como `openrail`) |
| Formato de pesos | ONNX (`.onnx`) mas JSON de configuracion (`tts.json`, `unicode_indexer.json`) y estilos de voz JSON |
| Tamano del repositorio | 0,1 GB (aproximadamente 96 MB) |
| Pipeline | text-to-speech |
| Runtime objetivo | `onnxruntime-web` (WebAssembly, CPU, un solo hilo) |
| Modelo base | Supertone/supertonic-2 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento de Supertonic 2. Por los nombres de los grafos se deduce una cadena de sintesis en cuatro etapas: un `duration_predictor` que estima la duracion de cada unidad de texto, un `text_encoder` que proyecta la secuencia de caracteres a representaciones latentes, un `vector_estimator` que genera o refina la representacion acustica y un `vocoder` que convierte esa representacion en forma de onda de audio. El acoplamiento de un estimador de vectores con un vocoder es compatible con esquemas de sintesis por difusion o por flujo, aunque el repositorio no confirma el metodo concreto.

No se aportan datos sobre volumen de entrenamiento, composicion del corpus, numero de tokens, idiomas vistos durante el entrenamiento ni sobre tecnicas de alineamiento como RLHF o DPO. La innovacion documentada en este artefacto es exclusivamente de despliegue: la cuantizacion int8 realizada por k2-fsa/sherpa-onnx reduce el peso de 263 MB a unos 96 MB y preserva la interfaz de los grafos, lo que permite ejecucion en navegador con WebAssembly sin GPU. Los ficheros `.onnx` son copias byte a byte de los publicados por sherpa-onnx, unicamente renombrados; la configuracion y la tabla de caracteres provienen del repositorio original de Supertone.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en ingles, espanol, portugues, frances y coreano.
- Diez estilos de voz predefinidos: cinco femeninos (F1 a F5) y cinco masculinos (M1 a M5), seleccionables mediante ficheros JSON de estilo.
- Prediccion de duracion por unidad de texto, lo que permite control del ritmo de la locucion dentro de lo que expone el modelo base.
- Ejecucion local en el dispositivo del usuario mediante `onnxruntime-web` sobre WebAssembly, en CPU y con un solo hilo, sin llamadas a servidor.
- Compatibilidad directa con el ejemplo web oficial de Supertonic, ya que las firmas de entrada y salida de los grafos son identicas a las del modelo fp32.
- No se documenta soporte de clonacion de voz, tool calling, razonamiento multi-paso, vision, audio de entrada ni modo "thinking"; son capacidades ajenas al proposito del modelo.

## Casos de uso

- Lectura de documentos Markdown en el navegador: es el caso de uso original; el modelo actua como voz opcional de Lector MD y permite escuchar el contenido sin enviar el texto a ningun servicio externo, lo que resulta adecuado para documentos sensibles o para uso sin conexion.
- Accesibilidad web para personas con discapacidad visual: al ejecutarse en WebAssembly en el propio navegador, se puede integrar en lectores de paginas o aplicaciones educativas sin infraestructura de servidor ni costes por peticion.
- Aplicaciones de aprendizaje de idiomas: los cinco idiomas soportados y los diez estilos de voz permiten generar enunciados de practica con distintas voces para exposicion a variacion de hablante.
- Demos y prototipos sin backend: un equipo puede validar una interfaz de lectura por voz o de audiolibros en una prueba de concepto puramente estatica, dado el tamano de 96 MB y la ausencia de dependencias de servidor.
- Procesamiento por lotes de textos largos en entornos con recursos limitados: la variante int8 reduce requisitos de memoria frente al modelo fp32 y puede ejecutarse en CPU, lo que simplifica el despliegue en contenedores pequenos o en equipos sin GPU.
- Distribucion empaquetada en aplicaciones de escritorio o extensiones: el espejo de artefactos evita depender de repositorios de terceros que puedan cambiar o desaparecer, algo relevante para productos que necesitan builds reproducibles.
- Generacion de audio para pruebas de calidad (QA) de interfaces: permite producir locuciones de referencia rapidamente en el propio navegador durante el desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el escenario documentado; el modelo se ejecuta en CPU mediante WebAssembly. No se especifica memoria RAM minima, aunque el repositorio ocupa aproximadamente 96 MB en disco y la inferencia mantiene los grafos en memoria.
- GPU recomendadas: no se documenta ninguna; el runtime objetivo es `onnxruntime-web` en CPU y un solo hilo.
- Compatibilidad con GPU de consumo: no se indica soporte de aceleracion por GPU en la informacion disponible; el despliegue descrito es exclusivamente CPU/WASM.
- Opciones de despliegue: `onnxruntime-web` (documentado), y por procedencia de los artefactos, sherpa-onnx y el ejemplo web oficial de Supertonic. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican cifras de tiempo real (RTF), latencia por frase ni velocidad de sintesis en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| supertonic-int8 (este) | No disponible | No disponible | en, es, pt, fr, ko | OpenRAIL-M | ONNX int8 | Unos 96 MB; runtime web WASM |
| Supertone/supertonic-2 (base) | No disponible | No disponible | en, es, pt, fr, ko | OpenRAIL-M | No disponible en la informacion | 263 MB en fp32; misma interfaz de grafos |
| sherpa-onnx-supertonic-tts-int8 | No disponible | No disponible | No disponible | No disponible | ONNX int8 | Origen de los grafos cuantizados de este repositorio |

No se dispone de datos de rendimiento comparado (MOS, RTF, WER) para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo original: es una copia cuantizada y espejada de artefactos de terceros (Supertone y sherpa-onnx); las cuestiones de calidad o sesgo remiten al modelo base.
- La cuantizacion int8 puede introducir perdida de calidad acustica frente al modelo fp32; el repositorio no publica mediciones comparativas de MOS ni de inteligibilidad.
- No se documentan sesgos conocidos, pero un modelo TTS multilingue puede reproducir sesgos de prosodia, acento o genero asociados a sus diez estilos de voz predefinidos.
- Riesgo de alucinacion en el sentido de pronunciacion incorrecta, omissions o artefactos en palabras poco frecuentes, nombres propios y textos fuera de los cinco idiomas soportados.
- No se especifica la longitud maxima de texto por peticion ni el comportamiento con entradas muy largas; el rendimiento en CPU de un solo hilo puede ser limitante para documentos extensos.
- La licencia OpenRAIL-M impone restricciones de uso del anexo A: prohibido suplantar identidad sin consentimiento (incluidos deepfakes), difundir informacion verificablemente falsa con intencion de dano, explotar o danar a menores, difamar, acosar o discriminar, y cualquier uso contrario a la legislacion aplicable.
- El uso comercial esta permitido por OpenRAIL-M, pero sujeto a esas restricciones y a las obligaciones de la licencia; conviene revisar el fichero `LICENSE` completo antes de integrarlo en un producto.
- Repositorio con cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Dependencia de la estabilidad de la API de `onnxruntime-web` y de la version de WebAssembly del navegador del usuario final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mdreader-supertonic/supertonic-int8
- Modelo base Supertonic 2: https://huggingface.co/Supertone/supertonic-2
- Repositorio oficial de Supertonic (ejemplo web): https://github.com/supertone-inc/supertonic
- Origen de los grafos int8 (sherpa-onnx): https://huggingface.co/csukuangfj2/sherpa-onnx-supertonic-tts-int8-2026-03-06
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Aplicacion Lector MD: https://mdreader.jhproyectos.com.ar
