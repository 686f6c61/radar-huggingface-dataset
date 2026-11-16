# Krishanthh/nonlinear

## Resumen

Krishanthh/nonlinear es un modelo de regresion de parametros cineticos enzimaticos publicado en Hugging Face. Su objetivo es predecir log10(kcat) y log10(Km) a partir de la composicion de la secuencia proteica y de descriptores moleculares calculados con RDKit. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un ensamblado de arboles de decision que combina ExtraTrees (75 % del peso) y XGBoost (25 %) sobre caracteristicas tabulares derivadas de la proteina y del sustrato.

El modelo se distribuye como un artefacto de Joblib (`weights/baseline.joblib`) dentro de un repositorio de 0,1 GB que incluye scripts de entrenamiento, inferencia y un Dockerfile. La inferencia se ejecuta sobre ficheros Parquet de entrada y genera un CSV con tres columnas: identificador, log10_kcat y log10_km. No requiere GPU ni acceso a red, lo que lo hace adecuado para pipelines ligeros de bioinformatica.

Es relevante en el contexto de la prediccion de parametros enzimaticos, un problema con aplicaciones directas en biologia sintetica, diseno de enzimas y modelado metabolico. El autor reporta una validacion por clusters de secuencia con una SCC media de 0,4984 para el modelo mejorado frente a 0,3941 de una linea base ridge, aunque se trata de puntuaciones locales obtenidas con los mismos folds usados para la seleccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de arboles: 75 % ExtraTrees + 25 % XGBoost sobre caracteristicas tabulares (composicion proteica + descriptores RDKit) |
| Parametros totales | no disponible (modelo basado en arboles, sin parametros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (artefacto Joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | Joblib (`weights/baseline.joblib`) |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un modelo neuronal. Se trata de un ensamblado supervisado para regresion tabular: ExtraTrees aporta el 75 % de la prediccion final y XGBoost el 25 % restante, segun la media ponderada descrita en la model card. Las entradas se construyen a partir de la composicion de la secuencia proteica y de descriptores moleculares calculados con RDKit, lo que implica que el pipeline de caracteristicas esta implementado en `model.py` y debe reproducirse de forma identica en inferencia y entrenamiento.

El entrenamiento se realiza con `train.py`, que reajusta la receta seleccionada sobre los datos publicos de entrenamiento y escribe el artefacto Joblib. La validacion reportada es una validacion cruzada de tres folds agrupada por cluster de secuencia, con una SCC media de 0,3941 para el modelo ridge de referencia y 0,4984 para el modelo mejorado. El autor advierte que estas puntuaciones son locales y que la seleccion se hizo con los mismos folds, por lo que pueden estar optimistas. No se documenta el numero de tokens, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales, ya que no aplica al paradigma de entrenamiento.

## Capacidades

- Regresion de dos parametros cineticos: predice log10(kcat) y log10(km) para pares proteina-sustrato.
- Extraccion de caracteristicas proteicas a partir de la composicion de la secuencia.
- Calculo de descriptores moleculares del sustrato mediante RDKit.
- Inferencia por lotes desde ficheros Parquet con salida CSV (`id,log10_kcat,log10_km`).
- Ejecucion sin GPU y sin acceso a red, apta para entornos aislados.
- Empaquetado en Docker para despliegue reproducible en `linux/amd64`.
- Reentrenamiento reproducible mediante `train.py` sobre nuevos datos en Parquet.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo generativo.

## Casos de uso

- Anotacion de parametros cineticos en bases de datos enzimaticas: dado un conjunto de pares enzima-sustrato en Parquet, el modelo genera predicciones de log10(kcat) y log10(km) que pueden usarse para completar entradas ausentes en bases como BRENDA o SABIO-RK, con la ventaja de ejecutarse sin GPU.
- Priorizacion de candidatos en diseno de enzimas: al estimar la constante catalitica y la afinidad por el sustrato antes de expresar y ensayar variantes, permite descartar candidatos con baja kcat predicha y reducir el numero de experimentos humedos.
- Construccion de modelos metabolicos a escala genoma: los valores predichos pueden rellenar huecos en modelos cineticos donde faltan parametros medidos, usando el pipeline de inferencia por lotes sobre los pares del modelo.
- Filtrado en pipelines de biologia sintetica: integrado como paso previo en un flujo que selecciona enzimas para una ruta metabolica, aprovechando que la inferencia no requiere red ni acelerador hardware y puede ejecutarse en contenedores ligeros.
- Analisis exploratorio de relaciones secuencia-funcion: al combinar caracteristicas de composicion proteica y descriptores RDKit, el modelo sirve como referencia interpretable para estudiar que familias de enzimas muestran mayor o menor kcat predicha frente a la mediana del conjunto.
- Reproduccion y extensión en investigacion: el repositorio incluye `train.py` y la estructura de datos en Parquet, de modo que un grupo puede reajustar la receta sobre sus propios datos etiquetados y comparar la SCC con los valores de referencia reportados (0,3941 ridge, 0,4984 ensamblado).
- Despliegue en entornos con restricciones: al no necesitar GPU ni acceso a red, encaja en clusters de computo cientifico con politicas estrictas de salida o en maquinas de laboratorio sin aceleradores.

## Benchmarks y rendimiento

| Metrica | Ridge (referencia) | Modelo mejorado (ExtraTrees + XGBoost) |
|---|---|---|
| SCC media en validacion por clusters de secuencia (3 folds) | 0,3941 | 0,4984 |

Estas son las unicas cifras publicadas en la informacion disponible. El autor indica que son puntuaciones locales y que la seleccion del modelo se realizo con los mismos folds de validacion, por lo que no constituyen una estimacion independiente del rendimiento en datos no vistos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no se requiere GPU; la inferencia es puramente CPU.
- GPU recomendadas: ninguna. El modelo no usa aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica; cualquier CPU convencional puede ejecutar la inferencia.
- Memoria RAM: no disponible de forma explicita; el repositorio ocupa 0,1 GB y el artefacto Joblib contiene arboles ajustados, por lo que la huella en memoria es moderada, pero no se documenta una cifra concreta.
- Opciones de despliegue: ejecucion directa con Python (`predict.py`), contenedor Docker construido con el Dockerfile incluido (`docker build --platform linux/amd64 -t kinetic-trees .`). No se contemplan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El autor no reporta tiempos de inferencia ni tamano de lote recomendado.
- Nota operativa: el autor indica que la construccion y ejecucion del contenedor Docker no pudieron verificarse por falta de un daemon de Docker operativo en su entorno.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krishanthh/nonlinear | Ensamblado ExtraTrees + XGBoost sobre caracteristicas tabulares | no disponible (arboles) | no aplica | SCC 0,4984 (validacion local, 3 folds) | no disponible | Hugging Face, Joblib |
| Ridge (linea base del mismo autor) | Regresion lineal | no disponible | no aplica | SCC 0,3941 (mismos folds) | no disponible | Referenciado en la model card, no distribuido como artefacto independiente |

No se dispone de informacion sobre otros modelos comparables de prediccion de kcat y km en la documentacion proporcionada. La unica comparacion disponible es la linea base ridge del propio autor, que emplea el mismo esquema de caracteristicas y los mismos folds de validacion.

## Limitaciones y advertencias

- Las metricas reportadas (SCC 0,4984) proceden de una validacion local con los mismos folds usados para seleccionar el modelo, por lo que pueden sobreestimar el rendimiento real en datos nuevos.
- No se documenta la composicion del dataset de entrenamiento, el numero de muestras ni la cobertura taxonomica o quimica, lo que impide evaluar el sesgo de dominio.
- Al basarse en composicion de secuencia y descriptores RDKit, el modelo no captura informacion estructural tridimensional de la proteina ni efectos de plegamiento, lo que limita su aplicabilidad a enzimas con mecanismos dependientes de conformacion.
- Riesgo de predicciones poco fiables fuera de la distribucion de pares enzima-sustrato representados en el entrenamiento; no se documenta ningun mecanismo de deteccion de out-of-distribution.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial ni la redistribucion del artefacto Joblib.
- La construccion y ejecucion del contenedor Docker no fueron verificadas por el autor, por lo que el flujo de despliegue debe validarse antes de usarlo en produccion.
- No se especifican versiones de dependencias mas alla de `requirements.txt`; cambios en RDKit o en las librerias de arboles pueden alterar las predicciones si el pipeline de caracteristicas no se congela.
- No es un modelo generativo: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Krishanthh/nonlinear
- Repositorio de codigo: no disponible como enlace independiente; el codigo (`model.py`, `predict.py`, `train.py`, `Dockerfile`, `requirements.txt`) se distribuye dentro del propio repositorio de Hugging Face.
- Paper: no disponible.
- Blog o demo: no disponible.
