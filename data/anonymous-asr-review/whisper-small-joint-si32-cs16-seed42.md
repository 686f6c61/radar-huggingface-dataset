# anonymous-asr-review/whisper-small-joint-si32-cs16-seed42

## Resumen

El modelo `anonymous-asr-review/whisper-small-joint-si32-cs16-seed42` es un conjunto de adaptadores LoRA (PEFT) sobre el modelo base `openai/whisper-small`, orientado al reconocimiento automatico del habla (ASR) en sinhala y en escenarios de cambio de codigo (code-switching) sinhala-ingles. No se trata de un modelo independiente, sino de un delta de pesos que debe fusionarse con los pesos originales de Whisper-small, que se descargan por separado desde el repositorio de OpenAI.

El autor se identifica como `anonymous-asr-review` y la propia model card lo describe como un "modelo suplementario anonimo para revision por pares", lo que indica que su proposito es la reproducibilidad de resultados en un proceso de evaluacion cientifica, no el despliegue en produccion. Incluye dos adaptadores entrenados conjuntamente: uno de rango 32 para sinhala y otro de rango 16 para code-switching, con semilla 42, alpha de LoRA 32 y seleccion del mejor checkpoint.

Su relevancia es acotada pero especifica: el cambio de codigo sinhala-ingles es un fenomeno poco cubierto por los modelos ASR multilingues de proposito general, y los adaptadores de bajo rango permiten especializar un modelo de 244 M de parametros con un coste de almacenamiento y computo minimo sobre una arquitectura encoder-decoder ya consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small); adaptadores LoRA sobre las proyecciones de atencion del modelo base |
| Parametros totales | 244 M en el modelo base `openai/whisper-small`; los adaptadores anaden un numero de parametros entrenables no especificado (rango 32 para sinhala, rango 16 para code-switching) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (log-Mel spectrogram de 80 canales, 3000 frames reducidos a 1500 tras el downsampling convolucional del encoder); el decodificador del modelo base admite hasta 448 posiciones de texto |
| Tipos de cuantizacion | no disponible para los adaptadores (se distribuyen en precision completa en safetensors y se fusionan con el base); el modelo base admite fp32, fp16/bf16, int8 y cuantizaciones GGUF de 4 a 8 bits tras la conversion |
| Idiomas soportados | sinhala (`si`) e ingles (`en`) en los adaptadores; el modelo base cubre alrededor de 99 idiomas |
| Licencia | no disponible en la model card; el modelo base `openai/whisper-small` se publica bajo licencia MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base debe descargarse aparte |
| Libreria | `peft` |
| Pipeline | `automatic-speech-recognition` |
| Tamano del repositorio | 0,0 GB segun HuggingFace (dato probablemente incompleto para contener dos adaptadores) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper-small: un transformer encoder-decoder de 244 M de parametros que procesa espectrogramas log-Mel de 80 canales calculados sobre ventanas de 30 segundos a 16 kHz. El encoder aplica dos capas convolucionales de downsampling (de 3000 a 1500 frames) antes de la pila de atencion, y el decodificador genera texto de forma autorregresiva condicionado por tokens especiales de idioma y tarea. Sobre esta base se anaden adaptadores LoRA de bajo rango en las proyecciones de atencion, lo que reduce el numero de parametros entrenables a una fraccion minima del total.

Segun la model card, los dos adaptadores se actualizaron de forma conjunta durante el entrenamiento de code-switching: el adaptador de sinhala tiene rango 32 y el de code-switching rango 16, con alpha de LoRA 32, semilla 42 y seleccion del mejor checkpoint. No se especifican el numero de tokens ni las horas de audio empleadas, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). Tampoco se detalla el regimen de congelacion del modelo base ni la estrategia de mezcla de datos entre los dos adaptadores.

La innovacion tecnica destacable es el propio esquema de fusion: ambos adaptadores deben activarse simultaneamente a peso unitario y combinarse mediante `combination_type="cat"`, es decir, concatenando sus matrices de bajo rango, tras lo cual se ejecuta `merge_and_unload()`. Esto implica que el delta de pesos resultante no puede descomponerse de nuevo en sus dos componentes originales una vez fusionado, y que no es posible usar un adaptador sin el otro segun la propia documentacion del autor.

## Capacidades

