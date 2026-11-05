# MesserMMP/coronary-syntax-prediction

## Resumen

CardioSyntax v2 es un sistema de aprendizaje profundo para la predicción automática del SYNTAX score a partir de vídeos de angiografía coronaria. El SYNTAX score es una métrica clínicamente validada que cuantifica la complejidad anatómica de la enfermedad arterial coronaria, y su cálculo manual requiere revisión experta de múltiples proyecciones angiográficas. El modelo lo desarrolla el autor MesserMMP y se publica bajo licencia CC0-1.0 en HuggingFace, con un repositorio de 8,1 GB que incluye pesos en safetensors, código de entrenamiento e inferencia, y coeficientes de calibración.

La arquitectura combina un backbone 3D ResNet (R3D-18) que procesa cada proyección individual para estimar su contribución al SYNTAX score, y una cabeza recurrente (LSTM, GRU o Transformer) que agrega las contribuciones multi-vista para producir la puntuación final. El sistema se entrena con un esquema de validación cruzada de 5 folds, con modelos separados para arteria derecha e izquierda, y se distribuye como un ensemble de 10 modelos con calibración posterior. El autor reporta una correlación de Pearson de r ≈ 0,81 y una precisión balanceada de ≈ 82 % para la clasificación binaria SYNTAX > 22.

El interés actual del modelo reside en su enfoque multi-vista y multi-experto: el dataset asociado incluye 117 estudios de holdout con seis anotaciones expertas por estudio, lo que permite abordar la variabilidad inter-observador y estudiar el domain shift entre sistemas de imagen (Philips Allura Clarity, Azurion 7 y Siemens). Es relevante para investigadores en imagen médica cardiovascular que necesiten una línea base reproducible para estimación automática de complejidad lesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone 3D ResNet (R3D-18) + cabeza recurrente (LSTM/GRU/Transformer) para agregacion multi-vista |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision sobre video de angiografia, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo de imagen medica, sin capacidades linguisticas) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (backbone, full model, classifier y coeficientes de calibracion) |

## Arquitectura y entrenamiento

El sistema se estructura en dos etapas. El backbone R3D-18 procesa cada proyección angiográfica de forma independiente y produce una contribución al SYNTAX score; se entrena primero la cabeza de salida y después se ajusta finamente la red completa. La cabeza de agregación multi-vista (variantes LSTM con pooling medio, GRU o Transformer) recibe las contribuciones por proyección y genera la puntuación final; en esta etapa se congela inicialmente el backbone y después se ajusta el modelo completo. El entrenamiento usa dos salidas simultáneas (clasificación y regresión), selecciona el mejor checkpoint por RMSE de validación y emplea OneCycleLR con precisión bf16-mixed.

El esquema de entrenamiento cubre 5 folds y dos arterias (derecha e izquierda), generando diez modelos que se combinan en inferencia mediante ensemble con coeficientes de calibración (a, b) por fold. El dataset principal procede de los sistemas Philips Allura Clarity y Azurion 7, con un holdout de 117 estudios (97 Philips y 20 Siemens) y seis anotaciones expertas por estudio en el holdout. No se especifican en la información disponible el número de tokens ni la composición detallada del conjunto de entrenamiento; el repositorio incluye scripts de entrenamiento (`backbone/pl_train.py`, `full_model/rnn_train.py`) y de inferencia (`inference/rnn_apply.py`).

## Capacidades

- Predicción de SYNTAX score a partir de vídeos de angiografía coronaria, con salida de regresión continua y clasificación binaria (SYNTAX > 22).
- Procesamiento multi-vista: agregación de múltiples proyecciones angiográficas mediante cabeza recurrente.
- Clasificación de arteria (izquierda/derecha) mediante un clasificador R3D-18 independiente incluido en `classifier_weights/`.
- Ensemble de 5 folds × 2 arterias con calibración posterior para reducir sesgo sistemático.
- Evaluación con métricas de correlación (Pearson) y precisión balanceada, con visualización vía Plotly (`inference/metrics_visualization.py`).
- Entrenamiento reproducible con soporte para GPU única, múltiples GPU y CPU.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, ni procesamiento de lenguaje natural, audio o texto.

## Casos de uso

