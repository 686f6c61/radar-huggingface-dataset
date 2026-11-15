# Phoonnx/glowtts-es-es-carlfm

## Resumen

Phoonnx/glowtts-es-es-carlfm es un modelo de sintesis de voz (text-to-speech) en formato ONNX, derivado del repositorio agregador Phoonnx/phoonnx-glowtts y publicado por el proyecto Phoonnx. Se trata de una voz concreta, identificada como `larynx/es-es-carlfm-glow_tts`, orientada a la sintesis de espanol de Espana y construida sobre la arquitectura GlowTTS. El modelo se distribuye como un artefacto ligero (aproximadamente 0,1 GB de repositorio) pensado para su uso con la libreria phoonnx, un runtime de inferencia ONNX mantenido por el proyecto TigreGotico.

La relevancia de este modelo es practica: ofrece una voz TTS preentrenada y empaquetada para inferencia local mediante ONNX, lo que permite integrar sintesis de voz en aplicaciones sin depender de servicios en la nube. Al estar basado en GlowTTS, un modelo de sintesis no autorregresivo, resulta adecuado para escenarios donde prima la latencia baja y el despliegue en CPU o en hardware modesto. El repositorio no incluye informacion sobre el proceso de entrenamiento, el dataset utilizado ni metricas de calidad.

La informacion publicada es muy limitada: la model card remite al repositorio padre y no documenta idiomas soportados, licencia concreta ni resultados de evaluacion. La licencia figura como `other` sin especificar terminos, lo que constituye un punto critico para cualquier uso en produccion. El modelo se publico en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (text-to-speech no autorregresivo basado en normalizing flows) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido habitual de LLM; la entrada es texto a sintetizar) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es ONNX |
| Idiomas soportados | espanol de Espana (segun el identificador `es-es`); no se documenta la cobertura exacta |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de sintesis de voz no autorregresiva que combina un encoder de texto con un decoder basado en normalizing flows, lo que permite generar espectrogramas (o formas de onda, segun la variante) en una sola pasada y con latencia predecible. El modelo se distribuye en formato ONNX, lo que facilita su ejecucion con runtimes de inferencia estandar y su integracion en aplicaciones sin dependencias de frameworks de entrenamiento.

No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del corpus, la duracion total de audio utilizada ni si se aplicaron tecnicas de ajuste fino o adaptacion de voz. La model card unicamente indica que el modelo forma parte del repositorio Phoonnx/phoonnx-glowtts y que conserva las rutas de ficheros de ese repositorio. Cualquier detalle sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Sintesis de voz (text-to-speech) para espanol de Espana a partir de texto de entrada.
- Generacion de audio mediante inferencia ONNX, ejecutable con la libreria phoonnx.
- Voz identificada como `larynx/es-es-carlfm-glow_tts`, utilizable como voz concreta dentro del ecosistema phoonnx.
- No se documentan capacidades de clonacion de voz, control de emocion, prosodia avanzada ni multilingue.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta capacidad de vision ni audio de entrada.

## Casos de uso

- Sintesis de voz en aplicaciones de escritorio o moviles: al distribuirse como ONNX y ocupar aproximadamente 0,1 GB, puede integrarse en aplicaciones que necesiten generar voz en local sin conexion a servicios externos.
- Lectura de contenido en espanol de Espana: adecuado para convertir articulos, noticias o documentacion en audio para accesibilidad o consumo pasivo.
- Asistentes de voz embebidos: la naturaleza no autorregresiva de GlowTTS permite latencias bajas, apropiadas para respuestas habladas en interfaces conversacionales.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes hablados en entornos como transporte publico, comercio o telefonia, donde se requiere una voz en castellano consistente.
- Prototipado de pipelines TTS: util para desarrolladores que evaluan el runtime phoonnx y necesitan una voz espanola de referencia antes de entrenar o adaptar una voz propia.
- Generacion de audiolibros o contenido educativo: sintesis por lotes de textos largos en espanol, siempre que la licencia final permita el uso previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (aproximadamente 0,1 GB), es plausible su ejecucion en CPU y en GPUs con poca memoria, pero no hay cifras confirmadas.
- GPU recomendadas: no disponible; al ser un modelo ONNX ligero, no requiere GPU dedicada para funcionar, aunque no se documentan requisitos minimos.
- Compatibilidad con GPU de consumo: probable en cualquier GPU de consumo moderna por el tamano del artefacto, si bien no se confirma en la documentacion.
- Opciones de despliegue: runtime phoonnx (libreria indicada por el autor); al ser ONNX, podria ejecutarse con ONNX Runtime, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-es-es-carlfm | GlowTTS | espanol (es-ES) | ONNX | other (sin especificar) | Hugging Face |
| Phoonnx/phoonnx-glowtts (repositorio padre) | GlowTTS (multiples voces) | multiple | ONNX | other (sin especificar) | Hugging Face |
| Alternativas TTS de codigo abierto en espanol | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia `other` sin terminos explicitos: no se especifica si se permite uso comercial, modificacion o redistribucion, lo que impide asumir derechos de uso en produccion.
- Ausencia de documentacion sobre el corpus de entrenamiento: no puede evaluarse la cobertura dialectal, el equilibrio de genero ni posibles sesgos de la voz.
- Riesgo de artefactos y errores de pronunciacion: inherente a los sistemas TTS, especialmente en nombres propios, siglas y terminos tecnicos; no hay evaluaciones publicadas que lo cuantifiquen.
- Cobertura limitada al espanol de Espana segun el identificador; no se documenta soporte de otras variantes del espanol ni de otros idiomas.
- Sin metricas de calidad (MOS, WER de sintesis) ni comparaciones publicadas, lo que dificulta valorar su idoneidad frente a alternativas.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en comunidad ni de mantenimiento activo.
- Dependencia del runtime phoonnx: la integracion esta pensada para esa libreria, y no se documenta compatibilidad con otros runtimes ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-es-es-carlfm
- Repositorio padre: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Repositorio del runtime phoonnx: https://github.com/TigreGotico/phoonnx
