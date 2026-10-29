# Nuttyman/whisper-tiny_to_spanish_accent_09oct

## Resumen

`Nuttyman/whisper-tiny_to_spanish_accent_09oct` es un ajuste fino (fine-tune) del modelo `openai/whisper-tiny` de OpenAI, publicado en HuggingFace por el usuario Nuttyman. El objetivo declarado por el nombre del repositorio es adaptar el reconocimiento automatico del habla (ASR) de Whisper al ingles hablado con acento espanol, partiendo del dataset `Spanish_english`. Es, por tanto, un modelo especializado y de nicho, no un modelo generalista: hereda la arquitectura y el conocimiento del whisper-tiny original y anade un entrenamiento ligero sobre un corpus concreto.

El modelo tiene 37.760.640 parametros (aproximadamente 37,8 millones) y un peso de repositorio de 0,3 GB, lo que lo situa en la gama ultra-ligera: se puede ejecutar en CPU y en cualquier GPU consumer con una fraccion minima de VRAM. La longitud de audio que procesa esta limitada por la ventana nativa de Whisper (30 segundos por segmento), y el contexto textual interno es el del tokenizer del modelo base.

Su relevancia es practica: demuestra el flujo tipico de especializacion de un modelo ASR preentrenado mediante `Trainer` de HuggingFace, con hiperparametros y metricas documentados en la model card (WER de 9,03 sobre el split de test). Es util como referencia para quien quiera replicar el proceso, y como pieza ligera para transcripcion en entornos con recursos limitados donde el acento espanol degrade el rendimiento del whisper-tiny original. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny, heredada de `openai/whisper-tiny`) |
| Parametros totales | 37.760.640 (aprox. 37,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (nativa de Whisper); contexto textual del tokenizer del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No especificados por el autor; al usar safetensors y transformers se puede convertir a fp16/int8/GGUF con herramientas externas (no verificado en esta ficha) |
| Idiomas soportados | `en` (declarado en la model card); el nombre del repositorio sugiere especializacion en ingles con acento espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con `transformers`; incluye artefactos de entrenamiento, 0,3 GB) |

Otros datos: pipeline `automatic-speech-recognition`, libreria `transformers`, creado el 2026-10-28, actualizado el 2026-10-29, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny: un transformer encoder-decoder que consume espectrogramas mel y genera tokens de texto de forma autoregresiva, con soporte nativo de marcas de tarea e idioma. No hay innovaciones arquitectonicas propias en este repositorio: es un fine-tune estandar generado con `Trainer` (etiqueta `generated_from_trainer`). El modelo parte de los pesos preentrenados de `openai/whisper-tiny` y no se documenta ningun cambio estructural ni decodificacion especulativa.

Los hiperparametros de entrenamiento declarados son: learning rate 1e-05, batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador `ADAMW_TORCH_FUSED` (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. El autor no detalla el numero de tokens de audio ni la composicion del dataset `Spanish_english` ("Training and evaluation data: More information needed"). No se menciona RLHF ni DPO, algo esperable en un modelo ASR. El historial de entrenamiento muestra dos puntos de control: paso 1000 (epoch 0,9452) con validation loss 0,2030 y WER 10,7740, y paso 2000 (epoch 1,8904) con validation loss 0,1865 y WER 9,0329.

Versiones de framework declaradas: Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0, Tokenizers 0.23.3.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles, con ajuste orientado a hablantes con acento espanol.
- Generacion de transcripciones con puntuacion y mayusculas, gracias al preentrenamiento de Whisper.
- Procesamiento de segmentos de audio de hasta 30 segundos; para audio mas largo es necesario trocear y concatenar.
- Salida de texto plano en un unico idioma; no se documenta traduccion automatica (task `translate`).
- No se documenta soporte de tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: la model card declara unicamente `en`, pese a que el fine-tune se hizo sobre un corpus llamado `Spanish_english`.
- No dispone de modo "thinking", vision ni audio generativo; es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y llamadas con participantes hispanohablantes hablando en ingles: el ajuste sobre `Spanish_english` busca reducir el WER que el whisper-tiny original obtiene con acentos no nativos, y su tamano permite procesar audio en tiempo real en CPU.
- Subtitulado de videos internos en empresas con equipos mixtos Espana-Reino Unido: el modelo puede generar la pista de subtitulos en bruto y pasarse despues por un corrector ortografico; el coste computacional por hora de audio es minimo.
- Prototipado rapido de pipelines ASR antes de invertir en modelos mayores: con 37,8 M de parametros sirve para validar la integracion con `transformers` y luego sustituir el checkpoint por `whisper-base` o `whisper-small` sin cambiar el codigo.
- Notas de voz en aplicaciones moviles o embebidas: el checkpoint en fp16 ocupa del orden de decenas de MB, lo que permite empaquetarlo en apps de escritorio o en dispositivos con poca memoria.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como caso de estudio reproducible (semilla 42, hiperparametros y curva de validacion documentados) para investigar el efecto del ajuste fino en acentos.
- Filtrado y etiquetado de audio a gran escala: al ser muy rapido, se puede usar como primera pasada para detectar segmentos con habla y derivar solo los fragmentos dudosos a un modelo mayor.
- Docencia y demos: ejemplo minimo de extremo a extremo (dataset, entrenamiento, metricas WER) para cursos de speech processing.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente, campo `verified: false`):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Automatic Speech Recognition | Spanish English | test | WER | 9,0329 |

