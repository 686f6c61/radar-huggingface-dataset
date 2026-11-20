# ericc12/03-keras-regresion

## Resumen

El modelo `ericc12/03-keras-regresion` es un ejemplo pedagógico de regresión lineal implementado con Keras 3, publicado por el usuario ericc12 en el marco del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es un regresor tabular mínimo que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables de entrada (superficie en metros cuadrados, presencia de balcón y presencia de ascensor).

Su relevancia no reside en capacidades de inferencia general, sino en su valor didáctico: ilustra el ciclo completo de entrenamiento, evaluación y exportación en el formato nativo `.keras`, e incorpora una capa `Normalization` que aprende la media y la desviación típica con `adapt()` y se serializa dentro del propio archivo del modelo. Esto contrasta con ejemplos equivalentes en PyTorch, donde la normalización suele guardarse por separado.

El modelo se entrenó sobre un dataset sintético de 200 registros generados en `train.py` con semilla fija, del cual 160 se destinaron a entrenamiento y 40 a evaluación. Arquitectura `Sequential` con `Normalization` + `Dense(1)`, tres pesos más un sesgo, licencia MIT y pipeline `tabular-regression`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Sequential` de Keras: capa `Normalization` + capa `Dense(1)` (regresión lineal) |
| Parametros totales | 4 (tres pesos y un sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | es (documentación y model card en español) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3; incluye arquitectura, pesos, normalización y configuración de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una red `Sequential` de dos capas: una capa `Normalization` que estandariza las entradas a partir de la media y la desviación típica aprendidas con `adapt()` sobre los datos de entrenamiento, seguida de una capa `Dense(1)` sin función de activación, lo que equivale a una regresión lineal múltiple. El modelo tiene tres pesos (uno por cada variable de entrada: `m2`, `balcon`, `ascensor`) y un término de sesgo.

El entrenamiento es supervisado, con pérdida de error cuadrático medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 épocas. Se usó Keras 3 con backend PyTorch, aunque el autor indica compatibilidad con TensorFlow. El dataset es sintético (200 registros, 160/40 split), generado con semilla fija en `train.py`, con `m2` en el rango 35–120 y las variables binarias `balcon` y `ascensor`. No se documenta uso de RLHF, DPO ni técnicas de regularización adicionales. La innovación técnica destacable, en clave didáctica, es la serialización conjunta de la normalización dentro del archivo `.keras`, lo que elimina la necesidad de normalizar manualmente en inferencia.

## Capacidades

- Regresión tabular: predice una variable objetivo continua (precio en miles de US$) a partir de tres features numéricas/binarias.
- Normalización integrada: la capa `Normalization` se guarda dentro del modelo, por lo que la inferencia acepta valores en escala original.
- Exportación autocontenida: un único archivo `model.keras` agrupa arquitectura, pesos, normalización y configuración de entrenamiento.
- Compatibilidad multiplataforma: funciona con backend PyTorch y con backend TensorFlow en Keras 3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Docencia de regresión lineal con Keras: sirve como ejemplo mínimo y reproducible para introducir el flujo `fit`/`evaluate`/`save` en cursos de machine learning, con un modelo de cuatro parámetros que se puede inspeccionar y explicar en una sola sesión.
- Comparación de frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch, permite contrastar cómo cada librería gestiona la normalización (integrada en Keras frente a externa en PyTorch) y la serialización.
- Prueba de pipelines de despliegue: por su tamaño ínfimo y su formato autocontenido, es útil para validar cadenas de carga de modelos en entornos con Keras 3 antes de migrar a modelos mayores.
- Validación de entornos y dependencias: permite verificar que un entorno con Keras 3 y backend PyTorch o TensorFlow carga correctamente un `.keras` y ejecuta `predict` con el formato de entrada esperado.
- Ejemplo de buenas prácticas de model card: la documentación del modelo (datos, métricas, limitaciones, formato de entrada) puede usarse como plantilla para fichas de modelos más complejos.
- Demostración de reproducibilidad: al generar los datos con semilla fija en `train.py`, permite reproducir el entrenamiento y las métricas reportadas (MAE 3,10; R² 0,989) en un entorno controlado.

## Benchmarks y rendimiento

El autor reporta métricas de evaluación sobre las 40 muestras de test no vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 4 parámetros y un archivo `.keras` de tamaño despreciable.
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) y también en entornos sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se documentan cifras; para un modelo de esta magnitud la latencia es del orden de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericc12/03-keras-regresion | 4 | no aplica | Regresión tabular (precio de vivienda) | MIT | Hugging Face |
| Ejemplo de regresión de scikit-learn | no disponible | no aplica | Regresión tabular | no disponible | Documentación de scikit-learn |
| Ejemplo de regresión de PyTorch (Clase 10) | no disponible | no aplica | Regresión tabular | no disponible | Material del curso |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación relevante es metodológica: Keras integra la normalización en el modelo y en el archivo serializado, mientras que el ejemplo de PyTorch la guarda por separado.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la predicción no es fiable.
- Orden de columnas obligatorio: la entrada debe ser un array con el orden `m2`, `balcon`, `ascensor`; no acepta tablas con nombres de columnas.
- Dependencia de versión: requiere Keras 3; el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes, por lo que no debe evaluarse con benchmarks de LLM.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo es de extrapolación fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados; al ser datos sintéticos, no reflejan sesgos del mercado inmobiliario real.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericc12/03-keras-regresion
- Repositorio de Keras: https://github.com/keras-team/keras
- Documentación de Keras 3 sobre guardado de modelos: https://keras.io/guides/serialization_and_saving/
- Documentación de scikit-learn sobre regresión lineal: https://scikit-learn.org/stable/modules/linear_model.html
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
