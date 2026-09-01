# GT1999/mwp-v2-llama1b-base-staged-stage4

## Resumen

El modelo `GT1999/mwp-v2-llama1b-base-staged-stage4` es un adaptador LoRA entrenado sobre una base Llama de 1B de parámetros, especializado en la resolución de problemas matemáticos planteados en lenguaje natural (math word problems). Ha sido desarrollado por el usuario GT1999 y forma parte de un proyecto de entrenamiento por etapas (staged) con un currículo progresivo de dificultad. Este modelo concreto corresponde a la cuarta etapa de un proceso de cinco, en el que se acumulan niveles de dificultad (L1 a L5) mediante una estrategia de replay acumulativo.

La relevancia de este modelo radica en su enfoque de entrenamiento curricular: en lugar de presentar todos los ejemplos a la vez, se introduce gradualmente la dificultad, lo que puede mejorar la estabilidad del entrenamiento y el rendimiento final en tareas de razonamiento matemático. Al ser un adaptador LoRA de pequeño tamaño (0.1 GB), es ligero y fácil de integrar sobre el modelo base, lo que lo hace atractivo para entornos con recursos limitados. Sin embargo, la información pública disponible es escasa: no se especifican licencia, idiomas soportados ni resultados de benchmarks, por lo que su uso en producción requiere una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama 1B (base no especificada explícitamente, se infiere del nombre) |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 32, alpha 64; el modelo base tiene ~1B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors del adaptador) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado a un modelo base Llama de 1B de parámetros. La configuración del adaptador es rank 32 y alpha 64, con escalado alpha/rank. El entrenamiento se realiza mediante la técnica `seqft` (sequential fine-tuning) y `plrs` (probablemente "progressive learning rate schedule" o similar), organizado en etapas curriculares. En esta cuarta etapa, el currículo cubre los niveles L1 a L4 (acumulando los anteriores), con un esquema de rank constante de 32 en todas las etapas. Se utiliza replay acumulativo, es decir, los ejemplos de niveles anteriores se reutilizan en cada etapa. La partición de etapas se basa en la dificultad de los problemas, y se emplea una semilla de validación fija (42) con un 5% de datos reservados para validación estratificada por nivel. El número de ejemplos de entrenamiento acumulados en esta etapa es de 4935. No se especifican detalles sobre el dataset original ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Resolución de problemas matemáticos planteados en lenguaje natural (math word problems), como operaciones aritméticas, proporciones, porcentajes o ecuaciones simples.
- Razonamiento paso a paso: al estar entrenado con un currículo progresivo, es probable que el modelo haya aprendido a descomponer problemas en pasos intermedios, aunque no se confirma explícitamente.
- Adaptabilidad a diferentes niveles de dificultad gracias al entrenamiento por etapas, lo que podría permitir ajustar el nivel de complejidad de las respuestas.
- No se dispone de información sobre capacidades adicionales como generación de código, tool calling, soporte multilingüe o modo de razonamiento extendido.

## Casos de uso

- Tutoría educativa automatizada: el modelo puede utilizarse en plataformas de aprendizaje para resolver problemas matemáticos planteados por estudiantes, ofreciendo explicaciones paso a paso. Su entrenamiento curricular podría ayudar a adaptar la dificultad de las respuestas al nivel del alumno.
- Generación de ejercicios matemáticos: dado su entrenamiento en problemas con palabras, podría generar nuevos enunciados de problemas a partir de plantillas, útil para crear bancos de preguntas en sistemas de evaluación.
- Asistente para deberes: integrado en un chatbot o aplicación de mensajería, puede ayudar a estudiantes a verificar sus soluciones o a entender el proceso de resolución.
- Preprocesamiento de datos educativos: en pipelines de análisis de texto, puede extraer y resolver problemas matemáticos de documentos o foros, facilitando la minería de datos educativos.
- Evaluación de modelos de razonamiento: al ser un adaptador ligero, puede servir como punto de referencia para comparar técnicas de fine-tuning curricular en tareas de matemáticas.
- Prototipado rápido en investigación: su pequeño tamaño permite experimentar con estrategias de entrenamiento por etapas sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, GSM8K, HumanEval u otras métricas estándar para este modelo.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB, por lo que el almacenamiento es mínimo.
- Para la inferencia se necesita cargar el modelo base Llama 1B (aproximadamente 2 GB en FP16, o menos con cuantización) más el adaptador. En total, la VRAM estimada para inferencia en FP16 sería de unos 2-3 GB, dependiendo de la longitud de contexto y el batch.
- Es viable en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También podría ejecutarse en CPU con suficiente RAM, aunque con mayor latencia.
- Opciones de despliegue: al ser un adaptador LoRA, se puede integrar con frameworks como Hugging Face Transformers (cargando el adaptador sobre el base), vLLM (si se fusiona el adaptador), o llama.cpp si se convierte a GGUF. No se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El autor tiene otro modelo en Hugging Face (`GT1999/mwp-v2-llama1b-b1-stage1`) que parece ser una etapa anterior del mismo proyecto, pero no se conocen sus especificaciones completas. No se han identificado otros modelos comparables en la misma categoría (adaptadores LoRA para problemas matemáticos sobre Llama 1B) con datos públicos.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que su uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre sesgos o alucinaciones. Al ser un modelo pequeño y especializado, es probable que tenga limitaciones en problemas complejos o fuera de su dominio de entrenamiento.
- La longitud de contexto no está documentada; se asume la del modelo base Llama 1B (típicamente 2048 o 4096 tokens), pero no se confirma.
- El modelo solo está entrenado para problemas matemáticos con palabras; no se debe esperar que funcione bien en otras tareas de lenguaje general.
- No se han publicado resultados de evaluación, por lo que su rendimiento real es desconocido. Cualquier uso en aplicaciones críticas requiere una validación exhaustiva.
- El repositorio no incluye el modelo base, solo el adaptador. Es necesario descargar el modelo base Llama 1B por separado, lo que puede implicar restricciones de uso según la licencia de Meta.

## Enlaces

- [Hugging Face - GT1999/mwp-v2-llama1b-base-staged-stage4](https://huggingface.co/GT1999/mwp-v2-llama1b-base-staged-stage4)
- [Hugging Face - GT1999/mwp-v2-llama1b-b1-stage1 (modelo relacionado)](https://huggingface.co/GT1999/mwp-v2-llama1b-b1-stage1)
