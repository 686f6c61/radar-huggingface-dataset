# amandaodoo/casas-sklearn-exportar-skops

## Resumen

`amandaodoo/casas-sklearn-exportar-skops` es un repositorio de modelo de Hugging Face que contiene un modelo de regresión lineal de scikit-learn serializado en formato skops (`model.skops`). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto educativo que ilustra cómo exportar un estimador de scikit-learn entrenado a un formato seguro (sin pickle) y volver a cargarlo para hacer predicciones. El autor es `amandaodoo` y la licencia es MIT.

El modelo forma parte de una secuencia didáctica más amplia: se entrena en un proyecto previo (`sklearn-entrenamiento-evaluacion`), se exporta a skops en este repositorio y se consume mediante un script (`predict_hub.py`) que descarga el artefacto desde el Hub. El pipeline declarado es `tabular-regression` y el idioma de la documentación es español, lo que lo sitúa como material de formación para desarrolladores hispanohablantes.

Su relevancia es formativa y de buenas prácticas: demuestra el flujo completo de publicación de un modelo tabular en el Hub usando skops como alternativa a pickle, con una advertencia explícita sobre la seguridad de la deserialización. No hay información sobre el dataset de entrenamiento, el número de muestras, las características de entrada ni las métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (scikit-learn, `LinearRegression`) |
| Parametros totales | no disponible (numero de coeficientes no documentado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica a modelos tabulares de sklearn) |
| Idiomas soportados | es (documentacion); el modelo no procesa lenguaje |
| Licencia | MIT |
| Formato de pesos | skops (`model.skops`) |

## Arquitectura y entrenamiento

El artefacto es un estimador de regresión lineal de scikit-learn, es decir, un modelo lineal que predice una variable objetivo continua como combinación lineal de las características de entrada. La model card no detalla el número de características, el esquema de columnas, el preprocesado aplicado ni el tamaño del conjunto de entrenamiento; solo indica que proviene del proyecto `sklearn-entrenamiento-evaluacion` y que se serializa con la librería `skops`.

La innovación técnica relevante no está en el algoritmo sino en el formato de serialización: skops guarda el objeto completo sin recurrir a pickle, y al cargarlo exige aceptar explícitamente los tipos desconocidos (`skops.io.load`), lo que reduce la superficie de ataque frente a la deserialización arbitraria de pickle. No se documenta ningún proceso de validación, regularización, búsqueda de hiperparámetros ni evaluación con métricas.

## Capacidades

- Predicción de regresión sobre datos tabulares (variable objetivo continua).
- Carga desde el Hub mediante `skops.io.load` con scikit-learn instalado.
- Deserialización más segura que pickle: no instancia tipos no aceptados explícitamente.
- Publicación directa del directorio como repositorio de modelo en Hugging Face.
- Consumo reproducible desde cualquier máquina con el script `predict_hub.py`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No tiene capacidades multilingües: el campo `language: es` describe la documentación, no el modelo.

## Casos de uso

- Tutorial de exportación segura de modelos: sirve para enseñar a empaquetar un estimador de scikit-learn en skops y evitar pickle en pipelines de datos con requisitos de seguridad.
- Publicación de modelos tabulares en el Hub: el directorio se sube tal cual como repositorio de modelo, lo que facilita compartir artefactos pequeños entre equipos sin infraestructura propia.
- Predicción remota de un modelo pequeño: `predict_hub.py` descarga el artefacto y predice en local, útil para demos de extremo a extremo en cursos de machine learning.
- Validación de flujos de CI/CD para artefactos de ML: el par exportar/cargar permite comprobar que un modelo serializado se reconstruye correctamente antes de desplegarlo.
- Material docente en español: la documentación y los scripts están en castellano, lo que lo hace adecuado para formación en universidades o bootcamps hispanohablantes.
- Referencia de estructura de repositorio de modelo: muestra qué archivos mínimos (pesos skops, README, scripts) componen un repo de modelo consumible desde el Hub.
- Prueba de concepto de regresión sobre precios de vivienda: por el nombre del repositorio (`casas`), el modelo parece orientado a predecir precios de vivienda, aunque no se documentan las variables de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; un modelo de regresión lineal de scikit-learn se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el artefacto skops es de tamaño reducido (no se documenta el tamaño exacto en bytes).
- Opciones de despliegue: Python con `scikit-learn` y `skops` instalados; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; para un modelo lineal tabular la inferencia es del orden de microsegundos por muestra, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| amandaodoo/casas-sklearn-exportar-skops | Regresion lineal sklearn | skops | MIT | no aplica | Hugging Face Hub |
| Modelos sklearn serializados con pickle | Regresion lineal sklearn | pickle | segun autor | no aplica | Hugging Face Hub |
| Modelos sklearn serializados con joblib | Regresion lineal sklearn | joblib | segun autor | no aplica | Hugging Face Hub |
| Modelos tabulares con XGBoost/LightGBM | Arboles con boosting | binario propio | segun autor | no aplica | Hugging Face Hub |

La comparación relevante es de formato, no de rendimiento predictivo: skops evita la ejecución de código arbitrario en la carga, a diferencia de pickle, y no requiere el binding de joblib. No se dispone de datos para comparar precisión con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no procesa lenguaje natural.
- No se documentan el dataset, las variables de entrada ni las métricas de error, por lo que no es posible evaluar su calidad predictiva.
- El nombre sugiere predicción de precios de vivienda, pero no se confirma el dominio ni las unidades de la salida.
- La carga con `skops.io.load` exige aceptar explícitamente los tipos desconocidos; aceptar tipos sin revisarlos reintroduce parte del riesgo de seguridad.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías del autor.
- Sin descargas ni likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El campo `language: es` se refiere a la documentación, no a capacidades lingüísticas del modelo.
- No hay información sobre sesgos, alucinación ni cobertura geográfica de los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amandaodoo/casas-sklearn-exportar-skops
- Documentación de skops: https://skops.readthedocs.io/
- Repositorio de skops en GitHub: https://github.com/skops-dev/skops
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Proyecto de origen citado en la model card: `sklearn-entrenamiento-evaluacion` (ruta local, sin URL pública disponible)
