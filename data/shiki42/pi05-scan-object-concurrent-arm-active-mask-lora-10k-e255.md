# Shiki42/pi05-scan-object-concurrent-arm-active-mask-lora-10k-e255

## Resumen

Este repositorio contiene un ajuste fino con LoRA de PI0.5 (etiqueta `pi05`), publicado por el usuario Shiki42 bajo la librería `openpi` y con `pipeline_tag: robotics`. No es un modelo de lenguaje generalista, sino una política de manipulación robótica derivada de los pesos base PI0.5 Base en JAX, entrenada específicamente para la tarea `scan_object` del simulador RoboTwin. El entrenamiento se realizó con un único experto LoRA, 10.000 actualizaciones del optimizador, tamaño de lote 16 y semilla 87431, sobre un conjunto de 50 episodios.

La particularidad técnica del ajuste es el uso de `observation.arm_active_mask` como peso de supervisión por brazo: valor 1 para brazo activo y 0 para brazo enmascarado, aplicado a los siete canales de acción de cada brazo. Esto permite entrenar con datos en los que uno de los brazos permanece inactivo sin que la pérdida penalice las acciones de ese brazo. Los horizontes de acción conservan la máscara de relleno de episodio del pipeline original, y el autor indica explícitamente que no se emplea el campo `retime.*_idle`.

Se trata de un artefacto de investigación con difusión muy limitada (0 descargas y 0 likes en el momento de la consulta) y con evaluación pendiente: el autor señala que el resultado pareado es E256, sobre la suite congelada de 100 escenas de `scan_object`, y que los resultados permanecen como "reported / audit pending" hasta su aprobación explícita. La licencia no está declarada, lo que condiciona cualquier uso más allá de la experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (openpi); detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | No disponible; el repositorio ocupa 6,3 GB |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; se publican parámetros de inferencia sin documentar cuantizaciones alternativas (GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Parámetros de inferencia en formato JAX del stack openpi, junto con activos de normalización, configuración resuelta, procedencia y hashes SHA-256 |
| Tipo de ajuste | LoRA de un solo experto (single-expert) sobre PI0.5 Base JAX |
| Pasos de entrenamiento | 10.000 actualizaciones del optimizador |
| Tamaño de lote | 16 |
| Semilla | 87431 |
| Dataset de entrenamiento | `Shiki42/ctr-scan-object-concurrent-20260916`, commit `80a951edec636be7e22fca274a88b0b2ff260c2a`, 50 episodios |
| Canales de acción | 7 canales por brazo (izquierdo y derecho), con máscara de supervisión por brazo |
| Tarea / entorno | `scan_object` en RoboTwin |
| Pipeline declarado | robotics |
| Fecha de creación (según metadatos) | 2026-09-18 |
| Fecha de actualización (según metadatos) | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste LoRA de PI0.5, la política VLA distribuida dentro del proyecto openpi. La model card no describe la arquitectura interna (tipo de transformer, codificador visual, mecanismo de generación de acciones ni número de capas), por lo que esos detalles quedan como no disponibles en la información proporcionada. Lo que sí se documenta es el punto de partida: los pesos "PI0.5 Base JAX" fijados (pinned), es decir, el adaptador no se inicializa desde el modelo final de instrucciones ni desde otro ajuste previo.

El procedimiento de entrenamiento es un LoRA de un único experto con 10.000 pasos de optimizador y lote de 16 sobre 50 episodios del dataset citado. La innovación relevante no está en la arquitectura sino en la estrategia de supervisión: se utiliza el campo publicado `observation.arm_active_mask` como peso de pérdida para cada brazo (1 = activo, 0 = enmascarado) en los siete canales de acción de ese brazo. El efecto práctico es que las transiciones en las que un brazo espera o no participa no generan gradiente sobre ese brazo, evitando que la política aprenda a mover un brazo que la demostración mantiene quieto. El autor remarca que la máscara aplicada a los horizontes de acción conserva el relleno de episodio del pipeline original y que no se usa `retime.*_idle` como señal de enmascaramiento.

El repositorio publica únicamente parámetros de inferencia, activos de normalización, configuración resuelta, procedencia y hashes SHA-256. No se incluyen estados del optimizador ni del cargador de datos, por lo que el artefacto no permite reanudar el entrenamiento tal cual: serviría como inicialización para un nuevo ajuste, no como snapshot reanudable.

## Capacidades

- Generación de acciones de manipulación robótica para la tarea `scan_object` en el simulador RoboTwin.
- Control bimanual: produce acciones en siete canales por brazo, con supervisión independiente por brazo mediante `arm_active_mask`.
- Ejecución de políticas de horizonte de acción (action chunking) heredando la máscara de relleno de episodio del pipeline original.
- Ajuste especializado de bajo rango: al ser un LoRA, puede combinarse con los pesos base PI0.5 para reconstruir la política ajustada, según el flujo de openpi.
- Reproducibilidad parcial: el autor fija el commit del dataset, la semilla y los hiperparámetros principales.
- Tool calling / function calling: no aplica ni está documentado (modelo de acción robótica, no de texto).
- Soporte de agentes o razonamiento multi-paso en lenguaje natural: no aplica ni está documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de pensamiento, visión, audio): no documentadas; el modelo consume observaciones del entorno RoboTwin, pero la model card no detalla la composición de dichas observaciones.

## Casos de uso

