# Einse57/swec-ieeg-seizure-lightgbm

## Resumen

El modelo `Einse57/swec-ieeg-seizure-lightgbm` es un clasificador tabular basado en LightGBM (gradient boosting de árboles de decisión) diseñado para puntuar la probabilidad de crisis epiléptica segundo a segundo en registros de electroencefalografía intracraneal (iEEG). Lo desarrolla el usuario independiente Einse57 y se entrena exclusivamente sobre el dataset público SWEC iEEG del Sleep-Wake-Epilepsy-Center del Inselspital de Berna. No es una red neuronal ni un modelo de lenguaje: es un ensamblado de 300 árboles que opera sobre 17 características espectrales y de complejidad extraídas de ventanas de 4 segundos.

El problema que aborda es la detección automática de crisis en iEEG como línea base de investigación, un área donde los modelos fundacionales de señales neuronales están ganando protagonismo pero carecen de alternativas simples y auditables. La relevancia actual radica en su enfoque de normalización por canal contra la hora precedente, que permite al clasificador operar con cualquier número y disposición de electrodos, y en su naturaleza interpretable: al ser un modelo de árboles, es posible analizar qué características impulsan cada detección.

El modelo se distribuye con licencia MIT, aunque hereda las restricciones de uso exclusivamente investigador del dataset subyacente. No dispone de parámetros en el sentido de un transformer, no tiene ventana de contexto lingüístico y no soporta idiomas: es una herramienta de clasificación de señales, no un modelo generativo. El repositorio tiene 0 GB de tamaño declarado y cero descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (LightGBM), 300 árboles, 31 hojas, tasa de aprendizaje 0,05 |
| Parámetros totales | no disponible (no es un modelo neuronal; no se reporta recuento de parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 4 s con avance de 1 s por canal |
| Tipos de cuantización | no aplica (modelo de árboles; no se distribuyen pesos en formato cuantizable) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (con restricción de uso investigador heredada del dataset SWEC) |
| Formato de pesos | no disponible (librería LightGBM; el repositorio declara 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblado LightGBM de 300 árboles con 31 hojas por árbol y tasa de aprendizaje 0,05. Cada canal de iEEG se puntúa de forma independiente, de modo que el modelo es agnóstico al montaje de electrodos: funciona con 24 canales o con 128, con tiras, rejillas o electrodos de profundidad. La puntuación por segundo es la media de las tres puntuaciones de canal más altas, un agregado tipo top-3 que prioriza la evidencia más fuerte sin exigir un número fijo de electrodos.

El pipeline de características parte de una señal remuestreada a 256 Hz tras un filtro antialiasing de 100 Hz. Por cada canal se calculan 17 características sobre ventanas de 4 s con paso de 1 s: longitud de línea (log), movilidad y complejidad de Hjorth, tasa de cruces por cero, potencia de banda en delta (0,5–4 Hz), theta (4–8 Hz), alfa (8–13 Hz), beta (13–30 Hz), gamma (30–80 Hz) y gamma alta (80–100 Hz), potencia total logarítmica, entropía espectral, frecuencia de borde espectral al 95 %, frecuencia de pico, pendiente espectral (2–100 Hz), entropía de permutación de orden 4 y dimensión fractal de Higuchi. Cada característica se estandariza por canal contra la mediana y el rango intercuartílico de la hora precedente, actualizados cada minuto, y se recorta a ±20; esto hace que el modelo detecte cambios relativos al fondo reciente del propio paciente en lugar de valores absolutos.

El entrenamiento usa 40 pacientes del dataset SWEC (ID01–ID19, ID23, ID26, ID33, ID41–ID44, ID46, ID48, ID49, ID55, ID56, ID58, ID60–ID65, ID67, ID68), con 4.986 horas de registro y 418 crisis anotadas por un epileptólogo certificado. Se excluyeron 18 sujetos (ID20–ID40 salvo ID23, ID26 e ID33) porque en los ficheros liberados son copias de ID01–ID18, y se dejaron fuera ID57 y ID59 por patrones anómalos de duración y hueco en las anotaciones. No se reporta en la información disponible el número de tokens ni composición de dataset en el sentido habitual, ni si hubo ajuste por RLHF o DPO (no aplica a un modelo de árboles). La regla de flagging promedia la puntuación sobre los segundos precedentes de suavizado y abre un segmento cuando la puntuación suavizada se mantiene por encima del umbral de onset durante el tiempo de confirmación, cerrándose cuando cae por debajo de umbral de onset × ratio de apagado.

## Capacidades

- Puntuación de probabilidad de crisis por segundo en registros multicanal de iEEG.
- Agrupación de segundos de alta puntuación en segmentos flaggeados mediante regla de suavizado, confirmación y umbral de apagado.
- Funcionamiento con cualquier número y disposición de electrodos (24–128 canales en los datos de entrenamiento), al puntuar cada canal por separado.
- Normalización adaptativa por canal contra la hora precedente, que permite detectar cambios relativos al fondo del paciente.
- Interpretabilidad parcial: al ser un modelo de árboles, es posible inspeccionar qué características impulsan las detecciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, imagen ni audio: solo señales de iEEG preprocesadas.

## Casos de uso

- Línea base de investigación en detección de crisis: sirve como referencia simple y reproducible contra la que comparar modelos fundacionales de señales neuronales en iEEG, gracias a su pipeline de características explícito y a su entrenamiento sobre un dataset público.
- Estudio de características discriminativas: al ser un ensamblado de árboles, permite analizar la importancia de las 17 características (entropía espectral, potencia de banda, dimensión fractal de Higuchi) para entender qué propiedades de la señal impulsan las detecciones.
- Validación de pipelines de preprocesado: su cadena de filtrado, remuestreo a 256 Hz, extracción de ventanas de 4 s y normalización por hora es reutilizable para probar variantes de preprocesado antes de entrenar modelos más costosos.
- Docencia y formación en análisis de iEEG: la naturaleza interpretable del modelo y su regla de flagging explícita lo hacen adecuado para ilustrar cómo se construye un detector de eventos sobre señales fisiológicas.
- Experimentos de detección con montajes variables: al puntuar canales de forma independiente y agregar por top-3, permite estudiar el rendimiento con subconjuntos reducidos de electrodos, útil para investigar configuraciones de adquisición.
- Reproducibilidad de resultados: al estar entrenado sobre un dataset público con licencia CDLA-Permissive-2.0 y distribuirse con licencia MIT, permite a otros grupos reproducir la evaluación retrospectiva y comparar con sus propios métodos.
- Análisis retrospectivo de cohortes: para investigación sobre caracterización de crisis en registros ya anotados, como estudio de la relación entre duración de crisis y patrones espectrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el método y la población de entrenamiento, pero no incluye tablas de sensibilidad, especificidad, tasa de falsos positivos por hora ni comparaciones cuantitativas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; un ensamblado LightGBM de 300 árboles se ejecuta en CPU con huella de memoria muy reducida (del orden de megabytes), sin necesidad de GPU.
- GPU recomendadas: no se requiere GPU; el cuello de botella es la extracción de características sobre señales de 4.986 horas, no la inferencia del clasificador.
- Cabe en cualquier GPU consumer y en CPU convencional; no hay requisito de VRAM.
- Opciones de despliegue: LightGBM nativo en Python, con posibilidad de exportación a otros formatos de la librería; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del coste de cálculo de las 17 características por canal y ventana.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Einse57/swec-ieeg-seizure-lightgbm | LightGBM sobre características espectrales | SWEC iEEG (40 pacientes, 4.986 h, 418 crisis) | Ventana de 4 s, paso de 1 s | MIT (uso investigador por herencia del dataset) | Hugging Face |
| Modelo fundacional de Carzaniga et al. (arXiv:2506.20354) | Transformer con atención paralela multivariante | Señales neuronales (referencia citada en la model card) | no disponible | no disponible | Paper arXiv |
| Alternativas de detección de crisis en iEEG | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar parámetros, contexto y rendimiento con alternativas concretas de la misma categoría. La model card cita el modelo fundacional de Carzaniga et al. como referencia del dataset, pero no ofrece una comparación cuantitativa.

## Limitaciones y advertencias

- Uso exclusivamente investigador: no es un dispositivo médico y no debe emplearse para diagnóstico, seguimiento, aviso de eventos al personal ni ninguna decisión clínica.
- No validado de forma prospectiva, ni en otros centros, ni en EEG de cuero cabelludo; solo ha visto registros intracraneales del SWEC.
- Entrenado con datos de un único centro (Inselspital Bern) y con los grupos de pacientes disponibles; el dataset no reporta edad, sexo, síndrome epiléptico ni tipo de crisis por paciente, por lo que no puede caracterizarse la población.
- Riesgo de sobreajuste a particularidades del montaje y del equipo de adquisición del SWEC; el rendimiento en otros sistemas de registro es desconocido.
- La detección se basa en cambios relativos al fondo de la hora precedente, lo que puede fallar ante estados de sueño, artefactos o cambios de impedancia no representados en el entrenamiento.
- Excluye 18 sujetos por duplicación de ficheros y 2 por anotaciones anómalas; el conjunto efectivo es de 40 pacientes, lo que limita la generalización estadística.
- Licencia MIT en el repositorio, pero el dataset subyacente es CDLA-Permissive-2.0 con restricción de uso investigador y prohibición de uso diagnóstico; esa restricción se traslada al modelo.
- No se han publicado métricas de rendimiento (sensibilidad, especificidad, falsos positivos por hora) en la información disponible, por lo que no es posible evaluar su calidad cuantitativa.
- Proyecto independiente no afiliado ni revisado por los autores del dataset.
- El repositorio declara 0 descargas y 0 likes, sin evidencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Einse57/swec-ieeg-seizure-lightgbm
- Dataset SWEC iEEG: https://huggingface.co/datasets/NeuroTec/SWEC_iEEG_Dataset
- Paper del dataset (Carzaniga F, Hersche M, Sebastian A, Schindler K, Rahimi A. A foundation model with multi-variate parallel attention to generate neuronal activity): https://arxiv.org/abs/2506.20354
