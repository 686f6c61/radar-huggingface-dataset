# baki83/whisper-v3-turbo-juznevesti-sr-lora

## Resumen

baki83/whisper-v3-turbo-juznevesti-sr-lora es un adaptador LoRA (PEFT) de 0,1 GB entrenado sobre el modelo base openai/whisper-large-v3-turbo, el sistema de reconocimiento automático de voz (ASR) de OpenAI. Lo publica el usuario baki83 bajo licencia MIT y su nombre apunta a un ajuste fino orientado a audio en serbio del dominio periodístico (juznevesti-sr), aunque la model card no documenta el conjunto de datos de entrenamiento.

El adaptador se entrenó durante 2 épocas (1082 pasos) con learning rate 1e-4, batch total de 16 y optimizador PagedAdamW de 8 bits. En su propio conjunto de evaluación alcanza una pérdida de 0,4765, un WER de 29,1655 % y un WER normalizado de 21,1180 %, cifras que indican una calidad limitada pero funcional para un idioma de recursos medios como el serbio, donde el rendimiento del Whisper original suele degradarse.

Su relevancia práctica está en el formato: al ser un adaptador LoRA sobre un modelo base de 809 M de parámetros, se puede cargar con pocos megabytes adicionales, fusionar con los pesos base o distribuir como complemento, reduciendo drásticamente el coste de adaptar ASR multilingüe a un dominio concreto. No obstante, el repositorio acumula 0 descargas y 0 likes y no incluye resultados en el model-index, por lo que carece de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (Whisper large-v3-turbo); el adaptador no altera la topologia base |
| Parametros totales | Adaptador: no disponible (el rango y el numero de modulos LoRA no se declaran). Modelo base: 809 M segun la documentacion publica de OpenAI |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base procesa ventanas de audio de 30 segundos (1500 frames de mel-espectrograma) |
| Tipos de cuantizacion | No declarados para el adaptador; el modelo base admite fp16, int8 y cuantizaciones GGUF (q4, q5, q8) mediante whisper.cpp |
| Idiomas soportados | La model card no declara idiomas; el nombre del repositorio indica serbio (sr). El modelo base es multilingue (99 idiomas segun OpenAI) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se distribuye en safetensors y .bin |
| Libreria | peft (PEFT 0.21.0), transformers 5.17.0, PyTorch 2.11.0+cu130 |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion) y 23 de septiembre de 2026 (ultima actualizacion), segun los metadatos del repositorio |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Whisper large-v3-turbo, un transformer encoder-decoder de tipo secuencia a secuencia que convierte espectrogramas mel de 80 canales en tokens de texto. La variante turbo reduce el decodificador a 4 capas (frente a las 32 del encoder), lo que abarata la generacion de tokens a costa de una ligera perdida de precision. El adaptador LoRA congela los pesos base e inyecta matrices de bajo rango en capas seleccionadas, de modo que solo se entrena una fraccion minima de parametros; ni el rango ni los modulos objetivo (`q_proj`, `v_proj`, etc.) se especifican en la model card.

El entrenamiento se realizo con los siguientes hiperparametros declarados: learning rate 1e-4 con scheduler lineal y warmup de 0,05, batch de entrenamiento 4, acumulacion de gradientes 4 (batch efectivo 16), semilla 42, 2 epocas completas y optimizador PagedAdamW de 8 bits con betas (0,9; 0,999) y epsilon 1e-8. La evaluacion se hizo cada 250 pasos con batch 4. No se documenta el dataset, su tamano, su composicion ni si hubo etapas de RLHF o DPO; la model card indica literalmente "unknown dataset" y "More information needed". No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.).

## Capacidades

