# Lanni-ni/alibi_4_6_384_babylm_10m_seed43

## Resumen

Lanni-ni/alibi_4_6_384_babylm_10m_seed43 es un modelo de lenguaje de tamaño pequeño publicado en Hugging Face por el usuario Lanni-ni. Su nombre y las etiquetas del repositorio sugieren que se trata de un transformer con atención ALiBi (Attention with Linear Biases), posiblemente entrenado sobre el corpus BabyLM. Sin embargo, la model card es una plantilla autogenerada sin contenido real, por lo que no se dispone de información confirmada sobre la arquitectura, los datos de entrenamiento o las capacidades del modelo.

El modelo cuenta con 45.694.080 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos muy ligeros. Su pipeline declarado es text-generation, y el repositorio incluye la etiqueta `custom_code`, lo que indica que puede requerir código personalizado para su carga. No se ha publicado información sobre la longitud de contexto, los idiomas soportados, la licencia ni el proceso de entrenamiento. Es un modelo de investigación sin documentación suficiente para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi (según etiqueta; no confirmado en la model card) |
| Parametros totales | 45.694.080 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no contiene información sobre la arquitectura ni el procedimiento de entrenamiento. El nombre del modelo (`alibi_4_6_384_babylm_10m_seed43`) y la etiqueta `alibi` sugieren el uso de atención ALiBi, una técnica que añade sesgos lineales a las puntuaciones de atención para favorecer la extrapolación a secuencias más largas. Los números `4_6_384` podrían interpretarse como 4 capas, 6 cabezas de atención y una dimensión oculta de 384, pero esto no está confirmado. La etiqueta `babylm_10m` apunta a un posible entrenamiento con el corpus BabyLM, aunque el número real de parámetros (45,7 millones) no coincide con la denominación "10m". El repositorio incluye la etiqueta `custom_code`, lo que implica que el modelo puede necesitar código personalizado para cargarse correctamente. No hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO.

## Capacidades

No se dispone de información sobre las capacidades del modelo. La model card no describe tareas, benchmarks ni funcionalidades específicas. Basándose únicamente en el pipeline declarado, se puede inferir que es un modelo de generación de texto, pero no se puede confirmar si soporta tool calling, agentes, razonamiento multi-paso, visión u otras capacidades avanzadas. Tampoco se conocen sus capacidades multilingües.

## Casos de uso

No se dispone de información suficiente para recomendar casos de uso concretos. La model card está vacía y no se han publicado evaluaciones ni demostraciones. Cualquier aplicación práctica sería especulativa. Por ello, no es posible listar casos de uso realistas para este modelo. Se recomienda tratarlo únicamente como material de investigación para estudiar la atención ALiBi en modelos de pequeño tamaño, siempre y cuando se realice una evaluación previa y se disponga del código personalizado necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. No se debe asumir ningún nivel de rendimiento.

## Requisitos de hardware

Con 45.694.080 parámetros, el modelo es extremadamente ligero. En precisión fp16, los pesos ocupan aproximadamente 91 MB; en fp32, alrededor de 183 MB. Esto permite su ejecución en cualquier GPU con más de 1 GB de VRAM, e incluso en CPU. No se dispone de datos de latencia o throughput. En cuanto al despliegue, al ser un modelo `transformers` con `custom_code`, se puede intentar cargar con la librería `transformers` de Hugging Face, aunque se requiere el código personalizado incluido en el repositorio. La compatibilidad con otros frameworks como llama.cpp, Ollama o vLLM no está confirmada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al no haber documentación, benchmarks ni especificaciones confirmadas, no es posible establecer una comparativa fiable con otros modelos de la misma categoría.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin contenido, lo que impide conocer sesgos, riesgos o limitaciones técnicas.
- No se ha publicado información sobre el proceso de entrenamiento, los datos utilizados ni las técnicas de alineación.
- El modelo no está documentado para uso comercial ni para producción.
- La etiqueta `custom_code` indica que puede requerir código personalizado, lo que dificulta su integración en pipelines estándar.
- El nombre sugiere un modelo de investigación, no un modelo listo para tareas reales.
- Se desconoce la licencia, por lo que no se puede garantizar el cumplimiento legal en proyectos comerciales.

## Enlaces

- Hugging Face: https://huggingface.co/Lanni-ni/alibi_4_6_384_babylm_10m_seed43
- Referencia al artículo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
