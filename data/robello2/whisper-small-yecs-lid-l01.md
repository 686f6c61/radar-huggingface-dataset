# robello2/whisper-small-yecs-lid-l01

## Resumen

whisper-small-yecs-lid-l01 es un ajuste fino de openai/whisper-small llevado a cabo por el usuario robello2 sobre el corpus YECS de habla con cambio de codigo yoruba-ingles (code-switching). El modelo resuelve una tarea concreta: el reconocimiento automatico de voz en enunciados donde se alternan el yoruba y el ingles dentro de la misma frase, un escenario especialmente problematico para los sistemas ASR monoingles. Se distribuye con 241,7 millones de parametros en formato safetensors y un repositorio de 1,0 GB.

La relevancia del modelo es acotada pero clara: los corpus de code-switching yoruba-ingles son escasos y los ASR comerciales suelen degradarse notablemente en estas condiciones. El autor reporta un WER del 16,49 % en su conjunto de desarrollo interno, con un error del 18,74 % en palabras yoruba y del 9,84 % en palabras inglesas, lo que refleja la asimetria tipica de estos sistemas. El entrenamiento se realizo sobre 75 999 enunciados del split de entrenamiento congelado de YECS, con un token de idioma por enunciado asignado por mayoria de etiquetas.

Se trata de un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, publicado el 1 de noviembre de 2026. La licencia NOODL-1.0 condiciona su uso, y el propio autor remite a los terminos del corpus YECS antes de cualquier aplicacion. No hay informacion publicada sobre benchmarks externos, demos ni papers asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste fino de openai/whisper-small |
| Parametros totales | 241.736.450 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de Whisper small, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | yoruba (yo), ingles (en), con cambio de codigo entre ambos |
| Licencia | NOODL-1.0 (license_name: noodl-1.0, license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper small de OpenAI, un transformer encoder-decoder disenado para reconocimiento automatico de voz con entrada de audio en espectrograma log-Mel. El ajuste fino se realizo sobre el split de entrenamiento congelado del corpus YECS (Yoruba-English Code-Switched speech), compuesto por 75 999 enunciados, reservando un conjunto de desarrollo interno para seleccion de modelo y evaluacion. No se especifica el numero total de horas de audio ni la composicion exacta del dataset mas alla de su naturaleza bilingue con alternancia de codigo.

El procedimiento de entrenamiento documentado incluye una tasa de aprendizaje de 1e-05, 500 pasos de calentamiento, tamano de lote efectivo de 32 (16 x acumulacion 2), precision bf16, un maximo de 10 epocas con parada temprana (paciencia 3) sobre el WER greedy del conjunto de desarrollo y semilla 42. Se selecciono el paso 4000 de 7000, equivalente a 2,95 epocas. Cada enunciado recibe un token de idioma (`<|en|>` o `<|yo|>`) determinado por la mayoria de las etiquetas a nivel de palabra, con desempate hacia el ingles, y se recomienda decodificar con deteccion automatica de idioma. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico de voz en yoruba, ingles y enunciados con cambio de codigo entre ambos idiomas.
- Transcripcion con preservacion de diacriticos y tonos (el protocolo de evaluacion aplica NFC y mantiene las marcas diacriticas).
- Deteccion automatica de idioma durante la decodificacion, con soporte del token de idioma forzado por enunciado.
- Decodificacion con busqueda por haces (beam 5) para mejorar la calidad frente a la decodificacion greedy.
- Evaluacion especifica de errores cerca y lejos de los puntos de cambio de codigo (switch_near_err, switch_away_err).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio adicional ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de entrevistas bilingues yoruba-ingles: el modelo esta ajustado especificamente para enunciados con alternancia de codigo, por lo que puede emplearse en la transcripcion de material etnografico o periodistico donde los hablantes mezclan ambos idiomas en la misma intervencion.
- Subtitulado de contenido audiovisual nigeriano: series, podcasts y videos de YouTube en los que el ingles se intercala con yoruba se pueden transcribir con un unico modelo en lugar de encadenar dos sistemas monoingles con deteccion manual de idioma.
- Investigacion linguistica sobre code-switching: la salida incluye metricas de error desglosadas por idioma y por proximidad al punto de cambio, lo que permite analizar patrones de alternancia y evaluar hipotesis sobre el comportamiento del habla bilingue.
- Atencion al cliente en centros de contacto nigerianos: llamadas donde el agente alterna yoruba e ingles pueden transcribirse para analisis de calidad, cumplimiento o generacion de resumenes posteriores.
- Generacion de datos etiquetados para entrenar otros ASR: las transcripciones del modelo pueden servir como pseudoetiquetas para ampliar corpus de code-switching, con revision humana posterior dado el WER del 16,49 %.
- Sistemas de accesibilidad y dictado: integracion en aplicaciones de dictado o lectura de subtitulos para hablantes bilingues que alternan idiomas de forma natural, con deteccion automatica de idioma para evitar configuracion manual.

## Benchmarks y rendimiento

Resultados internos de desarrollo reportados por el autor (beam 5, idioma automatico, porcentajes, protocolo sensible a tonos y cambios de codigo con NFC, puntuacion eliminada y diacriticos conservados):

| Metrica | Valor |
|---|---|
| WER | 16,49 |
| CER | 5,82 |
| di_wer | 12,77 |
| err_yo | 18,74 |
| err_en | 9,84 |
| pier_yo | 21,80 |
| switch_near_err | 13,97 |
| switch_away_err | 14,15 |
| ins_per_word | 2,41 |

No se han publicado resultados de benchmarks externos (MLSU, Common Voice, FLEURS u otros) en la informacion disponible, ni comparaciones con modelos de referencia mas alla de los datos internos del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,5 GB de pesos, con un consumo total tipico en torno a 1-2 GB incluyendo activaciones y buffers de audio.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,3 GB de pesos; en 4 bits, en torno a 0,15 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en GPUs de gama baja e incluso en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPU consumer: si, incluidas GTX 1650, RTX 3050 y similares con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con pipeline de automatic-speech-recognition, vLLM no aplica (no es un modelo de lenguaje), llama.cpp no soporta arquitectura Whisper de forma nativa, faster-whisper y whisper.cpp son alternativas viables previa conversion de pesos, TGI no esta orientado a ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del backend, la longitud del audio y el uso de beam search frente a decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-yecs-lid-l01 | 241,7 M | yo, en (code-switching) | no disponible | NOODL-1.0 | HuggingFace, 0 descargas |
| openai/whisper-small | 241,7 M | multilingue (99 idiomas) | ventana de 30 s | MIT | HuggingFace, ampliamente usado |
| openai/whisper-base | 74,4 M | multilingue | ventana de 30 s | MIT | HuggingFace |
| openai/whisper-medium | 769 M | multilingue | ventana de 30 s | MIT | HuggingFace |

Frente a openai/whisper-small, el modelo ajustado sacrifica cobertura multilingue general a cambio de especializacion en yoruba-ingles con cambio de codigo, con una licencia mas restrictiva (NOODL-1.0 frente a MIT). No se dispone de datos publicos que comparen su WER con el de whisper-small original en YECS ni con otros ajustes finos de la comunidad, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- El WER global del 16,49 % y el error en palabras yoruba del 18,74 % implican una tasa de error considerable para produccion sin revision humana, especialmente en segmentos yoruba.
- El modelo solo ha sido evaluado en el conjunto de desarrollo interno del autor; no hay validacion externa ni resultados en otros corpus, lo que limita la confianza en su generalizacion.
- Riesgo de alucinacion y de sustituciones lexicales en pasajes con ruido, acentos no representados en YECS o audio de baja calidad, comun en modelos Whisper ajustados con corpus pequenos.
- La asignacion de token de idioma por mayoria de etiquetas puede introducir sesgo hacia el ingles en enunciados equilibrados (desempate hacia en), lo que afecta a la decodificacion si no se usa deteccion automatica.
- Cobertura limitada a yoruba e ingles; no debe esperarse un comportamiento correcto en otros idiomas ni en variedades dialectales del yoruba no presentes en YECS.
- La licencia NOODL-1.0 es restrictiva y el autor remite explicitamente a los terminos del corpus YECS; es imprescindible revisar ambas licencias antes de cualquier uso comercial.
- Modelo con cero descargas y sin mantenimiento documentado; no hay garantias de soporte, actualizaciones ni correccion de errores.
- No se documentan sesgos demograficos especificos, pero la composicion del corpus YECS condiciona el rendimiento por genero, edad, region y estilo de habla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robello2/whisper-small-yecs-lid-l01
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales especificos de este modelo.
