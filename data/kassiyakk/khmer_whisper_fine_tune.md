# Kassiyakk/Khmer_Whisper_Fine_Tune

## Resumen

Khmer_Whisper_Fine_Tune es un ajuste fino del modelo openai/whisper-small para reconocimiento automatico del habla (ASR) en jemer (km). Lo publica el usuario Kassiyakk en Hugging Face y parte del checkpoint Whisper Small de OpenAI, un transformer encoder-decoder de 241,7 millones de parametros especializado en transcripcion de audio. El objetivo es adaptar un modelo multilingue generico al jemer, un idioma con pocos recursos y escasa representacion en los corpus de entrenamiento originales de Whisper.

El ajuste se ha realizado sobre el dataset seanghay/khmer_mpwt_speech, un corpus de habla jemer, con un total de 1000 pasos de entrenamiento y un learning rate de 1e-05. El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, lo que facilita su integracion en pipelines de transformers.

La relevancia actual del modelo es limitada pero concreta: cubre una necesidad real de ASR en jemer para aplicaciones de transcripcion, subtitulado o asistentes de voz en camboyano. No obstante, los resultados declarados por el autor muestran un WER de 544,19 en el split de test, un valor muy elevado que indica que el ajuste no ha convergido a un rendimiento utilizable en produccion sin una revision adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.767.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper Small) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper Small: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI para ASR multilingue y traduccion de voz. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, y genera texto de forma autorregresiva con tokens especiales de idioma y tarea. El ajuste fino conserva esta arquitectura y solo modifica los pesos mediante entrenamiento supervisado sobre el corpus jemer.

El entrenamiento se realizo con AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), learning rate de 1e-05, scheduler lineal con 50 pasos de warmup, batch de 8 en entrenamiento y evaluacion, precision mixta nativa AMP y semilla 42. Se ejecutaron 1000 pasos, equivalentes a 5,59 epocas sobre el dataset. No se documenta el numero total de tokens de audio, la composicion del dataset ni si hubo etapas de RLHF o DPO; la model card indica explicitamente "More information needed" en descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla en jemer a partir de audio de hasta 30 segundos por segmento.
- Transcripcion de voz a texto con salida en escritura jemer.
- Procesamiento de audio mono a 16 kHz, segun el preprocesado estandar de Whisper.
- Soporte de la pipeline `automatic-speech-recognition` de transformers.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modos de razonamiento extendido.
- Capacidad multilingue limitada al jemer en este ajuste; el modelo base es multilingue pero el fine-tuning se ha orientado a un unico idioma.

## Casos de uso

- Transcripcion de reuniones y entrevistas en jemer: el modelo puede convertir grabaciones de audio en texto para actas o archivos buscables, aunque el WER declarado exige revision humana obligatoria.
- Subtitulado automatico de video en jemer: util como primer borrador de subtitulos que un editor corrige despues, dado el bajo coste computacional del modelo.
- Prototipado de asistentes de voz en camboyano: sirve para validar pipelines de ASR en jemer antes de invertir en modelos mayores o en datos propios.
- Investigacion en ASR de bajos recursos: punto de partida reproducible para experimentos de fine-tuning sobre jemer con hiperparametros documentados.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un archivo sonoro para habilitar busqueda por texto, asumiendo post-edicion.
- Generacion de corpus pseudo-etiquetados: el modelo puede pre-anotar audio jemer para su posterior correccion y reutilizacion en entrenamiento.
- Educacion y accesibilidad: transcripcion de clases o materiales formativos en jemer para estudiantes con dificultades auditivas, con supervision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | seanghay/khmer_mpwt_speech (config: km, split: test) | WER | 544,1941 |
| Automatic Speech Recognition | seanghay/khmer_mpwt_speech (split de validacion, paso 1000) | WER | 544,1941 |
| Automatic Speech Recognition | seanghay/khmer_mpwt_speech (split de validacion, paso 500) | WER | 538,8215 |
| Automatic Speech Recognition | seanghay/khmer_mpwt_speech (split de validacion, paso 250) | WER | 590,6412 |
| Automatic Speech Recognition | seanghay/khmer_mpwt_speech (split de validacion, paso 750) | WER | 556,4991 |

La perdida de validacion se mantuvo practicamente plana entre 2,1370 y 2,1263 a lo largo de los 1000 pasos, y el WER no mejoro de forma sostenida. Un WER superior a 100 indica que el modelo produce mas errores que palabras de referencia, lo que sugiere un fallo de convergencia o un problema en la tokenizacion o en la evaluacion del split. No se han publicado otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los 241,7 M de parametros, mas el overhead de activaciones y del encoder de audio.
- VRAM estimada en fp16: aproximadamente 0,5 GB de pesos, con margen adicional para buffers.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien cabe en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPUs consumer con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con pipeline `automatic-speech-recognition`, y previsiblemente llama.cpp u Ollama no aplican por ser un modelo de audio; vLLM y TGI no estan documentados para este checkpoint en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kassiyakk/Khmer_Whisper_Fine_Tune | 241,7 M | audio 30 s | jemer | apache-2.0 | Hugging Face |
| openai/whisper-small | 241,7 M | audio 30 s | multilingue (99 idiomas) | apache-2.0 | Hugging Face |
| openai/whisper-medium | 769 M | audio 30 s | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | 1550 M | audio 30 s | multilingue | apache-2.0 | Hugging Face |

El ajuste parte de whisper-small y comparte su tamano y licencia. Frente al modelo base, el fine-tuning deberia mejorar la adaptacion al jemer, pero los resultados declarados no permiten confirmarlo. Los modelos medium y large-v3 ofrecen mayor capacidad y, en general, mejor ASR multilingue, a costa de mas VRAM y latencia. No se dispone de datos comparativos de WER en jemer para estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El WER declarado de 544,19 en test es extremadamente alto e indica que el modelo no es fiable para transcripcion sin revision humana.
- La perdida de validacion apenas varia durante el entrenamiento, lo que sugiere un posible fallo de convergencia, un learning rate inadecuado o un problema en el dataset o en la evaluacion.
- La model card esta generada automaticamente y carece de documentacion sobre datos, usos previstos y limitaciones.
- Solo se ha ajustado para jemer; el rendimiento en otros idiomas no esta documentado y probablemente se degrade respecto al modelo base.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios o habla solapada, comun en modelos Whisper.
- Sesgos no documentados: no hay informacion sobre la composicion demografica del corpus seanghay/khmer_mpwt_speech ni sobre posibles sesgos de acento, genero o registro.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documentan limitaciones de contexto mas alla de la ventana estandar de 30 segundos de Whisper.
- El repositorio ocupa 7,7 GB, lo que sugiere la presencia de checkpoints intermedios o artefactos de entrenamiento ademas de los pesos finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kassiyakk/Khmer_Whisper_Fine_Tune
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/seanghay/khmer_mpwt_speech
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
