# AraceliAmherdt/04-transformers-clasificacion-texto

## Resumen
Este repositorio contiene un clasificador de texto binario desarrollado por AraceliAmherdt como ejemplo pedagógico para el Seminario de Actualización del IFTS N.º 18. Se trata de un BERT diminuto entrenado desde cero con `BertForSequenceClassification`, que asigna a comentarios cortos sobre departamentos una de dos etiquetas: `positivo` o `negativo`. Su interés no reside en el rendimiento, sino en ilustrar de forma completa las piezas que se publican al compartir un modelo en Hugging Face: arquitectura, pesos, tokenizer y código de entrenamiento e inferencia.

El modelo emplea una arquitectura transformer encoder de solo 2 capas, 2 cabezas de atención y dimensión oculta de 32, con un total de 20.546 parámetros. El tokenizer es a nivel palabra (`WordLevel`) con un vocabulario de únicamente 37 tokens, lo que limita drásticamente su cobertura léxica. Fue entrenado sobre un dataset sintético de 368 comentarios generados a partir de 5 plantillas y 16 adjetivos (8 positivos y 8 negativos).

Es relevante como material didáctico para comprender el ciclo completo de publicación de un modelo en el Hub, la dependencia mutua entre modelo y tokenizer, y los riesgos de sobreajuste y confianza excesiva en modelos entrenados con datos sintéticos de baja variabilidad. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (`BertForSequenceClassification`), 2 capas, 2 cabezas de atención, dimensión oculta 32 |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer encoder de tipo BERT con una configuración mínima: 2 capas, 2 cabezas de atención y dimensión oculta de 32, sumando 20.546 parámetros. La cabeza de clasificación produce dos logits correspondientes a las etiquetas `negativo` (0) y `positivo` (1). El tokenizer es de tipo `WordLevel` con 37 tokens, normaliza a minúsculas y elimina tildes; cualquier palabra fuera del vocabulario se mapea a `[UNK]`.

El entrenamiento se realizó desde cero (sin preentrenamiento) sobre un dataset sintético de 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos). Se usaron 294 registros para entrenamiento y 74 para evaluación. La función de pérdida fue entropía cruzada, el optimizador AdamW con tasa de aprendizaje 0,001, durante 15 épocas con lotes de 16. No se aplicaron técnicas de RLHF ni DPO. El modelo se implementó con Hugging Face Transformers y PyTorch.

## Capacidades
- Clasificación binaria de texto corto en español: asigna `positivo` o `negativo` a comentarios sobre departamentos.
- Inferencia mediante `pipeline("text-classification")` de Transformers, compatible con Transformers 4 y 5.
- Publicación completa con artefactos de modelo, tokenizer y código (`train.py`, `predict.py`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe inexistente: solo español y con vocabulario de 37 palabras.

## Casos de uso
- Demostración didáctica en aula: sirve para mostrar el ciclo completo de entrenamiento, evaluación y publicación de un modelo en Hugging Face, incluyendo la relación entre `model.safetensors`, `config.json` y `tokenizer.json`.
- Ejemplo de pipeline de clasificación con Transformers: permite ilustrar el uso de `pipeline("text-classification")` en cuadernos de Colab con un modelo de tamaño despreciable (20.546 parámetros).
- Estudio de sobreajuste y confianza calibrada: el accuracy de 1,000 sobre test con las mismas plantillas que entrenamiento ejemplifica cómo un modelo puede acertar con seguridad alta sin generalizar.
- Análisis del impacto del vocabulario en NLP: el vocabulario de 37 tokens y el mapeo a `[UNK]` permiten experimentar con el efecto de la cobertura léxica en la calidad de las predicciones.
- Práctica de publicación en el Hub: el repositorio incluye todos los archivos necesarios para replicar el flujo de subida de un modelo con licencia MIT.
- Referencia para comparar con fine-tuning de modelos preentrenados: el propio autor sugiere usar este ejemplo como contraste frente a un fine-tuning real sobre un modelo preentrenado en español.

## Benchmarks y rendimiento
Los únicos datos disponibles en la información proporcionada son los de evaluación del propio autor:

| Metrica | Resultado |
|---|---|
| Accuracy (74 ejemplos de test) | 1,000 |

El autor advierte explícitamente que este resultado es optimista porque los comentarios de test usan las mismas plantillas y adjetivos que los de entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 20.546 parámetros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer, incluso modelos integrados o CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y también en CPU.
- Opciones de despliegue: `transformers` con PyTorch; el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints de Hugging Face. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares
No disponible. No se han proporcionado datos de modelos comparables en la información disponible. Como referencia cualitativa, cualquier modelo BERT preentrenado en español (p. ej., BETO o RoBERTa-BNE) tendría cientos de millones de parámetros y un vocabulario de decenas de miles de tokens, muy superior a los 20.546 parámetros y 37 tokens de este ejemplo, pero no se dispone de cifras concretas en la información facilitada.

## Limitaciones y advertencias
- Fines exclusivamente educativos; no apto para producción.
- Vocabulario de solo 37 palabras: cualquier término fuera de él se convierte en `[UNK]`, y el modelo responde igualmente con seguridad alta (el autor documenta el caso de "tiene una vista increíble" clasificado como `negativo` con score 1,00).
- No entiende negaciones ("no es luminoso") ni ironía, ya que no aparecen en los datos de entrenamiento.
- Accuracy de test de 1,000 no representativo: el dataset de evaluación comparte plantillas y adjetivos con el de entrenamiento.
- Sesgos conocidos: no documentados explícitamente, pero el dataset sintético de 5 plantillas y 16 adjetivos introduce un sesgo severo hacia esos patrones.
- Riesgo de alucinación/clasificación errónea con confianza alta ante entradas fuera de distribución.
- Licencia MIT: permite uso comercial, pero el modelo no es funcionalmente útil más allá de la demostración.
- Modelo y tokenizer son inseparables: publicar los pesos sin el tokenizer asociado inutiliza el modelo.

## Enlaces
- Hugging Face: https://huggingface.co/AraceliAmherdt/04-transformers-clasificacion-texto
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
