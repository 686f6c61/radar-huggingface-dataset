# jmbutcher1130/lexsi-tiny-aya-safety-classifier

## Resumen

Lexsi Tiny Aya Safety Classifier es un clasificador binario de seguridad construido sobre el modelo base CohereLabs/tiny-aya-global. No se trata de un modelo generativo independiente, sino de una cabeza de decisión de dos etiquetas que opera sobre un único valor de entrada: la diferencia entre el logit del token "unsafe" y el logit del token "safe" obtenidos de un prompt fijo en Tiny Aya Global. El autor es jmbutcher1130 y el artefacto se publica como un ejercicio de calibración de umbral sobre una muestra muy reducida.

El modelo resuelve un problema acotado: decidir si una petición debe marcarse como insegura comparando esa diferencia de logits con un umbral fijado empíricamente en -1,6875, aprendido a partir de 24 peticiones revisadas manualmente. La relevancia es metodológica más que práctica: ilustra cómo calibrar una señal de seguridad derivada de un LLM pequeño, pero el propio autor advierte que el estudio es demasiado pequeño y limitado al inglés para establecer su idoneidad como filtro de seguridad en producción.

La ficha técnica se ve condicionada por la naturaleza del artefacto: el repositorio contiene únicamente los pesos de la cabeza de decisión (4 parámetros según safetensors) y requiere descargar por separado el modelo base Tiny Aya Global, cuyo uso está sujeto a su propia licencia. No hay información publicada sobre arquitectura interna de la cabeza más allá de su función de decisión lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión lineal de dos etiquetas sobre logits de Tiny Aya Global (modelo base no incluido en el repo) |
| Parametros totales | 4 (pesos de la cabeza de decisión en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Tiny Aya Global) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible en el repo; el modelo base Tiny Aya Global es CC BY-NC 4.0 |
| Formato de pesos | Safetensors (cabeza) + JSON de configuración (classifier_config.json) |

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado de extremo a extremo, sino una cabeza de decisión de dos etiquetas acoplada a un prompt fijo sobre CohereLabs/tiny-aya-global. La entrada es un único escalar: el logit del token "unsafe" menos el logit del token "safe". La cabeza produce dos logits, uno fijo en cero y otro igual a (entrada menos umbral), de modo que la decisión se reduce a comparar la diferencia de logits con el corte -1,6875. En caso de igualdad se elige "unsafe". Tanto la configuración JSON como los pesos safetensors codifican la misma regla de decisión.

El umbral se ajustó a partir de 24 peticiones revisadas manualmente. No se documentan en la información disponible detalles sobre composición del dataset de entrenamiento, número de tokens, uso de RLHF/DPO ni innovaciones técnicas adicionales. El autor describe el trabajo como un estudio pequeño en inglés y remite a un write-up completo en el dataset asociado (STAGE1.md).

## Capacidades

- Clasificación binaria de seguridad (safe / unsafe) de peticiones en inglés.
- Decisión basada en una única señal escalar derivada de los logits del modelo base, sin generación de respuesta.
- Calibración de umbral explícita y reproducible (corte -1,6875, aprendido sobre 24 casos).
- Integración local mediante `classifier.py` y `classifier_config.json` con Torch, Transformers, Accelerate y Safetensors.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es multilingüe: solo inglés.
- No genera texto: devuelve una etiqueta, no una respuesta a la petición.

## Casos de uso

- Filtro previo de peticiones en pipelines de moderación en inglés: el clasificador puede colocarse delante de un LLM generativo para marcar peticiones potencialmente inseguras antes de invocar el modelo principal, aprovechando su bajo coste computacional al requerir solo dos logits del modelo base.
- Investigación en calibración de señales de seguridad: sirve como ejemplo reproducible de cómo derivar un umbral a partir de un conjunto pequeño de casos revisados y comparar el comportamiento de la cabeza entrenada frente al corte original.
- Auditoría de clasificadores basados en logits: permite estudiar la diferencia de comportamiento entre un umbral fijo y una cabeza ajustada, con métricas por caso publicadas en el dataset asociado.
- Prototipado académico de moderación: útil en entornos de laboratorio para experimentar con señales de seguridad derivadas de modelos pequeños antes de invertir en clasificadores dedicados.
- Evaluación comparativa sobre XSTest: el autor publica resultados sobre una muestra fija de 36 casos, lo que permite reproducir y contrastar la metodología.
- Docencia y divulgación sobre seguridad en LLM: ilustra de forma compacta conceptos como umbral de decisión, calibración y trade-off entre falsos positivos y falsos negativos.