- Transcripcion de voz a texto (ASR) en ventanas de hasta 30 segundos, heredada del modelo base Whisper large-v3-turbo.
- Identificacion implicita del idioma y transcripcion multilingue por parte del modelo base, aunque el ajuste fino se orienta a serbio.
- Generacion de texto condicionada a audio: transcripcion con puntuacion, mayusculas y segmentacion temporal mediante timestamps.
- Capacidad potencial de traduccion de voz a texto e ingles, propia de Whisper, no verificada tras el ajuste fino.
- Integracion en el ecosistema Hugging Face mediante `peft` y `transformers`: carga como adaptador (`PeftModel`) o fusion con los pesos base.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no son capacidades de un modelo ASR).
- No se declara capacidad de vision, audio generation ni modo "thinking".
- Rendimiento declarado en su conjunto de evaluacion: WER 29,1655 % y WER normalizado 21,1180 %.

## Casos de uso

- Transcripcion de archivos de audio periodistico en serbio: el ajuste sobre el dominio "juznevesti" sugiere una mejora relativa en vocabulario y nombres propios de informativos o reportajes, donde el Whisper generico tiende a fallar en toponimos y declinaciones.
- Generacion de subtitulos para video bajo demanda: el modelo base produce timestamps por segmento, utiles para emitir subtitulos WebVTT o SRT de contenido en serbio sin pasar por un servicio en la nube.
- Archivado y busqueda de audio historico: transcripcion masiva de una fonoteca para indexar contenido hablado y permitir busqueda por palabras clave, aprovechando que el adaptador es ligero y puede ejecutarse en lote.
- Preprocesado de datasets de voz: uso del adaptador para etiquetar o limpiar corpus de audio serbio antes de entrenar otros modelos, con la ventaja de un coste de inferencia bajo al ser un modelo de 809 M.
- Asistencia a la accesibilidad: transcripcion en tiempo casi real de reuniones o clases en serbio en equipos de consumo, gracias a que el modelo base cabe en GPUs de gama media y en CPU con cuantizacion GGUF.
- Analisis de medios y monitorizacion: transcripcion de boletines y programas de radio para extraer temas, entidades y citas en flujos de analisis posteriores con modelos de lenguaje.
- Investigacion en ASR de bajo recursos: punto de partida reproducible (semilla 42, hiperparametros completos) para comparar estrategias de adaptacion LoRA en lenguas eslavas del sur.
- Despliegue en el borde: al ser un adaptador de 0,1 GB, puede empaquetarse junto a una version cuantizada del modelo base para su uso en portatiles o entornos sin GPU dedicada.

## Benchmarks y rendimiento

El model-index del repositorio declara una entrada (`whisper-v3-turbo-juznevesti-sr-lora`) con la lista de resultados vacia, por lo que no hay benchmarks oficiales publicados. Los unicos datos disponibles son los de la evolucion del entrenamiento en el conjunto de evaluacion interno del autor:

| Paso | Epoca | Perdida de validacion | WER (%) | WER normalizado (%) |
|---|---|---|---|---|
| 250 | 0,4627 | 0,5059 | 30,8107 | 22,3402 |
| 500 | 0,9255 | 0,4878 | 29,8022 | 21,6079 |
| 750 | 1,3869 | 0,4821 | 29,4449 | 21,4017 |
| 1000 | 1,8496 | 0,4773 | 29,1849 | 21,1786 |
| 1082 | 2,0 | 0,4765 | 29,1655 | 21,1180 |

