# lagabyok/02-pytorch-regresion

## Resumen

`lagabyok/02-pytorch-regresion` es un modelo de regresión lineal implementado en PyTorch y publicado con fines exclusivamente pedagógicos por el autor `lagabyok` para el Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una única capa `torch.nn.Linear(3, 1)` con 4 parámetros entrenables (tres pesos y un sesgo) que predice el precio de una vivienda, en miles de dólares estadounidenses, a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor.

El modelo se enmarca en la tarea `tabular-regression` y su interés no reside en su capacidad predictiva, sino en su valor didáctico: muestra el ciclo de entrenamiento explícito de PyTorch (definición de la capa, función de pérdida `MSELoss`, optimizador `SGD` y bucle de épocas) y, sobre todo, la publicación de pesos en formato `safetensors`, un contenedor binario que no ejecuta código al cargarse, a diferencia de `pickle` o `joblib`.

Es relevante ahora como ejemplo mínimo reproducible de buenas prácticas de empaquetado de modelos: separa pesos (`model.safetensors`), metadatos de preprocesamiento (`config.json`) y definición de arquitectura (`modelo.py`), y documenta explícitamente por qué los pesos solos no bastan para inferir. Su dataset es sintético (200 registros generados en `train.py` con semilla fija) y no representa precios inmobiliarios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal, una capa `torch.nn.Linear(3, 1)` |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos en float32 según el ejemplo de carga) |
| Idiomas soportados | Español (`es`); el modelo no procesa texto, la etiqueta refleja el idioma de la documentación |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`model.safetensors`, `state_dict`) |
| Entradas | `m2` (35 a 120), `balcon` (0 o 1), `ascensor` (0 o 1) |
| Salida | `precio` en miles de US$ (variable continua) |
| Normalización | Media y desvío por variable, almacenados en `config.json` |
| Librería | PyTorch |
| Tamaño del repositorio | 0,0 GB (inferior a 1 MB) |
| Pipeline | `tabular-regression` |

## Arquitectura y entrenamiento

La arquitectura es la mínima expresión de un modelo supervisado en PyTorch: una capa lineal con tres entradas y una salida, definida en `modelo.py` como `RegresionLineal(n_entradas=3)`. El entrenamiento sigue el ciclo explícito de PyTorch: se calcula la predicción, se computa la pérdida con `MSELoss`, se aplica retropropagación y se actualizan los parámetros con descenso por gradiente estocástico (`SGD`) a una tasa de aprendizaje de 0,1 durante 500 épocas. Según la model card, la pérdida se estabiliza antes de la época 100.

