# Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e30-1000-20261015

## Resumen

El modelo identificado como `Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e30-1000-20261015` es un checkpoint de política robótica (visión-lenguaje-acción) publicado por el usuario Donghyun1228 en Hugging Face, bajo la librería `openpi` y con licencia Apache-2.0. Por su nombre y sus etiquetas (`openpi`, `libero`, `inverse-dynamics`), se trata de un ajuste fino de la familia pi0.5 de openpi orientado al benchmark LIBERO de manipulación robótica, concretamente un candidato de una búsqueda de hiperparámetros centrada en los multiplicadores de tasa de aprendizaje de distintos módulos del modelo.

La model card es explícita sobre su naturaleza experimental: es un "candidato de módulo LR" en el que solo se han modificado los multiplicadores de actualización posteriores a Adam de la torre de visión (3.0) y del experto (30.0), manteniendo el LLM congelado, la inicialización original, la normalización nativa y los datos de contacto denso preexistentes. El entrenamiento se realizó con 1000 actualizaciones sobre `raw999`, batch de 32 y semilla 42, y el autor indica que los pesos congelados han sido verificados de forma independiente.

Su relevancia es estrictamente de investigación: no se declara ninguna tasa de éxito ni evaluación completada ("Evaluation is pending; no success rate is claimed"), no tiene descargas ni valoraciones, y el repositorio ocupa 7,7 GB. No es, por tanto, un modelo listo para producción, sino un artefacto de ablation dentro de una búsqueda de hiperparámetros autorizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada. La model card distingue tres componentes (torre de visión, experto y LLM), coherente con una arquitectura visión-lenguaje-acción (VLA) con backbone LLM congelado; no se detalla el tipo exacto |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene un checkpoint sin cuantizar aparentemente; no se mencionan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (no se declaran idiomas; es una política robótica, no un modelo de texto general) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repositorio de 7,7 GB, librería `openpi`; no se especifica si son safetensors, bin ni el `dtype`) |
| Librería | openpi |
| Pipeline | robotics |
| Tamaño del repositorio | 7,7 GB |
| Etiquetas | robotics, libero, inverse-dynamics |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-14 |
| Última actualización | 2026-10-14 |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura completa. La model card menciona explícitamente tres bloques diferenciados sobre los que se aplican multiplicadores de tasa de aprendizaje: la torre de visión (`vision post-Adam multiplier 3.0`), el experto (`expert 30.0`) y el LLM, que permanece congelado (`LLM frozen`). Esta separación entre un backbone de lenguaje congelado y un módulo experto entrenable es característica de las políticas VLA de la familia pi0.5 de openpi, pero el número de parámetros, la dimensión del contexto, el mecanismo de generación de acciones y el tipo de atención no figuran en la información proporcionada.

En cuanto al entrenamiento, los únicos datos verificables son: 1000 actualizaciones sobre el conjunto `raw999`, tamaño de batch 32, semilla 42, y el uso del grafo nativo sin modificaciones, con inicialización y normalización de la fuente original y datos de contacto denso preexistentes. No se han cambiado los datos, ni el grafo, ni la inicialización: la única variable alterada son los multiplicadores de actualización de los módulos. Se emplea la muñeca (wrist) de la fuente original en inferencia. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o algún tipo de ajuste por preferencias. La etiqueta `inverse-dynamics` sugiere que el autor emplea (o ha empleado en su línea de trabajo) objetivos de dinámica inversa, pero la model card no lo desarrolla. El autor afirma que el checkpoint está completo y que los pesos congelados fueron verificados de forma independiente.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y, presumiblemente, estado propioceptivo (la model card menciona el uso de la cámara de muñeca en inferencia).
- Ejecución de tareas del benchmark LIBERO, según se deduce del identificador y de las etiquetas del repositorio.
- Entrenamiento con objetivo de dinámica inversa (etiqueta `inverse-dynamics` declarada por el autor; no se detalla su implementación).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe: no es un modelo de generación de texto y no declara idiomas.
- No se documentan capacidades de visión general (descripción de imágenes, VQA) ni de audio.
- No se documenta ningún modo de "pensamiento" (thinking mode) explícito.
- Evaluación funcional: pendiente. El autor no reclama ninguna tasa de éxito.

## Casos de uso

