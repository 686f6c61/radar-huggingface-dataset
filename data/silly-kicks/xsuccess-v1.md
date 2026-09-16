# silly-kicks/xsuccess-v1

## Resumen

xsuccess-v1 (variante `default`, etiquetada TF-61) no es un modelo de lenguaje, sino un modelo tabular de probabilidad de finalización de acciones en fútbol. Estima `P(success | contexto previo a la acción)` sobre todos los tipos de acción con balón del formato SPADL, con un XGBoost calibrado mediante regresión isotónica. Lo desarrolla el autor `silly-kicks` y se distribuye como parte del paquete Python `silly_kicks`, cargable con `silly_kicks.xsuccess.XSuccessModel.bundled()`.

Su relevancia es metodológica: se diseña como componente "end-blind" (ciego al resultado final) para el cálculo de VAEP ajustado. En modelos de acción tradicionales, usar la geometría del punto final de la acción reintroduce el sesgo de resultado (`outcome bias`) que VAEP pretende eliminar, porque en una acción fallida el punto final de SPADL es precisamente el punto de intercepción o de pérdida. Este modelo consume únicamente geometría anclada al inicio, tipo de acción, parte del cuerpo y tiempo, y se integra en `VAEP.rate_adjusted`.

El corpus de entrenamiento son 3.961 partidos de `statsbomb-open` (79 competiciones con sus temporadas asociadas), con 7.974.436 filas de acciones con balón. El paquete se publica como booster JSON sin pickle, con envoltorio de metadatos y SHA256, contrato de features y sonda de quiralidad, y carga fail-closed. La ficha de HuggingFace no declara licencia, idiomas ni pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XGBoost (gradiente boosting sobre árboles de decisión) con calibración isotónica |
| Parámetros totales | no disponible (no es una red neuronal; número de árboles y profundidad no declarados) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo tabular sobre features puntuales por acción) |
| Tipos de cuantización | no aplicable (no hay pesos en coma flotante cuantizables; se sirve booster JSON) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | booster JSON sin pickle + metadata + envoltorio SHA256, con contrato de features y sonda de quiralidad |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost (Chen y Guestrin, 2016) entrenado sobre features ancladas exclusivamente al inicio de la acción: geometría inicial, tipo de acción, parte del cuerpo y variables temporales. En el ajuste se aplica calibración isotónica sobre la salida del booster; en servicio se emplea una implementación de isotónica en numpy puro, de modo que no hay dependencia de sklearn en tiempo de ejecución. La etiqueta es SPADL `result_id == success`, y se conservan todos los tipos de acción con balón, incluidas las estructuralmente unilaterales como `clearance` o `bad_touch`, para que el modelo aprenda su tasa base propia.

La decisión de diseño central es el carácter end-blind: nunca se usan las coordenadas del final realizado de la acción. En una acción fallida, el final SPADL coincide con el punto de intercepción o de pérdida, por lo que un modelo que lo utilizara estaría haciendo una postdicción y reinyectando el sesgo que `VAEP.rate_adjusted` elimina. Esta propiedad está protegida por un test de invariancia a la localización del final. El entrenamiento usa GroupKFold agrupado por partido para reportar métricas fuera de muestra. La política de valores ausentes es estricta: una feature no finita produce probabilidad NaN, nunca un valor fabricado. La procedencia queda registrada en `metrics.json` con el commit de entrenamiento `12e5677e7301a7201c6c5c18160ef6a655bb5f23` y el estado del árbol (limpio para el bundle). Se citan como atribuciones el trabajo de Paul, Klemp y Memmert (2025), "Beyond Outcome Bias", y XGBoost.

## Capacidades

