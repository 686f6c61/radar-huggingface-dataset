# Hossein-Dysarthria-Net/Shenava-Koochik-Hossein

## Resumen

Shenava-Koochik-Hossein es un modelo de reconocimiento automatico del habla (ASR) en persa, desarrollado por Hossein-Dysarthria-Net, que consiste en una adaptacion completa (fine-tuning de todos los parametros) del modelo base Shenava-Koochik-v1.5, un FastConformer hibrido RNNT/CTC de 114 millones de parametros. El modelo esta especificamente ajustado para transcribir el habla de una unica persona, Hossein, un hablante con disartria y apraxia de origen motor congenito residente en Qaem Shahr (Iran).

El problema que aborda es la baja precision de los sistemas ASR convencionales ante habla disartrica: el modelo base obtiene un WER de 87,87 % (CTC) sobre el hablante, mientras que tras el ajuste se reduce a 61,95 % en el mismo conjunto de test retenido de 51 enunciados. Es relevante como ejemplo metodologico de adaptacion de un ASR preentrenado a un unico hablante con patrones de habla atipicos, con un conjunto de datos abierto y limitado (408 grabaciones), y como caso de estudio de las limitaciones de este tipo de adaptaciones.

La arquitectura es un FastConformer hibrido con cabezas CTC y RNNT, entrenado en BF16 con una funcion de perdida combinada (0,7 RNNT + 0,3 CTC) y vocabulario y tokenizador originales preservados. El repositorio ocupa 0,5 GB y se distribuye en formato `.nemo` para la libreria NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido RNNT/CTC |
| Parametros totales | 114 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de contexto de entrenamiento [70,13] frames) |
| Tipos de cuantizacion | no disponible (pesos en BF16 durante entrenamiento) |
| Idiomas soportados | persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.nemo` (bundle NeMo con tokenizador incluido) |

## Arquitectura y entrenamiento

El modelo parte de Shenava-Koochik-v1.5, un FastConformer de 114 M de parametros con doble cabeza CTC y RNNT. La adaptacion es full-parameter (todos los pesos se actualizan), conservando el vocabulario y el tokenizador originales. El objetivo de entrenamiento combina las perdidas RNNT y CTC con pesos 0,7 y 0,3 respectivamente, en precision mixta BF16, batch efectivo de 8, optimizador AdamW y SpecAugment ligero. No se aplico reemplazo por pseudo-etiquetas de las grabaciones de Hossein, ni truncado, ni eliminacion de silencios.

El conjunto de datos de ajuste contiene 408 grabaciones del hablante, con 51 muestras reservadas para validacion y 51 para test independiente. La seleccion del mejor checkpoint se realizo exclusivamente por WER de validacion en la cabeza CTC, con CER como criterio de desempate y parada temprana de cinco epocas. Se selecciono la epoca 21 de 25 completadas. Las etiquetas de referencia son prompts generados por ASR mostrados al hablante durante la grabacion, no transcripciones verificadas por humanos; los duplicados exactos PCM y de texto normalizado estan separados entre train, validacion y test, pero no se ha establecido la ausencia de cuasi-duplicados ni de solapamiento con los datos de entrenamiento del modelo base.

## Capacidades

- Reconocimiento automatico del habla en persa para un unico hablante con disartria/apraxia.
- Dos cabezas de decodificacion seleccionables: CTC (cabeza principal) y RNNT.
- Transcripcion de audio completo en formato WAV y WebM mediante FFmpeg, mono a 16 kHz.
- Incluye tokenizador empaquetado en el archivo `.nemo`.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No dispone de modo thinking, vision ni audio generativo.
- No evaluado en streaming con cache consciente ni en troceado de grabaciones largas.
- No evaluado en hablantes distintos al de ajuste, sesiones no vistas, habla espontanea ni transcripciones verificadas por humanos.

## Casos de uso

- Investigacion en ASR para habla disartrica: servir como referencia metodologica de adaptacion de un modelo preentrenado a un unico hablante con 408 grabaciones y evaluacion con intervalos de confianza bootstrap pareados.
- Reproduccion de experimentos de fine-tuning: el repositorio incluye `environment.freeze.txt` con NeMo 3.0.0 y PyTorch 2.11.0+cu126, lo que permite replicar el pipeline de entrenamiento y la seleccion de checkpoint por WER de validacion.
- Evaluacion comparativa de cabezas CTC frente a RNNT en habla atipica: permite medir la diferencia de WER y CER entre ambas cabezas (61,95 % frente a 62,32 % en WER) sobre el mismo conjunto de test.
- Demostracion de accesibilidad: integracion en prototipos de dictado o transcripcion para un usuario concreto con disartria, siempre con validacion adicional sobre nuevas sesiones de grabacion.
- Estudio de la calidad de etiquetas derivadas de ASR: los prompts de referencia permiten analizar como los errores de las etiquetas afectan a las metricas reportadas.
- Base para adaptaciones multi-hablante: el modelo puede servir como punto de partida para ajustes con datos de otros hablantes con disartria, aunque su rendimiento fuera del hablante de ajuste no esta establecido.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido del mismo hablante (51 enunciados). WER puede superar el 100 %; menor es mejor.

| Cabeza | WER base | WER ajustado | CER base | CER ajustado |
|---|---:|---:|---:|---:|
| CTC | 87,87 % | 61,95 % | 57,34 % | 33,67 % |
| RNNT | 88,60 % | 62,32 % | 68,58 % | 39,95 % |

Epoca seleccionada: 21 de 25 completadas. El archivo `evaluation.json` incluye puntuaciones crudas y normalizadas, asi como intervalos bootstrap pareados; el autor advierte de consultar dichos intervalos antes de afirmar el tamano de la mejora.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 114 M de parametros en BF16 el peso ronda los 0,23 GB, por lo que es desplegable en GPU de consumo, aunque no se publican cifras oficiales.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la practica.
- Cabe en GPU de consumo: previsiblemente si (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.), aunque no hay validacion publicada.
- Opciones de despliegue: NeMo 3.0.0 con PyTorch 2.11.0+cu126 (entorno fijado en `environment.freeze.txt`); el repositorio incluye `transcribe.py` que acepta `--head ctc` o `--head rnnt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shenava-Koochik-Hossein | 114 M | no disponible | fa | 61,95 % (CTC) / 62,32 % (RNNT) en hablante de ajuste | Apache 2.0 | Hugging Face |
| Shenava-Koochik-v1.5 (base) | 114 M | no disponible | fa | 87,87 % (CTC) / 88,60 % (RNNT) en el mismo hablante | no disponible en la informacion | Hugging Face |
| Otros ASR persa de proposito general | no disponible | no disponible | fa | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se han proporcionado datos de otros sistemas ASR en persa ni de modelos especializados en habla disartrica.

