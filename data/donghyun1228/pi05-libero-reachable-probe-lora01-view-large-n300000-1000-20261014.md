# Donghyun1228/pi05-libero-reachable-probe-lora01-view-large-n300000-1000-20261014

## Resumen

El modelo `Donghyun1228/pi05-libero-reachable-probe-lora01-view-large-n300000-1000-20261014` es un ajuste fino de tipo adaptacion por dinámica inversa (IDM) sobre la base π₀.₅ (pi05), un modelo de Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence. Se distribuye a través de la librería `openpi` y esta orientado a robótica, concretamente a tareas del benchmark LIBERO mediante MuJoCo. El autor es Donghyun1228 y la licencia es Apache 2.0.

El modelo sustituye los datos de origen por un conjunto de "probes" alcanzables generados aleatoriamente, con 300.000 frames seleccionados y solo 1.000 actualizaciones de entrenamiento (batch 32, semilla 42). La estrategia congela el LLM, aplica actualizaciones completas sobre el codificador de visión y usa LoRA de rango 01 sobre el "action expert", con un multiplicador post-Adam de 0,1. Se preserva la inicialización, la normalización y el codificador de muñeca del modelo fuente histórico, sin reentrenar la fuente.

La relevancia de esta ficha es acotada: se trata de un experimento de adaptación reproducible (exportación raw del paso 999, inferencia en BF16, MuJoCo 3.2.3) con 0 descargas y 0 "likes" en el momento de la consulta, y con evidencia de evaluación incluida en el repositorio. Su interés principal es metodológico, como variante de un linaje de checkpoints sobre LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (pi05), con cabecera de acciones flow-matching; ajuste fino con LoRA sobre el "action expert" |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para inferencia; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 6,9 GB gestionado por la libreria openpi) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo VLA π₀.₅ con cabecera de acciones de tipo flow-matching, segun la descripción del checkpoint base `lerobot/pi05_libero_base` y del modelo relacionado `pi05_libero_finetuned`. Sobre esta base, el presente checkpoint aplica un ajuste fino de dinámica inversa (IDM) restringido al dominio objetivo: se congela el LLM, se actualiza por completo el codificador de visión y se entrena mediante LoRA de rango 01 el "action expert", con un multiplicador posterior al optimizador Adam de 0,1. Se conservan la inicialización de fuente histórica, la normalización y el codificador de muñeca original del modelo fuente, y no se reentrena la fuente.

El entrenamiento usa un conjunto de "random-probe" alcanzable con 300.000 frames seleccionados, procedente del dataset `Donghyun1228/libero-reachable-random-waypoint-300k-20261014` (commit `26bc5c4644c7761da2237bf5194fd48716ec5593`). La configuración declarada es de 1.000 actualizaciones, batch 32 y semilla 42, con exportación raw del paso 999. No se especifican en la model card el número total de tokens, la composición completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas en entornos LIBERO simulados con MuJoCo 3.2.3.
- Ejecución de tareas de manipulación de horizonte corto y medio mediante política VLA.
- Adaptación por dinámica inversa (IDM) sobre observaciones visuales del dominio objetivo.
- Inferencia en BF16 sobre el checkpoint exportado en el paso 999.
- Soporte de ejecución distribuida en evaluación: ocho clientes por GPU con flujo de aleatoriedad compartido en servidor.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso general: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no documentadas).
- Capacidad especial "thinking mode": no disponible (no documentada).

## Casos de uso

