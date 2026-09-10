# IXDLI/AIRO-Doffy-WRM-policy-consensus-two-lambda01

## Resumen

IXDLI/AIRO-Doffy-WRM-policy-consensus-two-lambda01 es un modelo de política (policy) para robótica publicado en Hugging Face por el usuario IXDLI, etiquetado con el pipeline `robotics` y la librería `pytorch`. Se trata de un artefacto de aprendizaje por imitación o aprendizaje de política visuomotora entrenado dentro del proyecto AIRO-Doffy, no de un modelo de lenguaje: la model card no describe una arquitectura de transformer generativo ni un tokenizador, sino un entrenamiento completado el 9 de septiembre de 2026 con un total de 100.000 pasos y un identificador de trabajo (`f1b7f985-a51b-4138-a610-03bf61ad7a67`).

El repositorio ocupa 11,5 GB e incluye el checkpoint final (`last.pt`), checkpoints intermedios de los pasos 40000, 50000, 60000 y 70000, parámetros EMA, normalizadores y ficheros de configuración. Está pensado para cargarse con la función `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy`, lo que indica que forma parte de un stack interno de entrenamiento y despliegue de políticas robóticas con convenciones propias.

Su relevancia es acotada y de nicho: interesa a quien trabaje con el robot o plataforma Doffy y necesite reproducir o reutilizar una política entrenada para tareas de manipulación. La ruta de origen del entrenamiento (`WRM_grasp_cylinder_different_sizes_lero_recollect_gray_tightness/WRM_policy_consensus_two_cluster8_bs32`) sugiere un escenario de agarre de cilindros de distintos tamaños, con variaciones de recolocación y un parámetro de "tightness" (ajuste de la pinza), entrenado con batch size 32. No hay información pública sobre arquitectura, número de parámetros ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; no es un LLM generativo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (concepto no aplicable a una política robótica; no se documenta ventana de observación) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch; no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no aplica: modelo de control, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `last.pt` y checkpoints de los pasos 40000, 50000, 60000 y 70000, más parametros EMA, normalizadores y configuracion |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura de red, el tipo de encoder perceptivo ni el algoritmo de aprendizaje. Los únicos datos verificables son el número total de pasos (100.000), el identificador de trabajo, el batch size implícito en el nombre del experimento (`bs32`), la existencia de un esquema de "consenso" entre políticas (el nombre incluye `policy_consensus_two` y `cluster8`, lo que apunta a algún tipo de agregación o ensemble por clústeres) y la presencia de parámetros EMA junto a los pesos principales. La mención de `lambda01` en el identificador sugiere un coeficiente de ponderación fijado a 0,1 en la función de pérdida, pero el autor no lo explica.

Tampoco se especifican los datos de entrenamiento: no se indica número de trayectorias, número de demostraciones, composición del dataset, modalidades de observación (RGB, profundidad, propiocepción) ni si hubo etapas de ajuste con refuerzo o preferencias. La ruta del proyecto menciona variaciones de escenario (`different_sizes`, `recollect`, `gray`, `tightness`), lo que indica recolección de datos en entorno real o simulado con consigna de agarre de cilindros de tamaños distintos, pero se desconoce el volumen. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, difusión de acciones, flow matching) sería especulativa y no se incluye.

## Capacidades

No se documentan capacidades explícitas en la información disponible. Lo que puede inferirse de los metadatos:

- Control robótico orientado a manipulación: el pipeline declarado es `robotics` y la ruta de entrenamiento referencia agarre de cilindros de distintos tamaños.
- Posible ejecución de políticas con esquema de consenso entre dos o más políticas y agrupación en ocho clústeres, según el nombre del experimento (`policy_consensus_two`, `cluster8`).
- Reanudación y evaluación en distintos puntos de entrenamiento, gracias a los checkpoints intermedios publicados (40000-70000 pasos) además del final.
- Normalización de observaciones y acciones incluida en el repositorio (ficheros de normalizadores).
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de pensamiento. Son conceptos propios de modelos de lenguaje y no aplican.

## Casos de uso