No hay curva de perdida de entrenamiento final ni comparacion con el modelo base sin adaptar dentro del repositorio, por lo que no es posible cuantificar la mejora atribuible al LoRA. Tampoco se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generales, que por otra parte no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16: aproximadamente 1,6-2 GB solo de pesos, mas activaciones y cache; en la practica 2-4 GB de VRAM con `transformers`.
- VRAM estimada en int8: en torno a 0,9-1,5 GB; en cuantizaciones GGUF q5 o q4, aproximadamente 0,6-1 GB.
- El adaptador LoRA anade un consumo marginal (el repositorio completo ocupa 0,1 GB).
- GPUs recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, T4). Para procesamiento por lotes a gran escala se recomiendan A100, H100 o L40S.
- Cabe en GPU de consumo: si, incluida la mayoria de portatiles con GPU dedicada; tambien es viable en CPU mediante whisper.cpp o faster-whisper con cuantizacion.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador y `merge_and_unload`), faster-whisper con CTranslate2, whisper.cpp con GGUF, servidores de inferencia de Hugging Face. El soporte de Whisper en vLLM y TGI es limitado o inexistente, por lo que no se recomiendan como via principal.
- Latencia y throughput: no publicados. Cualitativamente, el decodificador de 4 capas de la variante turbo de Whisper reduce notablemente el coste de decodificacion frente a large-v3, aunque no se dispone de cifras medidas para este adaptador concreto.
- No se documenta el hardware utilizado durante el entrenamiento (tipo de GPU, duracion, consumo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | WER en serbio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| baki83/whisper-v3-turbo-juznevesti-sr-lora (adaptador) | No disponible (base de 809 M) | Ventanas de 30 s (heredado del base) | No declarados; orientado a serbio por nombre | 29,1655 % (21,1180 % normalizado) en su propio conjunto de evaluacion | MIT | Hugging Face, 0 descargas |
| openai/whisper-large-v3-turbo | 809 M | Ventanas de 30 s | 99 (segun OpenAI) | No disponible | MIT | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | Ventanas de 30 s | 99 (segun OpenAI) | No disponible | MIT | Hugging Face |
| openai/whisper-medium | 769 M | Ventanas de 30 s | Multilingue (Whisper v2) | No disponible | MIT | Hugging Face |

No se dispone de datos publicos comparables de WER en serbio para los modelos base ni para otros ajustes finos de la comunidad, por lo que la comparacion cuantitativa de rendimiento no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- El WER declarado (29,1655 %, 21,1180 % normalizado) es elevado en terminos absolutos: en torno a uno de cada cinco caracteres o palabras del conjunto de evaluacion se transcribe mal. No se especifica como se calculo la normalizacion ni el tamano del conjunto de evaluacion.
- La model card no documenta el dataset de entrenamiento ("unknown dataset"), su procedencia, su licencia ni su composicion, lo que impide auditar sesgos de dominio, acento o calidad de las etiquetas.
- El nombre del repositorio sugiere un ajuste especifico al dominio de un medio de comunicacion (juznevesti), con riesgo de sobreajuste de dominio y de degradacion fuera de ese registro o de ese acento.
- Solo 2 epocas y 1082 pasos sobre un adaptador LoRA: el ajuste es ligero y puede no compensar el sesgo del modelo base en serbio.
- No se documenta si el ajuste degrada el rendimiento en otros idiomas; el olvido catastrofico es un riesgo conocido al especializar modelos multilingues.
- Whisper, y por extension este adaptador, es propenso a alucinar texto en segmentos con silencio, ruido o musica; en produccion conviene aplicar deteccion de voz y filtros de confianza.
- Errores tipicos del ASR en lenguas eslavas: confusion de casos gramaticales, nombres propios y numeros; el WER normalizado bajo respecto al bruto sugiere que parte del error esta en puntuacion y formato.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, pero el modelo base tambien se distribuye bajo MIT, por lo que conviene conservar la atribucion.
- El repositorio no tiene descargas ni likes y no incluye resultados en el model-index: no existe validacion independiente de las cifras declaradas.
- Los metadatos del repositorio indican fechas de 2026; conviene verificar la fecha real de publicacion antes de citarlo.
- No se declaran limitaciones de longitud de contexto mas alla de la ventana de 30 segundos del modelo base, que obliga a trocear audios largos y puede degradar la coherencia entre segmentos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/baki83/whisper-v3-turbo-juznevesti-sr-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Transformers para Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos correspondian a perfiles academicos no relacionados (Marjolein Luman, Vrije Universiteit Amsterdam), por lo que se descartan como fuentes.
