# fpadovani/eus-latn-100mb-10mb_seed10

## Resumen

El modelo `fpadovani/eus-latn-100mb-10mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eus_latn_100mb`, perteneciente a la familia Goldfish de modelos de lenguaje monolingües desarrollados por la Universidad de Groningen para idiomas con pocos recursos digitales. En este caso, el modelo base está entrenado con 100 MB de texto en euskera (escritura latina), y este fine-tune añade una etapa de entrenamiento supervisado (SFT) sobre un subconjunto adicional de 10 MB de datos, utilizando la librería TRL de HuggingFace.

La arquitectura subyacente es GPT-2, con aproximadamente 124,8 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños. Su propósito principal es la generación de texto en euskera, aunque el ejemplo de uso de la model card muestra un prompt en inglés, lo que sugiere que el fine-tune pudo incluir datos multilingües o que el modelo conserva cierta capacidad en inglés heredada del tokenizador y la arquitectura GPT-2.

La relevancia de este modelo radica en su contribución a la investigación en procesamiento de lenguaje natural para lenguas minoritarias, donde la disponibilidad de modelos preentrenados es escasa. Al ser un modelo compacto, puede ejecutarse en hardware modesto, lo que facilita su uso en entornos educativos y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 (~125 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (por defecto en GPT-2, no confirmado en este modelo) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | euskera (presumiblemente, por el nombre del modelo base); posiblemente ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768. Esta arquitectura es estándar para generación de texto autoregresiva y no incorpora innovaciones recientes como atención lineal, MoE o decodificación especulativa.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el modelo base `goldfish-models/eus_latn_100mb`. Según la model card, se utilizó TRL 0.23.0, Transformers 4.56.2 y PyTorch 2.11.0. El nombre del modelo (`10mb`) sugiere que se emplearon 10 MB de datos de entrenamiento adicionales, y `seed10` indica la semilla aleatoria usada. No se proporcionan detalles sobre la composición del dataset, el número de pasos, la tasa de aprendizaje ni si se aplicaron técnicas como RLHF o DPO. El entrenamiento se registró en Weights & Biases, aunque el enlace no detalla las métricas.

## Capacidades

- Generación de texto autoregresiva en euskera (y posiblemente inglés), con una ventana de contexto de hasta 1024 tokens.
- Finalización de prompts y respuestas a preguntas sencillas, como se muestra en el ejemplo de la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni visión ni audio).
- Al ser un modelo pequeño, su capacidad de razonamiento complejo y generación de código es muy limitada.
- El tokenizador es el de GPT-2, que maneja subpalabras en inglés y puede tener cobertura limitada para euskera, aunque el modelo base fue entrenado específicamente en ese idioma.

## Casos de uso

- Investigación en NLP para euskera: permite experimentar con generación de texto en un idioma de bajos recursos, sirviendo como punto de partida para estudios de transferencia o adaptación.
- Prototipado de chatbots en euskera: puede generar respuestas a preguntas simples en un entorno controlado, aunque su calidad será limitada por el tamaño del modelo.
- Educación y demostraciones: útil para enseñar conceptos de fine-tuning y generación de lenguaje en aulas, dado su bajo coste computacional.
- Análisis lingüístico: puede usarse para estudiar patrones morfológicos o sintácticos del euskera generando texto sintético.
- Línea base en benchmarks: sirve como referencia para comparar modelos más grandes o técnicas de adaptación en euskera.
- Generación de contenido corto: adecuado para crear titulares, descripciones breves o textos de relleno en euskera, siempre que se acepte cierta tasa de errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo es un fine-tune pequeño y es poco probable que compita con modelos de mayor escala en tareas generales.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (125 M parámetros × 4 bytes ≈ 500 MB). Con cuantización a int8 o int4, puede bajar a ~250 MB o ~125 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad.
- Cabe en GPUs de consumo: sí, incluso en las más básicas.
- Opciones de despliegue: transformers pipeline (como en el ejemplo), vLLM (aunque es excesivo para este tamaño), llama.cpp con conversión a GGUF, o TGI. También se puede usar en CPU con PyTorch.
- Latencia y throughput: no se han publicado datos. En una GPU moderna (RTX 3090), se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/eus-latn-100mb-10mb_seed10 | 125 M | 1024 | euskera | no disponible | HuggingFace |
| goldfish-models/eus_latn_100mb (base) | 125 M | 1024 | euskera | no disponible | HuggingFace |
| Latxa-7B (HiTZ) | 7 B | 8192 | euskera | Apache 2.0 | HuggingFace |

El modelo base Goldfish es el punto de partida de este fine-tune. Latxa es un modelo mucho más grande (7B) desarrollado por el grupo HiTZ de la Universidad del País Vasco, con licencia Apache 2.0 y un contexto mayor. La comparación directa no es justa por la diferencia de tamaño, pero Latxa ofrece un rendimiento muy superior en tareas de euskera. No se dispone de datos de otros modelos pequeños específicos para euskera.

## Limitaciones y advertencias

- Modelo muy pequeño (125 M), con capacidad limitada para razonamiento complejo, generación de código o tareas que requieran conocimiento del mundo.
- Riesgo de alucinaciones: al ser un modelo pequeño, puede generar texto incoherente o factualmente incorrecto, especialmente en temas fuera de su dominio de entrenamiento.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de usar el modelo en producción.
- La cobertura del tokenizador GPT-2 para euskera puede ser subóptima, lo que afecta a la calidad de la generación en comparación con tokenizadores específicos.
- La ventana de contexto de 1024 tokens es corta para tareas que requieran contexto largo.
- No hay información sobre sesgos, pero al ser entrenado en una cantidad muy limitada de datos, es probable que refleje sesgos presentes en ese corpus.
- El tamaño del repositorio (9.0 GB) es inusualmente grande para 125 M de parámetros, lo que sugiere que puede contener archivos adicionales o versiones en múltiples formatos. No se ha verificado su contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/eus-latn-100mb-10mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/cnmp5s5o
- Repositorio de TRL: https://github.com/huggingface/trl
