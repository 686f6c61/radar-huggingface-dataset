# pyaging/pcskinandblood

## Resumen

`pyaging/pcskinandblood` es un reloj epigenético (aging clock) publicado en el ecosistema de la librería pyaging. No es un modelo de lenguaje ni una red neuronal profunda: es un estimador estadístico que predice la edad cronológica de un individuo a partir de datos de metilación del ADN, combinando un análisis de componentes principales (PCA) con una regresión elastic net. Fue entrenado para aproximar la puntuación del reloj original Horvath2 utilizando muestras de piel, sangre completa y fibroblastos cultivados de *Homo sapiens*.

El modelo se enmarca en la línea de trabajo de Higgins-Chen et al. (2022), publicada en *Nature Aging*, que propone soluciones computacionales para mejorar la fiabilidad de los relojes epigenéticos en ensayos clínicos y seguimiento longitudinal. La relevancia actual del modelo radica en que los relojes de primera generación presentan una fiabilidad test-retest limitada; esta variante basada en PCA actúa como proxy del reloj de referencia, reduciendo dimensionalidad y ruido técnico.

El repositorio ocupa 0,4 GB y acumula 754 descargas, con licencia MIT para el software, aunque los pesos conservan los términos de los autores originales. La ficha se limita a lo documentado en la model card y en la información de Hugging Face, ya que no se han publicado detalles adicionales sobre el conjunto de entrenamiento ni métricas de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT (el software); los pesos conservan los términos de los autores originales |
| Formato de pesos | no disponible (integrado en pyaging; repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos etapas sobre datos de metilación del ADN: primero reduce la dimensionalidad de las señales de metilación mediante análisis de componentes principales y, a continuación, aplica una regresión elastic net sobre esas componentes para predecir la edad cronológica. Esta combinación de PCA y regularización L1/L2 es habitual en relojes epigenéticos que buscan estabilidad frente al ruido técnico y a la colinealidad entre sitios CpG.

El entrenamiento se realizó contra la puntuación del reloj original Horvath2, utilizando conjuntos de datos de piel, sangre completa y fibroblastos cultivados. La model card no especifica el número de muestras, la composición exacta del dataset ni si se aplicaron procedimientos adicionales de validación cruzada o ajuste. El año de referencia indicado es 2022, coincidiendo con la publicación de Higgins-Chen et al. en *Nature Aging*. No se documentan innovaciones como decodificación especulativa, atención lineal ni mecanismos de RLHF/DPO, ya que no son aplicables a este tipo de estimador.

## Capacidades

- Predicción de edad cronológica a partir de perfiles de metilación del ADN en *Homo sapiens*.
- Funciona sobre tres tipos de tejido: piel, sangre completa y fibroblastos cultivados.
- Actúa como proxy del reloj Horvath2, aproximando su puntuación mediante PCA y elastic net.
- Integración directa con la librería pyaging mediante `pya.pred.predict_age(adata, ["pcskinandblood"])`.
- Diseñado para escenarios de fiabilidad mejorada en ensayos clínicos y seguimiento longitudinal, según la motivación del paper de referencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No procesa visión, audio ni texto libre.

## Casos de uso

- **Estimación de edad biológica en estudios de envejecimiento**: el modelo se aplica a matrices de metilación de sangre completa para obtener una predicción de edad cronológica que sirva como referencia en análisis de edad epigenética acelerada.
- **Seguimiento longitudinal en ensayos clínicos**: la motivación del paper de referencia es mejorar la fiabilidad test-retest; el modelo puede emplearse para medir cambios de edad epigenética en pacientes a lo largo del tiempo con menor ruido técnico.
- **Investigación en fibroblastos cultivados**: permite estimar la edad de líneas celulares de fibroblastos en experimentos de reprogramación o senescencia, usando el proxy del reloj Horvath2.
- **Estudios dermatológicos sobre piel**: al incluir tejido cutáneo en el entrenamiento, es adecuado para analizar envejecimiento cutáneo en cohortes con biopsias de piel.
- **Armonización de cohorts multi-tejido**: al cubrir piel, sangre y fibroblastos, facilita comparaciones de edad epigenética entre estudios que emplean distintos tejidos, siempre dentro del dominio de entrenamiento.
- **Integración en pipelines bioinformáticos con pyaging**: se puede encadenar con otros relojes del catálogo de pyaging para comparar predicciones y evaluar la robustez de los resultados en un mismo conjunto de datos.
- **Filtrado y control de calidad en datos de metilación**: la predicción puede usarse como variable de control para detectar muestras atípicas o lotes problemáticos en estudios epigenómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplica; el modelo no requiere GPU para inferencia en el sentido habitual. Es un estimador estadístico sobre componentes principales y coeficientes de elastic net.
- **GPU recomendadas**: no disponibles; el cálculo puede ejecutarse en CPU.
- **Compatibilidad con GPU de consumo**: no relevante; el cuello de botella es el preprocesado de datos de metilación, no el modelo.
- **Opciones de despliegue**: librería pyaging (Python), invocable mediante `pya.pred.predict_age`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables.
- **Latencia y throughput estimados**: no disponibles. El repositorio ocupa 0,4 GB, lo que sugiere que los pesos y artefactos asociados son ligeros en comparación con modelos neuronales.

## Comparativa con modelos similares

| Modelo | Tipo | Tejidos | Predice | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pcskinandblood | PCA + elastic net | piel, sangre, fibroblastos | edad cronológica (proxy Horvath2) | MIT (software); pesos con términos originales | Hugging Face, pyaging |
| Horvath2 (reloj original) | Reloj epigenético de referencia | múltiples tejidos | edad cronológica | no disponible | no disponible en la información proporcionada |
| Otros relojes del catálogo pyaging | diversos (elastic net, PCA, etc.) | variable | edad cronológica o fenotípica | variable | Catálogo pyaging |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Ámbito restringido a tres tejidos**: solo es válido para piel, sangre completa y fibroblastos cultivados; su uso en otros tejidos no está respaldado por el entrenamiento documentado.
- **Especie única**: entrenado exclusivamente para *Homo sapiens*; no debe aplicarse a otras especies.
- **Dependencia del reloj Horvath2**: al ser un proxy, hereda las limitaciones y sesgos del reloj de referencia contra el que fue entrenado.
- **Sin métricas publicadas**: no se han documentado MAE, correlación ni fiabilidad test-retest en la información disponible, lo que dificulta evaluar su precisión real.
- **Riesgo de alucinación**: no aplica en el sentido de modelos generativos, pero existe riesgo de predicciones sesgadas si los datos de entrada se salen de la distribución de entrenamiento.
- **Sesgos poblacionales**: no se documenta la composición demográfica del conjunto de entrenamiento, por lo que se desconoce si el modelo generaliza a todas las poblaciones.
- **Licencia de los pesos**: aunque el software es MIT, los pesos conservan los términos de los autores originales; es necesario revisarlos antes de un uso comercial.
- **Sin soporte de texto ni lenguaje**: no debe confundirse con un modelo de lenguaje; no procesa prompts, instrucciones ni documentos.
- **Preprocesado crítico**: la calidad de la predicción depende del pipeline de normalización de metilación y de la selección de CpG, que no se detalla en la model card.

## Enlaces

- [Hugging Face: pyaging/pcskinandblood](https://huggingface.co/pyaging/pcskinandblood)
- [Catálogo de relojes de pyaging](https://pyaging.readthedocs.io)
- [Paper de referencia: Higgins-Chen et al., Nature Aging 2022](https://doi.org/10.1038/s43587-022-00248-2)
