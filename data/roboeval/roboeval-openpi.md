# RoboEval/roboeval-openpi

## Resumen

roboeval-openpi es un repositorio de checkpoints de robótica archivados por el proyecto RoboEval, construidos sobre la familia de modelos openpi (pi0 y pi0.5). No se trata de un modelo único, sino de una colección de nueve checkpoints finales (step 29999) entrenados para tareas de manipulación robótica y evaluación de políticas visomotoras. El repositorio conserva únicamente los pesos de inferencia; los estados intermedios de entrenamiento y el estado del optimizador no se han preservado, lo que limita su uso para reanudar entrenamientos o para análisis de dinámica de aprendizaje.

La relevancia de esta publicación es fundamentalmente de archivo y reproducibilidad: agrupa variantes que difieren en el espacio de acciones (efector final o articulaciones, en modo absoluto o delta), en el uso de LoRA para ajuste eficiente y en la variante de modelo base (pi0.5 frente a pi0_fast). Esto permite a investigadores comparar configuraciones de política bajo un mismo pipeline de evaluación, aunque la información pública sobre el dataset de entrenamiento, la licencia y los idiomas es inexistente en la model card.

El tamaño del repositorio (90,8 GB) refleja la suma de los nueve checkpoints, cada uno con pesos completos de inferencia. No se documentan parámetros totales, longitud de contexto ni esquemas de cuantización, por lo que muchos campos técnicos deben marcarse como no disponibles a partir de la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints de la familia openpi: pi0.5 y pi0_fast) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos de inferencia en subcarpetas por checkpoint) |

## Arquitectura y entrenamiento

Los checkpoints pertenecen a la familia openpi, que incluye las variantes pi0.5 y pi0_fast. La model card no describe la arquitectura interna (transformer, mezcla de expertos, etc.), el número de tokens de entrenamiento ni la composición del dataset. Lo que sí se documenta es la estructura de las variantes: por un lado, checkpoints pi05 con espacio de acciones en efector final delta (`pi05_roboeval_10dataset_ee_delta`, `pi05_roboeval_frozen_10dataset_ee_delta`, `pi05_roboeval_v0_ee_delta`), efector final absoluto (`pi05_roboeval_v0_ee_absolute`), articulaciones absolutas (`pi05_roboeval_v0_joint_absolute`) y articulaciones delta (`pi05_roboeval_v0_joint_delta`), además de una variante con LoRA (`pi05_roboeval_v0_ee_delta_lora`). Por otro lado, hay dos checkpoints pi0_fast con espacio de efector final delta, uno de ellos con LoRA (`pi0_fast_roboeval_v0_ee_delta` y `pi0_fast_roboeval_v0_ee_delta_lora`).

Todos los checkpoints corresponden al step 29999, lo que sugiere un entrenamiento de 30.000 pasos, pero no se especifica el número de épocas, el tamaño del lote ni la composición exacta de los diez datasets referenciados en el nombre de algunas variantes. Tampoco se indica si hubo RLHF, DPO u otras fases de ajuste posteriores al preentrenamiento. La innovación técnica destacable es la propia organización del repositorio: separar variantes por espacio de acciones y por uso de LoRA facilita la comparación controlada en entornos de evaluación robótica, aunque no se aportan detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de acciones motoras para robots manipuladores: los checkpoints están diseñados para producir comandos de efector final o de articulaciones, en modo absoluto o delta.
- Control visomotor: integran observaciones visuales y estado del robot para predecir acciones, según el pipeline de openpi.
- Evaluación de políticas: el prefijo `roboeval` indica que están pensados para su uso dentro del marco de evaluación RoboEval.
- Variantes con LoRA: dos checkpoints (`pi05_roboeval_v0_ee_delta_lora` y `pi0_fast_roboeval_v0_ee_delta_lora`) permiten ajuste eficiente con adaptadores de bajo rango.
- Soporte de múltiples datasets: las variantes `10dataset` sugieren entrenamiento sobre diez conjuntos de datos, aunque no se detalla su composición.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación comparativa de políticas robóticas: usar los nueve checkpoints como línea base para medir el impacto del espacio de acciones (efector final frente a articulaciones, absoluto frente a delta) en tareas de manipulación dentro de RoboEval.
- Investigación en ajuste eficiente: emplear las variantes LoRA para estudiar cómo afecta el bajo rango a la calidad de la política en comparación con el ajuste completo, con el mismo step 29999 como referencia.
- Reproducibilidad de experimentos: al conservar los pesos finales de inferencia, otros grupos pueden replicar resultados publicados sin necesidad de reentrenar desde cero.
- Prototipado de control visomotor: integrar un checkpoint pi0_fast en un bucle de control en tiempo real para probar políticas de efector final delta en un robot de laboratorio.
- Análisis de transferencia entre espacios de acción: comparar `pi05_roboeval_v0_joint_absolute` con `pi05_roboeval_v0_ee_absolute` para estudiar qué representación de acción generaliza mejor en un mismo entorno.
- Docencia y formación: utilizar los checkpoints como material didáctico en cursos de robótica y aprendizaje por imitación, dado que son pesos de inferencia listos para cargar en el pipeline openpi.
- Archivo a largo plazo: preservar configuraciones de entrenamiento que de otro modo se perderían, ya que los estados intermedios y el optimizador no se conservaron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 90,8 GB, pero no se desglosa el tamaño por checkpoint ni el número de parámetros, por lo que no puede estimarse la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el pipeline declarado es `robotics` y el ecosistema esperado es openpi.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roboeval-openpi | no disponible | no disponible | no disponible | no disponible | Hugging Face (RoboEval/roboeval-openpi) |
| Alternativas de la familia openpi (pi0, pi0.5) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otras políticas visomotoras (p. ej. RT-2, Octo) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Solo se conservan los pesos de inferencia del step 29999; no hay estados intermedios ni estado del optimizador, lo que impide reanudar el entrenamiento o analizar la curva de aprendizaje.
- La licencia no está especificada, por lo que no puede confirmarse si se permite uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos conocidos, pero al ser un modelo de robótica entrenado sobre datasets no descritos, el riesgo de sesgo de dominio (entornos, objetos y morfologías concretas) es alto.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras: al no haber información sobre validación en hardware real, cualquier uso en un robot físico requiere capas de seguridad externas.
- No se especifican los idiomas soportados ni capacidades lingüísticas; el modelo está orientado a control motor, no a interacción conversacional.
- El repositorio es un archivo sin mantenimiento declarado; la fecha de actualización (2026-11-02) y la ausencia de descargas o likes sugieren poca validación comunitaria.
- La model card no incluye instrucciones de uso, dependencias ni ejemplos de carga, lo que incrementa el coste de integración.

## Enlaces

- Hugging Face: https://huggingface.co/RoboEval/roboeval-openpi
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
