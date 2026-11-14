# Pbueno467/clasificador-comentarios-transformers

## Resumen

El modelo `Pbueno467/clasificador-comentarios-transformers` es un clasificador binario de texto en castellano desarrollado por Pbueno467 como ejemplo pedagógico para el Seminario de Actualización del IFTS N.º 18. Se trata de un BERT minúsculo entrenado desde cero, no de un fine-tuning de un modelo preentrenado, con el objetivo de ilustrar el flujo completo de publicación de un modelo en Hugging Face: arquitectura, pesos y tokenizer.

El modelo resuelve una tarea muy acotada: clasificar comentarios cortos sobre departamentos como `positivo` o `negativo`. Su relevancia no es de producción, sino didáctica: muestra qué archivos componen un modelo de Transformers y por qué el tokenizer debe acompañar siempre a los pesos. Con 20.546 parámetros y un vocabulario de 37 tokens, es probablemente uno de los BERT más pequeños publicados en el Hub.

Arquitectónicamente es un `BertForSequenceClassification` de 2 capas, 2 cabezas de atención y dimensión oculta 32. No dispone de contexto largo ni capacidades generativas: es un encoder de clasificación con un tokenizer a nivel de palabra (`WordLevel`) entrenado sobre un dataset sintético de 368 comentarios generados a partir de plantillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForSequenceClassification), transformer encoder |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokenizer WordLevel de 37 tokens; sin max_position_embeddings documentado) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | es (castellano) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 2 capas, 2 cabezas de atención, dimensión oculta 32 y aproximadamente 20.500 parámetros, configurado como `BertForSequenceClassification` con dos etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es de tipo `WordLevel` con 37 tokens, aplica minúsculas y elimina tildes. El modelo se entrenó desde cero, no mediante fine-tuning de un checkpoint preentrenado, lo cual es una decisión explícita del autor para fines didácticos.

Los datos de entrenamiento son completamente sintéticos: 368 comentarios generados en `train.py` a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos). Se usaron 294 ejemplos para entrenamiento y 74 para evaluación. El entrenamiento empleó entropía cruzada como función de pérdida, optimizador AdamW con tasa de aprendizaje 0,001, 15 épocas y lotes de 16, sobre Hugging Face Transformers con PyTorch. No se documenta RLHF, DPO, decodificación especulativa ni innovaciones técnicas adicionales.

## Capacidades

- Clasificación binaria de texto corto en castellano: asigna la etiqueta `positivo` o `negativo` a un comentario de entrada.
- Inferencia mediante `pipeline("text-classification")` de Transformers, con salida de etiqueta y puntuación de confianza.
- Compatibilidad con Transformers 4 y Transformers 5.
- Tokenización a nivel de palabra con normalización a minúsculas y eliminación de tildes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- Capacidad multilingüe limitada al castellano y, de hecho, limitada a las 37 palabras de su vocabulario.

## Casos de uso

- Demostración educativa de publicación de modelos: sirve para mostrar en clase o en un tutorial qué archivos (`config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`) componen un modelo de Transformers y cómo cargarlo con `pipeline`.
- Práctica de evaluación crítica de métricas: el accuracy de 1,000 sobre un test generado con las mismas plantillas que el entrenamiento es un caso ideal para explicar sobreajuste, fuga de datos y por qué una métrica alta no implica un modelo útil.
- Ejercicio de análisis de tokenizers: permite ilustrar el comportamiento de `[UNK]` cuando llega vocabulario fuera del vocabulario del tokenizer y cómo un modelo puede responder con alta confianza ante entradas que no comprende.
- Punto de partida para un fine-tuning real: el flujo de código (`train.py`, `predict.py`, `requirements.txt`) puede reutilizarse sustituyendo el BERT diminuto por un modelo preentrenado en español (por ejemplo, BETO o RoBERTa-BNE) y el dataset sintético por comentarios reales.
- Pruebas de integración de pipelines de clasificación: útil para validar que un entorno con Transformers, PyTorch y `text-embeddings-inference` funciona correctamente antes de desplegar un modelo real.
- Ejemplo de model card completa: la propia ficha del modelo, con secciones de datos, entrenamiento, evaluación y limitaciones, puede usarse como plantilla docente para que el alumnado documente sus propios modelos.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sintéticos de test |

El autor advierte explícitamente que este resultado es optimista: el conjunto de test emplea las mismas plantillas y adjetivos que el de entrenamiento, por lo que no mide generalización. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 20.546 parámetros en fp32 los pesos ocupan aproximadamente 80 KB, por lo que el modelo cabe en cualquier GPU, CPU o incluso en entornos de ejecución muy limitados.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de borde; también se ejecuta en Google Colab sin GPU.
- Opciones de despliegue: `transformers.pipeline`, y el tag `text-embeddings-inference` sugiere compatibilidad con el servidor TEI de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia debería ser de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Proposito |
|---|---|---|---|---|---|
| Pbueno467/clasificador-comentarios-transformers | 20.546 | no disponible | es | MIT | Ejemplo educativo de clasificación binaria |
| BETO (dccuchile/bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | es | MIT | Encoder preentrenado en español para fine-tuning |
| RoBERTa-BNE (PlanTL-GOB-ES/roberta-base-bne) | ~125 M | 512 tokens | es | Apache 2.0 | Encoder preentrenado en corpus BNE para fine-tuning |
| pysentimiento/robertuito-sentiment-analysis | ~110 M | 128 tokens | es | MIT | Análisis de sentimiento en español listo para uso |

La comparación es desigual por diseño: el modelo de Pbueno467 es dos órdenes de magnitud menor que los encoders preentrenados en español y no está pensado para producción. Para una tarea real de análisis de sentimiento en castellano, los tres modelos alternativos son opciones adecuadas; el modelo educativo sirve para entender el flujo, no para desplegar.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para uso en producción.
- Vocabulario de solo 37 palabras: cualquier palabra fuera del vocabulario se convierte en `[UNK]`, y el modelo responde igualmente con alta confianza (el autor documenta el caso de "tiene una vista increíble", clasificado como `negativo` con score 1.00).
- No entiende negaciones ("no es luminoso") ni ironía, porque no aparecen en los datos de entrenamiento.
- Dataset sintético generado por plantillas: el accuracy de test es optimista y no refleja generalización a texto real.
- Riesgo alto de alucinación en el sentido de clasificaciones erróneas con confianza alta ante entradas fuera de distribución.
- Sesgos: no documentados explícitamente, pero el vocabulario y las plantillas limitan el modelo a un dominio muy concreto (comentarios sobre departamentos).
- Licencia MIT: permite uso comercial, pero el autor desaconseja explícitamente su uso más allá del ámbito educativo.
- El modelo y el tokenizer son inseparables: publicar los pesos sin el tokenizer los hace inutilizables, ya que los índices de vocabulario no coincidirían.
- Para uso real, se recomienda hacer fine-tuning de un modelo preentrenado en español con comentarios reales.

## Enlaces

- Hugging Face: https://huggingface.co/Pbueno467/clasificador-comentarios-transformers
- Repositorio no disponible más allá del propio Hub; no se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
