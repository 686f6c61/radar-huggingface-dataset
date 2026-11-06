# IgnacioToto27/03-keras-regresion

## Resumen

Este "modelo" es en realidad un ejemplo pedagógico de regresión lineal implementado con Keras 3, publicado en HuggingFace por el usuario IgnacioToto27 en el marco del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una regresión lineal clásica (una capa `Normalization` seguida de una capa `Dense(1)`, es decir, tres pesos y un bias) que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor.

El interés del artefacto es exclusivamente didáctico: muestra el flujo completo de entrenamiento, evaluación y exportación en el formato nativo `.keras`, que empaqueta arquitectura, pesos, capa de normalización y configuración de entrenamiento en un único archivo. Sirve como material de comparación con implementaciones equivalentes en scikit-learn y PyTorch, y como demostración de que la capa `Normalization` puede aprenderse con `adapt()` y persistirse dentro del propio modelo, evitando normalizar manualmente en inferencia.

No debe evaluarse como un modelo de IA generativa: no procesa texto, no tiene ventana de contexto, no soporta tool calling ni razonamiento multi-paso. Su relevancia actual es la de un recurso educativo reproducible y versionado, no la de una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal: `Sequential` con capa `Normalization` + capa `Dense(1)` |
| Parametros totales | 3 pesos + 1 bias (más los parámetros internos de la capa `Normalization`: media y desviación por feature) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el modelo es de precisión completa en float32) |
| Idiomas soportados | es (la documentación está en español; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3; no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un `Sequential` de Keras 3 compuesto por una capa `Normalization`, que aprende la media y la desviación típica de cada una de las tres features de entrada mediante `adapt()` sobre el conjunto de entrenamiento, seguida de una capa `Dense(1)` con activación lineal. En total, el modelo tiene tres pesos y un bias, además de los parámetros estadísticos almacenados por la capa de normalización. El backend utilizado es PyTorch, aunque el modelo también funciona con TensorFlow.

El entrenamiento es supervisado y de regresión, con función de pérdida de error cuadrático medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 épocas. El dataset es sintético, generado en `train.py` con semilla fija, y consta de 200 registros (160 para entrenamiento y 40 para evaluación). Las variables de entrada son `m2` (rango de 35 a 120), `balcon` (0 o 1) y `ascensor` (0 o 1); la variable objetivo es `precio` en miles de dólares. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de esta naturaleza.

## Capacidades

- Predicción de una variable numérica continua (precio de vivienda en miles de USD) a partir de tres features tabulares.
- Normalización integrada en el propio modelo: la capa `Normalization` se guarda dentro de `model.keras`, por lo que no es necesario normalizar manualmente las entradas en inferencia.
- Exportación en formato nativo `.keras`, que empaqueta arquitectura, pesos, normalización y configuración de entrenamiento en un solo archivo.
- Compatibilidad con backend PyTorch y TensorFlow en Keras 3.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Docencia de regresión lineal con Keras: el modelo sirve como ejemplo mínimo y reproducible para explicar el ciclo completo de entrenamiento, evaluación y exportación en el aula, con un dataset sintético de 200 registros que se genera con semilla fija.
- Comparación de frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch, permite contrastar cómo se gestiona la normalización (dentro del modelo en Keras frente a un objeto separado en PyTorch) y cómo se serializan los artefactos.
- Demostración de serialización `.keras`: útil para mostrar cómo un único archivo puede contener arquitectura, pesos, estadísticas de normalización y configuración de entrenamiento, simplificando el despliegue de modelos pequeños.
- Prototipado de pipelines tabulares: como plantilla base para experimentar con features numéricas y binarias en problemas de regresión sencillos antes de escalar a modelos más complejos.
- Pruebas de integración de Keras 3 con backend PyTorch: permite verificar que el flujo de `adapt()`, `fit()` y `keras.saving.load_model()` funciona correctamente en entornos con backend PyTorch.
- Ejemplo de referencia para validar entornos de CI: por su tamaño mínimo y su reproducibilidad (semilla fija, 200 épocas, SGD), puede usarse como test de humo en pipelines que verifiquen que Keras 3 está correctamente instalado.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas sobre el conjunto de evaluación de 40 viviendas no vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, algo esperable dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo es un regresor lineal con tres pesos y un bias, más las estadísticas de normalización.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (CPU, Raspberry Pi, etc.).
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no documentados; por la naturaleza del modelo, la inferencia es prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IgnacioToto27/03-keras-regresion | 3 pesos + 1 bias | no aplica | MAE 3,10; R² 0,989 (test sintético) | MIT | HuggingFace |
| Ejemplo equivalente en scikit-learn | no disponible | no aplica | no disponible | no disponible | no disponible |
| Ejemplo equivalente en PyTorch | no disponible | no aplica | no disponible | no disponible | no disponible |

Los ejemplos de scikit-learn y PyTorch se mencionan en la model card como implementaciones del mismo problema, pero no se proporcionan sus métricas ni detalles de disponibilidad en la información consultada.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; extrapolar fuera de ese rango no está validado.
- Orden de columnas obligatorio: las entradas deben ir en el orden `m2`, `balcon`, `ascensor`; el modelo recibe un array, no una tabla con nombres de columnas.
- Dependencia de versión: requiere Keras 3; el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- No apto para producción: no hay validación con datos reales, ni análisis de sesgos, ni estudio de robustez.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y el modelo carece de valor predictivo fuera del contexto didáctico.

## Enlaces

- HuggingFace: https://huggingface.co/IgnacioToto27/03-keras-regresion
