# juice500/wavlm-24-efficiency-1_16-phonemodel

## Resumen

`wavlm-24-efficiency-1_16-phonemodel` es un modelo de segmentacion y reconocimiento fonetico (phone segmentation y phone recognition) desarrollado por `juice500` (Shikhar Bharadwaj y colaboradores) en el marco del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo resuelve un problema clasico en fonetica computacional: obtener fronteras temporales precisas de fonemas y etiquetarlos, a partir de audio en bruto, sin depender de alineamientos forzados ni de transcripciones manuales densas.

La innovacion central es SPAM (S3M-based Phonological Activation Mapping): en lugar de predecir directamente fonemas desde las representaciones opacas de un modelo auto-supervisado de voz (S3M), el modelo mapea cada frame del encoder a un vector de 43 activaciones fonologicas interpretables (voicing, nasality, stridency, entre otras). Sobre esa representacion intermedia operan dos cabezas: una de segmentacion y otra de reconocimiento. El encoder es `microsoft/wavlm-large` congelado (capa 24, audio a 16 kHz), de modo que el modelo entrenado es un adaptador ligero sobre features precalculadas.

Esta variante concreta es un ablation de eficiencia de muestras: se entrena sobre 1/16 de los enunciados de entrenamiento de TIMIT (Figura 3 del paper). Es relevante para desarrolladores e investigadores porque demuestra que un adaptador pequeno sobre features S3M congeladas puede aprender segmentacion y reconocimiento fonetico con muy pocos datos supervisados, y porque expone una representacion fonologica interpretable en lugar de una caja negra. El repo pesa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (cabezas de segmentacion y reconocimiento) sobre encoder WavLM-large congelado, capa 24; representacion intermedia SPAM de 43 activaciones fonologicas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por frames a 16 kHz; no se documenta ventana maxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles); reconocimiento restringible a inventarios PHOIBLE de otras lenguas via `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga via `phonespam` con `PhoneModel.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de adaptacion sobre features congeladas: WavLM-large (capa 24) procesa audio a 16 kHz y produce representaciones por frame que no se afinan. Sobre ellas, SPAM aprende una proyeccion a 43 activaciones fonologicas (voicing, nasality, stridency, entre otras), y dos cabezas consumen esa misma representacion: una para segmentacion temporal y otra para reconocimiento de etiquetas foneticas. Esta separacion entre representacion interpretable y cabezas de tarea es la innovacion tecnica principal del paper.

El entrenamiento supervisado usa el dataset TIMIT (`timit-asr/timit_asr`), en concreto el 1/16 de los enunciados de entrenamiento para esta ablation de eficiencia de muestras. No se documentan en la informacion disponible el numero de tokens de audio, la composicion completa del dataset ni si se aplico RLHF, DPO u otras fases de alineamiento; al tratarse de una tarea de etiquetado fonetico, cabria esperar entrenamiento supervisado clasico, pero esto no se confirma en la model card.

## Capacidades

- Segmentacion fonetica: devuelve segmentos contiguos `Segment(start, end, label)` con tiempos en segundos a partir de un WAV.
- Reconocimiento fonetico: etiqueta cada segmento con un simbolo fonetico.
- Representacion fonologica interpretable: `model.spam("utt.wav")` devuelve una matriz `(frames, 43)` de activaciones en [0, 1] con nombres de feature accesibles via `spam.featnames` (`"silence+"`, `"syl+"`, `"son+"`, etc.).
- Restriccion de vocabulario por lengua: `vocab_for_language("deu")` limita el reconocimiento al inventario PHOIBLE de una lengua concreta.
- Procesamiento por GPU opcional (`device="cuda"`).
- Capacidades multilingues: el modelo base esta etiquetado para ingles, pero el mecanismo de vocabulario PHOIBLE permite adaptar el conjunto de etiquetas de salida a otras lenguas sin reentrenar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Vision, audio generativo, thinking mode: no disponible (modelo exclusivamente de analisis fonetico).

## Casos de uso

