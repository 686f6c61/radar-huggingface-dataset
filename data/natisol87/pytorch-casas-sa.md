# natisol87/PyTorch-casas-SA

## Resumen

PyTorch-casas-SA es un modelo de regresión lineal tabular publicado en Hugging Face por el usuario natisol87. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una única capa `torch.nn.Linear(3, 1)` entrenada con el ciclo explícito de PyTorch para predecir el precio de una vivienda (en miles de dólares estadounidenses) a partir de tres variables de entrada: superficie en metros cuadrados, presencia de balcón y presencia de ascensor. El modelo tiene exactamente cuatro parámetros entrenables (tres pesos y un sesgo) y se distribuye en formato safetensors junto con un `config.json` que contiene los parámetros de normalización.

El modelo nace como ejemplo pedagógico del Seminario de Actualización del IFTS N.º 18, con la docente Cynthia M. Villagra como responsable. Su propósito es didáctico: mostrar cómo se entrena una regresión lineal con PyTorch y cómo se publican los pesos de forma segura en safetensors, replicando el mismo problema que el ejemplo clásico de scikit-learn. La relevancia es, por tanto, formativa y no de producción: sirve como plantilla mínima para entender el flujo completo de entrenamiento, serialización y carga de pesos en PyTorch.

El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y se publicó el 6 de noviembre de 2026. La licencia es MIT y el idioma declarado es español. No debe confundirse con un modelo generativo: su pipeline es `tabular-regression` y su única tarea es predecir un valor numérico continuo dentro del dominio sintético con el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión lineal (una capa `torch.nn.Linear(3, 1)`) |
| Parámetros totales | 4 (3 pesos + 1 sesgo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin contexto textual) |
| Tipos de cuantización | No aplica (pesos float32 en safetensors) |
| Idiomas soportados | Español (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `modelo.py` |

## Arquitectura y entrenamiento

La arquitectura es la más simple posible dentro de PyTorch: una capa lineal con tres entradas y una salida, definida en `modelo.py` como `RegresionLineal`. Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas. Al dividir cada peso por el desvío de su variable correspondiente se recupera la escala original (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`), lo que coincide con el resultado del ejemplo equivalente en scikit-learn.

El entrenamiento es supervisado y de tipo regresión. Se usó un dataset sintético de 200 registros generados en `train.py` con semilla fija (160 para entrenamiento y 40 para evaluación), con entradas `m2` en el rango de 35 a 120, `balcon` binario y `ascensor` binario, y como objetivo `precio` en miles de dólares. Las entradas se normalizaron restando la media y dividiendo por el desvío calculados sobre el conjunto de entrenamiento, valores que se almacenan en `config.json`. La función de pérdida fue `MSELoss`, el optimizador SGD con tasa de aprendizaje 0,1, y se ejecutaron 500 épocas, con la pérdida estabilizándose antes de la época 100. No hay innovaciones técnicas destacables: el interés del modelo es exclusivamente didáctico y de formato de publicación.

## Capacidades

- Predicción de una variable numérica continua (precio de vivienda en miles de dólares) a partir de tres características tabulares.
- Regresión lineal interpretable: los coeficientes permiten leer directamente la contribución de cada variable en la escala normalizada.
- Carga segura de pesos mediante safetensors, sin ejecución de código arbitrario al deserializar.
- Reproducibilidad completa: semilla fija, código de entrenamiento (`train.py`) y de inferencia (`predict.py`) incluidos en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje: el español aparece solo en la documentación.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como ejemplo mínimo y completo del ciclo de entrenamiento (forward, pérdida, backward, paso del optimizador) y de la publicación de pesos en safetensors, adecuado para clases introductorias de machine learning.
- Comparación con scikit-learn: permite contrastar paso a paso cómo un mismo problema de regresión se resuelve con PyTorch y con scikit-learn, incluyendo la equivalencia de pesos tras desnormalizar.
- Plantilla de publicación de modelos: el repositorio muestra la estructura recomendada (`model.safetensors`, `config.json`, `modelo.py`, `train.py`, `predict.py`, `requirements.txt`) para publicar cualquier modelo pequeño en Hugging Face.
- Demostración de normalización de entradas: ilustra por qué los pesos de un modelo entrenado con datos normalizados no son directamente comparables con los de un modelo entrenado sin normalizar, y cómo revertir la transformación.
- Prueba de integración de safetensors: útil para validar pipelines de carga segura de pesos en entornos donde no se quiere depender de pickle o joblib.
- Ejercicio de evaluación de modelos: con MAE de 3,08 miles de dólares y R² de 0,989 sobre 40 muestras, sirve para practicar la interpretación de métricas de regresión en un contexto controlado.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 casas de evaluación (no vistas) |
| R² | 0,989 | 40 casas de evaluación (no vistas) |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable (4 parámetros en float32, menos de 1 KB de pesos); cabe en cualquier GPU, CPU o incluso en un microcontrolador.
- GPU recomendadas: no requiere GPU; una CPU es suficiente y probablemente más rápida por el coste de transferencia.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en cualquier CPU.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`, o exportación a ONNX si se necesita integración en otros runtimes. No aplican vLLM, llama.cpp, Ollama ni TGI, que están pensados para modelos generativos.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (una multiplicación matricial de 3x1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PyTorch-casas-SA | 4 | No aplica | Regresión tabular (precio de casa) | MIT | Hugging Face |
| Ejemplo de regresión lineal de scikit-learn | 4 (coeficientes + intercepto) | No aplica | Regresión tabular (precio de casa) | BSD-3-Clause (scikit-learn) | Documentación de scikit-learn |
| Regresión logística/lineal genérica en PyTorch | Variable | No aplica | Regresión tabular | Depende del autor | Repositorios varios |

La comparación más directa es con el ejemplo de scikit-learn que el propio autor cita: mismo problema, mismos datos sintéticos y pesos equivalentes tras desnormalizar. La diferencia principal es el formato de publicación (safetensors frente a pickle/joblib) y el propósito didáctico de mostrar el ciclo explícito de PyTorch. No se conocen otros modelos publicados con esta misma configuración exacta en la información disponible.

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce casas de 35 a 120 m²; fuera de ese rango las predicciones no son fiables.
- Dependencia crítica de la normalización: si se omiten la media y el desvío de `config.json`, las predicciones son arbitrarias. Los pesos por sí solos no bastan.
- Dependencia de la arquitectura: para cargar los pesos hace falta la misma clase `RegresionLineal` de `modelo.py`; si cambia la definición, `load_state_dict` falla.
- Sin capacidades generativas ni de lenguaje: no debe evaluarse como modelo de IA general.
- Sin sesgos documentados más allá de los derivados del dataset sintético; no se han realizado análisis de equidad ni de robustez.
- Licencia MIT: permite uso comercial y modificación, pero al ser un ejemplo pedagógico no aporta valor productivo real.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/natisol87/PyTorch-casas-SA
