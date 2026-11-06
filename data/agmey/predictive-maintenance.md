# agmey/predictive-maintenance

## Resumen

Predictive Maintenance — Pocket Perceptron es un clasificador binario tabular desarrollado por el usuario agmey y publicado en Hugging Face. El modelo se entrenó en C++ implementando el algoritmo Pocket Perceptron sobre el conjunto de datos AI4I 2020 Predictive Maintenance Dataset, y posteriormente se exportó a formato ONNX para su despliegue mediante ONNX Runtime. La tarea que resuelve es la predicción de fallo de maquinaria industrial a partir de ocho variables de sensores y tipo de máquina.

Se trata de un modelo extremadamente ligero, de tipo perceptron lineal (sin capas ocultas ni mecanismos de atención), orientado exclusivamente a clasificación tabular. No es un modelo de lenguaje: no procesa texto, no genera contenido y no dispone de ventana de contexto en el sentido habitual de los transformers. Su relevancia es fundamentalmente didáctica: el autor lo presenta explícitamente como una demostración educativa de despliegue (C++ → ONNX Runtime → API REST de Datasance), no como un sistema listo para producción.

El modelo recibe un tensor FP64 de forma `[N, 8]` y devuelve un tensor INT64 de forma `[N, 1]` con etiquetas `+1` (fallo) o `-1` (funcionamiento normal). Las ocho características son tres valores one-hot del tipo de máquina (L, M, H), temperatura del aire, temperatura del proceso, velocidad rotacional, par de torsión y desgaste de la herramienta. Las variables numéricas deben estandarizarse con el `scaler.json` incluido antes de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron lineal (Pocket Perceptron), sin capas ocultas |
| Parametros totales | no disponible (perceptron de 8 entradas; orden de decenas de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (exportado en FP64 para entrada; pesos en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

Especificaciones adicionales de interfaz:

| Parametro | Valor |
|---|---|
| Entrada | `X`, tensor FP64 de forma `[N, 8]` |
| Salida | `Y`, tensor INT64 de forma `[N, 1]` |
| Etiquetas | `+1` = fallo de máquina, `-1` = funcionamiento normal |
| Preprocesado requerido | Estandarización numérica con `scaler.json` |
| Librería | ONNX (ONNX Runtime) |
| Pipeline | tabular-classification |
| Tamaño del repositorio | 0.0 GB |
| Configuración de despliegue | `config.pbtxt` para Datasance ONNX inference engine |

## Arquitectura y entrenamiento

La arquitectura es un perceptron lineal binario, un clasificador de un solo nivel que aprende un hiperplano de separación en el espacio de ocho características de entrada. No emplea transformers, capas convolucionales, mecanismos de atención ni estados recurrentes. El algoritmo de entrenamiento es el Pocket Perceptron, una variante del perceptron clásico que conserva el mejor conjunto de pesos visto durante el entrenamiento (el que minimiza errores sobre el conjunto de validación), lo que aporta cierta robustez frente a actualizaciones que empeoran el clasificador.

El entrenamiento se realizó en C++ sobre el AI4I 2020 Predictive Maintenance Dataset. No se especifica en la información disponible el número de épocas, la tasa de aprendizaje, el tamaño del conjunto de entrenamiento ni si se aplicaron técnicas de regularización o balanceo de clases. Tampoco se documenta el uso de RLHF, DPO ni ningún proceso de ajuste fino posterior, algo esperable dado el tipo de modelo. La innovación técnica destacable es la cadena de despliegue: implementación del algoritmo en C++, exportación a ONNX y servicio mediante ONNX Runtime con configuración para el motor de inferencia Datasance.

## Capacidades

- Clasificación binaria tabular: distingue entre fallo de máquina (`+1`) y funcionamiento normal (`-1`) a partir de ocho variables.
- Procesamiento de características mixtas: combina tres variables categóricas codificadas en one-hot (tipo de máquina L, M, H) con cinco variables numéricas continuas (temperatura del aire, temperatura del proceso, velocidad rotacional, par de torsión y desgaste de la herramienta).
- Inferencia por lotes: la forma de entrada `[N, 8]` permite evaluar múltiples observaciones en una sola llamada.
- Despliegue ligero: exportación ONNX compatible con ONNX Runtime y con el motor de inferencia Datasance.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión, audio ni ninguna modalidad distinta de la tabular.

## Casos de uso

- Demostración educativa de despliegue ONNX: el modelo sirve para ilustrar el flujo completo desde un algoritmo implementado en C++ hasta un endpoint REST de inferencia, adecuado en cursos y talleres sobre MLOps.
- Clasificación de lecturas de sensores en entornos de laboratorio: con datos previamente estandarizados mediante `scaler.json`, se puede evaluar el estado de una máquina a partir de sus ocho variables en pruebas controladas.
- Integración en pipelines de CI/CD como modelo de referencia: al ser un artefacto ONNX pequeño, permite validar cadenas de build, test y despliegue de modelos sin coste computacional relevante.
- Pruebas de integración del motor Datasance: el `config.pbtxt` incluido facilita verificar la configuración del motor de inferencia ONNX con un modelo real y ligero.
- Benchmarking de latencia de infraestructura: su tamaño mínimo permite medir el overhead de la capa de servicio (ONNX Runtime, API REST) sin que el cómputo del modelo domine la medición.
- Prototipado de interfaces de mantenimiento predictivo: puede usarse como sustituto provisional en el desarrollo de paneles o APIs de monitorización antes de sustituirlo por un modelo en producción.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 2.000 observaciones reservadas:

| Metrica | Resultado |
|---|---:|
| Accuracy | 97,15 % |
| Precision | 70,37 % |
| Recall | 27,94 % |
| F1 score | 40,00 % |

No se han publicado comparaciones con otros modelos en la información disponible. La lectura de estas métricas debe hacerse con cautela: la accuracy elevada convive con un recall bajo (27,94 %), lo que indica que el modelo deja pasar una proporción importante de fallos reales, comportamiento coherente con un clasificador lineal sobre un problema desbalanceado.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable (modelo de decenas de pesos en ONNX); cualquier GPU con unos pocos MB libres es suficiente.
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalización relevante. Cualquier GPU (A100, H100, RTX 4090, GTX serie 10 o superior) puede ejecutarlo, pero es sobredimensionada para la carga.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (CPU, dispositivos embebidos, contenedores de bajo consumo).
- Opciones de despliegue: ONNX Runtime (principal), motor de inferencia Datasance mediante `config.pbtxt`, y cualquier runtime compatible con ONNX. No aplica llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo, se espera latencia dominada por el overhead de la capa de servicio más que por el cómputo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa de la categoría, se indican alternativas genéricas de clasificación tabular que podrían cubrir la misma tarea, sin datos de rendimiento comparativo verificados:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agmey/predictive-maintenance | Perceptron lineal (ONNX) | Decenas de pesos | no aplica | no disponible | Hugging Face |
| Regresión logística (scikit-learn) | Lineal | Similar | no aplica | BSD | Amplia |
| XGBoost / LightGBM | Árboles potenciados | Variable | no aplica | Apache 2.0 / MIT | Amplia |
| Random Forest (scikit-learn) | Ensamble de árboles | Variable | no aplica | BSD | Amplia |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es una demostración educativa de despliegue y no un sistema de mantenimiento predictivo listo para producción.
- Recall bajo (27,94 %): el modelo pierde una fracción significativa de los fallos reales, lo que es crítico en mantenimiento predictivo, donde los falsos negativos suelen tener coste elevado.
- F1 de 40,00 % y precision de 70,37 %: el equilibrio entre precisión y exhaustividad es limitado, coherente con un clasificador lineal sobre datos probablemente desbalanceados.
- Sesgos conocidos: no documentados. Al entrenarse únicamente con el AI4I 2020, el modelo puede no generalizar a maquinaria, sensores o rangos operativos distintos de los del dataset.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Dependencia estricta del preprocesado: requiere estandarización con el `scaler.json` incluido; omitirla o usar otro escalador invalida las predicciones.
- Orden de características fijo: las ocho columnas deben respetar el orden documentado (one-hot L, M, H; temperatura del aire; temperatura del proceso; velocidad rotacional; par; desgaste).
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no aplicables: el modelo no procesa lenguaje natural.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agmey/predictive-maintenance
- Dataset AI4I 2020 Predictive Maintenance (referenciado por el autor): no se proporciona enlace directo en la información disponible
- ONNX Runtime: no se proporciona enlace en la información disponible
- Motor de inferencia Datasance: no se proporciona enlace en la información disponible
- Repositorio del proyecto fuente (C++ Pocket PLA): no se proporciona enlace en la información disponible
