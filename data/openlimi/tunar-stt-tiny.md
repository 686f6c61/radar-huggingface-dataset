# openlimi/Tunar-stt-tiny

## Resumen

Tunar-stt-tiny es un modelo de reconocimiento automatico del habla (ASR) para uzbeko, desarrollado por el usuario openlimi y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo Moonshine-tiny de moonshine-ai, una arquitectura de ASR disenada por Useful Sensors para transcripcion eficiente en dispositivos con recursos limitados. Con 18.835.200 parametros, el modelo esta pensado para transcripcion de audio de 16 kHz mono en segmentos de hasta aproximadamente 30 segundos.

La relevancia del modelo radica en su especializacion linguistica: el uzbeko es un idioma con escasa representacion en los sistemas ASR comerciales y open source, y este modelo incorpora un tokenizer BPE propio de 4096 tokens adaptado al alfabeto latino uzbeko moderno, incluyendo caracteres como ö, ğ, ş y ç. El modelo se distribuye en formato safetensors bajo la libreria transformers y esta etiquetado como compatible con endpoints.

El modelo no cuenta con descargas ni likes en el momento de la consulta y su licencia no esta especificada en la informacion disponible, lo que constituye una limitacion importante para su adopcion en produccion. La model card es escueta y no incluye resultados de benchmarks ni detalles sobre el proceso de entrenamiento mas alla de la referencia a la ejecucion "v3_1500h".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder para ASR), fine-tune de moonshine-ai/moonshine-tiny |
| Parametros totales | 18.835.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | segmentos de audio de hasta ~30 s (entrada); salida limitada por max_new_tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Moonshine-tiny, una arquitectura encoder-decoder para reconocimiento automatico del habla desarrollada por Useful Sensors y disenada para inferencia eficiente con audio de duracion variable, evitando el padding fijo a 30 segundos tipico de Whisper. El fine-tune se realizo sobre la ejecucion denominada "v3_1500h", que por el nombre sugiere el uso de aproximadamente 1500 horas de audio, aunque la model card no detalla la composicion del dataset ni si hubo etapas de RLHF o DPO (en ASR estos metodos no son habituales).

La innovacion tecnica mas destacable es la sustitucion del tokenizer original por un tokenizer BPE propio de 4096 tokens adaptado al alfabeto latino uzbeko moderno, con caracteres especiales (ö, ğ, ş, ç) que se obtienen a partir de convenciones de transliteracion (o'->ö, g'->ğ, sh->ş, ch->ç). La entrada esperada es audio mono a 16 kHz, con segmentacion de hasta unos 30 segundos por fragmento. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del corpus ni las tecnicas de aumento de datos empleadas.

## Capacidades

- Transcripcion de voz a texto en uzbeko con salida en alfabeto latino uzbeko moderno.
- Procesamiento de audio mono a 16 kHz en segmentos de hasta aproximadamente 30 segundos.
- Tokenizer BPE propio de 4096 tokens especializado en el idioma uzbeko.
- Generacion autoregresiva de transcripciones mediante `model.generate`.
- Compatibilidad con la libreria transformers y con endpoints de Hugging Face.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla de ASR ni modo de razonamiento explicito.
- Capacidad multilingue limitada al uzbeko segun los metadatos del modelo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en uzbeko: el modelo puede procesar segmentos de hasta 30 segundos y encadenarse para cubrir grabaciones largas, siendo adecuado por su bajo coste computacional (18,8 M de parametros) y su especializacion linguistica.
- Subtitulado automatico de contenido audiovisual en uzbeko: integrado en un pipeline que segmenta el audio en fragmentos de hasta 30 s y aplica el modelo por fragmento, permitiendo generar subtitulos con marcas temporales.
- Atencion al cliente por voz en uzbeko: el modelo puede transcribir consultas de usuarios en sistemas IVR o chatbots de voz, aprovechando su tamano reducido para despliegue en servidores modestos.
- Transcripcion en dispositivos con recursos limitados: con 18,8 M de parametros y un repo de 0,1 GB, es viable en CPU o GPUs de gama baja, lo que facilita su uso en entornos edge o embebidos.
- Generacion de corpus textual en uzbeko: util para proyectos de investigacion linguistica que necesiten convertir archivos de audio en texto para analisis, anotacion o entrenamiento de otros modelos.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de conversaciones o medios en uzbeko, siempre que se gestione la segmentacion por debajo de los 30 s.
- Investigacion en ASR de bajos recursos: sirve como punto de partida para fine-tunes adicionales o para comparar estrategias de tokenizacion en lenguas turquicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32) dado el tamano de 18,8 M de parametros; en fp16 o int8 el consumo es aun menor.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son mas que suficientes.
- Cabe en GPU consumer y en CPU: el modelo puede ejecutarse en CPU sin problemas para transcripciones de segmentos cortos.
- Opciones de despliegue: transformers (libreria indicada en la model card), endpoints de Hugging Face (tag `endpoints_compatible`). No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| openlimi/Tunar-stt-tiny | 18,8 M | ~30 s de audio | uzbeko | no disponible | safetensors |
| moonshine-ai/moonshine-tiny (base) | no disponible | ~30 s de audio | ingles (principalmente) | no disponible | safetensors |
| Whisper tiny (OpenAI) | 39 M | 30 s de audio | multilingue | MIT | safetensors, GGUF |
| Whisper small (OpenAI) | 244 M | 30 s de audio | multilingue | MIT | safetensors, GGUF |

La comparativa con Whisper tiny y Whisper small es orientativa: ambos son modelos multilingues con licencia MIT, mientras que Tunar-stt-tiny esta especializado en uzbeko y carece de licencia declarada. El modelo base Moonshine-tiny esta orientado principalmente al ingles, por lo que el fine-tune aporta la cobertura del uzbeko.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribucion, lo que supone un riesgo legal para produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (WER, CER) frente a alternativas.
- Cobertura limitada a un solo idioma (uzbeko) y dependiente del alfabeto latino moderno con caracteres especiales; la conversion desde convenciones previas (o'->ö, etc.) debe hacerse de forma explicita.
- Segmentacion de audio limitada a ~30 s; audios mas largos requieren troceado manual y posible perdida de contexto entre fragmentos.
- Riesgo de alucinacion en transcripciones, especialmente con audio ruidoso, acentos no cubiertos o vocabulario tecnico fuera del corpus de entrenamiento.
- Modelo con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de robustez en produccion.
- No se documentan sesgos especificos, pero al ser un fine-tune sobre un corpus no descrito, pueden existir sesgos dialectales o de registro.
- No se ha documentado soporte para cuantizacion ni para motores de inferencia alternativos a transformers.

## Enlaces

- Hugging Face: https://huggingface.co/openlimi/Tunar-stt-tiny
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-tiny
