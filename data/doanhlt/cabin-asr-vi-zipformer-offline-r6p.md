# doanhlt/cabin-asr-vi-zipformer-offline-r6p

## Resumen

cabin-asr-vi-zipformer-offline-r6p es un paquete de reconocimiento automatico del habla (ASR) en vietnamita disenado para inferencia en dispositivo, publicado por el desarrollador doanhlt. Se distribuye en formato ONNX y esta pensado para ejecutarse con el reconocedor offline de sherpa-onnx dentro de la aplicacion Cabin, manteniendo exactamente la misma estructura de ficheros y configuracion que el modelo al que sustituye (sherpa-vi, sherpa-onnx-zipformer-vi-int8-2025-04-20, r4 rc1). No es un modelo de proposito general ni un checkpoint de investigacion, sino un artefacto de produccion empaquetado para una app concreta.

El modelo parte de una base zipformer de 68,6 M de parametros (la r4 rc1, con licencia Apache-2.0) y se afina mediante destilacion desde un profesor denominado R13x (un fine-tune de Qwen3-ASR). El entrenamiento combina la mezcla de la ronda 3 (258 h) con 69,6 h de audio de produccion en vietnamita y 1,2 h de entrevistas de YouTube, con 3 epocas y aumentacion MUSAN CutMix. El texto de la nube (Soniox / Gemini) se emplea unicamente como filtro de acuerdo, nunca como objetivo de entrenamiento.

Su relevancia es acotada pero clara: es un ejemplo de ciclo de destilacion orientado a despliegue movil, con compuertas de calidad pre-registradas (gate.json) y pesos publicados por decision del propietario. La licencia figura como "other", lo que impide asumir reutilizacion libre sin consultar los terminos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (encoder-decoder-joiner, ASR end-to-end), exportado a ONNX |
| Parametros totales | 68,6 M (modelo base r4 rc1) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (encoder y joiner en int8; decoder en ONNX sin cuantizar segun los nombres de fichero) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other |
| Formato de pesos | ONNX (encoder, decoder, joiner), tokens.txt, bpe.model |

## Arquitectura y entrenamiento

La arquitectura es un Zipformer, un transformer convolucional con atencion de multiples escalas temporales, organizado como encoder-decoder-joiner (transducer) para reconocimiento de voz end-to-end. El paquete incluye tres grafos ONNX separados (encoder y joiner cuantizados a int8, decoder en precision original), un vocabulario de tokens y un modelo BPE. El checkpoint corresponde a la epoca 12 promediada sobre 8 (epoch-12-avg-8).

El entrenamiento parte de la base sherpa-vi r4 rc1 y aplica destilacion desde el profesor R13x (fine-tune de Qwen3-ASR). Los datos son la mezcla de la ronda 3 (258 h) mas 69,6 h de audio de produccion en vietnamita cuyos objetivos R13x coinciden con el texto de la nube, mas 1,2 h de entrevistas de YouTube; se excluyeron los usuarios de evaluacion. Se realizaron 3 epocas con aumentacion MUSAN CutMix. La innovacion metodologica destacable es el uso del texto de la nube solo como filtro de acuerdo entre profesor y referencia, no como etiqueta directa, lo que reduce el riesgo de heredar errores del proveedor cloud.

## Capacidades

- Reconocimiento de voz offline en vietnamita, con salida de transcripcion de audio.
- Inferencia en dispositivo mediante sherpa-onnx OfflineRecognizer.
- Compatibilidad directa con el layout y la configuracion del modelo previo (sherpa-vi r4 rc1), lo que permite sustitucion sin cambios de integracion.
- Modelo transducer con decoder y joiner, apto para decodificacion en streaming por segmentos aunque el paquete se etiqueta como offline.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, vision ni audio mas alla del propio ASR.
- Multilingue: no; solo vietnamita.

## Casos de uso

