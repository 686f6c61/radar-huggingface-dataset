# noracodes/diabai-cgm-anomaly-detection

## Resumen

DiabAI CGM Data-Quality Anomaly Detection es un sistema de detección de anomalías en series temporales de monitorización continua de glucosa (CGM) desarrollado por el usuario noracodes bajo el paraguas del proyecto DiabAI. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un artefacto de scikit-learn que combina un conjunto de reglas transparentes con un Isolation Forest de 300 árboles para señalar patrones técnicamente inusuales en lecturas de glucosa, con el objetivo de que un revisor humano los inspeccione.

El problema que aborda es la calidad del dato en CGM: sensores que se quedan bloqueados, picos o caídas puntuales, offsets sostenidos y ráfagas de ruido que contaminan los registros y, por extensión, cualquier análisis retrospectivo o modelo predictivo construido sobre ellos. La propuesta del autor es deliberadamente híbrida y conservadora: las reglas actúan como detector técnico principal y el Isolation Forest como señal complementaria, tras comprobar en validación que el modelo no supervisado no reconocía eventos de sensor bloqueado.

Es relevante ahora por su honestidad metodológica y su encuadre: se publica como sistema educativo y de investigación, con evaluación sobre corrupciones sintéticas declaradas, sin etiquetas reales de fallo de sensor y con una lista explícita de usos prohibidos. El repositorio es de tamaño 0.0 GB, con 0 descargas y 0 likes en el momento de la consulta, y la licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido: reglas deterministas + Isolation Forest (scikit-learn) |
| Parametros totales | no disponible (no es un modelo neuronal; 300 árboles, 1.024 muestras por árbol) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 13 lecturas consecutivas a 15 minutos (3 horas de histórico) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la entrada es numérica: glucosa en mg/dL) |
| Licencia | CC BY 4.0 |
| Formato de pesos | model.skops (serialización skops de scikit-learn) |
| Libreria | scikit-learn 1.9 |
| Entradas | Serie de al menos 13 valores de glucosa en mg/dL, ordenados de más antiguo a más reciente |
| Features del Isolation Forest | 10 features de dinámica actual/pasada (cambios a 15/30/60 min, cambio absoluto a 15 min, aceleración a 15 min, desviación estándar previa a 1 h y 3 h, desviación de la media previa a 1 h, rango en la hora actual, número de valores únicos en la hora actual) |
| Configuración del Isolation Forest | 300 árboles, 1.024 muestras por árbol, fracción de features 1.0, semilla 42, umbral 0.59586538 (percentil 98 de las puntuaciones de desarrollo) |
| Salida | Disparadores de reglas individuales, puntuación de anomalía y umbral del Isolation Forest, flag híbrido solo para investigación |
| Entorno de reproducibilidad | Python 3.11.9, pandas 3.1.1, scikit-learn 1.9 |

## Arquitectura y entrenamiento

El sistema no emplea un transformer ni una red recurrente. La componente principal es un conjunto de reglas transparentes que examinan cambios grandes de glucosa, aceleración, desviación reciente respecto a la media, rango en la hora en curso y cuatro lecturas consecutivas idénticas (regla de señal plana o sensor bloqueado). La componente secundaria es un Isolation Forest entrenado sobre diez features de dinámica calculadas exclusivamente con datos actuales y pasados, sin usar valores futuros de glucosa.

Los datos de entrenamiento proceden de los conjuntos ShanghaiT1DM y ShanghaiT2DM, publicados en Figshare (DOI 10.6084/m9.figshare.21600933.v5) y descritos en el artículo de Scientific Data sobre conjuntos de datos chinos de diabetes. Se usaron 93 pacientes de desarrollo con 105.329 ejemplos y se reservaron 17 pacientes para test, con 18.522 ejemplos auténticos. Los splits se realizaron a nivel de paciente para evitar fuga de información. La configuración y la política de umbral se seleccionaron con pacientes de validación, y el bosque final se reajustó con los pacientes de entrenamiento y validación antes de una única evaluación sobre el conjunto de test reservado. No se incluyen datos crudos de pacientes en el repositorio.

La innovación técnica no reside en el algoritmo sino en el diseño de evaluación: como el conjunto Shanghai no identifica fallos de sensor verificados, el autor generó copias controladas con corrupciones artificiales declaradas (pico de +80 mg/dL en una lectura, caída de -80 mg/dL con suelo en 20, señal bloqueada de seis lecturas, offset de +60 mg/dL en cuatro lecturas y ráfaga de ruido alternante de ±60 mg/dL en cuatro lecturas) y midió recall por evento y por punto, además de la tasa de alertas sobre datos auténticos.

## Capacidades

- Detección de picos y caídas abruptas de glucosa en una sola lectura mediante reglas de cambio y aceleración.
- Detección de señales bloqueadas (stuck sensor) mediante la regla de cuatro lecturas consecutivas idénticas, que en la evaluación fue la única componente capaz de identificar estos eventos.
- Detección de offsets sostenidos y ráfagas de ruido alternante a través de las features de rango horario, desviación respecto a la media y número de valores únicos.
- Puntuación de anomalía no supervisada para combinaciones inusuales de features de dinámica, complementaria a las reglas.
- Salida interpretable: cada resultado incluye qué reglas se dispararon, la puntuación del Isolation Forest y el umbral aplicado.
- Flag híbrido (OR lógico entre reglas y bosque) disponible solo para comparación en investigación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.
- No procesa visión, audio ni texto libre; la entrada es exclusivamente numérica y estructurada.

## Casos de uso

