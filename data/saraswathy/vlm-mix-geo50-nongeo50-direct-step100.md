# Saraswathy/vlm-mix-geo50-nongeo50-direct-step100

## Resumen

Saraswathy/vlm-mix-geo50-nongeo50-direct-step100 es un adaptador LoRA (PEFT) sobre el modelo vision-language Qwen/Qwen3-VL-4B-Instruct, publicado por Saraswathy Amjith como artefacto de investigación dentro de una serie de experimentos sobre mezclas de datos en modelos multimodales. El adaptador fue entrenado directamente con una mezcla 50/50 de datos de geometría y no-geometría, fijado en el paso 100 del entrenamiento. No incluye el modelo base ni los datos de entrenamiento; solo contiene los pesos del adaptador, por lo que requiere cargar el modelo base Qwen3-VL-4B-Instruct en una revisión específica (ebb281ec70b05090aa6165b016eac8ec08e71b17) para su uso.

El modelo está diseñado para investigar cómo la proporción de datos de una categoría (en este caso, geometría) afecta al rendimiento de un VLM cuando se mezcla con datos generales. La elección de un adaptador LoRA permite experimentar con bajo coste computacional, ya que solo se actualizan los parámetros de baja dimensión (rank 64) sobre el modelo base. Aunque no se proporcionan métricas de evaluación en la model card, el repositorio se enmarca en una serie de experimentos de mezcla de datos (vlm-mix) que probablemente se comparan con otros adaptadores similares.

