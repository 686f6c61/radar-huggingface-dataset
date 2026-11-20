# ericc12/02-pytorch-regresion

## Resumen

El modelo `ericc12/02-pytorch-regresion` es un ejemplo pedagógico de regresión lineal implementado con PyTorch y publicado en formato safetensors. Lo desarrolla el usuario ericc12 en el marco del Seminario de Actualización del IFTS N.º 18, con Cynthia M. Villagra como docente, y su propósito es ilustrar el ciclo de entrenamiento explícito de PyTorch y la publicación de pesos en un formato seguro. No es un modelo de lenguaje: es un regresor tabular que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables de entrada.

La arquitectura es mínima: una única capa `torch.nn.Linear(3, 1)`, con tres pesos y un sesgo, lo que suma exactamente 4 parámetros entrenables. El modelo se entrenó sobre un dataset sintético de 200 registros (160 de entrenamiento y 40 de evaluación) generado con semilla fija, con entradas `m2` (superficie entre 35 y 120 m²), `balcon` (0 o 1) y `ascensor` (0 o 1). Resuelve el mismo problema que el ejemplo equivalente de scikit-learn, y sus pesos en escala normalizada son convertibles a la escala original dividiendo por la desviación típica de cada variable.

Su relevancia es exclusivamente didáctica: muestra cómo separar pesos (`model.safetensors`) de configuración (`config.json`) y de código de arquitectura (`modelo.py`), y por qué safetensors evita la ejecución de código arbitrario al cargar, a diferencia de pickle o joblib. No tiene aplicación en producción ni capacidades de generación, razonamiento o procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal, una capa `torch.nn.Linear(3, 1)` |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan otras precisiones) |
| Idiomas soportados | es (documentacion y model card en espanol; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `modelo.py` |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal pura implementada como una capa `torch.nn.Linear(3, 1)` en `modelo.py`. Recibe tres entradas (`m2`, `balcon`, `ascensor`), previamente normalizadas restando la media y dividiendo por la desviación típica calculadas sobre el conjunto de entrenamiento, y produce una salida escalar: el precio en miles de dólares. Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, todos en la escala de las entradas normalizadas; los valores de media y desviación se almacenan en `config.json`.

El entrenamiento es supervisado, con función de pérdida `MSELoss`, optimizador SGD con tasa de aprendizaje 0,1 y 500 épocas; la pérdida se estabiliza antes de la época 100. El dataset es sintético, generado en `train.py` con la misma semilla que el ejemplo de la Clase 10, y consta de 200 registros: 160 para entrenamiento y 40 para evaluación. No se emplearon técnicas de RLHF, DPO ni ajuste fino adicional, ni innovaciones como decodificación especulativa o atención lineal, dado que el modelo no es un transformer.

## Capacidades

- Predicción de una variable numérica continua (precio de vivienda en miles de US$) a partir de tres features tabulares.
- Regresión lineal con normalización de entradas documentada en `config.json`.
- Carga de pesos en formato safetensors sin ejecución de código al deserializar.
- Reproducibilidad del pipeline de entrenamiento mediante `train.py` con semilla fija.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como ejemplo mínimo y reproducible del ciclo explícito de entrenamiento (forward, pérdida, backward, paso del optimizador) y de la publicación de pesos en safetensors, adecuado para clases introductorias de machine learning.
- Comparación con scikit-learn: permite contrastar los pesos y métricas de un mismo problema resuelto con dos frameworks, verificando que 35,157 / 23,398 ≈ 1,503 coincide con el peso de `m2` obtenido por scikit-learn.
- Demostración de formatos seguros de serialización: útil para explicar por qué safetensors no ejecuta código al cargarse, frente a pickle o joblib, en sesiones sobre seguridad en el despliegue de modelos.
- Prueba de pipelines de inferencia tabular: sirve para validar extremo a extremo el flujo cargar `config.json`, normalizar, cargar `state_dict` y predecir, antes de escalar a modelos mayores.
- Ejemplo de separación pesos/configuración/código: ilustra la práctica de no embeber la arquitectura en el archivo de pesos, mostrando que `load_state_dict` falla si la clase `RegresionLineal` cambia.
- Material de ejercicios de normalización: permite experimentar con el efecto de olvidar la normalización, ya que el propio autor advierte que sin ella las predicciones son arbitrarias.

## Benchmarks y rendimiento

Evaluación sobre 40 viviendas no vistas durante el entrenamiento, según la model card:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R² | 0,989 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el `state_dict` contiene 4 parámetros en float32 (unos 16 bytes), por lo que cabe en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en cualquier GPU (A100, H100, RTX 4090 o inferiores) sin aprovecharlas.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al tratarse de una única capa lineal, la latencia vendría dominada por el overhead de carga del modelo y del framework, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericc12/02-pytorch-regresion | 4 | no aplica | MAE 3,08; R² 0,989 (test sintetico) | MIT | Hugging Face |
| Ejemplo de regresion de scikit-learn (Clase 10, mismo problema) | no disponible | no aplica | pesos equivalentes tras desnormalizar; metricas no disponibles en la informacion | no disponible | material del curso |
| Otros modelos de regresion tabular | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables publicados con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Solo conoce viviendas de 35 a 120 m²; fuera de ese rango la extrapolación no está validada.
- Si se omite la normalización documentada en `config.json`, las predicciones son arbitrarias; los pesos por sí solos no bastan.
- Para cargar los pesos se necesita la misma arquitectura definida en `modelo.py`; si la clase cambia, `load_state_dict` falla.
- No procesa texto ni dispone de capacidades generativas, de razonamiento o multilingües; el idioma declarado (es) se refiere a la documentación.
- No se documentan sesgos específicos, pero al entrenarse con datos sintéticos no refleja distribuciones reales del mercado inmobiliario.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo real es la extrapolación silenciosa fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero al ser un ejemplo didáctico no se recomienda su uso en producción sin reentrenamiento con datos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericc12/02-pytorch-regresion
- No se han encontrado en la búsqueda web otros enlaces (papers, blogs, repositorios o demos) asociados a este modelo.
