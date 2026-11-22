# gsoulja/Llama-3.2-1B-OpenTSLM-wind-joint

## Resumen

Llama-3.2-1B-OpenTSLM-wind-joint es un modelo de lenguaje especializado en series temporales aplicado al diagnóstico de aerogeneradores. Lo desarrolla el equipo sololeveling en el marco del hackathon TimeNet (ronda 1, 2026) y parte de un Llama-3.2-1B congelado sobre el que se añade la arquitectura OpenTSLM-SP, un esquema de soft-prompt que convierte señales SCADA en tokens blandos para el modelo de lenguaje. El repositorio publicado no contiene los pesos de Llama, sino únicamente los componentes entrenados: un adaptador de fusión para las preguntas de diez minutos y un proyector de 2.607.488 parámetros por conjunto de pesos.

El modelo aborda simultáneamente cuatro preguntas operativas sobre una turbina eólica: detección de paradas de 60 minutos o más con viento superior a 4 m/s, atribución de la causa de la parada (meteorológica o técnica), identificación de consignas de recorte de producción (curtailment) y detección de funcionamiento por debajo de la potencia esperada para el viento disponible, con diagnóstico de causa. La propuesta relevante es la unificación: un solo modelo responde las cuatro preguntas en lugar de cuatro modelos independientes.

La model card es inusualmente transparente sobre el resultado: el conjunto v1 falló su criterio de aceptación predefinido en dos de las cuatro tareas y solo lo superó en la tarea de bajo rendimiento. El autor publica las curvas de entrenamiento, las métricas por pregunta y un aviso explícito de que la pérdida de validación media ocultaba los fallos. Es un artefacto de investigación con fines de transparencia, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM-SP (soft-prompt time-series language model) sobre Llama-3.2-1B congelado |
| Parametros totales | 2.607.488 parámetros entrenados por conjunto de pesos (proyector y adaptador de fusión); los pesos de Llama-3.2-1B (1.240 millones) no se incluyen en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License); la arquitectura OpenTSLM es MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue el esquema OpenTSLM-SP: un codificador de series temporales proyecta las señales SCADA a tokens blandos que se inyectan como prefijo en un Llama-3.2-1B congelado. Para las tres preguntas de granularidad de diez minutos se emplea un adaptador de fusión; la pregunta diaria utiliza la disposición simple del codificador. La inferencia no es generativa libre: cada respuesta candidata se puntúa por su verosimilitud bajo el modelo de lenguaje, y en la tarea de bajo rendimiento la magnitud de la pérdida se genera como un número.

El entrenamiento se realizó sobre datos SCADA abiertos de dos parques Senvion (Kelmarsh, 6 × MM92, y Penmanshiel, 14 × MM82), manteniendo fuera de todo el entrenamiento los meses de julio a diciembre de 2021, que se usaron como validación. La evaluación final se hizo una sola vez sobre el parque Siemens de Hill of Towie y sobre un parque de EDP con turbinas Fuhrländer. Se fijaron cinco épocas y se publican los pesos de la última. No se detalla la composición del dataset, el número de tokens, ni si hubo RLHF o DPO; el código de preparación de datos, prompts, etiquetas y entrenamiento no es público.

## Capacidades

- Clasificación de paradas: determina si una turbina estuvo parada 60 minutos o más con viento de 4 m/s o superior en el día.
- Atribución de causa de parada: distingue entre causa meteorológica y causa técnica de la turbina.
- Detección de curtailment: identifica si la turbina recibió una consigna de reducción de producción.
- Detección de bajo rendimiento: señala si la turbina produce por debajo de lo esperado para su viento y estima la causa y la magnitud de la pérdida.
- Puntuación de respuestas candidatas por verosimilitud en lugar de generación libre.
- Generación numérica de la magnitud de pérdida en la tarea de bajo rendimiento.
- Procesamiento de series temporales SCADA multivariantes de granularidad de diez minutos y diaria.
- Idioma de trabajo: inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Monitorización de disponibilidad de flota: el modelo clasifica paradas prolongadas con viento suficiente, lo que permite generar informes diarios de disponibilidad por turbina y priorizar inspecciones sobre las paradas anómalas.
- Triaje de mantenimiento: la atribución meteorológica frente a técnica permite enrutar las alertas al equipo de operaciones o al de mantenimiento, reduciendo el tiempo de diagnóstico inicial en parques con cientos de turbinas.
- Verificación de curtailment para liquidación económica: la detección de consignas de recorte sirve para contrastar los eventos registrados por el operador de red con las señales SCADA y cuantificar la producción no entregada.
- Análisis de rendimiento y pérdidas: la tarea de bajo rendimiento con generación numérica de la pérdida permite estimar el impacto energético de desviaciones de potencia y priorizar revisiones de curvas de potencia.
- Investigación sobre modelos unificados de series temporales: el repositorio sirve como referencia reproducible para estudiar el efecto del entrenamiento multitarea y el fenómeno de atajos aprendidos al compartir representación entre preguntas.
- Auditoría de datos SCADA abiertos: al estar entrenado y evaluado sobre datasets públicos con licencia CC BY 4.0 (Kelmarsh, Penmanshiel, Hill of Towie), es utilizable en trabajos académicos que necesiten una línea base de clasificación sobre esos mismos conjuntos.
- Detección de anomalías en parques con turbinas de otro fabricante: la evaluación cruzada en Hill of Towie (Siemens) y en un parque EDP (Fuhrländer) documenta el comportamiento en transferencia entre fabricantes, útil para calibrar expectativas antes de desplegar en flotas heterogéneas.

