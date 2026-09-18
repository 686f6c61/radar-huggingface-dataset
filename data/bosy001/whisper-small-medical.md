# bosy001/whisper-small-medical

# bosy001/whisper-small-medical

## Resumen

`bosy001/whisper-small-medical` es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla Whisper small de OpenAI, publicado por el usuario bosy001 en HuggingFace. El repositorio contiene pesos en formato safetensors con 241.734.912 parametros, lo que lo situa en la categoria de modelos ASR compactos: suficiente para transcribir audio con calidad razonable en hardware de consumo, pero muy lejos de los modelos large de la misma familia. El nombre del modelo indica una especializacion en dominio medico, aunque la ficha de HuggingFace no documenta el corpus de entrenamiento, el procedimiento seguido ni los idiomas cubiertos.

La relevancia de este tipo de publicaciones es practica: los fine-tunes de Whisper small son baratos de entrenar y de desplegar, y un modelo especializado en terminologia clinica puede reducir la tasa de error en jerga medica frente al modelo generico. Sin embargo, el repositorio carece de model card, licencia declarada, pipeline y metadatos de idioma, y acumula 77 descargas y 0 likes desde su publicacion, lo que obliga a validarlo internamente antes de cualquier uso real.

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder secuencial que consume espectrogramas mel de 80 canales en ventanas de 30 segundos. El unico artefacto de entrenamiento visible es la etiqueta `tensorboard`, que indica que el autor subio registros de entrenamiento al repositorio, aunque no se han extraido ni publicado sus hiperparametros en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo Whisper; 12 capas de encoder, 12 capas de decoder, d_model 768, 12 cabezas de atencion |
| Parametros totales | 241.734.912 (dato real de los pesos en safetensors) |
| Longitud de contexto | Audio: ventana de 30 s (1500 frames, 80 canales mel). Texto: maximo 448 tokens de decoder. Valores heredados del Whisper base; no confirmados en la ficha del repositorio |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible; el modelo base Whisper small es multilingue, pero no se especifica que idiomas conserva este fine-tune |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 11,6 GB |
| Descargas | 77 |
| Likes | 0 |
| Fecha de publicacion | 2026-09-18 (segun HuggingFace) |
| Ultima actualizacion | 2026-09-19 (segun HuggingFace) |
| Etiquetas declaradas | tensorboard, safetensors, whisper, region:us |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado con supervision debil sobre pares audio-transcripcion a gran escala. El encoder procesa una representacion log-Mel de 80 canales calculada en ventanas de 30 segundos, con dos capas convolucionales de preprocesado y embeddings posicionales sinusoidales. El decoder genera texto de forma autoregresiva con atencion cruzada sobre el encoder y un maximo de 448 tokens, e incorpora tokens especiales de tarea (transcripcion o traduccion), marca de idioma y prediccion de marcas temporales. La variante small, sobre la que se construye este repositorio, tiene 12 capas en cada bloque y aproximadamente 242 millones de parametros, frente a los 244 millones que reporta la documentacion oficial de OpenAI para el modelo.

La informacion disponible no permite determinar como se realizo el ajuste fino: se desconoce el corpus medico empleado, el numero de horas de audio, la composicion del dataset, si se partio de `openai/whisper-small` o de un checkpoint intermedio, si se aplico full fine-tuning o algun metodo parametro-eficiente tipo LoRA, y si hubo etapas de RLHF, DPO o similar. La presencia de la etiqueta `tensorboard` sugiere que en el repositorio hay registros de entrenamiento con curvas de perdida y posibles hiperparametros, pero esos datos no forman parte de la informacion proporcionada. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal o destilacion).

## Capacidades

- Transcripcion de voz a texto en el dominio para el que fue ajustado, presumiblemente audio clinico o medico.
- Prediccion de marcas temporales a nivel de segmento, heredada del formato de entrenamiento multitarea de Whisper.
- Traduccion de voz a texto, si el fine-tune conserva la tarea de traduccion del modelo base; no confirmado.
- Deteccion de idioma mediante el token de idioma del decoder, si la capacidad no se ha degradado durante el ajuste; no confirmado.
- Procesamiento de audio largo mediante fragmentacion en ventanas de 30 segundos y concatenacion posterior.
- Soporte de tool calling o function calling: no.
- Soporte de agentes o razonamiento multi-paso: no, es un modelo puramente de reconocimiento del habla.
- Capacidades multilingues: no disponibles; dependen de si el ajuste fino fue monolingue o multilingue.
- Capacidades de vision o audio-vision: no, solo audio.
- Modo de razonamiento explicito (thinking): no.

## Casos de uso