- Investigacion fonetica y fonologica: extraer alineamientos foneticos y activaciones de rasgos (voicing, nasality, stridency) de corpus de habla para estudiar contrastes y procesos fonologicos con datos cuantitativos.
- Anulacion de alineamiento forzado en pipelines ASR: usar la segmentacion para obtener fronteras de fonemas sin depender de un aligner externo como Montreal Forced Aligner, reduciendo dependencias y errores en cascada.
- Analisis de pronunciacion asistido por ordenador (CAPT): comparar la secuencia de fonemas reconocida con la esperada para detectar sustituciones u omisiones en aprendices de ingles.
- Etiquetado fonetico de corpus con presupuesto de anotacion minimo: al estar entrenado con 1/16 de TIMIT, sirve como referencia para evaluar cuanto se degrada la calidad al reducir datos supervisados y para preanular corpus nuevos.
- Interpretabilidad de modelos S3M: usar las 43 activaciones SPAM como sonda para analizar que informacion fonologica codifica WavLM-large en la capa 24, por ejemplo en estudios de probing.
- Prototipado rapido en demo interactiva: la demo Streamlit (`phonespam.streamlit.app`) permite subir un WAV y visualizar segmentos y activaciones sin infraestructura propia.
- Adaptacion a otras lenguas via PHOIBLE: restringir el vocabulario de salida al inventario de una lengua concreta para experimentos comparativos entre sistemas fonologicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia la Figura 3 del paper (ablation de eficiencia de muestras con 1/16 de TIMIT) sin incluir cifras numericas de phone error rate, frontera F1 ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El encoder WavLM-large congelado es el componente dominante; el adaptador es ligero, pero no se documenta el consumo.
- GPU recomendadas: no disponible. La API admite `device="cuda"`, pero no se especifican modelos de GPU validados.
- Cabe en GPU consumer: no confirmado; al no documentarse VRAM, no puede afirmarse.
- Opciones de despliegue: libreria `phonespam` (pip), con `PhoneModel.from_pretrained`; demo Streamlit alojada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wavlm-24-efficiency-1_16-phonemodel | no disponible (encoder WavLM-large congelado + adaptador) | no disponible | Segmentacion y reconocimiento fonetico | MIT | Hugging Face, repo 0.0 GB |
| WavLM-large (base) | no disponible en la informacion | no disponible | Representaciones S3M genericas | no disponible en la informacion | Hugging Face (`microsoft/wavlm-large`) |
| Alternativas de phone recognition sobre S3M | no disponible | no disponible | Segmentacion/reconocimiento fonetico | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoria, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Entrenado con solo 1/16 de TIMIT: es un ablation de eficiencia de muestras, por lo que su calidad absoluta sera inferior a variantes entrenadas con el conjunto completo; no debe usarse como sistema de produccion de alta precision sin validacion.
- Idioma: etiquetado para ingles; el uso con otras lenguas depende de `vocab_for_language` y de PHOIBLE, y no se documenta su rendimiento fuera del ingles.
- Dependencia de PHOIBLE: `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecucion, con licencia CC BY-SA 3.0, separada de la licencia MIT del modelo; esto puede afectar a despliegues con requisitos de licencia estrictos.
- Riesgo de alucinacion fonetica: al ser un modelo discriminativo de etiquetado, los errores se manifiestan como fonemas mal asignados o fronteras desplazadas; no se documentan tasas de error.
- Sesgos: TIMIT es un corpus de habla leida en ingles con hablantes mayoritariamente estadounidenses; el modelo hereda sesgos de dominio, acento y canal de grabacion.
- Licencia MIT permite uso comercial del modelo, pero no cubre los datos PHOIBLE descargados en tiempo de ejecucion.
- Sin descargas ni likes registrados y repo de 0.0 GB: la disponibilidad efectiva de pesos y la reproducibilidad no estan verificadas en la informacion disponible.
- No se documentan cuantizaciones ni formatos de pesos alternativos, lo que limita opciones de despliegue en entornos restringidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_16-phonemodel
- Encoder base: https://huggingface.co/microsoft/wavlm-large
- Paper: https://arxiv.org/abs/2607.09020
- Codigo: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
