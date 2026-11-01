# KonradDallaOrg/dimmy-nemotron-3-diarization

## Resumen

dimmy-nemotron-3-diarization es un espejo sin modificaciones de los ficheros del modelo Nemotron-3-Diarization de NVIDIA, publicado por KonradDallaOrg para que la aplicacion Dimmy no dependa de que los repositorios originales sigan disponibles. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son byte a byte identicos a los de los repositorios de origen, con los hashes SHA-256 documentados en la model card. El modelo realiza diarizacion de hablantes (segmentacion y atribucion de quien habla en cada momento de una grabacion de audio).

El paquete incluye dos formatos con propositos distintos: un GGUF Q8_0 de aproximadamente 107 MB pensado para diarizacion en directo y un ONNX int8 de unos 104 MB acompanado de un preprocesador ONNX de 136 KB para diarizacion posterior a la reunion. El modelo base cuenta con 99.260.363 parametros y el repositorio ocupa 0,2 GB en total. La licencia es OpenMDW-1.1, heredada de NVIDIA, y la conversion a ONNX int8 corre a cargo de joosthel.

Su relevancia es practica mas que investigadora: sirve como fuente estable y verificable de artefactos de diarizacion listos para produccion en una aplicacion de escritorio, con trazabilidad criptografica de cada fichero y sin dependencia de revisiones moviles en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de diarizacion de hablantes; el mirror no documenta la arquitectura interna) |
| Parametros totales | 99.260.363 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0; ONNX int8 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (`Nemotron-3-Diarization.q8_0.gguf`), ONNX (`model.int8.onnx`), ONNX preprocesador (`preprocessor_core.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Se sabe que la tarea es diarizacion de hablantes y que el modelo original fue desarrollado por NVIDIA bajo la familia Nemotron-3. El mirror no incluye detalles sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO), por lo que esos datos deben consultarse en el repositorio original de NVIDIA.

La innovacion tecnica relevante de este paquete no esta en el modelo sino en el empaquetado: se ofrecen dos rutas de inferencia (GGUF Q8_0 para procesamiento en directo y ONNX int8 con preprocesador separado para postprocesado), ambas con hashes SHA-256 verificables y fijadas a revisiones concretas de los repositorios de origen (`f667ed73...` para NVIDIA, `4a911fc3...` para la conversion ONNX de joosthel). La conversion a int8 y el preprocesador son aportaciones de joosthel.

## Capacidades

- Diarizacion de hablantes: identifica y segmenta quien habla en cada tramo de una grabacion de audio.
- Modo en directo: el GGUF Q8_0 esta orientado a diarizacion de hablantes en tiempo real.
- Modo post-reunion: el ONNX int8 con preprocesador esta orientado al procesado por lotes tras la grabacion.
- Preprocesamiento de audio incluido como modelo ONNX independiente.
- Ejecucion en ONNX Runtime y en runtimes compatibles con GGUF.
- No consta soporte de generacion de texto, codigo, vision, tool calling ni agentes; es un modelo especializado exclusivamente en audio.
- Capacidades multilingues: no documentadas (la diarizacion depende de caracteristicas acusticas, no del idioma, pero no hay confirmacion explicita).

## Casos de uso

- Actas de reunion con atribucion de intervenciones: procesar la grabacion con el ONNX int8 y el preprocesador para generar una transcripcion etiquetada por hablante, adecuado porque el modelo esta disenado especificamente para postprocesado de reuniones.
- Subtitulado en directo con etiquetas de hablante: usar el GGUF Q8_0 en un pipeline de captura de audio continua, ya que su formato esta pensado para diarizacion en vivo.
- Aplicaciones de escritorio tipo Dimmy: integrar los artefactos como dependencia empaquetada, con la ventaja de que los hashes SHA-256 permiten verificar la integridad de los ficheros en cada arranque o actualizacion.
- Analisis de entrevistas y grupos focales: separar participantes en grabaciones de investigacion cualitativa antes de pasar el audio a un sistema de transcripcion (ASR) externo.
- Cumplimiento y auditoria de reuniones: generar registros de quien dijo que y cuando en entornos donde se exige trazabilidad, apoyandose en la licencia OpenMDW-1.1 y en la verificabilidad de los pesos.
- Pipelines offline en CPU: desplegar el ONNX int8 en servidores sin GPU, dado el reducido tamano del modelo (unos 104 MB) y su formato de cuantizacion entera.
- Archivado reproducible de dependencias: usar el mirror como fuente fija en builds reproducibles, ya que cada fichero esta anclado a una revision concreta y su hash esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo ronda los 100 MB en Q8_0 e int8, por lo que la huella de memoria es minima; no se especifica memoria adicional para buffers de audio o preprocesador.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna es sobradamente suficiente, pero no hay datos oficiales de rendimiento.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado el tamano del modelo.
- Opciones de despliegue: ONNX Runtime para `model.int8.onnx` y `preprocessor_core.onnx`; runtimes compatibles con GGUF para `Nemotron-3-Diarization.q8_0.gguf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de diarizacion ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un mirror, no un modelo original: no aporta mejoras, correcciones ni ajustes respecto a los repositorios de NVIDIA y joosthel.
- La model card advierte de que los repositorios de origen no incluyen fichero LICENSE/NOTICE en la revision fijada; los ficheros de licencia copiados (`LICENSE.joosthel`, `NOTICE.joosthel`) provienen del repositorio ONNX de joosthel.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; no se detallan aqui sus terminos.
- No hay informacion sobre sesgos, tasas de error de diarizacion ni robustez ante solapamiento de voces, ruido o acentos.
- No se documentan idiomas soportados ni limites de duracion o contexto de audio.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto, pero si existe riesgo de atribucion erronea de hablantes, no cuantificado.
- Solo 12 descargas y 0 likes en el momento de la consulta: comunidad muy reducida, sin validacion independiente.
- El pipeline no esta declarado en el Hub, lo que puede afectar a la integracion automatica con herramientas que dependen de ese campo.

## Enlaces

- Repositorio del mirror: https://huggingface.co/KonradDallaOrg/dimmy-nemotron-3-diarization
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization (revision `f667ed73aee57d40cc39428eb768b4fd87a0a29e`)
- Conversion ONNX de joosthel: https://huggingface.co/joosthel/Nemotron-3-Diarization-ONNX (revision `4a911fc3ca821b76a99fffd5ce5135bd1efca540`)
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
