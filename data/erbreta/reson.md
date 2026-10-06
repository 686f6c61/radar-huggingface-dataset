# Erbreta/Reson

## Resumen

Erbreta/Reson no es un modelo de aprendizaje automatico en el sentido habitual, sino un repositorio de indice (registry) que cataloga los modelos que utiliza Reson, una aplicacion de investigacion en fonetica forense y linguistica. Reson descarga los pesos desde fuentes publicas y ejecuta el analisis en local sobre el ordenador del usuario; el audio nunca se sube al repositorio, que no actua como API de inferencia. El fichero `model_manifest.json` es la fuente canonica del registro.

El repositorio define tres slots funcionales. El slot de transcripcion apunta a Multilingual Whisper small en formato CTranslate2 (procedente de Systran/faster-whisper-small, licencia MIT). El slot de analisis de hablante apunta a ECAPA-TDNN VoxCeleb de SpeechBrain (licencia Apache-2.0). Ademas se incluye una dependencia empaquetada, Silero VAD v6 integrado en Faster-Whisper 1.2.1 (MIT).

Su relevancia es doble: por un lado, documenta un flujo de trabajo de inferencia estrictamente local, sin servicio de pago ni servidor backend ni GPU remota; por otro, propone un mecanismo de mantenimiento de registro basado en revisiones inmutables y verificacion por SHA-256 con activacion atomica. No se especifican parametros totales, contexto ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un unico modelo: registro con tres componentes. Transcripcion basada en Whisper small (transformer encoder-decoder para ASR) en CTranslate2; analisis de hablante basado en ECAPA-TDNN VoxCeleb; dependencia VAD basada en Silero VAD v6 |
| Parametros totales | no disponible (el repositorio no indica recuento de parametros; la transcripcion usa la variante small de Whisper) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos de transcripcion se distribuyen como pack CTranslate2; no se detallan las cuantizaciones concretas) |
| Idiomas soportados | no disponible como lista cerrada. El manifest exige que los reemplazos de Whisper sean multilingues y compatibles con arabe |
| Licencia | Mixta por componente: MIT (pack Whisper small / CTranslate2 y Silero VAD), Apache-2.0 (ECAPA-TDNN VoxCeleb). La licencia del repositorio en si no se indica |
| Formato de pesos | CTranslate2 para el slot de transcripcion; formato del slot de analisis de hablante no disponible; VAD empaquetado como dependencia del motor. Los pesos upstream se referencian en revisiones inmutables en lugar de copiarse |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: indexa pesos ya publicados y los referencia en revisiones inmutables. Cada slot funcional define un proposito (transcripcion, analisis de hablante) y cada entrada versionada identifica el modelo compatible seleccionado en cada momento. La aplicacion incorpora una instantanea de reserva para el primer arranque o para uso sin conexion, y las actualizaciones del registro se descubren mediante refrescos explicitos.

Los componentes catalogados corresponden a tres familias conocidas: un modelo de reconocimiento automatico del habla de tipo encoder-decoder (Whisper small, convertido a CTranslate2), un extractor de embeddings de hablante basado en ECAPA-TDNN entrenado sobre VoxCeleb, y un detector de actividad de voz (Silero VAD v6) integrado en Faster-Whisper 1.2.1. Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. Como innovacion operativa destaca el mecanismo de mantenimiento del registro: calculo de SHA-256 y tamano en bytes por fichero, validacion mediante `model_registry.validate_registry`, descargas con staging verificado y activacion atomica, y compatibilidad restringida a adaptadores de motor locales ya revisados.

## Capacidades

- Transcripcion de audio multilingue mediante el pack Whisper small en CTranslate2, con requisito explicito de soporte multilingue y de arabe para cualquier reemplazo aceptado.
- Analisis de hablante: generacion de embeddings de voz con ECAPA-TDNN VoxCeleb, orientada a tareas de comparacion y atribucion de hablante.
- Deteccion de actividad de voz (VAD) con Silero VAD v6 empaquetado en el motor Faster-Whisper.
- Inferencia estrictamente local: el audio del usuario no se sube al repositorio ni a un backend remoto.
- Funcionamiento sin conexion: las instalaciones antiguas siguen siendo utilizables offline mientras hay una actualizacion opcional disponible.
- Instalacion selectiva de modelos, individualmente o desde el ajuste "Settings → Models & Offline Use".
- Gestion de versiones y compatibilidad: intervalos de compatibilidad, version de registro y validacion de manifiesto antes de publicar.
- No se documentan capacidades de generacion de texto libre, razonamiento, codigo, matematicas, vision, tool calling ni agentes.

## Casos de uso

