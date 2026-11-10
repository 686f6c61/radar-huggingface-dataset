# LaugerM/regresion-casas-sklearn

## Resumen

`LaugerM/regresion-casas-sklearn` es un modelo de regresión lineal entrenado con scikit-learn que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados (`m2`), presencia de balcón (`balcon`) y presencia de ascensor (`ascensor`). No es una red neuronal ni un modelo de lenguaje: es un estimador clásico de mínimos cuadrados ordinarios serializado con `joblib`, publicado como ejemplo pedagógico del flujo completo de entrenamiento y compartición de un modelo supervisado.

El modelo lo publica el usuario LaugerM en el marco de una actividad formativa del IFTS N.º 18 (docente: Cynthia M. Villagra) y está orientado a ilustrar qué se publica cuando se comparte un modelo entrenado: pesos, bias, métricas de evaluación, código de entrenamiento y script de inferencia. El dataset es sintético, de 200 registros generados con una función lineal conocida más ruido, lo que permite verificar que los coeficientes aprendidos recuperan los coeficientes teóricos.

Su relevancia es exclusivamente didáctica. No compite con modelos de machine learning tabular de producción (XGBoost, LightGBM, CatBoost) ni con modelos fundacionales; sirve como referencia mínima reproducible para entender la regresión lineal, la evaluación con MAE y R², y el empaquetado de artefactos con `joblib`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal por mínimos cuadrados ordinarios (`sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parámetros aprendidos (3 pesos + 1 bias) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 3 características) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en coma flotante de precisión nativa de scikit-learn) |
| Idiomas soportados | es (la documentación y la model card están en español; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serialización basada en pickle) |

## Arquitectura y entrenamiento

El modelo es una regresión lineal múltiple sin regularización, resuelta por mínimos cuadrados ordinarios mediante `LinearRegression` de scikit-learn. La función aprendida es `precio = w1·m2 + w2·balcon + w3·ascensor + b`, con cuatro parámetros: pesos de 1,503 para `m2`, 8,719 para `balcon` y 11,988 para `ascensor`, y un bias (`intercept_`) de 19,557. Estos valores quedan próximos a los coeficientes teóricos usados en la generación de los datos (1,5; 8; 12; 20), lo que confirma la correctitud del ajuste.

Los datos de entrenamiento son 200 registros sintéticos generados en `train.py` con una semilla fija: 160 para entrenamiento y 40 para evaluación. Las entradas cubren `m2` entre 35 y 120, y `balcon` y `ascensor` como variables binarias (0 o 1). La variable objetivo se genera como `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`. No hay fases de RLHF, DPO ni ajuste fino; tampoco hay innovaciones técnicas como decodificación especulativa o atención lineal, ya que no se trata de un transformer.

## Capacidades

- Predicción de una variable objetivo continua (precio en miles de US$) a partir de tres características tabulares.
- Regresión lineal interpretable: cada coeficiente tiene una lectura directa en unidades del problema (US$ por m², US$ por balcón, US$ por ascensor).
- Inferencia por lotes mediante `pandas.DataFrame` y `model.predict`.
- Carga desde el Hub con `huggingface_hub.hf_hub_download` y `joblib.load`.
- Reproducibilidad completa: el script `train.py` permite regenerar el modelo con la misma semilla.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües en sentido estricto: no procesa lenguaje natural; el tag `es` refleja el idioma de la documentación.

## Casos de uso

- Docencia de regresión lineal: el modelo sirve como ejemplo mínimo para explicar pesos, bias, función de coste y evaluación en un curso introductorio de machine learning, con la ventaja de que los coeficientes aprendidos se pueden comparar contra los teóricos.
- Verificación de pipelines de publicación de modelos: permite practicar el flujo completo de subida a Hugging Face Hub, descarga con `hf_hub_download` y carga con `joblib`, sin la complejidad de un modelo grande.
- Pruebas de integración de extremo a extremo: útil como modelo "dummy" en tests de servicios de inferencia tabular, ya que su latencia es de microsegundos y su tamaño es despreciable.
- Ejemplo de evaluación con MAE y R²: sirve para ilustrar la interpretación de métricas de regresión sobre un conjunto de validación de 40 registros (MAE de 3,08 miles de US$ y R² de 0,989).
- Demostración de las limitaciones de la extrapolación: al ser lineal y haberse entrenado solo con `m2` entre 35 y 120, es un caso práctico para mostrar por qué un modelo lineal no debe usarse fuera del rango de entrenamiento.
- Material de concienciación sobre seguridad en serialización: al usar `joblib`/pickle, permite explicar por qué solo deben cargarse artefactos de fuentes confiables y cómo se ejecuta código al deserializar.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 registros de evaluación |
| R² | 0,989 | 40 registros de evaluación |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de regresión tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto `model.joblib` ocupa unos pocos kilobytes y la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; scikit-learn ejecuta esta regresión en CPU. Cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer y en cualquier equipo sin GPU; también en entornos serverless de recursos mínimos.
- Opciones de despliegue: script Python con `scikit-learn` y `joblib`; integración en APIs con FastAPI o Flask; ejecución en notebooks; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (una multiplicación matricial de 3 entradas por 3 pesos) la latencia es del orden de microsegundos por muestra en CPU, y el throughput está limitado por el sobrecoste de Python y pandas, no por el cálculo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LaugerM/regresion-casas-sklearn` | Regresión lineal (scikit-learn) | 4 | no aplica | MIT | Hugging Face Hub |
| Regresión ridge/lasso (scikit-learn) | Regresión lineal regularizada | depende de las features | no aplica | BSD-3-Clause (scikit-learn) | PyPI |
| XGBoost / LightGBM / CatBoost | Gradient boosting sobre árboles | miles a millones de nodos | no aplica | Apache 2.0 / MIT / Apache 2.0 | PyPI |

No se dispone de comparativas publicadas con otros modelos del Hub para esta tarea concreta; la comparación anterior es categórica y no de rendimiento. Cualquier modelo de gradient boosting superaría a esta regresión lineal en un dataset real con interacciones no lineales, pero no existe una comparación numérica publicada en la información disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Rango de validez restringido: solo conoce `m2` entre 35 y 120; fuera de ese intervalo extrapola linealmente sin garantías.
- Modelo puramente aditivo: no captura interacciones entre variables (por ejemplo, que el ascensor valga más en un edificio alto) ni relaciones no lineales.
- Riesgo de seguridad en la carga: `joblib` usa pickle y al deserializar puede ejecutar código arbitrario; solo deben cargarse archivos `.joblib` de fuentes confiables.
- Dependencia de versión: la versión de scikit-learn usada para cargar debería coincidir con la de entrenamiento para evitar incompatibilidades de deserialización.
- Sin sesgos demográficos conocidos por la naturaleza sintética de los datos, pero tampoco hay auditoría de sesgos ni validación externa.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación incorrecta fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; aun así, el uso comercial en producción no está justificado por la calidad del modelo, sino solo por su valor didáctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaugerM/regresion-casas-sklearn
- Documentación de scikit-learn sobre `LinearRegression`: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentación de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentación de `huggingface_hub.hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
