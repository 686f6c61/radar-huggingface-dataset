# murilohonorato/classificador-citacao-vaga-ptbr

## Resumen

El modelo `classificador-citacao-vaga-ptbr` es un clasificador de texto binario desarrollado por `murilohonorato` para detectar referencias vagas a fuentes jurídicas en portugués brasileño. Se construyó como parte del desafío Caça-Alucinações de Jusbrasil × BRACIS 2026, donde este tipo de referencias se consideran "incompletas" porque mencionan una fuente sin proporcionar un identificador suficiente para verificarla. El modelo distingue entre frases como "verbete sumular aplicável à espécie" (cita vaga) y "precedentes aplicáveis à espécie" (prosa común).

La arquitectura se basa en un ajuste fino del modelo BERTimbau large (Luciano/bertimbau-large-lener_br), un transformer encoder-only de 334,4 millones de parámetros. El modelo se publica con pesos en formato safetensors y licencia MIT. No se especifica la longitud de contexto máxima, aunque el ejemplo de uso trunca las secuencias a 128 tokens.

El modelo es relevante porque aborda un problema real en el análisis de documentos legales: la identificación de citas vagas que las listas de sintagmas estáticos no pueden cubrir. Aunque el conjunto de entrenamiento es pequeño (218 ejemplos), los resultados de validación sugieren que la tarea es aprendible y que el modelo puede reconocer formulaciones nunca vistas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT) con cabeza de clasificación de secuencia |
| Parametros totales | 334.398.466 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt-BR) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de BERTimbau large, un transformer encoder-only preentrenado para portugués. Se añade una cabeza de clasificación de secuencia que produce dos logits (cita vaga frente a prosa común). El entrenamiento se realizó congelando todas las capas excepto las cuatro superiores y el clasificador, con una pérdida de entropía cruzada con pesos de clase para compensar el desbalance (24 positivos frente a 194 negativos). Se usó un optimizador AdamW con tasa de aprendizaje de 2e-5, lote de 8, 8 épocas y semilla 20260902.

Los datos de entrenamiento consisten en 218 ejemplos de piezas jurídicas sintéticas generadas por un único generador. No se aplicaron técnicas de RLHF ni DPO, ya que no es un modelo generativo. El autor destaca que una sonda lineal sobre las representaciones congeladas del modelo base ya separa las dos clases con un AUC de 0,985, lo que indica que la información necesaria está presente en las representaciones y que el ajuste fino simplemente la hace accesible.

## Capacidades

- Clasificación binaria de fragmentos de texto jurídico en portugués, distinguiendo referencias vagas a fuentes de prosa común.
- Requiere que el fragmento se pase con contexto alrededor (aproximadamente 60 caracteres por cada lado) para un rendimiento óptimo.
- No es un modelo generativo: no produce texto, solo devuelve una probabilidad de pertenencia a la clase "cita vaga".
- No soporta tool calling, function calling ni razonamiento multi-step.
- Capacidad monolingüe: solo portugués brasileño.
- Sin capacidades de visión ni audio.

## Casos de uso

- Detección de citas incompletas en sentencias: el modelo puede marcar párrafos que invocan fuentes jurídicas sin identificador, integrándose en un sistema de revisión documental para abogados.
- Control de calidad en bases de jurisprudencia: antes de indexar un documento, se ejecuta el clasificador para filtrar referencias vagas y evitar que se almacenen como citas verificables.
- Revisión automatizada de peticiones: en un pipeline de análisis de escritos forenses, el modelo identifica frases como "jurisprudência pacífica desta Corte" que necesitan completarse con el número del precedente.
- Apoyo a la redacción legal: integrado en un editor de texto, señala en tiempo real las menciones a fuentes que carecen de identificador, ayudando al redactor a añadir la referencia completa.
- Investigación sobre alucinaciones en modelos legales: el clasificador se usa para etiquetar automáticamente corpus de decisiones y detectar patrones de referencias ficticias o incompletas.
- Enriquecimiento de datos para otros modelos: las etiquetas generadas por este clasificador pueden servir para crear conjuntos de entrenamiento de sistemas de extracción de citas o de generación de referencias.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados de evaluación en la model card, basados en una validación que oculta sintagmas completos del entrenamiento:

| Métrica | Resultado |
|---|---|
| Sintagmas nunca vistos reconocidos | 21/24 (88%) |
| Confianza media en sintagmas nunca vistos | 0,78 |
| Validación por documento (AUC) | 0,977 |
| Average Precision (AP) | 0,837 |

No se han publicado comparativas con otros modelos en la información disponible. El autor señala que una lista literal de sintagmas conocidos obtendría un 0% en los mismos casos.

## Requisitos de hardware

- El modelo tiene 334,4 millones de parámetros, lo que supone aproximadamente 1,34 GB en fp32, 0,67 GB en fp16 y 0,33 GB en cuantización de 8 bits.
- Para inferencia con transformers y secuencias cortas (128 tokens), una GPU con 4 GB de VRAM es suficiente. También puede ejecutarse en CPU con 4 GB de RAM libre.
- GPU recomendadas: RTX 2060 (6 GB), RTX 3060 (12 GB) o superiores. En CPU, cualquier procesador moderno es válido para un uso puntual.
- Opciones de despliegue: Transformers (Python), ONNX Runtime, TorchServe. No se han documentado despliegues con vLLM, llama.cpp ni Ollama, ya que no es un modelo de tipo LLM generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado benchmarks comparativos publicados para este modelo en la información disponible. El modelo base es BERTimbau large (Luciano/bertimbau-large-lener_br), que se utilizó sin ajuste fino como punto de partida. La siguiente tabla compara las características técnicas entre el clasificador y su modelo base:

| Modelo | Parámetros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| classificador-citacao-vaga-ptbr | 334.398.466 | BERT large fine-tuned | no disponible | MIT |
| Luciano/bertimbau-large-lener_br | 334.398.466 (aproximadamente) | BERT large | no disponible | MIT |

No se dispone de datos de rendimiento para otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento contiene solo 24 ejemplos positivos, por lo que la barra de error en torno a los resultados (88% en sintagmas nuevos) es amplia.
- El modelo fue entrenado con piezas jurídicas sintéticas de un único generador y no ha sido validado en documentos judiciales reales, lo que puede afectar a su rendimiento en producción.
- Espera que el fragmento se proporcione con contexto alrededor; si se usa aislado, su rendimiento es inferior.
- Es un clasificador de fragmentos, no un detector: requiere un sistema previo que genere candidatos a cita vaga.
- No reconoce citas con identificador (por ejemplo, "REsp 1.234.567/SP"), que son un problema distinto y deben resolverse con búsqueda en bases de referencias.
- No se han documentado sesgos específicos, pero el desbalance de clases y el origen sintético de los datos pueden introducir sesgos no evaluados.
- El umbral recomendado de 0,90 es deliberadamente alto para actuar como red de seguridad tras una lista literal; esto puede reducir la sensibilidad si se usa como único detector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/murilohonorato/classificador-citacao-vaga-ptbr
- Modelo base: https://huggingface.co/Luciano/bertimbau-large-lener_br
