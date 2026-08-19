# AlinaGonch/granite41-8b-squad-ratio-0.10-seed-42

## Resumen

El modelo `AlinaGonch/granite41-8b-squad-ratio-0.10-seed-42` es un fine-tuning experimental del modelo base Granite 4.1 8B de IBM, creado por Alina Hancharova como parte de un estudio sobre la proporción óptima de muestras sin respuesta en el conjunto de datos SQuAD 2.0. El nombre del repositorio indica que se ha ajustado con una proporción de 0.10 de preguntas sin respuesta y una semilla aleatoria de 42. Este experimento busca determinar cómo afecta la cantidad de ejemplos no respondibles al rendimiento del modelo en tareas de pregunta-respuesta extractiva.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers. Al tratarse de un fine-tuning, hereda la arquitectura del modelo base, un transformer denso decoder-only de 8.000 millones de parámetros, aunque no se proporcionan detalles específicos sobre el proceso de entrenamiento en la model card. Su relevancia radica en que forma parte de una investigación empírica sobre el equilibrio entre preguntas respondibles y no respondibles, un aspecto crítico en sistemas de QA robustos.

Actualmente el repositorio no presenta descargas ni valoraciones, y la model card es una plantilla genérica sin información técnica detallada. Toda la información disponible se limita al nombre, los tags y el contexto del experimento mencionado en el perfil de la autora en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en Granite 4.1 8B, transformer denso decoder-only) |
| Parametros totales | no disponible (el modelo base tiene 8.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 131.072 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta 12 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información específica sobre la arquitectura del modelo fine-tuned. Por el nombre del repositorio y el contexto del experimento, se infiere que se trata de un ajuste fino del modelo Granite 4.1 8B, un transformer denso decoder-only con 8.000 millones de parámetros y una ventana de contexto de 131.072 tokens. El proceso de entrenamiento consiste en fine-tuning sobre el dataset SQuAD 2.0, que incluye preguntas con y sin respuesta, utilizando una proporción de 0.10 de muestras sin respuesta y una semilla fija de 42. No se dispone de detalles sobre hiperparámetros, número de épocas, técnica de optimización o si se aplicaron métodos de alineación como RLHF o DPO. La model card no aporta ninguna información al respecto.

## Capacidades

- No se han documentado capacidades específicas para este fine-tuning.
- Dado que se basa en Granite 4.1 8B, es esperable que herede capacidades generales de generación de texto, razonamiento, código, matemáticas y soporte multilingüe, así como tool calling y RAG, pero no hay confirmación oficial.
- El propósito del experimento es evaluar el rendimiento en tareas de pregunta-respuesta extractiva sobre SQuAD 2.0, por lo que la capacidad principal esperada es la de responder preguntas y detectar preguntas sin respuesta válida.

## Casos de uso

- Investigación académica sobre el equilibrio de muestras no respondibles en datasets de QA: el modelo sirve como punto de comparación para estudiar cómo la proporción de preguntas sin respuesta afecta al rendimiento final.
- Desarrollo de sistemas de pregunta-respuesta robustos: al estar entrenado con una proporción controlada de muestras sin respuesta, puede utilizarse para analizar la capacidad del modelo de abstenerse cuando no hay respuesta correcta.
- Benchmarking de fine-tuning en tareas extractivas: permite comparar estrategias de muestreo y regularización en modelos de 8B.
- Evaluación de la influencia de la semilla aleatoria en el entrenamiento: al existir variantes con diferentes semillas, se puede estudiar la estabilidad del proceso.
- Pruebas de transferencia a otros datasets de QA: aunque no está documentado, el modelo podría evaluarse en otros conjuntos para medir su generalización.
- Análisis de sesgos en modelos de lenguaje para tareas de lectura comprensiva: el experimento puede revelar cómo el modelo maneja la incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, EM, MMLU o HumanEval para este modelo específico. El único dato contextual es que el experimento se enmarca en el estudio de SQuAD 2.0, pero no hay cifras concretas.

## Requisitos de hardware

- Dado que el modelo base tiene 8.000 millones de parámetros, se estima que la inferencia requiere al menos 16 GB de VRAM en precisión fp16, y unos 8 GB con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para despliegues a gran escala.
- Es posible ejecutarlo en GPUs de consumo como RTX 3080 (10 GB) con cuantización de 4 bits, aunque con limitaciones de velocidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers.
- No se dispone de datos de latencia o throughput para este fine-tuning concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos. El modelo es un fine-tuning experimental sin datos de rendimiento publicados. Como referencia, el modelo base Granite 4.1 8B se puede comparar con otros modelos de 8B como Llama 3.1 8B o Mistral 7B, pero no hay métricas de este fine-tuning para establecer una comparación válida.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas.
- Al ser un modelo experimental sin documentación, no se recomienda su uso en producción sin una evaluación exhaustiva.
- El tamaño del repositorio (0.2 GB) sugiere que solo contiene los pesos del fine-tuning, no el modelo completo, por lo que para su uso sería necesario cargar el modelo base y aplicar los pesos, o bien el repositorio podría ser incompleto.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial.
- No hay garantías sobre el rendimiento en tareas fuera del dominio de SQuAD 2.0.
- La ausencia de benchmarks y de detalles de entrenamiento dificulta la reproducibilidad y la evaluación objetiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.10-seed-42
- Perfil de la autora: https://huggingface.co/AlinaGonch
- Referencia al modelo base Granite 4.1 8B: https://www.ibm.com/granite/docs/models/granite4-1
- Información adicional sobre Granite 4.1 8B: https://www.openmodels.run/models/granite-4-1-8b
