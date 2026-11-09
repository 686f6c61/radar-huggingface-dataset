# fse/bekko-civil-comments-toxicity-classifier

## Resumen

`fse/bekko-civil-comments-toxicity-classifier` es un clasificador multilabel de toxicidad en ingles creado por el usuario `fse`. No es un modelo generativo ni un transformer entrenado de extremo a extremo: es una cabeza lineal afin (regresion logistica multietiqueta) montada sobre el encoder congelado `hotchpotch/bekko-static-embedding-v1`. El artefacto resultante tiene solo 2.214.145 parametros y se distribuye en formato `safetensors` para la libreria `fse`. Predice dos etiquetas, `toxicity` e `insult`, en ese orden.

El modelo resuelve un problema acotado y muy especifico: la deteccion automatica de comentarios toxicos e insultantes en discusiones de noticias en linea, usando como referencia el corpus historico Civil Comments. Se entrena exclusivamente sobre ese dataset y se evalua una unica vez sobre su split oficial de test (97.320 filas), con metricas de ROC AUC en torno a 0,88-0,90 por etiqueta.

Su relevancia es practica mas que arquitectonica: demuestra que un clasificador lineal sobre embeddings estaticos congelados, con un pipeline de seleccion documentado y trazable, alcanza resultados razonables para triaje asistido por humanos. Es util para quien busque un componente ligero, barato de ejecutar y con licencia MIT para prefiltrar contenido, no para quien necesite un detector de toxicidad de ultima generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza lineal afin (SGDClassifier con log_loss) sobre encoder congelado de embeddings estaticos |
| Parametros totales | 2.214.145 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (encoder estatico, sin ventana de atencion declarada) |
| Tipos de cuantizacion | 8-bit (tag del repositorio); pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (cabeza y encoder); datos fuente CC0-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado. El encoder `hotchpotch/bekko-static-embedding-v1` (revision `c18167b8f244c1bc6de21ce9b710bac8a29c4615`, `normalize=False`) permanece congelado y solo se entrena la cabeza. Sobre los vectores del encoder se ajusta un `StandardScaler` de forma incremental, exclusivamente con las estadisticas del split de entrenamiento, y la matriz estandarizada en float32 se procesa por lotes de 8.192. La cabeza consta de seis estimadores `SGDClassifier` independientes con `log_loss`, regularizacion L2, learning rate con escalado inverso (`eta0=0.01`, `power_t=0.5`), coeficientes promediados, semilla 17 y pesos de clase balanceados `N/(2 * class_count)`.

El entrenamiento usa 1.804.874 filas de Civil Comments (revision `f2970eb3a55777454c94069077cc8d9b5866312d`) durante exactamente tres epocas completas. Las etiquetas originales son fracciones de anotadores, binarizadas con umbral >= 0,5. El hiperparametro `alpha` seleccionado es 5.5405529693485529e-07, derivado de `alpha=1/(C*N)` con C en {0.1, 1, 10}; un empate exacto entre C=1 y C=10 se resolvio a favor del alpha mayor. La seleccion se hizo unicamente sobre el split de validacion, comparando el macro ROC AUC de la cabeza completa de seis etiquetas (0,926405) frente a la cabeza pequena de Bekko (0,910239), una mejora de 0,016166 que supera el umbral predeclarado de reemplazo de 0,01.

Tras la validacion, el autor conservo solo los estimadores `toxicity` e `insult` ya ajustados, sin reentrenamiento ni nueva seleccion de alpha. Los umbrales de decision se optimizaron por F1 sobre validacion y se congelaron antes del test: `toxicity` = 0,78959250450134277 e `insult` = 0,8461187481880188, con inferencia estricta `score > cutoff`. Las etiquetas `obscene`, `threat`, `identity_attack` y `sexual_explicit` se descartaron por rendimiento inferior en validacion; `severe_toxicity` se elimino antes de la seleccion porque solo 13 de 1.804.874 filas de entrenamiento eran positivas.

## Capacidades

- Clasificacion multilabel de texto en ingles para las etiquetas `toxicity` e `insult`, con salida de probabilidades (`predict_proba`) y mascaras binarias (`predict`).
- Deteccion de insultos y lenguaje toxico en comentarios de discusion tipo foro de noticias.
- Exposicion de `classes_` para inspeccionar el orden de las etiquetas.
- Ejecucion como cabeza lineal sobre embeddings estaticos, sin generacion de texto ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Soporte multilingue limitado al ingles; otros idiomas no fueron evaluados.
- No incorpora vision, audio ni modo de pensamiento.
- No emite las cinco etiquetas descartadas (`obscene`, `threat`, `identity_attack`, `sexual_explicit`, `severe_toxicity`).

## Casos de uso

