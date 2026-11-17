# sahithimacharapu2/ec-esm11

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino (fine-tuning) del backbone ESM-2 de 35 millones de parámetros de Meta (facebook/esm2_t12_35M_UR50D), al que se le añade una cabeza clasificadora para predecir el número EC (Enzyme Commission) de una enzima a partir de su secuencia de aminoácidos. El objetivo es asignar la clasificación enzimática completa de cuatro niveles (por ejemplo, 1.1.1.131), con la precisión en el nivel L4 como métrica principal.

El modelo resuelve un problema clásico de bioinformática: la anotación funcional automática de proteínas. Dado que la determinación experimental del número EC es costosa, un clasificador basado en secuencia permite anotar enzimas a gran escala. El repositorio incluye además un pipeline de inferencia completo con Docker, validación de entradas y un vocabulario de 6939 números EC válidos, lo que facilita su despliegue reproducible.

Se trata de un modelo pequeño (35M de parámetros, repositorio de 0,1 GB), lo que lo hace apto para ejecución en CPU y GPU de consumo. La información pública disponible es limitada: no se han publicado resultados de benchmarks en la model card ni detalles sobre el conjunto de entrenamiento o el proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (12 capas, hidden size 480) con cabeza clasificadora MLP (Dropout-Linear-GELU-Dropout-Linear) |
| Parametros totales | Aproximadamente 35M (backbone ESM-2 35M) mas la cabeza clasificadora (no disponible el total exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del tokenizador ESM-2; el limite tipico de ESM-2 35M es 1024 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (etiqueta de idioma del modelo); la tarea es sobre secuencias de aminoacidos, no texto natural |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone esm2/model.safetensors) y PyTorch state_dict (classifier_head.pt) |

## Arquitectura y entrenamiento

El modelo parte del backbone ESM-2 de 35M de parámetros (esm2_t12_35M_UR50D), un transformer de 12 capas con dimensión oculta de 480 entrenado por Meta sobre secuencias de proteínas. Sobre la representación del backbone se aplica una cabeza clasificadora secuencial: Dropout(0.1), Linear(480, 480), GELU, Dropout(0.1) y Linear(480, num_classes). Según el código de entrenamiento incluido, se congelan las primeras 4 capas del backbone (n_freeze=4) y se ajusta el resto junto con la cabeza. El espacio de salida corresponde a 6939 números EC válidos definidos en ec_vocabulary.json, con una lista de clases L4 y un fallback_ec en weights/classes.json.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en clasificación). Tampoco se documenta la estrategia de validación ni el régimen de entrenamiento (épocas, learning rate, optimizador). La innovación técnica destacable es la integración de un pipeline de inferencia reproducible con Docker, umbral de probabilidad configurable (EC_THRESH) para predicciones múltiples y control del presupuesto temporal de inferencia (EC_TIME_BUDGET).

## Capacidades

- Clasificación de enzimas: predice el número EC de cuatro niveles (L1 a L4) a partir de una secuencia de aminoácidos.
- Salida multi-etiqueta: con un umbral de probabilidad configurable (por defecto 0,5) puede devolver varias predicciones EC por secuencia; con EC_THRESH=1.1 devuelve solo la top-1.
- Procesamiento por lotes: inferencia batch configurable mediante EC_BATCH (por defecto 32).
- Validación de entradas: incluye inputs.py para comprobar el formato de los datos (Parquet con columnas id y sequence).
- Integración en pipelines: entrada Parquet y salida JSONL, apta para flujos de anotación masiva.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión o audio); es un clasificador de secuencias, no un modelo generativo de propósito general.
- Capacidad multilingüe no aplicable: opera sobre secuencias biológicas, no sobre texto en lenguaje natural.

## Casos de uso

- Anotación funcional a gran escala de genomas y metagenomas: procesar lotes de secuencias proteicas en formato Parquet y obtener la predicción EC en JSONL permite anotar miles de enzimas de forma automatizada, reduciendo la dependencia de anotación experimental.
- Priorización en pipelines de biología computacional: usar la predicción EC como filtro previo para seleccionar candidatos enzimáticos antes de análisis más costosos (modelado estructural, docking o ensayos de laboratorio).
- Enriquecimiento de bases de datos de proteínas: completar metadatos funcionales de entradas sin número EC asignado, con umbral de confianza ajustable para controlar el número de predicciones.
- Clasificación multi-etiqueta en enzimas promiscuas: gracias a EC_THRESH, recuperar varias clases EC plausibles por secuencia, útil para enzimas con actividad secundaria.
- Despliegue reproducible en entornos de investigación: el Dockerfile incluido permite ejecutar el modelo en clústeres o servicios internos sin gestionar dependencias manualmente.
- Prototipado rápido en CPU: con 35M de parámetros y pesos safetensors, el modelo puede ejecutarse en estaciones de trabajo sin GPU dedicada para validaciones y pruebas de concepto.
- Integración en servicios de anotación bajo demanda: el control de EC_TIME_BUDGET (660 s por defecto) permite acotar la latencia total de un lote en entornos con restricciones de tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación se realiza en los cuatro niveles (L1–L4) con la precisión L4 como métrica principal, pero no incluye cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del backbone (35M de parámetros en safetensors, repositorio de 0,1 GB), la huella en memoria es reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo es viable en RTX 3060, RTX 4090, A100 o H100, aunque no se especifican requisitos oficiales.
- Ejecución en CPU: viable por el reducido tamaño del modelo, si bien el throughput no está documentado.
- Opciones de despliegue: el repositorio proporciona un Dockerfile y el script predict.py como vía principal; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos generativos, no a clasificadores).
- Latencia y throughput estimados: no disponibles; solo se indica un presupuesto temporal máximo configurable (EC_TIME_BUDGET=660 s) y un tamaño de lote por defecto de 32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-2 35M Enzyme EC Classifier (este modelo) | ~35M | No disponible | Clasificacion EC (L1–L4) | MIT | Hugging Face (repo propio) |
| ESM-2 35M base (facebook/esm2_t12_35M_UR50D) | 35M | ~1024 tokens (tipico) | Representaciones de proteinas (no clasifica EC por si solo) | MIT | Hugging Face |
| Otros clasificadores EC basados en ESM-2 | No disponible | No disponible | Clasificacion EC | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay métricas de precisión L1–L4 en la model card, por lo que el rendimiento real no puede evaluarse a priori.
- Información de entrenamiento incompleta: se desconoce el dataset, su tamaño, la distribución de clases y el posible desbalanceo, lo que impide valorar la generalización.
- Riesgo de predicciones incorrectas: como todo clasificador, puede asignar números EC erróneos, especialmente en clases poco representadas o en enzimas con actividades múltiples; el umbral EC_THRESH permite mitigar la sobrepredicción pero no garantiza corrección.
- Cobertura limitada del vocabulario: el espacio de salida está restringido a 6939 números EC; secuencias que correspondan a clases fuera de ese vocabulario no podrán clasificarse correctamente.
- Sesgos potenciales: no documentados, pero cabe esperar sesgos derivados de la distribución del conjunto de entrenamiento (posible sobrerrepresentación de enzimas bien estudiadas).
- Uso comercial: la licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad del modelo para aplicaciones críticas.
- Idiomas: la etiqueta de idioma es inglés, aunque la tarea opera sobre secuencias de aminoácidos; no aplica soporte multilingüe de texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Dependencia del pipeline incluido: el uso previsto se apoya en el Dockerfile y predict.py; integraciones fuera de ese flujo requerirán adaptar el código de carga del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm11
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
