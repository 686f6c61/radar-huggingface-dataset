# espnet/tedlium2_streaming_transformer

## Resumen

`espnet/tedlium2_streaming_transformer` es un modelo de reconocimiento automatico del habla (ASR) en ingles disenado para decodificacion en streaming: transcribe el audio bloque a bloque mientras este sigue llegando, en lugar de esperar al final de la locucion. Lo publica la organizacion ESPnet, aunque el entrenamiento y la publicacion original corresponden a Keqi Deng, que lo distribuyo como `D-Keqi/espnet_asr_train_asr_streaming_transformer_raw_en_bpe500_sp_valid.acc.ave`. Esta copia mantiene los mismos pesos y existe para que los cuadernos de demostracion y la documentacion apunten a un artefacto que la organizacion conserva.

El modelo se entrena con la receta `egs2/tedlium2/asr1` sobre el corpus TED-LIUM 2, con un modelo de lenguaje BPE de 500 unidades. Internamente es un transformer encoder-decoder con decodificacion conjunta CTC/attention (el ejemplo de uso emplea `ctc_weight=0.5` y `beam_size=20`), y procesa por defecto fragmentos de 640 muestras, es decir, 40 ms a 16 kHz. Se entreno en noviembre de 2021 con espnet 0.9.8 y PyTorch 1.5.1.

Su relevancia es acotada pero clara: es una referencia funcional y ligera (el repositorio ocupa 0,1 GB) para investigacion y prototipado de ASR en tiempo real con ESPnet, incluyendo ejecucion en CPU. No compite en precision con los sistemas ASR actuales: la propia model card recomienda OWSM-CTC para reconocimiento no streaming y recuerda que aquel cubre mas de 150 idiomas. El modelo no declara numero de parametros ni ventana de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder en streaming, con decodificacion conjunta CTC/attention |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (decodificacion por bloques; el ejemplo usa bloques de 640 muestras = 40 ms) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Checkpoints nativos de ESPnet/PyTorch con `meta.yaml`; no se documentan safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de un transformer de secuencia a secuencia orientado a streaming. En lugar de atender a la locucion completa, el decodificador genera hipotesis incrementales a medida que recibe bloques de audio; el ejemplo oficial de inferencia procesa cortes de 640 muestras (40 ms) y va acumulando la hipotesis tras cada corte. La decodificacion combina CTC y attention con un peso de `ctc_weight=0.5`, busqueda por haz de tamano 20 y `nbest=1`, y el ejemplo desactiva la deteccion de repeticiones (`disable_repetition_detection=True`). El modelo se acompana de un modelo de lenguaje BPE de 500 unidades incluido en el mismo repositorio.

Los datos de entrenamiento son TED-LIUM 2, a traves de la receta `egs2/tedlium2/asr1` y la configuracion `conf/train_asr_streaming_transformer.yaml`. No se documentan en la informacion disponible el numero de tokens, la composicion detallada del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR clasico). El entrenamiento se realizo en noviembre de 2021 con espnet 0.9.8 y PyTorch 1.5.1; las versiones actuales de ESPnet cargan el modelo a traves del `meta.yaml` del repositorio. No se describen innovaciones adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Reconocimiento de voz en ingles con salida incremental: devuelve una hipotesis parcial tras cada bloque de audio, no solo al final de la locucion.
- Decodificacion en streaming real: el bucle del ejemplo procesa cortes de 40 ms y marca el ultimo con `is_final=True`.
- Uso de modelo de lenguaje externo: incorpora un LM BPE-500 que se emplea durante la decodificacion.
- Inferencia en CPU: el ejemplo oficial instancia el modelo con `device="cpu"`.
- Integracion nativa con ESPnet: carga mediante `Speech2TextStreaming.from_pretrained` y funciona con el flujo estandar de la libreria.
- No se documentan soporte de tool calling, function calling, capacidades de agente, vision, audio multimodal, traduccion ni deteccion de idioma.
- No se documentan modo de razonamiento (thinking), puntuacion, capitalizacion ni marcas de tiempo en la salida.

## Casos de uso

- Subtitulado en directo de charlas y conferencias: el modelo genera hipotesis parciales cada 40 ms, lo que permite mostrar subtitulos con latencia baja mientras el ponente habla; su dominio de entrenamiento (charlas TED) encaja con este escenario.
- Asistentes de voz interactivos en ingles: la decodificacion por bloques evita esperar al silencio final, adecuado para respuestas conversacionales donde la latencia percibida importa.
- Investigacion en ASR streaming con ESPnet: sirve como linea base reproducible para comparar tecnicas de chunking, lookahead o politicas de decodificacion sobre TED-LIUM 2.
- Prototipado en hardware sin GPU: al poder ejecutarse con `device="cpu"` y ocupar 0,1 GB el repositorio, permite montar demos de transcripcion en un portatil o en un servidor sin acelerador.
- Transcripcion de reuniones y entrevistas en ingles: la salida incremental facilita mostrar actas parciales durante la reunion, aunque el WER de aproximadamente el 11 % obliga a revision posterior.
- Monitorizacion de audio en tiempo real: analisis de streams de contenido hablado en ingles (por ejemplo, deteccion de temas recurrentes o indexacion de fragmentos) sin almacenar el audio completo.
- Plataformas educativas y MOOCs en ingles: generacion de transcripciones progresivas de clases grabadas o emitidas en directo, con la ventaja de no requerir GPU dedicada.
- Validacion de pipelines de audio: verificacion de captura, remuestreo a 16 kHz mono y segmentacion antes de desplegar un sistema ASR mayor, usando un modelo pequeno como paso intermedio.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre TED-LIUM 2, decodificados con el modelo de lenguaje incluido en el propio repositorio:

| Dataset | WER | CER |
|---|---|---|
| dev | 11,4 | 5,4 |
| test | 10,8 | 5,3 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a un modelo ASR) en la informacion disponible. Las tablas completas se encuentran en `RESULTS.md` dentro del directorio de la receta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 0,1 GB, por lo que una copia en fp32 deberia caber holgadamente en menos de 1 GB de memoria; se trata de una estimacion a partir del tamano del repositorio, no de un dato publicado.
- GPU recomendadas: no se especifican. Al ser un modelo ligero, no requiere A100 ni H100; cualquier GPU con CUDA y unos pocos GB de memoria es mas que suficiente.
- GPU de consumo: si, cabe en cualquier GPU de consumo con al menos 2 GB de memoria. El ejemplo oficial ademas funciona en CPU.
- Opciones de despliegue: ESPnet mediante `espnet2.bin.asr_inference_streaming.Speech2TextStreaming` y el fichero `meta.yaml` del repositorio, con PyTorch como backend. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni exportacion a GGUF.
- Latencia y throughput: no se publican valores de RTF ni de latencia extremo a extremo. La configuracion de ejemplo implica un tamano de bloque de 640 muestras (40 ms) con `beam_size=20` y `ctc_weight=0.5`, pero el retardo total depende del lookahead del modelo y del hardware, datos que no se detallan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | WER en TED-LIUM 2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| espnet/tedlium2_streaming_transformer | no disponible | no disponible | en | 11,4 (dev) / 10,8 (test) | cc-by-4.0 | HuggingFace, libreria espnet |
| espnet/owsm_ctc_v4_1B | 1B (segun denominacion) | no disponible | 150+ | no disponible | no disponible en la informacion facilitada | HuggingFace; la model card lo describe como mucho mas preciso y no streaming |
| D-Keqi/espnet_asr_train_asr_streaming_transformer_raw_en_bpe500_sp_valid.acc.ave | no disponible | no disponible | en | no disponible | no disponible en la informacion facilitada | HuggingFace; mismos pesos que este modelo |

La model card no ofrece comparaciones numericas con otros sistemas. Los dos unicos puntos de referencia explicitos son OWSM-CTC (mejor precision, 150+ idiomas, sin streaming) y el repositorio original de Keqi Deng (identico en pesos). Para el resto de alternativas, no disponible.

## Limitaciones y advertencias

- Cobertura linguistica limitada al ingles; no admite otros idiomas.
- Dominio restringido: TED-LIUM 2 son charlas grabadas en condiciones acusticas favorables, con habla mayoritariamente planificada. El rendimiento en audio telefónico, ruidoso, con acentos marcados o habla espontanea puede degradarse notablemente.
- Precision moderada: un WER del 11,4 % en dev y del 10,8 % en test esta lejos de los sistemas ASR actuales. El propio autor recomienda OWSM-CTC para reconocimiento no streaming.
- Compromiso latencia/precision inherente al streaming: el modelo decide con informacion parcial, lo que suele penalizar la exactitud frente a un modelo que procesa la locucion completa.
- Riesgo de alucinacion y de bucles de repeticion en audio con silencios largos, musica o ruido. El ejemplo oficial desactiva la deteccion de repeticiones, lo que agrava este riesgo si no se anade un control propio.
- No se documentan puntuacion, capitalizacion ni marcas de tiempo en la salida, lo que complica su uso directo en subtitulado o en post-procesado sin herramientas adicionales.
- Antiguedad del artefacto: entrenado en noviembre de 2021 con espnet 0.9.8 y PyTorch 1.5.1. La compatibilidad con versiones modernas depende del `meta.yaml`, y no se garantiza el mantenimiento.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero las condiciones del corpus TED-LIUM 2 pueden imponer restricciones adicionales. Conviene verificar la licencia del corpus antes de un despliegue comercial.
- Artefacto con 0 descargas y 0 likes en el Hub en la fecha de los datos; su uso en produccion esta poco contrastado por terceros.
- No se dispone de informacion sobre sesgos demograficos ni sobre la composicion de hablantes del corpus de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/espnet/tedlium2_streaming_transformer
- Repositorio original de los pesos (Keqi Deng): https://huggingface.co/D-Keqi/espnet_asr_train_asr_streaming_transformer_raw_en_bpe500_sp_valid.acc.ave
- Configuracion de entrenamiento: https://github.com/espnet/espnet/blob/master/egs2/tedlium2/asr1/conf/train_asr_streaming_transformer.yaml
- Cuaderno de demostracion de ASR streaming: https://github.com/espnet/notebook/blob/master/Demos/asr_streaming_demo.ipynb
- Repositorio de ESPnet: https://github.com/espnet/espnet
- Modelo alternativo no streaming recomendado por el autor (OWSM-CTC): https://huggingface.co/espnet/owsm_ctc_v4_1B
- Paper de ESPnet (Interspeech 2018): http://dx.doi.org/10.21437/Interspeech.2018-1456
- Resultados completos: fichero `RESULTS.md` dentro de `exp/asr_train_asr_streaming_transformer_raw_en_bpe500_sp/` en la receta `egs2/tedlium2/asr1`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace y de la model card.
