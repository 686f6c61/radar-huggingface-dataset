# IgnacioToto27/02-pytorch-regresion

## Resumen

Este "modelo" es en realidad un ejemplo pedagógico de regresión lineal implementado con PyTorch, publicado por el usuario IgnacioToto27 en el contexto del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una única capa `torch.nn.Linear(3, 1)` con tres pesos y un sesgo, entrenada para predecir el precio de una vivienda (en miles de dólares estadounidenses) a partir de su superficie en metros cuadrados y de dos variables binarias (balcón y ascensor).

El interés del artefacto es didáctico: ilustra el ciclo de entrenamiento explícito de PyTorch (forward, pérdida MSE, retropropagación con SGD), la normalización de entradas y la publicación de pesos en formato `safetensors` en lugar de pickle o joblib. Sirve como material de referencia para quienes se inician en el despliegue de modelos tabulares y en el formato de pesos seguro.

Por su naturaleza (4 parámetros en total, datos sintéticos de 200 registros, salida escalar), no compite con ningún modelo de lenguaje ni con soluciones de regresión de producción. Su relevancia es exclusivamente formativa y su uso previsto es la reproducción del ejemplo en un aula o en un tutorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (una capa `torch.nn.Linear(3, 1)`) |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 3 variables) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan cuantizaciones) |
| Idiomas soportados | español (documentación y model card; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` con normalización |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal canónica: tres entradas (`m2`, `balcon`, `ascensor`) ponderadas por tres pesos más un sesgo, sin funciones de activación ni capas ocultas. Las entradas se normalizan restando la media y dividiendo por el desvío estándar, ambos calculados sobre el conjunto de entrenamiento y almacenados en `config.json` (media y desvío por variable). Los pesos publicados están, por tanto, en la escala normalizada: `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`. El autor documenta que, al desnormalizar (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`), se recuperan coeficientes equivalentes a los de una regresión con scikit-learn sobre los mismos datos.

El entrenamiento se realizó con descenso por gradiente estocástico (SGD) con tasa de aprendizaje 0,1, función de pérdida de error cuadrático medio (`MSELoss`) y 500 épocas; la pérdida se estabiliza antes de la época 100. El dataset es sintético, generado en `train.py` con semilla fija, y consta de 200 registros (160 de entrenamiento y 40 de evaluación), con `m2` en el rango [35, 120] y las variables binarias en {0, 1}. No hay RLHF, DPO ni ningún tipo de ajuste por preferencias: es un problema de optimización convexa resuelto por gradiente.

## Capacidades

- Predicción de una variable numérica continua (precio en miles de USD) a partir de tres features tabulares.
- Normalización de entradas integrada mediante los parámetros de `config.json`.
- Carga de pesos en formato `safetensors`, que no ejecuta código al deserializar.
- Reproducibilidad del pipeline completo (entrenamiento, guardado y carga) con los scripts `train.py` y `predict.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No procesa secuencias: la entrada es un vector fijo de tres dimensiones.

## Casos de uso

- Docencia de PyTorch: reproducción del ciclo de entrenamiento explícito (forward, `MSELoss`, `backward`, `step`) en un curso introductorio, con un ejemplo de regresión supervisada de complejidad mínima.
- Enseñanza del formato `safetensors`: comparación práctica frente a pickle/joblib, mostrando que el archivo solo contiene tensores y no código ejecutable, lo que reduce la superficie de ataque al cargar pesos de terceros.
- Demostración de normalización de features: el par `config.json` + pesos normalizados permite explicar por qué los coeficientes no coinciden con los de scikit-learn y cómo desnormalizarlos para recuperar la escala original.
- Tutorial de publicación en Hugging Face: el repositorio sirve como plantilla mínima (model card, `config.json`, `modelo.py`, `train.py`, `predict.py`, `requirements.txt`) para que un estudiante publique su primer artefacto.
- Validación de pipelines de inferencia tabular: con 4 parámetros y 40 muestras de test (MAE 3,08 miles de USD, R² 0,989), es útil como caso de prueba trivial de un servicio de serving antes de pasar a modelos reales.
- Ejemplo de evaluación de regresión: cálculo de MAE y R² sobre un hold-out de 40 registros para ilustrar la diferencia entre métricas absolutas y relativas en problemas de regresión.

## Benchmarks y rendimiento

El autor publica una única evaluación sobre el conjunto de test (40 viviendas no vistas durante el entrenamiento):

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tendrían sentido para un modelo de regresión tabular de 4 parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (4 parámetros en float32, menos de 1 KB de pesos); cabe en cualquier GPU, CPU o incluso en un microcontrolador con PyTorch Lite.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sin penalización perceptible. Cualquier GPU (RTX 4090, A100, H100) funciona, pero es sobredimensionada.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; también es trivial exportarlo a ONNX o TorchScript. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no documentados; con una sola capa lineal de 3 entradas, la latencia es del orden de microsegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IgnacioToto27/02-pytorch-regresion | 4 | no aplica | MAE 3,08; R² 0,989 (test sintético) | MIT | Hugging Face |
| Regresión lineal de scikit-learn (referencia del autor) | 4 | no aplica | Coeficientes equivalentes tras desnormalizar | BSD-3-Clause | scikit-learn |
| Ejemplo de regresión con PyTorch (otros repos docentes) | variable | no aplica | no disponible | variable | Hugging Face / GitHub |

No se dispone de comparaciones con modelos de lenguaje ni con modelos tabulares de producción en la información proporcionada; la comparación relevante es exclusivamente con la implementación de scikit-learn citada por el propio autor.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo se ha validado para superficies entre 35 y 120 m²; fuera de ese rango la extrapolación lineal no está garantizada.
- Dependencia crítica de la normalización: si se omiten la media y el desvío de `config.json`, las predicciones son incorrectas. Los pesos por sí solos no bastan.
- Dependencia de la arquitectura: para cargar los pesos es necesario el mismo `modelo.py`; si cambia la clase, `load_state_dict` falla.
- Sin sesgos medidos ni auditoría: no se documentan análisis de equidad, aunque el dataset sintético evita sesgos demográficos reales por construcción.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero el modelo puede producir predicciones sin sentido si recibe entradas fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no es apto para producción por su naturaleza didáctica y su validación limitada.
- Sin soporte de texto, visión ni audio: no es un modelo multimodal ni un LLM.

## Enlaces

- Hugging Face: https://huggingface.co/IgnacioToto27/02-pytorch-regresion
- Repositorio de referencia de scikit-learn (citado por el autor): no disponible como enlace específico en la información proporcionada
- Documentación de safetensors: no disponible en la información proporcionada
- Documentación de PyTorch: no disponible en la información proporcionada
