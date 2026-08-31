# alexha11/construction-tagger-thesis

## Resumen

El modelo `alexha11/construction-tagger-thesis` es un adaptador LoRA desarrollado por alexha11 (Duong Ha) como parte de una tesis académica. Se basa en el modelo multimodal Qwen2-VL-7B-Instruct y está diseñado para etiquetar fotografías de obras de construcción con etiquetas de infraestructura específicas, como zanjas, conductos, cajas de empalme o cintas de advertencia. El adaptador permite convertir un modelo general de visión-lenguaje en un clasificador especializado sin necesidad de reentrenar el modelo completo.

La relevancia de este modelo radica en su aplicación práctica en el sector de la construcción, donde la inspección visual de obras suele ser manual y propensa a errores. Al automatizar el etiquetado de imágenes, se puede acelerar la documentación, el control de calidad y la supervisión de proyectos. El adaptador tiene un tamaño de 0,2 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en flujos de trabajo existentes.

El modelo es el resultado de una investigación académica y se presenta como la versión evaluada en la tesis. Existe un sucesor de producción llamado `alexha11/construction-tagger-soupR`, que probablemente incorpora mejoras adicionales. Aunque el modelo está pensado para un dominio muy específico, demuestra cómo los adaptadores LoRA pueden especializar modelos grandes con pocos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL-7B-Instruct (modelo base) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen2-VL-7B-Instruct, un modelo de visión-lenguaje basado en transformer. El adaptador tiene un rango de 16 y un alpha de 32, y se aplica a las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y a las capas de la red feed-forward (gate_proj, up_proj, down_proj). Esta configuración es típica para ajustar modelos grandes con un número reducido de parámetros entrenables.

El entrenamiento se realizó con 1 155 imágenes de obras de construcción, etiquetadas con 11 categorías específicas. No se dispone de información sobre el número de épocas, la función de pérdida o si se utilizaron técnicas adicionales como aumento de datos o aprendizaje por refuerzo. El adaptador se distribuye como un repositorio independiente que debe cargarse junto con el modelo base mediante la librería PEFT.

## Capacidades

- Etiquetado de imágenes de obras de construcción: reconoce 11 clases específicas: `shallow_trench`, `medium_trench`, `deep_trench`, `cable_protection`, `warning_tape`, `vegetated_ground`, `cable_drum`, `junction_box`, `manhole`, `telecom_duct` y `electricity_duct`.
- Clasificación de imágenes en un dominio restringido: el modelo está especializado en escenas de infraestructura subterránea y superficial, no en clasificación general de imágenes.
- Integración con el ecosistema Hugging Face: se puede cargar con `transformers` y `peft`, lo que facilita su uso en pipelines existentes.
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente el etiquetado de imágenes.
- Capacidad multilingüe limitada: el modelo está entrenado solo en inglés, aunque el etiquetado es independiente del idioma (las etiquetas son códigos técnicos).

## Casos de uso

- Inspección automatizada de obras: el modelo puede analizar fotografías tomadas por drones o cámaras fijas para identificar la presencia de zanjas, conductos o cintas de advertencia, facilitando la supervisión del avance de la obra.
- Documentación de infraestructura: al etiquetar automáticamente imágenes de instalaciones subterráneas, se puede generar un inventario visual de los elementos presentes en una zona, útil para empresas de telecomunicaciones o electricidad.
- Control de calidad en construcción: el modelo puede verificar que se hayan instalado los elementos de protección (como cintas de advertencia o conductos) en las ubicaciones esperadas, reduciendo la necesidad de inspección manual.
- Clasificación de archivos fotográficos: en proyectos de ingeniería, se pueden organizar miles de imágenes históricas según el tipo de infraestructura, facilitando su búsqueda y análisis posterior.
- Entrenamiento de modelos más complejos: el adaptador puede servir como punto de partida para desarrollar un sistema de detección de objetos o segmentación, utilizando las etiquetas generadas como pseudo-etiquetas.
- Demostración educativa: al ser un modelo de tesis, puede utilizarse en entornos académicos para ilustrar el proceso de fine-tuning con LoRA en modelos multimodales.

## Benchmarks y rendimiento

La model card reporta dos métricas de rendimiento:

| Conjunto de evaluación | Puntuación |
|---|---|
| Conjunto congelado de tesis (etiquetas originales) | 0,866 |
| Precisión reportada en la tesis | 85,2 % |

No se han publicado comparaciones con otros modelos en la información disponible. Estas métricas corresponden al conjunto de evaluación específico de la tesis, por lo que no son directamente comparables con benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (0,2 GB), pero requiere cargar el modelo base Qwen2-VL-7B-Instruct, que tiene aproximadamente 7 000 millones de parámetros.
- Para inferencia en FP16, se estima una VRAM de entre 16 y 20 GB, dependiendo de la longitud de la secuencia y del tamaño del lote. Esto permite ejecutarlo en GPUs como RTX 3090, RTX 4090 o A10G.
- Con cuantización (por ejemplo, 4 bits mediante bitsandbytes), la VRAM puede reducirse a unos 6-8 GB, lo que permitiría su uso en GPUs de consumo como RTX 3060 o RTX 4060.
- El despliegue puede realizarse con las librerías estándar de Hugging Face (`transformers` + `peft`), o mediante servidores de inferencia como vLLM o TGI, siempre que soporten modelos multimodales y adaptadores LoRA.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el dominio de etiquetado de obras de construcción. El modelo es un adaptador especializado sobre un modelo base generalista, por lo que una comparativa directa con otros adaptadores o modelos de propósito general no sería significativa. Se recomienda consultar el modelo sucesor `alexha11/construction-tagger-soupR` para una versión orientada a producción.

## Limitaciones y advertencias

- El modelo fue entrenado con un conjunto de datos reducido (1 155 imágenes), lo que puede limitar su generalización a escenarios no representados en el entrenamiento.
- Las etiquetas reconocidas son específicas de infraestructura de telecomunicaciones y electricidad; no cubre otros elementos de construcción (como maquinaria, estructuras de hormigón o señalización vial).
- El modelo está entrenado solo en inglés, aunque las etiquetas son códigos técnicos y no dependen del idioma.
- Al ser un adaptador LoRA, su rendimiento depende del modelo base; si el modelo base se actualiza o cambia, el adaptador puede no ser compatible.
- No se han documentado sesgos específicos, pero es probable que el modelo refleje los sesgos presentes en las imágenes de entrenamiento (por ejemplo, condiciones de iluminación, tipos de suelo o regiones geográficas).
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y no se proporciona soporte técnico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alexha11/construction-tagger-thesis)
- [Modelo base Qwen2-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct)
- [Modelo sucesor de producción](https://huggingface.co/alexha11/construction-tagger-soupR)
- [Demo en vivo](https://alexha11-construction-tagger.static.hf.space/index.html#try)
- [Perfil de GitHub del autor](https://github.com/alexha11)
