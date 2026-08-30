# karthifde/apexfi-fraud-detection

## Resumen

ApexFi es un sistema de detección de fraude híbrido compuesto por dos modelos independientes que combinan LightGBM (modelo tabular) con GraphSAGE (red neuronal de grafos) mediante una capa de apilamiento (stacking) basada en regresión logística. Desarrollado como parte de un proyecto de M.Tech orientado a la detección de fraude en el ecosistema de pagos digitales UPI/IMPS de la India, el repositorio publica dos modelos entrenados sobre conjuntos de datos proxy reales y públicos: IEEE-CIS (transacciones individuales) y DGraph-Fin (cuentas y redes). El autor, KarthickRamAlagar, aclara explícitamente que no se trata de modelos entrenados con datos reales de UPI/IMPS, sino que utilizan estos conjuntos proxy por su representatividad estructural para validar la arquitectura técnica.

La relevancia de este trabajo radica en su enfoque híbrido tabular + gráfico, que demuestra cómo la información de grafos puede complementar (o no) a las características tabulares según la estructura del dataset. Los resultados reportados incluyen métricas de precisión, recall, F1 y ROC-AUC para ambos modelos, con una comparación honesta frente a benchmarks académicos y competiciones de Kaggle. El modelo se distribuye bajo licencia MIT e incluye artefactos de preprocesamiento necesarios para puntuar nuevas transacciones, así como un script de ejemplo de inferencia.

