# coding-zzz-oe/bert-motivational-interviewing

## Resumen

bert-motivational-interviewing es un clasificador de texto en ingles construido a partir de `bert-base-uncased` y afinado para etiquetar intervenciones del cliente en conversaciones de entrevista motivacional (Motivational Interviewing, MI). El modelo resuelve una tarea concreta de tres clases: distinguir entre "change talk" (lenguaje de cambio), "neutral" y "sustain talk" (lenguaje de mantenimiento de la conducta). Lo publica el usuario `coding-zzz-oe` en Hugging Face con licencia MIT y un unico idioma soportado, el ingles.

No es un modelo generativo ni conversacional: es un cabezal de clasificacion de secuencias (`BertForSequenceClassification`) sobre un encoder transformer bidireccional de 109.484.547 parametros (unos 109,5 M). La longitud de secuencia usada en entrenamiento e inferencia es de 128 tokens, muy por debajo del limite posicional de 512 de la arquitectura base, y se entreno sobre el corpus anotado AnnoMI con aproximadamente 2.400 enunciados de entrenamiento, 500 de validacion y 700 de test.

Su relevancia es acotada pero clara: cubre un nicho poco poblado, el analisis computacional de sesiones de consejeria, donde la mayoria de recursos son modelos generativos de proposito general. Con una precision global del 70,1 % y un F1 macro del 57,9 % en el conjunto de test declarado, sirve como punto de partida para investigacion en psicologia clinica, formacion de consejeros y sistemas de apoyo a la decision, no como sustituto de un profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base), con cabezal de clasificacion de secuencias |
| Parametros totales | 109.484.547 (aprox. 109,5 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 tokens en entrenamiento e inferencia; limite posicional de la arquitectura base: 512 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se distribuyen versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors; tamano del repositorio 0,4 GB |
| Pipeline | text-classification |
| Etiquetas de salida | 0: change, 1: neutral, 2: sustain |
| Libreria | transformers (PyTorch) |
| Dataset de entrenamiento | AnnoMI |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: un encoder transformer de 12 capas, atencion multi-cabeza bidireccional y representaciones contextuales sin enmascaramiento causal, al que se anade una capa densa de clasificacion sobre el token especial `[CLS]`. El modelo base aporta 109,5 M de parametros, de los que aproximadamente 110.000 corresponden al cabezal de clasificacion de tres clases. No hay mecanismos de decodificacion especulativa, atencion lineal, mezcla de expertos ni estado recurrente: es una arquitectura densa y puramente discriminativa.

El afinado se realizo sobre el AnnoMI dataset, con aproximadamente 2.400 enunciados de entrenamiento, 500 de validacion y 700 de test. Los hiperparametros declarados son: longitud maxima de secuencia de 128 tokens, batch size de 16, learning rate de 2e-5, 5 epocas, optimizador AdamW y perdida de entropia cruzada. El entrenamiento se ejecuto en una unica GPU. No se documenta en la informacion disponible ningun uso de RLHF, DPO, destilacion ni aumento de datos, ni la composicion exacta del corpus mas alla de su procedencia del AnnoMI.

## Capacidades

- Clasificacion de enunciados individuales del cliente en tres categorias de entrevista motivacional: change talk, neutral y sustain talk.
- Salida con probabilidades por clase mediante `softmax`, lo que permite fijar umbrales de confianza y descartar predicciones de baja certeza.
- Inferencia por lotes sobre listas de textos, adecuada para procesar sesiones completas de forma offline.
- Integracion directa con la libreria `transformers` (tokenizer y modelo compatibles con `pipeline` de clasificacion).
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No implementa agentes, planificacion ni razonamiento multi-paso; es un clasificador de una sola pasada.
- No tiene modo "thinking" ni capacidades multimodales (audio, imagen, video).
- No es multilingue: solo ingles.
- No modela contexto conversacional: clasifica cada enunciado de forma aislada.

## Casos de uso

- Formacion y supervision de consejeros: procesar la transcripcion de una sesion, clasificar cada intervencion del cliente y generar un informe con el porcentaje de change talk frente a sustain talk. Es adecuado porque la tarea es exactamente la que el modelo fue afinado para resolver y porque el coste computacional por sesion es minimo.
- Investigacion en psicologia clinica: etiquetar automaticamente corpus de sesiones de entrevista motivacional para estudiar la relacion entre el lenguaje del cliente y los resultados terapeuticos, reduciendo el coste de anotacion manual. El F1 macro del 57,9 % es suficiente para analisis exploratorios, pero no para conclusiones sin revision humana.
- Preetiquetado en flujos de anotacion: usar el modelo como primer paso en una herramienta tipo Label Studio para que los anotadores expertos revisen y corrijan en lugar de etiquetar desde cero. Su velocidad en GPU permite procesar miles de enunciados en segundos.
- Sistemas de apoyo a la decision en tiempo real: detectar acumulacion de sustain talk en una sesion y avisar al consejero de que puede estar perdiendo adherencia, siempre como senal auxiliar y nunca como decision automatica.
- Triaje o cribado en plataformas de salud mental digital: preclasificar mensajes de usuarios en funcion de su disposicion al cambio para enrutarlos a recursos adecuados, con la advertencia de que la clasificacion se hace sin contexto y con clases desbalanceadas.
- Simulacion y ensenanza: en un entorno de role-play entre estudiante y paciente simulado, clasificar las respuestas del paciente virtual y dar retroalimentacion al alumno sobre el tipo de lenguaje que esta elicitando.
- Monitorizacion de fidelidad a protocolos en ensayos clinicos: verificar de forma automatica que las sesiones registradas contienen la proporcion esperada de lenguaje de cambio segun el protocolo del estudio.
- Analisis de datos retrospectivos a gran escala: aplicar el modelo a archivos de transcripciones historicas para construir series temporales de indicadores de motivacion por paciente.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index para la tarea de clasificacion de texto sobre el conjunto de test de AnnoMI. Todos los valores estan marcados como no verificados.

| Metrica | Valor |
|---|---|
| Accuracy | 0,701 (70,1 %) |
| F1 macro | 0,579 (57,9 %) |
| Precision macro | 0,593 (59,3 %) |
| Recall macro | 0,573 (57,3 %) |

Matriz de confusion declarada en la model card:

| Real \ Predicho | change | neutral | sustain |
|---|---|---|---|
| change | 75 | 78 | 23 |
| neutral | 43 | 396 | 27 |
| sustain | 11 | 34 | 36 |

Metricas por clase derivadas de esa matriz (calculadas a partir de los recuentos anteriores, no publicadas de forma explicita por el autor):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| change | 58,1 % | 42,6 % | 49,2 % | 176 |
| neutral | 78,0 % | 85,0 % | 81,3 % | 466 |
| sustain | 41,9 % | 44,4 % | 43,1 % | 81 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos sobre AnnoMI, ni evaluaciones adicionales (MMLU, HumanEval, GSM8K u otras) que no apliquen a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 438 MB solo de pesos, mas activaciones y el tokenizer; en la practica cabe con comodidad en menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 219 MB de pesos.
- VRAM estimada en INT8: aproximadamente 109 MB de pesos.
- Cabe en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, e incluso en CPU con latencias aceptables para procesamiento por lotes.
- GPU de centro de datos (A100, H100, L4, T4) sobredimensionadas para este modelo; solo se justifican si se procesan volumenes muy altos en paralelo.
- Opciones de despliegue: `transformers` en PyTorch, `pipeline` de Hugging Face, TorchScript, ONNX Runtime, y servidores de inferencia como TGI o vLLM (compatibilidad no documentada por el autor).
- No se distribuyen pesos en GGUF, por lo que el uso directo en Ollama o llama.cpp requeriria una conversion propia y no esta soportado oficialmente.
- Latencia y throughput: no disponibles. Como referencia de configuracion, la model card documenta inferencia con lotes y truncado a 128 tokens; el modelo es lo bastante pequeno como para procesar lotes de miles de enunciados en una GPU de consumo.

## Comparativa con modelos similares

No hay resultados comparativos publicados sobre AnnoMI en la informacion disponible. La siguiente tabla recoge unicamente caracteristicas generales de arquitecturas comparables como alternativa de partida; los valores de rendimiento en AnnoMI para esos modelos figuran como no disponibles y no se ha ejecutado ninguna evaluacion cruzada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento en AnnoMI |
|---|---|---|---|---|---|
| bert-motivational-interviewing | 109,5 M | 128 tokens | Clasificacion de lenguaje del cliente en MI (3 clases) | MIT | Accuracy 70,1 %, F1 macro 57,9 % |
| bert-base-uncased | Aprox. 110 M | 512 tokens | Modelo base generico, requiere afinado | Apache 2.0 | No disponible (no afinado para esta tarea) |
| roberta-base | Aprox. 125 M | 512 tokens | Modelo base generico, requiere afinado | MIT | No disponible |
| DistilBERT base uncased | Aprox. 66 M | 512 tokens | Modelo base destilado, requiere afinado | Apache 2.0 | No disponible |
| MentalBERT | Aprox. 110 M | 512 tokens | Modelo de dominio (salud mental) para clasificacion y NER | Apache 2.0 | No disponible |

La diferencia funcional relevante no es el rendimiento bruto, sino que este modelo ya viene afinado y con el mapeo de etiquetas de MI resuelto, mientras que las alternativas requieren un proceso de afinado y anotacion propio sobre AnnoMI u otro corpus equivalente.

## Limitaciones y advertencias

- Desbalanceo de clases: la clase neutral concentra 466 de los 723 ejemplos de test y obtiene un F1 del 81,3 %, frente al 49,2 % de change y el 43,1 % de sustain. El modelo falla de forma sistematica en las dos clases clinicamente mas informativas.
- Confusion entre clases minoritarias: 78 enunciados reales de change se predicen como neutral y 23 como sustain; 34 enunciados reales de sustain se predicen como neutral. Esto genera tanto falsos negativos de lenguaje de cambio como falsos positivos.
- Ausencia de contexto conversacional: clasifica enunciados aislados, sin turnos previos, lo que contradice parcialmente la naturaleza dialogica de la entrevista motivacional y puede degradar la precision en frases cortas o ambiguas ("ya", "no se", "puede").
- Dominio restringido: entrenado especificamente con conversaciones de entrevista motivacional; no hay evidencia de generalizacion a otras modalidades terapeuticas (TCC, entrevista psiquiatrica, counselling general).
- Idioma: solo ingles. No hay soporte para castellano ni para textos code-switching.
- Sesgo de los datos de origen: el AnnoMI procede de un conjunto limitado de sesiones y anotadores; pueden existir sesgos demograficos, culturales y de estilo de habla que el modelo herede y que no se documentan en la model card.
- Metricas no verificadas: los resultados del model-index estan marcados con `verified: false` y provienen del propio autor.
- Riesgo de alucinacion en sentido estricto: no aplica (no genera texto); el riesgo equivalente es la clasificacion erronea con alta confianza, especialmente en la clase sustain.
- Restricciones de licencia: licencia MIT, que permite uso comercial. Sin embargo, el uso sobre datos reales de pacientes obliga a cumplir la normativa de proteccion de datos (RGPD en la UE y normativa equivalente) y a garantizar el consentimiento y la confidencialidad.
- Advertencia clinica explicita de la model card: el modelo esta pensado para asistir, no para reemplazar, a consejeros humanos, y sus predicciones deben ser revisadas por profesionales cualificados.
- Inconsistencia en la identificacion: el identificador del repositorio es `coding-zzz-oe/bert-motivational-interviewing`, pero el ejemplo de codigo y la cita de la model card apuntan a `RyanDDD/bert-motivational-interviewing`. Conviene verificar que los pesos cargados corresponden al repositorio correcto antes de usarlo en produccion.
- Sin validacion externa, sin auditoria de sesgos publicada y sin historial de uso (0 descargas y 0 likes en el momento de la consulta): no es un modelo con respaldo de la comunidad ni de una institucion clinica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coding-zzz-oe/bert-motivational-interviewing
- Dataset AnnoMI (GitHub): https://github.com/uccollab/AnnoMI
- Paper de BERT (Devlin et al., 2019): https://arxiv.org/abs/1810.04805
- Entrevista motivacional (Miller & Rollnick): https://motivationalinterviewing.org/
- La busqueda web realizada no devolvio enlaces adicionales relevantes: los resultados obtenidos corresponden a plataformas genericas de aprendizaje de programacion (Programiz, CodinGame, Codecademy, freeCodeCamp, Codédex) y no guardan relacion con este modelo.
