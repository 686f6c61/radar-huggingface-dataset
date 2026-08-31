# mostafarezaali/HeatCast-W34

## Resumen

HeatCast-W34 es un modelo de red neuronal de tipo mesh graph neural network (GNN) inspirado en GraphCast, desarrollado por Mostafa Rezaali (Universidad de Florida) para la predicción probabilística de la temperatura máxima diaria en la región continental de Estados Unidos (CONUS) en el horizonte subestacional de semanas 3 a 4 (días 15 a 28). El modelo genera, para cada celda terrestre de la malla PRISM y para cada día de adelanto, una media condicional gaussiana y una desviación estándar dependiente del estado, lo que permite cuantificar la incertidumbre de la predicción.

Con 4.637.891 parámetros, HeatCast-W34 emplea una arquitectura de codificación grid-to-mesh, un procesador de paso de mensajes sobre un multimesh icosaédrico, atención de tubo multi-lead y una cabeza distribucional entrenada mediante el CRPS gaussiano. El modelo se distribuye en cinco pliegues disjuntos por año (folds), cada uno con pesos en formato Safetensors y metadatos de arquitectura. Su licencia MIT facilita su uso en investigación, aunque el autor advierte explícitamente que son modelos de hindcast de investigación, no un sistema operativo de alerta.

La relevancia actual de HeatCast-W34 radica en abordar un hueco en la predicción subestacional: la ventana de semanas 3-4 es especialmente difícil para los modelos dinámicos tradicionales, y este enfoque de aprendizaje profundo ofrece una alternativa probabilística con calibración de excedencia de calor, un aspecto crítico ante el aumento de olas de calor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mesh graph neural network (estilo GraphCast) con grid-to-mesh encoding, procesador multimesh icosaédrico con message passing, multi-lead tube attention y mesh-to-grid decoding |
| Parametros totales | 4.637.891 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de series temporales; la ventana de entrada no se especifica en la documentación pública) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en Safetensors, presumiblemente en precisión flotante estándar) |
| Idiomas soportados | No aplica (modelo numérico de datos meteorológicos) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

HeatCast-W34 sigue el paradigma de GraphCast: primero codifica los campos de entrada (variables atmosféricas de superficie y de niveles de presión) desde la malla regular a un grafo multimesh icosaédrico, donde un procesador realiza múltiples pasos de message passing para propagar información espacial. Posteriormente, una atención de tubo multi-lead permite modelar dependencias temporales entre los distintos días de adelanto (leads), y la decodificación mesh-to-grid devuelve las predicciones a la malla PRISM. La cabeza distribucional produce dos salidas por celda y lead: una media condicional y una desviación estándar dependiente del estado, entrenadas conjuntamente mediante la minimización del CRPS (Continuous Ranked Probability Score) gaussiano.

El entrenamiento se realiza sobre datos de temperatura máxima diaria de PRISM para CONUS, en la estación cálida (mayo a septiembre, MJJAS). El modelo se evalúa mediante cinco pliegues disjuntos por año (year-disjoint folds) para evitar contaminación temporal. No se han publicado detalles sobre el número de tokens de entrenamiento (al no ser un modelo de lenguaje, este concepto no aplica) ni sobre la composición exacta del dataset de entrenamiento, aunque se mencionan PRISM, ERA5 y ECMWF ENS como fuentes externas no distribuidas en el repositorio. No se indica el uso de RLHF ni DPO, al tratarse de un modelo de regresión probabilística.

## Capacidades

- Predicción probabilística de temperatura máxima diaria (T2max) para CONUS en el horizonte de días 15 a 28, con media y desviación estándar por celda.
- Calibración de excedencia de calor (heat-exceedance): permite estimar probabilidades de superación de umbrales térmicos.
- Manejo de dependencias espaciales mediante grafos multimesh y de dependencias temporales mediante tube attention multi-lead.
- Salida distribuida gaussiana entrenada con CRPS, adecuada para cuantificar incertidumbre.
- Inferencia de una sola pasada (single-pass inference), sin necesidad de generar miembros de ensemble dinámicos.
- Disponibilidad de cinco pliegues de pesos para validación cruzada temporal.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural; es un modelo puramente numérico de series temporales meteorológicas.

## Casos de uso