## Benchmarks y rendimiento

| Configuración | Aciertos en muestra XSTest de 36 casos | Seguros marcados incorrectamente | Inseguros detectados |
|---|---|---|---|
| Umbral original | 33/36 | No disponible | No disponible |
| Cabeza entrenada | 23/36 | 13/20 benignos | 16/16 inseguros |

Los datos provienen de una muestra fija de 36 casos de XSTest en inglés. La cabeza entrenada mejora la detección de casos inseguros (16/16) a costa de un aumento notable de falsos positivos sobre casos benignos (13/20). El autor advierte que el estudio no establece idoneidad como filtro de seguridad en producción. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Tiny Aya Global, que debe cargarse localmente. La cabeza de decisión en sí ocupa un espacio despreciable (4 parámetros).
- GPU recomendadas: no disponible. Al requerir el modelo base, las necesidades coinciden con las de Tiny Aya Global, no documentadas en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: inferencia local con Torch, Transformers, Accelerate y Safetensors, usando `classifier.py` y `classifier_config.json` junto a una copia autorizada de CohereLabs/tiny-aya-global fijada al commit `af89d219b53ed9b13b8a4645f9c8028973510324`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lexsi Tiny Aya Safety Classifier | Cabeza de clasificación sobre logits | 4 (cabeza) + modelo base | Depende del base | No disponible (base CC BY-NC 4.0) | Hugging Face, repo mínimo |
| CohereLabs/tiny-aya-global | LLM base | No disponible en la información | No disponible | CC BY-NC 4.0 | Hugging Face |
| Clasificadores de seguridad dedicados (p. ej. Llama Guard, ShieldGemma) | Modelos de moderación entrenados | No disponible en la información | No disponible | Varía según modelo | Hugging Face |

La comparación directa con clasificadores de seguridad dedicados no es posible con los datos disponibles: este artefacto es una cabeza de decisión sobre un modelo base y no un clasificador entrenado de forma independiente. No se dispone de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Muestra de calibración muy reducida: el umbral se aprendió de solo 24 peticiones revisadas, lo que limita la fiabilidad estadística.
- Rendimiento modesto en la evaluación publicada: 23/36 aciertos en XSTest, con 13/20 falsos positivos sobre casos benignos.
- Solo inglés: no cubre otros idiomas, lo que restringe su uso en entornos multilingües.
- El autor declara explícitamente que el estudio no establece idoneidad como filtro de seguridad en producción.
- No genera respuestas: solo devuelve una etiqueta, por lo que no sustituye a un modelo de moderación generativo.
- Dependencia del modelo base: requiere una copia local autorizada de Tiny Aya Global fijada a un commit concreto; cambios en el base pueden alterar los logits y, por tanto, la decisión.
- Licencia del artefacto no disponible; el modelo base es CC BY-NC 4.0, lo que restringe el uso comercial.
- Riesgo de alucinación no aplica directamente al no generar texto, pero la señal de seguridad derivada de logits puede ser ruidosa y poco fiable fuera de la distribución evaluada.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmbutcher1130/lexsi-tiny-aya-safety-classifier
- Modelo base Tiny Aya Global: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de puntuaciones por caso: https://huggingface.co/datasets/jmbutcher1130/lexsi-tiny-aya-safety-scores
- Write-up completo (STAGE1.md): https://huggingface.co/datasets/jmbutcher1130/lexsi-tiny-aya-safety-scores/blob/main/STAGE1.md
- Código y comprobador de puntuaciones: https://github.com/Jmbutcher1130/JimButcherStudio
