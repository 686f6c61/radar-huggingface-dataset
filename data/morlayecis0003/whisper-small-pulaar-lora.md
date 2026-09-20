# morlayecis0003/whisper-small-pulaar-lora

## Resumen

`morlayecis0003/whisper-small-pulaar-lora` es un adaptador LoRA sobre el modelo de reconocimiento automatico del habla (ASR) `openai/whisper-small` de OpenAI, entrenado para transcribir **pulaar** (fulfulde), una lengua que no forma parte de las 112 cubiertas oficialmente por Whisper. El autor es el usuario de HuggingFace `morlayecis0003`, y la publicacion se realizo el 19 de septiembre de 2026 segun los metadatos de la plataforma.

El modelo no es un modelo completo, sino un conjunto de pesos incrementales en formato PEFT/LoRA (`library_name: peft`) que se cargan sobre el checkpoint base de Whisper Small. La model card esta redactada en frances y documenta un corpus de 28,4 horas de voz en pulaar tras limpieza, con eliminacion de 3.643 ficheros WAV vacios, deduplicacion entre subcorpus y divisiones (splits) construidas sin fuga de locutor ni de transcripcion. La innovacion principal es metodologica: al no existir un token de idioma dedicado para pulaar, el autor selecciono empiricamente el token `ha` (hausa) entre 11 configuraciones evaluadas.

Su relevancia es la de un artefacto de investigacion en el ambito de ASR para lenguas de bajos recursos: demuestra que un adaptador LoRA de bajo coste puede extender Whisper a una lengua no soportada usando decenas de horas de audio. No obstante, el repositorio presenta 0 descargas y 0 likes, y el tamano declarado del repo es de 0.0 GB, por lo que conviene verificar que los ficheros del adaptador estan efectivamente subidos antes de intentar usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo seq2seq (arquitectura Whisper), con adaptadores LoRA sobre el modelo base `openai/whisper-small` |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base `openai/whisper-small` tiene del orden de 244 millones de parametros, segun la documentacion publica de OpenAI); el numero de parametros entrenables del adaptador LoRA no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos por inferencia (caracteristica de la arquitectura Whisper); la model card no especifica otra configuracion |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. El adaptador se distribuye en `safetensors`; el modelo base admite cuantizacion por separado |
| Idiomas soportados | Pulaar (fulfulde) como lengua objetivo del adaptador. El token de idioma empleado es `ha` (hausa), elegido empiricamente entre 11 configuraciones. Whisper Small soporta 112 lenguas de forma nativa, pero el pulaar no esta entre ellas |
| Licencia | apache-2.0 |
| Formato de pesos | `safetensors` (adaptador LoRA, libreria `peft`) |
| Modelo base | `openai/whisper-small` |
| Tipo de adaptacion | LoRA mediante PEFT (`library_name: peft`, tags `peft`, `lora`, `asr`) |
| Datos de entrenamiento | 28,4 horas de voz en pulaar tras limpieza; 3.643 ficheros WAV vacios descartados; deduplicacion entre subcorpus; splits sin fuga de locutor ni de transcripcion |
| Numero de locutores | Aproximadamente 10 locutores distintos en el corpus de entrenamiento |
| Tamano del repositorio | 0.0 GB segun los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder entrenado por OpenAI para tareas de ASR y traduccion de voz, que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. Sobre ese backbone se aplica una adaptacion de bajo rango (LoRA) que congela los pesos originales e introduce matrices de bajo rango entrenables. Este esquema reduce de forma drastica el coste de ajuste y el tamano del artefacto resultante, que se distribuye como un unico conjunto de pesos PEFT en `safetensors`.

En cuanto a los datos, la model card reporta 28,4 horas de habla en pulaar despues de un proceso de limpieza que incluyo la eliminacion de 3.643 ficheros WAV vacios, la deduplicacion entre subcorpus y la construccion de splits sin fuga de locutor ni de transcripcion. La innovacion tecnica destacable es la seleccion del token de idioma: dado que Whisper no dispone de un token para pulaar, el autor probo 11 configuraciones y retuvo `ha` (hausa) como la mas eficaz, condicion que debe respetarse en la llamada a `generate`. No se especifica en la informacion disponible si se aplicaron tecnicas adicionales como RLHF, DPO, decodificacion especulativa, attention lineal o aumentacion de datos.

## Capacidades

- Transcripcion de voz a texto en pulaar (fulfulde) mediante decodificacion condicionada al token de idioma `ha`.
- Reconocimiento de habla sobre ventanas de 30 segundos propias de la arquitectura Whisper.
- Reutilizacion de las capacidades multilingues del modelo base, ya que los pesos de `openai/whisper-small` permanecen congelados bajo el adaptador.
- Carga como adaptador PEFT sobre el checkpoint base, sin necesidad de sustituir el modelo completo.
- Integracion con el ecosistema `transformers` (`WhisperProcessor`, `WhisperForConditionalGeneration`) y `librosa` para la carga de audio a 16 kHz.
- No se documenta soporte de tool calling ni de function calling (no aplica a un modelo ASR).
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de traduccion, vision, audio understanding mas alla de ASR ni modo de razonamiento explicito.
- La transcripcion de voz esta limitada a la tarea `transcribe` (`task="transcribe"` en el ejemplo de uso).

## Casos de uso