- Investigación en predicción subestacional: el modelo permite estudiar la habilidad de las redes neuronales de grafo para pronósticos de semanas 3-4 en CONUS, comparando con ensembles dinámicos como ECMWF ENS.
- Calibración de alertas tempranas de olas de calor: a partir de la salida probabilística (media y sigma), se pueden calcular probabilidades de excedencia de umbrales de temperatura, útiles para servicios meteorológicos y agencias de gestión de emergencias.
- Planificación agrícola: los agricultores pueden utilizar las predicciones de temperatura máxima a 3-4 semanas para decidir sobre riego, protección de cultivos o calendario de siembra, con una medida de incertidumbre asociada.
- Gestión energética: las compañías eléctricas pueden anticipar picos de demanda por calor extremo en el horizonte subestacional, ajustando la generación y el mantenimiento de infraestructura.
- Estudios de salud pública: los departamentos de salud pueden evaluar el riesgo de golpes de calor y planificar campañas preventivas basadas en la probabilidad de eventos de calor extremo.
- Evaluación de modelos climáticos: como referencia de hindcast, permite comparar el rendimiento de métodos de aprendizaje automático frente a modelos físicos en la ventana subestacional, ayudando a identificar fortalezas y debilidades de cada enfoque.
- Desarrollo de sistemas de predicción por conjuntos: aunque el modelo no genera miembros de ensemble dinámicos, su salida gaussiana puede combinarse con otros modelos (por ejemplo, el stack HeatCast-plus-ENS) para construir predicciones probabilísticas multimodelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni en la model card ni en los resultados de búsqueda web). No se dispone de métricas cuantitativas como CRPS, skill score o comparaciones con modelos de referencia (por ejemplo, ECMWF ENS o climatología). El repositorio GitHub y la documentación mencionan la existencia de HeatCast-C (calibración de probabilidad) y HeatCast-plus-ENS, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- El modelo tiene 4.637.891 parámetros, lo que en precisión flotante de 32 bits ocupa aproximadamente 18,5 MB en memoria (sin contar activaciones y buffers). Esto lo hace extremadamente ligero en comparación con modelos de lenguaje o GNN meteorológicos de gran escala como GraphCast (36,7 M de parámetros).
- VRAM estimada: no se especifica oficialmente, pero con un tamaño tan reducido, cualquier GPU con al menos 2 GB de VRAM debería ser suficiente para inferencia. Incluso una CPU moderna podría ejecutar el modelo sin problemas.
- GPU recomendadas: no hay requisitos específicos; cualquier GPU de consumo (por ejemplo, NVIDIA RTX 2060 o superior) sería más que suficiente. Para entrenamiento, una GPU con 8-16 GB de VRAM sería adecuada, aunque el autor no publica detalles.
- Opciones de despliegue: al ser un modelo PyTorch con pesos Safetensors, puede cargarse directamente con PyTorch o con librerías de inferencia como ONNX Runtime (si se exporta). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamaño reducido, se espera una inferencia muy rápida (del orden de milisegundos por muestra en GPU), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Horizonte | Region | Salida | Licencia |
|---|---|---|---|---|---|---|
| HeatCast-W34 (este) | 4,6 M | Mesh GNN (GraphCast-style) | Días 15-28 | CONUS | Gaussiana (media + sigma) | MIT |
| GraphCast (original) | 36,7 M | Mesh GNN | Hasta 10 días | Global | Determinista (o ensemble) | Apache 2.0 (código) |
| HeatCast-Global | No disponible (misma arquitectura de referencia) | Mesh GNN | No especificado | Global | Gaussiana (media + sigma) | MIT (según repositorio) |

Nota: no se dispone de datos de rendimiento comparativo (CRPS, MAE, etc.) entre estos modelos. GraphCast es el referente arquitectónico, pero su horizonte es más corto (10 días) y su salida no es inherentemente probabilística en la versión original. HeatCast-Global es una variante del mismo autor para ámbito global, pero su documentación es escasa y no se han publicado benchmarks. No se han encontrado modelos comparables con el mismo enfoque (GNN probabilístico subestacional para CONUS) en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación, no operativo: el autor indica explícitamente que son hindcast models, no un sistema de alerta en tiempo real.
- Alcance geográfico y temporal limitado: el modelo solo está entrenado y evaluado para CONUS y para los meses de mayo a septiembre (MJJAS). No se ha establecido su rendimiento fuera de esta región o estación.
- Dependencia de datos externos: para la inferencia exacta se requieren los inputs de preprocesamiento y las convenciones de normalización descritas en `MODEL_INPUTS.md`, que no se distribuyen en el repositorio. Los conjuntos de datos PRISM, ERA5 y ECMWF ENS deben obtenerse por separado y bajo sus propias licencias.
- No produce miembros de ensemble dinámicos: la salida es una distribución gaussiana paramétrica (media y sigma), lo que limita la representación de incertidumbre multimodal o de colas extremas.
- Calibración adicional necesaria: la calibración de probabilidad (HeatCast-C) y la combinación con ECMWF ENS (HeatCast-plus-ENS) requieren artefactos adicionales no incluidos en el paquete, así como procedimientos de validación cruzada por pliegues.
- Riesgo de sesgos: al entrenarse solo con datos históricos de PRISM, el modelo puede heredar sesgos de los datos de entrada, como cambios en la red de estaciones o inhomogeneidades temporales. No se han publicado análisis de sesgos.
- Sin soporte de idiomas ni capacidades de lenguaje: es un modelo numérico puro; no debe confundirse con un LLM.
- Fecha de creación futura (2026-08-31) según el registro de HuggingFace: esto podría indicar una fecha de publicación programada o un error de metadatos; se recomienda verificar la validez temporal del modelo antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/mostafarezaali/HeatCast-W34
- GitHub (HeatCast): https://github.com/Mostafa-Rezaali/HeatCast
- GitHub (HeatCast-Global): https://github.com/Mostafa-Rezaali/HeatCast-Global
- Página académica de Mostafa Rezaali: https://mostafa-rezaali.github.io/
- Perfil de Google Scholar: https://scholar.google.com/citations?user=oaA6rLAAAAAJ&hl=tr
- Página de departamento (Universidad de Florida): https://geog.ufl.edu/directory/mostafa-rezaali/
