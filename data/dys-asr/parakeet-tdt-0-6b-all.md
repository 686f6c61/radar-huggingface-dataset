# dys-asr/parakeet-tdt-0.6b-all

## Resumen

Parakeet TDT 0.6B All es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el proyecto **dys-asr**, un fine-tune de `nvidia/parakeet-tdt-0.6b-v3` orientado especificamente a **habla disartrica y speech disorders**. El modelo parte de la arquitectura transducer TDT (Token-and-Duration Transducer) sobre encoder tipo FastConformer, con 627.057.286 parametros (~0,6 B) y entrenamiento exclusivamente en ingles. Su objetivo es mejorar la transcripcion de personas con trastornos neuromotores del habla (ELA, Parkinson, ataxia, paralisis cerebral, etc.), un dominio historicamente mal cubierto por los sistemas ASR genericos.

La particularidad de esta ficha es que se trata de una **entrada de competicion, no de un resultado medible**. El autor ha entrenado el modelo sobre las 1.047,7 horas completas del proyecto, incluyendo de forma deliberada el split de desarrollo de SAPC2 que el resto de la familia usa como conjunto de evaluacion, ademas de 15,5 horas de corpus externos (AtaxiaUK y HeyJay!) que lo convierten en un modelo de pista no restringida (*unconstrained track*). Por ese motivo la propia model card declara que no reporta WER ni CER y que no puede tenerlos: cada hora reservada para evaluacion esta dentro de los datos de entrenamiento.

