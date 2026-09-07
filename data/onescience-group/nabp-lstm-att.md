# OneScience-Group/NABP-LSTM-Att

## Resumen

NABP-LSTM-Att es un modelo de clasificación binaria desarrollado por OneScience-Group que predice si un nanobody (anticuerpo de dominio único) se une a un antigeno, utilizando únicamente la información de las secuencias de aminoacidos. El modelo procesa por separado la región determinante de complementariedad (CDR) del nanobody y la secuencia del antigeno, extrae características de interacción mediante capas de convolución unidimensional, una LSTM bidireccional y un mecanismo de atención suave, y finalmente devuelve una probabilidad de unión entre 0 y 1.

La relevancia de este modelo radica en su aplicación directa en la investigación biosanitaria, especialmente en el diseño y selección de nanobodies terapéuticos o de diagnóstico. Al operar solo con secuencias, facilita el cribado computacional de grandes bibliotecas de candidatos antes de la validación experimental. El modelo fue entrenado sobre el dataset SAbDab-nano y ha sido validado en entornos DCU (Hygon), lo que lo convierte en una opción interesante para laboratorios que trabajan con este tipo de aceleradores.

La arquitectura combina dos flujos de procesamiento: uno para el CDR (representado con k-mers de tamaño 3 y longitud de entrada 24) y otro para el antigeno (k-mers de tamaño 1 y longitud de entrada 2371). El repositorio tiene un tamaño aproximado de 0,9 GB e incluye los pesos preentrenados en formato HDF5 de Keras/TensorFlow. No se dispone de información sobre el número total de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con BiLSTM, convolución 1D y mecanismo de atención suave, con dos flujos de entrada separados |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es modelo MoE) |
| Longitud de contexto | Longitudes fijas de entrada: CDR 24 aminoacidos, antigeno 2371 aminoacidos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | HDF5 (.h5) de Keras/TensorFlow |

## Arquitectura y entrenamiento

El modelo se compone de dos ramas independientes que procesan las secuencias de entrada. La rama del CDR utiliza una representación basada en k-mers de tamaño 3 con una longitud de entrada de 24; a las embeddings de los k-mers se les suman embeddings posicionales antes de pasar por una capa convolucional. La rama del antigeno emplea una representación de k-mers de tamaño 1 con una longitud de entrada de 2371, que también se procesa mediante una capa de embeddings y una capa convolucional independientes.

Las características resultantes de ambas ramas se concatenan y se introducen en una LSTM bidireccional, seguida de un mecanismo de atención suave que agrega la información más relevante. Finalmente, una capa con activación sigmoide produce la probabilidad de unión. El objetivo de entrenamiento es la entropía cruzada binaria. El modelo fue entrenado sobre el dataset SAbDab-nano y, según la documentación, ha sido validado para inferencia y entrenamiento en dispositivos DCU, incluyendo la comprobación de la retropropagación, la actualización de parámetros y la colocación de dispositivos.

## Capacidades

- Predicción de probabilidad de unión entre nanobody y antigeno a partir de secuencias de aminoacidos.
- Procesamiento de secuencias de longitud variable hasta los límites fijos definidos (24 para CDR, 2371 para antigeno).
- Uso de k-mers para la representación de secuencias, con vocabularios precomputados incluidos en el paquete.
- Soporte para entrenamiento desde cero con pesos inicializados aleatoriamente, además del uso de los pesos oficiales preentrenados.
- Validación de inferencia, retropropagación, actualización de parámetros y colocación de dispositivos en DCU (Hygon).
- No dispone de capacidades generativas, tool calling ni razonamiento multi-step; se trata exclusivamente de un clasificador binario.

## Casos de uso

- Cribado de candidatos a nanobody: a partir de una biblioteca de secuencias de CDR y un antigeno de interés, el modelo asigna una probabilidad de unión a cada par, permitiendo priorizar los candidatos para su validación experimental en laboratorio.

- Optimización de afinidad: durante el diseño de nanobodies terapéuticos, se pueden generar variantes de la secuencia del CDR y evaluar rápidamente su probabilidad de unión al antigeno objetivo, reduciendo el numero de variantes que requieren ensayos costosos.

- Evaluación de especificidad: dado un nanobody candidato, el modelo puede comparar su probabilidad de unión frente a diferentes secuencias de antigenos, lo que ayuda a descartar reacciones cruzadas no deseadas y a seleccionar dianas mas especificas.

- Integración en pipelines de descubrimiento de anticuerpos: el modelo puede insertarse como un filtro computacional entre la generacion de secuencias y los experimentos de unión, aumentando la tasa de exito en los ensayos de laboratorio.

- Validación de nuevos datasets: los scripts incluidos permiten evaluar el modelo en un conjunto de test oficial y calcular metricas como AUROC y AUPR, util para verificar su comportamiento ante datos externos al entrenamiento.

- Investigacion academica y comparacion de metodos: el modelo sirve como referencia para evaluar otros predictores de union nanobody-antigeno, ya que su arquitectura y pesos estan disponibles en abierto bajo licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En la documentacion del modelo se menciona que se evalua el conjunto de test oficial utilizando AUROC y AUPR, pero no se proporcionan valores numericos concretos.

## Requisitos de hardware

- Se recomienda ejecutar el modelo en un entorno OneScience Hygon DCU. La adaptacion actual ha sido validada en BW DCU.
- Tanto la inferencia como el entrenamiento soportan ejecucion en un unico dispositivo (no se requiere multi-GPU).
- El repositorio tiene un tamaño aproximado de 0,9 GB, lo que sugiere que los requisitos de memoria son modestos, aunque no se dispone de cifras exactas de VRAM.
- Al no ser un modelo de lenguaje y utilizar entradas de longitud fija, es probable que pueda ejecutarse en GPUs de gama media, aunque no se ha especificado una GPU concreta.
- No se indica soporte para despliegue mediante vLLM, llama.cpp, Ollama o TGI. El modelo se ejecuta mediante scripts de TensorFlow proporcionados en el repositorio.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables en la documentación disponible. El modelo se enmarca dentro de los predictores de unión nanobody-antigeno, pero no se han publicado comparativas oficiales con otras herramientas de la misma categoría. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- El modelo solo predice una probabilidad de unión binaria; no proporciona información sobre afinidad, cinética ni estabilidad de la interaccion.
- La predicción se basa exclusivamente en la secuencia del CDR y del antigeno, sin considerar estructura tridimensional, modificaciones postraduccionales ni condiciones fisicoquimicas del entorno.
- El dataset de entrenamiento SAbDab-nano puede presentar sesgos inherentes a las fuentes de datos, lo que podría limitar la generalización a familias de antigenos no representadas en el entrenamiento.
- La licencia MIT permite el uso comercial, pero es obligatorio citar el articulo original: Ahmed, F. S., Aly, S., El-Tabakh, M. A. M., & Liu, X. (2025).
- El modelo requiere un entorno compatible con TensorFlow y, para la validacion oficial, un entorno DCU con DTK 26.04. Esto puede dificultar su despliegue en infraestructuras GPU convencionales sin adaptaciones adicionales.
- Como clasificador binario, existe riesgo de falsos positivos y falsos negativos en las predicciones de union, por lo que los resultados deben interpretarse como una herramienta de apoyo y no como un sustituto de la validacion experimental.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/NABP-LSTM-Att
- Articulo original (DOI): https://doi.org/10.1016/j.compbiolchem.2025.108490
- Proyecto original en GitHub: https://github.com/FMoonlightS/NABP-LSTM-Att
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
