# emma333333/whisper-tiny_to_spanish_accent_09oct

## Resumen

Whisper tiny Spanish es un ajuste fino del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario emma333333 en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante mas pequena (37,7 millones de parametros) y se ha reentrenado sobre un conjunto de datos denominado Spanish_english, con el objetivo declarado de adaptar el reconocimiento a acentos del espanol. Es, por tanto, un experimento de ajuste de dominio sobre un checkpoint ya existente, no un modelo entrenado desde cero.

La relevancia de este tipo de publicaciones es limitada pero practica: permite evaluar hasta que punto un modelo de ASR de muy bajo coste computacional puede especializarse en una variedad dialectal concreta mediante un ajuste fino corto (2.000 pasos, dos epocas). El autor reporta un WER de 12,31 sobre el split de test del dataset Spanish_english, partiendo de un WER de 13,93 tras la primera epoca, lo que indica una mejora modesta pero medible dentro del propio conjunto de evaluacion.

Conviene subrayar que la model card es practicamente automatica: no documenta la composicion del dataset, no describe el procedimiento de recoleccion de audio y no incluye seccion de usos previstos ni limitaciones. La informacion disponible es escasa y debe interpretarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para transcripcion y traduccion de voz. El ajuste fino se realizo con la libreria Transformers (version 5.23.0.dev0) y PyTorch 2.11.0+cu130, empleando el optimizador AdamW fused con betas (0,9; 0,999), una tasa de aprendizaje de 1e-05, scheduler lineal con 500 pasos de calentamiento, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42 y un total de 2.000 pasos de entrenamiento (aproximadamente dos epocas sobre el dataset). No se documenta el numero de tokens de audio, la composicion del dataset Spanish_english, ni si se aplicaron tecnicas de aumento de datos o de RLHF/DPO (en ASR no es habitual).

La unica innovacion reseñable es el propio ajuste de dominio: se parte de un checkpoint preentrenado multilingue y se especializa con una tasa de aprendizaje muy baja para preservar las representaciones originales. No hay atencion lineal, decodificacion especulativa ni variantes arquitectonicas; es un fine-tuning convencional con `Trainer`.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre el checkpoint base Whisper tiny.
- Especializacion declarada en acentos del espanol, aunque el campo `language` de la model card solo lista `en`, lo que genera ambiguedad sobre el idioma real de salida.
- Transcripcion de audio en ventanas de hasta 30 segundos, limitacion inherente a Whisper.
- No se documenta soporte de tool calling ni function calling (no aplica a un modelo ASR).
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio generativo; es exclusivamente un modelo de transcripcion.
- Capacidades multilingues: no confirmadas; el unico idioma declarado es ingles.

## Casos de uso

- Transcripcion de audio en espanol con acento marcado en entornos de bajo recursos: el modelo puede desplegarse en CPU o GPUs modestas gracias a sus 37,7 M de parametros, lo que lo hace viable para prototipos de subtitulado o notas de voz.
- Preprocesado de audio para pipelines de NLP: transcripcion rapida de reuniones o entrevistas antes de pasarlas a un modelo de lenguaje, aceptando la perdida de precision frente a variantes mayores de Whisper.
- Evaluacion de tecnicas de ajuste de dominio en ASR: sirve como caso de estudio reproducible para comparar estrategias de fine-tuning sobre datasets dialectales pequenos.
- Sistemas de dictado offline en dispositivos con poca memoria: al ocupar 0,3 GB el repositorio, puede integrarse en aplicaciones de escritorio o moviles con requisitos de VRAM minimos.
- Investigacion sobre sesgo dialectal: permite medir la brecha de WER entre acentos estandar y acentos regionales del espanol frente al modelo base.
- Generacion de transcripciones preliminares para revision humana: en flujos donde un revisor corrige la salida, el coste computacional reducido compensa un WER mas alto que el de modelos grandes.
- No se recomienda para atencion al cliente automatizada ni para produccion critica sin una evaluacion previa sobre datos propios, dado que la model card no documenta el dataset de entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Spanish (emma333333) | Spanish English | test | WER | 12,3134 |
| Whisper tiny Spanish (emma333333) | Spanish English | validacion (epoca 1) | WER | 13,9303 |
| Whisper tiny Spanish (emma333333) | Spanish English | validacion (epoca 2) | WER | 12,3134 |

| Epoca | Step | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 0,9728 | 1000 | 0,2611 | 0,2653 | 13,9303 |
| 1,9455 | 2000 | 0,1391 | 0,2461 | 12,3134 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con el checkpoint base openai/whisper-tiny sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros), aproximadamente 150 MB en fp16 y menos de 100 MB en cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura. Tambien es viable en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde con poca memoria.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma nativa a ASR, llama.cpp no soporta Whisper directamente, Ollama no lo incluye; alternativas como faster-whisper o WhisperX requeririan conversion del checkpoint. FriendliAI ofrece inferencia alojada segun los resultados de busqueda.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en la practica, un modelo de este tamano transcribe audio en tiempo real o mas rapido en GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Spanish (emma333333) | 37,7 M | 30 s | 12,31 (dataset propio, no verificado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face, OpenAI |
| openai/whisper-base | 74 M | 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face, OpenAI |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face, OpenAI |

La comparacion directa con whisper-tiny es la mas relevante: este ajuste parte de el y solo se diferencia por el fine-tuning sobre Spanish_english. No se dispone de cifras de WER del modelo base sobre el mismo dataset, por lo que no puede cuantificarse la mejora real respecto al original.

## Limitaciones y advertencias

- Model card generada automaticamente: no documenta el dataset de entrenamiento, la procedencia del audio, el numero de horas ni la distribucion de acentos, lo que impide evaluar su representatividad.
- El campo `language` solo declara `en`, pese a que el nombre del modelo y el dataset sugieren espanol; existe ambiguedad sobre el idioma real de salida y el riesgo de transcripciones en ingles o mixtas.
- WER de 12,31 declarado como no verificado (`verified: false`) y medido unicamente sobre el split de test del propio dataset de ajuste, lo que puede sobreestimar el rendimiento en dominios distintos.
- Riesgo de alucinacion: Whisper es propenso a generar texto plausible en silencios o audio ruidoso, especialmente en variantes pequenas.
- Limitacion de contexto: ventanas de 30 segundos; audios mas largos requieren segmentacion externa.
- No hay informacion sobre sesgos de genero, edad o dialecto; el ajuste sobre un dataset no descrito impide descartar sesgos de acento.
- Licencia apache-2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de entrenamiento traslada al usuario la responsabilidad de verificar el cumplimiento legal de los datos.
- Solo 31 descargas y 0 likes en el momento de la consulta: modelo practicamente sin validacion por la comunidad.
- No apto para produccion sin evaluacion previa sobre datos propios y comparacion con whisper-tiny o variantes mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emma333333/whisper-tiny_to_spanish_accent_09oct
- Arbol de archivos: https://huggingface.co/emma333333/whisper-tiny_to_spanish_accent_09oct/tree/main
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Inferencia alojada en FriendliAI: https://friendli.ai/models/emma333333/whisper-tiny_to_spanish_accent_09oct