Es relevante ahora por dos razones. Primero, porque ejemplifica una practica habitual en competiciones de ASR clinico: gastar el split de validacion como datos de entrenamiento cuando el objetivo es maximizar el resultado final. Segundo, porque su checkpoint publicado es la **epoca 10**, elegida por ser la ultima y no por haber sido medida como la mejor; el autor remite a su variante hermana (`dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup`) si se necesita un checkpoint con metrica fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) sobre encoder FastConformer |
| Parametros totales | 627.057.286 (~0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica como contexto de lenguaje; entrenado con segmentos de audio de 0,5 a 45 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | `speech-accessibility-project-dua` (license: other) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un **TDT (Token-and-Duration Transducer)**, una variante de arquitectura transducer que predice conjuntamente el token y su duracion, sobre un encoder tipo FastConformer. El punto de partida es `nvidia/parakeet-tdt-0.6b-v3`, con 627 millones de parametros. La inferencia se realiza con `ParakeetForTDT` y `AutoProcessor` de `transformers` (se requiere `transformers>=5.9`), con audio obligatoriamente a 16 kHz mono.

El fine-tune se ejecuto durante **diez epocas sobre dieciseis GH200**, con batch efectivo 32, AdamW a 1e-4 y un scheduler tri-stage (10% warmup, 40% hold), weight decay 0,01, layerdrop 0,05, gradient clip 1.0, bf16 y semilla 42, totalizando 153.460 pasos de optimizador. La ejecucion se repartio en tres asignaciones a lo largo de tres dias, reanudando desde el ultimo checkpoint completo. La aumentacion incluye perturbacion de velocidad en linea sobre los factores 0,9 / 0,95 / 1,0 / 1,05 / 1,1 y SpecAugment al 5% del eje temporal (tramos de 10 frames) y 40% del eje mel (tramos de 27 bins).

Los datos de entrenamiento suman **491.063 registros y 1.047,7 horas** tras filtrado, compuestos por SAPC1 train (445,0 h), SAPC2 train (307,5 h), 103,1 h de voz sintetica generada con un Fun-CosyVoice3 fine-tuneado en modo zero-shot voice cloning, 79,2 h recuperadas troceando grabaciones que excedian el limite de 45 segundos y 15,5 h de AtaxiaUK y HeyJay! (fuera de los corpus del challenge). El split de desarrollo de SAPC2 (34,0 h) se usa como datos de entrenamiento. El filtrado aplica un rango de 0,5 a 45 segundos y un maximo de 200 tokens de etiqueta, descartando 138 enunciados; SAPC2 republica 182.575 grabaciones de SAPC1 bajo los mismos nombres de fichero, por lo que el audio real se deduplica por nombre. Los tramos entre corchetes, que en SAPC2 contienen el prompt de entrevista y no texto leido, se eliminan antes de la normalizacion.

## Capacidades

- **Reconocimiento automatico del habla disartrico**: transcripcion de voz con disartria de diversas etiologias, incluyendo enfermedad de Parkinson, ELA, ataxia y otras condiciones neuromotoras.
- **Transcripcion general en ingles**: al derivar de `parakeet-tdt-0.6b-v3`, conserva capacidad de ASR en ingles estandar, aunque el fine-tune esta orientado al dominio clinico.
- **Manejo de habla espontanea**: el troceado de las 79,2 h recuperadas incide especialmente en `Spontaneous Speech Prompts`, lo que sugiere cobertura de habla conectada y no solo de lectura de prompts.
- **Deteccion de limites de palabra via TDT**: la prediccion de duracion integrada en la arquitectura permite modelar pausas y alineaciones de forma implicita.
- **Salida de texto plano**: no soporta tool calling, function calling, agentes, vision, audio de entrada adicional ni modos de razonamiento. Es exclusivamente un modelo ASR.
- **Multilingue**: no disponible. Solo ingles.

## Casos de uso

- **Subtitulado accesible para personas con trastornos del habla**: transcripcion en tiempo casi real de intervenciones en reuniones, clases o videollamadas, usando el modelo sobre streaming en trozos cortos; la orientacion al dominio disartrico mejora la precision frente a ASR generico.
- **Comunicacion aumentativa y alternativa (AAC)**: integracion en aplicaciones que convierten voz disartrica en texto para personas con ELA o paralisis cerebral, donde el habla puede ser inteligible solo para interlocutores familiares.
- **Documentacion clinica por dictado**: profesionales con discapacidad motora o pacientes que dictan informes; el modelo transcribe audio de 16 kHz mono y el resultado se puede integrar en pipelines de historia clinica electronica.
- **Investigacion en ASR de habla patologica**: como checkpoint de referencia de la familia dys-asr, util para estudiar el impacto del troceado de grabaciones largas, la deduplicacion por nombre de fichero o la inclusion de splits de desarrollo en el entrenamiento.
- **Etiquetado y aumento de corpus clinicos**: transcripcion asistida de grabaciones para su posterior revision manual, reduciendo el coste de anotacion en corpus de habla disartrica de gran tamano.
- **Pipelines de soporte en centros de atencion al paciente**: transcripcion de llamadas o consultas grabadas con consentimiento, con el objetivo de generar resumenes o buscar informacion por palabras clave.
- **Evaluacion comparativa de tecnicas de aumentacion**: la receta (speed perturbation estrecha y SpecAugment concreto) sirve como punto de partida reproducible para experimentos de ASR en dominios de baja variedad de hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que **el modelo no reporta WER ni CER y que no puede tenerlos**, porque cada hora reservada para evaluacion esta dentro de sus datos de entrenamiento. El autor remite a la variante hermana como fuente de metricas fiables.

| Modelo | Metrica reportada | Conjunto de evaluacion | Observaciones |
|---|---|---|---|
| `dys-asr/parakeet-tdt-0.6b-all` (este) | no disponible por diseno | no aplica | Todo el material de validacion esta en entrenamiento |
| `dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup` (hermano) | ~6,06% CER (epoca 9) frente a ~6,09% (epoca 10) en la variante que si reserva dev | SAPC2 dev | Cifra citada en la propia model card como referencia de la familia |

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP32 los pesos ocupan aproximadamente 2,5 GB (el repositorio pesa 2,5 GB en safetensors); en FP16/BF16 unos 1,25 GB; en INT8 en torno a 0,7 GB; en INT4 aproximadamente 0,4 GB, mas el overhead de activaciones y buffers del encoder.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Para experimentacion, una RTX 3060 (12 GB), RTX 4070 o RTX 4090 sobran. Para despliegue de alta concurrencia, A100 o H100 permiten lotes grandes y mayor throughput.
- **Compatibilidad con GPU de consumo**: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente. La inferencia en CPU tambien es viable dado el tamano del modelo.
- **Opciones de despliegue**: el camino documentado en la model card es `transformers>=5.9` con `ParakeetForTDT` y `AutoProcessor`. El modelo base `nvidia/parakeet-tdt-0.6b-v3` pertenece al ecosistema NVIDIA NeMo, por lo que NeMo es la via nativa alternativa. No aplican llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje. Para vLLM, TGI u otros servidores, no disponible en la informacion proporcionada.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dys-asr/parakeet-tdt-0.6b-all` (este) | 627.057.286 | Segmentos de audio de 0,5 a 45 s | Sin WER/CER publicados por diseno | `speech-accessibility-project-dua` (other) | HuggingFace, safetensors, transformers |
| `dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup` (hermano) | misma familia (~0,6 B) | no disponible | ~6,06% CER en SAPC2 dev (epoca 9) | no disponible | HuggingFace |
| `nvidia/parakeet-tdt-0.6b-v3` (base) | 0,6 B | no aplica (ASR) | no disponible | no disponible | HuggingFace (modelo base del fine-tune) |

No se dispone de especificaciones completas de los modelos comparables en la informacion proporcionada; las filas se limitan a lo documentado en la model card de este modelo.

## Limitaciones y advertencias

- **Sin metrica de rendimiento**: el modelo no puede reportar WER ni CER porque todos los conjuntos de evaluacion habituales estan incluidos en sus datos de entrenamiento. No debe usarse como referencia de calidad ASR.
- **Checkpoint no seleccionado**: los pesos publicados son la epoca 10, elegida por ser la ultima y no por haber sido evaluada como la mejor. En la variante hermana, la epoca 9 supero a la 10 (6,06% frente a 6,09% CER), lo que indica que "ultima" no equivale a "mejor" en esta receta.
- **Idioma unico**: solo ingles. No hay soporte multilingue documentado.
- **Sesgo de datos sinteticos**: las 103,1 h generadas con Fun-CosyVoice3 pueden arrastrar artefactos de TTS, reproducir de forma imperfecta la afectacion del hablante y no aportan diversidad de hablantes nueva, ya que clonan voces ya presentes en el corpus.
- **Sesgo de composicion**: el troceado de grabaciones largas afecta de forma desproporcionada a `Spontaneous Speech Prompts` (92% de lo descartado por el limite de 45 s), por lo que el habla conectada esta representada de forma distinta al habla leida.
- **Riesgo de alucinacion**: como todo modelo ASR, puede generar texto plausible en tramos de silencio o audio de baja calidad, especialmente en voz muy degradada.
- **Restricciones de licencia**: la licencia `speech-accessibility-project-dua` es un acuerdo de uso de datos vinculado al Speech Accessibility Project (Beckman Institute, Universidad de Illinois). No se ha confirmado en la informacion disponible si permite uso comercial; debe consultarse el texto completo antes de cualquier despliegue en produccion.
- **Requisitos de entrada estrictos**: audio a 16 kHz mono y `transformers>=5.9`; el preprocesado incorrecto degrada la transcripcion.
- **Uso compasivo en contexto clinico**: cualquier despliegue en salud debe asumir revision humana, dado que la ausencia de metricas impide estimar la tasa de error real en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-all
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante hermana con dev reservado (referencia de metricas de la familia): https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup
- Dataset SAPC1: https://huggingface.co/datasets/dys-asr/sapc1
- Dataset SAPC2: https://huggingface.co/datasets/dys-asr/sapc2
- Licencia Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/

Nota: los resultados de busqueda web devueltos corresponden a recursos generales sobre trastornos "dys" en frances (Federacion Francesa de los DYS, Wikipedia, etc.) y no guardan relacion tecnica con este modelo; se han descartado por no aportar informacion sobre el artefacto.
