# amandaodoo/casas-sklearn-exportar-pickle

## Resumen

`amandaodoo/casas-sklearn-exportar-pickle` es un repositorio de HuggingFace que contiene un modelo de regresión lineal entrenado con scikit-learn y exportado en formato pickle (`model.pkl`). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto educativo que forma parte de una serie de ejemplos sobre formatos de serialización de modelos de machine learning. El repositorio tiene como objetivo demostrar cómo exportar un modelo entrenado previamente en el proyecto `sklearn-entrenamiento-evaluacion` a pickle y cómo volver a cargarlo para hacer predicciones, tanto en local como desde el Hub.

El modelo resuelve un problema de regresión tabular, presumiblemente sobre precios de viviendas (por el nombre "casas"), y está pensado como material didáctico para quienes aprenden el flujo completo de entrenamiento, evaluación, exportación y publicación de modelos con scikit-learn. El repositorio incluye scripts (`exportar.py`, `cargar.py`, `predict_hub.py`, `publicar_en_hub.py`) que ilustran el ciclo de vida del artefacto.

Por su naturaleza, no dispone de arquitectura transformer, parámetros en el sentido habitual de los modelos de lenguaje, ni ventana de contexto. Su relevancia es formativa: muestra las ventajas y los riesgos de seguridad del formato pickle, que serializa el objeto Python completo (pesos, bias y nombres de columnas) y permite ejecutar código arbitrario al cargarlo, por lo que solo es adecuado en entornos de confianza y con la misma versión de scikit-learn.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (scikit-learn) |
| Parametros totales | no disponible (coeficientes y bias de un modelo lineal; número exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (pesos en precisión nativa de Python/NumPy dentro del pickle) |
| Idiomas soportados | es (documentación y ejemplos en castellano) |
| Licencia | MIT |
| Formato de pesos | pickle (`model.pkl`) |

## Arquitectura y entrenamiento

El modelo es un regresor lineal de scikit-learn, entrenado en el proyecto previo `sklearn-entrenamiento-evaluacion` y exportado a pickle en este repositorio. Al ser un modelo lineal, su arquitectura se reduce a una combinación lineal de las variables de entrada (columnas tabulares) más un término de bias. El pickle almacena el objeto Python completo, incluyendo los coeficientes, el bias y los nombres de las columnas, de modo que al cargarlo con `pickle.load` y scikit-learn instalado no es necesario reescribir nada del pipeline.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición del dataset, ni si hubo técnicas de ajuste adicionales como RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica del repositorio es puramente pedagógica: ilustrar la exportación y recarga de un modelo en pickle, comparándolo implícitamente con otros formatos de serialización de la serie de ejemplos.

## Capacidades

- Regresión tabular: predice un valor continuo (presumiblemente el precio de una vivienda) a partir de variables de entrada tabulares.
- Carga y predicción desde el Hub mediante `predict_hub.py`, pasando el identificador del repositorio.
- Exportación y recarga del modelo completo en pickle, conservando pesos, bias y nombres de columnas.
- Publicación del artefacto como repositorio de modelo en HuggingFace mediante `publicar_en_hub.py`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá de la documentación en castellano.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de machine learning: sirve como ejemplo práctico para explicar el ciclo completo de entrenamiento, evaluación, exportación y publicación de un modelo de scikit-learn, con scripts separados para cada etapa.
- Predicción de precios de vivienda en un entorno controlado: el modelo puede cargarse con `pickle.load` y usarse para estimar precios a partir de variables tabulares, siempre que los datos de entrada sigan el mismo esquema de columnas.
- Demostración de serialización con pickle: permite comparar las ventajas (simplicidad, conserva el objeto completo) y los riesgos (ejecución de código arbitrario) frente a otros formatos como joblib, ONNX o safetensors.
- Prueba de flujo de publicación en el Hub: el script `publicar_en_hub.py` ilustra cómo subir un artefacto de scikit-learn como repositorio de modelo y consumirlo desde otra máquina con `predict_hub.py`.
- Reproducibilidad en equipos de confianza: al fijar la versión de scikit-learn, el pickle garantiza que el modelo se comporte igual en la máquina de origen y en la de destino, útil en entornos internos.
- Base para experimentos comparativos de formatos: sirve como punto de partida para medir tamaño de artefacto, tiempo de carga y facilidad de integración frente a otras alternativas de exportación de la misma serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y su huella en memoria es mínima (coeficientes de un modelo lineal).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: sí, en cualquier CPU con Python y scikit-learn instalados.
- Opciones de despliegue: script de Python con `pickle.load` y scikit-learn; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; para un modelo lineal tabular la inferencia es del orden de microsegundos por muestra, aunque no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| amandaodoo/casas-sklearn-exportar-pickle | Regresión lineal (scikit-learn) | pickle | MIT | HuggingFace |
| Modelo del proyecto `sklearn-entrenamiento-evaluacion` | Regresión lineal (scikit-learn) | no disponible (formato de entrenamiento) | no disponible | Referenciado en la model card |
| Alternativas de la serie de formatos de exportación | Regresión lineal (scikit-learn) | no disponible | no disponible | Referenciadas implícitamente en la model card |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Riesgo de seguridad grave: cargar un pickle de una fuente desconocida puede ejecutar código arbitrario. La propia model card advierte explícitamente de que no es seguro abrirlo si proviene de un desconocido.
- Compatibilidad de versiones: el pickle está ligado a la versión de scikit-learn con la que se generó; cambios de versión pueden romper la carga o alterar el comportamiento.
- Sesgos: no se ha documentado información sobre sesgos en los datos de entrenamiento ni sobre la composición del dataset.
- Alucinación: no aplica en el sentido de los modelos generativos, pero las predicciones de un modelo lineal pueden ser inexactas fuera del rango de los datos de entrenamiento.
- Limitaciones de idioma: la documentación está en castellano; el modelo en sí no procesa lenguaje.
- Uso comercial: la licencia MIT permite uso comercial, pero la responsabilidad sobre la seguridad del pickle y la validez de las predicciones recae en quien lo despliega.
- Caveat para producción: no es un modelo de lenguaje ni un transformer; no debe evaluarse con los criterios habituales de contexto, parámetros o benchmarks de LLM.

## Enlaces

- HuggingFace: https://huggingface.co/amandaodoo/casas-sklearn-exportar-pickle