- Moderacion asistida de comentarios en foros de noticias: el clasificador prefiltras comentarios con `predict_proba` y aplica los umbrales almacenados para marcar candidatos a revision humana, reduciendo el volumen de texto que llega a los moderadores.
- Triaje de colas de soporte y feedback de producto: se puede integrar en pipelines de ingesta para etiquetar mensajes de usuarios como potencialmente toxicos o insultantes antes de asignarlos a agentes humanos.
- Investigacion academica sobre toxicidad en linea: sirve como baseline reproducible sobre Civil Comments, con metricas de test documentadas y revisiones de dataset y encoder fijadas.
- Filtrado previo en datasets de entrenamiento: permite descartar o marcar filas toxicas antes de usarlas en otros modelos, dado su bajo coste computacional.
- Sistemas de alerta temprana en comunidades: combinado con reglas de negocio, dispara revisiones cuando la puntuacion supera los cutoffs congelados, sin depender de un LLM generativo.
- Evaluacion comparativa de encoders: util para medir si un encoder estatico congelado con cabeza lineal basta para una tarea concreta antes de invertir en un modelo mayor.
- Componente de bajo coste en entornos con recursos limitados: al ser una cabeza lineal de 2,2 millones de parametros sobre embeddings estaticos, el coste de inferencia es minimo comparado con transformers generativos.

## Benchmarks y rendimiento

Resultados del test oficial (97.320 filas), con umbrales congelados antes de la evaluacion:

| Etiqueta | Positivos | ROC AUC | AP | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|
| toxicity | 7777 | 0,883407 | 0,447505 | 0,412795 | 0,557541 | 0,474372 |
| insult | 5776 | 0,904925 | 0,449595 | 0,436526 | 0,523892 | 0,476235 |
| Macro | | 0,894166 | 0,448550 | 0,424661 | 0,540717 | 0,475304 |

Resultados de validacion de la cabeza completa de seis etiquetas, usados para la seleccion:

| Etiqueta | Positivos | ROC AUC | AP | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|
| toxicity | 7671 | 0,883862 | 0,452638 | 0,408919 | 0,563030 | 0,473756 |
| obscene | 525 | 0,905140 | 0,140071 | 0,168328 | 0,289524 | 0,212885 |
| threat | 224 | 0,950650 | 0,086428 | 0,140436 | 0,258929 | 0,182104 |
| insult | 5769 | 0,902546 | 0,454770 | 0,435791 | 0,527648 | 0,477340 |
| identity_attack | 664 | 0,953641 | 0,150269 | 0,177180 | 0,486446 | 0,259751 |
| sexual_explicit | 201 | 0,962589 | 0,106585 | 0,148438 | 0,283582 | 0,194872 |
| Macro | | 0,926405 | 0,231794 | 0,246515 | 0,401526 | 0,300118 |

No se han publicado resultados comparativos frente a otros modelos de toxicidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima, dado que la cabeza tiene 2,2 millones de parametros y el encoder es estatico; el cuello de botella es el encoder, no la cabeza.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecucion ligera y no se han publicado requisitos de GPU.
- Cabe en GPU consumer y en CPU; no se especifican modelos concretos.
- Opciones de despliegue: libreria `fse` (requiere build master con soporte multilabel o `fse` 2.1; `fse` 2.0.0 no puede cargar el artefacto). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se han publicado mediciones de velocidad ni comparaciones en Linux.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks de otros clasificadores de toxicidad comparables, ni datos de rendimiento de alternativas como para establecer una comparacion fiable.

## Limitaciones y advertencias

- Uso previsto exclusivamente para triaje asistido e investigacion con revision humana; no sustituye la moderacion humana.
- Solo ingles; otros idiomas, dominios y usos actuales no fueron evaluados.
- Los embeddings estaticos pueden perder contexto, negacion, citas e intencion, lo que limita la precision en casos sutiles.
- Sesgo relacionado con identidad: el propio corpus Civil Comments tiene preocupaciones documentadas al respecto (arXiv:1903.04561); no se midieron metricas por subgrupo identitario.
- Las puntuaciones no son probabilidades calibradas de toxicidad ni de acuerdo entre anotadores; no se realizo ningun estudio de calibracion.
- Los umbrales se optimizaron sobre el mismo split de validacion usado para la seleccion, por lo que no son estimaciones independientes.
- El modelo no emite las etiquetas `obscene`, `threat`, `identity_attack`, `sexual_explicit` ni `severe_toxicity`.
- No establece legalidad ni dano real del contenido; es un clasificador, no un dictamen.
- Restricciones de licencia: MIT para cabeza y encoder, CC0-1.0 para los datos fuente; no se documentan restricciones adicionales para uso comercial.
- `fse` 2.0.0 no puede cargar el artefacto; se requiere build master con soporte multilabel o `fse` 2.1.
- No se han publicado mediciones de latencia, throughput ni comparaciones de velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/bekko-civil-comments-toxicity-classifier
- Modelo base (encoder): https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Targets del dataset (TensorFlow Datasets): https://www.tensorflow.org/datasets/catalog/civil_comments
- Paper sobre sesgo en Civil Comments: https://arxiv.org/abs/1903.04561