- Dictado clinico asistido: transcripcion de notas de consulta grabadas por el facultativo, con el objetivo de que un profesional revise y firme el texto antes de incorporarlo a la historia clinica. El modelo es adecuado por tamano (se ejecuta en una GPU de consumo o incluso en CPU) y por la especializacion declarada en vocabulario medico.
- Generacion de borradores de informes radiologicos o de laboratorio: transcripcion de dictados cortos que despues se procesan con un LLM para estructurar el informe; el ASR se encarga de la parte acustica y el LLM de la normalizacion.
- Subtitulado de sesiones clinicas, congresos medicos o material formativo: con marcas temporales por segmento y ventanas de 30 segundos, encaja bien en pipelines de generacion de subtitulos para plataformas internas.
- Etiquetado y anotacion de corpus de audio sanitario: uso como preanotador en un flujo de anotacion humana, reduciendo el coste de transcripcion manual de entrevistas, ensayos clinicos o llamadas de triaje, siempre con revision posterior.
- Analitica de llamadas en centros de salud o aseguradoras: transcripcion batch de conversaciones para extraer motivos de consulta, tiempos de espera o incidencias; el modelo es lo bastante ligero para procesar volumen alto en paralelo.
- Prototipado e investigacion en ASR biomedico: servir como linea base sobre la que comparar fine-tunes propios, dado su tamano reducido y su coste de inferencia bajo.
- Transcripcion en entornos con recursos limitados: consultas rurales, dispositivos edge o portatiles sin GPU dedicada, donde un modelo de 242 millones de parametros es viable en cuantizacion reducida.
- Investigacion sobre degradacion multilingue: evaluar como un ajuste de dominio estrecho afecta a la capacidad multilingue del Whisper original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay valores de WER (word error rate), MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni comparaciones con `openai/whisper-small` o con otros fine-tunes medicos. Cualquier cifra de calidad usada para decidir su adopcion tendria que generarse internamente sobre un conjunto de validacion representativo del dominio objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32, 0,5 GB en fp16/bf16 y 0,25 GB en int8 para los pesos. Sumando activaciones y buffers de audio, el consumo total se mantiene por debajo de 2 GB en la mayoria de configuraciones.
- GPU recomendadas: practicamente cualquier GPU moderna sirve. Una RTX 3050, RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura; una RTX 4090 permite lotes grandes y transcripcion en paralelo. No se necesitan A100 ni H100 salvo para despliegues de alto throughput con lotes muy grandes.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM, y tambien en Apple Silicon mediante Metal.
- Ejecucion en CPU: viable. Con 242 millones de parametros es un modelo apto para inferencia en CPU, especialmente en cuantizacion int8 y con backends optimizados.
- Opciones de despliegue: `transformers` (pipeline de automatic-speech-recognition), faster-whisper sobre CTranslate2, whisper.cpp / GGML, WhisperX para diarizacion y alineacion, endpoints gestionados de HuggingFace y servidores propios con batching. vLLM incluye soporte para modelos Whisper, aunque el ecosistema ASR esta mas maduro en faster-whisper y whisper.cpp; TGI no esta orientado a modelos ASR.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este fine-tune concreto, y las cifras del Whisper small generico dependen fuertemente del backend, la cuantizacion y la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bosy001/whisper-small-medical | 241,7 M | 30 s | no disponible | no disponible | HuggingFace, 77 descargas |
| openai/whisper-small | ~244 M | 30 s | multilingue (~99 idiomas) | Apache-2.0 | HuggingFace, ampliamente desplegado |
| openai/whisper-base | ~74 M | 30 s | multilingue (~99 idiomas) | Apache-2.0 | HuggingFace |
| openai/whisper-medium | ~769 M | 30 s | multilingue (~99 idiomas) | Apache-2.0 | HuggingFace |
| distil-whisper/distil-small.en | ~166 M | 30 s | solo ingles | MIT | HuggingFace |

No hay datos de rendimiento comparado (WER) para el modelo evaluado. La comparacion se limita a parametros, ventana de contexto, cobertura idiomatica y licencia. Frente al Whisper small original, la ventaja potencial del fine-tune es la precision en terminologia medica; sus desventajas confirmadas son la ausencia de licencia, de model card y de cualquier validacion publica.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, idiomas, metricas ni limitaciones. La validacion recae por completo en quien lo adopte.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. Aunque el modelo base Whisper se distribuye bajo Apache-2.0, el fine-tune no hereda automaticamente esa declaracion, por lo que el uso en produccion es juridicamente ambiguo hasta que el autor lo aclare.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible que no corresponde al audio, especialmente con silencios, ruido de fondo, musica o habla muy solapada. En dominio clinico esto es especialmente peligroso porque puede producir terminos medicos incorrectos con apariencia verosimil.
- No es un producto sanitario: no hay evidencia de validacion clinica, marcado CE ni aprobacion regulatoria. No debe usarse para diagnostico, dosificacion o decisiones terapeuticas sin supervision profesional.
- Riesgo de sobreajuste de dominio: si el ajuste se hizo sobre un corpus limitado (una especialidad, un acento o un unico centro), el rendimiento puede degradarse notablemente fuera de esa distribucion, incluyendo acentos distintos o audio telefónico.
- Posible olvido catastrofico: un fine-tune de dominio estrecho puede degradar la transcripcion generalista, la traduccion y la deteccion de idioma del modelo original. No hay evaluaciones que lo confirmen o desmientan.
- Incertidumbre sobre idiomas: si el ajuste se hizo solo en castellano o solo en ingles, el modelo puede fallar o inventar texto en otros idiomas en lugar de transcribir correctamente.
- Trazabilidad limitada: 0 likes y 77 descargas indican que el modelo no ha sido revisado por la comunidad. No se conocen autores, afiliacion ni historial del repositorio.
- Proteccion de datos: el uso con audio de pacientes implica datos de categoria especial bajo el RGPD. Cualquier despliegue debe contemplar seudonimizacion, cifrado, control de acceso y, segun jurisdiccion, cumplimiento de normativa equivalente como HIPAA.
- Fechas de publicacion inusuales: el repositorio figura como publicado y actualizado en septiembre de 2026, lo que dificulta interpretar su antiguedad relativa y su historial de mantenimiento.
- Contenido del repositorio: 11,6 GB para un modelo de 242 millones de parametros sugiere la presencia de checkpoints intermedios y registros de TensorBoard, no solo los pesos finales. Conviene inspeccionar el repositorio antes de descargarlo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bosy001/whisper-small-medical
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- WhisperX: https://github.com/m-bain/whisperX
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces obtenidos pertenecian a la plataforma Hack The Box y no guardan relacion con el modelo.
