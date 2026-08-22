# adnanallemon/aml-campaigngraph-temporal-motif

## Resumen

`TemporalMotifGraphModel` es un modelo de ensemble de árboles (tree-ensemble) interpretable diseñado para la detección de patrones de lavado de dinero a nivel de campaña en grafos de transacciones temporales. Lo desarrolla adnanallemon como parte del proyecto AML-CampaignGraph v1.0.0, cuyo objetivo es proporcionar un benchmark reproducible para investigación en detección de actividades sospechosas. A diferencia de los enfoques basados en redes neuronales gráficas (GNN), este modelo no realiza message passing aprendido, sino que opera sobre características estructurales y temporales extraídas de los grafos, lo que facilita su interpretabilidad y su uso como línea base comparativa.

El modelo se entrena sobre 180 grafos sintéticos (4.320 nodos y 14.790 transacciones) que simulan seis escenarios de lavado de dinero, con 90 grafos positivos y 90 negativos difíciles. Produce una puntuación en [0,1] para ranking de campañas, una predicción de patrón o `NO_CAMPAIGN_FOUND`, y una lista de transacciones de evidencia ordenadas por relevancia. Incluye un mecanismo de abstención cuando la puntuación es baja o el conjunto de evidencia es demasiado pequeño. Su relevancia actual radica en ofrecer un punto de referencia reproducible y explicable para experimentos de detección de lavado de dinero en grafos temporales, con especial énfasis en calibración, predicción selectiva y fidelidad de explicaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de árboles de decisión (tree-ensemble) sobre características de grafos temporales |
| Parametros totales | No disponible (modelo de árboles, sin parámetros de red neuronal) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo sobre grafos, no texto) |
| Tipos de cuantizacion | No disponible (no aplica a árboles) |
| Idiomas soportados | No aplica (modelo de datos numéricos) |
| Licencia | MIT (código y metadatos del checkpoint) |
| Formato de pesos | Joblib (según el tag del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ensemble de árboles (probablemente un bosque aleatorio o gradient boosting) que combina seis ventanas temporales para capturar la dinámica de las transacciones. Las características se dividen en tres niveles: nodo (actividad, montos, contrapartes, reciprocidad, alcance, grado y features temporales por ventana), campaña (tamaño del grafo, volumen de transacciones, duración, dispersión de montos, diversidad de canales, concentración de grado, reciprocidad, ráfagas, actividad por ventana, entropía y proporción de montos pequeños) y relacional. La salida es una puntuación calibrada en [0,1] mediante un mecanismo de calibración (probablemente isotónico o Platt) y un umbral configurable (por defecto 0.5) que determina la predicción de patrón o la abstención.

El entrenamiento se realiza sobre los 180 grafos completos del dataset, con una partición estratificada para el split principal, una partición temporal que retiene una ventana futura, y una partición OOD que excluye una combinación de escenario y dificultad. No se utiliza RLHF ni DPO; el entrenamiento es supervisado con etiquetas de campaña. El proceso de entrenamiento está documentado en el script `scripts/build_final_model.py`, y la implementación se encuentra en `src/aml_campaigngraph/final_model.py`.

## Capacidades

- Generación de puntuaciones de campaña en [0,1] para ranking de sospecha.
- Predicción de patrón de campaña o `NO_CAMPAIGN_FOUND` según umbral configurable.
- Producción de evidencia ordenada: lista de identificadores de transacciones y tabla compacta de evidencia.
- Mecanismo de abstención selectiva cuando la puntuación es baja o la evidencia es insuficiente.
- Calibración de puntuaciones (Brier score y ECE reportados).
- Análisis de fidelidad de explicaciones mediante perturbación controlada de aristas (probes).
- Capacidad de evaluación sobre particiones temporales y OOD (out-of-distribution) para probar robustez.
- Compatibilidad con experimentos de comparación de métodos de representación de grafos temporales.

## Casos de uso

- Investigación académica en detección de lavado de dinero: el modelo sirve como baseline interpretable para comparar nuevos métodos de GNN o de features temporales en grafos sintéticos.
- Benchmark de características temporales: permite evaluar qué features (ventanas temporales, entropía, burstiness, etc.) son más relevantes para la detección de patrones de campaña.
- Estudio de calibración y predicción selectiva: se puede analizar el comportamiento del modelo bajo diferentes umbrales de abstención y su calibración en splits temporales y OOD.
- Enseñanza de aprendizaje automático aplicado a AML: al ser un modelo de árboles interpretable, es adecuado para explicar conceptos de ranking, calibración y evidencia en entornos educativos.
- Análisis de robustez ante distribución shift: los resultados en el split OOD muestran degradación de F1 y calibración, lo que permite estudiar estrategias de adaptación o detección de cambio de distribución.
- Comparación de representaciones de grafos temporales: se puede usar para evaluar si las features manuales superan a representaciones aprendidas en entornos sintéticos controlados.

## Benchmarks y rendimiento

La model card reporta métricas sobre las particiones del dataset (semilla 2025 para los baselines, media de 5 semillas para el modelo final). Los valores de AP, F1, recall, Brier y ECE son:

| Split | Campaign AP | Campaign F1 | Campaign recall | Brier | ECE |
|---|---|---:|---:|---:|---:|
| Primary | 1.000 | 1.000 | 1.000 | 0.0058 | 0.050 |
| Temporal | 1.000 | 1.000 | 1.000 | 0.0067 | 0.051 |
| OOD | 1.000 | 0.694 | 1.000 | 0.1451 | 0.282 |

El modelo muestra un rendimiento perfecto en splits primario y temporal, pero una caída notable en OOD (F1 de 0.694 y ECE de 0.282), lo que indica sensibilidad a la distribución shift. Comparado con el modelo Alpha `CampaignGraphModel`, el modelo final mejora el F1 en temporal (de 0.944 a 1.000) y en OOD (de 0.235 a 0.682), y el recall OOD de 0.133 a 1.000. No se publican comparaciones con otros modelos externos.

## Requisitos de hardware

- El modelo es un ensemble de árboles, por lo que no requiere GPU para inferencia. Puede ejecutarse en CPU estándar.
- No se especifican requisitos de VRAM ni GPUs concretas en la documentación.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que el checkpoint es muy pequeño (probablemente unos pocos KB).
- Despliegue: no se mencionan herramientas específicas como vLLM, llama.cpp u Ollama. Al ser un modelo de árboles, se puede cargar con librerías estándar de Python (scikit-learn, XGBoost, etc.) y servirse mediante un API propio.
- La latencia y el throughput no se reportan, pero para un modelo de este tamaño, la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

La única comparación publicada es con el modelo `Alpha` `CampaignGraphModel` (mencionado en la model card). No se han encontrado comparaciones con otros modelos de detección de lavado de dinero en grafos temporales en la información disponible. A continuación, se presentan los datos de la comparación interna:

| Modelo | Split | Campaign F1 | Campaign recall | Campaign AP |
|---|---|---|---|---|
| Alpha CampaignGraphModel | Temporal | 0.944 | no reportado | 1.000 |
| TemporalMotifGraphModel | Temporal | 1.000 | 1.000 | 1.000 |
| Alpha CampaignGraphModel | OOD | 0.235 | 0.133 | 1.000 |
| TemporalMotifGraphModel | OOD | 0.682 | 1.000 | 1.000 |

## Limitaciones y advertencias

- El modelo se entrena exclusivamente sobre datos sintéticos de un simulador, por lo que puede aprender artefactos del simulador (timing, buckets de montos, patrones de canal) que no se transfieren a datos reales.
- Solo cubre seis patrones de lavado de dinero sintéticos, insuficientes para representar la diversidad de comportamientos legítimos e ilícitos reales.
- La calibración OOD es significativamente peor que la in-distribución (ECE de 0.282 frente a 0.050), lo que indica falta de fiabilidad bajo distribución shift.
- La evidencia generada es un proxy de investigación basado en perturbación de aristas, no una explicación causal validada por humanos.
- No se debe usar el modelo para acusar a personas o instituciones, cerrar cuentas, presentar informes de actividades sospechosas o tomar decisiones legales, crediticias, laborales, de seguros o financieras.
- La licencia MIT permite uso comercial, pero las limitaciones funcionales del modelo (solo sintético) lo hacen inadecuado para producción sin validación adicional con datos reales y cumplimiento normativo.
- No se proporcionan datos sobre sesgos demográficos o geográficos, ya que el modelo trabaja con datos numéricos de transacciones, no con información personal.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adnanallemon/aml-campaigngraph-temporal-motif)
- [Dataset en Hugging Face](https://huggingface.co/datasets/adnanallemon/aml-campaigngraph-data)
- [Artículo relacionado: LAS-GNN - GNN para motivos temporales en lavado de dinero](https://dl.acm.org/doi/10.1145/3768292.3770410) (referencia externa, no afiliada al modelo)
- [Estudio sobre GNN temporales para AML](https://academianexusjournal.com/index.php/anj/article/download/27/28/59) (referencia externa)