- Auditoría retrospectiva de registros CGM en investigación clínica: el sistema permite marcar segmentos sospechosos de un volcado histórico para que un analista los revise manualmente, usando las reglas como primer filtro y la puntuación del bosque como señal secundaria de priorización.
- Control de calidad previo a pipelines de análisis: antes de entrenar modelos predictivos de glucosa o de calcular métricas de tiempo en rango, se puede ejecutar este detector sobre las series para identificar lecturas corruptas y decidir si se excluyen, se interpolan o se marcan como dudosas.
- Docencia y demostración de detección de anomalías: el contraste entre reglas transparentes e Isolation Forest sobre el mismo conjunto de datos sirve como caso práctico para explicar por qué un método no supervisado puede fallar en patrones estructurados como el sensor bloqueado.
- Prototipado de herramientas de revisión técnica para equipos de datos de salud: el helper de inferencia acepta un JSON con 13 lecturas y devuelve un resultado estructurado, lo que facilita integrarlo en un panel interno de revisión con intervención humana obligatoria.
- Comparación metodológica en publicaciones: los resultados de recall por evento y por punto, junto con las tasas de alerta sobre datos auténticos, permiten reproducir y discutir la complementariedad entre reglas y modelos no supervisados en series temporales fisiológicas.
- Validación de la lógica de reglas antes de portarla a otros dominios: la implementación de reglas de señal plana, offset y ruido alternante es reutilizable como referencia para construir detectores equivalentes en otras señales de sensores con muestreo regular.

## Benchmarks y rendimiento

Resultados de la evaluación final sobre el conjunto de test reservado (17 pacientes, 18.522 ejemplos auténticos), según la model card:

Detección de corrupciones sintéticas:

| Metodo | Eventos detectados | Recall por evento | Puntos detectados | Recall por punto |
|---|---:|---:|---:|---:|
| Reglas | 89/90 | 98,89% | 217/288 | 75,35% |
| Isolation Forest | 71/90 | 78,89% | 145/288 | 50,35% |
| Híbrido OR | 89/90 | 98,89% | 223/288 | 77,43% |

El Isolation Forest detectó 0 de 18 eventos de sensor bloqueado; las reglas detectaron los 18.

Tasas de alerta sobre datos auténticos (no son tasas de falsos positivos, porque las lecturas auténticas no tienen etiquetas verificadas de fallo de sensor):

| Metodo | Alertas | Ejemplos | Tasa de alerta |
|---|---:|---:|---:|
| Reglas | 246 | 18.522 | 1,33% |
| Isolation Forest | 346 | 18.522 | 1,87% |
| Híbrido OR | 554 | 18.522 | 2,99% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un Isolation Forest de 300 árboles con 1.024 muestras por árbol y un conjunto de reglas; no requiere GPU.
- VRAM estimada: 0 GB; el consumo es de memoria RAM del proceso Python, del orden de decenas o pocos cientos de megabytes con pandas y scikit-learn cargados.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y entornos de CI.
- Opciones de despliegue: script de inferencia incluido (`python inference.py example_input.json`) o carga programática con `load_system("model.skops")` y `evaluate_reading(system, document)`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (evaluación de 13 puntos y 10 features), la latencia por lectura es previsiblemente de milisegundos, pero no se ha publicado una medición.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DiabAI CGM Anomaly Detection | Reglas + Isolation Forest | 300 árboles | 13 lecturas (3 h) | Calidad de dato CGM | CC BY 4.0 | Hugging Face |
| Isolation Forest puro sobre features CGM | No supervisado | Configurable | Depende de features | Anomalías genéricas | Según implementación | Disponible en scikit-learn |
| Reglas deterministas de calidad CGM | Basado en reglas | No aplica | Depende de ventana | Fallos conocidos | Según implementación | A medida |
| Modelos predictivos de glucosa (p. ej. redes LSTM/Transformer) | Supervisado | Millones | Variable | Predicción de glucosa | Variable | Literatura y repositorios |

No se dispone de datos comparativos publicados frente a alternativas concretas con nombres y versiones en la información proporcionada; la comparación anterior es categórica y no incluye métricas cruzadas.

## Limitaciones y advertencias

- No es un dispositivo médico ni una alarma médica; no debe usarse para diagnóstico, tratamiento, dosificación de insulina ni decisiones de emergencia.
- Una puntuación rara no demuestra que el sensor haya fallado, y un evento médicamente peligroso no tiene por qué ser una anomalía estadística.
- La sensibilidad real y la tasa de falsos positivos frente a fallos de sensor reales son desconocidas, porque el conjunto de datos no contiene etiquetas verificadas de fallo.
- El recall sobre corrupciones sintéticas no equivale a precisión clínica; las corrupciones fueron generadas artificialmente por el autor.
- La cohorte de origen (pacientes chinos de diabetes tipo 1 y tipo 2) puede no generalizar a pacientes iraquíes, de otros países, niños, embarazadas, otros dispositivos CGM u otros entornos asistenciales.
- Los huecos de datos faltantes deben gestionarse antes de llamar al helper mediante comprobaciones de marcas temporales independientes.
- La regla de señal plana usa igualdad exacta, por lo que asume que los valores de entrada preservan la resolución de medida del dispositivo.
- El flag híbrido genera más alertas y está marcado como solo para investigación; no debe interpretarse como alarma médica.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el uso previsto y las prohibiciones de la model card limitan el contexto legítimo a demostraciones educativas, exploración retrospectiva y prototipos de investigación con revisión humana.
- Riesgo de alucinación: no aplica en el sentido de un modelo generativo; el riesgo equivalente es el exceso de alertas sobre datos auténticos (1,33% con reglas, 2,99% con el híbrido) sin validación clínica de esas alertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noracodes/diabai-cgm-anomaly-detection
- Dataset en Figshare: https://doi.org/10.6084/m9.figshare.21600933.v5
- Artículo del dataset (Scientific Data): https://www.nature.com/articles/s41597-023-01940-7
