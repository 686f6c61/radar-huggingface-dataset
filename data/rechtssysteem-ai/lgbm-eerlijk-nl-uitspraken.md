# rechtssysteem-ai/lgbm-eerlijk-nl-uitspraken

## Resumen

El modelo `lgbm-eerlijk-nl-uitspraken` es un clasificador de texto basado en LightGBM desarrollado por el usuario `rechtssysteem-ai` para predecir el resultado de casos judiciales neerlandeses. A partir del texto completo de una sentencia, clasifica el fallo en tres categorías: `afgewezen` (desestimado), `gedeeltelijk` (parcialmente estimado) y `toegewezen` (estimado). El modelo está diseñado para funcionar como una herramienta de indicación de riesgo, no como asesoramiento jurídico.

La relevancia de este modelo radica en su enfoque pragmático: utiliza un algoritmo clásico de boosting de gradiente en lugar de un transformer, lo que permite una inferencia rápida y ligera en CPU. Además, incorpora un mecanismo explícito de control de fugas de datos: elimina automáticamente el dictamen, la frase de conclusión y las frases que anuncian el resultado antes de hacer la predicción, reduciendo la fuga residual al 0,1%. El modelo está entrenado sobre un corpus de 609.715 casos y reporta una accuracy de 0,7818 en validación cruzada de 5 pliegues.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (Gradient Boosting Decision Trees) |
| Parametros totales | no disponible (modelo de árboles, número de árboles no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de texto, no generación) |
| Tipos de cuantizacion | no aplica (modelo de árboles) |
| Idiomas soportados | neerlandés (nl) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | formato nativo de LightGBM (binario o texto, no safetensors) |

## Arquitectura y entrenamiento

LightGBM es un algoritmo de boosting de gradiente que construye un ensemble de árboles de decisión de forma secuencial, optimizando una función de pérdida mediante descenso de gradiente. En este caso, el modelo se entrena sobre el texto de sentencias judiciales neerlandesas, previamente procesado para eliminar las secciones que revelan el resultado (dictum, conclusión y frases que anuncian el fallo). Esta limpieza es una innovación metodológica clave, ya que evita que el modelo aprenda a copiar la respuesta en lugar de razonar sobre los hechos y argumentos.

El entrenamiento se realizó sobre 609.715 casos, evaluados mediante validación cruzada de 5 pliegues con predicciones out-of-fold. No se especifican detalles sobre la representación de características (si se usó TF-IDF, embeddings u otras), ni sobre hiperparámetros concretos. Tampoco se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a este tipo de modelo.

## Capacidades

- Clasificación de texto en tres categorías mutuamente excluyentes: desestimado, parcialmente estimado y estimado.
- Indicación de confianza: si la probabilidad de la clase predicha es inferior al 55%, el modelo devuelve "no sé" en lugar de una clasificación forzada.
- Preprocesamiento automático de la entrada: elimina el dictamen, la conclusión y frases que anuncian el resultado antes de predecir.
- No genera texto, no soporta tool calling, ni funciones de agente, ni razonamiento multi-paso.
- Capacidad multilingüe limitada al neerlandés (no se reporta soporte para otros idiomas).

## Casos de uso

- Análisis de riesgo legal para despachos de abogados: el modelo puede procesar borradores de sentencias o escritos de demanda para estimar la probabilidad de éxito, ayudando a los letrados a decidir si merece la pena litigar o negociar un acuerdo.
- Triaje de casos en tribunales: los servicios de apoyo judicial pueden usar el modelo para priorizar expedientes según la probabilidad de estimación, optimizando la asignación de recursos.
- Investigación jurídica académica: los investigadores pueden analizar patrones de decisión en grandes volúmenes de sentencias, identificando sesgos o tendencias en la jurisprudencia neerlandesa.
- Automatización de informes de seguimiento: aseguradoras o entidades financieras pueden integrar el modelo en sus sistemas para evaluar el riesgo de litigios pendientes y ajustar provisiones.
- Validación de decisiones judiciales: los propios jueces podrían usar el modelo como una segunda opinión objetiva, aunque siempre con cautela y sin sustituir el criterio humano.
- Desarrollo de herramientas de acceso a la justicia: organizaciones sin ánimo de lucro pueden ofrecer a ciudadanos una estimación preliminar de sus posibilidades en un procedimiento, mejorando la transparencia del sistema.

## Benchmarks y rendimiento

Los resultados reportados en la model card provienen de validación cruzada de 5 pliegues sobre 609.715 casos, con predicciones out-of-fold. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Accuracy | 0,7818 |
| Macro-F1 | 0,7714 |
| F1 (desestimado) | 0,827 |
| F1 (parcialmente estimado) | 0,726 |
| F1 (estimado) | 0,761 |
| Baseline (mayoría) | 43,7% |

## Requisitos de hardware

- Al ser un modelo de árboles, no requiere GPU. Puede ejecutarse en CPU con recursos mínimos.
- La memoria necesaria depende del número de árboles y de la profundidad, pero en general es del orden de decenas de megabytes, muy inferior a cualquier modelo transformer.
- Es adecuado para despliegue en entornos con restricciones de hardware, como servidores de bajo coste o incluso dispositivos embebidos.
- Opciones de despliegue: librería LightGBM (Python, R, C++), o mediante el servidor MCP mencionado en la model card (`mcp_rechtssysteem.py`), que expone funciones como `voorspel_uitkomst`, `rechtspraak_cijfers` y `lekkage_check`.
- La latencia de inferencia es del orden de milisegundos por muestra en CPU, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros modelos de predicción de sentencias neerlandesas con los que comparar directamente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con sentencias neerlandesas, por lo que no es aplicable a otros sistemas jurídicos ni a otros idiomas.
- Aunque se ha reducido la fuga de datos al 0,1%, existe un riesgo residual de que el modelo aprenda patrones espurios no relacionados con el fondo del caso.
- La predicción es una indicación de riesgo, no un asesoramiento jurídico. No debe utilizarse como sustituto de un análisis legal profesional.
- El umbral de confianza del 55% es arbitrario y puede generar muchos "no sé" en casos ambiguos, lo que limita su utilidad en situaciones reales.
- No se especifican los sesgos potenciales del modelo, pero al entrenarse sobre decisiones judiciales históricas, puede reflejar sesgos existentes en el sistema judicial.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución. No se indican restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rechtssysteem-ai/lgbm-eerlijk-nl-uitspraken
- Metodología (benchmark): https://huggingface.co/rechtssysteem-ai/nl-judgment-benchmark
- Repositorio MCP (referencia incompleta): https://github.com/.../mcp_rechtssysteem.py (la URL completa no está disponible en la información proporcionada)
