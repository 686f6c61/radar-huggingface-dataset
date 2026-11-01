# amandaodoo/casas-pytorch-exportar-torch-export

## Resumen

`amandaodoo/casas-pytorch-exportar-torch-export` es un repositorio de HuggingFace que contiene un modelo de regresión lineal entrenado con PyTorch y exportado al formato `torch.export` (`model.pt2`). No se trata de un modelo de lenguaje ni de un transformer: es un ejemplo educativo de pipeline de machine learning tabular orientado a la predicción de precios de viviendas (dataset "casas"), publicado por el usuario `amandaodoo`. El repositorio forma parte de una serie de materiales didácticos sobre formatos de exportación en PyTorch (junto con el proyecto `pytorch-entrenamiento-evaluacion`, del que deriva).

El modelo resuelve un problema acotado: demostrar cómo entrenar un regresor lineal, serializarlo con la API `torch.export` y volver a cargarlo en otra máquina para inferencia sin necesidad de la clase Python original. Su relevancia es formativa: ilustra el flujo de trabajo de exportación seguro (sin `pickle`) y despliegue de modelos tabulares en producción o en dispositivos alternativos.

Por su naturaleza (regresión lineal sobre datos tabulares), el "modelo" no tiene parámetros en el sentido de un LLM, no maneja contexto textual y su ámbito lingüístico se limita a la documentación en español. Cualquier evaluación como modelo generativo o de razonamiento no aplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (una capa densa) implementada en PyTorch |
| Parametros totales | No disponible (depende del número de features del dataset de casas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (no se documenta cuantización) |
| Idiomas soportados | Español (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | `torch.export` (`model.pt2`), sin pickle |

## Arquitectura y entrenamiento

La arquitectura es un modelo de regresión lineal, es decir, una transformación afín de las variables de entrada tabulares a una salida continua (precio de vivienda). El entrenamiento se realizó en el proyecto precedente `pytorch-entrenamiento-evaluacion` mediante el script `train.py`; no se documenta en la información disponible el número de épocas, la función de pérdida concreta, el optimizador ni el volumen de datos empleado.

La innovación técnica del repositorio no reside en el modelo sino en el formato de serialización: `torch.export` captura el grafo de operaciones y los pesos en un artefacto `model.pt2` que se carga con `torch.export.load(...).module()`, sin requerir la definición de la clase original y sin recurrir a `pickle`, lo que reduce la superficie de riesgo al abrir artefactos de procedencia desconocida. El flujo se completa con los scripts `exportar.py` (exportación), `cargar.py` (carga local) y `predict_hub.py` (descarga y predicción desde el Hub).

## Capacidades

- Regresión tabular: predice un valor continuo (precio) a partir de features numéricas de viviendas.
- Exportación portable: el artefacto `model.pt2` puede cargarse en otro equipo sin la clase Python de definición.
- Carga segura: el formato no utiliza `pickle`, lo que mitiga riesgos de ejecución de código arbitrario.
- Distribución vía HuggingFace Hub: incluye un script (`predict_hub.py`) para descargar el modelo por identificador de repositorio y ejecutar inferencia.
- Material didáctico: sirve como referencia para aprender el ciclo entrenamiento → exportación → carga → predicción.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Predicción de precios de vivienda en un prototipo: dado un vector de features (superficie, habitaciones, ubicación codificada), el modelo devuelve una estimación continua; adecuado para validar un pipeline completo antes de escalar a modelos más complejos.
- Docencia de PyTorch: usar el repositorio como ejemplo guiado en un curso para explicar `torch.export`, la diferencia con `torch.save`/pickle y el ciclo de vida de un artefacto de modelo.
- Despliegue en entornos con restricciones de seguridad: al no emplear pickle, el artefacto puede cargarse en infraestructuras que rechazan serializaciones inseguras, como servidores de inferencia con políticas estrictas.
- Inferencia en dispositivos alternativos: el formato `torch.export` está pensado para llevar el modelo a producción o a otros dispositivos; útil como banco de pruebas de portabilidad.
- Integración en un servicio de tasación automatizada (MVP): el modelo puede envolverse en un endpoint que reciba JSON con las features y devuelva el precio estimado, sirviendo de base para sustituir la regresión lineal por un modelo más potente.
- Reproducibilidad de experimentos: al publicar el artefacto exportado junto al código, terceros pueden reproducir las predicciones sin reentrenar, lo que facilita la auditoría de resultados.
- Plantilla para publicar modelos en el Hub: el script `publicar_en_hub.py` y la estructura de carpeta documentan cómo empaquetar y subir un modelo propio a HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: despreciable; un modelo de regresión lineal ocupa kilobytes, muy por debajo de 1 GB.
- GPU recomendadas: no requiere GPU; la inferencia puede ejecutarse en CPU sin penalización apreciable.
- GPU de consumo: cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso prescinde de ella.
- Opciones de despliegue: PyTorch con `torch.export.load(...).module()`; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; para una regresión lineal sobre un vector de features, la latencia esperada es de microsegundos a milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amandaodoo/casas-pytorch-exportar-torch-export` | Regresión lineal tabular (torch.export) | No disponible | No aplica | MIT | HuggingFace Hub |
| `scikit-learn` `LinearRegression` | Regresión lineal tabular | No disponible | No aplica | BSD-3-Clause | PyPI |
| `amandaodoo/pytorch-entrenamiento-evaluacion` (proyecto origen) | Regresión lineal tabular (PyTorch, sin exportar) | No disponible | No aplica | No disponible | Repositorio local referenciado |
| XGBoost / LightGBM | Gradient boosting tabular | No disponible | No aplica | Apache 2.0 / MIT | PyPI |

La comparación con modelos de lenguaje no procede: este artefacto es un regresor tabular didáctico, no un modelo generativo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni procesa lenguaje natural.
- Rendimiento predictivo limitado por la simplicidad de la regresión lineal; no captura relaciones no lineales ni interacciones complejas entre features.
- El rendimiento real depende del dataset "casas" subyacente, cuyas características, tamaño y procedencia no se documentan en la información disponible.
- Sesgos: al ser un modelo entrenado sobre un dataset concreto de viviendas, heredará los sesgos de representación de dicho dataset (posible sesgo geográfico y socioeconómico); no se han publicado análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero las predicciones fuera del rango de los datos de entrenamiento pueden ser arbitrarias (extrapolación no fiable).
- Idioma: la documentación está en español; el modelo en sí no procesa idioma alguno.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no impone restricciones adicionales.
- Advertencia para producción: el repositorio es un ejemplo educativo con 16 descargas y 0 likes; no debe usarse como sistema de tasación real sin validación exhaustiva, reentrenamiento con datos actualizados y evaluación de errores.
- El formato `torch.export` puede tener limitaciones de compatibilidad entre versiones de PyTorch; conviene fijar la versión en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amandaodoo/casas-pytorch-exportar-torch-export
- Documentación de `torch.export`: https://pytorch.org/docs/stable/export.html
- Repositorio de PyTorch: https://github.com/pytorch/pytorch
- Proyecto origen referenciado en la model card: `pytorch-entrenamiento-evaluacion` (no se proporciona URL)
