# linnotlinn/run2-babylm-shuffled-2345-gpt2-small

## Resumen

El modelo `linnotlinn/run2-babylm-shuffled-2345-gpt2-small` es un ajuste fino de un modelo GPT-2 small (arquitectura transformer decoder-only) sobre el corpus BabyLM, un conjunto de datos diseñado para estudiar la adquisición del lenguaje en modelos de aprendizaje automático. El autor, linnotlinn, ha publicado este modelo como parte de la competencia BabyLM, que busca entrenar modelos de lenguaje con datos de calidad similar a la que recibe un niño. La variante "shuffled" indica que los datos de entrenamiento fueron barajados (probablemente a nivel de oraciones o documentos) para investigar el efecto del orden de los datos en el aprendizaje.

Con 124.439.808 parámetros, este modelo es relativamente pequeño en comparación con los LLM actuales, pero suficiente para experimentos controlados en lingüística computacional. La model card generada automáticamente no proporciona detalles sobre el dataset exacto ni el modelo base, pero los hiperparámetros de entrenamiento (20 épocas, batch de 512, learning rate de 0.0002) sugieren un entrenamiento exhaustivo sobre un corpus limitado. La relevancia de este modelo radica en su contribución a la investigación sobre cómo los modelos aprenden lenguaje a partir de datos restringidos y barajados, un tema central en la competencia BabyLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (estándar GPT-2: 1024 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 small, un transformer decoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. No se han publicado detalles sobre modificaciones arquitectónicas; es un GPT-2 estándar. El entrenamiento se realizó sobre un dataset de BabyLM (el nombre sugiere que se usó la versión barajada del corpus, probablemente el dataset `linnotlinn/babylm_gpt2_shuffled`), aunque la model card no especifica el número de tokens ni la composición exacta. Los hiperparámetros reportados incluyen learning rate de 0.0002, batch size efectivo de 512 (64 con 8 pasos de acumulación), scheduler cosine con warmup de 100 pasos y 20 épocas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento supervisado estándar de lenguaje.

## Capacidades

- Generación de texto: al ser un GPT-2 small, puede generar texto coherente a corto plazo, pero con limitaciones en coherencia a largo plazo y razonamiento complejo.
- Modelado de lenguaje: su función principal es predecir la siguiente palabra, útil para tareas de completado de texto.
- Investigación en adquisición del lenguaje: diseñado para estudiar cómo el orden de los datos (barajado vs. original) afecta el aprendizaje, no para tareas prácticas de producción.
- Sin soporte para tool calling, agentes, visión, audio ni modos de razonamiento explícitos.
- Capacidades multilingües: no disponibles; probablemente entrenado solo en inglés (corpus BabyLM es mayoritariamente inglés), pero no confirmado.

## Casos de uso

- Investigación académica en psicolingüística computacional: el modelo permite comparar el efecto del barajado de datos en la adquisición de estructuras sintácticas y semánticas, usando la pérdida de evaluación como métrica.
- Estudio de la influencia del orden de los datos en el aprendizaje: al comparar este modelo con su contraparte "original" (sin barajar), los investigadores pueden aislar el impacto del orden de las oraciones en la generalización.
- Benchmark para modelos BabyLM: sirve como baseline de tamaño pequeño para evaluar técnicas de entrenamiento con datos limitados, como regularización o aumentación de datos.
- Análisis de representaciones lingüísticas: al ser un modelo pequeño y entrenado en un corpus controlado, es útil para extraer y visualizar representaciones internas (por ejemplo, mediante análisis de activaciones) en experimentos de interpretabilidad.
- Pruebas de robustez: el barajado puede inducir comportamientos atípicos; el modelo puede usarse para probar la sensibilidad de los modelos de lenguaje a la permutación de datos.
- Educación y divulgación: como ejemplo de un modelo entrenado en un corpus infantil, puede usarse en cursos de NLP para ilustrar conceptos de entrenamiento y evaluación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de evaluación final de 3.0468, sin comparación con otros modelos. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M parámetros, la inferencia en FP32 requiere aproximadamente 0.5 GB de VRAM; en FP16, unos 0.25 GB. Cabe en cualquier GPU consumer moderna (incluso en CPU con suficiente RAM).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). Para entrenamiento, se usó una GPU con al menos 16 GB (dado el batch de 64), pero para inferencia es trivial.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), y TGI. Al ser un modelo estándar de transformers, se puede servir con cualquier framework que soporte GPT-2.
- Latencia y throughput: no se han medido oficialmente, pero en una GPU moderna (RTX 3090) la generación de tokens debería ser de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `linnotlinn/run2-babylm-shuffled-2345-gpt2-small` | 124M | no disponible | no disponible | Entrenado en BabyLM barajado |
| `linnotlinn/run2-babylm-original-2345-gpt2-small` | 124M | no disponible | no disponible | Entrenado en BabyLM original (sin barajar) |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Modelo base, entrenado en WebText |

No hay datos de rendimiento comparativo disponibles. La comparación se limita a características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse en un corpus infantil (BabyLM), el modelo puede reflejar sesgos presentes en los libros y textos dirigidos a niños, como estereotipos de género o culturales, aunque no se han documentado formalmente.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar texto plausible pero incorrecto, especialmente en temas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está confirmada, pero si es la estándar de GPT-2 (1024 tokens), las conversaciones largas o documentos extensos no serán manejados adecuadamente.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin consultar al autor. Se recomienda contactar con linnotlinn antes de cualquier uso productivo.
- Adecuación para producción: este modelo es claramente un artefacto de investigación, no diseñado para aplicaciones reales. Su rendimiento en tareas generales será pobre comparado con modelos modernos.
- Tamaño del repositorio: el repo ocupa 59.7 GB, inusualmente grande para un modelo de 124M; probablemente incluye archivos de entrenamiento o checkpoints adicionales, lo que puede dificultar su descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/linnotlinn/run2-babylm-shuffled-2345-gpt2-small
- Modelo original (sin barajar): https://huggingface.co/linnotlinn/run2-babylm-original-2345-gpt2-small
- Dataset barajado: https://huggingface.co/datasets/linnotlinn/babylm_gpt2_shuffled
- Página de BabyLM: https://babylm.github.io/
- Repositorio de referencia BabyLM: https://github.com/vishnup22/babylm