- Investigación en políticas VLA bimanuales: el adaptador permite estudiar cómo afecta el enmascaramiento de un brazo inactivo al aprendizaje de una política de manipulación, comparando contra un ajuste sin máscara sobre el mismo dataset.
- Reproducción de experimentos controlados: con semilla 87431, lote 16 y 10.000 pasos fijados, sirve como referencia reproducible para replicar o refutar resultados dentro del ecosistema openpi.
- Punto de partida para ajustes incrementales: al publicarse los parámetros de inferencia y los activos de normalización, puede usarse como inicialización de nuevos LoRA sobre tareas relacionadas, asumiendo que no hay estado de optimizador.
- Evaluación en simulación RoboTwin: ejecutar la política en la suite de 100 escenas de `scan_object` para medir tasas de éxito antes de considerar cualquier traslado a hardware.
- Estudio de estrategias de supervisión selectiva: el uso de `arm_active_mask` como peso por canal es directamente reutilizable en otros conjuntos con anotación equivalente (por ejemplo, tareas con un brazo de apoyo).
- Generación de datos sintéticos de manipulación: la política puede emplearse para rodar trayectorias en simulación y así ampliar datasets de entrenamiento, siempre que se valide la calidad de las trayectorias generadas.
- Docencia y formación en robótica: despliegue en entornos simulados para ilustrar el ciclo completo de un ajuste LoRA sobre un modelo fundacional de robótica, sin riesgo para hardware físico.
- Comparativa de métodos de adaptación: contrastar LoRA frente a ajuste completo con el mismo presupuesto de cómputo, dado que aquí se documentan con precisión los hiperparámetros del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación pareada corresponde a E256, sobre la suite congelada de 100 escenas de `scan_object`, y que los resultados figuran como "reported / audit pending" hasta su aprobación explícita. La propia model card advierte que no debe inferirse un rendimiento correcto a partir de una subida exitosa del repositorio. No se dispone, por tanto, de cifras de tasa de éxito, MMLU, HumanEval, GSM8K ni de ninguna otra métrica.

| Benchmark | Resultado | Notas |
|---|---|---|
| Suite `scan_object` (100 escenas, E256) | No disponible | Pendiente de auditoría y aprobación de archivo, según el autor |
| Otros benchmarks estándar | No disponible | No aplicables o no reportados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aproximada, la carga de los pesos publicados ocuparía en torno a los 6,3 GB que ocupa el repositorio; sumando activaciones, buffers de observación y el estado del experto de acción, es razonable planificar un margen adicional, aunque la cifra exacta depende del número de cámaras y del horizonte de acciones, datos que no se documentan.
- GPU recomendadas: no disponibles en la información proporcionada. Para un modelo de este tamaño, opciones habituales serían GPU de centro de datos (A100 40/80 GB, H100) o GPU de consumo con 24 GB de VRAM.
- ¿Cabe en GPU de consumo? Es probable que sí en tarjetas con 24 GB (por ejemplo, RTX 3090 o RTX 4090), pero es una estimación no confirmada por el autor; no hay verificación publicada.
- Opciones de despliegue: el modelo declara la librería `openpi`, por lo que el despliegue esperado es a través de ese stack en JAX. No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que además no son las herramientas habituales para políticas de acción robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. La model card no reporta métricas propias ni de terceros, y la búsqueda web realizada no ha devuelto documentación técnica relevante sobre este artefacto ni sobre adaptadores equivalentes.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LoRA `pi05-scan-object-...-e255`) | No disponible | No disponible | No disponible (auditoría pendiente) | No disponible | HuggingFace, 0 descargas, 0 likes |
| PI0.5 Base (openpi) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Referenciado como pesos de inicialización |
| Otros adaptadores LoRA de la misma familia | No disponible | No disponible | No disponible | No disponible | No se han localizado en la información disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso productivo.
- Ausencia de evaluación publicada: los resultados de la suite de 100 escenas están pendientes de auditoría, según el propio autor, por lo que no existe evidencia verificada de rendimiento.
- Especialización extrema: el ajuste está entrenado únicamente para la tarea `scan_object` en RoboTwin; no se documenta transferencia a otras tareas, entornos ni a hardware real (riesgo de brecha sim-to-real).
- Dataset reducido: 50 episodios es un volumen bajo, con riesgo de sobreajuste a las condiciones concretas de las demostraciones.
- Dependencia de la anotación de máscara: el comportamiento del modelo está ligado a la calidad y al criterio de `observation.arm_active_mask` del conjunto de datos; errores o inconsistencias en esa anotación se traducen directamente en el entrenamiento.
- No es un snapshot reanudable: al no publicarse el estado del optimizador ni del cargador, no es posible continuar el entrenamiento exactamente desde el punto en que se detuvo.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no hay revisiones independientes, replicaciones ni informes de fallos.
- Sin información sobre sesgos: no se documentan sesgos demográficos, de entorno ni de distribución de objetos; tampoco composición detallada del dataset.
- Metadatos anómalos: las fechas de creación y actualización registradas (2026-09-18) resultan llamativas y conviene verificarlas antes de citar el artefacto.
- Sin datos de cuantización ni de optimización de inferencia: no hay guías de despliegue eficiente, cuantizaciones soportadas ni cifras de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/pi05-scan-object-concurrent-arm-active-mask-lora-10k-e255
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/Shiki42/ctr-scan-object-concurrent-20260916 (commit `80a951edec636be7e22fca274a88b0b2ff260c2a`)
- Proyecto base openpi (referenciado por la librería declarada, no enlazado en la información proporcionada): https://github.com/PhysicalIntelligence/openpi
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las únicas devoluciones fueron páginas generales de YouTube sin relación con el modelo, por lo que no se incluyen.
