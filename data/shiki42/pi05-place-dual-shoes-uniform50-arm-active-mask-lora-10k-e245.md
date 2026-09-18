# Shiki42/pi05-place-dual-shoes-uniform50-arm-active-mask-lora-10k-e245

## Resumen

Este repositorio contiene un ajuste fino mediante LoRA del modelo PI0.5, un modelo visión-lenguaje-acción (VLA) para control robótico desarrollado en el marco del proyecto openpi. El autor, Shiki42, lo ha entrenado para una única tarea de manipulación bimanual denominada `place_dual_shoes` (colocación de un par de zapatos), a partir de los pesos base PI0.5 en formato JAX. No se trata de un modelo de propósito general, sino de un adaptador especializado: el repositorio publica únicamente los parámetros de inferencia y los activos de normalización asociados, no el estado del optimizador.

El entrenamiento se realizó con 10.000 actualizaciones del optimizador, tamaño de lote 16 y semilla 87431, sobre un conjunto de datos de 50 episodios (`Shiki42/ctr-place-dual-shoes-uniform50-20260917`, commit `6339e0b`). La particularidad técnica del ajuste es el uso directo del campo `observation.arm_active_mask` como peso de supervisión por brazo: valor 1 para brazo activo y 0 para brazo enmascarado, aplicado a los siete canales de acción de cada brazo, mientras que los horizontes de acción conservan la máscara de relleno de episodio original.

Su relevancia es acotada y de carácter reproducible: sirve como artefacto de referencia para estudiar el enmascaramiento por brazo activo en el ajuste de VLA y como punto de partida de la evaluación emparejada E246 sobre la suite congelada de 100 escenas de `place_dual_shoes`. El propio autor advierte que los resultados de esa evaluación se registran por separado y que no deben inferirse del hecho de que la subida se completase correctamente; permanecen pendientes de auditoría hasta su aprobación explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) PI0.5, ajustado con LoRA sobre un único experto; detalles internos de la arquitectura no disponibles |
| Parámetros totales | No disponible (el repositorio ocupa 6,3 GB; en bf16 equivaldría a unos 3.100 millones de parámetros, estimación no confirmada por el autor) |
| Longitud de contexto | No disponible (no aplica el concepto de contexto textual; el modelo consume observaciones e historial de acciones) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de robótica; el condicionamiento por lenguaje no está documentado en la información proporcionada) |
| Licencia | No disponible |
| Formato de pesos | Parámetros de inferencia en formato JAX (openpi), inicializados desde los pesos base PI0.5 en JAX; incluye activos de normalización, configuración resuelta, procedencia y hashes SHA-256 |
| Tamaño del repositorio | 6,3 GB |
| Actualizaciones del optimizador | 10.000 |
| Tamaño de lote | 16 |
| Semilla | 87431 |
| Dataset de entrenamiento | `Shiki42/ctr-place-dual-shoes-uniform50-20260917` (commit `6339e0b84491db2fde6e55089bcc9312abb48798`), 50 episodios |
| Tarea | `place_dual_shoes` |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo parte de los pesos base PI0.5 publicados por el proyecto openpi y aplica un ajuste fino LoRA de un solo experto sobre la tarea `place_dual_shoes`. El entrenamiento se ejecutó durante 10.000 actualizaciones del optimizador con tamaño de lote 16 y semilla 87431, inicializando desde una revisión fijada de los pesos base en JAX. El conjunto de datos empleado contiene 50 episodios con un esquema de muestreo uniforme al 50 %.

La innovación metodológica más destacable es el uso del campo `observation.arm_active_mask` como peso de supervisión por brazo: los valores 1 (activo) y 0 (enmascarado) se aplican a los siete canales de acción de cada brazo, de modo que el modelo no recibe gradiente de las acciones del brazo que el dataset marca como inactivo. Los horizontes de acción mantienen la máscara de relleno de episodio procedente del pipeline original. El autor especifica explícitamente que este enmascaramiento no utiliza los campos `retime.*_idle`, lo que lo distingue de otras variantes del mismo linaje. No se publican el estado del optimizador ni el del cargador de datos, por lo que el artefacto no es un punto de reanudación de entrenamiento. No se dispone de información sobre el número total de tokens, la composición completa del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Control robótico bimanual para la tarea específica de colocación de un par de zapatos (`place_dual_shoes`).
- Predicción de acciones sobre siete canales por brazo, con enmascaramiento selectivo del brazo inactivo.
- Inferencia a partir de observaciones visuales y de estado del robot, integrada en el marco openpi.
- Carga de activos de normalización empaquetados junto con los pesos, lo que permite reproducir el preprocesamiento del entrenamiento.
- Aprendizaje de una única tarea: no se documenta generalización a otras tareas ni transferencia a otros entornos.
- Soporte de tool calling o function calling: no aplica, no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica, no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de razonamiento, visión general, audio): no disponibles más allá del uso previsto como política visomotora.

## Casos de uso