Este artefacto es relevante para investigadores interesados en el ajuste fino de VLMs con PEFT, en el estudio de la composición de datasets de entrenamiento y en la reproducibilidad de experimentos con adaptadores. No está pensado como un modelo listo para producción, sino como un punto de referencia dentro de una investigación más amplia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-VL-4B-Instruct (modelo base) |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 64 y alpha 128, pero no se indica el número total de parámetros del adaptador; el modelo base tiene 4B) |
| Parametros activos | No aplicable (no es MoE; el adaptador añade parámetros a los pesos del base) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-VL-4B-Instruct, que soporta contexto largo, pero no se especifica el valor en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se proporciona en safetensors; no se indican cuantizaciones) |
| Idiomas soportados | No disponible (no se listan idiomas en la model card; el modelo base Qwen3-VL-4B-Instruct es multilingüe, pero no se confirma para este adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen/Qwen3-VL-4B-Instruct, un modelo de visión-lenguaje de 4B parámetros de la familia Qwen3-VL. El adaptador LoRA tiene un rank de 64 y un alpha de 128, lo que indica una actualización de parámetros moderada en comparación con el tamaño del modelo base. El entrenamiento se realizó directamente con una mezcla de datos 50% de geometría y 50% de no-geometría, fijando el entrenamiento en el paso 100. No se proporcionan detalles sobre el número total de pasos, el dataset exacto, la función de pérdida o si se usó RLHF/DPO. La model card menciona que es parte de un experimento más amplio denominado "VLM mixture/PoEM", y que los protocolos de evaluación y resultados se mantienen en un repositorio de experimentos asociado, aunque no se proporciona el enlace directo.

El adaptador está diseñado para ser cargado con la biblioteca PEFT, y se especifica que debe fijarse la revisión del modelo base `ebb281ec70b05090aa6165b016eac8ec08e71b17` para garantizar la reproducibilidad. Esto sugiere que el entrenamiento se realizó sobre una versión concreta del modelo base, lo que es una buena práctica para la reproducibilidad.

## Capacidades

- Adaptador LoRA que modifica el comportamiento del modelo base Qwen3-VL-4B-Instruct en tareas de visión-lenguaje, especialmente en el dominio de geometría, según el objetivo del experimento.
- Hereda las capacidades del modelo base: generación de texto, razonamiento visual, comprensión de imágenes y texto, y posiblemente soporte de tool calling y agentes, aunque no se especifica en la model card.
- Al ser un adaptador PEFT, no introduce nuevas capacidades arquitectónicas, sino que ajusta los pesos del modelo base para una distribución de datos específica.
- No se documentan capacidades adicionales como thinking mode, visión de audio o soporte multilingüe específico.

## Casos de uso

- Investigación sobre mezcla de datos en entrenamiento de VLMs: el adaptador sirve como artefacto para estudiar el efecto de una proporción 50/50 de datos de geometría frente a no-geometría en el rendimiento del modelo. Se puede cargar sobre el modelo base y comparar con otros adaptadores de la misma serie (por ejemplo, `vlm-mix-stem60-geometry40-direct-step100`) para analizar la sensibilidad a la composición del dataset.
- Evaluación de adaptadores LoRA en tareas de geometría visual: se puede usar el adaptador para probar la capacidad de razonamiento geométrico (por ejemplo, identificación de formas, propiedades geométricas, cálculo de áreas) sobre imágenes, comparando con el modelo base sin adaptador.
- Reproducción de experimentos de investigación: al estar fijada la revisión del modelo base y el hash del adaptador, se puede reproducir exactamente el entrenamiento y la evaluación descritos en el repositorio de experimentos asociado.
- Estudio de la estabilidad del entrenamiento en pasos tempranos: al fijarse en el paso 100, se puede analizar la evolución del rendimiento durante el entrenamiento temprano, comparando con adaptadores entrenados a otros pasos.
- Pruebas de integración con frameworks de PEFT: el adaptador sirve como ejemplo de carga y uso de un adaptador LoRA con Qwen3-VL en bibliotecas como Hugging Face Transformers y PEFT, útil para desarrolladores que quieren implementar ajuste fino eficiente en sus pipelines.
- Benchmark de composición de datos en VLMs: el adaptador puede formar parte de un conjunto de modelos de referencia para evaluar cómo la mezcla de datos afecta a la generalización en dominios específicos, útil para diseñar datasets de entrenamiento en proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Se indica que los resultados comparativos se mantienen en un repositorio de experimentos asociado, pero no se ha proporcionado el enlace ni los datos. Por tanto, no se puede evaluar el rendimiento del adaptador en tareas estándar.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (el tamaño del repositorio es de 0.5 GB, pero solo contiene los pesos del adaptador). Para su uso se debe cargar el modelo base Qwen3-VL-4B-Instruct, que tiene 4B parámetros.
- VRAM estimada: no disponible, pero un modelo de 4B parámetros en FP16 requiere aproximadamente 8 GB de VRAM para inferencia, más espacio para el adaptador. Se recomienda al menos una GPU con 12 GB de VRAM para mayor comodidad (por ejemplo, RTX 3060 12GB, RTX 3080, RTX 4090).
- GPU recomendadas: cualquier GPU moderna con soporte para FP16/BF16, como NVIDIA A100, H100, RTX 4090, RTX 3090, etc. Para inferencia en CPU, se podría usar llama.cpp u otras herramientas, pero no se documenta.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la biblioteca `peft` de Hugging Face Transformers, o usar herramientas como vLLM, TGI, o llama.cpp (si se convierte a GGUF, aunque no se proporciona). No se han documentado opciones específicas de despliegue.
- Latencia y throughput: no disponible. Depende del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

No hay modelos comparables directamente, pero se pueden considerar otros adaptadores de la misma autora dentro de la serie `vlm-mix`. Por ejemplo:

| Modelo | Base | Mezcla de datos | Paso | Rank/Alpha | Licencia |
|---|---|---|---|---|---|
| vlm-mix-geo50-nongeo50-direct-step100 | Qwen3-VL-4B-Instruct | 50% geometría / 50% no-geometría | 100 | 64/128 | Apache 2.0 |
| vlm-mix-stem60-geometry40-direct-step100 | Qwen3-VL-4B-Instruct | 60% STEM / 40% geometría | 100 | no disponible | Apache 2.0 |
| vlm-mix-broader-stem-expert-step100 | Qwen3-VL-4B-Instruct | STEM más amplio | 100 | no disponible | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos adaptadores en la información proporcionada. Tampoco se pueden comparar con otros modelos de visión-lenguaje de tamaño similar sin datos de benchmarks.

## Limitaciones y advertencias

- El adaptador solo contiene los pesos del LoRA, no el modelo base ni los datos de entrenamiento. Para usar el modelo, es imprescindible cargar la revisión exacta del modelo base especificada (`ebb281c70b05090aa6165b5e5b016eac8ec08e71b17`), de lo contrario los resultados pueden no ser reproducibles.
- No se han publicado métricas de rendimiento, por lo que se desconoce la calidad del modelo en tareas de geometría o en tareas generales. Es un artefacto de investigación, no un modelo listo para producción.
- No se documentan sesgos conocidos, pero al ser un adaptador entrenado con una mezcla específica de datos, podría presentar sesgos en dominios no representados en el dataset de entrenamiento (por ejemplo, si la parte no-geometría es muy limitada).
- Riesgo de alucinación: al ser un modelo de lenguaje multimodal, puede generar respuestas incorrectas o inventadas, especialmente en tareas de geometría donde el razonamiento es complejo.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, lo que permite uso comercial, pero hay que verificar la licencia del modelo base Qwen3-VL-4B-Instruct (que es Apache 2.0 también, según la información del repositorio). Sin embargo, el modelo base puede tener condiciones adicionales; se recomienda revisar su documentación.
- No se proporciona información sobre el idioma de los datos de entrenamiento, por lo que el adaptador podría estar sesgado hacia el idioma de los datos utilizados (posiblemente inglés u otros). No se recomienda su uso en producción sin una evaluación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-geo50-nongeo50-direct-step100
- Repositorio de experimentos asociado: no disponible en la información proporcionada (se menciona en la model card pero no se proporciona el enlace)
- Página personal de la autora: https://saraamjith.com/saraamjith.html (menciona trabajos con VLMs y GRPO)
- Otros adaptadores de la serie (relacionados):
  - https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100
  - https://huggingface.co/Saraswathy/vlm-mix-stem60-geometry40-direct-step100