## Limitaciones y advertencias

- Las etiquetas son prompts de referencia derivados de ASR, no transcripciones verificadas por humanos del habla real de Hossein; las puntuaciones miden la concordancia con el prompt y pueden verse afectadas por errores del prompt, desviaciones y palabras omitidas o repetidas.
- La descripcion del hablante como disartria/apraxia proviene del usuario; el experimento no establece ningun diagnostico clinico.
- Es una adaptacion a un unico hablante: no se ha demostrado rendimiento en otros hablantes, sesiones de grabacion no vistas, habla espontanea ni transcripciones verificadas.
- No se ha evaluado el streaming con cache consciente ni el troceado de grabaciones largas.
- Los duplicados exactos PCM y de texto normalizado estan separados entre particiones, pero no se ha establecido la ausencia de cuasi-duplicados ni el solapamiento con los datos de entrenamiento del modelo base.
- El WER puede superar el 100 %; las mejoras deben interpretarse junto a los intervalos bootstrap pareados incluidos en `evaluation.json`.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no esta validado para produccion fuera del hablante de ajuste.
- La model card incluye datos de contacto personales del hablante y una invitacion a apoyo voluntario; esta invitacion no modifica la licencia ni las condiciones de acceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hossein-Dysarthria-Net/Shenava-Koochik-Hossein
- Dataset: https://huggingface.co/datasets/Hossein-Dysarthria-Net/hossein-persian-speech
- Modelo base: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.5
- Repositorio de codigo: https://github.com/persianspeech/hossein-dysarthria-asr
