# Mannon/uzbek_stt_v1

## Resumen

Mannon/uzbek_stt_v1 es un modelo de reconocimiento automatico del habla (ASR) especializado en uzbek, obtenido por fine-tuning de openai/whisper-medium (769 M de parametros) por parte del equipo que la model card identifica como Kotibai & Rubai Team. Está publicado en HuggingFace bajo el identificador Mannon/uzbek_stt_v1, aunque la propia model card y los ejemplos de codigo hacen referencia al repositorio como Kotib/uzbek_stt_v1 y al nombre interno whisper-medium-uz-v1; conviene tener en cuenta esa discrepancia al descargar los pesos.

El modelo resuelve un problema muy concreto: la transcripcion de audio en uzbek, un idioma con cobertura limitada en los modelos multilingues genericos. El autor declara un entrenamiento sobre aproximadamente 1.600 horas de audio en uzbek, con script latino (incluyendo prestamos del ruso transliterados, como "brat", "davay" o "prosto"), y unos resultados de WER global del 16,7 % y CER del 7,0 % sobre 1.864 muestras de 8 conjuntos de prueba distintos.

Es relevante ahora porque cubre un hueco de idioma escasamente atendido por los modelos ASR comerciales y multilingues, y lo hace con una licencia Apache 2.0 y un tamano (763.857.920 parametros reales en safetensors, 3,1 GB de repositorio) que permite desplegarlo en GPU de consumo e incluso en CPU con cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper, openai/whisper-medium) |
| Parametros totales | 763.857.920 (segun safetensors); la model card cita 769 M para el modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s y contexto de decodificacion de 448 tokens, heredados de Whisper; el pipeline admite chunking con chunk_length_s=30 para audio largo |
| Tipos de cuantizacion | No disponible en el repositorio (pesos publicados en BF16); no se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | uzbek (uz), script latino; maneja prestamos rusos transliterados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | openai/whisper-medium |
| Datos de entrenamiento | ~1.600 h de audio en uzbek (725 h + 394 h + 474 h en tres etapas) |
| Precision de entrenamiento | BF16 |
| Tamano del repositorio | 3,1 GB |
| Pipeline declarado | automatic-speech-recognition |
| Etiquetas adicionales | endpoints_compatible (compatible con Inference Endpoints) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper en su variante medium: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI para transcripcion y traduccion multilingue sobre ventanas de audio de 30 segundos y con un decodificador de 448 tokens de contexto. No se introducen modificaciones estructurales respecto al modelo base: el trabajo del autor se centra en la adaptacion al uzbeko.

El entrenamiento se realizo en tres etapas con aprendizaje por curriculo, segun la model card: una fase de base (Foundation) con 725 horas, una fase de robustez (Robustness) con 394 horas y una fase de adaptacion de dominio (Domain Adaptation) con 474 horas, lo que suma aproximadamente 1.593 horas de audio y coincide con las ~1.600 horas declaradas. La model card no detalla la composicion exacta de cada subconjunto, ni si se aplicaron tecnicas de aumento de datos, RLHF o DPO; se limita a indicar que existe una categoria de evaluacion para audio ruidoso o aumentado (Noisy/Augmented) y otra para dialectos, lo que sugiere que el conjunto de entrenamiento incorpora variedad acustica y dialectal. La precision de entrenamiento fue BF16.

## Capacidades

- Transcripcion de voz a texto en uzbek (tarea transcribe) con salida en script latino.
- Manejo de prestamos lexicos del ruso en script latino, frecuentes en el habla real uzbeka.
- Procesamiento de audio ruidoso o aumentado, con degradacion controlada declarada por el autor.
- Cobertura de variantes dialectales del uzbeko, evaluada de forma separada en la model card.
- Compatible con el pipeline `automatic-speech-recognition` de transformers y con `chunk_length_s=30` para audios de duracion arbitraria.
- Integracion con Inference Endpoints de HuggingFace segun la etiqueta endpoints_compatible.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generation ni modo de razonamiento explicito: las capacidades se limitan al ASR.
- No se declara traduccion a otros idiomas (la model card solo menciona transcripcion en uzbek).

## Casos de uso

- Transcripcion de reuniones y notas de voz en uzbek: con chunking a 30 s se pueden procesar conversaciones largas y obtener texto plano apto para actas o resumenes posteriores con un LLM.
- Subtitulado de contenido audiovisual uzbeko: el modelo genera transcripciones con marcas temporales a nivel de segmento (utilizando `return_timestamps` en el pipeline), adecuadas para plataformas de video y television.
- Asistentes de voz y dictado en uzbek: al ser un modelo de 769 M de parametros, puede ejecutarse en la misma maquina que el resto del asistente y responder con latencias compatibles con interaccion en tiempo casi real.
- Atencion al cliente en call centers: transcripcion masiva de llamadas en uzbek para su posterior analisis de calidad, busqueda de palabras clave o clasificacion automatica de incidencias.
- Documentacion clinica o legal dictada: transcripcion de dictados profesionales en uzbek como paso previo a la revision humana, con un CER declarado del 7 % que reduce el esfuerzo de correccion.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones a escala sobre grabaciones de campo, con la posibilidad de revisar el WER por dialecto declarado (16-25 %) para segmentar la revision manual.
- Accesibilidad: subtitulado automatico de videocharlas, clases y eventos en uzbek para personas con discapacidad auditiva.
- Moderacion de contenido en audio: transcripcion previa a un clasificador de texto para detectar contenido problematico en plataformas con audiencia uzbeka.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. Los resultados estan marcados como `verified: false`, es decir, no han sido validados de forma independiente.

