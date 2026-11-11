# oluwagbotty/nemo-ctc-ky-ft-10ep-s3

## Resumen

`nemo-ctc-ky-ft-10ep-s3` es un modelo de reconocimiento automático del habla (ASR) en kinyarwanda desarrollado por el usuario oluwagbotty mediante fine-tuning del modelo `nvidia/stt_rw_conformer_ctc_large` sobre el split de entrenamiento del dataset CDLI Kinyarwanda Non-Standard Speech v1.0. El objetivo es mejorar la transcripción de habla no estándar, en concreto de personas que tartamudean, un colectivo habitualmente mal cubierto por los sistemas ASR comerciales. Forma parte del Rwanda Innovation Sprint impulsado por el Centre for Digital Language Inclusion (UCL), financiado por UK International Development a través del programa AT2030 con apoyo de Google.org.

El modelo emplea una arquitectura Conformer con cabecera CTC (Connectionist Temporal Classification) y se distribuye en formato `.nemo` (0,5 GB), lo que corresponde a un modelo de tamaño *large* (del orden de 120 millones de parámetros, aunque la cifra exacta no se especifica en la información disponible). La ventana de contexto no aplica en el sentido de los LLM: al ser un modelo CTC, procesa segmentos de audio de forma independiente y no genera bucles repetitivos, una ventaja estructural frente a modelos autorregresivos como Whisper.