- Transcripcion de emisiones de radio comunitaria en pulaar: el modelo puede procesar audio en tramos de 30 segundos y generar transcripciones para archivos sonoros que hoy carecen de texto buscable, aprovechando que el adaptador esta entrenado especificamente sobre 28,4 horas de esta lengua.
- Recopilacion de datos en trabajo de campo de ONG y proyectos de desarrollo: entrevistas y encuestas orales registradas en zonas fulfuldehablantes pueden transcribirse sin depender de servicios comerciales que no cubren el pulaar.
- Documentacion linguistica y construccion de corpus: el adaptador permite generar transcripciones preliminares que despues se revisan manualmente, acelerando la creacion de corpus anotados para una lengua de bajos recursos.
- Subtitulado de contenido audiovisual en pulaar: integrado en un pipeline de `transformers` + `peft`, se puede segmentar el audio en ventanas de 30 segundos, transcribir y exportar a SRT para videos educativos o divulgativos.
- Atencion ciudadana y servicios publicos en zonas donde se habla pulaar: transcripcion de llamadas o notas de voz para su posterior indexacion y busqueda, siempre que se acepte la supervision humana por las limitaciones de precision.
- Asistente de voz para aplicaciones de salud o agricultura: cadena ASR (este adaptador) mas un modulo de comprension o traduccion posterior, orientada a consultas sencillas en pulaar.
- Evaluacion comparativa de adaptadores LoRA en ASR de bajos recursos: el repositorio sirve como punto de partida reproducible para experimentos de fine-tuning con PEFT sobre Whisper en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER) ni de caracter (CER) sobre conjuntos de prueba, ni comparaciones cuantitativas con otros sistemas. Tampoco se documentan metricas de latencia o throughput. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia sobre un conjunto de test independiente, preferiblemente con locutores no presentes en el corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base `openai/whisper-small` ocupa del orden de 1 GB en precision fp16 y aproximadamente 0,5-1 GB en int8; con activaciones y buffers de decodificacion, es razonable reservar entre 2 y 4 GB de VRAM. Se trata de una estimacion derivada del tamano del modelo base, no de un dato publicado por el autor.
- El adaptador LoRA en si es un artefacto muy pequeno (tipicamente decenas de MB como maximo) y no altera de forma apreciable estos requisitos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090, GTX 1660 con 6 GB). En el lado profesional, A100 o H100 resultan sobredimensionadas para inferencia de un solo flujo, aunque utiles para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: si. Incluso es viable en CPU con implementaciones optimizadas, aunque con mayor latencia.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), y `faster-whisper` / CTranslate2 previa fusion del adaptador con el modelo base. `Ollama` y `llama.cpp` requieren conversion a GGUF del modelo fusionado con el adaptador. No se documenta compatibilidad directa con vLLM o TGI para este adaptador concreto.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Soporte de pulaar | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `morlayecis0003/whisper-small-pulaar-lora` | Adaptador LoRA sobre Whisper Small; parametros entrenables no especificados | Ventanas de 30 s de audio | Si, via adaptador (token `ha`) | apache-2.0 | HuggingFace, 0 descargas |
| `openai/whisper-small` (base) | Del orden de 244 millones | Ventanas de 30 s de audio | No; 112 lenguas nativas sin pulaar | MIT (modelo base de OpenAI) | Ampliamente disponible |
| `openai/whisper-base` (base) | Del orden de 74 millones | Ventanas de 30 s de audio | No | MIT | Ampliamente disponible |
| Alternativas ASR especificas para pulaar | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

No se dispone de datos verificados en la informacion proporcionada sobre otros modelos ASR ajustados especificamente para pulaar, por lo que no es posible establecer una comparacion de rendimiento (WER/CER) entre alternativas.

## Limitaciones y advertencias

- El corpus de entrenamiento contiene aproximadamente 10 locutores distintos. La generalizacion a voces nuevas es limitada y, segun la propia model card, se mide de forma separada; los resultados sobre hablantes fuera del corpus no estan publicados.
- El token de idioma `ha` (hausa) es una solucion empirica, no una representacion nativa del pulaar. Esto puede introducir sesgos foneticos y lexicos heredados del hausa en la decodificacion.
- No se han publicado metricas de calidad (WER/CER) ni resultados de benchmarks, por lo que no es posible estimar la precision real en produccion.
- Los modelos de la familia Whisper son propensos a la alucinacion en segmentos con ruido, silencio o musica, generando texto repetido o inventado. No se documenta ningun mecanismo de mitigacion especifico en este adaptador.
- El alcance es exclusivamente ASR: no hay soporte de traduccion, comprension de audio, tool calling ni agentes.
- El tamano declarado del repositorio es de 0.0 GB y cuenta con 0 descargas, lo que sugiere que el adaptador podria no estar efectivamente subido. Es imprescindible verificar la presencia de `adapter_model.safetensors` y `adapter_config.json` antes de planificar cualquier uso.
- No se especifica si el tokenizador o el processor requieren modificaciones; el ejemplo de uso emplea el processor original de `openai/whisper-small`.
- La licencia del adaptador es apache-2.0, pero conviene revisar la licencia del modelo base (`openai/whisper-small`, publicada bajo terminos MIT por OpenAI) antes de un uso comercial.
- No se documentan sesgos demograficos especificos, pero la diversidad de voces del corpus (10 locutores) es muy reducida para garantizar equidad entre dialectos del pulaar, genero o edad.
- Las fechas de creacion y actualizacion de los metadatos (2026) y la ausencia de documentacion adicional impiden verificar el estado de mantenimiento del proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/morlayecis0003/whisper-small-pulaar-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Libreria PEFT: https://github.com/huggingface/peft

Nota: los unicos resultados devueltos por la busqueda web han sido enlaces al traductor de Microsoft/Bing (https://www.bing.com/translator y variantes), que no guardan relacion con el modelo y no se incluyen como referencias tecnicas. No se han encontrado papers, blogs o demos asociados al modelo en la informacion disponible.