Evolucion durante el entrenamiento (evaluation set):

| Paso | Epoch | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9452 | 0,1606 | 0,2030 | 10,7740 |
| 2000 | 1,8904 | 0,0605 | 0,1865 | 9,0329 |

No se han publicado en la informacion disponible resultados en benchmarks estandar (LibriSpeech, Common Voice, FLEURS) ni comparaciones directas con otros checkpoints, por lo que no es posible situar el 9,03 de WER frente a alternativas sin reejecutar la evaluacion sobre el mismo corpus.

## Requisitos de hardware

- VRAM estimada: marginal. En fp32 los pesos ocupan unos 151 MB; en fp16, unos 75 MB; en int8, unos 38 MB. El consumo real lo dominan las activaciones y el buffer de espectrograma, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3050, RTX 4090). No requiere A100 ni H100; usarlas no aporta ventaja practica.
- Cabe holgadamente en GPU consumer, e incluso en CPU: es viable la inferencia en un portatil sin GPU dedicada.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), exportacion a ONNX, y conversion a GGUF para `whisper.cpp` mediante herramientas externas (no verificada en esta ficha).
- Latencia y throughput: no hay cifras publicadas por el autor. Por tamano, el modelo es apto para transcripcion en tiempo real o superior en hardware modesto, pero este dato debe medirse en el entorno objetivo.
- Nota: el repositorio de 0,3 GB incluye artefactos de entrenamiento ademas de los pesos, por lo que el checkpoint util para inferencia es notablemente mas pequeno que el tamano total del repo.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de informacion publica general de la familia Whisper; no incluidos en la informacion proporcionada para esta ficha.

| Modelo | Parametros | Contexto de audio | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`whisper-tiny_to_spanish_accent_09oct`) | 37,8 M | 30 s | `en` (con acento espanol) | Apache 2.0 | HuggingFace, 0 descargas |
| `openai/whisper-tiny` | ~39 M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |
| `openai/whisper-base` | ~74 M | 30 s | Multilingue | Apache 2.0 | HuggingFace |
| `openai/whisper-small` | ~244 M | 30 s | Multilingue | Apache 2.0 | HuggingFace |

La ventaja de este checkpoint frente al `whisper-tiny` original es la especializacion en un dominio acustico concreto; su desventaja es la perdida de cobertura multilingue declarada y la ausencia de evaluaciones externas que confirmen la mejora. Para uso general, el modelo base es la opcion mas segura; para audio con acento espanol, este fine-tune deberia validarse contra el original en un conjunto propio antes de adoptarlo.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("Model description", "Intended uses & limitations", "Training and evaluation data"), lo que impide conocer la composicion exacta del corpus de entrenamiento.
- El WER de 9,03 esta marcado como no verificado y se calcula sobre un unico dataset (`Spanish_english`), del que no se documenta tamano, procedencia ni condiciones de grabacion. No es extrapolable a otros dominios.
- Inconsistencia entre el nombre del repositorio (orientado a acento espanol), el nombre del dataset (`Spanish_english`) y el campo `language: en`: el modelo podria estar entrenado para transcribir ingles con acento, no para transcribir espanol. Conviene verificarlo antes de usarlo.
- Riesgo de alucinacion tipico de Whisper: en segmentos con silencio, ruido o habla solapada puede generar texto inventado o repetir frases.
- Ventana de 30 segundos: requiere segmentacion manual para audio largo, con riesgo de cortes en mitad de palabra.
- Modelo muy pequeno: precision limitada en vocabulario tecnico, nombres propios y acustica ruidosa en comparacion con variantes base/small/medium.
- Sin cifras publicadas de sesgo por genero, edad o variedad dialectal; al ser un fine-tune sobre un corpus reducido, el riesgo de sobreajuste al estilo de grabacion del dataset es alto (la validation loss sube respecto a la training loss ya en el paso 1000).
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar el aviso de atribucion a OpenAI como modelo base.
- El repo declara 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos eran sobre servicios de musica y no guardan relacion); no existe documentacion externa, paper ni demo publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nuttyman/whisper-tiny_to_spanish_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de referencia de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de `transformers` para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Documentacion de `whisper.cpp` (conversion a GGUF): https://github.com/ggerganov/whisper.cpp

No se han encontrado otros enlaces (papers, blogs, demos o repos del autor) en la busqueda web realizada.