- **Triaje automatizado en cardiología intervencionista**: el modelo estima el SYNTAX score a partir del vídeo de angiografía antes de la revisión del equipo médico, permitiendo priorizar casos con complejidad anatómica elevada (SYNTAX > 22) para planificación de revascularización.
- **Segunda opinión cuantitativa en el laboratorio de hemodinámica**: el ensemble de 10 modelos (5 folds × 2 arterias) con calibración proporciona una estimación numérica reproducible que complementa la puntuación manual del operador y ayuda a reducir la variabilidad inter-observador.
- **Investigación en imagen cardiovascular**: el dataset y los pesos sirven como línea base reproducible para estudiar domain shift entre sistemas de imagen (Philips Allura Clarity, Azurion 7 y Siemens) y para desarrollar mejoras en agregación multi-vista.
- **Auditoría retrospectiva de cohortes**: procesamiento por lotes de estudios angiográficos archivados para correlacionar el SYNTAX score estimado con outcomes clínicos registrados, usando el script de inferencia en modo ensemble.
- **Validación de anotaciones expertas**: comparación de las seis anotaciones expertas por estudio del holdout con la predicción del modelo para identificar casos de alta discrepancia que requieran revisión adicional.
- **Formación y docencia**: uso del modelo y de las visualizaciones de métricas (`metrics_visualization.py`) para ilustrar la relación entre complejidad lesional y puntuación SYNTAX en sesiones formativas.
- **Desarrollo de pipelines de imagen médica**: integración de los módulos de backbone y cabeza RNN en pipelines propios de PyTorch/Lightning para experimentar con variantes de agregación (LSTM, GRU, Transformer).

## Benchmarks y rendimiento

| Metrica | Resultado reportado |
|---|---|
| Correlacion de Pearson (r) | ≈ 0,81 |
| Precision balanceada (SYNTAX > 22) | ≈ 82 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ni métricas adicionales como MAE, RMSE o AUC.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; el backbone es un R3D-18 (3D ResNet de 18 capas) y la cabeza es una RNN ligera, por lo que la huella es moderada, pero el repositorio de 8,1 GB incluye múltiples variantes de pesos (5 folds × 2 arterias × variantes de cabeza).
- **GPU recomendadas**: no especificadas por el autor; el entrenamiento documentado usa `--precision bf16-mixed` y permite seleccionar dispositivos con `--devices`. Por el tamaño del backbone, una GPU con al menos 16-24 GB de VRAM es razonable para entrenamiento con lotes pequeños (`-b 8` en el ejemplo de la cabeza RNN, `-b 50` en el backbone).
- **GPU de consumo**: no se confirma compatibilidad con GPU de consumo; el ejemplo de entrenamiento usa lotes pequeños y bf16, lo que sugiere que una RTX 4090 (24 GB) podría ser suficiente para inferencia y ajuste fino, pero no está documentado.
- **Opciones de despliegue**: PyTorch 2.0+ con CUDA, Lightning 2.x, torchvision y pytorchvideo; scripts CLI con `click`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de predicción automática de SYNTAX score con los que establecer una comparativa cuantitativa (parámetros, contexto, rendimiento, licencia y disponibilidad). La comparativa con alternativas de la misma categoría se indica como **no disponible**.

## Limitaciones y advertencias

- **Datos de entrenamiento limitados a dos fabricantes**: el cohorte principal procede de Philips Allura Clarity y Azurion 7, con un holdout que incluye solo 20 estudios Siemens; el domain shift hacia otros sistemas de imagen no está cuantificado en la información disponible.
- **Variabilidad inter-observador**: el propio autor reconoce la variabilidad entre expertos y la aborda con seis anotaciones por estudio en el holdout; la predicción del modelo no sustituye el juicio clínico.
- **Riesgo de alucinación en sentido amplio**: al ser un modelo de regresión sobre imagen, puede producir puntuaciones plausibles pero incorrectas en anatomías no representadas en el entrenamiento; no se reportan intervalos de incertidumbre por predicción.
- **Ausencia de validación clínica regulatoria**: no se indica certificación como dispositivo médico; el uso en decisiones clínicas requiere validación prospectiva independiente.
- **Licencia CC0-1.0**: permite uso comercial y modificación sin restricciones, pero ello no exime del cumplimiento de la normativa aplicable a datos médicos y dispositivos médicos (MDR/RGPD) en producción.
- **Sin soporte multilingüe ni de texto**: el modelo no procesa lenguaje natural; cualquier interfaz conversacional requeriría un componente adicional.
- **Calibración acoplada al ensemble**: los coeficientes de calibración suministrados corresponden al ensemble preentrenado; los modelos reentrenados necesitan su propia calibración, según advierte el autor.
- **Métricas limitadas**: solo se reportan correlación de Pearson y precisión balanceada; no hay MAE, RMSE, AUC ni análisis por subgrupos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MesserMMP/coronary-syntax-prediction
- Dataset card asociada: https://huggingface.co/datasets/MesserMMP/coronary-angiography-syntax
- Paper referenciado en los tags (arXiv:2407.19894): https://arxiv.org/abs/2407.19894
