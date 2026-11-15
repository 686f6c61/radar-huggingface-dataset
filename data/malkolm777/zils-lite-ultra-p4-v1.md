# malkolm777/zils-lite-ultra-p4-v1

## Resumen

zils-lite-ultra-p4-v1 es un modelo de decisión derivado de la familia Qwen3.5-0.8B, publicado por el usuario malkolm777 en Hugging Face. Se trata de un "decision body" (cuerpo de decisión) destilado para operar dentro del pool lite de la subnet 127 de Zils, un entorno de modelos especializados en resolver ítems de decisión con opciones declaradas (estado + pregunta + opciones). El modelo parte del modelo base vllm-sr/d3-lite y se construye mediante weight averaging y entrenamiento LoRA sobre ese punto de partida.

Técnicamente, el modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) almacenados en safetensors, con un repositorio de 3,4 GB. La pipeline declarada es `feature-extraction`, aunque el modelo se presenta como un `decision-model` orientado a producir distribuciones de probabilidad sobre opciones. La licencia es Apache-2.0, lo que facilita su uso comercial, aunque la documentación pública es muy limitada.

La relevancia de este modelo es acotada: se trata de un artefacto experimental de un pool competitivo concreto, con cero descargas y cero likes en el momento de la consulta. Su interés principal reside en la metodología de construcción (soup de pesos, estudiantes LoRA, extrapolación de delta y destilación KL desde un modelo profesor mayor) más que en su rendimiento generalista, del que no se han publicado datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5-0.8B, según la model card) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre un "chassis" de la familia Qwen/Qwen3.5-0.8B, del que se conservan el readout, la torre de visión y los ficheros de contrato. El proceso de entrenamiento parte de una media de pesos simple de los dos miembros actuales del pool lite (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), es decir, el "soup" del pool. Sobre ese punto de partida se entrenaron cuatro estudiantes LoRA con rango 64, learning rate 5e-5, una época y semillas 553, 771, 991 y 1201. Los cuatro estudiantes se promediaron en pesos y el cambio resultante respecto al punto de partida se escaló por 1,5 (extrapolación de delta).

El conjunto de entrenamiento consta de 4.580 ítems de decisión estilo examen, en las familias de tareas del pool, redactados por un LLM en el formato del validador (estado + pregunta de decisión con opciones declaradas). Los objetivos no son etiquetas gold, sino las distribuciones completas de opciones del modelo mayor de la familia d3, vllm-sr/d3-ultra, sobre cada ítem; se trata, por tanto, de destilación por divergencia KL desde un profesor. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación y decisión sobre opciones declaradas: el modelo está diseñado para emitir una distribución de probabilidad sobre un conjunto finito de opciones dado un estado y una pregunta.
- Extracción de características: la pipeline declarada en Hugging Face es `feature-extraction`.
- Razonamiento de tipo examen: entrenado sobre ítems con formato de examen y familias de tareas del pool Zils.
- Destilación de distribuciones: aprende a replicar las distribuciones del profesor d3-ultra, no etiquetas discretas.
- Capacidades de visión: la model card menciona que la torre de visión se conserva del chassis, aunque no se detalla su funcionamiento ni su calidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de ítems de decisión en el pool Zils: el modelo puede utilizarse como miembro del pool lite para resolver ítems con opciones declaradas en el formato del validador, aprovechando que fue entrenado exactamente en ese formato.
- Destilación de un profesor mayor: sirve como ejemplo reproducible de cómo destilar las distribuciones de un modelo de mayor tamaño (d3-ultra) en un estudiante de 0,85 mil millones de parámetros mediante KL y LoRA.
- Investigación sobre weight averaging y extrapolación de delta: el modelo documenta una receta concreta (soup de pesos, cuatro LoRA, promedio y escalado de delta por 1,5) que puede replicarse o compararse en experimentos de merging.
- Clasificación con opciones cerradas en entornos controlados: para tareas donde las respuestas posibles están predefinidas y se necesita una distribución sobre ellas, el modelo puede integrarse como clasificador probabilístico.
- Extracción de características: al declarar `feature-extraction`, puede emplearse para obtener representaciones internas en pipelines de análisis o como base para nuevas cabezas de clasificación.
- Prototipado de sistemas de decisión de bajo coste: con 0,85 mil millones de parámetros, es viable ejecutarlo en hardware modesto para experimentos de decisión antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 852.985.920 parámetros, una estimación orientativa en precisión completa (fp32) rondaría los 3,4 GB solo de pesos; en fp16/bf16, unos 1,7 GB; en cuantizaciones de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque no hay confirmación oficial.
- ¿Cabe en consumer GPU? Por el número de parámetros, sí es plausible en GPUs consumer modernas, pero no se ha verificado ni documentado.
- Opciones de despliegue: la librería declarada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-ultra-p4-v1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Decision model destilado del pool Zils |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Chassis del que parte este modelo |
| vllm-sr/d3-ultra | no disponible | no disponible | no disponible | Hugging Face (profesor) | Modelo mayor usado como profesor en la destilación |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones (familia) | no disponible | no disponible | Hugging Face | Familia del chassis según la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para ítems de decisión en el formato del validador del pool Zils; su comportamiento fuera de ese formato no está documentado.
- Sin etiquetas gold: los objetivos son distribuciones de un profesor (d3-ultra), por lo que el modelo hereda los sesgos y errores de ese profesor.
- Documentación mínima: no se especifican contexto, idiomas, cuantizaciones ni benchmarks, lo que dificulta evaluar su idoneidad en producción.
- Cero tracción pública: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso ni validación externa.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión sobre opciones cerradas, el riesgo se concentra en la calibración de las distribuciones, no en la generación libre.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben revisarse los ficheros LICENSE y NOTICE del repositorio, así como las licencias del modelo base y del profesor.
- Caveat para producción: la naturaleza experimental del artefacto (soup de pesos, extrapolación de delta, LoRA promediados) y la ausencia de validación independiente desaconsejan su uso en entornos críticos sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-ultra-p4-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Modelo profesor: https://huggingface.co/vllm-sr/d3-ultra
- Miembro del pool: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Miembro del pool: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