No se trata de un modelo de lenguaje ni de un transformer; es un sistema de clasificación binaria para detección de anomalías en datos tabulares y de grafos. Su uso previsto es investigación y demostración educativa, no implementación directa en producción financiera sin validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM + GraphSAGE con capa de apilamiento (regresión logística) |
| Parametros totales | No disponible (modelo híbrido; LightGBM booster y checkpoint GraphSAGE) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo no generativo) |
| Tipos de cuantizacion | No aplica (modelos tradicionales sin cuantización) |
| Idiomas soportados | No aplica (modelo tabular/gráfico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | LightGBM (.txt), GraphSAGE (.pt), stacking y preprocesamiento (.pkl) |

## Arquitectura y entrenamiento

El sistema combina dos modelos base independientes: un LightGBM que procesa características tabulares de cada transacción o cuenta, y un GraphSAGE que explota la estructura de grafos subyacente (relaciones entre transacciones, cuentas, etc.). Ambos modelos se entrenan por separado y sus salidas se combinan mediante una regresión logística aprendida (capa de stacking). El autor reporta que en IEEE-CIS el peso aprendido favorece a LightGBM en una proporción de aproximadamente 19:1, mientras que en DGraph-Fin el peso está casi balanceado, evidenciando que la contribución del grafo depende de la estructura del dataset.

El entrenamiento se realizó con una división fija estratificada 70/15/15 (train/validación/test) repetida en 3 semillas aleatorias, reportando media y desviación estándar. Para IEEE-CIS se usaron 590.540 transacciones con una tasa de fraude real del 3,499%; para DGraph-Fin se usaron 3.700.550 cuentas con una tasa de fraude del 1,265% en el subconjunto etiquetado. Los datos provienen de fuentes públicas (IEEE-CIS y DGraph-Fin) y no se especifica la composición exacta de los datasets ni el número total de tokens (concepto no aplicable aquí). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado de forma clásica.

## Capacidades

- Detección de fraude en transacciones individuales (nivel transaccional) y en redes de cuentas (nivel de grafo).
- Clasificación binaria (fraudulento / legítimo) con salida de probabilidad.
- Explicabilidad mediante SHAP (integrado en el pipeline) y GNNExplainer (según el repositorio de GitHub).
- Manejo de datos tabulares heterogéneos y de grafos con relaciones entre entidades.
- Inferencia sobre nuevas muestras sin aprendizaje incremental (diseño intencionado para evitar corrupción por entradas adversariales).
- Soporte para dos estructuras de datos distintas: transacciones individuales (IEEE-CIS) y cuentas con red (DGraph-Fin).
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de visión o audio.

## Casos de uso

- Investigación académica en detección de fraude híbrida: el modelo sirve como referencia validada para comparar arquitecturas tabulares + gráficas bajo supervisión completa, tal como se documenta en el proyecto de M.Tech.
- Demostración educativa de apilamiento de modelos: permite ilustrar cómo combinar LightGBM y GraphSAGE mediante una regresión logística, con artefactos de preprocesamiento listos para usar.
- Análisis de redes de cuentas fraudulentas: el modelo DGraph-Fin puede identificar cuentas sospechosas en un grafo de relaciones, útil para estudiar patrones de fraude organizado.
- Detección de fraude en transacciones individuales: el modelo IEEE-CIS puede puntuar transacciones nuevas si se dispone de las características adecuadas, aunque con la limitación de las columnas anonimizadas V1-V339.
- Evaluación de la contribución relativa de características tabulares vs. gráficas: los pesos de apilamiento aprendidos ofrecen información sobre qué tipo de señales dominan en cada dataset.
- Base para el desarrollo de sistemas de detección de fraude en pagos digitales: aunque no está listo para producción directa, puede servir como punto de partida para validar la arquitectura en datos reales de UPI/IMPS.

## Benchmarks y rendimiento

Los resultados reportados en la model card se resumen a continuación. Se indica claramente que la evaluación utiliza una división aleatoria estratificada, no temporal, y que las comparaciones con Kaggle o GADBench no son totalmente equivalentes.

### IEEE-CIS (590.540 transacciones, 3,499% fraude real)

| Modelo | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|
| LightGBM solo | 0,825 ± 0,005 | 0,768 ± 0,001 | 0,796 ± 0,002 | 0,973 ± 0,000 |
| GraphSAGE solo | 0,466 | 0,522 | 0,492 | 0,892 |
| Stacked (mejor) | 0,878 ± 0,002 | 0,731 ± 0,001 | 0,798 ± 0,001 | 0,974 ± 0,000 |

### DGraph-Fin (3.700.550 cuentas, 1,265% fraude real en subconjunto etiquetado)

| Modelo | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|
| LightGBM solo | 0,992 ± 0,009 | 0,524 ± 0,000 | 0,686 ± 0,002 | 0,938 ± 0,000 |
| GraphSAGE solo | 1,000 | 0,524 | 0,688 | 0,916 |
| Stacked (mejor) | 0,995 ± 0,005 | 0,524 ± 0,000 | 0,687 ± 0,001 | 0,938 ± 0,001 |

El autor advierte que el ROC-AUC de 0,9736 en IEEE-CIS supera al mejor modelo individual de la competición de Kaggle (0,9408 en leaderboard privado), pero la comparación no es del todo justa por la diferencia en el tipo de división (aleatoria vs. temporal). Para DGraph-Fin, los resultados no son comparables con benchmarks académicos como GADBench (~66,9% ROC-AUC) porque esos benchmarks usan un escenario de muy pocas etiquetas (100 ejemplos), mientras que aquí se entrena con supervisión completa.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. Dado que se trata de un modelo LightGBM y un GraphSAGE (que no son modelos de lenguaje), las necesidades de cómputo son modestas en comparación con LLMs. Estimaciones razonables basadas en el tipo de modelo:

- LightGBM: puede ejecutarse en CPU con pocos GB de RAM; el archivo .txt del booster es pequeño (no se especifica tamaño, pero el repositorio total es de 0,0 GB según HuggingFace).
- GraphSAGE: requiere una GPU para entrenamiento eficiente, pero la inferencia puede hacerse en CPU si el grafo no es extremadamente grande. Para el dataset DGraph-Fin (3,7 millones de cuentas), se necesitaría una GPU con al menos 8-16 GB de VRAM para manejar el grafo en memoria, aunque no hay datos concretos.
- El script de ejemplo `predict_example.py` sugiere que la inferencia es ligera y puede ejecutarse en un entorno estándar.
- Opciones de despliegue: al ser modelos personalizados, se usarían bibliotecas como LightGBM, PyTorch Geometric y pickle para el stacker. No es compatible directamente con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay muchos modelos públicos que combinen exactamente LightGBM + GraphSAGE con stacking. Se pueden comparar con alternativas de detección de fraude:

| Modelo | Arquitectura | Dataset | ROC-AUC | Licencia |
|---|---|---|---|---|
| ApexFi (este) | LightGBM + GraphSAGE + stacking | IEEE-CIS, DGraph-Fin | 0,974 (IEEE-CIS) | MIT |
| saifhmb/fraud-detection-model | Gaussian Naive Bayes | Sintético (J.P. Morgan) | No reportado | No especificada |
| Métodos GADBench (referencia) | Varios (GNN, etc.) | Múltiples (bajo etiquetado) | ~66,9% ROC-AUC | Varía |

La comparación con GADBench no es directa por la diferencia en el régimen de etiquetado (supervisión completa vs. pocas etiquetas). El modelo de saifhmb es un clasificador simple sobre datos sintéticos, no comparable en alcance. No hay alternativas públicas que usen la misma arquitectura híbrida sobre los mismos datasets, por lo que la comparativa es limitada.

## Limitaciones y advertencias

- Los modelos están entrenados con datasets proxy (IEEE-CIS y DGraph-Fin), no con datos reales de UPI/IMPS. No deben utilizarse directamente en producción financiera sin validación independiente sobre la distribución real de los datos.
- Las columnas anonimizadas V1-V339 de IEEE-CIS no pueden proporcionarse para transacciones nuevas, ya que su significado real no está documentado. Las predicciones para nuevas transacciones cuya señal de riesgo dependa de esas columnas tendrán una brecha de rendimiento esperada.
- Los modelos no aprenden de nuevas entradas: cada predicción usa los mismos archivos fijos, sin actualización en línea. Esto es intencional para evitar corrupción por entradas adversariales, pero limita la adaptabilidad.
- La evaluación usa una división aleatoria estratificada, no temporal. Los resultados pueden no reflejar el rendimiento en escenarios donde la distribución del fraude cambia con el tiempo.
- No se reportan sesgos específicos del modelo, pero al tratarse de datos financieros, pueden existir sesgos demográficos o geográficos inherentes a los datasets originales.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.
- Restricciones de licencia: licencia MIT permite uso comercial y modificación, pero los datasets fuente pueden tener licencias propias que deben consultarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/karthifde/apexfi-fraud-detection
- Repositorio GitHub del proyecto completo: https://github.com/KarthickRamAlagar/apexfi-fraud-graph
- README del proyecto en GitHub: https://github.com/KarthickRamAlagar/apexfi-fraud-graph/blob/main/README.md
- Artículo relacionado (no directamente del autor): https://ijsrm.net/index.php/ijsrm/article/view/5898
- Otro modelo de detección de fraude en HuggingFace: https://huggingface.co/saifhmb/fraud-detection-model