- Evaluación de políticas VLA en LIBERO: el checkpoint permite reproducir la comparación declarada de 900/2000 éxitos con semilla 7, 40 tareas y 50 ensayos por tarea, útil para medir el efecto de reducir el entrenamiento a 1.000 actualizaciones.
- Investigación en adaptación por dinámica inversa: sirve como referencia para estudiar cómo el entrenamiento IDM solo sobre el objetivo, sin reentrenar la fuente, afecta al rendimiento en tareas alcanzables.
- Sustitución de datos "random-probe": al reemplazar el conjunto original por probes alcanzables, es adecuado para experimentos que comparan estrategias de selección de datos en robótica.
- Estudio del efecto LoRA de rango 01 en el "action expert": permite aislar la contribución del ajuste de bajo rango frente a actualizaciones completas de visión.
- Reproducción con LLM congelado: válido para analizar cuánto rendimiento se preserva cuando solo se ajustan visión y la cabecera de acciones.
- Pruebas de despliegue en entornos de simulación con MuJoCo 3.2.3: sirve para validar pipelines de inferencia BF16 y exportación raw de checkpoints.
- Comparación con el checkpoint fuente (10.000 actualizaciones): útil para analizar el equilibrio entre coste de entrenamiento y tasa de éxito.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| LIBERO (reachable) | 900/2000 exitos; semilla 7, 40 tareas, 50 ensayos/tarea, ocho clientes por GPU | 45,0 % de exito |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Partiendo del tamano del repositorio (6,9 GB, que incluye pesos y evidencias de evaluacion) y de la inferencia en BF16, se requiere una GPU con memoria suficiente para alojar el modelo completo en BF16; el valor exacto no esta documentado.
- GPU recomendadas: no disponibles en la model card. Al ser un modelo VLA, se espera despliegue en GPUs de centro de datos (por ejemplo, familia A100 o H100) para evaluacion multi-cliente.
- Compatibilidad con GPU de consumo: no confirmada. Depende del numero real de parametros, que no se especifica.
- Opciones de despliegue: la libreria declarada es `openpi`; el ecosistema referenciado incluye `lerobot` y repositorios como `Integer003/openpi05` para ajuste fino e inferencia de pi05.
- Latencia y throughput: no disponibles. La evaluacion reportada usa ocho clientes por GPU con un flujo de aleatoriedad compartido en servidor, lo que indica soporte de concurrencia, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Base / tipo | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Donghyun1228/pi05-libero-reachable-probe-lora01-view-large-n300000-1000-20261014` | π₀.₅ (VLA) + LoRA | Ajuste IDM con 300k frames y 1.000 updates | Apache 2.0 | HuggingFace (0 descargas) |
| `Donghyun1228/pi05-libero-reachable-probe-source-n300000-10000-20261014` | π₀.₅ (VLA) | Variante fuente con 10.000 updates (12,4 GB) | no disponible en la busqueda | HuggingFace |
| `lerobot/pi05_libero_base` | π₀.₅ (VLA) | Checkpoint base entrenado y evaluado en LIBERO | no disponible en la busqueda | HuggingFace |
| `lerobot/pi05_libero_finetuned` | π₀.₅ (VLA) | Checkpoint ajustado en LIBERO; solo cabecera de acciones flow-matching | no disponible en la busqueda | HuggingFace / ModelScope |

No se dispone de cifras comparativas de rendimiento (parametros, contexto o tasas de exito) para los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo esta especializado en tareas LIBERO alcanzables y simuladas con MuJoCo 3.2.3; no hay evidencia de generalizacion a entornos reales.
- Entrenamiento muy corto: 1.000 actualizaciones y 300.000 frames seleccionados implican un riesgo elevado de sobreajuste al conjunto de probes y de baja robustez fuera de la distribucion de evaluación.
- Tasa de exito moderada: el 45,0 % reportado (900/2000) deja margen claro de mejora y condiciona su uso en producción.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingüe de la interfaz de lenguaje.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de un modelo de acción, el fallo se manifiesta como acciones incorrectas más que como texto erroneo.
- Dependencia de la inicialización de fuente historica: el checkpoint hereda normalización y codificador de muñeca, por lo que su comportamiento esta ligado a ese linaje concreto.
- Licencia Apache 2.0: permisiva y apta para uso comercial, pero sin garantias ni soporte del autor.
- Sin adopción verificable: 0 descargas y 0 "likes" en el momento de la consulta, lo que limita la validación independiente.
- Fecha de creación y actualización (14 de octubre de 2026) coherentes con el nombre del checkpoint; conviene verificar la vigencia de los artefactos de evidencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-reachable-probe-lora01-view-large-n300000-1000-20261014
- Checkpoint fuente relacionado: https://huggingface.co/Donghyun1228/pi05-libero-reachable-probe-source-n300000-10000-20261014
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/libero-reachable-random-waypoint-300k-20261014
- Checkpoint base: https://huggingface.co/lerobot/pi05_libero_base
- Checkpoint ajustado (LeRobot / ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
- Repositorio de código openpi05 (ajuste fino e inferencia de pi05): https://github.com/Integer003/openpi05
- Ejemplos LIBERO en openpi05: https://github.com/Integer003/openpi05/tree/main/examples/libero