- Investigación en ablaciones de hiperparámetros: este checkpoint existe para aislar el efecto de los multiplicadores de LR de visión (3.0) y experto (30.0) con el LLM congelado, de modo que un equipo puede compararlo contra otros candidatos de la misma búsqueda manteniendo constante todo lo demás (datos, grafo, inicialización, semilla).
- Reproducción de experimentos de dinámica inversa en manipulación: al conservar el grafo nativo y la normalización original, sirve como punto de partida reproducible para verificar resultados de la línea `inverse-dynamics` sobre LIBERO.
- Punto de partida para ajustes finos posteriores: al ser un checkpoint completo con pesos verificados, puede usarse como inicialización de nuevos entrenamientos en lugar de partir del modelo base.
- Evaluación comparativa de políticas VLA en LIBERO: útil como uno de los brazos de un estudio que mida tasa de éxito entre configuraciones de LR, siempre que el resto de las condiciones se mantenga idéntica.
- Docencia y formación en robótica basada en aprendizaje: permite ilustrar de forma tangible cómo se estructura una búsqueda de hiperparámetros sobre políticas VLA y cómo se versionan los checkpoints intermedios.
- Auditoría de artefactos de investigación: al documentar explícitamente que la evaluación está pendiente y que no se reclama tasa de éxito, sirve como ejemplo de publicación responsable de checkpoints no validados.
- Infraestructura de comparación de checkpoints: por su convención de nombres (`...e30-1000-...`), encaja en pipelines internos de seguimiento de experimentos que registren versión, época y paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito ("Evaluation is pending; no success rate is claimed"). No se aportan cifras de LIBERO ni de ningún otro conjunto de evaluación, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Como referencia del orden de magnitud, el repositorio ocupa 7,7 GB, por lo que cargar los pesos completos requiere al menos esa cantidad de memoria, más el sobrecoste de activaciones, buffers de inferencia y del codificador visual.
- GPU recomendadas: no disponibles. Por el tamaño del repositorio, una GPU con 24 GB (RTX 3090, RTX 4090, A5000) es el mínimo razonable para alojar los pesos sin cuantizar; A100 o H100 darían margen para lotes mayores y evaluación por lotes.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 24 GB si los pesos caben en el formato publicado, aunque no hay confirmación oficial ni se especifica el `dtype`. En GPUs de 8-12 GB no hay información que permita afirmarlo.
- Opciones de despliegue: la librería asociada es `openpi`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y en general estos motores no están pensados para políticas robóticas con salidas de acción. El despliegue esperado es mediante el propio stack de openpi.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por paso ni rendimiento en tareas.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e30-1000-20261015` | Política VLA para manipulación (candidato de búsqueda de hiperparámetros) | No disponible | No disponible | Apache-2.0 | Pública en Hugging Face, sin evaluar |
| pi0.5 / openpi (modelo base de la familia) | Política VLA para manipulación | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Repositorio y pesos distribuidos por el proyecto openpi |
| OpenVLA | Política VLA para manipulación | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Público |
| RDT-1B | Política de difusión para manipulación bimanual | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Público |

No se dispone de datos verificados en la información proporcionada para establecer comparaciones cuantitativas de rendimiento entre estos modelos. La comparación anterior es únicamente cualitativa y de categoría.

## Limitaciones y advertencias

- Evaluación pendiente: el propio autor declara que no se reclama ninguna tasa de éxito. No debe usarse como referencia de rendimiento ni citarse como resultado.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay validación por parte de terceros más allá de la verificación de pesos congelados que menciona el autor.
- Artefacto de ablation: la única variable modificada son los multiplicadores de LR. No es un modelo "mejorado" ni una versión recomendada de la familia pi0.5, sino un punto de una búsqueda de hiperparámetros.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y en el caso de políticas robóticas el sesgo relevante (sesgo de entorno, de objetos, de iluminación o de morfología del robot) no está caracterizado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de generalización incorrecta fuera de la distribución de LIBERO, sin que haya métricas publicadas para cuantificarlo.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y el modelo no declara idiomas; no es un modelo de texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificaciones, siempre que se conserve el aviso de licencia y se indique los cambios. Al derivar de openpi/pi0.5, conviene verificar la licencia del modelo base y de los pesos originales antes de un uso comercial.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ, GPTQ ni indicación de `dtype`, lo que dificulta el despliegue en hardware limitado.
- Origen de los datos: aunque la model card afirma que los datos de contacto denso son los originales, no se detalla su procedencia ni sus condiciones de uso.
- Dependencia del stack openpi: el formato de pesos y la lógica de inferencia están atados a esa librería; no se documenta interoperabilidad con otros runners.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e30-1000-20261015
- Repositorio openpi (referenciado por la etiqueta `openpi`): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo; los enlaces devueltos por la búsqueda corresponden a preguntas sobre presentaciones en Zhihu y no guardan relación con el modelo.
