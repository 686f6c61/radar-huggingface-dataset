# agk4444/aditya369-wesad

## Resumen

Aditya369-WESAD es un clasificador de estrés y afecto de pequeno tamano desarrollado por AGK FIRE INC y publicado en HuggingFace bajo el identificador agk4444/aditya369-wesad. Se trata de una red convolucional 1D de aproximadamente 225.000 parametros que opera sobre senales fisiologicas captadas en la muneca con un dispositivo Empatica E4, y que distingue tres clases: baseline, stress y amusement. No es un modelo de lenguaje ni un modelo generativo: es un clasificador de series temporales de uso especifico en el ambito de la computacion afectiva y la monitorizacion con wearables.

El modelo resuelve un problema concreto y bien delimitado: la deteccion automatica de episodios de estres a partir de senales multimodales de bajo coste (BVP, EDA, temperatura y acelerometro de tres ejes) en lugar de requerir equipamiento de laboratorio. Esta disenado para evaluarse con validacion leave-one-subject-out (LOSO) sobre 15 pliegues del corpus WESAD, lo que lo situa como una linea base reproducible para investigacion en deteccion de estres con wearables.

Su relevancia actual es la de un baseline ligero y abierto: con menos de 1 MB de pesos en fp32 puede ejecutarse en el propio dispositivo o en CPU, y su licencia Apache 2.0 permite reutilizacion comercial. El rendimiento publicado es modesto (exactitud media 0,669 y macro F1 medio 0,572 en LOSO), con una variabilidad muy alta entre sujetos, lo que refleja la dificultad intrinseca del problema mas que una limitacion resoluble solo con mas capacidad de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (StressCNN), 6 canales de entrada, 3 clases de salida |
| Parametros totales | ~225.000 (segun model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de entrada de 1920 muestras = 60 s a 32 Hz |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; pesos distribuidos en fp32) |
| Idiomas soportados | no aplica (modelo sobre senales fisiologicas, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (`best_model.pt`) |
| Modalidad de entrada | Senales de wearable Empatica E4: BVP, EDA, TEMP, ACCx, ACCy, ACCz |
| Clases de salida | 0 = baseline, 1 = stress, 2 = amusement |
| Tamano del repositorio | 0,0 GB (segun la API de HuggingFace) |
| Fecha de creacion | 2026-10-03 |
| Fecha de ultima actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D de aproximadamente 225.000 parametros que recibe tensores de forma (1, 6, 1920): seis canales fisiologicos y una ventana de 60 segundos remuestreada a 32 Hz. Los detalles de las capas (numero de bloques convolucionales, canales por capa, kernel sizes, uso de pooling global, dropout y capa de clasificacion) no se especifican en la model card, por lo que no estan disponibles. La implementacion se distribuye como clase `StressCNN` importable desde `model.py`, con `n_ch=6` y `n_cls=3`.

El entrenamiento se realizo exclusivamente sobre la rama de muneca del dataset WESAD. Las senales originales (BVP a 64 Hz, EDA y TEMP a 4 Hz, ACC a 32 Hz) se remuestrearon a 32 Hz; se segmentaron en ventanas de 60 segundos con 50 por ciento de solapamiento; se aplico normalizacion z por sujeto y etiquetado por voto mayoritario. La evaluacion emplea validacion leave-one-subject-out sobre 15 pliegues, con early stopping sobre una particion de validacion de los sujetos de entrenamiento. El fichero `best_model.pt` corresponde al state_dict del mejor pliegue, no a un promedio de pliegues. No se documenta uso de RLHF, DPO ni ninguna tecnica de ajuste por preferencias, lo cual es coherente con la naturaleza discriminativa del modelo. Tampoco se documentan aumentos de datos, busqueda de hiperparametros ni tecnicas de regularizacion mas alla del early stopping.

## Capacidades

- Clasificacion de episodios fisiologicos en tres clases discretas: baseline, stress y amusement.
- Procesamiento multimodal de seis canales de wearable: BVP, EDA, temperatura cutanea y acelerometro triaxial.
- Operacion sobre ventanas de 60 segundos con solapamiento del 50 por ciento, lo que permite inferencia deslizante continua.
- Normalizacion z por sujeto, requisito de preprocesado para un funcionamiento correcto.
- Inferencia en CPU: el modelo es lo bastante pequeno para ejecutarse sin GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni generacion.
- No se documentan capacidades de calibracion de incertidumbre ni salidas probabilisticas mas alla del logit/argmax indicado en el ejemplo de uso.

## Casos de uso

- Monitorizacion ambulatoria continua del estres: integrado en una aplicacion movil o firmware que lea un wearable tipo Empatica E4, el modelo clasifica ventanas de 60 segundos de forma deslizante y genera una linea temporal de estados afectivos. Su tamano inferior a 1 MB en fp32 permite ejecutarlo localmente sin depender de la nube.
- Investigacion en computacion afectiva: sirve como linea base reproducible sobre WESAD con protocolo LOSO explicito, util para comparar nuevas arquitecturas bajo el mismo esquema de evaluacion por sujeto.
- Sistemas de salud mental de bajo coste: deteccion temprana de patrones de estres sostenido para derivar a profesionales, siempre como herramienta de cribado y nunca como diagnostico clinico dada la exactitud de 0,669 y la variabilidad entre sujetos.
- Interfaces humano-maquina adaptativas: ajuste dinamico de la carga cognitiva o del entorno (iluminacion, notificaciones, dificultad de una tarea) en funcion de la clase predicha en los ultimos 60 segundos.
- Seguimiento deportivo y de recuperacion: correlacion entre carga de entrenamiento y episodios de estres fisiologico usando unicamente senales de muneca, sin sensores adicionales.
- Validacion previa al despliegue de wearables: prototipado rapido de la cadena de adquisicion-preprocesado-inferencia antes de invertir en modelos mas costosos, ya que el coste computacional del clasificador es despreciable.
- Analisis retrospectivo de cohortes: procesado por lotes de grabaciones WESAD o de datos propios preprocesados de forma equivalente para etiquetar periodos de estres en estudios observacionales.
- Modulo auxiliar en pipelines de biosenales: el modelo puede actuar como extractor de una etiqueta de estado afectivo que alimente un sistema mayor (por ejemplo, un registro de eventos o un panel de analitica).

## Benchmarks y rendimiento

Resultados publicados en la model card, validacion leave-one-subject-out sobre 15 pliegues:

| Metrica | Media |
|---|---|
| Exactitud (accuracy) | 0,669 |
| Macro F1 | 0,572 |

Desglose por sujeto:

| Sujeto | Exactitud | Macro F1 | n_test |
|---|---|---|---|
| S2 | 0,718 | 0,545 | 71 |
| S3 | 0,575 | 0,514 | 73 |
| S4 | 0,556 | 0,578 | 72 |
| S5 | 0,767 | 0,563 | 73 |
| S6 | 0,890 | 0,876 | 73 |
| S7 | 0,616 | 0,529 | 73 |
| S8 | 0,730 | 0,585 | 74 |
| S9 | 0,833 | 0,622 | 72 |
| S10 | 0,747 | 0,590 | 75 |
| S11 | 0,895 | 0,894 | 76 |
| S13 | 0,653 | 0,549 | 75 |
| S14 | 0,400 | 0,217 | 75 |
| S15 | 0,707 | 0,637 | 75 |
| S16 | 0,616 | 0,633 | 73 |
| S17 | 0,333 | 0,254 | 75 |

Observaciones sobre estos numeros: el rango de exactitud va de 0,333 (S17) a 0,895 (S11), y el macro F1 de 0,217 (S14) a 0,894 (S11). La desviacion entre sujetos es, por tanto, enorme, y la media de 0,669 esta claramente por encima del azar (0,333 en tres clases) pero lejos de un rendimiento apto para decisiones clinicas. No se han publicado en la informacion disponible resultados de benchmarks adicionales (F1 por clase, matrices de confusion, comparaciones con otras arquitecturas sobre el mismo split), ni metricas de un modelo de lenguaje como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en fp32 (225.000 parametros x 4 bytes = ~0,9 MB); con activaciones, el consumo total se mantiene en el orden de unos pocos MB.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA (por ejemplo GTX 1050 o superior, RTX 2060, RTX 4090, A100, H100) ejecuta la inferencia sin problemas, pero no aporta ventaja sustancial frente a CPU para un modelo de este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos embebidos (Raspberry Pi, microcontroladores de gama alta con runtime ligero).
- Opciones de despliegue: PyTorch nativo (unico camino documentado en la model card). No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI, que son runtimes orientados a modelos de lenguaje y no aplican a esta arquitectura. Para produccion en dispositivo convendria exportar a TorchScript u ONNX, aunque no se proporciona ninguna conversion oficial.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo (inferencia sobre un tensor de 6 x 1920) se espera una latencia del orden de decimas de milisegundo a pocos milisegundos en CPU moderna, y muy inferior en GPU, pero se trata de una estimacion derivada del numero de parametros y no de una medicion publicada.
- Preprocesado en el mismo dispositivo: el coste real del sistema lo dominara la adquisicion y el remuestreo de senales a 32 Hz y la normalizacion z por sujeto, no el paso por la red.

## Comparacion con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables en la misma categoria (clasificadores de estres sobre WESAD con evaluacion LOSO), incluyendo sus recuentos de parametros, contexto, licencia y disponibilidad. La model card no incluye comparaciones con alternativas ni referencias a trabajos previos, por lo que no es posible construir una tabla comparativa sin inventar cifras.

A modo de referencia estructural, y senalando que no se aportan numeros: los clasicos baselines sobre WESAD suelen emplear caracteristicas manuales (estadisticos de HRV, nivel tonico de EDA, temperatura) con clasificadores como Random Forest, SVM o gradient boosting sobre ventanas de 60 segundos, y se evaluan tambien con esquemas LOSO. Comparar este modelo con ellos requeriria ejecutar ambos sobre el mismo split, dato que no esta disponible.

## Limitaciones y advertencias

- Rendimiento muy desigual entre sujetos: el macro F1 cae a 0,217 en S14 y la exactitud a 0,333 en S17, lo que indica que el modelo no generaliza de forma uniforme y que su uso sin validacion sobre la poblacion objetivo es arriesgado.
- Exactitud media de 0,669 en tres clases: suficiente para investigacion y para senales indicativas, insuficiente para diagnostico clinico, decisiones medicas o cualquier aplicacion con consecuencias sobre la salud.
- Riesgo de falso negativo y falso positivo no cuantificado: la model card no publica matrices de confusion ni metricas por clase, por lo que se desconoce si los errores se concentran en la clase stress.
- Dependencia del preprocesado: el modelo asume senales remuestreadas a 32 Hz, ventanas de 60 segundos, orden de canales [BVP, EDA, TEMP, ACCx, ACCy, ACCz] y normalizacion z por sujeto. Cualquier desviacion de este pipeline invalida las predicciones.
- Dependencia del dispositivo: el entrenamiento usa exclusivamente Empatica E4 en la muneca. Otros wearables con distinta colocacion, frecuencia de muestreo o calibracion del sensor pueden degradar el rendimiento de forma no caracterizada.
- Dominio de entrenamiento reducido: WESAD es un corpus de laboratorio con 15 sujetos y protocolos inducidos de estres y amusement. La transferencia a estres cotidiano real no esta evaluada.
- Sesgos demograficos: la model card no documenta la composicion demografica de WESAD ni analisis de equidad por edad, sexo o condicion de salud, por lo que no puede descartarse sesgo sistematico.
- Modelo unicamente de clasificacion afectiva: no procesa texto, no tiene capacidades generativas y no debe presentarse como un modelo de lenguaje.
- Ausencia de umbral de confianza documentado: el ejemplo de uso emplea `argmax` directo, sin calibracion ni umbral de rechazo, lo que fuerza una etiqueta en todos los casos.
- Integridad del repositorio: el ejemplo de uso importa `model.py` y `label_map.json`, pero el repositorio figura con un tamano de 0,0 GB en la API de HuggingFace. Conviene verificar que todos los ficheros necesarios estan efectivamente publicados antes de depender de ellos.
- Licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. No se documentan restricciones adicionales, pero el uso en contextos sanitarios puede estar sujeto a normativa sectorial (por ejemplo, marcado CE de producto sanitario en la Union Europea) al margen de la licencia del software.
- Ausencia de mantenimiento verificable: cero descargas y cero likes en el momento de la consulta, sin garantia de soporte, actualizaciones o correccion de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agk4444/aditya369-wesad
- Dataset WESAD (referenciado en la model card, sin enlace explicito proporcionado): no disponible como enlace en la informacion suministrada; corresponde a Schmidt et al., "Introducing WESAD, a Multimodal Dataset for Wearable Stress and Affect Detection" (ICMI 2018)
- Repositorio de codigo del modelo: no disponible
- Paper o memoria tecnica del modelo: no disponible
- Demo o espacio de HuggingFace: no disponible
- Resultados de busqueda web: las busquedas realizadas no devolvieron ningun resultado relevante sobre este modelo; todos los resultados obtenidos fueron contenido no relacionado y sin valor tecnico, por lo que se descartan.
