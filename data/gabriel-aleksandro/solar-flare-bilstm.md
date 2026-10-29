# gabriel-aleksandro/solar-flare-bilstm

## Resumen

Solar-flare-bilstm es un clasificador binario de series temporales diseñado para predecir erupciones solares (FL, flare, frente a NF, no flare) a partir de ventanas de 60 pasos temporales y 18 parámetros magnéticos SHARP extraídos de magnetogramas del instrumento SDO/HMI. Lo desarrolla gabriel-aleksandro en el marco de un proyecto de iniciación científica PIBIC/CNPq en la UNICAMP (Brasil), y se publica en HuggingFace con licencia MIT.

No es un modelo de lenguaje: se trata de una red recurrente bidireccional (biLSTM de 2 capas y 128 unidades ocultas) con atención aditiva de Bahdanau y un decodificador denso que produce una probabilidad de erupción en el intervalo [0, 1]. El modelo publicado es un ensamble de 5 pliegues entrenados con GroupKFold por HARPNUM sobre el conjunto de datos SWAN-SF (~316.000 ventanas), lo que evita la fuga de datos entre regiones activas.

Su relevancia es acotada pero concreta: sirve como línea base reproducible para investigación en meteorología espacial y como ejemplo de buenas prácticas de validación (hold-out previo a la validación cruzada, umbral optimizado por TSS, selección de checkpoint por pérdida de validación). El autor declara un TSS de 0,78 sobre el hold-out del ensamble, un valor no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | biLSTM (encoder bidireccional, 2 capas, hidden=128) + atención aditiva (Bahdanau) + decodificador denso (256→128→64→1 con ReLU, dropout 0,4 y sigmoide) |
| Parametros totales | no disponible (no declarado por el autor; arquitectura compacta de 128 unidades ocultas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana fija de 60 pasos temporales (T=60), con 18 características por paso; las series más cortas se rellenan (padding) hasta 60 |
| Tipos de cuantizacion | no disponible (los checkpoints se cargan en PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no procesa lenguaje natural; la documentación y las etiquetas están en inglés (en) |
| Licencia | MIT |
| Formato de pesos | checkpoints de PyTorch (`.pt`, p. ej. `models/fold_1_best.pt`) con `model_state`; incluye `scaler.pkl` para la normalización Z-score |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder con atención: la entrada `(batch, 60, 18)` pasa por una biLSTM de 128 unidades y 2 capas; la atención aditiva de Bahdanau se aplica sobre los 60 pasos temporales y genera un vector de contexto de dimensión 256, que alimenta un decodificador MLP (256→128→64→1) con ReLU, dropout de 0,4 y activación sigmoide. La salida es una probabilidad de erupción y, opcionalmente, el vector de pesos de atención por paso temporal, lo que aporta interpretabilidad sobre qué instantes de la serie pesan más en la decisión.

El entrenamiento usa el dataset SWAN-SF (5 particiones de Harvard Dataverse), con etiquetas FL (erupción ≥ M1 en 24 h) y NF. El preprocesado incluye filtro `QUALITY == 0`, imputación KNN con selección de vecinos basada en correlación de Pearson y normalización Z-score ajustada solo sobre el conjunto de entrenamiento. La partición es 70/15/15 por HARPNUM (train/val/hold-out) antes de cualquier validación cruzada, y después se aplica un GroupKFold de 5 pliegues estratificado por HARPNUM para evitar fugas entre regiones activas. Hiperparámetros: AdamW con lr 3e-4 y weight decay 1e-4, batch de 256, tope de peso de clase positiva de 12, checkpoints intra-epoch cada 100 batches y paciencia de 8 checkpoints, selección del mejor checkpoint por pérdida de validación. El umbral de decisión (0,45) se obtiene por búsqueda en rejilla sobre el conjunto de validación maximizando TSS, en lugar del 0,5 por defecto, dado el fuerte desbalanceo (FL ≈ 10-15 % de las muestras). El ensamble promedia las probabilidades de los 5 pliegues.

## Capacidades

- Clasificación binaria de series temporales de parámetros magnéticos SHARP: devuelve probabilidad de erupción en [0, 1] y etiqueta FL/NF.
- Procesamiento de ventanas de 60 pasos temporales con 18 características en un orden fijo y preestablecido (USFLUX, MEANGAM, MEANGBT, MEANGBZ, MEANGBH, MEANJZD, MEANALP, MEANJZH, TOTUSJH, TOTPOT, TOTUSJZ, ABSNJZH, SAVNCPP, R_VALUE, TOTBSQ, TOTFZ, MEANPOT, MEANSHR).
- Atención interpretable: devuelve pesos de atención por paso temporal, útil para analizar qué parte de la ventana domina la predicción.
- Ensemble de 5 modelos con umbral calibrado (0,45) para compensar el desbalanceo de clases.
- Robustez al formato de entrada: acepta series de longitud T ≥ 1 y aplica padding hasta 60; recorte automático de valores a [-10, 10].
- Interfaz de línea de comandos (`predict.py`) para puntuar ficheros CSV con las 18 columnas SHARP.
- Reutilización del encoder biLSTM como base de transferencia para predicción de CME (según el autor, en un repositorio companion).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Investigación en meteorología espacial: estimar la probabilidad de una erupción ≥ M1 en las 24 horas siguientes a partir de una ventana de parámetros SHARP, como entrada para estudios de riesgo de clima espacial.
- Línea base reproducible para artículos que usan SWAN-SF: el código y la partición por HARPNUM permiten comparar nuevas arquitecturas bajo el mismo protocolo de validación sin fuga de datos.
- Análisis de atribución temporal: usar los pesos de atención para identificar en qué momentos de la ventana de 60 pasos se concentra la señal magnética asociada a la erupción.
- Aprendizaje por transferencia: inicializar un encoder biLSTM para tareas relacionadas (por ejemplo, predicción de eyecciones de masa coronal) cuando se dispone de pocos datos etiquetados.
- Docencia y prototipado en cursos de deep learning aplicado a ciencia: el repositorio es pequeño, se ejecuta en CPU y cubre el ciclo completo (imputación, normalización, GroupKFold, umbral por TSS).
- Exploración de umbrales operativos: recalibrar el umbral de decisión sobre datos propios para ajustar el equilibrio entre falsos positivos y falsos negativos según el coste del escenario.
- Filtrado previo en pipelines de análisis de datos de SDO/HMI: descartar regiones activas de bajo riesgo antes de un análisis más costoso.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Notas |
|---|---|---|---|---|
| Clasificación binaria de erupciones solares (FL/NF) | SWAN-SF | TSS (True Skill Statistic) | 0,78 | Hold-out ensemble; resultado declarado por el autor, no verificado de forma independiente (`verified: false`) |

No se han publicado en la información disponible resultados adicionales (por ejemplo, TPR, FPR, AUC, HSS o F1) ni comparaciones con otros modelos del mismo benchmark. No aplican métricas de lenguaje como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por la arquitectura (biLSTM de 128 unidades, 2 capas, ventana de 60×18 y MLP de 256→128→64→1) el modelo es de tamaño muy reducido y cabe holgadamente en cualquier GPU consumer, incluso en CPU. No se publican cifras de memoria.
- GPU recomendadas: no se especifican. Cualquier GPU con soporte CUDA (por ejemplo, GTX 1060 o superior, RTX 3060/4090, A100/H100) es sobredimensionada para la inferencia; la CPU es suficiente para uso individual.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella real es la carga de los 5 checkpoints y el preprocesado, no la memoria.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `model.eval()`), el script `predict.py` incluido y su interfaz CLI. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo); para servicio HTTP habría que envolverlo con FastAPI o similar.
- Latencia y throughput: no disponibles. La arquitectura es del orden de cientos de miles de operaciones por ventana, por lo que la latencia esperada es de milisegundos en CPU y menor en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| solar-flare-bilstm (este modelo) | no disponible | 60 pasos × 18 features SHARP | TSS 0,78 (hold-out ensemble, no verificado) | MIT | Pesos en HuggingFace; el tamano del repo figura como 0.0 GB, conviene comprobar que los checkpoints estan subidos |
| BiLSTM / LSTM sin atención sobre SWAN-SF (baselines de la literatura) | no disponible | ventanas de parámetros SHARP | no disponible | variable | no disponible |
| CNN-LSTM y modelos de ML clásico (RF, SVM) sobre SWAN-SF | no disponible | ventanas de parámetros SHARP | no disponible | variable | no disponible |

