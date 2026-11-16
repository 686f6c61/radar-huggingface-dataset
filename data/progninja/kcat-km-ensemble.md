# ProgNinja/kcat-km-ensemble

## Resumen

El repositorio `ProgNinja/kcat-km-ensemble` contiene un paquete de inferencia y pesos entrenados para la tarea Leak CURBER de prediccion conjunta de `kcat` y `Km` (constante catalitica y constante de Michaelis) a partir de pares SMILES-secuencia. No es un modelo de lenguaje: es un ensemble de modelos de regresion supervisada orientado a un leaderboard academico, empaquetado con `joblib` y `safetensors` y distribuido bajo licencia MIT. El autor, ProgNinja, lo publica como solucion individual para el reto, con un tamano de repositorio de 2,7 GB.

La model card indica que el ensemble refit seleccionado consta de seis miembros con aproximadamente 35M de parametros en total, aunque advierte de que los pesos incluidos en el repositorio activan todavia un baseline previo de tipo ExtraTrees (un unico modelo) hasta que se complete el refit completo. El paquete incluye instrucciones de entrenamiento (`train.py`), un script de prediccion (`predict.py`) y un `Dockerfile` para verificacion reproducible en un entorno aislado de 2 vCPU, 16 GB de RAM y 10 minutos de inferencia.

La relevancia del artefacto es doble: por un lado, sirve como referencia de implementacion para tareas de prediccion enzimatica multiobjetivo con metricas de ranking (Spearman); por otro, ejemplifica un flujo de publicacion reproducible en Hugging Face con validacion mediante contenedor Docker sin red. No se trata de un modelo generativo ni de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos de regresion (seis miembros, ~35M de parametros totales segun la model card); los pesos empaquetados activan un baseline ExtraTrees |
| Parametros totales | Aproximadamente 35M en el ensemble refit; los pesos incluidos corresponden al baseline ExtraTrees (recuento no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular: pares SMILES-secuencia) |
| Tipos de cuantizacion | No disponible (no es un modelo neuronal con pesos cuantizables de forma estandar) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `joblib` y `safetensors` |

## Arquitectura y entrenamiento

La tarea consiste en predecir dos objetivos transformados logaritmicamente, `log10_kcat` y `log10_km`, a partir de un identificador, una cadena SMILES y una secuencia aminoacidica. El baseline descrito en la model card ajusta dos regresiones ridge independientes (una por objetivo) sobre caracteristicas sencillas: longitud de secuencia, longitud de SMILES, fracciones de aminoacidos y fracciones de caracteres del SMILES. El ensemble refit mencionado en la cabecera del README amplia esta base a seis miembros con un total aproximado de 35M de parametros, pero la model card no detalla la composicion exacta de cada miembro ni el esquema de agregacion.

Los datos publicos consisten en `train.parquet` (36.970 pares con etiquetas) y `val_inputs.parquet` (1.502 pares sin etiquetas); el conjunto de test privado contiene 1.375 pares. El dataset se construye a partir de coincidencias exactas SMILES-secuencia cuyas asignaciones originales de `kcat` y `Km` coinciden entre si. No se documentan en la informacion disponible el numero de tokens de entrenamiento (no aplica), la composicion detallada del dataset ni el uso de tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). La metrica de ranking es la media de la correlacion de Spearman (SCC) entre `kcat` y `Km`; el RMSE se reporta solo a efectos comparativos.

## Capacidades

- Prediccion conjunta de `log10_kcat` y `log10_km` a partir de pares SMILES-secuencia.
- Generacion de un CSV con columnas exactas `id,log10_kcat,log10_km`, una fila por ID de entrada.
- Inferencia determinista en CPU, sin acceso a red ni credenciales.
- Verificacion reproducible mediante `Dockerfile` con restricciones de 2 vCPU, 16 GB de RAM y 10 minutos.
- Entrenamiento reproducible mediante `train.py --data ../data --output NEW_DIRECTORY` en el host de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, vision, audio ni capacidades multilingues: es un modelo de regresion tabular especializado.

## Casos de uso