- Transcripcion en dispositivo dentro de la app Cabin: el paquete sustituye al modelo r4 rc1 sin modificar la configuracion de sherpa-onnx, por lo que se integra directamente en el pipeline existente de la aplicacion.
- Notas de voz y dictado offline: al ejecutarse en local con grafos int8 de bajo peso (repo de 0,1 GB), permite transcribir sin conexion en moviles y equipos de gama media.
- Procesamiento por lotes de entrevistas en vietnamita: el modelo se entreno en parte con entrevistas de YouTube y supera las compuertas G3 sobre ese dominio, por lo que es adecuado para transcripcion de material periodistico o de investigacion cualitativa.
- Subtitulado de contenido audiovisual en vietnamita: la naturaleza offline y el formato ONNX permiten integrarlo en herramientas de escritorio de subtitulado sin depender de APIs de nube.
- Evaluacion comparativa de ASR en vietnamita: al incluir gate.json con criterios pre-registrados y resultados FLEURS, sirve como referencia reproducible en experimentos de destilacion ASR.
- Despliegue en entornos con restricciones de privacidad: al no requerir envio de audio a servidores externos, encaja en escenarios donde la transcripcion no puede salir del dispositivo.

## Benchmarks y rendimiento

La model card no publica cifras numericas de WER/CER, solo el resultado booleano de las compuertas pre-registradas en gate.json:

| Compuerta | Resultado |
|---|---|
| G1_prod_better (mejora en produccion) | true |
| G2_tests_not_worse (tests no empeoran) | true |
| G2_fleurs_le_10.22 (FLEURS menor o igual a 10,22) | true |
| G3_interviews_all_not_worse (entrevistas no empeoran) | true |
| G3_interviews_agree_not_worse (acuerdo en entrevistas no empeora) | true |

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos benchmarks no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del paquete (0,1 GB) y la cuantizacion int8, la huella de memoria es del orden de cientos de MB, apta para ejecucion en CPU.
- GPU recomendadas: no disponible; el diseno es para inferencia en dispositivo (CPU/movil) mediante sherpa-onnx.
- Cabe en GPU consumer: previsiblemente si, dado el reducido tamano, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: sherpa-onnx OfflineRecognizer (unica via documentada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cabin-asr-vi-zipformer-offline-r6p | 68,6 M | no disponible | other | ONNX | Destilado desde R13x, vietnamita, offline |
| sherpa-vi r4 rc1 (doanhlt/cabin-asr-vi-zipformer-offline-r4) | 68,6 M | no disponible | Apache-2.0 | ONNX | Modelo base del que deriva; misma estructura |
| sherpa-onnx-zipformer-vi-int8-2025-04-20 | no disponible | no disponible | no disponible | ONNX int8 | Modelo previo al que sustituye en Cabin |

## Limitaciones y advertencias

- Licencia "other": no se puede asumir uso comercial libre; es necesario consultar los terminos del autor antes de reutilizarlo.
- Entrenado en parte con audio de produccion de Cabin; aunque el autor declara que no hay audio, transcripcion ni identificadores de usuario en el repositorio, el origen de los datos exige atencion a las obligaciones de privacidad aplicables.
- Solo vietnamita; no soporta otros idiomas.
- Estado de release candidate: la compuerta de dispositivo sigue abierta (device gate open) y el cambio a produccion es decision del propietario, por lo que no debe tratarse como una version final validada en todos los dispositivos.
- Al ser un modelo destilado, puede heredar sesgos y errores del profesor R13x y de la distribucion de audio de produccion, con riesgo de peor rendimiento en dominios alejados de los datos de entrenamiento (por ejemplo, acentos o jerga no representados).
- Riesgo de alucinacion en ASR: posibilidad de transcripciones plausibles pero incorrectas en audio ruidoso o con solapamiento de hablantes.
- La cuantizacion int8 del encoder y joiner puede degradar ligeramente la precision frente al modelo en punto flotante.
- No se documentan longitudes maximas de audio ni limites de contexto; conviene validar el comportamiento con segmentos largos antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r6p
- Modelo base: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r4
- Referencia de gate y decisiones: docs/RELEASE_DECISION_MATRIX.md y mobile-local/distill/DECISIONS.log (r6p) citados en la model card; no se proporcionan URL directas.
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