No se dispone de datos verificables de parámetros, contexto ni métricas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La categoría comparable es la de clasificadores de series temporales de física solar entrenados sobre SWAN-SF.

## Limitaciones y advertencias

- El propio autor indica que el modelo no ha sido validado en un entorno operativo: no debe usarse para alertas en tiempo real sin una validación independiente.
- El TSS de 0,78 está declarado por el autor y marcado como no verificado; no hay evaluación de terceros ni código de reproducción de resultados en la información disponible.
- Fuera de alcance: cualquier tarea de series temporales distinta de los parámetros magnéticos solares; el modelo no procesa texto, imagen ni audio.
- Dependencia estricta del formato de entrada: orden exacto de las 18 características SHARP, normalización Z-score con el `scaler.pkl` del entrenamiento y recorte a [-10, 10]. Un orden distinto produce predicciones silenciosamente inválidas.
- Fuerte desbalanceo de clases (FL ≈ 10-15 %); el umbral 0,45 está optimizado para TSS en la validación del autor y puede no ser adecuado para otros regímenes de coste o prevalencia.
- Sesgo de dominio: SWAN-SF cubre regiones activas y un periodo concretos de observaciones SDO/HMI; el rendimiento fuera de esa distribución (otro ciclo solar, otro instrumento) no está caracterizado.
- El tamaño del repositorio figura como 0.0 GB y las descargas son 0, por lo que la disponibilidad efectiva de los cinco checkpoints debe comprobarse antes de integrar el modelo.
- La model card está truncada en la sección de procedimiento de entrenamiento ("Grid search ove"), lo que limita la reproducibilidad exacta del umbral y de la selección de checkpoints.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantía; aun así, el uso comercial en contextos críticos (aviación, satélites, redes eléctricas) requiere validación propia y no está respaldado por el autor.
- No hay soporte multilingüe ni pipeline declarado en HuggingFace (`pipeline: no disponible`), lo que complica el uso con `transformers`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos con probabilidades mal calibradas fuera del conjunto de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabriel-aleksandro/solar-flare-bilstm
- Dataset SWAN-SF (Harvard Dataverse): no disponible en la información proporcionada (el autor lo referencia sin URL)
- Repositorio companion para predicción de CME: no disponible en la información proporcionada (mencionado sin enlace)
- Paper o publicación asociada: no disponible en la información proporcionada
- Demo o espacio de HuggingFace: no disponible
- Los resultados de la búsqueda web realizada no guardan relación con el modelo (referencias al nombre propio "Gabriel") y se descartan como fuentes.
