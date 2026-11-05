# Lukit4as/lucas-keras-regresion

## Resumen

`Lukit4as/lucas-keras-regresion` es un modelo de regresión tabular publicado en HuggingFace por el usuario Lukit4as en el marco del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje: es una red neuronal mínima implementada con Keras 3 que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables de entrada (`m2`, `balcon`, `ascensor`). Su propósito es exclusivamente pedagógico: ilustrar el ciclo completo de entrenamiento, evaluación y exportación en el formato nativo `.keras`.

La arquitectura es una `Sequential` compuesta por una capa `Normalization` seguida de una capa `Dense(1)`, lo que equivale a una regresión lineal con tres pesos y un sesgo. Se entrenó durante 200 épocas con SGD (tasa de aprendizaje 0,1) y pérdida MSE sobre un dataset sintético de 200 registros generados en `train.py` con semilla fija, de los cuales 160 se destinaron a entrenamiento y 40 a evaluación.

Su relevancia es limitada fuera del ámbito docente: no compite con modelos fundacionales ni resuelve tareas generales. Resulta útil como referencia reproducible para comparar el mismo problema resuelto en Keras, scikit-learn y PyTorch, y para mostrar cómo la capa `Normalization` puede persistirse dentro del propio artefacto `.keras`, evitando la normalización manual en inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red `Sequential` de Keras: `Normalization` + `Dense(1)` (regresión lineal) |
| Parámetros totales | 4 (3 pesos + 1 sesgo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | no disponible (no se documentan; el artefacto es `model.keras` en float32) |
| Idiomas soportados | español (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3; requiere Keras 3, no compatible con Keras 2) |

## Arquitectura y entrenamiento

El modelo es una regresión lineal parametrizada como red neuronal. La primera capa, `Normalization`, aprende la media y la desviación típica de cada una de las tres variables de entrada mediante `adapt()` sobre el conjunto de entrenamiento; sus parámetros quedan almacenados dentro del propio archivo `model.keras`. La segunda capa, `Dense(1)`, aplica una combinación lineal de las entradas normalizadas, lo que da lugar a tres pesos y un sesgo. No hay funciones de activación no lineales, capas ocultas ni mecanismos de atención.

El entrenamiento es supervisado y de regresión pura: pérdida de error cuadrático medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 épocas. El dataset es sintético, generado en `train.py` con la misma semilla que el ejemplo de la Clase 10, con 200 registros (160 de entrenamiento y 40 de evaluación). Las entradas son `m2` (rango 35–120), `balcon` (0 o 1) y `ascensor` (0 o 1); la salida es `precio` en miles de dólares. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable dado el tipo de modelo.

## Capacidades

- Regresión tabular sobre tres variables numéricas/binarias en un orden fijo: `m2`, `balcon`, `ascensor`.
- Predicción de una variable continua (`precio` en miles de US$) con normalización integrada en el artefacto.
- Exportación y carga autocontenida en formato `.keras` (arquitectura, pesos, estadísticos de normalización y configuración de entrenamiento en un único archivo).
- Compatibilidad con backend PyTorch y TensorFlow a través de Keras 3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas simbólicas, visión ni audio.
- Capacidad multilingüe: no aplica (no procesa lenguaje natural).

## Casos de uso

- Docencia de introducción al deep learning: sirve como primer ejemplo reproducible de regresión con Keras 3, mostrando el flujo `adapt()` → `fit()` → `evaluate()` → `save()` en un único script.
- Comparación de frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch del seminario, permite contrastar API, gestión de la normalización y formato de serialización entre las tres herramientas.
- Demostración de portabilidad de artefactos: ilustra cómo empaquetar transformaciones de preprocesado (la capa `Normalization`) dentro del modelo para evitar pipelines externos en inferencia.
- Prueba de integración de Keras 3 con backend PyTorch: útil para verificar que un entorno con `KERAS_BACKEND=torch` carga y ejecuta correctamente un `model.keras` guardado.
- Ejercicio de evaluación de modelos: el par MAE/R² sobre un split fijo (160/40) permite practicar la interpretación de métricas de regresión con valores de referencia conocidos.
- Material de base para experimentos controlados: al ser un modelo lineal con semilla fija, sirve como línea base contra la que comparar modelos más complejos sobre el mismo dataset sintético.
- Validación de pipelines de CI en entornos docentes: el reducido tamaño del artefacto y sus dependencias mínimas permiten incluirlo en pruebas automáticas de carga y predicción sin coste de infraestructura.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de evaluación de 40 viviendas no vistas durante el entrenamiento:

| Métrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tendrían sentido para un modelo de regresión tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo ocupa unos pocos kilobytes en disco y cabe holgadamente en cualquier GPU, CPU o incluso en entornos sin acelerador.
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalización perceptible. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobredimensionada para esta carga.
- Cabe en cualquier GPU consumer y en entornos integrados; también en contenedores sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; no aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (4 parámetros, una sola capa densa) la inferencia es del orden de microsegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Lukit4as/lucas-keras-regresion` | Regresión lineal en Keras 3 | 4 | no aplica | MAE 3,10; R² 0,989 (split propio) | MIT | HuggingFace |
| Ejemplo de regresión de scikit-learn (mismo problema, Clase 10) | Regresión lineal | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Referenciado en el material del seminario |
| Ejemplo de regresión de PyTorch (mismo problema, Clase 10) | Regresión lineal | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Referenciado en el material del seminario |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada; la comparación se limita al enfoque pedagógico y al formato de serialización (normalización integrada en Keras frente a normalización externa en el caso de PyTorch).

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sintéticos y no representan precios reales de vivienda; no debe emplearse para decisiones inmobiliarias.
- Dominio restringido: solo se ha entrenado con superficies entre 35 y 120 m²; fuera de ese rango la predicción no es fiable.
- Entrada posicional obligatoria: el modelo recibe un array con el orden `m2`, `balcon`, `ascensor`; no acepta tablas con nombres de columna y no valida el esquema.
- Dependencia de versión: requiere Keras 3; el formato `.keras` no se abre con TensorFlow/Keras 2.
- Sin validación externa: no se han publicado evaluaciones sobre datos reales ni comparaciones independientes; el R² de 0,989 procede de un split sintético con semilla fija y no es extrapolable.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí puede producir predicciones sin sentido fuera del dominio de entrenamiento.
- Sesgos: no documentados por el autor; al ser datos sintéticos, cualquier sesgo presente en el generador se traslada al modelo.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el propio autor desaconseja su uso fuera del ámbito docente por la naturaleza de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lukit4as/lucas-keras-regresion
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
