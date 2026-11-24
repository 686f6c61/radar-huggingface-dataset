# Anvi15/student-performance-dnn

## Resumen

`student-performance-dnn` es una red neuronal densa (MLP) implementada en Keras 3 que predice el nivel de rendimiento académico de un estudiante a partir de variables demográficas, conductuales, sociales y de calificaciones previas del conocido *UCI Student Performance Dataset* (Cortez y Silva, 2008). Lo desarrolla Anvi Gogia, estudiante de ingeniería en la Universidad Chitkara, y se publica bajo licencia MIT. No es un modelo de lenguaje: es un clasificador tabular de tres clases (suspenso, aprobado, notable) entrenado sobre 649 registros del curso de portugués.

El interés del artefacto es fundamentalmente didáctico y metodológico. Con solo 4.547 parámetros entrenables, el autor documenta con detalle un pipeline de preprocesado libre de fuga de datos (`ColumnTransformer` ajustado solo sobre los splits de entrenamiento), regularización mediante dropout y L2, y una comparación honesta contra baselines de árboles (Random Forest y Gradient Boosting) que superan al MLP en exactitud. La model card explicita que el checkpoint desplegado corresponde a un esquema de 3 niveles y no a los resultados de un experimento anterior de 5 niveles.

Es relevante ahora como ejemplo reproducible de clasificación tabular con requisitos de cómputo triviales y como caso de estudio sobre uso responsable de atributos sensibles en educación. No compite en la categoría de modelos generativos ni de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso: Dense 64 (ReLU, He-normal, L2) → Dropout 0.15 → Dense 32 (ReLU, L2) → Dropout 0.10 → Dense 3 (Softmax) |
| Parametros totales | 4.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular fija de 36 características) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en safetensors de precisión nativa) |
| Idiomas soportados | no disponible (entrada numérica y categórica codificada; dataset original en portugués) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), `keras_config.json` y `student_dnn_model.keras` original |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa de dos capas ocultas (64 y 32 unidades) con activación ReLU e inicialización He-normal, seguido de una capa de salida softmax de 3 clases. La entrada son 36 características transformadas: 19 numéricas escaladas con `StandardScaler` y 17 categóricas codificadas con `OrdinalEncoder` y posterior escalado. Se incorporan características derivadas: `G_diff = G2 - G1`, `G_mean = (G1 + G2) / 2`, `total_alc = Dalc + Walc` y `parent_edu = max(Medu, Fedu)`, además de las notas brutas `G1` y `G2`.

El entrenamiento usa AdamW con learning rate `1e-3` y weight decay `1e-4`, pérdida *sparse categorical cross-entropy*, batch size 32 y un máximo de 120 épocas con *early stopping* (paciencia 20 sobre `val_loss`, restaurando los mejores pesos) y reducción del learning rate (factor 0.5, paciencia 6, mínimo `1e-5`). El split es estratificado 80/20 con semilla 42 y un 20 % adicional del conjunto de entrenamiento reservado para validación. Se omitió Batch Normalization de forma deliberada por el pequeño tamaño de los mini-batches y la naturaleza tabular de los datos, optando por dropout y L2. La clase `class_weight` se calculó pero no se aplicó en la ejecución final.

## Capacidades

- Clasificación tabular de tres niveles de rendimiento académico (suspenso 0–9, aprobado 10–13, notable 14–20) a partir de 36 características.
- Salida probabilística por clase (softmax), útil para priorizar intervenciones según riesgo.
- Generalización robusta a nivel de categoría adyacente: 100 % de acierto dentro de ±1 nivel en el conjunto de test.
- Inferencia determinista y de coste despreciable (4.547 parámetros), apta para ejecución en CPU.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- **Sistema de alerta temprana en centros educativos**: el modelo puede puntuar a cada estudiante al inicio del curso con `G1`, `G2` y variables de hábitos, generando una probabilidad de riesgo que oriente tutorías. Su coste de inferencia permite recalcular predicciones en cada actualización de notas.
- **Priorización de recursos de apoyo**: dado que la salida es una distribución de probabilidad sobre tres niveles, un equipo de orientación puede ordenar a los estudiantes por probabilidad de la clase 0 y asignar refuerzo a los casos de mayor riesgo.
- **Material docente para pipelines de ML tabular**: sirve como ejemplo completo y reproducible de preprocesado sin fuga de datos, exportación a safetensors e integración con Keras 3 en cursos de aprendizaje automático.
- **Prototipado de demos interactivas**: la model card menciona una demo en Streamlit; el modelo puede integrarse en un panel web ligero que permita a investigadores explorar el efecto de variables de entrada sobre la predicción.
- **Auditoría de sesgo en modelos educativos**: al exponer explícitamente atributos sensibles (sexo, estructura familiar, consumo de alcohol, ausencias), el modelo facilita ejercicios de análisis de equidad por subgrupos.
- **Comparación de baselines tabulares**: el artefacto incluye métricas frente a Random Forest y Gradient Boosting, lo que permite reproducir estudios sobre cuándo los árboles superan a un MLP en datasets pequeños.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado (n = 130 estudiantes), según `evaluation_metrics.json`:

| Metrica | DNN (este modelo) | Random Forest | Gradient Boosting |
|---|---:|---:|---:|
| Exactitud 3 niveles | 86,92 % | 90,77 % | 88,46 % |
| Acierto dentro de ±1 nivel | 100 % | 100 % | 100 % |
| Macro F1 | 0,8253 | 0,8805 | 0,8613 |
| Weighted F1 | 0,8631 | 0,9043 | 0,8828 |
| ROC-AUC (OvR) | 0,9290 | 0,9664 | 0,9677 |
| Pérdida de test | 0,4597 | — | — |

Los baselines de árboles superan al MLP en exactitud exacta y en AUC; el autor lo reconoce explícitamente en la model card.

## Requisitos de hardware

- **VRAM estimada**: inferior a 100 MB en cualquier configuración; el checkpoint safetensors ocupa unos pocos kilobytes (4.547 parámetros en float32 ≈ 18 KB).
- **GPU recomendadas**: no requiere GPU. Cualquier CPU moderna ejecuta la inferencia en milisegundos.
- **GPU de consumo**: cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque su uso es innecesario.
- **Opciones de despliegue**: Keras 3 / TensorFlow, `safetensors.numpy` para carga de pesos, ONNX tras conversión, o servicio ligero con FastAPI o Streamlit. No aplican vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no se han publicado cifras; por el tamaño del modelo se espera latencia sub-milisegundo en CPU y throughput de miles de predicciones por segundo por núcleo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Exactitud 3 niveles | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| student-performance-dnn (este) | 4.547 | 36 características tabulares | 86,92 % | MIT | Hugging Face |
| Random Forest (baseline del autor) | no disponible | 36 características tabulares | 90,77 % | no disponible | Repositorio del autor |
| Gradient Boosting (baseline del autor) | no disponible | 36 características tabulares | 88,46 % | no disponible | Repositorio del autor |
| Modelos de lenguaje de propósito general | miles de millones | miles de tokens | no aplica | variable | Hugging Face |

No se identifican en la información disponible otros modelos publicados específicamente sobre el *UCI Student Performance Dataset* con los que comparar de forma directa.

## Limitaciones y advertencias

- **Generalización no verificada**: entrenado con 649 registros de una única cohorte de portugués; su comportamiento en otras instituciones, idiomas o periodos temporales es desconocido.
- **Rendimiento inferior a baselines**: los árboles superan al MLP en exactitud exacta (90,77 % frente a 86,92 %), por lo que su elección frente a un Random Forest debe justificarse.
- **Atributos sensibles como entrada**: sexo, estructura familiar, consumo de alcohol y ausencias forman parte de las características; es obligatorio auditar el rendimiento por subgrupos y ofrecer vías de apelación u opt-out.
- **Riesgo de uso indebido**: las predicciones son probabilísticas y no deben usarse como base única para calificaciones, admisiones o decisiones disciplinarias; el modelo estima bandas históricas de notas, no talento ni potencial futuro.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente fuera de la distribución de entrenamiento.
- **Licencia**: MIT permite uso comercial y modificación con atribución; no obstante, el cumplimiento normativo en materia de protección de datos (RGPD, categorías especiales) recae en el desplegador.
- **Ausencia de contexto conversacional**: al ser un clasificador tabular, no admite prompts ni instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anvi15/student-performance-dnn
- Repositorio del autor (pipeline, EDA, baselines y demo Streamlit): https://github.com/Anvi-g
- Dataset original UCI Student Performance (Cortez y Silva, 2008): https://archive.ics.uci.edu/dataset/320/student+performance
- Documentación de Keras 3: https://keras.io/
- Formato safetensors: https://github.com/huggingface/safetensors
