# Neuralk-AI/seldon-mini

## Resumen

Seldon-mini es un modelo fundacional especializado en datos tabulares desarrollado por Neuralk-AI. A diferencia de los modelos de lenguaje, su tarea principal es la clasificación tabular mediante *in-context learning*: recibe un conjunto de filas de ejemplo (el contexto) junto con una consulta y predice la etiqueta de la fila consultada, sin necesidad de reentrenamiento por tarea. El modelo se distribuye en formato safetensors con 27.404.554 parámetros (unos 27,4 millones), lo que lo sitúa en la gama ligera y permite desplegarlo en CPU o GPUs de consumo.

El modelo se publica bajo la licencia propietaria `neuralk-seldon-license` y con acceso restringido (gated) en Hugging Face, por lo que es necesario aceptar las condiciones de uso antes de descargarlo. El repositorio ocupa aproximadamente 0,1 GB. La información pública disponible no incluye detalles sobre arquitectura interna, longitud de contexto, idiomas ni datos de entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

Su relevancia actual radica en el creciente interés por los modelos fundacionales tabulares que generalizan entre esquemas y tareas sin ingeniería de características manual ni ajuste fino, un nicho dominado por propuestas como TabPFN o TabICL. Seldon-mini se posiciona como una alternativa compacta dentro de esa categoría, aunque su adopción dependerá de la licencia y de la documentación técnica que acompañe al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional para datos tabulares) |
| Parametros totales | 27.404.554 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es tabular, no textual) |
| Licencia | neuralk-seldon-license (propietaria, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo en la información disponible. Por los tags del repositorio (`foundation-model`, `in-context-learning`, `synthetic-prior`) y la tarea declarada (`tabular-classification`), cabe inferir que sigue el paradigma de los modelos fundacionales tabulares: un transformer (o variante) entrenado sobre un prior sintético de tareas tabulares que aprende a resolver clasificaciones nuevas a partir de ejemplos en contexto, sin actualización de pesos. Esta inferencia debe tratarse como hipótesis, no como dato confirmado.

Tampoco se dispone de datos sobre el volumen de tokens o filas de entrenamiento, la composición del dataset sintético, ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en este dominio). No se han documentado innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación tabular mediante *in-context learning*: predice la etiqueta de una fila a partir de un conjunto de ejemplos proporcionados en el contexto.
- Generalización entre tareas sin reentrenamiento: el mismo modelo puede aplicarse a distintos conjuntos de datos tabulares cambiando únicamente el contexto de ejemplos.
- Manejo de esquemas heterogéneos: al ser un modelo fundacional tabular, se espera que soporte columnas numéricas y categóricas, aunque la información disponible no detalla el preprocesado exacto.
- No se ha documentado soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio).
- No se ha documentado capacidad multilingüe; la naturaleza de la tarea es tabular y no textual.

## Casos de uso

- Clasificación de riesgo crediticio: usar el modelo con un lote de solicitudes históricas etiquetadas como contexto para puntuar nuevas solicitudes sin entrenar un modelo específico por entidad financiera.
- Detección de fraude en transacciones: alimentar el contexto con transacciones etiquetadas recientes y consultar transacciones nuevas para obtener una predicción inmediata, útil en prototipado rápido.
- Segmentación de clientes en marketing: clasificar clientes en segmentos predefinidos a partir de un conjunto de ejemplo, evitando pipelines de feature engineering por campaña.
- Triaje clínico exploratorio: clasificar registros de pacientes según variables tabulares de ejemplo en fases de investigación, siempre con supervisión humana y validación regulatoria.
- Mantenimiento predictivo industrial: clasificar lecturas de sensores como normales o anómalas usando un contexto de lecturas históricas etiquetadas.
- Evaluación rápida de datasets en ciencia de datos: usar el modelo como *baseline* inmediato en competiciones o análisis exploratorios antes de invertir en modelos específicos.
- Clasificación de leads comerciales: priorizar contactos según su probabilidad de conversión usando ejemplos etiquetados del propio CRM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,4 millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 110 MB; en FP16, unos 55 MB. La memoria adicional dependerá del tamaño del contexto tabular (número de filas de ejemplo), que no está documentado.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente para los pesos; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs integradas o de gama baja.
- Opciones de despliegue: al ser safetensors y un modelo de clasificación tabular, el despliegue requerirá el código de inferencia propio de Neuralk-AI; no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| Seldon-mini (Neuralk-AI) | 27,4 M | no disponible | Clasificación tabular in-context | neuralk-seldon-license | Restringido (gated) |
| TabPFN v2 (Prior Labs) | ~11 M | no disponible | Clasificación/regresión tabular in-context | no comercial / licencia específica | Abierto con condiciones |
| TabICL (Inria) | ~27 M (orden de magnitud) | no disponible | Clasificación tabular in-context | abierta (según versión) | Abierto |

Los datos de TabPFN v2 y TabICL se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento publicadas entre Seldon-mini y estas alternativas.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo; al entrenarse presumiblemente sobre datos sintéticos, puede heredar sesgos del prior de generación.
- Riesgo de alucinación en sentido tabular: predicciones con confianza mal calibrada en distribuciones alejadas del contexto de ejemplo.
- Limitaciones de contexto: se desconoce el número máximo de filas de ejemplo o columnas soportadas; superar ese límite puede degradar la precisión.
- Licencia propietaria (`neuralk-seldon-license`) con acceso restringido: es imprescindible revisar las condiciones antes de cualquier uso comercial; no es una licencia open source.
- Sin documentación pública sobre arquitectura, entrenamiento o evaluación: dificulta la auditoría técnica y la reproducibilidad.
- Al ser un modelo de clasificación tabular, no debe emplearse para generación de texto ni tareas de lenguaje.
- En producción, requiere validación frente a *baselines* clásicos (gradient boosting) para confirmar que el enfoque in-context aporta ventaja en el caso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Neuralk-AI/seldon-mini
