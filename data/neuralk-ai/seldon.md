# Neuralk-AI/seldon

## Resumen

Seldon es un modelo fundacional especializado en datos tabulares, desarrollado por Neuralk-AI y publicado en Hugging Face bajo una licencia propia (`neuralk-seldon-license`) con acceso restringido que requiere aceptar condiciones. A diferencia de los LLM generativos, su pipeline declarado es `tabular-classification`: el modelo está diseñado para realizar clasificación sobre tablas directamente, sin entrenamiento específico por tarea, apoyándose en mecanismos de *in-context learning* y en un *synthetic prior* como estrategia de preentrenamiento.

El modelo cuenta con 213.464.122 parámetros (aproximadamente 213 millones), lo que lo sitúa en un rango de tamaño moderado, muy por debajo de los LLM de propósito general pero sustancialmente mayor que los modelos tabulares clásicos como XGBoost o CatBoost en términos de capacidad paramétrica. Los pesos se distribuyen en formato `safetensors` con un tamaño de repositorio de 0,9 GB.

Su relevancia radica en la propuesta de un modelo fundacional para datos tabulares: la idea de que, al igual que en visión o lenguaje, un modelo preentrenado sobre una distribución amplia de tareas tabulares sintéticas pueda generalizar a datasets nuevos mediante inferencia en contexto, reduciendo la necesidad de reentrenamiento por conjunto de datos. No se dispone de información pública sobre arquitectura interna, contexto, idiomas ni benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 213.464.122 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | neuralk-seldon-license (acceso restringido, requiere aceptacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna del modelo en la información proporcionada. Los tags de Hugging Face indican `foundation-model`, `in-context-learning` y `synthetic-prior`, lo que sugiere que el modelo fue preentrenado sobre un corpus de tareas tabulares sintéticas generadas mediante un prior, con el objetivo de que aprenda a resolver tareas de clasificación tabular a partir de ejemplos proporcionados en la propia entrada (in-context learning) en lugar de requerir ajuste fino por dataset.

El pipeline declarado es `tabular-classification`, lo que confirma que la salida esperada es una etiqueta categórica por fila de la tabla de entrada. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo tabular). Tampoco se detalla ninguna innovación técnica concreta más allá del enfoque de prior sintético e inferencia en contexto. Cualquier afirmación adicional sobre capas, atención o mecanismos internos sería especulativa y no se incluye.

## Capacidades

- Clasificación tabular: el pipeline principal es `tabular-classification`, orientado a predecir una etiqueta categórica a partir de un conjunto de variables tabulares.
- Inferencia en contexto (*in-context learning*): el tag `in-context-learning` sugiere que el modelo puede adaptarse a nuevas tareas tabulares proporcionando ejemplos en la entrada, sin reentrenamiento.
- Modelo fundacional tabular: el tag `foundation-model` indica que está pensado como base general para múltiples tareas tabulares, no para un único dataset.
- Preentrenamiento con prior sintético: el tag `synthetic-prior` apunta a que el entrenamiento se basa en datos tabulares sintéticos generados para cubrir una amplia variedad de distribuciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Clasificación de riesgo crediticio: el modelo podría recibir un conjunto de ejemplos etiquetados de solicitudes (variables demográficas, financieras y de historial) junto con nuevas filas sin etiquetar, y predecir la probabilidad de impago sin reentrenar por entidad financiera, aprovechando su naturaleza de modelo fundacional tabular.
- Detección de fraude en transacciones: integrado en un pipeline de scoring, el modelo podría clasificar transacciones como fraudulentas o legítimas a partir de un contexto de ejemplos representativos, lo que permite adaptarse a nuevos patrones de fraude sin reentrenamiento completo.
- Segmentación de clientes en marketing: clasificación de clientes en segmentos predefinidos (alto valor, churn probable, etc.) a partir de tablas de comportamiento, usando ejemplos en contexto para ajustar la definición de cada segmento por campaña.
- Triaje clínico sobre datos tabulares: clasificación de pacientes en categorías de riesgo a partir de variables analíticas y demográficas, con la ventaja de poder cambiar el criterio de clasificación proporcionando nuevos ejemplos en la entrada.
- Mantenimiento predictivo industrial: clasificación de lecturas de sensores en estados (normal, degradado, fallo inminente) a partir de un histórico tabular de ejemplos, útil cuando no se dispone de suficientes datos etiquetados para entrenar un modelo específico.
- Evaluación de calidad en procesos de fabricación: clasificación de lotes o piezas según variables de proceso y medidas de calidad, adaptando el modelo a nuevas líneas de producción mediante ejemplos en contexto en lugar de reentrenar por línea.
- Enriquecimiento de datos en pipelines ETL: uso del modelo como paso de clasificación dentro de un flujo de datos para etiquetar registros tabulares de forma automática antes de su almacenamiento o análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 213 millones de parámetros en precisión FP16, el peso del modelo ocupa aproximadamente 0,43 GB; en FP32, unos 0,85 GB. A ello hay que sumar la memoria para activaciones y para el contexto tabular de entrada, no cuantificada en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder alojar los pesos en FP16, pero no se especifican requisitos oficiales.
- Compatibilidad con GPU de consumo: por el tamaño paramétrico, es plausible que quepa en GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: no disponible. No se indica soporte para vLLM, llama.cpp, Ollama o TGI; al ser un modelo tabular con pipeline `tabular-classification`, probablemente requiera `transformers` u otro runtime compatible con su arquitectura específica, no documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos tabulares clásicos (XGBoost, CatBoost, LightGBM) no son directamente comparables en parámetros ni en enfoque, y no se han identificado otros modelos fundacionales tabulares con datos públicos en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| Seldon (Neuralk-AI) | 213.464.122 | no disponible | neuralk-seldon-license | Restringido (gated) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el modelo está en modo *gated* en Hugging Face y requiere aceptar las condiciones de la licencia `neuralk-seldon-license` antes de descargarlo; esto puede limitar su uso en entornos corporativos con políticas de licencias estrictas.
- Licencia no estándar: al no ser una licencia OSI reconocida (Apache 2.0, MIT, etc.), es imprescindible revisar los términos exactos para uso comercial, redistribución y modificación antes de integrarlo en producción.
- Sesgos: no disponible. Al entrenarse presumiblemente sobre datos sintéticos, los sesgos dependerán del prior de generación, no documentado.
- Riesgo de alucinación: en un modelo de clasificación tabular el riesgo se traduce en predicciones erróneas o sobreconfiadas en distribuciones alejadas de las del entrenamiento; no se documentan métricas de calibración.
- Limitaciones de contexto o idioma: no disponible. No se especifica el número máximo de filas o columnas que el modelo puede procesar en una sola pasada, lo que es crítico para planificar su uso en tablas grandes.
- Idiomas: no se listan idiomas soportados; al operar sobre datos tabulares, la relevancia lingüística es limitada, pero no se confirma el tratamiento de variables categóricas textuales en distintos idiomas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un modelo muy reciente y sin validación comunitaria pública.
- Documentación escasa: no se publican detalles de arquitectura, entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad frente a alternativas consolidadas como gradient boosting para tareas tabulares concretas.

## Enlaces

- Hugging Face: https://huggingface.co/Neuralk-AI/seldon
- Licencia: no disponible como enlace directo en la información proporcionada (referenciada como `neuralk-seldon-license`)
- Paper, blog, repositorio o demo: no disponible en la información proporcionada
