# abd87/bert-roman-urdu-sentiment

## Resumen

BERT Roman Urdu Sentiment es un modelo de clasificación de texto derivado de `google-bert/bert-base-multilingual-cased` mediante fine-tuning supervisado para análisis de sentimiento en tres clases (negativo, neutro, positivo) sobre texto en roman urdu, la variante del urdu escrita con alfabeto latino. Lo desarrolla el usuario abd87 y se publica con licencia MIT, lo que permite uso comercial sin restricciones adicionales. El modelo resuelve un problema concreto: la mayoría de herramientas de PLN para urdu asumen escritura en alfabeto persa-arábigo, mientras que una parte muy significativa de la comunicación digital en urdu (redes sociales, mensajería, foros) se produce en roman urdu, sin ortografía estandarizada.

Arquitecturalmente es un transformer encoder BERT-base de 12 capas, con 177.855.747 parámetros totales y una ventana de contexto de 512 tokens (aunque el fine-tuning se realizó con longitud máxima de 128). El modelo se entrenó sobre el dataset `community-datasets/roman_urdu` con 20.229 frases y una partición 80/10/10, durante 3 épocas con learning rate 3e-5 y batch size 32.

Su relevancia actual es acotada pero clara: es un modelo pequeño (0,7 GB de repositorio), desplegable en CPU o en GPU de consumo, que ofrece una línea base funcional para sentimiento en roman urdu con métricas honestas publicadas (accuracy 0,644, macro-F1 0,632). No compite con LLMs generativos, pero cubre un nicho lingüístico poco atendido con un coste de inferencia mínimo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas) |
| Parámetros totales | 177.855.747 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entrenado con max_length=128) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; admite cuantización dinámica estándar de PyTorch) |
| Idiomas soportados | ur (roman urdu; el modelo base es multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un transformer encoder con atención bidireccional completa, vocabulario multilingüe case-sensitive y 177,9 millones de parámetros. Sobre esa base se añadió una cabeza de clasificación de secuencias con tres etiquetas de salida (negativo, neutro, positivo) y se realizó fine-tuning supervisado con entropía cruzada. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación adicional; se trata de un ajuste supervisado clásico.

Los datos de entrenamiento provienen del dataset `community-datasets/roman_urdu`, con 20.229 frases divididas en 80/10/10 (entrenamiento/validación/test). La configuración reportada es de 3 épocas, learning rate 3e-5, batch size 32 y longitud máxima de secuencia de 128 tokens. No se especifica en la model card la composición exacta del dataset, el balance de clases ni si hubo aumento de datos para compensar variantes ortográficas. La innovación técnica es mínima por diseño: se trata de un fine-tuning estándar de un encoder preentrenado, sin decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto en roman urdu.
- Procesamiento de frases y párrafos cortos, con truncamiento a 128 tokens en la configuración de entrenamiento (el encoder soporta hasta 512).
- Manejo de texto con ortografía no estandarizada, siempre con las limitaciones descritas por el autor.
- Inferencia ligera en CPU y GPU de consumo gracias a su tamaño reducido.
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al conocimiento residual del modelo base; el fine-tuning es específico de roman urdu.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar publicaciones y comentarios en roman urdu extraídos de plataformas como X o Facebook, permitiendo monitorizar la percepción de una marca o de un evento con un coste de inferencia muy bajo (un encoder de 178M de parámetros procesa lotes grandes en CPU).
- Moderación de comunidades en línea: integrado en un pipeline de preprocesado, permite priorizar mensajes negativos para revisión humana en foros y grupos donde el roman urdu es la norma de escritura.
- Investigación sociolingüística: cuantificar la polaridad de corpus en roman urdu recogidos para estudios de opinión, con la ventaja de que las métricas publicadas (accuracy 0,644, macro-F1 0,632) permiten calibrar expectativas frente a anotación humana.
- Enrutado de tickets de soporte: clasificar la carga emocional de mensajes de clientes escritos en roman urdu para dirigirlos a colas prioritarias o a agentes especializados, usando la clase neutra como caso por defecto.
- Análisis de reseñas de producto: procesar reseñas en roman urdu de marketplaces regionales para agregar sentimiento por producto, aceptando el sesgo hacia la clase neutra documentado por el autor.
- Línea base para modelos mayores: servir como referencia de rendimiento en experimentos que evalúen LLMs multilingües o modelos específicos de urdu, dado que sus métricas están publicadas de forma explícita y reproducible.
- Filtrado previo en pipelines de datos: descartar o etiquetar contenido negativo antes de pasarlo a un modelo generativo más costoso, reduciendo el volumen de texto que llega a etapas caras del pipeline.

## Benchmarks y rendimiento

| Métrica | Valor (test set) |
|---|---|
| Accuracy | 0,644 |
| Macro-F1 | 0,632 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos sobre el mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB (177,9M de parámetros × 4 bytes), más overhead de activaciones y del tokenizador.
- VRAM estimada con cuantización dinámica int8: en torno a 0,2-0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, etc.) y en CPU; la inferencia en CPU es viable para lotes moderados.
- Opciones de despliegue: Hugging Face `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI con `transformers`, ONNX Runtime y TGI (aunque TGI está orientado a modelos generativos; para clasificación es más directo usar `transformers` o un servidor propio).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abd87/bert-roman-urdu-sentiment | 177,9M | 512 (entrenado a 128) | Sentimiento 3 clases en roman urdu | MIT | Hugging Face |
| google-bert/bert-base-multilingual-cased | 177,9M | 512 | Modelo base multilingüe (sin cabeza de sentimiento) | Apache 2.0 | Hugging Face |
| Modelos de sentimiento en urdu estándar (escritura persa-arábiga) | no disponible | no disponible | Sentimiento en urdu estándar | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El roman urdu carece de ortografía estandarizada; las variantes de escritura y la jerga pueden clasificarse erróneamente, tal como advierte el autor.
- El modelo está sesgado hacia la clase neutra, lo que puede infrarepresentar sentimientos positivos y negativos en producción.
- Accuracy de 0,644 y macro-F1 de 0,632 indican un rendimiento moderado; no es adecuado para decisiones automatizadas de alto riesgo sin revisión humana.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas con alta confianza.
- El fine-tuning se realizó con max_length=128; secuencias más largas se truncan, lo que puede perder información relevante en textos extensos.
- El modelo está especializado en roman urdu; su rendimiento en urdu estándar (escritura persa-arábiga) no está documentado y probablemente sea inferior.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones adicionales, pero conviene conservar el aviso de copyright.
- El dataset de entrenamiento (20.229 frases) es pequeño para la variabilidad del roman urdu; el modelo puede generalizar mal a dominios distintos del corpus original.
- No se documentan sesgos demográficos específicos, pero al derivar de un BERT multilingüe puede heredar sesgos del preentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abd87/bert-roman-urdu-sentiment
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/community-datasets/roman_urdu