- Analisis forense de voz: transcripcion de grabaciones y extraccion de embeddings de hablante para comparar muestras, con todo el procesamiento en local para preservar la cadena de custodia del audio.
- Investigacion linguistica de campo: transcripcion multilingue de corpus orales recogidos en contextos con conectividad limitada, apoyandose en el funcionamiento offline y en la instantanea de reserva del primer arranque.
- Flujos con requisitos de privacidad estrictos: entornos clinicos, legales o periodisticos donde subir audio a un servicio externo no es aceptable; el diseno evita cualquier backend o host de GPU.
- Segmentacion previa de audio: uso de Silero VAD para recortar silencios y aislar turnos de habla antes de la transcripcion, reduciendo el volumen de audio procesado.
- Verificacion de integridad de artefactos: organizaciones que replican el registro pueden usar el esquema de SHA-256 por fichero, staging verificado y activacion atomica como plantilla para sus propios pipelines de distribucion de modelos.
- Auditoria de licencias de terceros: el repositorio conserva los textos completos de licencia en `licences/` y las atribuciones upstream en los packs descargados, lo que facilita la revision legal de dependencias.
- Despliegue en equipos sin GPU: la inferencia se ejecuta en el ordenador del usuario con CTranslate2, sin necesidad de aceleradores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio repositorio advierte que una verificacion de hash correcta no constituye validacion cientifica y que la calidad del modelo requiere evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El diseno declarado no usa GPU ni host de inferencia; el procesamiento es local en el equipo del usuario.
- GPU recomendadas: no aplica segun la documentacion disponible; no se menciona ningun acelerador.
- Compatibilidad con GPU de consumo: no disponible. El flujo esta pensado para ejecucion en CPU mediante CTranslate2.
- Almacenamiento: los packs opcionales grandes suman 575.203.220 bytes (aproximadamente 549 MiB); la dependencia VAD ocupa 1.245.151 bytes y se distribuye con el motor.
- Coste adicional de runtime: las librerias de aplicacion y de runtime nativo son independientes del almacenamiento de modelos y pueden ser sustanciales, en particular Torch.
- Opciones de despliegue: la aplicacion Reson, Faster-Whisper sobre CTranslate2 para transcripcion, SpeechBrain para ECAPA-TDNN y Silero VAD v6 como dependencia empaquetada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Naturaleza | Componentes | Licencia | Disponibilidad |
|---|---|---|---|---|
| Erbreta/Reson | Registro de modelos para una aplicacion local de fonetica forense | Whisper small (CTranslate2), ECAPA-TDNN VoxCeleb, Silero VAD v6 | Mixta: MIT y Apache-2.0 por componente; licencia del repositorio no indicada | Repositorio de HuggingFace con 0 descargas y 0 likes en el momento de la consulta |
| Systran/faster-whisper-small | Pack de inferencia ASR CTranslate2 | Whisper small | MIT | Pesos upstream referenciados por Reson; datos de rendimiento no disponibles en la informacion proporcionada |
| speechbrain/spkrec-ecapa-voxceleb | Modelo de embeddings de hablante | ECAPA-TDNN entrenado con VoxCeleb | Apache-2.0 | Pesos upstream referenciados por Reson; datos de rendimiento no disponibles en la informacion proporcionada |
| Silero VAD v6 (via Faster-Whisper) | Detector de actividad de voz | Modelo VAD ligero | MIT | Dependencia empaquetada con el motor; datos de rendimiento no disponibles |

No se dispone de datos comparativos de parametros, contexto o benchmarks entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un indice de pesos de terceros. Cualquier evaluacion de calidad debe hacerse sobre los componentes upstream, no sobre el repositorio.
- El propio repositorio senala que una comprobacion de hash correcta no equivale a validacion cientifica; la calidad requiere evaluacion independiente.
- No se declaran licencias, idiomas, pipeline ni parametros a nivel de repositorio; la licencia del conjunto no esta indicada y hay que revisarla componente a componente.
- Restricciones de sustitucion: los reemplazos de Whisper deben seguir siendo packs CTranslate2 multilingues y compatibles con arabe; la configuracion y dimensiones de ECAPA deben coincidir con la plantilla revisada.
- Los motores nuevos, cambios de version de dependencias, YAML ejecutable nuevo o slots de caracteristica desconocidos exigen una actualizacion de la aplicacion; el registro remoto no puede instalar Python, ejecutar scripts ni reescribir el codigo fuente.
- Requisito de verificacion manual: registrar un modelo implica calcular SHA-256 y tamanos exactos por fichero y conservar la atribucion de origen, con validacion previa del manifiesto.
- Riesgo de alucinacion de la transcripcion: no cuantificado en la informacion disponible, pero inherente a los sistemas ASR.
- Sesgos en el analisis de hablante: no documentados en la informacion proporcionada; conviene auditar el comportamiento de ECAPA-TDNN frente a variabilidad de canal, idioma y acento antes de usarlo en contextos forenses.
- Uso comercial: permitido en principio por las licencias MIT y Apache-2.0 de los componentes, pero la ausencia de licencia explicita del repositorio y las condiciones de atribucion upstream deben revisarse con detalle.
- Fecha de publicacion registrada en HuggingFace: 2026-10-05, con ultima actualizacion el 2026-10-05; conviene verificar la vigencia del registro antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Erbreta/Reson
- Pesos de transcripcion (upstream): https://huggingface.co/Systran/faster-whisper-small
- Pesos de analisis de hablante (upstream): https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Motor y VAD (upstream): https://github.com/SYSTRAN/faster-whisper
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo ni sobre la aplicacion Reson.
