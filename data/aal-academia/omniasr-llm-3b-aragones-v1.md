# AAL-Academia/omniasr-llm-3b-aragones-v1

## Resumen

omniasr-llm-3b-aragones-v1 es un modelo de reconocimiento automatico de voz (ASR) especializado en aragones, desarrollado por AAL-Academia (Academia Aragonesa de la Lengua) mediante ajuste fino del modelo base omniASR_LLM_3B_v2 de Meta. El sistema completo es un encoder-decoder de aproximadamente 4.380 millones de parametros (etiquetado comercialmente como "3B"), construido sobre la libreria fairseq2 y el proyecto omnilingual-asr. Su proposito es cubrir una lengua de bajos recursos como el aragones, que rara vez dispone de sistemas ASR de calidad.

El ajuste fino se realizo sobre la porcion en aragones de Common Voice Scripted Speech 25.0 (12,7 horas de entrenamiento, 30 hablantes), con dos GPU A100, tasa de aprendizaje 1e-5 y batch efectivo de 32, congelando el extractor convolucional de caracteristicas. El checkpoint seleccionado es el paso 4.750, elegido por WER de validacion. El modelo alcanza un WER del 4,34 % en el test interno de Common Voice y del 15,87 % en un pequeno conjunto de habla espontanea, lo que lo convierte en una referencia practica para la transcripcion de aragones.

