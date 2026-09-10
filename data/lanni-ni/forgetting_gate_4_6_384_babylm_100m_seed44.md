# Lanni-ni/forgetting_gate_4_6_384_babylm_100m_seed44

## Resumen

Este modelo es un checkpoint de investigación creado por el usuario Lanni-ni, con identificador `Lanni-ni/forgetting_gate_4_6_384_babylm_100m_seed44`. Se trata de un modelo de generación de texto que implementa una arquitectura de la familia "Forgetting Transformer" (transformador con puerta de olvido), según indica la etiqueta `forgetting_transformer` en su ficha de HuggingFace. El modelo se incluye dentro del proyecto BabyLM, con un tamaño de 45.703.320 parámetros (unos 45,7 millones) y pesos en formato `safetensors` con un peso de repositorio de 0,2 GB. El nombre sugiere una configuración de 4 capas, 6 cabezas y tamaño de ocultación 384, con semilla de entrenamiento 44, pero no hay documentación técnica que lo confirme.

A día de hoy, este modelo es un experimento de arquitectura con muy baja difusión (0 descargas y 0 likes). Su relevancia es principalmente investigadora: ofrece una variante de transformador con un mecanismo de olvido que puede estudiarse comparativamente frente a modelos estándar del mismo tamaño. La model card está autogenerada y no contiene información sobre datos de entrenamiento, licencia, contexto, idiomas ni rendimiento, por lo que se debe tratar como un prototipo no validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Forgetting Transformer (transformador con puerta de olvido, con código personalizado; requiere `trust_remote_code=True`) |
| Parametros totales | 45.703.320 (45,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (0,2 GB) |

## Arquitectura y entrenamiento

La información disponible no incluye una descripción oficial de la arquitectura. La única pista fiable es la etiqueta `forgetting_transformer` en la ficha, que apunta a un transformador con una puerta de olvido (forgetting gate) integrada en el mecanismo de atención. Este tipo de diseño se caracteriza por modificar la forma en que el modelo pondera o descarta información pasada, lo que suele ser de interés para tareas de contexto largo, memoria selectiva o aprendizaje continuo. El nombre del repositorio también sugiere una configuración con 4 capas, 6 cabezas de atención y una dimensión oculta de 384, pero no se ha podido confirmar.

Sobre el entrenamiento, no hay datos públicos. La mención a `babylm_100m` y `seed44` indica que probablemente se usó una fracción del corpus BabyLM (entorno a 100 millones de palabras) con una semilla concreta. Al no publicarse detalles del dataset, del proceso de preentrenamiento ni de ningún postentrenamiento (RLHF, DPO, etc.), no se puede afirmar nada más. El código del modelo es personalizado, por lo que la arquitectura no está integrada de forma nativa en la biblioteca Transformers y debe cargarse con `trust_remote_code=True`.

## Capacidades

- Generación de texto: es el único uso confirmado por el `pipeline` de la ficha (`text-generation`).
- No se han publicado descripciones sobre tool calling, function calling, razonamiento multi-paso, visión, audio ni soporte de agentes.
- No hay información sobre capacidades multilingües ni sobre idiomas concretos en los que funcione.
- El tamaño reducido (45,7 M de parámetros) permite experimentación en hardware modesto, pero limita la complejidad de las tareas que puede resolver.
- No se han publicado evaluaciones de habilidades específicas, por lo que cualquier afirmación sobre capacidades concretas excede la información disponible.

## Casos de uso

- Investigación de arquitecturas de atención: el modelo permite comparar empíricamente el comportamiento de una atención con puerta de olvido frente a un transformador estándar del mismo tamaño, usando el mismo corpus y las mismas condiciones de evaluación.
- Ablación de hiperparámetros: al tratarse de un modelo pequeño, se puede utilizar para estudiar cómo varía el rendimiento al modificar el número de capas, cabezas o la dimensión oculta, tomando como referencia la configuración sugerida por el nombre.
- Evaluación de mecanismos de olvido en aprendizaje continuo: la puerta de olvido puede analizarse como mecanismo para mitigar el olvido catastrófico, midiendo su comportamiento en secuencias de tareas o en entornos con distribución cambiante.
- Análisis de interpretabilidad: los mapas de atención y los valores de la puerta de olvido pueden visualizarse para investigar cómo se retiene o elimina información token a token, útil para entender decisiones del modelo en tareas sintéticas de memoria.
- Pruebas de compatibilidad con el ecosistema Transformers: sirve como caso de uso para verificar el flujo de carga de modelos con `custom_code`, `trust_remote_code` y pesos `safetensors`, lo que puede interesar a equipos que mantienen infraestructuras de inferencia.
- Docencia y experimentación en cursos de aprendizaje profundo: por su tamaño (0,2 GB), permite ejecutar experimentos de generación de texto en CPU o en GPU modesta con coste mínimo, siendo adecuado para prácticas sobre mecanismos de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en ningún otro conjunto de evaluación, por lo que cualquier comparación numérica sería inventada.

## Requisitos de hardware

- Los pesos en FP32 ocupan aproximadamente 183 MB (45.703.320 parámetros × 4 bytes). En FP16 o BF16 ocuparían unos 92 MB.
- Si se aplicara una cuantización de 4 bits (no disponible como checkpoint oficial), los pesos ocuparían alrededor de 23 MB.
- Cabe en cualquier GPU con más de 1 GB de VRAM: por ejemplo, una RTX 3060, una RTX 4090 o una T4 resultan más que suficientes.
- También puede ejecutarse en CPU, ya que el conjunto de pesos es inferior a 200 MB; se recomienda un mínimo de 1 GB de RAM disponible.
- Despliegue: la carga requiere `transformers` y `trust_remote_code=True`. No se ha confirmado compatibilidad con vLLM, llama.cpp, TGI ni Ollama. El modelo no está disponible en formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de inferencia.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables en la información proporcionada. Por el nombre, podría compararse con un transformador estándar de BabyLM 100M, pero no se han encontrado resultados, pesos ni benchmarks que permitan establecer una comparativa técnica. Tampoco se dispone de licencia ni de disponibilidad de otros modelos de la misma categoría.

## Limitaciones y advertencias

- La model card está generada automáticamente y no contiene información sobre sesgos, riesgos ni limitaciones; no se puede saber qué sesgos ha aprendido el modelo.
- No hay datos de entrenamiento publicados; el modelo puede haber heredado sesgos del corpus BabyLM sin que se haya documentado ni mitigado.
- No existen benchmarks que respalden su rendimiento; el riesgo de alucinación no ha sido evaluado.
- No se ha declarado licencia, por lo que no se pueden asumir derechos de uso comercial.
- El código del modelo es personalizado y requiere `trust_remote_code=True`, lo que implica ejecutar un código no auditado al cargar el modelo; esto supone un riesgo de seguridad en entornos de producción.
- No se ha confirmado el soporte en español ni en otros idiomas; la calidad en cualquier idioma es incierta.
- No hay checkpoints cuantizados ni compatibilidad con el ecosistema llama.cpp; la integración en pipelines existentes requeriría trabajo adicional.
- No es recomendable su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Lanni-ni/forgetting_gate_4_6_384_babylm_100m_seed44
- No se ha encontrado repositorio de código, demo ni paper específico del modelo.
- La etiqueta `arxiv:1910.09700` aparece en la ficha, pero corresponde al artículo de Lacoste et al. sobre la calculadora de impacto medioambiental, no a un paper que describa este modelo.
