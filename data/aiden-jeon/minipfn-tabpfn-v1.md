# aiden-jeon/minipfn-tabpfn-v1

## Resumen

minipfn TabPFN (v1 reproduction) es una reproduccion desde cero del modelo TabPFN original presentado por Hollmann et al. en el articulo "TabPFN: A Transformer That Solves Small Tabular Classification Problems in a Second" (ICLR 2023). El modelo lo desarrolla el usuario independiente aiden-jeon como parte del proyecto minipfn, cuyo objetivo es reimplementar en PyTorch el prior y el presupuesto de entrenamiento descritos en el paper original. No se trata del checkpoint oficial de TabPFN, sino de una reproduccion independiente con pesos propios.

El modelo resuelve el problema de clasificacion tabular en conjuntos de datos pequenos mediante in-context learning: en lugar de entrenar un clasificador para cada tarea, el transformer recibe las filas de entrenamiento como contexto y predice directamente las etiquetas de las filas de test en una sola pasada hacia delante. Esto elimina la necesidad de ajuste de hiperparametros o entrenamiento por tarea, que es precisamente la motivacion central de TabPFN.

Arquitectonicamente es un transformer de 12 capas, 512 dimensiones de embedding, 4 cabezas de atencion y post-normalizacion, con 25,82 millones de parametros. Admite hasta 100 caracteristicas numericas, hasta 10 clases y hasta 1.000 filas de entrenamiento como contexto. Su relevancia actual radica en que es una reproduccion reproducible y ligera (0,1 GB) que iguala practicamente los resultados del TabPFN original en la tabla de evaluacion del paper, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TabPFN v1 (12 capas, emsize 512, 4 cabezas, post-norm) |
| Parametros totales | 25.821.706 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.000 filas de entrenamiento (contexto tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 12 capas con dimension de embedding 512, 4 cabezas de atencion y post-normalizacion, siguiendo la arquitectura TabPFN v1. La entrada son conjuntos de datos tabulares con hasta 100 caracteristicas numericas, hasta 10 clases y hasta 1.000 filas de entrenamiento que se procesan como contexto (in-context learning). El modelo no se reentrena por tarea: `fit` solo prepara las filas de entrenamiento como contexto.

El entrenamiento utiliza el "prior bag" de la version 1 del paper, que combina SCM (structural causal models) y BNN (bayesian neural networks) con hiperparametros diferenciables, ademas de procesos gaussianos, portado a PyTorch. Se entrenaron 18.000 pasos con lotes de 512 datasets, en 8 GPU H100 durante aproximadamente 2 horas. La perdida de validacion final (CE) fue de 0,493 y la precision de validacion de 0,770, medidas sobre 64 datasets fijos del prior. No se menciona uso de RLHF ni DPO, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Clasificacion tabular supervisada con hasta 10 clases y hasta 100 caracteristicas numericas.
- In-context learning: prediccion en una sola pasada sin entrenamiento por tarea.
- Aprendizaje a partir de hasta 1.000 filas de entrenamiento como contexto.
- Soporte de `predict_proba` con probabilidades por clase en el orden de `clf.classes_`.
- Dos modos de `fit`: `fit_preprocessors` (cachea preprocesamiento) y `fit_with_cache` (cachea claves y valores por capa para servir con conjunto de entrenamiento fijo).
- Funcion `tabpfn_predict_proba` para escenarios donde las filas de entrenamiento cambian en cada peticion.
- Capacidades multilingues: no aplica (modelo tabular, no linguistico).
- No soporta tool calling, agentes, vision ni audio.

## Casos de uso

- Clasificacion rapida de datos tabulares pequenos en exploracion de datos: el modelo permite obtener probabilidades por clase sin ajuste de hiperparametros ni entrenamiento, ideal para prototipado en notebooks.
- Baseline automatico en pipelines de ciencia de datos: se puede usar como referencia inicial antes de entrenar modelos especificos, dado que iguala o supera a los defaults de scikit-learn (LogisticRegression, HistGradientBoosting, RandomForest) en la tabla del paper.
- Servicio de prediccion con conjunto de entrenamiento fijo: usando `fit_mode="fit_with_cache"`, se cachean las claves y valores de las filas de entrenamiento (unos 1,6 GB a 1.000 filas) y solo se calcula la atencion test-a-train, reduciendo la latencia por peticion.
- Clasificacion en entornos con recursos limitados: con 25,82 M de parametros y un repo de 0,1 GB, cabe en hardware modesto y se puede desplegar en CPU o GPU consumer.
- Evaluacion y reproduccion de investigacion: sirve para reproducir la Tabla 1 del paper TabPFN (18 datasets OpenML-CC18) mediante el script `scripts/tabpfn/eval.py`.
- Clasificacion de datos medicos, financieros o cientificos de baja dimensionalidad donde el numero de muestras es reducido y no se dispone de datos suficientes para entrenar un modelo especifico.
- Integracion en pipelines de AutoML como estimador de bajo coste para conjuntos tabulares pequenos.

## Benchmarks y rendimiento

Resultados de ROC AUC media sobre los 18 datasets de OpenML-CC18 de la Tabla 1 del paper (5 splits cada uno), segun la model card:

| Metodo | Este modelo | Paper |
|---|---|---|
| TabPFN (ensemble 32) | 0,932 | 0,934 |
| TabPFN (sin ensemble) | 0,928 | 0,932 |
| LogisticRegression (sklearn default) | 0,918 | – |
| HistGradientBoosting (sklearn default) | 0,908 | – |
| RandomForest (sklearn default) | 0,906 | – |

Ademas, la model card reporta perdida de validacion final (CE) de 0,493 y precision de validacion de 0,770 sobre 64 datasets fijos del prior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 25,82 M de parametros en precision completa los pesos ocupan aproximadamente 0,1 GB.
- GPU recomendadas: el entrenamiento se realizo en 8x H100, pero la inferencia es muy ligera y no requiere GPU de datacenter.
- Cabe en GPU consumer: si, cualquier GPU consumer moderna (e incluso CPU) es suficiente para la inferencia dado el tamano del modelo.
- Memoria adicional: el modo `fit_with_cache` requiere aproximadamente 1,6 GB de cache a 1.000 filas de entrenamiento.
- Opciones de despliegue: paquete Python `minipfn` (instalable via `uv pip install "minipfn @ git+https://github.com/Aiden-Jeon/minipfn"`), PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo tabular).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROC AUC (Tabla 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn TabPFN v1 (este modelo) | 25,82 M | 1.000 filas, 100 features, 10 clases | 0,932 (ensemble 32) | Apache-2.0 | Hugging Face |
| TabPFN oficial (PriorLabs) | no disponible | no disponible | 0,934 (ensemble 32) | no disponible | GitHub PriorLabs/TabPFN |
| LogisticRegression (sklearn) | no aplica | no aplica | 0,918 | BSD | scikit-learn |
| HistGradientBoosting (sklearn) | no aplica | no aplica | 0,908 | BSD | scikit-learn |
| RandomForest (sklearn) | no aplica | no aplica | 0,906 | BSD | scikit-learn |

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN; es una reproduccion independiente. Para produccion conviene evaluar el modelo oficial de PriorLabs.
- Solo admite hasta 100 caracteristicas numericas, hasta 10 clases y hasta 1.000 filas de entrenamiento; fuera de estos limites no es aplicable.
- Solo clasificacion tabular; no soporta regresion, texto, vision ni otras modalidades.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre un prior sintetico, puede no reflejar sesgos de datos reales.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero las probabilidades pueden ser poco calibradas en dominios alejados del prior de entrenamiento.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje; la nocion de idioma no aplica.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se deben mantener los avisos de atribucion indicados en `NOTICE`, derivados del codigo oficial de TabPFN (Universidad de Friburgo).
- El modo `fit_with_cache` consume aproximadamente 1,6 GB de memoria a 1.000 filas; si el conjunto de entrenamiento cambia por peticion, hay que usar `tabpfn_predict_proba` en su lugar.
- Los datos de benchmarks provienen de la propia model card y no han sido verificados de forma independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v1
- Repositorio de codigo: https://github.com/Aiden-Jeon/minipfn
- Paper TabPFN (arXiv:2207.01848): https://arxiv.org/abs/2207.01848
- TabPFN oficial (PriorLabs): https://github.com/PriorLabs/TabPFN
- Codigo oficial TabPFN v1 (automl/TabPFN): https://github.com/automl/TabPFN
