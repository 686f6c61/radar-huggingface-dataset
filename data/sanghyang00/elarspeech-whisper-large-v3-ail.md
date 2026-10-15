# Sanghyang00/ELARSpeech-Whisper-Large-v3-ail

## Resumen

ELARSpeech-Whisper-Large-v3-ail es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario Sanghyang00 en HuggingFace, consistente en un ajuste fino de openai/whisper-large-v3 sobre el idioma Eibela (codigo ISO 639-3: ail). El modelo pertenece a la familia ELARSpeech y su objetivo es transcribir audio en una lengua de bajos recursos que no esta cubierta de forma fiable por los modelos multilingues genericos. Se distribuye unicamente como pesos en formato safetensors dentro de la libreria transformers, con un total de 1.543.491.840 parametros (aproximadamente 1,55 mil millones) y un tamano de repositorio de 6,2 GB.

La relevancia de esta ficha reside en su caracter de modelo especializado y de nicho: al derivar de whisper-large-v3, hereda la arquitectura encoder-decoder transformer del modelo base, pero sustituye la decodificacion multilingue por un token de idioma explicito (`<|ail|>`) que debe inyectarse manualmente en el prompt del decodificador. El autor indica que el artefacto exportado ha superado una verificacion de transcripcion exacta ("PASS") frente al checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, aunque no se publican cifras de WER ni de otros benchmarks.

Se trata de un modelo de descargas y likes nulos en el momento de la consulta, sin licencia declarada y sin documentacion adicional sobre el dataset de entrenamiento. Por tanto, es un candidato a evaluar con cautela en entornos de produccion, especialmente por la ausencia de terminos de licencia explicitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 (aproximadamente 1,55 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; hereda la ventana de audio de 30 segundos propia de Whisper |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | ail (Eibela) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la clase `WhisperForConditionalGeneration` de la libreria transformers, es decir, una arquitectura transformer encoder-decoder disenada para tareas de secuencia a secuencia sobre espectrogramas de audio. El encoder procesa la representacion mel del audio (entrada mono a 16 kHz) y el decoder genera los tokens de transcripcion de forma autoregresiva. El modelo base es openai/whisper-large-v3, que aporta la inicializacion de pesos y el tokenizador multilingue; el ajuste fino posterior especializa el comportamiento hacia el idioma Eibela.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, la duracion total de audio utilizada ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables habitualmente en ASR, donde se optimiza con entropia cruzada supervisada). Tampoco se documenta si hubo aumentacion de datos, normalizacion de ortografia o criterios de particion entre entrenamiento, validacion y prueba. La unica innovacion tecnica declarada es el uso de un token de idioma ELARSpeech explicito en el prompt del decodificador, que el autor recomienda emplear en lugar del parametro `language=` para reproducir el comportamiento exacto del modelo exportado.

## Capacidades