Los datos de entrenamiento son sintéticos: 200 registros generados en `train.py` con una semilla fija (la misma de la Clase 10 del seminario), de los cuales 160 se destinan a entrenamiento y 40 a evaluación. Las entradas se normalizan restando la media y dividiendo por el desvío calculados sobre el conjunto de entrenamiento; esos valores se persisten en `config.json`, lo que constituye una decisión de diseño relevante porque desacopla el preprocesamiento de los pesos. Los parámetros aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas. La model card documenta la conversión a escala original (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`), que coincide con el peso obtenido por scikit-learn en el ejemplo equivalente.

No hay innovaciones técnicas destacables: no se emplean mecanismos de atención, decodificación especulativa ni técnicas de alineación como RLHF o DPO. La aportación metodológica es el empaquetado con `safetensors` y la separación limpia entre pesos, configuración y código.

## Capacidades

- Predicción de una variable numérica continua (regresión) a partir de tres variables tabulares.
- Inferencia determinista con `modelo.eval()` y `torch.no_grad()`, reproducible dado el mismo `config.json`.
- Carga segura de pesos mediante `safetensors.torch.load_file`, sin ejecución de código arbitrario.
- Reutilización del `state_dict` en cualquier instancia de la clase `RegresionLineal` con la misma arquitectura.
- Documentación del proceso de normalización para revertir los pesos a la escala original de las variables.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como ejemplo completo y ejecutable del ciclo de entrenamiento (forward, pérdida, backward, paso del optimizador) en una sesión introductoria, sin necesidad de GPU ni de datasets externos.
- Enseñanza del formato `safetensors`: permite comparar en clase la carga segura de `model.safetensors` frente a `pickle` o `joblib`, ilustrando el riesgo de ejecución de código en la deserialización.
- Demostración de la importancia del preprocesamiento: al requerir `config.json` para la normalización, el modelo ejemplifica por qué los pesos por sí solos no bastan y cómo se documenta la media y el desvío del conjunto de entrenamiento.
- Prueba de integración de pipelines de publicación: un equipo puede usar este repositorio como plantilla mínima para verificar su flujo de subida a Hugging Face (estructura de archivos, `config.json`, `requirements.txt`, model card).
- Validación de reproducibilidad: al fijar la semilla y documentar hiperparámetros (lr = 0,1, 500 épocas, 160/40 de split), permite comprobar que un entorno reproduce los mismos pesos y métricas.
- Ejemplo de comparación entre frameworks: la model card detalla la equivalencia numérica con scikit-learn tras desnormalizar, lo que lo hace útil para ilustrar diferencias de escala y convenciones entre librerías.
- Referencia para tests de regresión en CI: un pipeline puede cargar el modelo, predecir una casa de ejemplo (80 m², balcón, sin ascensor → ≈148,5) y verificar que la salida no se desvía, detectando roturas en la clase o en la configuración.

## Benchmarks y rendimiento

Evaluación sobre 40 viviendas no vistas durante el entrenamiento, según la model card:

| Métrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un modelo tabular de regresión.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo cabe en CPU sin problema.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en A100, H100, RTX 4090 o en un portátil sin acelerador.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU, dado el tamaño ínfimo de los pesos (4 parámetros en float32).
- Opciones de despliegue: script Python con PyTorch y `safetensors` (`predict.py`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo (una multiplicación matriz-vector de 3×1) la latencia es del orden de microsegundos y el throughput está limitado por el intérprete de Python, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lagabyok/02-pytorch-regresion` | 4 | No aplica | Regresión tabular (precio de vivienda) | MIT | Hugging Face |
| Regresión lineal de scikit-learn (ejemplo de la Clase 10) | 4 | No aplica | Regresión tabular (mismo problema) | BSD-3-Clause (scikit-learn) | Librería local, no publicada como modelo |
| Ejemplos de regresión de Machine Learning Mastery | No disponible | No aplica | Regresión con redes neuronales en PyTorch | No disponible | Tutoriales web, no repositorios de modelos |

La comparación más directa es con el modelo de scikit-learn del mismo seminario: ambos llegan a pesos equivalentes tras desnormalizar, pero el de PyTorch se publica como artefacto reproducible en Hugging Face con pesos en `safetensors` y configuración explícita. No se conocen otros modelos publicados con este propósito didáctico concreto.

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sintéticos y no representan precios inmobiliarios reales; no debe usarse para tasaciones.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la extrapolación lineal no es fiable.
- Dependencia crítica de la normalización: si se omiten la media y el desvío de `config.json`, las predicciones son arbitrarias.
- Dependencia de la arquitectura: `load_state_dict` falla si la clase `RegresionLineal` cambia; los pesos no son autocontenidos.
- Sin datos de sesgo publicados: al ser datos sintéticos, no se han analizado sesgos demográficos ni de otro tipo, aunque el modelo no procesa atributos personales.
- Riesgo de alucinación no aplicable: el modelo no genera texto; el riesgo es de extrapolación incorrecta fuera del rango de entrenamiento.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no obstante, la naturaleza sintética de los datos desaconseja cualquier uso productivo real.
- Ausencia de métricas de robustez: no se documentan pruebas con valores atípicos, entradas faltantes ni distribuciones distintas a la de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lagabyok/02-pytorch-regresion
- Documentación de `safetensors`: https://github.com/huggingface/safetensors
- Tutorial de regresión en PyTorch (Machine Learning Mastery): https://machinelearningmastery.com/building-a-regression-model-in-pytorch/
- Tutorial general de PyTorch (Machine Learning Mastery): https://machinelearningmastery.com/pytorch-tutorial-develop-deep-learning-models/
- Documentación oficial de PyTorch: https://pytorch.org/docs/stable/index.html
