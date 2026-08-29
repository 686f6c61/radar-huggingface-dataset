# Islamamro/insincere-questions-aurora-islamamro

## Resumen

El modelo `Islamamro/insincere-questions-aurora-islamamro` es un clasificador de texto binario diseñado para detectar preguntas insinceras o cargadas (loaded questions). Ha sido desarrollado por el usuario Islamamro mediante un fine-tuning de `distilbert-base-uncased` sobre el dataset `SetFit/insincere-questions`, y publicado a través del Aurora Research Portal. El modelo cuenta con 66,9 millones de parámetros y se presenta como una prueba de concepto del pipeline de entrenamiento y publicación de Aurora, no como un modelo listo para producción.

La relevancia de este modelo radica en su carácter demostrativo: muestra cómo se puede construir, entrenar y publicar un clasificador de texto de extremo a extremo con recursos modestos (una NVIDIA RTX 3090) y un subconjunto de datos reducido. Su arquitectura es un transformer encoder destilado (DistilBERT), con una ventana de contexto típica de 512 tokens, aunque este dato no se especifica en la documentación oficial. La licencia Apache 2.0 permite su uso y modificación, pero el autor advierte explícitamente que no es adecuado para entornos de producción sin un fine-tuning adicional sobre el dataset completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, versión destilada de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (DistilBERT base suele soportar 512 tokens, pero no se confirma en la documentación) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin cuantizaciones adicionales) |
| Idiomas soportados | No disponible (el modelo base es inglés, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. DistilBERT utiliza una arquitectura transformer encoder con atención multi-cabeza y capas de normalización, pero con la mitad de capas que BERT base. El fine-tuning se realizó sobre el dataset `SetFit/insincere-questions`, que contiene preguntas etiquetadas como sinceras o insinceras. Según la model card, el entrenamiento se llevó a cabo sobre un subconjunto de demostración de 1.400 ejemplos, utilizando el Aurora Research Portal y una GPU NVIDIA RTX 3090. No se proporcionan detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. No se menciona ninguna innovación técnica destacable más allá del flujo de trabajo automatizado de Aurora.

## Capacidades

- Clasificación binaria de texto: distingue entre preguntas sinceras e insinceras (cargadas o engañosas).
- Inferencia rápida y ligera gracias al tamaño reducido del modelo (66,9M parámetros).
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales, al ser un modelo exclusivamente discriminativo.
- El idioma de trabajo probablemente sea inglés, dado que el modelo base es `distilbert-base-uncased`, aunque no se confirma en la documentación.

## Casos de uso

- Moderación de contenido en foros y redes sociales: el modelo puede preclasificar preguntas de usuarios para señalar aquellas que puedan ser provocativas o malintencionadas, aunque su baja precisión en datos reales limita su uso a pruebas piloto.
- Detección de preguntas engañosas en plataformas de Q&A: podría integrarse en sistemas de filtrado previo para alertar a moderadores humanos, pero requiere reentrenamiento con el dataset completo.
- Demostración de pipelines de MLOps: sirve como ejemplo didáctico de cómo construir, entrenar y publicar un modelo de clasificación con herramientas como Aurora y Hugging Face.
- Evaluación de técnicas de fine-tuning: permite comparar el rendimiento de DistilBERT en tareas de clasificación con subconjuntos pequeños de datos.
- Prototipado rápido de sistemas de análisis de sentimiento o intención: aunque no está optimizado para ello, su arquitectura puede adaptarse con fine-tuning adicional.
- Investigación sobre sesgos en modelos de lenguaje: al ser un modelo pequeño y entrenado con datos limitados, puede utilizarse para estudiar el impacto del tamaño del dataset en la calidad de la clasificación.

## Benchmarks y rendimiento

La única métrica publicada es la precisión en un conjunto de validación retenido (held-out), que alcanza 0,95. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE, ni comparaciones con otros modelos de clasificación de texto. El autor indica que el modelo fue entrenado con solo 1.400 ejemplos, por lo que esta precisión debe interpretarse con cautela y no es representativa de un rendimiento en producción.

| Métrica | Valor |
|---|---|
| Precisión (held-out) | 0,95 |

No se dispone de más datos de rendimiento en la información proporcionada.

## Requisitos de hardware

- Al tratarse de un modelo de 66,9 millones de parámetros, la inferencia es ligera y puede ejecutarse en CPU o en GPUs de gama baja.
- El entrenamiento se realizó en una NVIDIA RTX 3090 (24 GB VRAM), pero la inferencia requiere mucho menos: se estima que menos de 1 GB de VRAM es suficiente en FP32, y menos aún con cuantización.
- Es compatible con GPUs de consumo como RTX 3060, RTX 4060 o incluso integradas, así como con CPUs modernas.
- Opciones de despliegue: puede servirse con `transformers` (pipeline de Python), o exportarse a ONNX o TensorRT para entornos de producción. También es compatible con frameworks como vLLM o TGI, aunque al ser un modelo pequeño no es necesario.
- No se han publicado datos de latencia o throughput específicos, pero por su tamaño se espera una inferencia en el orden de milisegundos por muestra en GPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de clasificación de texto en la documentación proporcionada. Como referencia general, otros fine-tunings de DistilBERT sobre datasets de moderación de contenido (por ejemplo, modelos de detección de toxicidad) suelen tener arquitecturas y tamaños similares, pero no se pueden establecer comparaciones cuantitativas sin datos publicados.

## Limitaciones y advertencias

- El modelo fue entrenado únicamente con un subconjunto de 1.400 ejemplos, lo que lo hace no representativo y propenso a sobreajuste.
- No es adecuado para uso en producción sin un fine-tuning adicional sobre el dataset completo.
- El dataset `SetFit/insincere-questions` puede contener sesgos inherentes en la definición de "insinceridad", lo que podría propagar estereotipos o juicios subjetivos.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero sí puede producir falsos positivos o negativos en la detección de preguntas insinceras.
- La documentación no especifica los idiomas soportados; se asume inglés, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en entornos reales sin reentrenamiento.
- No se han publicado detalles sobre el proceso de entrenamiento (tokens, épocas, hiperparámetros), lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Islamamro/insincere-questions-aurora-islamamro)
- [Dataset SetFit/insincere-questions](https://huggingface.co/datasets/SetFit/insincere-questions)
- [Perfil de GitHub del autor](https://github.com/islamamro)
