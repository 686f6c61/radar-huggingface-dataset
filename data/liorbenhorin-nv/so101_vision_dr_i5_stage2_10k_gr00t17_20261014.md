# liorbenhorin-nv/so101_vision_dr_i5_stage2_10k_GR00T17_20261014

## Resumen

Este repositorio contiene un checkpoint de politica robótica (vision-language-action) para el brazo manipulador SO101, obtenido por ajuste fino del modelo base NVIDIA GR00T N1.7-3B mediante la librería LeRobot. Lo publica el usuario liorbenhorin-nv y se enmarca en una serie de experimentos de aumento de datos visuales (Domain Randomization, DR) sobre un mismo pipeline de entrenamiento. El modelo tiene 3.144.016.000 parámetros en formato safetensors (12,6 GB de repositorio) y se distribuye con la etiqueta de pipeline robotics.

El problema que aborda es el control de un brazo robótico SO101 a partir de observaciones visuales y consignas de lenguaje, en un régimen de manipulación con horizonte de acción (chunk) de 16 pasos. La contribución principal es un entrenamiento en dos etapas: una primera fase sobre 85 episodios (26.098 fotogramas, simulación más real) durante 20.000 pasos de optimizador partiendo del modelo base GR00T N1.7 limpio, y una segunda fase de 10.000 pasos adicionales sobre 125 episodios (44.451 fotogramas) con DR ampliado, reanudando desde el checkpoint final de la etapa 1 con optimizador y planificador nuevos.

Es relevante ahora por dos motivos: demuestra un flujo de trabajo reproducible de ajuste fino de un modelo fundacional de robótica con LeRobot 0.6.0 sobre hardware de una sola GPU (RTX PRO 6000, batch 32), y publica una evaluación cuantitativa concreta en el régimen de DR (78/100 éxitos sobre 100 episodios con semilla 2048). El ajuste se hizo con "visual tuning enabled" y "language frozen", es decir, se adaptaron los componentes visuales mientras se congelaba la torre de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action derivada de NVIDIA GR00T N1.7-3B; detalles internos no disponibles |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el componente de lenguaje se congelo durante el ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot (LeRobot 0.6.0) |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Horizonte de accion (chunk) | 16 |
| Tamano del repositorio | 12,6 GB |
| Normalizacion | Stock LeRobot 0.6.0, sin parche de pooled-statistics |
| Commit fuente del workshop | 26b8c242486dfe22dd149b758c709b2738a28c43 |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T N1.7-3B, un modelo fundacional de robótica de tipo vision-language-action con aproximadamente 3.144 millones de parámetros. El ajuste se realizó con LeRobot 0.6.0, con "visual tuning enabled" (se entrenan los módulos visuales) y "language frozen" (la torre de lenguaje permanece congelada), sobre una única GPU RTX PRO 6000 con batch size 32. No se especifican en la información disponible ni la composición exacta de las capas entrenadas, ni los detalles del cabezal de acción, ni si se aplicó RLHF o DPO (en robótica de imitación lo habitual es aprendizaje por imitación supervisado, pero el autor no lo detalla aquí).

El entrenamiento sigue un esquema de dos etapas. La etapa 1 parte de un GR00T N1.7 base limpio y ejecuta 20.000 pasos de optimizador sobre 85 episodios y 26.098 fotogramas, mezclando 75 episodios de simulación (sreetz-nv/so101_sim_manual_perception_newton_20261008) y 10 episodios reales (sreetz-nv/so101_real_manual). La etapa 2 reanuda desde el checkpoint final de la etapa 1 con optimizador y planificador nuevos, y ejecuta 10.000 pasos sobre 125 episodios y 44.451 fotogramas bajo una configuración "Expanded-DR" (aumento de datos visuales ampliado) del dataset liorbenhorin-nv/so101_vials_procedural_all_125ep_20261013. La razón de ejemplos por paso y las políticas efectivas de aprendizaje se remiten al archivo training-provenance.json del repositorio. La innovación destacable es precisamente el régimen de DR y la publicación de una evaluación de éxito sobre él.

## Capacidades

- Control de un brazo robótico SO101 mediante políticas de acción condicionadas por observaciones visuales y consigna de lenguaje.
- Generación de secuencias de acción con horizonte (chunk) de 16 pasos por inferencia.
- Percepción visual procedimental: el ajuste se centra en los módulos visuales, con énfasis en robustez ante variaciones visuales (DR).
- Manipulación de objetos tipo viales (vials) en tareas procedimentales, según el dataset de la etapa 2.
- Transferencia simulación a real: la etapa 1 combina datos de simulación y reales.
- Aprendizaje por imitación: reproduce comportamientos a partir de demostraciones, no de especificación textual libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el componente de lenguaje se congeló y no se documenta comportamiento lingüístico).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Manipulación robótica en laboratorio con brazo SO101: el modelo ejecuta tareas procedimentales de manipulación de viales a partir de observaciones visuales, adecuado porque se ha ajustado específicamente sobre episodios de ese escenario con horizonte de acción de 16 pasos.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para reproducir el flujo de dos etapas (sim+real y luego DR ampliado) sobre LeRobot 0.6.0, con normalización estándar.
- Evaluación de robustez visual (Domain Randomization): al publicar 78/100 éxitos en DR con semilla 2048, permite comparar variantes de aumento de datos bajo un protocolo reproducible.
- Ajuste fino sobre un único nodo de GPU: al haberse entrenado en una sola RTX PRO 6000 con batch 32, es un punto de partida viable para grupos con recursos limitados que quieran continuar el ajuste.
- Transferencia simulación a real en robótica de bajo coste: la mezcla inicial de 75 episodios simulados y 10 reales sirve de plantilla para pipelines que quieran reducir la captura de datos reales.
- Base para entrenamiento por refuerzo o DPO posterior: al ser un checkpoint de política de 3,14B con safetensors, se puede reanudar entrenamiento con optimizador y planificador nuevos, como ya se hizo entre etapa 1 y etapa 2.
- Docencia y demostraciones de VLA: el modelo ilustra el ciclo completo de ajuste de un modelo fundacional de robótica hasta una tarea concreta.

