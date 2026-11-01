# makactuary/uci-har-activity-baseline

## Resumen

`makactuary/uci-har-activity-baseline` es un clasificador tabular basado en regresión logística de scikit-learn que predice seis actividades cotidianas (andar, subir escaleras, bajar escaleras, sentarse, estar de pie y tumbarse) a partir de las 561 características inerciales precalculadas del dataset UCI HAR. Lo desarrolla el usuario `makactuary` como parte del motor de investigación QMASE (Quantix Martial Arts Engine), y su interés radica en que es un baseline reproducible y riguroso, no un modelo generativo.

El modelo no es una red neuronal ni un transformer: es un pipeline de scikit-learn serializado con joblib (0,0 GB de repositorio). Su valor técnico está en la metodología de evaluación: selección de hiperparámetros mediante GroupKFold(5) sobre los sujetos de entrenamiento, sin tocar los sujetos de test, y una única evaluación final sobre 9 voluntarios no vistos. Alcanza una accuracy de 0,955 y un macro-F1 de 0,954 en sujetos retenidos.

Es relevante ahora como referencia metodológica para quien trabaje en reconocimiento de actividad humana (HAR) con datos de sensores inerciales: demuestra que un modelo lineal bien validado por grupos puede competir con alternativas más complejas (random forest obtuvo 0,916 de macro-F1 en validación cruzada) y ofrece un punto de comparación honesto para modelos profundos sobre señal cruda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn), pipeline tabular sobre 561 características |
| Parametros totales | no disponible (modelo lineal; el número de coeficientes depende del número de clases y características) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 561 características por ventana) |
| Tipos de cuantizacion | no disponible (serialización joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | joblib (pickle de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal multiclase (regresión logística) implementado con scikit-learn 1.9.1, entrenado sobre las 561 características precalculadas del dataset UCI HAR: medias y desviaciones típicas de aceleración y velocidad angular en dominios temporal y frecuencial, derivadas de señales de acelerómetro y giroscopio de un smartphone montado en la cintura. No hay etapa de extracción de características propia ni procesamiento de señal cruda.

El entrenamiento sigue el split oficial del dataset: 21 sujetos (7352 ventanas) para entrenamiento y 9 sujetos distintos (2947 ventanas) para test. La selección del modelo se hizo con GroupKFold(5) agrupando por sujeto, usando macro-F1 como métrica y sin acceso a los sujetos de test, que se evaluaron una sola vez. Se compararon dos candidatos: regresión logística (macro-F1 0,934 ± 0,041) y random forest (0,916 ± 0,045), seleccionándose la regresión logística. No se documenta uso de RLHF, DPO ni aumento de datos.

## Capacidades

- Clasificación de seis actividades diarias: WALKING, WALKING_UPSTAIRS, WALKING_DOWNSTAIRS, SITTING, STANDING y LAYING.
- Entrada tabular: consume ventanas de 561 características precalculadas con forma `(n, 561)`.
- Salida de clase discreta mediante `model.predict(X)`; no se documenta salida de probabilidades en la model card, aunque la regresión logística de scikit-learn la soporta vía `predict_proba`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Baseline de referencia en investigación HAR: usar este modelo como suelo de comparación antes de entrenar redes profundas sobre señal cruda; su evaluación por sujetos retenidos permite medir la ganancia real de modelos más complejos sin fuga de información.
- Prototipado rápido de aplicaciones de seguimiento de actividad: cargar el joblib y clasificar ventanas de características precalculadas para validar una idea de producto antes de invertir en un pipeline de extracción propio.
- Monitorización de movilidad en estudios con población similar: con accuracy por sujeto entre 0,864 y 0,995, sirve para experimentos controlados con voluntarios de 19 a 48 años y protocolo de smartphone en cintura.
- Detección de transiciones posturales (sentarse, estar de pie, tumbarse): las clases estáticas alcanzan F1 de 0,920, 0,930 y 0,995 respectivamente, útiles en estudios de sedentarismo en condiciones de laboratorio.
- Evaluación de metodologías de validación: el uso de GroupKFold por sujeto lo convierte en ejemplo didáctico de validación correcta en datasets con estructura de grupos.
- Integración en el motor QMASE: tal como indica el autor, forma parte del motor de investigación Quantix Martial Arts Engine como componente de clasificación base, aunque el propio autor advierte que no clasifica técnicas de artes marciales.
- Reproducibilidad de experimentos: al fijar la versión de scikit-learn y el split oficial, permite replicar resultados en entornos de investigación con requisitos de trazabilidad.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados una única vez sobre 9 sujetos retenidos (2947 ventanas):

| Metrica | Valor |
|---|---|
| Accuracy (sujetos retenidos) | 0,955 |
| Macro-F1 (sujetos retenidos) | 0,954 |
| Accuracy por sujeto (rango) | 0,864 – 0,995 (mediana 0,962) |

Validación cruzada sobre sujetos de entrenamiento (GroupKFold(5)):

| Candidato | Macro-F1 |
|---|---|
| Regresión logística (seleccionado) | 0,934 ± 0,041 |
| Random forest | 0,916 ± 0,045 |

F1 por actividad en sujetos retenidos:

| Actividad | F1 |
|---|---|
| WALKING | 0,968 |
| WALKING_UPSTAIRS | 0,951 |
| WALKING_DOWNSTAIRS | 0,962 |
| SITTING | 0,920 |
| STANDING | 0,930 |
| LAYING | 0,995 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El repositorio ocupa 0,0 GB.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: portátil, Raspberry Pi o contenedor ligero, siempre que tenga instalado scikit-learn 1.9.1.
- Opciones de despliegue: carga directa con `joblib.load` en Python; servicio HTTP con FastAPI o Flask; integración en pipelines de scikit-learn. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo lineal sobre 561 características, la inferencia es de coste muy bajo por ventana, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Evaluación por sujetos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| makactuary/uci-har-activity-baseline | Regresión logística | 561 características precalculadas | Sí (GroupKFold + test retenido) | CC BY 4.0 | HuggingFace |
| Random forest (candidato interno del mismo autor) | Ensemble de árboles | 561 características precalculadas | Sí (GroupKFold) | CC BY 4.0 | No publicado como artefacto independiente |
| Modelos profundos sobre señal cruda (familia CNN/LSTM en HAR) | Red neuronal | Señal inercial cruda | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: clasifica actividades diarias grabadas con un smartphone en la cintura bajo protocolo de laboratorio; no detecta técnicas de artes marciales, esfuerzo, fatiga ni riesgo de lesión, tal como advierte el autor.
- Población limitada: 30 voluntarios de 19 a 48 años; el rendimiento en otros dispositivos, colocaciones del sensor o poblaciones es desconocido.
- Dependencia de características precalculadas: no procesa señal cruda; los modelos profundos sobre señal son una tarea distinta y no comparables directamente.
- Sensibilidad a la versión: los modelos serializados con pickle/joblib son sensibles a la versión; debe cargarse con scikit-learn 1.9.1 exactamente.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; el riesgo equivalente es la clasificación errónea, con accuracy mínima por sujeto de 0,864.
- Sesgos conocidos: no se documentan análisis de sesgo por edad, sexo, complexión o tipo de dispositivo.
- Licencia: CC BY 4.0 permite uso comercial con atribución; debe citarse a Reyes-Ortiz et al. (2013) y respetarse la licencia del dataset UCI HAR.
- Advertencia para producción: al no publicarse latencias medidas ni pruebas fuera de laboratorio, no debe desplegarse en un sistema crítico sin una validación propia sobre la población y el dispositivo objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makactuary/uci-har-activity-baseline
- Repositorio del motor QMASE: https://github.com/000MAK/quantix-martial-arts-engine
- Código de entrenamiento (har_baseline.py): https://github.com/000MAK/quantix-martial-arts-engine/blob/main/src/martial_arts_engine/har_baseline.py
- Dataset UCI HAR (DOI): https://doi.org/10.24432/C54S4K