- Prediccion de parametros enzimaticos en pipelines de biologia computacional: el modelo toma pares SMILES-secuencia y devuelve estimaciones de `log10_kcat` y `log10_km` listas para integrarse en flujos de anotacion funcional, siempre que se respete el formato de entrada documentado.
- Reproduccion de resultados de leaderboard: el paquete incluye `predict.py`, `requirements.txt` y `Dockerfile` para reconstruir la inferencia en un entorno aislado de 2 vCPU y 16 GB de RAM, lo que permite auditar predicciones de forma determinista.
- Punto de partida para experimentacion academica: el baseline ridge y el ensemble de seis miembros sirven como referencia para comparar nuevas arquitecturas (grafos moleculares, transformers de proteinas) sobre la misma metrica de SCC medio.
- Validacion de pipelines de datos quimicos: la verificacion Docker exige columnas exactas, IDs unicos y valores finitos con valor absoluto menor o igual a 1.000.000, lo que lo convierte en un test util para comprobar la integridad de pipelines SMILES-secuencia.
- Docencia en aprendizaje automatico aplicado: el repositorio documenta el flujo completo (descarga, entrenamiento, empaquetado, envio a leaderboard) con restricciones de recursos explicitas, util como ejercicio guiado.
- Benchmarking de ensembles frente a baselines lineales: la diferencia entre el baseline ExtraTrees empaquetado y el ensemble de seis miembros permite medir la ganancia de un enfoque no lineal frente a uno lineal sobre la misma particion de datos.
- Despliegue interno de bajo coste: al ejecutarse en CPU sin red, puede integrarse en entornos aislados (por ejemplo, servidores de investigacion sin salida a internet) siempre que se cumplan las restricciones de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la metrica oficial (media de SCC entre `kcat` y `Km`, con RMSE como referencia) y especifica los tamanos de los conjuntos (36.970 pares de entrenamiento, 1.502 de validacion, 1.375 de test), pero no incluye puntuaciones numericas del baseline ni del ensemble refit. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el entorno oficial de verificacion limita a 2 vCPU y 16 GB de RAM con un tiempo maximo de 10 minutos.
- No requiere GPU; no se documenta soporte para CUDA ni para aceleradores.
- El repositorio ocupa 2,7 GB, por debajo del limite de 4 GiB impuesto por el leaderboard.
- Despliegue mediante Docker (imagen Linux x86-64, Python en `/usr/local/bin/python`, script en `/app/predict.py`).
- El tiempo de construccion de la imagen esta limitado a 30 minutos.
- No se dispone de datos de latencia o throughput mas alla del limite de 10 minutos por ejecucion.
- Alternativas de despliegue fuera de Docker (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ProgNinja/kcat-km-ensemble | Ensemble de regresion (6 miembros) | ~35M | No aplica | SCC medio (sin cifras publicadas) | MIT | Hugging Face |
| Baseline ridge (descrito en la model card) | Regresion ridge doble | No disponible | No aplica | SCC medio (sin cifras publicadas) | No disponible | Incluido en el paquete |
| Baseline ExtraTrees (pesos empaquetados) | ExtraTrees | No disponible | No aplica | SCC medio (sin cifras publicadas) | MIT | Incluido en el paquete |

No se dispone de informacion sobre modelos comparables externos (por ejemplo, aproximaciones basadas en grafos moleculares o protein language models) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos empaquetados activan el baseline ExtraTrees y no el ensemble refit de seis miembros; la model card advierte explicitamente de esta discrepancia hasta que se complete el refit.
- El comando de entrenamiento del baseline historico queda superado por la nueva interfaz `train.py --data ../data --output NEW_DIRECTORY`; usar el comando antiguo puede producir resultados inconsistentes.
- La model card indica que no se autoriza el envio al leaderboard; debe respetarse esa restriccion.
- La validacion y el test son privados, por lo que el rendimiento real fuera de la particion local no es verificable con la informacion publica.
- El dataset se construye a partir de coincidencias exactas SMILES-secuencia con asignaciones originales coincidentes; esto puede introducir sesgos de seleccion y limitar la generalizacion a proteinas o moleculas con anotaciones parciales.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de extrapolacion erronea fuera del dominio de entrenamiento (por ejemplo, secuencias o familias quimicas poco representadas).
- Restricciones de inferencia estrictas: 2 vCPU, 16 GB de RAM, 10 minutos, sin red; cualquier dependencia que requiera descarga en tiempo de ejecucion invalida la evaluacion.
- El formato de salida es rigido: columnas exactas `id,log10_kcat,log10_km`, IDs unicos y valores finitos con valor absoluto menor o igual a 1.000.000; cualquier desviacion provoca fallo de evaluacion.
- No se documentan sesgos conocidos, limitaciones de idioma (no aplica) ni restricciones adicionales de licencia MIT para uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ProgNinja/kcat-km-ensemble
- Leaderboard del reto: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Repositorio starter (modelo): https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset publico: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