| Metrica | Valor |
|---|---|
| WER global (Overall WER) | 16,7 % |
| CER global (Overall CER) | 7,0 % |

Desglose por categoria publicado en la model card (mismo conjunto de evaluacion, 1.864 muestras en 8 conjuntos de prueba):

| Categoria | WER |
|---|---|
| Global (Overall) | 16,7 % |
| Habla limpia (Clean Speech) | ~6-11 % |
| Ruido o audio aumentado (Noisy/Augmented) | ~12-24 % |
| Dialectos (Dialects) | ~16-25 % |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos ASR sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 1,5 GB, mas los estados del optimizador y buffers del runtime; en la practica cabe en 2-3 GB de VRAM con lotes pequenos.
- Cuantizado a INT8: en torno a 0,8 GB; a INT4, en torno a 0,4 GB (no se publican conversiones oficiales, requeriria convertir los pesos).
- GPU de consumo: si, cabe en RTX 3060, RTX 4060, RTX 2070 o superiores; funciona tambien en GPUs con 4-6 GB de VRAM siempre que se ajuste el tamano de lote.
- GPU de datacenter: A100, H100, L40S o similares son utiles para procesamiento por lotes de gran volumen, no por requisitos de memoria.
- CPU: viable para transcripcion offline mediante conversiones a CTranslate2 (faster-whisper) o whisper.cpp, con una penalizacion de latencia notable frente a GPU.
- Opciones de despliegue: pipeline de transformers, servidor TGI o vLLM para servir el modelo en formato transformers, Inference Endpoints (etiqueta endpoints_compatible), y conversiones a CTranslate2 o GGUF para entornos ligeros. No se documentan conversiones oficiales a GGUF ni a CTranslate2 en el repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos sobre el mismo conjunto de evaluacion uzbeko, por lo que la comparacion se limita a caracteristicas objetivas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mannon/uzbek_stt_v1 (este modelo) | 763,9 M | 30 s de audio, 448 tokens de decodificador | uz | Apache 2.0 | HuggingFace (transformers, safetensors) |
| openai/whisper-medium | 769 M | 30 s de audio, 448 tokens de decodificador | 99 idiomas (uz incluido) | Apache 2.0 | HuggingFace, OpenAI |
| openai/whisper-large-v3 | 1.550 M | 30 s de audio, 448 tokens de decodificador | 99 idiomas (uz incluido) | Apache 2.0 | HuggingFace, OpenAI |
| openai/whisper-small | 244 M | 30 s de audio, 448 tokens de decodificador | 99 idiomas (uz incluido) | Apache 2.0 | HuggingFace, OpenAI |

El argumento de este modelo frente a los Whisper originales es la especializacion en uzbeko: los modelos base son multilingues y no publican WER especifico para uzbek, mientras que este fine-tuning declara un 16,7 % de WER global. Frente a whisper-large-v3, la ventaja es el menor coste de inferencia (aproximadamente la mitad de parametros); la desventaja es que no se dispone de una comparacion directa de calidad en uzbek. No se conocen en la informacion disponible otros fine-tunings de uzbeko comparables.

## Limitaciones y advertencias

- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false`, por lo que proceden unicamente del autor.
- Degradacion con ruido: la propia model card indica peor rendimiento en audio muy ruidoso; el WER declarado sube al rango 12-24 % en la categoria Noisy/Augmented.
- Variabilidad dialectal: el WER en dialectos se situa en el rango 16-25 %, sensiblemente por encima del global.
- Code-switching: el modelo puede tener dificultades con mezcla intensa de idiomas en una misma locucion; solo esta optimizado para uzbek, aunque tolera prestamos rusos en script latino.
- Cobertura de idiomas limitada a uzbek: no es utilizable para otros idiomas sin un fine-tuning adicional.
- Repositorio con cero descargas y cero likes, y fecha de creacion registrada como 2026-10-07: no hay evidencia publica de uso en produccion ni de validacion por terceros.
- Discrepancia de identificadores: el repositorio es Mannon/uzbek_stt_v1, pero la model card y los ejemplos de codigo apuntan a Kotib/uzbek_stt_v1. Hay que verificar la ruta correcta antes de integrarlo en un pipeline.
- Sin informacion sobre sesgos: no se documentan sesgos de genero, acento, edad ni origen regional en los datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o habla ininteligible; es recomendable revisar pasajes de baja confianza.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se declaran restricciones adicionales.
- La licencia del modelo base (Apache 2.0) y la del propio fine-tuning son compatibles, pero no se documenta la procedencia ni los derechos de las ~1.600 horas de audio de entrenamiento, un caveat relevante para despliegues comerciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mannon/uzbek_stt_v1
- Modelo base: https://huggingface.co/openai/whisper-medium
- Repositorio alternativo citado en la model card: https://huggingface.co/Kotib/uzbek_stt_v1 (no verificado; aparece en los ejemplos de codigo del autor)
- Paper de la arquitectura Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- No se han encontrado en la busqueda web otros enlaces relevantes al modelo (los resultados obtenidos no guardan relacion con el).