- Manipulación robótica bimanual en simulación: ejecutar la política sobre la suite `place_dual_shoes` de RoboTwin para colocar un par de zapatos, aprovechando el enmascaramiento por brazo para alternar la participación de cada efector.
- Investigación sobre adaptación LoRA de modelos VLA: servir como caso de estudio reproducible (10.000 pasos, lote 16, semilla 87431) para medir cuánto rendimiento se obtiene ajustando un único experto frente al ajuste completo.
- Estudio del enmascaramiento de brazo activo: comparar esta variante con otras que usan los campos `retime.*_idle`, ya que el autor documenta explícitamente la diferencia metodológica.
- Punto de partida para ajustes posteriores: al publicarse los parámetros de inferencia y la normalización asociada, puede reutilizarse como inicialización de nuevos LoRA sobre tareas relacionadas.
- Evaluación emparejada E246: emplear este checkpoint junto con su par de evaluación sobre la suite congelada de 100 escenas para medir la reproducibilidad del pipeline, teniendo en cuenta que los resultados están pendientes de auditoría.
- Auditoría de reproducibilidad: los hashes SHA-256, la configuración resuelta y la procedencia incluidos en el repositorio permiten verificar que un despliegue utiliza exactamente los mismos artefactos que se publicaron.
- Integración en pipelines de evaluación automatizada de políticas robóticas, cargando el checkpoint desde un servidor de inferencia openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación emparejada es E246, sobre la suite histórica congelada de 100 escenas de `place_dual_shoes`, que los resultados se registran por separado y que no deben inferirse de una subida correcta del repositorio. Dichos resultados permanecen en estado de «reportado / auditoría pendiente» hasta su aprobación explícita. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas de éxito de tarea para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Partiendo del tamaño del repositorio (6,3 GB, que incluye pesos y activos auxiliares), una carga en bf16 requeriría del orden de 8-14 GB de VRAM solo para los pesos, más el espacio de activaciones; se trata de una estimación derivada, no confirmada por el autor.
- GPU recomendadas: no disponibles. Para una carga de este orden de magnitud serían razonables una RTX 4090 (24 GB), una L40S (48 GB) o una A100 (40/80 GB), pero el autor no publica requisitos.
- Cabe en GPU de consumo: probablemente sí en modelos con 24 GB o más de VRAM, siempre que la estimación de tamaño sea correcta; no confirmado.
- Opciones de despliegue: el repositorio está etiquetado con la librería openpi y contiene parámetros de inferencia en formato JAX, por lo que el despliegue natural es el servidor de políticas de openpi. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de especificaciones verificadas de modelos alternativos (número de parámetros, contexto, licencia o métricas) que permitan una comparación cuantitativa. A continuación se ofrece únicamente una comparación cualitativa de categoría; los valores numéricos de los modelos alternativos quedan como no disponibles al no haberse podido verificar.

| Modelo | Categoría | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (LoRA PI0.5 `place_dual_shoes`) | Ajuste LoRA de un VLA sobre una única tarea | Colocación bimanual de un par de zapatos | No disponible | Pública en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| PI0.5 base (openpi) | VLA generalista de propósito amplio | Múltiples tareas de manipulación | No disponible en la información proporcionada | Público a través del proyecto openpi |
| Otras variantes LoRA de PI0.5 para `place_dual_shoes` | Ajustes de un solo experto sobre la misma tarea | Colocación bimanual de un par de zapatos | No disponible | No verificado en la información proporcionada |
| Modelos VLA abiertos de otros linajes (por ejemplo, OpenVLA o GR00T) | VLA generalistas | Manipulación diversa | No disponible | No verificado en la información proporcionada |

## Limitaciones y advertencias

- Modelo de tarea única: está ajustado exclusivamente para `place_dual_shoes`; no hay evidencia de generalización a otras tareas, objetos o entornos.
- Sin resultados de evaluación publicados: la evaluación E246 está pendiente de auditoría y el autor advierte explícitamente que no debe inferirse un buen rendimiento de la subida del repositorio.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. La licencia del modelo base PI0.5 tampoco se detalla en la información proporcionada, por lo que conviene verificar la licencia upstream antes de cualquier uso en producción.
- Idiomas no disponibles: al ser un modelo de robótica, no se documentan capacidades lingüísticas ni cobertura multilingüe.
- Sesgos: no documentados, pero el entrenamiento con solo 50 episodios implica un sesgo fuerte hacia las condiciones concretas de recogida de esos episodios (iluminación, posiciones iniciales, disposición de los objetos).
- Riesgo de alucinación: en el contexto de una política visomotora se traduce en acciones plausibles pero incorrectas cuando la observación se aleja de la distribución del dataset; sin métricas publicadas no puede cuantificarse.
- Artefacto no reanudable: no se publican el estado del optimizador ni el del cargador de datos, por lo que no es posible continuar el entrenamiento exactamente desde este punto.
- Dependencia del pipeline de normalización: los pesos requieren los activos de normalización empaquetados; usarlos con otra normalización produciría resultados incorrectos.
- Enmascaramiento específico: el uso de `observation.arm_active_mask` como peso de supervisión condiciona el comportamiento del modelo al esquema de anotación del dataset de 50 episodios y no es directamente trasladable a otros datasets.
- Reproducibilidad limitada a los artefactos publicados: los hashes SHA-256 permiten verificar los ficheros, pero el proceso completo de entrenamiento no está documentado en detalle en la información disponible.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Shiki42/pi05-place-dual-shoes-uniform50-arm-active-mask-lora-10k-e245
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-uniform50-20260917 (commit `6339e0b84491db2fde6e55089bcc9312abb48798`)
- Proyecto openpi (librería declarada en el repositorio): https://github.com/Physical-Intelligence/openpi
- Las búsquedas web realizadas no devolvieron resultados relevantes: únicamente aparecieron páginas de ayuda de Google sin relación con el modelo, por lo que no se dispone de papers, blogs ni demos adicionales que enlazar.
