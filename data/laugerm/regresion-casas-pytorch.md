# LaugerM/regresion-casas-pytorch

## Resumen

`LaugerM/regresion-casas-pytorch` es un modelo de regresión lineal implementado en PyTorch y publicado como ejemplo pedagógico del Seminario de Actualización del IFTS N.º 18 (Argentina). No es un modelo de lenguaje ni una red neuronal profunda: se trata de una única capa `torch.nn.Linear(3, 1)` con tres pesos y un sesgo (4 parámetros en total) que predice el precio de una vivienda en miles de dólares estadounidenses a partir de su superficie en metros cuadrados y de dos variables binarias (balcón y ascensor).

Su relevancia no reside en el rendimiento predictivo ni en la escala, sino en el valor didáctico del artefacto: muestra el ciclo de entrenamiento explícito de PyTorch (definición del modelo, `MSELoss`, SGD con tasa 0,1 y 500 épocas), la serialización de pesos en formato `safetensors` y la separación limpia entre pesos (`model.safetensors`), configuración de normalización (`config.json`) y definición de la arquitectura (`modelo.py`). Sirve como plantilla reproducible para quien se inicia en el despliegue de modelos tabulares.

El modelo se entrenó sobre un dataset sintético de 200 registros (160 de entrenamiento, 40 de evaluación) y reporta un MAE de 3,08 miles de USD y un R² de 0,989 sobre el conjunto de test. Está publicado bajo licencia MIT y etiquetado para el pipeline `tabular-regression` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (una capa `torch.nn.Linear(3, 1)`) |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible (pesos en float32; el autor no documenta cuantización) |
| Idiomas soportados | es (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `state_dict` de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es la más simple posible dentro de PyTorch: una capa lineal con tres entradas (`m2`, `balcon`, `ascensor`) y una salida (`precio` en miles de USD). El entrenamiento es supervisado, con `MSELoss` como función de pérdida y descenso por gradiente estocástico (SGD) con tasa de aprendizaje 0,1 durante 500 épocas; según el autor, la pérdida se estabiliza antes de la época 100. Los datos son sintéticos, generados en `train.py` con semilla fija, y las entradas se normalizan restando la media y dividiendo por la desviación estándar calculadas sobre el conjunto de entrenamiento; esos valores se guardan en `config.json`.

Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas. El autor documenta la equivalencia con scikit-learn: al desnormalizar (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`) se recupera el coeficiente que obtendría la regresión lineal clásica sobre las variables originales. No hay RLHF, DPO, decodificación especulativa ni innovaciones de atención: es un ejercicio de regresión tabular.

## Capacidades

- Predicción de una variable continua (precio de vivienda en miles de USD) a partir de tres features numéricas/binarias.
- Inferencia determinista: dado un vector `[m2, balcon, ascensor]` normalizado, devuelve un escalar.
- Serialización segura de pesos mediante `safetensors`, sin ejecución de código al cargar (a diferencia de pickle o joblib).
- Reproducibilidad completa: dataset sintético con semilla fija, hiperparámetros documentados y scripts de entrenamiento e inferencia incluidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, ni generación de texto.
- No tiene capacidades multilingües en sentido estricto: la etiqueta `es` del repositorio describe el idioma de la documentación, no una capacidad del modelo.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como primer ejemplo completo del ciclo `forward` → `loss` → `backward` → `step`, con código de entrenamiento e inferencia separados y reproducibles.
- Enseñanza de serialización segura: permite comparar `safetensors` frente a `pickle`/`joblib` en un contexto controlado, mostrando que los pesos son solo números y que la arquitectura debe reconstruirse aparte.
- Plantilla para pipelines tabulares pequeños: el patrón pesos + `config.json` de normalización + clase de modelo se traslada directamente a problemas de regresión con decenas o cientos de filas.
- Demostración de normalización de features: el ejemplo ilustra por qué los pesos no coinciden con los de scikit-learn hasta desnormalizar, un error habitual en producción.
- Prueba de integración de Hugging Face Hub: útil para validar flujos de descarga, carga con `safetensors.torch.load_file` y ejecución en CI sin dependencias pesadas.
- Ejercicio de evaluación: con 40 registros de test y métricas MAE/R² documentadas, sirve para practicar la comparación entre implementaciones (PyTorch frente a scikit-learn) sobre el mismo dataset sintético.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de USD | 40 registros de test no vistos |
| R² | 0,989 | 40 registros de test no vistos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo de regresión tabular.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB; los 4 parámetros en float32 ocupan 16 bytes, y el repositorio completo pesa 0,0 GB.
- GPU recomendadas: ninguna en particular; el modelo funciona igual en CPU. Cualquier GPU (incluso integrada) es sobredimensionada para esta carga.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; no requiere aceleración por hardware.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; también es trivial exportarlo a ONNX o reimplementarlo con NumPy. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no documentados; por la naturaleza del modelo (una multiplicación matricial de 3×1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LaugerM/regresion-casas-pytorch` | 4 | no aplica | MAE 3,08; R² 0,989 (test sintético) | MIT | Hugging Face |
| Regresión lineal de scikit-learn (mismo problema, citada por el autor) | 4 coeficientes | no aplica | Coeficientes equivalentes tras desnormalizar | BSD-3-Clause (scikit-learn) | PyPI |
| Otros ejemplos tabulares de Hugging Face | no disponible | no disponible | no disponible | variable | Hugging Face |

La comparación relevante es con la implementación de scikit-learn sobre el mismo dataset sintético, que el autor usa como referencia de validación. No se identifican en la información proporcionada otros modelos públicos comparables de la misma categoría y tamaño.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios inmobiliarios reales; no debe usarse para tasaciones.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la extrapolación lineal no está validada.
- Dependencia crítica de la normalización: si se omiten la media y la desviación de `config.json`, las predicciones son incorrectas. Los pesos por sí solos no bastan.
- Acoplamiento a la arquitectura: `load_state_dict` exige la misma clase `RegresionLineal` de `modelo.py`; cualquier cambio en la definición rompe la carga.
- Sin tratamiento de valores faltantes, outliers ni variables categóricas más allá de los dos binarios incluidos.
- Riesgo de sesgo y alucinación: no aplica en el sentido habitual de los LLM, pero el modelo reproduce los sesgos del generador sintético y no modela relaciones no lineales.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la calidad del artefacto es la de un ejercicio docente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaugerM/regresion-casas-pytorch
- Repositorio de PyTorch: https://pytorch.org
- Documentación de safetensors: https://github.com/huggingface/safetensors
- Documentación de scikit-learn (referencia del ejemplo equivalente): https://scikit-learn.org