- Transcripcion de voz a texto (ASR) en el idioma Eibela (codigo ail), con token de idioma explicito en la decodificacion.
- Procesamiento de audio mono muestreado a 16 kHz, con remuestreo obligatorio si la fuente no cumple ese formato.
- Decodificacion configurable: el ejemplo del autor usa `num_beams=1` (greedy) y `max_new_tokens=200`, aunque la API de transformers permite beam search y otros parametros de generacion.
- Salida de transcripcion sin timestamps cuando se usa el token `<|notimestamps|>` en el prompt, tal como muestra el codigo de ejemplo.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` aparece entre las etiquetas del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio-vision ni modo de razonamiento extendido. Es un modelo puramente de transcripcion.
- Capacidad multilingue: no. El modelo esta restringido a un unico idioma (monolingue).

## Casos de uso

- Transcripcion de campo para documentacion linguistica: investigadores que recopilan grabaciones de hablantes de Eibela pueden transcribir audio de 16 kHz mono directamente con el snippet de transformers, reduciendo el trabajo manual de anotacion. La especializacion en un solo idioma evita las confusiones tipicas de los modelos multilingues en lenguas de bajos recursos.
- Archivo y preservacion de patrimonio oral: digitalizacion de entrevistas, narraciones y material etnografico en Eibela, generando transcripciones indexables para buscadores o catalogos archivisticos.
- Subtitulado de material audiovisual en Eibela: integracion en un pipeline de ffmpeg + Python que extraiga la pista de audio, la remuestree a 16 kHz mono y genere subtitulos mediante el modelo, con post-proceso de segmentacion temporal externo.
- Asistencia a linguistas en anotacion interlinear: el modelo genera una primera pasada de transcripcion que el linguista corrige y alinea con glosas morfologicas, acelerando el ciclo de analisis.
- Servicio de transcripcion bajo demanda en una API interna: desplegando el modelo con FastAPI o TGI y exponiendo un endpoint compatible, se puede ofrecer transcripcion de Eibela a aplicaciones de terceros (ONG, instituciones educativas, radios comunitarias).
- Evaluacion comparativa de ASR de bajos recursos: sirve como referencia de ajuste fino sobre whisper-large-v3 para medir hasta que punto un corpus pequeno en una lengua minoritaria mejora el WER respecto al modelo base multilingue.
- Investigacion en adaptacion de dominio: permite estudiar el efecto de vocabularios restringidos y prompts de idioma especificos en la estabilidad de la decodificacion de Whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que la verificacion de transcripcion exacta del artefacto exportado frente al checkpoint original de ELARSpeech obtuvo el estado "PASS" sobre un conjunto fijo de evaluacion, sin especificar el tamano del conjunto, la metrica empleada (WER, CER u otra) ni los valores numericos obtenidos.

## Requisitos de hardware

- VRAM estimada en fp16 (precision nativa de los pesos): aproximadamente 3,1 GB solo para pesos, mas memoria de activaciones y cache del decodificador; en la practica entre 4 y 6 GB para audio de 30 segundos y lotes pequenos.
- VRAM estimada en int8: aproximadamente 1,6 GB de pesos, con un total tipico de 2,5 a 3,5 GB en ejecucion.
- VRAM estimada en int4 (si se convierte manualmente): aproximadamente 0,8 GB de pesos, con un total tipico de 1,5 a 2,5 GB, a costa de cierta perdida de precision.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100. Cualquier GPU con 6 GB o mas de VRAM puede ejecutar el modelo en fp16.
- Cabe en GPU de consumo: si. Modelos como RTX 3060, RTX 3070, RTX 4060 Ti o superiores son suficientes en fp16. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: transformers (referencia oficial del autor), vLLM con soporte Whisper, HuggingFace Text Generation Inference (TGI) con pipeline de ASR, y conversion a GGUF para llama.cpp o whisper.cpp si se desea inferencia en CPU o en dispositivos con poca memoria. El repositorio no incluye pesos GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por segundo de audio ni de factor de tiempo real (RTF) para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-ail | 1,55 mil millones | ventana Whisper de 30 s (heredada) | ail (Eibela) | no disponible | HuggingFace (Sanghyang00) |
| openai/whisper-large-v3 | 1,55 mil millones | ventana Whisper de 30 s | multilingue (mas de 90 idiomas) | Apache 2.0 | HuggingFace (openai) |
| openai/whisper-large-v3-turbo | 809 millones | ventana Whisper de 30 s | multilingue | Apache 2.0 | HuggingFace (openai) |
| Modelos ASR especificos de otras lenguas minoritarias basados en Whisper | variable (entre 39 M y 1,55 mil millones) | ventana Whisper de 30 s | idioma unico | variable segun autor | HuggingFace (comunidad) |

Nota: los datos del modelo base openai/whisper-large-v3 proceden de su repositorio publico. No se dispone de resultados de rendimiento comparados entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de whisper-large-v3, puede heredar sesgos presentes en el corpus de entrenamiento del modelo base, aunque el ajuste fino sobre Eibela los atenua para ese idioma.
- Riesgo de alucinacion: presente de forma intrinseca en modelos Whisper, especialmente con audio ruidoso, silencios largos o dominio alejado del corpus de entrenamiento. No se documentan medidas de mitigacion.
- Limitacion de contexto: la ventana de procesamiento es de 30 segundos por segmento, caracteristica heredada de la arquitectura Whisper. Audios mas largos deben fragmentarse, con el riesgo de cortes en fronteras de frase.
- Limitacion de idioma: el modelo es estrictamente monolingue (ail/Eibela). No debe emplearse para transcribir otros idiomas, y su rendimiento en code-switching no esta documentado.
- Restricciones de licencia: la licencia no esta declarada en el repositorio. Esto impide determinar si el uso comercial es posible, lo que constituye un riesgo legal relevante si se pretende integrar en un producto. Es necesario contactar con el autor o consultar la documentacion del proyecto ELARSpeech.
- Procedencia del dataset: la model card remite a la documentacion del proyecto ELARSpeech para los terminos del dataset, pero no se incluye enlace directo ni condiciones.
- Requisito estricto de entrada: el audio debe ser mono a 16 kHz. Un formato incorrecto degrada gravemente la transcripcion.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad. No se recomienda su uso en produccion sin una evaluacion previa con datos propios y una verificacion explicita de licencia.
- Verificacion limitada: el estado "PASS" declarado por el autor se refiere unicamente a la equivalencia entre el artefacto exportado y el checkpoint original, no a la calidad absoluta de las transcripciones.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-ail
- Modelo base en HuggingFace: https://huggingface.co/openai/whisper-large-v3
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Documentacion de WhisperForConditionalGeneration en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Documentacion del proyecto ELARSpeech: no disponible (la model card la menciona sin enlace directo)
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
