# amandaodoo/regresion-casas-keras

## Resumen

`amandaodoo/regresion-casas-keras` es un modelo de regresión tabular publicado en HuggingFace por la usuaria `amandaodoo` como material pedagógico del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una regresión lineal implementada con Keras 3 que predice el precio de una vivienda, en miles de dólares estadounidenses, a partir de tres variables de entrada (`m2`, `balcon`, `ascensor`). Su interés no reside en el rendimiento predictivo, sino en ilustrar el flujo completo de entrenamiento y exportación en el formato nativo `.keras`, comparándolo con implementaciones equivalentes en scikit-learn y PyTorch.

La arquitectura es una `Sequential` con una capa `Normalization` seguida de una capa `Dense(1)`, lo que se traduce en tres pesos y un término de sesgo. El modelo se entrena sobre un dataset sintético de 200 registros (160 de entrenamiento y 40 de evaluación) generado con semilla fija en `train.py`, por lo que los datos no representan viviendas reales. La capa de normalización se aprende con `adapt()` y queda embebida dentro del archivo `model.keras`, de modo que el usuario no necesita normalizar manualmente las entradas en inferencia.

Es relevante ahora únicamente como recurso didáctico: muestra cómo Keras 3 (con backend PyTorch o TensorFlow) empaqueta arquitectura, pesos, estadísticas de normalización y configuración de entrenamiento en un único artefacto portable. Para cualquier evaluador técnico que busque un modelo de regresión con utilidad en producción, este repositorio no es la opción adecuada, dado su carácter de ejemplo educativo con datos sintéticos y un espacio de entrada muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (Keras `Sequential`: `Normalization` + `Dense(1)`) |
| Parametros totales | 4 (tres pesos y un bias, según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | es (documentación y model card en español) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |
| Entradas | `m2` (35–120), `balcon` (0/1), `ascensor` (0/1), en ese orden |
| Salida | `precio` en miles de US$ (variable continua) |
| Libreria | Keras 3 (backend PyTorch o TensorFlow) |
| Pipeline declarado | `tabular-regression` |

## Arquitectura y entrenamiento

El modelo es una regresión lineal canónica expresada como red neuronal de una sola capa. La `Sequential` contiene una capa `Normalization`, que estandariza las tres variables de entrada con la media y el desvío aprendidos durante `adapt()` sobre el conjunto de entrenamiento, y una capa `Dense(1)` sin función de activación no lineal, lo que equivale a una combinación lineal de las entradas normalizadas más un sesgo. En total, cuatro parámetros entrenables. Esta formulación reproduce exactamente el mismo problema que los ejemplos equivalentes en scikit-learn (`LinearRegression`) y PyTorch, y sirve para comparar cómo cada framework gestiona la normalización y el empaquetado del artefacto.

El entrenamiento es supervisado y se realiza sobre 200 registros sintéticos generados en `train.py` con semilla fija (160 para entrenamiento y 40 para evaluación). La función de pérdida es el error cuadrático medio (`mse`), el optimizador es SGD con tasa de aprendizaje 0,1 y se ejecutan 200 épocas. No hay fases de RLHF, DPO ni ajuste fino posterior: es un ajuste directo por descenso de gradiente estocástico sobre un problema convexo. La innovación técnica destacable, en el contexto del material didáctico, es que la capa `Normalization` forma parte del grafo del modelo y se serializa dentro de `model.keras`, a diferencia del ejemplo en PyTorch, donde la normalización se guarda como artefacto separado. Esto simplifica el despliegue: basta con cargar el archivo y pasar el array de entrada sin preprocesado manual.

## Capacidades

- Predicción de una variable continua (precio en miles de US$) a partir de tres features tabulares numéricas y binarias.
- Normalización integrada en el grafo: no requiere estandarizar las entradas en inferencia.
- Serialización completa en un único archivo `.keras` (arquitectura, pesos, estadísticas de normalización y configuración de entrenamiento).
- Compatibilidad con backend PyTorch y TensorFlow bajo Keras 3.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües en sentido estricto: la etiqueta `es` se refiere a la documentación, no a procesamiento de lenguaje.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia de regresión lineal con Keras 3: el modelo sirve como ejemplo mínimo reproducible para explicar el ciclo `adapt()` → `fit()` → `save()` → `load_model()` en un curso introductorio de machine learning.
- Comparación entre frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch, permite contrastar en clase cómo cada librería gestiona la normalización y el empaquetado del modelo.
- Demostración de portabilidad de artefactos: ilustra cómo el formato `.keras` agrupa arquitectura, pesos y preprocesado en un solo archivo, útil para enseñar buenas prácticas de serialización.
- Prueba de integración de Keras 3 con backend PyTorch: sirve para verificar que un entorno con Keras 3 y PyTorch como backend carga y ejecuta correctamente un modelo `.keras`.
- Ejemplo de referencia para pipelines de CI: un test unitario que cargue `model.keras` y compruebe la salida esperada (`[[148.6]]` para la entrada `[[80, 1, 0]]`) valida que la cadena de dependencias funciona tras actualizaciones.
- Material de partida para ejercicios de extensión: los alumnos pueden añadir features, cambiar el optimizador o sustituir la regresión lineal por una red con capas ocultas para comparar el efecto en MAE y R².

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas de evaluación sobre las 40 muestras de test sintéticas:

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, y en cualquier caso no aplicarían a un modelo tabular de regresión.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (inferior a 1 MB); el modelo tiene cuatro parámetros y opera sobre arrays de tres valores.
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluidos entornos sin aceleración.
- Opciones de despliegue: carga directa con `keras.saving.load_model("model.keras")` en Python; no aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no documentados; por la naturaleza del modelo, la latencia vendrá dominada por el coste de importar Keras y cargar el archivo, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `amandaodoo/regresion-casas-keras` | Regresión lineal en Keras 3 | 4 | no aplica | MAE 3,10; R² 0,989 (test sintético) | MIT | HuggingFace |
| Ejemplo scikit-learn del mismo seminario | Regresión lineal (`LinearRegression`) | 4 | no aplica | no disponible en la información proporcionada | no disponible | Material del curso |
| Ejemplo PyTorch del mismo seminario | Regresión lineal | 4 | no aplica | no disponible en la información proporcionada | no disponible | Material del curso |

No se dispone de información sobre otros modelos comparables publicados en HuggingFace con el mismo propósito y dataset; la comparación relevante es con las implementaciones equivalentes del propio seminario, cuyas métricas no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda; no debe usarse para tasaciones ni decisiones inmobiliarias.
- Dominio de entrada restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la predicción no es fiable.
- Orden de columnas fijo: la entrada debe ser `[m2, balcon, ascensor]`; el modelo recibe un array, no una tabla con nombres de columnas, por lo que un reordenamiento silencioso produce predicciones erróneas sin aviso.
- Dependencia estricta de Keras 3: el formato `.keras` no se abre con TensorFlow/Keras 2, lo que rompe la compatibilidad con entornos legacy.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de extrapolación incorrecta fuera del rango de entrenamiento.
- Sesgos: al provenir de una generación sintética con semilla fija, el modelo hereda cualquier supuesto del generador de datos; no se documenta análisis de sesgo.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el carácter sintético de los datos hace desaconsejable cualquier uso productivo real.
- Sin mantenimiento documentado: la model card no indica versionado, tests ni política de actualización.

## Enlaces

- HuggingFace: https://huggingface.co/amandaodoo/regresion-casas-keras
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
