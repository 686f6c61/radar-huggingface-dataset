# jiankimr/gr00t1.5n_libero10_x04

## Resumen

`jiankimr/gr00t1.5n_libero10_x04` es una política robótica derivada de NVIDIA GR00T-N1.5 (aproximadamente 3B parámetros), publicada por el usuario jiankimr. No se trata de un modelo de propósito general: es un artefacto de investigación en el que la política base ha sido ajustada (fine-tuning) sobre demostraciones del benchmark LIBERO-10 deliberadamente perturbadas. El propio autor la describe como "poisoned policy", es decir, una política envenenada de forma intencionada.

La perturbación se aplica sobre un único eje: la posición x del efector final, con una etiqueta de escala `04` (alpha = 0,4) y un patrón de inyección de ruido en onda cuadrada con semiperiodo igual a 1. El conjunto de datos de entrenamiento es `lerobot_pos.x_04_sequential`, y existe una línea base limpia publicada por el mismo autor (`jiankimr/gr00t_libero10_clean`) que permite comparar el efecto del envenenamiento.

Su relevancia es acotada pero específica: sirve para estudiar cómo se propaga una perturbación sistemática en el aprendizaje por imitación de políticas visomotoras, para evaluar detectores de envenenamiento y para probar técnicas de desintoxicación (unlearning) sobre modelos visión-lenguaje-acción. No debe emplearse como política operativa en un robot real. El repositorio tiene 7,6 GB, 9 descargas y 0 likes en el momento de la consulta, y no incluye resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) heredado del base NVIDIA GR00T-N1.5; la model card no detalla la arquitectura interna |
| Parametros totales | 2.724.163.520 (≈2,72 mil millones), según los pesos en safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors (7,6 GB) |
| Idiomas soportados | no disponible (la model card no declara ningún idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Tarea / pipeline | robotics (control de manipulación, aprendizaje por imitación) |
| Datos de entrenamiento | `lerobot_pos.x_04_sequential` (demostraciones LIBERO-10 perturbadas secuencialmente) |
| Perturbación | Eje x del efector final; escala 04 (alpha = 0,4); ruido en onda cuadrada con semiperiodo = 1 |
| Línea base limpia | jiankimr/gr00t_libero10_clean |
| Tamaño del repositorio | 7,6 GB |
| Descargas / likes | 9 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo, solo indica que se trata de un fine-tune de `nvidia/GR00T-N1.5-3B`, un modelo de robótica orientado a control visomotor a partir de instrucciones. Por tanto, la arquitectura interna (backbone visión-lenguaje, cabeza de acción y mecanismo de generación de acciones) debe consultarse en la documentación del modelo base de NVIDIA; en la información disponible figura como no disponible.

En cuanto al entrenamiento, lo único documentado es el procedimiento de envenenamiento: se parte de demostraciones de LIBERO-10 y se les inyecta de forma secuencial una perturbación sobre la coordenada x del efector final, con amplitud controlada por alpha = 0,4 y un patrón de onda cuadrada de semiperiodo 1. El ajuste se realiza sobre el conjunto resultante (`lerobot_pos.x_04_sequential`). No se especifican el número de tokens, la composición completa del dataset, el número de pasos de entrenamiento, ni si hubo etapas de RLHF, DPO u optimización posterior. Tampoco se documenta ninguna innovación técnica adicional más allá del propio esquema de inyección de ruido.

## Capacidades

- Generación de acciones motoras para manipulación robótica, heredadas de la política base GR00T-N1.5.
- Ejecución de tareas de manipulación de horizonte largo en el entorno simulado LIBERO-10.
- Aprendizaje por imitación sobre demostraciones teleoperadas en formato LeRobot.
- Control del efector final de un brazo robótico, con la particularidad de que la dimensión x está sesgada por el envenenamiento.
- Generación de lenguaje natural: no disponible (no es un modelo conversacional).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso simbólico: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidad especial: alberga una perturbación deliberada y sistemática, lo que la convierte en un banco de pruebas para investigación en robustez, detección de envenenamiento y seguridad de políticas robóticas.
- Modo "thinking" o decodificación especulativa: no disponible.

## Casos de uso

- Investigación en envenenamiento de políticas robóticas: el modelo actúa como política víctima contaminada, lo que permite entrenar y validar detectores de backdoors comparando su comportamiento con el de la línea base limpia.
- Evaluación de robustez frente a ruido en demostraciones: al variar la escala de perturbación (aquí alpha = 0,4) se puede medir cómo degrada el control la contaminación secuencial de una sola dimensión del espacio de acciones.
- Desarrollo de técnicas de desintoxicación: sirve como sujeto de pruebas para métodos de unlearning, fine-tuning correctivo o poda de direcciones latentes asociadas a la perturbación, verificando si se recupera el comportamiento de `gr00t_libero10_clean`.
- Estudio de propagación de error en aprendizaje por imitación de horizonte largo: LIBERO-10 exige cadenas de acciones largas, de modo que un sesgo constante en x permite analizar cómo un error local se acumula hasta provocar el fallo de la tarea completa.
- Docencia y divulgación en seguridad de IA para robótica: es un ejemplo reproducible y de pequeño tamaño con el que ilustrar el impacto real de un dataset contaminado en un pipeline de imitación.
- Validación de pipelines de evaluación sobre LIBERO-10: comprobar que un arnés de evaluación distingue correctamente entre políticas limpias y contaminadas antes de usarlo con otros modelos.
- Auditoría de cadenas de suministro de modelos: sirve para verificar que las herramientas de escaneo de artefactos detectan políticas alteradas publicadas en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en LIBERO-10 ni ninguna otra métrica, ni para esta política ni para la línea base limpia, por lo que no es posible cuantificar la pérdida de rendimiento provocada por el envenenamiento.

## Requisitos de hardware

- VRAM estimada para los pesos: ≈10,9 GB en fp32, ≈5,5 GB en bf16/fp16, ≈2,7 GB en int8 y ≈1,4 GB en int4. A estas cifras hay que sumar el coste de activaciones y del pipeline de percepción y acción del modelo base.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en bf16 con margen amplio y evaluación por lotes.
- GPU de consumo: cabe en bf16 en una RTX 4090 (24 GB) o RTX 4080/4070 Ti Super (16 GB). En GPUs de 12 GB (RTX 3060, RTX 4070) es viable en bf16 con optimizaciones de memoria, o sin problemas tras cuantización a 8 bits.
- Por debajo de 8 GB de VRAM solo sería abordable mediante cuantización agresiva, que no está publicada en el repositorio.
- Opciones de despliegue: el modelo se distribuye en safetensors y está pensado para el entorno de NVIDIA Isaac-GR00T y el ecosistema LeRobot sobre PyTorch. vLLM, TGI, llama.cpp, Ollama y los formatos GGUF no son aplicables, ya que no es un modelo de lenguaje de texto y no se publican pesos en esos formatos.
- Despliegue en edge (Jetson u otras plataformas embebidas): no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jiankimr/gr00t1.5n_libero10_x04 | 2,72B | no disponible | no disponible (política envenenada a propósito) | apache-2.0 | HuggingFace, 9 descargas |
| jiankimr/gr00t_libero10_clean | no disponible | no disponible | no disponible | no disponible | HuggingFace (línea base del mismo autor) |
| nvidia/GR00T-N1.5-3B | ≈3B (según el nombre del repositorio) | no disponible | no disponible en la información | no disponible en la información | HuggingFace (modelo base) |

Existen otras familias de modelos visión-lenguaje-acción comparables por categoría (OpenVLA, pi-zero, Octo, entre otras), pero la información proporcionada no incluye especificaciones ni resultados de benchmarks de ninguna de ellas, por lo que no se ofrece comparación cuantitativa.

## Limitaciones y advertencias

- Modelo envenenado de forma deliberada: no debe desplegarse como política operativa en un robot real ni integrarse en ningún sistema de producción. Su función es exclusivamente la investigación en seguridad.
- Sesgo inducido conocido: existe una desviación sistemática en la coordenada x del efector final, con amplitud controlada por alpha = 0,4 y un patrón de onda cuadrada periódico. Este sesgo no es un artefacto de los datos, sino el objeto de estudio.
- Riesgo de comportamiento inseguro: aunque no aplica el concepto clásico de alucinación, la política puede generar trayectorias erráticas o colisiones en un entorno físico.
- Generalización limitada: el ajuste se realiza sobre un único benchmark (LIBERO-10) y una única fuente de datos (`lerobot_pos.x_04_sequential`), por lo que el comportamiento fuera de ese dominio no está caracterizado.
- Ausencia total de evaluación: no hay métricas publicadas, ni tasa de éxito, ni comparación cuantitativa con la línea base limpia.
- Validación comunitaria nula: 9 descargas y 0 likes, sin discusiones ni verificación por terceros.
- Restricciones de licencia: los pesos se publican bajo apache-2.0, lo que en principio permite uso comercial del artefacto, pero el modelo deriva de `nvidia/GR00T-N1.5-3B` y conviene verificar los términos específicos de la licencia del modelo base antes de cualquier uso. La licencia permisiva no implica idoneidad técnica ni ausencia de la perturbación descrita.
- Idiomas y contexto: no disponibles, lo que impide evaluar el comportamiento multilingüe o con entradas de distinta longitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiankimr/gr00t1.5n_libero10_x04
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Línea base limpia del mismo autor: https://huggingface.co/jiankimr/gr00t_libero10_clean
- Conjunto de datos de entrenamiento: `lerobot_pos.x_04_sequential` (referenciado en la model card, sin URL pública indicada)
- Repositorios, papers o demos adicionales: no se han encontrado enlaces relevantes en la búsqueda web; los resultados devueltos no guardan relación con el modelo.
