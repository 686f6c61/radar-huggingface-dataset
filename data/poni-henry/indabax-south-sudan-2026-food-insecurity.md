# poni-henry/indabax-south-sudan-2026-food-insecurity

## Resumen

Food Insecurity Risk — IndabaX South Sudan 2026 es un clasificador tabular publicado en HuggingFace por el usuario poni-henry que predice si un condado de Sudán del Sur entrará en situación de inseguridad alimentaria de Crisis o peor, es decir, fase 3 o superior de la clasificación IPC (Integrated Phase Classification). El modelo se distribuye bajo licencia MIT y está etiquetado en el contexto del evento IndabaX South Sudan 2026, con las etiquetas tabular-classification, sklearn y food-security.

No se trata de un modelo de lenguaje ni de una red neuronal profunda: la librería declarada es scikit-learn y el artefacto se serializa con skops, lo que lo sitúa en la categoría de modelos predictivos clásicos sobre datos estructurados. La model card reporta una métrica AUC de validación de 0.9510, un valor alto que sugiere una separación clara entre clases en el conjunto de validación empleado, aunque no se documenta el procedimiento de partición ni el tamaño de la muestra.

El modelo es relevante para el ámbito humanitario porque aborda un problema de anticipación: convertir datos de fase IPC previa y de producción de cereales del año anterior en una señal binaria de riesgo que puede alimentar sistemas de alerta temprana. Su huella es mínima (el repositorio ocupa 0.0 GB según HuggingFace) y no requiere GPU, lo que facilita su despliegue en entornos con recursos limitados, habituales en oficinas de coordinación humanitaria sobre el terreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo tabular de scikit-learn; tipo de estimador concreto no especificado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (no hay pesos en coma flotante de red neuronal) |
| Idiomas soportados | no disponible; las variables de entrada son categóricas y numéricas (estado, condado), no texto libre |
| Licencia | MIT |
| Formato de pesos | skops (.skops): dos artefactos, model.skops y encoders.skops |
| Tarea | Clasificación binaria tabular (tabular-classification) |
| Metrica declarada | AUC |
| Valor de validacion declarado | 0.9510 |
| Libreria | scikit-learn (carga mediante skops.io) |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del estimador: no se indica si se trata de un bosque aleatorio, un gradient boosting, una regresión logística ni de un pipeline con varios pasos. Tampoco se detallan hiperparámetros, proceso de búsqueda, validación cruzada ni criterios de selección de variables. Lo único documentado es que existe un objeto de modelo y un objeto de codificadores (encoders), lo que implica un flujo de preprocesado con codificación de variables categóricas antes de la predicción.

Las variables de entrada son diez: state y county (categóricas), population, start_year y start_month (numéricas temporales), prior_period_ipc_phase y prior_period_phase3plus_pct (fase IPC y porcentaje en fase 3 o superior del periodo anterior, ambas retardadas), y prior_year_cereal_production_tonnes y prior_year_cereal_gap_tonnes (producción y déficit de cereales del año previo). El diseño es por tanto un modelo de riesgo con variables de retardo (lagged features), orientado a explotar la inercia temporal de la inseguridad alimentaria.

No se especifica el número de muestras de entrenamiento, el periodo temporal cubierto, la fuente de los datos IPC ni si se aplicaron técnicas de balanceo de clases o validación temporal. Tampoco se documenta ningún proceso de ajuste fino, RLHF o similar, algo que no aplica a este tipo de modelo.

## Capacidades

- Clasificación binaria: predice si un condado alcanzará la fase 3 o superior del IPC (Crisis o peor) en el periodo de interés.
- Consumo de variables tabulares mixtas: combina variables categóricas de localización con variables numéricas de población, tiempo, fase IPC previa y producción agrícola.
- Uso de información retardada: incorpora el estado del periodo anterior y la producción del año anterior como predictores, lo que lo hace apto para escenarios de pronóstico a corto plazo.
- Salida probabilística potencial: al ser un clasificador con métrica AUC, es esperable que exponga una puntuación de probabilidad, aunque la model card no lo confirma explícitamente.
- No soporta generación de texto, razonamiento en lenguaje natural, código ni matemáticas simbólicas.
- No soporta tool calling, function calling ni orquestación de agentes.
- No dispone de capacidades multimodales: ni visión, ni audio, ni procesamiento de imágenes satelitales documentado.
- No tiene capacidades multilingües en el sentido de NLP; las cadenas de entrada son nombres de estado y condado.
- No se documenta ningún modo especial de inferencia (thinking mode, decodificación especulativa, etc.).

## Casos de uso