Es relevante ahora porque demuestra que el ecosistema omnilingual de Meta es ajustable con presupuestos modestos a lenguas minoritarias, y porque publica una evaluacion honesta que separa el rendimiento sobre habla leida (Common Voice) del rendimiento sobre habla espontanea real, mucho mas dificil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (familia omniASR LLM, basada en fairseq2) |
| Parametros totales | 4.380.578.432 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (procesa segmentos de audio de 17-23 s en inferencia) |
| Tipos de cuantizacion | no disponible (no se ha publicado version cuantizada) |
| Idiomas soportados | aragones (codigo `an`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (libreria pytorch) |
| Tamano del repositorio | 8,8 GB |
| Entrada de audio | 16 kHz mono |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo pertenece a la familia omniASR LLM de Meta, un sistema encoder-decoder implementado con fairseq2. La etiqueta "3B" identifica la familia; el sistema completo (codificador mas descodificador) suma aproximadamente 4.380 millones de parametros. Se trata de la variante LLM estandar, no de la variante Unlimited. El ajuste fino congela el extractor convolucional de caracteristicas y entrena el resto del modelo.

Los datos de entrenamiento proceden de la particion en aragones de Common Voice Scripted Speech 25.0 (split v3): 10.264 clips (12,735 horas, 30 hablantes) en entrenamiento, 781 clips (0,997 horas, 6 hablantes) en desarrollo y 2.232 clips (3,010 horas, 15 hablantes) en test. Los identificadores de hablante son disjuntos entre particiones y se verifico que no hubiera rutas ni ficheros MP3 identicos repetidos entre splits. El ajuste fino uso dos GPU A100, tasa de aprendizaje 0,00001 y batch efectivo de 32. El checkpoint final es el paso 4.750, seleccionado por WER de desarrollo antes de disponer de las transcripciones de referencia de habla espontanea. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Transcripcion de voz a texto en aragones, con salida que puede incluir apostrofos y guiones.
- Procesamiento por lotes de audio convertido a 16 kHz mono.
- Manejo de grabaciones largas mediante segmentacion contigua de aproximadamente 17-23 segundos con cortes cerca de puntos de baja energia.
- Evaluacion sobre habla leida (Common Voice) y sobre habla espontanea (conjunto gold externo).
- No dispone de transcripcion en streaming segun la model card.
- Soporte de tool calling, function calling, agentes, vision, audio de entrada multimodal, thinking mode o capacidades multilingues adicionales: no disponible (el modelo es exclusivamente ASR en aragones).

## Casos de uso

- Transcripcion de corpus orales en aragones: el modelo convierte grabaciones de habla leida en texto con un WER del 4,34 % en el test interno de Common Voice, adecuado para digitalizar materiales linguisticos y alimentar archivos de la lengua.
- Archivo y documentacion de patrimonio oral: permite procesar entrevistas y grabaciones historicas por lotes (2 h 47 min de audio en unos 13 min en una RTX 3090), facilitando la indexacion y busqueda de contenido.
- Investigacion linguistica y dialectologia: la salida conserva acentos, apostrofos, guiones y repeticiones, lo que ayuda a estudiar variantes dialectales, aunque el autor advierte que no certifica la grafia ni la variedad.
- Subtitulado y transcripcion de medios audiovisuales en aragones: util para productores de contenido que necesiten borradores de subtitulos revisables por humanos.
- Herramientas de accesibilidad: transcripcion de clases, reuniones o actos publicos en aragones para generar actas y resumenes posteriores.
- Asistencia a la ensenanza de la lengua: generacion de transcripciones de referencia para materiales didacticos y ejercicios de comprension oral.
- Preprocesado para pipelines de NLP en aragones: convertir audio en texto para alimentar modelos de traduccion, analisis morfologico o construccion de corpus.

## Benchmarks y rendimiento

| Conjunto de evaluacion | WER (%) | CER (%) |
|---|---:|---:|
| Test interno Common Voice v3 (2.232 clips) | 4,34 | 1,11 |
| Subconjunto con frases ausentes de entrenamiento y desarrollo (1.417 clips) | 5,50 | 1,39 |
| Conjunto gold inicial de habla espontanea (7 grabaciones, 12 min 27 s) | 15,87 | 8,09 |
| Analisis de sensibilidad excluyendo una entrevista larga (6 grabaciones, 6 min 54 s) | 11,83 | 4,34 |

El test interno contiene identificadores de hablante no vistos en entrenamiento. El subconjunto de frases no vistas anade el requisito de que el texto de referencia no aparezca ni en entrenamiento ni en desarrollo. El conjunto gold de habla espontanea es una evaluacion inicial pequena, sin auditoria completa de alineacion temporal ni de concordancia palabra a palabra con el audio; la fila que excluye la entrevista larga es un analisis de sensibilidad post hoc, no un test final independiente. La normalizacion de puntuacion del conjunto gold externo difiere de la usada en Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo completo tiene 4.380 millones de parametros y el autor confirma que ha funcionado en una unica GPU RTX 3090 de 24 GB.
- GPU recomendadas: A100 (usadas en el ajuste fino) y RTX 3090 (validada para inferencia); otras GPU de 24 GB o mas son plausibles pero no estan documentadas.
- Cabe en GPU de consumo: si, al menos en RTX 3090 (24 GB).
- Opciones de despliegue: fairseq2 y omnilingual-asr; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni version cuantizada.
- Rendimiento: en un test con lotes de cuatro segmentos, transcribio 2 h 47 min de audio en aproximadamente 13 min en una RTX 3090, excluyendo la carga inicial del modelo. Esto mide throughput de procesamiento por lotes, no latencia de conversacion en vivo.
- El rendimiento en CPU no ha sido medido segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniasr-llm-3b-aragones-v1 | 4.380.578.432 | no disponible | aragones | Apache 2.0 | Hugging Face |
| omniASR_LLM_3B_v2 (Meta, base) | ~4,38 B (familia 3B) | no disponible | multilingue (familia omnilingual) | no disponible en la informacion | Hugging Face (referencia Steveeeeeeen/omniASR-LLM-3B) |
| Modelos ASR especificos para aragones | no disponible | no disponible | aragones | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos ASR para aragones en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento cae de forma notable en habla espontanea: WER del 15,87 % frente al 4,34 % en habla leida de Common Voice.
- El conjunto gold de habla espontanea es pequeno (7 grabaciones, 12 min 27 s) y no permite conclusiones firmes por dialecto ni por grupo de hablantes.
- Puede omitir palabras o pasajes, producir texto no respaldado por el audio o alterar formas dialectales; se observaron omisiones internas en la entrevista de Baitico.
- Las transcripciones automaticas requieren revision humana y no certifican la grafia ni la variedad linguistica empleada.
- No proporciona transcripcion en streaming.
- El rendimiento en CPU y una version cuantizada de esta distribucion no han sido evaluados.
- La normalizacion de puntuacion difiere entre el conjunto gold externo y Common Voice, lo que afecta la comparabilidad directa de las cifras.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, aunque el corpus de entrenamiento tiene solo 30 hablantes y procede de habla leida, lo que limita la diversidad de voces y registros.
- Licencia Apache 2.0 para el modelo y el codigo de distribucion; los corpus de origen tienen sus propios terminos de uso y no se redistribuyen en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAL-Academia/omniasr-llm-3b-aragones-v1
- Demo en Spaces: https://huggingface.co/spaces/Juanpabl/asr-aragones-demo
- Repositorio upstream omnilingual-asr: https://github.com/facebookresearch/omnilingual-asr
- Referencia del modelo base en Hugging Face: https://huggingface.co/Steveeeeeeen/omniASR-LLM-3B