- Reconocimiento automatico del habla en sinhala sobre audio a 16 kHz.
- Reconocimiento de habla en ingles en el mismo modelo fusionado.
- Transcripcion de audio con cambio de codigo sinhala-ingles dentro de un mismo enunciado, que es el objetivo declarado del entrenamiento conjunto.
- Transcripcion de segmentos de hasta 30 segundos por inferencia; el audio mas largo requiere troceado o estrategias de long-form decoding.
- Capacidad multilingue heredada del modelo base, aunque los adaptadores solo especializan sinhala e ingles.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, planificacion ni razonamiento multi-paso.
- No dispone de vision ni de generacion de audio; es exclusivamente un modelo de entrada de audio y salida de texto.
- No incorpora un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Transcripcion de reuniones bilingues sinhala-ingles: el modelo mantiene un unico flujo de reconocimiento cuando los hablantes alternan entre ambos idiomas, evitando el cambio manual de modelo o de token de idioma que exigiria un Whisper-small estandar.
- Subtitulado de contenido audiovisual en Sri Lanka: los adaptadores permiten generar subtitulos para contenido donde el narrador mezcla terminos tecnicos o comerciales en ingles dentro de una frase en sinhala, un patron muy frecuente en medios de comunicacion.
- Atencion al cliente en centros de contacto: transcripcion automatica de llamadas de soporte donde el cliente habla sinhala y emplea terminologia de producto en ingles, lo que alimenta sistemas de analitica y control de calidad.
- Documentacion clinica o legal dictada: profesionales que dictan informes en sinhala con nomenclatura medica o juridica en ingles pueden transcribirse con un unico pase, reduciendo la correccion manual posterior.
- Investigacion linguistica sobre code-switching: obtencion de transcripciones anotadas de corpus orales para estudiar la distribucion y las restricciones sintacticas de los cambios de idioma en sinhala-ingles.
- Reproducibilidad en revision por pares: el propio proposito declarado del repositorio es permitir que revisores reproduzcan los resultados del articulo asociado partiendo de la semilla 42 y del pipeline de carga documentado.
- Preprocesado de corpus de voz para entrenamiento de sistemas TTS: la transcripcion alineada con audio facilita la generacion de pares texto-audio para sintesis de voz en sinhala.
- Accesibilidad en tiempo casi real: integrado en un backend de inferencia con baja latencia, puede alimentar subtitulos en directo para personas con discapacidad auditiva en entornos bilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, ni comparaciones con otros sistemas, ni la composicion exacta del conjunto de evaluacion.

## Requisitos de hardware

- Los adaptadores LoRA ocupan del orden de megabytes, aunque el repositorio declara 0,0 GB, un dato que no permite estimar su tamano real de forma fiable.
- Peso del modelo base en fp32: aproximadamente 1 GB; en fp16/bf16: aproximadamente 0,5 GB; en int8: aproximadamente 0,25 GB.
- VRAM estimada para inferencia en fp16 con activaciones y buffers de audio: del orden de 1 a 2 GB, segun el backend y el tamano del lote.
- Cabe con holgura en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090) e incluso puede ejecutarse en CPU con latencias mayores.
- GPU profesionales como A100, H100 o L40S no aportan ventaja significativa para un modelo de este tamano salvo en escenarios de batched inference a gran escala.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada por el autor; tambien es viable fusionar con `merge_and_unload()` y convertir a CTranslate2 para `faster-whisper`, o exportar a GGUF para `whisper.cpp` y Ollama. El soporte de LoRA en vLLM y TGI esta pensado principalmente para modelos decoder-only, por lo que la compatibilidad con Whisper deberia verificarse antes de usarlos.
- Latencia y throughput: no disponible. Dependen del backend, del hardware y de la longitud del audio, aunque Whisper-small es sustancialmente mas rapido que Whisper-large en cualquier plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-joint-si32-cs16-seed42 (adaptadores) | 244 M base + LoRA r32/r16 | 30 s | si, en | no disponible | HuggingFace, autor anonimo, 0 descargas |
| openai/whisper-small | 244 M | 30 s | ~99 | MIT | HuggingFace y GitHub, ampliamente adoptado |
| openai/whisper-medium | 769 M | 30 s | ~99 | MIT | HuggingFace y GitHub |
| openai/whisper-large-v3 | 1550 M | 30 s | ~99 | MIT | HuggingFace y GitHub |

No se dispone de datos de rendimiento comparado (WER u otras metricas) para establecer una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card, lo que impide determinar si el uso comercial esta permitido. El modelo base es MIT, pero la licencia de los adaptadores es una incognita legal.
- Se trata de un artefacto anonimo de revision por pares, sin autor identificable, sin revision de la comunidad (0 descargas y 0 likes) y sin mantenimiento previsible. No es adecuado para produccion.
- El repositorio declara un tamano de 0,0 GB, lo que sugiere que la informacion de HuggingFace puede estar incompleta o que los ficheros podrian no estar correctamente subidos.
- No hay resultados de benchmarks publicados, por lo que no puede verificarse la mejora frente a Whisper-small sin adaptadores.
- Los dos adaptadores deben activarse juntos a peso 1,0; no es posible usar solo el de sinhala o solo el de code-switching sin alterar el comportamiento previsto.
- La fusion con `merge_and_unload()` es irreversible: una vez combinados, los adaptadores no pueden separarse ni reajustarse individualmente.
- Existe una inconsistencia en la model card entre el encabezado (adaptadores de rango 32 y 16) y el campo "Adapter rank: 16", lo que dificulta reproducir exactamente la configuracion.
- Whisper-small, como toda la familia Whisper, es propenso a alucinaciones en segmentos con silencio, musica o ruido, incluyendo repeticiones y frases inventadas.
- La ventana de 30 segundos limita el contexto acustico; el audio largo requiere troceado, con riesgo de perder informacion en las fronteras.
- El rendimiento fuera de los dominios representados en el entrenamiento (acentos regionales, audio telefonico, ruido de fondo) no esta documentado.
- No hay informacion sobre sesgos demograficos, de genero o de variedad dialectal del sinhala evaluada.
- Al estar especializado en sinhala e ingles, el resto de idiomas del modelo base puede degradarse tras la fusion de los adaptadores.
- La model card no documenta el dataset de entrenamiento, por lo que no puede auditarse el origen de los datos ni posibles problemas de consentimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-joint-si32-cs16-seed42
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Articulo de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Repositorio de PEFT: https://github.com/huggingface/peft
- Documentacion de PEFT: https://huggingface.co/docs/peft

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Los enlaces recuperados correspondian al colectivo hacktivista Anonymous, a una tienda de calzado danesa y a articulos periodisticos sin relacion con el modelo, por lo que se han descartado.