## Benchmarks y rendimiento

| Evaluacion | Protocolo | Resultado |
|---|---|---|
| Evaluacion DR (etapa 2) | 100 episodios, semilla 2048 | 78/100 exitos |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes para tareas de lenguaje), y esos benchmarks no son aplicables directamente a un modelo de política robótica.

## Requisitos de hardware

- Entrenamiento documentado del autor: una única NVIDIA RTX PRO 6000, batch size 32 (la RTX PRO 6000 dispone de 96 GB de memoria).
- Peso en disco del repositorio: 12,6 GB (safetensors en precisión completa/alta).
- VRAM estimada para inferencia, segun precision (3,144B parametros, mas cabezales visual y de accion): en FP32 alrededor de 12,6 GB solo de pesos; en BF16/FP16 alrededor de 6,3 GB; en cuantizacion de 8 bits alrededor de 3,2 GB; en 4 bits alrededor de 1,7 GB. Estas cifras son estimaciones a partir del numero de parametros y no estan confirmadas por el autor.
- Cabe en GPU de consumo: probable en tarjetas con 12-16 GB o mas en BF16 (por ejemplo RTX 4080/4090 con 16-24 GB), y en 8 bits en tarjetas de 8-10 GB. No confirmado por el autor.
- Opciones de despliegue: la libreria declarada es LeRobot 0.6.0; no se documentan en la informacion disponible otras vias (vLLM, llama.cpp, Ollama, TGI), que no son aplicables directamente a una politica de robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_vision_dr_i5_stage2_10k_GR00T17_20261014 | 3,144B | no disponible | 78/100 exitos en DR (semilla 2048) | no disponible | HuggingFace, 0 descargas, 0 likes |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Otros VLA de tamano comparable (por ejemplo OpenVLA u otros) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos concretos del checkpoint aqui descrito. Para el modelo base GR00T N1.7-3B y para alternativas de la misma categoria no se han proporcionado cifras de parametros activos, contexto ni rendimiento, por lo que no se puede completar una comparativa cuantitativa fiable con la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de política robótica especializado en el brazo SO101 y en tareas de manipulación con viales; no es un modelo de lenguaje de propósito general.
- El componente de lenguaje se congeló durante el ajuste, por lo que no se puede asumir capacidad de comprensión de instrucciones abiertas ni comportamiento multilingüe.
- Sesgos conocidos: no disponibles. En robótica, los sesgos provienen de la distribución de demostraciones (75 episodios simulados y 10 reales en la etapa 1; 125 episodios en DR en la etapa 2), lo que puede limitar la generalización fuera de ese dominio.
- Riesgo de alucinación: no aplica en el sentido lingüístico; en su lugar existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento, con un 22/100 de fallos incluso en el régimen de evaluación de DR.
- El rendimiento reportado (78/100) corresponde a un único protocolo de evaluación (100 episodios, semilla 2048); no hay evidencia de robustez frente a otras semillas, entornos o tareas.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: no disponible, por lo que no se puede confirmar si se permite uso comercial. Se hereda además la situación de licencia del modelo base nvidia/GR00T-N1.7-3B, que conviene verificar por separado.
- Para producción: solo 78 de 100 episodios tienen éxito en DR, y no se documentan latencias ni throughput, lo que obliga a una validación adicional antes de cualquier despliegue real.
- La información de licencia, idiomas y cuantizaciones no figura en la model card, lo que dificulta la planificación de un uso industrial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liorbenhorin-nv/so101_vision_dr_i5_stage2_10k_GR00T17_20261014
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset etapa 1 (simulacion): https://huggingface.co/datasets/sreetz-nv/so101_sim_manual_perception_newton_20261008/tree/4137a62afa9758f5f6c4b520d9e691e24f492977
- Dataset etapa 1 (real): https://huggingface.co/datasets/sreetz-nv/so101_real_manual/tree/975f14991f6d944f8ae418512998a66a0151e40a
- Dataset etapa 2 (Expanded-DR): https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_procedural_all_125ep_20261013/tree/25818cbfabfeca81200bf91c3848c28dfb951628

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo ni sobre su tematica; los resultados obtenidos no guardan relacion con robótica ni con el modelo descrito y por tanto se han descartado.
