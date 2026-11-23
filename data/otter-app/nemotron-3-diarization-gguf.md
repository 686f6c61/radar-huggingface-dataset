# otter-app/nemotron-3-diarization-gguf

## Resumen

`otter-app/nemotron-3-diarization-gguf` es una distribucion en formato GGUF del modelo `nvidia/Nemotron-3-Diarization`, orientado a tareas de reconocimiento automatico de voz y diarizacion de hablantes. El repositorio lo publica el proyecto Otter, que empaqueta los pesos cuantizados que su aplicacion descarga bajo demanda. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia sin modificaciones del artefacto publicado originalmente en `vibe-app/nemotron-3-diarization-gguf`, a su vez convertido desde el modelo base de NVIDIA.

El modelo cuenta con 99.226.504 parametros (aproximadamente 99 millones), lo que lo situa en la categoria de modelos ligeros de audio, adecuados para inferencia en CPU o GPU de gama baja. El repositorio ocupa 0,1 GB y se distribuye en formato GGUF con cuantizacion Q8_0, pensado para su uso con la libreria ggml. Su relevancia actual radica en que permite ejecutar localmente una tarea de diarizacion (identificar quien habla y cuando) sin depender de servicios en la nube.

La informacion disponible sobre el modelo es muy limitada: la model card no detalla arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de benchmarks. La licencia declarada es `openmdw-1.1`, marcada como "other" en los metadatos de Hugging Face, por lo que conviene revisar los terminos upstream antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 99.226.504 (aprox. 99 M) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (declarada como "other" en Hugging Face) |
| Formato de pesos | GGUF (libreria ggml) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base es `nvidia/Nemotron-3-Diarization`, del que no se detallan en este repositorio ni el tipo de red (transformer, conformer, etc.), ni el numero de capas, ni la estrategia de atencion. Tampoco se especifican los datos de entrenamiento, el volumen de horas de audio utilizadas, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO.

La unica innovacion tecnica documentada es la conversion a formato GGUF con cuantizacion Q8_0 para su ejecucion mediante ggml, lo que habilita inferencia local eficiente en hardware modesto. El repositorio incluye el hash SHA-256 del fichero `nemotron-3-diarization-Q8_0.gguf` (`a25f026847d765c8661fd5095c73a0e5f20d310dcb8249c654e3828592a2fc73`), util para verificar la integridad de la descarga.

## Capacidades

- Reconocimiento automatico de voz (ASR): el pipeline declarado es `automatic-speech-recognition`.
- Diarizacion de hablantes: el nombre del modelo indica capacidad para segmentar audio por hablante, aunque no se detalla el mecanismo ni la precision.
- Ejecucion local mediante ggml/GGUF: disenado para integrarse en aplicaciones de escritorio que descargan el modelo bajo demanda, como la app Otter.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio generativo ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones con identificacion de participantes: el modelo puede procesar el audio de una reunion y etiquetar que segmentos corresponden a cada hablante, aprovechando su tamano reducido para ejecutarse localmente en el equipo del usuario.
- Generacion de subtitulos con etiquetas de hablante: en la produccion de subtitulos para video, permite anadir marcas de quien habla en cada intervencion, util para accesibilidad y para contenido con multiples locutores.
- Analisis de entrevistas y grupos focales: en investigacion cualitativa, facilita separar las intervenciones de entrevistador y entrevistados para su posterior transcripcion y codificacion.
- Actas automaticas de reuniones: integrado en la app Otter, el modelo se descarga bajo demanda y permite construir actas con atribucion de intervenciones sin enviar audio a servidores externos.
- Procesamiento de grabaciones de atencion al cliente: permite separar la voz del agente y del cliente en llamadas grabadas para auditoria de calidad y analisis de conversaciones.
- Herramientas de accesibilidad en tiempo real: en aplicaciones de transcripcion en directo, la diarizacion ayuda a sordos y personas con dificultades auditivas a seguir conversaciones con varios interlocutores.
- Pipelines de investigacion en procesamiento de audio: al ser un GGUF ligero, sirve como componente de diarizacion en prototipos que se ejecutan en CPU o en GPU de gama baja sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 99 M de parametros en Q8_0, el fichero ronda los 0,1 GB, por lo que la huella de memoria es minima (del orden de cientos de MB incluyendo buffers de inferencia); no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles. Por tamano, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs integradas.
- Cabe en GPU consumer: si, con margen amplio, dado el reducido numero de parametros.
- Opciones de despliegue: ggml (libreria declarada); integracion en la app Otter. No se documenta soporte explicito para vLLM, TGI, llama.cpp u Ollama, aunque el formato GGUF es compatible con el ecosistema ggml.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de diarizacion, ya que no se han publicado benchmarks ni especificaciones detalladas del modelo base. La tabla siguiente recoge unicamente los datos conocidos del modelo frente a la ausencia de datos de posibles alternativas.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| otter-app/nemotron-3-diarization-gguf | 99 M | no disponible | openmdw-1.1 | GGUF |
| Alternativas de diarizacion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta arquitectura, datos de entrenamiento, idiomas ni evaluacion, lo que dificulta valorar su calidad antes de usarlo.
- Riesgo de alucinacion y errores de atribucion de hablante: no se han publicado tasas de error de diarizacion (DER) ni de transcripcion (WER), por lo que no puede estimarse su fiabilidad en produccion.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos por acento, idioma, genero o edad.
- Idiomas soportados no disponibles: no puede confirmarse el soporte multilingue ni el rendimiento fuera del ingles.
- Licencia `openmdw-1.1` declarada como "other": es imprescindible revisar los terminos upstream del modelo base `nvidia/Nemotron-3-Diarization` antes de un uso comercial.
- El repositorio es una copia de otro repositorio (`vibe-app/nemotron-3-diarization-gguf`); conviene verificar la procedencia y el hash SHA-256 publicado antes de desplegarlo.
- Solo se ofrece cuantizacion Q8_0: no hay variantes Q4, Q5 ni FP16 en este repositorio, lo que limita el ajuste fino entre calidad y consumo de memoria.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en la comunidad que permita validar su comportamiento en escenarios reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/otter-app/nemotron-3-diarization-gguf
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Repositorio de origen de la conversion: https://huggingface.co/vibe-app/nemotron-3-diarization-gguf
- Aplicacion Otter: https://github.com/victorfu/otter