- Alerta temprana humanitaria: el modelo puede puntuar cada condado con datos del periodo IPC anterior y de la cosecha previa para generar una lista priorizada de zonas con riesgo de entrar en fase 3 o superior, útil para activar protocolos de anticipación antes de que se confirme la crisis.
- Asignación de fondos de emergencia: una agencia puede usar las probabilidades de riesgo por condado para ordenar la distribución de presupuesto entre regiones, combinando la salida del modelo con criterios de población y déficit cerealista ya presentes como variables.
- Priorización logística de stock: con la lista de condados en riesgo, los equipos de logística pueden preposicionar alimentos y suministros en los almacenes más probables de necesitarlos, reduciendo tiempos de respuesta.
- Integración en paneles de seguimiento: al ser un artefacto skops de tamaño mínimo, puede cargarse dentro de un servicio Python o un cuadro de mando que recalcule predicciones cada vez que se publique un nuevo informe IPC.
- Análisis de escenarios agrícolas: modificando las variables de producción y déficit de cereales del año previo, un analista puede estimar cómo cambia el riesgo ante hipótesis de cosecha, siempre que respete el rango de los datos de entrenamiento.
- Apoyo a la investigación sobre inseguridad alimentaria: sirve como línea base reproducible (licencia MIT) para comparar nuevos enfoques predictivos sobre las mismas variables y el mismo objetivo binario.
- Formación y capacitación en ciencia de datos: por su tamaño reducido y su dependencia únicamente de scikit-learn, es adecuado como ejemplo práctico en talleres tipo IndabaX sobre clasificación tabular aplicada a problemas sociales.
- Triaje en evaluación de necesidades: en contextos con recursos de análisis limitados, el modelo aporta una primera criba automática que el personal humanitario puede revisar después con información cualitativa de campo.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Fuente |
|---|---|---|---|
| AUC | 0.9510 | Validación | Model card del autor |

No se han publicado resultados de benchmarks adicionales en la información disponible. No hay datos de precisión, exhaustividad, F1, matriz de confusión, calibración de probabilidades ni intervalos de confianza, y tampoco se documenta el tamaño ni la composición del conjunto de validación.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de scikit-learn cargado con skops, no requiere GPU; el cálculo se ejecuta en procesador.
- VRAM: no aplica; no hay pesos de red neuronal que ubicar en memoria de GPU.
- Memoria RAM: no disponible con precisión; el repositorio ocupa 0.0 GB según HuggingFace, lo que sugiere un artefacto muy pequeño, pero el consumo real depende del tipo y tamaño del estimador, dato no publicado.
- GPU recomendadas: ninguna. No se documenta soporte para aceleración por GPU ni conversión a formatos como ONNX o TensorRT.
- Cabe en cualquier equipo de consumo: sí, previsiblemente en portátiles y máquinas de gama baja, dado que el artefacto serializado es de tamaño despreciable y la librería es scikit-learn.
- Opciones de despliegue: carga directa con skops.io en Python, integración en servicios FastAPI o Flask, ejecución por lotes en scripts de análisis y empaquetado dentro de flujos de trabajo de ciencia de datos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; en un modelo tabular de este tipo la inferencia suele ser del orden de milisegundos por muestra en CPU, pero no hay medición publicada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables publicados, ni resultados de benchmarks frente a alternativas. Como referencia genérica de categoría, cualquier clasificador tabular supervisado (regresión logística, random forest, gradient boosting como XGBoost o LightGBM) puede resolver la misma tarea sobre las mismas variables, pero no se dispone de métricas de ninguno de ellos en este conjunto de datos concreto, por lo que no es posible establecer una comparación cuantitativa rigurosa. Tampoco se conocen otros modelos específicos de predicción de fase IPC para Sudán del Sur en la información disponible.

## Limitaciones y advertencias

- Alcance geográfico y temático restringido: el modelo está diseñado para condados de Sudán del Sur y para el objetivo binario de fase IPC 3 o superior; su uso fuera de ese contexto no está validado.
- Dependencia de variables retardadas: requiere la fase IPC y el porcentaje en fase 3 o superior del periodo anterior, así como datos de producción cerealista del año previo; si esos datos faltan o llegan tarde, el modelo no puede producir predicciones fiables.
- Validación no documentada: se reporta un único valor de AUC de validación (0.9510) sin detallar el tamaño de la muestra, el método de partición ni si la división respeta el orden temporal. Un AUC alto en validación puede reflejar fuga de información si la partición no es temporal.
- Riesgo de sobreajuste no cuantificado: no se publican métricas en un conjunto de test independiente ni intervalos de confianza, por lo que el rendimiento en producción es incierto.
- Ausencia de análisis de sesgo: no hay documentación sobre equidad entre condados, tamaños de población o periodos temporales, ni sobre el tratamiento de clases desbalanceadas.
- Datos de entrenamiento opacos: se desconoce la fuente exacta de los datos IPC y de producción agrícola, el periodo cubierto y los criterios de limpieza, lo que dificulta auditar la validez de las predicciones.
- Sin tracción comunitaria: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, sin evidencia de revisión por pares ni de uso en producción.
- Carga con trusted=True: el código de ejemplo de la model card invoca sio.load con trusted=True, lo que implica ejecutar el artefacto sin validación de tipos; conviene verificar la procedencia del fichero antes de cargarlo en entornos sensibles.
- Licencia MIT: permite uso comercial, modificación y redistribución con conservación del aviso de copyright y de la licencia, sin garantía por parte del autor. No se identifican restricciones adicionales, pero el autor no ofrece ninguna garantía de idoneidad para decisiones humanitarias.
- Uso responsable: las predicciones no deben sustituir la evaluación sobre el terreno ni los protocolos oficiales de clasificación IPC; deben tratarse como una señal complementaria de priorización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/poni-henry/indabax-south-sudan-2026-food-insecurity
- Paper o informe técnico: no disponible
- Repositorio de código: no disponible
- Demo o espacio interactivo: no disponible
- Documentación del evento IndabaX South Sudan 2026: no disponible en la información proporcionada
- Resultados de la búsqueda web: no relevantes; las URLs devueltas corresponden al restaurante Poni de París y no guardan relación con el modelo ni con su autor.