Su relevancia radica en dos factores: por un lado, aborda un idioma de bajos recursos (kinyarwanda) y una condición del habla (tartamudeo) escasamente representados en los corpus ASR; por otro, publica métricas transparentes sobre un conjunto de test separado por hablante, con WER agrupado del 41,4 % y CER del 13,0 %. Son cifras modestas en términos absolutos, pero el autor advierte explícitamente que con solo 9 hablantes de test las diferencias inferiores a 3 puntos de WER no son concluyentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC (NeMo) |
| Parametros totales | no disponible (modelo *large*; el repo ocupa 0,5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ASR CTC sobre segmentos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo; `best.nemo`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/stt_rw_conformer_ctc_large`, un Conformer *large* con decodificación CTC entrenado originalmente por NVIDIA para kinyarwanda. El fine-tuning se realizó sobre el split de entrenamiento del dataset CDLI Kinyarwanda Non-Standard Speech v1.0, cuyos hablantes son mayoritariamente adultos jóvenes que tartamudean. Las grabaciones se hicieron en Ruanda en 2026, en interiores con bajo ruido, mediante una aplicación de tableta, a partir de indicaciones con imágenes (descripciones libres) y de texto (lectura de frases).

El entrenamiento se configuró con hasta 10 épocas, parada temprana sobre el WER del split de dev (paciencia de 3 evaluaciones), semilla 3, tasa de aprendizaje 1e-4 y precisión mixta bf16. El split de test se evaluó una única vez tras el entrenamiento, el split `extra` no se utilizó y ningún hablante aparece en más de un split. El código de los experimentos está en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto.

## Capacidades

- Reconocimiento automático del habla en kinyarwanda sobre audio de una sola grabación.
- Transcripción de habla no estándar, incluido tartamudeo con repeticiones, dado que los targets de entrenamiento son verbatim.
- Manejo de dos modalidades de elicitación: descripciones libres a partir de imágenes y lectura de frases.
- Decodificación greedy sin generación autorregresiva, por lo que no produce bucles de repetición (0 bucles reportados en dev y test).
- Salida con puntuación y normalización textual compatible con el normalizador básico de Whisper.
- No soporta tool calling, agentes, visión, audio de entrada más allá del propio ASR ni modo *thinking*; es un modelo puramente acústico-a-texto.

## Casos de uso

- Transcripción asistida para personas que tartamudean: el modelo se entrenó específicamente con habla tartamudeante, por lo que puede generar borradores de transcripción que el hablante revisa y corrige antes de usarlos, tal como recomienda el autor.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible para comparar técnicas de fine-tuning sobre kinyarwanda y habla no estándar, con splits separados por hablante y métricas documentadas.
- Accesibilidad en aplicaciones de dictado: integrable en apps de tableta o móvil que conviertan voz en texto para usuarios con disfluencias, siempre con confirmación humana del texto.
- Documentación de corpus lingüísticos: apoyo a la transcripción de grabaciones de campo en kinyarwanda en condiciones de bajo ruido, con revisión posterior por anotadores.
- Evaluación comparativa de modelos CTC frente a autorregresivos: su ausencia de bucles y su WER/CER publicados permiten contrastar el comportamiento de arquitecturas CTC y seq2seq en el mismo dominio.
- Prototipos de subtitulado o notas de voz en kinyarwanda: adecuado para entornos controlados (interior, ruido bajo) y como paso previo a un pipeline de corrección humana, no para producción sin supervisión.

## Benchmarks y rendimiento

Decodificación greedy, una grabación a la vez, evaluada con el normalizador básico de Whisper y, para comparación con las model cards de CDLI, con su paso de apóstrofos. El WER agrupado cuenta todas las palabras juntas; el WER y CER por enunciado son medias sobre grabaciones (cada una limitada al 100 %).

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 41,4 | 13,0 | 42,0 | 13,6 | 0 |
| dev (6 hablantes) | 44,1 | 18,9 | 43,1 | 20,0 | 0 |
| test, normalizador estilo CDLI | 38,7 | 12,5 | 39,8 | no disponible | 0 |

El autor advierte que, con solo 9 hablantes de test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; por el tamaño del repo (0,5 GB) y la arquitectura Conformer *large*, la inferencia cabe holgadamente en GPUs de consumo, aunque no se publican cifras exactas.
- GPU recomendadas: no disponibles; cualquier GPU con suficiente memoria para un modelo de ~0,5 GB en precisión completa o mixta debería bastar.
- GPU de consumo: previsiblemente sí (RTX 3060, RTX 4090 y similares), si bien el dato no está confirmado en la model card.
- Despliegue: NeMo (formato `.nemo` nativo); no se documentan exportaciones a otros runtimes como vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo CTC de ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | WER test (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oluwagbotty/nemo-ctc-ky-ft-10ep-s3 | Conformer CTC *large* | kinyarwanda | 41,4 (agrupado) | CC BY 4.0 | Hugging Face (0,5 GB) |
| nvidia/stt_rw_conformer_ctc_large | Conformer CTC *large* | kinyarwanda | no disponible en esta ficha | no disponible | Hugging Face (modelo base) |
| Modelos CDLI de referencia | no disponible | kinyarwanda | no disponible (comparación citada pero sin cifras en la información) | no disponible | no disponible |

No se dispone de resultados numéricos de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable más allá del modelo base.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres adultos jóvenes, grabaciones en interior con bajo ruido y habla leída o descrita a partir de imágenes, no conversacional. El rendimiento en niños, otras discapacidades, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Targets verbatim: las repeticiones del tartamudeo están escritas en las transcripciones y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en texto.
- Sesgo hacia las frases leídas: las oraciones leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con indicaciones de imagen son la mejor guía para habla abierta.
- No usar para decisiones sobre personas: prohibido para diagnosticar o evaluar condiciones del habla, identificar hablantes o tomar decisiones clínicas, legales o policiales. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alucinación y errores de sentido: una transcripción incorrecta puede cambiar el significado de lo dicho; el autor recomienda mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero los términos del dataset CDLI (acceso restringido) imponen restricciones adicionales sobre reidentificación y clonación de voz.
- Tamaño de test reducido: diferencias de menos de ~3 puntos de WER no son concluyentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-s3
- Modelo base: https://huggingface.co/nvidia/stt_rw_conformer_ctc_large
- Dataset CDLI Kinyarwanda Non-Standard Speech v1.0: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion (UCL): no disponible
- Programa AT2030: no disponible
- Repositorio del proyecto (código de experimentos): no disponible como enlace directo en la información proporcionada
