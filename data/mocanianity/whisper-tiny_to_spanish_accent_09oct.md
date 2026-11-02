# Mocanianity/whisper-tiny_to_spanish_accent_09oct

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Mocanianity en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, en su variante mas pequena, y entrenado sobre un dataset denominado "Spanish English". El objetivo declarado es adaptar el modelo base a acentos del espanol, si bien la model card no detalla la composicion exacta del conjunto de entrenamiento ni la naturaleza del ajuste.

El modelo cuenta con 37,76 millones de parametros y un repositorio de 0,3 GB en formato safetensors, lo que lo situa en la gama ultraligera de modelos ASR. Su relevancia practica reside en la posibilidad de desplegarlo en entornos con recursos muy limitados (CPU, dispositivos embebidos, navegador) para transcripcion de audio en tiempo real o por lotes. No obstante, la informacion publicada es muy escasa: la model card esta generada automaticamente por el Trainer y contiene secciones sin completar ("More information needed"), y el modelo registra cero descargas y cero likes en el momento de la consulta.

El resultado declarado por el autor es un WER de 13,48 sobre el split de test del dataset "Spanish English", con una perdida de validacion de 0,2950. Estos datos no estan verificados (`verified: false` en el model-index) y no se acompanan de comparaciones con el modelo base ni con alternativas, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, variante tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos por defecto; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni otras) |
| Idiomas soportados | en (segun metadatos); el nombre del modelo sugiere adaptacion a acentos del espanol, no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado originalmente para transcripcion y traduccion de voz. El fine-tuning se realizo con la libreria Transformers (version 5.23.0.dev0) y PyTorch 2.11.0+cu130, partiendo de openai/whisper-tiny. Los hiperparametros documentados incluyen learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento.

La model card no especifica el numero de tokens de audio procesados, la composicion del dataset "Spanish English" (numero de horas, hablantes, dominios, proporcion espanol/ingles) ni si se aplicaron tecnicas de aumento de datos o filtrado. Tampoco se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional. La unica informacion de evaluacion disponible son dos puntos de control: en el paso 1000 (epoca 0,99) se obtuvo una perdida de validacion de 0,3012 y un WER de 15,157; en el paso 2000 (epoca 1,98) se alcanzo una perdida de 0,2950 y un WER de 13,4836, lo que indica mejora monotona dentro del regimen observado.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del pipeline `automatic-speech-recognition`.
- Transcripcion de audio en ingles, segun los metadatos del modelo; el autor sugiere adaptacion a acentos del espanol en el nombre, pero la model card no lo confirma.
- Capacidad multilingue limitada: aunque Whisper base soporta multiples idiomas, el ajuste fino se ha realizado sobre un dataset especifico y la unica lengua declarada es `en`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales como thinking mode, vision o audio generation.
- Al ser un modelo ASR puro, no genera texto libre mas alla de la transcripcion del audio de entrada.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo puede convertir grabaciones cortas en texto con un consumo de recursos minimo (37,7 M de parametros), adecuado para ejecutarse en portatiles o incluso en navegador mediante WebAssembly.
- Subtitulado automatico de videos en ingles: dado su tamano reducido, puede procesar pistas de audio por segmentos de hasta 30 segundos y generar subtitulos en tiempo casi real en hardware consumer.
- Prototipado rapido de pipelines ASR: util como baseline ligero para validar arquitecturas de preprocesado de audio, segmentacion y postprocesado antes de escalar a modelos mayores.
- Despliegue en dispositivos con recursos limitados: Raspberry Pi, moviles o entornos edge donde modelos como whisper-large no caben, siempre que la precision requerida no sea critica.
- Investigacion sobre adaptacion de acentos: el modelo sirve como punto de partida para estudiar tecnicas de fine-tuning sobre variedades dialectales del espanol, aunque la documentacion del dataset es insuficiente para reproducir el experimento.
- Evaluacion comparativa de modelos ASR ligeros: puede incluirse en suites de benchmark internas para contrastar WER frente a whisper-tiny original y otras variantes ajustadas.
- Preprocesado de audio para sistemas de analisis de sentimiento o extraccion de entidades: la transcripcion generada puede alimentar pipelines NLP posteriores en entornos de bajo coste.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Spanish | Spanish English | test | WER | 13,4836 |
| Whisper tiny Spanish | Spanish English | test | Loss | 0,2950 |

Evolucion durante el entrenamiento (segun la model card):

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9901 | 0,3261 | 0,3012 | 15,1570 |
| 2000 | 1,9802 | 0,1735 | 0,2950 | 13,4836 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con el modelo base openai/whisper-tiny ni con alternativas. El WER declarado no es directamente comparable con resultados publicados de otros modelos porque el dataset "Spanish English" no esta descrito ni es de acceso publico conocido.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 150 MB para los pesos (37,76 M de parametros x 4 bytes), mas overhead de activaciones y buffers de audio.
- VRAM estimada en FP16/BF16: aproximadamente 75 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, asi como en iGPU y CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para lotes grandes, una RTX 3060 o superior ofrece margen.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), potencialmente llama.cpp/whisper.cpp si se convierte a GGUF (no se proporcionan pesos en ese formato), y servidores compatibles con la API de HuggingFace (el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en decenas de milisegundos por ventana de 30 segundos en GPU moderna y en el orden de segundos en CPU, pero estos valores no estan documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Whisper tiny Spanish (este modelo) | 37,76 M | 30 s por ventana (por defecto en Whisper) | en (declarado) | apache-2.0 | 13,48 en "Spanish English" (no verificado) |
| openai/whisper-tiny | 37,76 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74,4 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en esta ficha |

La comparativa se limita a la familia Whisper porque no se dispone de datos de otros modelos ASR ligeros ajustados al espanol en la informacion proporcionada. No se puede afirmar que este ajuste supere al modelo base sin una evaluacion en el mismo conjunto de test.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card esta generada automaticamente y contiene secciones vacias ("More information needed") en descripcion, usos previstos y datos de entrenamiento, lo que impide reproducir el ajuste.
- Resultados no verificados: el WER de 13,48 esta marcado como `verified: false` en el model-index y no se acompana de comparacion con el modelo base.
- Dataset no descrito: se desconoce el numero de horas, la procedencia, la calidad y la composicion del dataset "Spanish English", asi como si incluye datos con derechos compatibles con uso comercial.
- Idioma declarado en ingles: aunque el nombre sugiere adaptacion al espanol, los metadatos solo listan `en`; el rendimiento real en espanol no esta documentado.
- Riesgo de alucinacion en ASR: como todos los modelos Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible, especialmente en la variante tiny.
- Precision limitada por tamano: whisper-tiny es el modelo mas pequeno de la familia y su WER en condiciones reales (ruido, acentos marcados, solapamiento de hablantes) suele ser notablemente superior al de variantes mayores.
- Sin garantias de produccion: cero descargas y cero likes en el momento de la consulta; ausencia de validacion externa o de comunidad que respalde el modelo.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el usuario debe verificar que los datos de entrenamiento no impongan restricciones adicionales no declaradas.
- Sin soporte documentado de cuantizacion ni formatos alternativos: solo se ofrecen pesos safetensors, lo que limita el despliegue en entornos que requieran GGUF u otros formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mocanianity/whisper-tiny_to_spanish_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Implementacion whisper.cpp (conversion a GGUF no documentada para este modelo): https://github.com/ggerganov/whisper.cpp
