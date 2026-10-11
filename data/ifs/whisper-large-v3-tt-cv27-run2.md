# ifs/whisper-large-v3-tt-cv27-run2

## Resumen

`ifs/whisper-large-v3-tt-cv27-run2` es un ajuste fino completo (full fine-tuning) de `openai/whisper-large-v3` para reconocimiento automatico del habla (ASR) en tatar (`tt`). Lo publica Ilnar Salimzianov bajo el identificador `ifs` y su objetivo es cubrir una carencia clara: el modelo base de OpenAI comete un 32,1 % de CER normalizado y un 89,3 % de WER en tatar, tasas inutilizables en produccion. Tras el ajuste, el modelo baja a un 4,3 % de CER normalizado, 18,2 % de WER y 6,0 % de CER crudo, escribiendo ademas en cirilico con mayusculas y puntuacion.

Arquitectonicamente es un transformer encoder-decoder denso de 1.543.490.560 parametros (aproximadamente 1,54 mil millones), con la misma ventana de audio de 30 segundos por segmento del Whisper original. El repositorio ocupa 6,2 GB porque los pesos se almacenan en float32; el autor indica que float16 reduce el uso de memoria a la mitad sin degradar la inferencia. La licencia es MIT, igual que la del modelo base, y los datos de entrenamiento son CC0.

