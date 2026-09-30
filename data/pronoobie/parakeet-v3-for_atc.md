# pronoobie/Parakeet-v3-For_ATC

## Resumen

Parakeet-v3-For_ATC es una conversión al formato GGUF de [`qenneth/parakeet-tdt-0.6b-v3-finetuned-for-ATC`](https://huggingface.co/qenneth/parakeet-tdt-0.6b-v3-finetuned-for-ATC), un modelo de reconocimiento automático del habla (ASR) derivado de `nvidia/parakeet-tdt-0.6b-v3` y ajustado específicamente para transcripción de comunicaciones de control de tráfico aéreo (ATC). El repositorio lo publica el usuario `pronoobie` y su único propósito es facilitar la conversión de pesos, no un nuevo entrenamiento: se trata de un cambio de formato, con precisión F16 por defecto, generado con el framework CrispASR.

El modelo resuelve un problema de nicho: la transcripción de audio aeronáutico, caracterizado por terminología muy específica, ruido de radio, interferencias de portadora, solapamiento de voces y condiciones acústicas adversas. Frente a un ASR generalista, este ajuste fino sobre el dataset `jacktol/ATC-ASR-Dataset` mejora la precisión en ese dominio. El modelo ajustado original reporta un WER de validación de 0,0558 y un WER de test de 0,0599 sobre los splits de evaluación de dicho dataset.

Con 627.115.158 parámetros (aproximadamente 0,6 mil millones) y un repositorio de 1,3 GB, es un modelo pequeño y apto para inferencia local u offline. Su relevancia actual radica en que el formato GGUF permite ejecutarlo en entornos sin conexión con requisitos de hardware modestos, integrándolo en aplicaciones de procesamiento de voz en aviación. No obstante, la propia model card advierte de que no debe usarse como componente único de sistemas de seguridad crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet-TDT / Transformer-Transducer (TDT) |
| Parametros totales | 627.115.158 (aproximadamente 0,6 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; la informacion disponible no especifica ventana de audio ni contexto) |
| Tipos de cuantizacion | F16 por defecto; el repositorio esta etiquetado como gguf, pero no se detallan otras cuantizaciones (Q8, Q4, etc.) |
| Idiomas soportados | en, fr, de segun los tags del repositorio; la model card declara unicamente ingles como idioma de trabajo del dominio ATC |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo original esta en safetensors) |
| Frecuencia de muestreo | 16 kHz |
| Framework de conversion | CrispASR |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo se basa en Parakeet-TDT, una arquitectura de tipo Transformer-Transducer con decodificacion Token-and-Duration Transducer (TDT). Parakeet-TDT es la familia de ASR de NVIDIA que sustituye la decodificacion CTC clasica por un esquema transducer que predice simultaneamente tokens y duraciones, lo que permite mejorar la relacion entre precision y velocidad de decodificacion. El modelo ascendente, `nvidia/parakeet-tdt-0.6b-v3`, es una version multilingue de 600 millones de parametros que amplia el soporte de idiomas del v2 (solo ingles) a 25 lenguas europeas y realiza deteccion automatica de idioma.

El ajuste fino fue realizado por el autor `qenneth` con NVIDIA NeMo sobre el dataset `jacktol/ATC-ASR-Dataset`, orientado a comunicaciones de control de trafico aereo. Esta conversión GGUF no anade entrenamiento ni ajuste adicional: es unicamente un cambio de formato destinado a runtimes locales compatibles con la arquitectura Parakeet GGUF. No se dispone de informacion sobre el numero de tokens de audio utilizados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que no se trata de un modelo generativo conversacional sino de un sistema ASR entrenado con objetivos supervisados de transcripcion.

## Capacidades