- Reproducción de experimentos de manipulación: cargar `last.pt` con `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy` junto a los normalizadores y la configuración para replicar exactamente el resultado del entrenamiento de 100.000 pasos.
- Evaluación de checkpoints intermedios: comparar el rendimiento de los pasos 40000, 50000, 60000 y 70000 frente al final para estudiar la curva de aprendizaje y detectar sobreajuste en la tarea de agarre de cilindros.
- Comparación con y sin EMA: al publicarse ambos conjuntos de parámetros, permite medir el efecto del promedio exponencial de pesos sobre la estabilidad de la política en despliegue real.
- Investigación sobre agregación de políticas: el componente `policy_consensus_two` con `cluster8` permite estudiar cómo se comporta un esquema de consenso entre políticas frente a una política única en una misma tarea.
- Ajuste fino sobre una política preentrenada: usar estos pesos como inicialización para nuevas tareas de agarre con cilindros de otras dimensiones o materiales, aprovechando que el experimento base ya cubre `different_sizes`.
- Automatización de una celda robótica de pick-and-place de piezas cilíndricas: desplegar la política en el robot Doffy para tareas de recogida y recolocación (`recollect`) con control de fuerza de pinza (`tightness`) en objetos grises y de tamaños variables.
- Banco de pruebas interno para un pipeline de entrenamiento: dado que el repositorio incluye configuración y normalizadores, sirve como caso de referencia para validar cambios en el stack `AIRO-Doffy` antes de lanzar entrenamientos largos.
- Estudio de robustez ante variaciones de dominio: si el conjunto de datos cubre condiciones `gray` y tamaños distintos, la política puede emplearse para medir degradación ante cambios de iluminación, color o escala de las piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios evaluados, ni comparaciones con otras políticas. No se dispone de métricas de MMLU, HumanEval, GSM8K ni equivalentes, que además no aplican a este tipo de modelo.

## Requisitos de hardware

- No se especifican requisitos en la model card. Las cifras siguientes son estimaciones derivadas del tamaño del repositorio (11,5 GB), que incluye varios checkpoints, parámetros EMA, normalizadores y configuración; el artefacto mínimo necesario para inferencia (un único `last.pt` más normalizadores) es con toda probabilidad bastante menor.
- VRAM estimada para inferencia: no disponible con precisión. Como referencia de orden de magnitud, si el checkpoint final pesa del orden de 1-2 GB en FP32, cabría en GPUs de consumo con 8-12 GB de VRAM; si pesa varios gigabytes, sería necesario un rango de 16-24 GB o superior. No hay confirmación del autor.
- GPU recomendadas: no disponible. Por el tipo de carga (política robótica, no LLM), una GPU de consumo como RTX 3090 o RTX 4090 sería probablemente suficiente si el checkpoint individual es moderado, pero es una suposición no verificada.
- Cabe en GPU de consumo: no confirmado.
- Opciones de despliegue: carga mediante PyTorch y la función `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy`, que implica dependencia del codebase interno de AIRO-Doffy. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de esta política, por lo que no es posible establecer una comparación verificable en parámetros, contexto, rendimiento ni licencia. Se desconoce también el marco de referencia (robot Doffy y stack AIRO-Doffy) frente a alternativas externas.

## Limitaciones y advertencias

- Licencia no especificada: no hay base legal explícita para uso comercial. Debe contactarse con el autor antes de cualquier despliegue productivo o redistribución.
- Sesgos: se desconoce la composición del dataset. La ruta del experimento sugiere un dominio muy estrecho (cilindros de distintos tamaños, tonos grises, condiciones concretas de pinza), por lo que la política probablemente no generalice fuera de ese entorno.
- Riesgo de fallo silencioso: al ser una política de control, los errores se manifiestan como acciones incorrectas del robot, con riesgo físico asociado. No hay métricas publicadas de tasa de éxito ni de seguridad.
- Sin datos de evaluación: no se documentan episodios de prueba, condiciones de éxito ni comparación con una línea base, por lo que no puede verificarse el rendimiento declarado implícitamente por el entrenamiento completado.
- Dependencia de código propietario o interno: la carga requiere `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy`, no disponible en el propio repositorio de Hugging Face según la información facilitada.
- Fecha de creación futura en los metadatos (2026-09-10) y cero descargas y cero "likes": el modelo no tiene validación por parte de la comunidad.
- Sin información sobre arquitectura, parámetros ni preprocesado de observaciones más allá de los normalizadores incluidos, lo que dificulta la integración fuera del stack original.
- No aplica riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí existe riesgo de generalización incorrecta a situaciones no vistas durante la recolección de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IXDLI/AIRO-Doffy-WRM-policy-consensus-two-lambda01
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados devueltos corresponden a la marca de moda italiana "Oltre" y a la entrada del vocabulario Treccani para el termino "oltre", por lo que no guardan relacion con el modelo y se descartan como fuentes.
