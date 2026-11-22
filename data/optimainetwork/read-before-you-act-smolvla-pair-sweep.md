# optimainetwork/read-before-you-act-smolvla-pair-sweep

## Resumen

`optimainetwork/read-before-you-act-smolvla-pair-sweep` es una colección de 13 políticas SmolVLA ajustadas por fine-tuning a partir de `lerobot/smolvla_base` (LeRobot 0.4.4) para una tarea robótica concreta: alcanzar el cartón cuya etiqueta coincide con el texto de la instrucción, usando dos cámaras adicionales de primer plano que hacen legible cada etiqueta (texto de unos 33 px). El experimento mide si el aprendizaje por imitación aprende a distinguir nombres visualmente parecidos cuando se le presentan muchos pares distintos de ese tipo, variando el número de pares sintéticos (30, 300 o 3.000) con un total fijo de 3.000 demostraciones.

El resultado es deliberadamente negativo: con nombres parecidos la precisión se queda en el nivel del azar (~50 %) en todas las escalas, mientras que con nombres claramente distintos sube al 92,7 %. La regla de decisión se fijó antes de entrenar, lo que refuerza la validez del hallazgo. Los checkpoints se publican para que el experimento pueda reproducirse o ampliarse.

Se trata por tanto de un artefacto de investigación en simulación (MuJoCo), no de un modelo de propósito general: no hay datos de arquitectura, tamaño, contexto ni idiomas más allá de los que aporta el modelo base. Su interés es metodológico, para quienes estudian los límites del aprendizaje por imitación en tareas de grounding lingüístico fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (política visión-lenguaje-acción de LeRobot), fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en texto; idioma no especificado) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (checkpoints de LeRobot; formato concreto no indicado) |

## Arquitectura y entrenamiento

Cada carpeta corresponde a una ejecución con la nomenclatura `pairs_syn<N>[_aux1][_long|_distinct]_s<seed>`. La variante `aux1` añade una pérdida auxiliar sobre qué cartón se nombra (capas de lenguaje entrenadas, batch 16); sin ella, se usa batch 32 con el backbone congelado. La variante `long` entrena 18.000 pasos en lugar de 6.000, y `distinct` es el control con nombres claramente diferentes. El número de pares sintéticos es 30, 300 o 3.000, siempre con 3.000 demostraciones.

La tarea es de manipulación robótica con dos entradas de cámara adicionales de primer plano que hacen legible la etiqueta (texto de ~33 px). El entrenamiento es por imitación (no se menciona RLHF ni DPO). La evaluación se hace sobre 600 episodios sintéticos retenidos, con intervalos de Wilson al 95 % agrupados por semilla. No se detalla el número de tokens de entrenamiento ni la composición del dataset más allá de los pares sintéticos descritos.

## Capacidades

- Política robótica visión-lenguaje-acción: recibe instrucción en texto e imágenes de cámara y produce acciones de manipulación en simulación (MuJoCo).
- Grounding lingüístico fino: intenta asociar el texto de la instrucción con la etiqueta legible del cartón objetivo.
- Aprendizaje por imitación a partir de demostraciones (3.000 por ejecución).
- Variante con pérdida auxiliar de elección de cartón (`aux1`).
- Control experimental con nombres claramente distintos (`distinct`).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Reproducción del experimento: reejecutar el barrido de pares con las mismas semillas y configuraciones para verificar la curva de precisión reportada.
- Estudio de los límites del imitation learning: usar los checkpoints como línea base negativa al investigar por qué el modelo no distingue nombres parecidos.
- Extensión del barrido: añadir escalas intermedias de pares (por ejemplo, 100 o 1.000) o nuevas variantes de pérdida auxiliar para localizar el punto de ruptura.
- Comparación de arquitecturas VLA: contrastar SmolVLA con otras políticas sobre la misma tarea y el mismo protocolo de evaluación.
- Diseño de datasets sintéticos: evaluar cómo afecta la diversidad y el parecido de las etiquetas a la generalización en tareas de grounding.
- Docencia e investigación en robótica: ejemplo reproducible de resultado negativo con regla de decisión preregistrada y evaluación estadística con intervalos de Wilson.

## Benchmarks y rendimiento

Precisión sobre pares retenidos (600 episodios sintéticos; intervalo de Wilson al 95 %, agrupado por semillas):

| Política | 30 pares | 300 pares | 3.000 pares |
|---|---|---|---|
| SmolVLA | 49,5 | 49,7 | 49,2 [46-52] |
| + choice loss | 48,8 | 48,2 | 50,1 [47-53] |
| + choice loss, 18.000 pasos | | | 50,3 [46-54] |
| + choice loss, nombres claramente distintos | | | 92,7 [89-95] |

Los nombres parecidos se mantienen en el nivel del azar en todas las escalas; solo los nombres claramente distintos se aprenden.

## Requisitos de hardware

- VRAM estimada: no disponible (no se publican parámetros ni tamaño de los checkpoints).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinada; depende del tamaño de `lerobot/smolvla_base`, no especificado en la información disponible.
- Opciones de despliegue: librería LeRobot 0.4.4; el entorno de evaluación es simulación MuJoCo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolVLA pair-sweep) | no disponible | no disponible | ~50 % con nombres parecidos; 92,7 % con nombres distintos | apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` (modelo base) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks entre este modelo y alternativas en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo por diseño: no supera el azar en la discriminación de nombres visualmente parecidos; no debe usarse como política funcional para esa tarea.
- Solo simulación (MuJoCo); no se ha validado en robot físico.
- No se documentan sesgos, pero al ser un modelo de investigación no se ha auditado su comportamiento fuera del entorno sintético.
- Riesgo de alucinación no evaluado; el modelo no es generativo de texto libre.
- Idiomas soportados no especificados; las instrucciones son en texto y el idioma no se indica.
- Licencia apache-2.0 permite uso comercial, pero el modelo no es apto para producción por su rendimiento a nivel de azar en la tarea objetivo.
- Los checkpoints son artefactos de experimento; la reproducibilidad depende de LeRobot 0.4.4 y del entorno MuJoCo.

## Enlaces

- Hugging Face: https://huggingface.co/optimainetwork/read-before-you-act-smolvla-pair-sweep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot: https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org