- Transcripcion automatica de voz (ASR) de comunicaciones de control de trafico aereo en condiciones de ruido de radio y terminologia aeronautica.
- Entrada de audio a 16 kHz, compatible con pipelines de captura y preprocesado de voz.
- Soporte de terminologia especifica de aviacion y ATC aprendida durante el ajuste fino.
- Etiquetado como multilingue (en, fr, de) en los tags del repositorio, aunque la model card solo declara ingles como idioma del dominio; no hay evidencia de evaluacion en frances o aleman.
- Inferencia local u offline gracias al formato GGUF.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de comunicaciones ATC: el modelo convierte audio de radio aeronautica en texto, aprovechando el ajuste fino sobre terminologia y condiciones acusticas especificas del dominio.
- Integracion en el pipeline ATC Audio Analyzer: el repositorio declara explicitamente que este GGUF se destina al proyecto [ATC-Audio-Analyzer](https://github.com/deepanshu-yadav/ATC-Audio-Analyzer), que combina captura de audio, filtrado paso alto (>100 Hz) y reduccion espectral de ruido antes de la transcripcion.
- Analisis y auditoria de comunicaciones: transcripcion de grabaciones de radio para revision posterior, busqueda de eventos o analisis de incidencias en un entorno offline.
- Investigacion en ASR de aviacion: servir como punto de partida o referencia para experimentos sobre reconocimiento de voz en dominio aeronautico y para medir el efecto de tecnicas de preprocesado.
- Benchmarking de ASR de dominio especifico: comparar el rendimiento de distintas aproximaciones (modelos genericos frente a ajustados) sobre audio ATC representativo.
- Aplicaciones ASR locales sin conexion: despliegue en equipos sin acceso a servicios en la nube gracias al formato GGUF y al reducido tamano del modelo.
- Preprocesado para extraccion de informacion: primera etapa de un sistema que, tras transcribir, aplique extraccion de entidades (indicativos, altitudes, rutas) con un componente posterior.
- Educacion y formacion: transcripcion de material de practica de fraseologia aeronautica para su analisis o documentacion.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| WER de validacion (ATC-ASR dataset) | 0,0558 | Reportado por el modelo ajustado original, no reproducido de forma independiente para esta conversion GGUF |
| WER de test (ATC-ASR dataset) | 0,0599 | Idem |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un modelo ASR. Tampoco hay metricas de latencia, throughput ni comparaciones reproducidas para esta conversion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: con precision F16, los pesos ocupan aproximadamente 1,25 GB (627 millones de parametros x 2 bytes). Sumando activaciones y buffers, se estima un consumo de 2 a 3 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3060, RTX 4060 o superiores. En gama profesional, A100 o H100 no son necesarias pero funcionarian sin problema.
- Inferencia en CPU: viable por el reducido tamano del modelo; el rendimiento dependera del hardware y no hay datos publicados.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: [CrispASR](https://github.com/CrispStrobe/CrispASR) es el runtime recomendado y compatible con el formato Parakeet GGUF. No se confirma soporte en llama.cpp, Ollama o TGI para esta arquitectura concreta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER en ATC-ASR | Licencia | Formato |
|---|---|---|---|---|---|
| pronoobie/Parakeet-v3-For_ATC (este modelo) | 627 M | en, fr, de (tags) | No evaluado para esta conversion; hereda 0,0558 val / 0,0599 test del ajuste original | MIT | GGUF |
| qenneth/parakeet-tdt-0.6b-v3-finetuned-for-ATC | 627 M | No disponible | 0,0558 val / 0,0599 test | No disponible en la informacion proporcionada | safetensors |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | Aproximadamente 600 M | 25 lenguas europeas | No ajustado para ATC; sin datos especificos | CC-BY-4.0 segun la pagina Parakeet Series de ManySpeech | No disponible en la informacion proporcionada |

No se dispone de datos comparativos con modelos ASR generalistas (por ejemplo, la familia Whisper de OpenAI) sobre el dataset ATC-ASR, por lo que no se incluyen cifras de rendimiento frente a ellos.

## Limitaciones y advertencias

- La propia model card indica que el modelo no es un ASR multilingue de proposito general ni un reconocedor de habla conversacional; su uso debe ceñirse al dominio ATC.
- El acento marcado en ingles puede elevar la tasa de error de transcripcion.
- El ruido de fondo intenso, los artefactos de radiofrecuencia, las voces solapadas, el clipping y los enunciados muy cortos reducen la precision.
- La terminologia aeronautica no presente en los datos de entrenamiento puede transcribirse de forma incorrecta.
- Los resultados de WER corresponden al modelo ajustado original y pueden no generalizarse a otros entornos, paises, acentos, equipos o canales de comunicacion.
- La conversion a GGUF no garantiza equivalencia bit a bit con la implementacion original de inferencia.
- Riesgo de alucinacion: al ser un modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio degradado; no debe usarse como unica fuente de verdad en decisiones de seguridad aeronautica.
- La licencia del repositorio es MIT, pero se advierte de que el modelo base Parakeet v2/v3 se distribuye bajo CC-BY-4.0, lo que puede condicionar el uso comercial derivado; conviene verificar los terminos de todos los eslabones de la cadena antes de un despliegue en produccion.
- Discrepancia de idiomas: los tags declaran en, fr, de, mientras que la model card solo menciona ingles; no hay evaluacion publicada en frances o aleman.
- Para aplicaciones con consecuencias significativas, la model card recomienda mantener supervision humana, validar la transcripcion contra el audio original y medir WER/CER por separado segun acento, ruido, hablante y entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pronoobie/Parakeet-v3-For_ATC
- Modelo ajustado original: https://huggingface.co/qenneth/parakeet-tdt-0.6b-v3-finetuned-for-ATC
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/jacktol/ATC-ASR-Dataset
- CrispASR (runtime y framework de conversion): https://github.com/CrispStrobe/CrispASR
- Script de conversion a GGUF: https://github.com/CrispStrobe/CrispASR/blob/main/models/convert-parakeet-to-gguf.py
- Proyecto ATC Audio Analyzer: https://github.com/deepanshu-yadav/ATC-Audio-Analyzer
- Referencia arXiv indicada en los tags: https://arxiv.org/abs/1910.09700
- Pagina de la serie Parakeet en ManySpeech: https://manyeyes.github.io/manyspeech/en/models/asr/parakeet.html