El modelo se entrena sobre el cubo validado de Common Voice Scripted Speech 27.0 Tatar, con un re-divisionado propio de los splits (26.855 clips de 165 hablantes para entrenamiento). Es el segundo intento del autor: la `run 1` se entreno con solo 9 hablantes y este `run 2` con 165, lo que explica la mejora de 5,2 a 4,3 de CER y de 22,8 a 18,2 de WER. Es relevante ahora porque es el primer modelo Whisper para tatar con salida punteada y con mayusculas aprovechable directamente como subtitulo, y porque supera a los anteriores sistemas wav2vec2 en CER crudo (6,0 frente a 10,6 y 11,1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder denso (Whisper large-v3) |
| Parametros totales | 1.543.490.560 (1,54 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento; audio mas largo requiere segmentacion con `return_timestamps=True`. No se documenta una longitud de contexto en tokens distinta de la del modelo base |
| Tipos de cuantizacion | Pesos almacenados en float32 (6,2 GB); el autor indica que float16 funciona bien para inferencia y reduce el uso de memoria a la mitad. No se documentan cuantizaciones GGUF ni INT8 en el repositorio |
| Idiomas soportados | Tatar (`tt`), en escritura cirilica. El ajuste se evalua y se usa con `language="tatar"` |
| Licencia | MIT |
| Formato de pesos | safetensors, almacenados en float32 |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3`, un transformer encoder-decoder denso con atencion completa y una ventana de entrada de 30 segundos de audio por segmento. El ajuste es completo (no LoRA ni adaptadores): se actualizan todos los pesos del encoder y del decoder. La receta sigue el metodo BuzzASR (`finetune.py --resplit`), con learning rate de 6,48e-6 para el decoder y 0,3 veces ese valor para el encoder, schedule coseno, 150 pasos de warm-up, weight decay de 4e-5, tamano de lote efectivo de 32 (4 clips por 8 pasos de acumulacion de gradiente), precision mixta bf16 con pesos cargados en float32, early stopping con paciencia 3 sobre el CER de dev y semilla 42. El entrenamiento se ejecuto en una unica NVIDIA A100 de 80 GB en RunPod, con PyTorch 2.8.0 y Transformers 5.18.0.

Los datos proceden integramente del cubo validado de Common Voice Scripted Speech 27.0 Tatar (CC0). El autor re-divide el corpus porque los splits oficiales concentran 258 de 270 hablantes en test y dejan solo 2 para entrenamiento: el conjunto de entrenamiento resultante tiene 26.855 clips de 165 hablantes, el de dev 418 clips de 25 hablantes y el de test 1.122 clips de 80 hablantes, sin solapamiento de hablante ni de frase entre splits. Las etiquetas conservan el uso original de mayusculas y puntuacion, y un unico hablante aporta el 52 % de los clips de entrenamiento. La decodificacion usada en la evaluacion sigue BuzzASR: `num_beams=1`, `no_repeat_ngram_size=3` y `repetition_penalty=1.2`. No se documenta ninguna fase de RLHF ni DPO; es un ajuste supervisado puro sobre transcripciones.

## Capacidades

- Transcripcion de voz en tatar (`tt`) a texto cirilico, con mayusculas y puntuacion preservadas, lo que permite usarla como subtitulo con poca edicion posterior.
- Reconocimiento de habla leida sobre voces no vistas en entrenamiento: el test de referencia son 1.122 clips de 80 hablantes ausentes del conjunto de entrenamiento.
- Segmentacion de audio largo: con `return_timestamps=True` el pipeline trocea entradas de mas de 30 segundos y devuelve marcas temporales por segmento.
- Inferencia en float16, que reduce a la mitad el consumo de memoria respecto a los pesos en float32 del repositorio.
- Integracion directa con la libreria `transformers` mediante `pipeline("automatic-speech-recognition")` y compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- Herencia de la tarea `translate` del Whisper base hacia ingles: el decoder puede invocarse con `task="translate"`, pero el autor no evalua ni documenta traduccion para este ajuste.
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, vision ni audio generativo: es un modelo exclusivamente ASR.
- No es multilingue en la practica: el ajuste esta especializado en tatar aunque los pesos derivan de un modelo multilingue.

## Casos de uso

- Generacion de subtitulos para video en tatar: el modelo produce texto con mayusculas y puntuacion (CER crudo del 6,0 %, el mas bajo de todos los modelos comparados en el articulo del autor), por lo que la salida se puede publicar como subtitulo con revision minima, muy por debajo del trabajo de post-edicion que exigen los wav2vec2, que escriben en minusculas y sin signos.
- Archivado y transcripcion de corpus de habla leida: el ajuste esta entrenado sobre Common Voice, un corpus de lectura, y alcanza 4,3 % de CER en ese dominio, lo que lo hace adecuado para digitalizar grabaciones de lectura en tatar sin intervencion manual masiva.
- Documentacion y preservacion linguistica: convierte archivos de audio historico o comunitario en texto indexable en cirilico, un paso previo imprescindible para construir corpus escritos de una lengua con recursos limitados.
- Generacion de pares audio-texto para entrenar otros sistemas: las transcripciones del modelo sirven como pseudo-etiquetas para alimentar modelos TTS en tatar o para ampliar corpus de ASR con datos no anotados.
- Indexacion y busqueda sobre archivos de audio: combinando la transcripcion con las marcas temporales (`return_timestamps=True`) se puede construir un indice de texto que permita localizar fragmentos concretos dentro de horas de grabacion.
- Accesibilidad para hablantes de tatar: transcripcion de reuniones, clases o ponencias con salida en cirilico punteado, integrable en herramientas de subtitulado en directo con la advertencia de que el rendimiento sobre habla espontanea no esta medido.
- Evaluacion comparativa de ASR para lenguas turcicas: sirve como referencia (baseline) reproducible en tatar frente a sistemas wav2vec2 y frente al Whisper sin ajustar, con el conjunto de test publicado en la carpeta `splits/` del repositorio.
- Preprocesado de pipelines de traduccion tatar a otras lenguas: al transcribir primero con este modelo y traducir despues con un modelo de texto, se evita depender de un sistema de traduccion directa de voz que probablemente no exista para tatar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`) sobre el conjunto de test de Common Voice Scripted Speech 27.0 Tatar (run 2), compuesto por 1.122 clips de 80 hablantes no presentes en entrenamiento. CER y WER se calculan tras pasar a minusculas y eliminar puntuacion; el CER crudo compara la salida tal cual se produce.

| Modelo | CER normalizado (%) | WER normalizado (%) | CER crudo (%) |
|---|---|---|---|
| AigizK/wav2vec2-large-mms-1b-tatar, con su LM de n-gramas (CC BY-NC 4.0) | 3,2 | 19,3 | 10,6 |
| sammy786/wav2vec2-xlsr-tatar | 3,9 | 17,6 | 11,1 |
| **ifs/whisper-large-v3-tt-cv27-run2 (este modelo)** | **4,3** | **18,2** | **6,0** |
| ifs/whisper-large-v3-tt-cv27-run1 | 5,2 | 22,8 | 6,7 |
| yasalma/whisper-finetuned-tt-asr | 7,9 | 32,3 | 9,7 |
| openai/whisper-large-v3 sin ajustar | 32,1 | 89,3 | 33,5 |

Dos matices importantes que el autor documenta: primero, el modelo de AigizK nunca escribe la letra `й` y la sustituye por `⁇` en 347 de los 1.122 clips; si esa sustitucion se corrige, su CER cae al 2,2 % y su WER al 10,3 %. Segundo, este modelo no tiene puntuacion sobre el split de test oficial de Common Voice porque sus datos de entrenamiento incluyen a la mayoria de los hablantes de ese split, lo que invalidaria la comparacion.

## Requisitos de hardware

- VRAM estimada en float32: unos 6,2 GB solo para pesos, mas activaciones y buffers; en la practica requiere del orden de 7-8 GB.
- VRAM estimada en float16: unos 3,1 GB para pesos, con un consumo total tipico de 4-5 GB.
- GPU profesionales: el autor entreno con una NVIDIA A100 de 80 GB (para fine-tuning). Para inferencia basta con una GPU muy inferior.
- GPU de consumo: cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090 en float16. Tambien es viable en GPUs de 8 GB en float16 con audio corto.
- CPU: la model card contempla ejecucion en CPU con `device="cpu"` y `torch.float32`; es funcional pero notablemente mas lenta, sin cifras publicadas.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` (ruta documentada por el autor), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y cualquier stack que cargue safetensors de Whisper. Para `whisper.cpp`, `faster-whisper` o CTranslate2 haria falta convertir los pesos a sus formatos respectivos, conversion que el repositorio no documenta.
- Latencia y throughput: no disponible. El autor no publica medidas de latencia, RTF ni throughput, ni en GPU ni en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | CER / WER normalizados | CER crudo | Salida con mayusculas y puntuacion | Licencia |
|---|---|---|---|---|---|---|
| ifs/whisper-large-v3-tt-cv27-run2 | 1,54 mil millones | 30 s por segmento | 4,3 % / 18,2 % | 6,0 % | Si | MIT |
| ifs/whisper-large-v3-tt-cv27-run1 | No disponible (mismo tamano en la practica) | 30 s por segmento | 5,2 % / 22,8 % | 6,7 % | Si | No disponible en la informacion suministrada |
| AigizK/wav2vec2-large-mms-1b-tatar | No disponible (el nombre sugiere ~1B) | No disponible | 3,2 % / 19,3 % | 10,6 % | No (minusculas, sin puntuacion) | CC BY-NC 4.0 |
| sammy786/wav2vec2-xlsr-tatar | No disponible | No disponible | 3,9 % / 17,6 % | 11,1 % | No (minusculas, sin puntuacion) | No disponible |
| yasalma/whisper-finetuned-tt-asr | No disponible | 30 s por segmento | 7,9 % / 32,3 % | 9,7 % | No disponible | No disponible |
| openai/whisper-large-v3 (sin ajustar) | 1,54 mil millones | 30 s por segmento | 32,1 % / 89,3 % | 33,5 % | Si | MIT |

La ventaja diferencial del modelo es el CER crudo mas bajo de la tabla (6,0 %), que es la metrica que refleja el texto tal como sale del sistema. Dos alternativas wav2vec2 logran mejor CER normalizado, pero a costa de renunciar a mayusculas y puntuacion y, en el caso de AigizK, de un decodificador con LM bajo licencia CC BY-NC 4.0 que impide el uso comercial.

## Limitaciones y advertencias

- Evaluado unicamente sobre habla leida. El rendimiento en habla espontanea (videos de YouTube, podcasts, conversaciones) no se ha probado y el autor anticipa que sera peor.
- Un solo hablante aporta aproximadamente el 52 % de los clips de entrenamiento, lo que puede sesgar el modelo hacia sus caracteristicas de voz, acento o velocidad de habla.
- El cambio de codigo a ruso (code-switching), frecuente en comunidades tatar parlantes, no esta evaluado.
- La precision de las marcas temporales no esta evaluada; no se debe asumir exactitud a nivel de palabra.
- No existe puntuacion sobre el split de test oficial de Common Voice Tatar porque el entrenamiento solapa hablantes con ese split. Cualquier comparacion con modelos que si se evaluan en el split oficial no es homogenea.
- Los resultados de benchmark estan declarados por el autor como no verificados (`verified: false`); no han pasado por validacion independiente.
- Al ser un modelo entrenado sobre Common Voice, puede arrastrar sesgos de representacion del corpus: sobrerrepresentacion de determinados hablantes, registros de lectura y una variedad dialectal concreta del tatar.
- Riesgo de alucinacion y de bucles de repeticion propio de la decodificacion de Whisper; el autor mitiga con `no_repeat_ngram_size=3` y `repetition_penalty=1.2`, ajustes que conviene mantener.
- Licencia MIT para el modelo y datos de entrenamiento CC0, por lo que no hay restriccion de uso comercial derivada de este repositorio. Conviene comprobar por separado las licencias de los modelos de la comparativa si se reutilizan.
- Comunidad y adopcion minimas: 16 descargas y 0 likes en el momento del analisis, lo que implica poca validacion externa y escaso soporte de terceros.
- No cubre tareas generativas de texto, tool calling ni agentes; usarlo fuera del ambito ASR no es adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ifs/whisper-large-v3-tt-cv27-run2
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Version anterior (run 1): https://huggingface.co/ifs/whisper-large-v3-tt-cv27-run1
- Articulo tecnico del autor con la comparativa completa: https://ifs.name/post/tatar-asr/
- Apendice con el script de re-division de splits: https://ifs.name/post/tatar-asr/#appendix-b
- Apendice con el entorno de software: https://ifs.name/post/tatar-asr/#appendix-d
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ifs/tatar-asr
- Dataset Common Voice Scripted Speech 27.0 Tatar: https://mozilladatacollective.com/datasets/cmu62fysg00noo1077ljif8fv
- Receta de decodificacion BuzzASR (paper citado en la model card): https://arxiv.org/abs/2609.09554
- Carpeta de splits del repositorio: https://huggingface.co/ifs/whisper-large-v3-tt-cv27-run2/tree/main/splits
- Perfil del autor: https://ifs.name

Nota sobre la busqueda web: los resultados obtenidos corresponden a IFS AB, la empresa sueca de software empresarial, y a los estandares de certificacion alimentaria IFS, sin ninguna relacion con el autor de este modelo ni con el proyecto de ASR en tatar. No aportan enlaces adicionales relevantes.
