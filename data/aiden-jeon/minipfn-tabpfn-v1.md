# aiden-jeon/minipfn-tabpfn-v1

## Resumen

minipfn-tabpfn-v1 es una reproducción desde cero de TabPFN v1 (Hollmann et al., ICLR 2023), un transformer diseñado específicamente para clasificación tabular en contextos pequeños. Lo desarrolla el usuario independiente aiden-jeon como parte del proyecto minipfn, cuyo objetivo es reimplementar arquitecturas de prior-data-fitted networks (PFN) en PyTorch de forma abierta y verificable. El modelo resuelve un problema concreto: la clasificación de datasets tabulares pequeños (hasta 1.000 filas de entrenamiento y 100 características numéricas) sin entrenamiento por tarea, mediante aprendizaje en contexto.

La relevancia de esta ficha es doble. Por un lado, reproduce con fidelidad los resultados del paper original (ROC AUC medio de 0,932 frente a 0,934 del TabPFN oficial con ensemble de 32). Por otro, ofrece un checkpoint pequeño (25,82 millones de parámetros, 0,1 GB) que cabe en cualquier GPU consumer y sirve como referencia didáctica para entender el paradigma PFN. No es el checkpoint oficial de PriorLabs, sino una reimplementación independiente con licencia Apache-2.0.

La arquitectura es un transformer de 12 capas, dimensión de embedding 512 y 4 cabezas de atención con post-norm. Acepta hasta 100 características numéricas, hasta 10 clases y hasta 1.000 filas de contexto de entrenamiento. El entrenamiento se realizó en 18.000 pasos con batches de 512 datasets sintéticos sobre 8 GPUs H100 durante aproximadamente 2 horas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TabPFN v1 (12 capas, emsize 512, 4 cabezas, post-norm) |
| Parametros totales | 25.821.706 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.000 filas de entrenamiento en contexto (más filas de test) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre datos tabulares numericos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TabPFN v1: un transformer encoder con 12 capas, dimensión de embedding 512, 4 cabezas de atención y normalización post-norm. La entrada es un conjunto de filas tabulares (hasta 1.000 de entrenamiento y un número variable de test) con hasta 100 características numéricas y hasta 10 clases. La clasificación se realiza mediante atención bidireccional entre filas de entrenamiento y de test, sin actualización de pesos en inferencia: el "entrenamiento" en tiempo de inferencia consiste en preparar las filas de entrenamiento como contexto.

El entrenamiento utiliza el prior v1 del paper, portado a PyTorch: un banco de priors que combina modelos causales estructurales (SCM) y redes bayesianas (BNN) con hiperparámetros diferenciables, además de procesos gaussianos (GP). Se entrenó durante 18.000 pasos con batches de 512 datasets sintéticos muestreados del prior, sobre 8 GPUs H100, en aproximadamente 2 horas. La pérdida de validación final fue 0,493 y la precisión de validación 0,770, evaluadas sobre 64 datasets fijos del prior. No se reporta uso de RLHF ni DPO, lo cual es coherente con el paradigma PFN, que no es un modelo generativo de lenguaje.

## Capacidades

- Clasificación tabular supervisada en contexto con hasta 100 características numéricas y hasta 10 clases.
- Aprendizaje en contexto sin ajuste de pesos: `fit` solo prepara las filas de entrenamiento como contexto.
- Dos modos de inferencia: `fit_preprocessors` (cachea el preprocesado, útil para predicción por lotes) y `fit_with_cache` (cachea claves y valores por capa, útil para servir con un conjunto de entrenamiento fijo; el caché ocupa aproximadamente 1,6 GB con 1.000 filas).
- Función `tabpfn_predict_proba` para escenarios donde las filas de entrenamiento cambian en cada petición.
- Salida de probabilidades por clase (`predict_proba`) en el orden de `clf.classes_`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo estrictamente tabular.

## Casos de uso