- Estimación de probabilidad de finalización exitosa para cualquier acción con balón de SPADL, condicionada únicamente al contexto previo.
- Salida calibrada (isotónica), apta para agregarse en métricas de valoración de jugadores.
- Cobertura de todos los tipos de acción con balón, incluidas categorías de baja tasa base como despejes y malos controles.
- Integración directa como componente de `VAEP.rate_adjusted` para producir VAEP ajustado por tasa en lugar de VAEP con sesgo de resultado.
- Carga fail-closed: si el bundle no supera el contrato de features, la sonda de quiralidad o el envoltorio SHA256, la carga falla en lugar de degradar silenciosamente.
- Determinismo y reproducibilidad: artefacto sin pickle, con JSON de booster y metadatos versionados.
- Propagación explícita de incertidumbre por dato ausente (NaN) en lugar de imputación.
- No soporta tool calling, agentes, generación de texto, visión, audio ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Valoración de jugadores en analítica de fútbol: alimentar `VAEP.rate_adjusted` con probabilidades de finalización libres de sesgo de resultado, de forma que un pase arriesgado e interceptado no se penalice dos veces (una por la pérdida y otra por la métrica de finalización).
- Modelos de posesión y progresión: usar la probabilidad calibrada como peso por acción en cadenas de pases para estimar el valor esperado de secuencias sin que el resultado final de la jugada contamine el cálculo.
- Reclutamiento y comparación entre ligas: al ser un modelo tabular con features normalizadas respecto del inicio de la acción, permite comparar tasas de finalización ajustadas por contexto entre competiciones y temporadas del corpus StatsBomb.
- Evaluación de decisiones de pase: calcular la diferencia entre la probabilidad de éxito de la acción elegida y la de alternativas disponibles en el mismo estado previo, útil en informes tácticos.
- Investigación en sesgo de resultado: servir como implementación de referencia end-blind frente a modelos que sí usan el punto final, para cuantificar el sesgo introducido.
- Auditoría y reproducibilidad de pipelines analíticos: el bundle con SHA256, contrato de features y carga fail-closed permite verificar que un despliegue en producción usa exactamente el artefacto entrenado.
- Detección de anomalías de datos: la política de NaN ante features no finitas convierte entradas corruptas de tracking o eventos en señales visibles en lugar de predicciones silenciosamente erróneas.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| AUC | 0,895 | GroupKFold agrupado por partido, out-of-fold, sobre 7.974.436 filas de acciones con balón |
| Brier score | 0,084 | Mismas condiciones |
| Tasa base de éxito | 0,835 | Mismas condiciones |

No se han publicado en la información disponible resultados comparativos con otros modelos de finalización ni valores numéricos de calibración por tipo de acción; el autor indica que la fiabilidad por tipo y la calibración global ("calibration-in-the-large") están en `metrics.json`, pero los valores concretos no se detallan en la model card.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un booster XGBoost con post-proceso isotónico en numpy puro, por lo que no requiere GPU.
- VRAM estimada: no aplicable; el consumo relevante es de memoria RAM, no declarado en la información disponible.
- GPU recomendadas: no aplicable. No hay soporte ni necesidad de CUDA para la inferencia del artefacto publicado.
- Compatibilidad con GPU de consumo: no aplicable en el sentido habitual; cualquier equipo que ejecute Python y numpy es suficiente.
- Opciones de despliegue: paquete `silly_kicks` (`silly_kicks.xsuccess.XSuccessModel.bundled()`), integrable en pipelines de Python. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencias en tiempo de servicio: XGBoost y numpy; sin sklearn en el camino de servicio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados comparativos frente a alternativas de la misma categoría (por ejemplo, modelos de finalización de acción basados en el punto final, u otros componentes de marcos tipo VAEP). Lo único comparable dentro del propio artefacto es la tasa base de éxito (0,835) frente al AUC de 0,895 y el Brier de 0,084 reportados, todos ellos bajo el mismo esquema de validación agrupada por partido.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la ficha de HuggingFace, no hay autorización explícita para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Es un modelo tabular de un dominio muy concreto (eventos SPADL de StatsBomb): no generaliza a otros formatos de datos ni a otras tareas.
- Dependencia del esquema de features: cualquier cambio en la definición de las features de entrada rompe el contrato y provoca fallo de carga (fail-closed), lo cual es deseable pero exige versionado estricto en producción.
- Sesgo de cobertura del corpus: los datos provienen de competiciones disponibles en `statsbomb-open`, con el desequilibrio de ligas, géneros y épocas que ello implica; no se declara ningún reajuste por dominio.
- Riesgo de mala calibración en tipos de acción raros: el propio autor señala que algunos tipos son estructuralmente unilaterales y el modelo aprende su tasa base, lo que implica pocas señales de discriminación en esas categorías.
- Valores ausentes: la salida puede ser NaN por diseño; cualquier consumidor posterior debe manejar explícitamente ese caso y no tratarlo como cero.
- Ausencia de benchmarks comparativos publicados: no se puede afirmar superioridad frente a alternativas sin datos.
- Sesgo de selección temporal: el corpus abarca temporadas concretas de StatsBomb Open Data; los cambios de estilo de juego posteriores no están representados.
- No es un modelo de lenguaje: no admite prompts, instrucciones en lenguaje natural ni generación de texto, por lo que muchas expectativas habituales de una ficha de HuggingFace no aplican.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/silly-kicks/xsuccess-v1
- Referencia citada por el autor: Paul, Klemp y Memmert (2025), "Beyond Outcome Bias" (no se proporciona URL en la información disponible)
- Referencia citada por el autor: Chen y Guestrin (2016), XGBoost (no se proporciona URL en la información disponible)
- Búsqueda web: los resultados devueltos corresponden a definiciones de diccionario y páginas municipales de la palabra "silly" (Cambridge Dictionary, Merriam-Webster, WordReference, Reverso, sitio de la comuna de Silly), sin relación con el modelo; no se han encontrado enlaces técnicos relevantes.
