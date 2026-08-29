# HassanB4/warfarisk-autogluon-6256

## Resumen

WarfaRisk es un pipeline reproducible de nueve fases para la predicción de la dosis de mantenimiento de warfarina, desarrollado por un equipo de la Universidad de Alfaisal (Riad) junto con otras instituciones saudíes. Este modelo concreto, `warfarisk-autogluon-6256`, es el ganador de la fase 3 de ese pipeline: un predictor tabular de AutoGluon entrenado con el preset `extreme_quality` sobre la cohorte IWPC-6256 del Consorcio Internacional de Farmacogenética de Warfarina (IWPC). El modelo combina características clínicas (edad, peso, altura, indicaciones, comorbilidades, comedicaciones) con genotipos de CYP2C9 y VKORC1 para estimar la dosis semanal estable en miligramos.

El problema que resuelve es la dosificación inicial de warfarina, un fármaco con un estrecho margen terapéutico y alta variabilidad interindividual. La relevancia actual radica en que la farmacogenómica aplicada a la anticoagulación sigue siendo un área activa de investigación, y este modelo demuestra que un ensemble automatizado puede superar a arquitecturas individuales como TabPFN o CatBoost en esta tarea específica. El modelo es un artefacto de investigación, no una herramienta clínica validada, y se distribuye bajo licencia Apache 2.0. El repositorio tiene un tamaño de 0,2 GB y está pensado para ser cargado con AutoGluon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoGluon `TabularPredictor` con preset `extreme_quality` (ensemble ponderado, componente final `RealTabPFN-v2_c1`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no de texto) |
| Tipos de cuantizacion | no disponible (no se especifica cuantización para modelos tabulares) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (AutoGluon guarda en formato propio, probablemente pickle/Joblib) |

## Arquitectura y entrenamiento

El modelo es un `TabularPredictor` de AutoGluon ajustado con el preset `extreme_quality`, que internamente entrena y combina múltiples algoritmos de aprendizaje automático (modelos lineales, árboles, redes neuronales, etc.) mediante un ensemble ponderado. En este caso, el ensemble final (`WeightedEnsemble_L2`) asignó peso 1.0 al modelo `RealTabPFN-v2_c1`, un componente basado en TabPFN. Se excluyeron los tipos de modelo `TABDPT`, `TABICL`, `TABM` y `MITRA` porque en un primer intento `TABDPT` excedió su tiempo asignado en más de 15 minutos sin posibilidad de interrupción.

El entrenamiento se realizó sobre la cohorte IWPC-6256, con 4.830 muestras de entrenamiento y 1.207 de test (split 80/20 a nivel de paciente, semilla `20260725`). Se usó el conjunto de características combinado (clínicas + genotipos CYP2C9/VKORC1). El tiempo límite fue de 600 segundos. Se realizó una auditoría de fugas de datos que pasó 11 de 11 comprobaciones. No se aplicó RLHF ni DPO; es un problema de regresión supervisada estándar.

## Capacidades

- Predicción de la dosis semanal estable de warfarina (en mg/semana) a partir de datos tabulares clínicos y genéticos.
- Regresión tabular con soporte para variables categóricas y numéricas mixtas (edad en bandas, peso, altura, indicaciones, comorbilidades, comedications, genotipos).
- Manejo de características farmacogenómicas: alelos CYP2C9 (consenso de star-allele) y VKORC1 -1639 (rs9923231).
- Ensemble automático: AutoGluon combina múltiples algoritmos y selecciona el mejor peso para cada componente.
- No es un modelo generativo: no genera texto, código ni tiene capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Apoyo a la decisión clínica en la dosificación inicial de warfarina: el modelo puede estimar una dosis inicial basada en características del paciente, ayudando a reducir el tiempo de ajuste y el riesgo de eventos adversos. Es adecuado porque integra variables genéticas y clínicas en un solo predictor.
- Investigación farmacogenómica: permite comparar el rendimiento de diferentes arquitecturas (AutoGluon vs. TabPFN, CatBoost, etc.) sobre la cohorte IWPC, sirviendo como referencia para estudios de validación externa.
- Educación y formación en ML aplicado a salud: el repositorio incluye código reproducible y documentación de las nueve fases, útil para enseñar pipelines de ML en entornos sanitarios.
- Benchmarking de modelos tabulares: los resultados publicados (MAE 8.552, R² 0.475, PW20 0.466) pueden usarse como punto de comparación para futuros modelos de predicción de dosis de warfarina.
- Desarrollo de herramientas de software para farmacia clínica: integrable en sistemas de ayuda a la prescripción, siempre que se valide prospectivamente y se obtengan las aprobaciones regulatorias correspondientes.
- Análisis de importancia de características: al ser un ensemble de AutoGluon, se pueden extraer importancias de características para entender qué variables (clínicas vs. genéticas) contribuyen más a la predicción, útil para diseñar estudios de farmacogenética.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor (model-index) son:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Warfarin Stable Weekly Dose Prediction | IWPC-6256 | MAE | 8.552 |
| Warfarin Stable Weekly Dose Prediction | IWPC-6256 | R² | 0.475 |