- Clasificación de datasets tabulares pequeños en investigación: sustituir baselines como RandomForest o HistGradientBoosting en experimentos con menos de 1.000 filas, donde TabPFN supera a los defaults de scikit-learn (ROC AUC 0,932 frente a 0,906-0,918).
- Prototipado rápido de modelos predictivos: al no requerir entrenamiento por tarea, permite obtener probabilidades en segundos sobre un conjunto de entrenamiento fijo, ideal para validar hipótesis antes de invertir en un pipeline completo.
- Serving con conjunto de entrenamiento fijo: usando `fit_with_cache`, el coste por predicción se reduce a la atención test-a-train, adecuado para APIs de scoring con datos de referencia estables.
- Evaluación reproducible de PFN: el script `scripts/eval_tabpfn.py` permite reproducir la Tabla 1 del paper sobre los 18 datasets de OpenML-CC18, útil para docencia y verificación de implementaciones.
- Clasificación en entornos con recursos limitados: con 25,82 M de parámetros y 0,1 GB de pesos, cabe en GPUs consumer y en CPU para volúmenes moderados.
- Comparación de priors sintéticos: al ser una reproducción del prior v1, sirve como referencia para estudiar el efecto del prior en el rendimiento de PFN frente a variantes posteriores.
- Integración en pipelines de scikit-learn: la API `TabPFNClassifier` con `fit`/`predict_proba` facilita su uso como estimador en validación cruzada y búsqueda de hiperparámetros.

## Benchmarks y rendimiento

Resultados de ROC AUC medio sobre los 18 datasets de OpenML-CC18 de la Tabla 1 del paper (5 splits por dataset):

| Metodo | Este modelo | Paper |
|---|---|---|
| TabPFN (ensemble 32) | 0,932 | 0,934 |
| TabPFN (sin ensemble) | 0,928 | 0,932 |
| LogisticRegression (sklearn default) | 0,918 | no disponible |
| HistGradientBoosting (sklearn default) | 0,908 | no disponible |
| RandomForest (sklearn default) | 0,906 | no disponible |

Métricas de validación durante el entrenamiento: cross-entropy de validación final 0,493 y accuracy de validación 0,770 sobre 64 datasets fijos del prior.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (25,82 M de parámetros en fp32 ≈ 0,1 GB); el caché de `fit_with_cache` añade aproximadamente 1,6 GB con 1.000 filas de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento original usó 8×H100, pero la inferencia es viable en GPUs consumer.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: el paquete `minipfn` (instalable vía `uv pip install "minipfn @ git+https://github.com/Aiden-Jeon/minipfn"`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño del conjunto de entrenamiento y del modo de `fit`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROC AUC (OpenML-CC18) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn-tabpfn-v1 | 25,82 M | 1.000 filas de train, 100 features | 0,932 (ensemble 32) | Apache-2.0 | Hugging Face (aiden-jeon) |
| TabPFN v1 oficial (PriorLabs) | no disponible en la informacion | 1.000 filas de train, 100 features | 0,934 (ensemble 32) | Apache-2.0 (codigo); pesos con licencia propia | GitHub PriorLabs/TabPFN |
| LogisticRegression (sklearn) | no aplica | no aplica | 0,918 | BSD-3-Clause | scikit-learn |
| HistGradientBoosting (sklearn) | no aplica | no aplica | 0,908 | BSD-3-Clause | scikit-learn |

La comparación con TabPFN v2 o con modelos tabulares basados en LLM no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN; para producción se recomienda evaluar el modelo oficial de PriorLabs, que puede tener mejor soporte y actualizaciones.
- Solo admite características numéricas: no se documenta soporte para variables categóricas ni texto, lo que limita su aplicación directa a datasets mixtos.
- Límites estrictos de tamaño: hasta 100 características, 10 clases y 1.000 filas de entrenamiento; fuera de estos rangos el comportamiento no está garantizado.
- Riesgo de sesgo heredado del prior sintético: el rendimiento depende de la similitud entre los datos reales y las distribuciones generadas por el prior (SCM, BNN, GP).
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso; cualquier expectativa en ese sentido es un error de uso.
- El caché de `fit_with_cache` consume aproximadamente 1,6 GB con 1.000 filas, lo que puede ser problemático en entornos con memoria limitada o múltiples instancias concurrentes.
- La licencia Apache-2.0 exige conservar el archivo `NOTICE` con las atribuciones al código original de la Universidad de Friburgo.
- Repositorio con pocas descargas (72) y sin likes en el momento de la consulta: menor madurez y soporte comunitario que alternativas establecidas.

## Enlaces

- Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v1
- Repositorio del proyecto: https://github.com/Aiden-Jeon/minipfn
- Paper TabPFN (arXiv:2207.01848): https://arxiv.org/abs/2207.01848
- TabPFN oficial (PriorLabs): https://github.com/PriorLabs/TabPFN
- Código original TabPFN v1 (Universidad de Friburgo): https://github.com/automl/TabPFN
