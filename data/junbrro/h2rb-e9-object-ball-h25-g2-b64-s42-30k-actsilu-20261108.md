# junbrro/h2rb-e9-object-ball-h25-g2-b64-s42-30k-actsilu-20261108

## Resumen

El modelo `e9-object-ball-h25-vla30k` es un checkpoint de inferencia publicado por el usuario junbrro en Hugging Face, derivado de un trabajo de investigación presentado en el workshop de CoRL 2026 ("Human-to-Robot Transfer via Bridging Representation and Action Space in VLAs"). Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, entrenado dentro del proyecto RLDX-1, cuyo objetivo es transferir habilidades de manipulación desde datos humanos a políticas robóticas mediante el puente entre espacio de representación y espacio de acción.

El checkpoint corresponde al paso de entrenamiento 30000 de un job identificado como `junhyeong-e9-object-ball-h25-g2-b64-s42-30k-1108-v1`, con una tarea concreta aparente de manipulación de un objeto esférico ("object-ball") y un contrato de activación SiLU. Los pesos suman 6.915.094.616 parámetros (aproximadamente 6,9 mil millones) y el repositorio ocupa 13,9 GB en formato safetensors.

Es relevante ahora porque expone públicamente un artefacto de investigación reproducible (semilla 42, batch 64, paso 30000) para experimentación en manipulación robótica con VLAs, aunque se distribuye exclusivamente para inferencia y sin datos de entrenamiento, estados del optimizador ni RNG, lo que limita su uso a reproducción de la política entrenada más que a continuación del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (VLA, familia RLDX-1; contrato de activación SiLU) |
| Parametros totales | 6.915.094.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de clasificarlo como un modelo de visión-lenguaje-acción (VLA) dentro del proyecto RLDX-1 y de indicar un "contrato SiLU" (activación SiLU) que debe respetarse en inferencia. El checkpoint está etiquetado como `RLDX-1` y proviene de un job de entrenamiento concreto (`junhyeong-e9-object-ball-h25-g2-b64-s42-30k-1108-v1`), con semilla 42, batch 64 y paso verificado 30000.

El autor indica explícitamente que se trata de una copia de solo inferencia que incluye el tokenizador de acciones exacto, la normalización, la etiqueta de decodificador y el contrato SiLU, pero excluye datos crudos, estados del optimizador y estados RNG. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por imitación más allá de lo que sugiere el nombre del proyecto (transferencia humano-robot). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y de lenguaje, en el marco de un modelo VLA (visión-lenguaje-acción).
- Manipulación de objetos en entornos robóticos, aparentemente especializado en una tarea de objeto esférico ("object-ball") según el identificador del checkpoint.
- Transferencia humano-robot mediante el puente entre representación y espacio de acción descrito en el trabajo de CoRL 2026.
- Inferencia con tokenizador de acciones, normalización y decodificador específicos incluidos en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, modo thinking, visión general, audio ni otras capacidades estándar de LLM.

## Casos de uso

- Reproducción de experimentos de manipulación robótica: el checkpoint permite replicar exactamente la política entrenada en el paso 30000 usando el runtime del proyecto RLDX-1, con el tokenizador y la normalización incluidos, lo que facilita la verificación de resultados del paper.
- Investigación en transferencia humano-robot: sirve como punto de partida para estudiar cómo se mapean representaciones humanas al espacio de acción robótico en tareas de agarre y manipulación de objetos.
- Evaluación comparativa de VLAs: al ser un artefacto reproducible con semilla y paso fijados, puede usarse como baseline en estudios comparativos de políticas VLA para una tarea concreta.
- Desarrollo de pipelines de inferencia robótica: integrable en el runtime RLDX-1 para ejecutar la política sobre un robot real o simulado en la tarea de objeto esférico.
- Docencia y formación en robótica con IA: útil para demostrar el ciclo completo de un VLA entrenado (observación, tokenización de acciones, decodificación) en un entorno controlado.
- Auditoría de contratos de inferencia: el repositorio documenta explícitamente el contrato SiLU y las etiquetas de decodificador, lo que permite validar la coherencia entre pesos y runtime en despliegues de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explícitamente que la finalización del entrenamiento no equivale a una tasa de éxito robótica medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 6,9 mil millones de parámetros en safetensors (13,9 GB en el repo), en fp16 se necesitan aproximadamente 14 GB solo para pesos, más memoria para activaciones y buffers del runtime VLA.
- GPU recomendadas: no disponible; por tamaño, cabría esperar GPUs de 24 GB o más (RTX 4090, A100, H100) para fp16, aunque el autor no lo especifica.
- ¿Cabe en GPU de consumo? Probablemente en una RTX 4090 (24 GB) en fp16, pero no está confirmado por el autor; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: el autor exige el runtime del proyecto RLDX-1; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA para manipulación robótica) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución; consultar con el autor antes de cualquier uso en producción.
- Checkpoint de solo inferencia: no incluye datos crudos, estados del optimizador ni RNG, por lo que no es posible reanudar el entrenamiento desde este artefacto.
- Dependencia estricta del runtime RLDX-1: requiere el tokenizador de acciones, la normalización, la etiqueta de decodificador y el contrato SiLU exactos; usar otro runtime puede invalidar los resultados.
- Tarea aparentemente muy específica ("object-ball"): la generalización a otras tareas de manipulación no está documentada.
- El autor advierte que el paso de entrenamiento verificado no equivale a una tasa de éxito robótica medida; no hay evaluación de rendimiento publicada.
- Riesgo de alucinación y sesgos: no documentados, pero al ser un modelo de investigación sin evaluación pública, no hay garantías de robustez en entornos no vistos.
- Idiomas y contexto: no disponibles; no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes independientes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/h2rb-e9-object-ball-h25-g2-b64-s42-30k-actsilu-20261108
- GitHub del proyecto: https://github.com/jun-brro/h2rb
- Referencia del workshop: CoRL 2026 Workshop Oral Presentation, "Human-to-Robot Transfer via Bridging Representation and Action Space in VLAs" (enlazado desde el repositorio de GitHub anterior).
