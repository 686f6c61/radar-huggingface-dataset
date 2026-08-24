# Deehan/electra-ps-rationale-only-locked

## Resumen

Deehan/electra-ps-rationale-only-locked es un modelo de clasificación de texto basado en el discriminador ELECTRA-large, ajustado para una tarea de razonamiento denominada "ps" (probablemente relacionada con *pointer selection* o *premise selection*). El modelo ha sido entrenado para operar únicamente con la evidencia o justificación (rationale) de la entrada, excluyendo el contexto completo, y su arquitectura base es el discriminador de ELECTRA-large de Google. Con 335 millones de parámetros, el modelo alcanza una precisión del 78,10 % en validación y del 78,60 % en el conjunto de prueba.

La relevancia de este modelo reside en su enfoque experimental: al restringir la entrada a la evidencia relevante, se explora cómo afecta la selección de información al rendimiento en tareas de razonamiento. Esto es útil para investigaciones sobre interpretabilidad y eficiencia en el procesamiento de lenguaje natural. El modelo se distribuye en formato safetensors y es compatible con el ecosistema de Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (discriminador) |
| Parametros totales | 335.143.938 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ELECTRA, que en lugar de enmascarar tokens y reconstruirlos como BERT, entrena un discriminador que distingue entre tokens reales y tokens reemplazados por un generador. Esto hace que el preentrenamiento sea más eficiente en términos de muestra. La variante utilizada es el discriminador ELECTRA-large, que tiene 24 capas, 16 cabezales de atención y una dimensión oculta de 1024, con un total de aproximadamente 335 millones de parámetros.

El ajuste fino se ha realizado sobre la tarea "ps" (presumiblemente "premise selection"), y la característica distintiva es que el modelo recibe únicamente la justificación (rationale) de la entrada, no el texto completo. Los detalles del conjunto de datos de entrenamiento, el número de tokens, el procedimiento de ajuste y los hiperparámetros no se han documentado en la model card. No se indica si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Clasificación de texto: el modelo realiza clasificación binaria o multiclase según la tarea "ps" definida por el autor.
- Razonamiento basado en evidencia: al operar únicamente con la justificación, el modelo es sensible a la calidad de la evidencia proporcionada.
- Integración con Transformers: compatible con la API de Hugging Face para inferencia y ajuste posterior.
- No se han documentado capacidades de generación de texto, tool calling, agentes o multilingüismo.

## Casos de uso

- Investigación sobre razonamiento natural: el modelo puede emplearse en estudios que analicen cómo la presencia o ausencia de contexto afecta al rendimiento en tareas de razonamiento.
- Evaluación de la calidad de evidencia: dado que solo recibe la justificación, puede utilizarse para medir si un fragmento de texto es suficiente para resolver una tarea.
- Análisis de interpretabilidad: al separar la entrada en rationale y contexto, se pueden estudiar qué partes de un texto son decisivas para la predicción.
- Línea base experimental: sirve como referencia para comparar con otros modelos que reciben el contexto completo.
- Clasificación de textos cortos: si la tarea "ps" es una clasificación de pasajes, el modelo puede aplicarse a textos breves donde la justificación sea suficiente.
- Investigación académica: útil para reproducir o extender los resultados del autor en el campo de la selección de premisas.

## Benchmarks y rendimiento

| Conjunto | Precisión |
|---|---|
| Validación | 0,7810 |
| Test | 0,7860 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32, por lo que puede ejecutarse en GPUs con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU con más de 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.).
- Cabe en GPUs de consumo: sí, en la mayoría de las GPUs modernas de consumo.
- Opciones de despliegue: Transformers de HuggingFace, vLLM, TGI, o mediante la API de HuggingFace Inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (ps) | Licencia |
|---|---|---|---|---|
| Deehan/electra-ps-rationale-only-locked | 335 M | no disponible | 0,7860 | no disponible |
| Deehan1866/ps-fullymasked-electra-large-discriminator-no_rationale | 335 M | no disponible | no disponible | no disponible |
| Deehan1866/ps-angle3-masked | 335 M | no disponible | no disponible | no disponible |

Los modelos de la misma familia (Deehan1866) presentan variaciones en la máscara de entrada (fullymasked, angle3, etc.), pero no se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- La model card no documenta sesgos ni riesgos específicos del modelo.
- No se especifica la licencia, por lo que su uso comercial es incierto y debe consultarse al autor.
- El modelo ha sido ajustado para una tarea concreta y puede no generalizar bien a otras tareas de clasificación de texto.
- Al recibir solo la justificación, su rendimiento depende en gran medida de la calidad de la evidencia proporcionada.
- No se han publicado datos sobre los conjuntos de entrenamiento y evaluación, lo que dificulta la reproducibilidad.
- El riesgo de alucinación no aplica al ser un modelo discriminativo, pero sí puede presentar errores de clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deehan/electra-ps-rationale-only-locked
- Perfil del autor: https://huggingface.co/Deehan1866/models
- Modelo relacionado: https://huggingface.co/Deehan1866/ps-fullymasked-electra-large-discriminator-no_rationale
- Paper de ELECTRA: https://arxiv.org/abs/2003.10555
