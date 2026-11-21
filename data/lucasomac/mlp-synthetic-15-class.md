# lucasomac/mlp-synthetic-15-class

## Resumen

`mlp-synthetic-15-class` es un perceptrón multicapa (MLP) mínimo desarrollado por lucasomac como parte de un curso de Inteligencia Artificial en la UDESC (Brasil). El modelo clasifica puntos de un conjunto de datos sintético bidimensional en 15 clases balanceadas. Su arquitectura es una red densa de dos capas (8 neuronas ReLU y 15 neuronas softmax) con solo 159 parámetros entrenables, construida sobre Keras/TensorFlow.

No resuelve ningún problema de producción: es un artefacto educativo y de portafolio que demuestra el flujo completo de entrenamiento, escalado de características y evaluación de un clasificador tabular. El conjunto de datos contiene 600 muestras con dos características continuas (`x1`, `x2`) y 15 clases de 40 muestras cada una.

Es relevante únicamente como referencia didáctica: muestra cómo empaquetar un modelo Keras junto con su `scaler.joblib` y publicarlo en Hugging Face con la pipeline `tabular-classification`. No debe confundirse con un modelo de lenguaje ni con un sistema apto para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) denso: Dense(8, ReLU) → Dense(15, softmax) |
| Parametros totales | 159 parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 2 características) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Keras (`model.keras`) + escalador `scaler.joblib` |
| Entrada | 2 características continuas (`x1`, `x2`) |
| Salida | 15 clases (probabilidades softmax; etiquetas 1–15) |
| Funcion de perdida | Sparse categorical cross-entropy |
| Optimizador | Adam (learning rate 0.01) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La red es un MLP de dos capas densas sin mecanismos de atención ni recurrencia: una capa oculta de 8 unidades con activación ReLU y una capa de salida de 15 unidades con softmax. El entrenamiento se realizó con Keras/TensorFlow, batch size 16, 100 épocas y un 20% del conjunto de entrenamiento reservado para validación. El preprocesado incluye un escalado de características ajustado únicamente sobre el split de entrenamiento y guardado como `scaler.joblib` para garantizar la coherencia en inferencia.

Los datos son 600 muestras sintéticas con dos características continuas y 15 clases balanceadas (40 muestras por clase, etiquetas reetiquetadas de 1–15 a 0–14 internamente). El split es estratificado 80/20: 384 muestras de entrenamiento, 96 de validación y 120 de test (8 por clase). No se emplearon técnicas de RLHF, DPO ni aumentación de datos; tampoco se documenta una exploración visual del conjunto, por lo que la separabilidad de las clases se infiere de los resultados.

## Capacidades

- Clasificación multiclase tabular de puntos bidimensionales en 15 categorías.
- Salida de probabilidades por clase mediante softmax (útil para umbrales o análisis de confianza).
- Integración con el ecosistema Keras/TensorFlow para carga y predicción.
- Pipeline de preprocesado reproducible mediante `scaler.joblib`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Docencia de fundamentos de redes neuronales: sirve para explicar el ciclo completo de entrenamiento, validación y test de un MLP con un conjunto controlado y resultados reproducibles.
- Demostración de empaquetado de modelos Keras en Hugging Face: ejemplifica cómo publicar un modelo junto con su escalador y metadatos de `model-index`.
- Práctica de evaluación con conjuntos pequeños: permite discutir intervalos de confianza (Clopper–Pearson) y el riesgo de sobreinterpretar un 100% de accuracy sobre 120 muestras.
- Referencia para pipelines de clasificación tabular con scikit-learn + Keras: el par `model.keras` + `scaler.joblib` se puede replicar en proyectos docentes similares.
- Prueba de integración de `hf_hub_download` y `keras.saving.load_model`: útil para validar flujos de descarga y carga de artefactos en entornos educativos.
- Ejemplo de matriz de confusión perfectamente diagonal: ilustra visualmente la separabilidad de clases en un problema sintético balanceado.
- No es adecuado para ningún caso de uso en producción, atención al cliente, generación de código ni análisis de datos reales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Split | Loss | Accuracy |
|---|---|---|
| Train (última época) | 0.0147 | 99.48% |
| Validación (última época) | 0.0163 | 100% (96/96) |
| Test | no disponible | 100% (120/120) |

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| tabular-classification | base-sintetica (held-out test split) | accuracy | 1.0 | no |

El autor advierte que, con 120 muestras de test, el intervalo de confianza de Clopper–Pearson al 95% solo garantiza una accuracy real de al menos aproximadamente el 97%, no el 100%.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 159 parámetros y los pesos ocupan unos pocos kilobytes.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Keras/TensorFlow en Python, con carga vía `keras.saving.load_model` y `joblib.load`; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (MLP educativos sobre datos sintéticos) en la información disponible.

## Limitaciones y advertencias

- Modelo educativo y de portafolio; el autor indica explícitamente que no está pensado para uso real.
- El conjunto de test es muy pequeño (120 muestras, 8 por clase), por lo que el 100% de accuracy no garantiza un rendimiento perfecto en datos nuevos.
- El dataset no fue explorado visualmente; la separabilidad de las clases se infiere de los resultados.
- No se documentan sesgos, pero al ser datos sintéticos y balanceados, no representa distribuciones reales.
- Riesgo de alucinación no aplicable: no es un modelo generativo de texto.
- Limitaciones de contexto e idioma no aplicables: la entrada son dos características numéricas.
- Licencia MIT: permite uso comercial y modificación, pero el propio autor desaconseja cualquier uso fuera del ámbito educativo.
- No debe integrarse en producción, sistemas de decisión automatizada ni pipelines reales de clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucasomac/mlp-synthetic-15-class
- Repositorio GitHub (código, notebooks y memoria): https://github.com/lucasomac0/ann-classification-machine-learning
- Paper en formato SBC (portugués): `docs/relatorio.pdf` dentro del repositorio de GitHub
