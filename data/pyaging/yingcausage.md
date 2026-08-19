# pyaging/yingcausage

## Resumen

`pyaging/yingcausage` es un reloj epigenético de edad cronológica diseñado para estimar la edad biológica de un individuo a partir de datos de metilación de ADN. Fue desarrollado por el equipo de pyaging y publicado en 2024 en la revista *Nature Aging* bajo el título "Causality-enriched epigenetic age uncouples damage and adaptation". El modelo emplea una regresión de elastic net ponderada por causalidad, donde los sitios CpG se priorizan mediante análisis de aleatorización mendeliana a nivel de epigenoma (EWMR) y se asignan penalizaciones específicas basadas en puntuaciones de causalidad. Está entrenado para tejido de sangre completa en *Homo sapiens*.

La relevancia de este modelo radica en que integra información causal en la construcción del reloj, lo que permite distinguir entre daño y adaptación en el proceso de envejecimiento. A diferencia de los relojes epigenéticos tradicionales que se basan en correlaciones estadísticas, este enfoque busca una interpretación más mecanicista. Aunque no se trata de un modelo de lenguaje ni de visión, es una herramienta útil para investigadores en biología del envejecimiento y medicina de precisión. La arquitectura subyacente es una regresión lineal regularizada, no una red neuronal, por lo que su tamaño y requisitos computacionales son mínimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net ponderada por causalidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada: niveles de metilación de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente pickle o similar, no especificado) |

## Arquitectura y entrenamiento

El modelo `yingcausage` se basa en una regresión de elastic net, una técnica de regularización lineal que combina penalizaciones L1 y L2. La innovación principal es la incorporación de puntuaciones de causalidad derivadas de un análisis de aleatorización mendeliana a nivel de epigenoma (EWMR). Estas puntuaciones se utilizan para priorizar los sitios CpG y para asignar penalizaciones específicas a cada característica durante el entrenamiento, de modo que los CpGs con mayor evidencia causal influyen más en la predicción final. Los datos de entrenamiento consisten en perfiles de metilación de ADN de sangre completa humana, aunque el número exacto de muestras y la composición del dataset no se han detallado en la información disponible. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Predicción de edad cronológica a partir de niveles de metilación de ADN en sangre completa humana.
- Estimación de edad biológica con interpretación causal, diferenciando entre daño acumulado y procesos adaptativos.
- Integración con la librería `pyaging` para su uso directo en pipelines de análisis de datos ómicos.
- Modelo específico para la especie *Homo sapiens* y tejido de sangre completa; no es transferible a otros tejidos o especies sin reentrenamiento.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Investigación en biología del envejecimiento: los laboratorios pueden utilizar `yingcausage` para estimar la edad biológica de cohortes de individuos a partir de sus datos de metilación, y correlacionarla con fenotipos de salud, enfermedades o intervenciones.
- Estudios longitudinales de envejecimiento: al ser un reloj causal, permite analizar si los cambios en la metilación reflejan daño acumulado o respuestas adaptativas, lo que puede informar sobre mecanismos subyacentes.
- Validación de biomarcadores epigenéticos: se puede emplear como referencia para comparar con otros relojes de edad y evaluar la consistencia de nuevas firmas de metilación.
- Medicina de precisión: en entornos clínicos de investigación, podría ayudar a estratificar pacientes según su edad biológica estimada, aunque su uso clínico requiere validación adicional.
- Análisis de datos de metilación en estudios epidemiológicos: integrado en pipelines de `pyaging`, facilita el cálculo rápido de la edad epigenética en grandes conjuntos de datos.
- Desarrollo de nuevos relojes: su enfoque metodológico puede servir como plantilla para construir relojes causales en otros tejidos o especies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como correlación con edad cronológica, error absoluto medio u otras comparaciones con relojes existentes en la documentación proporcionada.

## Requisitos de hardware

- Al ser un modelo de regresión lineal, no requiere GPU. Puede ejecutarse en cualquier CPU con suficiente memoria RAM para cargar los coeficientes (que son escasos, probablemente cientos o miles de CpGs).
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que el modelo es muy ligero (los coeficientes se almacenan en un archivo pequeño).
- Se puede desplegar en entornos sin aceleración hardware, como notebooks, servidores CPU o incluso dispositivos embebidos.
- No se dispone de datos de latencia o throughput, pero la inferencia consiste en una multiplicación matriz-vector, por lo que es prácticamente instantánea.
- La librería `pyaging` se integra con el ecosistema de Python (AnnData, etc.), por lo que se recomienda un entorno con Python 3.8+ y las dependencias habituales de ciencia de datos.

## Comparativa con modelos similares

| Modelo | Tipo | Tejido | Enfoque | Licencia |
|---|---|---|---|---|
| yingcausage | Elastic net causal | Sangre completa | Priorización causal EWMR | BSD-3-Clause |
| Horvath clock (2013) | Elastic net | Múltiples tejidos | Correlacional | No disponible |
| Hannum clock (2013) | Elastic net | Sangre completa | Correlacional | No disponible |
| PhenoAge (2018) | Elastic net | Sangre completa | Fenotípico | No disponible |

Nota: los relojes de Horvath y Hannum son anteriores y no incorporan información causal. `yingcausage` se distingue por su enfoque de causalidad, pero no se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para sangre completa humana; su uso en otros tejidos o especies producirá resultados no válidos.
- Requiere datos de metilación de ADN procesados correctamente (valores beta o M) y normalizados según el mismo protocolo utilizado en el entrenamiento; no se especifican los detalles de preprocesamiento.
- Al ser un modelo de regresión, no captura interacciones no lineales entre CpGs, lo que puede limitar su precisión en ciertos contextos.
- No se han publicado métricas de rendimiento ni validación externa en la información disponible, por lo que se recomienda cautela antes de usarlo en entornos clínicos.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero se debe citar el trabajo original.
- No hay información sobre sesgos poblacionales; es posible que el modelo tenga un rendimiento desigual en diferentes grupos étnicos o edades extremas, aunque no se ha documentado.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/yingcausage
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Publicación original: Ying, K., Liu, H., Tarkhov, A.E. et al. Causality-enriched epigenetic age uncouples damage and adaptation. Nature Aging 4, 231–246 (2024). DOI: https://doi.org/10.1038/s43587-023-00557-0