Además, la model card reporta PW20 = 0.466 (proporción de predicciones dentro del 20% de la dosis real). La comparación con otros modelos sobre el mismo conjunto de características combinado es la siguiente (según la model card):

| Modelo | MAE | R² | PW20 |
|---|---|---|---|
| **AutoGluon `extreme_quality`** | **8.552** | **0.475** | **0.466** |
| TabPFN | 8.664 | 0.463 | 0.446 |
| CatBoost | 8.762 | 0.454 | 0.455 |
| Stacking Ensemble | 9.046 | 0.431 | 0.447 |
| MLP | 9.006 | 0.412 | 0.445 |
| Linear Regression | 9.078 | 0.419 | 0.445 |
| Random Forest | 9.214 | 0.415 | 0.428 |
| XGBoost | 10.047 | 0.312 | 0.407 |
| Elastic Net | 10.440 | 0.272 | 0.374 |

Estos valores no han sido verificados de forma independiente (campo `verified: false` en el model-index).

## Requisitos de hardware

- El modelo ocupa 0,2 GB en disco, por lo que es ligero y puede ejecutarse en CPU sin problemas.
- No requiere GPU para inferencia; AutoGluon puede usar CPU para cargar y predecir.
- Para entrenamiento (si se reentrena), AutoGluon con preset `extreme_quality` puede usar GPU si está disponible, pero el tiempo límite de 600s sugiere que el entrenamiento es factible en CPU moderna.
- Opciones de despliegue: AutoGluon (carga directa con `TabularPredictor.load`), Hugging Face Hub (descarga del repositorio), o integración en pipelines de Python.
- Latencia y throughput: no se han publicado mediciones específicas, pero al ser un modelo tabular pequeño, la inferencia es del orden de milisegundos en CPU.

## Comparativa con modelos similares

El modelo se compara directamente con otras arquitecturas evaluadas en el mismo estudio (ver tabla de benchmarks). Además, existe un modelo hermano en Hugging Face: `HassanB4/warfarin-review-phase3-autogluon-iwpc6256`, que parece ser el mismo artefacto o una variante con el mismo nombre de tarea. La comparativa principal es con TabPFN y CatBoost, que son los competidores más cercanos en rendimiento. En cuanto a disponibilidad, todos los modelos comparados son de código abierto, pero AutoGluon ofrece la ventaja de un ensemble automatizado sin ajuste manual de hiperparámetros.

| Modelo | MAE | R² | Licencia | Disponibilidad |
|---|---|---|---|---|
| AutoGluon `extreme_quality` (este) | 8.552 | 0.475 | Apache-2.0 | Hugging Face, GitHub |
| TabPFN | 8.664 | 0.463 | MIT (TabPFN) | Hugging Face, GitHub |
| CatBoost | 8.762 | 0.454 | Apache-2.0 | GitHub, librería |

## Limitaciones y advertencias

- Es un artefacto de investigación, no una herramienta clínica validada. No ha sido evaluado prospectivamente y no tiene estatus regulatorio (ni FDA, ni EMA, ni equivalente).
- Los datos de entrenamiento provienen de la cohorte IWPC, que puede tener sesgos de población (mayoría de ascendencia europea y asiática). La generalización a otras poblaciones no está garantizada.
- El modelo no es generativo, por lo que no hay riesgo de alucinación textual, pero sí de predicciones erróneas en dosis extremas o casos atípicos.
- La métrica R² de 0.475 indica que el modelo explica menos de la mitad de la varianza; la predicción tiene un error absoluto medio de 8.55 mg/semana, que puede ser clínicamente relevante.
- Solo está documentado en inglés; la interfaz y los datos están en inglés.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte explícitamente que no debe usarse como herramienta clínica sin validación adicional.
- El modelo depende de AutoGluon; para reproducir los resultados es necesario usar la misma versión de la librería (no se especifica la versión exacta en la model card).

## Enlaces

- Hugging Face: https://huggingface.co/HassanB4/warfarisk-autogluon-6256
- Repositorio GitHub (código oficial): https://github.com/HasanBGit/WarfaRisk
- Colección Hugging Face (WarfaRisk): https://huggingface.co/collections/HassanB4/warfarisk-ancestry-stratified-warfarin-dose-prediction-6a79b7f715e8533e72db4b4e
- Modelo hermano en Hugging Face: https://huggingface.co/HassanB4/warfarin-review-phase3-autogluon-iwpc6256
- Documentación de AutoGluon: https://auto.gluon.ai/stable/index.html