## Benchmarks y rendimiento

Resultados de validación sobre Senvion, segundo semestre de 2021, con umbrales fijados antes de la ejecución:

| Pregunta | v1 | Modelo separado | Umbral | Veredicto |
|---|---|---|---|---|
| Paradas: average precision | 0,9605 | 0,9811 | ≥ 0,9761 | Fallo (53 falsas alarmas frente a 0) |
| Causa: macro F1 sobre 134 paradas | 0,701 | 0,855 | ≥ 0,805 | Fallo |
| Curtailment: AUC con un evento registrado | 0,8903 | 0,942 | ≥ 0,89 | En el umbral |
| Bajo rendimiento: pérdidas encontradas / F1 de causa (Fuhrländer) | 0,839 / 0,670 | 0,684 / 0,408 | ≥ 0,654 / ≥ 0,378 | Superado |

Evaluación única sobre parques no vistos:

| Pregunta | v1 | Modelo separado |
|---|---|---|
| Paradas, Hill of Towie 2023-24 (796 paradas) | 724 detectadas, 194 falsas alarmas | 762 detectadas, 2 falsas alarmas |
| Causa, Hill of Towie 2016-24 (1.741 paradas) | F1 0,769 | F1 0,838 |
| Curtailment, Hill of Towie 2025-26 (768 días con consigna) | 570 detectados, 317 de 3.834 días limpios alarmados, AP 0,692 | 188 detectados |
| Bajo rendimiento, EDP (nivel de alarma Fuhrländer transferido) | Pérdidas 0,872, AP 0,982, F1 de causa 0,765; 3,8 % de ventanas gemelas no tocadas marcadas | Ejecución 1: AP 0,995, F1 de causa 0,783 |

## Requisitos de hardware

- Los pesos publicados son solo el proyector y el adaptador de fusión (2.607.488 parámetros, model.safetensors); para inferencia hay que cargar además meta-llama/Llama-3.2-1B desde su repositorio original bajo su propia licencia.
- VRAM estimada: no disponible en la información proporcionada. Como referencia de orden de magnitud, un Llama-3.2-1B en fp16 ocupa aproximadamente 2,5 GB de pesos, a lo que se suman activaciones y el codificador de series temporales.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no confirmado por el autor; por el tamaño del modelo base es plausible en GPUs de consumo con memoria suficiente, pero no hay medición publicada.
- Opciones de despliegue: no disponible; la librería declarada es pytorch y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros entrenados | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-OpenTSLM-wind-joint (v1) | 2,6 M sobre Llama-3.2-1B congelado | no disponible | Cuatro preguntas SCADA de aerogenerador | llama3.2 | Pesos del adaptador públicos; datos y código de entrenamiento no |
| Modelos separados del mismo autor (referencia interna) | no disponible | no disponible | Una pregunta por modelo | no disponible | No publicados como repositorio independiente |
| Otros modelos OpenTSLM-SP | no disponible | no disponible | Series temporales generales | MIT (arquitectura) | Repositorio OpenTSLM en GitHub |

No se dispone de datos publicados de otros modelos comparables de clasificación SCADA con arquitectura de lenguaje en la información proporcionada.

## Limitaciones y advertencias

- El conjunto v1 falló su criterio de aceptación en dos de las cuatro tareas (paradas y causa); el autor lo declara explícitamente y anuncia un v2 pendiente de publicación.
- El entrenamiento conjunto indujo atajos: 47 de las 53 falsas alarmas de validación en paradas correspondieron a standstills con viento en calma mal clasificados, y se perdió una tormenta con paradas meteorológicas.
- La pérdida de validación media ocultó ambos problemas; el autor recomienda evaluar la métrica de cada pregunta durante el entrenamiento.
- En curtailment sobre Hill of Towie, el modelo separado detectó 188 eventos frente a 570 del conjunto, pero este último generó 317 falsas alarmas sobre 3.834 días limpios; el equilibrio precisión-exhaustividad es deficiente.
- En bajo rendimiento sobre EDP se marcó el 3,8 % de ventanas gemelas no tocadas, lo que indica falsos positivos en la transferencia entre fabricantes.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; al puntuar respuestas candidatas por verosimilitud, el riesgo de generación libre es limitado en las tareas de clasificación, pero la generación numérica de la magnitud de pérdida sí puede desviarse.
- Cobertura lingüística limitada al inglés.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y obligaciones de atribución; debe revisarse LICENSE.txt y USE_POLICY.md incluidos en el repositorio.
- No se publican la preparación de datos, los prompts, las etiquetas ni el código de entrenamiento, lo que impide reproducir los resultados sin contactar con el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- El tamaño del repositorio es de 0,0 GB y no incluye los pesos de Llama; un uso descuidado del checkpoint sin cargar el modelo base fallará.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gsoulja/Llama-3.2-1B-OpenTSLM-wind-joint
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Repositorio OpenTSLM: https://github.com/OpenTSLM/OpenTSLM
- Dataset Kelmarsh (Cubico Sustainable Investments): https://zenodo.org/records/16807551
- Dataset Penmanshiel (Cubico Sustainable Investments): https://zenodo.org/records/16807304
- Dataset Hill of Towie (RES para TRIG): https://doi.org/10.5281/zenodo.14870021
- Pull request de incorporación a TimeNet: https://github.com/OpenTSLM/TimeNet/pull/838
